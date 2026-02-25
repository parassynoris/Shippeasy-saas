import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, Injectable, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/admin/principal/api.service';
import { document } from 'src/app/models/document';
import { CommonService } from 'src/app/services/common/common.service';

@Component({
  selector: 'app-mailsend',
  templateUrl: './mailsend.component.html',
  styleUrls: ['./mailsend.component.scss']
})

export class MailsendComponent implements OnInit {
  myForm: FormGroup;
  type: string = 'document';
  documentTableData: any = Array<any>();
  // documentData: document[] = [];
  selectedDocuments: document[] = [];
  submitted = false;
  extension: any;
  fileTypeNotMatched: boolean;
  base64Output: any;
  doc: File;
  selectedFileName: any[] = [];
  docForm: FormGroup;
  fileUploadCustomId: string = '';
  endpoint: string;
  isloader=false;
  batchdata:any;
  formData: FormData;
  files: File[] = [];
  @Input() refId: string;
  @Input() component: string;
  @Input() documentData: any[];
  @Input() batchId;
  fileName: any = [];
  // @Input() type: string;
  constructor(
    public modalService: NgbModal,
    private formBuilder: FormBuilder,
    public commonService: CommonService,
    private route: ActivatedRoute,
    private _api: ApiService,
    private http: HttpClient,
    private notification: NzNotificationService,
    
  ) {
    this.myForm = this.formBuilder.group({
      loopin: [''],
      to: ['', [Validators.required, Validators.email]],
      cc: [''],
      subject: ['', Validators.required],
    });
  }
  get f() { return this.myForm.controls; }
  filesToSend: any = [];

  ngOnInit() {
    if (this.documentData) {
      this.documentData.map((i) => {
        this.selectedFileName.push({
          id: i?.documentId,
          name: i?.documentName,
          type: i?.documentType,
          upload: false
        })
      })
    }
    this.getbatchData()
  }
  selectFile(file, event, id, upload, doc) {
    if (event.target.checked) {
      if(upload){
        this.fileName.push({ name: file, "content":doc?.content });
      } else {
        this.fileName.push({ name: file, "url":file });
      }
    }
    else {
      this.fileName = this.fileName.filter(x => x.id !== id)
    }
  }

  onFileSelected(event) {
    let files: FileList = event.target.files;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filename = file.name;
      const extension = filename.substr(filename.lastIndexOf('.')).toLowerCase();

      if (
        extension === '.xls' ||
        extension === '.xlsx' ||
        extension === '.pdf' ||
        extension === '.doc' ||
        extension === '.docx'
      ) {
        this.fileTypeNotMatched = false;
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result as string;
          let baseContent = base64String.split(",");
          let basecontentUrl = baseContent[1];
          this.selectedFileName.push({ name: filename, upload: true, type: 'Attached', content:basecontentUrl });
        };
        reader.readAsDataURL(file);
        // this.filesToSend.push(file);
        // this.selectedFileName.push({ name: filename, upload: true, type: 'Attached' });
      } else {
        this.fileTypeNotMatched = true;

        if (this.myForm.get('documentURL')) {
          this.myForm.get('documentURL').setValue('');
        }
        if (this.myForm.get('Doc')) {
          this.myForm.get('Doc').setValue('');
        }
      }
    }
  }
  getbatchData(){
    this.isloader=true;
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      batchId: this.batchId,
    }
    this.commonService
      .getSTList('batch', payload)?.subscribe((res: any) => {
        this.batchdata = res?.documents?.[0];
        this.isloader=false;
        if(this.batchdata){
          this.onSave();
        }
      });
  }

  onDragOver(event: any) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: any) {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer.files;
  }

  onClose() {
    this.modalService.dismissAll();
  }

  onSave(): void {
    this.submitted = true;
    if (this.myForm.valid) {
      let to = this.myForm.value.to.split(',');
      let cc = this.myForm.value.cc.split(',');
      let subject = this.myForm.value.subject;
  
      const payload = {
        "sender": {
          "name": "Sender",
          "email": "stolt@yopmail.com"
        },
        "to": to.map((i) => { return { email: i } }) || [],
        "cc": cc.map((i) => { return { email: i } }) || [],
        "textContent": "Please find all attachment related to BATCH",
        "subject": subject || "",
        "batchId": this.batchdata?.batchId || "",
        "attachment": [
          ...this.fileName
        ]
      }
          
      this._api.sendEmail(payload).subscribe(
        (res) => {
          this.notification.success('Success', 'Email sent successfully');
        },
        (error: HttpErrorResponse) => {
          this.notification.error('Error', 'Failed to send email. Please try again later.');
        }
      );
    } else {
      this.myForm.markAllAsTouched();
      Object.keys(this.myForm.controls).forEach(controlName => {
        const control = this.myForm.get(controlName);
        if (control.invalid) {
          const errorMessages = control.errors;
        }
      });
    }
  }
  
  

  toggleSelection(event: any, doc: document) {
    if (event.target.checked) {
      this.selectedDocuments.push(doc);
    } else {
      this.selectedDocuments = this.selectedDocuments.filter(item => item !== doc);
    }
  }

  deleteRow(index: number) {
    this.selectedFileName.splice(index, 1);
    this.filesToSend.splice(index, 1);
  }

  checkDocUploaded(): boolean {
    return true;
  }

  showErrorNotification(error: any): void {
    this.notification.create('error',error?.error?.error?.message, '');
  }

  fetDocument(fileUploadCustomId: string): void {
  }

  addToST(endpoint: string, payload: any): Observable<any> {
    return this.http.post(endpoint, payload);
  }

  async uploadDocuments() {
    if (!this.doc) return;
  }

}
