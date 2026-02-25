import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ApiService } from 'src/app/admin/principal/api.service';
import { BaseBody } from 'src/app/admin/smartagent/base-body';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { DatePipe } from '@angular/common';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { OrderByPipe } from 'src/app/shared/util/sort';
import { CommonService } from 'src/app/services/common/common.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { Container, Location } from 'src/app/models/container-master';
import { MastersSortPipe } from 'src/app/shared/util/mastersort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
import { Router } from '@angular/router';

interface Users{
  tenantId:string,
  updatedOn:string,
  createdOn:string,
  updatedBy:string,
  createdBy:string
}
@Component({
  selector: 'app-container-master',
  templateUrl: './container-master.component.html',
  styleUrls: ['./container-master.component.scss'],
})
export class ContainerMasterComponent implements OnInit {
  _gc=GlobalConstants;
  PortData:[];
  addContainerForm: FormGroup;
  containerIdToUpdate: any;
  containerStatus:any
  isStatus:boolean=false
  closeResult: string;
  toalLength: number;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  submitted: boolean = false;
  containerno: string;
  Size: string;
  tankStatus: string;
  yardName: string;
  updatedBy:string;
  tarWeight: string;
  tankCapacity: string;
  exitOffHireDate: string;
  onHireDate: string;
  dateOfManufacture: string;
  countryData: [];
  portDataValue:[];
  baseBody: BaseBody;
  containerList: Container[] = [];
  tanktypeList: Container[] = [];
  soc: boolean = false;
  UserDetails: Users ;
  tankstatusList: Container[]  = [];
  containerOpratorList:Container[]  = [];
  containerTypeList: Container[] ;
  oneWay: string | boolean;
  isEdit: boolean = false;
  show: string;
  yardList: Location[] = [];
  oneWay1:  boolean = false;

  dataSource = new MatTableDataSource();
  pagenation = [10,20, 50, 100];
  emaill:any
  yardcfs:any
  @ViewChild(MatSort) sort1: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  displayedColumns =[
    '#', 
    'action',
   'containerNo',
  //  'containerSize',
   'tankStatus',
  //  'yardName',
  //  'tarWeight',
  //  'tankCapacity',
   'exitOffHireDate',
   'onHireDate',
   'dateOfManufacture',
   'updatedBy',
   'status'
   
  ];
  isMaster: boolean = false;

  constructor(
    public modalService: NgbModal,
    private fb: FormBuilder,
    public notification: NzNotificationService,
    private tranService: TransactionService,
    private commonFunctions: CommonFunctions,
    public datepipe: DatePipe,
    private _api: ApiService,
    private sortPipe:OrderByPipe,private cognito : CognitoService,
    public commonService: CommonService,
    private sortPipelist: MastersSortPipe,
    public loaderService: LoaderService,
     public router: Router,
  ) {
    this.addContainerForm = this.fb.group({
      containerNo: ['', [Validators.required]],
      containerType: ['', [Validators.required]],
      // containerSize: ['', [Validators.required]],
      tankStatus: [''],
      tankType: [''],
      tarWeight: [''],
      tankCapacity: [''],
      exitOffHireDate: [''],
      onHireDate: [''],
      yard:['',[Validators.required]],
      loadCapacity: [''],
      dateOfManufacture: [''],
      oneWay: [false],
      containerOperator: [''],
      pickLocation: [''],
      dropLocation: [''],
      soc: [false],
      maxGrossWeight: new FormControl(''),
      maxPayload: new FormControl(''),
      baffles: [false],
      remarks: [''],
      creationDate: [''],
      creationUserId: [''],
      lastUpdatedDate: [''],
      lastupdatedUserId: [''],
      status: [true]
    });
  }
  sort(array , key){
    return this.sortPipe.transform(array, key);
   }


  ngOnInit(): void {
    this.getLocation()
    this.getContainerData();
    this.getPartyMasterDropDowns();
    this.getSystemTypeDropDowns(); 
    // this.vvoye() 
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.UserDetails  = resp
      }
    }) 
   if(this?.UserDetails?.updatedOn) this.UserDetails.updatedOn = this.datepipe.transform(
      this.UserDetails.updatedOn,
      'dd-MM-yyyy'
    );
    if(this?.UserDetails?.createdOn)this.UserDetails.createdOn = this.datepipe.transform(
      this.UserDetails.createdOn,
      'dd-MM-yyyy'
    );
    this.patchAddContainerForm();
  }


  vvoye() {
    let payload = this.commonService.filterList()
    payload.sort = {  "desc" : ['updatedOn'] }
    let mustArray = {};
    payload.query=mustArray;
    this.commonService.getSTList('containermaster',payload).subscribe((res: any) => {
      if (res && res.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1,
          containerNo: s.containerNo,
          // containerSize: s.containerSize,
          tankStatus: s.tankStatus,
          tankType: s.tankType,
          tarWeight: s.tarWeight,
          tankCapacity: s?.tankCapacity,
          exitOffHireDate: s.exitOffHireDate,
          onHireDate: s.onHireDate,
          dateOfManufacture: s.dateOfManufacture,
          oneWay: s?.oneWay,
          updatedBy:s?.updatedBy
         
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
        'containerNo' : row?.element?.containerNo,
        // 'containerSize' : row?.element?.containerSize,
        'tankStatus' : row?.element?.tankStatus,
        'yardName':row?.element?.yardName,
        'tarWeight' : row?.element?.tarWeight,
        'tankCapacity' : row?.element?.tankCapacity,
        'exitOffHireDate' : row?.element?.exitOffHireDate,
        'onHireDate': row?.element?.onHireDate,
        'dateOfManufacture': row?.element?.dateOfManufacture,
        'oneWay': row?.element?.oneWay,
        'updatedBy':row?.element?.updatedBy
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
  getHistory(id) {

 
    this.router.navigate(['master/audit-logs'], { queryParams: { id: id, collection : "containermaster" ,url : this.router.url} }); 
   
  }
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
    this.commonService.getSTList('containermaster',payload).subscribe((data) => {
      this.yardcfs = data.documents;
      this.dataSource = new MatTableDataSource(data?.documents?.map((s: any,index) => {
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
    this.getContainerData() 
  }

  sortList(array , key){
    return this.sortPipelist.transform(array, key);
   }
  patchAddContainerForm() {
    this.addContainerForm.patchValue({
      creationDate: this.UserDetails?.createdOn,
      creationUserId: this.UserDetails?.createdBy,
      lastUpdatedDate: this.UserDetails?.updatedOn,
      lastupdatedUserId: this.UserDetails?.updatedBy,
    });
  }
  deleteclause(id: any) {
    alert('Item deleted!');
  }
  get f() {
    return this.addContainerForm.controls;
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
    this.getContainerData();
  }

  getPaginationData(type: any) {
    this.fromSize =
      type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;

    let payload = this.commonService.filterList()
    if(payload?.size)payload.size = Number(this.size),
    payload.from = this.fromSize - 1,
    payload.sort = {  "desc" : ['updatedOn'] }
    let mustArray = {};
  
    this.containerno = this.containerno?.trim();
    this.Size = this.Size?.trim();
    this.tankStatus = this.tankStatus?.trim();
    this.yardName = this.yardName?.trim();
    this.updatedBy = this.updatedBy?.trim();
    this.tarWeight = this.tarWeight?.trim();
    this.tankCapacity = this.tankCapacity?.trim();
    this.exitOffHireDate = this.exitOffHireDate?.trim();
    this.onHireDate = this.onHireDate?.trim();
    this.dateOfManufacture = this.dateOfManufacture?.trim();
    if (this.containerno) {
      mustArray['containerNo'] = {
        "$regex" : this.containerno,
        "$options": "i"
    }
    }
    if (this.Size) {
      mustArray['containerSize'] = {
        "$regex" : this.Size,
        "$options": "i"
    }
    }
    if (this.tankStatus) {
      mustArray['tankStatus'] = {
        "$regex" : this.tankStatus,
        "$options": "i"
    }
    }
    if (this.oneWay) {
      mustArray['oneWay'] = this.oneWay === 'true'
    }

    if (this.yardName) {
      mustArray['yardName'] = {
        "$regex" : this.yardName,
        "$options": "i"
    }
    }
    if (this.updatedBy) {
      mustArray['updatedBy'] = {
        "$regex" : this.updatedBy,
        "$options": "i"
    }
    }

    if (this.tarWeight) {
      mustArray['tarWeight'] = {
        "$regex" : this.tarWeight,
        "$options": "i"
    }
    }
    if (this.tankCapacity) {
      mustArray['tankCapacity'] = {
        "$regex" : this.tankCapacity,
        "$options": "i"
    }
    }
    if (this.exitOffHireDate) {
      mustArray['exitOffHireDate']= {
        "$gt" : this.exitOffHireDate.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.exitOffHireDate.substring(0, 10) + 'T23:59:00.000Z'
    }
  }    if (this.onHireDate) {
    mustArray['onHireDate']= {
      "$gt" : this.onHireDate.substring(0, 10) + 'T00:00:00.000Z',
      "$lt" : this.onHireDate.substring(0, 10) + 'T23:59:00.000Z'
  }
}    if (this.dateOfManufacture) {
  mustArray['dateOfManufacture']= {
    "$gt" : this.dateOfManufacture.substring(0, 10) + 'T00:00:00.000Z',
    "$lt" : this.dateOfManufacture.substring(0, 10) + 'T23:59:00.000Z'
}
}
payload.query=mustArray;
        this.commonService.getSTList('containermaster',payload).subscribe((data: any) => {
      this.containerList = data?.documents;
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
  
    this.containerno = this.containerno?.trim();
    this.Size = this.Size?.trim();
    this.tankStatus = this.tankStatus?.trim();
    this.yardName = this.yardName?.trim();
    this.updatedBy =this.updatedBy?.trim();
    this.tarWeight = this.tarWeight?.trim();
    this.tankCapacity = this.tankCapacity?.trim();
    this.exitOffHireDate = this.exitOffHireDate?.trim();
    this.onHireDate = this.onHireDate?.trim();
    this.dateOfManufacture = this.dateOfManufacture?.trim();
    if (this.containerno) {
      mustArray['containerNo'] = {
        "$regex" : this.containerno,
        "$options": "i"
    }
    }
    if (this.Size) {
      mustArray['containerSize'] = {
        "$regex" : this.Size,
        "$options": "i"
    }
    }
    if (this.tankStatus) {
      mustArray['tankStatus'] = {
        "$regex" : this.tankStatus,
        "$options": "i"
    }
    }
    if (this.oneWay) {
      mustArray['oneWay'] = this.oneWay === 'true'
    }

    if (this.yardName) {
      mustArray['yardName'] = {
        "$regex" : this.yardName,
        "$options": "i"
    }
    }
    if (this.updatedBy) {
      mustArray['updatedBy'] = {
        "$regex" : this.updatedBy,
        "$options": "i"
    }
    }

    if (this.tarWeight) {
      mustArray['tarWeight'] = {
        "$regex" : this.tarWeight,
        "$options": "i"
    }
    }
    if (this.tankCapacity) {
      mustArray['tankCapacity'] = {
        "$regex" : this.tankCapacity,
        "$options": "i"
    }
    }
    if (this.exitOffHireDate) {
      mustArray['exitOffHireDate']= {
        "$gt" : this.exitOffHireDate.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.exitOffHireDate.substring(0, 10) + 'T23:59:00.000Z'
    }
  }    if (this.onHireDate) {
    mustArray['onHireDate']= {
      "$gt" : this.onHireDate.substring(0, 10) + 'T00:00:00.000Z',
      "$lt" : this.onHireDate.substring(0, 10) + 'T23:59:00.000Z'
  }
}    if (this.dateOfManufacture) {
  mustArray['dateOfManufacture']= {
    "$gt" : this.dateOfManufacture.substring(0, 10) + 'T00:00:00.000Z',
    "$lt" : this.dateOfManufacture.substring(0, 10) + 'T23:59:00.000Z'
}
}
   
let payload = this.commonService.filterList()
payload.query = mustArray
if(payload?.size)payload.size = Number(this.size),
payload.from = 0,
payload.sort = {  "desc" : ['updatedOn'] }
    this.commonService.getSTList('containermaster',payload)?.subscribe((data: any) => {
      this.containerList = data?.documents?.map((s: any,index) => {
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
  pageNumber = 1;
  pageSize = 10;
  from = 0;
  totalCount = 0;

  onPageChange(event){
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.from = event.pageIndex*event.pageSize ;
    this.getContainerData();
  }

  getContainerData() {
    this.loaderService.showcircle();
    let payload = this.commonService.filterList()
    if(payload?.size)payload.size= this.pageSize,
    payload.from=this.from
    if(payload?.query)payload.query = { }
    if(payload?.sort)payload.sort = {
      "desc" : ["updatedOn"]
   }
  //  if(payload?.size)payload.size = Number(this.size);
  //  if(payload?.from)payload.from = this.page - 1;
   this.commonService.getSTList('containermaster',payload)?.subscribe((res: any) => {
    this.containerList = res?.documents;


      if (res && res?.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1+this.from,
          containerNo: s.containerNo,
          tankStatus: s.tankStatus,
          yardName: s.yardName,
          tarWeight: s.tarWeight,
          tankCapacity: s?.tankCapacity,
          exitOffHireDate: s.exitOffHireDate,
          onHireDate: s.onHireDate,
          dateOfManufacture: s.dateOfManufacture,
          oneWay: s?.oneWay,
          status: s?. status,
          updatedBy:s?.updatedBy
        }));
        // this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1; 
        this.toalLength = res.totalCount;
        this.count = res.documents.length;
        this.loaderService.hidecircle();
      }
   },()=>{
    this.loaderService.hidecircle();
  });
  
  }

  getSystemTypeDropDowns() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      typeCategory:   {
        "$in": ['tankType','tankStatus','containerOperator', 'containerType',]
      },
      "status": true,
    }
    this.commonService
      .getSTList('systemtype',payload)
      ?.subscribe((res: any) => {
        this.tanktypeList = res?.documents?.filter(
          (x) => x.typeCategory === 'tankType'
        );
        this.tankstatusList = res?.documents?.filter(
          (x) => x.typeCategory === 'tankStatus'
        );
        // this.containerOpratorList = res?.documents?.filter(
        //   (x) => x.typeCategory === 'containerOperator'
        // );
        this.containerTypeList = res?.documents?.filter(x => x.typeCategory === "containerType");
      });
  }
  getPartyMasterDropDowns() {
    let payload = this.commonService.filterList()
   if(payload) payload.query = {
      "status": true,
      "customerType.item_text": "Container Owner"
    }
    this.commonService.getSTList("partymaster", payload)?.subscribe((res: any) => {
      this.containerOpratorList = res?.documents; 
    });
  }
  clear() {
    this.containerno = '';
    this.Size = '';
    this.tankStatus = '';
    this.yardName = '';
    this.tarWeight = '';
    this.tankCapacity = '';
    this.exitOffHireDate = '';
    this.onHireDate = '';
    this.dateOfManufacture = '';
    this.oneWay = '';
    this.updatedBy='';
    this.getContainerData();
  }

  open(content, containerMaster?: any, show?: string) {
    this.show = show;
    this.isEdit = false;
  
    // Reset the form state when opening (for a new entry)
    this.addContainerForm.reset();
  
    if (containerMaster) {
      // Edit mode
      this.isEdit = true;
      this.containerIdToUpdate = containerMaster?.containermasterId;
  
      this.addContainerForm.patchValue({
        status: containerMaster?.status,
        containerNo: containerMaster?.containerNo,
        containerType: containerMaster?.containerTypeId,
        tankStatus: this.tankstatusList.find((x) => x.typeName === containerMaster?.tankStatus)?.systemtypeId,
        tankType: this.tanktypeList.find((x) => x.typeName === containerMaster?.tankType)?.systemtypeId,
        yard: containerMaster?.yard,
        tarWeight: containerMaster?.tarWeight,
        tankCapacity: containerMaster?.tankCapacity,
        exitOffHireDate: containerMaster?.exitOffHireDate,
        onHireDate: containerMaster?.onHireDate,
        dateOfManufacture: containerMaster?.dateOfManufacture,
        loadCapacity: containerMaster?.loadCapacity,
        oneWay: containerMaster?.oneWay || false,
        containerOperator: containerMaster?.containerOperator || '',
        pickLocation: containerMaster?.pickLocation || '',
        dropLocation: containerMaster?.dropLocation || '',
        soc: containerMaster?.soc,
        maxGrossWeight: containerMaster?.maxGrossWeight,
        maxPayload: containerMaster?.maxPayload,
        baffles: containerMaster?.baffles || false,
        remarks: containerMaster?.remarks,
        creationDate: containerMaster?.creationDate,
        creationUserId: containerMaster?.creationUserId,
        lastUpdatedDate: containerMaster?.lastUpdatedDate,
        lastupdatedUserId: containerMaster?.lastupdatedUserId,
        orgId: this.commonFunctions.getAgentDetails()?.orgId,
      });
  
      // Conditionally disable the form if in view mode (when show === 'show')
      if (show === 'show') {
        this.addContainerForm.disable();
      } else {
        this.addContainerForm.enable();
      }
  
      // Additional logic for edit mode
      this.containerStatus = containerMaster.containerStatus || '';
      this.isStatus = containerMaster.containerStatusId || false;
      this.chageSoc();
      this.clickOnOneWay();
    } else {
      // New entry (add mode), ensure form is enabled
      this.addContainerForm.enable();
    }
  
    // Open the modal dialog
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }

  onSave() {
    this.containerIdToUpdate = null;
    this.addContainerForm.reset();
    // this.addContainerForm.controls['soc'].patchValue(true);
    this.patchAddContainerForm();
    this.submitted = false;
    this.modalService.dismissAll();
    return null;
  }
  getLocation() { 
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      masterType:   {
        "$in": ['YARD','CFS']
      },
      "status": true
    }
    this.commonService.getSTList("location", payload)?.subscribe((res: any) => {
      this.yardList = res?.documents;
    });
  }
  containerMaster() {
    this.submitted = true;
    if (this.addContainerForm.controls['soc'].value === false) {
      this.addContainerForm.get('maxGrossWeight').setErrors(null);
      this.addContainerForm.get('maxPayload').setErrors(null);
      this.addContainerForm.updateValueAndValidity();
    }
   
    if (this.addContainerForm.invalid) {
      return;
    }
    let body = {
      tenantId: this.UserDetails.tenantId, 
      orgId: this.commonFunctions.getAgentDetails().orgId,
      containerNo: this.addContainerForm.value.containerNo,
      cargoNo: '12',
      cargoTypeName: 'test',
      containerTypeId: this.addContainerForm.value.containerType,
      containerType: this.containerTypeList.filter((x) => x?.systemtypeId === this.addContainerForm.value.containerType)[0]?.typeName,
      // containerSize: this.addContainerForm.value.containerSize,
      tankStatusId : this.addContainerForm.value.tankStatus,
      tankStatus: this.tankstatusList.filter(
        (x) => x.systemtypeId === this.addContainerForm.value.tankStatus
      )[0]?.typeName,
      yardNamId : this.addContainerForm.value.yard,
      yard : this.addContainerForm.value.yard,
      yardName : this.yardList.filter(e1=>e1.locationId === this.addContainerForm.value.yard)[0].locationName,

      tankType: this.tanktypeList.filter(
        (x) => x.systemtypeId === this.addContainerForm.value.tankType
      )[0]?.typeName,
      tarWeight: this.addContainerForm.value.tarWeight,
      tankCapacity: this.addContainerForm.value.tankCapacity,
      exitOffHireDate: this.addContainerForm.value.exitOffHireDate || new Date(),
      onHireDate: this.addContainerForm.value.onHireDate || new Date(),
      dateOfManufacture: this.addContainerForm.value.dateOfManufacture || new Date(),
      oneWay: this.addContainerForm.value.oneWay || false,
      loadCapacity: this.addContainerForm.value.loadCapacity,
      containerOperator: this.addContainerForm.value.containerOperator,
      containerOperatorName:this.containerOpratorList.filter((x) => x?.partymasterId === this.addContainerForm.value.containerOperator)[0]?.name,
      pickLocation: this.addContainerForm.value.pickLocation,
      pickLocationName:this.yardList.filter((x) => x?.locationId === this.addContainerForm.value.pickLocation)[0]?.locationName,
      dropLocation: this.addContainerForm.value.dropLocation,
      dropLocationName: this.yardList.filter((x) => x?.locationId === this.addContainerForm.value.dropLocation)[0]?.locationName,
      soc: this.addContainerForm.value.soc,
      maxGrossWeight: this.addContainerForm.value.maxGrossWeight,
      maxPayload: this.addContainerForm.value.maxPayload,
      baffles: this.addContainerForm.value.baffles || false,
      remarks: this.addContainerForm.value.remarks,
      status: true,
      containerStatus: "Available",
      containerStatusId: true,
      date : new Date()
      
    };

    if (!this.containerIdToUpdate) {
      const statusData = {
        ...body,
      containerStatus:'Available',
      containerStatusId: true

      } 
      // const data = [statusData];

      this.commonService.addToST('containermaster',statusData).subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Added Successfully', '');
            this.onSave();
            this.getContainerData();
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error', error?.error?.error?.message , '');

        }
      );
    } else {
      const dataWithUpdateID = {
        ...body,
        containermasterId: this.containerIdToUpdate,
        containerStatus: this.containerStatus,
        containerStatusId: this.isStatus,
        doDate : null
      };
      // const data = [dataWithUpdateID];
      this.commonService
      .UpdateToST(`containermaster/${dataWithUpdateID.containermasterId}`,dataWithUpdateID).subscribe(
        (result: any) => {
          if (result) {
            this.notification.create('success', 'Updated Successfully', '');
            this.onSave();
            this.getContainerData();
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error', error?.error?.error?.message , '');
        }
      );
    }
  }

  chageSoc(e?) {
    if (this.addContainerForm.value.soc) {
      this.soc = true;
      this.addContainerForm
        .get('maxGrossWeight')
        .setValidators([Validators.required]);
      this.addContainerForm
        .get('maxPayload')
        .setValidators([Validators.required]);
      this.addContainerForm.get('maxGrossWeight').setErrors({ required: true });
      this.addContainerForm.get('maxPayload').setErrors({ required: true });
      this.addContainerForm.updateValueAndValidity();
    } else {
      this.soc = false;
      this.addContainerForm
        .get('maxGrossWeight')
        .clearValidators();
      this.addContainerForm
        .get('maxPayload')
        .clearValidators();
      this.addContainerForm.get('maxGrossWeight').setErrors(null);
      this.addContainerForm.get('maxPayload').setErrors(null);
      this.addContainerForm.updateValueAndValidity();
    }
  }
  clickOnOneWay(event?) {
    if (this.addContainerForm.value.oneWay) {
      this.oneWay1 = true;
      this.addContainerForm.get('containerOperator').setValidators([Validators.required]);
      this.addContainerForm.get('pickLocation').setValidators([Validators.required]);
      this.addContainerForm.get('dropLocation').setValidators([Validators.required]);
      this.addContainerForm.get('containerOperator').setErrors({ required: true });
      this.addContainerForm.get('pickLocation').setErrors({ required: true });
      this.addContainerForm.get('dropLocation').setErrors({ required: true });
      this.addContainerForm.updateValueAndValidity();
    } else {
      this.oneWay1 = false;
      this.addContainerForm.get('containerOperator').setErrors(null);
      this.addContainerForm.get('pickLocation').setErrors(null);
      this.addContainerForm.get('dropLocation').setErrors(null);
      this.addContainerForm.updateValueAndValidity();
    } 
  }

  delete(deletecontainer, id) {
    this.modalService
      .open(deletecontainer, {
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
            let data =`containermaster/${id}`
            this.commonService.deleteST(data).subscribe((res: any) => {
              if (res) {
                this.notification.create('success', 'Deleted Successfully', '');
                this.clear();
              }
            });
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
  changeStatus(data) {
    this.commonService
      .UpdateToST(`containermaster/${data.containermasterId}`,{ ...data, status: !data?.status })
      .subscribe(
        (res: any) => {
          if (res) {
            this.notification.create(
              'success',
              'Status Updated Successfully',
              ''
            );
            this.clear();
            setTimeout(() => {
              this.getContainerData();
            }, 1500);
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error',error?.error?.error?.message, '');
        }
      );
  }

 


  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.containerList.map((row: any) => {
      storeEnquiryData.push({
        'Container No': row.containerNo,
        'Container Size': row.containerSize,
        'Tank Status': row.tankStatus,
        'Tank Type': row.tankType,
        'TARE Weight': row.tarWeight,
        'Tank Capacity': row.tankCapacity,
        'Exit / Off hire Date': row.exitOffHireDate,
        'On hire Date': row.onHireDate,
        'Date Of Manufacture': row.dateOfManufacture,
        'One Way': row.oneWay,
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

    const fileName = 'container-master.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  openPDF() {
    const prepare=[];
    this.containerList.forEach(e=>{
      let tempObj =[];
      tempObj.push(e.containerNo);
      tempObj.push(e.containerSize);
      tempObj.push(e.tankStatus);
      tempObj.push(e.yardName);
      tempObj.push(e.tarWeight);
      tempObj.push(e.tankCapacity);
      tempObj.push(this.datepipe.transform(e.exitOffHireDate,"dd-MM-yyyy"));
      tempObj.push(this.datepipe.transform(e.onHireDate,"dd-MM-yyyy"));
      tempObj.push(this.datepipe.transform(e.dateOfManufacture,"dd-MM-yyyy"));
      tempObj.push(e.updatedBy);
      tempObj.push(e.oneWay);
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [397, 310]);
    autoTable(doc,{
        head: [['Container No','Container Size','Tank Status','Yard','TARE Weight','Tank Capacity','Exit / Off hire Date','On hire Date','Date Of Manufacture','Last Updated By','One Way']],
        body: prepare,
        didDrawCell: (data) => {
          // Draw border lines for each cell
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'S');
      }
    });
    doc.save('container-master' + '.pdf');
  }
}
