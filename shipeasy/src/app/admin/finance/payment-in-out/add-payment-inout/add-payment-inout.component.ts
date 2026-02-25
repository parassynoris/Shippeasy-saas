import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/services/common/common.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-add-payment-inout',
  templateUrl: './add-payment-inout.component.html',
  styleUrls: ['./add-payment-inout.component.scss']
})
export class AddPaymentInoutComponent implements OnInit {
  @Input() isType: any;
  @Input() isPaymentIn: any;
  @Input() paymentData: any;
  @Output() getList = new EventEmitter<any>()
  bankList:any = [];
  selectedCurrencyBank: string = '';
  submitted: boolean = false
  paymentMode: any = [];
  currentUser: any;
  isEdit: boolean = false
  idToUpdate: any;
  isExport: boolean;
  isImport: boolean;
  isTransport: boolean;
  paymentForm: FormGroup;
  constructor(private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private notification: NzNotificationService,
    private loaderService: LoaderService,
    private commonfunction : CommonFunctions
  ) { 
    this.getCustomerParty()
  
    this.getpaymentMode();
    this.formBuild()
    this.currentUser = this.commonfunction.getActiveAgent() 
    this.isEdit = this.isType == 'edit' ? true :false
    this.isExport = localStorage.getItem('isExport') === 'true' ? true : false;
    this.isImport = localStorage.getItem('isImport') === 'true' ? true : false;
    this.isTransport = localStorage.getItem('isTransport') === 'true' ? true : false;
    this.getBankList()
  }

  shippingLineForm: FormGroup;
  setWithdrawal(v){
    if(v){
      this.shippingLineForm.get('chequeStatus').setValue('Withdrawal')
    }else{
      if(this.paymentData?.chequeStatus){
        this.shippingLineForm.get('chequeStatus').setValue(this.paymentData?.chequeStatus)
      }else{
        this.shippingLineForm.get('chequeStatus').setValue('')
      }
      
    }
   
  }

  get f() { return this.shippingLineForm?.controls; }
  formBuild(data?) { 
    this.shippingLineForm = this.formBuilder.group({
      invoice : [data?.invoices ? data?.invoices?.split(',') || [] : [] ],
      customer: [data?.invoiceToId ? data?.invoiceToId : '',[Validators.required]],
      billFromBranch: [data?.invoiceFromBranch ? data?.invoiceFromBranch :'' ],
      paymentMode: [data?.paymentTypeId ? data?.paymentTypeId  :'',[Validators.required]],
      billNo: [data?.billNo ? data?.billNo :''],
      billDate: [data?.paymentDate ? data?.paymentDate || new Date()  : new Date(),[Validators.required]],
      chequeNo: [data?.chequeNo ? data?.chequeNo  :''],
      chequeDate: [data?.chequeDate ? data?.chequeDate || null  :null],
      chequeStatus: [data?.chequeStatus ? data?.chequeStatus  :''],
      withdrawalDate : [data?.withdrawalDate ? data?.withdrawalDate : null],
      remarks: [data?.remarks ? data?.remarks :''],
      paidAmount: [data?.paidAmount ? data?.paidAmount :'',[Validators.required,Validators.min(1)]],
      bank: [data?.bankId ? data?.bankId :''],
      documentName: [data?.document_name ? data?.document_name :''],
      paymentRefNo: [data?.paymentRefNo ? data?.paymentRefNo :''],
      tdsApplicable : [data?.tdsApplicable ? data?.tdsApplicable :false],
      tdsPer : [data?.tdsPer ? data?.tdsPer : 1],
      tdsAmount : [data?.tdsAmount ? data?.tdsAmount :''],
      netAmount: [data?.netAmount ? data?.netAmount :''],
    });
    if (data) {
      setTimeout(() => { 
        this.getListOfbillFrom(); 
       
      },1000);
    }
  }
  billFromBranchList:any=[]
  getListOfbillFrom(e?) {
    this.billFromBranchList = this.customerList?.find((x) => x?.partymasterId === this.shippingLineForm.controls['customer'].value)?.branch || []
  }
  getpaymentMode() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      "status": true,
      "typeCategory": {
        "$in": ['paymentMode', 'chargeType']
      }
    }
    this.commonService.getSTList('systemtype', payload)?.subscribe((res: any) => {
      this.paymentMode = res.documents?.filter(x => x?.typeCategory === "paymentMode");
    });
  }
 
  customerList: any = []
  getCustomerParty() {
    this.loaderService.showcircle();
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
      this.loaderService.hidecircle();
      this.customerList = res?.documents
      if (this.paymentData) { 
          this.getListOfbillFrom();  
          this.getInvoices()
      }
    })
  }
  private subscription: any;
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  ngOnInit(): void { 
   
    this.idToUpdate =  this.paymentData?.paymentId
    if(this.idToUpdate){
      this.paymentText = this.paymentData?.paymentType?.toLocaleLowerCase()
      this.formBuild(this.paymentData)
    }
    if(this.isType == 'show' || this.isType == 'edit'){
      this.shippingLineForm.disable()
    }
    if(this.idToUpdate && (this.paymentData.paymentType == 'Cheque' || this.paymentData.paymentType == 'cheque')){ 
      this.shippingLineForm.get('withdrawalDate').enable();
      this.shippingLineForm.get('chequeStatus').enable()
    }
    this.subscription = this.shippingLineForm.get('withdrawalDate')?.valueChanges.subscribe((value:any) => {
      this.setWithdrawal(value);
    });
    this.shippingLineForm.get('bank')?.valueChanges.subscribe((bankId) => {
      const selectedBank = this.bankList.find(bank => bank.bankId === bankId);
      this.selectedCurrencyBank = selectedBank?.currency || '';
    });
  }
  invoiceListCopy:any = [];
  invoiceList:any = [];
  getInvoices(){
    let payload = this.commonService.filterList()

    payload.query = { 
      billTo : this.f.customer.value,  
      invoiceStatus : 'Approved',
      // type : this.isPaymentIn ? 'sellerInvoice' : 'buyerInvoice',

      "$or": [  
        { "type": this.isPaymentIn ? 'sellerInvoice' : 'buyerInvoice' },
        { "category": this.isPaymentIn ? 'sellerInvoice' : 'buyerInvoice' },
      ],

      "$and": [
        {
          "isCreditNoteCreated": {
            "$ne": true
          }
        }
      ]
    }
  

    if(this.f.billFromBranch.value){
      payload.query = { 
        ...payload.query,
        invoiceFromBranchName : this.f.billFromBranch.value 
      }
    }
    this.commonService.getSTList('invoice', payload).subscribe((data) => {
      this.invoiceList = data?.documents 
      this.invoiceListCopy = data?.documents 
    })
  }
  paymentText:any ='' ;
  paymentChange(){
    this.paymentText = this.paymentMode.filter( (x) => x?.systemtypeId === this.shippingLineForm.get('paymentMode').value )[0]?.typeName?.toLowerCase() || '';
    
  }
  getBankList() { 
    this.loaderService.showcircle();
    let payload = this.commonService.filterList()
       this.loaderService.hidecircle();
    if (this.isPaymentIn) {
     let customerName = this.customerList?.filter(x => x?.partymasterId === this.f.customer.value)[0]?.name || '';
      payload.query = {
        isBank: true, status: true,
        partyName : customerName
      }
      if(!customerName){
        return
      }
    } else {
      if(payload?.query)payload.query = {
        parentId : this.currentUser?.agentId,
        status: true,
      }
      if(!this.currentUser?.agentId){
        return
      }
    } 
    this.commonService.getSTList('bank', payload)
      .subscribe((data) => {
        this.loaderService.hidecircle();
        this.bankList = data.documents;
      });
  }

  addPayment() {

  
   
    if(this.shippingLineForm.invalid){
      this.submitted =true;
      return 
    }else{
      
      if (this.file !== undefined) {
        const formData = new FormData();
        formData.append('file', this.file, `${this.file.name}`);
        formData.append('name', `${this.file.name}`);
        this.commonService.uploadDocuments('uploadfile', formData).subscribe();
        // this.commonService.uploadFile(this.file, this.filename, "reciept");
        this.shippingLineForm.value.documentName = `${this.file.name}`;
      }
  
  
  
      let paymentData = this.paymentMode.filter(
        (x) => x?.systemtypeId === this.shippingLineForm.get('paymentMode').value
      );

      
       
      const newInvoice = {
        ...this.paymentData,
        orgId: this.commonfunction.getAgentDetails().orgId,
        paymentTypeId: this.shippingLineForm.value.paymentMode, 
        paymentType: paymentData[0]?.typeName,
  
        billNo: this.shippingLineForm.value.billNo, 
        paymentRefNo: this.shippingLineForm.value.paymentRefNo, 
        paymentDate: this.shippingLineForm.value.billDate, 
        amount:  Number(this.shippingLineForm.value.paidAmount) || 0, 
  
        remitance_bankId:'',
        remitance_bank: '',
        beneficiary_bankId: '',
        beneficiary_bank: '' ,
  
        // invoice_partyId: this.shippingLineForm.value.customer,
        // invoice_party: recievedData[0]?.name,
        
        // recieved_from: recievedData[0]?.name,
        // recieved_fromId: this.shippingLineForm.value.recieved_from,.



        "invoiceToId": this.shippingLineForm.value.customer || '',
        "invoiceToName": this.customerList?.filter(x => x?.partymasterId === this.shippingLineForm.value.customer)[0]?.name || '',
        "invoiceFromId": this.shippingLineForm.value.customer,
        "invoiceFromName": this.customerList?.filter(x => x?.partymasterId === this.shippingLineForm.value.customer)[0]?.name || '',
  
        "invoiceFromBranch": this.shippingLineForm.value.billFromBranch,
        "invoiceFromBranchName": this.shippingLineForm.value.billFromBranch,

        invoices : this.shippingLineForm.value.invoice?.toString(),
        batchNo: '',
        batchId:'',
        // invoice_no: this.shippingLineForm.value.invoice_no,
        "remarks": this.shippingLineForm.value.remarks, 
        currencyId: this.currentUser?.currency?.currencyId,
        currency:this.currentUser?.currency?.currencyCode?.toUpperCase(),
        // move_no: this.batchDetails ? this.batchDetails.moveNo : this.shippingLineForm.value.move_no,
        isExport: (this.isExport || this.isTransport),
        // payment_status: this.shippingLineForm.value.payment_status || '',
        document_name: this.shippingLineForm.value.documentName,
        document_tag: this.shippingLineForm.value.documentName,
        // cheque_amount: this.shippingLineForm.value.cheque_amount?.toString(),
        upload_document: this.shippingLineForm.value.documentName,
        filename: this.shippingLineForm.value.documentName,
        status: true,
        "isDraft": false,
        "tenantId": "1",
        "bankId" : this.shippingLineForm.value.bank,
        "bankName": this.bankList?.filter((x)=> x?.bankId ===  this.shippingLineForm.value.bank)[0]?.bankName || '',
        invoiceData:   this.invoiceListCopy
        ?.filter((x) => this.shippingLineForm.value.invoice?.includes(x?.invoiceNo))
        .map((x) => ({
          invoiceId: x?.invoiceId || "",  
          invoiceNo: x?.invoiceNo || " ",  
        })) ||[],

        batchData: [
          ...Array.from(
            new Map(
              ( this.invoiceListCopy?.filter((x :any)=> this.shippingLineForm.value.invoice?.includes(x?.invoiceNo )) || []).map((x :any)=> [
                x?.batchId || "", 
                { 
                  batchNo: x?.batchNo || "" ,
                  batchId: x?.batchId || ""
                }
              ])
            ).values()
          ),
          ...this.invoiceListCopy
            ?.filter((x :any)=> this.shippingLineForm.value.invoice?.includes(x?.invoiceNo))
            .flatMap((x :any)=> x.batchArray || [])
        ],

        paymentStatus : 'Completed',
        chequeDate: this.shippingLineForm.value.chequeDate ||'',
        chequeStatus : this.shippingLineForm.value.chequeStatus ||'',
        withdrawalDate : this.shippingLineForm.value.withdrawalDate || '',
        chequeNo: this.shippingLineForm.value.chequeNo,
        // onAccountValue: this.onAccountValue?.toString() || '',
        // onAccountRemark: this.onAccountRemark || '',
        // onAccountTdsAmt: this.onAccountTdsAmount?.toString() || '0',
        // onAccountYear: this.onAccountTdsYear || '',
        // invoiceAmountPaid : Number(this.finalTotal) || 0,
        // invoiceAmount : Number(this.totalInvoiceValue) || 0,
  
        discount : this.shippingLineForm.value.discount|| 0, 
        tds : this.shippingLineForm.value.tds|| 0, 
        invoiceAmount : Number(this.shippingLineForm.value.paidAmount) || 0,
        invoiceTaxAmount:  Number(this.invoiceTaxAmount) || 0,
        paidAmount : Number(this.shippingLineForm.value.paidAmount) || 0,
        balanceAmount : 0,
        transactionType : this.isPaymentIn ? 'Payment In' : 'Payment Out',
        amountType : this.isPaymentIn ? 'Credit' : 'Debit',
        stateOfSupply : '', 
        stateOfSupplyName:  '', 
         "costItems": [],
        type : this.isPaymentIn ? 'sellerInvoice' : 'buyerInvoice',
        tdsApplicable : this.shippingLineForm.value.tdsApplicable|| false, 
        tdsAmount : Number(this.shippingLineForm.value.tdsAmount) || 0,
        tdsPer : Number(this.shippingLineForm.value.tdsPer) || 0,
        netAmount : this.shippingLineForm.value.tdsApplicable ?  Number(this.shippingLineForm.value.netAmount) || 0 : Number(this.shippingLineForm.value.paidAmount) || 0,
      };

       
      if (this.idToUpdate) {
        this.commonService.UpdateToST(`payment/${this.idToUpdate}`, { ...newInvoice, paymentId: this.idToUpdate, paymentNo: this.paymentData?.paymentNo }).subscribe(
          (data: any) => {
            if (data) { 
              this.notification.create('success', 'Update Successfully', '');
              this.getList.emit(data);
              this.cancel()
              this.invoiveUpdate(data)
            }
          },
          (error) => {
            this.notification.create('error', error?.error?.error?.message, '');
  
          }
        );
      } else {
        this.commonService.addToST('payment', newInvoice).subscribe((data: any) => {
          if (data) { 
            this.notification.create('success', 'Saved Successfully', '');
            this.getList.emit(data);
            this.cancel()
            this.invoiveUpdate(data)
          }
        }, (error) => {
          this.notification.create('error', error?.error?.error?.message, '');
        })
      }

    }
  }
  invoiveUpdate(res){
    let dataUpdate = []
    let paidAmount = this.f.paidAmount.value 
    this.invoiceList?.filter((x) => {
      if(this.f.invoice.value.includes(x?.invoiceNo)){
        if(paidAmount > 0){
        let balanceAmount = Number(x?.balanceAmount?.toFixed(0))
        let paidValue = 0
        let paymentStatus = false
        if((paidAmount - Number(x?.balanceAmount?.toFixed(0))) >= 0){
          paymentStatus = true
          paidAmount =  paidAmount - Number(x?.balanceAmount?.toFixed(0))
          paidValue = Number(x?.balanceAmount?.toFixed(0))
          balanceAmount = 0
        }else{
          paymentStatus = false
          balanceAmount = Number(x?.balanceAmount?.toFixed(0)) - paidAmount
          paidValue = paidAmount
          paidAmount = paidAmount - Number(x?.balanceAmount?.toFixed(0)) 
        }
        
        dataUpdate.push({
          ...x,
          paymentModeId: res.paymentTypeId || '', 
          paymentMode: res?.paymentType || '',
          paidAmount : Number(Number(paidValue + x?.paidAmount)?.toFixed(0)) || 0,
          balanceAmount : Number(Number(balanceAmount)?.toFixed(0)) || 0 ,
          paymentStatus : paymentStatus ? 'Paid' : 'Partially Paid'
        })

        if(x.creditInvoiceId){
          dataUpdate.push({
            invoiceId : x.creditInvoiceId,
            invoiceNo : x.creditInvoiceNo,
            paymentModeId: res.paymentTypeId || '', 
            paymentMode: res?.paymentType || '',
            paidAmount : Number(Number(paidValue + x?.paidAmount)?.toFixed(0)) || 0,
            balanceAmount : Number(Number(balanceAmount)?.toFixed(0)) || 0 ,
            paymentStatus : paymentStatus ? 'Paid' : 'Partially Paid'
          })
        }
        
          
      }
      }
    })
    if (dataUpdate.length > 0) {
      this.commonService.batchUpdate('invoice/batchupdate',  dataUpdate ).subscribe();
    }
  }
  checkPaidAmount(){
    // if(this.f.invoice.value.length == 0){
    //   this.notification.create('error', 'Please select invoice', '');
    //   return
    // }
    // if( !this.idToUpdate){
    // if(this.f.paidAmount.value > this.totalInvoiceAmount){
    //   this.f.paidAmount.setValue(this.totalInvoiceAmount?.toFixed(0))
    //   this.notification.create('error', 'Paid/Received amount should be equal to the invoice amount.', '');
    // }
    this.calcuNetAmt()
  // }
  }
  totalInvoiceAmount=0;
  invoiceTaxAmount:number = 0;
  calacAmount(){ 
    if(this.idToUpdate){
      return
    }
      this.totalInvoiceAmount = 0;
      this.invoiceList?.forEach(element => { 
        if(this.f.invoice.value.includes(element?.invoiceNo)){  
          this.invoiceTaxAmount += ( Number(element?.invoiceTaxAmount || 0))
          this.totalInvoiceAmount +=( Number(element?.balanceAmount || 0) + Number(element?.tdsAmount || 0) )
        }
      });
      this.f.paidAmount.setValue(this.totalInvoiceAmount?.toFixed(0))
      this.calcuNetAmt()
    
  }
  calcuTDSAmt(){
    if(this.f.tdsApplicable.value){
      // this.f.tdsAmount.setValue((this.f.paidAmount.value * this.f.tdsPer.value / 100)?.toFixed(0) )
      this.f.netAmount.setValue((this.f.paidAmount.value - this.f.tdsAmount.value)?.toFixed(0))
    }
  }
  calcuNetAmt(){
    if(this.f.tdsApplicable.value){
      this.f.tdsAmount.setValue((this.f.paidAmount.value * this.f.tdsPer.value / 100)?.toFixed(0) )
      this.f.netAmount.setValue((this.f.paidAmount.value - this.f.tdsAmount.value)?.toFixed(0))
    }
  }
  cancel() {
    this.modalService.dismissAll()
   
  }
  filename: any;
  file: any;
  extension: any;
  selectFile(event) {
    let filename = event.target.value.replace('C:\\fakepath\\', '');
    this.extension = filename.substr(filename.lastIndexOf('.'));
    this.filename = event.target.files[0].name;
    this.file = event.target.files[0];
  }

  documentPreview(doc) {
    this.commonService.downloadDocuments('downloadfile', doc).subscribe(
      (res: Blob) => {
        const fileType = doc.split('.').pop().toLowerCase(); // Get file extension
        const blob = new Blob([res], { type: `application/${fileType}` }); // Set blob type based on file extension
        const temp = URL.createObjectURL(blob);
        
        if (fileType === 'pdf') {
          const pdfWindow = window.open(temp);
          // pdfWindow.print();
        } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(fileType)) {
          // Handle image preview
          const img = document.createElement('img');
          img.src = temp;
          const imgWindow = window.open('');
          imgWindow.document.write('<html><body style="margin:0; text-align:center;"></body></html>');
          imgWindow.document.body.appendChild(img);
        } else {
          // Download other file types
          const link = document.createElement('a');
          link.href = temp;
          link.setAttribute('download', doc);
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      },
      (error) => {
        console.error('Document preview error', error);
      }
    );
  }

  readonly nzFilterOption = (): boolean => true;
  search(e) {
    if (e) {
      const text1 = e.trim();
      const regex = new RegExp(text1, 'i');

      this.invoiceList = this.invoiceListCopy.filter(batch =>
        regex?.test(batch.batchNo) ||
        regex?.test(batch.hblName) ||
        regex?.test(batch.mblName) || 
        regex?.test(batch.invoiceNo)
      );
    } else {
      this.invoiceList = this.invoiceListCopy
    }


  }
}
