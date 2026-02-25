import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormBuilder, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { of, throwError } from 'rxjs';
import { ApiService } from 'src/app/admin/principal/api.service';

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
import { DatePipe } from '@angular/common'; import { OrderByPipe } from 'src/app/shared/util/sort';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonService } from 'src/app/services/common/common.service';
// import { format } from 'path';

import { MatDrawer } from '@angular/material/sidenav';
import { NewDebitComponent } from './new-debit.component';
import { FilterPipe1 } from '../../route/route.component';


@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('NewDebitComponent', () => {
  let component: NewDebitComponent;
  let fixture: ComponentFixture<NewDebitComponent>;
  let mockNgbModal: jasmine.SpyObj<NgbModal>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockNotificationService: jasmine.SpyObj<NzNotificationService>;
  let mockMastersService: jasmine.SpyObj<MastersService>;
  let mockProfilesService: jasmine.SpyObj<ProfilesService>;
  let mockCognitoService: jasmine.SpyObj<CognitoService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let commonServiceSpy: jasmine.SpyObj<CommonService>;
  let formBuilder: FormBuilder;

  beforeEach(waitForAsync(() => {
    mockNgbModal = jasmine.createSpyObj('NgbModal', ['open']);
    mockApiService = jasmine.createSpyObj('ApiService', ['getSTList', 'addToST', 'UpdateToST', 'deleteST']);
    mockNotificationService = jasmine.createSpyObj('NzNotificationService', ['create']);
    mockMastersService = jasmine.createSpyObj('MastersService', ['getSTList']);
    mockProfilesService = jasmine.createSpyObj('ProfilesService', ['getUserDetails']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails','getagentDetails']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList', 'UpdateToST']);

    TestBed.configureTestingModule({
      declarations: [NewDebitComponent, MockTranslatePipe,FilterPipe1],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, NzSelectModule,NzDatePickerModule,RouterTestingModule,BrowserAnimationsModule ,HttpClientModule],
      providers: [DatePipe, OrderByPipe,
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
    formBuilder = new FormBuilder();
    fixture = TestBed.createComponent(NewDebitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create form with default values', () => {
    component.formBuild();

    const formValue = component.newCredit.value;

    expect(formValue.credit_note_no).toBe('');
    expect(formValue.credit_to).toBe('');
    expect(formValue.debit_from).toBe('');
    expect(formValue.currency).toBe('');
    // Add expectations for other form controls with default values
  });

  it('should create form with provided data', () => {
    const testData = {
      creditNoteNo: '123',
      debitToId: '456',
      // Add other data properties here
    };

    component.formBuild(testData);

    const formValue = component.newCredit.value;

    expect(formValue.credit_note_no).toBe(testData.creditNoteNo);
    expect(formValue.credit_to).toBe(testData.debitToId);
    // Add expectations for other form controls with provided data
  });

  it('should set "credit_to" control as required', () => {
    component.formBuild();

    const creditToControl = component.newCredit.get('credit_to');

    expect(creditToControl.hasError('required')).toBe(true);
  });

  it('should set "currency" control as required', () => {
    component.formBuild();

    const currencyControl = component.newCredit.get('currency');

    expect(currencyControl.hasError('required')).toBe(true);
  });

  it('should set "bank_name" control as required', () => {
    component.formBuild();

    const bankNameControl = component.newCredit.get('bank_name');

    expect(bankNameControl.hasError('required')).toBe(true);
  });

  it('should set "payment_mode" control as required', () => {
    component.formBuild();

    const paymentModeControl = component.newCredit.get('payment_mode');

    expect(paymentModeControl.hasError('required')).toBe(true);
  });

  it('should set "payment_ref_no" control as required', () => {
    component.formBuild();

    const paymentRefNoControl = component.newCredit.get('payment_ref_no');

    expect(paymentRefNoControl.hasError('required')).toBe(true);
  });

  it('should set "batch_no" control as required', () => {
    component.formBuild();

    const batchNoControl = component.newCredit.get('batch_no');

    expect(batchNoControl.hasError('required')).toBe(true);
  });

  it('should set "invoiceNo" control as required', () => {
    component.formBuild();

    const invoiceNoControl = component.newCredit.get('invoiceNo');

    expect(invoiceNoControl.hasError('required')).toBe(true);
  });

  it('should generate creditFromToArray for vendor type', () => {
    const mockData = [
      { vendorId: 1, VendorName: 'Vendor1' },
      { vendorId: 2, VendorName: 'Vendor2' },
    ];

    component.FromToCreditArrayGenerator('vendor', mockData);

    expect(component.creditFromToArray).toEqual([
      { invoiceId: 1, invoiceFromName: 'Vendor1' },
      { invoiceId: 2, invoiceFromName: 'Vendor2' },
    ]);
  });

  it('should generate creditFromToArray for principal type and isSmartAgentUser is true', () => {
    component.isSmartAgentUser = true;
    const mockData = [
      { addressId: 1, principalName: 'Principal1' },
      { addressId: 2, principalName: 'Principal2' },
    ];

    component.FromToCreditArrayGenerator('principal', mockData);

    expect(component.creditFromToArray).toEqual([
      { invoiceId: 1, invoiceFromName: 'Principal1' },
      { invoiceId: 2, invoiceFromName: 'Principal2' },
    ]);
  });

  it('should not generate creditFromToArray for principal type when isSmartAgentUser is false', () => {
    component.isSmartAgentUser = false;
    const mockData = [
      { addressId: 1, principalName: 'Principal1' },
      { addressId: 2, principalName: 'Principal2' },
    ];

    component.FromToCreditArrayGenerator('principal', mockData);

    expect(component.creditFromToArray).toEqual([]);
  });


  it('should set selectedBank to undefined if bank_name does not match any bank in the bankList', () => {
    const mockBankList = [
      { bankId: 1, bankName: 'Bank1' },
      { bankId: 2, bankName: 'Bank2' },
    ];
    component.bankList = mockBankList;
    component.newCredit.get('bank_name').setValue(3); // Bank ID that doesn't exist

    component.onBankChange();

    expect(component.selectedBank).toBeUndefined();
  });

  it('should set selectedCreditTo to undefined if credit_to does not match any invoiceId in the creditFromToArray', () => {
    const mockCreditFromToArray = [
      { invoiceId: 1, invoiceFromName: 'Vendor1' },
      { invoiceId: 2, invoiceFromName: 'Vendor2' },
    ];
    component.creditFromToArray = mockCreditFromToArray;
    component.newCredit.get('credit_to').setValue(3); // Invoice ID that doesn't exist

    component.onCreditToChange();

    expect(component.selectedCreditTo).toBeUndefined();
  });

  it('should set submitted to true when onSave is called', () => {
    component.onSave();

    expect(component.submitted).toBe(true);
  });

 

  
});
