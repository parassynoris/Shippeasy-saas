import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormArray,
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
import {  Router } from '@angular/router';
import { CommonService } from 'src/app/services/common/common.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { Taxation,CostItem } from 'src/app/models/sac';
import { CountryData } from 'src/app/models/city-master';
import { SystemType } from 'src/app/models/system-type';
import { MastersSortPipe } from 'src/app/shared/util/mastersort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
@Component({
  selector: 'app-sac',
  templateUrl: './sac.component.html',
  styleUrls: ['./sac.component.scss']
})
export class SacComponent implements OnInit {
  _gc=GlobalConstants;
  historyScreen: boolean = false;
  containerHistoryList: any = [{}];
  PortData = [];
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
  containerList: Taxation[] = [];

  isEdit: boolean = false;
  show: string;
  isRequird: boolean = false;


  entityTypeList = []
  currentUrl: string;

  hsnCode: string;
  description: string;
  hsnType: string;
  countryList: CountryData[] = [];
  costList: CostItem[] = [];
  hsnTypeList: SystemType[] = [];
  tenantId: string;
yardcfs:any
  dataSource = new MatTableDataSource();
  pagenation = [10,20, 50, 100];
  email:any
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns =[
    '#', 
    'action',
  //  'countryName',
   'hsnCode',
   'description',
   'hsnType'
  ];
  isMaster: boolean = false;

  constructor(
    public modalService: NgbModal,
    private fb: FormBuilder,
    public notification: NzNotificationService,
    private tranService: TransactionService,
    public commonService: CommonService,
    public datepipe: DatePipe,
    private _api: ApiService,
    public sortPipe: OrderByPipe,public cognito : CognitoService,
    private router: Router,
    private commonfunction: CommonFunctions,
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
      hsnCode: ['', [Validators.required]],
      description: ['', [Validators.required]],
      hsnTypeId: [''],
      changesItems: [[]],
      row: this.fb.array([]),

    });
  }
  getCountryList() {
    let payload = this.commonService.filterList()
    this.commonService.getSTList('country', payload)?.subscribe((data) => {
      this.countryList = data.documents;
    });
  }
  getCostList() {

    let payload = this.commonService.filterList()
    this.commonService.getSTList('costitem', payload)?.subscribe((data) => {
      this.costList = data.documents;
    });
  }
  getSystemTypeDropDowns() {

    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {    typeCategory: 'hsnType',"status": true }
    this.commonService.getSTList('systemtype', payload)?.subscribe((res: any) => {
        this.hsnTypeList = res?.documents?.filter(x => x.typeCategory === "hsnType");
      });
  }
  ngOnInit(): void {
    this.vvoye()
    this.getCostList()
    this.getCountryList();
    this.getContainerData();
    this.getSystemTypeDropDowns();
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.tenantId = resp.tenantId
      }
    }) 
  }


  vvoye() {
    let payload = this.commonService.filterList()
    if(payload?.sort)payload.sort = {
      "desc" : ["updatedOn"]
   }
   let mustArray = {};
   if(payload?.query)payload.query=mustArray;
   this.commonService.getSTList('taxtype', payload)?.subscribe((res: any) => {
      if (res && res.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1,
          hsnCode: s.hsnCode,
          description: s.description,
          hsnType: s.hsnType,
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
    this.email.map((row: any) => {
      storeEnquiryData.push({
        'hsnCode' : row?.element?.hsnCode,
        'description' : row?.element?.description,
        'hsnType' : row?.element?.hsnType,
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
    let payload = this.commonService.filterList()
    payload.query = this.filterKeys
    payload.sort = {
      "desc": ["updatedOn"]
    }
    this.commonService.getSTList('taxtype', payload).subscribe((data) => {
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
    this.getContainerData()
  }


  get f() {
    return this.addContainerForm.controls;
  }
  sortList(array , key){
    return this.sortPipelist.transform(array, key);
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
    
    let payload = this.commonService.filterList()
    payload.sort = {
      "desc" : ["updatedOn"]
   }
  //  payload.size = Number(this.size)
  //  payload.from = this.fromSize -1;
   let mustArray = {};
    this.hsnCode = this.hsnCode?.trim();
    this.description = this.description?.trim();
    this.hsnType = this.hsnType?.trim();

    if (this.hsnCode) {
      mustArray['hsnCode'] = {
        "$regex" : this.hsnCode,
        "$options": "i"
    }
    }

    if (this.description) {
      mustArray['description'] = {
        "$regex" : this.description,
        "$options": "i"
    }
    }
    if (this.hsnType) {
      mustArray['hsnType'] = {
        "$regex" : this.hsnType,
        "$options": "i"
    }
    }
    payload.query=mustArray;
    this.commonService.getSTList('taxtype', payload).subscribe((data: any) => {
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
    this.hsnCode = this.hsnCode?.trim();
    this.description = this.description?.trim();
    this.hsnType = this.hsnType?.trim();

  


    if (this.hsnCode) {
      mustArray['hsnCode'] = {
        "$regex" : this.hsnCode,
        "$options": "i"
    }
    }

    if (this.description) {
      mustArray['description'] = {
        "$regex" : this.description,
        "$options": "i"
    }
    }
    if (this.hsnType) {
      mustArray['hsnType'] = {
        "$regex" : this.hsnType,
        "$options": "i"
    }
    }


    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = mustArray
    if(payload?.sort)payload.sort = {
      "desc" : ["updatedOn"]
   }
  //  if(payload?.size)payload.size = Number(this.size)
  //  if(payload?.from)payload.from = this.page -1;
    this.commonService.getSTList('taxtype', payload)?.subscribe((data: any) => {
      this.containerList = data?.documents?.map((s: any,index) => {
        return{
          ...s,
          id:index+1
        }
      })
      this.toalLength = data.totalCount;
      this.count = data.documents.length;
      this.fromSize = 1
    });
  }
  getContainerData() {
    this.loaderService.showcircle();
    let payload = this.commonService.filterList()
    if(payload?.sort)payload.sort = {
      "desc" : ["updatedOn"]
   }
  //  if(payload?.size)payload.size = Number(this.size)
  //  if(payload?.from)payload.from = this.page -1
    this.commonService.getSTList('taxtype', payload)?.subscribe((res: any) => {
      this.containerList = res?.documents;
      this.toalLength = res.totalCount;
      this.count = res.documents.length;
      if (res && res?.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1,
          hsnCode: s.hsnCode,
          description: s.description,
          hsnType: s.hsnType,
          
        }));
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1; 
        this.loaderService.hidecircle();
      }
    },()=>{
      this.loaderService.hidecircle();
    });
  }

  clear() {
    this.hsnCode = '';
    this.description = '';
    this.hsnType = '';
    this.getContainerData();
  }
  isViewMode: boolean = false;
  open(content, containerMaster?: any, show?) {
    this.show = show;
    this.isEdit = false;
    this.isViewMode = show === 'show';
 
    if (containerMaster) {
      this.isEdit = true;
      this.setCharge(containerMaster?.changesItems);
      this.containerIdToUpdate = containerMaster?.taxtypeId;
      if (containerMaster?.rates?.length > 0) {
        containerMaster?.rates?.forEach(e => {
          this.row.push(this.addRow(e))
        })
      }
      this.addContainerForm.patchValue({
        hsnCode: containerMaster?.hsnCode,
        description: containerMaster?.description,
        hsnTypeId: containerMaster?.hsnTypeId,

      });
      show === 'show' ? this.addContainerForm.disable() : this.addContainerForm.enable();
    }else{
      this.addNewRow()
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
      return;
    }
    let hsnType = this.hsnTypeList.filter((x) => x?.systemtypeId === this.addContainerForm.value.hsnTypeId)[0]?.typeName
    let body = {
      "status": true,
      "tenantId": this.tenantId,
      "remarks": "",
      "hsnTypeId" : this.addContainerForm.value.hsnTypeId,
      "hsnType": hsnType,
      "hsnCode": this.addContainerForm.value.hsnCode ,
      "description": this.addContainerForm.value.description ,
      "rates": this.addRate(),
      "taxRate" :  this.row?.controls[this.row?.controls?.length -1]?.value.rate,
      "effectiveFrom" : '',
    }

    const data = { ...body, taxtypeId: this.containerIdToUpdate };

   
    if (this.isEdit) {
      this.commonService.UpdateToST(`taxtype/${data.taxtypeId}`, data).subscribe(
        (result: any) => {
          if (result) {
            setTimeout(() => {
              this.notification.create('success', 'Updated Successfully', '');
              this.onSave();
              this.getContainerData();
            }, 800);
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error', error?.error?.error?.message , '');
        }
      );
    } else {
      this.commonService.addToST("taxtype", data).subscribe(
        (result: any) => {
          if (result) {
            setTimeout(() => {
              this.notification.create('success', 'Add Successfully', '');
              this.onSave();
              this.getContainerData();
            }, 800);
          }
        },
        (error) => {
          this.onSave();
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
            let data = 'taxtype' + id.containermasterId
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
  changeStatus(data) {
    this.commonService.UpdateToST(`taxtype/${data.taxtypeId}`,{ ...data, status: !data?.status })
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
    if (this.containerList.length === 0) {
      return
    }
    let storeEnquiryData = [];
    this.containerList.map((row: any) => {
      storeEnquiryData.push({
        'TDS Nature': row.hsnCode,
        'Account Code': row.description,
        'TDS %': row.hsnType,
        'Status':row.status ? 'Active' : 'Inactive'
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
    if (this.containerList.length === 0) {
      return false
    }
    const prepare = [];
    this.containerList.forEach(e => {
      let tempObj = [];
      tempObj.push(e.hsnCode);
      tempObj.push(e.description);
      tempObj.push(e.hsnType);
      tempObj.push(e.status ? 'Active' : 'Inactive');
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [297, 210]);
    autoTable(doc, {
      head: [['HSN Code', 'Description', 'HSN Type','Status']],
      body: prepare,
      didDrawCell: (data) => {
        // Draw border lines for each cell
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'S');
    }
    });
    doc.save('HSN' + '.pdf');
  }
  selectedCharge: any = []
  setCharge(e?) {
    this.selectedCharge = []
    let data = []
    this.costList.forEach(element => {
      if (e?.includes(element?.costitemId)) {
        this.selectedCharge.push(element)
      }
    });
  }
  get row() {
    return this.addContainerForm.controls["row"] as FormArray;
  }
  addNewRow() {
    this.row.push(this.addRow(''))
  }
  addRow(res) {
    return this.fb.group({
      countryId: [res ? res.countryId : '', [Validators.required]],
      rate: [res ? res.rate : '', [Validators.required]],
      isGSTExepm: [res ? res.isGSTExepm : false],
      isVATExepm: [res ? res.isVATExepm : false],
      effectiveFrom: [res ? res.fromDate : ''],
      effectiveTo: [res ? res.toDate : ''],
    })
  }
  deleteBranch(vIndex: number) {
    this.row.removeAt(vIndex);
  }
  addRate() {
    const rowArray = [];
    this.row?.controls.forEach(element => {
      let row = {
        rate: element.value.rate || '0',
        isGSTExepm: element.value.isGSTExepm || false,
        isVATExepm: element.value.isVATExepm || false,
        fromDate: element.value.effectiveFrom || '',
        toDate: element.value.effectiveTo || '',
        countryId: element.value.countryId || '',
        countryName: this.countryList.filter(x => x.countryId === element.value.countryId)[0]?.countryName || '',

      }
      rowArray.push(row)
    });
    return rowArray;
  }
}
