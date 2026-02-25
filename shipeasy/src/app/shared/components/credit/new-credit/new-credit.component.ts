import { Component, OnInit, Output, EventEmitter, Input, HostListener, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { shared } from '../../../data';
import { ApiSharedService } from '../../api-service/api-shared.service';
import { BaseBody } from '../../../../admin/party-master/base-body';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { VendorService } from 'src/app/services/vendor.service';
import { ApiService } from 'src/app/admin/principal/api.service';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { CommonService } from 'src/app/services/common/common.service';
import { environment } from 'src/environments/environment';
import * as Constant from 'src/app/shared/common-constants';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FinanceService } from 'src/app/services/Finance/finance.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';

@Component({
  selector: 'app-new-credit',
  templateUrl: './new-credit.component.html',
  styleUrls: ['./new-credit.component.scss']
})
export class NewCreditComponent implements OnInit {
  newCredit: FormGroup;
  submitted = false;
  @Input() isType: any = 'add';
  baseBody: BaseBody = new BaseBody();
  @Output() CloseBillSection = new EventEmitter<string>();
  allInvoicesData = shared.allInvoicesData;
  filterBody = this.apiService.body
  principalList: any = [];
  vendorList: any = [];
  isEditable: boolean = true;
  urlParam: any;
  creditFromToArray: any = []
  selectedCreditTo: any;
  bankList: any = []
  @Output() CloseCreditSection = new EventEmitter<string>();
  selectedBank: any;
  allBillData = shared.allBillData;
  creditData: any;
  currencyList: any;
  paymentMode: any = [];
  isSmartAgentUser: any;
  extension: any;
  filename: any;
  file: any;
  vesselList: any = [];
  voyageList: any = [];
  batchList: any = [];
  BlList: any;
  blData: any;
  batchData: any;
  selectedBatch: any;
  getCharges: any;
  invoiceAmount: number = 0;
  paymentAmount: number = 0;
  isEdit: boolean = false;
  submittedForinvoice = false;
  invoiceData: any = []
  Documentpdf:any;
  modalReference: any;
  newContainerList: any = [];
  filterBody1 = this.apiService.bodyNew;
  closeResult: string;
  costitemData = [];
  toalLength: any;
  count = 0;
  mastersService: any;
  costItemList: any;
  isSelected: boolean = false;
  invoicelist1: any = Array<any>();
  status: boolean = false;
  isExport: boolean = false;
  batchInvoiceList: any = [];
  chargeItemList: any = [];
  partyMasterList: any;
  selectedInvoice: any;
  totalTaxAmt: number;
  totalTotAmt: number;
  reasonList: any = [{ name: 'Correction in invoice - wrong party name selection', value: '9' },
  { name: 'Correction in invoice - wrong charge code selection', value: '10' },
  { name: 'Correction in invoice - wrong  address', value: '11' },
  { name: 'Excess value charged', value: '12' },
  { name: 'Change in POS', value: '5' },
  { name: 'Deficiency in service', value: '3' },
  { name: 'No service is provided', value: '13' },
  { name: 'Correction in invoice - other minor corrections in invoice details', value: '14' },]
  showTem: boolean = false;
  showBatch: boolean = false;
  @ViewChild("insideElement") insideElement;
  @ViewChild("insideElement1") insideElement1;
  @ViewChild("insideVendor") insideVendor;
  @ViewChild("insideVendor1") insideVendor1;
  addPendingAMT: number = 0;
  tenantId: any;
  currentAgent: any;
  isTransport: boolean;
  isImport: boolean;
  @HostListener('document:click', ['$event.target'])
  public onClick(targetElement?) {
    if (this.insideElement || this.insideElement1) {
      const clickedInside = this.insideElement?.nativeElement?.contains(targetElement);
      const clickedInside1 = this.insideElement1?.nativeElement?.contains(targetElement);
      if (clickedInside) {
        this.showBatch = true
      }
      if (!clickedInside && !clickedInside1) {
        this.showBatch = false
      }
    }
    if (this.insideVendor || this.insideVendor1) {
      const insideVendor = this.insideVendor?.nativeElement?.contains(targetElement);
      const insideVendor1 = this.insideVendor1?.nativeElement?.contains(targetElement);
      if (insideVendor) {
        this.showTem = true
      }
      if (!insideVendor && !insideVendor1) {
        this.showTem = false
      }
    }
  }
  constructor(
    private formBuilder: FormBuilder,
    private router: Router, private route: ActivatedRoute,
    public notification: NzNotificationService,private cognito : CognitoService,
    private ProfilesService: ProfilesService,
    private vendorService: VendorService,
    private _api: ApiService,
    private masterservice: MastersService,
    public apiService: ApiSharedService,
    private commonService: CommonService,
    public _cognit: CognitoService,
    private modalService: NgbModal,
    private _FinanceService: FinanceService,
    private commonfunction: CommonFunctions) {
    this.route.params?.subscribe(params =>
      this.urlParam = params

    );
    this.formBuild()
    this.isExport    = localStorage.getItem('isExport') === 'true' ? true : false;
    this.isImport = localStorage.getItem('isImport') === 'true' ? true : false;
    this.isTransport = localStorage.getItem('isTransport') === 'true' ? true : false;

  }

  formBuild(data?) {

    this.newCredit = this.formBuilder.group({
      credit_note_no: [data ? data?.creditNoteNo : ''],
      credit_to: [data ? data?.creditToId : '', Validators.required],
      currency: [data ? data?.currency : '', Validators.required],
      credit_from: [data ? data?.moveNo : ''],
      invoiceParty: [data ? data?.invoiceParty : ''],
      bank_name: [data ? data?.bankId : '', Validators.required],
      amount: [data ? data?.amountReceived : ''],
      payment_mode: [data ? data?.paymentMode : '', Validators.required],
      payment_ref_no: [data ? data?.payment_ref_no : ''],
      credit_note_date: [data ? data?.creditDate : ''],
      doc_file: [data ? '' : ''],
      comment: [data ? data?.remarks : ''],
      vessel: [data ? data?.vesselName : ''],
      voyage: [data ? data?.voyageNumber : ''],
      batch_no: [data ? data?.batchId : '', Validators.required],
      invoiceNo: [data ? data?.invoiceId : '', Validators.required],
      bl_no: [data ? data?.blNo : ''],
      move_no: [data ? data?.moveNo : ''],
      reason: [data ? data?.reason : '', Validators.required],
      refundBase: [data ? data?.refundBase : 'true'],
    });
  }



  onCloseBill(evt) {
    this.router.navigate(['/finance/' + this.urlParam.key]);
  }


  onCloseCredit(evt) {
    this.CloseCreditSection.emit(evt);
  }
  get f() { return this.newCredit.controls; }


  FromToCreditArrayGenerator(type, data) {
    if (type === 'vendor') {
      for (let i = 0; i < data.length; i++) {
        const element = data[i];
        this.creditFromToArray.push({ invoiceId: element.vendorId, invoiceFromName: element.VendorName })
      }
    }
    if (type === 'principal' && this.isSmartAgentUser) {
      for (let j = 0; j < data.length; j++) {
        const element1 = data[j];
        this.creditFromToArray.push({ invoiceId: element1.addressId, invoiceFromName: element1.principalName })
      }
    }
  }

  ngOnInit(): void {
    this.currentAgent = this.commonfunction.getActiveAgent()
    if (this.isType === 'show') {
      this.newCredit.disable();
    }
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.tenantId = resp.tenantId
      }
    }) 
    this.getBatchList()
    this.isSmartAgentUser = false;
    this.getPartyList();
    this.getBankList();
    this.getpaymentMode();
    this.getCurrencyDropDowns();
    if (this.urlParam.id) {
      this.getCreditNote(this.urlParam.id)
    }
  }

  onBankChange() {
    this.selectedBank = this.bankList.filter(e => {
      if (e.bankId === this.newCredit.value.bank_name) {
        return e;
      }
    })
    this.selectedBank = this.selectedBank[0]

  }

  onBatchChange() {
    this.selectedBatch = this.batchList.filter(e => {
      if (e.batchId === this.newCredit.value.batch_name) {
        return e;
      }
    })
    this.selectedBatch = this.selectedBatch[0]

  }

  print(){
    let reportpayload :any;
    let url :any;
    return
      reportpayload = { "parameters": { "invoiceID": this.creditData?.invoiceId,"creditnoteID" :this.creditData?.creditdebitnoteId } };
      url='creditNote';
      this.commonService.pushreports(reportpayload,url)?.subscribe({
        next: (res: any) => {
          const blob = new Blob([res], { type: 'application/pdf' });
          let temp = URL.createObjectURL(blob);
          this.Documentpdf = temp;
          const pdfWindow = window.open(temp);
          // pdfWindow.print();
        }
      })
  }
  getpaymentMode() {

    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      typeCategory: 'paymentMode',
    }
    if(payload?.sort)payload.sort = {
      "desc" : ["updatedOn"]
    },
    
    this.commonService.getSTList('systemtype',payload)?.subscribe((res: any) => {
      this.paymentMode = res.documents;
    });
  }

  onCreditToChange() {
    this.selectedCreditTo = this.creditFromToArray.filter(e => {
      if (e.invoiceId === this.newCredit.value.credit_to) {
        return e;
      }
    })
    this.selectedCreditTo = this.selectedCreditTo[0]
  }

  getPartyList() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true ,
      "$and": [
        {
          "customerType.item_text": {
            "$ne": "Vendor"
          }
        }
      ]
    }
    
    this.commonService.getSTList('partymaster',payload)?.subscribe((data: any) => {
      this.partyMasterList = data.documents;
    });
  }

  onSave() {
    this.submitted = true
    if (this.newCredit.invalid) {
      return false
    }
    if (this.file != undefined) {
      var extension = this.file.name.substr(
        this.file.name.lastIndexOf('.')
      );
      const filename = this.file.name + extension
      const file = this.file;
      const formData = new FormData();
      formData.append('file', this.file, `${this.file.name}`);
      formData.append('name', `${this.file.name}`);
      this.commonService.uploadDocuments("credit",formData).subscribe();
      var certificateObj = {
        documentName: filename,
        documentId: `${this.file.name}`
      };
    }
    this.chargeItemList.map((x) => {
      x.accountBaseCode = x.accountBaseCode || null
      if (this.isEdit) {
        if (x.isSelected && ((x.rate * x.quantity * x?.exRateShippingLine) === x.refundAmount)) {
          x.isRefunds = true
          x.refundPendingAmount = 0
        } else {
          x.isRefunds = false
          x.refundPendingAmount = x.refundPendingAmount - x.refundAmount
        }
      } else {
        let rateQty = x.refundPendingAmount ? x.refundPendingAmount : (x.rate * x.quantity * x?.exRateShippingLine)
        if (x.isSelected && (rateQty === x.refundAmount)) {
          x.isRefunds = true
          x.refundPendingAmount = 0
        } else {
          x.isRefunds = false
          x.refundPendingAmount = rateQty - x.refundAmount

        }
      }

    })

    let payload = {
      
        "tenantId": this.tenantId,
      "invoiceId": this.newCredit.get('invoiceNo').value,
      "creditDate": this.newCredit.get('credit_note_date').value || new Date(),
      "invoiceType": this.selectedInvoice?.invoiceType, 
      "remarks": this.newCredit.get('comment').value,
      "invoiceNumber": this.batchInvoiceList?.filter((x) => x?.invoiceId === this.newCredit.get('invoiceNo').value)[0]?.invoiceNo,
      "invoiceParty": this.newCredit.get('invoiceParty').value,
      "creditToId": this.newCredit.get('credit_to').value,
      "creditToName": this.partyMasterList?.filter((x) => x?.partymasterId === this.newCredit.get('credit_to').value)[0]?.name,
      "creditNoteNo": this.selectedInvoice?.creditNoteNo,
      "isCredit": true,
      "amountReceived": this.newCredit.get('amount').value,

      "invoiceAmount": this.totalTotAmt?.toString() || '0',
      "invoiceTaxAmount": this.totalTaxAmt?.toString() || '0',
      "documents": [certificateObj],
      "paymentTerms": "",
      "costItems": this.chargeItemList,
      "refundBase": this.newCredit.get('refundBase').value,
      "reasonId": this.newCredit.get('reason').value,
      "reason": this.newCredit.get('reason').value,
      "bankId": this.selectedBank?.bankId,
      "bankName": this.selectedBank?.bankName,
      "bankType": "", 
      "moveNo": Number(this.newCredit.get('move_no').value) || null,
      "batchNo": this.batchData?.batchNo,
      "batchId": this.newCredit.get('batch_no').value,
      "vesselId": this.selectedInvoice?.finalVesselId,
      "vesselName": this.newCredit.get('vessel').value,
      "voyageNumber": this.newCredit.get('voyage').value,
      "paymentMode": this.newCredit.get('payment_mode').value,
      "payment_ref_no": this.newCredit.get('payment_ref_no').value,
      "currency": this.newCredit.get('currency').value,
      "isExport": (this.isExport || this.isTransport),
      "status": true,
      "gstType" : this.batchInvoiceList?.filter((x) => x?.invoiceId === this.newCredit.get('invoiceNo').value)[0]?.gstType || '',
      "orgId": this.commonfunction.getAgentDetails().orgId,
    }
    if (this.urlParam.id) {

      this.commonService.UpdateToST(`creditdebitnote/${this.urlParam.id}`, { ...payload, creditdebitnoteId: this.urlParam.id })
        ?.subscribe(
          (res: any) => {
            if (res) {
              this.setInvoice(res)
              this.notification.create(
                'success',
                'Update Successfully',
                ''
              ); 
              setTimeout(() => {
                this.submitted = false
                this.router.navigate(['/finance/' + this.urlParam.key]);
              }, 500);
           
            }
          },
          (error) => {
            this.notification.create('error', error?.error?.error?.message, '');
          }

        );
    } else {
      this.commonService.addToST('creditdebitnote', payload)
        ?.subscribe(
          (res: any) => {
            if (res) {
              this.setInvoice(res)
              this.notification.create(
                'success',
                'Save Successfully',
                ''
              ); 
              setTimeout(() => {
                this.submitted = false
                this.router.navigate(['/finance/' + this.urlParam.key]);
              }, 500);
            }
          },
          (error) => {
            this.notification.error('error', error?.error?.error?.message, );

          }
        );
    }
  }
 
  setInvoice(res) {
    let Payload = { ...this.selectedInvoice, costItems: this.chargeItemList,
    creditNote : res?.creditNoteNo || '' };
    this.commonService.UpdateToST(`invoice/${Payload.invoiceId}`,{...Payload})?.subscribe();
  }
  getCreditNote(id) {
    this.isEdit = true
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "creditdebitnoteId": id 
    }
    
    this.commonService.getSTList('creditdebitnote',payload)?.subscribe((data) => {
      this.creditData = data.documents;
      this.creditData = this.creditData[0]
      this.getContainerData(this.creditData?.batchId)
      this.formBuild(this.creditData)
      this.filename = this.creditData?.documents[0]?.documentName

      this.chargeItemList = this.creditData?.costItems || []
      this.chargeItemList.map((x) => {
        x.refundPendingAmount = x.rate * x.quantity
        x.refundAmount = Number(x.refundAmount) || 0
        x.isRefundSelected = x.isRefundSelected || false
        x.jmb = x.jmb || false
      })
    });
  }

  selectFile(event) {
    this.file = event.target.files[0];
  }

  getCurrencyDropDowns() {


    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true 
    }
    
    this.commonService.getSTList('currency',payload)?.subscribe((res: any) => {
      this.currencyList = res?.documents;
    });
  }

  getBankList() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      isBank: true,
      "status": true , category : 'master',
    }
    
    this.commonService.getSTList('bank',payload)
      ?.subscribe((data) => {
        this.bankList = data.documents;
      });
  }

  getBatchList() {
   
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      isExport: (this.isExport || this.isTransport)
    }
    
    this.commonService.getSTList('batch',payload)
      ?.subscribe((data: any) => {
        this.batchList = data.documents;
      });
  }
  getContainerData(batchId) {
    this.baseBody = new BaseBody();
    var match = [];
    var must_not = []
    this.batchData = this.batchList.find(x => x?.batchId === batchId)
    this.newCredit.patchValue({
      move_no: this.batchData?.moveNo,
      voyage: this.batchData?.quotationDetails?.voyageNumber,
      vessel: this.batchData?.quotationDetails?.vesselName,

    })
   
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      // invoiceStatus: "Approved", 
      "type": "sellerInvoice",
      "invoiceStatus": {
        "$in": [
          "Approved", "Completed", "Sent"
        ]
      },

      // "$and": [
      //   {
      //     "paymentStatus": {
      //       "$ne": 'Paid'
      //     }
      //   }
      // ]
      batchId: batchId,
    }
    
    this.commonService.getSTList('invoice',payload)?.subscribe((res: any) => {
      this.batchInvoiceList = res?.documents;
      // this.batchInvoiceList.push({
      //   invoiceId:this.creditData?.invoiceId,
      //   invoiceNo:this.creditData?.invoiceNumber
      // })
      this.selectedInvoice = this.batchInvoiceList.filter((x) => x?.invoiceId === this.creditData?.invoiceId)[0]
    
      this.calcuTaxAmt()
      this.calcTotalAmt()
    });

  }
  getChargeDetails(id) {
    this.selectedInvoice = []
    this.selectedInvoice = this.batchInvoiceList.filter((x) => x?.invoiceId === id)[0]
    this.newCredit.controls.invoiceParty.setValue(this.selectedInvoice?.invoiceToId || '')
    this.newCredit.controls.credit_to.setValue(this.selectedInvoice?.invoiceToId || '')

    if (this.urlParam.id) {
      this.chargeItemList = this.selectedInvoice?.costItems || []
      this.chargeItemList.map((x) => {
        x.refundAmount = Number(x.refundAmount) || 0
        x.isRefundSelected = x.isRefundSelected || false
        x.jmb = x.jmb || false
      })
    } else {
      this.chargeItemList = this.selectedInvoice?.costItems.filter((x) => !x.isRefunds)
      this.chargeItemList.map((x) => {
      
        x.refundAmount = 0
        x.isRefundSelected = false
        x.jmb = x.jmb || false
      })
    }


    this.calcuTaxAmt()
    this.calcTotalAmt()
  }
  setRefundAMT(e, i) {
    if (e.target.checked) {
      this.chargeItemList[i].refundAmount = this.chargeItemList[i]?.refundPendingAmount ? this.chargeItemList[i]?.refundPendingAmount : Number((this.chargeItemList[i]?.rate * this.chargeItemList[i]?.quantity * this.chargeItemList[i]?.exRateShippingLine).toFixed(2)) || 0
    } else {
      this.chargeItemList[i].refundAmount = 0
    }
    this.newCredit.controls.amount.setValue(this.calTotal())
  }
  calTotal(){
    let totValue = 0
    this.chargeItemList.filter((x)=>{
      if(x?.isRefundSelected){
       totValue += Number(x?.refundAmount || 0)
      }
    })
    return totValue
  }
  calcuTaxAmt() {
    this.totalTaxAmt = 0
    this.chargeItemList.map((x) => {
      if (!x?.excludeGst)
        this.totalTaxAmt += Number(this.calTotalTax(x))
    })
  }
  calcTotalAmt() {
    this.totalTotAmt = 0
    this.chargeItemList.map((x) => {
      if( x?.excludeGst){  
        this.totalTotAmt += Number((Number(x?.exRateShippingLine) * Number(x?.rate) * Number(x?.quantity)).toFixed(2))
      }else{ 
        this.totalTotAmt += Number((Number(x?.selEstimates?.totalAmount)).toFixed(2))
      }

    })
  }
  setVendor(item) {
    this.newCredit.controls.invoiceNo.setValue(item?.invoiceId || '')
  }
  setReason(item) {
    this.newCredit.controls.reason.setValue(item?.name || '')
  }
  checkRefundValue(e, i) {
    if (e.refundAmount > (e.refundPendingAmount ? e.refundPendingAmount : e.rate * e.quantity * e?.exRateShippingLine)) {
      this.notification.create(
        'error',
        'Please enter amount less than Per Unit Amount',
        ''
      );
      this.chargeItemList[i].refundAmount = this.chargeItemList[i]?.refundPendingAmount ? this.chargeItemList[i]?.refundPendingAmount : Number((this.chargeItemList[i]?.rate * this.chargeItemList[i]?.quantity * this.chargeItemList[i]?.exRateShippingLine).toFixed(2) ) || 0
    }
  }
  calTotalTax(data){
    if(data?.gstType === 'igst'){
      return Number(data?.selEstimates?.igst)
    }else{
      return Number(data?.selEstimates?.sgst) + Number(data?.selEstimates?.cgst)
    }
  }
  totalCreditValue(data){
    if( data?.excludeGst){ 
      return Number((Number(data?.exRateShippingLine) * Number(data?.rate) * Number(data?.quantity)).toFixed(2))
    }else{ 
    return Number(data?.selEstimates?.totalAmount)
    }
  }
}
