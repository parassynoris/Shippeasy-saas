import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ApiService } from '../../principal/api.service';
import * as Constant from 'src/app/shared/common-constants';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from 'src/app/services/common/common.service';
@Component({
  selector: 'app-update-seal-no',
  templateUrl: './update-seal-no.component.html',
  styleUrls: ['./update-seal-no.component.css']
})
export class UpdateSealNoComponent implements OnInit {
  houseBlList: any = [];
  vesseldata: any;
  voyageData: any;
  tankData: any = [];

  constructor(private router: Router,
    private location: Location,
    private _api: ApiService,
    private route: ActivatedRoute,
    private masterservice: MastersService, private commonService : CommonService,
    private notification : NzNotificationService) { }

  ngOnInit(): void {
    this.getBLById()
    this.getVesselData()
   
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
  getVesselData() {
    let payload = this.commonService.filterList()

    if(payload?.query)payload.query = {}

    this.commonService.getSTList("vessel", payload)?.subscribe((res: any) => {
      this.vesseldata = res.documents.filter(x=> x.vesselId === this.route.snapshot.params['vesId'])[0]?.vesselName
      this.voyageData = this.route.snapshot.params['voyId']
    });
  }
  getBLById() {
    let payload = this.commonService.filterList()

    if(payload?.query)payload.query = {
      "vessel": this.route.snapshot.params['vesId'], 
    }

    this.commonService.getSTList("bl", payload)
      ?.subscribe((res: any) => {
        this.houseBlList = res?.documents;
        this.getContainerList()
        this.houseBlList?.map((x)=>{
          x.sealNo = x.containers[0]?.sealNo
        })
      });
  }
  updateBl(){
    let BLData = [];
    this.houseBlList?.forEach(element => {
      element?.containers?.map((x)=> {
        x.sealNo =  element?.sealNo,
        x.rfidNo =  element?.sealNo
      })
      BLData.push( { ...element } )
    });
   this.commonService
   .batchUpdate(Constant.BL_LIST_UPDATE, BLData)
   .subscribe((res: any) => {
     this.back()
     this.notification.create('success', 'Updated Successfully', '');
   }); 

   let updateContainer = []
   this.houseBlList?.forEach(element => {
       this.tankData?.filter(x => {
           if ((element?.batchId === x?.batchId) && (element?.blNumber === x?.blNumber)) {
              if(element?.sealNo)
               updateContainer.push(  {
                       ...element,
                       rfidNo : element?.sealNo,
                       sealNo: element?.sealNo,
                   } )
           }
       })
   })
   if(updateContainer.length > 0)
   this.commonService .batchUpdate(Constant.MULTI_UPDATE_CONTAINER,updateContainer).subscribe()

  }
  back() {
    this.location.back();
  }
}
