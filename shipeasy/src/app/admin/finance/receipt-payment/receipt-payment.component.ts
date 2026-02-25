import { Component, OnInit, ViewChild,Input } from '@angular/core';
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
import * as Constant from 'src/app/shared/common-constants';

@Component({
  selector: 'app-receipt-payment',
  templateUrl: './receipt-payment.component.html',
  styleUrls: ['./receipt-payment.component.scss']
})
export class ReceiptPaymentComponent implements OnInit {
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
  status: any;
  remark: string = '';
  selectedInvoice: any;
    userData: any = null;
  showRemarkError: boolean = false;
 checkInvoice: any[] = [];
  CheckInvoiceIds:any=null;
  historyList: any[] = [];
  @Input() isBatchInvoice : boolean ;
  @ViewChild(MatDrawer) drawer: MatDrawer | any;
  dataSource = new MatTableDataSource();
  pagenation = [20, 50, 100];
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns = [
    '#',
    //  'paymentId',
    'paymentNo',
    'billDate',
    'paymentreference_no',
    'invoice_party',
    'batchNo',
    'mblName',


    'containerNos',
    'paymentType',
    //  'paymentDate',
    'amount',
    'balance',
    'status',
    // 'remitance_bank',
    // 'beneficiary_bank',
    // 'invoice_party',
    // 'recieved_from',
    // 'invoiceData', 
    // 'remarks',
    // 'isPosting', 
    'action',
  ];
  currentAgent: any;
  isImport: boolean;
  isTransport: boolean;
  urlParamkey :any =''
  constructor(
    private commonService: CommonService,
    private modalService: NgbModal,
    private router: Router,
    private route: ActivatedRoute,
    private FinanceService: FinanceService,
    private notification: NzNotificationService,
    private commonfunction: CommonFunctions,
    private loaderService: LoaderService,
      public commonFunctions: CommonFunctions,
  ) {
    this.isExport = localStorage.getItem('isExport') === 'true' ? true : false;
    this.isImport = localStorage.getItem('isImport') === 'true' ? true : false;
    this.isTransport = localStorage.getItem('isTransport') === 'true' ? true : false;
    this.route.params?.subscribe((params) => (
      this.urlParam = params
      
    ));
   
    this.urlParamkey = this.urlParam.key
    this.batch_ID = this.route.snapshot?.params['id'];
  }
  batch_ID:any = ''
  onOpenInvoice(event?) {
    if(!this.isBatchInvoice){
      this.router.navigate(['/finance/' + this.urlParamkey + '/add']);
    }else{
      this.router.navigate(['batch/list/add/' + this.batch_ID + '/invoice/add'], {
        queryParams: {
          type: event.target.value
        },
      })
    } 
  }
onHistoryHover(element: any): void {
  if (!element?.invoiceId) return;
  this.getInvoiceHistory(element.invoiceId);
}
getInvoiceHistory(invoiceId: string): void {
  const response =this.checkInvoice;
  this.historyList = response
    .filter(d => d.invoiceId === invoiceId)
    .sort((a, b) => new Date(b.updatedOn).getTime() - new Date(a.updatedOn).getTime());
}
  onCloseNew() {
    if(!this.isBatchInvoice){
    this.router.navigate(['/finance/' + this.urlParamkey]);
    }else{
      this.router.navigate(['/batch/list/add/' + this.batch_ID + '/invoice'])
    }
  }

  onEditInvoice(id, show ) {
    if(!this.isBatchInvoice){
    this.router.navigate([
      '/finance/' + this.urlParamkey + '/' + id.invoiceId + `/${show}`,
    ]);
  }else{
      this.router.navigate(['/batch/list/add/' + this.urlParam.id + '/' + this.urlParam.key + '/' + id.invoiceId + `/${show}`], {
        queryParams: {
          type: id.type
        },
      })
    }
  }

  ngOnInit(): void {
     this.getUserList();
    this.currentUrl = window.location.href.split('?')[0].split('/').pop(); 
    this.currentAgent = this.commonfunction.getActiveAgent()
    if (this.urlParamkey == 'sale') {
      this.displayedColumns = [
        '#',
        'invoiceNo',
        'invoice_date',
        // 'billNo',
        'invoiceToName',
        'batchNo',
        'mblName',
        'containerNos',
        // 'paymentMode',
        'invoiceAmount',
        'balanceAmount',
        'paymentStatus',
        'invoiceStatus',
        'action',
      ];
    } else {
      this.displayedColumns = [
        '#',
        'invoiceNo',
        'invoice_date',
        // 'billNo',
        'invoiceFromName',
        'batchNo',
        'mblName',
        'containerNos',
        // 'paymentMode',
        'invoiceAmount',
        'balanceAmount',
        'paymentStatus',
        'invoiceStatus',
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

  // getRecieptList() {
   
  //   this.loaderService.showcircle();
  //   let payload = this.commonService.filterList()

  //   payload.size = this.pageSize;
  //   payload.from = this.from;
  //   payload.query = { 
  //     isExport: (this.isExport || this.isTransport),
  //     // type: this.urlParamkey == 'sale' ? 'sellerInvoice': 'buyerInvoice'
  //   }
  //   payload.sort = {
  //     "desc": ["updatedOn"]
  //   }
  //   if(this.isBatchInvoice){
  //     payload.query = { 
  //       ...payload.query,
  //       batchId : this.batch_ID
  //     }
  //   }else{
  //     payload.query = { 
  //       ...payload.query,
  //       type: this.urlParamkey == 'sale' ? 'sellerInvoice': 'buyerInvoice',
  //     }
  //   }
  //     this.commonService.getSTList('invoice', payload).subscribe((data) => {
  //       this.paymentData = data.documents;


  //       this.dataSource = new MatTableDataSource(
  //         data?.documents?.map((s: any, index) => {
  //           return {
  //             ...s,
  //             id: index + 1
  //           }
  //         })
  //       );
  //       // this.dataSource.paginator = this.paginator;
  //       this.dataSource.sort = this.sort1;
  //       this.toalLength = data.totalCount;
  //       this.count = data.documents.length;
  //       this.loaderService.hidecircle();
  //     }, () => {
  //       this.loaderService.hidecircle();
  //     });
  // }


  getRecieptList() {
  this.loaderService.showcircle();
  let payload = this.commonService.filterList();
  payload.size = this.pageSize;
  payload.from = this.from;
  payload.query = { 
    isExport: (this.isExport || this.isTransport)
  };
  payload.sort = { "desc": ["updatedOn"] };

  if (this.isBatchInvoice) {
    payload.query = { 
      ...payload.query,
      batchId: this.batch_ID
    };
  } else {
    payload.query = { 
      ...payload.query,
      type: this.urlParamkey == 'sale' ? 'sellerInvoice' : 'buyerInvoice'
    };
  }
  this.commonService.getSTList('invoice', payload).subscribe({
    next: (data: any) => {
      this.paymentData = data.documents;
      this.dataSource = new MatTableDataSource(
        data.documents.map((s: any, index: number) => ({
          ...s,
          id: index + 1
        }))
      );
      this.dataSource.sort = this.sort1;
      this.toalLength = data.totalCount;
      this.count = data.documents.length;
      const checkInvoiceIds = data.documents
        .filter((doc: any) => doc.invoiceApprovalEnabled === true)
        .map((doc: any) => doc.invoiceId);
this.CheckInvoiceIds=checkInvoiceIds;
      if (checkInvoiceIds.length > 0) {
        const payload = {
  query: {
    invoiceId: {
      $in: this.CheckInvoiceIds
    }
  },
  size: 1000,
  from: 0,
  project: []
};

        this.commonService.getSTList('invoiceaction', payload).subscribe({
          next: (actionData: any) => {
             this.checkInvoice = Array.isArray(actionData?.documents)
        ? actionData.documents.map((doc: any) => ({
           ...doc,
          }))
        : [];
            this.loaderService.hidecircle();
          },
          error: () => {
            this.loaderService.hidecircle();
          }
        });
      } else {
        this.loaderService.hidecircle();
      }
    },
    error: () => {
      this.loaderService.hidecircle();
    }
  });
}


 

  filter(e) {
    this.size = e.target.value;
    this.fromSize = 1;
    this.getRecieptList();
  }
 
  openPOPUP(content2,element){
    this.modalService
    .open(content2, {
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
          this.onEditInvoice(element,'edit')
        }
      }
    );
  }
  openApproveModal(contentApprove: any, element: any) {
    console.log(this.checkInvoice,"for checking invocie");
  const alreadyActioned = this.checkInvoice?.some(
    (action: any) =>
      action.invoiceId === element.invoiceId &&
      action.departmentId === this.userData?.department?.[0]?.item_id&&
      (action.action === 'approve' || action.action === 'reject')
  );
  console.log(alreadyActioned,"alreadycheck");
  if (alreadyActioned) {
    this.notification.create('warning', 'You have already approved or rejected this invoice', '');
    return;
  }
  this.selectedInvoice = element;
  this.remark = '';
  this.showRemarkError = false;
  this.modalService.open(contentApprove, { centered: true });
}

openRejectModal(contentReject: any, element: any) {
  const alreadyActioned = this.checkInvoice?.some(
    (action: any) =>
      action.invoiceId === element.invoiceId && 
      (action.action === 'approve' || action.action === 'reject')
  );
  if (alreadyActioned) {
    this.notification.create('warning', 'You have already approved or rejected this invoice', '');
    return;
  }
  this.selectedInvoice = element;
  this.remark = '';
  this.showRemarkError = false;
  this.modalService.open(contentReject, { centered: true });
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
            let data = 'invoice/' + id
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
 getUserList() {
    const parameter = {
      project: [],
      query: {
        userId: this.commonFunctions.getAgentDetails()?.userId,
      },
      size: 1000,
      from: 0,
    };

    this.commonService.getSTList(Constant.GET_USER, parameter).subscribe({
      next: (data: any) => {
        if (data.documents && data.documents.length > 0) {
          this.userData = data.documents[0];
          console.log('User data loaded:', this.userData);
        } else {
          console.warn('No user data found');
        }
      },
      error: (err) => {
        console.error('Error fetching user data:', err);
      },
    });
  }
    submitAction(action: string, closeModal: any) {
    if (action === 'reject' && !this.remark.trim()) {
      this.showRemarkError = true;
        this.notification.create('error', 'Please Add Reamrks', '');
      return;
    }
    const payload = {
      invoiceId: this.selectedInvoice.invoiceId,
      action: action,
      remark: this.remark,
    };
    this.commonService.addToST('invoiceaction', payload).subscribe({
      next: (data: any) => {
         this.notification.create('success', `Invocie${action}ed Successfully`, '');
        closeModal('close');
        const payload = {
          query: {
            invoiceId: {
              $in: this.CheckInvoiceIds
            }
          },
          size: 1000,
          from: 0,
          project: []
        };
        this.commonService.getSTList('invoiceaction', payload).subscribe({
          next: (actionData: any) => {
         this.checkInvoice = Array.isArray(actionData?.documents)
        ? actionData.documents.map((doc: any) => ({
            ...doc,

          }))
        : [];
            this.loaderService.hidecircle();
          },
          error: () => {
            this.loaderService.hidecircle();
          }
        });
      },
      error: (err) => {
        console.error(err);
          this.notification.create('error', `'Something went wrong!`, '');
      },
    });
  }
  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.paymentData.map((row: any) => {
      storeEnquiryData.push({

        'Invoice No': row.invoiceNo,
        'Invoice Date': this.commonService.formatDateForExcelPdf(row.invoice_date),  
        'Bill No': row.billNo,
        'Party Name': row.invoiceToName,
        'batch No': row.batchNo,
        'MBL Name': row.mblName,
        'Container Nos': row.containerNos, 
        'Invoice Amount': row.invoiceAmount,
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

    const fileName = 'invoice.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  openPDF() {
    var prepare = [];
    this.paymentData.forEach(e => {
      var tempObj = []; 

      tempObj.push(e.invoiceNo); 
      tempObj.push(this.commonService.formatDateForExcelPdf(e.invoice_date));
      tempObj.push(e.billNo);
      tempObj.push(e.invoiceToName);
      tempObj.push(e.batchNo);
      tempObj.push(e.mblName);
      tempObj.push(e.containerNos);
      tempObj.push(e.invoiceAmount);
      tempObj.push(e.balanceAmount); 
    });
    const doc = new jsPDF('p', 'mm', [497, 410]);
    autoTable(doc, {
      head: [['Invoice No', 'Date', 'Bill No.', 'Party Name' , 'Batch No.','MBL' ,'Containers','Amount','Balance']],
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
      { "invoiceNo": { "$regex": query, "$options": "i" } },
      { "invoice_date": { "$regex": query, "$options": "i" } },
      { "billNo": { "$regex": query, "$options": "i" } },
      { "invoiceToName": { "$regex": query, "$options": "i" } },
      { "batchNo": { "$regex": query, "$options": "i" } },
      { "mblName": { "$regex": query, "$options": "i" } },
      { "containerNos": { "$regex": query, "$options": "i" } },
      { "invoiceAmount": { "$regex": query, "$options": "i" } }, 
      { "balanceAmount": { "$regex": query, "$options": "i" } } 
    )

 
    let payload = this.commonService.filterList()

    payload.size = Number(10000);
    payload.from = this.page - 1;
    payload.query = {  
      "isExport": (this.isExport || this.isTransport),
      "$or": shouldArray
      // type: this.urlParamkey == 'sale' ? 'sellerInvoice': 'buyerInvoice',
    }
    payload.sort = {
      "desc": ["updatedOn"]
    }
    if(this.isBatchInvoice){
      payload.query = { 
        ...payload.query,
        batchId : this.batch_ID
      }
    }else{
      payload.query = { 
        ...payload.query,
        type: this.urlParamkey == 'sale' ? 'sellerInvoice': 'buyerInvoice',
      }
    }


    this.commonService.getSTList('invoice', payload)
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

        if (this.displayedColumns[ind] == 'invoice_date') {
          this.filterKeys['invoice_date'] = {
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

    this.filterKeys['isExport'] = (this.isExport || this.isTransport)
    let payload = this.commonService.filterList()

    payload.size = Number(10000);
    payload.from = this.page - 1;
    payload.query = { ...this.filterKeys ,
      // type: this.urlParamkey == 'sale' ? 'sellerInvoice': 'buyerInvoice',
    }
    payload.sort = {
      "desc": ["updatedOn"]
    }
    if(this.isBatchInvoice){
      payload.query = { 
        ...payload.query,
        batchId : this.batch_ID
      }
    }else{
      payload.query = { 
        ...payload.query,
        type: this.urlParamkey == 'sale' ? 'sellerInvoice': 'buyerInvoice',
      }
    }
      this.commonService.getSTList('invoice', payload).subscribe((data) => {
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
    
    let type = element?.paymentStatus == 'Unpaid' ? 'edit': 'show'
    if(this.isBatchInvoice){
      this.router.navigate(['/batch/list/add/' + this.urlParam.id + '/invoice/' + element.invoiceId + '/'+type], {
        queryParams: {
          type: element.type
        },
      })
    }else{ 
      this.router.navigate([
        '/finance/' + this.urlParamkey + '/' + element.invoiceId + '/'+type,
      ]);
    }
    
  }

  printData(e) {
    let reportpayload: any;
    let url: any;
    reportpayload = { "parameters": { "invoiceId": e } };
    url = 'newInvoiceTax'
    this.commonService.pushreports(reportpayload, url).subscribe({
      next: (res: any) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        let temp = URL.createObjectURL(blob);
        window.open(temp);
        // pdfWindow.print();
      }
    }) 
  }
}
