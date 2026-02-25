import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { LoaderService } from 'src/app/services/loader.service';
import { ApiSharedService } from '../api-service/api-shared.service';
import { shared } from '../../data';
import { AddchangesComponent } from './addchanges/addchanges.component';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { CommonService } from 'src/app/services/common/common.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { CostItem } from 'src/app/models/cost-items';
import { SystemType } from 'src/app/models/system-type';
import { Currency } from 'src/app/models/shipping-line';
import { PartyMaster } from 'src/app/models/vendor-master';
import { Batch, Quotation } from 'src/app/models/charges';
import { EnquiryItem } from 'src/app/models/enquiry';
import { NewinvoiceComponent } from 'src/app/admin/batch/batch-detail/invoices/newinvoice/newinvoice.component';
import { MailsendComponent } from '../document/mailsend/mailsend.component';
import { document } from 'src/app/models/document';
import { FreightCertificateComponent } from '../freight-certificate/freight-certificate.component';
import { FreightChargesComponent } from './freight-charges/freight-charges.component';
import { CommonFunctions } from '../../functions/common.function';
import { SharedEventService } from '../../services/shared-event.service';

@Component({
  selector: 'app-charges',
  templateUrl: './charges.component.html',
  styleUrls: ['./charges.component.scss'],
})
export class ChargesComponent implements OnInit {
  @Input() isAddNewSection: boolean = true;
  @Input() isOnlyShow: boolean = true;
  @Input() OATab: boolean;
  chargesData = shared.chargeRow;
  isHoldType: any = 'add';
  submitted = false;

  freightTermList: any = [];
  enquiryRateList: any = [];
  batch_ID: any;
  filterBody = this.apiService.body;
  isNegative: boolean = false;
  isNegative1: boolean = false;
  id: any;
  enquiryNumber: any;
  enquiry_ID: any;
  batchDetails: Batch;
  shippingLineName: any;
  costItems: CostItem[];
  preCarrigeName: string = '';
  shippingLineId: string = '';
  shippingCharges: [];
  isExport: boolean = false;
  newenquiryForm: FormGroup;
  chargeBasic: SystemType[];
  chargeName: any;
  hsnCode: any;
  chargeTermList: SystemType[];
  currencyList: Currency[];
  tenantId: any;
  supplierList: PartyMaster[];
  quotationDetails: Quotation;
  urlParam: any;
  isShow: boolean = false;
  userdetails: any
  currentUser: any
  userCountry: any = ''
  isTransport: boolean;
  isImport: boolean;
  decimalNumber: any;
  constructor(
    private router: Router,
    private sharedEventService: SharedEventService,
    private commonService: CommonService,
    private commonFunction: CommonFunctions,
    private route: ActivatedRoute,
    private notification: NzNotificationService,
    public loader: LoaderService,
    public apiService: ApiSharedService,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private cognito: CognitoService
  ) {
    this.isExport = localStorage.getItem('isExport') === 'true' ? true : false;
    this.isImport = localStorage.getItem('isImport') === 'true' ? true : false;
    this.isTransport = localStorage.getItem('isTransport') === 'true' ? true : false;
    this.batch_ID = this.route.snapshot.params['id'];
    this.route.params.subscribe((params) => (this.urlParam = params));
    this.isShow = this.urlParam?.access == 'show' ? true : false;;

    this.newenquiryForm = this.fb.group({
      charge: this.fb.array([])
    });

    this.userdetails = this.commonFunction.getCognitoUserDetail();

    // this.cognito.getUserDatails()?.subscribe((resp) => {
    //   if (resp != null) { 
    // this.userdetails = resp.userData

    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      agentId: this.userdetails.agentId,
    }
    this.commonService.getSTList('agent', payload)?.subscribe((data: any) => {
      this.currentUser = data.documents[0]
      this.decimalNumber = data.documents[0].decimalNumber
      this.userCountry = this.currentUser?.addressInfo?.countryName
    })
    //   }
    // })
  }

  isIndian() {
    if (this.userCountry.toLowerCase() === 'india') {
      return true
    }
    else {
      return false
    }
  }
  currentUrl: string;
  show: boolean = false;
  ngOnInit(): void {
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.tenantId = resp.tenantId
      }
    })
    this.getBatches();
    this.getChargeTerm();
    this.costItem();
    this.getCurrencyDropDowns();
    this.getSystemTypeDropDowns();
    this.getSupplierParty();
    this.currentUrl = this.router.url.split('?')[0].split('/')[3]
    if (this.currentUrl === 'show') {
      this.newenquiryForm.disable();
      this.show = true
    }
  }
  invoice: any
  changeInoice(event) {
    this.router.navigate(['batch/list/add/' + this.batch_ID + '/invoice/add'], {
      queryParams: {
        type: event.target.value
      },
    })


  }

  getSystemTypeDropDowns() {
    let payload = this.commonService.filterList()

    if (payload?.query) payload.query = {
      status: true,
      "typeCategory": {
        "$in": [
          "chargeType"
        ]
      }
    }

    this.commonService.getSTList("systemtype", payload)?.subscribe((res: any) => {
      this.chargeBasic = res?.documents?.filter(x => x.typeCategory === "chargeType");
    })
  }
  getSystemType(id) {

    let payload = this.commonService.filterList()
    payload.query = {
      systemtypeId: id,
    }


    this.commonService.getSTList("systemtype", payload)?.subscribe((res: any) => {
      this.preCarrigeName = res?.documents[0]?.typeName
    });
  }
  getBatches() {

    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      batchId: this.batch_ID,
    }

    let data: any = [];
    this.commonService
      .getSTList('batch', payload)
      ?.subscribe((result) => {
        let response = result?.documents[0]
        this.getQuotation(result?.documents[0]);
        this.shippingLineName = response?.routeDetails?.finalShippingLineName ?
          response?.routeDetails?.finalShippingLineName :
          response?.quotationDetails?.carrierName;
        this.batchDetails = result?.documents[0];
        if (this.batchDetails?.statusOfBatch == 'Job Cancelled' || this.batchDetails?.statusOfBatch == 'Job Closed') {
          this.newenquiryForm.disable();
          this.isShow = true
        }
        this.shippingLineId = response?.enquiryData?.shippingLineId;
        this.enquiryNumber = response?.enquiryNo;
        this.enquiry_ID = response?.enquiryId;
        this.getSystemType(this.batchDetails?.enquiryData?.onCarriageId)
        this.getCharges();
      });
  }
  getQuotation(doc) {
    let payload = this.commonService.filterList()

    payload.query = {
      'quotationId': doc.quotationId
    }

    this.commonService.getSTList('quotation', payload)
      ?.subscribe((res: any) => {
        this.quotationDetails = res.documents[0]
        this.getEnquiry(doc);
      })
  }
  shipperName: any
  getEnquiry(res) {
    this.id = res?.enquiryId;

    let payload = this.commonService.filterList()

    this.filterBody = this.apiService.body;
    if (this.isExport || this.isTransport) {
      payload.query = {
        enquiryId: res?.enquiryId,
      }
      let data: any = [];
      this.commonService.getSTList('enquiry', payload)?.subscribe(
        (result) => {
          this.enquiryRateList = result?.documents;
          this.setGstType()
          // this.getCharges();
        },
        (error) => {
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
    }
    if (this.isImport) {

      payload.query = {
        agentadviceId: res?.agentadviceId,
      }

      let data: any = [];
      this.commonService.getSTList('agentadvice', this.filterBody)?.subscribe(
        (result) => {
          this.enquiryRateList = result?.documents;
          let shipper = result?.documents[0]?.partyDetails.filter(x => x.partyType.toLowerCase() === 'shipper')[0]
          this.shipperName = shipper?.customerName

        },
        (error) => {
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );

    }

  }
  setGstType() {
    if (this.enquiryRateList[0].basicDetails.billingCountry?.toLowerCase() == 'india' || this.enquiryRateList[0].basicDetails.billingCountry?.toLowerCase() == 'ind'
      || this.enquiryRateList[0].basicDetails.billingCountry?.toLowerCase() == '' || this.enquiryRateList[0].basicDetails.billingCountry?.toLowerCase() == undefined) {

      if (this.quotationDetails?.branchStateCode == this.enquiryRateList[0].basicDetails.billingStateCode) {
        this.gstType = 'cgst'
      } else {
        this.gstType = 'igst'
      }
    } else {
      this.gstType = 'tax'
    }
    // if(!data){
    //   this.getChargeControls().forEach((element,index) => {
    //     let control = this.newenquiryForm.controls.charge['controls'][index].controls
    //   control.gstType.setValue(this.gstType)
    //     this.calcBuyAMT(index)
    //   })
    // }
  }






  saveCharge() {
    // this.deleteEnquiryCharges()
    // !(element?.value.isEnquiryCharge || element?.value.isInvoiceCreated
    this.submitted = true
    if ((this.newenquiryForm.get('charge') as FormArray).invalid) {
      return false;
    }
    let dataUpdate = [];
    let dataInsert = [];
    this.getChargeControls().forEach(element => {

      // if (!(element?.value.isInvoiceCreated || element?.value.isPrincipleCreated)) {
      if (element.value.enquiryitemId == '' || element.value.enquiryitemId == null) {
        let charge = {
          batchId: this.route.snapshot.params['id'],
          enquiryId: '',
          "isReceiptCreated": element.value.isReceiptCreated || false,
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
          "tenantMargin": Number(element.value.margin) || 0,
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
            "isReceiptCreated": false,

          },
          "selEstimates": {
            "currencyId": element.value.currencySell || '',
            currencySellName: element?.value.currencySellName || '',
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
            "isReceiptCreated": false,
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
          "isInvoiceCreated": element.value.isInvoiceCreated || false,
          "isEnquiryCharge": false,
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
          "tenantMargin": Number(element.value.margin) || 0,
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
            invoiceNo: element?.value?.buyInvoice || null,
            invoiceId: element?.value?.buyInvoiceId || null,
            isInvoiceCreated: element?.value?.buyisInvoiceCreated || false,
            buyerInvoice: element?.value?.buyerInvoice || false,
            isReceiptCreated: element.value.isReceiptCreatedBuy || false,
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
            invoiceNo: element?.value?.sellInvoice || null,
            invoiceId: element?.value?.sellInvoiceId || null,
            isInvoiceCreated: element.value.sellisInvoiceCreated || false,
            sellerInvoice: element.value.sellerInvoice || false,
            isReceiptCreated: element.value.isReceiptCreatedSell || false,
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
          "isReceiptCreated": element.value.isReceiptCreated || false,
          "isPrincipleCreated": element.value.isPrincipleCreated || false,
          "isInvoiceCreated": element.value.isInvoiceCreated || false,
          "isEnquiryCharge": element.value.isEnquiryCharge || false,
        }
        dataUpdate.push(charge)
      }
      // }

    });
    // this.costItemList.forEach(element => {
    //   if (element?.isEnquiryCharge || element?.isInvoiceCreated || element?.isPrincipleCreated) {
    //     dataUpdate.push(element)
    //   }

    // })

    // this.costItemList.forEach((element, index) => {
    //   if (element.enquiryitemId !== null) {
    //     dataUpdate.push({ ...element, batchNo: this.batchDetails?.batchNo,
    //       vendorId: element?.vendorId || '',
    //     vendorName : element?.vendorName || '' } );
    //   } else {
    //     dataInsert.push({
    //         ...element,
    //         batchId: this.route.snapshot.params['id'],
    //         enquiryId: '',
    //         batchNo: this.batchDetails?.batchNo,
    //         vendorId: element?.vendorId || '',
    //     vendorName : element?.vendorName || ''
    //       });
    //   }
    // });

    if (dataInsert.length > 0) {
      this.commonService
        .batchInsert('enquiryitem/batchinsert', dataInsert)
        ?.subscribe({
          next: () => {
            this.sharedEventService.emitChargeSaved();
          },
          error: (err) => {
            console.error('Batch insert failed:', err);
          }
        });
    }
    if (dataUpdate.length > 0) {
      this.commonService
        .batchUpdate('enquiryitem/batchupdate', dataUpdate)
        ?.subscribe();
    }
    this.submitted = false

    setTimeout(() => {
      let payload = this.commonService.filterList()
      if (payload?.query) payload.query = {
        batchId: this.batch_ID,
      }
      this.commonService
        .getSTList('batch', payload)
        ?.subscribe((result) => {
          let response = result?.documents[0]
          this.commonService.UpdateToST(`batch/${response?.batchId}`, { ...response, amount: Number(this.sellTotal) || 0 })?.subscribe()
        })
    }, 2000);


    setTimeout(() => {
      this.getCharges();
      this.notification.create('success', 'Saved Successfully', '');
      // this.getBatches();
      // this.getMilestone();
    }, 1000);

  }
  milestoneList: any = []
  getMilestone() {
    let payload: any = this.commonService.filterList()
    if (payload?.query) payload.query = {
      "entityId": this.batch_ID,
      isUpdated: true,
      "eventData.eventState": "ActualDate"
    };
    if (payload?.sort) payload.sort = {
      "asc": ['eventSeq'],
    };
    this.commonService.getSTList('event', payload)?.subscribe((data: any) => {
      this.milestoneList = data.documents;
    });

  }
  deleteArray: any = []



  deleteEnquiryCharges(enquiryitemId?) {
    if (this.deleteArray.length === 0) { return false }
    this.deleteArray.forEach(element => {
      const body = element;
      this.commonService
        .deleteST(`enquiryitem/${element.enquiryitemId}`)
        ?.subscribe((res: any) => {
          if (res) {
            this.getCharges();
          }
        });
    });

  }
  onClose() {
    this.router.navigate(['/batch/list']);
  }
  gstAmount(data) {
    let amount = data?.rate * data?.quantity || 1
    if (data?.currency?.toLowerCase === 'inr') {
      return Number((amount * data?.gst * Number(data?.exchangeRate) / 100).toFixed(0))
    } else {
      return Number((((amount * Number(data?.exchangeRate)) * data?.gst / 100)).toFixed(0))
    }
  }
  totalAmount(data) {
    return Number(Number(data?.amount).toFixed(0))
  }



  getChargeControls() {
    return (this.newenquiryForm.get('charge') as FormArray).controls;
  }

  getChargeControlsLength(): number {
    return (this.newenquiryForm.get('charge') as FormArray).length;
  }
  goto(id, type) {
    this.router.navigate(['batch/list/add/' + this.batch_ID + '/invoice/' + id + '/edit'], {
      queryParams: {
        type: type
      }
    })
  }
  gstType: any = 'igst'
  addChargeRow(item?: any, i?): void {
    // below code commented because it was never used a variable
    // const controlsIndex = this.newenquiryForm.controls.charge['controls'][i].controls
    const row = this.fb.group({

      enquiryitemId: [item ? item.enquiryitemId : ''],

      chargeName: [item ? item.costItemId : null, Validators.required],
      basic: [item ? item.basicId : null],
      quantity: [item ? item.quantity : null, Validators.required],

      gst: [item ? item.gst || 0 : 0],
      gstType: [item ? item.gstType || this.gstType : this.gstType],
      currencyBuy: [item ? item.buyEstimates?.currencyId : null, Validators.required],
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
      supplier: [item ? item.buyEstimates?.supplier : null],
      buyerInvoice: [item ? item.buyEstimates?.buyerInvoice : null],


      currencySell: [item ? item.selEstimates?.currencyId : null, Validators.required],
      currencySellName: [item ? item.selEstimates?.currencySellName || this.currencyList?.filter(x => x?.currencyId == item.selEstimates?.currencyId)[0]?.currencyShortName?.toUpperCase() : ''],
      sellRate: [item ? item.selEstimates?.rate : null],
      sellTotal: [item ? item.selEstimates?.amount : null],
      sellExRate: [item ? item.selEstimates?.exChangeRate : null],

      sellTaxable: [item ? item.selEstimates?.taxableAmount : 0],
      sellIgst: [item ? item.selEstimates?.igst : null],
      sellCgst: [item ? item.selEstimates?.cgst : null],
      sellSgst: [item ? item.selEstimates?.sgst : null],

      isReceiptCreatedBuy: [item ? item.buyEstimates?.isReceiptCreated : false],
      isReceiptCreatedSell: [item ? item.selEstimates?.isReceiptCreated : false],

      buyisInvoiceCreated: [item ? item.buyEstimates?.isInvoiceCreated : false],
      sellisInvoiceCreated: [item ? item.selEstimates?.isInvoiceCreated : false],
      sellTotalINR: [item ? item.selEstimates?.totalAmount : 0],
      sellInvoice: [item ? item?.selEstimates?.invoiceNo : null],
      sellInvoiceId: [item ? item?.selEstimates?.invoiceId : null],
      sellTerm: [item ? item.selEstimates?.terms : null],
      remarks: [item ? item.selEstimates?.remarks : null],
      sellerInvoice: [item ? item.selEstimates?.sellerInvoice : null],

      margin: [item ? item.tenantMargin || 0 : 0],
      isEnquiryCharge: [item ? item.isEnquiryCharge : false],
      isInvoiceCreated: [item ? item.isInvoiceCreated : false],
      invoiceId: [item ? item.invoiceId : ''],
      invoiceNo: [item ? item.invoiceNo : ''],
      amount: [item ? item.amount : ''],
      moveNumber: [item ? item.moveNumber : ''],
      isPrincipleCreated: [item ? item.isPrincipleCreated : false],
      isReceiptCreated: [item ? item.isReceiptCreated : false],
      invoiceStatus: [item ? item?.invoiceStatus : null]
    });

    (this.newenquiryForm.get('charge') as FormArray).push(row);
    // this.newenquiryForm.get('charge').disable(); Bhumit changes  
    if (i > -1) {
      const controls = (this.newenquiryForm.get('charge') as FormArray).controls;
      controls.forEach((element, index) => {
        if (element?.value.isEnquiryCharge || element?.value.isInvoiceCreated || element?.value.isPrincipleCreated) {
          // element.disable();
        }
      });
      this.calcBuyAMT(i)
    }
  }
  // deleteCharge(index: number): void {
  //   (this.newenquiryForm.get('charge') as FormArray).removeAt(index);
  // }
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
          this.commonService.deleteST(`enquiryitem/${payload.enquiryitemId}`)?.subscribe((res: any) => {
            this.notification.create(
              'success',
              'Deleted Successfully',
              ''
            );
          })
        }
        else {
          this.notification.create(
            'success',
            'Deleted Successfully',
            ''
          );
        }
        (this.newenquiryForm.get('charge') as FormArray).removeAt(index);
        // const itemData = this.costItemList?.filter(
        //   (item) => item !== data
        // );
        // this.costItemList = itemData;
        // this.SaveCharge.emit(this.costItemList);
      }
    });



  }
  documentData: document[] = [];
  mail(key, doc, type) {
    const modalRef = this.modalService.open(FreightCertificateComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg'
    });
    modalRef.componentInstance.currencyName = this.batchDetails?.quotationDetails?.currencyShortName;
    modalRef.componentInstance.refId = this.route.snapshot.params['id'];
    modalRef.componentInstance.quotationid = this.batchDetails?.quotationId
    modalRef.componentInstance.component = 'batch';
    modalRef.componentInstance.documentData = this.documentData;
    modalRef.componentInstance.type = type;
    const charge = (this.newenquiryForm.value?.charge ?? [])?.map((ch) => {
      return {
        ...ch,
        chargesName: this.chargeName.find(chargesdetails => chargesdetails?.costitemId === ch?.chargeName)?.costitemName ?? '',
        chargesId: ch?.chargeName,
        sellTotalINR: ch?.sellTotalINR,
        buyTotalINR: ch?.buyTotalINR,
        currencyBuy: ch?.currencyBuy,
        currencySell: ch?.currencySell
      }
    })
    modalRef.componentInstance.charges = charge;
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
  getChargeTerm() {
    let payload = this.commonService.filterList();
    if (payload?.query) payload.query = {
      typeCategory: "chargeTerm",
      "status": true
    }
    this.commonService.getSTList('systemtype', payload)?.subscribe((res: any) => {
      this.chargeTermList = res?.documents;


    });
  }
  setQuantity(i) {
    let control = this.newenquiryForm.controls.charge['controls'][i].controls;
    let data = this.chargeBasic?.filter(x => x?.systemtypeId === control.basic.value)[0];
    let noContainer = 0
    if (data?.typeName?.toLowerCase() == 'container charge' || data?.typeName?.toLowerCase() == 'container') {
      this.batchDetails?.enquiryDetails?.containersDetails.filter((c) => {
        noContainer += Number(c.noOfContainer || 0)
      })
      control.quantity.setValue(noContainer || 1)
    } else if (data?.typeName?.toLowerCase() == 'kgs' || data?.typeName?.toLowerCase() == 'kg') {
      control.quantity.setValue(Number(this.batchDetails?.enquiryDetails?.looseCargoDetails?.grossWeight) || 0)
    } else if (data?.typeName?.toLowerCase() == 'cbm') {
      control.quantity.setValue(Number(this.batchDetails?.enquiryDetails?.looseCargoDetails?.grossVolume) || 0)
    } else {
      control.quantity.setValue(1)
    }
    this.calcBuyAMT(i)
  }
  setGSTtoRow(i) {
    let control = this.newenquiryForm.controls.charge['controls'][i].controls;
    let data = this.chargeName?.filter(x => x?.costitemId === control.chargeName.value)[0];

    control.currencyBuy.setValue(data?.currencyId)
    control.currencySell.setValue(data?.currencyId)
    control.buyRate.setValue(data?.chargeAmount)

    let noContainer = 0
    if (data?.chargeTypeName?.toLowerCase() == 'container charge' || data?.chargeTypeName?.toLowerCase() == 'container') {
      this.batchDetails?.enquiryDetails?.containersDetails?.filter((c) => {
        noContainer += Number(c.noOfContainer || 1)
      })
      control.quantity.setValue(noContainer || 1)
    } else {
      control.quantity.setValue(1)
    }

    control.gst.setValue(data?.gst || 0)
    control.hsnCode.setValue(data?.hsnCode || "")
    control.basic.setValue(data?.chargeType || '')
    this.calcBuyAMT(i)
  }
  buyTotal = 0;
  sellTotal = 0
  buyTaxable = 0;
  sellTaxable = 0
  calcBuyAMT(i) {
    this.buyTotal = 0
    this.sellTotal = 0
    this.buyTaxable = 0
    this.sellTaxable = 0
    let control = this.newenquiryForm.controls.charge['controls'][i].controls
    control.buyTotal.setValue(Number((control.buyRate.value * control.quantity.value).toFixed(2)))
    control.buyTaxable.setValue(Number((Number(control.buyExRate.value) * Number(control.buyRate.value) * Number(control.quantity.value)).toFixed(2)))

    control.sellTotal.setValue(Number((Number(control.sellRate.value) * Number(control.quantity.value)).toFixed(2)))
    control.sellTaxable.setValue(Number((Number(control.sellExRate.value) * Number(control.sellRate.value) * Number(control.quantity.value)).toFixed(2)))

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
    this.newenquiryForm.controls.charge['controls'].forEach(element => {
      this.buyTotal += element.controls.buyTotalINR.value || 0
      this.sellTotal += element.controls.sellTotalINR.value || 0
    });
    this.newenquiryForm.controls.charge['controls'].forEach(element => {
      this.buyTaxable += element.controls.buyTaxable.value || 0
      this.sellTaxable += element.controls.sellTaxable.value || 0
    });
    this.isNegative1 = (this.sellTaxable - this.buyTaxable) < 0;
    this.isNegative = (this.sellTotal - this.buyTotal) < 0;
  }

  buyCurrChange(i) {
    let control = this.newenquiryForm.controls.charge['controls'][i].controls

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
        control.buyExRate.setValue(exRate.toFixed(3))
        this.calcBuyAMT(i)
        // control.sellExRate.setValue(exRate) 
      })
    }
    else {
      exRate = 1
      control.buyExRate.setValue(exRate.toFixed(3))
      this.calcBuyAMT(i)
      // control.sellExRate.setValue(exRate) 
    }


  }
  sellCurrChange(i) {
    let control = this.newenquiryForm.controls.charge['controls'][i].controls

    let sellcurrencyName = this.currencyList?.filter(x => x?.currencyId == control.currencySell.value)[0]?.currencyShortName?.toUpperCase()
    // let exRate = this.currencyList?.filter(x => x?.currencyId ==
    //   control.currencySell.value)[0]?.currencyPair || 1

    control.currencySellName.setValue(sellcurrencyName)

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
        control.sellExRate.setValue(exRate.toFixed(3))
        this.calcBuyAMT(i)
      })
    }
    else {
      exRate = 1
      control.sellExRate.setValue(exRate.toFixed(3))
      this.calcBuyAMT(i)
    }


  }

  getCharges() {
    const formArray = this.newenquiryForm.get('charge') as FormArray;
    formArray.clear();
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
    let payload;
    if (!this.batchDetails?.quickJob) {
      payload = this.commonService.filterList()
      payload.query = {
        quotationId: this.batchDetails?.quotationId
      }
    }
    else {
      payload = this.commonService.filterList()
      payload.query = {
        batchId: this.batch_ID
      }
    }
    if (payload?.sort) payload.sort = {
      "asc": ['createdOn'],
    };
    this.commonService.getSTList('enquiryitem', payload)?.subscribe((result) => {
      result?.documents?.forEach((element, index) => {
        this.addChargeRow(element, index)
      });
    });
  }
}