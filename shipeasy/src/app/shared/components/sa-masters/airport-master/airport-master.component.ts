import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ModalDismissReasons, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import jsPDF from 'jspdf';
import * as XLSX from "xlsx";
import autoTable from 'jspdf-autotable';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CountryData } from 'src/app/models/city-master';
import { uom } from 'src/app/models/uom';
import { Vessel } from 'src/app/models/vessel-master';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
import { LoaderService } from 'src/app/services/loader.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { CommonService } from 'src/app/services/common/common.service';
import { MastersSortPipe } from 'src/app/shared/util/mastersort';
import { environment } from 'src/environments/environment';
import { PortDetails } from '../../port/port';

@Component({
  selector: 'app-airport-master',
  templateUrl: './airport-master.component.html',
  styleUrls: ['./airport-master.component.scss']
})
export class AirportMasterComponent implements OnInit {
  _gc=GlobalConstants;
  modalReference: NgbModalRef;
  addVesselForm: FormGroup;
  vesseldata: Vessel[]  = [];
  vesselIdToUpdate: string;
  closeResult: string;
  submitted: any = false;
  toalLength: any;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  minDate = environment.validate.minDate;
  vesselCode: any;

  railCarrier:any;
  airPortcode:any;
  airPortname:any;
  country:any;
  wagonNumber:any;
  Dimensions:any;
  Capacity:any;
  Cargo:any;
  TRAMP_VESSEL_ID: any;
  IN_ACTIVE_FLAG: any;
  countryList:CountryData [] = [];
  shippinglineData:any;
  uomcategoryList: uom[]  = [];
  vesselTypeList: any = [];
  certificateData: any = [];
  certificateName: any;
  certificateValidFrom: any;
  certificateValidTo: any;
  certificateDoc: any;
  systemData: any;
  vesselCategories: any = [];
  vesselSubTypeList: any = [];
  vesselSubtypes: any = [];
  documentName: any;
  tenantId: any;
  yardcfs:any;
  activeButton: number = 1;
  email:any
  isEditing: boolean = false;
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort1!: MatSort;
  displayedColumns =[
    '#', 
    'action',
    'airPortname',
    'airPortcode',
    'status'
  ];
  constructor(
    public modalService: NgbModal,
    private masterservice: MastersService,
    private cognito : CognitoService,
    private notification: NzNotificationService,private commonfunction: CommonFunctions,
    private saMasterService: SaMasterService,
    public commonService: CommonService,
    public datepipe: DatePipe,
    private sortPipelist: MastersSortPipe,
    public loaderService: LoaderService,
    private fb: FormBuilder,
  ) { 
    
  }
  formBuild() {
    this.addVesselForm = this.fb.group({
        airPortname: ['',[Validators.required]],
        airPortcode: ['',[Validators.required]],
        country: ['',[Validators.required]],  
        // description: ['',[Validators.required]],
        CustEDICode: [],
        financeSECname: [''],
        agentBranch: [],
        isIcd: [false],
        isSez: [false],
        Sectorname: [''],
        Subsectorname: [''],
        status: [true],
    });

  }
  ngOnInit(): void {
    this.getData();
    this.formBuild();
    this.getcountryList();
    this.getSystemTypeDropDowns();
    this.getPortMaster()
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.tenantId = resp.tenantId
      }
    }) 
  }
  exportAsExcelFile() {
    const dataToExport = this.dataSource.data.map((item: any) => {
      return {
        "AirPort Name": item.airPortname || '',
        "AirPort Code": item.airPortcode || '',
        "Status": item.status ? 'Active' : 'Inactive',
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, 'AirPortMaster.xlsx');
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
    this.commonService?.getSTList('airportmaster', payload)?.subscribe((data) => {
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
  countryData:CountryData[] = [];
  getcountryList() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
    }
    
    this.commonService.getSTList('country',payload)?.subscribe((res: any) => {

      this.countryData = res.documents;
    });
  }
  clearFilters() {
    this.filtersModel = [];
    this.filterKeys = {};
    this.getData()
  }


  sortList(array , key){
    return this.sortPipelist.transform(array, key);
   }

  get f() {
    return this.addVesselForm.controls;
  }
  pageNumber = 1;
  pageSize = 10;
  from = 0;
  totalCount = 0;

  onPageChange(event){
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.from = event.pageIndex*event.pageSize ;
    this. getData();
  }
  agentBranch:any
  address:any
  portsize:any
  terminal:any
  berth:any
  getData() {
    this.loaderService.showcircle();
    let payload = this.commonService.filterList()
    if(payload)payload.size= this.pageSize,
    payload.from=this.from
    if(payload)payload.query = { }
    if(payload)payload.sort = {
      "desc" : ["updatedOn"]
   }
   let mustArray = {};
    this.IN_ACTIVE_FLAG = this.IN_ACTIVE_FLAG?.trim();
    this.airPortname = this.airPortname?.trim();
    this.country =  this.country?.trim();
    this.airPortcode = this.airPortcode?.trim();
    this.agentBranch = this.agentBranch?.trim();
    this.address = this.address?.trim();
    this.portsize = this.portsize?.trim();
    this.terminal = this.terminal?.trim();
    this.berth = this.berth?.trim();
    this.IN_ACTIVE_FLAG = this.IN_ACTIVE_FLAG?.trim();

    if(this.airPortname){
      mustArray['chartName']={
        "$regex" : this.airPortname,
        "$options":"i"     
    }
    }
    if (this.country) {
      mustArray['country'] = {
        "$regex" : this.country,
        "$options": "i"
    }
    }
    if (this.airPortcode) {
      mustArray['airPortcode'] = {
        "$regex" : this.airPortcode,
        "$options": "i"
    }
    }
    if (this.agentBranch) {
      mustArray['portDetails.agentBranch'] = {
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
    if (this.IN_ACTIVE_FLAG) {
      mustArray['status'] = this.IN_ACTIVE_FLAG === 'true' ? true : false
    }

    if(payload)payload.query = mustArray
    this.commonService.getSTList('airportmaster', payload)?.subscribe((res: any) => {
      this.vesseldata = res.documents;

      if (res && res?.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1,
          airPortcode:s.airPortcode,
          airPortname:s.airPortname,
          country:s.country,
          status:s.status,
          address:s.address,
          agentBranch:s.agentBranch,
          portsize:s.portsize,
          terminal:s.terminal,
          berth:s.berth
        }));
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
    payload.query = { }
    payload.sort = {
      "desc" : ["updatedOn"]
   }
   let mustArray = {};
    this.airPortcode = this.airPortcode?.trim();
    this.airPortname = this.airPortname?.trim();
    this.country = this.country?.trim();
    this.IN_ACTIVE_FLAG = this.IN_ACTIVE_FLAG?.trim();
    this.agentBranch = this.agentBranch?.trim();
    this.address = this.address?.trim();
    this.portsize = this.portsize?.trim();
    this.terminal = this.terminal?.trim();
    this.berth = this.berth?.trim();
    if(this.airPortname){
      mustArray['chartName']={
        "$regex" : this.airPortname,
        "$options":"i"     
    }
    }
    if (this.country) {
      mustArray['country'] = {
        "$regex" : this.country,
        "$options": "i"
    }
    }
    if (this.airPortcode) {
      mustArray['airPortcode'] = {
        "$regex" : this.airPortcode,
        "$options": "i"
    }
    }
    if (this.IN_ACTIVE_FLAG) {
      mustArray['status'] = this.IN_ACTIVE_FLAG === 'true' ? true : false
    }
    payload.query = mustArray
   payload.size = Number(this.size)
   payload.from = this.fromSize -1,
    this.commonService.getSTList('airportmaster', payload).subscribe((data) => {
      this.vesseldata = data.documents;
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
    this.airPortcode = this.airPortcode?.trim();
    this.airPortname = this.airPortname?.trim();
    this.country = this.country?.trim();
    this.IN_ACTIVE_FLAG = this.IN_ACTIVE_FLAG?.trim();

    if(this.airPortname){
      mustArray['chartName']={
        "$regex" : this.airPortname,
        "$options":"i"     
    }
    }
    if (this.country) {
      mustArray['country'] = {
        "$regex" : this.country,
        "$options": "i"
    }
    }
    if (this.airPortcode) {
      mustArray['airPortcode'] = {
        "$regex" : this.airPortcode,
        "$options": "i"
    }
    }
    if (this.agentBranch) {
      mustArray['portDetails.agentBranch'] = {
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
    if (this.IN_ACTIVE_FLAG) {
      mustArray['status'] = this.IN_ACTIVE_FLAG === 'true' ? true : false
    }

    let payload = this.commonService.filterList()
    payload.query = mustArray
    payload.sort = {
      "desc" : ["updatedOn"]
   }
   payload.size = Number(this.size)
   payload.from = this.fromSize -1,
    this.commonService.getSTList('airportmaster', payload).subscribe((data) => {
      this.vesseldata = data.documents?.map((s: any,index) => {
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
    this.airPortcode = ""
    this.airPortcode = ""
    this.country = ""
    this.getData();
  }
  isEdit: boolean = false;
  terminalName: string;
  terminalcode:any
  terminalEIDCode:any
  editItem: any;
  openedSubModelReference: NgbModalRef;
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
  terminals: any = [];
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
  berthName:any;
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
  isViewMode: boolean = false;
  open(content, vessel?: any, show?: string) {
    this.isViewMode = show === 'show';
    if (vessel) {
      this.vesselIdToUpdate = vessel.airportmasterId;
      this.addVesselForm.patchValue({
        airPortcode:vessel.airPortcode,
        airPortname: vessel.airPortname,
        country:vessel.country,
        status: vessel.status,
        address:vessel.address,
        agentBranch:vessel.agentBranch,
        portsize:vessel.portsize,
        terminal:vessel.terminal,
        berth:vessel.berth,
        CustEDICode: vessel.CustEDICode,
        financeSECname: vessel.financeSECname,
        // agentBranch: vessel.agentBranch,
        isIcd: vessel.isIcd,
        isSez: vessel.isSez,
        Sectorname: vessel.Sectorname,
        Subsectorname: vessel.Subsectorname,
      });
      if (vessel.certificates) {
        this.certificateData = vessel.certificates;
      }
      show === 'show' ? this.addVesselForm.disable() : this.addVesselForm.enable()
    }
    this.modalReference = this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'xl',
    });
  }
  refreshData() {
    var myInterval = setInterval(() => {
      this.getData();
      clearInterval(myInterval);
    }, 1000);
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
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
  portDataValue: PortDetails[] = [];
  getPortMaster() {
    let payload = this.commonService.filterList()
    if(payload)payload.query = {
      "status": true 
    }
    
    this.commonService.getSTList('port',payload)?.subscribe((res: any) => {
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
  berths: any = [];
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
  vesselMasters() {
    this.submitted = true;

    if (this.addVesselForm.invalid) {
      this.notification.create('error', 'Please fill required fields', '');
      return;
    }
    let berthdata = [];
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
  
    let newdata = this.addVesselForm.value;
    
    newdata.tenantId = this.tenantId;
    if (!this.vesselIdToUpdate) {
      this.commonService.addToST('airportmaster', newdata).subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Added Successfully', '');
            this.onSave();
            this.refreshData();
          }
        },
        (error) => {
          this.notification.create('error', error?.error || 'An error occurred', '');
        }
      );
    } else {
      newdata.airportmasterId = this.vesselIdToUpdate;
      this.commonService.UpdateToST(`airportmaster/${newdata.airportmasterId}`, newdata).subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Updated Successfully', '');
            this.onSave();
            this.refreshData();
          }
        },
        (error) => {
          this.notification.create('error', error?.error || 'An error occurred', '');
        }
      );
    }
  }


  changeStatus(data, i) {    
    this.commonService.UpdateToST(`airportmaster/${data.airportmasterId}`,{ ...data, status: !data?.status })
      .subscribe(
        (res: any) => {
          if (res) {
            this.vesseldata[i].status = !data?.status;
            this.notification.create(
              'success',
              'Status Updated Successfully',
              ''
            );
            this.onSave();
            var myInterval = setInterval(() => {
              this.getData();
              clearInterval(myInterval);
            }, 1000);
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
  }

  onSave() {
    this.submitted = false;
    this.vesselIdToUpdate = null;
    this.formBuild();
    this.submitted = false;
    this.modalService.dismissAll();
    this.certificateData = [];
    return null;
  }

  openPDF() {
    const prepare = [];
    this.vesseldata.forEach(e => {
      let tempObj = [];
      tempObj.push(e.vesselCode);
      tempObj.push(e.vesselName);
      tempObj.push(e.countryName);
      tempObj.push(e.callSign);
      tempObj.push(e.imoNo);
      tempObj.push(e.mmsino);
      tempObj.push(e.createdBy);
      tempObj.push(this.datepipe.transform(e.createdOn, 'dd-MM-YYYY,hh:mm'));
      tempObj.push(e.createdBy);
      tempObj.push(e.updatedDate);
      tempObj.push(e.status ? 'Active' : 'Inactive');
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [397, 310]);
    autoTable(doc, {
      head: [['Vessel Code', 'Vessel Name', 'Vessel Nationality Name', 'Call Sign', 'IMO No.', 'Created By', 'Created Date', 'Modify By', 'Modify Date']],
      body: prepare,
      didDrawCell: (data) => {
        // Draw border lines for each cell
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'S');
    }
    });
    doc.save('vessel-master' + '.pdf');
  }
}
