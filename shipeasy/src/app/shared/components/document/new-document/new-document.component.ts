import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { BatchService } from 'src/app/services/Batch/batch.service'; 
import { ActivatedRoute, Router } from '@angular/router';
import { ApiSharedService } from '../../api-service/api-shared.service';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/services/common/common.service';
import { ModalDismissReasons, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'src/environments/environment';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Location } from '@angular/common';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { CognitoService } from 'src/app/services/cognito.service';
import { AddsystemtypeComponent } from '../../system-type/addsystemtype/addsystemtype.component';

@Component({
  selector: 'app-new-document',
  templateUrl: './new-document.component.html',
  styleUrls: ['./new-document.component.scss'],
})
export class NewDocumentComponent implements OnInit , OnDestroy {
  @Input() component: any;
  @Input() refId: any;
  @Input() documentData: any;
  @Input() type :any
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
    private modalService: NgbModal,private cognito : CognitoService,
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
      remarks:[''],
      documentURL: [''],
      refType: [''],
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
  checkValidation(){
    if(this.type === 'buyer'){
      this.docForm.controls['documentType'].clearValidators();
      this.docForm.controls['tags'].clearValidators();

      this.docForm.controls['documentType'].updateValueAndValidity();
      this.docForm.controls['tags'].updateValueAndValidity();
    }
    
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
                refType: '',
                documentId: '',
                refId: this.params['id'],
                isActive: true,
                
                "tenantId": this.tenantId,
                addressId: '',
                createdDate: '',
                createdBy: 'diabosadmin@yopmail.com',
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

  // downloadFile(doc) {
  //   // this.commonService.downloadpdf(doc.documentURL, doc.documentName)
  //   this.commonService.downloadDocuments('downloadfile',doc.documentURL).subscribe(
  //     (fileData: Blob) => { 
  //       this.commonService.downloadDocumentsFile(fileData,doc.documentURL);
  //       // this.commonService.DocumentPreview(fileData, doc.documentURL);
  //     },
  //     (error) => {
  //       console.error(error);
  //     }
  //   );
  // }
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
    // this.docForm.get('documentName').setValue(filename);
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

   

    
    if(this.type === 'document'){
      
      data['documentType'] = this.documentTypeList.filter((x) => x?.systemtypeId === this.docForm.get('documentType').value)
      [0]?.typeName;
        data['documentStatusId'] = this.docForm.get('documentType').value;
      data['tags'] = [this.docForm.value.tags];

      if(this.documentData?.length){
        if(this.documentData.find(t=>t?.documentType===data['documentType'])){
          this.notification.create('error', "Already Exist", '');
          return;
        }
      }
    }
    else{
      data['documentType'] = 'Buyer Document'
    }
    if (this.docForm.invalid) {
      return;
    }  

    const filename = data.documentName + this.extension;
    const formData = new FormData();
    formData.append('file',  this.doc ,  filename); 
    formData.append('name', filename);
    
     await this.commonService.uploadDocuments('uploadfile',formData).subscribe((res)=>{

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

    },error => {
      this.notification.create('error', 'Failed to upload the document.', '');
    });

    // var file = await this.commonService.uploadFile(this.doc, filename, 'batch');
  
  }
  checkDocUploaded() {
    if (this.documentTableData.filter((x) => x.documentStatus  ).length > 0) {
      return false
    } else { return true }
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
    must['typeCategory']= 'documentType'
    must['status']= true

  
    if (this.isExport) {
      must["$and"] = [
        {
          "processType": {
            "$ne":  'import',
          }
        }
      ]
    } 
    else {
      must["$and"] = [
        {
          "processType": {
            "$ne":  'export',
          }
        }
      ]
    }


    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = must


    this.commonService.getSTList("systemtype", payload)?.subscribe((res: any) => {

      this.addSystemType = res?.documents.filter(x => x.typeCategory === "documentType");
      this.documentTypeList = res?.documents.filter(x => x.typeCategory === "documentType");
      this.documentTypeList?.map((element, index) => {
        // let documentData = (this.documentData??[]).find((x) => x?.documentStatusId === element?.systemtypeId);
          // if(documentData){
          //   element['isUplaoded']=true;
          // }
          this.documentTableData.push({
            // documentName: documentData?.documentName??'',
            documentName : '',
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
            documentStatus:false,
            "tenantId": this.tenantId,
            addressId: '',
            // createdDate:documentData?.createdDate??'',
            createdDate : '',
            updatedDate: '',
          })
        //  return element;
      })
      
      // ?.filter(doc=>!doc?.isUplaoded);
    });


  }


  uploadDocument() {
  
    if(this.type === 'buyer'){
      this.submitted = true;
      var data = this.docForm.value;
      if(this.type === 'document'){
        data['documentType'] = this.documentTypeList.filter((x) => x?.systemtypeId === this.docForm.get('documentType').value)
        [0]?.typeName,
          data['documentStatusId'] = this.docForm.get('documentType').value;
        data['tags'] = [this.docForm.value.tags];
      }
      else{
        data['documentType'] = 'Buyer Document'
      }

      if (this.docForm.invalid) {
        return;
      }

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
            documentStatus: true,
            isEmailDocument: true,
            batchNo: this.batchDetail?.batchNo
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
        // x = [x];
        this.commonService.addToST('document',{...x,isEmailDocument : true,
          batchNo: this.batchDetail?.batchNo}).subscribe(
          (res) => {
            if (res) {
              this.getList.emit(res);
              this.onSave();
            }
          },
          (error) => {
            this.notification.create('error',error?.error?.error?.message, '');
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
 hidemainPopup : boolean = true;
  openSystemtypeMaster() {

    this.hidemainPopup=false
    this.modalRef = this.modalService.open(AddsystemtypeComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg'
    });
    this.modalRef.componentInstance.isPopup = true;
    this.modalRef.componentInstance.getList.subscribe((res: any) => {
      this.hidemainPopup=true;
      if (res) {
        this.getSystemTypeDropDowns();  
      }
      this.modalRef.dismiss()
    })
  }
}
