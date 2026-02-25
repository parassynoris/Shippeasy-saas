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
import {  Router } from '@angular/router';
import { CommonService } from 'src/app/services/common/common.service';
import { Container, Location } from 'src/app/models/container-master';
import { PartyMasterData } from 'src/app/models/party-master';
import { MastersSortPipe } from 'src/app/shared/util/mastersort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';

@Component({
  selector: 'app-container-survey',
  templateUrl: './container-survey.component.html',
  styleUrls: ['./container-survey.component.scss']
})
export class ContainerSurveyComponent implements OnInit {
  _gc=GlobalConstants;
  historyScreen: boolean = false;
  containerHistoryList: object = [];
  PortData: [];
  addContainerForm: FormGroup;
  containerIdToUpdate: null;
  closeResult: string;
  toalLength: number;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  submitted: boolean = false;
  containerno: string;
  containerStatus: string;
  customerName: string;
  baseBody: BaseBody;
  containerList: Container[] = [];
  containerStatusList: any =["Reserved",
    "Release",
    "Revoke",
    "Available",
    "Under Repair",
    "Washing",
    " Under Survey",
    "Free use off Hire",
    "SOB"
  ]

  isEdit: boolean = false;
  customerList: PartyMasterData[] = [];
  listContainer: Container[];
  show: string;
  yardList:Location[];
  isRequird: boolean = false;
  currentUrl: string;
  previousStatus: string;
  locationName: string;

  dataSource = new MatTableDataSource<any>();
  pagenation = [10,20, 50, 100];
  emaill:any
  yardcfs:any
  @ViewChild(MatSort) sort1: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  displayedColumns =[
    '#', 
    'action',
   'containerNo',
   'customerName',
   'yardName',
   'containerStatus',
   'previousStatus',
   
  ];
  isMaster: boolean = false;

  constructor(
    public modalService: NgbModal,
    private fb: FormBuilder,
    public notification: NzNotificationService,
    private tranService: TransactionService,
    public commonFunctions: CommonFunctions,
    public datepipe: DatePipe,
    private _api: ApiService,
    private sortPipe: OrderByPipe,
    public router: Router,
    private sortPipelist: MastersSortPipe,
    public commonService : CommonService,
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
      containerNo: ['', [Validators.required]],
      customerName: [''],
      status: ['', [Validators.required]],
      date: [new Date(), [Validators.required]],
      remarks: [''],
      yard: ['' ]
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
    this.getPartyMaster();
    this.getContainer();
    this.getLocation()
  }
  exportAsExcelFile1(): void {
    let storeEnquiryData = [];
    this.emaill?.map((row: any) => {
      storeEnquiryData.push({
        'containerNo' : row?.element?.containerNo,
        'customerName' : row?.element?.customerName,
        'yardName' : row?.element?.yardName,
        'containerStatus':row?.element?.containerStatus,
        'previousStatus' : row?.element?.previousStatus,
        
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
    this.commonService.getSTList('containermaster' , payload)?.subscribe((data) => {
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
    this.getContainerData();
  }

  sortList(array , key){
    return this.sortPipelist.transform(array, key);
   }
  getLocation() {

    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      masterType:   {
        "$in": ['YARD','CFS']
      },
      "status": true
    }
    this._api.getSTList("location", payload)?.subscribe((res: any) => {
      this.yardList = res?.documents;
    });
  }
  getContainer() {

    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true
    }
    if(payload?.sort)payload.sort = {
       "desc" : ["updatedOn"]
    }
  
    this.commonService.getSTList('containermaster',payload)?.subscribe((res: any) => {
      this.listContainer = res?.documents;
      // this.containerList = res?.documents;
      this.toalLength = res.totalCount;
      this.count = res.documents.length;
      this.fromSize = 1
    });
  }
  getPartyMaster() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true
    }
    this._api.getSTList("partymaster", payload)?.subscribe((res: any) => {
      this.customerList = res?.documents
    });
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
    
    let payload = this.commonService.filterList()
    payload.sort = {
      "desc" : ["updatedOn"]
   }
   payload.size = Number(this.size)
   payload.from = this.fromSize - 1;
   let mustArray = {};
    mustArray['containerStatusId']  =true
    this.containerno = this.containerno?.trim();
    this.containerStatus = this.containerStatus?.trim();
    this.customerName = this.customerName?.trim();
    this.previousStatus = this.previousStatus?.trim();
    this.previousStatus = this.previousStatus?.trim();
    this.locationName = this.locationName?.trim();
    if (this.containerno) {
      mustArray['containerNo'] = {
        "$regex" : this.containerno,
        "$options": "i"
    }
    }


    if (this.containerStatus) {
      mustArray['containerStatus'] = {
        "$regex" : this.containerStatus,
        "$options": "i"
    }
    }
    if (this.customerName) {
      mustArray['customerName'] = {
        "$regex" : this.customerName,
        "$options": "i"
    }
    }
    if (this.previousStatus) {
      mustArray['previousStatus'] = {
        "$regex" : this.previousStatus,
        "$options": "i"
    }
    }
    if (this.previousStatus) {
      mustArray['yardName'] = {
        "$regex" : this.locationName,
        "$options": "i"
    }
    }
    if (this.locationName) {
      mustArray['yardName'] = {
        "$regex" : this.locationName,
        "$options": "i"
    }
    }
payload.query=mustArray;
    this.commonService.getSTList('containermaster' , payload)?.subscribe((data: any) => {
      this.containerList = data?.documents;
      this.listContainer = data?.documents;
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

  search() {

    let mustArray = {};
    mustArray['containerStatusId']  =true
    this.containerno = this.containerno?.trim();
    this.containerStatus = this.containerStatus?.trim();
    this.customerName = this.customerName?.trim();
    this.previousStatus = this.previousStatus?.trim();
    this.previousStatus = this.previousStatus?.trim();
    this.locationName = this.locationName?.trim();
    if (this.containerno) {
      mustArray['containerNo'] = {
        "$regex" : this.containerno,
        "$options": "i"
    }
    }


    if (this.containerStatus) {
      mustArray['containerStatus'] = {
        "$regex" : this.containerStatus,
        "$options": "i"
    }
    }
    if (this.customerName) {
      mustArray['customerName'] = {
        "$regex" : this.customerName,
        "$options": "i"
    }
    }
    if (this.previousStatus) {
      mustArray['previousStatus'] = {
        "$regex" : this.previousStatus,
        "$options": "i"
    }
    }
    if (this.previousStatus) {
      mustArray['yardName'] = {
        "$regex" : this.locationName,
        "$options": "i"
    }
    }
    if (this.locationName) {
      mustArray['yardName'] = {
        "$regex" : this.locationName,
        "$options": "i"
    }
    }

    let payload = this.commonService.filterList()
    payload.query = mustArray
    // payload.size = Number(this.size),
    // payload.from = 0,
    payload.sort = {  "desc" : ['updatedOn'] }
    this.commonService.getSTList('containermaster',payload)?.subscribe((data: any) => {
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
  pageNumber = 1;
  pageSize = 10;
  from = 0;
  totalCount = 0;

  onPageChange(event){
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.from = event.pageIndex*event.pageSize ;
    this.getContainerData();
  }
  getContainerData() {
    this.loaderService.showcircle();
    let payload = this.commonService.filterList()
    if(payload?.size)payload.size= this.pageSize,
    payload.from=this.from
    if(payload?.query)payload.query = {
      "containerStatusId": true
    }
    if(payload?.sort)payload.sort = {
      "desc" : ["updatedOn"]
   }
   
    this.commonService.getSTList('containermaster',payload)?.subscribe((res: any) => {
      this.containerList = res?.documents;

      if (res && res?.documents) {
        this.dataSource= new MatTableDataSource(res?.documents?.map((s: any, i: number) => ({
          ...s,
          id: i + 1+this.from,
          containerNo: s.containerNo,
          customerName: s.customerName,
          yardName: s.yardName,
          containerStatus: s.containerStatus,
          previousStatus: s.previousStatus,
          
        })))
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

  clear() {
    this.customerName = ''
    this.containerno = '';
    this.containerStatus = '';
    this.previousStatus = '';
    this.locationName = ''
    this.getContainerData();
  }
   listContainer1 = []
   editCTR:any;
  backlist(){this.historyScreen=!this.historyScreen;this.getContainerData()}
  open(content, containerMaster?: any, show?) {
    this.listContainer1 = this.listContainer
    this.show = show;
    this.isEdit = false;
    if (containerMaster) {
      this.editCTR = containerMaster
      this.listContainer1 = this.containerList
      this.isEdit = true;
      this.addContainerForm.patchValue({
        date: containerMaster?.date,
        yard: containerMaster?.yardNameId || containerMaster?.yard,
        remarks: containerMaster?.remarks,
        status: containerMaster?.containerStatus,
        containerNo: containerMaster?.containermasterId,
        customerName: containerMaster?.customerId,
        previousStatus: containerMaster?.previousStatus,
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
    this.containerIdToUpdate = null;
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
    let container = this.listContainer1.filter((x) => x?.containermasterId === this.addContainerForm.value.containerNo)[0]

    let body = {
      ...container,
      orgId: this.commonFunctions.getAgentDetails().orgId,
      "tenantId": this.commonFunctions.getTenantId(),
      "date": this.addContainerForm.value.date,
      "remarks": this.addContainerForm.value.remarks,
      "yardName": this.yardList.filter((x) => x?.locationId === this.addContainerForm.value.yard)[0]?.locationName,
      "yardNameId": this.addContainerForm.value.yard,
      'containerStatus': this.addContainerForm.value.status,
      'customerName': this.customerList.filter(x => x?.partymasterId === this.addContainerForm.value.customerName)[0]?.customerName || '',
      'customerId': this.addContainerForm.value.customerName || '',
      "containerStatusId": true,
      "previousStatus": container?.containerStatus === this.addContainerForm.value.status ?
        container?.previousStatus : container?.containerStatus,
        status : true
    };

    const data = body;
    this.commonService.UpdateToST( `containermaster/${data.containermasterId}`,data)?.subscribe(
      (result: any) => {
        if (result) {
          setTimeout(() => {
            if (this.isEdit) {
              this.notification.create('success', 'Updated Successfully', '');
            } else {
              this.notification.create('success', 'Add Successfully', '');
            }
            this.onSave();
            this.getContainerData();
          }, 800);
        }
      },
      (error) => {
        this.onSave();
        this.notification.create('error', error, '');
      }
    );
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
            let data =`containermaster/${id.containermasterId}`

            this.commonService.deleteST(data)?.subscribe((res: any) => {
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
    this.commonService
      .UpdateToST(`containermaster/${data.containermasterId}`,{ ...data, status: !data?.status })
      ?.subscribe(
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
        'Container No': row.containerNo,
        'Customer Name': row.customerName,
        'Status': row.containerStatus,
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

    const fileName = 'container-survey.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  openPDF() {
    const prepare = [];
    this.containerList.forEach(e => {
      let tempObj = [];
      tempObj.push(e.containerNo);
      tempObj.push(e.customerName);
      tempObj.push(e.containerStatus);
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [297, 210]);
    autoTable(doc, {
      head: [['Container No', 'Customer Name', 'Status']],
      body: prepare,
      didDrawCell: (data) => {
        // Draw border lines for each cell
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'S');
    }
    });
    doc.save('container-survey' + '.pdf');
  }

  history(c) {

    this.router.navigate(['/master/' + c?.containermasterId + '/Container-History']);
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();

  }
  getHistory(id) {

 
      this.router.navigate(['master/audit-logs'], { queryParams: { id: id, collection : "containermaster" ,url : this.router.url} }); 
     


    return;
    this.loaderService.showcircle();
    this.containerHistoryList = []

    let payload = this.commonService.filterList()
    payload.query = {
      collection:"containermaster", auditLogType:"update-event", id:id
    }
    payload.sort = { "desc" : ["timestamp"]}
    this.commonService.getSTList('auditlog', payload)?.subscribe(
      (result: any) => {
         const data = result.documents.filter((x)=> {
          if(x.eventData){
            return x
          }
         })
          this.containerHistoryList = data?.sort((a, b) => new Date(b?.eventData?.updatedOn).getTime() - new Date(a?.eventData?.updatedOn).getTime());
          this.historyScreen = !this.historyScreen
          this.loaderService.hidecircle();
      },
      (error) => {
        this.loaderService.hidecircle();
        this.notification.create('error',error?.error?.error?.message, '');
      }
    );
  }
}
