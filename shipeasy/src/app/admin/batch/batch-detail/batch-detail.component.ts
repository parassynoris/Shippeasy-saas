import { Component, Input, OnInit, Output, Pipe, PipeTransform, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { batch } from '../data';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import * as Constant from 'src/app/shared/common-constants';
import { ApiService } from '../../principal/api.service';
import { BaseBody } from '../../smartagent/base-body';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService as CommonServices } from 'src/app/services/common/common.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { ApiSharedService } from 'src/app/shared/components/api-service/api-shared.service';
import { environment } from 'src/environments/environment';
import { TouchSequence } from 'selenium-webdriver';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { CognitoService } from 'src/app/services/cognito.service';
import { Enquiry, EnquiryItem } from 'src/app/models/enquiry';
import { PartyMasterData } from 'src/app/models/party-master';
import { Currency } from 'src/app/models/cost-items';
import { Product } from 'src/app/models/addproduct';
import { SystemType } from 'src/app/models/system-type';
import { ShippingLine } from 'src/app/models/shipping-line';
import { User } from 'src/app/models/userprofile';
import { Vessel } from 'src/app/models/vessel-master';
import { MyData } from 'src/app/models/Vessel-voyage';
import { LocationData } from 'src/app/models/city-master';
import { AgentAdvice } from 'src/app/models/agent-advise';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MessagingService } from 'src/app/services/messaging.service';
import { MatDialog } from '@angular/material/dialog';
import { CommonDialogBoxComponent } from 'src/app/shared/components/common-dialog-box/common-dialog-box.component';
import { SharedEventService } from 'src/app/shared/services/shared-event.service';
@Component({
  selector: 'app-batch-detail',
  templateUrl: './batch-detail.component.html',

  styleUrls: ['./batch-detail.component.scss'],
})
export class BatchDetailsComponent implements OnInit {
  dataSource = new MatTableDataSource();
  disabledDate = (current: Date): boolean => {
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);  // Reset time to 00:00:00
    // Disable all dates before today
    return current && current.getTime() < today.getTime();
  };
  disabledTime = (current: Date): { nzDisabledHours: () => number[], nzDisabledMinutes: () => number[] } => {
    const now = new Date();
    if (current && current.toDateString() === now.toDateString()) {
      return {
        nzDisabledHours: () => Array.from({ length: now.getHours() }, (_, i) => i),
        nzDisabledMinutes: () => Array.from({ length: now.getMinutes() }, (_, i) => i),
        // nzDisabledSeconds: () => Array.from({ length: now.getSeconds() }, (_, i) => i),
      };
    }
    return {
      nzDisabledHours: () => [],
      nzDisabledMinutes: () => [],
      // nzDisabledSeconds: () => [],
    };
  };
  displayedColumns = [
    '#',
    'reminderType',
    'createdOn',
    'reminderTime',
    'description',
    'isActive',
    'status',
  ];
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @Output() mmsiNo;
  @Output() vesselName;
  displayedColumns1 = this.displayedColumns.map((x, i) => x + '_' + i);
  filterBody = this.apiService.body;
  tabs: any;
  show: boolean = false;
  urlParam: any;
  quertParams: any;
  holdControl: any;
  addBatchForm: FormGroup;
  batchDetail: any;
  cargoTypeList: SystemType[] = [];
  submitted: boolean = false;
  isExpand: boolean = false;
  holdBatchType: string = 'export';
  baseBody: any;
  enquiryList: any = [];
  EnquiryId: any;
  enquiryDetails: any = [];
  id: any;
  isAddMode: any;
  shipperList: PartyMasterData[] = [];
  currencyList: Currency[] = [];
  productList: Product[] = [];
  consigneeList: any = [];
  tanktypeList: SystemType[] = [];
  shippingLineList: ShippingLine[] = [];
  userList: any[] = [];
  bookingTypeList: SystemType[] = [];
  vesselList: Vessel[] = [];
  voyageList: MyData[] = [];
  partymasterList: PartyMasterData[] = [];
  invoicingpartyList: PartyMasterData[] = [];
  bookingpartyList: PartyMasterData[] = [];
  movetypeList: SystemType[] = [];
  siDoc: File;
  bookingDoc: File;
  batchNumber: any;
  moveNo: any;
  bookingDate: any;
  bookingUpload: File | null = null;
  siUpload: File | null = null;
  freightTerms: EnquiryItem[] = [];
  costItemList: EnquiryItem[];
  toggleFilters = true;
  isExportImport: any;
  customerList: SystemType[] = [];
  locationList: LocationData[] = [];
  shippingtermList: SystemType[] = [];
  incotermList: SystemType[];
  enquirytypeList: any = []
  batchMasterList: SystemType[];
  currentUrl: any;
  forwarderChaList: PartyMasterData[] = [];
  isFieldChange: any;
  isExport: boolean;
  agentDataList: AgentAdvice[] = [];
  uniqueRefNo: any;
  onCarrigeList: any;
  containerTypeList: any;
  finalVoyageList: any = [];
  backVoyageList: any = [];
  planVoyageList: any = [];
  planVesselList: any = [];
  wareDate: any = [];
  toalLength: number;
  backupVesselList: Vessel[] = [];
  tenantId: any;
  userdetails: any;
  closeResult: string;
  filterKeys = {};
  filtersModel = [];
  todayDate = new Date()
  reminderData: any
  reminderForm: FormGroup= new FormGroup({
    isActive: new FormControl(true),
    status: new FormControl(false),
    reminderType: new FormControl('', [Validators.required]),
    reminderTime: new FormControl('', [Validators.required]),
    customDate: new FormControl(''),
    userList: new FormControl([]),
    description: new FormControl('', [Validators.required]) // changed 'Description' to 'description'
  }); ;
  submitted1: boolean = false;
  isTransport: boolean = false;
  isImport: boolean = false;
  currentLogin: any = '';
  accesslevels: any;
  biddingList: any;
  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private sharedEventService: SharedEventService,
    public commonService: CommonServices,
    private _api: ApiService,
    public apiService: ApiSharedService,
    private sortPipe: OrderByPipe,
    private modalService: NgbModal,
    private cognito: CognitoService,
    private notification: NzNotificationService,
    private formBuilder : FormBuilder,
    private commonFunction: CommonFunctions,
    private messagingService: MessagingService,
    private dialog: MatDialog
  ) {
    // this.getVoyageListDropDown();
    this.isExport = localStorage.getItem('isExport') === 'true' ? true : false
    this.isTransport = localStorage.getItem('isTransport') === 'true' ? true : false;
    this.isImport = localStorage.getItem('isImport') === 'true' ? true : false;
    this.id = this.route.snapshot.params['id'];
    this.isAddMode = !this.id;
    this.route.params?.subscribe((params) => (this.urlParam = params));
    this.route.queryParams?.subscribe((params) => (this.quertParams = params));

    this.holdControl = this.urlParam.key;
    this.currentLogin = this.commonFunction.getUserType1()
    this.cognito?.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.accesslevels = resp?.accesslevel

      }
    })

    this.addBatchForm = this.formBuilder.group({
        isActive: [true],
        status: [false],
        reminderType: ['', [Validators.required]],
        reminderTime: ['', [Validators.required]],
        customDate: [''],
        description: ['', [Validators.required]] // changed 'Description' to 'description'

    })
    this.getMilestone()
  }
  getReminderData() {
    let payload = this.commonService.filterList()
    if (payload?.sort) payload.sort = {
      "desc": ["updatedOn"]
    }
    payload.query = {
      "batchId": this.id,
    }
    this.commonService.getSTList('reminder', payload)?.subscribe((res: any) => {
      this.reminderList = res?.documents;
      if (res && res.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          reminderType: s?.reminderType,
          reminderTime: s?.reminderTime,
          description: s?.description,
          isActive: s?.isActive,
          status: s?.reminderStatus ==='Pending' ? false :true,

        }));
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1;
      }
      this.wareDate = res.documents;
      this.toalLength = res.totalCount;
      this.count = res.documents.length;
    });
  }
  dropdownSettings:any ={

  };

  milestoneList:any=[]
  getMilestone() {
    let payload: any = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "entityId": this.id,
      isUpdated : true,
      "eventData.eventState" : "ActualDate"
    };
    if(payload?.sort)payload.sort = {
      "asc": ['eventSeq'],
    };
    this.commonService.getSTList('event', payload)?.subscribe((data: any) => {
      this.milestoneList = data.documents;
    } );

  }
  getUserData() {
    this.dropdownSettings = {
      idField: 'item_id',
      textField: 'item_text',
    };
    let payload = this.commonService.filterList()
    if (payload?.sort) payload.sort = {
      "desc": ["updatedOn"]
    }
    this.commonService.getSTList('user', payload)?.subscribe((res: any) => {
      this.userList = res?.documents;
      this.userList = this.userList.map((i) => {
        return {item_id:i?.userId, item_text:i?.userName}
      })
    });
  }

  // navigateToNewTab(element) {
  //   let url = element?.enquiryDetails?.enquiryStatus == 'Pending' ? '/enquiry/list/' + element?.enquiryDetails?.enquiryId + '/edit' : '/enquiry/list/' + element?.enquiryDetails?.enquiryId + '/quote'
  //   this.router.navigate([url]);
  // }
  navigateToNewTab2(element) {
    let url = element?.enquiryDetails?.enquiryStatus == 'Pending' ? '/enquiry/list/' + element?.enquiryDetails?.enquiryId + '/edit' : '/enquiry/list/' + element?.enquiryDetails?.enquiryId + '/quote'
    window.open(url);
  }
  searchColumns() {
    this.filterKeys = {};
    this.filtersModel.forEach((each, ind) => {
      if (each)
        this.filterKeys[this.displayedColumns[ind]] = {
          "$regex": each?.toLowerCase(),
          "$options": "i"
        }
    });
    let payload = this.commonService.filterList()
    payload.query = this.filterKeys
    payload.sort = {
      "desc": ["updatedOn"]
    }
    this.commonService.getSTList("reminder", payload)?.subscribe((data) => {
      this.reminderData = data.documents;
      this.dataSource = new MatTableDataSource(
        data?.documents?.map((s: any) => s)
      );
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort1;

    });


  }

  onenMap(content) {
    let vesselId = this.batchDetail?.quotationDetails?.vesselId;
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

  navigateToNewTab1(element) {
    let url = (element?.enquiryStatus == 'Pending'|| element?.enquiryStatus == 'Inquiry Draft') ? element?.enquiryId + '/edit' : element?.enquiryId + '/quote'
    window.open(window.location.href + '/' + url);
  }

  sort(array, key) {
    return this.sortPipe.transform(array, key);
  }
  chargeData: any = []
  getCharges(res) {
    let payload = this.commonService.filterList()
    payload.query = {
      "quotationId": res?.quotationId,
    }
    this.commonService.getSTList('enquiryitem', payload)?.subscribe((result) => {
      this.chargeData = result?.documents
      if (this.chargeData.length > 0) {
        this.financeStatus = this.chargeData.every(x => x.selEstimates?.sellerInvoice == true)
      }
    });
  }
  invoiceList: any = []
  financeStatus: boolean = false;
  invoicePaymetStatus: boolean = false
  creditStatus: boolean = false
  editBatchToggel: boolean = false
  getInvoice(res) {
    let payload = this.commonService.filterList()
    payload.query = {
      "batchId": res?.batchId,
      type: "sellerInvoice"
    }

    this.commonService.getSTList('invoice', payload)?.subscribe((result) => {
      this.invoiceList = result?.documents
      if (this.invoiceList.length > 0) {
        this.invoicePaymetStatus = this.invoiceList.every(payment => payment?.paymentStatus == 'Paid')
        this.creditStatus = this.invoiceList.every(payment => payment?.creditNote)
      }
    });
  }
  onTab(data) {
    if (this.quertParams?.isshow) {
      this.router.navigate([
        '/batch/list/show/' + this.urlParam.id + '/' + data.key,
      ], { queryParams: { isshow: "true" } });
    } else {
      this.router.navigate([
        '/batch/list/add/' + this.urlParam.id + '/' + data.key,
      ]);
    }
    this.holdControl = data.key;

  }
  get f() {
    return this.addBatchForm.controls;
  }

  get f1() {
    return this.reminderForm.controls;
  }
  blMasterStatus:any= []
  getSystemTypeDropDowns() {
    let payload = this.commonService.filterList()

    if (payload) payload.query = {
      status: true,
      "typeCategory": {
        "$in": [
          "blStatus"
        ]
      }
    }

    this.commonService.getSTList("systemtype", payload)?.subscribe((res: any) => {
      this.blMasterStatus = res?.documents?.filter(x => x.typeCategory === "blStatus");


    });
  }

  getUpdateBatch() {
    this.messagingService?.getUpdatedBatchData()?.subscribe((res: any) => {
      console.log('getUpdatedBatchData', res)

      if(res.updatedByUID != this.commonFunction.getAgentDetails()?.userId && res?.resourceId == this.route.snapshot.params['id']){
      const modalRef = this.modalService.open(CommonDialogBoxComponent, {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        centered: true,
        size: 'md',
      });

      modalRef.componentInstance.data = res;
      modalRef.componentInstance.getList.subscribe((res: any) => {
        window.location.reload()
      })
    }

    })
  }
  ngOnInit(): void {
    this.sharedEventService.chargeSaved$.subscribe(() => {
      this.getBatchById();
      this.getMilestone();
    });
    this.getUpdateBatch()
    this.getSystemTypeDropDowns()
    this.getRemiders()

    if (this.isExport)
      this.tabs = batch.masterTabs.filter((x) => x?.key !== 'bill-entry' )
    if (this.isImport)
      this.tabs = batch.masterTabs.filter((x) => x?.key !== 'shipping-instruction' && x?.key !== 'destination' && x?.key !== 'shipping-bill')
    if (this.currentLogin === 'transporter')
      this.tabs = batch.masterTabs1


    this.currentUrl = this.router.url.split('?')[0].split('/').slice(-3)[0]

    this.getblData()
    if (!this.isAddMode) {
      this.getBatchById();
    }
  }

  activeFrightAir: boolean = false;
  showContainer: boolean = false;
  showPallet: boolean = false;
  typeOfWay: string = '';
  shipment: string = '';
  originRouteList: any = []
  destinationRouteList: any = []

  blData: any;
  blDataList:any = []
  getblData() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      // "batchId": this.route.snapshot.params['id'],

      $or: [
        {
          batchId: this.route.snapshot.params['id'],
        },
        {
          "consolidatedJobs.batchId": this.route.snapshot.params['id']
        }
      ]

      // blType: 'MBL'
    }
    this._api.getSTList(Constant.BL_LIST, payload)
      ?.subscribe((data: any) => {
        this.blDataList = data?.documents || []
        this.blData = data?.documents[0];
        this.isMBLCreated = data?.documents?.some(item => item.blType === 'MBL')
        this.isHBLCreated = data?.documents?.some(item => item.blType === 'HBL')

      });
  }
  isHBLCreated : boolean = false
  isMBLCreated: boolean = false
  getBatchById() {

    let payload = this.commonService.filterList()
    payload.query = {
      batchId: this.route.snapshot.params['id'],
    }
    this._api
      .getSTList(Constant.BATCH, payload)
      ?.subscribe(async (res: any) => {
        this.batchDetail = res?.documents[0];

        this.shipment = this.batchDetail?.enquiryDetails?.basicDetails?.ShipmentTypeName?.toLowerCase()
        let loadName = this.batchDetail?.enquiryDetails?.basicDetails?.loadType?.toLowerCase()
        if (this.shipment === 'air') {
          this.activeFrightAir = true;
        }
        if (this.batchDetail?.enquiryDetails?.transportDetails?.origin?.length > 0) {
          if (this.shipment === 'air' || this.shipment === 'ocean') {
            this.originRouteList = this.batchDetail?.enquiryDetails?.transportDetails?.origin?.filter((x, i) => i + 1 !== this.batchDetail?.enquiryDetails?.transportDetails?.origin?.length);
          } else {
            this.originRouteList = this.batchDetail?.enquiryDetails?.transportDetails?.origin
          }
        }

        if (this.batchDetail?.enquiryDetails?.transportDetails?.destination?.length > 0) {
          this.destinationRouteList = this.batchDetail?.enquiryDetails?.transportDetails?.destination
        }

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
            if (['uld container', 'fcl'].includes(loadName)) {
              this.typeOfWay = "Container"
            } else if (['ftl'].includes(loadName)) {
              this.typeOfWay = "Truck"
            } else if (['fwl'].includes(loadName)) {
              this.typeOfWay = "Wagon"
            } else {
              this.typeOfWay = "Container"
            }
          }
        } else {
          this.showPallet = false;
          this.showContainer = false;
        }

        if ((['loose', 'lcl'].includes(loadName)) && (this.isExport || this.isTransport)) {
          this.tabs = batch.masterTabs
        }
        if (this.isExport || this.isTransport) {
          // && x?.key !== 'cfs-email'
          this.tabs = batch.masterTabs.filter((x) => x?.key !== 'bill-entry' );
          if (!['loose', 'lcl'].includes(loadName)) {
            this.tabs = this.tabs.filter((x) => x?.key !== 'grn');
          }
          if (loadName !== 'uld container' && loadName !== 'fcl') {
            this.tabs = this.tabs.filter((x) => x?.key !== 'shipping-instruction');
          }
        }
        if (this.isImport) {
          this.tabs = batch.masterTabs.filter((x) => x?.key !== 'shipping-instruction' && x?.key !== 'destination' && x?.key !== 'shipping-bill' )
          if (!['loose', 'lcl'].includes(loadName)) {
            this.tabs = this.tabs.filter((x) => x?.key !== 'grn');
          }
          if (loadName === 'loose') {
            this.tabs = this.tabs.filter((x) => x?.key !== 'Container');
          }
        }
        if (this.isTransport) {
          this.tabs = this.tabs.filter((x) => x?.key !== 'shipping-instruction' && x?.key !== 'Container' && x?.key !== 'bl' &&
            x?.key !== 'shipping-bill' && x?.key !== 'custom' && x?.key !== 'cfs-email');
          this.tabs.splice(4, 0, ...batch.masterTabs1);
        }
        if (this.currentLogin === 'transporter') {
          this.tabs = batch.masterTabs0
        }
        const selectTYPE = localStorage.getItem('isImport') === 'true' ? 'Import' :
        localStorage.getItem('isTransport') === 'true' ? 'Transport' :
          'Export';
        let mainfeatureList = []
        this.tabs.forEach((element) => {
          if (element?.featureCode == '') {
            mainfeatureList?.push(element)
          } else {
            if (this.accesslevels?.filter(accesslevel => [element?.featureCode]?.some(i => i === accesslevel?.featureCode)).length > 0
            && this.accesslevels?.filter(accesslevel => [element?.featureCode].some(j => j === accesslevel?.featureCode))[0]?.accesslevel?.includes('add')
            && this.accesslevels?.filter(accesslevel => [element?.featureCode].some(j => j === accesslevel?.featureCode))[0]?.menuAccess?.includes(selectTYPE?.toLocaleLowerCase())) {
              mainfeatureList?.push(element)
            }
          }

        })




        this.tabs = mainfeatureList

        if(!this.batchDetail?.isGRNRequired){
          this.tabs = this.tabs.filter((x)=> x.name != 'GRN')
        }


        this.currentUrl = this.router.url.split('?')[0].split('/').slice(-3)[0]
        this.getCharges(this.batchDetail)
        this.getInvoice(this.batchDetail)
        if (this.currentLogin === 'transporter') {
          if (this.batchDetail?.transportinquiryId)
            this.getBidding(this.batchDetail?.transportinquiryId)
        }
      });
  }
  getBidding(transportinquiryId) {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      "transportinquiryId": transportinquiryId
    }

    this.commonService.getSTList('transportinquiry', payload)?.subscribe((data) => {
      this.biddingList = data.documents[0];
    });
  }

  totalGrossWeight(arr?: any) {
    let total = 0
    if (arr) {
      arr?.filter((x) => {
        total += Number(x?.grossWeightContainer || 0)
      })
    }


    return total
  }
  next() {
    if (this.toalLength > this.count) {
      this.getPaginationData('next');
    }
  }
  fromSize: number = 1;
  size = 10;
  page = 1;
  count = 0;
  reminderType1: string;
  reminderTime: string;
  description: string;
  isActive: string;
  status: string;
  getPaginationData(type: any) {
    this.fromSize =
      type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;

    let payload = this.commonService.filterList()
    payload.size = Number(this.size),
      payload.from = this.fromSize - 1,
      payload.sort = { "desc": ['updatedOn'] }
    let mustArray = {};

    this.reminderType1 = this.reminderType1?.trim();
    this.reminderTime = this.reminderTime?.trim();;
    this.description = this.description?.trim();;
    this.isActive = this.isActive?.trim();;
    this.status = this.status?.trim();;



    if (this.reminderType1) {
      mustArray['reminderType'] = {
        "$regex": this.reminderType1,
        "$options": "i"
      }
    }
    if (this.reminderTime) {
      mustArray['reminderTime'] = {
        "$regex": this.reminderTime,
        "$options": "i"
      }
    }
    if (this.description) {
      mustArray['description'] = {
        "$regex": this.description,
        "$options": "i"
      }
    }
    if (this.isActive) {
      mustArray['isActive'] = {
        "$regex": this.isActive,
        "$options": "i"
      }
    }

    if (this.status) {
      mustArray['status'] = {
        "$regex": this.status,
        "$options": "i"
      }
    }

    payload.query = mustArray;
    this.commonService.getSTList('reminder', payload)?.subscribe((data: any) => {
      this.reminderList = data?.documents;
      this.toalLength = data.totalCount;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count =
        type === 'prev'
          ? this.toalLength === this.count
            ? this.count - ((this.toalLength % Number(this.size)) > 0 ? (this.toalLength % Number(this.size)) : (Number(this.size)))
            : this.count - data.documents.length
          : this.count + data.documents.length;
    });
  }

  prev() {
    if (this.page > 0) {
      this.getPaginationData('prev');
    }
  }
  changeStatus(data) {
    this.commonService
      .UpdateToST(`reminder/${data.reminderId}`, { status: !data?.status, reminderStatus: !data?.status ? 'Completed' : 'Pending' })
      ?.subscribe(
        (res: any) => {
          if (res) {
            this.notification.create(
              'success',
              'Status Updated Successfully',
              ''
            );
            setTimeout(() => {
              this.getReminderData()
            }, 2000);

          }
        },
        (error) => {
          // this.save();
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
  }
  updateBatchStatus() {
    this.getMilestone()
    this.getBatchById();
    return
    const payload = {
      batchId: this.batchDetail?.batchId,
      statusOfBatch: event
    };
    this._api.UpdateToST(`${Constant.UPDATE_BATCH}/${this.batchDetail?.batchId}`, payload)?.subscribe((res) => {
      if (res) {
        this.notification.create('success', 'Update Job Status', '');
        this.batchDetail.statusOfBatch = event;
      } else {
        this.notification.create('error', 'Error while updating Job Status', '');
      }
    })
  }

  getDaysDifference(availableDate: Date): number {
    // Convert both dates to milliseconds
    const currentDateMs = new Date().getTime();
    const availableDateMs = new Date(availableDate).getTime();

    // Calculate the difference in milliseconds
    const differenceMs = availableDateMs - currentDateMs;

    // Convert the difference from milliseconds to days
    const differenceDays = Math.ceil(differenceMs / (1000 * 60 * 60 * 24));

    return differenceDays;
  }

  reminderList = []
  reminderIconJob = ''
  reminderIconcargo = ''
  reminderIconcredit = ''
  reminderIconfinance = ''
  reminderIconmbl = ''
  reminderIconhbl = ''

  getRemiders() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      batchId: this.route.snapshot.params['id'],
    }
    this._api
      .getSTList('reminder', payload)
      ?.subscribe((res: any) => {
        this.reminderList = res?.documents;
        this.reminderList.filter((x) => {
          if (x?.reminderType == 'Job') {
            this.reminderIconJob = x?.reminderStatus || ''
          }
          if (x?.reminderType == 'Cargo') {
            this.reminderIconcargo = x?.reminderStatus || ''
          }
          if (x?.reminderType == 'MBL') {
            this.reminderIconmbl = x?.reminderStatus || ''
          }
          if (x?.reminderType == 'HBL') {
            this.reminderIconhbl = x?.reminderStatus || ''
          }
          if (x?.reminderType == 'Finance') {
            this.reminderIconfinance = x?.reminderStatus || ''
          }
          if (x?.reminderType == 'Credit') {
            this.reminderIconcredit = x?.reminderStatus || ''
          }
        })

      });
  }

  reminderType: any = ''
  editReminder: any;
  openDialog(reminder, key) {
    this.reminderType = ''
    this.reminderType = key;

    this.editReminder = this.reminderList.find((x) => x?.reminderType == key)
    if (this.editReminder) {
      this.reminderForm.patchValue({
        reminderTime: this.editReminder?.reminderTime || '',
        description: this.editReminder?.description || '',
        isActive: this.editReminder?.reminderStatus == 'Pending' ? false : true,
        status: this.editReminder?.status == 'Pending' ? false : true,
        userList: this.editReminder?.userListb|| [],
        customDate: this.editReminder?.customDate || ''
      })
    }

    this.modalService.open(reminder, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'xl',
    });
  }
  onDelete(deletedata, reminder) {
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
            let data = `reminder/${reminder?.reminderId}`
            this.commonService.deleteST(data)?.subscribe((res: any) => {
              if (res) {
                this.notification.create('success', 'Deleted Successfully', '');
                setTimeout(() => {
                  this.getReminderData()
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
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
  openDialog1(reminder1) {
    // this.reminderForm.patchValue({
    //   reminderTime: this.editReminder?.reminderTime || '',
    //   description: this.editReminder?.description || '',
    //   reminderType:this.editReminder?.reminderType || '',
    //   isActive : this.editReminder?.reminderStatus == 'Pending' ? false : true
    // })

    this.modalService.open(reminder1, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
    this.getUserData();
    this.getReminderData()
  }
  applyFilter1(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue?.toLowerCase();


    this.dataSource.filterPredicate = (data, filter) => {
      return JSON.stringify(data)?.toLowerCase().includes(filter);
    };

    this.dataSource.filter = filterValue;
  }
  cancel() {
    this.modalService.dismissAll();
    this.reminderForm.reset()
  }
  setValidatore() {
    if (this.reminderForm.value.reminderTime === 'Custom Date') {
      this.reminderForm.controls['customDate'].setValidators(Validators.required)
      this.reminderForm.controls['customDate'].updateValueAndValidity()
    }
    else {
      this.reminderForm.controls['customDate'].clearValidators()
      this.reminderForm.controls['customDate'].updateValueAndValidity()
    }
  }
  save(isAll?) {
    this.submitted1 = true;
    if (this.reminderForm.invalid) {
      this.notification?.create('error', 'Invalid form', '');
      return
    }

    let payload = {
      reminderId: this.editReminder?.reminderId || '',
      reminderType: this.reminderForm.get('reminderType').value,
      userId: this.commonFunction.getAgentDetails().userId,
      batchId: this.batchDetail?.batchId,
      batchNo: this.batchDetail?.batchNo,
      customDate: this.reminderForm.get('customDate').value,
      description: this.reminderForm.get('description').value,
      reminderTime: this.reminderForm.get('reminderTime').value,
      userList: this.reminderForm?.get('userList')?.value|| [],
      isSent: this.editReminder?.isRepeat || false,
      reminderStatus: 'Pending',
      isRepeat: this.editReminder?.isRepeat || false,
      status:this.editReminder?.reminderId ? this?.editReminder?.status : false
    }


    if (this.editReminder?.reminderId) {
      this.commonService.UpdateToST(`reminder/${this.editReminder?.reminderId}`, payload)?.subscribe(
        (res: any) => {
          if (res) {
            this.submitted1 = false;
            this.notification.create(
              'success',
              'Update Successfully',
              ''
            );
            this.submitted1 = false
            this.reminderForm.reset()
            this.getRemiders()
            this.getReminderData()
          }
        },
        (error) => {
          this.notification.create('error', error?.error?.error?.message, '');
          this.getRemiders()
          this.getReminderData()
        }
      );
    } else {
      this.commonService.addToST('reminder', payload)?.subscribe(
        (res: any) => {
          if (res) {
            this.notification.create(
              'success',
              'Save Successfully',
              ''
            );
            this.submitted1 = false
            this.getRemiders()
            this.getReminderData()
            this.reminderForm.reset()
          }
        },
        (error) => {
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
    }
  }
  // navigateToNewTab4(element) {
  //   let url = element?.enquiryStatus == 'Pending' ? '/agent-advice/list/' + element?.agentadviceId + '/edit' : '/agent-advice/list/' + element?.agentadviceId + '/quote'
  //   this.router.navigate([url]);
  // }

  navigateToNewTab3(element) {
    let url = element?.enquiryStatus == 'Pending' ? '/agent-advice/list/' + element?.agentadviceId + '/edit' : '/agent-advice/list/' + element?.agentadviceId + '/quote'
    window.open(url);
  }
  mblDate: any;
  mblEventStatus: any = ''
  addMBL(content, status) {
    this.mblEventStatus = status
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'md',
    });
  }
  saveMBL() {

    let data: any = {}
    let status: any = ''
    if (this.mblEventStatus === 'SI Filed') {
      status = 'SI Filed'
      data = {
        siFiledDate: this.mblDate
      }
    } else if (this.mblEventStatus === 'First Draft Received') {
      status = 'First Draft Received'
      data = {
        firstDraftReceivedDate: this.mblDate
      }
    } else if (this.mblEventStatus === 'First Draft Approved') {
      status = 'First Draft Approved'
      data = {
        firstDraftApprovedDate: this.mblDate
      }
    } else if (this.mblEventStatus === 'BL Audited') {
      status = 'BL Audited'
      data = {
        blAuditedDate: this.mblDate
      }
    } else {
      status = 'Release MBL'
      data = {
        blReleaseDate: this.mblDate
      }
    }

    this.commonService.UpdateToST(`bl/${this.blData?.blId}`, { ...this.blData, ...data, statusOfBl: status })?.subscribe(
      (res: any) => {
        if (res) {
          this.mblDate = null
          this.notification.create(
            'success',
            'Save Successfully',
            ''
          );
          this.modalService.dismissAll();
          // this.getblData()
        }
      },
      (error) => {
        this.modalService.dismissAll();
        this.notification.create('error', error?.error?.error?.message, '');
      }
    );
  }
  checkblShow() {
    if (this.blData?.siFiledDate || this.blData?.firstDraftReceivedDate ||this.blData?.firstDraftApprovedDate ||this.blData?.blAuditedDate ||this.blData?.blReleaseDate) {
      return false
    } else {
      return true
    }
  }
  updateBatchData(type, res) {
    let payload;
    let updateBatch = []
    if (type === 'HBL') {
      payload = {
        ...this.batchDetail,
        HBLStatus: res
      };

      this.blDataList.filter((element) => {
        if (element?.blTypeName == 'HBL' || element?.blTypeName =='HAWB') {
          updateBatch.push({...element,HBLStatus: res})
        }
      })
    }
    if (type === 'MBL') {
      payload = {
        ...this.batchDetail,
        MBLStatus: res
      };

      this.blDataList.filter((element) => {
        if (element?.blTypeName == 'MBL' || element?.blTypeName =='AWB') {
          updateBatch.push({...element,MBLStatus: res})
        }
      })
    }






    this.commonService.UpdateToST(`batch/${this.id}`, payload).subscribe(() => {
        if (type === 'HBL') {
          this.batchDetail.HBLStatus = res;
        }
        if (type === 'MBL') {
          this.batchDetail.MBLStatus = res;
        }

        if(updateBatch.length >0){
          this.commonService.batchUpdate('bl/batchupdate', updateBatch)?.subscribe()
        }
      },
      (error) => {
        console.error('Error updating batch data:', error);
      }
    );
  }
  updateToggle($event){
    this.batchDetail = $event;
    this.editBatchToggel = false;

  }

  bookingConfirmation() {
    const url = `send-booking-confirmation/${this.id}`;
    this.commonService.bookingConfirm(url).subscribe(
      (res: any) => {
        console.log(res);
        if (res) {
          this.notification.create('success', 'Booking Confirmation Successfully', '');

          // Call both functions immediately
          this.getBatchById();
          this.getMilestone();
        }
      },
      error => {
        this.notification.create(
          'error',
          error?.error?.error?.message,
          ''
        );
      }
    );
  }

}


@Pipe({
  name: 'filter',
})
export class FilterPipe implements PipeTransform {
  transform(value, args?: any) {
    if (value.length === 0 || args === '') {
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

