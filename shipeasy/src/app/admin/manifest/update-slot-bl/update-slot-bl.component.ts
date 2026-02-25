import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ApiService } from '../../principal/api.service';
import * as Constant from 'src/app/shared/common-constants';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from 'src/app/services/common/common.service';
@Component({
    selector: 'app-update-slot-bl',
    templateUrl: './update-slot-bl.component.html',
    styleUrls: ['./update-slot-bl.component.scss']
})
export class UpdateSlotBlComponent implements OnInit {
    houseBlList: any = []
    vesseldata: any;
    voyageData: any;
    tankData: any = [];
    shippingLineList: any = [];

    constructor(private router: Router,
        private location: Location,
        private _api: ApiService,
        private route: ActivatedRoute,
        private masterservice: MastersService, private commonService : CommonService,
        private notification : NzNotificationService) { }

    ngOnInit(): void {
        this.getBLById()
        this.getVesselData()
        this.getShippingLineDropDowns()
    }
    getShippingLineDropDowns() {
      let payload = this.commonService.filterList()

      payload.query = {   "status": true,"$and": [
        {
          "feeder": {
            "$ne": true
          }
        }
      ],}
  
      this.commonService.getSTList("shippingline", payload).subscribe((res: any) => {
            this.shippingLineList = res?.documents;
        });
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
                res?.documents?.map((x) => {
                    x.shippingLineId = x.shippingLineId || ''
                })
            });
    }
    updateBl() {
        let BLData = [];
        this.houseBlList?.forEach(element => {
            BLData.push(  {
                    ...element,
                    shippingLineName: this.shippingLineList?.filter((x) => x?.shippinglineId === element?.shippingLineId)[0]?.name || '',
                    shippingLineId: element?.shippingLineId || '',
                } )
        });
        this.commonService.batchUpdate(Constant.BL_LIST_UPDATE, BLData).subscribe((res)=>{
            this.notification.create('success', 'Updated Successfully', '');
            this.back()
        });
    }


    back() {
        this.location.back();
    }
    podName:any
    fpodName:any
    xyz:any
    pod:any
    fpod:any
    blNo:any
    pooname:any
    polname:any
    consignee:any
    notify:any
    cargo:any
    shipmentterm:any
    departureMode:any
    cargotype:any
    containers :any
    
    search(){
    
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
      if (this.shipmentterm) {
        mustArray['shippingTerm'] = {
          "$regex": this.shipmentterm.toLowerCase(),
          "$options": "i"
        }
      }
  
  
      if (this.consignee) {
        mustArray['consigneeName'] = {
          "$regex": this.consignee.toLowerCase(),
          "$options": "i"
        }
      }
      if (this.notify) {
        mustArray['notify_party1Name'] = {
          "$regex": this.notify.toLowerCase(),
          "$options": "i"
        }
      }
  
      if (this.containers) {
        mustArray['containers.containerNumber'] = {
          "$regex": this.containers.toLowerCase(),
          "$options": "i"
        }
      }
      if (this.cargotype) {
        mustArray['mbl'] = {
          "$regex": this.cargotype.toLowerCase(),
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
