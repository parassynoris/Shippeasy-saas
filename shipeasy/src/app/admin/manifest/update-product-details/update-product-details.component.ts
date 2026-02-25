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
  selector: 'app-update-product-details',
  templateUrl: './update-product-details.component.html',
  styleUrls: ['./update-product-details.component.css']
})
export class UpdateProductDetailsComponent implements OnInit {
  houseBlList:any=[]
  blForm: FormGroup
  portList:any=[]
  itemTypeList:any=[]
  departureModeList:any=[]
  cargoDesc:any
  haz:any
  unNo:any
  imco:any
  packinggroup:any
  container:any
  commodity:any
  blNo:any
  product:any
  consigneeName:any
  notifyPartyName:any
  vesseldata:any
  voyageList:any
  productData:any=[]
  constructor(private route : ActivatedRoute,  private location: Location, private commonService : CommonService,
    private _api: ApiService,private fb: FormBuilder,private notification: NzNotificationService,  private masterservice: MastersService,) { 
      this.blForm = this.fb.group({
        blData:this.fb.array([])
      })
      this.getBLById()
      this.getPeoductData()
      
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
 
  getPeoductData() {
   
    let payload = this.commonService.filterList()

    if(payload?.query)payload.query = {    }

    this.commonService.getSTList("product", payload) ?.subscribe((data) => {
      this.productData = data.documents;
     
    });
  }
  getVesselData() {
   
    let payload = this.commonService.filterList()

    if(payload?.query)payload.query = {    }

    this.commonService.getSTList("vessel", payload) ?.subscribe((res: any) => {
      this.vesseldata = res.documents.filter(x=> x.vesselId === this.route.snapshot.params['vesId'])[0]?.vesselName
      
    });
  }

  getVoyage(){
   
   
    let payload = this.commonService.filterList()

    if(payload?.query)payload.query = {     }

    this.commonService.getSTList("voyage", payload) ?.subscribe((res: any) => {
      this.voyageList = res?.documents.filter(x=>x.voyageNumber === this.route.snapshot.params['voyId'])[0]?.voyageNumber;
     
      
    });

  }

  getBLById() {
    let payload = this.commonService.filterList()

    if(payload?.query)payload.query = {   "vessel": this.route.snapshot.params['vesId'], "voyageId": this.route.snapshot.params['voyId'] }

    this.commonService.getSTList("bl", payload) 
      ?.subscribe((res: any) => {
        let blData = res?.documents;
        let data = []
        this.productData.forEach(element =>{
          blData.forEach(element1 =>{
            if( element?.productId === element1?.productId){
              data.push({
                ...element1, 
                  packingGroup: element.packingGroup,
                  packingGroupName: element.packingGroupName,
                  productType: element.productType 
              })
            }
          })
        })
        this.houseBlList = data
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
          consigneeName:[x?.consigneeName || ''],
          notify_party1Name: [x?.notify_party1Name || ''],
          notify_party1: [x?.notify_party1 || ''],
          cargo_Desc: [x?.cargo_Desc || ''],
          productType: [x?.productType || ''],
          unNo: [x?.unNo || ''],
          imcoClass: [x?.imcoClass || ''],
          packingGroupName: [x?.packingGroupName || ''],
          productId: [x?.productId || ''],
        
         
        })
      )
    })
    
  }
 
  updateData(){
    let data =[]
    this.blForm.controls.blData.value.forEach(element=>{
      
      let produtName = this.productData.filter(x=> x.productId === element.productId)[0]?.productName
     
      data.push( {...element, productName: produtName} )
    })
    this.commonService.UpdateToST(Constant.MULTI_BL_UPDATE,data).subscribe((res:any)=>{
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
  
     
  
      if (this.blNo) {
        mustArray['blNumber'] = {
          "$regex": this.blNo.toLowerCase(),
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
  
      if (this.container) {
        mustArray['containers.containerNumber'] = {
          "$regex": this.container.toLowerCase(),
          "$options": "i"
        }
      }
      if (this.cargoDesc) {
        mustArray['cargo_Desc'] = {
          "$regex": this.cargoDesc.toLowerCase(),
          "$options": "i"
        }
      }

      if (this.haz) {
        mustArray['productType'] = {
          "$regex": this.haz.toLowerCase(),
          "$options": "i"
        }
      }

      if (this.unNo) {
        mustArray['unNo'] = {
          "$regex": this.unNo.toLowerCase(),
          "$options": "i"
        }
      }
      if (this.imco) {
        mustArray['imcoClass'] = {
          "$regex": this.imco.toLowerCase(),
          "$options": "i"
        }
      }
     
      if (this.packinggroup) {
        mustArray['packingGroupName'] = {
          "$regex": this.packinggroup.toLowerCase(),
          "$options": "i"
        }
      }
      if (this.commodity) {
        mustArray['productName'] = {
          "$regex": this.commodity.toLowerCase(),
          "$options": "i"
        }
      }
    
    
      let payload = this.commonService.filterList()

      payload.query = mustArray
  
      this.commonService.getSTList("bl", payload) 
    .subscribe((res: any) => {
      let blData = res?.documents;
        let data = []
        this.productData.forEach(element =>{
          blData.forEach(element1 =>{
            if( element?.productId === element1?.productId){
              data.push({
                ...element1, 
                  packingGroup: element.packingGroup,
                  packingGroupName: element.packingGroupName,
                  productType: element.productType ,
              })
            }
          })
        })
        this.houseBlList = data
      this.buildForm()
    })
  }
  applyAll(){
    this.blForm.controls.blData.value.forEach((element,index)=>{
      this.blForm.get('blData')['controls'].at(index).patchValue({
        productId: this.product ? this.product :element?.productId,
      
      })
    })

 
  }
}
