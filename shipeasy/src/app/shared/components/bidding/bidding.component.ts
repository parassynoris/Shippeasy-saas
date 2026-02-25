import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from 'src/app/services/common/common.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-bidding',
  templateUrl: './bidding.component.html',
  styleUrls: ['./bidding.component.scss']
})
export class BiddingComponent implements OnInit {
  enquiryList: any = []
  constructor(private commonService: CommonService, private route: ActivatedRoute, public loaderService: LoaderService, public notification: NzNotificationService,) { }

  ngOnInit(): void {
    this.getEnquiryList()
  }
   getEnquiryList() {
    this.loaderService.showcircle();
    this.enquiryList = []
    // this.page = 1;
    // this.fromSize = 1;
    var parameter = {
      "project": [],
      "query": {
        enquiryId: this.route.snapshot.params['id']
      },
      "sort": {
        "desc": ["createdOn"]
      },
    }


    this.commonService.getSTList('transportinquiry', parameter)?.subscribe((data: any) => {
        this.enquiryList = data.documents;
        this.loaderService.hidecircle();
      }, (error) => {
        this.loaderService.hidecircle();
        this.notification?.create('error', error?.error?.error?.message, '');
      });
  }

  rejectRow(e) {
    let payload = {
      ...e,
      adminStatus: 'Rejected',
      "carrierStatus": 'Rejected',
    }
    let url = `transportinquiry/${payload?.transportinquiryId}`
    this.commonService.UpdateToST(url, payload)?.subscribe((res: any) => {
      if (res) {
        this.notification.create('success', 'Rejected Successfully..!', '');
        setTimeout(() => {
          this.getEnquiryList()
        }, 1000);
      }
    }, error => {
      this.notification.create(
        'error',
       error?.error?.error?.message,
        ''
      );
    });
  }

  saveAction(row) {  
    this.enquiryList?.filter((item, index) => {
      if (item?.adminStatus != 'Rejected') {
        if (item.transportinquiryId == row.transportinquiryId) {
          this.enquiryList[index].carrierStatus = 'Accepted'
          this.enquiryList[index].adminStatus = 'Accepted'

        } else {
          this.enquiryList[index].carrierStatus = 'Rejected'
          this.enquiryList[index].adminStatus = 'Rejected'
          this.enquiryList[index].remarks = 'Other bidding accepted'
        }
      }
    })
    this.commonService.batchUpdate('transportinquiry/batchupdate', this.enquiryList)?.subscribe((res: any) => {
      if (res) {
        this.notification.create(
          'success',
          'Bidding Accepted',
          ''
        );
      }
    });

  }
}
