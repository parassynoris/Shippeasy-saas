import { Component, OnInit, Output, EventEmitter, Input, PipeTransform, Pipe, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { SharedService } from 'src/app/shared/services/shared.service';
import * as Constant from 'src/app/shared/common-constants';
import { ApiService } from 'src/app/admin/principal/api.service';
import { ApiSharedService } from '../../api-service/api-shared.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { differenceInCalendarDays } from 'date-fns';
import { LoaderService } from 'src/app/services/loader.service';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { CommonService } from 'src/app/services/common/common.service';
import { environment } from 'src/environments/environment';
import * as XLSX from 'xlsx';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { CognitoService } from 'src/app/services/cognito.service';
// import { debug } from 'console';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';
interface ConvertedObject {
  [key: string]: string;
}


@Component({
  selector: 'app-new-stolt-bl',
  templateUrl: './new-stolt-bl.component.html',
  styleUrls: ['./new-stolt-bl.component.scss'],
})

export class NewStoltBLComponent implements OnInit {
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
  import: boolean = false;
  addblForm: FormGroup;
  submitted = false;
  buttonDisabled: boolean = true;
  submittedForAssign = false;
  holdBatchType: any = '';
  todayDate = new Date();
  color: string = 'primary';
  touchUi: boolean = false;
  enableMeridian: boolean = true;
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
  batchNo: any
  jobId: any;
  isAddMode: any;
  preCarriageList: any = ['Yes', 'No'];
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
  locationData: any = [];
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
  currentUrl: string;
  show: boolean = false;
  vehicalList: any = [];
  flightList: any = [];
  isTransport: boolean;
  isImport: boolean;
  form: any;
  lengthData: any;
  uomData: any
  ULDcontainerlist: any = []
  empForm: FormGroup
  dimensionUnitList: any;
  palletTypeslist: any;
  finalvoyageData: any[];
  voyageData: any;
  unitList: any = [];
  hblList: any = [];
  lastUrl: any;
  consolidateBatchList: any = [];
  hasErrorInContainer: boolean = false;
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
    private commonFunction: CommonFunctions,
    private loaderService: LoaderService,
    private cdr: ChangeDetectorRef

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

    this.isExport = localStorage.getItem('isExport') === 'true' ? true : false;
    this.isImport = localStorage.getItem('isImport') === 'true' ? true : false;
    this.isTransport = localStorage.getItem('isTransport') === 'true' ? true : false;
    this.getAddressDropDowns();
    this.setupSearchLocationSubscription();
    this.currentUrl = this.router.url.split('?')[0].split('/')[3];
    this.lastUrl = window.location.href.split('?')[0].split('/').pop();
    this.route.params.subscribe((params) => (this.urlParam = params));
    this.addblForm = this.formBuilder.group({
      consolidateBatch: [[]],
      bl_type: [this.lastUrl === 'addconsolidate' ? 'MBL' : '', [Validators.required]],
      uploadFile: [],
      subBltype: ['', [Validators.required]],
      bl_no: [''],
      agent: ['JM BAXI'],
      shipper: ['', [Validators.required]],
      shipperBranch: [''],
      shipper_address: [''],
      shipper_country: [''],
      shipper_city: [''],
      shipper_state: [''],
      shipper_code: [''],
      consignee_address: [''],
      consignee: ['', [Validators.required]],
      consigneeBranch: [''],
      vessel: [''],
      voyage: [''],
      pre_carriage: [''],
      Import_Export: ['Export'],
      entry_port: [''],
      port_loading: [''],
      place_of_delivery: [''],
      place_of_issue: [''],
      additional: [''],
      shipping_line: [''],
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
      notifyParty1Branch: [''],
      notifyParty2Branch: [''],
      notifyParty3Branch: [''],
      address1: [''],
      address2: [''],
      address3: [''],
      manifest_remarks: [''],
      load_place: [''],
      telexDate: [''],
      hblreleaseDate: [''],
      releaseType: [''],
      freight_term: [''],
      // rfsDate: [''],
      // shippedDate: [''],
      releaseDate: [''],
      container: this.formBuilder.array([]),
      mbl: [''],
      IGM_Filed: [false],
      blDate: [null, [Validators.required]],
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
      VesselSellingDate: [null],
      blscanningId:[null],
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
      goodsDescription: [''],
      polRemarks: [''],
      flightNo: [''],
      sblChecked: [false],
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
    this.batchId = this.route.snapshot.params['id'];
    this.id = this.route.snapshot.params['moduleId'];
    this.isAddMode = !this.id;
    // this.getGRN();
    this.getPortDropDowns();
    this.getLocationDropDowns();
    this.getPortDropDowns();
    this.getVesselListDropDown();
    this.getAirPort();
    // this.getVoyageListDropDown();
    // this.getproductDropDowns();
    this.getSystemTypeDropDowns();
    //this.getSmartAgentList()
    // this.getShippingInstru()
    this.getShippingLineDropDowns()
    this.getCurencyData()
    this.getAir()
    this.getLand()
    this.getblDataForMBL()
    // this.getFreightCharges(this.batchId)
  }
  isBlData: boolean = false
  allBlData: any = []
  allMBlData : any = []
  getblDataForMBL() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      // "batchId": this.route.snapshot.params['id']

      $or: [
        {
          batchId: this.route.snapshot.params['id'],
        },
        {
          "consolidatedJobs.batchId": this.route.snapshot.params['id']
        }
      ]
    }
    this._api.getSTList(Constant.BL_LIST, payload)
      ?.subscribe((data: any) => {
        this.allBlData = data?.documents?.filter((x) => (x.blType === 'HBL' || x.blType === 'HAWB'))
        this.allMBlData = data?.documents?.filter((x) => (x.blType === 'MBL' || x.blType === 'AWB'))
        this.isBlData = data?.documents?.some(item => (item.blType === 'MBL' || item.blType === 'AWB'));
      });
  }
  disabledDate = (current: Date): boolean => {
    const yesterdayDate = new Date(this.todayDate);
    yesterdayDate.setDate(this.todayDate.getDate() - 1);
    return current && current < yesterdayDate;
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
  getCurencyData() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      "status": true
    }
    this._api.getSTList("currency", payload)?.subscribe((res: any) => {
      this.currencyList = res?.documents;
    });
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
  onInputChange(event: any) {
    const input = event.target.value;
    const formattedInput = input.replace(/[^0-9A-Za-z-/]/g, '')
      .toUpperCase();

    event.target.value = formattedInput;
    this.addblForm.get('bl_no').setValue(formattedInput, { emitEvent: false });
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
    if (payload?.query) payload.query = {
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
  async ngOnInit(): Promise<void> {
    this.empForm = this.formBuilder.group({
      cargos: this.formBuilder.array([this.newCargo()]),
    });

    if (this.lastUrl === 'addconsolidate') {
      this.addblForm.get('consolidateBatch').setValidators(Validators.required)
      this.addblForm.get('consolidateBatch').updateValueAndValidity()
    }
    this.HBLValidate();

    if (!this.isAddMode) {
      this.getBLById(this.id);
    } else {
      this.radioButtonChange('Pallets', 0);

    }
    this.getBatchList()

    if (this.isType === 'show') {
      this.addblForm.disable();
    }
    await this.getblData();
   this.getContainer();
    if (this.currentUrl === 'show') {
      this.addblForm.disable();
      this.newassignForm.disable();
      this.show = true
    }
    this.getUomList()
    this.getunitList()
    this.getblDataforHbl()
  }
  getContainerData(data) {
    let dataArray = []
    data?.filter((x) => {
      dataArray.push(x?.mastercontainerId?.toString())
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
  getBLById(id: string) {
    if (!id) {
      console.error("Error: BL ID is undefined.");
      return;
    }

    this.isEdit = this.isType !== 'cloneBl';
    this.isAddMode = this.isType === 'cloneBl';

    let payload = this.commonService.filterList();
    payload.query = { blId: id };

    this._api.getSTList(Constant.BL_LIST, payload).subscribe({
      next: (res: any) => {
        if (!res?.documents?.length) {
          console.error("Error: No BL details found for the provided ID.");
          return;
        }
        this.billDetail = res.documents[0];
        this.patchValue(this.billDetail, true);
        this.containerBillsData = this.billDetail?.containers || [];

        if (Array.isArray(this.billDetail?.ULDcontainersDetails)) {
          this.billDetail.ULDcontainersDetails.forEach(e =>
            this.addContainerRow(e, this.isType === 'show')
          );
        }

        const cargoArray = this.empForm.get('cargos') as FormArray;
        cargoArray.clear();

        (this.billDetail?.looseCargoDetails?.cargos || []).forEach((cargo, index) => {
          const cargoFormGroup = this.newCargo();
          cargoFormGroup.patchValue(cargo);
          if (this.isType === 'show') cargoFormGroup.disable();
          cargoArray.push(cargoFormGroup);
          this.radioButtonChange(cargo?.pkgname, index);
        });

        if (this.isImport) {
          this.containesUpdateList = this.billDetail?.containers || [];
        }

        if (this.billDetail?.grn?.length > 0) {
          this.grnData = this.grnList?.filter((x) => this.billDetail?.grn?.find((y) => y.grnId == x.grnId))
        }


      },
      error: (err) => {
        console.error("Error fetching BL details:", err);
      }
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
    if (this.isImport) {

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
    async getblData() {
      try {
        let payload = this.commonService.filterList();

        if (payload?.query) {
          payload.query = {
            $or: [
              { batchId: this.batchId },
              { "consolidatedJobs.batchId": this.batchId }
            ]
          };
        }

        const data: any = await this._api.getSTList(Constant.BL_LIST, payload).toPromise();
        this.blData = data.documents;

      } catch (error) {
        console.error('Error fetching BL data:', error);
      }
    }

  getblDataforHbl() {
    let payload = this.commonService.filterList();

    // Ensure payload.query exists
    if (payload?.query) payload.query = {
      ...payload.query, // Merge with existing query
      // batchId: this.batchId,
      $or: [
        {
          batchId: this.batchId,
        },
        {
          "consolidatedJobs.batchId": this.batchId
        }
      ]
    };

    this._api.getSTList(Constant.BL_LIST, payload)?.subscribe((data: any) => {
      let hblListHold = [];

      // Assign raw data to blData
      this.blData = data.documents;

      // Filter HBL-specific data
      const filteredData = this.blData.filter((item: any) =>
        item.batchId === this.batchId &&
        (item.blType === "HBL" || item.blType === "HAWB") &&
        (item.blTypeName === "HBL" || item.blTypeName === "HAWB")
      );

      // Transform filtered data for HBL list
      filteredData.forEach(item => {
        hblListHold.push({
          item_id: item.blId, // Assuming `blId` as unique identifier
          item_text: item.blNumber, // Assuming `blNumber` as display text
          containers: item?.containers ?? []
        });
      });

      // Assign the transformed data to hblList
      this.hblList = hblListHold;
    });
  }



  onCloseBill(evt) {
    if (this.currentUrl === 'show') {
      this.CloseBillSection.emit('show');
    }
    else {
      this.CloseBillSection.emit('add');
    }
  }


  get f() {
    return this.addblForm.controls;
  }
  get f1() {
    return this.newassignForm.controls;
  }

  uploadDoc(event) {
    this.documents = [];
    const files = event.target.files;

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('file', files[i], files[i].name);
      formData.append('name', files[i].name);

      this.commonService.uploadDocuments("bill", formData).subscribe({

        next: (response) => {
          this.documents.push({
            fileName: files[i]
          });
        },
        error: (err) => {
        }
      });
    }
  }
  downloadFile(doc) {
    this.commonService.downloadDocuments('downloadpublicfile', doc.pdfUrl).subscribe(
      (res: Blob) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        let temp = URL.createObjectURL(blob);
        const pdfWindow = window.open(temp);
        pdfWindow.print();
      },
      (error) => {
        console.error(error);
      }
    );
  }

  convertTo2DArray(originalArray) {
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


    this.containesList.forEach((x) => {
      uniqueArray?.forEach((y) => {
        if (y?.container_no == x?.containerNumber) {
          x.tareWeight = y?.['tare_wt_.']?.split(' ')?.[0] || ''
          x.netWeight = y?.['vgm_wt_']?.split(' ')?.[0] || ''
          x.package = y?.packages?.split(' ')?.[0] || 0
          x.packageUnit = y?.packages?.split(' ')?.[1] || ''
          x.grossWeight = y?.['gross_wt_.']?.split(' ')?.[0] || ''
          x.sealNo = y?.['s_/_l_seal'] || ''
          x.rfidNo = y?.['s_/_l_seal'] || ''
        }
      })
    })
    return uniqueArray;
  }

  errorList: any = []
 readFile(openError) {
  if (this.uploadFile) {
    this.errorList = [];
    const formData = new FormData();
    formData.append('file', this.uploadFile, `${this.uploadFile}`);
    formData.append('name', `${this.uploadFile.name}`);
    formData.append('batchId', this.batchId);
    this.commonService.uploadDocumentsBL(`scan-bl`, formData).subscribe({
      next: (res) => {
        if (res?.status?.toLowerCase() === "error" || res?.error) {
          this.notification.create('error', res?.message || 'Something went wrong', '');
          return;
        }
        this.billDetail = res.blObject;
        this.patchValue(this.billDetail, true);
        this.containerBillsData = this.billDetail?.containers || [];
        this.hasErrorInContainer = this.containerBillsData?.some(x => x.hasError);

        let shipper = this.partyMasterNameList?.find((x) =>
          x.name?.toLowerCase() == res?.Shipper?.split(',')[0]?.toLowerCase()
        );
        let consignee = this.partyMasterNameList?.find((x) =>
          x.name?.toLowerCase() == res?.Consignee?.split(',')[0]?.toLowerCase()
        );
        let notifyParty1 = this.partyMasterNameList?.find((x) =>
          x.name?.toLowerCase() == res?.Notify_Party?.split(',')[0]?.toLowerCase()
        );

        let vesselData = res['Vessel_&_Voyage']?.split(" ");
        let vessel = this.vesselList?.find((x) => x.vesselName == vesselData[0]);

        let loadPort = this.portList?.find((x) =>
          x.portName?.toLowerCase()?.replace(/\s+/g, '')
            ?.includes(res?.Port_Of_Loading.split(",")[0]?.toLowerCase()?.replace(/\s+/g, ''))
        );
        let destPort = this.portList?.find((x) =>
          x.portName?.toLowerCase()?.replace(/\s+/g, '')
            ?.includes(res?.Port_Of_Discharge.split(",")[0]?.toLowerCase()?.replace(/\s+/g, ''))
        );

        let loadPlace = this.locationData?.find((x) =>
          x.locationName?.toLowerCase()?.replace(/\s+/g, '')
            ?.includes(res?.Place_Of_Acceptance.split(",")[0]?.toLowerCase()?.replace(/\s+/g, ''))
        );
        let destPlace = this.portLocationList?.find((x) =>
          x.locationName?.toLowerCase()?.replace(/\s+/g, '')
            ?.includes(res?.Place_Of_Delivery.split(",")[0]?.toLowerCase()?.replace(/\s+/g, ''))
        );

        if (shipper?.partymasterId && shipper.partymasterId !== this.batchDetails?.enquiryDetails?.basicDetails.shipperId) {
          this.errorList.push({ name: `${shipper.name} Does not match with job details shipper name - ${this.batchDetails?.enquiryDetails?.basicDetails.shipperName}` });
        }
        if (consignee?.partymasterId && consignee.partymasterId !== this.batchDetails?.enquiryDetails?.basicDetails.consigneeId) {
          this.errorList.push({ name: `${consignee.name} Does not match with job details consignee name - ${this.batchDetails?.enquiryDetails?.basicDetails.consigneeName}` });
        }
        if (vessel?.vesselId && vessel.vesselId !== this.batchDetails?.quotationDetails.vesselId) {
          this.errorList.push({ name: `${vessel.vesselName} Does not match with job details vessel name -  ${this.batchDetails?.quotationDetails?.vesselName}` });
        }
        if (loadPort?.portId && loadPort?.portId !== this.batchDetails?.enquiryDetails.routeDetails?.loadPortId) {
          this.errorList.push({ name: `${loadPort?.portName} Does not match with job details Load Port name -  ${this.batchDetails?.enquiryDetails.routeDetails?.loadPortName}` });
        }
        if (destPort?.portId && destPort?.portId !== this.batchDetails?.enquiryDetails.routeDetails?.destPortId) {
          this.errorList.push({ name: `${destPort?.portName} Does not match with job details Destination Port name -  ${this.batchDetails?.enquiryDetails.routeDetails?.destPortName}` });
        }
        if (loadPlace?.locationId && loadPlace?.locationId !== this.batchDetails?.enquiryDetails.routeDetails?.loadPlace) {
          this.errorList.push({ name: `${loadPlace?.locationName} Does not match with job details Load Place name -  ${this.batchDetails?.enquiryDetails.routeDetails?.loadPlaceName}` });
        }
        if (destPlace?.locationId && destPlace?.locationId !== this.batchDetails?.enquiryDetails.routeDetails?.location) {
          this.errorList.push({ name: `${destPlace?.locationName} Does not match with job details Location name -  ${this.batchDetails?.enquiryDetails.routeDetails?.locationName}` });
        }
        this.modalService.open(openError, {
          backdrop: 'static',
          keyboard: false,
          centered: true,
          size: 'lg',
          ariaLabelledBy: 'modal-basic-title',
        }).result.then((result) => {
          if (result === 'yes') {
            if (res?.table) {
              this.convertTo2DArray(res?.table);
            }
            this.addblForm.patchValue({
              bl_no: res?.Bill_of_Lading_Number,
              shipper: shipper?.partymasterId,
              consignee: consignee?.partymasterId,
              shipper_address: shipper?.addressInfo?.address,
              shipper_country: shipper?.addressInfo?.countryName,
              shipper_city: shipper?.addressInfo?.cityName,
              shipper_state: shipper?.addressInfo?.stateName,
              shipper_code: shipper?.addressInfo?.postalCode?.toString() || '',

              consignee_address: consignee?.addressInfo?.address,
              vessel: vessel?.vesselId,
              voyage: vesselData[1],

              notifyParty1: notifyParty1?.partymasterId,
              address1: notifyParty1?.addressInfo?.address,
              pre_carriage: '',

              port_loading: loadPort?.portId,
              entry_port: destPort?.portId,

              place_of_delivery: destPlace?.locationId,
              load_place: loadPlace?.locationId,

              freight_term: '',
            });
          } else {
            this.uploadFile = null;
          }
        });
      },

      error: (error) => {
        let errorMessage='';
         if (error?.error?.message) {
          errorMessage = error.error.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }
        this.notification.create('error',errorMessage || 'Server error occurred', '');
      },
    });
  } else {
    this.notification.create('error', 'Please upload file', '');
  }
}

// Ai detection bl model error
modalErrors: string[] = [];
openErrorModal(content: any, errors: string[]) {
  this.modalErrors = errors;
  this.modalService.open(content, {
    backdrop: 'static',
    keyboard: false,
    centered: true,
    size: 'lg',
    ariaLabelledBy: 'modal-basic-title',
  });
}
  onhblChange(event, type) {
    const bl = this.blData.find(i => i.blId === event?.item_id)
    if (type === 'select') {
      if (bl?.containers) {
        bl?.containers.forEach(element => {
          const index = this.containerBillsData.findIndex(i => i.containerId === element?.containerId);
          if (index === -1)
            this.containerBillsData.push({ ...element, type: 'hblmerged' })
          else {
            const newcontainer = this.containerBillsData[index]
            this.containerBillsData[index] = {
              ...newcontainer,
              netWeight: (+(element?.netWeight ?? 0) + +(newcontainer?.netWeight ?? 0)).toFixed(2),
              grossWeight: (+(element?.grossWeight ?? 0) + +(newcontainer?.grossWeight ?? 0)).toFixed(2),
              cbm: (+(element?.cbm ?? 0) + +(newcontainer?.cbm ?? 0)).toFixed(2),
              package: (+(element?.package ?? 0) + +(newcontainer?.package ?? 0)).toFixed(2),
              type: 'hblmerged'
            }
          }
        });
      }

    } else {
      bl?.containers.forEach(element => {
        const index = this.containerBillsData.findIndex(i => i.containerId === element?.containerId);
        if (index !== -1) {
          let newcontainer = this.containerBillsData[index]
          newcontainer = {
            ...newcontainer,
            netWeight: (+(newcontainer?.netWeight ?? 0) - +(element?.netWeight ?? 0)).toFixed(2),
            grossWeight: (+(newcontainer?.grossWeight ?? 0) - +(element?.grossWeight ?? 0)).toFixed(2),
            cbm: (+(newcontainer?.cbm ?? 0) - +(element?.cbm ?? 0)).toFixed(2),
            package: (+(newcontainer?.package ?? 0) - +(element?.package ?? 0)).toFixed(2)
          };
          if (newcontainer?.netWeight === '0.00' && newcontainer?.grossWeight === '0.00' && newcontainer?.cbm === '0.00' && newcontainer?.package === '0.00' && newcontainer?.type === 'hblmerged') {
            this.containerBillsData.splice(index, 1);
          } else
            this.containerBillsData[index] = newcontainer;
        }
      });
    }
  }
  async onSave(e?, flag?) {
    if( this.hasErrorInContainer){
      this.notification.create('error', 'Please resolve container errors', '');
      return;
    }
    // this.HBLValidate();
    var url = Constant.ADD_BL;
    if (this.isAddMode) {
      let filterArr = []
      filterArr = this.blData?.filter(e => e.blNumber === this.addblForm.value.bl_no) || []
      this.isDuplicate = filterArr?.length > 0 ? true : false
      if (this.isDuplicate) {
        this.submitted = true;
        this.notification.create('error', 'Duplicate BL no. not allowed', '');
        return;
      }
    }

    // if (this.isBlData && (this.addblForm.value.bl_type.toLowerCase() === 'mbl' || this.addblForm.value.bl_type.toLowerCase() === 'awb') && this.isAddMode) {
    //   this.notification.create('error', 'MBL is already created', '');
    //   return;
    // }

    if (!flag) {
      if (!this.addblForm.valid) {
        this.submitted = true;
        const invalidFields = [];
        const controls = this.addblForm.controls;
        for (const name in controls) {
          if (controls[name].invalid) {
            invalidFields.push(name);
          }
        }
        this.notification.create('error', `Please fill all required fields`, '');
        return;
      }

      if (this.containerBillsData?.length === 0 && (this.isExport || this.isTransport || this.isImport) && this.batchDetails?.enquiryDetails?.basicDetails?.ShipmentTypeName?.toLowerCase() !== 'air') {
        this.notification.create('error', 'Please assign at least one container', '');
        return;
      }
    } else {
      if (!(this.addblForm.get('bl_type').value && this.addblForm.get('bl_no').value)) {
        this.notification.create('error', 'Please fill Bl type and Bl No.', '');
        return;
      }
    }

    // if (['lcl', 'loose'].includes(this.loadTypeName?.toLowerCase())) {
    //   this.containerBillsData = this.containerBillsData.map(({ expandlooseCargoList, ...rest }) => rest);
    // }
    // if (this.batchDetails?.enquiryDetails?.basicDetails?.loadType === 'Loose') {
    //   if (this.grnData?.length === 0) {
    //     this.notification.create('error', 'Please assign at least one GRN', '');
    //   }
    // }



    var blId = '';
    if (!this.isAddMode) {
      url = Constant.UPDATE_BL + '/' + this.id;
      blId = this.id;
    }

    let containersList = []
    let date = new Date()
    if (this.isExport || this.isTransport || this.isImport) {
      this.containerBillsData?.forEach(element => {
        containersList.push({
          ...element,
          expandlooseCargoList: [],
          shippingBillNumber: element.shippingBillNumber === '' || element.shippingBillNumber === 'Null' ? date : element?.shippingBillNumber,
          doDate: element.doDate === '' ? date : element?.doDate,
          sobDate: element.sobDate === '' ? date : element?.sobDate,
          blDate: this.addblForm.value.blDate,
          telexDate: this.addblForm.value.telexDate,
          hblreleaseDate: this.addblForm.value.hblreleaseDate,
          evgmDate: element?.evgmDate ? element?.evgmDate : " ",
          depotDate: element?.depotDate === '' ? null : element?.depotDate,
          packageTypeName: this.packageList?.find(packageType => packageType?.systemtypeId === element?.packageType)?.typeName || ''
        })
      });

    }
    else {
      this.containesUpdateList?.forEach(element => {
        containersList.push({
          ...element,
          expandlooseCargoList: [],
          shippingBillNumber: element?.shippingBillNumber === '' || element?.shippingBillNumber === 'Null' ? date : element?.shippingBillNumber,
          doDate: element?.doDate === '' ? date : element?.doDate,
          sobDate: element?.sobDate === '' ? date : element?.sobDate,
          dischargeDate: element?.dischargeDate ? element?.dischargeDate : null,
          blDate: this.addblForm.value.blDate,
          telexDate: this.addblForm.value.telexDate,
          hblreleaseDate: this.addblForm.value.hblreleaseDate,
          evgmDate: element?.evgmDate ? element?.evgmDate : " ",
          depotDate: element?.depotDate === '' ? null : element?.depotDate,
          packageTypeName: this.packageList?.find(packageType => packageType?.systemtypeId === element?.packageType)?.typeName || ''

        })
      });

    }

    this.documents?.filter((x) => {
      let data = {
        documentId: '',
        document: `https://s3-${environment.AWS_REGION}.amazonaws.com/${environment.bucketName}/bl/${x.name}`,
        documentName: x.name,
      };
      this.documentPayload.push(data);
    });

    let tenantId = ""
    this.cognito.getUserDatails().subscribe((resp) => {
      if (resp != null) {
        tenantId = resp.tenantId
      }
    })
    let createBody =
    {
      blDraftStatus: flag ? "Draft" : "Completed",
      pdfUrl: this.uploadFile ? this.uploadFile.name : this.billDetail?.pdfUrl ? this.billDetail?.pdfUrl : '',
      "tenantId": tenantId,
      blId: blId,
      batchNo: this.batchDetails?.batchNo || '',
      batchId: this.batchId,
      jobId: this.jobId,
      Import_Export: this.addblForm.value.Import_Export,
      blType: this.addblForm.value.bl_type,
      subBltype: this.addblForm.value.subBltype,
      blTypeName: this.addblForm.value.bl_type,
      blNumber: this.addblForm.value.bl_no.toString(),
      shipperId: this.addblForm.value.shipper,
      finalShippingLineId: this.addblForm.value.shipping_line || '',
      finalShippingLineName: this.shippingLineList.filter(
        (x) => x.shippinglineId === this.addblForm.value.shipping_line
      )[0]?.name || '',
      shipperName: this.shipperList.filter(
        (x) => x.partymasterId === this.addblForm.value.shipper
      )[0]?.name,
      shipperAddress: this.addblForm.value.shipper_address || '',
      shipper_country: this.addblForm.value.shipper_country || '',
      shipper_city: this.addblForm.value.shipper_city || '',
      shipper_state: this.addblForm.value.shipper_state || '',
      shipper_code: this.addblForm.value.shipper_code?.toString() || '',
      consigneeId: this.addblForm.value.consignee,
      consigneeName: this.consigneeList.filter(
        (x) => x.partymasterId === this.addblForm.value.consignee
      )[0]?.name,
      consigneeAddress: this.addblForm.value.consignee_address || '',
      voyageId: this.addblForm.value.voyage,
      voyageNumber: this.addblForm.value.voyage,
      vessel: this.addblForm.value.vessel || '',
      vesselName: this.vesselList.find(
        (x) => x.vesselId === this.addblForm.value.vessel
      )?.vesselName || '',

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
      loadPlaceName: this.locationData.filter((x) => x?.locationId === this.addblForm.value.load_place)[0]?.locationName || '',
      entryPort: this.portList.filter(
        (x) => x.portId === this.addblForm.value.entry_port
      )[0]?.portName || '',
      entryPortId: this.addblForm.value.entry_port,
      onCarriageId: this.addblForm.value.oncarriage || '',
      onCarriageName: this.onCarrigeList.filter(
        (x) => x.locationId === this.addblForm.value.oncarriage
      )[0]?.name || '',
      placeOfDelivery: this.addblForm.value.place_of_delivery,
      placeOfDeliveryName: this.portLocationList.filter((x) => x?.locationId === this.addblForm.value.place_of_delivery)[0]?.locationName || '',
      stoltAgentId: this.addblForm.value.agent || '',
      stoltAgentName: this.smartAgentList.filter((x) => x?.partymasterId == this.addblForm.value.agent)[0]?.name || '',
      manifestRemarks: this.addblForm.value.manifest_remarks,
      podUnLoc: '',
      polId: this.addblForm.value.port_loading,
      polName: this.portList.filter(
        (x) => x.portId === this.addblForm.value.port_loading
      )[0]?.portName || '',
      placeofIssue: this.addblForm.value.place_of_issue || '',
      placeofReceipt: this.addblForm.value.placeofReceipt || '',
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
      containers: ['lcl', 'loose'].includes(this.loadTypeName?.toLowerCase()) || this.lastUrl === 'addconsolidate'
      ? containersList
      : containersList?.filter((x) => x.batchId == this.batchId) || [],
      status: true,


      shipperBranch: this.addblForm.value.shipperBranch,
      consigneeBranch: this.addblForm.value.consigneeBranch,
      notifyParty1Branch: this.addblForm.value.notifyParty1Branch,
      notifyParty2Branch: this.addblForm.value.notifyParty2Branch,
      notifyParty3Branch: this.addblForm.value.notifyParty3Branch,

      chargeTerm: this.addblForm.value.chargeTerm,


      freightTerm: this.addblForm.value.freightTerm || '',
      freightTermName: this.freightTermsList?.filter((x) => this.addblForm.value.freightTerm === x.systemtypeId)[0]?.typeName || '',

      freightAmount: this.addblForm.value.freightAmount,
      freightCurrency: this.currencyList?.filter(x => x?.currencyId ==
        this.addblForm.value.freightCurrency)[0]?.currencyShortName,
      freightCurrencyId: this.addblForm.value.freightCurrency,

      shippingLineName: this.shippingLineList?.filter((x) => x?.shippinglineId === this.addblForm.value.shippingLine)[0]?.name,
      shippingLineId: this.addblForm.value.shippingLine,
      mbl: this.addblForm.value.mbl,
      IGM_Filed: this.addblForm.value.IGM_Filed,
      blDate: this.addblForm.value.blDate,
      telexDate: this.addblForm.value.telexDate || '',
      hblreleaseDate: this.addblForm.value.hblreleaseDate || '',
      releaseType: this.addblForm.value.releaseType,
      // shippedDate: this.addblForm.value.shippedDate,
      releaseDate: this.addblForm.value.releaseDate,
      // rfsDate: this.addblForm.value.rfsDate,
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
      ULDcontainersDetails: this.addContainerValue() || [],
      noofContainer: this.addblForm.value.noofContainer,
      importPoo: this.addblForm.value.poo,
      importPooName: this.portList.filter(
        (x) => x.portId === this.addblForm.value.poo
      )[0]?.portName,
      importPol: this.addblForm.value.pol,
      importPolName: this.portList.filter(
        (x) => x.portId === this.addblForm.value.pol
      )[0]?.portName,
      importPod: this.addblForm.value.pod,
      importPodName: this.portList.filter(
        (x) => x.portId === this.addblForm.value.pod
      )[0]?.portName,
      importFpod: this.addblForm.value.fpod,
      importFpodName: this.portList.filter(
        (x) => x.portId === this.addblForm.value.fpod
      )[0]?.portName,
      departureMode: this.addblForm.value.departureMode,
      blGeneralRemarks: this.addblForm.value.blGeneralRemarks,
      goodsDescription: this.addblForm.value.goodsDescription,
      shippingMarks: this.addblForm.value.shippingMarks,
      documents: this.documentPayload,
      polRemarks: this.addblForm?.value?.polRemarks,
      containerType: this.addblForm.value.containerType,
      containerTypeName: this.containerTypeList.filter(x => x.systemtypeId ===
        this.addblForm.value.containerType)[0]?.typeName,
      itemNo: this.addblForm.value.itemNo || '',
      subLineNo: this.addblForm.value.subLineNo || '',
      isExport: (this.isExport || this.isTransport),
      flightId: this.addblForm.value.flightNo,
      vehicleId: this.addblForm.value.vehicleNo,
      flightNo: this.flightList?.filter((x) => x.airId === this.addblForm.value.flightNo)[0]?.flight || '',
      vehicleNo: this.vehicalList?.filter((x) => x.landId === this.addblForm.value.vehicleNo)[0]?.vehicleLicence || '',
      looseCargoDetails: this.empForm.value || {},
      apiType: 'status',
      grn: this.grnData?.map((x) => ({ grnNo: x.grnNo, grnId: x.grnId })) || [],

      isBlConsolidated: false,
      consolidatedJobs: [],
      blscanningId:this.addblForm.value.blscanningId || null,
      sblChecked:this.addblForm.value.sblChecked||false,
    }
      ;
    // if (this.batchDetails?.enquiryDetails?.basicDetails?.loadType !== 'ULD Container') {
    createBody.ULDcontainersDetails = [];
    // }
    // if(this.isExport){
    //  let isScreenReady =  this.checkbLValid(createBody)
    //  if(isScreenReady || isScreenReady === undefined){return false}
    // }



    if (this.lastUrl === 'addconsolidate') {
      createBody = {
        ...createBody,
        isBlConsolidated: true
      }
      createBody = {
        ...createBody, consolidatedJobs: this.consolidateBatchList?.filter((x) => this.addblForm.value.consolidateBatch.includes(x.batchId)).map((item) => {
          return {
            batchId: item.batchId,
            batchNo: item.batchNo
          }
        }) || []
      }

      createBody.consolidatedJobs.push({
        batchId: this.batchDetails?.batchId,
        batchNo: this.batchDetails?.batchNo,
      })

      // let updatedData = [createBody]
      // this.addblForm.value.consolidateBatch?.filter((x) => {
      //   updatedData.push({
      //     ...createBody,
      //     containers: containersList?.filter((y) => y.batchId == x) || [],
      //     batchId: x,
      //     batchNo: this.consolidateBatchList.find((y) => y.batchId === x)?.batchNo
      //   })
      // })

      // console.log(updatedData)

      // this.commonService.batchInsert("bl/batchinsert", updatedData).subscribe((data: any) => {
      //   console.log(data)
      //   this.afterSave(data, data)
      // });
    }
    // else {

    console.log(createBody)

    let apiCalls = this.commonService.addToST(url, createBody);
    if (!this.isAddMode) {
      apiCalls = this.commonService.UpdateToST(url, { ...createBody, consolidatedJobs: this.billDetail?.consolidatedJobs || [], isBlConsolidated: this.billDetail?.isBlConsolidated || false });
    }
    await apiCalls.subscribe(async (data: any) => {
      this.afterSave(data)
    }, (error) => {
      this.notification.create('error', error?.error?.error?.message, '');
    });
    // }

  }

  afterSave(data, dataArray?) {
    if (data) {
      let updatedData = []

      if (this.addblForm.value.shipping_line && (this.isExport || this.isTransport)) {
        // this.getShippingLineCharges(this.batchDetail)
      }
      if (this.isExport || this.isTransport || this.isImport) {
        this.containesList?.forEach((element) => {
          this.containerBillsData.filter((x) => {
            if (x?.containerNumber === element?.containerNumber) {
              updatedData.push({
                ...element, blNumber: this.addblForm.value.bl_no,
                blDate: this.addblForm.value.blDate,
                sealNo: x.sealNo,
                tareWeight: x?.grossWeight || '0.00',
                grossWeight: x?.grossWeight || '0.00',
                package: x?.package || '0.00',
                netWeight: x?.netWeight || '0.00',
                cbm: x?.cbm || '0.00',
                isAssigned: true
              })
            }
          });
        })
      }

      // if (this.isImport) {
      //   containersList?.forEach((element) => {
      //     updatedData.push({
      //       ...element, blNumber: this.addblForm.value.bl_no,
      //       blDate: this.addblForm.value.blDate,
      //       isAssigned: true
      //     })
      //   })
      // }

      // if (this.lastUrl === 'addconsolidate') {
      //   let batchUpdateData = [];
      //   const selectedBatches = this.consolidateBatchList?.filter(x => this.addblForm.value.consolidateBatch?.includes(x.batchId)) || [];
      //   const batchesToUpdate = [this.batchDetails, ...selectedBatches];

      //   batchesToUpdate.forEach(element => {
      //     const { _id, ...rest } = element;
      //     batchUpdateData.push({
      //       ...rest,
      //       mblNumber: data?.blNumber,
      //       consolidateBatch: true
      //     });
      //   });
      //   this.commonService.batchUpdate("batch/batchupdate", batchUpdateData).subscribe();
      // } else {
      this.updateBatchData(data);
      // }

      // if (this.isAddMode) {
      //   apiCalls = this.commonService.UpdateToST(`batch/${this.batchId}`, { batchId: this.batchId, [`${this.addblForm.value.bl_type}Status`]: 'Created' })
      //   await apiCalls.subscribe((res) => {
      //     console.log('BL Status updated');
      //   })
      // }
     // this.commonService.batchUpdate(Constant.MULTI_UPDATE_CONTAINER, updatedData).subscribe();
      if (this.isAddMode) {
        this.submitted = false;
        this.notification.create('success', 'Added Successfully', '');
      } else {
        this.submitted = false;
        this.notification.create('success', 'Updated Successfully', '');
      }

      let updatedMasterCont = []
      if (this.isExport || this.isTransport || this.isImport) {
        this.containerBillsData?.forEach((x) => {
          this.containerHistoryList?.forEach((element) => {
            if (x?.containerNumber?.replace(/\s/g, "") === element?.containerNo?.replace(/\s/g, "")) {
              updatedMasterCont.push({
                ...element,
                bookingref: "",
                shippingBill: x?.shippingBillNumber,
                customCode: "",
                blno: this.addblForm.value.bl_no,
                pod: data?.payload?.importPodName,
                shipper: data?.payload?.shipperName,
                consignee: data?.payload?.consigneeName,
                // dono: "",
                doDate: x?.doDate || '',
                principal: "",
              })
            }
          });
        })

      }
      // if (this.isImport) {
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
      if (updatedMasterCont?.length > 0)
        // this.commonService.batchUpdate(Constant.MULTI_UPDATE_CONTAINER_master, updatedMasterCont).subscribe();



      if (['lcl', 'loose'].includes(this.loadTypeName?.toLowerCase())) {

        this.allconsolidateData?.filter((conso) => {



          let payload: any = {};

          const batchData = conso?.batchwiseGrouping?.find(
            (element) => element?.batchId === this.batchId
          );

          if (batchData) {
            payload = {
              ...conso,
              items: batchData.items?.map((item) => {
                let selectedData;

                this.containerBillsData?.forEach((y) => {
                  y.expandlooseCargoList?.forEach((z) => {
                    if (item._id === z._id) {
                      selectedData = z;
                    }
                  });
                });

                if (this.addblForm.value.shipper) {
                  return selectedData?.isSelected && selectedData?.lclShipper == this.addblForm.value.shipper
                    ? { ...item, isBlCreated: true, blNo: this.addblForm.value.bl_no || "", blId: data?.blId || '' }
                    : { ...item, isSelected: false };
                } else {
                  return selectedData?.isSelected
                    ? { ...item, isBlCreated: true, blNo: this.addblForm.value.bl_no || "", blId: data?.blId || '' }
                    : { ...item };
                }


              }),
            };

            // Remove batchwiseGrouping from payload
            delete payload.batchwiseGrouping;
          }
          this.commonService.UpdateToST(`consolidationbooking/${payload?.consolidationbookingId}`, payload)?.subscribe();
        })


      }

      this.router.navigate(['/batch/list/add/' + this.route.snapshot.params['id'] + '/bl']);
      // setTimeout(() => {
      //   this.getblData()
      // }, 1000);
    }
  }
  updateBatchData(res) {

    let payload;
    if (this.addblForm.value.bl_type == 'HBL' || this.addblForm.value.bl_type == 'HAWB') {
      const HBLdata = this.allBlData?.filter((x) => x.blId !== res?.blId)
      HBLdata.push(res)
      let HBLNumber = []
      let HBLStatus = true
      HBLdata.filter((x) => {
        if (x.hblreleaseDate == '' || x.hblreleaseDate == null) {
          HBLStatus = false
        }
        HBLNumber.push(x?.blNumber)
      })

      payload = {
        // ...this.batchDetails,
        // HBLStatus : HBLStatus ? 'Completed' : 'Pending',
        hblNumbers: HBLNumber?.toString()
      }
      this.commonService.UpdateToST(`batch/${this.batchDetails?.batchId}`, payload).subscribe()
    }
    if (this.addblForm.value.bl_type == 'MBL' || this.addblForm.value.bl_type == 'AWB') {

      const MBLdata = this.allMBlData?.filter((x) => x.blId !== res?.blId)
      MBLdata.push(res)
      let MBLNumber = []
      MBLdata.filter((x) => {
        MBLNumber.push(x?.blNumber)
      })

      payload = {
        // ...this.batchDetails,
        mblNumber: MBLNumber?.toString()
      }

    if (this.billDetail?.isBlConsolidated || this.lastUrl === 'addconsolidate') {
      let batchUpdateData = [];

      if (this.billDetail?.isBlConsolidated) {
        this.billDetail?.consolidatedJobs?.forEach(element => {
          batchUpdateData.push({
            ...element,
            ...payload,
          })
        })
      } else {

        const selectedBatches = this.consolidateBatchList?.filter(x => this.addblForm.value.consolidateBatch?.includes(x.batchId)) || [];
        const batchesToUpdate = [this.batchDetails, ...selectedBatches];

        batchesToUpdate.forEach(element => {
          const { _id, ...rest } = element;
          batchUpdateData.push({
            ...rest,
            ...payload,
            consolidateBatch: true
          });
        });
      }

      this.commonService.batchUpdate("batch/batchupdate", batchUpdateData).subscribe();

    } else {
      this.commonService.UpdateToST(`batch/${this.batchDetails?.batchId}`, payload).subscribe()
    }
  }
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
    if (payload?.query) payload.query = {
      "agentId": this.commonFunction.getAgentDetails().agentId
    }
    this.commonService.getSTList(Constant.AGENTADVICELIST, payload)?.subscribe((data: any) => {
      this.smartAgentList = data.documents;
      if (this.currentUrl !== 'add' && this.currentUrl !== 'addconsolidate') {
        this.addblForm.get('agent').setValue(this.commonFunction.getAgentDetails().agentId)
      }
    })
  }
  getCharges(res) {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
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
  readonly nzFilterOption = (): boolean => true;
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
        telexDate: data?.telexDate || '',
        releasedate: data?.releasedate || '',
        releaseType: data?.releaseType || '',
        statusMbl: data?.statusMbl || '',
        bl_no: this.isAddMode ? data?.blNumber || '' : data?.blNumber || '',
        agent: data?.stoltAgentId || 'JM BAXI',
        Import_Export: data?.Import_Export || 'Export',
        shipper: data?.shipperId || '',
        shipper_address: data?.shipperAddress || '',
        shipper_country: data?.shipper_country || '',
        shipper_city: data?.shipper_city || '',
        shipper_state: data?.shipper_state || '',
        shipper_code: data?.shipper_code?.toString() || '',
        consignee_address: data?.consigneeAddress || '',
        consignee: data?.consigneeId || '',

        shipperBranch: data?.shipperBranch || '',
        consigneeBranch: data?.consigneeBranch || '',
        notifyParty1Branch: data?.notifyParty1Branch || '',
        notifyParty2Branch: data?.notifyParty2Branch || '',
        notifyParty3Branch: data?.notifyParty3Branch || '',

        vessel: data?.vessel,
        voyage: data?.voyageId,
        pre_carriage: this.isAddMode ? data?.enquiryData?.preCarriageId : data?.preCarrigeById || '',
        entry_port: data?.entryPortId || '',
        port_loading: data?.polId || '',
        // entry_port: this.isAddMode ? data?.enquiryData?.destPortId : data?.entryPortId || '',
        // port_loading: this.isAddMode ? data?.enquiryData?.loadPortId : data?.polId || '',
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
        // notifyParty1: this.isAddMode ? data?.notifyPartyId : data?.notify_party1 || '',
        notifyParty1: data?.notify_party1 || '',
        notifyParty2: data?.notify_party2 || '',
        notifyParty3: data?.notify_party3 || '',
        // address1: this.isAddMode ? this.findNotifyADD(data?.notifyPartyId) || '' : data?.address1 || '',
        address1: data?.address1 || '',
        address2: data?.address2 || '',
        address3: data?.address3 || '',
        doInvoice: data?.doInvoice || false,
        documentInvoice: data?.documentInvoice || false,
        handlingFees: data?.handlingFees || '',
        manifest_remarks: data?.manifestRemarks || false,
        load_place: this.isAddMode ? data?.enquiryData?.loadPlace : data?.loadPlace || '',

        shippingLine: this.isAddMode ? data?.finalShippingLineId ? data?.finalShippingLineId : data?.shippingLineId : data?.shippingLineId || '',
        mbl: data?.mbl || '',
        IGM_Filed: data?.IGM_Filed || false,
        blDate: data?.blDate || '',
        hblreleaseDate: data?.hblreleaseDate || '',
        // shippedDate: data?.shippedDate || '',
        // rfsDate: data?.rfsDate || '',
        releaseDate: data?.releaseDate || '',
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
        goodsDescription: data?.goodsDescription || '',
        flightNo: data?.flightId || '',
        vehicleNo: data?.vehicleId || '',
        shipping_line: data?.finalShippingLineId || '',
        //here we check if file is uploaded then we given blscanningId from respoonse
        blscanningId: this.uploadFile ? (data?.blscanningId ?? null) : null,
      });
      setTimeout(() => {
        this.getBranchOfParty()
        this.getBranchOfParty1()
        this.getBranchOfParty2()
        this.getBranchOfParty3()
        this.getBranchOfParty4()
      }, 1000);

    } else {

      let shipperAdd = this.shipperList.filter((x) => x?.partymasterId === this.batchDetails?.enquiryDetails?.basicDetails?.shipperId)[0]?.branch;
      let consigneeAdd = this.consigneeList.filter((x) => x?.partymasterId === this.batchDetails?.enquiryDetails?.basicDetails.consigneeId)[0]?.branch;

      this.addblForm.patchValue({


        shipper: this.batchDetails?.enquiryDetails?.basicDetails.shipperId,
        consignee: this.batchDetails?.enquiryDetails?.basicDetails.consigneeId,
        notifyParty1: this.batchDetails?.enquiryDetails?.basicDetails.consigneeId,

        shipperBranch: shipperAdd?.[0] ? shipperAdd[0]?.branch_name : '',
        consigneeBranch: consigneeAdd ? consigneeAdd[0]?.branch_name : '',
        notifyParty1Branch: consigneeAdd ? consigneeAdd[0]?.branch_name : '',
        shipper_address: shipperAdd?.[0] ? shipperAdd[0]?.branch_address : '',
        shipper_country: shipperAdd?.[0] ? shipperAdd[0]?.countryName : '',
        shipper_city: shipperAdd?.[0] ? shipperAdd[0]?.cityName : '',
        shipper_state: shipperAdd?.[0] ? shipperAdd[0]?.stateName : '',
        shipper_code: shipperAdd[0]?.postalCode?.toString() || '',
        // consignee_address: consigneeAdd[0]?.branch_address,

        vessel: (this.isExport || this.isTransport) ? data?.quotationDetails?.vesselId : data?.quotationDetails?.vesselId,
        voyage: (this.isExport || this.isTransport) ? data?.quotationDetails?.voyageNumber : data?.quotationDetails?.voyageNumber,

        pre_carriage: this.batchDetails.enquiryDetails?.routeDetails?.preCarriageId || '',
        entry_port: this.batchDetails?.enquiryDetails?.routeDetails?.destPortId || '',
        port_loading: this.batchDetails?.enquiryDetails?.routeDetails?.loadPortId || '',
        place_of_delivery: this.batchDetails?.enquiryDetails?.routeDetails?.location || '',
        load_place: this.batchDetails?.enquiryDetails?.routeDetails?.loadPlace || '',
        freight_term: this.batchDetails?.enquiryDetails?.routeDetails?.freightTerms || '',
        shipping_line: this.batchDetails?.routeDetails?.finalShippingLineId ? this.batchDetails?.routeDetails?.finalShippingLineId : this.batchDetails?.quotationDetails?.carrierId,
        flightNo: this.batchDetails?.routeDetails?.flightId ? this.batchDetails?.routeDetails?.flightId : this.batchDetails?.quotationDetails?.flightId,


        // flightNo: this.batchDetails?.quotationDetails?.flightId || '',
        vehicleNo: this.batchDetails?.quotationDetails?.vehicleId || ''
      })
      this.containerArray.clear();
      // if (this.batchDetails?.enquiryDetails?.containersDetails?.length > 0 && this.batchDetails?.enquiryDetails?.basicDetails?.loadType === 'ULD Container') {
      //   this.batchDetails?.enquiryDetails?.containersDetails?.filter(e => {
      //     this.addContainerRow(e)
      //   })
      // }
      const cargoArray = this.empForm.get('cargos') as FormArray;
      cargoArray.clear();
      (this.batchDetails?.enquiryDetails?.looseCargoDetails?.cargos ?? []).forEach((cargo, index) => {
        const cargoArray = this.empForm.get('cargos') as FormArray;
        const cargoFormGroup = this.newCargo();
        cargoFormGroup.patchValue(cargo);
        cargoArray.push(cargoFormGroup);
        this.radioButtonChange(cargo?.pkgname, index);
      });
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
  setfinalVessel(e, changeSL) {
    if (changeSL) {
      this.addblForm.controls.final_voyage.setValue('')
      this.addblForm.controls.final_vessel.setValue('')
      this.addblForm.controls.line_voyage_no.setValue('')
    }
    this.finalvoyageData = []
    if (!e) { return true };
    let vesselData = this.voyageData.filter((x) => x?.vesselId === e)[0]
    vesselData?.voyage?.forEach((element) => {
      if (element?.shipping_line === this.addblForm.value?.shipping_line) {
        this.finalvoyageData.push(element)
      }
    });

  }
  consolidateBatchChange() {
    this.getContainer(true)
  }
  addContainerLoader: boolean = true


  getContainer(flag?: boolean) {
    if (this.loadTypeName === 'LCL' || this.loadTypeName === 'Loose') {
      this.addContainerLoader = true;
    }

    this.loaderService.showcircle();
    let payload = this.commonService.filterList();
    let batchId = this.route.snapshot.params['id'];

    if (flag) {
      const consolidateBatch = this.addblForm.value.consolidateBatch || [];
      batchId = consolidateBatch.length > 0 ? [...consolidateBatch, batchId] : [batchId];
    } else {
      batchId = [batchId];
    }

    if (payload) {
      payload.query = {
        $or: [
          { batchId: { $in: batchId } },
          { "batchwiseGrouping.batchId": { $in: batchId } }
        ]
      };
    }
    this.commonService.getSTList(Constant.CONTAINER_LIST, payload)
      ?.subscribe((data: any) => {
        let documents = data?.documents || [];
        //if sbl is checked then show all containers with starting values from api
        if (this.addblForm.value.sblChecked) {
          documents = documents.map(apiContainer => {
            return {
              ...apiContainer,
              isApiData: true,
              selected_package: Number(apiContainer?.package) || 0,
              selected_cbm: Number(apiContainer?.cbm) || 0,
              selected_grossWeight: Number(apiContainer?.grossWeight) || 0,
              selected_netWeight: Number(apiContainer?.netWeight) || 0,
            };
          });
          const currentBlNo = this.addblForm.get('bl_no')?.value;
          this.addblForm.patchValue({
            bl_no: currentBlNo ? `s-${currentBlNo}` : null
          });
          this.containesList = documents;
          this.containesUpdateList = [...documents];
          this.loaderService.hidecircle();
          return;
        }
       
      // Flatten all containers from all BLs
      const blContainers = (this.blData || []).filter(er => er.blTypeName === this.addblForm.value.bl_type)
        .flatMap(bl => bl?.containers || []);

      console.log('BL Containers:', blContainers); // Debug print

      documents = documents.map(apiContainer => {
        const apiPackage = Number(apiContainer?.package) || 0;
        const apiCbm = Number(apiContainer?.cbm) || 0;
        const apiGrossWeight = Number(apiContainer?.grossWeight) || 0;
        const apiNetWeight = Number(apiContainer?.netWeight) || 0;

        // Get all matching BL containers with the same containerId
        const matchedContainers = blContainers.filter(blC => blC?.containerId === apiContainer?.containerId);

        // Sum all BL values
        const usedPackage = matchedContainers.reduce((sum, c) => sum + (Number(c?.package) || 0), 0);
        const usedCbm = matchedContainers.reduce((sum, c) => sum + (Number(c?.cbm) || 0), 0);
        const usedGrossWeight = matchedContainers.reduce((sum, c) => sum + (Number(c?.grossWeight) || 0), 0);
        const usedNetWeight = matchedContainers.reduce((sum, c) => sum + (Number(c?.netWeight) || 0), 0);

        // Calculate remaining
        const remainingPackage = Math.max(apiPackage - usedPackage, 0);
        const remainingCbm = Math.max(apiCbm - usedCbm, 0);
        const remainingGrossWeight = Math.max(apiGrossWeight - usedGrossWeight, 0);
        const remainingNetWeight = Math.max(apiNetWeight - usedNetWeight, 0);


        return {
          ...apiContainer,
          isApiData: true,
          selected_package: remainingPackage,
          selected_cbm: Number(remainingCbm.toFixed(2)),
          selected_grossWeight: Number(remainingGrossWeight.toFixed(2)),
          selected_netWeight: Number(remainingNetWeight.toFixed(2)),

        };

      });



      if (this.loadTypeName === 'LCL' || this.loadTypeName === 'Loose') {
        const groupOfArray = this.groupById(this.consolidateCTRList);
        this.containesList = documents.filter(x => {
          const group = groupOfArray[x.containerNumber];
          return !group || !group.every(y => y.isBlCreated);
        });
        console.log('Final containesList to render:', this.containesList);
        this.addContainerLoader = false;
        if(!this.addblForm.value.sblChecked){
          this.addblForm.patchValue({ bl_no: this.addblForm.get('bl_no')?.value?.toString().replace(/^s-/, '') || null });
        }
      } else {
        this.containesList = documents; if(!this.addblForm.value.sblChecked){
          this.addblForm.patchValue({ bl_no: this.addblForm.get('bl_no')?.value?.toString().replace(/^s-/, '') || null });
        }

      }

      this.containesUpdateList = [...documents];
      this.loaderService.hidecircle();
    }, error => {
      this.loaderService.hidecircle();
    });


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
  depotList: any = []
  getLocationDropDowns() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      "status": true,
      masterType: {
        "$in": ['YARD', 'CFS', 'ICD']
      },
    }
    this._api.getSTList("location", payload)?.subscribe((res: any) => {

      this.locationData = res?.documents
      this.CFSlocationList = res?.documents.filter((x) => x?.CFS)
      this.ICDlocationList = res?.documents.filter((x) => x?.ICD)
      this.depotList = res?.documents.filter(x => x?.masterType === 'CFS' || x?.masterType === 'YARD' || x?.masterType === 'CFS,YARD')
      this.preCarrigeList = this.ICDlocationList;
      this.onCarrigeList = this.ICDlocationList;
      // this.preCarrigeList = this.ICDlocationList.filter(x => x.country.toLowerCase() === 'india')
      // this.onCarrigeList = this.ICDlocationList.filter(x => x.country.toLowerCase() !== 'india')

    });
  }
  getLocation() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      status: true,
      masterType: {
        "$in": ['YARD', 'CFS', 'ICD']
      },
    }

    this.commonService
      .getSTList('location', payload)
      ?.subscribe((data) => {
        this.locationData = data.documents;
        // this.ICDlocationList = this.locationData.filter((x) => x?.ICD)
        // if ((this.isExport || this.isTransport)) {
        //   this.preCarrigeList = this.ICDlocationList.filter(x => x.country.toLowerCase() === 'india')
        // }
        // this.onCarrigeList = this.ICDlocationList
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
    if (payload?.query) payload.query = {
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
             else if (res?.item_text === 'Agent') { this.smartAgentList.push(x) }
          })
        }
      });
      this.surveyorList = this.vendorList.filter(x => x.survey == 'Survey')

      // if (this.addblForm.get('shipper').value) {
      //   let shipperAdd = this.partyMasterNameList.filter((x) => x?.partymasterId === this.addblForm.get('shipper').value)[0]?.addressInfo?.address;

      //   if (shipperAdd) {
      //     this.addblForm.get('shipper_address').setValue(shipperAdd)
      //   }
      // }
      // if (this.addblForm.get('consignee').value) {
      //   let shipperAdd = this.partyMasterNameList.filter((x) => x?.partymasterId === this.addblForm.get('consignee').value)[0]?.addressInfo?.address;

      //   if (shipperAdd) {
      //     this.addblForm.get('consignee_address').setValue(shipperAdd)
      //   }
      // }
      // if (this.addblForm.get('notifyParty1').value) {
      //   let shipperAdd = this.partyMasterNameList.filter((x) => x?.partymasterId === this.addblForm.get('notifyParty1').value)[0]?.addressInfo?.address;

      //   if (shipperAdd) {
      //     this.addblForm.get('address1').setValue(shipperAdd)
      //   }
      // }

    });
  }


  getAirPort() {
    let payload = this.commonService.filterList()
    if (payload) payload.query = {
      ...payload.query,
      status: true,
    }
    this.commonService.getSTList("airportmaster", payload)?.subscribe((res: any) => {
      res?.documents?.map(x => (
        this.portList.push({
          portId: x?.airportmasterId,
          portName: x?.airPortname,
          portTypeName: 'air'
        })
      ));
    });
  }
  getPortDropDowns() {
    let payload = this.commonService.filterList()

    if (payload) payload.query = {
      status: true,
    }
    if (payload?.size) payload.size = 15000
    if (payload?.project) payload.project = ["portDetails.portName", "portDetails.portTypeName", "portId"];

    this.commonService.getSTList("port", payload)?.subscribe((res: any) => {
      res?.documents?.map(x => (
        this.portList.push({
          portId: x?.portId,
          portName: x?.portDetails?.portName,
          portTypeName: 'port'
        })
      ));


    });
  }

  shipperListBranch: any = []
  getBranchOfParty() {
    this.shipperListBranch = this.shipperList?.filter((x) => x.partymasterId == this.addblForm.get('shipper').value)[0]?.branch
  }
  setAddress0() {
    let address = (this.shipperListBranch ?? [])?.find((x) => x?.branch_name === this.f.shipperBranch.value)
    if (address) {
      this.addblForm.get('shipper_address').setValue(address?.branch_address || '');
      this.addblForm.get('shipper_country').setValue(address?.branch_countryName || '')
      this.addblForm.get('shipper_city').setValue(address?.branch_city || '')
      this.addblForm.get('shipper_state').setValue(address?.branch_stateName || '')
      this.addblForm.get('shipper_code').setValue(address?.pinCode || '')
    }
  }
  consigneeListBranch: any = []
  getBranchOfParty1() {
    this.consigneeListBranch = this.consigneeList?.filter((x) => x.partymasterId == this.addblForm.get('consignee').value)[0]?.branch
  }
  setAddress1() {
    const consignee = (this.consigneeListBranch ?? [])?.find((x) => x?.branch_name === this.f.consigneeBranch.value)
    if (consignee) {
      let address = consignee?.branch_address || '';
      address += ` ${consignee?.branch_city || ''}-${consignee?.pinCode || ''} ${consignee?.branch_stateName || ''}, ${consignee?.branch_countryName || ''} `;
      console.log(address);
      if (address) this.addblForm.get('consignee_address').setValue(address)
    }
  }
  address1ListBranch: any = []
  getBranchOfParty2() {
    this.address1ListBranch = this.notifyList?.filter((x) => x.partymasterId == this.addblForm.get('notifyParty1').value)[0]?.branch
  }
  setAddress2() {
    const partymaster = (this.address1ListBranch ?? [])?.find((x) => x?.branch_name === this.f.notifyParty1Branch.value);
    let address = partymaster?.branch_address || '';

    address += ` ${partymaster?.branch_city || ''}-${partymaster?.pinCode || ''} ${partymaster?.branch_stateName || ''}, ${partymaster?.branch_countryName || ''}`;
    this.addblForm.get('address1').setValue(address)


  }
  address2ListBranch: any = []
  getBranchOfParty3() {
    this.address2ListBranch = this.notifyList?.filter((x) => x.partymasterId == this.addblForm.get('notifyParty2').value)[0]?.branch
  }
  setAddress3() {
    const partymaster = (this.address2ListBranch ?? [])?.find((x) => x?.branch_name === this.f.notifyParty2Branch.value);
    let address = partymaster?.branch_address || '';
    address += ` ${partymaster?.branch_city || ''}-${partymaster?.pinCode || ''} ${partymaster?.branch_stateName || ''}, ${partymaster?.branch_countryName || ''}`;
    this.addblForm.get('address2').setValue(address)
  }
  address3ListBranch: any = []
  getBranchOfParty4() {
    this.address3ListBranch = this.notifyList?.filter((x) => x.partymasterId == this.addblForm.get('notifyParty3').value)[0]?.branch
  }
  setAddress4() {
    const partymaster = (this.address3ListBranch ?? [])?.find((x) => x?.branch_name === this.f.notifyParty3Branch.value);
    let address = partymaster?.branch_address || '';
    address += ` ${partymaster?.branch_city || ''}-${partymaster?.pinCode || ''} ${partymaster?.branch_stateName || ''}, ${partymaster?.branch_countryName || ''}`;
    this.addblForm.get('address3').setValue(address)
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
    if (payload?.query) payload.query = { status: true }
    this._api
      .getSTList('vessel', payload)
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
  packageList: any = []
  containerTypeList: any = []
  getSystemTypeDropDowns() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      "status": true,
      "typeCategory": {
        "$in": [
          'blSubType', "chargeTerm", "freightChargeTerm", 'containerType', 'blType', 'packageType', 'icd', 'shippingTerm', 'preCarriage', 'onCarriage', 'cargoStatus', 'cargoType', 'ULDcontainerType', 'itemType', 'departureMode', 'dimensionUnit', 'palletType', 'packageType'
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
        this.packageList = res?.documents.filter(
          (x) => x.typeCategory === 'packageType'
        );
        this.containerTypeList = res?.documents.filter(x => x.typeCategory === "containerType");
        this.ULDcontainerlist = res?.documents?.filter(x => x.typeCategory === "ULDcontainerType");
        this.dimensionUnitList = res?.documents?.filter(x => x.typeCategory === "dimensionUnit");
        this.palletTypeslist = res?.documents?.filter(x => x.typeCategory === "palletType");

        if (this.isImport) {
          this.blSubTypeList = this.blSubTypeList.filter(x => x?.typeName?.toLowerCase() != 'rfs')
        }

      });
  }

  groupById(items: any[]): any {
    return items.reduce((groups, item) => {
      (groups[item.assignContainer.containerNo] = groups[item.assignContainer.containerNo] || []).push(item);
      return groups;
    }, {});
  }
  addAssignContainerOpen(addAssignContainer, row): void {
    this.checkedContainers = [...this.containerBillsData.map(i => { return { ...i } })];
    if (this.loadTypeName == 'LCL' || this.loadTypeName == 'Loose') {
      let groupOfArray = this.groupById(this.consolidateCTRList);
      this.containesList = this.containesList?.filter(x => {
        return !groupOfArray[x.containerNumber]?.every(y => y.isBlCreated);
      });
    }

    this.modalReference = this.modalService.open(addAssignContainer, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'xl',

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


  addAssignGRNOpen(addAssignContainer, row): void {
    this.modalService.open(addAssignContainer, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'xl',
      ariaLabelledBy: 'modal-basic-title',
    });

    this.grnList = this.grnList?.map((x) => {
      // Check if the current item's grnId exists in grnData
      if (this.grnData.some((y) => x.grnId === y.grnId)) {
        return {
          ...x,
          isSelected: true,
        };
      }
      // Return the original item if no match is found
      return x;
    });
  }
  looseCargoData: any = []
  multiShipperValue: any = ''
  addAssignLCLOpen(addAssignContainer, row): void {
    this.modalService.open(addAssignContainer, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'xl',
      ariaLabelledBy: 'modal-basic-title',
    });


    this.looseCargoList = this.consolidateCTRList?.map((x) => {
      // if (this.looseCargoData.some((y) => row?.containerNumber === y?.assignContainer?.containerNo)) {
      //   return {
      //     ...x,
      //     isSelected: true,
      //   };
      // }
      if (row?.containerNumber === x?.assignContainer?.containerNo) {
        return x;
      }

    });
    console.log(this.looseCargoList)
  }

  // changeBasedOnShipper(){
  //   this.containerBillsData = this.containerBillsData.filter(x => x.lclShipper == this.multiShipperValue)
  // }

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
            let index = this.containerBillsData.findIndex(
              item => item.containerId === id.containerId
            )
            this.containerBillsData.splice(index, 1)
          }

        },

      );
  }
  grnData: any = []
  deleteGRN(content1, id) {
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
            let index = this.grnData.findIndex(
              item => item.grnId === id.grnId
            )
            this.grnData.splice(index, 1)

            let objToUpdate = this.grnList.find(item => item.grnId === id.grnId);
            if (objToUpdate) {
              objToUpdate.isSelected = false;
            }
          }

        },

      );
  }
  igmChange() {

  }
  hblChange(flag?) {
    this.HBLPart = this.addblForm.get('bl_type').value
    if (this.HBLPart === 'HBL' || this.HBLPart === 'HAWB') {
      this.addblForm.get('bl_no').setValue(this.billDetail?.blNumber && (this.billDetail?.blType == 'HBL' || this.billDetail?.blType == 'HAWB') ? this.billDetail?.blNumber || '' : '')
    } else {
      this.addblForm.get('bl_no').setValue('')
    }
    this.getContainer()
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

  showPackage(data, type) {
    if (type == 'p') {
      let returnValue = []
      data.filter((x) => returnValue.push(x.packageType))
      const uniqueItems = Array.from(new Set(returnValue));
      return uniqueItems?.toString()
    } else {
      let volume = 0
      data.filter((x) => volume += x.volume)
      return volume
    }
  }
  grnList: any = []
  getGRN() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      batchId: this.batchId,
    }
    this._api.getSTList('grn', payload)?.subscribe((res: any) => {
      this.grnList = res?.documents || []
    })
  }
  activeFrightAir: boolean = false
  activeFright: string = ''
  getBatchList() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      // batchId: this.batchId,
      isExport: this.isExport,
    }

    this.commonService.getSTList('batch', payload)
      ?.subscribe((data: any) => {
        this.loaderService.showcircle();
        this.batchDetails = data.documents?.find((x) => x.batchId === this.batchId);
        this.batchDetails?.enquiryDetails?.destPortName


        this.shipperAllData = [this.batchDetails?.enquiryDetails?.basicDetails?.shipperId, ...this.batchDetails?.enquiryDetails?.basicDetails?.multiShipper.map((x) => {
          return x?.partymasterId
        })]
        console.log(this.shipperAllData, 'this.shipperAllData')
        this.searchPortLocation(this.batchDetails?.enquiryDetails?.routeDetails?.locationName || this.batchDetails?.routeDetails?.addressValue)

        if (this.lastUrl == 'addconsolidate') {

          this.consolidateBatchList = data.documents.filter(x => {
            const routeDetailsMatch = this.batchDetails?.enquiryDetails?.routeDetails;
            const quotationDetailsMatch = this.batchDetails?.quotationDetails;
            return x.status
              && x.batchId != this.batchId
              && x.statusOfBatch !== 'Job Cancelled'
              && x.statusOfBatch !== 'Job Closed'
              && routeDetailsMatch?.destPortName === x?.enquiryDetails?.routeDetails?.destPortName
              && routeDetailsMatch?.loadPortName === x?.enquiryDetails?.routeDetails?.loadPortName
              && quotationDetailsMatch?.vesselName === x?.quotationDetails?.vesselName;
          }) || [];
        }
        // this.getGRN()
        if (this.isAddMode && this.isType != 'cloneBl'
          && this.currentUrl !== 'add' && this.currentUrl !== 'addconsolidate') {

          this.patchValue(this.batchDetails, false)
        }

        this.shipmentTypeName = this.batchDetails?.enquiryDetails?.basicDetails?.ShipmentTypeName?.toLowerCase()
        this.loadTypeName = this.batchDetails?.enquiryDetails?.basicDetails?.loadType
        // if (this.isAddMode && this.batchDetails?.enquiryDetails?.basicDetails?.loadType === 'ULD Container') {
        //   this.addContainerRow();
        // }
        this.activeFright = this.batchDetails?.enquiryDetails?.basicDetails?.ShipmentTypeName?.toLowerCase()
        if (this.batchDetails?.enquiryDetails?.basicDetails?.ShipmentTypeName?.toLowerCase() === 'air') {
          this.activeFrightAir = true;
        }
        // this.looseCargoList = this.batchDetails?.enquiryDetails?.looseCargoDetails?.cargos?.filter((y) => !y?.isBlCreated)?.map((x,index) =>{ return {...x,id:index}}) || []
        if (!['lcl', 'loose'].includes(this.loadTypeName?.toLowerCase())) {
          this.blSubTypeList = this.blSubTypeList.filter(x => x?.typeName?.toLowerCase() !== 'mixed load');
          this.addContainerLoader = false;
        } else {
          this.multiShipperList = this.batchDetails?.enquiryDetails?.basicDetails?.multiShipper || []
          this.getConsolidationContainer()
        }
        if (this.batchDetails?.statusOfBatch == 'Job Cancelled' || this.batchDetails?.statusOfBatch == 'Job Closed') {
          this.addblForm.disable();
          this.buttonDisabled = false
        }
        // this.patchValue(this.batchDetails, false)
        setTimeout(() => {
          this.loaderService.hidecircle();
        }, 0);
      }, erroe => {
        this.loaderService.hidecircle();
      });
  }
  multiShipperList: any = [];
  consolidateCTRList: any = [];
  allconsolidateData: any = [];
  shipperAllData: any = []
  getConsolidationContainer() {
    this.addContainerLoader = true;
    this.loaderService.showcircle();
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      // batchId: this.batchId,
      "items.batchId": this.batchId,
    }

    this.commonService.getSTList('consolidationbooking', payload)
      ?.subscribe((data: any) => {
        this.consolidateCTRList = []
        this.allconsolidateData = data.documents || []
        data?.documents?.forEach((res) => {
          res.batchwiseGrouping?.forEach(element => {
            if (element?.batchId == this.batchId) {
              this.consolidateCTRList = [...this.consolidateCTRList, ...element?.items]
            }
          })

        })
        setTimeout(() => {
          this.getContainer()
        }, 500);
        if (this.isEdit) {
          this.checkedContainers = [...this.containerBillsData.map(i => { return { ...i } })];

          this.AddContainer(true)

        }
        // this.addContainerLoader= false;

        this.loaderService.hidecircle();
      }, error => {
        // this.addContainerLoader= false;
        this.loaderService.hidecircle();
      })
  }
  looseCargoList: any = []
  loadTypeName: any;
  shipmentTypeName: any;

  disabledEtaDate = (current: Date): boolean => {
    if (!this.batchDetails?.bookingDate) { return false }
    return differenceInCalendarDays(new Date(current), new Date(this.batchDetails?.bookingDate)) < 0;
  };

  onCheck(evt, check, i) {
    if (evt.target.checked) {
      this.checkedContainers.push({
        ...check,
        // tareWeight: ((<HTMLInputElement>document.getElementById('tar' + i)).value).toString() || '',
        netWeight: ((<HTMLInputElement>document.getElementById('net' + i)).value).toString() || '',
        grossWeight: ((<HTMLInputElement>document.getElementById('gross' + i)).value).toString() || '',
        sealNo: ((<HTMLInputElement>document.getElementById('seal' + i)).value).toString() || '',
      });
    }
    else {
      let index = this.checkedContainers.findIndex(
        item => item.containerId === check?.containerId
      )
      this.checkedContainers.splice(index, 1)
    }
    console.log(this.checkedContainers, "this.checkedContainers");

    this.isContainerSelected = this.checkedContainers && this.checkedContainers.length > 0 ? false : true

  }
  onEnterKey(evt, check, i) {

    const netWeight = ((<HTMLInputElement>document.getElementById('net' + i)).value).toString() || '';
    const grossWeight = ((<HTMLInputElement>document.getElementById('gross' + i)).value).toString() || '';
    const cbm = ((<HTMLInputElement>document.getElementById('cbm' + i)).value).toString() || '';
    const sealNo = ((<HTMLInputElement>document.getElementById('seal' + i)).value).toString() || '';
    const rfidNo = sealNo;

    const enteredPackage = parseFloat((<HTMLInputElement>document.getElementById('package' + i)).value) || 0;
    const enteredGross = parseFloat(grossWeight) || 0;
    const enteredNet = parseFloat(netWeight) || 0;
    const enteredCBM = parseFloat(cbm) || 0;

    const totalPackage = parseFloat(check.package) || 0;
    const totalGross = parseFloat(check.grossWeight) || 0;
    const totalNet = parseFloat(check.netWeight) || 0;
    const totalCBM = parseFloat(check.cbm) || 0;

    // ✅ PACKAGE CHECK
    if (enteredPackage > totalPackage) {
      this.notification.create(
        'error',
        `The number of packages entered exceeds the container’s limit of ${totalPackage}.`,
        ''
      );
      this.containesList[i] = {
        ...this.containesList[i],
        selected_package: totalPackage
      };
      return;
    }

    // ✅ GROSS WEIGHT CHECK
    if (enteredGross > totalGross) {
      this.notification.create(
        'error',
        `Entered gross weight (${enteredGross}) exceeds the container limit of ${totalGross}.`,
        ''
      );
      this.containesList[i] = {
        ...this.containesList[i],
        selected_grossWeight: totalGross
      };
      return;
    }

    // ✅ NET WEIGHT CHECK
    if (enteredNet > totalNet) {
      this.notification.create(
        'error',
        `Entered net weight (${enteredNet}) exceeds the container limit of ${totalNet}.`,
        ''
      );
      this.containesList[i] = {
        ...this.containesList[i],
        selected_netWeight: totalNet
      };
      return;
    }

    // ✅ CBM CHECK
    if (enteredCBM > totalCBM) {
      this.notification.create(
        'error',
        `Entered CBM (${enteredCBM}) exceeds the container limit of ${totalCBM}.`,
        ''
      );
      this.containesList[i] = {
        ...this.containesList[i],
        selected_cbm: totalCBM
      };
      return;
    }

    // ✅ Update checkedContainers list if exists
    const index = this.checkedContainers.findIndex(
      item => item.containerId === check?.containerId
    );

    if (index !== -1) {
      this.checkedContainers[i] = {
        ...check,
        netWeight,
        grossWeight,
        cbm,
        sealNo,
        rfidNo,
        package: enteredPackage.toString()
      };
    }

    // ✅ Update containesList
    this.containesList[i] = {
      ...this.containesList[i],
      isApiData: false,
      selected_package: enteredPackage.toString(),
      selected_cbm: enteredCBM,
      selected_grossWeight: enteredGross,
      selected_netWeight: enteredNet
    };
    this.cdr.detectChanges();
  }




  onUnitChange(selectedUnit: string, container: any, field: string): void {
    const index = this.checkedContainers.findIndex(item => item.containerId === container?.containerId);
    if (index !== -1) {
      this.checkedContainers[index] = {
        ...this.checkedContainers[index],
        [field]: selectedUnit || '', // Dynamically update the specified field
      };
    }
  }
  onPackageChange(selectedPackageId: string, container: any): void {
    const selectedPackage = this.packageList?.find(packageType => packageType?.systemtypeId === selectedPackageId);
    const index = this.checkedContainers.findIndex(item => item.containerId === container?.containerId);

    if (index !== -1) {
      this.checkedContainers[index] = {
        ...this.checkedContainers[index],
        packageType: selectedPackage?.systemtypeId || '',
        packageTypeName: selectedPackage?.typeName || '',
      };
    }
  }
  checked(e) {
    if (this.checkedContainers.some(x => x?.containerId === e?.containerId)) {
      return true
    } else {
      return false
    }
  }
  isFieldDisabled(container: any): boolean {
    const isInvalidFromApi = container.isApiData &&
      (
        container?.selected_package <= 0 ||
        container?.selected_cbm <= 0 ||
        container?.selected_netWeight <= 0 ||
        container?.selected_grossWeight <= 0
      );

    return !this.checked(container) || isInvalidFromApi;
  }


  checkedGRN: any = []
  isGRNSelected: boolean = false


  AddContainer(flag?) {
    if (this.checkedContainers?.length > 0) {
      this.checkedContainers.forEach(t => {
        const index = this.containerBillsData.findIndex(x => x.containerId === t.containerId)

        if (['lcl', 'loose'].includes(this.loadTypeName?.toLowerCase())) {
          let expandlooseCargoList = this.consolidateCTRList?.filter((x) => {
            if (t?.containerNumber === x?.assignContainer?.containerNo) {
              return {
                ...x,
                isSelected: x.isBlCreated ? true : false
              }

            }
          })
          if (index === -1) {
            this.containerBillsData.push({ ...t, expandlooseCargoList: expandlooseCargoList?.filter((x) => flag ? (x?.isBlCreated && x?.blId == this.billDetail?.blId) : (!x?.isBlCreated || x?.blId == this.billDetail?.blId)) })
          } else {
            this.containerBillsData[index] = { ...t, expandlooseCargoList: expandlooseCargoList?.filter((x) => flag ? (x?.isBlCreated && x?.blId == this.billDetail?.blId) : (!x?.isBlCreated || x?.blId == this.billDetail?.blId)) };
          }
        } else {
          if (index === -1) {
            this.containerBillsData.push(t)
          } else {
            this.containerBillsData[index] = t;
          }
        }



      })

    }
    this.isContainerSelected = this.containerBillsData && this.containerBillsData.length > 0 ? false : true
    if (!this.isContainerSelected) {
      this.modalService.dismissAll();
    }
  }

  AddGRN() {
    let grnData = this.grnList?.filter((x) => x.isSelected) || []
    this.isGRNSelected = grnData.length == 0 ? true : false
    this.grnData = grnData
    if (!this.isGRNSelected) {
      this.isGRNSelected = false
      this.modalService.dismissAll();
    }
  }
  isLCLSelected: boolean = false
  AddPallet() {
    let looseCargoData = this.looseCargoList?.filter((x) => x.isSelected) || []
    this.isLCLSelected = looseCargoData.length == 0 ? true : false
    this.looseCargoData = looseCargoData
    if (!this.isLCLSelected) {
      this.isLCLSelected = false
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
  Documentpdf: any;
  printData() {
    let reportpayload1 = { "parameters": { "blId": this.id } }
    this.commonService.pushreports(reportpayload1, 'billOfLad').subscribe({
      next: (res: any) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        let temp = URL.createObjectURL(blob);
        this.Documentpdf = temp;
        const pdfWindow = window.open(temp);
        pdfWindow.print();
      }
    })
  }

  generateEDI() {
    let payload = {
      blId: this.id
    }
    this.commonService.downloadEDI('ediBOL', payload).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `EDI-${this.billDetail?.blNumber}.edi`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    })
  }
  downnloadEdi(ediName, blId) {

    this._api.getEdi(ediName, blId).subscribe((res: ArrayBuffer) => {
      const blob = new Blob([res], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'BL.edi';
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
  get containerArray(): FormArray {
    return this.addblForm.get('container') as FormArray;
  }

  getContainerControls(): FormGroup[] {
    return this.containerArray.controls as FormGroup[];
  }


  addContainerRow(item?: any, isDisable?): void {
    const containerGroup = this.formBuilder.group({
      uldcontainerType: [item ? (item?.uldcontainerType ?? item?.containerType) : null, Validators.required],
      noOfContainer: [item ? item.noOfContainer : null, [Validators.required, Validators.min(1)]],
      grossWeightContainer: [item ? item.grossWeightContainer : null, [Validators.required, Validators.min(1)]],
      unit: [item ? item.unit : null, Validators.required],
    });
    if (isDisable) containerGroup.disable();
    this.containerArray.push(containerGroup);
  }

  deleteRow(index: number): void {
    if (this.containerArray.length > 1) {
      this.containerArray.removeAt(index);
    }
  }
  getUomList() {
    let payload = this.commonService.filterList()
    if (payload) payload.query = { 'status': true }
    this.commonService.getSTList('uom', payload)?.subscribe((data) => {
      this.uomData = data.documents;
      this.lengthData = data?.documents?.filter(lengthtype => lengthtype?.uomCategory === 'Length');
    });
  }
  addContainerValue() {
    const containerArray = [];
    this.getContainerControls().forEach(element => {
      const container = {
        uldcontainerType: element.value.uldcontainerType || '',
        noOfContainer: element.value.noOfContainer || '',
        grossWeightContainer: element.value.grossWeightContainer || '',
        unit: element.value.unit || '',
        unitName: this.uomData.find(x => x.uomId === element.value.unit)?.uomShort || ''
      };
      containerArray.push(container);
    });
    return containerArray;
  }

  // Loose details
  cargos(): FormArray {
    return this.empForm?.get('cargos') as FormArray;
  }

  newCargo(): FormGroup {
    return this.formBuilder.group({
      firstName: [''],
      lastName: [''],
      pkgname: ['Pallets'],
      units: ['', Validators.required],
      Pallettype: ['Pallets (non specified size)'],
      lengthp: [''],
      lengthb: [''],
      Weightb: [''],
      heightb: [''],
      DimensionUnit: ['mm'],
      Weightbox: [''],
      Unit1: ['KG'],
      volumebs: ['CBM'],
      volumeb: [''],
      Weightp: [''],
      heightp: [''],
      DimensionUnitp: ['mm'],
      Weightps: [''],
      weightpsCalculatedplt: [''],
      weightpsCalculatedbox: [''],
      weightpsCalculatedother: [''],
      Unit1p: ['KG'],
      volumep: [''],
      volumeps: ['CBM'],
      heightselected: [''],
      selectedh: ['mm'],
      Weightselected: [''],
      selectedw: ['KG'],
      volumeselect: [''],
      volumebselecteds: ['CBM'],

    });
  }

  addLooseCargo() {
    this.cargos()?.push(this.newCargo());
    const cargos = this.empForm.value?.cargos ?? []
    this.radioButtonChange('Pallets', cargos?.length - 1);
  }

  removeLooseCargo(empIndex: number) {
    if (this.isType === 'show') return;
    this.cargos().removeAt(empIndex);
  }

  radioButtonChange(data, empIndex) {
    const palletValidators = [Validators.required];
    const cargosArray = this.empForm.get('cargos') as FormArray;
    const cargo = cargosArray.at(empIndex) as FormGroup;

    if (data === 'Pallets') {
      cargo.get('lengthp').setValidators(palletValidators);
      cargo.get('Weightp').setValidators(palletValidators);
      cargo.get('volumep').setValidators(palletValidators);
      cargo.get('Weightps').setValidators(palletValidators);

      // Clear validators for box fields
      cargo.get('lengthb').clearValidators();
      cargo.get('Weightb').clearValidators();
      cargo.get('Weightbox').clearValidators();
      cargo.get('volumeb').clearValidators();
    } else if (data === 'Boxes/Crates') {
      // Clear validators for pallet fields
      cargo.get('lengthp').clearValidators();
      cargo.get('Weightp').clearValidators();
      cargo.get('volumep').clearValidators();
      cargo.get('Weightps').clearValidators();

      cargo.get('lengthb').setValidators(palletValidators);
      cargo.get('Weightb').setValidators(palletValidators);
      cargo.get('Weightbox').setValidators(palletValidators);
      cargo.get('volumeb').setValidators(palletValidators);
    }
    // Update validity of all fields
    cargo.get('lengthp').updateValueAndValidity();
    cargo.get('Weightp').updateValueAndValidity();
    cargo.get('volumep').updateValueAndValidity();
    cargo.get('Weightps').updateValueAndValidity();
    cargo.get('lengthb').updateValueAndValidity();
    cargo.get('Weightb').updateValueAndValidity();
    cargo.get('Weightbox').updateValueAndValidity();
    cargo.get('volumeb').updateValueAndValidity();
  }
  lengthandwidthShow: boolean = true
  setDimensions(event, empIndex) {
    const cargosArray = this.empForm.get('cargos') as FormArray;
    const cargo = cargosArray.at(empIndex) as FormGroup;
    const regex = /\b\d+\b/g;
    const matches = event.match(regex);
    const data = matches ? matches.map(Number) : []
    if (event === 'Pallets (non specified size)') {
      this.lengthandwidthShow = true
      cargo.get('lengthp').setValue(0)
      cargo.get('Weightp').setValue(0)
      cargo.get('lengthb').setValue(0)
      cargo.get('Weightb').setValue(0)
    } else {
      this.lengthandwidthShow = false
      cargo.get('lengthp').setValue(data[0])
      cargo.get('Weightp').setValue(data[1])
      cargo.get('lengthb').setValue(data[0])
      cargo.get('Weightb').setValue(data[1])
    }
  }

  ngOnpallettype(event, empIndex) {
    const cargosArray = this.empForm.get('cargos') as FormArray;
    const cargo = cargosArray.at(empIndex) as FormGroup;
    if (event === 'Pallets (non specified size)') {

      cargo.get('lengthp').setValidators([Validators.required, Validators.min(1), Validators.max(9999)]);
      cargo.get('Weightp').setValidators([Validators.required, Validators.min(1), Validators.max(9999)]);
      cargo.get('volumep').setValidators([Validators.required]);
      cargo.get('Weightps').setValidators([Validators.required, Validators.min(1), Validators.max(9999)]);

      // Clear validators for box fields
      cargo.get('lengthb').clearValidators();
      cargo.get('Weightb').clearValidators();
      cargo.get('Weightbox').clearValidators();
      cargo.get('volumeb').clearValidators();

      // Clear validators for selected fields
      cargo.get('Weightselected').clearValidators();
      cargo.get('volumeselect').clearValidators();
    } else {
      cargo.get('Weightselected').setValidators([Validators.required, Validators.min(1), Validators.max(9999)]);
      cargo.get('volumeselect').setValidators([Validators.required]);

      // Clear validators for pallet and box fields
      cargo.get('lengthp').clearValidators();
      cargo.get('Weightp').clearValidators();
      cargo.get('volumep').clearValidators();
      cargo.get('Weightps').clearValidators();
      cargo.get('lengthb').clearValidators();
      cargo.get('Weightb').clearValidators();
      cargo.get('Weightbox').clearValidators();
      cargo.get('volumeb').clearValidators();
    }
  }
  totalVolume(event, empIndex) {
    const cargosArray = this.empForm.get('cargos') as FormArray;
    const cargo = cargosArray.at(empIndex) as FormGroup;
    const dimensionUnit = cargo?.get('DimensionUnitp')?.value?.toLowerCase();

    let units = 0;

    switch (dimensionUnit) {
      case "inches":
        units = ((cargo?.get('heightp')?.value ?? 0) * (cargo?.get('Weightp')?.value ?? 0) * (cargo?.get('lengthp')?.value ?? 0)) / 61023.8;
        break;
      case "cms":
      case "cm":
        units = ((cargo?.get('heightp')?.value ?? 0) * (cargo?.get('Weightp')?.value ?? 0) * (cargo?.get('lengthp')?.value ?? 0)) / 1000000;
        break;
      case "CM":
        units = ((cargo?.get('heightp')?.value ?? 0) * (cargo?.get('Weightp')?.value ?? 0) * (cargo?.get('lengthp')?.value ?? 0)) / 1000000;
        break;
      case "IN":
        units = ((cargo?.get('heightp')?.value ?? 0) * (cargo?.get('Weightp')?.value ?? 0) * (cargo?.get('lengthp')?.value ?? 0)) * 0.000016387064;
        break;
      case "meter":
        units = ((cargo?.get('heightp')?.value ?? 0) * (cargo?.get('Weightp')?.value ?? 0) * (cargo?.get('lengthp')?.value ?? 0));
        break;
      case "millimetre":
      case "mm":
        units = ((cargo?.get('heightp')?.value ?? 0) * (cargo?.get('Weightp')?.value ?? 0) * (cargo?.get('lengthp')?.value ?? 0)) / 1000000000;
        break;
      case "ft":
        units = ((cargo?.get('heightp')?.value ?? 0) * (cargo?.get('Weightp')?.value ?? 0) * (cargo?.get('lengthp')?.value ?? 0)) / 35.315;
        break;
      default:
        units = 0;
    }

    const roundedUnits = units;
    const totalUnits = roundedUnits * (cargo?.get('units')?.value ?? 0);
    cargo.controls['volumep'].setValue(totalUnits);
  }

  boxestotalVolume(event, empIndex) {

    const cargosArray = this.empForm.get('cargos') as FormArray;
    const cargo = cargosArray.at(empIndex) as FormGroup;
    const dimensionUnit = cargo?.get('DimensionUnit')?.value?.toLowerCase();

    let units = 0;

    switch (dimensionUnit) {
      case "inches":
        units = ((cargo?.get('heightb')?.value ?? 0) * (cargo?.get('Weightb')?.value ?? 0) * (cargo?.get('lengthb')?.value ?? 0)) / 61023.8;
        break;
      case "in":
        units = ((cargo?.get('heightp')?.value ?? 0) * (cargo?.get('Weightp')?.value ?? 0) * (cargo?.get('lengthp')?.value ?? 0)) * 0.000016387064;
        break;
      case "cm":
        units = ((cargo?.get('heightb')?.value ?? 0) * (cargo?.get('Weightb')?.value ?? 0) * (cargo?.get('lengthb')?.value ?? 0)) / 1000000;
        break;
      case "meter":
        units = ((cargo?.get('heightb')?.value ?? 0) * (cargo?.get('Weightb')?.value ?? 0) * (cargo?.get('lengthb')?.value ?? 0));
        break;
      case "millimetre":
      case "mm":
        units = ((cargo?.get('heightb')?.value ?? 0) * (cargo?.get('Weightb')?.value ?? 0) * (cargo?.get('lengthb')?.value ?? 0)) / 1000000000;
        break;
      case "ft":
        units = ((cargo?.get('heightb')?.value ?? 0) * (cargo?.get('Weightb')?.value ?? 0) * (cargo?.get('lengthb')?.value ?? 0)) / 35.315;
        break;
      default:
        units = 0;
    }
    const roundedUnits = units;
    const totalUnits = roundedUnits * (cargo?.get('units')?.value ?? 0);
    cargo.controls['volumeb'].setValue(totalUnits);
  }

  selectTotalVolum(event, empIndex) {
    const cargosArray = this.empForm.get('cargos') as FormArray;
    const cargo = cargosArray.at(empIndex) as FormGroup;
    const length = this.palletTypeslist?.find(ff => ff?.typeName === cargo?.value?.Pallettype)?.typeParentType?.split(',')?.[0];
    const width = this.palletTypeslist?.find(ff => ff?.typeName === cargo?.value?.Pallettype)?.typeParentType?.split(',')?.[1]
    const selectedHeight = cargo?.get('selectedh')?.value?.toLowerCase();

    let units = 0;

    switch (selectedHeight) {
      case "inches":
        units = ((length ?? 0) * (width ?? 0) * (cargo?.get('heightselected')?.value ?? 0)) / 61023.8;
        break;
      case "CM":
        units = ((length ?? 0) * (width ?? 0) * (cargo?.get('heightselected')?.value ?? 0)) / 1000000;
        break;
      case "IN":
        units = ((length ?? 0) * (width ?? 0) * (cargo?.get('heightselected')?.value ?? 0)) * 0.000016387064;
        break;
      case "cm":
        units = ((length ?? 0) * (width ?? 0) * (cargo?.get('heightselected')?.value ?? 0)) / 1000000;
        break;
      case "meter":
        units = ((length ?? 0) * (width ?? 0) * (cargo?.get('heightselected')?.value ?? 0));
        break;
      case "millimetre":
      case "mm":
        units = ((length ?? 0) * (width ?? 0) * (cargo?.get('heightselected')?.value ?? 0)) / 1000000000;
        break;
      case "ft":
        units = ((length ?? 0) * (width ?? 0) * (cargo?.get('heightselected')?.value ?? 0)) / 35.315;
        break;
      default:
        units = 0;
    }

    const roundedUnits = parseFloat(units.toFixed(2));
    const totalUnits = roundedUnits * (cargo?.get('units')?.value ?? 0);
    cargo.controls['volumeselect'].setValue(totalUnits);
  }
  grossWeightpallet(event, empIndex) {
    let units = 0;
    const cargosArray = this.empForm.get('cargos') as FormArray;
    const cargo = cargosArray.at(empIndex) as FormGroup;
    const selectedHeight = cargo?.get('Unit1p')?.value?.toLowerCase();
    switch (selectedHeight) {
      case "kg":
      case "KG":
        units = ((cargo?.get('Weightps')?.value ?? 0)) / 1000;
        break;
      case "LB":
      case "lb":
        units = ((cargo?.get('Weightps')?.value ?? 0) * 0.4536) / 1000;
        break;
      default:
        units = 0;
    }
    const roundedUnits = units?.toFixed(2);
    cargo.controls['weightpsCalculatedplt'].setValue(roundedUnits);
  }
  grossWeightBoxes(event, empIndex) {
    let units = 0;
    const cargosArray = this.empForm.get('cargos') as FormArray;
    const cargo = cargosArray.at(empIndex) as FormGroup;
    const selectedHeight = cargo?.get('Unit1')?.value?.toLowerCase();
    switch (selectedHeight) {
      case "kg":
      case "KG":
        units = ((cargo?.get('Weightbox')?.value ?? 0)) / 1000;
        break;
      case "LB":
      case "lb":
        units = ((cargo?.get('Weightbox')?.value ?? 0) * 0.4536) / 1000;
        break;
      default:
        units = 0;
    }
    const roundedUnits = units?.toFixed(2);
    cargo.controls['weightpsCalculatedbox'].setValue(roundedUnits);
  }
  grossWeightselect(event, empIndex) {
    let units = 0;
    const cargosArray = this.empForm.get('cargos') as FormArray;
    const cargo = cargosArray.at(empIndex) as FormGroup;
    const selectedHeight = cargo?.get('selectedw')?.value?.toLowerCase();
    switch (selectedHeight) {
      case "kg":
      case "KG":
        units = ((cargo?.get('Weightselected')?.value ?? 0)) / 1000;
        break;
      case "LB":
      case "lb":
        units = ((cargo?.get('Weightselected')?.value ?? 0) * 0.4536) / 1000;
        break;
      default:
        units = 0;
    }
    const roundedUnits = units?.toFixed(2);
    cargo.controls['weightpsCalculatedother'].setValue(roundedUnits);
  }

  searchPortLocation$ = new Subject<string>();

  searchPortLocation(event) {
    if (!event) return;
    this.searchPortLocation$.next(event);
  }
  setupSearchLocationSubscription() {
    this.searchPortLocation$.pipe(
      debounceTime(300),  // Wait 300ms before making an API call
      distinctUntilChanged(),  // Avoid duplicate requests for the same input
      switchMap(async (event) => this.fetchPortLocationList(event))  // Cancel previous API call if a new one is made
    )
      .subscribe();
  }
  portLocationList = []
  fetchPortLocationList(event: string) {
    if (!event) {
      return
    }
    this.portLocationList = []
    let payload = this.commonService.filterList()
    if (payload) payload.query = {
      status: true,
      type: this.activeFrightAir ? 'airport' : 'port'
    }
    if (payload?.size) payload.size = 100
    let url;
    if (event) {
      let mustArray = {};
      mustArray['locationName'] = {
        "$regex": "\\Q" + event + "\\E",
        "$options": "i"
      }
      payload.query = {
        ...payload.query,
        ...mustArray
      }
    }
    url = this.commonService.getSTList1("search-port-and-location", payload)
    return url?.subscribe((res: any) => {
      this.portLocationList = res?.documents?.filter(
        (obj, index, self) => index === self.findIndex(o => o.locationId === obj.locationId)
      ) || []
    });
  }

  // getFilteredExpandLooseCargoList(container: any): any[] {
  //   if (!container?.expandlooseCargoList || !this.addblForm.get('shipper')?.value) {
  //     return container?.expandlooseCargoList;
  //   }
  //   return container.expandlooseCargoList.map(item =>({ ...item,isSelected : false})).filter(
  //     item => item.lclShipper === this.addblForm.get('shipper')?.value
  //   ).map(item =>({ ...item,isSelected : true}));
  // }

}

@Pipe({
  name: 'filterBLShipper'
})
export class FilterShipperBLPipe implements PipeTransform {
  transform(items: any[], searchText): any[] {
    if (!items || !searchText) {
      return items;
    }
    const updatedItems = items.map(item => ({
      ...item,
      isSelected: false
    }));

    return updatedItems.filter(item => item.lclShipper.includes(searchText)).map(item => ({
      ...item,
      isSelected: true
    })
    )
  }
}

@Pipe({
  name: 'filterLCLBLShipper'
})
export class FilterLCLShipperBLPipe implements PipeTransform {

  transform(shipperList: any[], selectedShipper: any): any[] {
    if (selectedShipper.length === 0) {
      return shipperList;
    }
    return shipperList.filter(shipper => selectedShipper.includes(shipper.partymasterId));
  }

}
