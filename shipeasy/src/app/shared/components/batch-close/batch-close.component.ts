import { shared } from '../../data';
import { Component, OnInit, Input, TemplateRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as Constant from 'src/app/shared/common-constants';
import { CommonFunctions } from '../../functions/common.function';
import { ApiService } from '../../../admin/principal/api.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ApiSharedService } from '../api-service/api-shared.service';
import { CommonService } from 'src/app/services/common/common.service';
import { FinanceService } from 'src/app/services/Finance/finance.service';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { Payment } from 'src/app/models/payment';
import { EnquiryItem } from 'src/app/models/enquiry';
import { Invoice } from 'src/app/models/invoice';
import { Bl } from 'src/app/models/add-agent-advise';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-batch-close',
  templateUrl: './batch-close.component.html',
  styleUrls: ['./batch-close.component.scss']
})
export class BatchCloseComponent implements OnInit {
  @ViewChild('deleteData') deleteData!: TemplateRef<any>;
  batchData: any = {};
  blData: Bl[] = [];
  id: any;
  isShow: boolean = true
  filterBody = this.apiService.body
  jobData: any = [];
  selectedJob;
  pnlData = shared.pnlRow;
  costitemData: any;
  invoiceData: any = [];
  paymentData: Payment[] = [];
  totalPaymentAmount = 0;
  totalAmtInr = 0;
  totalCustomerInvoice = 0;
  vendorBills = 0;
  pnLRemarks = '';
  @Input() isTypePage;
  invoiceTotal = 0;
  vendorTotalAmt = 0;
  chargeData: EnquiryItem[] = [];
  chargeTotalAmt = 0;
  ReceiptAmount = 0;
  batchStatus: boolean = true;
  closeBtn: boolean = true;
  isExport: boolean = false
  holdBatchClose: boolean = false;
  creditList = []
  invoiceVendorData: Invoice[] = [];
  vendorTotal: number = 0;
  batchDetails: any;
  invoiceTaxTotal: number;
  chargeStatus: boolean =false;
  isMBLCreated: boolean;
  batchId: any;
  selectedBlId: any = null;
isBlListEmpty = true;
characters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
  constructor(
    public route: ActivatedRoute,
    public router: Router,
    private _api: ApiService,
    private apiService: ApiSharedService,
    private commonService: CommonService,
    private tranService: TransactionService,
    private _FinanceService: FinanceService,
    private commonfunction: CommonFunctions,
    public notification: NzNotificationService,
    private modalService: NgbModal,
    public loaderService: LoaderService,
  ) {
    this.isExport = localStorage.getItem('isExport') === 'false' ? false : true
    this.id = this.route.snapshot.params['id'];

  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }


  currentUrl: string;
  show: boolean = false;
  ngOnInit(): void {
    this.batchId = this.route.snapshot.params['id'];
    this.getBatchById();
    this.currentUrl = this.router.url.split('?')[0].split('/')[3]
    if (this.currentUrl === 'show') {
      this.show = true
    }
    this.getblData()

  }
  getBatchById() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      "batchId": this.route.snapshot.params['id']
    }

    this._api.getSTList(Constant.BATCH_LIST, payload)?.subscribe((res: any) => {
      this.batchData = res?.documents[0]
      if (this.batchData?.statusOfBatch == 'Job Cancelled' || this.batchData?.statusOfBatch == 'Job Closed') {
        this.isShow = false
      }
      this.getInvoices()
      this.getCharges()
    });
  }
  getblData() {
    this.loaderService.showcircle();
    let payload = this.commonService.filterList()
    payload.query = {
      $or: [
        {
          blType: "MBL",
          batchId: this.batchId,
        },
        {
          blType: "MBL",
          "consolidatedJobs.batchId": this.batchId
        }
      ]
    }
      payload.sort = { "desc": ['createdOn'] }
    this._api.getSTList(Constant.BL_LIST, payload)
      .subscribe((data: any) => {
        this.blData = data.documents.reverse().map((e, index) => {
          return {
            ...e,
            blLabels: data.documents.length > 1 ? `${e.blNumber} (${this.characters[index]})` : `${e.blNumber}`,
            seqCharacter:  data.documents.length > 1 ? this.characters[index] : ''
          }
        }); 
        if (this.blData.length > 0) {
          this.selectedBlId = this.blData[0].blId;
          this.isBlListEmpty = false;
        } else {
          this.selectedBlId = null;
          this.isBlListEmpty = true;
        }
        this.loaderService.hidecircle();
      }, () => {
        this.loaderService.hidecircle();
      });
  }
  getInvoices() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      "batchId": this.route.snapshot.params['id'], 
      type: {
        "$in": ['sellerInvoice', 'buyerInvoice' ]
      },
      
    }

    this.commonService.getSTList('invoice', payload)?.subscribe((data) => {
      this.invoiceData = data.documents;
      if (this.invoiceData.length > 0) {
        this.invoicePaymetStatus = this.invoiceData?.every(payment => payment?.paymentStatus === 'Paid') 
        this.creditStatus = this.invoiceData.every(payment => payment?.creditNote)
      }

      this.invoiceTotal = 0
      this.invoiceTaxTotal = 0
      this.buyTotal = 0
      this.sellTotal = 0
      this.billAmount = 0
      this.invoiceData.filter((x) => {
        this.invoiceTaxTotal += Number(x?.invoiceTaxAmount || 0)
        this.invoiceTotal += Number(x?.invoiceAmount || 0)
        if(x?.type == 'buyerInvoice'){
          this.buyTotal += Number(x?.invoiceAmount || 0)
        }else{
          this.sellTotal += Number(x?.invoiceAmount || 0)
        }
        // x.costItems.filter(x => {
        //   this.buyTotal += Number(x?.buyEstimates?.totalAmount || 0)
        //   this.sellTotal += Number(x?.selEstimates?.totalAmount || 0)
        // })
        // x.selEstimates = x.costItems.reduce((acc, x) => acc + x?.selEstimates?.totalAmount, 0);
        // x.buyEstimates = x.costItems.reduce((acc, x) => acc + x?.buyEstimates?.totalAmount, 0);
      })
      this.billAmount = this.sellTotal - this.buyTotal

    });
  }

  getCharges() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      quotationId: this.batchData?.quotationId
    }
 
    this.commonService.getSTList('enquiryitem', payload)?.subscribe((result) => { 
      this.chargeStatus = result.documents.every(payment => payment?.isInvoiceCreated      ) 
    });
  }

  onCancel() {
    this.router.navigate(['/batch/list']);
  }

  onClose() {
    this.router.navigate(['/' + this.isTypePage + '/list']);
  }

  invoicePaymetStatus: boolean = false
  creditStatus: boolean = false


  billAmount: number = 0;
  sellTotal: number = 0;
  buyTotal: number = 0;
  amount: number = 0;
  taxAmount: number = 0;



  closeBatch() {


    this.commonService.UpdateToST(`batch/${this.route.snapshot.params['id']}`, {
      ...this.batchData, status: false,
      // totalAmount: this.sellTotal,
      // taxAmount: this.taxAmount,
      // amount: this.amount,
      statusOfBatch: 'Job Closed'
    })?.subscribe((res: any) => {
      if (res) {
        this.notification.create(
          'success',
          'Job Close Successfully',
          ''
        );
        this.onCancel();
      }
    }, error => {
      this.notification.create(
        'error',
        error?.error?.error?.message,
        ''
      );
    });
  }

  downloadReport() {
    const selectedBl = this.blData.find(bl => bl.blId === this.selectedBlId);
    if (!selectedBl) {
      console.error('Selected BL not found in blData');
      return;
    }
  
    const reportpayload = {
      parameters: {
        batchId: this.id,
        blId: selectedBl.blId,
        character: selectedBl.seqCharacter  // Assuming `seqCharacter` is the correct field
      }
    };
  
    const url = 'bookingReport';
  
    this.commonService.pushreports(reportpayload, url).subscribe({
      next: (res: any) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        const temp = URL.createObjectURL(blob);
        window.open(temp);
      }
    });
  }
  


  removeRow(content1) {
    this.modalService.open(content1, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'custom-modal-md',
      ariaLabelledBy: 'modal-basic-title'
    }).result.then((result) => {

      if (result === 'yes') {
        this.closeBatch()
      }
    },);

  }
}