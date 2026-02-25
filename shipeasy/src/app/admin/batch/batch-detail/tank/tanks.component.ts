import { AfterViewChecked, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ContainerComponent } from 'src/app/shared/components/tank/container/container.component';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseBody } from 'src/app/admin/smartagent/base-body';
import * as Constant from 'src/app/shared/common-constants';
import { ApiService } from 'src/app/admin/principal/api.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { differenceInCalendarDays } from 'date-fns';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DeliveryOrderComponent } from 'src/app/shared/components/tank/delivery-order/delivery-order.component';
import { AddContainerComponent } from './add-container/add-container.component';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { DatePipe } from '@angular/common'
import { OrderByPipe } from 'src/app/shared/util/sort';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { CommonService } from 'src/app/services/common/common.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { uom } from 'src/app/models/uom';
import { SystemType } from 'src/app/models/system-type';
import { ConatinerTrackComponent } from './container-track/container-track.component';
import { SharedEventService } from 'src/app/shared/services/shared-event.service';

@Component({
  selector: 'app-tanks',
  templateUrl: './tanks.component.html',
  styleUrls: ['./tanks.component.scss'],
})
export class TankComponent implements OnInit, OnChanges, AfterViewChecked, OnDestroy {
  ngOnDestroy() {
  }
  @Input() isConsolidate;
  @Input() consolidationbooking;
  submitted: boolean;
  tankData = [];
  isNew: boolean = false;
  batchId: any;
  baseBody: any;
  toalLength: any;
  size = 500;
  page = 1;
  count = 0;
  fromSize: number = 1;
  toSize: number = this.size;
  BatchContainer: FormGroup;
  statusList: any = [];
  packageList: any = [];
  cargoTypeList: SystemType[] = [];
  imoTypeList: any = [];
  index: any;
  batchDetail: any;
  voyageList: any;
  batchType: any = '';
  containerData: any;
  isDuplicate: boolean = false;
  isClose:boolean=true;
  isExport: boolean = false;
  addContainerForm: FormGroup;
  customerList: any = [];
  yardList: any = [];
  listContainer: any = [];
  containerIndex: any;
  isRequird: boolean = false;
  containerDate: string = '';
  containerDateName: any = '';
  unitList: uom[] = []
  tenantId: any;
  urlParam: any;
  isShow: boolean = false;
  todayDate = new Date();
  isTransport: boolean;
  isImport: boolean;
  deliveryDate: any;
  id: any;
  constructor(
    private sharedEventService: SharedEventService,
    private tranService: TransactionService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private notification: NzNotificationService,
    private Formbuilder: FormBuilder,
    private _api: ApiService,
    private router: Router,
    public datepipe: DatePipe,
    private sortPipe: OrderByPipe,
    private cdr: ChangeDetectorRef,
    private commonfunction: CommonFunctions, private cognito: CognitoService,
    private commonService: CommonService
  ) {
    this.isExport = localStorage.getItem('isExport') === 'true' ? true : false;
    this.isImport = localStorage.getItem('isImport') === 'true' ? true : false;
    this.isTransport = localStorage.getItem('isTransport') === 'true' ? true : false;
    this.batchId = this.route.snapshot.params['id'];
    this.route.params?.subscribe((params) => (this.urlParam = params));
    this.isShow = this.urlParam?.access == 'show' ? true : false;
    this.getBatchById();
    this.getContainerList();
    this.formContainer();
    this.getLocation();
    this.getPartyMaster();
    this.getContainer();
    this.getunitList();
  }
  getunitList() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      "status": true
    }
    this.commonService
      .getSTList('uom', payload)
      ?.subscribe((res: any) => {
        this.unitList = res?.documents
      });
  }
  formContainer() {
    this.addContainerForm = this.Formbuilder.group({
      containerNo: ['', [Validators.required]],
      customerName: [''],
      status: ['', [Validators.required]],
      date: ['', [Validators.required]],
      remarks: [''],
      yard: ['', [Validators.required]]
    });
  }


  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.BatchContainer = this.Formbuilder.group({
      BatchContainerArray: this.Formbuilder.array([]),
    });
    this.getSystemTypeDropDowns();
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.tenantId = resp.tenantId
      }
    })
  }
  getSystemTypeDropDowns() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      typeCategory: {
        "$in": ['cargoType', 'imoType', 'status', 'packageType']
      },
      "status": true
    }
    this._api
      .getSTList('systemtype', payload)
      ?.subscribe((res: any) => {
        this.cargoTypeList = res?.documents.filter(
          (x) => x.typeCategory === 'cargoType'
        );
        this.imoTypeList = res?.documents.filter(
          (x) => x.typeCategory === 'imoType'
        );
        this.statusList = res?.documents.filter(
          (x) => x.typeCategory === 'status'
        );
        this.packageList = res?.documents.filter(
          (x) => x.typeCategory === 'packageType'
        );
      });
  }
  getStatusMasterDropDown() {
    let payload = this.commonService.filterList()
    payload.query = {}
    this._api
      .getSTList('status', payload)
      ?.subscribe((res: any) => {
        this.statusList = res?.documents;
      });
  }
  ngOnChanges() {
    this.getContainerList()
  }

  getContainerList() {
    if (!this.batchId)
      return false
    this.BatchContainer = this.Formbuilder.group({
      BatchContainerArray: this.Formbuilder.array([]),
    });
    this.page = 1;


    let payload = this.commonService.filterList()
    if(this.isConsolidate){
      payload.query = {
        $or: [{
          "consolidationBookingId": {
            "$in": [this.route.snapshot.params['id']]
          }
        }, {
          "batchwiseGrouping.batchId": {
            "$in": [this.route.snapshot.params['id']]
          }
        }]
      }
    }else{
      payload.query = {
        $or: [{
          "batchId": {
            "$in": [this.route.snapshot.params['id']]
          }
        }, {
          "batchwiseGrouping.batchId": {
            "$in": [this.route.snapshot.params['id']]
          }
        }]
      }
    }
 


    // if (this.isConsolidate) {
    //   const batchIds = this.consolidationbooking?.batchwiseGrouping?.map((bt) => { return { "batchId": bt?.batchId } });
    //   if (payload?.query) payload.query = { $or: batchIds }
    // }

    payload.size = Number(this.size),
      payload.from = this.page - 1,

      this._api
        .getSTList(Constant.CONTAINER_LIST, payload)
        ?.subscribe((data: any) => {
          this.tankData = data.documents;

          this.tankData?.forEach((container) => {
            const BatchContainerArrayList = this.BatchContainer.get('BatchContainerArray')?.value ?? [];
            if (!BatchContainerArrayList?.find(container => container?.containerId === container.containerId) || !this.isConsolidate) {
              (<FormArray>this.BatchContainer.get('BatchContainerArray')).push(
                this.Formbuilder.group({
                  batchwiseGrouping : container.batchwiseGrouping || [],
                  consolidationBookingId: container.consolidationBookingId || "",
                  consolidationbookingNo:container.consolidationbookingNo || "",
                  containerId: container.containerId,
                  mastercontainerId: container.mastercontainerId,
                  containerNumber: container.containerNumber,
                  containerTypeId: container.containerTypeId,
                  containerType: container.containerType,
                  imoType: [container.imoType,],
                  isoContainerCode: container.isoContainerCode,
                  netWeight: container.netWeight || "0.00",
                  package: container?.package || "0.00",
                  packageType: container?.packageType || " ",
                  grossWeight: container.grossWeight || "0.00",
                  cbm: container.cbm || "0.00",
                  tareWeight: container.tareWeight || "0.00",
                  unit: container?.unit|| 'KG',
                  unitGross: container?.unitGross || 'KG',
                  rfidNo: container?.rfidNo,
                  sealNo: container.sealNo,
                  cargoTypeId: [
                    (this.isExport || this.isTransport) ? this.batchDetail?.cargoType : container.cargoTypeId,

                  ],
                  evgmNumber: container.evgmNumber,
                  evgmDate: container.evgmDate || '',
                  blNumber: container.blNumber,
                  blDate: [container.blDate,],
                  notifyCustomer: [false],
                  shippingBillNumber: [
                    container.shippingBillNumber,

                  ],
                  sbNo: container.sbNo,
                  sbDate: container.sbDate,
                  isSobEmail: false,
                  bondNumber: container.bondNumber,
                  igmNumber: container.igmNumber,
                  statusId: [container.statusFlagId,],
                  depotOut: container.depotOut,
                  depoIn: container.depotDate || '',
                  depotDate: container.depotDate || null,
                  depotDateName: container.depotDateName || '',
                  depoInName: container?.depoInName || '',
                  icdIn: container.icdIn,
                  icdInName: container.icdInName || '',
                  icdOut: container.icdOut,
                  icdOutName: container.icdOutName || '',
                  factoryIn: container.factoryIn,
                  factoryInName: container.factoryInName || '',
                  factoryOut: container.factoryOut,
                  factoryOutName: container.factoryOutName || '',
                  terminalIn: container.terminalIn,
                  terminalInName: container.terminalInName || '',
                  terminalOut: container.terminalOut,
                  customsCheck: container?.customsCheck || '',
                  terminalOutName: container.terminalOutName || '',
                  cfsIn: container.cfsIn,
                  cfsOut: container.cfsOut,
                  railOut: container.railOut,
                  mtyValidity: container.mtyValidity,
                  mtyReturn: container.mtyReturn,
                  dischargeDate: container.dischargeDate,
                  reject: container.reject,
                  rejectName: container.rejectName || '',
                  sobDate: [container.sobDate,],
                  arrivalDate: container.arrivalDate,
                  deliveryDate: container.deliveryDate,
                  containerHeight: container.containerHeight || ''
                })
              );
            }
          });
          this.toalLength = data.totalCount;
          this.count = data.documents.length;
        });
  }
  DeleteContainer(deletecontainer, containerId: any, index?) {

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
            (this.BatchContainer.get('BatchContainerArray') as FormArray).removeAt(index);

            if (containerId) {
              let deleteBody = Constant.CONTAINER_LIST + '/' + containerId
              this.commonService.deleteST(deleteBody)?.subscribe((data) => {
                if (data) {
                  this.notification.create('success', 'Deleted Successfully', '');
                  setTimeout(() => {
                    this.getContainerList();
                  }, 1000);
                }
              });
            }

          }
        },

      );
  }
  edit(eventData, index) {
    this.index = index;
    const modalRef = this.modalService.open(ContainerComponent, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
    modalRef.componentInstance.msgData = eventData;
    modalRef.componentInstance.SaveNew?.subscribe((res: any) => {
      if (res) {
        if (res.mastercontainerId) {
          (<FormArray>this.BatchContainer.controls['BatchContainerArray'])
            .at(this.index)
            .get('mastercontainerId')
            .setValue(res.mastercontainerId);
          (<FormArray>this.BatchContainer.controls['BatchContainerArray'])
            .at(this.index)
            .get('containerNumber')
            .setValue(res.containerNo);
          (<FormArray>this.BatchContainer.controls['BatchContainerArray'])
            .at(this.index)
            .get('containerTypeId')
            .setValue(res.containerTypeId);
          (<FormArray>this.BatchContainer.controls['BatchContainerArray'])
            .at(this.index)
            .get('containerType')
            .setValue(res.containerTypeName);
        }
      }
    });
  }
  openADD() {
    const modalRef = this.modalService.open(AddContainerComponent, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
    modalRef.componentInstance.batchId = this.route.snapshot.params['id']
    modalRef.componentInstance.batchDetail = this.batchDetail
    modalRef.componentInstance.getList.subscribe((res: any) => {
      let arrayData = this.BatchContainer.controls['BatchContainerArray'].value

      if (res) {
        let flowStop: Boolean = false;
        let searchArray = arrayData.filter((element) => element?.containerNumber === res.containerNo)
        flowStop = searchArray && searchArray.length > 0 ? true : false

        if (flowStop) {
          this.notification.create('error', `${res.containerNo} container already in use`, '');
          return false
        }
        (<FormArray>this.BatchContainer.get('BatchContainerArray')).push(
          this.Formbuilder.group({

            containerId: [''],
            mastercontainerId: [res.containermasterId],
            containerNumber: [res.containerNo],
            containerTypeId: [res.containerTypeId],
            containerType: [res.containerType],
            containerSize: [res.containerSize],
            imoType: [this.batchDetail?.enquiryData?.imcoType],
            imoTypeId: [this.batchDetail?.enquiryData?.imcoType],
            netWeight: ["0.00"],
            isoContainerCode: [''],
            grossWeight: ['0.00'],
            package: ["0.00"],
            tareWeight: [res.tarWeight || "0.00"],
            unit: ['KG'],
            unitGross: ['KG'],
            cbm: ['0.00'],
            packageType: [" "],
            rfidNo: [''],
            sealNo: [''],
            cargoType: [this.batchDetail.cargoType],
            cargoTypeId: [this.batchDetail.cargoType],
            evgmNumber: [''],
            evgmDate: [''],
            blNumber: [''],
            blDate: [''],
            shippingBillNumber: [''],
            sbNo: [''],
            sbDate: [''],
            sobName: [''],
            isSobEmail: [false],
            bondNumber: [''],
            igmNumber: [''],
            status: [''],
            statusId: [''],
            depotOut: [],
            depoIn: [''],
            depotDate: [''],
            depotDateName: [''],
            depoInName: [''],
            icdIn: [''],
            icdInName: [''],
            icdOut: [''],
            icdOutName: [''],
            factoryIn: [''],
            factoryInName: [''],
            factoryOut: [''],
            factoryOutName: [''],
            terminalIn: [''],
            terminalInName: [''],
            mtyValidity: [''],
            mtyReturn: [''],
            terminalOut: [''],
            customsCheck: [''],
            terminalOutName: [''],
            cfsIn: [''],
            cfsOut: [''],
            railOut: [''],
            dischargeDate: [''],
            reject: [''],
            rejectName: [''],
            sobDate: [''],
            arrivalDate: [''],
            deliveryDate: [''],
            containerHeight: [res.containerHeight]
          })
        );
      }
    });
  }

  openPopup(containerNumber) {
    const modalRef = this.modalService.open(ConatinerTrackComponent, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'xl'
    });
    modalRef.componentInstance.containerNo = containerNumber;
    // modalRef.componentInstance.batchDetail = this.batchDetail
  }
  open() {
    const modalRef = this.modalService.open(ContainerComponent, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
    modalRef.componentInstance.BatchId = this.batchId;
    modalRef.componentInstance.tankData = this.tankData;
    modalRef.componentInstance.batchDetail = this.batchDetail
    modalRef.componentInstance.SaveNew?.subscribe((res: any) => {

      let arrayData = this.BatchContainer.controls['BatchContainerArray'].value

      if (res.containerArray) {
        let flowStop: Boolean = false;
        res.containerArray.forEach(item => {

          let searchArray = arrayData.filter((element) => element?.containerNumber === item.containerNo)
          flowStop = searchArray && searchArray.length > 0 ? true : false

          if (flowStop) {
            this.notification.create('error', `${item.containerNo} container already in use`, '');
            return false
          }
          (<FormArray>this.BatchContainer.get('BatchContainerArray')).push(
            this.Formbuilder.group({

              containerId: [''],
              mastercontainerId: [item.containermasterId],
              containerNumber: [item.containerNo],
              containerTypeId: [item.containerTypeId],
              containerType: [item.containerType],
              containerSize: [item.containerSize],
              imoType: [this.batchDetail?.enquiryData?.imcoType],
              imoTypeId: [this.batchDetail?.enquiryData?.imcoType],
              netWeight: ["0.00"],
              isoContainerCode: [''],
              grossWeight: ['0.00'],
              cbm: ['0.00'],
              package: ["0.00"],
              packageType: [" "],
              tareWeight: [item.tarWeight || "0.00"],
              unit: ['KG'],
              unitGross: ['KG'],
              rfidNo: [''],
              sealNo: [''],
              cargoType: [this.batchDetail.cargoType],
              cargoTypeId: [this.batchDetail.cargoType],
              evgmNumber: [''],
              evgmDate: [''],
              blNumber: [''],
              blDate: [''],
              shippingBillNumber: [''],
              sbNo: [''],
              sbDate: [''],
              sobName: [''],
              isSobEmail: [false],
              bondNumber: [''],
              igmNumber: [''],
              status: [''],
              statusId: [''],
              depotOut: [res.containersData.yard],
              depoIn: [''],
              depotDate: [''],
              depotDateName: [''],
              depoInName: [''],
              icdIn: [''],
              icdInName: [''],
              icdOut: [''],
              icdOutName: [''],
              factoryIn: [''],
              factoryInName: [''],
              factoryOut: [''],
              factoryOutName: [''],
              terminalIn: [''],
              terminalInName: [''],
              mtyValidity: [''],
              mtyReturn: [''],
              terminalOut: [''],
              customsCheck: [''],
              terminalOutName: [''],
              cfsIn: [''],
              cfsOut: [''],
              railOut: [''],
              dischargeDate: [''],
              reject: [''],
              rejectName: [''],
              sobDate: [''],
              arrivalDate: [''],
              deliveryDate: [''],
              containerHeight: [item.containerHeight]
            })
          );


        });

      }
    });
  }

  findInvalidControls(formArray: FormArray): any[] {
    const invalidControls = [];
    formArray.controls.forEach((control, index) => {
      if (control instanceof FormGroup) {
        Object.keys(control.controls).forEach(key => {
          const formControl = control.get(key);
          if (formControl && formControl.invalid) {
            invalidControls.push({ index, control: key, errors: formControl.errors });
          }
        });
      }
    });
    return invalidControls;
  }

  onSave(type) {

    console.log(this.batchDetail)
    if (this.BatchContainer.value.BatchContainerArray?.length === 0) {
      this.notification.create('error', 'Please add at least one container', '')
    }

    else {
      if (this.BatchContainer.value.BatchContainerArray?.length > this.numberOfContainer && this.batchDetail?.enquiryDetails?.basicDetails?.loadType !== 'LCL' 
       && !this.isConsolidate && this.batchDetail?.enquiryDetails?.basicDetails?.ShipmentTypeName !== 'Air'
      ) {
        this.notification.create('error', `You can not add more than ${this.numberOfContainer} container`, '')
        return;
      }

      this.submitted = true;
      const invalidControls = this.findInvalidControls((<FormArray>this.BatchContainer.get('BatchContainerArray')));
      if (this.BatchContainer.invalid) {
        this.notification.create('error', `Form Invalid`, '')
        return;
      }

      let LstBatchContainerArray =
        this.BatchContainer.controls['BatchContainerArray'].value;
      let PostUpdateLstBatchContainerArray = [];
      let PostInsertLstBatchContainerArray = [];
      let availableCTR = []
      for (let index = 0; index < LstBatchContainerArray.length; index++) {
        let CTR = this.listContainer.filter((x) => x?.containermasterId === LstBatchContainerArray[index].mastercontainerId)[0]
        if (CTR?.containerStatus === 'Available' || CTR?.containerStatus === 'Release') {
          availableCTR.push({ ...CTR, containerStatus: 'Reserved' })
        }
        if (LstBatchContainerArray[index].containerId) {

          let conatainerData = this.tankData.find((x)=> x?.containerId === LstBatchContainerArray[index].containerId)
          PostUpdateLstBatchContainerArray.push({
            batchwiseGrouping : LstBatchContainerArray[index].batchwiseGrouping || [],

            consolidationbookingNo: LstBatchContainerArray[index].consolidationbookingNo || "",
            consolidationBookingId: LstBatchContainerArray[index].consolidationBookingId || "",
            notifyCustomer: LstBatchContainerArray[index].notifyCustomer || false,
            containerId: LstBatchContainerArray[index].containerId,
            // _id : LstBatchContainerArray[index]._id || '',
            tenantId: this.tenantId,
            isNewContainer: false,
            batchId: this.batchId,
            batchNo: this.batchDetail?.batchNo,
            vesselName: this.isConsolidate ?  conatainerData?.vesselName || '' : this.batchDetail?.routeDetails?.finalVesselName || this.batchDetail?.plannedVesselName,
            tankStatusName: this.isConsolidate ?  conatainerData?.tankStatusName || '' : this.batchDetail?.enquiryData?.tankStatusName,
            tankStatusId: this.isConsolidate ?  conatainerData?.tankStatusId || '' : this.batchDetail?.enquiryData?.tankStatusId,
            voyageNo: this.isConsolidate ?  conatainerData?.voyageNo || '' : this.batchDetail?.routeDetails?.finalVoyageId || this.batchDetail?.plannedVoyageId,
            shippingLineId: this.isConsolidate ?  conatainerData?.shippingLineId || '' : this.batchDetail?.finalShippingLineId || this.batchDetail?.quotationDetails?.carrierId,
            shippingLineName: this.isConsolidate ?  conatainerData?.shippingLineName || '' : this.batchDetail?.routeDetails?.finalShippingLineName || this.batchDetail?.quotationDetails?.carrierName,

            mastercontainerId:
              LstBatchContainerArray[index].mastercontainerId,
            containerNumber: LstBatchContainerArray[index].containerNumber,
            containerTypeId: LstBatchContainerArray[index].containerTypeId,
            containerDescription: LstBatchContainerArray[index].containerType,
            containerTypeName: LstBatchContainerArray[index].containerType,
            containerType: LstBatchContainerArray[index].containerType,
            containerSize: LstBatchContainerArray[index].containerSize,

            imoType: LstBatchContainerArray[index].imoType,
            imoTypeId: LstBatchContainerArray[index].imoTypeId,
            netWeight: LstBatchContainerArray[index].netWeight || "0.00",
            package: LstBatchContainerArray[index].package || "0.00",
            packageType: LstBatchContainerArray[index].packageType || " ",
            packageTypeName: this.packageList?.find(product => product?.systemtypeId === LstBatchContainerArray[index].packageType)?.typeName ?? "",
            grossWeight: LstBatchContainerArray[index].grossWeight || "0.00",
            cbm: LstBatchContainerArray[index].cbm || "0.00",
            isoContainerCode: LstBatchContainerArray[index].isoContainerCode,
            tareWeight: LstBatchContainerArray[index].tareWeight || "0.00",
            sealNo: LstBatchContainerArray[index].sealNo,
            unit: LstBatchContainerArray[index].unit,
            unitGross: LstBatchContainerArray[index].unitGross|| 'KG',
            rfidNo: LstBatchContainerArray[index].rfidNo,
            containerHeight: LstBatchContainerArray[index].containerHeight,
            cargoType: this.isConsolidate ?  conatainerData?.cargoType || '' : this.batchDetail?.cargoType,
            cargoTypeId: LstBatchContainerArray[index].cargoTypeId,
            evgmNumber: LstBatchContainerArray[index].evgmNumber,
            evgmDate: LstBatchContainerArray[index].evgmDate || null,

            blNumber: LstBatchContainerArray[index].blNumber,
            blDate: LstBatchContainerArray[index].blDate,
            shippingBillNumber:
              LstBatchContainerArray[index].shippingBillNumber,
            sbNo: LstBatchContainerArray[index].sbNo,
            sbDate: LstBatchContainerArray[index].sbDate,
            isSobEmail: LstBatchContainerArray[index].isSobEmail,
            bondNumber: LstBatchContainerArray[index].bondNumber,
            igmNumber: LstBatchContainerArray[index].igmNumber,
            statusFlag: this.statusList.filter(
              (x) => x.systemtypeId === LstBatchContainerArray[index].statusId
            )[0]?.typeName,
            statusFlagId: LstBatchContainerArray[index].statusId,
            status: true,
            depoIn: LstBatchContainerArray[index].depoIn,
            depotOut: LstBatchContainerArray[index].depotOut || LstBatchContainerArray[index].depotDateName,
            depotDate: LstBatchContainerArray[index].depotDate,
            depotDateName: LstBatchContainerArray[index].depotDateName,
            depoInName: LstBatchContainerArray[index].depoInName,
            icdIn: LstBatchContainerArray[index].icdIn,
            icdInName: LstBatchContainerArray[index].icdInName,
            icdOut: LstBatchContainerArray[index].icdOut,
            icdOutName: LstBatchContainerArray[index].icdOutName,
            factoryIn: LstBatchContainerArray[index].factoryIn,
            factoryInName: LstBatchContainerArray[index].factoryInName,
            factoryOut: LstBatchContainerArray[index].factoryOut,
            factoryOutName: LstBatchContainerArray[index].factoryOutName,
            terminalIn: LstBatchContainerArray[index].terminalIn,
            terminalInName: LstBatchContainerArray[index].terminalInName,
            terminalOut: LstBatchContainerArray[index].terminalOut,
            customsCheck: LstBatchContainerArray[index].customsCheck,
            terminalOutName: LstBatchContainerArray[index].terminalOutName,
            mtyValidity: LstBatchContainerArray[index].mtyValidity,
            mtyReturn: LstBatchContainerArray[index].mtyReturn,
            cfsIn: LstBatchContainerArray[index].cfsIn,
            cfsOut: LstBatchContainerArray[index].cfsOut,
            railOut: LstBatchContainerArray[index].railOut,
            dischargeDate: LstBatchContainerArray[index].dischargeDate,
            reject: LstBatchContainerArray[index].reject,
            rejectName: LstBatchContainerArray[index].rejectName,
            sobDate: LstBatchContainerArray[index].sobDate,
            arrivalDate: LstBatchContainerArray[index].arrivalDate,
            deliveryDate: LstBatchContainerArray[index].deliveryDate,
            override_orgId: '1',
            shipmentNumber: '',
            override_tId: 'true',
            "isExport": (this.isExport || this.isTransport)
          });
        } else {
          PostInsertLstBatchContainerArray.push({

            tenantId: this.tenantId,
            isNewContainer: true,
            containerId: '',
            batchwiseGrouping : [{
              batchId: this.batchId,
              batchNo: this.batchDetail?.batchNo,
            }],
            batchId: this.batchId,
            batchNo: this.batchDetail?.batchNo,
            vesselName: this.batchDetail?.routeDetails?.finalVesselName || this.batchDetail?.plannedVesselName,
            tankStatusName: this.batchDetail?.enquiryData?.tankStatusName,
            tankStatusId: this.batchDetail?.enquiryData?.tankStatusId,
            voyageNo: this.batchDetail?.routeDetails?.finalVoyageId || this.batchDetail?.plannedVoyageId,
            shippingLineId: this.batchDetail?.finalShippingLineId || this.batchDetail?.quotationDetails?.carrierId,
            shippingLineName: this.batchDetail?.routeDetails?.finalShippingLineName || this.batchDetail?.quotationDetails?.carrierName,
            mastercontainerId: LstBatchContainerArray[index].mastercontainerId,
            containerNumber: LstBatchContainerArray[index].containerNumber,
            containerTypeId: LstBatchContainerArray[index].containerTypeId,
            containerDescription: LstBatchContainerArray[index].containerType,
            containerTypeName: LstBatchContainerArray[index].containerType,
            containerType: LstBatchContainerArray[index].containerType,
            containerSize: LstBatchContainerArray[index].containerSize,
            containerHeight: LstBatchContainerArray[index].containerHeight,
            imoType: LstBatchContainerArray[index].imoType,
            imoTypeId: LstBatchContainerArray[index].imoTypeId,
            netWeight: LstBatchContainerArray[index].netWeight || "0.00",
            package: LstBatchContainerArray[index].package || "0.00",
            packageType: LstBatchContainerArray[index].packageType || " ",
            packageTypeName: this.packageList?.find(product => product?.systemtypeId === LstBatchContainerArray[index].packageType)?.typeName ?? "",
            grossWeight: LstBatchContainerArray[index].grossWeight || "0.00",
            cbm: LstBatchContainerArray[index].cbm || "0.00",
            isoContainerCode: LstBatchContainerArray[index].isoContainerCode,
            tareWeight: LstBatchContainerArray[index].tareWeight || "0.00",
            sealNo: LstBatchContainerArray[index].sealNo,
            unit: LstBatchContainerArray[index].unit,
            unitGross: LstBatchContainerArray[index].unitGross|| 'KG',
            rfidNo: LstBatchContainerArray[index].rfidNo,
            shipmentNumber: '',
            cargoType: this.batchDetail?.cargoType,
            cargoTypeId: LstBatchContainerArray[index].cargoTypeId,
            evgmNumber: LstBatchContainerArray[index].evgmNumber,
            evgmDate: LstBatchContainerArray[index].evgmDate || null,
            blNumber: LstBatchContainerArray[index].blNumber,
            blDate: LstBatchContainerArray[index].blDate,
            shippingBillNumber: LstBatchContainerArray[index].shippingBillNumber,
            sbNo: LstBatchContainerArray[index].sbNo,
            sbDate: LstBatchContainerArray[index].sbDate,
            isSobEmail: LstBatchContainerArray[index].isSobEmail,
            bondNumber: LstBatchContainerArray[index].bondNumber,
            igmNumber: LstBatchContainerArray[index].igmNumber,
            statusFlag: this.statusList.filter(
              (x) => x.systemtypeId === LstBatchContainerArray[index].statusId
            )[0]?.typeName,
            statusFlagId: LstBatchContainerArray[index].statusId,
            status: true,
            depoIn: LstBatchContainerArray[index].depoIn,
            depotOut: LstBatchContainerArray[index].depotOut || LstBatchContainerArray[index].depotDateName,
            depotDate: LstBatchContainerArray[index].depotDate,
            depotDateName: LstBatchContainerArray[index].depotDateName,
            depoInName: LstBatchContainerArray[index].depoInName,
            icdIn: LstBatchContainerArray[index].icdIn,
            icdInName: LstBatchContainerArray[index].icdInName,
            icdOut: LstBatchContainerArray[index].icdOut,
            icdOutName: LstBatchContainerArray[index].icdOutName,
            factoryIn: LstBatchContainerArray[index].factoryIn,
            factoryInName: LstBatchContainerArray[index].factoryInName,
            factoryOut: LstBatchContainerArray[index].factoryOut,
            factoryOutName: LstBatchContainerArray[index].factoryOutName,
            terminalIn: LstBatchContainerArray[index].terminalIn,
            terminalInName: LstBatchContainerArray[index].terminalInName,
            terminalOut: LstBatchContainerArray[index].terminalOut,
            customsCheck: LstBatchContainerArray[index]?.customsCheck,
            terminalOutName: LstBatchContainerArray[index].terminalOutName,
            mtyValidity: LstBatchContainerArray[index].mtyValidity,
            mtyReturn: LstBatchContainerArray[index].mtyReturn,
            cfsIn: LstBatchContainerArray[index].cfsIn,
            cfsOut: LstBatchContainerArray[index].cfsOut,
            railOut: LstBatchContainerArray[index].railOut,
            dischargeDate: LstBatchContainerArray[index].dischargeDate,
            reject: LstBatchContainerArray[index].reject,
            rejectName: LstBatchContainerArray[index].rejectName,
            sobDate: LstBatchContainerArray[index].sobDate,
            arrivalDate: LstBatchContainerArray[index].arrivalDate,
            deliveryDate: LstBatchContainerArray[index].deliveryDate,
            override_orgId: '1',
            override_tId: 'true',
            containerInUse: true,
            "isExport": (this.isExport || this.isTransport)
          });
        }
      }




      if (PostInsertLstBatchContainerArray.length > 0) {
        this.commonService
          .batchInsert(Constant.MULTI_ADD_CONTAINER, PostInsertLstBatchContainerArray)
          ?.subscribe(
            (res: any) => {
              if (res) {
                if (availableCTR.length > 0) {
                  this.commonService.batchUpdate('containermaster/batchupdate', availableCTR)?.subscribe((res: any) => {
                  })
                }
                this.clearApplyAll()
                setTimeout(() => {
                  this.getContainerList();
                }, 1000);
                if (type !== 'select')
                  this.notification.create('success', 'Saved Successfully', '');
                  this.sharedEventService.emitChargeSaved();
                this.isSelected = false
                this.isSelectedAll = false

              }
            },
            (error) => {
              this.notification.create('error', error?.error?.error?.message, '');
            }
          );
      } else {
        this.commonService
          .batchUpdate(
            Constant.MULTI_UPDATE_CONTAINER,
            PostUpdateLstBatchContainerArray
          )
          ?.subscribe(
            (res: any) => {
              if (res) {
                if (availableCTR.length > 0) {
                  this.commonService.batchUpdate('containermaster/batchupdate', availableCTR)?.subscribe((res: any) => {
                  })
                }
                this.isSelected = false
                this.isSelectedAll = false
                this.clearApplyAll()
                setTimeout(() => {
                  this.getContainerList();
                }, 2000);
                if (type !== 'select')
                  this.notification.create('success', 'Updated Successfully', '');
                  this.sharedEventService.emitChargeSaved();
              }
            },
            (error) => {
              this.notification.create('error', error?.error?.error?.message, '');
            }
          );
      }


    }


  }
  milestoneList:any=[]
  getMilestone() {  
    let payload: any = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "entityId": this.id,
      isUpdated : true,
      "eventData.eventState" : "ActualDate"
    };
    if(payload?.sort)payload.sort = {
      "asc": ['eventSeq'],
    };
    this.commonService.getSTList('event', payload)?.subscribe((data: any) => {
      this.milestoneList = data.documents; 
    } );

  }
  disabledDate = (current: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return current && current < today;
  };
  onSavenew() {
    this.isNew = false;
  }
  onClose() {
    this.router.navigate(['/batch/list']);
  }
  removeRow(content1) {
    this.modalService.open(content1, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'sm',

      ariaLabelledBy: 'modal-basic-title',
    });
  }
  getBatchById() {
    if (!this.batchId)
      return false

    let payload = this.commonService.filterList()
    payload.query = {
      batchId: this.batchId,
    }

    this._api
      .getSTList(Constant.BATCH_LIST, payload)
      ?.subscribe((res: any) => {
        this.isContainerAdd(res)
        this.batchDetail = res?.documents[0];
        if (this.batchDetail?.statusOfBatch == 'Job Cancelled' || this.batchDetail?.statusOfBatch == 'Job Closed') {
          this.BatchContainer.disable();
          this.addContainerForm.disable();
          if(this.batchDetail?.statusOfBatch == 'Job Cancelled'){
          this.isShow = true}
          else{
            this.isClose = false
          }

        }
        this.batchType = this.batchDetail?.batchType
      });
    this.getVoyageListDropDown();
  }
  numberOfContainer: any = 0
  isContainerAdd(data) {
    this.numberOfContainer = 0
    data.documents.forEach(element => {
      if (element.enquiryDetails?.containersDetails.length != 0) {
        element.enquiryDetails?.containersDetails.forEach(element1 => {
          this.numberOfContainer += element1.noOfContainer
        });
      }
      else {
        return false
      }
    });

  }
  getVoyageListDropDown() {
    let payload = this.commonService.filterList()
    payload.query = {}
    this._api
      .getSTList('voyage', payload)
      ?.subscribe((res: any) => {
        this.voyageList = res?.documents;
      });
  }
  openGenerateDeliveryOrder(event) {
    this.batchType = this.batchDetail?.batchType
    const modalRef = this.modalService.open(DeliveryOrderComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg'
    });
    modalRef.componentInstance.IsForList = event;
    modalRef.componentInstance.BatchId = this.batchId;
    modalRef.componentInstance.batchType = this.batchType;
    modalRef.componentInstance.isForm = true
     modalRef.result.then(
    (result) => {
      if (result === 'success') { 
        this.getContainerList();
      }
    },
    () => {
    }
  );
  }



  disabledEtaDate = (current: Date): boolean => {
    return differenceInCalendarDays(current, new Date()) < 0;
  };


  disabledEtdDate = (current: Date): boolean => {
    if (this.BatchContainer.controls.icdIn.value)
      return (
        differenceInCalendarDays(
          current,
          new Date(this.BatchContainer.controls.icdIn.value)
        ) < 0
      );
    else return false;
  };



  disabledStartDateForicd = (startValue: Date): boolean => {
    if (!startValue || !this.BatchContainer.controls.icdOut.value) {
      return false;
    }
    return startValue.getTime() > this.BatchContainer.controls.icdOut.value.getTime();
  };

  disabledEndDateForicd = (endValue: Date): boolean => {
    if (!endValue || !this.BatchContainer.controls.icdIn.value) {
      return false;
    }
    return endValue.getTime() <= this.BatchContainer.controls.icdIn.value.getTime();
  };

  exportAsExcelFile(): void {
    let storebatchData = [];

    this.BatchContainer.controls['BatchContainerArray'].value.map((row: any) => {


      let cargoType = this.cargoTypeList.filter(x => x.typeName === row.cargoTypeId) && this.cargoTypeList.filter(x => x.typeName === row.cargoTypeId).length > 0
        ? this.cargoTypeList.filter(x => x.typeName === row.cargoTypeId)[0].typeName : ''

      let status = this.statusList.filter(x => x.systemtypeId === row.statusId) && this.statusList.filter(x => x.systemtypeId === row.statusId).length > 0
        ? this.statusList.filter(x => x.systemtypeId === row.statusId)[0].typeName : ''

      storebatchData.push({
        "Container No": row.containerNumber,
        "Container Type": row.containerType,
        "IMO Type": row.imoType,
        "iso Container Code": row.isoContainerCode,
        "Gross weight": row.grossWeight || "0.00",
        "CBM": row.cbm || "0.00",
        "Net weight": row.netWeight || "0.00",
        "package": row.package || "0.00",
        "packageType": row.packageType || " ",
        "Cargo Type": cargoType,
        "EGM No": row.evgmNumber,
        "EGM Date": row?.evgmDate,
        "BL No": row.blNumber,
        "BL No Date": row.blDate,
        "Shipping Bill": row.shippingBillNumber,
        "Bond No": row.bondNumber,
        "IGM No": row.igmNumber,
        "Status": status,
        "Depo In": row.depoIn,
        "Depo Out Name": row.depotOut,
        "Depot Out": row.depotDate,
        "ICD In": row.icdIn,
        "ICD Out": row.icdOut,
        "Factory In": row.factoryIn,
        "Factory Out": row.factoryOut,
        "mtyValidity": row.mtyValidity,
        "mtyReturn": row.mtyReturn,
        "Terminal In": row.terminalIn,
        "terminalOut": row.terminalOut,
        "customsCheck": row?.customsCheck,
        "cfsIn": row.cfsIn,
        "cfsOut": row.cfsOut,
        "railOut": row.railOut,
        "discharge Date": row.dischargeDate,
        "Reject": row.reject,
        "SOB Date": row.sobDate,
        "Arrival Date": row.arrivalDate,
        "Delivery Date": row.deliveryDate,
      });
    });
    const myworksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(storebatchData);
    const myworkbook: XLSX.WorkBook = {
      Sheets: { data: myworksheet },
      SheetNames: ["data"],
    };


    const fileName = "tanks.xlsx";
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  openPDF() {
    var prepare = [];
    this.BatchContainer.controls['BatchContainerArray'].value.map((row: any) => {

      let status = this.statusList.filter(x => x.systemtypeId === row.statusId) && this.statusList.filter(x => x.systemtypeId === row.statusId).length > 0
        ? this.statusList.filter(x => x.systemtypeId === row.statusId)[0].typeName : ''
      var tempObj = [];
      tempObj.push(row.containerNumber);
      tempObj.push(row.containerType);
      if (this.isExport || this.isTransport) {
        tempObj.push(row.imoType)
      }

      if (this.isImport)
        tempObj.push(row.isoContainerCode);
      tempObj.push(row.grossWeight);
      tempObj.push(row.cbm);
      tempObj.push(row.netWeight);
      tempObj.push(row.package)
      tempObj.push(row.packageType)
      tempObj.push(row.cargoType);
      if (this.isExport || this.isTransport)
        tempObj.push(row.evgmNumber);
      if (this.isExport || this.isTransport)
        tempObj.push(row.evgmDate);
      tempObj.push(row.blNumber);
      tempObj.push(this.datepipe.transform(row.blDate, "dd-MM-yyyy"));
      if (this.isExport || this.isTransport)
        tempObj.push(this.datepipe.transform(row.shippingBillNumber, "dd-MM-yyyy"));
      tempObj.push(row.bondNumber);
      if (this.isImport)
        tempObj.push(row.igmNumber);
      if (this.isExport || this.isTransport)
        tempObj.push(row.depotOut);

      if (this.isImport) {
        tempObj.push(this.datepipe.transform(row.dischargeDate, "dd-MM-yyyy"));
        tempObj.push(this.datepipe.transform(row.terminalOut, "dd-MM-yyyy"));
        tempObj.push(this.datepipe.transform(row?.customsCheck, "dd-MM-yyyy"));
        tempObj.push(this.datepipe.transform(row.cfsIn, "dd-MM-yyyy"));
        tempObj.push(this.datepipe.transform(row.cfsOut, "dd-MM-yyyy"));
        tempObj.push(this.datepipe.transform(row.railOut, "dd-MM-yyyy"));
      }
      tempObj.push(this.datepipe.transform(row.icdIn, "dd-MM-yyyy"));
      if (this.isImport)
        tempObj.push(this.datepipe.transform(row.icdOut, "dd-MM-yyyy"));
      if (this.isImport)
        tempObj.push(this.datepipe.transform(row.depoIn, "dd-MM-yyyy"));
      if (this.isImport)
        tempObj.push(this.datepipe.transform(row.depotDate, "dd-MM-yyyy"));

      tempObj.push(this.datepipe.transform(row.factoryIn, "dd-MM-yyyy"));
      if (this.isExport || this.isTransport)
        tempObj.push(this.datepipe.transform(row.factoryOut, "dd-MM-yyyy"));
      if (this.isExport || this.isTransport)
        tempObj.push(this.datepipe.transform(row.terminalIn, "dd-MM-yyyy"));
      if (this.isImport)
        tempObj.push(this.datepipe.transform(row.mtyValidity, "dd-MM-yyyy"));
      if (this.isImport)
        tempObj.push(this.datepipe.transform(row.mtyReturn, "dd-MM-yyyy"));



      tempObj.push(this.datepipe.transform(row.reject, "dd-MM-yyyy"));

      tempObj.push(this.datepipe.transform(row.sobDate, "dd-MM-yyyy"));
      tempObj.push(status);
      if (this.isExport || this.isTransport)
        tempObj.push(this.datepipe.transform(row.arrivalDate, "dd-MM-yyyy"));
      if (this.isExport || this.isTransport)
        tempObj.push(this.datepipe.transform(row.deliveryDate, "dd-MM-yyyy"));


      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [697, 610]);
    if (this.isExport || this.isTransport) {
      autoTable(doc, {
        head: [['Container No', 'Container Type', 'IMO Type', 'Gross weight', 'Net weight', 'package', 'Cargo Type', 'EGM No', 'EGM Date', 'BL No', 'BL No Date', 'Shipping Bill', 'Bond No', 'IGM No', 'Status', 'Depo Out Name', 'Depot Out', 'ICD In', 'ICD Out', 'Factory In', 'Factory Out', 'Terminal In', 'Reject', 'SOB Date', "Arrival Date", "Delivery Date"]],
        body: prepare
      });
    } else {
      autoTable(doc, {
        head: [['Container No', 'Container Type', 'ISO Container Code', 'Gross weight', 'Net weight', 'package', 'Cargo Type', 'BL No', 'BL No Date', 'Bond No', 'IGM No', 'Decharge Date', 'Terminal Out', 'CFS In', 'CFS Out', 'Rail Out', 'ICD In', 'Factory In', 'MTY Validity Date', 'MTY Return', 'Reject', 'Status', 'SOB Date']],
        body: prepare
      });
    }

    doc.save('tanks' + '.pdf');
  }
  getblData() {

    let payload = this.commonService.filterList()
    payload.query = {
      batchId: this.batchId,
    }
    this._api.getSTList(Constant.BL_LIST, payload)
      ?.subscribe((data: any) => {
        this.containerData = data.documents;
      });
  }
  submitted1: boolean = false
  containerStatusList: any = ["Reserved",
    "Release",
    "Revoke",
    "Available",
    "Under Repair",
    "Washing",
    " Under Survey",
    "Free use off Hire",
    "Depot Out",
    "ICD In",
    "ICD Out",
    "Factory In",
    "Factory Out",
    "Terminal In",
    "Reject",
    "SOB"
  ]

  getLocation() {

    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      status: 'true',
      masterType: {
        "$in": ['YARD', 'CFS', 'ICD']
      },
    }

    this._api.getSTList("location", payload)?.subscribe((res: any) => {
      this.yardList = res?.documents;
    });
  }
  sort(array, key) {
    return this.sortPipe.transform(array, key);
  }
  containerMasterCancel() {
    this.modalService.dismissAll();
  }
  getContainer() {

    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      status: true,
    }
    if (payload?.sort) payload.sort = {
      "desc": ["updatedOn"]
    },
      this._api.getSTList("containermaster", payload)?.subscribe((res: any) => {
        this.listContainer = res?.documents;
      });
  }
  getPartyMaster() {

    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      status: true,
    }

    this._api.getSTList("partymaster", payload)?.subscribe((res: any) => {
      this.customerList = res?.documents
    });
  }
  get f() {
    return this.addContainerForm.controls;
  }
  disabledLocation: boolean = true
  openContainer(updateContainer, containerMaster?: any, i?: any, conTDate?, dateName?, status?) {
    if (conTDate === 'terminalIn' || conTDate === 'factoryOut' || conTDate === 'factoryIn' || conTDate === 'sobDate') {
      this.disabledLocation = false
    } else {
      this.disabledLocation = true
    }
    this.containerIndex = ''
    this.containerDate = ''
    this.containerDateName = ''
    this.containerIndex = i
    this.containerDate = conTDate
    this.containerDateName = dateName
    if (containerMaster?.value?.mastercontainerId) {
      let container = this.listContainer.filter((x) => x?.containermasterId === containerMaster?.value?.mastercontainerId)[0]

      this.addContainerForm.patchValue({
        date: conTDate === 'depotDate' ? new Date().setDate(new Date().getDate() - 1) : new Date(),
        yard: container?.yardNameId || container?.yard,
        remarks: container?.remarks,
        status: status,
        containerNo: containerMaster?.value?.mastercontainerId,
        customerName: container?.customerId,
      });
      this.modalService.open(updateContainer, {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        centered: true,
        size: 'lg',
      });
    }

  }
  containerMaster() {

    this.submitted = true;
    if (this.addContainerForm.invalid) {
      return;
    }
    let container = this.listContainer.filter((x) => x?.containermasterId === this.addContainerForm.value.containerNo)[0]

    let body = {
      ...container,
      doDate: container?.doDate || null,
      "date": this.addContainerForm.value.date,
      "remarks": this.addContainerForm.value.remarks,
      "yardName": this.yardList.filter((x) => x?.locationId === this.addContainerForm.value.yard)[0]?.locationName,
      "yardNameId": this.addContainerForm.value.yard,
      'containerStatus': this.addContainerForm.value.status,
      'customerName': this.customerList.filter(x => x?.partymasterId === this.addContainerForm.value.customerName)[0]?.customerName || '',
      'customerId': this.addContainerForm.value.customerName || '',
      "containerStatusId": true,
      "vessel": this.batchDetail?.routeDetails?.finalVesselName || this.batchDetail?.plannedVesselName || '',
      "voyage": this.batchDetail?.routeDetails?.finalVoyageId || this.batchDetail?.plannedVoyageId || '',
      "previousYardName": container?.yardName,
      "previousStatus": container?.containerStatus === this.addContainerForm.value.status ?
        container?.previousStatus : container?.containerStatus,
    };

    const data = body;
    this.commonService.UpdateToST(`containermaster/${data?.containermasterId}`, data)?.subscribe(
      (result: any) => {
        if (result) {
          setTimeout(() => {
            (<FormArray>this.BatchContainer.controls['BatchContainerArray'])
              .at(this.containerIndex)
              .get(this.containerDate)
              .setValue(result?.date);

            (<FormArray>this.BatchContainer.controls['BatchContainerArray'])
              .at(this.containerIndex)
              .get(this.containerDateName)
              .setValue(result?.yardName);

            this.modalService.dismissAll();
            this.getContainer();
            this.onSave('')
          }, 500);
        }
      },
      (error) => {
        this.modalService.dismissAll();
        this.notification.create('error', error?.error?.error?.message, '');
      }
    );
  }
  setValidation(e) {
    if (e === 'Reserved') {
      this.isRequird = true
      this.addContainerForm.controls['customerName'].setValidators([
        Validators.required,
      ]);
      this.addContainerForm.controls['customerName'].updateValueAndValidity();
    } else {
      this.isRequird = false
      this.addContainerForm.controls['customerName'].clearValidators();
      this.addContainerForm.controls['customerName'].updateValueAndValidity();
    }
  }
  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }
  onCheckAll(evt) {
    this.isSelectedAll = !this.isSelectedAll
    this.checkedList = []
    this.isSelected = !this.isSelected
    if (evt.target.checked) {
      this.BatchContainer.controls['BatchContainerArray'].value.forEach((element) => {
        this.checkedList.push(element);
      })
    }
    else {
      this.checkedList = []
    }
  }
  isSelected: boolean = false;
  isSelectedAll: boolean = false;
  checkedList = []

  grossWeight: any = "";
  cbm: any = "";
  netWeight: any = "";
  packageType: any = "";
  package: any = "";
  unit: any;
  unitGross: any;
  rfidNo: any;
  egnNo: any;
  egmDate: any;
  sbNo: any;
  shippingBill: any;
  deptOut: any;
  deptIn: any;
  icdIn: any;
  icdOut: any;
  factoryIn: any;
  factoryOut: any;
  terminalIn: any;
  reject: any;
  sobDate: any;
  status: any;
  arrivalDate: any;
  destinationDate: any;

  bondNo: any;
  igmNo: any;
  dichargeDate: any;
  terminalOut: any;
  customsCheck: any;
  cfsIn: any;
  cfsOut: any;
  railOut: any;
  validityDate: any;
  mtyReturn: any;
  haz: any;
  iso: any;

  onCheck(evt, check) {
    if (evt.target.checked) {
      this.checkedList.push(check?.value);
    }
    else {
      let index = this.checkedList.findIndex(
        item => item?.mastercontainerId === check?.value?.mastercontainerId
      )
      this.checkedList.splice(index, 1)
    }
  }
  clearApplyAll() {
    this.grossWeight = "";
    this.cbm = "";
    this.netWeight = "";
    this.packageType = "";
    this.package = "";
    this.unit = '';
    this.unitGross = '';
    this.rfidNo = '',
      this.egnNo = '';
    this.egmDate = '';
    this.sbNo = '';
    this.shippingBill = '';
    this.deptOut = '';
    this.deptIn = '';
    this.icdIn = '';
    this.icdOut = '';
    this.factoryIn = '';
    this.factoryOut = '';
    this.terminalIn = '';
    this.reject = '';
    this.sobDate = '';
    this.status = '';
    this.arrivalDate = '';
    this.destinationDate = '';

    this.bondNo = '';
    this.igmNo = '';
    this.dichargeDate = '';
    this.terminalOut = '';
    this.customsCheck = '';
    this.cfsIn = '';
    this.cfsOut = '';
    this.railOut = '';
    this.validityDate = '';
    this.mtyReturn = '';
    this.iso = '';
    this.haz = '';

  }
  applyAll() {

    if (this.checkedList.length === 0) { this.notification.create('error', 'Please select atleast one record', ''); }

    this.checkedList.forEach((element) => {

      let index = this.BatchContainer.controls['BatchContainerArray'].value.findIndex(
        item => item?.mastercontainerId === element?.mastercontainerId
      )
      let formArray = this.BatchContainer.controls['BatchContainerArray'].value
      this.BatchContainer.get('BatchContainerArray')['controls'].at(index).patchValue({
        grossWeight: this.grossWeight ? this.grossWeight : formArray[index]?.grossWeight,
        cbm: this.cbm ? this.cbm : formArray[index]?.cbm,
        netWeight: this.netWeight ? this.netWeight : formArray[index]?.netWeight,
        packageType: this.packageType ? this.packageType : formArray[index]?.packageType,
        package: this.package ? this.package : formArray[index]?.package,
        unit: this.unit ? this.unit : formArray[index]?.unit,
        unitGross: this.unitGross ? this.unitGross : formArray[index]?.unitGross,
        rfidNo: this.rfidNo ? this.rfidNo : formArray[index]?.rfidNo,
        evgmNumber: this.egnNo ? this.egnNo : formArray[index]?.evgmNumber,
        evgmDate: this.egmDate ? this.egmDate : formArray[index]?.evgmDate,
        sbNo: this.sbNo ? this.sbNo : formArray[index]?.sbNo,
        shippingBillNumber: this.shippingBill ? this.shippingBill : formArray[index]?.shippingBillNumber,
        depoIn: this.deptIn ? this.deptIn : formArray[index]?.depoIn,
        depotDate: this.deptOut ? this.deptOut : formArray[index]?.depotDate,
        icdIn: this.icdIn ? this.icdIn : formArray[index]?.icdIn,
        icdOut: this.icdOut ? this.icdOut : formArray[index]?.icdOut,
        factoryIn: this.factoryIn ? this.factoryIn : formArray[index]?.factoryIn,
        factoryOut: this.factoryOut ? this.factoryOut : formArray[index]?.factoryOut,
        terminalIn: this.terminalIn ? this.terminalIn : formArray[index]?.terminalIn,
        reject: this.reject ? this.reject : formArray[index]?.reject,
        sobDate: this.sobDate ? this.sobDate : formArray[index]?.sobDate,
        statusId: this.status ? this.status : formArray[index]?.statusId,
        arrivalDate: this.arrivalDate ? this.arrivalDate : formArray[index]?.arrivalDate,
        deliveryDate: this.deliveryDate ? this.deliveryDate : formArray[index]?.deliveryDate,


        bondNumber: this.bondNo ? this.bondNo : formArray[index]?.bondNumber,
        igmNumber: this.igmNo ? this.igmNo : formArray[index]?.igmNumber,
        dischargeDate: this.dichargeDate ? this.dichargeDate : formArray[index]?.dischargeDate,
        terminalOut: this.terminalOut ? this.terminalOut : formArray[index]?.terminalOut,
        customsCheck: this.customsCheck ? this.customsCheck : formArray[index]?.customsCheck,
        cfsIn: this.cfsIn ? this.cfsIn : formArray[index]?.cfsIn,
        cfsOut: this.cfsOut ? this.cfsOut : formArray[index]?.cfsOut,
        railOut: this.railOut ? this.railOut : formArray[index]?.railOut,
        mtyValidity: this.validityDate ? this.validityDate : formArray[index]?.mtyValidity,
        mtyReturn: this.mtyReturn ? this.mtyReturn : formArray[index]?.mtyReturn,

        isoContainerCode: this.iso ? this.iso : formArray[index]?.isoContainerCode,
        cargoTypeId: this.haz ? this.haz : formArray[index]?.cargoTypeId,

      }
      );
    })
  }
  setGross(data, index) {
    let formArray = this.BatchContainer.controls['BatchContainerArray'].value
    this.BatchContainer.get('BatchContainerArray')['controls'].at(index).patchValue({
      grossWeight: Number(formArray[index]?.netWeight) + Number(formArray[index]?.tareWeight),
    })
  }
  onAnyFieldChange() {

  }

  sendNotification(index) {

    (<FormArray>this.BatchContainer.controls['BatchContainerArray'])
      .at(index)
      .get('notifyCustomer')
      .setValue(true);
  }
}
