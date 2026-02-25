import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import * as Constant from 'src/app/shared/common-constants';
@Component({
  selector: 'app-addactivity',
  templateUrl: './addactivity.component.html',
  styleUrls: ['./addactivity.component.css']
})
export class AddactivityComponent implements OnInit {

  @Input() public fromParent;
  @Input() isType: any = 'add';
  @Output() getList = new EventEmitter<any>();
  activityForm: FormGroup
  submitted: boolean;
  constructor(public modalService: NgbModal
    , private fb: FormBuilder
    , public notification: NzNotificationService
    , public masterService: MastersService
    , private profilesService: ProfilesService) {
    // do nothing.
  }

  ngOnInit(): void {
    let data = this.fromParent?._source
    this.activityForm = this.fb.group({
      containerStatusCode: [data ? data?.containerStatusCode : '', [Validators.required]],
      containerDesignastion: [data ? data?.containerDesignastion : '', [Validators.required]],
      description: [data ? data?.description : '', [Validators.required]],
      activityType: [data ? data?.activityType : '', [Validators.required]],
      activityStatus: [data ? data?.activityStatus : '', [Validators.required]],
      ladenFlag: [data ? data?.ladenFlag : '', [Validators.required]],
      damageFlag: [data ? data?.damageFlag : '', [Validators.required]],
      in_out_boundFlag: [data ? data?.in_out_boundFlag : '', [Validators.required]],
      voyage_mandatory: [data ? data?.voyage_mandatory : true],
      booking_mandatory: [data ? data?.booking_mandatory : true],
      do_validity_verification: [data ? data?.do_validity_verification : true],
      is_initial_move: [data ? data?.is_initial_move : true],
      is_add_active: [data ? data?.is_add_active : true],
      is_delete_active: [data ? data?.is_delete_active : true],
      is_rotation_mandate: [data ? data?.is_rotation_mandate : true],
      is_act_date_mod_app: [data ? data?.is_act_date_mod_app : true],
      is_Rr_wagan_no_app: [data ? data?.is_Rr_wagan_no_app : true],
      is_vendor_Ref_app: [data ? data?.is_vendor_Ref_app : true],
      remarks: [data ? data?.remarks : ''],
      status: [data ? data?.status : true],
      vmsCode: [data ? data?.vmsCode : ''],
    })

    if (this.isType === 'show') {
      this.activityForm.disable();
    }
  }

  get f() { return this.activityForm.controls; }

  onSave() {
    this.modalService.dismissAll();
    return null;
  }

  activityMasters() {
    this.submitted = true
    if (this.activityForm.invalid) {
      return;
    }
    let newdata = this.activityForm.value;


    const UpdatedataSend = {
      ...newdata,
      "activityName": this.activityForm.get('containerStatusCode').value,
      "activityDescription": "",
      "activityDry": true,
      "activityWet": true,
      "isCommercial": true,
      "isParent": true,
      "parentId": "1111111111111",
      "parentItemName": "Test",
      "reason": "Test",
      "actvityGroup": "Test",
      "activitySequence": "Test",
      "isCargoImpact": false,
      "isLadenBallastApplicable": false,
      "isMandatory": true,
      "activityMapping": "Test",
      "costheadMapping": [
        {
          "costheadId": 12345,
          "costheadName": "Test",
          "costheadMapping": "Test",
          "accountCode": "1111111111"
        }
      ],
    }

    if (!this.fromParent) {
      this.masterService.creatOrUpdateActivity(Constant.ADD_ACTIVITY, [UpdatedataSend]).subscribe(res => {
        this.notification.create(
          'success',
          'Added Successfully',
          ''
        );
        this.onSave();
        this.getList.emit(res);
      }, error => {
        this.notification.create('error', error?.error?.error?.message, '');
        this.onSave();
      });
    }
    else {
      const data = [{ ...UpdatedataSend, activityId: this.fromParent._source.activityId }];
      this.masterService.creatOrUpdateActivity(Constant.UPDATE_ACTIVITY, data).subscribe(result => {
        this.notification.create(
          'success',
          'Update Successfully',
          ''
        );
        this.onSave();
        this.getList.emit(result);
      }, error => {
        this.notification.create('error', error?.error?.error?.message, '');
        this.onSave();
      });
    }

  }
}
