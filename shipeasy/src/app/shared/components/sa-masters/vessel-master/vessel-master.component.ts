import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  NgbModal,
  NgbModalRef,
} from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { environment } from 'src/environments/environment';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
import { CommonService } from 'src/app/services/common/common.service';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { DatePipe } from '@angular/common'
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { CognitoService } from 'src/app/services/cognito.service';
import { Vessel } from 'src/app/models/vessel-master';
import { CountryData } from 'src/app/models/city-master';
import { uom } from 'src/app/models/uom';
import { MastersSortPipe } from 'src/app/shared/util/mastersort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
import { vessel } from '../data';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/admin/principal/api.service';
@Component({
  selector: 'app-vessel-master',
  templateUrl: './vessel-master.component.html',
  styleUrls: ['./vessel-master.component.scss'],
})
export class VesselMasterComponent implements OnInit {
  _gc = GlobalConstants;
  tabs = vessel.masterTabs
  modalReference: NgbModalRef;
  addVesselForm: FormGroup;
  vesseldata: Vessel[] = [];
  airIdToUpdate: string;
  closeResult: string;
  submitted: any = false;
  toalLength: any;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  minDate = environment.validate.minDate;
  vesselCode: any;
  airline: any;
  airlineCode: any;
  isTransport:boolean =true
  aircraftType: any;
  flight:any
  cargo: any;
  volumey: any;
  certificateData: any = [];
  airLineType:any = [];
  tenantId: any;
  yardcfs: any;
  activeButton: number = 1;
  email: any
  isEditing: boolean = false;
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort1!: MatSort;
  displayedColumns = [
    '#',
    'action',
    'airline',
    'flight',
    'airlineCode',
    'aircraftType',
    'cargo',
    'volumey',
    'status'
  ];
  disbleTab: boolean = true
  currentLogin: any;

  constructor(
    public modalService: NgbModal,
    private masterservice: MastersService,
    private fb: FormBuilder, private cognito: CognitoService,
    private notification: NzNotificationService, private commonfunction: CommonFunctions,
    private saMasterService: SaMasterService,
    public commonService: CommonService,
    public datepipe: DatePipe,
    private sortPipelist: MastersSortPipe,
    public loaderService: LoaderService,
    private router: Router,
    private route: ActivatedRoute,
    private _api: ApiService,
    

  ) {
    this.formBuild();
    this.isTransport = localStorage.getItem('isTransport') === 'true' ? true : false ;
    this.currentLogin = this.commonfunction.getUserType1() 
    this.route.params.subscribe(params =>this.urlParam = params
    );
    this.holdControl = this.urlParam.bid || 'details';
    if (!this.route.snapshot.params.id || this.route.snapshot.params.id == 1) {
      this.disbleTab = true;
    } else {
      this.disbleTab = false;
    }
    if(this.isTransport){
      this.tabs = vessel.masterTabs1
      this.holdControl = 'Land'
      this.router.navigate(['/master/' + '/VesselMaster/' + 'Land']);
    }
    if(this.isTransport)this.tabs=vessel.masterTabs1;
  }

  formBuild() {
    this.addVesselForm = this.fb.group({
      airline: ['', Validators.required],
      airlineCode: ['', Validators.required],
      aircraftType: ['', Validators.required],
      flight: ['',Validators.required],
      cargo: [''],
      volumey: [''],
      status: [true],
    });
  }

  getShippingLineDropDowns() {

    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true,
      "ShipmentTypeName": 'Air',
    }

    this._api
      .getSTList('shippingline', payload)
      ?.subscribe((res: any) => { 
      this.airLineType = res?.documents
      });
  }

  
  saveListing() { this.activeButton = 1; }
  editListing() { this.activeButton = 2; }
  LandListing() { this.activeButton = 3; }
  RailListing() { this.activeButton = 4; }

  openn(content: any, element?: any, mode?: string) {
    if (mode === 'show') {
    } else {
      if (element) {
        this.airIdToUpdate = element.id;
        this.addVesselForm.patchValue(element);
      } else {
        this.airIdToUpdate = null;
        this.addVesselForm.reset();
      }
    }
  }

  setActiveButton(buttonNumber: number) {
    this.activeButton = buttonNumber;
  }
  currentUrl: any

  ngOnInit(): void {
    this.getData();
    this.getShippingLineDropDowns();
    this.currentUrl = window.location.href.split('?'[0].split('/').pop())
    this.cognito.getUserDatails().subscribe((resp) => {
      if (resp != null) {
        this.tenantId = resp.tenantId
      }
    })
  }


  holdControl: any;
  urlParam: any
  onTab(data) {
    this.router.navigate(['/master/' + '/VesselMaster/' + data.key]);
    this.holdControl = data.key;
    this.route.params.subscribe(params =>
      this.urlParam = params
    );

  }

  exportAsExcelFile1(): void {
    let storeEnquiryData = [];
    this.email.map((row: any) => {
      storeEnquiryData.push({
        'airline': row?.element?.airline,
        'airline Code': row?.element?.airlineCode,
        'aircraftType': row?.element?.aircraftType,
        'cargo': row?.element?.cargo,
        'volumey': row?.element?.volumey,
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
    this.commonService?.getSTList('air', payload)?.subscribe((data) => {
      this.yardcfs = data.documents;
      this.dataSource = new MatTableDataSource(
        data?.documents?.map((s: any, index) => {
          return {
            ...s,
            id: index + 1
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
    this.getData()
  }

  get cranes() {
    return this.addVesselForm.get('cranes') as FormArray;
  }
  sortList(array, key) {
    return this.sortPipelist.transform(array, key);
  }
  addCrane(data) {
    this.cranes.push(this.newCrane(data))
  }

  newCrane(data) {
    if (data) {
      return this.fb.group({
        craneNo: data.craneNo,
        capacity: data.capacity,
        position: data.position,
        outreach: data.outreach,
        remarks: data.remarks
      })
    }
    else {
      return this.fb.group({
        craneNo: [''],
        capacity: [''],
        position: [''],
        outreach: [''],
        remarks: ['']
      })
    }
  }


  removeCrane(i: number) {
    this.cranes.removeAt(i);

  }

  get f() {
    return this.addVesselForm.controls;
  }

  pageNumber = 1;
  pageSize = 10;
  from = 0;
  totalCount = 0;

  onPageChange(event) {
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.from = event.pageIndex * event.pageSize;
    this.getData();
  }
  IN_ACTIVE_FLAG: any;
  getData() {
    this.loaderService.showcircle();
    let payload = this.commonService.filterList()
    payload.size = this.pageSize,
      payload.from = this.from
    payload.query = {}
    payload.sort = {
      "desc": ["updatedOn"]
    }
    let mustArray = {};
    this.volumey = this.volumey?.trim();
    this.airline = this.airline?.trim();
    this.aircraftType = this.aircraftType?.trim();
    this.flight = this.flight?.trim();
    this.cargo = this.cargo?.trim();
    this.airlineCode = this.airlineCode?.trim();
    this.IN_ACTIVE_FLAG = this.IN_ACTIVE_FLAG?.trim();

    if (this.airline) {
      mustArray['airline'] = {
        "$regex": this.airline,
        "$options": "i"
      }
    }

    if (this.airline) {
      mustArray['airline'] = {
        "$regex": this.airline,
        "$options": "i"
      }
    }
    if (this.aircraftType) {
      mustArray['chartName'] = {
        "$regex": this.aircraftType,
        "$options": "i"
      }
    }
    if(this.flight){
      mustArray['flight'] = {
        "$regex": this.flight,
        "$options": "i"
      }
    }
    if (this.cargo) {
      mustArray['countryName'] = {
        "$regex": this.cargo,
        "$options": "i"
      }
    }
    if (this.airlineCode) {
      mustArray['airlineCode'] = {
        "$regex": this.airlineCode,
        "$options": "i"
      }
    }
    if (this.IN_ACTIVE_FLAG) {
      mustArray['status'] = this.IN_ACTIVE_FLAG === 'true' ? true : false
    }


    payload.query = mustArray
    this.commonService.getSTList('air', payload).subscribe((res: any) => {
      this.vesseldata = res.documents;

      if (res && res?.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1+this.from,
          airline: s.airline,
          airlineCode: s.airlineCode,
          aircraftType: s.aircraftType,
          flight:s.flight,
          cargo: s.cargo,
          volumey: s.volumey,
          status: s.status,

        }));
        this.dataSource.sort = this.sort1;
        this.toalLength = res.totalCount;
        this.count = res.documents.length;
        this.loaderService.hidecircle();
      }
    }, () => {
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
    payload.query = {}
    payload.sort = {
      "desc": ["updatedOn"]
    }
    let mustArray = {};
    this.airline = this.airline?.trim();
    this.airlineCode = this.airlineCode?.trim();
    this.aircraftType = this.aircraftType?.trim();
    this.cargo = this.cargo?.trim();
    this.volumey = this.volumey?.trim();
    this.IN_ACTIVE_FLAG = this.IN_ACTIVE_FLAG?.trim();
    if (this.airline) {
      mustArray['airline'] = {
        "$regex": this.airline,
        "$options": "i"
      }
    }

    if (this.airline) {
      mustArray['airline'] = {
        "$regex": this.airline,
        "$options": "i"
      }
    }
    if (this.aircraftType) {
      mustArray['chartName'] = {
        "$regex": this.aircraftType,
        "$options": "i"
      }
    }
    if (this.cargo) {
      mustArray['countryName'] = {
        "$regex": this.cargo,
        "$options": "i"
      }
    }
    if (this.airlineCode) {
      mustArray['airlineCode'] = {
        "$regex": this.airlineCode,
        "$options": "i"
      }
    }
    if (this.IN_ACTIVE_FLAG) {
      mustArray['status'] = this.IN_ACTIVE_FLAG === 'true' ? true : false
    }
    payload.query = mustArray
    payload.size = Number(this.size)
    payload.from = this.fromSize - 1,
      this.commonService.getSTList('air', payload).subscribe((data) => {
        this.vesseldata = data.documents;
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
    this.airline = this.airline?.trim();
    this.airlineCode = this.airlineCode?.trim();
    this.aircraftType = this.aircraftType?.trim();
    this.cargo = this.cargo?.trim();
    this.volumey = this.volumey?.trim();
    this.IN_ACTIVE_FLAG = this.IN_ACTIVE_FLAG?.trim();
    if (this.airline) {
      mustArray['airline'] = {
        "$regex": this.airline,
        "$options": "i"
      }
    }

    if (this.airline) {
      mustArray['airline'] = {
        "$regex": this.airline,
        "$options": "i"
      }
    }
    if (this.aircraftType) {
      mustArray['chartName'] = {
        "$regex": this.aircraftType,
        "$options": "i"
      }
    }
    if (this.cargo) {
      mustArray['countryName'] = {
        "$regex": this.cargo,
        "$options": "i"
      }
    }
    if (this.airlineCode) {
      mustArray['airlineCode'] = {
        "$regex": this.airlineCode,
        "$options": "i"
      }
    }
    if (this.IN_ACTIVE_FLAG) {
      mustArray['status'] = this.IN_ACTIVE_FLAG === 'true' ? true : false
    }
    let payload = this.commonService.filterList()
    payload.query = mustArray
    payload.sort = {
      "desc": ["updatedOn"]
    }
    payload.size = Number(this.size)
    payload.from = this.fromSize - 1,
      this.commonService.getSTList('air', payload).subscribe((data) => {
        this.vesseldata = data.documents?.map((s: any, index) => {
          return {
            ...s,
            id: index + 1
          }
        });
        this.toalLength = data.totalCount;
        this.count = data.documents.length;
        this.fromSize = 1
      });
  }

  clear() {
    this.airline = ""
    this.airlineCode = ""
    this.airlineCode = ""
    this.cargo = ""
    this.volumey = ""
    this.getData();
  }
show:string
  open(content, vessel?: any, show?: string) {
    this.show = show; // Pass the 'show' parameter to the template

    if (vessel) {
      this.airIdToUpdate = vessel.airId;
      this.addVesselForm.patchValue({
        airline: vessel.airlineId,
        airlineCode: vessel.airlineCode,
        aircraftType: vessel.aircraftType,
        flight: vessel.flight,
        cargo: vessel.cargo,
        volumey: vessel.volumey,
        status: vessel.status,
      });
      if (vessel.certificates) {
        this.certificateData = vessel.certificates;
      }
      if (vessel.cranes) {
        vessel.cranes.forEach((e) => {
          this.addCrane(e);
        });
      }

      // Disable form if show === 'show' (view mode)
      show === 'show' ? this.addVesselForm.disable() : this.addVesselForm.enable();
    } else {
      this.airIdToUpdate = null; // Reset airIdToUpdate if no vessel
    }

    this.modalReference = this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'xl',
    });
  }

  vesselMasters() {
    this.submitted = true;
    if (this.addVesselForm.invalid) {
      this.notification.create('error', 'Please fill reqired fields', '');
      return;
    }
    let duplicate = 0
    if (duplicate < 1) {
      let newdata ={...this.addVesselForm.value,
        airline: this.airLineType?.filter((x) => x?.shippinglineId == this.addVesselForm.value.airline)[0]?.name || '',
        airlineId : this.addVesselForm.value.airline
      };


      if (!this.airIdToUpdate) {
        this.commonService.addToST('air', newdata).subscribe(
          (res: any) => {
            if (res) {
              this.notification.create('success', 'Added Successfully', '');
              this.onSave();
              var myInterval = setInterval(() => {
                this.getData();
                clearInterval(myInterval);
              }, 1000);
            }
          },
        );
      } else {
        let ui = { ...newdata, airId: this.airIdToUpdate };
        this.commonService.UpdateToST(`air/${ui.airId}`, ui).subscribe(
          (res: any) => {
            if (res) {
              this.notification.create('success', 'Updated Successfully', '');
              this.onSave();
              var myInterval = setInterval(() => {
                this.getData();
                clearInterval(myInterval);
              }, 1000);
            }
          },
        );
      }
    }

  }

  changeStatus(data, i) {
    this.commonService.UpdateToST(`air/${data.airId}`, { ...data, status: !data?.status })
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
    this.airIdToUpdate = null;
    this.formBuild();
    this.submitted = false;
    this.modalService.dismissAll();
    this.certificateData = [];
    return null;
  }

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.vesseldata.map((row: any) => {
      storeEnquiryData.push({
        "airline": row.airline,
        "airlineCode": row?.airlineCode,
        "aircraftType": row?.aircraftType,
        "cargo": row?.cargo,
        "volumey": row?.volumey
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

    const fileName = 'vessel-master.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
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