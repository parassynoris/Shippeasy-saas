import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddVesselVoyageComponent } from './addvesselvoyage/addvesselvoyage.component';
import { ProfilesService } from "src/app/services/Profiles/profile.service";
import { NzNotificationService } from 'ng-zorro-antd/notification';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { DatePipe } from '@angular/common'
import { CommonService } from 'src/app/services/common/common.service';
import { MyData } from 'src/app/models/Vessel-voyage';
import { MastersSortPipe } from '../../util/mastersort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
@Component({
  selector: 'app-vessel-voyage',
  templateUrl: './Vessel-voyage.component.html',
  styleUrls: ['./Vessel-voyage.component.scss']
})
export class VesselVoyageComponent implements OnInit {
  _gc=GlobalConstants;
  @Input() voyageType;
  isParent: any;
  toalLength: any;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  voyageListData  = [];
  closeResult: string;
  vesselName: any;
  vayageNo: any;
  port: any;
  terminal: any;
  eta: any;
  etd: any;
  ata: any;
  atd: any;
  pc_number: any;
  pc_date: any;
  si_cuttof_date: any;
  status: any;
  yardcfs:any;
  
  dataSource = new MatTableDataSource <any>();
  pagenation = [10,20, 50, 100];
  emaill:any
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns =[
    '#', 
    'action',
   'vesselName',
   'voyageNumber',
   'voyageStartDate',
   'voyageEndDate',
   'ata',
   'atd',
   'pcNumber',
   'pc_date',
   'siCutOffDate',
   'status'
  ];
  isMaster: boolean = false;

  constructor(public modalService: NgbModal, private profilesService: ProfilesService, private notification: NzNotificationService, public datepipe: DatePipe,
    public commonService : CommonService,    private sortPipelist: MastersSortPipe,public loaderService: LoaderService,
    ) {
    this.isParent = location.pathname.split('/')[1];

  }

  vvoye() {
    let payload = this.commonService.filterList()
    payload.sort = {  "desc" : ['updatedOn'] }
    let mustArray = {};
    payload.query = mustArray

    this.commonService.getSTList('voyage',payload).subscribe((res: any) => {
     
      if (res && res.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1,
          vesselName: s.vesselName,
          voyageNumber: s.voyageNumber,
          portName: s.portName,
          voyageStartDate: s.voyageStartDate,
          voyageEndDate: s.voyageEndDate,
          ata: s.ata,
          atd: s.atd,
          pcNumber: s.pcNumber,
          pc_date: s.pc_date,
          siCutOffDate: s.siCutOffDate,
          status: s.status,
         
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
        'vesselName' : row?.element?.vesselName,
        'voyageNumber' : row?.element?.voyageNumber,
        'portName' : row?.element?.portName,
        'voyageStartDate' : row?.element?.voyageStartDate,
        'voyageEndDate' : row?.element?.voyageEndDate,
        'ata' : row?.element?.ata,
        'atd' : row?.element?.atd,
        'pcNumber' : row?.element?.pcNumber,
        'pc_date' : row?.element?.pc_date,
        'siCutOffDate' : row?.element?.siCutOffDate,
        'status': row?.element?.status
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
      if (each) {
        if (this.displayedColumns[ind] === 'status') {
          this.filterKeys[this.displayedColumns[ind]] = {
            "$eq": each.toLowerCase() === 'active' ? true : false
          };
        } else {
          this.filterKeys[this.displayedColumns[ind]] = {
            "$regex": each.toLowerCase(),
            "$options": "i"
          };
        }
      }
    });

    let payload = this.commonService.filterList();
    payload.query = this.filterKeys;
    payload.sort = {
      "desc": ["updatedOn"]
    };
    this.commonService.getSTList('voyage', payload)?.subscribe((data) => {
      this.yardcfs = data.documents;
      this.dataSource = new MatTableDataSource(
        data?.documents?.map((s: any, index) => {
          return {
            ...s,
            id: index + 1
          };
        })
      );
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort1;
    });
  }
  clearFilters() {
    this.filtersModel = [];
    this.filterKeys = {};
    this.getVesselVoyageList()
  }

  open(key, data) {
    const modalRef = this.modalService.open(AddVesselVoyageComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg'
    });

    modalRef.componentInstance.getList.subscribe((res: any) => {
      if (res) {
        this.getVesselVoyageList();
      }
    })
    modalRef.componentInstance.voyageType = this.voyageType;
    modalRef.componentInstance.fromParent = data;
    modalRef.componentInstance.isType = key;
    modalRef.componentInstance.isDeptType = this.isParent;
  }

  delete(deleteVoyage, id) {
    this.modalService.open(deleteVoyage, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: '',
      ariaLabelledBy: 'modal-basic-title'
    }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (result === 'yes') {
        let data ="voyage" + id.voyageId 
        this.commonService.deleteST(data).subscribe((res: any) => {
          if (res) {
            this.notification.create(
              'success',
              'Deleted Successfully',
              ''
            );
            this.clear();
          }
        })
      }
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
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
     this.getVesselVoyageList();
   }

  getVesselVoyageList() {
    this.loaderService.showcircle();
    let payload = this.commonService.filterList()   
    payload.size= this.pageSize,
    payload.from=this.from
    // payload.size = Number(this.size),
    // payload.from = 0,
    payload.sort = {  "desc" : ['updatedOn'] }
    let mustArray = {};
    this.voyageType = this.voyageType?.trim();
    this.vesselName = this.vesselName?.trim();
    this.vayageNo = this.vayageNo?.trim();
    this.port = this.port?.trim();
    this.terminal = this.terminal?.trim();
    this.eta = this.eta?.trim();
    this.ata = this.ata?.trim();
    this.atd = this.atd?.trim();
    this.pc_number = this.pc_number?.trim();
    this.pc_date = this.pc_date?.trim();
    this.si_cuttof_date = this.si_cuttof_date?.trim();
    this.status = this.status?.trim();
  
    // if(this.voyageType === 'import'){
    //   mustArray['isVoyageImport']  = true
    // }
    // if(this.voyageType === 'export'){
    //   mustArray["$and"] = [
    //     {
    //       "isVoyageImport": {
    //         "$ne": true
    //       }
    //     }
    //   ]
    // }

    if (this.vesselName) {
      mustArray['vesselName'] = {
        "$regex" : this.vesselName,
        "$options": "i"
    }
    }
    if (this.vayageNo) {
      mustArray['voyageNumber'] = {
        "$regex" : this.vayageNo,
        "$options": "i"
    }
    }
    if (this.port) {
      mustArray['portName'] = {
        "$regex" : this.port,
        "$options": "i"
    }
    }
    if (this.terminal) {
      mustArray['terminal_name'] = {
        "$regex" : this.terminal,
        "$options": "i"
    }
    }
    if (this.eta) {
      mustArray['voyageStartDate']= {
        "$gt" : this.eta.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.eta.substring(0, 10) + 'T23:59:00.000Z'
    }
  }

    if (this.etd) {
      mustArray['voyageEndDate']= {
        "$gt" : this.etd.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.etd.substring(0, 10) + 'T23:59:00.000Z'
    }
    
    }
    if (this.ata) {
      mustArray['ata']= {
        "$gt" : this.ata.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.ata.substring(0, 10) + 'T23:59:00.000Z'
    }
    
    }
    if (this.atd) {
      mustArray['atd']= {
        "$gt" : this.atd.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.atd.substring(0, 10) + 'T23:59:00.000Z'
    }
    }
    if (this.pc_number) {
      mustArray['pcNumber'] = {
        "$regex" : this.pc_number,
        "$options": "i"
    }
    }
    if (this.pc_date) {
      mustArray['pc_date']= {
        "$gt" : this.pc_date.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.pc_date.substring(0, 10) + 'T23:59:00.000Z'
    }
    }
    if (this.si_cuttof_date) {
      mustArray['siCutOffDate']= {
        "$gt" : this.si_cuttof_date.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.si_cuttof_date.substring(0, 10) + 'T23:59:00.000Z'
    }
    }
    if (this.status) {
      mustArray['status'] = this.status === 'true'? true : false
    }

    
    payload.query = mustArray

    this.commonService.getSTList('voyage',payload).subscribe((data) => {
      this.voyageListData = data.documents;
      
     
      if (data && data?.documents) {
        this.dataSource.data = data.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1+this.from,
          vesselName: s.vesselName,
          voyageNumber: s.voyageNumber,
          portName: s.portName,
          voyageStartDate: s.voyageStartDate,
          voyageEndDate: s.voyageEndDate,
          ata: s.ata,
          atd: s.atd,
          pcNumber: s.pcNumber,
          pc_date: s.pc_date,
          siCutOffDate: s.siCutOffDate,
          status: s.status,
          
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
    this.getVesselVoyageList()
  }

  getPaginationData(type: any) {
    this.fromSize = type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
 

    let payload = this.commonService.filterList()

   
    payload.size = Number(this.size),
    payload.from =  this.fromSize - 1,
    payload.sort = {  "desc" : ['updatedOn'] }

    let mustArray = {};
    this.voyageType = this.voyageType?.trim();
    this.vesselName = this.vesselName?.trim();
    this.vayageNo = this.vayageNo?.trim();
    this.port = this.port?.trim();
    this.terminal = this.terminal?.trim();
    this.eta = this.eta?.trim();
    this.ata = this.ata?.trim();
    this.atd = this.atd?.trim();
    this.pc_number = this.pc_number?.trim();
    this.pc_date = this.pc_date?.trim();
    this.si_cuttof_date = this.si_cuttof_date?.trim();
    this.status = this.status?.trim();
  
    // if(this.voyageType === 'import'){
    //   mustArray['isVoyageImport']  = true
    // }
    // if(this.voyageType === 'export'){
    //   mustArray["$and"] = [
    //     {
    //       "isVoyageImport": {
    //         "$ne": true
    //       }
    //     }
    //   ]
    // }

    if (this.vesselName) {
      mustArray['vesselName'] = {
        "$regex" : this.vesselName,
        "$options": "i"
    }
    }
    if (this.vayageNo) {
      mustArray['voyageNumber'] = {
        "$regex" : this.vayageNo,
        "$options": "i"
    }
    }
    if (this.port) {
      mustArray['portName'] = {
        "$regex" : this.port,
        "$options": "i"
    }
    }
    if (this.terminal) {
      mustArray['terminal_name'] = {
        "$regex" : this.terminal,
        "$options": "i"
    }
    }
    if (this.eta) {
      mustArray['voyageStartDate']= {
        "$gt" : this.eta.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.eta.substring(0, 10) + 'T23:59:00.000Z'
    }
  }

    if (this.etd) {
      mustArray['voyageEndDate']= {
        "$gt" : this.etd.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.etd.substring(0, 10) + 'T23:59:00.000Z'
    }
    
    }
    if (this.ata) {
      mustArray['ata']= {
        "$gt" : this.ata.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.ata.substring(0, 10) + 'T23:59:00.000Z'
    }
    
    }
    if (this.atd) {
      mustArray['atd']= {
        "$gt" : this.atd.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.atd.substring(0, 10) + 'T23:59:00.000Z'
    }
    }
    if (this.pc_number) {
      mustArray['pcNumber'] = {
        "$regex" : this.pc_number,
        "$options": "i"
    }
    }
    if (this.pc_date) {
      mustArray['pc_date']= {
        "$gt" : this.pc_date.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.pc_date.substring(0, 10) + 'T23:59:00.000Z'
    }
    }
    if (this.si_cuttof_date) {
      mustArray['siCutOffDate']= {
        "$gt" : this.si_cuttof_date.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.si_cuttof_date.substring(0, 10) + 'T23:59:00.000Z'
    }
    }
    if (this.status) {
      mustArray['status'] = this.status === 'true'? true : false
    }

    
    payload.query = mustArray

    this.commonService.getSTList('voyage',payload).subscribe(data => {
      this.voyageListData = data.documents;
      this.toalLength = data.totalCount;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count = type === 'prev' ? this.toalLength === this.count ? this.count -  ((this.toalLength % Number(this.size))>0?(this.toalLength % Number(this.size)):(Number(this.size))) : this.count - data.documents.length : this.count + data.documents.length
    })
  }

  search() {

    let mustArray = {};
    this.voyageType = this.voyageType?.trim();
    this.vesselName = this.vesselName?.trim();
    this.vayageNo = this.vayageNo?.trim();
    this.port = this.port?.trim();
    this.terminal = this.terminal?.trim();
    this.eta = this.eta?.trim();
    this.ata = this.ata?.trim();
    this.atd = this.atd?.trim();
    this.pc_number = this.pc_number?.trim();
    this.pc_date = this.pc_date?.trim();
    this.si_cuttof_date = this.si_cuttof_date?.trim();
    this.status = this.status?.trim();
  
    // if(this.voyageType === 'import'){
    //   mustArray['isVoyageImport']  = true
    // }
    // if(this.voyageType === 'export'){
    //   mustArray["$and"] = [
    //     {
    //       "isVoyageImport": {
    //         "$ne": true
    //       }
    //     }
    //   ]
    // }

    if (this.vesselName) {
      mustArray['vesselName'] = {
        "$regex" : this.vesselName,
        "$options": "i"
    }
    }
    if (this.vayageNo) {
      mustArray['voyageNumber'] = {
        "$regex" : this.vayageNo,
        "$options": "i"
    }
    }
    if (this.port) {
      mustArray['portName'] = {
        "$regex" : this.port,
        "$options": "i"
    }
    }
    if (this.terminal) {
      mustArray['terminal_name'] = {
        "$regex" : this.terminal,
        "$options": "i"
    }
    }
    if (this.eta) {
      mustArray['voyageStartDate']= {
        "$gt" : this.eta.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.eta.substring(0, 10) + 'T23:59:00.000Z'
    }
  }

    if (this.etd) {
      mustArray['voyageEndDate']= {
        "$gt" : this.etd.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.etd.substring(0, 10) + 'T23:59:00.000Z'
    }
    
    }
    if (this.ata) {
      mustArray['ata']= {
        "$gt" : this.ata.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.ata.substring(0, 10) + 'T23:59:00.000Z'
    }
    
    }
    if (this.atd) {
      mustArray['atd']= {
        "$gt" : this.atd.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.atd.substring(0, 10) + 'T23:59:00.000Z'
    }
    }
    if (this.pc_number) {
      mustArray['pcNumber'] = {
        "$regex" : this.pc_number,
        "$options": "i"
    }
    }
    if (this.pc_date) {
      mustArray['pc_date']= {
        "$gt" : this.pc_date.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.pc_date.substring(0, 10) + 'T23:59:00.000Z'
    }
    }
    if (this.si_cuttof_date) {
      mustArray['siCutOffDate']= {
        "$gt" : this.si_cuttof_date.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.si_cuttof_date.substring(0, 10) + 'T23:59:00.000Z'
    }
    }
    if (this.status) {
      mustArray['status'] = this.status === 'true'? true : false
    }

    let payload = this.commonService.filterList()
    payload.query = mustArray
    payload.size = Number(this.size),
    payload.from = 0,
    payload.sort = {  "desc" : ['updatedOn'] }
    
    this.commonService.getSTList('voyage',payload).subscribe((data) => {
      this.voyageListData = data.documents?.map((s: any,index) => {
        return{
          ...s,
          id:index+1
        }
      });
      this.toalLength = data.totalCount;
      this.count = data.documents.length
      this.fromSize =1
    })
  }

  changeStatus(data) {
    this.commonService.UpdateToST(`voyage/${data.voyageId}`,{ ...data, status: !data?.status }).subscribe((res: any) => {
      if (res) {
        this.notification.create(
          'success',
          'Status Updated Successfully',
          ''
        );
        this.getVesselVoyageList();
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
    this.vesselName = '';
    this.vayageNo = '';
    this.port = '';
    this.terminal = '';
    this.eta = '';
    this.etd = '';
    this.ata = '';
    this.atd = '';
    this.pc_number = '';
    this.pc_date = '';
    this.si_cuttof_date = '';
    this.status = '';
    this.getVesselVoyageList()
  }

  ngOnInit(): void {
// this.vvoye();
    // setTimeout(() => {
      this.getVesselVoyageList();
    // }, 500);
  }

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.voyageListData.map((row: any) => {
      storeEnquiryData.push({
        'Vessel Name': row.vesselName,
        'Port Voyage Number': row.voyageNumber,
        'Port': row.portName,
        'ETA': this.datepipe.transform(row.voyageStartDate, 'dd-MM-YYYY,hh:mm a'),
        'ETD': this.datepipe.transform(row.voyageEndDate, 'dd-MM-YYYY,hh:mm a'),
        'ATA': this.datepipe.transform(row.ata, 'dd-MM-YYYY,hh:mm a'),
        'ATD': this.datepipe.transform(row.atd, 'dd-MM-YYYY,hh:mm a'),
        'PC Number': row.pc_number,
        'PC Date': this.datepipe.transform(row.pc_date, 'dd-MM-YYYY,hh:mm a'),
        'SI CutOff Date': this.datepipe.transform(row.siCutOffDate, 'dd-MM-YYYY,hh:mm a'),
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

    const fileName = 'vessel-voyage.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  openPDF() {
    const prepare = [];
    this.voyageListData.forEach(e => {
      let tempObj = [];
      tempObj.push(e.vesselName);
      tempObj.push(e.voyageNumber);
      tempObj.push(e.portName);
      tempObj.push(this.datepipe.transform(e.voyageStartDate, 'dd-MM-YYYY,hh:mm'));
      tempObj.push(this.datepipe.transform(e.voyageEndDate, 'dd-MM-YYYY,hh:mm'));
      tempObj.push(this.datepipe.transform(e.ata, 'dd-MM-YYYY,hh:mm'));
      tempObj.push(this.datepipe.transform(e.atd, 'dd-MM-YYYY,hh:mm'));
      tempObj.push(e.pc_number);
      tempObj.push(this.datepipe.transform(e.pc_date, 'dd-MM-YYYY,hh:mm'));
      tempObj.push(this.datepipe.transform(e.siCutOffDate, 'dd-MM-YYYY,hh:mm'));
      tempObj.push(e.status ? "Active" : "Inactive");
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [497, 410]);
    autoTable(doc, {
      head: [['Vessel Name', 'Port Voyage Number', 'Port', 'ETA', 'ETD', 'ATA', 'ATD', 'PC Number', 'PC Date', 'SI Cutoff Date', 'Status']],
      body: prepare,
      didDrawCell: (data) => {
        // Draw border lines for each cell
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'S');
    }
    });
    doc.save('vessel-voyage' + '.pdf');
  }

}
