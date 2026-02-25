import { Component, OnInit,HostListener } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormArray,
  Validators,
} from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../admin/principal/api.service';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { BaseBody } from 'src/app/admin/smartagent/base-body-max';
import { SharedService } from 'src/app/shared/services/shared.service'; 
import { MastersService } from 'src/app/services/Masters/masters.service';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ActivatedRoute, Router } from '@angular/router';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
import { ApiSharedService } from 'src/app/shared/components/api-service/api-shared.service';
import { environment } from 'src/environments/environment';
import { CommonService } from 'src/app/services/common/common.service';
import * as XLXS from 'xlsx'
import { SystemType } from 'src/app/models/system-type';
import { UOM } from 'src/app/models/configuration';
import { Currency } from 'src/app/models/shipping-line';
import { Port, ratemaster } from 'src/app/models/tariff-list';
import { CountryData } from 'src/app/models/city-master';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss'],
})
export class ConfigurationComponent implements OnInit {
  formTariff: FormGroup;
  inputForm: FormGroup;
  rateNameForm: FormGroup;
  currentUrl: any;
  baseBody: BaseBody; 
  submitted: boolean = false;
  inputSubmitted: boolean  =false;
  portList: Port[];
  berthList: any = ['b1', 'b2'];
  berthList2: any = [];
  cargoList: any = ['c1', 'c2'];
  movementTypeList: any = ['m1', 'm2'];
  portDetails: any;
  port1Value: any;
  terminalList: any;
  vesselTypeList: any;
  templateList: any;
  costitemData: any;
  portValue: any;
  options: any;
  vesselList: any;
  stepsArray: any = [];
  tariffList: ratemaster[] = [];
  costIndex: any;
  payloadObj: any;
  conditionIndex: any;
  isEdit: boolean = false;
  isEditItem: boolean = false;
  isView: boolean = false;
  countryList: CountryData[];
  berths: any;
  berths2: any;
  cargos: any;
  inputsArray = [];
  allParametrs:any = [{name:'Cargo',id:'1'},{name:'Vessel',id:'2'},{name:'Weekday',id:'3'},{name:'Time',id:'4'}];
  changeColumns:boolean = false;
  additionalPrams:any  = [];
  inputList: any = [
    { item_id: 1, item_text: 'GRT' },
    { item_id: 2, item_text: 'NRT' },
    { item_id: 3, item_text: 'LOA' },
    { item_id: 4, item_text: 'LBP' },
    { item_id: 5, item_text: 'DWT' },
    { item_id: 6, item_text: 'Draft In' },
    { item_id: 7, item_text: 'Draft Out' },
  ];
  dropdownSettings: {
  };
  dropdownSettings1: {
  };
  dropdownSettings2: {
  };
  dropdownSettingsOperation: {};
  urlParam: any;
  tariffDetails: any;
  currencyList: Currency[];
  uomList: UOM[];
  name: string;
  vesselType2: string;
  parameter: string;
  isSlabApplicable: string;
  rateType: any;
  flat: any;
  break: any;
  laden: boolean = false;
  ballast: boolean = false;
  coastal: boolean = false;
  foreign: boolean = false;
  area:boolean = false;
  unitType: any;
  vesselUnitType: any;
  parameterMin: any;
  parameterMax: any;
  unitRate: any;
  uom: any;
  minRate: any;
  maxRate: any;
  discount: any;
  minAmount:any;
  surcharge: any;
  currency: string;
  validFrom: any;
  validTo: any;
  docRefNo: any;
  docFile:any;
  docUrl:any;
  docName:string;
  extension:string;
  zoom_to:string;
  pdfSrc = "https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf";
  zoom: number = 1.0;
originalSize: boolean = true;
isCloningItem:boolean = false;
cloneIndex:any = null
keysToCompare:any = ['name','unitType','parameter','cargo','vesselPurpose','tariffBasedOn','terminal','supplier','berth','currency','direction','area','shipStatus','vesselCall'];

symbols: any = ['>','>=','<','<=','equal','not equal','in','not in','between','not between'];
operations =[{"item_text":'Anchor',"item_id":'1'},{"item_text":'Berth',"item_id":'2'}];
isMasterClone:boolean = false;


  constructor(
    private modalService: NgbModal,
    private profilesService: ProfilesService,
    private mastersService: MastersService,
    private apiService: ApiSharedService,
    private _sharedService: SharedService,
    private commonService: CommonService,
    private transactionService: TransactionService,
    private _api: ApiService,
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private notification: NzNotificationService,
    private formBuilder: FormBuilder, 
    private masterservice: MastersService,
    private saMasterService: SaMasterService
  ) {
    this.activatedRoute?.params?.subscribe((params) => (this.urlParam = params));
    this.isMasterClone = this.activatedRoute.snapshot?.routeConfig?.path.split('/').includes('clone');
    this.formTariff = this.formBuilder.group({
      country: ['', Validators.required],
      port: ['', Validators.required],
      terminal: ['', Validators.required],
      berth: [[]],
      vesselType:['',Validators.required],
      docRefNo: [''],
      doc:['']
    });

    this.inputForm = this.formBuilder.group({
      costItemGroup:[''],
      name: ['',Validators.required],
      parameter: ['',Validators.required],
      cargo:[[],Validators.required],
      supplier:[],
      vesselPurpose:[[],Validators.required],
      operationAt:[[]],
      steps: this.formBuilder.array([]),
      ruleSteps: this.formBuilder.array([]),
      unitType: ['',Validators.required],
      itemDocument:[[]],
      vesselUnitType: [''],
      area:[false],
      shipStatus:[[]],
      vesselCall:[[]],
      tariffBasedOn:[''],
      direction:[''],
      remarks:[''],
      currency: ['',Validators.required],
      validFrom: [''],
      validTo: [''],
      seqNo:[]
    });

    this.dropdownSettings = {
      idField: 'item_id',
      textField: 'item_text',
    };
    this.dropdownSettingsOperation = {
      idField:'item_id',
      textField:'item_text'
    }
    this.dropdownSettings1 = {
      idField: 'item_id',
      textField: 'item_text',
      showSelectedItemsAtTop: true,
    };
    this.dropdownSettings2 = {
      idField: 'item_id',
      textField: 'item_text',
      showSelectedItemsAtTop: true,
    };
    if (this.urlParam && this.urlParam.key) {
      this.getTariffDetails(this.urlParam.key);
    }
  }
  get inputs(): FormArray {
    return this.formTariff.get('inputs') as FormArray;
  }

  get costitems(): FormArray {
    return this.formTariff.get('costitems') as FormArray;
  }
  incrementZoom(amount: number) {
    this.zoom += amount;   }

  handleSlabGrid(ev?){
    this.addSeqItem(0,'');
  }

  onCountryChange() {
    this.getPortList(this.formTariff.value.country);
  }


  units:SystemType[] = [];
  vesselUnits:SystemType[] = [];
  vesselPurposeList:any=[];
  supplierList:SystemType[] = [];
  shipStatusList:SystemType[] = [];
  coasterFreightList:SystemType[] =[];
  async getMasterdata(){
   
      let payload = this.commonService.filterList()
      if(payload?.query) payload.query = {"status": true, "typeCategory": {
      "$in": [
        'vesselDimension','chargeBasis','vesselPurpose','supplierName',
      ]
    }}
    this.commonService.getSTList('systemtype', payload)
      ?.subscribe((res: any) => {
        this.units = res?.documents?.filter(
          (x) => x.typeCategory === 'chargeBasis'
        );
        this.vesselUnits = res?.documents?.filter(
          (x) => x.typeCategory === 'vesselDimension'
        );

        this.supplierList = res?.documents?.filter(
          (x) => x.typeCategory === 'supplierName'
        )
        let allItems   = res?.documents.map((i) => {
          return {name:i.typeName,id:i.systemtypeId}
        });
        this.vesselUnits.map((i,index) => {
          allItems.push({
            name:`rate_${i.typeName}`,id:index
          })
        })
        this.allParametrs = [...allItems,{name:'Cargo',id:'1'},{name:'Vessel',id:'2'},{name:'Weekday',id:'3'},{name:'Time',id:'4'},{name:'Holiday',id:5},{name:'Last Port Country',id:6}];
        this.addSteps();
      });


  }


  async getmaster(){
 
  let payload = this.commonService.filterList()
  if(payload?.query)payload.query = { "typeCategory": "vesselPurpose"}
  this.commonService.getSTList('systemtype', payload)
      ?.subscribe((res: any) => {
        this.vesselPurposeList = res?.documents;
        const vesselPurposeList=res?.documents?.filter(
          (x) => x.typeCategory === 'vesselPurpose'
        )
        if (this.vesselPurposeList){
          let purposes = [{item_id:'0',item_text:'Any'}];
          this.vesselPurposeList.forEach((e) => {
            purposes.push({
              item_id: e.systemtypeId,
              item_text: e.typeName,
            });
          });
          this.vesselPurposeList = purposes;
        }
      })

  }

  async getCommodity() {
    let payload = this.commonService.filterList()
    this.commonService.getSTList('commodity', payload)
      ?.subscribe((res: any) => {
        this.cargoList = res?.documents;
        if (this.cargoList)
        {
          let cargo = [{item_id:'0',item_text:'Any'}];
          this.cargoList.forEach((e) => {
            cargo.push({
              item_id: e.commodityId,
              item_text: e.commodityName,
            });
          });
          this.cargoList = cargo;
        }
      })

  }



  getCallandStatus() {
    let payload = this.commonService.filterList()
    if(payload?.query) payload.query = {"status": true, "typeCategory": {
      "$in": [
        'vesselCall','shipStatus',
      ]
    }}
    this.commonService.getSTList('systemtype', payload)
      ?.subscribe((res: any) => {
        this.shipStatusList = res?.documents?.filter(
          (x) => x.typeCategory === 'shipStatus'
        )
        this.coasterFreightList = res?.documents?.filter(
          (x) => x.typeCategory === 'vesselCall'
        )
        if (this.shipStatusList){
          let purposes = [];
          this.shipStatusList.forEach((e) => {
            purposes.push({
              item_id: e.systemtypeId,
              item_text: e.typeName,
            });
          });
          this.shipStatusList = purposes;
        }
        if (this.coasterFreightList){
          let purposes = [];
          this.coasterFreightList.forEach((e) => {
            purposes.push({
              item_id: e.systemtypeId,
              item_text: e.typeName,
            });
          });
          this.coasterFreightList = purposes;
        }
      });
  }



  async onFileSelected(e,placement) {
    var filename = e.target.files[0].name.replace(' ','');
    if(placement === 'itemLevel'){
      this.extension = filename.substr(filename.lastIndexOf('.'));
      if (
        this.extension.toLowerCase() === '.xls' ||
        this.extension.toLowerCase() === '.xlsx' ||
        this.extension.toLowerCase() === '.pdf' ||
        this.extension.toLowerCase() === '.doc' ||
        this.extension.toLowerCase() === '.docx' || this.extension.toLowerCase() === '.csv'
      ) {
        this.docFile = e.target.files[0];
        var filename1 = filename;
        const formData = new FormData();
        formData.append('file', e.target.files[0], `${e.target.files[0].name}`);
        formData.append('name', `${e.target.files[0].name}`);
        var file = await this.commonService.uploadDocuments('tariff',formData).subscribe();
        if (file) {
          let doc = {
            documentURL:`${e.target.files[0].name}`,
            documentName:filename,
            sourceDate: new Date(),
            source:'Tariff Master Input'
          }
          if(this.inputForm.value?.itemDocument?.length > 0 || this.inputForm.value?.itemDocument){
            let prevDocs = [...this.inputForm.value?.itemDocument];
            prevDocs.push(doc);
            this.inputForm.get('itemDocument').patchValue(prevDocs);
          }
          else{
            this.inputForm.get('itemDocument').patchValue([doc]);
          }
        }


      } else {
        this.inputForm.get('itemDocument').patchValue({});
      }

    }
    else{
      this.formTariff.value.documentName = filename;
      this.extension = filename.substr(filename.lastIndexOf('.'));
      if (
        this.extension.toLowerCase() === '.xls' ||
        this.extension.toLowerCase() === '.xlsx' ||
        this.extension.toLowerCase() === '.pdf' ||
        this.extension.toLowerCase() === '.doc' ||
        this.extension.toLowerCase() === '.docx' || this.extension.toLowerCase() === '.csv'
      ) {
        this.docFile = e.target.files[0];
        var filename1 = this.formTariff.value.documentName;
        const formData = new FormData();
        formData.append('file', e.target.files[0], `${e.target.files[0].name}`);
        formData.append('name', `${e.target.files[0].name}`);
        var file = await this.commonService.uploadDocuments('tariff',formData).subscribe();
        if (file) {
          this.formTariff.value.documentURL = `https://s3-${environment.AWS_REGION}.amazonaws.com/${environment.bucketName}/tariff/${filename1.replace(/\s+/g, '')}`;
          this.docUrl = this.formTariff.value.documentURL
          this.docName = filename;
          if (!this.formTariff.value.documentName.includes(this.extension)) {
            this.formTariff.value.documentName = filename1;
          }
        }

      } else {
        this.formTariff.get('documentURL').patchValue('');
        this.formTariff.get('Doc').patchValue('');
      }
    }
    this.prepareDocuments();
  }

  getPortList(id) {
    let payload = this.commonService.filterList()
    if(payload?.query) payload.query = {"status": true,  'country.countryId': id,}
    this.commonService.getSTList('port', payload)?.subscribe((data) => {
      this.portList = data?.documents;
      if (this.isEdit && this.tariffDetails[0]?.port !== 'Any') {
        this.portDetails = this.portList.filter(
          (e1) => this.tariffDetails[0]?.port === e1?.portId
        );
        this.portDetails = this.portDetails[0];
        this.getTerminal(this.tariffDetails[0]?.port);
      }
      else{
        this.portDetails = 'Any';
        this.getTerminal('Any');
      }
    });
  }

  getCountryList() {
    let payload = this.commonService.filterList()
  if(payload?.query)payload.query = {"status": true}
    this.commonService.getSTList('country', payload)?.subscribe((data) => {
      this.countryList = data?.documents;
    });
  }

  patchValue(data) {
    this.formTariff.patchValue({
      country: data?.country,
      port: data?.port,
      terminal: data?.terminal,
      berth: data?.berth,
      vesselType: data?.vesselType,
      laden: data?.ladenBallast,
      coastal: data?.coastal,
      foreign:data?.foreign,
      baseCurrency: data?.baseCurrency,
      validFrom: data?.validFrom,
      validTo: data?.validTo,
      docRefNo: data?.docRefNo
    });
    this.docName = data?.documentName
    this.docUrl = data?.documentURL
    if (data?.costItems) {
      this.inputsArray = data?.costItems;
    }
    this.getPortList(data?.country);
  }

  openfile(url){
    const source = url;
    const link = document.createElement("a");
    link.href = source;
    link.target = "_blank";
    link.click();
  }


  openFile(id){
    let element  = document.getElementById(id);
    element.click();
  }

  onFileSelectedTable(ev){
    let workBook = null;
    let jsonData = null;
    const reader = new FileReader();
    const file = ev.target.files[0];
    reader.onload = (event) => {
      const data = reader.result;
      workBook = XLXS.read(data, { type: 'binary' });
      jsonData = workBook.SheetNames.reduce((initial, name) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLXS.utils.sheet_to_json(sheet);
        return initial;
      }, {});
      let sheetName = Object.keys(jsonData)[0];
      if(jsonData[sheetName].length > 0){
        if(this.steps.value.length > 0){
          this.steps.clear();
        }
        let stepIndex = this.steps.value.length;
        jsonData[sheetName].map((i) => {
          this.steps.push(this.formBuilder.group({
            seqNo: stepIndex + 1,
            flat:true,
            break:false,
            parameterMin: i?.min,
            parameterMax: i?.max,
            unitRate: i?.rate,
            rate: i?.rate,
            minRate: [i?.minRate],
            maxRate: [''],
            discount: [i?.discount],
            surcharge: [''],
            surcharges: this.formBuilder.array([]),
          }))
        })
      }

      const dataString = JSON.stringify(jsonData);
    }
    reader.readAsBinaryString(file);
  }

  getTariffDetails(id) {
    let arr = [];
    let payload = this.commonService.filterList()
    if(payload?.query) payload.query = {ratemasterId: id}
    this.commonService.getSTList('ratemaster', payload)?.subscribe((data) => {
      this.tariffDetails = data?.documents;
      if(!this.isMasterClone){
        this.isEdit = true;
      }
      this.patchValue(this.tariffDetails[0]);
    });
  }
  addSeqItem(j, data) {
    if (data) {
      let stepNEW = this.newStep(j, data)
      if(data?.dimensions){
        data.dimensions.forEach(e=>{
             (stepNEW.get("dimensions") as FormArray).push(
          this.formBuilder.group(e)
        )
        })
      }
      if(data.surcharges){
        data.surcharges.forEach(e=>{
             (stepNEW.get("surcharges") as FormArray).push(
          this.formBuilder.group(e)
        )
        })
      }
      this.steps.push(stepNEW)

    }
    else {
      this.steps.push(this.newStep(j, ''));
    }
  }

  changeStatus(e) {
    this.formTariff.controls.outerAnchorageHours?.patchValue(e.target.checked);
  }

  removeInput(i: number) {
    this.inputs?.removeAt(i);
  }

  removeCostItem(j: number) {
    this.costitems?.removeAt(j);
  }

  removeSeqItem(j:number) {
    this.steps?.removeAt(j);
  }

  removeSeqItemRule(j:number) {
    this.ruleSteps.removeAt(j);
  }

  removeDimItem(k,control){

    control.removeAt(k)
  }

  get steps(): FormArray {
    return this.inputForm.get('steps') as FormArray;
  }

  newCostItem(j, data): FormGroup {
    if (data) {
    }
    else {
      return this.formBuilder.group({
        flatBreak: [''],
        parameterMin: [''],
        parameterMax: [''],
        unitRate: [''],
        minRate: [''],
        maxRate: [''],
        discount: [''],
        surcharge: [''],
        surcharges: this.formBuilder.array([]),
      })
    }

  }


  newStep(j, data): FormGroup {
    let stepIndex = this.steps.value.length;
    if (data) {
      return this.formBuilder.group({
      seqNo: j+1,
      flat:data.flat,
      break:data?.break,
      parameterMin: data.parameterMin.toString(),
      parameterMax: data.parameterMax.toString(),
      unitRate: data.unitRate,
      rate: data.rate.toString(),
      uom: data.uom,
      minRate: data.minRate,
      maxRate: data.maxRate,
      discount: data.discount,
      surcharge: data.surcharge,
      surcharges:this.formBuilder.array([])})
    }
    else {
      let stepIndex = 0
      stepIndex = this.steps.value.length;
      let addKeys = {};
      this.addiTionalRatesToStep.map((i) => {
        addKeys[i] = new FormControl('');
      })
      return this.formBuilder.group({
        seqNo: [stepIndex + 1],
        flat:[false],
        break:[false],
        parameterMin: [''],
        parameterMax: [''],
        unitRate: [''],
        rate: [''],
        minRate: [''],
        maxRate: [''],
        discount: [''],
        surcharge: [''],
        surcharges:this.formBuilder.array([]),
        ...addKeys
      })
    }

  }

  newDim(j, data): FormGroup {

    if (data) {
      return this.formBuilder.group(data)

    }
    else {
      let stepIndex = 0
      stepIndex = this.steps.length;
      var allControls = {};
      this.vesselUnits?.map((i) => allControls[i.typeName]=['']);


      return this.formBuilder.group({
        grt:[''],
        nrt:[''],
        dwt:[''],
        loa:[''],
        lbp:['']
      })
    }

  }

  newSurcharge(j, data): FormGroup {
    if (data) {

      return this.formBuilder.group(data)
    }
    else {
      let stepIndex = 0
      stepIndex = this.steps.length;
      return this.formBuilder.group({
        parameter:[''],
        timeFrom:[],
        timeTo:[],
        dayFrom:[''],
        dayTo:[''],
        monthFrom:[''],
        monthTo:[''],
        value:[''],
        surcharge:[''],
        surchargeType:['']
      })
    }

  }


  get dimensions(): FormArray {
    return this.inputForm.get('dimensions') as FormArray;
  }

  get surcharges(): FormArray {
    return this.inputForm.get('surcharges') as FormArray;
  }

  addNewDimension(j, k, control) {
    var allControls = {};
    this.vesselUnits?.map((i) => allControls[i.typeName]=['']);
    if(allControls && control.controls.length === 0){
      let condArray = control as FormArray;
    control.push(
      this.formBuilder.group(allControls)
    );
    }
  }


  addNewSurcharge(j, k, control) {

    if (control.controls.length === 0) {

      let condArray = control as FormArray;
      control.push(
        this.newSurcharge(j, '')
      );
    }else if(k==='new'){
      let condArray = control as FormArray;
      control.push(
        this.newSurcharge(j, '')
      );
    }
  }

  get f() {
    return this.formTariff.controls;
  }

  get f2(){
    return this.inputForm.controls
  }

  ngOnInit(): void {
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();
    this.getSystemTypeDropDowns();
    this.getCommodity();
    this.getCountryList();
    this.getUomList();
    this.getCostItem();
    this.getCurrencyDropDowns();
    this.getMasterdata();
    this.getCommodity();
    this.getmaster();
    this.getCallandStatus();
  }

  getUomList() {
    let payload = this.commonService.filterList()
   if(payload?.query) payload.query = { status: true }
    this.commonService.getSTList('uom', payload)?.subscribe((data) => {
      this.uomList = data?.documents;
    });
  }

  getCurrencyDropDowns() {
    let payload = this.commonService.filterList()
    if(payload?.query) payload.query = { status: true }
    this.commonService.getSTList('currency', payload)
      ?.subscribe((res: any) => {
        this.currencyList = res?.documents;
      });
  }

  open(content, j) {
    this.costIndex = j + 1;
    this.payloadObj = this.formTariff.value;
    this.payloadObj.costitems.forEach((e, i) => {
      e.cost_id = i + 1;
    });
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }
  deleteInput(i){
   this.inputsArray.splice(i,1)
  }
  modalReference:any
  editIndex:any = null;
  allDocuments:any = [];
  async openInputModal(type, data, content, index) {
    await this.getMasterdata();
    await this.getCostItem();
    if (type === 'add') {
      this.steps.clear();
      this.ruleSteps.clear();
      this.inputForm.reset();
      this.prepareInputForm();
      this.handleSlabGrid();
      this.isEditItem = false;
      this.isView = false
      if (this.docName && this.docUrl) {
        this.allDocuments.push({
          name: this.docName,
          url: this.docUrl,
          sourceDate: '',
          source: 'Tariff Master'
        })
      }
    }

    if (type === 'edit') {
      this.steps.clear();
      this.ruleSteps.clear();
      this.isEditItem = true
      this.isView = false
      this.editIndex = index;
      this.inputForm.patchValue({...data,seqNo:index+1})
      this.inputForm.get('vesselUnitType').patchValue(data.vesselUnitType)
      this.inputForm.get('parameter').patchValue(data.parameter)
      this.inputForm.get('cargo').patchValue(data?.cargo)
      this.inputForm.get('itemDocument').patchValue(data?.itemDocument)
    }

    if (type === 'view') {
      this.isView = true;
      this.isEditItem = false;
      this.inputForm.patchValue(data)

      this.inputForm.get('vesselUnitType').patchValue(data.vesselUnitType)
      this.inputForm.get('parameter').patchValue(data.parameter)
      this.inputForm.get('cargo').patchValue(data?.cargo)
      this.inputForm.get('itemDocument').patchValue(data?.itemDocument)
    }

    if (type === 'edit' || type === 'view') {
      this.prepareDocuments();
    }

    if (data && data?.steps && data?.steps?.length>0) {
      data.steps.forEach((e, i) => {
        this.addSeqItem(i, e)
      });
      let addRates = Object.keys(data?.steps[0]).some((name) => name.includes('rate_'));
      if(addRates){
        this.addiTionalRatesToStep = [];
        Object.keys(data.steps[0]).forEach((i) =>{
          if(i.includes('rate_')){
            this.addiTionalRatesToStep.push(i);
          }
        })
      }
      this.steps.controls.forEach((e,i) =>{
        const group = e as FormGroup;
        this.addiTionalRatesToStep.map((name) => {
          group.addControl(name, new FormControl(data.steps[i][name]));
        })
      })

    }



    if (data?.ruleSteps?.length > 0) {
      data?.ruleSteps.forEach(e => {
        (this.ruleSteps).push(
          this.formBuilder.group({...e, from:e?.from ? e.from :null,to:e?.to ? e.to:null})
        )
      })
    }


    this.addSteps()

    this.modalService.open(content, {
      windowClass: "myCustomModalClass",
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'xl',
    });
  }


  addSteps(){
    if(this.ruleSteps.value.length > 1){
      this.additionalPrams = [];
      this.ruleSteps.value.map((e,i) => {
        if((this.ruleSteps.value.length-1) !== i){
          this.additionalPrams.push({name:`step${i+1}.output`,id:'0'});
        }
      });
      this.additionalPrams.forEach((e) => {
        if(!this.allParametrs.some((i) => i.name === e.name)){
          this.allParametrs.push(e);
        }
      })
    }
  }


  prepareInputForm(){
    let seqNo = this.inputsArray.length+1;
    this.inputForm = this.formBuilder.group({
      costItemGroup:[''],
      name: ['',Validators.required],
      parameter: ['',Validators.required],
      cargo:[[],Validators.required],
      supplier:[],
      vesselPurpose:[[],Validators.required],
      operationAt:[[]],
      steps: this.formBuilder.array([]),
      ruleSteps: this.formBuilder.array([]),
      unitType: ['',Validators.required],
      itemDocument:[[]],
      vesselUnitType: [''],
      area:[false],
      shipStatus:[[]],
      vesselCall:[[]],
      tariffBasedOn:[''],
      direction:[''],
      remarks:[''],
      currency: ['',Validators.required],
      validFrom: [''],
      validTo: [''],
      seqNo:[seqNo]
    });
  }

  prepareDocuments(){
    this.allDocuments = [];
    if(this.docName && this.docUrl){
      this.allDocuments.push({
        name:this.docName,
        url:this.docUrl,
        sourceDate:new Date().toDateString(),
        source:'Tariff Master'
      })
    }
    if(this.inputForm.value?.itemDocument?.documentName || this.inputForm.value?.itemDocument?.length > 0){
      if(this.inputForm.value?.itemDocument.length > 0){
        this.inputForm.value?.itemDocument.forEach((e) => {
          this.allDocuments.push({
            name:e?.documentName,
            url:e?.documentURL,
            sourceDate:new Date(e?.sourceDate).toDateString(),
            source:e?.source
          })
        })
      }
      else{
        this.allDocuments.push({
          name:this.inputForm.value?.itemDocument?.documentName,
          url:this.inputForm.value?.itemDocument?.documentURL,
          sourceDate:new Date(this.inputForm.value?.itemDocument?.sourceDate).toDateString(),
          source:this.inputForm.value?.itemDocument?.source
        })
      }
    }
  }


  cloneItem(data,index,content){
    this.steps.clear();
    this.inputForm.reset();
    this.inputSubmitted = false;
    this.isCloningItem = true;
    this.cloneIndex  = index;
    this.inputForm.patchValue({...data,seqNo:this.inputsArray.length+1});
    this.inputForm.get('vesselUnitType').patchValue(data.vesselUnitType)
    this.inputForm.get('parameter').patchValue(data.parameter)
    this.inputForm.get('cargo').patchValue(data?.cargo)
    this.inputForm.get('itemDocument').patchValue(data?.itemDocument)
    this.prepareDocuments();
    this.modalService.open(content, {
      windowClass: "myCustomModalClass",
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'xl',
    });
    if (data.steps) {
      data.steps.forEach((e, i) => {
        this.addSeqItem(i, {...e,rate:''});
      })
      let addRates = Object.keys(data.steps[0]).some((name) => name.includes('rate_'));
      if(addRates){
        this.addiTionalRatesToStep = [];
        Object.keys(data.steps[0]).forEach((i) =>{
          if(i.includes('rate_')){
            this.addiTionalRatesToStep.push(i);
          }
        })
      }
      this.steps.controls.forEach((e,i) =>{
        const group = e as FormGroup;
        this.addiTionalRatesToStep.map((name) => {
          group.addControl(name, new FormControl(data.steps[i][name]));
        })
      })
    }

    if (data?.ruleSteps?.length > 0) {
      data?.ruleSteps.forEach(e => {
        (this.ruleSteps).push(
          this.formBuilder.group(e)
        )
      })
    }

    this.addSteps();
  }


  addDim(j, data) {

    if (data) {
      let stepNEW = this.newDim(j, data)

      this.dimensions.push(stepNEW)

    }
    else {
      this.dimensions.push(this.newDim(j, data));
    }
  }

  addSurchargeRow(j,data){
    if(data){
      let stepNew  = this.newSurcharge(j,data);
      this.surcharges.push(stepNew);
    }
    else{
      this.surcharges.push(this.newSurcharge(j,data));
    }
  }




  openVesselDim(data,content,control) {
    this.addNewDimension(0,0,control)
    this.modalReference = this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }

  openSurchargeModal(data,content,control){

    this.addNewSurcharge(0,0,control)
    this.modalReference = this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }

  getControls(formControl){
    return Object.keys(formControl);
  }

  save() {
    this.submitted = true;
    if (this.formTariff.invalid) {
      return false;
    }
    this.submitted = false;
  }

  getTariffList() {
    let mustArray = [];

    let payload = this.commonService.filterList()
    this.commonService.getSTList('ratemaster', payload)?.subscribe((data) => {
      this.tariffList = data?.documents;
    });
  }


  onSaves() {
    let costArr = [];
    let seqArr = [];
    this.payloadObj = this.formTariff.value;

      this.payloadObj.steps.forEach((e1) => {
        seqArr = [];
        e1.cost_id = this.costIndex;
        this.stepsArray.push(e1);
      });
    (<FormArray>this.formTariff.get('steps')).clear();
    this.modalService.dismissAll();
  }

  onSaveDim(j){
    this.modalReference.close()
  }

  onSaveInputs(key) {
    if(this.inputForm.invalid){
      this.inputSubmitted = true;
      this.inputForm.markAllAsTouched();
      return
    }
    if(this.isCloningItem){
      var accept  = this.compareObjects(this.inputsArray[this.cloneIndex],this.inputForm.value,this.keysToCompare);
      if(accept){
        this.onCancelModal();
        this.notification.create(
          'error',
          'You can not repeat unique same entry',
          ''
        );
        return
      }

    }
    let costitem = this.allCostitemsFromDatabase.find((item) => this.inputForm.value?.name === item.costitemId)?.costitemName;
    let currencyCode =this.currencyList.find((currency) => currency?.currencyId === this.inputForm.value?.currency)?.currencyShortName
    if(this.inputsArray){
      if(this.isEditItem && this.editIndex !== null){
        this.inputsArray[this.editIndex]={...this.inputForm.value,costitem:costitem,currencyCode:currencyCode}
      }
      else{
        this.inputsArray.push({...this.inputForm.value,costitem:costitem,currencyCode:currencyCode});
      }
    }
    else{
      this.inputsArray.push({...this.inputForm.value,costitem:costitem,currencyCode:currencyCode});
    }
    this.onSave('Item');

    this.editIndex =null;
    this.isEditItem = false;
    this.isCloningItem  = false;
    this.isView = false;
    this.cloneIndex = null;
    this.addiTionalRatesToStep = [];
    this.allDocuments = [];
    if(key !== 'enter'){
      this.modalService.dismissAll();
    }
  }

  compareObjects(obj1, obj2, keys) {
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      if (obj1.hasOwnProperty(key) && obj2.hasOwnProperty(key)) {
        if (obj1[key] !== obj2[key]) {
          return false;
        }
      } else {
        return false;
      }
    }
    return true;
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.formTariff.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }

    return invalid;
  }

  transactionId:any;
  onSave(type?) {
    if(type !== 'Item'){
      this.findInvalidControls();
      if (this.formTariff.invalid) return;
    }
    let costArr = [];
    let seqArr = [];
    this.payloadObj = this.formTariff.value;
    this.payloadObj['countryName'] = this.countryList.find((i) => i.countryId === this.payloadObj.country)?.countryName;
    this.payloadObj['portName'] = this.portList.find((i) => i.portId === this.payloadObj.port)?.portDetails?.portName || 'Any'
    this.payloadObj['costItems'] = this.inputsArray.map((e,i) =>{ return {...e,costitem:this.allCostitemsFromDatabase.find((item) => e?.name === item.costitemId)?.costitemName,currencyCode:this.currencyList.find((currency) => currency?.currencyId === e?.currency)?.currencyShortName}});
    delete this.payloadObj['doc']
    delete this.payloadObj.steps;
    let createBody = [];
    createBody.push(this.payloadObj);

    if (this.isEdit) {
      this.payloadObj.ratemasterId = this.isMasterClone ? this.transactionId:  this.urlParam?.key ? this.urlParam?.key :this.transactionId;
      let berthArr = []
      let cargoArr = []

      this.payloadObj?.berth?.forEach((e, i) => {
          berthArr.push(e)
      })

      this.payloadObj?.cargo?.forEach((e, i) => {
        this.cargoList.forEach((el, i) => {
          if (typeof el === 'string') { cargoArr.push({ item_id: el['systemtypeId'], item_text: el['typeName'] }) }
        })
      })

      this.payloadObj['berth'] = berthArr.length > 0 ? berthArr : this.berths
      this.payloadObj['cargo'] = cargoArr.length > 0 ? cargoArr : this.cargos
      this.payloadObj['tenantId'] = '1'
      this.payloadObj['orgId'] = '1'
      this.commonService.UpdateToST(`ratemaster/${createBody[0].ratemasterId}`,createBody[0]).subscribe(
        (data: any) => {
          if (data) {
            this.notification.create(
              'success',
              'Tariff Inputs Updated Successfully',
              ''
            );
            if(type === 'Item'){
              this.inputForm.reset();
              this.steps.clear();
              this.ruleSteps.clear();
            }
            if(type !== 'Item'){
              this.route.navigate(['/configuration/list']);
            }
          }
        },
        (error) => {
          this.notification.create('error',error?.error?.error?.message, '');
        }
      );
    } else {
      this.commonService.addToST('ratemaster',createBody[0]).subscribe(
        (data: any) => {
          if (data) {
            this.notification.create(
              'success',
              'Tariff Master Added Successfully',
              ''
            );
            if(type !== 'Item'){
              this.route.navigate(['/configuration/list']);
            }
            else{
              this.isEdit = true;
              this.transactionId = data?.ratemasterId;
              this.tariffDetails = data;
            }
          }
        },
        (error) => {
          this.notification.create('error',error?.error?.error?.message, '');
        }
      );
    }
  }

  selectedPort: any;
  getTerminal(id) {
    if(id === 'Any'){
      this.terminalList = [{item_id:'0',item_text:'Any'}];
      return
    }
    this.port1Value = id;
    this.terminalList = [{item_id:'0',item_text:'Any'}];
    this.berthList = [{item_id:'0',item_text:'Any'}];
    this.portList.map((port) => {
      if (port?.portId === id) {
        this.selectedPort = port;
        if (port?.terminal) {
          port.terminal.map((terminal) => {
            this.terminalList.push({
              item_id: terminal.name,
              item_text: terminal.name,
            });
            (this.portDetails.berth || []).map((selectedBerth) => {
              if (terminal?.berths && terminal?.berths?.length > 0) {
                terminal.berths.map((berth) => {
                  if (berth === selectedBerth.item_text) {
                    this.berthList.push({
                      item_id: `${berth} - ${terminal.name}`,
                      item_text: berth,
                    });
                  }
                });
              }
            });
          });
        }
      }
    });
  }

  getBerths(e?) {
    let id = this.port1Value;
    this.berthList = [{item_id:'0',item_text:'Any'}];
    if(this.portList){
      this.portList.map((port) => {
        if (port?.portId === id) {
          let berthData = [];
          if (port?.terminal) {
            port.terminal.map((terminal) => {
              this.formTariff.value.terminal.map((i) =>{
                if (terminal.name === i?.item_id) {
                  if (terminal.berths && terminal.berths.length > 0) {
                    terminal.berths.forEach((e1) => {
                      this.berthList.push({ item_id: e1, item_text: `${e1}` });
                    });
                  }
                }
              })
            });
          }
        }
      });
    }
  }


  onPortChange(e) {
    if (this.portList) {
      this.portDetails = this.portList.filter(
        (e1) => e === e1.portId
      );
      this.portDetails = this.portDetails[0];
      this.getTerminal(e);
    }
  }

  onTerminalChange(e) {
    this.getBerths();
  }



  getVesselType() {
    let payload = this.commonService.filterList()
    if(payload?.query) payload.query = {"status": true, "typeCategory": {
      "$in": [
        'vessel type','vessel category','Vessel Category','vesselType'
      ]
    }}
    this.commonService.getSTList('systemtype', payload)?.subscribe((res: any) => {
      this.vesselTypeList = res?.documents;
    });
  }

  getTemplate() {

    let payload = this.commonService.filterList()
    this.commonService.getSTList('costtemplate', payload)
      ?.subscribe((res: any) => {
        this.templateList = res.documents;
      });
  }

  costHeadList: any;
  getCostHeadList() {
    let payload = this.commonService.filterList()
    if(payload?.query) payload.query = {"status": true}
    this.commonService.getSTList('costhead', payload)?.subscribe((data) => {
      this.costHeadList = data?.documents;
      this.getCostItem();
    });
  }

  onChargeGrpChange(e){

    if(!e){
      this.costitemData = this.allCostitemsFromDatabase;
    }
    else{
      this.costitemData = this.allCostitemsFromDatabase.filter((i) => (i.costitemCategoryId === e || i.costitemGroupId === e))
    }

  }


  allCostitemsFromDatabase:any = [];
  getCostItem(e?) {
    let payload = this.commonService.filterList()
   if(payload?.query) payload.query = {"status": true}
    this.commonService.getSTList('costitem', payload)?.subscribe((data) => {
      this.costitemData = data?.documents;

      this.allCostitemsFromDatabase = this.costitemData;
    });
  }

  vesselType: any;
  getSystemTypeDropDowns() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {"status": true, "typeCategory": {
      "$in": [
        'chargeHeader','vesselType'
      ]
    }}
    this.commonService.getSTList('systemtype', payload)
      ?.subscribe((res: any) => {
        this.costHeadList = res?.documents?.filter(x => x.typeCategory === "chargeHeader");
        this.vesselTypeList = res?.documents?.filter(x => x.typeCategory === "vesselType");
        let formatVessel = [{item_id:'0',item_text:'Any'}]
        this.vesselTypeList.forEach(e => {
          formatVessel.push({ item_id: e.systemtypeId, item_text: e.typeName })
        })
        this.vesselTypeList = formatVessel
      });
  }

  onCancel() {
    this.route.navigate(['/configuration/list']);
  }

  onCancelModal() {
    this.allDocuments = [];
    this.inputForm.reset();
    this.steps.clear();
    this.ruleSteps.clear();
    this.inputSubmitted = false;
    this.isEditItem  = false;
    this.isCloningItem  = false;
    this.cloneIndex = null;
    this.isView = false;
    this.modalService.dismissAll();
  }

  onCancelDimModal() {
    this.isViewSurcharge  = false;
    this.modalReference.close();
  }

  onTypeChange(e, control) {
    this.conditionIndex = e.target.value === 'single' ? 1 : 0;
    if (e.target.value === 'single') {
      this.addNewDimension(0, 0, control);
    }
  }

  removeSurchargeItem(control,index){
    control.get('surcharges').removeAt(index)
  }

  isViewSurcharge:boolean= false;
  viewSurcharges(step,content){

    this.isViewSurcharge = true;
    this.openSurchargeModal('',content,step.get('surcharges'))
  }

  get ruleSteps(): FormArray {
    return this.inputForm.get('ruleSteps') as FormArray;
  }

  ruleAddIndex:any;
  openRule(content, data, index) {
    this.inputForm.patchValue(data)
    this.inputForm.get('vesselUnitType').patchValue(data.vesselUnitType)
    this.inputForm.get('parameter').patchValue(data.parameter)
    this.inputForm.get('cargo').patchValue(data?.cargo)
    this.inputForm.get('terminal').patchValue(data?.terminal)
    this.inputForm.get('berth').patchValue(data?.berth)
    this.inputForm.get('itemDocument').patchValue(data?.itemDocument)
    this.inputForm.get('uom').patchValue(data.uom)
    this.ruleAddIndex = index;
    if (data?.ruleSteps?.length > 0) {
      data?.ruleSteps.forEach(e => {
        (this.ruleSteps).push(
          this.formBuilder.group(e)
        )
      })
    }
    else {
      this.ruleSteps.push(this.newStepRule(data));
    }
    if (data.steps) {
      data.steps.forEach((e, i) => {
        this.addSeqItem(i, e)
      })
      let addRates = Object.keys(data.steps[0]).some((name) => name.includes('rate_'));
      if(addRates){
        this.addiTionalRatesToStep = [];
        Object.keys(data.steps[0]).forEach((i) =>{
          if(i.includes('rate_')){
            this.addiTionalRatesToStep.push(i);
          }
        })
      }
      this.steps.controls.forEach((e,i) =>{
        const group = e as FormGroup;
        this.addiTionalRatesToStep.map((name) => {
          group.addControl(name, new FormControl(data.steps[i][name]));
        })
      })
    }
    if(this.ruleSteps.value.length > 1){
      this.additionalPrams = [];
      this.ruleSteps.value.map((e,i) => {
        if((this.ruleSteps.value.length-1) !== i){
          this.additionalPrams.push({name:`step${i+1}.output`,id:'0'});
        }
      });
      this.allParametrs = [...this.allParametrs];
    }
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg'
    }
    )
  }

  openRuleFromCollapse(){
    if (!(this.ruleSteps.value.length > 0)) {
      this.ruleSteps.push(this.newStepRule(''));
    }
  }

  newStepRule(data): FormGroup {
    let stepIndex = this.ruleSteps.value.length;
    return this.formBuilder.group({
      seqNo: stepIndex + 1,
      parameter: [''],
      condition: [''],
      from:[],
      to:[],
      value: [''],
      expression: ['']
    })

}

onSavesRule(j) {
  this.inputsArray[this.ruleAddIndex]=this.inputForm.value
  this.inputForm.reset();
  (<FormArray>this.inputForm.get('ruleSteps'))?.clear();
  this.onSave('Item');
  this.modalService.dismissAll();
}

addStepItem(){
  this.ruleSteps.push(this.newStepRule(''));
  if(this.ruleSteps.value.length > 1){
    this.allParametrs.push({name:`step${this.ruleSteps.value.length-1}.output`,id:'0'});
  }

}



onCancelRuleModal() {
  this.ruleSteps?.clear();
  this.modalService.dismissAll();
}

modalReferenceForRate:any;
addRateColumn(content){
  this.rateNameForm = this.formBuilder.group({
    name:['',[Validators.required,Validators.pattern("^[a-zA-Z0-9_]*$")]],
    description:['']
  });
  this.modalReferenceForRate = this.modalService.open(content, {
    ariaLabelledBy: 'modal-basic-title',
    backdrop: 'static',
    keyboard: false,
    centered: true,
    size: 'sm',
  });

}

isEditRateItem = false;
editRateIndex: any = null;
editRateItem: any = '';
editAdditionalRates(content, name, index) {
  this.editRateItem = name;
  name = this.removeName(name);
  this.isEditRateItem = true
  this.editRateIndex = index;
  this.rateNameForm = this.formBuilder.group({
    name:[name,[Validators.required,Validators.pattern("^[a-zA-Z0-9_]*$")]]
  });
  this.modalReferenceForRate = this.modalService.open(content, {
    ariaLabelledBy: 'modal-basic-title',
    backdrop: 'static',
    keyboard: false,
    centered: true,
    size: 'sm',
  });
}

removeAdditionalRates(i) {
  this.steps.value.forEach((e) => delete e[this.addiTionalRatesToStep[i]]);
  this.addiTionalRatesToStep.splice(i,1);

}

addiTionalRatesToStep:any = [];
onSaveRateColumn(){

  if (this.isEditRateItem) {
    this.steps.controls.forEach((e,i) =>{
      let group = e as FormGroup;
      group.addControl(`rate_${this.rateNameForm.value.name}`, new FormControl(group.value[`${this.editRateItem}`]));
      group.removeControl(`${this.editRateItem}`);
    });
    this.addiTionalRatesToStep[this.editRateIndex] = `rate_${this.rateNameForm.value.name}`;
  } else {
    this.addiTionalRatesToStep.push(`rate_${this.rateNameForm.value.name}`);
    this.steps.controls.forEach((e,i) =>{
      const group = e as FormGroup;
      group.addControl(`rate_${this.rateNameForm.value.name}`, new FormControl(''));
    })
  }
  this.modalReferenceForRate.close();
  this.isEditRateItem = false;
  this.editRateIndex = null;
  this.editRateItem = '';

}

onCancelRateModal() {
  this.isEditRateItem = false;
  this.modalReferenceForRate.close();
}

removeName(name){
  return name.replace('rate_','');
}

viewCargo:boolean  = false;
viewVessel:boolean  = false;
hideText:boolean = false;
onConditionSelect(ev,index){
  if(['in','is'].includes(ev.target.value)){
    this.viewCargo = false;
    this.viewVessel = false;
    this.hideText = true;
    switch (this.ruleSteps.value[index].parameter.toLowerCase()) {
      case 'cargo':
        this.viewCargo = true;
        break;
      case 'vessel':
        this.viewVessel = true;
        break;

      default:
        this.hideText = false;
        break;
    }
  }
}



onInput(e: Event): void {
  const value = (e.target as HTMLInputElement).value;
  if (!value) {
    this.options = [];
  } else {
    this.options = this.allParametrs.filter((i) => i.name.includes(value));
  }
}

openDocPopup(content){
  this.modalReference = this.modalService.open(content, {
    ariaLabelledBy: 'modal-basic-title',
    backdrop: 'static',
    keyboard: false,
    centered: true,
    size: 'lg',
  });

}

onCancelDocModal(){
  this.modalReference.close();
}

closeResult: string;
removeRow(content1, index) {
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
        this.closeResult = `Closed with: ${result}`;
        this.inputForm.value.itemDocument.splice(index, 1);
        this.prepareDocuments();
        this.onSaveInputs('');
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );
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


returnVal(val){
  return val.replace(/ /g,'_')
}

changeColumn(){
  this.changeColumns =!this.changeColumns;
}


}
