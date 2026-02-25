import { Component, EventEmitter, Input, OnInit, Output, OnDestroy, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { Currency, partymasterDetail } from './partyMaster-detail'
import { BaseBody } from '../base-body';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CutomerType } from '../base-body';
import { partyMasterService } from '../service/party-master.services';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/services/common/common.service';
import { ApiSharedService } from 'src/app/shared/components/api-service/api-shared.service';
import { LoaderService } from 'src/app/services/loader.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { CountryData, LocationData } from 'src/app/models/city-master';
import { State } from 'src/app/models/state-master';
import { Currencys, PartyMasterData } from 'src/app/models/party-master';
import { AgentBankAccount } from 'src/app/models/add-party';
import { SystemType } from 'src/app/models/system-type';
import { Guid } from 'guid-typescript';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatTabChangeEvent } from '@angular/material/tabs'; 
import { REGEX } from 'src/app/services/common/constants/REGEX';

@Component({
  selector: 'app-add-party',
  templateUrl: './add-party.component.html',  
  styleUrls: ['./add-party.component.scss']
})
export class AddPartyComponent implements OnInit, OnDestroy {
  isGroupCompaniesChecked = false;
  @Input() partyMaster: any;
  @Output() getList = new EventEmitter<any>()
  @Input() isPopup :boolean = false;  
  @Input() customerTypeFromPopup: string;
  @Input() activeFrightAir :boolean = false;  
  // @Input() isBatchPopup :boolean = false;  
   searchTerm: string = '';
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  pagenation = [5, 10, 20, 50, 100];
  tabs = [
    { name: 'All', count: 0, active: true },
    { name: 'Qualifying', count: 0, active: false },
    { name: 'Working', count: 0, active: false },
    { name: 'Quoting', count: 0, active: false },
    { name: 'Shipping', count: 0, active: false },
    { name: 'Inactive', count: 0, active: false }
  ];
  tableColumns = [
    "JobNo",
    "Consignee",
    "POL",
    "POD",
    "LoadType",
    "Status",
    "UpdatedOn",
    "UpdatedBy"
  ];
  contactsList = [
    { name: 'John Doe', stage: 'Qualifying', tags: 'Lead', phone: '123-456', status: 'Active', assigned: 'Jane', lastConnect: 'Yesterday' },
    { name: 'Jane Smith', stage: 'Working', tags: 'Prospect', phone: '456-789', status: 'Pending', assigned: 'John', lastConnect: 'Last Week' }
  ];
  isType: any;
  @Output() setRefreshPartyMasterList = new EventEmitter<void>();
  selectedIndex = 0;
  regex = REGEX;
  private ngUnsubscribe = new Subject<void>();
  smartAgentDetail: partymasterDetail = new partymasterDetail();
  baseBody: BaseBody = new BaseBody();
  isProductList: boolean = true;
  submitted: boolean;
  holdControl: string;
  currentUrl: string;
  extension: any;
  fileTypeNotMatched: boolean;
  doc: File;
  batchList: any = [];
  InquiryList: any = []
  base64Output: any;
  callapseALL: boolean = false;
  isAddMode: any = true;
  Overview: FormGroup;
  ulipmcaData: any = [];
  KYCAndDocuments: FormGroup
  AddressCustomer: FormGroup;
  AddressBranch: FormGroup;
  notesForm: FormGroup;
  partyMasterForm: FormGroup;
  filterTableForm: FormGroup;
  salesRepresentativeForm: FormGroup;
  creditControlDetailsForm: FormGroup;
  // cibilActionForm:FormGroup;
  userList: any = [];
  overviewTable: []
  countryList: CountryData[] = [{
    countryName: 'INDIA', countryId: 'IN',
    callingCode: '',
    countryCurrency: [],
    countryFlag: '',
    countryISOCode: '',
    createdBy: '',
    createdOn: '',
    gmtOffset: [],
    isDst: false,
    isSanction: false,
    isVerified: false,
    isVerify: false,
    orgId: '',
    Acd: false,
    countryCode: '',
    countryPhoneCode: '',
    countryShortName: '',
    longShortHaul: '',
    module: '',
    sector: '',
    subSectorName: '',
    timeDiffSign: '',
    timeDiffValue: '',
    region: {
      regionId: ''
    },
    remarks: '',
    status: false,
    tenantId: '',
    updatedBy: '',
    updatedOn: '',
    utcOffset: []
  },]
  stateList: State[];
  cityList: LocationData[];
  callingCodeList: CountryData[];
  currencyList: Currencys[];
  today = new Date();
  cutomertypeList: CutomerType = new CutomerType();
  listOfTagOptions = [];
  id: string;
  bankList: AgentBankAccount[];
  partyMasterLength: PartyMasterData[];
  partyMasterCount: number = 0;
  minDate = environment.validate.minDate
  allPanelsOpen: boolean = false;
  isOverviewPanelOpen: boolean = false;
  isCargoPanelOpen: boolean = false;
  isContactsPanelOpen: boolean = false;
  isAddressPanelOpen: boolean = false;
  isDocumentsPanelOpen: boolean = false;
  isSalesPanelOpen: boolean = false;
  isCreditPanelOpen: boolean = false;

  canOpenCustomAccordion: boolean = true;
  canOpenCargoAccordion: boolean = true;
  canOpenContainerAccordion: boolean = true;
  canOpenLooseCargoAccordion: boolean = true;
  canOpenFreightAccordion: boolean = true;
  canOpenRemarksAccordion: boolean = true;
  canOpenBatchAccordion: boolean = true;
  CustomerTypeList: SystemType[] = []


  settings = {
    singleSelection: false,
    idField: 'item_id',
    textField: 'item_text',
    enableCheckAll: false,
    allowSearchFilter: false,
    limitSelection: -1,
    clearSearchFilter: true,
    maxHeight: 197,
    itemsShowLimit: 3,
    closeDropDownOnSelection: false,
    showSelectedItemsAtTop: false,
    defaultOpen: false,
  };
  stateListBranch: any;
  cityListBranch: any;
  tenantId: any;
  customeDocument: [];
  hideCreateUSer: boolean = false;
  showCustomerCurr = false;
  getCognitoUserDetail: any
  partyMasterId: any;
  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    public commonService: CommonService,
    public notification: NzNotificationService,
    private partyMasterService: partyMasterService,
    private commonFunctions: CommonFunctions,
    private ProfilesService: ProfilesService,
    public apiService: ApiSharedService, private cognito: CognitoService,
    private modalService: NgbModal, public commonfunction: CommonFunctions,
    private loaderService: LoaderService, 
  ) {
    this.buildForm();
    setTimeout(() => {
      this.getPartyList();
    }, 500);
  }

  ngOnInit(): void {
    this.getCustomerType()
    this.getUsersForDropDown()
    // this.checkInstaFinancial()
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.getCognitoUserDetail = resp?.userData;

        this.tenantId = resp.tenantId
      }
    })
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();
    this.id = this.isPopup ? '' : this.route.snapshot?.params['id'];
    this.isType = this.route.snapshot?.params?.['key'] === 'show' ? 'show' : false;
    if (this.id) {
      this.isAddMode = false;
      // this.id = this.partyMaster?.partymasterId;
    }
    this.isEnabled(this.isType)
 
 
    

    // this.id
    //   ? this.partyMasterForm.disable() : this.partyMasterForm.enable
    // this.downloadOrderReport(this.id)
    if (!this.isAddMode) {
      this.getPartyMasterById(this.id);
      this.getBatchList(this.id)
      this.getCountryList();

    } else {
      this.addNewBranch()
      this.addNewCustomer()
      this.getCountryList();
    }
this.getSupplyStateList()
   this.getRoleList()
  }
  driverRoles:any = [];
  getRoleList() { 
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = { 
      roleName : 'Transport',
      orgId: this.commonfunction.getAgentDetails()?.orgId
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

  loadData(){
    this.buildForm();
    this.id = ''
    this.isAddMode = true
    this.selectedIndex = 0;
    this.submitted = false
    this.listOfTagOptions = [];
    this.addNewBranch()
  }
  onTabChange(event: MatTabChangeEvent): void {
    if (event.tab.textLabel === 'Address') {
      this.getBankList();
    }
  }
  isEnabled(isType: boolean) {
    if (!isType) {
      this.Overview.enable();
      this.AddressCustomer.enable();
      this.AddressBranch.enable();
      this.KYCAndDocuments.enable();
      this.salesRepresentativeForm.enable();
      this.creditControlDetailsForm.enable();
      // this.cibilActionForm.enable();
    } else {
      this.Overview.disable();
      this.AddressCustomer.disable();
      this.AddressBranch.disable();
      this.KYCAndDocuments.disable();
      this.salesRepresentativeForm.disable();
      this.creditControlDetailsForm.disable();
      // this.cibilActionForm.enable()
    }
  }

  get f1() {
    return this.partyMasterForm.controls;
  }
  get fq() { return this.addStateForm?.controls; }
  get f5() { return this.addCityForm?.controls; }
  addStateForm: FormGroup;
  shipmentTypes: any = []
  getCustomerType() {

    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      status: true,
      "typeCategory": {
        "$in": ['ISF', 'carrierType']
      }
    }
    this.commonService.getSTList("systemtype", payload)?.subscribe((res: any) => {
      let customerTypeListHold = res?.documents?.filter(x => x.typeCategory === "ISF");

      this.shipmentTypes = res?.documents?.filter(x => (x.typeCategory === "carrierType"  ));
     
      if(this.isPopup && this.customerTypeFromPopup){  
        customerTypeListHold = customerTypeListHold?.filter(x => x.typeName === this.customerTypeFromPopup)
       
        this.CustomerTypeList = customerTypeListHold.map(e => {
          return {
            item_id: e.systemtypeId,
            item_text: e.typeName
          }
        })  
      }else{ 
        this.CustomerTypeList = customerTypeListHold.map(e => {
          return {
            item_id: e.systemtypeId,
            item_text: e.typeName
          }
        }) 
      }
      
      // this.CustomerTypeList = customerTypeListHold

    });
  }
  toggleValidation() {
    const customerControl = this.Overview.get('customerList');

    if (this.Overview.value?.groupCompany) {
      customerControl?.setValidators([Validators.required]);
    } else {
      customerControl?.clearValidators();
    }

    // Update the validity of the control
    customerControl?.updateValueAndValidity();
  }
  getPartyList() {
    let payload = this.commonService.filterList()
    payload.query = {
      status: true,
      parentCompany: true
    }
    this.commonService.getSTList("partymaster", payload).subscribe((data) => {
      this.partyMasterLength = data.documents;
      this.partyMasterCount = data.documents.length;
    });
  }

  financialData: any = []
  companyy: any = []
  director: any = [];
  downloadOrderReport(id) {
    let payloadOrder = {
      partymasterId: id,
    }

    this.commonService.getCibilRequest("downloadOrderReport", payloadOrder).subscribe((response) => {
    
      if (!response) return;
      const data = response?.InstaDetailed?.StatementOfProfitAndLoss;
      const fiscalYearsArray = Object.keys(data)
        .filter(key => key.startsWith('FY')) // Filter only keys starting with "FY"
        .map(key => ({ year: key, data: data[key] })); // Map to new array of objects
      
      this.financialData = fiscalYearsArray ?? [];

      const compnydata = response?.InstaDetailed?.CompanyMasterSummary;
      this.companyy = compnydata
      this.director = response.documents[0].directorSignatoryMasterSummary.DirectorCurrentDirectorshipMasterSummary.Director[0];
    }, (error) => {
      this.notification.create('error', 'Failed to download the report.', error?.error?.error?.message || '');
    });
  }
  checkStatus: any;
  downloadCheckStatus(id) {
    let payloadOrder = {
      partymasterId: id,
    }

    this.commonService.getCibilRequest("checkOrderReport", payloadOrder).subscribe((response) => {
    
      this.checkStatus = response;
    }, (error) => {
      this.notification.create('error', 'Failed to download the report.', error?.error?.error?.message || '');
    });
  }
  CreateOntherReport() {
    let payloadOrder = {
      partymasterId: this.id,
    }

    this.commonService.getCibilRequest("createOrderReport", payloadOrder).subscribe((response) => {
     

    }, (error) => {
      this.notification.create('error', 'Failed to download the report.', error?.error?.error?.message || '');
    });
    // this.commonService.getSTList1("ulipMCA", payloadOrder).subscribe((response) => {
    //   this.ulipmcaData =  response?.response?.[0]?.response?.data ?? [];
    // }, (error) => {
    //   this.notification.create('error', 'Failed to download the report.', error?.message || '');
    // });
  }
  
  selectTab(selectedTab: any) {
    this.tabs.forEach(tab => tab.active = false);
    selectedTab.active = true;
    this.tableColumns = [
      `${['Quoting', 'Working']?.includes(selectedTab?.name) ? 'InquiryNo' : 'JobNo'}`,
      "Consignee",
      "POL",
      "POD",
      "LoadType",
      "Status",
      "UpdatedOn",
      "UpdatedBy"
    ];
    this.getfilterrecord();
  }

  filterByOwner() {
    // Implement filter by owner logic
  }
  onCheckboxChange(isChecked: boolean, type: string) {

    if (type === 'groupCompany' && isChecked) {
      this.Overview.patchValue({ groupCompany: true, parentCompany: false });
    } else if (type === 'parentCompany' && isChecked) {
      this.Overview.patchValue({ parentCompany: true, groupCompany: false });
    }
    else if (type === 'groupCompany' && !isChecked) {
      this.Overview.patchValue({ parentCompany: true, groupCompany: false });
    }
    else if (type === 'parentCompany' && !isChecked) {
      this.Overview.patchValue({ parentCompany: false, groupCompany: true });
    }
    this.Overview.updateValueAndValidity()
  }




  buildForm() {
    this.Overview = this.formBuilder.group({
      name: ['', Validators.required],
      shortname: [''],
      companyCin: [''],
      annualTurnover: [''],
      annualTernover: [''],
      customerStatus: ['Resident'],
      country: ['' ],
      state: [''],
      city: [''],
      parentCompany: [false],
      groupCompany: [false],
      panNo: ['' ],
      address: ['', [this.forbiddenCharactersValidator()]],
      pinCode: [''],
      partyCurrency: ['', Validators.required],
      primaryEmailId: ['', [ Validators.pattern(/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})(,\s*[\w-\.]+@([\w-]+\.)+[\w-]{2,4})*$/)]],
      customerType: [[]],
      ImportExport: ['', Validators.required],
      principle: [''],
      partyShortcode: [''],
      chequeAcceptance: [false],
      isSupplier : [false],
      isSez: [false],
      isRegisterCompany: [false],
      isRegister: [false],
      isUser: [false],
      bankName: [''],
      notes: [],
      customerList: [''],
      overviewTable: [],
    });
    this.AddressCustomer = this.formBuilder.group({
      customer: this.formBuilder.array([]),
    })
    this.AddressBranch = this.formBuilder.group({
      branch: this.formBuilder.array([]),
    })
    this.KYCAndDocuments = this.formBuilder.group({
      kycPan: [''],
      kycGst: [''],
      CompanydocumentId: [''],
      CompanydocumentName: [''],
      TaxdocumentId: [''],
      TaxdocumentName: [''],
      Doc: [''],
      completeKYC: [false],
    });
    this.notesForm = this.formBuilder.group({
      notesRemark: ['', [Validators.required]],
      noteDate: ['']
    });
    this.salesRepresentativeForm = this.formBuilder.group({
      saleName: [''],
      saleCode: [''],
      saleLocation: [''],
      saleFrom: [''],
      salemoblino: [''],
      saleemail: ['']
    });
    this.creditControlDetailsForm = this.formBuilder.group({
      TDS_Nature: [''],
      TDS_flag: [''],
      TDS_certificate: [''],
      TDS_certificate_valid: [''],
      TDS_PERCENT: [''],
      TDS_limit: [''],
      FLAT_RATE_DETENTION: [''],
      lumsumDateFrom: [''],
      lumsumDateTo: [''],
      daysinPeriod: [0],
      amount: [0],
      currency: ['']
    });
    // this.cibilActionForm = this.formBuilder.group({
    //   companyCin:[''],
    // })
    this.filterTableForm = this.formBuilder.group({
      name: ['', Validators.required],
      stage: ['', Validators.required],
      tags: [''],
      overviewPhNo: ['', Validators.required],
      overviewStatus: ['', Validators.required],
      overviewUser: ['', [Validators.required]]
    });



    // this.partyMasterForm = this.formBuilder.group(
    //   {
    //     name: ['', [Validators.required]],
    //     shortname: [''],
    //     customerType: [''],
    //     customerStatus: ['Resident'],
    //     address: ['', [Validators.required, this.forbiddenCharactersValidator()]],
    //     primaryEmailId: ['', [Validators.required, Validators.pattern(environment.validate.email)]],
    //     website: ['', [Validators.pattern(environment.validate.website)]],
    //     country: ['', [Validators.required]],
    //     state: ['', [Validators.required]],
    //     city: ['', [Validators.required]],
    //     groupCompany: [true],
    //     pinCode: ['', [Validators.required]],
    //     partyCurrency: ['',[Validators.required]],
    //     primaryAreaCode: [0],

    //     faxCountryCode: [''],
    //     faxAreaCode: [''],
    //     faxNo: [''],
    //     tanNo: [''],
    //     principle: [''],
    //     ImportExport: ['', [Validators.required]],
    //     importTeun: [''],
    //     exportTeun: [''],
    //     annualTernover: [''],
    //     accountCode: [''],

    //     rateCheck: [true],
    //     ratecheckRO: [true],
    //     ratecheckdraftBL: [true],
    //     ratecheckbl: [true],
    //     proformaRequiredIMP: [true],
    //     proformaRequiredEXP: [true],
    //     GROUP_COMPANIES_NAME: [''],
    //     refundAC_Code: [''],
    //     BROKERAGE_AC_CODE: [''],
    //     panNo: [''],
    //     kycPan: [''],
    //     kycGst: [''],
    //     CompanydocumentId: [''],
    //     CompanydocumentName: [''],
    //     TaxdocumentId: [''],
    //     TaxdocumentName: [''],
    //     completeKYC: [false],
    //     serviceTaxNo: [''],
    //     creadirCustomer: [true],
    //     saleemail: ['', [Validators.required]],
    //     bankName: [''],
    //     ad_code: [''],
    //     serviceTax: [''],
    //     cha_id: [''],
    //     activeFlag: [true],
    //     cust_acc_no: [''],
    //     to_site: [''],
    //     disc_bl_fees: [''],
    //     CUSTOMER_ACC_CODE: [''],
    //     BROKERAGE_PAYABLE: [true],
    //     remarks: [''],
    //     chequeAcceptance: [true],
    //     imp_flag: [true],
    //     exp_flag: [true],
    //     DEACTIVATION_REASON: [''],
    //     DEACTIVATION_Date: [''],
    //     EXP_SC_CODE: [''],
    //     IMP_SC_CODE: [''],
    //     RESIDENT_STATUS: [true],
    //     TDS_Nature: [''],
    //     TDS_flag: [true],
    //     TDS_certificate: [true],
    //     TDS_limit: [''],
    //     TDS_certificate_valid: [''],
    //     TDS_PERCENT: [''],
    //     GST_NO: [''],
    //     SER_TAX_EXMP: [''],
    //     SER_TAX_EXMP_NO: [''],
    //     S_TAX_LAST_MOD: [''],
    //     S_TAX_LAST_DATE: [''],
    //     KYC_FLAG: [true],
    //     CHECK_ACCEPT_STATUS: [true],
    //     FLAT_RATE_DETENTION: [''],
    //     TDS_GST_APPLICABLE: [true],


    //     saleFrom: [''],
    //     saleLocation: [''],
    //     salemoblino: [''],
    //     opsmobile: [''],
    //     saleCode: [''],
    //     saleName: [''],
    //     opsFrom: [''],
    //     opsLocation: [''],
    //     opsCode: [''],
    //     opsName: [''],
    //     opsEmail: [''],
    //     isSez: [false],
    //     isRegister: [false],
    //     isUser: [false],
    //     reg_UN_UIN: [''],
    //     branch: this.formBuilder.array([]),
    //     customer: this.formBuilder.array([]),

    //     lumsumDateFrom: [''],
    //     lumsumDateTo: [''],
    //     daysinPeriod: [0],
    //     amount: [0],
    //     currency: [''],

    //   });
    // this.Overview.get('country')?.valueChanges.subscribe(value => {
    //   this.setPanNoValidator(value);
    // });
  }
  get f() {
    return this.Overview.controls; // Access form controls using Overview
  }
  get addressCustomerControls() {
    return this.AddressCustomer.controls; // Access form controls in AddressCustomer
  }
  get addressBranchControls() {
    return this.AddressBranch.controls; // Access form controls in AddressBranch
  }
  get kycAndDocumentsControls() {
    return this.KYCAndDocuments.controls; // Access form controls in KYCAndDocuments
  }
  get notesControls() {
    return this.notesForm.controls; // Access form controls in KYCAndDocuments
  }
  get salesRepresentativeControls() {
    return this.salesRepresentativeForm.controls; // Access form controls in salesRepresentativeForm
  }
  get creditControlDetailsControls() {
    return this.creditControlDetailsForm.controls; // Access form controls in creditControlDetailsForm
  }
  // get cibilAction(){
  //   return this.cibilActionForm.controls;
  // }
  get filterTableFormcontrols() {
    return this.filterTableForm.controls; // Access form controls in creditControlDetailsForm
  }
  addnotes() {
    if (!this.Overview.value.notes) {
      this.Overview.value.notes = [];
    }
    this.Overview?.value?.notes.push({
      notes: this.notesForm.value?.notesRemark,
      createdBy: this.getCognitoUserDetail?.name + ' ' + this.getCognitoUserDetail?.userLastname,
      userId: this.getCognitoUserDetail?.userId,
      noteDate: this.notesForm.value?.noteDate,
      createdOn: new Date()
    })
    this.notesForm.reset();
    this.modalService.dismissAll();
  }
  onDelete(index) {
    if (this.isType) return;
    this.Overview?.value?.notes?.splice(index, 1)
  }
  setPanNoValidator(country: string) {
    const panNoControl = this.Overview.get('panNo');
    if (country === 'IN') {
      panNoControl?.setValidators([Validators.required, Validators.pattern('[A-Z]{5}[0-9]{4}[A-Z]{1}')]);
    } else {
      panNoControl?.clearValidators();
    }
    panNoControl?.updateValueAndValidity();
  }
  getCountryList() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = { status: true }

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
  getStateListBranch(index) {
    this.stateListBranch = [];
    this.cityListBranch = [];
    let payload = this.commonService.filterList()
    payload.query = {
      "countryId": this.AddressBranch.controls.branch['controls'][index].controls.barnch_country?.value, status: true,
    }    
    const countryName = this.countryList.find(x=> x?.countryId === this.AddressBranch.controls.branch['controls'][index].controls.barnch_country?.value)?.countryName
    if(countryName?.toLowerCase() == 'india'){
      this.AddressBranch.controls.branch['controls'][index].get('customerStatus').setValue('Resident')
    }
    else{
      this.AddressBranch.controls.branch['controls'][index].get('customerStatus').setValue('Non Resident')
    }

    if (this.countryList) {
      let countryData = this.countryList.filter(x => x?.countryId === this.Overview.get('country').value);

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

    let supplyCode = this.stateListBranch.filter(i => i.stateId === this.AddressBranch.controls.branch['controls'][index].controls.branch_state?.value)[0]?.stateCode
    // this.AddressBranch.controls.branch['controls'][index].controls.placeofSupply.setValue(supplyCode)

    this.cityListBranch = [];


    let payload = this.commonService.filterList()
    payload.query = {
      stateId: this.AddressBranch.controls.branch['controls'][index].controls.branch_state?.value, status: true,
    }
    this.commonService.getSTList("city", payload).subscribe((data) => {
      this.cityListBranch = data.documents;
    });
  }

  // changegroupCompany() {
  //   if (this.partyMasterForm.get('groupCompany').value) {
  //     this.notification.create(
  //       'info',
  //       'PAN NO is already in use.',
  //       ''
  //     );
  //   }
  // }
  getStateList() {
    this.stateList = [];
    this.cityList = [];
    let countryData = this.countryList?.filter(x => x?.countryId === this.Overview.get('country').value);

    this.callingCodeList = countryData;

    let payload = this.commonService.filterList()
    payload.query = {
      "countryId": this.Overview.get('country').value, status: true,
    }
    this.commonService.getSTList("state", payload).subscribe((data) => {
      this.stateList = data.documents;
      if (!this.isAddMode) {
        this.getCityList();
      }
    });
  }


  getSupplyStateList() {
    this.supplystateList = [];
    this.cityList = []; 
    let countryData = this.countryList?.filter(x => x?.countryId === this.Overview.get('country').value);

    this.callingCodeList = countryData;

    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status":  true,
    }
    this.commonService.getSTList("state", payload)?.subscribe((data) => {
      this.supplystateList = data.documents; 
    });
  }
  supplystateList :any=[]
  getCityList() {
    this.cityList = [];
    let payload = this.commonService.filterList()
    payload.query = {
      stateId: this.Overview.get('state').value, status: true,
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
  getBankList() {
    if(!this.id){
      return
    }
    let payload = this.commonService.filterList()
    payload.query = {
      isBank: true, status: true,
      partyId : this.id,
    //   partyName : {
    //     "$regex" : this.Overview.get('name').value,
    //     "$options": "i"
    // } 
    }
    this.commonService.getSTList("bank", payload).subscribe((data) => {
      this.bankList = data.documents;
    });
  }

  
  customerStatus(i?) {

    let branchList = this.AddressBranch.get('branch') as FormArray; 
    if(i){
      const fromgroup = branchList.controls[i] as FormGroup 
    if (fromgroup.get('customerStatus').value == 'Non Resident') {
 

        fromgroup.get('tax_name').setValue('')

        fromgroup.get('barnch_country').clearValidators()
        fromgroup.get('branch_state').clearValidators()
        fromgroup.get('branch_city').clearValidators()
        fromgroup.get('pinCode').clearValidators()  
        fromgroup.get('tax_name').clearValidators()   
        fromgroup.get('placeofSupply').clearValidators()
        fromgroup.get('tax_number').clearValidators()   
        
        fromgroup.get('barnch_country').updateValueAndValidity() 
        fromgroup.get('branch_state').updateValueAndValidity() 
        fromgroup.get('branch_city').updateValueAndValidity() 
        fromgroup.get('pinCode').updateValueAndValidity() 
        fromgroup.get('tax_name').updateValueAndValidity()  
        fromgroup.get('placeofSupply').updateValueAndValidity()
        fromgroup.get('tax_number').updateValueAndValidity() 

    }
    else { 
      fromgroup.get('barnch_country').setValidators(Validators.required)
      // fromgroup.get('branch_state').setValidators(Validators.required)
      // fromgroup.get('branch_city').setValidators(Validators.required)
      // fromgroup.get('pinCode').setValidators(Validators.required)  
      fromgroup.get('tax_name').setValidators(Validators.required)   
      fromgroup.get('placeofSupply').setValidators(Validators.required)

      fromgroup.get('barnch_country').updateValueAndValidity() 
      fromgroup.get('branch_state').updateValueAndValidity() 
      fromgroup.get('branch_city').updateValueAndValidity() 
      fromgroup.get('pinCode').updateValueAndValidity() 
      fromgroup.get('tax_name').updateValueAndValidity()  
      fromgroup.get('placeofSupply').updateValueAndValidity()

    }
  }else{
      for (let i = 0; i < this.branch.length; i++) { 
        const fromgroup = branchList.controls[i] as FormGroup 
        if (fromgroup.get('customerStatus').value == 'Non Resident') {
 
          fromgroup.get('barnch_country').clearValidators()
          fromgroup.get('branch_state').clearValidators()
          fromgroup.get('branch_city').clearValidators()
          fromgroup.get('pinCode').clearValidators()  
          fromgroup.get('tax_name').clearValidators()   
          fromgroup.get('placeofSupply').clearValidators()
          fromgroup.get('tax_number').clearValidators()   

          fromgroup.get('barnch_country').updateValueAndValidity() 
          fromgroup.get('branch_state').updateValueAndValidity() 
          fromgroup.get('branch_city').updateValueAndValidity() 
          fromgroup.get('pinCode').updateValueAndValidity() 
          fromgroup.get('tax_name').updateValueAndValidity()  
          fromgroup.get('placeofSupply').updateValueAndValidity()
          fromgroup.get('tax_number').updateValueAndValidity() 
  
      }
      else { 
        fromgroup.get('barnch_country').setValidators(Validators.required)
        fromgroup.get('branch_state').setValidators(Validators.required)
        fromgroup.get('branch_city').setValidators(Validators.required)
        // fromgroup.get('pinCode').setValidators(Validators.required)  
        fromgroup.get('tax_name').setValidators(Validators.required)   
        fromgroup.get('placeofSupply').setValidators(Validators.required)
  
        fromgroup.get('barnch_country').updateValueAndValidity() 
        fromgroup.get('branch_state').updateValueAndValidity() 
        fromgroup.get('branch_city').updateValueAndValidity() 
        // fromgroup.get('pinCode').updateValueAndValidity() 
        fromgroup.get('tax_name').updateValueAndValidity()  
        fromgroup.get('placeofSupply').updateValueAndValidity()
  
      }
      }
    }
  }

  setValidationForTAX(i?){
    let branchList = this.AddressBranch.get('branch') as FormArray;

    if(i){
      const fromgroup = branchList.controls[i] as FormGroup
    
      if(fromgroup.get('tax_name').value == 'GST'){
        fromgroup.get('tax_number').setValidators(Validators.required)
        fromgroup.get('tax_number').updateValueAndValidity() 
        // fromgroup.get('tanNo').setValidators(Validators.required)
        fromgroup.get('tanNo').updateValueAndValidity() 
      }else{ 
        fromgroup.get('tax_number').clearValidators()
        fromgroup.get('tax_number').updateValueAndValidity()
        fromgroup.get('tanNo').clearValidators()
        fromgroup.get('tanNo').updateValueAndValidity()
      }
    }else{
      for (let i = 0; i < this.branch.length; i++) {
        const fromgroup = branchList.controls[i] as FormGroup
  
        if(fromgroup.get('tax_name').value == 'GST'){
          fromgroup.get('tax_number').setValidators(Validators.required)
          fromgroup.get('tax_number').updateValueAndValidity()
          // fromgroup.get('tanNo').setValidators(Validators.required)
          fromgroup.get('tanNo').updateValueAndValidity() 
         
        }else{
         
          fromgroup.get('tax_number').clearValidators()
          fromgroup.get('tax_number').updateValueAndValidity()
          fromgroup.get('tanNo').clearValidators()
          fromgroup.get('tanNo').updateValueAndValidity()
        }
      }
    }
   


   
  }
  getPartyMasterById(id) {

    let payload = this.commonService.filterList()
    payload.query = {
      partymasterId: id,
    }
    this.commonService.getSTList("partymaster", payload).subscribe((res: any) => {
      this.smartAgentDetail = res.documents[0];
      if (this.smartAgentDetail?.instafinancial?.isReportDownloaded && this.smartAgentDetail?.instafinancial?.orderId) {
        setTimeout(() => {
          this.getReportFromOrderId();
        }, 3000);
      }
      this.getPatch(this.smartAgentDetail);
      this.getCountryList();
    });
  }
  directorSignatorydata: any = [];
  getReportFromOrderId() {
    let payload = this.commonService.filterList()
    payload.query = {
      orderId: this.smartAgentDetail?.instafinancial?.orderId
    }
    this.commonService.getSTList("instafindetail", payload).subscribe((res: any) => {
      if (!res) return;
      const data = res.documents[0].directorSignatoryMasterSummary.DirectorCurrentDirectorshipMasterSummary.Director
      const directorSignatoryMaster = Object.keys(data)
        .filter(key => key.startsWith('DirectorCurrentDirectorshipMasterSummary')) // Filter only keys starting with "FY"
        .map(key => ({ CompanyOtherCurrentDirectorship: key, data: data[key] })); // Map to new array of objects
    
      this.directorSignatorydata = directorSignatoryMaster ?? [];


      if (res?.documents?.[0]?.companyMasterSummary) this.companyy = res?.documents?.[0]?.companyMasterSummary
      if (this.director = res.documents[0].directorSignatoryMasterSummary.DirectorCurrentDirectorshipMasterSummary.Director) this.director = res.documents[0].directorSignatoryMasterSummary.DirectorCurrentDirectorshipMasterSummary.Director;
    }, () => {

    });
  }
  getPatch(details) {
    this.listOfTagOptions = details.customerType;
    this.hideCreateUSer = details?.isUser || false;

    let parentCompany = details?.parentCompany || false;
    let groupCompany = details?.groupCompany || false;
    if (parentCompany) {
      groupCompany = false;
    } else if (groupCompany) {
      parentCompany = false;
    }

    // Patch for Overview form
    this.Overview.patchValue({
      name: details.name || "",
      notes: details?.notes || [],
      overviewTable: details?.overviewTable || [],
      shortname: details.shortName || "",
      companyCin: details.companyCin || "",
      customerType: details.customerType || "",
      customerStatus: details.customerStatus || "Resident",
      principle: details?.principle || "",
      partyShortcode: details?.partyShortcode || "",
      ImportExport: details.ImportExport || "",
      importTeun: details.importTeun || "",
      exportTeun: details.exportTeun || "",
      annualTernover: details.annualTurnover || "",
      accountCode: details.accountCode || "",
      partyCurrency: details?.partyCurrency?.currencyId || '',
      parentCompany: parentCompany,
      groupCompany: groupCompany,
      customerList: details?.parenetcustomerId || "",
      chequeAcceptance: details?.chequeAcceptance || true,
      isSupplier : details?.isSupplier || false,
      primaryEmailId: details.primaryMailId || "",
      country: details.addressInfo.countryId || "",
      state: details.addressInfo.stateId || "",
      city: details.addressInfo.cityId || "",
      pinCode: details.addressInfo.postalCode || "",
      address: details.addressInfo.address || "",
      panNo: details.panNo || ""
    });
    this.CreateOntherReport()
    // Patch for AddressBranch form
    this.AddressBranch.patchValue({
      faxCountryCode: details?.faxNo?.faxCountryCode || "",
      faxAreaCode: details?.faxNo?.faxAreaCode || "",
      faxNo: details?.faxNo?.faxNo || "",
      bankName: details?.bankName || "",
      ad_code: details?.adCode || "",
      cha_id: details?.chaId || "",
      cust_acc_no: details?.customerAccNumber || "",
      to_site: details?.tosite || "",
      CUSTOMER_ACC_CODE: details?.customerAccCode || "",
    });

    // Patch for KYCAndDocuments form
    this.KYCAndDocuments.patchValue({
      serviceTaxNo: details.serviceTaxNo || "",
      serviceTax: details.serviceTax || "",
      GST_NO: details.gstNo || "",
      kycPan: details.kycPan || "",
      kycGst: details.kycGst || "",
      CompanydocumentId: details.CompanydocumentId || "",
      CompanydocumentName: details.CompanydocumentName || "",
      TaxdocumentId: details.TaxdocumentId || "",
      TaxdocumentName: details.TaxdocumentName || "",
      completeKYC: details?.completeKYC || false,
    });

    // Patch for salesRepresentativeForm
    this.salesRepresentativeForm.patchValue({
      saleFrom: details.saleFrom || "",
      saleLocation: details.saleLocation || "",
      saleCode: details.saleCode || "",
      saleName: details.saleName || "",
      saleemail: details.saleemail || "",
      salemoblino: details.salemoblino || "",
    });

    // Patch for creditControlDetailsForm
    this.creditControlDetailsForm.patchValue({
      currency: details?.currency?.currencyId || "",
      TDS_Nature: details.TDSNature || "",
      TDS_flag: details.tdsFlag || "",
      TDS_certificate: details.tdsCertificate || "",
      TDS_certificate_valid: details.tdsCertificateValid || "",
      TDS_PERCENT: details.tdsPercent || "",
      TDS_limit: details.TDS_limit || "",
      FLAT_RATE_DETENTION: details.flatRateDetention || "",
      serviceTaxExmp: details.serviceTaxExmp || "",
      serviceTaxExmpNo: details.serviceTaxExmpNo || "",
      serviceTaxLastModify: details.serviceTaxLastModify || "",
      serviceTaxLastDate: details.serviceTaxLastDate || "",
    });

    // this.cibilActionForm.patchValue({
    //   companyCin: details?.companyCin || ""
    // })
    // Handle branch and customer arrays
    if (details?.branch.length > 0) {
      details?.branch?.forEach(e => {
        this.branch.push(this.addBranch(e));
      });
      setTimeout(() => {
        this.setValidationForTAX()
        this.customerStatus()
      }, 2000);
    }
    if (details?.customer.length > 0) {
      details?.customer?.forEach(e => {
        this.customer.push(this.addCustomer(e));
      });
    }
  }
 previousTab() {
    const currentIndex = this.selectedIndex;
    if (currentIndex > 0) {
      this.selectedIndex = currentIndex - 1;
    }
  }
  // Method to navigate to the next tab
  nextTab() {
    const currentIndex = this.selectedIndex;
    if (currentIndex < 7 - 1) {
      this.selectedIndex = currentIndex + 1;
    }
  }
  instafinancial: boolean = false;
  onSave() {
    this.submitted = true;
    // Check if all forms are valid
    if (this.Overview.invalid) {
      this.selectedIndex = 0; // Overview form is invalid
      this.notification.create('error', 'Please fill all required fields correctly.', '');
      this.Overview.markAllAsTouched(); // Mark all fields as touched to show validation errors
      return;
    }

    if (this.AddressCustomer.invalid) {
      this.selectedIndex = 2; // Address Customer form is invalid
      this.notification.create('error', 'Please fill all required fields correctly.', '');
      this.AddressCustomer.markAllAsTouched();
      return;
    }

    if (this.AddressBranch.invalid) {
      this.selectedIndex = 1; // Address Branch form is invalid
      this.notification.create('error', 'Please fill all required fields correctly.', '');
      this.AddressBranch.markAllAsTouched();
      return;
    }

    if (this.KYCAndDocuments.invalid) {
      this.selectedIndex = 3; // KYC and Documents form is invalid
      this.notification.create('error', 'Please fill all required fields correctly.', '');
      this.KYCAndDocuments.markAllAsTouched();
      return;
    }

    if (this.salesRepresentativeForm.invalid) {
      this.selectedIndex = 4; // Sales Representative form is invalid
      this.notification.create('error', 'Please fill all required fields correctly.', '');
      this.salesRepresentativeForm.markAllAsTouched();
      return;
    }

    if (this.creditControlDetailsForm.invalid) {
      this.selectedIndex = 5; // Credit Control form is invalid
      this.notification.create('error', 'Please fill all required fields correctly.', '');
      this.creditControlDetailsForm.markAllAsTouched();
      return;
    }
    if (
      this.Overview.valid &&
      this.AddressCustomer.valid &&
      this.AddressBranch.valid &&
      this.KYCAndDocuments.valid &&
      this.salesRepresentativeForm.valid &&
      this.creditControlDetailsForm.valid
    ) {
      // Create the model from the valid forms
      this.createModel();
      let createBody = [];
      createBody.push({ ...this.smartAgentDetail, paidStatus: this.smartAgentDetail?.paidStatus ?? false });

      // Update case if `id` exists
      if (this.id) {
        this.commonService.UpdateToST(`partymaster/${this.id}`, createBody[0]).subscribe((data: any) => {
          if (data) {
            this.notification.create('success', 'Updated Successfully', '');
            if (!this.hideCreateUSer && this.Overview?.get('isUser').value) {
              this.createUser(data);
            }
            // this.setRefreshPartyMasterList.emit(data);
            if (this.listOfTagOptions.some(item => item?.item_text?.toLowerCase() === 'shipping line')) {
              this.partyMasterId = data?.partymasterId
              if(this.selectedIndex == 0){
              this.createCarrier(data)
              }
            }

            if(this.isPopup){
              // this.modalService.dismissAll() 
                this.getList.emit(data); 
            }else{
              this.router.navigate(['address-book/list'])
            }
            

            this.onClose();
            this.submitted = false;
          }
        }, (error) => {
          this.notification.create('error', error?.error?.error?.message, '');
        });
      } else {
        this.commonService.addToST('partymaster', createBody[0]).subscribe((data: any) => {
          if (data) {
            this.notification.create('success', 'Added Successfully', '');
            if (this.Overview?.get('isUser').value) {
              this.createUser(data);
            }
            if (this.listOfTagOptions.some(item => item?.item_text?.toLowerCase() === 'shipping line')) {
              this.partyMasterId = data?.partymasterId
              if(this.selectedIndex == 0){
              this.createCarrier(data,true)
              }
            }
            // this.setRefreshPartyMasterList.emit(data);
            if(this.isPopup){
              // this.modalService.dismissAll()
              if(!this.listOfTagOptions.some(item => item?.item_text?.toLowerCase() === 'shipping line')){
                this.getList.emit(data);
                this.cancelBank();
              }
             
            }else{
              this.router.navigate(['address-book/list'])
            }
            this.onClose();
            this.submitted = false;
          }
        }, (error) => {
          this.notification.create('error', error?.error?.error?.message, '');
        });
      }
    } else {
      this.notification.create('error', 'Please fill all required fields correctly.', '');
    }
  }


  onSave1(e) {
    this.submitted = true;
    // Check if all forms are valid
    if (this.Overview.invalid) {
      this.selectedIndex = 0; // Overview form is invalid
      this.notification.create('error', 'Please fill all required fields correctly.', '');
      this.Overview.markAllAsTouched(); // Mark all fields as touched to show validation errors
      return;
    }

    
    if (  this.Overview.valid   ) {
      this.smartAgentDetail = new partymasterDetail();
      // Create the model from the valid forms
      this.createModel();
      let createBody = [];
      createBody.push({ ...this.smartAgentDetail, paidStatus: this.smartAgentDetail?.paidStatus ?? false });

      this.commonService.addToST('partymaster', createBody[0]).subscribe((data: any) => {
        if (data) {
          this.notification.create('success', 'Added Successfully', '');
          if (this.Overview?.get('isUser').value) {
            this.createUser(data);
          }
          if (this.listOfTagOptions.some(item => item?.item_text?.toLowerCase() === 'shipping line')) {
            this.partyMasterId = data?.partymasterId
            if(this.selectedIndex == 0){
            this.createCarrier(data,false)
            }
          } 

          this.smartAgentDetail = data;
          this.id = data?.partymasterId
          this.selectedIndex = 1 
          this.submitted = false;
        }
      }, (error) => {
        this.notification.create('error', error?.error?.error?.message, '');
      });
    } else {
      this.notification.create('error', 'Please fill all required fields correctly.', '');
    }
  }

  createCarrier(data,flag?) {
    let newCostItems = {
      name: data?.name,
      shortName: data?.partyShortcode,
      typeCategory: this.shipmentTypes?.find((x)=> x.typeName?.toLowerCase() == this.activeFrightAir ? "air" : "ocean")?.systemtypeId || '',
      ShipmentTypeName: this.shipmentTypes?.find(x => x.typeName?.toLowerCase() === (this.activeFrightAir ? "air" : "ocean"))?.typeName || (this.activeFrightAir ? "Air" : "Ocean"),
      scacCode: data?.scacCode,
      operatorCode: data?.operatorCode || '',
      email: data?.primaryMailId,
      status: true,
      phoneNo: data?.salemoblino,
      contactName: data?.saleName,
      branchId: '',
      branchName: '',
      createUser: this.driverRoles?.length > 0 ? this.Overview?.get('isUser').value || false : false,
      country: 'IN',
      feeder : false,
      fromPartyMaster : true,
      partymasterId:this.partyMasterId,
      "tenantId": this.tenantId,
    };
    this.commonService.addToST('shippingline', newCostItems).subscribe((x)=>{

      if(this.Overview?.get('isUser').value && false){
       
        if(this.driverRoles?.length == 0){
          // this.notification.create(
          //   'error',
          //   `We can't create user. Please Create Transport role in role master`,
          //   ''
          // );
          return false
        }
        let payload = {
          "tenantId": this.tenantId,
          "orgId": this.commonfunction.getAgentDetails().orgId,
          "agentId": '1',
          "name": data?.name,
          "userName": data?.name?.replace(/\s+/g, ''),
          "userLastname": '',
          "shortName": '',
          "officeLocation": '',
          "userEmail": data?.primaryMailId,
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
          "driverName" : x?.name,
          "driverId": x?.shippinglineId,
          "roles": this.driverRoles || [],
          "userStatus": true,
          "status": true,
          isEmail: false,
          isMobile: false,
          isPassword: false,
          "userId": "",
          "createdDate": new Date(),
          "updatedDate": new Date()
        };
    
    
        this.commonService.addToST(`user`, payload)?.subscribe();
     
      }
     
     
      if(this.isPopup && flag){
        this.getList.emit(data);
      }
    });
  }
  createUser(data) {
    let payload = {
      "tenantId": this.tenantId,
      "orgId": this.commonfunction.getAgentDetails().orgId,
      "agentId": '',
      "name": data?.name,
      "userName": data?.name?.replace(/\s+/g, ''),
      "userLastname": '',
      "shortName": '',
      "currency": this.currencyList.filter(x => x?.currencyId === this.Overview.get('partyCurrency').value)[0]?.currencyShortName || 'INR',
      "countryName": data?.addressInfo?.countryName,
      "countryId": data?.addressInfo?.countryId,
      "officeLocation": '',
      "userEmail": data?.primaryMailId,
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
      "userType": "customer",
      "customerName": data?.name,
      "customerId": data?.partymasterId,
      "roles": [
        {
          "roleId": "7c3764e1-06bf-11ef-9d77-3723d2ac1650",
          "roleName": "Customer",
          "_id": "663097502bac58cc79096bf1"
        }
      ],
      "userStatus": true,
      "status": true,
      isEmail: false,
      isMobile: false,
      isPassword: false,
      "userId": "",
      "createdDate": new Date(),
      "updatedDate": new Date()
    };


    this.commonService.addToST(`user`, payload)?.subscribe(res => {
      if (res) {
        // this.notification.create(
        //   'success',
        //   'User Created Successfully',
        //   ''
        // );
      }
    }); 
  }

  createModel() {
    let countryData = this.countryList?.filter(x => x?.countryId === this.Overview?.get('country')?.value) || []; 
    let stateData = this.stateList?.filter(x => x?.stateId === this.Overview.get('state').value)|| []; ;
    let cityData = this.cityList?.filter(x => x?.cityId === this.Overview.get('city').value) || [] ;
    let currencyData = this.currencyList.filter(x => x?.currencyId === this.Overview.get('partyCurrency').value) || [];
    this.smartAgentDetail.orgId = this.commonfunction.getAgentDetails().orgId;
    this.smartAgentDetail.currency = new Currency();
    this.smartAgentDetail.partyCurrency = new Currency();
    this.smartAgentDetail.tenantId = this.tenantId;
    // this.smartAgentDetail.paidStatus = false;
    this.smartAgentDetail.status = !this.id ? true : this.smartAgentDetail?.status ? this.smartAgentDetail?.status : false;
    this.smartAgentDetail.name = this.Overview?.get('name')?.value;
    this.smartAgentDetail.notes = this.Overview?.get('notes')?.value ?? [];
    this.smartAgentDetail.overviewTable = this.Overview?.get('overviewTable')?.value ?? [];
    this.smartAgentDetail.shortName = this.Overview?.get('shortname')?.value;
    this.smartAgentDetail.companyCin = this.Overview?.get('companyCin')?.value;
    this.smartAgentDetail.isSupplier = this.Overview?.get('isSupplier')?.value || false;

    this.smartAgentDetail.chequeAcceptance = this.Overview?.get('chequeAcceptance')?.value || false;
    this.smartAgentDetail.isSez = this.Overview?.get('isSez')?.value || false;
    
    this.smartAgentDetail.customerType = this.listOfTagOptions;
    this.smartAgentDetail.ImportExport = this.Overview?.get('ImportExport')?.value;
    this.smartAgentDetail.customerStatus = this.Overview?.get('customerStatus').value;
    // this.smartAgentDetail.addressInfo.address = this.Overview?.get('address').value;
    this.smartAgentDetail.addressInfo.address = this.branch?.controls[0]?.get('branch_address').value || '';
    this.smartAgentDetail.addressInfo.countryId = countryData[0]?.countryId || '';
    this.smartAgentDetail.addressInfo.countryISOCode = this.Overview?.get('country').value;
    this.smartAgentDetail.addressInfo.countryName = countryData[0]?.countryName || '';
    this.smartAgentDetail.addressInfo.stateId = stateData[0]?.stateId;
    this.smartAgentDetail.addressInfo.stateName = stateData[0]?.typeDescription;
    this.smartAgentDetail.addressInfo.stateCode = stateData[0]?.GSTNCode || '';
    this.smartAgentDetail.addressInfo.cityId = cityData[0]?.cityId;
    this.smartAgentDetail.addressInfo.cityName = cityData[0]?.cityName;
    this.smartAgentDetail.addressInfo.postalCode = this.Overview?.get('pinCode').value.toString();
    this.smartAgentDetail.primaryMailId = this.Overview?.get('primaryEmailId').value ||  this.branch.controls[0]?.get('pic_email').value;

    // Sales Representative Info
    this.smartAgentDetail.saleemail = this.salesRepresentativeForm?.get('saleemail').value;
    this.smartAgentDetail.saleFrom = this.salesRepresentativeForm?.get('saleFrom').value;
    this.smartAgentDetail.saleLocation = this.salesRepresentativeForm?.get('saleLocation').value;
    this.smartAgentDetail.saleCode = this.salesRepresentativeForm?.get('saleCode').value;
    this.smartAgentDetail.saleName = this.salesRepresentativeForm?.get('saleName').value;
    this.smartAgentDetail.salemoblino = this.salesRepresentativeForm?.get('salemoblino').value;

    // Credit Control Details
    this.smartAgentDetail.lumsumDateFrom = this.creditControlDetailsForm?.get('lumsumDateFrom').value;
    // this.smartAgentDetail.companyCin = this.creditControlDetailsForm?.get('companyCin').value;
    this.smartAgentDetail.lumsumDateTo = this.creditControlDetailsForm?.get('lumsumDateTo').value;
    this.smartAgentDetail.daysinPeriod = this.creditControlDetailsForm?.get('daysinPeriod').value || 0;
    this.smartAgentDetail.amount = this.creditControlDetailsForm?.get('amount').value || 0;

    // this.smartAgentDetail.companyCin = this.cibilActionForm?.get('companyCin').value; 
    // Currency Details
    this.smartAgentDetail.currency.currencyId = currencyData[0]?.currencyId;
    this.smartAgentDetail.currency.currencyCode = currencyData[0]?.currencyShortName;
    this.smartAgentDetail.currency.currencyName = currencyData[0]?.currencyName;
    this.smartAgentDetail.partyCurrency.currencyId = currencyData[0]?.currencyId;
    this.smartAgentDetail.partyCurrency.currencyCode = currencyData[0]?.currencyShortName;
    this.smartAgentDetail.partyCurrency.currencyName = currencyData[0]?.currencyName;

    // Additional Details from Overview
    this.smartAgentDetail.annualTurnover = this.Overview?.get('annualTernover').value.toString();
    this.smartAgentDetail.panNo = this.Overview?.get('panNo').value;
    this.smartAgentDetail.partyShortcode = this.Overview?.get('partyShortcode').value;
    this.smartAgentDetail.bankName = this.Overview?.get('bankName')?.value ?? '';
    this.smartAgentDetail.parentCompany = this.Overview.value?.parentCompany ?? false;
    let customerList: any = this.partyMasterLength.find(x => x?.partymasterId === this.Overview.get('customerList').value) ?? '';
    this.smartAgentDetail.parenetcustomerId = this.Overview.get('customerList').value;
    this.smartAgentDetail.parenetcustomerName = customerList?.name;

    // KYC Details
    this.smartAgentDetail.groupCompany = this.Overview?.get('groupCompany')?.value;
    this.smartAgentDetail.parentCompany = this.Overview?.get('parentCompany')?.value;
    this.smartAgentDetail.kycPan = this.KYCAndDocuments?.get('kycPan').value;
    this.smartAgentDetail.kycGst = this.KYCAndDocuments?.get('kycGst').value;
    this.smartAgentDetail.CompanydocumentId = this.KYCAndDocuments?.get('CompanydocumentId').value;
    this.smartAgentDetail.CompanydocumentName = this.KYCAndDocuments?.get('CompanydocumentName').value;
    this.smartAgentDetail.TaxdocumentId = this.KYCAndDocuments?.get('TaxdocumentId').value;
    this.smartAgentDetail.TaxdocumentName = this.KYCAndDocuments?.get('TaxdocumentName').value;
    this.smartAgentDetail.completeKYC = this.KYCAndDocuments?.get('completeKYC').value;

    // Address and Customer Information
    this.smartAgentDetail.branch = this.addArrayValue();
    this.smartAgentDetail.customer = this.addCustomerArray();
  }

  addCustomerArray() {
    const customerArray = []
    this.customer?.controls.forEach(element => {
      let customer = {
        customerName: element.value.customerName,
        address: element.value.address,
        phoneNo: element.value.phoneNo,
        email: element.value.email
      }
      customerArray.push(customer)
    })
    return customerArray
  }
  addArrayValue() {
    const branchArray = [];
    this.branch?.controls.forEach(element => {
      let branch = {
        customerStatus : element.value.customerStatus,
        branch_name: element.value.branch_name,
        branch_address: element.value.branch_address ||'',
        barnch_country: element.value.barnch_country ||'',
        branch_countryName: this.countryList?.filter(x => x.countryId === element.value.barnch_country)[0]?.countryName ||'',
        branch_state: element.value.branch_state ||'',
        branch_stateName: this.stateListBranch.filter(x => x.stateId === element.value.branch_state)[0]?.typeDescription ||'',
        branch_cityId: element.value.branch_city ||'',
        branch_city: element.value.branch_city ||'',
        pinCode: element.value.pinCode,
        stateCodeBranch: this.stateListBranch.filter(x => x.stateId === element.value.branch_state)[0]?.stateCode || '',
        placeofSupplyName:  this.supplystateList.filter(x => x.stateId === element.value.placeofSupply)[0]?.typeDescription || '',  
        placeofSupply: element.value.placeofSupply,
        partyCode: element.value.partyCode,
        bankName: element.value.bankName,
        bankNameText: (this.bankList ||[]).filter(x => x.bankId === element.value.bankName)[0]?.bankName || '',  
        panNo: element.value.tanNo,
        kycPan: element.value.kycPan,
        kycGst: element.value.kycGst,
        CompanydocumentId: element?.value?.CompanydocumentId || "",
        CompanydocumentName: element?.value?.CompanydocumentName || "",
        TaxdocumentId: element?.value?.TaxdocumentId || "",
        TaxdocumentName: element?.value?.TaxdocumentName || "",
        completeKYC: element?.value?.completeKYC || false,
        cust_acc_no: element.value.cust_acc_no,
        remarks: element.value.remarks,
        pic: element.value.pic,
        pic_phone: element.value.pic_phone,
        pic_email: element.value.pic_email,
        tax_name: element.value.tax_name,
        taxActive: element?.value?.taxActive || false,
        tax_number: element.value.tax_number,
        BROKERAGE_PAYABLE: element.value.BROKERAGE_PAYABLE,
        creadirCustomer: element.value.creadirCustomer,
        active_flag: element.value.active_flag,
        kyc_flag: element.value.kyc_flag,
        TDS_GST_APPLICABLE: element.value.TDS_GST_APPLICABLE,
        documents: element.value.documents
      }
      branchArray.push(branch)
    });
    return branchArray;
  }


  backbtn() {
    this.location.back();
  }
  onCancel() {
    if(this.isPopup){
      // this.modalService.dismissAll()
      if (this.modalRef) {
        this.modalRef.close(); // Close only this modal
        this.modalRef = null;  // Reset reference
      }
      this.getList.emit();
    }else{
      this.router.navigate(['address-book/list'])
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  onClose() {
    // this.modalService.dismissAll();
    this.submitted = false
    this.buildForm();
  }
  addNewCustomer() {
    this.customer.push(this.addCustomer(''))
  }
  addNewBranch() {
    this.branch.push(this.addBranch(''))
  }

  addCustomer(res) {
    return this.formBuilder.group({
      customerName: [res ? res?.customerName : ''],
      address: [res ? res?.address : ''],
      phoneNo: [res ? res?.phoneNo : ''],
      email: [res ? res?.email : '']
    })
  }
  deleteCustomer(index: number) {
    this.customer.removeAt(index);
  }
  addBranch(res) {

    return this.formBuilder.group({
      customerStatus : [res ? res.customerStatus : 'Resident' ],
      branch_name: [res ? res.branch_name : '', [Validators.required]],
      branch_address: [res ? res.branch_address : '', [Validators.required, this.forbiddenCharactersValidator()]],
      barnch_country: [res ? res.barnch_country : '', Validators.required],
      branch_countryName: [res ? res.barnch_countryName : ''],
      branch_state: [res ? res.branch_state : ''],
      branch_stateName: [res ? res?.branch_stateName : ''],
      branch_city: [res ? res.branch_cityId : ''],
      pinCode: [res ? res?.pinCode : ''],
      placeofSupply: [res ? res?.placeofSupply : ''],
      partyCode: [res ? res.partyCode : '',],
      bankName: [res ? res.bankName : ''],
      cust_acc_no: [res ? res.cust_acc_no : ''],
      remarks: [res ? res.remarks : ''],
      tanNo: [res ? res.panNo : ''],
      kycPan: [res ? res.kycPan : ''],
      kycGst: [res ? res.kycGst : ''],
      pic: [res ? res.pic : ''],
      pic_phone: [res ? res.pic_phone : ''],
      pic_email: [res ? res.pic_email : '', [Validators.pattern(this.regex.MULTIPLE_EMAIL_WITH_COMMA_SEPARATED)]],
      tax_name: [res ? res.tax_name : '',],
      taxActive: [res ? res.taxActive : false],
      tax_number: [res ? res.tax_number : '',],
      BROKERAGE_PAYABLE: [res ? res.BROKERAGE_PAYABLE : true],
      creadirCustomer: [res ? res.creadirCustomer : true],
      active_flag: [res ? res.active_flag : true],
      kyc_flag: [res ? res.kyc_flag : false],
      TDS_GST_APPLICABLE: [res ? res.TDS_GST_APPLICABLE : true],
      documents: [res ? res.documents : []]
    })

  }
  getBranchBank(i) {  
    this.branch.at(i).patchValue({
      cust_acc_no: this.bankList?.find((x) => x.bankId == this.branch.at(i).get('bankName')?.value)?.bankAccountCode
    })
  }
  checkGst(e, i) { 
    let payload = {
      "gstIN": e.target.value
    }
   
    if (e.target.value.length == 15 ) {
      this.commonService.getCibilRequest("ulipGST", payload).subscribe((data) => {
        let dataOfGST = data.response[0]?.response;
        let gstAddress = dataOfGST?.principalPlaceOfBusinessFields?.principalPlaceOfBusinessAddress;
        if (data?.error == 'true') {
          this.branch.at(i).patchValue({
            taxActive: false,
            tanNo: dataOfGST?.gstIdentificationNumber?.substring(2, 12),
          })
        } else {
 
         if(this.stateListBranch?.length > 0){
          let placeofSupplyName = this.stateListBranch?.filter(x => x.typeDescription?.replace(/\s/g, '')?.toLowerCase() == gstAddress?.stateName?.replace(/\s/g, '')?.toLowerCase())[0]?.stateId || '';
    
          this.branch.at(i).patchValue({ 
            placeofSupply : placeofSupplyName || ''
          }) 
         }
         
          this.branch.at(i).patchValue({
            taxActive: dataOfGST?.gstnStatus === 'Active' ? true : false,
            barnch_country: this.countryList?.find((x) => x.countryName?.toLowerCase() == 'india')?.countryId,
            branch_address: gstAddress?.floorNumber + gstAddress?.buildingNumber + ', '+gstAddress?.buildingName + ', '+gstAddress?.streetName + ', '+gstAddress?.location,
            branch_countryName: 'INDIA',
            branch_state: gstAddress?.stateName,
            branch_city: gstAddress?.districtName,
            pinCode: gstAddress?.pincode,
            tanNo: dataOfGST?.gstIdentificationNumber?.substring(2, 12) 
          })
        }
      },
        (error) => {
          this.notification.create('error',error?.error?.error?.message, '');
        });
    }

  }
  documents: any = []

  deleteBranch(vIndex: number) {
    this.branch.removeAt(vIndex);
  }
  deletecustomer(vIndex: number) {
    this.customer.removeAt(vIndex);
  }
  deleteDoc(doc, i) {
    this.branch.at(i).patchValue({
      documents: []
    })
  }
  // get branch() {
  //   return this.partyMasterForm.controls["branch"] as FormArray;
  // }
  get branch() {
    return this.AddressBranch.get('branch') as FormArray;
  }

  // get customer() {
  //   return this.partyMasterForm.controls["customer"] as FormArray;
  // }
  get customer(): FormArray {
    return this.AddressCustomer.get('customer') as FormArray;
  }
  copyMessage(val?: string) {

    this.branch.controls[0]?.get('branch_address').setValue(this.Overview?.get('address').value)
    this.branch.controls[0]?.get('barnch_country').setValue(this.Overview?.get('country').value)
    this.branch.controls[0]?.get('branch_state').setValue(this.Overview?.get('state').value)
    this.branch.controls[0]?.get('pic_email').setValue(this.Overview?.get('primaryEmailId').value)
    this.branch.controls[0]?.get('branch_city').setValue(this.Overview?.get('city').value)

  }


  onSelectedDocument(event) {
    let filename = event.target.value.replace('C:\\fakepath\\', '');
    this.partyMasterForm.get('documentName').setValue(filename);
    this.extension = filename.substr(filename.lastIndexOf('.'));
    if (
      this.extension.toLowerCase() === '.xls' ||
      this.extension.toLowerCase() === '.xlsx' ||
      this.extension.toLowerCase() === '.pdf' ||
      this.extension.toLowerCase() === '.doc' ||
      this.extension.toLowerCase() === '.docx'
    ) {
      this.fileTypeNotMatched = false;
      this.doc = event.target.files[0];
    } else {
      this.fileTypeNotMatched = true;
      this.base64Output = '';
      this.partyMasterForm.get('documentURL').setValue('');
      this.partyMasterForm.get('Doc').setValue('');
    }
  }
  filechange() {

  }

  onFileSelected(event, type) {
    let filename = event.target.value.replace('C:\\fakepath\\', '');
    if (/\s/.test(filename)) {
      this.notification.create('error', 'Filename Error', 'File contains whitespace, to continue please upload file without space');
      return;
    }
    this.KYCAndDocuments.get(`${type}documentName`)?.setValue(filename);
    this.extension = filename.substr(filename.lastIndexOf('.'));
    if (
      this.extension.toLowerCase() === '.xls' ||
      this.extension.toLowerCase() === '.xlsx' ||
      this.extension.toLowerCase() === '.pdf' ||
      this.extension.toLowerCase() === '.doc' ||
      this.extension.toLowerCase() === '.docx'
    ) {
      this.fileTypeNotMatched = false;
      this.doc = event.target.files[0];
    }
  }
  async addDocument() {
    this.submitted = true;
    var data = this.partyMasterForm.value;
    var filename = data.documentName + this.extension;
    const formData = new FormData();
    formData.append('file', this.doc, `bookingUpload-${this.doc.name}`);
    formData.append('name', `bookingUpload-${this.doc.name}`);

    let file = await this.commonService.uploadDocuments('uploadfile', formData).subscribe();
    if (file) {
      data.documentURL = `${this.doc.name}`;
      if (this.partyMasterForm.invalid) {
      } else {
        this.submitted = false;
        if (!data.documentName?.includes(this.extension)) {
          data.documentName = filename;
        }
        delete data.Doc;
        this.partyMasterForm.reset();
      }
    }
  }


  documentPreview(type) {
    this.commonService.downloadDocuments('downloadfile', this.KYCAndDocuments.value?.[`${type}documentName`])?.subscribe(
      (res: Blob) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        let temp = URL.createObjectURL(blob);
        const pdfWindow = window.open(temp);
        pdfWindow.print();
      },
      (error) => {
        console.error(error);
      }
    );
  }

  downloadFile(type) {
    this.commonService.downloadDocuments('downloadfile', this.KYCAndDocuments.value?.[`${type}documentName`]).subscribe(
      (fileData: Blob) => {
        this.commonService.downloadDocumentsFile(fileData, this.KYCAndDocuments.value?.[`${type}documentName`]);
      },
      (error) => {
        console.error(error);
      }
    );
  }
  async uploadDocument(type) {
    if (!this.doc) return;
    const formData = new FormData();
    formData.append('file', this.doc, `partykyc-${this.doc.name}`);
    formData.append('name', `partykyc-${this.doc.name}`);

    await this.commonService.uploadDocuments('uploadfile', formData).subscribe(async (res) => {
      if (res) {
        let payload = {
          Doc: this.KYCAndDocuments?.value?.Doc,
          documentName: res.name,
          documentType: type,
          documentURL: res?.name,
          partymasterId: this.partyMaster?.partymasterId,
          documentStatus: true
        }
        await this.commonService.addToST('document', payload).subscribe(
          (res) => {
            if (res) {
              this.notification.create('success', 'Saved Successfully', '');
              this.doc = null;
              this.KYCAndDocuments.get(`${type}documentId`)?.setValue(res?.documentId);
              this.KYCAndDocuments.get(`${type}documentName`)?.setValue(payload?.documentName);
            }
          },
          (error) => {
            this.notification.create('error', 'Failed to upload the document.', '');
          }
        );
      }
    });


  }
  deleteFile(type, content1) {
    this.modalService
      .open(content1, {
        backdrop: 'static',
        keyboard: false,
        centered: true,
        size: '',

        ariaLabelledBy: 'modal-basic-title',
      })
      .result.then(
        (result) => {
          if (result === 'yes') {
            let data = `document/${this.KYCAndDocuments.value?.[`${type}documentId`]}`
            this.commonService.deleteST(data).subscribe((res: any) => {
              if (res) {
                this.KYCAndDocuments.get(`${type}documentName`).setValue('');
                this.KYCAndDocuments.get(`${type}documentId`).setValue('');
                this.notification.create('success', 'Deleted successfully', '');
              }
            });
          }
        }
      );
  }

  fetDocument(partymasterId) {
    let payload = this.commonService.filterList()
    payload.query = {
      "partymasterId": partymasterId
    }
    this.commonService.getSTList("document", payload)?.subscribe((res: any) => {
      this.customeDocument = res?.documents?.filter(doc => doc?.documentURL);
    }
    )
  }
  forbiddenCharactersValidator() {
    return (control) => {
      const forbiddenChars = /["\\]/; // Regular expression to match forbidden characters
      const value = control.value;
      const hasForbiddenChars = forbiddenChars.test(value);
      return hasForbiddenChars ? { forbiddenChars: true } : null;
    };
  }
  toggleButton(panel: string) {
    switch (panel) {
      case 'Overview':
        if (this.canOpenCustomAccordion) {
          this.isOverviewPanelOpen = !this.isOverviewPanelOpen;
        }
        break;
      case 'cargo':
        if (this.canOpenCargoAccordion) {
          this.isCargoPanelOpen = !this.isCargoPanelOpen;
        }
        break;
      case 'Contacts':
        if (this.canOpenContainerAccordion) {
          this.isContactsPanelOpen = !this.isContactsPanelOpen;
        }
        break;
      case 'Address':
        if (this.canOpenLooseCargoAccordion) {
          this.isAddressPanelOpen = !this.isAddressPanelOpen;
        }
        break;
      case 'Documents':
        if (this.canOpenFreightAccordion) {
          this.isDocumentsPanelOpen = !this.isDocumentsPanelOpen;
        }
        break;
      case 'Sales':
        if (this.canOpenRemarksAccordion) {
          this.isSalesPanelOpen = !this.isSalesPanelOpen;
        }
        break;
      case 'Credit':
        if (this.canOpenBatchAccordion) {
          this.isCreditPanelOpen = !this.isCreditPanelOpen;
        }
        break;
      default:
        console.error('Unknown panel:', panel);
    }
  }
  toggleAllPanels(state: boolean) {
    this.allPanelsOpen = state;
    this.isOverviewPanelOpen = state;
    this.isCargoPanelOpen = state;
    this.isContactsPanelOpen = state;
    this.isAddressPanelOpen = state;
    this.isDocumentsPanelOpen = state;
    this.isSalesPanelOpen = state;
    this.isCreditPanelOpen = state;
  }
  openNotes(notesOverview) {
    this.modalService.open(notesOverview, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }
  openDropdown(dropdown) {
    this.modalService.open(dropdown, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }
  getfilterrecord() {
    const tab = this.tabs.find(activetab => activetab?.active);
    let tabledata = this.batchList;
    let filteredData = []
    if (tab?.name === 'All') {
      filteredData = tabledata;
    } else if (tab?.name === 'Inactive') {
      filteredData = tabledata?.filter(rr => rr?.statusOfBatch === 'Job Closed' || rr?.statusOfBatch === 'Job Cancelled');
    } else if (tab?.name === 'Qualifying') {
      filteredData = tabledata?.filter(rr => rr?.statusOfBatch === 'Job Created');
    } else if (tab?.name === 'Working') {
      tabledata = this.InquiryList;
      filteredData = tabledata?.filter(rr => rr?.enquiryStatus === 'Inquiry Created' || rr?.enquiryStatus === 'Inquiry Received');
    }
    else if (tab?.name === 'Quoting') {
      tabledata = this.InquiryList;
      filteredData = tabledata?.filter(rr => rr?.enquiryStatus === 'Inquiry Submitted');
    } else if (tab?.name === 'Shipping') {
      filteredData = tabledata?.filter(rr => !(rr?.statusOfBatch === 'Job Created' || rr?.statusOfBatch === 'Job Closed' || rr?.statusOfBatch === 'Job Cancelled'));
    } else {
      filteredData = tabledata?.filter(rr => rr?.stage === tab?.name);
    }
    if (this.searchTerm) {
      const trimmed = this.searchTerm?.trim();
      filteredData = filteredData?.filter((item) => JSON.stringify(item).toLowerCase().includes(trimmed?.toString().toLowerCase()));
    } else {
      filteredData = filteredData;
    }
    this.dataSource = new MatTableDataSource(filteredData ?? []);
    this.dataSource.paginator = this.paginator;
  }
  getCount(tab) {
    let tabledata = this.batchList;
    if (tab?.name === 'All') {
      return tabledata?.length;
    } else if (tab?.name === 'Inactive') {
      return tabledata?.filter(rr => rr?.statusOfBatch === 'Job Closed' || rr?.statusOfBatch === 'Job Cancelled')?.length;
    } else if (tab?.name === 'Qualifying') {
      return tabledata?.filter(rr => rr?.statusOfBatch === 'Job Created')?.length;
    } else if (tab?.name === 'Working') {
      tabledata = this.InquiryList;
      return tabledata?.filter(rr => rr?.enquiryStatus === 'Inquiry Created' || rr?.enquiryStatus === 'Inquiry Received')?.length;
    } else if (tab?.name === 'Quoting') {
      tabledata = this.InquiryList;
      return tabledata?.filter(rr => rr?.enquiryStatus === 'Inquiry Submitted')?.length
    } else if (tab?.name === 'Shipping') {
      return tabledata?.filter(rr => !(rr?.statusOfBatch === 'Job Created' || rr?.statusOfBatch === 'Job Closed' || rr?.statusOfBatch === 'Job Cancelled'))?.length
    }
    else {
      return tabledata?.filter(rr => rr?.stage === tab?.name)?.length;
    }
  }
  getUsersForDropDown() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      "status": true
    }
    this.commonService.getSTList("user", payload)?.subscribe((res: any) => {
      this.userList = res?.documents;
    });
  }
  // addData(){
  //   if(this.filterTableForm.invalid){
  //     this.notification.create('error', 'Please fill all required fields correctly.', ''); 
  //     this.filterTableForm.markAllAsTouched();
  //     return;
  //   }
  //   if (!this.Overview.value.overviewTable) {
  //     this.Overview.value.overviewTable = [];
  //   }
  //   const id:any=Guid.create();
  //   this.Overview?.value?.overviewTable.push({
  //     name:this.filterTableForm.value?.name,
  //     stage:this.filterTableForm?.value.stage,
  //     tags:this.filterTableForm?.value.tags,
  //     overviewPhNo:this.filterTableForm?.value?.overviewPhNo,
  //     // overviewUser:this.filterTableForm.value?.overviewUser,
  //     overviewUser: this.filterTableForm.controls.overviewUser.value,
  //     assgnName: this.userList.filter(x => x.userId === this.filterTableForm.controls.overviewUser.value)[0]?.name,
  //     overviewStatus:this.filterTableForm?.value?.overviewStatus,
  //     userId:this.getCognitoUserDetail?.userId,
  //     createdOn:new Date(),
  //     overviewId:id?.value
  //   })
  //   this.filterTableForm.reset();
  //   this.modalService.dismissAll();
  // }
  deleteoverview(record) {
    const data = this.Overview?.value?.overviewTable ?? [];
    this.Overview.controls?.overviewTable.setValue(data?.filter(ids => ids?.overviewId !== record?.overviewId));
  }
  isEditMode = false;
  editRecordId: string = null;

  editContact(record: any, dropdown: any) {
    this.isEditMode = true;
    this.editRecordId = record.overviewId;

    this.filterTableForm.patchValue({
      name: record.name,
      stage: record.stage,
      tags: record.tags,
      overviewPhNo: record.overviewPhNo,
      overviewStatus: record.overviewStatus,
      overviewUser: record.overviewUser
    });
    this.openDropdown(dropdown);
  }

  addData() {
    if (this.filterTableForm.invalid) {
      this.notification.create('error', 'Please fill all required fields correctly.', '');
      this.filterTableForm.markAllAsTouched();
      return;
    }
    if (!this.Overview.value.overviewTable) {
      this.Overview.value.overviewTable = [];
    }

    const formData = this.filterTableForm.value;

    if (this.isEditMode) {
      const overviewTable = this.Overview?.value?.overviewTable ?? [];
      const recordIndex = overviewTable.findIndex(item => item.overviewId === this.editRecordId);

      if (recordIndex > -1) {
        overviewTable[recordIndex] = {
          ...overviewTable[recordIndex],
          name: formData.name,
          stage: formData.stage,
          tags: formData.tags,
          overviewPhNo: formData.overviewPhNo,
          overviewUser: formData.overviewUser,
          assgnName: this.userList.find(x => x.userId === formData.overviewUser)?.name,
          overviewStatus: formData.overviewStatus
        };
        this.Overview.controls.overviewTable.setValue(overviewTable);
      }
    } else {
      const id: any = Guid.create();
      const newRecord = {
        name: formData.name,
        stage: formData.stage,
        tags: formData.tags,
        overviewPhNo: formData.overviewPhNo,
        overviewUser: formData.overviewUser,
        assgnName: this.userList.find(x => x.userId === formData.overviewUser)?.name,
        overviewStatus: formData.overviewStatus,
        userId: this.getCognitoUserDetail?.userId,
        createdOn: new Date(),
        overviewId: id.value
      };

      this.Overview.value.overviewTable.push(newRecord);
    }
    this.filterTableForm.reset();
    this.isEditMode = false;
    this.editRecordId = null;
    this.modalService.dismissAll();
  }
  getBatchList(partymasterId) {
    let payload = this.commonService.filterList();
    payload.query = {
      "enquiryDetails.basicDetails.shipperId": partymasterId,
    }
    this.commonService.getSTList('batch', payload)
      ?.subscribe((data: any) => {
        this.batchList = data.documents;
        let payloadInquiry = this.commonService.filterList();
        payloadInquiry.query = {
          "basicDetails.shipperId": partymasterId,
        }
        this.commonService.getSTList('enquiry', payloadInquiry)
          ?.subscribe((data: any) => {
            this.InquiryList = data.documents;
            this.getfilterrecord();
          });
      });
  }
  formBuild() {
    this.addStateForm = this.formBuilder.group({
      stateCode: new FormControl('', Validators.required),
      typeDescription: new FormControl('', Validators.required),
      stateShortName: new FormControl(''),
      GSTNCode: new FormControl(''),
      countryCode: new FormControl('', Validators.required),
      isUnion: new FormControl(true),
      status: new FormControl(false)
    });
  }
  addCityForm: FormGroup
  formBuilds() {
    this.addCityForm = this.formBuilder.group({
      stateId: new FormControl('', Validators.required),
      cityName: new FormControl('', Validators.required),
      status: new FormControl(true)
    });
  }
  submittedq: boolean = false
  openStateMaster(addState) {
    this.formBuild();
    this.addStateForm.get('countryCode')?.setValue(this.Overview.value?.country);
    this.modalService.open(addState, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }
  stateMasters() {
    this.submittedq = true;
    if (this.addStateForm.invalid) {
      return;
    }
    const dataupdate = this.addStateForm.value;
    dataupdate.tenantId = this.tenantId,
      dataupdate.status = true
    dataupdate.countryId = this.addStateForm.get('countryCode').value
    dataupdate.countryName = this.countryList.filter((x) => x?.countryId === this.addStateForm.get('countryCode').value)[0]?.countryName
    dataupdate.countryCode = this.countryList.filter((x) => x?.countryId === this.addStateForm.get('countryCode').value)[0]?.countryCode

    const data = {
      ...dataupdate,
      stateName: this.addStateForm.get('typeDescription').value,
    };

    this.commonService.addToST('state', data).subscribe(
      (res: any) => {
        if (res) {
          this.stateList.push(res);
          this.notification.create('success', 'Added Successfully', '');
          this.onSaves();
        }
      },
      (error) => {
        this.onSaves();
        this.notification.create('error', error?.error?.error?.message, '');
      }
    );

  }
  onSaves() {
    this.modalService.dismissAll();
    this.submittedq = false;
    this.addStateForm.reset();  

    this.submittedq = false;
    return null;
  }
  onSaves1() {
    this.modalService.dismissAll();
    this.submittedq = false;
    this.addCityForm.reset();   
    return null;
  }
  submitted5: boolean = false
  openCityMaster(addCity) {
    this.formBuilds();
    this.addCityForm.get('stateId')?.setValue(this.Overview.value?.state);
    this.modalService.open(addCity, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }
  cityMasters() {
    this.submitted5 = true;
    if (this.addCityForm.invalid) {
      return;
    }
    const dataupdate = this.addCityForm.value
    dataupdate.stateName = this.stateList.filter((x) => x?.stateId == this.addCityForm.value.stateId)[0]?.typeDescription || 'MH'
    dataupdate.tenantId = this.tenantId,
      dataupdate.status = true

    this.commonService.addToST('city', dataupdate).subscribe(
      (res: any) => {
        if (res) {
          this.cityList.push(res);
          this.notification.create('success', 'Added Successfully', '');
          this.clear();
        }
      },
      (error) => {
        this.notification.create('error', error?.error?.error?.message, '');
        this.clear();
      }
    );


  }
  clear() {
    this.modalService.dismissAll();
    this.submitted = false;
    this.addCityForm.reset();
    this.submitted = false;
    return null;
  }


  pay() {
    if (!this.smartAgentDetail?.partymasterId && !this.smartAgentDetail?.paidStatus) {
      return
    }
    const data = this.Overview.value;
    // let amount = Number(Number(this.invoiceDetails?.invoiceAmount) - Number(this.invoiceDetails?.paidAmount || 0)) 
    let amount = 150;
    const contacts = this.AddressCustomer.value?.customer?.[0];
    // let customer = this.commonfunction.getCustomerDetails() 
    if (this.commonfunction?.getAgentCur() != this.commonfunction?.customerCurrency()) {
      if (this.showCustomerCurr) {
        amount = amount * Number(this.commonfunction?.getExRate())
      }
    }
    this.commonService.initiatePayment(Number(amount.toFixed(0)), this.showCustomerCurr ? this.commonfunction?.customerCurrency() : this.commonfunction?.getAgentCur(), data?.name, "", 'https://yourlogo.com/logo.png', contacts?.email, String(contacts?.phoneNo ?? ''), contacts?.address, this.onPaymentSuccess.bind(this), this.onPaymentFailure.bind(this));

  }
  onPaymentFailure(error: any) {
    this.notification.create('error', error, '');
  }
  onPaymentSuccess(response: any) {

    this.commonService.UpdateToST(`partymaster/${this.id}`, { paidStatus: true })
      ?.subscribe((res: any) => {
        if (res) {
          this.smartAgentDetail['paidStatus'] = true;
          this.notification.create('success', 'Payment  Successfully...!', '');
        }
      })
  }

  private modalRef: NgbModalRef | null = null;
  openBanks(notesOverview) {
    this.formBuildBank();
    this.modalRef = this.modalService.open(notesOverview, {
      ariaLabelledBy: 'modal-basic-title',
      windowClass:'add-bank-sub-modal',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      backdropClass:"modal-add-bank-wrapper",
      size: 'lg',
    });
  
  }

  bankForm: FormGroup;
  formBuildBank() {
    this.bankForm = this.formBuilder.group({
      partyName : new FormControl(this.Overview.get('name').value || '', [Validators.required]),
      bankName: new FormControl('', [Validators.required]),
      bankShortName: new FormControl('', [Validators.required]),
      bankCode: new FormControl('', [Validators.required]),
      lineID: new FormControl(''),
      FASCode: new FormControl(''),
      status: new FormControl(true),
      ifscCode: new FormControl('' ),
      branch: new FormControl(''),
      swiftCode: new FormControl('')
    });
  }
  cancelBank() {
    // this.modalService.dismissAll()
    if (this.modalRef) {
      this.modalRef.close(); // Close only this modal
      this.modalRef = null;  // Reset reference
    }
  }
  get f4() { return this.bankForm?.controls; }
  submitted4: boolean = false;
  onSaveBank() {
    this.submitted4 = true;
    if (this.bankForm.invalid) {
      return false;
    }
    let bankData = {
      partyName : this.bankForm.value.partyName || '',
      partyId : this.id || '',
      "tenantId": this.tenantId,
      bankName: this.bankForm.value.bankName,
      bankShortName: this.bankForm.value.bankShortName,
      bankAccountCode: this.bankForm.value.bankCode,
      lineID: this.bankForm.value.lineID,
      FASLedgerCode: this.bankForm.value.FASCode,
      category: 'master',
      accountNo: this.bankForm.value.bankCode,
      accountType: 'null',
      isBank: true,
      status: this.bankForm.value.status,
      ifscCode: this.bankForm.value.ifscCode,
      branch: this.bankForm.value.branch,
      swiftCode: this.bankForm.value.swiftCode,
      "orgId": this.commonfunction.getAgentDetails()?.orgId,
    };
    this.loaderService.showcircle();
    const dataupdate = bankData;
    this.commonService.addToST('bank', dataupdate).subscribe(
      (res: any) => {
        if (res) {
          this.notification.create('success', 'Added Successfully', '');
          this.submitted = false;
          this.cancelBank();
          setTimeout(() => {
            this.getBankList()
          }, 500);

        }
      },
      (error) => {
        this.notification.create('error', error?.error?.error?.message, '');
      }
    );

  }
}
