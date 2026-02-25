import { Component, OnInit, Output, EventEmitter, Input, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, Renderer2, Inject } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ApiService } from 'src/app/admin/principal/api.service';
import { shared } from '../../data';
import { differenceInCalendarDays } from 'date-fns';
import * as Constant from 'src/app/shared/common-constants';
import { CommonService } from '../../../services/common/common.service';
import { Subject } from 'rxjs';
import { OrderByPipe } from '../../../shared/util/sort';
import { CognitoService } from 'src/app/services/cognito.service';
import { Currencys, PartyMasterData } from 'src/app/models/party-master';
import { SystemType } from 'src/app/models/system-type';
import { PortDetails } from 'src/app/models/yard-cfs-master';
import { ChemicalProduct, Contact, CostItem, Location, ProspectComment, User } from 'src/app/models/new-enquiry';
import { ShippingLine } from 'src/app/models/shipping-line';
import { CommonFunctions } from '../../functions/common.function';
import * as converter from 'xml-js';
import { DOCUMENT } from '@angular/common';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-new-import-enquiry',
  templateUrl: './new-import-enquiry.component.html',
  styleUrls: ['./new-import-enquiry.component.scss']
})
export class NewImportEnquiryComponent implements OnInit, OnDestroy {
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
  categoryData: any = ['C', 'F'];
  newenquiryForm: FormGroup;
  numbers: number[] = Array.from({ length: 19 }, (_, i) => i + 3);
  empForm: FormGroup = new FormGroup({

    cargos: this.formBuilder.array([this.newCargo()])

  });
  submitted = false;
  currentUrl: string;
  prodectForm: FormGroup;
  chargesData = shared.chargeRows;
  remarksForm: FormGroup;
  commodityForm: FormGroup;
  newRemark: any
  remarksArray: ProspectComment[] = []
  id: any
  di: string;
  hi: string;
  Wi: string;
  li: string;
  Range: string;
  To: string;
  typeTemp: string;
  isAddMode: any
  baseBody: any
  agentAdviceDetails: any
  shipperList: PartyMasterData[] = []
  bookingpartyList: PartyMasterData[] = []
  agentList: PartyMasterData[] = []
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
  packinggroupList: any = []
  haulagetypeList: any = []
  portList: any = []
  currencyList: Currencys[] = []
  userList: User[] = []
  productList: ChemicalProduct[] = [];
  contactList: Contact[] = [];
  shippingLineList: ShippingLine[] = [];
  partymasterList: PartyMasterData[] = [];
  processPointList: SystemType[] = [];
  statusList: SystemType[] = [];
  locationList: Location[] = [];
  preCarrigeList: any = [];
  onCarrigeList: any = [];
  userData: any;
  weighthData:any=[];
  productShippingName: any;
  IMCOClass: any;
  VesselUNNo: any;
  PackingGroup: any;
  Density: any;
  IsEditRemarks: number = 0;
  costItemList: any = [];
  callapseALL: boolean = false;
  isEditMode: boolean = false;
  containerTypeList: any = [];
  containerSizeList: any = [];
  ImportShipmentTypelist:any = [];
  ImportShipmentTypelistAir:any = [];
  preCarrigeList1: Location[] = [];
  productId: any;
  customerList: SystemType[] = [];
  contractList: SystemType[] = [];
  opsCordinatorList: any = [];
  batchMasterList: any = [];
  Flash_point: any;
  
  @ViewChild('expand') expand: ElementRef;
  expandKeys = "panelsDetails panelsProduct  panelsRoute panelsdetention Containers freightTerm panelsCharges pannelRemarks"
  expandKeys1 = "panelsDetails "
  locatioName: any;
  departmentList: any = [];
  D = new Date();
  Creating=false;
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
  hsCode: string;
  msdsDoc: string;
  imcoList: any = [];
  LoginPerson: any;
  msdsDocURL: string = '';
  tankstatusList: SystemType[] = [];
  disableShipper: boolean = false;
  disableOPS: boolean = false;
  disableSale: boolean = false;
  freightTermsList: any;
  IsEditCommodity: number;
  commodityArray: any = [];
  commodityType: any;
  submitted1: boolean;
  activeCommodity: string;
  chargeName: CostItem[];
  chargeBasic: SystemType[];
  flightList: any = [];
  showQuotation: boolean = false;
  isBasicDetailsPanelOpen: boolean = true;
  canOpenBasicDetailsAccordion: boolean = true;
  isBookingPanelOpen: boolean = false;
  canOpenBookingAccordion: boolean = true;
  isPartyPanelOpen: boolean = false;
  canOpenPartyAccordion: boolean = true;
  isRoutePanelOpen: boolean = false;
  canOpenRouteAccordion: boolean = true;
  isCargoPanelOpen: boolean = false;
  canOpenCargoAccordion: boolean = true;
  isContainerPanelOpen: boolean = false;
  isLooseCargoPanelOpen: boolean = false;
  canOpenContainerAccordion: boolean = true;
  isServicePanelOpen: boolean = false;
  canOpenServiceAccordion: boolean = true;
  isChargesPanelOpen: boolean = true;
  canOpenChargesAccordion: boolean = true;
  isInvoicePanelOpen: boolean = false;
  canOpenInvoiceAccordion: boolean = true;
  isRemarksPanelOpen: boolean = false;
  canOpenRemarksAccordion: boolean = true;
  isDetentionPanelOpen: boolean = false;
  canOpenDetentionAccordion: boolean = true;
  fromdateValue: any = '';
  todateValue: any = '';
  f2: FormGroup;
  submitted2: boolean;
  uomData: any;
  billingBranchList: any;
  loadTypeList: any;
  movementList: any;
  destuffingList: any;
  ISFList: any;
  todayDate = new Date();
  paymentTermList: any = [];
  ULDcontainerlist: any = [];
  wagonTypeList: any = [];
  truckTypeList: any = [];
  palletTypeslist: any = [];
  lengthData: any = [];
  isServicesPanelOpen: boolean = false;
  isTransport: any = localStorage.getItem('isTransport') === 'true' ? true : false;
  constructor(
    private cd: ChangeDetectorRef,
    private router: Router,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private notification: NzNotificationService,
    private _api: ApiService,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private commonFunction: CommonFunctions,
    private sortPipe: OrderByPipe, private cognito: CognitoService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.getBranchList()
    this.formBuild();
    this.getSystemTypeDropDowns();
    this.getVoyage()

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
      // flightNo: [''],
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
  waagonShow: boolean = false
  vehicleShow: boolean = false



  get f() {
    return this.newenquiryForm.controls;
  }
  get f1() {
    return this.commodityForm.controls;
  }
  disableInput: boolean = false;
  ngOnInit(): void {
    this.route.url.subscribe(urlSegments => {
      // Check if any segment contains the word "show"
      this.disableInput = urlSegments.some(segment => segment.path === 'show');
    });
    this.currentUrl = this.router.url.split('?')[0]?.split('/').pop()
    this.cognito.getagentDetails()?.subscribe((resp) => {
      if (resp != null) {
        this.LoginPerson = resp?.attributes?.email;
      }
    })
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.userData = resp
      }
    })


    if (this.currentUrl === 'show') {
      this.newenquiryForm.disable();
      this.show = true
    }
    this.id = this.route.snapshot.params?.['id'];
    this.isAddMode = !this.id;


    this.getPartyMasterDropDowns();
    this.getCurrencyDropDowns();
    // this.getAirPort()
    // this.getPortDropDowns();
    this.getShippingLineDropDowns();
    this.getUomList()
    this.getLocationDropDowns();
    this.getAir()
    this.getproductDropDowns();




    if (!this.isAddMode) {
      this.isEditMode = true;
      this.getAgentAdviceById(this.id);
    } else {
      // this.addContainerRow();
      this.addInvoiceRow()
    }

    if (this.isAddMode) {
      setTimeout(() => {
        this.setExcelData()
      }, 2000);
    }
  }


  isEdi: boolean = false
  ReferencesList: any = [];

  setExcelData() {
    this.isAgentAdvise = true
    if (this.importAgentAdviceDetail?.Record) {
      this.isEdi = true
      this.ReferencesList = this.importAgentAdviceDetail?.Record?.References?.Reference
      let data = this.importAgentAdviceDetail?.Record;

      data?.Parties?.Party?.forEach(element => {
        if (element?.AddressCode?._text == 'SH') {
          this.newenquiryForm.patchValue({
            shipperAddress: this.partyMasterNameList?.find((x) => x?.name?.toLowerCase().replace(/\s/g, '') == element?.Name?._text?.toLowerCase().replace(/\s/g, ''))?.addressInfo?.address || '',
            shipper: this.partyMasterNameList?.find((x) => x?.name?.toLowerCase().replace(/\s/g, '') == element?.Name?._text?.toLowerCase().replace(/\s/g, ''))?.partymasterId || '',
          })
        }
        if (element?.AddressCode?._text == 'CN') {
          this.newenquiryForm.patchValue({
            consigneeAddress: this.partyMasterNameList?.find((x) => x?.name?.toLowerCase().replace(/\s/g, '') == element?.Name?._text?.toLowerCase().replace(/\s/g, ''))?.addressInfo?.address || '',
            cosignee: this.partyMasterNameList?.find((x) => x?.name?.toLowerCase().replace(/\s/g, '') == element?.Name?._text?.toLowerCase().replace(/\s/g, ''))?.partymasterId || '',
          })
        }
      });

      this.newenquiryForm.patchValue({

        uniqueRefNo: data?.UniqueRef?._text || '',
        stcReference: data?.STCReference?._text || '',
        quotationRef: data?.QuoteNumber?._text || '',
        versionNo: data?.VersionNo?._text || '',
        


        bookingNumber: data?.bookingNumber?._text || '',
        bookingDate: data?.bookingDate?._text?.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"),
        bookingValidityDate: data?.bookingValidityDate?._text?.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"),


        loadType: this.loadTypeList?.find((x) => x?.typeName?.toLowerCase().replace(/\s/g, '') == 'fcl')?.systemtypeId,
        billingBranch: this.partyMasterNameList?.find((x) => x?.name?.toLowerCase().replace(/\s/g, '') == data?.CustName?._text?.toLowerCase().replace(/\s/g, ''))?.branch[0]?.branch_name || '',
        billingAddress: this.partyMasterNameList?.find((x) => x?.name?.toLowerCase().replace(/\s/g, '') == data?.CustName?._text?.toLowerCase().replace(/\s/g, ''))?.addressInfo?.address || '',
        billingParty: this.partyMasterNameList?.find((x) => x?.name?.toLowerCase().replace(/\s/g, '') == data?.CustName?._text?.toLowerCase().replace(/\s/g, ''))?.partymasterId || '',

        moveNo: this.ReferencesList.filter((x) => x?.ReferenceCode?._text?.toLowerCase() === 'move')[0]?.ReferenceVal?._text || '',

        paymentTerm: this.paymentTermList.filter((x) => x?.typeName?.toLowerCase() === (data?.Terms?._text === 'P') ? 'prepaid' : 'collect')[0]?.systemtypeId || '',

        moveType: this.tanktypeList.filter((x) => x?.typeName?.toLowerCase() === data?.MoveType?._text?.toLowerCase())[0]?.systemtypeId || '',

        noOfContainer: data?.NumberOfContainers?._text || "0",
        grossWeight: data?.grossWeight || "",
        shippping_term: this.shippingtermList.filter((x) => x?.typeName?.toLowerCase() === (data?.Terms?._text === 'P') ? 'pier to pier' : 'door to door')[0]?.systemtypeId || '',

        load_port: this.portList?.find((x) => x?.portName?.toLowerCase().replace(/\s/g, '') == data?.Routing?.EntryPort?._text?.toLowerCase().replace(/\s/g, ''))?.portId,
        discharge_port: this.portList?.find((x) => x?.portName?.toLowerCase().replace(/\s/g, '') == data?.Routing?.ExitPort?._text?.toLowerCase().replace(/\s/g, ''))?.portId,
        PlaceCarrierReceipt: this.portList?.find((x) => x?.portName?.toLowerCase().replace(/\s/g, '') == data?.Destination?._text?.toLowerCase().replace(/\s/g, ''))?.portId,
        PlaceCarrierDelivery: this.portList?.find((x) => x?.portName?.toLowerCase().replace(/\s/g, '') == data?.Destination?._text?.toLowerCase().replace(/\s/g, ''))?.portId,

        etdPort: data?.Routing?.ExitDate?._text?.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"),
        etaPort: data?.Routing?.EntryDate?._text?.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"),

        vessel: this.vesselList?.find((x) => x?.vesselName?.toLowerCase().replace(/\s/g, '') == data?.Vessel?.MainVessel?._text?.toLowerCase().replace(/\s/g, ''))?.vesselId,
        voyageNumber: data?.Vessel?.MainVoyage?._text,


        deliveryPlace: this.locationList.filter((x) => x?.locationName?.toLowerCase() === data?.DeliveryPlace?._text?.toLowerCase())[0]?.locationId || '',

        shipping_line: this.shippingLineList.find(x => x.name?.toLowerCase().replace(/\s/g, '') === data?.Vessel?.ShippingLine?._text?.toLowerCase().replace(/\s/g, ''))?.shippinglineId,
        flightId: this.flightList.find(x => x.name?.toLowerCase().replace(/\s/g, '') === data?.Vessel?.ShippingLine?._text?.toLowerCase().replace(/\s/g, ''))?.flightId,
        flightNo : data?.flightNo,
        DemurrageFreeDays: Number(data?.Demurrage?.DestDemurFree?._text),
        DemurrageCurrency:
          this.currencyList.filter(x => x.currencyShortName?.toLowerCase() === data?.Demurrage?.DestDemurCurrency?._text?.toLowerCase())[0]?.currencyId ||
          this.currencyList.filter(x => x.currencyShortName === 'USD')[0]?.currencyId,
        DemurrageAmount: '',
        DemurrageChanged: data?.Demurrage?.DestDemurChange?._text,
        DemurrageName: data?.Demurrage?.DestDemurCust?._text,

        TruckingFreeHours: data?.TruckingFreeHours?._text,
        TruckingCurrency:
          this.currencyList.filter(x => x.currencyShortName?.toLowerCase() === data?.TruckingCurrency?._text?.toLowerCase())[0]?.currencyId ||
          this.currencyList.filter(x => x.currencyShortName?.toLowerCase() === 'INR')[0]?.currencyId,
        TruckingPrice: data?.TruckingPrice?._text,
        TruckingChanged: data?.TruckingChanged?._text,

        operatorName: data?.Operator?.OperatorName?._text,
        operatorPhone: data?.Operator?.OperatorPhone?._text,
        operatorMail: data?.Operator?.OperatorEmail?._text,
      });

      if (data?.Product) {
        let newProduct = {
          productId: '',
          productName: data?.Product?.ProductName?._text,
          properShippingName: '',
          technicalName: '',
          commodityType: data?.Product?.Haz?._text == 'Y' ? 'HAZ' : 'GENERAL',
          commodityTypeName: data?.Product?.Haz?._text == 'Y' ? 'HAZ' : 'GENERAL',
          unNo: data?.Product?.UNNo?._text,
          hsCode: '',
          msdsDoc: '',
          freightAt: '',
          contractName: '',
          contract: '',
          packingGroup: '',
          flashPoint: '',
          marinePollutionId: '',
          unit: '',
          unitName: '',
          grossWeight: data?.Product?.GrossWeight?._text,
          cargoReadyDate: '',
          targetDeliveryDate: '',
          Density: data?.Product?.Density?._text,
          imcoClass: data?.Product?.IMO?._text

        }
        this.commodityArray.push(newProduct)
      }

      // this.productData()

      let control = this.newenquiryForm.controls.container['controls'][0].controls
      control.containerType.setValue('20 Reefer')
      control.noOfContainer.setValue(data?.NumberOfContainers?._text)
    }
  }
  enquiryTypeName: any;
  formBuild(data?) {
    this.newenquiryForm = this.formBuilder.group({
      enquiry_number: [data ? data?.agentadviceNo : ''],
      enquiryType: [data ? this.enquiryTypeName ? this.enquiryTypeName : '' : ''],
      Shipment_Type: [data ? data?.basicDetails?.ShipmentTypeId : '', Validators.required],
      loadType: [data ? data?.basicDetails?.loadTypeId : '', Validators.required],
      importShipmentType: [data ? data?.basicDetails?.importShipmentTypeId : '',Validators.required],
      ops_coordinator: [data ? data?.ops_coordinator : ''],
      sales_person: [data ? data?.basicDetails?.salePerson : ''],
      billingParty: [data ? data?.basicDetails?.billingPartyId : '', Validators.required],
      billingAddress: [data ? data?.basicDetails?.billingPartyAddress : ''],
      billingBranch: [data ? data?.basicDetails?.billingBranch : ''],
      bookedBranch: [data ? data?.basicDetails?.userBranch : ''],
      quotationRef: [data ? data?.basicDetails?.quotationRef : ''],
      inco_term: [data ? data?.basicDetails?.incoTermId : ''],
      agent: [data ? data?.basicDetails?.agentId : ''],
      //
      bookingNumber: [data ? data?.bookingNumber : ''],
      bookingDate: [data ? data?.bookingDate : ''],
      bookingValidityDate: [data ? data?.bookingValidityDate : ''],
      shippping_term: [data ? data?.shippingTermId : ''],
      //
      shipper: [data ? data?.basicDetails?.shipperId : ''],
      cosignee: [data ? data?.basicDetails?.consigneeId : ''],
      shipperAddress: [data ? data?.basicDetails?.shipperAddress : ''],
      consigneeAddress: [data ? data?.basicDetails?.consigneeAddress : ''],
      //
      deliveryOfPlace: [data ? data?.routeDetails?.deliveryOfPlaceId : '',Validators.required],
      load_place: [data ? data?.routeDetails?.loadPlace : ''],
      location: [data ? data?.routeDetails?.location : ''],
      load_port: [data ? data?.routeDetails?.loadPortId : '', Validators.required],
      discharge_port: [data ? data?.routeDetails?.destPortId : '', Validators.required],
      PlaceCarrierReceipt: [data ? data?.routeDetails?.carrierReceiptId : ''],
      PlaceCarrierDelivery: [data ? data?.routeDetails?.carrierDeliveryId : ''],
      etdPort: [data ? data?.routeDetails?.loadPortETD : ''],
      etaPort: [data ? data?.routeDetails?.destPortETA : ''],
      vessel: [data ? data?.routeDetails?.vesselId : ''],
      voyageNumber: [data ? data?.routeDetails?.voyageNumber : ''],
      flightNo: [ data? data?.routeDetails?.flightNo : ''],
      shipping_line: [data ? data?.routeDetails?.shippinglineId : '', Validators.required],
      backupShippingLine: [data ? data?.routeDetails?.backupShippingLine : ''],
      etd: [data ? data?.routeDetails?.etd : ''],
      eta: [data ? data?.routeDetails?.eta : ''],
      freeDaysTime : [data?.routeDetails?.freeDaysTime ?? [],Validators.required],
      transhipment1: [data ? data?.routeDetails?.transhipmentHop1id : ''],
      transhipment2: [data ? data?.routeDetails?.transhipmentHop2id : ''],
      transhipment1ETA: [data ? data?.routeDetails?.transhipmentHop1ETA : ''],
      transhipment1ETD: [data ? data?.routeDetails?.transhipmentHop1ETD : ''],
      transhipment2ETA: [data ? data?.routeDetails?.transhipmentHop2ETA : ''],
      transhipment2ETD: [data ? data?.routeDetails?.transhipmentHop2ETD : ''],
      movementType: [data ? data?.routeDetails?.movementType : 'DPD'],
      movementLocation: [data ? data?.routeDetails?.movementLocationId : ''],
      destuffingType: [data ? data?.routeDetails?.destuffingType : ''],
      destuffingLocation: [data ? data?.routeDetails?.destuffingLocationId : ''],
      ///
      commodityDescription: [data ? data?.productDetails?.commodityDescription : ''],
      containerNo: [data ? data?.containerNo : ''],
      preCarriage: [data ? data?.transportDetails?.preCarriage : false],
      onCarriage: [data ? data?.transportDetails?.onCarriage : false],
      cargo: [data ? data?.insurance?.cargo : false],
      emptyContainer: [data ? data?.insurance?.emptyContainer : false],
      palletization: [data ? data?.insurance?.palletization : false],
      fumigation: [data ? data?.insurance?.fumigation : false],
      warehousing: [data ? data?.insurance?.warehousing : false],
      //
      remarks: [data ? data?.remarks : ''],
      //
      clearanceDate: [data ? data?.customDetails?.clearanceDate : ''],
      clearance: [data ? data?.customDetails?.clearance : ''],
      customDestination: [data ? data?.customDetails?.customDestination : ''],
      customDestinationLocation: [data ? data?.customDetails?.customDestinationLocation : ''],
      transportDestination: [data ? data?.customDetails?.transportDestination : ''],
      clearanceDestination: [data ? data?.customDetails?.clearanceDestination : ''],
      // ISFFiledBy: [data ? data?.customDetails?.IFSFiledById : '', Validators.required],
      //

      invoices: this.formBuilder.array([]),
      //
      // containerNo: [data ? data?.containerNo : ''],
      destinationCarrierFD: [data ? data?.detentionDetails?.destinationCarrierFD : ''],
      destinationPortFD: [data ? data?.detentionDetails?.destinationPortFD : ''],
      originCarrierFD: [data ? data?.detentionDetails?.originCarrierFD : ''],
      lastFDDatePOD: [data ? data?.detentionDetails?.lastFDDatePOD : ''],
      lastFDDatePOCD: [data ? data?.detentionDetails?.lastFDDatePOCD : ''],
      lastFDDateEmptyReturn: [data ? data?.detentionDetails?.lastFDDateEmptyReturn : ''],
      lastFDDateCarrier: [data ? data?.detentionDetails?.lastFDDateCarrier : ''],

      ///
      container: this.formBuilder.array([]),
      charge: this.formBuilder.array([]),
      transport: this.formBuilder.array(this.getInitialTransportRows()),
      transport1: this.formBuilder.array(this.getInitialTransport1Rows()),


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
  getBankList() {
    let payload = this.commonService.filterList()
    payload.query = {
      isBank: true, status: true,
    }
    this.commonService.getSTList("bank", payload).subscribe((data) => {
      this.bankList = data.documents;
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
  addressForm: FormGroup;
  addressFormBuild(res?) {
    this.addressForm = this.formBuilder.group({
      branch_name: [res ? res.branch_name : '', [Validators.required]],
      branch_address: [res ? res.branch_address : '', [Validators.required, this.forbiddenCharactersValidator()]],
      barnch_country: [res ? res.barnch_country : '', [Validators.required]],
      branch_countryName: [res ? res.barnch_countryName : ''],
      branch_state: [res ? res.branch_state : '', [Validators.required]],
      branch_stateName: [res ? res?.branch_stateName : ''],
      branch_city: [res ? res.branch_cityId : '', [Validators.required]],
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
      tax_number: [res ? res.tax_number : ''],
      BROKERAGE_PAYABLE: [res ? res.BROKERAGE_PAYABLE : true],
      creadirCustomer: [res ? res.creadirCustomer : true],
      active_flag: [res ? res.active_flag : true],
      kyc_flag: [res ? res.kyc_flag : false],
      TDS_GST_APPLICABLE: [res ? res.TDS_GST_APPLICABLE : true],
      documents: [res ? res.documents : []]
    })
  }
  forbiddenCharactersValidator() {
    return (control) => {
      const forbiddenChars = /["\\]/; // Regular expression to match forbidden characters
      const value = control.value;
      const hasForbiddenChars = forbiddenChars.test(value);
      return hasForbiddenChars ? { forbiddenChars: true } : null;
    };
  }
  addTransPortValidation(i) {
    const control = (<FormArray>this.newenquiryForm.controls['transport']).at(i)
    if (control.get('locationType').value == 'location' || control.get('locationType').value == 'port') {
      control.get('location').setValidators(Validators.required);
      control.get('addressId').clearValidators()
    } else {
      control.get('addressId').setValidators(Validators.required);
      control.get('location').clearValidators()
    }

  }
  addTransPort1Validation(i) {
    const control = (<FormArray>this.newenquiryForm.controls['transport1']).at(i)
    if (control.get('locationType').value == 'location' || control.get('locationType').value == 'port') {
      control.get('location').setValidators(Validators.required);
      control.get('addressId').clearValidators()
    } else {
      control.get('addressId').setValidators(Validators.required);
      control.get('location').clearValidators()
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
        transit: [''],
        carrier: [''],
      });
    });


  }

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
  activeFright: string = ''
  shipmentTypes: any[];
  loadTypeListOriginal: any = [];
  public touchUi = false;
  public color = 'primary';
  public enableMeridian = true;



  showContainer: boolean = false;
  showPallet: boolean = false;
  typeOfWay: string = '';
  railandland: boolean = false;
  airandocean: boolean = false;
  activeFrightAir: Boolean = false
  getTabs() {
    let loadName = this.loadTypeList?.find((x) => x.systemtypeId == this.newenquiryForm.value.loadType)?.typeName.toLowerCase() || '';
    if (loadName) {
      if (['loose', 'lcl', 'ltl', 'ptl'].includes(loadName)) {
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


  shipmentType() {
    this.activeFright = this.shipmentTypes?.find(x => x.systemtypeId === this.newenquiryForm.value.Shipment_Type)?.typeName?.toLowerCase();
    this.activeFrightAir = false
    if (this.activeFright == 'air') {
      this.activeFrightAir = true
      this.loadTypeList = this.loadTypeListOriginal?.filter((x) => ['Loose', 'ULD Container']?.find(t => t.toLowerCase() === x.typeName.toLowerCase()))
    } else if (this.activeFright == 'ocean') {
      this.loadTypeList = this.loadTypeListOriginal?.filter((x) => ['FCL', 'LCL', 'Break Bulk']?.find(t => t.toLowerCase() === x.typeName.toLowerCase()))
    } else if (this.activeFright == 'land') {
      this.loadTypeList = this.loadTypeListOriginal?.filter((x) => ['FCL', 'FTL', 'PTL']?.find(t => t.toLowerCase() === x.typeName.toLowerCase()))
    } else if (this.activeFright == 'rail') {
      this.loadTypeList = this.loadTypeListOriginal?.filter((x) => ['FWL']?.find(t => t.toLowerCase() === x.typeName.toLowerCase()))
    } else {
      this.loadTypeList = this.loadTypeListOriginal
    }
    this.railandland = false
    this.airandocean = false

    // if (this.agentAdviceDetails?.transorigin?.length == 0 || (!this.agentAdviceDetails?.transorigin)) {
    //   const transportArray = this.newenquiryForm.get('transport') as FormArray;
    //   transportArray.clear();
    //   this.getInitialTransportRows().forEach(row => transportArray.push(row)); 
    // }
    // if (this.agentAdviceDetails?.transdestination?.length == 0 || (!this.agentAdviceDetails?.transdestination)) {
    //   const transportArray = this.newenquiryForm.get('transport1') as FormArray;
    //   transportArray.clear();
    //   this.getInitialTransport1Rows().forEach(row => transportArray.push(row));
    // }

    if (['rail', 'land'].includes(this.activeFright)) {
      // const transportArray = this.newenquiryForm.get('transport1') as FormArray;
      // transportArray.clear();
      this.railandland = true
      this.newenquiryForm.get('preCarriage').setValue(false)
      this.newenquiryForm.get('onCarriage').setValue(true)
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

      // this.newenquiryForm.get('vessel').clearValidators();
      // this.newenquiryForm.get('vessel').updateValueAndValidity();
      // this.newenquiryForm.get('voyageNumber').clearValidators();
      // this.newenquiryForm.get('voyageNumber').updateValueAndValidity();
    } else {

      this.airandocean = true
      this.newenquiryForm.get('load_place').clearValidators();
      this.newenquiryForm.get('load_place').updateValueAndValidity();
      this.newenquiryForm.get('location').clearValidators();
      this.newenquiryForm.get('location').updateValueAndValidity();
      this.newenquiryForm.get('load_port').setValidators([Validators.required]);
      this.newenquiryForm.get('load_port').updateValueAndValidity();
      this.newenquiryForm.get('discharge_port').setValidators([Validators.required]);
      this.newenquiryForm.get('discharge_port').updateValueAndValidity();
      // this.newenquiryForm.get('inco_term').setValidators([Validators.required]);
      // this.newenquiryForm.get('inco_term').updateValueAndValidity();
      this.newenquiryForm.get('shipping_line').setValidators([Validators.required]);
      this.newenquiryForm.get('shipping_line').updateValueAndValidity();

      // this.newenquiryForm.get('vessel').setValidators([Validators.required]);
      // this.newenquiryForm.get('vessel').updateValueAndValidity();
      // this.newenquiryForm.get('voyageNumber').setValidators([Validators.required]);
      // this.newenquiryForm.get('voyageNumber').updateValueAndValidity();
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

  getVesselListDropDown() {
    let payload = this.commonService.filterList()
    payload.query = {
      status: true
    }
    this._api
      .getSTList('vessel', payload)
      .subscribe((res: any) => {
        this.vesselList = res?.documents;
      });
  }
  async getVoyage() {
    let payload = this.commonService.filterList()
    payload.query = { status: true }
    await this._api
      .getSTList('vessel', payload)
      ?.subscribe((res: any) => {
        this.vesselList = res?.documents;
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
  setVoyage(e) {
    return;
    let vessel = this.vesselList?.filter((x) => x?.vesselId == e)[0]?.voyage
    if (vessel?.length > 0) {
      let voyageNo = vessel?.filter((x) => x?.shipping_line == this.newenquiryForm.value.shipping_line)[0]?.voyage_number
      this.newenquiryForm.controls.voyageNumber.setValue(voyageNo);
    }
  }

  branchList: any = []
  getBranchList() {

    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      createdByUID: this.userData?.userData?.userId,
    }
    this.commonService.getSTList('branch', payload)
      ?.subscribe((data) => {
        this.branchList = data?.documents;

      });
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

  getPartyMasterDropDowns() {
    let payload = this.commonService.filterList()
    if (payload) payload.query = {
      "status": true
    }
    this.commonService.getSTList("partymaster", payload)?.subscribe((res: any) => {
      this.partyMasterNameList = res?.documents;
      res?.documents?.filter((x) => {
        if (x.customerType) {
          x.customerType.map((res: any) => {
            if (res?.item_text === 'Shipper') { this.shipperList.push(x) }
            else if (res?.item_text === 'Agent') { this.agentList.push(x) }
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
    }
    this.commonService.getSTList("shippingline", payload)?.subscribe((res: any) => {
      this.shippingLineList = res?.documents;

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
  disabledDate = (current: Date): boolean => {
    const yesterdayDate = new Date(this.todayDate);
    yesterdayDate.setDate(this.todayDate.getDate() - 1);
    return current && current < yesterdayDate;
  };
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
    });
  }
  toggleAll(isExpand: boolean) {
    this.showQuotation = isExpand;
    this.isBasicDetailsPanelOpen = isExpand;
    this.isBookingPanelOpen = isExpand;
    this.isPartyPanelOpen = isExpand;
    this.isRoutePanelOpen = isExpand;
    this.isCargoPanelOpen = isExpand;
    this.isContainerPanelOpen = isExpand;
    this.isLooseCargoPanelOpen = isExpand;
    this.isServicePanelOpen = isExpand;
    this.isChargesPanelOpen = isExpand;
    this.isInvoicePanelOpen = isExpand;
    this.isServicesPanelOpen = isExpand;
    this.isRemarksPanelOpen = isExpand;
    this.isDetentionPanelOpen = isExpand;

  }

  toggleButton(panel: string) {
    switch (panel) {
      case 'basicDetails':
        if (this.canOpenBasicDetailsAccordion) {
          this.isBasicDetailsPanelOpen = !this.isBasicDetailsPanelOpen;
        }
        break;
      case 'booking':
        if (this.canOpenBookingAccordion) {
          this.isBookingPanelOpen = !this.isBookingPanelOpen;
        }
        break;
      case 'party':
        if (this.canOpenPartyAccordion) {
          this.isPartyPanelOpen = !this.isPartyPanelOpen;
        }
        break;
      case 'route':
        if (this.canOpenRouteAccordion) {
          this.isRoutePanelOpen = !this.isRoutePanelOpen;
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
        if (this.canOpenContainerAccordion) {
          this.isLooseCargoPanelOpen = !this.isLooseCargoPanelOpen;
        }
        break;
      case 'service':
        if (this.canOpenServiceAccordion) {
          this.isServicePanelOpen = !this.isServicePanelOpen;
        }
        break;
      case 'charges':
        if (this.canOpenChargesAccordion) {
          this.isChargesPanelOpen = !this.isChargesPanelOpen;
        }
        break;
      case 'invoice':
        if (this.canOpenInvoiceAccordion) {
          this.isInvoicePanelOpen = !this.isInvoicePanelOpen;
        }
        break;
      case 'Services':
        if (this.canOpenInvoiceAccordion) {
          this.isServicesPanelOpen = !this.isServicesPanelOpen;
        }
        break;
      case 'remarks':
        if (this.canOpenRemarksAccordion) {
          this.isRemarksPanelOpen = !this.isRemarksPanelOpen;
        }
        break;
      case 'detention':
        if (this.canOpenDetentionAccordion) {
          this.isDetentionPanelOpen = !this.isDetentionPanelOpen;
        }
        break;
      default:
        console.error('Unknown panel:', panel);
    }
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
          "palletType",  "wagonType", "truckType", "ULDcontainerType", "ISF", "destuffingType", "movementTYpe", "loadType", "tankStatus", "chargeType", "freightChargeTerm", "cargoType", "batchType", "contract", "customer", "imcoClass", "preCarriage", "onCarriage", "containerType", "containerSize", "enquiryType", "shippingTerm", "tankType", "shipmentTerm", "moveType", "incoTerm", "location", "icd", "packingGroup", "haulageType", "chargeTerm", "processPoint", "status", "carrierType", "shipmentType"
        ]
      }
    }

    this.commonService.getSTList("systemtype", payload)?.subscribe((res: any) => {

      this.ISFList = res?.documents?.filter(x => x.typeCategory === "ISF");
      this.movementList = res?.documents?.filter(x => x.typeCategory === "movementTYpe");
      this.destuffingList = res?.documents?.filter(x => x.typeCategory === "destuffingType");
      this.enquirytypeList = res?.documents?.filter(x => x.typeCategory === "enquiryType");
      // this.loadTypeList = res?.documents?.filter(x => x.typeCategory === "loadType");
      this.chargeBasic = res?.documents?.filter(x => x.typeCategory === "chargeType");
      this.paymentTermList = res?.documents?.filter(x => x.typeCategory === "paymentTerms");
      this.imcoList = res?.documents?.filter(x => x.typeCategory === "imcoClass");
      this.cargoTypeList = res?.documents?.filter(x => x.typeCategory === "cargoType");
      this.batchMasterList = res?.documents?.filter(x => x.typeCategory === "batchType");
      this.palletTypeslist = res?.documents?.filter(x => x.typeCategory === "palletType");
      this.contractList = res?.documents?.filter(x => x.typeCategory === "contract");
      this.customerList = res?.documents?.filter(x => x.typeCategory === "customer");
      this.wagonTypeList = res?.documents?.filter(x => x.typeCategory === "wagonType");
      this.truckTypeList = res?.documents?.filter(x => x.typeCategory === "truckType");
      this.shippingtermList = res?.documents?.filter(x => x.typeCategory === "shippingTerm");
      this.tanktypeList = res?.documents?.filter(x => x.typeCategory === "tankType");
      this.tankstatusList = res?.documents?.filter(x => x.typeCategory === "tankStatus");
      this.shipmenttermList = res?.documents?.filter(x => x.typeCategory === "shipmentTerm");
      this.movetypeList = res?.documents?.filter(x => x.typeCategory === "moveType");
      this.incotermList = res?.documents?.filter(x => x.typeCategory === "incoTerm");
      this.freightTermsList = res?.documents?.filter(x => x.typeCategory === "freightChargeTerm");
      this.ULDcontainerlist = res?.documents?.filter(x => x.typeCategory === "ULDcontainerType");
      this.packinggroupList = res?.documents?.filter(x => x.typeCategory === "packingGroup");
      this.haulagetypeList = res?.documents?.filter(x => x.typeCategory === "haulageType");
      this.processPointList = res?.documents?.filter(x => x.typeCategory === "processPoint");
      this.loadTypeListOriginal = res?.documents?.filter(x => x.typeCategory === "shipmentType");
      this.statusList = res?.documents?.filter(x => x.typeCategory === "status");
      this.shipmentTypes = res?.documents?.filter(x => x.typeCategory === "carrierType" && (this.isTransport ? x?.typeName?.toLowerCase() === "land" : x?.typeName?.toLowerCase() === "ocean" || x?.typeName?.toLowerCase() === "air"));
      this.containerTypeList = res?.documents?.filter(x => x.typeCategory === "containerType");
      this.containerSizeList = res?.documents?.filter(x => x.typeCategory === "containerSize");
    
        this.ImportShipmentTypelist = res?.documents?.filter(x => x.typeCategory === "ExportShipmentType");
        this.ImportShipmentTypelistAir = res?.documents?.filter(x => x.typeCategory === "ExportShipmentTypeAir");
       

      if (this.enquirytypeList?.length > 0) {
        this.enquirytypeList.map((res: any) => {
          if (res?.typeName?.toLowerCase() === 'import') {
            this.enquiryTypeName = res.systemtypeId
            this.newenquiryForm.controls.enquiryType.setValue(res.systemtypeId);
          }
        });
      }


    });

    this.cargoTypeList = this.cargoTypeList.map((x) => x.typeName?.toUpperCase())
  }

  getAirPort() {
    let payload = this.commonService.filterList()
    if (payload) payload.query = {
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
  async getAir() {
    let payload = this.commonService.filterList()
    payload.query = { status: true }
    await this._api?.getSTList('air', payload)
      ?.subscribe((res: any) => {
        this.flightList = res?.documents;
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
          portId: x?.portId,
          portName: x?.portDetails?.portName,
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
    });
  }





  getAgentAdviceById(id) {
    let url = "";
    let payload = this.commonService.filterList()

    url = Constant.AGENTADVICE_LIST;

    if (payload) payload.query = {
      agentadviceId: id,
    }


    this.commonService.getSTList(url, payload)
      ?.subscribe((res: any) => {

        this.agentAdviceDetails = res?.documents[0];
        this.shippingLineValid = this.agentAdviceDetails?.routeDetails?.shippingLineValid
        this.enquiryDateValid = this.agentAdviceDetails?.basicDetails?.enquiryValid

        this.formBuild(this.agentAdviceDetails)

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
          if (this.currentUrl === 'show') {
            cargoFormGroup.disable();
          }
          console.log(cargoArray?.controls[0]?.get('units').disabled)
          cargoArray.push(cargoFormGroup);

        });


        this.commodityArray = this.agentAdviceDetails?.cargoDetail || [];

        if (this.agentAdviceDetails?.containersDetails?.length > 0) {
          this.agentAdviceDetails?.containersDetails?.forEach(e => {
            this.addContainerRow(e)
          })
        }
        if (this.agentAdviceDetails?.invoicesDetails?.length > 0) {
          this.agentAdviceDetails?.invoicesDetails?.forEach(e => {
            this.addInvoiceRow(e)
          })
        }

        this.newenquiryForm.valueChanges?.subscribe(x => {
          this.valueChange = true
        })

        setTimeout(() => {
          this.setParty(this.agentAdviceDetails?.basicDetails?.billingPartyId);
          this.setParty1(this.agentAdviceDetails?.basicDetails?.consigneeId);
          this.setParty2(this.agentAdviceDetails?.basicDetails?.shipperId);
          this.shipmentType()
          this.getTabs()
        }, 2000);

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


        if (this.show) {
          let controls = this.getContainerControls()
          for (const control of controls) {
            control.disable();
          }
          let controls1 = this.getInvoiceControls()
          for (const control of controls1) {
            control.disable();
          }
        }

        if (this.currentUrl === 'show') {
          this.newenquiryForm.disable();
          this.remarksForm?.disable();
          this.f2?.disable();
          this.commodityForm?.disable();
          this.empForm?.disable();
          this.show = true;
        }
        if (this.agentAdviceDetails?.document && this.agentAdviceDetails?.enquiryStatus === "Inquiry Received") {
          this.downloadFile1(this.agentAdviceDetails?.document);
        }
        if (this.agentAdviceDetails?.enquiryStatus === "Inquiry Received") {
          this.isShipperDisabled = true;  
        }

      })

  }
  isShipperDisabled:boolean=false

  downloadFile1(documentURL) {

    this.commonService.downloadDocuments('downloadfile', documentURL)?.subscribe(
      (fileData: Blob) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          let xml = e.target.result;
          let result1 = converter.xml2json(xml, { compact: true, spaces: 2 });
          const JSONData = JSON.parse(result1);
          console.log(JSONData['ns0:NOFAE'])

          this.ReferencesList = JSONData['ns0:NOFAE']?.Record?.References?.Reference
          let data = JSONData['ns0:NOFAE']?.Record;

          data?.Parties?.Party?.forEach(element => {
            if (element?.AddressCode?._text == 'CN') {
              let partyAdd = this.partyMasterNameList?.find((x) => x?.name?.toLowerCase().replace(/\s/g, '') == element?.Name?._text?.toLowerCase().replace(/\s/g, ''))
              this.newenquiryForm.patchValue({
                consigneeAddress: `${partyAdd?.branch[0]?.branch_address},${partyAdd?.branch[0]?.branch_city}` || '',
                cosignee: partyAdd?.partymasterId || '',
              })
            }
          });

          this.newenquiryForm.patchValue({

            uniqueRefNo: data?.UniqueRef?._text || '',
            stcReference: data?.STCReference?._text || '',
            quotationRef: data?.QuoteNumber?._text || '',
            versionNo: data?.VersionNo?._text || '',
            flightId: this.flightList.find(x => x.name?.toLowerCase().replace(/\s/g, '') === data?.Vessel?.ShippingLine?._text?.toLowerCase().replace(/\s/g, ''))?.flightId,
            flightNo : data?.flightNo,
            containerNo:data?.containerNo || '',

            bookingNumber: data?.bookingNumber?._text || '',
            bookingDate: data?.bookingDate?._text?.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"),
            bookingValidityDate: data?.bookingValidityDate?._text?.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"),


            loadType: this.loadTypeList?.find((x) => x?.typeName?.toLowerCase().replace(/\s/g, '') == 'fcl')?.systemtypeId,
            billingBranch: this.partyMasterNameList?.find((x) => x?.name?.toLowerCase().replace(/\s/g, '') == data?.CustName?._text?.toLowerCase().replace(/\s/g, ''))?.branch[0]?.branch_name || '',
            billingAddress: this.partyMasterNameList?.find((x) => x?.name?.toLowerCase().replace(/\s/g, '') == data?.CustName?._text?.toLowerCase().replace(/\s/g, ''))?.addressInfo?.address || '',
            billingParty: this.partyMasterNameList?.find((x) => x?.name?.toLowerCase().replace(/\s/g, '') == data?.CustName?._text?.toLowerCase().replace(/\s/g, ''))?.partymasterId || '',

            moveNo: this.ReferencesList.filter((x) => x?.ReferenceCode?._text?.toLowerCase() === 'move')[0]?.ReferenceVal?._text || '',

            paymentTerm: this.paymentTermList.filter((x) => x?.typeName?.toLowerCase() === (data?.Terms?._text === 'P') ? 'prepaid' : 'collect')[0]?.systemtypeId || '',

            moveType: this.tanktypeList.filter((x) => x?.typeName?.toLowerCase() === data?.MoveType?._text?.toLowerCase())[0]?.systemtypeId || '',

            noOfContainer: data?.NumberOfContainers?._text || "0",

            shippping_term: this.shippingtermList.filter((x) => x?.typeName?.toLowerCase() === (data?.Terms?._text === 'P') ? 'pier to pier' : 'door to door')[0]?.systemtypeId || '',

            load_port: this.portList?.find((x) => x?.portName?.toLowerCase().replace(/\s/g, '') == data?.Routing?.EntryPort?._text?.toLowerCase().replace(/\s/g, ''))?.portId,
            discharge_port: this.portList?.find((x) => x?.portName?.toLowerCase().replace(/\s/g, '') == data?.Routing?.ExitPort?._text?.toLowerCase().replace(/\s/g, ''))?.portId,
            PlaceCarrierReceipt: this.portList?.find((x) => x?.portName?.toLowerCase().replace(/\s/g, '') == data?.Destination?._text?.toLowerCase().replace(/\s/g, ''))?.portId,
            PlaceCarrierDelivery: this.portList?.find((x) => x?.portName?.toLowerCase().replace(/\s/g, '') == data?.Destination?._text?.toLowerCase().replace(/\s/g, ''))?.portId,

            etdPort: data?.Routing?.ExitDate?._text?.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"),
            etaPort: data?.Routing?.EntryDate?._text?.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"),

            vessel: this.vesselList?.find((x) => x?.vesselName?.toLowerCase().replace(/\s/g, '') == data?.Vessel?.MainVessel?._text?.toLowerCase().replace(/\s/g, ''))?.vesselId,
            voyageNumber: data?.Vessel?.MainVoyage?._text,


            deliveryPlace: this.locationList.filter((x) => x?.locationName?.toLowerCase() === data?.DeliveryPlace?._text?.toLowerCase())[0]?.locationId || '',

            shipping_line: this.shippingLineList.find(x => x.name?.toLowerCase().replace(/\s/g, '') === data?.Vessel?.ShippingLine?._text?.toLowerCase().replace(/\s/g, ''))?.shippinglineId,


            DemurrageFreeDays: Number(data?.Demurrage?.DestDemurFree?._text),
            DemurrageCurrency:
              this.currencyList.filter(x => x.currencyShortName?.toLowerCase() === data?.Demurrage?.DestDemurCurrency?._text?.toLowerCase())[0]?.currencyId ||
              this.currencyList.filter(x => x.currencyShortName === 'USD')[0]?.currencyId,
            DemurrageAmount: '',
            DemurrageChanged: data?.Demurrage?.DestDemurChange?._text,
            DemurrageName: data?.Demurrage?.DestDemurCust?._text,

            TruckingFreeHours: data?.TruckingFreeHours?._text,
            TruckingCurrency:
              this.currencyList.filter(x => x.currencyShortName?.toLowerCase() === data?.TruckingCurrency?._text?.toLowerCase())[0]?.currencyId ||
              this.currencyList.filter(x => x.currencyShortName?.toLowerCase() === 'INR')[0]?.currencyId,
            TruckingPrice: data?.TruckingPrice?._text,
            TruckingChanged: data?.TruckingChanged?._text,

            operatorName: data?.Operator?.OperatorName?._text,
            operatorPhone: data?.Operator?.OperatorPhone?._text,
            operatorMail: data?.Operator?.OperatorEmail?._text,
          });

          if (data?.Product) {
            let newProduct = {
              productId: '',
              productName: data?.Product?.ProductName?._text,
              properShippingName: '',
              technicalName: '',
              commodityType: data?.Product?.Haz?._text == 'Y' ? 'HAZ' : 'GENERAL',
              commodityTypeName: data?.Product?.Haz?._text == 'Y' ? 'HAZ' : 'GENERAL',
              unNo: data?.Product?.UNNo?._text,
              hsCode: '',
              msdsDoc: '',
              freightAt: '',
              contractName: '',
              contract: '',
              packingGroup: '',
              flashPoint: '',
              marinePollutionId: '',
              unit: '',
              unitName: '',
              grossWeight: data?.Product?.GrossWeight?._text,
              cargoReadyDate: '',
              targetDeliveryDate: '',
              Density: data?.Product?.Density?._text,
              imcoClass: data?.Product?.IMO?._text

            }
            this.commodityArray.push(newProduct)
          }

          // this.productData()

          let control = this.newenquiryForm?.controls?.container['controls'][0]?.controls
          control?.containerType?.setValue('20 Reefer')
          control?.noOfContainer?.setValue(data?.NumberOfContainers?._text)


        };
        reader.readAsText(fileData);
      },
      (error) => {
        console.error(error);
      }
    );
  }
  getInvalidControls() {
    const invalid = [];
    const controls = this.newenquiryForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }
  onSave(pending) {
    console.log(this.getInvalidControls())
    this.submitted = true;
    let originID = '';
    let originName = '';
    let destinationID = '';
    let destinationName = '';
    if (!pending) {

      if (this.newenquiryForm.invalid) {
        this.notification.create
          ('error', 'Please fill the form', '');
        this.expand?.nativeElement.click();
        return false
      }

      if (this.railandland) {
        if (this.transport.at(0).get('locationType').value == 'location') {
          originID = this.transport.at(0).get('location').value
          originName = this.locationList.filter(x => x.locationId === this.transport.at(0).get('location').value)[0]?.locationName
        } else if (this.transport.at(0).get('locationType').value == 'port') {
          originID = this.transport.at(0).get('location').value
          originName = this.portList1.filter(x => x.portId === this.transport.at(0).get('location').value)[0]?.portId
        } else {
          originName = this.transport.at(0).get('addressId').value ? this.transport.at(0).get('addressId').value : this.transport.at(0).get('address').value
        }

        if (this.transport.at(this.transport?.controls?.length - 1).get('locationType').value == 'location') {
          destinationID = this.transport.at(this.transport?.controls?.length - 1).get('location').value
          destinationName = this.locationList.filter(x => x.locationId === this.transport.at(this.transport?.controls?.length - 1).get('location').value)[0]?.locationName
        } else if (this.transport.at(this.transport?.controls?.length - 1).get('location').value == 'port') {
          destinationID = this.transport.at(this.transport?.controls?.length - 1).get('location').value
          destinationName = this.portList2.filter(x => x.portId === this.transport.at(this.transport?.controls?.length - 1).get('location').value)[0]?.portId
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


      // if (this.commodityArray.length == 0) {
      //   this.notification.create
      //     ('error', 'Please add cargo details', '');
      //   this.expand.nativeElement.click();
      //   return false
      // }
    }

    let newAgentAdvice = {

      tenantId: this.userData.tenantId,
      orgId: this.commonFunction.getAgentDetails().orgId,
      agentadviceId: this.id || "",
      agentadviceNo: this.newenquiryForm.value.enquiry_number || '',
      agentAdviceDate: this.newenquiryForm.value.agentAdviceDate || new Date(),
      agentAdviceType: "Import",
      isExport: false,

      enquiryTypeId: this.newenquiryForm.value.enquiryType,
      enquiryTypeName: (this.enquirytypeList?.filter(x => x.systemtypeId === this.newenquiryForm.value.enquiryType)[0]?.typeName),

      bookingNumber: this.newenquiryForm.value.bookingNumber,
      bookingDate: this.newenquiryForm.value.bookingDate,
      bookingValidityDate: this.newenquiryForm.value.bookingValidityDate,
      shippingTermId: this.newenquiryForm.value.shippping_term || '',
      shippingTermName: this.shippingtermList?.filter(x => x.systemtypeId === this.newenquiryForm.value.shippping_term)[0]?.typeName || '',

      basicDetails: {
        enquiryTypeId: this.newenquiryForm.value.enquiryType,
        enquiryTypeName: (this.enquirytypeList?.filter(x => x.systemtypeId === this.newenquiryForm.value.enquiryType)[0]?.typeName),

        loadTypeId: this.newenquiryForm.value.loadType,
        loadType: this.loadTypeList?.filter(x => x.systemtypeId === this.newenquiryForm.value.loadType)[0]?.typeName,
        importShipmentTypeId: this.newenquiryForm?.value.importShipmentType,
       importShipmentTypeName: [...this.ImportShipmentTypelistAir,...this.ImportShipmentTypelist]?.find((x) => x.systemtypeId == this.newenquiryForm?.value?.importShipmentType)?.typeName,

        billingPartyId: this.newenquiryForm.value.billingParty || '',
        billingPartyName: this.partyMasterNameList?.filter(x => x.partymasterId === this.newenquiryForm.value.billingParty)[0]?.name,
        billingPartyAddress: this.newenquiryForm.value.billingAddress,

        

        billingBranch: this.newenquiryForm.value.billingBranch,
        billingStateCode: this.billingBranchList?.filter(x => x.branch_name == this.newenquiryForm.value.billingBranch)[0]?.stateCodeBranch || '',
        billingCountry: this.billingBranchList?.filter(x => x.branch_name == this.newenquiryForm.value.billingBranch)[0]?.branch_countryName || '',

        userBranch: this.newenquiryForm.value?.bookedBranch,
        ShipmentTypeId: this.newenquiryForm?.value?.Shipment_Type,
        ShipmentTypeName: this.shipmentTypes.find(x => x.systemtypeId === this.newenquiryForm.value.Shipment_Type)?.typeName,
        userBranchName: this.branchList?.filter(x => x.branchId == this.newenquiryForm.value?.bookedBranch)[0]?.branchName || '',

        userBranchStateCode: this.branchList?.filter(x => x?.branchId === this.newenquiryForm.value?.bookedBranch)[0]?.addressInfo.stateCode,
        userJobCode: this.branchList?.filter(x => x?.branchId === this.newenquiryForm.value?.bookedBranch)[0]?.jobCode,


        quotationRef: this.newenquiryForm.value.quotationRef,
        salePerson: this.newenquiryForm.value.sales_person,

        incoTermId: this.newenquiryForm.value.inco_term,
        incoTermName: this.incotermList?.filter(x => x.systemtypeId === this.newenquiryForm.value.inco_term)[0]?.typeName || '',
        agentId: this.newenquiryForm?.value.agent || '',
        agentName: this.agentList?.filter(x => x.partymasterId === this.newenquiryForm.value.agent)[0]?.name || '',
        

        shipperId: this.newenquiryForm.value.shipper || '',
        shipperName: this.partyMasterNameList?.filter(x => x.partymasterId === this.newenquiryForm.value.shipper)[0]?.name,
        shipperAddress: this.newenquiryForm.value.shipperAddress,
        consigneeId: this.newenquiryForm.value.cosignee,
        consigneeName: this.partyMasterNameList?.filter(x => x.partymasterId === this.newenquiryForm.value.cosignee)[0]?.name,
        consigneeAddress: this.newenquiryForm.value.consigneeAddress,


      },
      productDetails: {
        commodityDescription: this.newenquiryForm.value.commodityDescription,
      },
      containerNo: this.newenquiryForm.value.containerNo,
      cargoDetail: this.commodityArray || [],
      routeDetails: {
        freeDaysTime : this.newenquiryForm?.value?.freeDaysTime || [],
        deliveryOfPlaceId: this.newenquiryForm.value.deliveryOfPlace,
        deliveryOfPlace: this.locationList?.filter((x) => x.locationId === this.newenquiryForm.value.deliveryOfPlace)[0]?.locationName,
        loadPlace: originID || '',
        loadPlaceName: originName || '',
        location: destinationID || '',
        locationName: destinationName || '',

        loadPortId: this.newenquiryForm.value.load_port,
        loadPortName: this.portList1?.filter(x => x.portId === this.newenquiryForm.value.load_port)[0]?.portName || '',

        destPortId: this.newenquiryForm.value.discharge_port,
        destPortName: this.portList2?.filter(x => x.portId === this.newenquiryForm.value.discharge_port)[0]?.portName || '',

        loadPortETD: this.newenquiryForm.value.etdPort,
        destPortETA: this.newenquiryForm.value.etdPort,

        carrierReceiptId: this.newenquiryForm.value.PlaceCarrierReceipt,
        carrierReceiptName: this.portList?.filter(x => x.portId === this.newenquiryForm.value.PlaceCarrierReceipt)[0]?.portName ||'',

        carrierDeliveryId: this.newenquiryForm.value.PlaceCarrierDelivery,
        carrierDeliveryName: this.portList?.filter(x => x.portId === this.newenquiryForm.value.PlaceCarrierDelivery)[0]?.portName ||'',

        shippinglineId: this.newenquiryForm.value.shipping_line,
        shippinglineName: this.shippingLineList?.filter((x) => x.shippinglineId === this.newenquiryForm.value.shipping_line)[0]?.name,

        flightId: this.newenquiryForm.value.flightNo,
        flightNo: this.flightList?.filter((x) => x.airId === this.newenquiryForm.value.flightNo)[0]?.flight || '',

        backupShippingLine: this.newenquiryForm.value.backupShippingLine,
        backupShippingLineName: this.shippingLineList?.filter((x) => x.shippinglineId === this.newenquiryForm.value.backupShippingLine)[0]?.name,

        transhipmentHop1id: this.newenquiryForm.value.transhipment1,
        transhipmentHop1: this.portList?.filter(x => x.portId === this.newenquiryForm.value.transhipment1)[0]?.portName ||'',
        transhipmentHop1ETA: this.newenquiryForm.value.transhipment1ETA,
        transhipmentHop1ETD: this.newenquiryForm.value.transhipment1ETD,

        transhipmentHop2id: this.newenquiryForm.value.transhipment2,
        transhipmentHop2: this.portList?.filter(x => x.portId === this.newenquiryForm.value.transhipment2)[0]?.portName ||'',
        transhipmentHop2ETA: this.newenquiryForm.value.transhipment2ETA,
        transhipmentHop2ETD: this.newenquiryForm.value.transhipment2ETD,

        vesselId: this.newenquiryForm.value.vessel,
        vesselName: this.vesselList?.filter((x) => x.vesselId === this.newenquiryForm.value.vessel)[0]?.vesselName,
        voyageNumber: this.newenquiryForm.value.voyageNumber,

        movementType: this.newenquiryForm.value.movementType,
        movementLocation: this.locationList?.filter((x) => x.locationId === this.newenquiryForm.value.movementLocation)[0]?.locationName,
        movementLocationId: this.newenquiryForm.value.movementLocation,

        destuffingType: this.newenquiryForm.value.destuffingType,
        destuffingLocation: this.locationList?.filter((x) => x.locationId === this.newenquiryForm.value.destuffingLocation)[0]?.locationName,
        destuffingLocationId: this.newenquiryForm.value.destuffingLocation,

        etd: this.newenquiryForm.value.etd,
        eta: this.newenquiryForm.value.eta,
      },

      looseCargoDetails: this.showContainer ? {
        grossWeight : this.totalGrossWeight?.toString() || '0',
        grossVolume : this.totalVolume?.toString() || '0',
      } : {
        grossWeight : this.totalGrossWeight?.toString() || '0',
        grossVolume : this.totalVolume?.toString() || '0',
        ...this.empForm.value},
      containersDetails:this.addContainerValue(),
      // containerNo:this.newenquiryForm.value.containerNo,
        
      
       
      invoicesDetails: this.addInvoiceValue(),
      transportDetails: {
        preCarriage: this.newenquiryForm.value.preCarriage,
        onCarriage: this.newenquiryForm.value.onCarriage,
        origin: this.newenquiryForm.value.preCarriage ? this.addTransportValue() : [],
        destination: this.newenquiryForm.value.onCarriage ? this.addTransport1Value() : []
      },
      insurance: {
        cargo: this.newenquiryForm.value.cargo || false,
        emptyContainer: this.newenquiryForm.value.emptyContainer || false,
        palletization: this.newenquiryForm.value.palletization || false,
        fumigation: this.newenquiryForm.value.fumigation || false,
        warehousing: this.newenquiryForm.value.warehousing || false,
      },
      remarks: this.newenquiryForm.value.remarks,
      detentionDetails: {
        destinationCarrierFD: this.newenquiryForm.value.destinationCarrierFD,
        destinationPortFD: this.newenquiryForm.value.destinationPortFD,
        originCarrierFD: this.newenquiryForm.value.originCarrierFD,
        lastFDDatePOD: this.newenquiryForm.value.lastFDDatePOD,
        lastFDDatePOCD: this.newenquiryForm.value.lastFDDatePOCD,
        lastFDDateEmptyReturn: this.newenquiryForm.value.lastFDDateEmptyReturn,
        lastFDDateCarrier: this.newenquiryForm.value.lastFDDateCarrier,
      },
      enquiryStatusCustomer: 'Requested',
      customDetails: {
        clearanceDate: this.newenquiryForm.value.clearanceDate,
        clearanceDestination: this.newenquiryForm.value.clearanceDestination,
        transportDestination: this.newenquiryForm.value.transportDestination,
        IFSFiledById: this.newenquiryForm.value.ISFFiledBy,
        IFSFiledBy: this.ISFList?.filter(x => x.systemtypeId === this.newenquiryForm.value.ISFFiledBy)[0]?.typeName || '',


        customDestinationLocation: this.newenquiryForm?.value.customDestinationLocation,
        customDestinationLocationName: this.locationList.filter(x => x.locationId === this.newenquiryForm.value.customDestinationLocation)[0]?.locationName,
        customDestination: this.newenquiryForm?.value.customDestination,

      },

      enquiryStatus: pending ? 'Inquiry Draft' : 'Inquiry Created',
      agentAdviseStatus: pending ? 'Inquiry Draft' : 'Inquiry Created',
      status: true,

    };
    console.log(newAgentAdvice)
    // return
    this.Creating=true;
    let url;
    if (this.id) {
      url = this.commonService.UpdateToST(`agentadvice/${this.id}`, newAgentAdvice)
    } else {
      url = this.commonService.addToST('agentadvice', newAgentAdvice)
    }


    url?.subscribe((res: any) => {
      if (res) {
        if (this.id) { this.notification.create('success', ' Updated Successfully', ''); }
        else { this.notification.create('success', 'Saved Successfully', ''); }
        setTimeout(() => { this.router.navigate(["/agent-advice/list"]); this.Creating=false;}, 500);
      }
    })

  }
  draftPending1() {
    if (this.agentAdviceDetails?.agentAdviseStatus == 'Inquiry Created') {
      return true
    }
    return false
  }
  onClose(evt) {
    this.CloseNew.emit(evt);
  }

  openHaz: boolean;
  odc: boolean;
  refer: boolean;

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
  currentScrollPosition: number;
  saveScrollPosition() {
    this.currentScrollPosition = this.document.documentElement.scrollTop || this.document.body.scrollTop;
  }
  restoreScrollPosition() {
    this.renderer.setProperty(this.document.documentElement, 'scrollTop', this.currentScrollPosition);
    this.renderer.setProperty(this.document.body, 'scrollTop', this.currentScrollPosition);
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


  closePopup() {
    this.modalService.dismissAll();
  }

  onCancel() {
    this.router.navigate(["/agent-advice/list"]);
  }

  deleteCommodity(remark, content1) {
    this.modalService.open(content1, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'sm',
      ariaLabelledBy: 'modal-basic-title'
    }).result.then((result) => {

      if (result === 'yes') {
        this.commodityArray = this.commodityArray.filter(item => item.productId !== remark.productId);
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


  // changeFromDate() {
  //   this.enquiryDateValid = true
  //   this.newenquiryForm?.controls.bookingValidityDate.setValue('')
  // }

  disabledEtaDate = (current: Date): boolean => {
    return differenceInCalendarDays(current, new Date()) < 0;
  };
  // disabledEtdDate = (current: Date): boolean => {
  //   this.enquiryDateValid = true
  //   if (this.newenquiryForm?.controls.bookingDate.value)
  //     return (
  //       differenceInCalendarDays(
  //         current,
  //         new Date(this.newenquiryForm.controls.bookingDate.value)
  //       ) < 0
  //     );
  //   else return false;
  // };
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }


  BookingdownloadFile() {
    if (this.newenquiryForm?.value.msdsDoc === '') {
      return false
    }
    this.commonService.DocumentPreview(this.msdsDocURL, "Product")
  }


  setParty(e) {

    let data = this.partyMasterNameList?.filter((x) => x?.partymasterId == e)[0];
    if (data) {
      this.billingBranchList = data?.branch
      // this.newenquiryForm.get('billingAddress').setValue(data?.addressInfo?.address || '')
      this.newenquiryForm.get('ops_coordinator').setValue(data?.opsName || '')
      this.newenquiryForm.get('sales_person').setValue(data?.saleName || '')
    }
  }
  billingBranchList1: any = [];
  billingBranchList2: any = [];
  setParty1(e) {

    let data = this.partyMasterNameList?.filter((x) => x?.partymasterId == e)[0];
    if (data) {
      this.billingBranchList1 = data?.branch
    }
  }
  setParty2(e) {

    let data = this.partyMasterNameList?.filter((x) => x?.partymasterId == e)[0];
    if (data) {
      this.billingBranchList2 = data?.branch
      if (this.agentAdviceDetails?.enquiryStatus == "Inquiry Received") {
        this.newenquiryForm.patchValue({
          shipperAddress: `${this.billingBranchList2[0]?.branch_address},${this.billingBranchList2[0]?.branch_city}` || ''
        })
      }


    }
  }
  setShipper(e) {
    if (!e) { return false }
    let data = this.partyMasterNameList?.filter((x) => x?.partymasterId === e)[0];
    if (data) {
      this.newenquiryForm.get('shipperAddress').setValue(data?.addressInfo?.address || '')
    }
  }
  setConsignee(e) {
    if (!e) { return false }
    let data = this.partyMasterNameList?.filter((x) => x?.partymasterId === e)[0];
    if (data) {
      this.newenquiryForm.get('consigneeAddress').setValue(data?.addressInfo?.address || '')
    }
  }




  changeCommodity() {

    let data = this.cargoTypeList.filter(x => x.systemtypeId === this.commodityForm.value.commodityType)[0]?.typeName || ''
    if (data.toLowerCase() == 'haz') {
      // this.commodityForm.controls['msdsDoc'].setValidators(Validators.required)
      // this.commodityForm.controls['msdsDoc'].updateValueAndValidity()
      this.openHaz = true
    } else {
      this.openHaz = false;
      // this.commodityForm.controls['msdsDoc'].clearValidators()
      // this.commodityForm.controls['msdsDoc'].updateValueAndValidity()
    }

    if (data.toLowerCase() == 'odc') {
      return
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
      return
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
      return
      this.commodityForm.controls['Range'].setValidators(Validators.required)
      this.commodityForm.controls['Range'].updateValueAndValidity()
      this.commodityForm.controls['To'].setValidators(Validators.required)
      this.commodityForm.controls['To'].updateValueAndValidity()
      this.commodityForm.controls['typeTemp'].setValue('C');
      this.commodityForm.controls['typeTemp'].setValidators(Validators.required)
      this.commodityForm.controls['typeTemp'].updateValueAndValidity()
      this.refer = true
    } else {
      return
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
  msdDOC: any; filechange(event: any) {
    this.msdDOC = '';
    this.msdDOC = event.target.files[0];
    this.commodityForm?.get('msdsDoc').setValue(event.target.files[0]);
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

  getContainerControls(): AbstractControl[] {
    return (this.newenquiryForm.get('container') as FormArray).controls;
  }
  getInvoiceControls(): AbstractControl[] {
    return (this.newenquiryForm.get('invoices') as FormArray).controls;
  }

  addContainerRow(item?: any): void {
    const row = this.formBuilder.group({
      containerNo: [item ? item.containerNo : ''],
      wagonType: [item ? item.wagonType : null],
      truckType: [item ? item.truckType : null],
      containerType: [item ? item.containerType : null],
      noOfContainer: [item ? item.noOfContainer : 1],
      grossWeight: [item ? item.grossWeightContainer : '',],
      unit: [item ? item.unit : '',]
    });

    (this.newenquiryForm.get('container') as FormArray).push(row);
  }
  addInvoiceRow(item?: any): void {
    const row = this.formBuilder.group({
      invoiceNo: [item ? item.invoiceNo : ''],
      invoiceDate: [item ? item.invoiceDate : ''],
    });

    (this.newenquiryForm.get('invoices') as FormArray).push(row);
  }
  deleteRow(index: number, key): void {
    (this.newenquiryForm.get(key) as FormArray).removeAt(index);
  }

  addContainerValue() {
    const containerArray = [];
    this.getContainerControls().forEach(element => {
      let container = {
        typeOfWay: this.typeOfWay || '',
        truckType: element.value.truckType || '',
        wagonType: element.value.wagonType || '',
        containerType: element.value.containerType || '',
        grossWeight:element.value.grossWeight || '',
        noOfContainer: element.value.noOfContainer || '',
        grossWeightContainer: element.value.grossWeight || 0,
        unit: element.value.unit || '',
        unitName: this.uomData.filter(x => x.uomId === element.value.unit)[0]?.uomShort || '',
      }
      containerArray.push(container)
    });
    return containerArray;
  }

  addInvoiceValue() {
    const containerArray = [];
    this.getInvoiceControls().forEach(element => {
      let container = {
        invoiceNo: element.value.invoiceNo,
        invoiceDate: element.value.invoiceDate,
      }
      containerArray.push(container)
    });
    return containerArray;
  }
  getChargecontainerLength(key): number {
    return (this.newenquiryForm.get(key) as FormArray).length;
  }




  getChargeControlsLength(): number {
    return (this.newenquiryForm.get('charge') as FormArray).length;
  }


  enquiryUpdate(agentadviseData?) {
    let url = `agentadvice/${this.id}`
    let data = {
      ...agentadviseData, agentAdviseStatus: 'Inquiry Accepted'
    }
    this.commonService.UpdateToST(url, data).subscribe()
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


  getTransportControls(): AbstractControl[] {
    return (this.newenquiryForm.get('transport') as FormArray).controls;
  }
  getTransport1Controls(): AbstractControl[] {
    return (this.newenquiryForm.get('transport1') as FormArray).controls;
  }


  addTransportRow(item?: any, i?: any): void {
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
      (this.newenquiryForm.get('transport') as FormArray).push(row);
    } else {
      this.addRowToSecondLastPosition(row)
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
  setValidationFromArray() {
    this.transport.controls.forEach((control: FormGroup, index) => {
      return
      if (this.newenquiryForm.value.preCarriage) {
        if (index + 1 < this.transport.controls?.length) {
          control.get('transit').setValidators(Validators.required);
          control.get('carrier').setValidators(Validators.required);
          control.get('etd').setValidators(Validators.required);
        }
        if (index !== 0) {
          control.get('eta').setValidators(Validators.required);
        }
        if (control.get('locationType').value == 'address') {
          control.get('addressId').setValidators(Validators.required);
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
          control.get('addressId').setValidators(Validators.required);
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

    this.transport.at(this.transport?.controls?.length - 1).get('location').setValue(this.newenquiryForm.value.load_port || '')
    this.transport.at(this.transport?.controls?.length - 1).get('locationType').setValue('port')
    this.transport1.at(0).get('location').setValue(this.newenquiryForm.value.discharge_port || '')
    this.transport1.at(0).get('locationType').setValue('port')
  }

  get transport(): FormArray {
    return this.newenquiryForm.get('transport') as FormArray;
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
  addTransportValue() {
    const transportArray = [];
    this.getTransportControls().forEach(element => {
      const selectedBranch = this.billingBranchList?.find((x) => x.branch_name === element.value.address);

      let transport = {
        locationType: element.value.locationType || '',
        location: element.value.location || '',
        locationName: element.value.locationType === 'location' ? this.locationList?.filter((x) => x.locationId == element.value.location)[0]?.locationName || '' :
          this.portList?.filter((x) => x.portId == element.value.location)[0]?.portName || '',
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
  addTransport1Value() {
    const transportArray = [];
    this.getTransport1Controls().forEach(element => {
      const selectedBranch = this.billingBranchList?.find((x) => x.branch_name === element.value.address);

      let transport = {
        locationType: element.value.locationType || '',
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




  searchPort(event,type) { 
    // this.portList1 = [] 
    // this.portList2 = [] 
  
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
