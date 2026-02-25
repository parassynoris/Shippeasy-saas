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
import { NewInvoiceComponent } from './new-invoice.component';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


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
  useExisting: forwardRef(() => NewInvoiceComponent),
  multi: true
};

describe('NewInvoiceComponent', () => {
  let component: NewInvoiceComponent;
  let fixture: ComponentFixture<NewInvoiceComponent>;
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
      declarations: [NewInvoiceComponent, MockTranslatePipe,],
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
    fixture = TestBed.createComponent(NewInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should convert date correctly', () => {
    const inputDate = '2024-04-11'; // Example input date
    const expectedOutput = '11-04-2024'; // Expected output date format
  
    const convertedDate = component.convertDate(inputDate);
  
    expect(convertedDate).toEqual(expectedOutput);
  });


  it('should set vendor correctly', () => {
    const mockVendorId = '1234'; // Example vendor ID
    const mockPartyList = [{ tax_number: mockVendorId }]; // Mock party list with the vendor ID
    component.partyMasterList = mockPartyList; // Set the component's party master list
    
    component.setVendor(mockVendorId);
    
    expect(component.editinvoiceForm.value.bill_to).toEqual(mockVendorId);
  });

  it('should convert date string to formatted date', () => {
    const dateString = '2024-04-11';
    const formattedDate = component.convertDate(dateString);
    expect(formattedDate).toBe('11-04-2024');
  });

  it('should set bill_to value when vendor is selected', () => {
    component.partyMasterList = [
      { tax_number: '1234', name: 'Vendor 1' },
      { tax_number: '5678', name: 'Vendor 2' }
    ];
  
    component.setVendor('1234');
  
    expect(component.editinvoiceForm.value.bill_to).toBe('1234');
  });

  it('should require batch number selection', () => {
    component.editinvoiceForm.get('batchNo').setValue('');
  
    expect(component.editinvoiceForm.get('batchNo').hasError('required')).toBeTruthy();
  });

  it('should require bank selection', () => {
    component.editinvoiceForm.get('bank').setValue('');
  
    expect(component.editinvoiceForm.get('bank').hasError('required')).toBeTruthy();
  });

  it('should require invoice date to be selected', () => {
    component.editinvoiceForm.get('invoice_date').setValue('');
  
    expect(component.editinvoiceForm.get('invoice_date').hasError('required')).toBeTruthy();
  });

  it('should require invoice type selection', () => {
    component.editinvoiceForm.get('invoice_type').setValue('');
  
    expect(component.editinvoiceForm.get('invoice_type').hasError('required')).toBeTruthy();
  });
  
  it('should require invoice date to be selected', () => {
    component.editinvoiceForm.get('invoice_date').setValue('');
  
    expect(component.editinvoiceForm.get('invoice_date').hasError('required')).toBeTruthy();
  });
  
  
  
  
 
});
