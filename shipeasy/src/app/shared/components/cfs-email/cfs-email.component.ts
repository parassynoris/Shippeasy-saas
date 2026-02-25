import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { LoaderService } from 'src/app/services/loader.service';
import { CommonService } from 'src/app/services/common/common.service';
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { MatChipInputEvent } from '@angular/material/chips';
import { MatTableDataSource } from '@angular/material/table';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
import { content } from 'html2canvas/dist/types/css/property-descriptors/content';
import { Currency, partymasterDetail } from 'src/app/admin/party-master/add-party/partyMaster-detail';
import { CommonFunctions } from '../../functions/common.function';
import { AddPartyComponent } from 'src/app/admin/party-master/add-party/add-party.component';
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';
import { MatDrawer } from '@angular/material/sidenav';
import { ApiService } from 'src/app/admin/principal/api.service';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import * as Constant from 'src/app/shared/common-constants';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

export interface FruitTO {
  to: string;
}

export interface FruitCC {
  cc: string;
}

interface EmailRecipient {
  address: string;
}

@Component({
  selector: 'app-cfs-email',
  templateUrl: './cfs-email.component.html',
  styleUrls: ['./cfs-email.component.scss']
})
export class CfsEmailComponent implements OnInit {
  _gc = GlobalConstants;
  isLoading: boolean = true;
  isEmailSelected: boolean = false;
  isToggleOn: boolean = false;
  dataSource = new MatTableDataSource<any>();
  isOdexSelected: boolean = false
  cfsForm: FormGroup;
  igmForm: FormGroup;
  nocForm: FormGroup;
  @ViewChild("chipListTO") chipListTO;
  @ViewChild("chipListCC") chipListCC;
  newMembersTO: FruitTO[] = [];
  newMembersCC: FruitCC[] = [];
  pageSize = 10;
  from = 0;
  sort1: any
  sAddMode: any;
  pageNumber = 1;
  subject = true;
  Uploaddocument = true;
  addOnBlurTO = true;
  addOnBlurCC = true;
  removable: boolean = true;
  displayedColumns: string[] = ['id', 'documentName', 'movementType', 'sendingMethod', 'updatedOn', 'updatedBy'];
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  regularExpression =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  @Input() batchId;
  public Editor = ClassicEditor;
  defaultMessage = "<b>Please file IGM as per HBL</b><br> CFS- ";
  attachment: any = [];
  attachmentEmail: any = [];
  batchdata: any;
  isreply = false
  movementType: any = [];
  sendingMethod: any = [];
  status: any = [];
  igmNo: any;
  igmType: any;
  igmThrouge: any;
  igmDate: any;
  igmAgent: any;
  chaId: any;
  sentDate: any = [];
  CustomerTypeList: any;
  countryList: any;
  stateList: any[];
  cityList: any[];
  callingCodeList: any;
  currencyList: any;
  shipperList: any;
  bookingpartyList: any;
  invoicingpartyList: any;
  forwarderChaList: any;
  consigneeList: any;
  agentList: any;
  documentTableData: any = []
  userProfileData: any;
  ccCtrl: FormControl = new FormControl();
  allUserEmails: string[] = [];
  filteredUserEmails: Observable<string[]>;
  isExport: boolean = false;
  isImport : boolean = false;
  mblNumbers: string[] = [];
  hblNumbers: string[] = [];
  isMBLCreated: boolean;
  isHBLCreated: boolean;
  blData: any[] = [];
  hblDropdownList=[]
  listOfHblOptions=[];
  emailBldata=[];
  selectedHBL: string | null = null;
  selectedMBL: string | null = null;
  allHBL;
  containerNumbers: string = '';
  selectedBLId: any;
  selectedBLType: any;
  usedBlIds: any=[];
  igmcfslist=[]
  shippingLineId: any;
  shippingLineList: any;
  partymasterListForDropdown: any;
  branchList: any=[];
  constructor(private fb: FormBuilder,
    private notification: NzNotificationService,
    public _api: ApiService,
    private modalService: NgbModal,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private commonfunction: CommonFunctions,
    public loaderService: LoaderService) {
      this.isExport = localStorage.getItem('isExport') === 'true' ? true : false
      this.isImport = localStorage.getItem('isImport') === 'true' ? true : false
      this.defaultMessage = `<b>Please file ${this.isExport ? 'EGM' : 'IGM'} as per HBL</b><br> CFS- `;
    this.batchId = this.route.snapshot.params['id'];
    this.formBuild()

  }

  generateRandomCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 7; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }

    // this.quotationForm.controls?.quoteNumber.setValue(result)
    return "NOC-" + result;
  }
  private modalRef: NgbModalRef;

  getblData() {
    let payload = this.commonService.filterList();
  
    if (payload?.query) {
      payload.query = {
        "batchId": this.route.snapshot.params['id'],
      };
    }
  
    this._api.getSTList(Constant.BL_LIST, payload)
      ?.subscribe((data: any) => {
        const blDocuments = data.documents || [];
        
        // Filter the data to exclude those with isMovement: true or no isMovement field
        this.blData = blDocuments.filter(item => {
          // Include the item if isMovement is false or if isMovement is not present
          return item.isMovement === false || !item.hasOwnProperty('isMovement');
        });
  
        // Extract BL numbers based on blType
        this.mblNumbers = this.blData
          .filter(item => item.blType === 'MBL')
          .map(item => item.blNumber);
  
        this.hblNumbers = this.blData
          .filter(item => item.blType === 'HBL')
          .map(item => item.blNumber);
        this.hblDropdownList = this.getbltypedata('HBL');
        this.isMBLCreated = this.mblNumbers.length > 0;
        this.isHBLCreated = this.hblNumbers.length > 0;
      });
  }
  defaultCC: string = '';

  getSmartAgentList() {
    let payload = this.commonService?.filterList();
    if (payload?.query) {
      payload.query = { status: true };
    }
  
    this.commonService?.getSTList('agent', payload).subscribe((data) => {
      this.agentList = data?.documents;
  
      if (this.agentList?.length) {
        this.defaultCC = this.agentList[0]?.secondaryemailId?.trim()?.toLowerCase();
        if (this.defaultCC && this.regularExpression.test(this.defaultCC)) {
          if (!this.newMembersCC.some(member => member.cc === this.defaultCC)) {
            this.newMembersCC.push({ cc: this.defaultCC });
          }
          this.cfsForm.get('CC')?.setValue(this.defaultCC);
        }
      }
    });
  }
  getmbligl(type){
    if(type==='cfs'){
      return this.getbltypedata('MBL','cfs')?.map(ds=>ds?.blNumber);
    }else{
      return this.mblNumbers;
    }
  }
  getbltypedata(type: 'MBL' | 'HBL',addType?) {
    if(addType === 'cfs'){
      return (this.blData ?? [])
      .filter(item => item.blType === type && (!this.usedBlIds?.find(cc=>cc?.blId === item.blId && cc?.movementType ==='CFS')))
      .map(rs => ({
        ...rs,
        item_id: rs?.blId,
        item_text: rs?.blNumber
      }));
    }else{
      return (this.blData ?? [])
      .filter(item => item.blType === type && !this.usedBlIds?.find(cc=>cc?.blId === item.blId))
      .map(rs => ({
        ...rs,
        item_id: rs?.blId,
        item_text: rs?.blNumber
      }));
    }
  }
  onhblChange(): void {
    let containers: string[] = [];
    const selectedHblIds: any[] = this.listOfHblOptions?.map(option => option?.item_id) || [];
    const matchedHbls = this.blData.filter(
      bl => selectedHblIds.includes(bl?.blId) && bl?.blType === 'HBL'
    );
    if (matchedHbls.length > 0) {
      containers = matchedHbls.reduce((acc: string[], hbl) => {
        if (hbl?.containers) {
          hbl?.containers.forEach(container => {
            if (container?.containerNumber) {
              acc.push(container.containerNumber);
            }
          });
        }
        return acc;
      }, []);
    }
    const mbl=this.emailBldata?.filter(dm=>dm?.blType !== 'HBL');
    this.emailBldata=[];
    const hbl=selectedHblIds?.map((da)=>{
      const bl=this.blData.find(dd=>dd?.blId===da)
      return {
        "blId":bl?.blId,
        "blNo":bl?.blNumber,
        "blType":"HBL"
        }
    })

   
    this.emailBldata=[...mbl,...hbl]
    this.containerNumbers = containers?.join(', ') || '';
    this.updateEmailContent();
  }
  onBLNumberChange(blType: 'MBL' | 'HBL', selectedBL: string,isIgm) {
    const blDocuments = this.blData || [];
    console.log("BL Type:", blType, "Selected BL Number:", selectedBL); // Debugging Log
    // Find the selected BL from the data
    const selectedBLData = blDocuments.find(bl => bl.blNumber === selectedBL && bl.blType === blType);
  
    if (selectedBLData) {
      this.selectedBLId = selectedBLData.blId;
      this.selectedBLType = selectedBLData.blType;
    } else {
      this.selectedBLId = null;
      this.selectedBLType = null;
    }
    if(!isIgm){
      if (selectedBLData?.containers) {
        this.containerNumbers = selectedBLData.containers.map(c => c.containerNumber).join(', ');
      } else {
        this.containerNumbers = '';
      }
      console.log("Containers:", this.containerNumbers); // Debugging Log
    }
    this.updateEmailContent();
    const hbl=this.emailBldata?.filter(dm=>dm?.blType === 'HBL');
    this.emailBldata=[];
    this.emailBldata=[...hbl]
    if(blType === 'MBL' && selectedBL){
      this.emailBldata.push({
        "blId":selectedBLData?.blId,
        "blNo":selectedBL,
        "blType":blType
        })
    }
  }

  formBuild(data?) {
    this.cfsForm = this.fb.group({
      trackingNo: [data ? data?.trackingNo : this.generateRandomCode()],
      remarks: [data ? data?.remarks : ''],
      agent: [data ? data?.agent : ''],
      sendingMethod: [data ? data?.sendingMethod : ''],
      status: [data ? data?.status : ''],
      branch_name: [data ? data?.branch_name : ''],
      sentDate: [data ? data?.sentDate : ''],
      cfsName: [data ? data?.cfsName : ''],
      igmNo: [data ? data?.igmNo : ''],
      lineNo : [data ? data?.lineNo : ''],
      igmDate: [data ? data?.igmDate : ''],
      igmRequestDate: [data ? data?.igmRequestDate : ''],
      cfsRequestDate: [data ? data?.cfsRequestDate : ''],
      cfsDate: [data ? data?.cfsDate : ''],
      nocDate: [data ? data?.nocDate : ''],
      igmAgent: [data ? data?.igmAgent : ''],
      chaId: [data ? data?.chaId : ''],
      igmType: [data ? data?.igmType : ''],
      igmThrouge: [data ? data?.igmThrouge : ''],
      blNo: [data ? data?.bLno : ''],
      movementType: [data ? data?.movementType : ''],
      documentName: [data ? data?.documentName : ''],
      message: [data ? data?.message : ''],
      subject: [data ? data?.subject : ''],
      EmailTo: [data ? data?.EmailTo : '', Validators.pattern(/^([a-zA-Z0-9_+.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(,\s*[a-zA-Z0-9_+.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})*$/)],
      CC: [data ? data?.CC : '', Validators.pattern(/^([a-zA-Z0-9_+.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(,\s*[a-zA-Z0-9_+.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})*$/)],
      Attachment: [data ? data?.Attachment : ''],
      cfsId: [data ? data?.cfsId : ''],
      recipientName: [data ? data?.recipientName : ''],
      address: [data ? data?.address : ''],
      courierDate: [data ? data?.courierDate : ''],
      isFastTrack : [data ? data?.isFastTrack : ''],
      isEmail : [data ? data?.isEmail : false],
    });
    this.igmForm = this.fb.group({
      sendingMethod: [''],
      status: [''],
      igmNo: [''],
      igmDate: [''],
      igmAgent: [''],
      chaId: [''],
      igmType: [''],
      igmThrouge: [''],
      blNo: [''],
      sentDate: [''],
      movementType: [''],
      documentName: [''],
      message: [''],
      subject: [''],
      EmailTo: ['', Validators.pattern(/^([a-zA-Z0-9_+.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(,\s*[a-zA-Z0-9_+.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})*$/)],
      CC: ['', Validators.pattern(/^([a-zA-Z0-9_+.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(,\s*[a-zA-Z0-9_+.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})*$/)],
      Attachment: [''],
    });

    if (data?.documents?.length > 0) {
      this.documentTableData = this.documentTableData.map((x) => {
        return {
          ...x,
          isSelected: data?.documents?.some(y => y.documentId == x.documentId)
        }
      })
    }
  }

  get f() { return this.cfsForm?.controls; }
  get f1() { return this.igmForm?.controls; }

  ngOnInit(): void {
    this.getData();
   
    this.getDocuments();
    this.getbatchData();
    this.getcfstype();
    this.getsendingType();
    this.getigmType();
    this.getcfsstatus();
    this.getigmThrougeType();
    this.getcfs();
    this.getAgentDropDowns();
    this.getUserList();
    this.getSmartAgentList();
    this.filteredUserEmails = this.ccCtrl.valueChanges.pipe(
      startWith(''),
      map((value: string | null) => this._filter(value))
    );
  }
  getDocuments() {
    let payload = this.commonService.filterList();
    if (payload?.query) {
      payload.query = {
        refId: this.route.snapshot.params['id']
      };
    }
    this.commonService.getSTList('document', payload)?.subscribe((res: any) => {
      this.documentTableData = res?.documents.map((x) => {
        return {
          ...x,
          isSelected: false
        }
      }) || []
    });
  }

  cfsList: any = [];
  getcfs() {
    let payload = this.commonService.filterList();
    if (payload?.query) payload.query = {
      status: true,
      masterType: {
        "$in": ['CFS',"CFS,YARD",'ICD']
      },
    };
    this.commonService
      .getSTList('location', payload)?.subscribe((res: any) => {
        this.cfsList = res?.documents
      })
  }
  ulipICEGATE: any[] = [];

  onDrawerClose() {
    // this.getAgentDropDowns() 
    this.partyMasterComponent.loadData();
  }
  @ViewChild(AddPartyComponent) partyMasterComponent!: AddPartyComponent;
  @ViewChild('drawer') drawer!: MatDrawer;
  handleGetList(event) {
    this.getAgentDropDowns()
    this.drawer.close();
    this.partyMasterComponent.loadData();
  }


  documentShow(element) {
    let payload = {
      "igmDt": "11102018",
      "igmNo": element.igmNo
    };
    this.commonService.addToST('ulipICEGATE', payload).subscribe(
      response => {
        if (response?.code === "200" && response?.error === "false") {
          const successResponses = response.response
            .filter(res => res.responseStatus === "SUCCESS")
            .map(res => res.response); // Extract the inner response objects with SUCCESS status

          this.ulipICEGATE = successResponses.length ? successResponses : [];
        } else {
          this.ulipICEGATE = []; // Handle cases with errors or no successful data
        }
      }
    );
  }

  igmcfsdata: any[] = [];
  igmNumber: any[] = [];
  showModal: any;

  type: any = '';
  onOpenSecondForm(content, driver?: any, show?: string) {



    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }

  getcfstype() {
    let payload = this.commonService.filterList()
    if (payload) payload.query = {
      typeCategory: 'igmcfsType',
      status: true,
    }
    this.commonService.getSTList('systemtype', payload)?.subscribe((res: any) => {
      this.movementType = res?.documents?.filter(x => x.typeCategory === "igmcfsType");
    });
  }

  getigmType() {
    let payload = this.commonService.filterList()
    if (payload) payload.query = {
      typeCategory: 'igmType'
    }
    this.commonService.getSTList('systemtype', payload)?.subscribe((res: any) => {
      this.igmType = res?.documents?.filter(x => x.typeCategory === "igmType");
    });
  }

  getcfsstatus() {
    let payload = this.commonService.filterList()
    if (payload) payload.query = {
      typeCategory: 'cfsstatus'
    }
    this.commonService.getSTList('systemtype', payload)?.subscribe((res: any) => {
      this.status = res?.documents?.filter(x => x.typeCategory === "cfsstatus");
    });
  }

  getsendingType() {
    let payload = this.commonService.filterList()
    if (payload) payload.query = {
      typeCategory: 'sendingType'
    }
    this.commonService.getSTList('systemtype', payload)?.subscribe((res: any) => {
      this.sendingMethod = res?.documents?.filter(x => x.typeCategory === "sendingType");
    });
  }

  getigmThrougeType() {
    let payload = this.commonService.filterList()
    if (payload) payload.query = {
      typeCategory: 'igmThrougeType'
    }
    this.commonService.getSTList('systemtype', payload)?.subscribe((res: any) => {
      this.igmThrouge = res?.documents?.filter(x => x.typeCategory === "igmThrougeType");
    });
  }


//   changeStatus(event: any) {
//     this.isToggleOn = event.target.checked;
//     this.isEmailSelected = this.isToggleOn;

//     if (this.isToggleOn) {
//       let data = ''
//       if(this.type=='Addcfs'){
//         let CFSName = this.cfsList?.find((x) => x?.locationId == this.cfsForm.value?.cfsId) || ''
//         //  data = `CONTAINER MOVEMENT AT ${CFSName?.locationName || ''} [${CFSName?.code || ''}] // MBL:${this.batchdata?.mblNumber || ''} // CONTAINER: ${this.batchdata?.containerNos || ''}---JOB NO:${this.batchdata?.batchNo || ''}`
//          data = `CONTAINER MOVEMENT AT ${CFSName?.locationName || ''} [${CFSName?.code || ''}] 
// // MBL:${this.selectedMBL || ''} // CONTAINER: ${this.containerNumbers} --- JOB NO:${this.batchdata?.batchNo || ''}`;

//       }else if(this.type=='Addigm'){
//          data = `MANIFESTATION//MBL:${this.batchdata?.mblNumber || ''}//CNTR: ${this.batchdata?.containerNos || ''}//CONSIGNEE NAME:${this.batchdata?.enquiryDetails?.basicDetails?.consigneeName || ''}//SHIPPING LINE: ${this.batchdata.enquiryDetails?.routeDetails?.shippingLineShortName || this.batchdata.enquiryDetails?.routeDetails?.shippingLineName || ''}//VESSEL: ${this.batchdata?.quotationDetails?.vesselName || ''} ${this.batchdata?.quotationDetails?.voyageNumber || ''}--------------JOB NO. ${this.batchdata?.batchNo || ''}`
//       }

//       this.cfsForm.controls.subject.setValue(data)
//       this.isEmailSelected = true;
//     } else {
//       this.isEmailSelected = false
//     }
//   }
  updateEmailContent() {
    let data = '';
    if (this.type === 'Addcfs') {
      let CFSName = this.cfsList?.find((x) => x?.locationId == this.cfsForm.value?.cfsId) || '';
      data = `CONTAINER MOVEMENT AT ${CFSName?.locationName || ''} [${CFSName?.code || ''}] // MBL:${this.selectedMBL || ''}// CONTAINER: ${this.containerNumbers || ''}--- JOB NO:${this.batchdata?.batchNo || ''}`;
    } else if (this.type === 'Addigm') {
      data = `MANIFESTATION//MBL:${this.selectedMBL || ''}// CONTAINER: ${this.containerNumbers || ''}// CONSIGNEE NAME:${this.batchdata?.enquiryDetails?.basicDetails?.consigneeName || ''}// SHIPPING LINE: ${this.batchdata.enquiryDetails?.routeDetails?.shippingLineShortName || this.batchdata.enquiryDetails?.routeDetails?.shippingLineName || ''}// VESSEL: ${this.batchdata?.quotationDetails?.vesselName || ''} ${this.batchdata?.quotationDetails?.voyageNumber || ''}----------JOB NO. ${this.batchdata?.batchNo || ''}`;
    }

    this.cfsForm.controls.subject.setValue(data);
    this.isEmailSelected = true; // Mark email content as selected
  }
  changeStatus(event: any) {
    this.isToggleOn = event.target.checked;
    this.isEmailSelected = this.isToggleOn;

    if (this.isToggleOn) {
      this.cfsForm.get('isEmail').setValue(true)
      this.updateEmailContent(); // Update email when toggle is on
    } else {
      this.cfsForm.get('isEmail').setValue(false)
      this.isEmailSelected = false;
    }
  }
  showCfsEmail() {
    this.isEmailSelected = true;
    this.isOdexSelected = true;
  }


  addnewMembersTO(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    if ((value || "").trim()) {
      let emailVlidation = this.regularExpression.test(
        String(value).toLowerCase()
      );
      if (emailVlidation == true) {
        this.newMembersTO.push(
          {
            to: value.trim(),
          }
        )
      }
    }
    if (input) {
      input.value = "";
    }
  }

  addnewMembersCC(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    if ((value || "").trim()) {
      const email = value.trim().toLowerCase();
      let emailValidation = this.regularExpression.test(email);
      if (emailValidation && !this.newMembersCC.some(member => member.cc === email)) {
        this.newMembersCC.push({ cc: email });
      }
    }
    if (input) {
      input.value = "";
    }
    this.ccCtrl.setValue('');
  }
  getbatchData() {
    let payload = this.commonService.filterList();
    if (payload?.query) payload.query = {
      batchId: this.batchId,
    };
    this.commonService
      .getSTList('batch', payload)?.subscribe((res: any) => {
        this.batchdata = res?.documents?.[0];
        this.shippingLineId = this.batchdata?.routeDetails?.finalShippingLineId
        this.getShippingLineDropDowns()
        if (this.batchdata?.statusOfBatch == 'Job Cancelled' || this.batchdata?.statusOfBatch == 'Job Closed') {
          // this.isreply = true;
        }
        // this.isloader = false;
        if (this.batchdata) {
          // Update default message with location name
          this.defaultMessage = `<b>Please file ${this.isExport ? 'EGM' : 'IGM'} as per HBL</b><br>CFS - ${this.batchdata?.enquiryDetails?.routeDetails?.locationName || ''}`;
          this.getEmail();
        }
      });
  }
  getShippingLineDropDowns() {
    let payload = this.commonService.filterList();
  
    if (!payload.query) payload.query = {};
  
    payload.query = {
      "$and": [
        { "status": true },
        { "feeder": { "$ne": true } },
        { "shippinglineId": this.shippingLineId }  // <-- Match by given shippinglineId
      ]
    };
    this._api.getSTList("shippingline", payload)?.subscribe((res: any) => {
      this.shippingLineList = res?.documents;
      this.getPartyMasterForShippingLine();
    });
  }
  getPartyMasterForShippingLine() {
    // First, check if shippingLineList has data and partymasterId exists
    const partymasterId = this.shippingLineList?.[0]?.partymasterId;
  
    if (partymasterId) {
      let payload = this.commonService.filterList();
      // Add filter to match partymasterId
      payload.query = {
        status: true,
        partymasterId: partymasterId // Assuming `_id` is the identifier in partymaster collection
      };
      this.commonService.getSTList("partymaster", payload)?.subscribe((res: any) => {
        this.partymasterListForDropdown = res?.documents?.[0];
        this.branchList = this.partymasterListForDropdown?.branch??[];
      });
    }
  }
  openFunction(content, element) {

    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
    this.documentShow(element);
  }
  editCFSData: any;
  open(content, type?, data?) { 
    this.getSmartAgentList()
    this.selectedMBL='';
    this.listOfHblOptions=[];
    this.type = type == 'Addcfs' ? "Addcfs" : type == 'Addigm' ? "Addigm" : type == 'Addnoc' ? "Addnoc" : ''
    this.editCFSData = null
    this.formBuild(data);
    if (data) {
      this.emailButtonEnabled = true;
      if(type == 'Addcfs'){
        this.selectedMBL=(data?.blData??[])?.find(cc=>cc?.blType === 'MBL')?.blNo??'';
        if(data?.igmcfsId){
          this.usedBlIds=[];
          this.igmcfslist.forEach((doc: any) => {
            if (Array.isArray(doc?.blData) && data?.igmcfsId !== doc?.igmcfsId) {
              doc.blData.forEach((bl: any) => {
                if (bl?.blId) {
                  this.usedBlIds.push({
                    movementType: doc?.movementType,
                    ...bl
                  });
                }
              });
            }
          });
        }
      }else{
        this.emailButtonEnabled = false;
        this.selectedMBL=(data?.blData??[])?.find(cc=>cc?.blType === 'MBL')?.blNo??'';
        this.listOfHblOptions=(data?.blData??[])?.filter(cc=>cc?.blType === 'HBL').map(((cd)=>{
          return {
            "item_id": cd?.blId,
            "item_text": cd?.blNo
        }
        }));
        this.hblDropdownList = this.getbltypedata('HBL');
        
        this.hblDropdownList = [...this.listOfHblOptions,...this.hblDropdownList]
        this.onhblChange()
      }
      this.editCFSData = data;
    } else {
      if (type == 'Addcfs') {
        this.cfsForm.controls['movementType'].setValue('CFS');
      }else{
       this.hblDropdownList = this.getbltypedata('HBL');
      }
    }

    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
      windowClass: 'custom-modal-class'  
    });

    this.modalRef.result.finally(() => {
      this.cfsForm.reset();
      this.emailButtonEnabled = false;
      this.attachment = [];
    });
  }
  customerTypeFromPopup: any = 'IGM Agent'
  toggleDrawer(drawer: any, type: string) { 
    if (type === 'Addigm') {
      this.partyMasterComponent.customerTypeFromPopup = this.customerTypeFromPopup;
      drawer.toggle();
    }
  }

  setEmail(e) {
    let email = this.partymasterList?.find((x) => x?.partymasterId === this.cfsForm.value?.igmAgent)?.primaryMailId
    if (email) {
      this.newMembersTO.push(
        {
          to: email
        }
      )
    }
    this.newMembersTO = this.newMembersTO.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.to === value.to)
    );

  }
  partymasterList: any = [];
  chaList: any = [];
  getAgentDropDowns() {
    const payload = this.commonService.filterList();
  
    if (payload) {
      payload.query = { status: true };
  
      this.commonService.getSTList("partymaster", payload)?.subscribe((res: any) => {
        const allAgents = res?.documents || [];
  
        // If customerType is an object or array, normalize both
        this.partymasterList = allAgents.filter((agent: any) =>
          Array.isArray(agent.customerType)
            ? agent.customerType.some((c: any) => c.item_text === 'IGM Agent')
            : agent.customerType?.item_text === 'IGM Agent'
        );
  
        this.chaList = allAgents.filter((agent: any) =>
          Array.isArray(agent.customerType)
            ? agent.customerType.some((c: any) => c.item_text === 'CHA' || c.item_text === 'Cha')
            : agent.customerType?.item_text === 'CHA' || agent.customerType?.item_text === 'Cha'
        );
      });
    }
  }

  emailList = [];
  emailDate: any = [];
  toalLength: number;
  count = 0;
  size = 10;
  page = 1;

  getEmail() {

    let payload = this.commonService.filterList();
    if (payload?.sort) payload.sort = {
      "desc": ["updatedOn"]
    };
    if (payload?.size) payload.size = Number(this.size);
    if (payload?.from) payload.from = this.page - 1;
    this.commonService.getSTList('emailList', { "batchNo": this.batchdata?.batchNo })?.subscribe((res: any) => {

      this.emailList = res;
      if (this.emailList?.length) this.open(this.emailList[0]);
      this.emailDate = res;
      this.toalLength = res?.length;
      this.count = res?.length;

    });
  }

  removenewMembersTO(fruit: FruitTO): void {
    const index = this.newMembersTO.indexOf(fruit);
    if (index >= 0) {
      this.newMembersTO.splice(index, 1);
    }
  }

  removenewMembersCC(fruit: FruitCC): void {
    const index = this.newMembersCC.indexOf(fruit);
    if (index >= 0) {
      this.newMembersCC.splice(index, 1);
    }
  }

  fileChanged(event: any, form: string) {
    let attachmentControl;

    if (form === 'igmForm') {
      attachmentControl = this.igmForm.get('Attachment');
    } else if (form === 'cfsForm') {
      attachmentControl = this.cfsForm.get('Attachment');
      const file = event.target.files[0];
      this.attachment = event.target.files;
      attachmentControl.setValue(file);
 
      const formData = new FormData();
      formData.append('file',  file ,  file?.name); 
      formData.append('name', file?.name);
      
      this.commonService.uploadDocuments('uploadfile',formData).subscribe();


    } else {
      if (event.target.files && event.target.files.length > 0) {
        const file = event.target.files[0];
        this.attachmentEmail = event.target.files;

        // Set the documentName control with the file name only if form is 'cfsForm'
        this.cfsForm.get('documentName')?.setValue(file.name);
        attachmentControl.setValue(file);
      } else {

        // Clear the documentName control if no file is selected
        this.cfsForm.get('documentName')?.setValue(null);
        attachmentControl.setValue(null);
      }
    }
  }


  onclose(form) {
    this.modalService.dismissAll();
    this.igmForm.reset()
    this.cfsForm.reset();
    this.isToggleOn = false;
    this.isEmailSelected = false;
    this.newMembersTO = [];
    this.newMembersCC = []; 
    this.containerNumbers = "";
    return null;
  }
  checkSendingOption(){
    if(this.cfsForm.value?.igmThrouge?.toLowerCase() == 'courier'){
      return true
    }
    return false
}
  getBldata(){

  }
  submittedIgmcfsId: string | null = null;
emailButtonEnabled: boolean = false;
  onsave(Uploaddocument = null) {

    if (Uploaddocument == 'Uploaddocument') {
      if (this.cfsForm.invalid) {
        return;
      }
      const preserveIsEmail = this.cfsForm.get('isEmail')?.value;
      const body: any = {
        batchNo: this.batchdata?.batchNo || '',
        batchId: this.batchId,
        sendingMethod: this.cfsForm.value?.sendingMethod || '',
        branch_name: this.cfsForm.value?.branch_name || '',
        igmNo: this.cfsForm.value?.igmNo || '',
        lineNo : this.cfsForm.value?.lineNo || '',
        igmType: this.cfsForm.value?.igmType || '',
        blData:  this.emailBldata,
        igmAgent: this.cfsForm.value?.igmAgent || '',
        chaId: this.cfsForm.value?.chaId || '',
        igmAgentName: this.partymasterList?.find((x) => x?.partymasterId === this.cfsForm.value?.igmAgent)?.name || '',
        chaName: this.chaList?.find((x) => x?.partymasterId === this.cfsForm.value?.chaId)?.name || '',
        igmDate: this.cfsForm.value?.igmDate || '',
        igmRequestDate: this.cfsForm.value?.igmRequestDate || '',
        cfsRequestDate: this.cfsForm.value?.cfsRequestDate || '',
        cfsDate: this.cfsForm.value?.cfsDate || '',
        nocDate: this.cfsForm.value?.nocDate || '',
        igmThrouge: this.cfsForm.value?.igmThrouge || '',
        status: this.cfsForm.value?.status || '',
        sentDate: this.cfsForm.value?.sentDate || '',
        movementType: this.type == 'Addnoc' ? 'NOC' : this.cfsForm.value?.movementType || '',
        cfsId: this.cfsForm.value?.cfsId || '',
        type: this.type,
        cfsName: this.cfsList?.find((x) => x?.locationId == this.cfsForm.value?.cfsId)?.locationName || '',
        documentName: this.cfsForm.value?.documentName || '',
        trackingNo: this.type == 'Addnoc' ? this.cfsForm.value?.trackingNo || '' : '',
        remarks: this.cfsForm.value?.remarks || '',
        agent: this.cfsForm.value?.agent || '',


        recipientName:  this.cfsForm.value?.recipientName || '',
        address:  this.cfsForm.value?.address || '',
        courierDate:  this.cfsForm.value?.courierDate || '',
        isFastTrack :  this.cfsForm.value?.isFastTrack || '',
        isEmail :  this.cfsForm.value?.isEmail || false,


        documents: this.documentTableData.filter(doc => doc.isSelected).map(x => {
          return {
            documentName: x?.documentName || '',
            documentType: x?.documentType || '',
            documentId: x?.documentId || '',
          }
        }) || []
      }
      if (this.attachment?.[0]) {
        body.file = this.attachment[0], this.attachment[0].name
        body.documentName = this.attachment[0].name
      }



      if (this.editCFSData?.igmcfsId) {

        this.commonService.UpdateToST(`igmcfs/${this.editCFSData?.igmcfsId}`, { ...body, igmcfsId: this.editCFSData?.igmcfsId }).subscribe(
          (res: any) => {
            if (res) {
              this.updateBatch(this.batchdata,res)
              this.notification.create('success', 'Update Successfully', '');
              // this.modalService.dismissAll();
              // this.cfsForm.reset();
              this.cfsForm.patchValue({ isEmail: preserveIsEmail });
              setTimeout(() => {
                this.getData();
              }, 1000);
            }
          },
          (error) => {
          }
        );
      } else {
        this.commonService.addToST('igmcfs', body).subscribe(
          (res: any) => {
            if (res) {
              this.updateBatch(this.batchdata,res)
              this.notification.create('success', 'Added Successfully', '');
              // this.modalService.dismissAll();
              this.submittedIgmcfsId = res?.igmcfsId; // Capture igmcfsId
        this.emailButtonEnabled = true;
              // this.cfsForm.reset();
              this.cfsForm.patchValue({ isEmail: preserveIsEmail });
              setTimeout(() => {
                this.getData();
              }, 1000);
            }
          },
          (error) => {
          }
        );
      }


    }
    else {
      if (this.igmForm.invalid) {
        return;
      }
      let formdata = new FormData();

      formdata.append("batchNo", this.batchdata?.batchNo || '');
      formdata.append("message", this[Uploaddocument].value?.message || '');
      formdata.append("to", this.newMembersTO.map(email => email?.to).join(","));
      formdata.append("cc", this.newMembersCC.map(email => email?.cc).join(","));
      formdata.append("subject", this[Uploaddocument].value?.subject || '');
      formdata.append("igmcfsId", this.submittedIgmcfsId || '');
      const selectedDocuments = this.documentTableData.filter(doc => doc.isSelected);
      let docData = []
      selectedDocuments.forEach(doc => {
        docData.push({
          name: doc.documentURL
        })
      });

      // if (this.attachment?.[0]) {
      //   docData.push({
      //     name : this.attachment[0].name, content : this.attachment[0]
      //    })}
      formdata.append('documents', JSON.stringify(docData));
      if (this.attachment?.[0]) {
        formdata.append('file', this.attachment[0], this.attachment[0].name);
        formdata.append('documentName', this.attachment[0].name);
      }


      this.loaderService.showcircle();

      this.commonService.userList('sendBatchEmail', formdata).subscribe(
        (res: any) => {
          this.loaderService.hidecircle();
          // this.cfsForm.reset();
          this.attachment = [];

          if (res) {
            this.notification.create('success', 'Email Sent Successfully..!', '');
            setTimeout(() => {
              this.getData();
            }, 1000);
          }
        },
        (error: any) => {
          this.loaderService.hidecircle();
          this.notification.error('Error', 'Failed to send email. Please try again later.');
        }
      );
    }
    
  }

  changesDataValue(event: any, documentId: string) {
    const isChecked = event.target.checked;
    this.documentTableData = this.documentTableData.map(doc => {
      if (doc.documentId === documentId) {
        return { ...doc, isSelected: isChecked };
      }
      return doc;
    });
  }

  updateBatch(data,res?) {
    let payload;
    if (res?.type == 'Addnoc') {
      payload = {
        ...data,
        nocDate: res ?res?.nocDate: '',
      }
      this.commonService.UpdateToST(`batch/${payload.batchId}`, payload)?.subscribe()
    } else if (res?.type == 'Addigm') {
      payload = {
        ...data,
        igmRequestDate: res ? res?.igmRequestDate : '',
        igmNo:res ? res?.igmNo: '',
        lineNo : res ?res?.lineNo: ''
      }
      this.commonService.UpdateToST(`batch/${payload.batchId}`, payload)?.subscribe()
    } else if (res?.type == 'Addcfs') {
      payload = {
        ...data,
        cfsRequestDate:res ? res?.cfsRequestDate : ''
      }
      this.commonService.UpdateToST(`batch/${payload.batchId}`, payload)?.subscribe()
    }
  }

  getDocumentNames(e) {
    let docArray = e?.documents || [] 
    let doc = docArray?.map(doc => doc?.documentName) || ''; 
    if (e?.documentName) {
      doc?.push(e?.documentName)
    }
    return doc?.join(', ')
  }

  getData() {
    this.loaderService.showcircle();
    let payload = this.commonService.filterList()
    if (payload?.size) payload.size = this.pageSize,
      payload.from = this.from

    if (payload?.query) payload.query = {
      batchId: this.batchId,
    }

    this.commonService.getSTList('igmcfs', payload)?.subscribe((res: any) => {
      this.usedBlIds = [];
      this.igmcfslist=res?.documents??[];
      res.documents.forEach((doc: any) => {
        if (Array.isArray(doc.blData)) {
          doc.blData.forEach((bl: any) => {
            if (bl?.blId) {
              this.usedBlIds.push({
                movementType: doc?.movementType,
                ...bl
              });
            }
          });
        }
      });
      if (res && res?.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1,
          movementType: s.movementType,
          sendingMethod: s.sendingMethod,
          documentName: s.documentName,
          updatedOn: s.updatedOn,
          updatedBy: s.updatedBy
        }));
        this.dataSource.sort = this.sort1;
        this.toalLength = res.totalCount;
        this.count = res.documents.length;
        this.loaderService.hidecircle();
      }
      this.getblData();
      
    }, () => {
      this.loaderService.hidecircle();
    });
  }

  onPageChange(event) {
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.from = event.pageIndex * event.pageSize;
    this.getData();
  }

  documentPreviewArray(e) {
    if (e.documents?.length > 0) {
      e.documents?.forEach(element => {
        this.documentPreview(element)
      })
    }
    if (e?.documentName) {
      this.documentPreview(e)
    }
  }

  documentPreview(doc) {
    this.commonService.downloadDocuments('downloadfile', doc.documentName).subscribe(
      (res: Blob) => {
        const fileType = doc.documentName.split('.').pop().toLowerCase();
        const blob = new Blob([res], { type: `application/${fileType}` });
        const temp = URL.createObjectURL(blob); 

        if (fileType === 'pdf') {
          const pdfWindow = window.open(temp);
          pdfWindow.print();
        } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(fileType)) {
          // Handle image preview
          const img = document.createElement('img');
          img.src = temp;
          const imgWindow = window.open('');
          imgWindow.document.write('<html><body style="margin:0; text-align:center;"></body></html>');
          imgWindow.document.body.appendChild(img);
        } else {
          // Download other file types
          const link = document.createElement('a');
          link.href = temp;
          link.setAttribute('download', doc.documentName);
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      },
      (error) => {
        console.error('Document preview error', error);
      }
    );
  }


  downloadFileArray(e) {
    if (e.documents?.length > 0) {
      e.documents?.forEach(element => {
        this.downloadFile(element)
      })
    }
    if (e?.documentName) {
      this.downloadFile(e)
    }
  }

  downloadFile(doc) {
    this.commonService.downloadDocuments('downloadfile', doc.documentName).subscribe(
      (fileData: Blob) => {
        if (fileData) {
          this.commonService.downloadDocumentsFile(fileData, doc.documentName);
        } else {
          console.error('No file data received');
        }
      },
      (error) => {
        console.error('File download error', error);
      }
    );
  }



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

  titleParty = '';
  showParty: boolean = false;

  customerStatusTag: any = 'Resident'

  customerStatus(e) {
    this.customerStatusTag = e
    if (e === 'Non Resident') {
      this.Overview.get('panNo').clearValidators()
      this.Overview.get('panNo').updateValueAndValidity()
      this.Overview.get('pinCode').clearValidators()
      this.Overview.get('pinCode').updateValueAndValidity()
      this.Overview.get('state').clearValidators()
      this.Overview.get('state').updateValueAndValidity()
      this.Overview.get('city').clearValidators()
      this.Overview.get('city').updateValueAndValidity()

    }
    else {

      this.Overview.get('state').setValidators(Validators.required)
      this.Overview.get('state').updateValueAndValidity()

      this.Overview.get('city').setValidators(Validators.required)
      this.Overview.get('city').updateValueAndValidity()
      this.Overview.get('pinCode').setValidators(Validators.required)
      this.Overview.get('pinCode').updateValueAndValidity()
      this.Overview.get('panNo').setValidators(Validators.required)
      this.Overview.get('panNo').updateValueAndValidity()
      // if (this.countryList?.find((x) => this.Overview.get('country').value === x?.countryId)?.countryName?.toLowercase() === 'india'){

      // }


    }
  }
  getCustomerType() {

    let payload = this.commonService.filterList()
    payload.query = {
      typeCategory: 'ISF', status: true,
    }
    this.commonService.getSTList("systemtype", payload).subscribe((res: any) => {
      let customerTypeListHold = []
      this.CustomerTypeList = res.documents;
      this.CustomerTypeList.forEach(e => {
        customerTypeListHold.push({
          item_id: e.systemtypeId,
          item_text: e.typeName
        })

      })
      this.CustomerTypeList = customerTypeListHold

    });
  }
  listOfTagOptions = [];

  get f2() { return this.Overview?.controls; }
  Overview: FormGroup;
  addressFormBuild() {
    this.Overview = this.fb.group({
      name: ['', Validators.required],
      shortname: [''],
      annualTurnover: [''],
      annualTernover: [''],
      customerStatus: ['Resident'],
      country: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      parentCompany: [false],
      groupCompany: [false],
      panNo: ['', Validators.required],
      address: ['', [Validators.required, this.forbiddenCharactersValidator()]],
      pinCode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      partyCurrency: ['', Validators.required],
      primaryEmailId: ['', [Validators.required, Validators.email]],
      customerType: [[]],
      ImportExport: ['', Validators.required],
      principle: [''],
      partyShortcode: [''],
      chequeAcceptance: [false],
      isSez: [false],
      isRegisterCompany: [false],
      isRegister: [false],
      isUser: [false],
      bankName: [''],
      notes: [],
      customerList: [''],
      overviewTable: [],
    });
  }
  forbiddenCharactersValidator() {
    return (control) => {
      const forbiddenChars = /["\\]/; // Regular expression to match forbidden characters
      const value = control.value;
      const hasForbiddenChars = forbiddenChars.test(value);
      return hasForbiddenChars ? { forbiddenChars: true } : null;
    };
  }
  closePopup() {
    this.Overview.reset()
    this.showParty = false
    this.submitted1 = false;
    // this.modalService.dismissAll()
  }
  toggleValidation() {
    const customerControl = this.Overview.get('customerList');

    if (this.Overview.value?.groupCompany) {
      customerControl?.setValidators([Validators.required]);
    } else {
      customerControl?.clearValidators();
    }

    // Update the validity of the control
    customerControl?.updateValueAndValidity();
  }

  getCountryList() {
    let payload = this.commonService.filterList()
    payload.query = { status: true }

    this.commonService.getSTList('country', payload).subscribe((data) => {
      this.countryList = data.documents;
    });
  }


  getStateList() {
    this.stateList = [];
    this.cityList = [];
    let countryData = this.countryList?.filter(x => x?.countryId === this.Overview.get('country').value);

    this.callingCodeList = countryData;

    let payload = this.commonService.filterList()
    payload.query = {
      "countryId": this.Overview.get('country').value, status: true,
    }
    this.commonService.getSTList("state", payload).subscribe((data) => {
      this.stateList = data.documents;
    });
  }

  getCityList() {
    this.cityList = [];
    let payload = this.commonService.filterList()
    payload.query = {
      stateId: this.Overview.get('state').value, status: true,
    }
    this.commonService.getSTList("city", payload).subscribe((data) => {
      this.cityList = data.documents;
    });
  }
  onCheckboxChange(isChecked: boolean, type: string) {

    if (type === 'groupCompany' && isChecked) {
      this.Overview.patchValue({ groupCompany: true, parentCompany: false });
    } else if (type === 'parentCompany' && isChecked) {
      this.Overview.patchValue({ parentCompany: true, groupCompany: false });
    }
    else if (type === 'groupCompany' && !isChecked) {
      this.Overview.patchValue({ parentCompany: true, groupCompany: false });
    }
    else if (type === 'parentCompany' && !isChecked) {
      this.Overview.patchValue({ parentCompany: false, groupCompany: true });
    }
    this.Overview.updateValueAndValidity()
  }
  submitted1: boolean = false;
  saveParty() {
    this.submitted1 = true
    if (this.Overview.valid) {
      this.createModel();
      let createBody = [];
      createBody.push(this.smartAgentDetail);
      this.commonService.addToST('partymaster', createBody[0]).subscribe((data: any) => {
        if (data) {
          this.notification.create('success', 'Added Successfully', '');
          // this.modalService.dismissAll()
          this.showParty = false;
          this.Overview.reset()
          this.submitted1 = false;
          this.getAgentDropDowns()
        }
      }, (error) => {
        this.notification.create('error', error?.error?.error?.message, '');
      });
    }
  }
  getCurrencyList() {
    let payload = this.commonService.filterList()
    payload.query = { status: true }
    this.commonService.getSTList('currency', payload).subscribe((data) => {
      this.currencyList = data.documents;
    });
  }
  smartAgentDetail: partymasterDetail = new partymasterDetail();
  createModel() {
    let countryData = this.countryList.filter(x => x?.countryId === this.Overview?.get('country')?.value);
    let stateData = this.stateList.filter(x => x?.stateId === this.Overview.get('state').value);
    let cityData = this.cityList.filter(x => x?.cityId === this.Overview.get('city').value);
    let currencyData = this.currencyList.filter(x => x?.currencyId === this.Overview.get('partyCurrency').value) || [];
    this.smartAgentDetail.orgId = this.commonfunction.getAgentDetails().orgId;
    this.smartAgentDetail.currency = new Currency();
    this.smartAgentDetail.partyCurrency = new Currency();
    this.smartAgentDetail.tenantId = "1";
    this.smartAgentDetail.status = true;
    this.smartAgentDetail.name = this.Overview?.get('name')?.value;
    this.smartAgentDetail.notes = this.Overview?.get('notes')?.value ?? [];
    this.smartAgentDetail.overviewTable = this.Overview?.get('overviewTable')?.value ?? [];
    this.smartAgentDetail.shortName = this.Overview?.get('shortname')?.value;
    this.smartAgentDetail.customerType = this.listOfTagOptions;
    this.smartAgentDetail.ImportExport = this.Overview?.get('ImportExport')?.value;
    this.smartAgentDetail.customerStatus = this.Overview?.get('customerStatus').value;
    this.smartAgentDetail.addressInfo.address = this.Overview?.get('address').value;
    this.smartAgentDetail.addressInfo.countryId = countryData[0]?.countryId || '';
    this.smartAgentDetail.addressInfo.countryISOCode = this.Overview?.get('country').value;
    this.smartAgentDetail.addressInfo.countryName = countryData[0]?.countryName || '';
    this.smartAgentDetail.addressInfo.stateId = stateData[0]?.stateId;
    this.smartAgentDetail.addressInfo.stateName = stateData[0]?.typeDescription;
    this.smartAgentDetail.addressInfo.stateCode = stateData[0]?.GSTNCode || '';
    this.smartAgentDetail.addressInfo.cityId = cityData[0]?.cityId;
    this.smartAgentDetail.addressInfo.cityName = cityData[0]?.cityName;
    this.smartAgentDetail.addressInfo.postalCode = this.Overview?.get('pinCode').value.toString();
    this.smartAgentDetail.primaryMailId = this.Overview?.get('primaryEmailId').value;

    this.smartAgentDetail.chequeAcceptance = this.Overview?.get('chequeAcceptance').value;
    this.smartAgentDetail.isSez = this.Overview?.get('isSez').value;

    this.smartAgentDetail.currency.currencyId = currencyData[0]?.currencyId;
    this.smartAgentDetail.currency.currencyCode = currencyData[0]?.currencyShortName;
    this.smartAgentDetail.currency.currencyName = currencyData[0]?.currencyName;
    this.smartAgentDetail.partyCurrency.currencyId = currencyData[0]?.currencyId;
    this.smartAgentDetail.partyCurrency.currencyCode = currencyData[0]?.currencyShortName;
    this.smartAgentDetail.partyCurrency.currencyName = currencyData[0]?.currencyName;

    // Additional Details from Overview
    this.smartAgentDetail.annualTurnover = this.Overview?.get('annualTernover').value.toString();
    this.smartAgentDetail.panNo = this.Overview?.get('panNo').value;
    this.smartAgentDetail.partyShortcode = this.Overview?.get('partyShortcode').value;
    this.smartAgentDetail.bankName = this.Overview?.get('bankName')?.value ?? '';
    this.smartAgentDetail.parentCompany = this.Overview.value?.parentCompany ?? false;
    let customerList: any = this.partymasterList.find(x => x?.partymasterId === this.Overview.get('customerList').value) ?? '';
    this.smartAgentDetail.parenetcustomerId = this.Overview.get('customerList').value;
    this.smartAgentDetail.parenetcustomerName = customerList?.name;

    // KYC Details
    this.smartAgentDetail.groupCompany = this.Overview?.get('groupCompany')?.value;
    this.smartAgentDetail.parentCompany = this.Overview?.get('parentCompany')?.value;


  }

  cfsAddForm: FormGroup;

  get f6() { return this.cfsAddForm?.controls; }

  formBuildcfsAddForm() {
    this.cfsAddForm = this.fb.group({
      locationName: [''],
      portType: [''],
      country: ['', [Validators.required]],
      state: ['', [Validators.required]],
      masterType: ['', [Validators.required]],
      agentBranch: [''],
      CFS: [false],
      ICD: [false],
      Yard: [false],
      name: ['', [Validators.required]],
      code: ['', [Validators.required]],
      portName: [''],
      terminal: [''],
      EDICode: [''],
      DOaddress: [''],
      address: ['', [Validators.required]],
      contactPerson: [''],
      email: ['', [Validators.pattern(environment.validate.email)]],
      primaryCountryCode: [''],
      primaryNo: ['', [Validators.pattern('^[0-9]*$')]],
      DOCode: [''],
      bondNo: [''],
      nominatedCfs: [''],
      creditDays: [''],
      lineReference: [true],
      isSEZ: [false]
    });
  }
  masterTypeList = [{ label: 'CFS', value: 'CFS' }, { label: 'Yard', value: 'YARD' }, { label: 'CFS/Yard', value: 'CFS/YARD' }, { label: 'ICD', value: 'ICD' }]

  getcountryList() {
    let payload = this.commonService.filterList()
    payload.query = {
    }

    this.commonService.getSTList('country', payload).subscribe((res: any) => {
      this.countryData = res.documents;
    });
  }
  countryData: any = []
  stateListCfs: any = []
  getStateListCfs() {
    this.stateList = [];
    if (!this.cfsAddForm.get('country').value) {
      return
    }
    let payload = this.commonService.filterList()
    payload.query = {
      "status": true,
      countryId: this.cfsAddForm.get('country').value
    }

    this.commonService.getSTList('state', payload).subscribe((data) => {
      this.stateListCfs = data.documents;
    });
  }
  onCancelCfs() {
    this.cfsAddForm.reset();

    this.openAddCFS = false;
    // this.modalService.dismissAll()
  }
  submitted6: boolean = false;

  openAddCFS: boolean = false
  openCfs() {
    this.openAddCFS = true
    this.formBuildcfsAddForm()
    this.getcountryList();
    this.getBranchList();
    this.getPortDropDowns();


  }

  agentBranchList: any = []
  getBranchList() {
    let payload = this.commonService.filterList()
    payload.query = {
      orgId: this.commonfunction.getAgentDetails().orgId,
    }

    this.commonService.getSTList('branch', payload)
      .subscribe((data: any) => {
        this.agentBranchList = data.documents;
      });
  }
  portList: any = []
  getPortDropDowns() {

    let payload = this.commonService.filterList()
    payload.query = {
      "status": true,
    }
    payload.size = 15000
    payload.project = ["portDetails.portName", "portId"];

    this.commonService.getSTList('port', payload).subscribe((res: any) => {
      this.portList = res?.documents;

    });
  }
  locationsMasters() {
    this.submitted6 = true;
    if (this.cfsAddForm.invalid) {
      return;
    }
    let countryList = this.countryData.filter(
      (x) => x.countryId === this.cfsAddForm.get('country').value
    );
    let stateList = this.stateListCfs.filter(
      (x) => x.stateId === this.cfsAddForm.get('state').value
    );

    let portList = this.portList.filter(
      (x) => x.portId === this.cfsAddForm.get('portName').value
    );
    let newLocation = this.cfsAddForm.value;

    const dataupdate = {
      ...newLocation,
      locationName: this.cfsAddForm.get('name').value,
      country: countryList[0].countryName,
      countryISOCode: this.cfsAddForm.get('country').value,
      state: stateList[0].typeDescription,
      stateId: this.cfsAddForm.get('state').value,
      portId: this.cfsAddForm.get('portName').value,
      portName: portList[0]?.portDetails?.portName,
      status: true,
      "tenantId": "1",
      ICD: this.cfsAddForm.get('masterType').value === 'ICD' ? true : false,
      Yard: this.cfsAddForm.get('masterType').value === 'YARD' || this.cfsAddForm.get('masterType').value === 'CFS/YARD' ? true : false,
      CFS: this.cfsAddForm.get('masterType').value === 'CFS' || this.cfsAddForm.get('masterType').value === 'CFS/YARD' ? true : false,
      masterType: this.cfsAddForm.get('masterType').value === 'CFS/YARD' ? 'CFS,YARD' : this.cfsAddForm.get('masterType').value,
      agentBranchId: this.cfsAddForm.get('agentBranch').value,
      agentBranch: this.agentBranchList.filter((x) => x?.branchId === this.cfsAddForm.get('agentBranch').value)[0]?.branchName,
      isSEZ: this.cfsAddForm.get('isSEZ').value,
    };

    this.commonService.addToST('location', dataupdate).subscribe(
      (res: any) => {
        if (res) {
          this.submitted6 = false;
          this.notification.create('success', 'Added Successfully', '');
          this.onCancelCfs();
          setTimeout(() => {
            this.getcfs();
          }, 1000);

        }
      },
      (error) => {
        this.notification.create('error', error?.error?.error?.message, '');
      }
    );

  }

  getUserList() {
    let payload = this.commonService.filterList();
    this.commonService
      .getSTList('user', payload)
      ?.subscribe((data) => {
        if (data?.documents && Array.isArray(data.documents)) {
          data.documents.forEach(user => {
            if (user?.userEmail) {
              this.allUserEmails.push(user.userEmail.toLowerCase());
            }
          });
          // Remove duplicates from the allUserEmails array
          this.allUserEmails = this.allUserEmails.filter((email, index, self) =>
            index === self.indexOf(email)
          );
        }
      });
  }

  private _filter(value: string | null): string[] {
    return this.allUserEmails.filter(email =>
      !this.newMembersCC.some(member => member.cc === email)
    );
  }
  
  selectedCC(event: MatAutocompleteSelectedEvent): void {
    const email = event.option.viewValue;
    if (this.regularExpression.test(email)) {
      if (!this.newMembersCC.some(member => member.cc === email)) {
        this.newMembersCC.push({ cc: email });
      }
    }
    this.ccCtrl.setValue('');
  }
  deleteRow(content1, e) {
    this.modalService.open(content1, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'md',
      ariaLabelledBy: 'modal-basic-title'
    }).result.then((result) => {

      if (result === 'yes') {
        let deleteBody = 'igmcfs/'+e?.igmcfsId
        this._api
          .deleteST(deleteBody)
          .subscribe((data) => {
            if (data) {
              this.updateBatch(e);
            }
            setTimeout(() => {
              if (data) {
                this.notification.create(
                  'success',
                  'Deleted Successfully',
                  ''
                ); 
              }
              this.getData();
            }, 1000);
          });
      }
    });
  }

  getDateByType(element: any): Date | null {
    if (element?.type === 'Addigm') {
      return element?.igmDate;
    } else if (element?.type === 'Addcfs') {
      return element?.cfsDate;
    } else if (element?.type === 'Addnoc') {
      return element?.nocDate;
    }
    return null;
  }
  onselectbranch(value){
    const branch=this.branchList?.find(da=>da?.branch_name===value);
    if (branch?.pic_email) {
      const Email = branch.pic_email.split(',').map(e => e.trim()).filter(e => e); 
      this.newMembersTO = Email.map(da => ({ to: da }));
    }
  }
}