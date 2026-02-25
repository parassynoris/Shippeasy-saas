import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalDismissReasons, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { BaseBody } from 'src/app/admin/smartagent/base-body';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { LoaderService } from 'src/app/services/loader.service';
import { CommonService } from 'src/app/services/common/common.service';
import { MastersService } from 'src/app/services/Masters/masters.service';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { OrderByPipe } from 'src/app/shared/util/sort';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { CognitoService } from 'src/app/services/cognito.service';
import { CountryData, StateData } from 'src/app/models/city-master';
import { MyInterface, PortDetails } from 'src/app/models/yard-cfs-master';
import { MastersSortPipe } from 'src/app/shared/util/mastersort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
  
interface terminal{
  item_text:string,
  item_id:string
}
@Component({
  selector: 'app-icd-master',
  templateUrl: './icd-master.component.html',
  styleUrls: ['./icd-master.component.scss']
})
export class ICDMasterComponent implements OnInit {
  _gc=GlobalConstants;
  locationForm: FormGroup;
  locationIdToUpdate: string;
  locationData = [];
  closeResult: string;
  toalLength: number;
  size = 10;
  page = 1;
  count = 0;
  submitted: boolean = false;
  fromSize: number = 1;
  email:any
  name: any;
  type: any;
  country: any;
  state: any;
  countryData: any = [];
  stateList: any = [];
  baseBody: any;
  modalReference: any;
  portList: any = [];
  callingCodeList: any;
  terminalList: any = []
  address: any;
  show: any;
  parentId: any = ''
  tenantId: any;
  isMaster: boolean = true; 

  yardcfs:any
  dataSource = new MatTableDataSource<any>();
  displayedColumns = ['#', 'action' ,'name', 'code','country','state','address'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort1!: MatSort;

  constructor(
    public loaderService: LoaderService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    public modalService: NgbModal,
    private mastersService: MastersService,
    private profileService: ProfilesService,
    private commonfunction: CommonFunctions,
    private notification: NzNotificationService,
    public commonService: CommonService, private cognito: CognitoService,
    public sortPipe: OrderByPipe,
    private sortPipelist: MastersSortPipe,



  )  {
    this.formBuild();
  
    this.activatedRoute.params?.subscribe(params => {
      this.parentId = params['id'];
      if(params['id']){
        this.isMaster = false
      }
    
    });
  }
  sortList(array , key){
    return this.sortPipelist.transform(array, key);
   }

  ngOnInit(): void {
    this.getcountryList();
    this.getLocation();
    this.getPortDropDowns();
    this.getAgent()
    this.ICD()
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.tenantId = resp.tenantId
      }
    })
  }
  

  sort(array, key) {
    return this.sortPipe.transform(array, key);
  }
  formBuild() {
    this.locationForm = this.fb.group({
      locationName: [''],
      portType: [''],
      country: ['', [Validators.required]],
      state: ['', [Validators.required]],
      agentBranch: ['', [Validators.required]],
      masterType: [''],
      isSEZ: [false],
      CFS: [false],
      ICD: [true],
      Yard: [false],
      name: ['', [Validators.required]],
      code: ['', [Validators.required]],
      portName: ['', [Validators.required]],
      terminal: [''],
      EDICode: [''],
      DOaddress: [''],
      address: ['', [Validators.required]],
      contactPerson: [''],
      email: [''],
      primaryCountryCode: [''],
      primaryNo: [''],
      DOCode: [''],
      bondNo: [''],
      creditDays: [''],
      lineReference: [true],
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
    this.ICD();
  }
  ICD() {
    this.loaderService.showcircle();
    let payload = this.commonService?.filterList();
    payload.size= this.pageSize,
    payload.from=this.from
      payload.sort = {
        "desc": ["updatedOn"]
      }

      let mustArray = {};
      mustArray["ICD"] = true
      payload.query = mustArray
      this.commonService.getSTList("location", payload).subscribe((res: any) => {
      if (res && res.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1,
          name: s.name,
          code: s.code,
          country: s.country,
          state: s.state,
          address: s.address
        }));
        // this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1; 
        this.toalLength = res.totalCount;
        this.count = res.documents.length;
        this.loaderService.hidecircle();
      } 
    }, (error: any) => { 
      this.loaderService.hidecircle();
    });
  }

exportAsExcelFile1(): void {
  let storeEnquiryData = [];
  this.email.map((row: any) => {
    storeEnquiryData.push({
      'name' : row?.element?.name,
      'code' : row?.element?.code,
      'country' : row?.element?.country,
      'state': row?.element?.state,
      'address' : row?.element?.address 
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
    let payload = this.commonService.filterList()
    payload.query = this.filterKeys
    payload.sort = {
      "desc": ["updatedOn"]
    }
    this.commonService.getSTList("location", payload).subscribe((data) => {
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
    this.ICD();
  }

  agentList: MyInterface[] = []
  agentBranchList: any = []
  getAgent() {
    let payload = this.commonService.filterList()
    payload.query = {
      "status": true,
    }

    this.commonService.getSTList('agent', payload).subscribe((data: any) => {
      this.agentList = data.documents;
      this.getBranch()
    });
  }
  getBranch() {
    let payload = this.commonService.filterList()
    payload.query = {
      "status": true,
      "parentId": this.agentList[0]?.agentId
    }

    this.commonService.getSTList('branch', payload).subscribe((data: any) => {
      this.agentBranchList = data.documents;
    })
  }

  getPortDropDowns() {
    let payload = this.commonService.filterList()
    payload.query = {
      "status": true,
    }
    payload.size = 15000
    payload.project = ["portDetails.portName", "portId"];
    this.commonService.getSTList('port', payload).subscribe((res: any) => {
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
      "status": true, 
    }
    this.commonService.getSTList('country', payload).subscribe((res: any) => {
      this.countryData = res.documents;
    });
  }
  getStateList() {
    this.stateList = [];
    if (!this.locationForm.get('country').value) {
      return false
    }
    let countryData = this.countryData.filter(x => x?.countryId === this.locationForm.get('country').value);
    this.callingCodeList = countryData;
    let payload = this.commonService.filterList()
    payload.query = {
      "status": true,
      countryId: this.locationForm.get('country').value,
    }

    this.commonService.getSTList('state', payload).subscribe((data) => {
      this.stateList = data.documents;
    });
  }
  get f() {
    return this.locationForm.controls;
  }
  getLocation() {
    this.page = 1;
    let payload = this.commonService.filterList()
 
    // payload.size = Number(this.size),
    //   payload.from = this.page - 1,
      payload.sort = {
        "desc": ["updatedOn"]
      }

      let mustArray = {};
      mustArray["ICD"] = true
  
      this.name = this.name?.trim();
      this.type = this.type?.trim();
      this.country = this.country?.trim();
      this.state = this.state?.trim();
      this.address = this.address?.trim();
  
      if (!this.isMaster) {
        mustArray['parentId'] = this.parentId
      }
      if (this.name) {
        mustArray['name'] = {
          "$regex": this.name,
          "$options": "i"
        }
      }
      if (this.type) {
        mustArray['code'] = {
          "$regex": this.type,
          "$options": "i"
        }
      }
      if (this.country) {
        mustArray['country'] = {
          "$regex": this.country,
          "$options": "i"
        }
      }
      if (this.state) {
        mustArray['state'] = {
          "$regex": this.state,
          "$options": "i"
        }
      }
      if (this.address) {
        mustArray['address'] = {
          "$regex": this.address,
          "$options": "i"
        }
      }
      
      payload.query = mustArray
    this.commonService.getSTList("location", payload).subscribe((data) => {
      this.locationData = data.documents;
      this.toalLength = data.totalCount;
      this.count = data.documents.length;
      if (data && data?.documents) {
        this.dataSource.data = data.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1+this.from,
          name: s.name,
          code: s.code,
          country: s.country,
          state: s.state,
          address: s.address
        }));
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1; 
      }
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

  getPaginationData(type: any) {
    this.fromSize =
      type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
    let payload = this.commonService.filterList()
 
    payload.size = Number(this.size),
      payload.from = this.fromSize - 1,
      payload.sort = {
        "desc": ["updatedOn"]
      }

      let mustArray = {};
      mustArray["ICD"] = true
  
      this.name = this.name?.trim();
      this.type = this.type?.trim();
      this.country = this.country?.trim();
      this.state = this.state?.trim();
      this.address = this.address?.trim();
  
      if (!this.isMaster) {
        mustArray['parentId'] = this.parentId
      }
      if (this.name) {
        mustArray['name'] = {
          "$regex": this.name,
          "$options": "i"
        }
      }
      if (this.type) {
        mustArray['code'] = {
          "$regex": this.type,
          "$options": "i"
        }
      }
      if (this.country) {
        mustArray['country'] = {
          "$regex": this.country,
          "$options": "i"
        }
      }
      if (this.state) {
        mustArray['state'] = {
          "$regex": this.state,
          "$options": "i"
        }
      }
      if (this.address) {
        mustArray['address'] = {
          "$regex": this.address,
          "$options": "i"
        }
      }
      
      payload.query = mustArray
    this.commonService.getSTList("location", payload).subscribe((data) => {
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
    mustArray["ICD"] = true

    this.name = this.name?.trim();
    this.type = this.type?.trim();
    this.country = this.country?.trim();
    this.state = this.state?.trim();
    this.address = this.address?.trim();

    if (!this.isMaster) {
      mustArray['parentId'] = this.parentId
    }
    if (this.name) {
      mustArray['name'] = {
        "$regex": this.name,
        "$options": "i"
      }
    }
    if (this.type) {
      mustArray['code'] = {
        "$regex": this.type,
        "$options": "i"
      }
    }
    if (this.country) {
      mustArray['country'] = {
        "$regex": this.country,
        "$options": "i"
      }
    }
    if (this.state) {
      mustArray['state'] = {
        "$regex": this.state,
        "$options": "i"
      }
    }
    if (this.address) {
      mustArray['address'] = {
        "$regex": this.address,
        "$options": "i"
      }
    }
    let payload = this.commonService.filterList()
    payload.query = mustArray
    payload.size = Number(this.size),
      payload.from = this.page - 1,
      payload.sort = {
        "desc": ["updatedOn"]
      }
    this.commonService.getSTList("location", payload).subscribe((data) => {
      this.locationData = data.documents?.map((s: any,index) => {
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

  clear() {
    this.name = '';
    this.type = '';
    this.country = '';
    this.state = '';
    this.getLocation();
  }

  locationsMasters() {
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
        locationName: this.locationForm.get('name').value,
        country: countryList[0].countryName,
        countryISOCode: this.locationForm.get('country').value,
        state: stateList[0].typeDescription,
        stateId: this.locationForm.get('state').value,
        portId: this.locationForm.get('portName').value,
        portName: portList[0]?.portDetails?.portName,
        isSEZ: this.locationForm.get('isSEZ').value,
        status: true,
        ICD: true,
        Yard: false,
        CFS: false,
        parentId: this.parentId || '',
        masterType: 'ICD',
        "tenantId": this.tenantId,
        agentBranchId: this.locationForm.get('agentBranch').value,
        agentBranch: this.agentBranchList.filter((x) => x?.branchId === this.locationForm.get('agentBranch').value)[0]?.branchName,
      };
      this.commonService.addToST('location', dataupdate).subscribe(
        (res: any) => {
          if (res) {
            setTimeout(() => {
              this.notification.create('success', 'Added Successfully', '');
              this.onSave();
              this.getLocation();
            }, 1000);

          }
        },
        (error) => {
          this.notification.create('error', error?.error?.error?.message,'');
        }
      );
    } else {
      const dataWithUpdateID = {
        ...newLocation,
        locationId: this.locationIdToUpdate,
        country: countryList[0].countryName,
        countryISOCode: this.locationForm.get('country').value,
        state: stateList[0]?.typeDescription,
        stateId: this.locationForm.get('state').value,
        portId: this.locationForm.get('portName').value,
        portName: portList[0].portName,
        isSEZ: this.locationForm.get('isSEZ').value,
        ICD: true,
        Yard: false,
        CFS: false,
        status: true,
        masterType: 'ICD',
        parentId: this.parentId || '',
        "tenantId": this.tenantId,
        agentBranchId: this.locationForm.get('agentBranch').value,
        agentBranch: this.agentBranchList.filter((x) => x?.branchId === this.locationForm.get('agentBranch').value)[0]?.branchName,
      };

      this.commonService.UpdateToST(`location/${dataWithUpdateID.locationId}`, dataWithUpdateID).subscribe((result: any) => {
        if (result) {
          setTimeout(() => {
            this.notification.create('success', 'Updated Successfully', '');
            this.onSave();
            this.getLocation();
          }, 1000);
        }
      });
    }
  }
  changeStatus(data, i) {
    this.commonService
      .UpdateToST(`location/${data.locationId}`, { ...data, status: !data?.status })
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
              this.getLocation();
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
            let data = 'locationId' + id.locationId


            this.commonService.deleteST(data).subscribe((res: any) => {
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

  open(content, location?: any, show?) {
    this.show = show;
    if (location) {
      this.locationIdToUpdate = location?.locationId;
      this.parentId = location?.parentId || ''
      this.locationForm.patchValue({
        locationName: location.locationName,
        portType: location.portType,
        country: location.countryISOCode,
        state: location.stateId,
        masterType: 'ICD',
        name: location.name,
        CFS: location?.CFS,
        ICD: false,
        agentBranch: location?.agentBranchId,
        isSEZ: location?.isSEZ,
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
      this.getStateList()
      show === 'show' ? this.locationForm.disable() : this.locationForm.enable()
    }
    this.modalReference = this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });

    this.modalReference.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    });
  }
  onSave() {
    this.locationIdToUpdate = null;
    this.formBuild();
    this.submitted = false;
    this.modalService.dismissAll();
    return null;
  }

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.locationData.map((row: any) => {
      storeEnquiryData.push({
        'Name': row.locationName,
        'Code': row.code,
        'Country': row.country,
        'State': row.state,
        'Address': row.address,
        'Status': row.status ? 'Active' : 'Inactive'
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

    const fileName = 'ICD.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  openPDF() {
    const prepare = [];
    this.locationData.forEach(e => {
      let tempObj = [];
      tempObj.push(e.locationName);
      tempObj.push(e.code);
      tempObj.push(e.country);
      tempObj.push(e.state);
      tempObj.push(e.address);
      tempObj.push(e.status ? 'Active' : 'Inactive')
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [297, 210]);
    autoTable(doc, {
      head: [['Name', 'Code', 'Country', 'State', 'Address', 'Status']],
      body: prepare,
      didDrawCell: (data) => {
        // Draw border lines for each cell
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'S');
    }
    });
    doc.save('ICD' + '.pdf');
  }
}
