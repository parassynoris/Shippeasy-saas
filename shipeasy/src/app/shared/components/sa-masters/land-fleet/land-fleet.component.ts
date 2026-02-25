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
import { SystemType } from 'src/app/models/system-type';
import { ApiService } from 'src/app/admin/principal/api.service';

@Component({
  selector: 'app-land-fleet',
  templateUrl: './land-fleet.component.html',
  styleUrls: ['./land-fleet.component.scss']
})
export class LandFleetComponent implements OnInit {
  _gc = GlobalConstants;
  modalReference: NgbModalRef;
  addVesselForm: FormGroup;
  vesseldata: Vessel[] = [];
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

  ownershipeType: any = ['Own' ,'Hire'];
  typeCarrier: any;
  vehicleType: any = [];
  vehicleLicence: any;
  Make: any;
  Model: any;
  vehicleRegistration: any;
  vehicleFuel: any = ['Petrol' ,'Disel', 'Electric'];
  maxWeight: any;
  engineNumber: any;
  weightUnit: any;

  RailCarrier: any;
  carrierCode: any;
  railCar: any;
  wagonNumber: any;
  Dimensions: any;
  Capacity: any;
  Cargo: any;
  IN_ACTIVE_FLAG: any;
  
  tenantId: any;
  yardcfs: any;
  activeButton: number = 1;
  email: any
  isAddMode: any
  isEditing: boolean = false;
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort1!: MatSort;
  displayedColumns = [
    '#',
    'action',
    'ownershipeType',
    'typeCarrier',
    'vehicleType',
    'vehicleLicence',
    'Make',
    'Model',
    'vehicleRegistration',
    'vehicleFuel',
    'maxWeight',
    'engineNumber',
    'weightUnit',
    'status'
  ];
  currentLogin: any;
  getCognitoUserDetail: any;
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
    private _api: ApiService
    
  ) {
    this.currentLogin = this.commonfunction.getUserType1() 
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.getCognitoUserDetail = resp?.userData 
      }
    })
    this.formBuild();
  }
  
  currentUrl: any
  ngOnInit(): void {
    this.getData1();
    this.getShippingLineDropDowns();
    this.getVesselType();
    this.currentUrl = window.location.href.split('?'[0].split('/').pop())
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.tenantId = resp.tenantId
      }
    })
   
  }

  getData1() {
    this.loaderService.showcircle();
    let payload = this.commonService.filterList()  
    let mustArray = {};
    
    if(this.currentLogin === 'transporter'){
      mustArray['typeCarrierId'] = this.getCognitoUserDetail?.driverId 
    } 
    payload.query = mustArray
    this.commonService.getSTList('land', payload)?.subscribe((res: any) => {
      if (res && res?.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1,
          ownershipeType: s.ownershipeType,
          typeCarrier: s.typeCarrier,
          vehicleType: s.vehicleType,
          vehicleLicence: s.vehicleLicence,
          Make: s.Make,
          Model: s.Model,
          vehicleRegistration: s.vehicleRegistration,
          vehicleFuel: s.vehicleFuel,
          maxWeight: s.maxWeight,
          engineNumber: s.engineNumber,
          weightUnit: s.weightUnit,
          status:s.status
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
  
  formBuild() {
    this.addVesselForm = this.fb.group({
      ownershipeType: ['', Validators.required],
      typeCarrier:['',Validators.required],
      vehicleType: ['', Validators.required],
      vehicleLicence: ['', Validators.required],
      Make: [''],
      Model: [''],
      vehicleRegistration:[],
      vehicleFuel:[''],
      maxWeight:[''],
      engineNumber:[''],
      weightUnit:[''],
      person:[''],
      mobileNo:[''],
      status: [true],
    });
  }
  cargoTypeList: any = [];

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
    if(this.currentLogin === 'transporter'){
      payload.query = {
        ...payload.query,
        typeCarrierId : this.getCognitoUserDetail?.driverId
      }
    }
    this.commonService?.getSTList('land', payload)?.subscribe((data) => {
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
    this.getData1()
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
 
  exportAsExcelFile() {
    const dataToExport = this.dataSource.data.map((item: any) => {
      return {
        "Ownership Type": item.ownershipeType || '',
        "Type Carrier": item.typeCarrier || '',
        "Vehicle Type": item.vehicleType || '',
        "Vehicle Licence": item.vehicleLicence || '',
        "Make": item.Make || '',
        "Model": item.Model || '',
        "Vehicle Registration": item.vehicleRegistration || '',
        "Vehicle Fuel": item.vehicleFuel || '',
        "Max Weight": item.maxWeight || '',
        "Engine Number": item.engineNumber || '',
        "Weight Unit": item.weightUnit || '',
        "Status": item.status ? 'Active' : 'Inactive',
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, 'Land-Fleet.xlsx');
  }

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
    this.ownershipeType=this.ownershipeType;
     this.typeCarrier=this.typeCarrier;
     this.vehicleType=this.vehicleType;
     this.vehicleLicence=this.vehicleLicence;
     this.Make=this.Make;
     this.Model=this.Model;
     this.vehicleRegistration=this.vehicleRegistration;
     this.vehicleFuel=this.vehicleFuel;
     this.maxWeight=this.maxWeight;
     this.engineNumber=this.engineNumber;
     this.weightUnit=this.weightUnit;
     this.IN_ACTIVE_FLAG = this.IN_ACTIVE_FLAG?.trim();

     if (this.ownershipeType) {
      mustArray['ownershipeType'] = {
        "$in": this.ownershipeType,
      }
    }
    if (this.typeCarrier) {
      mustArray['typeCarrier'] = {
        "$regex": this.typeCarrier,
        "$options": "i"
      }
    }
    // if (this.vehicleType) {
    //   mustArray['vehicleType'] = {
    //     "$regex": this.vehicleType,
    //     "$options": "i"
    //   }
    // }
    if (this.vehicleLicence) {
      mustArray['vehicleLicence'] = {
        "$in": this.vehicleLicence,
      }
    }
    if (this.Make) {
      mustArray['Make'] = {
        "$regex": this.Make,
        "$options": "i"
      }
    }
    if (this.Model) {
      mustArray['Model'] = {
        "$regex": this.Model,
        "$options": "i"
      }
    }
    if (this.vehicleRegistration) {
      mustArray['vehicleRegistration'] = {
        "$regex": this.vehicleRegistration,
        "$options": "i"
      }
    }
    if (this.vehicleFuel) {
      mustArray['vehicleFuel'] = {
        "$in": this.vehicleFuel
      }
    }
    if (this.engineNumber) {
      mustArray['engineNumber'] = {
        "$regex": this.engineNumber,
        "$options": "i"
      }
    }
    if (this.weightUnit) {
      mustArray['weightUnit'] = {
        "$regex": this.weightUnit,
        "$options": "i"
      }
    }
    if (this.IN_ACTIVE_FLAG) {
      mustArray['status'] = this.IN_ACTIVE_FLAG === 'true' ? true : false
    }

    if(this.currentLogin === 'transporter'){
      mustArray['typeCarrierId'] = this.getCognitoUserDetail?.driverId 
    }

    payload.query = mustArray
    this.commonService.getSTList('land', payload)?.subscribe((res: any) => {
      if (res && res?.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1,
          ownershipeType: s.ownershipeType,
          typeCarrier: s.typeCarrier,
          vehicleType: s.vehicleType,
          vehicleLicence: s.vehicleLicence,
          Make: s.Make,
          Model: s.Model,
          vehicleRegistration: s.vehicleRegistration,
          vehicleFuel: s.vehicleFuel,
          maxWeight: s.maxWeight,
          engineNumber: s.engineNumber,
          weightUnit: s.weightUnit,
          status:s.status
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
    this.ownershipeType=this.ownershipeType;
    this.typeCarrier=this.typeCarrier;
    this.vehicleType=this.vehicleType;
    this.vehicleLicence=this.vehicleLicence;
    this.Make=this.Make;
    this.Model=this.Model;
    this.vehicleRegistration=this.vehicleRegistration;
    this.vehicleFuel=this.vehicleFuel;
    this.maxWeight=this.maxWeight;
    this.engineNumber=this.engineNumber;
    this.weightUnit=this.weightUnit;
    this.IN_ACTIVE_FLAG = this.IN_ACTIVE_FLAG?.trim();

    if (this.ownershipeType) {
     mustArray['ownershipeType'] = {
       "$regex": this.ownershipeType,
       "$options": "i"
     }
   }
   if (this.typeCarrier) {
     mustArray['typeCarrier'] = {
       "$regex": this.typeCarrier,
       "$options": "i"
     }
   }
   if (this.vehicleType) {
     mustArray['vehicleType'] = {
       "$regex": this.vehicleType,
       "$options": "i"
     }
   }
   if (this.vehicleLicence) {
     mustArray['vehicleLicence'] = {
       "$regex": this.vehicleLicence,
       "$options": "i"
     }
   }
   if (this.Make) {
     mustArray['Make'] = {
       "$regex": this.Make,
       "$options": "i"
     }
   }
   if (this.Model) {
     mustArray['Model'] = {
       "$regex": this.Model,
       "$options": "i"
     }
   }
   if (this.vehicleRegistration) {
     mustArray['vehicleRegistration'] = {
       "$regex": this.vehicleRegistration,
       "$options": "i"
     }
   }
   if (this.vehicleFuel) {
     mustArray['vehicleFuel'] = {
       "$regex": this.vehicleFuel,
       "$options": "i"
     }
   }
   if (this.engineNumber) {
     mustArray['engineNumber'] = {
       "$regex": this.engineNumber,
       "$options": "i"
     }
   }
   if (this.weightUnit) {
     mustArray['weightUnit'] = {
       "$regex": this.weightUnit,
       "$options": "i"
     }
   }
   if (this.IN_ACTIVE_FLAG) {
    mustArray['status'] = this.IN_ACTIVE_FLAG === 'true' ? true : false
  }
  if(this.currentLogin === 'transporter'){
    mustArray['typeCarrierId'] = this.getCognitoUserDetail?.driverId 
  }
    payload.query = mustArray
    payload.size = Number(this.size)
    payload.from = this.fromSize - 1,
      this.commonService.getSTList('land', payload).subscribe((data) => {
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
    this.ownershipeType=this.ownershipeType;
     this.typeCarrier=this.typeCarrier;
     this.vehicleType=this.vehicleType;
     this.vehicleLicence=this.vehicleLicence;
     this.Make=this.Make;
     this.Model=this.Model;
     this.vehicleRegistration=this.vehicleRegistration;
     this.vehicleFuel=this.vehicleFuel;
     this.maxWeight=this.maxWeight;
     this.engineNumber=this.engineNumber;
     this.weightUnit=this.weightUnit;
     this.IN_ACTIVE_FLAG = this.IN_ACTIVE_FLAG?.trim();

     if (this.ownershipeType) {
      mustArray['ownershipeType'] = {
        "$regex": this.ownershipeType,
        "$options": "i"
      }
    }
    if (this.typeCarrier) {
      mustArray['typeCarrier'] = {
        "$regex": this.typeCarrier,
        "$options": "i"
      }
    }
    if (this.vehicleType) {
      mustArray['vehicleType'] = {
        "$regex": this.vehicleType,
        "$options": "i"
      }
    }
    if (this.vehicleLicence) {
      mustArray['vehicleLicence'] = {
        "$regex": this.vehicleLicence,
        "$options": "i"
      }
    }
    if (this.Make) {
      mustArray['Make'] = {
        "$regex": this.Make,
        "$options": "i"
      }
    }
    if (this.Model) {
      mustArray['Model'] = {
        "$regex": this.Model,
        "$options": "i"
      }
    }
    if (this.vehicleRegistration) {
      mustArray['vehicleRegistration'] = {
        "$regex": this.vehicleRegistration,
        "$options": "i"
      }
    }
    if (this.vehicleFuel) {
      mustArray['vehicleFuel'] = {
        "$regex": this.vehicleFuel,
        "$options": "i"
      }
    }
    if (this.engineNumber) {
      mustArray['engineNumber'] = {
        "$regex": this.engineNumber,
        "$options": "i"
      }
    }
    if (this.weightUnit) {
      mustArray['weightUnit'] = {
        "$regex": this.weightUnit,
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
    payload.from = this.fromSize - 1

    if(this.currentLogin === 'transporter'){
      payload.query = {
        ...payload.query,
        typeCarrierId : this.getCognitoUserDetail?.driverId
      }
    }
      this.commonService.getSTList('land', payload).subscribe((data) => {
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
    this.wagonNumber = ""
    this.Capacity = ""
    this.RailCarrier = ""
    this.carrierCode = ""
    this.carrierCode = ""
    this.Cargo = ""
    this.Dimensions = ""
    this.getData1();
  }

  shippinglineData:any = [];
  getShippingLineDropDowns() {

    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true,
      "ShipmentTypeName": 'Land',
    }

    this._api
      ?.getSTList('shippingline', payload)
      ?.subscribe((res: any) => { 
        this.shippinglineData  = res?.documents 
      });
  }


  getVesselType() {
    let payload = this.commonService.filterList()
    payload.query = {
      typeCategory: 'truckType',
      "status": true
    }
    this.commonService.getSTList('systemtype', payload).subscribe((res: any) => {
      this.vehicleType = res?.documents?.filter(x => x.typeCategory === "truckType");
    });
  }
  airCarrierNames:any;

  isViewMode: boolean = false; 
  open(content, vessel?: any, show?: string) {
    this.isViewMode = show === 'show'; // Set view mode based on the 'show' parameter

    if (vessel) {
      this.vesselIdToUpdate = vessel.landId;
      this.addVesselForm.patchValue({
        ownershipeType: vessel.ownershipeType,
        typeCarrier: vessel.typeCarrierId,
        vehicleType: vessel.vehicleType,
        vehicleLicence: vessel.vehicleLicence,
        Make: vessel.Make,
        Model: vessel.Model,
        vehicleRegistration: vessel.vehicleRegistration,
        vehicleFuel: vessel.vehicleFuel,
        maxWeight: vessel.maxWeight,
        engineNumber: vessel.engineNumber,
        weightUnit: vessel.weightUnit,
        mobileNo: vessel.mobileNo,
        person: vessel.person,
        status: vessel.status,
      });

      if (vessel.cranes) {
        vessel.cranes.forEach(e => {
          this.addCrane(e);
        });
      }

      // Enable or disable the form based on view mode
      if (this.isViewMode) {
        this.addVesselForm.disable();
      } else {
        this.addVesselForm.enable();
      }
    } else {
      this.vesselIdToUpdate = null;
    }

    // Set carrierId if the current login is 'transporter'
    if (this.currentLogin === 'transporter') {
      this.addVesselForm.controls.typeCarrier.setValue(this.getCognitoUserDetail?.driverId);
    }

    // Open the modal dialog
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
      this.getData1();
      clearInterval(myInterval);
    }, 1000);
  }
  vehicleTypeNames:any
  vesselMasters() {
    this.submitted = true;
    if (this.addVesselForm.invalid) {
      this.notification.create('error', 'Please fill reqired fields', '');
      return;
    }
    let duplicate = 0
    if (duplicate < 1) {
      let newdata = {...this.addVesselForm.value,
        typeCarrier: this.shippinglineData?.filter((x) => x?.shippinglineId == this.addVesselForm.value.typeCarrier)[0]?.name || '',
        typeCarrierId : this.addVesselForm.value.typeCarrier
      };


      if (!this.vesselIdToUpdate) {
        this.commonService.addToST('land', newdata).subscribe(
          (res: any) => {
            if (res) {
              this.notification.create('success', 'Added Successfully', '');
              this.onSave();
              var myInterval = setInterval(() => {
                this.getData1();
                clearInterval(myInterval);
              }, 1000);
            }
          },
        );
      } else {
        let ui = { ...newdata, landId: this.vesselIdToUpdate };
        this.commonService.UpdateToST(`land/${ui.landId}`, ui).subscribe(
          (res: any) => {
            if (res) {
              this.notification.create('success', 'Updated Successfully', '');
              this.onSave();
              var myInterval = setInterval(() => {
                this.getData1();
                clearInterval(myInterval);
              }, 1000);
            }
          },
        );
      }
    }

  }


  changeStatus(data, i) {
    this.commonService.UpdateToST(`land/${data.landId}`, { ...data, status: !data?.status })
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
              this.getData1();
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

  delete(deletevessel, id) {
    this.modalService
      .open(deletevessel, {
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
            let data = 'landId' + id.landId

            this.commonService.deleteST(data).subscribe((res: any) => {
              if (res) {
                this.notification.create('success', 'Deleted Successfully', '');
                this.getData1();
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
    this.vesselIdToUpdate = null;
    this.formBuild();
    this.submitted = false;
    this.modalService.dismissAll();
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
