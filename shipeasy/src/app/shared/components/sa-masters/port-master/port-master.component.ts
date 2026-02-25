import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';

import { ApiService } from 'src/app/admin/principal/api.service';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
import { BaseBody } from '../../../../admin/smartagent/base-body';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { CommonService } from 'src/app/services/common/common.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { CountryData } from 'src/app/models/city-master';
import { Branch, MyInterface, PortDetails } from 'src/app/models/yard-cfs-master';
import { MastersSortPipe } from 'src/app/shared/util/mastersort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
import { ActivatedRoute, Router } from '@angular/router';
import { vessel } from '../data';
import { vesse } from '../dataa';

@Component({
  selector: 'app-port-master',
  templateUrl: './port-master.component.html',
  styleUrls: ['./port-master.component.scss'],
})
export class PortMasterComponent implements OnInit {
  _gc=GlobalConstants;
  PortData: PortDetails[] = [];
  terminals: any = [];
  terminalName: string;
  berths: any = [];
  berthName: any;
  locationForm: FormGroup;
  portIdToUpdate: any;
  closeResult: string;
  toalLength: any;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  submitted: any = false;
  portname: any;
  portType:any
  shortname: any;
  authority: any;
  type: any;
  country: any;
  location: string;
  terminalCode:any;
  address: any;
  portsize: any;
  terminal: any;
  berth: any;
  countryData:CountryData[] = [];
  portDataValue: PortDetails[] = [];
  baseBody: any;
  openedSubModelReference: NgbModalRef;
  isEdit: boolean = false;
  editItem: any;
  portCode: any;
  locationData = [];
  show: any;
  agentBranch:any
  portNameLabel = 'Port Name';
  portCodeLabel = 'Port Code';
  tenantId: any;
  email:any
  yardcfs:any =[]
  CarrierTypelist:any =[]
  tabs = vesse.masterTabs
  dataSource = new MatTableDataSource<any>();
  displayedColumns = ['#','action','portDetails.portName','portDetails.description','country.countryName','portDetails.agentBranchId'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort1!: MatSort;
  constructor(
    public modalService: NgbModal,
    private saMasterService: SaMasterService,
    private fb: FormBuilder,
    private profileService: ProfilesService,
    private _api: ApiService,
    private notification: NzNotificationService,
    private mastersService: MastersService,private cognito : CognitoService,
    private commonfunction: CommonFunctions,
    public commonService : CommonService,
    private sortPipelist: MastersSortPipe,
    public loaderService: LoaderService,
    private router: Router,
    private route: ActivatedRoute,
    
  ) {
    this.formBuild()
    this.route.params.subscribe(params =>this.urlParam = params
      );
      this.holdControl = this.urlParam.bid  || 'Ocean';
      if (!this.route.snapshot.params.id || this.route.snapshot.params.id == 1) {
        this.disbleTab = true;
      } else {
        this.disbleTab = false;
      }

  }
  disbleTab: boolean = true
  onTab(data) {
    this.router.navigate(['/master/' + '/PortMaster/' + data.key]);
    this.holdControl = data.key;
    this.route.params.subscribe(params =>
      this.urlParam = params
    );

  }
  holdControl: any;
  urlParam: any
formBuild(){
  this.locationForm = this.fb.group({
    portType:[''],
    portName: ['', [Validators.required]],
    description: ['',[Validators.required]],
    country: ['',[Validators.required]],
    CustEDICode: [],
    financeSECname: [''],
    agentBranch: [],
    isIcd: [true],
    isSez: [true],
    Sectorname: [''],
    Subsectorname: [''],
  });
}
  ngOnInit(): void {
      this.vvoye();
      this.getData();
      this.getSmartAgentList()
      this.getcountryList();
      this.getSystemTypeDropDowns();
      this.getLocation();
      this.getAll()
      

    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.tenantId = resp.tenantId
      }
    }) 
  }
  pageNumber = 1;
  pageSize = 10;
  from = 0;
  totalCount = 0;

  onPageChange(event){
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.from = event.pageIndex*event.pageSize ;
    this.vvoye();
  }

  onPortTypeChange(selectedPortTypeId: number) {
    const selectedPortType = this.CarrierTypelist.find(location => location.systemtypeId === selectedPortTypeId);
    if (selectedPortType?.typeName === 'Air') {
      this.portNameLabel = 'Airport Name';
      this.portCodeLabel = 'Airport Code';
    } else {
      this.portNameLabel = 'Port Name';
      this.portCodeLabel = 'Port Code';
    }
  }

  vvoye() {
    let payload = this.commonService?.filterList();
    if(payload?.size)payload.size= this.pageSize,
    payload.from=this.from
      if(payload?.sort)payload.sort = {
        "desc" : ["updatedOn"]
     }
     let mustArray = {};
     if(payload?.query)payload.query = mustArray
     this.commonService.getSTList("port", payload)?.subscribe((res: any) => {
      if (res && res.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1+this.from,
          portType:s.portType,
          portName: s.portName,
          description: s.description,
          countryName: s.countryName,
          agentBranch: s.agentBranch,
        }));
        // this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1; 
        this.toalLength = res.totalCount;
        this.count = res.documents.length;
      } else {
      }
    }, (error: any) => { 
    });
  }

  exportAsExcelFile1(): void {
    let storeEnquiryData = [];
    this.email.map((row: any) => {
      storeEnquiryData.push({
        'portType' :row?.element?.portType,
        'portname' : row?.element?.portname,
        'portCode' : row?.element?.portCode,
        'country' : row?.element?.country,
        'agentBranch' : row?.element?.agentBranch 
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
    filterValue = filterValue.trim();
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
 
    let payload = this.commonService?.filterList()
    payload.size = Number(10000),
      payload.from = this.page - 1,
      payload.query = this.filterKeys
    payload.sort = {
      "desc": ["updatedOn"]
    }
    this.commonService.getSTList("port", payload).subscribe((data) => {
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
    this.getData()
  }

  sortList(array , key){
    return this.sortPipelist.transform(array, key);
   }
  deleteclause(id: any) {
    alert('Item deleted!');
  }
  get f() {
    return this.locationForm.controls;
  }
  getcountryList() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
    }
    
    this.commonService.getSTList('country',payload)?.subscribe((res: any) => {

      this.countryData = res.documents;
    });
  }
  agentList:MyInterface [] = []
  agentBranchList:Branch [] = []

  getSmartAgentList() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true,
    }
    
    this.commonService.getSTList('agent',payload)?.subscribe((data:any) => {
      let agentId = data.documents[0]?.agentId
      this.agentList = data.documents;
      this.getBranchList(agentId)
    });
  }

  getBranchList(id) {
    let payload = this.commonService.filterList()
    payload.query = {
      orgId: id,
    }
    
    this.commonService.getSTList('branch',payload)
      .subscribe((data:any) => {
        this.agentBranchList = data.documents;
      });
  }
  


  getData() {
    this.loaderService.showcircle();
    this.page = 1;
    let payload = this.commonService.filterList()
      if(payload?.size)payload.size = Number(this.size),
      payload.from = this.page - 1,
      payload.sort = {
        "desc" : ["updatedOn"]
     }
     let mustArray = {};
     this.portType =this.portType?.trim();
     this.portname = this.portname?.trim();
     this.portCode = this.portCode?.trim();
     this.country = this.country?.trim();
     this.agentBranch = this.agentBranch?.trim();
     this.address = this.address?.trim();
     this.portsize = this.portsize?.trim();
     this.terminal = this.terminal?.trim();
     this.berth = this.berth?.trim();
     if (this.portType) {
      mustArray['portDetails.portType'] = {
        "$regex" : this.portType,
        "$options": "i"
    }
  }
     if (this.portname) {
      mustArray['portDetails.portName'] = {
        "$regex" : this.portname,
        "$options": "i"
    }
  }
  if (this.portCode) {
    mustArray['portDetails.description'] = {
      "$regex" : this.portCode,
      "$options": "i"
  }
}
 if (this.country) {
   mustArray['country.countryName'] = {
     "$regex" : this.country,
     "$options": "i"
 }
}
if (this.agentBranch) {
 mustArray['portDetails.agentBranchId'] = {
   "$regex" : this.agentBranch,
   "$options": "i"
}
}

if (this.address) {
 mustArray['portDetails.address'] = {
   "$regex" : this.address,
   "$options": "i"
}
}
if (this.portsize) {
 mustArray['portDetails.portSize'] = {
   "$regex" : this.portsize,
   "$options": "i"
}
}
if (this.terminal) {
 mustArray['terminal.name'] = {
   "$regex" : this.terminal,
   "$options": "i"
}
}
if (this.berth) {
 mustArray['terminal.berths'] = {
   "$regex" : this.berth,
   "$options": "i"
}
}
if(payload?.query)payload.query = mustArray
      this.commonService.getSTList("port", payload)?.subscribe((res: any) => {
      this.PortData = res.documents?.map(port=>{ return {
        ...port,
        portType:port?.portDetails?.portType,
        portName:port?.portDetails?.portName,
        description:port?.portDetails?.description, 
        countryName:port?.country?.countryName,
        agentBranch:port?.portDetails?.agentBranch, 
      }});
      this.toalLength = res.totalCount;
      this.count = res.documents.length;
      this.loaderService.hidecircle();
      
      
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
    this.vvoye();
    this.search()
  }

  getPaginationData(type: any) {
    this.fromSize =
      type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
      let payload = this.commonService.filterList()
      payload.size = Number(this.size),
      payload.from = this.fromSize - 1,
      payload.sort = {
        "desc" : ["updatedOn"]
     }
     let mustArray = {};
     this.portType = this.portType?.trim();
      this.portname = this.portname?.trim();
      this.portCode = this.portCode?.trim();
      this.country = this.country?.trim();
      this.agentBranch = this.agentBranch?.trim();
      this.address = this.address?.trim();
      this.portsize = this.portsize?.trim();
      this.terminal = this.terminal?.trim();
      this.berth = this.berth?.trim();
      if (this.portType) {
        mustArray['portDetails.portType'] = {
          "$regex" : this.portType,
          "$options": "i"
      }
    }
      if (this.portname) {
        mustArray['portDetails.portName'] = {
          "$regex" : this.portname,
          "$options": "i"
      }
    }
    if (this.portCode) {
      mustArray['portDetails.description'] = {
        "$regex" : this.portCode,
        "$options": "i"
    }
  }
  if (this.country) {
    mustArray['country.countryName'] = {
      "$regex" : this.country,
      "$options": "i"
  }
}
if (this.agentBranch) {
  mustArray['portDetails.agentBranchId'] = {
    "$regex" : this.agentBranch,
    "$options": "i"
}
}

if (this.address) {
  mustArray['portDetails.address'] = {
    "$regex" : this.address,
    "$options": "i"
}
}
if (this.portsize) {
  mustArray['portDetails.portSize'] = {
    "$regex" : this.portsize,
    "$options": "i"
}
}
if (this.terminal) {
  mustArray['terminal.name'] = {
    "$regex" : this.terminal,
    "$options": "i"
}
}
if (this.berth) {
  mustArray['terminal.berths'] = {
    "$regex" : this.berth,
    "$options": "i"
}
}
payload.query = mustArray
      this.commonService.getSTList("port", payload).subscribe((data) => {
      this.PortData = data.documents;
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
      this.portType =this.portType?.trim();
      this.portname = this.portname?.trim();
      this.portCode = this.portCode?.trim();
      this.country = this.country?.trim();
      this.agentBranch = this.agentBranch?.trim();
      this.address = this.address?.trim();
      this.portsize = this.portsize?.trim();
      this.terminal = this.terminal?.trim();
      this.berth = this.berth?.trim();
      if (this.portType) {
        mustArray['portDetails.portType'] = {
          "$regex" : this.portType,
          "$options": "i"
      }
    }
      if (this.portname) {
        mustArray['portDetails.portName'] = {
          "$regex" : this.portname,
          "$options": "i"
      }
    }
    if (this.portCode) {
      mustArray['portDetails.description'] = {
        "$regex" : this.portCode,
        "$options": "i"
    }
  }
  if (this.country) {
    mustArray['country.countryName'] = {
      "$regex" : this.country,
      "$options": "i"
  }
}
if (this.agentBranch) {
  mustArray['portDetails.agentBranchId'] = {
    "$regex" : this.agentBranch,
    "$options": "i"
}
}

if (this.address) {
  mustArray['portDetails.address'] = {
    "$regex" : this.address,
    "$options": "i"
}
}
if (this.portsize) {
  mustArray['portDetails.portSize'] = {
    "$regex" : this.portsize,
    "$options": "i"
}
}
if (this.terminal) {
  mustArray['terminal.name'] = {
    "$regex" : this.terminal,
    "$options": "i"
}
}
if (this.berth) {
  mustArray['terminal.berths'] = {
    "$regex" : this.berth,
    "$options": "i"
}
}
 

let payload = this.commonService.filterList()
payload.query = mustArray
// payload.size = Number(this.size),
// payload.from = this.page - 1,
payload.sort = {
  "desc" : ["updatedOn"]
}
this.commonService.getSTList("port", payload).subscribe((data) => {
      this.PortData = data.documents;
      this.toalLength = data.totalCount;
      this.count = data.documents.length;
      if (data && data?.documents) {
        this.dataSource.data = data.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1,
          portType:s.portType,
          portName: s.portName,
          description: s.description,
          countryName: s.countryName,
          agentBranch: s.agentBranch,
          
        }));
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1; 
      }
    });
  }
  getPortMaster() {
    let payload = this.commonService.filterList()
    payload.query = {
      "status": true 
    }
    
    this.commonService.getSTList('port',payload).subscribe((res: any) => {
      this.portDataValue = res?.documents;

    });
  }
  financeSectorData:any=[]
  getSystemTypeDropDowns() {
    
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      typeCategory:   {
        "$in": ['portType','financeSector',]
      },
      "status": true
    }
    this.commonService
      .getSTList('systemtype',payload)?.subscribe((res: any) => {

      this.portDataValue = res?.documents?.filter(x => x.typeCategory === "portType");
      this.financeSectorData = res?.documents?.filter(x => x.typeCategory === "financeSector");
      

    });
  }

  clear() {
    this.portType = '';
    this.portname = '';
    this.shortname = '';
    this.authority = '';
    this.type = '';
    this.country = '';
    this.address = '';
    this.portsize = '';
    this.terminal = '';
    this.berth = '';
    this.location='';
    this.terminalCode='';
    this.getData();
  }
  isViewMode: boolean = false;
  open(content, port?: any, show='edit') {
    this.isViewMode = show === 'show';
    this.show=show;
    if (port) {
      this.portIdToUpdate = port?.portId;
      this.locationForm.patchValue({
        EDICode: port?.portDetails?.EDICode,
        isIcd: port?.portDetails?.isIcd,
        isSez: port?.portDetails?.isSez,
        financeSECname: port?.portDetails?.financeSECname,
        portCode: port?.portDetails?.portCode,
        portType: port?.portDetails?.portType,
        portName: port?.portDetails?.portName,
        description: port?.portDetails?.description,
        terminalId: port?.portDetails?.terminalId,
        CustEDICode: port?.portDetails?.CustEDICode,
        clauses: port?.portDetails?.clauses,
        terminalCode: port?.portDetails?.terminalCode,
        MumcustEDICode: port?.portDetails?.MumcustEDICode,
        Sectorname: port?.portDetails?.Sectorname,
        Subsectorname: port?.portDetails?.Subsectorname,
        Companyname: port?.portDetails?.Companyname,
        terminals: port?.portDetails?.terminals,
        country: port?.country?.countryId,
        agentBranch :  port?.portDetails?.agentBranchId,
      });
      show === 'show'?
        this.locationForm.disable():
        this.locationForm.enable();
    }

    this.terminals = port?.terminals ? port?.terminals : [];
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
    let berthsData = [];
    if (this.terminals) {
      this.terminals.map(terminalItem => {
        if (terminalItem?.berths?.length > 0) {
          terminalItem.berths.map(berthItem => {
            berthsData.push({ name: berthItem.name, terminalName: terminalItem.name,code:berthItem.code,eidCode:berthItem.eidCode })
          })
        }
      })
    }
    this.berths = berthsData;

  }
  openTerminalModel(content, terminal?: any) {
    this.isEdit = false;
    if (terminal) {
      this.terminalName = terminal.name;
      this.terminalcode=terminal.code;
      this.terminalEIDCode=terminal.eidCode
      this.isEdit = true;
      this.editItem = terminal;
    }
    this.openedSubModelReference = this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'md',
    })
  }
  terminalcode:any
  terminalEIDCode:any
  addTerminal() {
    if (this.terminalName !== '' && this.terminalName !== undefined) {
      if (this.isEdit) {
        let index = this.terminals.indexOf(this.editItem)
        if (index > -1) {
          this.terminals[index] = { ...this.editItem, name: this.terminalName,code: this.terminalcode, eidCode:this.terminalEIDCode };
        }
      } else {
        this.terminals.push({ name: this.terminalName,code: this.terminalcode, eidCode:this.terminalEIDCode, berths: [] });
      }
      this.openedSubModelReference.close()
    }
    this.terminalName = '';
  }
  removeTerminal(deleteTerminal, terminal) {
    this.modalService
      .open(deleteTerminal, {
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
            this.terminals = this.terminals.filter(item => item !== terminal)
          }
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }

  openBerthModal(content, berth?: any) {
    this.isEdit = false;
    if (berth) {
      this.terminalName = berth.terminalName;
      this.berthName = berth.name;
      this.berthCode = berth.code
      this.berthEIDCode = berth.eidCode
      this.isEdit = true;
      this.editItem = berth;
    }
    this.openedSubModelReference = this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'md',
    })
  }
  berthCode:any
  berthEIDCode:any
  addBerth() {
    if (this.berthName !== '' && this.berthName !== undefined && this.terminalName !== '' && this.terminalName !== undefined) {
      if (this.isEdit) {
        let index = this.berths.indexOf(this.editItem)
        if (index > -1) {
          this.berths[index] = { name: this.berthName, terminalName: this.terminalName, code: this.berthCode,eidCode:this.berthEIDCode };
        }
      } else {
        this.berths.push({ name: this.berthName, terminalName: this.terminalName, code: this.berthCode,eidCode:this.berthEIDCode });
      }
      this.openedSubModelReference.close()
    }
    this.terminalName = '';
    this.berthName = '';
  }
  removeBerth(deleteBerth, berth) {

    this.modalService
      .open(deleteBerth, {
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
            this.berths = this.berths.filter(item => item !== berth)
          }
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }
  reset(){
    this.submitted = false;
    this.formBuild()
  }
  onSave() {
    this.portIdToUpdate = null;
    this.formBuild()
    this.submitted = false;
    this.modalService.dismissAll();
    return null;
  }

  locationsMasters() {
    this.submitted = true;
    if (this.locationForm.invalid) {
      return;
    }
    let countrylist = this.countryData.filter(x => x.countryId === this.locationForm.get('country').value);
    let terminalData = [];
    this.terminals.map(terminal => {
      let berthdata = [];
      this.berths.map(berth => {
        if (berth.terminalName === terminal.name) {
          berthdata.push({name:berth.name,code:berth.code,eidCode:berth.eidCode},);
        }
      })
      terminalData.push({ ...terminal, berths: berthdata })
    });

    let body = {
      "tenantId": this.tenantId,
      "isPort": true,
      "country": {
        "countryId": countrylist[0]?.countryId,
        "countryName": countrylist[0]?.countryName,
      },
    
      "portDetails": {
        "isIcd": this.locationForm.value.isIcd,
        "isSez": this.locationForm.value.isSez,
        "EDICode": this.locationForm.value.EDICode,
        "financeSECname": this.locationForm.value.financeSECname,
        "portCode": this.locationForm.value.portCode,
        "portName": this.locationForm.value.portName,
        "portType": this.locationForm.value.portType,
        "description": this.locationForm.value.description,
        "terminalId": this.locationForm.value.terminalId,
        "CustEDICode": this.locationForm.value.CustEDICode,
        "clauses": this.locationForm.value.clauses,
        "terminalCode": this.locationForm.value.terminalCode,
        "MumcustEDICode": this.locationForm.value.MumcustEDICode,
        "Sectorname": this.locationForm.value.Sectorname,
        "Subsectorname": this.locationForm.value.Subsectorname,
        "Companyname": this.locationForm.value.Companyname,
        "company":"SHIPEASY TANK CONTAINERS",
        "canalDirection": "test",
        "agentBranchId" : this.locationForm.get('agentBranch').value,
        "agentBranch" : this.agentBranchList.filter((x)=> x?.branchId === this.locationForm.get('agentBranch').value)[0]?.branchName,       
        "portTypeName": this.CarrierTypelist.find(systemtype => systemtype?.systemtypeId === this.locationForm?.value?.portType)?.typeName,
      },
      "terminals": terminalData,
      "status": true,
    }
    if (!this.portIdToUpdate) {
      this.commonService.addToST('port',body).subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Added Successfully', '');
            this.onSave();
            setTimeout(() => {
            this.search();
            }, 1000);
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
    } else {
      const dataWithUpdateID = { ...body, portId: this.portIdToUpdate };
      const data = [dataWithUpdateID];
      this.commonService.UpdateToST(`port/${dataWithUpdateID.portId}`,dataWithUpdateID).subscribe(
        (result: any) => {
          if (result) {
            this.notification.create('success', 'Updated Successfully', '');
            this.onSave();
            setTimeout(() => {
              this.search();
              }, 1000);
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error',error?.error?.error?.message, '');
        }
      );
    }
  }
  changeStatus(data) {
    this.commonService.UpdateToST(`port/${data.portId}`,{ ...data, status: !data?.status }).subscribe((res: any) => {
      if (res) {
        this.notification.create(
          'success',
          'Status Updated Successfully',
          ''
        );
        this.onSave();
        this.getData();
      }
    }, error => {
      this.onSave();
      this.notification.create(
        'error',
       error?.error?.error?.message,
        ''
      );
    });
  }

  delete(deleteport, id) {
    this.modalService
      .open(deleteport, {
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
            let data = 'portId' + id.portId
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
  showTerminal(data) {
    let terminal = '';
    if (data.terminal) {
      data.terminal.forEach(element => {
        if (element.name) {
          terminal = terminal + element.name + ","
        }
      });
      return terminal
    }
  }
  showBerth(data) {
    let berth = '';
    if (data.terminal) {
      data.terminal.forEach(element => {
        if (element.berths) {
          element.berths.forEach(element => {
            if (element) {
              berth = berth + element + ","
            }
          });
        }

      });
      return berth
    }
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

  getLocation() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true,
      masterType:   {
        "$in": ['YARD','CFS','ICD']
      },
    }
    this.commonService
      .getSTList('location',payload)?.subscribe((data) => {
      this.locationData = data.documents;
    });
  }

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.PortData.map((row: any) => {
      storeEnquiryData.push({
        'Port Type' :row.portDetails?.portType,
        'Port Name': row.portDetails?.portName,
        'Port Code': row.portDetails?.description,
        'Country': row.country?.countryName,
        'Terminal Code': row.portDetails?.agentBranch,
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

    const fileName = 'port-master.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  openPDF() {
    const prepare=[];
    this.PortData.forEach(e=>{
      let tempObj =[];
      tempObj.push(e.portDetails?.portName);
      tempObj.push(e.portDetails?.description);
      tempObj.push(e.country?.countryName);
      tempObj.push(e.portDetails?.agentBranch);
      tempObj.push(e.status ? 'Active' : 'Inactive')
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [297, 210]);
    autoTable(doc,{
        head: [['Port Name','Port Code','Country','Agent Branch',' Status']],
        body: prepare,
        didDrawCell: (data) => {
          // Draw border lines for each cell
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'S');
      }
    });
    doc.save('port-master' + '.pdf');
  }
  getAll() {
    this.loaderService.showcircle();

    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      "typeCategory":"carrierType",
      "status": true,
      "typeName": {
        "$in": [
          "Air", "Ocean"
        ]
      }

    }
    if (payload?.size) payload.size = 1000,
      payload.from = 0,
      payload.sort = { "desc": ['updatedOn'] }

    this.commonService.getSTList('systemtype', payload)?.subscribe((data) => {
      this.CarrierTypelist = data?.documents?.filter(x => x.typeCategory === "carrierType");

  });
  }

}
