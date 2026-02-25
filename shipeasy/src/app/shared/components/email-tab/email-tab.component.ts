import { Component, OnInit, Input, ViewChild, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from 'src/app/services/common/common.service';
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { MatChipInputEvent } from '@angular/material/chips';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderService } from './../../../services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
import { ApiService } from 'src/app/admin/principal/api.service';

export interface FruitTO {
  to: string;
}

export interface FruitCC {
  cc: string;
}

@Component({
  selector: 'app-email-tab',
  templateUrl: './email-tab.component.html',
  styleUrls: ['./email-tab.component.scss']
})
export class EmailTabComponent implements OnInit {
  removable: boolean = true;
  _gc = GlobalConstants;
  newMembersTO: FruitTO[] = [];
  newMembersCC: FruitCC[] = [];
  @ViewChild("chipListTO") chipListTO;
  @ViewChild("chipListCC") chipListCC;
  @ViewChild('newEmailModal') newEmailModal;
  addOnBlurTO = true;
  selectedItem: any;
  addOnBlurCC = true;
  attachment: any = [];
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  regularExpression =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  public Editor = ClassicEditor;
  @Input() batchId;
  SentEmail: FormGroup;
  emailListchild = {
    "List": [],
    "subject": "",
    isShow: false
  };
  isreply = false;
  isNewEmail = false;
  selectedEmailType: string = '';
  isloader = false;
  batchdata: any;
  showDropdown = false;
  
  constructor(
    public _api: ApiService,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    public notification: NzNotificationService,
    private router: Router,
    public loaderService: LoaderService
  ) {
    this.SentEmail = this.fb.group({
      message: ['', Validators.required],
      EmailTo: ['', Validators.pattern(/^([a-zA-Z0-9_+.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(,\s*[a-zA-Z0-9_+.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})*$/)],
      CC: ['', Validators.pattern(/^([a-zA-Z0-9_+.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(,\s*[a-zA-Z0-9_+.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})*$/)],
      Attachment: "",
      subject: ['']
    });
  }

  ngOnInit(): void {
    this.getbatchData();
    this.getBatchList();
    this.currentUrl = this.router.url?.split('?')[0].split('/')[3];
    if (this.currentUrl === 'show') {
      this.SentEmail.disable();
      this.show = true;
    }
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: any) {
    if (this.showDropdown && !event.target.closest('.dropdown')) {
      this.showDropdown = false;
    }
  }

  emailList = [];
  emailDate: any = [];
  toalLength: number;
  count = 0;
  size = 10;
  page = 1;
  isRequiredForSendEmail: boolean = false;
  EmailTo: any;
  emailIds = [];
  emailIdscomma: any;
  currentUrl: string;
  show: boolean = false;
  selectable = true;

  batchDetails:any [] =[]
  shippingLineId:any [] = []
  chaDetails: any;
  agentDetails: any;

  getBatchList() {
    let payload = this.commonService.filterList();
    if (payload?.query) {
      payload.query = {
        "batchId": this.route.snapshot?.params['id']
      };
    }
  
    this.commonService.getSTList('batch', payload)
      ?.subscribe((data: any) => {
        if (data?.documents?.length > 0) {
          this.batchDetails = data.documents[0];
          this.shippingLineId = data.documents[0]?.enquiryDetails?.routeDetails?.shippingLineId;
  
          const chaId = data.documents[0]?.enquiryDetails?.basicDetails?.chaId;
          if (chaId) {
            this.getCHADetails(chaId);
          }
  
          const agentId = data.documents[0]?.enquiryDetails?.basicDetails?.agentId;
          if (agentId) {
            this.getAgentDetails(agentId);
          }
  
          if (this.shippingLineId) {
            const id = Array.isArray(this.shippingLineId)
              ? this.shippingLineId[0]
              : this.shippingLineId;
            this.getShippingLineDetails(id);
          }
        }
      });
  }

  getCHADetails(chaId: string) {
    let payload = this.commonService.filterList();
    if (payload?.query) {
      payload.query = {
        "partymasterId": chaId,
        "status": true
      };
    }
  
    this._api.getSTList("partymaster", payload)?.subscribe((res: any) => {
      if (res?.documents?.length > 0) {
        this.chaDetails = res.documents[0];
        console.log("CHA Details:", this.chaDetails);
      }
    });
  }
  
  getAgentDetails(agentId: string) {
    let payload = this.commonService.filterList();
    if (payload?.query) {
      payload.query = {
        "partymasterId": agentId,
        "status": true
      };
    }
  
    this._api.getSTList("partymaster", payload)?.subscribe((res: any) => {
      if (res?.documents?.length > 0) {
        this.agentDetails = res.documents[0];
        console.log("Agent Details:", this.agentDetails);
      }
    });
  }

  getUniqueEmailsFromList(emails: (string | undefined)[]): string[] {
    const regex = this.regularExpression;
    const emailMap = new Map<string, string>();
    
    emails
      .filter(email => email && email.trim() && regex.test(email.trim()))
      .forEach(email => {
        const trimmed = email.trim();
        const lowerCase = trimmed.toLowerCase();
        if (!emailMap.has(lowerCase)) {
          emailMap.set(lowerCase, trimmed);
        }
      });
    
    return Array.from(emailMap.values());
  }

  setDefaultEmailsByType(type: string) {
  let emails: string[] = [];

  switch (type) {
    case 'shippingLine':
      if (this.partyMasterDetails) {
        const branchEmails = this.partyMasterDetails.branch?.map(b => b.pic_email) || [];
        emails = this.getUniqueEmailsFromList([
          this.partyMasterDetails.primaryMailId,
          ...branchEmails
        ]);
      }
      break;

    case 'cha':
      if (this.chaDetails) {
        const branchEmails = this.chaDetails.branch?.map(b => b.pic_email) || [];
        emails = this.getUniqueEmailsFromList([
          this.chaDetails.primaryMailId,
          ...branchEmails
        ]);
      }
      break;

    case 'agent':
      if (this.agentDetails) {
        const branchEmails = this.agentDetails.branch?.map(b => b.pic_email) || [];
        emails = this.getUniqueEmailsFromList([
          this.agentDetails.primaryMailId,
          ...branchEmails
        ]);
      }
      break;
  }

  if (emails.length > 0) {
    this.newMembersTO = [];
    this.SentEmail.controls['EmailTo'].setValue('');
    emails.forEach(email => {
      this.newMembersTO.push({ to: email });
    });
  }
}


  shippingLineList: any[] = [];
  partyMasterDetails: any;
  
  getShippingLineDetails(shippingLineId: string | string[]) {
    let payload = this.commonService.filterList();
    if (payload?.query) {
      payload.query = { "status": true };
    }
  
    this._api.getSTList("shippingline", payload)?.subscribe((res: any) => {
      if (res?.documents?.length > 0) {
        this.shippingLineList = res.documents;
  
        console.log("ShippingLineId from batch:", shippingLineId);
        console.log("ShippingLineList sample:", this.shippingLineList[0]);
  
        const id = Array.isArray(shippingLineId) ? shippingLineId[0] : shippingLineId;
        const shippingLine = this.shippingLineList.find(
          (x: any) => x?.shippinglineId?.toString().trim() === id?.toString().trim()
        );
  
        console.log("Matched Shipping Line:", shippingLine);
  
        if (shippingLine) {
          const partyMasterId = shippingLine?.partymasterId; 
          console.log("partyMasterId found:", partyMasterId);
  
          if (partyMasterId) {
            this.getPartyMasterDetails(partyMasterId);
          }
        } else {
          console.warn("No matching shipping line found for ID:", id);
        }
      }
    });
  }
  
  getPartyMasterDetails(partyMasterId: string) {
    let payload = this.commonService.filterList();
    if (payload?.query) {
      payload.query = {
        "status": true
      };
    }
  
    this._api.getSTList("partymaster", payload)?.subscribe((res: any) => {
      if (res?.documents?.length > 0) {
        const allParties = res.documents;
  
        const matchedParty = allParties.find(
          (x: any) => x.partymasterId === partyMasterId
        );

        if (matchedParty) {
          this.partyMasterDetails = matchedParty;  
          const email = this.partyMasterDetails?.primaryMailId || '';
        } else {
          console.warn("No party found for ID:", partyMasterId);
        }
      }
    });
  }

setPartyMasterEmail() {
  if (this.partyMasterDetails) {
    const email = this.partyMasterDetails.pic_email || this.partyMasterDetails.primaryMailId;
    if (email) {
      this.newMembersTO = [{ to: email }];
      this.SentEmail.patchValue({
        EmailTo: email
      });
    }
  }
}

  
  
  

  getbatchData() {
    this.isloader = true;
    let payload = this.commonService.filterList();
    if (payload?.query) payload.query = {
      batchId: this.batchId,
    };
    this.commonService
      .getSTList('batch', payload)?.subscribe((res: any) => {
        this.batchdata = res?.documents?.[0];
        if (this.batchdata?.statusOfBatch == 'Job Cancelled' || this.batchdata?.statusOfBatch == 'Job Closed') {
          this.isreply = true;
        }
        this.isloader = false;
        if (this.batchdata) {
          this.getEmail();
        }
      });
  }

  getEmail() {
    this.isloader = true;
    let payload = this.commonService.filterList();
    if (payload?.sort) payload.sort = {
      "desc": ["updatedOn"]
    };
    if (payload?.size) payload.size = Number(this.size);
    if (payload?.from) payload.from = this.page - 1;
  
    this.commonService.getSTList1('emailList', { "batchNo": this.batchdata?.batchNo })?.subscribe(
      (res: any) => {
        this.emailList = res;
        if (this.emailList?.length) this.open(this.emailList[0]);
        this.emailDate = res;
        this.toalLength = res?.length;
        this.count = res?.length;
        this.isloader = false;
      },
      (error: any) => {
        console.error('Error fetching email list:', error);
        this.isloader = false; // Ensure loader is stopped even on error
      }
    );
  }
  

  fileChanged(event: any) {
    const attachmentControl = this.SentEmail.get('Attachment');
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      attachmentControl.setValue(file);
      this.attachment = event.target.files;
    } else {
      attachmentControl.setValue(null);
    }
  }


  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.showDropdown = !this.showDropdown;
    console.log('Dropdown toggled:', this.showDropdown);
  }

  openNewEmail(type: string) {
    console.log('Opening new email for type:', type);
    this.showDropdown = false; 
    this.selectedEmailType = type;
    this.isNewEmail = true;
    this.newMembersTO = [];
    this.newMembersCC = [];
    this.SentEmail.reset();
    this.attachment = [];
    
    this.setDefaultEmailsByType(type);
    
    this.modalService.open(this.newEmailModal, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'xl',
    });
  }

  sendNewEmail(modal: any) {
    Object.keys(this.SentEmail.controls).forEach(key => {
      this.SentEmail.get(key)?.markAsTouched();
    });
  
    if (this.newMembersTO.length === 0) {
      this.notification.create('error', 'Error', 'Please add at least one recipient email');
      return;
    }
  
    if (this.SentEmail.get('subject')?.invalid) {
      this.notification.create('error', 'Error', 'Subject is required');
      return;
    }
  
    if (this.SentEmail.get('message')?.invalid) {
      this.notification.create('error', 'Error', 'Message is required');
      return;
    }
  
    let formdata = new FormData();
    formdata.append("batchNo", this.batchdata?.batchNo);
    formdata.append("message", this.SentEmail.value.message);
    formdata.append("to", this.newMembersTO.map(email => email?.to).join(","));
    formdata.append("cc", this.newMembersCC.map(email => email?.cc).join(","));
    formdata.append("subject", this.SentEmail.value.subject);
    formdata.append("emailType", this.selectedEmailType);
    
    if (this.attachment?.length > 0) {
      formdata.append('file', this.attachment?.[0], `${this.attachment?.[0]?.name}`);
      formdata.append('name', `${this.attachment?.[0]?.name}`);
    }
  
    this.loaderService.showcircle();
    this.commonService.userList('sendBatchEmail', formdata)?.subscribe(
      (res: any) => {
        this.loaderService.hidecircle();
        if (res) {
          this.notification.create('success', 'Success', 'Email Sent Successfully!');
          modal.dismiss();
          this.isNewEmail = false;
          this.SentEmail.reset();
          this.newMembersTO = [];
          this.newMembersCC = [];
          this.attachment = [];
          this.getEmail();
        }
      }, 
      (error) => {
        this.loaderService.hidecircle();
        console.error('Email send error:', error);
        this.notification.create('error', 'Error', error?.error?.message || 'Failed to send email. Please try again.');
      }
    );
  }

  closeReplyForm() {
    this.isreply = false;
    this.SentEmail.reset();
    this.attachment = [];
  }

  open(item) {
    this.selectedItem = item;
    this.emailListchild.isShow = true;
    this.emailListchild.List = item?.conversations ?? [];
    this.emailListchild.subject = item?.conversationSubject;
    this.emailIds = [];
    
    this.emailListchild.List.forEach((email: any) => {
      (email?.to ? email?.to : []).filter(rr => {
        const email = this.emailIds.find(em => em === rr);
        if (!email) this.emailIds.push(rr);
      });
    });
     
    this.newMembersTO = this.emailIds.map(email => {
      return { to: email };
    });
    this.SentEmail.controls['EmailTo'].setValue(this.emailIdscomma);
  }

  closeModal() {
    this.modalService.dismissAll();
  }
  
  returnemail(to) {
    return (Array.isArray(to) ? to : []).map((e) => e.email).join(", ");
  }
  
  returnemail1(to) {  
    return to?.toString() || ''; 
  }

  downloadFile(doc) {
    this.commonService.downloadDocuments('downloadfile', doc).subscribe(
      (fileData: Blob) => {
        this.commonService.downloadDocumentsFile(fileData, doc);
      },
      (error) => {
        console.error(error);
      }
    );
  }

  downlaod(file: { filename: string, content: string }) {
    const binaryData = window.atob(file.content); 
    const binaryArray = new Uint8Array(binaryData.length);

    for (let i = 0; i < binaryData.length; i++) {
      binaryArray[i] = binaryData.charCodeAt(i);
    }

    const blob = new Blob([binaryArray], { type: 'application/pdf' }); 
    const url = window.URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = file.filename;

    document.body.appendChild(anchor);
    anchor.click();

    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);
  }

  onSave() {
    if (this.SentEmail.invalid) {
      return;
    }
    
    let formdata = new FormData();
    formdata.append("batchNo", this.batchdata?.batchNo);
    formdata.append("message", this.SentEmail.value.message);
    formdata.append("to", this.newMembersTO.map(email => email?.to).join(","));
    formdata.append("cc", this.newMembersCC.map(email => email?.cc).join(","));
    formdata.append("subject", this.emailListchild.subject);
    
    if (this.attachment?.length > 0) {
      formdata.append('file', this.attachment?.[0], `${this.attachment?.[0]?.name}`);
      formdata.append('name', `${this.attachment?.[0]?.name}`);
    }

    this.loaderService.showcircle();
    this.commonService.userList('sendBatchEmail', formdata)?.subscribe((res: any) => {
      this.loaderService.hidecircle();
      this.SentEmail.reset();
      this.attachment = [];
      
      if (res) {
        this.notification.create('success', 'Email Sent Successfully!', '');
        this.getEmail();
      }
    }, (error) => {
      this.loaderService.hidecircle();
      this.notification.create('error', 'Failed to send email', '');
    });
  }

  addnewMembersTO(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    
    if ((value || "").trim()) {
      const trimmedValue = value.trim().toLowerCase(); // Convert to lowercase for comparison
      
      let emailValidation = this.regularExpression.test(trimmedValue);
      
      if (emailValidation) {
        const emailExists = this.newMembersTO.some(member => 
          member.to.toLowerCase() === trimmedValue
        );
        
        if (!emailExists) {
          this.newMembersTO.push({ to: value.trim() });
        } else {
          this.notification.create('warning', 'Duplicate Email', 'This email address is already added');
        }
      } else {
        this.notification.create('error', 'Invalid Email', 'Please enter a valid email address');
      }
    }
    if (input) {
      input.value = "";
    }
  }

  removenewMembersTO(fruit: FruitTO): void {
    const index = this.newMembersTO.indexOf(fruit);
    if (index >= 0) {
      this.newMembersTO.splice(index, 1);
    }
  }

  addnewMembersCC(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    
    if ((value || "").trim()) {
      const trimmedValue = value.trim().toLowerCase();
      let emailValidation = this.regularExpression.test(trimmedValue);
      
      if (emailValidation) {
        // Check for duplicates in CC field
        const emailExists = this.newMembersCC.some(member => 
          member.cc.toLowerCase() === trimmedValue
        );
        
        if (!emailExists) {
          this.newMembersCC.push({ cc: value.trim() });
        } else {
          this.notification.create('warning', 'Duplicate Email', 'This email address is already added to CC');
        }
      } else {
        this.notification.create('error', 'Invalid Email', 'Please enter a valid email address');
      }
    }
    
    if (input) {
      input.value = "";
    }
  }

  removenewMembersCC(fruit: FruitCC): void {
    const index = this.newMembersCC.indexOf(fruit);
    if (index >= 0) {
      this.newMembersCC.splice(index, 1);
    }
  }

  attachDoc() { }
}