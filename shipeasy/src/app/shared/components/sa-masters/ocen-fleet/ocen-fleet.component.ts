import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ModalDismissReasons, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from "xlsx";
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CountryData } from 'src/app/models/city-master';
import { uom } from 'src/app/models/uom';
import { Vessel } from 'src/app/models/vessel-master';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
import { LoaderService } from 'src/app/services/loader.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';

import { MastersSortPipe } from 'src/app/shared/util/mastersort';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { CommonService } from 'src/app/services/common/common.service';

@Component({
  selector: 'app-ocen-fleet',
  templateUrl: './ocen-fleet.component.html',
  styleUrls: ['./ocen-fleet.component.scss']
})
export class OcenFleetComponent implements OnInit {
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
  vesselName: any;
  callSign: any;
  country: any;
  chart:any
  imoNo: any;
  mmsino:any
  TRAMP_VESSEL_ID: any;
  VESSEL_OWNER: any;
  OWNERSHIP_FROM_DATE: any;
  NATIONALITY: any;
  SHIP_REGISTRATION_NO: any;
  REGISTRATION_VALIDITY: any;
  VESSEL_TYPE: any;
  VESSEL_CATEGORY: any;
  VESSEL_SUBTYPE: any;
  GRT: any;
  NRT: any;
  BULBOUS_BOW: any;
  MV_MT_OTHERS: any;
  ISPS_COMPLIANCE: any;
  IMO_NO: any;
  CREATED_BY: any;
  CREATED_DATE: any;
  MODIFIED_BY: any;
  MODIFIED_DATE: any;
  TRAMP_VESSEL_NAME: any;
  TRAMP_VESSEL_ABBR: any;
  TRAMP_VESSEL_ID_DUMMY: any;
  REDUCED_GRT: any;
  DWT: any;
  VESSEL_LOA: any;
  VESSEL_LBP: any;
  VESSEL_BEAM: any;
  GRAIN: any;
  BALE: any;
  GEAR: any;
  GRAIN_UOM: any;
  BALE_UOM: any;
  VESSEL_BUILT_DATE: any;
  VESSEL_OPERATOR: any;
  VESSEL_PRINCIPAL: any;
  VESSEL_EMAIL_ID: any;
  VENDOR_PI_CLUB: any;
  SBT_TON: any;
  TRAMP_VESSEL_CODE: any;
  NO_OF_HATCH: any;
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

  email:any
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort1!: MatSort;
  displayedColumns =[
    '#', 
    'action',
    'vesselCode',
    'vesselName',
    'countryName',
    'callSign',
    'imoNo',
    'createdBy',
    'createdOn',
    'updatedBy',
    'updatedOn',
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
    private http: HttpClient
  ) { 
    this.formBuild();
  }
  formBuild() {
    this.addVesselForm = this.fb.group({
      vesselCode: [''],
      vesselName: ['', Validators.required],
      internalVesselCode: [''],
      deActivateVessel: [true],
      countryId: [''],
      vesselType: [''],
      vesselSubType: [''],
      chartName: [''],
      portOfRegistryCode: [''],
      portOfRegistryName: [''],
      regNo: [''],
      grt: [''],
      nrt: [''],
      callSign: [''],
      classSocietyNo: [''],
      summerDeadWt: [''],
      preferredBerthSide: [''],
      tropicalMaxDraft: [''],
      tropicalDeadWt: [''],
      summerMaxWt: [''],
      reasonPrefBerth: [''],
      loa: [''],
      lbp: [''],
      beam: [''],
      gearedVessel: [false],
      reducedGt: [''],
      whetherSBT: [false],
      generalRemark: [''],
      imoNo: ['', Validators.required],
      mmsino:['', Validators.required],

      vesselBuildDate: [],
      vesselBuildPlace: [''],
      vesselModifiedDate: [],
      vesselHeight: [],
      hatchCoverType: [''],
      noofHatchCover: [''],
      noofHatches: [''],
      noofHolds: [''],
      perBodyinBlst: [''],
      engineType: [''],
      noofEngine: [''],
      enginePower: [''],
      propulsionType: [''],
      noofPropellers: [''],
      maxSpeed: [''],
      cruisingSpeed: [''],
      thrustersUsed: [false],
      noofBowThrusters: [''],
      bowThrustersPower: [''],
      cellularVessel: [false],
      bulbousBow: [false],
      bowAndManifoldDist: [''],
      noofSternThrusters: [''],
      sternThrusterPower: [''],


      totalTUECapacity: [''],
      totaltwentyFtCapacity: [''],
      totalfortyFtCapacity: [''],
      noofReferPlugPoint: [''],
      voltageOfReferPlugPoint: [''],
      typeofReferPlugPoint: [''],

      cranes: this.fb.array([]),


      exVesselName: [''],
      exCallSign: [''],
      govtVessel: [false],
      owner: [''],
      localVesselAgent: [''],
      containerPermission: [false],
      localAgtContact: [''],
      hullAndMachineryIns: [''],
      PIClubName: [''],
      PIClubAddress: [''],
      PITelephoneNo: [''],
      PIFaxNo: [''],
      PIEmail: [''],
      localCorrespondantName: [''],
      localTelNo: [''],
      localTelexNo: [''],
      localFaxNo: [''],
      localEmail: [''],
      satteliteId: [''],
      satcomId: [''],
      telephoneNo: [''],
      faxNo: [''],
      vesselCommEmail: [''],


      status: [true],
    });
    let vesselCodeSample = new Date().getTime().toString()
    this.addVesselForm.get('vesselCode').setValue(vesselCodeSample.slice(7))
    
  }
  ngOnInit(): void {
    this.getData();
    this.getCountry();
    this.getShipingLine();
    this.getUOMCategory();
    this.getVesselType();
    this.getAllVesselCategoriesTypes();
    this.cognito.getUserDatails().subscribe((resp) => {
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
    this.commonService?.getSTList('vessel', payload)?.subscribe((data) => {
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
  addCrane(data) {
    this.cranes.push(this.newCrane(data))
  }
  newCrane(data) {
    if (data) {
      return this.fb.group({
        craneNo: data.craneNo,
        capacity: data.capacity,
        position: data.position,
        outreach: data.outreach,
        remarks: data.remarks
      })
    }
    else {
      return this.fb.group({
        craneNo: [''],
        capacity: [''],
        position: [''],
        outreach: [''],
        remarks: ['']
      })
    }
  }

  removeCrane(i: number) {
    this.cranes.removeAt(i);

  }
  generateArrayforType(typeArray, name) {
    let type = '';
    if (name === 'Vessel Category') type = 'vesselCategory';

    if (name === 'Vessel Subtype') type = 'vesselSubtype';
    var array = [];
    typeArray.forEach((e) => {
      if (e.typeCategory === name || e.typeCategory === type) {
        array.push(e);
      }
    });
    type = '';
    return array;
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
    this.vesselCode = this.vesselCode?.trim();
    this.vesselName = this.vesselName?.trim();
    this.country = this.country?.trim();
    this.callSign = this.callSign?.trim();
    this.imoNo = this.imoNo?.trim();
    this.CREATED_BY = this.CREATED_BY?.trim();
    this.CREATED_DATE = this.CREATED_DATE?.trim();
    this.MODIFIED_BY = this.MODIFIED_BY?.trim();
    this.MODIFIED_DATE = this.MODIFIED_DATE?.trim();
    this.IN_ACTIVE_FLAG = this.IN_ACTIVE_FLAG?.trim();
    if (this.vesselCode) {
      mustArray['vesselCode'] = {
        "$regex" : this.vesselCode,
        "$options": "i"
    }
    }
    
    if (this.vesselName) {
      mustArray['vesselName'] = {
        "$regex" : this.vesselName,
        "$options": "i"
    }
    }
    if(this.chart){
      mustArray['chartName']={
        "$regex" : this.chart,
        "$options":"i"     
    }
    }
    if (this.country) {
      mustArray['countryName'] = {
        "$regex" : this.country,
        "$options": "i"
    }
    }
    if (this.callSign) {
      mustArray['callSign'] = {
        "$regex" : this.callSign,
        "$options": "i"
    }
    }
    if (this.imoNo) {
      mustArray['imoNo'] = {
        "$regex" : this.imoNo,
        "$options": "i"
    }
    }
    if (this.CREATED_BY) {
      mustArray['createdBy'] = {
        "$regex" : this.CREATED_BY,
        "$options": "i"
    }
    }
    if (this.CREATED_DATE) {
      mustArray['createdOn']= {
        "$gt" : this.CREATED_DATE.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.CREATED_DATE.substring(0, 10) + 'T23:59:00.000Z'
    }
    }
    if (this.MODIFIED_BY) {
      mustArray['updatedBy'] = {
        "$regex" : this.MODIFIED_BY,
        "$options": "i"
    }
    }
    if (this.MODIFIED_DATE) {
      mustArray['updatedOn']= {
        "$gt" : this.MODIFIED_DATE.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.MODIFIED_DATE.substring(0, 10) + 'T23:59:00.000Z'
    }
    }
    if (this.IN_ACTIVE_FLAG) {
      mustArray['status'] = this.IN_ACTIVE_FLAG === 'true' ? true : false
    }

    payload.query = mustArray
  //  payload.size = Number(this.size)
  //  payload.from = 0,
    this.commonService.getSTList('vessel', payload).subscribe((res: any) => {
      this.vesseldata = res.documents;

      if (res && res?.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1,
          vesselCode: s.vesselCode,
          vesselName: s.vesselName,
          countryName: s.countryName,
          callSign: s.callSign,
          imoNo: s.imoNo,
          createdBy: s.createdBy,
          createdOn: s.createdOn,
          updatedBy: s.updatedBy,
          updatedOn: s.updatedOn,
          status: s.status,
          
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


  getAllVesselCategoriesTypes() {
    let payload = this.commonService.filterList()
    payload.query = {  typeCategory:   {
      "$in": ['vesselCategory','vesselSubtype',]
    },
    "status": true}
    this.commonService.getSTList('systemtype', payload).subscribe((data) => {
      this.systemData = data.documents;
      this.vesselCategories = this.generateArrayforType(
        this.systemData,
         'vesselCategory'
      );
      this.vesselSubtypes = this.generateArrayforType(
        this.systemData,
         'vesselSubtype'
      );
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
    this.vesselCode = this.vesselCode?.trim();
    this.vesselName = this.vesselName?.trim();
    this.country = this.country?.trim();
    this.callSign = this.callSign?.trim();
    this.imoNo = this.imoNo?.trim();
    this.CREATED_BY = this.CREATED_BY?.trim();
    this.CREATED_DATE = this.CREATED_DATE?.trim();
    this.MODIFIED_BY = this.MODIFIED_BY?.trim();
    this.MODIFIED_DATE = this.MODIFIED_DATE?.trim();
    this.IN_ACTIVE_FLAG = this.IN_ACTIVE_FLAG?.trim();
    if (this.vesselCode) {
      mustArray['vesselCode'] = {
        "$regex" : this.vesselCode,
        "$options": "i"
    }
    }
    
    if (this.vesselName) {
      mustArray['vesselName'] = {
        "$regex" : this.vesselName,
        "$options": "i"
    }
    }
    if(this.chart){
      mustArray['chartName']={
        "$regex" : this.chart,
        "$options":"i"     
    }
    }
    if (this.country) {
      mustArray['countryName'] = {
        "$regex" : this.country,
        "$options": "i"
    }
    }
    if (this.callSign) {
      mustArray['callSign'] = {
        "$regex" : this.callSign,
        "$options": "i"
    }
    }
    if (this.imoNo) {
      mustArray['imoNo'] = {
        "$regex" : this.imoNo,
        "$options": "i"
    }
    }
    if (this.CREATED_BY) {
      mustArray['createdBy'] = {
        "$regex" : this.CREATED_BY,
        "$options": "i"
    }
    }
    if (this.CREATED_DATE) {
      mustArray['createdOn']= {
        "$gt" : this.CREATED_DATE.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.CREATED_DATE.substring(0, 10) + 'T23:59:00.000Z'
    }
    }
    if (this.MODIFIED_BY) {
      mustArray['updatedBy'] = {
        "$regex" : this.MODIFIED_BY,
        "$options": "i"
    }
    }
    if (this.MODIFIED_DATE) {
      mustArray['updatedOn']= {
        "$gt" : this.MODIFIED_DATE.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.MODIFIED_DATE.substring(0, 10) + 'T23:59:00.000Z'
    }
    }
    if (this.IN_ACTIVE_FLAG) {
      mustArray['status'] = this.IN_ACTIVE_FLAG === 'true' ? true : false
    }

    payload.query = mustArray
   payload.size = Number(this.size)
   payload.from = this.fromSize -1,
    this.commonService.getSTList('vessel', payload).subscribe((data) => {
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
    this.vesselCode = this.vesselCode?.trim();
    this.vesselName = this.vesselName?.trim();
    this.country = this.country?.trim();
    this.callSign = this.callSign?.trim();
    this.imoNo = this.imoNo?.trim();
    this.mmsino = this.mmsino?.trim();
    this.CREATED_BY = this.CREATED_BY?.trim();
    this.CREATED_DATE = this.CREATED_DATE?.trim();
    this.MODIFIED_BY = this.MODIFIED_BY?.trim();
    this.MODIFIED_DATE = this.MODIFIED_DATE?.trim();
    this.IN_ACTIVE_FLAG = this.IN_ACTIVE_FLAG?.trim();
    if (this.vesselCode) {
      mustArray['vesselCode'] = {
        "$regex" : this.vesselCode,
        "$options": "i"
    }
    }
    
    if (this.vesselName) {
      mustArray['vesselName'] = {
        "$regex" : this.vesselName,
        "$options": "i"
    }
    }
    if (this.country) {
      mustArray['countryName'] = {
        "$regex" : this.country,
        "$options": "i"
    }
    }
    if (this.callSign) {
      mustArray['callSign'] = {
        "$regex" : this.callSign,
        "$options": "i"
    }
    }
    if (this.imoNo) {
      mustArray['imoNo'] = {
        "$regex" : this.imoNo,
        "$options": "i"
    }
    }
    if (this.mmsino) {
      mustArray['mmsino'] = {
        "$regex" : this.mmsino,
        "$options": "i"
    }
    }
    if (this.CREATED_BY) {
      mustArray['createdBy'] = {
        "$regex" : this.CREATED_BY,
        "$options": "i"
    }
    }
    if (this.CREATED_DATE) {
      mustArray['createdOn']= {
        "$gt" : this.CREATED_DATE.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.CREATED_DATE.substring(0, 10) + 'T23:59:00.000Z'
    }
    }
    if (this.MODIFIED_BY) {
      mustArray['updatedBy'] = {
        "$regex" : this.MODIFIED_BY,
        "$options": "i"
    }
    }
    if (this.MODIFIED_DATE) {
      mustArray['updatedOn']= {
        "$gt" : this.MODIFIED_DATE.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.MODIFIED_DATE.substring(0, 10) + 'T23:59:00.000Z'
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
    this.commonService.getSTList('vessel', payload).subscribe((data) => {
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
    this.vesselCode = ""
    this.vesselName = ""
    this.country = ""
    this.callSign = ""
    this.imoNo = "";
    this.mmsino="";
    this.TRAMP_VESSEL_ID = '';
    this.VESSEL_OWNER = '';
    this.OWNERSHIP_FROM_DATE = '';
    this.NATIONALITY = '';
    this.SHIP_REGISTRATION_NO = '';
    this.REGISTRATION_VALIDITY = '';
    this.VESSEL_TYPE = '';
    this.VESSEL_CATEGORY = '';
    this.VESSEL_SUBTYPE = '';
    this.GRT = '';
    this.NRT = '';
    this.BULBOUS_BOW = '';
    this.MV_MT_OTHERS = '';
    this.ISPS_COMPLIANCE = '';
    this.IMO_NO = '';
    this.CREATED_BY = '';
    this.CREATED_DATE = '';
    this.MODIFIED_BY = '';
    this.MODIFIED_DATE = '';
    this.TRAMP_VESSEL_NAME = '';
    this.TRAMP_VESSEL_ABBR = '';
    this.TRAMP_VESSEL_ID_DUMMY = '';
    this.REDUCED_GRT = '';
    this.DWT = '';
    this.VESSEL_LOA = '';
    this.VESSEL_LBP = '';
    this.VESSEL_BEAM = '';
    this.GRAIN = '';
    this.BALE = '';
    this.GEAR = '';
    this.GRAIN_UOM = '';
    this.BALE_UOM = '';
    this.VESSEL_BUILT_DATE = '';
    this.VESSEL_OPERATOR = '';
    this.VESSEL_PRINCIPAL = '';
    this.VESSEL_EMAIL_ID = '';
    this.VENDOR_PI_CLUB = '';
    this.SBT_TON = '';
    this.TRAMP_VESSEL_CODE = '';
    this.NO_OF_HATCH = '';
    this.IN_ACTIVE_FLAG = '';
    this.getData();
  }

  getCountry() {
    let payload = this.commonService.filterList()
    payload.query = {status: true}
    this.commonService.getSTList('country', payload).subscribe((res: any) => {
      this.countryList = res.documents;
    });
  }

  getShipingLine(){
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true,
      "ShipmentTypeName": 'Ocean',
    }
 
    this.commonService
      .getSTList('shippingline', payload)
      ?.subscribe((res: any) => {
      this.shippinglineData = res?.documents
      });
  
  }

  getUOMCategory() {
    let payload = this.commonService.filterList()
    payload.query = {status: true }
    this.commonService.getSTList('uom', payload).subscribe((res: any) => {
      this.uomcategoryList = res.documents;
    });
  }

  getVesselType() {
    let payload = this.commonService.filterList()
    payload.query = {  typeCategory:   {
      "$in": ['vesselType','vesselSubtype',]
    },
    "status": true}
    this.commonService.getSTList('systemtype', payload).subscribe((res: any) => {
      this.vesselTypeList = res?.documents?.filter(x => x.typeCategory === "vesselType");
      this.vesselSubTypeList = res?.documents?.filter(x => x.typeCategory === "vesselSubtype");
    });
  }
  show: string
  open(content, vessel?: any, show?: string) {
    this.show = show; // Assign the show parameter

    if (vessel) {
      this.vesselIdToUpdate = show === 'show' ? null : vessel.vesselId;
      this.addVesselForm.patchValue({
        vesselCode: vessel.vesselCode,
        vesselName: vessel.vesselName,
        internalVesselCode: vessel.internalVesselCode,
        deActivateVessel: vessel.deActivateVessel,
        countryId: vessel.countryId,
        vesselType: vessel.vesselType,
        vesselSubType: vessel.vesselSubType?.vesselSubTypeName,
        chartName: vessel.chartId,
        portOfRegistryCode: vessel.portOfRegistryCode,
        portOfRegistryName: vessel.portOfRegistryName,
        regNo: vessel.regNo,
        grt: vessel.grt,
        nrt: vessel.nrt,
        callSign: vessel.callSign,
        classSocietyNo: vessel.classSocietyNo,
        summerDeadWt: vessel.summerDeadWt,
        preferredBerthSide: vessel.preferredBerthSide,
        tropicalMaxDraft: vessel.tropicalMaxDraft,
        tropicalDeadWt: vessel.tropicalDeadWt,
        summerMaxWt: vessel.summerMaxWt,
        reasonPrefBerth: vessel.reasonPrefBerth,
        loa: vessel.loa,
        lbp: vessel.lbp,
        beam: vessel.beam,
        gearedVessel: vessel.gearedVessel,
        reducedGt: vessel.reducedGt,
        whetherSBT: vessel.whetherSBT,
        generalRemark: vessel.generalRemark,
        imoNo: vessel.imoNo,
        mmsino: vessel.mmsino,
        vesselBuildDate: vessel.vesselBuildDate,
        vesselBuildPlace: vessel.vesselBuildPlace,
        vesselModifiedDate: vessel.vesselModifiedDate,
        vesselHeight: vessel.vesselHeight,
        hatchCoverType: vessel.hatchCoverType,
        noofHatchCover: vessel.noofHatchCover,
        noofHatches: vessel.noofHatches,
        noofHolds: vessel.noofHolds,
        perBodyinBlst: vessel.perBodyinBlst,
        engineType: vessel.engineType,
        noofEngine: vessel.noofEngine,
        enginePower: vessel.enginePower,
        propulsionType: vessel.propulsionType,
        noofPropellers: vessel.noofPropellers,
        maxSpeed: vessel.maxSpeed,
        cruisingSpeed: vessel.cruisingSpeed,
        thrustersUsed: vessel.thrustersUsed,
        noofBowThrusters: vessel.noofBowThrusters,
        bowThrustersPower: vessel.bowThrustersPower,
        cellularVessel: vessel.cellularVessel,
        bulbousBow: vessel.bulbousBow,
        bowAndManifoldDist: vessel.bowAndManifoldDist,
        noofSternThrusters: vessel.noofSternThrusters,
        sternThrusterPower: vessel.sternThrusterPower,
        totalTUECapacity: vessel.totalTUECapacity,
        totaltwentyFtCapacity: vessel.totaltwentyFtCapacity,
        totalfortyFtCapacity: vessel.totalfortyFtCapacity,
        noofReferPlugPoint: vessel.noofReferPlugPoint,
        voltageOfReferPlugPoint: vessel.voltageOfReferPlugPoint,
        typeofReferPlugPoint: vessel.typeofReferPlugPoint,
        exVesselName: vessel.exVesselName,
        exCallSign: vessel.exCallSign,
        govtVessel: vessel.govtVessel,
        owner: vessel.owner,
        localVesselAgent: vessel.localVesselAgent,
        containerPermission: vessel.containerPermission,
        localAgtContact: vessel.localAgtContact,
        hullAndMachineryIns: vessel.hullAndMachineryIns,
        PIClubName: vessel.PIClubName,
        PIClubAddress: vessel.PIClubAddress,
        PITelephoneNo: vessel.PITelephoneNo,
        PIFaxNo: vessel.PIFaxNo,
        PIEmail: vessel.PIEmail,
        localCorrespondantName: vessel.localCorrespondantName,
        localTelNo: vessel.localTelNo,
        localTelexNo: vessel.localTelexNo,
        localFaxNo: vessel.localFaxNo,
        localEmail: vessel.localEmail,
        satteliteId: vessel.satteliteId,
        satcomId: vessel.satcomId,
        telephoneNo: vessel.telephoneNo,
        faxNo: vessel.faxNo,
        vesselCommEmail: vessel.vesselCommEmail,
        status: vessel.status,
      });

      if (vessel.certificates) {
        this.certificateData = vessel.certificates;
      }

      if (vessel.cranes) {
        vessel.cranes.forEach((e) => {
          this.addCrane(e);
        });
      }

      show === 'show' ? this.addVesselForm.disable() : this.addVesselForm.enable();
    }

    this.modalReference = this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'xl',
    });
  }

  // vesselMasters() {
  //   this.submitted = true;
  //   if (this.addVesselForm.invalid || !this.addVesselForm.controls['deActivateVessel'].value) {
  //     this.notification.create('error', 'Please fill reqired fields', '');
  //     return;
  //   }
  //   let duplicate = 0
  //   if(duplicate < 1){
  //     let newdata = this.addVesselForm.value;
  //     newdata.vesselSubType = {
  //       "vesselSubTypeName": this.addVesselForm.value.vesselSubType,
  //       "vesselSubTypeId": ""
  //     },
  //     newdata.tenantId =this.tenantId;
  //     newdata['countryName'] =this.countryList.find(country=>country?.countryId===this.addVesselForm.value?.countryId)?.countryName;
  //     newdata['chartId']=this.addVesselForm?.value?.chartName
  //     newdata['chartName']= this.shippinglineData.find(shipping => shipping?.shippinglineId === this.addVesselForm?.value?.chartName)?.name

  //     if (!this.vesselIdToUpdate) {
  //       this.commonService.addToST('vessel',newdata).subscribe(
  //         (res: any) => {
  //           if (res) {
  //             this.notification.create('success', 'Added Successfully', '');
  //             this.onSave();
  //             var myInterval = setInterval(() => {
  //               this.getData();
  //               clearInterval(myInterval);
  //             }, 1000);
  //           }
  //         },
  //         (error) => {
  //           this.onSave();
  //           this.notification.create('error', error?.error?.error?.message , '');
  //         }
  //       );
  //     } else {
  //       let ui = { ...newdata, vesselId: this.vesselIdToUpdate };
  //       this.commonService.UpdateToST(`vessel/${ui.vesselId}`,ui).subscribe(
  //         (res: any) => {
  //           if (res) {
  //             this.notification.create('success', 'Updated Successfully', '');
  //             this.onSave();
  //             var myInterval = setInterval(() => {
  //               this.getData();
  //               clearInterval(myInterval);
  //             }, 1000);
  //           }
  //         },
  //         (error) => {
  //           this.onSave();
  //           this.notification.create('error', error?.error?.error?.message , '');
  //         }
  //       );
  //     }
  //   }
   
  // }

  vesselMasters() {
    this.submitted = true;
  
    if (this.addVesselForm.invalid || !this.addVesselForm.controls['deActivateVessel'].value) {
      this.notification.create('error', 'Please fill required fields', '');
      return;
    }
  
    let newdata = this.addVesselForm.value;
    let duplicate = this.vesseldata.some((vessel) => 
      vessel.vesselName.toLowerCase() === newdata.vesselName.toLowerCase() && 
      vessel.vesselId !== this.vesselIdToUpdate
    );
  
    if (duplicate) {
      this.notification.create('error', 'Vessel already exists', '');
      return;
    }
    
    newdata.vesselSubType = {
      "vesselSubTypeName": this.addVesselForm.value.vesselSubType,
      "vesselSubTypeId": ""
    };
    newdata.tenantId = this.tenantId;
    newdata['countryName'] = this.countryList.find(country => country?.countryId === this.addVesselForm.value?.countryId)?.countryName;
    newdata['chartId'] = this.addVesselForm?.value?.chartName;
    newdata['chartName'] = this.shippinglineData.find(shipping => shipping?.shippinglineId === this.addVesselForm?.value?.chartName)?.name;
  
    if (!this.vesselIdToUpdate) {
      this.commonService.addToST('vessel', newdata).subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Added Successfully', '');
            this.onSave();
            var myInterval = setInterval(() => {
              this.getData();
              clearInterval(myInterval);
            }, 500);
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
    } else {
      let ui = { ...newdata, vesselId: this.vesselIdToUpdate };
      this.commonService.UpdateToST(`vessel/${ui.vesselId}`, ui).subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Updated Successfully', '');
            this.onSave();
            var myInterval = setInterval(() => {
              this.getData();
              clearInterval(myInterval);
            }, 500);
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
    }
  }

  changeStatus(data, i) {
    this.commonService.UpdateToST(`vessel/${data.vesselId}`,{ ...data, status: !data?.status })
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

  delete(deletevessel, id) {
    this.modalService
      .open(deletevessel, {
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
            let data = 'vesselId' +  id.vesselId
            
            this.commonService.deleteST(data).subscribe((res: any) => {
              if (res) {
                this.notification.create('success', 'Deleted Successfully', '');
                this.getData();
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

  onSave() {
    this.submitted = false;
    this.vesselIdToUpdate = null;
    this.formBuild();
    this.submitted = false;
    this.modalService.dismissAll();
    this.certificateData = [];
    return null;
  }

  filechange(event: any) {
    this.certificateDoc = event.target.files[0];
  }

  async saveCertificate(element) {
    var extension = element.value.document.name.substr(
      element.target.files[0].name.lastIndexOf('.')
    );
    const filename = element.value.document.name + extension
    const file = element.value.document;
    const formData = new FormData();
    formData.append('file', element.value.document, `${element.value.document.name}`);
    formData.append('name', `${element.value.document.name}`);
    var data = await this.commonService.uploadDocuments('vesselmaster',formData).subscribe();
    if (
      this.certificateDoc &&
      this.certificateName &&
      this.certificateValidFrom &&
      this.certificateValidTo &&
      data
    ) {
      let certificateObj = {
        name: this.certificateName,
        validFrom: this.certificateValidFrom,
        validTo: this.certificateValidTo,
        url: `${element.value.document.name}`,
      };
      this.certificateData.push(certificateObj);
      this.certificateName = '';
      this.certificateValidFrom = '';
      this.certificateValidTo = '';
      this.certificateDoc = '';
      this.modalReference.close();
    }
  }

  async deleteCertificate(certificate) {
    this.certificateData = this.certificateData.filter(
      (item) => item !== certificate
    );
  }

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.vesseldata.map((row: any) => {
      storeEnquiryData.push({
        "Vessel Code": row.vesselCode,
        "Vessel Name": row.vesselName,
        "Vessel Nationality Name": row.countryName,
        "call Sign": row.callSign,
        "imo No": row.imoNo,
        "MMSI NO":row.mmsino,
        "created By": row.createdBy,
        "Created Date": this.datepipe.transform(row.createdOn, 'dd-MM-YYYY,hh:mm'),
        "Updated By": row.updatedBy,
        "updated Date": this.datepipe.transform(row.updatedDate, 'dd-MM-YYYY,hh:mm'),
        "Status": row.status ? 'Active' : 'Inactive',
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

    const fileName = 'vessel-master.xlsx';
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
