import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { LoaderService } from 'src/app/services/loader.service';
import { CommonService } from 'src/app/services/common/common.service';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { environment } from 'src/environments/environment';
import { CognitoService } from 'src/app/services/cognito.service';
import { Branch, Country, Location, MyInterface, PortDetails, State } from 'src/app/models/yard-cfs-master';
import { MastersSortPipe } from 'src/app/shared/util/mastersort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
@Component({
  selector: 'app-yard-cfs-master',
  templateUrl: './yard-cfs-master.component.html',
  styleUrls: ['./yard-cfs-master.component.scss']
})
export class YardCfsMasterComponent implements OnInit {
  _gc=GlobalConstants;
  locationForm: FormGroup;
  locationIdToUpdate: any;
  locationData: Location[] = [];
  closeResult: string;
  toalLength: any;
  size = 10;
  page = 1;
  count = 0;
  submitted: any = false;
  fromSize: number = 1;
  name: any;
  masterType: any;
  type: any;
  country: any;
  email: any
  state: any;
  countryData: Country[] = [];
  stateList: State[] = [];
  baseBody: any;
  modalReference: any;
  portList: PortDetails[] = [];
  callingCodeList: any;
  terminalList: any = []
  address: any;
  show: any;
  tenantId: any;
  customsdata: any
  yardcfs: any
  masterTypeList = [{label : 'CFS',value: 'CFS'},{label : 'Yard',value: 'YARD'},{label : 'CFS/Yard',value: 'CFS/YARD'},{label : 'ICD',value: 'ICD'}]
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort1!: MatSort;
  displayedColumns: string[] = [
    '#',
    'action',
    'name',
    'masterType',
    'code',
    'country',
    'state',
    'address',
  ];
  constructor(
    public loaderService: LoaderService,
    private fb: FormBuilder,
    public modalService: NgbModal,
    public cognito: CognitoService,
    public notification: NzNotificationService,
    public commonService: CommonService,
    private sortPipelist: MastersSortPipe,

  ) {
    this.loaderService = loaderService;
    this.fb = fb;
    this.modalService;
    this.cognito = cognito;
    this.notification = notification;
    this.commonService = commonService
    this.formBuild()
  }

  ngOnInit(): void {
    this.getcountryList();
    this.getLocation();
    this.getPortDropDowns()
    this.getSmartAgentList()
    // this.getyardcfs()
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.tenantId = resp.tenantId
      }
    })
  }
  sortList(array, key) {
    return this.sortPipelist.transform(array, key);
  }
  formBuild() {
    this.locationForm = this.fb.group({
      locationName: [''],
      portType: [''],
      country: ['', [Validators.required]],
      state: ['', [Validators.required]],
      masterType: ['', [Validators.required]],
      agentBranch: ['' ],
      CFS: [false],
      ICD: [false],
      Yard: [false],
      name: ['', [Validators.required]],
      code: ['' , [Validators.required]],
      portName: ['' ],
      terminal: [''],
      EDICode: [''],
      DOaddress: [''],
      address: ['', [Validators.required]],
      contactPerson: [''],
      email: ['', [Validators.pattern(environment.validate.email)]],
      primaryCountryCode: [''],
      primaryNo: ['', [Validators.pattern('^[0-9]*$')]],
      DOCode: [''],
      bondNo: [''],
      nominatedCfs: [''],
      creditDays: [''],
      lineReference: [true],
      isSEZ : [false]
    });
  }

  agentList: MyInterface[] = []
  agentBranchList: Branch[] = []
  pageNumber = 1;
  pageSize = 10;
  from = 0;
  totalCount = 0;

  onPageChange(event){
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.from = event.pageIndex*event.pageSize ;
    this. getLocation();
  }
  getyardcfs() {
    this.loaderService.showcircle();
    let payload = this.commonService?.filterList();
    payload.size= this.pageSize,
    payload.from=this.from
    payload.sort = {
      "desc": ["updatedOn"]
    }
    let mustArray = {};
    payload.query = mustArray;
    mustArray['masterType'] = {
      "$in": ['YARD', 'CFS','CFS,YARD']
    }
    this.commonService.getSTList("location", payload).subscribe((res: any) => {
      this.dataSource.data = res?.documents.map((s: any, i: number) => ({
        ...s,
        id: i + 1,
        name: s?.name,
        masterType: s?.masterType,
        code: s?.code,
        country: s?.country,
        state: s?.state,
        address: s?.address
      }));
      // this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort1;
      this.toalLength = res.totalCount;
      this.count = res.documents.length;
      this.loaderService.hidecircle();
    },()=>{
      this.loaderService.hidecircle();
    });
  }


  exportAsExcelFile1(): void {
    let storeEnquiryData = [];
    this.email.map((row: any) => {
      storeEnquiryData.push({
        'EmailName': row?.element?.emailName,
        'subject': row?.element?.subject,
        'createdOn': row?.element?.createdOn,
        'name': row?.element?.name,
        'Type': row?.element?.Type,
        'code': row?.element?.code,
        'country': row?.element?.country,
        'state': row?.element?.state,
        'address': row?.element?.address
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
            id:index+1+this.from
          }
        }));
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort1;

    });


  }

  clearFilters() {
    this.filtersModel = [];
    this.filterKeys = {};
    this.getLocation()
  }

  userdetails:any;
  currentUser:any;
  userCountry:any


  getSmartAgentList() {
    
    this.cognito.getUserDatails()?.subscribe((resp) => {

      if (resp != null) {

        this.userdetails = resp.userData

      }

    })

    let payload = this.commonService.filterList()

    if (payload?.query) payload.query = {

      agentId: this.userdetails?.agentId,

    }



    this.commonService.getSTList('agent', payload)?.subscribe((data: any) => {

      this.currentUser = data.documents[0]

      this.userCountry = this.currentUser?.addressInfo?.countryName
      let agentId = data.documents[0]?.orgId
      this.getBranchList(agentId)
    })
    
  }

  getBranchList(id) {
    let payload = this.commonService.filterList()
    payload.query = {
      orgId: id,
    }

    this.commonService.getSTList('branch', payload)
      .subscribe((data: any) => {
        this.agentBranchList = data.documents;
      });
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
        if (port?.terminals) {
          port.terminals.map((terminal) => {
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
    }

    this.commonService.getSTList('country', payload).subscribe((res: any) => {
      this.countryData = res.documents;
    });
  }
  getStateList() {
    this.stateList = [];
    if (!this.locationForm.get('country').value) {
      return
    }
    let payload = this.commonService.filterList()
    payload.query = {
      "status": true,
      countryId: this.locationForm.get('country').value
    }

    let countryData = this.countryData.filter(x => x?.countryId === this.locationForm.get('country').value);

    this.callingCodeList = countryData;
    this.commonService.getSTList('state', payload).subscribe((data) => {
      this.stateList = data.documents;
    });
  }
  get f() {
    return this.locationForm.controls;
  }
  
  getLocation() {
    let payload = this.commonService.filterList()
    payload.size= this.pageSize,
    payload.from=this.from
    let mustArray = {};
    this.name = this.name?.trim();
    this.masterType = this.masterType?.trim();
    this.type = this.type?.trim();
    this.country = this.country?.trim();
    this.state = this.state?.trim();
    this.address = this.address?.trim();


    mustArray['masterType'] = {
      "$in": ['YARD', 'CFS', 'CFS,YARD','ICD']
    }


    if (this.name) {
      mustArray['name'] = {
        "$regex": this.name,
        "$options": "i"
      }
    }
    if (this.masterType) {
      mustArray['masterType'] = {
        "$regex": this.masterType,
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
      payload.sort = {
        "desc": ["updatedOn"]
      }
    this.commonService.getSTList("location", payload).subscribe((data) => {
      this.locationData = data.documents;
      if (data && data?.documents) {
        this.dataSource.data = data.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1+this.from,
        name: s?.name,
        masterType: s?.masterType,
        code: s?.code,
        country: s?.country,
        state: s?.state,
        address: s?.address
          
        }));
        // this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1; 
        this.toalLength = data.totalCount;
        this.count = data.documents.length;
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
    this.name = this.name?.trim();
    this.masterType = this.masterType?.trim();
    this.type = this.type?.trim();
    this.country = this.country?.trim();
    this.state = this.state?.trim();
    this.address = this.address?.trim();


    mustArray['masterType'] = {
      "$in": ['YARD', 'CFS', 'CFS,YARD','ICD']
    }


    if (this.name) {
      mustArray['name'] = {
        "$regex": this.name,
        "$options": "i"
      }
    }
    if (this.masterType) {
      mustArray['masterType'] = {
        "$regex": this.masterType,
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
            ? this.count - ((this.toalLength % Number(this.size)) > 0 ? (this.toalLength % Number(this.size)) : (Number(this.size)))
            : this.count - data.documents.length
          : this.count + data.documents.length;
    });
  }

  search() {
    let mustArray = {};
    this.name = this.name?.trim();
    this.masterType = this.masterType?.trim();
    this.type = this.type?.trim();
    this.country = this.country?.trim();
    this.state = this.state?.trim();
    this.address = this.address?.trim();


    mustArray['masterType'] = {
      "$in": ['YARD', 'CFS','CFS,YARD','ICD']
    }


    if (this.name) {
      mustArray['name'] = {
        "$regex": this.name,
        "$options": "i"
      }
    }
    if (this.masterType) {
      mustArray['masterType'] = {
        "$regex": this.masterType,
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
          id:index+1+this.from
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
        status: true, 
        "tenantId": this.tenantId,
        ICD: this.locationForm.get('masterType').value === 'ICD'  ? true : false,
        Yard: this.locationForm.get('masterType').value === 'YARD' || this.locationForm.get('masterType').value === 'CFS/YARD' ? true : false,
        CFS: this.locationForm.get('masterType').value === 'CFS' || this.locationForm.get('masterType').value === 'CFS/YARD' ? true : false,
        masterType: this.locationForm.get('masterType').value === 'CFS/YARD' ? 'CFS,YARD' : this.locationForm.get('masterType').value,
        agentBranchId: this.locationForm.get('agentBranch').value,
        agentBranch: this.agentBranchList.filter((x) => x?.branchId === this.locationForm.get('agentBranch').value)[0]?.branchName,
        isSEZ: this.locationForm.get('isSEZ').value,
      };

      this.commonService.addToST('location', dataupdate).subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Added Successfully', '');
            this.onSave();
            this.getLocation();
          }
        },
        (error) => {
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
    } else {
      const dataWithUpdateID = {
        ...newLocation,
        locationName: this.locationForm.get('name').value,
        locationId: this.locationIdToUpdate,
        country: countryList[0].countryName,
        countryISOCode: this.locationForm.get('country').value,
        state: stateList[0].typeDescription,
        stateId: this.locationForm.get('state').value,
        portId: this.locationForm.get('portName').value,
        portName:'',
        ICD: this.locationForm.get('masterType').value === 'ICD'  ? true : false,
        Yard: this.locationForm.get('masterType').value === 'YARD' || this.locationForm.get('masterType').value === 'CFS/YARD' ? true : false,
        CFS: this.locationForm.get('masterType').value === 'CFS' || this.locationForm.get('masterType').value === 'CFS/YARD' ? true : false,
        status: true,
        "tenantId": this.tenantId,
        masterType: this.locationForm.get('masterType').value === 'CFS/YARD' ? 'CFS,YARD' : this.locationForm.get('masterType').value,
        agentBranchId: this.locationForm.get('agentBranch').value,
        agentBranch: this.agentBranchList.filter((x) => x?.branchId === this.locationForm.get('agentBranch').value)[0]?.branchName,
        isSEZ: this.locationForm.get('isSEZ').value,

      };
      this.commonService.UpdateToST(`location/${dataWithUpdateID.locationId}`, dataWithUpdateID).subscribe((result: any) => {
        if (result) {
          this.notification.create('success', 'Updated Successfully', '');
          this.onSave();
          this.getLocation();
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
            let data = 'location' + id.locationId

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
  public getDismissReason(reason: any): string {
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
  
    // Reset the form state when opening for a new entry
    this.locationForm.reset();
  
    if (location) {
      // Edit mode: populate form with existing data
      this.locationIdToUpdate = location?.locationId;
  
      this.locationForm.patchValue({
        locationName: location?.name,
        portType: location?.portType,
        country: location?.countryISOCode,
        state: location?.stateId,
        masterType: location?.masterType === 'CFS,YARD' ? 'CFS/YARD' : location?.masterType,
        name: location?.name,
        CFS: location?.CFS,
        ICD: false,  // Explicitly set ICD to false if needed
        Yard: location?.Yard,
        code: location?.code,
        portName: location?.portId,
        terminal: location?.terminal,
        EDICode: location?.EDICode,
        address: location?.address,
        contactPerson: location?.contactPerson,
        email: location?.email,
        primaryCountryCode: location?.primaryCountryCode,
        primaryNo: location?.primaryNo,
        bondNo: location?.bondNo,
        nominatedCfs: location?.nominatedCfs,
        creditDays: location?.creditDays,
        lineReference: location?.lineReference,
        agentBranch: location?.agentBranchId,
        isSEZ: location?.isSEZ
      });
  
      // Fetch state list if required
      this.getStateList();
  
      // Conditionally disable the form in view mode (show === 'show'), otherwise enable it
      if (show === 'show') {
        this.locationForm.disable();
      } else {
        this.locationForm.enable();
      }
    } else {
      // New entry (add mode), ensure form is enabled
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
  
    this.modalReference.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    });
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

        'Name': row.locationName,
        'Type': row.masterType,
        'Code': row.code,
        'Country': row.country,
        'State': row.state,
        'Address': row.address,
        'Status': row.status ? 'Active' : 'Inactive',
      });
    });
    const myworksheet: XLSX.WorkSheet =
      XLSX.utils.json_to_sheet(storeEnquiryData);
    const myworkbook: XLSX.WorkBook = {
      Sheets: { data: myworksheet },
      SheetNames: ['data'],
    };
    const fileName = 'yard-cfs.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  openPDF() {
    const prepare = [];
    this.locationData.forEach(e => {
      let tempObj = [];
      tempObj.push(e.locationName);
      tempObj.push(e.masterType);
      tempObj.push(e.code);
      tempObj.push(e.country);
      tempObj.push(e.state);
      tempObj.push(e.address);
      tempObj.push(e.status ? 'Active' : 'Inactive');
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [297, 210]);
    autoTable(doc, {
      head: [['Name', 'Type', 'Code', 'Country', 'State', 'Address', 'Status']],
      body: prepare,
      didDrawCell: (data) => {
        // Draw border lines for each cell
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'S');
      }
    });
    doc.save('yard-cfs' + '.pdf');
  }

}

