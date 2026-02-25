import { Component, OnInit, Input, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { BaseBody } from 'src/app/admin/smartagent/base-body';
import { SmartAgentDetail } from 'src/app/admin/smartagent/smart-details/smartagent-detail';
import { environment } from 'src/environments/environment';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { ApiSharedService } from '../../api-service/api-shared.service';
import { CommonService } from 'src/app/services/common/common.service';
import { Subject } from 'rxjs';
import { ApiService } from 'src/app/admin/principal/api.service';
import { State } from 'src/app/models/state-master';
import { City } from 'src/app/models/smartadd';
import { Currency, SystemType } from 'src/app/models/cost-items';
import { Branch, Country, PortDetails } from 'src/app/models/yard-cfs-master';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
declare var google: any;
import { OrderByPipe } from 'src/app/shared/util/sort';
import { Address } from 'ngx-google-places-autocomplete/objects/address';

@Component({
  selector: 'app-addbranch',
  templateUrl: './addbranch.component.html',
  styleUrls: ['./addbranch.component.scss'],
})
export class AddbranchComponent implements OnInit , OnDestroy {
  @ViewChild('addressInput') addressInput: ElementRef;
  private ngUnsubscribe = new Subject<void>();
  @Input() isFiledVisiable: any;
  @Input() prentPath: any;
  isAddMode: any;
  id: any;
  addBranchForm: FormGroup;
  submitted: boolean = false;
  editid: any;
  currentLocation: string;
  localCurrency:string;
  baseBody: BaseBody = new BaseBody();
  branchDetail: SmartAgentDetail = new SmartAgentDetail();
  countryList: any;
  stateList: State[]=[];
  cityList: City[]=[];
  callingCodeList: any=[];
  taxTypeList: SystemType[]=[];
  picTypeList: SystemType[]=[];
  picNameList: SystemType[]=[];
  currencyList: Currency[]=[];
  portList: PortDetails[]=[];
  countryCopyData: Country[]=[]
  currentUrl: any;
  currentPath: Branch[]=[];
  partyid: string;
  isTransport: boolean = false;
  currentLogin: any = ''
  isImport: boolean = false;
  isExport: boolean = false
  isWarehouse : boolean = false;
  constructor(
    public location: Location,
    public route: ActivatedRoute,
    private formBuilder: FormBuilder,
    public notification: NzNotificationService,
    private profilesService: ProfilesService,
    public router: Router,
    public commonfunction: CommonFunctions,
    public commonFunctions: CommonFunctions,
    private sharedService: ApiSharedService,
    public commonService: CommonService,
    private _api: ApiService,
    private sortPipe: OrderByPipe,
    

  ) {
    this.isExport = localStorage.getItem('isExport') === 'true' ? true : false
    this.isTransport = localStorage.getItem('isTransport') === 'true' ? true : false;
    this.isImport = localStorage.getItem('isImport') === 'true' ? true : false;
    this.isWarehouse = localStorage.getItem('isWarehouse') === 'true' ? true : false;
    this.editid = this.route.snapshot.paramMap.get('value');
    this.submitted = false;
    this.partyid = this.route.snapshot.params['id'];
  }

  backbtn() {
    this.location.back();
  }

  get f() {
    return this.addBranchForm.controls;
  }
  sort(array, key) {
    return this.sortPipe.transform(array, key);
  }

  ngOnInit(): void {
    this.currentPath = this.isFiledVisiable?.split('/')[0];
    this.buildForm();
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();
    this.id = this.route.snapshot.params['value'];
    this.isAddMode = this.currentUrl;
    this.currentLogin = this.commonFunctions.getUserType1()
    if (this.isAddMode !== 'addbranch') {
      this.getBranchDetailById(this.id);
    }
    else{
      this.getCountryList();
    }
    this.getCountryList();
    this.getTaxTypeList();
    this.getCurrencyList();
  }

  buildForm() {
    this.addBranchForm = this.formBuilder.group({
      isBranch: [true],
      branchName: ['', Validators.required],
      country: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      pinCode: ['', Validators.required],
        
      address: ['', Validators.required],
      currentLocation:[''],
      currency: ['', Validators.required],
      localCurrency: [''],
      primaryCountryCode: [''],
      primaryAreaCode: [''],
      primaryNo: [''],
      secondaryCountryCode: [''],
      secondaryAreaCode: [''],
      secondaryNo: [''],
      faxCountryCode: [''],
      faxAreaCode: [''],
      faxNo: [''],
      jobCode : [null],
      jobCodeNB: [null],
      warehouseCounterNB:[null],
      batchCounter : [null],
      exportBatchCounter : [null],
      invoiceCounter : [null],
      warehouseCounter:[null,],
      website: [
        '',
        [Validators.pattern(environment.validate.website)],
      ],
      primaryEmailId: [
        '',
        [Validators.pattern(environment.validate.email)],
      ],
      secondaryEmailId: [
        '',
        [Validators.pattern(environment.validate.email)],
      ],
      taxType: [''],
      taxCode: [''],
      taxId: ['', Validators.required],
      panNo : [''],
      commercialNumber: [''],
      picType: [''],
      picName: ['', Validators.required],
      picName2: ['', Validators.required],
      picMobileCountry: ['', Validators.required],
      picMobilearea: [''],
      picMobilenumber: ['', Validators.required],
      picEmailId: [
        '',
        [Validators.required, Validators.pattern(environment.validate.email)],
      ],
      sezUnitAddress: [''],
      dAndBNumber: [''],
      portName: ['' ],
      // currency: [false],
 
      pda: [false],
      iPda: [false],
      fda: [false],
      sda: [false],
      branchActive: [true],
      status : [true], 
    });
  }

  getCountryList() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
     status: true,
    }
    this.commonService.getSTList('country',payload)?.subscribe((data) => {
      this.countryList = data.documents;
      this.countryCopyData = [...this.countryList]; 
      this.getPicTypeList();
      this.getPicNameList();
      this.getStateList(data.documents); 
    });
  }


  getStateList(country?) {
    this.stateList = [];
    this.cityList = [];
    
    let payload = this.commonService.filterList()
    
    if(payload?.query)payload.query = {
      countryId: this.addBranchForm.get('country').value,
      "status": true 
    } 
    if(this.countryList?.length > 0 && this.addBranchForm.get('country').value){ 
      let countryData = this.countryList?.filter(
        (x) => x?.countryId === this.addBranchForm.get('country').value
      );
      this.callingCodeList = countryData;
      if(countryData?.[0]?.countryName?.toLowerCase()==='india'){
        this.addBranchForm.controls['taxType'].setValue('GST');
      }else{
        this.addBranchForm.controls['taxType'].setValue('TAX');
      }
      let payload = this.commonService.filterList()
      if(payload?.query)payload.query = {
        "status":true,
        
        countryId: this.addBranchForm.get('country').value
        }
      
        this.addBranchForm.controls['primaryCountryCode'].setValue(this.callingCodeList[0]?.countryPhoneCode);
        this.addBranchForm.controls['secondaryCountryCode'].setValue(this.callingCodeList[0]?.countryPhoneCode);
        this.addBranchForm.controls['faxCountryCode'].setValue(this.callingCodeList[0]?.countryPhoneCode);
        this.addBranchForm.controls['picMobileCountry'].setValue(this.callingCodeList[0]?.countryPhoneCode);
    }

    this.commonService.getSTList('state',payload)?.subscribe((data) => {
      this.stateList = data.documents;
      if (!this.isAddMode) {
        this.getCityList();
      }
    });
  }

  getCityList() {
    this.cityList = [];
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      stateId: this.addBranchForm.get('state').value,
      "status": true
    }
    this.commonService.getSTList('city',payload)?.subscribe((data) => {
      this.cityList = data.documents;
      this.getPortList();
    });
  }

  getPicTypeList() {
   
   
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      // typeCategory: "chargeTerm",
    }
    this.commonService.getSTList('systemtype',payload)?.subscribe((res: any) => {
      this.picTypeList = res?.documents?.filter(x => x.typeCategory === "picType");

    });
  }

  getPicNameList() { 
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      typeCategory: "picname",
    }
    this.commonService.getSTList('systemtype',payload)
      ?.subscribe((data) => {
        this.picNameList = data.documents;
      });
  }

 

  getTaxTypeList() {
     
     let payload = this.commonService.filterList()
     if(payload?.query)payload.query = {
       typeCategory: "taxType",
       "status": true,
     }
     this.commonService.getSTList('systemtype',payload)
       ?.subscribe((data) => {
         this.taxTypeList = data.documents;
       });
   }

  getPortList() {
    let countryData = this.countryCopyData.filter(
      (x) => x?.countryId === this.addBranchForm.get('country').value
    );
  
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      'country.countryName': countryData[0]?.countryName,
       "status": true, 
     }
     payload.size = 15000
    payload.project = ["portDetails.portName", "portId"];
     this.commonService.getSTList('port',payload)?.subscribe((data) => {
      this.portList = data.documents;
    });
  }

  getCurrencyList() {

    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
       "status": true, 
     }
     this.commonService.getSTList('currency',payload)?.subscribe((data) => {
      this.currencyList = data.documents;
    });
  }

  getBranchDetailById(branchId: any) {

    let payload = this.commonService.filterList()
     if(payload?.query)payload.query = {
      branchId: branchId,
     }
     this.commonService.getSTList('branch',payload)?.subscribe((data: any) => {
        this.branchDetail = data.documents[0];
        this.getPatch(this.branchDetail);
        this.getCountryList();
      });
  }

  getPatch(details) {
    
    this.addBranchForm.setValue({
      isBranch: true,
      branchName: details.branchName,
      warehouseCounterNB: details?.warehouseCounterNB || "",
      jobCode : details?.jobCode || '',
      jobCodeNB: details?.jobCodeNB || '',
      batchCounter: details?.batchCounter || 0,
      exportBatchCounter: details?.exportBatchCounter || 0,
      invoiceCounter: details?.invoiceCounter || 0,
      warehouseCounter:details?.warehouseCounter || 0,
      country: details.addressInfo.countryISOCode || '',
      state: details.addressInfo.stateId || '',
      city: details.addressInfo.cityId || '',
      pinCode: details.addressInfo.postalCode || '',
      currency: details.currency || '',
      localCurrency:details?.localCurrency ? details?.localCurrency : details.currency || '',
      address: details.addressInfo.address || '',
      currentLocation: details?.addressInfo?.currentLocation || '',
      primaryCountryCode: details?.primaryNo?.primaryCountryCode || '',
      primaryAreaCode: details.primaryNo.primaryAreaCode || '',
      primaryNo: details.primaryNo.primaryNumber || '',
      secondaryCountryCode: details.secondaryNo.secondaryCountryCode || '',
      secondaryAreaCode: details.secondaryNo.secondaryAreaCode || '',
      secondaryNo: details.secondaryNo.secondaryNo || '',
      faxCountryCode: details.faxNo.faxCountryCode || '',
      faxAreaCode: details.faxNo.faxAreaCode || '',
      faxNo: details.faxNo.faxNo || '',
      
      website: details.url || '',
      primaryEmailId: details.primaryMailId || '',
      secondaryEmailId: details.secondaryMailId || '',
      taxType: details.taxType || '',
      taxCode: details.taxCode || '',
      taxId: details.taxId || '',
      panNo : details.panNo || '',
      commercialNumber: details.commRegNo || '',
      picType: details.pic.picType || '',
      picName: details.pic.picName || '',
      picName2: details.pic.picName2 || '',
      picMobilenumber: details.pic.picMobileNo || '',
      picMobilearea: details.pic.picMobileAreaCode || 0,
      picMobileCountry: details.pic.picMobileCountryCode || '',
      picEmailId: details.pic.picMailId || '',
      sezUnitAddress: details.sezUnitAddress || '',
      dAndBNumber: details.dAndBNo || '',
      portName: details.portName || '',
      // currency: details.currency.currencyCode || '',
    
      pda: details.pda || false,
      iPda: details.iPda || false,
      fda: details.fda || false,
      sda: details.sda || false,
      branchActive: details.branchActive || false,
      status : details.status || false,
    });
  
   
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.addBranchForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  onSave() {
     let currentPath = this.isFiledVisiable.split('/')[0]
    this.submitted = true;
    this.findInvalidControls()
    if (!this.addBranchForm.valid) return;
    this.createModel();
    let createBody = [];
    this.branchDetail['orgId'] = this.partyid || this.commonfunction.getAgentDetails().orgId
    createBody.push(this.branchDetail);

    if (this.isAddMode === 'addbranch') {
      this.commonService.addToST('branch',createBody[0])?.subscribe((data: any) => {
        if (data) {
          this.notification.create('success', 'Added Successfully', '');
          this.router.navigate(['/' + currentPath + '/' + this.partyid + '/branch']);
        }
      });
    } else {
      this.commonService.UpdateToST(`branch/${createBody[0].branchId}`,createBody[0])?.subscribe((data: any) => {
        if (data) {
          this.notification.create('success', 'Updated Successfully', '');
          this.router.navigate(['/' + currentPath + '/' + this.partyid + '/branch']);
        }
      });
    }
    this.submitted = false;
  }

  createModel() {
    let countryData = this.countryList.filter(
      (x) => x?.countryId === this.addBranchForm.get('country').value
    )[0];
    let stateData = this.stateList.filter(
      (x) => x?.stateId === this.addBranchForm.get('state').value
    )[0];
    let cityData = this.cityList.filter(
      (x) => x?.cityId === this.addBranchForm.get('city').value
    )[0];
    let currencyData = this.currencyList?.filter(
      (x) =>
        x?.currencyShortName === this.addBranchForm.get('currency').value
    )[0];

    this.branchDetail.isBranch = true;
    this.branchDetail.parentId = this.partyid;
    this.branchDetail.branchType = this.isFiledVisiable;
    this.branchDetail.agentId = this.partyid || '1';
    this.branchDetail.agentName = '';
    this.branchDetail.branchName = this.addBranchForm.get('branchName').value;
    this.branchDetail.addressInfo.address =
      this.addBranchForm.get('address').value;
      this.branchDetail.addressInfo.currentLocation =
      this.addBranchForm.get('currentLocation').value;
    this.branchDetail.addressInfo.countryId = countryData?.countryId;
    this.branchDetail.addressInfo.countryISOCode =
      this.addBranchForm.get('country').value;
    this.branchDetail.addressInfo.countryName =
      countryData?.countryName;
    this.branchDetail.addressInfo.stateId = stateData?.stateId;
    this.branchDetail.addressInfo.stateName = stateData?.typeDescription;
    this.branchDetail.addressInfo.stateCode = stateData?.stateCode;
    this.branchDetail.addressInfo.cityId = cityData?.cityId;
    this.branchDetail.addressInfo.cityName = cityData?.cityName;
    this.addBranchForm.get('city').value;
    this.branchDetail.addressInfo.postalCode =
      this.addBranchForm.get('pinCode').value;
  
    this.branchDetail.primaryNo.primaryCountryCode = this.addBranchForm.get('primaryCountryCode').value;
    this.branchDetail.primaryNo.primaryAreaCode = this.addBranchForm.get('primaryAreaCode').value;
    this.branchDetail.primaryNo.primaryNumber =  this.addBranchForm.get('primaryNo').value;
    this.branchDetail.secondaryNo.secondaryCountryCode = this.addBranchForm.get(
      'secondaryCountryCode'
    ).value;
    this.branchDetail.secondaryNo.secondaryAreaCode =
      this.addBranchForm.get('secondaryAreaCode').value;
    this.branchDetail.secondaryNo.secondaryNo =
      this.addBranchForm.get('secondaryNo').value;
 
    this.branchDetail.faxNo.faxCountryCode =
      this.addBranchForm.get('faxCountryCode').value;
    this.branchDetail.faxNo.faxAreaCode =
      this.addBranchForm.get('faxAreaCode').value;
    this.branchDetail.faxNo.faxNo = this.addBranchForm.get('faxNo').value;
    this.branchDetail.url = this.addBranchForm.get('website').value;
    this.branchDetail.primaryMailId =
      this.addBranchForm.get('primaryEmailId').value;
    this.branchDetail.secondaryMailId =
      this.addBranchForm.get('secondaryEmailId').value;
    this.branchDetail.commRegNo =
      this.addBranchForm.get('commercialNumber').value;
    this.branchDetail.dAndBNo = this.addBranchForm.get('dAndBNumber').value;
    this.branchDetail.taxType = this.addBranchForm.get('taxType').value;
    this.branchDetail.taxCode = this.addBranchForm.get('taxCode').value;
    this.branchDetail.taxId = this.addBranchForm.get('taxId').value;
    this.branchDetail.panNo = this.addBranchForm.get('panNo').value;
    this.branchDetail.sezUnitAddress =
      this.addBranchForm.get('sezUnitAddress').value;
      this.branchDetail.currency = this.addBranchForm.get('currency').value;
    this.branchDetail.portName = this.addBranchForm.get('portName').value;
    this.branchDetail.pic.picType = this.addBranchForm.get('picType').value;
    this.branchDetail.pic.picName = this.addBranchForm.get('picName').value;
    this.branchDetail.pic.picName2 = this.addBranchForm.get('picName2').value;
    this.branchDetail.pic.picMobileCountryCode =
      this.addBranchForm.get('picMobileCountry').value;
    this.branchDetail.pic.picMobileAreaCode =
      this.addBranchForm.get('picMobilearea').value;
    this.branchDetail.pic.picMobileNo =
      this.addBranchForm.get('picMobilenumber').value;
    this.branchDetail.pic.picMailId =
      this.addBranchForm.get('picEmailId').value;
    this.branchDetail.pda = this.addBranchForm.get('pda').value;
    this.branchDetail.currency = this.addBranchForm.get('currency').value;
    // this.branchDetail.localCurrency = this.addBranchForm.get('localCurrency').value;
    this.branchDetail.iPda = this.addBranchForm.get('iPda').value;
    this.branchDetail.fda = this.addBranchForm.get('fda').value;
    this.branchDetail.sda = this.addBranchForm.get('sda').value;
    this.branchDetail.branchActive =
      this.addBranchForm.get('branchActive').value;
    this.branchDetail.status = this.addBranchForm.get('status').value;
    this.branchDetail.jobCode = this.addBranchForm.get('jobCode').value?.toUpperCase() || '';
    this.branchDetail.warehouseCounterNB = this.addBranchForm.get('warehouseCounterNB').value?.toUpperCase() || '';
    this.branchDetail.jobCodeNB = this.addBranchForm.get('jobCodeNB').value?.toUpperCase() || '';
    this.branchDetail.batchCounter = this.addBranchForm.get('batchCounter').value || 0;
    this.branchDetail.exportBatchCounter = this.addBranchForm.get('exportBatchCounter').value || 0;
    this.branchDetail.invoiceCounter = this.addBranchForm.get('invoiceCounter').value || 0;
    this.branchDetail.warehouseCounter = this.addBranchForm.get('warehouseCounter').value || 0;
  }

  resetForm() {
    this.addBranchForm.reset();
  }

  getAddressType(screen: any) {
    if (this.isFiledVisiable === 'smartagent') {
      return 'smartagent';
    } else {
      return 'vendor';
    }
  }

  onCancel() {
    this.router.navigate(['/' + this.isFiledVisiable + '/branch']);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  async handleworkAddress(address: Address) {
    this.addBranchForm.controls['currentLocation'].setValue(address.formatted_address);
  }

}
