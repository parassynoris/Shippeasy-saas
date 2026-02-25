import { Component, OnInit, Output, EventEmitter, Input, ViewChild, HostListener, Pipe, PipeTransform } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FinanceService } from 'src/app/services/Finance/finance.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { CommonService } from 'src/app/services/common/common.service';
import { ApiSharedService } from 'src/app/shared/components/api-service/api-shared.service';
import { AddchangesComponent } from 'src/app/shared/components/charges/addchanges/addchanges.component';
import { differenceInCalendarDays, getDaysInMonth } from 'date-fns';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { format } from 'date-fns'
import { CognitoService } from 'src/app/services/cognito.service';
import { Container } from 'src/app/models/container-master';
import { enquiryitem } from 'src/app/models/add-bill';

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
  selector: 'app-add-bill',
  templateUrl: './add-bill.component.html',
  styleUrls: ['./add-bill.component.scss']
})
export class AddBillComponent implements OnInit {
  searchText: string;
  @ViewChild("insideVendor") insideVendor;
  @ViewChild("insideVendor1") insideVendor1;
  isExport: boolean = false;
  jmbAmount: number = 0;
  defaultExRate: any = 0;
  containerList: Container[] = [];
  invoice_type: [''];
  irisResponse: any;
  baseCostItemsCopy: enquiryitem[] = [];
  tenantId: string;
  quotationDetails: any;
  enquiryDetails: any;
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
  SAModule: boolean = false;
  filterBody = this.apiService.body
  partyMasterList: any = [];
  bankList: any;
  bankDetail: any = [];
  paymentTermList: any;
  totalAmount: number = 0;
  taxAmount: number = 0;
  billAmount: number = 0;
  costItemList: any = [];
  batchNoList: any = [];
  filterBody1 = this.apiService.bodyNew;
  advancePercent = 90;
  AdvanceValue: any = 0;
  invoiceTypeTab: any = '';
  bankModel: any;
  invoiceTypeList = []
  supplyListData: any = [];
  baseCostItems: any = [];
  shipperList: any = [];
  blData: any = [];
  viewEdit: boolean;
  showTem: boolean = false;
  Documentpdf:any;
  showDefault: boolean = false;
  sort(array, key) {
    return this.sortPipe.transform(array, key);
  }

  exemp: any;
  taxApplicabilityList : any = [];
  gstInvoiceTypeList: any = [];
  gstrList: any = [];
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    public notification: NzNotificationService,
    private _FinanceService: FinanceService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private commonfunction: CommonFunctions,
    private apiService: ApiSharedService,
    private commonService: CommonService,private cognito : CognitoService,
    private sortPipe: OrderByPipe
  ) {
    this.isExport = localStorage.getItem('isExport') === 'false' ? false : true;
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
      bill_to: ['', [Validators.required]],
      sez_type: [''],
      coName: [''],
      coAddress: [''],
      tax_applied: [''],
      bill_from: ['' ],
      gst_number: [''],
      invoice_date: [new Date(), [Validators.required]],
      payment_terms: [''],
      invoice_amount: ['', [Validators.required]],
      billdue_date: [new Date()],
      printBank: [false],
      bank: [''],
      batchNo: [''],
      shipper: [''],
      consignee: [''],
      bl: ['' ],

      remark: ['', [Validators.required]],

      holdPosting: [true],
      placeOfSupply: [''],
      isBackDate: [false],
      backDate: [this.endOfMonth(new Date()).toString()],
      taxApplicability : [''],
      gst_invoice_type : [''],
      gstr : [''],
    });
    this.addnewinvoiceFrom = this.formBuilder.group({
      id: [''],
      bill_amount: ['', Validators.required],
      charge_amout: ['', Validators.required],
      charge_group: ['', Validators.required],
      charge_name: ['', Validators.required],
      currency: ['', Validators.required],
      hsn_code: ['', Validators.required],
      igst: ['', Validators.required],
      per_unit_amount: ['', Validators.required],
      sac_code: ['', Validators.required],
      tax_amount: ['', Validators.required],
      container_number: ['', Validators.required],
      charge_remark: ['', Validators.required],
      collect_port: ['', Validators.required],
      ex_rate: ['', Validators.required],
      quantity: ['', Validators.required],
      tax: ['', Validators.required],
      taxable_amount: ['', Validators.required],
      exam_flag: ['', Validators.required],
      cgst: ['', Validators.required],
      sgst: ['', Validators.required],
      total_amount: ['', Validators.required],
    });

  }
  ngOnInit(): void {
    this.cognito.userdetails$?.subscribe((resp) => {
      if (resp != null) {
        this.userData  = resp
      }
    }) 
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.tenantId = resp.tenantId
      }
    })  
    this.id = this.route.snapshot.params['moduleId'];
    this.isAddMode = !this.id;

    this.getblData()
    this.getBatchList()
    this.getBranchList()
    // this.getContainerList()
    this.getLocationDropDowns()
    this.getSystemTypeDropDowns(); 
    
 
    if (this.viewEdit) {
      this.addnewinvoiceFrom.disable()
      this.editinvoiceForm.disable()
    }
  }
  getContainerList() {
    let payload = this.commonService.filterList()
if(payload?.query)payload.query = {
  batchId: this.route.snapshot.params['id'],
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

  addnewinvoice(Addinvoice, invoiceRow) {
    this.modalReference = this.modalService.open(Addinvoice, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
      ariaLabelledBy: 'modal-basic-title'
    })

    if (invoiceRow !== 0) {


      this.addnewinvoiceFrom.patchValue({
        id: invoiceRow.id,
        bill_amount: invoiceRow.bill_amount,
        charge_amout: invoiceRow.charge_amout,
        charge_group: invoiceRow.charge_group,
        charge_name: invoiceRow.charge_name,
        currency: invoiceRow.currency,
        hsn_code: invoiceRow.hsn_code,
        igst: invoiceRow.igst,
        per_unit_amount: invoiceRow.per_unit_amount,
        sac_code: invoiceRow.sac_code,
        tax_amount: invoiceRow.tax_amount,
      });
    } else {

      this.addnewinvoiceFrom.reset();

    }

    this.modalReference.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    });

  }

  addnewsaveinvoice() {

    if (this.addnewinvoiceFrom.value.id === null) {

      let createBody = {
        id: this.allInvoicesData.length + 1,
        bill_amount: this.addnewinvoiceFrom.value.bill_amount,
        charge_amout: this.addnewinvoiceFrom.value.charge_amout,
        charge_group: this.addnewinvoiceFrom.value.charge_group,
        charge_name: this.addnewinvoiceFrom.value.charge_name,
        currency: this.addnewinvoiceFrom.value.currency,
        hsn_code: this.addnewinvoiceFrom.value.hsn_code,
        igst: this.addnewinvoiceFrom.value.igst,
        cgst: this.addnewinvoiceFrom.value.cgst,
        sgst: this.addnewinvoiceFrom.value.sgst,
        per_unit_amount: this.addnewinvoiceFrom.value.per_unit_amount,
        sac_code: this.addnewinvoiceFrom.value.sac_code,
        tax_amount: this.addnewinvoiceFrom.value.tax_amount,
        taxable_amount: this.addnewinvoiceFrom.value.taxable_amount,
        tax: this.addnewinvoiceFrom.value.tax,
        quantity: this.addnewinvoiceFrom.value.quantity,
        ex_rate: this.addnewinvoiceFrom.value.ex_rate,
        collect_port: this.addnewinvoiceFrom.value.collect_port,
        charge_remark: this.addnewinvoiceFrom.value.charge_remark,
        container_number: this.addnewinvoiceFrom.value.container_number,

      }

      this.allInvoicesData.push(createBody);

      this.modalReference.close();
      this.notification.create('success', 'Added Successfully', '');

    }
    else {

      let idToedit = this.addnewinvoiceFrom.value.id;

      let editindex = this.allInvoicesData.map(function (item) {
        return item.id
      }).indexOf(idToedit);

      this.allInvoicesData.forEach((element, index) => {
        if (editindex === index) {
          this.allInvoicesData[index] = this.addnewinvoiceFrom.value;

          this.modalReference.close();

          this.notification.create('success', 'Edited Successfully', '');


        }
      });

    }

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
    if(this.quotationDetails?.branchStateCode == this.enquiryDetails?.basicDetails?.billingStateCode){
      this.isGSTinState = true
    }else{
      this.isGSTinState = false
    }
    let shipperData = this.shipperList?.filter(x => x.partymasterId === this.editinvoiceForm.value.shipper)[0] || ''
 
     let userData =  shipperData.branch?.filter(x => x.branch_name === this.editinvoiceForm.value.bill_to)[0] || ''

 
    // if(!userData?.tax_number){
    //   this.notification.create('info', 'Party has no GST No Then we can not generate IRN', '');
    // }

    
    if (this.editinvoiceForm.valid) {
      const newInvoice = {
        
        "tenantId":  this.tenantId,
        "invoiceId": "",
        "invoice_date": this.convertDate(this.editinvoiceForm.value.invoice_date),
        "invoiceDueDate": this.convertDate(this.editinvoiceForm.value.billdue_date),
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
        "moveNo": this.batchNoList[0]?.moveNo || '',
      
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
        "stateName" : shipperData?.addressInfo.stateName || '',
        "stateCode" : shipperData?.addressInfo.stateCode || '',
        },
        "blId": this.editinvoiceForm.value.bl || '',
        "blName": this.blData?.filter(x => x.blId === this.editinvoiceForm.value.bl)[0]?.blNumber || '',
        
        "consigneeId": this.enquiryDetails?.basicDetails?.consigneeId,
        "consigneeName": this.enquiryDetails?.basicDetails?.consigneeName,
        
        "placeOfSupply": this.supplyListData?.filter(x => x.locationId === this.editinvoiceForm.value.placeOfSupply)[0]?.locationName || '',
        "placeOfSupplyId": this.editinvoiceForm.value.placeOfSupply || '',
      
        "advancePayment": Number(this.AdvanceValue),
        "advancePercentage": Number(this.advancePercent),
       
        "costItems": this.costItemList.filter(x => x.isSelected  ),
       
        "shipperId": this.editinvoiceForm.value.shipper || '',
        "shipperName": this.shipperList.filter(x => x.partymasterId === this.editinvoiceForm.value.shipper)[0]?.name,
       
        "paymentStatus": "",
        "paidAmount": 0,
        "jobNumber": "",
        "printBank": false,
        "jobId": '',
        "batchId": this.batchNoList[0]?.batchId,
        "batchNo": this.batchNoList[0]?.batchNo,
        "paymentTerms": this.editinvoiceForm.value.payment_terms || 0,
        "bankId": this.editinvoiceForm.value.bank,
        "bankName": this.bankList.filter(x => x.bankId ==  this.editinvoiceForm.value.bank)[0]?.bankName,
        "bankType": "local",
        "voyageNumber":this.quotationDetails?.voyageNumber || '',
        "vesselId": this.quotationDetails?.vesselId || '',
        "isSez": shipperData[0]?.isSez === 'true' ? 'Y' : 'N'  ,
        "vesselName": this.quotationDetails?.vesselName || '',
        "paymentMode": "CASH",
        "serviceDatefrom": this.convertDate(new Date()),
        "serviceDateTill": this.convertDate(new Date()),
        "taxNumber": "",



        "isExport": this.isExport,
        "status": true,
        "statusOfinvoice": flag,
        "holdPosting": true,
        "invoiceStatus": flag,
        "principleBill": true,
        "taxApplicability" : this.editinvoiceForm.value.taxApplicability,
        "gst_invoice_type" : this.editinvoiceForm.value.gst_invoice_type,
        "gstr" : this.editinvoiceForm.value.gstr,
        "gstType" :  this.gstType || 'igst'
      }
      if (this.invoiceIdToUpdate?.invoiceId) {
        this.commonService.UpdateToST(`invoice/${this.invoiceIdToUpdate?.invoiceId}`,{ ...newInvoice, invoiceId: this.invoiceIdToUpdate?.invoiceId, invoiceNo: this.invoiceIdToUpdate?.invoiceNo })?.subscribe(
          (res: any) => {
            if (res) {
              this.notification.create(
                'success',
                'Update Successfully',
                ''
              );
              this.updateCharge(res)
              this.submitted = false
              setTimeout(() => {
                this.modalService.dismissAll()
                this.router.navigate(['/batch/list/add/' + this.route.snapshot.params['id'] + '/principle-bill']);

              }, 1000);
            }
          },
          (error) => {
            this.notification.create('error', error?.error?.error?.message, '');
          }
        );
      } else {
        this.commonService.addToST('invoice',newInvoice)?.subscribe(
          (res: any) => {
            if (res) {
              this.notification.create(
                'success',
                'Save Successfully',
                ''
              );
              this.updateCharge(res)
              this.submitted = false
              setTimeout(() => {
                this.modalService.dismissAll()
                this.router.navigate(['/batch/list/add/' + this.route.snapshot.params['id'] + '/principle-bill']);

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



  getblData() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "batchId": this.route.snapshot.params['id'] 
    }

    this.commonService.getSTList('bl', payload)
      ?.subscribe((data: any) => {
        this.blData = data.documents;
      });
  }
  consigneeList: any = []
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

    this.commonService.getSTList("partymaster", payload)?.subscribe((data: any) => {

      let partyMasterList =  data.documents.filter((x) => x?.name.toLowerCase() === 'stolt')
       
      let dataParty = []
      partyMasterList.forEach(element => {
        if (element?.branch?.length > 0) {
          element?.branch?.map((x) => {
            dataParty.push({...element, ...x })
          })
        } else {
          dataParty.push({ ...element })
        }

      });
      this.partyMasterList = dataParty;

      // data?.documents.filter((x) => {
      //   if (x.customerType) {
      //     x.customerType.map((res: any) => {
      //       if (res?.item_text === 'Shipper') { this.shipperList.push(x) }
      //     })
      //   }
      // });
      this.shipperList = data.documents;
      data?.documents.filter((x) => {
        if (x.customerType) {
          x.customerType.map((res: any) => {
            if (res?.item_text === 'Consignee') { this.consigneeList.push(x) }
          })
        }
      });
    
      if(!this.isAddMode){
        this.calculateTotal1()
      }
    });

  }

  branchList: any = []
  getBranchList() { 
    let payload = this.commonService.filterList()
   if(payload?.query) payload.query = {
      createdByUID: this.userData?.userData?.userId,
    }
    this.commonService.getSTList('branch', payload)
      ?.subscribe((data) => {
        this.branchList = data.documents;
      });
  }

  getSystemTypeDropDowns() {

    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true,
      "typeCategory": {
        "$in": [
          "invoiceType","paymentTerms","taxApplicability","gstInvoiceType","gstr"
        ]
      }
    }

    this.commonService.getSTList("systemtype",payload)?.subscribe((res: any) => {
      this.paymentTermList = res?.documents.filter(x => x.typeCategory === "paymentTerms");
      this.taxApplicabilityList = res?.documents.filter(x => x.typeCategory === "taxApplicability");
      this.gstInvoiceTypeList = res?.documents.filter(x => x.typeCategory === "gstInvoiceType");
      this.gstrList = res?.documents.filter(x => x.typeCategory === "gstr");
    });
  }

 
  bankDetails(value) {
    this.bankDetail = []
    this.bankDetail = this.bankList?.filter(x => x.bankId === value)[0]
  }
  getInvoiceDetailsById(id) {
 
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "invoiceId": id,
    }
    this.commonService.getSTList('invoice', payload)?.subscribe((data) => {
      const invoiceData = data.documents[0]
      this.invoiceIdToUpdate = invoiceData
      this.irisResponse = invoiceData?.irisResponse
      this.advancePercent = invoiceData?.advancePercentage;
      this.AdvanceValue = invoiceData?.advancePayment;
      this.editinvoiceForm.patchValue({

        isBackDate: invoiceData?.isBackDate,
        backDate: invoiceData?.backDate,
        shipper: invoiceData?.shipperId,
        consignee: invoiceData?.consigneeId,
        invoice_no: invoiceData?.invoiceNo,
        invoice_type: invoiceData?.invoiceTypeStatus,
        bill_to: invoiceData?.billTo,
        bl: invoiceData?.blId,
        sez_type: invoiceData?.invoice_no,
        coName: invoiceData?.coName,
        coAddress: invoiceData?.coAddress,
        tax_applied: '',
        bill_from: invoiceData?.invoiceFromId,
        gst_number: invoiceData?.gstNo,
        invoice_date: new Date(invoiceData?.invoice_date.split('-').reverse()),
        payment_terms: invoiceData?.paymentTerms,
        taxApplicability : invoiceData?.taxApplicability,
        gst_invoice_type: invoiceData?.gst_invoice_type,
        gstr: invoiceData?.gstr,
        printBank: invoiceData?.printBank,
        invoice_amount: invoiceData?.invoiceAmount,
        billdue_date: new Date(invoiceData?.invoiceDueDate.split('-').reverse()),
        remark: invoiceData?.remarks,
        bank: invoiceData?.bankId,
        batchNo: invoiceData?.batchNo,
        holdPosting: invoiceData?.holdPosting, 
        
      });
      this.getCharges()
    
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

  deleteCharge(data) {
    const itemData = this.costItemList?.filter(
      (item) => item !== data
    );
    this.costItemList = itemData;
  }

 


  batchChange(e) {
  }
  getBatchList() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "batchId": this.route.snapshot.params['id']
    }
    this.commonService.getSTList('batch', payload)
      ?.subscribe((data: any) => {
        this.batchNoList = data.documents;
        this.getEnquiry(data.documents[0]);
       
        this.defaultExRate = Number(this.batchNoList[0]?.exchangeRate) || 0
        this.getPartyList()

        if (!this.route.snapshot.params['moduleId']) { 
          this.getCharges() 
        }
        else{
          this.getInvoiceDetailsById(this.route.snapshot.params['moduleId']);
        }
       
      });
  }


  gstType : string = 'igst'
  getQuotation(doc){ 
    let payload = this.commonService.filterList()  
      payload.query = {
        'quotationId':doc.quotationId
      } 
    this.commonService.getSTList('quotation', payload)
      .subscribe((res: any) => {
        this.quotationDetails = res.documents[0];   

        if(this.enquiryDetails.basicDetails.billingCountry?.toLowerCase() == 'india' || this.enquiryDetails.basicDetails.billingCountry?.toLowerCase() == 'ind' 
        || this.enquiryDetails.basicDetails.billingCountry?.toLowerCase() == '' || this.enquiryDetails.basicDetails.billingCountry?.toLowerCase() == undefined ){
        
          if(this.quotationDetails?.branchStateCode == this.enquiryDetails.basicDetails.billingStateCode){
            this.gstType = 'cgst'
            this.isGSTinState = true
          }else{
            this.gstType = 'igst'
            this.isGSTinState = false
          }
        }else{
          this.gstType = 'tax'
        }

        this.getBankList(this.quotationDetails.branchId)
        this.editinvoiceForm.patchValue({ 
          bill_from: this.quotationDetails.branchId ,  
        })
      })
  }
  getBankList(res) {
   

    let payload = this.commonService.filterList()
    payload.query = {
      branchId: res,  
    }

    this.commonService.getSTList('bank', payload)
      .subscribe((data) => {
        this.bankList = data.documents;
      });
  }
  
  getEnquiry(res) { 
    let payload = this.commonService.filterList()  
      payload.query = {
        'enquiryId': res?.enquiryId,
      }  
      this.commonService.getSTList('enquiry', payload).subscribe(
        (result) => {
          this.enquiryDetails = result?.documents[0]; 
          this.getQuotation(this.batchNoList[0]);
          this.editinvoiceForm.patchValue({ 
            shipper: this.enquiryDetails.basicDetails.shipperId,
            bill_to : this.enquiryDetails.basicDetails.billingBranch,

          })
        }); 
  }


  updateCharge(res) {
    let dataUpdate = []
    this.costItemList.filter(x => {
      if(x.isSelected){
        dataUpdate.push({ 
          ...x, 
          isPrincipleCreated: true ,
          invoiceNo : res.invoiceNo||'',
          invoiceStatus : res?.invoiceStatus,
          isInvoiceCreated: true
            // amount :( x.amount?.toString() || ''),
            // moveNumber:( x.moveNumber?.toString() || '')
          } );


      }
    })
    if (dataUpdate.length > 0) {
      this.commonService.batchUpdate('enquiryitem/batchupdate', dataUpdate)?.subscribe();
    }
  }
  getCharges() {
    this.costItemList = [];
    let payload = this.commonService.filterList()
    if(this.isExport){
      payload.query = {
        // "batchId": this.route.snapshot.params['id'],
        "quotationId" : this.batchNoList[0].quotationId,
        "$and": [
          {
            "isPrincipleCreated": {
              "$ne": true
            }
          }
        ]
      }
    }
    else{
      payload.query = {
        "agentadviceId": this.batchNoList[0]?.agentadviceId,
        "$and": [
          {
            "isPrincipleCreated": {
              "$ne": true
            }
          }
        ]
      }
    }
   
    this.commonService.getSTList('enquiryitem', payload)?.subscribe((result) => {
      if (result?.documents.length > 0) {
        this.baseCostItems = result?.documents
        this.baseCostItemsCopy = JSON.parse(JSON.stringify(result?.documents)) 
        this.baseCostItems.map((x) => {
          delete x.sort
          // x.containerNumber = x.containerNumber || [],
          //   x.quantity = x.chargeType?.toLowerCase() === 'bl charge' ? x?.quantity || 1 : x?.containerNumber?.length || 0,
          //   x.exemp = false,
            x.isSelected = false,
            // x.currency = this.batchNoList[0]?.currencyName || '',
            // x.exchangeRate = this.defaultExRate,
            // x.amount = Number(x?.amount || 0),
            x.moveNumber = Number(x?.moveNumber || 0)
        })
      }
       // might be needed for future
        if (this.invoiceIdToUpdate?.costItems?.length > 0) {
          this.checkedList = []
          // this.baseCostItems.forEach((x) => {
            this.invoiceIdToUpdate?.costItems.filter((a) => {
              this.checkedList.push(a)
              // if (x?.enquiryitemId === a?.enquiryitemId) {
              //   this.checkedList.push(a)
              //   let index = this.baseCostItems.findIndex(
              //     item => item?.enquiryitemId === a?.enquiryitemId
              //   )
              //   this.baseCostItems.splice(index, 1)
              // }
            })
          // });
          if(this.invoiceIdToUpdate?.invoiceStatus === 'Approved'){
            this.baseCostItems = [...this.checkedList]
          }
          else{
            this.baseCostItems = [...this.baseCostItems, ...this.checkedList]

          }
        
          this.baseCostItemsCopy = JSON.parse(JSON.stringify(this.baseCostItems)) 
          this.invoiceType(true)

        }
       
      
    }, error => {
      this.notification.create('error',error?.error?.error?.message, '');
    });
    this.invoiceTypeList = [
      { name: "Tax Invoice (Agency Invoice)", value: 'Tax Invoice' },
      { name: "Reimbursement Invoice", value: 'Reimbursement Invoice' },
      { name: "Journal Voucher", value: 'Journal Voucher' },
    ]
  }

  invoiceType(flag) {
    this.invoiceTypeTab = this.editinvoiceForm.value.invoice_type;
    this.costItemList = []
    if (!flag)
      this.checkedList = []
    if (this.invoiceTypeTab === 'Journal Voucher') {
      this.baseCostItems.filter((item) => {
        if (this.checkTest(item.costItemName) || item?.selEstimates?.terms === 'PREPAID INCLUDE' || item?.selEstimates?.terms === 'COLLECT INCLUDE') {
          this.costItemList.push(item)
        }
      })
      this.costItemList.map((x) => {
        if(this.checkTest(x.costItemName))
        x.tax[0].taxRate = 0
        x.gst = 0
      });
      this.calculateTotal1()
    } else if (this.invoiceTypeTab === 'Tax Invoice') {
      this.costItemList = this.baseCostItems.filter((item) => item?.selEstimates?.terms === 'PREPAID INCLUDE' || item?.selEstimates?.terms === 'COLLECT INCLUDE')
      this.calculateTotal1()
    } else if (this.invoiceTypeTab === 'Reimbursement Invoice') {
      this.baseCostItems.filter((item) => {
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
    // this.taxApplied()
  }

  taxApplied(){
    let selectParty = this.partyMasterList?.filter(x => x.tax_number === this.editinvoiceForm.value.bill_to)[0]
    let invoiceAmount = Number(this.editinvoiceForm.value.invoice_amount) || 0
    this.editinvoiceForm.controls.taxApplicability.setValue('')
    this.editinvoiceForm.controls.gst_invoice_type.setValue('')
    if(this.editinvoiceForm.value.invoice_type === "Reimbursement Invoice"){
      this.editinvoiceForm.controls.taxApplicability.setValue('N')
      this.calculateTotal()
      if(selectParty?.isRegister ){
        this.editinvoiceForm.controls.gst_invoice_type.setValue('B2B')
      }else if(!selectParty?.isRegister){
        if(invoiceAmount > 250000){
          this.editinvoiceForm.controls.gst_invoice_type.setValue('B2CL')
        }else{
          this.editinvoiceForm.controls.gst_invoice_type.setValue('B2CS')
        }
      }
    } else if(this.editinvoiceForm.value.invoice_type === "Freight Invoice"){
      // this.editinvoiceForm.controls.taxApplicability.setValue(this.costItemList[0]?.taxApplicability )
      if(selectParty?.isSez === 'true'){
        this.editinvoiceForm.controls.taxApplicability.setValue('E')
      }else{
        this.editinvoiceForm.controls.taxApplicability.setValue('T')
      }
      if(this.editinvoiceForm.value.taxApplicability === 'E'){
        this.editinvoiceForm.controls.gst_invoice_type.setValue('SEWOP')
        this.costItemList.map((x) => {
          x.tax[0].taxRate = 0
          x.gst = 0
        }) 
        this.calculateTotal()
      }else if(this.editinvoiceForm.value.taxApplicability === 'T'){
        this.editinvoiceForm.controls.gst_invoice_type.setValue('SEWP')
        this.baseCostItemsCopy?.forEach((element) => {
          this.costItemList?.map((x) => {
            if(element?.enquiryitemId === x?.enquiryitemId){
              x.tax[0].taxRate =  element?.tax[0].taxRate
              x.gst =  element?.gst
            }
          })
        });
        this.calculateTotal()
      }
    } else{
      if(selectParty?.isSez === 'true'){
        this.editinvoiceForm.controls.taxApplicability.setValue('E')
        this.costItemList.map((x) => {
          x.tax[0].taxRate = 0
          x.gst = 0
        })
        this.calculateTotal()
      }else{
        this.editinvoiceForm.controls.taxApplicability.setValue('T')
        this.baseCostItemsCopy?.forEach((element) => {
          this.costItemList?.map((x) => {
            if(element?.enquiryitemId === x?.enquiryitemId){
              x.tax[0].taxRate =  element?.tax[0].taxRate
              x.gst =  element?.gst
            }
          })
        });
        this.calculateTotal()
      }
      if(selectParty?.isRegister ){
        this.editinvoiceForm.controls.gst_invoice_type.setValue('B2B')
      }else if(!selectParty?.isRegister){
        if(invoiceAmount > 250000){
          this.editinvoiceForm.controls.gst_invoice_type.setValue('B2CL')
        }else{
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
  getLocationDropDowns() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true,
      masterType:   {
        "$in": ['YARD','CFS','ICD']
      },
    }
    this.commonService.getSTList('location', payload)?.subscribe((res: any) => {
      this.supplyListData = res?.documents;
    });
  }

  printData() {
    let reportpayload :any;
    let url :any; 
    if(this.invoiceIdToUpdate?.invoiceTypeStatus === "Tax Invoice"){
      // may be required in future
      // reportpayload = { "parameters": { "invoiceID": this.invoiceIdToUpdate?.invoiceId ,"module" : this.isExport ? 'export' : 'import'} };
      reportpayload = { "parameters": { "invoiceId": this.invoiceIdToUpdate?.invoiceId } };
      url='agencyInvoice'
      // {
      // reportpayload = { "parameters": { "invoiceID": this.invoiceIdToUpdate?.invoiceId } };
      // url='agencyInvoice';
      // }
      this.commonService.pushreports(reportpayload,url)?.subscribe({
        next: (res: any) => {
          const blob = new Blob([res], { type: 'application/pdf' });
          let temp = URL.createObjectURL(blob);
          this.Documentpdf = temp;
          const pdfWindow = window.open(temp);
          // pdfWindow.print();
        }
      })
    }
    else if(this.invoiceIdToUpdate?.invoiceTypeStatus === "Reimbursement Invoice"){
      reportpayload = { "parameters": { "invoiceID": this.invoiceIdToUpdate?.invoiceId } };
      url='reimbursementInvoice'
      this.commonService.pushreports(reportpayload,url)?.subscribe({
        next: (res: any) => {
          const blob = new Blob([res], { type: 'application/pdf' });
          let temp = URL.createObjectURL(blob);
          this.Documentpdf = temp;
          const pdfWindow = window.open(temp);
          // pdfWindow.print();
        }
      })
    }
    else if(this.invoiceIdToUpdate?.invoiceTypeStatus === "Journal Voucher"){
      reportpayload = { "parameters": { "invoiceID": this.invoiceIdToUpdate?.invoiceId } };
      url='journalVoucher'
      this.commonService.pushreports(reportpayload,url)?.subscribe({
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
    let value = this.partyMasterList?.filter(x => x.name.toLowerCase() === this.editinvoiceForm.value.bill_to)[0]?.placeofSupply?.toString()
    this.isGSTinState = value?.toLowerCase() === 'mh' ? true : false;
    // this.taxApplied()
  }
  isGSTinState: boolean = false;
  setVendor(i) {
    this.searchText = ''
    this.editinvoiceForm.controls.bill_to.setValue(i)
    let value = this.partyMasterList?.filter(x => x.tax_number === this.editinvoiceForm.value.bill_to)[0]?.placeofSupply?.toString()
    this.isGSTinState = value?.toLowerCase() === 'mh' ? true : false;
    // this.taxApplied()
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
  paymentValue(key?) {
    let e = this.editinvoiceForm.value.payment_terms
    if (!e || e !== Number(e)) { return false }
    this.editinvoiceForm.controls.billdue_date.setValue(new Date(Date.now() + e * 24 * 60 * 60 * 1000))
  }

  checkedList: any = [];
  checkCharge(evt, check, i) {
    let index = this.costItemList.findIndex(
      item => item?.enquiryitemId === check?.enquiryitemId
    )
    // this.costItemList[index].exchangeRate = ((<HTMLInputElement>document.getElementById('ex' + i)).value).toString() || ''
    if (evt.target.checked  ) {
      // let data = {
      //   ...check,
      //   exchangeRate: ((<HTMLInputElement>document.getElementById('ex' + i)).value).toString() || '',
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

  onCheckAll(evt) {
    this.checkedList = []
    // this.isSelected = !this.isSelected
    if (evt.target.checked  ) {
      this.costItemList?.forEach((element,index) => {
        element.isSelected = true
        // let data = {
        //   ...element,
        //   isExemp: ((<HTMLInputElement>document.getElementById('exemp' + index)).value) || false,
        // }
        this.checkedList.push({...element });
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
  calculateTotal1(){
    this.editinvoiceForm.controls.invoice_amount.setValue('')
    this.totalAmount = 0 
    this.taxAmount = 0
    this.billAmount = 0
    this.costItemList?.forEach((x) => {
      this.checkedList.forEach(element => {
        if (x?.enquiryitemId === element?.enquiryitemId) { 
          this.totalAmount += Number(element.selEstimates.taxableAmount || 0);
          this.taxAmount += Number(element.selEstimates.igst|| 0)  ;
          this.billAmount += Number(element.selEstimates.totalAmount || 0)
        }
      })
    })
    this.editinvoiceForm.controls.invoice_amount.setValue(this.billAmount)
  }
  calculateTotal() {
    return
    this.editinvoiceForm.controls.invoice_amount.setValue('')
    let value = this.partyMasterList?.filter(x => x.tax_number === this.editinvoiceForm.value.bill_to)[0]?.placeofSupply?.toString()
    this.isGSTinState = value?.toLowerCase() === 'mh' ? true : false
    this.baseCostItems?.map((x) => {
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

          totalAmount += Number(Number(x?.rate) * Number(x?.quantity) * Number(x?.exchangeRate))

          if (x?.exemp) { gst = 0 }

          taxAmount += totalAmount * gst / 100

          this.jmbAmount += Number(x?.jmbAmount)

          this.totalAmount += totalAmount || 0;
          this.taxAmount += Number((taxAmount).toFixed(2)) || 0;
          this.billAmount += Number((totalAmount + taxAmount).toFixed(2)) || 0
        }

      });
    })

    this.editinvoiceForm.controls.invoice_amount.setValue(this.billAmount)
  }
  exChangeClick(data, i) {
    let index = this.costItemList.findIndex(
      item => item?.enquiryitemId === data?.enquiryitemId
    )
    this.costItemList[index].exchangeRate = ((<HTMLInputElement>document.getElementById('ex' + i)).value).toString() || ''

    this.calculateTotal()
  }

  calINR(type, data, i) {
    let value = this.partyMasterList?.filter(x => x.tax_number === this.editinvoiceForm.value.bill_to)[0]?.placeofSupply?.toString()
    this.isGSTinState = value?.toLowerCase() === 'mh' ? true : false
    let ex = Number((<HTMLInputElement>document.getElementById('ex' + i))?.value || 0)
    let amt = Number(data?.rate) * Number(data?.quantity || 0)
    let gst = Number(data?.tax[0]?.taxRate) || 0


    if (type === 'inr')
      return Number(amt * ex)
    if (type === 'inrTax')
      return Number((amt * ex) * gst / 100)
    if (this.costItemList[i]?.exemp) {
      gst = 0
    }
    if (type === 'totTax'){
      let totSgst = Number(((amt * ex) * (gst/2) / 100).toFixed(2)) || 0
      let totIgst = Number(((amt * ex) * gst / 100).toFixed(2)) || 0
      this.costItemList[i].igst = totIgst || 0
      this.costItemList[i].cgst = totSgst || 0
      this.costItemList[i].sgst = totSgst || 0
      this.costItemList[i].gstType = this.gstType || 'igst'
      this.costItemList[i].tax[0].taxAmount =  Math.round((amt * ex) * gst / 100)
      // this.costItemList[i].taxAmount = Number((amt * ex) * gst / 100) || 0

      return Number((amt * ex) * gst / 100)
    }
    if (type === 'totValue') {
      this.costItemList[i].totalAmount =  Math.round((amt * ex) + ((amt * ex) * gst / 100))
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

  digitalSign(){ 
    let reportpayload :any;
    let url :any; 
    if(this.invoiceIdToUpdate?.invoiceTypeStatus === "Tax Invoice"){
      reportpayload = { "parameters": { "invoiceID": this.invoiceIdToUpdate?.invoiceId } };
      url='agencyInvoice';
   }  else if(this.invoiceIdToUpdate?.invoiceTypeStatus === "Reimbursement Invoice"){
    reportpayload = { "parameters": { "invoiceId": this.invoiceIdToUpdate?.invoiceId } };
    url='reimbursementInvoice'
  } else if(this.invoiceIdToUpdate?.invoiceTypeStatus === "Journal Voucher"){
        reportpayload = { "parameters": { "invoiceID": this.invoiceIdToUpdate?.invoiceId } };
        url='journalVoucher'
      } else{
        return false;
      }

      this.commonService.pushreports(reportpayload, url)?.subscribe({  next: (res: any) => {
        const blob = new Blob([res], { type: 'application/pdf' });
          let formData = new FormData();
          formData.append('pdf', blob, this.invoiceIdToUpdate?.invoiceNo + `${url}.pdf` );
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

}