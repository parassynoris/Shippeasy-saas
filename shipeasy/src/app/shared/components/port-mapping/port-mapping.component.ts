import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddPortMappingComponent } from './add-port-mapping/add-port-mapping.component';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from 'src/app/services/common/common.service';
import { Subject } from 'rxjs';
import { ApiSharedService } from '../api-service/api-shared.service';

@Component({
  selector: 'app-port-mapping',
  templateUrl: './port-mapping.component.html',
  styleUrls: ['./port-mapping.component.scss'],
})
export class PortMappingComponent implements OnInit , OnDestroy  {
  private ngUnsubscribe = new Subject<void>();
  toalLength: any = 100;
  count = 0;
  size = 10;
  page = 1;
  authority: any;
  fromSize: number = 1;
  type: any;
  country: any;
  address: any;
  port_type: any;
  terminal: any;
  port_name: any;
  map_name: any;
  principal_code: any;
  cargo_type: any;
  PortData: any = [];
  berth: any;
  @Input() prentPath: any;

  constructor(
    private modalService: NgbModal,
    private commonService: CommonService,
    private sharedService: ApiSharedService,
    private route: ActivatedRoute,
    private notification: NzNotificationService
  ) {}

  ngOnInit(): void {
    this.getData();
  }

  async getData() {
    var agentId = await this.commonService.getCurrentAgentDetails()?.orgId;
    this.page = 1;
    var parameter = {
      size: Number(this.size),
      from: this.page - 1,
      query: {
        bool: {
          must: [{
            "match": {
              "isType": "portMapping"
            }
          }], 
          filter: [],
          should: [],
          must_not: [],
        },
      },
    };
    this.commonService.portList(parameter).subscribe((res: any) => {
      this.PortData = res.hits.hits;
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
        "match": {
          "isType": "portMapping"
        }
      },
    ];
    this.fromSize =
      type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
    var parameter = {
      size: Number(this.size),
      from: this.fromSize - 1,
      query: {
        bool: {
          must: [must],
          filter: [],
          should: [],
          must_not: [],
        },
      },
    };
    this.commonService.portList(parameter).subscribe((data) => {
      this.PortData = data.hits.hits;
      this.toalLength = data.hits.total.value;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count =
        type === 'prev'
          ? this.toalLength === this.count
            ? this.count - (this.toalLength % Number(this.size))
            : this.count - data.hits.hits.length
          : this.count + data.hits.hits.length;
    });
  }

  search() {
    let mustArray = [];
    let data=
    {
      "match": {
        "isType": "portMapping"
      }
    }
   mustArray.push(data);
    if (this.port_name) {
      mustArray.push({
        match: {
          portName: this.port_name,
        },
      });
    }
    if (this.map_name) {
      mustArray.push({
        match: {
          portMappingName: this.map_name,
        },
      });
    }
    if (this.country) {
      mustArray.push({
        match: {
          country: this.country,
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
    if (this.cargo_type) {
      mustArray.push({
        match: {
          cargoType: this.cargo_type,
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
    this.commonService.portList(parameter).subscribe((data) => {
      this.PortData = data.hits.hits;
      this.toalLength = data.hits.total.value;
      this.count = data.hits.hits.length;
    });
  }

  clear() {
    this.port_name = '';
    this.map_name = '';
    this.principal_code = '';
    this.cargo_type = '';
    this.country = '';
    this.getData();
  }

  open(content: any = null, guid: any = null) {
    const modalRef = this.modalService.open(AddPortMappingComponent, {
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
              portId: id._source.portId,
              searchKey: 'portId',
            };
            const body = [data];

            this.sharedService.deletePort(body).subscribe((res: any) => {
              if (res) {
                this.notification.create(
                  'success',
                  'Deleted Successfully',
                  ''
                );
                this.getData();
              }
            });
          }
        },
        (reason) => {
          // do nothing.
        }
      );
  }
  changeStatus(data) {
    this.sharedService.updatePort([{ ...data?._source, status: !data?._source?.status }]).subscribe((res: any) => {
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
