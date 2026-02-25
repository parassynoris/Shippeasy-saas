import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder,FormGroup,Validators,} from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
import { DatePipe } from '@angular/common';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { MastersService } from 'src/app/services/Masters/masters.service';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { CommonService } from 'src/app/services/common/common.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { PortDetails } from 'src/app/models/yard-cfs-master';
import { SystemType } from 'src/app/models/cost-items';
import { Clause } from 'src/app/models/clause-master';
import { MastersSortPipe } from 'src/app/shared/util/mastersort';
import { MatDrawer } from '@angular/material/sidenav';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';

@Component({
  selector: 'app-clause-master',
  templateUrl: './clause-master.component.html',
  styleUrls: ['./clause-master.component.css'],
})
export class ClauseMasterComponent implements OnInit {
  _gc=GlobalConstants;
  addClauseForm: FormGroup;
  clauseData:Clause[] = [];
  clauseIdToUpdate: any;
  closeResult: string;
  toalLength: any;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  port_id: any;
  reamkrs: any;
  created_by: any;
  created_date: any;
  last_updated: any;
  last_updated_date: any;
  port_option: any;
  sl_no: any;
  clause_name: any;
  clause_type: any;
  portData:PortDetails []=[];
  clauseTypeData: SystemType[] = [];
  submitted: any = false;
  clauseType: any;
  show: any;
  tenantId: any;
yardcfs:any

  @ViewChild(MatDrawer) drawer: MatDrawer | any;
  dataSource = new MatTableDataSource();
  pagenation = [10,20, 50, 100];
  email:any
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns =[
    '#', 
    'action',
   'port_Id',
   'remarks',
   'createdBy',
    'createdOn',
    'updatedBy',
    'updatedOn',
    'portOption',
    'clauseName',
    'clauseType'
  ];
  isMaster: boolean = false;

  constructor(
    public modalService: NgbModal,
    private saMasterService: SaMasterService,
    private fb: FormBuilder,
    public datepipe: DatePipe,
    private profileService: ProfilesService,
    public notification: NzNotificationService,
    public commonService: CommonService,private cognito : CognitoService,
    private commonfunction: CommonFunctions,
    private sortPipelist: MastersSortPipe,
    public loaderService: LoaderService,

  ) {
    this.addClauseForm = this.fb.group({
      clauseType: ['', Validators.required],
      port_Id: ['', Validators.required],
      remarks: [''],
      portOption: ['', Validators.required],
      status: [true],
      clauseName: ['', Validators.required],
    });
  }
  get f() {
    return this.addClauseForm.controls;
  }

  ngOnInit(): void {
    // this.vvoye()
    this.getportList();
    this.getData();
    this.getClauseType();
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.tenantId = resp.tenantId
      }
    }) 
  }

  vvoye() {
    let payload = this.commonService.filterList()
      payload.sort = {
        "desc" : ["updatedOn"]
     }
     let mustArray = {};
   payload.query=mustArray;
      this.commonService.getSTList('clause', payload).subscribe((res: any) => {
      if (res && res.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1,
          port_Id: s.port_Id,
          remarks: s.remarks,
          createdBy: s.createdBy,
          createdOn: s.createdOn,
          updatedBy: s.updatedBy,
          updatedOn: s.updatedOn,
          portOption: s.portOption,
          clauseName : s.clauseName,
          clauseType :s.clauseType
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
    this.commonService.getSTList('clause', payload)?.subscribe((data) => {
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
    this.getData();
  }

  sortList(array , key){
    return this.sortPipelist.transform(array, key);
   }
  deleteclause(id: any) {
    alert('Item deleted!');
  }
  getportList() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      status: true,
    }
    this.commonService.getSTList('port', payload)?.subscribe((res: any) => {
      this.portData = res.documents;
    });
  }
  getClauseType() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      typeCategory: 'clauseType',
    }
    if(payload?.sort)payload.sort = {
      "desc" : ["updatedOn"]
   }
   if(payload?.size)payload.size = Number(this.size)
   if(payload?.from)payload.from = this.page -1
    this.commonService.getSTList('systemtype', payload)?.subscribe((res: any) => {
      this.clauseTypeData = res.documents;
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
    this.getData();
  }
  getData() {
    this.loaderService.showcircle();
    let payload = this.commonService.filterList()
    if(payload?.sort)payload.sort = {
      "desc" : ["updatedOn"]
   }
   if (payload?.size)payload.size= this.pageSize,
   payload.from=this.from
   let mustArray = {};
    this.port_id = this.port_id?.trim();
    this.reamkrs = this.reamkrs?.trim();
    this.created_by = this.created_by?.trim();
    this.created_date = this.created_date?.trim();
    this.last_updated = this.last_updated?.trim();
    this.last_updated_date = this.last_updated_date?.trim();
    this.port_option = this.port_option?.trim();
    this.sl_no = this.sl_no?.trim();
    this.clause_name = this.clause_name?.trim();
    this.clause_type = this.clause_type?.trim();

    if (this.port_id) {
      mustArray['port_Id'] = {
        "$regex" : this.port_id,
        "$options": "i"
    }
    }
    if (this.reamkrs) {
      mustArray['remarks'] = {
        "$regex" : this.reamkrs,
        "$options": "i"
    }
    }
   

    if (this.created_by) {
      mustArray['createdBy'] = {
        "$regex" : this.created_by,
        "$options": "i"
    }
    }

    if (this.created_date) {
      mustArray['createdOn']= {
        "$gt" : this.created_date.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.created_date.substring(0, 10) + 'T23:59:00.000Z'
    }
    }

    if (this.last_updated) {
      mustArray['updatedBy'] = {
        "$regex" : this.last_updated,
        "$options": "i"
    }
    }

    if (this.last_updated_date) {
      mustArray['updatedOn']= {
        "$gt" : this.last_updated_date.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.last_updated_date.substring(0, 10) + 'T23:59:00.000Z'
    }
    }

    if (this.port_option) {
      mustArray['portOption'] = {
        "$regex" : this.port_option,
        "$options": "i"
    }
    }

    if (this.sl_no) {
      mustArray['slNo'] = {
        "$regex" : this.sl_no,
        "$options": "i"
    }
    }

    if (this.clause_name) {
      mustArray['clauseName'] = {
        "$regex" : this.clause_name,
        "$options": "i"
    }
    }

    if (this.clause_type) {
      mustArray['clauseType'] = {
        "$regex" : this.clause_type,
        "$options": "i"
    }
      
    }
    if(payload?.query)payload.query = mustArray;
    this.commonService.getSTList('clause', payload)?.subscribe((res: any) => {
      this.clauseData = res.documents;

      if (res && res?.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1,
          costitemName: s.costitemName,
          costitemGroup: s.costitemGroup,
          chargeTypeName: s.chargeTypeName,
          chargeGroup: s.chargeGroup,
          currency: s.currency,
          status: s.status
          
        }));
        // this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1; 
        this.toalLength = res.totalCount;
        this.count = res.documents.length;
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
    this.getData();
  }

  getPaginationData(type: any) {
    this.fromSize =
      type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
      let payload = this.commonService.filterList()
      payload.sort = {
        "desc" : ["updatedOn"]
     }
     if (payload?.size)payload.size = Number(this.size)
     payload.from = this.fromSize -1;
     let mustArray = {};
    this.port_id = this.port_id?.trim();
    this.reamkrs = this.reamkrs?.trim();
    this.created_by = this.created_by?.trim();
    this.created_date = this.created_date?.trim();
    this.last_updated = this.last_updated?.trim();
    this.last_updated_date = this.last_updated_date?.trim();
    this.port_option = this.port_option?.trim();
    this.sl_no = this.sl_no?.trim();
    this.clause_name = this.clause_name?.trim();
    this.clause_type = this.clause_type?.trim();

    if (this.port_id) {
      mustArray['port_Id'] = {
        "$regex" : this.port_id,
        "$options": "i"
    }
    }
    if (this.reamkrs) {
      mustArray['remarks'] = {
        "$regex" : this.reamkrs,
        "$options": "i"
    }
    }
   

    if (this.created_by) {
      mustArray['createdBy'] = {
        "$regex" : this.created_by,
        "$options": "i"
    }
    }

    if (this.created_date) {
      mustArray['createdOn']= {
        "$gt" : this.created_date.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.created_date.substring(0, 10) + 'T23:59:00.000Z'
    }
    }

    if (this.last_updated) {
      mustArray['updatedBy'] = {
        "$regex" : this.last_updated,
        "$options": "i"
    }
    }

    if (this.last_updated_date) {
      mustArray['updatedOn']= {
        "$gt" : this.last_updated_date.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.last_updated_date.substring(0, 10) + 'T23:59:00.000Z'
    }
    }

    if (this.port_option) {
      mustArray['portOption'] = {
        "$regex" : this.port_option,
        "$options": "i"
    }
    }

    if (this.sl_no) {
      mustArray['slNo'] = {
        "$regex" : this.sl_no,
        "$options": "i"
    }
    }

    if (this.clause_name) {
      mustArray['clauseName'] = {
        "$regex" : this.clause_name,
        "$options": "i"
    }
    }

    if (this.clause_type) {
      mustArray['clauseType'] = {
        "$regex" : this.clause_type,
        "$options": "i"
    }
      
    }
    payload.query=mustArray;
      this.commonService.getSTList('clause', payload).subscribe((data) => {
      this.clauseData = data.documents;
      this.toalLength = data.totalCount;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count =
      type === 'prev'
        ? this.toalLength === this.count
          ? this.count - ((this.toalLength % Number(this.size))>0?(this.toalLength % Number(this.size)):(Number(this.size)))
          : this.count - data.documents.length
        : this.count + data.documents.length;
  });
  }

  open(content, clause?: any, show?: string) {
    this.show = show;
  
    // Reset the form when opening for a new entry
    this.addClauseForm.reset();
  
    if (clause) {
      // Edit mode: populate the form with existing clause data
      this.clauseIdToUpdate = clause.clauseId;
  
      this.addClauseForm.patchValue({
        clauseType: clause.clauseType,
        port_Id: clause.port_Id,
        remarks: clause.remarks,
        createdBy: clause.createdBy,
        createdDate: this.datepipe.transform(clause.createdDate, 'dd-MM-yyyy'),
        lastUpdatedBy: clause.lastUpdatedBy,
        lastUpdatedDate: clause.lastUpdatedDate,
        portOption: clause.portOption,
        slNo: clause.slNo,
        clauseName: clause.clauseName,
        status: clause.status,
      });
  
      // Enable or disable the form based on the show parameter
      if (show === 'show') {
        this.addClauseForm.disable();
      } else {
        this.addClauseForm.enable();
      }
    } else {
      // New entry (add mode): ensure the form is enabled
      this.addClauseForm.enable();
    }
  
    // Open the modal dialog
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }
  clausesMasters() {
    this.submitted = true;
    if (this.addClauseForm.invalid) {
      return;
    }

    let newClause = this.addClauseForm.value;
    if (!this.clauseIdToUpdate) {
      const dataupdate = { ...newClause, 
      "tenantId": this.tenantId,
      "orgId": this.commonfunction.
      getAgentDetails
      ()?.orgId, 
    status : this.addClauseForm.get('status').value || false};

      this.commonService.addToST('clause',dataupdate).subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Added Successfully', '');
            this.onSave();
            this.getData();
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error', error?.error?.error?.message , '');
        }
      );
    } else {
      let dataWithUpdatedId = { ...newClause, clauseId: this.clauseIdToUpdate };
      this.commonService.UpdateToST(`clause/${dataWithUpdatedId.clauseId}`,dataWithUpdatedId).subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Updated Successfully', '');
            this.onSave();
            this.getData();
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error', error?.error?.error?.message , '');
        }
      );
    }
  }
  changeStatus(data, i) {
    this.commonService.UpdateToST(`clause/${data.clauseId}`,{ ...data, status: !data?.status })
      .subscribe(
        (res: any) => {
          if (res) {
            this.clauseData[i].status = !data?.status;
            this.notification.create(
              'success',
              'Status Updated Successfully',
              ''
            );
            this.onSave();
            var myInterval = setInterval(() => {
              this.getData();
              clearInterval(myInterval);
            }, 2000);
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
  }

  delete(deleteclause, id) {
    this.modalService
      .open(deleteclause, {
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
            let data = 'clause' + id.clauseId
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
  onSave() {
    this.submitted = false;
    this.clauseIdToUpdate = null;
    this.submitted = false;
    this.modalService.dismissAll();
    return null;
  }

  search() {
    let mustArray = {};
    this.port_id = this.port_id?.trim();
    this.reamkrs = this.reamkrs?.trim();
    this.created_by = this.created_by?.trim();
    this.created_date = this.created_date?.trim();
    this.last_updated = this.last_updated?.trim();
    this.last_updated_date = this.last_updated_date?.trim();
    this.port_option = this.port_option?.trim();
    this.sl_no = this.sl_no?.trim();
    this.clause_name = this.clause_name?.trim();
    this.clause_type = this.clause_type?.trim();

    if (this.port_id) {
      mustArray['port_Id'] = {
        "$regex" : this.port_id,
        "$options": "i"
    }
    }
    if (this.reamkrs) {
      mustArray['remarks'] = {
        "$regex" : this.reamkrs,
        "$options": "i"
    }
    }
   

    if (this.created_by) {
      mustArray['createdBy'] = {
        "$regex" : this.created_by,
        "$options": "i"
    }
    }

    if (this.created_date) {
      mustArray['createdOn']= {
        "$gt" : this.created_date.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.created_date.substring(0, 10) + 'T23:59:00.000Z'
    }
    }

    if (this.last_updated) {
      mustArray['updatedBy'] = {
        "$regex" : this.last_updated,
        "$options": "i"
    }
    }

    if (this.last_updated_date) {
      mustArray['updatedOn']= {
        "$gt" : this.last_updated_date.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.last_updated_date.substring(0, 10) + 'T23:59:00.000Z'
    }
    }

    if (this.port_option) {
      mustArray['portOption'] = {
        "$regex" : this.port_option,
        "$options": "i"
    }
    }

    if (this.sl_no) {
      mustArray['slNo'] = {
        "$regex" : this.sl_no,
        "$options": "i"
    }
    }

    if (this.clause_name) {
      mustArray['clauseName'] = {
        "$regex" : this.clause_name,
        "$options": "i"
    }
    }

    if (this.clause_type) {
      mustArray['clauseType'] = {
        "$regex" : this.clause_type,
        "$options": "i"
    }
      
    }

    let payload = this.commonService.filterList()
    payload.query = mustArray
    payload.sort = {
      "desc" : ["updatedOn"]
   }
   if (payload?.size)payload.size = Number(this.size)
   payload.from = this.page -1,
    this.commonService.getSTList('clause', payload).subscribe((res: any) => {
      this.clauseData = res.documents?.map((s: any,index) => {
          return{
            ...s,
            id:index+1+this.from
          }
        });
      this.toalLength = res.totalCount;
      this.count = res.documents.length;
      this.fromSize =1
    });
  }

  clear() {
    this.port_id = '';
    this.reamkrs = '';
    this.created_by = '';
    this.created_date = '';
    this.last_updated = '';
    this.last_updated_date = '';
    this.port_option = '';
    this.sl_no = '';
    this.clause_name = '';
    this.clause_type = '';

    this.getData();
  }

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.clauseData.map((row: any) => {
      storeEnquiryData.push({
        'Port Id': row.port_Id,
        'Remarks': row.remarks,
        'Created By': row.createdBy,
        'Created Date': row.createdOn,
        'Last Updated By': row.updatedBy,
        'Last Updated Dt': row.updatedOn,
        'Port Option': row.portOption,
        'Clauses Name': row.clauseName,
        'Clause Type': row.clauseType,
        'Status' : row.status ? 'Active' : 'Inactive'

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

    const fileName = 'clause-master.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  openPDF() {
    const prepare=[];
    this.clauseData.forEach(e=>{
      let tempObj =[];
      tempObj.push(e.port_Id);
      tempObj.push(e.remarks);
      tempObj.push(e.createdBy);
      tempObj.push(e.createdOn);
      tempObj.push(e.updatedBy);
      tempObj.push(e.updatedOn);
      tempObj.push(e.portOption);
      tempObj.push(e.clauseName);
      tempObj.push(e.clauseType);
      tempObj.push(e.status ? 'Active' : 'Inactive' )
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [397, 310]);
    autoTable(doc,{
        head: [['Port Id','Remarks','Created By','Created Date','Last Updated By','Last Updated Dt','Port Option','Clauses Name','Clause Type', 'Status']],
        body: prepare,
        didDrawCell: (data) => {
          // Draw border lines for each cell
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'S');
      }
    });
    doc.save('clause-master' + '.pdf');
  }
}
