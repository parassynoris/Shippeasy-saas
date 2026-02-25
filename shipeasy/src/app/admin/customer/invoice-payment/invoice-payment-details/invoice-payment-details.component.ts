
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router'; 
import { CognitoService } from 'src/app/services/cognito.service'; 
import { CommonService } from 'src/app/services/common/common.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
@Component({
  selector: 'app-invoice-payment-details',
  templateUrl: './invoice-payment-details.component.html',
  styleUrls: ['./invoice-payment-details.component.scss']
})
export class InvoicePaymentDetailsComponent implements OnInit {
  userData: any;
  batchId: any;
  userActivities: any;
  quoteData: any;
  currencyForm = new FormGroup({
    inr: new FormControl(true),
    usd: new FormControl('')
  })
  rate: any = 1
  INR: boolean = true
  USD: boolean = false
  currencyData: any
  check: boolean = false
  chargeItems: any = [];
  bankdetails:any;
  showCustomerCurr: boolean = false;
  invoiceDetails: any;
  isTransport: boolean;
  constructor(public notification: NzNotificationService, 
    private route: ActivatedRoute,
    public _cognito: CognitoService,
    private _api: CommonService,
    public commonFunction: CommonFunctions,
    private commonService: CommonService,) { }

  ngOnInit(): void {
    this.isTransport = localStorage.getItem('isTransport') === 'false' ? false : true
    this.userData = this._cognito.getagentDetails();
    // this.batchId = this.route.snapshot.params['id']

    this.getInvoice()
  }
  getData() {
    let payload = this.commonService.filterList()
    payload.query = {
      batchId: this.invoiceDetails?.batchId
    }
    this._api.getSTList('batch', payload).subscribe((res: any) => {
      this.userActivities = res.documents[0];


      this.quoteData = {
        ...this.userActivities,
        invoice: {
          ...this.invoiceDetails
        }
      }

    });
  }
  getInvoice() {
    let payload = this.commonService.filterList()

    payload.query = {
      "invoiceId": this.route.snapshot.params['id'],
    }
    this.commonService.getSTList('invoice', payload)
      ?.subscribe((res: any) => {
        this.invoiceDetails = res?.documents[0]
        this.chargeItems = res?.documents[0]?.costItems
        this.getData();

        let payloadbank = this.commonService.filterList()

        payloadbank.query = {
      "branchId": this.invoiceDetails?.invoiceFromId
     }
    this.commonService.getSTList('bank', payloadbank)
      ?.subscribe((res: any) => {
        this.bankdetails = res?.documents[0]


      })


      })
  }

  switchclick(e) {

    this.check = !this.check
    if (this.check == false) {
      this.currencyForm.controls['inr'].setValue(true)
      this.currencyForm.controls['usd'].setValue(false)
      this.rate = 1
      this.INR = true
      this.USD = false
    }
    else {
      this.currencyForm.controls['inr'].setValue(false)
      this.currencyForm.controls['usd'].setValue(true)
      this.rate = 0.01234568
      this.INR = false
      this.USD = true
    }
  }
  returnTotal() {
    var total = 0;
    var tax = 0;
    this.chargeItems?.filter((i: any) => {
      total += Number(i?.selEstimates?.taxableAmount);
    });
    // total = this.quoteData?.priceRanges[this.selectedPrice]?.totalSell || 0
    return total;

  }

  rturnGst() {
    var tax = 0;
    this.chargeItems?.filter((i: any) => {
      tax += Number(i?.selEstimates?.igst);
    });
    return tax;
  }
  returnTotalFinal() {
    var total = 0;
    this.chargeItems?.filter((i: any) => {
      total += Number(i?.selEstimates?.totalAmount);
    });
    return total;
  }
  printAll(data) {
    let reportpayload: any;
    let url: any;
    if (data?.invoiceTypeStatus === "Lumpsum Invoice") {
      reportpayload = { "parameters": { "invoiceID": data?.invoiceId, "module": data?.isExport ? 'export' : 'import' } };
      url = 'lumpsumInvoice';
    }
    else if (data?.invoiceTypeStatus === "Detention Invoice") {
      reportpayload = { "parameters": { "invoiceID": data?.invoiceId } };
      url = 'periodicDetentionInvoiceImport';
    }
    else if (data?.invoiceTypeStatus === "Periodic Invoice") {
      reportpayload = { "parameters": { "invoiceID": data?.invoiceId } };
      url = 'periodicDetentionInvoiceExport';
    } else if (data?.invoiceTypeStatus === "Freight Invoice") {
      reportpayload = { "parameters": { "invoiceId": data?.invoiceId, "module": data?.isExport ? 'export' : 'import' } };
      url = 'freightInvoice';
    } else if (data?.invoiceTypeStatus === "Local") {
      reportpayload = { "parameters": { "invoiceID": data?.invoiceId, "module": data?.isExport ? 'export' : 'import' } };
      url = 'localInvoice';
    } else if (data?.invoiceTypeStatus === "Reimbursement Invoice") {
      reportpayload = { "parameters": { "invoiceId": data?.invoiceId } };
      url = 'reimbursementInvoice';
    }
    else if (data?.invoiceTypeStatus === "Tax") {
      reportpayload = { "parameters": { "invoiceID": data?.invoiceId } };
      url = 'agencyInvoice';
    }
    else {
      return false;
    }

    this.commonService.pushreports(reportpayload, url).subscribe({
      next: (res: any) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        let temp = URL.createObjectURL(blob);
        const pdfWindow = window.open(temp);
        // pdfWindow.print();
      }
    })

  }

  pay(data) {
    let amount = Number(Number(this.invoiceDetails?.invoiceAmount) - Number(this.invoiceDetails?.paidAmount || 0)) 
    let customer = this.commonFunction.getCustomerDetails() 
    if (this.commonFunction?.getAgentCur() != this.commonFunction?.customerCurrency()) { 
      if (this.showCustomerCurr) {
        amount = amount * Number(this.commonFunction?.getExRate())
      }
    } 
    this._api.initiatePayment( Number(amount.toFixed(0)), this.showCustomerCurr ? this.commonFunction?.customerCurrency() : this.commonFunction?.getAgentCur(), data?.shipperName, `Payment for Invoice ${data?.invoiceNo}`, 'https://yourlogo.com/logo.png', customer?.primaryMailId, customer?.primaryNo?.primaryNo, customer?.addressInfo?.address, this.onPaymentSuccess.bind(this), this.onPaymentFailure.bind(this));

  }

  onPaymentSuccess(response: any) { 
    this.commonService.UpdateToST(`invoice/${this.quoteData?.invoice.invoiceId}`, {...this.quoteData?.invoice,paymentStatus : 'Paid', paidAmount : Number(this.invoiceDetails?.invoiceAmount)})
    ?.subscribe((res: any) => {
      if(res){
        this.notification.create('success', 'Invoice Paid Successfully...!', '');
        setTimeout(() => {
          this.getInvoice()
        }, 1000); 
      } 
    }) 
  }

  onPaymentFailure(error: any) { 
    this.notification.create('error', error, '');
  }

}
