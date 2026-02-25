import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddDepartmentComponent } from './adddepartment/adddepartment.component';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ApiSharedService } from '../api-service/api-shared.service';
import { CommonService } from 'src/app/services/common/common.service';
import { Subject } from 'rxjs';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { CommonFunctions } from '../../functions/common.function';
import { Department } from 'src/app/models/department';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.scss']
})
export class DepartmentComponent implements OnInit , OnDestroy {
  _gc=GlobalConstants;
  public ngUnsubscribe = new Subject<void>();
  isParent: any;
  toalLength: number;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  deptData: Department[] = [];
  department: string;
  manager: string;
  email: string;
  status: string;
  closeResult: string;
  partyid: any;
  @ViewChild(MatDrawer) drawer: MatDrawer | any;
  dataSource = new MatTableDataSource();
  pagenation = [10,20, 50, 100];
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns =[
    '#', 
    'deptName',
   'deptManager',
   'deptEmail',
    // 'status',
    'action', 
  ];
  constructor(private modalService: NgbModal, 
    public commonService: CommonService, 
    private sharedService: ApiSharedService,
    private commonfunction : CommonFunctions,
    private route: ActivatedRoute,
    private notification: NzNotificationService,public loaderService: LoaderService,) { 
     this.isParent = location.pathname.split('/')[1];
      this.partyid = this.route.snapshot?.params['id'];
  }

  open(key, data) {
    const modalRef = this.modalService.open(AddDepartmentComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg'
    });
    modalRef.componentInstance.getList.subscribe((res: any) => {
      if (res) {
        this.getDepartmentList();
      }
    })
    modalRef.componentInstance.fromParent = data;
    modalRef.componentInstance.isType = key;
    modalRef.componentInstance.isDeptType = this.isParent;
    modalRef.componentInstance.partyid = this.partyid;
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

  getDepartmentList() {
    this.loaderService.showcircle();
    let payload = this.commonService.filterList()
   
    payload.size =Number(this.size);
    payload.from = this.page - 1;
    payload.query = {
    }
    if(this.partyid){
      payload.query['parentId'] = this.partyid
    } 
    payload.sort = {
      "desc" : ["updatedOn"]
    }, 
    this.commonService.getSTList('department',payload).subscribe((data) => {
      this.deptData = data.documents;
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
    this.getDepartmentList()
  }

  getPaginationData(type: any) {
    this.fromSize = type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
    let payload = this.commonService.filterList()
   
    payload.size =Number(this.size);
    payload.from = this.fromSize - 1;
    payload.query = {
    }
    if(this.partyid){
      payload.query['parentId'] = this.partyid
    } 
    payload.sort = {
      "desc" : ["updatedOn"]
    }, 
    this.commonService.getSTList('department',payload).subscribe(data => {
      this.deptData = data.documents;
      this.toalLength = data.totalCount;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count = type === 'prev' ? this.toalLength === this.count ? this.count - (this.toalLength % Number(this.size)) : this.count - data.documents.length : this.count + data.documents.length
    })
  }

  search() {
    let mustArray = {};
   
   
 
    if (this.department) {
      mustArray['deptName'] = {
        "$regex" : this.department,
        "$options": "i"
    }
    }
    if (this.manager) {
      mustArray['deptManager'] = {
        "$regex" : this.manager,
        "$options": "i"
    }
    }
    if (this.email) {
      mustArray['deptEmail'] = {
        "$regex" : this.email,
        "$options": "i"
    }
    }
    if (this.status) {
      mustArray['status'] = this.status === 'true'?true:false
    }
   

    let payload = this.commonService.filterList()
   
    payload.size =Number(this.size);
    payload.from = 0;
    payload.query = mustArray
    if(this.partyid){
      payload.query['parentId'] = this.partyid
    } 
    payload.sort = {
      "desc" : ["updatedOn"]
    }, 
    this.commonService.getSTList('department',payload).subscribe((data) => {
      this.deptData = data.documents?.map((s: any,index) => {
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
    this.department = ''
    this.manager = ''
    this.email = ''
    this.status = ''
    this.getDepartmentList()
  }


  changeStatus(data){
    this.commonService.UpdateToST(`department/${data.departmentId}`,{...data, status: !data?.status}).subscribe((res: any) => {
      if(res)
      {
        this.notification.create(
          'success',
          'Status Updated Successfully',
          ''
        );
      this.getDepartmentList();
      }
    }, error => {
      this.notification.create(
        'error',
        error?.error?.error?.message,
        ''
      );
    });
  }


  ngOnInit(): void {
    this.getDepartmentList();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.deptData.map((row: any) => {
      storeEnquiryData.push({
        'Department Name': row.deptName,
        'Manager': row.deptManager,
        'Email': row.deptEmail,
        'Status': row.status ? "Active" : "In Active",
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

    const fileName = 'department.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  openPDF() {
    var prepare=[];
    this.deptData.forEach(e=>{
      var tempObj =[];
      tempObj.push(e.deptName);
      tempObj.push(e.deptManager);
      tempObj.push(e.deptEmail);
      tempObj.push(e.status ? "Active" : "In Active");
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [297, 210]);
    autoTable(doc,{
        head: [['Department Name','Manager','Email','Status']],
        body: prepare
    });
    doc.save('department' + '.pdf');
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

  searchColumns() {
    this.filterKeys = {};
    this.filtersModel.forEach((each, ind) => {
      if(each)
      this.filterKeys[this.displayedColumns[ind] ] =  {
        "$regex" : each.toLowerCase(),
        "$options": "i"
    } 
  });
  
  
  if(this.partyid){
    this.filterKeys['parentId'] = this.partyid
    } 
  let payload = this.commonService.filterList()
   
  payload.size =Number(this.size);
  payload.from = this.page - 1;
  payload.query = {
    ...this.filterKeys
  } 
  payload.sort = {
    "desc" : ["updatedOn"]
  }, 
  this.commonService.getSTList('department',payload).subscribe((data) => {
    this.deptData = data.documents; 
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
    this.getDepartmentList( );
  }
}
