import { Component, OnInit, Output, EventEmitter, Input, ViewChild, HostListener, Pipe, PipeTransform } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FinanceService } from 'src/app/services/Finance/finance.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { CommonService } from 'src/app/services/common/common.service';
import { ApiSharedService } from 'src/app/shared/components/api-service/api-shared.service';
import { differenceInCalendarDays, getDaysInMonth } from 'date-fns';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { format } from 'date-fns'
import { CognitoService } from 'src/app/services/cognito.service';
import { banklist } from 'src/app/models/bank-master';
import { SystemType } from 'src/app/models/cost-items';
import { CargoData } from 'src/app/models/new-invoice';
import { LocationData } from 'src/app/models/city-master'; 
import { EnquiryItem } from 'src/app/models/enquiry';
import { currentTime } from 'src/app/shared/util/date-time';
import { ApiService } from 'src/app/admin/principal/api.service';
import { Batch } from 'src/app/models/charges';
import { forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Currency, partymasterDetail } from 'src/app/admin/party-master/add-party/partyMaster-detail';
import { AddPartyComponent } from 'src/app/admin/party-master/add-party/add-party.component';
interface ConvertedObject {
  [key: string]: string;
}
@Pipe({
  name: "searchfilter"
})
export class SearchFilterPipe implements PipeTransform {
  transform(value: any, args?: any) {
    if (!value) return null;
    if (!args) return value
    args = args.toLowerCase()
    return value.filter(function (item) {
      return JSON.stringify(item).toLowerCase().includes(args)
    })
  }
}
@Component({
  selector: 'app-newinvoice',
  templateUrl: './newinvoice.component.html',
  styleUrls: ['./newinvoice.component.scss']
})
export class NewinvoiceComponent implements OnInit {
  searchText: any;
  type: any = '';
  batchId: any = ''
  @ViewChild("insideVendor") insideVendor;
  @ViewChild("insideVendor1") insideVendor1;
  isExport: boolean = false;
  jmbAmount: number = 0;
  defaultExRate: any = 0;
  containerList: any = [];
  irisResponse: any;
  partyMasterFrom: any = [];
  billToValue: any = '';
  hsnCode: any;
  baseCostItemsCopy: any = [];
  userData: any;
  quotationDetails: any;
  enquiryDetails: any;
  tenantId: any;
  invoiceId: String = "";
  todayDate = new Date();
  currentUrl: string;
  isImport: boolean;
  isTransport: boolean;
  uploadedFileName: any;
  showErrorMsg: any;
  supplierList: any;
  editinvoiceForm: any;
  addblForm: any;
  bookingCancel: any;
  disabledAttachment: any;
  submittedbooking: any;
  row: any;
  countryList: any;
  stateList: any;
  cityList: any;
  callingCodeList: any;
  @HostListener('document:click', ['$event.target'])
  public onClick(targetElement?) {
    if (this.insideVendor || this.insideVendor1) {
      const insideVendor = this.insideVendor?.nativeElement?.contains(targetElement);
      const insideVendor1 = this.insideVendor1?.nativeElement?.contains(targetElement);
      if (insideVendor) {
        this.showTem = true
      }
      if (!insideVendor && !insideVendor1) {
        this.searchText = ''
        this.showTem = false
      }
    }
  }

  @Output() CloseInvoiceSection = new EventEmitter<string>();
  @Input() isType: any = '';
  allInvoicesData = []
  newenquiryForm: FormGroup;
  submitted: boolean;
  urlParam: any;
  isAddMode: any;
  id: any;
  invoiceIdToUpdate: any;
  modalReference: any;
  closeResult: string;
  SAModule: boolean = false;
  filterBody = this.apiService.body
  partyMasterList: any = [];
  shipperaddress: any;
  bankList: banklist[];
  bankDetail: any = [];
  paymentTermList: SystemType[];
  taxApplicabilityList: SystemType[] = [];
  gstInvoiceTypeList: SystemType[] = [];
  gstrList: SystemType[] = [];
  totalAmount: number = 0;
  taxAmount: number = 0;
  billAmount: number = 0;
  costItemList: any = [];
  batchNoList: CargoData[] = [];
  filterBody1 = this.apiService.bodyNew;
  advancePercent = 90;
  AdvanceValue: any = 0;
  invoiceTypeTab: string = '';
  bankModel: any;
  Documentpdf: any;
  invoiceTypeList = []
  baseCostItems: any = [];
  shipperList: any = [];
  blData: any = [];
  viewEdit: boolean = false;
  showTem: boolean = false;
  showDefault: boolean = false;
  sort(array, key) {
    return this.sortPipe.transform(array, key);
  }
  userdetails: any
  currentUser: any
  userCountry: any = ''
  exemp: any;
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notification: NzNotificationService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private commonfunction: CommonFunctions,
    private apiService: ApiSharedService,
    private commonService: CommonService,
    private sortPipe: OrderByPipe,
    private cognito: CognitoService,
    private _api: ApiService,
    private fb: FormBuilder,
  ) {
    this.route.url?.subscribe((url) => {
      this.currentUrl = url.toString();  // This will hold the current URL
    });
    this.isExport = localStorage.getItem('isExport') === 'true' ? true : false;
    this.isImport = localStorage.getItem('isImport') === 'true' ? true : false;
    this.isTransport = localStorage.getItem('isTransport') === 'true' ? true : false;
    this.viewEdit = this.commonfunction.invoiceDisabled;
    let userName;
    this.cognito.getagentDetails()?.subscribe((resp) => {
      if (resp != null) {
        userName = resp?.username;
      }
    })
    this.editinvoiceForm = this.formBuilder.group({
      invoice_no: [''],
      invoice_type: ['', [Validators.required]],
      bill_to: [''],
      billToBranch: [''],
      sez_type: [''],
      coName: [''],
      coAddress: [''],
      tax_applied: [''],
      bill_from: [''],
      billFromBranch: [''],
      gst_number: [''],
      invoice_date: [new Date()],
      payment_terms: [''],
      supplierAddress: [''],
      taxApplicability: [''],
      gst_invoice_type: [''],
      gstr: [''],
      invoice_amount: [''],
      taxAmount: [''],
      billdue_date: [new Date()],
      printBank: [false],
      batchNo: [''],
      shipper: [''],
      consignee: [''],
      bl: [''],
      bank: ['', [Validators.required]],
      bankDetails: [''],
      remark: [''],
      charge: this.fb.array([]),
      holdPosting: [true],
      placeOfSupply: [''],
      isBackDate: [false],
      supplier: [''],
      backDate: [this.endOfMonth(new Date()).toString()]
    });

    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.userdetails = resp.userData
      }
    })
    let payload = this.commonService.filterList()
    payload.query = {
      agentId: this.userdetails?.agentId,
    }

    this.commonService.getSTList('agent', payload).subscribe((data: any) => {
      this.currentUser = data.documents[0]
      this.userCountry = this.currentUser?.addressInfo?.countryName
    })
  }
  isIndian() {
    if (this.userCountry.toLowerCase() === 'india') {
      return true
    }
    else {
      return false
    }
  }
  ngOnInit(): void {
    this.route.params?.subscribe((params) => (this.urlParam = params));
    this.currentUrl = this.router.url?.split('?')[0].split('/')[3]

    if (this.currentUrl === 'show') {
      this.editinvoiceForm.disable();
      const chargeArray = this.editinvoiceForm.get('charge') as FormArray;
      chargeArray.controls.forEach(control => {
        control.disable(); // Disable each control in the FormArray
      });
    }
    this.type = this.route.snapshot?.queryParamMap.get('type')?.toString();
    this.batchId = this.route.snapshot?.params['id'];

    this.id = this.route.snapshot?.params['moduleId'];

    // this.editinvoiceForm = this.fb.group({
    //   charge: this.fb.array([])
    // });
    this.cognito.userdetails$?.subscribe((resp) => {
      if (resp != null) {
        this.userData = resp
      }
    })
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.tenantId = resp.tenantId
      }
    })
    this.isAddMode = !this.id;
    this.getSystemTypeDropDowns();
    this.getBankList(this.quotationDetails?.branchId);
    if (this.type !== 'saleInvoice' && this.type !== 'purchaseInvoice' && this.type !== 'buyerInvoice') {
      this.getblData()
    }
   
      this.getSupplierParty()
  
    this.getCurrencyDropDowns();
    this.costItem();
    this.getBranchList()
    this.getPartyList()
    this.getBatchList();
    // if (this.route.snapshot.params['moduleId']) {
    //   this.getInvoiceDetailsById(this.route.snapshot.params['moduleId']);
    // }
    // if (this.viewEdit) {
    //   this.editinvoiceForm.disable()
    // }

    if (this.type == 'sallerInvoice' && !this.isTransport) {
      // this.editinvoiceForm.controls['bl'].setValidators(Validators.required)
      // this.editinvoiceForm.controls['bl'].updateValueAndValidity()
    }
    else {
      this.editinvoiceForm.controls['bl'].clearValidators()
      this.editinvoiceForm.controls['bl'].updateValueAndValidity()
    }

    if (this.type == 'buyerInvoice') {
      this.editinvoiceForm.controls['bill_from'].setValidators(Validators.required)
      this.editinvoiceForm.controls['bill_from'].updateValueAndValidity()
      this.editinvoiceForm.controls['billFromBranch'].setValidators(Validators.required)
      this.editinvoiceForm.controls['billFromBranch'].updateValueAndValidity()
      this.editinvoiceForm.controls['bank'].clearValidators()
      this.editinvoiceForm.controls['bank'].updateValueAndValidity()
      this.editinvoiceForm.controls['bill_to'].clearValidators()
      this.editinvoiceForm.controls['bill_to'].updateValueAndValidity()
      this.editinvoiceForm.controls['billToBranch'].clearValidators()
      this.editinvoiceForm.controls['billToBranch'].updateValueAndValidity()
    }
    else {
      this.editinvoiceForm.controls['billToBranch'].setValidators(Validators.required)
      this.editinvoiceForm.controls['billToBranch'].updateValueAndValidity()
      this.editinvoiceForm.controls['billFromBranch'].clearValidators()
      this.editinvoiceForm.controls['billFromBranch'].updateValueAndValidity()
      this.editinvoiceForm.controls['bill_to'].setValidators(Validators.required)
      this.editinvoiceForm.controls['bill_to'].updateValueAndValidity()
      this.editinvoiceForm.controls['bank'].setValidators(Validators.required)
      this.editinvoiceForm.controls['bank'].updateValueAndValidity()
      this.editinvoiceForm.controls['bill_from'].clearValidators()
      this.editinvoiceForm.controls['bill_from'].updateValueAndValidity()
    }
  }

  gstAmount(data) {
    let amount = data?.rate * data?.quantity || 1
    if (data?.currency?.toLowerCase === 'inr') {
      return Number((amount * data?.gst * Number(data?.exchangeRate) / 100).toFixed(0))
    } else {
      return Number((((amount * Number(data?.exchangeRate)) * data?.gst / 100)).toFixed(0))
    }
  }

  batchDetails: Batch;
  batch_ID: any;
  deleteCharge(content1, data: any, index) {
    this.modalService.open(content1, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: '',
      ariaLabelledBy: 'modal-basic-title'
    }).result.then((result) => {

      if (result === 'yes') {
        if (data.value.enquiryitemId !== null && data.value.enquiryitemId !== '') {
          let payload = {
            enquiryitemId: data.value.enquiryitemId,
            searchKey: "enquiryitemId"
          }
          if (false) {
            this.commonService.deleteST(`enquiryitem/${payload.enquiryitemId}`)?.subscribe((res: any) => {
              this.notification.create(
                'success',
                'Deleted Successfully',
                ''
              );
              this.calcBuyAMT(0)
            })
          } else {
            this.notification.create(
              'success',
              'Deleted Successfully',
              ''
            );
            this.calcBuyAMT(0)
          }


        }
        else {
          this.notification.create(
            'success',
            'Deleted Successfully',
            ''
          );
        }
        (this.editinvoiceForm.get('charge') as FormArray).removeAt(index);

        this.calcBuyAMT(0)
        // const itemData = this.costItemList?.filter(
        //   (item) => item !== data
        // );
        // this.costItemList = itemData;
        // this.SaveCharge.emit(this.costItemList);
      }
    });



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
  costItem() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      "status": true,
    }
    this.commonService.getSTList('costitem', payload)?.subscribe((data) => {
      this.chargeName = data.documents;

    });
  }


  chargeName: any;
  chargeBasic: SystemType[];
  currencyList: any;
  chargeTermList: SystemType[];
  saveCharge(res) {
    this.submitted = true

    let dataUpdate = [];
    let dataInsert = [];
    this.getChargeControls().forEach(element => {
      if (element.value.enquiryitemId == '' || element.value.enquiryitemId == null) {
        let charge = {
          batchId: this.route.snapshot.params['id'],
          enquiryId: '',
          batchNo: this.batchDetails?.batchNo || '',
          collectPort: this.batchDetails?.enquiryData?.loadPortName || '',
          quotationId: this.batchDetails.quotationId,
          agentadviceId: this.batchDetails?.agentadviceId,
          containerType: this.batchDetails?.enquiryData?.container_type || '',
          vesselName: this.batchDetails?.routeDetails?.finalVesselName?.toString() || '',
          voyageName: this.batchDetails?.routeDetails?.finalVoyageName?.toString() || '',
          moveNumber: this.batchDetails?.moveNo?.toString() || '',
          enquiryNumber: (this.isExport || this.isTransport) ? this.batchDetails?.enquiryNo : this.batchDetails?.uniqueRefNo,
          enqDate: this.batchDetails?.basicDetails?.enquiryDate || '',
          stcQuotationNo: this.batchDetails?.stcQuotationNo?.toString() || '',
          enqType: this.batchDetails?.basicDetails?.enquiryTypeId || '',
          "tenantId": this.tenantId,
          "enquiryitemId": element.value.enquiryitemId ? element.value.enquiryitemId : "",
          "costitemGroup": element.value?.costitemGroup || '',
          "costItemId": element.value.chargeName || '',
          "accountBaseCode": element.value.accountBaseCode?.toString() || "",
          "costItemName": this.chargeName?.filter(x => x?.costitemId === element.value.chargeName)[0]?.costitemName,
          "costHeadId": element.value.costHeadId || '',
          "costHeadName": element.value.costHeadName || '',
          "exchangeRate": element.value.exchangeRate || '',
          "currency": element.value.currency || '',
          "amount": element.value.amount || '',
          "baseAmount": element.value.baseAmount || '',
          "basic": this.chargeBasic.filter((x) => x?.systemtypeId == element.value.basic)[0]?.typeName || '',
          "basicId": element.value.basic || '',
          "tenantMargin": element.value.margin || 0,

          invoiceStatus: res?.invoiceStatus,
          "buyEstimates": {
            "currencyId": element.value.currencyBuy || '',
            "currency": this.currencyList?.filter(x => x?.currencyId ==
              element.value.currencyBuy)[0]?.currencyShortName?.toUpperCase() || '',
            "exChangeRate": Number(element.value.buyExRate) || 0,
            "rate": element.value.buyRate || 0,
            "taxableAmount": element.value.buyTaxable || 0,
            "amount": element.value.buyTotal || 0,
            "totalAmount": element.value.buyTotalINR || 0,
            "terms": element.value.buyTerm || '',
            "supplier": element.value.supplier || '',
            "igst": element.value.buyIgst || 0,
            "cgst": element.value.buyCgst || 0,
            "sgst": element.value.buySgst || 0,
            buyerInvoice: this.type === 'buyerInvoice' || this.type === 'salelInvoice' || this.type === 'purchaseInvoice' ? true : false,
            invoiceNo: this.type === 'buyerInvoice' ? res?.invoiceNo : element?.value?.buyInvoice || null,
            invoiceId: this.type === 'buyerInvoice' ? res?.invoiceId : element?.value?.buyInvoiceId || null,
            isInvoiceCreated: this.type === 'buyerInvoice' ? true : element.value.buyisInvoiceCreated || false,
          },
          "selEstimates": {
            sellerInvoice: this.type === 'sellerInvoice' ? true : false,
            "currencyId": element.value.currencySell || '',
            "currency": this.currencyList?.filter(x => x?.currencyId ==
              element.value.currencySell)[0]?.currencyShortName?.toUpperCase() || '',
            "taxableAmount": element.value.sellTaxable || 0,
            "exChangeRate": Number(element.value.sellExRate) || 0,
            "rate": element.value.sellRate || 0,
            "amount": element.value.sellTotal || 0,
            "totalAmount": element.value.sellTotalINR || 0,
            "terms": element.value.sellTerm || '',
            "remarks": element.value.remarks || '',
            "igst": element.value.sellIgst || 0,
            "cgst": element.value.sellCgst || 0,
            "sgst": element.value.sellSgst || 0,
            invoiceNo: this.type === 'sellerInvoice' ? res?.invoiceNo : element?.value?.sellInvoice || null,
            invoiceId: this.type === 'sellerInvoice' ? res?.invoiceId : element?.value?.sellInvoiceId || null,
            isInvoiceCreated: this.type === 'sellerInvoice' ? true : element.value.sellisInvoiceCreated || false,
          },
          "tax": [
            {
              taxAmount: Math.round(Number(element.value.taxAmount)) || 0,
              taxRate: Number(element.value.gst)
            }
          ],
          "quantity": element.value.quantity ? element.value.quantity : '1',
          "rate": element.value.rate ? Math.round(element.value.rate) : 0,
          "stcAmount": element.value.stcAmount ? Math.round(element.value.stcAmount) : 0,
          "jmbAmount": element.value.jmbAmount ? Math.round(element.value.jmbAmount) : 0,
          "payableAt": element.value.payableAt ? element.value.payableAt : "",
          "gst": Number(element.value.gst) || 0,
          "gstType": element.value.gstType || 'igst',
          "totalAmount": Math.round(element.value.totalAmount) || 0,
          "chargeTerm": element.value.chargeTerm || '',
          "remarks": element.value.remarks ? element.value.remarks : "",
          "containerNumber": element.value.containerNumber || [],
          "shippingLine": element.value.shippingLine || "",
          "taxApplicability": element.value.taxApplicability || "",
          "hsnCode": this.chargeName?.filter(
            (x) =>
              x?.costitemId ==
              element.value.chargeName
          )[0]?.hsnCode?.toString() || '',
          "isPrincipleCreated": element.value.isPrincipleCreated || false,
          "isEnquiryCharge": false,
          "isReceiptCreated" : element.value.isReceiptCreated || false,
        }
        dataInsert.push(charge)
      } else {
        let charge = {
          batchId: this.route.snapshot.params['id'],
          enquiryId: '',
          batchNo: this.batchDetails?.batchNo || '',
          collectPort: this.batchDetails?.enquiryData?.loadPortName || '',
          containerType: this.batchDetails?.enquiryData?.container_type || '',
          vesselName: this.batchDetails?.routeDetails?.finalVesselName?.toString() || '',
          quotationId: this.batchDetails.quotationId,
          agentadviceId: this.batchDetails?.agentadviceId,
          voyageName: this.batchDetails?.routeDetails?.finalVoyageName?.toString() || '',
          moveNumber: this.batchDetails?.moveNo?.toString() || '',
          enquiryNumber: (this.isExport || this.isTransport) ? this.batchDetails?.enquiryNo : this.batchDetails?.uniqueRefNo,
          enqDate: this.batchDetails?.basicDetails?.enquiryDate || '',
          stcQuotationNo: this.batchDetails?.stcQuotationNo?.toString() || '',
          enqType: this.batchDetails?.basicDetails?.enquiryTypeId || '',
          "tenantId": this.tenantId,
          "enquiryitemId": element.value.enquiryitemId ? element.value.enquiryitemId : "",
          "costitemGroup": element.value?.costitemGroup || '',
          "costItemId": element.value.chargeName || '',
          "accountBaseCode": element.value.accountBaseCode?.toString() || "",
          "costItemName": this.chargeName?.filter(x => x?.costitemId === element.value.chargeName)[0]?.costitemName,
          "costHeadId": element.value.costHeadId || '',
          "costHeadName": element.value.costHeadName || '',
          "exchangeRate": element.value.exchangeRate || '',
          "currency": element.value.currency || '',
          "amount": element.value.amount || '',
          "baseAmount": element.value.baseAmount || '',
          "basic": this.chargeBasic.filter((x) => x?.systemtypeId == element.value.basic)[0]?.typeName || '',
          "basicId": element.value.basic || '',
          "tenantMargin": element.value.margin || 0,
          invoiceNo: res?.invoiceNo || '',
          isInvoiceCreated: true,
          invoiceStatus: res?.invoiceStatus,
          "buyEstimates": {
            "currencyId": element.value.currencyBuy || '',
            "currency": this.currencyList?.filter(x => x?.currencyId ==
              element.value.currencyBuy)[0]?.currencyShortName?.toUpperCase() || '',
            "exChangeRate": Number(element.value.buyExRate) || 0,
            "rate": element.value.buyRate || 0,
            "amount": element.value.buyTotal || 0,
            "taxableAmount": element.value.buyTaxable || 0,
            "totalAmount": element.value.buyTotalINR || 0,
            "terms": element.value.buyTerm || '',
            "supplier": element.value.supplier || '',
            "igst": element.value.buyIgst || 0,
            "cgst": element.value.buyCgst || 0,
            "sgst": element.value.buySgst || 0,
            invoiceNo: this.type == 'buyerInvoice' ? res?.invoiceNo : element?.value?.buyInvoice || null,
            invoiceId: this.type == 'buyerInvoice' ? res?.invoiceId : element?.value?.buyInvoiceId || null,
            isInvoiceCreated: this.type === 'buyerInvoice' ? true : element?.value?.buyisInvoiceCreated || false,
            buyerInvoice: this.type === 'buyerInvoice' || this.type === 'salelInvoice' || this.type === 'purchaseInvoice' ? true : false,
            isReceiptCreated:   element.value.isReceiptCreatedBuy || false ,

          },
          "selEstimates": {
            "currencyId": element.value.currencySell || '',
            "currency": this.currencyList?.filter(x => x?.currencyId ==
              element.value.currencySell)[0]?.currencyShortName?.toUpperCase() || '',
            "taxableAmount": element.value.sellTaxable || 0,
            "exChangeRate": Number(element.value.sellExRate) || 0,
            "rate": element.value.sellRate || 0,
            "amount": element.value.sellTotal || 0,
            "totalAmount": element.value.sellTotalINR || 0,
            "terms": element.value.sellTerm || '',
            "remarks": element.value.remarks || '',
            "igst": element.value.sellIgst || 0,
            "cgst": element.value.sellCgst || 0,
            "sgst": element.value.sellSgst || 0,
            invoiceNo: this.type === 'sellerInvoice' ? res?.invoiceNo : element?.value?.sellInvoice || null,
            invoiceId: this.type === 'sellerInvoice' ? res?.invoiceId : element?.value?.sellInvoiceId || null,
            isInvoiceCreated: this.type === 'sellerInvoice' ? true : element.value.sellisInvoiceCreated || false,
            sellerInvoice: this.type === 'sellerInvoice' ? true : false,
            isReceiptCreated:    element.value.isReceiptCreatedSell || false , 
          },
          "tax": [
            {
              taxAmount: Math.round(Number(element.value.taxAmount)) || 0,
              taxRate: Number(element.value.gst)
            }
          ],
          "quantity": element.value.quantity ? element.value.quantity : '1',
          "rate": element.value.rate ? Math.round(element.value.rate) : 0,
          "stcAmount": element.value.stcAmount ? Math.round(element.value.stcAmount) : 0,
          "jmbAmount": element.value.jmbAmount ? Math.round(element.value.jmbAmount) : 0,
          "payableAt": element.value.payableAt ? element.value.payableAt : "",
          "gst": Number(element.value.gst) || 0,
          "gstType": element.value.gstType || 'igst',
          "totalAmount": Math.round(element.value.totalAmount) || 0,
          "chargeTerm": element.value.chargeTerm || '',
          "remarks": element.value.remarks ? element.value.remarks : "",
          "containerNumber": element.value.containerNumber || [],
          "shippingLine": element.value.shippingLine || "",
          "taxApplicability": element.value.taxApplicability || "",
          "hsnCode": this.chargeName?.filter(
            (x) =>
              x?.costitemId ==
              element.value.chargeName
          )[0]?.hsnCode?.toString() || '',

          "isPrincipleCreated": element.value.isPrincipleCreated || false,
          "isEnquiryCharge": element.value.isEnquiryCharge || false,
          "isReceiptCreated" : element.value.isReceiptCreated || false,
        }
        dataUpdate.push(charge)
      }


    });
    let forkArray = []
    if (dataInsert.length > 0) {
      forkArray.push(this.commonService
        .batchInsert('enquiryitem/batchinsert', dataInsert))
    }
    if (dataUpdate.length > 0) {
      forkArray.push(this.commonService
        .batchUpdate('enquiryitem/batchupdate', dataUpdate))
    }


    if (forkArray.length == 2) {
      forkJoin(forkArray)
        .pipe(
          switchMap((firstResponse: any, secondResponse: any) => {
            const firstItems = Array.isArray(firstResponse[0]) ? firstResponse[0] : [];
            const secondItems = Array.isArray(firstResponse[1]) ? firstResponse[1] : [];

            return this.commonService.UpdateToST(`invoice/${res?.invoiceId}`, {
              ...res,
              costItems: [...firstItems, ...secondItems] // Merging safely
            });
          })
        ).subscribe();
    }
    if (forkArray.length == 1) {
      forkJoin(forkArray)
        .pipe(
          switchMap((firstResponse: any) => {
            // Use firstResponse and secondResponse here as expected types
            return this.commonService.UpdateToST(`invoice/${res?.invoiceId}`, {
              ...res,
              costItems: firstResponse[0]
            });
          })
        ).subscribe();
    }


    this.submitted = false
    this.commonService.UpdateToST(`batch/${this.batchDetails?.batchId}`, { ...this.batchDetails, amount: Number(this.sellTotal) || 0 })?.subscribe()


  }

  sellCurrChange(i) {
    let control = this.editinvoiceForm.controls.charge['controls'][i].controls
    // let exRate = this.currencyList?.filter(x => x?.currencyId ==
    //   control.currencySell.value)[0]?.currencyPair || 1

    // control.sellExRate?.setValue(exRate) 

    let defaultCurrency = this.batchDetails?.quotationDetails?.currencyShortName
    let currencyShortName = this.currencyList?.filter(x => x?.currencyId ==
      control.currencySell.value)[0]?.currencyShortName
    let exRate = 0

    if (currencyShortName != defaultCurrency) {
      let payload = {
        "fromCurrency": currencyShortName,
        "toCurrency": defaultCurrency,
      }

      this.commonService.getExchangeRate('exchangeRate', payload).subscribe((result) => {

        exRate = result[defaultCurrency]
        control.sellExRate?.setValue(exRate?.toFixed(3))
        this.calcBuyAMT(i)
      })
    }
    else {
      exRate = 1
      control.sellExRate?.setValue(exRate?.toFixed(3))
      this.calcBuyAMT(i)
    }


  }
  onClose() {
    this.router.navigate([`/batch/list/add/${this.batchDetails?.batchId}/invoice`]);
  }
  enquiryRateList: any = [];
  setGSTtoRow(i) {

    let control = this.editinvoiceForm.controls.charge['controls'][i].controls;

    // Filter and get the corresponding data based on the selected chargeName
    let data = this.chargeName?.filter(x => x?.costitemId === control.chargeName.value)[0];

    let noContainer = 0;

    // Calculate container quantity if charge type is container-based
    if (data?.chargeTypeName?.toLowerCase() === 'container charge' || data?.chargeTypeName?.toLowerCase() === 'container') {
      this.enquiryRateList[0]?.containersDetails?.forEach((c) => {
        noContainer += Number(c.noOfContainer || 1);
      });
      control.quantity.setValue(noContainer || 1);
    } else {
      control.quantity.setValue(1);
    }

    // Set the GST and basic charge
    control.gst.setValue(data?.gst || 0);  // Ensure GST is set correctly
    control.hsnCode.setValue(data?.hsnCode || "")
    control.basic.setValue(data?.chargeType || '');

    // Recalculate the amounts
    this.calcBuyAMT(i);
  }

  getChargeControlsLength(): number {
    return (this.editinvoiceForm.get('charge') as FormArray).length;
  }
  getChargeControls() {
    return (this.editinvoiceForm.get('charge') as FormArray).controls;
  }
  isViewMode(): boolean {
    return this.currentUrl.includes('show');
  }
  addChargeRow(item?: any, i?): void {
    const row = this.formBuilder.group({

      enquiryitemId: [item ? item.enquiryitemId : ''],

      chargeName: [item ? item.costItemId : null, Validators.required],
      basic: [item ? item.basicId : null],
      quantity: [item ? item.quantity : null, Validators.required],

      gst: [item ? item.gst || 0 : 0],
      gstType: [item ? item.gstType || this.gstType : this.gstType],
      currencyBuy: [item ? item.buyEstimates?.currencyId : null, this.type === 'buyerInvoice' ? Validators.required : ''],
      buyRate: [item ? item.buyEstimates?.rate : null],
      buyTotal: [item ? item.buyEstimates?.amount : null],
      buyExRate: [item ? item.buyEstimates?.exChangeRate : null],
      buyTaxable: [item ? item.buyEstimates?.taxableAmount : 0],
      hsnCode: [item ? item.hsnCode : ''],
      buyIgst: [item ? item.buyEstimates?.igst : null],
      buyCgst: [item ? item.buyEstimates?.cgst : null],
      buySgst: [item ? item.buyEstimates?.sgst : null],
      buyTotalINR: [item ? item.buyEstimates?.totalAmount : 0],
      buyInvoice: [item ? item?.buyEstimates?.invoiceNo : null],
      buyInvoiceId: [item ? item?.buyEstimates?.invoiceId : null],
      buyTerm: [item ? item.buyEstimates?.terms : null],
      supplier: [item ? item.buyEstimates?.supplier : this.editinvoiceForm.value.bill_from ? this.editinvoiceForm.value.bill_from : null],
      buyerInvoice: [item ? item.buyEstimates?.buyerInvoice : null],

      isReceiptCreatedBuy: [item ? item.buyEstimates?.isReceiptCreated : false],
      isReceiptCreatedSell: [item ? item.selEstimates?.isReceiptCreated : false],

      buyisInvoiceCreated: [item ? item.buyEstimates?.isInvoiceCreated : false],
      sellisInvoiceCreated: [item ? item.selEstimates?.isInvoiceCreated : false],
      currencySell: [item ? item.selEstimates?.currencyId : null, this.type === 'sellerInvoice' ? Validators.required : ''],
      sellRate: [item ? item.selEstimates?.rate : null],
      sellTotal: [item ? item.selEstimates?.amount : null],
      sellExRate: [item ? item.selEstimates?.exChangeRate : null],

      sellTaxable: [item ? item.selEstimates?.taxableAmount : 0],
      sellIgst: [item ? item.selEstimates?.igst : null],
      sellCgst: [item ? item.selEstimates?.cgst : null],
      sellSgst: [item ? item.selEstimates?.sgst : null],

      sellTotalINR: [item ? item.selEstimates?.totalAmount : 0],
      sellInvoice: [item ? item?.selEstimates?.invoiceNo : null],
      sellInvoiceId: [item ? item?.selEstimates?.invoiceId : null],
      sellTerm: [item ? item.selEstimates?.terms : null],
      remarks: [item ? item.selEstimates?.remarks : null],
      sellerInvoice: [item ? item.selEstimates?.sellerInvoice : null],

      margin: [item ? item.tenantMargin || 0 : 0],
      isEnquiryCharge: [item ? item.isEnquiryCharge : false],
      isReceiptCreated : [item ? item.isReceiptCreated : false],
      isInvoiceCreated: [item ? item.isInvoiceCreated : false],

      invoiceId: [item ? item.invoiceId : ''],
      invoiceNo: [item ? item.invoiceNo : ''],
      amount: [item ? item.amount : ''],
      moveNumber: [item ? item.moveNumber : ''],
      isPrincipleCreated: [item ? item.isPrincipleCreated : false],

      invoiceStatus: [item ? item?.invoiceStatus : null]

    });

    (this.editinvoiceForm.get('charge') as FormArray).push(row);

    if (this.currentUrl == 'show') {
      const controls = (this.editinvoiceForm.get('charge') as FormArray).controls;
      controls.forEach((element) => {
        element.disable();
      });
    }

    if (i > -1) {
      this.setGSTtoRow(i)
      this.sellCurrChange(i)
      this.buyCurrChange(i)
      this.setQuantity(i)
      this.calcBuyAMT(i)
    }

  }
  buyCurrChange(i) {
    let control = this.editinvoiceForm.controls.charge['controls'][i].controls

    let defaultCurrency = this.batchDetails?.quotationDetails?.currencyShortName
    let currencyShortName = this.currencyList?.filter(x => x?.currencyId ==
      control.currencyBuy.value)[0]?.currencyShortName
    let exRate = 0

    if (currencyShortName != defaultCurrency) {
      let payload = {
        "fromCurrency": currencyShortName,
        "toCurrency": defaultCurrency,
      }

      this.commonService.getExchangeRate('exchangeRate', payload).subscribe((result) => {

        exRate = result[defaultCurrency]
        control.buyExRate?.setValue(exRate?.toFixed(3))
        this.calcBuyAMT(i)
        // control.sellExRate?.setValue(exRate) 
      })
    }
    else {
      exRate = 1
      control.buyExRate?.setValue(exRate?.toFixed(3))
      this.calcBuyAMT(i)
      // control.sellExRate?.setValue(exRate) 
    }


  }
  setQuantity(i) {
    let control = this.editinvoiceForm.controls.charge['controls'][i].controls;
    let data = this.chargeBasic?.filter(x => x?.systemtypeId === control.basic.value)[0];
    let noContainer = 0
    if (data?.typeName?.toLowerCase() == 'container charge' || data?.typeName?.toLowerCase() == 'container') {
      this.enquiryRateList[0]?.containersDetails.filter((c) => {
        noContainer += Number(c.noOfContainer || 0)
      })
      control.quantity.setValue(noContainer || 1)
    } else {
      control.quantity.setValue(1)
    }
    this.calcBuyAMT(i)
  }
  buyTotal = 0;
  sellTotal = 0
  isNegative: boolean = false;
  calcBuyAMT(i?) {
    this.billAmount = 0;
    this.buyTotal = 0;
    this.sellTotal = 0;
    this.taxAmount = 0;
    
    if (i >= 0) {
      let control = this.editinvoiceForm.controls.charge['controls'][i].controls
      control.buyTotal.setValue(Number((control.buyRate.value * control.quantity.value).toFixed(2)))
      control.buyTaxable.setValue(Number((Number(control.buyExRate?.value) * Number(control.buyRate.value) * Number(control.quantity.value)).toFixed(2)))

      control.sellTotal.setValue(Number((Number(control.sellRate.value) * Number(control.quantity.value)).toFixed(2)))
      control.sellTaxable.setValue(Number((Number(control.sellExRate?.value) * Number(control.sellRate.value) * Number(control.quantity.value)).toFixed(2)))

      let gstBuyValue = Number((Number(control.buyTaxable.value) * Number(control.gst.value)) / 100)
      let gstSellValue = Number((Number(control.sellTaxable.value) * Number(control.gst.value)) / 100)

      control.buyIgst.setValue(Number((gstBuyValue).toFixed(2)))
      control.buyCgst.setValue(Number((gstBuyValue / 2).toFixed(2)))
      control.buySgst.setValue(Number((gstBuyValue / 2).toFixed(2)))

      control.sellIgst.setValue(Number((gstSellValue).toFixed(2)))
      control.sellCgst.setValue(Number((gstSellValue / 2).toFixed(2)))
      control.sellSgst.setValue(Number((gstSellValue / 2).toFixed(2)))

      control.buyTotalINR.setValue(Number((gstBuyValue + control.buyTaxable.value).toFixed(2)))
      control.sellTotalINR.setValue(Number((gstSellValue + control.sellTaxable.value).toFixed(2)))
      control.margin.setValue(Number((control.sellTotalINR.value - control.buyTotalINR.value).toFixed(2)))

      this.editinvoiceForm.controls.charge['controls'].forEach(element => {
        this.buyTotal += element.controls.buyTotalINR.value || 0
        this.sellTotal += element.controls.sellTotalINR.value || 0

        if (this.type === 'sellerInvoice') {
          this.billAmount += Number(element.controls.sellTotalINR.value || 0)
          this.totalAmount += Number(element.controls.sellTotalINR.value || 0);
          this.taxAmount += Number(element.controls.sellIgst.value || 0);
        }
        else {
          this.billAmount += Number(element.controls.buyTotalINR.value || 0)
          this.totalAmount += Number(element.controls.buyTotalINR.value || 0);
          this.taxAmount += Number(element.controls.buyIgst.value || 0);
        }
      });
    }
    this.editinvoiceForm.controls.taxAmount.setValue(this.taxAmount?.toFixed(2));
    this.editinvoiceForm.controls.invoice_amount.setValue(this.billAmount?.toFixed(2));
    this.isNegative = (this.sellTotal - this.buyTotal) < 0;
  }
  branchList: any = []
  getBranchList() {
    let payload = this.commonService.filterList()
    payload.query = {
      status: true,
    }
    this.commonService.getSTList('branch', payload)
      .subscribe((data) => {
        this.branchList = data.documents;
        // this.getBatchList()
      });
  }
  onFileSelected(event, type, index) {
    const file = event.target.files[0];
    let fileName = file.name;
    this.showErrorMsg = type;
    this.uploadedFileName = fileName;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', fileName);
    this.commonService.uploadDocuments('uploadfile', formData)?.subscribe((res) => {
      this.editinvoiceForm.get(type).setValue(res.name);
      const decodedName = decodeURIComponent(res.name);
      this.editinvoiceForm.get(`${type}Name`).setValue(decodedName);
    });
  }
  getContainerList() {
    let payload = this.commonService.filterList()
    payload.query = {
      batchId: this.route.snapshot.params['id'],
    }

    this.commonService.getSTList('container', payload)
      .subscribe((data: any) => {
        let dataContainer = [];
        data.documents.forEach((element) => {
          if (element?.containerNumber) {
            dataContainer.push(element?.containerNumber);
          }
        });
        this.containerList = dataContainer;

      });
  }
  get f() {
    return this.editinvoiceForm.controls;
  }
  endOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 0);
  }

  deletetable(Deletetable) {
    this.modalService.open(Deletetable, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'sm',

      ariaLabelledBy: 'modal-basic-title'
    })
  }
  getSupplierParty() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      "status": true,
      "isSupplier": true
    }
    this.commonService.getSTList('partymaster', payload)?.subscribe((res: any) => {
      this.supplierList = res?.documents
    })
  }
  deleteContainer(data: any) {
    this.allInvoicesData = this.allInvoicesData.filter(
      item => item !== data);
    this.notification.create('success', 'Deleted Successfully', '');
  }

  convertDate(e) {
    var date = new Date(e)
    return format(date, "dd-MM-yyyy")
  }

  onSave(evt, flag) {
    this.submitted = true;
    if (this.editinvoiceForm.value.invoice_amount === 0 || !this.editinvoiceForm.value.invoice_amount) {
      this.notification.create('error', 'Please select charge', '');
      return false
    }

    if ((this.editinvoiceForm.get('charge') as FormArray).invalid) {
      this.notification.create('error', 'Please fill charge table fields', '');
      return false;
    }

    if (this.quotationDetails?.branchStateCode == this.enquiryDetails?.basicDetails?.billingStateCode) {
      this.isGSTinState = true
    } else {
      this.isGSTinState = false
    }


    let shipperData;
    let userData;
    if (this.type === 'buyerInvoice') {
      shipperData = this.supplierList?.find(x => x.partymasterId === this.editinvoiceForm.value.bill_from) || '';
      userData = shipperData.branch?.filter(x => x.branch_name === this.editinvoiceForm.value.billFromBranch)[0] || ''

    } else {
      shipperData = this.shipperList?.find(x => x.partymasterId === this.editinvoiceForm.value.bill_to) || '';
      userData = this.branchList?.find(x => x.branchId === this.editinvoiceForm.value.billToBranch) || ''

    }


    const chargeArray = [];
    this.getChargeControls().forEach(element => {
      let charge = {
        "tenantId": this.userData.tenantId,
        "enquiryitemId": element.value.enquiryitemId ? element.value.enquiryitemId : "",
        "quotationId": this.quotationDetails?.quotationId || '',
        "enqDate": new Date() || '',
        batchId: this.route.snapshot.params['id'],
        enquiryId: '',
        batchNo: this.batchDetails?.batchNo || '',
        collectPort: this.batchDetails?.enquiryData?.loadPortName || '',
        containerType: this.batchDetails?.enquiryData?.container_type || '',
        vesselName: this.batchDetails?.routeDetails?.finalVesselName?.toString() || '',
        agentadviceId: this.batchDetails?.agentadviceId,
        voyageName: this.batchDetails?.routeDetails?.finalVoyageName?.toString() || '',
        moveNumber: this.batchDetails?.moveNo?.toString() || '',
        enquiryNumber: (this.isExport || this.isTransport) ? this.batchDetails?.enquiryNo : this.batchDetails?.uniqueRefNo,
        stcQuotationNo: this.batchDetails?.stcQuotationNo?.toString() || '',
        "costitemGroup": element.value?.costitemGroup || '',
        "enqType": 'Export',
        "costItemId": element.value.chargeName || '',
        "accountBaseCode": element.value.accountBaseCode?.toString() || "",
        "costItemName": this.chargeName?.filter(x => x?.costitemId === element.value.chargeName)[0]?.costitemName,
        "costHeadId": element.value.costHeadId || '',
        "costHeadName": element.value.costHeadName || '',
        "exchangeRate": element.value.exchangeRate || '',
        "currency": element.value.currency || '',
        "amount": element.value.amount || '',
        "baseAmount": element.value.baseAmount || '',
        "basic": this.chargeBasic?.filter((x) => x?.systemtypeId == element.value.basic)[0]?.typeName || '',
        "basicId": element.value.basic || '',
        "tenantMargin": element.value.margin || 0,
        "buyEstimates": {
          "currencyId": element.value.currencyBuy || '',
          "currency": this.currencyList?.filter(x => x?.currencyId ==
            element.value.currencyBuy)[0]?.currencyShortName?.toUpperCase() || '',
          "exChangeRate": element.value.buyExRate || 0,
          "rate": element.value.buyRate || 0,
          "amount": element.value.buyTotal || 0,
          "taxableAmount": element.value.buyTaxable || 0,
          "totalAmount": element.value.buyTotalINR || 0,
          "terms": element.value.buyTerm || '',
          "supplier": element.value.supplier || '',
          "igst": element.value.buyIgst || 0,
          "cgst": element.value.buyCgst || 0,
          "sgst": element.value.buySgst || 0,

        },
        "selEstimates": {
          "currencyId": element.value.currencySell || '',
          "currency": this.currencyList?.filter(x => x?.currencyId ==
            element.value.currencySell)[0]?.currencyShortName?.toUpperCase() || '',

          "exChangeRate": element.value.sellExRate || 0,
          "rate": element.value.sellRate || 0,
          "amount": element.value.sellTotal || 0,
          "taxableAmount": element.value.sellTaxable || 0,
          "totalAmount": element.value.sellTotalINR || 0,
          "terms": element.value.sellTerm || '',
          "remarks": element.value.remarks || '',
          "igst": element.value.sellIgst || 0,
          "cgst": element.value.sellCgst || 0,
          "sgst": element.value.sellSgst || 0,
        },
        "tax": [
          {
            taxAmount: Math.round(Number(element.value.taxAmount)) || 0,
            taxRate: Number(element.value.gst)
          }
        ],
        "quantity": element.value.quantity ? element.value.quantity : '1',
        "rate": element.value.rate ? Math.round(element.value.rate) : 0,
        "stcAmount": element.value.stcAmount ? Math.round(element.value.stcAmount) : 0,
        "jmbAmount": element.value.jmbAmount ? Math.round(element.value.jmbAmount) : 0,
        "payableAt": element.value.payableAt ? element.value.payableAt : "",
        "gst": Number(element.value.gst) || 0,
        "gstType": element.value.gstType || 'igst',
        "totalAmount": Math.round(element.value.totalAmount) || 0,
        "chargeTerm": element.value.chargeTerm || '',
        "remarks": element.value.remarks ? element.value.remarks : "",
        "containerNumber": element.value.containerNumber || [],
        "shippingLine": element.value.shippingLine || "",
        "taxApplicability": element.value.taxApplicability || "",
        "hsnCode": this.chargeName?.filter(
          (x) =>
            x?.costitemId ==
            element.value.chargeName
        )[0]?.hsnCode?.toString() || '',
        "isEnquiryCharge": true, 
        "isReceiptCreated" : element.value.isReceiptCreated || false,
      }
      chargeArray.push(charge)
    });



    if (this.editinvoiceForm.valid) {
      const newInvoice = {
        "orgId": this.commonfunction.getAgentDetails().orgId,
        "tenantId": this.tenantId,
        "invoiceId": "",
        // "invoice_date": this.convertDate(this.editinvoiceForm.value.invoice_date),
        // "invoiceDueDate": this.convertDate(this.editinvoiceForm.value.billdue_date),
        "invoice_date": currentTime(this.editinvoiceForm.value.invoice_date),
        "invoiceDueDate": currentTime(this.editinvoiceForm.value.billdue_date || new Date()),
        "invoiceTypeStatus": this.editinvoiceForm.value.invoice_type,
        "invoiceType": "B2B",
        "remarks": this.editinvoiceForm.value.remark,
        "invoiceNo": "",
        "invoiceToGst": this.type === 'buyerInvoice' ? userData?.tax_number?.toString() : userData?.taxId,
        "invoiceToId": this.editinvoiceForm.value.bill_to || '',
        "invoiceToName": this.shipperList?.filter(x => x.partymasterId === this.editinvoiceForm.value.bill_to)[0]?.name || '',
        "billTo": this.editinvoiceForm.value.bill_to,
        "invoiceFromId": this.editinvoiceForm.value.bill_from,
        "invoiceToBranch": this.editinvoiceForm.value.billToBranch,
        "invoiceToBranchName": this.branchList?.find((x) => x.branchId === this.editinvoiceForm.value.billToBranch)?.branchName || '',
        "invoiceFromBranch": this.editinvoiceForm.value.billFromBranch,
        "invoiceFromName": this.supplierList?.find((x) => x.partymasterId == this.editinvoiceForm.value.bill_from)?.name || '',
        "invoiceAmount": this.billAmount?.toString() || '',
        "invoiceTaxAmount": this.taxAmount?.toString() || '',
        "coName": this.editinvoiceForm.value.coName,
        "coAddress": this.editinvoiceForm.value.coAddress,
        "moveNo": this.batchDetails?.moveNo || '',
        "gstNo": this.type === 'buyerInvoice' ? userData?.tax_number?.toString() : userData?.taxId,
        "userStateCode": this.type === 'buyerInvoice' ? userData?.tax_number.toString()?.slice(0, 2) : userData?.taxId.toString()?.slice(0, 2),
        "userPinCode": this.type === 'buyerInvoice' ? userData?.pinCode?.toString() : userData?.addressInfo?.postalCode,
        "userLocation": this.type === 'buyerInvoice' ? userData?.branch_city?.toString() : userData?.addressInfo?.cityName,
        currency: this.batchDetails?.quotationDetails?.currencyShortName || '',
        currencyId: this.batchDetails?.quotationDetails?.currency || '',
        "backDate": this.editinvoiceForm.value.backDate,
        "isBackDate": this.editinvoiceForm.value.isBackDate,
        "tax": [
          {
            "taxAmount": 0,
            "taxRate": 0,
            "taxName": ""
          }
        ],
        "shipperAddress": {
          "stateName": shipperData?.addressInfo?.stateName || '',
          "stateCode": shipperData?.addressInfo?.stateCode || '',
        },
        "blId": this.editinvoiceForm.value.bl || '',
        "blName": this.blData?.filter(x => x.blId === this.editinvoiceForm.value.bl)[0]?.blNumber || '',

        "consigneeId": this.batchDetails?.enquiryDetails?.basicDetails?.consigneeId,
        "consigneeName": this.batchDetails?.enquiryDetails?.basicDetails?.consigneeName,

        "placeOfSupply": '',
        "placeOfSupplyId": '',

        "advancePayment": Number(this.AdvanceValue),
        "advancePercentage": Number(this.advancePercent),

        "costItems": chargeArray || [],

        "shipperId": this.editinvoiceForm.value.shipper || '',
        "shipperName": this.shipperList.filter(x => x.partymasterId === this.editinvoiceForm.value.shipper)[0]?.name || '',
        "type": this.type,
        "paymentStatus": "Unpaid",
        "paidAmount": 0,
        "jobNumber": "",
        "printBank": false,
        "jobId": '',
        "batchId": this.route.snapshot?.params['id'] || '',
        "batchNo": this.batchDetails?.batchNo,
        "paymentTerms": this.editinvoiceForm.value.payment_terms || 1,
        "bankDetails": this.editinvoiceForm.value.bankDetails,
        "bankId": this.editinvoiceForm.value.bank,
        "bankName": this.bankList?.filter(x => x.bankId == this.editinvoiceForm.value.bank)[0]?.bankName || '',

        "supplier": this.editinvoiceForm.value.bill_from,
        "supplierName": this.supplierList?.find((x) => x.partymasterId == this.editinvoiceForm.value.bill_from)?.name || '',
        "supplierAddress": this.supplierList?.find((x) => x.partymasterId == this.editinvoiceForm.value.bill_from)?.addressInfo?.address || '',

        "bankType": "local",
        "voyageNumber": this.quotationDetails?.voyageNumber || '',
        "vesselId": this.quotationDetails?.vesselId || '',
        "isSez": shipperData[0]?.isSez === 'true' ? 'Y' : 'N',
        "vesselName": this.quotationDetails?.vesselName || '',
        "carrierName": this.quotationDetails?.carrierName || '',
        "flightNo": this.quotationDetails?.flightNo || '',
        "paymentMode": "CASH",
        "serviceDatefrom": this.convertDate(new Date()),
        "serviceDateTill": this.convertDate(new Date()),
        "taxNumber": "",
        "isExport": (this.isExport || this.isTransport),
        "status": true,
        "statusOfinvoice": flag,
        "holdPosting": true,
        "invoiceStatus": flag,
        "principleBill": false,
        "taxApplicability": this.editinvoiceForm.value.taxApplicability,
        "gst_invoice_type": this.editinvoiceForm.value.gst_invoice_type,
        "gstr": this.editinvoiceForm.value.gstr,
        "gstType": this.gstType || 'igst',
        pdfUrl: this.uploadFile ? this.uploadFile.name : this.invoiceIdToUpdate?.pdfUrl ? this.invoiceIdToUpdate?.pdfUrl : '',
      }
      if (this.invoiceIdToUpdate?.invoiceId) {
        this.commonService.UpdateToST(`invoice/${this.invoiceIdToUpdate?.invoiceId}`, { ...newInvoice, invoiceId: this.invoiceIdToUpdate?.invoiceId, invoiceNo: this.invoiceIdToUpdate?.invoiceNo }).subscribe(
          (res: any) => {
            if (res) {
              this.notification.create(
                'success',
                'Update Successfully',
                ''
              );
              this.saveCharge(res)

              this.submitted = false
              setTimeout(() => {
                this.modalService.dismissAll()
                this.router.navigate(['/batch/list/add/' + this.route.snapshot.params['id'] + '/invoice']);
              }, 1000);



            }
          },
          (error) => {
            this.notification.create('error', error?.error?.error?.message, '');
          }
        );
      } else {
        this.commonService.addToST('invoice', newInvoice).subscribe(
          (res: any) => {
            if (res) {
              this.notification.create(
                'success',
                'Save Successfully',
                ''
              );
              this.submitted = false
              // if (this.type == 'sellerInvoice') {
              //   this.updateCharge(res)
              // }
              // if (this.type == 'buyerInvoice') {
              //   this.uploadBuyerDoc(res)
              // }
              this.saveCharge(res)
              setTimeout(() => {
                this.modalService.dismissAll()
                this.router.navigate(['/batch/list/add/' + this.route.snapshot.params['id'] + '/invoice']);
              }, 1000);
            }
          },
          (error) => {
            this.notification.create('error', error?.error?.error?.message, '');
          }
        );
      }

    } else {
      this.notification.create('error', 'Invalid form', '');
      return false;
    }
  }

  uploadBuyerDoc(res) {
    const formData = new FormData();
    formData.append('file', this.uploadFile, `${this.uploadFile.name}`);
    formData.append('name', `${this.uploadFile.name}`);

    this.commonService.uploadDocuments('uploadfile', formData).subscribe();

    let payload = {

      "documentName": this.uploadFile.name,
      "documentType": "Buyer Document",
      "tags": [],
      "Doc": this.uploadFile.name,
      "remarks": "test",
      "documentURL": this.uploadFile.name,
      "refType": "",
      "tenantId": "1",
      "documentId": "",
      "documentStatusId": "",
      "refId": res?.batchId,
      "isActive": true,
      "orgId": res?.orgId,
      "addressId": "",
      "documentStatus": true,
      "isEmailDocument": true

    }
    this.commonService.addToST('document', payload).subscribe(
      (res) => {
        if (res) {

        }
      },
      (error) => {
        this.notification.create('error', 'Failed to upload the document.', '');
      }
    );
  }
  checjError(e) {
    console.log(e, 'eeesdsd')
  }
  closePopup() {
    // this.modalService.dismissAll()
    this.router.navigate(['/batch/list/add/' + this.route.snapshot.params['id'] + '/invoice']);
  }

  updateCharge(res) {
    let dataUpdate = []
    this.costItemList.filter(x => {
      if (x.isSelected) {
        dataUpdate.push({
          ...x,
          invoiceNo: res?.invoiceNo || '',
          isInvoiceCreated: true,
          invoiceStatus: res?.invoiceStatus,
          buyEstimates: {
            ...x.buyEstimates,
            buyerInvoice: true,
            invoiceNo: x.buyEstimates?.invoiceNo ? x.buyEstimates?.invoiceNo : this.type === 'buyerInvoice' ? res?.invoiceNo : null,
            invoiceId: x.buyEstimates?.invoiceId ? x.buyEstimates?.invoiceId : this.type === 'buyerInvoice' ? res?.invoiceId : null
          },
          selEstimates: {
            ...x.selEstimates,
            sellerInvoice: true,
            invoiceNo: x.selEstimates?.invoiceNo ? x.selEstimates?.invoiceNo : this.type === 'sellerInvoice' ? res?.invoiceNo : null,
            invoiceId: x.selEstimates?.invoiceId ? x.selEstimates?.invoiceId : this.type === 'sellerInvoice' ? res?.invoiceId : null
          }
          // amount :( x.amount?.toString() || ''),
          // moveNumber:( x.moveNumber?.toString() || '')

        });
      } else {
        dataUpdate.push({
          ...x,
          invoiceNo: '',
          isInvoiceCreated: false,
          invoiceStatus: '',
          buyEstimates: {
            ...x.buyEstimates,
            buyerInvoice: false,
            invoiceNo: '',
            invoiceId: ''
          },
          selEstimates: {
            ...x.selEstimates,
            sellerInvoice: false,
            invoiceNo: '',
            invoiceId: ''
          }
          // amount :( x.amount?.toString() || ''),
          // moveNumber:( x.moveNumber?.toString() || '')

        });
      }
    })

    if (dataUpdate.length > 0) {
      this.commonService.batchUpdate('enquiryitem/batchupdate', dataUpdate).subscribe();
    }
  }

  onCheckAll(evt) {
    // this.isSelected = !this.isSelected
    this.checkedList = []
    if (evt.target.checked) {
      this.costItemList?.forEach((element, index) => {
        element.isSelected = true
        // let data = {
        //   ...element,
        //   isExemp: ((<HTMLInputElement>document.getElementById('exemp' + index)).value) || false,
        // }
        this.checkedList.push({ ...element });
      })
    }
    else {
      this.costItemList?.forEach((element) => {
        element.isSelected = false
        let index1 = this.checkedList.findIndex(
          item => item?.enquiryitemId === element?.enquiryitemId
        )
        this.checkedList.splice(index1, 1)
      })
    }
    this.calculateTotal1()
  }

  onCloseInvoice(evt) {
    this.CloseInvoiceSection.emit(evt);
  }

  getblData() {
    let payload = this.commonService.filterList()
    payload.query = {
      batchId: this.batchId,
    }

    this.commonService.getSTList('bl', payload).subscribe((data: any) => {
      this.blData = data.documents;
    });
  }
  consigneeList: any = []
  getPartyList() {
    let payload = this.commonService.filterList()
    payload.query = {
      "status": true,
      "$and": [
        {
          "customerType.item_text": {
            "$ne": "Vendor"
          }
        }
      ]
    }

    this.commonService.getSTList("partymaster", payload).subscribe((data: any) => {

      let partyMasterList = data.documents
      let dataParty = []
      partyMasterList.forEach(element => {
        if (element?.branch?.length > 0) {
          element?.branch?.map((x) => {
            dataParty.push({ ...element, ...x })
          })
        } else {
          dataParty.push({ ...element })
        }

      });

      this.partyMasterList = dataParty;
      this.partyMasterList = (this.isExport || this.isTransport) ? this.partyMasterList?.filter((x) => x?.partymasterId === this.batchDetails?.enquiryDetails?.basicDetails?.bookingPartyId)
        : this.partyMasterList?.filter((x) => x?.partymasterId === this.batchDetails?.enquiryDetails?.basicDetails?.invoicingPartyId);
      this.partyMasterFrom = dataParty;
      this.partyMasterFrom = this.partyMasterFrom.filter((x) => x?.name?.toLowerCase() === 'stolt' || x?.name?.toLowerCase() === 'jmb')

      // dataParty?.filter((x) => {
      //   if (x.customerType) {
      //     x.customerType.map((res: any) => {
      //       if (res?.item_text === 'Shipper') { this.shipperList.push(x) }
      //     })
      //   }
      // });
      this.shipperList = data.documents;
      data?.documents?.filter((x) => {
        if (x.customerType) {
          x.customerType.map((res: any) => {
            if (res?.item_text === 'Consignee') { this.consigneeList.push(x) }
          })
        }
      });
      // this.setShipper()
      if (!this.isAddMode) {
        this.calculateTotal()
      }
    });
  }
  billFromBranchList = [];
  getListOfbillFrom(e?) {
    this.billFromBranchList = this.supplierList?.find((x) => x.partymasterId === this.editinvoiceForm.controls['bill_from'].value)?.branch || []
    this.calcBuyAMT(-1)
  }
  getSystemTypeDropDowns() {
    let payload = this.commonService.filterList()
    payload.query = {
      "status": true,
      "typeCategory": {
        "$in": [
          "invoiceType", "paymentTerms", "taxApplicability", "gstInvoiceType", "gstr", "chargeType", "chargeTerm"
        ]
      }
    }

    this.commonService.getSTList("systemtype", payload).subscribe((res: any) => {

      this.chargeTermList = res?.documents?.filter(x => x.typeCategory === "chargeTerm");
      this.chargeBasic = res?.documents?.filter(x => x.typeCategory === "chargeType");
      this.paymentTermList = res?.documents?.filter(x => x.typeCategory === "paymentTerms");
      this.taxApplicabilityList = res?.documents?.filter(x => x.typeCategory === "taxApplicability");
      this.gstInvoiceTypeList = res?.documents?.filter(x => x.typeCategory === "gstInvoiceType");
      this.gstrList = res?.documents?.filter(x => x.typeCategory === "gstr");
    });
  }

  getCustomerDetails() {
    if (this.type == 'buyerInvoice') {
      let customerData = this.billFromBranchList?.filter(x => x.branch_name === this.editinvoiceForm?.get("billFromBranch").value)[0] || ''
      this.editinvoiceForm?.get("bank").setValue(customerData?.bankName)
    }
  }
  getBankList(res) {


    let payload = this.commonService.filterList()
    if (this.type == 'buyerInvoice') {
      payload.query = {
        isBank: true, status: true,
      }
    } else {
      payload.query = {
        branchId: res,
      }
    }


    this.commonService.getSTList('bank', payload)
      .subscribe((data) => {
        this.bankList = data.documents;
      });
  }

  getInvoiceDetailsById(id) {
    let payload = this.commonService.filterList()
    payload.query = {
      "invoiceId": id,
    }

    this.commonService.getSTList('invoice', payload).subscribe((data) => {
      const invoiceData = data.documents[0]
      this.invoiceIdToUpdate = invoiceData
      this.type = invoiceData?.type || 'sellerInvoice'
      this.irisResponse = invoiceData?.irisResponse
      this.advancePercent = invoiceData?.advancePercentage;
      this.AdvanceValue = invoiceData?.advancePayment;
      this.billToValue = invoiceData?.invoiceToGst,
        this.editinvoiceForm.patchValue({
          isBackDate: invoiceData?.isBackDate,
          backDate: invoiceData?.backDate,
          shipper: invoiceData?.shipperId,
          consignee: invoiceData?.consigneeId,
          invoice_no: invoiceData?.invoiceNo,
          invoice_type: invoiceData?.invoiceTypeStatus,
          bill_from: invoiceData?.invoiceFromId,
          billFromBranch: invoiceData?.invoiceFromBranch,
          billToBranch: invoiceData?.invoiceToBranch,
          bill_to: invoiceData?.invoiceToId,
          bl: invoiceData?.blId,
          sez_type: invoiceData?.invoice_no,
          coName: invoiceData?.coName,
          coAddress: invoiceData?.coAddress,
          tax_applied: '',
          gst_number: invoiceData?.gstNo,
          invoice_date: new Date(invoiceData?.invoice_date),
          payment_terms: invoiceData?.paymentTerms || 1,
          supplierAddress: invoiceData?.supplierAddress || '',
          supplier: invoiceData?.supplier,
          taxApplicability: invoiceData?.taxApplicability,
          gst_invoice_type: invoiceData?.gst_invoice_type,
          gstr: invoiceData?.gstr,
          printBank: invoiceData?.printBank,
          invoice_amount: invoiceData?.invoiceAmount,
          taxAmount: invoiceData?.taxAmount,
          billdue_date: new Date(invoiceData?.invoiceDueDate),
          remark: invoiceData?.remarks,
          bank: invoiceData?.bankId,
          batchNo: invoiceData?.batchNo,
          bankDetails: invoiceData?.bankDetails,
          holdPosting: invoiceData?.holdPosting,
          // charge: this.fb.array([])

        });

      this.costItemList = invoiceData?.costItems;
      this.baseCostItems = invoiceData?.costItems;
      this.checkedList = invoiceData?.costItems;
      this.invoiceTypeList = [ 
        // { name: "Local", value: 'Local' },
        { name: "Tax", value: 'Tax' },
        { name: "Overseas", value: 'Overseas' }
      ]
      this.getListOfbillFrom()
      this.getCustomerDetails()
      this.addChargeOnTable();
    })
  }
  getChrgeById(id) {
    let payload = this.commonService.filterList()
    payload.query = {
      "invoiceId": id,
    }

    this.commonService.getSTList('enquiryitem', payload).subscribe((data) => {
      this.editinvoiceForm.patchValue({
        charge: this.fb.array([])
      });


      // this.setShipper()
    })
  }

  principalOptions = [];
  principalList = []
  onPrincipalInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    this.principalOptions = [];
    if (this.principalList.length > 0) {
      this.principalList.forEach(principal => {

        if (value && (principal?.principalName || principal?.principalName?.toLowerCase()) && principal?.principalName?.toLowerCase().includes(value.toLowerCase())) {
          this.principalOptions.push({ label: principal?.principalName, value: principal })
        }
      })
    }

  }


  onGenerate(e) {
    this.notification.create('success', 'Invoice Generated Successfully', '')
    this.CloseInvoiceSection.emit(e);
  }
  checked(key, $event, form) {
    this.modalService
      .open(key, {
        backdrop: 'static',
        keyboard: false,
        centered: true,
        size: '',
        ariaLabelledBy: 'modal-basic-title',
      })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
          if (result === 'yes') {
            this.editinvoiceForm.controls[form].setValue($event.target.checked)
          } else {
            this.editinvoiceForm.controls[form].setValue(!$event.target.checked)
          }
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


  getBatchList() {

    let payload = this.commonService.filterList()
    payload.query = {
      "batchId": this.route.snapshot?.params['id']
    }

    this.commonService.getSTList('batch', payload)
      .subscribe((data: any) => {
        this.batchNoList = data.documents;
        this.batchDetails = data?.documents[0];
        this.getEnquiry(data.documents[0]);
        this.defaultExRate = Number(this.batchDetails?.routeDetails?.exchangeRate) || 0
        this.getPartyList()
        if (!this.route.snapshot.params['moduleId']) {
          this.getCharges();
        }

      });
  }


  gstType: string = 'igst'
  getQuotation(doc) {
    let payload = this.commonService.filterList()
    payload.query = {
      'quotationId': doc?.quotationId
    }
    this.commonService.getSTList('quotation', payload)
      .subscribe((res: any) => {
        this.quotationDetails = res?.documents[0];
        if (this.enquiryDetails?.basicDetails?.billingCountry?.toLowerCase() == 'india' || this.enquiryDetails?.basicDetails?.billingCountry?.toLowerCase() == 'ind'
          || this.enquiryDetails?.basicDetails?.billingCountry?.toLowerCase() == '' || this.enquiryDetails?.basicDetails?.billingCountry?.toLowerCase() == undefined) {

          if (this.quotationDetails?.branchStateCode == this.enquiryDetails?.basicDetails?.billingStateCode) {
            this.gstType = 'cgst'
            this.isGSTinState = true
          } else {
            this.gstType = 'igst'
            this.isGSTinState = false
          }
        } else {
          this.gstType = 'tax'
        }



        if (this.type == 'sellerInvoice') {
          this.getBankList(this.quotationDetails?.branchId)
          this.editinvoiceForm.patchValue({
            billToBranch: this.quotationDetails?.branchId,
          })
        }
        if (this.type == 'buyerInvoice' || this.type == 'purchaseInvoice' || this.type == 'saleInvoice') {
          // this.editinvoiceForm.patchValue({
          //   bill_from: this.quotationDetails?.carrierName,
          // })
        }
        if (this.route.snapshot.params['moduleId']) {

          this.getInvoiceDetailsById(this.route.snapshot.params['moduleId']);
        }

      })
  }

  getEnquiry(res) {
    let payload = this.commonService.filterList()
    payload.query = {
      'enquiryId': res?.enquiryId,
    }
    this.commonService.getSTList('enquiry', payload).subscribe(
      (result) => {
        this.enquiryDetails = result?.documents[0];
        this.getQuotation(this.batchDetails);

        this.editinvoiceForm.patchValue({
          shipper: this.enquiryDetails?.basicDetails?.shipperId ?? this.batchDetails?.enquiryDetails?.basicDetails?.shipperId,
          // bill_to: this.enquiryDetails?.basicDetails?.billingBranch ?? this.batchDetails?.enquiryDetails?.basicDetails?.billingBranch,
        })
      });
  }




  getCharges() {
    this.costItemList = [];
    let payload = this.commonService.filterList();
    if (this.type == 'buyerInvoice') {
      payload.query = {
        // "quotationId": this.batchDetails?.quotationId,
        "$and": [
          {
            "buyEstimates.isInvoiceCreated": {
              "$ne": true
            }
          }
        ]
      }
    } else {
      payload.query = {
        // "quotationId": this.batchDetails?.quotationId,
        "$and": [
          {
            "selEstimates.isInvoiceCreated": {
              "$ne": true
            }
          }
        ]
      }
    }

    
    if (this.batchDetails?.quickJob) { 
      payload.query = {
        ...payload.query,
        batchId: this.batchDetails?.batchId
      }
    }
    else { 
      payload.query = {
        ...payload.query,
        quotationId: this.batchDetails?.quotationId
      }
    }


    this.commonService.getSTList('enquiryitem', payload).subscribe((result) => {

      if (result?.documents.length > 0) {
        this.baseCostItems = result?.documents
        this.baseCostItemsCopy = JSON.parse(JSON.stringify(result?.documents))
        this.baseCostItems.map((x) => {
          delete x.sort,
            x.isSelected = false,
            x.buyEstimates['buyerInvoice'] = x.buyEstimates?.buyerInvoice ? x.buyEstimates?.buyerInvoice : this.type === 'buyerInvoice' ? true : false,
            x.selEstimates['sellerInvoice'] = x.selEstimates?.sellerInvoice ? x.selEstimates?.sellerInvoice : this.type === 'sellerInvoice' ? true : false,
            x.moveNumber = Number(x?.moveNumber || 0)
        })
      }

      if (this.invoiceIdToUpdate?.costItems?.length > 0) {
        this.checkedList = []
        this.invoiceIdToUpdate?.costItems.filter((a: any) => {
          this.checkedList.push(
            {
              ...a,
              isSelected: true,
            })
        })

        if (this.invoiceIdToUpdate?.invoiceStatus === 'Sent' || this.invoiceIdToUpdate?.invoiceStatus === 'Approved' || this.invoiceIdToUpdate?.invoiceStatus === 'Overdue' || this.invoiceIdToUpdate?.invoiceStatus === 'Paid') {
          this.baseCostItems = [...this.checkedList]
        }
        else {
          this.baseCostItems = [...this.baseCostItems, ...this.checkedList]

        }
        this.baseCostItems = this.baseCostItems.filter((item, index, self) =>
          index === self.findIndex((t) => t.enquiryitemId === item.enquiryitemId)
        );
        this.baseCostItemsCopy = JSON.parse(JSON.stringify(this.baseCostItems))
        this.invoiceType(true)

      }
    }, error => {
      this.notification.create('error',error?.error?.error?.message, '');
    });


    this.invoiceTypeList = [
      // { name: "Local", value: 'Local' },
      { name: "Tax", value: 'Tax' },
      { name: "Overseas", value: 'Overseas' }
    ]
  }

  invoiceType(flag) {
    // if (this.type === 'buyerInvoice') {
    //   return false
    // }

    this.invoiceTypeTab = this.editinvoiceForm.value.invoice_type;
    this.costItemList = []
    if (!flag)
      this.checkedList = []
    if (this.invoiceTypeTab === 'Local') {

      if (this.type == 'buyerInvoice' && this.f.bill_from.value) {

        this.baseCostItems.filter((item) => {
          if (item.gst === 0 && (item.buyEstimates?.supplier === this.f.bill_from.value || item.buyEstimates?.supplier === "")) {
            this.costItemList.push(item)
          }
        })
      } else {
        this.baseCostItems.filter((item) => {
          if (item.gst === 0) {
            this.costItemList.push(item)
          }
        })
      }
      // this.calculateTotal1();
      this.addChargeOnTable()
    } else if (this.invoiceTypeTab === 'Tax') {


      if (this.type == 'buyerInvoice' && this.f.bill_from.value) {
        this.baseCostItems.filter((item) => {
          if (item.gst !== 0 && (item.buyEstimates?.supplier === this.f.bill_from.value || item.buyEstimates?.supplier === "")) {
            this.costItemList.push(item)
          }
        })
      } else {
        this.baseCostItems.filter((item) => {
          if (item.gst !== 0) {
            this.costItemList.push(item)
          }

        })
      }
      // this.calculateTotal1();
      this.addChargeOnTable()
    } else {
      if (this.type == 'buyerInvoice' && this.editinvoiceForm.value.bill_from) {
        this.costItemList = this.baseCostItems?.filter((x) => (x.buyEstimates?.supplier === this.editinvoiceForm.value.bill_from || x.buyEstimates?.supplier === ""))
      } else {
        this.costItemList = this.baseCostItems;
      }
      // this.calculateTotal1();
      this.addChargeOnTable()
    }

    // this.taxApplied()
  }



  addChargeOnTable() {
    const formArray = this.editinvoiceForm.get('charge') as FormArray;
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }

    console.log(this.costItemList ,'this.costItemList')

    this.costItemList?.forEach((element, index) => {
      this.addChargeRow(element, index)
    });

  }


  taxApplied() {
    let selectParty = this.partyMasterList?.filter(x => x.tax_number === this.editinvoiceForm.value.bill_to)[0]
    let invoiceAmount = Number(this.editinvoiceForm.value.invoice_amount) || 0
    this.editinvoiceForm.controls.taxApplicability.setValue('')
    this.editinvoiceForm.controls.gst_invoice_type.setValue('')

    if (this.editinvoiceForm.value.invoice_type === "Reimbursement Invoice") {
      this.editinvoiceForm.controls.taxApplicability.setValue('N')

      if (selectParty?.isRegister) {
        this.editinvoiceForm.controls.gst_invoice_type.setValue('B2B')
      } else if (!selectParty?.isRegister) {
        if (invoiceAmount > 250000) {
          this.editinvoiceForm.controls.gst_invoice_type.setValue('B2CL')
        } else {
          this.editinvoiceForm.controls.gst_invoice_type.setValue('B2CS')
        }
      }

    } else if (this.editinvoiceForm.value.invoice_type === "Freight Invoice") {
      // this.editinvoiceForm.controls.taxApplicability.setValue(this.costItemList[0]?.taxApplicability )
      if (selectParty?.isSez === 'true') {
        this.editinvoiceForm.controls.taxApplicability.setValue('E')
      } else {
        this.editinvoiceForm.controls.taxApplicability.setValue('T')
      }
      if (this.editinvoiceForm.value.taxApplicability === 'E') {
        this.editinvoiceForm.controls.gst_invoice_type.setValue('SEWOP')
        this.costItemList.map((x) => {
          x.tax[0].taxRate = 0
          x.gst = 0
        })
        this.calculateTotal()
      } else if (this.editinvoiceForm.value.taxApplicability === 'T') {
        this.editinvoiceForm.controls.gst_invoice_type.setValue('SEWP')
        this.baseCostItemsCopy?.forEach((element) => {
          this.costItemList?.map((x) => {
            if (element?.enquiryitemId === x?.enquiryitemId) {
              x.tax[0].taxRate = element?.tax[0]?.taxRate
              x.gst = element?.gst
            }
          })
        });
        this.calculateTotal()
      }
    } else {
      if (selectParty?.isSez === 'true') {
        this.editinvoiceForm.controls.taxApplicability.setValue('E')
        this.costItemList.map((x) => {
          x.tax[0].taxRate = 0
          x.gst = 0
        })
        this.calculateTotal()
      } else {
        this.editinvoiceForm.controls.taxApplicability.setValue('T')
        this.baseCostItemsCopy?.forEach((element) => {
          this.costItemList?.map((x) => {
            if (element?.enquiryitemId === x?.enquiryitemId) {
              x.tax[0].taxRate = element?.tax[0]?.taxRate
              x.gst = element?.gst
            }
          })
        });
        this.calculateTotal()
      }
      if (selectParty?.isRegister) {
        this.editinvoiceForm.controls.gst_invoice_type.setValue('B2B')
      } else if (!selectParty?.isRegister) {
        if (invoiceAmount > 250000) {
          this.editinvoiceForm.controls.gst_invoice_type.setValue('B2CL')
        } else {
          this.editinvoiceForm.controls.gst_invoice_type.setValue('B2CS')
        }

      }
    }

  }
  checkTest(e) {
    if (new RegExp("\\b" + "reimbursement" + "\\b").test(e?.toLowerCase()) ||
      new RegExp("\\b" + "reimbursable" + "\\b").test(e?.toLowerCase())) {
      return true;
    } else {
      return false;
    }
  }


  printData() {
    let reportpayload: any;
    let url: any;
    if (this.invoiceIdToUpdate?.invoiceTypeStatus === "Freight Invoice") {
      reportpayload = { "parameters": { "invoiceID": this.invoiceIdToUpdate?.invoiceId, "module": (this.isExport || this.isTransport) ? 'export' : 'import' } };
      url = 'freightInvoice'
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
    else if (this.invoiceIdToUpdate?.invoiceTypeStatus === "Local") {
      reportpayload = { "parameters": { "invoiceID": this.invoiceIdToUpdate?.invoiceId, "module": (this.isExport || this.isTransport) ? 'export' : 'import' } };
      url = 'localInvoice'
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
    else if (this.invoiceIdToUpdate?.invoiceTypeStatus === "Reimbursement Invoice") {
      reportpayload = { "parameters": { "invoiceID": this.invoiceIdToUpdate?.invoiceId } };
      url = 'reimbursementInvoice'
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
    else if (this.invoiceIdToUpdate?.invoiceTypeStatus === "Tax") {
      reportpayload = { "parameters": { "invoiceID": this.invoiceIdToUpdate?.invoiceId } };
      url = 'agencyInvoice'
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
    else {
      var divToPrint = document.getElementById("InvoiceRecords");
      var newWin = window.open("");
      newWin.document.write(divToPrint.outerHTML);
      newWin.print();
      newWin.close();
    }

  }
  isLastDayOfMonth(current: Date | null): boolean {
    current = current ?? new Date();
    const dayOfMonth = current.getDate();
    const lastDayOfMonth = getDaysInMonth(new Date(current))
    if (new Date(current) < new Date(new Date().getFullYear(), new Date().getMonth(), 0))
      return dayOfMonth !== lastDayOfMonth;
  };
  disabledEtaDate = (current: Date): boolean => {
    return differenceInCalendarDays(current, new Date()) < 0;
  };
  setGSTValue() {
    this.billToValue = this.editinvoiceForm.value.bill_to
    let selectParty = this.partyMasterList?.filter(x => x.tax_number === this.editinvoiceForm.value.bill_to)[0]
    this.isGSTinState = selectParty?.placeofSupply?.toString()?.toLowerCase() === 'mh' ? true : false
    this.calculateTotal()
    this.taxApplied()
  }


  isGSTinState: boolean = false;
  setVendor(i) {
    this.searchText = ''
    // this.editinvoiceForm.controls.bill_to.setValue(i)
    this.billToValue = this.editinvoiceForm.value.bill_to
    let selectParty = this.partyMasterList?.filter(x => x.tax_number === this.editinvoiceForm.value.bill_to)[0]
    this.isGSTinState = selectParty?.placeofSupply?.toString().toLowerCase() === 'mh' ? true : false
    this.calculateTotal()
    // this.taxApplied()
  }
  setShipper() {
    let invoice = this.blData.filter((x) => x?.blId === this.editinvoiceForm.controls.bl.value)[0]
    if (invoice?.shipperId === "SHIPEASY") {
      this.showDefault = true
      this.editinvoiceForm.controls.shipper.setValue(invoice?.shipperName)
    } else {
      this.showDefault = false
      this.editinvoiceForm.controls.shipper.setValue(invoice?.shipperName)
    }
  }
  paymentValue(key?) {
    let e = this.editinvoiceForm.value.payment_terms || 1
    if (!e || e !== Number(e)) { return false }
    this.editinvoiceForm.controls.billdue_date.setValue(new Date(Date.now() + e * 24 * 60 * 60 * 1000))
  }

  checkedList: any = [];
  checkCharge(evt, check, i) {
    let index = this.costItemList.findIndex(
      item => item?.enquiryitemId === check?.enquiryitemId
    )
    if (evt.target.checked) {
      // let data = {
      //   ...check,
      //   isExemp: ((<HTMLInputElement>document.getElementById('exemp' + i)).value) || false,
      // }
      this.checkedList.push({ ...check });

    }
    else {
      let index1 = this.checkedList.findIndex(
        item => item?.enquiryitemId === check?.enquiryitemId
      )
      this.checkedList.splice(index1, 1)
    }

    this.calculateTotal1()
  }
  calculateTotal1() {
    this.editinvoiceForm.controls.invoice_amount.setValue('')
    this.totalAmount = 0
    this.taxAmount = 0
    this.billAmount = 0
    this.costItemList?.forEach((x) => {
      this.checkedList.forEach(element => {
        if (this.type == 'sellerInvoice') {
          if (x?.enquiryitemId === element?.enquiryitemId) {
            this.totalAmount += Number(element.selEstimates?.taxableAmount || 0);
            this.taxAmount += Number(element.selEstimates?.igst || 0);
            if (this.type === 'sellerInvoice') {
              this.billAmount += Number(element.selEstimates?.totalAmount || 0)

            }
            else {
              this.billAmount += Number(element.buyEstimates?.totalAmount || 0)
            }
          }
        }
        if (this.type == 'buyerInvoice') {
          if (x?.costItemName === element?.costItemName) {
            this.totalAmount += Number(element.selEstimates?.taxableAmount || 0);
            this.taxAmount += Number(element.selEstimates?.igst || 0);
            if (this.type === 'sellerInvoice') {
              this.billAmount += Number(element.selEstimates?.totalAmount || 0)

            }
            else {
              this.billAmount += Number(element.buyEstimates?.totalAmount || 0)
            }
          }
        }
      })
    })
    this.editinvoiceForm.controls.invoice_amount.setValue(this.billAmount)
  }

  calculateTotal() {
    return;
    this.editinvoiceForm.controls.invoice_amount.setValue('')

    let value = this.partyMasterList?.filter(x => x.tax_number === this.editinvoiceForm.value.bill_to)[0]?.placeofSupply?.toString()
    this.isGSTinState = value?.toLowerCase() === 'mh' ? true : false

    this.costItemList?.map((x) => {
      x.gstType = this.isGSTinState ? 'sgst' : 'igst'
    })

    this.totalAmount = 0
    this.jmbAmount = 0
    this.taxAmount = 0
    this.billAmount = 0
    this.costItemList?.forEach((x) => {
      this.checkedList.forEach(element => {
        if (x?.enquiryitemId === element?.enquiryitemId) {
          let gst = element?.tax[0]?.taxRate;

          let totalAmount = 0
          let taxAmount = 0

          totalAmount += Number(Number(x?.rate) * Number(x?.quantity) * Number(x?.exRateShippingLine))
          if (x?.exemp) { gst = 0 }
          taxAmount += totalAmount * gst / 100
          this.jmbAmount += Number(x?.jmbAmount)
          this.totalAmount += totalAmount || 0;
          this.taxAmount += Number((taxAmount).toFixed(2)) || 0;
          this.billAmount += Number((totalAmount + taxAmount).toFixed(2))
        }
      });
    })

    this.editinvoiceForm.controls.invoice_amount.setValue(this.billAmount)

  }
  exChangeClick(data, i) {
    let index = this.costItemList.findIndex(
      item => item?.enquiryitemId === data?.enquiryitemId
    )
    this.calculateTotal()
  }

  calINR(type, data, i) {
    let value = this.partyMasterList?.filter(x => x.tax_number === this.editinvoiceForm.value.bill_to)[0]?.placeofSupply?.toString()
    this.isGSTinState = value?.toLowerCase() === 'mh' ? true : false
    let ex = data?.exRateShippingLine
    let amt = Number(data?.rate) * Number(data?.quantity || 0)
    let gst = Number(data?.tax[0]?.taxRate)


    if (type === 'inr')
      return Number(amt * ex)
    if (type === 'inrTax')
      return Number((amt * ex) * gst / 100)

    if (this.costItemList[i]?.exemp) {
      gst = 0
    }
    if (type === 'totTax') {
      let totSgst = Number(((amt * ex) * (gst / 2) / 100).toFixed(2)) || 0
      let totIgst = Number(((amt * ex) * gst / 100).toFixed(2)) || 0
      this.costItemList[i].igst = totIgst || 0
      this.costItemList[i].cgst = totSgst || 0
      this.costItemList[i].sgst = totSgst || 0

      this.costItemList[i].gstType = this.gstType || 'igst'
      this.costItemList[i].tax[0].taxAmount = Math.round((amt * ex) * gst / 100)
      // this.costItemList[i].taxAmount = Number((amt * ex) * gst / 100) || 0
      return Number((amt * ex) * gst / 100)
    }

    if (type === 'totValue') {
      this.costItemList[i].totalAmount = Math.round((amt * ex) + ((amt * ex) * gst / 100))
      return Number((amt * ex) + ((amt * ex) * gst / 100))
    }

  }
  changeContainer(data) {
    let index = this.costItemList.findIndex(
      item => item?.enquiryitemId === data?.enquiryitemId
    )
    this.costItemList[index].quantity = data?.chargeType?.toLowerCase() === 'bl charge' ? data?.quantity || 1 : data.containerNumber?.length || 0
    this.calculateTotal()
  }
  setGST(e) {
    let gstNo = this.partyMasterFrom?.filter((x) => x?.partymasterId === e)[0]?.tax_number
    this.editinvoiceForm.controls.gst_number.setValue(gstNo)
  }
  digitalSign() {
    let reportpayload: any;
    let url: any;
    // return
    if (this.invoiceIdToUpdate?.invoiceTypeStatus === "Freight Invoice") {
      reportpayload = { "parameters": { "invoiceId": this.invoiceIdToUpdate?.invoiceId, "module": (this.isExport || this.isTransport) ? 'export' : 'import' } };
      url = 'freightInvoice';
    } else if (this.invoiceIdToUpdate?.invoiceTypeStatus === "Local") {
      reportpayload = { "parameters": { "invoiceID": this.invoiceIdToUpdate?.invoiceId, "module": (this.isExport || this.isTransport) ? 'export' : 'import' } };
      url = 'localInvoice';
    } else if (this.invoiceIdToUpdate?.invoiceTypeStatus === "Reimbursement Invoice") {
      reportpayload = { "parameters": { "invoiceId": this.invoiceIdToUpdate?.invoiceId } };
      url = 'reimbursementInvoice';
    } else {
      return false;
    }

    this.commonService.pushreports(reportpayload, url).subscribe({
      next: (res: any) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        let formData = new FormData();
        formData.append('pdf', blob, this.invoiceIdToUpdate?.invoiceNo + `${url}.pdf`);
        this.commonService.signPdf(formData).subscribe((res2: any) => {
          const blob = new Blob([res2], { type: 'application/pdf' });
          let temp = URL.createObjectURL(blob);
          this.Documentpdf = temp;
          var a = document.createElement('a');
          a.href = this.Documentpdf;
          a.download = this.invoiceIdToUpdate?.invoiceNo + `${url}.pdf`;
          document.body.appendChild(a);
          a.click();
        })
      }
    })
  }


  uploadFile: any;
  filechange(event: any,) {
    const fileInput = event.target.files[0];
    if (fileInput) {
      this.uploadFile = fileInput;
    }
  }


  convertTo2DArray(originalArray) {



    originalArray?.forEach((y) => {

      this.costItemList.push({
        "batchId": this.route.snapshot.params['id'],
        "enquiryId": '',
        "batchNo": '',
        "collectPort": '',
        "quotationId": '',
        "agentadviceId": '',
        "containerType": y['containerType'] || '',
        "vesselName": '',
        "voyageName": '',
        "moveNumber": '',
        "enquiryNumber": '',
        "enqDate": '',
        "stcQuotationNo": '',
        "enqType": '',
        "tenantId": this.tenantId,
        "enquiryitemId": "",
        "costitemGroup": '',
        "costItemId": '',
        "accountBaseCode": "",
        "costItemName": y?.description || '',
        "costHeadId": '',
        "costHeadName": '',
        "exchangeRate": '1',
        "currency": '',
        "amount": '',
        "baseAmount": '',
        "basic": y['containerType'] || '',
        "basicId": '',
        "tenantMargin": 0,
        "buyEstimates": {
          "currencyId": '',
          "currency": y?.currency || '',
          "exChangeRate": y?.currency === 'INDIAN RUPEE' ? 0.012 : 1,
          "rate": y['sum_rate'] || 0,
          "taxableAmount": y['sum_rate'] * y['quantity'] * (y?.currency === 'INDIAN RUPEE' ? 0.012 : 1) || 0,
          "amount": y['sum_rate'] * y['quantity'] || 0,
          "totalAmount": y['total_rounded'] * (y?.currency === 'INDIAN RUPEE' ? 0.012 : 1) || 0,
          "terms": '',
          "supplier": '',
          "igst": 0,
          "cgst": 0,
          "sgst": 0,
          "invoiceId": '',
          "invoiceNo": '',

        },
        "selEstimates": {
          "currencyId": '',
          "currency": y?.currency || '',
          "taxableAmount": y['sum_rate'] * y['quantity'] * (y?.currency === 'INDIAN RUPEE' ? 0.012 : 1),
          "exChangeRate": y?.currency === 'INDIAN RUPEE' ? 0.012 : 1,
          "rate": y['sum_rate'] || 0,
          "amount": y['sum_rate'] * y['quantity'] || 0,
          "totalAmount": y['total_rounded'] * (y?.currency === 'INDIAN RUPEE' ? 0.012 : 1) || 0,
          "terms": '',
          "remarks": '',
          "igst": 0,
          "cgst": 0,
          "sgst": 0,
        },
        "tax": [
          {
            taxAmount: 0,
            taxRate: 0
          }
        ],
        // "quantity": y['quantity']?.split('\n').pop() || 0,
        "quantity": y['quantity'] || 0,
        "rate": 0,
        "stcAmount": 0,
        "jmbAmount": 0,
        "payableAt": "",
        "gst": 0,
        "gstType": 'igst',
        "totalAmount": 0,
        "chargeTerm": '',
        "remarks": "",
        "containerNumber": [],
        "shippingLine": "",
        "taxApplicability": "",
        "hsnCode": '',
        "isPrincipleCreated": false,
        "isInvoiceCreated": false,
        "isEnquiryCharge": false,
      })

    })

    this.costItemList = this.costItemList.filter((x) => x.costItemName !== '')


  }
  errorList: any = []
  readFile(openError) {
    // this.billDetail.pdfUrl = ''
    if (this.uploadFile) {
      this.errorList = []
      const formData = new FormData();
      formData.append('file', this.uploadFile, `${this.uploadFile.name}`);
      formData.append('name', `${this.uploadFile.name}`);
      this.commonService.uploadDocuments('uploadpublicreport', formData).subscribe(res => {
        if (res.shipperName && res.shipperName !== this.batchDetails?.enquiryDetails?.basicDetails.shipperId) {
          this.errorList.push({ name: `${res.shipperName} Does not match with job details shipper name - ${this.batchDetails?.enquiryDetails?.basicDetails.shipperName}` })
        }
        if (res.consigneeName && res.consigneeName !== this.batchDetails?.enquiryDetails?.basicDetails.consigneeName) {
          this.errorList.push({ name: `${res.consigneeName} Does not match with job details consignee name - ${this.batchDetails?.enquiryDetails?.basicDetails.consigneeName}` })
        }
        if (res.vesselName && res.vesselName !== this.batchDetails?.quotationDetails.vesselName) {
          this.errorList.push({ name: `${res.vesselName} Does not match with job details vessel name -  ${this.batchDetails?.quotationDetails?.vesselName}` })
        }

        this.modalService.open(openError, {
          backdrop: 'static',
          keyboard: false,
          centered: true,
          size: 'lg',

          ariaLabelledBy: 'modal-basic-title',
        }).result.then(
          (result) => {
            if (result === 'yes') {
              this.convertTo2DArray(res?.costItems);
              this.editinvoiceForm.patchValue({
                remark: res?.remarks,
                bankId: res?.bankName,
                bl_no: res?.Bill_of_Lading_Number,
                invoice_amount: res?.invoiceAmount,
                billdue_date: res?.invoiceDueDate || new Date(),
                payment_terms: res?.paymentTerms || 1,
                supplier: res?.supplier
              })
              this.taxAmount = res?.invoiceTaxAmount || 0
              this.totalAmount = res?.invoiceAmount || 0

              this.calculateTotal1()
            } else {
              this.uploadFile = null
            }
          })


        // this.costItemList = res?.costItemList || []


      });
    } else {
      this.notification.create('error', 'Please upload file', '');
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
  downnloadEdi(ediName, invoiceId) {

    this._api.getEdi(ediName, invoiceId).subscribe((res: ArrayBuffer) => {
      const blob = new Blob([res], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'invoice.edi';
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
  generateIRN(data) {
    this.commonService.getGeneretINR(`sent-to-einvoicing/${data.invoiceId}`, {})
      .subscribe((data) => {
        if (data) {
          this.notification.create('success', 'Invoice Generated Successfully', '')
          this.getInvoiceDetailsById(this.route.snapshot.params['moduleId']);
        }

      },
        (error) => {
          if (error.error?.isMultipleError) {
            error.error?.errorMessage.forEach(element => {
              this.notification.create('error', element, '');
            });
          } else {
            this.notification.create('error', error?.error?.error?.messageMessage, '');
          }

        });
  }

  cancelIRN(data) {
    this.commonService.getGeneretINR(`cancel-from-einvoicing/${data.invoiceId}`, {})
      .subscribe((data) => {
        if (data) {
          this.notification.create('success', 'Invoice Generated Successfully', '')
          this.getInvoiceDetailsById(this.route.snapshot.params['moduleId']);
        }
      },
        (error) => {
          if (error.error?.isMultipleError) {
            error.error?.errorMessage.forEach(element => {
              this.notification.create('error', element, '');
            });
          } else {
            this.notification.create('error', error?.error?.error?.messageMessage, '');
          }

        });
  }


  titleParty = '';
  addPartyMaster(content, title) {
    this.titleParty = title
    this.getCountryList()
    this.addressFormBuild()


    let modalRef = this.modalService.open(AddPartyComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
    modalRef.componentInstance.isPopup = true;
    modalRef.componentInstance.getList.subscribe((res: any) => {
      if (res) {
        setTimeout(() => {
          this.Overview.reset()
          this.getSupplierParty()
        }, 500);
      }
    })
  }



  get f1() { return this.Overview?.controls; }
  Overview: FormGroup;
  addressFormBuild() {
    this.Overview = this.formBuilder.group({
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
  closePopup1() {
    this.Overview.reset()
    this.modalService.dismissAll()
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
          this.modalService.dismissAll()
          this.Overview.reset()
          this.submitted = false;
          this.getSupplierParty()
        }
      }, (error) => {
        this.notification.create('error', error?.error?.error?.message, '');
      });
    }
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
    this.smartAgentDetail.tenantId = this.tenantId;
    this.smartAgentDetail.status = !this.id ? true : this.smartAgentDetail?.status ? this.smartAgentDetail?.status : false;
    this.smartAgentDetail.name = this.Overview?.get('name')?.value;
    this.smartAgentDetail.notes = this.Overview?.get('notes')?.value ?? [];
    this.smartAgentDetail.overviewTable = this.Overview?.get('overviewTable')?.value ?? [];
    this.smartAgentDetail.shortName = this.Overview?.get('shortname')?.value;
    this.smartAgentDetail.customerType = [{ "item_id": "", "item_text": 'Vendor' }];
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
    let customerList: any = this.supplierList?.find(x => x?.partymasterId === this.Overview.get('customerList').value) ?? '';
    this.smartAgentDetail.parenetcustomerId = this.Overview.get('customerList').value;
    this.smartAgentDetail.parenetcustomerName = customerList?.name;

    // KYC Details
    this.smartAgentDetail.groupCompany = this.Overview?.get('groupCompany')?.value;
    this.smartAgentDetail.parentCompany = this.Overview?.get('parentCompany')?.value;


  }
  customerStatusTag: any = 'Resident'
  customerStatus(e) {
    this.customerStatusTag = e
    if (e === 'Non Resident') {
      this.Overview.get('panNo').clearValidators()
      this.Overview.get('panNo').updateValueAndValidity()
      this.Overview.get('pinCode').updateValueAndValidity()

    }
    else {
      if (this.Overview.get('country').value === 'india')
        this.Overview.get('pinCode').setValidators(Validators.required)


      this.Overview.get('panNo').updateValueAndValidity()
      this.Overview.get('pinCode').updateValueAndValidity()

    }
  }

}

