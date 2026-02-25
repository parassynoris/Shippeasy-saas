import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CostheadaddComponent } from './costheadadd/costheadadd.component';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { CommonService } from 'src/app/services/common/common.service';
import { CostHead } from 'src/app/models/cost-items';
import { MastersSortPipe } from '../../util/mastersort';
import { MatDrawer } from '@angular/material/sidenav';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
@Component({
  selector: 'app-cost-head',
  templateUrl: './cost-head.component.html',
  styleUrls: ['./cost-head.component.scss']
})
export class CostHeadComponent implements OnInit {
  toalLength: any = 100;
  count = 0;
  size = 10;
  page = 1;
  fromSize: number = 1;
  yardcfs:any;
  costHeadList: CostHead[] = [];
  costHeadCode: any;
  costheadName: any;
  costHeadMapName: any;
  status: any;
  _gc=GlobalConstants

  @ViewChild(MatDrawer) drawer: MatDrawer | any;
  dataSource = new MatTableDataSource();
  pagenation = [10,20, 50, 100];
  email:any
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns =[
    '#', 
    'action',
   'costHeadCode',
   'costheadName',
   'status'
  ];
  isMaster: boolean = false;


  @Input() prentPath: any;

  constructor(private profilesService: ProfilesService, public modalService: NgbModal, public notification: NzNotificationService,
    private commonService: CommonService,private sortPipelist: MastersSortPipe,public loaderService: LoaderService,
    ) {
    // do nothing.
  }

  ngOnInit(): void {
    this.getCostHeadList();
    // this.vvoye();
  }


  vvoye() {
    let payload = this.commonService.filterList()
    payload.sort = {
      "desc" : ["updatedOn"]
   }
   let mustArray = {};
   payload.query=mustArray;
   this.commonService.getSTList('costhead', payload).subscribe((res: any) => {
      if (res && res.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1,
          costHeadCode: s.costHeadCode,
          costheadName: s.costheadName,
          status: s.status
        }));
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1; 
      }
    });
  }

  exportAsExcelFile1(): void {
    let storeEnquiryData = [];
    this.email.map((row: any) => {
      storeEnquiryData.push({
        'locationName' : row?.element?.locationName,
        'Country' : row?.element?.country        ,
        'State' : row?.element?.state
      });
    }
    );
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
  
    const fileName = '.xlsx';
    XLSX.writeFile(myworkbook, fileName);
  }


  applyFilter(filterValue: string) { 
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase();

   
    this.dataSource.filterPredicate = (data, filter) => {
      return JSON.stringify(data).toLowerCase().includes(filter);
    };

    this.dataSource.filter = filterValue;
  }

  displayedColumns1 = this.displayedColumns.map((x, i) => x + '_' + i);
  toggleFilters = true;
  filtersModel = [];
  filterKeys = {};
  searchColumns() {
    this.filterKeys = {};
    this.filtersModel.forEach((each, ind) => {
      if (each)
        this.displayedColumns[ind] !== 'status' ?
          this.filterKeys[this.displayedColumns[ind]] = {
            "$regex": each.toLowerCase(),
            "$options": "i"
          } : this.filterKeys[this.displayedColumns[ind]] = {
            "$eq": (each.toLowerCase() === 'active' ? true : false),
          }
    });
    let payload = this.commonService.filterList()
    payload.query = this.filterKeys
    payload.sort = {
      "desc": ["updatedOn"]
    }
    this.commonService.getSTList('costhead', payload).subscribe((data) => {
      this.yardcfs = data.documents;
      this.dataSource = new MatTableDataSource(
        data?.documents?.map((s: any,index) => {
          return{
            ...s,
            id:index+1+this.from
          }
        })
      );
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort1;

    });


  }

  clearFilters() {
    this.filtersModel = [];
    this.filterKeys = {};
    this.getCostHeadList();
  }

  sortList(array , key){
    return this.sortPipelist.transform(array, key);
   }
   pageNumber = 1;
   pageSize = 10;
   from = 0;
   totalCount = 0;
 
   onPageChange(event){
     this.pageNumber = event.pageIndex + 1;
     this.pageSize = event.pageSize;
     this.from = event.pageIndex*event.pageSize ;
     this.getCostHeadList();
   }
  getCostHeadList() {
    this.loaderService.showcircle();
    let payload = this.commonService.filterList()
    if (payload?.size)payload.size= this.pageSize,
    payload.from=this.from
    if(payload?.query)payload.query = { }
    if(payload?.sort)payload.sort = {
      "desc" : ["updatedOn"]
   }
  //  if(payload?.size)payload.size = Number(this.size)
  //  if(payload?.from)payload.from = this.page -1;
    this.commonService.getSTList('costhead', payload)?.subscribe((data) => {
      this.costHeadList = data.documents?.map((s: any,index) => {
        return{
          ...s,
          id:index+1+this.from
        }
      })

      if (data && data.documents) {
        this.dataSource.data = data.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1,
          costHeadCode: s.costHeadCode?s.costHeadCode.toString() : '',
          costheadName: s.costheadName,
          status: s.status
        }));
        // this.dataSource.paginator = this.paginator;
        this.toalLength = data.totalCount;
        this.count = data.documents.length;
        this.dataSource.sort = this.sort1;
        this.loaderService.hidecircle();
      }
    });
  }  


  clear() {
    this.costHeadCode = ''
    this.costheadName = ''
    this.status = '';
    this.getCostHeadList()
  }

  next() {
    if (this.toalLength > this.count) {
      this.getPaginationData('next')
    }
  }

  prev() {
    if (this.page > 0 && this.page !== 1) {
      this.getPaginationData('prev')
    }
  }

  filter(e) {
    this.size = e.target.value;
    this.fromSize = 1;
    this.getCostHeadList()
  }

  search() {
    let mustArray = {};
    this.costHeadCode = this.costHeadCode?.trim();
    this.costheadName = this.costheadName?.trim();


   
        if (this.costheadName) {
          mustArray['costheadName'] = {
            "$regex" : this.costheadName,
            "$options": "i"
        }
        }
    if (this.costHeadCode) {
      mustArray['costheadName'] = {
        "$regex" : this.costheadName,
        "$options": "i"
    }
    }
    if (this.status) {
      mustArray['status'] = this.status === 'true'? true : false
    }
    let payload = this.commonService.filterList()
    payload.query = mustArray
    payload.sort = {
      "desc" : ["updatedOn"]
   }
   if (payload?.size)payload.size = Number(this.size)
   payload.from = 0,
    this.commonService.getSTList('costhead', payload).subscribe((data) => {
      this.costHeadList = data.documents?.map((s: any,index) => {
        return{
          ...s,
          id:index+1+this.from
        }
      })
      this.toalLength = data.totalCount;
      this.count = data.documents.length
      this.fromSize = 1
    })
  }

  getPaginationData(type: any) {
    this.fromSize = type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
    let payload = this.commonService.filterList()
    payload.sort = {
      "desc" : ["updatedOn"]
   }
   payload.size = Number(this.size)
   payload.from = this.fromSize -1;
   let mustArray = {};
   this.costHeadCode = this.costHeadCode?.trim();
   this.costheadName = this.costheadName?.trim();
  
       if (this.costheadName) {
         mustArray['costheadName'] = {
           "$regex" : this.costheadName,
           "$options": "i"
       }
       }
   if (this.costHeadCode) {
     mustArray['costheadName'] = {
       "$regex" : this.costheadName,
       "$options": "i"
   }
   }
   if (this.status) {
     mustArray['status'] = this.status === 'true'? true : false
   }
   payload.query=mustArray;
    this.commonService.getSTList('costhead', payload).subscribe(data => {
      this.costHeadList = data.documents;
      this.toalLength = data.totalCount;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count = type === 'prev' ? this.toalLength === this.count ? this.count - ((this.toalLength % Number(this.size))>0?(this.toalLength % Number(this.size)):(Number(this.size))) : this.count - data.documents.length : this.count + data.documents.length;
    })
  }

  open(content: any = null, guid: any = null) {
    const modalRef = this.modalService.open(CostheadaddComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg'
    });
    modalRef.componentInstance.getList.subscribe((res: any) => {
      if (res) {
        this.getCostHeadList();
      }
    })
    modalRef.componentInstance.fromParent = guid;
    modalRef.componentInstance.prentPath = this.prentPath;
    modalRef.componentInstance.isAddModeData = content;
  }

  delete(deleteactivity, id) {
    this.modalService.open(deleteactivity, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: '',

      ariaLabelledBy: 'modal-basic-title'
    }).result.then((result) => {

      if (result === 'yes') {
        let data = 'costhead' + id.costheadId

        this.commonService.deleteST(data).subscribe((res: any) => {
          this.notification.create(
            'success',
            'Delete Successfully',
            ''
          );
          this.getCostHeadList();
        })
      }
    }, (reason) => {
      // do nothing.
    });

  }
  changeStatus(data) {
    this.commonService.UpdateToST(`costhead/${data.costheadId}`,{ ...data, status: !data?.status }).subscribe((res: any) => {
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

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.costHeadList.map((row: any) => {
      storeEnquiryData.push({
        'Cost Head Code': row.costHeadCode,
        'Cost Head Name': row.costheadName,
        'Status': row.status ? "Active" : "Inactive",
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

    const fileName = 'costhead.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  openPDF() {
    const prepare=[];
    this.costHeadList.forEach(e=>{
      let tempObj =[];
      tempObj.push(e.costHeadCode);
      tempObj.push(e.costheadName);
      tempObj.push(e.status ? "Active" : "Inactive");
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [297, 210]);
    autoTable(doc,{
        head: [['Cost Head Code','Cost Head Name','Status']],
        body: prepare,
        didDrawCell: (data) => {
          // Draw border lines for each cell
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'S');
      }
    });
    doc.save('costhead' + '.pdf');
  }

}
