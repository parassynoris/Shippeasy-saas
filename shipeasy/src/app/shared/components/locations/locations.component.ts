import { MastersService } from './../../../services/Masters/masters.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalDismissReasons, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { BaseBody } from 'src/app/admin/smartagent/base-body';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from 'src/app/services/common/common.service';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { OrderByPipe } from '../../util/sort';
import { CommonFunctions } from '../../functions/common.function';
import { CognitoService } from 'src/app/services/cognito.service';

import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { CountryData } from 'src/app/models/city-master';
import { State } from 'src/app/models/state-master';
import { Port } from 'src/app/models/tariff-list';
import { SystemType } from 'src/app/models/system-type';
import { MastersSortPipe } from '../../util/mastersort';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
interface terminalList{
  item_id: string,
  item_text:string,
}
@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss'],
})
export class LocationsComponent implements OnInit {
  _gc=GlobalConstants;
  locationForm: FormGroup;
  locationIdToUpdate: object;
  locationData = [];
  closeResult: string;
  toalLength: number;
  size = 10000;
  page = 1;
  count = 0;
  submitted: boolean = false;
  fromSize: number = 1;
  name: string;
  type: string;
  country: string;
  state: string;
  countryData: CountryData[] = [];
  stateList: State[] = [];
  baseBody: BaseBody;
  modalReference: NgbModalRef;
  portList: Port[] =[];
  callingCodeList: CountryData[];
  terminalList :terminalList[] = []
  show: string;
  agentBranchList: SystemType[] = [];
  parentId: string;
  tenantId: string;
  @ViewChild(MatDrawer) drawer: MatDrawer | any;
  dataSource = new MatTableDataSource();
  pagenation = [10,20, 50, 100];
  email:any
  emaill:any
  yardcfs:any
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns =[
    '#', 
    'action',
   'locationName',
   'country',
    'state',
  ];
  isMaster: boolean = false;
  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private modalService: NgbModal,
    private mastersService: MastersService,
    private profileService: ProfilesService,
    private notification: NzNotificationService,
    public commonService : CommonService,
    private sortPipelist: MastersSortPipe,
    public sortPipe : OrderByPipe,private cognito : CognitoService,
    private commonfunction: CommonFunctions,
    public loaderService: LoaderService,
  ) {
    this.isMaster = this.activatedRoute.snapshot?.params['id'] ? false : true
    this.formBuild()
    this.parentId =  this.activatedRoute.snapshot?.params['id']
  }

  ngOnInit(): void {
    this.getcountryList(); 
    this.getPortDropDowns()
    this.systemTypeMaster()
    setTimeout(() => {
      this.getLocation();
    }, 500);
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.tenantId = resp.tenantId
      }
    }) 
  }
  systemTypeMaster(){
    
    let payload = this.commonService.filterList()
    payload.query = {
      typeCategory: "agentBranch",
      "status": true,
    }
    
    this.commonService.getSTList('systemtype',payload) .subscribe((res: any) => {
      this.agentBranchList = res?.documents?.filter(x => x.typeCategory === "agentBranch");
    });
  }
  setValidation(){
    return false
    if(this.locationForm.get('ICD').value){
      this.locationForm.controls.agentBranch.setValidators([Validators.required])
      this.locationForm.get('agentBranch').updateValueAndValidity()
      this.locationForm.controls.name.setValidators([Validators.required])
      this.locationForm.get('name').updateValueAndValidity();
      this.locationForm.controls.code.setValidators([Validators.required])
      this.locationForm.get('code').updateValueAndValidity();

    }else{
      this.locationForm.get('agentBranch').clearValidators();
      this.locationForm.get('agentBranch').updateValueAndValidity();
      this.locationForm.get('name').clearValidators();
      this.locationForm.get('name').updateValueAndValidity();
      this.locationForm.get('code').clearValidators();
      this.locationForm.get('code').updateValueAndValidity();
    }
  }
  formBuild(){
    this.locationForm = this.fb.group({
      locationName: ['', [Validators.required]],
      portType: [''],
      country: ['', [Validators.required]],
      state: ['', [Validators.required]],
      masterType : [''],
      CFS : [false],
      ICD : [false],
      Yard : [false],
      agentBranch : [''],
      name : [''],
      code: [''],
      portName : [''],
      terminal : [''],
      EDICode : [''],
      address : [''],
      contactPerson : [''],
      email : [''],
      primaryCountryCode: [''],
      primaryNo: [''],
      bondNo :[''],
      creditDays : [''],
      lineReference:[true],
    });
  }
  sortList(array , key){
    return this.sortPipelist.transform(array, key);
   }

   vvoye() {
    let payload = this.commonService?.filterList();
    payload.query = {
      typeCategory: "agentBranch",
      "status": true,
    }
    this.commonService?.getSTList('location', payload)?.subscribe((res: any) => {
      if (res && res.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1,
          locationName: s.locationName,
          country: s.country,
          state: s.state
          ,
        }));
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1; 
      } else {
      }
    }, (error: any) => { 
    });
  }


  applyFilter1(filterValue: string) { 
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
    this.commonService?.getSTList('location', payload)?.subscribe((data) => {
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
    this.getLocation()
    this.vvoye()
  }

  getPortDropDowns() {
  
      let payload = this.commonService.filterList()
      payload.query = {
        "status": true,
      }
      
      payload.size = 15000
    payload.project = ["portDetails.portName", "portId"];
      this.commonService.getSTList('port',payload).subscribe((res: any) => {
      this.portList = res?.documents;

    });
  }

  getTerminal(id) {
    this.portList.map((port) => {
      if (port?.portId === id) {
        if (port?.terminal) {
          port.terminal.map((terminal) => {
            this.terminalList.push({
              item_id: terminal.name,
              item_text: terminal.name,
            });
          });
        }
      }
    });
  }

  getcountryList() {
    let payload = this.commonService.filterList()
      payload.query = {
        "status": true
      }
      
      this.commonService.getSTList('country',payload).subscribe((res: any) => {
      this.countryData = res.documents;
    });
  }
  getStateList() {
    this.stateList = [];


    let countryData = this.countryData.filter(x => x?.countryId === this.locationForm.get('country').value);

    this.callingCodeList = countryData;
    let payload = this.commonService.filterList()
    payload.query = {
      countryId: this.locationForm.get('country').value,
      "status": true
    }
    
    this.commonService.getSTList('state',payload).subscribe((data) => {
      this.stateList = data.documents;
    });
  }
  get f() {
    return this.locationForm.controls;
  }
  getLocation() {
    this.loaderService.showcircle();
    let payload = this.commonService.filterList()
   
   
    payload.query = {
      "$and": [
        {
          "ICD": {
            "$ne": true
          }
        },{
          "Yard": {
            "$ne": true
          }
        },{
          "CFS": {
            "$ne": true
          }
        },
      ]
    }
    if( !this.isMaster){
      payload.query['parentId'] = this.parentId
    } 
    payload.size =Number(this.size);
    payload.from = this.page - 1;
    payload.sort = {
      "desc" : ["updatedOn"]
    }, 
    this.commonService.getSTList('location',payload).subscribe((data) => {
      this.locationData = data.documents;
      this.toalLength = data.totalCount;
      this.count = data.documents.length;
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
      if (data && data?.documents) {
        this.dataSource.data = data.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1,
          name: s?.name,
          masterType: s?.masterType,
          code: s?.code,
          country: s?.country,
          state: s?.state,
          address: s?.address
          
        }));
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1; 
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
    this.getLocation();
  }
  sort(array , key){
    return this.sortPipe.transform(array, key);
   }
  getPaginationData(type: any) {
    this.fromSize =
      type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
   
    let payload = this.commonService.filterList()
    
    payload.size =Number(this.size);
    payload.from = this.fromSize - 1;
    payload.query = {
      "$and": [
        {
          "ICD": {
            "$ne": true
          }
        },{
          "Yard": {
            "$ne": true
          }
        },{
          "CFS": {
            "$ne": true
          }
        },
      ]
    }
    if( !this.isMaster){
      payload.query['parentId'] = this.parentId
    } 
    payload.sort = {
      "desc" : ["updatedOn"]
    }, 
    this.commonService.getSTList('location',payload) .subscribe((data) => {
      this.locationData = data.documents;
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
    this.name = this.name?.trim();
    this.type = this.type?.trim();
    this.country = this.country?.trim();
    this.state = this.state?.trim();
    if( !this.isMaster){
      mustArray['parentId'] = this.parentId
    } 
    mustArray['$and'] = [
      {
        "ICD": {
          "$ne": true
        }
      },{
        "Yard": {
          "$ne": true
        }
      },{
        "CFS": {
          "$ne": true
        }
      },
    ]
   
    if (this.name) {
      mustArray['locationName'] = {
        "$regex" : this.name,
        "$options": "i"
    }
  }
   
    if (this.type) {
      mustArray['portType'] = {
        "$regex" : this.type,
        "$options": "i"
    }
  }
  if (this.country) {
    mustArray['country'] = {
      "$regex" : this.country,
      "$options": "i"
  }
}

if (this.state) {
  mustArray['state'] = {
    "$regex" : this.state,
    "$options": "i"
}
}
 
  

    let payload = this.commonService.filterList()

    payload.size =Number(this.size);
    payload.from = 0;
    payload.query = mustArray
    payload.sort = {
      "desc" : ["updatedOn"]
    }, 
    this.commonService.getSTList('location',payload).subscribe((data) => {
      this.locationData = data.documents?.map((s: any,index) => {
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
    this.name = '';
    this.type = '';
    this.country = '';
    this.state = '';
    this.getLocation();
  }

  locationsMasters() {
    this.setValidation()
    this.submitted = true;
    if (this.locationForm.invalid) {
      return;
    }
    let countryList = this.countryData.filter(
      (x) => x.countryId === this.locationForm.get('country').value
    );
    let stateList = this.stateList.filter(
      (x) => x.stateId === this.locationForm.get('state').value
    );

    let portList = this.portList.filter(
      (x) => x.portId === this.locationForm.get('portName').value
    );
    let newLocation = this.locationForm.value;
    if (!this.locationIdToUpdate) {
      const dataupdate = {
        ...newLocation,
        country: countryList[0].countryName,
        countryISOCode: this.locationForm.get('country').value,
        state: stateList[0].typeDescription,
        stateCode : stateList[0].stateCode,
        stateId: this.locationForm.get('state').value,
        portId : this.locationForm.get('portName').value,
        portName : portList[0]?.portDetails?.portName,
        status: true,
        parentId :  this.parentId || '',
        "tenantId": this.tenantId,
      };
      const data = [dataupdate];
      this.commonService.addToST('location',data[0]).subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Added Successfully', '');
            this.onSave();
            this.getLocation();
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error', error?.error?.error?.message , '');
        }
      );
    } else {
      const dataWithUpdateID = {
        ...newLocation,
        locationId: this.locationIdToUpdate,
        country: countryList[0]?.countryName,
        countryISOCode: this.locationForm.get('country').value,
        state: stateList[0]?.typeDescription,
        stateCode : stateList[0]?.stateCode,
        stateId: this.locationForm.get('state').value,
        portId : this.locationForm.get('portName').value,
        portName : portList[0]?.portName,
        agentBranchId : this.locationForm.get('agentBranch').value,
        agentBranch : this.agentBranchList.filter((x)=> x?.systemtypeId === this.locationForm.get('agentBranch').value)[0]?.typeName,
        status: true,
        parentId :  this.parentId || '',
      };
      const data = [dataWithUpdateID];
      this.commonService.UpdateToST(`location/${data[0].locationId}`,data[0]).subscribe((result: any) => {
        if (result) {
          this.notification.create('success', 'Updated Successfully', '');
          this.onSave();
          this.getLocation();
        }
      },
      (error) => {
        this.onSave();
        this.notification.create('error',error?.error?.error?.message, '');
      });
    }
  }
  changeStatus(data, i) {
    this.commonService.UpdateToST(`location/${data.locationId}`,{ ...data, status: !data?.status })
      .subscribe(
        (res: any) => {
          if (res) {
            this.locationData[i].status = !data?.status;
            this.notification.create(
              'success',
              'Status Updated Successfully',
              ''
            );
            this.onSave();
            var myInterval = setInterval(() => {
              this.onSave();
              this.getLocation();
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
  delete(deletelocation, id) {
    this.modalService
      .open(deletelocation, {
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
            let data = {
              locationId: id.locationId,
              searchKey: 'locationId',
            };
            const body = [data];

            this.mastersService.deleteLocation(body).subscribe((res: any) => {
              if (res) {
                this.notification.create('success', 'Deleted Successfully', '');
                this.onSave();
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

  open(content, location?: any, show?: string) {
    this.show = show;
  
    // Reset the form when opening for a new entry
    this.locationForm.reset();
  
    if (location) {
      // Edit mode: populate form with existing data
      this.locationIdToUpdate = location?.locationId;
      this.parentId = location.parentId;
  
      this.locationForm.patchValue({
        locationName: location.locationName,
        portType: location.portType,
        country: location.countryISOCode,
        state: location.stateId,
        masterType: location.masterType,
        agentBranch: location.agentBranchId,
        name: location.name,
        CFS: location?.CFS,
        ICD: location?.ICD,
        Yard: location?.Yard,
        code: location.code,
        portName: location.portId,
        terminal: location.terminal,
        EDICode: location.EDICode,
        address: location.address,
        contactPerson: location.contactPerson,
        email: location.email,
        primaryCountryCode: location.primaryCountryCode,
        primaryNo: location.primaryNo,
        bondNo: location.bondNo,
        creditDays: location.creditDays,
        lineReference: location.lineReference,
      });
  
      // Fetch additional data if necessary
      this.getStateList();
      this.setValidation();
  
      // Disable the form in view mode ('show' === 'show'), enable it otherwise
      if (show === 'show') {
        this.locationForm.disable();
      } else {
        this.locationForm.enable();
      }
    } else {
      // New entry (add mode): ensure the form is enabled
      this.locationForm.enable();
    }
  
    // Open the modal dialog
    this.modalReference = this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  
    // Optional: Handle modal closure result
    // this.modalReference.result.then((result) => {
    //   this.closeResult = `Closed with: ${result}`;
    // });
  }
  onSave() {
    this.locationIdToUpdate = null;
    this.locationForm.reset();
    this.submitted = false;
    this.modalService.dismissAll();
    return null;
  }

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.locationData.map((row: any) => {
      storeEnquiryData.push({
        'Location Name': row.locationName,
        'Country': row.country,
        'State': row.state,
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

    const fileName = 'location.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  openPDF() {
    const prepare=[];
    this.locationData.forEach(e=>{
      let tempObj =[];
      tempObj.push(e.locationName);
      tempObj.push(e.country);
      tempObj.push(e.state);
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [297, 210]);
    autoTable(doc,{
        head: [['Location Name','Country','State']],
        body: prepare,
        didDrawCell: (data) => {
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'S');
         }
    });
    doc.save('location' + '.pdf');
  }
  applyFilter(filterValue: string) { 
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase();

   
    this.dataSource.filterPredicate = (data, filter) => {
      return JSON.stringify(data).toLowerCase().includes(filter);
    };

    this.dataSource.filter = filterValue;
  }
  export() {
    const modifiedTableData = this.dataSource?.filteredData;
    const tableColumns = this.displayedColumns;
    const tableData = modifiedTableData || [];
    const columnsToHide = [ 'action'];
    const actualColumns = this.displayedColumns;
    this.commonfunction.exportToExcel(
      tableColumns,
      tableData,
      columnsToHide,
      'Location',
      this.displayedColumns,
      actualColumns
    );
  }

}
