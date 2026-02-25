import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { shared } from '../../data';
import { ApiSharedService } from '../api-service/api-shared.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonFunctions } from '../../functions/common.function';
import { DatePipe, Location } from '@angular/common';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { CommonService } from 'src/app/services/common/common.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { Invoice } from 'src/app/models/invoice';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
@Component({
  selector: 'app-vendor-bill',
  templateUrl: './vendor-bill.component.html',
  styleUrls: ['./vendor-bill.component.scss']
})
export class VendorBillComponent implements OnInit {
  _gc=GlobalConstants;
  @Input() isparent: any = "finance";
  vendorBillData = shared.vendorBillRow;
  urlParam: any;
  currentUrl: any;
  filterBody = this.apiService.body
  toalLength: number;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  billsList: Invoice[] = [];
  closeResult: string;
  isPath: any;
  searchBillNo: string;
  searchVendor: string;
  searchDate: string;
  searchDeuDate: string;
  searchAmount: string;
  searchStatus: string;
  globalSearch: string;
  isExport: boolean;
  shouldArray: any;
  @ViewChild(MatDrawer) drawer: MatDrawer | any;
  dataSource = new MatTableDataSource();
  pagenation = [20, 50, 100];
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns =[
    '#',
   'paymentId',
   'invoiceFromName',
   'billNo',
   'invoiceDate',
   'invoiceDueDate',
   'invoiceAmount',
    'invoiceStatus',
    'action', 
  ];
  userData: any;
  currentAgent: any;
  isImport: boolean;
  isTransport: boolean;
  constructor(public modalService: NgbModal,
    public commonfunction: CommonFunctions,
    public notification: NzNotificationService,
    public apiService: ApiSharedService,
    public router: Router,
    private location: Location,public cognito : CognitoService,
    public route: ActivatedRoute,
    public datepipe: DatePipe,
    public loaderService: LoaderService,
    public commonService  : CommonService) {
      this.modalService = modalService;
      this.commonfunction = commonfunction;
      this.apiService = apiService;
      this.notification = notification;
      this.router = router;
      this.location = location;
      this.cognito = cognito;
      this.route = route;
      this.datepipe = datepipe;
      this.commonService = commonService
    this.route.params.subscribe(params =>
      this.urlParam = params
    );
    this.isExport   = localStorage.getItem('isExport') === 'true' ? true : false;
    this.isImport = localStorage.getItem('isImport') === 'true' ? true : false;
    this.isTransport = localStorage.getItem('isTransport') === 'true' ? true : false;
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();
  
    let stringToSplit = location.path();
    let x = stringToSplit.split('/');
    this.isPath = x[1];

    if(this.currentUrl === 'bill-posting'){
      this.displayedColumns =[
        '#',
        // 'paymentId',
        'invoiceNo',
        'invoiceFromName',
        'billNo',
        'invoiceDate',
        'invoiceDueDate',
        'invoiceAmount',
         'invoiceStatus',
         'action', 
      ];
    }else{
      this.displayedColumns =[
        '#',
        'invoiceNo',
        'invoiceFromName',
        'billNo',
        'invoiceDate',
        'invoiceDueDate',
        'invoiceAmount',
         'invoiceStatus',
         'action', 
      ];
    }
    this.displayedColumns1 = this.displayedColumns.map((x, i) => x+'_'+i);
  }

  onOpenNew() {
    if (this.isparent === 'batch') {
      this.router.navigate(['/batch/list/add/' + this.urlParam.id + '/' + this.urlParam.key + '/add']);
    }
    else {
      this.router.navigate(['/finance/' + this.urlParam.key + '/add']);
    }
  }

  onOpenEdit(id) {
    if (this.isparent === 'batch') {
      this.router.navigate(['/batch/list/add/' + this.urlParam.id + '/' + this.urlParam.key + '/' + id + '/edit']);
    }
    else {
      this.router.navigate(['/finance/' + this.urlParam.key + '/' + id + '/edit']);
    }
  }

  onBillAction() {
    if (this.isparent === 'batch') {
      this.router.navigate(['/batch/list/add/' + this.urlParam.id + '/' + this.urlParam.key]);
    }
    else {
      this.router.navigate(['/finance/' + this.urlParam.key]);
    }
  }

  ngOnInit(): void {
    this.currentAgent = this.commonfunction.getActiveAgent()
    this.cognito.getagentDetails()?.subscribe((resp) => {
      if (resp != null) {
        this.userData = resp
      }
    })
    this.getBillsList()
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
  getBillsList() {
    this.loaderService.showcircle();
    let payload = this.commonService.filterList()

    if(payload?.size)payload.size =Number(10000);
    if(payload?.from)payload.from = this.page - 1;
    if(payload?.query)payload.query = {
      "isExport": (this.isExport || this.isTransport),
      "invoiceType": "bills",
    }
    if (this.isPath === 'batch') {
      payload.query['batchId'] = this.route.snapshot.params['id']
    }
    if(payload?.sort)payload.sort = {
      "desc" : ["updatedOn"]
    },
    this.commonService.getSTList('invoice',payload)?.subscribe((data) => {
      this.billsList = data.documents;
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
    });
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
    this.getBillsList()
  }
  search() {
    let mustArray = {};
    if (this.searchBillNo) {
      mustArray['billNo'] = {
        "$regex" : this.searchBillNo,
        "$options": "i"
    }
    }
    if (this.searchVendor) {
      mustArray['invoiceFromName'] = {
        "$regex" : this.searchVendor,
        "$options": "i"
    }
    }

    if (this.searchAmount) {
      mustArray['invoiceAmount'] = {
        "$regex" : this.searchAmount,
        "$options": "i"
    }
    }   
    
    if (this.searchDate) {
      mustArray['invoiceDate']= {
        "$gt" : this.searchDate.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.searchDate.substring(0, 10) + 'T23:59:00.000Z'
    }
    }
    if (this.searchDeuDate) {
      mustArray['invoiceDueDate']= {
        "$gt" : this.searchDeuDate.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.searchDeuDate.substring(0, 10) + 'T23:59:00.000Z'
    }
    }
  
    if (this.searchStatus) {
      mustArray['invoiceStatus'] = {
        "$regex" : this.searchStatus,
        "$options": "i"
    }
    }
    mustArray['isExport'] = ( this.isExport || this.isTransport);
    mustArray['invoiceType'] =  "bills";
    if (this.isPath === 'batch') {
      mustArray['batchId'] = this.route.snapshot.params['id']
    }
    let payload = this.commonService.filterList()

    payload.size =Number(this.size);
    payload.from = 0;
    payload.query = mustArray
    payload.sort = {
      "desc" : ["updatedOn"]
    },
    this.commonService.getSTList('invoice',payload).subscribe((data: any) => {
      this.billsList = data?.documents?.map((s: any,index) => {
        return{
          ...s,
          id:index+1
        }
      });
      this.toalLength = data.totalCount;
      this.count = data.documents.length;
      this.fromSize =1
    });
  }
  clear() {
    this.searchBillNo = '';
    this.searchVendor = '';
    this.searchDate = '';
    this.searchDeuDate = '';
    this.searchAmount = '';
    this.searchStatus = '';
    this.getBillsList()
  }
  getPaginationData(type: any) {
    this.fromSize = type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
    let payload = this.commonService.filterList()

    payload.size =Number(this.size);
    payload.from = this.fromSize - 1;
    payload.query = {
      "isExport": (this.isExport || this.isTransport),
      "invoiceType": "bills",
    }
    if (this.isPath === 'batch') {
      payload.query['batchId'] = this.route.snapshot.params['id']
    }
    payload.sort = {
      "desc" : ["updatedOn"]
    },
    this.commonService.getSTList('invoice',payload).subscribe((data) => {
      this.billsList = data.documents;
      this.toalLength = data.totalCount;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count = type === 'prev' ? this.toalLength === this.count ? this.count - (this.toalLength % Number(this.size)) : this.count - data.documents.length : this.count + data.documents.length
    })
  }

  delete(content1, id) {
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
            let deleteBody = 'invoice' + id
            this.commonService.deleteST(deleteBody).subscribe(() => {
              setTimeout(() => {
                this.notification.create('success', 'Deleted Successfully', '');
                this.getBillsList()
              }, 1000);
             
            }, error => {
              this.notification.create(
                'error',
                error?.error?.error?.message,
                ''
              );
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
  mailST(data) {
    if (!data?.invoiceAmount || !data?.invoiceDueDate) {
      this.notification.create('error', 'Bill Amount & Bill Due date required', '');
      return false
    }
    // let userData = this.commonfunction.getUserDetails();
   
        let userData = this.userData
        let payload = this.commonService.filterList()
        payload.query = {
          "partymasterId": data?.vendorId
        }
        this.commonService.getSTList('partymaster', payload).subscribe((res) => {
    
          if (res.documents.length > 0) {
            let emaildata = `
          ${'Total Bill Ammout :'} : ${data?.invoiceAmount}
          ${'Bill Due Date :'} : ${data?.invoiceDueDate}  `
    
            let payload = {
              sender: {
                name: userData?.userName,
                email: userData.userEmail
              },
              to: [{
                name: data?.invoiceFromName,
                email: res.documents[0].primaryMailId,
              }],
              textContent: `${emaildata}`,
              subject: "Payment Details",
            }
          
            this.apiService.sendEmail(payload).subscribe(
              (res) => {
                if (res.status == "success") {
                  this.notification.create('success', 'Email Send Successfully', '');
                }
                else {
                  this.notification.create('error', 'Email not Send', '');
                }
              }
            );
          }
        });
     
  
  }
 
  posting(id) {
    this.router.navigate(['/finance/' + this.urlParam.key + '/' + id + '/posting']);
  }
  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.billsList.map((row: any) => {
      storeEnquiryData.push({
        'Bill No': row.billNo,
        'Vendor': row.invoiceFromName,
        'Bill Date': row.invoiceDate,
        'Bill Due Date': row.invoiceDueDate,
        'Amount': row.invoiceAmount,
        'Status': row.invoiceStatus,

      });
    });
    const myworksheet: XLSX.WorkSheet =
      XLSX.utils.json_to_sheet(storeEnquiryData);
    const myworkbook: XLSX.WorkBook = {
      Sheets: { data: myworksheet },
      SheetNames: ['data'],
    };
   

    const fileName = 'vendor-bill.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }
  openPDF() {
    var prepare = [];
    this.billsList.forEach(e => {
      var tempObj = [];
      tempObj.push(e.billNo);
      tempObj.push(e.invoiceFromName);
      tempObj.push(this.datepipe.transform(e.invoiceDate, 'dd-MM-YYYY,hh:mm'));
      tempObj.push(this.datepipe.transform(e.invoiceDueDate, 'dd-MM-YYYY,hh:mm'));
      tempObj.push(e.invoiceAmount);
      tempObj.push(e.invoiceStatus);
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [297, 210]);
    autoTable(doc, {
      head: [['Bill No', 'Vendor', 'Bill Date', 'Bill Due Date', 'Amount', 'Status']],
      body: prepare
    });
    doc.save('vendor-bill' + '.pdf');
  }
  clearGloble() {
    this.globalSearch = '';
    this.clear()
  }
  searchGlobal() {
    let  query = this.globalSearch
   
    let shouldArray = [];
    shouldArray.push(
      {"billNo": {  "$regex": query ,"$options": "i"  } },
      {"invoiceFromName": {  "$regex": query ,"$options": "i"  } },
      { "invoiceDate": {  "$regex": query ,"$options": "i" } },
      { "invoiceDueDate": {  "$regex": query  ,"$options": "i"  } },
      { "invoiceAmount": {  "$regex": query  ,"$options": "i"  } },
      { "invoiceStatus": {  "$regex": query  ,"$options": "i"  } }
     )

    var parameter = {
      "project": [ ],
      "query": {
        "isExport": (this.isExport || this.isTransport),
        "invoiceType": "bills",
        "$or": shouldArray},
      "sort" :{
          "desc" : ["updatedOn"]
      },
      size: Number(this.size),
      from: 0,
  }
    this.commonService.getSTList('invoice',parameter)
      .subscribe((data: any) => {
        this.billsList = data.documents;
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
      'bill',
      this.displayedColumns,
      actualColumns
    );
  }

  searchColumns() {
    this.filterKeys = {};
    this.filtersModel.forEach((each, ind) => {
      if(each){

        if (this.displayedColumns[ind] == 'invoiceDate' || this.displayedColumns[ind] == 'invoiceDueDate') {
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
  
  this.filterKeys['isExport'] =( this.isExport || this.isTransport)
  this.filterKeys['invoiceType'] = "bills"
  if (this.isPath === 'batch') {
    this.filterKeys['batchId'] = this.route.snapshot.params['id']
  }
  let payload = this.commonService.filterList()

  payload.size =Number(10000);
  payload.from = this.page - 1;
  payload.query = { ...this.filterKeys }

  payload.sort = {
    "desc" : ["updatedOn"]
  },
  this.commonService.getSTList('invoice',payload).subscribe((data) => {
    this.billsList = data.documents; 
    this.dataSource = new MatTableDataSource(
      data?.documents?.map((s: any,index) => {
        return{
          ...s,
          id:index+1
        }
      }));
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
    this.getBillsList( );
  }

  navigateToNewTab(element) { 
    let url = element.invoiceId+'/edit'
    this.router.navigate(['/finance/bills/'+url])
  }
}

