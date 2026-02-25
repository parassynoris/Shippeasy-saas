import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { AddholidayComponent } from './addholiday/addholiday.component';
import { BaseBody } from 'src/app/admin/smartagent/base-body';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subject } from 'rxjs';
import { ApiSharedService } from '../api-service/api-shared.service';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { CommonService } from 'src/app/services/common/common.service';
import { CommonFunctions } from '../../functions/common.function';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { Holiday } from './holiday';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
@Component({
  selector: 'app-holidays',
  templateUrl: './holidays.component.html',
  styleUrls: ['./holidays.component.css'],
})
export class HolidaysComponent implements OnInit, OnDestroy {
  _gc=GlobalConstants
  private ngUnsubscribe = new Subject<void>();
  HolidayData: Holiday[]= [];
  dataList: string;
  urlParam: any;
  fromSize: number = 1;
  toalLength: any;
  size = 1000;
  page = 1;
  count = 0;
  agentProfileName: string;
  baseBody: BaseBody = new BaseBody();
  @Input() prentPath: any;
  holidayName: string;
  countryName:  string;
  holidayDate:  string;
  partyid:  string;
  closeResult: string;
  @ViewChild(MatDrawer) drawer: MatDrawer | any;
  dataSource = new MatTableDataSource();
  pagenation = [10,20, 50, 100];
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns =[
    '#', 
   'holidayName',
   'country.countryName',
    'dateOfHoliday',
    'action', 
  ];
  constructor(
    public route: ActivatedRoute,
    public modalService: NgbModal,
    private sharedService: ApiSharedService,
    public commonfunction : CommonFunctions,
    public notification: NzNotificationService, public commonService : CommonService,
    public loaderService: LoaderService,
  ) {
    this.route.params.subscribe((params) => (this.urlParam = params));
    this.urlParam = this.prentPath;
    this.partyid = this.route.snapshot.params['id'];
  }
  ngOnInit(): void {
      this.getAll();
  }
  getAll() { 
    this.loaderService.showcircle();
    let payload = this.commonService.filterList()

    if(payload?.size)payload.size =Number(this.size);
    if(payload?.from)payload.from = this.page - 1;
    if(payload?.query)payload.query = {
      parentId: this.partyid,
    }
    if(payload?.sort)payload.sort = {
      "desc" : ["updatedOn"]
    },
    setTimeout(() => {
    this.commonService.getSTList('holiday',payload) 
      ?.subscribe((data: any) => {
        this.HolidayData = data.documents;
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
    }, 500);
  }

  changeStatus(data){
    this.commonService.UpdateToST(`holiday/${data.holidayId}`,{...data, status: !data?.status}).subscribe((res: any) => {
      if(res)
      {
        this.notification.create(
          'success',
          'Status Updated Successfully',
          ''
        );
        this.getAll();
      }
    }, error => {
      this.notification.create(
        'error',
        error?.error?.error?.message,
        ''
      );
    });
  }

  clear() {
    this.agentProfileName = '';
    this.countryName = '';
    this.holidayName = '';
    this.holidayDate = '';
    this.baseBody.baseBody.query.bool.must = [];

    this.page = 1;
    this.getAll();
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
    this.getAll();
  }

  search() {
    let mustArray = {};
    mustArray['parentId'] = this.partyid 
   
    if (this.holidayName) {
      mustArray['holidayName'] = {
        "$regex" : this.holidayName,
        "$options": "i"
    }
    }
    if (this.countryName) {
      mustArray['country.countryName'] = {
        "$regex" : this.countryName,
        "$options": "i"
    }
    }
    if (this.holidayDate) {
      mustArray['dateOfHoliday'] = {
        "$regex" : this.holidayDate,
        "$options": "i"
    }
    }
    

    let payload = this.commonService.filterList()

    payload.size =Number(this.size);
    payload.from =0;
    payload.query = mustArray
    payload.sort = {
      "desc" : ["updatedOn"]
    }, 
    this.commonService.getSTList('holiday',payload).subscribe((data) => {
      this.HolidayData = data.documents?.map((s: any,index) => {
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

  getPaginationData(type: any) {
    this.fromSize = type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
   
    let payload = this.commonService.filterList()

    payload.size =Number(this.size);
    payload.from = this.page - 1;
    payload.query = {
      parentId: this.partyid,
    }
    payload.sort = {
      "desc" : ["updatedOn"]
    }, 
    this.commonService.getSTList('holiday',payload).subscribe(data => {
      this.HolidayData = data.documents;
      this.toalLength = data.totalCount;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count = type === 'prev' ? this.toalLength === this.count ? this.count - (this.toalLength % Number(this.size)) : this.count - data.documents.length : this.count + data.documents.length
    })
  }

  open(content: any = null, guid: any = null,show?) {
    const modalRef = this.modalService.open(AddholidayComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
    modalRef.componentInstance.fromParent = guid;
    modalRef.componentInstance.prentPath = this.prentPath;
    modalRef.componentInstance.parentId =  this.partyid;
    modalRef.componentInstance.isType =  show;
    modalRef.componentInstance.isAddModeData = content;
    modalRef.componentInstance.golbalId = this.route.snapshot.params['id'];
    modalRef.componentInstance.passAddUserData.subscribe((res) => { 
          this.getAll();
    });
  }

  onEdit(content, guid: any,show?) {
    this.open(content, guid,show);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.HolidayData.map((row: any) => {
      storeEnquiryData.push({
        'Holiday Name': row.holidayName,
        'Country': row.country?.countryName,
        'Date': row.holidayDate,
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

    const fileName = 'holiday.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  openPDF() {
    var prepare=[];
    this.HolidayData.forEach(e=>{
      var tempObj =[];
      tempObj.push(e.holidayName);
      tempObj.push(e.country.countryName);
      tempObj.push(e.holidayDate);
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [297, 210]);
    autoTable(doc,{
        head: [['Holiday Name','Country','Date']],
        body: prepare
    });
    doc.save('holiday' + '.pdf');
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
      if(each){

        if (this.displayedColumns[ind] == 'dateOfHoliday'  ) {
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
  
  this.filterKeys['parentId'] = this.partyid
  let payload = this.commonService.filterList()

  payload.size =Number(this.size);
  payload.from = this.page - 1;
  payload.query = {
   ...this.filterKeys
  }
  payload.sort = {
    "desc" : ["updatedOn"]
  },
 
  this.commonService.getSTList('holiday',payload) 
    .subscribe((data: any) => {
      this.HolidayData = data.documents; 
      this.dataSource = new MatTableDataSource(
        data?.documents?.map((s: any,index) => {
          return{
            ...s,
            id:index+1
          }
        })
      )
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
    this.getAll( );
  }
  onDelete(deletedata, holiday) {
    this.modalService
      .open(deletedata, {
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
            let data =  `holiday/${holiday.holidayId}`
            this.commonService.deleteST(data).subscribe((res: any) => {
              if (res) {
                this.notification.create('success', 'Deleted Successfully', '');
                this.clear();
                setTimeout(() => {
                  this.getAll();
                }, 1000);
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
}
