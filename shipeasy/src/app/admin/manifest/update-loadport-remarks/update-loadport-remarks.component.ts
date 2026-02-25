import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../principal/api.service';
import { Location } from '@angular/common';
import * as Constant from 'src/app/shared/common-constants';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { CommonService } from 'src/app/services/common/common.service';

@Component({
  selector: 'app-update-loadport-remarks',
  templateUrl: './update-loadport-remarks.component.html',
  styleUrls: ['./update-loadport-remarks.component.css']
})
export class UpdateLoadportRemarksComponent {
  houseBlList:any=[]
  blForm: FormGroup
  portList:any=[]
  itemTypeList:any=[]
  departureModeList:any=[]
  podName:any
  fpodName:any
  xyz:any
  pod:any
  fpod:any
  cargo:any
  departure:any
  vesseldata:any
  voyageList:any
  blNo:any
  hblNo:any
  polName:any
  consigneeName:any
  constructor(private route : ActivatedRoute,  private location: Location,
    private _api: ApiService,private fb: FormBuilder,private notification: NzNotificationService,  private masterservice: MastersService, private commonService : CommonService) { 
      this.blForm = this.fb.group({
        blData:this.fb.array([])
      })
      this.getBLById()
      this.getVoyage()
      this.getVesselData()
    }

  back(){
    this.location?.back();
  }
  get bl() {
    return this.blForm.controls["blData"] as FormArray;
  }
  getControls() {
    return (this.blForm.controls["blData"] as FormArray).controls;
  }

  getVesselData() {
   
    let payload = this.commonService?.filterList()

    if(payload?.query)payload.query = {    }

    this.commonService?.getSTList("vessel", payload) .subscribe((res: any) => {
      this.vesseldata = res.documents.filter(x=> x.vesselId === this.route.snapshot?.params['vesId'])[0]?.vesselName
      
    });
  }

  getVoyage(){
   
   
    let payload = this.commonService?.filterList()

    if(payload?.query)payload.query = {     }

    this.commonService?.getSTList("voyage", payload) .subscribe((res: any) => {
      this.voyageList = res?.documents.filter(x=>x.voyageNumber === this.route.snapshot?.params['voyId'])[0]?.voyageNumber;
     
      
    });

  }

  getBLById() {
    let payload = this.commonService?.filterList()

    if(payload?.query)payload.query = {   "vessel": this.route.snapshot?.params['vesId'], "voyageId": this.route.snapshot?.params['voyId'] }

    this.commonService?.getSTList("bl", payload) 
      .subscribe((res: any) => {
        this.houseBlList = res?.documents;
        this.buildForm()
        
      });
  }
  buildForm(){
    this.blForm = this.fb.group({
      blData:this.fb.array([])
    })
    this.houseBlList?.forEach((x)=>{
      (<FormArray>this.blForm.get('blData')).push(
        this.fb.group({
          ...x ,
          containers: [x?.containers],
          blNumber: [x?.blNumber || ''],
          consigneeName:[x?.consigneeName || ''],
          importPol: [x?.importPol|| ''],
          importPolName:[x?.importPolName || ''],
          importPodName: [x?.importPodName || ''],
          importFpodName: [x?.importFpodName || ''],
          polRemarks: [x?.polRemarks || ''],
          hblNo: [x?.hblNo || '']
        })
      )
    })
  }

  updateData(){
    let data =[]
    this.blForm.controls.blData.value.forEach(element=>{
     
      data.push( {...element}
        
      )
    })
    
    this.commonService?.batchUpdate(Constant.MULTI_BL_UPDATE,data).subscribe((res:any)=>{
      if(res){
        this.notification.create(
          'success',
          'Updated Successfully',
          ''
        )
       
      }
    })
    
  }
  search(){
    
    let mustArray = {}; 

        mustArray['vessel'] = this.route.snapshot?.params['vesId']
        mustArray['voyageId'] = this.route.snapshot?.params['voyId'] 
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
    if (this.blNo) {
      mustArray['blNumber'] = {
        "$regex" : this.blNo.toLowerCase(),
        "$options": "i"
    }
  }
  if (this.polName) {
    mustArray['importPolName'] = {
      "$regex" : this.polName.toLowerCase(),
      "$options": "i"
  }
}
    
if (this.consigneeName) {
  mustArray['consigneeName'] = {
    "$regex" : this.consigneeName.toLowerCase(),
    "$options": "i"
}
}
 
let payload = this.commonService?.filterList()
    
if(payload?.query)payload.query = mustArray

this.commonService?.getSTList("bl", payload) 
    .subscribe((res: any) => {
      this.houseBlList = res.documents
      this.buildForm()
    })
  }
}
