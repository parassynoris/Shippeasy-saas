import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ApiService } from '../../principal/api.service';
import * as Constant from 'src/app/shared/common-constants';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from 'src/app/services/common/common.service';
@Component({
  selector: 'app-update-bond',
  templateUrl: './update-bond.component.html',
  styleUrls: ['./update-bond.component.scss']
})
export class UpdateBondComponent implements OnInit {
  houseBlList: any = []
  vesseldata: any;
  voyageData: any;
  tankData: any = [];

  constructor(private router: Router,
    private location: Location,
    private _api: ApiService,
    private route: ActivatedRoute,
    private masterservice: MastersService,
    private notification: NzNotificationService, private commonService: CommonService) { }

  ngOnInit(): void {
    this.getBLById()
    this.getVesselData()
  }
  getVesselData() {
    let payload = this.commonService.filterList()

    payload.query = {}

    this.commonService.getSTList("vessel", payload).subscribe((res: any) => {
      this.vesseldata = res.documents.filter(x => x.vesselId === this.route.snapshot.params['vesId'])[0]?.vesselName
      this.voyageData = this.route.snapshot.params['voyId']
    });
  }
  getBLById() {
    let payload = this.commonService.filterList()

    payload.query = {
      "vessel": this.route.snapshot.params['vesId'],
      "$and": [{
        "isExport": {
          "$ne": true
        }
      }]
    }

    this.commonService.getSTList("bl", payload)
      .subscribe((res: any) => {
        this.houseBlList = res?.documents;
        this.getContainerList()
        res?.documents?.map((x) => {
          x.bondNumber = x.containers[0]?.bondNumber
        })
      });
  }
  updateBl() {
    let BLData = [];
    this.houseBlList?.forEach(element => {
      element?.containers?.map((x) => x.bondNumber = element?.bondNumber)
      BLData.push({ ...element });
    })
    this.commonService.batchUpdate(Constant.BL_LIST_UPDATE, BLData).subscribe((res) => {
      this.notification.create('success', 'Updated Successfully', '');
      this.back()
    });

    let updateContainer = []
    this.houseBlList?.forEach(element => {
      this.tankData?.filter(x => {
        if ((element?.batchId === x?.batchId) && (element?.blNumber === x?.blNumber)) {
          if (element?.bondNumber)
            updateContainer.push({
              ...element,
              bondNumber: element?.bondNumber
            })
        }
      })
    })
    if (updateContainer.length > 0)
      this.commonService.batchUpdate(Constant.MULTI_UPDATE_CONTAINER, updateContainer).subscribe((res) => {
        this.notification.create('success', 'Updated Successfully', '');
      })
  }

  getContainerList() {
    let batchArray = []
    this.houseBlList?.filter((x) => {
      batchArray.push(x?.batchId.toString())
    })


    let payload = this.commonService.filterList()

    payload.query = {
      "batchId": {
        "$in": batchArray
      }
    }

    this.commonService.getSTList(Constant.CONTAINER_LIST, payload)
      .subscribe((data: any) => {
        this.tankData = data.documents;
      })
  }
  back() {
    this.location.back();
  }
  podName: any
  fpodName: any
  xyz: any
  pod: any
  fpod: any
  blNo: any
  pooname: any
  polname: any
  consignee: any
  notify: any
  cargo: any
  shipmentterm: any
  departureMode: any
  cargotype: any
  containers: any
  bondNo: any
  search() {

    let mustArray = {};

    mustArray['vessel'] = this.route.snapshot.params['vesId']
    mustArray['voyageId'] = this.route.snapshot.params['voyId']




    if (this.blNo) {
      mustArray['blNumber'] = {
        "$regex": this.blNo.toLowerCase(),
        "$options": "i"
      }
    }
    if (this.pooname) {
      mustArray['importPooName'] = {
        "$regex": this.pooname.toLowerCase(),
        "$options": "i"
      }
    }
    if (this.polname) {
      mustArray['importPolName'] = {
        "$regex": this.polname.toLowerCase(),
        "$options": "i"
      }
    }
    if (this.podName) {
      mustArray['importPodName'] = {
        "$regex": this.podName.toLowerCase(),
        "$options": "i"
      }
    }
    if (this.fpodName) {
      mustArray['importFpodName'] = {
        "$regex": this.fpodName.toLowerCase(),
        "$options": "i"
      }
    }
    if (this.bondNo) {
      mustArray['containers.bondNumber'] = {
        "$regex": this.bondNo.toLowerCase(),
        "$options": "i"
      }
    }




    let payload = this.commonService.filterList()

    payload.query = mustArray

    this.commonService.getSTList("bl", payload)
      .subscribe((res: any) => {
        this.houseBlList = res.documents
      })
  }
}
