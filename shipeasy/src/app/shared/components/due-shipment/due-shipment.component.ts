import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/admin/principal/api.service';
import { Location } from '@angular/common';
import * as Constant from 'src/app/shared/common-constants';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { BaseBody } from 'src/app/admin/smartagent/base-body';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from 'src/app/services/common/common.service';


@Component({
  selector: 'app-due-shipment',
  templateUrl: './due-shipment.component.html',
  styleUrls: ['./due-shipment.component.scss']
})
export class DueShipmentComponent implements OnInit {
  batchList: any = []
  searchForm:FormGroup
  vesseldata:any=[]
  baseBody:any
  voyageList:any=[]
  showTem: boolean = false;
  searchText: any;
  selectedBatch:any
  currentUrl:any
  showListData:boolean=true
  batchForm:FormGroup
  constructor(private router: Router,
    public location: Location,
    private _api: ApiService,
    private notification: NzNotificationService,private commonService : CommonService,
    public fb : FormBuilder,
    private masterservice: MastersService,) { 
      this.searchForm = this.fb.group({
        motherVessel:[''],
        motherVoyage:[''],
        blBatchNo:[[]],
        containerNo:[''],
        consignee:['']
      })
    }

  ngOnInit(): void {
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();
    this.batchForm = this.fb.group({
      batchData:this.fb.array([])
    })
    this.getVesselData()
    this.getVoyageData()
    this.getBatchData()
  }
  getVesselData() {
   
    let payload = this.commonService?.filterList()

    if(payload?.query)payload.query = {    }

    this.commonService?.getSTList("vessel", payload) .subscribe((res: any) => {
      this.vesseldata = res?.documents
      
    });
  }

  getVoyageData(){
   
   
    let payload = this.commonService?.filterList()

    if(payload?.query)payload.query = {     }

    this.commonService?.getSTList("voyage", payload) .subscribe((res: any) => {
      this.voyageList = res?.documents
     
      
    });

  }
  vesselChange(e){
    let voyage=this.voyageList.filter(x=> x.vesselId === e)[0]?.voyageId
  
    this.searchForm.controls['motherVoyage'].setValue(voyage)
      

  }
  getBatchData() {
   
    let payload = this.commonService?.filterList()

    if(payload?.query)payload.query = {    "isExport" : false  }

    this.commonService?.getSTList("batch", payload)
      .subscribe((res: any) => {
        this.batchList = res?.documents
this.batchListFilter = res?.documents
       
      });
      
  }
  batchListFilter:any =[]
  setPendingBatch(){
    this.batchListFilter = []
    this.batchList.forEach(element => {
      if(this.searchForm.controls?.blBatchNo.value.includes(element.batchNo)){
        this.batchListFilter.push(element)
      }
    });
    if(this.searchForm.controls?.blBatchNo.value.length === 0){
      this.batchListFilter = this.batchList
    }
  }
  setBatchValue(e,check){
    if (e.target.checked  ) {
      if (!this.searchForm.controls?.blBatchNo.value.includes(check.batchNo)) {
        this.searchForm.controls?.blBatchNo.setValue([...this.searchForm.controls?.blBatchNo.value, check.batchNo])
      }
    }
    else {
      let index = this.searchForm.controls?.blBatchNo.value.findIndex(
        item => item === check?.batchNo
      )
      this.searchForm.controls?.blBatchNo.value.splice(index, 1)
      this.searchForm.controls?.blBatchNo.setValue([...this.searchForm.controls?.blBatchNo.value])
    }
    this.setPendingBatch()
  }
  selectedData:any=[]
  sendSelectedResponse(data){
    this.selectedData = data.filter(x=> x?.isSelected)
  }
  back() {
    this.location.back();
  }

  modifyData(){
    this.selectedData = []
    this.batchList.forEach(element => {
      if(this.searchForm.controls?.blBatchNo.value.includes(element.batchNo)){
        element.isSelected = false
        this.selectedData.push(element)
      }
    });
    this.selectedData?.forEach((x)=>{
      (<FormArray>this.batchForm.get('batchData')).push(
        this.fb.group({
          ...x,
          batchNo:[x?.batchNo ||''],
          moveNo:[x?.moveNo ||''],
          container:[x?.container],
          productName:[x?.productName ||''],
          imcoNo:[''],
          unNo:[x?.unNo ||''],
          moveTypeName:[x?.moveTypeName ||''],
          stcBlNo:[''],
          masterBlNo:[''],
          shipperName:[x?.shipperName ||''],
          consigneeName:[x?.consigneeName ||''],
          por:[''],
          preCarriage:[x?.routeDetails?.preCarriageId ||''],
          portofExit:[''],
          motherVesselName:[''],
          motherVoyageNo:[''],
          atd:[''],
          eta:[x?.eta ||null],
          shippingAgentName:[x?.shippingAgentName ||''],
          finalVesselId:[x?.finalVesselId ||''],
          finalVoyageId:[x?.finalVoyageId ||''],
        })
      )
    })
   
    this.showListData = false

  }
  back2(){
    this.showListData = true
    this.selectedData = []
    this.getBatchData()
  }
  
  get charges() {
    return this.batchForm.controls["batchData"] as FormArray;
  }
  getControls() {
    return (this.batchForm.controls["batchData"] as FormArray).controls;
  }

  updateBatchDetails(){
    let data =[]
    this.batchForm.controls.batchData.value.forEach(element=>{
      let vessel = this.vesseldata.filter(x=>x?.vesselId === element.finalVesselId)[0]?.vesselName
      data.push( {...element,finalVesselName:vessel,remarks:[{remarks:''}]} )
    })
    this.commonService.batchUpdate(' batch/batchupdate',data).subscribe((res:any)=>{
      if(res){
        this.notification.create(
          'success',
          'Updated Successfully',
          ''
        )
        this.showListData = true
        this.selectedData = []
      }
    })
    
  }
  vesselName : any;
  voyageName : any;
  applyAll(){
    this.batchForm.controls.batchData.value.forEach((element,index)=>{
      this.batchForm.get('batchData')['controls'].at(index).patchValue({
        finalVesselId: this.vesselName ? this.vesselName :element?.finalVesselId,
        finalVoyageId: this.voyageName ? this.voyageName : element?.finalVoyageId,
      })
    })

 
  }
}
