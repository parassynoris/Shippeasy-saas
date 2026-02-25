import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ApiService } from 'src/app/admin/principal/api.service';
import { CommonService } from 'src/app/services/common/common.service';
import { ApiSharedService } from '../../../api-service/api-shared.service';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { CognitoService } from 'src/app/services/cognito.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { environment } from 'src/environments/environment';
import * as Constant from 'src/app/shared/common-constants';
import { differenceInCalendarDays } from 'date-fns';
import * as XLSX from 'xlsx';
interface ConvertedObject {
  [key: string]: string;
}
@Component({
  selector: 'app-new-cons-bl',
  templateUrl: './new-cons-bl.component.html',
  styleUrls: ['./new-cons-bl.component.scss']
})
export class NewConsBlComponent implements OnInit {

  import: boolean = false;
  addblForm: FormGroup;
  submitted = false;
  submittedForAssign = false;
  holdBatchType: any = '';
  @Output() CloseBillSection = new EventEmitter<string>();
  @Output() CloseNew = new EventEmitter<string>();
  @Input() isType: any = 'add';
  @Input() isExportImport;
  containerBillsData = [];
  today = new Date()
  billDetail: any;
  urlParam: any;
  newassignForm: FormGroup;
  modalReference: any;
  closeResult: string;
  id: any;
  batchId: any;
  jobId: any;
  isAddMode: any;
  baseBody: any;
  shipperList: any = [];
  portList: any = [];
  consigneeList: any = [];
  userList: any = [];
  vesselList: any = [];
  voyageList: any = [];
  notifyList: any = [];
  blTypeList: any = [];
  preCarrigeList: any = [];
  packageTypeList: any = [];
  isEdit: boolean = false;
  locationList: any = [];
  shippingTermList: any = [];
  HBLPart: any = '';
  consigneeHBLList: any = [];
  shipperHBLList: any = [];
  productList: any = [];
  containesList: any = [];
  containesUpdateList: any = []
  newContainerList: any = [];
  onCarrigeList: any = [];
  batchListData: any;
  partyMasterNameList: any = [];
  isDuplicate: boolean = false;
  blData: any;
  isContainerSelected: boolean = false
  checkedContainers: any = []
  ICDlocationList: any = []
  batchDetails: any = [];
  isExport: boolean = false;
  surveyorList: any = [];
  cargoStatusList: any = [];
  CFSlocationList: any;
  documents: any[];
  documentPayload: any;
  freightTerms: any = [];
  smartAgentList: any = [];
  instructionData: any = [];
  shippingLineList: any = [];
  currencyList: any = [];
  chargeTermList: any = [];
  payloadOfShipper: any = [];
  payloadOfShipper1: any[];
  containerHistoryList: any = [];
  freightTermsList: any;
  blUploadFile: any;
  blSubTypeList: any = [];
  consolidateBookingId:any
  extension: any;
  fileTypeNotMatched: boolean;
  doc: any;
  commonFunction: any;
  constructor(
    private modalService: NgbModal,
    private router: Router,
    private commonService: CommonService,
    private formBuilder: FormBuilder,
    private notification: NzNotificationService,
    private route: ActivatedRoute,
    private _api: ApiService,
    public apiService: ApiSharedService,
    private sortPipe: OrderByPipe,
    private cognito: CognitoService,

  ) {
    this.modalService = modalService;
    this.router = router;
    this.commonService = commonService;
    this.formBuilder = formBuilder;
    this.notification = notification;
    this.route = route;
    this._api = _api;
    this.apiService = apiService;
    this.sortPipe = sortPipe;
    this.cognito = cognito

    this.isExport = localStorage.getItem('isExport') === 'false' ? false : true
    this.getAddressDropDowns();
    this.route.params.subscribe((params) => (this.urlParam = params));
    this.addblForm = this.formBuilder.group({
      bl_type: ['HBL', [Validators.required]],
      uploadFile: [],
      subBltype: ['', [Validators.required]],
      bl_no: ['', [Validators.required]],
      agent: ['JM BAXI'],
      shipper: ['', [Validators.required]],
      shipper_address: [''],
      consignee_address: [''],
      consignee: ['', [Validators.required]],
      vessel: [''],
      voyage: [''],
      pre_carriage: [''],
      Import_Export: ['Export'],
      entry_port: [''],
      port_loading: [''],
      place_of_delivery: [''],
      place_of_issue: [''],
      additional: [''],
      doInvoice: [false],
      documentInvoice: [false],
      handlingFees: [''],
      billofladingnumber: [''],
      oncarriage: [''],
      placeofReceipt: [''],
      freighttobePaidat: [''],
      ooforiginalbillsofLading: [''],
      portofDischarge: [''],
      finalplaceofDelivery: [''],
      dateofIssue: [''],
      additionalClauses: [''],
      shippingMarks: [''],
      pcin: [''],
      csn: [''],
      mcin: [''],
      notifyParty1: [''],
      notifyParty2: [''],
      notifyParty3: [''],
      address1: [''],
      address2: [''],
      address3: [''],
      manifest_remarks: [''],
      load_place: [''],

      freight_term: [''],


      mbl: [''],
      IGM_Filed: [false],
      blDate: ['', [Validators.required]],
      shippingTerm: [''],
      isDPD: [false],
      isHSS: [false],
      grossWt: [''],
      nettWt: [''],
      markNo: [''],
      totalPackages: [''],
      cargoDesc: [''],
      cargoType: [''],
      cfsLocation: [''],
      cargoStatus: [''],
      un_no: [''],
      imco_class: [''],
      technical_name: [''],
      product_id: [''],
      surveyor: [''],
      emptyReturnDepot: [''],
      VesselSellingDate: [''],
      LumSumpDatefrom: [''],
      LumSumpDateTo: [''],
      LumSumpDaysinPeriod: [''],
      amount: [''],
      blGeneralRemarks: [''],
      upload_document: [''],
      containerType: [''],
      noofContainer: [''],
      pol: [''],
      pod: [''],
      fpod: [''],
      departureMode: [''],
      shippingLine: [''],
      poo: [''],
      itemNo: [''],
      subLineNo: [''],
      freightTerm: [''],
      chargeTerm: [''],
      freightAmount: [''],
      freightCurrency: [''],
      goodsDescription : [''],
      polRemarks: ['']
    });
    this.checkValidation()
    this.newassignForm = this.formBuilder.group({
      id: [''],
      seq_no: [''],
      containerNo: [''],
      marks_nos: [''],
      agent_seal_no: ['', Validators.required],
      no_of_pkgs: ['', Validators.required],
      pkg_type: ['', Validators.required],
      tare_wt: ['', Validators.required],
      net_wt: ['', Validators.required],
      gross_wt: ['', Validators.required],
      wt_unit: ['', Validators.required],
      cbm: ['', Validators.required],
      shipping_bill_no: ['', Validators.required],
      shipping_bill_date: ['', Validators.required],
      doc_compl_date: ['', Validators.required],
    });
    this.consolidateBookingId = this.route.snapshot.params['id'];
    this.id = this.route.snapshot.params['moduleId'];
    this.isAddMode = !this.id;

    this.getLocationDropDowns();
    this.getPortDropDowns();
    this.getVesselListDropDown();
    // this.getVoyageListDropDown();
    // this.getproductDropDowns();
    this.getSystemTypeDropDowns();
    this.getContainer();
     this.getSmartAgentList()
    // this.getShippingInstru()
    this.getShippingLineDropDowns()
    this.getCurencyData()
    // this.getFreightCharges(this.batchId)
  }

  getCurencyData() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true
    }
    this._api.getSTList("currency", payload)?.subscribe((res: any) => {
      this.currencyList = res?.documents;
    });
  }
  getShippingInstru() {
    let payload = this.commonService.filterList()
    payload.query = {
      batchId: this.consolidateBookingId,
    }
    this._api
      .getSTList('instruction', payload).subscribe((res: any) => {
        this.instructionData = res?.documents[0];
        // this.downloadFile1(awsFileUrl, awsFile)
      }
      );


  }

  blobToFile(blob: Blob, filename: string): File {
    const parts = [blob];
    const file = new File(parts, filename);
    return file;
  }
  async convertExcelToJson(file: File): Promise<any[]> {
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

        this.payloadOfShipper = jsonData
        resolve(jsonData);
      };
      reader.readAsArrayBuffer(file);
    });
  }


  transformKeys(obj: { [key: string]: any }): { [key: string]: any } {
    const transformedObj: { [key: string]: any } = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = key.replace(/[ .]/g, '_');
        transformedObj[newKey] = obj[key];
      }
    }

    return transformedObj;
  }
  getShippingLineDropDowns() {

    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true,
      "$and": [
        {
          "feeder": {
            "$ne": true
          }
        }
      ],
    }

    this._api
      .getSTList('shippingline', payload)
      ?.subscribe((res: any) => {
        this.shippingLineList = res?.documents;
      });
  }
  sort(array, key) {
    return this.sortPipe.transform(array, key);
  }
  ngOnInit(): void {
    this.HBLValidate();
    if (!this.isAddMode) {
      this.getBLById(this.id);
      this.getBatchList()
    } else {
      this.getBatchList()
    }
    if (this.isType === 'show') {
      this.addblForm.disable();
    }
    this.getblData();


  }
  getContainerData(data) {
    let dataArray = []
    data?.filter((x) => {
      dataArray.push(x?.mastercontainerId.toString())
    })

    let payload = this.commonService.filterList()
    payload.query = {
      "containermasterId": {
        "$in": dataArray
      }
    }

    this._api.getSTList('containermaster', payload).subscribe((res: any) => {
      this.containerHistoryList = res?.documents;
    });
  }
  checkValidation() {
    // if (this.isExport) {

    // }
    // if (!this.isExport) {
    //   this.addblForm.get('subBltype').clearValidators()
    //   this.addblForm.get('subBltype').updateValueAndValidity()
    // }
  }
  getBLById(id) {
    this.isEdit = true

    let payload = this.commonService.filterList()
    payload.query = {
      blId: id,
    }
    this._api
      .getSTList(Constant.BL_LIST, payload)
      .subscribe((res: any) => {
        this.billDetail = res?.documents[0];
        this.patchValue(this.billDetail, true)
        this.containerBillsData = this.billDetail?.pallets;
        if (!this.isExport)
          this.containesUpdateList = this.billDetail?.pallets;
      });
  }
  uploadFile: any;
  filechange(event: any,) {
    const fileInput = event.target.files[0];
    if (fileInput) {
      this.uploadFile = fileInput;
    }
  }

  HBLValidate() {
    return
    if (!this.isExport) {

      this.addblForm.get('vessel').setValidators([]);
      this.addblForm.get('vessel').updateValueAndValidity();
      this.addblForm.get('voyage').setValidators([]);
      this.addblForm.get('voyage').updateValueAndValidity();
      this.addblForm.get('pre_carriage').setValidators([]);
      this.addblForm.get('pre_carriage').updateValueAndValidity();
      this.addblForm.get('port_loading').setValidators([]);
      this.addblForm.get('port_loading').updateValueAndValidity();
      this.addblForm.get('place_of_issue').setValidators([]);
      this.addblForm.get('place_of_issue').updateValueAndValidity();
    } else {

      this.addblForm.get('vessel').setValidators([Validators.required]);
      this.addblForm.get('vessel').updateValueAndValidity();
      this.addblForm.get('voyage').setValidators([Validators.required]);
      this.addblForm.get('voyage').updateValueAndValidity();
      this.addblForm.get('pre_carriage').setValidators([Validators.required]);
      this.addblForm.get('pre_carriage').updateValueAndValidity();
      this.addblForm.get('port_loading').setValidators([Validators.required]);
      this.addblForm.get('port_loading').updateValueAndValidity();
      this.addblForm.get('place_of_issue').setValidators([Validators.required]);
      this.addblForm.get('place_of_issue').updateValueAndValidity();
    }
  }
  getblData() {

    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "consolidationbookingId": this.consolidateBookingId,
    }
    this._api.getSTList(Constant.BL_LIST, payload)
      ?.subscribe((data: any) => {
        this.blData = data.documents;

      });
  }

  onCloseBill(evt) {
    this.CloseBillSection.emit(evt);
  }


  get f() {
    return this.addblForm.controls;
  }
  get f1() {
    return this.newassignForm.controls;
  }
  async uploadDoc(type) {
    if (!this.doc) return;
    const formData = new FormData();
    formData.append('file', this.doc, `${this.doc.name}`);
    formData.append('name', `${this.doc.name}`);

    await this.commonService.uploadDocuments('uploadblbillfile', formData).subscribe(async (res) => {
      if (res) {
        let payload = {
          Doc: this.addblForm?.value?.Doc,
          documentType: 'fdvcre4gtr',
          documentName: res.name,
          documentURL: res?.name,
          documentStatus: true
        }
        await this.commonService.addToST('document', payload).subscribe(
          (res) => {
            if (res) {
              this.notification.create('success', 'Saved Successfully', '');
              this.doc = null;
              this.addblForm.get(`${type}DocumentId`)?.setValue(res?.documentId);
              this.addblForm.get(`${type}DocumentName`)?.setValue(payload?.documentName);
            }
          },
          (error) => {
            this.notification.create('error', 'Failed to upload the document.', '');
          }
        );
      }
    });

  }

  onFileSelected(event, type) {
    let filename = event.target.value.replace('C:\\fakepath\\', '');

    this.addblForm.get(`${type}DocumentName`)?.setValue(filename);
    this.extension = filename.substr(filename.lastIndexOf('.'));
    const allowedExtensions = [
      '.xls', '.xlsx', '.pdf', '.doc', '.docx',
      '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg'
    ];
    if (allowedExtensions.includes(this.extension.toLowerCase())) {
      this.fileTypeNotMatched = false;
      this.doc = event.target.files[0];
    } else {
      this.fileTypeNotMatched = true;
    }
  }
  downloadFile(doc) {
    this.commonService.downloadDocuments('downloadpublicfile', doc.pdfUrl).subscribe(
      (res: Blob) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        let temp = URL.createObjectURL(blob);
        const pdfWindow = window.open(temp);
        // pdfWindow.print();
      },
      (error) => {
        console.error(error);
      }
    );
  }

   convertTo2DArray(originalArray){
    const header = originalArray.filter(item => item.row === 1);
    const data = originalArray.filter(item => item.row !== 1);

    const result: ConvertedObject[] = [];

    data.forEach(rowItem => {
      const convertedObj: ConvertedObject = {};
      header.forEach(headerItem => {
        const key = headerItem.text.toLowerCase().replace(/\s/g, '_');
        convertedObj[key] = data.find(d => d.row === rowItem.row && d.col === headerItem.col)?.text || '';
      });
      result.push(convertedObj);
    });

    const uniqueArray = result.filter((item, index, self) =>
      index === self.findIndex(t => (
        t.container_no === item.container_no
      ))
    );


    this.containesList.forEach((x)=>{
      uniqueArray?.forEach((y)=>{
        if(y?.container_no == x?.containerNumber){
          x.tareWeight = y?.['tare_wt_.']?.split(' ')?.[0] || ''
          x.netWeight =y?.['vgm_wt_']?.split(' ')?.[0] || ''
          x.package = y?.packages?.split(' ')?.[0] || 0
          x.packageUnit = y?.packages?.split(' ')?.[1] || ''
          x.grossWeight=y?.['gross_wt_.']?.split(' ')?.[0]|| ''
          x.sealNo= y?.['s_/_l_seal']|| ''
          x.rfidNo= y?.['s_/_l_seal']|| ''
        }
      })
    })
    this.containerBillsData = this.containesList
    this.checkedContainers = this.containesList

    return uniqueArray;
}

  readFile() {
    // this.billDetail.pdfUrl = ''
    if (this.uploadFile) {
      const formData = new FormData();
      formData.append('file', this.uploadFile, `${this.uploadFile.name}`);
      formData.append('name', `${this.uploadFile.name}`);
      this.commonService.uploadDocuments('uploadpublicreport', formData).subscribe(res => {

        if(res?.table){
          this.convertTo2DArray(res?.table);
        }


        let shipper = this.partyMasterNameList?.find((x) => x.name?.toLowerCase() == res?.Shipper?.toLowerCase())
        let consignee = this.partyMasterNameList?.find((x) => x.name?.toLowerCase() == res?.Consignee?.toLowerCase())
        let notifyParty1 = this.partyMasterNameList?.find((x) => x.name?.toLowerCase() == res?.Notify_Party?.toLowerCase())

        let vesselData = res['Vessel_&_Voyage']?.split(" ")
        let vessel =  this.vesselList?.find((x) => x.vesselName == vesselData[0])

        let loadPort = this.portList?.find((x) => x.portDetails?.portName?.toLowerCase()?.replace(/\s+/g, '')?.includes(res?.Port_Of_Loading.split(",")[0]?.toLowerCase()?.replace(/\s+/g, ''))  )
        let destPort = this.portList?.find((x) => x.portDetails?.portName?.toLowerCase()?.replace(/\s+/g, '')?.includes(res?.Port_Of_Discharge.split(",")[0]?.toLowerCase()?.replace(/\s+/g, '')) )


        let loadPlace = this.portList?.find((x) => x.portDetails?.portName?.toLowerCase()?.replace(/\s+/g, '')?.includes(res?.Place_Of_Acceptance.split(",")[0]?.toLowerCase()?.replace(/\s+/g, ''))  )
        let destPlace = this.portList?.find((x) => x.portDetails?.portName?.toLowerCase()?.replace(/\s+/g, '')?.includes(res?.Place_Of_Delivery.split(",")[0]?.toLowerCase()?.replace(/\s+/g, ''))  )

        this.addblForm.patchValue({
          bl_no : res?.Bill_of_Lading_Number,
          shipper: shipper?.partymasterId,
          consignee: consignee?.partymasterId,
          shipper_address: shipper?.addressInfo?.address,
          consignee_address: consignee?.addressInfo?.address,
          vessel: vessel?.vesselId ,
          voyage:  vesselData[1] ,

          notifyParty1 : notifyParty1?.partymasterId,
          address1 : notifyParty1?.addressInfo?.address,
          pre_carriage:     '',


          port_loading: loadPort?.portId,
          entry_port: destPort?.portId,

          place_of_delivery:   destPlace?.portId,
          load_place:   loadPlace?.portId,

          freight_term :  '',

        })
      });
    } else {
      this.notification.create('error', 'Please upload file', '');
    }

  }
  async onSave() {

    this.HBLValidate();
    var url = Constant.ADD_BL;
    if (this.isAddMode) {
      let filterArr = []
      filterArr = this.blData?.filter(e => e.blNumber === this.addblForm.value.bl_no)
      this.isDuplicate = filterArr.length > 0 ? true : false
      if (this.isDuplicate) {
        this.submitted = true;
        this.notification.create('error', 'Duplicate BL no. not allowed', '');
        return;
      }
    }

    if (!this.addblForm.valid) {

      this.submitted = true;
      this.notification.create('error', 'Please fill all required fields', '');
      return;
    }

    if (this.containerBillsData?.length === 0 && this.isExport) {
      this.notification.create('error', 'Please assign at least one container', '');
      return;
    }



    var blId = '';
    if (!this.isAddMode) {
      url = Constant.UPDATE_BL + '/' + this.id;
      blId = this.id;
    }

    let containersList = []
    let date = new Date()
    if (this.isExport) {
      this.containerBillsData?.forEach(element => {
        containersList.push({
          ...element,
          // shippingBillNumber: element.shippingBillNumber === '' || element.shippingBillNumber === 'Null' ? date : element?.shippingBillNumber,
          // doDate: element.doDate === '' ? date : element?.doDate,
          // sobDate: element.sobDate === '' ? date : element?.sobDate,
          blDate: this.addblForm.value.blDate,
          // evgmDate: element?.evgmDate ? element?.evgmDate : []
        })
      });

    }
    else {
      this.containesUpdateList?.forEach(element => {
        containersList.push({
          ...element,
          // shippingBillNumber: element?.shippingBillNumber === '' || element?.shippingBillNumber === 'Null' ? date : element?.shippingBillNumber,
          // doDate: element?.doDate === '' ? date : element?.doDate,
          // sobDate: element?.sobDate === '' ? date : element?.sobDate,
          // dischargeDate: element?.dischargeDate ? element?.dischargeDate : null,
          blDate: this.addblForm.value.blDate,
          // depotDate: element?.depotDate === '' ? null : element?.depotDate
        })
      });

    }
    // this.documents?.filter((x) => {
    //   let data = {
    //     documentId: '',
    //     document: `https://s3-${environment.AWS_REGION}.amazonaws.com/${environment.bucketName}/bl/${x.name}`,
    //     documentName: x.name,
    //   };
    //   this.documentPayload.push(data);
    // });

    let tenantId = ""
    this.cognito.getUserDatails().subscribe((resp) => {
      if (resp != null) {
        tenantId = resp.tenantId
      }
    })
    let createBody = [
      {

        pdfUrl: this.uploadFile ? this.uploadFile.name : this.billDetail?.pdfUrl ? this.billDetail?.pdfUrl : '',
        "tenantId": tenantId,
        blId: blId,
        batchId: this.batchId,
        consolidateBookingId : this.consolidateBookingId,
        jobId: this.jobId,
        Import_Export: this.addblForm.value.Import_Export,
        blType: this.addblForm.value.bl_type,
        subBltype: this.addblForm.value.subBltype,
        blTypeName: this.addblForm.value.bl_type,
        blNumber: this.addblForm.value.bl_no.toString(),
        shipperId: this.addblForm.value.shipper,
        shipperName: this.HBLPart === 'MBL' ? this.addblForm.value.shipper : this.shipperList.filter(
          (x) => x.partymasterId === this.addblForm.value.shipper
        )[0]?.name,
        shipperAddress: this.addblForm.value.shipper_address || '',
        consigneeId: this.addblForm.value.consignee,
        consigneeName: this.HBLPart === 'MBL' ? this.addblForm.value.consignee : this.consigneeList.filter(
          (x) => x.partymasterId === this.addblForm.value.consignee
        )[0]?.name,
        consigneeAddress: this.addblForm.value.consignee_address || '',
        voyageId: this.addblForm.value.voyage,
        voyageNumber: this.addblForm.value.voyage,
        vessel: this.addblForm.value.vessel,
        vesselName: this.vesselList.filter(
          (x) => x.vesselId === this.addblForm.value.vessel
        )[0]?.vesselName,

        preCarrigeById: this.addblForm.value.pre_carriage || '',
        preCarrigeByName: this.preCarrigeList.filter(
          (x) => x.locationId === this.addblForm.value.pre_carriage
        )[0]?.name || '',
        notify_party1: this.addblForm.value.notifyParty1,
        notify_party1Name: this.notifyList.filter(
          (x) => x.partymasterId === this.addblForm.value.notifyParty1
        )[0]?.name,
        address1: this.addblForm.value.address1,
        notify_party2: this.addblForm.value.notifyParty2,
        notify_party2Name: this.notifyList.filter(
          (x) => x.partymasterId === this.addblForm.value.notifyParty2
        )[0]?.name,
        address2: this.addblForm.value.address2,
        notify_party3: this.addblForm.value.notifyParty3,
        notify_party3Name: this.notifyList.filter(
          (x) => x.partymasterId === this.addblForm.value.notifyParty3
        )[0]?.name,
        address3: this.addblForm.value.address3,
        loadPlace: this.addblForm.value.load_place,
        loadPlaceName: this.portList.filter((x) => x?.portId === this.addblForm.value.load_place)[0]?.portDetails?.portName,
        entryPort: this.portList.filter(
          (x) => x.portId === this.addblForm.value.entry_port
        )[0]?.portDetails?.portName,
        entryPortId: this.addblForm.value.entry_port,
        onCarriageId: this.addblForm.value.oncarriage || '',
        onCarriageName: this.onCarrigeList.filter(
          (x) => x.locationId === this.addblForm.value.oncarriage
        )[0]?.name || '',
        placeOfDelivery: this.addblForm.value.place_of_delivery,
        placeOfDeliveryName: this.portList.filter((x) => x?.portId === this.addblForm.value.place_of_delivery)[0]?.portDetails?.portName,
        stoltAgentId: this.addblForm.value.agent,
        stoltAgentName: this.addblForm.value.agent,
        manifestRemarks: this.addblForm.value.manifest_remarks,
        podUnLoc: '',
        polId: this.addblForm.value.port_loading,
        polName: this.portList.filter(
          (x) => x.portId === this.addblForm.value.port_loading
        )[0]?.portDetails?.portName,
        placeofIssue: this.addblForm.value.place_of_issue,
        placeofReceipt: this.addblForm.value.placeofReceipt,
        frieghtPaidBy: '',
        blINCOTerm: '',
        billToId: '',
        billToName: '',
        doInvoice: this.addblForm.value.doInvoice || false,
        documentInvoice: this.addblForm.value.documentInvoice || false,
        handlingFees: this.addblForm.value.handlingFees ? this.addblForm.value.handlingFees.toString() : "",
        pcin: this.addblForm.value.pcin ? this.addblForm.value.pcin.toString() : "",
        csn: this.addblForm.value.csn ? this.addblForm.value.csn.toString() : "",
        mcin: this.addblForm.value.mcin ? this.addblForm.value.mcin.toString() : "",
        blStatus: false,
        additonalClause: this.addblForm.value.additonalClause,
        additional: this.addblForm.value.additional,
        pallets: containersList,
        status: true,


        chargeTerm: this.addblForm.value.chargeTerm,


        freightTerm: this.addblForm.value.freightTerm,
        freightAmount: this.addblForm.value.freightAmount,
        freightCurrency: this.currencyList?.filter(x => x?.currencyId ==
          this.addblForm.value.freightCurrency)[0]?.currencyShortName,
        freightCurrencyId: this.addblForm.value.freightCurrency,

        shippingLineName: this.shippingLineList?.filter((x) => x?.shippinglineId === this.addblForm.value.shippingLine)[0]?.name,
        shippingLineId: this.addblForm.value.shippingLine,
        mbl: this.addblForm.value.mbl,
        IGM_Filed: this.addblForm.value.IGM_Filed,
        blDate: this.addblForm.value.blDate,
        shippingTerm: this.shippingTermList.filter(
          (x) => x.systemtypeId === this.addblForm.value.shippingTerm
        )[0]?.typeName,
        shippingTermId: this.addblForm.value.shippingTerm,
        isDPD: this.addblForm.value.isDPD,
        isHSS: this.addblForm.value.isHSS,
        grossWeight: this.addblForm.value.grossWt,
        nettWeight: this.addblForm.value.nettWt,
        markNumber: this.addblForm.value.markNo,
        totalPackage: this.addblForm.value.totalPackages,
        cargo_Desc: this.addblForm.value.cargoDesc,
        cargoType: this.productList.filter(x => x.partymasterId === this.addblForm.value.cargoType)[0]?.name || '',
        cargoId: this.addblForm.value.cargoType,


        cfsLocation: this.CFSlocationList.filter(x => x.locationId === this.addblForm.value.cfsLocation)[0]?.locationName,
        cfsLocationId: this.addblForm.value.cfsLocation,
        cargoStatus: this.addblForm.value.cargoStatus,
        unNo: this.addblForm.value.un_no,
        imcoClass: this.addblForm.value.imco_class,
        technicalName: this.addblForm.value.technical_name,
        productName: this.productList.filter(x => x.productId === this.addblForm.value.product_id)[0]?.productName,
        productId: this.addblForm.value.product_id,
        surveyorName: this.surveyorList.filter(x => x.partymasterId === this.addblForm.value.surveyor)[0]?.name,
        surveyor: this.addblForm.value.surveyor,
        emptyReturnDepotName: this.depotList.filter(x => x.locationId === this.addblForm.value.emptyReturnDepot)[0]?.locationName,
        emptyReturnDepot: this.addblForm.value.emptyReturnDepot,
        VesselSellingDate: this.addblForm.value.VesselSellingDate || new Date(),
        LumSumpDatefrom: this.addblForm.value.LumSumpDatefrom || new Date(),
        LumSumpDateTo: this.addblForm.value.LumSumpDateTo || new Date(),
        LumSumpDaysinPeriod: this.addblForm.value.LumSumpDaysinPeriod,
        amount: this.addblForm.value.amount,

        noofContainer: this.addblForm.value.noofContainer,
        importPoo: this.addblForm.value.poo,
        importPooName: this.portList.filter(
          (x) => x.portId === this.addblForm.value.poo
        )[0]?.portDetails?.portName,
        importPol: this.addblForm.value.pol,
        importPolName: this.portList.filter(
          (x) => x.portId === this.addblForm.value.pol
        )[0]?.portDetails?.portName,
        importPod: this.addblForm.value.pod,
        importPodName: this.portList.filter(
          (x) => x.portId === this.addblForm.value.pod
        )[0]?.portDetails?.portName,
        importFpod: this.addblForm.value.fpod,
        importFpodName: this.portList.filter(
          (x) => x.portId === this.addblForm.value.fpod
        )[0]?.portDetails?.portName,
        departureMode: this.addblForm.value.departureMode,
        blGeneralRemarks: this.addblForm.value.blGeneralRemarks,
        goodsDescription : this.addblForm.value.goodsDescription,
        documents: this.documentPayload,
        polRemarks: this.addblForm?.value?.polRemarks,
        containerType: this.addblForm.value.containerType,
        containerTypeName: this.containerTypeList.filter(x => x.systemtypeId ===
          this.addblForm.value.containerType)[0]?.typeName,
        itemNo: this.addblForm.value.itemNo || '',
        subLineNo: this.addblForm.value.subLineNo || '',
        isExport: this.isExport,

        apiType: 'status'
      },
    ];

    // if(this.isExport){
    //  let isScreenReady =  this.checkbLValid(createBody)
    //  if(isScreenReady || isScreenReady === undefined){return false}
    // }
    let apiCalls = this.commonService.addToST(url, createBody[0]);
    if (!this.isAddMode) {
      apiCalls = this.commonService.UpdateToST(url, createBody[0]);
    }
    await apiCalls.subscribe(async (data: any) => {
      if (data) {
        // let updatedData = []


        // if (this.isExport) {
        //   this.containesList?.forEach((element) => {
        //     this.containerBillsData?.filter((x) => {
        //       if (x?.containerNumber === element?.containerNumber) {
        //         updatedData.push({
        //           ...element, blNumber: this.addblForm.value.bl_no,
        //           blDate: this.addblForm.value.blDate,
        //           isAssigned: true
        //         })
        //       }
        //     });
        //   })
        // }

        // if (!this.isExport) {
        //   containersList?.forEach((element) => {
        //     updatedData.push({
        //       ...element, blNumber: this.addblForm.value.bl_no,
        //       blDate: this.addblForm.value.blDate,
        //       isAssigned: true
        //     })
        //   })
        // }

        // if (this.isAddMode) {
        //   apiCalls = this.commonService.UpdateToST(`batch/${this.batchId}`, { batchId: this.batchId, [`${this.addblForm.value.bl_type}Status`]: 'Created' })
        //   await apiCalls.subscribe((res) => {
        //     console.log('BL Status updated');
        //   })
        // }

        // this.commonService.batchUpdate(Constant.MULTI_UPDATE_CONTAINER, updatedData).subscribe();
        // if (this.isAddMode) {
        //   this.submitted = false;
        //   this.notification.create('success', 'Added Successfully', '');
        // } else {
        //   this.submitted = false;
        //   this.notification.create('success', 'Updated Successfully', '');
        // }

        // let updatedMasterCont = []
        // if (this.isExport) {
        //   this.containerBillsData?.forEach((x) => {
        //     this.containerHistoryList?.forEach((element) => {
        //       if (x?.containerNumber?.replace(/\s/g, "") === element?.containerNo?.replace(/\s/g, "")) {
        //         updatedMasterCont.push({
        //           ...element,
        //           bookingref: "",
        //           shippingBill: x?.shippingBillNumber,
        //           customCode: "",
        //           blno: this.addblForm.value.bl_no,
        //           pod: data?.payload?.importPodName,
        //           shipper: data?.payload?.shipperName,
        //           consignee: data?.payload?.consigneeName,
        //           // dono: "",
        //           doDate: x?.doDate || '',
        //           principal: "",
        //         })
        //       }
        //     });
        //   })

        // }
        // if (!this.isExport) {
        //   this.containerHistoryList?.forEach((element) => {
        //     containersList?.forEach((x) => {
        //       if (x?.containerNumber?.replace(/\s/g, "") === element?.containerNo?.replace(/\s/g, "")) {
        //         updatedMasterCont.push({
        //           ...element,
        //           bookingref: "",
        //           shippingBill: x?.shippingBillNumber || '',
        //           customCode: "",
        //           blno: this.addblForm.value.bl_no,
        //           pod: data?.payload?.importPodName,
        //           shipper: data?.payload?.shipperName,
        //           consignee: data?.payload?.consigneeName,
        //           // dono: "",
        //           doDate: x?.doDate || '',
        //           principal: "",
        //         })
        //       }
        //     })
        //   })
        // }
        // if (updatedMasterCont?.length > 0)
        //   this.commonService.batchUpdate(Constant.MULTI_UPDATE_CONTAINER_master, updatedMasterCont).subscribe();



        this.router.navigate(['/consolidation-booking/edit' + this.route.snapshot.params['id'] + '/bl']);
        setTimeout(() => {
          this.getblData()
        }, 1000);
      }
    },
      (error) => {
        this.notification.create('error',error?.error?.error?.message, '');
      });
  }
  checkbLValid(payloadBL) {
    const payloadOfShipper = this.transformKeys(this.payloadOfShipper[0]);
    let checkBl: boolean = false
    if (payloadOfShipper?.Consignee?.toLowerCase() !== payloadBL[0]?.consigneeName?.toLowerCase()) {
      this.notification.create('error', 'Consignee did not match with shipper data', '');
      checkBl = true
    } else if (payloadOfShipper?.Shipper?.toLowerCase() !== payloadBL[0]?.shipperName?.toLowerCase()) {
      this.notification.create('error', 'Shipper did not match with shipper data', '');
      checkBl = true
    } else if (payloadOfShipper?.Product_Name?.toLowerCase() !== payloadBL[0]?.productName?.toLowerCase()) {
      this.notification.create('error', 'Product did not match with shipper data', '');
      checkBl = true
    } else if (payloadOfShipper?.Vessel?.toLowerCase() !== payloadBL[0]?.vesselName?.toLowerCase()) {
      this.notification.create('error', 'Vessel did not match with shipper data', '');
      checkBl = true
    } else if (payloadOfShipper?.Voyage_No?.toLowerCase() !== payloadBL[0]?.voyageId?.toLowerCase()) {
      this.notification.create('error', 'Voyage did not match with shipper data', '');
      checkBl = true
    } else {
      return checkBl
    }
  }

  getSmartAgentList() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "agentId": this.commonFunction.getAgentDetails().agentId
    }
    this.commonService.getSTList(Constant.AGENTADVICELIST, payload)?.subscribe((data: any) => {
      this.smartAgentList = data.documents;
      this.addblForm.get('agent').setValue(this.commonFunction.getAgentDetails().agentId)
    })
  }
  getCharges(res) {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "enquiryitemId": res
    }
    this.commonService.getSTList('enquiryitem', payload).subscribe(
      (result) => {
        this.freightTerms = result?.documents;
        this.addblForm.get('freight_term').setValue(this.freightTerms[0]?.enquiryitemId)
      }
    );
  }

  getFreightCharges(res) {

    let payload = this.commonService.filterList()
    payload.query = {
      "batchId": res,
      "isFreight": true
    }
    this.commonService.getSTList('enquiryitem', payload).subscribe(
      (result) => {
        this.freightTerms = result?.documents;
        this.addblForm.get('freightTerm').setValue(this.freightTerms[0]?.chargeTerm)
        this.addblForm.get('freightAmount').setValue(this.freightTerms[0]?.totalAmount)
        this.addblForm.get('freightCurrency').setValue(this.freightTerms[0]?.currencyId)
      }
    );
  }

  patchValue(data, flag) {
    // this.getCharges(data?.freightTermId)
    this.documentPayload = data?.documents ? data?.documents : [];

    if (flag) {
      this.addblForm.patchValue({
        freightTerm: data?.freightTerm || this.freightTerms[0]?.chargeTerm,
        chargeTerm: data?.chargeTerm || '',
        freightAmount: data?.freightAmount || this.freightTerms[0]?.totalAmount,
        freightCurrency: data?.freightCurrencyId || this.freightTerms[0]?.currencyId,
        freight_term: data?.freightTermId || this.freightTerms[0]?.enquiryitemId,
        bl_type: data?.blType || 'HBL',
        subBltype: data?.subBltype || '',
        bl_no: this.isAddMode ? data?.moveNo || '' : data?.blNumber || '',
        agent: data?.stoltAgentId || 'JM BAXI',
        Import_Export: data?.Import_Export || 'Export',
        shipper: data?.shipperId || '',
        shipper_address: data?.shipperAddress || '',
        consignee_address: data?.consigneeAddress || '',
        consignee: data?.consigneeId || '',
        vessel: data?.vessel,
        voyage: data?.voyageId,
        pre_carriage: this.isAddMode ? data?.enquiryData?.preCarriageId : data?.preCarrigeById || '',
        entry_port: this.isAddMode ? data?.enquiryData?.destPortId : data?.entryPortId || '',
        port_loading: this.isAddMode ? data?.enquiryData?.loadPortId : data?.polId || '',
        place_of_delivery: this.isAddMode ? data?.enquiryData?.fpodId : data?.placeOfDelivery || '',
        place_of_issue: data?.placeofIssue || '',
        additional: data?.additional || '',
        billofladingnumber: data?.billofladingnumber || '',
        oncarriage: this.isAddMode ? data?.enquiryData?.onCarriageId : data?.onCarriageId || '',
        placeofReceipt: data?.placeofReceipt || '',
        freighttobePaidat: data?.freighttobePaidat || '',
        ooforiginalbillsofLading: data?.ooforiginalbillsofLading || '',
        portofDischarge: data?.portofDischarge || '',
        finalplaceofDelivery: data?.finalplaceofDelivery || '',
        dateofIssue: data?.dateofIssue || '',
        additionalClauses: data?.additionalClauses || '',
        shippingMarks: data?.shippingMarks || '',
        pcin: data?.pcin || '',
        csn: data?.csn || '',
        mcin: data?.mcin || '',
        notifyParty1: this.isAddMode ? data?.notifyPartyId : data?.notify_party1 || '',
        notifyParty2: data?.notify_party2 || '',
        notifyParty3: data?.notify_party3 || '',
        address1: this.isAddMode ? this.findNotifyADD(data?.notifyPartyId) || '' : data?.address1 || '',
        address2: data?.address2 || '',
        address3: data?.address3 || '',
        doInvoice: data?.doInvoice || false,
        documentInvoice: data?.documentInvoice || false,
        handlingFees: data?.handlingFees || '',
        manifest_remarks: data?.manifestRemarks || false,
        load_place: this.isAddMode ? data?.enquiryData?.loadPlace : data?.loadPlace || '',

        shippingLine: this.isAddMode ? data?.finalShippingLineId ? data?.finalShippingLineId : data?.shippingLineId : data?.shippingLineId || '',
        mbl: data?.mbl || '',
        IGM_Filed: data?.IGM_Filed || '',
        blDate: data?.blDate || '',
        shippingTerm: data?.shippingTermId || '',
        isDPD: data?.isDPD || false,
        isHSS: data?.isHSS || false,
        grossWt: data?.grossWeight || '',
        nettWt: data?.nettWeight || '',
        markNo: data?.markNumber || '',
        totalPackages: data?.totalPackage || '',
        cargoDesc: data?.cargo_Desc || '',
        cargoType: data?.cargoId || '',

        cfsLocation: data?.cfsLocationId || '',
        cargoStatus: data?.cargoStatus || '',
        un_no: data?.unNo || '',
        imco_class: data?.imcoClass || '',
        technical_name: data?.technicalName || '',
        product_id: data?.productId || '',
        surveyor: data?.surveyor || '',
        emptyReturnDepot: data?.emptyReturnDepot || '',
        VesselSellingDate: data?.VesselSellingDate || new Date(),
        LumSumpDatefrom: data?.LumSumpDatefrom || new Date(),
        LumSumpDateTo: data?.LumSumpDateTo || new Date(),
        LumSumpDaysinPeriod: data?.LumSumpDaysinPeriod || '',
        amount: data?.amount || '',
        upload_document: '',
        noofContainer: data?.noofContainer || '',
        containerType: data?.containerType || '',
        pol: data?.importPol || '',
        poo: data?.importPoo || '',
        pod: data?.importPod ? data?.importPod : this.batchDetails.podId,
        polRemarks: data?.polRemarks,
        fpod: data?.importFpod ? data?.importFpod : this.batchDetails.fpodId,
        itemNo: data?.itemNo || '',
        subLineNo: data?.subLineNo || '',
        departureMode: data?.departureMode || '',
        blGeneralRemarks: data?.blGeneralRemarks || '',
        goodsDescription : data?.goodsDescription || ''

      });
    } else {

      let shipperAdd = this.shipperList.filter((x) => x?.partymasterId === this.batchDetails?.enquiryDetails?.basicDetails?.shipperId)[0]?.addressInfo?.address;
      let consigneeAdd = this.consigneeList.filter((x) => x?.partymasterId === this.batchDetails?.enquiryDetails?.basicDetails.consigneeId)[0]?.addressInfo?.address;

      this.addblForm.patchValue({
        shipper: this.batchDetails?.enquiryDetails?.basicDetails.shipperId,
        consignee: this.batchDetails?.enquiryDetails?.basicDetails.consigneeId,
        shipper_address: shipperAdd,
        consignee_address: consigneeAdd,
        vessel: this.isExport ? data?.quotationDetails?.vesselId : data?.quotationDetails?.vesselId,
        voyage: this.isExport ? data?.quotationDetails?.voyageNumber : data?.quotationDetails?.voyageNumber,

        pre_carriage: this.batchDetails.enquiryDetails?.routeDetails?.preCarriageId || '',
        entry_port: this.batchDetails?.enquiryDetails?.routeDetails?.destPortId || '',
        port_loading: this.batchDetails?.enquiryDetails?.routeDetails?.loadPortId || '',
        place_of_delivery: this.batchDetails?.enquiryDetails?.routeDetails?.loadPlaceId || '',
        load_place: this.batchDetails?.enquiryDetails?.routeDetails?.location || '',
        freight_term: this.batchDetails?.enquiryDetails?.routeDetails?.freightTerms || '',

      })

    }
    // this.desPortchange(this.isAddMode ? data?.enquiryData?.destPortId : data?.entryPortId)
    // this.loadportchange(this.isAddMode ? data?.enquiryData?.loadPortId : data?.entryPortId)



  }
  deleteFile(doc) {
    let index = this.documentPayload.findIndex(
      item => item.documentName === doc.documentName
    )
    this.documentPayload.splice(index, 1)
  }
  findNotifyADD(id) {
    let notifyAddress = this.notifyList.filter((x) => x?.partymasterId === id)[0]?.addressInfo?.address
    return notifyAddress

  }
  getContainer() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "batchId": this.route.snapshot.params['id']
    }
    this.commonService
      .getSTList(Constant.CONTAINER_LIST, payload)
      ?.subscribe((data: any) => {
        this.getContainerData(data?.documents)

        if (!this.isAddMode && !this.isExport) {
          this.containesList = data?.documents;
        }
        else if (!this.isExport) {
          this.containerBillsData = data?.documents.map((x) => x);
          this.containesUpdateList = data?.documents.map((x) => x);


        }
        else {
          this.containesList = data?.documents;
          this.containesUpdateList = data?.documents.map((x) => x);
        }

      })
  }
  depotList: any = []
  getLocationDropDowns() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true,
      masterType:   {
        "$in": ['YARD','CFS','ICD']
      },
    }
    this._api.getSTList("location", payload)?.subscribe((res: any) => {

      this.locationList = res?.documents;
      this.CFSlocationList = this.locationList.filter((x) => x?.CFS)
      this.ICDlocationList = this.locationList.filter((x) => x?.ICD)
      this.depotList = this.locationList.filter(x => x?.masterType === 'CFS' || x?.masterType === 'YARD' || x?.masterType === 'CFS,YARD')
      this.preCarrigeList = this.ICDlocationList;
      this.onCarrigeList = this.ICDlocationList;
      // this.preCarrigeList = this.ICDlocationList.filter(x => x.country.toLowerCase() === 'india')
      // this.onCarrigeList = this.ICDlocationList.filter(x => x.country.toLowerCase() !== 'india')

    });
  }
  loadportchange(e?) {
    this.preCarrigeList = this.ICDlocationList.filter(x => x.portId === e)
  }
  desPortchange(e?) {
    this.onCarrigeList = this.ICDlocationList.filter(x => x.portId === e)
  }
  vendorList: any = []
  getAddressDropDowns() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true
    }
    this._api.getSTList("partymaster", payload)?.subscribe((res: any) => {
      this.partyMasterNameList = res?.documents;
      this.notifyList = res?.documents;
      res?.documents.filter((x) => {
        if (x.customerType) {
          x.customerType.map((res: any) => {
            if (res?.item_text === 'Shipper') { this.shipperList.push(x) }
            else if (res?.item_text === 'Consignee') { this.consigneeList.push(x) }
            // else if (res?.item_text === 'Notify Party') { this.notifyList.push(x) }
            else if (res?.item_text === 'Vendor') { this.vendorList.push(x) }
          })
        }
      });
      this.surveyorList = this.vendorList.filter(x => x.survey == 'Survey')

      if (this.addblForm.get('shipper').value) {
        let shipperAdd = this.partyMasterNameList.filter((x) => x?.partymasterId === this.addblForm.get('shipper').value)[0]?.addressInfo?.address;

        if (shipperAdd) {
          this.addblForm.get('shipper_address').setValue(shipperAdd)
        }
      }
      if (this.addblForm.get('consignee').value) {
        let shipperAdd = this.partyMasterNameList.filter((x) => x?.partymasterId === this.addblForm.get('consignee').value)[0]?.addressInfo?.address;

        if (shipperAdd) {
          this.addblForm.get('consignee_address').setValue(shipperAdd)
        }
      }
      if (this.addblForm.get('notifyParty1').value) {
        let shipperAdd = this.partyMasterNameList.filter((x) => x?.partymasterId === this.addblForm.get('notifyParty1').value)[0]?.addressInfo?.address;

        if (shipperAdd) {
          this.addblForm.get('address1').setValue(shipperAdd)
        }
      }

    });
  }

  getPortDropDowns() {


    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true,
    }

    this._api
      .getSTList('port', payload)
      ?.subscribe((res: any) => {
        this.portList = res?.documents;
      });
  }

  setAddress(e, id?) {

    if (!id && !this.partyMasterNameList) { return false }
    let shipperAdd = this.partyMasterNameList.filter((x) => x?.partymasterId === id)[0]?.addressInfo?.address;

    if (shipperAdd)
      this.addblForm.get(e).setValue(shipperAdd)

  }
  getVesselListDropDown() {
    // let payload = this.commonService.filterList()
    // payload.query = {

    // }
    // this._api
    //   .getSTList('vessel', payload)
    //   .subscribe((res: any) => {
    //     this.vesselList = res?.documents;
    //   });

    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = { status: true }
    this._api
      .getSTList('voyage', payload)
      ?.subscribe((res: any) => {
        this.vesselList = res?.documents;
      });
  }

  getVoyageListDropDown() {
    let payload = this.commonService.filterList()
    payload.query = {
      "status": true
    }
    this._api
      .getSTList('voyage', payload)
      .subscribe((res: any) => {
        this.voyageList = res?.documents;
      });
  }
  getproductDropDowns() {
    let payload = this.commonService.filterList()
    payload.query = {
      "status": true
    }
    this._api.getSTList("product", payload).subscribe((res: any) => {
      this.productList = res?.documents;
    });
  }
  cargotypeList: any = []
  itemTypeList: any = []
  departureModeList: any = []
  containerTypeList: any = []
  getSystemTypeDropDowns() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true,
      "typeCategory": {
        "$in": [
          'blSubType', "chargeTerm", "freightChargeTerm", 'containerType', 'blType', 'packageType', 'icd', 'shippingTerm', 'preCarriage', 'onCarriage', 'cargoStatus', 'cargoType', 'itemType', 'departureMode',
        ]
      }
    }
    this._api.getSTList('systemtype', payload)
      ?.subscribe((res: any) => {
        this.chargeTermList = res?.documents?.filter(x => x.typeCategory === "chargeTerm");
        this.freightTermsList = res?.documents?.filter(x => x.typeCategory === "freightChargeTerm");
        this.cargoStatusList = res?.documents.filter(
          (x) => x.typeCategory === 'cargoStatus'
        );
        this.blTypeList = res?.documents.filter(
          (x) => x.typeCategory === 'blType'
        );
        this.blSubTypeList = res?.documents.filter(
          (x) => x.typeCategory === 'blSubType'
        );
        this.shippingTermList = res?.documents.filter(
          (x) => x.typeCategory === 'shippingTerm'
        );
        this.cargotypeList = res?.documents.filter(
          (x) => x.typeCategory === 'cargoType'
        );
        this.itemTypeList = res?.documents.filter(
          (x) => x.typeCategory === 'itemType'
        );
        this.departureModeList = res?.documents.filter(
          (x) => x.typeCategory === 'departureMode'
        );
        this.containerTypeList = res?.documents.filter(x => x.typeCategory === "containerType");

      });
  }
  addAssignContainerOpen(addAssignContainer, row): void {
    this.modalReference = this.modalService.open(addAssignContainer, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',

      ariaLabelledBy: 'modal-basic-title',
    });

    if (row !== 0) {

      this.newassignForm.patchValue({
        id: row.id,
        seq_no: row.seq_no,
        containerNo: row.containerNo,
        marks_nos: row.marks_nos,
        agent_seal_no: row.agent_seal_no,
        no_of_pkgs: row.no_of_pkgs,
        pkg_type: row.pkg_type,
        tare_wt: row.tare_wt,
        net_wt: row.net_wt,
        gross_wt: row.gross_wt,
        wt_unit: row.wt_unit,
        cbm: row.cbm,
        shipping_bill_no: row.shipping_bill_no,
        shipping_bill_date: row.shipping_bill_date,
        doc_compl_date: row.doc_compl_date,
      });

    } else {
      this.newassignForm.reset();
    }

    this.modalReference.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    });
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
  onClose1(evt) {
    this.CloseNew.emit(evt);
  }


  deleteContainer(content1, id) {
    this.modalService
      .open(content1, {
        backdrop: 'static',
        keyboard: false,
        centered: true,
        size: 'sm',

        ariaLabelledBy: 'modal-basic-title',
      })
      .result.then(
        (result) => {
          if (result === 'yes') {
            let index = this.containerBillsData?.findIndex(
              item => item.containerId === id.containerId
            )

            var containerArr = []

            this.containesList.forEach(e => {

              let filterArr = this.containerBillsData?.filter(el => (el.containerId === e.containerId))
              if (filterArr.length > 0) {
                e.isAssigned = false
              }
              let arr = []
              arr[0] = { containerId: e.containerId }
              delete e.containerId
              arr[1] = { $set: e }
              containerArr.push(arr)
            })


            // this._api
            //   .SaveOrUpdate(
            //     Constant.MULTI_UPDATE_CONTAINER,
            //     containerArr
            //   )
            //   .subscribe(
            //     (res: any) => {

            //       if (!res.errors) {

            //       }
            //     },
            //     (error) => {
            //       this.notification.create('error', error, '');
            //     }
            //   );
            this.containerBillsData?.splice(index, 1)
          }

        },

      );
  }
  igmChange() {

  }
  hblChange(flag?) {
    this.HBLPart = this.addblForm.get('bl_type').value
    return
    if (this.HBLPart === 'MBL') {
      this.consigneeHBLList = [{ "name": "J M Baxi", "partymasterId": 'J M Baxi' }]
      this.shipperHBLList = [{ "name": "SHIPEASY", "partymasterId": 'SHIPEASY' }]

      if (flag) {
        this.addblForm.get('shipper').setValue('SHIPEASY')
        this.addblForm.get('consignee').setValue('J M Baxi')
        this.addblForm.get('shipper_address').setValue('')
        this.addblForm.get('consignee_address').setValue('')
      }


    } else {
      this.consigneeHBLList = this.consigneeList
      this.shipperHBLList = this.shipperList
      let shipperAdd = this.shipperHBLList.filter((x) => x?.partymasterId === this.batchDetails?.enquiryDetails?.basicDetails?.shipperId)[0]?.addressInfo?.address;
      let consigneeAdd = this.consigneeHBLList.filter((x) => x?.partymasterId === this.batchDetails?.enquiryDetails?.basicDetails.consigneeId)[0]?.addressInfo?.address;
      if (flag) {
        this.addblForm.get('shipper').setValue(this.batchDetails?.enquiryDetails?.basicDetails.shipperId)
        this.addblForm.get('consignee').setValue(this.batchDetails?.enquiryDetails?.basicDetails.consigneeId)
        this.addblForm.get('shipper_address').setValue(shipperAdd)
        this.addblForm.get('consignee_address').setValue(consigneeAdd)
      }


    }

  }
  consolidatedBatches:any=[]
  getBatchList() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      consolidationbookingId : this.consolidateBookingId,
    }
    this.commonService.getSTList('consolidationbooking', payload)
      ?.subscribe((data: any) => {
        this.batchDetails = data.documents[0];
        this.consolidatedBatches = this.batchDetails.batchList
        // this.patchValue(this.batchDetails, false)

      });
  }

  disabledEtaDate = (current: Date): boolean => {
    if (!this.batchDetails?.bookingDate) { return false }
    return differenceInCalendarDays(new Date(current), new Date(this.batchDetails?.bookingDate)) < 0;
  };

  onCheck(evt, check, i) {
    console.log(check);


    if (evt.target.checked) {
      check.palletDetails.forEach(element => {
        this.checkedContainers.push({
          ...element,
          batchId: check.branchId,
          batchNo: check.batchNo
        });
      });

    }
    else {
      let index = this.checkedContainers.findIndex(
        item => item.batchId === check?.batchId
      )
      this.checkedContainers.splice(index, 1)
    }
    this.isContainerSelected = this.checkedContainers && this.checkedContainers.length > 0 ? false : true
    console.log(this.checkedContainers);

  }

  onEnterKey(evt, check, i) {
    let index = this.checkedContainers.findIndex(
      item => item.containerId === check?.containerId
    )
    this.checkedContainers[index] = {
      ...check,
      tareWeight: ((<HTMLInputElement>document.getElementById('tar' + i)).value).toString() || '',
      netWeight: ((<HTMLInputElement>document.getElementById('net' + i)).value).toString() || '',
      grossWeight: ((<HTMLInputElement>document.getElementById('gross' + i)).value).toString() || '',
      sealNo: ((<HTMLInputElement>document.getElementById('seal' + i)).value).toString() || '',
      rfidNo : ((<HTMLInputElement>document.getElementById('seal' + i)).value).toString() || '',
      package : ((<HTMLInputElement>document.getElementById('package' + i)).value).toString() || '',
    }
  }
  checked(e) {
    if (this.containerBillsData?.filter(x => x?.batchNo === e?.batchNo).length > 0) {
      return true
    } else {
      return false
    }
  }

  AddContainer() {



    this.checkedContainers.filter((x) => {
      let itemIndex = this.containesList.findIndex(item => item.batchNo === x.batchNo);
      this.containesList[itemIndex] = { ...x };
    })

    this.containerBillsData = [];

    this.checkedContainers.map((x) => {
      this.containerBillsData?.push(x)
    })
    console.log(this.containerBillsData ,'ss');
    // this.isContainerSelected = this.containerBillsData?.length === 0 ? false : true;

    this.containerBillsData = this.containerBillsData?.filter((v, i) => this.containerBillsData?.findIndex(item => item?.batchNo === v?.batchNo) === i);
    this.isContainerSelected = this.containerBillsData && this.containerBillsData?.length > 0 ? false : true

    if (!this.isContainerSelected) {
      this.modalService.dismissAll();
    }
  }
  close() {
    this.modalService.dismissAll();
  }
  checkBLNO() {
    let filterArr = []
    filterArr = this.blData?.filter(e => e.blNumber === this.addblForm.value.bl_no)
    let isDuplicate = filterArr.length > 0 ? true : false
    if (isDuplicate) {
      this.notification.create('error', 'BL no. is already in used', '');
    }
  }
  productData() {
    if (!this.addblForm.value.product_id) {
      return false
    }
    let data = this.productList.filter(x => x.productId === this.addblForm.value.product_id)[0];
    this.addblForm.controls.cargoType.setValue(data?.productType)
    this.addblForm.controls.technical_name.setValue(data?.technicalName)
    this.addblForm.controls.imco_class.setValue(data?.imcoClass)
    this.addblForm.controls.un_no.setValue(data?.unNumber)
  }
  Documentpdf:any;
  printData() {
    let reportpayload1 = { "parameters": { "blId": this.id } }
    this.commonService.pushreports(reportpayload1, 'bolMain').subscribe({
      next: (res: any) => {
      const blob = new Blob([res], { type: 'application/pdf' });
      let temp = URL.createObjectURL(blob);
      this.Documentpdf = temp;
      const pdfWindow = window.open(temp);
      // pdfWindow.print();
      }
    })
  }
}
