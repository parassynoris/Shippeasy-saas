import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { CommonService } from 'src/app/services/common/common.service';
import { SystemType } from 'src/app/models/system-type';
import { MastersSortPipe } from '../../util/mastersort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
@Component({
  selector: 'app-system-type',
  templateUrl: './system-type.component.html',
  styleUrls: ['./system-type.component.scss'],
})
export class SystemTypeComponent implements OnInit {
  currentUrl: string;
  _gc=GlobalConstants;
  systemData: SystemType[] = [];
  getUser: string;
  @Input() addSystemTypeForm;
  closeResult: string;
  toalLength: number;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  name: string;
  category: string;
  description: string;
  typeActive: string;
  refType: string;
  refCode: string;
  parentType: string;
  yardcfs:any
  dataSource = new MatTableDataSource();
  pagenation = [10,20, 50, 100];
  emaill:any
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns =[
    '#', 
    'action',
   'typeName',
   'typeCategory',
   'typeDescription',
   'typeRef',
   'typeRefId',
   'createdBy',
   'updatedBy',
   'status'
   
  ];

  constructor(
   public commonService : CommonService,
    public modalService: NgbModal,
    public notification: NzNotificationService,
    private sortPipelist: MastersSortPipe,
    public loaderService: LoaderService,
  ) {
    this.commonService = commonService;
    this.modalService = modalService;
    this.notification = notification
  }
  ngOnInit(): void {
    // this.vvoye1();

      this.getAll();
   
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();
  }


  vvoye1() {
    let payload = this.commonService.filterList()
    if(payload?.size)payload.size= this.pageSize,
    payload.from=this.from
    if(payload?.query)payload.query = {
    }
    if(payload?.sort)payload.sort = {  "desc" : ['updatedOn'] }

    let mustArray = {};
    payload.query = mustArray

    this.commonService.getSTList('systemtype',payload).subscribe((res: any) => {
      if (res && res.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1,
          typeName: s.typeName,
          typeCategory: s.typeCategory,
          typeDescription: s.typeDescription,
          typeRef: s.typeRef,
          typeRefId: s.typeRefId,
          
         
        }));
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1; 
      } else {
      }
    }, (error: any) => { 
    });
  }

  exportAsExcelFile1(): void {
    let storeEnquiryData = [];
    this.emaill?.map((row: any) => {
      storeEnquiryData.push({
        'typeName' : row?.element?.typeName,
        'typeCategory' : row?.element?.typeCategory,
        'typeDescription' : row?.element?.typeDescription,
        'typeRef':row?.element?.typeRef,
        'typeRefId' : row?.element?.typeRefId,
        
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
    if(payload?.query)payload.query = this.filterKeys
    if(payload?.sort)payload.sort = {
      "desc": ["updatedOn"]
    }
    this.commonService.getSTList('systemtype',payload).subscribe((data) => {
      this.yardcfs = data.documents;
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

  clearFilters() {
    this.filtersModel = [];
    this.filterKeys = {};
    this.getAll();
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
     this.getAll();
   }
  getAll() {

    this.loaderService.showcircle();
    let payload = this.commonService.filterList()
    if(payload?.size)payload.size= this.pageSize,
    payload.from=this.from
    if(payload?.query)payload.query = {
    }
    // payload.size = Number(this.size),
    // payload.from = 0,
    if(payload?.sort)payload.sort = {  "desc" : ['updatedOn'] }

    let mustArray = {};
    this.name = this.name?.trim();
    this.category = this.category?.trim();
    this.description = this.description?.trim();
    this.refType = this.refType?.trim();
    this.refCode = this.refCode?.trim();
    this.parentType = this.parentType?.trim();
    if (this.name) {
      mustArray['typeName'] = {
        "$regex" : this.name,
        "$options": "i"
    }
    }
    if (this.category) {
      mustArray['typeCategory'] = {
        "$regex" : this.category,
        "$options": "i"
    }
    }
if (this.description) {
  mustArray['typeDescription'] = {
    "$regex" : this.description,
    "$options": "i"
}
}

if (this.typeActive) {
  mustArray['typeActive'] = this.typeActive === 'true'? true : false
}


    if (this.refType) {
      mustArray['typeRef'] = {
        "$regex" : this.refType,
        "$options": "i"
    }
    }

    if (this.refCode) {
      mustArray['typeRefId'] = {
        "$regex" : this.refCode,
        "$options": "i"
    }
    }
    if (this.parentType) {
      mustArray['typeParentType'] = {
        "$regex" : this.parentType,
        "$options": "i"
    }
    }

    if(payload?.query)payload.query = mustArray

    this.commonService.getSTList('systemtype',payload)?.subscribe((data) => {
      this.systemData = data.documents;
  
      if (data && data?.documents) {
        this.dataSource.data = data.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1+this.from,
          typeName: s.typeName,
          typeCategory: s.typeCategory,
          typeDescription: s.typeDescription,
          typeRef: s.typeRef,
          typeRefId: s.typeRefId,
          createdBy: s.createdBy,
          updatedBy: s.updatedBy,
          
        }));
        // this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1; 
        this.toalLength = data.totalCount;
        this.count = data.documents.length;
        this.loaderService.hidecircle();
      }
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
    this.getAll();
  }

  getPaginationData(type: any) {
    this.fromSize =
      type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1; 
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
    }
    if(payload?.size)payload.size = Number(this.size),
    payload.from =  this.fromSize - 1
    if(payload?.sort)payload.sort = {  "desc" : ['updatedOn'] }

    let mustArray = {};
    this.name = this.name?.trim();
    this.category = this.category?.trim();
    this.description = this.description?.trim();
    this.refType = this.refType?.trim();
    this.refCode = this.refCode?.trim();
    this.parentType = this.parentType?.trim();
    if (this.name) {
      mustArray['typeName'] = {
        "$regex" : this.name,
        "$options": "i"
    }
    }
    if (this.category) {
      mustArray['typeCategory'] = {
        "$regex" : this.category,
        "$options": "i"
    }
    }
if (this.description) {
  mustArray['typeDescription'] = {
    "$regex" : this.description,
    "$options": "i"
}
}

if (this.typeActive) {
  mustArray['typeActive'] = this.typeActive === 'true'? true : false
}


    if (this.refType) {
      mustArray['typeRef'] = {
        "$regex" : this.refType,
        "$options": "i"
    }
    }

    if (this.refCode) {
      mustArray['typeRefId'] = {
        "$regex" : this.refCode,
        "$options": "i"
    }
    }
    if (this.parentType) {
      mustArray['typeParentType'] = {
        "$regex" : this.parentType,
        "$options": "i"
    }
    }
    payload.query = mustArray

    this.commonService.getSTList('systemtype',payload).subscribe((data) => {
      this.systemData = data.documents;
      this.toalLength = data.totalCount;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count =
        type === 'prev'
          ? this.toalLength === this.count
            ? this.count -  ((this.toalLength % Number(this.size))>0?(this.toalLength % Number(this.size)):(Number(this.size)))
            : this.count - data.documents.length
          : this.count + data.documents.length;
    });
  }

  open(content, systemType?: any) {
    this.getUser = systemType;

      this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }
  event(data) {
    if (data) {
      this.getAll();
    }
  }

  delete(deletesystemType, id) {
    this.modalService
      .open(deletesystemType, {
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
            let data =`systemtype/${id.systemtypeId}`
            this.commonService.deleteST(data).subscribe((res: any) => {
              if (res) {
                this.notification.create('success', 'Deleted Successfully', '');
                this.getAll();
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

  search() {
    let mustArray = {};
    this.name = this.name?.trim();
    this.category = this.category?.trim();
    this.description = this.description?.trim();
    this.refType = this.refType?.trim();
    this.refCode = this.refCode?.trim();
    this.parentType = this.parentType?.trim();
    if (this.name) {
      mustArray['typeName'] = {
        "$regex" : this.name,
        "$options": "i"
    }
    }
    if (this.category) {
      mustArray['typeCategory'] = {
        "$regex" : this.category,
        "$options": "i"
    }
    }
if (this.description) {
  mustArray['typeDescription'] = {
    "$regex" : this.description,
    "$options": "i"
}
}

if (this.typeActive) {
  mustArray['typeActive'] = this.typeActive === 'true'? true : false
}


    if (this.refType) {
      mustArray['typeRef'] = {
        "$regex" : this.refType,
        "$options": "i"
    }
    }

    if (this.refCode) {
      mustArray['typeRefId'] = {
        "$regex" : this.refCode,
        "$options": "i"
    }
    }
    if (this.parentType) {
      mustArray['typeParentType'] = {
        "$regex" : this.parentType,
        "$options": "i"
    }
    }


    let payload = this.commonService.filterList()
    payload.query = mustArray
    if(payload?.size)payload.size = Number(this.size),
    payload.from = 0
    if(payload?.sort)payload.sort = {  "desc" : ['updatedOn'] }
    
    this.commonService.getSTList('systemtype',payload).subscribe((data) => {
      this.systemData = data.documents?.map((s: any,index) => {
        return{
          ...s,
          id:index+1
        }
      });
      this.toalLength = data.totalCount;
      this.count = data.documents.length;
      this.fromSize = 1
    });
  }
  changeStatus(data, i) {
    this.commonService
      .UpdateToST(`systemtype/${data.systemtypeId} `,{ ...data, status: !data?.status })
      .subscribe(
        (res: any) => {
          if (res) {
            this.systemData[i].status = !data?.status;
            this.notification.create(
              'success',
              'Status Updated Successfully',
              ''
            ); 
            setTimeout(() => {
              this.getAll()
            }, 1000);
          }
        },
        (error) => {
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
  }
  clear() {
    this.name = '';
    this.typeActive = '';
    this.refCode = '';
    this.refType = '';
    this.parentType = '';
    this.description = '';
    this.category = '';
    this.getAll();
  }


  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.systemData.map((row: any) => {
      storeEnquiryData.push({
        'Name': row.typeName,
        'Category': row.typeCategory,
        'Description': row.typeDescription,
        'Type Active': row.typeActive,
        'Reference Type': row.typeRef,
        'Reference Code': row.typeRefId,
        'Parent Type': row.typeParentType,
      });
    });
    const myworksheet: XLSX.WorkSheet =
      XLSX.utils.json_to_sheet(storeEnquiryData);
    const myworkbook: XLSX.WorkBook = {
      Sheets: { data: myworksheet },
      SheetNames: ['data'],
    };
    const fileName = 'systemtype.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  openPDF() {
    const prepare=[];
    this.systemData.forEach(e=>{
      let tempObj =[];
      tempObj.push(e.typeName);
      tempObj.push(e.typeCategory);
      tempObj.push(e.typeDescription);
      tempObj.push(e.typeActive ? "Yes" : "No");
      tempObj.push(e.typeRef);
      tempObj.push(e.typeRefId);
      tempObj.push(e.typeParentType);
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [297, 210]);
    autoTable(doc,{
        head: [['Name','Category','Description','Type Active','Reference Type','Reference Code','Parent Type']],
        body: prepare,
        didDrawCell: (data) => {
          // Draw border lines for each cell
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'S');
      }
    });
    doc.save('systemtype' + '.pdf');
  }
}
