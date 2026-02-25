
import { smartagent } from 'src/app/admin/smartagent/data';
import { Component, OnInit, Output, EventEmitter, Input, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ApiService } from 'src/app/admin/principal/api.service';
import { shared } from '../../data';
import { differenceInCalendarDays } from 'date-fns';
import * as Constant from 'src/app/shared/common-constants';
import { CommonFunctions } from '../../functions/common.function';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { ApiSharedService } from '../api-service/api-shared.service';
import { CommonService } from '../../../services/common/common.service';
import { Subject } from 'rxjs';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { OrderByPipe } from '../../../shared/util/sort';
import { CognitoService } from 'src/app/services/cognito.service';
import * as pdfjsLib from 'pdfjs-dist';
import { agentAdvice } from 'src/app/admin/agent-advise/data';
import { elements } from 'chart.js';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
import { LoaderService } from 'src/app/services/loader.service';
import { Location } from '@angular/common';
@Component({
  selector: 'app-new-quote',
  templateUrl: './new-quote.component.html',
  styleUrls: ['./new-quote.component.scss']
})
export class NewQuoteComponent implements OnInit {
  currentUrl: string;
  tabs = smartagent.quoteTabs;
  loader = true
  totalCount = 5
  holdControl: any;
  enquiryId: any;
  enquiryDetails: any;
  quotationList: any = [];
  openQuotaion: boolean = false;
  quoteForm: FormGroup;
  enquiryDateValid: boolean;
  currencyList: any;
  shippingLineList: any;
  portList: any;
  loadPortList: any;
  destPortList: any;
  ICDlocationList: any;
  preCarrigeList: any;
  vesselList: any;
  chargeName: any;
  chargeTermList: any;
  supplierList: any;
  shipperEmail: any
  chargeBasic: any;
  submitted: boolean;
  userData: any;
  Documentpdf: any;
  editQuoteDetails: any = [];
  isEditQoute: boolean = false;
  isExport: boolean;
  isImport: boolean;
  isTransport: boolean;
  isOnlyView: boolean = false;
  urlParam: any;
  isNegative: boolean = false;
  emailForm: FormGroup
  userdetails: any
  currentUser: any
  userCountry: any = ''
  buyTotalTax = 0;
  sellTotalTax = 0;
  fromdateValue: any = '';
  todateValue: any = '';
  todayDate = new Date();
  _gc = GlobalConstants
  hideCreateQuote: boolean = false;
 
  constructor(private router: Router,
    private location: Location,
    private modalService: NgbModal,
    public formBuilder: FormBuilder,
    public notification: NzNotificationService,
    private _api: ApiService,
    private route: ActivatedRoute,
    private commonFunction: CommonFunctions,
    private tranService: TransactionService,
    private apiSharedService: ApiSharedService,
    public commonService: CommonService,
    private mastersService: MastersService,
    public loaderService: LoaderService,
    private sortPipe: OrderByPipe, private cognito: CognitoService,) {
    this.currentUrl = window.location.href.split('?')[0]?.split('/').pop();
    this.isExport = localStorage.getItem('isExport') === 'true' ? true : false;
    this.isImport = localStorage.getItem('isImport') === 'true' ? true : false;
    this.isTransport = localStorage.getItem('isTransport') === 'true' ? true : false;
    this.holdControl = this.currentUrl;

    this.getVoyage()
    this.quoteForm = this.formBuilder.group({
      validFrom: ['', Validators.required],
      validTo: ['', Validators.required],
      currency: ['', Validators.required],
      currencyShortName: [''],
      exRate: ['', Validators.required],
      shipping_line: ['', Validators.required],
      carrierReceipt: [''],
      etd: [''],
      load_port: ['', Validators.required],

      discharge_port: ['', Validators.required],
      eta: [''],
      branch: ['', Validators.required],
      plannedVessel: ['', Validators.required],
      voyageNumber: ['', Validators.required],
      carrierDelivery: [''],

      destPortFreeDays: [''],
      originFreeDays: [''],
      destFreeDays: [''],
      remarks: [''],


      charge: this.formBuilder.array([])
    })
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.userdetails = resp.userData
      }
    })
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      agentId: this.userdetails?.agentId,
    }

    this.commonService.getSTList('agent', payload)?.subscribe((data: any) => {
      this.currentUser = data.documents[0]
      this.userCountry = this.currentUser?.addressInfo?.countryName
    })

  }
  disabledEtaDate = (current: Date): boolean => {
    if (this.todateValue)
      return current >= new Date(this.todateValue);
    else
      return false;
  };


  disabledEtdDatee = (current: Date): boolean => {

    if (this.fromdateValue)
      return differenceInCalendarDays(current, new Date(this.fromdateValue)) < 0;
    else
      return false;
  }
  isIndian() {
    if (this.userCountry.toLowerCase() === 'india') {
      return true
    }
    else {
      return false
    }
  }
  sort(array, key) {
    return this.sortPipe.transform(array, key);
  }
  ngOnInit(): void {
    if(!this.isTransport){
      this.tabs = smartagent.quoteTabs?.filter((x) => x.name !== 'Bidding')
    } 
    this.emailForm = this.formBuilder.group({
      email: ['', [Validators.required]]
    });

    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.userData = resp


      }
    })
    this.getBidding()
    this.enquiryId = this.route.snapshot.params['id'];
    // let data = this.route.snapshot.url;

    // if(data[3]?.path === 'add'){
    //   this.openQuotaion = true
    // }
    this.getQuotation()
    this.getEnquiry()
    this.getDocuments()
    this.getCurrency()
    this.getShippingLineDropDowns()
    this.getPortDropDowns()
    this.getICDLocation()
    this.getVesselListDropDown()
    this.costItem()
    this.getChargeTerm()
    this.getSupplierParty()
    this.getSystemTypeDropDowns()
    this.getBranchList()
  }
  getQuotation() {
    let payload = {
      "project": [],
      "query": {},
      "sort": {
        "asc": ["quotationNo"]
      },
      size: Number(1000),
      from: 0,
    }

    if (this.isImport) {
      payload.query = {
        agentadviceId: this.enquiryId,
      }
    } else {
      if (payload?.query) payload.query = {
        enquiryId: this.enquiryId,
      }
    }


    this.commonService.getSTList('quotation', payload)
      ?.subscribe((res: any) => {
        this.quotationList = res.documents

      })
  }

  branchList: any = []
  getBranchList() {

    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      orgId: this.commonFunction.getAgentDetails().orgId,
    }
    this.commonService.getSTList('branch', payload)
      ?.subscribe((data) => {
        this.branchList = data.documents;
      });
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
  getPartyMaster(shipperId) {
    let payload = this.commonService.filterList()
    payload.query = {
      "partymasterId": shipperId,
    }
    this.commonService
      .getSTList('partymaster', payload)?.subscribe((res: any) => {
        this.shipperEmail = res?.documents[0];
        let Email = [];
        if (this.shipperEmail?.primaryMailId) {
          Email.push(this.shipperEmail?.primaryMailId)
        }
        if (this.shipperEmail?.saleemail) {
          Email.push(this.shipperEmail?.saleemail)
        }
        this.emailForm.controls.email.setValue(Email?.map(item => item)?.join(','))
      });
  }
  getVesselListDropDown() {
    let payload = this.commonService.filterList()
   if(payload?.query) payload.query = {
      status: true
    }
    this._api
      .getSTList('vessel', payload)
      ?.subscribe((res: any) => {
        this.vesselList = res?.documents;
      });
  }
  async getVoyage() {
    let payload = this.commonService.filterList()
    payload.query = { status: true }
    await this._api
      .getSTList('voyage', payload)
      ?.subscribe((res: any) => {
        this.vesselList = res?.documents;
      });
  }
  setVoyage(e) {
    let vessel = this.vesselList?.filter((x) => x?.vesselId == e)[0]?.voyage
    if (vessel?.length > 0) {
      let voyageNo = vessel?.filter((x) => x?.shipping_line == this.quoteForm.value.shipping_line)[0]?.voyage_number
      this.quoteForm.controls.voyageNumber.setValue(voyageNo);
    }
  }
  getICDLocation() {

    let payload = this.commonService.filterList()

    if (payload?.query) payload.query = {
      status: true,
      masterType:   {
        "$in": ['YARD','CFS','ICD']
      },
    }


    this.commonService.getSTList("location", payload)?.subscribe((res: any) => {
      this.ICDlocationList = res?.documents;
      this.preCarrigeList = res?.documents?.filter(x => x?.country?.toLowerCase() === 'india')
    });
  }
  getPortDropDowns() {
    let payload = this.commonService.filterList()

    if (payload?.query) payload.query = {
      status: true,
    }

    this.commonService.getSTList("port", payload)?.subscribe((res: any) => {
      this.portList = res?.documents;
      this.loadPortList = res?.documents;
      this.destPortList = res?.documents;
      // this.loadPortList = this.portList?.filter((x) => x.country?.countryName?.toLowerCase() === 'india')
      // this.destPortList = this.portList?.filter((x) => x.country?.countryName?.toLowerCase() !== 'india')
    });
  }
  getShippingLineDropDowns() {

    let payload = this.commonService.filterList()

    if (payload?.query) payload.query = {
      status: true,
      // "$and": [
      //   {
      //     "feeder": {
      //       "$ne": true
      //     }
      //   }
      // ]
    }

    this.commonService.getSTList("shippingline", payload)?.subscribe((res: any) => {
      this.shippingLineList = res?.documents;

    });
  }
  getCurrency() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      status: true,
    }
    this.commonService.getSTList("currency", payload)?.subscribe((res: any) => {
      this.currencyList = res?.documents;


    })
  }
  documentList: any = []
  activeFrightAir : boolean = false;
  showContainer: boolean = false;
  showPallet: boolean = false;
  typeOfWay:string='';
  shipment:string='';
  originRouteList : any = []
  destinationRouteList : any = []
  isTrasportSelf:boolean=false;

  getDocuments(){ 
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      refId: this.enquiryId,
    }

    this.commonService.getSTList('document', payload)
      ?.subscribe((res: any) => {
        res?.documents?.filter(x=>{
          this.documentList.push({...x,msdsDoc : x?.documentName})
        })
      })
  }
  getEnquiry() {
    let url = "";
    let payload = this.commonService.filterList()
    if (this.isImport) {
      url = Constant.AGENTADVICE_LIST;
      payload.query = {
        agentadviceId: this.enquiryId,
      }
    } else {
      url = Constant.ENQUIRY_LIST;
      if (payload?.query) payload.query = {
        enquiryId: this.enquiryId,
      }
    }

    this.commonService.getSTList(url, payload)
      ?.subscribe((res: any) => {
        this.loader = false;
        this.enquiryDetails = res.documents[0];

        if(this.enquiryDetails?.transportDetails?.origin[0]?.transpoterType === 'self' && this.isTransport){
          this.isTrasportSelf = true
        }
        this.shipment = this.enquiryDetails?.basicDetails?.ShipmentTypeName?.toLowerCase()
        let loadName = this.enquiryDetails?.basicDetails?.loadType?.toLowerCase()

        if(this.shipment === 'air'){
          this.activeFrightAir=true;
        } 

      
        if (this.enquiryDetails?.transportDetails?.origin?.length > 0) { 
          if (this.shipment === 'air' || this.shipment === 'ocean') {
          this.originRouteList = this.enquiryDetails?.transportDetails?.origin?.filter((x,i) => i+1 !== this.enquiryDetails?.transportDetails?.origin?.length);
          }else{
            this.originRouteList = this.enquiryDetails?.transportDetails?.origin
          }
        }
        if (this.enquiryDetails?.transportDetails?.destination?.length > 0) {
        this.destinationRouteList =  this.enquiryDetails?.transportDetails?.destination
        }
        if(!this.enquiryDetails?.enquiryNo){
          this.enquiryDetails['enquiryNo']=this?.enquiryDetails?.agentadviceNo || '';
        }
     
        if (loadName) {
          if (['loose', 'lcl', 'ltl','ptl'].includes(loadName)) {
            this.showPallet = true;
            this.showContainer = false;
          } else if (['break bulk'].includes(loadName)) {
            this.showPallet = false;
            this.showContainer = false;
          } else {
            this.showPallet = false;
            this.showContainer = true;
            if (['uld container', 'fcl'].includes(loadName)) {
              this.typeOfWay = "Container"
            } else if (['ftl'].includes(loadName)) {
              this.typeOfWay = "Truck"
            } else if (['fwl'].includes(loadName)) {
              this.typeOfWay = "Wagon"
            }else{
               this.typeOfWay = "Container"
            }
          }
        } else {
          this.showPallet = false;
          this.showContainer = false;
        }

        this.enquiryDetails?.cargoDetail?.filter((x) => {
          if (x?.msdsDoc !== '' && x?.msdsDoc) {
            x['documentType']='MSDS';
            this.documentList.push(x)
          }
        })
      })
  }
  onTab(data) {
    this.router.navigate([
      `/${this.isImport ? 'agent-advice' : "enquiry"}/list/` + this.enquiryId + '/' + data.key,
    ]);
    this.holdControl = data.key;

  }
  openQuote() {

    this.router.navigate([`/${this.isImport ?  'agent-advice' :"enquiry" }/list/` + this.enquiryId + '/newquote']);

    return;
    // this.location.go(`/${this.isExport ? "enquiry" : 'agent-advice'}/list/` + this.enquiryId + '/new-quote');
    this.editQuoteDetails = []
    this.isOnlyView = false
    this.quoteForm.reset();
    const formArray = this.quoteForm.get('charge') as FormArray;
    formArray.clear();
    this.quoteForm.patchValue({
      shipping_line: this.isExport ? this.enquiryDetails?.routeDetails?.shippingLineId : this.enquiryDetails?.routeDetails?.shippinglineId,
      branch: this.enquiryDetails?.basicDetails?.userBranch || '',

      carrierReceipt: this.enquiryDetails?.routeDetails?.carrierReceiptId || '',
      etd: this.enquiryDetails?.routeDetails?.loadPortETD || '',
      plannedVessel: this.enquiryDetails?.routeDetails?.vesselId || '',
      voyageNumber: this.enquiryDetails?.routeDetails?.voyageNumber || '',
      eta: this.enquiryDetails?.routeDetails?.destPortETA || '',
      carrierDelivery: this.enquiryDetails?.routeDetails?.carrierDeliveryId || '',
      exRate: 1,
      currency: this.currentUser?.currency?.currencyId,
      currencyShortName: this.currencyList?.filter(x => x.currencyId == this.currentUser?.currency?.currencyId)[0].currencyShortName,
      load_port: this.enquiryDetails?.routeDetails?.loadPortId,
      discharge_port: this.enquiryDetails?.routeDetails?.destPortId,
      destPortFreeDays: this.enquiryDetails?.detentionDetails?.destinationPortFD || '',
      originFreeDays: this.enquiryDetails?.detentionDetails?.originCarrierFD || '',
      destFreeDays: this.enquiryDetails?.detentionDetails?.destinationCarrierFD || '',
    })
    // this.addChargeRow()

    if (this.enquiryDetails?.charges?.length > 0) {
      let newCahrge = []
      Object?.keys(this.enquiryDetails?.charges)?.forEach((x) => {
        this.enquiryDetails?.charges?.[x]?.rates?.forEach(element => {
          newCahrge.push({
            ...element,
            containerType: x,
            quantity: element?.qty || 0,
            costItemId: element.id,
            buyEstimates: {
              rate: element?.price
            },
            selEstimates: {
              rate: element?.price
            }
          })
        });

      })
      newCahrge?.filter((x, i) => {
        this.addChargeRow(x, i)
      })
    }

    this.isEditQoute = false
    this.isCloneQuote = false;
    this.openQuotaion = true;
    // this.router.navigate(['/enquiry/list/'+ this.enquiryId + '/quote/add']);

    // openQuotaionview(){
    //   this.openQuotaion = !this.openQuotaion;
    //   this.router.navigate(['/enquiry/list/'+ this.enquiryId + '/quote']);
    // }
  }
  sumArray(arr) {
    return arr.reduce((acc, curr) => acc + curr, 0);
  }
  getChargecontainerLength(): number {
    return (this.quoteForm.get('container') as FormArray).length;
  }
  changeFromDate() {
    this.enquiryDateValid = true
    this.quoteForm.controls.validTo.setValue('')
  }
  disabledEtdDate = (current: Date): boolean => {
    this.enquiryDateValid = true
    if (this.quoteForm.controls.validFrom.value)
      return (
        differenceInCalendarDays(
          current,
          new Date(this.quoteForm.controls.validFrom.value)
        ) < 0
      );
    else return false;
  };
  get f() {
    return this.quoteForm.controls;
  }

  getChargeControls() {
    return (this.quoteForm.get('charge') as FormArray).controls;
  }

  getChargeControlsLength(): number {
    return (this.quoteForm.get('charge') as FormArray).length;
  }
  getExChangeRate() {
    return this.currencyList?.find(x => x?.currencyId ==
      this.currentUser?.currency?.currencyId)[0]?.currencyPair || 1
  }
  gstType: any = 'igst'
  addChargeRow(item?: any, i?): void {
    const row = this.formBuilder.group({

      enquiryitemId: [item ? item.enquiryitemId : ''],

      chargeName: [item ? item.costItemId : null, Validators.required],
      basic: [item ? item.basicId : null],
      quantity: [item ? item.quantity : null, Validators.required],
      gst: [item ? item.gst || 0 : 0],
      gstType: [item ? item.gstType || this.gstType : this.gstType],
      currencyBuy: [item ? item.buyEstimates?.currencyId : null, Validators.required],
      buyRate: [item ? item.buyEstimates?.rate : null],
      buyTotal: [item ? item.buyEstimates?.amount : null],
      buyExRate: [item ? item.buyEstimates?.exChangeRate || this.getExChangeRate() : this.getExChangeRate()],
      buyTaxable: [item ? item.buyEstimates?.taxableAmount : 0],
      buyIgst: [item ? item.buyEstimates?.igst : null],
      buyCgst: [item ? item.buyEstimates?.cgst : null],
      buySgst: [item ? item.buyEstimates?.sgst : null],
      buyTotalINR: [item ? item.buyEstimates?.totalAmount : 0],
      buyTerm: [item ? item.buyEstimates?.terms : null, Validators.required],
      supplier: [item ? item.buyEstimates?.supplier : null],


      currencySell: [item ? item.selEstimates?.currencyId || this.currentUser?.currency?.currencyId : this.currentUser?.currency?.currencyId, Validators.required],
      sellRate: [item ? item.selEstimates?.rate : null],
      sellTotal: [item ? item.selEstimates?.amount : null],
      sellExRate: [item ? item.selEstimates?.exChangeRate || this.getExChangeRate() : this.getExChangeRate()],

      sellTaxable: [item ? item.selEstimates?.taxableAmount : 0],
      sellIgst: [item ? item.selEstimates?.igst : null],
      sellCgst: [item ? item.selEstimates?.cgst : null],
      sellSgst: [item ? item.selEstimates?.sgst : null],

      sellTotalINR: [item ? item.selEstimates?.totalAmount : 0],
      sellTerm: [item ? item.selEstimates?.terms : null, Validators.required],
      remarks: [item ? item.selEstimates?.remarks : null],

      margin: [item ? Number(item.tenantMargin) || 0 : 0],

    });

    (this.quoteForm.get('charge') as FormArray).push(row);

    if (this.isOnlyView) {
      const controls = (this.quoteForm.get('charge') as FormArray).controls;
      controls.forEach((element) => {
        element.disable();
      });
    }

    if (i > -1) {
      this.calcBuyAMT(i)
    }

  }
  // deleteCharge(index: number): void {
  //   (this.quoteForm.get('charge') as FormArray).removeAt(index);
  // }
  deleteCharge(content1, data: any, index) {
    this.modalService.open(content1, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'md',
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
        (this.quoteForm.get('charge') as FormArray).removeAt(index);
        // const itemData = this.costItemList?.filter(
        //   (item) => item !== data
        // );
        // this.costItemList = itemData;
        // this.SaveCharge.emit(this.costItemList);
      }
    });



  }

  costItem() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      "status": true,
    }
    this.commonService.getSTList('costitem', payload)?.subscribe((data) => {
      this.chargeName = data.documents;
      // let URL = this.route.snapshot.url;
      // if(URL?.[3]?.path === 'add'){
      //   this.addChargeRow();
      // }
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

  buyTotal = 0;
  sellTotal = 0
  calcBuyAMT(i) {
    this.buyTotal = 0
    this.sellTotal = 0
    let control = this.quoteForm.controls.charge['controls'][i].controls
    control.buyTotal.setValue(Number((control.buyRate.value * control.quantity.value).toFixed(2)))
    control.buyTaxable.setValue(Number((control.buyExRate.value * control.buyRate.value * control.quantity.value).toFixed(2)))

    control.sellTotal.setValue(Number((control.sellRate.value * control.quantity.value).toFixed(2)))
    control.sellTaxable.setValue(Number((control.sellExRate.value * control.sellRate.value * control.quantity.value).toFixed(2)))

    let gstBuyValue = Number((control.buyTaxable.value * control.gst.value) / 100)
    let gstSellValue = Number((control.sellTaxable.value * control.gst.value) / 100)

    control.buyIgst.setValue(Number((gstBuyValue).toFixed(2)))
    control.buyCgst.setValue(Number((gstBuyValue / 2).toFixed(2)))
    control.buySgst.setValue(Number((gstBuyValue / 2).toFixed(2)))

    control.sellIgst.setValue(Number((gstSellValue).toFixed(2)))
    control.sellCgst.setValue(Number((gstSellValue / 2).toFixed(2)))
    control.sellSgst.setValue(Number((gstSellValue / 2).toFixed(2)))


    control.buyTotalINR.setValue(Number((gstBuyValue + control.buyTaxable.value).toFixed(2)))
    control.sellTotalINR.setValue(Number((gstSellValue + control.sellTaxable.value).toFixed(2)))


    control.margin.setValue(Number((control.sellTotalINR.value - control.buyTotalINR.value).toFixed(2)))
    this.quoteForm.controls.charge['controls'].forEach(element => {
      this.buyTotal += element.controls.buyTotalINR.value || 0
      this.sellTotal += element.controls.sellTotalINR.value || 0
      this.buyTotalTax += gstBuyValue || 0
      this.sellTotalTax += gstSellValue || 0
    });
    this.isNegative = (this.sellTotal - this.buyTotal) < 0;
  }

  buyCurrChange(i) {
    let control = this.quoteForm.controls.charge['controls'][i].controls
    // control.currencySell.setValue(control.currencyBuy.value) 
    let currencyShortName = this.currencyList?.filter(x => x?.currencyId ==
      control.currencyBuy.value)[0]?.currencyShortName

    let exRate = 0
    if (currencyShortName != this.quoteForm.value.currencyShortName) {
      let payload = {
        "fromCurrency": currencyShortName,
        "toCurrency": this.quoteForm.value.currencyShortName,
      }

      this.commonService.getExchangeRate('exchangeRate', payload)?.subscribe((result) => {

        exRate = result[this.quoteForm.value.currencyShortName]
        control.buyExRate.setValue(exRate)
        this.calcBuyAMT(i)
        // control.sellExRate.setValue(exRate) 
      })
    }
    else {
      exRate = 1
      control.buyExRate.setValue(exRate)
      this.calcBuyAMT(i)
      // control.sellExRate.setValue(exRate) 
    }

    // let exRate = this.currencyList?.filter(x => x?.currencyId ==
    //   control.currencyBuy.value)[0]?.currencyPair || 1 

  }
  sellCurrChange(i) {
    let control = this.quoteForm.controls.charge['controls'][i].controls
    // let exRate = this.currencyList?.filter(x => x?.currencyId ==
    //   control.currencySell.value)[0]?.currencyPair || 1

    // control.sellExRate.setValue(exRate) 


    let currencyShortName = this.currencyList?.filter(x => x?.currencyId ==
      control.currencySell.value)[0]?.currencyShortName


    let exRate = 0
    if (currencyShortName != this.quoteForm.value.currencyShortName) {
      let payload = {
        "fromCurrency": currencyShortName,
        "toCurrency": this.quoteForm.value.currencyShortName,
      }

      this.commonService.getExchangeRate('exchangeRate', payload)?.subscribe((result) => {

        exRate = result[this.quoteForm.value.currencyShortName]
        control.sellExRate.setValue(exRate)
        this.calcBuyAMT(i)
      })

    }
    else {
      exRate = 1
      control.sellExRate.setValue(exRate)
      this.calcBuyAMT(i)
    }


  }
  back() {

    this.router.navigate([`/${this.isImport ? 'agent-advice' : "enquiry"}/list/`]);
  }
  getCharges(quoteId) {
    let payload = this.commonService.filterList()
    payload.query = {
      "quotationId": quoteId,
      "isEnquiryCharge": true,
    }
    this.commonService.getSTList('enquiryitem', payload)?.subscribe((result) => {
      result?.documents.forEach((element, index) => {
        if (this.isCloneQuote) {
          this.addChargeRow({
            ...element,
            enquiryitemId: '',
            enquiryId: '',
            enquiryNumber: '',
          }, index)
        } else {
          this.addChargeRow(element, index)
        }
        // this.costItemList = data

      });

    });
  }
  markAllAsTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markAllAsTouched(control);
      }
    });
  }
  onSave(status) {
    this.submitted = true;

    if (this.quoteForm.invalid) {
      this.notification.create
        ('error', 'Please fill the form', '');
      this.markAllAsTouched(this.quoteForm);
      return false
    }
    // if (this.getChargecontainerLength() == 0) {
    //   this.notification.create
    //     ('error', 'Please add charge items', ''); 
    //   return false
    // }


    let newAgentAdvice = {
      isExport: localStorage.getItem('isExport') === 'true' || localStorage.getItem('isTransport') === 'true' ? true : false,
      orgId: this.commonFunction.getAgentDetails().orgId,
      tenantId: this.userData.tenantId,
      quotationId: this.editQuoteDetails?.quotationId || '',
      enquiryId: this.enquiryId || '',
      "agentadviceId": this.enquiryId || '',
      "agentadviceNo": this.enquiryDetails?.agentadviceNo || '',
      validFrom: this.quoteForm.value.validFrom,
      validTo: this.quoteForm.value.validTo,
      enquiryNo: this.enquiryDetails?.enquiryNo || '',
      currency: this.quoteForm.value.currency,
      currencyShortName: this.currencyList?.filter((x) => x.currencyId === this.quoteForm.value.currency)[0]?.currencyShortName,

      exRate: this.quoteForm.value.exRate,

      carrierId: this.quoteForm.value.shipping_line,
      carrierName: this.shippingLineList?.filter((x) => x.shippinglineId === this.quoteForm.value.shipping_line)[0]?.name,
      carrierReceiptId: this.quoteForm.value.carrierReceipt,
      carrierReceiptName: this.destPortList?.filter((x) => x.portId === this.quoteForm.value.carrierReceipt)[0]?.portDetails?.portName,

      etd: this.quoteForm.value.etd,

      loadPortId: this.quoteForm.value.load_port,

      loadPortName: this.loadPortList?.filter((x) => x.portId === this.quoteForm.value.load_port)[0]?.portDetails?.portName,


      dischargePortId: this.quoteForm.value.discharge_port,
      dischargePortName: this.destPortList?.filter((x) => x.portId === this.quoteForm.value.discharge_port)[0]?.portDetails?.portName,


      eta: this.quoteForm.value.eta,

      vesselId: this.quoteForm.value.plannedVessel,
      vesselName: this.vesselList?.filter((x) => x.vesselId === this.quoteForm.value.plannedVessel)[0]?.vesselName,
      voyageNumber: this.quoteForm.value.voyageNumber,

      carrierDeliveryId: this.quoteForm.value.carrierDelivery,
      carrierDeliveryName: this.destPortList?.filter((x) => x.portId === this.quoteForm.value.carrierDelivery)[0]?.portDetails?.portName,
      destPortFreeDays: this.quoteForm.value.destPortFreeDays || 0,
      originFreeDays: this.quoteForm.value.originFreeDays || 0,
      destFreeDays: this.quoteForm.value.destFreeDays || 0,

      totalBuy: this.buyTotal || 0,
      totalBuyTax: this.buyTotal || 0,
      totalSell: this.sellTotal || 0,
      totalSellTax: this.sellTotal || 0,
      remarks: this.quoteForm.value.remarks,

      branchId: this.quoteForm.value?.branch,
      branchName: this.branchList?.filter(x => x?.branchId === this.quoteForm.value?.branch)[0]?.branchName,
      branchStateCode: this.branchList?.filter(x => x?.branchId === this.quoteForm.value?.branch)[0]?.addressInfo.stateCode,
      jobCode: this.branchList?.filter(x => x?.branchId === this.quoteForm.value?.branch)[0]?.jobCode || '',



      quoteStatus: status ? 'Draft' : this.editQuoteDetails?.isRequotation ? 'Requotation Created' : 'Quotation Created',
      status: true,

    };


    if (!this.isEditQoute) {
      this.commonService.addToST('quotation', newAgentAdvice)?.subscribe((res: any) => {
        if (res) {
          if (this.getChargeControlsLength() > 0) {
            this.saveNewCharges(res);
          }

          setTimeout(() => {
            this.getQuotation()
            this.openQuotaion = false
            this.isEditQoute = false
            let successMessage = 'Saved Successfully';
            this.notification.create('success', successMessage, '');
          }, 1000);



        }
      }, error => {
        this.notification.create(
          'error',
         error?.error?.error?.message,
          ''
        );
      });
    } else {
      this.commonService.UpdateToST(`quotation/${this.editQuoteDetails?.quotationId}`, newAgentAdvice)?.subscribe((res: any) => {
        if (res) {
          if (this.getChargeControlsLength() > 0) {
            this.saveNewCharges(res);
          }
          setTimeout(() => {
            this.getQuotation()
            this.openQuotaion = false
            this.isEditQoute = false
            try {
              this.notification.create('success', 'Updated Successfully', '');
            } catch (error) {
              console.error('An error occurred:', error);
            }
          }, 1000);
        }
      }, error => {
        this.notification.create(
          'error',
         error?.error?.error?.message,
          ''
        );
      });
    }
  }

  saveNewCharges(res?) {
    const chargeArray = [];
    this.getChargeControls().forEach(element => {
      let charge = {
        // containerType: element.value.containerType, 
        "tenantId": this.userData.tenantId,
        "enquiryitemId": element.value.enquiryitemId ? element.value.enquiryitemId : "",
        // "enquiryId": res?.enquiryId || '',
        // "enquiryNumber": res?.enquiryNo || '',
        "quotationId": res.quotationId,
        "enqDate": res?.createdOn || '',
        "collectPort": res?.loadPortName || '',
        // "containerType": res?.containerType || '',
        "costitemGroup": element.value?.costitemGroup || '',
        "stcQuotationNo": res?.quotationNo || '',
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
        "tenantMargin": Number(element.value.margin) || 0,
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
      }
      chargeArray.push(charge)
    });





    if (this.currentUrl === 'clone') {
      let addData = chargeArray
      // addData = addData.map(item => [item]);
      if (addData.length > 0)
        this.commonService.batchInsert('enquiryitem/batchinsert', addData)?.subscribe((result) => {
          let data = result
        }, error => {
          this.notification.create(
            'error',
           error?.error?.error?.message,
            ''
          )
        });
    } else {
      let addData = chargeArray?.filter(item => !item.enquiryitemId)
      // addData = addData.map(item => [item]);
      if (addData.length > 0)
        this.commonService.batchInsert('enquiryitem/batchinsert', addData)?.subscribe((result) => {
          let data = result

        }, error => {
          this.notification.create(
            'error',
           error?.error?.error?.message,
            ''
          )
        });

      let updateData = chargeArray?.filter(item => item.enquiryitemId)
      // updateData = updateData.map(item => [{ enquiryitemId: item.enquiryitemId }, { $set: item }]);
      if (updateData.length > 0)
        this.commonService.batchUpdate('enquiryitem/batchupdate', updateData)?.subscribe(result => {
          let data = result

        }, error => {
          this.notification.create(
            'error',
           error?.error?.error?.message,
            ''
          )
        });

    }
  }
  CurrChange() {
    return;
    this.quoteForm.controls.exRate.setValue(
      this.currencyList?.filter(x => x?.currencyId ==
        this.quoteForm.value.currency)[0]?.currencyPair
    )
  }
  setGstType(data?) {
    let arr = '';
    if (data) {
      arr = data
    } else {
      arr = this.branchList?.filter(x => x?.branchId === this.quoteForm.value?.branch)[0]?.addressInfo.stateCode
    }

    if (this.enquiryDetails.basicDetails.billingCountry?.toLowerCase() == 'india' || this.enquiryDetails.basicDetails.billingCountry?.toLowerCase() == 'ind'
      || this.enquiryDetails.basicDetails.billingCountry?.toLowerCase() == '' || this.enquiryDetails.basicDetails.billingCountry?.toLowerCase() == undefined) {

      if (arr == this.enquiryDetails.basicDetails.billingStateCode) {
        this.gstType = 'cgst'
      } else {
        this.gstType = 'igst'
      }
    } else {
      this.gstType = 'tax'
    }

    if (!data) {
      this.getChargeControls().forEach((element, index) => {
        let control = this.quoteForm.controls.charge['controls'][index].controls
        control.gstType.setValue(this.gstType)
        this.calcBuyAMT(index)
      })
    }
  }
  setGSTtoRow(i) {
    let control = this.quoteForm.controls.charge['controls'][i].controls;
    let data = this.chargeName?.filter(x => x?.costitemId === control.chargeName.value)[0];

    let noContainer = 0
    if (data?.chargeTypeName?.toLowerCase() == 'container charge' || data?.chargeTypeName?.toLowerCase() == 'container') {
      this.enquiryDetails?.containersDetails?.filter((c) => {
        noContainer += Number(c.noOfContainer || 1)
      })
      control.quantity.setValue(noContainer || 1)
    } else if (data?.chargeTypeName?.toLowerCase() == 'qty' || data?.chargeTypeName?.toLowerCase() == 'box' || data?.chargeTypeName?.toLowerCase() == 'pallet') {
      const totalUnits = this.enquiryDetails?.looseCargoDetails?.cargos?.reduce((sum, cargo) => sum + cargo?.units, 0) || 1;
      control.quantity.setValue(totalUnits)
    }
    else {
      control.quantity.setValue(1)
    }

    control.gst.setValue(data?.gst || 0)
    control.basic.setValue(data?.chargeType || '')
    control.sellRate.setValue(data?.chargeAmount || 0)
    this.calcBuyAMT(i)
  }

  setQuantity(i) {
    let control = this.quoteForm.controls.charge['controls'][i].controls;
    let data = this.chargeBasic?.filter(x => x?.systemtypeId === control.basic.value)[0];
    let noContainer = 0
    if (data?.typeName?.toLowerCase() == 'container charge' || data?.typeName?.toLowerCase() == 'container') {
      this.enquiryDetails?.containersDetails?.filter((c) => {
        noContainer += Number(c.noOfContainer || 0)
      })
      control.quantity.setValue(noContainer || 1)
    } else {
      control.quantity.setValue(1)
    }
    this.calcBuyAMT(i)
  }

  isCloneQuote: boolean = false
  editQuote(data, route) {
    this.router.navigate([`/${this.isImport ? 'agent-advice' : "enquiry"}/list/${this.enquiryId}/${data?.quotationId}/${route}`]);

    return
    // const formArray = this.quoteForm.get('charge') as FormArray;
    // formArray.clear();
    // if (isEdit) {
    //   this.editQuoteDetails = data
    //   this.isEditQoute = true
    //   this.isCloneQuote = false
    // } else {
    //   this.isEditQoute = false
    //   this.editQuoteDetails = []
    //   this.isCloneQuote = true
    // }
    // this.setGstType(data.branchStateCode)

    // if (view) {
    //   this.quoteForm.disable();
    //   this.isOnlyView = view
    // } else {
    //   this.quoteForm.enable();
    // }
    // this.openQuotaion = true
    // this.getCharges(data.quotationId)

    // this.quoteForm.patchValue({

    //   validFrom: data?.validFrom,
    //   validTo: data?.validTo,
    //   currency: data?.currency,
    //   exRate: data?.exRate,
    //   shipping_line: data?.carrierId,
    //   carrierReceipt: data?.carrierReceiptId,
    //   etd: data?.etd,
    //   load_port: data?.loadPortId,
    //   branch: data?.branchId,
    //   discharge_port: data?.dischargePortId,
    //   eta: data?.eta,
    //   currencyShortName: data?.currencyShortName,
    //   plannedVessel: data?.vesselId,
    //   voyageNumber: data?.voyageNumber,
    //   carrierDelivery: data?.carrierDeliveryId,

    //   destPortFreeDays: data?.destPortFreeDays,
    //   originFreeDays: data?.originFreeDays,
    //   destFreeDays: data?.destFreeDays,
    //   remarks: data?.remarks,
    // })
  }
  mailAttachment: any;
  showPdf(arrayBuffer: ArrayBuffer): void {
    const binaryData = [];
    binaryData.push(arrayBuffer);
    const pdfUrl = URL.createObjectURL(new Blob(binaryData, { type: 'application/pdf' }));
    //  this.mailAttachment = pdfUrl
    document.getElementById('pdfViewer').setAttribute('src', pdfUrl);
  }
  basecontentUrl: string;
  sendMailDeatils: any;
  sendQuotation(content1, data) {
    this.getPartyMaster(this.enquiryDetails.basicDetails.shipperId)
    this.sendMailDeatils = data
    this.mailAttachment = ''
    this.basecontentUrl = '';
    let reportpayload = { "parameters": { quotationId: data.quotationId } };
    let url = '';
    if(this.shipment === 'land'){
      url = 'quoatationTransport'
      }
      else{
      url = 'quoatation'
      }
    // let reportpayload =  { "parameters": { "invoiceID": "b2fd9ad1-baac-11ee-a6a5-1f78a0c04784","module" : 'export' } };
    // let url='localInvoice';
    this.commonService.pushreports(reportpayload, url)?.subscribe({
      next: (res: any) => {


        // const blob = new Blob([res], { type: 'application/pdf' });
        // this.mailAttachment = res
        //   let temp = URL.createObjectURL(blob); 
        //   const pdfWindow = window.open(temp);
        //   pdfWindow.print();

        const blob = new Blob([res], { type: 'application/pdf' });
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result as string;
          let baseContent = base64String.split(",");
          this.basecontentUrl = baseContent[1];
          // this.mail(data , this.basecontentUrl , url)
        };
        reader.readAsDataURL(blob)

        const fileReader = new FileReader();
        fileReader.onload = () => {
          this.showPdf(fileReader.result as ArrayBuffer);
        };
        fileReader.readAsArrayBuffer(res);
        // if (res)
          // this.notification.success('Success', res['message']);
        // else
          // this.notification.error('Error', res['message']);
      }
    })
    this.modalService.open(content1, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
      ariaLabelledBy: 'modal-basic-title'
    })



  }


  printAll() {
    let url = 'quoatation';
    let reportpayload = { "parameters": { quotationId: this.editQuoteDetails?.quotationId } };

    this.commonService.pushreports(reportpayload, url)?.subscribe({
      next: (res: any) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        let temp = URL.createObjectURL(blob);
        this.Documentpdf = temp;
        const pdfWindow = window.open(temp);
        pdfWindow.print();
      }
    })
  }

  submitForm() {
    if (this.emailForm.valid) {
      this.mail(this.basecontentUrl, this.emailForm.value.email);

      // let payload = {
      //   ...this.sendMailDeatils,
      //   quoteStatus: 'Quotation Submitted'
      // }

      // this.commonService.UpdateToST(`quotation/${payload?.quotationId}`, payload)?.subscribe((res: any) => {
      //   if (res) {
      //     this.getQuotation()
         
      //   }
      // });
      this.modalService.dismissAll()
    }
  }
  mail(bloburl, mailId) {
    let fileName = 'quotation.pdf'
    let attachment = [{ "content": bloburl, "name": fileName }]
    // let attachment = this.mailAttachment

    const to = mailId?.split(',')
    // let userData = this.userData 
    //   let emaildata = `Please check attachments `

    let payload = {
      // sender: {
      //   name: userData?.roleName,
      //   email: userData.createdBy
      // },
      // to: [{
      //   name: 'Customer',
      //   email: mailId,
      // }],
      "attachment": attachment,
      // textContent: `${emaildata}`,
      // subject: "Quotation", 
      "to": to?.map(email => {
        return {
          name: 'email',
          email: email,
        }
      }),
      "templateId": 3,
      "params": {
        "agentadviceId": this.sendMailDeatils?.agentadviceId || '',
        "agentadviceNo": this.sendMailDeatils?.agentadviceNo || '',
        "enquiryNo": this.isImport ?  this.sendMailDeatils?.agentadviceNo :  this.sendMailDeatils?.enquiryNo|| '',
        "quotationNo": this.sendMailDeatils?.quotationNo || '',
        "quotationId": this.sendMailDeatils?.quotationId || '',
        "enquiryId": this.isImport ?  this.sendMailDeatils?.agentadviceId : this.sendMailDeatils?.enquiryId || '',
        "validFrom": this.sendMailDeatils?.validFrom.substring(0, 10) + 'T00:00:00.000Z' || '',
        "validTo": this.sendMailDeatils?.validTo.substring(0, 10) + 'T23:59:00.000Z' || '',
      }



    }

    this.commonService.sendEmail(payload)?.subscribe(
      (result) => {
        if (result.status == "success") {
          this.notification.create('success', 'Email Send Successfully', '');
        }
        else {
          this.notification.create('error', 'Email not Send', '');
        }
      }
    );
  }

  rejectQuote(row) {
    let payload = {
      ...row,
      quoteStatus: 'Quotation Rejected'
    }
    this.commonService.UpdateToST(`quotation/${payload?.quotationId}`, payload)?.subscribe((res: any) => {
      if (res) {
        if (this.quotationList?.filter(t => t?.quoteStatus === 'Quotation Submitted' || t?.quoteStatus === 'Quotation Created')?.length <= 1) {
          let url = "enquiry/" + this.enquiryDetails.enquiryId;
          let data = {
            // ...this.enquiryDetails,
            enquiryStatus: 'Inquiry Rejected',
            enquiryStatusCustomer: 'Rejected',
          }
          this.commonService.UpdateToST(url, data)?.subscribe()
        }
        this.notification.create(
          'success',
          'Quotation Rejected',
          ''
        ); 
        setTimeout(() => {
          this.getQuotation() 
          this.getEnquiry()
        }, 1000);
      }
    });
  }
  acceptQuote(row) {
    // let payload = {
    //   ...row,
    //   quoteStatus: 'Quotation Accepted'
    // }


    this.quotationList?.filter((item, index) => {
      if (item?.quoteStatus != 'Quotation Rejected') {
        if (item.quotationId == row.quotationId) {
          this.quotationList[index].quoteStatus = 'Quotation Accepted'
        } else {
          this.quotationList[index].quoteStatus = 'Quotation Rejected',
            this.quotationList[index].remarks = 'Other quotation accepted'
        }
      }
    })
    this.commonService.batchUpdate('quotation/batchupdate', this.quotationList)?.subscribe((res: any) => {
      if (res) {
        let url = "enquiry/" + this.enquiryDetails.enquiryId;
        let data = {
          ...this.enquiryDetails,
          enquiryStatus: 'Inquiry Accepted',
          enquiryStatusCustomer: 'Awaiting Review',
        }
        this.commonService.UpdateToST(url, data)?.subscribe()
        this.notification.create(
          'success',
          'Quotation Accepted',
          ''
        );
        setTimeout(() => {
          this.getQuotation()
          this.getEnquiry()
        }, 1000);
       
      }
    });


  }
  deleteQuote(payload) {
    this.commonService.deleteST(`quotation/${payload.quotationId}`)?.subscribe((res: any) => {
      this.notification.create(
        'success',
        'Deleted Successfully',
        ''
      );
      setTimeout(() => {
        this.getQuotation() 
      }, 1000); 
    })
  }
  
  checkForJob() {
    return this.quotationList.some((x) => x.quoteStatus == 'Quotation Accepted' || x.quoteStatus == 'Requotation Accepted')

  }

  sendForJobCreate() {
    let data = this.quotationList.find((x) => x?.quoteStatus == 'Quotation Accepted' || x.quoteStatus == 'Requotation Accepted')
    this.createBatch(data)
  }
  biddingList:any;
  getBidding(){
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      "adminStatus": "Accepted",
      enquiryId: this.route.snapshot?.params['id'],
    }

    this.commonService.getSTList('transportinquiry', payload)?.subscribe((data) => {
      this.biddingList = data.documents[0]; 
      if(data?.documents?.length === 0 ){
        this.hideCreateQuote = true
      }
      
    });
  }

  createBatch(row) {
    let quoteData = this.quotationList?.filter((x) => x.quotationId == row.quotationId)[0]
    let paylaod = {
      "tenantId": this.userData.tenantId,
      customerId: this.enquiryDetails?.basicDetails?.shipperId || '',
      orgId: this.commonFunction.getAgentDetails().orgId,
      batchId: '',
      isExport: localStorage.getItem('isExport') === 'true' || localStorage.getItem('isTransport') === 'true' ? true : false,
      batchDate: new Date(),
      quotationId: quoteData.quotationId,
      quotationNo: quoteData.quotationNo,
      enquiryId: quoteData.enquiryId,
      amount: quoteData?.totalSell || 0,
      agentadviceId: quoteData.agentadviceId,
      branchId: quoteData.branchId,
      branchName: quoteData.branchName,
      jobCode: quoteData.jobCode,
      status: true,
      poDate: new Date(),
      statusOfBatch: 'Job Created',
      enquiryDetails: this.enquiryDetails,
      quotationDetails: quoteData,
      transportinquiryId : this.biddingList?.transportinquiryId || '',
      transportinquiryNo : this.biddingList?.transportinquiryNo || '',
      // batchStatus: addBatchForm?.batchStatus, 
      routeDetails: {
        etd: quoteData?.etd,
        eta: quoteData?.eta,
        atd: quoteData?.etd,
        ata: quoteData?.eta,
      }
    };
    this.commonService.addToST('batch', paylaod)?.subscribe((res: any) => {
      if (res) {
        this.enquiryUpdate(false, res, row)

        this.quotationList?.filter((item, index) => {
          if (item.quotationId == row.quotationId) {
            this.quotationList[index].quoteStatus = 'Inquiry Accepted'
          } else {
            this.quotationList[index].quoteStatus = 'Quotation Rejected',
              this.quotationList[index].remarks = 'Other quotation accepted'
          }
        })
        this.commonService.batchUpdate('quotation/batchupdate', this.quotationList)?.subscribe();
        if(this.isTransport){
          let tranportPayload = {
            ...this.biddingList,
            adminStatus : 'Inquiry Accepted',
             carrierStatus : 'Inquiry Accepted'
          }
          if(!this.isTrasportSelf){
            this.commonService.UpdateToST(`transportinquiry/${tranportPayload?.transportinquiryId}`, tranportPayload)?.subscribe();

          }
        }
        this.router.navigate([
          `/${this.isImport ?  'agent-advice' : "enquiry"}/list`
        ]);
        this.notification.create(
          'success',
          'Job Created Successfully',
          ''
        );
      }
    })
  }

  updateQuotation() {
    const activeQuotes = this.quotationList.filter(x => x?.isSelected);

    if (activeQuotes.length === 0) {
      this.notification.create(
        'error',
        'Please select at least one quotation.',
        ''
      );
      return;
    }

  
  
    const payload = this.quotationList.map(x => ({
      ...x,
      quoteStatus: x?.isSelected ? 'Quotation Submitted' : 'Quotation Rejected',
      remarks : x?.isSelected ? '' : 'Not sent to the customer',
      status : x?.isSelected ? true : false 
    }));

    this.enquiryUpdate(false);
    
    this.commonService.batchUpdate('quotation/batchupdate', payload).subscribe(
      (response) => {
      
        setTimeout(() => {
          this.getQuotation()
          this.getEnquiry()
          // this.notification.create(
          //   'success',
          //   'Quotation Send To Customer Successfully',
          //   ''
          // );
        }, 1500);
      
      },
      (error) => {
        console.error('Error updating quotations', error);
      }
    )
  }

  isQuoteAcceptedOrRejected(): boolean {
    return !this.quotationList.some(i => i?.quoteStatus === 'Quotation Accepted' || i?.quoteStatus === 'Quotation Rejected');
  }
  enquiryUpdate(requote?, res?, row?) {
    let batchArray = this.enquiryDetails?.batches || [];
    batchArray.push({
      batchNo: res?.batchNo,
      batchId: res?.batchId,
    })

    let url;
    if (this.isImport) {
      url = "agentadvice/" + this.enquiryDetails.agentadviceId;
    } else { 
      url = "enquiry/" + this.enquiryDetails.enquiryId;
    }
    
    let data;
    if (res) {
      let selectedQuoatetion = this.quotationList?.filter(x => x.quotationId == row.quotationId)[0]
      data = {
        ...this.enquiryDetails, enquiryStatus: 'Inquiry Accepted',
        enquiryStatusCustomer: 'Accepted',
        batches: batchArray,
        agentAdviseStatus: 'Inquiry Accepted',
        batchId: res?.batchId,
        routeDetails :{
          ...this.enquiryDetails.routeDetails,
          shippingLineId : row?.carrierId || '',
          shippingLineName :  row?.carrierName || ''
        },
        estimate: {
          ...this.enquiryDetails?.estimate,
          finalPrice: selectedQuoatetion?.totalSell || 0.00,
          currency: row?.currencyShortName,
        }
      }
    } else {

      let activeQuote = this.quotationList.filter((x) => (x.quoteStatus != 'Quotation Rejected' && x.quoteStatus != 'Draft'))
      const minObject = activeQuote.reduce((min, obj) => (obj.totalSell < min.totalSell ? obj : min), activeQuote[0]);
      const maxObject = activeQuote.reduce((max, obj) => (obj.totalSell > max.totalSell ? obj : max), activeQuote[0]);
      data = {
        ...this.enquiryDetails,
        agentAdviseStatus: this.enquiryDetails?.agentAdviseStatus == 'Requotation Requested' ? 'Re-quoted Submitted' : 'Inquiry Submitted',
        enquiryStatus: this.enquiryDetails?.enquiryStatus == 'Requotation Requested' ? 'Requote Submitted' : 'Inquiry Submitted',
        enquiryStatusCustomer: this.enquiryDetails?.enquiryStatus == 'Requotation Requested' ? 'Requoted' : 'Awaiting Review',
        estimate: {
          ...this.enquiryDetails?.estimate,
          maxPrice: activeQuote[0]?.totalSell || 0.00,
          minPrice: activeQuote[0]?.totalSell || 0.00,
          quoteAmount: activeQuote[0]?.totalSell || 0.00,
        }
      }
      if (requote) {
        data.estimate.finalPrice = activeQuote[0]?.totalSell || 0.00
      }
    }

    this.commonService.UpdateToST(url, data)?.subscribe()
    if (data?.enquiryStatus === 'Requote submitted' || data?.enquiryStatus === 'Requote Submitted') {
      this.enquiryDetails.enquiryStatus = 'Requote Submitted';
    }

    if (data?.enquiryStatus === 'Inquiry Submitted') {
      this.enquiryDetails.enquiryStatus = 'Inquiry Submitted';
    }

    this.notification.create(
      'success',
      'Quotation Send To Customer Successfully',
      ''
    );

    this.getEnquiry()
  }
  totalGrossWeight(arr) {
    let total = 0
    arr?.filter((x) => {
      total += Number(x.grossWeightContainer)
    })
    return total
  }
  // viewDoc(documentURL) {
  //   this.commonService.downloadDocuments('downloadfile', documentURL)?.subscribe(
  //     (res: Blob) => {
  //       const blob = new Blob([res], { type: 'application/pdf' });
  //       let temp = URL.createObjectURL(blob);
  //       const pdfWindow = window.open(temp);
  //       pdfWindow.print();
  //     },
  //     (error) => {
  //       console.error(error);
  //     }
  //   );
  // }
  viewDoc(documentURL: string) {
    this.commonService.downloadDocuments('downloadfile', documentURL)?.subscribe(
      (res: Blob) => {
        // Determine the file extension from the URL
        const fileExtension = documentURL.split('.').pop()?.toLowerCase();
  
        // Set MIME type based on the file extension
        let mimeType = '';
        switch (fileExtension) {
          case 'pdf':
            mimeType = 'application/pdf';
            break;
          case 'png':
          case 'jpg':
          case 'jpeg':
            mimeType = `image/${fileExtension}`;
            break;
          case 'xlsx':
            mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            break;
          case 'xls':
            mimeType = 'application/vnd.ms-excel';
            break;
          default:
            console.error('Unsupported file type');
            return;
        }
  
        // Create a blob with the correct MIME type
        const blob = new Blob([res], { type: mimeType });
        const temp = URL.createObjectURL(blob);
  
        // Open PDFs and images in a new window/tab
        if (mimeType.startsWith('application/pdf') || mimeType.startsWith('image/')) {
          const fileWindow = window.open(temp, '_blank');
          
          // Optional: Automatically print the PDF if opened
          if (fileExtension === 'pdf' && fileWindow) {
            fileWindow.print();
          }
        } 
        // Trigger download for Excel files (XLS and XLSX)
        else if (fileExtension === 'xls' || fileExtension === 'xlsx') {
          const link = document.createElement('a');
          link.href = temp;
          link.download = `downloaded_file.${fileExtension}`;  // Set download filename
          link.click(); // Trigger the download
        }
      },
      (error) => {
        console.error(error);
      }
    );
  }
  
  
  
  downloadDoc(documentURL) {
    this.commonService.downloadDocuments('downloadfile', documentURL)?.subscribe(
      (fileData: Blob) => {
        this.commonService.downloadDocumentsFile(fileData, documentURL);
      },
      (error) => {
        console.error(error);
      }
    );
  }
  shipperList: any;
  openShipper(content, id) {

    let payload = this.commonService.filterList()
    payload.query = {
      "partymasterId": id,
    }
    this.commonService.getSTList("partymaster", payload)?.subscribe((res: any) => {
      this.shipperList = res?.documents[0];
    });

    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
    // modalRef.componentInstance.id = id;
  }

  remarksView(Views) {
    this.modalService.open(Views, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'md',
    })
  }
  acceptRequote(row) {
    this.quotationList?.filter((item, index) => {
      if (item?.quoteStatus != 'Quotation Rejected') {
        if (item.quotationId == row.quotationId) {
          this.quotationList[index].quoteStatus = 'Requotation Accepted'
        } else {
          this.quotationList[index].quoteStatus = 'Quotation Rejected',
            this.quotationList[index].remarks = 'Other quotation accepted'
        }
      }
    })
    this.commonService.batchUpdate('quotation/batchupdate', this.quotationList)?.subscribe((res: any) => {
      if (res) {
        let url = "enquiry/" + this.enquiryDetails.enquiryId;
        let data = {
          ...this.enquiryDetails,
          enquiryStatus: 'Inquiry Accepted',
          enquiryStatusCustomer: 'Awaiting Review',
        }
        this.commonService.UpdateToST(url, data)?.subscribe()
        this.notification.create(
          'success',
          'Requotation Accepted',
          ''
        );
        this.getQuotation()
        this.getEnquiry()
      }
    });
  }
  isQuoteAccepted(){
    if(this.quotationList.every((x) => x.quoteStatus != 'Quotation Created')) {
      return false;
    }else{
      return true;
    } 
  }
}
