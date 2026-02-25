import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/services/common/common.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { saveAs } from 'file-saver';
@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss']
})
export class InvoicesComponent implements OnInit {
  @Input('bookingData') bookingData: any;
  productData: any = [];
  showCheckBox: boolean = false
  selectedForPay: any = [];
  totalSelectedInvoiceAmount: number;
  totalSelecTable: any = 0;
  isExport: boolean = true
  constructor(private commonService: CommonService, public commonFunction: CommonFunctions, private route: ActivatedRoute, public notification: NzNotificationService,) { }

  ngOnInit(): void {
    this.getData()
  }
  getData() {
    localStorage.removeItem('invoice-data')

    let payload = this.commonService.filterList()

    if(payload?.query)payload.query = {
      "type": 'sellerInvoice',
      "batchId": this.route.snapshot.params['id'],
      "shipperId": this.commonFunction.getAgentDetails()?.customerId,
      "$and": [{ "principleBill": { "$ne": true } },
      { "invoiceStatus": { "$ne": "Pending" } }
      ],
      "paymentStatus": {
        "$in": [
          "Paid", 'Partially Paid', "Unpaid"
        ]
      },
    }
    this.commonService.getSTList('invoice', payload)
      ?.subscribe((res: any) => {
        this.productData = res.documents
        this.totalSelecTable = this.productData.filter(item => item?.paymentStatus !== 'Paid')?.length
      })
  }
  onSelectForPay(event, invoice) {
    if (event?.target?.checked) {
      this.selectedForPay?.push(invoice)
    }
    else {
      let index = this.selectedForPay?.indexOf(invoice)
      if (index !== -1) {
        this.selectedForPay?.splice(index, 1); // 2nd parameter means remove one item only
      }
    }


    this.totalSelectedInvoiceAmount = 0
    this.selectedForPay?.forEach(element => {
      if (element?.paymentStatus != 'Paid')
        this.totalSelectedInvoiceAmount += (Number(element?.invoiceAmount || 0) - Number(element?.paidAmount || 0))
    });

  }
  onSelectAll(event) {
    this.selectedForPay = event?.target?.checked ? this.productData.filter(item => item?.paymentStatus !== 'Paid') : []
    this.totalSelectedInvoiceAmount = 0
    this.selectedForPay?.forEach(element => {
      this.totalSelectedInvoiceAmount += (Number(element?.invoiceAmount || 0) - Number(element?.paidAmount || 0))
    });
  }

  singalSelect: boolean = false;
  singalSelectData: any;

  onPayment(data?) {
    let amount = 0
    if (data) {
      amount = Number(data?.invoiceAmount || 0) - Number(data?.paidAmount || 0);
      this.singalSelect = true;
      this.singalSelectData = data
    } else {
      amount = Number(this.totalSelectedInvoiceAmount)
    }
    let customer = this.commonFunction.getCustomerDetails()
    if (this.commonFunction?.getAgentCur() != this.commonFunction?.customerCurrency()) {
      amount = amount * Number(this.commonFunction?.getExRate())
    }
    this.commonService.initiatePayment(Number(amount.toFixed(0)), this.commonFunction?.customerCurrency(), customer?.name, `Payment for Invoice ${data?.invoiceNo}`, 'https://yourlogo.com/logo.png', customer?.primaryMailId, customer?.primaryNo?.primaryNo, customer?.addressInfo?.address, this.onPaymentSuccess.bind(this), this.onPaymentFailure.bind(this));
  }

  onPaymentSuccess(response: any) {
    let payload = []
    if (this.singalSelect) {
      payload = [{ ...this.singalSelectData, paymentStatus: 'Paid', paidAmount: this.singalSelectData?.invoiceAmount }]
    } else {
      payload = this.selectedForPay.map((x) => {
        x.paymentStatus = 'Paid',
          x.paidAmount = x?.invoiceAmount || 0
      })
    }
    this.commonService.batchUpdate(`invoice/batchupdate`, payload)?.subscribe((res: any) => {
      if (res) {
        this.notification.create('success', 'Invoice Paid Successfully...!', '');
        setTimeout(() => {
          this.totalSelectedInvoiceAmount = 0
          this.showCheckBox = false
          this.singalSelect = false
          this.singalSelectData = null
          this.selectedForPay = []
          this.getData()
        }, 1000);
      }
    })

  }

  onPaymentFailure(error: any) {
    this.totalSelectedInvoiceAmount = 0
    this.showCheckBox = false
    this.singalSelect = false
    this.singalSelectData = null
    this.selectedForPay = []
    this.getData()

    this.notification.create('error', error, '');
  }


  printData(invoiceIdToUpdate, download?) {
    let reportpayload: any;
    let url: any;
    if (invoiceIdToUpdate?.invoiceTypeStatus === "Local") {
      reportpayload = { "parameters": { "invoiceID": invoiceIdToUpdate?.invoiceId, "module": this.isExport ? 'export' : 'import' } };
      url = 'localInvoice'
      this.commonService.pushreports(reportpayload, url).subscribe({
        next: (res: any) => {
          const blob = new Blob([res], { type: 'application/pdf' });
          let temp = URL.createObjectURL(blob);
          const pdfWindow = window.open(temp);
          if (download) {
            saveAs(res, `invoice-${invoiceIdToUpdate?.invoiceNo}.pdf`);
          } else {
            pdfWindow.print();
          }

        }
      })
    }
    else if (invoiceIdToUpdate?.invoiceTypeStatus === "Tax") {
      reportpayload = { "parameters": { "invoiceID": invoiceIdToUpdate?.invoiceId } };
      url = 'agencyInvoice'
      this.commonService.pushreports(reportpayload, url).subscribe({
        next: (res: any) => {
          const blob = new Blob([res], { type: 'application/pdf' });
          let temp = URL.createObjectURL(blob);
          const pdfWindow = window.open(temp);
          if (download) {
            saveAs(res, `invoice-${invoiceIdToUpdate?.invoiceNo}.pdf`);
          } else {
            pdfWindow.print();
          }
        }
      })
    }

  }

}
