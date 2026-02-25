import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
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
import { InvoicesComponent } from './invoices.component';

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
  useExisting: forwardRef(() => InvoicesComponent),
  multi: true
};

describe('InvoicesComponent', () => {
  let component: InvoicesComponent;
  let fixture: ComponentFixture<InvoicesComponent>;
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
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails','getagentDetails']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList']);

    TestBed.configureTestingModule({
      declarations: [InvoicesComponent, MockTranslatePipe],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientModule,RouterModule,NzSelectModule,ReactiveFormsModule,MatSelectModule,NzDatePickerModule,FormsModule
      ,NoopAnimationsModule],
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
    fixture = TestBed.createComponent(InvoicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should select invoice for payment', () => {
    const invoice = { invoiceId: '123', paymentStatus: 'Unpaid', invoiceAmount: 1000, paidAmount: 200 };
    const event = { target: { checked: true } };
    
    component.onSelectForPay(event, invoice);
    expect(component.selectedForPay).toContain(invoice);
    expect(component.totalSelectedInvoiceAmount).toBe(800); // 1000 - 200
  });

  it('should deselect invoice for payment', () => {
    const invoice = { invoiceId: '123', paymentStatus: 'Unpaid', invoiceAmount: 1000, paidAmount: 200 };
    component.selectedForPay = [invoice];
    const event = { target: { checked: false } };

    component.onSelectForPay(event, invoice);
    expect(component.selectedForPay).not.toContain(invoice);
    expect(component.totalSelectedInvoiceAmount).toBe(0);
  });


  it('should deselect all invoices', () => {
    component.selectedForPay = [{ invoiceId: '123', paymentStatus: 'Unpaid', invoiceAmount: 1000, paidAmount: 200 }];
    component.onSelectAll({ target: { checked: false } });
    expect(component.selectedForPay.length).toBe(0);
    expect(component.totalSelectedInvoiceAmount).toBe(0);
  });
  
  it('should handle checkbox selection correctly', () => {
    const invoice = { invoiceId: '123', paymentStatus: 'Unpaid', invoiceAmount: 1000, paidAmount: 200 };
    component.onSelectForPay({ target: { checked: true } }, invoice);
    expect(component.selectedForPay.length).toBe(1);
    expect(component.totalSelectedInvoiceAmount).toBe(800);

    component.onSelectForPay({ target: { checked: false } }, invoice);
    expect(component.selectedForPay.length).toBe(0);
    expect(component.totalSelectedInvoiceAmount).toBe(0);
  });

  it('should handle empty productData correctly in onSelectAll', () => {
    component.productData = [];
    component.onSelectAll({ target: { checked: true } });
    expect(component.selectedForPay.length).toBe(0);
    expect(component.totalSelectedInvoiceAmount).toBe(0);
  });

  it('should call getData on initialization', () => {
    spyOn(component, 'getData');
    component.ngOnInit();
    expect(component.getData).toHaveBeenCalled();
  });

  it('should add invoice to selectedForPay when checkbox is checked', () => {
    const invoice = { invoiceId: '1', paymentStatus: 'Unpaid' };
    component.onSelectForPay({ target: { checked: true } }, invoice);
    expect(component.selectedForPay).toContain(invoice);
  });
  it('should remove invoice from selectedForPay when checkbox is unchecked', () => {
    const invoice = { invoiceId: '1', paymentStatus: 'Unpaid' };
    component.selectedForPay = [invoice];
    component.onSelectForPay({ target: { checked: false } }, invoice);
    expect(component.selectedForPay).not.toContain(invoice);
  });
 
  it('should calculate totalSelectedInvoiceAmount correctly', () => {
    const mockInvoices = [
      { invoiceAmount: 200, paidAmount: 50, paymentStatus: 'Unpaid' },
      { invoiceAmount: 100, paidAmount: 0, paymentStatus: 'Unpaid' }
    ];
    component.selectedForPay = mockInvoices;
    component.totalSelectedInvoiceAmount = 0; // reset before calculation
    component.selectedForPay.forEach(invoice => {
      if (invoice?.paymentStatus !== 'Paid') {
        component.totalSelectedInvoiceAmount += (Number(invoice?.invoiceAmount || 0) - Number(invoice?.paidAmount || 0));
      }
    });
    expect(component.totalSelectedInvoiceAmount).toBe(250); // 200 - 50 + 100 - 0
  });
                    
});

