import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ApiService } from '../../principal/api.service';
import * as Constant from 'src/app/shared/common-constants';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from 'src/app/services/common/common.service';
@Component({
    selector: 'app-update-item-no',
    templateUrl: './update-item-no.component.html',
    styleUrls: ['./update-item-no.component.scss']
})
export class UpdateItemNoComponent implements OnInit {
    houseBlList: any = []
    vesseldata: any;
    voyageData: any;
    tankData: any = [];

    subLineNoValue:any
    itemNoValue:any
    constructor(private router: Router,
        private location: Location,
        private _api: ApiService,
        private route: ActivatedRoute,
        private masterservice: MastersService,
        private notification : NzNotificationService, private commonService : CommonService) { }

    ngOnInit(): void {
        this.getBLById()
        this.getVesselData()
    }
    getVesselData() {
      let payload = this.commonService.filterList()

      payload.query = {    }
  
      this.commonService.getSTList("vessel", payload).subscribe((res: any) => {
            this.vesseldata = res.documents.filter(x => x.vesselId === this.route.snapshot.params['vesId'])[0]?.vesselName
            this.voyageData = this.route.snapshot.params['voyId']
        });
    }
    getBLById() { 
        let payload = this.commonService.filterList()

        payload.query = {   "vessel": this.route.snapshot.params['vesId'], "isExport":true }
    
        this.commonService.getSTList("bl", payload) 
            .subscribe((res: any) => {
                this.houseBlList = res?.documents;
                this.houseBlList?.map((x) => {
                    x.subLineNo = x.subLineNo || ''
                    x.itemNo = x.itemNo|| ''
                })
            });
    }
    updateBl() {
        let BLData = [];
        this.houseBlList?.forEach(element => {
            BLData.push( { ...element,
               subLineNo : element.subLineNo?.toString() || '',
                   itemNo : element.itemNo?.toString() ||'',
             }  )
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
    itemType : any
    itemNo:any
    subLineNo:any
    search(){
        let mustArray = {}; 

        mustArray['vessel'] = this.route.snapshot.params['vesId']
        mustArray['voyageId'] = this.route.snapshot.params['voyId'] 
        if (this.podName) {
          mustArray['importPodName'] = {
            "$regex" : this.podName.toLowerCase(),
            "$options": "i"
        }
      }
      if (this.fpodName) {
        mustArray['importFpodName'] = {
          "$regex" : this.fpodName.toLowerCase(),
          "$options": "i"
      }
    }
    if (this.itemType) {
      mustArray['cargoStatus'] = {
        "$regex" : this.itemType.toLowerCase(),
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
      applyAll(){
        this.houseBlList?.map((x) => {
            if(this.subLineNoValue)
            x.subLineNo = this.subLineNoValue
        })
      }
      applyAllPlus(){
        this.houseBlList?.map((x,index) => {
            x.itemNo = Number(this.houseBlList[0]?.itemNo) + index
        })
      }
}
