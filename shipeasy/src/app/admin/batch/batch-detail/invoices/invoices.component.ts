import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
import { CommonService } from 'src/app/services/common/common.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { Invoice } from 'src/app/models/invoice';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
import { Batch } from 'src/app/models/charges';

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss']
})
export class InvoicesComponent implements OnInit {
  isExport: boolean = false;
  @Input() isparent: any;
  @Input() isFinanceInvoice: boolean;
  closeResult: string;
  invoiceData: Invoice[] = [];
  urlParam: any;
  currentUrl: string;
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
  _gc = GlobalConstants
  totalAmount = 0
  taxAmount = 0
  billAmount = 0
  activeRoute: string = '';
  invoice_type: any;
  viewEdit: boolean = false;
  globalSearch: string;
  basecontentUrl: string;
  Documentpdf: any;
  creditNote: any;
  @ViewChild(MatDrawer) drawer: MatDrawer | any;
  dataSource = new MatTableDataSource();
  pagenation = [10, 20, 50, 100];
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns = [
    '#',
    'invoiceNo',
    'invoiceTypeStatus',
    'invoiceFromName',
    'invoiceToName',
    'invoice_date',
    'invoiceDueDate',
    'paymentTerms',
    'invoiceAmount',
    'invoiceStatus',
    'paymentStatus',
    'action',
  ];
  isShow: boolean = false;
  userData: any;
  constructor(public router: Router,
    private commonService: CommonService,
    private commonfunction: CommonFunctions,
    private route: ActivatedRoute,
    private _FinanceService: FinanceService,
    private modalService: NgbModal,
    private apiService: ApiSharedService,
    private cognito: CognitoService,
    private notification: NzNotificationService, public loaderService: LoaderService,) {
    this.route.params?.subscribe(params =>
      this.urlParam = params
    );
    this.batch_ID = this.route.snapshot?.params['id'];
    this.isShow = this.urlParam?.access == 'show' ? true : false;;
    this.isExport = localStorage.getItem('isExport') === 'true' ? true : false;
    this.isImport = localStorage.getItem('isImport') === 'true' ? true : false;
  }
  isImport:boolean = false;
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
  batch_ID:any;
  batchDetails: Batch; 
  
  changeInoice(event) {
    this.router.navigate(['batch/list/add/' + this.batch_ID + '/invoice/add'], {
      queryParams: {
        type: event.target.value
      },
    })  
  }

  onEditInvoice(id, invoiceType, type, view?) {
    this.viewEdit = view;
    this.commonfunction.invoiceDisabled = view;
    if(view === true){
      this.router.navigate(['/batch/list/show/' + this.urlParam.id + '/' + this.urlParam.key + '/' + id + '/show']);
    }
    else if (invoiceType === 'Periodic Invoice' || invoiceType === 'Lumpsum Invoice' || invoiceType === 'Detention Invoice') {
      this.router.navigate(['/batch/list/add/' + this.urlParam.id + '/' + this.urlParam.key + '/' + id + '/editdetention'])
    } else {
      this.router.navigate(['/batch/list/add/' + this.urlParam.id + '/' + this.urlParam.key + '/' + id + '/edit'], {
        queryParams: {
          type: type
        },
      })
    }
  }

  ngOnInit(): void {
    this.cognito.getagentDetails()?.subscribe((resp) => {
      if (resp != null) {
        this.userData = resp
      }
    })
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();
    this.getInvoiceList();
  }

  getInvoiceList() {
    this.loaderService.showcircle();
    let payload = this.commonService.filterList()

    payload.query = {
      'batchId': this.urlParam?.id, 
      "$and": [
        {
          "principleBill": {
            "$ne": true
          }
        }
      ]
    }


    payload.from = this.page - 1;
    payload.size = Number(this.size);
    payload.sort = {
      desc: ["createdOn"]
    }
    setTimeout(() => {
      this.commonService.getSTList('invoice', payload).subscribe((data) => {
        this.invoiceData = data.documents;
        this.toalLength = data.totalCount;
        this.count = data.documents.length;
        this.loaderService.hidecircle();
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
      }, () => {
        this.loaderService.hidecircle();
      })
    }, 500);
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
      "$and": [
        {
          "principleBill": {
            "$ne": true
          }
        }
      ]
    }
    payload.from = this.fromSize - 1,
      payload.size = Number(this.size);
    payload.sort = {
      desc: ["createdOn"]
    }
    this.commonService.getSTList('invoice', payload).subscribe(data => {
      this.invoiceData = data.documents;
      this.toalLength = data.totalCount;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count = type === 'prev' ? this.toalLength === this.count ? this.count - (this.toalLength % Number(this.size)) : this.count - data.documents.length : this.count + data.documents.length
    })
  }

  search() {
    let mustArray = {};
    mustArray['batchId'] = this.urlParam.id
    mustArray["$and"] = [
      {
        "principleBill": {
          "$ne": true
        }
      }
    ]
    if (this.invoice_no) {
      mustArray['invoiceNo'] = {
        "$regex": this.invoice_no,
        "$options": "i"
      }
    }

    if (this.invoice_date) {
      mustArray['invoice_date'] = {
        "$gt": this.invoice_date.substring(0, 10) + 'T00:00:00.000Z',
        "$lt": this.invoice_date.substring(0, 10) + 'T23:59:00.000Z'
      }
    }
    if (this.creditNote) {
      mustArray['creditNote'] = {
        "$regex": this.creditNote,
        "$options": "i"
      }
    }
    if (this.invoice_duedate) {
      mustArray['invoiceDueDate'] = {
        "$gt": this.invoice_duedate.substring(0, 10) + 'T00:00:00.000Z',
        "$lt": this.invoice_duedate.substring(0, 10) + 'T23:59:00.000Z'
      }
    }
    if (this.invoice_to) {
      mustArray['invoiceToName'] = {
        "$regex": this.invoice_to,
        "$options": "i"
      }
    }
    if (this.payment_terms) {
      mustArray['paymentTerms'] = {
        "$regex": this.payment_terms,
        "$options": "i"
      }
    }
    if (this.amount) {
      mustArray['invoiceAmount'] = {
        "$regex": this.amount,
        "$options": "i"
      }
    }
    if (this.invoiceStatus) {
      mustArray['statusOfinvoice'] = {
        "$regex": this.invoiceStatus,
        "$options": "i"
      }
    }
    if (this.status) {
      mustArray['status'] = {
        "$regex": this.status,
        "$options": "i"
      }
    }
    if (this.invoice_type) {
      mustArray['invoiceTypeStatus'] = {
        "$regex": this.invoice_type,
        "$options": "i"
      }
    }


    let payload = this.commonService.filterList()
    payload.query = mustArray
    payload.size = Number(this.size),
      payload.from = 0,
      payload.sort = { "desc": ['updatedOn'] }

    this.commonService.getSTList('invoice', payload).subscribe((data) => {
      this.invoiceData = data.documents?.map((s: any,index) => {
        return{
          ...s,
          id:index+1
        }
      });
      this.toalLength = data.totalCount;
      this.count = data.documents.length
      this.fromSize = 1
    })
  }

  clear() {
    this.invoice_type = ''
    this.invoice_no = ''
    this.invoice_date = ''
    this.invoice_duedate = ''
    this.invoice_to = ''
    this.creditNote = ''
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
            let data = `invoice/${id}`
            const body = [data];

            this.commonService.deleteST(data).subscribe((res: any) => {
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

  printEmailData(data) {
    let reportpayload: any;
    let url: any;
    // this.mail(data)

    if (data?.invoiceTypeStatus === "Lumpsum Invoice") {
      reportpayload = { "parameters": { "invoiceID": data?.invoiceId, "module": this.isExport ? 'export' : 'import' } };
      url = 'lumpsumInvoice';
    }
    else if (data?.invoiceTypeStatus === "Detention Invoice") {
      reportpayload = { "parameters": { "invoiceID": data?.invoiceId } };
      url = 'detentionImport';
    }
    else if (data?.invoiceTypeStatus === "Periodic Invoice") {
      reportpayload = { "parameters": { "invoiceID": data?.invoiceId } };
      url = 'Periodic';
    } else if (data?.invoiceTypeStatus === "Freight Invoice") {
      reportpayload = { "parameters": { "invoiceId": data?.invoiceId, "module": this.isExport ? 'export' : 'import' } };
      url = 'freightInvoice';
    } else if (data?.invoiceTypeStatus === "Local") {
      reportpayload = { "parameters": { "invoiceID": data?.invoiceId, "module": this.isExport ? 'export' : 'import' } };
      url = 'localInvoice';
    } else if (data?.invoiceTypeStatus === "Reimbursement Invoice") {
      reportpayload = { "parameters": { "invoiceId": data?.invoiceId } };
      url = 'Reimbursement';
    } else if (data?.invoiceTypeStatus === "Tax") {
      reportpayload = { "parameters": { "invoiceID": data?.invoiceId } };
      url = 'agencyInvoice';
    }
    else {
      this.notification.create('error', 'Report not found', '');
      return false;
    }

    this.commonService.pushreports(reportpayload, url).subscribe({
      next: (res: any) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result as string;
          let baseContent = base64String.split(",");
          this.basecontentUrl = baseContent[1];
          this.mail(data, this.basecontentUrl, url)
        };
        reader.readAsDataURL(blob)
      }
    })

  }

  mail(data, bloburl?, reportName?) {
    let fileName = reportName + '.pdf'
    let attachment = [{ "content": bloburl, "name": fileName }]
    let userData = this.userData

    let payload = this.commonService.filterList()
    payload.query = {
      "partymasterId": data?.invoiceToId
    }
    this.commonService.getSTList("partymaster", payload).subscribe((res) => {
      const datePipe = new DatePipe('en-US');
      let emaildata = `
      Dear customer,
<br>
<br>
Your Invoice details for ${'Job No:'}${data?.batchNo} <br> ${'Invoice no :'}  ${data?.invoiceNo} <br> ${'Invoice Type :'}  ${data?.invoiceTypeStatus} <br> ${'BL No :'}  ${data?.blName} <br>
Total Invoice Amount : ${'$'} ${data?.invoiceAmount} <br> ${'Invoice date :'}   ${datePipe.transform(data?.invoice_date, 'dd/MM/yyyy')} <br> ${'Invoice Due Date :'}  ${datePipe.transform(data?.invoiceDueDate, 'dd/MM/yyyy')}<br>
<br>
With regards,
<br>
ShipEasy`;

      let payload = {
        sender: {
          name: userData?.userName,
          email: userData.userEmail
        },
        to: [{
          name: res.documents[0].name,
          email: res.documents[0].primaryMailId,
        }],
        // "attachment": attachment,
        textContent: `${emaildata}`,
        subject: "Invoice Details",
        attachment: attachment,
        batchId: this.route.snapshot.params['id'],
      }
      this.apiService.sendEmail(payload).subscribe(
        (result) => {
          this.updateInvoice(data)
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
    this.invoiceData.forEach((row: any) => {
      storeEnquiryData.push({
        'Inquiry No': row.invoiceNo,
        'invoice Type': row.invoiceType,
        'invoice To': row.invoiceToName,
        'invoice Date': this.commonService.formatDateForExcelPdf(row.invoice_date),
        'Due Date': this.commonService.formatDateForExcelPdf(row.invoiceDueDate),
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
    var prepare = [];
    var tempObj = [];
    tempObj.push(e.invoiceNo);
    tempObj.push(e.invoiceType);
    tempObj.push(e.invoiceToName);
    tempObj.push(this.commonService.formatDateForExcelPdf(e.invoice_date));
    tempObj.push(this.commonService.formatDateForExcelPdf(e.invoiceDueDate));
    tempObj.push(e.paymentTerms);
    tempObj.push(e.invoiceAmount);
    tempObj.push(e.statusOfinvoice);
    prepare.push(tempObj);
    const doc = new jsPDF('p', 'mm', [450, 400]);
    autoTable(doc, {
      head: [['Invoice No', 'Invoice Type', 'Invoice To', 'Invoice Date', 'Due Date', 'Payment Terms', 'Amount', 'Status', 'Receipt No', 'Credit Note No']],
      body: prepare
    });
    doc.save('invoice' + '.pdf');
  }
  openPDF() {
    var prepare = [];
    this.invoiceData.forEach(e => {
      var tempObj = [];
      tempObj.push(e.invoiceNo);
      tempObj.push(e.invoiceTypeStatus);
      tempObj.push(e.invoiceToName);
      tempObj.push(this.commonService.formatDateForExcelPdf(e.invoice_date));
      tempObj.push(this.commonService.formatDateForExcelPdf(e.invoiceDueDate));
      tempObj.push(e.paymentTerms);
      tempObj.push(e.invoiceAmount);
      tempObj.push(e.statusOfinvoice);
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [450, 400]);
    autoTable(doc, {
      head: [['Invoice No', 'Invoice Type', 'Invoice To', 'Invoice Date', 'Due Date', 'Payment Terms', 'Amount', 'Status', 'Receipt No', 'Credit Note No']],
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
      { "invoiceNo": { "$regex": query, "$options": "i" } },
      { "invoiceTypeStatus": { "$regex": query, "$options": "i" } },
      { "invoiceToName": { "$regex": query, "$options": "i" } },
      { "invoice_date": { "$regex": query, "$options": "i" } },
      { "invoiceDueDate": { "$regex": query, "$options": "i" } },
      { "paymentTerms": { "$regex": query, "$options": "i" } },
      { "invoiceAmount": { "$regex": query, "$options": "i" } },
      { "statusOfinvoice": { "$regex": query, "$options": "i" } }
    )


    let payload = this.commonService.filterList()

    payload.query = {
      'batchId': this.urlParam.id,
      "$or": shouldArray,
      "$and": [
        {
          "principleBill": {
            "$ne": true
          }
        }
      ]
    }
    payload.from = this.page - 1;
    payload.size = Number(this.size);
    payload.sort = {
      desc: ["createdOn"]
    }
    this.commonService.getSTList('invoice', payload)
      .subscribe((data: any) => {
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
    let reportpayload: any;
    let url: any;
    if (data?.invoiceTypeStatus === "Lumpsum Invoice") {
      reportpayload = { "parameters": { "invoiceID": data?.invoiceId, "module": this.isExport ? 'export' : 'import' } };
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
      reportpayload = { "parameters": { "invoiceId": data?.invoiceId, "module": this.isExport ? 'export' : 'import' } };
      url = 'freightInvoice';
    } else if (data?.invoiceTypeStatus === "Local") {
      reportpayload = { "parameters": { "invoiceID": data?.invoiceId, "module": this.isExport ? 'export' : 'import' } };
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
        // pdfWindow.print();
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
    const columnsToHide = ['action'];
    const actualColumns = this.displayedColumns;
    this.commonfunction.exportToExcel(
      tableColumns,
      tableData,
      columnsToHide,
      'invoice',
      this.displayedColumns,
      actualColumns
    );
  }
}