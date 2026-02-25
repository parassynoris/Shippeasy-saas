import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  Input,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { BaseBody } from 'src/app/admin/smartagent/base-body';
import { CognitoService } from 'src/app/services/cognito.service';
import { FinanceService } from 'src/app/services/Finance/finance.service';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { CommonService } from 'src/app/services/common/common.service';
import { shared } from '../../../data';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { environment } from 'src/environments/environment';
import { ApiSharedService } from '../../api-service/api-shared.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { Currency } from 'src/app/models/cost-items';
import { banklist } from 'src/app/models/bank-master';
import { SystemType } from 'src/app/models/system-type';
import { Invoice } from 'src/app/models/invoice';
import { Payment } from 'src/app/models/payment';
import { PartyMaster } from 'src/app/models/vendor-master';
import { CreditDebitNote } from 'src/app/models/New-payment';

@Component({
  selector: 'app-new-payment',
  templateUrl: './new-payment.component.html',
  styleUrls: ['./new-payment.component.scss'],
})
export class NewPaymentComponent implements OnInit {
  id: any;
  @Input() isType: any = 'add';
  @Input() screen: any;
  isPosting: boolean = false
  currencyList: Currency[] = [];
  isAddMode: boolean = false;
  newPayment: FormGroup;
  invoiceForm: FormGroup;
  Documentpdf: any;
  Documentvoucher: any;
  idToUpdate: any;
  submitted = false;
  NewReciept = true;
  Visible = false;
  InvoiceConfirmation = true;
  ReceiptPosting = true;
  costItemData = shared.jobCost;
  paymentData = shared.paymentRow;
  @Output() CloseInvoiceSection = new EventEmitter<string>();
  allInvoicesData = shared.allInvoicesData;
  newpaymentdata = shared.newpaymentRow;
  today = new Date();
  isShowMore: boolean = false;
  @ViewChild('AddClause') AddClause;
  baseBody: BaseBody;
  bankList: banklist[] = [];
  toalLength: any;
  size = 10;
  page = 1;
  count = 0;
  invoicingpartyList: any = [];
  paymentMode: SystemType[] = [];
  file: any;
  extension: any;
  isStoltUser: boolean;
  isSmartAgentUser: boolean;
  principalList: any = [];
  filterBody = this.apiService.body;
  batchDetails: any;
  selectedBatchNo: any;
  partymasterList: PartyMaster[];
  filename: string = '';
  recieptDetails: any = [];
  currentYear = new Date().getFullYear().toString().slice(-2);
  previousYear = new Date().getFullYear() - 1;
  previoushalfYear = this.previousYear.toString().slice(-2)
  tds_amount: number = 0;
  invoiceData: any = [];
  invoiceDetails: Invoice[] = [];
  creditList: CreditDebitNote[] = [];
  form: any;
  index: any;
  charges: any = [];
  isExport: boolean = false;

  receiptPendingList: any = [];
  receiptSuccess: boolean = false;
  listOfinvoiceData: Payment[] = [];
  key: any = '';
  batchInvoiceList: Invoice[] = [];
  callapseALL: boolean = true;
  expandKeys = "raouteDetails"
  onAccountValue: Number = 0;
  allChequeAmt: Number = 0;
  onAccountRemark: string = '';
  onAccountTdsAmount: string = '';
  onAccountTdsYear: string = '';
  receiptType = ''
  invoiceDetailsStable: Invoice[] = [];
  chargeIndex: any;
  tenantId: any;
  currentAgent: any;
  isImport: boolean;
  isTransport: boolean;
  constructor(
    private router: Router,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private notification: NzNotificationService,
    private _cognit: CognitoService,
    private _FinanceService: FinanceService,
    private route: ActivatedRoute,
    private profilesService: ProfilesService,
    private commonService: CommonService,
    private masterService: MastersService,
    public apiService: ApiSharedService, private cognito: CognitoService,
    private commonfunction: CommonFunctions
  ) {
    this.currentYear = new Date().getFullYear().toString().slice(-2);
    this.previousYear = new Date().getFullYear() - 1
    this.previoushalfYear = this.previousYear.toString().slice(-2)
    this.newPayment = this.formBuilder.group({
      Bill_no: ['sdf'],
      reciept_no: [''],
      payment_mode: ['', Validators.required],
      paymentreference_no: [''],
      paymentreference_date: [''],
      amount: [''],
      remitance_bank: [''],
      beneficiary_bank: [''],
      invoice_party: ['', Validators.required],
      recieved_from: ['', Validators.required],
      invoice_no: [''],
      batch_no: ['', Validators.required],
      remarks: [''],
      currency: ['', Validators.required],
      move_no: [''],
      upload_document: [''],
      payment_status: [''],
      document_name: [''],
      document_tag: [''],
      cheque_amount: ['', Validators.required],
      filename: [''],
      paymentDate: [''],
      InstrumentAmount: [''],
      payment_indicator: ['']
    });

    this.invoiceForm = this.formBuilder.group({
      Rows: this.formBuilder.array([])
    });
    this.isExport = localStorage.getItem('isExport') === 'true' ? true : false;
    this.isImport = localStorage.getItem('isImport') === 'true' ? true : false;
    this.isTransport = localStorage.getItem('isTransport') === 'true' ? true : false;
    this.getBankList();
    this.getUserBank()
    this.getInvoiceParty();
    this.getpaymentMode();
  }
  initRows() {
    return this.formBuilder.group({
      collected_amount: [''],
      outstanding_amount: [''],
      short_amount: [''],
      tds_percentage: [''],
      tds_year: [''],
      stolt_invoice_no: [''],
      stolt_invoice_amount: [''],
      credit_amount: [''],
      from_date: [''],
      to_date: [''],
      entry_date: [''],
      tds_amount: [''],
      cheque: ['']
    });
  }
  print() {
    let reportpayload: any;
    let url: any;
    return
    reportpayload = { "parameters": { "paymentID": this.idToUpdate } };
    url = 'Voucher'
    this.commonService.pushreports(reportpayload, url).subscribe({
      next: (res: any) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        let temp = URL.createObjectURL(blob);
        this.Documentvoucher = temp;
        const pdfWindow = window.open(temp);
      }
    })
  }
  onCloseInvoice(evt?) {
    this.CloseInvoiceSection.emit(evt);
  }
  get f() {
    return this.newPayment.controls;
  }
  convertDate1(e) {
    if (!e)
      return
    var date = new Date(e)
    if (date.toString() === 'Invalid Date') {
      return new Date(e.split('-').reverse())
    } else {
      return date
    }
  }

  paymentModeType = 'cash'
  instrumentAmount(e?) { 
    if(e){
      this.paymentModeType = this.paymentMode?.find(tt => tt?.systemtypeId === e)?.typeName?.toLowerCase()  
    }else{
      this.paymentModeType = this.paymentMode?.find(tt => tt?.systemtypeId === this.newPayment.value.payment_mode)?.typeName?.toLowerCase()  
    }

    if (this.paymentModeType != 'cash') { 
      this.newPayment.get('beneficiary_bank').setValidators([Validators.required]);
      this.newPayment.get('remitance_bank').setValidators([Validators.required]);
    } else {
      this.newPayment.get('beneficiary_bank').removeValidators([Validators.required]);
      this.newPayment.get('remitance_bank').removeValidators([Validators.required]);
    }
    this.newPayment.get('beneficiary_bank').updateValueAndValidity()
    this.newPayment.get('remitance_bank').updateValueAndValidity()
  }
  fatchInvoiceData(data, key) {
    let payload = this.commonService.filterList()
    payload.query = {
      // "invoiceStatus": 'Approved',
      "isExport": (this.isExport || this.isTransport),
      "invoiceToId": key ? data : data.invoice_partyId,
      "type": "sellerInvoice",
      "invoiceStatus": {
        "$in": [
          "Approved", "Completed", "Sent","Overdue"
        ]
      },

      // "$and": [
      //   {
      //     "paymentStatus": {
      //       "$ne": 'Paid'
      //     }
      //   }
      // ]
    }
    if (this.key === 'reciept-posting') {
      payload.query['batchId'] = this.recieptDetails?.batchId
    }
    payload.sort = {
      "desc": ["updatedOn"]
    },
      this.commonService.getSTList('invoice', payload)
        .subscribe((data: any) => {
          this.invoiceDetailsStable = data.documents;
          this.invoiceDetails = data.documents;


          this.invoiceDetails = this.invoiceDetails.map(x => x)
          this.batchInvoiceList = this.invoiceDetails.filter((v, i, a) => a.findIndex(v2 => (v2.batchId === v.batchId)) === i)


          if (this.recieptDetails?.invoiceData) {
            this.invoiceDetails.filter((x, index) => {
              this.recieptDetails?.invoiceData.filter((res) => {
                if (x.invoiceNo === res.invoiceNo) {
                  this.invoiceDetails[index] = { ...res, ...x }
                }
              })
            })
          }
          if (this.recieptDetails.isPosting) {
            this.invoiceDetails = this.invoiceDetails.filter(x => x.isSelected)
            let finalTotal = 0
            this.recieptDetails?.invoiceData?.filter((x) => {
              finalTotal += Number(x?.chequeFinal || x?.cheque)
            })
            this.onAccountValue = Number(this.recieptDetails?.cheque_amount || 0) - finalTotal


          }
          // this.invoiceDetails = this.invoiceDetails.filter(x => x.paymentStatus != 'Paid')
          this.invoiceForm = this.formBuilder.group(
            {
              Rows: this.formBuilder.array(this.invoiceDetails?.map((x, index) => {

                var costItems = [];
                if (x?.costItems) {
                  x?.costItems?.forEach(e => {
                    costItems.push(e)
                  })
                }
                let groupData = {
                  invoiceId: [x?.invoiceId || ''],
                  batchNo: [x?.batchNo || ''],
                  batchId: [x?.batchId || ''],
                  moveNo: [x?.moveNo || ''],
                  blName: [x?.blName || ''],
                  invoiceToName: [x?.invoiceToName || ''],
                  invoiceNo: [x?.invoiceNo || ''],
                  invoice_date: [this.convertDate1(x?.invoice_date) || ''],
                  invoiceAmount: [Number(x?.invoiceAmount).toFixed(2) || 0],
                  invoiceTaxAmount: [x?.invoiceTaxAmount || 0],
                  invoiceAmountNoTax: [Number(Number(x?.invoiceAmount) - Number(x?.invoiceTaxAmount)).toFixed(2) || 0],
                  tds_percentage: [x?.tds_percentage || '0'],
                  tds_year: [x?.tds_year || '2022-23'],
                  to_date: [x?.to_date || ''],
                  from_date: [x?.from_date || ''],
                  entry_date: [x?.entry_date || ''],
                  fullAmount: [x?.fullAmount || true],
                  credit_amount: [x?.credit_amount || 0],
                  collected_amount: [x?.paidAmount || 0],
                  stolt_invoice_amount: [x?.stolt_invoice_amount || ''],
                  stolt_invoice_no: [x?.stolt_invoice_amount || ''],
                  tds_amount: [x?.tds_amount || 0],
                  cheque: [(Number(x?.invoiceAmount) - Number(x?.paidAmount)).toFixed(2)],
                  outstanding_amount: [(Number(x?.invoiceAmount) - Number(x?.paidAmount)).toFixed(2)],
                  short_amount: [x?.short_amount || 0],
                  isSelected: [x?.isSelected || false],
                  chargeNames: this.isType === 'edit' && x?.isSelected ? [x.chargeNames]  : [costItems],
                  consigneeName: [x?.consigneeName || ''],
                  voyageNumber: [x?.voyageNumber || ''],
                  vesselName: [x?.vesselName || ''],
                  carrierName: [x?.carrierName || ''],
                  flightNo: [x?.flightNo || ''],
                  receivedAmt: [x?.receivedAmt || 0]
                };
                this.form = this.formBuilder.group(groupData);
                return this.form;
              })
              )
            })
            setTimeout(() => {
              this.onAccountBalance()
            }, 1000);
       
          
        });
  }
  addArray() {
    const dataArray = [];
    this.invoiceForm.controls?.Rows['controls'].forEach(element => {
      if (element?.value?.isSelected) {
        dataArray.push(element?.value)
      }
    })
    return dataArray;
  }
  onSave(flag?) {
    this.submitted = true;

    let invoiceListData = this.addArray()
    if (!flag) {
      if (!invoiceListData.some((x) => x.isSelected)) {
        this.notification.create('error', 'Select at least one invoice', '');
        return false
      }

      if (invoiceListData.some((x) => Number(x.cheque) <= 0)) {
        let invoiceNo = []
        invoiceListData.filter((x)=>{
          if(Number(x.cheque) <= 0){
            invoiceNo.push(x?.invoiceNo?.toString())
          }
        })
        this.notification.create('error', `Already generated receipt for selected invoices. ${invoiceNo?.toString()}`, '');
        return false
      }
      if (invoiceListData.some((x) => (Number(x.outstanding_amount) - Number(x.cheque)) < 0)) {
        this.notification.create('error', 'Outstanding amount should not less that 0', '');
        return false
      }
      if((Number(this.onAccountValue) - Number(this.allChequeAmt)) < 0){
        this.notification.create('error', 'You have not enough amount to pay invoice', '');
        return false
      }
    }

    if (this.file !== undefined) {
      const formData = new FormData();
      formData.append('file', this.file, `${this.file.name}`);
      formData.append('name', `${this.file.name}`);
      this.commonService.uploadDocuments('uploadfile', formData).subscribe();
      // this.commonService.uploadFile(this.file, this.filename, "reciept");
      this.newPayment.value.upload_document = `${this.file.name}`;
    }

    if (this.key === 'reciept') {
      if (this.newPayment.invalid) {
        return false;
      }
    }


    let currencyData = this.currencyList.filter(
      (x) => x?.currencyId === this.newPayment.get('currency').value
    );

    let paymentData = this.paymentMode.filter(
      (x) => x?.systemtypeId === this.newPayment.get('payment_mode').value
    );
    let beneficiary_bank = this.userBankList.filter(
      (x) => x?.bankId === this.newPayment.value.beneficiary_bank
    );
    let recievedData = this.partymasterList.filter(
      (x) => x?.partymasterId === this.newPayment.get('recieved_from').value
    );
    let invoiceData = this.partymasterList.filter(
      (x) => x?.partymasterId === this.newPayment.get('invoice_party').value
    );
    let remitance_bank = this.bankList.filter(
      (x) => x?.bankId === this.newPayment.get('remitance_bank').value
    );
    const newpay = {
      orgId: this.commonfunction.getAgentDetails().orgId,
      paymentTypeId: this.newPayment.value.payment_mode,
      paymentType: paymentData[0]?.typeName,
      billno: this.newPayment.value.Bill_no,
      paymentreference_no: this.newPayment.value.paymentreference_no,
      paymentDate: this.newPayment.value.paymentreference_date,
      amount: this.newPayment.value.amount ? this.newPayment.value.amount : 0,
      remitance_bankId: this.newPayment.value.remitance_bank,
      remitance_bank: remitance_bank[0]?.bankName,
      beneficiary_bankId: this.newPayment.value.beneficiary_bank,
      beneficiary_bank: beneficiary_bank[0]?.bankName || '',
      invoice_partyId: this.newPayment.value.invoice_party,
      invoice_party: invoiceData[0]?.name,
      recieved_from: recievedData[0]?.name,
      recieved_fromId: this.newPayment.value.recieved_from,
      batchNo: this.batchInvoiceList.filter((x) => x?.batchId === this.newPayment.value.batch_no)[0]?.batchNo,
      batchId: this.newPayment.value.batch_no,
      invoice_no: this.newPayment.value.invoice_no,
      remarks: this.newPayment.value.remarks,
      currencyId: this.newPayment.value.currency,
      currency: currencyData[0]?.currencyShortName,
      move_no: this.batchDetails ? this.batchDetails.moveNo : this.newPayment.value.move_no,
      isExport: (this.isExport || this.isTransport),
      payment_status: this.newPayment.value.payment_status || '',
      document_name: this.newPayment.value.document_name,
      document_tag: this.newPayment.value.document_tag,
      cheque_amount: this.newPayment.value.cheque_amount?.toString(),
      upload_document: this.newPayment.value.upload_document,
      filename: this.newPayment.value.upload_document,
      status: true,
      "isDraft": flag,
      "tenantId": this.tenantId,
      invoiceData: invoiceListData || [],

      onAccountValue: this.onAccountValue?.toString() || '',
      onAccountRemark: this.onAccountRemark || '',
      onAccountTdsAmt: this.onAccountTdsAmount?.toString() || '0',
      onAccountYear: this.onAccountTdsYear || '',
      invoiceAmountPaid : Number(this.finalTotal) || 0,
      invoiceAmount : Number(this.totalInvoiceValue) || 0,
      balanceAmount : Number(this.finalOnAccTotal) || 0

    };
   
    if (this.idToUpdate) {
      this.commonService.UpdateToST(`payment/${this.idToUpdate}`, { ...newpay, paymentId: this.idToUpdate }).subscribe(
        (data: any) => {
          this.recieptDetails = data
          if (data) {
            this.saveInvoiceData(data, false)
            this.notification.create('success', 'Update Successfully', '');
            if (this.key !== 'reciept-posting') {
              this.router.navigate(["/finance/reciept"]);
            } else {
              this.screen = 'submit'
            }
          }
          this.calTotBase()
        },
        (error) => {
          if (this.key !== 'reciept-posting') {
            this.router.navigate(["/finance/reciept"]);
          }
          this.notification.create('error', error?.error?.error?.message, '');

        }
      );
    } else {
      this.commonService.addToST('payment', newpay).subscribe((data: any) => {
        this.recieptDetails = data
        if (data) {
          this.saveInvoiceData(data, false)
          this.notification.create('success', 'Saved Successfully', '');
          this.router.navigate(["/finance/reciept"]);

        }
      }, (error) => {
        this.router.navigate(["/finance/reciept"]);
        this.notification.create('error', error?.error?.error?.message, '');
      })
    }

  }
  getPaymentreciept() {
    let reportpayload: any;
    let url: any;
   
    reportpayload = { "parameters": { "paymentID": this.idToUpdate } };
    url = 'paymentReciept'
    this.commonService.pushreports(reportpayload, url).subscribe({
      next: (res: any) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        let temp = URL.createObjectURL(blob);
        this.Documentpdf = temp;
        const pdfWindow = window.open(temp);
      }
    });
    this.print();
  }
  saveCreditNote() {
    let payload = {
      "tenantId": this.tenantId,
      "invoiceId": '',
      "creditDate": new Date(),
      "invoiceType": '',
      "remarks": '',
      "invoiceNumber": '',
      "invoiceParty": '',
      creditToId: this.newPayment.value.invoice_party,
      creditToName: this.partymasterList.filter(
        (x) => x?.partymasterId === this.newPayment.get('invoice_party').value
      )[0]?.name,

      "creditNoteNo": '',
      "isCredit": true,
      "amountReceived": this.finalOnAccTotal || 0,

      "invoiceAmount": '0',
      "invoiceTaxAmount": '0',
      "paymentTerms": "",
      "costItems": '',
      "refundBase": '',
      "reasonId": '',
      "reason": '',
      "bankId": '',
      "bankName": '',
      "bankType": "",
      "moveNo": null,
      batchNo: this.batchInvoiceList.filter((x) => x?.batchId === this.newPayment.value.batch_no)[0]?.batchNo,
      batchId: this.newPayment.value.batch_no,
      "vesselId": '',
      "vesselName": '',
      "voyageNumber": '',
      "carrierName": '',
      "flightNo": '',
      

      "paymentMode": this.paymentMode.filter(
        (x) => x?.systemtypeId === this.newPayment.get('payment_mode').value
      )[0]?.typeName,
      "payment_ref_no": '',
      currency: this.newPayment.value.currency,
      currencyName: this.currencyList.filter(
        (x) => x?.currencyId === this.newPayment.get('currency').value
      )[0]?.currencyShortName,
      "isExport": (this.isExport || this.isTransport),
      "status": true,
      "gstType": '',
      "orgId": this.commonfunction.getAgentDetails().orgId,
    }
    if (false) {

      // this.commonService.UpdateToST(`creditdebitnote/${this.urlParam.id}`, { ...payload, creditdebitnoteId: this.urlParam.id })
      //   ?.subscribe(
      //     (res: any) => {
      //       if (res) {

      //     } 

      //   );
    } else {
      this.commonService.addToST('creditdebitnote', payload)
        ?.subscribe(
          (res: any) => {

          }
        );
    }
  }
  saveInvoiceData(data, paidFlag) {
    let dataUpdate = []
    data?.invoiceData.filter(x => {
      this.invoiceDetailsStable.filter((y) => {
        if (x?.invoiceId === y.invoiceId) {
          dataUpdate.push({
            ...y,
            "paymentMode":this.newPayment.get('payment_mode').value,
            "paymentModeName": this.paymentMode.find((x) => x?.systemtypeId === this.newPayment.get('payment_mode').value)?.typeName??'',
            cheque: x.cheque,
            paidAmount: paidFlag ? Number(Number(x.cheque || 0) + Number(y.paidAmount || 0)) : Number(y.paidAmount || 0),
            paymentNo: data?.paymentNo,
            paymentStatus: paidFlag ? Number(x.invoiceAmount) <= Number(Number(x.cheque || 0) + Number(y.paidAmount || 0)) ? 'Paid' : 'Partially Paid' : y?.paymentStatus
          });
        }

      })
    })

    if (dataUpdate.length > 0) {
      this.commonService.batchUpdate('invoice/batchupdate', dataUpdate).subscribe();
    }
  }
  onSave1(flag?) {
    this.commonService.UpdateToST(`payment/${this.recieptDetails.paymentId}`, {
      ...this.recieptDetails,
      "isPosting": flag,
      receiptType: this.receiptType
    }).subscribe(
      (data: any) => {

        if (flag) {
          if (this.finalOnAccTotal > 0) {
            // this.saveCreditNote()
          }
          this.saveInvoiceData(data, true)
        }
        this.recieptDetails = data
        if (data) {
          if (this.key === 'reciept-posting') {
            this.screen = 'posting'
          } else {
            this.notification.create('success', 'Update Successfully', '');
            this.router.navigate(["/finance/reciept"]);
          }
          if (flag) {
            this.notification.create('success', 'Posting Successfully', '');
            this.router.navigate(["/finance/reciept-posting"]);
          }
          this.calTotBase()
        }

      },
      (error) => {
        this.notification.create('error', error?.error?.error?.message, '');

      }
    );
  }

  ReceptPost() {
    this.ReceiptPosting = !this.ReceiptPosting;
    this.InvoiceConfirmation = !this.InvoiceConfirmation;
    this.calTotBase()
  }
  disableInput: boolean = false;
  ngOnInit(): void {
    this.currentAgent = this.commonfunction.getActiveAgent()
    this.route.url.subscribe(url => {
      this.disableInput = url.some(segment => segment.path.includes('show'));
    });

    if (this.isType === 'show' || this.isType === 'posting') {
      this.isPosting = true
      this.newPayment.disable();
      this.invoiceForm.controls.Rows.disable();

    } else {
      this.isPosting = false
    }
    this.isStoltUser = true
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.tenantId = resp.tenantId
      }
    })

    this.id = this.route.snapshot.params['id'];
    this.key = this.route.snapshot.params['key'];

    this.isAddMode = !this.id;
  
    if (!this.isAddMode) {
      this.getPaymentDetailsById(this.id);
    }
    this.getCurrencyList();

  }

  getPaymentDetailsById(id) {

    let payload = this.commonService.filterList()
    payload.query = {
      "paymentId": id,
    }
    this.commonService.getSTList('payment', payload).subscribe((data) => {
      const paymentData = data.documents[0]
      this.receiptType = paymentData.receiptType || ''
      this.onAccountValue = Number(paymentData?.cheque_amount) || 0
      this.idToUpdate = paymentData.paymentId
      this.recieptDetails = paymentData || []
      this.listOfinvoiceData = paymentData?.invoiceData || []
      this.fatchInvoiceData(paymentData, false)
      this.onAccountRemark = paymentData.onAccountRemark
      this.onAccountTdsAmount = paymentData.onAccountTdsAmt
      this.onAccountTdsYear = paymentData.onAccountYear
      this.newPayment.patchValue({
        Bill_no: paymentData.Bill_no,
        reciept_no: paymentData.paymentNo,
        payment_mode: paymentData.paymentTypeId,
        paymentreference_no: paymentData.paymentreference_no,
        paymentreference_date: paymentData.paymentDate,
        amount: paymentData.amount,
        remitance_bank: paymentData.remitance_bankId,
        beneficiary_bank: paymentData.beneficiary_bankId,
        invoice_party: paymentData.invoice_partyId,
        recieved_from: paymentData.recieved_fromId,
        invoice_no: paymentData.invoice_no,
        batch_no: paymentData.batchId,
        remarks: paymentData.remarks,
        currency: paymentData.currencyId,
        move_no: paymentData.move_no,
        payment_status: paymentData.payment_status,
        document_name: paymentData.document_name,
        document_tag: paymentData.document_tag,
        cheque_amount: paymentData.cheque_amount,
        upload_document: paymentData.upload_document,
      });
      this.filename = paymentData.filename;
 
  this.instrumentAmount(paymentData.paymentTypeId)
 
  this.calTotBase()
 
    })
  }
  open(content) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }
  onSaves() {
    this.modalService.dismissAll();
  }

  showMore() {
    this.isShowMore = !this.isShowMore;
  }

  selectFile(event) {
    let filename = event.target.value.replace('C:\\fakepath\\', '');
    this.extension = filename.substr(filename.lastIndexOf('.'));
    this.filename = this.newPayment.value.document_name + this.extension;
    this.file = event.target.files[0];
  }

  getBankList() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      isBank: true, category: 'master',
    }
    this.commonService.getSTList('bank', payload)
      ?.subscribe((data) => {
        this.bankList = data.documents;
      });
  }
  userBankList: any = []
  getUserBank() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      parentId: this.commonfunction.getAgentDetails()?.orgId
    }
    this.commonService.getSTList('bank', payload)
      ?.subscribe((data) => {
        this.userBankList = data.documents;

      });
  }

  getInvoiceParty() {

    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      "status": true,
      "$and": [
        {
          "customerType.item_text": {
            "$ne": "Vendor"
          }
        }
      ]
    }
    this.commonService.getSTList('partymaster', payload)?.subscribe((res: any) => {
      this.partymasterList = res?.documents
      res?.documents?.filter((x) => {
        if (x.customerType) {
          x.customerType.map((res: any) => {
            if (res?.item_text === 'Shipper') { this.invoicingpartyList.push(x) }
          })
        }
      });
    })
  }

  getpaymentMode() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      "status": true,
      typeCategory: 'paymentMode',
    }
    this.commonService.getSTList('systemtype', payload)?.subscribe((res: any) => {
      this.paymentMode = res.documents;
      this.instrumentAmount()
    });
  }

  getCurrencyList() {
    this.currencyList = [];
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      "status": true,
    }
    this.commonService.getSTList('currency', payload)?.subscribe(data => {
      this.currencyList = data.documents;
      this.newPayment.get('currency').setValue(this.currentAgent?.currency?.currencyId)
    })
  }
  changeAmount(i?) {
    this.invoiceForm.controls.Rows['controls'][i]?.controls.outstanding_amount.setValue(
      (+parseFloat(this.invoiceForm.controls.Rows['controls'][i]?.controls.invoiceAmount.value || 0)
        - +parseFloat(this.invoiceForm.controls.Rows['controls'][i]?.controls.credit_amount.value || 0)
        - +parseFloat(this.invoiceForm.controls.Rows['controls'][i]?.controls.collected_amount.value || 0))?.toFixed(2)
    )
    this.selectPercentage(this.invoiceForm.controls.Rows['controls'][i]?.controls.tds_percentage.value, i, this.invoiceForm.controls.Rows['controls'][i]?.controls.invoiceAmountNoTax.value)
  }
  selectPercentage(e, i, amount?) {
    this.invoiceForm.controls.Rows['controls'][i]?.controls.tds_amount.setValue(
      ((+parseFloat(amount) / 100) * e)
    )

    this.invoiceForm.controls.Rows['controls'][i]?.controls.cheque.setValue(
      (+parseFloat(this.invoiceForm.controls.Rows['controls'][i]?.controls.outstanding_amount.value))?.toFixed(2)
      || 0)

    if (+parseFloat(this.invoiceForm.controls.Rows['controls'][i]?.controls.outstanding_amount.value) > +parseFloat(this.invoiceForm.controls.Rows['controls'][i]?.controls.cheque.value)) {
      this.invoiceForm.controls.Rows['controls'][i]?.controls.short_amount.setValue(
        ((+parseFloat(this.invoiceForm.controls.Rows['controls'][i]?.controls.outstanding_amount.value) - +parseFloat(this.invoiceForm.controls.Rows['controls'][i]?.controls.cheque.value))?.toFixed(2))
        || 0)
    }
    else {
      this.invoiceForm.controls.Rows['controls'][i]?.controls.short_amount.setValue(
        ((+parseFloat(this.invoiceForm.controls.Rows['controls'][i]?.controls.cheque.value) - +parseFloat(this.invoiceForm.controls.Rows['controls'][i]?.controls.outstanding_amount.value))?.toFixed(2))
        || 0)
    }
    this.onAccountBalance()
  }
  totalInvoiceValue:Number = 0
  onAccountBalance() {
    this.allChequeAmt = 0
    this.invoiceForm.controls?.Rows['controls'].forEach(element => {
      if (element?.value?.isSelected) {
        console.log(element)
        this.allChequeAmt = Number(this.allChequeAmt) + Number(element?.value?.cheque) || 0
        if(Number(element?.value?.cheque) > 0){
          this.totalInvoiceValue = Number(element?.value?.invoiceAmount) || 0
        }
      }
    }) 
    this.finalOnAccTotal =  Number(this.onAccountValue) - Number(this.allChequeAmt)
    this.finalTotal =  Number(this.allChequeAmt)
  }
  fullAmountSet(i) {
    this.invoiceForm.controls.Rows['controls'][i]?.controls.cheque.setValue(
      (+parseFloat(this.invoiceForm.controls.Rows['controls'][i]?.controls.outstanding_amount.value))?.toFixed(2)
      // Number(this.invoiceForm.controls.Rows['controls'][i]?.controls.outstanding_amount.value) 
    )
    this.onAccountBalance()
  }
  changeStatus(e, invoiceData, i) {
    this.invoiceForm.controls.Rows['controls'][i]?.controls.isSelected.setValue(e)
  }

  saveInvoices() {

    this.recieptDetails = { ...this.recieptDetails, invoiceData: this.invoiceData }

    this.commonService.UpdateToST(`payment/${this.recieptDetails.paymentId}`, this.recieptDetails).subscribe(
      (data: any) => {
        if (data) {
          this.notification.create('success', 'Update Successfully', '');
        }
      },
      (error) => {
        this.notification.create('error', 'Something went wrong!', '');
      }
    );
  }



  getCreditNoteList(batchId) {
    let payload = this.commonService.filterList()
    payload.query = {
      "isCredit": true,
      "isExport": (this.isExport || this.isTransport),
      "batchId": batchId
    }
    this.commonService.getSTList('creditdebitnote', payload).subscribe((data) => {
      this.creditList = data.documents;
    });
  }

  openCreditNote(content, i, batchId) {
    this.getCreditNoteList(batchId)
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
    this.index = i
  }
  openReceiptType(content) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'md',
    });
  }
  creditData(creditamount) {
    this.invoiceForm.controls.Rows['controls'][this.index].controls.credit_amount.setValue(creditamount)
    this.changeAmount(this.index)
  }
  listingScreen() {
    this.onCloseInvoice()
  }
  givesTOT(charge) {
    return charge?.rate * charge?.quantity
    let AMT = charge?.rate * charge?.quantity * charge?.exchangeRate
    return Math.round((AMT) + (AMT * charge?.gst / 100))
  }
  chargeOpen(i) {
    if (this.chargeIndex === i) {
      this.chargeIndex = null
    } else {
      this.chargeIndex = i
    }


  }
  baseAMTValue(charge) {
    this.baseAMT = 0
    charge.forEach(element => {
      let AMT = charge?.rate * charge?.quantity * charge?.exchangeRate
      this.baseAMT += (AMT + AMT * charge?.gst / 100) || 0
    });
  }
  shortExcessAMT() {
    this.finalTotal = Number(this.charges?.cheque) + Number(this.charges?.tds_amount)

    let total = Number(this.recieptDetails?.cheque_amount) - Number(this.finalTotal)

    this.finalShort = total > 0 ? 0 : total
    this.finalExtra = total >= 0 ? total : 0
  }
  tdsTotalValue(e) {
    let value = this.charges?.invoiceAmountNoTax * this.charges?.tds_percentage / 100
    this.charges.tds_amount = value
    this.shortExcessAMT()
  }
  finalShort: number = 0
  finalExtra: number = 0
  finalTotal: number = 0
  baseTDSFinal: number = 0
  baseAMT: number = 0
  baseTDS: number = 0
  finalOnAccTotal: number = 0
  calOnPer(e, i) {
    this.recieptDetails.invoiceData[i].excessAmount = 0;
    this.recieptDetails.invoiceData[i].shortAmount = 0;
    this.recieptDetails.invoiceData[i].tds_amount = this.recieptDetails.invoiceData[i]?.invoiceAmountNoTax * this.recieptDetails.invoiceData[i]?.tds_percentage / 100
    this.recieptDetails.invoiceData[i].chequeFinal = this.recieptDetails.invoiceData[i]?.outstanding_amount - (this.recieptDetails.invoiceData[i]?.invoiceAmountNoTax * this.recieptDetails.invoiceData[i]?.tds_percentage / 100)
    if (this.recieptDetails.invoiceData[i].cheque > this.recieptDetails.invoiceData[i].chequeFinal) {
      this.recieptDetails.invoiceData[i].excessAmount = Number(this.recieptDetails.invoiceData[i].cheque) - Number(this.recieptDetails.invoiceData[i].chequeFinal)
    }
    if (this.recieptDetails.invoiceData[i].cheque < this.recieptDetails.invoiceData[i].chequeFinal) {
      this.recieptDetails.invoiceData[i].shortAmount = Number(this.recieptDetails.invoiceData[i].chequeFinal) - Number(this.recieptDetails.invoiceData[i].cheque)
    }
    this.calTotBase()
  }
  calOnAMT(e, i) {
    this.recieptDetails.invoiceData[i].chequeFinal = this.recieptDetails.invoiceData[i]?.outstanding_amount - this.recieptDetails?.invoiceData[i]?.tds_amount
    this.calTotBase()
  }
  calTotBase() {
    this.finalOnAccTotal = 0
    this.finalTotal = 0
    this.recieptDetails?.invoiceData?.filter((x) => {
      console.log(x)
      this.finalTotal += Number(x?.chequeFinal || x?.cheque)
    })
    this.finalOnAccTotal = Number(this.recieptDetails?.cheque_amount || 0) - this.finalTotal
    return
  }
  finalPostAmt() {
    let value: number = 0
    this.recieptDetails?.invoiceData.filter((x) => {
      value += Number(x?.cheque || 0)
    })
    return value
  }
}
