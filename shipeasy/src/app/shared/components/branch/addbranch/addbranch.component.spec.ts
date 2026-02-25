import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbDatepicker, NgbModal, NgbModalRef, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { of } from 'rxjs';
import { ApiService } from 'src/app/admin/principal/api.service';
import { CommonService } from 'src/app/services/common/common.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Pipe, PipeTransform, forwardRef } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import * as XLSX from "xlsx";
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { RouterModule } from '@angular/router';
// import { BoldReportComponents } from '@boldreports/angular-reporting-components';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { MatSelectModule } from '@angular/material/select';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AddbranchComponent } from './addbranch.component';
import { environment } from 'src/environments/environment';

@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}
const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => AddbranchComponent),
  multi: true
};

describe('AddbranchComponent', () => {
  let component: AddbranchComponent;
  let fixture: ComponentFixture<AddbranchComponent>;
  let mockNgbModal: jasmine.SpyObj<NgbModal>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockNotificationService: jasmine.SpyObj<NzNotificationService>;
  let mockMastersService: jasmine.SpyObj<MastersService>;
  let mockProfilesService: jasmine.SpyObj<ProfilesService>;
  let mockCognitoService: jasmine.SpyObj<CognitoService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;

  beforeEach(waitForAsync(() => {
    
    mockNgbModal = jasmine.createSpyObj('NgbModal', ['open']);
    mockApiService = jasmine.createSpyObj('ApiService', ['getSTList', 'addToST', 'UpdateToST', 'deleteST']);
    mockNotificationService = jasmine.createSpyObj('NzNotificationService', ['create']);
    mockMastersService = jasmine.createSpyObj('MastersService', ['getSTList']);
    mockProfilesService = jasmine.createSpyObj('ProfilesService', ['getUserDetails']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList']);

    TestBed.configureTestingModule({
      declarations: [AddbranchComponent, MockTranslatePipe],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientModule,RouterModule,NzSelectModule,ReactiveFormsModule,MatSelectModule,NzDatePickerModule,FormsModule
      ,NoopAnimationsModule,RouterModule],
      providers: [DatePipe, OrderByPipe,
        { provide: NgbModal, useValue: mockNgbModal },CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR,

        { provide: ApiService, useValue: mockApiService },
        { provide: NzNotificationService, useValue: mockNotificationService },
        { provide: MastersService, useValue: mockMastersService },
        { provide: ProfilesService, useValue: mockProfilesService },
        { provide: SaMasterService, useValue: {} },
        { provide: CognitoService, useValue: mockCognitoService },
        { provide: CommonService, useValue: mockCommonService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddbranchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle onCancel and navigate to the correct path', () => {
    const routerSpy = spyOn(component.router, 'navigate');
    component.isFiledVisiable = 'smartagent';

    component.onCancel();

    expect(routerSpy).toHaveBeenCalledWith(['/smartagent/branch']);
  });

  it('should navigate back when backbtn is called', () => {
    const locationSpy = spyOn(component.location, 'back');
    component.backbtn();

    expect(locationSpy).toHaveBeenCalled();
  });

  it('should trigger form validation', () => {
    component.buildForm();
    const form = component.addBranchForm;

    // Trigger validation for a specific control
    form.get('branchName').markAsTouched();

    // Check if the control is marked as touched and has validation errors if any
    expect(form.get('branchName').touched).toBe(true);
    expect(form.get('branchName').hasError('required')).toBe(true);

    // Optionally, trigger validation for the entire form
    form.markAllAsTouched();

    // Check if the entire form has validation errors if any
    expect(form.invalid).toBe(true);
  });

  it('should disable and enable the form', () => {
    component.buildForm();
    const form = component.addBranchForm;

    // Disable the form
    form.disable();

    // Check if the form and its controls are disabled
    expect(form.disabled).toBe(true);
    expect(form.get('branchName').disabled).toBe(true);
    // ... continue with other form controls

    // Enable the form
    form.enable();

    // Check if the form and its controls are enabled
    expect(form.enabled).toBe(true);
    expect(form.get('branchName').enabled).toBe(true);
    // ... continue with other form controls
  });

  it('should create branchDetail object with correct values from form', () => {
    // Set up mock data for the test
    const mockCountryList = [{ countryId: 1, countryName: 'Country1' }];
    const mockStateList = [{ stateId: 1, typeDescription: 'State1' }];
    const mockCityList = [{ cityId: 1, cityName: 'City1' }];
    const mockCurrencyList = [{ currencyId: 1, currencyShortName: 'USD', currencyName: 'US Dollar' }];

    // Set values in the form (assuming form control setup)
    component.addBranchForm.patchValue({
      isBranch: true,
      branchName: 'Sample Branch',
      country: 1,
      state: 1,
      city: 1,
      // ... set values for other form controls
    });

    // Set mock data in the component properties
    component.countryList = mockCountryList;


    // Call the function to test
    component.createModel();

    // Check if branchDetail object is created with correct values
    expect(component.branchDetail.isBranch).toBe(true);
    expect(component.branchDetail.branchName).toBe('Sample Branch');
    expect(component.branchDetail.addressInfo.countryId).toBe(1);
    // ... add more assertions for other properties

    // Add more assertions based on your specific requirements
  });

  it('should return "smartagent" when isFiledVisiable is "smartagent"', () => {
    // Set the value of isFiledVisiable to 'smartagent'
    component.isFiledVisiable = 'smartagent';

    // Call the function to test
    const result = component.getAddressType('someScreen');

    // Check if the function returns 'smartagent'
    expect(result).toBe('smartagent');
  });

  it('should return "vendor" when isFiledVisiable is not "smartagent"', () => {
    // Set the value of isFiledVisiable to something other than 'smartagent'
    component.isFiledVisiable = 'vendor'; // You can use any other value

    // Call the function to test
    const result = component.getAddressType('someScreen');

    // Check if the function returns 'vendor'
    expect(result).toBe('vendor');
  });

  it('should find invalid controls in the form', () => {
    // Mock an invalid form control
    component.addBranchForm.get('branchName').setErrors({ 'required': true });

    // Call the function to test
    const invalidControls = component.findInvalidControls();

    // Check if the function correctly identifies the invalid control
    expect(invalidControls).toContain('branchName');
    // You can add more expectations based on the specific invalid controls in your form
  });

  it('should find multiple invalid controls in the form', () => {
    // Mock multiple invalid form controls
    component.addBranchForm.get('branchName').setErrors({ 'required': true });
    component.addBranchForm.get('pinCode').setErrors({ 'pattern': true });
  
    // Call the function to test
    const invalidControls = component.findInvalidControls();
  
    // Check if the function correctly identifies multiple invalid controls
    expect(invalidControls).toContain('branchName');
    expect(invalidControls).toContain('pinCode');
    // Add more expectations based on your specific invalid controls in the form
  });

});

