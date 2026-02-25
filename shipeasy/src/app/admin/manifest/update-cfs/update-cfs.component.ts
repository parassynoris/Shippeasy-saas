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
  selector: 'app-update-cfs',
  templateUrl: './update-cfs.component.html',
  styleUrls: ['./update-cfs.component.css']
})
export class UpdateCfsComponent implements OnInit {
  houseBlList:any=[]
  blForm: FormGroup
  portList:any=[]
  itemTypeList:any=[]
  departureModeList:any=[]
  podName:any
  fpodName:any
  cfs:any
  pod:any
  fpod:any
  cargo:any
  departure:any
  vesseldata:any
  voyageList:any
  blNo:any
  pooName:any
  containerTypeName:any
  shipmentTerm:any
  consigneeName:any
  notifyPartyName:any
  hssPartyName:any
  cfsName:any
  locationList:any=[]
  CFSlocationList:any=[]
  constructor(public route : ActivatedRoute,  private location: Location,
    private _api: ApiService,private fb: FormBuilder,private notification: NzNotificationService,  private masterservice: MastersService, private commonService : CommonService) { 
      this.blForm = this.fb.group({
        blData:this.fb.array([])
      })
      this.getBLById()
      this.getLocationDropDowns()
      this.getSystemTypeDropDowns()
      this.getVoyage()
      this.getVesselData()
    }

  ngOnInit(): void {
    this.getSystemTypeDropDowns()
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
  getLocationDropDowns() {
    let payload = this.commonService?.filterList()

   if(payload?.query) payload.query = {   "status": true  }

    this.commonService?.getSTList("location", payload).subscribe((res: any) => {

      this.locationList = res?.documents;
      this.CFSlocationList = this.locationList.filter((x) => x?.CFS )
      
    });
  }
  getVesselData() {
   
    let payload = this.commonService?.filterList()

    if(payload?.query) payload.query = {    }

    this.commonService?.getSTList("vessel", payload) .subscribe((res: any) => {
      this.vesseldata = res.documents.filter(x=> x.vesselId === this.route.snapshot.params['vesId'])[0]?.vesselName
      
    });
  }

  getVoyage(){
   
   
    let payload = this.commonService?.filterList()

    if(payload?.query) payload.query = {     }

    this.commonService?.getSTList("voyage", payload) .subscribe((res: any) => {
      this.voyageList = res?.documents.filter(x=>x.voyageNumber === this.route.snapshot.params['voyId'])[0]?.voyageNumber;
     
      
    });

  }
  getSystemTypeDropDowns() {
   
    let payload = this.commonService?.filterList()

if(payload?.query)payload.query = {   "status": true,"typeCategory": {
      "$in": [
        'blType','packageType','icd','shippingTerm','preCarriage','onCarriage','cargoStatus','cargoType','itemType','departureMode'
      ]
    } }

    this.commonService?.getSTList("systemtype", payload)  
      .subscribe((res: any) => {
     
       this.itemTypeList =res?.documents?.filter(
        (x) => x.typeCategory === 'itemType'
      );
      this.departureModeList =res?.documents?.filter(
        (x) => x.typeCategory === 'departureMode'
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
          ...x,
          containers: [x?.containers],
          blNumber: [x?.blNumber || ''],
          importPol: [x?.importPol || ''],
          importPolName: [x?.importPolName || ''],
          importPod: [x?.importPod || ''],
          importPodName: [x?.importPodName || ''],
          importFpod: [x?.importFpod || ''],
          importFpodName: [x?.importFpodName || ''],
          noofContainer: [x?.noofContainer || ''],
          consigneeName:[x?.consigneeName || ''],
          isDPD: [x?.isDPD || false],
          isHSS: [x?.isHSS || false],
          notify_party1Name: [x?.notify_party1Name || ''],
          notify_party1: [x?.notify_party1 || ''],
          cfsLocationId: [x?.cfsLocationId || ''],
          containerType: [x?.containerType || ''],
          containerTypeName: [x?.containerTypeName || ''],
          shippingTerm: [x?.shippingTerm || ''],
          shippingTermId: [x?.shippingTermId || '']
        })
      )
    })
    
  }
 
  updateData(){
    let data =[]
    this.blForm.controls.blData.value.forEach(element=>{
      
      let CfsLocation = this.CFSlocationList.filter(x=> x.locationId === element.cfsLocationId)[0]?.locationName
     
      data.push( {...element, cfsLocation: CfsLocation} )
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
    if (this.pooName) {
      mustArray['importPooName'] = {
        "$regex": this.pooName.toLowerCase(),
        "$options": "i"
      }
    }
    if (this.containerTypeName) {
      mustArray['importPolName'] = {
        "$regex": this.containerTypeName.toLowerCase(),
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
    if (this.shipmentTerm) {
      mustArray['shippingTerm'] = {
        "$regex": this.shipmentTerm.toLowerCase(),
        "$options": "i"
      }
    }

   
    if (this.consigneeName) {
      mustArray['consigneeName'] = {
        "$regex": this.consigneeName.toLowerCase(),
        "$options": "i"
      }
    }
    if (this.notifyPartyName) {
      mustArray['notify_party1Name'] = {
        "$regex": this.notifyPartyName.toLowerCase(),
        "$options": "i"
      }
    }
   
    if (this.cfsName) {
      mustArray['cfsLocation'] = {
        "$regex": this.cfsName.toLowerCase(),
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
        cfsLocationId: this.cfs ? this.cfs :element?.cfsLocationId,
      
      })
    })

 
  }
}
