import { Component, EventEmitter, HostListener, Input, OnInit, Output, Pipe, PipeTransform, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../../shared/services/common.service';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { BaseBody } from 'src/app/admin/smartagent/base-body';
import * as Constant from 'src/app/shared/common-constants';
import { CommonService as CommonServices } from 'src/app/services/common/common.service';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
import { ApiService } from 'src/app/admin/principal/api.service';
import { differenceInCalendarDays } from 'date-fns';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { OrderByPipe } from '../../util/sort';
import { Enquiry } from 'src/app/models/enquiry';
import { ShippingLine } from 'src/app/models/shipping-line';
import { MyData } from 'src/app/models/Vessel-voyage';
import { Port } from 'src/app/models/tariff-list';
import { Location } from 'src/app/models/container-master';
import { Currency } from 'src/app/models/cost-items';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { SharedEventService } from '../../services/shared-event.service';


@Pipe({
  name: 'filter1',
})
export class FilterPipe1 implements PipeTransform {
  transform(value, args?: any) {
    if (value?.length === 0) {
      return value;
    }
    if (!args) { return value }
    let filteredUsers = [];
    value.forEach(element => {
      element?.voyage?.forEach((x) => {
        if (x?.shipping_line)
          if (x?.shipping_line === args) {
            filteredUsers.push(element);
          }
      })
    });


    return filteredUsers;
  }
}
@Component({
  selector: 'app-route',
  templateUrl: './route.component.html',
  styleUrls: ['./route.component.scss'],
})
export class RouteComponent implements OnInit {
  searchPort$ = new Subject<string>();
  @Input() isConsolidate;
  @Input() consolidationbooking;
  @ViewChild("insideVendor") insideVendor;
  @ViewChild("insideVendor1") insideVendor1;
  showTem: boolean = false;
  searchText: string = '';
  vesseldataShipping: any = [];
  shippingCharges: any = [];
  deleteArray: any = [];
  @Output() mmsiNo;
  @Output() vesselName;
  vesselList: any = [];
  urlParam: any;
  isShow: boolean = false;
  todayDate = new Date();
  flightList: any = [];
  vehicalList: any = [];
  public touchUi = false;
  public color = 'primary';
  public enableMeridian = true;
  isImport: boolean = false;
  isTransport: boolean = false;
  cityListLand: any;
  originalHopIds: any=[];
  @HostListener('document:click', ['$event.target'])
  public onClick(targetElement?) {

    if (this.insideVendor || this.insideVendor1) {
      const insideVendor = this.insideVendor?.nativeElement?.contains(targetElement);
      const insideVendor1 = this.insideVendor1?.nativeElement?.contains(targetElement);
      if (insideVendor) {
        this.showTem = true
      }
      if (!insideVendor && !insideVendor1) {
        this.showTem = false
      }
    }
  }
  showBatch: boolean = false;
  targetDeliveryDate: Date;
  routeForm: FormGroup;
  isExpand: boolean = false;
  holdControl: any;
  holdBatchType: string = '';
  submitted: boolean;
  baseBody: any;
  enquiryList: Enquiry[] = [];
  shippingLineList: ShippingLine[];
  vesseldata = [];
  voyageData: MyData[] = [];
  PortData: Port[] = [];
  locationData: Location[] = [];
  locationList :any = [];
  currencyData: Currency[] = [];
  voyage: any = [];
  batchDetail: any = [];
  id: any;
  preCarrigeList: Location[] = [];
  preCarriageList = [
    { name: 'Yes', locationId: 'yes' },
    { name: 'No', locationId: 'no' }
  ];
  onCarrigeList: Location[] = [];
  enquiryDetail: any;
  ICDlocationList: any = [];
  loadPortList: Port[] = [];
  destPortList: Port[] = [];
  voyageListData: any = [];
  finalvoyageData: any = [];
  isExport: boolean = false;
  fromdateValue: any = '';
  todateValue: any = '';
  railandland:boolean = false;
  @Output() getBatchById: EventEmitter<any> = new EventEmitter();
  constructor(
    private router: Router,
    private sharedEventService: SharedEventService,
    private appCommon: CommonService,
    private formBuilder: FormBuilder,
    private notification: NzNotificationService,
    private commonService: CommonServices,
    private _api: ApiService,
    private route: ActivatedRoute,
    private sortPipe: OrderByPipe,
    private modalService: NgbModal,
  ) {
    this.setupSearchSubscription();
    this.setupSearchLocationSubscription();
    this.isExport = localStorage.getItem('isExport') === 'true' ? true : false;
    this.isImport = localStorage.getItem('isImport') === 'true' ? true : false;
    this.isTransport = localStorage.getItem('isTransport') === 'true' ? true : false;
    this.route.params.subscribe((params) => (this.urlParam = params));
    this.isShow = this.urlParam?.access == 'show' ? true : false;;
    this.getVoyage();
    this.getShippingLineDropDowns(); 
    this.getICDLocation()
    this.getPortList();
    this.getAir()
    this.getLand()
    this.getPartyMaster()

    this.routeForm = this.formBuilder.group({
      shipping_line: [''],
      final_vessel: [''],
      vehicleNo: [''],
      flightNo: [''],
      load_port: ['', Validators.required],
      pre_carriage: [''],
      load_place: [''],
      f_pOD: [''],
      dest_port: ['', Validators.required],
      on_carriage: [''],
      detention_currency: [''],
      pol_detentionfee: [''],
      portInDate: [''],
      pol_detention: [''],
      pod_detention: [''],
      pod_detentionfee: [''],
      pod_detentionamount: [''],
      planned_vessel: [''],
      planned_voyage: [''],
      final_voyage: [''],
      backup_vessel: [''],
      backup_voyage: [''],
      eta: [''],
      etd: [''],
      ata: [''],
      first_ata: [null],
      atd: [''],
      des_ata: [''],
      ts_port1: [''],
      ts_port2: [''],
      line_voyage_no: [''],
      transhipment: [false],
      portOfTranshipment: [''],
      transhipmentETA: [''],
      transhipmentETD: [''],
      rail: [false],
      isScanned: [false],
      // samePOD: [false],
      railName: [''],
      railNumber: [''],
      railATD: [''],
      railCurrentLocation : [''],
      railETD: [''],
      final_destinations: [''],
      final_ETA: [''],
      icdOrAdress: [''],
      icdCfsValue: [''],
      addressValue: [''],
      polAtd: [''],
      transhipmentATA: [""],
      transhipmentATD: [''],
      podAta: [''],
      final_ATA: [''],
      transhipmentVessel: [''],
      transhipmentfinal_voyage: [''],
      transhipmentHops: this.formBuilder.array([]),




      ////////////////
      stuffing_location_Type:[''],
      billingBranchStuffing:[false],
      stuffing:[false],
      stuffingfactory:[false],
      stuffingcfs:[false],
      Stuffing_shipper_address:[''],
      cfslocation:[''],

      preCarriage: [false],
      onCarriage: [false],

      transportPreCarriage: [''],
      transportOnCarriage: [''],
      transport: this.formBuilder.array(this.getInitialTransportRows()), 
      transport1: this.formBuilder.array(this.getInitialTransport1Rows()),

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
          transpoterType: ['transporter']
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
  sort(array, key) {
    return this.sortPipe.transform(array, key);
  }
  get f() {
    return this.routeForm.controls;
  }
  selectedValue: string;

  onSelectionChange(value: string) {
    this.selectedValue = value;
  }

  disabledEtaDatee = (current: Date): boolean => {
    if (this.todateValue)
      return current >= new Date(this.todateValue);
    else
      return false;
  };
  portList1: any = []
  portList2: any = []
  portList3: any = []
  portList4: any = []
  portList10 : any = []
 
 
  disabledEtdDatee = (current: Date): boolean => {
    if (this.fromdateValue)
      return differenceInCalendarDays(current, new Date(this.fromdateValue)) < 0;
    else
      return false;
  }
  currentUrl: string;
  show: boolean = false;

  CityList() {
    let payload = this.commonService.filterList()
    if (payload) payload.query = {
      status: true,
    }
    this.commonService.getSTList("city", payload)?.subscribe((data) => {
      this.cityListLand = data.documents || [];
    });
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.appCommon.currentMessage.subscribe(
      (msg) => (this.holdBatchType = msg)
    );
    this.CityList()
    this.getEnquiryList();
    this.getCurrencyList();
    // this.getAirPort();
    // this.getPortDropDowns();
    // this.getCharges()
    this.getBatchById1(this.id);
    this.currentUrl = this.router.url.split('?')[0].split('/')[3]
    if (this.currentUrl === 'show') {
      this.routeForm.disable();
      this.show = true
    }

    this.routeForm.get('transhipment').valueChanges.subscribe((checked) => {
      // if (checked) {
      //   this.addValidators();
      // } else {
      //   this.removeValidators();
      // }
    });
    this.routeForm.get('rail').valueChanges.subscribe((checked) => {
      //   if (checked) {
      //     this.addRailValidators();
      //   } else {
      //     this.removeRailValidators();
      //   }
      // 
    });
  }


  onSave() {



    const batchId = this.isConsolidate ? this.batchDetail?.batchId : this.route.snapshot.params['id'];
    this.submitted = true;
    const url = Constant.BATCH + '/' + batchId;
    if (this.routeForm.invalid) {
      return false;
    }

    this.portList1 = [...this.portList1, ...this.searchPortDataList]
    this.portList2 = [...this.portList2, ...this.searchPortDataList]
    this.portList3 = [...this.portList3, ...this.searchPortDataList]
    this.portList4 = [...this.portList4, ...this.searchPortDataList]
    this.portList10 = [...this.portList10, ...this.searchPortDataList]






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
        destinationName = this.portList2?.filter(x => x.portId === this.transport.at(this.transport?.controls?.length - 1).get('location').value)[0]?.portName
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









    const transporthubArray = this.routeForm.get('transhipmentHops') as FormArray; 
    transporthubArray.value.filter(x =>
      this.portList10?.filter(p => {
        if(p.portId === x?.load_port){
          x.load_portName = p?.portName || ''
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

    transporthubArray.value.filter(x =>
      this.vesselList?.filter(p => {
        if(p.airId === x?.flightNo){
          x.flightName = p?.flightNo
        }
      })
    )

    if(transporthubArray.value.length > 0){
      this.routeForm.get('transhipment').setValue(true)
    }


    let stuffing_location:any={
      "stuffing_location_Type":this.routeForm.value?.stuffing_location_Type
    };
    if(this.routeForm.value?.stuffing_location_Type === 'factory'){
      stuffing_location={
        ...stuffing_location,
        "billingBranchStuffingId":this.routeForm.value?.billingBranchStuffing,
        "billingBranchStuffingName":this.billingBranchList.find(d=>d?.branch_name===this.routeForm.value?.billingBranchStuffing)?.branch_name,
        "Stuffing_shipper_address":this.routeForm?.value?.Stuffing_shipper_address
      }
    }
    if(this.routeForm.value?.stuffing_location_Type === 'cfs'){
      stuffing_location={
        ...stuffing_location,
        "stuffingLocationId":this.routeForm.value?.cfslocation,
        "stuffingLocationIdName":this.cfsDropdownOptions.find(d=>d?.value===this.routeForm.value?.cfslocation)?.label
      }
    }

 
    let exRateValue = this.finalvoyageData?.filter((x) => x?.voyage_number === this.routeForm.value.final_voyage)[0]
    let shippingCurrency = this.finalvoyageData?.filter((x) => x?.voyage_number === this.routeForm.value.final_voyage)[0]?.currency || "";
    let payload = {
      ...this.batchDetail,
      isScanned: this.routeForm.value.isScanned,
      routeDetails: {
        ...this.batchDetail.routeDetails,
        finalShippingLineId: this.routeForm.value.shipping_line || '',
        finalShippingLineName: this.shippingLineList.filter(
          (x) => x.shippinglineId === this.routeForm.value.shipping_line
        )[0]?.name || '',
        finalVesselId: this.routeForm.value.final_vessel || '',
        finalVesselName: this.vesseldataShipping.filter(x => x.vesselId === this.routeForm.value.final_vessel)[0]?.vesselName || '',
        finalVoyageId: this.routeForm.value.final_voyage || '',
        finalVoyageName: this.routeForm.value.final_voyage || '',
        lineVoyageNo: this.routeForm.value.line_voyage_no,

        flightId: this.routeForm.value.flightNo,
        vehicleId: this.routeForm.value.vehicleNo,
        flightNo: this.flightList?.filter((x) => x.airId === this.routeForm.value.flightNo)[0]?.flight || '',
        vehicleNo: this.vehicalList?.filter((x) => x.landId === this.routeForm.value.vehicleNo)[0]?.vehicleLicence || '',

        loadPortId: this.routeForm.value.load_port,
        loadPortName: this.isTransport ? this.cityListLand?.filter?.((x) => x?.cityId == this.routeForm.value.load_port)[0]?.cityName : this.portList1?.filter?.((x) => x?.portId == this.routeForm.value.load_port)[0]?.portName || '',
        destPortId: this.routeForm.value.dest_port,
        destPortName: this.isTransport ? this.cityListLand?.filter?.((x) => x?.cityId == this.routeForm.value.dest_port)[0]?.cityName : this.portList3?.filter?.((x) => x?.portId == this.routeForm.value.dest_port)[0]?.portName || '',

        loadPlace: this.routeForm.value.load_place || '',
        loadPlaceName: this.locationData?.filter(x => x.locationId === this.routeForm.value.load_place)[0]?.locationName || '',

        detentionCurrency: this.routeForm.value.detention_currency || '',
        originFreeDays: this.routeForm.value.pol_detentionfee || '',
        portInDate: this.routeForm.value.portInDate || '',
        podCurrency: this.routeForm.value.pod_detention || '',
        destFreeDays: this.routeForm.value.pod_detentionfee || '',
        exchangeRate: (exRateValue?.exchageRate?.toString() || exRateValue?.exchage_rate?.toString()) || '0',
        currencyName: this.currencyData?.filter((x) => x?.currencyId === shippingCurrency)[0]?.currencyShortName,
        currency: shippingCurrency,
        preCarriageId: this.routeForm.value.pre_carriage,
        preCarriageName: this.preCarrigeList.filter(
          (x) => x.locationId === this.routeForm.value.pre_carriage
        )[0]?.name,

        eta: this.routeForm.value.eta || '',
        etd: this.routeForm.value.etd || '',
        ata: this.routeForm?.value?.podAta || '',
        atd: this.routeForm.value.polAtd || '',

        first_ata: this.routeForm.value.first_ata || '',
        des_ata: this.routeForm.value.des_ata || '',

        ts_port1: this.routeForm.value.ts_port1,
        ts_port1Name: this.PortData.filter((x) => x?.portId === this.routeForm.value?.ts_port1)[0]?.portDetails?.portName,
        ts_port2: this.routeForm.value.ts_port2,
        transhipment: this.routeForm.value.transhipment || false,
        portOfTranshipmentId: this.routeForm.value.portOfTranshipment,
        portOfTranshipmentName: this.isTransport ? this.cityListLand?.find((x) => x?.cityId == this.routeForm.value.portOfTranshipment)?.cityName : this.portList2?.find((x) => x?.portId == this.routeForm.value.portOfTranshipment)?.portName || '',
        transhipmentETA: this.routeForm.value.transhipmentETA,
        transhipmentETD: this.routeForm.value.transhipmentETD,
        rail: this.routeForm.value.rail,
        // samePOD: this.routeForm.value.samePOD || false,
        railName: this.routeForm.value.railName,
        railETD: this.routeForm.value.railETD,
        railATD: this.routeForm.value.railATD,
        railNumber: this.routeForm.value.railNumber,
        railCurrentLocation : this.routeForm.value.railCurrentLocation || '',
        final_destinationId: this.routeForm.value.final_destinations,
        final_destinationtName: this.isTransport ? this.cityListLand?.find((x) => x?.cityId === this.routeForm.value.final_destinations)?.cityName : this.portList4?.find((x) => x?.portId === this.routeForm.value.final_destinations)?.portName || '',
        final_ETA: this.routeForm.value.final_ETA,
        icdOrAdress: this.routeForm.value.icdOrAdress,
        icdCfsValueId: this.routeForm.value.icdCfsValue,
        icdCfsValueName: this.portLocationList?.find((location) => location?.locationId === this.routeForm.value.icdCfsValue)?.locationName,
        addressValue: this.routeForm?.value?.addressValue,
        polAtd: this.routeForm?.value?.polAtd,
        transhipmentATA: this.routeForm?.value?.transhipmentATA,
        transhipmentATD: this.routeForm?.value?.transhipmentATD,
        podAta: this.routeForm?.value?.podAta,
        final_ATA: this.routeForm?.value?.final_ATA,
        transhipmentVesselId: this.routeForm.value.transhipmentVessel || '',
        transhipmentVesselName: this.vesseldataShipping.filter(x => x.vesselId === this.routeForm.value.transhipmentVessel)[0]?.vesselName || '',
        transhipmentVoyage: this.routeForm.value.transhipmentfinal_voyage || '',

      },
      quotationDetails: {
        ...this.batchDetail?.quotationDetails,
        vesselId: this.routeForm.value.final_vessel || '',
        vesselName: this.vesseldataShipping.filter(x => x.vesselId === this.routeForm.value.final_vessel)[0]?.vesselName || '',
        voyageNumber: this.routeForm.value.final_voyage || '',

        carrierId: this.routeForm.value.shipping_line || '',
        carrierName: this.shippingLineList.filter(
          (x) => x.shippinglineId === this.routeForm.value.shipping_line
        )[0]?.name || '',
      },
      enquiryDetails: {
        ...this.batchDetail?.enquiryDetails,
        transhipmentHops: transporthubArray.value,
        transportDetails: {
          preCarriage: this.routeForm.value.preCarriage,
          onCarriage: this.routeForm.value.onCarriage,
          origin: this.routeForm.value.preCarriage ? this.addTransportValue() : [],
          destination: this.routeForm.value.onCarriage ? this.addTransport1Value() : []
        },
        routeDetails: {
          ...this.batchDetail?.enquiryDetails.routeDetails,
          eta: this.routeForm.value.eta || '',
          etd: this.routeForm.value.etd || '',
          loadPortId: this.routeForm.value.load_port,
          loadPortName: this.isTransport ? this.cityListLand?.filter?.((x) => x?.cityId == this.routeForm.value.load_port)[0]?.cityName : this.portList1?.filter?.((x) => x?.portId == this.routeForm.value.load_port)[0]?.portName || '',
          destPortId: this.routeForm.value.dest_port,
          destPortName: this.isTransport ? this.cityListLand?.filter?.((x) => x?.cityId == this.routeForm.value.dest_port)[0]?.cityName : this.portList3?.filter?.((x) => x?.portId == this.routeForm.value.dest_port)[0]?.portName || '',
          location: this.routeForm.value.icdCfsValue,
          locationName: this.portLocationList?.find((location) => location?.locationId === this.routeForm.value.icdCfsValue)?.locationName,
          loadPlace: this.routeForm.value.load_place || '',
          loadPlaceName: this.locationData?.filter(x => x.locationId === this.routeForm.value.load_place)[0]?.locationName || '',

        }
      }
    }

    if(this.routeForm.value?.stuffing_location_Type){
      payload["enquiryDetails"]["stuffing_location"]=stuffing_location
    }
    this._api.UpdateToST(url, payload)?.subscribe(
      (res) => {
        if (res) {
          this.sharedEventService.emitChargeSaved();

          if (this.routeForm.value.shipping_line && (this.isExport || this.isTransport)) {
            // this.getShippingLineCharges(this.batchDetail)
          }
          setTimeout(() => {
            this.getBatchById.emit();
          }, 1000);
          this.notification.create('success', 'Updated Successfully', '');
        }
      },
      (error) => {
        this.notification.create('error', error?.error?.error?.message, '');
      }
    );

  }

  onenMap(content) {
    let vesselId = this.routeForm.value.final_vessel;
    let payload = this.commonService.filterList();
    payload.query = {
      vesselId: vesselId
    }
    this._api.getSTList('vessel', payload)?.subscribe(
      (result) => {
        if (result) {
          this.mmsiNo = result?.documents?.[0]?.mmsino;
          this.vesselName = result?.documents?.[0]?.vesselName;
          if (!this.mmsiNo) {
            this.notification.create('error', 'Tracking Id Not Available, Please Update MMSI In Vessel', '');
            return;
          }
          this.modalService.open(content, {
            ariaLabelledBy: 'modal-basic-title',
            backdrop: 'static',
            keyboard: false,
            centered: true,
            size: 'lg',
          });
        }
      })

  }

  getShippingLineCharges(data) {
    this.deleteEnquiryCharges()


    let payload = this.commonService.filterList()
    payload.query = {
      shippinglineId: this.routeForm.value.shipping_line,
    }

    this.shippingCharges = [];
    this._api.getSTList('shippingline', payload)?.subscribe(
      (result) => {
        let shippingCharges = result?.documents[0]?.costItems || [];

        shippingCharges.forEach(element => {
          this.shippingCharges.push({
            ...element,
            'amount': element?.amount?.toString(),
            'enqDate': data?.basicDetails?.enquiryDate,
            'enqType': data?.basicDetails?.enquiryTypeName,
            'enquiryNumber': data?.enquiryNo,
            'enquiryitemId': "",
            'stcQuotationNo': data?.basicDetails?.stcQuotationNo.toString(),
            "costHeadName": "",
            "accountBaseCode": element?.accountBaseCode?.toString(),
            "tenantId": "1", "orgId": "1",
            "isFreight": false,

          })
        });

        let updateData = [];
        this.shippingCharges.forEach(element => {
          updateData.push({
            ...element,
            stcQuotationNo: data?.stcQuotationNo.toString(),
            batchId: data?.batchId,
            moveNumber: data?.moveNo,
            batchNo: data?.batchNo,
            agentadviceId: '',
            enquiryId: '',
            enquiryitemId: ''
          })
        });
        this.commonService.batchInsert('enquiryitem/batchinsert', updateData)?.subscribe();
      }
    );
  }

  getCharges() {

    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      batchId: this.route.snapshot.params['id']
    }
    this.shippingCharges = [];
    this._api.getSTList('enquiryitem', payload)?.subscribe(
      (result: any) => {
        result.documents.forEach((x) => {

          if (x?.shippingLine) {
            this.deleteArray.push({
              enquiryitemId: x?.enquiryitemId,
              searchKey: 'enquiryitemId',
            })
          }
        })

      }
    );
  }

  deleteEnquiryCharges() {
    if (this.deleteArray.length === 0) { return false }
    this.deleteArray.forEach(element => {
      const body = `enquiryitem/${element.enquiryitemId}`;
      this.commonService.deleteST(body)?.subscribe();
    });
  }



  getShippingLineDropDowns() {

    let payload = this.commonService.filterList();

    if (payload?.query) payload.query = {
      "status": true,
      "$and": [
        {
          "feeder": {
            "$ne": true
          }
        }
      ],
    }

    this._api
      .getSTList('shippingline', payload)
      ?.subscribe((res: any) => {
        this.shippingLineList = res?.documents;
      });
  }
  getEnquiryList() {

    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {}
    this.commonService
      .getSTList(Constant.ENQUIRY_LIST, payload)
      ?.subscribe((data: any) => {
        this.enquiryList = data.documents;
      });
  }

  async getVoyage() {
    let payload = this.commonService.filterList()
    payload.query = { status: true }
    await this._api
      .getSTList('vessel', payload)
      ?.subscribe((res: any) => {
        this.vesselList = res?.documents;
        this.voyageData = res?.documents;
        this.vesseldataShipping = res?.documents;
      });
  }

  getPortList() {

    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = { status: true }
    if (payload?.size) payload.size = 100
    if (payload?.project) payload.project = ["portDetails.portName", "portId", "portDetails.portTypeName"];

    this.commonService
      .getSTList('port', payload)
      ?.subscribe((res: any) => {
        // this.PortData = res.documents;

        this.PortData = res?.documents?.map(x => ({
          portId: x?.portId,
          portName: x?.portDetails?.portName,
          portTypeName: this.activeFrightAir ? 'air' : 'port'
        }));

        if ((this.isExport || this.isTransport)) {
          this.loadPortList = this.PortData
          this.destPortList = this.PortData
        } else {
          this.loadPortList = this.PortData
          this.destPortList = this.PortData
        }
      });
  }

  getLocation() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      status: true,
      masterType: {
        "$in": ['YARD', 'CFS', 'ICD']
      },
    }

    this.commonService
      .getSTList('location', payload)
      ?.subscribe((data) => {
        this.locationData = data.documents;
        // this.ICDlocationList = this.locationData.filter((x) => x?.ICD)
        // if ((this.isExport || this.isTransport)) {
        //   this.preCarrigeList = this.ICDlocationList.filter(x => x.country.toLowerCase() === 'india')
        // }
        // this.onCarrigeList = this.ICDlocationList
      });
  }
  cfsDropdownOptions:any = []
  getICDLocation() {
    let payload = this.commonService.filterList()

    if (payload) payload.query = {
      status: true,
      masterType: {
        "$in": ['YARD', 'CFS', 'ICD']
      },
    }


    this.commonService.getSTList("location", payload)?.subscribe((res: any) => {

      this.cfsDropdownOptions = res.documents.map((location: any) => ({
        label: location.locationName,
        value: location.locationId
      }));
      this.locationList = res?.documents;
      this.locationData = res?.documents;
      this.ICDlocationList = res?.documents;
      this.preCarrigeList = res?.documents;
      this.onCarrigeList = res?.documents;
    });
  }
  partyMasterList:any= []
  getPartyMaster(){
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = { status: true }
    this.commonService.getSTList("partymaster", payload)?.subscribe((res: any) => {
      this.partyMasterList = res.documents;
    });
  }
  getCurrencyList() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = { status: true }

    this.commonService
      .getSTList('currency', payload)
      ?.subscribe((res: any) => {
        this.currencyData = res.documents;

        // if (!(this.isExport || this.isTransport)) {
        //   let currency = this.currencyData.filter(x => x.currencyShortName.toLowerCase() === 'usd')[0]?.currencyId
        //   this.routeForm.get('pod_detention').setValue(currency)

        // }
      });
  }
  async getAir() {
    let payload = this.commonService.filterList()
    payload.query = { status: true }
    await this._api
      .getSTList('air', payload)
      ?.subscribe((res: any) => {
        this.flightList = res?.documents;
      });
  }
  async getLand() {
    let payload = this.commonService.filterList()
    payload.query = { status: true }
    await this._api
      .getSTList('land', payload)
      ?.subscribe((res: any) => {
        this.vehicalList = res?.documents;
      });
  }
  async getVesselList() {
    let payload = this.commonService.filterList()
    payload.query = { status: true }

    await this.commonService
      .getSTList('vessel', payload)
      ?.subscribe((res: any) => {
        this.vesseldata = res.documents;
      });
  }
  loadportchange(e?) {
    if ((this.isExport || this.isTransport)) {
      this.preCarrigeList = this.ICDlocationList.filter(x => x.portId === e)
    } else {
      this.preCarrigeList = this.ICDlocationList
    }

      const lastFormGroup = this.transport.at(this.transport.length - 1) as FormGroup;
        if (lastFormGroup)
          lastFormGroup.patchValue({
            location: this.routeForm.value.load_port
          });

  }
  desPortchange(e?) {
    if ((this.isExport || this.isTransport)) {
      this.onCarrigeList = this.ICDlocationList.filter(x => x.portId === e)
    } else {
      this.onCarrigeList = this.ICDlocationList
    }

    const firstFormGroup = this.transport1.at(0) as FormGroup;
    if (firstFormGroup)
      firstFormGroup.patchValue({
        location: this.routeForm.value.dest_port
      });
  }
  
  activeFrightAir: boolean = false
  activeFright: string = ''

  getBatchById1(id) {

    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = { batchId: id }
    if (this.isConsolidate) {
      const batchIds = this.consolidationbooking?.batchwiseGrouping?.map((bt) => { return { "batchId": bt?.batchId } });
      if (payload?.query) payload.query = { $or: batchIds }
    }
    this._api
      .getSTList(Constant.BATCH_LIST, payload)
      ?.subscribe((res: any) => {
        this.batchDetail = res?.documents[0];




        if (this.batchDetail?.statusOfBatch == 'Job Cancelled' || this.batchDetail?.statusOfBatch == 'Job Closed') {
          this.routeForm.disable();
          this.isShow = true
        }
        this.routeForm.patchValue({

          vehicleNo: this.batchDetail?.routeDetails?.vehicleId ? this.batchDetail?.routeDetails?.vehicleId : this.batchDetail?.quotationDetails?.vehicleId,
          flightNo: this.batchDetail?.routeDetails?.flightId ? this.batchDetail?.routeDetails?.flightId : this.batchDetail?.quotationDetails?.flightId,


          shipping_line: this.batchDetail?.routeDetails?.finalShippingLineId ? this.batchDetail?.routeDetails?.finalShippingLineId : this.batchDetail?.quotationDetails?.carrierId,
          final_vessel: this.batchDetail?.routeDetails?.finalVesselId ? this.batchDetail?.routeDetails?.finalVesselId : (this.isExport || this.isTransport) ? this.batchDetail?.quotationDetails?.vesselId : this.batchDetail?.quotationDetails?.vesselId,
          final_voyage: this.batchDetail?.routeDetails?.finalVoyageId ? this.batchDetail?.routeDetails?.finalVoyageId : (this.isExport || this.isTransport) ? this.batchDetail?.quotationDetails?.voyageNumber : this.batchDetail?.quotationDetails?.voyageNumber,

          eta: this.batchDetail?.routeDetails?.eta ? this.batchDetail?.routeDetails?.eta : (this.isExport || this.isTransport) ? this.batchDetail?.quotationDetails?.eta : this.batchDetail?.enquiryDetails?.routeDetails?.destPortETA,
          etd: this.batchDetail?.routeDetails?.etd ? this.batchDetail?.routeDetails?.etd : (this.isExport || this.isTransport) ? this.batchDetail?.quotationDetails?.etd : this.batchDetail?.enquiryDetails?.routeDetails?.loadPortETD,

          ata: this.batchDetail?.routeDetails?.podAta ? this.batchDetail?.routeDetails?.podAta : '',
          atd: this.batchDetail?.routeDetails?.polAtd ? this.batchDetail?.routeDetails?.polAtd : '',

          first_ata: this.batchDetail?.routeDetails?.first_ata ? this.batchDetail?.routeDetails?.first_ata : this.batchDetail?.enquiryDetails?.productDetails?.targetDeliveryDate ? this.batchDetail?.enquiryDetails?.productDetails?.targetDeliveryDate : '',
          des_ata: this.batchDetail?.routeDetails?.des_ata ? this.batchDetail?.routeDetails?.des_ata : (this.isExport || this.isTransport) ? new Date() : this.batchDetail?.enquiryDetails?.routeDetails?.destPortETA,

          load_port: this.batchDetail?.routeDetails?.loadPortId ? this.batchDetail?.routeDetails?.loadPortId : this.batchDetail?.enquiryDetails?.routeDetails?.loadPortId ? this.batchDetail?.enquiryDetails?.routeDetails?.loadPortId : '',
          pre_carriage: this.batchDetail?.enquiryDetails?.routeDetails?.preCarriageId || '',
          load_place: this.batchDetail?.routeDetails?.loadPlace ? this.batchDetail?.routeDetails?.loadPlace : this.batchDetail?.enquiryDetails?.routeDetails?.loadPlace ? this.batchDetail?.enquiryDetails?.routeDetails?.loadPlace : '',
          f_pOD: this.batchDetail?.enquiryDetails?.routeDetails?.fpodId || '',
          dest_port: this.batchDetail?.routeDetails?.destPortId ? this.batchDetail?.routeDetails?.destPortId : this.batchDetail?.enquiryDetails?.routeDetails?.destPortId ? this.batchDetail?.enquiryDetails?.routeDetails?.destPortId : '',
          on_carriage: this.batchDetail?.enquiryDetails?.routeDetails?.onCarriageId || '',

          // detention_currency: this.batchDetail?.quotationDetails?.currency || '',
          detention_currency: this.batchDetail?.routeDetails?.detentionCurrency ? this.batchDetail?.routeDetails?.detentionCurrency : this.batchDetail?.quotationDetails?.currency ? this.batchDetail?.quotationDetails?.currency : '',
          // pol_detentionfee: this.batchDetail?.quotationDetails?.originFreeDays || '',
          pol_detentionfee: this.batchDetail?.routeDetails?.originFreeDays ? this.batchDetail?.routeDetails?.originFreeDays : this.batchDetail?.quotationDetails?.originFreeDays ? this.batchDetail?.quotationDetails?.originFreeDays : '',
          // pol_detention: this.batchDetail?.routeDetails?.pol_detention ? this.batchDetail?.routeDetails?.pol_detention || '' : this.batchDetail?.polDetentionAmount || '',
          portInDate: this.batchDetail?.enquiryDetails?.routeDetails?.portInDate || '',

          // pod_detention: this.batchDetail?.quotationDetails?.currency || '',
          pod_detention: this.batchDetail?.routeDetails?.podCurrency ? this.batchDetail?.routeDetails?.podCurrency : this.batchDetail?.quotationDetails?.currency ? this.batchDetail?.quotationDetails?.currency : '',
          // pod_detentionfee: this.batchDetail?.quotationDetails?.destFreeDays || '',
          pod_detentionfee: this.batchDetail?.routeDetails?.destFreeDays ? this.batchDetail?.routeDetails?.destFreeDays : this.batchDetail?.quotationDetails?.destFreeDays ? this.batchDetail?.quotationDetails?.destFreeDays : '',
          // pod_detentionamount: this.batchDetail?.routeDetails?.pod_detentionamount ? this.batchDetail?.routeDetails?.pod_detentionamount || '' : this.batchDetail?.podDetentionAmount || '',




          ts_port1: this.batchDetail?.routeDetails?.ts_port1 || '',

          ts_port2: this.batchDetail?.routeDetails?.ts_port2 || '',

          line_voyage_no: this.batchDetail?.routeDetails?.lineVoyageNo || '',
          transhipment: this.batchDetail?.routeDetails?.transhipment || false,
          portOfTranshipment: this.batchDetail?.routeDetails?.portOfTranshipmentId || this.routeForm.value.portOfTranshipment,

          transhipmentETA: this.batchDetail?.routeDetails?.transhipmentETA,
          transhipmentETD: this.batchDetail?.routeDetails?.transhipmentETD,

          rail: this.batchDetail?.routeDetails?.rail || this.routeForm.value.rail,
          isScanned: this.batchDetail?.isScanned || this.routeForm.value.isScanned,
          // samePOD: this.batchDetail?.routeDetails?.samePOD || this.routeForm.value.samePOD,
          railName: this.batchDetail?.routeDetails?.railName || this.routeForm.value.railName,
          railETD: this.batchDetail?.routeDetails?.railETD,
          railATD: this.batchDetail?.routeDetails?.railATD,
          railNumber: this.batchDetail?.routeDetails?.railNumber || this.routeForm.value.railNumber,
          railCurrentLocation : this.batchDetail?.routeDetails?.railCurrentLocation || this.routeForm.value.railCurrentLocation,
          final_destinations: this.batchDetail?.routeDetails?.final_destinationId || this.routeForm.value.final_destinations,

          final_ETA: this.batchDetail?.routeDetails?.final_ETA,

          icdOrAdress: this.batchDetail?.routeDetails?.icdOrAdress || this.routeForm.value.icdOrAdress,
          icdCfsValue: this.batchDetail?.enquiryDetails?.routeDetails?.location || this.batchDetail?.routeDetails?.icdCfsValueId,
          addressValue: this.batchDetail?.routeDetails?.addressValue || this.routeForm?.value?.addressValue,
          polAtd: this.batchDetail?.routeDetails?.polAtd || this.routeForm?.value?.polAtd,
          transhipmentATA: this.batchDetail?.routeDetails?.transhipmentATA || this.routeForm?.value?.transhipmentATA,
          transhipmentATD: this.batchDetail?.routeDetails?.transhipmentATD || this.routeForm?.value?.transhipmentATD,
          podAta: this.batchDetail?.routeDetails?.podAta || this.routeForm?.value?.podAta,
          final_ATA: this.batchDetail?.routeDetails?.final_ATA || this.routeForm?.value?.final_ATA,
          transhipmentVessel: this.batchDetail?.routeDetails?.transhipmentVesselId,
          transhipmentfinal_voyage: this.batchDetail?.routeDetails?.transhipmentVoyage,


          preCarriage: this.batchDetail?.enquiryDetails?.transportDetails?.preCarriage,
          onCarriage: this.batchDetail?.enquiryDetails?.transportDetails?.onCarriage,

          stuffing_location_Type: this.batchDetail?.enquiryDetails?.stuffing_location?.stuffing_location_Type,
          billingBranchStuffing: this.batchDetail?.enquiryDetails?.stuffing_location?.billingBranchStuffingName,
          Stuffing_shipper_address: this.batchDetail?.enquiryDetails?.stuffing_location?.Stuffing_shipper_address,

          stuffing : this.batchDetail?.enquiryDetails?.stuffing_location?.stuffing_location_Type != "" ? true : false,


        });
        // this.setVoyage((this.isExport || this.isTransport) ? this.batchDetail?.quotationDetails?.vesselId : this.batchDetail?.enquiryDetails?.routeDetails?.vesselId)
        // this.loadportchange(this.batchDetail?.enquiryDetails?.routeDetails?.loadPortId)
        // this.desPortchange(this.batchDetail?.enquiryDetails?.routeDetails?.destPortId)
        // this.getVesselVoyageList(true)
        // setTimeout(() => {
        //   this.setfinalVessel(this.batchDetail?.routeDetails?.finalVesselId, false)
        // }, 800);

        this.activeFright = this.batchDetail?.enquiryDetails?.basicDetails?.ShipmentTypeName?.toLowerCase()
        this.activeFrightAir = this.activeFright === 'air' ? true : false



            if (this.batchDetail?.enquiryDetails?.transportDetails?.destination?.length > 0) {
                  const transportArray = this.routeForm.get('transport1') as FormArray;
                  transportArray.clear();
                  this.batchDetail?.enquiryDetails?.transportDetails?.destination?.filter((e, i) => {
                    this.addTransport1Row(e, i)
                  })
                } else {
                  const transportArray = this.routeForm.get('transport1') as FormArray;
                  transportArray.clear();
                  this.getInitialTransport1Rows().forEach(row => transportArray.push(row));
                }
                if (this.batchDetail?.enquiryDetails?.transportDetails?.origin?.length > 0) {
                  const transportArray = this.routeForm.get('transport') as FormArray;
                  transportArray.clear();
                  this.batchDetail?.enquiryDetails?.transportDetails?.origin?.filter((e, i) => {
                    this.addTransportRow(e, i)
                  })
                } else {
                  const transportArray = this.routeForm.get('transport') as FormArray;
                  transportArray.clear();
                  this.getInitialTransportRows().forEach(row => transportArray.push(row));
                }


        if(this.batchDetail?.enquiryDetails?.transhipmentHops?.length > 0){
          this.batchDetail?.enquiryDetails?.transhipmentHops?.filter((e, i) => {
          this.addTranshipmentHop(e)
          })
 
          this.batchDetail?.enquiryDetails?.transhipmentHops?.forEach((e, i) => {
            this.tanshipmentHOPPorts.push(e.load_port) 
          })
        }

        if(this.batchDetail?.enquiryDetails?.stuffing_location?.stuffing_location_Type != ""){
          
          if (this.batchDetail?.enquiryDetails?.stuffing_location?.stuffing_location_Type === 'factory') {
            this.routeForm.get('stuffingfactory').setValue(true) 
            this.routeForm.get('stuffingcfs').setValue(false) 
            this.showFactoryDropdowns = true;
            this.showCfsDropdown = false; 
          } else if (this.batchDetail?.enquiryDetails?.stuffing_location?.stuffing_location_Type === 'cfs') {
            this.routeForm.get('stuffingcfs').setValue(true) 
            this.routeForm.get('stuffingfactory').setValue(false) 
            this.showCfsDropdown = true;
            this.showFactoryDropdowns = false; 
          }
        }

        let data = {
          destPortId: this.batchDetail?.routeDetails?.destPortId || this.batchDetail?.enquiryDetails?.routeDetails?.destPortId || '',
          final_destinationId: this.batchDetail?.routeDetails?.final_destinationId || '',
          portOfTranshipmentId: this.batchDetail?.routeDetails?.portOfTranshipmentId || '',
          loadPortId: this.batchDetail?.routeDetails?.loadPortId || this.batchDetail?.enquiryDetails?.routeDetails?.loadPortId || ''
        }
        this.searchPortAll(data)
        setTimeout(() => {
          this.desPortchange()
          this.loadportchange() 
        }, 1000);
        this.searchPortLocation(this.batchDetail?.enquiryDetails?.routeDetails?.locationName || this.batchDetail?.routeDetails?.addressValue)

        this.billingBranchList = this.partyMasterList.find((x) => x?.partymasterId === this.batchDetail?.enquiryDetails?.basicDetails?.billingPartyId)?.branch || []
      });
  }
  billingBranchList:any = []
  billingBranchList1:any = []
  tanshipmentHOPPorts:any = []
  addTranshipmentHop(item?,isDisabled?): void {
    const row = this.formBuilder.group({
      load_port: [item ? item.load_port : ''],
      etd: [item ? item.etd : ''],
      eta: [item ? item.eta : ''],
      ata: [item ? item.ata : ''],
      atd: [item ? item.atd : ''],
      transhipmentHopId: [item?.transhipmentHopId || uuidv4()],
      plannedVessel: [item ? item.plannedVessel : ''],
      voyageNumber: [item ? item.voyageNumber : ''],
      flightNo: [item ? item.flightNo : ''],

    });
  
    (this.routeForm.get('transhipmentHops') as FormArray).push(row); 
  }
  
   
    getTransportHubControls(): AbstractControl[] {
          return (this.routeForm.get('transhipmentHops') as FormArray).controls;
        }
   
   removeTranshipmentHop(index: number): void {
     (this.routeForm.get('transhipmentHops') as FormArray).removeAt(index);
   }

  onClose() {
    if (this.isConsolidate) {
      this.router.navigate(['/consolidation-booking/list']);
    }
    else {
      this.router.navigate(['/batch/list']);
    }
  }
  disabledEtdDate = (current: Date): boolean => {
    if (this.routeForm.controls.first_ata.value)
      return (
        differenceInCalendarDays(
          current,
          new Date(this.routeForm.controls.first_ata.value)
        ) < 0
      );
    else return false;
  };
  changeFromDate() {
    this.routeForm.controls.atd.setValue('')
  }
  disabledDate = (current: Date): boolean => {
    if (this.routeForm.controls.etd?.value)
      return (
        differenceInCalendarDays(
          current,
          new Date(this.routeForm.controls.etd.value)
        ) < 0
      );
    else return false;
  };
  changeetaDate() {
    this.routeForm.controls.eta.setValue('')
  }

  setVoyage(e) {
    return;
    let vessel = this.vesselList.filter((x) => x?.vesselId == e)[0]
    // this.routeForm.controls.first_ata.setValue(vessel?.ata);
    if (vessel?.atd) this.routeForm.controls.atd.setValue(vessel?.atd);
    if (vessel?.voyage?.length > 0) {
      let voyageNo = vessel?.voyage?.filter((x) => x?.shipping_line == this.routeForm.value.shipping_line)[0]?.voyage_number
      this.routeForm.controls.final_voyage.setValue(voyageNo);
    }
  }
  setfinalVessel(e, changeSL) {
    if (changeSL) {
      this.routeForm.controls.final_voyage.setValue('')
      this.routeForm.controls.final_vessel.setValue('')
      this.routeForm.controls.line_voyage_no.setValue('')
    }
    this.finalvoyageData = []
    if (!e) { return false };
    let vesselData = this.voyageData.filter((x) => x?.vesselId === e)[0]
    vesselData?.voyage?.forEach((element) => {
      if (element?.shipping_line === this.routeForm.value?.shipping_line) {
        this.finalvoyageData.push(element)
      }
    });

  }
  addValidators() {
    this.routeForm.get('portOfTranshipment').setValidators([Validators.required]);
    this.routeForm.get('transhipmentETA').setValidators([Validators.required]);
    this.routeForm.get('transhipmentETD').setValidators([Validators.required]);

    // Update validity after changing validators
    this.routeForm.get('portOfTranshipment').updateValueAndValidity();
    this.routeForm.get('transhipmentETA').updateValueAndValidity();
    this.routeForm.get('transhipmentETD').updateValueAndValidity();
  }

  // Remove validators when transhipment is unchecked
  removeValidators() {
    this.routeForm.get('portOfTranshipment').clearValidators();
    this.routeForm.get('transhipmentETA').clearValidators();
    this.routeForm.get('transhipmentETD').clearValidators();

    // Update validity after removing validators
    this.routeForm.get('portOfTranshipment').updateValueAndValidity();
    this.routeForm.get('transhipmentETA').updateValueAndValidity();
    this.routeForm.get('transhipmentETD').updateValueAndValidity();
  }


  addRailValidators() {
    this.routeForm.get('railName').setValidators([Validators.required]);
    this.routeForm.get('railNumber').setValidators([Validators.required]);
    this.routeForm.updateValueAndValidity();
  }

  // Remove validation when rail toggle is false
  removeRailValidators() {
    this.routeForm.get('railName').clearValidators();
    this.routeForm.get('railNumber').clearValidators();
    this.routeForm.updateValueAndValidity();
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
        "$regex": "\\Q"+event+"\\E",
        "$options": "i"
      }
      payload.query = {
        ...payload.query,
        ...mustArray
      }
    }
    url = this.commonService.getSTList1("search-port-and-location", payload)
    return url?.subscribe((res: any) => { 
      this.portLocationList =  res?.documents?.filter(
        (obj, index, self) => index === self.findIndex(o => o.locationId === obj.locationId)
      ) || []
    });
  }

  searchPort(event: string, type) {
    if (!event) return;
    this.type = type
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
  type: any = ''
  fetchPortList(event: string) {
    if (!event) {
      return
    }

    if (this.type == '1') {
      this.portList1 = []
    } else if (this.type == '2') {
      this.portList2 = []
    } else if (this.type == '3') {
      this.portList3 = []
    } else if (this.type == '4') {
      this.portList4 = []
    }
    else if (this.type == '10') {
      this.portList10 = []
    }

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
    return url?.subscribe((res: any) => {
      res?.documents?.map(x => {
        if (this.type == '1') {
          this.portList1.push({
            portId: this.activeFrightAir ? x?.airportmasterId : x?.portId,
            portName: this.activeFrightAir ? x.airPortname : x?.portDetails?.portName,
            portTypeName: this.activeFrightAir ? 'air' : 'port'
          })
        } else if (this.type == '2') {
          this.portList2.push({
            portId: this.activeFrightAir ? x?.airportmasterId : x?.portId,
            portName: this.activeFrightAir ? x.airPortname : x?.portDetails?.portName,
            portTypeName: this.activeFrightAir ? 'air' : 'port'
          })
        } else if (this.type == '3') {
          this.portList3.push({
            portId: this.activeFrightAir ? x?.airportmasterId : x?.portId,
            portName: this.activeFrightAir ? x.airPortname : x?.portDetails?.portName,
            portTypeName: this.activeFrightAir ? 'air' : 'port'
          })
        } else if (this.type == '4') {
          this.portList4.push({
            portId: this.activeFrightAir ? x?.airportmasterId : x?.portId,
            portName: this.activeFrightAir ? x.airPortname : x?.portDetails?.portName,
            portTypeName: this.activeFrightAir ? 'air' : 'port'
          })
        }else if (this.type == '10') {
          this.portList10.push({
            portId: this.activeFrightAir ? x?.airportmasterId : x?.portId,
            portName: this.activeFrightAir ? x.airPortname : x?.portDetails?.portName,
            portTypeName: this.activeFrightAir ? 'air' : 'port'
          })
        }

      });
      if (this.type == '1') {
        this.portList1 = this.portList1.filter(
          (obj, index, self) => index === self.findIndex(o => o.portId === obj.portId)
        );
      } else if (this.type == '2') {
        this.portList2 = this.portList2.filter(
          (obj, index, self) => index === self.findIndex(o => o.portId === obj.portId)
        );
      } else if (this.type == '3') {
        this.portList3 = this.portList3.filter(
          (obj, index, self) => index === self.findIndex(o => o.portId === obj.portId)
        );
      } else if (this.type == '4') {
        this.portList4 = this.portList4.filter(
          (obj, index, self) => index === self.findIndex(o => o.portId === obj.portId)
        );
      }else if (this.type == '10') {
        this.portList10 = this.portList10.filter(
          (obj, index, self) => index === self.findIndex(o => o.portId === obj.portId)
        );
      }
    });
  }
  readonly nzFilterOption = (): boolean => true;
  searchPortAll(event) {
    this.portList1 = []
    this.portList2 = []
    this.portList3 = []
    this.portList4 = []
    this.portList10 = []
    let payload = this.commonService.filterList()

    if (payload) payload.query = {
      status: true,
    }
    if (payload?.size) payload.size = 100

    let url;
    if (this.activeFrightAir) {
      payload.query['$or'] = payload.query['$or'] || [];

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
        if (event.portOfTranshipmentId) {
          payload.query = {
            ...payload.query,
            "$or": [
              ...(payload.query["$or"] || []),
              { "airportmasterId": event?.portOfTranshipmentId },
            ],
          };
        }
        if (event.final_destinationId) {
          payload.query = {
            ...payload.query,
            "$or": [
              ...(payload.query["$or"] || []),
              { "airportmasterId": event?.final_destinationId },
            ],
          };
        }


        if(this.tanshipmentHOPPorts?.length > 0){
          this.tanshipmentHOPPorts?.filter((x)=>{
            payload.query = {
              ...payload.query,
              "$or": [
                ...(payload.query["$or"] || []),
                { "airportmasterId": x },
              ],
            }
          })
         

        }

      }
      url = this.commonService.getSTList("airportmaster", payload)
    } else {
      if (payload?.project) payload.project = ["portDetails.portName", "portDetails.portTypeName", "portId"];


      payload.query['$or'] = payload.query['$or'] || [];

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
        if (event.portOfTranshipmentId) {
          payload.query = {
            ...payload.query,
            "$or": [
              ...(payload.query["$or"] || []),
              { "portId": event?.portOfTranshipmentId },
            ],
          };
        }
        if (event.final_destinationId) {
          payload.query = {
            ...payload.query,
            "$or": [
              ...(payload.query["$or"] || []),
              { "portId": event?.final_destinationId },
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

      this.portList1.push(...portData);
      this.portList2.push(...portData, ...this.PortData);
      this.portList3.push(...portData);
      this.portList4.push(...portData, ...this.PortData);
      this.portList10.push(...portData);


      this.portList1 = this.portList1.filter(
        (obj, index, self) => index === self.findIndex(o => o.portId === obj.portId)
      );

      this.portList10 = this.portList10.filter(
        (obj, index, self) => index === self.findIndex(o => o.portId === obj.portId)
      );

      this.portList2 = this.portList2.filter(
        (obj, index, self) => index === self.findIndex(o => o.portId === obj.portId)
      );

      this.portList3 = this.portList3.filter(
        (obj, index, self) => index === self.findIndex(o => o.portId === obj.portId)
      );

      this.portList4 = this.portList4.filter(
        (obj, index, self) => index === self.findIndex(o => o.portId === obj.portId)
      );

    });
  }
  searchPortDataList: any = []
  setPlaceOfDelivery() { 

    this.portLocationList.unshift({
      locationId: this.routeForm.get('dest_port').value,
      locationName: this.portList3.filter(x => x.portId === this.routeForm.get('dest_port').value)[0]?.portName,
      locationType: this.activeFrightAir ? 'air' : 'port'
    })

    this.portLocationList = this.portLocationList.filter(
      (obj, index, self) => index === self.findIndex(o => o.portId === obj.portId)
    );

    if (this.routeForm.get('samePOD').value)
      this.routeForm.get('icdCfsValue').setValue(this.routeForm.get('dest_port').value)
  }



  //////////////////



  onCheckboxChange(type: string, event: Event): void {
    this.routeForm.get('stuffing_location_Type').setValue(type)
    const checkbox = event.target as HTMLInputElement;
    if (type === 'factory') {
      this.routeForm.get('stuffingfactory').setValue(true) 
      this.routeForm.get('stuffingcfs').setValue(false) 
      this.showFactoryDropdowns = checkbox.checked;
      this.showCfsDropdown = false; 
    } else if (type === 'cfs') {
      this.routeForm.get('stuffingfactory').setValue(false) 
      this.routeForm.get('stuffingcfs').setValue(true) 
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
    this.routeForm.get(target).setValue(address?.branch_address);
   }
  }


    getTransportControls(): AbstractControl[] {
      return (this.routeForm.get('transport') as FormArray).controls;
    }
    
   
    getTransport1Controls(): AbstractControl[] {
      return (this.routeForm.get('transport1') as FormArray).controls;
    }
  
    addTransportRow(item?: any, i?: any): void {
      const row = this.formBuilder.group({
        locationType: [item ? item.locationType : 'location', Validators.required],
        location: [item ? item.location : '', item ? item.locationType == 'location' ? Validators.required : '' : Validators.required],
        etd: [item ? item.etd : ''],
        eta: [item ? item.eta : ''],
        address: [item ? item.address : ''],
        addressId: [item ? item.addressId : '', item ? (this.isTransport ? item.address == '' : item.locationType == 'address') ? '' : '' : ''],
        transit: [item ? item.transit : '', item ? (i + 1 !== this.batchDetail?.enquiryDetails?.transportDetails?.origin?.length && !(this.isTransport)) ? Validators.required : '' : this.isTransport ? '' : Validators.required],
        carrier: [item ? item.carrier : '', item ? (i + 1 !== this.batchDetail?.enquiryDetails?.transportDetails?.origin?.length && !(this.isTransport)) ? Validators.required : '' : this.isTransport ? '' : Validators.required],
        branch: [item ? item.branch : '', item ? (i + 1 !== this.batchDetail?.enquiryDetails?.transportDetails?.origin?.length && this.isTransport) ? Validators.required : '' : this.isTransport ? Validators.required : ''],
  
        carrierList: [item ? item?.carrierList || [] : [], item ? (i + 1 !== this.batchDetail?.enquiryDetails?.transportDetails?.origin?.length && this.isTransport && item?.transpoterType === 'transporter') ? Validators.required : '' : (this.isTransport && item?.transpoterType === 'transporter') ? Validators.required : ''],
        transpoterType: [item ? item?.transpoterType || 'transporter' : 'transporter'],
      });
  
  
  
      if (item) {
        (this.routeForm.get('transport') as FormArray).push(row);
  
      } else {
        this.addRowToSecondLastPosition(row)
      }
      if (this.isTransport) {
        this.setValidationFromArray()
      }
  
  
    }

      get transport(): FormArray {
        return this.routeForm.get('transport') as FormArray;
      }
      get transhipmentHops(): FormArray {
        return this.routeForm.get('transhipmentHops') as FormArray;
      }
        get transport1(): FormArray {
          return this.routeForm.get('transport1') as FormArray;
        }
    setValidationFromArray() {
      this.transport.controls.forEach((control: FormGroup, index) => {
        if (this.routeForm.value.preCarriage) {
          if (index + 1 < this.transport.controls?.length) {
            control.get('etd').setValidators(Validators.required);
            if (this.isTransport) {
              control.get('branch').setValidators(Validators.required);
              if (control.get('transpoterType').value === 'transporter') {
                control.get('carrierList').setValidators(Validators.required);
              } else {
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
            if (control.get('address').value === '') {}
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
        if (this.routeForm.value.onCarriage) {
          if (index + 1 !== this.transport1.controls?.length) {
            control.get('etd').setValidators(Validators.required);
            control.get('transit').setValidators(Validators.required);
            control.get('carrier').setValidators(Validators.required);
          }
          if (index !== 0) {
  
            control.get('eta').setValidators(Validators.required);
          }
          if (control.get('locationType').value == 'address') {
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
        this.transport.at(this.transport?.controls?.length - 1).get('location').setValue(this.routeForm.value.load_port || '')
        this.transport.at(this.transport?.controls?.length - 1).get('locationType').setValue('port')
        this.transport1.at(0).get('location').setValue(this.routeForm.value.dest_port || '')
        this.transport1.at(0).get('locationType').setValue('port')
      }
    }
    addTransport1Row(item?: any, i?: any): void {
      const row = this.formBuilder.group({
        locationType: [item ? item.locationType : 'location', Validators.required],
        location: [item ? item.location : '', item ? item.locationType == 'location' ? Validators.required : '' : Validators.required],
        etd: [item ? item.etd : '', item ? i + 1 !== this.batchDetail?.enquiryDetails?.transportDetails?.destination?.length ? Validators.required : '' : Validators.required],
        eta: [item ? item.eta : '', item ? i !== 0 ? Validators.required : '' : Validators.required],
        address: [item ? item.address : ''],
        addressId: [item ? item.addressId : '', item ? (this.isTransport ? item.address == '' : item.locationType == 'address') ? '': '' : ''],
        transit: [item ? item.transit : '', item ? i + 1 !== this.batchDetail?.enquiryDetails?.transportDetails?.destination?.length ? Validators.required : '' : Validators.required],
        carrier: [item ? item.carrier : '', item ? i + 1 !== this.batchDetail?.enquiryDetails?.transportDetails?.destination?.length ? Validators.required : '' : Validators.required],
      });
  
      if (item) {
        (this.routeForm.get('transport1') as FormArray).push(row);
      } else {
        this.addRowToSecondLastPosition1(row)
      }
  
    }
  
    addRowToSecondLastPosition(row: FormGroup) {
      const transportArray = this.routeForm.get('transport') as FormArray;
      const secondLastIndex = transportArray.length - 1;
  
      if (secondLastIndex >= 0) {
        transportArray.insert(secondLastIndex, row);
      } else {
        transportArray.insert(0, row);
      }
    }
    addRowToSecondLastPosition1(row: FormGroup) {
      const transportArray = this.routeForm.get('transport1') as FormArray;
      const secondLastIndex = transportArray.length - 1;
  
      if (secondLastIndex >= 0) {
        transportArray.insert(secondLastIndex, row);
      } else {
        transportArray.insert(0, row);
      }
    }
    deleteTransportRow(index: number): void {
      (this.routeForm.get('transport') as FormArray).removeAt(index);
    }
    deleteTransportRow1(index: number): void {
      (this.routeForm.get('transport1') as FormArray).removeAt(index);
    }
    etdSelectedDate: Date | null = null;
  
    onETDChange(date: Date | null): void {
      this.etdSelectedDate = date;
      // if (date && this.isAddMode) {
      //   this.routeForm.get('eta')?.setValue(null);
      // }
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

    addTransportValue() {
      const transportArray = [];
      this.getTransportControls().forEach((element, index) => {
        if (this.isTransport) {
          if (index === 0) {
            var selectedBranch = this.billingBranchList?.find((x) => x.branch_name === element.value.address);
          } else {
            var selectedBranch = this.billingBranchList1?.find((x) => x.branch_name === element.value.address);
          }
  
        } else {
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
          carrierList: element.value.transpoterType === 'transporter' ? element.value.carrierList || [] : [],
          transpoterType: element.value.transpoterType || 'transporter',
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
            this.portList3?.filter((x) => x.portId == element.value.location)[0]?.portName || '',
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
    addFlightForm: FormGroup;
    addFlight(content){
      this.formBuildFlight()
      this.getairLineType()
      this.modalService.open(content, {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        centered: true,
        size: 'lg',
      });
    }
    get f3() {
      return this.addFlightForm.controls;
    }
    formBuildFlight() {
      this.addFlightForm = this.formBuilder.group({
        airline: ['', Validators.required],
        airlineCode: ['', Validators.required],
        aircraftType: ['', Validators.required],
        flight: ['',Validators.required],
        cargo: [''],
        volumey: [''],
        status: [true],
      });
    }
    airLineType: any = []
    getairLineType() {

      let payload = this.commonService.filterList()
      if(payload?.query)payload.query = {
        "status": true,
        "ShipmentTypeName": 'Air',
      }
  
      this._api
        .getSTList('shippingline', payload)
        ?.subscribe((res: any) => { 
        this.airLineType = res?.documents
        });
    }
    onSaveFight(){
      this.submitted2 = true;
      if (this.addFlightForm.invalid) {
        this.notification.create('error', 'Please fill reqired fields', '');
        return;
      }
      let duplicate = 0
      if (duplicate < 1) {
        let newdata ={...this.addFlightForm.value,
          airline: this.airLineType?.filter((x) => x?.shippinglineId == this.addFlightForm.value.airline)[0]?.name || '',
          airlineId : this.addFlightForm.value.airline
        };
  
  
      
          this.commonService.addToST('air', newdata).subscribe(
            (res: any) => {
              if (res) {
                this.notification.create('success', 'Added Successfully', '');
                this.onCancelPOP();
                setTimeout(() => { 
                  this.getAir();
                },1000)
                
              }
            },
          );
         
    }
  }
  submitted2:boolean = false;
    onCancelPOP(){
      this.submitted2 = true;
      this.modalService.dismissAll();

    }

    getCountryList() {
      let payload = this.commonService.filterList()
      payload.query = { status: true }
  
      this.commonService.getSTList('country', payload).subscribe((data) => {
        this.countryList = data.documents;
      });
    }

    countryList:any= []
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
              newdata.tenantId = "1";
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
                    this.getVoyage();
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

}

@Pipe({
  name: 'filter',
})
export class FilterPipe implements PipeTransform {
  transform(value, args?: any) {
    if (value?.length === 0) {
      return value;
    }
    let filteredUsers = [];
    value.forEach(element => {
      element?.voyage?.filter((x) => {
        if (x?.shipping_line === args) {
          filteredUsers.push(element);
        }
      })
    });

    return filteredUsers;
  }




}