import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from 'src/app/services/common/common.service';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { environment } from 'src/environments/environment';
import { BaseBody } from '../gl-bank/base-body';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { ApiService } from 'src/app/admin/principal/api.service';
import { CommonFunctions } from '../../functions/common.function';
import { CognitoService } from 'src/app/services/cognito.service';
import { ShippingLine } from 'src/app/models/shipping-line';
import { MastersSortPipe } from '../../util/mastersort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
@Component({
  selector: 'app-shipping-line-master',
  templateUrl: './shipping-line-master.component.html',
  styleUrls: ['./shipping-line-master.component.scss']
})
export class ShippingLineMasterComponent implements OnInit {
  _gc=GlobalConstants;
  shippinglineData = [];
  closeResult: string;
  shippingLineForm: FormGroup;
  shippingLineIdToUpdate: string;
  toalLength: number;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  submitted: boolean = false;
  name: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  shipping_line: string;
  contact_person: string;
  countryData: string;
  baseBody: BaseBody;
  portList=[];
  preCarrigeList  = [];
  onCarrigeList = [];
  containerTypeList = [];
  status: string;
  entryPort: string;
  loadPort: string;
  preCarriage: string;
  costItemList: ShippingLine[] = [];
  showCharge: boolean = false;
  newenquiryForm: FormGroup;
  currencyList: string;
  defaultCurrency = [];
  chargeName = [];
  chargetermList= [];
  submitted1: boolean = false;
  show: string;
  tenantId: string;
  IN_ACTIVE_FLAG: any;
  CarrierTypelist:any =[]
  agentBranchList:any =[];
  dataSource = new MatTableDataSource();
  pagenation = [10,20, 50, 100];
  emaill:any
  yardcfs:any
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns =[
    '#', 
    'action',
   'name',
   'shortName',
   'ShipmentTypeName',
  //  'scacCode',
   'email',
   'status'
  ];
  isMaster: boolean = false;
  branchList: any;
  driverRoles: any;

  constructor(
    private fb: FormBuilder,
    public modalService: NgbModal,
    public notification: NzNotificationService,
    public commonService: CommonService,
    private cognito: CognitoService,
    private sortPipelist: MastersSortPipe,
    public loaderService: LoaderService,
    private commonFunction: CommonFunctions
  ) {
    this.fb = fb;
    this.modalService = modalService;
    this.notification = notification;
    this.commonService = commonService;
    this.cognito = cognito
    this.formBuild()
  }

  formBuild() {
    this.shippingLineForm = this.fb.group({
      name: ['', [Validators.required]],
      shortName: [''],
      email: ['', [Validators.required, Validators.pattern(environment.validate.email)]],
      createUser: [false],
      status: [true],
      carrierType: ['', Validators.required],
      scacCode: [''],
      operatorCode: [''],
      contactName:[''],
      branchName:[''],
      phoneNo:['']
    });
  }

  get f() {
    return this.shippingLineForm.controls;
  }
  getcodeName(){
    if(this.shippingLineForm.value?.carrierType){
      let carrierType = this.CarrierTypelist?.find((x)=> x.systemtypeId == this.shippingLineForm.value?.carrierType)?.typeName?.toLowerCase() || ''
      if(carrierType ==='air') return 'IATA Code'
      if(carrierType ==='ocean') return 'SCAC Code'
      if(carrierType ==='rail') return 'Rail Carrier'
    }else{
      return 'Code'
    }
  }
  getBranchList() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      // orgId: id,
    }

    this.commonService.getSTList('branch', payload)
      ?.subscribe((data: any) => {
        this.agentBranchList = data.documents;
      });
  }
  carrierType:string =''
  checkcarrierType(){
    this.carrierType = this.CarrierTypelist?.find((x)=> x.systemtypeId == this.shippingLineForm.value?.carrierType)?.typeName?.toLowerCase() || ''
    if(this.carrierType ==='land'){
      this.shippingLineForm.controls['scacCode'].setValue("");
      this.shippingLineForm.controls['scacCode'].removeValidators([Validators.required]);
      this.shippingLineForm.controls['scacCode'].updateValueAndValidity();
            this.shippingLineForm.controls['email'].addValidators([Validators.required]);
      this.shippingLineForm.controls['email'].updateValueAndValidity();
      this.shippingLineForm.controls['operatorCode'].setValue("");
      this.shippingLineForm.controls['operatorCode'].removeValidators([Validators.required]);
      this.shippingLineForm.controls['operatorCode'].updateValueAndValidity();
    }
    else if (this.carrierType === 'air') {
      this.shippingLineForm.controls['email'].removeValidators([Validators.required]);
      this.shippingLineForm.controls['email'].updateValueAndValidity();
      this.shippingLineForm.controls['scacCode'].addValidators([Validators.required]);
      this.shippingLineForm.controls['scacCode'].updateValueAndValidity();
      this.shippingLineForm.controls['operatorCode'].setValue("");
      this.shippingLineForm.controls['operatorCode'].removeValidators([Validators.required]);
      this.shippingLineForm.controls['operatorCode'].updateValueAndValidity();
    }
  else if (this.carrierType === 'ocean') {
      this.shippingLineForm.controls['operatorCode'].addValidators([Validators.required]);
      this.shippingLineForm.controls['operatorCode'].updateValueAndValidity();
      this.shippingLineForm.controls['email'].removeValidators([Validators.required]);
      this.shippingLineForm.controls['email'].updateValueAndValidity();
      this.shippingLineForm.controls['scacCode'].addValidators([Validators.required]);
      this.shippingLineForm.controls['scacCode'].updateValueAndValidity();
    } 
  }
  batchData: any = [];
  ngOnInit(): void {
    // this.vvoye()
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.tenantId = resp.tenantId
      }
    })
    this.getRoleList()
    this.getShiipingLine();
    this.getBranchList()
    this.getAll()
    this.getBranchList1();
  }

  getRoleList() { 
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = { 
      roleName : 'Transport',
      orgId: this.commonFunction.getAgentDetails()?.orgId
     }
     if(payload?.sort)payload.sort = {
      "desc" : ["updatedOn"]
   }
  
    this.commonService.getSTList('role', payload)?.subscribe((data) => {
      this.driverRoles = data.documents?.map((x)=> {
        return {
          roleName: x.roleName,
          roleId : x.roleId
        }
      });
    });
  }
  sortList(array , key){
    return this.sortPipelist.transform(array, key);
   }

   vvoye() {
    let payload = this.commonService.filterList()
    payload.query = {
    }
    payload.sort = {
      "desc": ["updatedOn"]
    }

    let mustArray = {};
    payload.query = mustArray
    this.commonService.getSTList('shippingline', payload).subscribe((res: any) => {
      if (res && res.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1,
          name: s.name,
          shortName: s.shortName,
          typeCategory: s.carrierType,
          scacCode: s.scacCode,
          email: s.email,
          operatorCode : s?.operatorCode,
          status: s.status,
          phoneNo:s.phoneNo,
          contactName:s.contactName
         
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
    this.emaill.map((row: any) => {
      storeEnquiryData.push({
        'shortName' : row?.element?.shortName,
        'carrierType' : row?.element?.typeCategory,
        'name' : row?.element?.name,
        'email' : row?.element?.email,
        'status' : row?.element?.status,
        'operatorCode' : row?.element?.operatorCode,
        'scacCode' : row?.element?.scacCode,
        'phoneNo' :row?.element?.phoneNo,
        'contactName' : row?.element?.contactName
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
    this.commonService.getSTList('shippingline', payload).subscribe((data) => {
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
  getBranchList1() {

    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = { 
      orgId: this.commonFunction.getAgentDetails()?.orgId,
      status : true
    }
    this.commonService.getSTList('branch', payload)
      ?.subscribe((data) => {
        this.branchList = data.documents;
      });
  }

  clearFilters() {
    this.filtersModel = [];
    this.filterKeys = {};
    this.getShiipingLine()
  }
  pageNumber = 1;
  pageSize = 10;
  from = 0;
  totalCount = 0;

  onPageChange(event){
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.from = event.pageIndex*event.pageSize ;
    this.getShiipingLine();
  }
  getShiipingLine() {
    this.loaderService.showcircle();
    this.page = 1;
    
    let payload = this.commonService.filterList()
    if (payload?.size) payload.size= this.pageSize,
    payload.from=this.from
    if (payload?.query) payload.query = {
    }
    if (payload?.sort) payload.sort = {
      "desc": ["updatedOn"]
    }

    let mustArray = {};
    this.name = this.name?.trim();
    this.country = this.country?.trim();
    this.preCarriage = this.preCarriage?.trim();
    this.loadPort = this.loadPort?.trim();
    this.entryPort = this.entryPort?.trim();
    this.IN_ACTIVE_FLAG = this.IN_ACTIVE_FLAG?.trim();

    if (this.name) {
      mustArray['name'] = {
        "$regex": this.name,
        "$options": "i"
      }
    }
    if (this.country) {
      mustArray['shortName'] = {
        "$regex": this.country,
        "$options": "i"
      }
    }

    if (this.preCarriage) {
      mustArray['shippingLine'] = {
        "$regex": this.preCarriage,
        "$options": "i"
      }
    }
    if (this.loadPort) {
      mustArray['scacCode'] = {
        "$regex": this.loadPort,
        "$options": "i"
      }
    }
    if (this.entryPort) {
      mustArray['email'] = {
        "$regex": this.entryPort,
        "$options": "i"
      }
    }
    if (this.IN_ACTIVE_FLAG) {
      mustArray['status'] = this.IN_ACTIVE_FLAG === 'true' ? true : false
    }

    if(payload?.query)payload.query = mustArray
    // if (payload?.size) payload.size = Number(this.size)
    // if (payload?.from) payload.from = this.page - 1
      this.commonService.getSTList('shippingline', payload)?.subscribe((data: any) => {
        this.shippinglineData = data.documents;

        if (data && data?.documents) {
          this.dataSource.data = data.documents.map((s: any, i: number) => ({
            ...s,
            id: i + 1+this.from,
            name: s.name,
          shortName: s.shortName,
          carrierType: s.typeCategory,
          scacCode: s.scacCode,
          operatorCode : s?.operatorCode,
          email: s.email,
          status: s.status,
          phoneNo:s.phoneNo,
          contactName:s.contactName
            
          }));
          // this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort1; 
          this.toalLength = data.totalCount;
          this.count = data.documents.length;
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
    this.getShiipingLine();
  }

  getPaginationData(type: any) {
    this.fromSize =
      type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
    let payload = this.commonService.filterList()
    payload.query = {
    }
    payload.sort = {
      "desc": ["updatedOn"]
    }

    let mustArray = {};
    this.name = this.name?.trim();
    this.country = this.country?.trim();
    this.preCarriage = this.preCarriage?.trim();
    this.loadPort = this.loadPort?.trim();
    this.entryPort = this.entryPort?.trim();
    this.IN_ACTIVE_FLAG = this.IN_ACTIVE_FLAG?.trim();

    if (this.name) {
      mustArray['name'] = {
        "$regex": this.name,
        "$options": "i"
      }
    }
    if (this.country) {
      mustArray['shortName'] = {
        "$regex": this.country,
        "$options": "i"
      }
    }

    if (this.preCarriage) {
      mustArray['shippingLine'] = {
        "$regex": this.preCarriage,
        "$options": "i"
      }
    }
    if (this.loadPort) {
      mustArray['scacCode'] = {
        "$regex": this.loadPort,
        "$options": "i"
      }
    }
    if (this.entryPort) {
      mustArray['email'] = {
        "$regex": this.entryPort,
        "$options": "i"
      }
    }
    if (this.IN_ACTIVE_FLAG) {
      mustArray['status'] = this.IN_ACTIVE_FLAG === 'true' ? true : false
    }

    payload.query = mustArray
    // payload.size = Number(this.size)
    // payload.from = this.fromSize - 1,
      this.commonService.getSTList('shippingline', payload).subscribe((data) => {
        this.shippinglineData = data.documents;
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
    this.name = this.name?.trim();
    this.country = this.country?.trim();
    this.preCarriage = this.preCarriage?.trim();
    this.loadPort = this.loadPort?.trim();
    this.entryPort = this.entryPort?.trim();
    this.IN_ACTIVE_FLAG = this.IN_ACTIVE_FLAG?.trim();

    if (this.name) {
      mustArray['name'] = {
        "$regex": this.name,
        "$options": "i"
      }
    }
    if (this.country) {
      mustArray['shortName'] = {
        "$regex": this.country,
        "$options": "i"
      }
    }

    if (this.preCarriage) {
      mustArray['shippingLine'] = {
        "$regex": this.preCarriage,
        "$options": "i"
      }
    }
    if (this.loadPort) {
      mustArray['scacCode'] = {
        "$regex": this.loadPort,
        "$options": "i"
      }
    }
    if (this.entryPort) {
      mustArray['email'] = {
        "$regex": this.entryPort,
        "$options": "i"
      }
    }
    if (this.IN_ACTIVE_FLAG) {
      mustArray['status'] = this.IN_ACTIVE_FLAG === 'true' ? true : false
    }

    let payload = this.commonService.filterList()
    payload.query = mustArray
    payload.sort = {
      "desc": ["updatedOn"]
    }
    // payload.size = Number(this.size)
    // payload.from = this.page - 1,
      this.commonService.getSTList('shippingline', payload).subscribe((data) => {
        this.shippinglineData = data.documents?.map((s: any,index) => {
          return{
            ...s,
            id:index+1
          }
        });
        this.toalLength = data.totalCount;
        this.count = data.documents.length;
        this.fromSize = 1
      });
  }
  changeFromDate() {
    this.shippingLineForm.controls.toDate.setValue('')
  }

  clear() {
    this.name = '';
    this.city = '';
    this.country = '';
    this.phone = '';
    this.email = '';
    this.shipping_line = '';
    this.contact_person = '';
    this.status = '';
    this.entryPort = '';
    this.loadPort = '';
    this.preCarriage = '';
    this.status='';
    this.IN_ACTIVE_FLAG = '';
    this.getShiipingLine();
  }
  hideCreatedUser: boolean = false;
  costItemsMasters() {
    this.submitted = true;
    if (this.shippingLineForm.invalid) {
      return;
    }
    let newCostItems = {
      name: this.shippingLineForm.value.name,
      shortName: this.shippingLineForm.value.shortName,
      typeCategory: this.shippingLineForm?.value?.carrierType,
      ShipmentTypeName: this.CarrierTypelist.find(x => x.systemtypeId === this.shippingLineForm.value.carrierType)?.typeName,
      scacCode: this.shippingLineForm.value.scacCode,
      operatorCode : this.shippingLineForm.value.operatorCode || '',
      email: this.shippingLineForm.value.email,
      status: this.shippingLineForm.value.status,
      phoneNo:this.shippingLineForm.value.phoneNo,
      contactName:this.shippingLineForm.value.contactName,
      branchId:this.shippingLineForm.value.branchName,
      branchName: this.branchList.find(x => x.branchId === this.shippingLineForm.value.branchName)?.branchName,
      createUser:this.shippingLineForm.value.createUser,
      country: 'IN',
      "tenantId": this.tenantId,
    };


    if (!this.shippingLineIdToUpdate) {
      this.commonService.addToST('shippingline', newCostItems).subscribe(
        (res: any) => {
          if (res) {
            setTimeout(() => {
              this.notification.create('success', 'Added Successfully', '');
             {
                if (this.shippingLineForm?.get('createUser').value) {
                  this.createUser(res)
                }
              }
              this.onSave();
              this.getShiipingLine();
            }, 1000);
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
    } else {
      const dataWithUpdateID = {
        ...newCostItems,
        shippinglineId: this.shippingLineIdToUpdate,
      };
      this.commonService.UpdateToST(`shippingline/${dataWithUpdateID.shippinglineId}`, dataWithUpdateID).subscribe(
        (res: any) => {
          if (res) {
            setTimeout(() => {
              this.notification.create('success', 'Updated Successfully', '');
              if(!this.hideCreatedUser){
                if (this.shippingLineForm?.get('createUser').value) {
                  this.createUser(res)
                }
              }
              this.onSave();
              this.getShiipingLine();
            }, 1000);
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
    }
  }
 
  



  delete(deleteshippingLine, id) {
    this.modalService
      .open(deleteshippingLine, {
        backdrop: 'static',
        keyboard: false,
        centered: true,
        size: '',

        ariaLabelledBy: 'modal-basic-title',
      })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
          if (result === 'yes') {
            let data = 'shippingline' + id.shippinglineId
            this.commonService
              .deleteST(data)
              .subscribe((res: any) => {
                if (res) {
                  this.notification.create(
                    'success',
                    'Deleted Successfully',
                    ''
                  );
                  this.clear();
                }
              });
            setTimeout(() => {
              this.getShiipingLine();
            }, 1000);

          }
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  open(content, shippingLine?: any, show?) {
    this.show = show;
    this.hideCreatedUser= false
    show === 'show' ? this.shippingLineForm.disable() : this.shippingLineForm.enable()
    if (shippingLine) {
      this.hideCreatedUser = shippingLine?.createUser || false
      this.shippingLineIdToUpdate = shippingLine?.shippinglineId;
      this.costItemList = shippingLine?.costItems
      this.shippingLineForm.patchValue({
        name: shippingLine?.name,
        shortName: shippingLine?.shortName,
        carrierType: shippingLine?.typeCategory,
        scacCode: shippingLine?.scacCode,
        operatorCode : shippingLine?.operatorCode || '',
        email: shippingLine?.email,
        createUser: shippingLine?.createUser || false,
        status: shippingLine?.status,
        phoneNo:shippingLine?.phoneNo,
        contactName:shippingLine?.contactName,
        branchName:shippingLine?.branchId

      });
    }
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }
  changeStatus(data, i) {
    this.commonService.UpdateToST(`shippingline/${data.shippinglineId}`, { ...data, status: !data?.status })
      .subscribe(
        (res: any) => {
          if (res) {
            this.shippinglineData[i].status = !data?.status;
            this.notification.create(
              'success',
              'Status Updated Successfully',
              ''
            );
             this.getShiipingLine();
            var myInterval = setInterval(() => {
              this.search();
              clearInterval(myInterval);
            }, 1000);
          }
        },
        (error) => {
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
  }
  onSave() {
    this.showCharge = false;
    this.submitted = false;
    this.shippingLineIdToUpdate = null;
    this.formBuild()
    this.submitted = false;
    this.modalService.dismissAll();
    return null;
  }

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.shippinglineData.map((row: any) => {
      storeEnquiryData.push({
        'Name': row.name,
        'Short Name': row.shortName,
        'Shipping Line': row.typeCategory,
        'Load PortName': row.scacCode,
        'Entry PortName': row.email,
        'Contact Name' :row.contactName,
        'Contact Number' :row.phoneNo,
        'Status': row.status? 'Active' : 'Inactive',
      });
    });
    const myworksheet: XLSX.WorkSheet =
      XLSX.utils.json_to_sheet(storeEnquiryData);
    const myworkbook: XLSX.WorkBook = {
      Sheets: { data: myworksheet },
      SheetNames: ['data'],
    };
    const fileName = 'shipping-line.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }
  createUser(data) {
    if(this.driverRoles.length == 0){
      this.notification.create(
        'error',
        `We can't create user. Please Create Transport role in role master`,
        ''
      );
      return false
    }
    let payload = {
      "tenantId": this.tenantId,
      "orgId": this.commonFunction.getAgentDetails().orgId,
      "agentId": '1',
      "name": data?.name,
      "userName": data?.name?.replace(/\s+/g, ''),
      "userLastname": '',
      "shortName": '',
      "officeLocation": '',
      "userEmail": data?.email,
      // "password": this.userForm.controls.password.value,
      "phoneNo": 0,
      "userLogin": data?.name?.replace(/\s+/g, ''),
      "department": [],
      "agent": '',
      "principle": '',
      "defaultPrinciple": '',
      "agentBranch": '',
      "agentBranchName": '',
      "superUser": true,
      "jmbFAS": false,
      "exportBackDate": false,
      "importBackDate": false,
      "agencyInvoice": false,
      "exRateEditable": false,
      "userType": "transporter",
      "driverName" : data?.name,
      "driverId": data?.shippinglineId||'',
      "roles": this.driverRoles || [],
      "userStatus": true,
      "status": true,
      isEmail: false,
      isMobile: false,
      isPassword: false,
      "userId": data?.driverId,
      "createdDate": new Date(),
      "updatedDate": new Date()
    };


    this.commonService.addToST(`user`, payload)?.subscribe(res => {
      if (res) {
        this.notification.create(
          'success',
          'User Created Successfully',
          ''
        );
      }
    });



  }


  openPDF() {
    const prepare = [];
    this.shippinglineData.forEach(e => {
      let tempObj = [];
      tempObj.push(e.name);
      tempObj.push(e.shortName);
      tempObj.push(e.typeCategory);
      tempObj.push(e.scacCode);
      tempObj.push(e.contactName);
      tempObj.push(e.phoneNo);
      tempObj.push(e.email);
      tempObj.push(e.status ? 'Active' : 'Inactive');
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [297, 210]);
    autoTable(doc, {
      head: [['Carrier Name', 'Carrier Short Name','Carrier Type', 'Code','Contact Name','Contact Number', 'Email', 'Status']],
      body: prepare,
      didDrawCell: (data) => {
        // Draw border lines for each cell
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'S');
    }
    });
    doc.save('Carrier-Master' + '.pdf');
  }
  getAll() {
    this.loaderService.showcircle();

    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      "typeCategory":"carrierType",
      "status": true
     

    }
    if (payload?.size) payload.size = 1000,
      payload.from = 0,
      payload.sort = { "desc": ['updatedOn'] }

    this.commonService.getSTList('systemtype', payload)?.subscribe((data) => {
      this.CarrierTypelist = data?.documents?.filter(x => x.typeCategory === "carrierType");

  });
  }
}
