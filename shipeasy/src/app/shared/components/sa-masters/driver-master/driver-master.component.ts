import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from 'src/app/services/common/common.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
import { LoaderService } from 'src/app/services/loader.service';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { CognitoService } from 'src/app/services/cognito.service';

@Component({
  selector: 'app-driver-master',
  templateUrl: './driver-master.component.html',
  styleUrls: ['./driver-master.component.scss']
})
export class DriverMasterComponent implements OnInit {
  _gc = GlobalConstants;
  @Input() driverMaster: any;

  submitted: boolean = false;
  addDriverForm: FormGroup;
  tenantId: number;
  idToUpdate: string;
  dataSource = new MatTableDataSource<any>();
  pageNumber = 1;
  pageSize = 10;
  from = 0;
  closeResult: string;
  totalCount = 0;
  search_status: string
  search_driverLicenseNumber: string
  search_driverContactNumber: string
  search_driverName: string
  count: any
  toalLength: any
  // sort1: any
  driverData: any
  show: string;
  driver: string
  driverContactNumber: any
  driverLicenseNumber: any
  
  driverSecondaryNumber:any
  driverEmailId:any
  driverName: string
  toggleFilters = true;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort1!: MatSort;

  filtersModel = [];
  filterKeys = {};
  displayedColumns = [
    '#',
    'action',
    'driverName',
    'driverContactNumber',
    'driverLicenseNumber',
    'status',
  ];
  displayedColumns1 = this.displayedColumns.map((x, i) => x + '_' + i);
  smartAgentDetail: any;
  currentLogin: any;
  getCognitoUserDetail: any;
  driverRoles: any;

  constructor(
    private modalService: NgbModal,
    private commonService: CommonService,
    private notification: NzNotificationService,
    public loaderService: LoaderService,
    private commonFunction :CommonFunctions,
    private fb: FormBuilder,private cognito : CognitoService
  ) {
    this.currentLogin = this.commonFunction.getUserType1() 
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.getCognitoUserDetail = resp?.userData 
      }
    })
   }

  ngOnInit(): void {
    this.getRoleList()
    this.getData();
    this.formBuild()
    this.getShippingLineDropDowns()

  }
  getRoleList() { 
    let payload = this.commonService.filterList()
    if(payload)payload.query = { 
      roleName : 'Driver',
      orgId: this.commonFunction.getAgentDetails()?.orgId
     }
     if(payload)payload.sort = {
      "desc" : ["updatedOn"]
   }
  
    this.commonService.getSTList('role', payload)?.subscribe((data) => {
      this.driverRoles = data.documents?.map((x)=> {
        return {
          roleName: x.roleName,
          roleId : x.roleId
        }
      });
    });
  }
  formBuild() {
    this.addDriverForm = this.fb.group({
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

  isViewMode: boolean = false;
  open(content, driver?: any, show?: string) {
    this.isViewMode = show === 'show'; // Set view mode based on the 'show' parameter

    // Reset the form when opening for a new entry
    this.addDriverForm.reset();

    if (driver) {
      // Edit mode: populate form with existing driver data
      this.idToUpdate = driver.driverId;

      this.addDriverForm.patchValue({
        carrierId: driver?.carrierId || '',
        driverName: driver.driverName || '',
        driverContactNumber: driver.driverContactNumber || '',
        driverLicenseNumber: driver.driverLicenseNumber || '',
        driverSecondaryNumber: driver.driverSecondaryNumber || '',
        driverEmailId: driver.driverEmailId || '',
        status: driver?.status || true,
        licenseDocumentId: driver.licenseDocumentId || "",
        licenseDocumentName: driver?.licenseDocumentName || '',
        idProofDocumentId: driver?.idProofDocumentId || "",
        idProofDocumentName: driver?.idProofDocumentName || '',
        completeVerification: driver?.completeVerification || false,
        createUser: driver?.createUser || false,
      });

      // Enable or disable the form based on view mode
      if (this.isViewMode) {
        this.addDriverForm.disable();
      } else {
        this.addDriverForm.enable();
      }
    } else {
      // New entry (add mode): ensure the form is enabled
      this.addDriverForm.enable();
    }

    // Open the modal dialog
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }


  createUser(data) {
    if(this.driverRoles.length == 0){
      this.notification.create(
        'error',
        `We can't create user. Please Create Driver role in role master`,
        ''
      );
      return false
    }
    let payload = {
      "tenantId": this.tenantId,
      "orgId": this.commonFunction.getAgentDetails().orgId,
      "agentId": '1',
      "name": data?.driverName,
      "userName": data?.driverName?.replace(/\s+/g, ''),
      "userLastname": '',
      "shortName": '',
      "officeLocation": '',
      "userEmail": data?.driverEmailId,
      // "password": this.userForm.controls.password.value,
      "phoneNo": 0,
      "userLogin": data?.driverName?.replace(/\s+/g, ''),
      "department": [],
      "agent": '',
      "principle": '',
      "defaultPrinciple": '',
      "agentBranch": '',
      "agentBranchName": '',
      "superUser": true,
      "jmbFAS": false,
      "exportBackDate": false,
      "importBackDate": false,
      "agencyInvoice": false,
      "exRateEditable": false,
      "userType": "driver",
      "driverName" : data?.driverName,
      "driverId": data?.driverId,
      "roles": this.driverRoles  ||[],
      "userStatus": true,
      "status": true,
      isEmail: false,
      isMobile: false,
      isPassword: false,
      "userId": data?.driverId,
      "createdDate": new Date(),
      "updatedDate": new Date()
    };


    this.commonService.addToST(`user`, payload)?.subscribe(res => {
      if (res) {
        // this.notification.create(
        //   'success',
        //   'User Created Successfully',
        //   ''
        // );
      }
    });



  }

  onSave() {
    this.modalService.dismissAll();
    this.submitted = false;
    this.idToUpdate = null;
    this.addDriverForm.reset();
    this.submitted = false;
    return null;
  }
  hideCreatedUser: boolean = false;
  shippinglineData:any = [];
  getShippingLineDropDowns() {

    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true,
      "ShipmentTypeName": 'Land',
    }

    this.commonService
      ?.getSTList('shippingline', payload)
      ?.subscribe((res: any) => { 
        this.shippinglineData  = res?.documents 
      });
  }

  onSaveDriverMaster() {
    this.submitted = true;
    if (this.addDriverForm.invalid) {

      return;
    }
    const dataupdate = this.addDriverForm.value
    dataupdate.tenantId = this.tenantId
      dataupdate.status = true 
      dataupdate.carrierName = this.shippinglineData?.filter((x)=> x.shippinglineId == dataupdate.carrierId)[0]?.name

    if (!this.idToUpdate) {
      dataupdate.driverId = this.idToUpdate
      this.commonService.addToST('driver', dataupdate).subscribe(
        (res: any) => {
          if (res) {
            setTimeout(() => {
              this.notification.create('success', 'Added Successfully', '');

                if (this.addDriverForm?.get('createUser').value) {
                  this.createUser(res)
                }
              this.onSave();
              this.getData();
            }, 1000);
          }
        },
        (error) => {
          this.notification.create('error', error?.error?.error?.message, '');
          this.onSave();
        }
      );
    } else {
      let newDriver = { ...dataupdate, driverId: this.idToUpdate };
      this.commonService.UpdateToST(`driver/${newDriver.driverId}`, newDriver).subscribe(
        (res: any) => {
          if (res) {
            setTimeout(() => {
              this.notification.create('success', 'Updated Successfully', '');
              
              if(!this.hideCreatedUser){
                if (this.addDriverForm?.get('createUser').value) {
                  this.createUser(res)
                }
              }
              
              this.onSave();
              this.getData();
            }, 1000);
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
    }
  }
  getData() {
    this.loaderService.showcircle();
    let payload = this.commonService.filterList()
    if(payload?.size)payload.size = this.pageSize,
      payload.from = this.from
    let mustArray = {};
    this.search_driverName = this.search_driverName?.trim();
    this.search_driverLicenseNumber = this.search_driverLicenseNumber?.trim();
    this.search_driverContactNumber = this.search_driverContactNumber?.trim();
    this.search_status = this.search_status?.trim();
    if (this.search_driverName) {
      mustArray['driverName'] = {
        "$regex": this.search_driverName,
        "$options": "i"
      }
    }
    if (this.search_driverLicenseNumber) {
      mustArray['driverLicenseNumber'] = {
        "$regex": this.search_driverLicenseNumber,
        "$options": "i"
      }
    }
    if (this.search_driverContactNumber) {
      mustArray['driverContactNumber'] = {
        "$regex": this.search_driverContactNumber,
        "$options": "i"
      }
    }
    if (this.search_status) {
      mustArray['status'] = this.search_status === 'true' ? true : false
    }

    if(payload?.sort)payload.sort = {
      "desc": ["updatedOn"]
    }
    if(payload?.query)payload.query = mustArray
    if(payload?.sort)payload.sort = {
      "desc": ["updatedOn"]
    }
    if(this.currentLogin === 'transporter'){
      mustArray['carrierId'] = this.getCognitoUserDetail?.driverId 
    }

    //  payload.size = Number(this.size)
    //  payload.from = 0,
    this.commonService.getSTList('driver', payload)?.subscribe((res: any) => {
      this.driverData = res.documents;

      if (res && res?.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1,
          driverName: s.driverName,
          driverContactNumber: s.driverContactNumber,
          driverLicenseNumber: s.driverLicenseNumber,
          status: s.status

        }));
        // this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1;
        this.toalLength = res.totalCount;
        this.count = res.documents.length;
        this.loaderService.hidecircle();
      }
    }, () => {
      this.loaderService.hidecircle();
    });

  }
  get f() {
    return this.addDriverForm.controls;
  }
  onPageChange(event) {
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.from = event.pageIndex * event.pageSize;
    this.getData();
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();


    this.dataSource.filterPredicate = (data, filter) => {
      return JSON.stringify(data).toLowerCase().includes(filter);
    };

    this.dataSource.filter = filterValue;
  }

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.driverData.map((row: any) => {
      storeEnquiryData.push({
        'Driver Name': row.driverName,
        'Driver Contact Number': row.driverContactNumber,
        'Driver License Number': row.driverLicenseNumber,
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

    const fileName = 'driver.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  openPDF() {
    const prepare = [];
    this.driverData.forEach(e => {
      let tempObj = [];
      // tempObj.push(e.driver);
      tempObj.push(e.driverName);
      tempObj.push(e.driverLicenseNumber);
      tempObj.push(e.driverContactNumber);
      tempObj.push(e.status ? "Active" : "Inactive");
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [297, 210]);
    autoTable(doc, {
      head: [['Driver Name', 'Driver License Number', 'Driver Contact Number', 'Status']],
      body: prepare,
      didDrawCell: (data) => {
        // Draw border lines for each cell
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'S');
      }
    });
    doc.save('driver' + '.pdf');
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

  delete(deletedriver, id) {
    this.modalService
      .open(deletedriver, {
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
            let data = 'driver' + id.driverId
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

  clearFilters() {
    this.filtersModel = [];
    this.filterKeys = {};
    this.getData();
  }

  clear() {
    this.driver = '';
    this.driverName = '';
    this.driverContactNumber = '';
    this.driverLicenseNumber = '';
    this.driverEmailId='';
    this.driverSecondaryNumber ='';
    this.getData();
  }
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
        carrierId : this.getCognitoUserDetail?.driverId
      }
    }
    this.commonService.getSTList('driver', payload).subscribe((data) => {
      this.driverData = data.documents;
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

  changeStatus(data) {
    this.commonService.UpdateToST(`driver/${data.driverId}`, { ...data, status: !data?.status })
      .subscribe(
        (res: any) => {
          if (res) {
            this.notification.create(
              'success',
              'Status Updated Successfully',
              ''
            );
            setTimeout(() => {
              this.onSave();
              this.getData();
            }, 1000);
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
  }
  extension: any;
  fileTypeNotMatched: boolean;
  doc: File;

  onFileSelected(event, type) {
    let filename = event.target.value.replace('C:\\fakepath\\', '');

    this.addDriverForm.get(`${type}DocumentName`)?.setValue(filename);
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
    var data = this.addDriverForm.value;
    var filename = data.documentName + this.extension;
    const formData = new FormData();
    formData.append('file', this.doc, `bookingUpload-${this.doc.name}`);
    formData.append('name', `bookingUpload-${this.doc.name}`);

    let file = await this.commonService.uploadDocuments('uploadfile', formData).subscribe();
    if (file) {
      data.documentURL = `${this.doc.name}`;
      if (this.addDriverForm.invalid) {
      } else {
        this.submitted = false;
        if (!data.documentName?.includes(this.extension)) {
          data.documentName = filename;
        }
        delete data.Doc;
        this.addDriverForm.reset();
      }
    }
  }

  downloadFile(type) {
    this.commonService.downloadDocuments('downloadfile', this.addDriverForm.value?.[`${type}DocumentName`]).subscribe(
      (fileData: Blob) => {
        this.commonService.downloadDocumentsFile(fileData, this.addDriverForm.value?.[`${type}DocumentName`]);
      },
      (error) => {
        console.error(error);
      }
    );
  }
  async uploadDocument(type) {
    if (!this.doc) return;
    const formData = new FormData();
    formData.append('file', this.doc, `${this.doc.name}`);
    formData.append('name', `${this.doc.name}`);

    await this.commonService.uploadDocuments('uploadfile', formData).subscribe(async (res) => {
      if (res) {
        let payload = {
          Doc: this.addDriverForm?.value?.Doc,
          documentType: 'fdvcre4gtr',
          documentName: res.name,
          documentURL: res?.name,
          driverId: this.driverMaster?.driverId,
          documentStatus: true
        }
        await this.commonService.addToST('document', payload).subscribe(
          (res) => {
            if (res) {
              this.notification.create('success', 'Saved Successfully', '');
              this.doc = null;
              this.addDriverForm.get(`${type}DocumentId`)?.setValue(res?.documentId);
              this.addDriverForm.get(`${type}DocumentName`)?.setValue(payload?.documentName);
            }
          },
          (error) => {
            this.notification.create('error', 'Failed to upload the document.', '');
          }
        );
      }
    });


  }

  documentPreview(type) {
    this.commonService.downloadDocuments('downloadfile', this.addDriverForm.value?.[`${type}DocumentName`])?.subscribe(
      (res: Blob) => {
        const fileType = this.addDriverForm.value?.[`${type}DocumentName`].split('.').pop().toLowerCase();
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
            let documentId = this.addDriverForm.value?.[`${type}DocumentId`];
            if (documentId) {
              let data = `document/${documentId}`;
              this.commonService.deleteST(data).subscribe((res: any) => {
                if (res) {
                  this.clearDocument(type);
                  this.addDriverForm.get(`${type}DocumentName`).setValue('')
                  this.notification.create('success', 'Deleted successfully', '');
                }
              });
            } else {
              // If there's no document ID, just clear the form values
              this.clearDocument(type);
              this.addDriverForm.get(`${type}DocumentName`).setValue('')
              this.notification.create('success', 'Deleted successfully', '');
            }
          }
        }
      );
  }

  clearDocument(type) {
    this.addDriverForm.get(`${type}DocumentName`)?.setValue('');
    this.addDriverForm.get(`${type}DocumentId`)?.setValue('');
  }
}
