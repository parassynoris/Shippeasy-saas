import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormBuilder, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule,Validators  } from '@angular/forms';
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
import { MatTableDataSource } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator } from '@angular/material/paginator';
import { NewCreditComponent } from './new-credit.component';
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

describe('NewCreditComponent', () => {
  let component: NewCreditComponent;
  let fixture: ComponentFixture<NewCreditComponent>;
  let mockNgbModal: jasmine.SpyObj<NgbModal>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockNotificationService: jasmine.SpyObj<NzNotificationService>;
  let mockMastersService: jasmine.SpyObj<MastersService>;
  let mockProfilesService: jasmine.SpyObj<ProfilesService>;
  let mockCognitoService: jasmine.SpyObj<CognitoService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let commonServiceSpy: jasmine.SpyObj<CommonService>;
  let formBuilder: FormBuilder;
  let dataSource: MatTableDataSource<any>
  beforeEach(waitForAsync(() => {
    mockNgbModal = jasmine.createSpyObj('NgbModal', ['open']);
    mockApiService = jasmine.createSpyObj('ApiService', ['getSTList', 'addToST', 'UpdateToST', 'deleteST']);
    mockNotificationService = jasmine.createSpyObj('NzNotificationService', ['create']);
    mockMastersService = jasmine.createSpyObj('MastersService', ['getSTList']);
    mockProfilesService = jasmine.createSpyObj('ProfilesService', ['getUserDetails']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails','getagentDetails']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList', 'UpdateToST']);

    TestBed.configureTestingModule({
      declarations: [NewCreditComponent, MockTranslatePipe,FilterPipe1],
      imports: [NgbModule,MatInputModule, ReactiveFormsModule, FormsModule, NzSelectModule,NzDatePickerModule,RouterTestingModule,BrowserAnimationsModule ,HttpClientModule],
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
    fixture = TestBed.createComponent(NewCreditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create a form with default values when no data is provided', () => {
    component.formBuild();

    const form = component.newCredit;

    expect(form.get('credit_note_no').value).toEqual('');
    expect(form.get('credit_to').value).toEqual('');
    // Add similar expectations for other form controls with their default values
  });

  it('should create a form with provided data', () => {
    const testData = {
      creditNoteNo: '123',
      creditToId: 'credit_to_id',
      currency: 'USD',
      // Add other data properties for the form
    };

    component.formBuild(testData);

    const form = component.newCredit;

    expect(form.get('credit_note_no').value).toEqual(testData.creditNoteNo);
    expect(form.get('credit_to').value).toEqual(testData.creditToId);
    // Add similar expectations for other form controls with their corresponding data values
  });

  it('should set required validator for certain form controls', () => {
    component.formBuild();

    const form = component.newCredit;

    expect(form.get('credit_to').validator).toEqual(Validators.required);
    expect(form.get('currency').validator).toEqual(Validators.required);
    expect(form.get('bank_name').validator).toEqual(Validators.required);
    expect(form.get('payment_mode').validator).toEqual(Validators.required);
    expect(form.get('batch_no').validator).toEqual(Validators.required);
    expect(form.get('invoiceNo').validator).toEqual(Validators.required);
    expect(form.get('reason').validator).toEqual(Validators.required);
  });
  

  it('should disable newCredit if isType is "show"', () => {
    // Arrange
    component.isType = 'show';

    // Act
    component.ngOnInit();

    // Assert
    expect(component.newCredit.disabled).toBeTruthy();
  });


  it('should call getBatchList', () => {
    // Arrange
    spyOn(component, 'getBatchList');

    // Act
    component.ngOnInit();

    // Assert
    expect(component.getBatchList).toHaveBeenCalled();
  });

  it('should set isSmartAgentUser to false', () => {
    // Act
    component.ngOnInit();

    // Assert
    expect(component.isSmartAgentUser).toBeFalsy();
  });

  it('should call getPartyList', () => {
    // Arrange
    spyOn(component, 'getPartyList');

    // Act
    component.ngOnInit();

    // Assert
    expect(component.getPartyList).toHaveBeenCalled();
  });

  it('should call getBankList', () => {
    // Arrange
    spyOn(component, 'getBankList');

    // Act
    component.ngOnInit();

    // Assert
    expect(component.getBankList).toHaveBeenCalled();
  });

  it('should call getpaymentMode', () => {
    // Arrange
    spyOn(component, 'getpaymentMode');

    // Act
    component.ngOnInit();

    // Assert
    expect(component.getpaymentMode).toHaveBeenCalled();
  });

  it('should call getCurrencyDropDowns', () => {
    // Arrange
    spyOn(component, 'getCurrencyDropDowns');

    // Act
    component.ngOnInit();

    // Assert
    expect(component.getCurrencyDropDowns).toHaveBeenCalled();
  });

  it('should call getCreditNote if urlParam.id is present', () => {
    // Arrange
    component.urlParam = { id: 'sampleId' };
    spyOn(component, 'getCreditNote');

    // Act
    component.ngOnInit();

    // Assert
    expect(component.getCreditNote).toHaveBeenCalledWith('sampleId');
  });
  
  it('should set the file property when selectFile is called', () => {
    // Arrange
    const fakeEvent = {
      target: {
        files: [{ name: 'fakeFile.txt' }] // You can customize this to simulate a file
      }
    } as any;

    // Act
    component.selectFile(fakeEvent);

    // Assert
    expect(component.file).toEqual(fakeEvent.target.files[0]);
  });

  it('should set selectedInvoice and update form controls when getChargeDetails is called with a valid id', () => {
    // Arrange
    const fakeId = 'sampleId';
    component.batchInvoiceList = [
      { invoiceId: 'sampleId', invoiceToId: 'samplePartyId', costItems: [{}, {}] },
      { invoiceId: 'otherId', invoiceToId: 'otherPartyId', costItems: [{}, {}] }
    ];

    // Act
    component.getChargeDetails(fakeId);

    // Assert
    expect(component.selectedInvoice).toEqual(component.batchInvoiceList[0]);
    expect(component.newCredit.controls.invoiceParty.value).toBe('samplePartyId');
    expect(component.newCredit.controls.credit_to.value).toBe('samplePartyId');
    // Add more assertions as needed
  });


  it('should calculate zero total refund amount when no items are selected', () => {
    // Arrange
    component.chargeItemList.forEach(item => item.isRefundSelected = false);

    // Act
    const totalAmount = component.calTotal();

    // Assert
    expect(totalAmount).toBe(0);
  });

  it('should set totalTaxAmt to zero if all items have excludeGst as true', () => {
    // Arrange
    spyOn(component, 'calTotalTax').and.returnValue(8); // Mock calTotalTax function
    component.chargeItemList.forEach(item => item.excludeGst = true);

    // Act
    component.calcuTaxAmt();

    // Assert
    expect(component.totalTaxAmt).toBe(0);
  });

  it('should set totalTotAmt to zero if chargeItemList is empty', () => {
    // Arrange
    component.chargeItemList = [];

    // Act
    component.calcTotalAmt();

    // Assert
    expect(component.totalTotAmt).toBe(0);
  });

  
  it('should set invoiceNo control with the provided item invoiceId', () => {
    // Arrange
    const fakeItem = { invoiceId: 'sampleInvoiceId' };

    // Act
    component.setVendor(fakeItem);

    // Assert
    expect(component.newCredit.controls.invoiceNo.value).toBe('sampleInvoiceId');
  });

  it('should set invoiceNo control to an empty string if the provided item is null', () => {
    // Act
    component.setVendor(null);

    // Assert
    expect(component.newCredit.controls.invoiceNo.value).toBe('');
  });

  it('should set invoiceNo control to an empty string if the provided item invoiceId is null', () => {
    // Arrange
    const fakeItem = { invoiceId: null };

    // Act
    component.setVendor(fakeItem);

    // Assert
    expect(component.newCredit.controls.invoiceNo.value).toBe('');
  });


  
  it('should set reason control with the provided item name', () => {
    // Arrange
    const fakeItem = { name: 'sampleReason' };

    // Act
    component.setReason(fakeItem);

    // Assert
    expect(component.newCredit.controls.reason.value).toBe('sampleReason');
  });

  it('should set reason control to an empty string if the provided item is null', () => {
    // Act
    component.setReason(null);

    // Assert
    expect(component.newCredit.controls.reason.value).toBe('');
  });

  it('should set reason control to an empty string if the provided item name is null', () => {
    // Arrange
    const fakeItem = { name: null };

    // Act
    component.setReason(fakeItem);

    // Assert
    expect(component.newCredit.controls.reason.value).toBe('');
  });

});
