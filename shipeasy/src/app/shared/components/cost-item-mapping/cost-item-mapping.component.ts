import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddItemMapComponent } from './add-item-map/add-item-map.component';
import { ActivatedRoute } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/services/common/common.service';
import { ApiSharedService } from '../api-service/api-shared.service';

@Component({
  selector: 'app-cost-item-mapping',
  templateUrl: './cost-item-mapping.component.html',
  styleUrls: ['./cost-item-mapping.component.scss']
})
export class CostItemMappingComponent implements OnInit , OnDestroy{
  private ngUnsubscribe = new Subject<void>();
  toalLength: any = 100;
  count = 0;
  size = 10;
  page = 1;
  fromSize: number = 1;
  costItemList: any = [];
  costHead: any;
  costItemName: any;
  costItemMapName: any;
  costHeadMapName: any;
  status: any;
  vsmcode: any;
  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService,
    private sharedService: ApiSharedService,
    private modalService: NgbModal,private notification: NzNotificationService,) {
    // do nothing.
  }

  ngOnInit(): void {
    this.getCostItemList();
  }

  getCostItemList() {
    let must = [
     
    ];
    var parameter = {
      size: Number(this.size),
      from: this.page - 1,
      sort:{createdOn:'desc'},
      query: {
        bool: {
          must: must,
          filter: [],
          should: [],
          must_not: [],
        },
      },
    };
    this.commonService.getCostItemList(parameter)?.subscribe((data) => {
      this.costItemList = data.hits.hits;
      this.toalLength = data?.hits?.total.value;
      this.count = data?.hits?.hits.length;
    });
  }


  clear() {
    this.costItemName = ''
    this.costItemMapName = ''
    this.vsmcode = ''
    this.status = '';
    this.getCostItemList()
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

  filter(e) {
    this.size = e.target.value;
    this.fromSize = 1;
    this.getCostItemList()
  }

  search() {
    let mustArray = [];
    if (this.costItemName) {
      mustArray.push({
        "match": {
          "costItemName": this.costItemName,
        }
      })
    }
    if (this.costItemMapName) {
      mustArray.push({
        "match": {
          "costitemMapping": this.costItemMapName,
        }
      })
    }
    if (this.vsmcode) {
      mustArray.push({
        "match": {
          "vmscode": this.vsmcode,
        }
      })
    }
    if (this.status) {
      mustArray.push({
        "match": {
          "status": this.status,
        }
      })
    }
   
    var parameter = {
      "size": Number(this.size),
      "from": 0,
      "query": {
        "bool": {
          "must": mustArray
        }
      }
    }
    this.commonService.getCostItemList(parameter).subscribe((data) => {
      this.costItemList = data.hits.hits;
      this.toalLength = data?.hits?.total.value;
      this.count = data?.hits?.hits.length;
    })
  }

  getPaginationData(type: any) {
    this.fromSize = type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
    var parentId = this.route.snapshot.params['id'];
    let must = [{
      "match": {
        "orgId": '1'
      }
    }];
    var parameter = {
      "size": Number(this.size),
      "from": this.fromSize - 1,
      "query": {
        "bool": {
          "must": must,
          "filter": [],
          "should": [],
          "must_not": []
        }
      }
    }
    this.commonService.getCostItemList(parameter).subscribe(data => {
      this.costItemList = data.hits.hits;
      this.toalLength = data.hits.total.value;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count = type === 'prev' ? this.toalLength === this.count ? this.count - (this.toalLength % Number(this.size)) : this.count - data.hits.hits.length : this.count + data.hits.hits.length;
    })
  }

  open(content: any = null, guid: any = null) {
    const modalRef = this.modalService.open(AddItemMapComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg'
    });
    modalRef.componentInstance.getList.subscribe((res: any) => {
      if (res) {
        this.getCostItemList();
      }
    })
    modalRef.componentInstance.fromParent = guid;
    modalRef.componentInstance.principalId = this.route.snapshot.params['id'];
  }

  delete(deleteCostItem, id) {
    this.modalService
      .open(deleteCostItem, {
        backdrop: 'static',
        keyboard: false,
        centered: true,
        size: '',

        ariaLabelledBy: 'modal-basic-title',
      })
      .result.then(
        (result) => {
          if (result === 'yes') {
            let data = {
              costitemId: id._source.costitemId,
              searchKey: 'costitemId',
            };
            const body = [data];

            this.sharedService.deleteCostItem(body).subscribe((res: any) => {
              this.notification.create('success', 'Delete Successfully', '');
              this.getCostItemList();
            });
          }
        },
        (reason) => {
          // do nothing.
        }
      );
  }
  changeStatus(data) {
    this.sharedService.updateCostItem([{ ...data?._source, status: !data?._source?.status }]).subscribe((res: any) => {
      if (res) {
        this.notification.create(
          'success',
          'Status Updated Successfully',
          ''
        );
        this.search();
      }
    }, error => {
      this.notification.create(
        'error',
        error?.error?.error?.message,
        ''
      );
    });
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
