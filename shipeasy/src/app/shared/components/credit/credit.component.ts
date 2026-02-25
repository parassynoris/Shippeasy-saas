import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from 'src/app/admin/principal/api.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { shared } from '../../data';
import { ApiSharedService } from '../api-service/api-shared.service';
import { CommonFunctions } from '../../functions/common.function';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { CommonService } from 'src/app/services/common/common.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { CreditDebitNote } from 'src/app/models/New-payment';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
@Component({
  selector: 'app-credit',
  templateUrl: './credit.component.html',
  styleUrls: ['./credit.component.scss']
})
export class CreditComponent implements OnInit {
  closeResult: string;
  creditData = shared.creditRow;
  creditList: CreditDebitNote[] = [];
  batchList: any = [];
  urlParam: any;
  currentUrl: any;
  filterBody = this.apiService.body
  isSmartAgentUser: any;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  toalLength: any;
  newCredit: any;
  partyMasterList: any;
  credit_note_no: any;
  credit_note_to: any;
  date: any;
  batch_no: any;
  amount: any;
  tax_amount: any;
  total_amount: any;
  creditNote: any;
  invoiceNo: any;
  isExport: boolean = false;
  _gc=GlobalConstants
  @ViewChild(MatDrawer) drawer: MatDrawer | any;
  dataSource = new MatTableDataSource();
  pagenation = [20, 50, 100];
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns =[
    '#',
   'creditNoteNo',
   'batchNo',
   'invoiceNumber',
   'creditDate',
   'creditToName',
   'amountReceived',
    'invoiceTaxAmount',
    'invoiceAmount',
    'action', 
  ];
  currentAgent: any;
  isTransport: boolean;
  isImport: boolean;
  constructor(public apiService: ApiSharedService,
    public commonService: CommonService,
    public router: Router,
    private route: ActivatedRoute,
    public modalService: NgbModal,
    private api: ApiService,
    private _cognit: CognitoService,
    private commonfunction: CommonFunctions,
    public loaderService: LoaderService,

  ) {
    this.route.params.subscribe(params =>
      this.urlParam = params
    );
    this.isExport    = localStorage.getItem('isExport') === 'true' ? true : false;
      this.isImport = localStorage.getItem('isImport') === 'true' ? true : false;
      this.isTransport = localStorage.getItem('isTransport') === 'true' ? true : false;
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();
  }

  onOpenCredit() {
    this.router.navigate(['/finance/' + this.urlParam.key + '/add']);
  }

  onCloseNew() {
    this.router.navigate(['/finance/' + this.urlParam.key]);
  }

  onEditCredit(id, show = 'edit') {
    this.router.navigate(['/finance/' + this.urlParam.key + '/' + id + `/${show}`]);
  }

  ngOnInit(): void {
    this.currentAgent = this.commonfunction.getActiveAgent()
    this.getCreditNoteList();

  }

  pageNumber = 1;
  pageSize = 20;
  from = 0;
  totalCount = 0;

  onPageChange(event){
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.from = event.pageIndex*event.pageSize ;
    this.getCreditNoteList();
  }

  getCreditNoteList() {
    this.loaderService.showcircle();
    let payload = this.commonService.filterList()

    if(payload?.size)payload.size =this.pageSize;
    if(payload?.from)payload.from = this.from;
    if(payload?.query)payload.query = {
      "isCredit": true,
      "isExport": (this.isExport || this.isTransport)
    }
    if(payload?.sort)payload.sort = {
      "desc" : ["updatedOn"]
    },
    
    setTimeout(() => {
      this.commonService.getSTList('creditdebitnote',payload).subscribe((data) => {
        this.creditList = data.documents;
       
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
    }, 500);


  }

  getPaginationData(type: any) {
    this.fromSize =
      type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
      let payload = this.commonService.filterList()

      payload.size =Number(this.size);
      payload.from = this.fromSize - 1;
      payload.query = {

        "isCredit": true,
        "isExport": (this.isExport || this.isTransport)
      }
      payload.sort = {
        "desc" : ["updatedOn"]
      },
      
      this.commonService.getSTList('creditdebitnote',payload).subscribe((data) => {
      this.creditList = data.documents;
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
    mustArray['creditNoteNo'] = (this.isExport || this.isTransport)
    mustArray['isCredit'] = true
    if (this.credit_note_no) {
      mustArray['creditNoteNo'] = {
        "$regex" : this.credit_note_no,
        "$options": "i"
    }
    }
    if (this.credit_note_to) {
      mustArray['creditToName'] = {
        "$regex" : this.credit_note_to,
        "$options": "i"
    }
    }
    if (this.date) {
      mustArray['creditDate']= {
        "$gt" : this.date.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.date.substring(0, 10) + 'T23:59:00.000Z'
    }
    }
    if (this.invoiceNo) {
      mustArray['invoiceNumber'] = {
        "$regex" : this.invoiceNo,
        "$options": "i"
    }
    }
    if (this.batch_no) {
      mustArray['batchNo'] = {
        "$regex" : this.batch_no,
        "$options": "i"
    }
    }
    if (this.amount) {
      mustArray['amountReceived'] = {
        "$regex" : this.amount,
        "$options": "i"
    }
    }
    if (this.tax_amount) {
      mustArray['invoiceTaxAmount'] = {
        "$regex" : this.tax_amount,
        "$options": "i"
    }
    }
    if (this.total_amount) {
      mustArray['invoiceAmount'] = {
        "$regex" : this.total_amount,
        "$options": "i"
    }
    }

    let payload = this.commonService.filterList()

    payload.size =Number(this.size);
    payload.from = this.fromSize - 1;
    payload.query = mustArray
    payload.sort = {
      "desc" : ["updatedOn"]
    },
    
    this.commonService.getSTList('creditdebitnote',payload).subscribe((data) => {
      this.creditList = data.documents?.map((s: any,index) => {
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
    this.credit_note_no = ''
    this.credit_note_to = ''
    this.date = ''
    this.batch_no = ''
    this.amount = ''
    this.tax_amount = ''
    this.invoiceNo = ''
    this.total_amount = ''
    this.getCreditNoteList()
  }


  onDelete(deleteInvoice, id) {
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
            let data =  'creditdebitnote'+id
            this.commonService
              .deleteST(data)
              .subscribe((res: any) => {

                this.getCreditNoteList();
              });
          }
        },
        (reason) => {
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

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.creditList.map((row: any) => {
      storeEnquiryData.push({
        'Credit Note No': row.creditNoteNo,
        'Credit Note To': row.creditToName,
        'Date': this.commonService.formatDateForExcelPdf(row.creditDate),
        'Job No': row.batchNo,
        'Invoive No': row.invoiceNumber,
        'Amount': row.amountReceived,
        'Tax Amount': row.invoiceTaxAmount,
        'Total Amount': row.invoiceAmount,

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

    const fileName = 'credit.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  openPDF() {
    var prepare = [];
    this.creditList.forEach(e => {
      var tempObj = [];
      tempObj.push(e.creditNoteNo);
      tempObj.push(e.creditToName);
      tempObj.push(this.commonService.formatDateForExcelPdf(e.creditDate));
      tempObj.push(e.batch_no);
      tempObj.push(e.invoiceNumber);
      tempObj.push(e.amountReceived);
      tempObj.push(e.invoiceTaxAmount);
      tempObj.push(e.invoiceAmount);
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [297, 210]);
    autoTable(doc, {
      head: [['Credit Note No', 'Credit Note To', 'Date', 'Job No', 'Invoice Number', 'Amount', 'Tax Amount', 'Total Amount']],
      body: prepare
    });
    doc.save('credit' + '.pdf');
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
      'credit',
      this.displayedColumns,
      actualColumns
    );
  }

  searchColumns() {
    this.filterKeys = {};
    this.filtersModel.forEach((each, ind) => {
      if(each){

        if (this.displayedColumns[ind] == 'creditDate'  ) {
          this.filterKeys[this.displayedColumns[ind]] = {
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
  this.filterKeys['isCredit'] = true
 
  let payload = this.commonService.filterList()

  payload.size =Number(1000);
  payload.from = this.page - 1;
  payload.query = { ...this.filterKeys}
 
   
    this.commonService.getSTList('creditdebitnote',payload).subscribe((data) => {
      this.creditList = data.documents; 
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
    this.getCreditNoteList( );
  }

  navigateToNewTab(element) { 
    let url = element.creditdebitnoteId+'/edit'
    this.router.navigate(['/finance/credit/' +url])
  }
}


