import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
} from '@angular/forms';

import { CommonService } from 'src/app/services/common/common.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
@Component({
  selector: 'app-dashboard-filter-modal',
  templateUrl: './dashboard-filter-modal.component.html',
  styleUrls: ['./dashboard-filter-modal.component.scss'],
})
export class DashboardFilterModalComponent implements OnInit {
  @Input() type;
  @Input() quotationSelectedData;
  @Input() bookingSelectedData;
  @Input() freightTypeSelectedData;
  @Input() invoiceSelectedData;
  @Input() enquirySelectedData
  @Output() filterbody = new EventEmitter<any>();
  @Output() onCloseSection = new EventEmitter<any>();
  @Output() onCloseData = new EventEmitter<any>();
  @Output() onClearFilter = new EventEmitter<any>();
  @Input() user;
  @Input() quotationTag;
  @Input() InvoiceTag;
  @Input() freightTypeTag=[];
  @Input() bookingTag;
  @Input() enquiryTag 
  checked: boolean = false;
  config = {};


  date = new Date();
  selectall: boolean = false;
  orgList: any = [];
  // filterform : FormGroup;
  filterform = new FormGroup({
    // 'isActive' :new FormControl(true),
    booking: new FormGroup({
      'BookingConfirmed' :new FormControl(false),
      'JobCancelled' :new FormControl(false),
      'JobCreated' :new FormControl(false),
      'JobClosed' :new FormControl(false),
    
    }),
    quotation: this.fb.group({
      'AwaitingReview': new FormControl(false),
      'Accepted': new FormControl(false),
      'InquiryReceived': new FormControl(false),
      'InquirySubmitted': new FormControl(false),
      'InquiryCreated': new FormControl(false),
      'InquiryAccepted': new FormControl(false),
      'Requotesubmitted': new FormControl(false),
      'JobCreated': new FormControl(false),
      'Rejected': new FormControl(false),
      'Requoted': new FormControl(false),
      'Requested': new FormControl(false),
      // 'Air': new FormControl(false),
      // 'Ocean': new FormControl(false),
      // 'Land': new FormControl(false),
    }),
    freightType: new FormGroup({
      'Air': new FormControl(false),
      'Ocean': new FormControl(false),
      'Land': new FormControl(false),
    }),
    invoice: new FormGroup({
      'Overdue': new FormControl(false),
      'Unpaid': new FormControl(false),
      'Paid': new FormControl(false),
      'PartiallyPaid': new FormControl(false),
      'Pending': new FormControl(false),
    }),
    fromdate: new FormControl(
      new Date(this.date.getTime() - 30 * 24 * 60 * 60 * 1000)
    ),
    todate: new FormControl(new Date()),
    fromlocation: new FormControl(''),
    tolocation: new FormControl(''),
    companyName: new FormControl('')
  });

  locationlist: any = [];
  allmilestonelist: any;
  milestonelist: any;
  quotationData: any
  bookingData: any
  invoiceData: any
  quickviewData: any
  isLastPath: any
  quotationlist: any = []
  constructor(
    private fb: FormBuilder,
    public _cognito: CognitoService,
    public api: CommonService,
    public _route: Router,
    private location: Location,

  ) {
 
    // this.api.getOrgData(500,'','','').subscribe((res:any)=>{
    //   this.orgList = res.items
    // })
    console.log(this.quotationTag);
    

  }
  locationData: any = []
  onLocationSearch(e) {
    let payload = this.api.filterList()

    if (payload) payload.query = {
      status: true,
      "portDetails.portName": {
        "$regex": e,
        "$options": "i"
      }
    }

    this.api.getSTList("port", payload)?.subscribe((res: any) => {
      this.locationData = res?.documents?.map(x => ({
        portId: x.portId,
        portName: x.portDetails.portName
      }));
    });
  }
  ngOnChanges(changes: SimpleChanges) {
    if(changes.freightTypeTag)
      console.log(this.freightTypeTag)
    if (this.type === 'quotation') {
      let data = localStorage.getItem('quotation-data')
      let body = JSON.parse(data)
      if (body) {
        this.filterform.setValue(body)
      }
    }
    if (this.type === 'booking') {
      let data = localStorage.getItem('booking-data')
      let body = JSON.parse(data)
      if (body) {
        this.filterform.setValue(body)
      }
    }
    if (this.type === 'invoice') {
      let data = localStorage.getItem('invoice-data')
      let body = JSON.parse(data)
      if (body) {
        this.filterform.setValue(body)
      }
    }
    if (this.type === 'freightType') {
      let data = localStorage.getItem('freightType-data')
      let body = JSON.parse(data)
      if (body) {
        this.filterform.setValue(body)
      }
    }
    if (changes.quotationSelectedData) {
      if (this.quotationSelectedData != null) {
        this.filterform.get('quotation').setValue(this.quotationSelectedData)
        // this.carbonprice = this.carbonprice * Math.ceil(this.quotationrawData.carbonEmission)

      }
    }

    if (changes.freightTypeSelectedData) {
      if (this.freightTypeSelectedData != null) {
        this.filterform.get('quotation').setValue(this.freightTypeSelectedData)
        // this.carbonprice = this.carbonprice * Math.ceil(this.quotationrawData.carbonEmission)

      }
    }

    if (changes.bookingSelectedData) {
      if (this.bookingSelectedData != null) {
        this.filterform.get('booking').setValue(this.bookingSelectedData)
        // this.carbonprice = this.carbonprice * Math.ceil(this.quotationrawData.carbonEmission)

      }
    }
    if (changes.invoiceSelectedData) {
      if (this.invoiceSelectedData != null) {
        this.filterform.get('invoice').setValue(this.invoiceSelectedData)
        // this.carbonprice = this.carbonprice * Math.ceil(this.quotationrawData.carbonEmission)

      }
    }
  }
  submitfilter() {
    if (this.type === 'quotation') {
      let quotation = this.filterform.get('quotation').value; 
      const milestones = Object.keys(quotation)
      .filter(key => quotation[key] === true)
      .map(key => {
        const tagObject = this.quotationTag?.find(x => x.tag === key);
        return tagObject ? tagObject.milestone : undefined;
      })
      .filter(milestone => milestone !== undefined); 

 
      let list = ['quotes'];
      const body = {
        indices: list,
        freightType:this.filterform.controls['freightType'].value,
        quoteStatuses: milestones,
        fromDate: this.filterform.controls['fromdate'].value,
        toDate: this.filterform.controls['todate'].value,
        fromLocation: this.filterform.controls['fromlocation'].value || '',
        toLocation: this.filterform.controls['tolocation'].value || '',
        // size:500,
        // orgId:this.filterform.controls['companyName'].value?.orgId?.toString()

      };
      this.filterbody.emit(body);
      localStorage.removeItem('quotation-data')
      let data = JSON.stringify(this.filterform.value)
      localStorage.setItem('quotation-data', data)
    } else if (this.type === 'booking') {
      let booking = this.filterform.get('booking').value;

      const milestones = Object.keys(booking)
      .filter(key => booking[key] === true)
      .map(key => {
        const tagObject = this.bookingTag?.find(x => x.tag === key);
        return tagObject ? tagObject.milestone : undefined;
      })
      .filter(milestone => milestone !== undefined);  

      let list = ['bookings'];
      const body = {
        // status :  this.filterform.controls['isActive'].value ,
        indices: list,
        freightType : this.filterform.controls['freightType'].value,
        bookingStatuses: milestones,
        fromDate: this.filterform.controls['fromdate'].value,
        toDate: this.filterform.controls['todate'].value,
        fromLocation: this.filterform.controls['fromlocation'].value || '',
        toLocation: this.filterform.controls['tolocation'].value || '',
        // size:500,
        // orgId:this.filterform.controls['companyName'].value?.orgId?.toString()

      };
      this.filterbody.emit(body);
      localStorage.removeItem('booking-data')
      let data = JSON.stringify(this.filterform.value)
      localStorage.setItem('booking-data', data)
    } else if (this.type === 'invoice') {
      let invoice = this.filterform.get('invoice').value;
      const milestones = Object.keys(invoice)
      .filter(key => invoice[key] === true)
      .map(key => {
        const tagObject = this.InvoiceTag?.find(x => x.tag === key);
        return tagObject ? tagObject.milestone : undefined;
      })
      .filter(milestone => milestone !== undefined); 
      let list = ['invoices'];
      const body = {
        indices: list,
        invoiceStatuses: milestones,
        fromDate: this.filterform.controls['fromdate'].value,
        toDate: this.filterform.controls['todate'].value,
        fromLocation: this.filterform.controls['fromlocation'].value || '',
        toLocation: this.filterform.controls['tolocation'].value || '',
        // size:500,
        // orgId:this.filterform.controls['companyName'].value?.orgId?.toString()

      };
      this.filterbody.emit(body);
      localStorage.removeItem('invoice-data')
      let data = JSON.stringify(this.filterform.value)
      localStorage.setItem('invoice-data', data)
    }

    this.onClose()
  }
  onClose() {

    this.onCloseSection.emit();
    // if(this.type == 'quotation' ){
    //   this.quotationData = this.filterform.get('quotation').value
    //   this.onCloseData.emit(this.quotationData)
    // }
    // else if(this.type == 'booking'){
    //   this.bookingData = this.filterform.get('booking').value
    //   this.onCloseData.emit(this.bookingData)
    // }
    // else if(this.type == 'invoice'){
    //   this.invoiceData = this.filterform.get('invoice').value

    //   this.onCloseData.emit(this.invoiceData)
    // } 
    // this.filterform.get('quotation').setValue(this.quotationData)
  }

  selectAll() {
    this.selectall = true;
    this.checked = true;
    if (this.type === 'quotation') {
      this.filterform.controls['quotation'].get('Accepted').setValue(true);
      this.filterform.controls['quotation'].get('Draft').setValue(true);
      this.filterform.controls['quotation']
        .get('Awaiting Review')
        .setValue(true);
      this.filterform.controls['quotation'].get('Await Pricing').setValue(true);
      this.filterform.controls['quotation'].get('Not Accepted').setValue(true);
      this.filterform.controls['quotation']
        .get('Expired Quotation')
        .setValue(true);
    }

    if (this.type === 'booking') {
      this.filterform.controls['booking'].get('Active').setValue(true);
      this.filterform.controls['booking']
        .get('Invoiced Pending Payment')
        .setValue(true);
      this.filterform.controls['booking'].get('Draft').setValue(true);
      this.filterform.controls['booking'].get('Expired Booking').setValue(true);
      this.filterform.controls['booking'].get('Completed').setValue(true);
      this.filterform.controls['booking'].get('Issue').setValue(true);
    }

    if (this.type === 'freightType') {
      this.filterform.controls['freightType'].get('Air').setValue(true);
      this.filterform.controls['freightType'].get('Ocean').setValue(true);
      this.filterform.controls['freightType'].get('Land').setValue(true);;
    }

    if (this.type === 'invoice') {
      this.filterform.controls['invoice'].get('Paid').setValue(true);
      this.filterform.controls['invoice'].get('Expired Invoice').setValue(true);
      this.filterform.controls['invoice']
        .get('Additional Invoice')
        .setValue(true);
      this.filterform.controls['invoice']
        .get('Invoiced Pending payment')
        .setValue(true);
    }
  }
  reset() {
    this.selectall = false;
    localStorage.removeItem('booking-data')
    localStorage.removeItem('quotation-data')
    localStorage.removeItem('invoice-data')
    this.filterform.get('booking').reset();
    this.filterform.get('quotation').reset();
    this.filterform.get('invoice').reset();
    this.filterform.get('fromlocation').reset();
    this.filterform.get('tolocation').reset();
    // this.filterform.get('fromdate').reset();
    // this.filterform.get('todate').reset()
    this.filterform.get('companyName').reset()
    this.onClearFilter.emit()
    this.onClose()
    // this.submitfilter()
  }

  ngChange() { }
  ngOnInit() {
    // this.api.getlocationlist().subscribe((res) => {
    //   if (res !== null) {
    //     this.locationlist = res;
    //   }
    // });

  }
}
