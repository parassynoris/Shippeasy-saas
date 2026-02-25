import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FinanceService } from 'src/app/services/Finance/finance.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { CommonService } from 'src/app/services/common/common.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { Payment } from 'src/app/models/payment';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { AddPaymentInoutComponent } from './add-payment-inout/add-payment-inout.component';

@Component({
  selector: 'app-payment-in-out',
  templateUrl: './payment-in-out.component.html',
  styleUrls: ['./payment-in-out.component.scss']
})
export class PaymentInOutComponent implements OnInit {
  _gc = GlobalConstants;
  paymentData: any = [];
  urlParam: any;
  currentUrl: any;
  toalLength: number;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  closeResult: string;

  reciept_no: string;
  payment_mode: string;
  paymentRefNo: string;
  paymentreference_date: string;
  amount: any;
  remitance_bank: string;
  beneficiary_bank: string;
  invoice_party: string;
  recieved_from: string;
  invoice_no: any;
  batch_no: any;
  remarks: any;
  currency: any;
  move_no: any;
  document_name: any;
  globalSearch: string;
  screenShow: any = 'receipt'
  shouldArray: any;
  isExport: boolean;
  status: any;
  @ViewChild(MatDrawer) drawer: MatDrawer | any;
  dataSource = new MatTableDataSource();
  pagenation = [20, 50, 100];
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns = [
    '#',
    'paymentNo',
    'paymentDate',
    // 'billNo',
    'invoiceToName',
    'transactionType',
    'invoiceAmount',
    'paidAmount' ,
    'balanceAmount', 
    'action',
  ];
  currentAgent: any;
  constructor(
    private commonService: CommonService,
    private modalService: NgbModal,
    private router: Router,
    private route: ActivatedRoute,
    private FinanceService: FinanceService,
    private notification: NzNotificationService,
    private commonfunction: CommonFunctions,
    private loaderService: LoaderService,
  ) {
    this.isExport = localStorage.getItem('isExport') === 'false' ? false : true;
    this.route.params?.subscribe((params) => (this.urlParam = params));
  }

  onOpenInvoice(data?,isType?) {
    // this.router.navigate(['/finance/' + this.urlParam.key + '/add']);
    let modalRef = this.modalService.open(AddPaymentInoutComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
    modalRef.componentInstance.isPaymentIn = this.urlParam.key == 'payment in' ? true : false;  
    modalRef.componentInstance.paymentData = data || null ;
    modalRef.componentInstance.isType =  isType || 'add' ;
    modalRef.componentInstance.getList.subscribe((res: any) => {  
      if (res) {  
        setTimeout(() => {
          this.getRecieptList()  
        }, 1000); 
      }
    })
  }

  onCloseNew() {
    this.router.navigate(['/finance/' + this.urlParam.key]);
  }

  onEditInvoice(id, show ) {
    this.router.navigate([
      '/finance/' + this.urlParam.key + '/' + id + `/${show}`,
    ]);
  }

  ngOnInit(): void {
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();
    this.currentAgent = this.commonfunction.getActiveAgent()
    if (this.urlParam.key == 'payment in') {
      this.displayedColumns = [
        '#',
        'paymentNo',
        'paymentDate',
        // 'billNo',
        'invoiceToName',
        'transactionType',
        'invoiceAmount',
        'paidAmount' ,
        'balanceAmount', 
        'action',
      ];
    } else {
      this.displayedColumns = [
        '#',
        'paymentNo',
        'paymentDate',
        // 'billNo',
        'invoiceToName', 
        'transactionType',
        'invoiceAmount', 
         'paidAmount' ,
        'balanceAmount', 
        'action',
      ];
    }


    setTimeout(() => {
      this.displayedColumns1 = this.displayedColumns.map((x, i) => x + '_' + i);
      this.getRecieptList();
    }, 500);
  }

  pageNumber = 1;
  pageSize = 20;
  from = 0;
  totalCount = 0;

  onPageChange(event) {
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.from = event.pageIndex * event.pageSize;
    this.getRecieptList();
  }

  getRecieptList() {
   
    this.loaderService.showcircle();
    let payload = this.commonService.filterList()

    payload.size = this.pageSize;
    payload.from = this.from;
    payload.query = {
      "isExport": this.isExport,
      type: this.urlParam.key == 'payment in' ? 'sellerInvoice': 'buyerInvoice'
    }
    payload.sort = {
      "desc": ["updatedOn"]
    },
      this.commonService.getSTList('payment', payload).subscribe((data) => {
        this.paymentData = data.documents;


        this.dataSource = new MatTableDataSource(
          data?.documents?.map((s: any, index) => {
            return {
              ...s,
              id: index + 1
            }
          })
        );
        // this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1;
        this.toalLength = data.totalCount;
        this.count = data.documents.length;
        this.loaderService.hidecircle();
      }, () => {
        this.loaderService.hidecircle();
      });
  }

 

  filter(e) {
    this.size = e.target.value;
    this.fromSize = 1;
    this.getRecieptList();
  }

 

 

  removeRow(content1, id) {
    this.modalService
      .open(content1, {
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
            let data = 'payment/' + id
            this.commonService.deleteST(data).subscribe((res: any) => {
              this.getRecieptList();
              if (res) {
                this.notification.create('success', 'Deleted Successfully', '');
              }
            });
          }
        }
      );
  }

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.paymentData.map((row: any) => {
      storeEnquiryData.push({ 
        'paymen No' : row.paymentNo,
        'Payment Date' : this.commonService.formatDateForExcelPdf(row.paymentDate),
        'bill No': row.billNo,
        'Party Name': row.invoiceToName,
        'Type': row.transactionType,
        'Total Amount': row.invoiceAmount,
        'Paid Amount' : row.paidAmount,
        'Balance Amount': row.balanceAmount,
 
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

    const fileName = 'receipt.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  openPDF() {
    var prepare = [];
    this.paymentData.forEach(e => {
      var tempObj = []; 

      tempObj.push(e.paymentNo); 
      tempObj.push(this.commonService.formatDateForExcelPdf(e.paymentDate));
      tempObj.push(e.billNo);
      tempObj.push(e.invoiceToName);
      tempObj.push(e.transactionType);
      tempObj.push(e.invoiceAmount);
      tempObj.push(e.paidAmount);
      tempObj.push(e.balanceAmount); 
    });
    const doc = new jsPDF('p', 'mm', [497, 410]);
    autoTable(doc, {
      head: [['Payment No', 'Payment Date', 'Bill No.' ,'Party Name' ,'Type' ,'Total Amount','Paid/Received Amount' , 'Balance AMount' ]],
      body: prepare
    });
    doc.save('receipt' + '.pdf');
  }

  clearGloble() {
    this.globalSearch = ''; 
  }
  searchGlobal() {
    let query = this.globalSearch

    let shouldArray = [];
    shouldArray.push(
      

      { "paymentNo": { "$regex": query, "$options": "i" } },
      { "billNo": { "$regex": query, "$options": "i" } },
      { "invoiceToName": { "$regex": query, "$options": "i" } },
      { "paymentDate": { "$regex": query, "$options": "i" } },
      { "transactionType": { "$regex": query, "$options": "i" } },
      { "balanceAmount": { "$regex": query, "$options": "i" } },
      { "paidAmount": { "$regex": query, "$options": "i" } },
      { "invoiceAmount": { "$regex": query, "$options": "i" } }, 
    )



    var parameter = {
      "project": [],
      "query": {
        "isExport": this.isExport, 
      type: this.urlParam.key == 'payment in' ? 'sellerInvoice': 'buyerInvoice',
        "$or": shouldArray
      },
      "sort": {
        "desc": ["updatedOn"]
      },
      size: Number(this.size),
      from: 0,
    }
    this.commonService.getSTList('payment', parameter)
      .subscribe((data: any) => {
        this.paymentData = data.documents?.map((s: any, index) => {
          return {
            ...s,
            id: index + 1
          }
        })
        this.toalLength = data.totalCount;
        this.count = data.documents.length;
        this.fromSize = 1;
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
    const columnsToHide = ['action'];
    const actualColumns = this.displayedColumns;
    this.commonfunction.exportToExcel(
      tableColumns,
      tableData,
      columnsToHide,
      'Payment',
      this.displayedColumns,
      actualColumns
    );
  }
  searchColumns() {
    this.filterKeys = {};
    this.filtersModel.forEach((each, ind) => {
      if (each) {

        if (this.displayedColumns[ind] == 'paymentDate') {
          this.filterKeys['paymentDate'] = {
            "$gt": each.substring(0, 10) + 'T00:00:00.000Z',
            "$lt": each.substring(0, 10) + 'T23:59:00.000Z'
          };
        } else {
          this.filterKeys[this.displayedColumns[ind]] = {
            "$regex": each.toLowerCase(),
            "$options": "i"
          }
        }
      }
    });

    this.filterKeys['isExport'] = this.isExport
    let payload = this.commonService.filterList()

    payload.size = Number(10000);
    payload.from = this.page - 1;
    payload.query = { ...this.filterKeys,type: this.urlParam.key == 'payment in' ? 'sellerInvoice': 'buyerInvoice', }
    payload.sort = {
      "desc": ["updatedOn"]
    },
      this.commonService.getSTList('payment', payload).subscribe((data) => {
        this.paymentData = data.documents;

        this.dataSource = new MatTableDataSource(
          data?.documents?.map((s: any, index) => {
            return {
              ...s,
              id: index + 1
            }
          })
        );
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1;
      });

  }
  displayedColumns1 = this.displayedColumns.map((x, i) => x + '_' + i);
  toggleFilters = true;
  filtersModel = [];
  filterKeys = {};
  clearFilters() {
    this.filtersModel = [];
    this.filterKeys = {};
    this.getRecieptList();
  }

  navigateToNewTab(element) {
    // let url = element.paymentId + '/edit'
    // this.router.navigate(['/finance/reciept/' + url]);
if( element.paymentType == 'Cheque'){
  this.onOpenInvoice(element,'edit' )
}else{
  this.onOpenInvoice(element,'show' )
}
   

  }
}
