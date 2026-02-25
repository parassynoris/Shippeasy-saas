import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonFunctions } from '../../functions/common.function';
import { CognitoService } from 'src/app/services/cognito.service';
import { CommonService } from 'src/app/services/common/common.service';
import { LandFleetComponent } from '../sa-masters/land-fleet/land-fleet.component';
import { LoaderService } from 'src/app/services/loader.service';
import { ApiService } from 'src/app/admin/principal/api.service';

@Component({
  selector: 'app-driver-vehicle-details',
  templateUrl: './driver-vehicle-details.component.html',
  styleUrls: ['./driver-vehicle-details.component.scss']
})


export class DriverVehicleDetailsComponent implements OnInit {
  @ViewChild(MatDrawer) drawer: MatDrawer | any;
  dataSource = new MatTableDataSource();
  pagenation = [10, 20, 50, 100];
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns = [
    '#',
    'vehicleNo',
    'vehicleType',
    'driverName',
    'driverContactNumber',
    'driver1Name',
    'driver1ContactNumber'
  ];
  batchDetails: any;
  modalReference: NgbModalRef;
  batchIdToUpdate: boolean = false;
  addDriverForm: FormGroup;
  addDriverDetailsForm:FormGroup
  addVehicleForm: FormGroup;
  driverList: any = []
  ownershipeType:string [] = ['Own' ,'Hire'];
  vehicleFuel: any = ['Petrol' ,'Disel', 'Electric'];
  vehicleList: any = []
  currentLogin: any;
  getCognitoUserDetail: any;
  isTransport = false;
  vesselIdToUpdate: any;
  cranes: any;
  shippinglineData:any = []; 
  vehicleType: any;
  hideCreatedUser: boolean;
  idToUpdate: any;
  tenantId: any;
  isDisabled = true;
  extension: any;
  fileTypeNotMatched: boolean;
  doc: any;
  driverMaster: any;
  @ViewChild('AddVehicleDetails', { static: true }) addVehicleTemplate!: TemplateRef<any>;
  @ViewChild('AddState', { static: true }) addDriverTemplate!: TemplateRef<any>;
  constructor(private router: Router,
    private formBuilder: FormBuilder,
    private loaderService: LoaderService,
    private notification: NzNotificationService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private commonfunction: CommonFunctions,
    private commonService: CommonService,
    private _api: ApiService,
    private cognito: CognitoService) {
    this.formBuild()
    this.isTransport = localStorage.getItem('isTransport') === 'true' ? true : false;
    this.currentLogin = this.commonfunction.getUserType1()
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.getCognitoUserDetail = resp?.userData
      }
    })
    console.log(this.currentLogin)
    if (this.currentLogin === 'transporter') {
      this.displayedColumns = [
        '#',
        'vehicleNo',
        'vehicleType',
        'driverName',
        'driverContactNumber',
        'driver1Name',
        'driver1ContactNumber',
        'action'
      ]
    }
  }
  
  batchDetail:any

  addVehicleDetails(content:TemplateRef<any>, vessel?: any, show?) {
    // this.modalService.dismissAll();
    if (vessel) {
      this.vesselIdToUpdate = vessel.landId;
      this.addVehicleForm.patchValue({
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
          mobileNo:vessel.mobileNo,
          person:vessel.person,
          status: vessel.status,
      });
      if (vessel.cranes) {
        vessel.cranes.forEach(e => {
          this.addCrane(e)
        })
      }
      show === 'show' ? this.addVehicleForm.disable() : this.addVehicleForm.enable()
    }else{
      this.vesselIdToUpdate = null
    } 
    if(this.currentLogin === 'transporter'){ 
      this.addVehicleForm.controls.typeCarrier.setValue(this.getCognitoUserDetail?.driverId)
    }
    if(this.isTransport){ 
      this.addVehicleForm.controls.typeCarrier.setValue(this.batchDetails?.quotationDetails?.carrierId)
    }
    this.modalReferenceVehicle = this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'xl',
    });
  }
  modalReferenceVehicle:any;
  getVesselType() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      typeCategory: 'truckType',
      "status": true
    }
    this.commonService.getSTList('systemtype', payload)?.subscribe((res: any) => {
      this.vehicleType = res?.documents?.filter(x => x.typeCategory === "truckType");
    });
  }

  
  addCrane(data) {
    this.cranes.push(this.newCrane(data))
  }
  
  newCrane(data) {
    if (data) {
      return this.formBuilder.group({
        craneNo: data.craneNo,
        capacity: data.capacity,
        position: data.position,
        outreach: data.outreach,
        remarks: data.remarks
      })
    }
    else {
      return this.formBuilder.group({
        craneNo: [''],
        capacity: [''],
        position: [''],
        outreach: [''],
        remarks: ['']
      })
    }
  }
  saveVehicle() {
    this.submitted = true;
    if (this.addVehicleForm.invalid) {
      this.notification.create('error', 'Please fill reqired fields', '');
      return;
    }
    let duplicate = 0
    if (duplicate < 1) {
      let newdata = {...this.addVehicleForm.value,
        typeCarrier: this.shippinglineData?.filter((x) => x?.shippinglineId == this.addVehicleForm.value.typeCarrier)[0]?.name || '',
        typeCarrierId : this.addVehicleForm.value.typeCarrier
      };


      if (!this.vesselIdToUpdate) {
        this.commonService.addToST('land', newdata).subscribe(
          (res: any) => {
            if (res) {
              this.onSave1();
              this.notification.create('success', 'Added Successfully', '');
              var myInterval = setInterval(() => {
                this.getVehicle();
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
              this.notification.create('success', 'Updated Successfully', '');1
              this.onSave1();
              var myInterval = setInterval(() => {
                this.getVehicle();
                clearInterval(myInterval);
              }, 1000);
            }
          },
        );
      }
    }

  }
 
  onSave1() {
    this.submitted = false;
    this.vesselIdToUpdate = null;
    this.formBuild();
    this.submitted = false;
    this.modalReferenceVehicle.dismiss();
    return null;
  }


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
  ngOnInit(): void {
    this.getBatchList();
    this.getVesselType();
    this.getShippingLineDropDowns();
    // this.getVehicle();
    // this.getDriver();
  }
  formBuild() {
    this.addVehicleForm = this.formBuilder.group({
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
    this.addDriverForm = this.formBuilder.group({
      driver: ['', Validators.required],
      driver1: [''],
      vehicle: ['', Validators.required],
    });
    this.addDriverDetailsForm = this.formBuilder.group({
      carrierId : new FormControl('', Validators.required),
      driverName: new FormControl('', Validators.required),
      driverContactNumber: new FormControl('', Validators.required),
      driverLicenseNumber: new FormControl('', Validators.required),
      driverEmailId: new FormControl(''),
      driverSecondaryNumber: new FormControl(''),
      status: new FormControl(true),
      licenseDocumentName: [''],
      licenseDocumentId: [''],
      idProofDocumentName: [''],
      idProofDocumentId: [''],
      completeVerification: [false],
      createUser: [false],
      documentType: [''],
    });
  }
  getDriver() {
    let payload = this.commonService.filterList();
    if(payload?.query)payload.query = {
      status: true
    }
    console.log(this.getCognitoUserDetail, this.currentLogin)
    if (this.currentLogin === 'transporter') {
      payload.query = {
        ...payload.query,
        carrierId: this.getCognitoUserDetail?.driverId
      }
    }else{
      if(payload?.query)payload.query = {
        ...payload.query,
        carrierId: this.batchDetails?.quotationDetails?.carrierId
      }
    }
    this.commonService.getSTList('driver', payload)?.subscribe((res: any) => {
      this.driverList = res.documents;
    })
  }

  onDriverChange(value: any) {
    if (value === 'add-new-driver') {
        this.openAddDriverModal(this.addDriverTemplate);
        this.addDriverDetailsForm.get('driver')?.reset(); // Reset the selection
    }
}

openAddDriverModal(content: TemplateRef<any>) {
    this.open1(content);
}
  
  
  open1(content:TemplateRef<any>, driver?: any, show?) {
    // this.modalService.dismissAll();
    this.show = show
    this.hideCreatedUser= false
    if (driver) {
      this.idToUpdate = driver.driverId;
      this.addDriverDetailsForm.patchValue({
        carrierId :driver?.carrierId || '',
        driverName: driver.driverName || '',
        driverContactNumber: driver.driverContactNumber || '',
        driverLicenseNumber: driver.driverLicenseNumber || '',
        driverSecondaryNumber:driver.driverSecondaryNumber || '',
        driverEmailId: driver.driverEmailId || '',
        status: driver?.status || true,
        licenseDocumentId: driver.licenseDocumentId || "",
        licenseDocumentName: driver?.licenseDocumentName || '',
        idProofDocumentId: driver?.idProofDocumentId || "",
        idProofDocumentName: driver?.idProofDocumentName || '',


      });
    }
    if(this.currentLogin === 'transporter'){
      this.addDriverDetailsForm.controls.carrierId.setValue(this.getCognitoUserDetail?.driverId)
    }
    if(this.isTransport){ 
      this.addDriverDetailsForm.controls.carrierId.setValue(this.batchDetails?.quotationDetails?.carrierId)
    }
    this.modalServiceDriver =  this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }

  modalServiceDriver:any;

  // Your other properties and methods

  onVehicleChange(value: any) {
      if (value === 'add-new-vehicle') {
          this.openAddVehicleModal(this.addVehicleTemplate);
          this.addVehicleForm.get('vehicle')?.reset(); // Reset the selection
      }
  }

  openAddVehicleModal(content: TemplateRef<any>) {
      this.addVehicleDetails(content);
  }

  getVehicle() {
    let payload = this.commonService.filterList();
    if(payload?.query)payload.query = {
      status: true
    }
    if (this.currentLogin === 'transporter') {
      payload.query = {
        ...payload.query,
        typeCarrierId: this.getCognitoUserDetail?.driverId
      }
    }else{
      if(payload?.query)payload.query = {
        ...payload.query,
        typeCarrierId: this.batchDetails?.quotationDetails?.carrierId
      }
    }
    this.commonService.getSTList('land', payload)?.subscribe((res: any) => {
      this.vehicleList = res.documents;
    })
  }
  vehicleAllow :number=0;
  getBatchList() {

    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "batchId": this.route.snapshot?.params['id']
    }

    this.commonService.getSTList('batch', payload)
      ?.subscribe((data: any) => {
        this.batchDetails = data.documents[0];
        this.vehicleAllow = 0
        this.batchDetails?.enquiryDetails?.containersDetails?.filter((c)=>{
          this.vehicleAllow =+ (c.noOfContainer || 0)
        })
        console.log(this.vehicleAllow)
        this.dataSource = new MatTableDataSource(
          this.batchDetails?.vehicleDetails?.map((s: any, index) => {
            return {
              ...s,
              id: index + 1
            }
          })
        );
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1;
        this.getVehicle()
        this.getDriver()
      });
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
    const columnsToHide = ['action'];
    const actualColumns = this.displayedColumns;
    this.commonfunction.exportToExcel(
      tableColumns,
      tableData,
      columnsToHide,
      'invoice',
      this.displayedColumns,
      actualColumns
    );
  }
  show: any = ''
  open(content, data?: any, show?) {
    this.batchIdToUpdate = false;
    this.show = show
    if (data) {
      console.log(data)
      this.batchIdToUpdate = true;
      this.addDriverForm.patchValue({
        driver1: data?.driver1Id,
        driver: data?.driverId,
        vehicle: data?.vehicleId,
      });
      this.show === 'show' ? this.addDriverForm.disable() : this.addDriverForm.enable()
    } else {
      this.batchIdToUpdate = false
    }

    this.modalReference = this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }
  get f1() {
    return this.addDriverForm.controls;
  }
  onCancel() {
    this.modalService.dismissAll();
    this.getBatchList()
    this.addDriverForm.reset()
    this.submitted = false
  }
  submitted: boolean = false;
  onSave() {
    this.submitted = true
    if (this.addDriverForm.valid) {
      if (this.batchIdToUpdate) {
        if (this.batchDetails.vehicleDetails?.length > 0) {
          this.batchDetails.vehicleDetails = this.batchDetails?.vehicleDetails?.filter(vehicle => vehicle.vehicleId !== this.addDriverForm.value.vehicle);
        }
      }

      let array = [...this.batchDetails?.vehicleDetails || [],
      {
        vehicleId: this.addDriverForm.value.vehicle || '',
        vehicleNo: this.vehicleList?.filter((x) => x.landId === this.addDriverForm.value.vehicle)[0]?.vehicleLicence || '',
        vehicleType: this.vehicleList?.filter((x) => x.landId === this.addDriverForm.value.vehicle)[0]?.vehicleType || '',
        engineNumber: this.vehicleList?.filter((x) => x.landId === this.addDriverForm.value.vehicle)[0]?.engineNumber || '',
        driverId: this.addDriverForm.value.driver || '',
        driverName: this.driverList?.filter((x) => x.driverId === this.addDriverForm.value.driver)[0]?.driverName || '',
        driverContactNumber: this.driverList?.filter((x) => x.driverId === this.addDriverForm.value.driver)[0]?.driverContactNumber || '',
        driverLicenseNumber: this.driverList?.filter((x) => x.driverId === this.addDriverForm.value.driver)[0]?.driverLicenseNumber || '',
        driver1Id: this.addDriverForm.value.driver1 || '',
        driver1Name: this.driverList?.filter((x) => x.driverId === this.addDriverForm.value.driver1)[0]?.driverName || '',
        driver1ContactNumber: this.driverList?.filter((x) => x.driverId === this.addDriverForm.value.driver1)[0]?.driverContactNumber || '',
        driver1LicenseNumber: this.driverList?.filter((x) => x.driverId === this.addDriverForm.value.driver1)[0]?.driverLicenseNumber || '',

      }]

      let payload = {
        ...this.batchDetails,
        vehicleDetails: array
      };

      this.commonService.UpdateToST(`batch/${payload?.batchId}`, payload)?.subscribe((res) => {
        if (res) {
          this.submitted = false
          this.onCancel()
          this.notification.create('success', 'Update Job Status', '');
        }
      })
    } else {
      this.notification.create('error', 'Invalid Form', '');
    }
  }

  onSave2() {
    // this.modalService.dismissAll();
    this.submitted = false;
    this.idToUpdate = null;
    this.formBuild();
    this.addDriverDetailsForm.reset();
    this.submitted = false;
    this.modalServiceDriver.dismiss()
    return null;
  }

  onSaveDriverMaster() {
    this.submitted = true;
    if (this.addDriverDetailsForm.invalid) {

      return;
    }
    const dataupdate = this.addDriverDetailsForm.value 
    dataupdate.tenantId = this.tenantId
      dataupdate.status = true 
      dataupdate.carrierName = this.shippinglineData?.filter((x)=> x.shippinglineId == dataupdate.carrierId)[0]?.name

    if (!this.idToUpdate) {
      dataupdate.driverId = this.idToUpdate
      this.commonService.addToST('driver', dataupdate)?.subscribe(
        (res: any) => {
          if (res) {
            setTimeout(() => {
              this.notification.create('success', 'Added Successfully', '');
              this.onSave2();
              this.getDriver();
            }, 1000);
          }
        },
        (error) => {
          this.notification.create('error', error?.error?.error?.message, '');
          this.onSave2();
        }
      );
    } else {
      let newDriver = { ...dataupdate, driverId: this.idToUpdate };
      this.commonService.UpdateToST(`driver/${newDriver.driverId}`, newDriver)?.subscribe(
        (res: any) => {
          if (res) {
            setTimeout(() => {
              this.notification.create('success', 'Updated Successfully', '');
              
              this.onSave2();
              this.getDriver();
            }, 1000);
          }
        },
        (error) => {
          this.onSave2();
          this.notification.create('error',error?.error?.error?.message, '');
        }
      );
    }
  }
  
  onFileSelected(event, type) {
    let filename = event.target.value.replace('C:\\fakepath\\', '');

    this.addDriverDetailsForm.get(`${type}DocumentName`)?.setValue(filename);
    this.extension = filename.substr(filename.lastIndexOf('.'));
    const allowedExtensions = [
      '.xls', '.xlsx', '.pdf', '.doc', '.docx',
      '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg'
    ];
    if (allowedExtensions.includes(this.extension.toLowerCase())) {
      this.fileTypeNotMatched = false;
      this.doc = event.target.files[0];
    } else {
      this.fileTypeNotMatched = true;
    }
  }

  async addDocument() {
    this.submitted = true;
    var data = this.addDriverDetailsForm.value;
    var filename = data.documentName + this.extension;
    const formData = new FormData();
    formData.append('file', this.doc, `bookingUpload-${this.doc.name}`);
    formData.append('name', `bookingUpload-${this.doc.name}`);

    let file = await this.commonService.uploadDocuments('uploadfile', formData)?.subscribe();
    if (file) {
      data.documentURL = `${this.doc.name}`;
      if (this.addDriverDetailsForm.invalid) {
      } else {
        this.submitted = false;
        if (!data.documentName?.includes(this.extension)) {
          data.documentName = filename;
        }
        delete data.Doc;
        this.addDriverDetailsForm.reset();
      }
    }
  }


  documentPreview(type) {
    this.commonService.downloadDocuments('downloadfile', this.addDriverDetailsForm.value?.[`${type}DocumentName`])?.subscribe(
      (res: Blob) => {
        const fileType = this.addDriverDetailsForm.value?.[`${type}DocumentName`].split('.').pop().toLowerCase();
        const blob = new Blob([res], { type: this.getMimeType(fileType) });
        const temp = URL.createObjectURL(blob);

        if (fileType === 'pdf') {
          const pdfWindow = window.open(temp);
          pdfWindow.print();
        } else {
          const imageWindow = window.open('');
          imageWindow.document.write(`<img src="${temp}" alt="Document Preview">`);
        }
      },
      (error) => {
        console.error(error);
      }
    );
  }
  getMimeType(extension: string): string {
    const mimeTypes = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'bmp': 'image/bmp',
      'svg': 'image/svg+xml',
    };

    return mimeTypes[extension] || 'application/octet-stream';
  }

  downloadFile(type) {
    this.commonService.downloadDocuments('downloadfile', this.addDriverDetailsForm.value?.[`${type}DocumentName`])?.subscribe(
      (fileData: Blob) => {
        this.commonService.downloadDocumentsFile(fileData, this.addDriverDetailsForm.value?.[`${type}DocumentName`]);
      },
      (error) => {
        console.error(error);
      }
    );
  }
  deleteFile(type, content1) {
    this.modalService
      .open(content1, {
        backdrop: 'static',
        keyboard: false,
        centered: true,
        size: '',
        ariaLabelledBy: 'modal-basic-title',
      })
      .result.then(
        (result) => {
          if (result === 'yes') {
            let documentId = this.addDriverDetailsForm.value?.[`${type}DocumentId`];
            if (documentId) {
              let data = `document/${documentId}`;
              this.commonService.deleteST(data)?.subscribe((res: any) => {
                if (res) {
                  this.clearDocument(type);
                  this.addDriverDetailsForm.get(`${type}DocumentName`).setValue('')
                  this.notification.create('success', 'Deleted successfully', '');
                }
              });
            } else {
              // If there's no document ID, just clear the form values
              this.clearDocument(type);
              this.addDriverDetailsForm.get(`${type}DocumentName`).setValue('')
              this.notification.create('success', 'Deleted successfully', '');
            }
          }
        }
      );
  }
  clearDocument(type) {
    this.addDriverDetailsForm.get(`${type}DocumentName`)?.setValue('');
    this.addDriverDetailsForm.get(`${type}DocumentId`)?.setValue('');
  }

  async uploadDocument(type) {
    if (!this.doc) return;
    const formData = new FormData();
    formData.append('file', this.doc, `${this.doc.name}`);
    formData.append('name', `${this.doc.name}`);

    await this.commonService.uploadDocuments('uploadfile', formData)?.subscribe(async (res) => {
      if (res) {
        let payload = {
          Doc: this.addDriverDetailsForm?.value?.Doc,
          documentType: 'fdvcre4gtr',
          documentName: res.name,
          documentURL: res?.name,
          driverId: this.driverMaster?.driverId,
          documentStatus: true
        }
        await this.commonService.addToST('document', payload)?.subscribe(
          (res) => {
            if (res) {
              this.notification.create('success', 'Saved Successfully', '');
              this.doc = null;
              this.addDriverDetailsForm.get(`${type}DocumentId`)?.setValue(res?.documentId);
              this.addDriverDetailsForm.get(`${type}DocumentName`)?.setValue(payload?.documentName);
            }
          },
          (error) => {
            this.notification.create('error', 'Failed to upload the document.', '');
          }
        );
      }
    });


  }
}
