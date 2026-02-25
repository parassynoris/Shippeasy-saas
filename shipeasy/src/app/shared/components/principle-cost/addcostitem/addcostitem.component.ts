import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CostItemDetail } from '../costitem';

@Component({
  selector: 'app-addcostitem',
  templateUrl: './addcostitem.component.html',
  styleUrls: ['./addcostitem.component.css']
})
export class AddcostitemComponent implements OnInit {

  @Input() public fromParent;
  @Input() public prentPath;
  @Input() public isAddModeData;
  isAddMode: boolean = true;
  addHoliday: FormGroup;
  submitted: boolean = false;
  costItemDetail: CostItemDetail = new CostItemDetail();
  costheadList: any = [];
  constructor(private modalService: NgbModal, private formBuilder: FormBuilder, private profilesService: ProfilesService
    , private notification: NzNotificationService) { 
      // do nothing.
    }


  ngOnInit(): void {
    this.getCostHeadList();
    this.addHoliday = this.formBuilder.group(
      {
        CostHeadId: ['', Validators.required],
        CostItemName: ['', Validators.required],
        Status: [Validators.required],
      },
    );
    if (this.isAddModeData) {
      this.isAddMode = false;
      this.addHoliday.controls.CostItemName.setValue(this.isAddModeData?._source?.costitemName);
      this.addHoliday.controls.Status.setValue(this.isAddModeData?._source?.status);
      this.addHoliday.controls.CostHeadId.setValue(this.isAddModeData?._source?.costheadId);
    }
  }
  get f() { return this.addHoliday.controls; }
  onClose() {
    this.modalService.dismissAll();
  }
  getCostHeadList() {
    var agentId = this.profilesService.getCurrentAgentDetails()?.agentId;
    let must = [{
      "match": {
        "orgId": agentId
      }
    }];
    var parameter = {
      "size": 500,
      "from": 0,
      "query": {
        "bool": {
          "must": must,
          "filter": [],
          "should": [],
          "must_not": []
        }
      }
    }
    this.profilesService.getCostHeadList(parameter)?.subscribe((data) => {
      this.costheadList = data.hits.hits;
    });
  }
  saveCostHead() {
    this.submitted = true;
    if (this.addHoliday.invalid) {
      return;
    }
    this.createModel();
    var createBody = [];
    createBody.push(this.costItemDetail);
    if (this.isAddModeData) {
      this.profilesService.updateCostItem(createBody).subscribe((data: any) => {
        if (data) {
          this.notification.create(
            'success',
            'Update Successfully',
            ''
          );
          this.modalService.dismissAll();
          window.location.assign('/' + this.prentPath + '/cost-items');
        }
      })
    }
    else {
      this.profilesService.createCostItem(createBody).subscribe((data: any) => {
        if (data) {
          this.notification.create(
            'success',
            'Added Successfully',
            ''
          );
          this.modalService.dismissAll();
          window.location.assign('/' + this.prentPath + '/cost-items');
        }
      })
    }
  }

  createModel() {
    var agentId = this.profilesService.getCurrentAgentDetails()?.agentId;
    this.costItemDetail.costitemName = this.addHoliday.controls.CostItemName.value;
    this.costItemDetail.costheadId = this.addHoliday.controls.CostHeadId.value;
    this.costItemDetail.costheadName = this.costheadList.filter(x => x._id === this.costItemDetail.costheadId)[0]?._source?.costHeadName;
    this.costItemDetail.costitemId = this.isAddModeData ? this.isAddModeData?._source?.costitemId : "";
    this.costItemDetail.tenantId = agentId;
    this.costItemDetail.status = this.addHoliday.controls.Status.value;
    this.costItemDetail.orgId = agentId;
  }

}
