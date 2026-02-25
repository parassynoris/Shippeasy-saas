import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ScheduleReportComponent } from './schedule-report.component';
import { FormBuilder, ReactiveFormsModule, FormsModule, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from 'src/app/services/common/common.service';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations'; // Import NoopAnimationsModule
import { MatChipsModule } from '@angular/material/chips'; // Import MatChipsModule
import { MatFormFieldModule } from '@angular/material/form-field'; // Import MatFormFieldModule
import { MatIconModule } from '@angular/material/icon'; // Import MatIconModule
import { MatAutocompleteModule } from '@angular/material/autocomplete'; // Import MatAutocompleteModule

describe('ScheduleReportComponent', () => {
  let component: ScheduleReportComponent;
  let fixture: ComponentFixture<ScheduleReportComponent>;
  let modalService: jasmine.SpyObj<NgbModal>;
  let fb: FormBuilder;
  let notification: jasmine.SpyObj<NzNotificationService>;
  let commonService: jasmine.SpyObj<CommonService>;

  beforeEach(async () => {
    const modalServiceSpy = jasmine.createSpyObj('NgbModal', ['dismissAll']);
    const notificationSpy = jasmine.createSpyObj('NzNotificationService', ['create']);
    const commonServiceSpy = jasmine.createSpyObj('CommonService', ['addToST', 'UpdateToST']);
    fb = new FormBuilder();

    await TestBed.configureTestingModule({
      declarations: [ScheduleReportComponent],
      imports: [ReactiveFormsModule, FormsModule, NoopAnimationsModule, MatChipsModule, MatFormFieldModule, MatIconModule, MatAutocompleteModule], // Added required modules
      providers: [
        { provide: NgbModal, useValue: modalServiceSpy },
        { provide: NzNotificationService, useValue: notificationSpy },
        { provide: CommonService, useValue: commonServiceSpy },
        FormBuilder,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ScheduleReportComponent);
    component = fixture.componentInstance;
    modalService = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;
    notification = TestBed.inject(NzNotificationService) as jasmine.SpyObj<NzNotificationService>;
    commonService = TestBed.inject(CommonService) as jasmine.SpyObj<CommonService>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.addScheduleForm).toBeDefined();
    expect(component.addScheduleForm.get('type')?.value).toBe('recurringEmail');
  });

  it('should initialize form with edit data if id is provided', () => {
    component.id = '123';
    component.editData = {
      type: 'oneTimeEmail',
      template: 'template1',
      subscriptionName: 'sub1',
      linkTo: 'link1',
      reportType: 'report1',
      filterField: 'field1',
      summaryOn: 'summary1',
      subject: 'subject1',
      schedule: 'daily',
      timeofDay: '10',
      weekDay: 'Monday',
      message: 'message1',
      toEmail: ['test@example.com'],
      ccEmail: ['cc@example.com'],
    };
    component.ngOnInit();  // Manually trigger ngOnInit

    expect(component.addScheduleForm.get('type')?.value).toBe('oneTimeEmail');
    expect(component.emails).toEqual(['test@example.com']);
    expect(component.emailsCC).toEqual(['cc@example.com']);

  });

  it('should add email to recipients list', () => {
    const inputElement = { value: '' };
    const event = { input: inputElement, value: 'test@example.com' };
    component.addEmail(event);
    expect(component.emails).toContain('test@example.com');
    //verify that input value is reset
    expect(event.input.value).toBe('');
  });

  it('should not add an invalid email to recipients list', () => {
    const inputElement = { value: '' };
    const event = { input: inputElement, value: 'invalidemail' };
    component.addEmail(event);
    expect(component.emails).not.toContain('invalidemail');
  });


  it('should remove email from recipients list', () => {
    component.emails = ['test@example.com', 'test2@example.com'];
    component.removeEmail('test@example.com');
    expect(component.emails).toEqual(['test2@example.com']);
  });


  it('should add email to CC list', () => {
    const inputElement = { value: '' };
    const event = { input: inputElement, value: 'cc@example.com' };
    component.addEmailCC(event);
    expect(component.emailsCC).toContain('cc@example.com');
     expect(event.input.value).toBe('');
  });

   it('should not add invalid email to CC list', () => {
    const inputElement = { value: '' };
    const event = { input: inputElement, value: 'cc' };
    component.addEmailCC(event);
    expect(component.emailsCC).not.toContain('cc');
  });


  it('should remove email from CC list', () => {
    component.emailsCC = ['cc@example.com', 'cc2@example.com'];
    component.removeEmailCC('cc@example.com');
    expect(component.emailsCC).toEqual(['cc2@example.com']);
  });

    it('should validate email format correctly', () => {
      expect(component.isValidEmail('test@example.com')).toBe(true);
      expect(component.isValidEmail('invalid-email')).toBe(false);
      expect(component.isValidEmail('test@.com')).toBe(false);
      expect(component.isValidEmail('test@test')).toBe(false);
    });


    it('should get email error message for invalid email', () => {
      component.addScheduleForm.controls.emailRecipients.setValue('invalid-email');
      component.addScheduleForm.controls.emailRecipients.markAsTouched();
      expect(component.getEmailError()).toBe('Invalid email format');
    });

     it('should get cc email error message for invalid email', () => {
      component.addScheduleForm.controls.ccEmail.setValue('invalid-email');
      component.addScheduleForm.controls.ccEmail.markAsTouched();
      expect(component.getEmailError1()).toBe('Invalid email format');
    });

    it('should not get email error message for valid email', () => {
        component.addScheduleForm.controls.emailRecipients.setValue('test@example.com');
        expect(component.getEmailError()).toBe('');
    });

     it('should not get cc email error message for valid email', () => {
        component.addScheduleForm.controls.ccEmail.setValue('test@example.com');
        expect(component.getEmailError1()).toBe('');
    });


  it('should call dismissAll on modalService when cancel is called', () => {
    component.cancel();
    expect(modalService.dismissAll).toHaveBeenCalled();
  });


    it('should add a filter', () => {
      component.addFilter();
      expect(component.filtersFormArray.length).toBe(1); // Start with 0, add 1
    });

    it('should remove a filter', () => {
      component.addFilter();
      component.removeFilter(0);
      expect(component.filtersFormArray.length).toBe(0);
    });



  it('should submit form successfully when valid', () => {
    commonService.addToST.and.returnValue(of({}));
    component.customerData = { partymasterId: 'cust1', name: 'Customer 1' };
    component.emails = ['test@example.com'];
    component.addScheduleForm.patchValue({
      type: 'recurringEmail',
      template: 'template1',
      subscriptionName: 'sub1',
      linkTo: 'link1',
      reportType: 'report1',
      filterField: 'field1',
      summaryOn: 'summary1',
      subject: 'subject1',
      schedule: 'daily',
      timeofDay: 10,
      message: 'message1',
    });

    component.submitFilters();
    expect(commonService.addToST).toHaveBeenCalled();
    expect(notification.create).toHaveBeenCalledWith('success', 'Added Successfully', '');
    expect(modalService.dismissAll).toHaveBeenCalled();
    expect(component.submitted).toBeFalse();
  });


  it('should update an existing schedule report', () => {
    component.id = "someId";
    commonService.UpdateToST.and.returnValue(of({}));
      component.customerData = { partymasterId: 'cust1', name: 'Customer 1' };
    component.emails = ['test@example.com'];
    component.addScheduleForm.patchValue({
      type: 'recurringEmail',
      template: 'template1',
      subscriptionName: 'sub1',
      linkTo: 'link1',
      reportType: 'report1',
      filterField: 'field1',
      summaryOn: 'summary1',
      subject: 'subject1',
      schedule: 'daily',
      timeofDay: 10,
      message: 'message1',
    });


    component.submitFilters();
    expect(commonService.UpdateToST).toHaveBeenCalled();
    expect(notification.create).toHaveBeenCalledWith('success', 'Updated Successfully', '');
    expect(modalService.dismissAll).toHaveBeenCalled();
    expect(component.submitted).toBeFalse();

  });

  it('should show error notification when add to schedule fails', () => {
        commonService.addToST.and.returnValue(throwError({ message: 'Error adding schedule' })); // Simulate service error
        component.customerData = { partymasterId: 'cust1', name: 'Customer 1' };
        component.emails = ['test@example.com']; // Ensure email validation passes
        component.addScheduleForm.patchValue({  // Make form valid
            type: 'recurringEmail',
            template: 'template1',
            subscriptionName: 'sub1',
            subject: 'subject1',
            schedule: 'daily',
            timeofDay: 10
        });

        component.submitFilters();

        expect(commonService.addToST).toHaveBeenCalled();
        expect(notification.create).toHaveBeenCalledWith('error', 'Error adding schedule', '');
  });

  it('should show error notification when update schedule report return an error', () => {
        component.id = "someId";
        commonService.UpdateToST.and.returnValue(throwError({ error:{error:{message: 'Error updating schedule'}} })); // Simulate service error
        component.customerData = { partymasterId: 'cust1', name: 'Customer 1' };
        component.emails = ['test@example.com']; // Ensure email validation passes
        component.addScheduleForm.patchValue({  // Make form valid
            type: 'recurringEmail',
            template: 'template1',
            subscriptionName: 'sub1',
            subject: 'subject1',
            schedule: 'daily',
            timeofDay: 10
        });

        component.submitFilters();

        expect(commonService.UpdateToST).toHaveBeenCalled();
        expect(notification.create).toHaveBeenCalledWith('error', 'Error updating schedule', '');
    });


  it('should display error notification if form is invalid', () => {

    component.addScheduleForm.patchValue({
        subject: '', // Invalid: subject is required
    });
     component.emails = [];
    component.submitFilters();

    expect(notification.create).toHaveBeenCalledWith('error', 'Invalid Form', '');
     expect(commonService.addToST).not.toHaveBeenCalled();
    expect(commonService.UpdateToST).not.toHaveBeenCalled();
});

  it('should set validators correctly based on schedule', () => {
      component.addScheduleForm.get('schedule')?.setValue('Weekly');
      component.setValidation1();
      expect(component.addScheduleForm.get('weekDay')?.validator).toBeTruthy(); // Check for required validator
      component.addScheduleForm.get('schedule')?.setValue('daily');
      component.setValidation1();
      expect(component.addScheduleForm.get('weekDay')?.validator).toBeFalsy();
    });

  it('should set validators for recurringEmail', () => {
        component.addScheduleForm.get('type')?.setValue('recurringEmail');
        component.addScheduleForm.get('schedule')?.setValue('Weekly');
        component.setValidation();

        expect(component.addScheduleForm.get('weekDay')?.hasValidator(Validators.required)).toBeTrue();
        expect(component.addScheduleForm.get('schedule')?.hasValidator(Validators.required)).toBeTrue();
        expect(component.addScheduleForm.get('timeofDay')?.hasValidator(Validators.required)).toBeTrue();
        expect(component.addScheduleForm.get('reportType')?.hasValidator(Validators.required)).toBeTrue();
        expect(component.addScheduleForm.get('subscriptionName')?.hasValidator(Validators.required)).toBeTrue();

        // Change the schedule to something other than 'Weekly'
        component.addScheduleForm.get('schedule')?.setValue('daily');
        component.setValidation();
        expect(component.addScheduleForm.get('weekDay')?.hasValidator(Validators.required)).toBeFalse();
    });

   it('should set validators for oneTimeEmail', () => {
        component.addScheduleForm.get('type')?.setValue('oneTimeEmail');
        component.setValidation();
        expect(component.addScheduleForm.get('weekDay')?.hasValidator(Validators.required)).toBeFalse();
        expect(component.addScheduleForm.get('schedule')?.hasValidator(Validators.required)).toBeFalse();
        expect(component.addScheduleForm.get('timeofDay')?.hasValidator(Validators.required)).toBeFalse();
        expect(component.addScheduleForm.get('reportType')?.hasValidator(Validators.required)).toBeFalse();
        expect(component.addScheduleForm.get('subscriptionName')?.hasValidator(Validators.required)).toBeFalse();
    });

     it('should add primaryMailId to emails if available and not editing', () => {
      component.customerData = { primaryMailId: 'primary@example.com' };
      component.id = null; // Not editing
      component.ngOnInit();
      expect(component.emails).toEqual(['primary@example.com']);
  });

    it('should not add primaryMailId to emails if editing', () => {
      component.customerData = { primaryMailId: 'primary@example.com' };
      component.id = 'someId'; // Editing
      component.ngOnInit();
      expect(component.emails).toEqual([]);
    });


});