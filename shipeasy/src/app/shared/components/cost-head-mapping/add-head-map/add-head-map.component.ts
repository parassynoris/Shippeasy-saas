import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subject } from 'rxjs';
import { ApiSharedService } from '../../api-service/api-shared.service';
import { CommonService } from 'src/app/services/common/common.service';

@Component({
  selector: 'app-add-head-map',
  templateUrl: './add-head-map.component.html',
  styleUrls: ['./add-head-map.component.css'],
})
export class AddHeadMapComponent implements OnInit , OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  @Input() public fromParent;
  @Input() public prentPath;
  @Input() public isAddModeData;
  @Input() public principalId;
  @Output() getList = new EventEmitter<any>();
  isAddMode: boolean = true;
  addCostHeadMapping: FormGroup;
  submitted: boolean = false;
  costheadList: any = [];
  selectedCostHead: any = [];

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private sharedService: ApiSharedService,
    private commonService: CommonService,
    private notification: NzNotificationService,
  ) {
    // do nothing.
  }

  ngOnInit(): void {
    this.getCostHeadList();
    this.addCostHeadMapping = this.formBuilder.group({
      costheadName: ['', Validators.required],
      costitemMapping: ['', Validators.required],
      vmscode: ['', Validators.required],
      status: [true],
      orgId: [''],
    });
    if (this.isAddModeData) {
      this.isAddMode = false;
      this.addCostHeadMapping.controls.costheadName.setValue(
        this.isAddModeData?._source?.costheadId
      );
      this.addCostHeadMapping.get('costheadName').disable();
      this.addCostHeadMapping.controls.orgId.setValue(
        this.isAddModeData?._source?.orgId
      );
      this.addCostHeadMapping.controls.costitemMapping.setValue(
        this.isAddModeData?._source?.costitemMapping
      );
      this.addCostHeadMapping.controls.vmscode.setValue(
        this.isAddModeData?._source?.vmscode
      );
      this.addCostHeadMapping.controls.status.setValue(
        this.isAddModeData?._source?.status
      );
    }
  }

  get f() {
    return this.addCostHeadMapping.controls;
  }

  onClose() {
    this.modalService.dismissAll();
  }
  onCostHeadChange(costHead): void {
  }

  getCostHeadList() {
    let mustArray = [];
    if (!this.isAddModeData) {
      mustArray.push({"match": {"status": true}})
    }
    var parameter = {
      size: 10000,
      from: 0,
      query: {
        bool: {
          must: mustArray,
          filter: [],
          should: [],
          must_not: [],
        },
      },
    };
    this.commonService.getCostHeadList(parameter)?.subscribe((data) => {
      this.costheadList = data.hits.hits;      
    });
  }

  setCostHead(e) {
    this.selectedCostHead = this.costheadList.find(
      (activity) => activity._id === e.target.value
    );
    this.addCostHeadMapping.patchValue({
      costitemMapping: this.selectedCostHead._source.costheadName,
      orgId: this.principalId,
      costheadId: this.selectedCostHead._source.costheadId,
      status: this.selectedCostHead._source.status,
    });
  }

  saveCostHeadMapping() {
    this.submitted = true;
    if (this.addCostHeadMapping.invalid) {
      return;
    }
    const newdata = {
      tenantId: '',
      orgId: this.principalId,
      costheadId :  this.addCostHeadMapping.controls.costheadName.value,
      costheadName: this.costheadList.filter(
        (x) =>
          x._source.costheadId ==
          this.addCostHeadMapping.controls.costheadName.value
      )[0]?._source?.costheadName,
      costitemMapping: this.addCostHeadMapping.controls.costitemMapping.value,
      vmscode: this.addCostHeadMapping.controls.vmscode.value,
      status: this.addCostHeadMapping.controls.status.value,
    };
    let data = [newdata];
    if (this.isAddMode) {
      this.sharedService.createCostHead(data).subscribe((res) => {
        this.modalService.dismissAll();
        this.notification.create('success', 'Added Successfully', '');
        
        this.getList.emit(res);
      });
    } else {
      const dataWithUpdateId = {
        ...newdata,
      };
      const data = [dataWithUpdateId];
      this.sharedService.updateCostHead(data).subscribe((result) => {
        this.modalService.dismissAll();
        this.notification.create('success', 'Update Successfully', '');
        
        this.getList.emit(result);
      });
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
