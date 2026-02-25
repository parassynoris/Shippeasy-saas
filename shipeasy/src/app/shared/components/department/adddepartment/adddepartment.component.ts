import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { environment } from 'src/environments/environment';
import * as Constant from 'src/app/shared/common-constants';
import { ApiSharedService } from '../../api-service/api-shared.service';
import { CommonService } from 'src/app/services/common/common.service';
import { Subject } from 'rxjs';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { CognitoService } from 'src/app/services/cognito.service';
import { User } from 'src/app/models/userprofile';

@Component({
  selector: 'app-adddepartment',
  templateUrl: './adddepartment.component.html',
  styleUrls: ['./adddepartment.component.scss']
})
export class AddDepartmentComponent implements OnInit , OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  @Input() public fromParent;
  @Input() isDeptType : any;
  @Input() isType : any;
  @Input() partyid :any
  @Output() getList = new EventEmitter<any>()
  isData: any;
  addDepartment: FormGroup;
  submitted: boolean = false;
  managerUser : User[] = [];
  tenantId: string;
  userdetails =[];

  constructor(private modalService: NgbModal, private route: ActivatedRoute, private formBuilder: FormBuilder, private notification: NzNotificationService,
    private commonService: CommonService,
    private sharedService: ApiSharedService,private cognito : CognitoService,
    private commonFunction: CommonFunctions,
    
  ) {
   
    this.addDepartment = this.formBuilder.group(
      {
        deptName: ['', Validators.required],
        deptManager: ['', Validators.required],
        deptEmail: [null, [Validators.required, Validators.pattern(environment.validate.email)]],
        status: [false],
        assignedChatPerson:[]
      },
    );
  }
  ngOnInit(): void {
    this.isData = this.fromParent;
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.tenantId = resp.tenantId
      }
    }) 
    if (this.isData) {
      this.addDepartment.patchValue({
        deptName: this.isData.deptName,
        deptManager: this.isData.deptManager,
        deptEmail: this.isData.deptEmail,
        status: this.isData.status,
        assignedChatPerson:this.isData?.assignedChatPerson?.userId
      });
      this.getUserList()
    }
    if(this.isType === 'show'){
      this.addDepartment.disable()
    }
    this.getManagerUser();
  
  }
  get f() { return this.addDepartment.controls; }

  saveDepartment() {
    this.submitted = true
    if (this.addDepartment.invalid) {
      return;
    }
    let newdata = {
      "tenantId": this.tenantId,
      orgId: this.partyid || '',
      parentId : this.partyid || '',
      isDeptType: this.isDeptType,
      deptName: this.addDepartment.get('deptName').value,
      deptManager: this.addDepartment.get('deptManager').value,
      // deptManager: this.managerUser.filter(x => x.userId === this.addDepartment.controls.deptManager.value)[0]?.name,
      deptEmail: this.addDepartment.get('deptEmail').value,
      status: this.addDepartment.get('status').value,
    }
    if(this.addDepartment.get('assignedChatPerson').value){
      newdata['assignedChatPerson']={
        userId:this.addDepartment.get('assignedChatPerson').value,
        userName:this.userdetails?.find(userid=>userid?.userId===this.addDepartment.get('assignedChatPerson').value)?.userName
      }
    }
    let newDepartment = newdata;
    if (!this.isData) {
      const data = [newDepartment];
      this.commonService.addToST('department',data[0]).subscribe((result) => {
        if (result) {
          this.modalService.dismissAll();
          this.notification.create(
            'success',
            'Saved Successfully',
            ''
          );

          this.getList.emit(result);
        }
      }, error => {
        this.notification.create(
          'error',
         error?.error?.error?.message,
          ''
        );
      });
    } else {
      const dataWithUpdateId = { ...newDepartment, departmentId: this.isData.departmentId };
      const data = [dataWithUpdateId];
      this.commonService.UpdateToST(`department/${data[0].departmentId}`,data[0]).subscribe((res) => {
        if (res) {
          this.modalService.dismissAll();
          this.notification.create(
            'success',
            'Updated Successfully',
            ''
          );

          this.getList.emit(res);
        }
      });
    }
  }

  getManagerUser() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      status: true,
    }
    this.commonService.getSTList(Constant.GET_USER,payload) 
      ?.subscribe((data) => {
        this.managerUser = data.documents;
      });
  }

  onClose() {
    this.modalService.dismissAll();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  
  getUserList() { 
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "department.item_id": this.isData?.departmentId
    }
    this.commonService
      .getSTList('user', payload)
      ?.subscribe((data) => {
        this.userdetails = data?.documents;
      });
  }
}
