import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
import { AddportComponent } from './addport/addport.component';

@Component({
  selector: 'app-port',
  templateUrl: './port.component.html',
  styleUrls: ['./port.component.scss'],
})
export class PortComponent implements OnInit {
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
  PortData: any = [];
  berth: any;
  @Input() prentPath: any;
  constructor(
    private modalService: NgbModal,
    private saMasterService: SaMasterService,
    private profilesService: ProfilesService
  ) {
    // do nothing.
  }

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
          orgId: agentId,
        },
      },
    ];
    this.page = 1;
    var parameter = {
      size: Number(this.size),
      from: this.page - 1,
      query: {
        bool: {
          must: must,
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
        match: {
          orgId: agentId,
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
    if (this.authority) {
      mustArray.push({
        match: {
          portName: this.authority,
        },
      });
    }
    if (this.type) {
      mustArray.push({
        match: {
          shortName: this.type,
        },
      });
    }
    if (this.country) {
      mustArray.push({
        match: {
          country: this.country,
        },
      });
      if (this.address) {
        mustArray.push({
          match: {
            berths: this.address,
          },
        });
      }
      if (this.port_type) {
        mustArray.push({
          match: {
            previousPort: this.port_type,
          },
        });
      }
      if (this.terminal) {
        mustArray.push({
          match: {
            nextPort: this.terminal,
          },
        });
      }
      if (this.berth) {
        mustArray.push({
          match: {
            portofLoading: this.berth,
          },
        });
      }
      var agentId = this.profilesService.getCurrentAgentDetails()?.agentId;
      mustArray.push({
        match: {
          orgId: agentId,
        },
      });
      var parameter = {
        size: Number(this.size),
        from: 0,
        query: {
          bool: {
            must: mustArray,
          },
        },
      };
      this.saMasterService.portList(parameter).subscribe((data) => {
        this.PortData = data.hits.hits;
        this.toalLength = data.hits.total.value;
        this.count = data.hits.hits.length;
      });
    }
  }

  clear() {
    this.authority = '';
    this.type = '';
    this.country = '';
    this.address = '';
    this.port_type = '';
    this.terminal = '';
    this.berth = '';
    this.getData();
  }

  open(content: any = null, guid: any = null) {
    const modalRef = this.modalService.open(AddportComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
    modalRef.componentInstance.fromParent = guid;
    modalRef.componentInstance.prentPath = this.prentPath;
    modalRef.componentInstance.isAddModeData = content;
  }
  onEdit(content, guid: any) {
    this.open(content, guid);
  }

  elete(deleteport, id) {
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

            this.saMasterService.deletePort(body).subscribe((res: any) => {
            });
          }
        },
        (reason) => {
          // do nothing.
        }
      );
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

            this.saMasterService.deletePort(body).subscribe((res: any) => {
              this.getData();
            });
          }
        },
        (reason) => {
          // do nothing.
        }
      );
  }
}
