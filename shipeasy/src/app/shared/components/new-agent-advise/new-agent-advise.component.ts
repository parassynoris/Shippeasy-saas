import { Component, OnInit, Output, EventEmitter, Input, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ApiService } from 'src/app/admin/principal/api.service';
import { BaseBody } from 'src/app/admin/smartagent/base-body';
import { shared } from '../../data';
import { differenceInCalendarDays } from 'date-fns';
import * as Constant from 'src/app/shared/common-constants';
import { CommonFunctions } from '../../functions/common.function';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { ApiSharedService } from '../api-service/api-shared.service';
import { CommonService } from '../../../services/common/common.service';
import { Subject } from 'rxjs';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { LoaderService } from 'src/app/services/loader.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { AgentAdvice } from 'src/app/models/agent-advise';
import { Location, PartyMaster } from 'src/app/models/vendor-master';
import { Currency, SystemType } from 'src/app/models/cost-items';
import { Port } from 'src/app/models/tariff-list';
import { User } from 'src/app/models/userprofile';
import { Product } from 'src/app/models/addproduct';
import { ShippingLine } from 'src/app/models/shipping-line';
import { Department } from 'src/app/models/add-agent-advise';
import { Vessel } from 'src/app/models/vessel-master';
import { MyData } from 'src/app/models/Vessel-voyage';
import { Container } from 'src/app/models/container-master';

@Component({
  selector: 'app-new-agent-advise',
  templateUrl: './new-agent-advise.component.html',
  styleUrls: ['./new-agent-advise.component.scss']
})
export class NewAgentAdviseComponent implements OnInit, OnDestroy {
  @ViewChild('importagentadvice') content;
  @ViewChild("agentAdviceError") block;
  private ngUnsubscribe = new Subject<void>();
  @Output() CloseNew = new EventEmitter<string>();
  @Input() isshowDetails: boolean = false;
  @Input() isshowDetails1: boolean = false;
  show: boolean = false;
  chargedData: any = [];
  freightChargedData: any = [];
  @Input() isPage: any;
  @Input() importAgentAdviceDetail: any;
  @Input() enquiryId: any;
  newenquiryForm: FormGroup;
  submitted = false;
  submitted1: boolean = false
  currentUrl: any;
  prodectForm: FormGroup;
  chargesData = shared.chargeRows;
  remarksForm: FormGroup
  newRemark: any
  remarksArray: any = []
  id: any
  isAddMode: any
  baseBody: any
  agentAdviceDetails: AgentAdvice;
  shipperList: PartyMaster[] = []
  bookingpartyList: PartyMaster[] = []
  invoicingpartyList: PartyMaster[] = []
  forwarderChaList: PartyMaster[] = []
  consigneeList: PartyMaster[]  = []
  ops_coordinator: PartyMaster[] = []
  partyMasterNameList: PartyMaster[] = []
  enquirytypeList: SystemType[] = []
  shippingtermList: any = []
  tanktypeList: any = []
  shipmenttermList: SystemType[] = []
  movetypeList: SystemType[] = []
  incotermList: SystemType[] = []
  packinggroupList: SystemType[] = []
  haulagetypeList: SystemType[] = []
  chargetermList: SystemType[] = []
  portList: Port[] = []
  currencyList: Currency[] = []
  userList: any= []
  productList: Product[] = [];
  contactList: Product[] = [];
  shippingLineList: ShippingLine[] = [];
  partymasterList: PartyMaster[] = [];
  processPointList: SystemType[] = [];
  statusList: SystemType[] = [];
  locationList: Location[] = [];
  preCarrigeList: Location[] = [];
  userData: any;
  productShippingName: any;
  IMCOClass: any;
  VesselUNNo: any;
  PackingGroup: any;
  Density: any;
  IsEditRemarks: number = 0;
  costItemList: any = [];
  callapseALL: boolean = false;
  isEditMode: boolean = false;
  containerTypeList: SystemType[] = [];
  containerSizeList: SystemType[] = [];
  preCarrigeList1: any = [];
  productId: any;
  customerList: SystemType[] = [];
  contractList: SystemType[] = [];
  opsCordinatorList: any = [];
  batchMasterList: SystemType[] = [];
  Flash_point: any;
  @ViewChild('expand') expand: ElementRef;
  expandKeys = "panelsDetails panelsProduct panelsContainer panelsShipper panelsRoute panelsdetention  panelsCharges pannelRemarks"
  expandKeys1 = "panelsDetails "
  locatioName: any;
  departmentList: Department[] = [];
  D = new Date();
  currentDate: any =
    this.D.getDate() + '/' + this.D.getMonth() + '/' + this.D.getFullYear();
  marinePollution: any = '';
  cargoTypeList: SystemType[] = [];
  isAgentAdvise: boolean = false;
  ICDlocationList: Location[] = [];
  vesselList: Vessel[] = [];
  voyageList: MyData[] = [];
  vendorList: PartyMaster[] = [];
  custTypeList: SystemType[] = []
  paymentTermList: any = []
  ContainerList: any = [];
  ReferencesList: any = [];
  countryList: Currency[] = [];
  emsCode: any;
  imcoList: any;
  enquiryDateValid: boolean = false;
  containerMasterList: Container[] = [];
  custNameList: PartyMaster[] = [];
  onCarrigeList: SystemType[] = [];
  agentAdviceErrorList: any = [];
  settings = {
    singleSelection: false,
    idField: 'item_id',
    textField: 'item_text',
    enableCheckAll: false,
    allowSearchFilter: true,
    limitSelection: -1,
    clearSearchFilter: true,
    maxHeight: 197,
    itemsShowLimit: 3,
    closeDropDownOnSelection: false,
    showSelectedItemsAtTop: false,
    defaultOpen: false,
  };
  containerForm = new FormGroup({
    containerDetails: new FormArray([])
  })
  entityForm: FormGroup
  idToUpdate: any;
  Documentpdf: string;
  get f() {
    return this.newenquiryForm.controls;
  }
  editEDI: boolean = false
  constructor(
    private router: Router,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private notification: NzNotificationService,
    private _api: ApiService,
    private route: ActivatedRoute,
    private commonFunction: CommonFunctions,
    private tranService: TransactionService,
    private apiSharedService: ApiSharedService,
    private commonService: CommonService,
    private mastersService: MastersService,
    private loaderService: LoaderService,private cognito : CognitoService,
  ) {
    this.tasks()

    this.formBuild();
  }
  tasks() {
    this.getproductDropDowns();
    this.getPartyMasterDropDowns();
    this.getCurrencyDropDowns()
    this.getPortDropDowns()
    this.getUsersForDropDown()
    this.getCarriageDropDowns()
    this.getShippingLineDropDowns()
    this.getContractDropDowns()
    this.getLocationDropDowns()
    this.getDepartmentList()
    this.getCustomerType()
    this.getVesselListDropDown()
    this.getVoyageListDropDown();
    this.getCountryList()
    this.getContainerData()
    this.getSystemTypeDropDowns()
  }

  formBuild(data?) {
    this.enquiryDateValid = data?.basicDetails?.enquiryValid || false
    this.editEDI = data?.agentAdviceType === 'EDI' ? true : false
    this.newenquiryForm = this.formBuilder.group({
      status: [data ? data?.agentAdviseNo : true],
      agentNo : [data ? data?.agentadviceNo : ''],
      uniqueRefNo: [data ? data?.basicDetails?.uniqueRefNo : '', Validators.required],
      agentAdviceDate: [data ? data?.basicDetails?.agentAdviceDate : new Date(), Validators.required],
      stcReference: [data ? data?.basicDetails?.stcReference : '', Validators.required],
      stcQutationNo: [data ? data?.basicDetails?.stcQutationNo : '', Validators.required],
      versionNo: [data ? data?.basicDetails?.versionNo : '', Validators.required],
      moveNo: [data ? data?.basicDetails?.moveNo : '' ],

      paymentTerm: [data ? data?.basicDetails?.paymentTerm : '', Validators.required],
      moveType: [data ? data?.basicDetails?.moveTypeId : '', Validators.required],
      noOfContainer: [data ? data?.basicDetails?.noOfContainer : '0'],
      destination: [data ? data?.basicDetails?.destinationId : ''],
      origin: [data ? data?.basicDetails?.origin : ''],
      shippping_term: [data ? data?.basicDetails?.shipppingtermId : '', Validators.required],
      tradeRoute: [data ? data?.basicDetails?.tradeRoute : ''],

      exitPort: [data ? data?.routeDetails?.exitPortId : '', Validators.required],
      exitPortUN: [data ? data?.routeDetails?.exitPortUN : '', Validators.required],
      exitPortDateEA: [data ? data?.routeDetails?.exitPortDateEA : ''],
      entryPort: [data ? data?.routeDetails?.entryPortId : '', Validators.required],
      entryPortUN: [data ? data?.routeDetails?.entryPortUN : '', Validators.required],
      entryPortDate: [data ? data?.routeDetails?.entryPortDate : '', Validators.required],

      deliveryPlace: [data ? data?.routeDetails?.deliveryPlaceId : ''],
      shipping_line: [data ? data?.routeDetails?.shippingLineId : '', Validators.required],
      bol: [data ? data?.routeDetails?.bol : '', Validators.required],
      mainVessel: [data ? data?.routeDetails?.plannedVesselId : ''],
      mainVoyage: [data ? data?.routeDetails?.plannedVoyageName : ''],
      productName: [data ? data?.productDetails?.product : '', Validators.required],
      proper_shipping_name: [data ? data?.productDetails?.properShippingName : '', Validators.required],
      imco_class: [data ? data?.productDetails?.imcoClass : ''],
      un_no: [data ? data?.productDetails?.unNo : ''],
      marine_pollution: [data ? data?.productDetails?.marinePollutionId : '', Validators.required],
      EMSCode: [data ? data?.productDetails?.emsCode : ''],
      packing_group: [data ? data?.productDetails?.packingGroup : ''],
      flashPoint: [data ? data?.productDetails?.flashPoint : '', Validators.required],
      gravity: [data ? data?.productDetails?.gravity : '', Validators.required],
      Haz: [data ? data?.productDetails?.Haz : true],

      DemurrageFreeDays: [data ? data?.detentionDetails?.demurrageFreeDays : '', Validators.required],
      DemurrageCurrency: [data ? data?.detentionDetails?.demurrageCurrencyId : '', Validators.required],
      DemurrageAmount: [data ? data?.detentionDetails?.demurrageAmount : ''],
      DemurrageChanged: [data ? data?.detentionDetails?.demurrageChanged : true],
      DemurrageName: [data ? data?.detentionDetails?.demurrageName : ''],

      TruckingFreeHours: [data ? data?.detentionDetails?.truckingFreeHours : ''],
      TruckingCurrency: [data ? data?.detentionDetails?.truckingCurrencyId : ''],
      TruckingPrice: [data ? data?.detentionDetails?.truckingPrice : ''],
      TruckingChanged: [data ? data?.detentionDetails?.truckingChanged : true],

      operatorName: [data ? data?.detentionDetails?.operatorName : '', Validators.required],
      operatorPhone: [data ? data?.detentionDetails?.operatorPhone : '', Validators.required],
      operatorMail: [data ? data?.detentionDetails?.operatorMail : '', Validators.required],
    });
    if (data?.partyDetails) {
      this.partyArray = data.partyDetails
    }
    if (data?.containers) {
      this.addConatinerArray(data?.containers)

    }
    this.remarksForm = this.formBuilder.group({
      processPoint: [''],
      date: [''],
      fromUser: [''],
      toUser: [''],
      status: [''],
      remarks: [''],
      department: ['']
    })
    this.entityForm = this.formBuilder.group({
      partyType: ['', Validators.required],
      customerName: ['', Validators.required],
      address: [''],
      partyCode: [''],
      city: [''],
      postalCode: [''],
      state: [''],
      country: ['']
    })
  }
  get f1() {
    return this.entityForm.controls;
  }
  fileNameAgentAdvice: any = 'NA'
  CustomerTypeList: SystemType[] = []
  getCustomerType() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      typeCategory: 'customerType', status: true,
    }
    this.commonService.getSTList('systemtype', payload)
      ?.subscribe((res: any) => {
        let customerTypeListHold = []
        this.CustomerTypeList = res.documents;


      });
  }
  ngOnInit(): void {
    // this.userData = this.commonFunction.getUserDetails();
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.userData  = resp
      }
    }) 
    this.currentUrl = this.router.url.split('?')[0].split('/').pop()
    this.id = this.route.snapshot.params['id'];
    this.fileNameAgentAdvice = this.route.snapshot.queryParams['fileName']
    this.isAddMode = !this.id;
    if (!this.isAddMode) {
      this.isEditMode = true;
      this.getAgentAdviceById(this.id);
    }
  }
  showNotification() {

    if (this.newenquiryForm.invalid || this.agentAdviceErrorList?.length !== 0) {
      const invalid = [];
      const controls = this.newenquiryForm.controls;
      for (const name in controls) {
        if (controls[name].invalid) {
          invalid.push(name);
        }
      }



      for (let i = 0; i < invalid?.length; i++) {

        if (invalid[i] === 'productName') {
          this.agentAdviceErrorList.push(`Please add Proper shipping Name field and then try to upload`)
        }
        else {
          this.agentAdviceErrorList.push(`Please add ${invalid[i]} field and then try to upload`)

        }
      }


      this.commonService.agentAdviseData = []

      if (this.agentAdviceErrorList) {
        this.modalService.open(this.block, {
          ariaLabelledBy: 'modal-basic-title',
          backdrop: 'static',
          keyboard: false,
          centered: true,
          size: 'lg',
        });
      }
      this.router.navigate(["/agent-advice/list"]);
    }
    else {
      let data = []
      if (Object.keys(this.ContainerList)[0] == '0') {
        this.ContainerList.filter((x) => {
          if (x?.ContainerNumber?._text)
            data.push(x)
        })
      }
      else {
        data.push(this.ContainerList)
      }

      let container = data.map(x => {
        return {
          containerId: this.containerNoList.filter(i => i.containerNo === x?.ContainerNumber?._text)[0]?.containermasterId,
          containerNo: x?.ContainerNumber?._text ? x?.ContainerNumber?._text : '',
          sealNo: x?.TankSeals?.Seal?._text ? x?.TankSeals?.Seal?._text : '',
          netWeight: x?.NetWeight?._text ? x?.NetWeight?._text : '',
          grossWeight: x?.GrossWeight?._text ? x?.GrossWeight?._text : '',
          weightUOM: x?.Unit?._text ? x?.Unit?._text : '',
          manufactureDate: x?.ManufactureDate?._text ? this.formatDate(x?.ManufactureDate?._text) : '',
          containerStatus: this.containerNoList.filter(i => i.containerNo === x?.ContainerNumber?._text)[0]?.containerStatus,
        }
      })

      this.addConatinerArray(container)
      this.onSave()
    }

    this.submitted = true

  }
  checkAllRequired: boolean
  formatDate(data) {
    let year = data.slice(0, 4)
    let month = data.slice(4, 6)
    let date = data.slice(6, 8)
    return `${year}-${month}-${date}`

  }
  partyList: any = []
  setPartyData(data) {
    data.forEach(element => {
      this.partyArray.push({
        partyType: element?.AddressCode?._text === 'SH' ? 'Shipper' : element?.AddressCode?._text === 'CN' ? 'Consignee' : element?.AddressCode?._text === 'CR' ? 'Container Return' : element?.AddressCode?._text === 'N1' ? 'Notify Party 1' : element?.AddressCode?._text === 'N2' ? 'Notify Party 2' : element?.AddressCode?._text === 'N3' ? 'Notify Party 3' : '',
        customerName: element?.Name?._text,
        partyCode: element?.PartyCode?._text,
        addressLine1: element?.AddressLine1._text,
        addressLine2: element?.AddressLine2?._text,
        addressLine3: element?.AddressLine3?._text,
        city: element.City?._text,
        postalCode: element.PostalCode?._text,
        state: element.StateCounty?._text,
        country: element.Country?._text,
      })
    });
  }
  isEdi: boolean = false
  setExcelData() {
    this.isAgentAdvise = true

    if (this.importAgentAdviceDetail?.Record) {
      this.isEdi = true
      this.checkAllRequired = false;
      this.ContainerList = this.importAgentAdviceDetail?.Record?.Containers?.Container

      this.ReferencesList = this.importAgentAdviceDetail?.Record?.References?.Reference
      this.partyList = this.importAgentAdviceDetail?.Record?.Parties?.Party
      this.setPartyData(this.partyList)

      let data = this.importAgentAdviceDetail?.Record
      this.newenquiryForm.patchValue({

        uniqueRefNo: data?.UniqueRef?._text || '',
        stcReference: data?.STCReference?._text || '',
        stcQutationNo: data?.QuoteNumber?._text || '',
        versionNo: data?.VersionNo?._text || '',

        moveNo: this.ReferencesList.filter((x) => x?.ReferenceCode?._text?.toLowerCase() === 'move')[0]?.ReferenceVal?._text || '',

        paymentTerm: this.paymentTermList.filter((x) => x?.typeName?.toLowerCase() === (data?.Terms?._text === 'P') ? 'prepaid' : 'collect')[0]?.systemtypeId || '',
        moveType: this.tanktypeList.filter((x) => x?.typeName?.toLowerCase() === data?.MoveType?._text?.toLowerCase())[0]?.systemtypeId || '',
        noOfContainer: data?.NumberOfContainers?._text || "0",
        destination: data?.Routing?.EntryPort?._text,
        origin: data?.Routing?.ExitPort?._text,
        shippping_term: this.shippingtermList.filter((x) => x?.typeName?.toLowerCase() === (data?.Terms?._text === 'P') ? 'pier to pier' : 'door to door')[0]?.systemtypeId || '',
        tradeRoute: data?.TradeRoute?._text,

        exitPort: this.portList.filter(x => x.portDetails?.description === data?.Routing?.ExitUNLOC?._text)[0]?.portId,
        exitPortUN: data?.Routing?.ExitUNLOC?._text,
        exitPortDateEA: data?.Routing?.ExitDate?._text?.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"),
        entryPort: this.portList.filter(x => x.portDetails?.description === data?.Routing?.EntryUNLOC?._text)[0]?.portId,
        entryPortUN: data?.Routing?.EntryUNLOC?._text,
        entryPortDate: data?.Routing?.EntryDate?._text?.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"),

        deliveryPlace: this.locationList.filter((x) => x?.locationName?.toLowerCase() === data?.DeliveryPlace?._text?.toLowerCase())[0]?.locationId || '',

        shipping_line: this.shippingLineList.filter(x => x.name?.toLowerCase() === data?.Vessel?.ShippingLine?._text?.toLowerCase())[0]?.shippinglineId,

        bol: data?.Vessel?.BOL?._text,

        mainVessel: data?.Vessel?.MainVessel?._text,
        mainVoyage: data?.Vessel?.MainVoyage?._text,

        productName: this.productList.filter(x => x.psn?.replace(/\s/g, "").toLowerCase() === data?.Product?.PSN?._text?.replace(/\s/g, "").toLowerCase())[0]?.productId,
        proper_shipping_name: data?.Product?.PSN?._text,
        imco_class: data?.Product?.IMO?._text,
        un_no: data?.Product?.UNNo?._text,
        marine_pollution: data?.Product?.MarinePollution?._text === 'Y' ? 'Yes' : 'No',
        EMSCode: data?.Product?.EMS?._text,
        packing_group: data?.Product?.PackingGroup?._text,
        flashPoint: data?.Product?.FlashpointC?._text,
        gravity: data?.Product?.SpecificGravity?._text,
        Haz: data?.Product?.Haz?._text === 'Y' ? true : false,

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


      this.productData()
      this.getContainerMaster()

    }
  }
  getContainerMaster() {
    let data = []
    if (Object.keys(this.ContainerList)[0] == '0') {
      this.ContainerList.filter((x) => {
        if (x?.ContainerNumber?._text)
          data.push(x?.ContainerNumber?._text?.toString())
      })
    }
    else {
      data.push(this.ContainerList?.ContainerNumber?._text)
    }
    if (data) {
      let payload = this.commonService.filterList()
      payload.query = {
        status: true,
        "typeCategory": {
          "$in": data
        }
      }
      this.commonService.getSTList('containermaster', payload).subscribe((res: any) => {
        this.containerMasterList = res?.documents;
        let hasAnyError = 0
        data.forEach((e) => {
          let number = e.trim()
          if (this.containerMasterList.filter((x) => (x?.containerNo).trim() === number).length === 0) {

            hasAnyError += 1
            this.agentAdviceErrorList.push(`Please add ${e} containers in Masters and then try to upload `)
          }
        })
        if (this.isAddMode) {
          this.showNotification()

        }
      });
    }
  }
  containerNoList: any = []
  listOfTagOptions: any = []
  containerNoListOptions: any = []
  filterContainer: any = []
  getContainerData() {

    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = { status: true }
    this.commonService.getSTList('containermaster', payload)?.subscribe((res: any) => {
      this.containerNoList = res?.documents;
      let containerNoHold = []
      this.containerNoList.forEach(e => {
        containerNoHold.push({
          item_id: e.containermasterId,
          item_text: e.containerNo,
          item_date: e.dateOfManufacture
        })

      })
      this.containerNoListOptions = containerNoHold
      this.filterContainer = containerNoHold

    })
  }
  get containerArray() {
    return (this.containerForm.get('containerDetails') as FormArray)
  }

  containerData() {
    return (this.containerForm.get('containerDetails') as FormArray).controls
  }
  addListData() {
    this.modalService.dismissAll();

    let data = this.listOfTagOptions.map(element => {
      return {
        containerNo: element?.item_text,
        containerId: element?.item_id,
        manufactureDate: this.containerNoListOptions.filter(x => x.item_id === element.item_id)[0]?.item_date,
        containerStatus: this.containerNoList.filter(x => x.containermasterId === element.item_id)[0]?.containerStatus
      }
    })

    this.addConatinerArray(data)

    for (let i = 0; i < this.filterContainer.length; i++) {
      for (let j = 0; j < this.listOfTagOptions.length; j++) {
        if (this.filterContainer[i].item_id === this.listOfTagOptions[j].item_id) {
          this.filterContainer.splice(i, 1)
        }
      }
    }





  }
  addConatinerArray(data) {
    data.forEach(e => {
      this.containerArray.push(new FormGroup({
        containerId: new FormControl(e?.containerId ? e.containerId : ''),
        containerNo: new FormControl(e?.containerNo ? e?.containerNo : ''),
        sealNo: new FormControl(e?.sealNo ? e?.sealNo : ''),
        netWeight: new FormControl(e?.netWeight ? e?.netWeight : ''),
        grossWeight: new FormControl(e?.grossWeight ? e?.grossWeight : ''),
        weightUOM: new FormControl(e?.weightUOM ? e?.weightUOM : ''),
        manufactureDate: new FormControl(e?.manufactureDate ? e?.manufactureDate : ''),
        containerStatus: new FormControl(e?.containerStatus ? e?.containerStatus : '')

      }))
    })


  }
  deleteContainer(i, container) {
    let data = {
      item_text: container?.controls?.containerNo.value,
      item_id: container?.controls?.containerId.value,
      item_date: this.containerNoList.filter(x => x.containermasterId === container?.controls?.containerId.value)[0]?.dateOfManufacture
    }
    this.filterContainer.push(data)


    this.containerArray.removeAt(i)
  }

  getAgentAdviceById(id) {

    let payload = this.commonService.filterList()
    payload.query = { agentadviceId: this.id, }
    this.commonService.getSTList(Constant.AGENTADVICE_LIST, payload)
      .subscribe((res: any) => {
        this.agentAdviceDetails = res?.documents[0];
        this.formBuild(this.agentAdviceDetails)
        this.ContainerList = this.agentAdviceDetails?.containers
        this.ReferencesList = this.agentAdviceDetails?.basicDetails?.references
        this.getRemarks();
      })

  }

  saveCharges(res) {
    [...this.chargedData, ...this.freightChargedData].forEach((value, index) => {
      if ((value.agentadviceId !== this.id) || (value.enquiryitemId === null)) {
        this.chargedData[index] =
        {

          "tenantId": this.userData.tenantId,
          "enquiryitemId": value.enquiryitemId ? value.enquiryitemId : "",
          "enquiryId": res.agentadviceId,
          "agentadviceId": res.agentadviceId,
          "enquiryNumber": res?.payload?.enquiryNo || "",
          "enqDate": res?.payload?.basicDetails?.agentAdviceDate || "",
          "costitemGroup": value?.costitemGroup,
          "stcQuotationNo": this.newenquiryForm.value.stcQutationNo.toString(),
          "enqType": res?.payload?.basicDetails?.enquiryTypeName || "",
          "costItemId": value.costItemId,
          "accountBaseCode": value.accountBaseCode || "",
          "costItemName": value.costItemName,
          "costHeadId": value.costHeadId,
          "costHeadName": value.costHeadName,
          "amount": value.amount,
          "baseAmount": value.baseAmount,
          "tenantMargin": Number(value.tenantMargin),
          "tax": [
            {
              taxAmount: 0,
              taxRate: Number(value.gst)
            }
          ],
          "stcAmount": value.stcAmount ? Math.round(value.stcAmount) : 0,
          "jmbAmount": value.jmbAmount ? Math.round(value.jmbAmount) : 0,
          "payableAt": value.payableAt ? value.payableAt : "",
          "gst": Number(value.gst),
          "totalAmount": Math.round(value.totalAmount),
          "chargeTerm": value.chargeTerm,
          "remarks": value.remarks ? value.remarks : "",
          "containerNumber": value.containerNumber,
        }
        if (value.isFreight) {
          this.chargedData[index] = { ...this.chargedData[index], isFreight: true }
        }
      }
    });

    let addData = this.chargedData.filter(item => !item.enquiryitemId)
    addData = addData.map(item => [item]);
    if (addData.length > 0)
      this.apiSharedService.addEnquiryCharges(addData).subscribe((result) => {
        let data = result
      }, error => {
        this.notification.create(
          'error',
         error?.error?.error?.message,
          ''
        )
      });

    let updateData = this.chargedData.filter(item => item.enquiryitemId)
    updateData = updateData.map(item => [{ enquiryitemId: item.enquiryitemId }, { $set: item }]);
    if (updateData.length > 0)
      this.apiSharedService.updateEnquiryCharges(updateData).subscribe(result => {
        let data = result
      }, error => {
        this.notification.create(
          'error',
         error?.error?.error?.message,
          ''
        )
      });
  }

  onSave(evt?) {


    this.submitted = true;

    if (this.newenquiryForm.invalid) {
      this.notification.create
        ('error', 'Please fill the form', '');
      this.expand.nativeElement.click();
      return false
    }

    if (this.newenquiryForm.valid) {
      let formValue = this.newenquiryForm.value

      let newAgentAdvice = [{
        agentadviceId: this.id,
        agentadviceNo: '',
        orgId: this.commonFunction.getAgentDetails().orgId,
        "tenantId": this.userData.tenantId,
        basicDetails: {
          uniqueRefNo: formValue?.uniqueRefNo?.toString() || '',
          agentAdviceDate: formValue?.agentAdviceDate || '',
          stcReference: formValue?.stcReference?.toString() || '',
          stcQutationNo: formValue?.stcQutationNo?.toString() || '',
          versionNo: formValue?.versionNo?.toString() || '',
          moveNo: formValue?.moveNo?.toString() || '',
          references: this.ReferencesList,

          shipperId: formValue?.shipper,
          shipperName: this.partyMasterNameList.filter(x => x.partymasterId === formValue?.shipper)[0]?.name,
          paymentTerm: formValue?.paymentTerm,
          moveTypeId: formValue?.moveType,
          moveTypeName: this.tanktypeList.filter((x) => x?.systemtypeId === formValue?.moveType)[0]?.typeName,
          noOfContainer: formValue?.noOfContainer.toString() || '0',
          destinationId: formValue?.destination,
          destinationName: this.locationList.filter(x => x.locationId === formValue?.destination)[0]?.locationName,

          enquiryValid: this.enquiryDateValid,
          origin: formValue?.origin?.toString() || '',
          originNamme: this.locationList.filter(x => x.locationId === formValue?.origin)[0]?.locationName,
          shipppingtermId: formValue?.shippping_term,
          shippping_term: this.shippingtermList.filter((x) => x?.systemtypeId === formValue?.shippping_term)[0]?.typeName,
          tradeRoute: formValue?.tradeRoute?.toString() || '',


        },
        productDetails: {
          product: formValue?.productName,
          productName: this.productList.filter(x => x.productId === formValue?.productName)[0]?.productName,
          properShippingName: formValue?.proper_shipping_name,
          imcoClass: formValue?.imco_class,
          unNo: formValue?.un_no,
          packingGroup: formValue?.packing_group,
          flashPoint: formValue?.flashPoint,
          marinePollutionId: formValue?.marine_pollution,
          emsCode: formValue?.EMSCode,
          gravity: formValue?.gravity,
          Haz: formValue?.Haz,

        },
        partyDetails: this.partyArray,

        routeDetails: {
          exitPortId: formValue?.exitPort,
          exitPortName: this.portList.filter((x) => x?.portId === formValue?.exitPort)[0]?.portDetails?.portName,
          exitPortUN: formValue?.exitPortUN?.toString() || '',
          exitPortDateEA: formValue?.exitPortDateEA || '',
          entryPortId: formValue?.entryPort,
          state: this.locationList.filter(x => x.locationId === formValue.deliveryPlace)[0]?.state,
          entryPortName: this.portList.filter((x) => x?.portId === formValue?.entryPort)[0]?.portDetails?.portName,
          entryPortUN: formValue?.entryPortUN?.toString() || '',
          entryPortDate: formValue?.entryPortDate || '',

          deliveryPlaceId: formValue?.deliveryPlace,
          deliveryPlaceName: this.locationList.filter(x => x.locationId === formValue?.deliveryPlace)[0]?.locationName,

          shippingLineId: this.newenquiryForm.value.shipping_line,
          shippingLineName: this.shippingLineList.filter(x => x.shippinglineId === this.newenquiryForm.value.shipping_line)[0]?.name || '',
          bol: formValue?.bol?.toString() || '',
          plannedVesselId: formValue?.mainVessel,
          plannedVesselName : this.vesselList.filter((x) => x.vesselId === formValue?.mainVessel)[0].vesselName,
          plannedVoyageName: formValue?.mainVoyage,
        },
        detentionDetails: {
          demurrageFreeDays: formValue?.DemurrageFreeDays?.toString() || '',
          demurrageCurrencyId: formValue?.DemurrageCurrency,
          demurrageCurrencyName: this.currencyList.filter(x => x.currencyId === formValue?.DemurrageCurrency)[0]?.currencyShortName,
          demurrageAmount: formValue?.DemurrageAmount?.toString() || '',
          demurrageChanged: formValue?.DemurrageChanged || '',
          demurrageName: formValue?.DemurrageName || '',
          truckingFreeHours: formValue?.TruckingFreeHours?.toString() || '',
          truckingCurrencyId: formValue?.TruckingCurrency,
          truckingCurrencyName: this.currencyList.filter(x => x.currencyId === formValue?.TruckingCurrency)[0]?.currencyShortName,
          truckingPrice: formValue?.TruckingPrice?.toString() || '',
          truckingChanged: formValue?.TruckingChanged || '',
          operatorName: formValue?.operatorName,
          operatorPhone: formValue?.operatorPhone,
          operatorMail: formValue?.operatorMail,
        },
        containers: this.containerForm.value.containerDetails,
        remarks: "",
        agentAdviceType: this.isEdi ? 'EDI' : 'Manual',
        status:  true ,
      }];

      var url = this.commonService.addToST(Constant.AGENTADVICE_LIST, newAgentAdvice[0])
      if (!this.isAddMode) {
        url = this.commonService.UpdateToST(`${Constant.AGENTADVICE_LIST}/${newAgentAdvice[0].agentadviceId}`, newAgentAdvice[0])
      }
      url.subscribe((res: any) => {
        if (res) {
          this.saveRemarks(res?.agentadviceId)
          if (this.chargedData.length > 0 || this.freightChargedData.length > 0) {
            this.saveCharges(res);
          }

          if (this.isAddMode) {
            this.containerADD(res?.agentadviceId)
            this.notification.create(
              'success',
              'Saved Successfully',
              ''
            );
          }
          else {
            this.notification.create(
              'success',
              'Updated Successfully',
              ''
            );

          }
          this.CloseNew.emit(evt);

          setTimeout(() => {
            this.getAgentAdviseList('');

          }, 1000);
          this.router.navigate(["/agent-advice/list"]);

        }
      }, error => {
        this.notification.create(
          'error',
         error?.error?.error?.message,
          ''
        );
      });

    } else {
      return false;
    }
  }

  containerADD(id) {
    let containerArray = [];
    this.containerMasterList.forEach((element) => {
      containerArray.push({
        ...element,
        agentadviceId: id,

      });
    });


    if (containerArray.length > 0) {
      this.commonService
        .batchUpdate('containermaster/batchupdate', containerArray)
        .subscribe(
          (res: any) => {
            if (!res.errors) {

            }
          },
          (error) => {
            this.notification.create('error', error, '');
          }
        );
    }
  }

  getAgentAdviseList(statusSelected) {
    let payload = this.commonService.filterList()
    payload.query = {
    }
    if (statusSelected) {
      payload.query["status"] = statusSelected
    }
    payload.sort = {
      "desc": ["updatedOn"]
    }
    this.commonService.getSTList("agentadvice", payload).subscribe((data) => {
    });
  }



  getDepartmentList() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = { "isDeptType": "master" }
    this.commonService.getSTList('department', payload)?.subscribe((data) => {
      this.departmentList = data.documents;
    });
  }
  getCountryList() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = { "status": true }
    this.commonService.getSTList('country', payload)?.subscribe((data) => {
      this.countryList = data.documents;

    });
  }
  getPartyMasterDropDowns() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = { "status": true }
    this.commonService.getSTList('partymaster', payload)?.subscribe((res: any) => {
      this.partyMasterNameList = res?.documents;
      this.custNameList = res?.documents?.filter((x) => x.customerType !== 'Vendor')
      res?.documents?.filter((x) => {
        if (x.customerType) {
          x.customerType.map((res: any) => {
            if (res?.item_text === 'Shipper') { this.shipperList.push(x) }
            else if (res?.item_text === 'Booking Party') { this.bookingpartyList.push(x) }
            else if (res?.item_text === 'Invoicing Party') { this.invoicingpartyList.push(x) }
            else if (res?.item_text === 'Forwarder') { this.forwarderChaList.push(x) }
            else if (res?.item_text === 'Consignee') { this.consigneeList.push(x) }
            else if (res?.item_text === 'Vendor') { this.vendorList.push(x) }
            else {
            }
          })
        }
        if (x.opsName) {
          this.ops_coordinator.push(x)
        }

      });
    });
  }
  customerNameList: any = []
  partyTypeChange(e) {
    this.customerNameList = []
    if (e === 'Shipper') {
      this.partyMasterNameList.forEach((x) => {
        x.customerType.filter((res: any) => {
          if (res?.item_text === 'Shipper') {
            this.customerNameList.push(x)
          }
        })
      })
    }

    if (e === 'Consignee') {
      this.partyMasterNameList.forEach((x) => {
        x.customerType.filter((res: any) => {
          if (res?.item_text === 'Consignee') {
            this.customerNameList.push(x)
          }
        })
      })
    }
    if (e === 'Notify Party') {
      this.partyMasterNameList.forEach((x) => {
        x.customerType.filter((res: any) => {
          if (res?.item_text === 'Notify Party') {
            this.customerNameList.push(x)
          }
        })
      })
    }
  }
  branchData: any = []
  customer: any
  customerChange(e) {
    this.customer = e
    this.branchData = []
    this.branchData = e?.branch
  }
  branch: any
  branchChange(e) {
    this.branch = e
    this.entityForm.get('address').setValue(e?.branch_address)
    this.entityForm.get('city').setValue(e?.branch_city)
    this.entityForm.get('partyCode').setValue(e?.partyCode)
    this.entityForm.get('postalCode').setValue(e?.pinCode)
    this.entityForm.get('state').setValue(e?.branch_stateName)
    this.entityForm.get('country').setValue(e?.branch_countryName)
  }
  getCarriageDropDowns() {

    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = { "status": true, "customerType": "ICD" }
    this.commonService.getSTList('partymaster', payload)?.subscribe((res: any) => {
      this.partymasterList = res?.documents;
    });
  }
  getShippingLineDropDowns() {

    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true,
      "$and": [
        {
          "feeder": {
            "$ne": true
          }
        }
      ],
    }
    this.commonService.getSTList('shippingline', payload)?.subscribe((res: any) => {
      this.shippingLineList = res?.documents;
    });
  }
  getContractDropDowns() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true
    }
    this.commonService.getSTList('contact', payload)?.subscribe((res: any) => {
      this.contactList = res?.documents;
    });
  }
  getproductDropDowns() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true
    }
    this.commonService.getSTList('product', payload)?.subscribe((res: any) => {
      this.productList = res?.documents;
    });
  }
  getLocationDropDowns() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true,
      masterType:   {
        "$in": ['YARD','CFS','ICD']
      },
    }
    this.commonService.getSTList('location', payload)?.subscribe((res: any) => {
      this.locationList = res?.documents.filter((x) => !x?.ICD && !x?.Yard && !x?.CFS );
      let locationId = res?.documents?.filter((x) => x?.locationName?.toLowerCase() === "mumbai")[0]?.locationId
      this.newenquiryForm.controls.deliveryPlace.setValue(locationId);

      this.ICDlocationList = res?.documents.filter((x) => x?.ICD)
      this.preCarrigeList = this.ICDlocationList.filter(x => x.country?.toLowerCase() === 'india')
    });
  }
  async getSystemTypeDropDowns() {
    let payload = this.commonService.filterList()

    payload.query = {
      status: true,
      "typeCategory": {
        "$in": [
          "custAccType", "paymentTerms", "cargoType", "imcoClass", "batchType", "contract", "customer", "preCarriage", "onCarriage", "containerType", "containerSize", "enquiryType", "shippingTerm", "tankType", "shipmentTerm", "moveType", "incoTerm", "location", "icd", "packingGroup", "haulageType", "chargeTerm", "processPoint", "status",
        ]
      }
    }

    this.commonService.getSTList("systemtype", payload).subscribe((res: any) => {
      this.enquirytypeList = res?.documents?.filter(x => x.typeCategory === "enquiryType");


      this.custTypeList = res?.documents?.filter(x => x.typeCategory === "custAccType");
      this.imcoList = res?.documents?.filter(x => x.typeCategory === "imcoClass");
      this.paymentTermList = res?.documents?.filter(x => x.typeCategory === "paymentTerms");
      this.cargoTypeList = res?.documents?.filter(x => x.typeCategory === "cargoType");
      this.batchMasterList = res?.documents?.filter(x => x.typeCategory === "batchType");
      this.contractList = res?.documents?.filter(x => x.typeCategory === "contract");
      this.customerList = res?.documents?.filter(x => x.typeCategory === "customer");
      this.shippingtermList = res?.documents?.filter(x => x.typeCategory === "shippingTerm");
      this.tanktypeList = res?.documents?.filter(x => x.typeCategory === "tankType");
      this.shipmenttermList = res?.documents?.filter(x => x.typeCategory === "shipmentTerm");
      this.movetypeList = res?.documents?.filter(x => x.typeCategory === "moveType");
      this.incotermList = res?.documents?.filter(x => x.typeCategory === "incoTerm");
      this.onCarrigeList = res?.documents?.filter(x => x.typeCategory === "onCarriage");
      this.packinggroupList = res?.documents?.filter(x => x.typeCategory === "packingGroup");
      this.haulagetypeList = res?.documents?.filter(x => x.typeCategory === "haulageType");
      this.chargetermList = res?.documents?.filter(x => x.typeCategory === "chargeTerm");
      this.processPointList = res?.documents?.filter(x => x.typeCategory === "processPoint");
      this.statusList = res?.documents?.filter(x => x.typeCategory === "status");
      this.containerTypeList = res?.documents?.filter(x => x.typeCategory === "containerType");
      this.containerSizeList = res?.documents?.filter(x => x.typeCategory === "containerSize");

      this.loaderService.showcircle()

      if (this.isAddMode) {

        setTimeout(() => {
          this.loaderService.hidecircle()
          this.setExcelData()

        }, 2000);
      }
    });


  }
  getVesselListDropDown() {
    let payload = this.commonService.filterList()

    if(payload?.query)payload.query = {
      status: true,
    }

    this.commonService.getSTList("vessel", payload)?.subscribe((res: any) => {
      this.vesselList = res?.documents;
    });
  }
  
  getVoyageListDropDown() {
    let payload = this.commonService.filterList()

    if(payload?.query)payload.query = {
      status: true,
    }

    this.commonService.getSTList("voyage", payload)?.subscribe((res: any) => {
      this.voyageList = res?.documents;
    });
  }
  getPortDropDowns() {
    let payload = this.commonService.filterList()

    if(payload?.query)payload.query = {
      status: true
    }

    this.commonService.getSTList("port", payload)?.subscribe((res: any) => {
      this.portList = res?.documents;
    });
  }
  getCurrencyDropDowns() {
    let payload = this.commonService.filterList()

    if(payload?.query)payload.query = {
      status: true,
    }

    this.commonService.getSTList("currency", payload)?.subscribe((res: any) => {
      this.currencyList = res?.documents;
   

    });
  }
  getUsersForDropDown() {
    let payload = this.commonService.filterList()

    if(payload?.query)payload.query = {
      status: true,
    }

    this.commonService.getSTList("user", payload)?.subscribe((res: any) => {
      this.userList = res?.documents;
    });
  }

  getRemarks() {
    let payload = this.commonService.filterList()

    payload.query = {
      "agentadviceId": this.id
    }

    this.commonService.getSTList("comment", payload).subscribe((res: any) => {
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

  onClose(evt) {
    this.CloseNew.emit(evt);
  }
  onOpenParty(content) {
    this.IsEditEntity = -1
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }
  onOpen(content) {
    this.IsEditRemarks = -1;
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
    this.remarksForm.controls['fromUser'].setValue(this.userData.roleName);
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
  onAddContainer(content) {
    this.listOfTagOptions = []
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'sm',
    });
  }
  partyArray: any = []
  addEntiry() {
    this.submitted1 = true
    if (this.entityForm.invalid) {
      return;
    }
    else {
      this.modalService.dismissAll();
      if (this.IsEditEntity < 0) {
        this.partyArray.push({
          partyType: this.entityForm.value.partyType,
          customerName: this.entityForm.value.customerName,
          partyCode: this.entityForm.value.partyCode,
          addressLine1: this.entityForm.value.address,

          addressLine2: '',
          addressLine3: '',
          city: this.entityForm.value.city,
          postalCode: this.entityForm.value.postalCode,
          state: this.entityForm.value.state,
          country: this.entityForm.value.country,
        })
      }
      else {
        for (var i = 0; i < this.partyArray.length; i++) {
          if (i === this.IsEditEntity) {
            this.partyArray[i].partyType = this.entityForm.value.partyType
            this.partyArray[i].customerName = this.entityForm.value.customerName?.name,
              this.partyArray[i].partyCode = this.entityForm.value.partyCode,
              this.partyArray[i].addressLine1 = this.entityForm.value.branch?.branch_address,

              this.partyArray[i].addressLine2 = ''
            this.partyArray[i].addressLine3 = ''
            this.partyArray[i].city = this.entityForm.value.city,
              this.partyArray[i].postalCode = this.entityForm.value.partyCode,
              this.partyArray[i].state = this.entityForm.value.state,
              this.partyArray[i].country = this.entityForm.value.country
          }
        }
      }

      this.entityForm.reset()
    }

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
    }
    this.remarksForm.reset()
    this.newRemark = {}


  }
  closePopup() {
    this.modalService.dismissAll();
  }

  onCancel() {
    this.router.navigate(["/agent-advice/list"]);
  }

  removeRow(remark, content1, index) {
    this.modalService.open(content1, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'sm',
      ariaLabelledBy: 'modal-basic-title'
    }).result.then((result) => {

      if (result === 'yes') {
        let payload = 'comment' + remark?.commentId
        if (remark?.commentId) {
          this.commonService.deleteST(payload).subscribe((res: any) => {
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
  deleteEntity(party, content1, index) {
    this.modalService.open(content1, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'sm',
      ariaLabelledBy: 'modal-basic-title'
    }).result.then((result) => {

      if (result === 'yes') {
        let payload = 'commentId' + party?.commentId
        if (party?.commentId) {
          this.commonService.deleteST(payload).subscribe((res: any) => {
            if (res) {
              this.partyArray.splice(index, 1);
            }
          });
        } else {
          this.partyArray.splice(index, 1);
        }
      }
    });
  }
  IsEditEntity: number = 0
  editEntity(party, content, index) {
    this.IsEditEntity = index
    this.partyTypeChange(party?.partyType)
    this.customerChange(party?.customer)
    this.branchChange(party?.branch)
    this.entityForm.patchValue({
      partyType: party?.partyType,
      customerName: party?.customer,
      branch: party?.branch,

    })
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



  changeFromDate() {
    this.enquiryDateValid = true
    this.newenquiryForm.controls.enquiryvalidto_date.setValue('')
  }
  disabledEtaDate = (current: Date): boolean => {
    return differenceInCalendarDays(current, new Date()) < 0;
  };
  disabledEtdDate = (current: Date): boolean => {
    this.enquiryDateValid = true
    if (this.newenquiryForm.controls.enquiryvalidform_date.value)
      return (
        differenceInCalendarDays(
          current,
          new Date(this.newenquiryForm.controls.enquiryvalidform_date.value)
        ) < 0
      );
    else return false;
  };
  disabledStartDateForEnquiryValidDate = (startValue: Date): boolean => {
    if (!startValue || !this.newenquiryForm.controls.enquiryvalidto_date.value) {
      return false;
    }
    return startValue.getTime() > this.newenquiryForm.controls.enquiryvalidto_date.value.getTime();
  };

  disabledEndDateForEnquiryValidDate = (endValue: Date): boolean => {
    if (!endValue || !this.newenquiryForm.controls.enquiryvalidform_date.value) {
      return false;
    }
    return endValue.getTime() <= this.newenquiryForm.controls.enquiryvalidform_date.value.getTime();
  };

  disabledStartDateForShippingLineDate = (startValue: Date): boolean => {
    if (!startValue || !this.newenquiryForm.controls.shippingLineratevalidto_date.value) {
      return false;
    }
    return startValue.getTime() > this.newenquiryForm.controls.shippingLineratevalidto_date.value.getTime();
  };

  disabledEndDateForShippingLineDate = (endValue: Date): boolean => {
    if (!endValue || !this.newenquiryForm.controls.shippingLineratevalidfrom_date.value) {
      return false;
    }
    return endValue.getTime() <= this.newenquiryForm.controls.shippingLineratevalidfrom_date.value.getTime();
  };

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  productData(productData?) {
    if (!this.newenquiryForm.value.productName) {
      return false
    }

    this.productShippingName = this.productList.filter(x => x.productId === this.newenquiryForm.value.productName)[0]?.psn;
    this.IMCOClass = this.productList.filter(x => x.productId === this.newenquiryForm.value.productName)[0]?.imcoClass;
    this.VesselUNNo = this.productList.filter(x => x.productId === this.newenquiryForm.value.productName)[0]?.unNumber;
    this.PackingGroup = this.productList.filter(x => x.productId === this.newenquiryForm.value.productName)[0]?.packingGroupName;
    this.Density = this.productList.filter(x => x.productId === this.newenquiryForm.value.productName)[0]?.densityGravity;
    this.Flash_point = this.productList.filter(x => x.productId === this.newenquiryForm.value.productName)[0]?.flashPoint;
    this.marinePollution = this.productList.filter(x => x.productId === this.newenquiryForm.value.productName)[0]?.marinePollution;
    this.emsCode = this.productList.filter(x => x.productId === this.newenquiryForm.value.productName)[0]?.emsCode;
    let productType = this.productList.filter(x => x.productId === this.newenquiryForm.value.productName)[0]?.productType;
    this.newenquiryForm.controls.marine_pollution.setValue(this.marinePollution ? 'Yes' : 'No')
    this.newenquiryForm.controls.proper_shipping_name.setValue(this.productShippingName)
    this.newenquiryForm.controls.imco_class.setValue(this.IMCOClass)
    this.newenquiryForm.controls.un_no.setValue(this.VesselUNNo)
    this.newenquiryForm.controls.packing_group.setValue(this.PackingGroup)
    this.newenquiryForm.controls.flashPoint.setValue(this.Flash_point)
    this.newenquiryForm.controls.gravity.setValue(this.Density)
    this.newenquiryForm.controls.EMSCode.setValue(this.emsCode)
    if (this.newenquiryForm.value.Haz) {
      return
    }
    else {
      this.newenquiryForm.controls.Haz.setValue(productType === 'HAZ' ? true : false)
    }

  }

  loadportchange() {
    let loadport = this.portList.filter(x => x.portId === this.newenquiryForm.value.load_port)
    this.newenquiryForm.controls.location.setValue(loadport[0]?.location?.locationId)
  }


  setEnquiry(e) {
    if (!e) { return false }
    let data = this.enquirytypeList.filter((x) => x.systemtypeId === e)[0]?.typeName?.toLowerCase();

    if (data === 'export loaded') {
      this.newenquiryForm.get('shipment_term').setValue('Loaded')
    } else {
      this.newenquiryForm.get('shipment_term').setValue('Empty')
    }

  }

  setFPOD() {
    let setFPOD = this.shippingtermList.filter((x) => x?.systemtypeId === this.newenquiryForm.get('shippping_term').value)[0]?.typeName?.toLowerCase()
    if (setFPOD === 'door to door' || setFPOD === 'pier to door') {
      this.newenquiryForm.get('fpod').setValidators([Validators.required]);
      this.newenquiryForm.get('fpod').updateValueAndValidity();
    } else {
      this.newenquiryForm.get('fpod').setValidators([]);
      this.newenquiryForm.get('fpod').updateValueAndValidity();
    }
  }
  saveRemarks(id) {
    let payload = []
    let payloadUpdate = []
    this.remarksArray.filter((x) => {
      if (x?.agentadviceId) {
        payloadUpdate.push({ ...x })
      } else {
        payload.push({ ...x, agentadviceId: id })
      }
    })
    if (payload.length > 0)
      this.commonService.batchInsert('comment/batchinsert', payload).subscribe();
    if (payloadUpdate.length > 0)
      this.commonService.batchUpdate('comment/batchupdate', payloadUpdate).subscribe();
  }

  setAddress(e, id?) {
    if (!id) { return false }
    let shipperAdd = this.partyMasterNameList.filter((x) => x?.partymasterId === id)[0]?.addressInfo?.address;
    this.newenquiryForm.get(e).setValue(shipperAdd)
  }

  print() {
    let reportpayload: any;
    let url: any;
 
    reportpayload = { "parameters": { "agentadviceID": this.id } };
    url = 'STCNOA'
    this.commonService.pushreports(reportpayload, url).subscribe({
      next: (res: any) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        let temp = URL.createObjectURL(blob);
        this.Documentpdf = temp;
        const pdfWindow = window.open(temp);
        pdfWindow.print();
      }

    });
  }

}
