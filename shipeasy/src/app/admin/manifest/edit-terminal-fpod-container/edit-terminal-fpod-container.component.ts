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
  selector: 'app-edit-terminal-fpod-container',
  templateUrl: './edit-terminal-fpod-container.component.html',
  styleUrls: ['./edit-terminal-fpod-container.component.css']
})
export class EditTerminalFpodContainerComponent  {
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
  constructor(private route : ActivatedRoute,  public location: Location,
    private _api: ApiService,private fb: FormBuilder,public notification: NzNotificationService,  private masterservice: MastersService, private commonService : CommonService) { 
      this.blForm = this.fb.group({
        blData:this.fb.array([])
      })
      this.getBLById()
      this.getPortDropDowns()
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
  getPortDropDowns() {
   
    let payload = this.commonService.filterList()

    if(payload?.query)payload.query = {   "status": true}

    this.commonService.getSTList("port", payload) 
      ?.subscribe((res: any) => {
        this.portList = res?.documents;
      });
  }
  getVesselData() {
    let payload = this.commonService.filterList()

    if(payload?.query)payload.query = {    }

    this.commonService.getSTList("vessel", payload)?.subscribe((res: any) => {
      this.vesseldata = res.documents.filter(x=> x.vesselId === this.route.snapshot.params['vesId'])[0]?.vesselName
      
    });
  }

  getVoyage(){
   
    let payload = this.commonService.filterList()

    if(payload?.query)payload.query = {     }

    this.commonService.getSTList("voyage", payload)?.subscribe((res: any) => {
      this.voyageList = res?.documents.filter(x=>x.voyageNumber === this.route.snapshot.params['voyId'])[0]?.voyageNumber;
     
      
    });

  }
  getSystemTypeDropDowns() {
    
    let payload = this.commonService.filterList()

    if(payload?.query)payload.query = {   "status": true, "typeCategory": {
      "$in": [
        'blType','packageType','icd','shippingTerm','preCarriage','onCarriage','cargoStatus','cargoType','itemType','departureMode'
      ]
    } }

    this.commonService.getSTList("systemtype", payload)  
      ?.subscribe((res: any) => {
     
       this.itemTypeList =res?.documents?.filter(
        (x) => x.typeCategory === 'itemType'
      );
      this.departureModeList =res?.documents?.filter(
        (x) => x.typeCategory === 'departureMode'
      );
      });
  }
  getBLById() {
    let payload = this.commonService.filterList()

    if(payload?.query)payload.query = {   "vessel": this.route.snapshot.params['vesId'], "voyageId": this.route.snapshot.params['voyId'] }

    this.commonService.getSTList("bl", payload) 
      ?.subscribe((res: any) => {
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
          ...x,
          containers: [x?.containers],
          blNumber: [x?.blNumber || ''],
          noofContainer: [x?.noofContainer || ''],
          consigneeName:[x?.consigneeName || ''],
          importPol: [x?.importPol|| ''],
          importPolName:[x?.importPolName || ''],
          importPod: [x?.importPod || ''],
          importFpod: [x?.importFpod || ''],
          cargoStatus: [x?.cargoStatus || ''],
          departureMode: [x?.departureMode || '']
        })
      )
    })
  }
  podPort:any
  fpodPort:any
  podChange(e,i){
    this.podPort = e
    if(this.podPort && this.fpodChange){
      let blList =  this.blForm.get('blData') as FormArray;
      const fromgroup = blList.controls[i] as FormGroup
      if(this.podPort === this.fpodPort){
        fromgroup.get('cargoStatus').setValue('LC')
      }
      else{
        fromgroup.get('cargoStatus').setValue('TP')
      }
    }
    
  }
  fpodChange(e,i){
    this.fpodPort = e
    if(this.podPort && this.fpodChange){
      let blList =  this.blForm.get('blData') as FormArray;
      const fromgroup = blList.controls[i] as FormGroup
      if(this.podPort === this.fpodPort){
        fromgroup.get('cargoStatus').setValue('LC')
      }
      else{
        fromgroup.get('cargoStatus').setValue('TP')
      }
    }
    
  }
  updateData(){
    let data =[]
    this.blForm.controls.blData.value.forEach(element=>{
      let importpodName = this.portList.filter(x=>x?.portId === element.importPod)[0]?.portDetails?.portName
      let importfpodName = this.portList.filter(x=>x?.portId === element.importFpod)[0]?.portDetails?.portName

      data.push( {...element,importPodName:importpodName,importFpodName:importfpodName} )
    })
    
    this.commonService.batchUpdate(Constant.MULTI_BL_UPDATE,data)?.subscribe((res:any)=>{
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
  
    let payload = this.commonService.filterList()

    payload.query = mustArray

    this.commonService.getSTList("bl", payload) 
    ?.subscribe((res: any) => {
      this.houseBlList = res.documents
      this.buildForm()
    })
  }
  applyAll(){
    this.blForm.controls.blData.value.forEach((element,index)=>{
      this.blForm.get('blData')['controls'].at(index).patchValue({
        importPod: this.pod ? this.pod :element?.importPod,
        importFpod: this.fpod ? this.fpod : element?.importFpod,
        cargoStatus:this.cargo ? this.cargo : element.cargoStatus,
        departureMode:this.departure? this.departure : element.departureMode
      })
    })

 
  }
}
