import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CostItemDetail } from '../costitem';
import { CommonService } from 'src/app/services/common/common.service';
import { ApiSharedService } from '../../api-service/api-shared.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-add-item-map',
  templateUrl: './add-item-map.component.html',
  styleUrls: ['./add-item-map.component.css']
})
export class AddItemMapComponent implements OnInit , OnDestroy{
  private ngUnsubscribe = new Subject<void>();


  @Input() public fromParent;
  @Input() public principalId;
  @Output() getList = new EventEmitter<any>()
  isAddMode: boolean = true;
  addCostItemMapping: FormGroup;
  submitted: boolean = false;
  costItemDetail: CostItemDetail = new CostItemDetail();
  costheadList: any = [];
  selectedCostItem: any = [];

  constructor(private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private notification: NzNotificationService,
    private commonService: CommonService,
    private sharedService: ApiSharedService
    ) {
    // do nothing.
  }


  ngOnInit(): void {
    this.getCostHeadList();
    this.addCostItemMapping = this.formBuilder.group(
      {
        CostItemName: ['', Validators.required],
        costitemMapping: ['', Validators.required],
        vmscode: [''],
        costitemCode:[''],
        Status: [true]
      },
    );
    if (this.fromParent) {
      this.addCostItemMapping.controls.CostItemName.setValue(this.fromParent._source?.costitemId);
      this.addCostItemMapping.controls.costitemMapping.setValue(this.fromParent._source?.costitemMapping);
      this.addCostItemMapping.controls.vmscode.setValue(this.fromParent._source?.vmscode);
      this.addCostItemMapping.controls.Status.setValue(this.fromParent._source?.status);

    }
  }

  get f() { return this.addCostItemMapping.controls; }

  onClose() {
    this.modalService.dismissAll();
  }

  setCostItem(e) {
    this.selectedCostItem = this.costheadList.find(evt => evt._id === e.target.value);
    this.addCostItemMapping.patchValue({
      costitemMapping: this.selectedCostItem._source.costItemName,
      orgId: this.principalId,
      costItemName: this.selectedCostItem._source.costItemName,
      costitemCategory: this.selectedCostItem._source.costitemCategory,
      costitemType: this.selectedCostItem._source.costitemType,
      costitemTags: this.selectedCostItem._source.costitemTags,
      costitemUnit: this.selectedCostItem._source.costitemUnit,
      isChargable: this.selectedCostItem._source.isChargable,
      financeCode: this.selectedCostItem._source.financeCode,
      costitemGroup: this.selectedCostItem._source.costitemGroup,
      isActive: this.selectedCostItem._source.isActive,
    })
  }

  getCostHeadList() {
    let mustArray = []
    if(!this.fromParent){
      mustArray.push({"match": {"status": true}})
    }

    var parameter = {
      "size": 10000,
      "from": 0,
      "query": {
        "bool": {
          "must":mustArray,
          "filter": [],
          "should": [],
          "must_not": []
        }
      }
    }
    this.commonService.getCostItemList(parameter)?.subscribe((data) => {
      this.costheadList = data.hits.hits;
    });
  }

  saveCostHead() {
    this.submitted = true;
    if (this.addCostItemMapping.invalid) {
      return;
    }
    var parentId = this.principalId;

    const newdata = {
      tenantId: parentId,
      orgId: parentId,
      costItemParentId: this.fromParent ? this.addCostItemMapping.value.costitemName : '',
      costitemName: this.costheadList.filter(x => x._source.costitemId === this.addCostItemMapping.value.CostItemName)[0]?._source?.costitemName,
      costitemMapping: this.addCostItemMapping.controls.costitemMapping.value,
      vmscode: this.addCostItemMapping.controls.vmscode.value,
      status: this.addCostItemMapping.controls.Status.value,
      costitemCode: ""
    }


    let newDepartment = [newdata];
    if (this.fromParent) {
      const UpdatedataSend = { ...newdata, costitemId: this.fromParent._source.costitemId };
      const data = [UpdatedataSend];
      this.sharedService.updateCostItem(data).subscribe((data: any) => {
        if (data) {
          this.modalService.dismissAll();
          this.notification.create(
            'success',
            'Update Successfully',
            ''
          );

          this.getList.emit(data);
        }
      })
    }
    else {
      this.sharedService.createCostItem(newDepartment).subscribe((data: any) => {
        if (data) {
          this.modalService.dismissAll();
          this.notification.create(
            'success',
            'Added Successfully',
            ''
          );

          this.getList.emit(data);
        }
      })
    }
  }


  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

