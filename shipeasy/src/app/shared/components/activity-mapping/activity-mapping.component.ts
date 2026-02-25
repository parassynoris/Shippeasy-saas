import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/services/common/common.service';
import { ApiSharedService } from '../api-service/api-shared.service';
import { AddActivityMappingComponent } from './add-activity-mapping/add-activity-mapping.component';

@Component({
  selector: 'app-activity-mapping',
  templateUrl: './activity-mapping.component.html',
  styleUrls: ['./activity-mapping.component.scss'],
})
export class ActivityMappingComponent implements OnInit , OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  toalLength: any = 100;
  count = 0;
  size = 10;
  page = 1;
  authority: any;
  map_name: any;
  principal_code: any;
  status: any;
  fromSize: number = 1;
  activityList: any = [];
  @Input() prentPath: any;

  constructor(
    private modalService: NgbModal,
    private notification: NzNotificationService,
    private commonService: CommonService,
    private sharedService: ApiSharedService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.getData();
    }, 500);
  }

  async getData() {
    var agentId = await this.commonService.getCurrentAgentDetails()?.orgId;
    let must = [
    
    ];
    this.page = 1;
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
    this.commonService.getActivityList(parameter).subscribe((res: any) => {
      this.activityList = res.hits.hits;
      this.toalLength = res.hits.total.value;
      this.count = res.hits.hits.length;
    });
  }

  next() {
    if (this.toalLength > this.count) {
      this.getPaginationData('next');
    }
  }

  prev() {
    if (this.page > 0) {
      this.getPaginationData('prev');
    }
  }

  filter(e) {
    this.size = e.target.value;
    this.fromSize = 1;
    this.getData();
  }

  getPaginationData(type: any) {
    var agentId = this.commonService.getCurrentAgentDetails()?.agentId;
    let must = [
      {
        match: {
          orgId: '1',
        },
      },
    ];
    this.fromSize =
      type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
    var parameter = {
      size: Number(this.size),
      from: this.fromSize - 1,
      query: {
        bool: {
          must: must,
          filter: [],
          should: [],
          must_not: [],
        },
      },
    };
    this.commonService.getActivityList(parameter).subscribe((res: any) => {
      this.activityList = res.hits.hits;
      this.toalLength = res.hits.total.value;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count =
        type === 'prev'
          ? this.toalLength === this.count
            ? this.count - (this.toalLength % Number(this.size))
            : this.count - res.hits.hits.length
          : this.count + res.hits.hits.length;
    });
  }

  search() {
    let mustArray = [];
    if (this.map_name) {
      mustArray.push({
        match: {
          mappingName: this.map_name,
        },
      });
    }
    if (this.principal_code) {
      mustArray.push({
        match: {
          principalCode: this.principal_code,
        },
      });
    }
    if (this.status) {
      mustArray.push({
        match: {
          status: this.status,
        },
      });
    }
    var agentId = this.commonService.getCurrentAgentDetails()?.agentId;
 
    var parameter = {
      size: Number(this.size),
      from: 0,
      query: {
        bool: {
          must: mustArray,
        },
      },
    };
    this.commonService.getActivityList(parameter).subscribe((res: any) => {
      this.activityList = res.hits.hits;
      this.toalLength = res.hits.total.value;
      this.count = res.hits.hits.length;
    });
  }

  clear() {
    this.map_name = '';
    this.principal_code = '';
    this.status = '';
    this.getData();
  }

  open(content: any = null, guid: any = null) {
    const modalRef = this.modalService.open(AddActivityMappingComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
    modalRef.componentInstance.getList.subscribe((res: any) => {
      if (res) {
        this.getData();
      }
    })
    modalRef.componentInstance.fromParent = guid;
    modalRef.componentInstance.prentPath = this.prentPath;
    modalRef.componentInstance.isAddModeData = content;
    modalRef.componentInstance.principalId = this.route.snapshot.params['id'];
  }
  onEdit(content, guid: any) {
    this.open(content, guid);
  }

  delete(deleteport, id) {
    this.modalService
      .open(deleteport, {
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
              activityId: id._source.activityId,
              searchKey: 'activityId',
            };
            const body = [data];

            this.sharedService.deleteActivity(body).subscribe((res: any) => {
              this.notification.create('success', 'Delete Successfully', '');
              this.getData();
            });
          }
        },
        (reason) => {
          // do nothing.
        }
      );
  }
  changeStatus(data) {
    this.sharedService.updateActivity([{ ...data?._source, status: !data?._source?.status }]).subscribe((res: any) => {
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
