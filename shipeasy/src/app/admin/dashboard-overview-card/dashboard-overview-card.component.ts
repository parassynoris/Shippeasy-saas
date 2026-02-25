import { Component, Input, OnInit } from '@angular/core';
import {  Router } from '@angular/router';
import { CognitoService } from 'src/app/services/cognito.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';    
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { CommonService } from 'src/app/services/common/common.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { PayModalComponent } from './pay-modal/pay-modal.component';
import { GoogleAnalyticsService } from 'src/app/services/google-analytics.service';


@Component({
  selector: 'app-dashboard-overview-card',
  templateUrl: './dashboard-overview-card.component.html',
  styleUrls: ['./dashboard-overview-card.component.scss'],
})
export class DashboardOverviewCardComponent implements OnInit {
  statuslist: any[] = [];
  progress: any;
  loggedInInfo: any;
  panNumber: any;
  preffered:boolean = false
  costSensitive:boolean=false
  timeSensitive:boolean = false
  vesselName: any;
  mmsiNo: any;
  constructor(
    public commonFunctions : CommonFunctions,
    public _cognito: CognitoService,
    private _modal: NgbModal,
    private router: Router,
    private _api: CommonService,  
    public notification: NzNotificationService,
    private googleAnalyticsService: GoogleAnalyticsService,
  ) {}
  @Input('Data') Data: any;
  @Input('type') type: any;
  @Input('isGetInformation') isGetInformation: any; 
  sailonbooking: any;
  paylater: any;
  dayslater: any;
  counter: number = 0;
  doNumber:any;
  ngOnInit(): void {
    
    this.progress = this.Data;

    if(this.type == "quotation"){
      if(this.Data.quoteRate?.preffered?.price != 0){
        this.preffered = true
      }
      else if(this.Data.quoteRate?.cheapest?.price != 0){
        this.costSensitive = true

      }
      else if(this.Data.quoteRate?.fastest?.price != 0){
        this.timeSensitive = true
      }
    }
  
  } 

  onenMap(content,id){
    let vesselId=id;
    let payload = this._api.filterList();
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
  onPay(invoices) {

    let data = invoices 

    if (true) {
      this.router.navigate(['payment-confirmation'], {
        state: {
          invoiceId: data?.invoiceId,
          bookingId: data?.batchId,
          tds: false,
          amount: data?.invoiceAmount,
          data: data,
        },
      });
    } else {
      const modalref = this._modal.open(PayModalComponent);
      let storeCreadable: boolean = false;
      // if (data[0].invoiceAmount <= this.isGetInformation?.totalAvailableAmount && data[0].name == 'Proforma Invoice') {
      //   storeCreadable = true;
      // } else {
      //   storeCreadable = false;
      // }
      modalref.componentInstance.isPayCreadable = storeCreadable;

      modalref.componentInstance.setPayMethod.subscribe((res) => {
        if (res === 'online') {
          this.googleAnalyticsService.eventEmitter(
            'Payment Started',
            'LoggedInUser',
            'guest',
            'click',
            1
          );
          this.router.navigate(['pay'], {
            state: {
              invoiceId: data?.invoiceId,
              bookingId: data?.batchId,
              tds: false,
              amount: data?.invoiceAmount
            },
          });
        } else if (res === 'credable') {
          // this.postCredablePayment(invoices);
        } else {
          this.googleAnalyticsService.eventEmitter(
            'Payment Started',
            'LoggedInUser',
            'guest',
            'click',
            1
          );
          this.router.navigate(['payment-confirmation'], {
            state: {
              invoiceId: data?.invoiceId,
              bookingId: data?.batchId,
              tds: false,
              amount: data?.invoiceAmount,
              data: data,
            },
          });
        }
      });
    }
  }

  postCredablePayment(invoice) {
    let x = this.isGetInformation?.clientId;
    let date = new Date();

    let data ={}
    //  {
    //   clientId: +x,
    //   disbursementDTO: [
    //     {
    //       loanAccountNumber: this.isGetInformation?.loanAccountNumber,

    //       invoiceId:
    //         invoice.rowData.bookingInvoices[0].invoiceNumber.toString(),

    //       borrowerId: this.isGetInformation?.borrowerId,

    //       beneficiaryName: '',

    //       bankName: '',

    //       ifscCode: '',

    //       bankAccountNumber: '',

    //       loanAccountType: 'BORROWER',

    //       invoiceRaiseDate: moment().format('YYYY-MM-DDTHH:mm:ss'),

    //       invoiceSubmissionDate: moment().format('YYYY-MM-DDTHH:mm:ss'),

    //       invoiceApprovedDate: moment()
    //         .add(1, 'days')
    //         .format('YYYY-MM-DDTHH:mm:ss'),

    //       invoiceDueDate: moment().add(7, 'days').format('YYYY-MM-DDTHH:mm:ss'),

    //       servicePeriodStartDate: moment().format('YYYY-MM-DDTHH:mm:ss'),

    //       servicePeriodEndDate: moment()
    //         .add(7, 'days')
    //         .format('YYYY-MM-DDTHH:mm:ss'),

    //       // "taxableAmount": this.bookingData?.totalBookingAmount.toString(),
    //       taxableAmount: (
    //       JSON.parse(invoice?.rowData?.taxInfo)?.price - JSON.parse(invoice?.rowData?.taxInfo)?.gst
    //       )
    //         .toFixed(2)
    //         .toString(),

    //       totalGstAmount: JSON.parse(invoice?.rowData?.taxInfo)?.gst.toFixed(2).toString(),

    //       payableDetails: [
    //         {
    //           // "paymentRequested": this.bookingData?.amount,
    //           paymentRequested: JSON.parse(invoice?.rowData?.taxInfo)?.price
    //             .toFixed(2)
    //             .toString(),

    //           payableDate: moment()
    //             .add(3, 'days')
    //             .format('YYYY-MM-DDTHH:mm:ss'),

    //           payableStartDate: moment().format('YYYY-MM-DDTHH:mm:ss'),

    //           payableEndDate: moment()
    //             .add(7, 'days')
    //             .format('YYYY-MM-DDTHH:mm:ss'),
    //         },
    //       ],
    //     },
    //   ],
    // };
    
    this._api.postCredableBulkInitiate(data).subscribe((res: any) => {
      // this.isNotShowPaybutton = true;
      this.notification.create('succeess',
        'Your payment request is under processed. This booking shall be confirmed once payment confirmation comes from Credable.',''
      );
    }, (error) => {
      this.notification.create( 'error',error.error.status+' : '+error.error.message,'');
    });
  }
}
