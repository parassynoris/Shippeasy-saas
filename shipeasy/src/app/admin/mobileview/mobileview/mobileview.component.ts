import { Component, OnInit } from '@angular/core'; 
import { ApiService } from '../../principal/api.service';
import { BaseBody } from '../../smartagent/base-body';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
@Component({
  selector: 'app-mobileview',
  templateUrl: './mobileview.component.html',
  styleUrls: ['./mobileview.component.scss']
})
export class MobileviewComponent implements OnInit {
  vesselList: any = [];
  baseBody:any;
  activeTab = 'tab1';
  displayBasic :any;
  displayBasic1 = false;
  filterBody:any;
  urlParam:any;
  sofObj:any;
  sofListinData:any;
  activityName:any;
  activityStatus:any="arrival"
  remark:any;
  activityChangeTime:any;
  sofId:any = ''
  dateTimeOfActivity:any;
  selectedActivity:any;
  activityObj:any;
  listOfOption: string[] = [];
  listOfSelectedValue = ['a10', 'c12'];
  jobData:any;
  portcallId:any;
  jobNo:any;
  jobDetails:any;
  jobSpecificActivities:any;

  activitiesArray=[
    {item_id:1,item_text:"Completed Cargo Operation"},
    {item_id:2,item_text:"Complete Lashing Securing"},
    {item_id:3,item_text:"Completed Final Draft Survey"},
    {item_id:4,item_text:"Commenced Final Ullage Survey"},
    {item_id:5,item_text:"Commenced Empty Tank Insp"},
    {item_id:6,item_text:"Hose/Hoses Disconnected"},
    {item_id:7,item_text:"Commence Heaving Anchor"},
    {item_id:8,item_text:"Anchor Aweigh"},
    {item_id:9,item_text:"Pilot On Board"},
    {item_id:10,item_text:"First Line Ashore"},
    {item_id:11,item_text:"Finished With Engine"},
    {item_id:12,item_text:"Gangway Lowered"},
    {item_id:13,item_text:"Agent Boarded Vessel"},
    {item_id:14,item_text:"Customs Cleared"},
    {item_id:15,item_text:"Commenced Ullaging/Sampling"},
    {item_id:16,item_text:"Commenced Initial Draft Survey"},
    {item_id:17,item_text:"Hoses Connected"},
    {item_id:18,item_text:"Vessel Arrived"},
    {item_id:19,item_text:"Free Partique Granted Time"},
    {item_id:20,item_text:"Anchor Dropped"},
    {item_id:21,item_text:"Comm Tank/Hatch Insp"},
    {item_id:22,item_text:"End of Sea Passage"},
    {item_id:23,item_text:"ETB"},
  ]

  activitiesValue:any=[
    {label:"Completed Cargo Operation",date:'',key:'completedCargoOperation',checked:false},
    {label:"Complete Lashing Securing",date:'',key:'completeLashingSecuring',checked:false},
    {label:"Completed Final Draft Survey",date:'',key:'commencedFinalDraftSurvey',checked:false},
    {label:"Commenced Final Ullage Survey",date:'',key:'commencedFinalUllageSurvey',checked:false},
    {label:"Commenced Empty Tank Insp",date:'',key:'commencedEmptyTankInsp',checked:false},
    {label:"Hose/Hoses Disconnected",date:'',key:'hosesDisconnected',checked:false},
    {label:"Commence Heaving Anchor",date:'',key:'commenceHeavingAnchor',checked:false},
    {label:"Anchor Aweigh",date:'',key:'anchorAweigh',checked:false},
    {label:"Pilot On Board",date:'',key:'pilotOnBoard',checked:false},
    {label:"First Line Ashore",date:'',key:'firstLineAshore',checked:false},
    {label:"Finished With Engine",date:'',key:'finishedWithEngine',checked:false},
    {label:"Gangway Lowered",date:'',key:'gangwayLowered',checked:false},
    {label:"Agent Boarded Vessel",date:'',key:'agentBoardedVessel',checked:false},
    {label:"Customs Cleared",date:'',key:'customsCleared',checked:false},
    {label:"Commenced Ullaging/Sampling",date:'',key:'commencedUllaging',checked:false},
    {label:"Commenced Initial Draft Survey",date:'',key:'completedInitialDraft',checked:false},
    {label:"Hoses Connected",date:'',key:'hosesConnected',checked:false},
    {label:"Vessel Arrived",date:'',key:'vesselArrived',checked:false},
    {label:"Free Partique Granted Time",date:'',key:'partiqueGrantedTime',checked:false},
    {label:"Anchor Dropped",date:'',key:'anchorDropped',checked:false},
    {label:"Comm Tank/Hatch Insp",date:'',key:'hatchInsp',checked:false},
    {label:"End of Sea Passage",date:'',key:'endSeaPassage',checked:false},
    {label:"ETB",date:'',key:'etb',checked:false}
  ]

  settings = {
    singleSelection: false,
    idField: 'item_id',
    textField: 'item_text',
    enableCheckAll: false,
    allowSearchFilter: false,
    limitSelection: -1,
    clearSearchFilter: true,
    maxHeight: 197,
    itemsShowLimit: 3,
    closeDropDownOnSelection: false,
    showSelectedItemsAtTop: false,
    defaultOpen: false,
  };
  dropdownSettings = {};
  dropdownList = [];
  selectedItems = [];



  constructor(private _api: ApiService,private jobService: ApiService,private tranService : TransactionService,private transactionService: TransactionService) {

  }

  onJobNoChange(e,type){
    this.jobNo = e.target.value
  }
  onSelectActivity(e){
let activityObj = this.activitiesValue.filter(e => e.key ===this.selectedActivity)
this.activityObj = activityObj[0]
  }

  onSelectDate(e){
this.activityObj = {}
this.activityObj.date = new Date(e.target.value)
  }

  objCreator(obj){
    let obj1 = {}
      obj1[obj.key] = obj.date
    return obj1;
  }

  getJobDetails(){
    var parameter = {
      size: 10,
      from: 0,
      sort : {
        "createdOn": "desc"
      },
      query: {
        bool: {
          must: [
            {
              match: {
                jobNo: this.jobNo,
              },
            },
          ],
          filter: [],
          should: [],
          must_not: [],
        },
      },
    };
    this.transactionService.getJobList(parameter).subscribe((data) => {
      this.jobData = data.hits.hits[0]._source;
    })
  }

  getJobList() {
  
    let date = new Date('2022, 11, 15')
    let mustArray = []
    mustArray.push({
      range: {
        createdOn: {
          gte: new Date(date.setHours(0,0,0,0)),
          lt: new Date(date.setHours(23,59,59,999))
        },
      },
    })
    var p1 = {
      "size": 1000,
      "query": {
        "bool": {
          must:[],
          "should": [
            {
              "range": {
                "createdOn": {
                  "gte": "2022-11-11T00:00:00.000Z",
                  "lt": "2022-11-18T23:59:00.000Z"
                }
              }
            }
          ]
        }
      }
    }
    this.tranService.getJobList(p1).subscribe((data) => {
      this.jobData = data.hits.hits;

    });
  }

  onSelectDateJob(e){

  }

  createModel() {

    let obj = {}

  obj['orgId'] = "1";
  obj['tenantId'] = "1";
  obj['sofDate'] =  '';
  obj['sofId'] = this.sofId;
  obj['jobId'] = '1234'
  obj['activityName'] = this.activityName
  obj['activityType'] = this.activityName

  obj['portcall']={}
  obj['portcallId'] = this.portcallId
  obj['portcall']={}
  obj['portcall']['portcallNumber'] = '';

  obj['arrival']={}
  obj['arrival']['cargoQuantity'] =''
  obj['arrival']['cargoType'] =''

  obj['arrival']['robLoEosp'] =''
  obj['arrival']['robFoEosp'] =''
  obj['arrival']['robDoEosp'] =''
  obj['arrival']['robFwEosp'] =''
  obj['arrival']['lastPortId'] =''
  obj['arrival']['lastPortName'] =''
  obj['arrival']['nextPortName'] = ''
  obj['arrival']['remark'] = this.remark

  obj['berthing'] = {}
  obj['berthing']['combinedReport'] = ''
  obj['berthing']['berthing'] = ''
  obj['berthing']['berthId'] = ''
  obj['berthing']['berthName'] = ''
 
  obj['berthing']['beartRemark1'] = ''
  obj['berthing']['agentBoardedVessel'] = ''

  obj['berthing']['robLo'] = ''
  obj['berthing']['robFo'] = ''
  obj['berthing']['robDo'] = ''
  obj['berthing']['robFW'] = ''
  obj['berthing']['remark'] = this.remark

  obj['departure']= {}
  obj['departure']['combinedReport'] = ''
  obj['departure']['berthing'] = ''
 
  obj['departure']['remark'] = this.remark

  if(this.activityName === 'arrival'){
    obj['arrival'][this.activityObj.key] = this.activityObj.date
  }

  if(this.activityName === 'berthing'){
    obj['berthing'][this.activityObj.key] = this.activityObj.date
  }

  if(this.activityName === 'departure'){
    obj['departure'][this.activityObj.key] = this.activityObj.date
  }

    return obj;
  }

  ngOnInit(): void {
    this.getVesselListDropDown()
    this.getSOFList()
    this.getJobList()
    const children: string[] = [];
    for (let i = 10; i < 36; i++) {
      children.push(`${i.toString(36)}${i}`);
    }
    this.listOfOption = children;

  
    this.dropdownList = [
      { item_id: 1, item_text: 'Mumbai' },
      { item_id: 2, item_text: 'Bangaluru' },
      { item_id: 3, item_text: 'Pune' },
      { item_id: 4, item_text: 'Navsari' },
      { item_id: 5, item_text: 'New Delhi' }
    ];
    this.selectedItems = [
      { item_id: 3, item_text: 'Pune' },
      { item_id: 4, item_text: 'Navsari' }
    ];
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
  }

  onItemSelect(item: any) {
  }
  onSelectAll(items: any) {

  }
  closeActivity(){
    this.isShow = !this.isShow;
    this.displayBasic = ''
  }
  getSOFList() {
    this.filterBody = this.jobService.body
    let must = [];
   
    if(this.filterBody?.query.bool.must)this.filterBody.query.bool.must = must;
    if(this.filterBody?.sort)this.filterBody.sort = { "createdOn": "desc"}
    this.jobService.getListByURL('sof', this.filterBody)?.subscribe((data: any) => {
      this.sofListinData = data?.hits?.hits
      for (let i = 0; i < this.sofListinData.length; i++) {
      }
    })
  }
  getVesselListDropDown() {
    this.baseBody = new BaseBody();
    let mustArray = [];
      mustArray.push({
        "match": {"status": true}
      });
    this.baseBody.baseBody.query.bool.must = mustArray;
    this.baseBody.baseBody.sort = { "createdOn": "desc"}
    this._api.getListByURL("master/list?type=vessel", this.baseBody.baseBody)?.subscribe((res: any) => {
      this.vesselList = res?.hits?.hits;

    });
  }

  onTab(tabName) {

    this.activeTab = tabName;
  }

  onAdd(){
    this.displayBasic = 'add'
  }

  saveActivity(type){
    this.objCreator(this.activityObj)
    let sofPayload = this.createModel();
    let createBody = [];
    createBody.push(sofPayload)
    if(type === 'add'){
      this.jobService.getListByURL('sof', createBody).subscribe((data: any) => {
        if (data) {
     
          this.isShow = !this.isShow;
          this.displayBasic = ''
        }
      })
    }else{
      this.jobService.getListByURL('sof', createBody).subscribe((data: any) => {
        if (data) {
         
          this.isShow = !this.isShow;
    this.displayBasic = ''

        }
      })
    }
  }

  setActivity(type){

    this.displayBasic = type;
    if(type === ''){
      this.displayBasic =false
    }

  }
  isShow =false;
  setActivity1(sof,type){
    this.sofId = sof._source.sofId
    this.activityName = sof._source.activityName
    this.activityStatus = sof._source.activityType
    this.remark = sof._source.remarks
   if(type === 'activity')
   {
    this.portcallId = sof._source.portcall.portcallId
    let obj = sof._source[this.activityName]
    let activityOBJ;
    if(obj){
      Object.keys(obj).forEach(e=>{
        if(obj[e]!=''){
          this.activityStatus = this.activitiesValue.filter(e1 => {
            if (e===e1.key){
              activityOBJ = {date:obj[e],key:e}
             }
          })
        }
      })
      this.dateTimeOfActivity = activityOBJ ? new Date(activityOBJ.date) : new Date()
      this.activityStatus = activityOBJ ? activityOBJ.key : ''
    }
   }
    this.isShow = !this.isShow;

  }



}
