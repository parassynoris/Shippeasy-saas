import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { NgbDatepicker, NgbModal, NgbModalRef, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { of, throwError } from 'rxjs';
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
import { ReceiptNewComponent } from './receipt-new.component';

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
  useExisting: forwardRef(() => ReceiptNewComponent),
  multi: true
};

describe('ReceiptNewComponent', () => {
  let component: ReceiptNewComponent;
  let fixture: ComponentFixture<ReceiptNewComponent>;
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
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList', 'currencyList', 'countryList', 'getListByURL']);

    TestBed.configureTestingModule({
      declarations: [ReceiptNewComponent, MockTranslatePipe],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientModule, RouterModule, NzSelectModule, ReactiveFormsModule, MatSelectModule, NzDatePickerModule, FormsModule
        , NoopAnimationsModule],
      providers: [DatePipe, OrderByPipe,
        { provide: NgbModal, useValue: mockNgbModal }, CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR,

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
    fixture = TestBed.createComponent(ReceiptNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form', () => {
    expect(component.NewReciept).toBeDefined();
    expect(component.NewReciept.controls['jobNumber']).toBeDefined();
    // Add assertions for other form controls
  });

  it('should retrieve job details based on selected job number', () => {
    // Mock the batchNoList with predefined batch details
    component.batchNoList = [{ _source: { batchNo: '123', /* other batch details */ } }];

    // Set the selected job number
    component.NewReciept.get('jobNumber').setValue('123');

    // Trigger the getJobDetails method
    component.getJobDetails();

    // Add expectations for updated jobDetails
    expect(component.jobDetails).toBeDefined();
    // Add more expectations as needed
  });

  it('should toggle isShowMore flag', () => {
    // Initial state of isShowMore is false
    expect(component.isShowMore).toBe(false);

    // Trigger the showMore method
    component.showMore();

    // Add expectations for updated isShowMore flag
    expect(component.isShowMore).toBe(true);

    // Trigger the showMore method again
    component.showMore();

    // Add expectations for toggling isShowMore back to false
    expect(component.isShowMore).toBe(false);
  });

  it('should update form state when the receipt type changes', () => {
    // Set initial receipt type to 'Type1'
    component.NewReciept.get('receiptType').setValue('Type1');

    // Trigger the onChange method with a new receipt type
    component.onChange({ target: { value: 'Type2' } });

  });

  it('should navigate back when cancel button is clicked', () => {
    const navigateSpy = spyOn(component.router, 'navigate');

    // Trigger the oncancel method
    component.oncancel();

    // Add expectations for router navigation to the previous page
    expect(navigateSpy).toHaveBeenCalledWith(['finance/receipt']);
  });

  it('should retrieve batch numbers in the batchNoList', () => {
    // Mock the getListByURL method to return a predefined batch list
    mockCommonService.getListByURL.and.returnValue(of({ hits: { hits: [{ _source: { batchNo: 'B123' } }] } }));

    // Trigger the getBatchList method
    component.getBatchList();

    // Add expectations for the updated batchNoList
    expect(component.batchNoList.length).toEqual(1);
    // Add more expectations as needed
  });

  it('should handle empty country list', () => {
    // Mock the countryData to be an empty array
    component.countryData = [];

    // Trigger the ngOnInit method
    component.ngOnInit();

    // Add expectations for empty countryOptions
    expect(component.countryOptions.length).toEqual(0);
  });

  it('should retrieve location data in the locationData list', () => {
    // Mock the getListByURL method to return a predefined location list
    mockCommonService.getListByURL.and.returnValue(of({ hits: { hits: [{ _source: { locationName: 'Location1' } }] } }));

    // Trigger the getLocationList method
    component.getLocationList();

    // Add expectations for the updated locationData
    expect(component.locationData.length).toEqual(1);
    // Add more expectations as needed
  });

  it('should populate countryData on successful countryList API call', () => {
    // Mock the countryList method to return a predefined response
    const mockCountryData = { hits: { hits: [{ _source: { countryName: 'Country1' } }, { _source: { countryName: 'Country2' } }] } };
    mockCommonService.countryList.and.returnValue(of(mockCountryData));
  
    // Call the getCountryList method
    component.getCountryList();
  
    // Expect the countryData to be populated with the mock response
    expect(component.countryData).toEqual(mockCountryData.hits.hits);
  });
  
  it('should not populate countryOptions on empty countryList API response', () => {
    // Mock the countryList method to return an empty response
    const mockEmptyCountryData = { hits: { hits: [] } };
    mockCommonService.countryList.and.returnValue(of(mockEmptyCountryData));
  
    // Call the getCountryList method
    component.getCountryList();
  
    // Expect countryOptions to be an empty array
    expect(component.countryOptions).toEqual([]);
  });

  it('should populate locationData on successful getListByURL API call', () => {
    // Mock the getListByURL method to return a predefined response
    const mockLocationData = { hits: { hits: [{ _source: { locationName: 'Location1' } }, { _source: { locationName: 'Location2' } }] } };
    mockCommonService.getListByURL.and.returnValue(of(mockLocationData));
  
    // Call the getLocationList method
    component.getLocationList();
  
    // Expect the locationData to be populated with the mock response
    expect(component.locationData).toEqual(mockLocationData.hits.hits);
  });

  it('should calculate amtInr when exchange and amount are both provided', () => {
    // Set values for exchange and amount
    component.NewReciept.get('exchange').setValue(2);
    component.NewReciept.get('amount').setValue(100);
  
    // Call the calcInrAmount method
    component.calcInrAmount();
  
    // Expect amtInr to be calculated correctly
    expect(component.NewReciept.get('amtInr').value).toEqual(200);
  });
  
  it('should set amtInr to amount when exchange is not provided', () => {
    // Set value for amount, leave exchange as undefined
    component.NewReciept.get('amount').setValue(150);
  
    // Call the calcInrAmount method
    component.calcInrAmount();
  
    // Expect amtInr to be set to the value of amount
    expect(component.NewReciept.get('amtInr').value).toEqual(150);
  });

  it('should set amtInr to amount when exchange is 0', () => {
    // Set exchange to 0 and provide a value for amount
    component.NewReciept.get('exchange').setValue(0);
    component.NewReciept.get('amount').setValue(100);
  
    // Call the calcInrAmount method
    component.calcInrAmount();
  
    // Expect amtInr to be set to the value of amount
    expect(component.NewReciept.get('amtInr').value).toEqual(100);
  });
  
  it('should set amtInr to 0 when amount is 0', () => {
    // Set amount to 0 and provide a value for exchange
    component.NewReciept.get('exchange').setValue(2);
    component.NewReciept.get('amount').setValue(0);
  
    // Call the calcInrAmount method
    component.calcInrAmount();
  
    // Expect amtInr to be set to 0
    expect(component.NewReciept.get('amtInr').value).toEqual(0);
  });
  
});
