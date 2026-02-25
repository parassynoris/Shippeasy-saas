import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ApiService } from 'src/app/admin/principal/api.service';
import { BaseBody } from 'src/app/admin/smartagent/base-body';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { DatePipe } from '@angular/common';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { OrderByPipe } from 'src/app/shared/util/sort';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/services/common/common.service';
import { TDS } from 'src/app/models/tds-slabs';
import { MastersSortPipe } from 'src/app/shared/util/mastersort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
@Component({
  selector: 'app-tds-slabs',
  templateUrl: './tds-slabs.component.html',
  styleUrls: ['./tds-slabs.component.scss']
})
export class TdsSlabsComponent implements OnInit {
  _gc=GlobalConstants;
  historyScreen: boolean = false;
  containerHistoryList: [{}];
  PortData: [];
  addContainerForm: FormGroup;
  containerIdToUpdate: string = '';
  closeResult: string;
  toalLength: number;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  submitted: boolean = false;


  baseBody: BaseBody;
  containerList: TDS[] = [];

  isEdit: boolean = false;
  show: string;
  isRequird: boolean = false;


  entityTypeList: ['XYZ']
  currentUrl: string;

  tdsNature: string;
  accountHead: string;
  TDSPer: string;
  effectiveFrom: string;
  effectiveTo: string;
  yardcfs:any
  dataSource = new MatTableDataSource();
  pagenation = [10,20, 50, 100];
  emaill:any
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns =[
    '#', 
    'action',
   'tdsNature',
   'accountHead',
   'tdsPer',
   'effectiveFrom',
   'effectiveTo'
  ];
  isMaster: boolean = false;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    public notification: NzNotificationService,
    private CommonService: CommonService,
    private commonFunctions: CommonFunctions,
    public datepipe: DatePipe,
    private _api: ApiService,
    private sortPipe: OrderByPipe,
    private router: Router,
    private sortPipelist: MastersSortPipe,
    public loaderService: LoaderService,
  ) {
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();

    this.formBuild()
  }
  sort(array, key) {
    return this.sortPipe.transform(array, key);
  }
  formBuild() {
    this.addContainerForm = this.fb.group({
      tdsNature: ['', [Validators.required]],
      accountHead: ['', [Validators.required]],
      tdsPer: ['', [Validators.required]],
      surchargePer: [''],
      educationPer: [''],

      sectionCode: ['', [Validators.required]],
      effectiveFrom: ['', [Validators.required]],
      effectiveTo: ['', [Validators.required]],
      entityType: [''],
      thresholdLimit: ['', [Validators.required]]
    });
  }
  setValidation(e) {
    if (e === 'Reserved') {
      this.isRequird = true
      this.addContainerForm.controls['customerName'].setValidators([
        Validators.required,
      ]);
      this.addContainerForm.controls['customerName'].updateValueAndValidity();
    } else {
      this.isRequird = false
      this.addContainerForm.controls['customerName'].clearValidators();
      this.addContainerForm.controls['customerName'].updateValueAndValidity();
    }
  }
  ngOnInit(): void {
    this.getContainerData();
    this.vvoye();
  }



  vvoye() {
    let payload = this.CommonService.filterList()
    if(payload?.query)payload.query = {
      "type" : 'TDS'
    }
    if(payload?.sort)payload.sort = {
      "desc" : ["updatedOn"]
   }

   let mustArray = {};
   mustArray['type'] = 'TDS' 
   if(payload?.query)payload.query = mustArray
   this.CommonService.getSTList('tds', payload)?.subscribe((res: any) => {
      if (res && res.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1,
          tdsNature: s.tdsNature,
          accountHead: s.accountHead,
          tdsPer: s.tdsPer,
          effectiveFrom: s.effectiveFrom,
          effectiveTo: s.effectiveTo,
         
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
    this.emaill.map((row: any) => {
      storeEnquiryData.push({
        'tdsNature' : row?.element?.tdsNature,
        'accountHead' : row?.element?.accountHead,
        'tdsPer' : row?.element?.tdsPer,
        'effectiveFrom' : row?.element?.effectiveFrom,
        'effectiveTo' : row?.element?.effectiveTo
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
        this.filterKeys[this.displayedColumns[ind]] = {
          "$regex": each.toLowerCase(),
          "$options": "i"
        }
    });
    let payload = this.CommonService.filterList()
    payload.query = this.filterKeys
    payload.sort = {
      "desc": ["updatedOn"]
    }
    this.CommonService.getSTList('tds', payload).subscribe((data) => {
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
    this.vvoye()
  }
  sortList(array , key){
    return this.sortPipelist.transform(array, key);
   }

  get f() {
    return this.addContainerForm.controls;
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
    this.getContainerData();
  }

  getPaginationData(type: any) {
    this.fromSize =
      type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
 
    let payload = this.CommonService.filterList()
    payload.query = {
      "type" : 'TDS'
    }
    payload.sort = {
      "desc" : ["updatedOn"]
   }

   let mustArray = {};
    
   mustArray['type'] = 'TDS' 
   
      this.tdsNature =  this.tdsNature?.trim();
      this.accountHead = this.accountHead?.trim();
      this.TDSPer =  this.TDSPer?.trim();
      this.effectiveFrom =  this.effectiveFrom?.trim();
      this.effectiveTo = this.effectiveTo?.trim();
       if (this.tdsNature) {
         mustArray['tdsNature'] = {
           "$regex" : this.tdsNature,
           "$options": "i"
       }
       }
       if (this.accountHead) {
         mustArray['accountHead'] = {
           "$regex" : this.accountHead,
           "$options": "i"
       }
       }
   
       if (this.TDSPer) {
         mustArray['tdsPer'] = {
           "$regex" : this.TDSPer,
           "$options": "i"
       }
       }
       if (this.effectiveFrom) {
         mustArray['effectiveFrom']= {
           "$gt" : this.effectiveFrom.substring(0, 10) + 'T00:00:00.000Z',
           "$lt" : this.effectiveFrom.substring(0, 10) + 'T23:59:00.000Z'
       }
       }
       if (this.effectiveTo) {
         mustArray['effectiveTo']= {
           "$gt" : this.effectiveTo.substring(0, 10) + 'T00:00:00.000Z',
           "$lt" : this.effectiveTo.substring(0, 10) + 'T23:59:00.000Z'
       }
       }
    
       payload.query = mustArray
   payload.size = Number(this.size)
   payload.from = this.fromSize -1
    this.CommonService.getSTList('tds', payload).subscribe((data: any) => {
      this.containerList = data?.documents;
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

  search() {
    let mustArray = {};
    
mustArray['type'] = 'TDS' 
// Trim beginning spaces from search parameters
   this.tdsNature =  this.tdsNature?.trim();
   this.accountHead = this.accountHead?.trim();
   this.TDSPer =  this.TDSPer?.trim();
   this.effectiveFrom =  this.effectiveFrom?.trim();
   this.effectiveTo = this.effectiveTo?.trim();
    if (this.tdsNature) {
      mustArray['tdsNature'] = {
        "$regex" : this.tdsNature,
        "$options": "i"
    }
    }
    if (this.accountHead) {
      mustArray['accountHead'] = {
        "$regex" : this.accountHead,
        "$options": "i"
    }
    }

    if (this.TDSPer) {
      mustArray['tdsPer'] = {
        "$regex" : this.TDSPer,
        "$options": "i"
    }
    }
    if (this.effectiveFrom) {
      mustArray['effectiveFrom']= {
        "$gt" : this.effectiveFrom.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.effectiveFrom.substring(0, 10) + 'T23:59:00.000Z'
    }
    }
    if (this.effectiveTo) {
      mustArray['effectiveTo']= {
        "$gt" : this.effectiveTo.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.effectiveTo.substring(0, 10) + 'T23:59:00.000Z'
    }
    }
 

    let payload = this.CommonService.filterList()
    payload.query = mustArray
    payload.sort = {
      "desc" : ["updatedOn"]
   }
   payload.size = Number(this.size)
   payload.from = 0,
    this.CommonService.getSTList('tds', payload)?.subscribe((data: any) => {
      this.containerList = data?.documents?.map((s: any,index) => {
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
  getContainerData() {
    this.loaderService.showcircle();
    let payload = this.CommonService.filterList()
    if(payload?.query)payload.query = {
      "type" : 'TDS'
    }
    if(payload?.sort)payload.sort = {
      "desc" : ["updatedOn"]
   }

   let mustArray = {};
    
   mustArray['type'] = 'TDS' 

      this.tdsNature =  this.tdsNature?.trim();
      this.accountHead = this.accountHead?.trim();
      this.TDSPer =  this.TDSPer?.trim();
      this.effectiveFrom =  this.effectiveFrom?.trim();
      this.effectiveTo = this.effectiveTo?.trim();
       if (this.tdsNature) {
         mustArray['tdsNature'] = {
           "$regex" : this.tdsNature,
           "$options": "i"
       }
       }
       if (this.accountHead) {
         mustArray['accountHead'] = {
           "$regex" : this.accountHead,
           "$options": "i"
       }
       }
   
       if (this.TDSPer) {
         mustArray['tdsPer'] = {
           "$regex" : this.TDSPer,
           "$options": "i"
       }
       }
       if (this.effectiveFrom) {
         mustArray['effectiveFrom']= {
           "$gt" : this.effectiveFrom.substring(0, 10) + 'T00:00:00.000Z',
           "$lt" : this.effectiveFrom.substring(0, 10) + 'T23:59:00.000Z'
       }
       }
       if (this.effectiveTo) {
         mustArray['effectiveTo']= {
           "$gt" : this.effectiveTo.substring(0, 10) + 'T00:00:00.000Z',
           "$lt" : this.effectiveTo.substring(0, 10) + 'T23:59:00.000Z'
       }
       }
    
       if(payload?.query)payload.query = mustArray
   if(payload?.size)payload.size = Number(this.size)
   if(payload?.from)payload.from = this.page -1
    this.CommonService.getSTList('tds', payload)?.subscribe((res: any) => {
      this.containerList = res?.documents?.map((s: any,index) => {
        return{
          ...s,
          id:index+1
        }
      });
      this.toalLength = res.totalCount;
      this.count = res.documents.length;
      this.loaderService.hidecircle();
  
    },()=>{
      this.loaderService.hidecircle();
    });
  }

  clear() {
    this.tdsNature = '';
    this.accountHead = '';
    this.TDSPer = '';
    this.effectiveFrom = '';
    this.effectiveTo = '';
    this.getContainerData();
  }

  open(content, containerMaster?: any, show?) {
    this.show = show;
    this.isEdit = false;
    if (containerMaster) {
      this.containerIdToUpdate = containerMaster?.tdsId,
      this.isEdit = true;
      this.addContainerForm.patchValue({


        tdsNature: containerMaster?.tdsNature,
        accountHead: containerMaster?.accountHead,
        tdsPer: containerMaster?.tdsPer,
        surchargePer: containerMaster?.surchargePer,
        educationPer: containerMaster?.educationPer,

        sectionCode: containerMaster?.sectionCode,
        effectiveFrom: containerMaster?.effectiveFrom,
        effectiveTo: containerMaster?.effectiveTo,
        entityType: containerMaster?.entityType,
        thresholdLimit: containerMaster?.thresholdLimit,


      });
      show === 'show' ? this.addContainerForm.disable() : this.addContainerForm.enable();
    }
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }
  onSave() {
    this.containerIdToUpdate = '';
    this.formBuild();
    this.submitted = false;
    this.modalService.dismissAll();
    return null;
  }
  containerMaster() {
    this.submitted = true;
    if (this.addContainerForm.invalid) {
      // If the form is invalid, stop execution and display error messages
      this.notification.create('error', 'Please fill in all required fields.', '');
      return;
    }
    
 
    let body = {
      "status": true,

      "tenantId": this.commonFunctions.getTenantId(),
      "remarks": "",
      "type" : 'TDS'
    }

    const data = {...this.addContainerForm.value,...body , tdsId : this.containerIdToUpdate};

    if (this.isEdit) {
      this.CommonService.UpdateToST(`tds/${data.tdsId}`, data).subscribe(
        (result: any) => {
          if (result) {
            this.notification.create('success', 'Updated Successfully', '');
            setTimeout(() => {
             
              this.onSave();
              this.vvoye()
            }, 1000);
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error', error?.error?.error?.message , '');
        }
      );
    } else {
      this.CommonService.addToST("tds", data).subscribe(
        (result: any) => {
          if (result) {
            this.notification.create('success', 'Add Successfully', '');
            setTimeout(() => { 
              this.onSave();
              this.vvoye()
            }, 1000);
          }
        },
        (error) => {
          this.notification.create('error', error?.error?.error?.message , '');
        }
      );
    }

  }

  delete(deletecontainer, id) {
    this.modalService
      .open(deletecontainer, {
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
            let data = 'tds'+id.tdsId
            this.CommonService.deleteST(data).subscribe((res: any) => {
              if (res) {
                this.notification.create('success', 'Deleted Successfully', '');
                this.clear();
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
    this.CommonService.UpdateToST(`tds/${data.tdsId}`,{ ...data, status: !data?.status })
      .subscribe(
        (res: any) => {
          if (res) {
            this.notification.create(
              'success',
              'Status Updated Successfully',
              ''
            );
            this.clear();
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
  }


  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.containerList.map((row: any) => {
      storeEnquiryData.push({
        'TDS Nature': row.tdsNature,
        'Account Code': row.accountHead,
        'TDS %': row.tdsPer,
        'Effective From': row.effectiveFrom,
        'Effective To': row.effectiveTo,
        'Status':row.status? 'Active' : 'Inactive'
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

    const fileName = 'TDS.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  openPDF() {
    const prepare = [];
    this.containerList.forEach(e => {
      let tempObj = [];
      tempObj.push(e.tdsNature);
      tempObj.push(e.accountHead);
      tempObj.push(e.tdsPer);
      tempObj.push(e.effectiveFrom);
      tempObj.push(e.effectiveTo);
      tempObj.push(e.status? 'Active' : 'Inactive');
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [297, 210]);
    autoTable(doc, {
      head: [['TDS Nature', 'Account Head', 'TDS %', 'Effective From', 'Effective To','Status']],
      body: prepare,
      didDrawCell: (data) => {
        // Draw border lines for each cell
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'S');
    }
    });
    doc.save('TDS' + '.pdf');
  }


}
