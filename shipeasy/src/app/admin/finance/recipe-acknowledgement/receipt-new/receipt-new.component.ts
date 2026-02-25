import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/services/common/common.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { environment } from 'src/environments/environment'; 
@Component({
  selector: 'app-receipt-new',
  templateUrl: './receipt-new.component.html',
  styleUrls: ['./receipt-new.component.scss']
})
export class ReceiptNewComponent implements OnInit, OnChanges {
  @Input() paymentData: any;
  idToUpdate: any;
  isAddMode: any;
  id: any;
  NewReciept: FormGroup;
  submitted: boolean;
  optionValue = 'opentype';
  constFields = {
    receiptNo: '',
    voucherNo: '',
  }
  paymentbillData = '';
  currencyData = [];
  countryData = [];
  locationData = [];
  principalData = [];
  locationOptions = [];
  countryOptions = [];
  principalOptions = [];
  documents = [];
  urlParam;
  isShowMore: boolean = false
  jobNumberList: any = [];
  batchNoList : any= []
  collectionActive: boolean;
  jobDetails: any = [];
  constructor(public location: Location, public route: ActivatedRoute, private formBuilder: FormBuilder, public modalService: NgbModal, public router: Router, public commonService: CommonService, public notification: NzNotificationService,) {
    this.route.params?.subscribe(params =>
      this.urlParam = params
    );
  }
  backbtn() {
    this.location.back();
  }

  ngOnInit(): void {
    this.NewReciept = this.formBuilder.group(
      {
       
        jobNumber:['',[Validators.required]],
        collectionType: [true],
        amtInr: [0, Validators.required],
        amount: [0, Validators.required],
        exchange: [''],
        currency: [''],
        remittingRefNo: ['', [ Validators.pattern("^[a-zA-Z0-9]*$")]],
        location: ['', Validators.required],
        remittingBank: ['', Validators.required],
        depositBank: ['', Validators.required],
        remarks: [''],
        country: [''],
        remittanceParty: ['', Validators.required],
        PrincipalName: ['', Validators.required],
        department: ['', Validators.required],
        remittanceDate: ['', Validators.required],
        receiptEntryDate: [(new Date()).toISOString().substring(0, 10), Validators.required],
        voucherDate: ['', Validators.required],
        remittanceType: ['', Validators.required],
        receiptType: ['', Validators.required],
        voucherNo: [''],
        fircNo: [''],
        fircDate: [null],
        fircCreditDate: [null],
      },
    );
    this.collectionType()
    this.getCurrencyList();
    this.getCountryList();
    this.getLocationList();
    this.getPrincipalList();
    this.getBatchList()
  }
  getBatchList() {
    var parameter = {
      size: Number(1000),
      query: {
        bool: {
          must: [],
          filter: [],
          should: [],
          must_not: [],
        },
      },
    };
    this.commonService.getListByURL('transaction/list?type=batch', parameter)
      ?.subscribe((data: any) => {
        this.batchNoList = data.hits.hits;

      });
  }

  ngOnChanges(changes: SimpleChanges) {
 
    if (this.urlParam.rid && this.paymentData?.length > 0) {
      this.idToUpdate = this.urlParam.rid;
      let selectedPayment = this.paymentData.find(payment => payment._source.paymentId === this.idToUpdate);
      this.constFields.receiptNo = selectedPayment._source.paymentNo;
      this.NewReciept.patchValue({
        jobNumber:selectedPayment._source.jobNumber ,
        collectionType: selectedPayment._source.collectionType,
        amtInr: selectedPayment._source.amtInr,
        amount: selectedPayment._source.paymentAmount,
        exchange: selectedPayment._source.exchangeRate,
        currency: selectedPayment._source.currency,
        remittingRefNo: selectedPayment._source.remittingRefNo,
        location: selectedPayment._source.location?.value?.locationName,
        remittingBank: selectedPayment._source.bankName,
        depositBank: selectedPayment._source.bankType,
        remarks: selectedPayment._source.remarks,
        country: selectedPayment._source.country?.value?.countryName,
        remittanceParty: selectedPayment._source.paymentFromName,
        PrincipalName: selectedPayment._source.PrincipalName?.value?.principalName,
        department: selectedPayment._source.department,
        remittanceDate: selectedPayment._source.paymentDate,
        receiptEntryDate: selectedPayment._source.receiptEntryDate,
        voucherDate: selectedPayment._source.voucherDate,
        remittanceType: selectedPayment._source.paymentType,
        receiptType: selectedPayment._source.receiptType,
        voucherNo: selectedPayment._source.voucherNo,
        fircNo: selectedPayment._source.fircNo,
        fircCreditDate: selectedPayment._source.fircCreditDate,
      });
      this.documents = selectedPayment._source.documents;
      this.optionValue = this.NewReciept.value.remittanceType;
      this.getJobDetails()
    }
  }
  getCurrencyList() {
    this.commonService.currencyList()?.subscribe(currencyData => {
      this.currencyData = currencyData.hits.hits;
    })
  }
  getCountryList() {
    this.commonService.countryList()?.subscribe(countryData => {
      this.countryData = countryData.hits.hits;
    })
  }
  getLocationList() {
    this.commonService.getListByURL('master/list?type=location', this.commonService.body)?.subscribe((countryData: any) => {
      this.locationData = countryData.hits.hits;
    })
  }
  getPrincipalList() {
    let body = {
      "size": 1000,
      "sort": {
        "createdOn": "desc"
      },
      "query": {
        "bool": {
          "must": [
            {
              "match": {
                "isPrincipal": true
              }
            }
          ],
          "filter": [],
          "should": [],
          "must_not": []
        }
      }
    }
    this.commonService.getListByURL('profile/list?type=address', body)?.subscribe((principalData: any) => {
      this.principalData = principalData.hits.hits;
    })
  }
  onLocationInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.locationOptions = [];
    if (this.locationData.length > 0) {
      this.locationData.map(location => {
        if (value && (location._source.locationName || location._source?.locationName?.toLowerCase()) && location?._source?.locationName?.toLowerCase().includes(value?.toLowerCase())) {
          this.locationOptions.push({ label: location._source.locationName, value: location._source })
        }
      })
    }
  }
  onPincipalInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.principalOptions = [];
    if (this.principalData.length > 0) {
      this.principalData.map(principal => {
        if (value && (principal._source.principalName || principal._source?.principalName?.toLowerCase()) && principal?._source?.principalName?.toLowerCase().includes(value?.toLowerCase())) {
          this.principalOptions.push({ label: principal._source.principalName, value: principal._source })
        }
      })
    }
  }
  onCountryInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.countryOptions = [];
    if (this.countryData.length > 0) {
      this.countryData.map(country => {
        if (value && (country._source.countryName || country._source?.countryName?.toLowerCase()) && country?._source?.countryName?.toLowerCase().includes(value?.toLowerCase())) {
          this.countryOptions.push({ label: country._source.countryName, value: country._source })
        }
      })
    }
  }
  calcInrAmount() {
    if (this.NewReciept.value.exchange && this.NewReciept.value.amount) {
      this.NewReciept.get('amtInr').setValue(this.NewReciept.value.exchange * this.NewReciept.value.amount);
    } else {
      this.NewReciept.get('amtInr').setValue(this.NewReciept.value.amount);
    }
  }
  get f() { return this.NewReciept.controls; }
  onChange(event) {
    this.optionValue = event.target.value;
  }
  onSave(content) {
    if (this.idToUpdate) {
      this.getJobDetails()
    }
    this.submitted = true;
    if(this.NewReciept.invalid){
      return false
    }
    let selectedPayment = this.paymentData.find(payment => payment._source.paymentId === this.idToUpdate);
    let data = this.NewReciept.value;
    let payload = {
      "paymentId": this.idToUpdate,
      "tenantId": "2",
      "orgId": "1",
      "paymentDate": data.remittanceDate,
      "paymentType": data.remittanceType, 
      "remarks": data.remarks,
      "paymentNumber":'',
      "paymentNo": selectedPayment?._source?.paymentNo ? selectedPayment?._source?.paymentNo : "",
      "paymentFromName": data.remittanceParty,
      "PrincipalName": (typeof data.PrincipalName === 'string' && selectedPayment) ? selectedPayment._source.PrincipalName : (data.PrincipalName || {}),
      "paymentAmount": data.amount.toString(),
 
      "currency": data.currency,
      "exchangeRate": data.exchange.toString(),
      "documents": this.documents,
    
      "jobDetails" : this.jobDetails?._source,
      "jobNumber": this.jobDetails?._source?.jobNo ? this.jobDetails?._source?.jobNo : "",
      "jobId": this.jobDetails?._source?.jobId ? this.jobDetails?._source?.jobId : "", 

      "batchDetails" : this.jobDetails?._source,
      "batchNumber": this.jobDetails?._source?.batchNo ? this.jobDetails?._source?.batchNo : "",
      "batchId": this.jobDetails?._source?.batchId ? this.jobDetails?._source?.batchId : "", 

      "bankId": "",
      "bankName": data.remittingBank,
      "bankType": data.depositBank, 
      "status": true,
      "receiptType": data.receiptType,
      "voucherDate": data.voucherDate,
      "receiptEntryDate": data.receiptEntryDate,
      "department": data.department,
      "country": (typeof data.country === 'string' && selectedPayment) ? selectedPayment._source.country : (data.country || {}),
      "location": (typeof data.location === 'string' && selectedPayment) ? selectedPayment._source.location : (data.location || {}),
      "remittingRefNo": data.remittingRefNo,
      "amtInr": data.amtInr,
      "voucherNo": data.voucherNo,
      "fircNo": data.fircNo,
      "fircCreditDate": data.fircCreditDate,
      "collectionType": data.collectionType
    };
    let url = 'finance/payment';
    if (this.idToUpdate) {
      url = 'finance/payment/update';
    }
    this.commonService.SaveOrUpdate(url, [payload])?.subscribe((res: any) => {
      if (res) {
        this.notification.create('success', 'Saved Successfully', '');
        this.onSaves();
      }
    }, error => {
      this.notification.create(
        'error',
       error?.error?.error?.message,
        ''
      );
    })
  }

  oncancel() {
    this.router.navigate(['finance/receipt'])
  }
  showMore() {
    this.isShowMore = !this.isShowMore;
  }
  onSaves() {
    this.modalService.dismissAll();
    this.location.back();
  }
  async saveCertificate(event: any) {  
    var extension = event.target.files[0].name.substr(
      event.target.files[0].name.lastIndexOf('.')
    );
    const filename = event.target.files[0].name + extension
    const formData = new FormData();
    formData.append('file', event.target.files[0], `${event.target.files[0].name}`);
        formData.append('name', `${event.target.files[0].name}`);
    var data = await this.commonService.uploadDocuments( "vesselmaster",formData).subscribe();
    if (event.target.files[0] && data) {
      let certificateObj = {
        documentName: filename,
        documentId: event.target.files[0].name
      };
      this.documents = [certificateObj];
    }
  }

  collectionType() {
      this.collectionActive = !this.NewReciept.get('collectionType').value
  }
  getJobDetails(){
    this.jobDetails = [];
   this.jobDetails =  this.batchNoList?.filter(x => x._source?.batchNo === this.NewReciept.value.jobNumber)[0];
  }
}
