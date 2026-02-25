
import { Message } from '@angular/compiler/src/i18n/i18n_ast';
import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { BatchService } from 'src/app/services/Batch/batch.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { CommonService } from 'src/app/services/common/common.service';

@Component({
  selector: 'app-needhelp',
  templateUrl: './needhelp.component.html',
  styleUrls: ['./needhelp.component.scss']
})

export class NeedhelpComponent implements OnInit {
  SupportData: any = {}
  extension: any;
  fileTypeNotMatched: boolean;
  doc: File;
  EmailForm: FormGroup;
  EmailForms: FormGroup;
  bookingForm:FormGroup;
  attachment=[]
  submitted = false;
  submittedInquiry= false;
  submittedBooking= false;
  isInquiryPanelOpen: boolean = false;
  isBookingPanelOpen: boolean = false;
  isInvoicePanelOpen: boolean = false;
  @Input() isShowClose: boolean = true;
  showErrorMsg: string = '';
  userdetails: any = [];

  constructor(
    private modalService: NgbModal, 
    private _route: Router, 
    private batchService: BatchService, 
    private activeModal: NgbActiveModal, 
    private cognito: CognitoService, 
    private formBuilder: FormBuilder, 
    private notification: NzNotificationService, 
    private commonService: CommonService
  ) {
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.userdetails = resp?.userData;
        this.userdetails['userName'] = this.userdetails?.userName?.toLowerCase();
      }
    });
  }

  ngOnInit(): void {
    this.EmailForm = this.formBuilder.group({
      message: ['', Validators.required],
      Email: ['', [Validators.required, Validators.email]],
      name: ['', Validators.required],
      attachment:[''],
      attachmentId: ['']
    
    });

    this.EmailForms = this.formBuilder.group({
      message: ['', Validators.required],
      Email: ['', [Validators.required, Validators.email]],
      name: ['', Validators.required],
      attachment:[''],
      attachmentId: ['']
    });
    this.bookingForm = this.formBuilder.group({
      message: ['', Validators.required],
      Email: ['', [Validators.required, Validators.email]],
      name: ['', Validators.required],
      attachment:[''],
      attachmentId: ['']
    });
  }

  get f() { return this.EmailForm.controls; }
  get f1() { return this.EmailForms.controls; }
  get f2() { return this.bookingForm.controls; }

  onCloseModal() {
    this.activeModal.dismiss();
    this.modalService.dismissAll();
  }

  togglePanel(panel: string) {
    switch (panel) {
      case 'inquiry':
        this.isInquiryPanelOpen = !this.isInquiryPanelOpen;
        break;
      case 'booking':
        this.isBookingPanelOpen = !this.isBookingPanelOpen;
        break;
      case 'invoice':
        this.isInvoicePanelOpen = !this.isInvoicePanelOpen;
        break;
      default:
        break;
    }
  }



  onWebchat(AddChat: any) {
    this.Cancel();
    this.modalService.open(AddChat, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'md'
    });
  }
  selectFile(event,formName,name){
    const type=formName;
    this.attachment=[]
  if (event) {
    const reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);
    reader.onload = (e) => {
      if (e) {
        const base64String = reader.result as string;
        let baseContent = base64String.split(",");
        this.attachment=[{ "content":   baseContent[1], "name": name }]
      }
    }
  }
  let filename = event.target.value.replace('C:\\fakepath\\', '');
  this[type].get(`attachment`)?.setValue(filename);

  this.extension = filename.substr(filename.lastIndexOf('.'));
  if (
    this.extension.toLowerCase() === '.xls' ||
    this.extension.toLowerCase() === '.xlsx' ||
    this.extension.toLowerCase() === '.pdf' ||
    this.extension.toLowerCase() === '.doc' ||
    this.extension.toLowerCase() === '.docx'
  ) {
    this.fileTypeNotMatched = false;
    this.doc = event?.target?.files[0];
  }
  
  }
  async uploadDocument(type,repayload) {
    if (!this.doc) return;
    const formData = new FormData();
    formData.append('file', this.doc, `${this.doc.name}`);
    formData.append('name', `${this.doc.name}`);

    await this.commonService.uploadDocuments('uploadfile', formData).subscribe(async (res) => {
      if (res) {
        let payload = {
          Doc: this[type]?.value?.Doc,
          documentType: this.doc?this.doc?.type : 'Attachment Support',
          documentName: res.name,
          documentURL: res?.name,
          ticketid: repayload?.supportmsg,
          documentStatus: true
        }
        await this.commonService.addToST('document', payload).subscribe(
          (res) => {
            if (res) {
              const payloadsupport={
                attachment:payload?.documentName,
                attachmentId:res?.documentId
              }
              this.commonService.UpdateToST("supportmsg/"+repayload?.supportmsgId, payloadsupport)?.subscribe( () => { },
                (error) => {
                  this.notification.create('error', error?.error?.error, '');
                }
              );
              // this.notification.create('success', 'Saved Successfully', '');
              this.doc = null;
              this[type].get(`attachmentId`)?.setValue(res?.documentId);
              this[type].get(`attachment`)?.setValue(payload?.documentName);
            }
          },
          (error) => {
            this.notification.create('error',error?.error?.error?.message, '');
          }
        );
      }
    });


  }
  getFileName(formValue) {
    console.log(formValue)
    const fileName = formValue ? formValue?.split('\\').pop() : 'test.pdf';
    return fileName;
  }
  send(type: string) {
    let formdata:any={}
    if(type==='Inquiry'){
      formdata=this.EmailForm.value;
      this.submittedInquiry = true;
      if (this.EmailForm.invalid ) {
        return;
      }
    }else if(type==='Booking'){
      formdata=this.bookingForm.value;
      this.submittedBooking = true;
      if ( this.bookingForm.invalid ) {
        return;
      }
    }else{
      this.submitted = true;
      formdata=this.EmailForms.value;
      if ( this.EmailForms.invalid ) {
        return;
      }
    }

    let subject = `Ship Easy - ${type}`;
    let emaildata = `Dear ShipEasy, <br><br>
      ${formdata?.message}
      Awaiting for your early response <br><br>
      Regards, <br> ${formdata?.name}`;
    
    let payload = {
      sender: {
        name: formdata?.name,
        email: formdata?.Email
      },
      to: [{ email: 'shipeasyadmin@yopmail.com' }, { email: 'shipeasy.in@gmail.com' }],
      cc: [{ email: this.userdetails?.userEmail }],
      attachment:this.attachment,
      textContent: `${emaildata}`,
      subject: subject
    };

    this.batchService.sendEmail(payload)?.subscribe(
      (res) => {
        this.submitted=this.submittedBooking=this.submittedInquiry=false;
        if (res.status === "success") {
          this.attachment=[]
          this.notification.create('success', 'Email Sent Successfully', '');
          if(type==='Inquiry'){
            this.EmailForm.reset();
            (<HTMLInputElement>document.getElementById('EmailForm')).value = '';
          }else if(type==='Booking'){
            this.bookingForm.reset();
            (<HTMLInputElement>document.getElementById('bookingForm')).value = '';
          }else{
            this.EmailForms.reset();
            (<HTMLInputElement>document.getElementById('EmailForms')).value = '';
          }
        } else {
          this.attachment=[]
          this.notification.create('error', 'Email not Sent', '');
        }
      },
      () => {
        this.attachment=[]
        this.notification.create('error', 'Email not Sent', '');
      }
    );
    this.savedata(type)
  }

  Cancel() {
    this.modalService.dismissAll();
  }
  savedata(type :string){
    let formdata:any={}
    if(type==='Inquiry'){
      formdata=this.EmailForm.value;
      if (this.EmailForm.invalid ) {
        return;
      }
    }else if(type==='Booking'){
      formdata=this.bookingForm.value;
      if ( this.bookingForm.invalid ) {
        return;
      }
    }else{
      formdata=this.EmailForms.value;
      if ( this.EmailForms.invalid ) {
        return;
      }
    }
    let payload = {
      contactUsType:type??'Invoice',
      customerName: formdata?.name,
      customerEmail: formdata?.Email,
      message:formdata?.message,
      status:"Pending",
      userEmail:this.userdetails?.userEmail,
      userName:this.userdetails?.userName
    }
    this.commonService.addToST("supportmsg", payload)?.subscribe(
      (res: any) => {
        if (res) {
          let formName='';
          if(type==='Booking'){
            formName='bookingForm'
          }else if(type==='Inquiry'){
            formName='EmailForm'
          }else{
            formName='EmailForms'
          }
       this.uploadDocument(formName,res);
          // this.notification.create('success', 'Added Successfully', '');
        }
      },
      (error) => {
        this.notification.create('error', error?.error?.error, '');
      }
    );


  }
  }

