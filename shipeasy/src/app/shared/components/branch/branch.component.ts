import { Component, OnInit, Input, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BaseBody } from 'src/app/admin/smartagent/base-body';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
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
import { Branch } from 'src/app/models/yard-cfs-master';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
@Component({
  selector: 'app-branch',
  templateUrl: './branch.component.html',
  styleUrls: ['./branch.component.css'],
})
export class BranchComponent implements OnInit , OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  @Input() prentPath: any;
  urlParam: any;
  currentUrl: any;
  branchList: Branch[] = [];
  baseBody: BaseBody = new BaseBody();
  toalLength: any;
  count = 0;
  fromSize: number = 1;
  page = 1;
  size = 1000;
  branchname:string
  city :string;
  country:string;
  portname :string;
  phone :string;
  status :string;
  closeResult: string;
  partyid:string;
  _gc=GlobalConstants
  @ViewChild(MatDrawer) drawer: MatDrawer | any;
  dataSource = new MatTableDataSource();
  pagenation = [10,20, 50, 100];
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns =[
    '#',
   'branchName',
   'currency',
   'addressInfo.cityName',
   'addressInfo.countryName',
  //  'portName',
   'status',
    'action',
  ];

  constructor(
    public modalService: NgbModal,
    public notification: NzNotificationService,
    public router: Router,
    public route: ActivatedRoute,
    private sharedService: ApiSharedService,
    public commonService : CommonService,
    private commonfunction :CommonFunctions,
    public loaderService: LoaderService,
  ) {
    this.route.params.subscribe((params) => (this.urlParam = params));
    this.partyid = this.route.snapshot.params['id'];
  }

  onOpenNew() {
    this.router.navigate([
      this.prentPath + '/' + this.urlParam.key + '/addbranch',
    ]);
  }

  onOpenEdit(branchId) {
    this.router.navigate([
      this.prentPath + '/' + this.urlParam.key + '/' + branchId + '/editbranch',
    ]);
  }

  ngOnInit(): void {
    this.prentPath = this.prentPath + '/' + this.urlParam.id;
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();
    this.getBranchList();
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
    this.getBranchList();
  }
  getPaginationData(type: any) {
    this.fromSize =
      type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;

    let payload = this.commonService.filterList()

    payload.query = {
      parentId: this.partyid,
    }
    payload.size =Number(this.size);
    payload.from = this.fromSize - 1;
    payload.sort = {
      "desc" : ["updatedOn"]
    },

    this.commonService.getSTList('branch',payload).subscribe((data) => {
      this.branchList = data.documents;
      this.toalLength = data.totalCount;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count = type === 'prev' ? this.toalLength === this.count ? this.count - (this.toalLength % Number(this.size)) : this.count - data.documents.length : this.count + data.documents.length;
    });
  }

  search() {
      let mustArray = {};
      mustArray['parentId']  = this.partyid
      if (this.branchname) {
        mustArray['branchName'] = {
          "$regex" : this.branchname,
          "$options": "i"
      }
      }
      if (this.city) {
        mustArray['addressInfo.cityName'] = {
          "$regex" : this.city,
          "$options": "i"
      }
      }
      if (this.country) {
        mustArray['addressInfo.countryName'] = {
          "$regex" : this.country,
          "$options": "i"
      }
      }
      if (this.portname) {
        mustArray['portName'] = {
          "$regex" : this.portname,
          "$options": "i"
      }
      }
      if (this.status) {
        mustArray['status'] =  this.status === 'true' ? true:false
      }


    let payload = this.commonService.filterList()

    payload.query = mustArray
    payload.size =Number(this.size);
    payload.from = 0;
    payload.sort = {
      "desc" : ["updatedOn"]
    },

    this.commonService.getSTList('branch',payload).subscribe((data) => {
      this.branchList = data.documents?.map((s: any,index) => {
        return{
          ...s,
          id:index+1
        }
      })
      this.toalLength = data.totalCount;
      this.count = data.documents.length;
      this.fromSize =1
    });
  }

  clear() {
    this.branchname = '';
    this.city = '';
    this.country = '';
    this.portname = '';
    this.phone = '';
    this.status = '';
    this.getBranchList();
  }

  pageNumber = 1;
  pageSize = 10;
  from = 0;
  totalCount = 0;

  onPageChange(event){
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.from = event.pageIndex*event.pageSize ;
    this.getBranchList();
  }

  getBranchList() {
    this.loaderService.showcircle();
    let payload = this.commonService.filterList()
    if(payload?.size)payload.size= this.pageSize,
    payload.from=this.from
    if(payload?.query)payload.query = {
      parentId: this.partyid,
      }
      if(payload?.size)payload.size =this.pageSize;
      if(payload?.from)payload.from = this.from;
      if(payload?.sort)payload.sort = {
        "desc" : ["updatedOn"]
      },
    this.commonService.getSTList('branch',payload)
      ?.subscribe((data) => {

        this.count = data.documents.length;

        this.dataSource = new MatTableDataSource(
          data?.documents?.map((s: any,index) => {
            return{
              ...s,
              id:index+1+this.from
            }
          })
        );
        // this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1;
        this.branchList = data.documents;
        this.toalLength = data.totalCount;
        this.loaderService.hidecircle();
      },()=>{
        this.loaderService.hidecircle();
      });
  }

  onDelete(branchId: any, content1) {
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
            let deleteBody =   'branch' + branchId
            this.commonService
              .deleteST(deleteBody)
              .subscribe((data: any) => {
                if (data) {
                  this.getBranchList();
                }
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
  changeStatus(data) {
    this.commonService.UpdateToST(`branch/${data.branchId}`,{ ...data, status: !data?.status }).subscribe((res: any) => {
      if (res) {
        this.notification.create(
          'success',
          'Status Updated Successfully',
          ''
        );  setTimeout(() => {
          this.search();
          this.getBranchList();
        }, 1000);
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
    this.branchList.map((row: any) => {
      storeEnquiryData.push({
        'Brach Name': row.branchName,
        'City': row.addressInfo?.cityName,
        'Country': row.addressInfo?.countryName,
        'Port Services': row.portName,
        'status': row.status ? 'Active' : 'Inactive',
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

    const fileName = 'branch.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  openPDF() {
    var prepare=[];
    this.branchList.forEach(e=>{
      var tempObj =[];
      tempObj.push(e.branchName);
      tempObj.push(e.addressInfo?.cityName);
      tempObj.push(e.addressInfo?.countryName);
      tempObj.push(e.portName);
      tempObj.push(e.status ? 'Active' : 'Inactive');
    });
    const doc = new jsPDF('p', 'mm', [397, 310]);
    autoTable(doc,{
        head: [['Branch Name','City','Country','Port Services','status']],
        body: prepare
    });
    doc.save('branch' + '.pdf');
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
      'USER',
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

  this.filterKeys['parentId'] = this.partyid
  let payload = this.commonService.filterList()
  payload.query = {
   ...this.filterKeys
    }
    payload.size =Number(this.size);
    payload.from = 0;
    payload.sort = {
      "desc" : ["updatedOn"]
    },
  this.commonService.getSTList('branch',payload)
    .subscribe((data) => {
      this.branchList = data.documents;
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
    this.getBranchList( );
  }

  navigateToNewTab(element) {
    let url =   element?.branchId+'/editbranch'
    window.open(window.location.href +'/'+url );
  }
}
