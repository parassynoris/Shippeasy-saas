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
import { MastersSortPipe } from 'src/app/shared/util/mastersort';
import { AddCustomerGstComponent } from './add-customer-gst.component';



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
  useExisting: forwardRef(() => AddCustomerGstComponent),
  multi: true
};

describe('AddCustomerGstComponent', () => {
  let component: AddCustomerGstComponent;
  let fixture: ComponentFixture<AddCustomerGstComponent>;
  let mockNgbModal: jasmine.SpyObj<NgbModal>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockNotificationService: jasmine.SpyObj<NzNotificationService>;
  let mockMastersService: jasmine.SpyObj<MastersService>;
  let mockProfilesService: jasmine.SpyObj<ProfilesService>;
  let mockCognitoService: jasmine.SpyObj<CognitoService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockSaMasterService: jasmine.SpyObj<SaMasterService>
  
    beforeEach(waitForAsync(() => {
    mockNgbModal = jasmine.createSpyObj('NgbModal', ['open']);
    mockApiService = jasmine.createSpyObj('ApiService', ['getSTList', 'addToST', 'UpdateToST', 'deleteST','getListByURL']);
    mockNotificationService = jasmine.createSpyObj('NzNotificationService', ['create']);
    mockMastersService = jasmine.createSpyObj('MastersService', ['getSTList','cityList']);
    mockProfilesService = jasmine.createSpyObj('ProfilesService', ['getUserDetails']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails','getModule','getagentDetails']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList']);
    mockSaMasterService = jasmine.createSpyObj('SaMasterService', ['cityList']);
    TestBed.configureTestingModule({
      declarations: [AddCustomerGstComponent, MockTranslatePipe,],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientModule,RouterModule,ReactiveFormsModule,RouterModule,TranslateModule.forRoot(),NzSelectModule,NzDatePickerModule,BrowserAnimationsModule],
      providers: [DatePipe, OrderByPipe,TranslateService,MastersSortPipe,
        { provide: NgbModal, useValue: mockNgbModal },CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR,

        { provide: ApiService, useValue: mockApiService },
        { provide: NzNotificationService, useValue: mockNotificationService },
        { provide: MastersService, useValue: mockMastersService },
        { provide: ProfilesService, useValue: mockProfilesService },
        { provide: SaMasterService, useValue: mockSaMasterService },
        { provide: CognitoService, useValue: mockCognitoService },
        { provide: CommonService, useValue: mockCommonService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCustomerGstComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form correctly', () => {
    expect(component.customerGSTForm).toBeDefined();
    expect(component.customerGSTForm.controls['gstCustomerName']).toBeDefined();
    expect(component.customerGSTForm.controls['panNo']).toBeDefined();
    // Add more expectations for other form controls as needed
  });

  it('should initialize form with default values', () => {
    expect(component.customerGSTForm.value).toEqual({
      gstCustomerName: '',
      panNo: '',
      groupCustomer: false,
      mappingCustomerId: '',
      gstNo: '',
      state: '',
      pinCode: '',
      placeAddress: '',
      plantName: '',
      status: true,
      isSez: ''
    });
  });

  it('should close modal and emit event', () => {
    spyOn(component.CloseAction, 'emit');
    component.onClose('close');
    expect(component.CloseAction.emit).toHaveBeenCalledWith('close');
    // You might want to test if location.back() is called as well
  });
 
  it('should mark form as submitted on save', () => {
    component.onSave();
    expect(component.submitted).toBeTrue();
  });

  it('should find invalid controls', () => {
    component.customerGSTForm.patchValue({
      gstCustomerName: '',
      panNo: '123456',
      gstNo: '',
      state: 'ABC',
      pinCode: ''
    });
    const invalidControls = component.findInvalidControls();
    expect(invalidControls).toContain('gstCustomerName');
    expect(invalidControls).toContain('gstNo');
    expect(invalidControls).toContain('pinCode');
  });

  it('should call getProductById if in edit mode', () => {
    component.isEditMode = true;
    spyOn(component, 'getProductById');
    component.ngOnInit();
    expect(component.getProductById).toHaveBeenCalled();
  });

  it('should call getPartyMaster on initialization', () => {
    spyOn(component, 'getPartyMaster');
    component.ngOnInit();
    expect(component.getPartyMaster).toHaveBeenCalled();
  });

  it('should delete document from documentPayload', () => {
    component.documentPayload = [
      { docname: 'doc1', docurl: 'url1' },
      { docname: 'doc2', docurl: 'url2' }
    ];
    const docToDelete = { docname: 'doc1', docurl: 'url1' };
    component.deleteFile(docToDelete);
    expect(component.documentPayload.length).toEqual(1);
    expect(component.documentPayload[0].docname).not.toEqual('doc1');
  });

  
});
