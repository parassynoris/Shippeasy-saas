import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CognitoService } from 'src/app/services/cognito.service';
import { CommonService } from 'src/app/services/common/common.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import * as XLSX from "xlsx";
@Component({
  selector: 'app-recipe-acknowledgement',
  templateUrl: './recipe-acknowledgement.component.html',
  styleUrls: ['./recipe-acknowledgement.component.css']
})
export class RecipeAcknowledgementComponent implements OnInit, OnChanges {
  paymentData: any;
  totalPaymentAmount = 0;
  totalAmtInr = 0;
  @Input() jobDetails;
  urlParam: any;
  currentUrl: any;
  Payment = true;
  Payments = false;
  toalLength: any;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  userData: any;
  constructor(private router: Router,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private notification: NzNotificationService,
    private commonfunction: CommonFunctions,
    private cognito : CognitoService,

  ) {
    this.route.params.subscribe(params =>
      this.urlParam = params
    );
  }

  onOpenNew(id?) {
    if (id) {
      this.router.navigate(['/finance/' + this.urlParam.key + '/' + id + '/editreciept']);
    } else
      this.router.navigate(['/finance/' + this.urlParam.key + '/newreciept']);
  }

  ngOnInit(): void {
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();
    this.getPaymentData();
  }
  ngOnChanges() {
    this.cognito.getagentDetails().subscribe((resp) => {
      if (resp != null) {
        this.userData = resp
      }
    })
    this.getPaymentData();
  }

  getPaymentData() {
    let body = {
      size: 20,
      _source: [],
      query: {
        bool: {
          must: [
            {
              "match": {
              }
            }
          ],
          filter: [],
          should: [],
          must_not: [],
        },
      },
    };
    this.commonService.getListByURL('finance/list?type=payment', body)?.subscribe((res: any) => {
      this.paymentData = res.hits.hits;
      this.toalLength = res.hits.total.value;
      this.count = res.hits.hits.length;
      this.paymentData.map((pd: any) => {
        if (pd?._source?.paymentAmount) {
          this.totalPaymentAmount += pd?._source?.paymentAmount
        }
        if (pd?._source?.amtInr) {
          this.totalAmtInr += pd?._source?.amtInr
        }
      })
    })
  }
  deleteReceipt(paymentId, confirmdelete) {
    this.modalService
      .open(confirmdelete, {
        backdrop: 'static',
        keyboard: false,
        centered: true,
        size: '',

        ariaLabelledBy: 'modal-basic-title',
      })
      .result.then(
        (result) => {
          if (result === 'yes') {
            let data = {
              paymentId: paymentId,
              searchKey: 'paymentId',
            };
            const body = [data];

            this.commonService.SaveOrUpdate('finance/payment/delete', body).subscribe((res: any) => {
              if (res) {
                this.notification.create(
                  'success',
                  'Deleted Successfully',
                  ''
                );
                this.getPaymentData();
                this.totalPaymentAmount = 0;
                this.totalAmtInr = 0;
              }
            });
          }
        },
      );
  }

  download(x) {
    let excel = [x]
    const myworksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excel);
    const myworkbook: XLSX.WorkBook = {
      Sheets: { data: myworksheet },
      SheetNames: ["data"],
    };
    const fileName = "Receipt.xlsx";
    XLSX.writeFile(myworkbook, fileName);
  }
  requestMail(e) {
    // let userData = this.commonfunction.getUserDetails();

  
        let userData  =  this.userData

        let emaildata = `
        ${'Payment Ammout :'} : ${e?.paymentAmount} `
    
        let payload = {
          sender: {
            email: userData.userEmail
          },
          to: [{
            email: e?.PrincipalName?.value?.primaryMailId,
          }],
          cc: [{
            email: e?.PrincipalName?.value?.secondaryMailId,
          }],
          textContent: `${emaildata}`,
          subject: "Receipt Acknowledgement",
        }
        this.commonService.sendEmail(payload).subscribe(
          (res) => {
            if (res.status == "success") {
              this.notification.create('success', 'Email Send Successfully', '');
            }
            else {
              this.notification.create('error', 'Email not Send', '');
            }
            this.modalService.dismissAll();
          }
        );
    

 
  }
  next() {
    if (this.toalLength > this.count) {
      this.getPaginationData('next');
    }
  }

  prev() {
    if (this.page > 0) {
      this.getPaginationData('prev');
    }
  }

  filter(e) {
    this.size = e.target.value;
    this.fromSize = 1;
    this.getPaymentData();
  }

  getPaginationData(type: any) {
    this.fromSize =
      type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
    var parameter = {
      size: Number(this.size),
      from: this.fromSize - 1,
      query: {
        bool: {
          must: [{
            "match": {
            }
          },],
          filter: [],
          should: [],
          must_not: [],
        },
      },
    };

    this.commonService.getListByURL('finance/list?type=payment', parameter).subscribe((data: any) => {
      this.paymentData = data.hits.hits;
      this.toalLength = data.hits.total.value;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count =
        type === 'prev'
          ? this.toalLength === this.count
            ? this.count - (this.toalLength % Number(this.size))
            : this.count - data.hits.hits.length
          : this.count + data.hits.hits.length;
    });
  }
}



