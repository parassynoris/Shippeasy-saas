import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
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
import { AddBillComponent } from './add-bill.component';
// import { format } from 'path';

@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('AddBillComponent', () => {
  let component: AddBillComponent;
  let fixture: ComponentFixture<AddBillComponent>;
  let mockNgbModal: jasmine.SpyObj<NgbModal>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockNotificationService: jasmine.SpyObj<NzNotificationService>;
  let mockMastersService: jasmine.SpyObj<MastersService>;
  let mockProfilesService: jasmine.SpyObj<ProfilesService>;
  let mockCognitoService: jasmine.SpyObj<CognitoService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let commonServiceSpy: jasmine.SpyObj<CommonService>;
  beforeEach(waitForAsync(() => {
    mockNgbModal = jasmine.createSpyObj('NgbModal', ['open']);
    mockApiService = jasmine.createSpyObj('ApiService', ['getSTList', 'addToST', 'UpdateToST', 'deleteST']);
    mockNotificationService = jasmine.createSpyObj('NzNotificationService', ['create']);
    mockMastersService = jasmine.createSpyObj('MastersService', ['getSTList']);
    mockProfilesService = jasmine.createSpyObj('ProfilesService', ['getUserDetails']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails','getagentDetails']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList', 'UpdateToST']);

    TestBed.configureTestingModule({
      declarations: [AddBillComponent, MockTranslatePipe],
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
    fixture = TestBed.createComponent(AddBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open a modal with the correct options', () => {
    // Arrange
    const modalService = TestBed.inject(NgbModal);
    const Deletetable = 'your-modal-content'; // Replace with your actual modal content
  
    // Act
    component.deletetable(Deletetable);
  
    // Assert
    expect(modalService.open).toHaveBeenCalledWith(Deletetable, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'sm',
      ariaLabelledBy: 'modal-basic-title'
    });
  });

  it('should delete the specified container from allInvoicesData array', () => {
    const mockContainer = { id: 1, /* other properties */ };

    component.deleteContainer(mockContainer);

    expect(component.allInvoicesData).not.toContain(mockContainer);
  });

  it('should handle undefined or null container parameter gracefully', () => {
    const initialDataLength = component.allInvoicesData.length;

    component.deleteContainer(null);

    expect(component.allInvoicesData.length).toBe(initialDataLength);
    // Add expectations based on your actual logic for handling null or undefined parameters
  });

 
  it('should handle undefined or null date parameter gracefully', () => {
    const result = component.convertDate(null);

    // Add expectations based on your actual logic for handling null or undefined parameters
  });



  it('should handle undefined or null event data gracefully', () => {
    spyOn(component.CloseInvoiceSection, 'emit');

    component.onCloseInvoice(null);

    expect(component.CloseInvoiceSection.emit).toHaveBeenCalledWith(null);
    // Add expectations based on your actual logic for handling null or undefined parameters
  });

  it('should set the bankDetail property based on the provided value', () => {
    const mockBankList = [
      { bankId: 1, bankName: 'BankA', /* other properties */ },
      { bankId: 2, bankName: 'BankB', /* other properties */ },
      // Add more mock data as needed
    ];

    component.bankList = mockBankList;

    const selectedBankId = 2; // Replace with the bankId you want to test

    component.bankDetails(selectedBankId);

    const expectedBankDetail = mockBankList.find(bank => bank.bankId === selectedBankId);

    expect(component.bankDetail).toEqual(expectedBankDetail);
  });

  it('should handle undefined or null value gracefully', () => {
    component.bankList = [
      { bankId: 1, bankName: 'BankA', /* other properties */ },
      { bankId: 2, bankName: 'BankB', /* other properties */ },
    ];

    component.bankDetails(null);

    expect(component.bankDetail).toBeUndefined();
    // Add expectations based on your actual logic for handling null or undefined parameters
  });

  it('should delete the specified charge from costItemList', () => {
    // Arrange
    const testData = {
      // Provide test data that you want to delete
    };
  
    component.costItemList = [
      // Initialize costItemList with test data
      // Ensure that testData is present in the array
    ];
  
    // Act
    component.deleteCharge(testData);
  
    // Assert
    expect(component.costItemList).not.toContain(testData);
    // Ensure the specified charge is removed from costItemList
  });

  
  it('should return true if the input contains "reimbursement" or "reimbursable"', () => {
    // Arrange & Act
    const result1 = component.checkTest('This is a Reimbursement example');
    const result2 = component.checkTest('This is a reimbursable example');
    const result3 = component.checkTest('This is not a valid example');

    // Assert
    expect(result1).toBe(true);
    expect(result2).toBe(true);
    expect(result3).toBe(false);
  });

  
  it('should set billdue_date based on payment_terms when payment_terms is a valid number', () => {
    // Arrange
    const paymentTermsValue = 7; // Update with a valid payment_terms value
    component.editinvoiceForm.controls.payment_terms.setValue(paymentTermsValue);

    // Act
    component.paymentValue(); 

    // Assert
    const expectedDueDate = new Date(Date.now() + paymentTermsValue * 24 * 60 * 60 * 1000);
    expect(component.editinvoiceForm.controls.billdue_date.value).toEqual(expectedDueDate);
  });


});