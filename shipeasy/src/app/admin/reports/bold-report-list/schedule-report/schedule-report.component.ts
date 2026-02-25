import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from 'src/app/services/common/common.service';

@Component({
  selector: 'app-schedule-report',
  templateUrl: './schedule-report.component.html',
  styleUrls: ['./schedule-report.component.scss']
})
export class ScheduleReportComponent implements OnInit {

  @Output() getList = new EventEmitter<any>()
  @Input() customerData: any = [];
  @Input() editData: any = {};
  @Input() reportName: any = '';
  @Input() id: any = '';
  public Editor = ClassicEditor;
  addScheduleForm: FormGroup;
  submitted: boolean = false;
  templateList: any = []
  linkToList: any = []
  filterFields: any = []
  summaryList: string[] = [
    'Consignee',
    'ETA status',
    'Shipper',
    'HBL / HAWB / LR Status',
    'Status',
    'MBL / MAWB Status',
    'Last Action'
  ];
  recicipentsList: any = []
  scheduleList: any = ['Yearly', 'Monthly', 'Weekly', 'daily']
  ccList: any = []
  weekdaysList: any = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  timeofDayList: any = Array.from({ length: 23 }, (_, i) => i + 1);
  fields = ['IGM Date', 'Customer Name', 'Order ID'];
  conditions = ['Is empty', 'Is not empty', 'Equals', 'Not equals'];
  reportList: any = [
    { name: "Container Shippingline Report", id: "containerShippinglineReport" },
    { name: "Container Allocation Details Report", id: "containerAllocationDetailsReport" },
    { name: "Invoice Report", id: "invoicereport" },
    { name: "Container Report", id: "containerreport" },
    { name: "BookingReport", id: "bookingreport" },
    { name: "Inquiry Report", id: "inquiryreport" },
    { name: "P&L Report", id: "p&lreport" },
    { name: "Payment Report", id: "paymentreport" },
    { name: "Vendor Costing Report", id: "VendorReport" },
    { name: "DO Release without Telex", id: "telexReport" },
    { name: "TDS Report", id: "tdsReport" },
    { name: "Sale Summary by HSN Code", id: "hsnReport" },
    { name: "Bank Statement", id: "bankStatement" },
    { name: "DSR Report", id: "dsrReport" },
    { name: "Job Report", id: "jobReport" },
    { name: "GST Report", id: "gstReport" },
    { name: "Party Report", id: "partyReport" },
    { name: "Expense Report", id: "expenseReport" },
    { name: "GSTR 1 Report", id: "gstr1Report" },
    { name: "GSTR 2 Report", id: "gstr2Report" },
    // { name: "GSTR 3B Report", id: "gstr3bReport" },
    // { name: "GSTR 9 Report", id: "gstr9Report" },
    { name: "Ledger Report", id: "ledgerReport" },
  ]

  emails: string[] = [];
  emailsCC: string[] = [];
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(public modalService: NgbModal, private fb: FormBuilder,
    public notification: NzNotificationService,
    public commonService: CommonService
  ) {

  }

  get f() {
    return this.addScheduleForm.controls;
  }
  ngOnInit(): void { 
    if (this.id) {
      this.formBuilder(this.editData);
    } else {
      this.formBuilder();
      this.customerData?.filter((x)=>{
        if (x?.primaryMailId && !this.id) {
          this.emails.push(x?.primaryMailId)
        }
      })
    }
 
    

  }
  formBuilder(data?) { 
    this.addScheduleForm = this.fb.group({
      type: [data ? data?.type || 'recurringEmail' : 'recurringEmail'],
      template: [data ? data?.template : ''],
      subscriptionName: [data ? data?.subscriptionName : ''],
      linkTo: [data ? data?.linkTo : ''],
      reportType: [data ? data?.reportType : this.reportName || ''],
      filterField: [data ? data?.filterField : ''],
      summaryOn: [data ? data?.summaryOn : ''],
      emailRecipients: [  '', [Validators.email]],
      ccEmail: [ '', [Validators.email]],
      subject: [data ? data?.subject : '', [Validators.required]],

      schedule: [data ? data?.schedule : ''],
      timeofDay: [data ? Number(data?.timeofDay)||'' : ''],
      weekDay: [data ? data?.weekDay : ''],
      // filters: this.fb.array([
      //   this.createFilterGroup()
      // ]),
      message: [data ? data?.message : ''],

    });
    console.log(data)

              
    if (data && data?.toEmail?.length > 0) {
      this.emails = data?.toEmail[0]?.split(',') || []
    }
    if (data && data?.ccEmail?.length > 0) {
      this.emailsCC = data?.ccEmail[0]?.split(',') || []
    }
    this.setValidation()
  }
  setValidation1() {
    if (this.f.schedule.value == 'Weekly') {
      this.addScheduleForm.controls['weekDay'].addValidators([Validators.required]);
    } else {
      this.addScheduleForm.controls['weekDay'].removeValidators([Validators.required]);
    }
    this.addScheduleForm.controls['weekDay'].updateValueAndValidity();
  }
  setValidation() {
    if (this.f.type.value == 'recurringEmail') {
      if (this.f.schedule.value == 'Weekly') {
        this.addScheduleForm.controls['weekDay'].addValidators([Validators.required]);
      } else {
        this.addScheduleForm.controls['weekDay'].removeValidators([Validators.required]);
      }

      this.addScheduleForm.controls['schedule'].addValidators([Validators.required]);
      this.addScheduleForm.controls['timeofDay'].addValidators([Validators.required]);
      this.addScheduleForm.controls['reportType'].addValidators([Validators.required]);
      this.addScheduleForm.controls['subscriptionName'].addValidators([Validators.required]);
    } else {
      this.addScheduleForm.controls['weekDay'].removeValidators([Validators.required]);
      this.addScheduleForm.controls['schedule'].removeValidators([Validators.required]);
      this.addScheduleForm.controls['timeofDay'].removeValidators([Validators.required]);
      this.addScheduleForm.controls['reportType'].removeValidators([Validators.required]);
      this.addScheduleForm.controls['subscriptionName'].removeValidators([Validators.required]);
    }

    this.addScheduleForm.controls['weekDay'].updateValueAndValidity();
    this.addScheduleForm.controls['schedule'].updateValueAndValidity();
    this.addScheduleForm.controls['timeofDay'].updateValueAndValidity();
    this.addScheduleForm.controls['reportType'].updateValueAndValidity();
    this.addScheduleForm.controls['subscriptionName'].updateValueAndValidity();
  }
  cancel() {
    this.modalService?.dismissAll();
  }

  get filtersFormArray() {
    return this.addScheduleForm.get('filters') as FormArray;
  }

  createFilterGroup(): FormGroup {
    return this.fb.group({
      field: ['', Validators.required],
      condition: ['', Validators.required],
    });
  }

  addFilter() {
    this.filtersFormArray.push(this.createFilterGroup());
  }

  removeFilter(index: number) {
    this.filtersFormArray.removeAt(index);
  }

  submitFilters() {
    this.submitted = true;
    this.addScheduleForm?.markAllAsTouched()
  
  
    if (this.addScheduleForm.valid && this.emails?.length > 0) {

      let payload = {
        ...this.addScheduleForm.value,
        toEmail: this.emails || [],
        ccEmail: this.emailsCC || [],
        customer : this.customerData || [],
        customerId: this.customerData?.partymasterId,
        customerName: this.customerData?.name,
        status : true
      }

      if (this.id) {
        this.commonService.UpdateToST(`schedulereport/${this.id}`, payload).subscribe((data: any) => {
          if (data) {
            this.notification.create('success', 'Updated Successfully', '');
            this.modalService.dismissAll()
            this.submitted = false;
            this.getList.emit(data);
          }
        }, (error) => {
          this.notification.create('error', error?.error?.error?.message, '');
        });
      } else {
        this.commonService.addToST('schedulereport', payload).subscribe((data: any) => {
          if (data) {
            this.notification.create('success', 'Added Successfully', '');
            this.modalService.dismissAll()
            this.submitted = false;
            this.getList.emit(data);
          }
        }, (error) => {
          this.notification.create('error', error?.message || error?.error?.error?.message, '');
        });
      }
    }else{
      this.notification.create('error', 'Invalid Form', '');
    }

  }

  // Helper to validate emails
  isValidEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  // Add Email for Recipients
  addEmail(event: any): void {
    const value = (event.value || '').trim();
    if (value && this.isValidEmail(value)) {
      this.emails.push(value);
    }
    event.input.value = '';
    this.addScheduleForm.controls.emailRecipients.setValue('');
  }

  // Remove Email for Recipients
  removeEmail(email: string): void {
    const index = this.emails.indexOf(email);
    if (index >= 0) {
      this.emails.splice(index, 1);
    }
  }

  // Add Email for CC
  addEmailCC(event: any): void {
    const value = (event.value || '').trim();
    if (value && this.isValidEmail(value)) {
      this.emailsCC.push(value);
    }
    event.input.value = '';
    this.addScheduleForm.controls.ccEmail.setValue('');
  }

  // Remove Email for CC
  removeEmailCC(email: string): void {
    const index = this.emailsCC.indexOf(email);
    if (index >= 0) {
      this.emailsCC.splice(index, 1);
    }
  }

  // Error Messages
  getEmailError(): string {
    const control = this.addScheduleForm.controls.emailRecipients;
    return control.hasError('email') ? 'Invalid email format' : '';
  }

  getEmailError1(): string {
    const control = this.addScheduleForm.controls.ccEmail;
    return control.hasError('email') ? 'Invalid email format' : '';
  }
}
