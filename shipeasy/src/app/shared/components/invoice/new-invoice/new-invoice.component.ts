import { Component, OnInit, Output, EventEmitter, Input, HostListener, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FinanceService } from 'src/app/services/Finance/finance.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { ApiSharedService } from '../../api-service/api-shared.service';
import { CommonService } from 'src/app/services/common/common.service';
import { CognitoService } from 'src/app/services/cognito.service';
import * as Constant from 'src/app/shared/common-constants';
import { BaseBody } from 'src/app/admin/smartagent/base-body';
import { differenceInCalendarDays } from 'date-fns';
import { format } from 'date-fns'
import { partymaster } from 'src/app/models/addvesselvoyage';
import { Invoice } from 'src/app/models/invoice';
import { enquiryitem } from 'src/app/models/add-bill';
import { currentTime } from 'src/app/shared/util/date-time';
@Component({
  selector: 'app-new-invoice',
  templateUrl: './new-invoice.component.html',
  styleUrls: ['./new-invoice.component.scss'],
})
export class NewInvoiceComponent implements OnInit {
  searchText: any;
  @ViewChild("insideVendor") insideVendor;
  @ViewChild("insideVendor1") insideVendor1;
  jmbAmount: number = 0;
  defaultExRate: any = 0;
  showTem: boolean = false;
  partyMasterList1: partymaster[] = [];
  partyMasterFrom: any = [];
  invoiceTypeTab: any;
  checkedList: any[] = [];
  billToValue: any = '';
  gstInvoiceTypeList: any = [];
  taxApplicabilityList: any;
  gstrList: any;
  containerTableList: any[] = [];
  costItemListSelected: Invoice[] = [];
  shipperList: any = [];
  baseCostItemsCopy: enquiryitem[] = [];
  tenantId: string;
  userData: any;
  blData: any = [];
  currentAgent: any;
  isImport: boolean;
  isTransport: boolean;
  currentUrl: string;
  userdetails: any;
  currentUser: any;
  userCountry: any;
  chargeBasic: any;
  chargeTermList: any;
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
  isAddMode: any = '';
  id: any;
  ST_Tab: boolean = true;
  isexport: boolean = false;
  isimport: boolean = false;
  invoiceIdToUpdate: any;
  modalReference: any;
  closeResult: string;
  SAModule: boolean = true;
  filterBody = this.apiService.body
  partyMasterList: any;
  invoiceTypeList: any;
  bankList: any;
  bankDetail: any = [];
  paymentTermList: any;
  customerData: any;
  batchDetails: any = [];
  totalAmount: number = 0;
  taxAmount: number = 0;
  billAmount: number = 0;
  costItemList: any = [];
  batchNoList: any = [];
  toModel: any;
  advancePercent = 90;
  AdvanceValue: any = 0;
  batchData: any = [];
  baseBody: any;
  BlList: any = [];
  containerList: any = [];
  batchNo: any;
  count: any = 0;
  sez: string;
  batchModel: any;
  submittedInvoice: boolean;
  chargeItemList: any = [];
  charge: any;
  currencyList: any;
  chargeNameList: any[];
  costitemData: any = [];
  jobNumberList: any = [];
  newCostItemList: any = [];
  isExport: boolean;
  irisResponse: any;
  paymentMode: any;
  insertedInTally:false
  Documentpdf: any;
  quotationDetails: any;
  enquiryDetails: any;
  type:string="";
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notification: NzNotificationService, private cognito: CognitoService,
    private _FinanceService: FinanceService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private commonfunction: CommonFunctions,
    private apiService: ApiSharedService,
    private commonService: CommonService,
    private _cognit: CognitoService
  ) {
    this.isExport = localStorage.getItem('isExport') === 'true' ? true : false;
    this.isImport = localStorage.getItem('isImport') === 'true' ? true : false;
    this.isTransport = localStorage.getItem('isTransport') === 'true' ? true : false;
    this.editinvoiceForm = this.formBuilder.group({
      invoice_no: [''],
      invoice_type: ['', [Validators.required]],
      invoiceFor: ['', [Validators.required]],
      shipper: [''],
      bill_to: ['', [Validators.required]],
      sez_type: [''],
      coName: [''],
      bl : ['',[Validators.required]],
      coAddress: [''],
      tax_applied: [''],
      bill_from: ['', [Validators.required]],
      gst_number: ['', [Validators.required]],
      invoice_date: [new Date(), [Validators.required]],
      payment_terms: [''],
      invoice_amount: [''],
      billdue_date: ['', [Validators.required]],
      printBank: [false], 
      batchNo: ['', [Validators.required]],
      jobNumber: [''],
      payment_mode: [''],
      bank : ['', Validators.required],
      remark: [''],
      // taxApplicability : [''],
      gst_invoice_type: [''],
      // gstr : [''],
    });
    this.invoiceTypeList = [
      { name: "Local", value: 'Local' },
      { name: "Tax", value: 'Tax' }]

      this.invoiceForTypeList = [
        { name: "Seller Invoice", value: 'sellerInvoice' },
        // { name: "Buyer Invoice", value: 'buyerInvoice' }
      ]

      this.route.url?.subscribe((url) => {
        this.currentUrl = url.toString();  // This will hold the current URL
      });
      this.type = "buyerInvoice";

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
  invoiceForTypeList:any=[]
  get f() {
    return this.editinvoiceForm.controls;
  }

  isIndian() {
    if (this.userCountry.toLowerCase() === 'india') {
      return true
    }
    else {
      return false
    }
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

  postToTally() {
  
    let payload ={
      invoiceId:this.invoiceIdToUpdate?.invoiceId,
   

    }
    this.commonService
      .getSTList1('generateTALLYEntry', payload)
      ?.subscribe((data) => {
        let updatedData  ={
          insertedInTally: true 
        }
      this.commonService.UpdateToST(`invoice/${this.invoiceIdToUpdate?.invoiceId
      }`, updatedData)?.subscribe(
          (res: any) => {
            this.invoiceIdToUpdate['insertedInTally']=true;
          },
          (error) => {
            this.notification.create('error', error?.error?.error?.message, '');
          }
        );
        
      });


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
    if(this.quotationDetails?.branchStateCode == this.enquiryDetails?.basicDetails?.billingStateCode){
      this.isGSTinState = true
    }else{
      this.isGSTinState = false
    }
    let shipperData = this.shipperList?.find(x => x.partymasterId === this.enquiryDetails?.basicDetails?.shipperId) || ''
 
     let userData =  shipperData.branch?.filter(x => x.branch_name === this.editinvoiceForm.value.bill_to)[0] || ''

 
    // if(!userData?.tax_number){
    //   this.notification.create('info', 'Party has no GST No Then we can not generate IRN', '');
    // }

    if (this.editinvoiceForm.valid) {

      const newInvoice = {
        "orgId" : this.commonfunction.getAgentDetails().orgId,
        "tenantId":  this.tenantId,
        "invoiceId": "",
        // "invoice_date": this.convertDate(this.editinvoiceForm.value.invoice_date),
        // "invoiceDueDate": this.convertDate(this.editinvoiceForm.value.billdue_date),
        "invoice_date": currentTime(this.editinvoiceForm.value.invoice_date),
        "invoiceDueDate": currentTime(this.editinvoiceForm.value.billdue_date),
        "invoiceTypeStatus": this.editinvoiceForm.value.invoice_type,
        "invoiceType": "B2B",
        "remarks": this.editinvoiceForm.value.remark,
        "invoiceNo": "",
        "invoiceToGst": userData?.tax_number?.toString()||'',
        "invoiceToId": this.editinvoiceForm.value.shipper,
        "invoiceToName": this.shipperList?.filter(x => x.partymasterId === this.editinvoiceForm.value.shipper)[0]?.name,
        "billTo":this.editinvoiceForm.value.bill_to,
        "invoiceFromId": this.editinvoiceForm.value.bill_from,
        "invoiceFromName": this.branchList.filter((x)=> x.branchId == this.editinvoiceForm.value.bill_from)[0]?.branchName,
       
        "invoiceAmount": this.billAmount?.toString() || '',
        "invoiceTaxAmount":this.taxAmount?.toString() || '',

        "coName": this.editinvoiceForm.value.coName,
        "coAddress": this.editinvoiceForm.value.coAddress,
        "moveNo": this.batchData?.moveNo || '',
      
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
        "shipperAddress":{
        "stateName" : shipperData?.addressInfo?.stateName || '',
        "stateCode" : shipperData?.addressInfo?.stateCode || '',
        },
        "blId": this.editinvoiceForm.value.bl || '',
        "blName": this.blData?.filter(x => x.blId === this.editinvoiceForm.value.bl)[0]?.blNumber || '',
        
        "consigneeId": this.enquiryDetails?.basicDetails?.consigneeId,
        "consigneeName": this.enquiryDetails?.basicDetails?.consigneeName,
        
        "placeOfSupply":   '',
        "placeOfSupplyId":   '',
        "paymentMode" : this.editinvoiceForm.value.payment_mode || '',
        "paymentModeName" : this.paymentMode?.filter((x)=> x?.systemtypeId == this.editinvoiceForm.value.payment_mode)[0]?.typeName || '',
        "advancePayment": Number(this.AdvanceValue),
        "advancePercentage": Number(this.advancePercent),
       
        "costItems": this.costItemList.filter(x => x.isSelected  ),
       
        "shipperId": this.editinvoiceForm.value.shipper || '',
        "shipperName": this.shipperList.filter(x => x.partymasterId === this.editinvoiceForm.value.shipper)[0]?.name,
       
        "paymentStatus": "Unpaid",
        "paidAmount": 0,
        "jobNumber": "",
        "printBank": false,
        "jobId": '',
        "type":this.editinvoiceForm.value.invoiceFor,
        "batchId": this.batchData?.batchId,
        "batchNo": this.batchData?.batchNo,
        "paymentTerms": this.editinvoiceForm.value.payment_terms || 0,
        "bankId": this.editinvoiceForm.value.bank,
        "bankName": this.bankList.filter(x => x.bankId ==  this.editinvoiceForm.value.bank)[0]?.bankName,
        "bankType": "local",
        "voyageNumber":this.quotationDetails?.voyageNumber || '',
        "vesselId": this.quotationDetails?.vesselId || '',
        "isSez": shipperData?.isSez === 'true' ? 'Y' : 'N',
        "vesselName": this.quotationDetails?.vesselName || '', 
        "serviceDatefrom": this.convertDate(new Date()),
        "serviceDateTill": this.convertDate(new Date()),
        "taxNumber": "",
        currency : this.batchNoList[0]?.quotationDetails?.currencyShortName,
          currencyId : this.batchNoList[0]?.quotationDetails?.currency ,

        "isExport": (this.isExport || this.isTransport),
        "status": true,
        "statusOfinvoice": flag,
        "holdPosting": true,
        "invoiceStatus": flag,
        "principleBill": false,
        "taxApplicability" : this.editinvoiceForm.value.taxApplicability,
        "gst_invoice_type" : this.editinvoiceForm.value.gst_invoice_type,
        "gstr" : this.editinvoiceForm.value.gstr,
        "gstType" : this.gstType || 'igst'
      }


      let data;
      if (this.invoiceIdToUpdate?.invoiceId) {
        if (this.isexport || this.isTransport) {
          data = [{
            ...newInvoice, invoiceId: this.invoiceIdToUpdate?.invoiceId, invoiceNo: this.invoiceIdToUpdate?.invoiceNo, allInvoicesData: this.allInvoicesData, sez_type: this.editinvoiceForm.value.sez_type,
            tax_applied: this.editinvoiceForm.value.tax_applied
          }]
        }
        else {
          data = [{ ...newInvoice, invoiceId: this.invoiceIdToUpdate?.invoiceId, invoiceNo: this.invoiceIdToUpdate?.invoiceNo }]
        }

        this.commonService.UpdateToST(`invoice/${data[0].invoiceId}`, data[0])?.subscribe(
          (res: any) => {
            if (res) {
              this.notification.create(
                'success',
                'Update Successfully',
                ''
              );
              this.submitted = false
              this.updateCharge(res)
              setTimeout(() => {
                this.CloseInvoiceSection.emit(evt);
              }, 1000);
            }
          },
          (error) => {
            this.notification.create('error', error?.error?.error?.message, '');
          }
        );
      } else {
        if (this.isexport || this.isTransport) {
          data = [{ ...newInvoice, allInvoicesData: this.allInvoicesData }];
        }
        else {
          data = [newInvoice];
        }
        this.commonService.addToST('invoice', data[0])?.subscribe(
          (res: any) => {
            if (res) {
              this.notification.create(
                'success',
                'Save Successfully',
                ''
              );
              this.submitted = false
              this.updateCharge(res)
              setTimeout(() => {
                this.CloseInvoiceSection.emit(evt);
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
  updateCharge(res) {
    let dataUpdate = []
    this.costItemList.filter(x => {
      if (x.isSelected) {
        dataUpdate.push({
          ...x,   
           invoiceNo : res?.invoiceNo||'',
          isInvoiceCreated: true , 
          invoiceStatus : res?.invoiceStatus,
          buyEstimates :{
            ...x.buyEstimates,
            invoiceNo: x.buyEstimates?.invoiceNo ? x.buyEstimates?.invoiceNo: this.editinvoiceForm.value.invoiceFor === 'buyerInvoice' ? res?.invoiceNo : null,
            invoiceId:  x.buyEstimates?.invoiceId ? x.buyEstimates?.invoiceId: this.editinvoiceForm.value.invoiceFor === 'buyerInvoice' ? res?.invoiceId : null
          },
          selEstimates: {
            ...x.selEstimates,
            invoiceNo: x.selEstimates?.invoiceNo ? x.selEstimates?.invoiceNo: this.editinvoiceForm.value.invoiceFor === 'sellerInvoice' ? res?.invoiceNo : null,
            invoiceId:  x.selEstimates?.invoiceId ? x.selEstimates?.invoiceId: this.editinvoiceForm.value.invoiceFor === 'sellerInvoice' ? res?.invoiceId : null
          }
        }
        );
      }else{
        dataUpdate.push({
          ...x,   
           invoiceNo :  '',
          isInvoiceCreated: false , 
          invoiceStatus : '',
          buyEstimates :{
            ...x.buyEstimates,
            invoiceNo: '',
            invoiceId: ''
          },
          selEstimates: {
            ...x.selEstimates,
            invoiceNo: '',
            invoiceId:  ''
          }
        }
        );
      }
    })

    if (dataUpdate.length > 0) {
      this.commonService.batchUpdate('enquiryitem/batchupdate', dataUpdate)?.subscribe();
    }
  }
  onCloseInvoice(evt) {
    this.CloseInvoiceSection.emit(evt);
  }

  ngOnInit(): void {
    this.currentAgent = this.commonfunction.getActiveAgent()
    if (this.isType === 'showInvoice') {
      this.editinvoiceForm.disable();
    }
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
    this.getBatchList()
    this.id = this.route.snapshot.params['moduleId'];
    this.isAddMode = !this.id;
    this.getPartyList()
    this.getSystemTypeDropDowns();

    this.getCurrencyList();
    this.costItem();


  }
  getPartyList() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true,

      "$and": [
        {
          "customerType.item_text": {
            "$ne": "Vendor"
          }
        }
      ]
    }


    this.commonService.getSTList('partymaster', payload)?.subscribe((data) => {
      this.partyMasterList1 = data.documents;
      this.shipperList = data.documents;
    });
  }
  branchList: any = []
  getBranchList(res) {
    let payload = this.commonService.filterList()
    payload.query = {
      orgId: res,
    }
    this.commonService.getSTList('branch', payload)
      ?.subscribe((data) => {
        this.branchList = data.documents;
        this.setGSTFrom()
      });
  }
  getSystemTypeDropDowns() {
    let payload = this.commonService.filterList()

    if(payload?.query)payload.query = {
      status: true,
      "typeCategory": {
        "$in": [
          "tankStatus", "invoiceType", "paymentTerms", "paymentMode", 'taxApplicability', "gstInvoiceType", "gstr","chargeTerm","chargeType"
        ]
      }
    }

    this.commonService.getSTList("systemtype", payload)?.subscribe((res: any) => {
      this.paymentTermList = res?.documents?.filter(x => x.typeCategory === "paymentTerms");
      this.paymentMode = res?.documents?.filter(x => x.typeCategory === "paymentMode");
      this.taxApplicabilityList = res?.documents?.filter(x => x.typeCategory === "taxApplicability");
      this.gstInvoiceTypeList = res?.documents?.filter(x => x.typeCategory === "gstInvoiceType");
      this.gstrList = res?.documents?.filter(x => x.typeCategory === "gstr");
      this.chargeTermList = res?.documents?.filter(x => x.typeCategory === "chargeTerm");
      this.chargeBasic = res?.documents?.filter(x => x.typeCategory === "chargeType");
      
    });
  }
  setPartyDropdown() {
    //changed done as batch-invoice shows branch names instead of party master name
    let partyMasterList = this.partyMasterList1?.filter((x) => x?.partymasterId === this.batchData?.enquiryDeatails?.basicDetails?.shipperId)
    let dataParty = []
    partyMasterList?.forEach(element => {
      if (element?.branch?.length > 0) {
        element?.branch?.map((x) => {
          dataParty.push({ ...element, ...x })
        })
      }
    });
    this.partyMasterList = dataParty;

    let shipper = this.partyMasterList1?.filter((x) => x?.partymasterId === this.batchData?.shipperId)
    let shipperData = []
    shipper.forEach(element => {
      if (element?.branch?.length > 0) {
        element?.branch?.map((x) => {
          shipperData.push({ ...element, ...x })
        })
      } else {
        shipperData.push({ ...element })
      }

    });
    // this.shipperList = shipperData[0];


  }
  gstType: string = 'igst'
  selectData(e) {
    // if (batch) {
    this.batchData = this.batchNoList.find(x => x?.batchId === e)
    this.getContainerData();
    // this.getCharges(this.batchNoList?.filter(x => x.batchNo === e)[0]?.batchId)
    // this.getEnquiry(e) 
    this.enquiryDetails = this.batchData?.enquiryDetails;
    this.quotationDetails = this.batchData?.quotationDetails;
    // this.getQuotation(this.batchNoList[0]);
  
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
    this.getBranchList(this.batchData?.orgId)
    this.getCharges(this.quotationDetails?.quotationId)
    this.getBankList(this.quotationDetails?.branchId)
    this.getblData(e)


    this.setPartyDropdown() 
    let shipperData = this.shipperList?.find(x => x.partymasterId === this.enquiryDetails?.basicDetails?.shipperId) || '' 
    this.sez = shipperData?.isSez ? "taxable" : "nontaxable" 
    this.customerData = shipperData.branch?.filter(x => x.branch_name === this.enquiryDetails?.basicDetails?.billingBranch)[0] || ''


    this.setGSTFrom()


    if(true){
      this.editinvoiceForm.patchValue({
        shipper: this.enquiryDetails?.basicDetails?.shipperId,
        bill_to: this.enquiryDetails?.basicDetails?.billingBranch,
      })
      this.editinvoiceForm.patchValue({
        bill_from: this.quotationDetails?.branchId,
      })
      this.editinvoiceForm.patchValue({
        tax_applied: shipperData?.TDS_GST_APPLICABLE ? "yes" : "no",
        sez_type: shipperData?.isSez ? "taxable" : "nontaxable",
      })
    }

    // }
    // else {

    //   this.billToValue = this.editinvoiceForm.value.bill_to
    //   this.customerData = this.partyMasterList.find(x => x?.tax_number === e)
    // this.calculateTotal()
    //   this.editinvoiceForm.patchValue({
    //     tax_applied: this.customerData?.TDS_GST_APPLICABLE ? "yes" : "no",
    //     sez_type: this.customerData?.isSez ? "taxable" : "nontaxable",
    //   })
    //   this.sez = this.customerData?.isSez ? "taxable" : "nontaxable"
    // }
  }
  getblData(res) {
    let payload = this.commonService.filterList()
    payload.query = {
      batchId: res,
    }

    this.commonService.getSTList('bl', payload)?.subscribe((data: any) => {
        this.blData = data.documents;
      });
  }

  getBankList(res) {

    let payload = this.commonService.filterList()
    payload.query = {
      branchId: res,
    }
    this.commonService.getSTList('bank', payload)?.subscribe((data) => {
      this.bankList = data.documents;
    });
  }
  bankDetails(value) {
    this.bankDetail = []
    this.bankDetail = this.bankList?.filter(x => x.bankId === value)[0]
  }
  getInvoiceDetailsById(id) {
    let payload = this.commonService.filterList()
    payload.query = {
      "invoiceId": id,
    }
    this.commonService.getSTList('invoice', payload)?.subscribe((data) => {
      const invoiceData = data.documents[0]
    
      this.invoiceIdToUpdate = invoiceData
      this.irisResponse = invoiceData?.irisResponse
      this.advancePercent = invoiceData?.advancePercentage;
      this.AdvanceValue = invoiceData?.advancePayment;
      this.costItemListSelected = invoiceData?.costItems || []
      // this.selectData(invoiceData?.invoiceToGst)

      this.editinvoiceForm.patchValue({
        jobNumber: invoiceData?.jobNumber || '',
        invoice_no: invoiceData?.invoiceNo,
        invoiceFor : invoiceData?.type,
        invoice_type: invoiceData?.invoiceTypeStatus,
        bill_to: invoiceData?.billTo,
        coName: invoiceData?.coName,
        bl : invoiceData?.blId,
        coAddress: invoiceData?.coAddress,
        bill_from: invoiceData?.invoiceFromId,
        gst_number: invoiceData?.gstNo,
        invoice_amount: invoiceData?.invoiceAmount,
        invoice_date: invoiceData?.invoice_date,
        payment_terms: invoiceData?.paymentTerms,
        printBank: invoiceData?.printBank,
        billdue_date: invoiceData?.invoiceDueDate,
        remark: invoiceData?.remarks,
        bank: invoiceData?.bankId,
        batchNo: invoiceData?.batchId,
        payment_mode: invoiceData?.paymentMode,

        // taxApplicability : invoiceData?.taxApplicability,
        gst_invoice_type: invoiceData?.gst_invoice_type,
        // gstr: invoiceData?.gstr,
      });

      if (this.isexport || this.isTransport) {
        this.editinvoiceForm.patchValue({
          sez_type: invoiceData?.sez_type,
          tax_applied: invoiceData?.tax_applied,
        });
      }
      if (invoiceData?.allInvoicesData) {
        this.allInvoicesData = invoiceData?.allInvoicesData
      }
      this.billAmount = invoiceData?.invoiceAmount;
      this.taxAmount = invoiceData?.invoiceTaxAmount;
      this.selectData(invoiceData?.batchId)
    })
  }
  convertDate1(e) {
    if (!e)
      return
    var date = new Date(e)
    if (date.toString() === 'Invalid Date') {
      return new Date(e.split('-').reverse())
    } else {
      return date
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


  calculateTotal() {
    return
    this.editinvoiceForm.controls.invoice_amount.setValue('')
    let value = this.partyMasterList?.filter(x => x.tax_number === this.editinvoiceForm.value.bill_to)[0]?.placeofSupply?.toString()
    this.isGSTinState = value?.toLowerCase() === 'mh' ? true : false
    this.chargeItemList?.map((x) => {
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
    this.calcuTotal(this.advancePercent);
  }
  setIgst() {
    return 1000
  }
  calcuTotal(e) {
    this.AdvanceValue = ((this.billAmount * e) / 100).toFixed(2)
  }
  isGSTinState: boolean = false;
  setVendor(i) {
    this.searchText = ''
    this.editinvoiceForm.controls.bill_to.setValue(i)
    this.billToValue = this.editinvoiceForm.value.bill_to
    let selectParty = this.partyMasterList?.filter(x => x.tax_number === this.editinvoiceForm.value.bill_to)[0]
    this.isGSTinState = selectParty?.placeofSupply?.toString().toLowerCase() === 'mh' ? true : false
    // this.taxApplied()
  }
  getBatchList() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      isExport: (this.isExport || this.isTransport),
      // status: true
    }

    this.commonService.getSTList('batch', payload)
      ?.subscribe((data: any) => {
        this.batchNoList = data.documents;
        if (this.route.snapshot.params['moduleId']) {
          this.getInvoiceDetailsById(this.route.snapshot.params['moduleId']);
        }
      });
  }

 
  getCharges(res) {
    this.costItemList = [];

    let payload = this.commonService.filterList()
    if(this.isExport || this.isTransport){

      if(this.editinvoiceForm.value.invoiceFor === 'buyerInvoice'){
        payload.query = {
          "quotationId": this.batchData?.quotationId,
          "$and": [
            {
              "buyEstimates?.buyerInvoice": {
                "$ne": true
              }
            }
          ]
        }
      }
      else{
        payload.query = {
          "quotationId": this.batchData?.quotationId,
          "$and": [
            {
              "selEstimates?.sellerInvoice": {
                "$ne": true
              }
            }
          ]
        }
      }
     
    }
    else{
      if(this.editinvoiceForm.value.invoiceFor === 'buyerInvoice'){
        payload.query = {
          "agentadviceId": this.batchData?.agentadviceId,
          "$and": [
            {
              "buyEstimates?.buyerInvoice": {
                "$ne": true
              }
            }
          ]
        }
      }
      else{
        payload.query = {
          "agentadviceId": this.batchData?.agentadviceId,
          "$and": [
            {
              "selEstimates?.sellerInvoice": {
                "$ne": true
              }
            }
          ]
        }
      }
    

    }
  
    this.commonService.getSTList('enquiryitem', payload)?.subscribe((result) => {
      this.chargeItemList = result?.documents || []
    
 
      this.baseCostItemsCopy = JSON.parse(JSON.stringify(result?.documents))
      let batchDate = this.batchNoList?.filter(x => x.batchNo === this.editinvoiceForm.value.batchNo)[0]

      this.chargeItemList?.map((x) => {
        delete x.sort
        x.containerNumber = x.containerNumber || [],
          // x.quantity = x.chargeType?.toLowerCase() === 'bl charge' ? x?.quantity || 1 : x?.containerNumber?.length || 0,
          // x.exemp = false,
          // x.rate = x?.rate || 0,
          x.isSelected = false,
          x.buyEstimates['buyerInvoice'] = x.buyEstimates?.buyerInvoice? x.buyEstimates?.buyerInvoice: this.editinvoiceForm.value.invoiceFor === 'buyerInvoice'? true : false
          x.selEstimates['sellerInvoice'] = x.selEstimates?.sellerInvoice? x.selEstimates?.sellerInvoice: this.editinvoiceForm.value.invoiceFor === 'sellerInvoice'? true : false
        // x.currencyShippingLine = batchDate?.routeDetails?.currencyName || '',
        // x.exRateShippingLine =  Number(batchDate?.routeDetails?.exchangeRate) || 0,
        // x.igst = 0,
        // x.cgst = 0,
        // x.sgst = 0,
        // x.taxAmount = Number(x?.taxAmount || 0),
        // x.amount = Number(x?.amount || 0),
        // x.moveNumber = Number(x?.moveNumber || 0)
      })
      if (this.invoiceIdToUpdate?.costItems?.length > 0) {
        this.checkedList = []
          this.invoiceIdToUpdate?.costItems.filter((a:any) => {
            this.checkedList.push(
              {...a,
                isSelected : true,
              })
          })

          if(this.invoiceIdToUpdate?.invoiceStatus === 'Approved'){
            this.chargeItemList = [...this.checkedList]
          }
          else{
            this.chargeItemList = [...this.chargeItemList, ...this.checkedList]

          }
          
        this.baseCostItemsCopy = JSON.parse(JSON.stringify(this.chargeItemList)) 
        this.invoiceType(true)

      }

      this.invoiceType(false)
    }, error => {
      this.notification.create(
        'error',
       error?.error?.error?.message,
        ''
      );
    });
  }
 

  invoiceType(flag) {

    this.invoiceTypeTab = this.editinvoiceForm.value.invoice_type;
    this.costItemList = []
    if (this.invoiceTypeTab === 'Ground Rent Invoice') {
      this.costItemList = this.chargeItemList?.filter((item) => item.costitemGroup === 'STORAGE' || item.costHeadName === 'Ground Rent')
      this.calculateTotal1()
    } else if (this.invoiceTypeTab === 'Freight Invoice') {
      this.costItemList = this.chargeItemList?.filter((item) => item.isFreight)
      this.costItemList.map((x) => {
        // x.quantity = 1
      })
      this.calculateTotal1()
    } else if (this.invoiceTypeTab === 'Local') {
      this.chargeItemList?.filter((item) => {
        if(this.editinvoiceForm.value.invoiceFor === 'buyerInvoice'){
          
          if (item.gst === 0) {
            this.costItemList.push(item)
          }
        }
        else{
          if (item.gst === 0) {
            this.costItemList.push(item)
          }
        }
      })
      this.calculateTotal1()
    } 
    else if (this.invoiceTypeTab === 'Tax') {
      this.chargeItemList.filter((item) => {
        // as of now we need to put like this we will decide the logic after
        if(this.editinvoiceForm.value.invoiceFor === 'buyerInvoice'){
          if (item.gst !== 0) {
            this.costItemList.push(item)
          }
        }
        else{
          if (item.gst !== 0) {
            this.costItemList.push(item)
          }
        }
      
      })
        this.calculateTotal1()
    } 
    else if (this.invoiceTypeTab === 'Reimbursement Invoice') {
      this.chargeItemList?.filter((item) => {
        if (this.checkTest(item.costItemName)) {
          this.costItemList.push(item)
        }
      })
      this.costItemList.map((x) => {
        x.tax[0].taxRate = 0
        x.gst = 0
      })
      this.calculateTotal1()
    }
    else {
      this.costItemList = this.chargeItemList;
      this.calculateTotal1()
    }
    // this.taxApplied()
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
      this.editinvoiceForm.controls.taxApplicability.setValue(this.costItemList[0]?.taxApplicability)
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
              x.tax[0].taxRate = element?.tax[0].taxRate
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
        if (x?.enquiryitemId === element?.enquiryitemId) {
          this.totalAmount += Number(element.selEstimates?.taxableAmount || 0);
          this.taxAmount += Number(element.selEstimates?.igst || 0);
          if(this.editinvoiceForm.value.invoiceFor === 'sellerInvoice'){
            this.billAmount += Number(element.selEstimates?.totalAmount || 0)

          }
          else{
            this.billAmount += Number(element.buyEstimates?.totalAmount || 0)
          }
        }
      })
    })
    this.editinvoiceForm.controls.invoice_amount.setValue(this.billAmount)
  }
  calINR(type, data, i) {
    let value = this.partyMasterList?.filter(x => x.tax_number === this.editinvoiceForm.value.bill_to)[0]?.placeofSupply?.toString()
    this.isGSTinState = value?.toLowerCase() === 'mh' ? true : false
    let ex = data?.exRateShippingLine
    let amt = Number(data?.rate) * Number(data?.quantity || 0)
    let gst = Number(data?.tax[0].taxRate || 0)


    if (type === 'inr')
      return Number(amt * ex)
    if (type === 'inrTax') {
      return Number((amt * ex) * gst / 100)
    }

    if (this.costItemList[i]?.exemp) {
      gst = 0
    }
    if (type === 'totTax') {
      let totSgst = Number(((amt * ex) * (gst / 2) / 100).toFixed(2)) || 0
      let totIgst = Number(((amt * ex) * gst / 100).toFixed(2)) || 0
      this.costItemList[i].igst = totIgst || 0
      this.costItemList[i].cgst = totSgst || 0
      this.costItemList[i].sgst = totSgst || 0
      this.costItemList[i].gstType = this.isGSTinState ? 'sgst' : 'igst'
      this.costItemList[i].tax[0].taxAmount = Math.round((amt * ex) * gst / 100)
      this.costItemList[i].taxAmount = Number((amt * ex) * gst / 100) || 0
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
  setGST(e?) {
    let gstNo = this.shipperList?.tax_number
    // this.editinvoiceForm.controls.gst_number.setValue(gstNo)
  }
  setGSTFrom() {
    let gstNo = this.branchList?.filter((x) => x?.branchId === this.editinvoiceForm.value.bill_from)[0]?.taxId
    this.editinvoiceForm.controls.gst_number.setValue(gstNo)
  }
  checkTest(e) {
    if (new RegExp("\\b" + "reimbursement" + "\\b").test(e?.toLowerCase()) ||
      new RegExp("\\b" + "reimbursable" + "\\b").test(e?.toLowerCase())) {
      return true;
    } else {
      return false;
    }
  }

  getContainerData() {
    let payload = this.commonService.filterList()
    payload.query = {
      batchId: this.batchData?.batchId,
    }
    this.commonService.getSTList('container', payload)?.subscribe((data: any) => {
      let dataContainer = [];
      data.documents.forEach((element) => {
        if (element?.containerNumber) {
          dataContainer.push(element?.containerNumber);
        }
      });
      this.containerTableList = dataContainer;
    });
    // this.commonService.getSTList(Constant.BL_LIST, payload)?.subscribe((res: any) => {
    //   this.BlList = res?.documents;

    //   this.containerList = [];
    //   this.count = 0;
    //   this.BlList.map(x => {
    //     if (
    //       x?.containers?.length !== 0) {
    //       x?.containers?.filter(x => { this.containerList.push(x); this.count++ });
    //     }
    //   })
    // });

  }

  changeBL(e){
       this.containerList = [];
      this.count = 0;
      this.blData.map(x => {
        if(x?.blId == e){
          this.BlList = x
          if (
            x?.containers?.length !== 0) {
            x?.containers?.filter(x => { this.containerList.push(x); this.count++ });
          }
        } 
      })
  }

  getCurrencyList() {
    let payload = this.commonService.filterList()
    payload.query = {
      "status": true
    }
    this.commonService.getSTList('currency', payload)?.subscribe((data) => {
      this.currencyList = data.documents;
    })
  }

  disabledEtaDate = (current: Date): boolean => {
    return differenceInCalendarDays(current, new Date()) < 0;
  };

  paymentValue(key?) {
    let e = this.editinvoiceForm.value.payment_terms
    if (!e || e !== Number(e)) { return false }
    this.editinvoiceForm.controls.billdue_date.setValue(new Date(Date.now() + e * 24 * 60 * 60 * 1000))
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

  digitalSign() {
    let reportpayload: any;
    let url: any;
    if (this.invoiceIdToUpdate?.invoiceTypeStatus === "Lumpsum Invoice") {
      reportpayload = { "parameters": { "invoiceID": this.invoiceIdToUpdate?.invoiceId } };
      url = 'Lumpsum';
    }
    else if (this.invoiceIdToUpdate?.invoiceTypeStatus === "Detention Invoice") {
      reportpayload = { "parameters": { "invoiceID": this.invoiceIdToUpdate?.invoiceId } };
      url = 'detentionImport';
    }
    else if (this.invoiceIdToUpdate?.invoiceTypeStatus === "Periodic Invoice") {
      reportpayload = { "parameters": { "invoiceID": this.invoiceIdToUpdate?.invoiceId } };
      url = 'Periodic';
    } else if (this.invoiceIdToUpdate?.invoiceTypeStatus === "Freight Invoice") {
      reportpayload = { "parameters": { "invoiceID": this.invoiceIdToUpdate?.invoiceId, "module": (this.isExport || this.isTransport) ? 'export' : 'import' } };
      url = 'freightInvoice';
    } else if (this.invoiceIdToUpdate?.invoiceTypeStatus === "Local") {
      reportpayload = { "parameters": { "invoiceID": this.invoiceIdToUpdate?.invoiceId, "module": (this.isExport || this.isTransport) ? 'export' : 'import' } };
      url = 'localInvoice';
    } else if (this.invoiceIdToUpdate?.invoiceTypeStatus === "Reimbursement Invoice") {
      reportpayload = { "parameters": { "invoiceID": this.invoiceIdToUpdate?.invoiceId } };
      url = 'Reimbursement';
    } else {
      return false;
    }

    this.commonService.pushreports(reportpayload, url)?.subscribe({
      next: (res: any) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        let formData = new FormData();
        formData.append('pdf', blob, this.invoiceIdToUpdate?.invoiceNo + `${url}.pdf`);
        this.commonService.signPdf(formData)?.subscribe((res2: any) => {
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

  getChargeControls() {
    return (this.editinvoiceForm.get('charge') as FormArray).controls;
  }
  getChargeControlsLength(): number {
    return (this.editinvoiceForm.get('charge') as FormArray).length;
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


      buyisInvoiceCreated : [item ? item.buyEstimates?.isInvoiceCreated : false],
      sellisInvoiceCreated : [item ? item.selEstimates?.isInvoiceCreated : false],
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
  enquiryRateList: any = [];
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
    console.log(i,'sssssssssssss')
    if(i >= 0){
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

}
