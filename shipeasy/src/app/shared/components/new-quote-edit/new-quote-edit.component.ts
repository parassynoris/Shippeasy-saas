import { smartagent } from 'src/app/admin/smartagent/data';
import { Component, OnInit, Output, EventEmitter, Input, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
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
import { currentTime } from '../../util/date-time';
import { PartyMasterData } from 'src/app/models/party-master';

@Component({
  selector: 'app-new-quote-edit',
  templateUrl: './new-quote-edit.component.html',
  styleUrls: ['./new-quote-edit.component.scss']
})
export class NewQuoteEditComponent implements OnInit {
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
  portList: any=[]; 
  locationList: any = [];
  preCarrigeList: any;
  vesselList: any;
  vehicalList: any = [];
  flightList: any = [];
   shipperList: PartyMasterData[] = []
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
  isOnlyView: boolean = false;
  urlParam: any;
  isNegative: boolean = false;
  emailForm: FormGroup
  userdetails: any
  currentUser: any
  userCountry: any = ''
  buyTotalTax = 0;
  sellTotalTax = 0;
  todayDate = new Date();
  _gc = GlobalConstants
  quoteID: any;
  addDefaultCharge: any = [];
  currencyRate: any = {};
  isImport: boolean= false;
  isTransport: boolean= false;
  locationListOG: any = [];
  partyMasterNameList: PartyMasterData[] = []
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
    this.getPortDropDowns()
    this.getAirPort()
    this.currentUrl = window.location.href.split('?')[0]?.split('/').pop(); 
    this.isExport = localStorage.getItem('isExport') === 'true' ? true : false;
    this.isImport = localStorage.getItem('isImport') === 'true' ? true : false;
    this.isTransport = localStorage.getItem('isTransport') === 'true' ? true : false;
    this.holdControl = this.currentUrl;
    this.currentUser = this.commonFunction.getActiveAgent()
    this.userCountry = this.commonFunction.getActiveAgent()?.addressInfo?.countryName
    this.getDefaultExRate()
    this.costItem()
    this.getVoyage()
    this.getBidding()

    this.getAir()
    this.getLand()
    this.getCurrency()
    this.getShippingLineDropDown()
    this.getICDLocation()
    // this.costItem1()
    // this.getChargeTerm()
    this.getSupplierParty()
    this.getShipper();
    this.getSystemTypeDropDowns()
    this.CityList()
    // this.getShippingLineDropDownsss();
    // this.getShippingLineDropDownss();
    console.log(this.currentUser,'console.log(this.currentUser)')
    this.quoteForm = this.formBuilder.group({
      enquiryTypeName:[''],
      shipperName:[''],
      validFrom: [new Date(), Validators.required],
      validTo: ['', Validators.required],
      currency: [this.currentUser?.currency?.currencyId || '', Validators.required],
      currencyShortName: [''],
      exRate: [''],
      shipping_line: ['', Validators.required],
      carrierReceipt: [''],
      etd: [''],
      load_port: ['', Validators.required],

      discharge_port: ['', Validators.required],
      eta: [''],
      branch: ['', Validators.required],
      plannedVessel: ['', Validators.required],
      vehicleNo: [''],
      flightNo: ['', Validators.required],
      voyageNumber: ['', Validators.required],
      carrierDelivery: [''],

      destPortFreeDays: [''],
      originFreeDays: [''],
      destFreeDays: [''],
      remarks: [''],


      charge: this.formBuilder.array([])
    })
    this.quoteForm.get('eta')?.valueChanges.subscribe((value: Date) => {
      this.selectedEtaDate = value;
      // this.quoteForm.get('etd')?.setValue(null);
    });

    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.userdetails = resp.userData
      }
    })
    // let payload = this.commonService.filterList()
    // if (payload?.query) payload.query = {
    //   agentId: this.userdetails?.agentId,
    // }

    // this.commonService.getSTList('agent', payload)?.subscribe((data: any) => {
    //   this.currentUser = data.documents[0]
    //   this.userCountry = this.currentUser?.addressInfo?.countryName

    // })

  }
  cityListLand:any = []
  CityList() { 
   let payload = this.commonService.filterList()
   payload.query = { status: true,
   }
   this.commonService.getSTList("city", payload).subscribe((data) => {
     this.cityListLand = data.documents || [];
     if(this.isTransport){
      this.locationList = [...this.cityListLand].map((x) => ({
        locationName: x?.cityName ? x?.cityName : x?.locationName,
        locationId: x?.cityId ? x?.cityId : x?.locationId
      }))
    }
   });
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


  getDefaultExRate() {
    let payload = {
      "fromCurrency": this.currentUser?.currency?.currencyName?.toLowerCase() == 'usd' ? 'INR' : 'USD',
      "toCurrency": this.currentUser?.currency?.currencyName?.toLowerCase() == 'usd' ? 'USD' : 'INR',
    }
    this.commonService.getExchangeRate('exchangeRate', payload)?.subscribe((result) => {
      this.currencyRate = { ...this.currencyRate, [this.currentUser?.currency?.currencyName?.toLowerCase() == 'usd' ? 'INR' : 'USD']: result[this.currentUser?.currency?.currencyName?.toLowerCase() == 'usd' ? 'USD' : 'INR'] }
    })
  }
  ngOnInit(): void {
    this.emailForm = this.formBuilder.group({
      email: ['', [Validators.required]]
    });

    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.userData = resp
      }
    })
    this.enquiryId = this.route.snapshot?.params['id'];
    this.quoteID = this.route.snapshot?.params['quoteId'];



    this.getBranchList()

    
    this.getEnquiry()

  }
  getQuotation() {
    let payload = this.commonService.filterList()

    if (!this.isExport) {
      payload.query = {
        agentadviceId: this.enquiryId,
        quotationId: this.route.snapshot?.params['quoteId']
      }
    } else {
      if (payload?.query) payload.query = {
        enquiryId: this.enquiryId,
        quotationId: this.route.snapshot?.params['quoteId']
      }
    }
  
   if(this.activeFright === 'ocean'){
      this.quoteForm.controls['plannedVessel'].setValidators([Validators.required]);
      this.quoteForm.controls['plannedVessel'].updateValueAndValidity();
      this.quoteForm.controls['voyageNumber'].setValidators([Validators.required]);
      this.quoteForm.controls['voyageNumber'].updateValueAndValidity();
    } else{ 
      this.quoteForm.controls['plannedVessel'].removeValidators([Validators.required]);
      this.quoteForm.controls['plannedVessel'].updateValueAndValidity();
      this.quoteForm.controls['voyageNumber'].removeValidators([Validators.required]);
      this.quoteForm.controls['voyageNumber'].updateValueAndValidity();
    }
    
    if(this.activeFright === 'air'){
      this.quoteForm.controls['flightNo'].setValidators([Validators.required]);
      this.quoteForm.controls['flightNo'].updateValueAndValidity();
    }else{
      this.quoteForm.controls['flightNo'].removeValidators([Validators.required]);
      this.quoteForm.controls['flightNo'].updateValueAndValidity();  
    }
    this.commonService.getSTList('quotation', payload)
      ?.subscribe((res: any) => {
        this.quotationList = res.documents[0]
        if (this.currentUrl == 'clonequote') {
          this.editQuote(false)
        } else if (this.currentUrl == 'viewquote') {
          this.editQuote(true, true)
        }else if (this.currentUrl == 'editquote') {
          this.editQuote(true)
        } else {
          this.editQuote(false)
        }

      })
  }

  branchList: any = []
  getBranchList() {

    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = { 
      orgId: this.commonFunction.getAgentDetails()?.orgId,
      status : true
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
          "chargeType", 'chargeTerm'
        ]
      }
    }

    this.commonService.getSTList("systemtype", payload)?.subscribe((res: any) => {

      this.chargeBasic = res?.documents?.filter(x => x.typeCategory === "chargeType");
      this.chargeTermList = res?.documents?.filter(x => x.typeCategory === "chargeTerm");

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
  getShipper() {

    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      "status": true,
    }
    this.commonService.getSTList('partymaster', payload)?.subscribe((res: any) => {
      this.partyMasterNameList = res?.documents

      res?.documents?.filter((x) => {
        if (x.customerType) {
          x.customerType.map((res: any) => {
            if (res?.item_text === 'Shipper') { this.shipperList.push(x) }
          })
        }
      });
    })
  }

  async getAir() {
    let payload = this.commonService.filterList()
    payload.query = { status: true }
    await this._api?.getSTList('air', payload)
      ?.subscribe((res: any) => {
        this.flightList = res?.documents;
      });
  }
  async getLand() {
    let payload = this.commonService.filterList()
    payload.query = { status: true }
    await this._api?.getSTList('land', payload)
      ?.subscribe((res: any) => {
        this.vehicalList = res?.documents;
      });
  }
  async getVoyage() {
    let payload = this.commonService.filterList()
    payload.query = { status: true }
    await this._api?.getSTList('vessel', payload)
      ?.subscribe((res: any) => {
        this.vesselList = res?.documents;
      });
  }
  voyageList:any=[]
  setVoyage(e?) {
    return;
    let vessel = this.vesselList?.filter((x) => x?.vesselId == this.quoteForm.value.plannedVessel)[0]?.voyage
    if (vessel?.length > 0) {
      this.voyageList = vessel?.filter((x) => x?.shipping_line == this.quoteForm.value.shipping_line)
      // this.quoteForm.controls.voyageNumber.patchValue('');
    }
  }
  getICDLocation() {

    let payload = this.commonService.filterList()

    if (payload) payload.query = {
      status: true,
      masterType:   {
        "$in": ['YARD','CFS','ICD']
      },
    }


    this.commonService.getSTList("location", payload)?.subscribe((res: any) => {
      this.locationList = res?.documents;
      this.locationListOG = res?.documents;
    });
  }
  getAirPort() {
    let payload = this.commonService.filterList()
    payload.query = {
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
          portName: x?.portDetails?.portName??x?.portName,
          portTypeName: 'port'
        })
      ));
    });
  }

  airLineType: any = [];
  railFllet: any = [];
  landFllet: any = [];
  oceanLand: any = [];

  getShippingLineDropDown() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      "status": true
    }
    this._api
      ?.getSTList('shippingline', payload)
      ?.subscribe((res: any) => {
        this.shippingLineList = res?.documents
      });
  }


  getCurrency() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      status: true,
    }
    this.commonService.getSTList("currency", payload)?.subscribe((res: any) => {
      this.currencyList = res?.documents;

      this.quoteForm.get('currency').setValue(this.currentUser?.currency?.currencyId)
    })
  }
  documentList: any = []
  getEnquiry() {
    let url = "";
    let payload = this.commonService.filterList()
    if (this.isImport) {
      url = Constant.AGENTADVICE_LIST;
      payload.query = {
        agentadviceId: this.route.snapshot.params['id'],
      }
    } else {
      url = Constant.ENQUIRY_LIST;
      if (payload?.query) payload.query = {
        enquiryId: this.route.snapshot?.params['id'],
      }
    }

    this.commonService.getSTList(url, payload)
      ?.subscribe((res: any) => {

        this.enquiryDetails = res.documents[0]
        if(!this.isEditQoute){ 
          this.quoteForm.get('shipping_line').setValue(this.enquiryDetails?.routeDetails?.shippingLineId)
        }
        this.activeFright = this.enquiryDetails?.basicDetails?.ShipmentTypeName?.toLowerCase()
        if ( this.activeFright === 'air') {
          this.activeFrightAir = true;
        }
        if ( this.activeFright === 'land') { 
          setTimeout(() => {
            if(this.isTransport){
              this.locationList = [...this.cityListLand].map((x) => ({
                locationName: x?.cityName ? x?.cityName : x?.locationName,
                locationId: x?.cityId ? x?.cityId : x?.locationId
              }))
            }else{
              this.locationList = [...this.locationListOG, ...this.cityListLand].map((x) => ({
                locationName: x?.cityName ? x?.cityName : x?.locationName,
                locationId: x?.cityId ? x?.cityId : x?.locationId
              }))
            } 
          }, 2000);
     
      }
      if (!this.route.snapshot.params['quoteId']) {
          setTimeout(() => {
          this.openQuote()
          }, 2000);
        }
        if (this.route.snapshot?.params['quoteId']) {
          this.getQuotation()
        }
        this.enquiryDetails?.cargoDetail?.filter((x) => {
          if (x?.msdsDoc !== '' && x?.msdsDoc) {
            this.documentList.push(x)
          }
        })
        if(this.enquiryDetails?.transportDetails?.origin[0]?.transpoterType === 'self' && this.isTransport){
          this.isTrasportSelf = true
          this.quoteForm.controls['shipping_line'].removeValidators([Validators.required]);
          this.quoteForm.controls['shipping_line'].updateValueAndValidity();
        }

      })
  }
  activeFrightAir: boolean = false
  activeFright: string = ''
  openQuote() {
    this.editQuoteDetails = []
    this.isOnlyView = false
    this.quoteForm.reset();
    const formArray = this.quoteForm.get('charge') as FormArray;
    formArray.clear();
  
    this.quoteForm.patchValue({
      validFrom: new Date(),
      enquiryTypeName: this.enquiryDetails?.basicDetails?.enquiryTypeName || '',
      shipperName: this.enquiryDetails?.basicDetails?.shipperId || '',
      shipping_line: this.isTransport ? this.biddingList?.shippinglineId : this.enquiryDetails?.routeDetails?.shippingLineId || this.enquiryDetails?.routeDetails?.shippinglineId,
      branch: this.isTransport ? this.enquiryDetails?.transportDetails?.origin[0]?.branch : this.enquiryDetails?.basicDetails?.userBranch || '',
      carrierReceipt: this.isTransport ? this.enquiryDetails?.transportDetails?.origin[0]?.location  :  this.enquiryDetails?.routeDetails?.carrierReceiptId || '',
      etd: this.isTransport ? this.enquiryDetails?.transportDetails?.origin[0]?.etd : this.enquiryDetails?.routeDetails?.loadPortETD || '',
      plannedVessel: this.enquiryDetails?.routeDetails?.vesselId || '', 
      voyageNumber: this.enquiryDetails?.routeDetails?.voyageNumber || '',
      eta:this.isTransport ? this.enquiryDetails?.transportDetails?.origin[1]?.eta : this.enquiryDetails?.routeDetails?.destPortETA || '',
      carrierDelivery:  this.isTransport ? this.enquiryDetails?.transportDetails?.origin[1]?.location  : this.enquiryDetails?.routeDetails?.carrierDeliveryId || '',
      exRate: 1,
      currency: this.currentUser?.currency?.currencyId || '',
      currencyShortName: this.currencyList?.filter(x => x.currencyId == this.currentUser?.currency?.currencyId)[0]?.currencyShortName,
      load_port: this.enquiryDetails?.routeDetails?.loadPortId,
      discharge_port: this.enquiryDetails?.routeDetails?.destPortId,
      destPortFreeDays: this.enquiryDetails?.detentionDetails?.destinationPortFD || '',
      originFreeDays: this.enquiryDetails?.detentionDetails?.originCarrierFD || '',
      destFreeDays: this.enquiryDetails?.detentionDetails?.destinationCarrierFD || '',
    })
    if(this.isTransport){
      this.quoteForm.patchValue({
        load_port: this.enquiryDetails?.transportDetails?.origin[0]?.locationType ==='address' ? this.enquiryDetails?.transportDetails?.origin[0]?.addressId: this.enquiryDetails?.transportDetails?.origin[0]?.location,
        discharge_port: this.enquiryDetails?.transportDetails?.origin[1]?.locationType ==='address' ? this.enquiryDetails?.transportDetails?.origin[1]?.addressId: this.enquiryDetails?.transportDetails?.origin[1]?.location,
      })
    }
    if(this.activeFright === 'ocean'){
      this.quoteForm.controls['plannedVessel'].setValidators([Validators.required]);
      this.quoteForm.controls['plannedVessel'].updateValueAndValidity();
      this.quoteForm.controls['voyageNumber'].setValidators([Validators.required]);
      this.quoteForm.controls['voyageNumber'].updateValueAndValidity();
    } else{ 
      this.quoteForm.controls['plannedVessel'].removeValidators([Validators.required]);
      this.quoteForm.controls['plannedVessel'].updateValueAndValidity();
      this.quoteForm.controls['voyageNumber'].removeValidators([Validators.required]);
      this.quoteForm.controls['voyageNumber'].updateValueAndValidity();
    }

    if(this.activeFright === 'air'){
      this.quoteForm.controls['flightNo'].setValidators([Validators.required]);
      this.quoteForm.controls['flightNo'].updateValueAndValidity();
    }else{
      this.quoteForm.controls['flightNo'].removeValidators([Validators.required]);
      this.quoteForm.controls['flightNo'].updateValueAndValidity();  
    }
    if(this.enquiryDetails?.transportDetails?.origin[0]?.transpoterType === 'self' && this.isTransport){
      this.isTrasportSelf = true
      this.quoteForm.controls['shipping_line'].removeValidators([Validators.required]);
      this.quoteForm.controls['shipping_line'].updateValueAndValidity();
    }
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
        this.addChargeRow(x, i,true)
      })
    } else {
      let newCahrge = []
      this.addDefaultCharge?.forEach(element => {
        newCahrge.push({
          ...element,
          gst: element?.gst,
          basicId: element?.chargeType,
          costItemId: element.costitemId,
          buyEstimates: {
            rate: this.isTransport? this.biddingList?.rate || 0: element?.chargeAmount,
            currencyId: this.isTransport? this.biddingList?.currency?.currencyId || '': element?.currencyId,
          },
          selEstimates: {
            rate:   element?.chargeAmount,
            currencyId:  element?.currencyId,
          }
        })
      });

      newCahrge?.filter((x, i) => {
        this.addChargeRow(x, i,true)
      })
    }
    this.loader = false;
    this.isEditQoute = false
    this.isCloneQuote = false;
    this.openQuotaion = true;
    // this.router.navigate(['/enquiry/list/'+ this.enquiryId + '/quote/add']);

    // openQuotaionview(){
    //   this.openQuotaion = !this.openQuotaion;
    //   this.router.navigate(['/enquiry/list/'+ this.enquiryId + '/quote']);
    // }
  }
  isTrasportSelf:boolean = false
  sumArray(arr) {
    return arr.reduce((acc, curr) => acc + curr, 0);
  }
  getChargecontainerLength(): number {
    return (this.quoteForm.get('container') as FormArray).length;
  }
  changeFromDate() {
    this.enquiryDateValid = true
    this.quoteForm.controls.validTo.patchValue('')
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
  addChargeRow(item?: any, i?,noGST?): void {
    const row = this.formBuilder.group({

      enquiryitemId: [item ? item.enquiryitemId : ''],
      chargeName: [item ? item.costItemId : null, Validators.required],
      basic: [item ? item.basicId : null],
      quantity: [item ? item.quantity : null, Validators.required],
      gst: [item ? item.gst || 0 : 0],
      gstType: [item ? item.gstType || this.gstType : this.gstType],
      currencyBuy: [item ? item.buyEstimates?.currencyId || (this.currentUser?.currency?.currencyId || '') : (this.currentUser?.currency?.currencyId || ''), Validators.required],
      buyRate: [item ? item.buyEstimates?.rate : null],
      buyTotal: [item ? item.buyEstimates?.amount : null],
      buyExRate: [item ? item.buyEstimates?.exChangeRate || 1 : 1],
      buyTaxable: [item ? item.buyEstimates?.taxableAmount : 0],
      buyIgst: [item ? item.buyEstimates?.igst : null],
      buyCgst: [item ? item.buyEstimates?.cgst : null],
      buySgst: [item ? item.buyEstimates?.sgst : null],
      buyTotalINR: [item ? item.buyEstimates?.totalAmount : 0],
      buyTerm: [item ? item.buyEstimates?.terms : null],
      supplier: [item ? item.buyEstimates?.supplier : null],


      currencySell: [item ? item.selEstimates?.currencyId || (this.currentUser?.currency?.currencyId || '') : (this.currentUser?.currency?.currencyId || ''), Validators.required],
      sellRate: [item ? item.selEstimates?.rate : null,Validators.required],
      sellTotal: [item ? item.selEstimates?.amount : null],
      sellExRate: [item ? item.selEstimates?.exChangeRate || 1 : 1,Validators.required],

      sellTaxable: [item ? item.selEstimates?.taxableAmount : 0],
      sellIgst: [item ? item.selEstimates?.igst : null],
      sellCgst: [item ? item.selEstimates?.cgst : null],
      sellSgst: [item ? item.selEstimates?.sgst : null],

      sellTotalINR: [item ? item.selEstimates?.totalAmount : 0],
      sellTerm: [item ? item.selEstimates?.terms : null],
      remarks: [item ? item.selEstimates?.remarks : null],

      margin: [item ? item.tenantMargin || 0 : 0],

    });

    (this.quoteForm.get('charge') as FormArray).push(row);

    if (this.isOnlyView) {
      const controls = (this.quoteForm.get('charge') as FormArray).controls;
      controls.forEach((element) => {
        element.disable();
      });
    }

    if (i > -1) {
      if(!noGST){
        this.setGSTtoRow(i)
        this.setQuantity(i)
        this.sellCurrChange(i)
        this.buyCurrChange(i) 
      }  
      this.calcBuyAMT(i)
    }

  }
  // deleteCharge(index: number): void {
  //   (this.quoteForm.get('charge') as FormArray).removeAt(index);
  // }
  deleteCharge(content1, data: any, index) {
    this.modalService?.open(content1, {
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
        if (this.getChargeControlsLength() > 0) {
          this.calcBuyAMT(0)
        }


        // const itemData = this.costItemList?.filter(
        //   (item) => item !== data
        // );
        // this.costItemList = itemData;
        // this.SaveCharge.emit(this.costItemList);
      }
    });



  }

  // costItem1() {
  //   let payload = this.commonService.filterList()
  //   if (payload?.query) payload.query = {
  //     "status": true,
  //   }

  //   if(this.isExport){
  //     payload.query = {
  //       ...payload.query,
  //       defaultExportCharge : true
  //     }
  //   }else{
  //     payload.query = {
  //       ...payload.query,
  //       defaultImportCharge : true
  //     } 
  //   }

  //   this.commonService.getSTList('costitem', payload)?.subscribe((data) => {
  //     // this.addDefaultCharge = data.documents; 
  //   });
  // }
  biddingList:any= []
  getBidding(){
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = { 
      "adminStatus": {
        "$in": [
          "Accepted", 'Job Created'
        ]
      },
      enquiryId: this.route.snapshot?.params['id'],
    }

    this.commonService.getSTList('transportinquiry', payload)?.subscribe((data) => {
      this.biddingList = data.documents[0]; 
    });
  }
  costItem() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      "status": true,
    }

    this.commonService.getSTList('costitem', payload)?.subscribe((data) => {
      this.chargeName = data.documents;
      if (this.isExport) {
        this.addDefaultCharge = data?.documents?.filter((x) => x?.defaultExportCharge);
      }else if(this.isTransport) {
        this.addDefaultCharge = data?.documents?.filter((x) => x?.defaultTransportCharge);
      } else {
        this.addDefaultCharge = data?.documents?.filter((x) => x?.defaultImportCharge);
      }
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
    control.buyTotal.patchValue(Number((control.buyRate.value * control.quantity.value).toFixed(2)))
    control.buyTaxable.patchValue(Number((control.buyExRate.value * control.buyRate.value * control.quantity.value).toFixed(2)))

    control.sellTotal.patchValue(Number((control.sellRate.value * control.quantity.value).toFixed(2)))
    control.sellTaxable.patchValue(Number((control.sellExRate.value * control.sellRate.value * control.quantity.value).toFixed(2)))

    let gstBuyValue = Number((control.buyTaxable.value * control.gst.value) / 100)
    let gstSellValue = Number((control.sellTaxable.value * control.gst.value) / 100)

    control.buyIgst.patchValue(Number((gstBuyValue).toFixed(2)))
    control.buyCgst.patchValue(Number((gstBuyValue / 2).toFixed(2)))
    control.buySgst.patchValue(Number((gstBuyValue / 2).toFixed(2)))

    control.sellIgst.patchValue(Number((gstSellValue).toFixed(2)))
    control.sellCgst.patchValue(Number((gstSellValue / 2).toFixed(2)))
    control.sellSgst.patchValue(Number((gstSellValue / 2).toFixed(2)))


    control.buyTotalINR.patchValue(Number((gstBuyValue + control.buyTaxable.value).toFixed(2)))
    control.sellTotalINR.patchValue(Number((gstSellValue + control.sellTaxable.value).toFixed(2)))


    control.margin.patchValue(Number((control.sellTotalINR.value - control.buyTotalINR.value).toFixed(2)))
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
    // control.currencySell.patchValue(control.currencyBuy.value) 
    let currencyShortName = this.currencyList?.filter(x => x?.currencyId ==
      control.currencyBuy.value)[0]?.currencyShortName

    let exRate = 0
    if (currencyShortName != this.quoteForm.value.currencyShortName) {
      let payload = {
        "fromCurrency": currencyShortName,
        "toCurrency": this.quoteForm.value.currencyShortName,
      }

      if (this.currencyRate.hasOwnProperty(currencyShortName)) {
        exRate = this.currencyRate[currencyShortName]
        control.buyExRate.patchValue(exRate?.toFixed(3))
        this.calcBuyAMT(i)
      } else {
        this.commonService.getExchangeRate('exchangeRate', payload)?.subscribe((result) => {
          // this.currencyRate[currencyShortName] = result[this.quoteForm.value.currencyShortName]
          this.currencyRate = { ...this.currencyRate, [currencyShortName]: result[this.quoteForm.value.currencyShortName] }
          exRate = result[this.quoteForm.value.currencyShortName]
          control.buyExRate.patchValue(exRate?.toFixed(3))
          this.calcBuyAMT(i)
          // control.sellExRate.patchValue(exRate) 
        })
      }

    }
    else {
      exRate = 1
      control.buyExRate.patchValue(exRate?.toFixed(3))
      this.calcBuyAMT(i)
      // control.sellExRate.patchValue(exRate) 
    }

    // let exRate = this.currencyList?.filter(x => x?.currencyId ==
    //   control.currencyBuy.value)[0]?.currencyPair || 1 

  }

  sellCurrChange(i) {
    let control = this.quoteForm.controls.charge['controls'][i].controls
    // let exRate = this.currencyList?.filter(x => x?.currencyId ==
    //   control.currencySell.value)[0]?.currencyPair || 1

    // control.sellExRate.patchValue(exRate) 


    let currencyShortName = this.currencyList?.filter(x => x?.currencyId ==
      control.currencySell.value)[0]?.currencyShortName


    let exRate = 0
    if (currencyShortName != this.quoteForm.value.currencyShortName) {
      let payload = {
        "fromCurrency": currencyShortName,
        "toCurrency": this.quoteForm.value.currencyShortName,
      }

      if (this.currencyRate.hasOwnProperty(currencyShortName)) {
        exRate = this.currencyRate[currencyShortName]
        control.sellExRate.patchValue(exRate?.toFixed(3))
        this.calcBuyAMT(i)
      } else {
        this.commonService.getExchangeRate('exchangeRate', payload)?.subscribe((result) => {
          // this.currencyRate[currencyShortName] = result[this.quoteForm.value.currencyShortName]
          this.currencyRate = { ...this.currencyRate, [currencyShortName]: result[this.quoteForm.value.currencyShortName] }
          exRate = result[this.quoteForm.value.currencyShortName]
          control.sellExRate.patchValue(exRate?.toFixed(3))
          this.calcBuyAMT(i)
        })
      }


    }
    else {
      exRate = 1
      control.sellExRate.patchValue(exRate?.toFixed(3))
      this.calcBuyAMT(i)
    }


  }
  back() {
    this.router.navigate([
      '/enquiry/list/'
    ]);
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
          }, index,true)
        } else {
          this.addChargeRow(element, index,true)
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
  getInvalidControls() {
    const invalidControls = [];

    const controls = this.quoteForm.controls;

    for (const name in controls) {
      if (controls[name].invalid) {
        if (controls[name] instanceof FormArray) {
          const formArray = controls[name] as FormArray;
          formArray.controls.forEach((control, index) => {
            if (control.invalid) {
              invalidControls.push(`${name}[${index}]`);
            }
          });
        } else if (controls[name] instanceof FormGroup) {
          const formGroup = controls[name] as FormGroup;
          for (const subName in formGroup.controls) {
            if (formGroup.controls[subName].invalid) {
              invalidControls.push(`${name}.${subName}`);
            }
          }
        } else {
          invalidControls.push(name);
        }
      }
    }

    return invalidControls;
  }
  onSave(status) {
    console.log(this.getInvalidControls())
    if (!status) {
      this.submitted = true; 
      if (this.quoteForm.invalid) {
        this.notification.create
          ('error', 'Please fill the form', '');
        this.markAllAsTouched(this.quoteForm);
        return false
      }
    } 
    // if (this.getChargecontainerLength() == 0) {
    //   this.notification.create
    //     ('error', 'Please add charge items', ''); 
    //   return false
    // }
    let addPortOrigin ={}
    let addPortDestination ={}
    if(this.isTransport){
      if(this.enquiryDetails?.transportDetails?.origin[0]?.locationType ==='address'){
        addPortOrigin = {
          loadPortId: this.quoteForm.value.load_port,
          loadPortName: this.quoteForm.value.load_port, 
        }
      }else if(this.enquiryDetails?.transportDetails?.origin[0]?.locationType ==='location'){
        addPortOrigin = {
          loadPortId: this.quoteForm.value.load_port,
          loadPortName: this.locationList?.filter((x) => x.locationId === this.quoteForm.value.load_port)[0]?.locationName, 
        }
      }else{
        addPortOrigin = {
          loadPortId: this.quoteForm.value.load_port,
          loadPortName: this.portList?.filter((x) => x.portId === this.quoteForm.value.load_port)[0]?.portName, 
        }
      }
      if(this.enquiryDetails?.transportDetails?.origin[1]?.locationType ==='address'){
        addPortDestination = { 
          dischargePortId: this.quoteForm.value.discharge_port,
          dischargePortName:this.quoteForm.value.discharge_port,
        }
      }else if(this.enquiryDetails?.transportDetails?.origin[1]?.locationType ==='location'){
        addPortDestination = { 
          dischargePortId: this.quoteForm.value.discharge_port,
          dischargePortName: this.locationList?.filter((x) => x.locationId === this.quoteForm.value.discharge_port)[0]?.locationName,
        }
      }else{
        addPortDestination = { 
          dischargePortId: this.quoteForm.value.discharge_port,
          dischargePortName: this.portList?.filter((x) => x.portId === this.quoteForm.value.discharge_port)[0]?.portName,
        }
      }
    }else{
      addPortOrigin = {
        loadPortId: this.quoteForm.value.load_port,
        loadPortName: this.portList?.filter((x) => x.portId === this.quoteForm.value.load_port)[0]?.portName,
     }
     addPortDestination= {
        dischargePortId: this.quoteForm.value.discharge_port,
        dischargePortName: this.portList?.filter((x) => x.portId === this.quoteForm.value.discharge_port)[0]?.portName,
      }
    }
    let newAgentAdvice = {
      ...addPortOrigin,
      ...addPortDestination,
      isExport: (localStorage.getItem('isExport') === 'true' || localStorage.getItem('isTransport') === 'true') ? true : false,
      orgId: this.commonFunction.getAgentDetails().orgId,
      tenantId: this.userData.tenantId,
      quotationId: this.editQuoteDetails?.quotationId || '',
      enquiryId: this.enquiryId || '',
      "agentadviceId": this.enquiryId || '',
      "agentadviceNo": this.enquiryDetails?.agentadviceNo || '',
      enquiryNo: (this.isExport || this.isTransport)? this.enquiryDetails?.enquiryNo : this.enquiryDetails?.agentadviceNo || '',
      validFrom: currentTime(this.quoteForm.value.validFrom),
      validTo: currentTime(this.quoteForm.value.validTo),
      currency: this.quoteForm.value.currency,
      currencyShortName: this.currencyList?.filter((x) => x.currencyId === this.quoteForm.value.currency)[0]?.currencyShortName,
      exRate: this.quoteForm.value.exRate,
      carrierId: this.quoteForm.value.shipping_line ||'',
      carrierName: this.isTrasportSelf ? 'Self' : this.shippingLineList?.filter((x) => x.shippinglineId === this.quoteForm.value.shipping_line)[0]?.name,
      carrierReceiptId: this.quoteForm.value.carrierReceipt ||'',
      carrierReceiptName: this.locationList?.filter((x) => x.locationId === this.quoteForm.value.carrierReceipt)[0]?.locationName ||'',
      etd: this.quoteForm.value.etd,
      // loadPortId: this.quoteForm.value.load_port,
      // loadPortName: this.portList?.filter((x) => x.portId === this.quoteForm.value.load_port)[0]?.portName,
      // dischargePortId: this.quoteForm.value.discharge_port,
      // dischargePortName: this.portList?.filter((x) => x.portId === this.quoteForm.value.discharge_port)[0]?.portName,
      eta: this.quoteForm.value.eta,
      flightId: this.quoteForm.value.flightNo,
      vehicleId: this.quoteForm.value.vehicleNo,
      flightNo: this.flightList?.filter((x) => x.airId === this.quoteForm.value.flightNo)[0]?.flight || '',
      vehicleNo: this.vehicalList?.filter((x) => x.landId === this.quoteForm.value.vehicleNo)[0]?.vehicleLicence || '',
      vesselId: this.quoteForm.value.plannedVessel,
      vesselName: this.vesselList?.filter((x) => x.vesselId === this.quoteForm.value.plannedVessel)[0]?.vesselName ||'',
      voyageNumber: this.quoteForm.value.voyageNumber,
      // shipperName: this.quoteForm.value.shipperName,
      shipperId: this.quoteForm.value.shipperName ||'',
      shipperName: this.partyMasterNameList.filter(x => x.partymasterId === this.quoteForm.value.shipperName)[0]?.name,
      carrierDeliveryId: this.quoteForm.value.carrierDelivery ||'',
      carrierDeliveryName: this.locationList?.filter((x) => x.locationId === this.quoteForm.value.carrierDelivery)[0]?.locationName ||'',
      destPortFreeDays: this.quoteForm.value.destPortFreeDays || 0,
      originFreeDays: this.quoteForm.value.originFreeDays || 0,
      destFreeDays: this.quoteForm.value.destFreeDays || 0,
      enquiryTypeName: this.quoteForm.value.enquiryTypeName,
      totalBuy: this.buyTotal || 0,
      totalBuyTax: this.buyTotal || 0,
      totalSell: this.sellTotal || 0,
      totalSellTax: this.sellTotal || 0,
      remarks: this.quoteForm.value.remarks,
      branchId: this.quoteForm.value?.branch,
      branchName: this.branchList?.filter(x => x?.branchId === this.quoteForm.value?.branch)[0]?.branchName,
      branchStateCode: this.branchList?.filter(x => x?.branchId === this.quoteForm.value?.branch)[0]?.addressInfo.stateCode,
      jobCode: this.branchList?.filter(x => x?.branchId === this.quoteForm.value?.branch)[0]?.jobCode || '',
      quoteStatus: status ? 'Draft' : this.editQuoteDetails?.isRequotation ? 'Requotation Submitted' : 'Quotation Created',
      status: true,
    };
    const updateEnquiry = (enquiryId) => {
      this.commonService.UpdateToST(`enquiry/${enquiryId}`, { quotationCreateStatus: true })?.subscribe((res: any) => {
        if (res) {
        }
      }, error => {
      });
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
            // this.backbtn()
            
    this.router.navigate(['/enquiry/list/'+ this.enquiryId + '/quote']);
            let successMessage = 'Saved Successfully';
            this.notification.create('success', successMessage, '');
            updateEnquiry(this.enquiryId);
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

            if (this.editQuoteDetails?.isRequotation) {
              let url;
              if (this.isExport || this.isTransport) {
                url = "enquiry/" + this.enquiryDetails?.enquiryId;
              } else {
                url = "agentadvice/" + this.enquiryDetails?.agentadviceId;
              }
              let payload12 = {
                agentAdviseStatus: this.enquiryDetails?.agentAdviseStatus == 'Requotation Requested' ? 'Re-quoted Submitted' : 'Inquiry Submitted',
                enquiryStatus: this.enquiryDetails?.enquiryStatus == 'Requotation Requested' ? 'Requote Submitted' : 'Inquiry Submitted',
                enquiryStatusCustomer: this.enquiryDetails?.enquiryStatus == 'Requotation Requested' ? 'Requoted' : 'Awaiting Review',
                estimate: {
                  ...this.enquiryDetails?.estimate,
                  maxPrice: res?.totalSell || 0.00,
                  minPrice: res?.totalSell || 0.00,
                  quoteAmount: res?.totalSell || 0.00,
                  finalPrice: res?.totalSell || 0.00,
                  cost: res?.totalSell || 0.00,
                }
              }
              this.commonService.UpdateToST(url, payload12)?.subscribe()
            }

            this.router.navigate(['/enquiry/list/'+ this.enquiryId + '/quote']);
            // this.backbtn()
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
    this.quoteForm.controls.exRate.patchValue(
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

    if (this.enquiryDetails?.basicDetails?.billingCountry?.toLowerCase() == 'india' || this.enquiryDetails?.basicDetails?.billingCountry?.toLowerCase() == 'ind'
      || this.enquiryDetails?.basicDetails?.billingCountry?.toLowerCase() == '' || this.enquiryDetails?.basicDetails?.billingCountry?.toLowerCase() == undefined) {

      if (arr == this.enquiryDetails?.basicDetails?.billingStateCode) {
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
        control.gstType.patchValue(this.gstType)
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
      control.quantity.patchValue(noContainer || 1)
    } else if (data?.chargeTypeName?.toLowerCase() == 'qty' || data?.chargeTypeName?.toLowerCase() == 'box' || data?.chargeTypeName?.toLowerCase() == 'pallet') {
      const totalUnits = this.enquiryDetails?.looseCargoDetails?.cargos?.reduce((sum, cargo) => sum + cargo?.units, 0) || 1;
      control.quantity.patchValue(totalUnits)
    }
    else {
      control.quantity.patchValue(1)
    }

    control.gst.patchValue(data?.gst || 0)
    control.basic.patchValue(data?.chargeType || '')
    // control.sellRate.patchValue(data?.chargeAmount || 0)
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
      control.quantity.patchValue(noContainer || 1)
    } else {
      control.quantity.patchValue(1)
    }
    this.calcBuyAMT(i)
  }
  disabledDate = (current: Date): boolean => {
    const yesterdayDate = new Date(this.todayDate);
    yesterdayDate.setDate(this.todayDate.getDate() - 1);
    return current && current < yesterdayDate;
  };
  selectedEtaDate: Date | null = null;
  disabledEtdDatew = (current: Date): boolean => {
    if (!this.selectedEtaDate) {
      return false;
    }
    // Disable all dates before and including the selected ETA date
    const etaDate = new Date(this.selectedEtaDate);
    etaDate.setDate(etaDate.getDate() - 1); // Adjust to disable the day before
    return current && current <= etaDate;
  };
  isCloneQuote: boolean = false
  editQuote(isEdit, view?) {
    let data = this.quotationList
    const formArray = this.quoteForm.get('charge') as FormArray;
    formArray.clear();

    this.activeFright = this.enquiryDetails?.basicDetails?.ShipmentTypeName?.toLowerCase()

 
    if (this.enquiryDetails?.basicDetails?.ShipmentTypeName?.toLowerCase() === 'air') {
      this.activeFrightAir = true;
    }

    if (isEdit) {
      this.editQuoteDetails = data
      this.isEditQoute = true
      this.isCloneQuote = false
    } else {
      this.isEditQoute = false
      this.editQuoteDetails = []
      this.isCloneQuote = true
    }
    this.setGstType(data.branchStateCode)

    if (view) {
      this.quoteForm.disable();
      this.isOnlyView = view
    } else {
      this.quoteForm.enable();
    }
    this.openQuotaion = true
    this.getCharges(data.quotationId)

 
    this.quoteForm.patchValue({
      enquiryTypeName: data?.enquiryTypeName,
      shipperName:data?.shipperName,
      validFrom: data?.validFrom,
      validTo: data?.validTo,
      currency: data?.currency,
      exRate: data?.exRate,
      shipping_line: data?.carrierId,
      carrierReceipt: data?.carrierReceiptId,
      etd: data?.etd,
      load_port: data?.loadPortId,
      branch: data?.branchId,
      discharge_port: data?.dischargePortId,
      eta: data?.eta,
      currencyShortName: data?.currencyShortName,
      plannedVessel: data?.vesselId,
      voyageNumber: data?.voyageNumber,
      carrierDelivery: data?.carrierDeliveryId,

      flightNo: data?.flightId,
      vehicleNo: data?.vehicleId,

      destPortFreeDays: data?.destPortFreeDays,
      originFreeDays: data?.originFreeDays,
      destFreeDays: data?.destFreeDays,
      remarks: data?.remarks,
    })

  
    // this.setVoyage()
    this.loader = false;
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
        // pdfWindow.print();
      }
    })
  } 
  totalGrossWeight(arr) {
    let total = 0
    arr?.filter((x) => {
      total += Number(x.grossWeightContainer)
    })
    return total
  } 

  backbtn() {
    this.location.back();
  }
}
