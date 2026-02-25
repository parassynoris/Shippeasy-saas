import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { CommonService } from 'src/app/services/common/common.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { CostItem } from 'src/app/models/cost-items';

@Component({
  selector: 'app-costheadadd',
  templateUrl: './costheadadd.component.html',
  styleUrls: ['./costheadadd.component.css']
})
export class CostheadaddComponent implements OnInit {
  @Input() public fromParent;
  @Input() public prentPath;
  @Input() public isAddModeData;
  @Output() getList = new EventEmitter<any>();
  isAddMode: boolean = true;
  addCostHead: FormGroup;
  submitted: boolean = false;
  costItemList: CostItem[]=[];
  tenantId: any;
  constructor(private modalService: NgbModal, private formBuilder: FormBuilder,private cognito : CognitoService,
    private profilesService: ProfilesService, private commonService : CommonService
    , private notification: NzNotificationService,private commonfunction: CommonFunctions,) {
    // do nothing.
  }


  ngOnInit(): void {
    this.addCostHead = this.formBuilder.group(
      {
        costHeadName: ['', Validators.required],
        costHeadCode: ['', Validators.required],
        status: [true],
      },
    );
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.tenantId = resp.tenantId
      }
    }) 
    if (this.fromParent) {
      this.addCostHead.controls.costHeadName.setValue(this.fromParent?.costheadName);
      this.addCostHead.controls.status.setValue(this.fromParent?.status);
      this.addCostHead.controls.costHeadCode.setValue(this.fromParent?.costHeadCode);
    }
    if(this.isAddModeData === 'show'){
      this.addCostHead.disable()
    }
  }
  get f() { return this.addCostHead.controls; }

  onClose() {
    this.modalService.dismissAll();
  }
  costItem() {
    let payload = this.commonService.filterList()
    payload.query = { }
    this.commonService.getSTList('costitem', payload).subscribe((data) => {
      this.costItemList = data.documents;
  
    });
  }
  saveCostHead() {
    this.submitted = true;
    if (this.addCostHead.invalid) {
      return false;
    }
    let newdata = {
        "tenantId": this.tenantId,
      status: this.addCostHead.get('status').value,
      costheadName: this.addCostHead.get('costHeadName').value,
      costHeadCode: this.addCostHead.get('costHeadCode').value,
      "orgId": this.commonfunction.getAgentDetails()?.orgId,
    }
    let createBody = newdata;
    if (!this.fromParent) {
      this.commonService.addToST('costhead',createBody).subscribe((data: any) => {
        if (data) {
          this.notification.create(
            'success',
            'Added Successfully',
            ''
          );
          this.onClose();
          this.getList.emit(data);
        }
      }, (error) => {
        this.notification.create('error', error?.error?.error?.message , '');
      });
      
    }
    else {
      const dataWithUpdateId = { ...createBody, costheadId: this.fromParent.costheadId };
    
      this.commonService.UpdateToST(`costhead/${dataWithUpdateId.costheadId}`,dataWithUpdateId).subscribe((data: any) => {

        if (data) {
          this.notification.create(
            'success',
            'Update Successfully',
            ''
          );
          this.onClose();
          this.getList.emit(data);
        }
      }, (error) => {
        this.notification.create('error',error?.error?.error?.message , '');
      });
    }
  }

}
