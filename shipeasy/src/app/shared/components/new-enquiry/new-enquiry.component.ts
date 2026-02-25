import { Component, OnInit, Output, EventEmitter, Input, OnDestroy, ViewChild, ElementRef, Renderer2, Inject } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ApiService } from 'src/app/admin/principal/api.service';
import { shared } from '../../data';
import { differenceInCalendarDays } from 'date-fns';
import * as Constant from 'src/app/shared/common-constants';
import { CommonFunctions } from '../../functions/common.function';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { ApiSharedService } from '../api-service/api-shared.service';
import { CommonService } from '../../../services/common/common.service';
import { Subject } from 'rxjs';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { OrderByPipe } from '../../../shared/util/sort';
import { CognitoService } from 'src/app/services/cognito.service';
import { Currencys, PartyMasterData } from 'src/app/models/party-master';
import { SystemType } from 'src/app/models/system-type';
import { Port } from 'src/app/models/tariff-list';
import { PortDetails } from 'src/app/models/yard-cfs-master';
import { ChemicalProduct, Contact, CostItem, Location, ProspectComment, User } from 'src/app/models/new-enquiry';
import { ShippingLine } from 'src/app/models/shipping-line';
import { MatRadioChange } from '@angular/material/radio';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { MatChipInputEvent } from '@angular/material/chips';
import { environment } from 'src/environments/environment';
import { DOCUMENT } from '@angular/common';
import { LoaderService } from 'src/app/services/loader.service';
import { AddPartyComponent } from 'src/app/admin/party-master/add-party/add-party.component';
import { MatDrawer } from '@angular/material/sidenav';

export interface FruitTO {
  to: string;
}
export interface FruitCC {
  cc: string;
}

@Component({
  selector: 'app-new-enquiry',
  templateUrl: './new-enquiry.component.html',
  styleUrls: ['./new-enquiry.component.scss'],
})
export class NewEnquiryComponent implements OnInit, OnDestroy {
  f2: FormGroup;
  submitted2: boolean;

  msdsDocControl = new FormControl('');
  selectedOption: string = '';
  @ViewChild('importagentadvice') content;
  private ngUnsubscribe = new Subject<void>();
  @Output() CloseNew = new EventEmitter<string>();
  @Input() isshowDetails: boolean = false;
  @Input() isshowDetails1: boolean = false;
  chargedData: any = [];
  freightChargedData: any = [];
  @Input() isPage: any;
  @Input() importAgentAdviceDetail: any;
  @Input() enquiryId: any;
  newenquiryForm: FormGroup;
  addressForm: FormGroup;
  empForm: FormGroup;
  submitted = false;
  currentUrl: string;
  cfslocation: string;
  prodectForm: FormGroup;
  chargesData = shared.chargeRows;
  remarksForm: FormGroup;
  commodityForm: FormGroup;
  lengthData: any = []
  weighthData: any=[]
  newRemark: any
  remarksArray: ProspectComment[] = []
  id: any
  isAddMode: any
  baseBody: any
  agentAdviceDetails: any
  shipperList: PartyMasterData[] = []
  bookingpartyList: PartyMasterData[] = []
  invoicingpartyList: PartyMasterData[] = []
  forwarderChaList: any = []
  consigneeList: any = []
  ops_coordinator: any = []
  partyMasterNameList: PartyMasterData[] = []
  enquirytypeList: SystemType[] = []
  shippingtermList: any = []
  tanktypeList: any = []
  shipmenttermList: any = []
  movetypeList: any = []
  incotermList: any = []
  fromdateValue: any = '';
  todateValue: any = '';
  packinggroupList: any = []
  haulagetypeList: any = []
  chargetermList: SystemType[] = []
  portList: any = []
  currencyList: Currencys[] = []
  userList: User[] = []
  productList: ChemicalProduct[] = [];
  contactList: Contact[] = [];
  shippingLineList: ShippingLine[] = [];
  partymasterList: PartyMasterData[] = [];
  processPointList: SystemType[] = [];
  statusList: SystemType[] = [];
  locationList: any = [];
  preCarrigeList: any = [];
  onCarrigeList: any = [];
  userData: any;
  productShippingName: any;
  IMCOClass: any;
  currentScrollPosition: number;
  ULDcontainerlist: any = []
  VesselUNNo: any;
  PackingGroup: any;
  Density: any;
  vesselName: any;
  IsEditRemarks: number = 0;
  costItemList: any = [];
  palletTypeslist: any = [];
  callapseALL: boolean = false;
  origin = false
  destination = false
  todayDate = new Date()
  categoryData: any = ['C', 'F'];
  numbers: number[] = Array.from({ length: 19 }, (_, i) => i + 3);
  DropDownList = [
    { srNo: 1, AddressType: "shipper", source: ["name", "partymasterId"] },
    { srNo: 2, AddressType: "bookingparty", source: ["name", "partymasterId"] },
    { srNo: 3, AddressType: "invoicingparty", source: ["name", "partymasterId"] },
    { srNo: 4, AddressType: "forwarder", source: ["name", "partymasterId"] },
    { srNo: 5, AddressType: "cha", source: ["name", "partymasterId"] },
    { srNo: 6, AddressType: "consignee", source: ["name", "partymasterId"] },
  ];
  branchList: any = []
  isEditMode: boolean = false;
  containerTypeList: any = [];
  truckTypeList: any = [];
  wagonTypeList: any = [];
  containerSizeList: any = [];
  preCarrigeList1: Location[] = [];
  productId: any;
  customerList: SystemType[] = [];
  contractList: SystemType[] = [];
  opsCordinatorList: any = [];
  batchMasterList: any = [];
  Flash_point: any;
  @ViewChild('expand') expand: ElementRef;
  expandKeys = "panelsDetails panelsProduct panelsStuffing panelsRoute panelsdetention containers freightTerm panelsCharges pannelRemarks"
  expandKeys1 = "panelsDetails "
  locatioName: any;
  departmentList: any = [];
  D = new Date();
  currentDate: any =
    this.D.getDate() + '/' + this.D.getMonth() + '/' + this.D.getFullYear();
  marinePollution: any = '';
  cargoTypeList: any = [];
  isAgentAdvise: boolean = false;
  show: boolean = false;
  ICDlocationList: any = [];
  vesselList: any;
  voyageList: any;
  enquiryDateValid: boolean = false;
  shippingLineValid: boolean = false;
  draftPending: boolean = false;
  valueChange: boolean = false;
  showCfsDropdown = false;
  showFactoryDropdowns = false;
  hsCode: string;
  di: string;
  hi: string;
  Wi: string;
  li: string;
  Range: string;
  commodityType: any;
  isTransport: any = false;
  To: string;
  typeTemp: string;
  msdsDoc: string;
  imcoList: SystemType[] = [];
  LoginPerson: any;
  msdsDocURL: string = '';
  tankstatusList: SystemType[] = [];
  disableShipper: boolean = false;
  disableOPS: boolean = false;
  disableSale: boolean = false;
  freightTermsList: any;
  IsEditCommodity: number;
  commodityArray: any = [];
  locationData: Location[] = [];
  submitted1: boolean;
  activeCommodity: string;
  chargeName: CostItem[];
  chargeBasic: SystemType[];
  chargeTermList: SystemType[];
  supplierList: any;
  showQuotation: boolean = false;
  canOpenAccordion: boolean = true;
  isRoutePanelOpen: boolean = false;
  canOpenCustomAccordion: boolean = true;
  canOpenTransportAccordion: boolean = true;
  isCustomRoutePanelOpen: boolean = false;
  isTransportRoutePanelOpen: boolean = false;
  canOpenCargoAccordion: boolean = true;
  isCargoPanelOpen: boolean = false;
  canOpenContainerAccordion: boolean = true;
  isContainerPanelOpen: boolean = false;
  canOpenLooseCargoAccordion: boolean = true;
  isLooseCargoPanelOpen: boolean = false;
  canOpenFreightAccordion: boolean = true;
  isFreightPanelOpen: boolean = false;
  canOpenRemarksAccordion: boolean = true;
  isRemarksPanelOpen: boolean = false;
  isServicesPanelOpen: boolean = false;
  canOpenBatchAccordion: boolean = true;
  isBatchPanelOpen: boolean = true;
  isStuffingPanelOpen: boolean = false;
  canOpenStuffingAccordion: boolean = true;
  showTranshipmentHopFields = false;
  defaultSelectedValueTemp = 'KG';
  uomData: any;
  billingBranchList: any;
  originStuffingOption: [''];
  destinationStuffingOption: [''];
  options = [
    { label: 'At CFS/ICD', value: 'CFS/ICD' },
    { label: 'At Factory', value: 'Factory' },
  ];
  options2 = [
    { label: 'At CFS/ICD', value: 'CFS/ICD' },
    { label: 'At Factory', value: 'Factory' },
  ];
  shipmentTypes: any[];
  dimensionUnitList: any[];
  freightTypeList: any;
  SentEmail: FormGroup;
  public Editor = ClassicEditor;
  loadTypeList: any = [];
  loadTypeListOriginal: any = [];
  isDisable: boolean = false;
  public settings = {
    singleSelection: false,
    idField: 'shippinglineId',
    textField: 'name',
    enableCheckAll: true,
    selectAllText: 'Select All',
    unSelectAllText: 'Clear',
    allowSearchFilter: true,
    limitSelection: -1,
    clearSearchFilter: true,
    maxHeight: 197,
    itemsShowLimit: 3,
    searchPlaceholderText: 'Search',
    noDataAvailablePlaceholderText: 'No data found',
    closeDropDownOnSelection: false,
    showSelectedItemsAtTop: false,
    defaultOpen: false,
  };
  locationListOG: any = [];
  isExport: boolean = false;
  isImport: boolean = false;
  ImportShipmentTypelist: any = [];
  ImportShipmentTypelistAir: any = [];
  cfsDropdownOptions: any;
  constructor(
    private router: Router,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private notification: NzNotificationService,
    private route: ActivatedRoute,
    private loaderService: LoaderService,
    private commonFunction: CommonFunctions,
    private apiSharedService: ApiSharedService,
    private commonService: CommonService,
    private sortPipe: OrderByPipe, private cognito: CognitoService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    // this.getICDLocation()
    this.CityList()
    this.getproductDropDowns();
    this.getSystemTypeDropDowns();
    this.isTransport = localStorage.getItem('isTransport') === 'true' ? true : false;
    this.isExport = localStorage.getItem('isExport') === 'true' ? true : false;
    this.isImport = localStorage.getItem('isImport') === 'true' ? true : false;
    this.SentEmail = this.formBuilder.group({
      message: [''],
      subject: [''],
      EmailTo: ['', [Validators.pattern(/^([a-zA-Z0-9_+.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(,\s*[a-zA-Z0-9_+.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})*$/)]],
      CC: ['', Validators.pattern(/^([a-zA-Z0-9_+.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(,\s*[a-zA-Z0-9_+.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})*$/)],
      Attachment: "",
    })
    this.f2 = this.formBuilder.group({
      msdsDoc: [null, Validators.required],
      li: [null, Validators.required],
      Wi: [null, Validators.required],
      hi: [null, Validators.required],
      di: [null, Validators.required],
      To: [null, Validators.required],
      typeTemp: [null, Validators.required],
      Range: [null, Validators.required],

    });
    this.newenquiryForm = this.formBuilder.group({
      uniqueRefNo: [''],
      agentAdviceDate: [''],
      enquiry_number: [''],
      enquiry_date: [new Date()],
      enquiryExpiryDate: [new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)],
      enquiry_type: [''],
      booking_party: [''],
      billingParty:['',Validators.required],
      billingBranch: [''],
      ops_coordinator: [''],
      Shipment_Type: ['', Validators.required],
      sales_person: [''],
      forworder: [''],
      move_type: [''],
      tank_type: [''],
      loadType: ['', Validators.required],
      tankStatus: [''],
      shippping_term: [''],
      destHaulage: [''],
      shipment_term: ['Loaded'],
      inco_term: [''],
      importShipmentType:['',Validators.required],
      marine_polluted: [''],
      stcQutation: [''],
      cargo_type: [''],
      shipper: [''],
      cosignee: [''],
      notify_party: [''],
      incoicing_party: [''],
      move_no: [''],
      agentadviceTo: [''],
      agentadviceFrom: [''],
      poNo: [''],
      poDate: [''],
      cargoType: [''],
      notifyParty: [''],
      moveNo: [''],
      product_id: [''],
      commodityType: [''],
      proper_shipping_name: [''],
      shipper_address: [''],
      technical_name: [''],
      imco_class: [''],
      li: [''],
      stuffing_location_Type:[''],
      billingBranchStuffing:[false],
      stuffing:[false],
      stuffingfactory:[false],
      stuffingcfs:[false],
      Stuffing_shipper_address:[''],
      cfslocation:[''],
      Wi: [''],
      hi: [''],
      di: [''],
      To: [''],
      typeTemp: ['C'],
      Range: [''],
      un_no: ['',],
      hsCode: [''],
      msdsDoc: [''],
      packing_group: [''],
      flashPoint: [''],
      marine_pollution: [''],
      Density: [''],
      grossWeight: [''],
      cargoReadyDate: [''],
      targetDeliveryDate: [''],
      freight_payable: [''],
      status: [true],
      destinationCustomClearance: [''],
      originCustomClearance: [''],
      freightTerms: [''],
      shipping_line: [''],
      transportPreCarriage: [''],
      transportOnCarriage: [''],
      contract: [''],
      shippingLineratevalidfrom_date: [''],
      shippingLineratevalidto_date: [''],
      pre_carriage: [''],
      load_place: [''],
      load_port: ['',Validators.required],
      plannedVesselforHop: [''],
      voyageNumberforHop: [''],
      location: [''],
      discharge_port: [''],
      freeDaysTime : [[],Validators.required],
      deliveryOfPlace:['',Validators.required],
      on_carriage: [''],
      fpod: [''],
      ts_port: [''],
      destPort: [''],
      linevoyageNo: [''],
      haulageType: [''],
      wagonNo: [''],
      vehicleNo: [''],
      poldetentionereeDay: [''],
      poldetentionAmount: [''],
      poldetentioncurrency: [''],
      pod_detentionfreeDay: [''],
      pod_detentionAmount: [''],
      pod_detentioncurrency: [''],
      freight_term: [''],
      freightAt: [''],
      grossWeightContainer: [''],
      noOfContainer: [''],
      containerType: [''],
      uldcontainerType: [''],
      containerSize: [''],
      backupShippingLine: [''],
      charge_group: [''],
      charge_name: [''],
      charge_term: [''],
      currency: [''],
      container: this.formBuilder.array([]),
      charge: this.formBuilder.array([]),
      transport: this.formBuilder.array(this.getInitialTransportRows()),
      transhipmentHops: this.formBuilder.array([]),
      transport1: this.formBuilder.array(this.getInitialTransport1Rows()),
      transportOrigin: [false],
      transportDestination: [false],
      customOrigin: [false],
      customDestination: [false],
      customDestinationLocation: [''],
      customOriginLocation: [''],
      originOption: [''],
      destinationOption: [''],
      originfactory: [false],
      destinationfactory: [false],
      originPickupAddress: [''],
      destinationDeliveryAddress: [''],
      biddingDueDate: [''],
      cargo: [false],
      emptyContainer: [false],
      palletization: [false],
      fumigation: [false],
      warehousing: [false],
      etd: [''],
      eta: [''],

      preCarriage: [false],
      onCarriage: [false],

    });
    this.remarksForm = this.formBuilder.group({
      processPoint: [''],
      date: [''],
      fromUser: [''],
      toUser: [''],
      status: [''],
      remarks: [''],
      department: ['']
    })

    this.commodityForm = this.formBuilder.group({
      product_id: [''],
      commodityType: [''],
      proper_shipping_name: [''],
      technical_name: [''],
      imco_class: [''],
      un_no: ['',],
      hsCode: [''],
      li: [''],
      Wi: [''],
      hi: [''],
      di: [''],
      Range: [''],
      To: [''],
      typeTemp: ['C'],
      msdsDoc: [''],
      packing_group: [''],
      flashPoint: [''],
      marine_pollution: [''],
      unit: ['KG'],
      Density: [''],
      grossWeight: [''],
      cargoReadyDate: [''],
      targetDeliveryDate: [''],
    })

  }
  disabledDate = (current: Date): boolean => {
    const yesterdayDate = new Date(this.todayDate);
    yesterdayDate.setDate(this.todayDate.getDate() - 1);
    return current && current < yesterdayDate;
  };
  waagonShow: boolean = false
  vehicleShow: boolean = false
  onCHangeOrigin(event) {

    if (event) {
      this.newenquiryForm.controls['originOption'].setValidators(Validators.required)
      this.newenquiryForm.controls['originOption'].updateValueAndValidity()
    }
    else {
      this.newenquiryForm.controls['originOption'].clearValidators()
      this.newenquiryForm.controls['originOption'].updateValueAndValidity()
    }

  }
  addTransPortValidation(i) {

    const control = (<FormArray>this.newenquiryForm.controls['transport']).at(i)

    // For transport mode, location is not required - addressId/address is used instead
    if (this.isTransport) {
      control.get('location').clearValidators();
      control.get('location').updateValueAndValidity();
      return;
    }

    if (control.get('locationType').value == 'location' || control.get('locationType').value == 'port') {
      control.get('location').setValidators(Validators.required);
      // control.get('addressId').clearValidators()
      // control.get('addressId').updateValueAndValidity()
      control.get('location').updateValueAndValidity()
    } else {
      // control.get('addressId').setValidators(Validators.required);
      control.get('location').clearValidators()
      // control.get('addressId').updateValueAndValidity()
      control.get('location').updateValueAndValidity()
    }

  }
  addTransPort1Validation(i) {
    const control = (<FormArray>this.newenquiryForm.controls['transport1']).at(i)
   
    if (control.get('locationType').value == 'location' || control.get('locationType').value == 'port') {
      control.get('location').setValidators(Validators.required);
      // control.get('addressId').clearValidators()
      // control.get('addressId').updateValueAndValidity()
      control.get('location').updateValueAndValidity()
    } else {
      // control.get('addressId').setValidators(Validators.required);
      control.get('location').clearValidators()
      // control.get('addressId').updateValueAndValidity()
      control.get('location').updateValueAndValidity()
    }

  }
  getInitialTransportRows(): FormGroup[] {

    return [{}, {}].map((_, i) => {
      return this.formBuilder.group({
        locationType: ['location'],
        location: [''],
        etd: [''],
        eta: [''],
        address: [''],
        addressId: [''],
        branch: [''],
        transit: [''],
        carrier: [''],
        carrierList: [[]],
        transpoterType : ['transporter']
      });
    });


  }
  etdSelectedDate: Date | null = null;
  onETDChange(date: Date | null): void {
    this.etdSelectedDate = date;
    if (date) {
      this.newenquiryForm.get('eta')?.setValue(null);
    }
  }

  disabledETDDate = (current: Date): boolean => {
    return false;
  };

  disabledETADate = (current: Date): boolean => {
    if (!this.etdSelectedDate) {
      return false;
    }
    const etdDate = new Date(this.etdSelectedDate);
    etdDate.setHours(0, 0, 0, 0);
    current.setHours(0, 0, 0, 0);
    
    return current.getTime() <= etdDate.getTime();
  };
  getInitialTransport1Rows(): FormGroup[] {

    return [{}, {}].map((_, i) => {
      return this.formBuilder.group({
        locationType: ['location'],
        location: [''],
        etd: [''],
        eta: [''],
        address: [''],
        addressId: [''],
        transit: [''],
        carrier: [''],
      });
    });
  }
  onCHangeDestination(event) {
    if (event) {
      this.newenquiryForm.controls['destinationOption'].setValidators(Validators.required)
      this.newenquiryForm.controls['destinationOption'].updateValueAndValidity()
    }
    else {
      this.newenquiryForm.controls['destinationOption'].clearValidators()
      this.newenquiryForm.controls['destinationOption'].updateValueAndValidity()
    }

  }
  toggleAll(isExpand: boolean) {
    this.showQuotation = isExpand;
    this.isRoutePanelOpen = isExpand;
    this.isCustomRoutePanelOpen = isExpand;
    this.isTransportRoutePanelOpen = isExpand;
    this.isCargoPanelOpen = isExpand;
    this.isContainerPanelOpen = isExpand;
    this.isLooseCargoPanelOpen = isExpand;
    this.isFreightPanelOpen = isExpand;
    this.isRemarksPanelOpen = isExpand;
    this.isServicesPanelOpen = isExpand;
    this.isBatchPanelOpen = isExpand; 
  }
  toggleButton(panel: string) {
    switch (panel) {
      case 'route':
        if (this.canOpenAccordion) {
          this.isRoutePanelOpen = !this.isRoutePanelOpen;
        }
        break;
      case 'customRoute':
        if (this.canOpenCustomAccordion) {
          this.isCustomRoutePanelOpen = !this.isCustomRoutePanelOpen;
        }
        break;
      case 'transportRoute':
        if (this.canOpenTransportAccordion) {
          this.isTransportRoutePanelOpen = !this.isTransportRoutePanelOpen;
        }
        break;
      case 'cargo':
        if (this.canOpenCargoAccordion) {
          this.isCargoPanelOpen = !this.isCargoPanelOpen;
        }
        break;
      case 'container':
        if (this.canOpenContainerAccordion) {
          this.isContainerPanelOpen = !this.isContainerPanelOpen;
        }
        break;
      case 'looseCargo':
        if (this.canOpenLooseCargoAccordion) {
          this.isLooseCargoPanelOpen = !this.isLooseCargoPanelOpen;
        }
        break;
      case 'freight':
        if (this.canOpenFreightAccordion) {
          this.isFreightPanelOpen = !this.isFreightPanelOpen;
        }
        break;
      case 'remarks':
        if (this.canOpenRemarksAccordion) {
          this.isRemarksPanelOpen = !this.isRemarksPanelOpen;
        }
        break;
      case 'Services':
        if (this.canOpenRemarksAccordion) {
          this.isServicesPanelOpen = !this.isServicesPanelOpen;
        }
        break;
      case 'batch':
        if (this.canOpenBatchAccordion) {
          this.isBatchPanelOpen = !this.isBatchPanelOpen;
        }
        break;
      default:
        console.error('Unknown panel:', panel);
    }
  }

  onCheckboxChange(type: string, event: Event): void {
    this.newenquiryForm.get('stuffing_location_Type').setValue(type)
    const checkbox = event.target as HTMLInputElement;
    if (type === 'factory') {
      this.newenquiryForm.get('stuffingfactory').setValue(true) 
      this.newenquiryForm.get('stuffingcfs').setValue(false) 
      this.showFactoryDropdowns = checkbox.checked;
      this.showCfsDropdown = false; 
    } else if (type === 'cfs') {
      this.newenquiryForm.get('stuffingfactory').setValue(false) 
      this.newenquiryForm.get('stuffingcfs').setValue(true) 
      this.showCfsDropdown = checkbox.checked;
      this.showFactoryDropdowns = false; 
    }
  }
  
  onStuffingCheckboxChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.isStuffingPanelOpen = checkbox.checked;
      if (!this.isStuffingPanelOpen) {
      this.showFactoryDropdowns = false;
      this.showCfsDropdown = false;
    }
  }
  
 

  getLocation() {
    let payload = this.commonService.filterList();

    if(payload?.query)payload.query = {
      'masterType': {
        "$in": ['CFS']
      }
    };

    if(payload?.query)payload.sort = {
      "desc": ["updatedOn"]
    };

    this.commonService.getSTList("location", payload)?.subscribe((data) => {
      this.locationData = data.documents;
      this.cfsDropdownOptions = data.documents.map((location: any) => ({
        label: location.locationName,
        value: location.locationId
      }));
    });
  }

  originHaulage(e?) {
    let haulageType = this.haulagetypeList.filter((x) => x?.systemtypeId === this.newenquiryForm.controls.haulageType.value)[0]?.typeName
    if (haulageType?.toLowerCase() === 'rail') {
      this.waagonShow = true
      this.vehicleShow = false
      if (!e)
        this.newenquiryForm.get('vehicleNo').setValue('')
      return
    } else if (haulageType?.toLowerCase() === 'road') {
      this.vehicleShow = true
      this.waagonShow = false
      if (!e)
        this.newenquiryForm.get('wagonNo').setValue('')
      return 
    }
    this.vehicleShow = false
    this.waagonShow = false
  }

  get f() {
    return this.newenquiryForm.controls;
  }
  get f1() {
    return this.commodityForm.controls;
  }

  setValidatorsBasedOnSelection(option: string) {
    if (option === 'openHaz') {
      this.msdsDocControl.setValidators([Validators.required]);
    } else {
      this.msdsDocControl.clearValidators();
    }
    this.msdsDocControl.updateValueAndValidity();
  }
  isShowInUrl: boolean = false;
  ngOnInit(): void {
    this.isShowInUrl = this.router.url.includes('show');
    this.newenquiryForm.get('Shipment_Type').valueChanges.subscribe(value => {
    this.newenquiryForm.get('loadType').reset();
    

    setTimeout(() => {
      this.newenquiryForm.get('loadType').patchValue(this.agentAdviceDetails?.basicDetails?.loadTypeId); 
    }, 0);
  });
  
    this.setValidatorsBasedOnSelection(this.selectedOption);
    this.cognito.getagentDetails()?.subscribe((resp) => {
      if (resp != null) {
        this.LoginPerson = resp?.attributes?.email;
      }
    })
    // this.userData = this.commonFunction.getUserDetails();
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.userData = resp
      }
    })
    this.currentUrl = this.router.url.split('?')[0].split('/').pop()



    this.id = this.route.snapshot.params?.['id'];
    this.isAddMode = !this.id;

    this.getPartyMasterDropDowns();
    this.getCurrencyDropDowns();
    // this.getPortDropDowns();
    // this.getAirPort()
    this.getUsersForDropDown();
    this.getBranchList()
    this.getVesselList(); 
    // this.getCarriageDropDowns();
    this.getShippingLineDropDowns();
    this.getContractDropDowns();
    this.getUomList()
    this.getLocation()
    this.getLocationDropDowns();
    this.getSmartAgentList();

    this.empForm = this.formBuilder.group({
      cargos: this.formBuilder.array([this.newCargo()])
    });

    if (this.isTransport) {
      this.newenquiryForm.controls['biddingDueDate'].setValidators(Validators.required)
      this.newenquiryForm.controls['biddingDueDate'].updateValueAndValidity()
    }
    else {
      this.newenquiryForm.controls['biddingDueDate'].clearValidators()
      this.newenquiryForm.controls['biddingDueDate'].updateValueAndValidity()
    }

  }
  cityListLand: any = []
  

  CityList() {
    let payload = this.commonService.filterList()
    if (payload) payload.query = {
      status: true,
    }
    this.commonService.getSTList("city", payload)?.subscribe((data) => {
      this.cityListLand = data.documents || [];
    });
  }
  getConsigneeList() {
    return (this.consigneeList ?? []).filter(record => record?.partymasterId != this.newenquiryForm?.value?.value);
  }
  getUomList() {
    let payload = this.commonService.filterList()
    if (payload) payload.query = { 'status': true }
    this.commonService.getSTList('uom', payload)?.subscribe((data) => {
      this.uomData = data.documents;
      this.lengthData = data?.documents?.filter(lengthtype => lengthtype?.uomCategory === 'Length');
      this.weighthData = data?.documents?.filter(lengthtype => lengthtype?.uomCategory === 'Weight');

    });
  }
  getSmartAgentList() {

    let payload = this.commonService.filterList()
    if (payload) payload.query = {
      'status': true,
    }
    this.commonService.getSTList("agent", payload)?.subscribe((data: any) => {
      let agentId = data.documents[0]?.agentId
      this.getDepartmentList(agentId)
    });
  }


  getDepartmentList(id) {

    let payload = this.commonService.filterList()
    if (payload) payload.query = {
      parentId: id,
    }
    this.commonService.getSTList('department', payload)?.subscribe((data) => {
      this.departmentList = data.documents;
    });
  }

  getPartyMasterDropDowns() {
    let payload = this.commonService.filterList()
    if (payload) payload.query = {
      "status": true
    }
    this.commonService.getSTList("partymaster", payload)?.subscribe((res: any) => {
      this.partyMasterNameList = res?.documents;
      if (!this.isAddMode) {
        this.isEditMode = true;
        this.getAgentAdviceById(this.id);
      } else {
        // this.addContainerRow();
        this.radioButtonChange('Pallets', 0)
      }
      res?.documents?.filter((x) => {
        if (x.customerType) {
          x.customerType.map((res: any) => {
            if (res?.item_text === 'Shipper') { this.shipperList.push(x) }
            else if (res?.item_text === 'Booking Party') { this.bookingpartyList.push(x) }
            else if (res?.item_text === 'Invoicing Party') { this.invoicingpartyList.push(x) }
            else if (res?.item_text === 'Forwarder') { this.forwarderChaList.push(x) }
            else if (res?.item_text === 'Consignee') { this.consigneeList.push(x) }
            else {
            }
          })
        }
        if (x?.opsName) {
          this.ops_coordinator.push(x)
        }
      });
    });
  }
  sort(array, key) {
    return this.sortPipe.transform(array, key);
  }
  getCarriageDropDowns() {
    let payload = this.commonService.filterList()
    if (payload) payload.query = {
      "status": true,
      "customerType": "ICD"
    }
    this.commonService.getSTList("partymaster", payload)?.subscribe((res: any) => {
      this.partymasterList = res?.documents;
    });
  }
  getShippingLineDropDowns() {

    let payload = this.commonService.filterList()

    if (payload) payload.query = {
      status: true,
      // "$and": [
      //   {
      //     "feeder": {
      //       "$ne": true
      //     }
      //   }
      // ]
    }

    this.commonService.getSTList("shippingline", payload)?.subscribe((res: any) => {
      this.shippingLineList = res?.documents;

    });
  }
  getContractDropDowns() {
    let payload = this.commonService.filterList()

    if (payload) payload.query = {
      status: true
    }
    this.commonService.getSTList("contact", payload)?.subscribe((res: any) => {
      this.contactList = res?.documents;
    });
  }
  getproductDropDowns() {

    let payload = this.commonService.filterList()

    if (payload?.query) payload.query = {
      status: true
    }

    this.commonService.getSTList("product", payload)?.subscribe((res: any) => {
      this.productList = res?.documents;
    });
  }
  getLocationDropDowns() {
    let payload = this.commonService.filterList()

    if (payload) payload.query = {
      status: true,
      masterType: {
        "$in": ['YARD', 'CFS', 'ICD']
      },
    }
    this.commonService.getSTList("location", payload)?.subscribe((res: any) => {
      this.locationList = res?.documents;
      this.locationListOG = res?.documents;
      // let locationId = this.locationList?.filter((x) => x?.locationName?.toLowerCase() === "mumbai")[0]?.locationId
      // this.newenquiryForm.controls.location.setValue(locationId);
    });
  }
  getICDLocation() {
    let payload = this.commonService.filterList()

    if (payload) payload.query = {
      status: true,
      masterType: {
        "$in": ['YARD', 'CFS', 'ICD']
      },
    }


    this.commonService.getSTList("location", payload)?.subscribe((res: any) => {
      this.ICDlocationList = res?.documents;
      // this.preCarrigeList1 = res?.documents.filter(x => x?.country?.toLowerCase() === 'india')
    });
  }

  getSystemTypeDropDowns() {
    let payload = this.commonService.filterList()

    if (payload) payload.query = {
      status: true,
      "typeCategory": {
        "$in": [
          "ShipmentTypeLand",
          "ExportShipmentTypeAir", 
          "ExportShipmentType",
          "ImportShipmentTypeAir", 
          "ImportShipmentType",
          'truckType', 'wagonType', "carrierType", "tankStatus", "chargeBasis", "freightChargeTerm", "cargoType", "batchType", "contract", "customer", "imcoClass", "preCarriage", "onCarriage", "containerType", "containerSize", "enquiryType", "shippingTerm", "tankType", "shipmentTerm", "moveType", "incoTerm", "location", "icd", "packingGroup", "haulageType", "chargeTerm", 'shipmentType', "processPoint", "dimensionUnit", "palletType", "status", "ULDcontainerType"
        ]
      }
    }

    this.commonService.getSTList("systemtype", payload)?.subscribe((res: any) => {
      this.enquirytypeList = res?.documents?.filter(x => x.typeCategory === "enquiryType");
      this.enquirytypeList = this.enquirytypeList.filter(option => option.typeName !== 'Export Loaded');

      if (this.enquirytypeList?.length > 0) {
        this.enquirytypeList.map((res: any) => {
          if (res.typeName?.toLowerCase() === 'export')
            this.newenquiryForm.controls.enquiry_type.setValue(res.systemtypeId);
        });
      }
      this.chargeBasic = res?.documents?.filter(x => x.typeCategory === "chargeBasis");
      this.imcoList = res?.documents?.filter(x => x.typeCategory === "imcoClass");
      this.cargoTypeList = res?.documents?.filter(x => x.typeCategory === "cargoType");
      this.batchMasterList = res?.documents?.filter(x => x.typeCategory === "batchType");
      this.contractList = res?.documents?.filter(x => x.typeCategory === "contract");
      this.customerList = res?.documents?.filter(x => x.typeCategory === "customer");
      this.shippingtermList = res?.documents?.filter(x => x.typeCategory === "shippingTerm");
      this.tanktypeList = res?.documents?.filter(x => x.typeCategory === "tankType");
      this.tankstatusList = res?.documents?.filter(x => x.typeCategory === "tankStatus");
      this.shipmenttermList = res?.documents?.filter(x => x.typeCategory === "shipmentTerm");
      this.movetypeList = res?.documents?.filter(x => x.typeCategory === "moveType");
      this.incotermList = res?.documents?.filter(x => x.typeCategory === "incoTerm");
      this.ULDcontainerlist = res?.documents?.filter(x => x.typeCategory === "ULDcontainerType");
      this.freightTermsList = res?.documents?.filter(x => x.typeCategory === "freightChargeTerm");
      this.packinggroupList = res?.documents?.filter(x => x.typeCategory === "packingGroup");
      this.haulagetypeList = res?.documents?.filter(x => x.typeCategory === "haulageType");
      this.chargetermList = res?.documents?.filter(x => x.typeCategory === "chargeTerm");
      this.processPointList = res?.documents?.filter(x => x.typeCategory === "processPoint");
      this.statusList = res?.documents?.filter(x => x.typeCategory === "status");
      this.containerTypeList = res?.documents?.filter(x => x.typeCategory === "containerType");
      this.wagonTypeList = res?.documents?.filter(x => x.typeCategory === "wagonType");
      this.truckTypeList = res?.documents?.filter(x => x.typeCategory === "truckType");
      this.containerSizeList = res?.documents?.filter(x => x.typeCategory === "containerSize");
      this.shipmentTypes = res?.documents?.filter(x => (x.typeCategory === "carrierType" && (this.isTransport ? x?.typeName?.toLowerCase() === "land" : x?.typeName?.toLowerCase() === "ocean" || x?.typeName?.toLowerCase() === "air")));
      this.loadTypeListOriginal = res?.documents?.filter(x => x.typeCategory === "shipmentType");

      if(this.isImport){
        this.ImportShipmentTypelist = res?.documents?.filter(x => x.typeCategory === "ImportShipmentType");
        this.ImportShipmentTypelistAir = res?.documents?.filter(x => x.typeCategory === "ImportShipmentTypeAir"); 
      }else if(this.isExport){
        this.ImportShipmentTypelist = res?.documents?.filter(x => x.typeCategory === "ExportShipmentType");
        this.ImportShipmentTypelistAir = res?.documents?.filter(x => x.typeCategory === "ExportShipmentTypeAir");
      }else if(this.isTransport){
          this.ImportShipmentTypelist = res?.documents?.filter(x => x.typeCategory === "ShipmentTypeLand");
      }


      // this.shipmentTypes = res?.documents?.filter(x => x.typeCategory === "shipmentType"); 
      this.dimensionUnitList = res?.documents?.filter(x => x.typeCategory === "dimensionUnit");
      this.palletTypeslist = res?.documents?.filter(x => x.typeCategory === "palletType");
      let containerType = this.containerTypeList.filter(x => x.typeName.toLowerCase() === "iso tank")[0]?.typeName

      if (!this.newenquiryForm.controls.containerType.value) {
        this.newenquiryForm.controls.containerType.setValue(containerType)
      }

      let containerSize = this.containerSizeList.filter(x => x.typeName.toLowerCase() === "tk-20")[0]?.typeName
      if (!this.newenquiryForm.controls.containerSize.value) {
        this.newenquiryForm.controls.containerSize.setValue(containerSize)
      }

      if (this.shipmentTypes?.length > 0) {
        this.shipmentTypes.map((res: any) => {
          if (res.typeName?.toLowerCase() === 'land' && this.isTransport) {
            this.newenquiryForm.controls.Shipment_Type.setValue(res.systemtypeId);
            setTimeout(() => {
              this.shipmentType();
            }, 2000);
            this.isDisable = true
          }
        });
      }
    });

    this.cargoTypeList = this.cargoTypeList.map((x) => x.typeName?.toUpperCase())

  }


  getAirPort() {
    let payload = this.commonService.filterList()
    if (payload)payload.query = {
      ...payload.query,
      status: true,
    }
    this.commonService.getSTList("airportmaster", payload)?.subscribe((res: any) => {
      res?.documents?.map(x => (
        this.portList.push({
          portId: x?.airportmasterId,
          portName: x?.airPortname,
          portTypeName: 'air'
        })
      ));
    });
  }
  getPortDropDowns() {
    let payload = this.commonService.filterList()

    if (payload) payload.query = {
      status: true,
    }
    if (payload?.size) payload.size = 15000
    if (payload?.project) payload.project = ["portDetails.portName", "portDetails.portTypeName", "portId"];

    this.commonService.getSTList("port", payload)?.subscribe((res: any) => {
      res?.documents?.map(x => (
        this.portList.push({
          portId:this.activeFrightAir ? x?.airportmasterId : x?.portId,
        portName: this.activeFrightAir ? x.airPortname : x?.portDetails?.portName,
          portTypeName: 'port'
        })
      ));


    });
  }

  getCurrencyDropDowns() {

    let payload = this.commonService.filterList()
    if (payload) payload.query = {
      status: true,
    }


    this.commonService.getSTList("currency", payload)?.subscribe((res: any) => {
      this.currencyList = res?.documents;
      let currency = this.currencyList.filter(x => x.currencyShortName?.toLowerCase() === "usd")[0]?.currencyId
      if (!this.newenquiryForm.controls.poldetentioncurrency.value) {
        this.newenquiryForm.controls.poldetentioncurrency.setValue(currency)
      }
      if (!this.newenquiryForm.controls.pod_detentioncurrency.value) {
        this.newenquiryForm.controls.pod_detentioncurrency.setValue(currency)
      }
    });
  }

  getUsersForDropDown() {

    let payload = this.commonService.filterList()
    if (payload) payload.query = {
      status: true,
    }
    this.commonService.getSTList("user", payload)?.subscribe((res: any) => {
      this.userList = res?.documents;
    });
  }

  getAgentAdviceById(id) {
    let mustArray = [];
    let payload = this.commonService.filterList()



    let url = Constant.ENQUIRY_LIST;
    if (payload) payload.query = {
      enquiryId: this.id,
    }


    this.commonService.getSTList(url, payload)
      ?.subscribe((res: any) => {
        this.agentAdviceDetails = res?.documents[0];                             
        this.newenquiryForm.patchValue({
          uniqueRefNo: this.agentAdviceDetails?.enquiryNo,
          status: this.agentAdviceDetails?.status,
          loadType: this.agentAdviceDetails?.basicDetails?.loadTypeId,
          importShipmentType: this.agentAdviceDetails?.basicDetails?.importShipmentTypeId,
          // agentAdviceDate: this.agentAdviceDetails?.basicDetails?.agentAdviceDate,
          noOfContainer: this.agentAdviceDetails?.noOfContainer,
          grossWeightContainer: this.agentAdviceDetails?.grossWeightContainer,
          enquiry_number: this.agentAdviceDetails?.enquiryNo,
          enquiry_date: this.currentUrl === 'clone' ? new Date() : this.agentAdviceDetails?.basicDetails?.enquiryDate || new Date(),
          booking_party: this.agentAdviceDetails?.basicDetails?.bookingPartyId,
          billingBranch: this.agentAdviceDetails?.basicDetails?.billingBranch,
          billingParty: this.agentAdviceDetails?.basicDetails?.billingPartyId,
          shipper_address: this.agentAdviceDetails?.basicDetails?.address,
          ops_coordinator: this.agentAdviceDetails?.basicDetails?.opsCoordinatorId,
          sales_person: this.agentAdviceDetails?.basicDetails?.salesPersonId,
          forworder: this.agentAdviceDetails?.basicDetails?.forwarderId,
          move_type: this.agentAdviceDetails?.basicDetails?.moveTypeId,
          tank_type: this.agentAdviceDetails?.basicDetails?.tankTypeId,
          tankStatus: this.agentAdviceDetails?.basicDetails?.tankStatusId,
          shippping_term: this.agentAdviceDetails?.basicDetails?.shippingTermId,
          shipment_term: this.agentAdviceDetails?.basicDetails?.batchType,
          inco_term: this.agentAdviceDetails?.basicDetails?.incoTermId,
          Shipment_Type: this.agentAdviceDetails?.basicDetails?.ShipmentTypeId,
          stcQutation: this.agentAdviceDetails?.basicDetails?.stcQuotationNo,
          shipper: this.agentAdviceDetails?.basicDetails?.shipperId,
          cosignee: this.agentAdviceDetails?.basicDetails?.consigneeId,
          incoicing_party: this.agentAdviceDetails?.basicDetails?.invoicingPartyId,
          agentadviceTo: this.agentAdviceDetails?.basicDetails?.agentAdviceTo,
          agentadviceFrom: this.agentAdviceDetails?.basicDetails?.agentAdviceFrom,
          poNo: this.agentAdviceDetails?.basicDetails?.poNo,
          poDate: this.agentAdviceDetails?.basicDetails?.poDate,
          cargoType: this.agentAdviceDetails?.basicDetails?.cargoTypeId,
          notifyParty: this.agentAdviceDetails?.basicDetails?.notifyPartyId,
          moveNo: this.agentAdviceDetails?.basicDetails?.moveNo,
          product_id: this.agentAdviceDetails?.productDetails?.productId,
          proper_shipping_name: this.agentAdviceDetails?.productDetails?.properShippingName,
          technical_name: this.agentAdviceDetails?.productDetails?.technicalName,
          commodityType: this.agentAdviceDetails.productDetails?.commodityType || '',
          imco_class: this.agentAdviceDetails?.productDetails?.imcoClass,
          size: this.agentAdviceDetails?.productDetails?.di,
          hight: this.agentAdviceDetails?.productDetails?.hi,
          Width: this.agentAdviceDetails?.productDetails?.hi,
          linght: this.agentAdviceDetails?.productDetails?.li,
          typeTemp: this.agentAdviceDetails?.productDetails?.typeTemp,
          To: this.agentAdviceDetails?.productDetails?.To,
          Range: this.agentAdviceDetails?.productDetails?.Range,
          un_no: this.agentAdviceDetails?.productDetails?.unNo,
          hsCode: this.agentAdviceDetails?.productDetails?.hsCode,
          msdsDoc: this.agentAdviceDetails?.productDetails?.msdsDoc,
          packing_group: this.agentAdviceDetails?.productDetails?.packingGroup,
          flashPoint: this.agentAdviceDetails?.productDetails?.flashPoint,
          marine_pollution: this.agentAdviceDetails?.productDetails?.marinePollutionId,

          grossWeight: this.agentAdviceDetails?.productDetails?.grossWeight,
          cargoReadyDate: this.currentUrl === 'clone' ? '' : this.agentAdviceDetails?.productDetails?.cargoReadyDate,
          targetDeliveryDate: this.currentUrl === 'clone' ? '' : this.agentAdviceDetails?.productDetails?.targetDeliveryDate,
          biddingDueDate: this.agentAdviceDetails?.productDetails?.biddingDueDate,
          Density: this.agentAdviceDetails?.productDetails?.Density,
          contract: this.agentAdviceDetails?.productDetails?.contract,
          contractName: this.contractList?.filter(e => e.systemtypeId === this.agentAdviceDetails?.productDetails?.contract)[0]?.typeName,

          shipping_line: this.agentAdviceDetails?.routeDetails?.shippingLineId,
          freightTerms: this.agentAdviceDetails?.routeDetails?.freightTerms,
          transportPreCarriage: this.agentAdviceDetails?.routeDetails?.transportPreCarriage,
          transportOnCarriage: this.agentAdviceDetails?.routeDetails?.transportOnCarriage,
          wagonNo: this.agentAdviceDetails?.routeDetails?.wagonNo || '',
          freeDaysTime : this.agentAdviceDetails?.routeDetails?.freeDaysTime || [],
          vehicleNo: this.agentAdviceDetails?.routeDetails?.vehicleNo || '',
          destinationCustomClearance: this.agentAdviceDetails?.routeDetails?.destinationCustomClearance,
          originCustomClearance: this.agentAdviceDetails?.routeDetails?.originCustomClearance,
          destHaulage: this.agentAdviceDetails?.routeDetails?.destHaulageId,
          deliveryOfPlace: this.agentAdviceDetails?.routeDetails?.deliveryOfPlaceId,
          shippingLineratevalidfrom_date: this.shippingLineValid ? this.agentAdviceDetails?.routeDetails?.shippingLineValidFrom : '',
          shippingLineratevalidto_date: this.shippingLineValid ? this.agentAdviceDetails?.routeDetails?.shippingLineValidTo : '',
          pre_carriage: this.agentAdviceDetails?.routeDetails?.preCarriageId,
          load_place: this.agentAdviceDetails?.routeDetails?.loadPlace,
          load_port: this.agentAdviceDetails?.routeDetails?.loadPortId,
          plannedVesselforHop: this.agentAdviceDetails?.routeDetails?.plannedVesselforHopId,
          voyageNumberforHop: this.agentAdviceDetails?.routeDetails?.voyageNumberforHop,
          location: this.agentAdviceDetails?.routeDetails?.location,
          discharge_port: this.agentAdviceDetails?.routeDetails?.destPortId,
          on_carriage: this.agentAdviceDetails?.routeDetails?.onCarriageId,
          fpod: this.agentAdviceDetails?.routeDetails?.fpodId,
          ts_port: this.agentAdviceDetails?.routeDetails?.tsPortId,
          linevoyageNo: this.agentAdviceDetails?.routeDetails?.lineVoyageNo,
          haulageType: this.agentAdviceDetails?.routeDetails?.haulageTypeId,
          poldetentionereeDay: this.agentAdviceDetails?.detentionDetails?.polFreeDay,
          poldetentionAmount: this.agentAdviceDetails?.detentionDetails?.polDetentionAmount,
          poldetentioncurrency: this.agentAdviceDetails?.detentionDetails?.polDetentionCurrencyId,
          pod_detentionfreeDay: this.agentAdviceDetails?.detentionDetails?.podFreeDay,
          pod_detentionAmount: this.agentAdviceDetails?.detentionDetails?.podDetentionAmount,
          pod_detentioncurrency: this.agentAdviceDetails?.detentionDetails?.podDetentionCurrencyId,
          freightAt: this.agentAdviceDetails?.productDetails?.freightAt,
          containerType: this.agentAdviceDetails?.containerType,
          uldcontainerType: this.agentAdviceDetails?.uldcontainerType,
          containerSize: this.agentAdviceDetails?.containerSize,
          backupShippingLine: this.agentAdviceDetails?.backupShippingLine,
          transportOrigin: this.agentAdviceDetails.customDetails?.transportOrigin || false,
          transportDestination: this.agentAdviceDetails.customDetails?.transportDestination || false,
          originDestination: this.agentAdviceDetails.customDetails?.originDestination,
          customOrigin: this.agentAdviceDetails.customDetails?.customOrigin,
          customOriginLocation: this.agentAdviceDetails.customDetails?.customOriginLocation,
          customDestinationLocation: this.agentAdviceDetails.customDetails?.customDestinationLocation,
          customDestination: this.agentAdviceDetails?.customDetails?.customDestination,
          originOption: this.agentAdviceDetails?.customDetails?.originOption,
          destinationOption: this.agentAdviceDetails?.customDetails?.destinationOption,
          originPickupAddress: this.agentAdviceDetails?.customDetails?.originPickupAddress,
          destinationDeliveryAddress: this.agentAdviceDetails?.customDetails?.destinationDeliveryAddress,
          etd: this.agentAdviceDetails?.routeDetails?.etd,
          eta: this.agentAdviceDetails?.routeDetails?.eta,
          preCarriage: this.agentAdviceDetails?.transportDetails?.preCarriage,
          onCarriage: this.agentAdviceDetails?.transportDetails?.onCarriage,
          cargo: this.agentAdviceDetails?.insurance?.cargo,
          emptyContainer: this.agentAdviceDetails?.insurance?.emptyContainer,
          palletization: this.agentAdviceDetails?.insurance?.palletization,
          fumigation: this.agentAdviceDetails?.insurance?.fumigation,
          warehousing: this.agentAdviceDetails?.insurance?.warehousing,

          stuffing_location_Type: this.agentAdviceDetails?.stuffing_location?.stuffing_location_Type,
          billingBranchStuffing: this.agentAdviceDetails?.stuffing_location?.billingBranchStuffingName,
          Stuffing_shipper_address: this.agentAdviceDetails?.stuffing_location?.Stuffing_shipper_address,

          stuffing : this.agentAdviceDetails?.stuffing_location?.stuffing_location_Type != "" ? true : false,
        });

        let data ={
          destPortName :  this.agentAdviceDetails?.routeDetails?.destPortName || '', 
          loadPortName :  this.agentAdviceDetails?.routeDetails?.loadPortName || ''
        }
        this.searchPortAll(data)

        const cargoArray = this.empForm.get('cargos') as FormArray;
        cargoArray.clear();
        (this.agentAdviceDetails?.looseCargoDetails?.cargos ?? []).forEach((cargo, index) => {
          const cargoArray = this.empForm.get('cargos') as FormArray;
          const cargoFormGroup = this.newCargo();
          cargoFormGroup.patchValue(cargo);
          cargoArray.push(cargoFormGroup);
        });

        this.commodityArray = this.agentAdviceDetails?.cargoDetail;

        this.desPortchange()
        this.loadportchange()
        this.getRemarks();
        // this.productData()
        // this.originHaulage(true)
        // this.setEnquiry(this.agentAdviceDetails?.basicDetails?.enquiryTypeId)
        this.newenquiryForm.valueChanges?.subscribe(x => {
          this.valueChange = true
        })

        setTimeout(() => {
          this.setShipper(this.agentAdviceDetails?.basicDetails?.shipperId)
          this.setShipper1(this.agentAdviceDetails?.basicDetails?.consigneeId)
         this.shipmentType()
          this.getTabs()
        }, 2000);

        if (this.agentAdviceDetails?.containersDetails?.length > 0) {
          this.agentAdviceDetails?.containersDetails?.filter(e => {
            this.addContainerRow(e)
          })
        }
        if (this.agentAdviceDetails?.transportDetails?.destination?.length > 0) {
          const transportArray = this.newenquiryForm.get('transport1') as FormArray;
          transportArray.clear();
          this.agentAdviceDetails?.transportDetails?.destination?.filter((e, i) => {
            this.addTransport1Row(e, i)
          })
        } else {
          const transportArray = this.newenquiryForm.get('transport1') as FormArray;
          transportArray.clear();
          this.getInitialTransport1Rows().forEach(row => transportArray.push(row));
        }
        if (this.agentAdviceDetails?.transportDetails?.origin?.length > 0) {
          const transportArray = this.newenquiryForm.get('transport') as FormArray;
          transportArray.clear();
          this.agentAdviceDetails?.transportDetails?.origin?.filter((e, i) => {
            this.addTransportRow(e, i)
          })
        } else {
          const transportArray = this.newenquiryForm.get('transport') as FormArray;
          transportArray.clear();
          this.getInitialTransportRows().forEach(row => transportArray.push(row));
        }
        // const transporthubArray = this.newenquiryForm.get('transhipmentHops') as FormArray;
        // transporthubArray.clear();
        // this.getInitialTransportHubRows().forEach(row => transporthubArray.push(row));

        if (this.currentUrl === 'show') {
          this.newenquiryForm.disable();
          this.remarksForm.disable();
          this.f2.disable();
          this.commodityForm.disable();
          this.empForm.disable();
          this.show = true;

          this.newenquiryForm.get('plannedVesselforHop')?.disable();
          this.newenquiryForm.get('voyageNumberforHop')?.disable();
        }

        if(this.agentAdviceDetails?.stuffing_location.stuffing_location_Type != ""){
          
          if (this.agentAdviceDetails?.stuffing_location.stuffing_location_Type === 'factory') {
            this.newenquiryForm.get('stuffingfactory').setValue(true) 
            this.newenquiryForm.get('stuffingcfs').setValue(false) 
            this.showFactoryDropdowns = true;
            this.showCfsDropdown = false; 
          } else if (this.agentAdviceDetails?.stuffing_location.stuffing_location_Type === 'cfs') {
            this.newenquiryForm.get('stuffingcfs').setValue(true) 
            this.newenquiryForm.get('stuffingfactory').setValue(false) 
            this.showCfsDropdown = true;
            this.showFactoryDropdowns = false; 
          }
        }
      

      })



  }

  getRemarks() {

    let payload = this.commonService.filterList()
    if (payload) payload.query = {
      "enquiryId": this.id
    }

    this.commonService.getSTList('comment', payload)?.subscribe((res: any) => {
      res.documents.filter((x) => {
        this.remarksArray.push(x)
      })
    });

  }

  onSaveCharge(evt) {
    this.chargedData = evt;
  }

  onFreightChargedData(freightChargedData) {
    this.freightChargedData = freightChargedData;

  }

  getFreightChargedData(freightChargedData) {
    this.freightChargedData = freightChargedData;
  }

  getcostItemList(chargedData) {
    this.chargedData = chargedData;
  }

  onDrawerClose() {
    // this.getPartyMasterDropDowns()
  }

  @ViewChild('drawer') drawer!: MatDrawer;
  handleGetList(event) {
    this.getPartyMasterDropDowns()
    this.drawer.close(); 
  }

  showContainer: boolean = false;
  showPallet: boolean = false;
  typeOfWay: string = '';
  railandland: boolean = false;
  airandocean: boolean = false;
  activeFrightAir: Boolean = false
  getTabs() {
    let loadName = this.loadTypeList.find((x) => x.systemtypeId == this.newenquiryForm.value.loadType)?.typeName.toLowerCase() || '';
    if (loadName) {
      if (['loose', 'lcl', 'ltl','ptl'].includes(loadName)) {
        this.showPallet = true;
        this.showContainer = false;
      } else if (['break bulk'].includes(loadName)) {
        this.showPallet = false;
        this.showContainer = false;
      } else {
        this.showPallet = false;
        this.showContainer = true;
        if (['fcl'].includes(loadName)) {
          this.typeOfWay = "Container"
        } else if (['uld container'].includes(loadName)) {
          this.typeOfWay = "ULD Container"
        } else if (['ftl'].includes(loadName)) {
          this.typeOfWay = "Truck"
        } else if (['fwl'].includes(loadName)) {
          this.typeOfWay = "Wagon"
        }
      }
    } else {
      this.showPallet = false;
      this.showContainer = false;
    }

  }

  activeFright: string = ''
  shipmentType(isReset: boolean = false) {
    if(isReset){
      this.newenquiryForm.get('shipping_line').setValue('');
      this.newenquiryForm.get('plannedVesselforHop').setValue('');
      this.newenquiryForm.get('voyageNumberforHop').setValue('');
      this.newenquiryForm.get('load_port').setValue('');
      this.newenquiryForm.get('discharge_port').setValue('');
      this.newenquiryForm.get('backupShippingLine').setValue('');
    }
    this.activeFright = this.shipmentTypes?.find(x => x.systemtypeId === this.newenquiryForm.value.Shipment_Type)?.typeName?.toLowerCase();
    this.activeFrightAir = false
    if (this.activeFright == 'air') {
      this.activeFrightAir = true
      this.loadTypeList = this.loadTypeListOriginal?.filter((x) => ['Loose', 'ULD Container']?.find(t => t.toLowerCase() === x.typeName.toLowerCase()))
    } else if (this.activeFright == 'ocean') {
      this.loadTypeList = this.loadTypeListOriginal?.filter((x) => ['FCL', 'LCL', 'Break Bulk']?.find(t => t.toLowerCase() === x.typeName.toLowerCase()))
    } else if (this.activeFright == 'land') {
      if(this.isTransport){
        this.locationList = [...this.cityListLand].map((x) => ({
          locationName: x?.cityName ? x?.cityName : x?.locationName,
          locationId: x?.cityId ? x?.cityId : x?.locationId
        }))
      }else{
        this.locationList = [...this.locationListOG, ...this.cityListLand].map((x) => ({
          locationName: x?.cityName ? x?.cityName : x?.locationName,
          locationId: x?.cityId ? x?.cityId : x?.locationId
        }))
      }
   
      this.loadTypeList = this.loadTypeListOriginal?.filter((x) => ['FCL', 'FTL', 'PTL']?.find(t => t.toLowerCase() === x.typeName.toLowerCase()))
    } else if (this.activeFright == 'rail') {
      this.loadTypeList = this.loadTypeListOriginal?.filter((x) => ['FWL']?.find(t => t.toLowerCase() === x.typeName.toLowerCase()))
    } else {
      this.loadTypeList = this.loadTypeListOriginal
    }
    this.railandland = false
    this.airandocean = false

    // if (this.agentAdviceDetails?.transportDetails?.origin?.length == 0 || (!this.agentAdviceDetails?.transportDetails?.origin)) {
    //   const transportArray = this.newenquiryForm.get('transport') as FormArray;
    //   transportArray.clear();
    //   this.getInitialTransportRows().forEach(row => transportArray.push(row)); 
    // }
    // if (this.agentAdviceDetails?.transportDetails?.destination?.length == 0 || (!this.agentAdviceDetails?.transportDetails?.destination)) {
    //   const transportArray = this.newenquiryForm.get('transport1') as FormArray;
    //   transportArray.clear();
    //   this.getInitialTransport1Rows().forEach(row => transportArray.push(row));
    // }


    if (['rail', 'land'].includes(this.activeFright)) {
      // const transportArray = this.newenquiryForm.get('transport1') as FormArray;
      // transportArray.clear();
      this.railandland = true
      this.newenquiryForm.get('preCarriage').setValue(true)
      this.newenquiryForm.get('onCarriage').setValue(false)
      // this.newenquiryForm.get('load_place').setValidators([Validators.required]);
      // this.newenquiryForm.get('load_place').updateValueAndValidity();
      // this.newenquiryForm.get('location').setValidators([Validators.required]);
      // this.newenquiryForm.get('location').updateValueAndValidity();
      this.newenquiryForm.get('load_port').clearValidators();
      this.newenquiryForm.get('load_port').updateValueAndValidity();
      this.newenquiryForm.get('discharge_port').clearValidators();
      this.newenquiryForm.get('discharge_port').updateValueAndValidity();
      // this.newenquiryForm.get('inco_term').clearValidators();
      // this.newenquiryForm.get('inco_term').updateValueAndValidity();
      this.newenquiryForm.get('shipping_line').clearValidators();
      this.newenquiryForm.get('shipping_line').updateValueAndValidity();
      // Clear validators for fields not needed in transport mode
      this.newenquiryForm.get('freeDaysTime').clearValidators();
      this.newenquiryForm.get('freeDaysTime').updateValueAndValidity();
      this.newenquiryForm.get('deliveryOfPlace').clearValidators();
      this.newenquiryForm.get('deliveryOfPlace').updateValueAndValidity();
    } else {

      this.airandocean = true
      // this.newenquiryForm.get('load_place').clearValidators();
      // this.newenquiryForm.get('load_place').updateValueAndValidity();
      // this.newenquiryForm.get('location').clearValidators();
      // this.newenquiryForm.get('location').updateValueAndValidity();
      this.newenquiryForm.get('load_port').setValidators([Validators.required]);
      this.newenquiryForm.get('load_port').updateValueAndValidity();
      this.newenquiryForm.get('discharge_port').setValidators([Validators.required]);
      this.newenquiryForm.get('discharge_port').updateValueAndValidity();
      // this.newenquiryForm.get('inco_term').setValidators([Validators.required]);
      // this.newenquiryForm.get('inco_term').updateValueAndValidity();
      this.newenquiryForm.get('shipping_line').setValidators([Validators.required]);
      this.newenquiryForm.get('shipping_line').updateValueAndValidity();
      // Re-enable validators for ocean/air mode
      this.newenquiryForm.get('freeDaysTime').setValidators([Validators.required]);
      this.newenquiryForm.get('freeDaysTime').updateValueAndValidity();
      this.newenquiryForm.get('deliveryOfPlace').setValidators([Validators.required]);
      this.newenquiryForm.get('deliveryOfPlace').updateValueAndValidity();
    }

    this.setValidationFromArray()
    if (this.isAddMode) {
        this.newenquiryForm.controls['loadType'].setValue('');
    }

    // if (['Air', 'Ocean']?.find(t => t === this.shipmentTypes?.find(x => x.systemtypeId === this.newenquiryForm.value.Shipment_Type)?.typeName)) {
    //   const containerArray = this.newenquiryForm.get('container') as FormArray;
    //   containerArray.clear();
    // } else { 
    //   const containerArray = this.newenquiryForm.get('container') as FormArray;
    //   containerArray.clear(); 
    // }

  }
  getInvalidControls() {
    const invalidControls = [];

    const controls = this.newenquiryForm.controls;

    for (const name in controls) {
      if (controls[name].invalid) {
        if (controls[name] instanceof FormArray) {
          const formArray = controls[name] as FormArray;
          formArray.controls.forEach((control, index) => {
            if (control.invalid) {
              invalidControls.push(`${name}[${index}]`);
            }
          });
        } else if (controls[name] instanceof FormGroup) {
          const formGroup = controls[name] as FormGroup;
          for (const subName in formGroup.controls) {
            if (formGroup.controls[subName].invalid) {
              invalidControls.push(`${name}.${subName}`);
            }
          }
        } else {
          invalidControls.push(name);
        }
      }
    }

    return invalidControls;
  }

  findInvalidControls(formArray: FormArray) {
    formArray.controls.forEach((control, index) => {
      if (control instanceof FormControl) {
        if (control.invalid) {
          console.log(`FormControl at index ${index} is invalid`, control.errors);
        }
      } else if (control instanceof FormGroup) {
        console.log(`FormGroup at index ${index} contains invalid controls:`);
        Object.keys(control.controls).forEach(key => {
          const groupControl = control.get(key);
          if (groupControl && groupControl.invalid) {
            console.log(`Invalid control in FormGroup: ${key}`, groupControl.errors);
          }
        });
      } else if (control instanceof FormArray) {
        console.log(`FormArray at index ${index} contains invalid controls:`);
        this.findInvalidControls(control);
      }
    });
  }

  onSave(evt, pending) {
    const transportArray = this.newenquiryForm.get('transport') as FormArray;
    const transporthubArray = this.newenquiryForm.get('transhipmentHops') as FormArray;
    console.log(this.findInvalidControls(transportArray));
    transporthubArray.value.filter(x =>
      this.portList1?.filter(p => {
        if(p.portId === x?.load_port){
          x.load_portName = p?.portName
        }
      })
    )
    transporthubArray.value.filter(x =>
      this.vesselList?.filter(p => {
        if(p.vesselId === x?.plannedVessel){
          x.plannedVesselName = p?.vesselName
        }
      })
    )

    this.submitted1 = true;
    this.submitted2 = true;

    var enquiryId = "";
    var url = Constant.ENQUIRY_LIST;
    var enquiryId = "";
    if (!this.isAddMode) {
      url = "enquiry/" + this.id;
      enquiryId = this.id;
    }

    let originID = '';
    let originName = '';
    let destinationID = '';
    let destinationName = '';
    if (this.railandland) {
      if (this.transport.at(0).get('locationType').value == 'location') {
        originID = this.transport.at(0).get('location').value
        originName = this.locationList.filter(x => x.locationId === this.transport.at(0).get('location').value)[0]?.locationName
      } else if (this.transport.at(0).get('locationType').value == 'port') {
        originID = this.transport.at(0).get('location').value
        originName = this.portList1.filter(x => x.portId === this.transport.at(0).get('location').value)[0]?.portName
      } else {
        originName = this.transport.at(0).get('addressId').value ? this.transport.at(0).get('addressId').value : this.transport.at(0).get('address').value
      }

      if (this.transport.at(this.transport?.controls?.length - 1).get('locationType').value == 'location') {
        destinationID = this.transport.at(this.transport?.controls?.length - 1).get('location').value
        destinationName = this.locationList.filter(x => x.locationId === this.transport.at(this.transport?.controls?.length - 1).get('location').value)[0]?.locationName
      } else if (this.transport.at(this.transport?.controls?.length - 1).get('locationType').value == 'port') {
        destinationID = this.transport.at(this.transport?.controls?.length - 1).get('location').value
        destinationName = this.portList2.filter(x => x.portId === this.transport.at(this.transport?.controls?.length - 1).get('location').value)[0]?.portName
      } else {
        destinationName = this.transport.at(this.transport?.controls?.length - 1).get('addressId').value ? this.transport.at(this.transport?.controls?.length - 1).get('addressId').value : this.transport.at(0).get('address').value
      }
    } else {

      if (this.transport.at(0).get('locationType').value == 'location') {
        originID = this.transport.at(0).get('location').value
        originName = this.locationList.filter(x => x.locationId === this.transport.at(0).get('location').value)[0]?.locationName
      } else {
        originName = this.transport.at(0).get('addressId').value ? this.transport.at(0).get('addressId').value : this.transport.at(0).get('address').value
      }
      if (this.transport1.at(this.transport1?.controls?.length - 1).get('locationType').value == 'location') {
        destinationID = this.transport1.at(this.transport1?.controls?.length - 1).get('location').value
        destinationName = this.locationList.filter(x => x.locationId === this.transport1.at(this.transport1?.controls?.length - 1).get('location').value)[0]?.locationName
      } else {
        destinationName = this.transport1.at(this.transport1?.controls?.length - 1).get('addressId').value ? this.transport1.at(this.transport1?.controls?.length - 1).get('addressId').value : this.transport1.at(this.transport1?.controls?.length - 1).get('address').value
      }
    }


    if (!pending) {
      this.submitted = true;
      // if (this.newenquiryForm.controls.fpod.invalid) {
      //   this.notification.create
      //     ('error', "FPOD cannot be blank for Shipping Term 'Door to Door' or 'Pier to Door'", '');
      //   this.expand.nativeElement.click();
      //   return false
      // }

      // if (this.newenquiryForm.controls.cargoReadyDate.invalid) {
      //   this.notification.create
      //     ('error', 'Please update Inquiry Date and Cargo Ready Date', '');
      //   this.expand?.nativeElement.click();
      //   return false
      // }

      // if (this.newenquiryForm.controls.containerType.invalid) {
      //   this.notification.create
      //     ('error', 'Please Fill The ContainerType', '');
      //   this.expand?.nativeElement.click();
      //   return false
      // }

      if (this.newenquiryForm.invalid) {
        this.notification.create
          ('error', 'Please Fill The Form', '');
        this.expand?.nativeElement.click();
        return false
      }

      // if (this.commodityArray?.length == 0) {
      //   this.notification.create
      //     ('error', 'Please add cargo details', '');
      //   this.expand.nativeElement.click();
      //   return false
      // }

    }
    let stuffing_location:any={
      "stuffing_location_Type":this.newenquiryForm.value?.stuffing_location_Type
    };
    if(this.newenquiryForm.value?.stuffing_location_Type === 'factory'){
      stuffing_location={
        ...stuffing_location,
        "billingBranchStuffingId":this.newenquiryForm.value?.billingBranchStuffing,
        "billingBranchStuffingName":this.billingBranchList.find(d=>d?.branch_name===this.newenquiryForm.value?.billingBranchStuffing)?.branch_name,
        "Stuffing_shipper_address":this.newenquiryForm?.value?.Stuffing_shipper_address
      }
    }
    if(this.newenquiryForm.value?.stuffing_location_Type === 'cfs'){
      stuffing_location={
        ...stuffing_location,
        "stuffingLocationId":this.newenquiryForm.value?.cfslocation,
        "stuffingLocationIdName":this.cfsDropdownOptions.find(d=>d?.value===this.newenquiryForm.value?.cfslocation)?.label
      }
    }
    
    let newAgentAdvice = {

      tenantId: this.userData.tenantId,
      quotationCreateStatus: false,
      orgId: this.commonFunction.getAgentDetails().orgId,
      customerId: this.newenquiryForm.value.shipper || '',
      enquiryId: enquiryId,
      cloneEnquiryNo: this.agentAdviceDetails?.cloneEnquiryNo || '',
      cloneEnquiryId: this.agentAdviceDetails?.cloneEnquiryId || '',
      agentadviceId: "",
      basicDetails: {
        agentAdviceDate: this.newenquiryForm.value.agentAdviceDate,
        enquiryDate: this.agentAdviceDetails?.basicDetails?.enquiryDate || new Date(),
        enquiryTypeId: this.newenquiryForm.value.enquiry_type,
        enquiryTypeName: (this.enquirytypeList.filter(x => x.systemtypeId === this.newenquiryForm.value.enquiry_type)[0]?.typeName),
        noOfContainer: this.newenquiryForm.value.noOfContainer,
        stcQuotationNo: this.newenquiryForm.value.stcQutation,
        bookingPartyId: this.newenquiryForm.value.booking_party,
        billingBranch: this.newenquiryForm.value.billingBranch,
        billingPartyId: this.newenquiryForm.value.billingParty || '',
        billingStateCode: this.billingBranchList?.filter(x => x.branch_name == this.newenquiryForm.value.billingBranch)[0]?.stateCodeBranch,
        billingCountry: this.billingBranchList?.filter(x => x.branch_name == this.newenquiryForm.value.billingBranch)[0]?.branch_countryName || '',
        billingPartyName: this.partyMasterNameList.filter(x => x.partymasterId === this.newenquiryForm.value.booking_party)[0]?.name,
        bookingPartyName: this.partyMasterNameList.filter(x => x.partymasterId === this.newenquiryForm.value.billingParty)[0]?.name,
        bookingPartyCurrency: this.partyMasterNameList.filter(x => x.partymasterId === this.newenquiryForm.value.booking_party)[0]?.partyCurrency?.currencyCode,
        invoicingPartyId: this.newenquiryForm.value.incoicing_party,
        invoicingPartyName: this.partyMasterNameList?.filter(x => x.partymasterId === this.newenquiryForm.value.incoicing_party)[0]?.name,
        forwarderId: this.newenquiryForm.value.forworder,
        forwarderName: this.partyMasterNameList?.filter(x => x.partymasterId === this.newenquiryForm.value.forworder)[0]?.name,
        consigneeId: this.newenquiryForm.value.cosignee,
        consigneeName: this.partyMasterNameList?.filter(x => x.partymasterId === this.newenquiryForm.value.cosignee)[0]?.name,
        ShipmentTypeId: this.newenquiryForm?.value?.Shipment_Type,
        ShipmentTypeName: this.shipmentTypes.find(x => x.systemtypeId === this.newenquiryForm.value.Shipment_Type)?.typeName,
        opsCoordinatorId: this.newenquiryForm.value.ops_coordinator || '',
        opsCoordinatorName: this.userList.filter(x => x.userId === this.newenquiryForm.value.ops_coordinator)[0]?.name,
        salesPersonId: this.newenquiryForm.value.sales_person || '',
        salesPersonName: this.customerList.filter(x => x.systemtypeId === this.newenquiryForm.value.sales_person)[0]?.typeName,
        shipperId: this.newenquiryForm.value.shipper || '',
        shipperName: this.partyMasterNameList.filter(x => x.partymasterId === this.newenquiryForm.value.shipper)[0]?.name,
        shipperCurrency: this.partyMasterNameList.filter(x => x.partymasterId === this.newenquiryForm.value.shipper)[0]?.partyCurrency?.currencyCode,
        shippingTermId: this.newenquiryForm.value.shippping_term || '',
        shippingTermName: this.shippingtermList.filter(x => x.systemtypeId === this.newenquiryForm.value.shippping_term)[0]?.typeName || '',

        batchType: this.newenquiryForm.value.shipment_term,

        moveTypeId: this.newenquiryForm.value.move_type,
        moveTypeName: this.movetypeList.filter(x => x.systemtypeId === this.newenquiryForm.value.move_type)[0]?.typeName,
        tankTypeId: this.newenquiryForm.value.tank_type,
        tankTypeName: this.tanktypeList.filter(x => x.systemtypeId === this.newenquiryForm.value.tank_type)[0]?.typeName,

        tankStatusId: this.newenquiryForm.value.tankStatus,
        tankStatusName: this.tankstatusList.filter(x => x.systemtypeId === this.newenquiryForm.value.tankStatus)[0]?.typeName,

        incoTermId: this.newenquiryForm.value.inco_term,
        incoTermName: this.incotermList.filter(x => x.systemtypeId === this.newenquiryForm.value.inco_term)[0]?.typeName,
        agentAdviceFrom: this.newenquiryForm.value.agentadviceFrom,
        agentAdviceTo: this.newenquiryForm.value.agentadviceTo,
        poDate: this.newenquiryForm.value.poDate,
        cargoTypeId: this.newenquiryForm.value.cargoType,
        cargoTypeName: this.incotermList.filter(x => x.systemtypeId === this.newenquiryForm.value.cargoType)[0]?.typeName,
        notifyPartyId: this.newenquiryForm.value.notifyParty || '',
        notifyPartyName: this.partyMasterNameList.filter(x => x.partymasterId === this.newenquiryForm.value.notifyParty)[0]?.name || '',
        moveNo: this.newenquiryForm.value.moveNo,
        loadType: this.loadTypeList.filter(x => x.systemtypeId === this.newenquiryForm.value.loadType)[0]?.typeName,
        loadTypeId: this.newenquiryForm.value.loadType,
        importShipmentTypeId: this.newenquiryForm.value?.importShipmentType,
        importShipmentTypeName: [...this.ImportShipmentTypelistAir,...this.ImportShipmentTypelist]?.find((x) => x.systemtypeId == this.newenquiryForm.value?.importShipmentType)?.typeName,

      },
      containersDetails: this.showContainer ? this.addContainerValue() || [] : [],
      transportDetails: {
        preCarriage: this.newenquiryForm.value.preCarriage,
        onCarriage: this.newenquiryForm.value.onCarriage,
        origin: this.newenquiryForm.value.preCarriage ? this.addTransportValue() : [],
        destination: this.newenquiryForm.value.onCarriage ? this.addTransport1Value() : []
      },
      productDetails: {
        cargoReadyDate: this.newenquiryForm.value.cargoReadyDate,
        targetDeliveryDate: this.newenquiryForm.value.targetDeliveryDate,
        biddingDueDate: this.newenquiryForm.value.biddingDueDate,
      },
      cargoDetail: this.commodityArray || [],
      routeDetails: {
        // loadPlace: this.newenquiryForm.value.load_place,
        // loadPlaceName: this.locationList.filter(x => x.locationId === this.newenquiryForm.value.load_place)[0]?.locationName,
        loadPlace: originID || '',
        loadPlaceName: originName || '',
        state: this.locationList.filter(x => x.locationId === this.newenquiryForm.value.load_place)[0]?.state,
        preCarriageId: this.newenquiryForm.value.pre_carriage || '',
        preCarriageName: this.preCarrigeList1.filter(x => x.locationId === this.newenquiryForm.value.pre_carriage)[0]?.name || '',
        loadPortId: this.newenquiryForm.value.load_port,
        loadPortName: this.portList1.filter(x => x.portId === this.newenquiryForm.value.load_port)[0]?.portName,
        voyageNumberforHop: this.newenquiryForm.value.voyageNumberforHop,
        plannedVesselforHopId: this.newenquiryForm.value.plannedVesselforHop,
        plannedVesselforHopName: this.vesselList.find(x => x?.vesselId === this.newenquiryForm.value.plannedVesselforHop)?.vesselName,
        // location: this.newenquiryForm.value.location,
        // locationName: this.locationList.filter(x => x.locationId === this.newenquiryForm.value.location)[0]?.locationName,
        location: destinationID || '',
        locationName: destinationName || '',
        destPortId: this.newenquiryForm.value.discharge_port,
        destPortName: this.portList2.filter(x => x.portId === this.newenquiryForm.value.discharge_port)[0]?.portName,
        onCarriageId: this.newenquiryForm.value.on_carriage || '',
        onCarriageName: this.preCarrigeList.filter(x => x.locationId === this.newenquiryForm.value.on_carriage)[0]?.name || '',
        fpodId: this.newenquiryForm.value.fpod || '',
        fpodName: this.locationList.filter(x => x.locationId === this.newenquiryForm.value.fpod)[0]?.locationName || '',
        haulageTypeId: this.newenquiryForm.value.haulageType,
        haulageTypeName: this.haulagetypeList.filter(x => x.systemtypeId === this.newenquiryForm.value.haulageType)[0]?.typeName,
        freeDaysTime : this.newenquiryForm?.value?.freeDaysTime || [],
        deliveryOfPlaceId: this.newenquiryForm.value.deliveryOfPlace,
        deliveryOfPlace: this.locationList.filter(x => x.locationId === this.newenquiryForm.value.deliveryOfPlace)[0]?.locationName,
        wagonNo: this.newenquiryForm.value.wagonNo || '',
        vehicleNo: this.newenquiryForm.value.vehicleNo || '',
        destHaulageId: this.newenquiryForm.value.destHaulage,
        destHaulage: this.locationList.filter(x => x.locationId === this.newenquiryForm.value.destHaulage)[0]?.locationName,
        freightTerms: this.newenquiryForm.value.freightTerms,
        transportOnCarriage: this.newenquiryForm.value.transportOnCarriage,
        transportPreCarriage: this.newenquiryForm.value.transportPreCarriage,
        freightTermsName: this.freightTermsList.filter(x => x.systemtypeId === this.newenquiryForm.value.freightTerms)[0]?.typeName || '',
        shippingLineId: this.newenquiryForm.value.shipping_line,
        shippingLineName: this.shippingLineList.filter(x => x.shippinglineId === this.newenquiryForm.value.shipping_line)[0]?.name,
        shippingLineValidFrom: this.newenquiryForm.value.shippingLineratevalidfrom_date || new Date(),
        shippingLineValidTo: this.newenquiryForm.value.shippingLineratevalidto_date || new Date(),
        shippingLineValid: this.shippingLineValid,
        tsPortId: this.newenquiryForm.value.ts_port,
        tsPortName: this.portList.filter(x => x.portId === this.newenquiryForm.value.ts_port)[0]?.portName,
        lineVoyageNo: this.newenquiryForm.value.linevoyageNo,
        destinationCustomClearance: this.newenquiryForm.value.destinationCustomClearance,
        originCustomClearance: this.newenquiryForm.value.originCustomClearance,
        etd: this.newenquiryForm.value.etd,
        eta: this.newenquiryForm.value.eta,
      },
      customDetails: {
        transportOrigin: this.newenquiryForm?.value.transportOrigin || false,
        transportDestination: this.newenquiryForm?.value.transportDestination || false,
        customOrigin: this.newenquiryForm?.value.customOrigin,
        customDestinationLocation: this.newenquiryForm?.value.customDestinationLocation,
        customDestinationLocationName: this.locationList.filter(x => x.locationId === this.newenquiryForm.value.customDestinationLocation)[0]?.locationName,
        customOriginLocationName: this.locationList.filter(x => x.locationId === this.newenquiryForm.value.customOriginLocation)[0]?.locationName,
        customOriginLocation: this.newenquiryForm?.value.customOriginLocation,
        customDestination: this.newenquiryForm?.value.customDestination,
        originOption: this.newenquiryForm?.value.originOption,
        destinationOption: this.newenquiryForm?.value.destinationOption,
        originfactory: this.newenquiryForm?.value.originfactory,
        destinationfactory: this.newenquiryForm?.value.destinationfactory,
        originPickupAddress: this.newenquiryForm?.value.originPickupAddress,
        destinationDeliveryAddress: this.newenquiryForm?.value.destinationDeliveryAddress,
      },
      detentionDetails: {
        polFreeDay: this.isAgentAdvise ? this.newenquiryForm.value.poldetentionereeDay.toString() : this.newenquiryForm.value.poldetentionereeDay,
        polDetentionAmount: this.isAgentAdvise ? this.newenquiryForm.value.poldetentionAmount.toString() : this.newenquiryForm.value.poldetentionAmount,
        polDetentionCurrencyId: this.newenquiryForm.value.poldetentioncurrency,
        polDetentionCurrencyName: this.currencyList.filter(x => x.currencyId === this.newenquiryForm.value.poldetentioncurrency)[0]?.currencyShortName,
        podFreeDay: this.isAgentAdvise ? this.newenquiryForm.value.pod_detentionfreeDay.toString() : this.newenquiryForm.value.pod_detentionfreeDay,
        podDetentionAmount: this.isAgentAdvise ? this.newenquiryForm.value.pod_detentionAmount.toString() : this.newenquiryForm.value.pod_detentionAmount,
        podDetentionCurrencyId: this.newenquiryForm.value.pod_detentioncurrency,
        podDetentionCurrencyName: this.currencyList.filter(x => x.currencyId === this.newenquiryForm.value.pod_detentioncurrency)[0]?.currencyShortName,
      },
      transhipmentHops: transporthubArray.value,
      grossWeightContainer: this.newenquiryForm.get('grossWeightContainer').value,
      backupShippingLine: this.newenquiryForm.get('backupShippingLine').value || '',
      backupShippingLineName: this.shippingLineList.filter(x => x.shippinglineId === this.newenquiryForm.value.backupShippingLine)[0]?.name || '',
      remarksList: [],
      remarks: this.remarksForm.value.remarks,
      enquiryStatusCustomer: 'Requested',
      enquiryStatus: pending ? 'Inquiry Draft' : (this.isAddMode || this.currentUrl === 'clone') ? 'Inquiry Created' : (this.agentAdviceDetails.enquiryStatus == 'Quotation Created') ? 'Quotation Created' : 'Inquiry Created',
      status: this.isAddMode ? true : this.agentAdviceDetails?.status,

      looseCargoDetails: this.showContainer ? {
        grossWeight : this.totalGrossWeight?.toString() || '0',
        grossVolume : this.totalVolume?.toString() || '0',
      } : {
        grossWeight : this.totalGrossWeight?.toString() || '0',
        grossVolume : this.totalVolume?.toString() || '0',
        ...this.empForm.value},
      carrierBookingStatus: this.isAddMode ? 'Pending' : (this.agentAdviceDetails?.carrierBookingStatus || 'Pending'),
      charges: this.isAddMode ? [] : this.agentAdviceDetails?.charges,
      estimate: this.isAddMode ? {} : this.agentAdviceDetails?.estimate,
      insurance: {
        cargo: this.newenquiryForm.value.cargo || false,
        emptyContainer: this.newenquiryForm.value.emptyContainer || false,
        palletization: this.newenquiryForm.value.palletization || false,
        fumigation: this.newenquiryForm.value.fumigation || false,
        warehousing: this.newenquiryForm.value.warehousing || false,
      }
    };
    if(this.newenquiryForm.value?.stuffing_location_Type){
      newAgentAdvice["stuffing_location"]=stuffing_location
    }



    if (this.currentUrl === 'clone') {

      if (!this.valueChange) {
        this.notification.create(
          'info',
          `Similar details already covered in the enquiry no ${this.agentAdviceDetails?.enquiryNo},
          Please make changes in the enquiry if you want to clone the same`,
          ''
        );
        return false
      }
      newAgentAdvice.cloneEnquiryNo = this.agentAdviceDetails?.enquiryNo;
      newAgentAdvice.cloneEnquiryId = this.agentAdviceDetails?.enquiryId;
      newAgentAdvice.enquiryId = "";
      if (this.agentAdviceDetails?.enquiryStatus === 'Job Created')
        newAgentAdvice.enquiryStatus = 'Inquiry Created'


      url = "enquiry";
    }


    if (this.isAddMode || this.currentUrl === 'clone') {
      if (!pending) {
        newAgentAdvice.basicDetails.enquiryDate = this.newenquiryForm.value.enquiry_date
      } else {
        newAgentAdvice.basicDetails.enquiryDate = '';
      }

      this.commonService.addToST(url, newAgentAdvice)?.subscribe((res: any) => {
        if (res) {
          if (this.remarksArray.length > 0) {
            this.saveRemarks(res?.enquiryId)
          }

          if (this.isTransport &&  res?.enquiryStatus === 'Inquiry Created' && res?.transportDetails?.origin[0]?.transpoterType === 'transporter') {
            this.sendToCarrier(res)
          }
          setTimeout(() => {
            let successMessage = '';
            if (this.currentUrl === 'clone') {
              successMessage = `Your inquiry for ${res.enquiryNo} number has been generated Successfully..!`;
            } else {
              successMessage = `Your inquiry for ${res.enquiryNo} number has been generated Successfully..!`;
            }
            this.notification.create('success', successMessage, '');
            this.CloseNew.emit(evt);
            this.router.navigate(["/enquiry/list"]);
          }, 1000);



        }
      }, error => {
        this.notification.create(
          'error',
         error?.error?.error?.message,
          ''
        );
      });
    } else {
      this.commonService.UpdateToST(url, newAgentAdvice)?.subscribe((res: any) => {
        if (res) {
          if (this.remarksArray.length > 0) {
            this.saveRemarks(res?.enquiryId)
          }
          if (this.isTransport &&  res?.enquiryStatus === 'Inquiry Created' && res?.transportDetails?.origin[0]?.transpoterType === 'transporter') {
            this.sendToCarrier(res)
          }
          setTimeout(() => {
            this.notification.create('success', `Your inquiry for ${res.enquiryNo} number has been Updated Successfully..!`, '');
            this.CloseNew.emit(evt);
            this.router.navigate(["/enquiry/list"]);

          }, 1000);
        }
      }, error => {
        this.notification.create(
          'error',
         error?.error?.error?.message,
          ''
        );
      });
    }


  }

  sendToCarrier(res) {
    const addTransportValue = this.addTransportValue()
    let lastPosition = addTransportValue?.length

    let batchInsert = []

    addTransportValue.filter((x, i) => {
      x.carrierList.filter((e, j) => {
        if (batchInsert.find(a => a.shippinglineId === e?.shippinglineId)) {
          const index = batchInsert.findIndex(item => item.shippinglineId === e?.shippinglineId);
          const destination = addTransportValue[i + 1] || addTransportValue[lastPosition - 1];

          // Ensure breakPoint is an array and push the destination value
          const breakPoint = batchInsert[index].breakPoint || [];
          breakPoint.push(batchInsert[index].destination);

          batchInsert[index] = {
            ...batchInsert[index],
            breakPoint: breakPoint,
            destination: destination
          };
        } else {
          batchInsert.push({
            ...e,
            breakPoint: [],
            origin: lastPosition > 2 ? addTransportValue[i] : addTransportValue[0],
            destination: lastPosition > 2 ? addTransportValue[i + 1] || addTransportValue[lastPosition - 1] : addTransportValue[lastPosition - 1],
            remark: '',
            rate: '',
            status: true,
            carrierStatus: 'Requested',
            adminStatus: 'Requested',
            enquiryId: res?.enquiryId,
            loadType: res?.basicDetails?.loadType,
            enquiryNo: res?.enquiryNo,
            biddingDueDate: res?.productDetails?.biddingDueDate || '',
            currency: {
              currencyName: '',
              currencyId: ''
            }
          })
        }
      })
    });

    const updatedArray = batchInsert?.map(({ _id, ...rest }) => rest);
    this.commonService.batchInsert('transportinquiry/batchinsert', updatedArray)?.subscribe();
  }
  draftPending1() {
    let cloneDfraft = false
    if (this.currentUrl === 'clone') {
      if (this.agentAdviceDetails?.enquiryStatus === 'Job Created')
        return true
    }

    if (cloneDfraft || this.newenquiryForm.invalid || this.freightChargedData.length === 0 || this.chargedData.length === 0 || this.remarksArray.length === 0) {
      return false
    }
    return true
  }
  onClose(evt) {
    this.CloseNew.emit(evt);
  }

  onOpen(content) {
    // Save the current scroll position
    this.saveScrollPosition();

    this.IsEditRemarks = -1;

    const modalRef = this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });

    // Restore the scroll position after opening the modal
    modalRef.result.finally(() => {
      this.restoreScrollPosition();
    });

    // Restore the scroll position immediately after opening the modal
    this.restoreScrollPosition();

    this.remarksForm.controls['fromUser'].setValue(this.userData.roleName);
  }

  saveScrollPosition() {
    this.currentScrollPosition = this.document.documentElement.scrollTop || this.document.body.scrollTop;
  }

  // Method to restore scroll position
  restoreScrollPosition() {
    this.renderer.setProperty(this.document.documentElement, 'scrollTop', this.currentScrollPosition);
    this.renderer.setProperty(this.document.body, 'scrollTop', this.currentScrollPosition);
  }

  onCommoidity(content) {
    this.saveScrollPosition();

    this.activeCommodity = '';
    this.openHaz = false;
    this.odc = false;
    this.refer = false;
    this.commodityForm.reset();
    this.IsEditCommodity = -1;
    this.msdDOC = '';

    const modalRef = this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });

    modalRef.result.finally(() => {
      this.restoreScrollPosition();
    });

    this.restoreScrollPosition();
  }

  setRequirdAddress(i){ 
    return
    // if(this.isTransport){
    const control = (<FormArray>this.newenquiryForm.controls['transport']).at(i)
    console.log(control.get('locationType').value ,'dfddd')
    if (control.get('address').value !== '') {
      control.get('address').setValidators(Validators.required);
      control.get('addressId').clearValidators()
      control.get('address').updateValueAndValidity()
      control.get('addressId').updateValueAndValidity()
    } else {
      control.get('addressId').setValidators(Validators.required);
      control.get('address').clearValidators()
      control.get('addressId').updateValueAndValidity()
      control.get('address').updateValueAndValidity()
    // }
  }
  }
  setRequirdAddress1(i){ 
    return
    if(this.isTransport){
    const control = (<FormArray>this.newenquiryForm.controls['transport1']).at(i)
    if (control.get('address').value !== '') {
      control.get('address').setValidators(Validators.required);
      control.get('addressId').clearValidators()
      control.get('address').updateValueAndValidity()
      control.get('addressId').updateValueAndValidity()
    } else {
      control.get('addressId').setValidators(Validators.required);
      control.get('address').clearValidators()
      control.get('addressId').updateValueAndValidity()
      control.get('address').updateValueAndValidity()
    }
  }
  }
  openImportAdvice(content) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }
  async addcommodity() {
    this.submitted1 = true

    this.submitted2 = true
    let checkCommodity = this.commodityArray?.filter(item => item.productId == this.commodityForm.value.product_id);
    if (this.commodityForm.invalid) {
      return false
    }
    if (this.IsEditCommodity < 0) {
      if (checkCommodity?.length > 0) {
        this.notification.create('info', 'Commodity already added', '');
        return false
      }
    } else {
      if (checkCommodity?.length > 1) {
        this.notification.create('info', 'Commodity already added', '');
        return false
      }
    }


    if (this.msdDOC) {
      const formData = new FormData();
      formData.append('file', this.msdDOC, this.msdDOC.name);
      formData.append('name', this.msdDOC.name);
      this.commonService.uploadDocuments('uploadfile', formData)?.subscribe();
      let payload = {
        Doc: this.msdDOC?.name,
        documentType: 'MSDS',
        documentName: this.msdDOC?.name,
        documentURL: this.msdDOC?.name,
        documentStatus: true
      }
      await this.commonService.addToST('document', payload).subscribe(() => { }, (error) => { this.notification.create('error',error?.error?.error?.message, ''); });
    }
    this.submitted1 = false
    this.submitted2 = false
    this.modalService.dismissAll();
    if (this.IsEditCommodity < 0) {

      let newRemark = {
        productId: this.commodityForm.value.product_id,
        productName: this.productList.filter(x => x.productId === this.commodityForm.value.product_id)[0]?.productName,
        properShippingName: this.commodityForm.value.proper_shipping_name,
        technicalName: this.commodityForm.value.technical_name,
        commodityType: this.commodityForm.value.commodityType,
        commodityTypeName: this.cargoTypeList.filter(x => x.systemtypeId === this.commodityForm.value.commodityType)[0]?.typeName,
        imcoClass: this.imcoList?.filter(x => x.systemtypeId === this.commodityForm.value.imco_class)[0]?.typeName,
        // imcoClassId: this.commodityForm.value.imco_class,
        li: this.commodityForm.value.li,
        Wi: this.commodityForm.value.Wi,
        hi: this.commodityForm.value.hi,
        di: this.commodityForm.value.di,
        Range: this.commodityForm.value.Range,
        To: this.commodityForm.value.To,
        typeTemp: this.commodityForm.value.typeTemp,
        unNo: this.commodityForm.value.un_no,
        hsCode: this.commodityForm.value.hsCode,
        msdsDoc: this.msdDOC.name,
        freightAt: this.commodityForm.value.freightAt,
        contractName: this.contractList?.filter(x => x.systemtypeId === this.commodityForm.value.contract)[0]?.typeName,
        contract: this.commodityForm.value.contract,
        packingGroup: this.commodityForm.value.packing_group,
        flashPoint: this.commodityForm.value.flashPoint,
        marinePollutionId: this.commodityForm.value.marine_pollution,
        unit: this.commodityForm.value.unit,
        unitName: this.uomData?.filter(x => x.uomId === this.commodityForm.value.unit)[0]?.uomShort || '',
        grossWeight: this.commodityForm.value.grossWeight,
        cargoReadyDate: this.commodityForm.value.cargoReadyDate,
        targetDeliveryDate: this.commodityForm.value.targetDeliveryDate,
        Density: this.commodityForm.value.Density

      }
      this.commodityArray?.push(newRemark)
      this.notification.create(
        'success',
        'Added Successfully',
        ''
      );
    }
    else {
      this.commodityArray?.forEach((element, i) => {
        if (i === this.IsEditCommodity) {
          this.commodityArray[i].productId = this.commodityForm.value.product_id;
          this.commodityArray[i].productName = this.productList.filter(x => x.productId === this.commodityForm.value.product_id)[0]?.productName,
            this.commodityArray[i].commodityType = this.commodityForm.value.commodityType;
          this.commodityArray[i].commodityTypeName = this.cargoTypeList.filter(x => x.systemtypeId === this.commodityForm.value.commodityType)[0]?.typeName.toLowerCase(),
            this.commodityArray[i].imcoClass = this.commodityForm.value.imco_class;
          this.commodityArray[i].imcoClass = this.imcoList.filter(x => x.systemtypeId === this.commodityForm.value.imco_class)[0]?.typeName,
            this.commodityArray[i].di = this.commodityForm.value.di;
          this.commodityArray[i].hi = this.commodityForm.value.hi || '';
          this.commodityArray[i].Wi = this.commodityForm.value.Wi || '';
          this.commodityArray[i].li = this.commodityForm.value.li || '';
          this.commodityArray[i].typeTemp = this.commodityForm.value.typeTemp || '';;
          this.commodityArray[i].Range = this.commodityForm.value.Range || '';;
          this.commodityArray[i].To = this.commodityForm.value.To || '';
          this.commodityArray[i].unNo = this.commodityForm.value.un_no || '';
          this.commodityArray[i].unit = this.commodityForm.value.unit;
          this.commodityArray[i].unitName = this.uomData?.filter(x => x.uomId === this.commodityForm.value.unit)[0]?.uomShort || '',

            this.commodityArray[i].hsCode = this.commodityForm.value.hsCode;
          this.commodityArray[i].grossWeight = this.commodityForm.value.grossWeight;
          this.commodityArray[i].msdsDoc = this.msdDOC ? this.msdDOC.name : element.msdsDoc;
          this.commodityArray[i].marinePollutionId = this.commodityForm.value.marine_pollution;
        }
      });
      this.notification.create(
        'success',
        'Updated Successfully',
        ''
      );
    }
    this.commodityForm.reset()
    this.msdDOC = ''

  }

  addRemarks() {
    this.modalService.dismissAll();
    if (this.IsEditRemarks < 0) {
      this.newRemark = {

        "tenantId": this.userData.tenantId,
        "prospectId": "",
        "commentsby": this.userData?.roleName,
        "commentText": this.remarksForm.controls.remarks.value,
        "instructionsFrom": this.userData?.roleName,
        "instructionsToId": this.remarksForm.controls.toUser.value,
        "instructionsTo": this.userList.filter(x => x.userId === this.remarksForm.controls.toUser.value)[0]?.name,
        "instructionsToEmail": this.userList.filter(x => x.userId === this.remarksForm.controls.toUser.value)[0]?.userEmail,
        "instructionsDescription": this.remarksForm.controls.remarks.value,
        "commentDate": this.currentDate,
        "contractId": "",
        "commentId": "",
        "clauseId": "",
        "batchId": "",
        "enquiryId": "",
        "processPoint": this.remarksForm.controls.processPoint.value,
        "processPointName": this.processPointList.filter(x => x.systemtypeId === this.remarksForm.controls.processPoint.value)[0]?.typeName,
        "departmentId": this.remarksForm.controls.department.value,
        "departmentName": this.departmentList.filter(x => x.departmentId === this.remarksForm.controls.department.value)[0]?.deptName,
        "branchHead": '',
        "reply:": [
          {
            "commentsBy": "",
            "commentText": "",
            "commentDate": "",
          }
        ],
        "remarkStatusId": this.remarksForm.value.status,
        "remarkStatusName": this.statusList.filter(x => x.systemtypeId === this.remarksForm.value.status)[0]?.typeName,
        "status": "true"
      }
      this.remarksArray.push(this.newRemark)
      this.notification.create(
        'success',
        'Added Successfully',
        ''
      );
    }
    else {
      for (var i = 0; i < this.remarksArray.length; i++) {
        if (i === this.IsEditRemarks) {
          this.remarksArray[i].processPoint = this.remarksForm.value.processPoint;
          this.remarksArray[i].processPointName = this.processPointList.filter(x => x.systemtypeId === this.remarksForm.value.processPoint)[0]?.typeName;
          this.remarksArray[i].commentDate = this.remarksForm.value.date;
          this.remarksArray[i].instructionsToId = this.remarksForm.value.toUser;
          this.remarksArray[i].instructionsTo = this.userList.filter(x => x.userId === this.remarksForm.controls.toUser.value)[0]?.name;
          this.remarksArray[i].instructionsToEmail = this.userList.filter(x => x.partymasterId === this.remarksForm.value.toUser)[0]?.userEmail;
          this.remarksArray[i].remarkStatusId = this.remarksForm.value.status;
          this.remarksArray[i].remarkStatusName = this.statusList.filter(x => x.systemtypeId === this.remarksForm.value.status)[0]?.typeName;
          this.remarksArray[i].commentText = this.remarksForm.value.remarks;
          this.remarksArray[i].departmentId = this.remarksForm.controls.department.value;
          this.remarksArray[i].departmentName = this.departmentList.filter(x => x.departmentId === this.remarksForm.controls.department.value)[0]?.deptName;

        }
      }
      this.notification.create(
        'success',
        'Updated Successfully',
        ''
      );
    }
    this.remarksForm.reset()
    this.newRemark = {}


  }

  closePopup() {
    this.saveScrollPosition();
    this.modalService.dismissAll();
    this.restoreScrollPosition();
  }
  onCancel() {
    this.router.navigate(["/enquiry/list"]);
  }

  deleteCommodity(remark, content1) {
    this.modalService.open(content1, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'md',
      ariaLabelledBy: 'modal-basic-title'
    }).result.then((result) => {

      if (result === 'yes') {
        this.commodityArray = this.commodityArray?.filter(item => item.productId !== remark.productId);
      }
    });
  }
  removeRow(remark, content1, index) {
    this.modalService.open(content1, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'md',
      ariaLabelledBy: 'modal-basic-title'
    }).result.then((result) => {

      if (result === 'yes') {
        let payload = [
          {
            commentId: remark?.commentId,
            searchKey: 'commentId',
          },
        ];
        if (remark?.commentId) {
          this.apiSharedService.deleteComment(payload)?.subscribe((res: any) => {
            if (res) {
              this.remarksArray.splice(index, 1);
            }
          });
        } else {
          this.remarksArray.splice(index, 1);
        }
      }
    });
  }

  editCommodity(commodity, content, index) {
    this.openHaz = false
    this.odc = false;
    this.refer = false;
    this.msdDOC = ''
    this.commodityForm.reset()
    this.IsEditCommodity = index;
    this.activeCommodity = commodity
    this.commodityForm.patchValue({

      product_id: commodity.productId,
      commodityType: commodity.commodityType,
      imco_class: commodity.imcoClass,
      li: commodity.li,
      Wi: commodity.Wi,
      hi: commodity.hi,
      di: commodity.di,
      To: commodity.To,
      Range: commodity.Range,
      typeTemp: commodity.typeTemp,
      un_no: commodity.unNo,
      hsCode: commodity.hsCode,
      unit: commodity.unit,
      msdsDoc: commodity.msdsDoc,
      grossWeight: commodity.grossWeight,
      marine_pollution: commodity.marinePollutionId,
    });
    if (commodity.commodityTypeName.toLowerCase() == 'haz') {
      this.openHaz = true
    } else {
      this.openHaz = false
    }
    if (commodity.commodityTypeName.toLowerCase() == 'refer') {
      this.refer = true
    } else {
      this.refer = false
    } if (commodity.commodityTypeName.toLowerCase() == 'odc') {
      this.odc = true
    } else {
      this.odc = false
    }

    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }

  editRow(remark, content, index) {
    this.IsEditRemarks = index;
    this.remarksForm.patchValue({
      processPoint: remark?.processPoint,
      date: remark?.commentDate,
      fromUser: this.userData.roleName,
      department: remark?.departmentId,
      toUser: remark?.instructionsToId,
      status: remark?.remarkStatusId,
      remarks: remark?.commentText
    });

    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }



  ngOnDestroy() {

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  productData() {
    if (!this.commodityForm.value.product_id) {
      return false
    }
    this.productShippingName = this.productList.filter(x => x.productId === this.commodityForm.value.product_id)[0]?.psn;
    this.IMCOClass = this.productList.filter(x => x.productId === this.commodityForm.value.product_id)[0]?.imcoClass;
    this.VesselUNNo = this.productList.filter(x => x.productId === this.commodityForm.value.product_id)[0]?.unNumber;
    this.PackingGroup = this.productList.filter(x => x.productId === this.commodityForm.value.product_id)[0]?.packingGroupName;
    this.Density = this.productList.filter(x => x.productId === this.commodityForm.value.product_id)[0]?.densityGravity;
    this.Flash_point = this.productList.filter(x => x.productId === this.commodityForm.value.product_id)[0]?.flashPoint;
    this.marinePollution = this.productList.filter(x => x.productId === this.commodityForm.value.product_id)[0]?.marinePollution;
    this.hsCode = this.productList.filter(x => x.productId === this.commodityForm.value.product_id)[0]?.hsCode;
    // this.msdsDoc = this.productList.filter(x => x.productId === this.commodityForm.value.product_id)[0]?.documents[0]?.docname || '';
    this.msdsDocURL = this.productList.filter(x => x.productId === this.commodityForm.value.product_id)[0]?.documents[0]?.docurl || '';
    this.commodityType = this.productList.find(x => x.productId === this.commodityForm.value.product_id)?.productType;
    const cargoType = this.cargoTypeList?.find(i => i?.typeName?.toLowerCase() === this.commodityType?.toLowerCase());
    this.commodityForm.controls.marine_pollution.setValue(this.marinePollution ? 'Yes' : 'No')
    this.commodityForm.controls.proper_shipping_name.setValue(this.productShippingName)
    this.commodityForm.controls.imco_class.setValue(this.IMCOClass)
    this.commodityForm.controls.un_no.setValue(this.VesselUNNo)
    this.commodityForm.controls.hsCode.setValue(this.hsCode)
    this.commodityForm.controls.commodityType.setValue(cargoType?.systemtypeId ?? '')
    this.commodityForm.controls.packing_group.setValue(this.PackingGroup)
    this.commodityForm.controls.flashPoint.setValue(this.Flash_point)
    this.commodityForm.controls.Density.setValue(this.Density)
    // this.commodityForm.controls.msdsDoc.setValue(this.msdsDoc)
    this.changeCommodity()

  }
  BookingdownloadFile() {
    if (this.newenquiryForm.value.msdsDoc === '') {
      return false
    }
    this.commonService.DocumentPreview(this.msdsDocURL, "Product")
  }
  get transport(): FormArray {
    return this.newenquiryForm.get('transport') as FormArray;
  }
  get transhipmentHops(): FormArray {
    return this.newenquiryForm.get('transhipmentHops') as FormArray;
  }
  loadportchange(e?) {
    const lastFormGroup = this.transport.at(this.transport.length - 1) as FormGroup;
    if (lastFormGroup)
      lastFormGroup.patchValue({
        location: this.newenquiryForm.value.load_port
      });
    // this.preCarrigeList1 = this.ICDlocationList.filter(x => x.portId === this.newenquiryForm.value.load_port)
    // if (this.isAddMode && e) {
    //   this.newenquiryForm.controls.pre_carriage.setValue('')
    // }
    // return
    // this.preCarrigeList1 = this.ICDlocationList.filter(x => x.country?.toLowerCase() === 'india')
    // if (this.isAddMode && e) {
    //   this.newenquiryForm.controls.pre_carriage.setValue('')
    // }
  }
  get transport1(): FormArray {
    return this.newenquiryForm.get('transport1') as FormArray;
  }
  desPortchange(e?) {
    const firstFormGroup = this.transport1.at(0) as FormGroup;
    if (firstFormGroup)
      firstFormGroup.patchValue({
        location: this.newenquiryForm.value.discharge_port
      });
    // this.preCarrigeList = this.ICDlocationList.filter(x => x.portId === this.newenquiryForm.value.discharge_port)
    // if (this.isAddMode && e) {
    //   this.newenquiryForm.controls.on_carriage.setValue('')
    // }
  }

  setShipper(e) {
    if (!e) { return false }
    let data = this.shipperList.filter((x) => x?.partymasterId === e)[0];
    if (data) {
      this.billingBranchList = data?.branch
      this.newenquiryForm.get('ops_coordinator').setValue(data?.opsName || '')
      this.newenquiryForm.get('sales_person').setValue(data?.saleName || '')
    }
  }
  billingBranchList1:any= []
  setShipper1(e) {
    if (!e) { return false }
    let data = this.consigneeList.filter((x) => x?.partymasterId === e)[0];
    if (data) {
      this.billingBranchList1 = data?.branch 
    }
  }

  setAddress0(from,target){
    let address = (this.billingBranchList??[])?.find((x) => x?.branch_name === this.f[from].value)
   if(address){
    this.newenquiryForm.get(target).setValue(address?.branch_address);
   }
  }
  setEnquiry(e) {
    return
    if (!e) { return false }
    let data = this.enquirytypeList.filter((x) => x.systemtypeId === e)[0]?.typeName?.toLowerCase();
    data = data?.replace(/\s+/g, '');
    if (data === 'exportloaded') {
      this.newenquiryForm.get('shipment_term').setValue('Loaded')
    } else {
      this.newenquiryForm.get('shipment_term').setValue('Empty')
    }

    if (data === 'exportempty-clean' || data === 'exportempty-dirty' || data === 'emptyrepo') {
      let shipper;
      // this.shipperList.filter((x) => x?.name?.toLowerCase() === 'jmb')[0];
      this.disableShipper = true;
      this.newenquiryForm.get('shipper').patchValue(shipper?.partymasterId)

      if (shipper?.opsName) {

        this.disableOPS = true;
        this.newenquiryForm.get('ops_coordinator').patchValue(shipper?.opsName)
      }
      if (shipper?.saleName) {
        this.disableSale = true;
        this.newenquiryForm.get('sales_person').patchValue(shipper?.saleName)
      }
      if (data === 'emptyrepo') { this.clearBascDetails() }
    } else {
      this.disableSale = false;
      this.disableOPS = false;
      this.disableShipper = false;
    }

  }
  clearBascDetails() {
    this.newenquiryForm.patchValue({
      stcQutation: '',
      booking_party: '',
      incoicing_party: '',
      forworder: '',
      inco_term: '',
      cosignee: '',
      shippping_term: '',
      move_type: '',
      tank_type: '',
      tankStatus: '',
      enquiryvalidform_date: '',
      enquiryvalidto_date: '',
    })
  }
  setFPOD() {
    let setFPOD = this.shippingtermList.filter((x) => x?.systemtypeId === this.newenquiryForm.get('shippping_term').value)[0]?.typeName?.toLowerCase()
    if (setFPOD === 'door to door' || setFPOD === 'pier to door') {
      // this.newenquiryForm.get('fpod').setValidators([Validators.required]);
      // this.newenquiryForm.get('fpod').updateValueAndValidity();
    } else {
      // this.newenquiryForm.get('fpod').setValidators([]);
      // this.newenquiryForm.get('fpod').updateValueAndValidity();
    }
  }
  setHaulage() {
    if (this.newenquiryForm.get('pre_carriage').value) {
      // this.newenquiryForm.get('haulageType').setValidators([Validators.required]);
      this.newenquiryForm.get('haulageType').updateValueAndValidity();
    } else {
      this.newenquiryForm.get('haulageType').setValidators([]);
      this.newenquiryForm.get('haulageType').updateValueAndValidity();
    }
  }
  saveRemarks(id) {
    let payload = []
    let payloadUpdate = []
    this.remarksArray.filter((x, index) => {
      if (this.currentUrl === 'clone') {
        payload.push({ ...x, enquiryId: id, commentId: '' })
        delete payload[index]._id
      } else {
        if (x?.enquiryId) {
          payloadUpdate.push({ ...x })
        } else {
          payload.push({ ...x, enquiryId: id })
        }
      }
    })
    if (payload.length > 0)
      this.commonService.batchInsert('comment/batchinsert', payload)?.subscribe();
    if (payloadUpdate.length > 0)
      this.commonService.batchUpdate('comment/batchupdate', payloadUpdate)?.subscribe();
  }
  openHaz: boolean;
  odc: boolean;
  refer: boolean;
  changeCommodity() {

    let data = this.cargoTypeList.filter(x => x.systemtypeId === this.commodityForm.value.commodityType)[0]?.typeName || ''
    if (data.toLowerCase() == 'haz') {
      this.commodityForm.controls['msdsDoc'].setValidators(Validators.required)
      this.commodityForm.controls['msdsDoc'].updateValueAndValidity()
      this.openHaz = true
    } else {
      this.openHaz = false;
      this.commodityForm.controls['msdsDoc'].clearValidators()
      this.commodityForm.controls['msdsDoc'].updateValueAndValidity()
    }

    if (data.toLowerCase() == 'odc') {
      this.commodityForm.controls['li'].setValidators(Validators.required)
      this.commodityForm.controls['li'].updateValueAndValidity()
      this.commodityForm.controls['Wi'].setValidators(Validators.required)
      this.commodityForm.controls['Wi'].updateValueAndValidity()
      this.commodityForm.controls['hi'].setValidators(Validators.required)
      this.commodityForm.controls['hi'].updateValueAndValidity()
      this.commodityForm.controls['di'].addValidators(Validators.required)
      this.commodityForm.controls['di'].updateValueAndValidity();


      this.odc = true
    } else {
      this.odc = false
      this.commodityForm.controls['li'].clearValidators()
      this.commodityForm.controls['li'].updateValueAndValidity()
      this.commodityForm.controls['Wi'].clearValidators()
      this.commodityForm.controls['Wi'].updateValueAndValidity()
      this.commodityForm.controls['hi'].clearValidators()
      this.commodityForm.controls['hi'].updateValueAndValidity()
      this.commodityForm.controls['di'].clearValidators()
      this.commodityForm.controls['di'].updateValueAndValidity()
    }

    if (data.toLowerCase() == 'refer') {
      this.commodityForm.controls['Range'].setValidators(Validators.required)
      this.commodityForm.controls['Range'].updateValueAndValidity()
      this.commodityForm.controls['To'].setValidators(Validators.required)
      this.commodityForm.controls['To'].updateValueAndValidity()
      this.commodityForm.controls['typeTemp'].setValue('C');
      this.commodityForm.controls['typeTemp'].setValidators(Validators.required)
      this.commodityForm.controls['typeTemp'].updateValueAndValidity()
      this.refer = true
    } else {
      this.refer = false
      this.commodityForm.controls['Range'].clearValidators()
      this.commodityForm.controls['Range'].updateValueAndValidity()
      this.commodityForm.controls['To'].clearValidators()
      this.commodityForm.controls['To'].updateValueAndValidity()
      this.commodityForm.controls['typeTemp'].clearValidators()
      this.commodityForm.controls['typeTemp'].updateValueAndValidity()
    }
    if (this.uomData?.find(rr => rr?.uomShort === 'KG')?.uomId) this.commodityForm.controls['unit'].setValue(this.uomData.find(rr => rr?.uomShort === 'KG')?.uomId);
  }
  msdDOC: any;
  filechange(event: any) {

    this.msdDOC = '';
    this.msdDOC = event.target.files[0];
    this.commodityForm.get('msdsDoc').setValue(event.target.files[0]);
  }

  downloadFile(documentURL) {
    this.commonService.downloadDocuments('downloadfile', documentURL)?.subscribe(
      (fileData: Blob) => {
        this.commonService.downloadDocumentsFile(fileData, documentURL);
      },
      (error) => {
        console.error(error);
      }
    );
  }

  getVesselList() {
    let payload = this.commonService.filterList();
    if(payload?.query)payload.query = {};

    this.commonService.getSTList('vessel', payload)?.subscribe((res: any) => {
        this.vesselList = res.documents;

        const vesselNames = this.vesselList.map(vessel => vessel.vesselName);

    });
}



addTranshipmentHop(item?): void {
  const row = this.formBuilder.group({
    load_port: [item ? item.load_port : ''],
    etd: [item ? item.etd : ''],
    eta: [item ? item.eta : ''],
    plannedVessel: [item ? item.plannedVessel : ''],
    voyageNumber: [item ? item.voyageNumber : ''],
  });
  (this.newenquiryForm.get('transhipmentHops') as FormArray).push(row); 
}



removeTranshipmentHop(index: number): void {
  (this.newenquiryForm.get('transhipmentHops') as FormArray).removeAt(index);
}
  getTransportControls(): AbstractControl[] {
    return (this.newenquiryForm.get('transport') as FormArray).controls;
  }
  getTransportHubControls(): AbstractControl[] {
    return (this.newenquiryForm.get('transhipmentHops') as FormArray).controls;
  }
  getTransport1Controls(): AbstractControl[] {
    return (this.newenquiryForm.get('transport1') as FormArray).controls;
  }
  getContainerControls(): AbstractControl[] {
    return (this.newenquiryForm.get('container') as FormArray).controls;
  }

  addTransportRow(item?: any, i?: any): void {
    const row = this.formBuilder.group({
      locationType: [item ? item.locationType : 'location'],
      location: [item ? item.location : '', ''],
      etd: [item ? item.etd : ''],
      eta: [item ? item.eta : ''],
      address: [item ? item.address : ''],
      addressId: [item ? item.addressId : ''],
      transit: [item ? item.transit : ''],
      carrier: [item ? item.carrier : ''],
      branch: [item ? item.branch : ''],
      carrierList: [item ? item?.carrierList || [] : []],
      transpoterType: [item ? item?.transpoterType || 'transporter' : 'transporter'],

    });



    if (item) {
      (this.newenquiryForm.get('transport') as FormArray).push(row); 
     
    } else {
      this.addRowToSecondLastPosition(row)
    }
    if(this.isTransport){
      this.setValidationFromArray()
    }
 
    
  }

  addTransport1Row(item?: any, i?: any): void {
    const row = this.formBuilder.group({
      locationType: [item ? item.locationType : 'location'],
      location: [item ? item.location : ''],
      etd: [item ? item.etd : ''],
      eta: [item ? item.eta : ''],
      address: [item ? item.address : ''],
      addressId: [item ? item.addressId : ''],
      transit: [item ? item.transit : ''],
      carrier: [item ? item.carrier : ''],
    });

    if (item) {
      (this.newenquiryForm.get('transport1') as FormArray).push(row); 
    } else {
      this.addRowToSecondLastPosition1(row)
    }

  }

  addRowToSecondLastPosition(row: FormGroup) {
    const transportArray = this.newenquiryForm.get('transport') as FormArray;
    const secondLastIndex = transportArray.length - 1;

    if (secondLastIndex >= 0) {
      transportArray.insert(secondLastIndex, row);
    } else {
      transportArray.insert(0, row);
    }
  }
  addRowToSecondLastPosition1(row: FormGroup) {
    const transportArray = this.newenquiryForm.get('transport1') as FormArray;
    const secondLastIndex = transportArray.length - 1;

    if (secondLastIndex >= 0) {
      transportArray.insert(secondLastIndex, row);
    } else {
      transportArray.insert(0, row);
    }
  }
  deleteTransportRow(index: number): void {
    (this.newenquiryForm.get('transport') as FormArray).removeAt(index);
  }
  deleteTransportRow1(index: number): void {
    (this.newenquiryForm.get('transport1') as FormArray).removeAt(index);
  }
  addContainerRow(item?: any): void {
    const row = this.formBuilder.group({
      wagonType: [item ? item.wagonType : null],
      truckType: [item ? item.truckType : null],
      containerType: [item ? item.containerType : null],
      uldcontainerType: [item ? item.uldcontainerType : null],
      noOfContainer: [item ? item.noOfContainer : 1],
      grossWeightContainer: [item ? item.grossWeightContainer : null],
      unit: [item ? item.unit : '']
    });

    (this.newenquiryForm.get('container') as FormArray).push(row);
  }
  deleteRow(index: number): void {
    (this.newenquiryForm.get('container') as FormArray).removeAt(index);
  }
  setValidationFromArray() {  
    this.transport.controls.forEach((control: FormGroup, index) => {
      return
      if (this.newenquiryForm.value.preCarriage) {
        if (index + 1 < this.transport.controls?.length) {
          control.get('etd').setValidators(Validators.required);
          if (this.isTransport) {
            control.get('branch').setValidators(Validators.required); 
              if(control.get('transpoterType').value === 'transporter'){
                control.get('carrierList').setValidators(Validators.required);
              } else{
                control.get('carrierList').clearValidators();
              }
          } else {
            control.get('transit').setValidators(Validators.required);
            control.get('carrier').setValidators(Validators.required);
          }

        }
        if (index !== 0) {
          control.get('eta').setValidators(Validators.required);
          control.get('carrierList').clearValidators();
        }
        if (control.get('locationType').value == 'address' || this.isTransport) {
          if(control.get('address').value === ''){ control.get('addressId').setValidators(Validators.required);} 
        } else {
          control.get('location').setValidators(Validators.required);
        }

      } else {
        control.get('location').clearValidators();
        control.get('addressId').clearValidators();
        control.get('eta').clearValidators();
        control.get('etd').clearValidators();
        control.get('transit').clearValidators();
        control.get('carrier').clearValidators();
        control.get('branch').clearValidators();
        control.get('carrierList').clearValidators();
      }
      control.get('location').updateValueAndValidity();
      control.get('addressId').updateValueAndValidity();
      control.get('eta').updateValueAndValidity();
      control.get('etd').updateValueAndValidity();
      control.get('transit').updateValueAndValidity();
      control.get('carrier').updateValueAndValidity();
      control.get('carrierList').updateValueAndValidity();
      control.get('branch').updateValueAndValidity();
    });
    this.transport1.controls.forEach((control: FormGroup, index) => {
      return
      if (this.newenquiryForm.value.onCarriage) {
        if (index + 1 !== this.transport1.controls?.length) {
          control.get('etd').setValidators(Validators.required);
          control.get('transit').setValidators(Validators.required);
          control.get('carrier').setValidators(Validators.required);
        }
        if (index !== 0) {

          control.get('eta').setValidators(Validators.required);
        }
        if (control.get('locationType').value == 'address') {
          if(control.get('address').value === ''){ control.get('addressId').setValidators(Validators.required);} 
        } else {
          control.get('location').setValidators(Validators.required);
        }

      } else {
        control.get('location').clearValidators();
        control.get('addressId').clearValidators();
        control.get('eta').clearValidators();
        control.get('etd').clearValidators();
        control.get('transit').clearValidators();
        control.get('carrier').clearValidators();
      }
      control.get('location').updateValueAndValidity();
      control.get('addressId').updateValueAndValidity();
      control.get('eta').updateValueAndValidity();
      control.get('etd').updateValueAndValidity();
      control.get('transit').updateValueAndValidity();
      control.get('carrier').updateValueAndValidity();
    });

    if (!this.isTransport) {
      this.transport.at(this.transport?.controls?.length - 1).get('location').setValue(this.newenquiryForm.value.load_port || '')
      this.transport.at(this.transport?.controls?.length - 1).get('locationType').setValue('port')
      this.transport1.at(0).get('location').setValue(this.newenquiryForm.value.discharge_port || '')
      this.transport1.at(0).get('locationType').setValue('port')
    }
  }


  addTransportValue() {
    const transportArray = [];
    this.getTransportControls().forEach((element,index) => {
      if(this.isTransport){
        if(index === 0){
          var selectedBranch = this.billingBranchList?.find((x) => x.branch_name === element.value.address);
        }else{
          var selectedBranch = this.billingBranchList1?.find((x) => x.branch_name === element.value.address);
        }
       
      }else{
        var selectedBranch = this.billingBranchList?.find((x) => x.branch_name === element.value.address);
      }
     

      let transport = {
        locationType: element.value.locationType || 'location',
        location: element.value.location || '',
        locationName: element.value.locationType === 'location' ? this.locationList?.filter((x) => x.locationId == element.value.location)[0]?.locationName || '' :
          this.portList1?.filter((x) => x.portId == element.value.location)[0]?.portName || '',
        etd: element.value.etd || '',
        eta: element.value.eta || '',
        address: element.value.address || '',
        addressText: selectedBranch ? `${selectedBranch.branch_address},${selectedBranch.branch_city}` : '',
        addressId: element.value.addressId || '',
        branch: element.value.branch || '',
        transit: element.value.transit || '',
        carrier: element.value.carrier || '',
        carrierList:  element.value.transpoterType === 'transporter' ? element.value.carrierList || [] : [],
        transpoterType : element.value.transpoterType || 'transporter',
        carrierName: this.shippingLineList.filter(x => x.shippinglineId === element.value.carrier)[0]?.name,
      }
      transportArray.push(transport)
    });
    return transportArray;
  }
  addTransport1Value() {
    const transportArray = [];
    this.getTransport1Controls().forEach(element => {
      const selectedBranch = this.billingBranchList?.find((x) => x.branch_name === element.value.address);

      let transport = {
        locationType: element.value.locationType || 'location',
        location: element.value.location || '',
        locationName: element.value.locationType === 'location' ? this.locationList?.filter((x) => x.locationId == element.value.location)[0]?.locationName || '' :
          this.portList2?.filter((x) => x.portId == element.value.location)[0]?.portName || '',
        etd: element.value.etd || '',
        eta: element.value.eta || '',
        address: element.value.address || '',
        addressText: selectedBranch ? `${selectedBranch.branch_address},${selectedBranch.branch_city}` : '',
        addressId: element.value.addressId || '',
        transit: element.value.transit || '',
        carrier: element.value.carrier || '',
        carrierName: this.shippingLineList.filter(x => x.shippinglineId === element.value.carrier)[0]?.name,
      }
      transportArray.push(transport)
    });
    return transportArray;
  }
  addContainerValue() {
    const containerArray = [];
    this.getContainerControls().forEach(element => {
      let container = {
        typeOfWay: this.typeOfWay || '',
        truckType: element.value.truckType || '',
        wagonType: element.value.wagonType || '',
        containerType: element.value.containerType || '',
        uldcontainerType: element.value.uldcontainerType || '',
        noOfContainer: element.value.noOfContainer || '',
        grossWeightContainer: element.value.grossWeightContainer || '',
        unit: element.value.unit || '',
        unitName: this.uomData.filter(x => x.uomId === element.value.unit)[0]?.uomShort || '',
      }
      containerArray.push(container)
    });
    return containerArray;
  }

  getChargecontainerLength(): number {
    return (this.newenquiryForm.get('container') as FormArray).length;
  }


  getChargeControls() {
    return (this.newenquiryForm.get('charge') as FormArray).controls;
  }

  getChargeControlsLength(): number {
    return (this.newenquiryForm.get('charge') as FormArray).length;
  }




  cargos(): FormArray {
    return this.empForm.get('cargos') as FormArray;
  }

  newCargo(): FormGroup {
    return this.formBuilder.group({ 
      pkgname: ['Pallets'],
      units: [''],
      // Pallettype: ['Pallets (non specified size)'],
      Pallettype: [''],
      lengthp: [''],    
      Weightp: [''],     
      weightpsCalculatedother: [''],  
      heightselected: [''],
      selectedh: ['CM'],
      Weightselected: [''],
      selectedw: ['KG'],
      volumeselect: [''],
      volumebselecteds: ['CBM'],

    });
  }

  addLooseCargo() {
    this.cargos()?.push(this.newCargo());
  }

  removeLooseCargo(empIndex: number) {
    this.cargos().removeAt(empIndex);
  }

  radioButtonChange(data, empIndex) {
    return
    const palletValidators = [Validators.required, Validators.min(1), Validators.max(9999)];
    const cargosArray = this.empForm.get('cargos') as FormArray;
    const cargo = cargosArray.at(empIndex) as FormGroup; 

      cargo.get('lengthp').setValidators(palletValidators);
      cargo.get('Weightp').setValidators(palletValidators); 
      cargo.get('heightselected').setValidators(palletValidators); 
      cargo.get('Weightselected').setValidators([Validators.required, Validators.min(1)]);  
     
     
    cargo.get('lengthp').updateValueAndValidity();
    cargo.get('Weightp').updateValueAndValidity(); 
    cargo.get('Weightselected').updateValueAndValidity();
    cargo.get('heightselected').updateValueAndValidity();
}

  lengthandwidthShow: boolean = true
  setDimensions(event, empIndex) {
    const cargosArray = this.empForm.get('cargos') as FormArray;
    const cargo = cargosArray.at(empIndex) as FormGroup;
    const regex = /\b\d+\b/g;
    const matches = event.match(regex);
    const data = matches ? matches.map(Number) : []
    if (event === 'Pallets (non specified size)') {
      this.lengthandwidthShow = true
      cargo.get('lengthp').setValue(0)
      cargo.get('Weightp').setValue(0)  
    } else {
      this.lengthandwidthShow = false
      cargo.get('lengthp').setValue(data[0])
      cargo.get('Weightp').setValue(data[1])  
    }
  }



  selectTotalVolum(event, empIndex) {
    const cargosArray = this.empForm.get('cargos') as FormArray;
    const cargo = cargosArray.at(empIndex) as FormGroup;
    const length = cargo?.get('lengthp')?.value;
    const width = cargo?.get('Weightp')?.value
    const height = cargo?.get('heightselected')?.value 
    const selectedHeight = cargo?.get('selectedh')?.value?.toLowerCase(); 
    let units = 0; 
    switch (selectedHeight) {
      case "inches":
        units = ((length ?? 0) * (width ?? 0) * (height ?? 0)) / 61023.8;
        break;
      case "CM":
        units = ((length ?? 0) * (width ?? 0) * (height ?? 0)) / 1000000;
        break;
      case "IN":
        units = ((length ?? 0) * (width ?? 0) * (height ?? 0)) * 0.000016387064;
        break;
      case "cm":
        units = ((length ?? 0) * (width ?? 0) * (height ?? 0)) / 1000000;
        break;
      case "meter":
        units = ((length ?? 0) * (width ?? 0) * (height ?? 0));
        break;
      case "millimetre":
      case "mm":
        units = ((length ?? 0) * (width ?? 0) * (height ?? 0)) / 1000000000;
        break;
      case "ft":
        units = ((length ?? 0) * (width ?? 0) * (height ?? 0)) / 35.315;
        break;
      default:
        units = 0;
    }

  
    const roundedUnits = parseFloat(units.toFixed(2));
    const totalUnits = roundedUnits * (cargo?.get('units')?.value ?? 0); 
    cargo.controls['volumeselect'].setValue(totalUnits);
    this.calculateAll()
  }
  
  grossWeightselect(event, empIndex) {
    let units = 0;
    const cargosArray = this.empForm.get('cargos') as FormArray;
    const cargo = cargosArray.at(empIndex) as FormGroup;
    const selectedHeight = cargo?.get('selectedw')?.value?.toLowerCase() || 'kg';
    switch (selectedHeight) {
      case "kg":
      case "KG":
        units = ((cargo?.get('Weightselected')?.value ?? 0));
        break;
      case "LB":
      case "lb":
        units = ((cargo?.get('Weightselected')?.value ?? 0) * 0.4536) / 1000;
        break;
      default:
        units = 0;
    }
  
    const roundedUnits = parseFloat((cargo?.get('Weightselected')?.value ?? 0));
    const totalUnits = roundedUnits * (cargo?.get('units')?.value ?? 0);
    cargo.controls['weightpsCalculatedother'].setValue(totalUnits);
    this.calculateAll()
  }
totalVolume : any = 0;
totalGrossWeight : any = 0
totalPieces : any = 0
calculateAll(){ 
this.totalVolume = 0;
this.totalGrossWeight = 0;
this.totalPieces = 0
const cargosArray = this.empForm.get('cargos') as FormArray;
cargosArray?.controls?.forEach((control) => { 
  const volume = Number(control.get('volumeselect')?.value || 0);
  const weight = Number(control.get('weightpsCalculatedother')?.value || 0); 
  const pieces = Number(control.get('units')?.value || 0); 
  this.totalVolume += volume;
  this.totalGrossWeight += weight;
  this.totalPieces += pieces
});
}

  sendBooking(content) {
    let mail = this.shippingLineList?.filter((x) => x?.shippinglineId == this.agentAdviceDetails?.routeDetails?.shippingLineId)[0]?.email

    if (mail) {
      this.newMembersTO = [{ to: mail }]
    }
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  regularExpression =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  newMembersTO: FruitTO[] = [];
  newMembersCC: FruitCC[] = [];
  @ViewChild("chipListTO") chipListTO;
  @ViewChild("chipListCC") chipListCC;

  addOnBlurTO = true;
  addOnBlurCC = true;

  baseConvert(blob, filename): Promise<any> {
    return new Promise((resolve, reject) => {

      let attachment;
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => {
        attachment = [{ "content": reader.result, "name": filename }]
      };

      setTimeout(() => {
        resolve(attachment);
      }, 2000); // Simulating a delay
    });
  }

  async sendEmailtoShippingLine() {
    if (this.newMembersTO.length === 0) {
      this.notification.create(
        'error',
        'Please fill Mail Id',
        '');
        return;
      }
      
    const blob = new Blob([this.SentEmail.value.Attachment], { type: 'application/octet-stream' });
    
    let attachment = this.SentEmail.value.Attachment.name ? await this.baseConvert(blob, this.SentEmail.value.Attachment.name) : [];

    let toMail: any = [];
    let ccMail: any = [];
    this.newMembersTO.filter((x) => {
      toMail.push({ email: x.to })
    })
    this.newMembersCC.filter((x) => {
      ccMail.push({ email: x.cc })
    })
    const payload : any = {
      "enquiryId": this.agentAdviceDetails?.enquiryId,
      "to": toMail,
      "cc": ccMail,
      "attachments": attachment
    }
    
    
    this.loaderService.showcircle();
    this.commonService.userList('sendBookingMail', payload)?.subscribe((res: any) => {
      if (res) {
        this.loaderService.showcircle();
        this.commonService.UpdateToST(`enquiry/${this.agentAdviceDetails?.enquiryId}`, { ...this.agentAdviceDetails, carrierBookingStatus: 'Requested' })?.subscribe(()=>{
        this.SentEmail.reset();
        this.modalService.dismissAll();
        this.notification.create(
          'success',
          'Email Send Successfully..!',
          ''
        );
        setTimeout(() => {
          this.getAgentAdviceById(this.id)
        }, 1000);
        this.loaderService.hidecircle();
        },()=>{
          this.loaderService.hidecircle();
        })
       
      }
    },()=>{
      this.loaderService.hidecircle();
    });
  }

  carrierBookingConfirm() {
    this.commonService.UpdateToST(`enquiry/${this.agentAdviceDetails?.enquiryId}`, { ...this.agentAdviceDetails, carrierBookingStatus: 'Confirmed' })?.subscribe((res) => {
      this.notification.create(
        'success',
        'Carrier Booking Confirmed..!',
        ''
      );
      setTimeout(() => {
        this.getAgentAdviceById(this.id)
      }, 1000);
    })
  }

  fileChanged(event: any) {
    const attachmentControl = this.SentEmail.get('Attachment');
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      attachmentControl.setValue(file);


    } else {
      attachmentControl.setValue(null);
    }
  }

  addnewMembersTO(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    if ((value || "").trim()) {
      let emailVlidation = this.regularExpression.test(
        String(value).toLowerCase()
      );
      if (emailVlidation == true) {
        this.newMembersTO.push(
          {
            to: value.trim(),
          }
        )
      }
    }
    if (input) {
      input.value = "";
    }
  }

  removenewMembersTO(fruit: FruitTO): void {
    const index = this.newMembersTO.indexOf(fruit);
    if (index >= 0) {
      this.newMembersTO.splice(index, 1);
    }
  }

  addnewMembersCC(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    if ((value || "").trim()) {
      let emailVlidation = this.regularExpression.test(
        String(value).toLowerCase()
      );
      if (emailVlidation == true) {
        this.newMembersCC.push({
          cc: value.trim(),
        });

        // this.SentEmail.get("cc").setValue(this.newMembersCC);
        // this.chipListCC.errorState = false;
      }
    }
    if (input) {
      input.value = "";
    }
  }

  removenewMembersCC(fruit: FruitCC): void {
    if (this.newMembersCC.length <= 1) {
      return;
    }
    const index = this.newMembersCC.indexOf(fruit);
    if (index >= 0) {
      this.newMembersCC.splice(index, 1);
    }
  }
  AddShipperAddress :boolean = false;
  addAddress(content,flaag) {
    this.AddShipperAddress = flaag
    this.addressFormBuild()
    this.getCountryList()
    this.getBankList()
    this.submitted3 = false;
    this.addressForm.reset();
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }
  countryList: any = []
  stateList: any = []
  cityList: any = []
  bankList: any = []
  submitted3: boolean = false
  getCountryList() {
    let payload = this.commonService.filterList()
    payload.query = { status: true }
    this.commonService.getSTList('country', payload).subscribe((data) => {
      this.countryList = data.documents;
    });
  }
  getStateList() {
    this.stateList = [];
    this.cityList = [];
    let payload = this.commonService.filterList()
    payload.query = {
      "countryId": this.addressForm.get('barnch_country').value, status: true,
    }
    this.commonService.getSTList("state", payload).subscribe((data) => {
      this.stateList = data.documents;
    });
  }
  getCityList() {
    this.cityList = [];
    let payload = this.commonService.filterList()
    payload.query = {
      stateId: this.addressForm.get('branch_state').value,
      status: true,
    }
    this.commonService.getSTList("city", payload).subscribe((data) => {
      this.cityList = data.documents;
    });
  }
  getBankList() {
    let payload = this.commonService.filterList()
    payload.query = {
      isBank: true, status: true,
    }
    this.commonService.getSTList("bank", payload).subscribe((data) => {
      this.bankList = data.documents;
    });
  }

  saveAddress() {
    this.submitted3 = true;
    if (this.addressForm.invalid || !this.newenquiryForm.value.shipper) {
      if (!this.newenquiryForm.value.shipper) {
        this.notification.create(
          'error',
          'Please select shipper..!',
          ''
        );
      } else {
        this.notification.create(
          'error',
          'Form invalid..!',
          ''
        );
      }

    } else {

      let partyData = this.partyMasterNameList?.find((x) => x.partymasterId == this.newenquiryForm.value.shipper)

      let branchData = {
        branch_name: this.addressForm.value.branch_name,
        branch_address: this.addressForm.value.branch_address,
        barnch_country: this.addressForm.value.barnch_country,
        branch_countryName: this.countryList.filter(x => x.countryId === this.addressForm.value.barnch_country)[0]?.countryName,
        branch_state: this.addressForm.value.branch_state,
        branch_stateName: this.stateList.filter(x => x.stateId === this.addressForm.value.branch_state)[0]?.typeDescription,
        branch_cityId: this.addressForm.value.branch_city,
        branch_city: this.addressForm.value.branch_city,
        pinCode: this.addressForm.value.pinCode,
        stateCodeBranch: this.stateList.filter(x => x.stateId === this.addressForm.value.branch_state)[0]?.stateCode || '',
        placeofSupply: this.addressForm.value.placeofSupply,
        partyCode: this.addressForm.value.partyCode,
        bankName: this.addressForm.value.bankName,
        panNo: this.addressForm.value.tanNo,
        kycPan: this.addressForm.value.kycPan,
        kycGst: this.addressForm.value.kycGst,
        CompanydocumentId: this.addressForm?.value?.CompanydocumentId || "",
        CompanydocumentName: this.addressForm?.value?.CompanydocumentName || "",
        TaxdocumentId: this.addressForm?.value?.TaxdocumentId || "",
        TaxdocumentName: this.addressForm?.value?.TaxdocumentName || "",
        completeKYC: this.addressForm?.value?.completeKYC || false,
        cust_acc_no: this.addressForm.value.cust_acc_no,
        remarks: this.addressForm.value.remarks,
        pic: this.addressForm.value.pic,
        pic_phone: this.addressForm.value.pic_phone,
        pic_email: this.addressForm.value.pic_email,
        tax_name: this.addressForm.value.tax_name,
        taxActive : this.addressForm.value.taxActive,
        tax_number: this.addressForm.value.tax_number,
        BROKERAGE_PAYABLE: this.addressForm.value.BROKERAGE_PAYABLE,
        creadirCustomer: this.addressForm.value.creadirCustomer,
        active_flag: this.addressForm.value.active_flag,
        kyc_flag: this.addressForm.value.kyc_flag,
        TDS_GST_APPLICABLE: this.addressForm.value.TDS_GST_APPLICABLE,
        documents: this.addressForm.value.documents
      }
      partyData.branch.push(branchData)
      let id;
      if(this.AddShipperAddress){
        id=  this.newenquiryForm.value.shipper
      }else{
        id =  this.newenquiryForm.value.cosignee
      }
      this.commonService.UpdateToST(`partymaster/${id}`, partyData).subscribe((data: any) => {
        if (data) {
          if(this.AddShipperAddress){
            this.billingBranchList = partyData.branch
          }else{
            this.billingBranchList1 = partyData.branch
          }
          
          this.notification.create('success',
            'Added Successfully',
            '');

          this.submitted3 = false;
        }
      })
      this.closePopup()
    }
  }

  forbiddenCharactersValidator() {
    return (control) => {
      const forbiddenChars = /["\\]/; // Regular expression to match forbidden characters
      const value = control.value;
      const hasForbiddenChars = forbiddenChars.test(value);
      return hasForbiddenChars ? { forbiddenChars: true } : null;
    };
  }
  addressFormBuild(res?) {
    this.addressForm = this.formBuilder.group({
      branch_name: [res ? res.branch_name : '', [Validators.required]],
      branch_address: [res ? res.branch_address : '', [Validators.required, this.forbiddenCharactersValidator()]],
      barnch_country: [res ? res.barnch_country : '', [Validators.required]],
      branch_countryName: [res ? res.barnch_countryName : ''],
      branch_state: [res ? res.branch_state : '' ],
      branch_stateName: [res ? res?.branch_stateName : ''],
      branch_city: [res ? res.branch_cityId : '' ],
      pinCode: [res ? res?.pinCode : '', [Validators.required]],
      placeofSupply: [res ? res?.placeofSupply : ''],
      partyCode: [res ? res.partyCode : ''],
      bankName: [res ? res.bankName : ''],
      cust_acc_no: [res ? res.cust_acc_no : ''],
      remarks: [res ? res.remarks : ''],
      tanNo: [res ? res.panNo : ''],
      kycPan: [res ? res.kycPan : ''],
      kycGst: [res ? res.kycGst : ''],
      pic: [res ? res.pic : ''],
      pic_phone: [res ? res.pic_phone : ''],
      pic_email: [res ? res.pic_email : '', [Validators.pattern(environment.validate.email)]],
      tax_name: [res ? res.tax_name : ''],
      taxActive : [res ? res.taxActive : ''],
      tax_number: [res ? res.tax_number : ''],
      BROKERAGE_PAYABLE: [res ? res.BROKERAGE_PAYABLE : true],
      creadirCustomer: [res ? res.creadirCustomer : true],
      active_flag: [res ? res.active_flag : true],
      kyc_flag: [res ? res.kyc_flag : false],
      TDS_GST_APPLICABLE: [res ? res.TDS_GST_APPLICABLE : true],
      documents: [res ? res.documents : []]
    })
  }

  getBranchList() {

    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      orgId: this.commonFunction.getAgentDetails()?.orgId,
      status: true
    }
    this.commonService.getSTList('branch', payload)
      ?.subscribe((data) => {
        this.branchList = data.documents;
      });
  }
  carrierBasedonBranch(e?) {

    if (e && this.shippingLineList?.length > 0) {
      let data: any = this.shippingLineList?.filter((x) => x.branchId === e);
      data = data.map((x) => {
        return {
          name: x.name,
          shippinglineId: x?.shippinglineId
        };
      });
      return data.length > 0 ? data : [];
    } else {
      let data: any = this.shippingLineList;
      data = data.map((x) => {
        return {
          name: x.name,
          shippinglineId: x?.shippinglineId
        };
      });
      return data.length > 0 ? data : [];
    }

  }
  addPartyMaster() {  
    let modalRef = this.modalService.open(AddPartyComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
      modalRef.componentInstance.isPopup = true; 
    modalRef.componentInstance.getList.subscribe((res: any) => {
      if (res) {  
        this.getPartyMasterDropDowns()  
      }
    })
  }

  checkGst(e, i) {
    console.log(e.target.value.length == 15)
    let payload = {
      "gstIN": e.target.value
    }
    if (e.target.value.length == 15) {
      this.commonService.getCibilRequest("ulipGST", payload).subscribe((data) => {
        let dataOfGST = data.response[0]?.response;
        let gstAddress = dataOfGST?.principalPlaceOfBusinessFields?.principalPlaceOfBusinessAddress;
        if (data?.error == 'true') {
          this.addressForm.patchValue({
            taxActive: false,
            tanNo: dataOfGST?.gstIdentificationNumber?.substring(2, 12),
          })
        } else {
          this.addressForm.patchValue({
            taxActive: dataOfGST?.gstnStatus === 'Active' ? true : false,
            barnch_country: this.countryList?.find((x) => x.countryName?.toLocaleLowerCase() == 'india')?.countryId,
            branch_address: gstAddress?.floorNumber + gstAddress?.buildingNumber + gstAddress?.buildingName + gstAddress?.streetName + gstAddress?.location,
            branch_countryName: gstAddress?.stateName,
            branch_state: gstAddress?.stateName,
            branch_city: gstAddress?.districtName,
            pinCode: gstAddress?.pincode,
            tanNo: dataOfGST?.gstIdentificationNumber?.substring(2, 12),
          })
        }
      },
        (error) => {
          this.notification.create('error',error?.error?.error?.message, '');
        });
    }

  }


  addCarrier(content) {
    this.getCarrierType()
    this.formBuild()
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }
  CarrierTypelist: any = []
  getCarrierType() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      "typeCategory": "carrierType",
      "status": true
    }
    if (payload?.size) payload.size = 1000,
      payload.from = 0,
      payload.sort = { "desc": ['updatedOn'] }

    this.commonService.getSTList('systemtype', payload)?.subscribe((data) => {
      this.CarrierTypelist = data?.documents?.filter(x => x.typeCategory === "carrierType");
    });
  }
  shippingLineForm: FormGroup;
  get f4() { return this.shippingLineForm?.controls; }
  formBuild() {
    this.shippingLineForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      shortName: [''],
      email: ['', [Validators.required, Validators.pattern(environment.validate.email)]],
      createUser: [false],
      status: [true],
      carrierType: ['', Validators.required],
      scacCode: [''],
      operatorCode: [''],
      contactName: [''],
      branchName: [''],
      phoneNo: ['']
    });
  }
  getcodeName() {
    if (this.shippingLineForm.value?.carrierType) {
      let carrierType = this.CarrierTypelist?.find((x) => x.systemtypeId == this.shippingLineForm.value?.carrierType)?.typeName?.toLowerCase() || ''
      if (carrierType === 'air') return 'IATA Code'
      if (carrierType === 'ocean') return 'SCAC Code'
      if (carrierType === 'rail') return 'Rail Carrier'
    } else {
      return 'Code'
    }
  }
  submitted4: boolean = false
  costItemsMasters() {
    this.submitted4 = true;
    if (this.shippingLineForm.invalid) {
      return;
    }
    let newCostItems = {
      name: this.shippingLineForm.value.name,
      shortName: this.shippingLineForm.value.shortName,
      typeCategory: this.shippingLineForm?.value?.carrierType,
      ShipmentTypeName: this.CarrierTypelist.find(x => x.systemtypeId === this.shippingLineForm.value.carrierType)?.typeName,
      scacCode: this.shippingLineForm.value.scacCode,
      operatorCode: this.shippingLineForm.value.operatorCode || '',
      email: this.shippingLineForm.value.email,
      status: this.shippingLineForm.value.status,
      phoneNo: this.shippingLineForm.value.phoneNo,
      contactName: this.shippingLineForm.value.contactName,
      branchId: this.shippingLineForm.value.branchName,
      branchName: this.branchList.find(x => x.branchId === this.shippingLineForm.value.branchName)?.branchName,
      createUser: this.shippingLineForm.value.createUser,
      country: 'IN',
      "tenantId": '1',
    };



    this.commonService.addToST('shippingline', newCostItems).subscribe(
      (res: any) => {
        if (res) {
          setTimeout(() => {
            this.submitted4 = false
            this.getShippingLineDropDowns()
            this.onCarrierCancel()
          }, 1000);
        }
      },
      (error) => {
        this.onCarrierCancel();
        this.notification.create('error', error?.error?.error?.message, '');
      }
    );
  }
  onCarrierCancel() {
    this.modalService.dismissAll();
    this.shippingLineForm.reset();
  }
  carrierType:any='';
  checkcarrierType() {
    this.carrierType = this.CarrierTypelist?.find((x) => x.systemtypeId == this.shippingLineForm.value?.carrierType)?.typeName?.toLowerCase() || ''
    if (this.carrierType === 'land') {
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

  searchPort(event,type) {  
    if (!event) {
      return
    } 
    if(type == '1'){
      this.portList1 = [] 
    }else if(type == '2'){
      this.portList2 = [] 
    }
    // this.portList3 = [] 
    // this.portList4 = [] 
    let payload = this.commonService.filterList()

    if (payload) payload.query = {
      status: true,
    }
    if (payload?.size) payload.size = 100
  

    let url;
    if (this.activeFrightAir) {  
      if (event) {
        let mustArray = {};
        mustArray['airPortname'] = {
          "$regex": event,
          "$options": "i"
        }
        payload.query = {
          ...payload.query,
          ...mustArray
        }
      }
      url = this.commonService.getSTList("airportmaster", payload)
    } else {
      if (payload?.project) payload.project = ["portDetails.portName", "portDetails.portTypeName", "portId"];

      if (event) {
        let mustArray = {};
        mustArray['portDetails.portName'] = {
          "$regex": event,
          "$options": "i"
        }
        payload.query = {
          ...payload.query,
          ...mustArray
        }
      }
      url = this.commonService.getSTList("port", payload)
    }
    url?.subscribe((res: any) => {
      res?.documents?.map(x => {
        if(type == '1'){
          this.portList1.push({
            portId:this.activeFrightAir ? x?.airportmasterId : x?.portId,
            portName: this.activeFrightAir ? x.airPortname : x?.portDetails?.portName,
            portTypeName: this.activeFrightAir ? 'air' : 'port'
          })
        }else if(type =='2'){
          this.portList2.push({
            portId:this.activeFrightAir ? x?.airportmasterId : x?.portId,
            portName: this.activeFrightAir ? x.airPortname : x?.portDetails?.portName,
            portTypeName: this.activeFrightAir ? 'air' : 'port'
          })
        } 
       
    }); 
    });
  }
  readonly nzFilterOption = (): boolean => true;
  portList1= []
  portList2= []
  searchPortAll(event) { 
    this.portList1 = [] 
    this.portList2 = []  
    let payload = this.commonService.filterList()

    if (payload) payload.query = {
      status: true,
    }
    if (payload?.size) payload.size = 100 
    let url;
    if (this.activeFrightAir) {
      payload.query['$or'] = payload.query['$or'] || [];  

      if (event.destPortName) {
        payload.query['$or'].push({
          "airPortname": { "$regex": event.destPortName, "$options": "i" }
        });
      }
      
      if (event.loadPortName) {
        payload.query['$or'].push({
          "airPortname": { "$regex": event.loadPortName, "$options": "i" }
        });
      }
      url = this.commonService.getSTList("airportmaster", payload)
    } else {
      if (payload?.project) payload.project = ["portDetails.portName", "portDetails.portTypeName", "portId"];
      payload.query['$or'] = payload.query['$or'] || [];  

      if (event.destPortName) {
        payload.query['$or'].push({
          "portDetails.portName": { "$regex": event.destPortName, "$options": "i" }
        });
      }
      
      if (event.loadPortName) {
        payload.query['$or'].push({
          "portDetails.portName": { "$regex": event.loadPortName, "$options": "i" }
        });
      }
      url = this.commonService.getSTList("port", payload)
    }
    url?.subscribe((res: any) => {
      const portData = res?.documents?.map(x => ({
        portId:this.activeFrightAir ? x?.airportmasterId : x?.portId,
            portName: this.activeFrightAir ? x.airPortname : x?.portDetails?.portName,
        portTypeName: this.activeFrightAir ? 'air' : 'port'
      }));
      
      this.portList1.push(...portData);
      this.portList2.push(...portData); 
    });
  }

}


