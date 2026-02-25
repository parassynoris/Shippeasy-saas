import { Component, OnInit, Input } from '@angular/core';
import { shared } from '../../data';
import { BaseBody } from 'src/app/admin/smartagent/base-body';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/admin/principal/api.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ActivatedRoute, Router } from '@angular/router';
import * as Constant from 'src/app/shared/common-constants';


@Component({
  selector: 'app-check-list',
  templateUrl: './check-list.component.html',
  styleUrls: ['./check-list.component.scss']
})
export class CheckListComponent implements OnInit {
  @Input() isAddNewSection: boolean = true;
  @Input() isOnlyShow: boolean = true;
  batchDetail: any = {};
  checkListData: any = [];
  isShow: any;
  isedited: boolean = false;
  baseBody: BaseBody;
  submitted: any = false;
  CheckList: any = [];
  id: any;
  fromSize: number = 1;
  toalLength: any;
  count = 0;
  page = 1;
  size = 10;
  addCheckListForm: FormGroup;

  isShown: boolean = false
  order: boolean = true;
  typeName: any;
  typeDescription: any;
  checkboxselected: boolean = false
  constructor(private fb: FormBuilder,
    private router: Router,
    private _api: ApiService,
    private notification: NzNotificationService,
    private route: ActivatedRoute) {
    // do nothing.
  }



  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.getBatchById(this.id);
    this.addCheckListForm = this.fb.group({
      GroundRent: ['', [Validators.required]],
      PaymentDetails: ['', [Validators.required]],
      OPS: ['', [Validators.required]],
      Remarks: [''],


    });
  }

  get f() { return this.addCheckListForm.controls; }

  getBatchById(id) {
    var parameter = {
      query: {
        bool: {
          must: [
            {
              "match": {
                "batchId": id
              }
            }
          ],
          filter: [],
          should: [],
          must_not: [],
        },
      },
    };
    this._api.getListByURL(Constant.BATCH_LIST, parameter)
      ?.subscribe((res: any) => {
        this.batchDetail = res?.hits?.hits[0]?._source;
        if (this.batchDetail?.CheckListData) {
          this.checkListData = this.batchDetail?.CheckListData.CheckList
          this.addCheckListForm.patchValue({
            GroundRent: this.batchDetail?.CheckListData?.GroundRent,
            PaymentDetails: this.batchDetail?.CheckListData?.PaymentDetails,
            OPS: this.batchDetail?.CheckListData?.OPS,
            Remarks: this.batchDetail?.CheckListData?.Remarks,
          });
        }
        else {
          this.getSystemTypeDropDowns();
        }
      })
  }


  getSystemTypeDropDowns() {

    this.page = 1;
    var parameter = {
      "size": Number(this.size),
      "from": this.fromSize - 1,
      "query": {
        "bool": {
          "must": [{
            "match": {
              "typeCategory": "checklist",
            }
          },
          {
            "match": {
            }
          },
          {
            "match": {
              "status": "true",
            }
          }]
        }
      }
    }

    this._api.getListByURL("master/list?type=systemtype", parameter)?.subscribe((res: any) => {
      this.CheckList = res?.hits?.hits;
      this.CheckList.forEach((x, index) => {
        this.checkListData[index] = { id: index, name: x?._source?.typeName, description: x?._source?.typeDescription, isSelected: (this.batchDetail?.CheckListData?.CheckList) ? (this.batchDetail?.CheckListData?.CheckList[index]?.isSelected) : false }
      })
      this.toalLength = res.hits.total.value;
      this.count = res.hits.hits.length;
    });
  }

  getPaginationData(type: any) {
    this.fromSize =
      type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
    var parameter = {
      "size": Number(this.size),
      "from": this.fromSize - 1,
      "query": {
        "bool": {
          "must": [
            {
              "match": {
                "typeCategory": "checklist",
              }
            },
            {
              "match": {
              }
            },
            {
              "match": {
                "status": "true",
              }
            }
          ]
        }
      }
    }
    this._api.getListByURL("master/list?type=systemtype", parameter)?.subscribe((res: any) => {
      this.CheckList = res?.hits?.hits;
      this.toalLength = res.hits.total.value;
      this.CheckList.forEach((x, index) => {
        this.checkListData[index] = { id: index, name: x?._source?.typeName, description: x?._source?.typeDescription, isSelected: (this.batchDetail?.CheckListData?.CheckList) ? (this.batchDetail?.CheckListData?.CheckList[index]?.isSelected) : false }
      })

      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count = type === 'prev' ? this.toalLength === this.count ? this.count - (this.toalLength % Number(this.size)) : this.count - res.hits.hits.length : this.count + res.hits.hits.length
    })

    this.toalLength = shared.checkListRow.length;
  }

  isAllSelected(i) {
    this.checkListData[i].isSelected  ;
  }

  clear() {
    this.typeName = '';
    this.typeDescription = '';
    this.getSystemTypeDropDowns();
  }

  search() {
    let mustArray = [];
    mustArray.push({
      match: {
        'typeCategory': "checklist",
      }
    }, {
      "match": {
      }
    },
    {
      "match": {
        "status": "true",
      }
    });
    if (this.typeName) {
      mustArray.push({
        match: {
          'typeName': this.typeName,
        }
      });
    }
    if (this.typeDescription) {
      mustArray.push({
        match: {
          'typeDescription': this.typeDescription,
        },
      });
    }
    var parameter = {
      size: Number(this.size),
      from: 0,
      query: {
        bool: {
          must: mustArray,
        },
      },
    };
    this._api.getListByURL("master/list?type=systemtype", parameter)?.subscribe((res: any) => {
      this.checkListData = res?.hits?.hits;

      this.checkListData.forEach((x, index) => {
        this.checkListData[index] = { id: index, name: x?._source?.typeName, description: x?._source?.typeDescription, isSelected: (this.batchDetail?.CheckListData?.CheckList[index]) ? (this.batchDetail?.CheckListData?.CheckList[index]?.isSelected) : false }
      })
      this.toalLength = res.hits.total.value;
      this.count = res.hits.hits.length;
    });
  }

  next() {
    if (this.toalLength > this.count) {
      this.getPaginationData('next')
    }
  }

  prev() {
    if (this.page > 0) {
      this.getPaginationData('prev')
    }
  }

  filter(e) {
    this.size = e.target.value;
    this.fromSize = 1;
    this.getSystemTypeDropDowns();
  }
  checkboxStatus() {
    this.checkListData.forEach(element => {
      if (element.isSelected) { this.checkboxselected = true }
    });
    if (!this.checkboxselected) {
      this.notification.create('error',
        'Please select atleast one checkbox',
        '');
      return false
    }
    this.submitted = true
    var url = Constant.UPDATE_BATCH;
    let CheckListData = {
      CheckList: this.checkListData,
      GroundRent: this.addCheckListForm.value.GroundRent,
      PaymentDetails: this.addCheckListForm.value.PaymentDetails,
      OPS: this.addCheckListForm.value.OPS,
      Remarks: this.addCheckListForm.value.Remarks,
    };
    this.batchDetail = [{ ...this.batchDetail, "poNo": this.batchDetail?.poNo ? this.batchDetail?.poNo : "", CheckListData }]
    if (this.addCheckListForm.invalid) {
      return false
    }

    this._api.SaveOrUpdate(url, this.batchDetail)?.subscribe(res => {
      if (res) {
        this.notification.create(
           'success',
          'Saved Successfully',
          ''
        );
      } else{
        this.notification.create(
          'success',
          'Updated Successfully',
          ''
        );
      }
      this.getBatchById(this.id);
    }, error => {
      this.getBatchById(this.id);
      this.notification.create(
        'error',
        error?.error?.error?.message,
        ''
      );
    });
  }

  sort(colName) {
    if (this.order) {
      let newdata = this.checkListData.sort((a, b) => a[colName] > b[colName] ? 1 : -1);
      this.checkListData = newdata
    }
    else {
      let newdata = this.checkListData.sort((a, b) => b[colName] > a[colName] ? 1 : -1);
      this.checkListData = newdata
    }
    this.order = !this.order;
  }
  onClose() {
    this.router.navigate(['/' + 'batch' + '/list']);
  }


}