import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { batch } from '../../../data';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/admin/principal/api.service';
import * as Constant from 'src/app/shared/common-constants';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { BaseBody } from '../../../../smartagent/base-body';

@Component({
  selector: 'app-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss']
})
export class ContainerComponent implements OnInit {

  @Output() SaveNew = new EventEmitter<string>();
  addContainerForm: FormGroup;
  submitted: boolean;
  yardList: any = [];
  containerTypeList: any = [];
  containerList: any = [];
  baseBody: any;
  selectedContainer: any;
  constructor(private formBuilder: FormBuilder,
    private _api: ApiService,
    private notification: NzNotificationService) {
    // do nothing.
  }

  onSelectContainer(evt) {
    return;
  }

  ngOnInit(): void {
    // do nothing.
    this.addContainerForm = this.formBuilder.group({
      yard: ['', Validators.required],
      containerType: ['', Validators.required]
    });
    this.getSystemTypeDropDowns();
    this.getLocation();

  }   get f() { return this.addContainerForm.controls; }
  getSystemTypeDropDowns() {
    this.baseBody = new BaseBody();

    let must = [
      {
        match: {
          typeCategory: "containerType",
        }
      },
      {
        match: {
        }
      }
    ];

    this.baseBody.baseBody.query.bool.must = must;
    this._api.getListByURL("transaction/list?type=systemtype", this.baseBody.baseBody)?.subscribe((res: any) => {
      this.containerTypeList = res?.hits?.hits?.filter(x => x._source.typeCategory === "containerType");
    });
  }
  getLocation() {

    this.baseBody = new BaseBody();

    let must = [
      {
        match: {
          "Yard" : true
        }
      },
      {
        match: {
          status: 'true',
        },
      }
    ];

    this.baseBody.baseBody.query.bool.must = must;
    this._api.getListByURL("master/list?type=location",this.baseBody.baseBody)?.subscribe((res :any) => {
      this.yardList = res?.hits?.hits;
    });
  }

  getContainerData() {
    this.baseBody = new BaseBody();
    var match = [];
    if (this.addContainerForm.controls.containerType.value) {
      match.push({
        match: {
          containerTypeId: this.addContainerForm.controls.containerType.value,
        }
      });
    }
    if (this.addContainerForm.controls.yard.value) {
      match.push({
        match: {
          yardId: this.addContainerForm.controls.yard.value,
        }
      });
    }
    this.baseBody.baseBody.query.bool.must = match;

    this._api.getListByURL(Constant.MASTER_CONTAINER_LIST, this.baseBody.baseBody).subscribe((res: any) => {
      this.containerList = res?.hits?.hits;
    });
  }
}
