import { Component, EventEmitter, Input, OnInit, Output, Pipe, PipeTransform, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from "../../../shared/services/common.service";
import { CommonService as CommonServices } from 'src/app/services/common/common.service';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { BaseBody } from '../../smartagent/base-body';
import { ApiService } from '../../principal/api.service';
import { ApiSharedService } from '../../../shared/components/api-service/api-shared.service';
import * as Constant from 'src/app/shared/common-constants';
import { environment } from 'src/environments/environment';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { CognitoService } from 'src/app/services/cognito.service';
import { Product } from 'src/app/services/Masters/masters';
import { containermaster } from 'src/app/models/containermaster';
import { enquiryList } from 'src/app/services/Enquiry-smartagent/Enquiry';
import { Department } from 'src/app/models/department';
import { Port } from 'src/app/models/tariff-list';
import { partymaster } from 'src/app/models/addvesselvoyage';
import { Branch, Location } from 'src/app/models/yard-cfs-master';
import { Vessel } from 'src/app/models/vessel-master';
import { voyage } from 'src/app/models/voyagedetails';
import { User } from 'src/app/models/userprofile';
import { ShippingLine } from 'src/app/models/shipping-line';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Currency, partymasterDetail } from '../../party-master/add-party/partyMaster-detail';
import { AddVesselVoyageComponent } from 'src/app/shared/components/Vessel-voyage/addvesselvoyage/addvesselvoyage.component';
import { DatePipe } from '@angular/common';
import { BatchService } from 'src/app/services/Batch/batch.service';
import { LoaderService } from 'src/app/services/loader.service';
import { AddPartyComponent } from '../../party-master/add-party/add-party.component';
import { MatDrawer } from '@angular/material/sidenav';
import { AddPortMasterComponent } from 'src/app/shared/components/sa-masters/port-master/add-port-master/add-port-master.component';
import { PartyMasterComponent } from '../../party-master/party-master.component';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, retry, switchMap } from 'rxjs/operators';
import { AddAirportComponent } from 'src/app/shared/components/sa-masters/airport-master/add-airport/add-airport.component';
import { MessagingService } from 'src/app/services/messaging.service';
import { SharedEventService } from 'src/app/shared/services/shared-event.service';



@Component({
  selector: 'app-add-batch',
  templateUrl: './add-batch.component.html',
  styleUrls: ['./add-batch.component.scss']
})
export class AddBatchComponent implements OnInit {
  searchPort$ = new Subject<string>();
  searchPortDest$ = new Subject<string>();
  @Input() isshowDetails: boolean = false;
  @Output() updateBatch = new EventEmitter<any>();
  @Output() getMilestone = new EventEmitter<any>();
  addBatchForm: FormGroup;
  submitted = false;
  isExpand: boolean = false;
  holdBatchType: any = '';
  baseBody: any;
  enquiryList: any = [];
  EnquiryId: any;
  uniqueRefNo: any;
  enquiryDetails: any;
  id: any;
  isAddMode: boolean = false;
  batchDetail: any;
  shipperList: any = [];
  currencyList: any = [];
  productList: Product[] = [];
  consigneeList: any = [];
  tanktypeList: any = [];
  locationList: Location[] = [];
  locationListOriginal: Location[] = [];
  forwarderChaList: any = []
  shippingLineList: ShippingLine[] = [];
  userList: User[] = [];
  bookingTypeList: any = [];
  vesselList: Vessel[] = [];
  voyageList: voyage[] = [];
  partymasterList: partymaster[] = [];
  invoicingpartyList: any = [];
  bookingpartyList: any = [];
  billingPartyList: any = [];
  agentList: any = [];
  movetypeList: any = [];
  cargoTypeList: any = [];
  freightTerms: any;
  bookingUpload: any;
  siUpload: any;
  costItemList: enquiryList[];
  filterBody = this.apiService.body
  customerList: any = [];
  remarksArray: any = [];
  incotermList: any;
  shippingtermList: any;
  enquirytypeList: any;
  batchMasterList: any;
  productData: Product[] = [];
  shippingLineId: any;
  shippingCharges: any = [];
  isExport: boolean;
  agentDataList: Department[] = [];
  onCarrigeList: any;
  containerTypeList: any;
  finalVoyageList: any = [];
  backVoyageList: any = [];
  planVoyageList: any = [];
  planVesselList: any = [];
  backupVesselList: any = [];
  tenantId: any;
  userdetails: any;
  billingBranchList: any= [];
  billingBranchList1: any= [];
  contractList: any;
  chargeBasic: any;
  imcoList: any;
  tankstatusList: any;
  freightTermsList: any;
  packinggroupList: any;
  haulagetypeList: any;
  chargetermList: any;
  processPointList: any;
  statusList: any;
  shipmentTypes: any = [];
  dimensionUnitList: any;
  palletTypeslist: any;
  ImportShipmentTypelist: any = []
  ImportShipmentTypelistAir: any = []
  showQuotation: false
  preCarrigeList1: any;
  ICDlocationList: any;
  preCarrigeList: any;
  portList: any = [];
  ops_coordinator: any;
  currentUrl: string;
  show: boolean = false;
  loadTypeListOriginal: any = [];
  loadTypeList: any = [];
  uomData: any = [];
  lengthData: any = []
  weighthData: any = []
  currentUser: any;
  isTransport: boolean;
  userData: any;
  batchId: any;
  stateList: any[];
  cityList: any[];
  countryList: any;
  callingCodeList: any;
  CustomerTypeList: any[];
  carrierType: any;
  isImport: boolean = false;
  bothImEx: boolean = false;
  chaList: any = [];
  empForm: FormGroup;
  numbers: number[] = Array.from({ length: 19 }, (_, i) => i + 3);
  
  readonly nzFilterOption = (): boolean => true;
  cloneMode: boolean;
  userDataList: any;
  agentId: any;
  constructor(public router: Router, public appCommon: CommonService,
    public loaderService: LoaderService,
    private batchService: BatchService,
    private sharedEventService: SharedEventService,
    private datepipe: DatePipe,
    private formBuilder: FormBuilder,
    public notification: NzNotificationService,
    private mastersService: MastersService,
    public _api: ApiService,
    public apiService: ApiSharedService,
    public sortPipe: OrderByPipe,
    private profilesService: ProfilesService,
    private sharedService: SharedService,
    private commonfunction: CommonFunctions,
    private modalService: NgbModal,
    public cognito: CognitoService,
    private messagingService: MessagingService,
    public route: ActivatedRoute, public commonService: CommonServices, private saMasterService: SaMasterService, private transaction: TransactionService) {
    this.isExport = localStorage.getItem('isExport') === 'true' ? true : false
    this.isTransport = localStorage.getItem('isTransport') === 'true' ? true : false;
    this.isImport = localStorage.getItem('isImport') === 'true' ? true : false;
    this.setupSearchSubscription();
    this.setupSearchSubscription1()
    this.setupSearchLocationSubscription();
    this.bothImEx = this.isExport || this.isImport
    this.getPartyMasterDropDowns();
    this.addBatchForm = this.formBuilder.group({


      isCfsRequired : [false],
      samePOD: [false],
      isCustomsOnly : [false],
      isGRNRequired : [false],
      enquiry_number: [''],
      enquiry_date: [new Date()],

      enquiry_type: [''],
      booking_party: [''],
      billingBranch: [''],
      ops_coordinator: [''],
      mblStatus: [''],
      Shipment_Type: ['', Validators.required],
      multiConsignee: [[]],
      userSelectList: [[]],
      chaId: [''],
      multiShipper: [[]],
      sales_person: [''],
      bookingRef: [''],
      mblNo: [''],
      hblStatus: [''],
      hblNo: [''],
      forworder: [''],
      loadType: ['', Validators.required],
      branch: ['', Validators.required],
      inco_term: [''],
      shipper: ['', Validators.required],
      agent: ['', Validators.required],
      billingParty: [''],
      cosignee: ['', Validators.required],
      notify_party: [''],
      incoicing_party: [''],
      notifyParty: [''],
      shipping_line: ['', Validators.required],
      pre_carriage: [''],
      load_place: [''],
      load_port: ['', Validators.required],
      location: [''],
      discharge_port: ['', Validators.required],

      imoNumber: [''],
      unNumber: [''],
      packagingType: [''],

      on_carriage: [''],
      fpod: [''],
      ts_port: [''],
      destPort: [''],
      freightTerms: [''],
      backupShippingLine: [''],
      plannedVessel: [''],
      voyageNumber: [''],
      etd: [''],
      eta: [''],
      remarks: [''],
      freeDaysTime : [[]],
      container: this.formBuilder.array([]),
      importShipmentType: [''],
      flightNo: [''],


      cargo: [false],
      emptyContainer: [false],
      palletization: [false],
      fumigation: [false],
      warehousing: [false],




      plannedVesselforHop: [''],
      voyageNumberforHop: [''],
      stuffing_location_Type:[''],
      billingBranchStuffing:[false],
      stuffing:[false],
      stuffingfactory:[false],
      stuffingcfs:[false],
      Stuffing_shipper_address:[''],
      cfslocation:[''],
      transportPreCarriage: [''],
      transportOnCarriage: [''],
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

      preCarriage: [false],
      onCarriage: [false],

      


    });

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

   mergedShipperValues(e): string[] {
console.log(this.empForm?.get('cargos').value, e)

let data = []

this.empForm?.get('cargos').value?.forEach((x,index)=>{
  if(index !== e){
    data.push(x.lclShipper)
  }
})

console.log(data,'data')

    let shipperValue = this.f.shipper.value ? [this.f.shipper.value] : [];
    let multiShipperValues = this.f.multiShipper.value || [];
  
    return    [...shipperValue, ...multiShipperValues].filter(item => !data.includes(item)) ;
  }

  setValidation() {
    return;
    if (this.isExport) {
      this.setremovevalidation('addBatchForm', [
        // { name: 'load_place', required: true },
        // { name: 'plannedVessel', required: true },
        // { name: 'voyageNumber', required: true },
        // { name: 'inco_term', required: true },
        // { name: 'agent', required: false },
        // { name: 'branch', required: false }
      ])
    } else {
      this.setremovevalidation('addBatchForm', [
        // { name: 'load_place', required: false },
        // { name: 'plannedVessel', required: false },
        // { name: 'voyageNumber', required: false },
        // { name: 'inco_term', required: false },
        // { name: 'agent', required: true },
        // { name: 'branch', required: true }
      ])
    }
  }
  setremovevalidation(formGroup, forms) {
    forms?.forEach((r) => {
      if (r?.required) {
        const palletValidators = [Validators.required];
        this[formGroup]?.get(r?.name).setValidators(palletValidators);
      } else {
        this[formGroup]?.get(r?.name).clearValidators();
      }
      this[formGroup]?.get(r?.name).updateValueAndValidity();
    })
  }
  sort(array, key) {
    return this.sortPipe.transform(array, key);
  }
  onClose() {
    this.router.navigate(['/batch/list']);
  }

  get f() { return this.addBatchForm?.controls; }


  getUomList() {
    let payload = this.commonService.filterList()
    if (payload) payload.query = { 'status': true }
    this.commonService.getSTList('uom', payload)?.subscribe((data) => {
      this.uomData = data.documents;
      this.lengthData = data?.documents?.filter(lengthtype => lengthtype?.uomCategory === 'Length');
      this.weighthData = data?.documents?.filter(lengthtype => lengthtype?.uomCategory === 'Weight');
      // this.lengthData = data?.documents?.filter(lengthtype => lengthtype?.uomCategory === 'Length');
    });
  }
  lastSegment: any = ''
  getUpdateBatch() { 
    this.messagingService?.getUpdatedBatchData()?.subscribe((res: any) => { 
    })
  }
  ngOnInit(): void {
    // this.getUpdateBatch()
    this.appCommon.currentMessage.subscribe(msg =>
      this.holdBatchType = msg
    );
    this.route.url.subscribe(segments => {
      this.lastSegment = segments[segments.length - 1].path;
    });
    this.id = this.route.snapshot.params['id'];
    this.isAddMode = !this.id;

    if (!this.isAddMode) {
      this.getBatchById();
    }
    // if (this.isExport) {
    //   this.getQuotation();
    // } else {
    this.agentAdviseList();
    // }
    this.currentUser = this.commonfunction.getActiveAgent()
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.tenantId = resp.tenantId
        this.userdetails = resp.userData
        this.agentId = resp.userData.agentId
      }
    })
    const pathSegments = this.router.url.split('?')[0].split('/');
    this.currentUrl = pathSegments[pathSegments.length - 1]; // Gets 'cloneJob'
    if (this.currentUrl === 'show') {
      this.addBatchForm.disable();
      this.show = true;
    } else if (this.currentUrl === 'cloneJob') {
      this.cloneMode = true;
    }

    this.empForm = this.formBuilder.group({
      cargos: this.formBuilder.array([this.newCargo()])
    });

    //   if(this.isAddMode || this.lastSegment == 'Draft') {
    //  this.getPortDropDowns() 
    //   }
    this.getAir();
    this.getUserList()
    this.getUomList()
    this.getVesselListDropDown();
    this.getVoyageListDropDown();
    this.getShippingLineDropDowns();
    this.getproductDropDowns();
    this.getSystemTypeDropDowns();
    this.getCurrencyDropDowns();
    this.getUsersForDropDown();
    this.getLocationDropDowns();
    this.getICDLocation()
    this.getContainerList()
    this.getBatchContainer()
    if (!this.isExport && this.isAddMode) {
      // this.addContainerRow()
    }
    this.setValidation()
    this.addBatchForm.get('cosignee')!.valueChanges.subscribe((consigneeId) => {
      this.addBatchForm.get('billingParty')?.setValue(consigneeId);
    });
  }
  getUserList() {
    this.loaderService.showcircle();
  
    let payload = this.commonService.filterList();
  
    if (!payload.query) {
      payload.query = {};
    }
    if (this.agentId != null) {
      payload.query['agentId'] = this.agentId;
    }
  
    this.commonService.getSTList(Constant.GET_USER, payload)
      ?.subscribe(
        (data) => {
          this.userDataList = data?.documents || [];
          this.loaderService.hidecircle();
        },
        () => {
          this.loaderService.hidecircle();
        }
      );
  }
  
  tankData: any = []
  getBatchContainer() {
    let payload = this.commonService.filterList()
    if (payload) payload.query = {

      $or: [{
        "batchId": {
          "$in": [this.route.snapshot.params['id']]
        }
      }, {
        "batchwiseGrouping.batchId": {
          "$in": [this.route.snapshot.params['id']]
        }
      }]
    }
    if (payload) payload.size = Number(1000)

    this._api
      .getSTList(Constant.CONTAINER_LIST, payload)
      ?.subscribe((data: any) => {
        this.tankData = data.documents;
      })

  }
  listContainer: any = []
  getContainerList() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      status: true,
    }
    if (payload?.sort) payload.sort = {
      "desc": ["updatedOn"]
    },
      this._api.getSTList("containermaster", payload)?.subscribe((res: any) => {
        this.listContainer = res?.documents;
      });
  }
  getBranchList() {

    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      orgId: this.commonfunction.getAgentDetails()?.orgId,
      status: true
    }
    this.commonService.getSTList('branch', payload)
      ?.subscribe((data) => {
        this.branchList = data.documents;
      });
  }
  getVesselListDropDown() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      status: true
    }
    this._api
      .getSTList('vessel', payload)
      ?.subscribe((res: any) => {
        this.vesselList = res?.documents;
      });
  }
  async getBatchById() {

    let payload = this.commonService.filterList()
    payload.query = {
      batchId: this.route.snapshot.params['id'],
    }
    this._api
      .getSTList(Constant.BATCH, payload)
      .subscribe((res: any) => {

        this.batchDetail = res?.documents[0];

        this.addBatchForm?.patchValue({
          isCfsRequired : this.batchDetail?.isCfsRequired || false,
          samePOD: this.batchDetail?.routeDetails?.samePOD || false,
          isCustomsOnly : this.batchDetail?.isCustomsOnly || false,
          isGRNRequired  : this.batchDetail?.isGRNRequired || false,
          flightNo: this.batchDetail?.quotationDetails?.flightId || '',
          mblNo: this.batchDetail?.enquiryDetails?.basicDetails?.mblNo || '',
          hblNo: this.batchDetail?.enquiryDetails?.basicDetails?.hblNo || '',
          mblStatus: this.batchDetail?.enquiryDetails?.basicDetails?.mblStatus || '',
          hblStatus: this.batchDetail?.enquiryDetails?.basicDetails?.hblStatus || '',
          bookingRef: this.batchDetail?.enquiryDetails?.basicDetails?.bookingRef || '',
          chaId: this.batchDetail?.enquiryDetails?.basicDetails?.chaId || '',
          agent: this.batchDetail?.enquiryDetails?.basicDetails?.agentId || '',
          billingParty: this.batchDetail?.enquiryDetails?.basicDetails?.billingPartyId || '',
          Shipment_Type: this.batchDetail?.enquiryDetails?.basicDetails?.ShipmentTypeId,

          multiConsignee: this.batchDetail?.enquiryDetails?.basicDetails?.multiConsignee?.map(item => item.partymasterId) || [],
          multiShipper: this.batchDetail?.enquiryDetails?.basicDetails?.multiShipper?.map(item => item.partymasterId) || [],
          userSelectList: this.batchDetail?.accessUser?.map(user => user.userId) || [],


          loadType: this.batchDetail?.enquiryDetails?.basicDetails?.loadTypeId,
          importShipmentType: this.batchDetail?.enquiryDetails?.basicDetails?.importShipmentTypeId,
          enquiry_number: this.batchDetail?.batchNo,
          branch: this.batchDetail?.quotationDetails?.branchId || '',
          enquiry_date: this.batchDetail?.batchDate || new Date(),
          shipper: this.batchDetail?.enquiryDetails?.basicDetails?.shipperId,
          billingBranch: this.batchDetail?.enquiryDetails?.basicDetails?.billingBranch,
          ops_coordinator: this.batchDetail?.enquiryDetails?.basicDetails?.opsCoordinatorId,
          sales_person: this.batchDetail?.enquiryDetails?.basicDetails?.salesPersonId,
          cosignee: this.batchDetail?.enquiryDetails?.basicDetails?.consigneeId,
          booking_party: this.batchDetail?.enquiryDetails?.basicDetails?.bookingPartyId,
          forworder: this.batchDetail?.enquiryDetails?.basicDetails?.forwarderId,
          incoicing_party: this.batchDetail?.enquiryDetails?.basicDetails?.invoicingPartyId,
          notifyParty: this.batchDetail?.enquiryDetails?.basicDetails?.notifyPartyId,
          shipping_line: this.batchDetail?.enquiryDetails?.routeDetails?.shippingLineId,

          imoNumber: this.batchDetail?.enquiryDetails?.dgCargoDetails?.imoNumber,
          unNumber: this.batchDetail?.enquiryDetails?.dgCargoDetails?.unNo,
          packagingType: this.batchDetail?.enquiryDetails?.dgCargoDetails?.packagingType,


         
          etd: this.batchDetail?.routeDetails?.etd,
          eta: this.batchDetail?.routeDetails?.eta,

          load_place: this.batchDetail?.enquiryDetails?.routeDetails?.loadPlace,
          load_port: this.batchDetail?.enquiryDetails?.routeDetails?.loadPortId,
          location: this.batchDetail?.enquiryDetails?.routeDetails?.location,
          discharge_port: this.batchDetail?.enquiryDetails?.routeDetails?.destPortId,

          pre_carriage: this.batchDetail?.enquiryDetails?.routeDetails?.preCarriageId,
          on_carriage: this.batchDetail?.enquiryDetails?.routeDetails?.onCarriageId,
          fpod: this.batchDetail?.enquiryDetails?.routeDetails?.fpodId,
          inco_term: this.batchDetail?.enquiryDetails?.basicDetails?.incoTermId,
          freightTerms: this.batchDetail?.enquiryDetails?.routeDetails?.freightTerms,

          voyageNumber: this.batchDetail?.quotationDetails?.voyageNumber,
          plannedVessel: this.batchDetail?.quotationDetails?.vesselId,
          remarks: this.batchDetail?.remarks || '',
          freeDaysTime : this.batchDetail?.freeDaysTime || [],

          backupShippingLine: this.batchDetail?.enquiryDetails?.backupShippingLine,
          transportOrigin: this.batchDetail?.enquiryDetails.customDetails?.transportOrigin || false,
          transportDestination: this.batchDetail?.enquiryDetails.customDetails?.transportDestination || false,
         
          originDestination: this.batchDetail?.enquiryDetails.customDetails?.originDestination,
          customOrigin: this.batchDetail?.enquiryDetails.customDetails?.customOrigin,
          customOriginLocation: this.batchDetail?.enquiryDetails.customDetails?.customOriginLocation,
          customDestinationLocation: this.batchDetail?.enquiryDetails.customDetails?.customDestinationLocation,
          customDestination: this.batchDetail?.enquiryDetails?.customDetails?.customDestination,
          originOption: this.batchDetail?.enquiryDetails?.customDetails?.originOption,
          destinationOption: this.batchDetail?.enquiryDetails?.customDetails?.destinationOption,
          originPickupAddress: this.batchDetail?.enquiryDetails?.customDetails?.originPickupAddress,
          destinationDeliveryAddress: this.batchDetail?.enquiryDetails?.customDetails?.destinationDeliveryAddress,
         

          transportPreCarriage: this.batchDetail?.enquiryDetails?.routeDetails?.transportPreCarriage,
          transportOnCarriage: this.batchDetail?.enquiryDetails?.routeDetails?.transportOnCarriage,
          plannedVesselforHop: this.batchDetail?.quotationDetails?.vesselId ,
          voyageNumberforHop: this.batchDetail?.quotationDetails?.voyageNumber  ,

          preCarriage: this.batchDetail?.enquiryDetails?.transportDetails?.preCarriage,
          onCarriage: this.batchDetail?.enquiryDetails?.transportDetails?.onCarriage,

          stuffing_location_Type: this.batchDetail?.enquiryDetails?.stuffing_location?.stuffing_location_Type,
          billingBranchStuffing: this.batchDetail?.enquiryDetails?.stuffing_location?.billingBranchStuffingName,
          Stuffing_shipper_address: this.batchDetail?.enquiryDetails?.stuffing_location?.Stuffing_shipper_address,

          stuffing : this.batchDetail?.enquiryDetails?.stuffing_location?.stuffing_location_Type != "" ? true : false,
       

          cargo: this.batchDetail?.enquiryDetails?.insurance?.cargo,
          emptyContainer: this.batchDetail?.enquiryDetails?.insurance?.emptyContainer,
          palletization: this.batchDetail?.enquiryDetails?.insurance?.palletization,
          fumigation: this.batchDetail?.enquiryDetails?.insurance?.fumigation,
          warehousing: this.batchDetail?.enquiryDetails?.insurance?.warehousing,

        });
        this.activeFright = this.batchDetail?.enquiryDetails?.basicDetails?.ShipmentTypeName?.toLowerCase()
        this.activeFrightAir = this.activeFright == 'air' ? true : false
      



        const cargoArray = this.empForm.get('cargos') as FormArray;
        cargoArray.clear();
        (this.batchDetail?.enquiryDetails?.looseCargoDetails?.cargos ?? []).forEach((cargo, index) => {
          const cargoArray = this.empForm.get('cargos') as FormArray;
          const cargoFormGroup = this.newCargo();
          cargoFormGroup.patchValue({...cargo,
            cbm : cargo?.cbm || 0,
            volumeselect : cargo?.cbm || 0});
          cargoArray.push(cargoFormGroup);
        });


       

        if (this.batchDetail?.enquiryDetails?.containersDetails?.length > 0) {
          this.batchDetail?.enquiryDetails?.containersDetails?.filter(e => {
            this.addContainerRow(e)
          })
        }

       



                setTimeout(() => {
                  this.getTabs()
                  this.shipmentType()
                  this.setShipper(this.batchDetail?.enquiryDetails?.basicDetails?.billingPartyId)
                  this.calculateAll()
                }, 2000);
                setTimeout(() => {
                  // this.desPortchange()
                  // this.loadportchange()
                  this.searchPortLocation(this.batchDetail?.enquiryDetails?.routeDetails?.locationName)
                }, 1000);
                this.searchPortAll(this.batchDetail?.enquiryDetails?.routeDetails)

      });
  }
  tanshipmentHOPPorts = []
  agentAdviseList() {

    let payload = this.commonService.filterList()
    payload.query = {
      "status": true,
    }

    this.commonService.getSTList('agentadvice', payload).subscribe((data: any) => {
      this.agentDataList = data.documents;
      this.getContainerData()
    });
  }
  quotationList: any = []
  getQuotation() {
    let payload = this.commonService.filterList()

    if (payload?.query) payload.query = {
      'quoteStatus': 'Quotation Submitted'
    }

    this.commonService.getSTList('quotation', payload)
      ?.subscribe((res: any) => {
        this.quotationList = res.documents


      })
  }
  getEnquiryList() {


    let payload = this.commonService.filterList()
    payload.query = {
      "status": true,
      // enquiryStatus : 'Quotation Created',
      // "$and": [
      //   {
      //     "enquiryStatus": {
      //       "$ne": 'Pending',
      //     }
      //   }
      // ]
      "enquiryId": {
        "$in": [
          this.EnquiryId
        ]
      }
    }
    payload.sort = {
      "desc": ["createdOn"]
    },


      this._api.getSTList(Constant.ENQUIRY_LIST, payload)
        .subscribe((data: any) => {
          this.enquiryDetails = data.documents[0];


        });
  }
  portDataValue: Port[] = []

  getCurrencyDropDowns() {
    const payload = this.commonService.filterList()
    if (payload?.query) payload.query = {}

    this._api.getSTList("currency", payload)?.subscribe((res: any) => {
      this.currencyList = res?.documents;
    });
  }
  notifyPartyList: any = []


  getPartyMasterDropDowns() {
    this.partymasterList = []
    this.shipperList = []
    this.bookingpartyList = []
    this.bookingpartyList = []
    this.invoicingpartyList = []
    this.agentList = []
    this.forwarderChaList = []
    this.consigneeList = []
    let payload = this.commonService.filterList()
    if (payload) payload.query = {
      "status": true
    }
    this.commonService.getSTList("partymaster", payload)?.subscribe((res: any) => {
      this.partymasterList = res?.documents;
      this.billingPartyList = res?.documents?.filter((x) => x.isSupplier)
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

      });
      this.chaList = res?.documents?.filter((agent: any) =>
      Array.isArray(agent.customerType)
        ? agent.customerType.some((c: any) => c.item_text?.toLowerCase() === 'cha')
        : agent.customerType?.item_text?.toLowerCase() === 'cha'
    );
      this.bookingpartyList = res?.documents;
      this.getBranchList()
    });
  }

  getSmartAgentList() {

    let payload = this.commonService.filterList()
    payload.query = {
      "status": true,
    }
    this.commonService.getSTList('agent', payload).subscribe((data) => {
      let agentId = data.documents[0]?.agentId


    });
  }
  branchList: Branch[] = []



  getVoyageListDropDown() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      "status": true,
    }
    this._api.getSTList("voyage", payload)?.subscribe((res: any) => {
      this.voyageList = res?.documents;
      this.planVesselList = res?.documents;
      this.backupVesselList = res?.documents;
    });
  }
  setVoyage(e) {
    let vessel = this.vesselList?.filter((x) => x?.vesselId == e)[0]?.voyage
    if (vessel?.length > 0) {
      let voyageNo = vessel?.filter((x) => x?.shipping_line == this.addBatchForm?.value.shipping_line)[0]?.voyage_number
      this.addBatchForm?.controls.voyageNumber.setValue(voyageNo);
    }
  }
  cfsDropdownOptions: any;
  getLocationDropDowns() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      "status": true,
      masterType: {
        "$in": ['YARD', 'CFS', 'ICD']
      },
    }
    this.commonService.getSTList("location", payload)?.subscribe((res: any) => {

     
      this.cfsDropdownOptions = res.documents.map((location: any) => ({
        label: location.locationName,
        value: location.locationId
      }));

      this.locationListOriginal = res?.documents;
      this.locationList = res?.documents;
      this.onCarrigeList = this.locationList?.filter((x) => x?.ICD)
    });
  }

  getShippingLineDropDowns() {
    let payload = this.commonService.filterList();
    if (payload?.query) payload.query = {
      "status": true,
      "$and": [
        {
          "feeder": {
            "$ne": true,
          }
        }
      ]
    }


    this._api.getSTList("shippingline", payload)?.subscribe((res: any) => {
      this.shippingLineList = res?.documents;
    });
  }
  flightList: any = []
  async getAir() {
    let payload = this.commonService.filterList()
    payload.query = { status: true }
    await this._api?.getSTList('air', payload)
      ?.subscribe((res: any) => {
        this.flightList = res?.documents;
      });
  }
  getproductDropDowns() {

    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      "status": true
    }
    this.commonService.getSTList("product", payload)?.subscribe((res: any) => {
      this.productList = res?.documents;
    });
  }
  itemTypeList: any = [];
  departureModeList: any = [];
  ULDcontainerlist: any = [];
  packageList : any = [];
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
          "carrierType",

         "packageType", "ULDcontainerType", "tankStatus", "chargeBasis", "freightChargeTerm", "cargoType", "batchType", "contract", "customer", "imcoClass", "preCarriage", "onCarriage", "containerType", "containerSize", "enquiryType", "shippingTerm", "tankType", "shipmentTerm", "moveType", "incoTerm", "location", "icd", "packingGroup", "haulageType", "chargeTerm", 'shipmentType', "processPoint", "dimensionUnit", "palletType", "status"
        ]
      }
    }

    this.commonService.getSTList("systemtype", payload)?.subscribe((res: any) => {
      this.enquirytypeList = res?.documents?.filter(x => x.typeCategory === "enquiryType");
      this.enquirytypeList = this.enquirytypeList?.filter(option => option.typeName !== 'Export Loaded');

      if (this.enquirytypeList?.length > 0) {
        this.enquirytypeList.map((res: any) => {
          if (res.typeName?.toLowerCase() === 'export')
            this.addBatchForm?.controls.enquiry_type.setValue(res.systemtypeId);
        });
      }

      this.packageList = res?.documents.filter(
        (x) => x.typeCategory === 'packageType'
      );

      this.chargeBasic = res?.documents?.filter(x => x.typeCategory === "chargeBasis");
      this.imcoList = res?.documents?.filter(x => x.typeCategory === "imcoClass");
      this.cargoTypeList = res?.documents?.filter(x => x.typeCategory === "cargoType");
      this.batchMasterList = res?.documents?.filter(x => x.typeCategory === "batchType");
      this.contractList = res?.documents?.filter(x => x.typeCategory === "contract");
      this.customerList = res?.documents?.filter(x => x.typeCategory === "customer");
      this.shippingtermList = res?.documents?.filter(x => x.typeCategory === "shippingTerm");
      this.tanktypeList = res?.documents?.filter(x => x.typeCategory === "tankType");
      this.tankstatusList = res?.documents?.filter(x => x.typeCategory === "tankStatus");
      this.shippingtermList = res?.documents?.filter(x => x.typeCategory === "shipmentTerm");
      this.movetypeList = res?.documents?.filter(x => x.typeCategory === "moveType");
      this.incotermList = res?.documents?.filter(x => x.typeCategory === "incoTerm");
      this.freightTermsList = res?.documents?.filter(x => x.typeCategory === "freightChargeTerm");
      this.packinggroupList = res?.documents?.filter(x => x.typeCategory === "packingGroup");
      this.haulagetypeList = res?.documents?.filter(x => x.typeCategory === "haulageType");
      this.chargetermList = res?.documents?.filter(x => x.typeCategory === "chargeTerm");
      this.processPointList = res?.documents?.filter(x => x.typeCategory === "processPoint");
      this.statusList = res?.documents?.filter(x => x.typeCategory === "status");
      this.containerTypeList = res?.documents?.filter(x => x.typeCategory === "containerType");
      this.ULDcontainerlist = res?.documents?.filter(x => x.typeCategory === "ULDcontainerType");
      // this.containerTypeList = res?.documents?.filter(x => x.typeCategory === "containerSize");
      this.loadTypeList = res?.documents?.filter(x => x.typeCategory === "shipmentType");
      this.loadTypeListOriginal = res?.documents?.filter(x => x.typeCategory === "shipmentType");
      // this.shipmentTypes = res?.documents?.filter(x => x.typeCategory === "shipmentType");
      this.shipmentTypes = res?.documents?.filter(x => (x.typeCategory === "carrierType" && (x?.typeName?.toLowerCase() == "ocean" || x?.typeName?.toLowerCase() == "air")));
      this.dimensionUnitList = res?.documents?.filter(x => x.typeCategory === "dimensionUnit");
      this.palletTypeslist = res?.documents?.filter(x => x.typeCategory === "palletType");
      if (this.isImport) {
        this.ImportShipmentTypelist = res?.documents?.filter(x => x.typeCategory === "ImportShipmentType");
        this.ImportShipmentTypelistAir = res?.documents?.filter(x => x.typeCategory === "ImportShipmentTypeAir");
      } else if (this.isExport) {
        this.ImportShipmentTypelist = res?.documents?.filter(x => x.typeCategory === "ExportShipmentType");
        this.ImportShipmentTypelistAir = res?.documents?.filter(x => x.typeCategory === "ExportShipmentTypeAir");
      } else if (this.isTransport) {
        this.ImportShipmentTypelist = res?.documents?.filter(x => x.typeCategory === "ShipmentTypeLand");
      }

      // if (!this.isExport) {
      // this.addBatchForm?.get('Shipment_Type').setValue(this.shipmentTypes[0]?.systemtypeId)
      // this.addBatchForm?.get('loadType').setValue(this.loadTypeListOriginal[0]?.systemtypeId)
      // }
    });


    this.cargoTypeList = this.cargoTypeList.map((x) => x.typeName?.toUpperCase())
  }
  podPort: any
  podChange(e) {

    this.podPort = this.portDataValue.filter(x => x.portId === e)

    if (this.podPort && this.fpodPort) {
      if (this.podPort[0].portId === this.fpodPort[0].portId) {
        this.addBatchForm?.get('itemType').setValue('LC')
        this.addBatchForm?.get('departureMode').setValue('Truck')
      }
      if (this.podPort[0].portId !== this.fpodPort[0].portId) {
        if (this.fpodPort[0]?.isSez) {
          this.addBatchForm?.get('itemType').setValue('TP')

        }
        if (this.fpodPort[0]?.isIcd) {
          this.addBatchForm?.get('itemType').setValue('SMTP')

        }
      }
    }
  }
  fpodPort: any
  fpodChange(e) {

    this.fpodPort = this.portDataValue.filter(x => x.portId === e)


    if (this.fpodPort[0]?.isSez) {
      this.addBatchForm?.get('departureMode').setValue('Truck')

    }
    if (this.fpodPort[0]?.isIcd) {
      this.addBatchForm?.get('departureMode').setValue('Rail')

    }



    if (this.podPort[0]?.portId === this.fpodPort[0]?.portId) {
      this.addBatchForm?.get('itemType').setValue('LC')
      this.addBatchForm?.get('departureMode').setValue('Truck')

    }
    if (this.podPort[0]?.portId !== this.fpodPort[0]?.portId) {
      if (this.fpodPort[0]?.isSez) {
        this.addBatchForm?.get('itemType').setValue('TP')

      }
      if (this.fpodPort[0]?.isIcd) {
        this.addBatchForm?.get('itemType').setValue('SMTP')

      }
    }

  }
  getRemarks(id) {
    return false
  }
  setfinalVessel(e) {
    this.finalVoyageList = []
    if (!e) { return false }
    this.addBatchForm?.get('finalVoyage').setValue(this.finalVoyageList[0]?.voyageId || '')
    let vesselData;
    vesselData = this.voyageList?.filter((x) => x?.vesselId === e)[0]
    vesselData?.voyage?.forEach(element => {
      if (element?.shipping_line === this.addBatchForm?.value.shipping_line) {
        this.finalVoyageList.push(element)
      }
    });
  }
  setBackVessel(e) {
    this.backVoyageList = []
    if (!e) { return false }
    let vesselData;
    vesselData = this.voyageList?.filter((x) => x?.vesselId === e)[0]
    vesselData?.voyage?.forEach(element => {
      if (element?.shipping_line === this.addBatchForm?.value.shipping_line2) {
        this.backVoyageList.push(element)
      }
    });
  }

  getUsersForDropDown() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      "status": true
    }
    this._api.getSTList("user", payload)?.subscribe((res: any) => {
      this.userList = res?.documents;
    });
  }




  public findInvalidControls() {
    const invalid = [];
    const controls = this.addBatchForm?.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }
  filechange(event: any, fileupload) {
    this.addBatchForm?.get(fileupload).setValue(event.target.files[0]);
  }
  calculator() {
    window.open('Calculator:///');
  }
  setShipper(e) {
    if (!e) { return false }
    let data = this.billingPartyList?.filter((x) => x?.partymasterId === e)[0];
    if (data) {
      this.billingBranchList = data?.branch
      this.addBatchForm?.get('ops_coordinator').setValue(data?.opsName || '')
      this.addBatchForm?.get('sales_person').setValue(data?.saleName || '')
    }
  }


  enquiryUpdate(res) {
    let batchArray = this.enquiryDetails?.batches || [];
    batchArray.push({
      batchNo: res?.batchNo,
      batchId: res?.batchId,
    })
    let url = "enquiry/" + this.enquiryDetails.enquiryId;
    let data = {
      ...this.enquiryDetails, enquiryStatus: 'Job Created',
      batches: batchArray
    }
    this.commonService.UpdateToST(url, data).subscribe()
  }
  onShowDetails() {
    if (this.EnquiryId) {
      this.isExpand = !this.isExpand;
    }
  }
  containerNoList: containermaster[] = []
  getContainerData() {
    let payload = this.commonService.filterList()
    payload.sort = {
      "desc": ["createdOn"]
    },
      this.commonService.getSTList('containermaster', payload).subscribe((res: any) => {
        this.containerNoList = res?.documents;
      })
  }
  quotationDetails: any
  quotationId: any = ''

  containersData: any = []

  shipperName: any

  disableForm() {
    let formData = []
    formData.push({
      shipper: '',
      cargoType: '',
      inco_term: '',
      shippping_term: '',
      shipment_term: '',
      ops_coordinator: '',
      load_place: '',
      poldetentionfreeDay: '',
      poldetentionAmount: '',
      poldetentioncurrency: '',
      pod_detentionfreeDay: '',
      pod_detentionAmount: '',
      pod_detentioncurrency: '',
      product_id: '',
      cosignee: '',
      tank_type: '',
      loadplace: '',
      forwarderName: '',
      shipping_line: '',
      SalesPerson: '',
      BookingParty: '',
      StcQuatation: '',
      StcRefNo: '',
      moveType: '',
      invoiceParty: '',
      unNo: '',
    })
    Object.keys(formData[0])
      .forEach(key => {
        this.addBatchForm?.controls[key]?.disable();
      })
  }


  getdata() {

    let payload = this.commonService.filterList()
    payload.sort = {
      "desc": ["createdOn"]
    },
      this.commonService.getSTList('product', payload).subscribe((data) => {
        this.productData = data.documents;

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
    });
  }
  loadportchange(e?) {
    // this.preCarrigeList1 = this.ICDlocationList?.filter(x => x.portId === this.addBatchForm?.value.load_port)
    // if (this.isAddMode && e) {
    //   this.addBatchForm?.controls.pre_carriage.setValue('')
    // }
    return
      const lastFormGroup = this.transport.at(this.transport.length - 1) as FormGroup;
        if (lastFormGroup)
          lastFormGroup.patchValue({
            location: this.addBatchForm.value.load_port
          });

    return
    this.preCarrigeList1 = this.ICDlocationList?.filter(x => x.country?.toLowerCase() === 'india')
    if (this.isAddMode && e) {
      this.addBatchForm?.controls.pre_carriage.setValue('')
    }
  }
  desPortchange(e?) {
    // this.preCarrigeList = this.ICDlocationList?.filter(x => x.portId === this.addBatchForm?.value.discharge_port)
    // if (this.isAddMode && e) {
    //   this.addBatchForm?.controls.on_carriage.setValue('')
    // }
    return
      const firstFormGroup = this.transport1.at(0) as FormGroup;
        if (firstFormGroup)
          firstFormGroup.patchValue({
            location: this.addBatchForm.value.discharge_port
          });

  }
  getAirPort() {
    this.portList = []
    this.portListDest = []
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      ...payload.query,
      status: true,
    }
    this.commonService.getSTList("airportmaster", payload)?.subscribe((res: any) => {
      res?.documents?.map(x => (
        this.portList.push({
          portId: x?.airportmasterId,
          portName: x?.airPortname,
          portTypeName: 'air'
        }),
        this.portListDest.push({
          portId: x?.airportmasterId,
          portName: x?.airPortname,
          portTypeName: 'air'
        })
      ));
    });
  }

  searchPortLocation$ = new Subject<string>();

  searchPortLocation(event) {
    if (!event) return;
    this.searchPortLocation$.next(event);
  }
  setupSearchLocationSubscription() {
    this.searchPortLocation$.pipe(
      debounceTime(300),  // Wait 300ms before making an API call
      distinctUntilChanged(),  // Avoid duplicate requests for the same input
      switchMap(async (event) => this.fetchPortLocationList(event))  // Cancel previous API call if a new one is made
    )
      .subscribe();
  }
  portLocationList = []
  fetchPortLocationList(event: string) {
    if (!event) {
      return
    }
    this.portLocationList = []
    let payload = this.commonService.filterList()
    if (payload) payload.query = {
      status: true,
      type: this.activeFrightAir ? 'airport' : 'port'
    }
    if (payload?.size) payload.size = 100
    let url;
    if (event) {
      let mustArray = {};
      mustArray['locationName'] = {
        "$regex": "\\Q" + event + "\\E",
        "$options": "i"
      }
      payload.query = {
        ...payload.query,
        ...mustArray
      }
    }
    url = this.commonService.getSTList1("search-port-and-location", payload)
    return url?.subscribe((res: any) => {
      this.portLocationList = res?.documents?.filter(
        (obj, index, self) => index === self.findIndex(o => o.locationId === obj.locationId)
      ) || []
    });
  }

  searchPort(event: string) {
    if (!event) return;
    this.searchPort$.next(event);  // Push the event to the Subject
  }
  setupSearchSubscription() {
    this.searchPort$.pipe(
      debounceTime(300),  // Wait 300ms before making an API call
      distinctUntilChanged(),  // Avoid duplicate requests for the same input
      switchMap(async (event) => this.fetchPortList(event))  // Cancel previous API call if a new one is made
    )
      .subscribe();
  }
  setupSearchSubscription1() {
    this.searchPortDest$.pipe(
      debounceTime(300),  // Wait 300ms before making an API call
      distinctUntilChanged(),  // Avoid duplicate requests for the same input
      switchMap(async (event) => this.fetchPortList1(event))  // Cancel previous API call if a new one is made
    )
      .subscribe();
  }
  fetchPortList(event: string) {
    this.portList = [];
    this.portDataValue = [];

    let payload = this.commonService.filterList();
    if (payload) payload.query = { status: true };
    if (payload?.size) payload.size = 100;
    if (payload?.project) payload.project = this.activeFrightAir ? [] : ["portDetails.portName", "portDetails.portTypeName", "portId"];

    let mustArray = this.activeFrightAir ? {
      'airPortname': {
        "$regex": event,
        "$options": "i"
      }
    } : {
      'portDetails.portName': {
        "$regex": event,
        "$options": "i"
      }
    };

    payload.query = { ...payload.query, ...mustArray };

    let url = this.activeFrightAir
      ? this.commonService.getSTList("airportmaster", payload)
      : this.commonService.getSTList("port", payload);

    return url?.subscribe((res: any) => {
      res?.documents?.map(x => (
        this.portList.push({
          portId: this.activeFrightAir ? x?.airportmasterId : x?.portId,
          portName: this.activeFrightAir ? x.airPortname : x?.portDetails?.portName,
          portTypeName: this.activeFrightAir ? 'air' : 'port'
        })
      ));

      this.portList = this.portList.filter(
        (obj, index, self) => index === self.findIndex(o => o.portId === obj.portId)
      );

      if (!this.activeFrightAir) {
        this.portDataValue = res?.documents;
      }
    });
  }

  portListDest: any = []

  searchPortDest(event: string) {
    if (!event) return;
    this.searchPortDest$.next(event);  // Push the event to the Subject
  }
  fetchPortList1(event: string) {

    this.portListDest = [];
    this.portDataValue = [];

    let payload = this.commonService.filterList();
    if (payload) payload.query = { status: true };
    if (payload?.size) payload.size = 100;
    if (payload?.project) payload.project = this.activeFrightAir ? [] : ["portDetails.portName", "portDetails.portTypeName", "portId"];

    let mustArray = this.activeFrightAir ? {
      'airPortname': {
        "$regex": event,
        "$options": "i"
      }
    } : {
      'portDetails.portName': {
        "$regex": event,
        "$options": "i"
      }
    };

    payload.query = { ...payload.query, ...mustArray };

    let url = this.activeFrightAir
      ? this.commonService.getSTList("airportmaster", payload)
      : this.commonService.getSTList("port", payload);

    return url?.subscribe((res: any) => {
      res?.documents?.map(x => (
        this.portListDest.push({
          portId: this.activeFrightAir ? x?.airportmasterId : x?.portId,
          portName: this.activeFrightAir ? x.airPortname : x?.portDetails?.portName,
          portTypeName: this.activeFrightAir ? 'air' : 'port'
        })
      ));

      this.portListDest = this.portListDest.filter(
        (obj, index, self) => index === self.findIndex(o => o.portId === obj.portId)
      );

      if (!this.activeFrightAir) {
        this.portDataValue = res?.documents;
      }
    });
  }
  searchPortAll(event) {
    this.portListDest = []
    this.portList = []
    let payload = this.commonService.filterList()

    if (payload) payload.query = {
      status: true,
    }
    if (payload?.size) payload.size = 100

    let url;
    if (this.activeFrightAir) {
      if (event) {
        if (event.destPortId) {
          payload.query = {
            ...payload.query,

            "$or": [
              ...(payload.query["$or"] || []),
              { "airportmasterId": event?.destPortId },
            ],
          };
        }

        if (event.loadPortId) {
          payload.query = {
            ...payload.query,
            "$or": [
              ...(payload.query["$or"] || []),
              { "airportmasterId": event?.loadPortId },
            ],
          };
        }
      }
      url = this.commonService.getSTList("airportmaster", payload)
    } else {
      if (payload?.project) payload.project = ["portDetails.portName", "portDetails.portTypeName", "portId"];
      if (event) {
        if (event.destPortId) {
          payload.query = {
            ...payload.query,

            "$or": [
              ...(payload.query["$or"] || []),
              { "portId": event?.destPortId },
            ],
          };
        }

        if (event.loadPortId) {
          payload.query = {
            ...payload.query,
            "$or": [
              ...(payload.query["$or"] || []),
              { "portId": event?.loadPortId },
            ],
          };
        }

        if(this.tanshipmentHOPPorts?.length > 0){
          this.tanshipmentHOPPorts?.filter((x)=>{
            payload.query = {
              ...payload.query,
              "$or": [
                ...(payload.query["$or"] || []),
                { "portId": x },
              ],
            }
          })
         

        }


      }

      url = this.commonService.getSTList("port", payload)
    }
    url?.subscribe((res: any) => {

      const portData = res?.documents?.map(x => ({
        portId: this.activeFrightAir ? x?.airportmasterId : x?.portId,
        portName: this.activeFrightAir ? x.airPortname : x?.portDetails?.portName,
        portTypeName: this.activeFrightAir ? 'air' : 'port'
      }));

      this.searchPortDataList = portData || []

      this.portListDest.push(...portData);
      this.portList.push(...portData);

      if (!this.activeFrightAir) {
        this.portDataValue = res?.documents;
      }
    });
  }
  searchPortDataList: any = []
  getPortDropDowns() {
    this.portList = []
    this.portListDest = []
    let payload = this.commonService.filterList()

    if (payload) payload.query = {
      status: true,
    }
    if (payload?.size) payload.size = 100
    if (payload?.project) payload.project = ["portDetails.portName", "portDetails.portTypeName", "portId"];

    this.commonService.getSTList("port", payload)?.subscribe((res: any) => {
      res?.documents?.map(x => (
        this.portList.push({
          portId: this.activeFrightAir ? x?.airportmasterId : x?.portId,
          portName: this.activeFrightAir ? x.airPortname : x?.portDetails?.portName,
          portTypeName: 'port'
        }),

        this.portListDest.push({
          portId: this.activeFrightAir ? x?.airportmasterId : x?.portId,
          portName: this.activeFrightAir ? x.airPortname : x?.portDetails?.portName,
          portTypeName: 'port'
        })
      ));
      this.portDataValue = res?.documents;

    });
  }



  activeFright
  activeFrightAir: boolean = false;
  railandland: boolean = false;
  airandocean: boolean = false;
  // shipmentType() {
  //   this.activeFright = this.shipmentTypes?.find(x => x.systemtypeId === this.addBatchForm.value.Shipment_Type)?.typeName?.toLowerCase();
  //   this.loadTypeList = this.loadTypeListOriginal?.filter((x) => ['FCL','LCL']?.find(t => t?.toLowerCase() === x.typeName?.toLowerCase()))
  // }


  shipmentType(isReset: boolean = false) {
    // if(isReset){
    //   this.addBatchForm.get('shipping_line').setValue(''); 
    //   this.addBatchForm.get('load_port').setValue('');
    //   this.addBatchForm.get('discharge_port').setValue('');
    //   this.addBatchForm.get('backupShippingLine').setValue('');
    // }
    this.activeFright = this.shipmentTypes?.find(x => x.systemtypeId === this.addBatchForm.value.Shipment_Type)?.typeName?.toLowerCase();
    this.activeFrightAir = false
    if (this.activeFright == 'air') {
      if (this.isAddMode || this.lastSegment == 'Draft') {
        this.getAirPort()
      }
      // this.locationList = this.locationListOriginal?.filter((x) => x?.ICD)
      this.activeFrightAir = true
      this.loadTypeList = this.loadTypeListOriginal?.filter((x) => ['Loose', 'ULD Container']?.find(t => t.toLowerCase() === x.typeName.toLowerCase()))
    } else if (this.activeFright == 'ocean') {
      // this.locationList = this.locationListOriginal?.filter((x) => x?.ICD || x.CFS || x.Yard)
      if (this.isAddMode || this.lastSegment == 'Draft') {
        this.getPortDropDowns()
      }
      this.loadTypeList = this.loadTypeListOriginal?.filter((x) => ['FCL', 'LCL']?.find(t => t.toLowerCase() === x.typeName.toLowerCase()))
    }

    this.partyMasterComponent.activeFrightAir = this.activeFrightAir

    if (this.isAddMode) {
      this.addBatchForm.controls['loadType'].setValue('');
    }

    // if (['Air', 'Ocean']?.find(t => t === this.shipmentTypes?.find(x => x.systemtypeId === this.addBatchForm.value.Shipment_Type)?.typeName)) {
    //   const containerArray = this.addBatchForm.get('container') as FormArray;
    //   containerArray.clear();
    // } else { 
    //   const containerArray = this.addBatchForm.get('container') as FormArray;
    //   containerArray.clear(); 
    // }

  }

  showContainer: boolean = false;
  showPallet: boolean = false;
  typeOfWay: string = '';

  getTabs() {
    let loadName = this.loadTypeList.find((x) => x.systemtypeId == this.addBatchForm.value.loadType)?.typeName.toLowerCase() || '';
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

  getLCLCargoControls(): AbstractControl[] {
    return (this.empForm?.get('cargos') as FormArray)?.controls;
  }

  addLCLValue() {
    const LCLArray = [];
    this.getLCLCargoControls()?.forEach(element => {
      let LCL = {
        ...element.value,
        lclShipperName: this.shipperList?.filter(x => x.partymasterId === element.value.lclShipper)[0]?.name || '',
      }

      LCLArray.push(LCL)
    });
    return LCLArray;
  }

  addContainerValue() {
    const containerArray = [];
    this.getContainerControls().forEach(element => {
      let container = {
        typeOfWay: this.typeOfWay || 'Container',
        truckType: element.value.truckType || '',
        wagonType: element.value.wagonType || '',
        containerType: element.value.containerType || '',
        noOfContainer: element.value.noOfContainer || '',
        containerNo: element.value.containerNo || '',
        grossWeightContainer: element.value.grossWeightContainer?.toString() || '',
        unit: element.value.unit || '',
        unitName: this.uomData.filter(x => x.uomId === element.value.unit)[0]?.uomShort || '',
      }

      containerArray.push(container)
    });
    return containerArray;
  }

  updateContainer(batch) {

    this.getContainerControls().forEach(element => {
      if (element.value.containerNo) {
        if (this.listContainer?.some(item => item.containerNo === element.value.containerNo)) {
          let data = this.listContainer?.find(item => item.containerNo === element.value.containerNo)

          let updatedata = this.tankData?.find(item => item.mastercontainerId === data?.containermasterId)
          this.commonService.UpdateToST(`containermaster/${data?.containermasterId}`, { ...data, containerStatus: 'Reserved' })?.subscribe((res) => {

            let addArray = {
              notifyCustomer: false,
              containerId: updatedata?.containerId ? updatedata?.containerId : '',
              tenantId: this.tenantId,
              isNewContainer: false,
              batchId: batch?.batchId,
              batchNo: batch?.batchNo,
              vesselName: batch?.quotationDetails?.vesselName || batch?.plannedVesselName,
              tankStatusName: batch?.enquiryData?.tankStatusName,
              tankStatusId: batch?.enquiryData?.tankStatusId,
              voyageNo: batch?.quotationDetails?.voyageName || batch?.plannedVoyageId,
              shippingLineId: batch?.finalShippingLineId || batch?.quotationDetails?.carrierId,
              shippingLineName: batch?.routeDetails?.finalShippingLineName || batch?.quotationDetails?.carrierName,
              mastercontainerId: res.containermasterId || '',
              containerNumber: res?.containerNo || '',
              containerTypeId: res?.containerTypeId,
              containerDescription: '',
              containerTypeName: res?.containerType || '',
              containerType: res?.containerType || '',
              containerSize: '0',

              imoType: '',
              imoTypeId: '',
              netWeight: element.value.grossWeightContainer || '',
              package: updatedata?.package ? updatedata?.package : "0.00",
              grossWeight: element.value.grossWeightContainer || '',
              isoContainerCode: '',
              tareWeight: updatedata?.tareWeight ? updatedata?.tareWeight : "0.00",
              sealNo: '',
              unit: this.uomData.filter(x => x.uomId === element.value.unit)[0]?.uomShort || '',
              rfidNo: '',
              containerHeight: '',
              cargoType: batch?.cargoType,
              cargoTypeId: '',
              evgmNumber: '',
              evgmDate: null,

              blNumber: updatedata?.blNumber ? updatedata?.blNumber : '',
              blDate: '',
              shippingBillNumber: '',
              sbNo: '',
              sbDate: '',
              isSobEmail: false,
              bondNumber: '',
              igmNumber: '',
              statusFlag: '',
              statusFlagId: '',
              status: true,
              depoIn: '',
              depotOut: '',
              depotDate: '',
              depotDateName: '',
              depoInName: '',
              icdIn: '',
              icdInName: '',
              icdOut: '',
              icdOutName: '',
              factoryIn: '',
              factoryInName: '',
              factoryOut: '',
              factoryOutName: '',
              terminalIn: '',
              terminalInName: '',
              terminalOut: '',
              terminalOutName: '',
              mtyValidity: '',
              mtyReturn: '',
              cfsIn: '',
              cfsOut: '',
              railOut: '',
              dischargeDate: '',
              reject: '',
              rejectName: '',
              sobDate: '',
              arrivalDate: '',
              deliveryDate: '',
              override_orgId: '1',
              shipmentNumber: '',
              override_tId: 'true',
              "isExport": (this.isExport || this.isTransport)
            }
            if ((this.tankData?.some(item => item.mastercontainerId === data?.containermasterId))) {
              this.commonService.batchUpdate('container/batchupdate', [addArray])?.subscribe()
            } else {
              this.commonService.batchInsert('container/batchinsert', [addArray])?.subscribe()
            }
          })
        } else {
          let data = {
            containerNo: element.value.containerNo,
            orgId: this.commonfunction.getAgentDetails().orgId,
            cargoNo: '12',
            cargoTypeName: 'test',
            containerTypeId: this.containerTypeList.filter((x) => x?.typeName === element.value.containerType)[0]?.systemtypeId,
            containerType: element.value.containerType,
            containerSize: '0',
            tankStatusId: '',
            tankStatus: '',
            tankType: '',
            tarWeight: element.value.grossWeightContainer || '',
            tankCapacity: '',
            exitOffHireDate: new Date(),
            onHireDate: new Date(),
            dateOfManufacture: new Date(),
            oneWay: false,
            loadCapacity: '',

            containerOperator: '',
            containerOperatorName: '',
            pickLocation: '',
            pickLocationName: '',
            dropLocation: '',
            dropLocationName: '',
            yardNamId: '',
            yard: '',
            yardName: '',
            remarks: '',
            status: true,
            containerStatus: "Reserved",
            containerStatusId: true,
            date: new Date()
          }
          this.commonService.addToST('containermaster', data)?.subscribe((res) => {
            let addArray = {
              notifyCustomer: false,
              containerId: '',
              tenantId: this.tenantId,
              isNewContainer: false,
              batchId: batch?.batchId,
              batchNo: batch?.batchNo,
              vesselName: batch?.quotationDetails?.vesselName || batch?.plannedVesselName,
              tankStatusName: batch?.enquiryData?.tankStatusName,
              tankStatusId: batch?.enquiryData?.tankStatusId,
              voyageNo: batch?.quotationDetails?.voyageName || batch?.plannedVoyageId,
              shippingLineId: batch?.finalShippingLineId || batch?.quotationDetails?.carrierId,
              shippingLineName: batch?.routeDetails?.finalShippingLineName || batch?.quotationDetails?.carrierName,

              mastercontainerId: res.containermasterId || '',
              containerNumber: res?.containerNo || '',
              containerTypeId: res?.containerTypeId,
              containerDescription: '',
              containerTypeName: res?.containerType || '',
              containerType: res?.containerType || '',
              containerSize: '0',

              imoType: '',
              imoTypeId: '',
              netWeight: element.value.grossWeightContainer || '',
              package: "0.00",
              grossWeight: element.value.grossWeightContainer || '',
              isoContainerCode: '',
              tareWeight: "0.00",
              sealNo: '',
              unit: this.uomData.filter(x => x.uomId === element.value.unit)[0]?.uomShort || '',
              rfidNo: '',
              containerHeight: '',
              cargoType: batch?.cargoType,
              cargoTypeId: '',
              evgmNumber: '',
              evgmDate: null,

              blNumber: '',
              blDate: '',
              shippingBillNumber: '',
              sbNo: '',
              sbDate: '',
              isSobEmail: false,
              bondNumber: '',
              igmNumber: '',
              statusFlag: '',
              statusFlagId: '',
              status: true,
              depoIn: '',
              depotOut: '',
              depotDate: '',
              depotDateName: '',
              depoInName: '',
              icdIn: '',
              icdInName: '',
              icdOut: '',
              icdOutName: '',
              factoryIn: '',
              factoryInName: '',
              factoryOut: '',
              factoryOutName: '',
              terminalIn: '',
              terminalInName: '',
              terminalOut: '',
              terminalOutName: '',
              mtyValidity: '',
              mtyReturn: '',
              cfsIn: '',
              cfsOut: '',
              railOut: '',
              dischargeDate: '',
              reject: '',
              rejectName: '',
              sobDate: '',
              arrivalDate: '',
              deliveryDate: '',
              override_orgId: '1',
              shipmentNumber: '',
              override_tId: 'true',
              "isExport": (this.isExport || this.isTransport)
            }
            this.commonService.batchInsert('container/batchinsert', [addArray])?.subscribe()
          })
        }
      }

    });
  }
  getChargecontainerLength(): number {
    return (this.addBatchForm.get('container') as FormArray).length;
  }
  getContainerControls(): AbstractControl[] {
    return (this.addBatchForm.get('container') as FormArray).controls;
  }

  getChargeControls() {
    return (this.addBatchForm.get('charge') as FormArray).controls;
  }

  getChargeControlsLength(): number {
    return (this.addBatchForm.get('charge') as FormArray).length;
  }
  addContainerRow(item?: any): void {
    const row = this.formBuilder.group({
      wagonType: [item ? item.wagonType : null, this.typeOfWay == 'Wagon' ? Validators.required : ''],
      truckType: [item ? item.truckType : null, this.typeOfWay == 'Truck' ? Validators.required : ''],
      containerType: [item ? item.containerType : null, this.typeOfWay == 'Container' ? Validators.required : ''],
      containerNo: [item ? item.containerNo : ''],
      noOfContainer: [item ? item.noOfContainer : 1, Validators.required],
      grossWeightContainer: [item ? item.grossWeightContainer : 0],
      unit: [item ? item.unit : '']
    });

    (this.addBatchForm.get('container') as FormArray).push(row);
  }
  deleteRow(index: number): void {
    (this.addBatchForm.get('container') as FormArray).removeAt(index);
  }

  onUpdate(flag) {



    this.submittedBranch = true;
    if (flag && !this.addBatchForm?.value.branch) {
      this.notification.create(
        'error',
        'Please select Branch',
        ''
      );
      return false
    }



    const transportArray = this.addBatchForm.get('transport') as FormArray;
        const transporthubArray = this.addBatchForm.get('transhipmentHops') as FormArray;
        console.log(this.findInvalidControls1(transportArray));
        transporthubArray.value.filter(x =>
          this.portList?.filter(p => {
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


        // let originID = '';
        // let originName = '';
        // let destinationID = '';
        // let destinationName = '';

        // if (this.railandland) {
        //   if (this.transport.at(0).get('locationType').value == 'location') {
        //     originID = this.transport.at(0).get('location').value
        //     originName = this.locationList.filter(x => x.locationId === this.transport.at(0).get('location').value)[0]?.locationName
        //   } else if (this.transport.at(0).get('locationType').value == 'port') {
        //     originID = this.transport.at(0).get('location').value
        //     originName = this.portList.filter(x => x.portId === this.transport.at(0).get('location').value)[0]?.portName
        //   } else {
        //     originName = this.transport.at(0).get('addressId').value ? this.transport.at(0).get('addressId').value : this.transport.at(0).get('address').value
        //   }
    
        //   if (this.transport.at(this.transport?.controls?.length - 1).get('locationType').value == 'location') {
        //     destinationID = this.transport.at(this.transport?.controls?.length - 1).get('location').value
        //     destinationName = this.locationList.filter(x => x.locationId === this.transport.at(this.transport?.controls?.length - 1).get('location').value)[0]?.locationName
        //   } else if (this.transport.at(this.transport?.controls?.length - 1).get('locationType').value == 'port') {
        //     destinationID = this.transport.at(this.transport?.controls?.length - 1).get('location').value
        //     destinationName = this.portListDest?.filter(x => x.portId === this.transport.at(this.transport?.controls?.length - 1).get('location').value)[0]?.portName
        //   } else {
        //     destinationName = this.transport.at(this.transport?.controls?.length - 1).get('addressId').value ? this.transport.at(this.transport?.controls?.length - 1).get('addressId').value : this.transport.at(0).get('address').value
        //   }
        // } else {
    
        //   if (this.transport.at(0).get('locationType').value == 'location') {
        //     originID = this.transport.at(0).get('location').value
        //     originName = this.locationList.filter(x => x.locationId === this.transport.at(0).get('location').value)[0]?.locationName
        //   } else {
        //     originName = this.transport.at(0).get('addressId').value ? this.transport.at(0).get('addressId').value : this.transport.at(0).get('address').value
        //   }
        //   if (this.transport1.at(this.transport1?.controls?.length - 1).get('locationType').value == 'location') {
        //     destinationID = this.transport1.at(this.transport1?.controls?.length - 1).get('location').value
        //     destinationName = this.locationList.filter(x => x.locationId === this.transport1.at(this.transport1?.controls?.length - 1).get('location').value)[0]?.locationName
        //   } else {
        //     destinationName = this.transport1.at(this.transport1?.controls?.length - 1).get('addressId').value ? this.transport1.at(this.transport1?.controls?.length - 1).get('addressId').value : this.transport1.at(this.transport1?.controls?.length - 1).get('address').value
        //   }
        // }


        
    // let stuffing_location:any={
    //   "stuffing_location_Type":this.addBatchForm.value?.stuffing_location_Type
    // };
    // if(this.addBatchForm.value?.stuffing_location_Type === 'factory'){
    //   stuffing_location={
    //     ...stuffing_location,
    //     "billingBranchStuffingId":this.addBatchForm.value?.billingBranchStuffing,
    //     "billingBranchStuffingName":this.billingBranchList.find(d=>d?.branch_name===this.addBatchForm.value?.billingBranchStuffing)?.branch_name,
    //     "Stuffing_shipper_address":this.addBatchForm?.value?.Stuffing_shipper_address
    //   }
    // }
    // if(this.addBatchForm.value?.stuffing_location_Type === 'cfs'){
    //   stuffing_location={
    //     ...stuffing_location,
    //     "stuffingLocationId":this.addBatchForm.value?.cfslocation,
    //     "stuffingLocationIdName":this.cfsDropdownOptions.find(d=>d?.value===this.addBatchForm.value?.cfslocation)?.label
    //   }
    // }
    this.submitted = true;
    if (this.addBatchForm?.invalid && !flag) {
      this.addBatchForm?.markAllAsTouched()
      return false
    }

    if (this.showPallet) {
      if (this.empForm?.invalid) {
        this.notification.create(
          'error',
          'Invalid Form',
          ''
        );
        return false
      }
    }

    let multiShipperData = this.shipperList?.filter((x) => this.addBatchForm?.value.multiShipper?.includes(x.partymasterId)).map((y) => {
      return {
        partymasterId: y.partymasterId,
        name: y.name,
        partyShortcode: y.partyShortcode
      }
    })
    const selectedUserIds = this.addBatchForm.value.userSelectList; // Array of userIds

    // Map selected userIds to full user objects with userName
    const accessUserList = selectedUserIds.map((id: string) => {
      const user = this.userDataList.find(u => u.userId === id);
      return {
        userId: user?.userId,
        userName: user?.userName
      };
    });

    let multiConsigeeData = this.consigneeList?.filter((x) => this.addBatchForm?.value.multiConsignee?.includes(x.partymasterId)).map((y) => {
      return {
        partymasterId: y.partymasterId,
        name: y.name,
        partyShortcode: y.partyShortcode
      }
    })

    this.portListDest = [...this.portListDest, ...this.searchPortDataList]
    this.portList = [...this.portList, ...this.searchPortDataList]

    var url = `${Constant.ADD_BATCH}/${this.id}`;

    let addBatchForm = this.addBatchForm?.value
    let newAgentAdvice = {
      ...this.batchDetail,
      "remarks": addBatchForm?.remarks || '',
      quickJob: true,
      isAccessAssigned: accessUserList.length > 0,
      accessUser: accessUserList,
      isCustomsOnly :  addBatchForm?.isCustomsOnly || false,
      isGRNRequired :  addBatchForm?.isGRNRequired || false,
      isCfsRequired : addBatchForm?.isCfsRequired || false,
      freeDaysTime : addBatchForm?.freeDaysTime || [],
      "statusOfBatch": this.batchDetail?.statusOfBatch ? this.batchDetail?.statusOfBatch : flag ? "Draft" : "Job Created",
      "enquiryDetails": {
        ...this.batchDetail?.enquiryDetails,
        looseCargoDetails: {
          cargos: this.addLCLValue() || [],
          grossWeight: this.totalGrossWeight?.toString() || '0',
          grossVolume: this.totalVolume?.toString() || '0',
        },
        backupShippingLine: this.addBatchForm?.get('backupShippingLine').value || '',
        backupShippingLineName: this.shippingLineList?.filter(x => x.shippinglineId === addBatchForm?.backupShippingLine)[0]?.name || '',
        "basicDetails": {
          ...this.batchDetail?.enquiryDetails?.basicDetails,

          multiShipper: multiShipperData,
          multiConsignee: multiConsigeeData,

          "ShipmentTypeId": addBatchForm?.Shipment_Type || '',
          "chaId": addBatchForm?.chaId || '',
          "chaName": this.partymasterList?.filter((x) => x.partymasterId == addBatchForm?.chaId)[0]?.name || '',
          "ShipmentTypeName": this.shipmentTypes?.filter((x) => x.systemtypeId == addBatchForm?.Shipment_Type)[0]?.typeName || '',
          "loadTypeId": addBatchForm?.loadType || '',
          "loadType": this.loadTypeList?.find((x) => x.systemtypeId == addBatchForm?.loadType)?.typeName || '',
          "importShipmentTypeId": addBatchForm?.importShipmentType || '',
          "importShipmentTypeName": [...this.ImportShipmentTypelistAir, ...this.ImportShipmentTypelist]?.find((x) => x.systemtypeId == addBatchForm?.importShipmentType)?.typeName || '',

          "billingBranch": addBatchForm?.billingBranch,
          "billingStateCode": this.billingBranchList?.filter(x => x.branch_name == addBatchForm?.billingBranch)[0]?.stateCodeBranch,
          "billingCountry": this.billingBranchList?.filter(x => x.branch_name == addBatchForm?.billingBranch)[0]?.branch_countryName || '',

          "invoicingPartyId": addBatchForm?.incoicing_party,
          "invoicingPartyName": this.invoicingpartyList?.filter(x => x.partymasterId === addBatchForm?.incoicing_party)[0]?.name,

          "chaPartyName": this.partymasterList?.filter(x => x.partymasterId === addBatchForm?.chaparty)[0]?.name || '',
          "chaPartyId": addBatchForm?.chaparty,
          mblNo: addBatchForm?.mblNo,
          hblNo: addBatchForm?.hblNo,
          mblStatus: addBatchForm?.mblStatus,
          hblStatus: addBatchForm?.hblStatus,
          bookingRef: addBatchForm?.bookingRef,
          agentName: this.agentList?.filter(x => x.partymasterId === addBatchForm?.agent)[0]?.name || '',
          agentId: addBatchForm?.agent || '',
          billingPartyName: this.billingPartyList?.filter(x => x.partymasterId === addBatchForm?.billingParty)[0]?.name || '',
          billingPartyId: addBatchForm?.billingParty || '',
          "consigneeId": addBatchForm?.cosignee,
          "consigneeName": this.consigneeList?.filter(x => x?.partymasterId === addBatchForm?.cosignee)[0]?.name,

          "notifyPartyId": addBatchForm?.notifyParty,
          "notifyPartyName": this.partymasterList?.filter(x => x.partymasterId === addBatchForm?.notifyParty)[0]?.name || '',

          incoTermId: addBatchForm?.inco_term,
          incoTermName: this.incotermList?.filter(x => x.systemtypeId === addBatchForm?.inco_term)[0]?.typeName,

          forwarderId: addBatchForm?.forworder,
          forwarderName: this.forwarderChaList?.filter(x => x.partymasterId === addBatchForm?.forworder)[0]?.name,

          opsCoordinatorId: addBatchForm?.ops_coordinator || '',
          opsCoordinatorName: this.userList?.filter(x => x.userId === addBatchForm?.ops_coordinator)[0]?.name || '',
          salesPersonId: addBatchForm?.sales_person || '',
          salesPersonName: this.customerList?.filter(x => x.systemtypeId === addBatchForm?.sales_person)[0]?.typeName || '',
          "shipperId": addBatchForm?.shipper,
          "shipperName": this.shipperList?.filter(x => x.partymasterId === addBatchForm?.shipper)[0]?.name,

        },
        "cargoDetail": [],
        insurance: {
          cargo: this.addBatchForm.value.cargo || false,
          emptyContainer: this.addBatchForm.value.emptyContainer || false,
          palletization: this.addBatchForm.value.palletization || false,
          fumigation: this.addBatchForm.value.fumigation || false,
          warehousing: this.addBatchForm.value.warehousing || false,
        },
        containersDetails: this.addContainerValue() || [],
        "dgCargoDetails": {
          imoNumber: addBatchForm?.imoNumber,
          unNo: addBatchForm?.unNumber,
          packagingType: addBatchForm?.packagingType
        },
        "routeDetails": {
          ...this.batchDetail?.enquiryDetails?.routeDetails,
          loadPlace: addBatchForm?.load_place || '',
          loadPlaceName: this.locationList?.filter(x => x.locationId === addBatchForm?.load_place)[0]?.locationName || '',
          location: addBatchForm?.location,
          locationName: this.portLocationList?.filter(x => x.locationId === addBatchForm?.location)[0]?.locationName,
         
          // preCarriageId: addBatchForm?.pre_carriage || '',
          // preCarriageName: this.preCarrigeList1?.filter(x => x.locationId === addBatchForm?.pre_carriage)[0]?.name || '',
          loadPortId: addBatchForm?.load_port || '',
          loadPortName: this.portList?.filter((x) => x.portId == addBatchForm?.load_port)[0]?.portName || '',
          // transportOnCarriage: this.addBatchForm.value.transportOnCarriage,
          // transportPreCarriage: this.addBatchForm.value.transportPreCarriage,
          destPortId: addBatchForm?.discharge_port || '',
          destPortName: this.portListDest?.filter((x) => x.portId == addBatchForm?.discharge_port)[0]?.portName || '',
          // onCarriageId: addBatchForm?.on_carriage || '',
          // onCarriageName: this.preCarrigeList?.filter(x => x.locationId === addBatchForm?.on_carriage)[0]?.name || '',
          fpodId: addBatchForm?.fpod || '',
          fpodName: this.locationList?.filter(x => x.locationId === addBatchForm?.fpod)[0]?.locationName || '',
          freightTerms: addBatchForm?.freightTerms,
          freightTermsName: this.freightTermsList?.filter(x => x.systemtypeId === addBatchForm?.freightTerms)[0]?.typeName || '',

          shippingLineId: addBatchForm?.shipping_line,
          shippingLineName: this.shippingLineList?.filter(x => x.shippinglineId === addBatchForm?.shipping_line)[0]?.name || '',

          tsPortId: addBatchForm?.ts_port,
          tsPortName: this.portList?.filter(x => x.portId === addBatchForm?.ts_port)[0]?.portName || '',
          // destinationCustomClearance: this.addBatchForm.value.destinationCustomClearance,
          // originCustomClearance: this.addBatchForm.value.originCustomClearance,
         
          // voyageNumberforHop: this.addBatchForm.value.voyageNumber,
          // plannedVesselforHopId: this.addBatchForm.value.plannedVesselforHop,
          // plannedVesselforHopName: this.vesselList.find(x => x?.vesselId === this.addBatchForm.value.plannedVesselforHop)?.vesselName,
          
          etd: addBatchForm.etd || '',
          eta: addBatchForm.eta || '',
        },

        // transportDetails: {
        //   ...this.batchDetail?.enquiryDetails?.transportDetails,
        //   preCarriage: this.addBatchForm.value.preCarriage,
        //   onCarriage: this.addBatchForm.value.onCarriage,
        //   origin: this.addBatchForm.value.preCarriage ? this.addTransportValue() : [],
        //   destination: this.addBatchForm.value.onCarriage ? this.addTransport1Value() : []
        // },
        // customDetails: {
        //   ...this.batchDetail?.enquiryDetails?.customDetails,
        //   transportOrigin: this.addBatchForm?.value.transportOrigin || false,
        //   transportDestination: this.addBatchForm?.value.transportDestination || false,
        //   customOrigin: this.addBatchForm?.value.customOrigin,
        //   customDestinationLocation: this.addBatchForm?.value.customDestinationLocation,
        //   customDestinationLocationName: this.locationList.filter(x => x.locationId === this.addBatchForm.value.customDestinationLocation)[0]?.locationName,
        //   customOriginLocationName: this.locationList.filter(x => x.locationId === this.addBatchForm.value.customOriginLocation)[0]?.locationName,
        //   customOriginLocation: this.addBatchForm?.value.customOriginLocation,
        //   customDestination: this.addBatchForm?.value.customDestination,
        //   originOption: this.addBatchForm?.value.originOption,
        //   destinationOption: this.addBatchForm?.value.destinationOption,
        //   originfactory: this.addBatchForm?.value.originfactory,
        //   destinationfactory: this.addBatchForm?.value.destinationfactory,
        //   originPickupAddress: this.addBatchForm?.value.originPickupAddress,
        //   destinationDeliveryAddress: this.addBatchForm?.value.destinationDeliveryAddress,
        // },
        // transhipmentHops: transporthubArray.value,


      },

      "quotationDetails": {
        ...this.batchDetail?.quotationDetails,
        shipperName: this.shipperList?.filter(x => x.partymasterId === addBatchForm?.shipper)[0]?.name || '',
        flightId: this.addBatchForm.value.flightNo,
        vehicleId: "",
        flightNo: this.flightList?.filter((x) => x.airId === this.addBatchForm.value.flightNo)[0]?.flight || '',
        carrierId: addBatchForm?.shipping_line,
        carrierName: this.shippingLineList?.filter(x => x.shippinglineId === addBatchForm?.shipping_line)[0]?.name,

        loadPortId: addBatchForm?.load_port,
        loadPortName: this.portList?.filter((x) => x.portId == addBatchForm?.load_port)[0]?.portName || '',

        dischargePortId: addBatchForm?.discharge_port,
        dischargePortName: this.portListDest?.filter((x) => x.portId == addBatchForm?.discharge_port)[0]?.portName || '',


        vesselId: addBatchForm?.plannedVessel,
        vesselName: this.vesselList?.filter((x) => x.vesselId === addBatchForm?.plannedVessel)[0]?.vesselName,
        voyageNumber: addBatchForm?.voyageNumber,

      },
      "MBLStatus": this.batchDetail?.MBLStatus ? this.batchDetail?.MBLStatus : "PENDING",
      "HBLStatus": this.batchDetail?.HBLStatus ? this.batchDetail?.HBLStatus : "PENDING",
      "routeDetails": {
        ...this.batchDetail?.routeDetails,
        // transhipment: transporthubArray.value.length > 0 ? true : false,
        finalShippingLineId: addBatchForm?.shipping_line || '',
        finalShippingLineName: this.shippingLineList?.filter(x => x.shippinglineId === addBatchForm?.shipping_line)[0]?.name || '',

        samePOD: this.addBatchForm.value.samePOD || false,
        loadPortId: addBatchForm?.load_port,
        loadPortName: this.portList?.filter((x) => x.portId == addBatchForm?.load_port)[0]?.portName || '',

        destPortId: addBatchForm?.discharge_port,
        destPortName: this.portListDest?.filter((x) => x.portId == addBatchForm?.discharge_port)[0]?.portName || '',
        "etd": addBatchForm?.etd,
        "eta": addBatchForm?.eta,
        // "atd": addBatchForm?.etd,
        // "ata": addBatchForm?.eta,
        icdCfsValueId: addBatchForm?.location,
        icdCfsValueName: this.portLocationList?.filter(x => x.locationId === addBatchForm?.location)[0]?.locationName,
        finalVesselId: addBatchForm?.plannedVessel || '',
        finalVesselName: this.vesselList?.filter((x) => x.vesselId === addBatchForm?.plannedVessel)[0]?.vesselName || '',
        finalVoyageId: addBatchForm?.voyageNumber || '',
        finalVoyageName: addBatchForm?.voyageNumber || '',
        loadPlace: addBatchForm?.load_place || '',
        loadPlaceName: this.locationList?.filter(x => x.locationId === addBatchForm?.load_place)[0]?.locationName || '',
      },
    }

    // if(this.addBatchForm.value?.stuffing_location_Type){
    //   newAgentAdvice["enquiryDetails"]["stuffing_location"]=stuffing_location
    // }
    this.commonService.UpdateToST(url, newAgentAdvice).subscribe((res: any) => {
      if (res) {
        this.sharedEventService.emitChargeSaved();
        this.submitted = false;
        this.updateContainer(res);
        this.updateBatch.emit(res);
        setTimeout(() => {
          this.getMilestone.emit();
        }, 1000);

        // this.router.navigate([]);
      }
    }, error => {
      // this.router.navigate(["/batch/list"]);
      this.notification.create(
        'error',
        error?.error?.error?.message,
        ''
      );
    });
    this.getContainerList()

  }

 findInvalidControls1(formArray: FormArray) {
    formArray.controls.forEach((control, index) => {
      if (control ) {
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
        this.findInvalidControls1(control);
      }
    });
  }
  submittedBranch: boolean = false
  onSave(flag) {


    this.submittedBranch = true;
    if (flag && !this.addBatchForm?.value.branch) {
      this.notification.create(
        'error',
        'Please select Branch',
        ''
      );
      return false
    }

/////////////////
    //  const transportArray = this.addBatchForm.get('transport') as FormArray;
    //     const transporthubArray = this.addBatchForm.get('transhipmentHops') as FormArray;
    //     console.log(this.findInvalidControls1(transportArray));
    //     transporthubArray.value.filter(x =>
    //       this.portList?.filter(p => {
    //         if(p.portId === x?.load_port){
    //           x.load_portName = p?.portName
    //         }
    //       })
    //     )
    //     transporthubArray.value.filter(x =>
    //       this.vesselList?.filter(p => {
    //         if(p.vesselId === x?.plannedVessel){
    //           x.plannedVesselName = p?.vesselName
    //         }
    //       })
    //     )


        // let originID = '';
        // let originName = '';
        // let destinationID = '';
        // let destinationName = '';

        // if (this.railandland) {
        //   if (this.transport.at(0).get('locationType').value == 'location') {
        //     originID = this.transport.at(0).get('location').value
        //     originName = this.locationList.filter(x => x.locationId === this.transport.at(0).get('location').value)[0]?.locationName
        //   } else if (this.transport.at(0).get('locationType').value == 'port') {
        //     originID = this.transport.at(0).get('location').value
        //     originName = this.portList.filter(x => x.portId === this.transport.at(0).get('location').value)[0]?.portName
        //   } else {
        //     originName = this.transport.at(0).get('addressId').value ? this.transport.at(0).get('addressId').value : this.transport.at(0).get('address').value
        //   }
    
        //   if (this.transport.at(this.transport?.controls?.length - 1).get('locationType').value == 'location') {
        //     destinationID = this.transport.at(this.transport?.controls?.length - 1).get('location').value
        //     destinationName = this.locationList.filter(x => x.locationId === this.transport.at(this.transport?.controls?.length - 1).get('location').value)[0]?.locationName
        //   } else if (this.transport.at(this.transport?.controls?.length - 1).get('locationType').value == 'port') {
        //     destinationID = this.transport.at(this.transport?.controls?.length - 1).get('location').value
        //     destinationName = this.portListDest?.filter(x => x.portId === this.transport.at(this.transport?.controls?.length - 1).get('location').value)[0]?.portName
        //   } else {
        //     destinationName = this.transport.at(this.transport?.controls?.length - 1).get('addressId').value ? this.transport.at(this.transport?.controls?.length - 1).get('addressId').value : this.transport.at(0).get('address').value
        //   }
        // } else {
    
        //   if (this.transport.at(0).get('locationType').value == 'location') {
        //     originID = this.transport.at(0).get('location').value
        //     originName = this.locationList.filter(x => x.locationId === this.transport.at(0).get('location').value)[0]?.locationName
        //   } else {
        //     originName = this.transport.at(0).get('addressId').value ? this.transport.at(0).get('addressId').value : this.transport.at(0).get('address').value
        //   }
        //   if (this.transport1.at(this.transport1?.controls?.length - 1).get('locationType').value == 'location') {
        //     destinationID = this.transport1.at(this.transport1?.controls?.length - 1).get('location').value
        //     destinationName = this.locationList.filter(x => x.locationId === this.transport1.at(this.transport1?.controls?.length - 1).get('location').value)[0]?.locationName
        //   } else {
        //     destinationName = this.transport1.at(this.transport1?.controls?.length - 1).get('addressId').value ? this.transport1.at(this.transport1?.controls?.length - 1).get('addressId').value : this.transport1.at(this.transport1?.controls?.length - 1).get('address').value
        //   }
        // }



    this.submitted = true;
    if (this.addBatchForm?.invalid && !flag) {
      this.addBatchForm?.markAllAsTouched()
      return false
    }


    // let stuffing_location:any={
    //   "stuffing_location_Type":this.addBatchForm.value?.stuffing_location_Type
    // };
    // if(this.addBatchForm.value?.stuffing_location_Type === 'factory'){
    //   stuffing_location={
    //     ...stuffing_location,
    //     "billingBranchStuffingId":this.addBatchForm.value?.billingBranchStuffing,
    //     "billingBranchStuffingName":this.billingBranchList.find(d=>d?.branch_name===this.addBatchForm.value?.billingBranchStuffing)?.branch_name,
    //     "Stuffing_shipper_address":this.addBatchForm?.value?.Stuffing_shipper_address
    //   }
    // }
    // if(this.addBatchForm.value?.stuffing_location_Type === 'cfs'){
    //   stuffing_location={
    //     ...stuffing_location,
    //     "stuffingLocationId":this.addBatchForm.value?.cfslocation,
    //     "stuffingLocationIdName":this.cfsDropdownOptions.find(d=>d?.value===this.addBatchForm.value?.cfslocation)?.label
    //   }
    // }

    if (this.showPallet) {
      if (this.empForm?.invalid) {
        this.notification.create(
          'error',
          'Invalid Form',
          ''
        );
        return false
      }
    }

    let multiShipperData = this.shipperList?.filter((x) => this.addBatchForm?.value.multiShipper?.includes(x.partymasterId)).map((y) => {
      return {
        partymasterId: y.partymasterId,
        name: y.name,
        partyShortcode: y.partyShortcode
      }
    })
    const selectedUserIds = this.addBatchForm.value.userSelectList; // Array of userIds

    // Map selected userIds to full user objects with userName
    const accessUserList = selectedUserIds.map((id: string) => {
      const user = this.userDataList.find(u => u.userId === id);
      return {
        userId: user?.userId,
        userName: user?.userName
      };
    });

    let multiConsigeeData = this.consigneeList?.filter((x) => this.addBatchForm?.value.multiConsignee?.includes(x.partymasterId)).map((y) => {
      return {
        partymasterId: y.partymasterId,
        name: y.name,
        partyShortcode: y.partyShortcode
      }
    })


    let addBatchForm = this.addBatchForm?.value
    let newAgentAdvice = {
      "tenantId": "1",
      "customerId": addBatchForm?.shipper || '1',
      "orgId": this.commonfunction.getAgentDetails()?.orgId,
      "batchId": "",
      "isExport": this.isExport,
      "batchDate": new Date(),
      "quotationId": "",
      "isCustomsOnly" :  addBatchForm?.isCustomsOnly || false,
      isGRNRequired :  addBatchForm?.isGRNRequired || false,
      "isCfsRequired" : addBatchForm?.isCfsRequired || false,
      "quotationNo": "",
      "enquiryId": "",
      "amount": 0,
      "agentadviceId": "",
      isAccessAssigned: accessUserList.length > 0,
      accessUser: accessUserList,
      branchId: addBatchForm?.branch,
      branchName: this.branchList?.filter(x => x?.branchId === addBatchForm?.branch)[0]?.branchName || '',
      "jobCode": this.branchList?.filter(x => x?.branchId === addBatchForm?.branch)[0]?.jobCode || '',
      "status": true,
      "poDate": new Date(),
      "statusOfBatch": flag ? "Draft" : "Job Created",
      "batchNo": "",
      "remarks": addBatchForm?.remarks || '',
      freeDaysTime : addBatchForm?.freeDaysTime || [],
      "quickJob": true,
      "MBLStatus": "PENDING",
      "HBLStatus": "PENDING",
      nocDate: "",
      igmDate: "",
      igmNo: "",
      "enquiryDetails": {
        looseCargoDetails:   {
          cargos: this.addLCLValue() || [],
          grossWeight: this.totalGrossWeight?.toString() || '0',
          grossVolume: this.totalVolume?.toString() || '0',
        },
        backupShippingLine: this.addBatchForm?.get('backupShippingLine').value || '',
        backupShippingLineName: this.shippingLineList?.filter(x => x.shippinglineId === addBatchForm?.backupShippingLine)[0]?.name || '',
        "basicDetails": {
          // enquiryNo : '',
          mblNo: addBatchForm?.mblNo || '',
          hblNo: addBatchForm?.hblNo || '',
          mblStatus: addBatchForm?.mblStatus || '',
          chaId: addBatchForm?.chaId || '',
          "chaName": this.partymasterList?.filter(x => x.partymasterId === addBatchForm?.chaId)[0]?.name || '',
          hblStatus: addBatchForm?.hblStatus || '',
          bookingRef: addBatchForm?.bookingRef || '',
          "billingBranch": addBatchForm?.billingBranch,
          "billingStateCode": this.billingBranchList?.filter(x => x.branch_name == addBatchForm?.billingBranch)[0]?.stateCodeBranch || '',
          "billingCountry": this.billingBranchList?.filter(x => x.branch_name == addBatchForm?.billingBranch)[0]?.branch_countryName || '',

          "invoicingPartyId": addBatchForm?.incoicing_party || '',
          "invoicingPartyName": this.invoicingpartyList?.filter(x => x.partymasterId === addBatchForm?.incoicing_party)[0]?.name || '',

          "chaPartyName": this.partymasterList?.filter(x => x.partymasterId === addBatchForm?.chaparty)[0]?.name || '',
          "chaPartyId": addBatchForm?.chaparty,

          agentName: this.agentList?.filter(x => x.partymasterId === addBatchForm?.agent)[0]?.name || '',
          agentId: addBatchForm?.agent || '',
          billingPartyName: this.billingPartyList?.filter(x => x.partymasterId === addBatchForm?.billingParty)[0]?.name || '',
          billingPartyId: addBatchForm?.billingParty || '',

          "consigneeId": addBatchForm?.cosignee,
          "consigneeName": this.consigneeList?.filter(x => x?.partymasterId === addBatchForm?.cosignee)[0]?.name || '',

          "notifyPartyId": addBatchForm?.notifyParty,
          "notifyPartyName": this.partymasterList?.filter(x => x.partymasterId === addBatchForm?.notifyParty)[0]?.name || '',


          incoTermId: addBatchForm?.inco_term,
          incoTermName: this.incotermList?.filter(x => x.systemtypeId === addBatchForm?.inco_term)[0]?.typeName || '',

          forwarderId: addBatchForm?.forworder || '',
          forwarderName: this.forwarderChaList?.filter(x => x.partymasterId === addBatchForm?.forworder)[0]?.name || '',

          opsCoordinatorId: addBatchForm?.ops_coordinator || '',
          opsCoordinatorName: this.userList?.filter(x => x.userId === addBatchForm?.ops_coordinator)[0]?.name || '',
          salesPersonId: addBatchForm?.sales_person || '',
          salesPersonName: this.customerList?.filter(x => x.systemtypeId === addBatchForm?.sales_person)[0]?.typeName || '',

          "shipperId": addBatchForm?.shipper || '',
          "shipperName": this.shipperList?.filter(x => x.partymasterId === addBatchForm?.shipper)[0]?.name || '',

          multiShipper: multiShipperData,
          multiConsignee: multiConsigeeData,

          "ShipmentTypeId": addBatchForm?.Shipment_Type || '',
          "ShipmentTypeName": this.shipmentTypes?.filter((x) => x.systemtypeId == addBatchForm?.Shipment_Type)[0]?.typeName || '',
          "loadTypeId": addBatchForm?.loadType || '',
          "loadType": this.loadTypeList?.find((x) => x.systemtypeId == addBatchForm?.loadType)?.typeName || '',
          "importShipmentTypeId": addBatchForm?.importShipmentType || '',
          "importShipmentTypeName": [...this.ImportShipmentTypelistAir, ...this.ImportShipmentTypelist]?.find((x) => x.systemtypeId == addBatchForm?.importShipmentType)?.typeName || '',

          userBranch: addBatchForm?.branch || '',
          userBranchName: this.branchList?.filter(x => x?.branchId === addBatchForm?.branch)[0]?.branchName || '',
          userBranchStateCode: this.branchList?.filter(x => x?.branchId === addBatchForm?.branch)[0]?.addressInfo.stateCode || '',
          userJobCode: this.branchList?.filter(x => x?.branchId === addBatchForm?.branch)[0]?.jobCode || '',
        },
        containersDetails: this.addContainerValue() || [],
        "cargoDetail": [],
        "dgCargoDetails": {
          imoNumber: addBatchForm?.imoNumber,
          unNo: addBatchForm?.unNumber,
          packagingType: addBatchForm?.packagingType
        },
        "routeDetails": {

          // loadPlace: originID || '',
          // loadPlaceName: originName || '',
          loadPlace: addBatchForm?.load_place || '',
          loadPlaceName: this.locationList?.filter(x => x.locationId === addBatchForm?.load_place)[0]?.locationName || '',

          // location: this.addBatchForm.get('samePOD').value ? addBatchForm?.discharge_port : destinationID || '',
          // locationName: this.addBatchForm.get('samePOD').value ? this.portListDest?.filter((x) => x.portId == addBatchForm?.discharge_port)[0]?.portName : destinationName || '',

          location: addBatchForm?.location,
          locationName: this.portLocationList?.filter(x => x.locationId === addBatchForm?.location)[0]?.locationName,
         

          preCarriageId: addBatchForm?.pre_carriage || '',
          preCarriageName: this.preCarrigeList1?.filter(x => x.locationId === addBatchForm?.pre_carriage)[0]?.name || '',
          loadPortId: addBatchForm?.load_port || '',
          loadPortName: this.portList?.filter((x) => x.portId == addBatchForm?.load_port)[0]?.portName || '',
          transportOnCarriage: this.addBatchForm.value.transportOnCarriage,
          transportPreCarriage: this.addBatchForm.value.transportPreCarriage,
          destPortId: addBatchForm?.discharge_port || '',
          destPortName: this.portListDest?.filter((x) => x.portId == addBatchForm?.discharge_port)[0]?.portName || '',
          // onCarriageId: addBatchForm?.on_carriage || '',
          // onCarriageName: this.preCarrigeList?.filter(x => x.locationId === addBatchForm?.on_carriage)[0]?.name || '',
          fpodId: addBatchForm?.fpod || '',
          fpodName: this.locationList?.filter(x => x.locationId === addBatchForm?.fpod)[0]?.locationName || '',
          freightTerms: addBatchForm?.freightTerms,
          freightTermsName: this.freightTermsList?.filter(x => x.systemtypeId === addBatchForm?.freightTerms)[0]?.typeName || '',

          shippingLineId: addBatchForm?.shipping_line,
          shippingLineName: this.shippingLineList?.filter(x => x.shippinglineId === addBatchForm?.shipping_line)[0]?.name || '',

          tsPortId: addBatchForm?.ts_port,
          tsPortName: this.portList?.filter(x => x.portId === addBatchForm?.ts_port)[0]?.portName || '',
          // destinationCustomClearance: this.addBatchForm.value.destinationCustomClearance,
          // originCustomClearance: this.addBatchForm.value.originCustomClearance,
         
          voyageNumberforHop: this.addBatchForm.value.voyageNumber,
          plannedVesselforHopId: this.addBatchForm.value.plannedVessel,
          plannedVesselforHopName: this.vesselList.find(x => x?.vesselId === this.addBatchForm.value.plannedVessel)?.vesselName,
          
          etd: addBatchForm.etd || '',
          eta: addBatchForm.eta || '',
        },
        insurance: {
          cargo: this.addBatchForm.value.cargo || false,
          emptyContainer: this.addBatchForm.value.emptyContainer || false,
          palletization: this.addBatchForm.value.palletization || false,
          fumigation: this.addBatchForm.value.fumigation || false,
          warehousing: this.addBatchForm.value.warehousing || false,
        },
        // transportDetails: {
        //   preCarriage: this.addBatchForm.value.preCarriage,
        //   onCarriage: this.addBatchForm.value.onCarriage,
        //   origin: this.addBatchForm.value.preCarriage ? this.addTransportValue() : [],
        //   destination: this.addBatchForm.value.onCarriage ? this.addTransport1Value() : []
        // },
        // customDetails: {
        //   transportOrigin: this.addBatchForm?.value.transportOrigin || false,
        //   transportDestination: this.addBatchForm?.value.transportDestination || false,
        //   customOrigin: this.addBatchForm?.value.customOrigin,
        //   customDestinationLocation: this.addBatchForm?.value.customDestinationLocation,
        //   customDestinationLocationName: this.locationList.filter(x => x.locationId === this.addBatchForm.value.customDestinationLocation)[0]?.locationName,
        //   customOriginLocationName: this.locationList.filter(x => x.locationId === this.addBatchForm.value.customOriginLocation)[0]?.locationName,
        //   customOriginLocation: this.addBatchForm?.value.customOriginLocation,
        //   customDestination: this.addBatchForm?.value.customDestination,
        //   originOption: this.addBatchForm?.value.originOption,
        //   destinationOption: this.addBatchForm?.value.destinationOption,
        //   originfactory: this.addBatchForm?.value.originfactory,
        //   destinationfactory: this.addBatchForm?.value.destinationfactory,
        //   originPickupAddress: this.addBatchForm?.value.originPickupAddress,
        //   destinationDeliveryAddress: this.addBatchForm?.value.destinationDeliveryAddress,
        // },
        // transhipmentHops: transporthubArray.value,

      },

      "quotationDetails": {
        shipperName: this.shipperList?.filter(x => x.partymasterId === addBatchForm?.shipper)[0]?.name || '',
        carrierId: addBatchForm?.shipping_line,
        carrierName: this.shippingLineList?.filter(x => x.shippinglineId === addBatchForm?.shipping_line)[0]?.name,

        loadPortId: addBatchForm?.load_port,
        loadPortName: this.portList?.filter((x) => x.portId == addBatchForm?.load_port)[0]?.portName || '',

        dischargePortId: addBatchForm?.discharge_port,
        dischargePortName: this.portListDest?.filter((x) => x.portId == addBatchForm?.discharge_port)[0]?.portName || '',


        vesselId: addBatchForm?.plannedVessel,
        vesselName: this.vesselList?.filter((x) => x.vesselId === addBatchForm?.plannedVessel)[0]?.vesselName,
        voyageNumber: addBatchForm?.voyageNumber,

        "isExport": this.isExport,
        "orgId": "",
        "tenantId": "1",
        "quotationId": "",
        "enquiryId": "",
        "agentadviceId": "",
        "agentadviceNo": "",
        "enquiryNo": "",
        "validFrom": "",
        "validTo": "",
        "currency": this.currentUser?.currency?.currencyId,
        "currencyShortName": this.currentUser?.currency?.currencyName,
        "exRate": 1,
        "carrierReceiptId": "",
        "etd": addBatchForm?.etd,
        "eta": addBatchForm?.eta,
        flightId: this.addBatchForm.value.flightNo,
        vehicleId: "",
        flightNo: this.flightList?.filter((x) => x.airId === this.addBatchForm.value.flightNo)[0]?.flight || '',
        "vehicleNo": "",
        "carrierDeliveryId": "",
        "destPortFreeDays": 0,
        "originFreeDays": 0,
        "destFreeDays": 0,
        "totalBuy": 0,
        "totalBuyTax": 0,
        "totalSell": 0,
        "totalSellTax": 0,
        "remarks": '',
        branchId: addBatchForm?.branch,
        branchName: this.branchList?.filter(x => x?.branchId === addBatchForm?.branch)[0]?.branchName,
        branchStateCode: this.branchList?.filter(x => x?.branchId === addBatchForm?.branch)[0]?.addressInfo.stateCode,
        jobCode: this.branchList?.filter(x => x?.branchId === addBatchForm?.branch)[0]?.jobCode || '',

        "quoteStatus": "Quotation Created",
        "status": true,
        "quotationNo": "",


      },
      "routeDetails": {
        // transhipment: transporthubArray.value.length > 0 ? true : false,
        finalShippingLineId: addBatchForm?.shipping_line || '',
        finalShippingLineName: this.shippingLineList?.filter(x => x.shippinglineId === addBatchForm?.shipping_line)[0]?.name || '',

        samePOD: this.addBatchForm.value.samePOD || false,
        finalVesselId: addBatchForm?.plannedVessel || '',
        finalVesselName: this.vesselList?.filter((x) => x.vesselId === addBatchForm?.plannedVessel)[0]?.vesselName || '',
        finalVoyageId: addBatchForm?.voyageNumber || '',
        finalVoyageName: addBatchForm?.voyageNumber || '',
        loadPortId: addBatchForm?.load_port,
        loadPortName: this.portList?.filter((x) => x.portId == addBatchForm?.load_port)[0]?.portName || '',
        destPortId: addBatchForm?.discharge_port,
        destPortName: this.portListDest?.filter((x) => x.portId == addBatchForm?.discharge_port)[0]?.portName || '',
        icdCfsValueId: addBatchForm?.location,
        icdCfsValueName: this.portLocationList?.filter(x => x.locationId === addBatchForm?.location)[0]?.locationName,
        railETD: "",
        "etd": addBatchForm?.etd,
        "eta": addBatchForm?.eta,
        // "atd": addBatchForm?.etd,
        // "ata": addBatchForm?.eta,
        loadPlace: addBatchForm?.load_place || '',
          loadPlaceName: this.locationList?.filter(x => x.locationId === addBatchForm?.load_place)[0]?.locationName || '',
      },
    }

    // if(this.addBatchForm.value?.stuffing_location_Type){
    //   newAgentAdvice["enquiryDetails"]["stuffing_location"]=stuffing_location
    // }
    
    this.commonService.addToST('batch', newAgentAdvice).subscribe((res: any) => {
      if (res) {
        this.sharedEventService.emitChargeSaved();
        this.submitted = false;
        this.submittedBranch = false;
        this.updateContainer(res)
        this.router.navigate(["/batch/list"]);
        this.notification.create(
          'success',
          'Job Created Successfully..!',
          `Job No. - "${res.batchNo}"`
        );
      }
    }, error => {
      this.notification.create(
        'error',
        error?.error?.error?.message,
        ''
      );
    });
    this.getContainerList()


  }
  emailSend() {
    if (!this.addBatchForm?.value?.agent) {
      return;
    }
    const agentDetails = this.agentList.find(d => d?.partymasterId === this.addBatchForm?.value?.agent);
    let subject = `Booking Confirmation - ${this.batchDetail?.batchNo}`;
    let emaildata = `Dear Sir/Madam, <br><br>

    We are pleased to confirm your booking with the following details: <br><br>
    
    <strong>Job No:</strong> ${this.batchDetail?.batchNo} <br>
    <strong>Freight Type:</strong> ${this.batchDetail?.enquiryDetails?.basicDetails?.ShipmentTypeName} <br>
    <strong>Load Type:</strong> ${this.batchDetail?.enquiryDetails?.basicDetails?.loadType} <br>
    <strong>Shipper:</strong> ${this.batchDetail?.enquiryDetails?.basicDetails?.shipperName} <br>
    <strong>Billing Branch:</strong> ${this.batchDetail?.enquiryDetails?.basicDetails?.billingBranch} <br>
    <strong>Consignee:</strong> ${this.batchDetail?.enquiryDetails?.basicDetails?.consigneeName} <br>
    <strong>Port of Loading:</strong> ${this.batchDetail?.enquiryDetails?.routeDetails?.loadPortName} <br>
    <strong>Port of Discharge:</strong> ${this.batchDetail?.enquiryDetails?.routeDetails?.destPortName} <br>
    <strong>Container Type:</strong> ${this.batchDetail?.enquiryDetails?.containersDetails[0]?.containerType} <br>
    <strong>Number of Containers:</strong> ${this.batchDetail?.enquiryDetails?.containersDetails[0]?.noOfContainer} <br>
    <strong>Gross Weight:</strong> ${this.batchDetail?.enquiryDetails?.containersDetails[0]?.grossWeightContainer} ${this.batchDetail?.enquiryDetails?.containersDetails[0]?.unitName} <br>
    <strong>Shipping Line:</strong> ${this.batchDetail?.enquiryDetails?.routeDetails?.shippingLineName} <br><br>
    
    All necessary details have been processed successfully. If you require any further information or assistance, please do not hesitate to contact us. <br><br>
    
    Thank you for choosing SHIPEASY for your logistics needs. <br><br>
    
    Best regards, <br>
    SHIPEASY Team`;

    const payload = {
      sender: {
        name: this.userdetails?.userName,
        email: this.userdetails?.userEmail
      },
      to: [{ email: agentDetails?.primaryMailId }],
      batchId: this.batchId,
      textContent: emaildata,
      subject: subject,
      attachment: []
    };
    this.loaderService.showcircle();
    this.batchService.sendEmail(payload)?.subscribe(
      (res) => {
        if (res.status === "success") {
          this.notification.create('success', 'Email Sent Successfully', '');
        } else {
          this.notification.create('error', 'Email not Sent', '');
        }
        this.loaderService.hidecircle();
      }
    );


  }

 


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

  onDrawerClose() {
    // this.getPartyMasterDropDowns()
    // this.drawerClosed.emit();
    this.partyMasterComponent.loadData();
  }
  // @Output() drawerClosed = new EventEmitter<void>();
  @ViewChild(AddPartyComponent) partyMasterComponent!: AddPartyComponent;
  @ViewChild('drawer') drawer!: MatDrawer;
  handleGetList(event) {
    this.getPartyMasterDropDowns()
    this.getShippingLineDropDowns();
    this.drawer.close();
    // this.drawerClosed.emit();
    this.partyMasterComponent.loadData();
  }

  titleParty = '';
  private modalRef: NgbModalRef;
  addPartyMaster(content, title) {
    this.titleParty = title
    this.getCountryList()
    this.getCustomerType()
    this.addressFormBuild()
    this.modalRef = this.modalService.open(AddPartyComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
    this.modalRef.componentInstance.isPopup = true;
    this.modalRef.componentInstance.getList.subscribe((res: any) => {
      if (res) {
        this.getShippingLineDropDowns();
        this.getPartyMasterDropDowns()
      }
    })
  }
  customerStatusTag: any = 'Resident'

  customerStatus(e) {
    this.customerStatusTag = e
    if (e === 'Non Resident') {
      this.Overview.get('panNo').clearValidators()
      this.Overview.get('panNo').updateValueAndValidity()
      this.Overview.get('pinCode').clearValidators()
      this.Overview.get('pinCode').updateValueAndValidity()
      this.Overview.get('state').clearValidators()
      this.Overview.get('state').updateValueAndValidity()
      this.Overview.get('city').clearValidators()
      this.Overview.get('city').updateValueAndValidity()

    }
    else {

      this.Overview.get('state').setValidators(Validators.required)
      this.Overview.get('state').updateValueAndValidity()

      this.Overview.get('city').setValidators(Validators.required)
      this.Overview.get('city').updateValueAndValidity()
      this.Overview.get('pinCode').setValidators(Validators.required)
      this.Overview.get('pinCode').updateValueAndValidity()
      this.Overview.get('panNo').setValidators(Validators.required)
      this.Overview.get('panNo').updateValueAndValidity()
      // if (this.countryList?.find((x) => this.Overview.get('country').value === x?.countryId)?.countryName?.toLowercase() === 'india'){

      // }


    }
  }
  getCustomerType() {

    let payload = this.commonService.filterList()
    payload.query = {
      typeCategory: 'ISF', status: true,
    }
    this.commonService.getSTList("systemtype", payload).subscribe((res: any) => {
      let customerTypeListHold = []
      this.CustomerTypeList = res.documents;
      this.CustomerTypeList.forEach(e => {
        customerTypeListHold.push({
          item_id: e.systemtypeId,
          item_text: e.typeName
        })

      })
      this.CustomerTypeList = customerTypeListHold

    });
  }
  listOfTagOptions = [];

  get f1() { return this.Overview?.controls; }
  Overview: FormGroup;
  addressFormBuild() {
    this.Overview = this.formBuilder.group({
      name: ['', Validators.required],
      shortname: [''],
      annualTurnover: [''],
      annualTernover: [''],
      customerStatus: ['Resident'],
      country: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      parentCompany: [false],
      groupCompany: [false],
      panNo: ['', Validators.required],
      address: ['', [Validators.required, this.forbiddenCharactersValidator()]],
      pinCode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      partyCurrency: ['', Validators.required],
      primaryEmailId: ['', [Validators.required, Validators.email]],
      customerType: [[]],
      ImportExport: ['', Validators.required],
      principle: [''],
      partyShortcode: [''],
      chequeAcceptance: [false],
      isSez: [false],
      isRegisterCompany: [false],
      isRegister: [false],
      isUser: [false],
      bankName: [''],
      notes: [],
      customerList: [''],
      overviewTable: [],
    });
  }
  forbiddenCharactersValidator() {
    return (control) => {
      const forbiddenChars = /["\\]/; // Regular expression to match forbidden characters
      const value = control.value;
      const hasForbiddenChars = forbiddenChars.test(value);
      return hasForbiddenChars ? { forbiddenChars: true } : null;
    };
  }
  closePopup() {
    this.Overview.reset();
    if (this.modalRef) {
      this.modalRef.close();
    }
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
    let countryData = this.countryList?.filter(x => x?.countryId === this.Overview.get('country').value);

    this.callingCodeList = countryData;

    let payload = this.commonService.filterList()
    payload.query = {
      "countryId": this.Overview.get('country').value, status: true,
    }
    this.commonService.getSTList("state", payload).subscribe((data) => {
      this.stateList = data.documents;
    });
  }

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
  // onCheckboxChange(isChecked: boolean, type: string) {

  //   if (type === 'groupCompany' && isChecked) {
  //     this.Overview.patchValue({ groupCompany: true, parentCompany: false });
  //   } else if (type === 'parentCompany' && isChecked) {
  //     this.Overview.patchValue({ parentCompany: true, groupCompany: false });
  //   }
  //   else if (type === 'groupCompany' && !isChecked) {
  //     this.Overview.patchValue({ parentCompany: true, groupCompany: false });
  //   }
  //   else if (type === 'parentCompany' && !isChecked) {
  //     this.Overview.patchValue({ parentCompany: false, groupCompany: true });
  //   }
  //   this.Overview.updateValueAndValidity()
  // }
  submitted1: boolean = false;
  saveParty() {
    this.submitted1 = true
    if (this.Overview.valid) {
      this.createModel();
      let createBody = [];
      createBody.push(this.smartAgentDetail);
      this.commonService.addToST('partymaster', createBody[0]).subscribe((data: any) => {
        if (data) {
          this.notification.create('success', 'Added Successfully', '');
          this.modalService.dismissAll()
          this.Overview.reset()
          this.submitted = false;
          this.getPartyMasterDropDowns()
        }
      }, (error) => {
        this.notification.create('error', error?.error?.error?.message, '');
      });
    }
  }
  smartAgentDetail: partymasterDetail = new partymasterDetail();
  createModel() {
    let countryData = this.countryList.filter(x => x?.countryId === this.Overview?.get('country')?.value);
    let stateData = this.stateList.filter(x => x?.stateId === this.Overview.get('state').value);
    let cityData = this.cityList.filter(x => x?.cityId === this.Overview.get('city').value);
    let currencyData = this.currencyList.filter(x => x?.currencyId === this.Overview.get('partyCurrency').value) || [];
    this.smartAgentDetail.orgId = this.commonfunction.getAgentDetails().orgId;
    this.smartAgentDetail.currency = new Currency();
    this.smartAgentDetail.partyCurrency = new Currency();
    this.smartAgentDetail.tenantId = this.tenantId;
    this.smartAgentDetail.status = !this.id ? true : this.smartAgentDetail?.status ? this.smartAgentDetail?.status : false;
    this.smartAgentDetail.name = this.Overview?.get('name')?.value;
    this.smartAgentDetail.notes = this.Overview?.get('notes')?.value ?? [];
    this.smartAgentDetail.overviewTable = this.Overview?.get('overviewTable')?.value ?? [];
    this.smartAgentDetail.shortName = this.Overview?.get('shortname')?.value;
    this.smartAgentDetail.customerType = this.listOfTagOptions;
    this.smartAgentDetail.ImportExport = this.Overview?.get('ImportExport')?.value;
    this.smartAgentDetail.customerStatus = this.Overview?.get('customerStatus').value;
    this.smartAgentDetail.addressInfo.address = this.Overview?.get('address').value;
    this.smartAgentDetail.addressInfo.countryId = countryData[0]?.countryId || '';
    this.smartAgentDetail.addressInfo.countryISOCode = this.Overview?.get('country').value;
    this.smartAgentDetail.addressInfo.countryName = countryData[0]?.countryName || '';
    this.smartAgentDetail.addressInfo.stateId = stateData[0]?.stateId;
    this.smartAgentDetail.addressInfo.stateName = stateData[0]?.typeDescription;
    this.smartAgentDetail.addressInfo.stateCode = stateData[0]?.GSTNCode || '';
    this.smartAgentDetail.addressInfo.cityId = cityData[0]?.cityId;
    this.smartAgentDetail.addressInfo.cityName = cityData[0]?.cityName;
    this.smartAgentDetail.addressInfo.postalCode = this.Overview?.get('pinCode').value.toString();
    this.smartAgentDetail.primaryMailId = this.Overview?.get('primaryEmailId').value;

    this.smartAgentDetail.chequeAcceptance = this.Overview?.get('chequeAcceptance').value;
    this.smartAgentDetail.isSez = this.Overview?.get('isSez').value;

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
    let customerList: any = this.partymasterList.find(x => x?.partymasterId === this.Overview.get('customerList').value) ?? '';
    this.smartAgentDetail.parenetcustomerId = this.Overview.get('customerList').value;
    this.smartAgentDetail.parenetcustomerName = customerList?.name;

    // KYC Details
    this.smartAgentDetail.groupCompany = this.Overview?.get('groupCompany')?.value;
    this.smartAgentDetail.parentCompany = this.Overview?.get('parentCompany')?.value;


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
  get f2() { return this.shippingLineForm?.controls; }
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
  submitted2: boolean = false
  costItemsMasters() {
    this.submitted2 = true;
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
      "tenantId": this.tenantId,
    };



    this.commonService.addToST('shippingline', newCostItems).subscribe(
      (res: any) => {
        if (res) {
          setTimeout(() => {
            this.submitted2 = false
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
  addVesselForm: FormGroup;
  addVessel(AddClauseVessel) {
    this.getCountryList()
    this.getVesselType()
    this.getShipingLine();
    this.formBuildVessel();
    let modalRef = this.modalService.open(AddClauseVessel, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
    // modalRef.componentInstance.voyageType = 'import';
    // modalRef.componentInstance.isType = '';
    // modalRef.componentInstance.getList.subscribe((res: any) => {
    //   if (res) {
    //     this.getVesselListDropDown();
    //   }
    // })
  }
  vesselTypeList: any = []
  vesselSubTypeList: any = []
  getVesselType() {
    let payload = this.commonService.filterList()
    payload.query = {
      typeCategory: {
        "$in": ['vesselType', 'vesselSubtype',]
      },
      "status": true
    }
    this.commonService.getSTList('systemtype', payload).subscribe((res: any) => {
      this.vesselTypeList = res?.documents?.filter(x => x.typeCategory === "vesselType");
      this.vesselSubTypeList = res?.documents?.filter(x => x.typeCategory === "vesselSubtype");
    });
  }
  formBuildVessel() {
    this.addVesselForm = this.formBuilder.group({
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
      imoNo: [''],
      mmsino: [''],

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

      cranes: this.formBuilder.array([]),


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
  onVesselCancel() {
    this.modalService.dismissAll();
    this.addVesselForm.reset();
  }
  shippinglineData: any = []
  getShipingLine() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      "status": true,
      "ShipmentTypeName": 'Ocean',
    }

    this.commonService
      .getSTList('shippingline', payload)
      ?.subscribe((res: any) => {
        this.shippinglineData = res?.documents
      });

  }
  get f5() { return this.addVesselForm?.controls; }
  get cranes() {
    return this.addVesselForm.get('cranes') as FormArray;
  }
  addCrane(data) {
    this.cranes.push(this.newCrane(data))
  }
  newCrane(data) {
    if (data) {
      return this.formBuilder.group({
        craneNo: data.craneNo,
        capacity: data.capacity,
        position: data.position,
        outreach: data.outreach,
        remarks: data.remarks
      })
    }
    else {
      return this.formBuilder.group({
        craneNo: [''],
        capacity: [''],
        position: [''],
        outreach: [''],
        remarks: ['']
      })
    }
  }
  submitted5: boolean = false;
  vesselMasters() {
    this.submitted5 = true;
    if (this.addVesselForm.invalid || !this.addVesselForm.controls['deActivateVessel'].value) {
      this.notification.create('error', 'Please fill reqired fields', '');
      return;
    }
    let duplicate = 0
    if (duplicate < 1) {
      let newdata = this.addVesselForm.value;
      newdata.vesselSubType = {
        "vesselSubTypeName": this.addVesselForm.value.vesselSubType,
        "vesselSubTypeId": ""
      },
        newdata.tenantId = this.tenantId;
      newdata['countryName'] = this.countryList.find(country => country?.countryId === this.addVesselForm.value?.countryId)?.countryName;
      newdata['chartId'] = this.addVesselForm?.value?.chartName
      newdata['chartName'] = this.shippinglineData.find(shipping => shipping?.shippinglineId === this.addVesselForm?.value?.chartName)?.name

      this.commonService.addToST('vessel', newdata).subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Added Successfully', '');
            var myInterval = setInterval(() => {
              this.onVesselCancel()
              this.submitted5 = false;
              this.getVesselListDropDown();
              clearInterval(myInterval);
            }, 1000);
          }
        },
        (error) => {
          this.modalService.dismissAll()
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
    }

  }




  openPortAir() {
    this.modalRef = this.modalService.open(AddAirportComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });

    this.modalRef.componentInstance.isPopup = true;
    this.modalRef.componentInstance.getList.subscribe((res: any) => {
      if (res) {
        this.portList.unshift({
          portId: res?.airportmasterId,
          portName: res?.airPortname,
          portTypeName: 'air'
        })
        this.portListDest.unshift({
          portId: res?.airportmasterId,
          portName: res?.airPortname,
          portTypeName: 'air'
        })
      }
    })
  }

  openPort() {
    this.modalRef = this.modalService.open(AddPortMasterComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });

    this.modalRef.componentInstance.isPopup = true;
    this.modalRef.componentInstance.getList.subscribe((res: any) => {
      if (res) {
        this.portList.unshift({
          portId: res?.portId,
          portName: res?.portDetails?.portName,
          portTypeName: 'port'
        })
        this.portListDest.unshift({
          portId: res?.portId,
          portName: res?.portDetails?.portName,
          portTypeName: 'port'
        })
      }
    })
  }


  bookingConfirmation() {
    var url = `send-booking-confirmation/${this.id}`;
    this.commonService.bookingConfirm(url).subscribe((res: any) => {
      if (res) {
        this.notification.create('success', 'Booking Confirmation Successfully', '');
        setTimeout(() => {
          this.getMilestone.emit();
        }, 2000);
      }
    }, error => {
      this.router.navigate(["/batch/list"]);
      this.notification.create(
        'error',
        error?.error?.error?.message,
        ''
      );
    });
  }

  // Loose cargo details
  cargos(): FormArray {
    return this.empForm.get('cargos') as FormArray;
  }

  newCargo(): FormGroup {
    return this.formBuilder.group({
      pkgname: ['Pallets'],
      units: ['', Validators.required],
      // Pallettype: ['Pallets (non specified size)'],
      Pallettype: [''],
      lengthp: ['', [Validators.min(1), Validators.max(999999999)]],
      Weightp: ['', [Validators.min(1), Validators.max(999999999)]],
      weightpsCalculatedother: [''],
      heightselected: ['', [Validators.min(1), Validators.max(999999999)]],
      selectedh: ['CM' ],
      Weightselected: ['', [Validators.required, Validators.min(1), Validators.max(999999999)]],
      selectedw: ['KG'],
      volumeselect: [''],
      volumebselecteds: ['CBM'],
      lclShipper: [''],
      cbm: [''],

    });
  }

  addLooseCargo() {
    this.cargos()?.push(this.newCargo());
  }

  removeLooseCargo(empIndex: number) {
    this.cargos().removeAt(empIndex);
  }

  radioButtonChange(data, empIndex) {
    const palletValidators = [ ];
    const cargosArray = this.empForm.get('cargos') as FormArray;
    const cargo = cargosArray.at(empIndex) as FormGroup;

    cargo.get('lengthp').setValidators(palletValidators);
    cargo.get('Weightp').setValidators(palletValidators);
    cargo.get('heightselected').setValidators(palletValidators);
    cargo.get('Weightselected').setValidators([Validators.required, Validators.min(1), Validators.max(99999)]);


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
    const totalUnits = (roundedUnits * (cargo?.get('units')?.value ?? 0)).toFixed(2);
    if(length == 0 || width == 0 || height == 0 || length == "" || width == "" || height == "") {
      return
    }else{
      cargo.controls['volumeselect'].setValue(totalUnits);
      cargo.controls['cbm'].setValue(totalUnits);
    }
   

    // cargo.controls['Weightselected'].setValue((cargo.controls['cbm'].value * (this.activeFrightAir ? 167 : 1000)).toFixed(2));

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
    cargo.controls['weightpsCalculatedother'].setValue(roundedUnits);
    this.calculateAll()
  }

  touchCBM(empIndex){
    const cargosArray = this.empForm.get('cargos') as FormArray;
    const cargo = cargosArray.at(empIndex) as FormGroup;
    // cargo.controls['Weightselected'].setValue((cargo.controls['cbm'].value * (this.activeFrightAir ? 167 : 1000)).toFixed(2));
    this.calculateAll()
  }

  totalVolume: any = 0;
  totalGrossWeight: any = 0
  totalPieces: any = 0
  calculateAll() {
    this.totalVolume = 0;
    this.totalGrossWeight = 0;
    this.totalPieces = 0
    const cargosArray = this.empForm.get('cargos') as FormArray;
    cargosArray?.controls?.forEach((control) => {
      const volume = Number(control.get('cbm')?.value || 0);
      const weight = Number(control.get('weightpsCalculatedother')?.value || 0);
      const pieces = Number(control.get('units')?.value || 0);
      this.totalVolume += volume;
      this.totalGrossWeight += weight;
      this.totalPieces += pieces
    });
  }

  openFlight(AddClauseVessel) {
    this.formBuildFlight()
    this.modalService.open(AddClauseVessel, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });

  }

  addFlightForm: FormGroup;
  get f11() { return this.addFlightForm?.controls; }
  submittedflight: boolean = false;

  onSaveFlight() {
    this.submittedflight = false;
    this.addFlightForm.reset()
    this.modalService.dismissAll()
  }
  formBuildFlight() {
    this.addFlightForm = this.formBuilder.group({
      airline: ['', Validators.required],
      airlineCode: ['', Validators.required],
      aircraftType: ['', Validators.required],
      flight: ['', Validators.required],
      cargo: [''],
      volumey: [''],
      status: [true],
    });
  }

  addFlightMasters() {
    this.submittedflight = true;
    if (this.addFlightForm.invalid) {
      this.notification.create('error', 'Please fill reqired fields', '');
      return;
    }

    let newdata = {
      ...this.addFlightForm.value,
      airline: this.shippingLineList?.filter((x) => x?.shippinglineId == this.addFlightForm.value.airline)[0]?.name || '',
      airlineId: this.addFlightForm.value.airline
    };


    this.commonService.addToST('air', newdata).subscribe(
      (res: any) => {
        if (res) {
          this.notification.create('success', 'Added Successfully', '');
          this.onSaveFlight();
          var myInterval = setInterval(() => {
            this.getAir();
            clearInterval(myInterval);
          }, 1000);
        }
      },
    );
  }

  
  setPlaceOfDelivery() { 

    this.portLocationList.unshift({
      locationId: this.addBatchForm.get('discharge_port').value,
      locationName: this.portListDest.filter(x => x.portId === this.addBatchForm.get('discharge_port').value)[0]?.portName,
      locationType: this.activeFrightAir ? 'air' : 'port'
    })

    this.portLocationList = this.portLocationList.filter(
      (obj, index, self) => index === self.findIndex(o => o.portId === obj.portId)
    );

    if (this.addBatchForm.get('samePOD').value)
      this.addBatchForm.get('location').setValue(this.addBatchForm.get('discharge_port').value)
  }
  calculateCBM(empIndex: number): void {
    const cargosControl = this.empForm.get('cargos') as FormArray; // Assuming cargos is a FormArray
    const length = cargosControl.at(empIndex).get('lengthp').value;
    const width = cargosControl.at(empIndex).get('Weightp').value;
    const height = cargosControl.at(empIndex).get('heightselected').value;

    if (length && width && height) {
      const cbm = (length * width * height) / 1000000; // Convert cm³ to m³
      const cargosControl = this.empForm.get('cargos') as FormArray; // Assuming cargos is a FormArray
      const cbmControl = cargosControl.at(empIndex).get('cbm');
      cbmControl.setValue(length && width && height ? cbm.toFixed(3) : '');
    }
  }




  onCheckboxChange(type: string, event: Event): void {
    this.addBatchForm.get('stuffing_location_Type').setValue(type)
    const checkbox = event.target as HTMLInputElement;
    if (type === 'factory') {
      this.addBatchForm.get('stuffingfactory').setValue(true) 
      this.addBatchForm.get('stuffingcfs').setValue(false) 
      this.showFactoryDropdowns = checkbox.checked;
      this.showCfsDropdown = false; 
    } else if (type === 'cfs') {
      this.addBatchForm.get('stuffingfactory').setValue(false) 
      this.addBatchForm.get('stuffingcfs').setValue(true) 
      this.showCfsDropdown = checkbox.checked;
      this.showFactoryDropdowns = false; 
    }
  }
  showCfsDropdown = false;
  showFactoryDropdowns = false;
  isStuffingPanelOpen: boolean = false;
  onStuffingCheckboxChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.isStuffingPanelOpen = checkbox.checked;
      if (!this.isStuffingPanelOpen) {
      this.showFactoryDropdowns = false;
      this.showCfsDropdown = false;
    }
  }

  setAddress0(from,target){
    let address = (this.billingBranchList??[])?.find((x) => x?.branch_name === this.f[from].value)
   if(address){
    this.addBatchForm.get(target).setValue(address?.branch_address);
   }
  }
  get transport(): FormArray {
    return this.addBatchForm.get('transport') as FormArray;
  }
  get transhipmentHops(): FormArray {
    return this.addBatchForm.get('transhipmentHops') as FormArray;
  }
   setValidationFromArray() {
     this.transport.controls.forEach((control: FormGroup, index) => {
       if (this.addBatchForm.value.preCarriage) {
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
       if (this.addBatchForm.value.onCarriage) {
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
       this.transport.at(this.transport?.controls?.length - 1).get('location').setValue(this.addBatchForm.value.load_port || '')
       this.transport.at(this.transport?.controls?.length - 1).get('locationType').setValue('port')
       this.transport1.at(0).get('location').setValue(this.addBatchForm.value.discharge_port || '')
       this.transport1.at(0).get('locationType').setValue('port')
     }
   }
 
  get transport1(): FormArray {
     return this.addBatchForm.get('transport1') as FormArray;
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
           this.portList?.filter((x) => x.portId == element.value.location)[0]?.portName || '',
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
           this.portListDest?.filter((x) => x.portId == element.value.location)[0]?.portName || '',
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


   addTranshipmentHop(item?): void {
     const row = this.formBuilder.group({
       load_port: [item ? item.load_port : ''],
       etd: [item ? item.etd : ''],
       eta: [item ? item.eta : ''],
       plannedVessel: [item ? item.plannedVessel : ''],
       voyageNumber: [item ? item.voyageNumber : ''],
     });
     (this.addBatchForm.get('transhipmentHops') as FormArray).push(row); 
   }
   
   
   
   removeTranshipmentHop(index: number): void {
     (this.addBatchForm.get('transhipmentHops') as FormArray).removeAt(index);
   }
     getTransportControls(): AbstractControl[] {
       return (this.addBatchForm.get('transport') as FormArray).controls;
     }
     getTransportHubControls(): AbstractControl[] {
       return (this.addBatchForm.get('transhipmentHops') as FormArray).controls;
     }
     getTransport1Controls(): AbstractControl[] {
       return (this.addBatchForm.get('transport1') as FormArray).controls;
     }

       addTransportRow(item?: any, i?: any): void {
         const row = this.formBuilder.group({
           locationType: [item ? item.locationType : 'location', Validators.required],
           location: [item ? item.location : '', item ? item.locationType == 'location' ? Validators.required : '' : Validators.required],
           etd: [item ? item.etd : ''],
           eta: [item ? item.eta : ''],
           address: [item ? item.address : ''],
           addressId: [item ? item.addressId : '', item ? (this.isTransport ? item.address == '' : item.locationType == 'address') ? Validators.required : '' : ''],
           transit: [item ? item.transit : '', item ? (i + 1 !== this.batchDetail?.enquiryDetails?.transportDetails?.origin?.length && !(this.isTransport)) ? Validators.required : '' : this.isTransport ? '' : Validators.required],
           carrier: [item ? item.carrier : '', item ? (i + 1 !== this.batchDetail?.enquiryDetails?.transportDetails?.origin?.length && !(this.isTransport)) ? Validators.required : '' : this.isTransport ? '' : Validators.required],
           branch: [item ? item.branch : '', item ? (i + 1 !== this.batchDetail?.enquiryDetails?.transportDetails?.origin?.length && this.isTransport) ? Validators.required : '' : this.isTransport ? Validators.required : ''],
     
           carrierList: [item ? item?.carrierList || [] : [], item ? (i + 1 !== this.batchDetail?.enquiryDetails?.transportDetails?.origin?.length && this.isTransport && item?.transpoterType === 'transporter') ? Validators.required : '' : (this.isTransport  && item?.transpoterType === 'transporter') ? Validators.required : ''],
           transpoterType : [item ? item?.transpoterType || 'transporter' : 'transporter'],
         });
     
     
     
         if (item) {
           (this.addBatchForm.get('transport') as FormArray).push(row); 
          
         } else {
           this.addRowToSecondLastPosition(row)
         }
         if(this.isTransport){
           this.setValidationFromArray()
         }
      
         
       }
     
       addTransport1Row(item?: any, i?: any): void {
         const row = this.formBuilder.group({
           locationType: [item ? item.locationType : 'location', Validators.required],
           location: [item ? item.location : '', item ? item.locationType == 'location' ? Validators.required : '' : Validators.required],
           etd: [item ? item.etd : '',item ? i + 1 !== this.batchDetail?.enquiryDetails?.transportDetails?.destination?.length ? Validators.required : '' : Validators.required ],
           eta: [item ? item.eta : '', item ? i !== 0 ? Validators.required : '' : Validators.required],
           address: [item ? item.address : ''],
           addressId: [item ? item.addressId : '', item ? (this.isTransport ? item.address == '' : item.locationType == 'address'  ) ? Validators.required : '' : ''],
           transit: [item ? item.transit : '', item ? i + 1 !== this.batchDetail?.enquiryDetails?.transportDetails?.destination?.length ? Validators.required : '' : Validators.required],
           carrier: [item ? item.carrier : '', item ? i + 1 !== this.batchDetail?.enquiryDetails?.transportDetails?.destination?.length ? Validators.required : '' : Validators.required],
         });
     
         if (item) {
           (this.addBatchForm.get('transport1') as FormArray).push(row); 
         } else {
           this.addRowToSecondLastPosition1(row)
         }
     
       }
     
       addRowToSecondLastPosition(row: FormGroup) {
         const transportArray = this.addBatchForm.get('transport') as FormArray;
         const secondLastIndex = transportArray.length - 1;
     
         if (secondLastIndex >= 0) {
           transportArray.insert(secondLastIndex, row);
         } else {
           transportArray.insert(0, row);
         }
       }
       addRowToSecondLastPosition1(row: FormGroup) {
         const transportArray = this.addBatchForm.get('transport1') as FormArray;
         const secondLastIndex = transportArray.length - 1;
     
         if (secondLastIndex >= 0) {
           transportArray.insert(secondLastIndex, row);
         } else {
           transportArray.insert(0, row);
         }
       }
       deleteTransportRow(index: number): void {
         (this.addBatchForm.get('transport') as FormArray).removeAt(index);
       }
       deleteTransportRow1(index: number): void {
         (this.addBatchForm.get('transport1') as FormArray).removeAt(index);
       } 
        etdSelectedDate: Date | null = null;

       onETDChange(date: Date | null): void {
        this.etdSelectedDate = date;
        if (date && this.isAddMode) {
          this.addBatchForm.get('eta')?.setValue(null);
        }
      }

      disabledETADate = (current: Date): boolean => {
        if (!this.etdSelectedDate) {
          return false;
        }
        const etdDate = new Date(this.etdSelectedDate);
        etdDate.setHours(0, 0, 0, 0);
        current.setHours(0, 0, 0, 0);
        
        return current.getTime() <= etdDate.getTime();
      };
      showDGGoodsFields = false;
      toggleDGGoods(event: any) {
        this.showDGGoodsFields = event.target.checked;
    
        if (this.showDGGoodsFields) {
          // Add validators when checkbox is checked
          this.addBatchForm.get('imoNumber')?.setValidators([Validators.required]);
          this.addBatchForm.get('unNumber')?.setValidators([Validators.required]);
          this.addBatchForm.get('packagingType')?.setValidators([Validators.required]);
        } else {
          // Remove validators when unchecked
          this.addBatchForm.get('imoNumber')?.clearValidators();
          this.addBatchForm.get('unNumber')?.clearValidators();
          this.addBatchForm.get('packagingType')?.clearValidators();
    
          // Also clear errors to update UI
          this.addBatchForm.get('imoNumber')?.updateValueAndValidity();
          this.addBatchForm.get('unNumber')?.updateValueAndValidity();
          this.addBatchForm.get('packagingType')?.updateValueAndValidity();
        }
    
        // Always update validity after changing validators
        this.addBatchForm.get('imoNumber')?.updateValueAndValidity();
        this.addBatchForm.get('unNumber')?.updateValueAndValidity();
        this.addBatchForm.get('packagingType')?.updateValueAndValidity();
      }
}