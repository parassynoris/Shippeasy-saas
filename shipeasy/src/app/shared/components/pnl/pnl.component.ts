import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from 'src/app/services/common/common.service';
import { FinanceService } from 'src/app/services/Finance/finance.service';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { shared } from '../../data';
import { CommonFunctions } from '../../functions/common.function';
import { CognitoService } from 'src/app/services/cognito.service';

@Component({
  selector: 'app-pnl',
  templateUrl: './pnl.component.html',
  styleUrls: ['./pnl.component.scss']
})
export class PNLComponent implements OnInit {
  @Input() isTypePage : any = 'pnl'
  jobData: any = [];
  selectedJob;
  pnlData = shared.pnlRow;
  costitemData:any;
  invoiceData: any = [];
  paymentData: any = [];
  totalPaymentAmount = 0;
  totalAmtInr = 0;
  totalCustomerInvoice = 0;
  vendorBills = 0;
  pnLRemarks = '';
  userData: any;

  constructor(
    private router: Router,
    private commonService : CommonService,
    private tranService : TransactionService,
    private _FinanceService: FinanceService, 
    private commonfunction: CommonFunctions,
    private notification: NzNotificationService,private cognito : CognitoService,
    ) {
    // do nothing.
  }

  ngOnInit(): void {
    this?.cognito?.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.userData  = resp
      }
    }) 
     this.getJobList();
  }
  onClose() {
    this.router.navigate(['/'+this.isTypePage+'/list']);
  }

  getJobList() {
    let mustArray =[]
    if (this.commonService.dashboardJobKey !== '') {
      let da_status = this.commonService.dashboardJobKey
      mustArray.push({
        match: {
          "daStatus": da_status,
        },
      });
    }
    var parameter = {
      size: 1000,
      sort:{createdOn:"desc"},
      query: {
        bool: {
          must: mustArray,
          filter: [],
          should: [],
          must_not: [],
        },
      },
    };
    this.tranService.getJobList(parameter).subscribe((data) => {
      this.jobData = data.hits.hits;
    });
  }
  jobSelect(jobid){
    this.selectedJob = this.jobData.find(job => job._source.jobId === jobid.target.value);
    if(this.selectedJob?._source?.pnLRemarks){
      this.pnLRemarks = this.selectedJob?._source?.pnLRemarks;
    }
    this.totalCustomerInvoice = 0;
    this.vendorBills = 0;
    this.totalPaymentAmount = 0;
    this.totalAmtInr = 0;
    this.getChargeItemData();
    this.getPaymentData();
  }

  getChargeItemData() {
    let body = {
      size: 1000,
      _source: [],
      query: {
        bool: {
          must: [{
            "match": {
              "portcallId": this.selectedJob._source.enquiryId,
            }
          }],
          filter: [],
          should: [],
          must_not: [],
        },
      },
    };
    this.tranService.getChargesItemList(body).subscribe((data: any) => {
      this.costitemData = data.hits.hits?.[0]?._source?.data;
      if(this.costitemData?.length > 0){
        this.getInvoices();
        this.costitemData.map(charge => {
          this.totalCustomerInvoice += parseInt(((charge.costItems[0].quantity * charge.costItems[0]?.agent?.unitPrice)*(1+(charge?.costItems[0]?.tax ? charge?.costItems[0]?.tax[0]?.taxRate : 18)/100)).toFixed(2));
          this.vendorBills += parseInt(((charge?.costItems[0]?.quantity * charge?.costItems[0]?.rate)
          *
          (1+(charge?.costItems[0]?.tax ? charge?.costItems[0]?.tax[0]?.taxRate : 18)/100)
          ).toFixed(2));
        });
      }
    })
  }

  getPaymentData(){
    let body =  {
      size: 1000,
      _source: [],
      query: {
        bool: {
          must: [
            {
              "match": {
                "status": true
              }
            },
            {
              "match": {
                "jobId": this.selectedJob?._source?.jobId
              }
            }
          ],
          filter: [],
          should: [],
          must_not: [],
        },
      },
    };
    this._FinanceService.paymentList(body).subscribe((res: any) => {
      this.paymentData = res.hits.hits;
      this.totalPaymentAmount = 0;
      this.totalAmtInr = 0;
      this.paymentData.map((pd:any) => {
        if(pd?._source?.onAccountPayment){
          this.totalPaymentAmount += pd?._source?.onAccountPayment?.amountRecievedInr;
        }
        if(pd?._source?.amtInr){
          this.totalAmtInr += pd?._source?.amtInr;
        }
      })
    })
  }

  getInvoices(){
    let body = {
      size: 1000,
      _source: [],
      query: {
        bool: {
          must: [
            {
              "match": {
                "module": this.userData?.module,
              },
            },
            {
              "match": {
                "jobNumber": this.selectedJob._source.jobNo,
              }
            }
          ],
          filter: [],
          should: [],
          must_not: [],
        },
      },
    };
    this._FinanceService.invoiceList(body).subscribe((data) => {
      this.invoiceData = data.hits.hits;
      if(this.invoiceData.length>0){
        this.invoiceData.map(invoice => {
          if(invoice?._source?.data){
            invoice._source.data.map(costheadid => {
              this.costitemData = this.costitemData.map(costitem => {
                if(costitem.costItemHeadId === costheadid){
                  if(costitem.invoiceCount){
                    return {...costitem, invoiceCount: ++costitem.invoiceCount};
                  } else {
                    return {...costitem, invoiceCount: 1};
                  }
                }
                return costitem;
              })
            })
          }
        })
      }
    });
  }

  closeJob(){
    let payload = {
      jobId: this.selectedJob?._source?.jobId,
      daStatus: 'Job Closed',
      pnLRemarks: this.pnLRemarks
    }
    this.tranService.updateJob([payload]).subscribe((res:any)=>{
      if (res) {
        this.notification.create(
          'success',
          'Job closed successfully!',
          ''
        );
      }
    }, error => {
      this.notification.create(
        'error',
       error?.error?.error?.message,
        ''
      );
    });
  }
}
