import { Component, OnInit, Output, EventEmitter, Input, ViewChild, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FinanceService } from 'src/app/services/Finance/finance.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { CommonService } from 'src/app/services/common/common.service';
import { ApiSharedService } from 'src/app/shared/components/api-service/api-shared.service';
import { ApiService } from 'src/app/admin/principal/api.service';
import * as Constant from 'src/app/shared/common-constants';
import { differenceInCalendarDays } from 'date-fns';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { format } from 'date-fns';
import { CognitoService } from 'src/app/services/cognito.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-detention-invoice',
  templateUrl: './detention-invoice.component.html',
  styleUrls: ['./detention-invoice.component.scss']
})
export class DetentionInvoiceComponent implements OnInit {
  searchText: any;
  @ViewChild("insideVendor") insideVendor;
  @ViewChild("insideVendor1") insideVendor1;
  showTem: boolean = false;
  isExport: any;
  partyMasterFrom: any = [];
  irisResponse: any;
  exchangeRate: any = 0;
  isGSTinState: boolean;
  billToValue: any;
  gstType: string = 'igst';
  currencyData: any;
  isCurency: boolean =false;
  defaultExRate: number;
  defaultCurrency: any;
  containerArrayNew: any = [];
  userData: any;
  todayDate=new Date();
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
  @Input() isType: any = 'add';
  allInvoicesData = []
  editinvoiceForm: FormGroup;
  addnewinvoiceFrom: FormGroup;
  submitted: boolean;
  urlParam: any;
  isAddMode: any;
  id: any;
  invoiceIdToUpdate: any;
  modalReference: any;
  closeResult: string;
  SAModule: boolean = true;
  filterBody = this.apiService.body
  partyMasterList: any;
  bankList: any;
  bankDetail: any = [];
  paymentTermList: any;
  blModel: any;
  totalAmount: number = 0;
  taxAmount: number = 0;
  billAmount: number = 0;
  costItemList: any = [];
  batchNoList: any = [];
  enquiryData: any;
  advancePercent = 90;
  AdvanceValue: any = 0;
  invoiceTypeTab: any = '';
  showDefault: boolean = false;
  invoiceTypeList = [

    { name: "Detention Invoice", value: 'Detention Invoice' },
    { name: "Periodic Invoice", value: 'Periodic Invoice' },
    { name: "Lum Sum Invoice", value: 'Lumpsum Invoice' },
  ]
  supplyListData: any = [];
  baseCostItems: any = [];
  blData: any = [];
  Documentpdf:any;
  shipperList: any = [];
  addChargesForm: FormGroup;
  containersList: any = [];
  form;
  totalContainerAmount = 0;
  deliveryOrderList: any = [];
  viewEdit: boolean = false;
  batchID: any;
  sort(array , key){
    return this.sortPipe.transform(array, key);
   }
  //  private subscription: Subscription;
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private _api: ApiService,
    private notification: NzNotificationService,
    private _FinanceService: FinanceService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private commonfunction: CommonFunctions,
    private apiService: ApiSharedService,
    public commonService: CommonService,
    private sortPipe : OrderByPipe,
    private cognito : CognitoService,
  ) {
  this.isExport = localStorage.getItem('isExport') === 'false' ? false : true;
//   this.subscription= this.cognito.getUserDatails().subscribe((resp) => { 
//       console.log(resp,'getUserDatails') 
     
//   }) 
//   this.subscription= this.cognito.getagentDetails().subscribe((resp) => { 
//     console.log(resp,'getagentDetails') 
// }) 
    this.viewEdit = this.commonfunction.invoiceDisabled
    this.addChargesForm = this.formBuilder.group(
      {
        charges: this.formBuilder.array([])
      },
    );
   
    this.editinvoiceForm = this.formBuilder.group({
      invoice_no: [''],
      invoice_type: ['', [Validators.required]],
      bill_to: ['', [Validators.required]],
      sez_type: [''],
      coName: [''],
      coAddress: [''],
      tax_applied: [''],
      bill_from: ['', [Validators.required]],
      gst_number: [''],
      invoice_date: [new Date(), [Validators.required]],
      payment_terms: [''],
      invoice_amount: ['', [Validators.required]],
      billdue_date: ['', [Validators.required]],
      printBank: [false],
      bank: [''],
      batchNo: [''],
      remark: ['', [Validators.required]],
      shipper: [''],
      credit_debit: [true],
      detentionTo: [''],
      detentionFrom: [''],

      detentionDays: [''],
      detentionRate: [''],
      noContainer: [''],
      bl: ['', [Validators.required]]
    });
    this.getBatchList()
  }
  get f() {
    return this.editinvoiceForm.controls;
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
  convertDate(e) {
    var date = new Date(e)
    return format(date, "dd-MM-yyyy")

  }
  onSave(evt, flag) {
    this.submitted = true;
    if (this.editinvoiceForm.valid) {
      let userData = this.partyMasterList?.filter((x) => x.tax_number === this.editinvoiceForm.value.bill_to)[0] || ''

    if(!userData?.tax_number){
      this.notification.create('info', 'Party has no GST No Then we can not generate IRN', '');
    }
    let valueGstType = this.partyMasterList?.filter(x => x.tax_number === this.editinvoiceForm.value.bill_to)[0]?.placeofSupply?.toString()
    this.isGSTinState = valueGstType?.toLowerCase() === 'mh' ? true : false
   let tenantId = ""
    this.cognito.getUserDatails().subscribe((resp) => {
      if (resp != null) {
        tenantId = resp.tenantId
      }
    }) 

      const newInvoice = {
        
        "tenantId": tenantId,
        "invoiceId": "",
        "invoice_date": this.convertDate(this.editinvoiceForm.value.invoice_date),
        "invoiceDueDate": this.convertDate(this.editinvoiceForm.value.billdue_date),
        "invoiceTypeStatus": this.editinvoiceForm.value.invoice_type,
        "invoiceType": "B2B",
        "remarks": this.editinvoiceForm.value.remark,
        "invoiceNo": "",
        "invoiceToGst": this.editinvoiceForm.value.bill_to,
        "invoiceToId": this.partyMasterList?.filter(x => x.tax_number === this.editinvoiceForm.value.bill_to)[0]?.partymasterId,
        "invoiceToName": this.partyMasterList?.filter(x => x.tax_number === this.editinvoiceForm.value.bill_to)[0]?.name,
        "invoiceFromId": this.editinvoiceForm.value.bill_from,
        "invoiceFromName": this.partyMasterList?.filter(x => x.partymasterId === this.editinvoiceForm.value.bill_from)[0]?.name,
        "invoiceAmount": this.totalAmt(this.costItemList[0]?.taxRate).toString() || '',
        "invoiceTaxAmount": this.gstType === 'igst' ? this.igst( this.costItemList[0]?.taxRate || 0).toString() :this.sgst( this.costItemList[0]?.taxRate || 0).toString(),
        "coName": this.editinvoiceForm.value.coName,
        "coAddress": this.editinvoiceForm.value.coAddress,
        "moveNo": this.batchNoList[0]?.moveNo,
        "gstNo":  userData?.tax_number?.toString()||'',
        "userStateCode": userData?.tax_number?.toString()?.slice(0, 2) || '',
        "userPinCode": userData?.pinCode?.toString() || '',
        "userLocation": userData?.branch_city || '',

        "backDate": this.editinvoiceForm.value.backDate,
        "isBackDate": this.editinvoiceForm.value.isBackDate,
        "tax": [
          {
            "taxAmount": 0,
            "taxRate": 0,
            "taxName": ""
          }
        ],
        "blId": this.editinvoiceForm.value.bl,
        "blName": this.blData?.filter(x => x.blId === this.editinvoiceForm.value.bl)[0]?.blNumber,
        "consigneeId": this.batchNoList[0] ? this.batchNoList[0].consigneeId : '',
      "consigneeName": this.batchNoList[0] ? this.batchNoList[0].consigneeName : '', 
      "placeOfSupply": this.supplyListData?.filter(x => x.locationId === this.editinvoiceForm.value.placeOfSupply)[0]?.locationName || '',
        "placeOfSupplyId": this.editinvoiceForm.value.placeOfSupply || '',
        "advancePayment": Number(this.AdvanceValue),
        "advancePercentage": Number(this.advancePercent),
        "costItems": this.addCharges() || [],
        "data": Object.keys(this.costItemList.filter(x => x.isSelected  )).map(key => (this.costItemList.filter(x => x.isSelected  )[key]?.costItemId)),
        "shipperAddress":{
          "stateName" : userData?.branch_stateName || '',
          "stateCode" : userData?.stateCodeBranch || '',
          },
        "shipperId": this.editinvoiceForm.value.shipper || '',
        "shipperName": this.shipperList.filter(x => x.partymasterId === this.editinvoiceForm.value.shipper)[0]?.name || '',
        "paymentStatus": "",
        "paidAmount": 0,
        "jobNumber": "",
        "printBank": this.editinvoiceForm.value.printBank,
        "containers": this.addArrayValue(),
        "jobId": '',
        "batchId": this.batchNoList[0]?.batchId,
        "batchNo": this.batchNoList[0]?.batchNo,
        "paymentTerms": this.editinvoiceForm.value.payment_terms || 0,
        "bankId": this.bankDetail?.bankId,
        "bankName": this.bankDetail?.bankName,
        "bankType": "local",
        "voyageNumber":this.batchNoList[0].routeDetails?.finalVoyageName|| this.batchNoList[0].plannedVoyageName,
        "vesselId": "",
        "isSez": this.partyMasterList?.filter(x => x.tax_number === this.editinvoiceForm.value.bill_to)[0]?.isSez === 'true' ? 'Y' : 'N' ,
        "vesselName": this.batchNoList[0].routeDetails?.finalVesselName|| this.batchNoList[0].plannedVesselName,
        "paymentMode": "CASH",
        "serviceDatefrom": this.convertDate(new Date()),
        "serviceDateTill": this.convertDate(new Date()),
        "taxNumber": "",
        "isExport": this.isExport,
        "status": true,
        "statusOfinvoice": flag,
        "holdPosting": true,
        "invoiceStatus": flag,
        "principleBill": false,
        "gstType" : this.isGSTinState ? 'sgst' : 'igst'
      }
   
      if (this.invoiceIdToUpdate?.invoiceId) {
        this.commonService.UpdateToST(`invoice/${this.invoiceIdToUpdate?.invoiceId}`,{ ...newInvoice, invoiceId: this.invoiceIdToUpdate?.invoiceId, invoiceNo: this.invoiceIdToUpdate?.invoiceNo }).subscribe(
          (res: any) => {
            if (res) {
              this.notification.create(
                'success',
                'Update Successfully',
                ''
              );
              this.submitted = false
              setTimeout(() => {
                this.router.navigate(['/batch/list/add/' + this.route.snapshot?.params['id'] + '/invoice']);
              }, 1000);
            }
          },
          (error) => {
            this.notification.create('error', error?.error?.error?.message, '');
          }
        );
      } else {
        this.commonService.addToST('invoice',newInvoice).subscribe(
          (res: any) => {
            if (res) {
              this.notification.create(
                'success',
                'Save Successfully',
                ''
              );
              this.submitted = false
               setTimeout(() => {
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
      return false;
    }
  }

  onCloseInvoice(evt) {
    this.CloseInvoiceSection.emit(evt);
  }

  ngOnInit(): void {
    if (!this.SAModule) {
      this.getLocationDropDowns()
    }
  
    this.getblData()
    this.getDeliveryOrderList()
    this.id = this.route.snapshot?.params['moduleId'];
    this.isAddMode = !this.id;
    this.costItem()
    this.getSystemTypeDropDowns();
    this.getBankList();
    if (this.route.snapshot?.params['moduleId']) {
      this.getInvoiceDetailsById(this.route.snapshot?.params['moduleId']);
    }
    if (this.viewEdit) {
      this.editinvoiceForm.disable()
    }
  }
  costItem() {
    // this.filterBody = this.apiService.body;
    // let must = [{ match: { status: true } }, 
    // ,{"wildcard":{"costitemName.keyword":{"value":"*DEMURRAGE*","case_insensitive":true}}}
    // ,{"wildcard":{"costitemGroup.keyword":{"value":"*DETENTION*","case_insensitive":true}}}];
    // this.filterBody.query.bool.must = must;
  let payload = this.commonService?.filterList()
   if(payload?.query) payload.query = {
      "status": true,
      costitemName :  {
        "$regex" : 'DEMURRAGE',
        "$options": "i"
    },
    costitemGroup : {
      "$regex" : 'DETENTION',
      "$options": "i"
  }
    }

    this.commonService
      ?.getSTList('costitem', payload)
      .subscribe((data) => {
        this.costItemList = [data?.documents[0]] ;
      });
  }
  getblData() {
    let payload = this.commonService?.filterList()
    if(payload?.query)payload.query = {"batchId": this.route.snapshot?.params['id'] }
    this.commonService?.getSTList('bl',payload)
      .subscribe((data: any) => {
        this.blData = data.documents;
      });
  }
  getDeliveryOrderList() {
    let payload = this.commonService?.filterList()
    if(payload?.query)payload.query = {"batchId": this.route.snapshot?.params['id'] }

    this._api?.getSTList(Constant.MASTER_DELIVERY_ORDER_LIST, payload).subscribe((res: any) => {
      this.deliveryOrderList = res?.documents;
    });
  }
  getPartyList() {
    let payload = this.commonService?.filterList()
    if(payload?.query) payload.query = { "status": true }

    this.commonService?.getSTList("partymaster", payload).subscribe((data) => {
      let partyMasterList = data.documents
      let dataParty = []
      partyMasterList.forEach(element => {
        if (element?.branch?.length > 0) {
          element?.branch?.map((x) => {
            dataParty.push( { ...element, ...x})
          })
        } else {
          dataParty.push({ ...element })
        }

      });
      this.partyMasterList = dataParty;
      
      this.partyMasterList = this.isExport? this.partyMasterList.filter((x) => x?.partymasterId === this.batchNoList[0]?.bookingPartyId)
       : this.partyMasterList.filter((x) => x?.partymasterId === this.batchNoList[0]?.invoicingPartyId);
      this.partyMasterFrom = dataParty;
      this.partyMasterFrom = this.partyMasterFrom.filter((x) => x?.name?.toLowerCase() === 'stolt' || x?.name?.toLowerCase() === 'jmb')
      dataParty?.filter((x) => {
        if (x.customerType) {
          x.customerType.map((res: any) => {
            if (res?.item_text === 'Shipper') { this.shipperList.push(x) }
          })
        }
      });
      this.setShipper()
    });
  }
  getSystemTypeDropDowns() {

    let payload = this.commonService?.filterList()
    if(payload?.query) payload.query = {
      "status": true,
      "typeCategory": {
        "$in": [
          "invoiceType","paymentTerms"
        ]
      }
    }

    this.commonService?.getSTList("systemtype",payload).subscribe((res: any) => {
      this.paymentTermList = res?.documents?.filter(x => x.typeCategory === "paymentTerms");

    });
  }

  getBankList() {
    let payload = this.commonService?.filterList()
    if(payload?.query) payload.query = {
      isBank: true,
    }

    this.commonService?.getSTList("bank",payload)
      .subscribe((data) => {
        this.bankList = data.documents;
      });
  }
  bankDetails(value) {
    this.bankDetail = []
    this.bankDetail = this.bankList?.filter(x => x.bankId === value)[0]
  }
  getInvoiceDetailsById(id) {
    let payload = this.commonService?.filterList()
    if(payload?.query) payload.query = {
      "invoiceId": id,
    }

    this.commonService?.getSTList("invoice",payload).subscribe((data) => {
      const invoiceData = data.documents[0]
      this.invoiceIdToUpdate = invoiceData
      this.irisResponse = invoiceData?.irisResponse
      this.advancePercent = invoiceData?.advancePercentage;
      this.AdvanceValue = invoiceData?.advancePayment;
      this.gstType = invoiceData?.costItems[0]?.gstType
      this.containersList = invoiceData?.containers
      this.setFormArray();
      this.editinvoiceForm.patchValue({
        shipper: invoiceData?.shipperId,
        invoice_no: invoiceData?.invoiceNo,
        invoice_type: invoiceData?.invoiceTypeStatus,
        bill_to: invoiceData?.invoiceToGst,
        sez_type: invoiceData?.invoice_no,
        coName: invoiceData?.coName,
        coAddress: invoiceData?.coAddress,
        tax_applied: '',
        bill_from: invoiceData?.invoiceFromId,
        gst_number: invoiceData?.gstNo,
        invoice_date: new Date(invoiceData?.invoice_date.split('-').reverse()),
        payment_terms: invoiceData?.paymentTerms,
        printBank: invoiceData?.printBank,
        invoice_amount: invoiceData?.invoiceAmount,
        billdue_date: new Date(invoiceData?.invoiceDueDate.split('-').reverse()),
        remark: invoiceData?.remarks,
        bank: invoiceData?.bankId,
        batchNo: invoiceData?.batchNo,
  
        credit_debit: invoiceData?.creditCustomer,
        detentionFrom: invoiceData?.detentionFrom,
        detentionTo: invoiceData?.detentionTo,
        detentionDays: invoiceData?.detentionDays,
        detentionRate: invoiceData?.detentionRate,
        noContainer: invoiceData?.noOfContainer,
        bl: invoiceData?.blId,

      });
      this.setShipper()
    })
  }s

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


  getAgentAdviceById(id) {
    let url = "";
   
    url = Constant.ENQUIRY_LIST;
 
    let payload = this.commonService?.filterList()
    if(payload?.query) payload.query = {
      enquiryId: id,
    }

    this.commonService?.getSTList(url,payload)
      .subscribe((res: any) => {

        this.enquiryData = res?.documents[0];
        this.getCurrencyList(this.enquiryData?.detentionDetails?.polDetentionCurrencyId)
        this.checkCurrency()
      })

  }
  getCurrencyList(id?) {
    if(!id){return}
    let payload = this.commonService?.filterList()
    if(payload?.query) payload.query = {
      status: true,
      currencyId:id
    }
    this.commonService
      ?.getSTList('currency', payload)
      .subscribe((data) => {
        // this.currencyData = data?.documents[0]
        // this.exchangeRate = Number(data?.documents[0]?.currencyPair);
        this.checkCurrency()
      })
    }
  principalSelect($event) {
    this.editinvoiceForm.get('bill_from').setValue($event.nzValue.value.principalName)
  }
  checkCurrency(){
   let currency = this.defaultCurrency?.toLowerCase().toString()
   if(currency === 'inr'){ this.isCurency = false} else{this.isCurency = true}
  }
  onGenerate(e) {
    this.notification.create('success', 'Invoice Generated Successfully', '')
    this.CloseInvoiceSection.emit(e);
  }
  disabledEtaDate = (current: Date): boolean => {
    return differenceInCalendarDays(current, new Date()) < 0;
  };
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
    let payload = this.commonService?.filterList()
   if(payload?.query) payload.query = {
      "batchId": this.route.snapshot?.params['id'] 
    }
    this.commonService?.getSTList('batch', payload)
      .subscribe((data: any) => {
        this.batchNoList = data.documents;
        this.exchangeRate = Number(this.batchNoList[0]?.routeDetails?.exchangeRate) || 0
        this.defaultCurrency = this.batchNoList[0]?.routeDetails?.currencyName || ''
        this.getPartyList();
        this.containerArrayList();
        if(this.isExport)
        this.getAgentAdviceById(data?.documents[0].enquiryId)
        if(!this.isExport)
        this.getCurrencyList(this.batchNoList[0]?.routeDetails?.pod_detention)
      });
  }
  containerArrayList(){
    let payload = this.commonService?.filterList()
    if(payload?.query) payload.query = {
      "batchId": this.route.snapshot?.params['id'] 
    }
    this.commonService?.getSTList(Constant.CONTAINER_LIST, payload)
      .subscribe((data: any) => {
        this.containerArrayNew = data.documents;
      })
  }
  invoiceType() {
    this.invoiceTypeTab = this.editinvoiceForm.value.invoice_type;
    return
    if (this.invoiceTypeTab === 'Ground Rent Invoice') {
      this.costItemList = this.costItemList.filter((item) => item.costItemName === 'Ground Rent' || item.costHeadName === 'Ground Rent')
    } else {
      this.costItemList = this.baseCostItems;
    }
  }
  countDays() {
    let fromDate = new Date(this.editinvoiceForm.value.detentionFrom);
    let toDate = new Date(this.editinvoiceForm.value.detentionTo);
    let differenceInDays = differenceInCalendarDays(
      toDate, fromDate) + 1 ;
    this.editinvoiceForm.get('detentionDays').setValue(differenceInDays)
  }
  calculate() {
    this.billAmount = Number((this.editinvoiceForm?.value.detentionRate * this.editinvoiceForm?.value.detentionDays)
      * this.editinvoiceForm?.value.noContainer)
    this.totalAmt(this.costItemList[0]?.taxRate)
    // this.editinvoiceForm.controls.invoice_amount.setValue(this.billAmount)
  }
  getLocationDropDowns() {
    let payload = this.commonService?.filterList()
    if(payload?.query) payload.query = {
      "status": true,
      masterType:   {
        "$in": ['YARD','CFS','ICD']
      },
    }
    this.commonService
      ?.getSTList('location', payload).subscribe((res: any) => {
      this.supplyListData = res?.documents;
    });
  }

  paymentValue(key?) {
    let e = this.editinvoiceForm?.value.payment_terms
    if (!e || e !== Number(e)) { return false }
    this.editinvoiceForm.controls.billdue_date.setValue(new Date(Date.now() + e * 24 * 60 * 60 * 1000))
  }
  getContainer() {
   let blNumber = this.blData?.filter((x)=> x?.blId === this.editinvoiceForm?.value.bl)[0]?.blNumber
    let containerarray = this.containerArrayNew?.filter((x)=> x?.blNumber === blNumber)
    containerarray?.map((x)=>{
      this.containersList.push({...x})
    })
    // this.containersList = this.blData?.filter(x => x.blId === this.editinvoiceForm.value.bl)[0]?.containers
    this.editinvoiceForm?.get('noContainer').setValue(this.containersList?.length)
    this.setFormArray();

  }


  get charges() {
    return this.addChargesForm.controls["charges"] as FormArray;
  }
  detentionDays(f, t, fd) {
    let fromDate = new Date(f);
    let toDate = new Date(t);
    let differenceInDays = differenceInCalendarDays(
      toDate, fromDate) + 1 - Number(fd);
    return differenceInDays < 0 ? 0 : differenceInDays

  }
  totalDayAMT(f, t, fd, da) {
    let fromDate = new Date(f);
    let toDate = new Date(t);
    let differenceInDays = differenceInCalendarDays(
      toDate, fromDate) + 1 - Number(fd);
    let detentionDays = differenceInDays < 0 ? 0 : differenceInDays
    let totalAmount = 0;
    totalAmount = detentionDays * da;
    return totalAmount
  }
  setFormArray() {
    if (this.containersList) {
      this.addChargesForm = this.formBuilder.group(
        {
          charges: this.formBuilder.array(this.containersList?.map(res => {
            var existDeliveryOrder = this.deliveryOrderList.filter(x => x.containerNos.indexOf(res?.containerNumber) > -1);
            let groupData = {
              containerNo: [  res?.containerNumber || res?.containerNo  ],
              containerType: [ res?.containerType ],
              fromDate: [res?.fromDate ? res?.fromDate : res?.depotDate
               ],
              toDate:[res?.toDate ? res?.toDate : res?.terminalIn
             ],
              freeDays: [ res?.freeDays ? res?.freeDays : this.isExport? this.enquiryData?.detentionDetails?.polFreeDay : this.batchNoList[0]?.routeDetails?.pod_detentionfee],
              detentionDays: [res?.detentionDays ? res?.detentionDays : this.detentionDays(
                res?.fromDate ? res?.fromDate : res?.depotDate,
                res?.toDate ? res?.toDate : res?.terminalIn,
                this.isExport? this.enquiryData?.detentionDetails?.polFreeDay : this.batchNoList[0]?.routeDetails?.pod_detentionfee
              )],
              detentionPerDays: [ res?.detentionPerDays ? res?.detentionPerDays : this.isExport  ? this.enquiryData?.detentionDetails?.polDetentionAmount : this.batchNoList[0]?.routeDetails?.pod_detentionamount],
              totalAmount: [res?.totalAmount ? res?.totalAmount : this.totalDayAMT(
                res?.fromDate ? res?.fromDate : res?.depotDate,
                res?.toDate ? res?.toDate : res?.terminalIn,
                this.isExport? this.enquiryData?.detentionDetails?.polFreeDay : this.batchNoList[0]?.routeDetails?.pod_detentionfee,
                 this.isExport  ? this.enquiryData?.detentionDetails?.polDetentionAmount : this.batchNoList[0]?.routeDetails?.pod_detentionamount
              )],
              totalAmountInr : [res?.totalAmountInr ? res?.totalAmountInr : Number((this.totalDayAMT(
                res?.fromDate ? res?.fromDate : res?.depotDate,
                res?.toDate ? res?.toDate : res?.terminalIn,
                this.isExport? this.enquiryData?.detentionDetails?.polFreeDay : this.batchNoList[0]?.routeDetails?.pod_detentionfee,
                 this.isExport  ? this.enquiryData?.detentionDetails?.polDetentionAmount : this.batchNoList[0]?.routeDetails?.pod_detentionamount
              ) * (this.exchangeRate ||0)).toFixed(2)) ]
            }
            this.form = this.formBuilder.group(groupData);
            if (this.viewEdit) {
              Object.keys((this.form).controls)
                .forEach(key => {
                  (this.form).controls[key].disable();
                })
            }
            return this.form;
          }
          ))
        },
      );
      this.totalContaineAmount();
    }
  }
  changeDate(i) {
    let fromDate = new Date(this.addChargesForm.controls.charges['controls'][i].controls.fromDate.value);
    let toDate = new Date(this.addChargesForm.controls.charges['controls'][i].controls.toDate.value);
    let differenceInDays = differenceInCalendarDays(
      toDate, fromDate) + 1 - Number(this.addChargesForm.controls.charges['controls'][i].controls.freeDays.value);

    this.addChargesForm.controls.charges['controls'][i].controls.detentionDays.setValue(differenceInDays < 0 ? 0 : differenceInDays)
    this.detentionPerDay(i);
  }
  detentionPerDay(i) {
    let totalAmount = 0;
    totalAmount = this.addChargesForm.controls.charges['controls'][i].controls.detentionDays.value *
      this.addChargesForm.controls.charges['controls'][i].controls.detentionPerDays.value;
    this.addChargesForm.controls.charges['controls'][i].controls.totalAmount.setValue(totalAmount)
    this.addChargesForm.controls.charges['controls'][i].controls.totalAmountInr.setValue(Number((totalAmount * this.exchangeRate).toFixed(2)))
    this.totalContaineAmount();

  }
  igst(e){
   return Number((this.totalContainerAmount *  this.exchangeRate * e / 100).toFixed(2)) || 0
  }
  sgst(e){
    return Number((this.totalContainerAmount *  this.exchangeRate * (e/2) /100).toFixed(2)) || 0
  }
  totalAmt(e){
if(this.gstType === 'sgst'){
  let value = Number(((this.totalContainerAmount *  this.exchangeRate) + this.igst(e)).toFixed(2)) || 0
  this.editinvoiceForm.controls.invoice_amount.setValue(value)
  return  value
}else{
  let value = Number(((this.totalContainerAmount *  this.exchangeRate) + this.igst(e)).toFixed(2)) || 0
  this.editinvoiceForm?.controls.invoice_amount.setValue(value)
  return  value
}
  }
  totalContaineAmount() {
    let totalValue1 = 0
    this.addChargesForm.controls.charges['controls'].forEach((element, index) => {

      totalValue1 += Number(parseFloat(this.addChargesForm.controls.charges['controls'][index].controls.totalAmount.value)?.toFixed(2));
    });
    this.totalContainerAmount = Number(totalValue1 || 0)
    this.totalAmt(this.costItemList[0]?.taxRate)
    // this.editinvoiceForm.controls.invoice_amount.setValue(totalValue1)
  }
  setVendor(i) {
    this.searchText = ''
    this.editinvoiceForm.controls.bill_to.setValue(i)
    if(!this.editinvoiceForm.value.bill_to){return}
    this.billToValue = this.editinvoiceForm.value.bill_to
    let selectParty = this.partyMasterList?.filter(x => x.tax_number === this.editinvoiceForm.value.bill_to)[0]
    this.isGSTinState = selectParty?.placeofSupply?.toString().toLowerCase() === 'mh' ? true : false
    this.gstType = this.isGSTinState ? 'sgst' : 'igst'
  }
 
  addArrayValue() {
    const dataArray = [];
    this.charges?.controls.forEach(element => {
      let dacost = {
        containerNo: element.value?.containerNo,
        containerType: element.value?.containerType,
        fromDate: element.value?.fromDate,
        toDate: element.value?.toDate,
        freeDays: element.value?.freeDays,
        detentionDays: element.value?.detentionDays,
        detentionPerDays: element.value?.detentionPerDays,
        totalAmount: element.value?.totalAmount,
        totalAmountInr :  element.value?.totalAmountInr
      }
      dataArray.push(dacost)
    })

    return dataArray;
  }
  printData() {
    let reportpayload :any;
    let url :any; 
    let Invoice_data=this.invoiceIdToUpdate;
   if(Invoice_data?.invoiceTypeStatus === "Lumpsum Invoice"){
      reportpayload = { "parameters": { "invoiceID": Invoice_data?.invoiceId, "module" : this.isExport ? 'export' : 'import' } };
      url='lumpsumInvoice'
      this.commonService.pushreports(reportpayload,url).subscribe({
        next: (res: any) => {
          const blob = new Blob([res], { type: 'application/pdf' });
          let temp = URL.createObjectURL(blob);
          this.Documentpdf = temp;
          const pdfWindow = window.open(temp);
          // pdfWindow.print();
        }
      })
    }
    else if(Invoice_data?.invoiceTypeStatus === "Detention Invoice"){
      reportpayload = { "parameters": { "invoiceID": Invoice_data?.invoiceId } };
      url='detentionImport'
      this.commonService.pushreports(reportpayload,url).subscribe({
        next: (res: any) => {
          const blob = new Blob([res], { type: 'application/pdf' });
          let temp = URL.createObjectURL(blob);
          this.Documentpdf = temp;
          const pdfWindow = window.open(temp);
          // pdfWindow.print();
        }
      })
    }
    else if(Invoice_data?.invoiceTypeStatus === "Periodic Invoice"){
      reportpayload = { "parameters": { "invoiceID": Invoice_data?.invoiceId } };
      url='Periodic'
      this.commonService.pushreports(reportpayload,url).subscribe({
        next: (res: any) => {
          const blob = new Blob([res], { type: 'application/pdf' });
          let temp = URL.createObjectURL(blob);
          this.Documentpdf = temp;
          const pdfWindow = window.open(temp);
          // pdfWindow.print();
        }
      })
    }
    else{
      var divToPrint = document.getElementById("InvoiceRecords");
      var newWin = window.open("");
      newWin.document.write(divToPrint.outerHTML);
      newWin.print();
      newWin.close();
    }
  }
  setGST(e) {
    let gstNo = this.partyMasterFrom?.filter((x) => x?.partymasterId === e)[0]?.tax_number
    this.editinvoiceForm.controls.gst_number.setValue(gstNo)
  }
  setShipper() {
    let invoice = this.blData.filter((x) => x?.blId === this.editinvoiceForm.controls.bl.value)[0]
    if (invoice?.shipperId === "SHIPEASY") {
      this.showDefault = true
      this.editinvoiceForm.controls.shipper.setValue(invoice?.shipperId)
    } else {
      this.showDefault = false
      this.editinvoiceForm.controls.shipper.setValue(invoice?.shipperId)
    }
  }
  setVendor1() {
    if(!this.editinvoiceForm.value.bill_to){return}
    this.billToValue = this.editinvoiceForm.value.bill_to
    let selectParty = this.partyMasterList?.filter(x => x.tax_number === this.editinvoiceForm.value.bill_to)[0]
    this.isGSTinState = selectParty?.placeofSupply?.toString().toLowerCase() === 'mh' ? true : false
    this.gstType = this.isGSTinState ? 'sgst' : 'igst'
  }
  addCharges(){
    let batchData =  this.batchNoList[0]
    let chargeData = this.costItemList[0]
   let enquiryData = this.enquiryData
   let cont = []
   this.addChargesForm.value.charges?.forEach((x)=>{
    return cont.push(x?.containerNo)
   })
    let data = [{
      accountBaseCode: this.costItemList[0]?.accountCode?.toString(),
      agentadviceId: "",
      amount: this.totalContainerAmount || 0,
      baseAmount: "",
      batchId: batchData?.batchId,
      batchNo: batchData?.batchNo,
      cgst: this.gstType !== 'igst' ? this.sgst(chargeData?.taxRate) : 0,
      chargeTerm: "",
      collectPort: "",
      containerId: "",
      containerNumber: cont,
      containerType: "ISO Tank",
      costHeadId: "",
      costItemId: chargeData?.costitemId,
      costItemName: chargeData?.costitemName,
      currency: this.defaultCurrency,
      currencyShippingLine: '',
      exRateShippingLine: this.exchangeRate,
      exemp: false,
      gst: chargeData?.taxRate,
      gstType: this.gstType,
      igst: this.gstType === 'igst' ? this.igst( chargeData?.taxRate) : 0,
      isEnquiryCharge: true,
      isSelected: true,
      jmbAmount: this.totalContainerAmount.toString(),
      moveNumber: Number(batchData?.moveNo || 0),
      payableAt: "",
      isInvoiceCreated: true,
      quantity:  this.addChargesForm.value.charges?.length || 0,
      hsnCode : chargeData?.hsnCode || '',
      rate: this.totalContainerAmount || 0,
      remarks: "",
      sgst:  this.gstType !== 'igst' ? this.sgst( chargeData?.taxRate) : 0,
      shippingLine: "",
      stcAmount: this.totalContainerAmount.toString(),
      stcQuotationNo: batchData?.stcQuotationNo?.toString() || '',
      tax: [{taxRate: chargeData?.taxRate, taxAmount:  this.igst(chargeData?.taxRate).toString()}],
      taxAmount: this.igst(chargeData?.taxRate).toString(),
      taxRate: chargeData?.taxRate,
      taxApplicability: "",
      tenantMargin: "",
      totalAmount: (this.totalContainerAmount * this.exchangeRate).toFixed(2).toString(),
      vendorId: "",
      vendorName: "",
      }]
   return data
  }

  digitalSign(){ 
   
    let reportpayload :any;
    let url :any; 
    if(this.invoiceIdToUpdate?.invoiceTypeStatus === "Lumpsum Invoice"){
      reportpayload = { "parameters": { "invoiceID": this.invoiceIdToUpdate?.invoiceId, "module" : this.isExport ? 'export' : 'import' } };
      url='lumpsumInvoice';
   }
      else if(this.invoiceIdToUpdate?.invoiceTypeStatus === "Detention Invoice"){
        reportpayload = { "parameters": { "invoiceID": this.invoiceIdToUpdate?.invoiceId } };
        url='detentionImport';
      }
      else if(this.invoiceIdToUpdate?.invoiceTypeStatus === "Periodic Invoice"){
        reportpayload = { "parameters": { "invoiceID": this.invoiceIdToUpdate?.invoiceId } };
        url='Periodic';
      } else{
        return false;
      }

      this.commonService.pushreports(reportpayload, url).subscribe({  next: (res: any) => {
        const blob = new Blob([res], { type: 'application/pdf' });
          let formData = new FormData();
          formData.append('pdf', blob, this.invoiceIdToUpdate?.invoiceNo + `${url}.pdf` );
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
}

