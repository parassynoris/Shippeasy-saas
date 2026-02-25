import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../principal/api.service';
import { Location } from '@angular/common';
import * as Constant from 'src/app/shared/common-constants';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { MastersService } from 'src/app/services/Masters/masters.service';
import * as XLSX from 'xlsx';
import { CommonService } from 'src/app/services/common/common.service';


@Component({
  selector: 'app-update-container-cell-position',
  templateUrl: './update-container-cell-position.component.html',
  styleUrls: ['./update-container-cell-position.component.css']
})
export class UpdateContainerCellPositionComponent implements OnInit {
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
  containerData:any=[]
  convertedJson : any = [];
  constructor(private route : ActivatedRoute,  private location: Location,
    private _api: ApiService,private fb: FormBuilder,private notification: NzNotificationService, 
     private masterservice: MastersService,public common : CommonService) { 
      this.blForm = this.fb.group({
        blData:this.fb.array([])
      })
      this.getBLById()
     
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
  getVesselData() {
   
    let payload = this.common?.filterList()

    if(payload?.query) payload.query = {    }

    this.common?.getSTList("vessel", payload) .subscribe((res: any) => {
      this.vesseldata = res.documents.filter(x=> x.vesselId === this.route.snapshot.params['vesId'])[0]?.vesselName
      
    });
  }

  getVoyage(){
   
   
    let payload = this.common?.filterList()

    if(payload?.query) payload.query = {     }

    this.common?.getSTList("voyage", payload) .subscribe((res: any) => {
      this.voyageList = res?.documents.filter(x=>x.voyageNumber === this.route.snapshot.params['voyId'])[0]?.voyageNumber;
     
      
    });

  }

  getBLById() {
    let payload = this.common?.filterList()

    if(payload?.query) payload.query = {   "vessel": this.route.snapshot.params['vesId'], "voyageId": this.route.snapshot.params['voyId'] }

    this.common?.getSTList("bl", payload) 
      .subscribe((res: any) => {
        this.houseBlList = res?.documents;
        this.containerData = []
        this.houseBlList.forEach((element)=>{
          element?.containers.forEach((element1)=>{
            this.containerData.push({
              ...element1,
              blId:element?.blId
            })
          })
        })
        this.buildForm()
        
      });
  }
  buildForm(){
    this.blForm = this.fb.group({
      blData:this.fb.array([])
    })
    this.containerData?.forEach((x)=>{
      (<FormArray>this.blForm.get('blData')).push(
        this.fb.group({
          ...x,
          blNumber: [x?.blNumber || ''],
          containerNumber: [x?.containerNumber || ''],
          containerType:[x?.containerType || ''],
          containerSize: [x?.containerSize|| ''],
          baplie:[x?.baplie || ''],
          positionNo: [x?.positionNo || ''],
          sealNo: [x?.sealNo || ''],
        })
      )
    })
  }

  fileUpload(event){
    const selectedFile = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsBinaryString(selectedFile);
    fileReader.onload = (event) => {
      let binaryData = event.target.result;
      let workBook = XLSX.read(binaryData, {type : "binary"});
      workBook.SheetNames.forEach(sheet => {
      this.convertedJson = XLSX.utils.sheet_to_json(workBook.Sheets[sheet], {
        raw: false,
        dateNF: "dd/mm/yyyy"
      });
    this.updatePosition(this.convertedJson)

      })
    }
    
  }
  updatePosition(data){
    
    data.forEach((element)=>{
      this.blForm.controls.blData.value.forEach((element1,index)=>{
        if(element.Serial.trim() === element1.containerNumber.trim()){
          this.bl.at(index).patchValue({
            positionNo: element?.Pos,
            baplie: element?.Type
          })
        }
      })
    })
  }

  updateData(){
      const groupedData = this.blForm.controls.blData.value.reduce((acc, curr) => {
        const blId = curr?.blId
        if (!acc[blId]) {
          acc[blId] = [];
        }
        acc[blId].push(curr);
        return acc;
      }, {});
      const resultList = Object.keys(groupedData).map((id, index) => ({
        id,
        index,
        data: groupedData[id],
  
      }));
      
  
  
    let data = []

    this.houseBlList.forEach(element=>{
      resultList.forEach((element1)=>{
        if(element?.blId === element1.id){
            data.push( {...element,
              
                containers:element1.data})
            } 
        })
        
      
    
    })
     
    
    
    this.common.batchUpdate(Constant.MULTI_BL_UPDATE,data).subscribe((res:any)=>{
      if(res){
        this.notification.create(
          'success',
          'Updated Successfully',
          ''
        )
       
      }
    })
    
  }
}
