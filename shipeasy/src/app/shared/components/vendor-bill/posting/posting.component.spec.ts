import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
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
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { LoaderService } from 'src/app/services/loader.service';
import { PostingComponent } from './posting.component';

 
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
  useExisting: forwardRef(() => PostingComponent),
  multi: true
};
 
describe('PostingComponent', () => {
  let component: PostingComponent;
  let fixture: ComponentFixture<PostingComponent>;
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
    mockProfilesService = jasmine.createSpyObj('ProfilesService', ['getUserDetails', 'getSmartAgentById']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList','getDashboardReport']);
 
    TestBed.configureTestingModule({
      declarations: [PostingComponent,MockTranslatePipe],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, MatAutocompleteModule, NzSelectModule, NzDatePickerModule, RouterTestingModule, HttpClientModule, RouterModule, BrowserAnimationsModule, ReactiveFormsModule, RouterModule],
      providers: [DatePipe, OrderByPipe,
        { provide: ApiService, useVale: mockApiService },
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
    fixture = TestBed.createComponent(PostingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
 
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate total amounts', () => {
    component.costItemList = [{ chargableAMT: 100, totalTAX: 10, totalAMT: 110 }];
    component.calculateTotal();
    expect(component.totalAmount).toBe(100);
    expect(component.taxAmount).toBe(10);
    expect(component.finalChargeTotal).toBe(110);
  });

  it('should add new TDS row', () => {
    const initialLength = component.tdsArray.length;
    component.addNewRow();
    expect(component.tdsArray.length).toBe(initialLength + 1);
  });

  it('should set TDS row values', () => {
    component.tdsList = [{ tdsId: '1', thresholdLimit: 100, tdsPer: 5 }];
    component.addNewRow();
    component.tdsArray.at(0).get('tdsNature').setValue('1');
    component.setTDSrow(0);
    expect(component.tdsArray.at(0).get('limit').value).toBe(100);
    expect(component.tdsArray.at(0).get('tdsPercent').value).toBe(5);
  });

  it('should initialize form on ngOnInit', () => {
    // Simulate ngOnInit lifecycle hook
    component.ngOnInit();
    // Assert that postingForm is initialized
    expect(component.postingForm).toBeDefined();
  });
  it('should initialize postingForm with expected form controls', () => {
    expect(component.postingForm.get('billDate')).toBeDefined();
    expect(component.postingForm.get('TXNDate')).toBeDefined();
    // Add expectations for other form controls
  });
  it('should update totalInvoice and enable/disable commissionPer control based on selectType', () => {
    // Set selectType to 'commission'
    component.postingForm.get('selectType').setValue('commission');
    component.postingForm.get('commissionPer').enable();
    component.postingForm.get('totalInvoice').disable();
  
    // Call commisionChange method
    component.commisionChange();
  
    expect(component.postingForm.get('commissionPer').enabled).toBeTruthy();
    expect(component.postingForm.get('totalInvoice').enabled).toBeFalsy();
    // Add more expectations as needed
  });
  it('should initialize postingForm with default values', () => {
    expect(component.postingForm.get('billDate').value).toBe('');
    expect(component.postingForm.get('TXNDate').value).toBe('');
    // Add expectations for other form controls and default values
  });
  it('should calculate total amount and tax amount correctly', () => {
    component.costItemList = [{ chargableAMT: 100, totalTAX: 10 }, { chargableAMT: 200, totalTAX: 20 }];
  
    component.calculateTotal();
  
    expect(component.totalAmount).toEqual(300);
    expect(component.taxAmount).toEqual(30);
  });
  it('should update totalInvoice and commissionPer control based on selectType', () => {
    component.postingForm.get('selectType').setValue('commission');
  
    component.commisionChange();
  
    expect(component.postingForm.get('commissionPer').enabled).toBeTruthy();
    expect(component.postingForm.get('totalInvoice').disabled).toBeTruthy();
    // Add more expectations as needed
  });
  it('should add a new row for TDS entries', () => {
    const initialLength = component.tdsArray.length;
  
    component.addNewRow();
  
    expect(component.tdsArray.length).toEqual(initialLength + 1);
    // Ensure the new row is added with default values if applicable
  });
             
  class MockCognitoService {
    getUserDatails() {
    }
  }
  class MockCommonFunctions {
    get() {
    }
    getAuthToken() {
    }
  }
  class commonService{
   getSTList(){}
   filterList(){}
  }

});
