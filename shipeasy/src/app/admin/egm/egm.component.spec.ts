import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
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
import { BranchComponent } from 'src/app/shared/components/branch/branch.component';
import { environment } from 'src/environments/environment';
import { HttpTestingController } from '@angular/common/http/testing';
import { EgmComponent } from './egm.component';

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
  useExisting: forwardRef(() => EgmComponent),
  multi: true
};

describe('EgmComponent', () => {
  let component: EgmComponent;
  let fixture: ComponentFixture<EgmComponent>;
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
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList']);

    TestBed.configureTestingModule({
      declarations: [BranchComponent, MockTranslatePipe, EgmComponent],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientModule, RouterModule, ReactiveFormsModule],
      providers: [DatePipe, OrderByPipe,
        { provide: NgbModal, useValue: mockNgbModal }, CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR,

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
    fixture = TestBed.createComponent(EgmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should clear filters and get EGM data on clearFilters', () => {
    spyOn(component, 'getEgmData');
    component.filtersModel = [{ key: 'test', value: 'value' }];

    component.clearFilters();

    expect(component.filtersModel.length).toBe(0);
    expect(component.filterKeys).toEqual({});
    expect(component.getEgmData).toHaveBeenCalled();
  });

  it('should open file input on openfileinput', () => {
    const element = document.createElement('input');
    spyOn(document, 'getElementById').and.returnValue(element);
    spyOn(element, 'click');

    component.openfileinput('testId');

    expect(document.getElementById).toHaveBeenCalledWith('testId');
    expect(element.click).toHaveBeenCalled();
  });

  it('should initialize form with default values on ngOnInit', () => {
    component.ngOnInit();

    expect(component.egmForm.value).toEqual({
      vessel: '',
      voyage: '',
      egm_no: '',
      egmDate: '',
      pol: '',
    });
  });

  it('should mark form as invalid if required fields are not filled', () => {
    component.egmForm.patchValue({
      vessel: '',
      voyage: '',
      egm_no: '',
      egmDate: '',
      pol: '',
    });

    expect(component.egmForm.valid).toBeFalse();
  });

  it('should mark form as valid if required fields are filled', () => {
    component.egmForm.patchValue({
      vessel: 'TestVessel',
      voyage: 'TestVoyage',
      egm_no: 'TestEgmNo',
      egmDate: '2024-03-08',
      pol: 'TestPol',
    });

    expect(component.egmForm.valid).toBeTrue();
  });

  it('should set isHoldType property on onOpen', () => {
    component.onOpen('add');

    expect(component.isHoldType).toBe('add');
  });

  it('should set isShow property on onShowPermission', () => {
    component.onShowPermission('testId');

    expect(component.isShow).toBe('testId');
  });

  it('should reset filterModel and filterKeys on clearFilters', () => {
    component.filtersModel = [{ key: 'test', value: 'value' }];
    component.filterKeys = { test: 'value' };

    component.clearFilters();

    expect(component.filtersModel.length).toBe(0);
    expect(component.filterKeys).toEqual({});
  });

  it('should initialize the form with required validators', () => {
    const formControls = component.egmForm.controls;

    expect(formControls['vessel'].validator({} as any)).toEqual({ required: true });
    expect(formControls['voyage'].validator({} as any)).toEqual({ required: true });
    expect(formControls['egm_no'].validator).toBeNull();
    expect(formControls['egmDate'].validator({} as any)).toEqual({ required: true });
    expect(formControls['pol'].validator({} as any)).toEqual({ required: true });
  });

});

