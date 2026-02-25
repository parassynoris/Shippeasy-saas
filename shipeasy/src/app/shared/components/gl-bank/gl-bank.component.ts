import { Component, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BaseBody } from './base-body';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ApiSharedService } from '../api-service/api-shared.service';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/services/common/common.service';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { CommonFunctions } from '../../functions/common.function';
import { banklist } from 'src/app/models/bank-master';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
@Component({
  selector: 'app-gl-bank',
  templateUrl: './gl-bank.component.html',
  styleUrls: ['./gl-bank.component.css'],
})
export class GlBankComponent implements OnInit , OnDestroy , OnChanges {
  private ngUnsubscribe = new Subject<void>();
  bankData: any = [];
  urlParam: any;
  currentUrl: any;
  bankList: banklist[] = [];
  baseBody: BaseBody = new BaseBody();

  fromSize: number = 1;
  toalLength: any;
  size = 10;
  page = 1;
  count = 0;
  bankName: any;
  accountNo: any;
  swiftCode: any;
  currency: any;
  branchName: any;
  countryName: any;
  status: any;
  isParentPath: any;
  isView:any;
  @Input() prentPath: any;
  parentId: any = '';
  _gc=GlobalConstants;
  @ViewChild(MatDrawer) drawer: MatDrawer | any;
  dataSource = new MatTableDataSource();
  pagenation = [10,20, 50, 100];
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns =[
    '#',
   'bankName',
   'accountNo',
   'swiftCode',
   'currency',
   'branchName',
   'country.countryName',
  //  'status', 
    'action', 
  ];
  constructor(
    public router: Router,
    public route: ActivatedRoute,
    private sharedService: ApiSharedService,
    public modalService: NgbModal,
    public notification: NzNotificationService,
    public commonService : CommonService,
    public commonfunction :CommonFunctions,
    public loaderService: LoaderService,
  ) {
    this.route.params.subscribe((params) => (this.urlParam = params));
    this.parentId = this.route.snapshot.params['id'];
    this.getBankList(); 
  
  }

  ngOnChanges(){
    this.getBankList(); 
  }
  onOpenNew() {
    if (this.isParentPath === 'master') {
      this.router.navigate([
        this.isParentPath + '/' + this.urlParam.key + '/add',
      ]);
    } else {
      this.router.navigate([
        this.prentPath + '/' + this.urlParam.key + '/addbank',
      ]);
    }
  }

  
  onOpenEdit(id,show?) {
    const isShow=show?true:false;
    if (this.isParentPath === 'master') {
      this.router.navigate([
        this.isParentPath + '/' + this.urlParam.key + '/' + id + '/edit',
      ]);
    } else {
      if(isShow){
        this.router.navigate([
          this.prentPath + '/' + this.urlParam.key + '/' + id + '/editbank',
        ],{queryParams:{isShow:isShow}});

      }
      else{
        this.router.navigate([
          this.prentPath + '/' + this.urlParam.key + '/' + id + '/editbank',
        ]);
      }
    }
  }

  ngOnInit(): void {
    this.prentPath = this.prentPath + '/' + this.urlParam.id;
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();
    this.isParentPath = location.pathname.split('/')[1];
  
  }

  getBankList() { 
    this.loaderService.showcircle();
    let payload = this.commonService.filterList()

    if(payload?.size)payload.size =Number(this.size);
    if(payload?.from)payload.from = this.page - 1;
    if(payload?.query)payload.query = {
      isBank: true,
      parentId: this.parentId,
    }
    if(payload?.sort)payload.sort = {
      "desc" : ["updatedOn"]
    },
    this.commonService.getSTList('bank',payload)
      ?.subscribe((data) => {
        this.bankList = data.documents;
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

  onDelete(bankId: any) {
    let deleteBody = 'bank'+ bankId
    this.commonService.deleteST(deleteBody).subscribe((data: any) => {
      if (data) {
        this.getBankList();
      }
    });
  }

  delete(deleteCostHeadMap, id) {
    this.modalService
      .open(deleteCostHeadMap, {
        backdrop: 'static',
        keyboard: false,
        centered: true,
        size: '',

        ariaLabelledBy: 'modal-basic-title',
      })
      .result.then(
        (result) => {
          if (result === 'yes') {
            let deleteBody = 'bank'+ id.bankId
            this.commonService.deleteST(deleteBody).subscribe((res: any) => {
              this.notification.create('success', 'Delete Successfully', '');
              this.getBankList();
            });
          }
        },
        (reason) => {
          // do nothing.
        }
      );
  }

  clear() {
    this.bankName = '';
    this.accountNo = '';
    this.swiftCode = '';
    this.currency = '';
    this.branchName = '';
    this.countryName = '';
    this.status = '';
    this.getBankList();
  }

  next() {
    if (this.toalLength > this.count) {
      this.getPaginationData('next');
    }
  }

  prev() {
    if (this.page > 0 && this.page !== 1) {
      this.getPaginationData('prev');
    }
  }

  filter(e) {
    this.size = e.target.value;
    this.fromSize = 1;
    this.getBankList();
  }

  search() {
     
    let mustArray = {};
    mustArray['isBank'] = true 
    if (this.parentId) { 
      mustArray['parentId'] = this.parentId 
    }
    if (this.bankName) {
      mustArray['bankName'] = {
        "$regex" : this.bankName,
        "$options": "i"
    }
    }
    
    if (this.accountNo) {
      mustArray['accountNo'] = {
        "$regex" : this.accountNo,
        "$options": "i"
    }
    }
    if (this.swiftCode) {
      mustArray['swiftCode'] = {
        "$regex" : this.swiftCode,
        "$options": "i"
    }
    }
    if (this.currency) {
      mustArray['currency'] = {
        "$regex" : this.currency,
        "$options": "i"
    }
    }
    if (this.branchName) {
      mustArray['branchName'] = {
        "$regex" : this.branchName,
        "$options": "i"
    }
    }
    if (this.countryName) {
      mustArray['countryName'] = {
        "$regex" : this.countryName,
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
      this.bankList = data.hits.hits?.map((s: any,index) => {
        return{
          ...s,
          id:index+1
        }
      })
      this.toalLength = data.hits.total.value;
      this.count = data.hits.hits.length;
      this.fromSize =1
    });
  }

  getPaginationData(type: any) {
    this.fromSize =
      type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
     
      let payload = this.commonService.filterList()

      payload.size =Number(this.size);
      payload.from = this.fromSize  -1;
      payload.query = {
        isBank: true, parentId: this.parentId,
      }
      payload.sort = {
        "desc" : ["updatedOn"]
      },
      this.commonService.getSTList('invoice',payload).subscribe((data) => {
      this.bankList = data.hits.hits;
      this.toalLength = data.hits.total.value;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count = type === 'prev' ? this.toalLength === this.count ? this.count - (this.toalLength % Number(this.size)) : this.count - data.hits.hits.length : this.count + data.hits.hits.length;
    });
  }
  changeStatus(data) {
    this.commonService.UpdateToST(`bank/${data.bankId}`,{ ...data, status: !data?.status }).subscribe((res: any) => {
      if (res) {
        this.notification.create(
          'success',
          'Status Updated Successfully',
          ''
        );
        this.search();
      }
    }, error => {
      this.notification.create(
        'error',
        error?.error?.error?.message,
        ''
      );
    });
  }
  
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.bankList.map((row: any) => {
      storeEnquiryData.push({
        'Bank Name': row.bankName,
        'Account No': row.accountNo,
        'SWIFT Code': row.swiftCode,
        'Currency': row.currency,
        'Bank Branch': row.branchName,
        'Country': row.country?.countryName,
        'Status': row.status ? 'Active' : 'In Active',
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

    const fileName = 'bank.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  openPDF() {
    var prepare=[];
    this.bankList.forEach(e=>{
      var tempObj =[];
      tempObj.push(e.bankName);
      tempObj.push(e.accountNo);
      tempObj.push(e.swiftCode);
      tempObj.push(e.currency);
      tempObj.push(e.branchName); 
      tempObj.push(e.country.countryName);
      tempObj.push(e.status ? 'Active' : 'In Active');
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [297, 210]);
    autoTable(doc,{
        head: [['Bank Name','Account No','Swift Code','Currency','Branch Name','Country','Status']],
        body: prepare
    });
    doc.save('bank' + '.pdf');
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
      'invoice',
      this.displayedColumns,
      actualColumns
    );
  }

  searchColumns() {
    this.filterKeys = {};
    this.filtersModel.forEach((each, ind) => {
      if(each)
      this.filterKeys[this.displayedColumns[ind] ] =  {
        "$regex" : each.toLowerCase(),
        "$options": "i"
    } 
  });
  
  this.filterKeys['isBank'] = true
  this.filterKeys['parentId'] = this.parentId
  let payload = this.commonService.filterList()

  payload.size =Number(this.size);
  payload.from = this.page - 1;
  payload.query = {...this.filterKeys
  }
  payload.sort = {
    "desc" : ["updatedOn"]
  },
  this.commonService.getSTList('bank',payload)
    .subscribe((data) => {
      this.bankList = data.documents; 
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
    this.getBankList( );
  }

  navigateToNewTab(element) {
    let url = ''
       if (this.isParentPath === 'master') { 
        url = element?.bankId + '/edit'
    } else { 
      url = element?.bankId + '/editbank'
    }
  
    window.open(window.location.href +'/'+url );
  }
}
