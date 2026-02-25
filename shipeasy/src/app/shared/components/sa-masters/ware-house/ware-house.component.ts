import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from 'src/app/admin/principal/api.service';
import { CountryData, LocationData } from 'src/app/models/city-master';
import { Currencys } from 'src/app/models/party-master';
import { State } from 'src/app/models/state-master';
import { CommonService } from 'src/app/services/common/common.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';


@Component({
  selector: 'app-ware-house',
  templateUrl: './ware-house.component.html',
  styleUrls: ['./ware-house.component.scss']
})
export class WareHouseComponent implements OnInit {
  addwareHouse: FormGroup;
  isEdit: boolean = false;
  show: string;
  submitted: boolean = false;
  toalLength: number;
  toalLength1: number;
  wareDate:any = [];
  userTable:FormGroup;
  addbinpoup:FormGroup;
  warehouseList: [];
  size = 10;
  page = 1;
  count = 0;
  wareHouseName: string;
  warehouseIdModel:string
  wareHouseType: string;
  location: string;
  adress: string;
  zip: string;
  allPanelsOpen: boolean = false;
  isBasicPanelOpen: boolean = false;
    isOperationalPanelOpen: boolean = false;
    isContactsPanelOpen: boolean = false;
    isServicesPanelOpen: boolean = false;
    isCompliancePanelOpen: boolean = false;
    isTechnologyPanelOpen: boolean = false;
    isMiscellaneousPanelOpen: boolean = false;
    isRelationshipsPanelOpen:boolean=false;
    isUpdatesPanelOpen:boolean=false;

    canOpenCustomAccordion: boolean = true;
    canOpenCargoAccordion: boolean = true;
    canOpenContainerAccordion: boolean = true;
    canOpenLooseCargoAccordion: boolean = true;
    canOpenFreightAccordion: boolean = true;
    canOpenRemarksAccordion: boolean = true;
    canOpenBatchAccordion: boolean = true;
    canOpenBatchsAccordion: boolean = true;
  displayedColumns =[
    '#',
    'action',
   'wareHouseName',
   'wareHouseType',
   'location',
   'address',
   'zip',

  ];
  displayedColumnsInventory =[
    '#',
    'binNumber',
    'packageDimension',
    'jobNo',
    'frightType',
    'shipperName',
    'consigneeName',
    'portOfLoading',
    'portOfDischarge',
    'uniqueRefNo',
    'updatedOn'
  ];

  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource = new MatTableDataSource();
  dataSource1 = new MatTableDataSource();
  displayedColumns1 = this.displayedColumns.map((x, i) => x + '_' + i);
  displayedColumns2 = this.displayedColumnsInventory.map((x, i) => x + '_' + i);
  constructor(
    public modalService: NgbModal,
    private notification: NzNotificationService,
    private commonService: CommonService,
    private formBuilder:FormBuilder,
    public _api: ApiService,
    private fb: FormBuilder,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private commonFunction: CommonFunctions

  ) {
    this.addwareHouse = this.fb.group({
      zip: [''],
      bondCode:[''],
      wareHouseName: ['', [Validators.required]],
      wareHouseType: ['', [Validators.required]],
      location: ['', [Validators.required]],
      address: ['', [Validators.required]],
      state: ['', [Validators.required]],
      city: ['', [Validators.required]],
      country: ['', [Validators.required]],
      contactName: ['', [Validators.required]],
      contactPhone: ['', [Validators.required]],
      contactEmail: ['', [Validators.required]],
      totalCapacity: ['', [Validators.required]],
      availableCapacity: ['', [Validators.required]],
      noOfDockDoors: ['', [Validators.required]],
      yearOfEstablished: [Number],
      storageType: ['', [Validators.required]],
      securityFeatures: ['', [Validators.required]],
      ISOCertification: [''],
      otherCertification: [''],
      operatingHours: [''],
      notes: [''],
      parentCompanyId: [''],
      freightForwarderId: [''],
      wms: [''],
      its: [''],
      temperatureControl: [false],
      hazardousMaterialHandling: [false],
      operations24x7: [false],
      packagingService: [false],
      labelingService: [false],
      crossDocking: [false],
      freightConsolidation: [false],
      customsClearance: [false],
      barcodeScanning: [false],
      rfidEnabled: [false],
      lastMaintenance:[''],
      nextMaintenance:[''],
      bins:[[]],
      status:[true],
      licenceNo:[''],
    });
    this.addbinpoup =  this.fb.group({
      binNumber: [''],
      binDescription: [''],
    });
    this.warehouseIdModel = this.activateRoute?.snapshot?.params?.['key'];
   }
     isWarehouse: boolean = false;
currentLogin: boolean = false;

  ngOnInit(): void {
    this.isWarehouse = localStorage.getItem('isWarehouse') === 'true' ? true : false;    
    console.log('isWarehouse',this.isWarehouse);
    this.currentLogin = this.commonFunction.getwarehouseType();
    // console.log('currentLogin',this.currentLogin);
    this.getwarehouseData();
    //this.getBinData();
    // this.vvoye();
     // if(this.warehouseIdModel==='main-ware-house'){
      if(this.currentLogin){
        this.setActiveButton(3);
      }
       else{
        this.setActiveButton(1);
       }
    // }
    this.getCountryList();
    this.userTable = this.formBuilder.group({
      tableRows: this.formBuilder.array([])
    });
  }
  closeResult: string;
  toggleFilters = true;
  filtersModel = [];
  fromSize: number = 1;
  filterKeys = {};
  yardcfs:any
  stateListBranch: any;
  cityListBranch: any;
  countryList: CountryData[];
  stateList: State[];
  callingCodeList: CountryData[];
  cityList: LocationData[];
  currencyList: Currencys[];
  isAddMode: any = true;
  binName :any;
  tab:any;
  activeButton: number = 1;
  isEditing: boolean = false;


  setActiveButton(buttonNumber: number) {
    this.activeButton = buttonNumber;
  }
  editListing(id?): void {
    this.isEditing =true
    this.setActiveButton(2)
  }

  saveListing(): void {
    // Your save logic here
    this.setActiveButton(1)
    this.isEditing = false;
  }

  showMainWarehouse() {
    this.setActiveButton(3);
    // this.router.navigate(['/warehouse/main-ware-house']);
  }
  clearFilters() {
    this.filtersModel = [];
    this.filterKeys = {};
    this.getwarehouseData()
  }

  getwarehouseData(){
    let payload = this.commonService.filterList()
    if(payload?.sort)payload.sort = {
      "desc" : ["updatedOn"]
   }
    this.commonService.getSTList('warehouse',payload)?.subscribe((res: any) => {
      this.warehouseList = res?.documents;
      if (res && res.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1,
          zip: s?.zip,
        wareHouseName: s?.wareHouseName,
        wareHouseType: s?.wareHouseType,
        location: s?.location,
        address: s?.address,
        state: s?.state,
        city:s?.city,
        country: s?.country,
        }));
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1;
      }
      this.wareDate = res.documents;
      this.toalLength = res.totalCount;
      this.count = res.documents.length;
    });
  }
  getBinData() {
    let payload = {"warehouseId": this.warehouseIdModel};
    this.commonService.getSTList1('warehouseQrs', payload)?.subscribe((res: any) => {
      if (res && res.documents) {
        this.dataSource1.data = res.documents
          .map((s: any, i: number) => ({
            ...s,
            id: i + 1,
            zip: s?.zip,
            wareHouseName: s?.wareHouseName,
            wareHouseType: s?.wareHouseType,
            location: s?.location,
            address: s?.address,
            state: s?.state,
            city: s?.city,
            country: s?.country,
            uniqueRefNo: s?.uniqueRefNo,
          }))
          .sort((a: any, b: any) => b.uniqueRefNo - a.uniqueRefNo);

        this.dataSource1.paginator = this.paginator;
        this.dataSource1.sort = this.sort1;
      }
      this.wareDate = res.documents;
      this.toalLength1 = res.totalCount;
      this.count = res.documents.length;
    });
  }
  changeStatus(data) {
    this.commonService
      .UpdateToST(`warehouse/${data.warehouseId}`,{  status: !data?.status })
      ?.subscribe(
        (res: any) => {
          if (res) {
            this.notification.create(
              'success',
              'Status Updated Successfully',
              ''
            );
            setTimeout(() => {
              this.getwarehouseData()
            }, 2000);

          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
  }
  clear(){

  }
  onTab(data){}
  addValueChanges(indexOfControl: number) {

  }
  addRow() {
    this.tableRows.push(this.initiateForm());
  }
  initiateForm(): FormGroup {
    return this.formBuilder.group({
      binNumber: [''],
      binDescription: [''],
      checkboxs:[false]
    });
  }

  deleteRow(index: number) {
    this.tableRows.removeAt(index);
  }
  populateTableWithData(data: any[]) {
    let control = this.userTable.controls.tableRows as FormArray;
    data.forEach(elem => {
      control.push(this.formBuilder.group(elem));
      this.addValueChanges(this.getIndexControl());
    });
  }
  getIndexControl(): number {
    return (this.userTable.get('tableRows') as FormArray).length - 1
  }
  // get getFormControls() {
  //   const control = this.userTable.get('tableRows') as FormArray;
  //   return control;
  // }
 get getFormControls() {
    return this.userTable.get('tableRows') as FormArray;
  }
  get tableRows() {
    return this.userTable.get('tableRows') as FormArray;
  }
  // isAnyCheckboxChecked(): boolean {
  //   const control = this.userTable.get('tableRows') as FormArray;
  //   for (let i = 0; i < control.length; i++) {
  //     const checkbox = control.at(i).get('checkboxs');
  //     if (checkbox?.value === true) {
  //       return true;
  //     }
  //   }
  //   return false;
  // }
  get getNestedFormControls() {
    const control = this.userTable.get('ContainerRows') as FormArray;
    return control;
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

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase();


    this.dataSource.filterPredicate = (data, filter) => {
      return JSON.stringify(data).toLowerCase().includes(filter);
    };

    this.dataSource.filter = filterValue;
  }
  applyFilter1(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase();


    this.dataSource.filterPredicate = (data, filter) => {
      return JSON.stringify(data).toLowerCase().includes(filter);
    };

    this.dataSource1.filter = filterValue;
  }
  addBinPopUp(addBin){
    this.modalService.open(addBin, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: '',
    });
  }
  onDelete(deletedata, warehouse) {
    this.modalService
      .open(deletedata, {
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
            let data =  `warehouse/${warehouse?.warehouseId}`
            this.commonService.deleteST(data).subscribe((res: any) => {
              if (res) {
                this.notification.create('success', 'Deleted Successfully', '');
                this.clear();
                setTimeout(() => {
                 this.getwarehouseData()
                }, 1000);
              }
            });
          }
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }
  getCountryList() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = { status: true}

    this.commonService.getSTList('country', payload)?.subscribe((data) => {
      this.countryList = data.documents;
      this.getCurrencyList();
      if (!this.isAddMode) {
        this.getStateList();
      }
      this.branch?.controls.forEach((element, index) => {
        this.getStateListBranch(index);
      })
    });
  }
  get branch() {
    return this.addwareHouse.controls["branch"] as FormArray;
  }
  next() {
    if (this.toalLength > this.count) {
      this.getPaginationData('next');
    }
  }
  next1() {
    if (this.toalLength1 > this.count) {
      this.getPaginationData('next');
    }
  }

  prev() {
    if (this.page > 0) {
      this.getPaginationData('prev');
    }
  }

   getPaginationData(type: any) {
    this.fromSize =
    type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;

  let payload = this.commonService.filterList()
  payload.size = Number(this.size),
  payload.from = this.fromSize - 1,
  payload.sort = {  "desc" : ['updatedOn'] }
  let mustArray = {};

  this.wareHouseName = this.wareHouseName?.trim();
  this.wareHouseType = this.wareHouseType?.trim();
  this.location = this.location?.trim();
  this.adress = this.adress?.trim();
  this.zip = this.zip?.trim();

  if (this.wareHouseName) {
    mustArray['wareHouseName'] = {
      "$regex": this.wareHouseName,
      "$options": "i"
    }
  }
  if (this.wareHouseType) {
    mustArray['wareHouseType'] = {
      "$regex": this.wareHouseType,
      "$options": "i"
    }
  }
  if (this.location) {
    mustArray['location'] = {
      "$regex": this.location,
      "$options": "i"
    }
}
  if (this.adress) {
    mustArray['address'] = {
      "$regex": this.adress,
      "$options": "i"
    }
  }

  if (this.zip) {
    mustArray['zip'] = {
      "$regex": this.zip,
      "$options": "i"
    }
  }

  payload.query=mustArray;
        this.commonService.getSTList('warehouse',payload).subscribe((data: any) => {
      this.warehouseList = data?.documents;
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
  getStateList() {
    this.stateList = [];
    this.cityList = [];
    let countryData = this.countryList?.filter(x => x?.countryId === this.addwareHouse.get('country').value);

    this.callingCodeList = countryData;

    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "countryId": this.addwareHouse.get('country').value, status: true,
    }
    this.commonService.getSTList("state", payload)?.subscribe((data) => {
      this.stateList = data.documents;
       if(this.addwareHouse.get('state').value) this.getCityList();
    });
  }
  getCityList() {
    this.cityList = [];
    let payload = this.commonService.filterList()
    payload.query = {
      stateId: this.addwareHouse.get('state').value, status: true,
    }
    this.commonService.getSTList("city", payload).subscribe((data) => {
      this.cityList = data.documents;
    });
  }
  getCurrencyList() {
    let payload = this.commonService.filterList()
    payload.query = { status: true }

    this.commonService.getSTList('currency', payload).subscribe((data) => {
      this.currencyList = data.documents;
    });
  }
  getStateListBranch(index) {
    this.stateListBranch = [];
    this.cityListBranch = [];
    let payload = this.commonService.filterList()
    payload.query = {
      "countryId": this.addwareHouse.controls.branch['controls'][index].controls.barnch_country?.value, status: true,
    }


    if (this.countryList) {
      let countryData = this.countryList.filter(x => x?.countryId === this.addwareHouse.get('country').value);

      this.callingCodeList = countryData;
    }
    this.commonService.getSTList("state", payload).subscribe((data) => {
      this.stateListBranch = data.documents;
      if (!this.isAddMode) {
        this.getCityBranchList(index);
      }
    });
  }
  getCityBranchList(index) {

    let supplyCode = this.stateListBranch.filter(i => i.stateId === this.addwareHouse.controls.branch['controls'][index].controls.branch_state?.value)[0]?.stateCode
    this.addwareHouse.controls.branch['controls'][index].controls.placeofSupply.setValue(supplyCode)

    this.cityListBranch = [];


    let payload = this.commonService.filterList()
    payload.query = {
      stateId: this.addwareHouse.controls.branch['controls'][index].controls.branch_state?.value, status: true,
    }
    this.commonService.getSTList("city", payload).subscribe((data) => {
      this.cityListBranch = data.documents;
    });
  }
  vvoye() {
    let payload = this.commonService.filterList()
    payload.sort = {  "desc" : ['updatedOn'] }
  let mustArray = {};
  payload.query=mustArray;
  this.commonService.getSTList('warehouse',payload).subscribe((res: any) => {
      if (res && res.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1,
          zip: s?.zip,
        wareHouseName: s?.wareHouseName,
        wareHouseType: s?.wareHouseType,
        location: s?.location,
        address: s?.address,
        state: s?.state,
        city:s?.city,
        country: s?.country,


        }));
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1;
      } else {
      }
    }, (error: any) => {
    });
  }


  searchColumns() {
    this.filterKeys = {};
    this.filtersModel.forEach((each, ind) => {
      if (each)
        this.filterKeys[this.displayedColumns[ind]] = {
          "$regex": each.toLowerCase(),
          "$options": "i"
        }
    });
    let payload = this.commonService.filterList()
    payload.query = this.filterKeys
    payload.sort = {
      "desc": ["updatedOn"]
    }
    this.commonService.getSTList('warehouse',payload).subscribe((data) => {
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
  warehouseId:any = '';
  exportAsExcelFile(){}
  open(content, warehouse?: any, show?){
    this.show = show;
    this.isEdit = false;
    if (warehouse) {
      this.isEdit = true;
      this.warehouseId = warehouse?.warehouseId;
      this.addwareHouse.patchValue({
        zip: warehouse?.zip,
        bondCode: warehouse?.bondCode,
        licenceNo: warehouse?.licenceNo,
        wareHouseName: warehouse?.wareHouseName,
        wareHouseType: warehouse?.wareHouseType,
        location: warehouse?.location,
        address: warehouse?.address,
        state: warehouse?.state,
        city:warehouse?.city,
        country: warehouse?.country,
        contactName:  warehouse?.contactName,
      contactPhone:  warehouse?.contactPhone,
      contactEmail:  warehouse?.contactEmail,
      totalCapacity:  warehouse?.totalCapacity,
      availableCapacity:  warehouse?.availableCapacity,
      noOfDockDoors:  warehouse?.noOfDockDoors,
      yearOfEstablished:  warehouse?.yearOfEstablished,
      storageType:  warehouse?.storageType,
      securityFeatures: warehouse?.securityFeatures,
      ISOCertification: warehouse?.ISOCertification,
      otherCertification:  warehouse?.otherCertification,
      operatingHours:  warehouse?.operatingHours,
      notes:  warehouse?.notes,
      parentCompanyId: warehouse?.parentCompanyId,
      freightForwarderId: warehouse?.freightForwarderId,
      wms: warehouse?.wms,
      its: warehouse?.its,
      temperatureControl: warehouse?.temperatureControl,
      hazardousMaterialHandling:warehouse?.hazardousMaterialHandling,
      operations24x7: warehouse?.operations24x7,
      packagingService: warehouse?.packagingService,
      labelingService: warehouse?.labelingService,
      crossDocking:warehouse?.crossDocking,
      freightConsolidation: warehouse?.freightConsolidation,
      customsClearance: warehouse?.customsClearance,
      barcodeScanning: warehouse?.barcodeScanning,
      rfidEnabled: warehouse?.rfidEnabled,
      nextMaintenance: warehouse?.nextMaintenance,
      lastMaintenance: warehouse?.lastMaintenance,
      status: warehouse?.status,
      });
      this.getStateList();
      if(warehouse?.bins){
        const control = this.userTable.get('tableRows') as FormArray;
        warehouse?.bins?.map((i) => {
          control.push(this.formBuilder.group(i))
        });
      }
    }


    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'xl',
    });
  }
  closeModal() {
    this.modalService.dismissAll();
    this.onreset();
  }
  onreset(){
    this.addwareHouse.reset();
    this.userTable.reset();
    const control = this.userTable.get('tableRows') as FormArray;
    control.clear();
    this.submitted = false;
  }
  get f() {
    return this.addwareHouse.controls;
  }
  checkLocationUniqueness(): boolean {
    const city = this.addwareHouse.get('city').value;
    const location = this.addwareHouse.get('location').value?.trim();
    
    if (!city || !location) {
      return true; 
    }
  
    const warehousesInSameCity = this.warehouseList.filter((warehouse: any) =>
      warehouse.city === city
    );
  
    const isDuplicate = warehousesInSameCity.some((warehouse: any) => {
      if (this.isEdit && warehouse.warehouseId === this.warehouseId) {
        return false;
      }
      return warehouse.location?.trim().toLowerCase() === location.toLowerCase();
    });
  
    return !isDuplicate;
  }
 
onSave() {
  this.submitted = true;
  
  if (!this.checkLocationUniqueness()) {
    this.notification.create(
      'error',
      'Location name already exists in this city',
      'Please choose a different location name for this city'
    );
    return;
  }
  
  if (this.addwareHouse.invalid) {
    return;
  }
  
  let bins = [];
  const control = this.userTable.get('tableRows') as FormArray;
  if(control){
    control.value?.map((i) => {
      bins.push({
        ...i,
        costitemName: this.binName?.find((j) => j?.costitemId === i?.binName)?.costitemName
      })
    })
  }
  const Payload = {
    zip: this.addwareHouse.value?.zip,
    bondCode: this.addwareHouse.value?.bondCode,
    licenceNo: this.addwareHouse.value?.licenceNo,
    wareHouseName: this.addwareHouse.value?.wareHouseName,
    wareHouseType: this.addwareHouse.value?.wareHouseType,
    location: this.addwareHouse.value?.location,
    address: this.addwareHouse.value?.address,
    state: this.addwareHouse.value?.state,
    city: this.addwareHouse.value?.city,
    country: this.addwareHouse.value?.country,
    contactName: this.addwareHouse.value?.contactName,
    contactPhone: this.addwareHouse.value?.contactPhone,
    contactEmail: this.addwareHouse.value?.contactEmail,
    totalCapacity:this.addwareHouse.value?.totalCapacity,
    availableCapacity:this.addwareHouse.value?.availableCapacity,
    noOfDockDoors: this.addwareHouse.value?.noOfDockDoors,
    yearOfEstablished: this.addwareHouse.value?.yearOfEstablished,
    storageType: this.addwareHouse.value?.storageType,
    securityFeatures: this.addwareHouse.value?.securityFeatures,
    ISOCertification: this.addwareHouse.value?.ISOCertification,
    otherCertification: this.addwareHouse.value?.otherCertification,
    operatingHours: this.addwareHouse.value?.operatingHours,
    notes: this.addwareHouse.value?.notes,
    parentCompanyId: this.addwareHouse.value?.parentCompanyId,
    freightForwarderId:this.addwareHouse.value?.freightForwarderId,
    wms: this.addwareHouse.value?.wms,
    its: this.addwareHouse.value?.its,
    temperatureControl: this.addwareHouse.value?.temperatureControl,
    hazardousMaterialHandling: this.addwareHouse.value?.hazardousMaterialHandling,
    operations24x7: this.addwareHouse.value?.operations24x7,
    packagingService: this.addwareHouse.value?.packagingService,
    labelingService: this.addwareHouse.value?.labelingService,
    crossDocking: this.addwareHouse.value?.crossDocking,
    freightConsolidation: this.addwareHouse.value?.freightConsolidation,
    customsClearance: this.addwareHouse.value?.customsClearance,
    barcodeScanning: this.addwareHouse.value?.barcodeScanning,
    rfidEnabled:this.addwareHouse.value?.rfidEnabled,
    nextMaintenance:this.addwareHouse.value?.nextMaintenance,
    lastMaintenance:this.addwareHouse.value?.lastMaintenance,
    status:this.addwareHouse.value?.status,
    bins:[...bins]

  }
  if(this.isEdit && this.warehouseId){
    this.commonService
    .UpdateToST(`warehouse/${this.warehouseId}`,{  ...Payload })
    ?.subscribe(
      (res: any) => {
        if (res) {
          this.notification.create(
            'success',
            'Record Updated Successfully',
            ''
          );
          this.onreset()
          this.getwarehouseData();
          this.modalService.dismissAll();
        }
      },
      (error) => {
          // this.onSave();
        this.notification.create('error', error?.error?.error?.message, '');
      }
    );
  } else {
    this.commonService.addToST('warehouse', Payload)?.subscribe(
      (res: any) => {
        if (res) {
          this.notification.create('success', 'Added Successfully', '');
          this.onreset()
          this.modalService.dismissAll();
          this.getwarehouseData();
        }
      },
      (error) => {
        this.notification.create('error', error?.error?.error?.message, '');
      }
    );
  }

}
  toggleButton(panel: string) {
    switch (panel) {
      case 'Basic':
        if (this.canOpenCustomAccordion) {
          this.isBasicPanelOpen = !this.isBasicPanelOpen;
        }
        break;
        case 'Contacts':
        if (this.canOpenContainerAccordion) {
          this.isContactsPanelOpen = !this.isContactsPanelOpen;
        }
        break;
        case 'Operational':
        if (this.canOpenCargoAccordion) {
          this.isOperationalPanelOpen = !this.isOperationalPanelOpen;
        }
        break;
      case 'Services':
        if (this.canOpenLooseCargoAccordion) {
          this.isServicesPanelOpen = !this.isServicesPanelOpen;
        }
        break;
      case 'Compliance':
        if (this.canOpenFreightAccordion) {
          this.isCompliancePanelOpen = !this.isCompliancePanelOpen;
        }
        break;
      case 'Technology':
        if (this.canOpenRemarksAccordion) {
          this.isTechnologyPanelOpen = !this.isTechnologyPanelOpen;
        }
        break;
      case 'Miscellaneous':
        if (this.canOpenBatchAccordion) {
          this.isMiscellaneousPanelOpen = !this.isMiscellaneousPanelOpen;
        }
        break;
        case 'Relationships':
          if (this.canOpenBatchsAccordion) {
            this.isRelationshipsPanelOpen = !this.isRelationshipsPanelOpen;
          }
          break;
          case 'Updates':
          if (this.canOpenBatchsAccordion) {
            this.isUpdatesPanelOpen = !this.isUpdatesPanelOpen;
          }
          break;
      default:
        console.error('Unknown panel:', panel);
    }
  }
  toggleAllPanels(state: boolean) {
    this.allPanelsOpen = state;
    this.isBasicPanelOpen = state;
    this.isContactsPanelOpen = state;
    this.isOperationalPanelOpen = state;
    this.isServicesPanelOpen = state;
    this.isCompliancePanelOpen = state;
    this.isTechnologyPanelOpen = state;
    this.isMiscellaneousPanelOpen = state;
    this.isRelationshipsPanelOpen = state;
    this.isUpdatesPanelOpen = state;

}

}
