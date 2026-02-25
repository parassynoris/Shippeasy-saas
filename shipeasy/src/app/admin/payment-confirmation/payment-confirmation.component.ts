import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CognitoService } from 'src/app/services/cognito.service';
import { GoogleAnalyticsService } from 'src/app/services/google-analytics.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { ApiService } from '../principal/api.service';
import { CommonService } from 'src/app/services/common/common.service';
// import { Store } from '@ngrx/store';
// import { ToastrService } from 'ngx-toastr';
// import { ApiService } from '../services/api.service';
// import { CognitoService } from '../services/cognito.service';
// import { GoogleAnalyticsService } from '../services/google-analytics.service';
// import { masterdataservice } from '../services/masterdata.service';
// import { CommonFunctionsService } from '../shared/common-functions.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
@Component({
  selector: 'app-payment-confirmation',
  templateUrl: './payment-confirmation.component.html',
  styleUrls: ['./payment-confirmation.component.scss'],
})

export class PaymentConfirmationComponent {
  bookingId: any;
  todayDate = new Date();
  tds =  2;
  orderDetails: any;
  invoiceId: any;
  isPaymentDone: boolean = false;
  bookingData: any;
  paymentData: any;
  invoiceData: any = [];
  InovoiceBlobData: any = [];
  deduct: any = false;
  paymentAmount: any = 0;
  countryList: any = [];
  pTypes: any = [];
  pModes: any = [];
  currencyList: any = [];
  bookingDataList:any = [];
  isList:boolean = false;
  isPyamentSubmitted:boolean = false;
  bank = new FormGroup({
    account: new FormControl(null, Validators.required),
    bname: new FormControl('', Validators.required),
    cname: new FormControl(null, Validators.required),
    amount: new FormControl(null, Validators.required),
    currency: new FormControl(null, Validators.required),
    pmode: new FormControl(null, Validators.required),
    ptype: new FormControl(null, Validators.required),
    pdate: new FormControl(null, Validators.required),
    remarks: new FormControl()
  });
  isIndian:boolean = true;

  constructor(
    public notification: NzNotificationService,
    private router: Router,
    private _api: CommonService,
    // private store: Store<{ logindata: any }>, 
    public _cognito:CognitoService ,
     private googleAnalyticsService:GoogleAnalyticsService,
    public common: CommonFunctions
  ) {
    this.isIndian = this._cognito.isIndianCustomer();
    // this.countryList = this.masterdata.getSystemType('country')
    // this.pTypes = this.masterdata.getSystemType('payment_type')
    // this.pModes = this.masterdata.getSystemType('payment_mode')
    // this.currencyList = this.masterdata.getSystemType('currency')
    let userData = {};
    if (this.router.getCurrentNavigation()?.extras?.state?.invoiceId) {
      this.bookingData = this.router.getCurrentNavigation()?.extras?.state?.data;
      this.bookingDataList = this.router.getCurrentNavigation()?.extras?.state?.bookingDataList;
      if(this.router.getCurrentNavigation()?.extras?.state?.bookingDataList){
         this.isList = true;
         this.router.getCurrentNavigation()?.extras?.state?.bookingDataList?.map((booking) => {
            booking.bookingInvoices?.map((i) => {
              this.invoiceData.push({invoiceId:i?.invoiceId,name:JSON.parse(i?.invoiceType)?.name, invoiceNumber:i?.invoiceNumber, invoiceAmount:i?.invoiceAmount.toFixed(2)})
            })
         })
      }
      else{
        this.invoiceData = this.router.getCurrentNavigation()?.extras?.state?.data?.bookingInvoices?.map((i) => {
          return {invoiceId:i?.invoiceId,name:JSON.parse(i?.invoiceType)?.name, invoiceNumber:i?.invoiceNumber, invoiceAmount:i?.invoiceAmount.toFixed(2)}
        })
      }
      let invoiceId =
        this.router.getCurrentNavigation()?.extras?.state?.invoiceId;
      this.invoiceId = invoiceId;
      this.bookingId =
        this.router.getCurrentNavigation()?.extras?.state?.bookingId;
      this.deduct = this.router.getCurrentNavigation()?.extras?.state?.tds;
      this.paymentAmount =
        this.router.getCurrentNavigation()?.extras?.state?.amount;
      if(this.deduct){
        this.paymentAmount = this.paymentAmount - ((this.paymentAmount*this.tds)/100);
      }
      // this.store.select('logindata').subscribe((data: any) => {
      //   userData = data?.UserData;
      // });

    } else {
      this.router.navigate(['/dashboard/invoice']);
    }
  }

 /** onDonwloadInvoice(invoice, index) takes invoice and index as argument 
 * and based on invoice it will download the file for the invoice
 */
  onDonwloadInvoice(invoice, index) {
    var a = document.createElement('a');
    a.href = this.InovoiceBlobData[index];
    a.download = `${invoice?.invoiceType?.name}.pdf`;
    document.body.appendChild(a);
    a.click();
  }

  onGoToInvoice(invoice) {
    this.router.navigate(['dashboard/invoice/' + invoice?.invoiceId]);
  }

    /** onGoToBooking(detail) takes detail as an argument 
   * and basedd on that it will redirect to the booking 
   */
  onGoToBooking(detail) {
    if (detail) {
      if(this.isList){
        this.router.navigate([`dashboard/booking/${this.bookingDataList?.id}`]);
      }else{
        this.router.navigate([`dashboard/booking/${this.bookingData?.id}`]);
      }

    } else {
      this.router.navigate([`dashboard/booking`]);
    }
  }

  /** pay() is used when user click on the pay button 
   * redirect to the payment page
   */
  pay(){
    this.googleAnalyticsService.eventEmitter("Payment Started",'LoggedInUser' , "guest", "click", 1);
    this.router.navigate(['pay'], { state: { invoiceId:this.invoiceId , bookingId:this.bookingId, tds:this.deduct, amount:this.paymentAmount}});
  }

/**  onSendPayment() is used to post the payment data 
 * to the payment api
*/
  onSendPayment() {
    var invoicesData = [];
    if (this.isList) {
      this.bookingDataList?.map((booking) => {
        booking.bookingInvoices?.map((i) => {
          invoicesData.push({ invoiceno: String(i.invoiceId), amount: i.invoiceAmount })
        })
      })
    }
    else {
      invoicesData = this.bookingData?.bookingInvoices?.map((i) => {
        return { invoiceno: String(i.invoiceId), amount: i.invoiceAmount }
      })
    }
    let formValue = this.bank.value
    let pObj = {
      paymentDate: formValue.pdate,
      paymentAmount: formValue.amount,
      paymentRef:formValue.account,
      remarks:formValue.remarks,
      bankName:formValue.bname,
      paymentType:formValue.ptype,
      paymentMode:formValue.pmode,
      internalStatus:"payment-offline",
      paymentStatus:"payment-initiated",
      currency:formValue.currency,
      country:formValue.cname,
      invoice:[...invoicesData]
    }
    this._api.addPayment(pObj).subscribe((res) => {
      this.notification.create('Success',"Sucessfully submitted!","Done");
      this.isPyamentSubmitted  = true;
    },error => {
      this.notification.create('error',error.error.title,error.status  )
    })
  }
  
}
