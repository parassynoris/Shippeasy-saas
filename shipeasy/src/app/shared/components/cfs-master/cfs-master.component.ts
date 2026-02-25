import { Component,  Input, OnInit } from '@angular/core';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
@Component({
  selector: 'app-cfs-master',
  templateUrl: './cfs-master.component.html',
  styleUrls: ['./cfs-master.component.css']
})
export class CfsMasterComponent implements OnInit {
  cfsList:any=[];
  toalLength: any = 100;
  count = 0;
  size = 10;
  page = 1;
  fromSize: number = 1;
  constructor(private profilesService: ProfilesService,private modalService: NgbModal,private notification: NzNotificationService) { }

  ngOnInit(): void {
    this.getcfsList();
  }
  getcfsList() {
    var parameter = {
      "size": Number(this.size),
      "from": this.page - 1,
      "sort": { createdOn: 'desc' },
      "query": {
        "bool": {
          "must":[],
          "filter": [],
          "should": [],
          "must_not": []
        }
      }
    }
    this.profilesService.getCostHeadList(parameter)?.subscribe((data) => {
      this.cfsList = data.hits.hits;
      this.toalLength = data.hits.total.value;
      this.count = data.hits.hits.length;
    });
  }

  clear() {
    this.getcfsList()
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
    this.getcfsList()
  }

  search() {
    let mustArray = [];
   
    var parameter = {
      "size": Number(this.size),
      "from": 0,
      "sort": {
        createdOn: 'desc',
      },
      "query": {
        "bool": {
          "must": mustArray
        }
      }
    }
    this.profilesService.getCostHeadList(parameter).subscribe((data) => {
      this.getcfsList = data.hits.hits;
      this.toalLength = data.hits.total.value;
      this.count = data.hits.hits.length
    })
  }

  getPaginationData(type: any) {
    this.fromSize = type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
    var parameter = {
      "size": Number(this.size),
      "from": this.fromSize - 1,
      "query": {
        "bool": {
          "must": [],
          "filter": [],
          "should": [],
          "must_not": []
        }
      }
    }
    this.profilesService.getCostHeadList(parameter).subscribe(data => {
      this.getcfsList = data.hits.hits;
      this.toalLength = data.hits.total.value;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count = type === 'prev' ? this.toalLength === this.count ? this.count - (this.toalLength % Number(this.size)) : this.count - data.hits.hits.length : this.count + data.hits.hits.length;
    })
  }

  open(content: any = null, guid: any = null) {
    const modalRef = this.modalService.open('content', {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg'
    });
    modalRef.componentInstance.getList.subscribe((res: any) => {
      if (res) {
        this.getcfsList();
      }
    })
    modalRef.componentInstance.fromParent = guid;
    modalRef.componentInstance.isAddModeData = content;
  }

  delete(deleteactivity, id) {
    this.modalService.open(deleteactivity, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: '',

      ariaLabelledBy: 'modal-basic-title'
    }).result.then((result) => {

      if (result === 'yes') {
        let data = {
          costheadId: id._source.costheadId,
          searchKey: "costheadId"
        }
        const body = [data]

        this.profilesService.deleteCostHead(body).subscribe((res: any) => {
          this.notification.create(
            'success',
            'Delete Successfully',
            ''
          );
          this.getcfsList();
        })
      }
    });

  }
  changeStatus(data) {
    this.profilesService.updateCostHead([{ ...data?._source, status: !data?._source?.status }]).subscribe((res: any) => {
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
