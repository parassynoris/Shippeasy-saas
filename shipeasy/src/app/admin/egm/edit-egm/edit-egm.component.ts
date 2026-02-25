import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { ApiSharedService } from 'src/app/shared/components/api-service/api-shared.service';
import { ApiService } from '../../principal/api.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as Constant from 'src/app/shared/common-constants';
import { saveAs } from 'file-saver';
import { CommonService } from 'src/app/services/common/common.service';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { BaseBody } from '../../smartagent/base-body';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { DatePipe } from '@angular/common';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { environment } from 'src/environments/environment';
import { Vessel } from 'src/app/models/vessel-master';
import { SystemType } from 'src/app/models/cost-items';
import { Port } from 'src/app/models/tariff-list';
import { voyage } from 'src/app/models/voyagedetails';
import { ShippingLine } from 'src/app/models/shipping-line';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { currentTime } from 'src/app/shared/util/date-time';

@Component({
  selector: 'app-edit-egm',
  templateUrl: './edit-egm.component.html',
  styleUrls: ['./edit-egm.component.scss']
})
export class EditEgmComponent implements OnInit {
  isTypeForm = 'Add';
  costItemData = "";
  @Input() public egmId;
  @Input() public isShow;
  Show = false;
  // isShow: any;
  holdControl = '';
  isHoldType: any = 'add';
  filterBody = this.apiService.body;
  portListData: Port[] = [];
  submitted: boolean = false;
  egmForm: FormGroup;
  blList: any;
  containerBillsData = [];
  isExpand: boolean = false;
  listOfItem = [];
  vesselList: Vessel[] = [];
  jobData: any = [];
  selectedJob: any;
  baseBody: BaseBody = new BaseBody();
  smartAgentDetail: any;
  currentUrl: string;
  urlParam: any;
  EGMTestorProduction: SystemType[] = [];
  @Output() getList = new EventEmitter();
  vesselListData:any=[]

  constructor(
    public profilesService: ProfilesService,
    public commonService: CommonService,
    public _api: ApiService,
    public modalService: NgbModal,
    public formBuilder: FormBuilder,
    public apiService: ApiSharedService,
    public transaction: TransactionService,
    public notification: NzNotificationService,
    public datePipe: DatePipe,
    public mastersService: MastersService,
    private route: ActivatedRoute,
  ) {
    this.getPortData();
    // this.getVesselList();
    this.getEGMTest();
    this.getShipingLineInfo();
    // this.currentUrl = window.location.href.split('?')[0].split('/').pop();
    // this.route.params?.subscribe(egm => {
    //   this.urlParam = egm.egmId;
    // });
    
  }

  ngOnInit(): void {
    if (this.egmId) {
      this.getdata();
      this.isTypeForm = 'Edit'
    }
    this.egmForm = this.formBuilder.group({
      job: [''],
      shippinglineId:['',Validators.required],
      port: ['',Validators.required],
      vessel: ['', [Validators.required]],
      voyage: ['', Validators.required],
      egm_no: ['', Validators.required],
      egmDate: ['', Validators.required],
      voyageDate: ['', Validators.required],
      lastPort: ['', Validators.required],
      cha: ['', Validators.required],
      light_dues: ['', Validators.required],
      toc: ['', Validators.required],
      vesselImo: ['',Validators.required],
      vesselcallSign: ['',Validators.required],
      custom_line_code: ['',Validators.required],
      custom_agent_code: ['',Validators.required],
      egmVesseltype: [null],
      priorPort1: ['', Validators.required],
      testorProduction: ['', Validators.required],
      briefCargoForegm: ['', Validators.required],
      priorPort2: ['', Validators.required],
      captain: ['',Validators.required],
      totalLines: [''],
      sbc: [false],
      ssd: [false],
      cld: [false],
      pld: [false],
      ced: [false],
      md: [false],
      containerArray: this.formBuilder.array([]),
    });
    this.getSmartAgentDetailById(localStorage.getItem('smartAgentId'))


  }
  get f1() {
    return this.egmForm.controls;
  }

  vesselDetails: Vessel;
  getVesselDetails(ev?) {
    let payload = this.commonService.filterList()
    payload.query = {
      "vesselId": this.egmForm.value.vessel
    }
    this.commonService.getSTList('vessel', payload)
    .subscribe((res: any) => {
        this.vesselDetails = res?.documents[0];
        if (this.vesselDetails) {
          this.egmForm.get('vesselImo').patchValue(this.vesselDetails?.imoNo);
          this.egmForm.get('vesselcallSign').patchValue(this.vesselDetails?.callSign);
        }

      });
  }
  getEGMTest() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      typeCategory: 'EGMTestorProduction',
    }
    this.commonService.getSTList('systemtype', payload)?.subscribe((res: any) => {
      this.EGMTestorProduction = res?.documents;
    });
  }
  getJobList() {
    let mustArray = []
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
      sort: { createdOn: "desc" },
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

  jobSelect(jobid) {
    this.selectedJob = this.jobData.find(job => job.jobId == jobid);
    this.egmForm.get('vessel').patchValue(this.selectedJob?.vesselDetails?.vesselId);
    this.egmForm.get('voyage').patchValue(this.selectedJob?.vesselDetails?.voyageNo);
    this.egmForm.get('port').patchValue(this.selectedJob?.portDetails?.port);
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
      // this.egmForm.get('egm_no').patchValue(this.smartAgentDetail?.egmCode)
    })

  }

  async getPortData() {
    let payload = this.commonService.filterList()
    payload.query = {
    }

    let must = [];
    this.filterBody.query.bool.must = must;
    this.commonService.getSTList('port', payload)
      .subscribe((res: any) => {
        this.portListData = res?.documents
      });
  }
   getVesselVoyageList() {
    let payload = this.commonService?.filterList()
    if(payload?.query)payload.query = { status: true ,"voyage.shipping_line":this.egmForm.value.shippinglineId}
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
    return this.vesselListData?.find(r=>r?.vesselId===this.egmForm.value.vessel)?.voyage??[]
  }
  getVesselList() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
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

  public findInvalidControls() {
    const invalid = [];
    const controls = this.egmForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  onDownload() {
    this.findInvalidControls()

    this.submitted = true;
    if (this.egmForm.invalid) {
      return;
    }
    var polData = this.portListData.filter(
      (x) => x.portId == this.egmForm.value.pol
    );
    let totallines = 0;
    (this.blList ?? []).forEach((i) => {
      if (i.selected) {
        totallines += 1;
      }
    })
    let date = new Date();
    let header = `HREC\u001DZZ\u001DULS\u001DZZ\u001DINCCU1\u001D${environment.egmMsgversion}\u001D${this.egmForm.value.testorProduction}\u001D${environment.egmMsgType}\u001D63104\u001D${this.datePipe.transform(date, 'yyyyMMdd')}\u001D${this.datePipe.transform(date, 'HHmm', 'UTC')}`
    let footer = `TREC\u001D63104`;
    let port = this.portListData.find((i) => i.portId === this.egmForm.value.port);

    var allCargos = [];
    var egmMaster = []
    let now1 = new Date(this.egmForm.value.egmDate);
    let year1 = now1.getFullYear();
    let month1 = now1.getMonth() + 1;
    let day1 = now1.getDate();
    let hour1 = now1.getHours();
    let minute1 = now1.getMinutes();
    let second1 = now1.getSeconds();
    let dateTimeString1 = year1 + month1 + day1 + hour1 + minute1 + second1;

    this.blList.forEach((bl) => {
      let cargoDetail = {
        msgType: 'F',
        cha: port?.portDetails?.[0]?.shortName,
        dtOfFile: dateTimeString1,
        imo: this.egmForm.value.imo,
        vesselcallSign: this.egmForm.value.vesselcallSign,
        voyageNo: this.egmForm.controls.voyage.value,
        blNo: bl.blNumber,
        blDate: bl.createdOn,
        pol: this.portListData.find((i) => i.portId === bl.polId)?.portDetails?.[0]?.shortName,
        pod: this.portListData.find((i) => i.portId === bl.entryPortId)?.portDetails?.[0]?.shortName,
        importer: bl.consigneeName,
        address1: bl.consigneeAddress?.slice(0, 35),
        address2: bl.consigneeAddress?.slice(35),
        natureOfCargo: bl.cargoNature,
        cargoMovement: bl.cargoType,
        noOfPackages: bl.no_of_packages,
        typeOfPackages: bl.packageType,
        grossWeight: bl.gross_wt,
        uom: bl.uom

      };
      egmMaster.push(Object.values(cargoDetail).join('\u001D').toUpperCase());
      if (bl.selected) {
        let cargoDetail = {
          msgType: 'F',
          cha: port?.portDetails?.[0]?.shortName,
          imo: this.egmForm.value.imo,
          vesselcallSign: this.egmForm.value.vesselcallSign,
          voyageNo: this.egmForm.controls.voyage.value,
          lineNo: bl.itemNo,
          sublineNo: 0,
          blNo: bl.blNumber,
          blDate: bl.createdOn,
          pol: this.portListData.find((i) => i.portId === bl.polId)?.portDetails?.[0]?.shortName,
          pod: this.portListData.find((i) => i.portId === bl.entryPortId)?.portDetails?.[0]?.shortName,
          importer: bl.consigneeName,
          address1: bl.consigneeAddress.slice(0, 35),
          address2: bl.consigneeAddress.slice(35),
          natureOfCargo: bl.cargoNature,
          cargoMovement: bl.cargoType,
          noOfPackages: bl.no_of_packages,
          typeOfPackages: bl.packageType,
          grossWeight: bl.gross_wt,
          uom: bl.uom,
          marksNo: bl.marksNo,
          goodsDescription: bl.additional,
          blId: bl?.blId,
          itemType: "LC",
          itemNo: bl.itemNo,
          consigneeName: bl?.consigneeName,
          consigneeId: bl?.consigneeId,
          entryPort: bl?.entryPort,
          Status: "True"
        };
        allCargos.push(Object.values(cargoDetail).join('\u001D').toUpperCase());
      }
    })


    const egmcont = allCargos.join('\n')

    let vesselName = this.vesselListData.find((i) => i?.vesselId === this.egmForm.value.vessel)?.vesselName
    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    let day = now.getDate();
    let hour = now.getHours();
    let minute = now.getMinutes();
    let second = now.getSeconds();
    let dateTimeString = year + month + day + hour + minute + second


    let finalFile = `${header}\n<manifest>\n<egm_master>\n${egmMaster}\n<emgcont>\n${egmcont}\n<END-egm_master>\n<END-manifest>\n${footer}`
    const blob = new Blob([finalFile], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'BL' + vesselName + '-' + this.egmForm.value.voyage + '-' + dateTimeString + '.egm');
  }

  saveButtonDisabled: boolean = false;
  isVoyageDatePassed(data: Date): boolean {
    const currentDate = new Date();
    return currentDate > new Date(data);
  }

  ngOnSave() {
    this.findInvalidControls()

      this.submitted = true;
      if (this.isVoyageDatePassed(this.egmForm.value.data)) {
        this.saveButtonDisabled = true;
        return;
      }
    if (this.egmForm.invalid) {
      return;
    }
    var polData = this.portListData.filter(
      (x) => x.portId == this.egmForm.value.pol
    );
    let totallines = 0;
    (this.blList ?? []).forEach((i) => {
      if (i.selected) {
        totallines += 1;
      }
    })
    let date = new Date();
    let header = `HREC\u001DZZ\u001DULS\u001DZZ\u001DINCCU1\u001D${environment.egmMsgversion}\u001D${this.egmForm.value.testorProduction}\u001D${environment.egmMsgType}\u001D63104\u001D${this.datePipe.transform(date, 'yyyyMMdd')}\u001D${this.datePipe.transform(date, 'HHmm', 'UTC')}`
    let footer = `TREC\u001D63104`;
    let port = this.portListData.find((i) => i.portId === this.egmForm.value.port);

    var allCargos = [];
    var egmMaster = []
    let now1 = new Date(this.egmForm.value.egmDate);
    let year1 = now1.getFullYear();
    let month1 = now1.getMonth() + 1;
    let day1 = now1.getDate();
    let hour1 = now1.getHours();
    let minute1 = now1.getMinutes();
    let second1 = now1.getSeconds();
    let dateTimeString1 = year1 + month1 + day1 + hour1 + minute1 + second1;

    this.blList?.forEach((bl) => {
      let cargoDetail = {
        msgType: 'F',
        cha: port?.portDetails?.[0]?.shortName,
        dtOfFile: dateTimeString1,
        imo: this.egmForm.value.imo,
        vesselcallSign: this.egmForm.value.vesselcallSign,
        voyageNo: this.egmForm.controls.voyage.value,
        blNo: bl.blNumber,
        blDate: bl.createdOn,
        pol: this.portListData.find((i) => i.portId === bl.polId)?.portDetails?.[0]?.shortName,
        pod: this.portListData.find((i) => i.portId === bl.entryPortId)?.portDetails?.[0]?.shortName,
        importer: bl.consigneeName,
        address1: bl.consigneeAddress?.slice(0, 35),
        address2: bl.consigneeAddress?.slice(35),
        natureOfCargo: bl.cargoNature,
        cargoMovement: bl.cargoType,
        noOfPackages: bl.no_of_packages,
        typeOfPackages: bl.packageType,
        grossWeight: bl.gross_wt,
        uom: bl.uom

      };
      egmMaster.push(Object.values(cargoDetail).join('\u001D').toUpperCase());
      if (bl.selected) {
        let cargoDetail = {
          msgType: 'F',
          cha: port?.portDetails?.[0]?.shortName,
          imo: this.egmForm.value.imo,
          vesselcallSign: this.egmForm.value.vesselcallSign,
          voyageNo: this.egmForm.controls.voyage.value,
          lineNo: bl.itemNo,
          sublineNo: 0,
          blNo: bl.blNumber,
          blDate: bl.createdOn,
          pol: this.portListData.find((i) => i.portId === bl.polId)?.portDetails?.[0]?.shortName,
          pod: this.portListData.find((i) => i.portId === bl.entryPortId)?.portDetails?.[0]?.shortName,
          importer: bl.consigneeName,
          address1: bl.consigneeAddress.slice(0, 35),
          address2: bl.consigneeAddress.slice(35),
          natureOfCargo: bl.cargoNature,
          cargoMovement: bl.cargoType,
          noOfPackages: bl.no_of_packages,
          typeOfPackages: bl.packageType,
          grossWeight: bl.gross_wt,
          uom: bl.uom,
          marksNo: bl.marksNo,
          goodsDescription: bl.additional,
          blId: bl?.blId,
          itemType: "LC",
          itemNo: bl.itemNo,
          consigneeName: bl?.consigneeName,
          consigneeId: bl?.consigneeId,
          entryPort: bl?.entryPort,
          Status: "True"
        };
        allCargos.push((cargoDetail));
      }
    })


    const egmcont = allCargos
    let data = currentTime(this.egmForm.value.voyageDate); 

    let finalFile = `${header}\n<manifest>\n<egm_master>\n${egmMaster}\n<emgcont>\n${egmcont}\n<END-egm_master>\n<END-manifest>\n${footer}`
    let vesselName = this.vesselListData.find((i) => i?.vesselId === this.egmForm.value.vessel)?.vesselName??'';
    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    let day = now.getDate();
    let hour = now.getHours();
    let minute = now.getMinutes();
    let second = now.getSeconds();
    let dateTimeString = year + month + day + hour + minute + second

    this.egmForm.value.egmName = 'BL' + vesselName + '-' + this.egmForm.value.voyage + '-' + dateTimeString + '.egm'
    const port_vessel_name={
      portName:this.portListData.find(port=>port?.portId===this.egmForm.value?.port)?.portDetails?.portName??'',
      vesselName:this.vesselListData.find(vessel=>vessel?.vesselId===this.egmForm.value?.vessel)?.vesselName??''
    }
    if (this.egmId) {
      this.commonService.UpdateToST('egm/' + this.egmId, { ...this.egmForm.value,...port_vessel_name,data,egmcont }).subscribe(data => {
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
      this.commonService.addToST('egm', { ...this.egmForm.value,...port_vessel_name,data,egmcont }).subscribe(data => {
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
    this.saveButtonDisabled = false;
  }


  voyagedetails: voyage;
  ngOnGetBLs(egm?) {
    // const vesselId=egm?.vesselId??this.egmForm.value.vessel
    let payload = this.commonService.filterList()
    payload.query = {
      // "voyageNumber": this.egmForm.value.voyage,
      "vesselId": this.egmForm.value.vessel
    }
    this.commonService.getSTList('voyage', payload).subscribe((result) => {
      this.voyagedetails = result.documents[0];
      // const chartId = this.vesselList?.find((x) => x?.vesselId === vesselId)?.chartId;
      const voyage = (this.voyagedetails?.voyage??[])?.find(x=> x.shipping_line === this.egmForm.value.shippinglineId)?.voyage_number;
      if (result && !this.egmId) {
        // this.egmForm.get('voyage').patchValue(voyage);
        this.egmForm.get('lastPort').patchValue(this.voyagedetails?.lastPortCall);
        this.egmForm.get('egm_no').patchValue(this.voyagedetails?.egmNo);
       if(this.voyagedetails?.port) this.egmForm.get('port').patchValue(this.voyagedetails?.port);
        this.egmForm.get('priorPort1').patchValue(this.voyagedetails?.priorPort1);
        this.egmForm.get('priorPort2').patchValue(this.voyagedetails?.priorPort2);
        this.egmForm.get('captain').patchValue(this.voyagedetails?.captainName);
        this.egmForm.get('egmDate').patchValue(this.voyagedetails?.egmDate);
        this.egmForm.get('voyageDate').patchValue(this.voyagedetails?.[0]?.data);
        this.egmForm.get('egmVesseltype').patchValue(this.voyagedetails?.egmVesselType);
        this.egmForm.get('briefCargoForegm').patchValue(this.voyagedetails?.briefCargoForegm);
        let port = this.portListData.find((i) => i?.portId === this.egmForm.value.port);
        this.egmForm.get('cha').patchValue(port?.portDetails?.[0]?.egmCode);
        // this.getShipingLineInfo(this.voyagedetails?.shippingLine);
        let payload1 = this.commonService.filterList()
    payload1.query = {
      "voyageNumber": this.egmForm.value.voyage,
      "vessel": this.egmForm.value.vessel
    }
    if(this.egmForm.value.port){
      payload1.query={... payload1.query, "polId": this.egmForm.value.port}
    }
    if(!this.egmForm.value.port || !this.egmForm.value.vessel)return;
    this._api
      .getSTList(Constant.BL_LIST, payload1)
      .subscribe((res: any) => {
        this.blList = res?.documents?.map((i, index) => {
          if (egm && Array.isArray(egm.egmcont)) { // Check if egm.egmcont exists and is an array
            i['selected'] = egm.egmcont.some(b => b?.blId === i?.blId);
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

    


  }

  shippinglineData: ShippingLine[] = [];
  getShipingLineInfo() {
    let payload = this.commonService.filterList()
    if(payload)payload.query = {
      ShipmentTypeName: 'Ocean'
    }
    this.commonService.getSTList('shippingline', payload)?.subscribe((data) => {
      this.shippinglineData = data?.documents;
    });
  }

  onShowDetails(blData) {
    this.isExpand = !this.isExpand;
    this.egmForm.controls.containerArray = this.formBuilder.array([]);
    let payload = this.commonService.filterList()
    payload.query = {
      blId: blData.blId,
    }
    this.commonService.getSTList('container', payload)
      .subscribe((res: any) => {
        res.hits.hits.forEach((container) => {
          (<FormArray>this.egmForm.get('containerArray')).push(
            this.formBuilder.group({
              isSelected: false,
              containerId: container.containerId,
              containerNumber: container.containerNumber,
              containerTypeName: container.containerTypeName,
              containerSizeName: container.containerSizeName,
              cargoType: container.cargoType,
              eSeal: container.sealNo,
              noOfPackages: container?.noOfPackages,
              netWeight: container?.netWeight,
              hsnCode: container.hsnCode,
              status: container?.containerStatus,
              lineNo: container?.lineNo,
              subLineNo: container?.subLineNo,
              agentCode: container?.agentCode,
              isoCode: container?.isoCode,
              imoCode: container?.imoCode,
              soc: container?.soc,
            })
          );
        });
      });
  }

  getdata() {
    let payload = this.commonService.filterList();
  
    if (payload?.query) {
      payload.query = {
        egmId: this.egmId
      };
    }
  
    this.commonService.getSTList('egm', payload)?.subscribe((data) => {
      let egm = data.documents?.[0];
  
      if (data.documents.length > 0) {
        this.egmForm.patchValue({
          job: egm?.job || '',
          shippinglineId: egm?.shippinglineId || '',
          port: egm?.port || '',
          vessel: egm?.vessel || '',
          voyage: egm?.voyage || '',
          egm_no: egm?.egm_no || '',
          egmDate: egm?.egmDate || '',
          voyageDate: egm?.data || '',
          lastPort: egm?.lastPort || '',
          cha: egm?.cha || '',
          light_dues: egm?.light_dues || '',
          toc: egm?.toc || '',
          vesselImo: egm?.vesselImo || '',
          vesselcallSign: egm?.vesselcallSign || '',
          custom_line_code: egm?.custom_line_code || '',
          custom_agent_code: egm?.custom_agent_code || '',
          egmVesseltype: egm?.egmVesseltype || '',
          priorPort1: egm?.priorPort1 || '',
          testorProduction: egm?.testorProduction || '',
          briefCargoForegm: egm?.briefCargoForegm || '',
          priorPort2: egm?.priorPort2 || '',
          captain: egm?.captain || '',
          totalLines: egm?.totalLines || '',
          sbc: egm?.sbc || false,
          ssd: egm?.ssd || false,
          cld: egm?.cld || false,
          pld: egm?.pld || false,
          ced: egm?.ced || false,
          md: egm?.md || false,
        });
        this.getVesselVoyageList();
        this.ngOnGetBLs(egm);
        if (this.isVoyageDatePassed(egm.data)) {
          this.egmForm.disable();
        } else {
          this.egmForm.enable();
        }
      }
  
    }, error => {
      this.notification.create(
        'error',
       error?.error?.error?.message,
        ''
      );
    });
  }
  
}

