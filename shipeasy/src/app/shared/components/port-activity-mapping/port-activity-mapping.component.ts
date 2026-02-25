import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
import { AddPortActivityMappingComponent } from './add-port-activity-mapping/add-port-activity-mapping.component';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-port-activity-mapping',
  templateUrl: './port-activity-mapping.component.html',
  styleUrls: ['./port-activity-mapping.component.scss'],
})
export class PortActivityMappingComponent implements OnInit {
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
  activity_name : any;
  map_name: any;
  principal_code: any;
  cargo_type: any;
  PortData: any = [];
  berth: any;
  @Input() prentPath: any;

  constructor(
    private modalService: NgbModal,
    private saMasterService: SaMasterService,
    private profilesService: ProfilesService,
    private route: ActivatedRoute,
    private notification: NzNotificationService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.getData();
    }, 500);
  }

  async getData() {
    var agentId = await this.profilesService.getCurrentAgentDetails()?.orgId;
    let must = [
      {
        match: {
          orgId: this.route.snapshot.params['id'],
        },
      },
    ];
    this.page = 1;
    var parameter = {
      size: Number(this.size),
      from: this.page - 1,
      query: {
        bool: {
          must: [{
            "match": {
              "isType": "portActivityMapping"
            }
          }], 
          filter: [],
          should: [],
          must_not: [],
        },
      },
    };
    this.saMasterService.portList(parameter).subscribe((res: any) => {
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
    var agentId = this.profilesService.getCurrentAgentDetails()?.agentId;
    let must = [
      {
        "match": {
          "isType": "portActivityMapping"
        }
      }
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
    this.saMasterService.portList(parameter).subscribe((data) => {
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
        "isType": "portActivityMapping"
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
    if (this.activity_name) {
      mustArray.push({
        match: {
          activity: this.activity_name,
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
          "country.countryName": this.country,
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
    this.saMasterService?.portList(parameter)?.subscribe((data) => {
      this.PortData = data.hits.hits;
      this.toalLength = data.hits.total.value;
      this.count = data.hits.hits.length;
    });
  }

  clear() {
    this.port_name = '';
    this.activity_name = '';
    this.map_name = '';
    this.principal_code = '';
    this.cargo_type = '';
    this.country = '';
    this.getData();
  }

  open(content: any = null, guid: any = null) {
    const modalRef = this.modalService.open(AddPortActivityMappingComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
    modalRef.componentInstance?.getList?.subscribe((res: any) => {
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

            this.saMasterService.deletePort(body)?.subscribe((res: any) => {
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
    this.saMasterService.updatePort([{ ...data?._source, status: !data?._source?.status }])?.subscribe((res: any) => {
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
}
