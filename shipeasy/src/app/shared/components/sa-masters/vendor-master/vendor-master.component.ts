import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'

import { ApiSharedService } from '../../api-service/api-shared.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { environment } from 'src/environments/environment';
import { partymasterDetail } from './data';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { CommonService } from 'src/app/services/common/common.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { Country, State } from 'src/app/models/state-master';
import { Location, PartyMaster } from 'src/app/models/vendor-master';
import { MastersSortPipe } from 'src/app/shared/util/mastersort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
@Component({
  selector: 'app-vendor-master',
  templateUrl: './vendor-master.component.html',
  styleUrls: ['./vendor-master.component.scss']
})
export class VendorMasterComponent implements OnInit {
  _gc=GlobalConstants;
  vendorForm: FormGroup;
  stateData: State[] = [];

  countryList: Country[]=[];
  stateList: State[];
  callingCodeList:Country [];
  filterBody = this.apiService.body;
  submitted: boolean = false;
  fasList:   [];
  sacList: [];
  smartAgentDetail: partymasterDetail = new partymasterDetail();
  isUpdate: any = false;
  smartAgentList: PartyMaster[] = [];

  fromSize: number = 1;
  toalLength: number;
  size = 10;
  page = 1;
  count = 0;
  partyID: string = '';
  pan_no: string;
  gst_no: string;
  Vendor_Name: string;
  Adddress: string;
  FA_code: string;
  state: string;
  show: string;
  locationList: Location[] = [];
  rcmCategoryList: string[] = [
    'Registered',
    'Unregistered',
    'RCM Category Others',
    'RCM Category Specified',
    'Exempted',
    'Composite',
    'Zero Rated'
];
  stateList1: State[] = [];
  surveyRadio: boolean = false;
  vendor: boolean = true;
  tenantId: string;
  yardcfs:any
  email:any
  isBatchPanelOpen: boolean = false;
  isGstPanelOpen : boolean = false
  canOpenBatchAccordion: boolean = true;
  dataSource = new MatTableDataSource<any>();
  displayedColumns = ['#','action','name','address','gstNo','panNo','stateName'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort1!: MatSort;

  constructor(
    public modalService: NgbModal,
    private fb: FormBuilder,
    private saMasterService: SaMasterService,
    private apiService: ApiSharedService,private commonfunction: CommonFunctions,
    private notification: NzNotificationService,private cognito : CognitoService,
    private sortPipelist: MastersSortPipe,
    private CommonService : CommonService,
    public loaderService: LoaderService,
  ) {
    this.formBuild()
  }
  toggleButton(panel: string){
    switch (panel) {
     
      case 'batch':
        if (this.canOpenBatchAccordion) {
          this.isBatchPanelOpen = !this.isBatchPanelOpen;
        }
        case 'GST':
        if (this.canOpenBatchAccordion) {
          this.isGstPanelOpen = !this.isGstPanelOpen;
        }
        break;
      default:
        console.error('Unknown panel:', panel);
    }
  }
  formBuild(data?) {
    this.vendorForm = this.fb.group({
      survey: [data ? data?.survey : ''],
      Vendor_Name: [data ? data?.name : '', [Validators.required!]],
      Survey_Name: [data ? data?.name : ''],
      Pan_No: [data ? data?.panNo : '', [Validators.required]],
      gst_No: [data ? data?.gstNo : ''],
      FA_code: [data ? data?.fasCode : ''],
      Adddress: [data ? data?.addressInfo?.address : ''],
      country: [data ? data?.addressInfo?.countryId : ''],
      state: [data ? data?.addressInfo?.stateId : ''],
      primaryCountryCode: [data ? data?.primaryNo.primaryCountryCode : ''],
      primaryAreaCode: [0],
      primaryNo: [data ? data?.primaryNo.primaryNo : '', [Validators.required]],
      primaryEmailId: [data ? data?.primaryMailId : '', [Validators.required, Validators.pattern(environment.validate.email)]],
      OP_Users: [data ? data?.operationUser : ''],
      MLO_ID: [data ? data?.mloId : ''],
      Credit_days: [data ? data?.creditDays : ''],
      IS_Shipping_Line: [data ? data?.isShippingLine : 'true'],
      SAC_Code: [data ? data?.sacCode : ''],
      accountCode: [data ? data?.accountCode : '', [Validators.required]],
      portName: [data ? data?.portName : ''],
      defaultSurveyor: [data ? data?.defaultSurveyor : ''],
      remark: [data ? data?.remark : ''],

      tdsDetails: this.fb.array([]),
      gstDetails: this.fb.array([]),
    });
    if (data?.tdsDetails?.length > 0) {
      data?.tdsDetails?.forEach(e => {
        this.tdsDetails?.push(this.addTds(e))
      })
    }
    if (data?.gstDetails?.length > 0) {
      data?.gstDetails?.forEach(e => {
        this.gstDetails?.push(this.addGst(e))
      })
    }
    if (this.isUpdate)
      this.getStateList()
  }
  ngOnInit(): void {
    this.getLocationDropDowns()
    this.getPartyList()
    this.getCountryList()
    this.getGSTStateList1();
    // this.vprouduct()
    this.getPortMaster(); this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.tenantId = resp.tenantId
      }
    }) 
  }


  vprouduct() {
    let payload = this.CommonService.filterList()
    payload.query = { "isSupplier": true}
    payload.sort = {
      "desc" : ["updatedOn"]
   }

   let mustArray = {};
   mustArray['isSupplier'] =true
   payload.query = mustArray
   this.CommonService.getSTList('partymaster', payload).subscribe((res:any) => {
      if (res && res.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1,
          name: s.name,
          address: s.address,
          gstNo: s.gstNo,
          panNo:s.panNo,
          stateName:s.stateName
        }));
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1; 
      } else {
      }
    }, (error: any) => { 
    });
  }

  exportAsExcelFile1(): void {
    let storeEnquiryData = [];
    this.email.map((row: any) => {
      storeEnquiryData.push({
        'name' : row?.element?.name,
        'address' : row?.element?.address,
        'gstNo' : row?.element?.gstNo,
        'panNo':row?.element?.panNo,
        'stateName':row?.element?.stateName
      });
    }
    );
    const myworksheet: XLSX.WorkSheet =
      XLSX.utils.json_to_sheet(storeEnquiryData);
    const myworkbook: XLSX.WorkBook = {
      Sheets: { data: myworksheet },
      SheetNames: ['data'],
    };
    const excelBuffer: any = XLSX.write(myworkbook, {
      bookType: 'xlsx',
      type: 'array',
    });
  
    const fileName = '.xlsx';
    XLSX.writeFile(myworkbook, fileName);
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
  
  
    this.dataSource.filterPredicate = (data, filter) => {
      return JSON.stringify(data).toLowerCase().includes(filter);
    };
  
    this.dataSource.filter = filterValue;
  }


  displayedColumns1 = this.displayedColumns.map((x, i) => x + '_' + i);
  toggleFilters = true;
  filtersModel = [];
  filterKeys = {};
  searchColumns() {
    this.filterKeys = {};
    this.filtersModel.forEach((each, ind) => {
      if (each)
        this.filterKeys[this.displayedColumns[ind]] = {
          "$regex": each,
          "$options": "i"
        }
    });
    
    let payload = this.CommonService.filterList()
    payload.query = this.filterKeys
    payload.sort = {
      "desc": ["updatedOn"]
    }
    this.CommonService.getSTList('partymaster', payload).subscribe((data) => {
      this.yardcfs = data.documents;
      this.dataSource = new MatTableDataSource(
        data?.documents?.map((s: any,index) => {
          return{
            ...s,
            id:index+1
          }
        })
      );
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort1;

    });


  }

  clearFilters() {
    this.filtersModel = [];
    this.filterKeys = {};
    this. getPartyList()
  }
  sortList(array , key){
    return this.sortPipelist.transform(array, key);
   }
  getPartyList() {
    this.loaderService.showcircle();
    let payload = this.CommonService.filterList()
    payload.query = { "isSupplier": true}
  //   if(payload?.size)payload.size = Number(this.size);
  //  if(payload?.from)payload.from = this.page - 1;
    this.CommonService.getSTList('partymaster', payload).subscribe((data) => {
      this.smartAgentList = data.documents?.map(partymaster=>{ return {
        ...partymaster,
        address:partymaster?.addressInfo?.address,
        stateName:partymaster?.addressInfo?.stateName
      }});
      this.toalLength = data.totalCount;
      this.count = data.documents.length;
      if (data && data?.documents) {
        this.dataSource.data = data.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1,
          name: s.name,
          address: s.address,
          gstNo: s.gstNo,
          panNo:s.panNo,
          stateName:s.stateName
          
        }));
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1; 
        this.loaderService.hidecircle();
      }
    },()=>{
      this.loaderService.hidecircle();
    });
  }

  portDataValue: any = []
  getPortMaster() {
    let payload = this.CommonService.filterList()
    payload.query = {"status": true}
    this.CommonService.getSTList('port', payload).subscribe((res: any) => {
      this.portDataValue = res?.documents;

    });
  }
  getLocationDropDowns() {
    let payload = this.CommonService.filterList()
    payload.query = {"status": true,
      masterType:   {
        "$in": ['YARD','CFS','ICD']
      },
    }
    this.CommonService.getSTList('location', payload).subscribe((res: any) => {

      this.locationList = res?.documents;
    });
  }
  getCountryList() {
    let payload = this.CommonService.filterList()
    payload.query = {"status": true}
    this.CommonService.getSTList('country', payload).subscribe((data) => {
      this.countryList = data.documents;
    });
  }

  getStateList() {
    this.stateList = [];
    let countryData = this.countryList?.filter(
      (x) => x.countryId === this.vendorForm.get('country').value
    );
    this.callingCodeList = countryData;
    this.vendorForm.controls.primaryCountryCode.setValue(countryData[0]?.callingCode)

    let payload = this.CommonService.filterList()
    payload.query = { countryId: this.vendorForm.get('country').value,"status": true}
    this.CommonService.getSTList('state', payload).subscribe((data) => {
      this.stateList = data.documents;
    });
  }

  getGSTStateList1() {
    this.stateList = [];
    let payload = this.CommonService.filterList()
    payload.query = {"status": true}
    this.CommonService.getSTList('state', payload).subscribe((data) => {
      this.stateList1 = data.documents;
    });
  }
  get f() {
    return this.vendorForm.controls;
  }

  getSurveyform(ev){
    console.log(ev.target.checked);
    if(ev.target.checked){
      this.surveyRadio = true;
      this.vendor = false;
      this.vendorForm.get('Vendor_Name').clearValidators();
      this.vendorForm.get('Vendor_Name').updateValueAndValidity();
    }
    else{
      this.surveyRadio = false;
      this.vendor = true;
      this.vendorForm.get('Vendor_Name').setValidators(Validators.required);
      this.vendorForm.get('Vendor_Name').updateValueAndValidity();
    }
  
  }


  onSave() {
    this.submitted = true
    if (this.vendorForm.valid) {
      this.createModel();
      let createBody = [];
      createBody.push(this.smartAgentDetail);
      if (this.isUpdate) {
        this.CommonService.UpdateToST(`partymaster/${createBody[0].partymasterId}`, createBody[0]).subscribe((data: any) => {
          if (data) {
            this.notification.create(
              'success',
              'Updated Successfully',
              ''
            );
            this.clear();
            this.submitted = false;
          }
        },
        (error) => {
          this.notification.create('error', error?.error?.error?.message , '');
        });
      }
      else {
        this.CommonService.addToST('partymaster', createBody[0]).subscribe((data: any) => {
          if (data) {
            this.notification.create(
              'success',
              'Added Successfully',
              ''
            );
            this.clear();
            this.submitted = false;
          }
        },
        (error) => {
          this.notification.create('error', error?.error?.error?.message , '');
        });
      }

    }
  }

  clear() {
    this.modalService.dismissAll();
    this.isUpdate = false;
    this.pan_no = "";
    this.gst_no = "";
    this.Vendor_Name = "";
    this.Adddress = "";
    this.state = "";
    this.submitted = false;
    this.getPartyList();
    this.formBuild();
    this.surveyRadio = false;
    this.vendor = true;
  }
  createModel() {
    let countryData = this.countryList.filter(x => x?.countryId === this.vendorForm.get('country').value);
    let stateData = this.stateList.filter(x => x?.stateId === this.vendorForm.get('state').value);
    this.smartAgentDetail.partymasterId = this.partyID ?? "";
    this.smartAgentDetail.tenantId =  this.tenantId;
    this.smartAgentDetail.customerType = [{ "item_id": "", "item_text": 'Vendor' }];
    this.smartAgentDetail.addressInfo.address = this.vendorForm?.get('Adddress').value;
    this.smartAgentDetail.addressInfo.countryId = countryData[0]?.countryId;
    this.smartAgentDetail.addressInfo.countryISOCode = this.vendorForm?.get('country').value;
    this.smartAgentDetail.addressInfo.countryName = countryData[0]?.countryName;
    this.smartAgentDetail.addressInfo.stateId = stateData[0]?.stateId;
    this.smartAgentDetail.addressInfo.stateName = stateData[0]?.typeDescription;
    this.smartAgentDetail.primaryNo.primaryCountryCode = this.vendorForm?.get('primaryCountryCode').value;
    this.smartAgentDetail.primaryNo.primaryAreaCode = this.vendorForm?.get('primaryAreaCode').value;
    this.smartAgentDetail.primaryNo.primaryNo = this.vendorForm?.get('primaryNo').value.toString();
    this.smartAgentDetail.primaryMailId = this.vendorForm?.get('primaryEmailId').value;
    this.smartAgentDetail.accountCode = this.vendorForm?.get('accountCode').value ? this.vendorForm?.get('accountCode').value.toString() : "null";
    this.smartAgentDetail.panNo = this.vendorForm?.get('Pan_No').value;
    this.smartAgentDetail.createdBy = "null";
    this.smartAgentDetail.modifiedBy = "null";
    this.smartAgentDetail.status = true;
    this.smartAgentDetail.groupCompany = false;
    this.smartAgentDetail.fasCode = this.vendorForm?.get('FA_code').value;
    this.smartAgentDetail.sacCode = this.vendorForm?.get('SAC_Code').value;
    this.smartAgentDetail.operationUser = this.vendorForm?.get('OP_Users').value;
    this.smartAgentDetail.mloId = this.vendorForm?.get('MLO_ID').value;
    this.smartAgentDetail.creditDays = this.vendorForm?.get('Credit_days').value;
    this.smartAgentDetail.survey = this.vendorForm?.get('survey').value;
    this.smartAgentDetail.name = this.vendorForm?.get('Survey_Name').value;
    this.smartAgentDetail.gstNo = this.vendorForm?.get('gst_No')?.value;
    this.smartAgentDetail.portName = this.vendorForm?.get('portName').value;
    this.smartAgentDetail.defaultSurveyor = this.vendorForm?.get('defaultSurveyor').value;
    this.smartAgentDetail.remark = this.vendorForm?.get('remark').value;
    this.smartAgentDetail.isShippingLine = this.vendorForm?.get('IS_Shipping_Line').value;
    if(this.vendor) this.smartAgentDetail.name = this.vendorForm?.get('Vendor_Name').value;
    this.smartAgentDetail.tdsDetails = this.addArrayValue();
    this.smartAgentDetail.gstDetails = this.addArrayValue1();
  }
  addArrayValue() {
    const branchArray = [];
    this.tdsDetails?.controls.forEach(element => {
      let branch = {
        tdsNature: element.value.tdsNature,
        tdsPercent: element.value.tdsPercent,
        effectiveDate: element.value.effectiveDate,
        limit: element.value.limit,
        tdsLocation: this.locationList.filter((x) => x?.locationId ===  element.value.location)[0]?.locationName,
        tdsLocationId: element.value.location,
      }
      branchArray.push(branch)
    });
    return branchArray;
  }
  addArrayValue1() {
    const branchArray = [];
    this.gstDetails?.controls.forEach(element => {
      let branch = {
        stateCode: this.stateList1.filter((x)=> x?.stateId === element.value.stateCode)[0]?.stateCode ,
        stateCodeId: element.value.stateCode,
        rcmCategory: element.value.rcmCategory,
        gst: element.value.gst,
        address: element.value.address,
        gstLocation: this.locationList.filter((x) => x?.locationId ===  element.value.location)[0]?.locationName,
        gstLocationId: element.value.location,
        picCode: element.value.picCode,
        isSez: element.value.isSez,
        hsnCode: element.value.hsnCode,
        percentage: element.value.percentage,
      }
      branchArray.push(branch)
    });
    return branchArray;
  }
  changeStatus(data) {
    this.CommonService.UpdateToST(`partymaster/${data.partymasterId}`,{ ...data, status: !data?.status }).subscribe((res: any) => {
      if (res) {
        this.notification.create(
          'success',
          'Status Updated Successfully',
          ''
        );
        this.getPartyList()
      }
    }, error => {
      this.notification.create(
        'error',
        error?.error?.error?.message,
        ''
      );
    });
  }
  isViewMode: boolean = false;
  onOpenEdit(content, partyData?, show?) {
    this.isViewMode = show === 'show';
    this.show = show;
    this.partyID = ""
    if (partyData) {
      this.isUpdate = true
      this.partyID = partyData?.partymasterId
      this.formBuild(partyData)
    }
    show === 'show' ? this.vendorForm.disable() : this.vendorForm.enable()
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }
  next() {
    if (this.toalLength > this.count) {
      this.getPaginationData('next');
    }
  }

  prev() {
    if (this.page > 0) {
      this.getPaginationData('prev');
    }
  }

  filter(e) {
    this.size = e.target.value;
    this.fromSize = 1;
    this.getPartyList()
  }

  search() {
    let mustArray = {};
    mustArray['customerType.item_text'] ='Vendor' 

  // Trim beginning spaces from search parameters
  this.Vendor_Name = this.Vendor_Name?.trim();
  this.Adddress =  this.Adddress?.trim();
  this.pan_no = this.pan_no?.trim();
  this.gst_no =  this.gst_no?.trim();
  this.state =  this.state?.trim();
    if (this.Vendor_Name) {
      mustArray['name'] = {
        "$regex" : this.Vendor_Name,
        "$options": "i"
    }
    }
   

    if (this.Adddress) {
      mustArray['addressInfo.address'] = {
        "$regex" : this.Adddress,
        "$options": "i"
    }
    }

    if (this.pan_no) {
      mustArray['panNo'] = {
        "$regex" : this.pan_no,
        "$options": "i"
    }
    }

    if (this.gst_no) {
      mustArray['gstNo'] = {
        "$regex" : this.gst_no,
        "$options": "i"
    }
    }
    if (this.state) {
      mustArray['addressInfo.stateName'] = {
        "$regex" : this.state,
        "$options": "i"
    }
    }

    let payload = this.CommonService.filterList()
    payload.query = mustArray
    payload.sort = {
      "desc" : ["updatedOn"]
   }
   payload.size = Number(this.size)
   payload.from = 0,
    this.CommonService.getSTList('partymaster', payload).subscribe((data) => {
      this.smartAgentList = data.documents?.map((s: any,index) => {
        return{
          ...s,
          id:index+1
        }
      });
      this.toalLength = data.totalCount;
      this.count = data.documents.length;
      this.fromSize =1
    })
  }

  getPaginationData(type: any) {

    this.fromSize = type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;

    let payload = this.CommonService.filterList()
    payload.query = { "isSupplier": true}
    payload.sort = {
      "desc" : ["updatedOn"]
   }

   let mustArray = {};
   mustArray['customerType.item_text'] ='Vendor' 

 this.Vendor_Name = this.Vendor_Name?.trim();
 this.Adddress =  this.Adddress?.trim();
 this.pan_no = this.pan_no?.trim();
 this.gst_no =  this.gst_no?.trim();
 this.state =  this.state?.trim();
   if (this.Vendor_Name) {
     mustArray['name'] = {
       "$regex" : this.Vendor_Name,
       "$options": "i"
   }
   }
  

   if (this.Adddress) {
     mustArray['addressInfo.address'] = {
       "$regex" : this.Adddress,
       "$options": "i"
   }
   }

   if (this.pan_no) {
     mustArray['panNo'] = {
       "$regex" : this.pan_no,
       "$options": "i"
   }
   }

   if (this.gst_no) {
     mustArray['gstNo'] = {
       "$regex" : this.pan_no,
       "$options": "i"
   }
   }
   if (this.state) {
     mustArray['addressInfo.stateName'] = {
       "$regex" : this.state,
       "$options": "i"
   }
   }

   payload.query = mustArray
   payload.size = Number(this.size)
   payload.from = this.fromSize -1;
    this.CommonService.getSTList('partymaster', payload).subscribe(data => {
      this.smartAgentList = data.documents;
      this.toalLength = data.totalCount;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count =
      type === 'prev'
        ? this.toalLength === this.count
          ? this.count - ((this.toalLength % Number(this.size))>0?(this.toalLength % Number(this.size)):(Number(this.size)))
          : this.count - data.documents.length
        : this.count + data.documents.length;
  });
  }

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.smartAgentList.map((row: any) => {
      storeEnquiryData.push({
        'Vendor Name': row.name,
        'Address': row.addressInfo?.address,
        'GST No': row.gstNo,
        'Pan No': row.panNo,
        'State': row.addressInfo?.stateName,
      });
    });
    const myworksheet: XLSX.WorkSheet =
      XLSX.utils.json_to_sheet(storeEnquiryData);
    const myworkbook: XLSX.WorkBook = {
      Sheets: { data: myworksheet },
      SheetNames: ['data'],
    };
    const excelBuffer: any = XLSX.write(myworkbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const fileName = 'vendor-master.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  openPDF() {
    const prepare = [];
    this.smartAgentList.forEach(e => {
      let tempObj = [];
      tempObj.push(e.name);
      tempObj.push(e.addressInfo?.address);
      tempObj.push(e.gstNo);
      tempObj.push(e.panNo);
      tempObj.push(e.addressInfo?.stateName);
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [297, 210]);
    autoTable(doc, {
      head: [['Vendor Name', 'Address', 'GST No', 'Pan No', 'State']],
      body: prepare,
      didDrawCell: (data) => {
        // Draw border lines for each cell
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'S');
    }
    });
    doc.save('vendor-master' + '.pdf');
  }

  addNewTds() {
    this.tdsDetails?.push(this.addTds(''))
  }
  addNewGst() {
    this.gstDetails?.push(this.addGst(''))
  }

  addTds(res) {
    return this.fb.group({
      tdsNature: [res ? res?.tdsNature : '', [Validators.required]],
      tdsPercent: [res ? res?.tdsPercent : '', [Validators.required]],
      effectiveDate: [res ? res?.effectiveDate : '', [Validators.required]],
      limit: [res ? res?.limit : '', [Validators.required]],
      location: [res ? res?.tdsLocationId : '', [Validators.required]],
    })

  }
  addGst(res) {
    return this.fb.group({
      stateCode: [res ? res?.stateCodeId : '', [Validators.required]],
      rcmCategory: [res ? res?.rcmCategory : '', [Validators.required]],
      gst: [res ? res?.gst : '', [Validators.required]],
      address: [res ? res?.address : '', [Validators.required]],
      location: [res ? res?.gstLocationId : '', [Validators.required]],
      picCode: [res ? res?.picCode : '', [Validators.required]],
      isSez: [res ? res?.isSez : true],
      hsnCode: [res ? res?.hsnCode : '', [Validators.required]],
      percentage: [res ? res?.percentage : '', [Validators.required]],
    })

  }
  deleteTds(vIndex: number) {
    this.tdsDetails?.removeAt(vIndex);
  }
  deleteGst(vIndex: number) {
    this.gstDetails?.removeAt(vIndex);
  }
  get tdsDetails() {
    return this.vendorForm.controls["tdsDetails"] as FormArray;
  }
  get gstDetails() {
    return this.vendorForm.controls["gstDetails"] as FormArray;
  }

}
