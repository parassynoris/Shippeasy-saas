import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FinanceService } from 'src/app/services/Finance/finance.service';
import { CommonFunctions } from '../../functions/common.function';
import { ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import * as XLSX from "xlsx";
import { ApiSharedService } from '../api-service/api-shared.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { DatePipe } from '@angular/common'
import { CommonService } from 'src/app/services/common/common.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss']
})
export class InvoiceComponent implements OnInit {
  _gc=GlobalConstants
  @Input() isparent: any;
  @Input() isFinanceInvoice: boolean;
  closeResult: string;
  invoiceData = [];
  urlParam: any;
  currentUrl: any;
  toalLength: any;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  invoice_no: any;
  invoice_date: any;
  invoice_duedate: any;
  invoice_to: any;
  payment_terms: any;
  amount: any;
  status: any;
  invoiceStatus: any;
  filterBody = this.apiService.body;
  filterBody1 = this.apiService.bodyNew;
  batchList: any;
  costItemList: any[];

  totalAmount = 0
 taxAmount = 0
  billAmount = 0
  globalSearch: string;
  isExport: boolean;
  shouldArray: any[];
  @ViewChild(MatDrawer) drawer: MatDrawer | any;
  dataSource = new MatTableDataSource();
  pagenation = [20, 50, 100];
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns =[
    '#',
   'invoiceNo',
   'batchNo',
   'invoiceToName',
   'invoice_date',
   'invoiceDueDate',
  //  'paymentTerms',
   'invoiceAmount',
    'statusOfinvoice',
    'paymentStatus',
    'action', 
  ];
  basecontentUrl: string;
  userData: any;
  Documentpdf: string;
  currentAgent: any;
  isImport: boolean;
  isTransport: boolean;
  constructor(public router: Router,
    public commonfunction: CommonFunctions,
    private route: ActivatedRoute,
    private _FinanceService: FinanceService,
    public modalService: NgbModal,
    private apiService: ApiSharedService,
    public commonService : CommonService,
    public notification: NzNotificationService,   public cognito : CognitoService,
    public datepipe: DatePipe,
    public loaderService: LoaderService,
    ) {
      this.isExport   = localStorage.getItem('isExport') === 'true' ? true : false;
      this.isImport = localStorage.getItem('isImport') === 'true' ? true : false;
      this.isTransport = localStorage.getItem('isTransport') === 'true' ? true : false;
    this.route.params.subscribe(params =>
      this.urlParam = params
    );
  }

  onOpenInvoice() {
    if (!this.isFinanceInvoice) {
      this.router.navigate(['/batch/list/add/' + this.urlParam.id + '/' + this.urlParam.key + '/add'])
    } else {
      this.router.navigate(['/finance/' + this.urlParam.key + '/add']);
    }
  }

  onCloseNew() {
    if (!this.isFinanceInvoice) {
      this.router.navigate(['/batch/list/add/' + this.urlParam.id + '/' + this.urlParam.key])
    }
    else {
      this.router.navigate(['/finance/' + this.urlParam.key]);
    }
  }

  onEditInvoice(id,show='edit') {
    if (!this.isFinanceInvoice) {
      this.router.navigate(['/batch/list/add/' + this.urlParam.id + '/' + this.urlParam.key + '/' + id + '/edit'])
    }
    else {
        this.router.navigate(['/finance/' + this.urlParam.key + '/' + id + `/${show}Invoice`]);
    }
  }

  ngOnInit(): void {
    this.currentAgent = this.commonfunction.getActiveAgent()
    this.cognito.getagentDetails()?.subscribe((resp) => {
      if (resp != null) { 
        this.userData = resp
      }})
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();
    setTimeout(() => {
      this.getInvoiceList();
    }, 500);
  }

  pageNumber = 1;
  pageSize = 20;
  from = 0;
  totalCount = 0;

  onPageChange(event){
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.from = event.pageIndex*event.pageSize ;
    this.getInvoiceList();
  }

  getInvoiceList() {
    this.loaderService.showcircle();
    let payload = this.commonService.filterList()
    // this.fromSize = 1;
    payload.size =this.pageSize;
    payload.from = this.from;
    payload.query = {
      "isExport": (this.isExport || this.isTransport),
      // "type": "sellerInvoice",
      "$and": [{ 
          "principleBill": {
            "$ne": true
          }
        },
        {
          "invoiceType": {
            "$ne": 'debitNote'
          }
        },
        {
          "invoiceType": {
            "$ne": 'creditNote'
          }
        },
        {
          "invoiceType": {
            "$ne": 'bills'
          }
        }
      ]
    }
    payload.sort = {
      "desc" : ["updatedOn"]
    },
    this.commonService.getSTList('invoice',payload).subscribe((data) => {
      this.invoiceData = data.documents;


      this.dataSource = new MatTableDataSource(
        data?.documents?.map((s: any,index) => {
          return{
            ...s,
            id:index+1
          }
        })
      );
      // this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort1;
      this.toalLength = data.totalCount;
      this.count = data.documents.length;
      this.loaderService.hidecircle();
    },()=>{
      this.loaderService.hidecircle();
    })
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

    payload.size =Number(this.size);
    payload.from = this.fromSize - 1;
    payload.query = {
      "isExport": (this.isExport || this.isTransport),
      "$and": [
        { 
          "principleBill": {
            "$ne": true
          }
        },
        {
          "invoiceType": {
            "$ne": 'debitNote'
          }
        },
        {
          "invoiceType": {
            "$ne": 'creditNote'
          }
        },
        {
          "invoiceType": {
            "$ne": 'bills'
          }
        }
      ]
    }
    payload.sort = {
      "desc" : ["updatedOn"]
    },
    this.commonService.getSTList('invoice',payload).subscribe(data => {
      this.invoiceData = data.documents;
      this.toalLength = data.totalCount;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count = type === 'prev' ? this.toalLength === this.count ? this.count - (this.toalLength % Number(this.size)) : this.count - data.documents.length : this.count + data.documents.length
    })
  }

 
  search() {
    let mustArray = {};
    mustArray['isExport'] = (this.isExport || this.isTransport)
    mustArray['$and'] = [
      { 
        "principleBill": {
          "$ne": true
        }
      },
      {
        "invoiceType": {
          "$ne": 'debitNote'
        }
      },
      {
        "invoiceType": {
          "$ne": 'creditNote'
        }
      },
      {
        "invoiceType": {
          "$ne": 'bills'
        }
      }
    ]
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
    if (this.invoiceStatus) {   mustArray['statusOfinvoice'] = {
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
    let payload = this.commonService.filterList()

    payload.size =Number(this.size);
    payload.from = 0;
    payload.query = mustArray
    payload.sort = {
      "desc" : ["updatedOn"]
    },
    this.commonService.getSTList('invoice',payload).subscribe((data) => {
      this.invoiceData = data.documents?.map((s: any,index) => {
        return{
          ...s,
          id:index+1
        }
      })
      this.toalLength = data.totalCount;
      this.count = data.documents.length
      this.fromSize =1
    })
  }

  clear() {
    this.invoice_no = ''
    this.invoice_date = ''
    this.invoice_duedate = ''
    this.invoice_to = ''
    this.payment_terms = ''
    this.amount = ''
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
            let data ='invoice'+ id;

            this.commonService.deleteST(data).subscribe((res: any) => {
              if (res) {
                this.notification.create(
                  'success',
                  'Deleted Successfully',
                  ''
                );
                this.clear();
              }
            });
          }
        }, (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
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
  downloadFile(x) {
    let excel = [x]


    const myworksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excel);
    const myworkbook: XLSX.WorkBook = {
      Sheets: { data: myworksheet },
      SheetNames: ["data"],
    };
    const excelBuffer: any = XLSX.write(myworkbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileName = "Invoice.xlsx";
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }


  printEmailData(data) {
    let reportpayload :any;
    let url :any;
   
   if(data?.invoiceTypeStatus === "Lumpsum Invoice"){
      reportpayload = { "parameters": { "invoiceID": data?.invoiceId  , "module" : (this.isExport || this.isTransport) ? 'export' : 'import'} };
      url='lumpsumInvoice';
   }
      else if(data?.invoiceTypeStatus === "Detention Invoice"){
        reportpayload = { "parameters": { "invoiceID": data?.invoiceId } };
        url='detentionImport';
      }
      else if(data?.invoiceTypeStatus === "Periodic Invoice"){
        reportpayload = { "parameters": { "invoiceID": data?.invoiceId } };
        url='Periodic';
      } else  if(data?.invoiceTypeStatus === "Freight Invoice"){
        reportpayload = { "parameters": { "invoiceId": data?.invoiceId, "module" : (this.isExport || this.isTransport) ? 'export' : 'import' } };
        url='freightInvoice';
      } else if(data?.invoiceTypeStatus === "Local"){
        reportpayload = { "parameters": { "invoiceID": data?.invoiceId ,"module" : (this.isExport || this.isTransport) ? 'export' : 'import'} };
        url='localInvoice';
      }  else if(data?.invoiceTypeStatus === "Reimbursement Invoice"){
          reportpayload = { "parameters": { "invoiceId": data?.invoiceId } };
          url='Reimbursement';
      } else{
        this.notification.create('error', 'Report not found', '');
        return false;
      }
 
      this.commonService.pushreports(reportpayload,url).subscribe({
        next: (res: any) => {
          const blob = new Blob([res], { type: 'application/pdf' });
          const reader = new FileReader(); 
          reader.onload = () => {
            const base64String = reader.result as string;
            let baseContent = base64String.split(",");
            this.basecontentUrl = baseContent[1];
            this.mail(data,this.basecontentUrl,url)
          };
          reader.readAsDataURL(blob)
        }
      })
   
  }

  mail(data , bloburl? ,reportName?) {
    let fileName = reportName +'.pdf'
    let attachment = [{ "content": bloburl, "name": fileName }]
 
        let userData  = this.userData
        let payload = this.commonService.filterList()
        payload.query = {
          "partymasterId": data?.invoiceToId }
        this.commonService.getSTList("partymaster", payload).subscribe((res) => {
          let emaildata = `
          ${'Total Invoice Ammout :'} : ${data?.invoiceAmount}
          ${'Invoice Due Date :'} : ${data?.invoiceDueDate}  `
    
          let payload = {
            sender: {
              name: userData?.userName,
              email: userData.userEmail
            },
            to: [{
              name: res.documents[0].name,
              email: res.documents[0].primaryMailId,
            }],
            textContent: `${emaildata}`,
            subject: "Invoice Details",
            attachment : attachment,
            batchId : data?.batchId 
          }
         
          this.apiService.sendEmail(payload).subscribe(
            (res) => {
              this.updateInvoice(data)
              if (res.status == "success") {
                this.notification.create('success', 'Email Send Successfully', '');
              }
              else {
                this.notification.create('error', 'Email not Send', '');
              }
            }
          );
        });
      

  }
  updateInvoice(data) {
    this.commonService.UpdateToST(`invoice/${data?.invoiceId}`, {
      ...data,
      "statusOfinvoice": 'Sent',
      "invoiceStatus": 'Sent',
    }).subscribe((res)=>{
      this.getInvoiceList();
    });
  }
  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.invoiceData.map((row: any) => {
      storeEnquiryData.push({
        'Enquiry No': row.invoiceNo,
        'invoice To': row.invoiceToName,
        'invoice Date': row.invoice_date,
        'Due Date': row.invoiceDueDate,
        'payment Terms': row.paymentTerms,
        'invoice Amount': row.invoiceAmount,
        'Status': row.statusOfinvoice,

      });
    });
    const myworksheet: XLSX.WorkSheet =
      XLSX.utils.json_to_sheet(storeEnquiryData);
    const myworkbook: XLSX.WorkBook = {
      Sheets: { data: myworksheet },
      SheetNames: ['data'],
    };
    const excelBuffer: any = XLSX.write(myworkbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const fileName = 'invoice.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  openPDF() {
    var prepare=[];
    this.invoiceData.forEach(e=>{
      var tempObj =[];
      tempObj.push(e.invoiceNo);
      tempObj.push(e.invoiceToName);
      tempObj.push(this.datepipe.transform(e.invoice_date,'dd-MM-YYYY,hh:mm') );
      tempObj.push(this.datepipe.transform(e.invoiceDueDate,'dd-MM-YYYY,hh:mm'));
      tempObj.push(e.paymentTerms);
      tempObj.push(e.invoiceAmount);
      tempObj.push(e.statusOfinvoice);
      tempObj.push(e.status);
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [297, 210]);
    autoTable(doc,{
        head: [['Invoice No','Invoice To','Invoice Date','Due Date','Payment Terms','Amount','Invoice Status','Status']],
        body: prepare
    });
    doc.save('invoice' + '.pdf');
  }

  clearGloble() {
    this.globalSearch = '';
    this.clear()
  }
  searchGlobal() {
    let  query = this.globalSearch
   
    let shouldArray = [];
    shouldArray.push(
      { "invoiceNo": {  "$regex": query  ,"$options": "i"  } },
      { "invoiceToName": {  "$regex": query  ,"$options": "i"  } },
      { "invoice_date": {  "$regex": query  ,"$options": "i"  } },
      { "invoiceDueDate": {  "$regex": query  ,"$options": "i"  } },
      { "paymentTerms": {  "$regex": query  ,"$options": "i"  } },
      { "invoiceAmount": {  "$regex": query  ,"$options": "i"  } },
      { "statusOfinvoice": {  "$regex": query  ,"$options": "i"  } },
      { "status": {  "$regex": query  ,"$options": "i"  } },
     )


  
  var parameter = {
    "project": [ ],
    "query": {
      "isExport": (this.isExport || this.isTransport),
      "$and": [
        { 
          "principleBill": {
            "$ne": true
          }
        },
        {
          "invoiceType": {
            "$ne": 'debitNote'
          }
        },
        {
          "invoiceType": {
            "$ne": 'creditNote'
          }
        },
        {
          "invoiceType": {
            "$ne": 'bills'
          }
        }
      ],
     "$or": shouldArray},
    "sort" :{
        "desc" : ["updatedOn"]
    },
    size: Number(this.size),
    from: 0,
}
    this.commonService.getSTList('invoice', parameter)
      .subscribe((data: any) => {
        this.invoiceData = data.documents;
        this.toalLength = data.totalCount;
        this.count = data.documents.length;
        this.fromSize =1;
      });
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
      'Invoice',
      this.displayedColumns,
      actualColumns
    );
  }
  displayedColumns1 = this.displayedColumns.map((x, i) => x+'_'+i);
  toggleFilters = true;
  filtersModel = [];
  filterKeys = {};

  searchColumns() {
    this.filterKeys = {};
    this.filtersModel.forEach((each, ind) => {
      if(each){

        if (this.displayedColumns[ind] == 'invoice_date' || this.displayedColumns[ind] == 'invoiceDueDate') {
          this.filterKeys[this.displayedColumns[ind]] = { 
            "$regex":  each.substring(0, 10).split('-').reverse().join('-'),
            "$options": "i"
          };
        }  else {
          this.filterKeys[this.displayedColumns[ind]] = {
            "$regex": each.toLowerCase(),
            "$options": "i"
          }
        }  
      } 
  });
  
  this.filterKeys['isExport'] = (this.isExport || this.isTransport)
  this.filterKeys['$and'] = [
    { 
      "principleBill": {
        "$ne": true
      }
    },
    {
      "invoiceType": {
        "$ne": 'debitNote'
      }
    },
    {
      "invoiceType": {
        "$ne": 'creditNote'
      }
    },
    {
      "invoiceType": {
        "$ne": 'bills'
      }
    }
  ]
  this.page = 1;
  this.fromSize = 1;
  var parameter = {
    "project": [ ],
    "query": { ...this.filterKeys  },
    "sort" :{
        "desc" : ["createdOn"]
    },
    size: Number(10000),
    from: this.page - 1,
}
  
this.commonService.getSTList('invoice',parameter).subscribe((data) => {
  this.invoiceData = data.documents;
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

})
 
 
  }

  clearFilters() {
    this.filtersModel = [];
    this.filterKeys = {};
    this.getInvoiceList();
  }

  navigateToNewTab1(element) {
    let url = element?.enquiryStatus == 'Inquiry Draft' ? '/batch/list/add/'+element?.batchId+'/details' : '/batch/list/add/'+element?.batchId+'/details'
    this.router.navigate([url] );
  }

  navigateToNewTab(element) { 
    let url = ''

    if (!this.isFinanceInvoice) {
      url = !element?.irisResponse?.irn && element?.invoiceStatus !== 'Approved' ? 'batch/list/add/' + this.urlParam.id + '/' + this.urlParam.key + '/' + element.invoiceId + '/edit' : 
      'batch/list/add/' + this.urlParam.id + '/' + this.urlParam.key + '/' + element.invoiceId + '/edit'
      
    }
    else {
      url = !element?.irisResponse?.irn && element?.invoiceStatus !== 'Approved' ?  element.invoiceId + `/editInvoice` : 
       element.invoiceId + `/showInvoice`
    }
    this.router.navigate(['/finance/invoice/'+url] );
  }

  printAll(data) {
    let reportpayload: any;
    let url: any;
    if (data?.invoiceTypeStatus === "Lumpsum Invoice") {
      reportpayload = { "parameters": { "invoiceID": data?.invoiceId, "module": (this.isExport || this.isTransport) ? 'export' : 'import' } };
      url = 'lumpsumInvoice';
    }
    else if (data?.invoiceTypeStatus === "Detention Invoice") {
      reportpayload = { "parameters": { "invoiceID": data?.invoiceId } };
      url = 'periodicDetentionInvoiceImport';
    }
    else if (data?.invoiceTypeStatus === "Periodic Invoice") {
      reportpayload = { "parameters": { "invoiceID": data?.invoiceId } };
      url = 'periodicDetentionInvoiceExport';
    } else if (data?.invoiceTypeStatus === "Freight Invoice") {
      reportpayload = { "parameters": { "invoiceId": data?.invoiceId, "module": (this.isExport || this.isTransport) ? 'export' : 'import' } };
      url = 'freightInvoice';
    } else if (data?.invoiceTypeStatus === "Local") {
      reportpayload = { "parameters": { "invoiceID": data?.invoiceId, "module": (this.isExport || this.isTransport) ? 'export' : 'import' } };
      url = 'localInvoice';
    } else if (data?.invoiceTypeStatus === "Reimbursement Invoice") {
      reportpayload = { "parameters": { "invoiceId": data?.invoiceId } };
      url = 'reimbursementInvoice';
    }
    else if (data?.invoiceTypeStatus === "Tax") {
      reportpayload = { "parameters": { "invoiceID": data?.invoiceId } };
      url = 'agencyInvoice';
    }
    else {
      return false;
    }

    this.commonService.pushreports(reportpayload, url).subscribe({
      next: (res: any) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        let temp = URL.createObjectURL(blob);
        this.Documentpdf = temp;
        const pdfWindow = window.open(temp);
        pdfWindow.print();
      }
    })

  }
}
