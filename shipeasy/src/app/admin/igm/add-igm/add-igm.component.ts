import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { ApiSharedService } from 'src/app/shared/components/api-service/api-shared.service';

import { ApiService } from '../../principal/api.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as Constant from 'src/app/shared/common-constants';
import { igmContainer } from '../container-igm';
import { saveAs } from 'file-saver';
import { CommonService } from 'src/app/services/common/common.service';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { BaseBody } from '../../smartagent/base-body';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { DatePipe } from '@angular/common';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { environment } from 'src/environments/environment';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { SharedService } from 'src/app/shared/services/shared.service';
import { PortDetails } from 'src/app/models/yard-cfs-master';
import { Vessel } from 'src/app/models/vessel-master';

@Component({
  selector: 'app-add-igm',
  templateUrl: './add-igm.component.html',
  styleUrls: ['./add-igm.component.scss'],
})
export class AddIgmComponent implements OnInit {
  @Input() public igmId;
  @Input() public isShow;
  isTypeForm = 'Add';
  costItemData ='';
  Show = false;
  // isShow: any;
  holdControl = '';
  isHoldType: any = 'add';
  filterBody = this.apiService.body;
  portListData:PortDetails[]  = [];
  submitted: boolean = false;
  igmForm: FormGroup;
  blList: any;
  @Output() getList = new EventEmitter<any>();
  containerBillsData = [];
  isExpand:boolean =false;
  listOfItem = [];
  vesselList:Vessel[] = [];
  jobData:any = [];
  selectedJob:any;
  baseBody: BaseBody = new BaseBody();
  smartAgentDetail:any;
  vesselListData:any=[];


  constructor(
    public profilesService: ProfilesService,
    private commonService : CommonService,
    public _api: ApiService,
    private modalService: NgbModal,
    public formBuilder: FormBuilder,
    public apiService: ApiSharedService,
    public transaction:TransactionService,
    public notification: NzNotificationService,
    private datePipe:DatePipe,
    public mastersService: MastersService,
    public commonFunctions:CommonFunctions,
    public _sharedService:SharedService
  ) {
    this.getPortData();
    // this.getVesselList();
    this.getIGMtest()
    this.getShipingLineInfo();
  }

  ngOnInit(): void {
    if(this.igmId){
      this.getdata();
      this.isTypeForm='Edit'
    }
    this.igmForm = this.formBuilder.group({
      job: [''],
      port:['',Validators.required],
      shippinglineId:['',Validators.required],
      vessel: ['', Validators.required],
      voyage: ['', Validators.required],
      igm_no: ['',Validators.required],
      igmDate: ['',Validators.required],
      lastPort: ['', Validators.required],
      cha: ['', Validators.required],
      light_dues: ['', Validators.required],
      toc: ['', Validators.required],
      vesselImo:['',Validators.required],
      vesselcallSign:['',Validators.required],
      custom_line_code:['',Validators.required],
      custom_agent_code:['',Validators.required],
      igmVesseltype:[null],
      priorPort1:['',Validators.required],
      testorProduction:['',Validators.required],
      briefCargoForigm:['',Validators.required],
      priorPort2:['',Validators.required],
      captain:['',Validators.required],
      totalLines:[''],
      sbc: [false],
      ssd: [false],
      cld: [false],
      pld: [false],
      ced: [false],
      md: [false],
      containerArray: this.formBuilder.array([]),
    });
    this.getSmartAgentDetailById(this.commonFunctions.getAgentDetails()?.orgId)


  }
  get f1() {
    return this.igmForm.controls;
  }

  vesselDetails:any;
  getVesselDetails(ev?) {
    if(this.igmForm.value.vessel){
      let payload = this.commonService.filterList()
      if(payload?.query)payload.query = {
        "vesselId":this.igmForm.value.vessel
      }
      this.commonService.getSTList('vessel', payload)
        ?.subscribe((res: any) => {
          this.vesselDetails = res?.documents[0];
          if(this.vesselDetails)
          this.igmForm.get('vesselImo').patchValue(this.vesselDetails?.imoNo);
          this.igmForm.get('vesselcallSign').patchValue(this.vesselDetails?.callSign);
        });
    }
  }
  IGMTest:any
  getIGMtest() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      typeCategory: 'IGMTestorProduction',
    }
    this.commonService.getSTList('systemtype',payload)?.subscribe((res: any) => {
      this.IGMTest = res?.documents;
    });
  }
  getJobList() {
    let mustArray =[]
    if (this.commonService.dashboardJobKey != '') {
      let da_status = this.commonService.dashboardJobKey
      mustArray.push({
        match: {
          "daStatus": da_status,
        },
      });
    }
    var parameter = {
      size: 1000,
      sort:{createdOn:"desc"},
      query: {
        bool: {
          must: mustArray,
          filter: [],
          should: [],
          must_not: [],
        },
      },
    };
    this.transaction.getJobList(parameter).subscribe((data) => {
      this.jobData = data.hits.hits;
    });
  }

  jobSelect(jobid){
    this.selectedJob = this.jobData.find(job => job.jobId == jobid);
    this.igmForm.get('vessel').patchValue(this.selectedJob?.vesselDetails?.vesselId);
    this.igmForm.get('voyage').patchValue(this.selectedJob?.vesselDetails?.voyageNo);
    this.igmForm.get('port').patchValue(this.selectedJob?.portDetails?.port);
  }

  getSmartAgentDetailById(agentId: any) {
    this.baseBody = new BaseBody();

    let must = [
      {
        match: {
          agentId: agentId,
        },
      },
    ];
    this.baseBody.baseBody.query.bool.must = must;
    this.profilesService.getSmartAgentById(this.baseBody.baseBody)?.subscribe((data: any) => {
      this.smartAgentDetail = data?.hits?.hits[0];
     if(!this.igmId && this.smartAgentDetail?.igmCode) this.igmForm.get('igm_no').patchValue(this.smartAgentDetail?.igmCode)
    })

  }

  async getPortData() {
    let payload = this.commonService.filterList()
    payload.query = {
    }

    let must = [];
    this.filterBody.query.bool.must = must;
    this.commonService.getSTList('port',payload)
      .subscribe((res: any) => {
        this.portListData = res?.documents
      });
  }
  getVesselVoyageList() {
    let payload = this.commonService?.filterList()
    if(payload?.query)payload.query = { status: true ,"voyage.shipping_line":this.igmForm.value.shippinglineId}
     this._api?.getSTList('voyage', payload)
      ?.subscribe((res: any) => {
        this.vesselListData=[]
        const uniqueVessels = new Set();
         res?.documents.filter((doc) => {
          const isUnique = !uniqueVessels.has(doc?.vesselId);
          if (isUnique) {
            uniqueVessels.add(doc?.vesselId);
            this.vesselListData.push(doc);
          }
        })
      });
  }
  getvoyageList(){
    return this.vesselListData?.find(r=>r?.vesselId===this.igmForm.value.vessel)?.voyage??[]
  }

  getVesselList() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
    }
    let must = [];
    this.filterBody.query.bool.must = must;
    this.commonService.getSTList('vessel', payload)
      ?.subscribe((res: any) => {

        this.vesselList = res?.documents;
        this.listOfItem = res?.documents;
        this.listOfItem = this.listOfItem.filter(
          (e) => e?.status === true || e?.status === 'true'
        );
      });
  }

  closeModal() {
    this.modalService.dismissAll();
  }
  onDownload(){
    this.submitted = true;
    if (this.igmForm.invalid) {
      return;
    }
    var polData = this.portListData.filter(
      (x) => x.portId == this.igmForm.value.pol
    );
    let totallines  =0;
    (this.blList??[])?.forEach((i) => {if(i?.selected){
      totallines+=1;
    }})
    let date = new Date();
    let header = `HREC\u001DZZ\u001DULS\u001DZZ\u001DINHZA1\u001D${environment.igmMsgversion}\u001D${this.igmForm.value.testorProduction}\u001D${environment.igmMsgType}\u001D5154602\u001D${this.datePipe.transform(date,'yyyyMMdd')}\u001D${this.datePipe.transform(date,'HHmm','UTC')}`
    let footer = `TREC\u001D5154602`;
    let port = this.portListData.find((i) => i.portId ===this.igmForm.value.port);
    let vesdetails  =`<vesinfo>\n${Object.values({
      msgType:'F',
      cha:this.igmForm.value.cha,
      imo:this.igmForm.value.imo,
      vesselCode:this.igmForm.value.vesselcallSign,
      voyageNo:this.igmForm.value.voyageNo,
      lineNo: this.shippinglineData?.igmCode,
      agentCode: this.shippinglineData?.igmCode,
      masterName:this.igmForm.value.captain,
      poa:port?.portDetails?.shortName,
      lastPort:this.portListData.find((i) => i.portId ===this.igmForm.value.lastPort)?.portDetails?.shortName,
      vesselType:this.igmForm.value.igmVesseltype,
      totalLies:totallines,
      cargodescription:this.igmForm.value.briefCargoForigm,
      timeAndDate: this.datePipe.transform(this.voyagedetails?.eta,'ddMMyyyy HH:mm'),
      lightHouseDues: this.igmForm.controls.light_dues.value ? 'N':'Y',
      sameBottomCargo: this.igmForm.controls.sbc.value? 'N':'Y',
      shipStoresDeclaration: this.igmForm.controls.ssd.value? 'N':'Y',
      crewListDeclaration: this.igmForm.controls.cld.value? 'N':'Y',
      passengerList: this.igmForm.controls.pld.value? 'N':'Y',
      crewEffectDeclaration: this.igmForm.controls.ced.value? 'N':'Y',
      marinetimeDeclaration: this.igmForm.controls.md.value? 'N':'Y',
      terminalOperatorCode: this.igmForm.controls.toc.value,

    }).join('\u001D').toUpperCase()}\n<END-vesinfo>`;



    var allCargos = [];
    var selectedBls = [];
    (this.blList??[]).forEach((bl) =>{
      if(bl.selected){
        selectedBls.push({blId:bl.blId,blNumber:bl.blNumber});
        let cargoDetail = {
          msgType: 'F',
          cha: port?.portDetails?.shortName,
          imo: this.igmForm.value.imo,
          vesselcallSign: this.igmForm.value.vesselcallSign,
          voyageNo: this.igmForm.controls.voyage.value,
          lineNo: bl?.itemNo,
          sublineNo: 0,
          blNo: bl?.blNumber,
          blDate: bl?.createdOn,
          pol: this.portListData.find((i) => i.portId === bl?.polId)?.portDetails?.shortName,
          pod: this.portListData.find((i) => i.portId === bl?.entryPortId)?.portDetails?.shortName,
          importer: bl?.consigneeName,
          address1: bl?.consigneeAddress.slice(0, 35),
          address2: bl?.consigneeAddress.slice(35),
          natureOfCargo: bl?.cargoNature,
          cargoMovement: bl?.cargoType,
          noOfPackages: bl?.no_of_packages,
          typeOfPackages: bl?.packageType,
          grossWeight: bl?.gross_wt,
          uom: bl?.uom,
          marksNo: bl?.marksNo,
          uno: 'ZZZZZ',
          IMCO: 'ZZZZZ',
          goodsDescription: bl?.additional,
        };
        allCargos.push(Object.values(cargoDetail).join('\u001D').toUpperCase());
      }
    })
    const cargo = `<cargo>`+'\n'+allCargos.join('\n')+'\n'+`<END-cargo>`;
    let finalFile = `${header}\n<manifest>\n${vesdetails}\n${cargo}\n<contain>\n<END-contain>\n<END-manifest>\n${footer}`
    let vesselName = this.vesselListData.find((i) => i?.vesselId === this.igmForm.value.vessel)?.vesselName
    let now     = new Date();
    let year    = now.getFullYear();
    let month   = now.getMonth()+1;
    let day     = now.getDate();
    let hour    = now.getHours();
    let minute  = now.getMinutes();
    let second  = now.getSeconds();
    let dateTimeString = year+month+day+hour+minute+second
    const blob = new Blob([finalFile],{type:'text/plain;charset=utf-8'});
    saveAs(blob, 'BL'+vesselName+'-'+this.igmForm.value.voyage+'-'+dateTimeString+'.igm');
    this.igmForm.value.igmName = 'BL'+vesselName+'-'+this.igmForm.value.voyage+'-'+dateTimeString+'.igm'
  }
  ngOnSave() {
    this.submitted = true;
    if (this.igmForm.invalid) {
      return;
    }
    var polData = this.portListData.filter(
      (x) => x.portId == this.igmForm.value.pol
    );
    let totallines  =0;
    (this.blList??[])?.forEach((i) => {if(i?.selected){
      totallines+=1;
    }})
    let date = new Date();
    let header = `HREC\u001DZZ\u001DULS\u001DZZ\u001DINHZA1\u001D${environment.igmMsgversion}\u001D${this.igmForm.value.testorProduction}\u001D${environment.igmMsgType}\u001D5154602\u001D${this.datePipe.transform(date,'yyyyMMdd')}\u001D${this.datePipe.transform(date,'HHmm','UTC')}`
    let footer = `TREC\u001D5154602`;
    let port = this.portListData.find((i) => i.portId ===this.igmForm.value.port);
    let vesdetails  =`<vesinfo>\n${Object.values({
      msgType:'F',
      cha:this.igmForm.value.cha,
      imo:this.igmForm.value.imo,
      vesselCode:this.igmForm.value.vesselcallSign,
      voyageNo:this.igmForm.value.voyageNo,
      lineNo: this.shippinglineData?.igmCode,
      agentCode: this.shippinglineData?.igmCode,
      masterName:this.igmForm.value.captain,
      poa:port?.portDetails?.shortName,
      lastPort:this.portListData.find((i) => i.portId ===this.igmForm.value.lastPort)?.portDetails?.shortName,
      vesselType:this.igmForm.value.igmVesseltype,
      totalLies:totallines,
      cargodescription:this.igmForm.value.briefCargoForigm,
      timeAndDate: this.datePipe.transform(this.voyagedetails?.eta,'ddMMyyyy HH:mm'),
      lightHouseDues: this.igmForm.controls.light_dues.value ? 'N':'Y',
      sameBottomCargo: this.igmForm.controls.sbc.value? 'N':'Y',
      shipStoresDeclaration: this.igmForm.controls.ssd.value? 'N':'Y',
      crewListDeclaration: this.igmForm.controls.cld.value? 'N':'Y',
      passengerList: this.igmForm.controls.pld.value? 'N':'Y',
      crewEffectDeclaration: this.igmForm.controls.ced.value? 'N':'Y',
      marinetimeDeclaration: this.igmForm.controls.md.value? 'N':'Y',
      terminalOperatorCode: this.igmForm.controls.toc.value,

    }).join('\u001D').toUpperCase()}\n<END-vesinfo>`;



    var allCargos = [];
    var selectedBls = [];
    (this.blList??[]).forEach((bl) =>{
      if(bl.selected){
        selectedBls.push({blId:bl.blId,blNumber:bl.blNumber});
        let cargoDetail = {
          msgType: 'F',
          cha: port?.portDetails?.shortName,
          imo: this.igmForm.value.imo,
          vesselcallSign: this.igmForm.value.vesselcallSign,
          voyageNo: this.igmForm.controls.voyage.value,
          lineNo: bl?.itemNo,
          sublineNo: 0,
          blNo: bl?.blNumber,
          blDate: bl?.createdOn,
          pol: this.portListData.find((i) => i.portId === bl?.polId)?.portDetails?.shortName,
          pod: this.portListData.find((i) => i.portId === bl?.entryPortId)?.portDetails?.shortName,
          importer: bl?.consigneeName,
          address1: bl?.consigneeAddress.slice(0, 35),
          address2: bl?.consigneeAddress.slice(35),
          natureOfCargo: bl?.cargoNature,
          cargoMovement: bl?.cargoType,
          noOfPackages: bl?.no_of_packages,
          typeOfPackages: bl?.packageType,
          grossWeight: bl?.gross_wt,
          uom: bl?.uom,
          marksNo: bl?.marksNo,
          uno: 'ZZZZZ',
          IMCO: 'ZZZZZ',
          goodsDescription: bl?.additional,
        };
        allCargos.push(Object.values(cargoDetail).join('\u001D').toUpperCase());
      }
    })
    const cargo = `<cargo>`+'\n'+allCargos.join('\n')+'\n'+`<END-cargo>`;
    let finalFile = `${header}\n<manifest>\n${vesdetails}\n${cargo}\n<contain>\n<END-contain>\n<END-manifest>\n${footer}`
    let vesselName = this.vesselListData.find((i) => i?.vesselId === this.igmForm.value.vessel)?.vesselName
    let now     = new Date();
    let year    = now.getFullYear();
    let month   = now.getMonth()+1;
    let day     = now.getDate();
    let hour    = now.getHours();
    let minute  = now.getMinutes();
    let second  = now.getSeconds();
    let dateTimeString = year+month+day+hour+minute+second
    this.igmForm.value.igmName = 'BL'+vesselName+'-'+this.igmForm.value.voyage+'-'+dateTimeString+'.igm'
    const port_vessel_name={
      portName:this.portListData.find(port=>port?.portId===this.igmForm.value?.port)?.portDetails?.portName??'',
      vesselName:this.vesselListData.find(vessel=>vessel?.vesselId===this.igmForm.value?.vessel)?.vesselName??''
    }
    if (this.igmId) {
      this.commonService.UpdateToST('igm/' + this.igmId, { ...this.igmForm.value,...port_vessel_name, cargo }).subscribe(data => {
          setTimeout(() => {
              this.getList.emit(data);
          }, 1000);
          this.notification.create('success', 'Updated Successfully', '');
          this.modalService.dismissAll();

      }, (error) => {
          this.closeModal();
          this.notification.create('error', error?.error?.error?.message, '');
      })
  } else {
      this.commonService.addToST('igm', { ...this.igmForm.value,...port_vessel_name,  cargo }).subscribe(data => {
          if (data) {

          }
          setTimeout(() => {
              this.getList.emit(data);
          }, 1000);
          this.notification.create('success', 'Added Successfully', '');
          this.modalService.dismissAll();

      }, (error) => {
          this.closeModal();
          this.notification.create('error', error?.error?.error?.message, '');
      })
    }
  }

  voyagedetails:any;
  ngOnGetBLs(igm?) {
    // const vesselId=igm?.vesselId??this.igmForm.value.vessel
    let payload = this.commonService.filterList()
    payload.query = {
      // "voyageNumber": this.egmForm.value.voyage,
      "vesselId": this.igmForm.value.vessel
    }
    this.commonService.getSTList('voyage',payload).subscribe((result) => {
      // this.voyagedetails = result.documents[0];
      // const chartId = this.vesselList?.find((x) => x?.vesselId === vesselId)?.chartId;
      const voyage = (this.voyagedetails?.voyage??[])?.find(x=> x.shipping_line === this.igmForm.value.shippinglineId)?.voyage_number;
      if (result && !this.igmId) {
        // this.igmForm.get('voyage').patchValue(voyage);
        this.igmForm.get('lastPort').patchValue(this.voyagedetails?.lastPortCall);
        this.igmForm.get('igm_no').patchValue(this.voyagedetails?.igmNo);
        if(this.voyagedetails?.port) this.igmForm.get('port').patchValue(this.voyagedetails?.port);
        this.igmForm.get('priorPort1').patchValue(this.voyagedetails?.priorPort1);
        this.igmForm.get('priorPort2').patchValue(this.voyagedetails?.priorPort2);
        this.igmForm.get('captain').patchValue(this.voyagedetails?.captainName);
        this.igmForm.get('igmDate').patchValue(this.voyagedetails?.igmDate);
        this.igmForm.get('igmVesseltype').patchValue(this.voyagedetails?.igmVesselType);
        this.igmForm.get('briefCargoForigm').patchValue(this.voyagedetails?.briefCargoForigm);
        let port = this.portListData.find((i) => i.portId ===this.igmForm.value.port);
        this.igmForm.get('cha').patchValue(port?.portDetails?.igmCode);
        // this.getShipingLineInfo(this.voyagedetails?.shippingLine);

        let payload1 = this.commonService.filterList()
        payload1.query = {
          "voyageNumber": this.igmForm.value.voyage,
          "vessel": this.igmForm.value.vessel
        }
        if(this.igmForm.value.port){
          payload1.query={... payload1.query, "polId": this.igmForm.value.port}
        }
        if(!this.igmForm.value.port || !this.igmForm.value.vessel)return;
        this._api
          .getSTList(Constant.BL_LIST, payload1)
          .subscribe((res: any) => {
            this.blList = res?.documents?.map((i, index) => {
              if (igm && Array.isArray(igm.egmcont)) { // Check if egm.egmcont exists and is an array
                i['selected'] = igm.egmcont.some(b => b?.blId === i?.blId);
              } else {
                i['selected'] = true;
              }
              i['itemNo'] = index + 1;
              return i;
            });
          });
          }
    }, error => {
      this.notification.create(
        'error',
        'No BLs Found',
        ''
      );
    });
    //   "voyageNumber": this.egmForm.value.voyage,
    //   "vessel": this.egmForm.value.vessel
    // }
    // if(this.egmForm.value.port){
    //   payload1.query={... payload1.query, "polId": this.egmForm.value.port}
    // }
    // if(!this.egmForm.value.port || !this.egmForm.value.vessel)return;
    // this._api
    // .getSTList(Constant.BL_LIST, payload1)
    // .subscribe((res: any) => {
    //   this.blList = res?.documents?.map((i, index) => {
    //     if (igm && Array.isArray(igm.igmcont)) { // Check if igm.igmcont exists and is an array
    //       i['selected'] = igm.egmcont.some(b => b?.blId === i?.blId);
    //     } else {
    //       i['selected'] = true;
    //     }
    //     i['itemNo'] = index + 1;
    //     return i;
    //   });
    // });
    
  }

  shippinglineData:any;
  getShipingLineInfo(){
    let payload = this.commonService.filterList()
    if(payload)payload.query = {
      ShipmentTypeName: 'Ocean'
    }
    this.commonService.getSTList('shippingline',payload)?.subscribe((data) => {
      this.shippinglineData = data?.documents;
    });
  }

  onShowDetails(blData) {
    this.isExpand = !this.isExpand;
    this.igmForm.controls.containerArray = this.formBuilder.array([]);
    let payload = this.commonService.filterList()
    payload.query = {
      blId: blData.blId,
    }
    this.commonService.getSTList('container', payload)
      .subscribe((res: any) => {
        res?.documents.forEach((container) => {
          (<FormArray>this.igmForm.get('containerArray')).push(
            this.formBuilder.group({
              isSelected:false,
              containerId: container.containerId,
              containerNumber: container.containerNumber,
              containerTypeName: container.containerTypeName,
              containerSizeName: container.containerSizeName,
              cargoType: container.cargoType,
              eSeal:container.sealNo,
              noOfPackages:container?.noOfPackages,
              netWeight:container?.netWeight,
              hsnCode: container.hsnCode,
              status:container?.containerStatus,
              lineNo: container?.lineNo,
              subLineNo: container?.subLineNo,
              agentCode: container?.agentCode,
              isoCode:container?.isoCode,
              imoCode:container?.imoCode,
              soc:container?.soc,
            })
          );
        });
      });
  }

  getdata(){
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      igmId:this.igmId
    }
    this.commonService.getSTList('igm', payload)?.subscribe((data) => {
      let igm = data.documents?.[0]
      if(data.documents.length > 0){
        this.igmForm.patchValue({
          job: igm?.job || '',
          port: igm?.port || '',
          shippinglineId: igm?.shippinglineId || '',
          vessel: igm?.vessel || '',
          voyage: igm?.voyage || '',
          igm_no: igm?.igm_no || '',
          igmDate: igm?.igmDate || '',
          lastPort: igm?.lastPort || '',
          cha: igm?.cha || '',
          light_dues: igm?.light_dues || '',
          toc: igm?.toc || '',
          vesselImo: igm?.vesselImo || '',
          vesselcallSign: igm?.vesselcallSign || '',
          custom_line_code: igm?.custom_line_code || '',
          custom_agent_code: igm?.custom_agent_code || '',
          igmVesseltype: igm?.igmVesseltype || '',
          priorPort1: igm?.priorPort1 || '',
          testorProduction: igm?.testorProduction || '',
          briefCargoForigm: igm?.briefCargoForigm || '',
          priorPort2: igm?.priorPort2 || '',
          captain: igm?.captain || '',
          totalLines: igm?.totalLines || '',
          sbc: igm?.sbc || '',
          ssd: igm?.ssd || '',
          cld: igm?.cld || '',
          pld: igm?.pld || '',
          ced: igm?.ced || '',
          md: igm?.md || '',
        });
        this.getVesselVoyageList();
        this.ngOnGetBLs(igm);
        if(this.isShow){
          this.igmForm.disable()
        }
      }

    }, error => {
      this.notification.create(
        'error',
       error?.error?.error?.message,
        ''
      );
    })
  }

}
