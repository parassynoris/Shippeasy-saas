import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CognitoService } from 'src/app/services/cognito.service';
import { CommonService } from 'src/app/services/common/common.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
@Component({
  selector: 'app-document-upload1',
  templateUrl: './document-upload1.component.html',
  styleUrls: ['./document-upload1.component.scss']
})
export class DocumentUpload1Component implements OnInit {

  @Output() setDocumentName = new EventEmitter<any>();
  @ViewChild('fileInput') fileinput: any;
  filename: any;
  userData: any
  @Input() documentTypeList;
  @Input() bookingid;
  documentForm = new FormGroup({
    type: new FormControl('', Validators.required)
  })
  extension: any;

  constructor(public commonFunction : CommonFunctions,public notification: NzNotificationService,private _api: CommonService, private _cognito: CognitoService, private _modal: NgbActiveModal) {
    this.userData = this._cognito.getagentDetails();
  }

  ngOnInit(): void { 
  }

  openFile() {
    this.fileinput.nativeElement.click();
  }
  oncancel() {
    this._modal.close();
  }

  setFileName(event: any) {


    let filename = event.target.value.replace('C:\\fakepath\\', '');
    this.extension = filename.substr(filename.lastIndexOf('.'));
    if (
      this.extension.toLowerCase() === '.xls' ||
      this.extension.toLowerCase() === '.xlsx' ||
      this.extension.toLowerCase() === '.pdf' ||
      this.extension.toLowerCase() === '.doc' ||
      this.extension.toLowerCase() === '.docx'
    ) {
      this.filename = event.target.files[0];
      const formData = new FormData();
      formData.append('file', this.filename, `${this.filename.name}`);
      formData.append('name', `${this.filename.name}`);
      this._api.uploadDocuments('uploadfile', formData).subscribe();
    } else {

    }




  }
  uploadDoc() { 
    let payload = {
      file : this.filename,
      docType : this.documentForm.value.type
    }
      this.setDocumentName.emit(payload);
      this._modal.close();
   
  }
}
