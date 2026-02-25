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
import { CommonFunctions } from '../../functions/common.function';
import { Payment } from 'src/app/models/payment';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
})
export class PaymentComponent implements OnInit {
  _gc=GlobalConstants;
  paymentData:Payment[] = [];
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
  paymentreference_no: string;
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
  status:any;
  @ViewChild(MatDrawer) drawer: MatDrawer | any;
  dataSource = new MatTableDataSource();
  pagenation = [20, 50, 100];
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns =[
    '#',
  //  'paymentId',
   'paymentNo',
   'paymentType',
   'batchNo',
  //  'paymentreference_no',
  //  'paymentDate',
   'amount',
    'remitance_bank',
    'beneficiary_bank',
    'invoice_party',
    'recieved_from',
    // 'invoiceData', 
    'remarks',
    'isPosting', 
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
    private commonfunction : CommonFunctions,
    private loaderService: LoaderService,
  ) {
    this.isExport = localStorage.getItem('isExport') === 'false' ? false : true;
    this.route.params?.subscribe((params) => (this.urlParam = params));
  }

  onOpenInvoice() {
    this.router.navigate(['/finance/' + this.urlParam.key + '/add']);
  }

  onCloseNew() {
    this.router.navigate(['/finance/' + this.urlParam.key]);
  }

  onEditInvoice(id, show = 'edit') {
    this.router.navigate([
      '/finance/' + this.urlParam.key + '/' + id + `/${show}`,
    ]);
  }

  ngOnInit(): void {
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();
    this.currentAgent = this.commonfunction.getActiveAgent()
    if(this.currentUrl === 'reciept-posting'){
      this.displayedColumns =[
        '#',
       'paymentId',
       'paymentNo',
       'paymentType',
       'batchNo',
       'invoiceData',   
       'amount',
       'invoiceAmount',
       'invoiceAmountPaid',
       'balanceAmount', 
        'remitance_bank', 
        'invoice_party',
        'recieved_from', 
       
        'remarks', 
        'isPosting', 
        // 'action', 
      ];
    }else{
      this.displayedColumns =[
        '#', 
       'paymentNo',
       'paymentType',
       'batchNo',
      //  'paymentreference_no',
      //  'paymentDate',
       'amount',
        'remitance_bank',
        'beneficiary_bank',
        'invoice_party',
        'recieved_from', 
        'remarks',  
        'action', 
      ];
    }


      setTimeout(() => {
        this.displayedColumns1 = this.displayedColumns.map((x, i) => x+'_'+i);
        this.getRecieptList();
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
    this.getRecieptList();
  }

  getRecieptList() {
    this.loaderService.showcircle();
    let payload = this.commonService.filterList()

    payload.size =this.pageSize;
    payload.from = this.from;
    payload.query = {
      "isExport": this.isExport,
    }
    payload.sort = {
      "desc" : ["updatedOn"]
    },
    this.commonService.getSTList('payment',payload).subscribe((data) => {
      this.paymentData = data.documents;
      

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
    });
  }

  next() {
    if (this.toalLength > this.count) {
      this.getPaginationData('next');
    }
  }

  prev() {
    if (this.page > 0) {
      this.getPaginationData('prev');
    }
  }

  filter(e) {
    this.size = e.target.value;
    this.fromSize = 1;
    this.getRecieptList();
  }

  getPaginationData(type: any) {
    this.fromSize =
      type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
      let payload = this.commonService.filterList()

      payload.size =Number(this.size);
      payload.from = this.fromSize - 1;
      payload.query = {
        "isExport": this.isExport,
      }
      payload.sort = {
        "desc" : ["updatedOn"]
      },
      this.commonService.getSTList('payment',payload).subscribe((data) => {
      this.paymentData = data.documents;
      this.toalLength = data.totalCount;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count =
        type === 'prev'
          ? this.toalLength === this.count
            ? this.count - (this.toalLength % Number(this.size))
            : this.count - data.documents.length
          : this.count + data.documents.length;
    });
  }

  search() {
    let mustArray = {};
    mustArray['isExport'] = this.isExport
    if (this.reciept_no) {
      mustArray['paymentNo'] = {
        "$regex" : this.reciept_no,
        "$options": "i"
    }
    }
   

    
   
    if (this.payment_mode) {
      mustArray['paymentType'] = {
        "$regex" : this.payment_mode,
        "$options": "i"
    }
    }
    if (this.paymentreference_no) {
      mustArray['paymentreference_no'] = {
        "$regex" : this.paymentreference_no,
        "$options": "i"
    }
    }
    if (this.paymentreference_date) {
      mustArray['paymentDate']= {
        "$gt" : this.paymentreference_date.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.paymentreference_date.substring(0, 10) + 'T23:59:00.000Z'
    }
    }
    if (this.amount) {
      mustArray['amount'] = {
        "$regex" : this.amount,
        "$options": "i"
    }
    }
    if (this.remitance_bank) {
      mustArray['remitance_bank'] = {
        "$regex" : this.remitance_bank,
        "$options": "i"
    }
    }
    if (this.beneficiary_bank) {
      mustArray['beneficiary_bank'] = {
        "$regex" : this.beneficiary_bank,
        "$options": "i"
    }
    }
    if (this.invoice_party) {
      mustArray['invoice_party'] = {
        "$regex" : this.invoice_party,
        "$options": "i"
    }
    }
    if (this.recieved_from) {
      mustArray['recieved_from'] = {
        "$regex" : this.recieved_from,
        "$options": "i"
    }
    }
    if (this.invoice_no) {
      mustArray['invoice_no'] = {
        "$regex" : this.invoice_no,
        "$options": "i"
    }
    }
    if (this.batch_no) {
      mustArray['batch_no'] = {
        "$regex" : this.batch_no,
        "$options": "i"
    }
    }
    if (this.remarks) {
      mustArray['remarks'] = {
        "$regex" : this.remarks,
        "$options": "i"
    }
    
    }
    if (this.currency) {
      mustArray['currency'] = {
        "$regex" : this.currency,
        "$options": "i"
    }
    }
    if (this.move_no) {
      mustArray['move_no'] = {
        "$regex" : this.move_no,
        "$options": "i"
    }
    
    }
    if (this.document_name) {
      mustArray['document_name'] = {
        "$regex" : this.document_name,
        "$options": "i"
    }
    }
    if (this.status) {
      mustArray['isPosting'] = this.status.toLowerCase() === 'pending'? false:true
    }
    let payload = this.commonService.filterList()

    payload.size =Number(this.size);
    payload.from = 0;
    payload.query = mustArray
    payload.sort = {
      "desc" : ["updatedOn"]
    },
    this.commonService.getSTList('payment',payload).subscribe((data) => {
      this.paymentData = data.documents?.map((s: any,index) => {
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
    this.reciept_no = ''
    this.payment_mode = ''
    this.paymentreference_no = ''
    this.paymentreference_date = ''
    this.amount = ''
    this.amount = ''
    this.remitance_bank = ''
    this.beneficiary_bank = ''
    this.invoice_party = ''
    this.recieved_from = ''
    this.invoice_no = ''
    this.batch_no = ''
    this.remarks = ''
    this.currency = ''
    this.move_no = ''
    this.document_name = ''
    this.getRecieptList()
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
            let data = 'payment/'+id
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
        'Receipt No': row.reciept_no,
        'Payment Mode': row.paymentType,
        'Payment Ref.No.': row.paymentreference_no,
        'Payment Ref. Date': this.commonService.formatDateForExcelPdf(row.paymentDate),
        'Amount': row.amount,
        'Remittance Bank': row.remitance_bank,
        'Beneficiary Bank': row.beneficiary_bank,
        'Invoice Party': row.invoice_party,
        'Recieved From': row.recieved_from,
        'Invoice No.': row.invoice_no,
        'Job No.': row.batch_no,
        'Remarks': row.remarks,
        'currency': row.currency,
        'Move No': row.move_no,
        'upload Documents': row.document_name,
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
      tempObj.push(e.reciept_no);
      tempObj.push(e.paymentType);
      tempObj.push(e.paymentreference_no);
      tempObj.push(this.commonService.formatDateForExcelPdf(e.paymentDate));
      tempObj.push(e.amount);
      tempObj.push(e.remitance_bank);
      tempObj.push(e.beneficiary_bank);
      tempObj.push(e.invoice_party);
      tempObj.push(e.recieved_from);
      tempObj.push(e.invoice_no);
      tempObj.push(e.batch_no);
      tempObj.push(e.remarks);
      tempObj.push(e.currency);
      tempObj.push(e.move_no);
      tempObj.push(e.document_name);
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [497, 410]);
    autoTable(doc, {
      head: [['Receipt No', 'Payment Mode', 'Payment Ref.No.', 'Payment Ref. Date', 'Amount', 'Remittance Bank', 'Beneficiary Bank', 'Invoice Party', 'Recieved From', 'Invoice No.', 'Job No.', 'Remarks', 'Currency', 'Move No', 'Upload Documents']],
      body: prepare
    });
    doc.save('receipt' + '.pdf');
  }

  clearGloble() {
    this.globalSearch = '';
    this.clear()
  }
  searchGlobal() {
    let  query = this.globalSearch
   
    let shouldArray = [];
    shouldArray.push(
      { "reciept_no": {  "$regex": query  ,"$options": "i"  } },
      { "paymentType": {  "$regex": query  ,"$options": "i"  } },
      { "paymentreference_no": {  "$regex": query  ,"$options": "i"  } },
      { "paymentDate": {  "$regex": query  ,"$options": "i"  } },
      { "amount": {  "$regex": query  ,"$options": "i"  } },
      { "remitance_bank": {  "$regex": query  ,"$options": "i"  } },
      { "beneficiary_bank": {  "$regex": query  ,"$options": "i"  } },
      { "invoice_party": {  "$regex": query  ,"$options": "i"  } },

      { "recieved_from": {  "$regex": query  ,"$options": "i"  } },
      { "invoice_no": {  "$regex": query  ,"$options": "i"  } },
      { "batch_no": {  "$regex": query  ,"$options": "i"  } },
      { "remarks": {  "$regex": query  ,"$options": "i"  } },
      { "currency": {  "$regex": query  ,"$options": "i"  } },
      { "move_no": {  "$regex": query  ,"$options": "i"  } },
      { "document_name": {  "$regex": query  ,"$options": "i"  } }
     )


  
  var parameter = {
    "project": [ ],
    "query": {
      "isExport": this.isExport,
     "$or": shouldArray},
    "sort" :{
        "desc" : ["updatedOn"]
    },
    size: Number(this.size),
    from: 0,
}
    this.commonService.getSTList('payment', parameter)
      .subscribe((data: any) => {
        this.paymentData = data.documents?.map((s: any,index) => {
          return{
            ...s,
            id:index+1
          }
        })
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
      'Payment',
      this.displayedColumns,
      actualColumns
    );
  }
  searchColumns() {
    this.filterKeys = {};
    this.filtersModel.forEach((each, ind) => {
      if(each){

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

  payload.size =Number(10000);
  payload.from = this.page - 1;
  payload.query = { ...this.filterKeys}
  payload.sort = {
    "desc" : ["updatedOn"]
  },
  this.commonService.getSTList('payment',payload).subscribe((data) => {
    this.paymentData = data.documents; 

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
  });
 
  }
  displayedColumns1 = this.displayedColumns.map((x, i) => x+'_'+i);
  toggleFilters = true;
  filtersModel = [];
  filterKeys = {};
  clearFilters() {
    this.filtersModel = [];
    this.filterKeys = {};
    this.getRecieptList( );
  }

  navigateToNewTab(element) { 
    let url = element.paymentId+'/edit'
    this.router.navigate(['/finance/reciept/'+url]);
  }
}
