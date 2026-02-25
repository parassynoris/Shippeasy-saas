import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { BatchService } from 'src/app/services/Batch/batch.service';
import { environment } from 'src/environments/environment';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { CommonService } from 'src/app/services/common/common.service';
import { BaseBody } from '../../smartagent/base-body';
import { ApiSharedService } from 'src/app/shared/components/api-service/api-shared.service';
import { differenceInCalendarDays } from 'date-fns';
import { ApiService } from '../../principal/api.service';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as XLSX from "xlsx";
import { CognitoService } from 'src/app/services/cognito.service';
import { Batch } from 'src/app/models/batch-close';
import { Container } from 'src/app/models/container-master';
import { Vessel } from 'src/app/models/vessel-master';
import { Voyage1 } from 'src/app/models/si';
import { DatePipe } from '@angular/common';
import { LoaderService } from 'src/app/services/loader.service';
@Component({
  selector: 'app-si',
  templateUrl: './si.component.html',
  styleUrls: ['./si.component.scss']
})
export class SIComponent implements OnInit {
  @Output() CloseNew = new EventEmitter<string>();
  @Input() isshowDetails: boolean = false;
  @Input() isPage: any = 'enquiry';
  @Input() batchDetail: any = [];
  @Output() getBatchById: EventEmitter<any> = new EventEmitter();
  newenquiryForm: FormGroup;
  submitted = false;
  currentUrl: any;
  batchId: any;
  fileTypeNotMatched: boolean;
  extension: any;
  showErrorMsg: string = '';
  D = new Date();
  currentDate: any =
    this.D.getDate() + '/' + this.D.getMonth() + '/' + this.D.getFullYear();
  file: any = '';
  instructionData: any = [];
  documentTableData: any = [];
  isAddMode: boolean = true;
  instructionId: String = "";
  userData: any;
  isShown: any;
  revisedList = [];
  containerList: Container[] = [];
  baseBody: BaseBody;
  siAttachmentName: any;
  siReceivedAttachmentName: any;
  filedAttachmentName: any;
  vgmAttachmentName: any;
  dgAttachmentName: any;
  uploadedFileName: string;
  uploadedFileName3: string
  firstPrintAttachmentName: any;
  finalPrintAttachmentName: any;
  callapseALL: boolean = false;
  expandKeys = "shippingDetails volumedetails Declarationdetails masterbldetails"
  expandKeys1 = "shippingDetails "
  @ViewChild('expand') expand: ElementRef;
  deliveryOrderList: any;
  batchDetails: Batch
  vesselList: Vessel[] = [];
  bookingCancel: any = false;
  vesseldataShipping: Voyage1[] = [];
  isApprovedSave: any = '';
  partyEmails: any = '';
  closeResult: string;
  bookingCancelArray: any = [];
  shipperDeatils: any;
  urlParam: any;
  isShow: boolean = false;
  disabledAttachment: boolean = true;
  canOpenBookingAccordion: boolean = true;
  isBookingPanelOpen: boolean = true;
  canOpenSICustomerAccordion: boolean = true;
  isSICustomerPanelOpen: boolean = false;
  canOpenVolumeAccordion: boolean = true;
  isVolumePanelOpen: boolean = false;
  canOpenDeclarationAccordion: boolean = true;
  isDeclarationPanelOpen: boolean = false;
  canOpenMasterBLDraftAccordion: boolean = true;
  isMasterBLDraftPanelOpen: boolean = false;
  canOpenMasterBLOriginalAccordion: boolean = true;
  isMasterBLOriginalPanelOpen: boolean = false;
  currentUrl1: string;
  show: boolean = false;
  id: any;
  type: any = '';
  eventData: any;
  public touchUi = false;
  public color = 'primary';
  public enableMeridian = true;
  todayDate = new Date()
  activeFright: any = 'ocean';
  vehicalList: any = [];
  flightList: any = [];
  submittedbooking: boolean = false;
  submittedSIForm: boolean = false;
  submittedVgm: boolean = false;
  submittedGoods: boolean = false;
  submittedblMasterDraft: boolean = false;
  submittedblMasterOriginal: boolean = false;
  constructor(
    private sortPipe: OrderByPipe,
    private _api: ApiService,
    public modalService: NgbModal,
    private batchService: BatchService,
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiSharedService,
    private formBuilder: FormBuilder,
    private datepipe:DatePipe,
    private commonfunction: CommonFunctions,
    private commonService: CommonService,
    private notification: NzNotificationService,
    private fb: FormBuilder,
    public loaderService: LoaderService,
    private cognito: CognitoService) {
    this.buildForm();
    // this.newenquiryForm = this.fb.group({
    //   finalVessel: [''], // or use default value if applicable
    //   // other form controls...
    // });
    this.route.params?.subscribe((params) => (this.urlParam = params));
    this.isShow = this.urlParam?.access == 'show' ? true : false;;
    this.route.params?.subscribe(params =>
      this.batchId = params.id,
    );
    // console.log(this.batchDetail,"this.batchDetails");
  }
  ngOnInit(): void {

    this.cognito.getagentDetails()?.subscribe((resp) => {
      if (resp != null) {
        this.userData = resp
      }
    })
    this.getEvent();
    this.getAir()
    this.getLand()
    this.getVesselListDropDown()
    this.getVoyage()
    this.getBatchList();
    this.getShippingInstru();
    this.getContainerData();
    this.getDeliveryOrderList()
    this.currentUrl = this.router.url.split('?')[0].split('/')[3]
    if (this.currentUrl === 'show') {
      this.newenquiryForm.disable();
      this.show = true
    }
    this.route.params?.subscribe((params) => (this.urlParam = params));
    this.type = this.route.snapshot?.queryParamMap.get('type')?.toString();
    this.batchId = this.route.snapshot?.params['id'];

    this.id = this.route.snapshot?.params['moduleId'];
  }
  async getAir() {
    let payload = this.commonService.filterList()
    payload.query = { status: true }
    await this._api
      .getSTList('air', payload)
      ?.subscribe((res: any) => {
        this.flightList = res?.documents;
      });
  }
  async getLand() {
    let payload = this.commonService.filterList()
    payload.query = { status: true }
    await this._api
      .getSTList('land', payload)
      ?.subscribe((res: any) => {
        this.vehicalList = res?.documents;
      });
  }
  navigateToNewTab() {
    const urlTree = this.router.createUrlTree(['/batch/list/add/' + this.route.snapshot.params['id'] + '/Container']);
    const url = this.router.serializeUrl(urlTree);
    const fullUrl = window.location.origin + url;
    window.open(fullUrl, '_blank');
    // console.log(fullUrl, "url");
  }

  disabledDate = (current: Date): boolean => {
    const yesterdayDate = new Date(this.todayDate);
   yesterdayDate.setDate(this.todayDate.getDate() - 1); 
    return current && current < yesterdayDate;
  }
  getEvent() {
    let payload: any = this.commonService.filterList()
    if (payload?.query) payload.query = {
      "entityId": this.batchId,
    };
    if (payload?.sort) payload.sort = {
      "asc": ['eventSeq'],
    };
    this.commonService.getSTList('event', payload)?.subscribe((data: any) => {
      this.eventData = data.documents
    })
  }
  async getVoyage() {
    let payload = this.commonService.filterList()
    payload.query = {
      status: true,
    }
    this.commonService
      .getSTList('vessel', payload)
      ?.subscribe((res: any) => {
        this.vesseldataShipping = res?.documents;
      });
  }

  getBatchList() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      batchId: this.batchId,
    }
    this.commonService.getSTList('batch', payload)
      ?.subscribe((data: any) => {
        this.batchDetails = data.documents[0];
        this.activeFright = this.batchDetail?.enquiryDetails?.basicDetails?.ShipmentTypeName?.toLowerCase()

        if (this.activeFright === 'air') {
          this.newenquiryForm.controls['flightNo'].setValidators(Validators.required)
          this.newenquiryForm.controls['flightNo'].updateValueAndValidity()
          this.newenquiryForm.controls['finalVessel'].clearValidators()
          this.newenquiryForm.controls['finalVessel'].updateValueAndValidity()
          this.newenquiryForm.controls['vehicleNo'].clearValidators()
          this.newenquiryForm.controls['vehicleNo'].updateValueAndValidity()
        } else if (this.activeFright === 'ocean') {
          this.newenquiryForm.controls['finalVessel'].setValidators(Validators.required)
          this.newenquiryForm.controls['finalVessel'].updateValueAndValidity()
          this.newenquiryForm.controls['flightNo'].clearValidators()
          this.newenquiryForm.controls['flightNo'].updateValueAndValidity()
          this.newenquiryForm.controls['vehicleNo'].clearValidators()
          this.newenquiryForm.controls['vehicleNo'].updateValueAndValidity()
        } else if(this.activeFright === 'land'){
          this.newenquiryForm.controls['vehicleNo'].setValidators(Validators.required)
          this.newenquiryForm.controls['vehicleNo'].updateValueAndValidity()
          this.newenquiryForm.controls['flightNo'].clearValidators()
          this.newenquiryForm.controls['flightNo'].updateValueAndValidity()
          this.newenquiryForm.controls['finalVessel'].clearValidators()
          this.newenquiryForm.controls['finalVessel'].updateValueAndValidity()
        }

        if (this.batchDetail?.statusOfBatch == 'Job Cancelled' || this.batchDetail?.statusOfBatch == 'Job Closed') {
          this.newenquiryForm.disable();
          this.isShow = true
          this.disabledAttachment = false
        }
        this.newenquiryForm.get('plannedVessel').setValue(this.batchDetails?.quotationDetails?.vesselId);
        this.newenquiryForm.get('backupVessel').setValue(this.batchDetails?.quotationDetails?.vesselId);
        this.newenquiryForm.get('finalVessel').setValue(this.batchDetails?.quotationDetails?.vesselId);
        this.newenquiryForm.get('flightNo').setValue(this.batchDetails?.quotationDetails?.flightId);
        this.newenquiryForm.get('vehicleNo').setValue(this.batchDetails?.quotationDetails?.vehicleId);
        this.partyEmailId(data.documents[0]?.enquiryDetails?.basicDetails?.bookingPartyId || data.documents[0]?.enquiryDetails?.basicDetails?.shipperId)
        this.getShipper(data.documents[0]?.enquiryDetails?.basicDetails?.bookingPartyId || data.documents[0]?.enquiryDetails?.basicDetails?.shipperId)
      });
  }
  getShipper(id) {
    let payload = this.commonService.filterList()
    payload.query = {
      "partymasterId": id
    }
    this.commonService
      .getSTList('partymaster', payload)?.subscribe((data: any) => {
        this.shipperDeatils = data.documents[0]
      })
  }
  getDeliveryOrderList() {
    this.containerList = [];
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      batchId: this.batchId,
    }
    this.commonService.getSTList('deliveryorder', payload)?.subscribe((res: any) => {
      this.deliveryOrderList = res?.documents;
    });
  }
  getVesselListDropDown() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      "status": true
    }
    this.commonService.getSTList("vessel", payload)?.subscribe((res: any) => {
      this.vesselList = res?.documents;
    });
  }
  sort(array, key) {
    return this.sortPipe.transform(array, key);
  }
  getShippingInstru() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      batchId: this.batchId,
    }
    if (payload?.sort) payload.sort = {
      desc: ['updatedOn']
    }
    setTimeout(() => {
      this.commonService.getSTList('instruction', payload)?.subscribe((res: any) => {
        if (res?.documents?.length > 0) {
          this.isAddMode = res ? false : true;
          this.instructionData = res?.documents;
          this.isApprovedSave = res?.documents[0]?.isApproved || ''
          this.revisedList = res?.documents[0]?.si?.siRevised
          this.bookingCancelArray = res?.documents[0]?.bookingCancelArray || []
          this.buildForm(res?.documents[0])
        }
      }
      );
    }, 800);
    this.getBatchById.emit();
  }
  get f() {
    return this.newenquiryForm.controls;
  }

  buildForm(data?) {
    this.instructionId = data?.instructionId;

    this.siAttachmentName = data?.si?.siAttachmentName;
    this.finalPrintAttachmentName = data?.mblOriginal?.finalAttachmentName;
    this.siReceivedAttachmentName = data?.si?.siReceivedAttachmentName;
    this.filedAttachmentName = data?.si?.filedAttachmentName;
    this.vgmAttachmentName = data?.vgm?.vgmAttachmentName;
    this.dgAttachmentName = data?.dg?.dgAttachmentName;
    this.firstPrintAttachmentName = data?.mblDraft?.firstPrintAttachmentName;

    if (data) {
      this.bookingCancel = data?.si?.bookingCancel
      if (this.batchDetail?.statusOfBatch == 'Job Cancelled' || this.batchDetail?.statusOfBatch == 'Job Closed') {
        this.bookingCancel = false
      }
    }
    this.newenquiryForm = this.formBuilder.group({
      cancelReson: [''],
      cancelRemark: [''],
      cancelDate: [''],
      plannedVessel: [data ? data?.plannedVesselId || this.batchDetails?.quotationDetails?.vesselId : this.batchDetails?.quotationDetails?.vesselId || ''],
      backupVessel: [data ? data?.backupVesselId || this.batchDetails?.quotationDetails?.vesselId : this.batchDetails?.quotationDetails?.vesselId || ''],
      finalVessel: [data ? data?.finalVesselId || this.batchDetails?.routeDetails?.finalVesselId : this.batchDetails?.routeDetails?.finalVesselId || ''],
      bookingNumber: [data ? data?.si?.bookingNumber : '', [Validators.required]],
      flightNo:[data ? data?.flightId ? data?.flightId : this.batchDetail?.quotationDetails?.flightId : ''],
      vehicleNo : [data ? data?.vehicleId ? data?.vehicleId : this.batchDetail?.quotationDetails?.vehicleId : ''],
      siCutOff: [data ? new Date(data?.si?.siCutOffDate) : '', [Validators.required]],
      gateCutOff: [data ? new Date(data?.si?.gateCutOff) : '', [Validators.required]],
      docCutOff: [data ? new Date(data?.si?.docCutOff) : '', [Validators.required]],
      bookingConfirmed: [data ? (data?.si?.bookingConfirmed || true) : true],
      siAttachment: [data ? data?.si?.siAttachment : ''],
      siAttachmentName: [data ? data?.si?.siAttachment : ''],
      siRemark: [data ? data?.si?.siRemark : ''],
      siMail: [data ? data?.si?.siMail || this.partyEmails : this.partyEmails || '', [Validators.required]],




      siReceived: [data ? data?.si?.siReceived : ''],
      siReceivedAttachment: [data ? data?.si?.siReceivedAttachment : ''],
      siReceivedAttachmentName: [data ? data?.si?.siReceivedAttachment : ''],
      siReceivedRemark: [''],
      siReceivedMail: [''],

      filedDate: [data ? data?.si?.filedDate : '', [Validators.required]],
      filedAttachment: [data ? data?.si?.filedAttachment : ''],
      filedAttachmentName: [data ? data?.si?.filedAttachment : ''],
      filedRemark: [data ? data?.si?.filedRemark : ''],
      instruction: [data ? data?.si?.instruction : ''],


      dgContainerNo: [data ? data?.dg?.containerNo : '', [Validators.required]],
      dgReceived: [data ? data?.dg?.receivedDate : ''],
      dgAttachment: [data ? data?.dg?.dgAttachment : ''],
      dgAttachmentName: [data ? data?.dg?.dgAttachment : ''],
      dgRemark: [data ? data?.dg?.remark : ''],
      doNumber: [data ? data?.dg?.deliveryOrderNo : ''],
      doDate: [data ? data?.dg?.doDate : ''],
      doEmail: [data ? data?.dg?.emailId || this.partyEmails : this.partyEmails || ''],

      firstPrint: [data ? data?.mblDraft?.firstPrintReceived : '', [Validators.required]],
      firstPrintAttachment: [data ? data?.mblDraft?.firstPrintAttachmentName : ''],
      firstPrintAttachmentName: [data ? data?.mblDraft?.firstPrintAttachmentName : ''],
      firstPrintRemark: [data ? data?.mblDraft?.firstPrintRemark : ''],
      firstPrintEmail: [data ? data?.mblDraft?.firstPrintEmailId || this.partyEmails : this.partyEmails || ''],

      approvedByCustomer: [data ? data?.mblDraft?.approvedByCustomer : false],
      rejectByCustomer: [data ? data?.mblDraft?.rejectByCustomer : false],

      finalPrint: [data ? data?.mblOriginal?.finalPrintReceived : '', [Validators.required]],
      finalPrintAttachment: [data ? this.finalPrintAttachmentName : ''],
      finalPrintAttachmentName: [data ? this.finalPrintAttachmentName : ''],
      finalPrintRemark: [data ? data?.mblOriginal?.finalPrintRemark : ''],
      finalPrintEmail: [data ? data?.mblOriginal?.finalPrintEmailId || this.partyEmails : this.partyEmails || ''],


      vgmArray: this.formBuilder.array([]),

      shipperAttachment: [''],
      shipperAttachmentName: [''],
    });


    if (data?.vgm) {
      data?.vgm.forEach(e => {
        this.addInputField(e)
      })
    }
  }

  get vgmArray(): FormArray {
    return this.newenquiryForm.get('vgmArray') as FormArray;
  }

  addInputField(data) {
    if (data) {
      this.vgmArray.push(this.newInput(data));
    }
    else {
      this.vgmArray.push(this.newInput(''));
    }
  }

  newInput(data?): FormGroup {

    return this.formBuilder.group({

      containerNo: [data ? data?.containerNo : '', [Validators.required]],
      vgmReceived: [data ? data?.vgmReceived : '', [Validators.required]],
      vgmAttachment: [data ? data?.vgmReceived : ''],
      vgmAttachmentName: [data ? data?.vgmAttachmentName : ''],
      vgmRemark: [data ? data?.vgmRemark : ''],
      vgmEmail: [data ? data?.vgmEmail || this.partyEmails : this.partyEmails || ''],
    })
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.newenquiryForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  toggleButton(panel: string) {
    switch (panel) {
      case 'booking':
        if (this.canOpenBookingAccordion) {
          this.isBookingPanelOpen = !this.isBookingPanelOpen;
        }
        break;
      case 'siCustomer':
        if (this.canOpenSICustomerAccordion) {
          this.isSICustomerPanelOpen = !this.isSICustomerPanelOpen;
        }
        break;
      case 'volume':
        if (this.canOpenVolumeAccordion) {
          this.isVolumePanelOpen = !this.isVolumePanelOpen;
        }
        break;
      case 'declaration':
        if (this.canOpenDeclarationAccordion) {
          this.isDeclarationPanelOpen = !this.isDeclarationPanelOpen;
        }
        break;
      case 'masterBLDraft':
        if (this.canOpenMasterBLDraftAccordion) {
          this.isMasterBLDraftPanelOpen = !this.isMasterBLDraftPanelOpen;
        }
        break;
      case 'masterBLOriginal':
        if (this.canOpenMasterBLOriginalAccordion) {
          this.isMasterBLOriginalPanelOpen = !this.isMasterBLOriginalPanelOpen;
        }
        break;
      default:
        console.error('Unknown panel:', panel);
    }
  }
  toggleAll(isExpand: boolean) {
    this.isBookingPanelOpen = isExpand;
    this.isSICustomerPanelOpen = isExpand;
    this.isVolumePanelOpen = isExpand;
    this.isDeclarationPanelOpen = isExpand;
    this.isMasterBLDraftPanelOpen = isExpand;
    this.isMasterBLOriginalPanelOpen = isExpand;
  }

  bookingListBtn(bookingList) {
    this.modalService
      .open(bookingList, {
        backdrop: 'static',
        keyboard: false,
        centered: true,
        size: 'lg',
        ariaLabelledBy: 'modal-basic-title',
      })
  }

  bookingBtn(booking) {
    this.modalService
      .open(booking, {
        backdrop: 'static',
        keyboard: false,
        centered: true,
        size: 'md',
        ariaLabelledBy: 'modal-basic-title',
      })
  }
  CancelReason() {
    this.newenquiryForm.get('cancelReson').clearValidators();
    this.newenquiryForm.get('cancelDate').clearValidators();
    this.newenquiryForm.get('cancelReson').updateValueAndValidity()
    this.newenquiryForm.get('cancelDate').updateValueAndValidity()
    this.modalService.dismissAll();
    this.submitted = false;
  }
  saveCancelReason() {
    // this.newenquiryForm.get('cancelReson').setValidators(Validators.required)
    // this.newenquiryForm.get('cancelReson').updateValueAndValidity()
    // this.newenquiryForm.get('cancelDate').setValidators(Validators.required)
    // this.newenquiryForm.get('cancelDate').updateValueAndValidity()
    this.submitted = true;
    // if (this.newenquiryForm.get('cancelReson').valid && this.newenquiryForm.get('cancelDate').valid) {
    let bookingCancel = {
      // bookingCancelReson: this.newenquiryForm.get('cancelReson').value,
      bookingCancelRemarks: this.newenquiryForm.get('cancelRemark').value,
      // bookingCancelDate: this.newenquiryForm.get('cancelDate').value,
      // bookingNumber: this.newenquiryForm.get('bookingNumber').value,
      // plannedVesselId: this.newenquiryForm.get('plannedVessel').value,
      // plannedVesselName: this.vesseldataShipping.filter(x => x.vesselId === this.newenquiryForm.get('plannedVessel').value)[0]?.vesselName,
      // backupVesselId: this.newenquiryForm.get('backupVessel').value,
      // finalVesselId: this.newenquiryForm.get('finalVessel').value,
      // finalVesselName: this.vesseldataShipping.filter(x => x.vesselId === this.newenquiryForm.get('finalVessel').value)[0]?.vesselName,
      // backupVesselName: this.vesseldataShipping.filter(x => x.vesselId === this.newenquiryForm.get('backupVessel').value)[0]?.vesselName,
    }
    // this.bookingCancelArray.push(bookingCancel)
    // this.submitted = false;
    this.modalService.dismissAll();
    // this.newenquiryForm.get('cancelReson').clearValidators();
    // this.newenquiryForm.get('cancelDate').clearValidators();
    // this.newenquiryForm.get('cancelReson').updateValueAndValidity()
    // this.newenquiryForm.get('cancelDate').updateValueAndValidity()
    // this.onSave(true)
    this.batchCancel()
    // } else {
    //   this.notification.create('error', 'Invalid form', '');
    // }
  }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
  onSave(evt?, form?, isApproved?) {
    // this.findInvalidControls()
    let MBLStatus: string = 'Pending Creation';
    let updateField: string = '';
    if (form == 'booking') {
      this.submittedbooking = true;
      updateField = 'Booking'
      if (this.newenquiryForm.get('siCutOff').invalid || 
      (this.activeFright == 'air' ? this.newenquiryForm.get('flightNo').invalid : this.activeFright == 'land' ? this.newenquiryForm.get('vehicleNo').invalid : this.newenquiryForm.get('finalVessel').invalid)||
      (this.activeFright !== 'air' && this.newenquiryForm.get('gateCutOff').invalid) ||
        this.newenquiryForm.get('docCutOff').invalid || 
        this.newenquiryForm.get('siMail').invalid) {
        this.notification.create('error', 'Please fill required fields', '');
        return false
      }
      // if (!evt && !this.newenquiryForm.get('bookingConfirmed').value) {
      //   return false
      // }
      if (this.newenquiryForm.get('bookingNumber').value) {
        this.commonService.UpdateToST(`batch/${this.batchDetails?.batchId}`, {
          ...this.batchDetails,
          cutoffdate: this.newenquiryForm.get('siCutOff').value, bookingNo: this.newenquiryForm.get('bookingNumber').value || ''
        })?.subscribe()
      }

    }
    if (form == 'SIForm') {
      this.submittedSIForm = true;
      MBLStatus = 'SI Filed';
      updateField = 'SI';
      if (this.newenquiryForm.get('filedDate').invalid) {
        this.notification.create('error', 'Please fill required fields', '');
        return false
      }
    }
    if (form == 'vgm') {
      this.submittedVgm = true;
      if (this.vgmArray?.status == "INVALID") {
        this.notification.create('error', 'Please fill required fields', '');
        return false
      }
    }
    if (form == 'goods') {
      this.submittedGoods = true;
      if (this.newenquiryForm.get('dgContainerNo').invalid) {
        this.notification.create('error', 'Please fill required fields', '');
        return false
      }
    }

    if (form == 'blMasterDraft') {
      this.submittedblMasterDraft = true;
      updateField = 'MBL-D';

      if (this.newenquiryForm.get('approvedByCustomer').value) {
        MBLStatus = 'First Draft Approved by Customer';
      } else if (this.newenquiryForm.get('rejectByCustomer').value) {
        MBLStatus = 'First Draft Rejected by Customer';
      } else {
        MBLStatus = 'First Draft Received from Carrier';
      }

      if (this.newenquiryForm.get('firstPrint').invalid) {
        this.notification.create('error', 'Please fill required fields', '');
        return false
      }
    }

    if (form == 'blMasterOriginal') {
      this.submittedblMasterOriginal = true;
      updateField = 'MBL-O';
      MBLStatus = 'Relese MBL';
      if (this.newenquiryForm.get('finalPrint').invalid) {
        this.notification.create('error', 'Please fill required fields', '');
        return false
      }
    }


    // if (!evt && !this.newenquiryForm.get('bookingConfirmed').value) {
    //   return false
    // }

    // return


    var parameter =
    {

      "tenantId": this.userData.tenantId,
      batchId: this.batchId,
      instrcutionType: "shipping",
      instructionId: this.instructionId,
      instrcutions: "",
      portId: "",
      portcallId: "",
      plannedVesselId: this.newenquiryForm.get('plannedVessel').value,
      plannedVesselName: this.vesseldataShipping.filter(x => x.vesselId === this.newenquiryForm.get('plannedVessel').value)[0]?.vesselName,
      backupVesselId: this.newenquiryForm.get('backupVessel').value||'',
      finalVesselId: this.newenquiryForm.get('finalVessel').value||'',
      finalVesselName: this.vesseldataShipping.filter(x => x.vesselId === this.newenquiryForm.get('finalVessel').value)[0]?.vesselName ||'',
      backupVesselName: this.vesseldataShipping.filter(x => x.vesselId === this.newenquiryForm.get('backupVessel').value)[0]?.vesselName||'',
      siCutOffDate: this.newenquiryForm.get('siCutOff').value,
      flightId: this.newenquiryForm.value.flightNo,
      vehicleId: this.newenquiryForm.value.vehicleNo,
      flightNo: this.flightList?.filter((x) => x.airId === this.newenquiryForm.value.flightNo)[0]?.flight || '',
      vehicleNo: this.vehicalList?.filter((x) => x.landId === this.newenquiryForm.value.vehicleNo)[0]?.vehicleLicence || '',
      si: {
        bookingNo: this.newenquiryForm.get('bookingNumber').value,
        bookingNumber: this.newenquiryForm.get('bookingNumber').value,
        siCutOffDate: this.newenquiryForm.get('siCutOff').value,
        gateCutOff: this.newenquiryForm.get('gateCutOff').value,
        docCutOff: this.newenquiryForm.get('docCutOff').value,
        bookingConfirmed: evt ? false : this.newenquiryForm.get('bookingConfirmed').value,
        siAttachment: this.newenquiryForm.get('siAttachment').value,
        siAttachmentName: decodeURIComponent(this.newenquiryForm.get('siAttachment').value),
        siRemark: this.newenquiryForm.get('siRemark').value,
        siMail: this.newenquiryForm.get('siMail').value,
        updateField: updateField || '',
        updateValue: MBLStatus || 'Pending Creation',
        filedDate: this.newenquiryForm.get('filedDate').value,
        filedAttachment: this.newenquiryForm.get('filedAttachment').value ? this.newenquiryForm.get('filedAttachment').value : "",
        filedAttachmentName: decodeURIComponent(this.newenquiryForm.get('filedAttachment').value),
        filedRemark: this.newenquiryForm.get('filedRemark').value,
        instruction: this.newenquiryForm.get('instruction').value,
        siRevised: this.revisedList,

        bookingCancel: evt ? false : this.newenquiryForm.get('bookingConfirmed').value
      },

      vgm: this.newenquiryForm.get('vgmArray').value,
      dg: {
        containerNo: this.newenquiryForm.get('dgContainerNo').value,
        receivedDate: this.newenquiryForm.get('dgReceived').value,
        remark: this.newenquiryForm.get('dgRemark').value,
        deliveryOrderNo: this.newenquiryForm.get('doNumber').value, 
        doDate: this.newenquiryForm.get('doDate').value,
        emailId: this.newenquiryForm.get('doEmail').value,
        dgAttachment: this.newenquiryForm.get('dgAttachment').value,
        dgAttachmentName: decodeURIComponent(this.newenquiryForm.get('dgAttachment').value),
      },
      // masterbl: {
      //   firstPrintReceived: this.newenquiryForm.get('firstPrint').value,
      //   firstPrintRemark: this.newenquiryForm.get('firstPrintRemark').value,
      //   firstPrintEmailId: this.newenquiryForm.get('firstPrintEmail').value,
      //   finalPrintReceived: this.newenquiryForm.get('finalPrint').value,
      //   finalPrintRemark: this.newenquiryForm.get('finalPrintRemark').value,
      //   finalPrintEmailId: this.newenquiryForm.get('finalPrintEmail').value,
      //   firstAttachment: this.newenquiryForm.get('firstPrintAttachment').value ? this.newenquiryForm.get('firstPrintAttachment').value : "",
      //   firstPrintAttachmentName: this.newenquiryForm.get('firstPrintAttachmentName').value,
      //   finalAttachment: this.newenquiryForm.get('finalPrintAttachment').value ? this.newenquiryForm.get('finalPrintAttachment').value : "",
      //   finalAttachmentName: this.newenquiryForm.get('finalPrintAttachmentName').value,
      // },
      mblDraft: {
        updatedField: "MBL-D",
        firstPrintReceived: this.newenquiryForm.get('firstPrint').value,
        firstPrintRemark: this.newenquiryForm.get('firstPrintRemark').value,
        firstPrintEmailId: this.newenquiryForm.get('firstPrintEmail').value,
        firstAttachment: this.newenquiryForm.get('firstPrintAttachment').value ? this.newenquiryForm.get('firstPrintAttachment').value : "",
        firstPrintAttachmentName: decodeURIComponent(this.newenquiryForm.get('firstPrintAttachment').value),
        approvedByCustomer: this.newenquiryForm.get('approvedByCustomer').value,
        rejectByCustomer: this.newenquiryForm.get('rejectByCustomer').value,

      },
      mblOriginal: {
        updatedField: "MBL-O",
        finalPrintReceived: this.newenquiryForm.get('finalPrint').value,
        finalPrintRemark: this.newenquiryForm.get('finalPrintRemark').value,
        finalPrintEmailId: this.newenquiryForm.get('finalPrintEmail').value,
        finalAttachment: this.newenquiryForm.get('finalPrintAttachment').value ? this.newenquiryForm.get('finalPrintAttachment').value : "",
        finalAttachmentName: decodeURIComponent(this.newenquiryForm.get('finalPrintAttachment').value),
      },

      "isApproved": isApproved ? isApproved : this.isApprovedSave || '',
      documents: [],
      status: true,
      remark: "",
      bookingCancelArray: this.bookingCancelArray || []
    }

    setTimeout(() => {
      const bookingNumber = this.newenquiryForm.get('bookingNumber').value;
    
      // Check if bookingNumber exists
      if (!bookingNumber) {
        this.notification.create('error', 'Booking number is required', '');
        return; // Exit the function if booking number is not present
      }
    
      if (this.isAddMode) {
        this.commonService.addToST('instruction', parameter)?.subscribe(
          (res: any) => {
            if (res) {
              if (isApproved) {
                this.notification.create('success', `${isApproved} Successfully`, '');
              } else {
                this.notification.create('success', 'Save Successfully', '');
              }
              this.reload();
            }
          },
          (error) => {
            this.notification.create('error', error?.error?.error?.message, '');
          }
        );
      } else {
        this.commonService.UpdateToST(`instruction/${this.instructionId}`, { ...parameter })?.subscribe(
          (res: any) => {
            if (res) {
              if (isApproved) {
                this.notification.create('success', `${isApproved} Successfully`, '');
              } else {
                if (evt) {
                  this.notification.create('success', 'Booking Cancelled Successfully', '');
                } else {
                  this.notification.create('success', 'Update Successfully', '');
                }
              }
              this.reload();
            }
          },
          (error) => {
            this.notification.create('error', error?.error?.error?.message, '');
          }
        );
      }
    
      // Reset the submitted flags after the API call
      this.submittedbooking = false;
      this.submittedSIForm = false;
      this.submittedVgm = false;
      this.submittedGoods = false;
      this.submittedblMasterDraft = false;
      this.submittedblMasterOriginal = false;
    
    }, 2500);
  }
  reload() {
    this.getShippingInstru();
    // this.getBatchList();
    // this.getEvent();
  }
  getContainerData() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      batchId: this.batchId,
    }
    this.commonService
      .getSTList('container', payload)?.subscribe((res: any) => {
        this.containerList = res?.documents;
      });
  }
  getFileExtension(filename: string): string {
    return filename.split('.').pop();
  }

  onFileSelected1(event, type, i) {
    const file = event.target.files[0];
    const fileName = file.name;

    this.showErrorMsg = type;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', fileName);

    this.commonService.uploadDocuments('uploadfile', formData)?.subscribe((res) => {
      this.vgmArray.at(i).get(`${type}`).setValue(`${res.name}`);
      this.vgmArray.at(i).get(`${type}Name`).setValue(decodeURIComponent(res.name));
    });
  }

  onFileSelected(event, type, index) {
    const file = event.target.files[0];
    let fileName = file?.name;

    this.showErrorMsg = type;
    this.uploadedFileName = fileName;
    this.uploadedFileName3 = fileName
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', fileName);

    this.commonService.uploadDocuments('uploadfile', formData)?.subscribe((res) => {
      this.newenquiryForm.get(type).setValue(res.name);
      const decodedName = decodeURIComponent(res.name);
      this.newenquiryForm.get(`${type}Name`).setValue(decodedName);
    });
  }

  getFileName(formValue) {
    const fileName = formValue ? formValue?.split('\\').pop() : 'test.pdf';
    return fileName;
  }


  async uploadDoc(formValue, type) {

    if (!this.newenquiryForm.get(formValue).value) {
      this.notification.create('error', 'Please upload the file!', '');
      return;
    }
    const formData = new FormData();

    if (!(this.newenquiryForm.get(formValue).value instanceof Blob)) {
      const blob = new Blob([this.newenquiryForm.get(formValue).value], { type: 'application/octet-stream' });
      formData.append('file', blob);
      formData.append('name', this.getFileName(this.newenquiryForm.get(formValue).value));
    } else {
      formData.append('file', this.newenquiryForm.get(formValue).value);
      formData.append('name', `${this.newenquiryForm.get(formValue).value.name}`);
    }
    // formData.append('file', this.file, `${this.file.name}`);
    // formData.append('name', `${this.file.name}`);
    this.commonService.uploadDocuments('uploadfile', formData).subscribe((res) => {
      if (res) {

        this.newenquiryForm.get(`${formValue}Name`).setValue(this.getFileName(this.newenquiryForm.get(formValue).value))
        // this.newenquiryForm.get(formValue).setValue(`${this.file.name}`);
        this.notification.create('success', 'Uploaded Successfully', '');
      }
      else {
        this.notification.create('error', 'Try again', '');
      }
    });
    // this.commonService.uploadFile(this.file, this.file.name, type); 
  }

  onClose(evt) {
    this.CloseNew.emit(evt);
    this.router.navigate(['/batch/list']);
  }
  openDate() {
    this.isShown = !this.isShown;
  }

  async emailSend(type, no, date, file, filename, remark?, dodate?, doNumber?) {
    const plannedVesselName = this.vesseldataShipping.find(x => x.vesselId === this.newenquiryForm.get('plannedVessel').value)?.vesselName;
    const finalVessel = this.vesseldataShipping.find(x => x.vesselId === this.newenquiryForm.get('finalVessel').value)?.vesselName;

    let subject = `Shipping Expense - ${this.newenquiryForm.get('bookingNumber').value}`;
    let emaildata = `Dear Sir/Madam, <br>
      Please find attached against Job No. ${this.batchDetails?.batchNo} 
      ${no} : ${this.newenquiryForm.get(no).value},
      ${date} : ${this.newenquiryForm.get(date).value ? this.datepipe.transform(this.newenquiryForm.get(date).value, 'dd-MM-yyyy') : ''}  <br>       
      Awaiting your early response <br>
      Regards, <br> SHIPEASY USER`;
  
    if (type == 'finalPrintEmail' || type == 'firstPrintEmail') {
      const shipmentType = this.batchDetail?.enquiryDetails?.basicDetails?.ShipmentTypeName;
      
      if (shipmentType === 'Air') {
        subject = `AWB MBL  ${type == 'firstPrintEmail' ? 'Draft Received' : 'Original Received'}`;
        emaildata = `Dear Sir/Madam, <br>
          Please find attached AWB MBL ${type == 'firstPrintEmail' ? 'Draft Received' : 'Original Received'} against Job No. ${this.batchDetails?.batchNo}
          Date: ${this.datepipe.transform(this.newenquiryForm.get('finalPrint').value || this.newenquiryForm.get('firstPrint').value, 'dd-MM-yyyy') || ''} <br>
          Awaiting your early response <br> Regards, <br> SHIPEASY USER`;
      } else if (shipmentType === 'Ocean') {
        subject = `Master BL ${type == 'firstPrintEmail' ? 'Draft Received' : 'Original Received'} `;
        emaildata = `Dear Sir/Madam, <br>
          Please find attached Master BL ${type == 'firstPrintEmail' ? 'Draft Received' : 'Original Received'} against Job No. ${this.batchDetails?.batchNo}
          Date: ${this.datepipe.transform(this.newenquiryForm.get('finalPrint').value || this.newenquiryForm.get('firstPrint').value, 'dd-MM-yyyy') || ''} <br>
          Awaiting your early response <br> Regards, <br> SHIPEASY USER`;
      }
    } else if (type === 'siMail') {
      const shipmentType = this.batchDetail?.enquiryDetails?.basicDetails?.ShipmentTypeName;
      subject = `SI Booking - ${this.newenquiryForm.get('bookingNumber').value}`;
      
      let vesselDetails = '';
      let gateCutOff = this.newenquiryForm.get('gateCutOff').value
        ? this.datepipe.transform(this.newenquiryForm.get('gateCutOff').value, 'dd-MM-yyyy, hh:mm')
        : '';

      if (shipmentType === 'Ocean') {
        vesselDetails = `
        Final Vessel: ${finalVessel} <br>
        Planned Vessel: ${plannedVesselName} <br>
        Gate CutOff: ${gateCutOff} <br>`;
      }
    
      emaildata = `Dear Sir/Madam,<br><br>
        Please find attached SI Booking copy against Job No. ${this.batchDetails?.batchNo} <br>
        Booking No. -  ${this.newenquiryForm.get(no).value} <br>
        ${vesselDetails}
        Si CutOff : ${this.newenquiryForm.get('siCutOff').value ? this.datepipe.transform(this.newenquiryForm.get('siCutOff').value, 'dd-MM-yyyy, hh:mm') : ''} <br> 
        Doc CutOff : ${this.newenquiryForm.get('docCutOff').value ? this.datepipe.transform(this.newenquiryForm.get('docCutOff').value, 'dd-MM-yyyy, hh:mm') : ''} <br> 
        Remark : ${this.newenquiryForm.get('siRemark').value}  <br><br>   
        Awaiting your early response <br><br> 
        Regards, <br> SHIPEASY TEAMS`;
    } else if (type === 'siReceivedMail') {
      subject = `SI Form Customer `;
      emaildata = `Dear Sir/Madam,<br><br>
        Please find attached SI Form Customer copy against Job No. ${this.batchDetails?.batchNo} <br> 
        Si CutOff : ${this.newenquiryForm.get('siCutOff').value ? this.datepipe.transform(this.newenquiryForm.get('siCutOff').value, 'dd-MM-yyyy, hh:mm') : ''} <br> 
        SI cutoff Revised Date : ${this.newenquiryForm.get('siReceived').value ? this.datepipe.transform(this.newenquiryForm.get('siReceived').value, 'dd-MM-yyyy, hh:mm') : ''} <br> 
        Remark : ${this.newenquiryForm.get('siReceivedRemark').value}  <br><br>   
        Awaiting your early response <br><br> 
        Regards, <br> SHIPEASY TEAMS`;
    } else if (type === 'doEmail') {
      subject = `Dangerous Goods Declaration `;
      emaildata = `Dear Customer, <br><br>
        Please find attached Dangerous Goods Declaration copy against Job No. -  ${this.batchDetails?.batchNo}.<br>
        Container No. - ${this.newenquiryForm.get(no).value},<br>
        Date : ${this.datepipe.transform(this.newenquiryForm.get(date).value, 'dd-MM-yyyy') || ''},<br>
        HAZ Approval NO : ${this.newenquiryForm.get(doNumber).value}.<br><br>       
        Awaiting your early response <br><br>
        Regards, <br> SHIPEASY USER`;
    }
  
    if (!this.newenquiryForm.get(type).valid) {
      return false;
    }
  
    const email = this.newenquiryForm.get(type).value?.replace(/\s/g, '');
    const emailList = email.split(';');
    const emails = emailList.map(e => ({ email: e }));
  
    const payload = {
      sender: {
        name: this.userData?.userName,
        email: this.userData?.userEmail
      },
      to: emails,
      batchId: this.batchId,
      textContent: emaildata,
      subject: subject,
      attachment: []
    };
  
    if (this.newenquiryForm.get(file).value) {
      const blob = new Blob([this.newenquiryForm.get(file).value], { type: 'application/octet-stream' });
      payload.attachment.push({
        name: this.newenquiryForm.get(file).value
      });
    }
  
    this.loaderService.showcircle();
    this.batchService.sendEmail(payload)?.subscribe(
      (res) => {
        if (res.status === "success") {
          this.notification.create('success', 'Email Sent Successfully', '');
        this.newenquiryForm.get(file)?.reset();       // Reset file field
        this.newenquiryForm.get(filename)?.reset();   // Reset filename field

        // Optional: Reset other related fields
        this.uploadedFileName = '';
        this.uploadedFileName3 = '';
        } else {
          this.notification.create('error', 'Email not Sent', '');
        }
        this.loaderService.hidecircle();
      }
    );
  
    if (type === 'siReceivedMail') {
      this.isShown = false;
  
      const data = {
        bookingNo: this.newenquiryForm.get(no).value,
        siRevised: this.newenquiryForm.get(date).value || '',
        remark: this.newenquiryForm.get(remark).value,
        emailId: this.newenquiryForm.get(type).value,
        attachment: decodeURIComponent(this.newenquiryForm.get('siReceivedAttachment').value),
      };
      this.revisedList = [...this.revisedList, data];
    }
  }

  baseConvert(blob, filename): Promise<any> {
    return new Promise((resolve, reject) => {

      let attachment;
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => {
        attachment = [{ "content": reader.result, "name": filename }]
      };

      setTimeout(() => {
        resolve(attachment);
      }, 2000); // Simulating a delay
    });
  }

  disabledEtaDate = (current: Date): boolean => {
    if (!this.batchDetails?.createdOn)
      return false
    if (this.newenquiryForm.controls['filedDate'].value) {
      return current >= new Date(this.newenquiryForm.controls['filedDate'].value);
    }
    else
      return differenceInCalendarDays(new Date(current), new Date(this.batchDetails?.createdOn)) < 0;
  };
  disabledFieldDate = (current: Date): boolean => {
    if (!current || !this.newenquiryForm.controls.siCutOff.value) {
      return false;
    }
    return current.getTime() < this.newenquiryForm.controls.siCutOff.value.getTime();
  };
  disabledStartDateForEnquiryValidDate = (startValue: Date) => {
    if (!startValue || !this.newenquiryForm.controls.siReceived.value) {
      return false;
    }
    return startValue.getTime() > this.newenquiryForm.controls.siReceived.value.getTime();
  };

  disabledEndDateForEnquiryValidDate = (endValue: Date) => {
    if (!endValue || !this.newenquiryForm.controls.siCutOff.value) {
      return false;
    }
    return endValue.getTime() <= this.newenquiryForm.controls.siCutOff.value.getTime();
  };
  disableEmail(type, i) {
    if (i && i >= 0) {
      if (this.vgmArray.at(i).get(type).valid) {
        return false;
      } else {
        return true;
      }
    }

    if (!i && this.newenquiryForm.get(type)) {
      if (this.newenquiryForm.get(type).valid) {
        return false;
      } else {
        return true;
      }
    }

  }
  disableAdvise() {
    // this.newenquiryForm.get('bookingNumber').value &&
    if (
      this.newenquiryForm.get('siCutOff').value) {
      return false;
    } else {
      return true;
    }
  }

  async emailSemd1(type, no, date, file, filename, remark?, i?) {
    let emaildata =
      `Dear Sir/Madam, <br>
      Please find attached VGM copy against Job No. ${this.batchDetails?.batchNo} <br>
      Container No.: ${this.vgmArray.at(i).get(no).value}, <br>
      ${date} :${this.datepipe.transform(this.vgmArray.at(i).get(date).value, 'dd-MM-yyyy') || ''} <br>
      ${remark}: ${this.vgmArray.at(i).get(remark).value}  <br>       
      Awaiting for your early response <br>
      Regards, <br> SHIPEASY USER`;
  
    if (this.vgmArray.at(i).status !== 'VALID') {
      this.notification.create('error', 'Please fill all required fields', '');
      return false;
    }
  
    // Prepare email addresses
    var email = this.vgmArray.at(i).get(type).value?.replace(/\s/g, '');
    var emailList = email.split(';');
    var emails = [];
    emailList.forEach((e) => {
      emails.push({ email: e });
    });
  
    // Define the payload without the attachment initially
    let payload: any = {
      sender: {
        name: this.userData?.userName,
        email: this.userData?.userEmail
      },
      to: emails,
      batchId: this.batchId,
      textContent: `${emaildata}`,
      subject: `VGM`
    };
  
    // Check if the file exists and add it to the payload
    if (this.vgmArray.at(i).get(file).value) {
      const blob = new Blob([this.vgmArray.at(i).get(file).value], { type: 'application/octet-stream' });
      let attachment = await this.baseConvert(blob, this.vgmArray.at(i).get(filename).value);
  
      // Add the attachment to the payload
      payload.attachment = [{
        name: this.vgmArray.at(i).get(file).value
      }];
    }
  
    // Send the email, attachment is optional
    this.batchService.sendEmail(payload)?.subscribe(
      (res) => {
        if (res.status == "success") {
          this.notification.create('success', 'Email Sent Successfully', '');
        } else {
          this.notification.create('error', 'Email not Sent', '');
        }
      },
      (error) => {
        this.notification.create('error', 'Error occurred while sending email', '');
      }
    );
  }
  async uploadDoc1(formValue, type, i) {
    const formData = new FormData();
    // formData.append('file', this.file, `${this.file.name}`);
    // formData.append('name', `${this.file.name}`);

    if (!(this.vgmArray.at(i).get(`${formValue}`).value instanceof Blob)) {
      const blob = new Blob([this.vgmArray.at(i).get(`${formValue}`).value], { type: 'application/octet-stream' });
      formData.append('file', blob);
      formData.append('name', this.getFileName(this.vgmArray.at(i).get(`${formValue}`).value));
    } else {
      formData.append('file', this.vgmArray.at(i).get(`${formValue}`).value);
      formData.append('name', `${this.vgmArray.at(i).get(`${formValue}`).value.name}`);
    }


    var data = await this.commonService.uploadDocuments('uploadfile', formData)?.subscribe((res) => {
      if (res) {
        this.vgmArray.at(i).get(`${formValue}Name`).setValue(this.getFileName(this.vgmArray.at(i).get(`${formValue}`).value))
        // this.vgmArray.at(i).get(formValue).setValue(`${this.file.name}`);
        this.notification.create('success', 'Uploaded Successfully', '');
      }
      else {
        this.notification.create('error', 'Upload try again', '');
      }
    });
    // var data = await this.commonService.uploadFile(this.file, this.file.name, type);

  }
  filterBody = this._api?.body;
  emailApprove() {
    let siData = this.instructionData[0];
    let tankNo = siData?.vgm?.map((x, index) => {
      return x?.containerNo
    })

    let payload = this.commonService.filterList()
    payload.query = {
      "partymasterId": this.batchDetails?.enquiryDetails?.basicDetails?.shipperId
    }

    this.commonService.getSTList("partymaster", payload)?.subscribe((res) => {
      if (res) {
        let payload = {
          "to": [
            {
              name: res.documents[0].name,
              email: res.documents[0].primaryMailId,
            }
          ],
          sender: {
            name: this.userData?.userName,
            email: this.userData?.userEmail
          },
          batchId: this.batchId,
          textContent: `Dear Sir/Madam, <br>
              Please find attached Draft BL copy against Move No. ${this.batchDetails?.moveNo} Job No. ${this.batchDetails?.batchNo}
              Carrier Booking No. ${siData?.si?.bookingNo} - TANK NO ${tankNo?.toString()} 
              Vessel : ${siData?.finalVesselName}  <br>   
              Please Check and assist to relese service BL Immediately after sailing of Vessel. <br>     
              Awaiting for your early response <br>
              Regards, <br> SHIPEASY USER`,

          subject: `Service BL DRAFT FOR SLOT OPERATOR, TANK NO -${tankNo?.toString()} MOVE NO.- ${this.batchDetails?.moveNo}. CARRIER BOOKING NO.${siData?.si?.bookingNo},  SLOT OPERATOR NAME - ${res.documents[0].name}`,



        }
        this.batchService.sendEmail(payload)?.subscribe(
          (res) => {
            if (res.status == "success") {
              this.notification.create('success', 'Email Sent Successfully!', '');
            }
            else {
              this.notification.create('error', 'Temporarily unavailable', '');
            }
            this.modalService.dismissAll();
          }
        );


        return false
      }
    });
  }

  partyEmailId(id) {
    let payload = this.commonService.filterList()
    payload.query = {
      "partymasterId": id
    }
    this.commonService.getSTList("partymaster", payload)?.subscribe((res) => {
      if (res) {
        this.partyEmails = res.documents[0].primaryMailId;
        this.newenquiryForm.get('siMail').setValue(this.instructionData[0]?.si?.siMail || this.partyEmails);
        this.newenquiryForm.get('siReceivedMail').setValue(this.partyEmails);
        this.newenquiryForm.get('doEmail').setValue(this.instructionData[0]?.dg?.emailId || this.partyEmails);
        this.newenquiryForm.get('firstPrintEmail').setValue(this.instructionData[0]?.mblDraft?.firstPrintEmailId || this.partyEmails);
        this.newenquiryForm.get('finalPrintEmail').setValue(this.instructionData[0]?.mblOriginal?.finalPrintEmailId || this.partyEmails);
      }
    })
  }
  async shipperUploadFile(event, type) {
    this.file = event.target.value.replace('C:\\fakepath\\', '');

    this.extension = this.file.substr(this.file.lastIndexOf('.'));
    this.showErrorMsg = type;
    if (
      this.extension?.toLowerCase() === '.xls' ||
      this.extension?.toLowerCase() === '.xlsx'
    ) {
      this.fileTypeNotMatched = false;
      this.file = event.target.files[0];

      const formData = new FormData();
      formData.append('file', this.file, `${this.file.name}`);
      formData.append('name', `${this.file.name}`);
      var data = await this.commonService.uploadDocuments('uploadfile', formData)?.subscribe();
      // var data = await this.commonService.uploadFile(this.file, this.file.name, type);
      if (data) {
        this.newenquiryForm.get(`${type}Name`).setValue(`${this.file.name}`)
        this.newenquiryForm.get(type).setValue(`${this.file.name}`);
      }
    } else {
      this.notification.create('error', 'Invalid File', '');
    }
  }

  sendShipperEmail(shipperUpload): void {
    this.modalService
      .open(shipperUpload, {
        backdrop: 'static',
        keyboard: false,
        centered: true,
        size: 'md',
        ariaLabelledBy: 'modal-basic-title',
      })
    let storebatchData = [];
    this.instructionData?.map((row: any) => {
      storebatchData.push({
        "Shipper": this.batchDetails?.shipperName,
        "Shipper Address": '',
        "Consignee": this.batchDetails?.consigneeName,
        "Type of BL (Customer) (Orignal/Seaway)": '',
        "Notify Party 1": this.batchDetails?.notifyPartyName,
        "Notify party 2": '',
        "Vessel": this.batchDetails?.routeDetails?.finalVesselName ? this.batchDetails?.routeDetails?.finalVesselName : this.batchDetails?.plannedVesselName,
        "Voyage No": this.batchDetails?.routeDetails?.finalVoyageName ? this.batchDetails?.routeDetails?.finalVoyageName : this.batchDetails?.plannedVoyageName,
        "Port of Loading": this.batchDetails?.enquiryData?.loadPortName,
        "Port of Discharge": this.batchDetails?.enquiryData?.destPortName,
        "Place of Receipt": '',
        "Place of Delivery": this.batchDetails?.enquiryData?.[0].onCarriageName,
        "Load Place": this.batchDetails?.enquiryData?.loadPlaceName,
        "Shipping Marks": '',
        "Container Nos Marks & Number ": '',
        "Seal No": '',
        "Number and kind of Packages": '',
        "Description of goods": '',
        "Product Name": this.batchDetails?.productName,
        "PO Number ": this.batchDetails?.poNo,
        "SB No": '',
        "Net Wt": '',
        "Tare Wt": '',
        "Gross Weight": '',
        "Total No of Packages": '',
        "Total Weight": '',
        "Freight Term": this.batchDetails?.freightTerms,

      });
    });
    const myworksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(storebatchData);
    const myworkbook: XLSX.WorkBook = {
      Sheets: { data: myworksheet },
      SheetNames: ["data"],
    };
    const fileName = `SI-${this.instructionData[0]?.si?.bookingNo}.xlsx`;
    /* save to file */ XLSX.writeFile(myworkbook, fileName);
  }
  async sendToShipper() {
    let siData = this.instructionData[0];
    let tankNo = siData?.vgm?.map((x, index) => {
      return x?.containerNo
    })
    const blob = new Blob([this.newenquiryForm.get('shipperAttachment').value], { type: 'application/octet-stream' });

    let attachment = await this.baseConvert(blob, this.newenquiryForm.get('shipperAttachmentName').value);

    let payload = {
      sender: {
        name: this.userData?.userName,
        email: this.userData?.userEmail
      },
      to: [{
        name: this.shipperDeatils?.name,
        email: this.shipperDeatils?.primaryMailId,
      }],
      batchId: this.batchId,
      textContent: `Dear Sir/Madam, <br>
      Please check and provide SI copy against  Move No. ${this.batchDetails?.moveNo} Job No. ${this.batchDetails?.batchNo}
       Carrier Booking No. ${siData?.si?.bookingNo} - TANK NO ${tankNo?.toString()} 
       Vessel : ${siData?.finalVesselName} at the earliest, 
       enabling us to check / generate and forward draft SHIPEASY BL to your registered
      email id for necessary approval. <br>
      Awaiting for your early response. `,
      subject: `PENDING SI TANK NO.-${tankNo?.toString()}  MOVE NO.- ${this.batchDetails?.moveNo} CARRIER BOOKING NO-${siData?.si?.bookingNo}. SHIPPER NAME AND POL AND POD`,
      attachment: [{
        name: this.newenquiryForm.get('shipperAttachmentName').value
      }]
    }
    if (this.newenquiryForm.get('shipperAttachment').value) {
      this.batchService.sendEmail(payload)?.subscribe(
        (res) => {
          if (res.status == "success") {
            this.notification.create('success', 'Email Sent Successfully!', '');
          }
          else {
            this.notification.create('error', 'Email not Send', '');
          }
          this.modalService.dismissAll();
        }
      );
    }
    else {
      this.notification.create('error', 'Attachment is required!', '');
    }
  }
  removeConatiner(i) {
    const itemsArray = this.newenquiryForm.get('vgmArray') as FormArray;
    itemsArray.removeAt(i);
  }

  batchCancel() {
    let payload = { ...this.batchDetails, statusOfBatch: 'Inquiry Accepted', remarks: this.newenquiryForm.get('cancelRemark').value }
    this._api.UpdateToST(`batch/${this.batchDetails?.batchId}`, payload).subscribe((res: any) => {
      if (res) {
        this._api.UpdateToST(`enquiry/${this.batchDetails?.enquiryId}`,{enquiryStatus:"Inquiry Accepted"}).subscribe(() => {})
        this.notification.create(
          'success',
          'Job Cancelled Successfully',
          ''
        );
        this.router.navigate(['/batch/list']);
      }
    },
      error => {
        this.notification.create(
          'error',
          error?.error?.error?.message,
          ''
        );
      });
  }
  downnloadEdi(ediName,instructionId){
    this._api.getEdi(ediName, instructionId).subscribe((res: ArrayBuffer) => {
      const blob = new Blob([res], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        if(ediName==="bookingconfirmation"){
        a.download = 'bookingConfirmation.edi'; 
        }else        if(ediName==="bookingrequest"){
        a.download = 'bookingRequest.edi'; 
        }
        else if(ediName==="shippinginstruction"){
        a.download = 'shippingInstruction.edi'; 
        }
        else{
          a.download = 'vgm.edi';
        }
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      (error) => {
        console.error('Error downloading file:', error);
      }
    );
  }
}



