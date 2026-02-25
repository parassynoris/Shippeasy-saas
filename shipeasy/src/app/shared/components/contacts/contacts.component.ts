import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddcontactComponent } from './addcontact/addcontact.component';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { ApiSharedService } from '../api-service/api-shared.service';
import { CommonService } from 'src/app/services/common/common.service';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css'],
})
export class ContactsComponent implements OnInit , OnDestroy {
  public ngUnsubscribe = new Subject<void>();
  isHoldType: any = 'add';
  result: any;
  contactData: any = [];
  @Input() prentPath: any;
  fromSize: number = 1;
  toalLength: any;
  size = 10;
  page = 1;
  count = 0;
  contactRemark: any;
  contactEmail: any;
  contactPhone: any;
  contactName: any;
  principalName: any;
  urlParam: any;
  currentUrl: any;
  filterValue = {};
  paginastion = false;
  partyid: any='';
  constructor(
    public modalService: NgbModal,
    public sharedService: ApiSharedService,
    private notification: NzNotificationService,
    private route: ActivatedRoute, public commonService : CommonService
  ) {
    this.route.params.subscribe((params) => (this.urlParam = params));
    this.partyid = this.route.snapshot.params['id'];
  }
  openContact(guid) {
    const modalRef = this.modalService.open(AddcontactComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      centered: true,
      size: 'lg',
    });
    modalRef.componentInstance.fromParent = guid;
    modalRef.componentInstance.parentpath = this.prentPath;
    modalRef.componentInstance.parentId =  this.partyid;
    modalRef.componentInstance.passAddUserData.subscribe((res) => {
      if (res) {
        this.getAll(this.prentPath, this.size);
      }
    });
  }

  ngOnInit(): void {
    this.prentPath = this.prentPath + '/' + this.urlParam.id;
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();
    this.getAll(this.prentPath, this.size);
  }

  clear() {
    this.contactName = '';
    this.principalName = '';
    this.contactEmail = '';
    this.contactPhone = '';
    this.contactRemark = '';
    this.getAll(this.prentPath, Number(this.size));
  }
  filter(e) {
    this.size = e.target.value;
    this.fromSize = 1;
    this.getAll(this.prentPath, Number(this.size));
  }
  next() {
    if (this.toalLength > this.count) {
      this.getPaginationData('next')
    }
  }

  prev() {
    if (this.page > 0 && this.page !== 1) {
      this.getPaginationData('prev')
    }
  }
  search() { 
    let mustArray = {};
    // mustArray['module'] = 'SHIPEASY' 
    if (this.partyid) { 
      mustArray['parentId'] = this.partyid 
    }
    if (this.contactName) {
      mustArray['contactName'] = {
        "$regex" : this.contactName,
        "$options": "i"
    }
    }
    
    if (this.principalName) { 
      mustArray['contactName'] = {
        "$regex" : this.principalName,
        "$options": "i"
    }
    }
    if (this.contactPhone) { 
      mustArray['contactPhone'] = {
        "$regex" : this.contactPhone,
        "$options": "i"
    }
    }
    if (this.contactEmail) { 
      mustArray['contactEmail'] = {
        "$regex" : this.contactEmail,
        "$options": "i"
    }
    }
    if (this.contactRemark) { 
      mustArray['contactRemark'] = {
        "$regex" : this.contactRemark,
        "$options": "i"
    }
    }
    

    let payload = this.commonService.filterList()

    payload.size =Number(this.size);
    payload.from = this.page - 1;
    payload.query = mustArray
    payload.sort = {
      "desc" : ["updatedOn"]
    },
    this.commonService.getSTList('contact',payload) .subscribe((data) => {
      this.result = data;
      this.toalLength = this.result.totalCount;
      this.contactData = this.result.documents;
      this.count = this.result.documents.length;
      this.fromSize =1
    });
  }
  statusChange(e, id, contactData) {
    const data = {
      isActive: e.target.checked,
      contactId: id,
    };
    this.sharedService
      .updateRecord('profile/contact/update', [data])
      .subscribe((result) => {
        this.notification.create('success', 'Status Update Successfully', '');
        this.getAll(this.prentPath, this.size);
      });
  }


  getPaginationData(type: any) {
    this.fromSize =
      type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
   
    let payload = this.commonService.filterList()

    payload.size =Number(this.size);
    payload.from = this.fromSize - 1;
    payload.query = {
      // module: 'SHIPEASY',
      parentId: this.partyid,
    }
    payload.sort = {
      "desc" : ["updatedOn"]
    },
    this.commonService.getSTList('contact',payload) .subscribe((data: any) => {
      this.contactData = data.documents;
      this.toalLength = data.totalCount;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count = type === 'prev' ? this.toalLength === this.count ? this.count - (this.toalLength % Number(this.size)) : this.count - data.documents.length : this.count + data.documents.length;
    });
  }



  getAll(type: any, size) {
    let payload = this.commonService.filterList()

    if(payload?.size)payload.size =Number(this.size);
    if(payload?.from)payload.from = this.fromSize - 1;
    if(payload?.query)payload.query = {
      // module: 'SHIPEASY',
      parentId: this.partyid,
    }
    if(payload?.sort)payload.sort = {
      "desc" : ["updatedOn"]
    },
    this.commonService.getSTList('contact',payload).subscribe((data) => {
      this.result = data;
      this.toalLength = this.result.totalCount;
      this.contactData = this.result.documents;
      this.count = this.result.documents.length;
    });
  }

  onEdit(content: any) {
    this.openContact(content);
  }

  printData() {
    var divToPrint = document.getElementById('tablerecords');
    var newWin = window.open('');
    newWin.document.write(divToPrint.outerHTML);
    newWin.print();
    newWin.close();
  }
  onDelete(contactId: any) {
    let deleteBody = "contact"+contactId
    this.commonService.deleteST( deleteBody).subscribe((data: any) => {
      if (data) {
        this.getAll(this.prentPath, this.size);
      }
    });
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
