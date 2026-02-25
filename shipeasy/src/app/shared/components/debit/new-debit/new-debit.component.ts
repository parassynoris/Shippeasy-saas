import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
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
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FinanceService } from 'src/app/services/Finance/finance.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { SystemType } from 'src/app/models/system-type';
import { Invoice } from 'src/app/models/invoice';
import { CreditDebitNote } from 'src/app/models/New-payment';
import { PartyMasterData } from 'src/app/models/party-master';
import { Currency } from 'src/app/models/cost-items';

@Component({
  selector: 'app-new-debit',
  templateUrl: './new-debit.component.html',
  styleUrls: ['./new-debit.component.scss']
})
export class NewDebitComponent implements OnInit {
  newCredit: FormGroup;
  submitted = false;
  @Input() isType: any = 'add';
  baseBody: BaseBody = new BaseBody();
  @Output() CloseDebitSection = new EventEmitter<string>();
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
  @Output() CloseBillSection = new EventEmitter<string>();
  selectedBank: any;
  allBillData = shared.allBillData;
  creditData: any;
  currencyList: Currency[];
  paymentMode: SystemType[] = [];
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
  batchInvoiceList: Invoice[] = [];
  chargeItemList: CreditDebitNote[] = [];
  partyMasterList: PartyMasterData[];
  selectedInvoice: any;
  totalTaxAmt: number;
  totalTotAmt: number;
  tenantId: any;
  isTransport: boolean;
  constructor(
    private formBuilder: FormBuilder,
    private router: Router, private route: ActivatedRoute,
    private notification: NzNotificationService,
    private ProfilesService: ProfilesService,
    private vendorService: VendorService,private cognito : CognitoService,
    private _api: ApiService,
    private masterservice: MastersService,
    public apiService: ApiSharedService,
    private commonService: CommonService,
    private _cognit: CognitoService,
    private modalService: NgbModal,
    private _FinanceService: FinanceService,
    private commonfunction: CommonFunctions) {
    this.route.params?.subscribe(params =>
      this.urlParam = params

    );
    this.formBuild()
    this.isExport    = localStorage.getItem('isExport') === 'true' ? true : false; 
      this.isTransport = localStorage.getItem('isTransport') === 'true' ? true : false;

  }

  formBuild(data?) {

    this.newCredit = this.formBuilder.group({
      credit_note_no: [data ? data?.creditNoteNo : ''],
      credit_to: [data ? data?.debitToId : '', Validators.required],
      debit_from : [data ? data?.debitFromId : '', Validators.required],
      currency: [data ? data?.currency : '', Validators.required],
      credit_from: [data ? data?.moveNo : ''],
      bank_name: [data ? data?.bankId : '', Validators.required],
      amount: [data ? data?.amountReceived : ''],
      payment_mode: [data ? data?.paymentMode : '', Validators.required],
      payment_ref_no: [data ? data?.payment_ref_no : '', Validators.required],
      credit_note_date: [data ? data?.debitDate : ''],
      doc_file: [data ? '' : ''],
      comment: [data ? data?.remarks : ''],
      vessel: [data ? data?.vesselName : ''],
      voyage: [data ? data?.voyageNumber : ''],
      batch_no: [data ? data?.batchId : '', Validators.required],
      invoiceNo: [data ? data?.invoiceId : '', Validators.required],
      bl_no: [data ? data?.blNo : ''],
      move_no: [data ? data?.moveNo : '']
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
    if (this.isType === 'show') {
      this.newCredit.disable();
    } this.cognito.getUserDatails()?.subscribe((resp) => {
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
    var extension = this.file.name.substr(
      this.file.name.lastIndexOf('.')
    );
    const filename = this.file.name + extension
      const file = this.file;
      const formData = new FormData();
    formData.append('file', this.file, `${this.file.name}`);
    formData.append('name', `${this.file.name}`);
    this.commonService.uploadDocuments("debit" ,formData).subscribe();
    if (this.file !== undefined) {
      var certificateObj = {
         documentId: `${this.file.name}`,
        documentName:filename,
      };
    }



    let payload = {
      
        "tenantId": this.tenantId,
      "invoiceId": this.newCredit.get('invoiceNo').value,
      "debitDate": this.newCredit.get('credit_note_date').value || new Date(),
      "invoiceType": this.selectedInvoice?.invoiceType, 
      "remarks": this.newCredit.get('comment').value,
      "invoiceNumber": 
      this.batchInvoiceList?.filter((x)=> x?.invoiceId === this.newCredit.get('invoiceNo').value)[0]?.invoiceNo,
      
   

      "debitToId": this.newCredit.get('credit_to').value,
      "debitToName": this.partyMasterList?.filter((x)=> x?.partymasterId === this.newCredit.get('credit_to').value)[0]?.name,
      "debitFromId": this.newCredit.get('debit_from').value,
      "debitFromName" : this.partyMasterList?.filter((x)=> x?.partymasterId === this.newCredit.get('debit_from').value)[0]?.name ,

      "creditNoteNo":  this.selectedInvoice?.creditNoteNo,
      "isCredit": false,
      "amountReceived": this.newCredit.get('amount').value,
    
      "invoiceAmount": this.totalTotAmt?.toString() || '0',
      "invoiceTaxAmount": this.totalTaxAmt?.toString() || '0',
      "documents": [certificateObj],
      "paymentTerms": "",
      "costItems": this.chargeItemList,
      "bankId": this.selectedBank?.bankId,
      "bankName": this.selectedBank?.bankName,
      "bankType": "",
      "moveNo": Number(this.newCredit.get('move_no').value),
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
      "orgId": this.commonfunction.getAgentDetails().orgId,
    }

    if (this.urlParam.id) {

      this.commonService.UpdateToST(`creditdebitnote/${this.urlParam.id}`,{ ...payload, creditdebitnoteId: this.urlParam.id })
        ?.subscribe(
          (res: any) => {
            if (res) {
              this.notification.create(
                'success',
                'Update Successfully',
                ''
              );
              this.submitted = false
              this.router.navigate(['/finance/' + this.urlParam.key]);
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
              this.notification.create(
                'success',
                'Save Successfully',
                ''
              );
              this.submitted = false
              this.router.navigate(['/finance/' + this.urlParam.key]);
            }
          },
          (error) => {
            this.notification.create('error', error?.error?.error?.message, '');

          }
        );
    }
  }


  getCreditNote(id) {
    this.isEdit = true
    let payload = this.commonService.filterList()
    payload.query = {
      "creditdebitnoteId": id 
    }
    
    this.commonService.getSTList('creditdebitnote',payload)?.subscribe((data) => {
      this.creditData = data.documents;
      
      this.creditData = this.creditData[0]
      this.chargeItemList =  this.creditData?.costItems;
      this.checkedTot()
      this.getContainerData(this.creditData?.batchId)
      this.formBuild(this.creditData)
      this.filename = this.creditData?.documents[0]?.documentName
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
    this.batchData = this.batchList.find(x => x?.batchId === batchId)
    this.newCredit.patchValue({
      move_no: this.batchData?.moveNo,
      voyage: this.batchData?.quotationDetails?.voyageNumber,
      vessel: this.batchData?.quotationDetails?.vesselName,

    })
    let payload = this.commonService.filterList()
    payload.query = { batchId: batchId,
      "type": "sellerInvoice",
      "invoiceStatus": {
        "$in": [
          "Approved", "Completed", "Sent"
        ]
      },

    }
    
    this.commonService.getSTList('invoice',payload)?.subscribe((res: any) => {
      this.batchInvoiceList = res?.documents;
    });

  }
  getChargeDetails(id) {
    this.selectedInvoice = []
    this.selectedInvoice = this.batchInvoiceList.filter((x) => x?.invoiceId === id)[0]
    this.chargeItemList = this.selectedInvoice?.costItems
    this.calcuTaxAmt()
    this.calcTotalAmt()

  }
  checkedTot(){
    this.calcuTaxAmt()
    this.calcTotalAmt()
  }
  calcuTaxAmt() {
    this.totalTaxAmt = 0
    this.chargeItemList.map((x) => {
      if(x?.isSelected){
        this.totalTaxAmt += Number(this.calTotalTax(x))
      }
    })
  }
  calcTotalAmt() {
    this.totalTotAmt = 0
    this.chargeItemList.map((x:any) => {
      if( x?.excludeGst){  
        this.totalTotAmt += Number((Number(x?.exRateShippingLine) * Number(x?.rate) * Number(x?.quantity)).toFixed(2))
      }else{ 
        this.totalTotAmt += Number((Number(x?.selEstimates?.totalAmount)).toFixed(2))
      }

    })
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

