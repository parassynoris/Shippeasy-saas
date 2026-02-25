import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { shared } from 'src/app/shared/data';
import {Location} from '@angular/common';
import { CommonService } from 'src/app/services/common/common.service';

@Component({
  selector: 'app-receipt-confirm',
  templateUrl: './receipt-confirm.component.html',
  styleUrls: ['./receipt-confirm.component.scss']
})
export class ReceiptConfirmComponent implements OnChanges {
  loginID : any = 'agent'; 
  newPayment: FormGroup;
  advancePayment: FormGroup;
  settlementPayment: FormGroup;
  onAccountPayment: FormGroup;
  submitted = false;
  NewReciept=true;
  showVoucherDate:boolean = true
  Visible=false;
  InvoiceConfirmation=true;
  ReceiptPosting=true;
  Advance:boolean=true
  Settlement:boolean=true
  OnAccount:boolean=true
  costItemData = shared.jobCost;
  paymentData;
  @Output() CloseInvoiceSection = new EventEmitter<string>();
  @Input() allInvoicesData;
  @Input() jobDetails;
  newpaymentdata = shared.newpaymentRow;
  today = new Date();
  showDate:boolean=false
  isShowMore:boolean = false;
  urlParam: any;
  daData:any = [];
  tableListData:any = [];
  totalPriceAmount = 0;
  @ViewChild('AddClause')AddClause;
  constructor(private router: Router,
    private route:ActivatedRoute,
    private modalService: NgbModal, 
    public location: Location,
    private formBuilder: FormBuilder, 
    public commonService: CommonService,
    private notification: NzNotificationService) {
    this.route.params.subscribe( params => this.urlParam = params );
    this.newPayment = this.formBuilder.group({
      Bill_no: ['', Validators.required],     
    });
    this.advancePayment = this.formBuilder.group({
      remarks: [],
      fas_clear: [],
      receipt_amount: [],
      fas_no: [],
      Previously: [],
      current_adj: [],
      bal_amt: [],
    });
    this.settlementPayment = this.formBuilder.group({
      remarks: [],
      fas_clear: [],
      receipt_amount: [],
      fas_no: [],
      Previously: [],
      current_adj: [],
      bal_amt: [],
      amountRecievedInr: [],
    });
    this.onAccountPayment = this.formBuilder.group({
      remarks: [],
      fas_clear: [],
      receipt_amount: [],
      fas_no: [],
      Previously: [],
      current_adj: [],
      bal_amt: [],
      amountRecievedInr: [],
    });
  }
  backbtn() {
    this.location.back();
  }
  onCloseInvoice(evt){
    this.CloseInvoiceSection.emit(evt);
  }
  get f() { return this.newPayment.controls; }
  onSave() {
    this.submitted = true;    
  }
  cancel(){
    this.location.back();
  }
  Open(){
    this.Visible=!this.Visible;  
  }
  ReceptPostOnAccount(){
    this.savePayment('onAccountPayment');
  }
  ReceptPostSettlement(){
    this.savePayment('settlementPayment');
  }
  ReceptPostAdvance(){ 
    this.savePayment('advance');
    return;
    this.location.back();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.allInvoicesData){
      this.paymentData = this.allInvoicesData.find(pay => pay?._source?.paymentId === this.urlParam.rid);
    }
    if(this.paymentData?._source?.advance){
      this.advancePayment.patchValue(this.paymentData._source.advance);
    }
    if(this.paymentData?._source?.settlementPayment){
      this.settlementPayment.patchValue(this.paymentData._source.settlementPayment);
    }
    if(this.paymentData?._source?.onAccountPayment){
      this.onAccountPayment.patchValue(this.paymentData._source.onAccountPayment);
    }
    if(this.paymentData?._source){
      this.getJobDeatils(this.paymentData?._source)
    }

  
  }
  getJobDeatils(data){
    let mustArray = []
    mustArray.push({
      match: {
        "jobId": data?.jobId,
      },
    });
    var parameter = {
      size: Number(1000),
      query: {
        bool: {
          must: mustArray,
          filter: [],
          should: [],
          must_not: [],
        },
      },
    };
    this.commonService.getListByURL('transaction/list?type=job', parameter).subscribe((res: any) => {
      this.jobDetails = res.hits.hits[0];
      this.getDaDetails();
    });
  }
  getDaDetails(){
    let body = {
      size: 500,
      _source: [],
      query: {
        bool: {
          must: [{ match: { portcallId: this.jobDetails._source.enquiryId } },
            {match : { daType : "PDA"}}],
          filter: [],
          should: [],
          must_not: [],
        },
      },
    };
    this.commonService.getListByURL('transaction/list?type=da', body).subscribe((res:any) => {
      if (res.hits.hits.length > 0) {
        this.daData = res.hits.hits?.[0];
        if(this.daData?._source?.daId){
          this.getDaItems();
        }
      }
    })
  }
  getDaItems(){
    let body = {
      size: 500,
      _source: [],
      query: {
        bool: {
          must: [{ match: { portcallId: this.jobDetails._source.enquiryId }}],
          filter: [],
          should: [],
          must_not: [],
        },
      },
    };
    this.commonService.getListByURL('transaction/list?type=dacostitem', body).subscribe((data: any) => {

      this.tableListData = data?.hits?.hits[0]?._source?.data;
      if (this.tableListData) {
        this.tableListData.forEach((element, index) => {
          if(this.tableListData[index]?.costItems[0]?.tax?.[0]?.taxRate){
            this.totalPriceAmount += this.tableListData[index]?.costItems[0]?.agent?.unitPrice *
            this.tableListData[index]?.costItems[0]?.quantity * ((this.tableListData[index]?.costItems[0]?.tax?.[0]?.taxRate * 0.01) + 1)
          } else {
            this.totalPriceAmount += this.tableListData[index]?.costItems[0]?.agent?.unitPrice *
              this.tableListData[index]?.costItems[0]?.quantity
          }
      
        });
      }
    
    })
  }
  savePayment(type){
    let value = this.advancePayment.value;
    if(type === 'settlementPayment'){
      value = this.settlementPayment.value;
    }
    if(type === 'onAccountPayment'){
      value = this.onAccountPayment.value;
    }
    let payload = {
      "paymentId": this.urlParam.rid,
      [type]: value,
    }
    this.commonService.SaveOrUpdate('finance/payment/update', [payload]).subscribe((res:any)=>{
      if(res){
        this.notification.create('success', 'Saved Successfully', '');
        this.router.navigate(['/finance/'+ this.urlParam.key]);
      }
    }, error => {
      this.notification.create(
        'error',
       error?.error?.error?.message,
        ''
      );
    })
  }
  open(content) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg'
    }
    )
  }
  onSaves() {
    this.modalService.dismissAll();

  }


  showMore(){
    this.isShowMore = !this.isShowMore;
  }
  openWindow(x){
   
    if (x === 'onaccount' || x === 'settlement'){
      this.showDate = true
      this.showVoucherDate = false
    }
    else{
      this.showDate = false
      this.showVoucherDate = true
    }
    
  }

}
