import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { ApiSharedService } from '../../api-service/api-shared.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Location } from '@angular/common';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { environment } from 'src/environments/environment';
import { CommonService } from 'src/app/services/common/common.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { CognitoService } from 'src/app/services/cognito.service';

@Component({
  selector: 'app-addchanges',
  templateUrl: './addchanges.component.html',
  styleUrls: ['./addchanges.component.scss'],
})
export class AddchangesComponent implements OnInit , OnDestroy{
  @Output() CloseNew = new EventEmitter<string>();
  @Input() isTypeForm: any = 'add';
  @Input() isshowDetails: boolean = false;
  @Input() public dataPort: any;
  @Input() public key: any;
  @Input() public batchID: any;
  @Input() public OATAB: any;
  @Input() public editData: any;
  @Input() public isParent: any;
  @Input() public editBatchData: any;
  @Input() public batchMode: any;
  @Input() public batchItem: any;
  vendorEdit:boolean=false
  @Output() getList = new EventEmitter<any>();
  newenquiryForm: FormGroup;
  submitted = false;
  isAddMode: boolean = true;
  currencyList: any;
  costHeadList: any;
  costItemList: any;
  chargeTermList: any;
  containerList: any = [];
  lisyOfContainer = [];
  filterBody = this.apiService.body;
  public ngUnsubscribe = new Subject<void>();
  agentAdviceDetails: any;
  batchEnquiryID: any;
  currentUrl: string;
  enquiry_ID: any;
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
  currencyData: any;
  batchDetail: any;
  stoltCharge: boolean = false;
  enquiryitemId: any = '';
  isPath: any = 'portcall-enquiry';
  isExport: boolean = false;
  portList: any = [];
  partyMasterList: any = [];
  tenantId: any;
 
  constructor(
    private sortPipe: OrderByPipe,
    public modalService: NgbModal,
    public apiService: ApiSharedService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    public notification: NzNotificationService,
    private router: Router,
    private location: Location,
    public commonService: CommonService,
    private commonfunction: CommonFunctions,private cognito : CognitoService,
  ) {
    this.isExport = localStorage.getItem('isExport') === 'false' ? false : true
    this.getPartyMaster();
    this.getCurrencyList();
    this.formBuild();
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();
    router.events?.subscribe((val) => {
      if (location.path() !== '') {
        let stringToSplit = location.path();
        let x = stringToSplit.split('/');
        this.isPath = x[1];
      }
    });
    let stringToSplit = location.path();
    let x = stringToSplit.split('/');
    this.isPath = x[1];
  
    if (
      this.isPath === 'enquiry' ||
      this.isPath === 'batch' ||
      this.isPath === 'finance' ||
      this.isPath === 'agent-advice'
    ) {
      this.stoltCharge = true;
    }
  }
  sort(array, key) {
    return this.sortPipe.transform(array, key);
  }
  get f() {
    return this.newenquiryForm.controls;
  }

  ngOnInit(): void {
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.tenantId = resp.tenantId
      }
    }) 
    if (this.batchMode === 'edit') {
      this.isAddMode = false;
    }
    this.getPortDropDowns()
    if (this.stoltCharge) {
      this.getBatchList();
      this.getContainerList();
    }
    if (this.key === 'edit') this.isAddMode = false;
    this.costHead();
    this.costItem();
    this.getChargeTerm();
  }

  getContainerList() {

    let payload = this.commonService.filterList()
    payload.query = {
      batchId: this.batchID,
    }

    this.commonService
      .getSTList('container', payload)
      ?.subscribe((data: any) => {
        let dataContainer = [];
        data.documents.forEach((element) => {
          if (element?.containerNumber) {
            dataContainer.push(element?.containerNumber);
          }
        });
        this.containerList = dataContainer;
      });
  }
  getBatchList() {
  
    let payload = this.commonService.filterList()
    payload.query = {
      batchId: this.batchID,
    }
    this.commonService
      .getSTList('batch', payload)
      ?.subscribe((result) => {
        this.batchDetail = result?.documents[0];
        this.getAgentAdviceById(result?.documents[0]);
      });
  }

  getAgentAdviceById(res) {
    this.enquiry_ID = res?.enquiryId;

    let payload = this.commonService.filterList()
    payload.query = {
      enquiryId: res?.enquiryId,
    }
    this.commonService
      .getSTList('enquiry', payload)
      ?.subscribe((res: any) => {
        this.agentAdviceDetails = res?.documents[0];
      });
  }
  documents
  editBatchForm(data) {
    this.documents = []
    let profileData = data;
    this.documents.push({
      documentUrl : profileData.documentUrl,
      documentName:profileData.document
    } )
    let tax = profileData?.tax;
    let currencyValue = this.currencyList?.filter(
      (x) => x?.currencyShortName === profileData?.currency
    )[0];

    this.batchMode === 'edit'
      ? (this.enquiryitemId = profileData?.enquiryitemId)
      : '';

    this.lisyOfContainer = profileData?.containerNumber;
    this.newenquiryForm.patchValue({
      chargeGroup: profileData?.costHeadId || '',
      chargeName: profileData?.costItemId || '',
      chargeTerm: profileData?.chargeTerm || '',
      currency: currencyValue?.currencyId || '',
      exchangeRate: profileData?.exchangeRate || '',
      quantity: profileData?.quantity || '0',
      rate: profileData?.rate || '',
      amount: profileData?.amount || '0',
      gstPercentage: tax ? tax[0]?.taxRate : '',
      gst: tax ? tax[0]?.taxAmount : '' ,
      stcAmount: profileData?.stcAmount || '',
      totalAmount: profileData?.totalAmount || '',
      remarks: profileData?.remarks || '',
      provision: profileData?.provision || '',
      vendorName : profileData?.vendorId || '',
      document:profileData.documentUrl || '',
      workOrderNo:profileData.workOrderNo || '',
      depotCode:profileData.depotCode || '',
      ruleNo:profileData.ruleNo || '',
      modified:profileData.modified || '',
      jmbAmount:profileData?.jmbAmount || ''
    });
  }
  editForm(profileData) {
    this.documents = []
    this.documents.push(profileData?.costItems[0]?.document )
    let tax = profileData?.costItems[0]?.tax;
    let currencyValue = this.currencyList?.filter(
      (x) =>
        x?.currencyShortName ==
        profileData?.costItems[0]?.agent?.currency
    )[0]?.currencyId;
    let totalValue =
      profileData?.costItems[0]?.quantity *
      profileData?.costItems[0]?.agent?.unitPrice;
    this.newenquiryForm.patchValue({
      chargeGroup: profileData?.costItemHeadId || '',
      chargeName: profileData?.costItems[0]?.costItemId || '',
      chargeTerm: profileData?.costItems[0]?.chargeTerm || '',
      currency: currencyValue || '',
      exchangeRate: profileData?.costItems[0]?.agent?.baseROE || '',
      containerNo: profileData?.containerNumber || '',
      quantity: profileData?.costItems[0]?.quantity || '0',
      rate: profileData?.costItems[0]?.agent?.unitPrice || '',
      amount: profileData?.costItems[0]?.amount || '',
      gstPercentage: tax ? tax[0]?.taxRate : '' ,
      gst: tax ? tax[0]?.taxAmount : '',

      totalAmount: profileData?.costItems[0]?.totalAmount || '',
      remarks: profileData?.costItems[0]?.remarks || '',
      provision: profileData?.costItems[0]?.provision || '',
      document: profileData?.costItems[0]?.document || '',
      load_port: profileData?.costItems[0]?.portId || '',
    });
  }
  formBuild() {
    this.newenquiryForm = this.formBuilder.group({
      chargeGroup: [''],
      chargeName: ['', [Validators.required]],
      chargeTerm: ['', [Validators.required]],
      currency: ['', [Validators.required]],
      exchangeRate: [''],
      containerNo: [''],
      quantity: ['0'],
      rate: [''],
      amount: [''],
      gstPercentage: ['', [Validators.required]],
      gst: [''],
      totalAmount: [''],
      payableAt: [''],
      stcAmount: [''],
      jmbAmount: [''],
      remarks: [''],
      provision: [''],
      load_port: [''],
      document: [''],
      vendorName: [''],
      workOrderNo:[''],
      depotCode:[''],
      ruleNo:[''],
      modified:['']
    });
    
  }
  checkValidation(){
    if(this.key === 'Freight'){
      this.newenquiryForm.get('exchangeRate').clearValidators()
      this.newenquiryForm.get('rate').clearValidators()

      this.newenquiryForm.get('exchangeRate').updateValueAndValidity()
      this.newenquiryForm.get('rate').updateValueAndValidity()
    }
    else{
      
      this.newenquiryForm.get('exchangeRate').setValidators(Validators.required)
      this.newenquiryForm.get('rate').setValidators(Validators.required)

      this.newenquiryForm.get('exchangeRate').updateValueAndValidity()
      this.newenquiryForm.get('rate').updateValueAndValidity()
    }
  }
  getPartyMaster() {
  
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "customerType.item_text": 'Vendor',
      status: true
    }
    this.commonService
      .getSTList('partymaster', payload)
      ?.subscribe((data) => {
        this.partyMasterList = data.documents;

      });
  }
  filechange(event: any, fileupload) {
    this.newenquiryForm.get(fileupload).setValue(event.target.files[0]);
  }

  onSave() {
    this.submitted = true;
    if(!this.vendorEdit){
      if(this.key === 'Freight'){
        if (this.newenquiryForm.invalid) {
          this.notification.create('error', 'Form is invalid', '');
          return;
        }
      }
      else{
        if (this.newenquiryForm.invalid || this.lisyOfContainer.length === 0) {
          this.notification.create('error', 'Form is invalid', '');
          return;
        }
      }
    
    }
   

    var newArray = [];
    
    // if (this.batchMode === 'edit') {
    //   newArray = this.batchItem ? this.batchItem : [];
    //   newArray = newArray.filter((item) => item !== this.editBatchData);
    // }
    let daType = 'pda';
    if (this.isParent === 'job') {
      daType = 'ipda';
    }
    let vendorData = this.costItemList?.filter((x) => x?.costitemId ==
      this.newenquiryForm?.controls?.chargeName?.value)[0]?.chargeApplicable;

    let vendorApplicable = false
    vendorData.forEach(element => {
      if (element === 'Vendor') { vendorApplicable = true }
    });
    if (this.stoltCharge) {

      if (this.newenquiryForm.value.document) {
        const formData = new FormData();
        formData.append('file',this.newenquiryForm.value.document, `${this.newenquiryForm.value.document.name}`);
        formData.append('name', `$${this.newenquiryForm.value.document.name}`);
        this.commonService.uploadDocuments("document",formData).subscribe();
      } else {
        this.newenquiryForm.get('document').setValue('')
      }


      newArray.push({
        
        tenantId: this.tenantId,
        enquiryitemId: this.batchMode === 'edit' ? this.enquiryitemId : null,
        batchId: this.batchID,
        enquiryId: this.enquiry_ID,
        isEnquiryCharge : this.editBatchData?.isEnquiryCharge || false,
        collectPort :this.batchDetail?.enquiryData?.loadPortName || '',
        containerType :this.batchDetail?.enquiryData?.container_type || '',
        vesselName: this.batchDetail?.routeDetails?.finalVesselName?.toString(),
        voyageName: this.batchDetail?.routeDetails?.finalVoyageName?.toString(),
        moveNumber: this.batchDetail?.moveNo?.toString(),
        enquiryNumber: this.isExport? this.batchDetail?.enquiryNo: this.batchDetail?.uniqueRefNo,
        enqDate: this.agentAdviceDetails?.basicDetails?.enquiryDate,
        stcQuotationNo: this.batchDetail?.stcQuotationNo?.toString(),
        enqType: 'Export',
        costItemId: this.newenquiryForm?.controls?.chargeName?.value,
        chargeType: this.costItemList?.filter(
          (x) =>
            x?.costitemId ==
            this.newenquiryForm?.controls?.chargeName?.value
        )[0]?.chargeType,
        hsnCode : this.costItemList?.filter(
          (x) =>
            x?.costitemId ==
            this.newenquiryForm?.controls?.chargeName?.value
        )[0]?.hsnCode?.toString() || '',
        accountBaseCode: this.costItemList?.filter(
          (x) =>
            x?.costitemId ==
            this.newenquiryForm?.controls?.chargeName?.value
        )[0]?.accountCode.toString() || '',
        costitemGroup: this.costItemList?.filter(
          (x) =>
            x?.costitemId ==
            this.newenquiryForm?.controls?.chargeName?.value
        )[0]?.costitemGroup,
        costItemName: this.costItemList?.filter(
          (x) =>
            x?.costitemId ==
            this.newenquiryForm?.controls?.chargeName?.value
        )[0]?.costitemName,
        costHeadId: this.newenquiryForm?.controls?.chargeGroup?.value || '',
        costHeadName: this.costHeadList?.filter(
          (x) =>
            x?.costheadId ==
            this.newenquiryForm?.controls?.chargeGroup?.value
        )[0]?.costheadName || '',
        currency: this.currencyList?.filter(
          (x) =>
            x?.currencyId ==
            this.newenquiryForm?.controls?.currency?.value
        )[0]?.currencyShortName,
        currencyId:this.newenquiryForm?.controls?.currency?.value,
        exchangeRate: this.currencyList?.filter(x => x?.currencyId ==
          this.newenquiryForm?.controls?.currency?.value)[0]?.currencyPair || 0,
        amount: this.newenquiryForm?.controls?.amount?.value.toString(),
        baseAmount: '',
        tenantMargin: '',
        tax: [
          {
            taxAmount: Math.round(Number(this.newenquiryForm?.controls?.gst?.value)),
            taxRate: Number(this.newenquiryForm?.controls?.gstPercentage?.value),
          },
        ],
        quantity: this.newenquiryForm?.controls?.quantity?.value || '1',
        rate:this.key !== 'Freight'? this.newenquiryForm?.controls?.rate?.value || 0 : Math.round(this.newenquiryForm?.controls?.stcAmount?.value) || 0,
        stcAmount: Math.round(this.newenquiryForm?.controls?.stcAmount?.value),
        jmbAmount: Math.round(this.newenquiryForm?.controls?.jmbAmount?.value),
        payableAt: this.newenquiryForm?.controls?.payableAt?.value,
        gst: Number(this.newenquiryForm?.controls?.gstPercentage?.value),
        totalAmount: Math.round(this.newenquiryForm?.controls?.totalAmount?.value),
        chargeTerm: this.newenquiryForm?.controls?.chargeTerm?.value,
        remarks: this.newenquiryForm?.controls?.remarks?.value,
        provision: this.newenquiryForm?.controls?.provision?.value,
        containerNumber: this.lisyOfContainer || [],
        isFreight: this.key === 'Freight' ? true : false,
        vendorApplicable: vendorApplicable,

        vendorName: this.partyMasterList?.filter(x => x?.partymasterId ==
          this.newenquiryForm?.controls?.vendorName?.value)[0]?.name,
        vendorId: this.newenquiryForm?.controls?.vendorName?.value,

        portId: this.newenquiryForm?.controls?.load_port?.value,
        portName: this.portList?.filter(x => x?.portId ==
          this.newenquiryForm?.controls?.load_port?.value)[0]?.portDetails?.portName,

        document: this.newenquiryForm.value?.document?.name ? this.newenquiryForm.value?.document.name : '',
        documentUrl: this.newenquiryForm.value?.document?.name ? `https://s3-${environment.AWS_REGION}.amazonaws.com/${environment.bucketName}/document/${this.newenquiryForm.value?.document.name}` : '',
        workOrderNo:this.newenquiryForm.value?.workOrderNo,
        depotCode:this.newenquiryForm.value?.depotCode,
        ruleNo:this.newenquiryForm.value?.ruleNo,
        modified:this.newenquiryForm.value?.modified,
      });
    }
    if (this.key === 'edit') {
      
      this.modalService.dismissAll();
      this.notification.create('success', 'Updated Successfully', '');
      this.getList.emit(newArray);
    } else {
      this.modalService.dismissAll();
      this.notification.create('success', 'Saved Successfully', '');
      this.getList.emit(newArray);
    }

  }
  getPortDropDowns() {

    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true
    }
    this.commonService.getSTList("port", payload)?.subscribe((res: any) => {
      this.portList = res?.documents
    });
  }
  onClose(evt) {
    this.CloseNew.emit(evt);
    this.modalService.dismissAll();
  }
  changeJMB() {
    this.newenquiryForm.controls.jmbAmount.setValue(this.newenquiryForm.controls.stcAmount.value)
  }
  freightChargeTermList:any=[]
  getChargeTerm() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "typeCategory": {
        "$in": [
          'chargeTerm','freightChargeTerm'
        ]
      },
      "status": true
    }
    this.commonService
      .getSTList('systemtype', payload)
      ?.subscribe((res: any) => {
        this.chargeTermList = res.documents.filter(x=> x.typeCategory === 'chargeTerm');
        this.freightChargeTermList = res.documents.filter(x=> x.typeCategory === 'freightChargeTerm');
        if(this.key !== 'Freight'){
          if (this.batchMode !== 'edit') {
            let seletcedTerm = this.chargeTermList.filter((x) => x?.typeName.toLowerCase() === 'prepaid exclude')[0]?.typeName
            this.newenquiryForm.controls.chargeTerm.setValue(seletcedTerm)
          }
        }
       
      });
  }
  getCurrencyList() {
 
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true
    }

    this.commonService
      .getSTList('currency', payload)
      ?.subscribe((data) => {
        this.currencyList = data.documents;
        if (this.key === 'edit') {
          this.editForm(this.editBatchData);
        }
        if (this.stoltCharge) {
          if (this.batchMode === 'edit') {
            this.editBatchForm(this.editBatchData);
          }
        }
        if (this.batchMode !== 'edit') {
          let defaultCurrency = this.currencyList?.filter((x) => x?.currencyShortName?.toLowerCase() === 'inr')[0]
          this.newenquiryForm.controls.currency.setValue(defaultCurrency?.currencyId)
          this.newenquiryForm.controls.exchangeRate.setValue(defaultCurrency?.currencyPair)
        }
      });
  }
  costHead() {

    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true
    }

    this.commonService
      .getSTList('costhead', payload)
      ?.subscribe((data) => {
        this.costHeadList = data.documents;
      });
  }
  defaultCharge:any=[]
  costItem() {
  
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true,
    }

    this.commonService
      .getSTList('costitem', payload)
      ?.subscribe((data) => {
        this.costItemList = data.documents;

        if(this.isExport){
          this.defaultCharge = data?.documents.filter((x) => x?.costitemName?.toLowerCase() === 'stc export freight')
        }
        else{
        this.defaultCharge = data?.documents.filter((x) => x?.costitemName?.toLowerCase() === 'stc import freight')
        this.checkValidation()
        }
      });
  }

  calcuTotal() {
    this.newenquiryForm.controls.amount.setValue(
      (
        Number(this.newenquiryForm?.controls?.exchangeRate?.value || 0) *
        Number(this.newenquiryForm?.controls?.quantity?.value || 1) *
        Number(this.newenquiryForm?.controls?.rate?.value || 0)
      ).toFixed(2)
    );

    this.calcuGST();
  }
  calcuGST() {
    

    if(this.key === 'Freight'){
      this.newenquiryForm.controls.gst.setValue(
        ((Number(this.newenquiryForm?.controls?.stcAmount?.value) * Number(this.newenquiryForm?.controls?.gstPercentage?.value)) / 100).toFixed(2)
      );
      this.newenquiryForm.controls.totalAmount.setValue(
        (Number(this.newenquiryForm?.controls?.stcAmount?.value) + Number(this.newenquiryForm?.controls?.gst?.value)).toFixed(2)
      );
    }
    else{
      this.newenquiryForm.controls.gst.setValue(
        (
          (this.newenquiryForm?.controls?.amount?.value *
            this.newenquiryForm?.controls?.gstPercentage?.value) /
          100
        ).toFixed(2)
      );
      this.newenquiryForm.controls.totalAmount.setValue(
        (
          Number(this.newenquiryForm?.controls?.amount?.value) +
          Number(this.newenquiryForm?.controls?.gst?.value)
        ).toFixed(2)
      );
    }
  }
  setCustExchange() {
    this.newenquiryForm.controls.exchangeRate.setValue(
      this.currencyList?.filter(
        (x) =>
          x?.currencyId === this.newenquiryForm.controls.currency.value
      )[0]?.currencyPair
    );
  }
  setGST(e){
    if(this.key !== 'Freight'){
      let rate = this.costItemList?.filter((x) => x?.costitemId === e)[0]
      this.newenquiryForm.controls.gstPercentage.setValue(Number(rate?.taxRate))
    }
    else{
      this.newenquiryForm.controls.gstPercentage.setValue(5)
    }
   
  }
  setChargeQty(e?) {
    let data = this.costItemList?.filter(
      (x) =>
        x.costitemId ==
        this.newenquiryForm?.controls?.chargeName?.value
    )[0]?.chargeType
    if (data?.toLowerCase() === "container charge") {
      this.newenquiryForm.get('quantity').setValue(this.lisyOfContainer.length);
    } else {
      this.newenquiryForm.get('quantity').setValue(1);
    }
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
