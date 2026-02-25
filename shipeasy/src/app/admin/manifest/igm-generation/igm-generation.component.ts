import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../principal/api.service';
import { Location } from '@angular/common';
import * as Constant from 'src/app/shared/common-constants';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { CommonService } from 'src/app/services/common/common.service';

@Component({
  selector: 'app-igm-generation',
  templateUrl: './igm-generation.component.html',
  styleUrls: ['./igm-generation.component.css']
})
export class IgmGenerationComponent implements OnInit {
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
  CFSlocationList:any=[]
  containerStatusList:any=[]
  locationList:any=[]
  constructor(private route : ActivatedRoute,  private location: Location,
    private _api: ApiService,private fb: FormBuilder,private notification: NzNotificationService,  private masterservice: MastersService, public commonService : CommonService) { 
      this.blForm = this.fb.group({
        blData:this.fb.array([])
      })
      this.getBLById()
      this.getPortDropDowns()
      this.getSystemTypeDropDowns()
      this.getVoyage()
      this.getVesselData()
      this.getLocationDropDowns()
    }

  ngOnInit(): void {
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
   
    let payload = this.commonService?.filterList()

    if(payload?.query)payload.query = {   "status": true}

    this.commonService?.getSTList("port", payload) 
      ?.subscribe((res: any) => {
        this.portList = res?.documents;
      });
  }
  getLocationDropDowns() {
    let payload = this.commonService?.filterList()

    if(payload?.query)payload.query = {   "status": true ,
      masterType:   {
        "$in": ['YARD','CFS','ICD']
      },
     }

    this.commonService?.getSTList("location", payload) ?.subscribe((res: any) => {

      this.locationList = res?.documents;
      this.CFSlocationList = this.locationList.filter((x) => x?.CFS )
      
    });
  }
  getVesselData() {
    let payload = this.commonService?.filterList()

    if(payload?.query) payload.query = {    }

    this.commonService?.getSTList("vessel", payload)?.subscribe((res: any) => {
      this.vesseldata = res.documents.filter(x=> x.vesselId === this.route.snapshot.params['vesId'])[0]?.vesselName
      
    });
  }

  getVoyage(){
   
    let payload = this.commonService?.filterList()

    if(payload?.query) payload.query = {     }

    this.commonService?.getSTList("voyage", payload)?.subscribe((res: any) => {
      this.voyageList = res?.documents.filter(x=>x.voyageNumber === this.route.snapshot?.params['voyId'])[0]?.voyageNumber;
     
      
    });

  }
  getSystemTypeDropDowns() { 

   
    let payload = this.commonService?.filterList()

    if(payload?.query)payload.query = {   "status": true,"typeCategory": {
      "$in": [
        'containerStatus','onCarriage','cargoStatus','cargoType','itemType','departureMode',
      ]
    } }

    this.commonService?.getSTList("systemtype", payload) 
      ?.subscribe((res: any) => {
     
       this.itemTypeList =res?.documents?.filter(
        (x) => x.typeCategory === 'itemType'
      );
      this.departureModeList =res?.documents?.filter(
        (x) => x.typeCategory === 'departureMode'
      );
      this.containerStatusList =res?.documents?.filter(
        (x) => x.typeCategory === 'containerStatus'
      );
      });
  }
  getBLById() {
    let payload = this.commonService?.filterList()

    if(payload?.query)payload.query = {   "vessel": this.route.snapshot?.params['vesId'], "voyageId": this.route.snapshot?.params['voyId'] }

    this.commonService?.getSTList("bl", payload) 
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
          isIgm:[x?.isIgm || false],
          containers: [x?.containers],
          blNumber: [x?.blNumber || ''],
          importPod: [x?.importPod || ''],
          importPodName: [x?.importPodName || ''],
          consigneeName:[x?.consigneeName || ''],
          consigneeId: [x?.consigneeId || ''],
          cargoStatus: [x?.cargoStatus || ''],
          cfsLocationId: [x?.cfsLocationId || ''],
          importFpod: [x?.importFpod || ''],
          importFpodName: [x?.importFpodName || ''],
          departureMode: [x?.departureMode || ''],
          containerStatus: [x?.containerStatus || '']
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
    let now     = new Date();
    let year    = now.getFullYear();
    let month   = now.getMonth()+1;
    let day     = now.getDate();
    let hour    = now.getHours();
    let minute  = now.getMinutes();
    let second  = now.getSeconds();
    let dateTimeString = year+month+day+hour+minute+second
    let fileName = 'BL'+this.vesseldata+'-'+this.voyageList+'-'+dateTimeString+'.igm'
    this.blForm.controls.blData.value.forEach(element=>{
      if(element.isIgm){
        let CfsLocation = this.CFSlocationList.filter(x=> x.locationId === element.cfsLocationId)[0]?.locationName
      
        data.push(
          {
            blId:element?.blId,
            blNumber: element?.blNumber,
            containers: element?.containers,
            importPod: element?.importPod,
            importPodName: element?.importPodName,
            consigneeName: element?.consigneeName,
            consigneeId: element?.consigneeId,
            cargoStatus: element?.cargoStatus,
            cfsLocationId: element?.cfsLocationId,
            cfsLocation: CfsLocation,
            importFpod: element?.importFpod,
            importFpodName: element?.importFpodName,
            departureMode: element?.departureMode,
            containerStatus: element?.containerStatus
          },
          
        )
      }
      
    })

   let body = {
     
      "bls": data,
      "igmDate": new Date(),
      "tenantId": "1",
      "vessel": this.route.snapshot.params['vesId'],
      "voyage": this.route.snapshot.params['voyId'],
      "igmName" : fileName
    }
   
    this.commonService.addToST(`igm`,body)?.subscribe((res:any)=>{
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
  
    let payload = this.commonService?.filterList()

    payload.query = mustArray

    this.commonService?.getSTList("bl", payload) 
    ?.subscribe((res: any) => {
      this.houseBlList = res.documents
      this.buildForm()
    })
  }
 

}
