import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { of } from 'rxjs';
import { ApiService } from 'src/app/admin/principal/api.service';
import { CommonService } from 'src/app/services/common/common.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Pipe, PipeTransform } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import * as XLSX from "xlsx";
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { ShippingLineComponent } from './shipping-line.component';
import { MastersSortPipe } from '../../util/mastersort';


@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('ShippingLineComponent', () => {
  let component: ShippingLineComponent;
  let fixture: ComponentFixture<ShippingLineComponent>;
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
      declarations: [ShippingLineComponent, MockTranslatePipe],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientModule],
      providers: [DatePipe, OrderByPipe,MastersSortPipe,
        { provide: NgbModal, useValue: mockNgbModal },
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
    fixture = TestBed.createComponent(ShippingLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should initialize shippingLineForm correctly', () => {
    const formControls = component.shippingLineForm.controls;
    
    expect(formControls.name.value).toBe('');
    expect(formControls.country.value).toBe('');
    // ... check other form controls ...
  
    expect(formControls.status.value).toBe(true);
    expect(formControls.toDate.value).toBeFalsy();
    // ... check other default values ...
  
    // Additional checks for specific form controls if needed
  });

  it('should retrieve currency list during initialization', () => {
    spyOn(component, 'getCurrencyList').and.callThrough();
    component.ngOnInit();
    
    expect(component.getCurrencyList).toHaveBeenCalled();
  });

  it('should reset form-related properties on clear', () => {
    component.name = 'TestName';
    component.city = 'TestCity';
    component.country = 'TestCountry';
    component.phone = 'TestPhone';
    component.email = 'TestEmail';
    component.shipping_line = 'TestShippingLine';
    component.contact_person = 'TestContactPerson';
    component.status = 'TestStatus';
    component.entryPort = 'TestEntryPort';
    component.loadPort = 'TestLoadPort';
    component.preCarriage = 'TestPreCarriage';
  
    component.clear();
  
    // Ensure all form-related properties are reset
    expect(component.name).toBe('');
    expect(component.city).toBe('');
    expect(component.country).toBe('');
    expect(component.phone).toBe('');
    expect(component.email).toBe('');
    expect(component.shipping_line).toBe('');
    expect(component.contact_person).toBe('');
    expect(component.status).toBe('');
    expect(component.entryPort).toBe('');
    expect(component.loadPort).toBe('');
    expect(component.preCarriage).toBe('');
  });

  it('should clear form-related variables', () => {
    component.name = 'Test Name';
    component.city = 'Test City';
    component.country = 'Test Country';
    component.phone = 'Test Phone';
    component.email = 'test@example.com';
    component.shipping_line = 'Test Shipping Line';
    component.contact_person = 'Test Contact Person';
    component.status = 'Test Status';
    component.entryPort = 'Test Entry Port';
    component.loadPort = 'Test Load Port';
    component.preCarriage = 'Test Pre Carriage';
  
    component.clear();
  
    // Ensure all form-related variables are cleared
    expect(component.name).toBe('');
    expect(component.city).toBe('');
    expect(component.country).toBe('');
    expect(component.phone).toBe('');
    expect(component.email).toBe('');
    expect(component.shipping_line).toBe('');
    expect(component.contact_person).toBe('');
    expect(component.status).toBe('');
    expect(component.entryPort).toBe('');
    expect(component.loadPort).toBe('');
    expect(component.preCarriage).toBe('');
  });

  it('should navigate to the next page', () => {
    spyOn(component, 'getPaginationData');
    component.toalLength = 15;
    component.count = 10;
  
    component.next();
  
    // Ensure the next page is requested when available
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });
  
  it('should navigate to the previous page', () => {
    spyOn(component, 'getPaginationData');
    component.page = 2;
    component.toalLength = 15;
    component.count = 5;
  
    component.prev();
  
    // Ensure the previous page is requested when available
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should set toDate control to empty value', () => {
    component.shippingLineForm.controls.fromDate.setValue(new Date());
    component.shippingLineForm.controls.toDate.setValue(new Date());
  
    component.changeFromDate();
  
    // Ensure toDate control is set to empty value
    expect(component.shippingLineForm.controls.toDate.value).toBe('');
  });

  it('should return correct boolean value for disabledEtdDate', () => {
    component.shippingLineForm.controls.fromDate.setValue(new Date());
  
    // Pass a date before fromDate
    const result1 = component.disabledEtdDate(new Date(new Date().getTime() - 86400000));
    // Pass a date after fromDate
    const result2 = component.disabledEtdDate(new Date(new Date().getTime() + 86400000));
    // Pass the same date as fromDate
    const result3 = component.disabledEtdDate(new Date());
  
    // Ensure correct boolean values are returned
    expect(result1).toBe(true);
    expect(result2).toBe(false);
    expect(result3).toBe(false);
  });

  it('should reset all search criteria', () => {
    component.name = 'Shipping Line 1';
    component.country = 'Country 1';
    component.preCarriage = 'Pre Carriage 1';
    component.loadPort = 'Load Port 1';
    component.entryPort = 'Entry Port 1';
    component.status = 'Active';
  
    component.clear();
  
    // Ensure all search criteria are reset
    expect(component.name).toEqual('');
    expect(component.country).toEqual('');
    expect(component.preCarriage).toEqual('');
    expect(component.loadPort).toEqual('');
    expect(component.entryPort).toEqual('');
    expect(component.status).toEqual('');
  });

  it('should disable dates based on the selected fromDate', () => {
    const currentDate = new Date();
    component.shippingLineForm.controls.fromDate.setValue(currentDate);
  
    const disabledDate = new Date(currentDate);
    disabledDate.setDate(disabledDate.getDate() - 1);
  
    expect(component.disabledEtdDate(disabledDate)).toBe(true); // Should be disabled
    expect(component.disabledEtdDate(currentDate)).toBe(false); // Should not be disabled
  });

  it('should update pagination for next page', () => {
    component.toalLength = 20; // Set a total length greater than the current count
    component.count = 10; // Set the current count
    spyOn(component, 'getPaginationData');
  
    component.next();
  
    // Ensure getPaginationData is called with 'next'
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });

  it('should update pagination for previous page', () => {
    component.page = 2; // Set the current page greater than 1
    spyOn(component, 'getPaginationData');
  
    component.prev();
  
    // Ensure getPaginationData is called with 'prev'
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should filter data based on criteria', () => {
    component.size = 10; // Set a default size
    spyOn(component, 'getShiipingLine');
    component.name = 'Shipping Line 1';
    component.country = 'Country 1';
    component.preCarriage = 'Pre Carriage 1';
    component.loadPort = 'Load Port 1';
    component.entryPort = 'Entry Port 1';
    component.status = 'Active';
  
    component.filter({ target: { value: 10 } }); // Trigger the filter
  
    // Ensure getShiipingLine is called with the filtered criteria
    expect(component.getShiipingLine).toHaveBeenCalledOnceWith();
  
    // Additional expectations based on your filtering logic
    // ...
  });

  it('should reset properties in the clear method', () => {
    // Set some properties before calling clear
    component.name = 'Test Shipping Line';
    component.city = 'Test City';
    component.country = 'Test Country';
    component.phone = 'Test Phone';
    component.email = 'test@example.com';
    component.shipping_line = 'Test Shipping Line';
    component.contact_person = 'Test Contact Person';
    component.status = 'Test Status';
    component.entryPort = 'Test Entry Port';
    component.loadPort = 'Test Load Port';
    component.preCarriage = 'Test Pre Carriage';
  
    component.clear();
  
    // Ensure all properties are reset to their initial values
    expect(component.name).toEqual('');
    expect(component.city).toEqual('');
    expect(component.country).toEqual('');
    expect(component.phone).toEqual('');
    expect(component.email).toEqual('');
    expect(component.shipping_line).toEqual('');
    expect(component.contact_person).toEqual('');
    expect(component.status).toEqual('');
    expect(component.entryPort).toEqual('');
    expect(component.loadPort).toEqual('');
    expect(component.preCarriage).toEqual('');
  
    // Additional expectations based on your specific implementation
  });

  it('should clear toDate control in changeFromDate method', () => {
    // Set some value for toDate before calling changeFromDate
    component.shippingLineForm.controls.toDate.setValue('2024-03-15');
  
    component.changeFromDate();
  
    // Ensure toDate control is cleared
    expect(component.shippingLineForm.controls.toDate.value).toEqual('');
  
    // Additional expectations based on your specific implementation
  });

  it('should calculate total amount in calcuTotal method', () => {
    // Set some values for the controls
    component.newenquiryForm.controls.stcAmount.setValue(100);
    component.newenquiryForm.controls.gstPercentage.setValue(10);
  
    // Call the method
    component.calcuTotal();
  
    // Expect that the amount, gst, and totalAmount controls are set correctly
    expect(component.newenquiryForm.controls.amount.value).toEqual('100.00');
    expect(component.newenquiryForm.controls.gst.value).toEqual('10.00');
    expect(component.newenquiryForm.controls.totalAmount.value).toEqual('110.00');
  });

  it('should clear form fields on clear method call', () => {
    // Set some values to form fields
    component.name = 'someName';
    component.country = 'someCountry';
    component.status = 'someStatus';
    // ... Set values for other fields as needed
  
    // Call the clear method
    component.clear();
  
    // Expect that form fields are cleared
    expect(component.name).toEqual('');
    expect(component.country).toEqual('');
    expect(component.status).toEqual('');
    // Include expectations for other fields
  });

  it('should initialize with an empty costItemList and default values', () => {
    // Expect that costItemList is empty
    expect(component.costItemList.length).toEqual(0);
  
    // Expect that other properties are set to their default values
    // Include additional expectations based on your component initialization
  });
  
});

