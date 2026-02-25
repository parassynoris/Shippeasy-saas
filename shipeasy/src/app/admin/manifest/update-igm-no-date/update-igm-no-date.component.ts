import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../principal/api.service';
import { Location } from '@angular/common';
import * as Constant from 'src/app/shared/common-constants';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { CommonService } from 'src/app/services/common/common.service';
import { CognitoService } from 'src/app/services/cognito.service';

@Component({
  selector: 'app-update-igm-no-date',
  templateUrl: './update-igm-no-date.component.html',
  styleUrls: ['./update-igm-no-date.component.css']
})
export class UpdateIgmNoDateComponent {
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
  constructor(private route : ActivatedRoute,  private location: Location,   private cognito : CognitoService,
    private _api: ApiService,private fb: FormBuilder,public notification: NzNotificationService,  
    private masterservice: MastersService,private commonfunction: CommonFunctions, private commonService : CommonService) { 
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
    
    let payload = this.commonService?.filterList()

    if(payload?.query)payload.query = { "status": true   }

    this.commonService?.getSTList("port", payload)
      .subscribe((res: any) => {
        this.portList = res?.documents;
      });
  }
  getVesselData() {
   
    let payload = this.commonService?.filterList()

     if(payload?.query)payload.query = {    }

    this.commonService?.getSTList("vessel", payload) .subscribe((res: any) => {
      this.vesseldata = res.documents.filter(x=> x.vesselId === this.route.snapshot.params['vesId'])[0]?.vesselName
      
    });
  }

  getVoyage(){
   
   
    let payload = this.commonService?.filterList()

     if(payload?.query)payload.query = {     }

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

     if(payload?.query)payload.query = {   "vessel": this.route.snapshot.params['vesId'], "voyageId": this.route.snapshot.params['voyId'] }

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
          bls: [x?.bls],
          fpod: [x?.fpod || ''],
          igmNo: [x?.igmNo || ''],
          igmDate:[x?.igmDate || ''],
          email:['']
          
        })
      )
    })
    
  }
  updateData(){
    let data =[]
    this.blForm.controls.blData.value.forEach(element=>{
      delete element.email
      
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
  sendMail(bl){
    // let userData = this.commonfunction.getUserDetails();

    this.cognito.getUserDatails().subscribe((resp) => {
      if (resp != null) {
        let userData   = resp
        let mailTo = []
        mailTo.push({
            name: 'J M BAXI',
            email: 'malav@yopmail.com'
          })
     
  
        let emaildata = `
        ${'IGM No and Date Updated'} `
  
        let payload = {
          sender: {
            name: userData?.roleName,
            email: userData.createdBy
          },
          to: mailTo,
          textContent: `${emaildata}`,
          subject: "Bill of Lading",
        }
        this._api.sendEmail(payload).subscribe(
          (res) => {
            if (res.status == "success") {
              this.notification.create('success', 'Email Sent Successfully', '');
            }
            else {
              this.notification.create('error', 'Email not Send', '');
            }
          }
        );
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

     if(payload?.query)payload.query = mustArray

    this.commonService?.getSTList("bl", payload)
    .subscribe((res: any) => {
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
