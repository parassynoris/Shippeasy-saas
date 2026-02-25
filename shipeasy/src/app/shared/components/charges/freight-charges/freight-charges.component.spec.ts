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
import { FreightChargesComponent } from './freight-charges.component';

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
  useExisting: forwardRef(() => FreightChargesComponent),
  multi: true
};

describe('FreightChargesComponent', () => {
  let component: FreightChargesComponent;
  let fixture: ComponentFixture<FreightChargesComponent>;
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
    mockMastersService = jasmine.createSpyObj('MastersService', ['getSTList','cityList','systemtypeList']);
    mockProfilesService = jasmine.createSpyObj('ProfilesService', ['getUserDetails','getCurrentAgentDetails']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails','getModule','getagentDetails']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList','getListByURL']);
    mockSaMasterService = jasmine.createSpyObj('SaMasterService', ['cityList']);
    TestBed.configureTestingModule({
      declarations: [FreightChargesComponent, MockTranslatePipe,],
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
    fixture = TestBed.createComponent(FreightChargesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate chargeName field', () => {
    component.newenquiryForm.controls['chargeName'].setValue(''); // Set invalid value
    expect(component.newenquiryForm.controls['chargeName'].valid).toBeFalsy();
  });

  it('should emit correct data when FreightChargedData event is triggered', () => {
    const mockData = /* mock data */
    spyOn(component.FreightChargedData, 'emit');
    component.FreightChargedData.emit(mockData);
    expect(component.FreightChargedData.emit).toHaveBeenCalledWith(mockData);
  });

  it('should calculate JMB amount correctly', () => {
    component.newenquiryForm.controls['stcAmount'].setValue(100);
    component.changeJMB();
    expect(component.newenquiryForm.controls['jmbAmount'].value).toEqual(100);
  });

  it('should initialize form with default values', () => {
    component.formBuild();
    expect(component.newenquiryForm).toBeDefined();
    expect(component.newenquiryForm.controls.chargeName.value).toEqual(component.defaultCharge);
    expect(component.newenquiryForm.controls.currency.value).toEqual(component.defaultCurrency);
  });
  
  it('should initialize form with default values', () => {
    expect(component.newenquiryForm.controls.chargeGroup.value).toBe('');
    expect(component.newenquiryForm.controls.chargeName.value).toBe(component.defaultCharge);
    expect(component.newenquiryForm.controls.currency.value).toBe(component.defaultCurrency);
  });

  it('should open modal and set form for editing', () => {
    const mockModalRef = { result: Promise.resolve('save') };
    mockNgbModal.open.and.returnValue(mockModalRef as any);
    const mockRow = { costItemId: '1', quantity: '10' };
    component.onOpen('freightModal', mockRow);
    expect(mockNgbModal.open).toHaveBeenCalled();
    expect(component.newenquiryForm.controls.quantity.value).toBe('10');
  });

  it('should close modal on calling closePopUp', () => {
    component.modalReference = { close: jasmine.createSpy('close') } as any;
    component.closePopUp();
    expect(component.modalReference.close).toHaveBeenCalled();
    expect(component.submitted).toBeFalse();
  });

  it('should calculate total amount correctly on calcuTotal', () => {
    component.newenquiryForm.controls.quantity.setValue('2');
    component.newenquiryForm.controls.rate.setValue('5');
    component.calcuTotal(null);
    expect(component.newenquiryForm.controls.amount.value).toBe('10.00');
  });

  it('should calculate GST and total amount correctly on calcuGST', () => {
    component.newenquiryForm.controls.stcAmount.setValue('100');
    component.newenquiryForm.controls.gstPercentage.setValue('5');
    component.calcuGST();
    expect(component.newenquiryForm.controls.gst.value).toBe('5.00');
    expect(component.newenquiryForm.controls.totalAmount.value).toBe('105.00');
  });

  it('should initialize the component with isAgentAdvise based on isPage', () => {
    component.isPage = 'agent-advise';
    component.ngOnInit();
    expect(component.isAgentAdvise).toBeTrue();
  });

});
