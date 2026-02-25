import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { BatchService } from 'src/app/services/Batch/batch.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/services/common/common.service';
import { ModalDismissReasons, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'src/environments/environment';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Location } from '@angular/common';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { CognitoService } from 'src/app/services/cognito.service';
import { ApiSharedService } from 'src/app/shared/components/api-service/api-shared.service';
import { AddsystemtypeComponent } from 'src/app/shared/components/system-type/addsystemtype/addsystemtype.component';
import { v4 as uuidv4 } from 'uuid'; // Add this import

@Component({
  selector: 'app-new-ware-house-doucment',
  templateUrl: './new-ware-house-doucment.component.html',
  styleUrls: ['./new-ware-house-doucment.component.scss']
})
export class NewWareHouseDoucmentComponent implements OnInit {

  @Input() component: any;
  @Input() refId: any;
  @Input() documentData: any;
  @Input() type: any
  @Output() getList = new EventEmitter<any>();
  documentTableData: any = Array<any>();
  closeResult: string;

  docForm: FormGroup;
  D = new Date();
  currentDate: any =
    this.D.getDate() + '/' + this.D.getMonth() + '/' + this.D.getFullYear();
  base64Output: any;
  doc: File;
  submitted: boolean;
  fileTypeNotMatched: boolean;
  userData: any;
  urlParam: any;
  isSelected: boolean = false;
  extension: any;
  docData: any = [];
  private ngUnsubscribe = new Subject<void>();
  status: boolean = false;
  params: any;
  documentTypeList: any = [];
  documentTypeList1: any = [];
  addSystemType: any;
  isExport: boolean = false;
  tenantId: any;
  batchDetail: any;
  currentUrl: string;
  show: boolean = false;

  constructor(
    private location: Location,
    private fb: FormBuilder,
    private profileservice: ProfilesService,
    private batchService: BatchService,
    private route: ActivatedRoute,
    public api: ApiSharedService,
    private commonService: CommonService,
    private modalService: NgbModal,
    private cognito: CognitoService,
    private notification: NzNotificationService,
    private sortPipe: OrderByPipe,
    private commonfunction: CommonFunctions,
    private router: Router
  ) {
    this.isExport = localStorage.getItem('isExport') === 'false' ? false : true
    const getLastChild = (route) => {
      let child = route;
      while (child.firstChild) {
        child = child.firstChild;
      }
      return child;
    };
    const primary = this.route.snapshot.root;
    const lastChild = getLastChild(primary);
    this.params = lastChild.params;
    this.route.params.subscribe((params) => (this.urlParam = params));
  }

  sort(array, key) {
    return this.sortPipe.transform(array, key);
  }

  getBatchById() {
    let payload = this.commonService.filterList()
    payload.query = {
      batchId: this.params['id']
    }

    this.commonService
      .getSTList('batch', payload)
      .subscribe((res: any) => {
        this.batchDetail = res?.documents[0];
      });
  }

  ngOnInit(): void {
    this.userData = this.profileservice.getCurrentAgentDetails();
    this.formBuild();
    this.getSystemTypeDropDowns()
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.tenantId = resp.tenantId
      }
    })
    this.currentUrl = this.router.url.split('?')[0].split('/')[3]
    if (this.currentUrl === 'show') {
      this.show = true
    }
  }

  formBuild() {
    this.docForm = this.fb.group({
      documentName: ['', Validators.required],
      documentType: ['', Validators.required],
      tags: [[], Validators.required],
      Doc: ['', Validators.required],
      remarks: [''],
      documentURL: [''],
      refType: ['warehouse'],
      tenantId: ['1'],
      documentId: [''],
      documentStatusId: [''],
      refId: this.params['id'],
      isActive: true,
      orgId: this.commonfunction.getAgentDetails()?.orgId,
      addressId: [''],
      createdDate: [this.currentDate],
      createdBy: ['diabosadmin@yopmail.com'],
      updatedDate: [''],
      updatedBy: [''],
    });
    this.checkValidation()
  }

  checkValidation() {
    if (this.type === 'buyer') {
      this.docForm.controls['documentType'].clearValidators();
      this.docForm.controls['tags'].clearValidators();

      this.docForm.controls['documentType'].updateValueAndValidity();
      this.docForm.controls['tags'].updateValueAndValidity();
    }
  }

  // Method to generate unique document name
  private generateUniqueDocumentName(originalName: string, extension: string): string {
    const uniqueId = uuidv4();
    const nameWithoutExt = originalName.replace(extension, '');
    return `${nameWithoutExt}_${uniqueId}${extension}`;
  }

  removeRow(content1, data) {
    this.modalService
      .open(content1, {
        backdrop: 'static',
        keyboard: false,
        centered: true,
        size: 'sm',
        ariaLabelledBy: 'modal-basic-title',
      })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
          this.documentTableData.map((element, i) => {
            if (element?.documentStatusId === data?.documentStatusId) {
              this.documentTableData[i] = {
                documentName: '',
                documentType: element?.documentType,
                documentStatusId: element?.documentStatusId,
                typeId: element?.typeId,
                tags: [],
                Doc: '',
                documentURL: '',
                refType: 'warehouse',
                documentId: '',
                refId: this.params['id'],
                isActive: true,
                "tenantId": this.tenantId,
                addressId: '',
                createdDate: '',
                updatedDate: '',
                updatedBy: '',
                documentStatus: false,
              };

              this.documentTypeList.push(this.addSystemType.filter((x) => x?.systemtypeId === data?.documentStatusId)[0])
            }
          });
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

  downloadFile(doc) {
    this.commonService.downloadDocuments('downloadfile', doc.documentName).subscribe(
      (fileData: Blob) => {
        if (fileData) {
          this.commonService.downloadDocumentsFile(fileData, doc.documentName);
        } else {
          console.error('No file data received');
        }
      },
      (error) => {
        console.error('File download error', error);
      }
    );
  }

  documentPreview(doc) {
    // this.commonService.DocumentPreview(doc.documentURL, doc.documentName);
  }

  onFileSelected(event) {
    let filename = event.target.value.replace('C:\\fakepath\\', '');
    this.extension = filename.substr(filename.lastIndexOf('.')).toLowerCase();

    // List of allowed extensions
    const allowedExtensions = ['.xls', '.xlsx', '.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.csv'];

    if (allowedExtensions.includes(this.extension)) {
      this.fileTypeNotMatched = false;
      this.doc = event.target.files[0];
    } else {
      this.fileTypeNotMatched = true;
      this.base64Output = '';
      this.docForm.get('documentURL').setValue('');
      this.docForm.get('Doc').setValue('');
    }
  }

  async addDocument() {
    this.submitted = true;
    const data = this.docForm.value;

    if (this.type === 'document') {
      data['documentType'] = this.documentTypeList.filter((x) => x?.systemtypeId === this.docForm.get('documentType').value)[0]?.typeName;
      data['documentStatusId'] = this.docForm.get('documentType').value;
      data['tags'] = [this.docForm.value.tags];

      if (this.documentData?.length) {
        if (this.documentData.find(t => t?.documentType === data['documentType'])) {
          this.notification.create('error', "Already Exist", '');
          return;
        }
      }
    }
    else {
      data['documentType'] = 'Buyer Document'
    }

    if (this.docForm.invalid) {
      return;
    }

    // Use simple filename without UUID
    const filename = data.documentName + this.extension;

    const formData = new FormData();
    formData.append('file', this.doc, filename);
    formData.append('name', filename);

    await this.commonService.uploadDocuments('uploadfile', formData).subscribe((res) => {
      if (res) {
        data.documentURL = res.name;
        this.submitted = false;

        if (!data.documentName.includes(this.extension)) {
          data.documentName = filename;
        }

        delete data.Doc;
        data.createdDate = this.currentDate;

        this.documentTableData.map((type, i) => {
          if (type?.documentType === data.documentType) {
            this.documentTableData[i] = { ...data, documentStatus: true };
            this.documentTypeList = this.documentTypeList?.filter(x => x.systemtypeId !== data?.documentStatusId);
            this.status = true;
          }
        });

        this.docForm.reset();
        this.formBuild();
      }
    }, error => {
      this.notification.create('error', 'Failed to upload the document.', '');
    });
  }

  checkDocUploaded() {
    if (this.documentTableData.filter((x) => x.documentStatus).length > 0) {
      return false
    } else {
      return true
    }
  }

  onSave() {
    this.submitted = false;
    this.docForm.reset();
    this.formBuild();
    this.modalService.dismissAll();
    return null;
  }

  selectDocument(doc: any, e: any) {
    if (e.target.checked) {
      this.docData.push(doc);
    } else {
      this.docData.splice(
        this.docData.findIndex((a) => a.documentName === doc.documentName),
        1
      );
    }
    this.docData.length !== 0 ? (this.status = true) : (this.status = false);
  }

  allSelect() {
    this.isSelected = !this.isSelected;
    if (this.isSelected) {
      this.docData.push(this.documentTableData);
      this.status = true;
    } else {
      this.docData.length = 0;
      this.status = false;
    }
  }

  getSystemTypeDropDowns() {
    this.documentTableData = [];
    let must = {};
    must['typeCategory'] = 'wareHouse'
    must['status'] = true

    if (this.isExport) {
      must["$and"] = [
        {
          "processType": {
            "$ne": 'import',
          }
        }
      ]
    }
    else {
      must["$and"] = [
        {
          "processType": {
            "$ne": 'export',
          }
        }
      ]
    }

    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = must

    this.commonService.getSTList("systemtype", payload)?.subscribe((res: any) => {
      this.documentTypeList = res?.documents.filter(x => x.typeCategory === "wareHouse");
      this.documentTypeList?.map((element, index) => {
        this.documentTableData.push({
          documentName: '',
          documentType: element?.typeName,
          documentStatusId: element?.systemtypeId,
          typeId: element?.systemtypeId,
          tags: [],
          Doc: '',
          documentURL: '',
          refType: '',
          documentId: '',
          refId: this.params['id'],
          isActive: true,
          documentStatus: false,
          "tenantId": this.tenantId,
          addressId: '',
          createdDate: '',
          updatedDate: '',
        })
      })
    });
  }

  uploadDocument() {
    if (this.type === 'buyer') {
      this.submitted = true;
      var data = this.docForm.value;

      if (this.type === 'document') {
        data['wareHouse'] = this.documentTypeList.filter((x) => x?.systemtypeId === this.docForm.get('wareHouse').value)[0]?.typeName,
          data['documentStatusId'] = this.docForm.get('wareHouse').value;
        data['tags'] = [this.docForm.value.tags];
      }
      else {
        data['wareHouse'] = 'Buyer Document'
      }

      if (this.docForm.invalid) {
        return;
      }

      // Use simple filename without UUID
      var filename = data.documentName + this.extension;

      const formData = new FormData();
      formData.append('file', this.doc, filename);
      formData.append('name', filename);

      // Wait for upload to complete and get the response
      this.commonService.uploadDocuments('uploadfile', formData).subscribe((res) => {
        if (res) {
          // Set documentURL from upload response
          data.documentURL = res.name;

          let payload = {
            ...data,
            documentName: filename,
            documentURL: res.name,
            documentStatus: true,
            isEmailDocument: true,
            refType: 'wareHouse',
            refId: this.params['id'],
          }

          // Now save to database with documentURL populated
          this.commonService.addToST('document', payload).subscribe(
            (res) => {
              if (res) {
                this.notification.create('success', 'Saved Successfully', '');
                this.getList.emit(res);
                this.onSave();
              }
            },
            (error) => {
              this.notification.create('error', 'Failed to save the document.', '');
            }
          );
        }
      }, error => {
        this.notification.create('error', 'Failed to upload the document.', '');
      });
    }
    else {
      this.documentTableData.filter((x) => {
        if (!x?.documentStatus)
          return false

        this.commonService.addToST('document', {
          ...x,
          isEmailDocument: true,
          batchNo: this.batchDetail?.batchNo
        }).subscribe(
          (res) => {
            if (res) {
              this.getList.emit(res);
              this.onSave();
            }
          },
          (error) => {
            this.notification.create('error', error?.error?.error?.message, '');
          }
        );
      });
      this.notification.create('success', 'Saved Successfully', '');
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  get f() {
    return this.docForm.controls;
  }

  private modalRef: NgbModalRef;
  hidemainPopup: boolean = true;

  openSystemtypeMaster() {
    this.hidemainPopup = false
    this.modalRef = this.modalService.open(AddsystemtypeComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg'
    });
    this.modalRef.componentInstance.isPopup = true;
    this.modalRef.componentInstance.getList.subscribe((res: any) => {
      this.hidemainPopup = true;
      if (res) {
        this.getSystemTypeDropDowns();
      }
      this.modalRef.dismiss()
    })
  }
}