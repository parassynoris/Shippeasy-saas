import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as Constant from 'src/app/shared/common-constants';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FinanceService } from 'src/app/services/Finance/finance.service';
import { ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import * as XLSX from "xlsx";
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { ApiSharedService } from 'src/app/shared/components/api-service/api-shared.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { DatePipe } from '@angular/common';
import { format, parseISO } from 'date-fns'
import { ApiService } from 'src/app/admin/principal/api.service';
import * as xml2js from 'xml-js';
import { saveAs } from 'file-saver';
import { CommonService } from 'src/app/services/common/common.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
@Component({
  selector: 'app-principle-bill',
  templateUrl: './principle-bill.component.html',
  styleUrls: ['./principle-bill.component.css']
})
export class PrincipleBillComponent implements OnInit {

   @Input() isparent: any;
  @Input() isFinanceInvoice: boolean;
  closeResult: string;
  invoiceData = [];
  urlParam: any;
  currentUrl: string;
  toalLength: number ;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  invoice_no: string;
  invoice_date: string;
  invoice_duedate: string;
  invoice_to: string;
  payment_terms: string;
  amount: string;
  status: string;
  invoiceStatus: string;
  filterBody = this.apiService.body;
  filterBody1 = this.apiService.bodyNew;
  batchList: any;
  costItemList: any[];
  totalAmount = 0
  taxAmount = 0
  billAmount = 0
  activeRoute: any = '';
  invoice_type: any;
  viewEdit: boolean = false;
  globalSearch: string;
  Documentpdf:any;
  isGenerateSOA:boolean = false;
  selectedPrincipleBills:any = [];
  containers:any=[];
  basecontentUrl: string;
  isExport: boolean = false;
  creditNote: string;
  userData: any;
  _gc=GlobalConstants;
  @ViewChild(MatDrawer) drawer: MatDrawer | any;
  dataSource = new MatTableDataSource();
  pagenation = [10,20, 50, 100];
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns =[
    '#',
   'invoiceNo',
   'invoiceTypeStatus',
   'invoiceToName',
   'invoice_date',
   'invoiceDueDate',
   'paymentTerms',
   'invoiceAmount',
    'statusOfinvoice',
    'action', 
  ]; 
  isShow: boolean = false;
  constructor(public router: Router,
    public commonService: CommonService,
    public commonfunction: CommonFunctions,
    private route: ActivatedRoute,
    private _FinanceService: FinanceService,
    public modalService: NgbModal,
    public _api: ApiService,
    private apiService: ApiSharedService,
    public cognito : CognitoService,
    public notification: NzNotificationService,
    public loaderService: LoaderService,) {
    this.route.params?.subscribe(params =>
      this.urlParam = params
    ); 
    this.isShow = this.urlParam?.access == 'show' ? true : false;;
    this.isExport = localStorage.getItem('isExport') === 'false' ? false : true;

  }

  onSelectCheckBoxBills(e){

    if(e.target.checked){
      this.selectedPrincipleBills.push(e.target.value)

    }
    else{
      
      const index = this.selectedPrincipleBills.findIndex(i => i === e.target.value);
      
      this.selectedPrincipleBills.splice(index, 1);

    }
    
  }

  detectionInvoice() {
    this.viewEdit = false;
    this.commonfunction.invoiceDisabled = false;
    this.router.navigate(['/batch/list/add/' + this.urlParam.id + '/' + this.urlParam.key + '/adddetention'])
  }
  onOpenInvoice() {
    this.viewEdit = false;
    this.commonfunction.invoiceDisabled = false;
    this.router.navigate(['/batch/list/add/' + this.urlParam.id + '/' + this.urlParam.key + '/add'])
  }

  onCloseNew() {
    this.router.navigate(['/batch/list/add/' + this.urlParam.id + '/' + this.urlParam.key])
  }

  onEditInvoice(id, invoiceType, view?) {
    this.viewEdit = view;
    this.commonfunction.invoiceDisabled = view;
    if (invoiceType === 'Periodic Invoice' || invoiceType === 'Lumpsum Invoice') {
      this.router.navigate(['/batch/list/add/' + this.urlParam.id + '/' + this.urlParam.key + '/' + id + '/editdetention'])
    } else {
      this.router.navigate(['/batch/list/add/' + this.urlParam.id + '/' + this.urlParam.key + '/' + id + '/edit'])
    }
  }

  ngOnInit(): void {
    this.cognito.getagentDetails()?.subscribe((resp) => {
      if (resp != null) {
        this.userData  = resp
      }
    }) 
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();
    this.getInvoiceList();
    this.getBatchDetail();
    this.getContainers();
  }

  getInvoiceList() {
    this.loaderService.showcircle();
    let payload = this.commonService.filterList()

    if(payload?.query)payload.query = {
      'batchId': this.urlParam.id,
      'principleBill' : true
    }
    if(payload?.from)payload.from = this.page - 1;
    if(payload?.size)payload.size  = Number(this.size);
    if(payload?.sort)payload.sort ={
      desc : ["updatedOn"]
    } 
    this.commonService.getSTList('invoice',payload)?.subscribe((data) => {
      this.invoiceData = data.documents;
      this.toalLength = data.totalCount;
      this.count = data.documents.length;
      this.dataSource = new MatTableDataSource(
        data?.documents?.map((s: any,index) => {
          return{
            ...s,
            id:index+1
          }
        })
      );
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort1;
      this.loaderService.hidecircle();
    },()=>{
      this.loaderService.hidecircle();
    })
  }

  convertDate(e) {
    var date = new Date(e)
    return format(date, "dd-MM-yyyy")

  }
  batchData:any;

  getBatchDetail() {

    let payload = this.commonService.filterList()

    if(payload?.query)payload.query = {
      "batchId": this.route.snapshot.params['id'],
      "isExport": localStorage.getItem('isExport')=='true'?true:false
    }

    this._api.getSTList(Constant.BATCH_LIST, payload)
      ?.subscribe((data: any) => {
        this.batchData = data.documents[0]


      });


  }

  getRandomNumber() {
    const randomNumber = Math.floor(Math.random() * 100000);
    const formattedNumber = randomNumber.toString().padStart(5, '0'); 
    return formattedNumber;
  }

  getContainers(){
    let payload = this.commonService.filterList()

    if(payload?.query)payload.query = {
      "batchId": this.route.snapshot.params['id']
    }
    this._api
      .getSTList(Constant.CONTAINER_LIST, payload)
      ?.subscribe((data: any) => {
        data.documents.forEach((container) => {
          this.containers.push(container.containerNumber)
        })
      })
  }



  generateSOA(){
    this.isGenerateSOA = true
    if(this.selectedPrincipleBills){

      let refs = []
      let invoicesArray=[]
      let invoiceBatchUpdateBody = []
      const currentYear = new Date().getFullYear();
      const yearRange = `${currentYear.toString().slice(2)}-${(currentYear + 1).toString().slice(2)}`;
      let costItemsArray = []
      let totalExps = 0
      let cgstAmt = 0
      let sgstAmt = 0
      let totalAllCharges = 0
      let paymentInFc=0
      let invoiceObj = {}
      this.invoiceData.forEach(el=>{
        let filterArr = this.selectedPrincipleBills.filter(e=>e ==el?.invoiceId)
        
        if(filterArr?.length > 0){
          
        invoiceObj['invoiceFromId'] = el?.invoiceFromId
        // previous code might be needed in future 
        // invoiceObj['costItems'] = el?.costItems
        // let totalExps = 0
        // let cgstAmt = 0
        // let sgstAmt = 0
        // let totalAllCharges = 0
        // let paymentInFc=0
       

        el?.costItems.forEach(item=>{
          if(item?.batchId)
          delete item?.batchId
          item.accountBaseCode = typeof item?.accountBaseCode === 'string' ? item?.accountBaseCode : item?.accountBaseCode.toString()
          item.accountBaseCode = typeof item?.moveNumber === 'string' ? item?.moveNumber : item?.moveNumber.toString()

          cgstAmt += (item?.gst/2)*parseInt(item?.amount) + parseInt(item?.amount)
          sgstAmt += (item?.gst/2)*parseInt(item?.amount) + parseInt(item?.amount)
          totalAllCharges += item?.totalAmount
          paymentInFc += (totalAllCharges*item?.rate)
          totalExps += parseInt(item?.amount)
          // costItemsArray.push(item)
          costItemsArray.push(item)
        })

        invoiceObj['gstType'] = el?.gstType
        invoiceObj['invoiceId'] = el?.invoiceId
        invoiceObj['invoiceNo'] = el?.invoiceNo
        invoiceObj['totalExps'] = totalExps
        invoiceObj['cgstAmt'] = cgstAmt
        invoiceObj['sgstAmt'] = sgstAmt
        invoiceObj['totalAllCharges'] = totalAllCharges
        invoiceObj['paymentInFc'] = paymentInFc
        invoiceObj['invoiceDate'] = this.convertDate(new Date())
        // Added New
        invoiceObj['costItems'] = costItemsArray
        if(this.selectedPrincipleBills.includes(el?.invoiceId))
        {if(el?.invoiceTypeStatus.includes('Tax')) refs.push('A'+ this.getRandomNumber())
        if(el?.invoiceTypeStatus.includes('Reimbursement')) refs.push('RA'+ this.getRandomNumber())
        if(el?.invoiceTypeStatus.includes('Journal')) refs.push('JV'+ this.getRandomNumber())
        invoicesArray.push(invoiceObj)}
        invoiceBatchUpdateBody.push({el})
        }
      })

      this.batchData['SOApdfUrl'] = ""
      this.batchData['containerNumbers'] = this.containers
      this.batchData['vendorRef'] = yearRange+'/'+refs.join('/')
      this.batchData['soaInvoices'] = []
      this.batchData.soaInvoices = invoiceObj

      this._api.UpdateToST(`${Constant.UPDATE_BATCH}/${this.batchData?.batchId}`, this.batchData)?.subscribe(
        (res: any) => {
        },
        (error) => {
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );

      let ids = { "parameters": { "batchID": this.batchData?.batchId } };
      let url='soaRep'
      let newInvoiceObj= {}
      // this.commonService.pushreports(ids,url)?.subscribe({
      //   next: (res: any) => {
      //     const blob = new Blob([res], { type: 'application/pdf' });
      //     let temp = URL.createObjectURL(blob);
      //     this.Documentpdf = temp;
      //     newInvoiceObj['date'] = this.convertDate(new Date())
      //     newInvoiceObj['s3Url'] = this.Documentpdf
      //     newInvoiceObj['fileName'] = "principalBill.pdf"
      //     var a = document.createElement('a');
      //     a.href = this.Documentpdf;
      //     a.download = "principalBill.pdf";
      //     document.body.appendChild(a);
      //     a.click();
      //   }
      // })

      this.invoiceData.forEach(el=>{
        let filterArr = this.selectedPrincipleBills.filter(e=>e ==el?.invoiceId)
        if(filterArr){
          el.soaGenerated = this.selectedPrincipleBills.includes(filterArr[0]?.invoiceId) ? true : false
          el.soaDetails = newInvoiceObj
          el.vendorRef = yearRange+'/'+refs.join('/')
        invoiceBatchUpdateBody.push({el})
        }
      })

      this.commonService.batchUpdate('invoice/batchupdate',invoiceBatchUpdateBody)?.subscribe(
        (res: any) => {
          if (res) {

          }
        },
        (error) => {
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );

    }
  }

  next() {
    if (this.toalLength > this.count) {
      this.getPaginationData('next')
    }
  }

  prev() {
    if (this.page > 0) {
      this.getPaginationData('prev')
    }
  }

  filter(e) {
    this.size = e.target.value;
    this.fromSize = 1;
    this.getInvoiceList()
  }

  getPaginationData(type: any) {
    this.fromSize = type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
    

    let payload = this.commonService.filterList()

    payload.query = {
      'batchId': this.urlParam.id,
      'principleBill' : true
    }
    payload.from = this.fromSize - 1,
    payload.size  = Number(this.size);
    payload.sort ={
      desc : ["updatedOn"]
    } 
    this.commonService.getSTList('invoice',payload)?.subscribe(data => {
      this.invoiceData = data.documents;
      this.toalLength = data.totalCount;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count = type === 'prev' ? this.toalLength === this.count ? this.count - (this.toalLength % Number(this.size)) : this.count - data.documents.length : this.count + data.documents.length
    })
  }


  search() {
    let mustArray = {};
    mustArray['principleBill']  =true
    mustArray['batchId']  =this.urlParam.id
  
    if (this.invoice_no) {
      mustArray['invoiceNo'] = {
        "$regex" : this.invoice_no,
        "$options": "i"
    }
    }

    if (this.invoice_date) {
      mustArray['invoice_date']= {
        "$gt" : this.invoice_date.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.invoice_date.substring(0, 10) + 'T23:59:00.000Z'
    }
  }
    if (this.creditNote) {
      mustArray['creditNote'] = {
        "$regex" : this.creditNote,
        "$options": "i"
    }
    }
    if (this.invoice_duedate) {
      mustArray['invoiceDueDate']= {
        "$gt" : this.invoice_duedate.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.invoice_duedate.substring(0, 10) + 'T23:59:00.000Z'
    }
  }
    if (this.invoice_to) {
      mustArray['invoiceToName'] = {
        "$regex" : this.invoice_to,
        "$options": "i"
    }
    }
    if (this.payment_terms) {
      mustArray['paymentTerms'] = {
        "$regex" : this.payment_terms,
        "$options": "i"
    }
    }
    if (this.amount) {
      mustArray['invoiceAmount'] = {
        "$regex" : this.amount,
        "$options": "i"
    }
    }
    if (this.invoiceStatus) {
      mustArray['statusOfinvoice'] = {
        "$regex" : this.invoiceStatus,
        "$options": "i"
    }
    }
    if (this.status) {
      mustArray['status'] = {
        "$regex" : this.status,
        "$options": "i"
    }
    }
    if (this.invoice_type) {
      mustArray['invoiceTypeStatus'] = {
        "$regex" : this.invoice_type,
        "$options": "i"
    }
    }


    let payload = this.commonService.filterList()
    payload.query = mustArray
    payload.size = Number(this.size),
    payload.from = 0,
    payload.sort = {  "desc" : ['updatedOn'] }
    
    this.commonService.getSTList('invoice',payload)?.subscribe((data) => {
      this.invoiceData = data.documents?.map((s: any,index) => {
        return{
          ...s,
          id:index+1
        }
      });
      this.toalLength = data.totalCount;
      this.count = data.documents.length
      this.fromSize =1
    })
  }

  clear() {
    this.creditNote = ''
    this.invoice_no = ''
    this.invoice_date = ''
    this.invoice_duedate = ''
    this.invoice_to = ''
    this.payment_terms = ''
    this.amount = ''
    this.invoice_type = ''
    this.invoiceStatus = ''
    this.status = ''
    this.getInvoiceList()
  }

  delete(deleteInvoice, id) {
    this.modalService
      .open(deleteInvoice, {
        backdrop: 'static',
        keyboard: false,
        centered: true,
        size: '',

        ariaLabelledBy: 'modal-basic-title',
      })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
          if (result === 'yes') {
            let data = `invoice/${id}`

            this.commonService.deleteST(data)?.subscribe((res: any) => {
              if (res) {
                this.notification.create(
                  'success',
                  'Deleted Successfully',
                  ''
                );
                setTimeout(() => {
                  this.getInvoiceList()
                  this.modalService.dismissAll()
                  }, 500);

              }
            });
          }
        }, (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }
  public getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
  removeRow(content1) {
    this.modalService.open(content1, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'sm',
      ariaLabelledBy: 'modal-basic-title'
    })
  }
  onClose() {
    this.router.navigate(['/' + this.isparent + '/list']);
  }

  xmlString:any =''
  tankData:any=[]
  generateEDI(){
    let invoice = this.invoiceData.filter(x=> x.invoiceId === this.batchData?.soaInvoices?.invoiceId)
    

    let containers = this.batchData?.containerNumbers

    const data1 = [
      ...this.batchData.soaInvoices.costItems
  ];
  const groupedData = {};
  data1.forEach(item => {
      const containerNumbers = item.containerNumber;
      containerNumbers.forEach(containerNumber => {
          if (!groupedData[containerNumber]) {
              groupedData[containerNumber] = [];
          }
          groupedData[containerNumber].push({
            ChargeCode: '',
            ChargeAmount:item.amount* item.exRateShippingLine,
            TaxAmount:item.tax[0]?.taxAmount / item.containerNumber?.length,
            ServiceDate:'',
            VendorType:'',
            Text:item.costItemName,
          });
      });
  });
  let obj = []
  let arr = Object.keys(groupedData)
    arr.forEach((element,index)=>{
      obj.push({containerNumber:arr[index] , data:groupedData[arr[index]]})
    })
  let finalData = []

  obj.forEach(element=>{
    let containerBasedCharge = {
            TankNumber : element.containerNumber,
            ChargeforTank:[
              ...element.data
            ] 
          }
          finalData.push(containerBasedCharge)  
  })
  
     const data = {
       Record: {
         VendorID: 'JMBAXI',
         Supplier: '',
         Invoice : {
           VendorRef:this.batchData?.vendorRef,
           Currency:this.batchData?.currencyName,
           InvoiceDate:this.formatdate(this.batchData?.soaInvoices?.invoiceDate),
           OfficeCode:'',
           Text:'',
           TotalAmount:this.batchData?.soaInvoices?.totalAllCharges,
           InvoiceURL:this.batchData?.soaInvoices?.SOApdfUrl,
         },
         Move:{
           MoveNumber:this.batchData?.moveNo,
           TankonMove:[... finalData]
         }
       },
     };
     const options = { compact: true, ignoreComment: true, spaces: 4 };
     this.xmlString = xml2js.js2xml(data, options);
     const blob = new Blob([this.xmlString],{type:'text/plain;charset=utf-8'});
     saveAs(blob, 'JMBAXI_SOAInvoiceEDI'+'.xml');
   }
   formatdate(data1){
    let data = data1.replace(/-/g,'')
    let year = data.slice(4,8)
    let month = data.slice(2,4)
    let date = data.slice(0,2)
    return `${year}${month}${date}`
    
   }


   printEmailData(data) {
    let reportpayload :any;
    let url :any;
   
    if(data?.invoiceTypeStatus === "Tax Invoice"){
      reportpayload = { "parameters": { "invoiceID": data?.invoiceId } };
      url='agencyInvoice';
   }  else if(data?.invoiceTypeStatus === "Reimbursement Invoice"){
    reportpayload = { "parameters": { "invoiceId": data?.invoiceId } };
    url='Reimbursement'} else if(data?.invoiceTypeStatus === "Journal Voucher"){
        reportpayload = { "parameters": { "invoiceID": data?.invoiceId } };
        url='journalVoucher'
      } else{
        this.notification.create('error', 'Email not Send', '');
        return false;
      }

      this.commonService.pushreports(reportpayload,url)?.subscribe({
        next: (res: any) => {
          const blob = new Blob([res], { type: 'application/pdf' });
          const reader = new FileReader();
          reader.onload = () => {
            const base64String = reader.result as string;
            let baseContent = base64String.split(",");
            this.basecontentUrl = baseContent[1];
            this.mail(data , this.basecontentUrl, url)
          };
          reader.readAsDataURL(blob)
        }
      })
    
  }

  mail(data , bloburl?,reportName?) {
    // let fileName = reportName +'.pdf'
    // let attachment = [{ "content": bloburl, "name": fileName }]

    // if (data?.statusOfinvoice === 'Pending') {
    //   this.notification.create('error', 'Invoice status is pending', '');
    //   return false
    // }
    let userData = this.userData
  

    let payload = this.commonService.filterList()

    payload.query = {
      "partymasterId": data?.invoiceToId
    }

    this.commonService.getSTList("partymaster", payload)?.subscribe((res) => {
      let emaildata = `
      ${'Total Invoice Amout :'} : ${data?.invoiceAmount}
      ${'Invoice Due Date :'} : ${data?.invoiceDueDate}  `

      let payload = {
        sender: {
          name: userData?.userName,
              email: userData.userEmail
        },
        to: [{
          name: data?.paymentFromName,
          email: res.documents[0].primaryMailId,
        }],
        // "attachment": attachment,
        textContent: `${emaildata}`,
        subject: "Invoice Details",
      }
      this.apiService.sendEmail(payload)?.subscribe(
        (result) => {
          if (result.status == "success") {
            this.notification.create('success', 'Email Send Successfully', '');
          }
          else {
            this.notification.create('error', 'Email not Send', '');
          }
        }
      );
    });

  }

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.invoiceData.forEach((row: any) => {
      storeEnquiryData.push({
        'Inquiry No': row.invoiceNo,
        'invoice Type': row.invoiceType,
        'invoice To': row.invoiceToName,
        'invoice Date': this.commonService.formatDateForExcelPdf(row.invoice_date) ,
        'Due Date':  this.commonService.formatDateForExcelPdf(row.invoiceDueDate) ,
        'payment Terms': row.paymentTerms,
        'invoice Amount': row.invoiceAmount,
        'Status': row.statusOfinvoice,
        'Receipt No': '',
        'Credit Note No': '',
        'Hold Posting': row.holdPosting,

      });
    });
    const myworksheet: XLSX.WorkSheet =
      XLSX.utils.json_to_sheet(storeEnquiryData);
    const myworkbook: XLSX.WorkBook = {
      Sheets: { data: myworksheet },
      SheetNames: ['data'],
    };


    const fileName = 'invoice.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }
  downloadFile1(x) {
    let excel = [x]

    const myworksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excel);
    const myworkbook: XLSX.WorkBook = {
      Sheets: { data: myworksheet },
      SheetNames: ["data"],
    };


    const fileName = "Invoice.xlsx";
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  downloadFile(e) {
    var prepare=[];
      var tempObj =[];
      tempObj.push(e.invoiceNo);
      tempObj.push(e.invoiceType);
      tempObj.push(e.invoiceToName);
      tempObj.push( this.commonService.formatDateForExcelPdf(e.invoice_date));
      tempObj.push( this.commonService.formatDateForExcelPdf(e.invoiceDueDate));
      tempObj.push(e.paymentTerms);
      tempObj.push(e.invoiceAmount);
      tempObj.push(e.statusOfinvoice);
      prepare.push(tempObj);
    const doc = new jsPDF('p', 'mm', [450, 400]);
    autoTable(doc,{
        head: [['Invoice No','Invoice Type','Invoice To','Invoice Date','Due Date','Payment Terms','Amount','Status','Receipt No','Credit Note No']],
        body: prepare
    });
    doc.save('invoice' + '.pdf');
  }
  openPDF() {
    var prepare=[];
    this.invoiceData.forEach(e=>{
      var tempObj =[];
      tempObj.push(e.invoiceNo);
      tempObj.push(e.invoiceType);
      tempObj.push(e.invoiceToName);
      tempObj.push( this.commonService.formatDateForExcelPdf(e.invoice_date));
      tempObj.push(  this.commonService.formatDateForExcelPdf(e.invoiceDueDate));
      tempObj.push(e.paymentTerms);
      tempObj.push(e.invoiceAmount);
      tempObj.push(e.statusOfinvoice);
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [450, 400]);
    autoTable(doc,{
        head: [['Invoice No','Invoice Type','Invoice To','Invoice Date','Due Date','Payment Terms','Amount','Status','Receipt No','Credit Note No']],
        body: prepare
    });
    doc.save('invoice' + '.pdf');
  }

  clearGloble() {
    this.globalSearch = '';
    this.clear()
  }
  searchGlobal() {
    let query = this.globalSearch
    let shouldArray = [];
    shouldArray.push(
      {"invoiceNo": {  "$regex": query ,"$options": "i"  } },
      { "invoiceTypeStatus": {  "$regex": query ,"$options": "i" } },
      { "invoiceToName": {  "$regex": query  ,"$options": "i"  } },
      { "invoice_date": {  "$regex": query  ,"$options": "i"  } },
      { "invoiceDueDate": {  "$regex": query  ,"$options": "i"  } },
      { "paymentTerms": {  "$regex": query  ,"$options": "i"  } },
      { "invoiceAmount": {  "$regex": query  ,"$options": "i"  } },
      { "statusOfinvoice": {  "$regex": query  ,"$options": "i"  } }
     )


    let payload = this.commonService.filterList()

    payload.query = {
      'batchId': this.urlParam.id,
      "$or": shouldArray,
      principleBill : true
    }
    payload.from = this.page - 1;
    payload.size  = Number(this.size);
    payload.sort ={
      desc : ["updatedOn"]
    } 
    this.commonService.getSTList('invoice',payload)?.subscribe((data: any) => {
        this.invoiceData = data.documents?.map((s: any,index) => {
          return{
            ...s,
            id:index+1
          }
        });
        this.toalLength = data.totalCount;
        this.count = data.documents.length;
      });
  }

  printAll(data) {
    let reportpayload :any;
    let url :any; 
    if(data?.invoiceTypeStatus === "Tax Invoice"){
      reportpayload = { "parameters": { "invoiceID": data?.invoiceId } };
      url='agencyInvoice';
   }  else if(data?.invoiceTypeStatus === "Reimbursement Invoice"){
    reportpayload = { "parameters": { "invoiceID": data?.invoiceId } };
    url='reimbursementInvoice'} else if(data?.invoiceTypeStatus === "Journal Voucher"){
        reportpayload = { "parameters": { "invoiceID": data?.invoiceId } };
        url='journalVoucher'
      } else{
        return false;
      }

      this.commonService.pushreports(reportpayload,url)?.subscribe({
        next: (res: any) => {
          const blob = new Blob([res], { type: 'application/pdf' });
          let temp = URL.createObjectURL(blob);
          this.Documentpdf = temp;
          const pdfWindow = window.open(temp);
          pdfWindow.print();
        }
      })
    
  }

  applyFilter(filterValue: string) { 
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase();

   
    this.dataSource.filterPredicate = (data, filter) => {
      return JSON.stringify(data).toLowerCase().includes(filter);
    };

    this.dataSource.filter = filterValue;
  }
  export() {
    const modifiedTableData = this.dataSource?.filteredData;
    const tableColumns = this.displayedColumns;
    const tableData = modifiedTableData || [];
    const columnsToHide = [ 'action'];
    const actualColumns = this.displayedColumns;
    this.commonfunction.exportToExcel(
      tableColumns,
      tableData,
      columnsToHide,
      'principle-bill',
      this.displayedColumns,
      actualColumns
    );
  }
}
