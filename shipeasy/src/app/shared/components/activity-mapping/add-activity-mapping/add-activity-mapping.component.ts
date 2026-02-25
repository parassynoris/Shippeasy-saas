import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/services/common/common.service';
import * as Constant from 'src/app/shared/common-constants';
import { ApiSharedService } from '../../api-service/api-shared.service';

@Component({
  selector: 'app-add-activity-mapping',
  templateUrl: './add-activity-mapping.component.html',
  styleUrls: ['./add-activity-mapping.component.css'],
})
export class AddActivityMappingComponent implements OnInit , OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  @Input() public fromParent;
  @Input() public prentPath;
  @Input() public isAddModeData;
  @Input() public principalId;
  @Output() getList = new EventEmitter<any>();
  activityForm: FormGroup;
  submitted: boolean;
  isAddMode: boolean = true;
  activityList: any = [];
  selectedactivity: any = [];

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private notification: NzNotificationService,
    private commonService: CommonService,
    private sharedService: ApiSharedService,
  ) { }

  ngOnInit(): void {
    this.getActivityList();
    this.activityForm = this.fb.group({
      orgId: [''],
      mappingName: ['', [Validators.required]],
      principalCode: ['', [Validators.required]],
      parentId: ['', [Validators.required]],

      tenantId: [''],
      activityName: [''],
      remark: [true],
      activityType: [''],
      status: [true],
      isCargoImpact: [true],
      isCommercial: [true],
      isLadenBallastApplicable: [true],
      activityId: [''],
    });
    if (this.isAddModeData) {
      this.isAddMode = false;
      this.activityForm.controls.activityId.setValue(
        this.isAddModeData?._source?.activityId
      );
      this.activityForm.get('activityId').disable();
      this.activityForm.controls.orgId.setValue(
        this.isAddModeData?._source?.orgId
      );
      this.activityForm.controls.mappingName.setValue(
        this.isAddModeData?._source?.mappingName
      );
      this.activityForm.controls.principalCode.setValue(
        this.isAddModeData?._source?.principalCode
      );
      this.activityForm.controls.parentId.setValue(
        this.isAddModeData?._source?.parentId
      );
      this.activityForm.get('parentId').disable();
      this.activityForm.controls.status.setValue(
        this.isAddModeData?._source?.status
      );
    }
  }

  getActivityList() { 
    let must = []
    if (!this.isAddModeData) {
      must.push({ "match": { "status": true } })
    }
    var parameter = {
      size: 10000,
      query: {
        bool: {
          must: must,
          filter: [],
          should: [],
          must_not: [],
        },
      },
    };
    this.commonService.getActivityList(parameter)?.subscribe((res: any) => {
      this.activityList = res.hits.hits;
    });
  }

  get f() {
    return this.activityForm.controls;
  }

  onSave() {
    this.modalService?.dismissAll();
    return null;
  }

  setActivityName(e) {
    this.selectedactivity = this.activityList.find(activity => activity._id === e.target.value);
    this.activityForm.patchValue({
      mappingName: this.selectedactivity._source.activityName,
      orgId: this.principalId,
      activityName: this.selectedactivity._source.activityName,
      activityType: this.selectedactivity._source.activityType,
      isCargoImpact: this.selectedactivity._source.isCargoImpact,
      isLadenBallastApplicable: this.selectedactivity._source.isLadenBallastApplicable,
      status: this.selectedactivity._source.status,
    })
  }

  activityMasters() {
    this.submitted = true;
    if (this.activityForm.invalid) {
      return;
    }
    var agentId = this.commonService.getCurrentAgentDetails()?.agentId;
    this.activityForm.controls.orgId.setValue(this.principalId);
    var data = this.activityForm.value;



    if (this.isAddMode) {
      const dataWithoutId = {
        tenantId: "c8045b46-7936-42a7-821b-952e3800e0e2",	
        orgId: this.activityForm.value.orgId,
        activityId: "",
        activityName: this.activityForm.value.activityName,	
        activityCode: "", 
        activityDescription: "",
        status: this.activityForm.value.status, 
        activityType: this.activityForm.value.activityType, 
        isCargoRelated: true, 
        isCargoImpact: this.activityForm.value.isCargoImpact,
        isCommercial: this.activityForm.value.isCommercial,
        isLadenBallastApplicable: this.activityForm.value.isLadenBallastApplicable,
        isLaden: true, 
        isParent: false, 
        parentId: this.activityForm.value.parentId, 
        mappingName: this.activityForm.value.mappingName,
        principalCode: this.activityForm.value.principalCode, 
        costhead: [] 
      };
      const AdddataSend = [dataWithoutId];

      this.sharedService
        .creatOrUpdateActivity(Constant.ADD_ACTIVITY, AdddataSend)
        .subscribe((res) => {
          this.modalService.dismissAll();
          this.notification.create('success', 'Added Successfully', '');
          this.getActivityList();
          this.getList.emit(res);
        });
    } else {
      
      const dataWithUpdateId = {
        ...data,
        activityId: this.isAddModeData._source.activityId,
      };
      const UpdatedataSend = [dataWithUpdateId];

      this.sharedService
        .creatOrUpdateActivity(Constant.UPDATE_ACTIVITY, UpdatedataSend)
        .subscribe((result) => {
          this.modalService.dismissAll();
          this.notification.create('success', 'Update Successfully', '');
          this.getActivityList();

          this.getList.emit(result);
        });
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
