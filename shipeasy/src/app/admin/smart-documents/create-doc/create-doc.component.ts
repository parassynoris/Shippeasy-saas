import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/services/common/common.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-create-doc',
  templateUrl: './create-doc.component.html',
  styleUrls: ['./create-doc.component.scss']
})
export class CreateDocComponent implements OnInit {
  quotationForm: FormGroup;
  companyStampURL: any = null;
  emailSignatureURL: any = null;
  companyStampName: string | null = null;
  companySignName : string | null = null;
  ports = [];
  shipmentTypes = [];
  dispatchMethods = [];
  places = [];
  chargeName: any = [];
  documents: any = [
    { name: 'Quotation', key: 'Quotation' },
    { name: 'Proforma Invoice', key: 'Proforma' },
    { name: 'Commercial Invoice', key: 'Commercial' },
    { name: 'Packing List', key: 'Packing' },
    { name: 'Bill of Lading', key: 'BL' },
    { name: 'Purchase Order', key: 'Purchase' },
    { name: 'Verified Gross Mass Declaration', key: 'VGM' },
    { name: 'Certificate of Origin', key: 'Certificate' },
    { name: 'House Bill of Lading', key: 'HBL' }
  ];
  partyList: any = []

  submitted: boolean = false;
  selectedDocument: string = '';
  uomData: any;
  Documentpdf: string;
  currentUser :any;

  constructor(private fb: FormBuilder,
    public router: Router,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private notification: NzNotificationService,
    private commonFunction : CommonFunctions,
    public modalService: NgbModal, private sanitizer: DomSanitizer) {
    this.currentUser = this.commonFunction?.getActiveAgent();
    this.formBuild()
  }

  get products(): FormArray {
    return this.quotationForm.get('products') as FormArray;
  }

  back() {
    this.router.navigate(['/smart-documents/list']);
  }
  selectDocument(doc): void {
    this.selectedDocument = doc.key;
    this.router.navigate(['/smart-documents/list/' + doc.key + '/add']);
    this.formBuild()
  }
  costItem() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      "status": true,
    }
    this.commonService.getSTList('costitem', payload)?.subscribe((data) => {
      this.chargeName = data.documents;

    });
  }
  signitureOfCompany: any = '';
  receiveData(data: string) {
    this.signitureOfCompany = null;
    this.signitureOfCompany = data;
  }
  signitureOfCompany1: any = '';
  receiveData1(data: string) {
    this.signitureOfCompany1 = null;
    this.signitureOfCompany1 = data;
  }
  createProduct(data?): FormGroup {
    return this.fb.group({
      code: [data ? data?.code : this.generateRandomCode()],
      description: [data ? data?.description : ''],
      chargeId: [data ? data?.chargeId : ''],
      unitQty: [data ? data?.unitQty : 0],
      unitType: [data ? data?.unitType : ''],
      unitTypeName: [data ? data?.unitTypeName : ''],
      price: [data ? data?.price : 0],
      amount: [data ? data?.amount : 0],
      noOfPackage: [data ? data?.noOfPackage : 0],
      packageQty: [data ? data?.packageQty : 0],
      netWt: [data ? data?.netWt : 0],
      grossWt: [data ? data?.grossWt : 0],
      measurPackage: [data ? data?.measurPackage : 0],
      codeTariff: [data ? data?.codeTariff : ''],
      chargeable: [data ? data?.chargeable : ''],
      measurement: [data ? data?.measurement : ''],
      kindNoofPackage: [data ? data?.kindNoofPackage : 0],
      sealNo: [data ? data?.sealNo : ''],
      currency: [data ? data?.currency : ''],
      exRate: [data ? data?.exRate : 0],
    });
  }

  get f() {
    return this.quotationForm.controls;
  }
  addProduct(): void {
    this.products.push(this.createProduct());
  }

  removeProduct(index: number): void {
    this.products?.removeAt(index);
  }

  preview(data?) {
    console.log(data)
    let reportpayload: any;
    let url: any;
    let id = data?.smartdocumentId;
    if (data?.documentKey === "Quotation") {
      reportpayload = { "parameters": { "documentId": id } };
      url = 'smartQuotation'
      this.commonService.pushreports(reportpayload, url).subscribe({
        next: (res: any) => {
          const blob = new Blob([res], { type: 'application/pdf' });
          let temp = URL.createObjectURL(blob);
          this.Documentpdf = temp;
          const pdfWindow = window.open(temp);
          // pdfWindow.print();
        }
      })
    }else if(data?.documentKey === "Proforma"){
      reportpayload = { "parameters": { "documentId": id } };
      url = 'smartProforma'
      this.commonService.pushreports(reportpayload, url).subscribe({
        next: (res: any) => {
          const blob = new Blob([res], { type: 'application/pdf' });
          let temp = URL.createObjectURL(blob);
          this.Documentpdf = temp;
          const pdfWindow = window.open(temp);
          // pdfWindow.print();
        }
      })
    }else if(data?.documentKey === "Purchase"){
      reportpayload = { "parameters": { "documentId": id } };
      url = 'smartPurchase'
      this.commonService.pushreports(reportpayload, url).subscribe({
        next: (res: any) => {
          const blob = new Blob([res], { type: 'application/pdf' });
          let temp = URL.createObjectURL(blob);
          this.Documentpdf = temp;
          const pdfWindow = window.open(temp);
          // pdfWindow.print();
        }
      })
    }
    else if(data?.documentKey === "HBL"){
      reportpayload = { "parameters": { "documentId": id } };
      url = 'houseBillOfLad'
      this.commonService.pushreports(reportpayload, url).subscribe({
        next: (res: any) => {
          const blob = new Blob([res], { type: 'application/pdf' });
          let temp = URL.createObjectURL(blob);
          this.Documentpdf = temp;
          const pdfWindow = window.open(temp);
          // pdfWindow.print();
        }
      })
    } else if(data?.documentKey === "Certificate"){
      reportpayload = { "parameters": { "documentId": id } };
      url = 'originCerti'
      this.commonService.pushreports(reportpayload, url).subscribe({
        next: (res: any) => {
          const blob = new Blob([res], { type: 'application/pdf' });
          let temp = URL.createObjectURL(blob);
          this.Documentpdf = temp;
          const pdfWindow = window.open(temp);
          // pdfWindow.print();
        }
      })
    }else if(data?.documentKey === "Packing"){
      reportpayload = { "parameters": { "documentId": id } };
      url = 'smartPackingList'
      this.commonService.pushreports(reportpayload, url).subscribe({
        next: (res: any) => {
          const blob = new Blob([res], { type: 'application/pdf' });
          let temp = URL.createObjectURL(blob);
          this.Documentpdf = temp;
          const pdfWindow = window.open(temp);
          // pdfWindow.print();
        }
      })
    }else if(data?.documentKey === "BL"){
      reportpayload = { "parameters": { "documentId": id } };
      url = 'blladding'
      this.commonService.pushreports(reportpayload, url).subscribe({
        next: (res: any) => {
          const blob = new Blob([res], { type: 'application/pdf' });
          let temp = URL.createObjectURL(blob);
          this.Documentpdf = temp;
          const pdfWindow = window.open(temp);
          // pdfWindow.print();
        }
      })
    }else if(data?.documentKey === "Commercial"){
      reportpayload = { "parameters": { "documentId": id } };
      url = 'commercialInvoice'
      this.commonService.pushreports(reportpayload, url).subscribe({
        next: (res: any) => {
          const blob = new Blob([res], { type: 'application/pdf' });
          let temp = URL.createObjectURL(blob);
          this.Documentpdf = temp;
          const pdfWindow = window.open(temp);
          // pdfWindow.print();
        }
      })
    }   else if(data?.documentKey === "VGM"){
      reportpayload = { "parameters": { "documentId": id } };
      url = 'VGM'
      this.commonService.pushreports(reportpayload, url).subscribe({
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

  download(data?) {
    let reportpayload: any;
    let url: any;
    let id = data?.smartdocumentId;
    if (data?.documentKey === "Quotation") {
      reportpayload = { "parameters": { "documentId": id } };
      url = 'smartQuotation'
      this.commonService.pushreports(reportpayload, url).subscribe({
        next: (res: any) => {
          const blob = new Blob([res], { type: 'application/pdf' });
          let temp = URL.createObjectURL(blob);
          this.Documentpdf = temp;
          const pdfWindow = window.open(temp);
          pdfWindow.print();
        }
      })
    }else if(data?.documentKey === "Proforma"){
      reportpayload = { "parameters": { "documentId": id } };
      url = 'smartProforma'
      this.commonService.pushreports(reportpayload, url).subscribe({
        next: (res: any) => {
          const blob = new Blob([res], { type: 'application/pdf' });
          let temp = URL.createObjectURL(blob);
          this.Documentpdf = temp;
          const pdfWindow = window.open(temp);
          pdfWindow.print();
        }
      })
    }else if(data?.documentKey === "Purchase"){
      reportpayload = { "parameters": { "documentId": id } };
      url = 'smartPurchase'
      this.commonService.pushreports(reportpayload, url).subscribe({
        next: (res: any) => {
          const blob = new Blob([res], { type: 'application/pdf' });
          let temp = URL.createObjectURL(blob);
          this.Documentpdf = temp;
          const pdfWindow = window.open(temp);
          pdfWindow.print();
        }
      })
    } else if(data?.documentKey === "HBL"){
      reportpayload = { "parameters": { "documentId": id } };
      url = 'houseBillOfLad'
      this.commonService.pushreports(reportpayload, url).subscribe({
        next: (res: any) => {
          const blob = new Blob([res], { type: 'application/pdf' });
          let temp = URL.createObjectURL(blob);
          this.Documentpdf = temp;
          const pdfWindow = window.open(temp);
          pdfWindow.print();
        }
      })
    } else if(data?.documentKey === "Certificate"){
      reportpayload = { "parameters": { "documentId": id } };
      url = 'originCerti'
      this.commonService.pushreports(reportpayload, url).subscribe({
        next: (res: any) => {
          const blob = new Blob([res], { type: 'application/pdf' });
          let temp = URL.createObjectURL(blob);
          this.Documentpdf = temp;
          const pdfWindow = window.open(temp);
          pdfWindow.print();
        }
      })
    }else if(data?.documentKey === "BL" || data?.documentKey === "Packing"){
      reportpayload = { "parameters": { "documentId": id } };
      url = 'blladding'
      this.commonService.pushreports(reportpayload, url).subscribe({
        next: (res: any) => {
          const blob = new Blob([res], { type: 'application/pdf' });
          let temp = URL.createObjectURL(blob);
          this.Documentpdf = temp;
          const pdfWindow = window.open(temp);
          pdfWindow.print();
        }
      })
    }else if(data?.documentKey === "Commercial"){
      reportpayload = { "parameters": { "documentId": id } };
      url = 'commercialInvoice'
      this.commonService.pushreports(reportpayload, url).subscribe({
        next: (res: any) => {
          const blob = new Blob([res], { type: 'application/pdf' });
          let temp = URL.createObjectURL(blob);
          this.Documentpdf = temp;
          const pdfWindow = window.open(temp);
          pdfWindow.print();
        }
      })
    }   else if(data?.documentKey === "VGM"){
      reportpayload = { "parameters": { "documentId": id } };
      url = 'VGM'
      this.commonService.pushreports(reportpayload, url).subscribe({
        next: (res: any) => {
          const blob = new Blob([res], { type: 'application/pdf' });
          let temp = URL.createObjectURL(blob);
          this.Documentpdf = temp;
          const pdfWindow = window.open(temp);
          pdfWindow.print();
        }
      })
    } 
  }
  activeFright = '';
  activeFrightAir: boolean = false;
  shipmentType() {
    this.activeFright = this.dispatchMethods?.find(x => x.systemtypeId === this.quotationForm.value.methodOfDispatch)?.typeName?.toLowerCase();
    this.activeFrightAir = false
    if (this.activeFright == 'air') {
      this.activeFrightAir = true
      this.shipmentTypes = this.shipmentTypesOriginal?.filter((x) => ['Loose', 'ULD Container']?.find(t => t.toLowerCase() === x.typeName.toLowerCase()))
    } else if (this.activeFright == 'ocean') {
      this.shipmentTypes = this.shipmentTypesOriginal?.filter((x) => ['FCL', 'LCL', 'Break Bulk']?.find(t => t.toLowerCase() === x.typeName.toLowerCase()))
    } else if (this.activeFright == 'land') {
      this.shipmentTypes = this.shipmentTypesOriginal?.filter((x) => ['FCL', 'FTL', 'PTL']?.find(t => t.toLowerCase() === x.typeName.toLowerCase()))
    } else if (this.activeFright == 'rail') {
      this.shipmentTypes = this.shipmentTypesOriginal?.filter((x) => ['FWL']?.find(t => t.toLowerCase() === x.typeName.toLowerCase()))
    } else {
      this.shipmentTypes = this.shipmentTypesOriginal
    }
  }
  documentNameValue: any;
  addProductValue() {
    const productsArray = [];
    this.products?.controls?.forEach(element => {
      let products = {
        ...element.value,
        chargeName:this.chargeName.find(da=>da?.costitemId===element.value?.chargeId)?.costitemName,
        currencyName: this.currencyList?.find((x) => x.currencyId === element.value.currency)?.currencyShortName,
        unitTypeName: this.uomData?.filter(x => x?.uomId === element.value.unitType)[0]?.uomShort || '',
      }
      productsArray.push(products)
    });
    return productsArray;
  }
  returnDocType() {
    return this.documents?.find((x) => x?.key == this.selectedDocument)?.name || ''
  }
  formBuild(data?) {
    this.quotationForm = this.fb.group({
      from: [data ? data?.from : ''],
      to: [data ? data?.to : ''],
      quoteNumber: [data ? data?.quoteNumber : this.generateRandomCode('QUT')],
      blNumber: [data ? data?.blNumber : ''],
      date: [data ? data?.date : new Date()],
      portOfLoading: [data ? data?.portOfLoading : ''],
      portOfDischarge: [data ? data?.portOfDischarge : ''],
      methodOfDispatch: [data ? data?.methodOfDispatch : ''],
      typeOfShipment: [data ? data?.typeOfShipment : ''],
      products: data && data?.products?.length > 0 ? this.fb.array([]) : this.fb.array([this.createProduct()]),
      additionalInfo: [data ? data?.additionalInfo : ''],
      placeOfIssue: [data ? data?.placeOfIssue : ''],
      placeOfIssue1: [data ? data?.placeOfIssue1 : ''],
      issueDate: [data ? data?.issueDate : new Date()],
      issueDate1: [data ? data?.issueDate1 : new Date()],
      periodOfDelivery: [data ? data?.periodOfDelivery : []],
      signatoryCompany: [data ? data?.signatoryCompany : ''],
      signatoryCompany1: [data ? data?.signatoryCompany1 : ''],
      authorizedSignatory: [data ? data?.authorizedSignatory : ''],
      authorizedSignatory1: [data ? data?.authorizedSignatory1 : ''],
      buyerReference: [data ? data?.buyerReference : ''],
      reference: [data ? data?.reference : ''],
      bankDetails: [data ? data?.bankDetails : ''],
      buyer: [data ? data?.buyer : ''],
      countryOG: [data ? data?.countryOG : ''],
      countryFD: [data ? data?.countryFD : ''],
      paymentMethod: [data ? data?.paymentMethod : ''],
      placeOrigin: [data ? data?.placeOrigin : ''],
      finalDestination: [data ? data?.finalDestination : ''],
      dateofDeparture: [data ? data?.dateofDeparture : ''],
      marinCoverPolicy: [data ? data?.marinCoverPolicy : ''],
      letterCreditNo: [data ? data?.letterCreditNo : ''],
      voyageNo: [data ? data?.voyageNo : ''],
      totalUnitQty: [data ? data?.totalUnitQty : 0],
      totalNetWt: [data ? data?.totalNetWt : ''],
      totalGWt: [data ? data?.totalGWt : 0],
      totalVolume: [data ? data?.totalVolume : ''],
      carrierReference: [data ? data?.carrierReference : ''],
      shipperReference: [data ? data?.shipperReference : ''],
      consigneeRef: [data ? data?.consigneeRef : ''],
      notifyParty: [data ? data?.notifyParty : ''],
      notifyParty1: [data ? data?.notifyParty1 : ''],
      carrier: [data ? data?.carrier : ''],
      preCarriageBy: [data ? data?.preCarriageBy : ''],
      placeOfReceipt: [data ? data?.placeOfReceipt : ''],
      additionalInfoBL: [data ? data?.additionalInfoBL : ''],
      supplierReference: [data ? data?.supplierReference : ''],
      method2: [(data?.method2 === "true") ?true: false],
      method1: [(data?.method1 === "true" )?true: false],
      containerNo: [data ? data?.containerNo : ''],
      sealNo:[data? data?.sealNo:''],
      kindNoofPackage:[data? data?.kindNoofPackage:''],
      measurement:[data? data?.measurement:''],
      cargoWT: [data ? data?.cargoWT : 0],
      containerTare: [data ? data?.containerTare : 0],
      grossWt: [data ? data?.grossWt : 0],
      declarationExporter: [data ? data?.declarationExporter : ''],
      letterOfCreditNo: [data ? data?.letterOfCreditNo : ''],
      packingInformation: [data ? data?.packingInformation : ''],
      mtdNo: [data ? data?.mtdNo : ''],
      placeOfDelivery: [data ? data?.placeOfDelivery : ''],
      placeOfTranshipment: [data ? data?.placeOfTranshipment : ''],
      deliveryAgent: [data ? data?.deliveryAgent : ''],
      freightAmount: [data ? data?.freightAmount : 0],
      noOfOriginals: [data ? data?.noOfOriginals : 0],
      freightPaybleAt: [data ? data?.freightPaybleAt : ''],

    });
    this.signitureOfCompany = data?.signitureOfCompany || ''
    this.signitureOfCompany1 = data?.signitureOfCompany1 || ''
    this.documentNameValue = data?.documentName
    if (data?.documentKey) {
      this.selectedDocument = data?.documentKey
    }

    if (data && data?.products?.length > 0) {
      data?.products?.forEach(element => {
        this.products?.push(this.createProduct(element));
      })
    }

    if(this.currentUser?.agentId){
      this.quotationForm.get('from').setValue(this.currentUser?.agentId);
    }
  }
  save(): void {
    this.modalService.dismissAll()

    if (this.quotationForm.valid) {
      let fromData = this.partyList?.find((x) => x?.partymasterId === this.quotationForm.value.from)
      let toData = this.partyList?.find((x) => x?.partymasterId === this.quotationForm.value.to)
      let payload = {
        ...this.quotationForm.value,
        smartdocumentId: this.route.snapshot.params['id'] || '',
        products: this.addProductValue(),
        documentKey: this.selectedDocument,
        documentType: this.documents?.find((x) => x?.key == this.selectedDocument)?.name || '',
        associatedWith: '',
        documentName: this.documentNameValue || '',
        portOfLoadingName: this.ports?.find((x) => x?.portId === this.quotationForm.value.portOfLoading)?.portName || '',
        portOfDischargeName: this.ports.find((x) => x?.portId === this.quotationForm.value.portOfDischarge)?.portName || '',
        placeOfIssueName: this.places?.find((x) => x?.locationId === this.quotationForm.value.placeOfIssue)?.locationName || '',
        placeOfIssue1Name: this.places?.find((x) => x?.locationId === this.quotationForm.value.placeOfIssue1)?.locationName || '',
        methodOfDispatchName: this.dispatchMethods?.find((x) => x?.systemtypeId === this.quotationForm.value.methodOfDispatch)?.typeName || '',
        typeOfShipmentName: this.shipmentTypes?.find((x) => x?.systemtypeId === this.quotationForm.value.typeOfShipment)?.typeName || '',
        buyerName: this.partyList?.find((x) => x?.partymasterId === this.quotationForm.value.buyer)?.name || '',
        toName: toData?.name || '',
        toAddress: toData?.addressInfo || '',
        fromName: fromData?.name ? fromData?.name : this.currentUser?.agentName ?this.currentUser?.agentName :'',
        fromAddress: fromData?.addressInfo || '',
        countryOGName: this.cityListLand?.find((x) => x?.cityName === this.quotationForm.value.countryOG)?.cityName || '',
        countryFDName: this.cityListLand?.find((x) => x?.cityName === this.quotationForm.value.countryFD)?.cityName || '',
        paymentMethodName: this.paymentModeList?.find((x) => x?.systemtypeId === this.quotationForm.value.paymentMethod)?.typeName || '',
        placeOriginName: this.places?.find((x) => x?.locationId === this.quotationForm.value.placeOrigin)?.locationName || '',
        finalDestinationName: this.places?.find((x) => x?.locationId === this.quotationForm.value.finalDestination)?.locationName || '',
        carrierName: this.partyList?.find((x) => x?.partymasterId === this.quotationForm.value.carrier)?.name || '',
        notifyPartyName: this.partyList?.find((x) => x?.partymasterId === this.quotationForm.value.notifyParty)?.name || '',
        deliveryAgentName: this.partyList?.find((x) => x?.partymasterId === this.quotationForm.value.deliveryAgent)?.name || '',
        notifyPartyName1: this.partyList?.find((x) => x?.partymasterId === this.quotationForm.value.notifyParty1)?.name || '',
        placeOfReceiptName: this.places?.find((x) => x?.locationId === this.quotationForm.value.placeOfReceipt)?.locationName || '',
        placeOfDeliveryName: this.places?.find((x) => x?.locationId === this.quotationForm.value.placeOfDelivery)?.locationName || '',
        placeOfTranshipmentName: this.places?.find((x) => x?.locationId === this.quotationForm.value.placeOfTranshipment)?.locationName || '',
        signitureOfCompany: this.signitureOfCompany || '',
        signitureOfCompany1: this.signitureOfCompany1 || '',
        signatoryCompany: this.quotationForm.value.signatoryCompany || '',
        signatoryCompany1: this.quotationForm.value.signatoryCompany1 || '',
        totalAmount: this.totalAmount,
        currentUserCurrency :this.currentUser?.currency?.currencyName.toUpperCase()
      }


      if (this.route.snapshot.params['id']) {
        this.commonService.UpdateToST(`smartdocument/${this.route.snapshot.params['id']}`, payload)?.subscribe(
          (res: any) => {
            if (res) {
              this.submitted = false;
              this.notification.create(
                'success',
                'Your documents will be stored',
                ''
              );
              this.submitted = false
              this.quotationForm.reset()
              this.router.navigate(['/smart-documents/list']);
            }
          },
          (error) => {
            this.notification.create('error', error?.error?.error?.message, '');
          }
        );
      } else {
        this.commonService.addToST('smartdocument', payload)?.subscribe(
          (res: any) => {
            if (res) {
              this.notification.create(
                'success',
                'Your documents will be stored',
                ''
              );
              this.submitted = false
              this.quotationForm.reset()
              this.router.navigate(['/smart-documents/list']);
            }

          },
          (error) => {
            this.notification.create('error', error?.error?.error?.message, '');
          }
        );
      }

    } else {

    }
  }

  currencyRate:any;
  getDefaultExRate() {
    let payload = {
      "fromCurrency": this.currentUser?.currency?.currencyName?.toLowerCase() == 'usd' ? 'INR' : 'USD',
      "toCurrency": this.currentUser?.currency?.currencyName?.toLowerCase() == 'usd' ? 'USD' : 'INR',
    }
    this.commonService.getExchangeRate('exchangeRate', payload)?.subscribe((result) => {
      this.currencyRate = { ...this.currencyRate, [this.currentUser?.currency?.currencyName?.toLowerCase() == 'usd' ? 'INR' : 'USD']: result[this.currentUser?.currency?.currencyName?.toLowerCase() == 'usd' ? 'USD' : 'INR'] }
    })
  }

  buyCurrChange(i) {
    let control = this.quotationForm.controls.products['controls'][i].controls;
    let currencyShortName = this.currencyList?.filter(x => x?.currencyId ==
      control.currency.value)[0]?.currencyShortName;

    let exRate = 0
    if (currencyShortName != this.currentUser?.currency?.currencyName.toUpperCase()) {
      let payload = {
        "fromCurrency": currencyShortName,
        "toCurrency": this.currentUser?.currency?.currencyName.toUpperCase(),
      }

      if (this.currencyRate.hasOwnProperty(currencyShortName)) {
        exRate = this.currencyRate[currencyShortName]
        control.exRate.patchValue(exRate?.toFixed(3))
        this.setRowAmount(i)
      } else {
        this.commonService.getExchangeRate('exchangeRate', payload)?.subscribe((result) => {
          this.currencyRate = { ...this.currencyRate, [currencyShortName]: result[this.currentUser?.currency?.currencyName.toUpperCase()] }
          exRate = result[this.currentUser?.currency?.currencyName.toUpperCase()]
          control.exRate.patchValue(exRate?.toFixed(3))
          this.setRowAmount(i)
        })
      }

    }
    else {
      exRate = 1
      control.exRate.patchValue(exRate?.toFixed(3))
      this.setRowAmount(i)
    }

  }

  setRowAmount(i) { 
    let control = this.quotationForm.controls.products['controls'][i]?.controls; 
    control?.amount?.setValue(control?.price?.value * control?.unitQty?.value * control?.exRate?.value) 
  }
  get totalAmount(): number {
    return this.products?.controls?.reduce((acc, control) => {
      return acc + control?.get('amount')?.value;
    }, 0);
  }

  get totalQty(): number {
    return this.products?.controls?.reduce((acc, control) => {
      return acc + Number(control?.get('unitQty')?.value || 1);
    }, 0);
  }
  get totalNetWt(): number {
    return this.products?.controls?.reduce((acc, control) => {
      return acc + (Number(control?.get('packageQty')?.value || 1) * Number(control?.get('unitQty')?.value || 1) * control?.get('netWt')?.value);
    }, 0);
  }
  get totalGrWt(): number {
    return this.products?.controls?.reduce((acc, control) => {
      return acc + (Number(control?.get('packageQty')?.value || 1) * Number(control?.get('unitQty')?.value || 1) * control?.get('grossWt')?.value);
    }, 0);
  }
  get totalMeasurement(): number {
    return this.products?.controls?.reduce((acc, control) => {
      return acc + (Number(control?.get('packageQty')?.value || 1) * Number(control?.get('unitQty')?.value || 1) * control?.get('measurPackage')?.value);
    }, 0);
  }

  generateRandomCode(inputString?: string): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    if (!inputString) {
      for (let i = 0; i < 7; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
      }
      return result;
    }
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `${inputString}-${randomNum}`;
  }
  
  isEditMode: boolean = false;
  ngOnInit(): void {
    this.selectedDocument = this.route.snapshot.params['key']
    this.getDefaultExRate()
    this.getPortDropDowns()
    this.getLocationDropDowns()
    this.getSystemTypeDropDowns()
    this.getCarriageDropDowns()
    this.getUomList()
    this.CityList()
    this.getCurrency()
    this.costItem()
    if (this.route.snapshot.params['id']) {
      this.isEditMode = true;
      this.getDocuments();
    }
    if (this.currentUser?.uploadStamp) {
      this.downloadFile(this.currentUser.uploadStamp, 'stamp');
      this.companyStampName = this.currentUser.uploadStamp || '';
    }

    if (this.currentUser?.uploadSign) {
      this.downloadFile(this.currentUser.uploadSign, 'email');
      this.companySignName = this.currentUser.uploadSign || '';
    }
  
  }
  downloadFile(documentURL: string, type: 'logo' | 'stamp' | 'email') {
    this.commonService.downloadDocuments('downloadfile', documentURL).subscribe(
      (fileData: Blob) => {
        const objectURL = URL.createObjectURL(fileData);
        const sanitizedURL = this.sanitizer.bypassSecurityTrustUrl(objectURL);
  
       if (type === 'stamp') {
        this.quotationForm.get('signatoryCompany').setValue(this.companyStampName)
          this.companyStampURL = sanitizedURL; // For stamp
        }
        else if (type === 'email') {
          this.quotationForm.get('signatoryCompany1').setValue(this.companySignName)
          this.emailSignatureURL = sanitizedURL; // For stamp
        }
      },
      (error) => {
        console.error(error);
      }
    );
  }
  currencyList: any = []
  getCurrency() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      status: true,
    }
    this.commonService.getSTList("currency", payload)?.subscribe((res: any) => {
      this.currencyList = res?.documents;
    })
  }
  setGSTtoRow(index,flag?: boolean) {
    let control = this.quotationForm.controls.products['controls'][index].controls;
    if (!control || !control.chargeId?.value) return;  
    let data = this.chargeName?.find(x => x?.costitemId === control?.chargeId?.value);
    if (flag && data) {
      control.currency?.setValue(data?.currencyId);
      console.log('Currency set to:', data?.currencyId);
      this.buyCurrChange(index) 
    }
  }

  cityListLand: any = []
  CityList() {
    let payload = this.commonService.filterList()
    if (payload) payload.query = {
      status: true,
    }
    this.commonService.getSTList("city", payload)?.subscribe((data) => {
      this.cityListLand = data.documents || [];
    });
  }
  smartDocDetails: any;
  getDocuments() {
    let payload = this.commonService.filterList()
    payload.query = {
      smartdocumentId: this.route.snapshot.params['id']
    }
    this.commonService.getSTList("smartdocument", payload).subscribe((data) => {
      this.smartDocDetails = data.documents[0]
      this.formBuild(this.smartDocDetails)
    }
    )
  }

  getUomList() {
    let payload = this.commonService.filterList()
    if (payload) payload.query = { 'status': true }
    this.commonService.getSTList('uom', payload)?.subscribe((data) => {
      this.uomData = data.documents;

    });
  }
  getCarriageDropDowns() {
    let payload = this.commonService.filterList()
    if (payload) payload.query = {
      "status": true
    }
    this.commonService.getSTList("partymaster", payload)?.subscribe((res: any) => {
      this.partyList = res?.documents;
    });
  }
  shipmentTypesOriginal: any = [];
  paymentModeList: any = [];
  getSystemTypeDropDowns() {
    let payload = this.commonService.filterList()

    if (payload) payload.query = {
      status: true,
      "typeCategory": {
        "$in": [
          'paymentMode', "carrierType", "shipmentType"
        ]
      }
    }

    this.commonService.getSTList("systemtype", payload)?.subscribe((res: any) => {
      this.paymentModeList = res?.documents?.filter(x => x?.typeCategory === "paymentMode");
      this.dispatchMethods = res?.documents?.filter(x => (x?.typeCategory === "carrierType"));
      this.shipmentTypes = res?.documents?.filter(x => (x?.typeCategory === "shipmentType"));
      this.shipmentTypesOriginal = res?.documents?.filter(x => (x?.typeCategory === "shipmentType"));

    });

  }
  getLocationDropDowns() {
    let payload = this.commonService.filterList()

    if (payload) payload.query = {
      status: true,
      // masterType: {
      //   "$in": ['YARD', 'CFS', 'ICD']
      // },
    }
    this.commonService.getSTList("location", payload)?.subscribe((res: any) => {
      this.places = res?.documents;
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
        this.ports.push({
          portId: x?.portId,
          portName: x?.portDetails?.portName,
          portTypeName: 'port'
        })
      ));


    });
  }

  onCheckboxChange(checkbox: string) {
    if (checkbox === 'method1') {
      if (this.quotationForm.controls['method1'].value) {
        this.quotationForm.controls['method2'].setValue(false);
      }
    } else if (checkbox === 'method2') {
      if (this.quotationForm.controls['method2'].value) {
        this.quotationForm.controls['method1'].setValue(false);
      }
    }
  }

  openSave(content) {
    if (this.quotationForm.valid) {
      this.modalService
        .open(content, {
          backdrop: 'static',
          keyboard: false,
          centered: true,
          size: 'sm',
          ariaLabelledBy: 'modal-basic-title',
        })
    } else {
      this.submitted = true;
      this.notification.create('error', 'Invalid Form', '');
    }

  }
}
