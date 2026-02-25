import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { CommonFunctions } from '../../functions/common.function';
import { CommonService } from 'src/app/services/common/common.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { uom } from 'src/app/models/uom';
import { MastersSortPipe } from '../../util/mastersort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
@Component({
  selector: 'app-uom',
  templateUrl: './uom.component.html',
  styleUrls: ['./uom.component.scss'],
})
export class UomComponent implements OnInit {
  _gc=GlobalConstants;
  uomData:uom [] = [];
  UomIdToUpdate: string;
  uomForm: FormGroup;
  closeResult: string;
  toalLength: any;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  submitted: any = false;
  uomId: any;
  uomName: any;
  uomShort: any;
  uomCategory: any;
  uomcategoryList: any = [];
  show: any;
  tenantId: any;
  email:any
  yardcfs:any
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort1!: MatSort;
  displayedColumns =[
    '#', 
    'action',
    'uomName',
    'uomShort',
    'uomCategory',
  ];
  constructor(
    private fb: FormBuilder,

    private modalService: NgbModal,private cognito : CognitoService,
    private notification: NzNotificationService,private commonService : CommonService,
    private sortPipelist: MastersSortPipe,
    public loaderService: LoaderService,


  ) {
      this.fb = fb;
      this.modalService = modalService;
      this.cognito = cognito;
      this.notification = notification;
      this.commonService = commonService
  }

  ngOnInit(): void {
    // this.vvoye()
    this.getUOMCategory();
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.tenantId = resp.tenantId
      }
    }) 
    this.getUomList();
    this.uomForm = this.fb.group({
      uomCategory: ['', [Validators.required]],
      uomName: ['', [Validators.required]],
      uomShort: ['', [Validators.required]],
      uomCode: [''],
      measurement: [''],
      remark: [' '],
      status: [true],
    });
  }
  get f() {
    return this.uomForm.controls;
  }

  vvoye() {
    let payload = this.commonService?.filterList();
    payload.query = { }
    payload.sort = {
      "desc" : ["updatedOn"]
   }
   let mustArray = {};
   payload.query = mustArray
    this.commonService?.getSTList('uom', payload)?.subscribe((res: any) => {

      if (res && res.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          uomName: s.uomName,
          uomShort: s.uomShort,
          uomCategory: s.uomCategory
          
        }));
        this.uomData = res.documents;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1; 
      } else {
      }
    }, (error: any) => { 
    });
  }

  exportAsExcelFile1(): void {
    let storeEnquiryData = [];
    this.email.map((row: any) => {
      storeEnquiryData.push({
        'uomData' : row?.element?.uomData,
        'uomShort' : row?.element?.uomShort,
        'count' : row?.element?.count
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
          "$regex": each,
          "$options": "i"
        }
    });
    let payload = this.commonService.filterList()
    payload.query = this.filterKeys
    payload.sort = {
      "desc": ["updatedOn"]
    }
    this.commonService.getSTList('uom', payload).subscribe((data) => {
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
    this.getUomList()
  }


  sortList(array , key){
    return this.sortPipelist.transform(array, key);
   }
  getUOMCategory() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {typeCategory: 'uomType' }
    this.commonService.getSTList('systemtype', payload)?.subscribe((res: any) => {
      this.uomcategoryList = res.documents;
    });
  }
  pageNumber = 1;
  pageSize = 10;
  from = 0;
  totalCount = 0;

  onPageChange(event){
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.from = event.pageIndex*event.pageSize ;
    this.getUomList();
  }

  getUomList() {
    this.loaderService.showcircle();
    let payload = this.commonService.filterList()
    if(payload?.size)payload.size= this.pageSize,
    payload.from=this.from
    if(payload?.query)payload.query = { }
    if(payload?.sort)payload.sort = {
      "desc" : ["updatedOn"]
   }
  //  if(payload?.size)payload.size = Number(this.size)
  //  if(payload?.from)payload.from = 0
    this.commonService.getSTList('uom', payload)?.subscribe((data) => {
      this.uomData = data.documents;

      if (data && data?.documents) {
        this.dataSource.data = data.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1+this.from,
          uomName: s.uomName,
          uomShort: s.uomShort,
          uomCategory: s.uomCategory
          
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
    this.getUomList();
  }

  getPaginationData(type: any) {
    this.fromSize =
      type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
    let payload = this.commonService.filterList()
    payload.query = { }
    payload.sort = {
      "desc" : ["updatedOn"]
   }
   payload.size = Number(this.size)
   payload.from = this.fromSize - 1;
   let mustArray = {};
    this.uomName = this.uomName?.trim();
    this.uomShort = this.uomShort?.trim();
    this.uomCategory = this.uomCategory?.trim();

    if (this.uomName) {
      mustArray['uomName'] = {
        "$regex" : this.uomName,
        "$options": "i"
    }
    }

    if (this.uomShort) {
      mustArray['uomShort'] = {
        "$regex" : this.uomShort,
        "$options": "i"
    }
    }
    if (this.uomCategory) {
      mustArray['uomCategory'] = {
        "$regex" : this.uomCategory,
        "$options": "i"
    }
    }
    payload.query = mustArray
    this.commonService.getSTList('uom', payload).subscribe((data) => {
      this.uomData = data.documents;
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
    this.uomName = this.uomName?.trim();
    this.uomShort = this.uomShort?.trim();
    this.uomCategory = this.uomCategory?.trim();

    if (this.uomName) {
      mustArray['uomName'] = {
        "$regex" : this.uomName,
        "$options": "i"
    }
    }

    if (this.uomShort) {
      mustArray['uomShort'] = {
        "$regex" : this.uomShort,
        "$options": "i"
    }
    }
    if (this.uomCategory) {
      mustArray['uomCategory'] = {
        "$regex" : this.uomCategory,
        "$options": "i"
    }
    }
    let payload = this.commonService.filterList()
    payload.query = mustArray
    payload.sort = {
      "desc" : ["updatedOn"]
   }
   payload.size = Number(this.size)
   payload.from = 0,
    this.commonService.getSTList('uom', payload).subscribe((data) => {
      this.uomData = data.documents?.map((s: any,index) => {
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
    this.uomId = '';
    this.uomName = '';
    this.uomShort = '';
    this.uomCategory = '';
    this.getUomList();
  }

  uomMasters() {
    this.submitted = true;
    if (this.uomForm.invalid) {
      return;
    }
    let newUom = {
      "tenantId": this.tenantId,
      uomCategory: this.uomForm.value.uomCategory,
      uomName: this.uomForm.value.uomName,
      uomShort: this.uomForm.value.uomShort,
      uomCode: this.uomForm.value.uomCode,
      measurement: 'T',
      measure:this.uomForm.value.measurement,
      remark: this.uomForm.value.remark,
      status: this.uomForm.value.status,
    };
    if (!this.UomIdToUpdate) {
      const data = newUom;
      this.commonService.addToST(`uom`,data).subscribe(
        (res: any) => {
          if (res) {
          
            setTimeout(() => {
              this.notification.create('success', 'Added Successfully', '');
              this.onSave();
              this.getUomList();
            }, 1000);
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error', error?.error?.error?.message , '');
        }
      );
    } else {
      const dataWithUpdateId = { ...newUom, uomId: this.UomIdToUpdate };
      this.commonService.UpdateToST(`uom/${dataWithUpdateId.uomId}`,dataWithUpdateId).subscribe(
        (result: any) => {
          if (result) {
            setTimeout(() => {
              this.notification.create('success', 'Updated Successfully', '');
            this.onSave();
            this.getUomList();
            }, 1000);
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error', error?.error?.error?.message , '');
        }
      );
    }
  }

  open(content, uom?: any,show?) {
    this.show = show
    if (uom) {
      this.UomIdToUpdate = uom?.uomId;
      this.uomForm.patchValue({
        uomCategory: uom.uomCategory,
        uomName: uom.uomName,
        uomShort: uom.uomShort,
        uomCode: uom.uomCode,
        measurement: uom.measure,
        remark: uom.remark,
        status: uom.status,
      });
    }
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
    show=='show'?this.uomForm.disable():this.uomForm.enable()
  }

  delete(deleteuom, id) {
    this.modalService
      .open(deleteuom, {
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
            let data = 'uomId' + id.uomId
            this.commonService.deleteST(data).subscribe((res: any) => {
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
  changeStatus(data, i) {
    this.commonService.UpdateToST(`uom/${data.uomId}`,{ ...data, status: !data?.status })
      .subscribe(
        (res: any) => {
          if (res) {
            this.uomData[i].status = !data?.status;
            this.notification.create(
              'success',
              'Status Updated Successfully',
              ''
            );
            var myInterval = setInterval(() => {
              this.search();
              clearInterval(myInterval);
            }, 1000);
          }
        },
        (error) => {
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
  }
  onSave() {
    this.submitted = false;
    this.UomIdToUpdate = null;
    this.uomForm.reset();
    this.uomForm.controls.status.setValue(true);
    this.uomForm.controls.remark.setValue('');
    this.modalService.dismissAll();
    return null;
  }

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.uomData.map((row: any) => {
      storeEnquiryData.push({
        'UOM Name': row.uomName,
        'UOM Short': row.uomShort,
        'UOM Category': row.uomCategory,
        'Status': row.status ? 'Active' : 'Inactive',
      });
    });
    const myworksheet: XLSX.WorkSheet =
      XLSX.utils.json_to_sheet(storeEnquiryData);
    const myworkbook: XLSX.WorkBook = {
      Sheets: { data: myworksheet },
      SheetNames: ['data'],
    };
    const fileName = 'uom.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }



downloadExcelFile(data, filename) {
    const a = document.createElement('a');
    a.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${data}`;
    a.download = filename;
    a.click();
}


  openPDF() {
    const prepare=[];
    this.uomData.forEach(e=>{
      let tempObj =[];
      tempObj.push(e.uomName);
      tempObj.push(e.uomShort);
      tempObj.push(e.uomCategory);
      tempObj.push(e.status ? 'Active' : 'Inactive')
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [297, 210]);
    autoTable(doc,{
        head: [['UOM Name','UOM Short','UOM Category','Status']],
        body: prepare,
        didDrawCell: (data) => {
          // Draw border lines for each cell
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'S');
      }
    });
    doc.save('uom' + '.pdf');
  }
}
