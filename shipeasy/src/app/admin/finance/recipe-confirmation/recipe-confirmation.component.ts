import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/services/common/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-recipe-confirmation',
  templateUrl: './recipe-confirmation.component.html',
  styleUrls: ['./recipe-confirmation.component.css']
})
export class RecipeConfirmationComponent implements OnInit {
  paymentData;
  currentUrl: any
  urlParam: any;
  totalPaymentAmount = 0;
  totalAmtInr = 0;
  @Input() jobDetails;
  toalLength: any;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  constructor(private router: Router,
    private modalService: NgbModal,
    private notification: NzNotificationService,
    private route:ActivatedRoute,
    private commonService: CommonService, ) { 
      this.route.params.subscribe( params => this.urlParam = params );
  }
  onOpenNew(data){
    this.router.navigate(['/finance/'+ this.urlParam.key+'/'+data?.paymentId+'/confirm']);
  }
  editReceipt(data){
    this.router.navigate(['/finance/receipt/'+data?.paymentId+'/editreciept']);
  }
  ngOnInit(): void {
    this.currentUrl =window.location.href.split('?')[0].split('/').pop();
    this.getPaymentData();
  }
   getPaymentData(){
    let body =  {
      size: 20,
      _source: [],
      query: {
        bool: {
          must: [
            {
              "match": {
              }
            },
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
      this.totalPaymentAmount = 0;
      this.totalAmtInr = 0;
      this.paymentData.map((pd:any) => {
        if(pd?._source?.paymentAmount){
          this.totalPaymentAmount += pd?._source?.paymentAmount
        }
        if(pd?._source?.amtInr){
          this.totalAmtInr += pd?._source?.amtInr
        }
      })
    })
  }
  deleteReceipt(paymentId, confirmdelete){
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
          must: [ {
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
