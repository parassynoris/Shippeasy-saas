import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';


import { CognitoService } from 'src/app/services/cognito.service';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/services/common/common.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { ConatinerTrackComponent } from 'src/app/admin/batch/batch-detail/tank/container-track/container-track.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDrawer } from '@angular/material/sidenav';

@Component({
  selector: 'app-booking-tracking',
  templateUrl: './booking-tracking.component.html',
  styleUrls: ['./booking-tracking.component.scss']
})
export class BookingTrackingComponent implements OnInit {
  @ViewChild(MatDrawer) drawer: MatDrawer | any;
  dataSource = new MatTableDataSource();
  dataSource1 = new MatTableDataSource();
  pagenation = [10, 20, 50, 100];
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatSort) sort2!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatPaginator) paginator1!: MatPaginator;
  displayedColumns = [
    '#',
    'vehicleNo',
    'vehicleType',
    'driverName',
    'driverContactNumber',
    'driver1Name',
    'driver1ContactNumber'
  ];
  displayedColumns1 = [
    '#',
    'milestoneEvent',
    'milestoneDate',
    'updateBy',
  ];
  batchDetails: any;
  currentLogin: string;
  getCognitoUserDetail: any;
  addToST() {
    throw new Error('Method not implemented.');
  }
  updateToST() {
    throw new Error('Method not implemented.');
  }
  deleteST() {
    throw new Error('Method not implemented.');
  }
  createNotification() {
    throw new Error('Method not implemented.');
  }
  applyFilter() {
    throw new Error('Method not implemented.');
  }
  refresh() {
    throw new Error('Method not implemented.');
  }
  getagentDetails() {
    throw new Error('Method not implemented.');
  }
  getUserDatails() {
    throw new Error('Method not implemented.');
  }
  @Input('bookingData') bookingData: any;
  isTextField: boolean = false;
  batchId: number = this.route.snapshot.params['id'];
  quotationStatus: string = 'AWAIT_YOUR_REVIEW';

  selectedQuoationCard: string = '1';

  quotationData: any;
  selectedPrice: any = 'preffered';
  userId: number;
  userData: any;
  linkDownload: any;
  comments: any = [];
  quoteData: any;
  locations: any;
  quoteTypes: any = [];
  alladdress: any; 
  allCharges: any = {};
  priceRanges: any = [];
  chargeTypes: any = [];
  typeWiseCount: any = {};
  totalTax: number = 0;
  totalItem: number = 0;
  userActivities: any;
  additionalServices: any = [];
  quoteRemarks: string = '';
  chargeItems: any = [];
  priceToRate: any = {
    preffered: 'itemPrice',
    cheapest: 'itemPrice1',
    fastest: 'itemPrice2',
  };
  findindex: number = 0;
  statuslist: any[] = [];
  operationOptions: any = [];

  commentForm = new FormGroup({
    noteType: new FormControl('', Validators.required),
    noteText: new FormControl('', Validators.required),
  });
  currencyForm = new FormGroup({
    inr: new FormControl(true),
    usd: new FormControl('')
  })
  userOrgData: any;
  isShowGst: boolean = false;
  isGst: boolean = false;
  isIgst: boolean = false;
  showMobilecss: boolean = false;
  check: boolean = false
  discountPrice: any
  containerList: any;
  isDriverPanelOpen: boolean = true;
  isMilestonePanelOpen: boolean = true;
  shipmentStatus = []; 
orientation = "verticle";
vehicleList: any = []
driverList: any = []
canOpenAccordion: boolean = true;
canOpenCustomAccordion: boolean = true;
containerNo
  mmsiNo: any;
  vesselName: any;
  constructor(
    public notification: NzNotificationService,
    private _router: Router,
    private route: ActivatedRoute,
    public _cognito: CognitoService,
    private _api: CommonService,
    private _modal: NgbModal,
    private commonService : CommonService,
    public commonFunctions : CommonFunctions, 
  ) {
    this.currentLogin = this.commonFunctions.getUserType1()
    this._cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.getCognitoUserDetail = resp?.userData
      }
    })
    // this.userId = this._cognito.getOrganization()?.orgId; 
  }

  fieldToSelect: any = 'itemPrice';

  selectQuote = (value: string) => {
    this.selectedPrice = value;
  };
  rate: any = 1
  INR: boolean = true
  USD: boolean = false
  currencyData: any

  

  ngOnInit(): void {
    this.userData = this._cognito?.getagentDetails();
    this.batchId = this.route.snapshot.params['id']
  this.getData()
  this.getContainer()
  this.getevents()
  this.getBatchList()
  this.getDriver()
  this.getVehicle()
  this.getMilstone()
  }
  getMilstone(){ 
    let payload = this.commonService.filterList()
    if(payload)payload.query = {
      'batchId': this.batchId
    }

    this.commonService.getSTList('transportmilestone', payload)
      ?.subscribe((data: any) => { 
        this.dataSource1 = new MatTableDataSource(
          data?.documents?.map((s: any, index) => {
            return {
              ...s,
              id: index + 1
            }
          }));
        this.dataSource1.paginator = this.paginator1;
        this.dataSource1.sort = this.sort2; 
      });
}
  vessellTrack =false
  onenMap( id){
    let vesselId=id;
    let payload = this.commonService.filterList();
    payload.query = {
      vesselId: vesselId
    }
    this._api.getSTList('vessel', payload)?.subscribe(
      (result) => {
        if(result){
         this.mmsiNo= result?.documents?.[0]?.mmsino;
         this.vesselName=result?.documents?.[0]?.vesselName;
         if(!this.mmsiNo){
          this.notification.create('error', 'Tracking Id Not Available, Please Update MMSI In Vessel', '');
          return;
         }
        
         this.vessellTrack =true
        }
      })
    
  }
  toggleAll(isExpand: boolean) {
    this.isDriverPanelOpen = isExpand;
    this.isMilestonePanelOpen = isExpand;
  }
  toggleButton(panel: string) {
    switch (panel) {
      case 'route':
        if (this.canOpenAccordion) {
          this.isDriverPanelOpen = !this.isDriverPanelOpen;
        }
        break;
      case 'customRoute':
        if (this.canOpenCustomAccordion) {
          this.isMilestonePanelOpen = !this.isMilestonePanelOpen;
        }
        break;

     
      default:
        console.error('Unknown panel:', panel);
    }
  }
  vehicleAllow :number=0;
  getBatchList() {

    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "batchId": this.route.snapshot?.params['id']
    }

    this.commonService.getSTList('batch', payload)
      ?.subscribe((data: any) => {
        this.batchDetails = data.documents[0];
        this.vehicleAllow = 0
        this.batchDetails?.enquiryDetails?.containersDetails?.filter((c)=>{
          this.vehicleAllow =+ (c.noOfContainer || 0)
        })
        console.log(this.vehicleAllow)
        this.dataSource = new MatTableDataSource(
          this.batchDetails?.vehicleDetails?.map((s: any, index) => {
            return {
              ...s,
              id: index + 1
            }
          })
        );
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1;
        this.getVehicle()
        this.getDriver()
      });
  }
  getVehicle() {
    let payload = this.commonService.filterList();
    if(payload?.query)payload.query = {
      status: true
    }
    if (this.currentLogin === 'transporter') {
      payload.query = {
        ...payload.query,
        typeCarrierId: this.getCognitoUserDetail?.driverId
      }
    }else{
      if(payload?.query)payload.query = {
        ...payload.query,
        typeCarrierId: this.batchDetails?.quotationDetails?.carrierId
      }
    }
    this.commonService.getSTList('land', payload)?.subscribe((res: any) => {
      this.vehicleList = res.documents;
    })
  }
  getDriver() {
    let payload = this.commonService.filterList();
    if(payload?.query)payload.query = {
      status: true
    }
    if (this.currentLogin === 'transporter') {
      payload.query = {
        ...payload.query,
        carrierId: this.getCognitoUserDetail?.driverId
      }
    }else{
      if(payload?.query)payload.query = {
        ...payload.query,
        carrierId: this.batchDetails?.quotationDetails?.carrierId
      }
    }
    this.commonService.getSTList('driver', payload)?.subscribe((res: any) => {
      this.driverList = res.documents;
    })
  }

  getData(){
    let payload = this.commonService.filterList()

    if(payload?.query)payload.query = {
      batchId: this.batchId,
    }

    this._api.getSTList('batch', payload)?.subscribe((res: any) => { 
      this.userActivities = res.documents[0];  
      this.quoteData = {
        ... this.userActivities
      }
      
    }); 
  }

  getContainer(){
    let payload = this.commonService.filterList()
    if(payload?.query) payload.query = {
      batchId:  this.batchId
    } 
    this._api.getSTList('container', payload)?.subscribe((data: any) => {
      this.containerList = data?.documents
      })
  } 

  getevents() {
   
    let payload: any = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "entityId": this.batchId
    };
    if(payload?.sort)payload.sort = {
      "asc": ['eventSeq'],
    };
    this.commonService.getSTList('event', payload)?.subscribe((data: any) => {
      this.shipmentStatus = data.documents; 
      }); 
  }
  openPopup(containerNumber) {
    this.containerNo=containerNumber
    // const modalRef = this._modal.open(ConatinerTrackComponent, {
    //   backdrop: 'static',
    //   keyboard: false,
    //   centered: true,
    //   size: 'xl'
    // });
    // modalRef.componentInstance.containerNo = containerNumber;
    // modalRef.componentInstance.batchDetail = this.batchDetail
  }
}
