import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';


import { CognitoService } from 'src/app/services/cognito.service';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/services/common/common.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
 
@Component({
  selector: 'app-booking-details',
  templateUrl: './booking-details.component.html',
  styleUrls: ['./booking-details.component.scss']
})
export class BookingDetailsComponent implements OnInit {
  isTextField: boolean = false;
  batchId: number = this.route.snapshot.params['id'];
  quotationStatus: string = 'AWAIT_YOUR_REVIEW';

  selectedQuoationCard: string = '1';
  bookingRemarks: string = '';
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
  showCustomerCurr: boolean = false;
  check: boolean = false
  discountPrice: any;
  agentDetails : any ;
  isTransport: boolean;
  constructor(
    public notification: NzNotificationService,
    private _router: Router,
    private route: ActivatedRoute,
    public _cognito: CognitoService,
    private _api: CommonService,
    private _modal: NgbModal,
    private commonService : CommonService,
    public commonFunction : CommonFunctions
  ) {
    // this.userId = this._cognito.getOrganization()?.orgId; 
  }

  fieldToSelect: any = 'itemPrice';

  selectQuote = (value: string) => {
    this.selectedPrice = value;
  };
  

  ngOnInit(): void {
    this.isTransport = localStorage.getItem('isTransport') === 'false' ? false : true
    this.userData = this._cognito.getagentDetails();
    this.batchId = this.route.snapshot.params['id']
  this.getData()
  this.agentDetails = this.commonFunction?.customerAgent()
  }
  getData(){
    let payload = this.commonService.filterList() 
    payload.query = {
      batchId: this.batchId,
    } 
    this._api.getSTList('batch', payload).subscribe((res: any) => { 
      this.userActivities = res.documents[0];
      this.getQuoteDetails(res.documents[0]?.quotationId); 

    }); 
  }
  
  getKeys(): string[] {
    return this.userActivities?.charges ? Object.keys(this.userActivities.charges) : [];
  }
  finalDiscount: any
  activeFrightAir : boolean = false;
  showContainer: boolean = false;
  showPallet: boolean = false;
  typeOfWay:string='';
  getQuoteDetails(id: number) {
    let payload1 = this.commonService.filterList();
    payload1.query = { 
      "quotationId":  id
    }
    this.commonService.getSTList('enquiryitem', payload1)?.subscribe((result) => {
      this.chargeItems = result?.documents;  
      this.quoteData = {
        ... this.userActivities
      }


      let shipment = this.quoteData?.enquiryDetails?.basicDetails?.ShipmentTypeName?.toLowerCase()
      let loadName = this.quoteData?.enquiryDetails?.basicDetails?.loadType?.toLowerCase()
      if(shipment === 'air'){
        this.activeFrightAir=true;
      } 
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
          if (['uld container', 'fcl'].includes(loadName)) {
            this.typeOfWay = "Container"
          } else if (['ftl' ].includes(loadName)) {
            this.typeOfWay = "Truck"
          } else if (['fwl'].includes(loadName)) {
            this.typeOfWay = "Wagon"
          }else{
             this.typeOfWay = "Container"
          }
        }
      } else {
        this.showPallet = false;
        this.showContainer = false;
      }
    })
  }
  returnTotalFinal(){
    var total = 0; 
    this.chargeItems.filter((i: any) => { 
      total += Number(i?.selEstimates?.totalAmount); 
    }); 
    return total;
  }
  
  returnTotal() {
    var total = 0;
    var tax = 0;
    this.chargeItems.filter((i: any) => { 
      total += Number(i?.selEstimates?.taxableAmount); 
    });
    // total = this.quoteData?.priceRanges[this.selectedPrice]?.totalSell || 0
    return total;

  }

  rturnGst() {
    var tax = 0; 
      this.chargeItems.filter((i: any) => { 
        tax += Number(i?.selEstimates?.igst); 
      }); 
    return tax;
  }

  batchCancel(){
    let payload = { ...this.userActivities , statusOfBatch: 'Job Cancelled',remarks: this.bookingRemarks }
    this._api.UpdateToST(`batch/${this.userActivities?.batchId}`, payload).subscribe((res: any) => { 
        if (res) {
          this.notification.create(
            'success',
            'Job Cancelled Successfully',
            ''
          ); 
          this._router.navigate(['/customer/booking/list']);
        } 
    },
      error => {
        this.notification.create(
          'error',
          error?.error?.error?.message,
          ''
        );
      });
  }
  
  getUserOrg(orgId: any) {
    // if (this.userData?.userRoles[0]?.roleType === 'Customer') {
    //   this.isShowGst = !this.userData?.organizations[0]?.isSEZ;
    //   this.isGst = this.userData?.organizations[0]?.isGST;
    //   this.isIgst = !this.userData?.organizations[0]?.gst?.startsWith('09');
    // }
    // else {
      //   this.apiService.getOrgById(orgId).subscribe((res: any) => {
      //     this.userOrgData = res.items[0];
      //     this.isShowGst = !this.userOrgData?.isSEZ;
      //     this.isGst = this.userOrgData?.isGST;
      //     this.isIgst = !this.userOrgData?.gst?.startsWith('09');
      //   });
      // }
    // }
  }
  vesselName :any;
  mmsiNo:any;
  onenMap(content,id){
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
          this._modal.open(content, {
            ariaLabelledBy: 'modal-basic-title',
            backdrop: 'static',
            keyboard: false,
            centered: true,
            size: 'lg',
          });
        }
      })
    
  }
  setBookingRemarks(event) {
    this.bookingRemarks = event?.target?.value;
  }

}