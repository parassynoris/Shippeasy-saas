import * as Constant from 'src/app/shared/common-constants';
import { ApiService } from 'src/app/admin/principal/api.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, Input, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { BatchService } from 'src/app/services/Batch/batch.service';
import { environment } from 'src/environments/environment';
import { CommonService } from 'src/app/services/common/common.service';
import { addDays } from 'date-fns';
import { CognitoService } from 'src/app/services/cognito.service';
import { currentTime } from 'src/app/shared/util/date-time';
import { SharedEventService } from 'src/app/shared/services/shared-event.service';
@Component({
  selector: 'app-delivery-order',
  templateUrl: './delivery-order.component.html',
  styleUrls: ['./delivery-order.component.scss']
})
export class DeliveryOrderComponent implements OnInit {
  @Input() public msgData;
  @Input() public IsForList;
  @Input() public batchType;
  @ViewChild('closebutton') closebutton;
  innerContainerData: any;
  @Input() isForm: boolean = true;
  containerList: any = [];
  deliveryOrderList: any = [];
  baseBody: any;
  generateDeliveryOrder: FormGroup;
  submitted: boolean;
  result: any;
  deliveryData: any;
  isEditMode: boolean = false;
  isRequiredForSendEmail: boolean = false;
  EmailTo: any;
  userData: any;
  EmailConsignee: any = true;
  EmailCHA: any = true;
  EmailCFS: any = true;
  EmailSurveyor: any = true;
  EmailEmptyDepot: any = true;
  batchList: any = [];
  partyMaster: any = [];
  deleveryID: any = '';
  deleveryNo: any = '';
  yardList: any = [];
  DOType: any;
  BatchId: any;
  checkListData: any = checklist
  isExport: boolean = true;
  showChecklist: boolean = false;
  allyardList: any = [];
  settings = {
    singleSelection: false,
    idField: 'item_id',
    textField: 'item_text',
    enableCheckAll: false,
    allowSearchFilter: false,
    limitSelection: -1,
    clearSearchFilter: true,
    maxHeight: 200,
    itemsShowLimit: 3,
    closeDropDownOnSelection: false,
    showSelectedItemsAtTop: false,
    defaultOpen: false,

  };
  blIndex: any;
  blData: boolean = false;
  branchName: any = '';
  invoiceData: any = [];
  selectedBlIds: string[] = [];
  constructor(private formBuilder: FormBuilder,
    private sharedEventService: SharedEventService,
    private modalRef: NgbActiveModal,
    private router: Router,
    private batchService: BatchService,
    private commonService: CommonService,
    private _api: ApiService,
    private cognito: CognitoService,
    private notification: NzNotificationService,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal, private route: ActivatedRoute) {
    this.formBuilder = formBuilder;
    this.router = router;
    this.batchService = batchService;
    this.commonService = commonService;
    this._api = _api;
    this.cognito = cognito;
    this.notification = notification;
    this.modalService = modalService;
    this.route = route
    this.BatchId = this.route.snapshot.params['id'];
    this.isExport = localStorage.getItem('isExport') === 'true' ? true : false;
    this.isImport = localStorage.getItem('isImport') === 'true' ? true : false;
    // this.showChecklist = !this.isExport
  }
  isImport = false
  onPrintOpen() {
    this.isForm = false;
  }
  onPrintClose() {
    this.isForm = true;
  }


  ngOnInit(): void {
    this.getBatch(); 
    this.getDOtype();
    this.getIGMData();
    // this.getInvoiceList()
    // this.userData = this.commonfunction.getUserDetails();
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.userData = resp
      }
    })
    this.generateDeliveryOrder = this.formBuilder.group({
      deliveryOrderNo: [''],
      depoName: ['', Validators.required],
      deliveryDate: ['', Validators.required],
      validTill: ['', Validators.required],
      releaseType : [''],
      DOType : [''],
      emptyLocation : [''],
      extendedValidTill: [''],
      remarks: [''],
      clearingParty: [''],
      emptyreturn: [''],
      allDepoName: [[]],
      MBL : ['', Validators.required]
    });
    setTimeout(() => {
      if (this.IsForList) {
        this.getDeliveryOrderList();
      }
      else {
        this.getDeliveryOrderList()
      }
    }, 500);

  }


  igmList:any = [];
  getIGMData() {
    let payload = this.commonService.filterList();
      if (payload?.query) payload.query = {
        batchId: this.BatchId,
        type:'Addigm'
      }

    this.commonService.getSTList('igmcfs', payload)?.subscribe((res: any) => {
      // this.cfsForm = res.documents;

      if (res && res?.documents) {
        this.igmList = res.documents;
      }
    }, (err) => {
      console.log('Error while saving IGM');
    });
  }


  blList:any=[]
  mblList:any=[]
  mblDetails:any= {}
  blSelection:any=''
  getBl() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = { 
      '$or' : [
        {
          "batchId": this.BatchId
        },
        {
          "consolidatedJobs.batchId": this.BatchId
        }
      ]
    }

    this._api.getSTList("bl", payload)?.subscribe((data: any) => {
      this.mblList = data?.documents?.filter((x)=> (x?.blType?.toLowerCase() == 'mbl' || x?.blType?.toLowerCase() == 'awb'))
      this.mblDetails = data?.documents?.filter((x)=> (x?.blType?.toLowerCase() == 'mbl' || x?.blType?.toLowerCase() == 'awb'))[0]
      this.blList = data.documents?.filter((x)=> (x?.blType?.toLowerCase() == 'hbl' ||  x?.blType?.toLowerCase() == 'hawb')); 
      let containerList =  data.documents?.filter((x)=> (x?.blType?.toLowerCase() == 'hbl' ||  x?.blType?.toLowerCase() == 'hawb')); 
      console.log(this.deliveryData,"this.deliveryData");
      
      if (this.deliveryData) { 
        this.blSelection = this.deliveryData.hblDetails.blId;
        this.blList.forEach(element => { 
          if (this.deliveryData.hblDetails.blId === element.blId) {
            element.isSelected = element.blId;
          }
          else {
            element.isSelected = '';
          }
        });
      }  else { 
        this.deliveryOrderList.filter((x) => { 
            let index = containerList.findIndex(
              item => item?.blId === x?.hblDetails?.blId
            )
            containerList.splice(index, 1) 
        })

       
        this.blList = containerList 
      }
    })
  }
  democontainer = [{},{},{},{},{}]
  getInvoiceList() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {

      'batchId': this.BatchId,
      "$and": [
        {
          "principleBill": {
            "$ne": true,
          }
        }
      ]
    }

    this._api.getSTList("invoice", payload)?.subscribe((data: any) => {
      this.invoiceData = data.documents;
    })
  }
  applyValidTillToContainers() {
    const date = this.generateDeliveryOrder.get('validTill')?.value;
    if (!date) return;
  
    for (let bl of this.blList) {
      if (bl.containers && Array.isArray(bl.containers)) {
        for (let container of bl.containers) {
          // Only apply if container.validTill is not already set
          if (!container.validTill) {
            container.validTill = date;
          }
        }
      }
    }
  }
  getLocation() {

    let payload = this.commonService.filterList()
    payload.query = {
      status: true,
      masterType: {
        "$in": ['YARD', 'CFS','ICD']
      },
    }
    if (this.batchList?.enquiryData?.destPortId) {
      payload.query['portId'] = this.batchList?.enquiryData?.destPortId
    }
    this._api.getSTList("location", payload).subscribe((res: any) => {
      // if (this.isExport) {
      this.yardList = res?.documents;
      // } else {

      //   this.yardList = res?.documents?.filter((x)=> x?.agentBranchId === this.branchName);

      // }
      let yardContainer = [];
      res.documents?.forEach((element) => {
        if (element?.locationName) {
          yardContainer.push(element?.locationName);
        }
      });
      this.allyardList = yardContainer;


    });
  }
  onBlSelectionChange(container: any) {
    if (container.isSelected) {
      if (!this.selectedBlIds.includes(container.blId)) {
        this.selectedBlIds.push(container.blId);
      }
    } else {
      const index = this.selectedBlIds.indexOf(container.blId);
      if (index > -1) {
        this.selectedBlIds.splice(index, 1);
      }
    }
  }
  showTable(){
    // this.batchList?.enquiryDetails?.basicDetails?.loadType?.toLowerCase() === 'lcl' &&
    if( this.isImport){
      return true
    }else{
      return false
    }
   
  }

  getDOtype() {
    let payload = this.commonService.filterList()
    if (payload) payload.query = {
      typeCategory: 'DOType',
      status: true,
    }
    this.commonService.getSTList('systemtype', payload)?.subscribe((res: any) => {
      this.DOType = res?.documents?.filter(x => x.typeCategory === "DOType");
    });
  }

getBatch() {


    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      batchId: this.BatchId,
    }

  this._api.getSTList("batch", payload)
    ?.subscribe((data: any) => {
      this.batchList = data.documents[0]; 
      let chaId = this.batchList?.enquiryDetails?.basicDetails?.chaId;
      
      // Set depoName
      const locationId = this.batchList?.routeDetails?.icdCfsValueId || this.batchList?.enquiryDetails?.routeDetails?.location;
      this.generateDeliveryOrder.get('depoName')?.setValue(locationId || '');

      // Create array of party IDs to fetch
      const partyIds = [];
      if (chaId) {
        partyIds.push(chaId);
      }
      if (this.batchList?.consigneeId) {
        partyIds.push(this.batchList.consigneeId);
      }

      if (partyIds.length > 0) {
        let partyBody = this.commonService.filterList();
        partyBody.query = {
          "partymasterId": { $in: partyIds }
        };

        this._api.getSTList("partymaster", partyBody).subscribe((res: any) => {
          if (res?.documents && res.documents.length > 0) {
            this.partyMaster = res.documents.filter((doc: any) => doc.partymasterId === this.batchList.consigneeId);

            if (chaId) {
              const chaDetails = res.documents.find((doc: any) => doc.partymasterId === chaId);
              if (chaDetails) {
                const chaAddress = chaDetails?.addressInfo?.address || '';
                const chaPartyName = chaDetails?.name || '';
                
                // Set clearing party with name on first line and address on second line
                const clearingPartyValue = `${chaPartyName}\n${chaAddress}`.trim();
                this.generateDeliveryOrder.get('clearingParty')?.setValue(clearingPartyValue);
              }
            } 
          }
        });
      } 
    });
}
  getBranch(id, api) {

    if (!id) { return false }
    let baseBody = this.commonService.filterList()

    if (api === 'port') {
      baseBody.query = {
        "portId": id
      }
    }
    if (api === 'location') {
      baseBody.query = {
        "locationId": id
      }
    }


    this._api.getSTList(`${api}`, baseBody).subscribe((res: any) => {
      if (api === 'port') {
        this.branchName = res?.documents[0]?.portDetails?.agentBranchId || ''

      }
      if (api === 'location') { this.branchName = res?.documents[0]?.agentBranchId || '' }
      this.getLocation()
    })
  }
  getDeliveryOrderList() {

    let baseBody = this.commonService.filterList()
    if (baseBody?.query) baseBody.query = {
      batchId: this.BatchId,
    }
    this._api.getSTList(Constant.MASTER_DELIVERY_ORDER_LIST, baseBody)?.subscribe((res: any) => {
      this.deliveryOrderList = res?.documents;
      
      this.getContainerList();
      this.getBl();
      // if(this.isExport)
      this.getLocation()
    });
  }

  setValidityDate(contr) {
    // if (this.isExport) {
    let count = this.batchList?.routeDetails?.pol_detentionfee || 1
    let date = contr[0]?.sobDate
    if (!date)
      return
    let validDate = new Date(addDays(new Date(date), count)).toISOString().substring(0, 10)
    // this.generateDeliveryOrder.controls.validTill.setValue(validDate)
    // } else {
    //   let count = this.batchList?.routeDetails?.pod_detentionfee || 0
    //   let date = contr[0]?.dischargeDate
    //   if(!date)
    //   return
    //   let validDate = new Date(addDays(new Date(date), count)).toISOString().substring(0, 10)
    //   this.generateDeliveryOrder.controls.validTill.setValue(validDate)
    // }
  }

  getContainerList() {
    if (!this.BatchId)
      return false
    this.containerList = [];

    let baseBody = this.commonService.filterList()
    baseBody.query = { 
      // $or:[{ "batchId": this.BatchId},{ "batchwiseGrouping.batchId": this.BatchId}]
      $or: [{
        "batchId": {
          "$in": [this.BatchId]
        }
      }, {
        "batchwiseGrouping.batchId": {
          "$in": [this.BatchId]
        }
      }]
    }
    this._api.getSTList(Constant.CONTAINER_LIST, baseBody).subscribe((res: any) => {
      let containerList = res?.documents;
      this.setValidityDate(containerList)
      if( this.showTable() ){
        this.containerList = res?.documents;
      }else{

     
      if (this.deliveryData) {
        this.containerList = res?.documents;

        this.containerList.forEach(element => {

          if (this.deliveryData.containerNos.findIndex(o => o.valueOf() === element.containerNumber) > -1) {
            element.isSelected = true;
          }
          else {
            element.isSelected = false;
          }
        });
      } else {
        this.deliveryOrderList.filter((x) => {
          x?.containerNos?.filter((e) => {
            let index = containerList.findIndex(
              item => item?.containerNumber === e
            )
            containerList.splice(index, 1)
          })
        })
        this.containerList = containerList
      }
    }
    });
  }
  get f() { return this.generateDeliveryOrder.controls; }

  clearDate() {
    this.generateDeliveryOrder.patchValue({
      validTill: '',
      extendedValidTill: ''
    })
  }
  checkEmail() {
    this.isRequiredForSendEmail = false
    if (!this.EmailTo) {
      return false
    }
    var validRegex = environment.validate.email
    var email = this.EmailTo?.replace(/\s/g, '');
    var emailList = email.split(';');
    emailList.forEach((e) => {
      if (e.match(validRegex)) {
        return true;
      } else {
        this.isRequiredForSendEmail = true
        return false;
      }
    });
  }
  onSave() {
    var url = Constant.MASTER_ADD_DELIVERY_ORDER;
    this.submitted = true;
    
    if (this.generateDeliveryOrder.value?.extendedValidTill) {
      if (new Date(this.generateDeliveryOrder.value?.validTill) > new Date(this.generateDeliveryOrder.value?.extendedValidTill)) {
        this.notification.create('error', 'Extended valid till should not be greater than valid till date', '');
        return;
      }
    }
    
    if (this.generateDeliveryOrder.invalid) {
      this.generateDeliveryOrder.markAllAsTouched();
      return;
    }
  
    let selectedBLs;
    let selectedContainers = [];
    
    if (this.showTable()) {
      // For LCL Import - get selected BLs
      selectedBLs = this.blList?.filter((x) => x.isSelected);
      
      if (!selectedBLs || selectedBLs.length === 0) {
        this.notification.create('error', 'Please select at least one BL', '');
        return false;
      }
      
      // Collect all containers from selected BLs
      selectedBLs.forEach(bl => {
        if (bl.containers && bl.containers.length > 0) {
          selectedContainers.push(...bl.containers);
        }
      });
    } else {
      // For FCL - get selected containers
      selectedContainers = this.containerList.filter(x => x.isSelected);
      
      if (!selectedContainers || selectedContainers.length === 0) {
        this.notification.create('error', 'Please select at least one container', '');
        return false;
      }
    }
  
    // Process each selected BL (for LCL) or create single DO (for FCL)
    if (this.showTable()) {
      // LCL Import - Create DO for each selected BL
      let processedCount = 0;
      const totalBLs = selectedBLs.length;
      
      selectedBLs.forEach((hblDetail, index) => {
        let containersForThisBL = hblDetail.containers?.map((container) => ({
          ...container,
          validTill: container.validTill || this.generateDeliveryOrder.value.validTill,
          isDetentionTaken: container.isDetentionTaken || false,
          detentionTakenDate: container.isDetentionTaken
            ? container.detentionTakenDate || new Date()
            : null
        })) || [];
  
        let newDeliveryOrder = {
          "tenantId": this.userData.tenantId,
          allDepoName: this.generateDeliveryOrder.value.allDepoName,
          deliveryorderId: this.deleveryID ? this.deleveryID : "",
          batchId: this.BatchId,
          depoId: this.generateDeliveryOrder.value.depoName,
          depoName: this.yardList?.filter((x) => x?.locationId === this.generateDeliveryOrder.value.depoName)[0]?.locationName,
          deliveryOrderNo: this.deleveryNo ? this.deleveryNo : '',
          deliveryDate: this.generateDeliveryOrder.value.deliveryDate,
          validTill: currentTime(this.generateDeliveryOrder.value.validTill).toISOString().substring(0, 10),
          releaseType: this.generateDeliveryOrder.value.releaseType,
          DOType: this.generateDeliveryOrder.value.DOType,
          emptyLocation: this.generateDeliveryOrder.value.emptyLocation,
          extendedValidTill: currentTime(this.generateDeliveryOrder.value.extendedValidTill),
          remarks: this.generateDeliveryOrder.value.remarks,
          clearingParty: this.generateDeliveryOrder.value.clearingParty,
          emptyreturn: this.generateDeliveryOrder.value.emptyreturn,
          containerNos: containersForThisBL.map(c => c.containerNumber),
          containers: containersForThisBL,
          hblDetails: hblDetail,
          mblDetails: this.mblList?.find((x) => x.blId == this.generateDeliveryOrder.value.MBL) || {},
          igmNo: this.igmList?.[0]?.igmNo,
          igmDate: this.igmList?.[0]?.igmDate,
        };
  
        // Validation
        const hblNumber = newDeliveryOrder.hblDetails?.blNumber;
        const hblDate = newDeliveryOrder?.hblDetails?.blDate;
        const hblConsignee = newDeliveryOrder?.hblDetails?.consigneeName;
        const ConsigneeAdd = newDeliveryOrder?.hblDetails.consigneeAddress;
        const NotifyParty = newDeliveryOrder?.hblDetails.notify_party1Name;
        const NotifyAddress = newDeliveryOrder?.hblDetails.address1;
        const vesselName = newDeliveryOrder?.hblDetails.vesselName;
        const voyageNo = newDeliveryOrder?.hblDetails.vesselName;
        const polName = newDeliveryOrder?.hblDetails.polName;
        const ETD = this.batchList.routeDetails.etd;
        const importType = this.batchList?.enquiryDetails?.basicDetails?.importShipmentTypeName?.toLowerCase();
        const entryPort = newDeliveryOrder?.hblDetails?.entryPort;
        const finalATA = this.batchList?.routeDetails?.final_ATA;
        const ata = this.batchList?.routeDetails?.ata;
        const isPortToICD = importType === 'port to icd' || importType === 'icd to port';
        const isAnyDateValid = isPortToICD
          ? !!finalATA && finalATA.trim() !== ''
          : !!ata && ata.trim() !== '';
        const isEntryOrDateValid = !!entryPort || isAnyDateValid;
        const igmNo = this.igmList?.[0]?.igmNo;
        const igmDate = newDeliveryOrder?.igmDate;
        const isIgmValid = !!igmNo || (!!igmDate && igmDate.trim() !== '');
        const lineNo = this.batchList?.lineNo;
        const locationName = this.batchList?.enquiryDetails?.routeDetails?.locationName;
        const validTill = newDeliveryOrder?.validTill;
        const goodsDescription = newDeliveryOrder?.hblDetails?.goodsDescription;
        const clearingParty = newDeliveryOrder?.clearingParty;
        const emptyLocation = newDeliveryOrder?.emptyLocation;
  
        const requiredFields = {
          'MBL No.': this.batchList.mblNumber,
          'HBL No.': hblNumber,
          'BL Date': hblDate,
          'Depo Name': newDeliveryOrder.depoName,
          'Consignee Name': hblConsignee,
          'Notify Party': ConsigneeAdd || NotifyParty ? true : null,
          'Notify Party Address': NotifyAddress,
          'Vessel Name or Voyage No': vesselName || voyageNo ? true : null,
          'Port of Loading / ETD': polName || ETD ? true : null,
          'Port of Discharge / ATA': isEntryOrDateValid ? true : null,
          'IGM No / IGM Date': isIgmValid ? true : null,
          'Line No.': lineNo,
          'Delivery Date': newDeliveryOrder.deliveryDate,
          'Location Name': locationName,
          'Valid Till': validTill,
          'Port of Loading': polName,
          'Goods Description': goodsDescription,
          'Clearing Party': clearingParty,
          'Empty Location': emptyLocation || "",
        };
  
        const missingFields = Object.entries(requiredFields)
          .filter(([_, value]) => value === null || value === '' || (Array.isArray(value) && value.length === 0))
          .map(([key]) => key);
  
        if (missingFields.length > 0) {
          const message = '<ul>' + missingFields.map(field => `<li>${field}</li>`).join('') + '</ul>';
          this.notification.create('error', `Please fill the following required fields for BL ${hblNumber}:`, message);
          return;
        }
  
        // Save the delivery order
        if (this.deleveryID !== '') {
          url = Constant.MASTER_ADD_DELIVERY_ORDER + '/' + this.deleveryID;
          this.commonService.UpdateToST(url, newDeliveryOrder).subscribe((res: any) => {
            if (res) {
              processedCount++;
              if (processedCount === 1) {
                // Store first result for display
                this.result = res;
                this.deleveryID = res?.deliveryorderId;
                this.deleveryNo = res?.deliveryOrderNo;
              }
              
              if (processedCount === totalBLs) {
                // All DOs processed
                this.notification.create('success', `${totalBLs} Delivery Order(s) Generated Successfully`, '');
                this.sharedEventService.emitChargeSaved();
                this.showChecklist = false;
                this.isForm = false;
                this.innerContainerData = selectedContainers;
                this.innerBlData = selectedBLs;
              }
            }
          }, error => {
            this.notification.create('error', error?.error?.error?.message || 'Error generating delivery order', '');
            if (index === 0) {
              this.modalService.dismissAll();
            }
          });
        } else {
          this.commonService.addToST(url, newDeliveryOrder).subscribe((res: any) => {
            if (res) {
              processedCount++;
              if (processedCount === 1) {
                // Store first result for display
                this.result = res;
                this.deleveryID = res?.deliveryorderId;
                this.deleveryNo = res?.deliveryOrderNo;
              }
              
              if (processedCount === totalBLs) {
                // All DOs processed
                this.notification.create('success', `${totalBLs} Delivery Order(s) Generated Successfully`, '');
                this.sharedEventService.emitChargeSaved();
                this.showChecklist = false;
                this.isForm = false;
                this.innerContainerData = selectedContainers;
                this.innerBlData = selectedBLs;
              }
            }
          }, error => {
            this.notification.create('error', error?.error?.error?.message || 'Error generating delivery order', '');
            if (index === 0) {
              this.modalService.dismissAll();
            }
          });
        }
      });
    } else {
      // FCL - Create single DO for selected containers
      let newDeliveryOrder = {
        "tenantId": this.userData.tenantId,
        allDepoName: this.generateDeliveryOrder.value.allDepoName,
        deliveryorderId: this.deleveryID ? this.deleveryID : "",
        batchId: this.BatchId,
        depoId: this.generateDeliveryOrder.value.depoName,
        depoName: this.yardList?.filter((x) => x?.locationId === this.generateDeliveryOrder.value.depoName)[0]?.locationName,
        deliveryOrderNo: this.deleveryNo ? this.deleveryNo : '',
        deliveryDate: this.generateDeliveryOrder.value.deliveryDate,
        validTill: currentTime(this.generateDeliveryOrder.value.validTill).toISOString().substring(0, 10),
        releaseType: this.generateDeliveryOrder.value.releaseType,
        DOType: this.generateDeliveryOrder.value.DOType,
        emptyLocation: this.generateDeliveryOrder.value.emptyLocation,
        extendedValidTill: currentTime(this.generateDeliveryOrder.value.extendedValidTill),
        remarks: this.generateDeliveryOrder.value.remarks,
        clearingParty: this.generateDeliveryOrder.value.clearingParty,
        emptyreturn: this.generateDeliveryOrder.value.emptyreturn,
        containerNos: selectedContainers.map(c => c.containerNumber),
        containers: selectedContainers,
        hblDetails: {},
        mblDetails: this.mblList?.find((x) => x.blId == this.generateDeliveryOrder.value.MBL) || {},
        igmNo: this.igmList?.[0]?.igmNo,
        igmDate: this.igmList?.[0]?.igmDate,
      };
  
      // Validation for FCL
      const requiredFields = {
        'MBL No.': this.batchList.mblNumber,
        'Depo Name': newDeliveryOrder.depoName,
        'Delivery Date': newDeliveryOrder.deliveryDate,
        'Valid Till': newDeliveryOrder.validTill,
        'Clearing Party': newDeliveryOrder.clearingParty,
        'Empty Location': newDeliveryOrder.emptyLocation || "",
      };
  
      const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => value === null || value === '' || (Array.isArray(value) && value.length === 0))
        .map(([key]) => key);
  
      if (missingFields.length > 0) {
        const message = '<ul>' + missingFields.map(field => `<li>${field}</li>`).join('') + '</ul>';
        this.notification.create('error', 'Please fill the following required fields:', message);
        return;
      }
  
      if (this.deleveryID !== '') {
        url = Constant.MASTER_ADD_DELIVERY_ORDER + '/' + this.deleveryID;
        this.commonService.UpdateToST(url, newDeliveryOrder).subscribe((res: any) => {
          if (res) {
            this.notification.create('success', 'Delivery Order Generated Successfully', '');
            this.sharedEventService.emitChargeSaved();
            this.showChecklist = false;
            this.result = res;
            this.isForm = false;
            this.deleveryID = res?.deliveryorderId;
            this.deleveryNo = res?.deliveryOrderNo;
            this.innerContainerData = selectedContainers;
            this.innerBlData = [];
          }
        }, error => {
          this.notification.create('error', error?.error?.error?.message || 'Error generating delivery order', '');
          this.modalService.dismissAll();
        });
      } else {
        this.commonService.addToST(url, newDeliveryOrder).subscribe((res: any) => {
          if (res) {
            this.notification.create('success', 'Delivery Order Generated Successfully', '');
            this.sharedEventService.emitChargeSaved();
            this.showChecklist = false;
            this.result = res;
            this.isForm = false;
            this.deleveryID = res?.deliveryorderId;
            this.deleveryNo = res?.deliveryOrderNo;
            this.innerContainerData = selectedContainers;
            this.innerBlData = [];
          }
        }, error => {
          this.notification.create('error', error?.error?.error?.message || 'Error generating delivery order', '');
          this.modalService.dismissAll();
        });
      }
    }
  }

  handleSaveSuccess(res: any, isLast: boolean) {
    if (res) {
      if (isLast) {
        this.notification.create('success', 'Delivery Order(s) Generated', '');
        this.sharedEventService.emitChargeSaved();
      }
      this.showChecklist = false;
      this.result = res;
      this.isForm = false;
      this.deleveryID = res?.deliveryorderId;
      this.deleveryNo = res?.deliveryOrderNo;
      this.innerContainerData = this.containerList.filter(x => this.showTable() ? true : x.isSelected);
      this.innerBlData = this.blList.filter(x => x.isSelected);
    }
  }
  innerBlData :any = []
  closePopup() {
    this.submitted = false;
    this.generateDeliveryOrder.reset();
     this.modalRef.close('success');
    // this.modalService.dismissAll();
   
  }
  // editDeliveryOrder(deliveryData) {
  //   this.deliveryData = deliveryData;
  //   this.deleveryID = deliveryData?.deliveryorderId;
  //   this.deleveryNo = deliveryData?.deliveryOrderNo;

  //   if (this.deliveryData?.containers?.length) {
  //     this.containerList = this.deliveryData.containers.map(c => ({
  //       ...c,
  //       validTill: c.validTill ? new Date(c.validTill) : new Date(this.deliveryData.validTill)
  //     }));
  //   }
 
  //   this.generateDeliveryOrder.patchValue({
  //     allDepoName: this.deliveryData?.allDepoName,
  //     depoName: this.deliveryData?.depoId || '',
  //     deliveryOrderNo: this.deliveryData?.deliveryOrderNo,
  //     releaseType : this.deliveryData?.releaseType,
  //     DOType : this.deliveryData?.DOType,
  //     emptyLocation : this.deliveryData?.emptyLocation,
  //     deliveryDate: this.deliveryData?.deliveryDate ? this.deliveryData?.deliveryDate  : new Date(),
  //     validTill:  this.deliveryData?.validTill ? this.deliveryData?.validTill+"T05:00:00.000Z" : new Date(),
  //     extendedValidTill: this.deliveryData?.extendedValidTill?  this.deliveryData?.extendedValidTill +"T05:00:00.000Z": new Date(),
  //     remarks: this.deliveryData?.remarks,
  //     clearingParty: this.deliveryData?.clearingParty,
  //     emptyreturn: this.deliveryData?.emptyreturn,
  //     MBL : this.deliveryData?.mblDetails?.blId
  //   })
    
  //   this.EmailTo = this.deliveryData?.emailTo ? this.deliveryData?.emailTo : ''
  //   this.getContainerList();
  //   this.getBl();
  //   this.getBlAndPatchContainerDates();
  //   this.isEditMode = true;
  //   this.IsForList = false;
  // }
  editDeliveryOrder(deliveryData) {
    this.deliveryData = deliveryData;
    this.deleveryID = deliveryData?.deliveryorderId;
    this.deleveryNo = deliveryData?.deliveryOrderNo;
  
    this.generateDeliveryOrder.patchValue({
      allDepoName: this.deliveryData?.allDepoName,
      depoName: this.deliveryData?.depoId || '',
      deliveryOrderNo: this.deliveryData?.deliveryOrderNo,
      releaseType: this.deliveryData?.releaseType,
      DOType: this.deliveryData?.DOType,
      emptyLocation: this.deliveryData?.emptyLocation,
      deliveryDate: this.deliveryData?.deliveryDate || new Date(),
      validTill: this.deliveryData?.validTill ? this.deliveryData?.validTill + "T05:00:00.000Z" : new Date(),
      extendedValidTill: this.deliveryData?.extendedValidTill ? this.deliveryData?.extendedValidTill + "T05:00:00.000Z" : new Date(),
      remarks: this.deliveryData?.remarks,
      clearingParty: this.deliveryData?.clearingParty,
      emptyreturn: this.deliveryData?.emptyreturn,
      MBL: this.deliveryData?.mblDetails?.blId
    });
  
    this.EmailTo = this.deliveryData?.emailTo || '';
    this.selectedBlIds = [this.deliveryData.hblDetails.blId];
  
    this.getBl();
  
    setTimeout(() => {
      const deliveryContainerMap = new Map();
      (this.deliveryData?.containers || []).forEach(c => {
        deliveryContainerMap.set(c.containerNumber, {
          ...c,
          validTill: c.validTill ? new Date(c.validTill) : new Date(this.deliveryData.validTill),
          isDetentionTaken: c.isDetentionTaken || false,
          detentionTakenDate: c.detentionTakenDate ? new Date(c.detentionTakenDate) : null
        });
      });
  
      this.blList?.forEach(bl => {
        bl.containers?.forEach(container => {
          const match = deliveryContainerMap.get(container.containerNumber);
          if (match) {
            container.validTill = match.validTill;
            container.isDetentionTaken = match.isDetentionTaken;
            if (match.isDetentionTaken) {
              container.detentionTakenDate = match.detentionTakenDate || new Date();
            } else {
              container.detentionTakenDate = null;
            }
          }
        });
      });
    }, 500);
  
    this.isEditMode = true;
    this.IsForList = false;
  }
  


  

  DeleteDeliveryOrder(deletecontainer, container) {
    this.modalService
      .open(deletecontainer, {
        backdrop: 'static',
        keyboard: false,
        centered: true,
        size: '',

        ariaLabelledBy: 'modal-basic-title',
      })
      .result.then(
        (result) => {
          if (result === 'yes') {
            let deleteBody = Constant.MASTER_DELETE_DELIVERY_ORDER + '/' + container
            this.commonService.deleteST(deleteBody)
              .subscribe((data) => {
                if (data) {
                  this.notification.create(
                    'success',
                    'Deleted Successfully',
                    ''
                  );
                  this.closePopup();
                }
              });
          }
        },

      );
  }

  Documentpdf: any;
  DOLetterUrl: any;
  basecontentUrl: any;


  getDOReport(id, isDownload?) {
    let reportpayload;
    let url;
    if (this.showTable()) {
      reportpayload = { "parameters": { "deliveryorderId": id } };
      url = 'HouseDeliveryOrder'
    }
    else {
      reportpayload = { "parameters": { "deliveryorderId": id } };
      url = 'HouseDeliveryOrder'
    }
    this.commonService.pushreports(reportpayload, url).subscribe({
      next: (res: any) => {
        if (isDownload) {
          const blob = new Blob([res], { type: 'application/pdf' });
          let temp = URL.createObjectURL(blob);
          this.Documentpdf = temp;
          var a = document.createElement('a');
          a.href = this.Documentpdf;
          a.download = `${this.batchList.batchNo}-HOUSE DO` + ".pdf";
          document.body.appendChild(a);
          a.click();
        } else {
          const blob = new Blob([res], { type: 'application/pdf' });
          let temp = URL.createObjectURL(blob);
          this.Documentpdf = temp;
          const pdfWindow = window.open(temp);
          // pdfWindow.print();
        }
      }
    })
    if (false) {
      let reportpayload1 = { "parameters": { "batchId": this.BatchId, "doID": id } }
      this.commonService.pushreports(reportpayload1, 'NOC').subscribe({
        next: (res: any) => {
          const blob = new Blob([res], { type: 'application/pdf' });
          let temp = URL.createObjectURL(blob);
          this.Documentpdf = temp;
          var a = document.createElement('a');
          a.href = this.Documentpdf;
          a.download = "NOC.pdf";
          document.body.appendChild(a);
          a.click();
        }
      })
    }
  }

  shareViaWhatsapp(id, isDownload?, isShareViaWhatsApp?) {
    let reportpayload;
    let url;
    const doDetails = this.deliveryOrderList?.find((i) => i?.deliveryorderId === id) || [];

    if (this.showTable()) {
        reportpayload = { parameters: { deliveryorderId: id } };
        url = 'HouseDeliveryOrder';
    } else {
        reportpayload = { parameters: { deliveryorderId: id } };
        url = 'deliveryOrder';
    }

    this.commonService.pushreportsWhatsapp(reportpayload, url).subscribe({
        next: (res: any) => {
            if (isShareViaWhatsApp) {
                // Construct the message as a raw string with newlines
                const rawMessage = `✅ Delivery Order ✅\n\n
Dear Valued Customer,\n
Please find attached house delivery order for the shipment with the below-mentioned details herewith.\n
Kindly do the needful and confirm safe receipt of the same.\n\n
Job #: ${this.batchList?.batchNo || '-'}\n
HBL #: ${doDetails?.hblDetails?.blNumber || '-'}\n
Delivery To #: ${doDetails?.depoName || '-'}\n
Delivery Date #: ${doDetails?.deliveryDate || '-'}\n
Valid Till #: ${doDetails?.validTill || '-'}\n
Carrier: ${this.batchList?.enquiryDetails?.routeDetails?.shippingLineName || '-'}\n
PoL: ${this.batchList?.enquiryDetails?.routeDetails?.loadPortName || '-'}\n
ETD: ${this.formatDate(this.batchList?.enquiryDetails?.routeDetails?.etd) || '-'}\n
PoD: ${this.batchList?.enquiryDetails?.routeDetails?.destPortName || '-'}\n
ETA: ${this.formatDate(this.batchList?.enquiryDetails?.routeDetails?.eta) || '-'}\n
Containers: ${doDetails?.containerNos?.join(', ') || '-'}\n
Link to Download: ${res?.downloadUrl || '-'}\n\n
Thank you`;

                // Encode the message for use in a URL
                const encodedMessage = encodeURIComponent(rawMessage);

                // Determine platform and construct the WhatsApp URL
                const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                const whatsappUrl = isMobile
                    ? `https://wa.me/?text=${encodedMessage}`
                    : `https://web.whatsapp.com/send?text=${encodedMessage}`;

                window.open(whatsappUrl, '_blank');
            } else {
                const pdfWindow = window.open(res?.downloadUrl);
            }
        },
        error: (err) => {
            console.error('Error sharing the document:', err);
            alert('Unable to share the document via WhatsApp.');
        },
    });
}


  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }
  
  
  downloadreport(type) {
    let reportpayload1 = { "parameters": { "batchId": this.BatchId, "doID": this.deleveryID } }
    this.commonService.pushreports(reportpayload1, type).subscribe({
      next: (res: any) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        let temp = URL.createObjectURL(blob);
        this.Documentpdf = temp;
        var a = document.createElement('a');
        a.href = this.Documentpdf;
        a.download = type + ".pdf";
        document.body.appendChild(a);
        a.click();
      }
    })
  }
  blobContent(id) {
    let reportpayload;
    let url;
    if (this.isExport) {
      reportpayload = { "parameters": { "deliveryorderId": id } };
      url = 'HouseDeliveryOrder'
    }
    else {
      reportpayload = { "parameters": { "deliveryorderId": id } };
      url = 'HouseDeliveryOrder'
    }
    this.commonService.pushreports(reportpayload, url).subscribe({
      next: (res: any) => {

        const blob = new Blob([res], { type: 'application/pdf' });
        const reader = new FileReader();

        reader.onload = () => {
          const base64String = reader.result as string;
          let baseContent = base64String.split(",");
          this.basecontentUrl = baseContent[1];
          this.emailSend(this.basecontentUrl)
        };
        reader.readAsDataURL(blob)
      }
    })
  }


  emailSend(bloburl) {

    let fileName = 'DO.pdf'
    let attachment = [{ "content": bloburl, "name": fileName }]

    var emails = [];
    if (this.batchType !== 'import') {
      if (!this.EmailTo) { return false; }
    } else {
      emails.push({ email: this.partyMaster[0]?.primaryMailId });
    }
    let newDeliveryOrder = {
      // ...this.deliveryData,
      emailTo: this.EmailTo,
    };
    this._api.UpdateToST(`${Constant.MASTER_UPDATE_DELIVERY_ORDER}/${this.deleveryID}`, newDeliveryOrder).subscribe();

    var tdData = [];

    this.innerContainerData?.forEach(elements => {
      tdData.push(elements?.containerNumber?.toString())
    });
    var emailData = `Dear customer <br><br>

    Your delivery order no. ${this.result?.deliveryOrderNo}, Do Type:  ${this.result?.DOType},
    emptyreturn:  ${this.result?.emptyreturn}, delivery date: ${new Date(this.result?.deliveryDate).toISOString().substring(0, 10)}, valid till: ${new Date(this.result?.validTill).toISOString().substring(0, 10)} <br>
    ${this.result?.extendedValidTill ? `extended valid till: ${new Date(this.result.extendedValidTill).toISOString().substring(0, 10)}<br>` : ''}
    Job No: ${this.result.containers[0]?.batchNo}, Clearing Party:  ${this.result?.clearingParty}
    has been successfully generated for container ${tdData?.toString()}.<br><br>
    Remark:  ${this.result?.remarks},<br><br>
    
    
    Best wishes,<br>
    Team SHIPEASY`

    if (this.batchType !== 'import') {
      var email = this.EmailTo?.replace(/\s/g, '');
      var emailList = email.split(';');
      emailList.forEach((e) => {
        emails.push({ email: e });
      });
    }

    let payload = {
      sender: {
        name: this.userData?.userData?.name + ' ' + this.userData?.userData?.userLastname,
        email: this.userData?.userData?.userEmail
      },
      to: emails,
      "attachment": attachment,
      batchId: this.BatchId,
      textContent: `${emailData}`,
      subject: "Delivery Order"
    }
    this.batchService.sendEmail(payload).subscribe(
      (res) => {
        if (res) {
          this.modalService.dismissAll();
          this.notification.create('success', 'Email Sent Successfully', '');
        }
        else {
          this.notification.create('error', 'Email not Send', '');
        }
      }
    );

  }
  gotoInvoice(data) {
    this.modalService.dismissAll();
    this.router.navigate(['/batch/list/add/' + this.BatchId + '/invoice/' + data?.invoiceId + '/edit'])
  }
}
export const checklist = [
  { name: "AGENT Filing or Carrier Filing of IGM FILING OR CARRIER FILING OF IGM", checkbox: true },
  { name: "MBL Original or Seaway B/L", checkbox: true },
  { name: "HBL Original or Seaway B/L", checkbox: true },
  { name: "Freight Collect or Prepaid", checkbox: true },
  { name: "THC Collect or Prepaid", checkbox: true },
  { name: "Import Tank Container Factory Bond Format for (1 Year)", checkbox: true },
  { name: "Security Cheque deposit", checkbox: true },
  { name: "Ground Rent Applicable Yes / No.", checkbox: false, isSelected: true },
  { name: "Detention Applicable or With in Free Days", checkbox: true },
  { name: "Payment Details received from Customer Yes /No.", checkbox: false, isSelected: true },
  { name: "OPS Receipt Generated Yes / No.", checkbox: false, isSelected: true },

]