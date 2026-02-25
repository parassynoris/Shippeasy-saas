import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  ModalDismissReasons,
  NgbModal,
  NgbModalRef,
} from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { environment } from 'src/environments/environment';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
import { CommonService } from 'src/app/services/common/common.service';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { DatePipe } from '@angular/common'
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { CognitoService } from 'src/app/services/cognito.service';
import { Vessel } from 'src/app/models/vessel-master';
import { CountryData } from 'src/app/models/city-master';
import { uom } from 'src/app/models/uom';
import { MastersSortPipe } from 'src/app/shared/util/mastersort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
@Component({
  selector: 'app-rail-fleet',
  templateUrl: './rail-fleet.component.html',
  styleUrls: ['./rail-fleet.component.scss'],
})
export class RailFleetComponent implements OnInit {
  _gc=GlobalConstants;
  modalReference: NgbModalRef;
  addVesselForm: FormGroup;
  vesseldata: Vessel[]  = [];
  vesselIdToUpdate: string;
  closeResult: string;
  submitted: any = false;
  toalLength: any;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  minDate = environment.validate.minDate;
  vesselCode: any;

  railCarrier:any;
  carrierCode:any;
  railCar:any;
  wagonNumber:any;
  Dimensions:any;
  Capacity:any;
  Cargo:any;
  TRAMP_VESSEL_ID: any;
  IN_ACTIVE_FLAG: any;
  countryList:CountryData [] = [];
  shippinglineData:any;
  uomcategoryList: uom[]  = [];
  vesselTypeList: any = [];
  certificateData: any = [];
  certificateName: any;
  certificateValidFrom: any;
  certificateValidTo: any;
  certificateDoc: any;
  systemData: any;
  vesselCategories: any = [];
  vesselSubTypeList: any = [];
  vesselSubtypes: any = [];
  documentName: any;
  tenantId: any;
  yardcfs:any;
  activeButton: number = 1;
  email:any
  isEditing: boolean = false;
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort1!: MatSort;
  displayedColumns =[
    '#', 
    'action',
    'railCar',
    'wagonNumber',
    'carrierCode',
    'Cargo',
    'Dimensions',
    'Capacity',
    'railCarrier',
    'status'
  ];

  constructor(
    public modalService: NgbModal,
    private masterservice: MastersService,
    private fb: FormBuilder, private cognito : CognitoService,
    private notification: NzNotificationService,private commonfunction: CommonFunctions,
    private saMasterService: SaMasterService,
    public commonService: CommonService,
    public datepipe: DatePipe,
    private sortPipelist: MastersSortPipe,
    public loaderService: LoaderService,

  ) {
    this.formBuild();
  }

  formBuild() {
    this.addVesselForm = this.fb.group({
      wagonNumber:[''],
      carrierCode:['', Validators.required],
      railCar:['', Validators.required],
      Cargo:[''],
      Dimensions:[''],
      Capacity:[''],
      railCarrier:['', Validators.required],
      status: [true],
    });
    let vesselCodeSample = new Date().getTime().toString()
    // this.addVesselForm.get('vesselCode').setValue(vesselCodeSample.slice(7))
    
  }

  ngOnInit(): void {
    this.getData();
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.tenantId = resp.tenantId
      }
    }) 
  }

  applyFilter(filterValue: string) { 
    filterValue = filterValue.trim(); // Remove whitespace
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
        this.displayedColumns[ind] !== 'status' ?
          this.filterKeys[this.displayedColumns[ind]] = {
            "$regex": each.toLowerCase(),
            "$options": "i"
          } : this.filterKeys[this.displayedColumns[ind]] = {
            "$eq": (each.toLowerCase() === 'active' ? true : false),
          }

    });
    let payload = this.commonService.filterList()
    payload.query = this.filterKeys
    payload.sort = {
      "desc": ["updatedOn"]
    }
    this.commonService?.getSTList('rail', payload)?.subscribe((data) => {
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
    this.getData()
  }

  get cranes() {
    return this.addVesselForm.get('cranes') as FormArray;
  }
  sortList(array , key){
    return this.sortPipelist.transform(array, key);
   }

  get f() {
    return this.addVesselForm.controls;
  }
  pageNumber = 1;
  pageSize = 10;
  from = 0;
  totalCount = 0;

  onPageChange(event){
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.from = event.pageIndex*event.pageSize ;
    this. getData();
  }
  getData() {
    this.loaderService.showcircle();
    let payload = this.commonService.filterList()
    payload.size= this.pageSize,
    payload.from=this.from
    payload.query = { }
    payload.sort = {
      "desc" : ["updatedOn"]
   }
   let mustArray = {};
    this.IN_ACTIVE_FLAG = this.IN_ACTIVE_FLAG?.trim();
    this.Dimensions = this.Dimensions?.trim();
    this.wagonNumber = this.wagonNumber?.trim();
    this.Capacity = this.Capacity?.trim();
    this.railCarrier=this.railCarrier?.trim();
    this.railCar = this.railCar?.trim();
    this.Cargo =  this.Cargo?.trim();
    this.carrierCode = this.carrierCode?.trim();
    this.IN_ACTIVE_FLAG = this.IN_ACTIVE_FLAG?.trim();

    if (this.wagonNumber) {
      mustArray['wagonNumber'] = {
        "$regex" : this.wagonNumber,
        "$options": "i"
    }
    }
    if(this.Capacity){
      mustArray['Capacity'] ={
        "$regex" : this.Capacity,
        "$options": "i"
      }
    }
    if(this.railCarrier){
      mustArray['railCarrier'] ={
        "$regex" : this.railCarrier,
        "$options": "i"
      }
    }
    
    if (this.wagonNumber) {
      mustArray['wagonNumber'] = {
        "$regex" : this.wagonNumber,
        "$options": "i"
    }
    }
    if(this.railCar){
      mustArray['chartName']={
        "$regex" : this.railCar,
        "$options":"i"     
    }
    }
    if (this.Cargo) {
      mustArray['countryName'] = {
        "$regex" : this.Cargo,
        "$options": "i"
    }
    }
    if (this.carrierCode) {
      mustArray['carrierCode'] = {
        "$regex" : this.carrierCode,
        "$options": "i"
    }
    }
    if (this.IN_ACTIVE_FLAG) {
      mustArray['status'] = this.IN_ACTIVE_FLAG === 'true' ? true : false
    }

    payload.query = mustArray
    this.commonService.getSTList('rail', payload).subscribe((res: any) => {
      this.vesseldata = res.documents;

      if (res && res?.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1,
          wagonNumber:s.wagonNumber,
          Capacity:s.Capacity,
          railCarrier:s.railCarrier,
          carrierCode:s.carrierCode,
          railCar:s.railCar,
          Cargo:s.Cargo,
          Dimensions:s.Dimensions,
          status:s.status
        }));
        this.dataSource.sort = this.sort1; 
        this.toalLength = res.totalCount;
        this.count = res.documents.length;
        this.loaderService.hidecircle();
      }
    },()=>{
      this.loaderService.hidecircle();
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
    this.getData();
  }

  getPaginationData(type: any) {
    this.fromSize =
      type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
      let payload = this.commonService.filterList()
    payload.query = { }
    payload.sort = {
      "desc" : ["updatedOn"]
   }
   let mustArray = {};
    this.wagonNumber = this.wagonNumber?.trim();
    this.carrierCode = this.carrierCode?.trim();
    this.railCar = this.railCar?.trim();
    this.Cargo = this.Cargo?.trim();
    this.Dimensions = this.Dimensions?.trim();
    this.IN_ACTIVE_FLAG = this.IN_ACTIVE_FLAG?.trim();
    if (this.wagonNumber) {
      mustArray['wagonNumber'] = {
        "$regex" : this.wagonNumber,
        "$options": "i"
    }
    }
    
    if (this.Capacity) {
      mustArray['Capacity'] = {
        "$regex" : this.Capacity,
        "$options": "i"
    }
    }

    if (this.railCarrier) {
      mustArray['railCarrier'] = {
        "$regex" : this.railCarrier,
        "$options": "i"
    }
    }

    if(this.railCar){
      mustArray['chartName']={
        "$regex" : this.railCar,
        "$options":"i"     
    }
    }
    if (this.Cargo) {
      mustArray['countryName'] = {
        "$regex" : this.Cargo,
        "$options": "i"
    }
    }
    if (this.carrierCode) {
      mustArray['carrierCode'] = {
        "$regex" : this.carrierCode,
        "$options": "i"
    }
    }
    if (this.IN_ACTIVE_FLAG) {
      mustArray['status'] = this.IN_ACTIVE_FLAG === 'true' ? true : false
    }
    payload.query = mustArray
   payload.size = Number(this.size)
   payload.from = this.fromSize -1,
    this.commonService.getSTList('rail', payload).subscribe((data) => {
      this.vesseldata = data.documents;
      this.toalLength = data.totalCount;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count =
        type === 'prev'
          ? this.toalLength === this.count
            ? this.count -  ((this.toalLength % Number(this.size))>0?(this.toalLength % Number(this.size)):(Number(this.size)))
            : this.count - data.documents.length
          : this.count + data.documents.length;
    });
  }

  search() {
    let mustArray = {};
    this.wagonNumber = this.wagonNumber?.trim();
    this.Capacity = this.Capacity?.trim();
    this.railCarrier = this.railCarrier?.trim();
    this.carrierCode = this.carrierCode?.trim();
    this.railCar = this.railCar?.trim();
    this.Cargo = this.Cargo?.trim();
    this.Dimensions = this.Dimensions?.trim();
    this.IN_ACTIVE_FLAG = this.IN_ACTIVE_FLAG?.trim();
    if (this.wagonNumber) {
      mustArray['wagonNumber'] = {
        "$regex" : this.wagonNumber,
        "$options": "i"
    }
    }
    
    if (this.Capacity) {
      mustArray['Capacity'] = {
        "$regex" : this.Capacity,
        "$options": "i"
    }
    }

    if (this.railCarrier) {
      mustArray['railCarrier'] = {
        "$regex" : this.railCarrier,
        "$options": "i"
    }
    } 

    if(this.railCar){
      mustArray['chartName']={
        "$regex" : this.railCar,
        "$options":"i"     
    }
    }
    if (this.Cargo) {
      mustArray['countryName'] = {
        "$regex" : this.Cargo,
        "$options": "i"
    }
    }
    if (this.carrierCode) {
      mustArray['carrierCode'] = {
        "$regex" : this.carrierCode,
        "$options": "i"
    }
    }
    if (this.IN_ACTIVE_FLAG) {
      mustArray['status'] = this.IN_ACTIVE_FLAG === 'true' ? true : false
    }

    let payload = this.commonService.filterList()
    payload.query = mustArray
    payload.sort = {
      "desc" : ["updatedOn"]
   }
   payload.size = Number(this.size)
   payload.from = this.fromSize -1,
    this.commonService.getSTList('rail', payload).subscribe((data) => {
      this.vesseldata = data.documents?.map((s: any,index) => {
        return{
          ...s,
          id:index+1
        }
      });
      this.toalLength = data.totalCount;
      this.count = data.documents.length;
      this.fromSize =1
    });
  }

  clear() {
    this.wagonNumber = ""
    this.Capacity = ""
    this.railCarrier =""
    this.carrierCode = ""
    this.carrierCode = ""
    this.Cargo = ""
    this.Dimensions = ""
    this.getData();
  }
  isViewMode: boolean = false;
  open(content, vessel?: any, show?: string) {
    this.isViewMode = show === 'show'; // Set view mode based on the 'show' parameter

    if (vessel) {
      this.vesselIdToUpdate = vessel.railId;
      this.addVesselForm.patchValue({
        wagonNumber: vessel.wagonNumber,
        Capacity: vessel.Capacity,
        railCarrier: vessel.railCarrier,
        vesselCode: vessel.vesselCode,
        carrierCode: vessel.carrierCode,
        railCar: vessel.railCar,
        Cargo: vessel.Cargo,
        Dimensions: vessel.Dimensions,
        status: vessel.status,
      });

      if (vessel.certificates) {
        this.certificateData = vessel.certificates;
      }

      // Enable or disable the form based on view mode
      if (this.isViewMode) {
        this.addVesselForm.disable();
      } else {
        this.addVesselForm.enable();
      }
    } else {
      this.vesselIdToUpdate = null;
    }

    // Open the modal dialog
    this.modalReference = this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'xl',
    });
  }
  refreshData() {
    var myInterval = setInterval(() => {
      this.getData();
      clearInterval(myInterval);
    }, 1000);
  }
  vesselMasters() {
    this.submitted = true;

    if (this.addVesselForm.invalid) {
      this.notification.create('error', 'Please fill required fields', '');
      return;
    }

    let newdata = this.addVesselForm.value;
    newdata.tenantId = this.tenantId;
    if (!this.vesselIdToUpdate) {
      this.commonService.addToST('rail', newdata).subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Added Successfully', '');
            this.onSave();
            this.refreshData();
          }
        },
        (error) => {
          this.notification.create('error', error?.error || 'An error occurred', '');
        }
      );
    } else {
      newdata.railId = this.vesselIdToUpdate;
      this.commonService.UpdateToST(`rail/${newdata.railId}`, newdata).subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Updated Successfully', '');
            this.onSave();
            this.refreshData();
          }
        },
        (error) => {
          this.notification.create('error', error?.error || 'An error occurred', '');
        }
      );
    }
  }


  changeStatus(data, i) {    
    this.commonService.UpdateToST(`rail/${data.railId}`,{ ...data, status: !data?.status })
      .subscribe(
        (res: any) => {
          if (res) {
            this.vesseldata[i].status = !data?.status;
            this.notification.create(
              'success',
              'Status Updated Successfully',
              ''
            );
            this.onSave();
            var myInterval = setInterval(() => {
              this.getData();
              clearInterval(myInterval);
            }, 1000);
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
  }

  onSave() {
    this.submitted = false;
    this.vesselIdToUpdate = null;
    this.formBuild();
    this.submitted = false;
    this.modalService.dismissAll();
    this.certificateData = [];
    return null;
  }

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.vesseldata.map((row: any) => {
      storeEnquiryData.push({
        "wagonNumber": row.wagonNumber,
        "railCarrier":row.railCarrier,
        "Capacity" : row.Capacity,
        "carrierCode": row?.carrierCode,
        "railCar" : row?.railCar,
        "Cargo" : row?.Cargo,
        "Dimensions": row?.Dimensions
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

    const fileName = 'Rail-Fleet.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  openPDF() {
    const prepare = [];
    this.vesseldata.forEach(e => {
      let tempObj = [];
      tempObj.push(e.vesselCode);
      tempObj.push(e.vesselName);
      tempObj.push(e.countryName);
      tempObj.push(e.callSign);
      tempObj.push(e.imoNo);
      tempObj.push(e.mmsino);
      tempObj.push(e.createdBy);
      tempObj.push(this.datepipe.transform(e.createdOn, 'dd-MM-YYYY,hh:mm'));
      tempObj.push(e.createdBy);
      tempObj.push(e.updatedDate);
      tempObj.push(e.status ? 'Active' : 'Inactive');
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [397, 310]);
    autoTable(doc, {
      head: [['Vessel Code', 'Vessel Name', 'Vessel Nationality Name', 'Call Sign', 'IMO No.', 'Created By', 'Created Date', 'Modify By', 'Modify Date']],
      body: prepare,
      didDrawCell: (data) => {
        // Draw border lines for each cell
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'S');
    }
    });
    doc.save('vessel-master' + '.pdf');
  }
}