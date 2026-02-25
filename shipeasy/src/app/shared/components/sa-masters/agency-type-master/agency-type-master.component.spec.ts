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
import { AgencyTypeMasterComponent } from './agency-type-master.component';






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
  useExisting: forwardRef(() => AgencyTypeMasterComponent),
  multi: true
};

describe('AgencytypeMasterComponent', () => {
  let component: AgencyTypeMasterComponent;
  let fixture: ComponentFixture<AgencyTypeMasterComponent>;
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
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList']);
    mockSaMasterService = jasmine.createSpyObj('SaMasterService', ['cityList']);
    TestBed.configureTestingModule({
      declarations: [AgencyTypeMasterComponent, MockTranslatePipe,],
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
    fixture = TestBed.createComponent(AgencyTypeMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form properly', () => {
    expect(component.addAgencyForm).toBeDefined();
    expect(component.addAgencyForm.get('agencyTypeId')).toBeDefined();
    expect(component.addAgencyForm.get('isNFDAAuto')).toBeDefined();
    expect(component.addAgencyForm.get('FRTTaxApplicable')).toBeDefined();
    expect(component.addAgencyForm.get('description')).toBeDefined();
    expect(component.addAgencyForm.get('status')).toBeDefined();
  });

  it('should initialize variables properly', () => {
    expect(component.agencyData).toEqual([]);
    expect(component.toalLength).toBeUndefined();
    expect(component.size).toEqual(10);
    expect(component.page).toEqual(1);
    expect(component.count).toEqual(0);
    expect(component.fromSize).toEqual(1);
    expect(component.submitted).toBeFalsy();
    expect(component.nfda_auto).toBeUndefined();
    // Add more expectations for other variables as needed
  });

  
  it('should call getData method on ngOnInit', () => {
    spyOn(component, 'getData');
    component.ngOnInit();
    expect(component.getData).toHaveBeenCalled();
  });


  it('should initialize the form', () => {
    expect(component.addAgencyForm).toBeDefined();
    expect(component.addAgencyForm.controls['agencyTypeId']).toBeDefined();
    expect(component.addAgencyForm.controls['isNFDAAuto']).toBeDefined();
    expect(component.addAgencyForm.controls['FRTTaxApplicable']).toBeDefined();
    expect(component.addAgencyForm.controls['description']).toBeDefined();
    expect(component.addAgencyForm.controls['status']).toBeDefined();
  });



  it('should handle form errors', () => {
    component.addAgencyForm.controls['agencyTypeId'].setValue('');
    component.addAgencyForm.controls['isNFDAAuto'].setValue('');
    component.addAgencyForm.controls['FRTTaxApplicable'].setValue('');
    component.addAgencyForm.controls['description'].setValue('');
    component.addAgencyForm.controls['status'].setValue('');

    component.agencyMasters();

    expect(component.addAgencyForm.valid).toBeFalse();
  });
  it('should initialize the form with default values', () => {
    expect(component.addAgencyForm).toBeDefined();
    expect(component.addAgencyForm.controls['agencyTypeId'].value).toBe('');
    expect(component.addAgencyForm.controls['isNFDAAuto'].value).toBe(false);
    expect(component.addAgencyForm.controls['FRTTaxApplicable'].value).toBe('');
    expect(component.addAgencyForm.controls['description'].value).toBe('');
    expect(component.addAgencyForm.controls['status'].value).toBe(true);
  });

  it('should open modal and patch form for edit', () => {
    const mockAgency = { _source: { systemtypeId: '123', typeName: 'Test Agency' } };
    const mockModalContent = {};
    component.open(mockModalContent, mockAgency);

    expect(component.agencyIdToUpdate).toBe('123');
    expect(component.addAgencyForm.value.agencyTypeId).toBe('Test Agency');
  });
  it('should be invalid when form is empty', () => {
    expect(component.addAgencyForm.valid).toBeFalsy();
  });

  it('should be valid when form is filled correctly', () => {
    component.addAgencyForm.controls['agencyTypeId'].setValue('Test Agency');
    component.addAgencyForm.controls['FRTTaxApplicable'].setValue('Yes');
    component.addAgencyForm.controls['description'].setValue('Description');
    component.addAgencyForm.controls['status'].setValue(true);

    expect(component.addAgencyForm.valid).toBeTruthy();
  });

  it('should mark the form as submitted on submit', () => {
    component.agencyMasters();
    expect(component.submitted).toBeTrue();
  });


});
