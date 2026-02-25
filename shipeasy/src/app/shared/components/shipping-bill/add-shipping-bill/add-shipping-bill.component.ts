import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
// import { log } from 'console';
import { format } from 'date-fns';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from 'src/app/services/common/common.service';

@Component({
  selector: 'app-add-shipping-bill',
  templateUrl: './add-shipping-bill.component.html',
  styleUrls: ['./add-shipping-bill.component.scss']
})
export class AddShippingBillComponent implements OnInit {
  @Input() isType: any = 'add';
  addShippingBill: FormGroup;
  disabledAttachment: boolean = true;
  canOpenBookingAccordion: boolean = true;
  isBookingPanelOpen: boolean = true;
  canOpenSIproductAccordion: boolean = true;
  isSIproductPanelOpen: boolean = false;
  canOpenVolumeAccordion: boolean = true;
  isVolumePanelOpen: boolean = false;
  canOpenDeclarationAccordion: boolean = true;
  isDeclarationPanelOpen: boolean = false;
  canOpenMasterBLDraftAccordion: boolean = true;
  isMasterBLDraftPanelOpen: boolean = false;
  canOpenMasterBLOriginalAccordion: boolean = true;
  isMasterBLOriginalPanelOpen: boolean = false;
  callapseALL: boolean = false;
  submitted: boolean;
  shipperList: any = []
  consigneeList: any = []
  billingBranchList: any = []
  stateList: any = []
  billingBranchLists: any = []
  batchData: any = [];
  taxList: any = [];
  locationList: any = []
  id: any;
  shipper_address: ['']
  shipper: ['']
  countryList: any = []
  containerTypeList: any = []
  invoiceData: any = []
  incotermList: any = []
  currencyList: any = [];
  documentTypeList: any = []
  docForm: FormGroup;
  extension: any;
  docData: any = [];
  doc: File;
  D = new Date();
  currentDate: any =
    this.D.getDate() + '/' + this.D.getMonth() + '/' + this.D.getFullYear();
  base64Output: any;
  fileTypeNotMatched: boolean;
  @Input() documentData: any;
  @Input() type: any
  documentTableData: any = [];
  @ViewChild(MatDrawer) drawer: MatDrawer | any;
  dataSource = new MatTableDataSource();
  shippingbillId: ''
  displayedColumns = [
    '#',
    'invoiceNo',
    'invoice_date',
    'invoiceAmount',

  ];
  isAddMode
  urlParam: any;
  shippingbillData: any
  constructor(private formBuilder: FormBuilder, private commonService: CommonService, private router: Router, private route: ActivatedRoute, private notification: NzNotificationService) {
    this.shippingbillId = this.route.snapshot.params['moduleId'];
    this.isAddMode = !this.shippingbillId;
    this.route.params.subscribe(params =>
      this.urlParam = params
    );
  }
  ngOnInit(): void {
    this.docForm = this.formBuilder.group({
      documentName: ['', Validators.required],
      documentType: ['', Validators.required],
      Doc: ['', Validators.required],
      documentURL: ['']
    });
    this.addShippingBill = this.formBuilder.group({
      CHA: [''],
      stn: [''],
      Stn:[''],
      shipper: [''],
      consignee: [''],
      address: [''],
      Caddress: [''],
      ClassType:[''],
      adCode: [''],
      GSTIN: [''],
      state: [''],
      classType: [''],
      NFEI: [''],
      partyRef: [''],
      partyRefDate: [''],
      forexAccNo: [''],
      jobNo: [''],
      jobDate: [''],
      SBNo: [''],
      SBDate: [''],
      rbiDate: [''],
      RBINo: [''],
      invoice: [''],
      fOBValue: [''],
      PMVValue: [''],
      DBKAmt: [''],
      DBKAccNo: [''],
      Taxable: [''],
      IGSTAmt: [''],
      invoiceNo: [''],
      registrationNo: [''],
      AEORole: [''],
      destination: [''],
      country: [''],
      grossWeight: [''],
      packages: [''],
      hblDate: [''],
      mblDate: [''],
      rotationDate: [''],
      noOfContainer: [''],
      masterBLNo: [''],
      houseBLNo: [''],
      netWeight: [''],
      rotationNo: [''],
      marksNos: [''],
      sealType: [''],
      factoryStuffed: [''],
      EOUBranchSno: [''],
      factoryAddress: [''],
      cargo: [''],
      EOUIEC: [''],
      AEOCode: [''],
      incoTerm: [''],
      PONo: [''],
      invFob: [''],
      poDate: [''],
      buyerDetails: [''],
      contractNo: [''],
      Payment: [''],
      unitPrice: [''],
      invoiceAmount:[''],
      invoic_date:[''],
      invoicesNo:[''],
      slNumber:[''],
      shipper_address:[''],
      consignee_address:[''],
      product: this.formBuilder.array([this.addproduct()]),
      invoiceCharges: this.formBuilder.array([]),
      supportingDocuments: this.formBuilder.array([]),
      containerItems: this.formBuilder.array(this.shippingbillId ? [] : [this.addContainerRowForm()])
    })
    this.getPartyMasterDropDowns()
    this.onLocationSearch()
    this.getCountryList()
    this.getSystemTypeDropDowns()
    // this.getInvoiceList()
    this.getCurrencyDropDowns();
    this.getStateList();
    if (this.shippingbillId) {
      this.getShippingdata()
    } else {
      ['insurance', 'commission', 'freight', 'discount', 'packing charges'].forEach((type) => {
        const control = this.addShippingBill.get('invoiceCharges') as FormArray;
        control.push(this.addEditInvoiceCharges({ chargeType: type }));
      })
    }
    this.id = this.route.snapshot.params['id'];
  }

  addNewproduct() {
    const control = this.addShippingBill.get('product') as FormArray;
    control.push(this.addproduct(''))
  }
  addproduct(res?) {
    return this.formBuilder.group({
      invslNo: [res ? res.invslNo : ''],
    itemSlNo: [res ? res.itemSlNo : ''],
    quantity: [res ? res.quantity : ''],
    HSCD: [res ? res.HSCD : ''],
    description: [res ? res.description : ''],
    UQC: [res ? res.UQC : ''],
    unitPrice: [res ? res.unitPrice : ''],
    rate: [res ? res.rate : ''],
    valueFC: [res ? res.valueFC : ''],
    fOBINR: [res ? res.fOBINR : ''],
    PMV: [res ? res.PMV : ''],
    cessRT: [res ? res.cessRT : ''],
    dutyAmt: [res ? res.dutyAmt : ''],
    cesAmt: [res ? res.cesAmt : ''],
    dbkcLmd: [res ? res.dbkcLmd : ''],
    igstPayStatus: [res ? res.igstPayStatus : ''],
    igstAmount: [res ? res.igstAmount : ''],
    igstRate: [res ? res.igstRate : ''],
    schCode: [res ? res.schCode : ''],
    lutNo: [res ? res.lutNo : ''],
    stdQty: [res ? res.lutNo : ''],
    schemeDescription: [res ? res.schemeDescription : ''],
    sqcMSR: [res ? res.sqcMSR : ''],
    stateOrigin: [res ? res.stateOrigin : ''],
    district: [res ? res.district : ''],
    ptAbroad: [res ? res.ptAbroad : ''],
    compCess: [res ? res.compCess : ''],
    endUse: [res ? res.endUse : ''],
    ftaBenefit: [res ? res.ftaBenefit : ''],
    reward: [res ? res.reward : ''],
    thirdParty: [res ? res.thirdParty : '']
    })
  }
  deleteproduct(index: number) {
    const control = this.addShippingBill.get('product') as FormArray;
    control.removeAt(index);
  }
  get product() {
    const control = this.addShippingBill.get('product') as FormArray;
    return control
  }

  get getinvoiceChargeControls() {
    const control = this.addShippingBill.get('invoiceCharges') as FormArray;
    return control;
  }
  get getContainerControls() {
    const control = this.addShippingBill.get('containerItems') as FormArray;
    return control;
  }
  deleteRow(i) {
    const control = this.addShippingBill.get('containerItems') as FormArray;
    control.removeAt(i);
  }
  getShippingdata() {
    let payload = this.commonService.filterList()
    payload.query = {
      "shippingbillId": this.shippingbillId
    }
    this.commonService.getSTList('shippingbill', payload).subscribe((data) => {
      this.shippingbillData = data.documents?.[0];
      this.patchValue(this.shippingbillData)
      //PatchForm from here
    });
  }
  patchValue(payload: any) {
    this.addShippingBill.patchValue({
      CHA: payload?.basicDetails?.CHA,
      stn: payload?.basicDetails?.stn,
      shipper: payload?.basicDetails?.shipperId,
      address: payload?.basicDetails?.shipperAddress,
      consignee: payload?.basicDetails?.consigneeId,
      Caddress: payload?.basicDetails?.consigneeAddress,
      adCode: payload?.basicDetails?.adCode,
      GSTIN: payload?.basicDetails?.gstIN,
      state: payload?.basicDetails?.stateId,
      classType: payload?.basicDetails?.classType,
      NFEI: payload?.basicDetails?.NFEI,
      partyRef: payload?.basicDetails?.partyRef,
      partyRefDate: payload?.basicDetails?.partyRefDate,
      forexAccNo: payload?.basicDetails?.forexAccNo,
      jobNo: payload?.basicDetails?.jobId,
      jobDate: payload?.basicDetails?.jobDate,
      SBNo: payload?.basicDetails?.SBNo,
      SBDate: payload?.basicDetails?.SBDate,
      rbiDate: payload?.basicDetails?.rbiDate,
      RBINo: payload?.basicDetails?.RBINo,
      invoice: payload?.basicDetails?.invoice,
      fOBValue: payload?.basicDetails?.fOBValue,
      PMVValue: payload?.basicDetails?.PMVValue,
      DBKAmt: payload?.basicDetails?.DBKAmt,
      DBKAccNo: payload?.basicDetails?.DBKAccNo,
      Taxable: payload?.basicDetails?.Taxable,
      IGSTAmt: payload?.basicDetails?.IGSTAmt,
      invoiceNo: payload?.basicDetails?.invoiceNo,
      registrationNo: payload?.basicDetails?.registrationNo,
      AEORole: payload?.basicDetails?.AEORole,
      destination: payload?.shipmentDetails?.portId,
      country: payload?.shipmentDetails?.country,
      grossWeight: payload?.shipmentDetails?.grossWeight,
      packages: payload?.shipmentDetails?.packages,
      hblDate: payload?.shipmentDetails?.hblDate,
      mblDate: payload?.shipmentDetails?.mblDate,
      rotationDate: payload?.shipmentDetails?.rotationDate,
      noOfContainer: payload?.shipmentDetails?.noOfContainer,
      masterBLNo: payload?.shipmentDetails?.masterBLNo,
      houseBLNo: payload?.shipmentDetails?.houseBLNo,
      netWeight: payload?.shipmentDetails?.netWeight,
      rotationNo: payload?.shipmentDetails?.rotationNo,
      marksNos: payload?.shipmentDetails?.marksNos,
      sealType: payload?.shipmentDetails?.sealType,
      factoryStuffed: payload?.shipmentDetails?.factoryStuffed,
      EOUBranchSno: payload?.shipmentDetails?.EOUBranchSno,
      cargo: payload?.shipmentDetails?.cargo,
      factoryAddress: payload?.shipmentDetails?.factoryAddress,
      EOUIEC: payload?.shipmentDetails?.EOUIEC,
      incoTerm: payload?.invoiceDetails?.incoTermId,
      AEOCode: payload?.invoiceDetails?.AEOCode,
      PONo: payload?.invoiceDetails?.PONo,
      invFob: payload?.invoiceDetails?.invFob,
      poDate: payload?.invoiceDetails?.poDate,
      buyerDetails: payload?.invoiceDetails?.buyerDetails,
      contractNo: payload?.invoiceDetails?.contractNo,
      Payment: payload?.invoiceDetails?.Payment,
      unitPrice: payload?.invoiceDetails?.unitPrice,
      invoiceAmount: payload?.invoiceDetails?.invoiceAmount,
      invoic_date: payload?.invoiceDetails?.invoic_date,
      invoicesNo: payload?.invoiceDetails?.invoicesNo,
      slNumber: payload?.invoiceDetails?.slNumber,
      shipper_address: payload?.addressInfo?.address,
    });
    const control_containerItems = this.addShippingBill.get('containerItems') as FormArray;
    control_containerItems.clear();
    (payload?.containerItems ?? [])?.forEach((ee) => {
      const control_containerItems = this.addShippingBill.get('containerItems') as FormArray;
      const control_containerItems_details = this.addContainerRowForm();
      control_containerItems_details.patchValue(ee);
      control_containerItems.push(control_containerItems_details);
    });
    const control = this.addShippingBill.get('invoiceCharges') as FormArray;
    control.clear();
    (payload?.invoiceDetails?.invoiceCharges ?? [])?.forEach((ee) => {
      const control = this.addShippingBill.get('invoiceCharges') as FormArray;
      const cargoFormGroup = this.addEditInvoiceCharges();
      cargoFormGroup.patchValue(ee);
      control.push(cargoFormGroup);
    });
    const product = this.addShippingBill.get('product') as FormArray;
    product.clear();
    (payload?.product ?? [])?.forEach((ee) => {
      const product = this.addShippingBill.get('product') as FormArray;
      const product_details = this.addproduct();
      product_details.patchValue(ee);
      product.push(product_details);
    });
    this.documentTableData = payload?.supportingDocuments ?? [];
  }
  get f() { return this.addShippingBill.controls; }
  addeditdoc(data?): FormGroup {
    return this.formBuilder.group({
      documentType: [data?.documentType ? data?.documentType : ''],
      documentName: [data?.documentName ? data?.documentName : ''],
      uploadDate: [data?.uploadDate ? data?.uploadDate : ''],
      documentId: [data?.documentId ? data?.documentId : '']
    });
  }
  addEditInvoiceCharges(data?): FormGroup {
    return this.formBuilder.group({
      chargeType: [data?.chargeType ? data?.chargeType : ''],
      invoicRate: [data?.invoicRate ? data?.invoicRate : ''],
      amount: [data?.amount ? data?.amount : ''],
      currency: [data?.currency ? data?.currency : ''],
      exchRate: [data?.exchRate ? data?.exchRate : '']
    });
  }
  addContainerRow() {
    const control = this.addShippingBill.get('containerItems') as FormArray;
    control.push(this.addContainerRowForm());
  }
  addContainerRowForm(data?): FormGroup {
    return this.formBuilder.group({
      itemSlNo:[data?.itemSlNo ? data?.itemSlNo : ''],
      invSlNo:[data?.invSlNo ? data?.invSlNo : ''],
      code: [data?.code ? data?.code : ''],
      description: [data?.description ? data?.description : '']
    });
  }
  toggleButton(panel: string) {
    switch (panel) {
      case 'booking':
        if (this.canOpenBookingAccordion) {
          this.isBookingPanelOpen = !this.isBookingPanelOpen;
        }
        break;
      case 'siproduct':
        if (this.canOpenSIproductAccordion) {
          this.isSIproductPanelOpen = !this.isSIproductPanelOpen;
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
  getPartyMasterDropDowns() {
    let payload = this.commonService.filterList()
    if (payload) payload.query = {
      "status": true
    }
    this.commonService.getSTList("partymaster", payload)?.subscribe((res: any) => {
      this.getBatchList()
      res?.documents?.filter((x) => {
        if (x.customerType) {
          x.customerType.map((res: any) => {
            if (res?.item_text === 'Shipper') { this.shipperList.push(x) }
            else if (res?.item_text === 'Consignee') { this.consigneeList.push(x) }
          })
        }
      });
      if (this.shippingbillId && this.shippingbillData?.basicDetails?.consigneeId) {
        this.setconsinee(this.shippingbillId && this.shippingbillData?.basicDetails?.consigneeId);
      }
    });
  }
  setShipper(e) {
    if (!e) { return false }
    let data = this.shipperList.find((x) => x?.partymasterId === e)
    if (data) {
      this.billingBranchList = data?.branch
    }

    let states = this.shipperList.find((x) => x?.partymasterId === e)
    if (states?.addressInfo?.stateId) {
      this.addShippingBill.get('state').setValue(states?.addressInfo?.stateId);
    } else {
      this.addShippingBill.get('state').setValue("");
    }
  }
  onBranchSelect(selectedBranch: string) {
    if (!selectedBranch) return;
    const branch = this.billingBranchList.find((item) => item.branch_name === selectedBranch);
    if (branch?.branch_address) {
      this.addShippingBill.get('shipper_address')?.setValue(branch.branch_address);
    } else {
      this.addShippingBill.get('shipper_address')?.setValue('');
    }
  }

  onBranchSelect1(selectedBranch: string) {
    
    if (!selectedBranch) return;
  
    const branch = this.billingBranchLists.find((item) => item.branch_name === selectedBranch);
    if (branch?.branch_address) {
      this.addShippingBill.get('consignee_address')?.setValue(branch.branch_address);
    } else {
      this.addShippingBill.get('consignee_address')?.setValue('');
    }
  }
  setconsinee(e) {
    if (!e) { return false; }
    let data = this.consigneeList.filter((x) => x?.partymasterId === e)[0];
    if (data) {
      this.billingBranchLists = data.branch;
    }
  }
  getBatchList() {
    let payload = this.commonService.filterList();
    payload.query = {
      batchId: this.route.snapshot.params['id'],
    };

    this.commonService.getSTList('batch', payload).subscribe((data) => {
      this.batchData = data.documents;

      if (this.batchData && this.batchData.length > 0) {
        const batchId = this.batchData[0]?.batchId;
        const createdOn = new Date(this.batchData[0]?.createdOn);
    
        const formattedDate = format(createdOn, 'dd/MM/yyyy');
        const formattedTime = format(createdOn, 'HH:mm:ss');
    
        this.addShippingBill.get('jobNo').setValue(batchId);
        this.addShippingBill.get('jobDate').setValue(`${formattedDate} ${formattedTime}`);
    }

      if (this.batchData[0].enquiryDetails?.basicDetails?.shipperId) {
        this.addShippingBill.get('shipper').setValue(this.batchData[0].enquiryDetails?.basicDetails?.shipperId);
        this.setShipper(this.batchData[0].enquiryDetails?.basicDetails?.shipperId);
      }

      if (this.batchData[0].enquiryDetails?.looseCargoDetails) {
        const cargos = this.batchData[0].enquiryDetails?.looseCargoDetails?.cargos;
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

                this.addShippingBill.get('grossWeight').setValue(grossWeight);
              }
              if (cargo?.pkgname === 'Pallets') {
                grossWeight += cargo?.Weightselected;
                this.addShippingBill.get('grossWeight').setValue(grossWeight);
              }
              if (cargo?.pkgname === 'Pallets' && cargo?.Pallettype === 'Pallets (non specified size)') {
                grossWeight += cargo?.Weightps || 0;
                this.addShippingBill.get('grossWeight').setValue(grossWeight);
              }
            }
          });

          this.addShippingBill.get('packages').setValue(totalUnits);
        }
      }
      if (this.batchData[0].enquiryDetails?.containersDetails) {
        const cargos = this.batchData[0].enquiryDetails?.containersDetails;
        let totalnoOfContainer = 0;
        let totalGrossWeight = 0;
        if (cargos && cargos.length > 0) {
          cargos.forEach((containersDetails) => {
            if (containersDetails?.noOfContainer) {
              totalnoOfContainer += containersDetails?.noOfContainer;
            }

          });
          this.addShippingBill.get('noOfContainer').setValue(totalnoOfContainer);
        }
        if (cargos && cargos.length > 0) {
          cargos.forEach((containersDetails) => {
            if (containersDetails?.grossWeightContainer) {
              totalGrossWeight += containersDetails?.grossWeightContainer;
            }

          });
          this.addShippingBill.get('grossWeight').setValue(totalGrossWeight);
        }
      }
      if (this.batchData[0].enquiryDetails?.basicDetails?.incoTermId) {
        this.addShippingBill.get('incoTerm').setValue(this.batchData[0].enquiryDetails?.basicDetails?.incoTermId);
      }
    });
  }



  setTax() {
    const GSTIN = this.shipperList?.find(dd => dd?.partymasterId === this.addShippingBill?.value?.shipper)?.branch?.find(dd => dd?.branch_name === this.addShippingBill?.value?.address)?.tax_number;
    this.addShippingBill.get('GSTIN').setValue(GSTIN ?? '');
  }
  onLocationSearch() {

    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = { status: true }
    this.commonService.getSTList("port", payload)?.subscribe((res: any) => {
      this.locationList = res?.documents

    });
  }
  getCountryList() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = { status: true }

    this.commonService.getSTList('country', payload)?.subscribe((data) => {
      this.countryList = data.documents;
    })
  }
  stateData: any = []
  getStateList() {
    this.stateData = [];

    let payload = this.commonService.filterList()

    if(payload?.query)payload.query = {
      "status": true
    }

    this.commonService.getSTList('state', payload)?.subscribe((data) => {
      this.stateData = data.documents;
    });
  }
  setCountry(event) {
    const Country = this.locationList?.find(port => port?.portId === event)?.country?.countryId ?? '';
    this.addShippingBill.get('country').setValue(Country);
  }
  getSystemTypeDropDowns() {
    let payload = this.commonService.filterList()

    if (payload) payload.query = {
      status: true,
      "typeCategory": {
        "$in": ["containerType", "incoTerm"
        ]
      }
    }

    this.commonService.getSTList("systemtype", payload)?.subscribe((res: any) => {
      this.containerTypeList = res?.documents?.filter(x => x.typeCategory === "containerType");
      this.incotermList = res?.documents?.filter(x => x.typeCategory === "incoTerm");
    })
  }
  SaveShippingBill() {
    // this.submitted =true
    // if (this.addShippingBill.invalid) {
    // return false
    // }
    const invoiceCharges =(this.addShippingBill.value.invoiceCharges ?? [])?.map((inv)=>{
      return {
        ...inv,
        currencyShortName:this.currencyList.find(crc=>crc?.currencyId===inv?.currency)?.currencyShortName??''
      }
    })
    let payload = {
      basicDetails: {
        CHA: this.addShippingBill.value.CHA,
        stn: this.addShippingBill.value.stn,
        shipperId: this.addShippingBill.value.shipper,
        shipperName: this.shipperList.find(x => x.partymasterId === this.addShippingBill.value.shipper)?.name,
        shipperAddress: this.addShippingBill.value.address,
        consigneeId: this.addShippingBill.value.consignee,
        consigneeName: this.consigneeList?.find(x => x.partymasterId === this.addShippingBill.value.consignee)?.name,
        consigneeAddress: this.addShippingBill.value.Caddress,
        adCode: this.addShippingBill.value.adCode,
        gstIN: this.addShippingBill.value.GSTIN,
        stateId: this.addShippingBill.value.state,
        stateName: this.stateData.find((x) => x?.stateId === this.addShippingBill.value.state)?.stateName,
        classType: this.addShippingBill.value.classType,
        NFEI: this.addShippingBill.value.NFEI,
        partyRef: this.addShippingBill.value.partyRef,
        partyRefDate: this.addShippingBill.value.partyRefDate,
        forexAccNo: this.addShippingBill.value.forexAccNo,
        jobId: this.addShippingBill.value.jobNo,
        jobNo: this.batchData.find((x) => x?.batchId === this.addShippingBill.value.jobNo)?.batchNo,
        jobDate: this.addShippingBill.value.jobDate,
        SBNo: this.addShippingBill.value.SBNo,
        SBDate: this.addShippingBill.value.SBDate,
        rbiDate: this.addShippingBill.value.rbiDate,
        RBINo: this.addShippingBill.value.RBINo,
        invoice: this.addShippingBill.value.invoice,
        fOBValue: this.addShippingBill.value.fOBValue,
        PMVValue: this.addShippingBill.value.PMVValue,
        DBKAmt: this.addShippingBill.value.DBKAmt,
        DBKAccNo: this.addShippingBill.value.DBKAccNo,
        Taxable: this.addShippingBill.value.Taxable,
        IGSTAmt: this.addShippingBill.value.IGSTAmt,
        invoiceNo: this.addShippingBill.value.invoiceNo,
      },
      shipmentDetails: {
        portId: this.addShippingBill.value.destination,
        portName: this.locationList.find((x) => x?.portId === this.addShippingBill.value.destination)?.portDetails.portName,
        country: this.addShippingBill.value.country,
        contryName: this.countryList.find((x) => x?.countryId === this.addShippingBill.value.country)?.countryName,
        grossWeight: this.addShippingBill.value.grossWeight,
        packages: this.addShippingBill.value.packages,
        hblDate: this.addShippingBill.value.hblDate,
        mblDate: this.addShippingBill.value.mblDate,
        rotationDate: this.addShippingBill.value.rotationDate,
        noOfContainer: this.addShippingBill.value.noOfContainer,
        masterBLNo: this.addShippingBill.value.masterBLNo,
        houseBLNo: this.addShippingBill.value.houseBLNo,
        netWeight: this.addShippingBill.value.netWeight,
        rotationNo: this.addShippingBill.value.rotationNo,
        marksNos: this.addShippingBill.value.marksNos,
        sealType: this.addShippingBill.value.sealType,
        factoryStuffed: this.addShippingBill.value.factoryStuffed,
        EOUBranchSno: this.addShippingBill.value.EOUBranchSno,
        cargo: this.addShippingBill.value.cargo,
        factoryAddress: this.addShippingBill.value.factoryAddress,
        EOUIEC: this.addShippingBill.value.EOUIEC,
      },
      invoiceDetails: {
        incoTermId: this.addShippingBill.value.incoTerm,
        incoTerm: this.incotermList.find((x) => x?.systemtypeId === this.addShippingBill.value.incoTerm)?.typeName,
        PONo: this.addShippingBill.value.PONo,
        invFob: this.addShippingBill.value.invFob,
        poDate: this.addShippingBill.value.poDate,
        AEOCode: this.addShippingBill.value.AEOCode,
        buyerDetails: this.addShippingBill.value.buyerDetails,
        contractNo: this.addShippingBill.value.contractNo,
        Payment: this.addShippingBill.value.Payment,
        unitPrice: this.addShippingBill.value.unitPrice,
        invoiceCharges: invoiceCharges,
        invoiceAmount:this.addShippingBill.value.invoiceAmount,
        invoic_date:this.addShippingBill.value.invoic_date,
        slNumber:this.addShippingBill.value.slNumber,
        invoicesNo:this.addShippingBill.value.invoicesNo,
        registrationNo: this.addShippingBill.value.registrationNo,
        AEORole: this.addShippingBill.value.AEORole

      },
      batchId: this.batchData?.[0]?.batchId,
      containerItems: this.addShippingBill.value.containerItems,
      product:this.addShippingBill.value.product,
      supportingDocuments: this.documentTableData ?? []
    }
    if (this.shippingbillId) {
      this.commonService.UpdateToST("shippingbill/" + this.shippingbillId, payload)?.subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Updated Successfully', '');
            this.close();
            setTimeout(() => {
              // this.getcustomdata()
            }, 1000);
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error', error?.error?.error, '');
        }
      );
    } else {
      this.commonService.addToST("shippingbill", payload)?.subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Added Successfully', '');
            this.close();
            setTimeout(() => {
              // this.getcustomdata()
            }, 1000);
          }
        },
        (error) => {
          this.close();
          this.notification.create('error', error?.error?.error, '');
        }
      );
    }

  }
  close() {
    this.router.navigate(['/batch/list/add', this.urlParam.id, this.urlParam.key])
  }
  getInvoiceList() {
    let payload = this.commonService.filterList()

    payload.query = {
      batchId: this.route.snapshot.params['id'],
      "$and": [
        {
          "principleBill": {
            "$ne": true
          }
        }
      ]
    }
    payload.sort = {
      desc: ["createdOn"]
    }
    setTimeout(() => {
      this.commonService.getSTList('invoice', payload).subscribe((data) => {
        this.invoiceData = data.documents;
        this.dataSource = new MatTableDataSource(
          data?.documents?.map((s: any, index) => {
            return {
              ...s,
              id: index + 1
            }
          })
        );
      })
    });
  }
  isEdit: boolean = false;
    print(data) {
    let reportpayload: any;
    let url: any;
      reportpayload = { "parameters": { "shippingbillId": data } };
      url = 'checkListShippingBill';

    this.commonService.pushreports(reportpayload, url).subscribe({
      next: (res: any) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        let temp = URL.createObjectURL(blob);
        const pdfWindow = window.open(temp);
        pdfWindow.print();
      }
    })

  }
  getCurrencyDropDowns() {

    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      status: true,
    }
    this.commonService.getSTList("currency", payload)?.subscribe((res: any) => {
      this.currencyList = res?.documents;
    });
  }
  sellCurrChange(i) {
    let control = this.addShippingBill.controls.invoiceCharges['controls'][i].controls

    let defaultCurrency = this.batchData[0]?.quotationDetails?.currencyShortName
    let currencyShortName = this.currencyList?.filter(x => x?.currencyId ==
      control.currency.value)[0]?.currencyShortName
    let exRate = 0

    if (currencyShortName != defaultCurrency) {
      let payload = {
        "fromCurrency": currencyShortName,
        "toCurrency": defaultCurrency,
      }

      this.commonService.getExchangeRate('exchangeRate', payload).subscribe((result) => {

        exRate = result[defaultCurrency]
        control.exchRate.setValue(exRate)
      })
    }
    else {
      exRate = 1
      control.exchRate.setValue(exRate)
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
  onFileSelected(event) {
    let filename = event.target.value.replace('C:\\fakepath\\', '');
    this.extension = filename.substr(filename.lastIndexOf('.')).toLowerCase();

    const allowedExtensions = ['.xls', '.xlsx', '.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.csv'];

    if (allowedExtensions.includes(this.extension)) {
      this.fileTypeNotMatched = false;
      this.doc = event.target.files[0];
    } else {
      this.fileTypeNotMatched = true;
      this.base64Output = '';
      this.docForm.reset();
    }
  }

  documentPreview(doc) {
    this.commonService.downloadDocuments('downloadfile', doc?.documentName)?.subscribe(
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
  checkDocUploaded() {
    if (this.documentTableData.filter((x) => x.documentStatus).length > 0) {
      return false
    } else { return true }
  }
  onSave() {
    this.submitted = false;
    return null;
  }
  selectDocument(doc: any, e: any) {
    if (e.target.checked) {
      this.docData.push(doc);
    } else {
      this.docData.splice(
        this.docData.findIndex((a) => a.documentName === doc.documentName),
        1
      );
    }
  }
  addDocument() {
    const formData = new FormData();
    const filename = this.docForm.value?.documentName + this.extension;
    formData.append('file', this.doc, `${filename}`);
    formData.append('name', `${filename}`);
    this.commonService.uploadDocuments('uploadfile', formData).subscribe((res) => {
      this.documentTableData.push({
        documentType: this.docForm.value?.documentType,
        documentName: res?.name,
        uploadDate: new Date(),
        documentId: res?.requestId
      })
      this.docForm.reset();
      this.doc = null;
    });
    this.notification.create('success', 'Saved Successfully', '');
  }
  deleteFile(i) {
    this.documentTableData?.splice(i, 1)
  }



}
