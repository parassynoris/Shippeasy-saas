import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { Pipe, PipeTransform } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import * as XLSX from "xlsx";
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common'; import { OrderByPipe } from 'src/app/shared/util/sort';
import { PrincipleBillComponent } from './principle-bill.component';
// import { format } from 'path';
import { By } from 'protractor';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';

@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('PrincipleBillComponent', () => {
  let component: PrincipleBillComponent;
  let fixture: ComponentFixture<PrincipleBillComponent>;
  let mockNgbModal: jasmine.SpyObj<NgbModal>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockNotificationService: jasmine.SpyObj<NzNotificationService>;
  let mockMastersService: jasmine.SpyObj<MastersService>;
  let mockProfilesService: jasmine.SpyObj<ProfilesService>;
  let mockCognitoService: jasmine.SpyObj<CognitoService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let modalService: NgbModal;
  

  beforeEach(waitForAsync(() => {
    mockNgbModal = jasmine.createSpyObj('NgbModal', ['open']);
    mockApiService = jasmine.createSpyObj('ApiService', ['getSTList', 'addToST', 'UpdateToST', 'deleteST']);
    mockNotificationService = jasmine.createSpyObj('NzNotificationService', ['create']);
    mockMastersService = jasmine.createSpyObj('MastersService', ['getSTList']);
    mockProfilesService = jasmine.createSpyObj('ProfilesService', ['getUserDetails']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails','getagentDetails']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList', 'UpdateToST']);

    TestBed.configureTestingModule({
      declarations: [PrincipleBillComponent, MockTranslatePipe],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientModule],
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
    fixture = TestBed.createComponent(PrincipleBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getSTList on ngOnInit', () => {
   
    const getSTListSpy = mockApiService.getSTList.and.returnValue(of(/* mock your data here */));
    component.ngOnInit();
    expect(getSTListSpy).toHaveBeenCalled();
  
  });

  it('should add invoice to selectedPrincipleBills on checkbox checked', () => {
    const mockEvent = { target: { checked: true, value: 'invoice123' } };
    component.onSelectCheckBoxBills(mockEvent);
    expect(component.selectedPrincipleBills).toContain('invoice123');
  });

  it('should remove invoice from selectedPrincipleBills on checkbox unchecked', () => {
    // Assuming that 'invoice123' is initially added to selectedPrincipleBills
    component.selectedPrincipleBills = ['invoice123'];
    
    const mockEvent = { target: { checked: false, value: 'invoice123' } };
    component.onSelectCheckBoxBills(mockEvent);
    expect(component.selectedPrincipleBills).not.toContain('invoice123');
  });

  it('should handle pagination correctly on next', () => {
    spyOn(component, 'getPaginationData');
    component.toalLength = 10;
    component.count = 5;
    component.next();
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });

  it('should handle pagination correctly on prev', () => {
    spyOn(component, 'getPaginationData');
    component.page = 2;
    component.prev();
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should handle filter and call getInvoiceList', () => {
    spyOn(component, 'getInvoiceList');
    const mockEvent = { target: { value: '10' } };
    component.filter(mockEvent);
    
    expect(component.fromSize).toEqual(1);
    expect(component.getInvoiceList).toHaveBeenCalled();
  });

 
  it('should clear search filters successfully', () => {
    component.creditNote = 'Credit Note';
    component.invoice_no = '123';
    component.invoice_date = '2022-01-01';
    
    // Call the clear function
    component.clear();
    
    // Assert on the expected changes or behaviors
    expect(component.creditNote).toBe('');
    expect(component.invoice_no).toBe('');
    expect(component.invoice_date).toBe('');
    // Add more assertions based on your specific logic
  });

  it('should select and deselect checkboxes successfully', () => {
    const event = { target: { checked: true, value: 'invoiceId123' } };
    component.onSelectCheckBoxBills(event);
    expect(component.selectedPrincipleBills).toContain('invoiceId123');

    // Deselect the checkbox
    event.target.checked = false;
    component.onSelectCheckBoxBills(event);
    expect(component.selectedPrincipleBills).not.toContain('invoiceId123');
  });

  it('should generate a random number with correct format', () => {
    const randomNumber = component.getRandomNumber();
    expect(randomNumber).toMatch(/^\d{5}$/); // Should match the format 5 digits
  });

  it('should clear global search and invoke clear function', () => {
    // Arrange
    component.globalSearch = 'search query';
    spyOn(component, 'clear');
  
    // Act
    component.clearGloble();
  
    // Assert
    // Verify that globalSearch is cleared
    expect(component.globalSearch).toBe('');
    // Verify that the clear function is invoked
    expect(component.clear).toHaveBeenCalled();
    // Additional expectations based on your specific logic
  });

  it('should clear all properties and call getInvoiceList', () => {
    // Arrange
    component.creditNote = 'sampleCreditNote';
    component.invoice_no = 'sampleInvoiceNo';
    component.invoice_date = '2022-03-07T12:34:56.789Z';
    component.invoice_duedate = '2022-03-14T12:34:56.789Z';
    component.invoice_to = 'sampleInvoiceTo';
    component.payment_terms = 'samplePaymentTerms';
    component.amount = 'sampleAmount';
    component.invoice_type = 'sampleInvoiceType';
    component.invoiceStatus = 'sampleInvoiceStatus';
    component.status = 'sampleStatus';

    spyOn(component, 'getInvoiceList'); // Spy on the getInvoiceList method

    // Act
    component.clear();

    // Assert
    expect(component.creditNote).toBe('');
    expect(component.invoice_no).toBe('');
    expect(component.invoice_date).toBe('');
    expect(component.invoice_duedate).toBe('');
    expect(component.invoice_to).toBe('');
    expect(component.payment_terms).toBe('');
    expect(component.amount).toBe('');
    expect(component.invoice_type).toBe('');
    expect(component.invoiceStatus).toBe('');
    expect(component.status).toBe('');
    expect(component.getInvoiceList).toHaveBeenCalled();
  });
 
  
});
