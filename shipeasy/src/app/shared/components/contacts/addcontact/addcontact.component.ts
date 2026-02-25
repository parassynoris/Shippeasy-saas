import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subject } from 'rxjs';
import { BaseBody } from 'src/app/admin/smartagent/base-body';
import { CommonService } from 'src/app/services/common/common.service';
import { environment } from 'src/environments/environment';
import { ApiSharedService } from '../../api-service/api-shared.service';
@Component({
  selector: 'app-addcontact',
  templateUrl: './addcontact.component.html',
  styleUrls: ['./addcontact.component.scss'],
})
export class AddcontactComponent implements OnInit , OnDestroy{
  public ngUnsubscribe = new Subject<void>();
  isAddMode: any;
  id: any;
  @Output() CloseNew = new EventEmitter<string>();
  @Input() isTypeForm: any = 'Add';
  @Input() parentpath: any;
  addContactForm: FormGroup;
  submitted = false;
  guidValue: any;
  serverresponse: any;
  date: any;
  datepipe: any;
  @Input() public fromParent;
  title: any;
  @Output() passAddUserData: EventEmitter<any> = new EventEmitter();
  principalList: any = [];
  urlParam: any;
  @Input() public parentId;
  editMode: boolean = false;
  constructor(
    public modalService: NgbModal,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private sharedService: ApiSharedService,
    public commonService: CommonService,
    public notification: NzNotificationService,
    private router: Router
  ) {
    this.route.params.subscribe((params) => (this.urlParam = params));
    this.date = new Date().toJSON('yyyy/MM/dd');
    this.id = this.route.snapshot.params['id'];
    this.isAddMode = !this.id;
  }
  get f() {
    return this.addContactForm.controls;
  }
  ngOnInit(): void {
    this.addContactForm = this.formBuilder.group({
      contactName: ['', [Validators.required]],
      contactCode: ['', [Validators.required, Validators.maxLength(4), Validators.pattern(environment?.validate?.number),
      ],
      ],
      contactEmail: [
        '',
        [Validators.required, Validators.pattern(environment.validate.email)],
      ],
      contactPhone: [
        '',
        [
          Validators.required,
          Validators.maxLength(11),
          Validators.pattern(environment?.validate?.number),
        ],
      ],
      isActive: [true],
      contactRemarks: [''],
    });
    if (this.fromParent !== undefined && this.fromParent !== '') {
      this.editMode = true;
      this.addContactForm.setValue({
      
        contactCode: this.fromParent?.areaCode? this.fromParent?.areaCode : '',
        contactName: this.fromParent?.contactName,
        contactEmail: this.fromParent?.contactEmail,
        contactPhone: this.fromParent?.contactPhone,
        contactRemarks: this.fromParent?.contactRemarks,
        isActive: this.fromParent?.isActive,
      });
      this.title = 'Edit Contact';
    } else {
      this.title = 'Add New Contact';
    }
  }
  onClose() {
    this.modalService.dismissAll();
  }

  SaveContact() {
    this.submitted = true;
    if (this.addContactForm.valid) {
      let body = {
        contactName: this.addContactForm.get('contactName').value,
        contactEmail: this.addContactForm.get('contactEmail').value,
        areaCode: this.addContactForm.get('contactCode').value.toString(),
        contactPhone: this.addContactForm.get('contactPhone').value.toString(),
        contactCode: this.addContactForm.get('contactCode').value,
        contactRemarks: this.addContactForm.get('contactRemarks').value,
        isActive: this.addContactForm.get('isActive').value,
        orgId: '1',
        addressId: this.id,
        tenantId: '1',
        isUser: true,
        contactType: this.parentpath,
        parentId: this.parentId
      };
      const data = [body];
      if (this.fromParent) {
        const dataupdate = {
          ...body,
          contactId: this.fromParent.contactId,
        };
        const newdata = [dataupdate];
        this.commonService
          .UpdateToST(`contact/${newdata[0].contactId}`, newdata[0])
          .subscribe((result) => {
            this.modalService.dismissAll();
            this.serverresponse = result;
            this.passAddUserData.emit(result);

            this.notification.create('success', 'Update Successfully', '');
            this.router.navigate(['/' + this.parentpath + '/contacts']);

          });
      } else {
        this.commonService
          .addToST('contact', data[0])
          .subscribe((result) => {
            this.modalService.dismissAll();
            this.serverresponse = result;
            this.passAddUserData.emit(result);
            this.notification.create('success', 'Save Successfully', '');
            this.router.navigate(['/' + this.parentpath + '/contacts']);
            this.modalService.dismissAll();
          });
      }
    } else {
      return false;
    }
  }

  getPrincipalList() { 
    let payload = this.commonService.filterList()
    payload.query = {
      isPrincipal: true,
    }
    this.commonService.getSTList('principal',payload)
      .subscribe((data) => {
        this.principalList = data.documents;
      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
