import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ApiService } from 'src/app/admin/principal/api.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-add-mail-template',
  templateUrl: './add-mail-template.component.html',
  styleUrls: ['./add-mail-template.component.scss']
})
export class AddMailTemplateComponent implements OnInit {

  public Editor = ClassicEditor;

  @Input() isRightSide = false;
  @ViewChild('selectedItemsContainer') selectedItemsContainer: ElementRef;
  @ViewChild('footerContent') footerContent: ElementRef;
  @ViewChild('logoContainer') logoContainer: ElementRef;


  ckeditorContent: string = '<p>Some html</p>';
  form: FormGroup;
  availableItems = ['EmailName', 'Subject', 'Body', 'Footer'];
  selectedItems: string[] = [];
  removeButtonIndex: number | null = null;

  isDragging: boolean = false;
  draggedItem: string | undefined;
  html: string = '';
  html2: string = '';
  showSaveNotification: boolean = false;
  logoImage: File | null = null;
  imgSrc: string | null = null;
  myForm: FormGroup;
  currentUrl: string;
  urlParam: any;
  ngOnInit(): void {
 
    this.saveItems()
  }

  constructor(
    private fb: FormBuilder,
    private notification: NzNotificationService,
    private _api: ApiService,
    private commonService: CommonService,
    public router: Router,
    private route: ActivatedRoute,
    private cognito: CognitoService,
    public formBuilder: FormBuilder) {
    this.form = this.fb.group({
      subject: ['', Validators.required],
      body: ['', Validators.required],
      EmailName: ['',Validators.required],
      // logo: [''],
      footer: ['']
    });

    if (this.isRightSide) {
      this.selectedItems = ['Initial Selected Item 1', 'Initial Selected Item 2', 'Item 3'];
    }
    
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();
    this.route.params?.subscribe(params => {
      this.urlParam = params.id;
    });
    if(this.urlParam){
      this.getdata();
    }

  }


  drop(event: any) {
    const item = event.item.data;
    const itemType = this.getItemType(item);
    if (itemType === '') {
    } else {
      if (!this.selectedItems.includes(item)) {
        this.selectedItems.push(item);
      }
    }
  }

  getItemType(item: string): string {
    if (item === 'EmailName') {
      return 'EmailName';
    } else if (item === 'Body') {
      return 'body';
    } else if (item === 'Footer') {
      return 'footer';
    } else if (item === 'Subject') {
      return 'subject';
    }
    return '';
  }

  showRemoveButton(index: number) {
    this.removeButtonIndex = this.removeButtonIndex === index ? null : index;
  }

  removeItem(index: number) {
    this.selectedItems.splice(index, 1);
    this.removeButtonIndex = null;
  }

  startDragging(event: any, item: string) {
    this.draggedItem = item;
    this.isDragging = true;
  }

  stopDragging(event: any) {
    this.draggedItem = undefined;
    this.isDragging = false;
  }

  saveItems() {
    if (this.form.valid) {
      let htmlPayloadsubject = '';
      let htmlPayloadbody = '';
      let htmlPayloadFooter = '';
      let emailNamePayload = '';
      let orgId = '';
      // let headerPayload = '';
  
      // if (this.selectedItems.includes('Header')) {
      //   const imgSrc = this.logoContainer.nativeElement.querySelector('img')?.src;
      //   if (imgSrc) {
          // headerPayload += `<head><div style="top: 0; left: 0; width: 15%; height: 15%; display: inline-block;"><img src="${imgSrc}" alt="Logo" style="vertical-align: bottom; margin-left: 1200px; width: 100%; border-radius: 5px;"></div></head>`;
        // } else {
          // headerPayload += `<head><div style="top: 0; left: 0; width: 15%; height: 15%; display: inline-block;"><img src="https://img.mailinblue.com/7056611/images/content_library/original/66151bcfbbe7b5a7be97316b.png" alt="Default Logo" style="vertical-align: bottom; margin-left: 1200px; width: 100%; border-radius: 5px;"></div></head>`;
      //   }
      // }
  
      htmlPayloadsubject += `${this.form.get('subject').value}`;
      htmlPayloadbody += `<body>${this.form.get('body').value}</body>`;
  
      emailNamePayload += `${this.form.get('EmailName').value}`;
  
      if (this.selectedItems.includes('Footer') && this.footerContent) {
        htmlPayloadFooter += '<footer>';
        this.footerContent.nativeElement.childNodes.forEach(node => {
          if (node.nodeName === 'P') {
            htmlPayloadFooter += `<p style="text-align: center;">${node.textContent.trim()}</p>`;
          }
        });
        htmlPayloadFooter += '</footer>';
      }
  
      this.cognito.getagentDetails()?.subscribe((resp) => {
        orgId = resp?.agentId;
      });
  
      const allhtmlPayload = {
        "EmailName": emailNamePayload,
        "subject": htmlPayloadsubject,
        // "Header": headerPayload,
        "body": htmlPayloadbody,
        "footer": htmlPayloadFooter,
        "orgId": orgId
        
      };
  
      if (!this.urlParam) {
        // Save data
        this.form.reset();
        this._api.SaveOrUpdate('emailtemplate', allhtmlPayload).subscribe(
          (res) => {
            this.notification.success('Success', 'Email templates created successfully');
          },
          (error: HttpErrorResponse) => {
            this.notification.error('Error', 'Email templates not created. Please try again later.');
          }
        );
    } else {
        // Update data
        const updatePayload = {
          ...allhtmlPayload, 
          "emailtemplateId" : this.urlParam
        };
        const data = [updatePayload]
        this._api.UpdateToST(`emailtemplate/${this.urlParam}`, updatePayload).subscribe(
          (res) => {
            this.notification.success('Success', 'Email template updated successfully');
            this.router.navigate(['/master/mailtemplate']);
          },
          (error: HttpErrorResponse) => {
            this.notification.error('Error', 'Failed to update email template. Please try again later.');
          }
        );
    }
    this.router.navigate(['/master/mailtemplate']);
    } 
  }

  cancel(){
    this.router.navigate(['/master/mailtemplate']);
  }

  getdata(){
    this._api.getListByURL(`search/emailtemplate/${this.urlParam}`,{}).subscribe(
      (data: any) => {
        let emaildata = data.documents[0]
        if(data.documents.length > 0){
          this.selectedItems = this.availableItems
          this.form.patchValue({
            EmailName: emaildata?.EmailName || '',
            subject: emaildata?.subject || '',
            body: emaildata?.body || '',
          });
        }
      },
      (error: HttpErrorResponse) => {
        console.error('Error fetching email template data:', error);
      }
    );
  }
  
  
  

}
