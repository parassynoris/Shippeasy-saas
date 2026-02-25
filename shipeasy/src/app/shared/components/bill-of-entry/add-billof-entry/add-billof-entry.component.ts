import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ApiService } from 'src/app/admin/principal/api.service';
import { CommonService } from 'src/app/services/common/common.service';
import * as Constant from 'src/app/shared/common-constants';

@Component({
  selector: 'app-add-billof-entry',
  templateUrl: './add-billof-entry.component.html',
  styleUrls: ['./add-billof-entry.component.scss']
})
export class AddBillofEntryComponent implements OnInit {

  @Input() isType: any = 'add';
  urlParam: any;
  addEntryBillForm:FormGroup;
  disabledAttachment: boolean = true;
  canOpenBookingAccordion: boolean = true;
  isBookingPanelOpen: boolean = false;
  canOpenSICustomerAccordion: boolean = true;
  isSICustomerPanelOpen: boolean = false;
  canOpenVolumeAccordion: boolean = true;
  isVolumePanelOpen: boolean = false;
  canOpenDeclarationAccordion: boolean = true;
  isDeclarationPanelOpen: boolean = false;
  canOpenMasterBLDraftAccordion: boolean = true;
  isMasterBLDraftPanelOpen: boolean = false;
  canOpenMasterBLOriginalAccordion: boolean = true;
  canOpenMasterBLOriginalAccordion1: boolean = true;
  canOpenMasterBLOriginalAccordion2: boolean = true;
  canOpenMasterBLOriginalAccordion3: boolean = true;
  isMasterBLOriginalPanelOpen: boolean = false;
  isMasterBLOriginalPanelOpen1: boolean = false;
  isMasterBLOriginalPanelOpen2: boolean = false;
  isMasterBLOriginalPanelOpen3: boolean = false;
  callapseALL: boolean = false;
  submitted:boolean;
  entrybillId:string
  chaList:any =[]
  importerList:any =[]
  billingBranchList=[];
  billingBranchList1=[];
  addShippingBill=[];
  portData=[];
  constructor(private formBuilder: FormBuilder,private commonService :CommonService,private router: Router,private route: ActivatedRoute, public _api: ApiService,private datepipe: DatePipe, public notification: NzNotificationService,) {
    // this.isAddMode = !this.shippingbillId;
    this.route.params.subscribe(params =>
      this.urlParam = params
    );
   }
   batchDetail: any;
   portDetails:any
   id:any;
   entryBillData:any=[]
  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.getBatchById(this.id)
    this.entrybillId = this.route.snapshot.params['moduleId'];
   if(this.entrybillId) {this.getBillEntryData()}
    this.addEntryBillForm = this.formBuilder.group({
      jobNo:[''],
      entrybillNo:[''],
      jobDate:[''],
      fileNo:[''],
      portOfFilling:[''],
      adCode:[''],
      proveFinal:[''],
      transportMode:[''],
      section46:[''],
      beType:[''],
      greenChannel:[''],
      govtPrivate:[''],
      priorBe:[''],
      firstCheck:[''],
      chaDetails:[''],
      chaAddress:[''],
      importerAddress:[''],
      importerDetails:[''],
      pan:[''],
      addCode:[''],
      GSTIN:[''],
      brSlNo:[''],
      ucrNo:[''],
      ucrType:[''],
      paymentMethodCode:[''],


      igmNo:[''],
      igmDate:[''],
      gatewayDate:[''],
      gatewayIgm:[''],
      noOfContainer:[''],
      packages:[''],
      gatewayPort:[''],
      portOrigin:[''],
      portShipment:[''],
      countryOrigin:[''],
      countryConsignment:[''],
      mblMawb:[''],
      mblDate:[''],
      hblHawb:[''],
      hblDate:[''],
      noOfPackages:[''],
      grossWeight:[''],
      marksNo:[''],

      noOfInvoice:[''],
      invSiNo:[''],
      invNo:[''],
      invDate:[''],
      invValue:[''],
      invTerm:[''],
      freight:[''],
      insurance:[''],
      buyerSellerRated:[''],
      svbRefNo:[''],
      svbRefDate:[''],
      svbLoadAss:[''],
      customHouse:[''],
      svbLoadDty:[''],
      natureOfPayment:[''],
      miscCharge:[''],
      totalMsc:[''],
      hssRate:[''],
      discountRate:[''],
      hssAmount:[''],
      discountAmount:[''],
      loadingCharge:[''],
      exchangeRate:[''],
      supplierDetails:[''],
      address:[''],

      qty:[''],
      slNo:[''],
      unit:[''],
      ritc:[''],
      unitPrice:[''],
      assValue:[''],
      description:[''],
      rsp:[''],
      loadProv:[''],
      coo:[''],
      cth:[''],
      ceth :[''],
      endUse :[''],
      excNotn :[''],
      excDtyRt :[''],
      cusDtyRt :[''],
      cusNot :[''],
      cvdAmt :[''],
      bcdAmt :[''],

      iecNo:[''],
      branchSrNo:[''],
      importerName:[''],
      imoporterAdd:[''],
      precedingLevel:[''],
      product: this.formBuilder.array([this.addproduct()]),
      containerItems: this.formBuilder.array([this.addContainerRowForm()]),
      gstinItems: this.formBuilder.array([this.addContainerRowForm1()]),
      singleWindow: this.formBuilder.array([this.addContainerRowForm2()]),
      singleWindowStatement: this.formBuilder.array([this.addContainerRowForm3()]),

    })
    this.getPartyMasterDropDowns()
  }
  getBillEntryData() {

    let payload = this.commonService.filterList()
    payload.query = {
      "entrybillId": this.entrybillId
    }
    this.commonService.getSTList('entrybill', payload).subscribe((data) => {
      this.entryBillData = data.documents?.[0];
      this.patchValue(this.entryBillData)
      //PatchForm from here
    });
  }
  isEdit: boolean = false;
  printAll(data) {
    let reportpayload: any;
    let url: any;
      reportpayload = { "parameters": { "entrybillId": data } };
      url = 'checkListHome';

    this.commonService.pushreports(reportpayload, url).subscribe({
      next: (res: any) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        let temp = URL.createObjectURL(blob);
        const pdfWindow = window.open(temp);
        pdfWindow.print();
      }
    })

  }
  patchValue(payload: any) {
 
      this.addEntryBillForm.patchValue({
          jobNo: payload?.basicDetails?.jobNo,
          jobDate: payload?.basicDetails?.jobDate,
          fileNo: payload?.basicDetails?.fileNo,
          portOfFilling: payload?.basicDetails?.portOfFillingId,
          portOfFillingName: payload?.basicDetails?.portOfFillingName,
          proveFinal: payload?.basicDetails?.proveFinal,
          transportMode: payload?.basicDetails?.transportMode,
          section46: payload?.basicDetails?.section46,
          beType: payload?.basicDetails?.beType,
          greenChannel: payload?.basicDetails?.greenChannel,
          govtPrivate: payload?.basicDetails?.govtPrivate,
          priorBe: payload?.basicDetails?.priorBe,
          firstCheck: payload?.basicDetails?.firstCheck,
          chaDetails: payload?.basicDetails?.chaDetailsId,
          chaDetailsName: payload?.basicDetails?.chaDetailsName,
          chaAddress: payload?.basicDetails?.chaAddress,
          importerAddress: payload?.basicDetails?.importerAddress,
          importerDetails: payload?.basicDetails?.importerDetailsId,
          importerDetailsName: payload?.basicDetails?.importerDetailsName,
          pan: payload?.basicDetails?.pan,
          brSlNo: payload?.basicDetails?.brSlNo,
          GSTIN: payload?.basicDetails?.GSTIN,
          ucrNo: payload?.basicDetails?.ucrNo,
          ucrType: payload?.basicDetails?.ucrType,
          paymentMethodCode: payload?.basicDetails?.paymentMethodCode,

          igmNo: payload?.IgmDetails?.igmNo,
          igmDate: payload?.IgmDetails?.igmDate,
          gatewayIgm: payload?.IgmDetails?.gatewayIgm,
          gatewayDate: payload?.IgmDetails?.gatewayDate,
          noOfContainer: payload?.IgmDetails?.noOfContainer,
          packages: payload?.IgmDetails?.packages,
          gatewayPort: payload?.IgmDetails?.gatewayPortId,
          gatewayPortName: payload?.IgmDetails?.gatewayPortName,
          portOrigin: payload?.IgmDetails?.portOrigin,
          portShipment: payload?.IgmDetails?.portShipment,
          countryOrigin: payload?.IgmDetails?.countryOrigin,
          countryConsignment: payload?.IgmDetails?.countryConsignment,
          mblMawb: payload?.IgmDetails?.mblMawb,
          mblDate: payload?.IgmDetails?.mblDate,
          hblHawb: payload?.IgmDetails?.hblHawb,
          hblDate: payload?.IgmDetails?.hblDate,
          noOfPackages: payload?.IgmDetails?.noOfPackages,
          grossWeight: payload?.IgmDetails?.grossWeight,
          marksNo: payload?.IgmDetails?.marksNo,

          noOfInvoice: payload?.invoiceDetails?.noOfInvoice,
          invSiNo: payload?.invoiceDetails?.invSiNo,
          invNo: payload?.invoiceDetails?.invNo,
          invDate: payload?.invoiceDetails?.invDate,
          invValue: payload?.invoiceDetails?.invValue,
          invTerm: payload?.invoiceDetails?.invTerm,
          freight: payload?.invoiceDetails?.freight,
          insurance: payload?.invoiceDetails?.insurance,
          buyerSellerRated: payload?.invoiceDetails?.buyerSellerRated,
          svbRefNo: payload?.invoiceDetails?.svbRefNo,
          svbRefDate: payload?.invoiceDetails?.svbRefDate,
          svbLoadAss: payload?.invoiceDetails?.svbLoadAss,
          customHouse: payload?.invoiceDetails?.customHouse,
          svbLoadDty: payload?.invoiceDetails?.svbLoadDty,
          natureOfPayment: payload?.invoiceDetails?.natureOfPayment,
          miscCharge: payload?.invoiceDetails?.miscCharge,
          totalMsc: payload?.invoiceDetails?.totalMsc,
          hssRate: payload?.invoiceDetails?.hssRate,
          discountRate: payload?.invoiceDetails?.discountRate,
          hssAmount: payload?.invoiceDetails?.hssAmount,
          discountAmount: payload?.invoiceDetails?.discountAmount,
          loadingCharge: payload?.invoiceDetails?.loadingCharge,
          exchangeRate: payload?.invoiceDetails?.exchangeRate,
          supplierDetails: payload?.invoiceDetails?.supplierDetails,
          address: payload?.invoiceDetails?.address,

          qty: payload?.productDetails?.qty,
          slNo: payload?.productDetails?.slNo,
          unit: payload?.productDetails?.unit,
          ritc: payload?.productDetails?.ritc,
          unitPrice: payload?.productDetails?.unitPrice,
          assValue: payload?.productDetails?.assValue,
          description: payload?.productDetails?.description,
          rsp: payload?.productDetails?.rsp,
          coo: payload?.productDetails?.coo,
          cth: payload?.productDetails?.cth,
          ceth: payload?.productDetails?.ceth,
          excNotn: payload?.productDetails?.excNotn,
          excDtyRt: payload?.productDetails?.excDtyRt,
          cusDtyRt: payload?.productDetails?.cusDtyRt,
          cusNot: payload?.productDetails?.cusNot,
          cvdAmt: payload?.productDetails?.cvdAmt,


          iecNo: payload?.importDetails?.iecNo,
          branchSrNo: payload?.importDetails?.branchSrNo,
          importerName: payload?.importDetails?.importerName,
          imoporterAdd: payload?.importDetails?.imoporterAdd,
          precedingLevel: payload?.importDetails?.precedingLevel,

        containerItems: payload?.containerItems,
        gstinItems: payload?.gstinItems,
        singleWindow: payload?.singleWindow,
        singleWindowStatement: payload?.singleWindowStatement,
      });
      const product = this.addEntryBillForm.get('product') as FormArray;
      product.clear();
      (payload?.product ?? [])?.forEach((ee) => {
        const product = this.addEntryBillForm.get('product') as FormArray;
        const product_details = this.addproduct();
        product_details.patchValue(ee);
        product.push(product_details);
      });
    }
    
  
  addContainerRow() {
    const control = this.addEntryBillForm.get('containerItems') as FormArray;
    control.push(this.addContainerRowForm());
  }
  addContainerRowForm(data?): FormGroup {
    return this.formBuilder.group({
      igm: [data?.igm ? data?.igm : ''],
      container: [data?.container ? data?.container : ''],
      sealNo: [data?.sealNo ? data?.sealNo : ''],
      type: [data?.type ? data?.type : ''],
      size: [data?.size ? data?.size : ''],
      truckNo: [data?.truckNo ? data?.truckNo : ''],
    });
  }
  addNewproduct() {
    const control = this.addEntryBillForm.get('product') as FormArray;
    control.push(this.addproduct());
  }
  deleteproduct(index: number) {
    const control = this.addEntryBillForm.get('product') as FormArray;
    control.removeAt(index);
  }
  get product() {
    const control = this.addEntryBillForm.get('product') as FormArray;
    return control
  }
  addproduct(res?) {
    return this.formBuilder.group({
      qty: [res ? res.qty : ''],
      slNo: [res ? res.slNo : ''],
      unit: [res ? res.unit : ''],
      ritc: [res ? res.ritc : ''],
      unitPrice: [res ? res.unitPrice : ''],
      assValue: [res ? res.assValue : ''],
      description: [res ? res.description : ''],
      rsp: [res ? res.rsp : ''],
      loadProv: [res ? res.loadProv : ''],
      coo: [res ? res.coo : ''],
      cth: [res ? res.cth : ''],
      ceth: [res ? res.ceth : ''],
      endUse: [res ? res.endUse : ''],
      excNotn: [res ? res.excNotn : ''],
      excDtyRt: [res ? res.excDtyRt : ''],
      cusDtyRt: [res ? res.cusDtyRt : ''],
      cusNot: [res ? res.cusNot : ''],
      cvdAmt: [res ? res.cvdAmt : ''],
      bcdAmt: [res ? res.bcdAmt : ''],
    })
  }
  get getContainerControls() {
    const control = this.addEntryBillForm.get('containerItems') as FormArray;
    return control;
  }
  deleteRow(i){
    const control = this.addEntryBillForm.get('containerItems') as FormArray;
    control.removeAt(i);
  }
  addContainerRow1() {
    const control = this.addEntryBillForm.get('gstinItems') as FormArray;
    control.push(this.addContainerRowForm1());
  }
  addContainerRowForm1(data?): FormGroup {
    return this.formBuilder.group({
      state: [data?.state ? data?.state : ''],
      commercialType: [data?.container ? data?.commercialType : ''],
      regNo: [data?.regNo ? data?.regNo : ''],
      igstAss: [data?.igstAss ? data?.igstAss : ''],
      igstAmt: [data?.igstAmt ? data?.igstAmt : ''],
      gstCessAmt: [data?.gstCessAmt ? data?.gstCessAmt : ''],
    });
  }
  get getContainerControls1() {
    const control = this.addEntryBillForm.get('gstinItems') as FormArray;
    return control;
  }
  deleteRow1(i){
    const control = this.addEntryBillForm.get('gstinItems') as FormArray;
    control.removeAt(i);
  }
  addContainerRow2() {
    const control = this.addEntryBillForm.get('singleWindow') as FormArray;
    control.push(this.addContainerRowForm2());
  }
  addContainerRowForm2(data?): FormGroup {
    return this.formBuilder.group({
      invSiNo: [data?.itemSiNO ? data?.itemSiNO : ''],
      itemSiNO: [data?.itemSiNO ? data?.itemSiNO : ''],
      infoType: [data?.infoType ? data?.infoType : ''],
      infoCode: [data?.infoCode ? data?.infoCode : ''],
      infoText: [data?.infoText ? data?.infoText : ''],
      msr: [data?.msr ? data?.msr : ''],
      uqc: [data?.uqc ? data?.uqc : ''],
      regnDate: [data?.regnDate ? data?.regnDate : ''],
      validity: [data?.uqc ? data?.validity : ''],
    });
  }
  get getContainerControls2() {
    const control = this.addEntryBillForm.get('singleWindow') as FormArray;
    return control;
  }
  deleteRow2(i){
    const control = this.addEntryBillForm.get('singleWindow') as FormArray;
    control.removeAt(i);
  }
  addContainerRow3() {
    const control = this.addEntryBillForm.get('singleWindowStatement') as FormArray;
    control.push(this.addContainerRowForm3());
  }
  addContainerRowForm3(data?): FormGroup {
    return this.formBuilder.group({
      invSiNO: [data?.invSiNO ? data?.invSiNO : ''],
      itemSiNo: [data?.infoType ? data?.infoType : ''],
      stmtType: [data?.stmtType ? data?.stmtType : ''],
      stmtCode: [data?.stmtCode ? data?.stmtCode : ''],
      text: [data?.text ? data?.text : ''],
    });
  }
  get getContainerControls3() {
    const control = this.addEntryBillForm.get('singleWindowStatement') as FormArray;
    return control;
  }
  deleteRow3(i){
    const control = this.addEntryBillForm.get('singleWindowStatement') as FormArray;
    control.removeAt(i);
  }
  getBatchById(id) {


    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      batchId: id,
    }

    this._api
      .getSTList(Constant.BATCH_LIST, payload)
      ?.subscribe((res: any) => {

        this.batchDetail = res?.documents[0];
        if(this.batchDetail?.statusOfBatch == 'Job Cancelled' || this.batchDetail?.statusOfBatch =='Job Closed'){
          this.addEntryBillForm.disable();
        }

        this.addEntryBillForm.patchValue({
          jobNo: this.batchDetail?.batchNo || '',
          jobDate: this.datepipe.transform(this.batchDetail?.createdOn, "dd-MM-yyyy") || '',
          portOrigin: this.batchDetail?.enquiryDetails?.routeDetails?.loadPortName || '',
          portShipment: this.batchDetail?.enquiryDetails?.routeDetails?.destPortName || '',
        });
      
      if (this.batchDetail?.enquiryDetails?.looseCargoDetails) {
        const cargos = this.batchDetail?.enquiryDetails?.looseCargoDetails?.cargos;
        let totalUnits = 0;
        let grossWeight = 0;
 
        if (cargos && cargos.length > 0) {
          cargos.forEach((cargo) => {
            if (cargo.units) {
              totalUnits += cargo.units;
            }
            if (cargo?.pkgname) {
              if (cargo?.pkgname === 'Boxes/Crates') {
                grossWeight += cargo?.Weightbox || 0;
 
                this.addEntryBillForm.get('grossWeight').setValue(grossWeight);
              }
              if (cargo?.pkgname === 'Pallets') {
                grossWeight += cargo?.Weightselected;
                this.addEntryBillForm.get('grossWeight').setValue(grossWeight);
              }
              if (cargo?.pkgname === 'Pallets' && cargo?.Pallettype === 'Pallets (non specified size)') {
                grossWeight += cargo?.Weightps || 0;
                this.addEntryBillForm.get('grossWeight').setValue(grossWeight);
              }
            }
          });
 
          this.addEntryBillForm.get('packages').setValue(totalUnits);
        }
      }
      if (this.batchDetail?.enquiryDetails?.containersDetails) {
        const cargos = this.batchDetail?.enquiryDetails?.containersDetails;
        let totalnoOfContainer = 0;
        let totalGrossWeight = 0;
        if (cargos && cargos.length > 0) {
          cargos.forEach((containersDetails) => {
            if (containersDetails?.noOfContainer) {
              totalnoOfContainer += containersDetails?.noOfContainer;
            }
 
          });
          this.addEntryBillForm.get('noOfContainer').setValue(totalnoOfContainer);
        }
        if (cargos && cargos.length > 0) {
          cargos.forEach((containersDetails) => {
            if (containersDetails?.grossWeight) {
              totalGrossWeight += containersDetails?.grossWeight;
            }
 
          });
          this.addEntryBillForm.get('grossWeight').setValue(totalGrossWeight);
        }
      }
      this.getportList();
    });

  }
  getCountry(id){
  let payload = this.commonService.filterList()
  if (payload?.query) payload.query = {
    portId: id,
  }
  this._api
  .getSTList("country", payload)
  ?.subscribe((res: any) => {

    this.portDetails = res?.documents[0];

    this.addEntryBillForm.patchValue({
      countryOrigin: this.portDetails?.country?.countryName || '',
    });
  });

  }
  
  get f() { return this.addEntryBillForm.controls; }
 
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
      case 'masterBLOriginal1':
        if (this.canOpenMasterBLOriginalAccordion1) {
          this.isMasterBLOriginalPanelOpen1 = !this.isMasterBLOriginalPanelOpen1;
        }
        break;
      case 'masterBLOriginal2':
        if (this.canOpenMasterBLOriginalAccordion2) {
          this.isMasterBLOriginalPanelOpen2 = !this.isMasterBLOriginalPanelOpen2;
        }
        break;
      case 'masterBLOriginal3':
        if (this.canOpenMasterBLOriginalAccordion3) {
          this.isMasterBLOriginalPanelOpen3 = !this.isMasterBLOriginalPanelOpen3;
        }
        break;

      default:
        console.error('Unknown panel:', panel);
    }
  }
  getPartyMasterDropDowns() {
    let payload = this.commonService.filterList()
    if (payload) payload.query = {
      "status": true
    }
    this.commonService.getSTList("partymaster", payload)?.subscribe((res: any) => {
      res?.documents?.filter((x) => {
        if (x.customerType) {
          x.customerType.map((res: any) => {
            if (res?.item_text === 'Cha') { this.chaList.push(x) }
            else if (res?.item_text === 'Importer') { this.importerList.push(x) }
          })
        }
      });
      if (this.entrybillId && this.entryBillData?.basicDetails?.importerDetailsId) {
        this.setShipper1(this.entrybillId && this.entryBillData?.basicDetails?.importerDetailsId);
      }
      if (this.entrybillId && this.entryBillData?.basicDetails?.chaDetailsId) {
        this.setShipper(this.entrybillId && this.entryBillData?.basicDetails?.chaDetailsId);
      }
    });

  }
  getConsigneeList() {
    return (this.importerList ?? []).filter(record => record?.partymasterId != this.addEntryBillForm?.value?.value);
  }
  AddContainer(){}
  close(){
    this.router.navigate(['/batch/list/add', this.urlParam.id, this.urlParam.key]);
  }
  setShipper(e) {
    if (!e) { return false }
    let data = this.chaList.find((x) => x?.partymasterId === e)
    if (data) {
      this.billingBranchList = data?.branch
    }
}
  setShipper1(e) {
    if (!e) { return false }
    let data = this.importerList.find((x) => x?.partymasterId === e)
    if (data) {
      this.billingBranchList1 = data?.branch
    }
}
getportList() {
  let payload = this.commonService.filterList()
  if(payload?.query)payload.query = {
    status: true,
  }
  this.commonService.getSTList('port', payload)?.subscribe((res: any) => {
    this.portData = res.documents;
    if(this.batchDetail?.enquiryDetails?.routeDetails?.loadPortId){
      const countryName=this.portData?.find(rr=>rr?.portId===this.batchDetail?.enquiryDetails?.routeDetails?.loadPortId);
      const countryConsign=this.portData?.find(rr=>rr?.portId===this.batchDetail?.enquiryDetails?.routeDetails?.destPortId);
      this.addEntryBillForm.get('countryOrigin').setValue(countryName?.country?.countryName)
      this.addEntryBillForm.get('countryConsignment').setValue(countryConsign?.country?.countryName)
    }
  });
}

setTax() {
  const GSTIN = this.importerList?.find(dd => dd?.partymasterId === this.addEntryBillForm?.value?.importerDetails)?.branch?.find(dd => dd?.branch_name === this.addEntryBillForm?.value?.importerAddress)?.tax_number;
  const PAN = this.importerList?.find(dd => dd?.partymasterId === this.addEntryBillForm?.value?.importerDetails)?.branch?.find(dd => dd?.branch_name === this.addEntryBillForm?.value?.importerAddress)?.panNo;
  this.addEntryBillForm.get('GSTIN').setValue(GSTIN ?? '');
  this.addEntryBillForm.get('pan').setValue(PAN ?? '');
}
setTax1() {
  const GSTIN = this.chaList?.find(dd => dd?.partymasterId === this.addEntryBillForm?.value?.chaDetails)?.branch?.find(dd => dd?.branch_name === this.addEntryBillForm?.value?.chaAddress)?.tax_number;
  const PAN = this.chaList?.find(dd => dd?.partymasterId === this.addEntryBillForm?.value?.chaDetails)?.branch?.find(dd => dd?.branch_name === this.addEntryBillForm?.value?.chaAddress)?.panNo;
  this.addEntryBillForm.get('GSTIN').setValue(GSTIN ?? '');
  this.addEntryBillForm.get('pan').setValue(PAN ?? '');
}
entryBillId:['']
SaveEntryBill() {
  // Construct the payload
  let payload = {
    basicDetails: {
      jobNo: this.addEntryBillForm.value.jobNo,
      jobDate: this.addEntryBillForm.value.jobDate,
      fileNo: this.addEntryBillForm.value.fileNo,
      portOfFillingId: this.addEntryBillForm.value.portOfFilling,
      portOfFillingName: this.portData.find(x => x.partymasterId === this.addEntryBillForm.value.portOfFilling)?.name,
      proveFinal: this.addEntryBillForm.value.proveFinal,
      transportMode: this.addEntryBillForm.value.transportMode,
      section46: this.addEntryBillForm.value.section46,
      beType: this.addEntryBillForm.value.beType,
      greenChannel: this.addEntryBillForm.value.greenChannel,
      govtPrivate: this.addEntryBillForm.value.govtPrivate,
      priorBe: this.addEntryBillForm.value.priorBe,
      firstCheck: this.addEntryBillForm.value.firstCheck,
      chaDetailsId: this.addEntryBillForm.value.chaDetails,
      chaDetailsName: this.chaList.find(x => x.partymasterId === this.addEntryBillForm.value.chaDetails)?.name,
      chaAddress: this.addEntryBillForm.value.chaAddress,
      importerAddress: this.addEntryBillForm.value.importerAddress,
      importerDetailsId: this.addEntryBillForm.value.importerDetails,
      importerDetailsName: this.importerList.find(x => x.partymasterId === this.addEntryBillForm.value.importerDetails)?.name,
      pan: this.addEntryBillForm.value.pan,
      addCode: this.addEntryBillForm.value.addCode,
      brSlNo: this.addEntryBillForm.value.brSlNo,
      GSTIN: this.addEntryBillForm.value.GSTIN,
      ucrNo: this.addEntryBillForm.value.ucrNo,
      ucrType: this.addEntryBillForm.value.ucrType,
      paymentMethodCode: this.addEntryBillForm.value.paymentMethodCode,
    },
    IgmDetails: {
      igmNo: this.addEntryBillForm.value.igmNo,
      igmDate: this.addEntryBillForm.value.igmDate,
      gatewayIgm: this.addEntryBillForm.value.gatewayIgm,
      gatewayDate: this.addEntryBillForm.value.gatewayDate,
      noOfContainer: this.addEntryBillForm.value.noOfContainer,
      packages: this.addEntryBillForm.value.packages,
      gatewayPortId: this.addEntryBillForm.value.gatewayPort,
      gatewayPortName: this.portData.find(x => x.partymasterId === this.addEntryBillForm.value.gatewayPort)?.name,
      portOrigin: this.addEntryBillForm.value.portOrigin,
      portShipment: this.addEntryBillForm.value.portShipment,
      countryOrigin: this.addEntryBillForm.value.countryOrigin,
      countryConsignment: this.addEntryBillForm.value.countryConsignment,
      mblMawb: this.addEntryBillForm.value.mblMawb,
      mblDate: this.addEntryBillForm.value.mblDate,
      hblHawb: this.addEntryBillForm.value.hblHawb,
      hblDate: this.addEntryBillForm.value.hblDate,
      noOfPackages: this.addEntryBillForm.value.noOfPackages,
      grossWeight: this.addEntryBillForm.value.grossWeight,
      marksNo: this.addEntryBillForm.value.marksNo,
    },
    invoiceDetails: {
      noOfInvoice: this.addEntryBillForm.value.noOfInvoice,
      invSiNo: this.addEntryBillForm.value.invSiNo,
      invNo: this.addEntryBillForm.value.invNo,
      invDate: this.addEntryBillForm.value.invDate,
      invValue: this.addEntryBillForm.value.invValue,
      invTerm: this.addEntryBillForm.value.invTerm,
      freight: this.addEntryBillForm.value.freight,
      insurance: this.addEntryBillForm.value.insurance,
      buyerSellerRated: this.addEntryBillForm.value.buyerSellerRated,
      svbRefNo: this.addEntryBillForm.value.svbRefNo,
      svbRefDate: this.addEntryBillForm.value.svbRefDate,
      svbLoadAss: this.addEntryBillForm.value.svbLoadAss,
      customHouse: this.addEntryBillForm.value.customHouse,
      svbLoadDty: this.addEntryBillForm.value.svbLoadDty,
      natureOfPayment: this.addEntryBillForm.value.natureOfPayment,
      miscCharge: this.addEntryBillForm.value.miscCharge,
      totalMsc: this.addEntryBillForm.value.totalMsc,
      hssRate: this.addEntryBillForm.value.hssRate,
      discountRate: this.addEntryBillForm.value.discountRate,
      hssAmount: this.addEntryBillForm.value.hssAmount,
      discountAmount: this.addEntryBillForm.value.discountAmount,
      loadingCharge: this.addEntryBillForm.value.loadingCharge,
      exchangeRate: this.addEntryBillForm.value.exchangeRate,
      supplierDetails: this.addEntryBillForm.value.supplierDetails,
      address: this.addEntryBillForm.value.address,
    },
    productDetails: {
      qty: this.addEntryBillForm.value.qty,
      slNo: this.addEntryBillForm.value.slNo,
      unit: this.addEntryBillForm.value.unit,
      ritc: this.addEntryBillForm.value.ritc,
      unitPrice: this.addEntryBillForm.value.unitPrice,
      assValue: this.addEntryBillForm.value.assValue,
      description: this.addEntryBillForm.value.description,
      rsp: this.addEntryBillForm.value.rsp,
      coo: this.addEntryBillForm.value.coo,
      cth: this.addEntryBillForm.value.cth,
      ceth: this.addEntryBillForm.value.ceth,
      excNotn: this.addEntryBillForm.value.excNotn,
      excDtyRt: this.addEntryBillForm.value.excDtyRt,
      cusDtyRt: this.addEntryBillForm.value.cusDtyRt,
      cusNot: this.addEntryBillForm.value.cusNot,
      cvdAmt: this.addEntryBillForm.value.cvdAmt,
    },
    importDetails: {
      iecNo: this.addEntryBillForm.value.iecNo,
      branchSrNo: this.addEntryBillForm.value.branchSrNo,
      importerName: this.addEntryBillForm.value.importerName,
      imoporterAdd: this.addEntryBillForm.value.imoporterAdd,
      precedingLevel: this.addEntryBillForm.value.precedingLevel,
    },
    batchId: this.id,
    containerItems: this.addEntryBillForm.value.containerItems,
    gstinItems: this.addEntryBillForm.value.gstinItems,
    singleWindow: this.addEntryBillForm.value.singleWindow,
    singleWindowStatement: this.addEntryBillForm.value.singleWindowStatement,
    product:this.addEntryBillForm.value.product,
  };

  // Determine if updating or creating a new entry
  if (this.entrybillId) {
    this.commonService.UpdateToST("entrybill/" + this.entrybillId, payload)?.subscribe(
      (res: any) => {
        if (res) {
          this.notification.create('success', 'Updated Successfully', '');
          setTimeout(() => {
            this.close();
            // Optionally fetch updated data or take other actions
          }, 1000);
        }
      },
      (error) => {
        this.notification.create('error', error?.error?.error, '');
      }
    );
  } else {
    this.commonService.addToST("entrybill", payload)?.subscribe(
      (res: any) => {
        if (res) {
          this.notification.create('success', 'Added Successfully', '');
          this.close();
          setTimeout(() => {
            // Optionally fetch updated data or take other actions
          }, 1000);
        }
      },
      (error) => {
        this.notification.create('error', error?.error?.error, '');
      }
    );
  }
}



}


