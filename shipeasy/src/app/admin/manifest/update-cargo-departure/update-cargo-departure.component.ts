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
  selector: 'app-update-cargo-departure',
  templateUrl: './update-cargo-departure.component.html',
  styleUrls: ['./update-cargo-departure.component.css']
})
export class UpdateCargoDepartureComponent {
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
  blNo:any
  pooname:any
  polname:any
  consignee:any
  notify:any
  cargo:any
  shipmentterm:any
  departureMode:any
  cargodes:any
  cargotype:any
  departure:any
  vesseldata:any
  voyageList:any
  cargoTypeList:any=[]
  constructor(public route : ActivatedRoute,  private location: Location,
    private _api: ApiService,private fb: FormBuilder,private notification: NzNotificationService,  private masterservice: MastersService, public commonService : CommonService) { 
      this.blForm = this.fb.group({
        blData:this.fb.array([])
      })
      this.getBLById()
      this.getSystemTypeDropDowns()
      this.getVoyage()
      this.getVesselData()
    }

  back(){
    this.location.back();
  }
  get bl() {
    return this.blForm.controls["blData"] as FormArray;
  }
  getControls() {
    return (this.blForm.controls["blData"] as FormArray).controls;
  }
  getVesselData() {
   
    let payload = this.commonService?.filterList()

    if(payload?.query) payload.query = {    }

    this.commonService?.getSTList("vessel", payload) .subscribe((res: any) => {
      this.vesseldata = res.documents.filter(x=> x.vesselId === this.route.snapshot?.params['vesId'])[0]?.vesselName
      
    });
  }

  getVoyage(){
   
   
    let payload = this.commonService?.filterList()

    if(payload?.query)  payload.query = {     }

    this.commonService?.getSTList("voyage", payload) .subscribe((res: any) => {
      this.voyageList = res?.documents.filter(x=>x.voyageNumber === this.route.snapshot?.params['voyId'])[0]?.voyageNumber;
     
      
    });

  }
  getSystemTypeDropDowns() { 
    let payload = this.commonService?.filterList()

    if(payload?.query) payload.query = {   "status": true,"typeCategory": {
      "$in": [
        'blType','packageType','icd','shippingTerm','preCarriage','onCarriage','cargoStatus','cargoType','itemType','departureMode',
      ]
    } }

    this.commonService?.getSTList("systemtype", payload) 
      .subscribe((res: any) => {
     
       this.itemTypeList =res?.documents?.filter(
        (x) => x._source.typeCategory === 'itemType'
      );
      this.departureModeList =res?.documents?.filter(
        (x) => x._source.typeCategory === 'departureMode'
      );
      this.cargoTypeList = res?.documents?.filter(
        (x) => x._source.typeCategory === 'cargoType'
      );
      });
  }
  getBLById() {
    let payload = this.commonService?.filterList()

    if(payload?.query) payload.query = {   "vessel": this.route.snapshot?.params['vesId'], "voyageId": this.route.snapshot?.params['voyId'] }

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
          ...x?._source,
          containers: [x?._source?.containers],
          blNumber: [x?._source?.blNumber || ''],
          consigneeName:[x?._source?.consigneeName || ''],
          importPooName:[x?._source?.importPooName || ''],
          importPol: [x?._source?.importPol|| ''],
          importPolName:[x?._source?.importPolName || ''],
          importPodName: [x?._source?.importPodName || ''],
          importFpodName: [x?._source?.importFpodName || ''],
          notify_party1Name: [x?._source?.notify_party1Name || ''],
          notify_party1: [x?._source?.notify_party1 || ''],
          cargo_Desc: [x?._source?.cargo_Desc || ''],
          cargoStatus: [x?._source?.cargoStatus || ''],
          departureMode: [x?._source?.departureMode || ''],
          shippingTerm: [x?._source?.shippingTerm || ''],
          shippingTermId: [x?._source?.shippingTermId || ''],
          cargoId: [x?._source?.cargoId || '']
        })
      )
    })
  }
  updateData(){
    let data =[]
    this.blForm.controls.blData.value.forEach(element=>{
      data.push( {...element} )
    })
    
    this.commonService.batchUpdate(Constant.MULTI_BL_UPDATE,data).subscribe((res:any)=>{
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
    if (this.cargodes) {
      mustArray['cargo_Desc'] = {
        "$regex": this.cargodes.toLowerCase(),
        "$options": "i"
      }
    }
    if (this.cargotype) {
      mustArray['cargoId'] = {
        "$regex": this.cargotype.toLowerCase(),
        "$options": "i"
      }
    }
    if (this.departureMode) {
      mustArray['departureMode'] = {
        "$regex": this.departureMode.toLowerCase(),
        "$options": "i"
      }
    }
    
    let payload = this.commonService?.filterList()

    if(payload?.query) payload.query = mustArray

    this.commonService?.getSTList("bl", payload)
    .subscribe((res: any) => {
      this.houseBlList = res.documents
      this.buildForm()
    })
  }
  applyAll(){
    this.blForm.controls.blData.value.forEach((element,index)=>{
      this.blForm.get('blData')['controls'].at(index).patchValue({
        cargoId: this.cargo ? this.cargo :element?.cargoId,
       
      })
    })

 
  }
}
