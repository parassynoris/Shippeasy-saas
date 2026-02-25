import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef, NgbModule } from '@ng-bootstrap/ng-bootstrap';
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
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AddchangesComponent } from './addchanges.component';


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
  useExisting: forwardRef(() => AddchangesComponent),
  multi: true
};

describe('AddchangesComponent', () => {
  let component: AddchangesComponent;
  let fixture: ComponentFixture<AddchangesComponent>;
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
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails','getModule']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList']);

    TestBed.configureTestingModule({
      declarations: [AddchangesComponent, MockTranslatePipe,],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientModule,RouterModule,ReactiveFormsModule,RouterModule,TranslateModule.forRoot(),NzSelectModule,NzDatePickerModule,BrowserAnimationsModule],
      providers: [DatePipe, OrderByPipe,TranslateService,
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
    fixture = TestBed.createComponent(AddchangesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

it('should initialize inputs correctly', () => {
    expect(component.isTypeForm).toBeDefined();
    expect(component.isshowDetails).toBeDefined();
    // Add assertions for other inputs
});

it('should initialize the form properly', () => {
    expect(component.newenquiryForm).toBeDefined();
    // Add assertions to check form controls initialization
});

it('should mark the form as invalid if required fields are empty', () => {
  component.newenquiryForm.reset(); // Reset form to empty
  expect(component.newenquiryForm.valid).toBeFalsy();
  expect(component.newenquiryForm.get('chargeName').errors.required).toBeTruthy();
  // Add more assertions for other required fields
});

it('should unsubscribe from subscriptions on component destroy', () => {
  spyOn(component.ngUnsubscribe, 'next');
  spyOn(component.ngUnsubscribe, 'complete');

  // Call ngOnDestroy method
  component.ngOnDestroy();

  // Assertions
  expect(component.ngUnsubscribe.next).toHaveBeenCalled();
  expect(component.ngUnsubscribe.complete).toHaveBeenCalled();
});

it('should build the form with correct controls', () => {
  expect(component.newenquiryForm.get('chargeGroup')).toBeTruthy();
  expect(component.newenquiryForm.get('chargeName')).toBeTruthy();
  // Add assertions for other form controls
});

it('should set quantity based on charge type', () => {
  component.newenquiryForm.controls.chargeName.setValue('SampleCharge'); // Set a charge name with a specific type
  component.setChargeQty(); // Call the method

  expect(component.newenquiryForm.value.quantity).toEqual(1); // Assert quantity for the specific charge type
});

it('should set exchange rate based on selected currency', () => {
  component.currencyList = [
      { currencyId: 'USD', currencyPair: 1.5 },
      { currencyId: 'EUR', currencyPair: 1.2 }
  ];
  component.newenquiryForm.controls.currency.setValue('USD');
  component.setCustExchange();

  expect(component.newenquiryForm.value.exchangeRate).toEqual(1.5);
});

it('should calculate total amount correctly', () => {
  component.newenquiryForm.controls.exchangeRate.setValue(1.5);
  component.newenquiryForm.controls.quantity.setValue(2);
  component.newenquiryForm.controls.rate.setValue(10);

  component.calcuTotal();

  const expectedTotalAmount = 1.5 * 2 * 10; // Expected total amount based on provided values
  expect(component.newenquiryForm.value.amount).toEqual(expectedTotalAmount.toFixed(2));
});

it('should calculate GST amount correctly', () => {
  component.newenquiryForm.controls.gstPercentage.setValue(10);
  component.newenquiryForm.controls.amount.setValue(100);

  component.calcuGST();

  const expectedGST = (100 * 10) / 100; // Expected GST amount based on provided percentage and total amount
  expect(component.newenquiryForm.value.gst).toEqual(expectedGST.toFixed(2));
});

it('should unsubscribe from observables and complete subject', () => {
  spyOn(component.ngUnsubscribe, 'next');
  spyOn(component.ngUnsubscribe, 'complete');

  component.ngOnDestroy();

  expect(component.ngUnsubscribe.next).toHaveBeenCalled();
  expect(component.ngUnsubscribe.complete).toHaveBeenCalled();
});


 
});
