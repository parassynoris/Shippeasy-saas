import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { AddactivityComponent } from './addactivity/addactivity.component';
import * as Constant from 'src/app/shared/common-constants';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent implements OnInit {
  toalLength: any;
  count = 0;
  size = 10;
  page = 1;
  fromSize: number = 1;
  activityList: any = [];
  name : any;
  type: any;
  impact: any;
  laden_apllicable: any;
  status: any;
  order: boolean = true;

  constructor(private modalService: NgbModal, public masterService: MastersService, private profilesService: ProfilesService
    ,public notification: NzNotificationService,
    private route: ActivatedRoute,) {
      // do nothing.
     }

  ngOnInit(): void {
    setTimeout(() => {
      this.getData();
    }, 500);
  }
  getData() {
    var agentId = this.profilesService.getCurrentAgentDetails()?.agentId;
    this.page = 1;
    var parameter = {
      "size": Number(this.size),
      "from": this.page - 1,
      "sort": {
        "updatedOn": "desc"
      },
      "query": {
        "bool": {
          "must": [{
            "match":{}
          }],
          "filter": [],
          "should": [],
          "must_not": []
        }
      }
    }
    this.masterService.getActivityList(parameter).subscribe((res: any) => {
      this.activityList = res.hits.hits
      this.toalLength = res.hits.total.value;
      this.count = res.hits.hits.length;
    })
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
    this.getData()
  }

  getPaginationData(type: any) {
    this.fromSize = type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1
    var parameter = {
      "size": Number(this.size),
      "from": this.fromSize - 1,
      "query": {
        "bool": {
          "must": [{
            "match":{}
          }],
          "filter": [],
          "should": [],
          "must_not": []
        }
      }
    }
    this.masterService.getActivityList(parameter).subscribe((res: any) => {
      this.activityList = res.hits.hits
      this.toalLength = res.hits.total.value;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count = type === 'prev' ? this.toalLength === this.count ? this.count - (this.toalLength % Number(this.size)) : this.count - res.hits.hits.length : this.count + res.hits.hits.length
    })
  }

  search() {
    let mustArray = [];
    mustArray.push({
      "match":{}
    })
    if (this.name) {
      mustArray.push({
        wildcard: {
          'containerStatusCode': "*"+this.name.toLowerCase()+"*"
        },
      })
    }
    if (this.type) {
      mustArray.push({
        wildcard: {
          'containerDesignastion': "*"+this.type.toLowerCase()+"*"
        },
      })
    }
    if (this.impact) {
      mustArray.push({
        wildcard: {
          'description': "*"+this.impact.toLowerCase()+"*"
        },
      })
    }
    if (this.laden_apllicable) {
      mustArray.push({
        wildcard: {
          'activityType': "*"+this.laden_apllicable.toLowerCase()+"*"
        },

      })
    }
    if (this.status) {
      mustArray.push({
        wildcard: {
          'status': this.status === 'true' ? true : false
        },
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
    this.masterService.getActivityList(parameter).subscribe((res: any) => {
      this.activityList = res.hits.hits
      this.toalLength = res.hits.total.value;
      this.count = res.hits.hits.length
    })
  }

  clear() {
    this.name = '';
    this.type= '';
    this.impact= '';
    this.laden_apllicable= '';
    this.status= '';
    this.getData();
  }

  open(content: any = null, guid: any = null) {
    const modalRef = this.modalService.open(AddactivityComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg'
    });
    modalRef.componentInstance.getList.subscribe((res: any) => {
      if (res) {
        this.getData();
      }
    })
    modalRef.componentInstance.fromParent = guid;
    modalRef.componentInstance.isType= content;
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
          activityId: id._source.activityId,
          searchKey: "activityId"
        }
        const body = [data]

        this.masterService.deleteActivity(body).subscribe((res: any) => {
          this.notification.create(
            'success',
            'Delete Successfully',
            ''
          );
          this.getData();
        })

      }
    }, (reason) => {
      // do nothing.
    });

  }
  changeStatus(data) {
    this.masterService.creatOrUpdateActivity(Constant.UPDATE_ACTIVITY,[{ ...data?._source, status: !data?._source?.status }]).subscribe((res: any) => {
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



  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.activityList.map((row: any) => {
      storeEnquiryData.push({
        'Activity Name': row._source?.activityName,
        'Activity Type Id': row._source?.activityType,
        'Cargo Impact': row._source?.isCargoImpact ? "Yes" : "No",
        'Laden/Ballast Applicable': row._source?.isLadenBallastApplicable ? "yes" : "No",
        'Status': row._source?.status ? "Active" : "In Active",
      });
    });
    const myworksheet: XLSX.WorkSheet =
      XLSX.utils.json_to_sheet(storeEnquiryData);
    const myworkbook: XLSX.WorkBook = {
      Sheets: { data: myworksheet },
      SheetNames: ['data'],
    };
    const excelBuffer: any = XLSX.write(myworkbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const fileName = 'activity.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  openPDF() {
    var prepare=[];
    this.activityList.forEach(e=>{
      var tempObj =[];
      tempObj.push(e._source?.activityName);
      tempObj.push(e._source?.activityType);
      tempObj.push(e._source?.isCargoImpact? "Yes" : "No");
      tempObj.push(e._source?.isLadenBallastApplicable? "yes" : "No");
      tempObj.push(e._source?.status? "Active" : "In Active");
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [297, 210]);
    autoTable(doc,{
        head: [['Activity Name','Activity Type Id','Cargo Impact','Laden/Ballast Applicable','Status']],
        body: prepare
    });
    doc.save('activity' + '.pdf');
  }

}
