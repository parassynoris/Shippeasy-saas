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
import { AddactivityComponent } from './addactivity.component';


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
  useExisting: forwardRef(() => AddactivityComponent),
  multi: true
};

describe('AddactivityComponent', () => {
  let component: AddactivityComponent;
  let fixture: ComponentFixture<AddactivityComponent>;
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
      declarations: [AddactivityComponent, MockTranslatePipe,],
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
    fixture = TestBed.createComponent(AddactivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.activityForm).toBeDefined();
    expect(component.activityForm.get('containerStatusCode').value).toBe('');
    expect(component.activityForm.get('containerDesignastion').value).toBe('');
    // Add assertions for other form fields as well
  });

  it('should mark form as invalid if required fields are empty', () => {
    component.activityForm.patchValue({
      containerStatusCode: '',
      containerDesignastion: '',
      // Set other required fields to empty values
    });
    expect(component.activityForm.invalid).toBeTruthy();
  });

  it('should populate form fields with fromParent data', () => {
    const fromParentData = {
      _source: {
        containerStatusCode: 'ABC123',
        containerDesignastion: 'Test Designation',
        // Add other fields as needed
      }
    };
    component.fromParent = fromParentData;
    component.ngOnInit();
    expect(component.activityForm.get('containerStatusCode').value).toBe(fromParentData._source.containerStatusCode);
    expect(component.activityForm.get('containerDesignastion').value).toBe(fromParentData._source.containerDesignastion);
    // Add assertions for other fields
  });

  it('should disable form when isType is set to "show"', () => {
    component.isType = 'show';
    component.ngOnInit();
    expect(component.activityForm.disabled).toBeTruthy();
  });

  it('should enable form when isType is not set to "show"', () => {
  component.isType = 'edit';
  component.ngOnInit();
  expect(component.activityForm.enabled).toBeTruthy();
});


it('should update form fields when fromParent data changes', () => {
  const newData = {
    _source: {
      containerStatusCode: 'XYZ789',
      containerDesignastion: 'Updated Designation',
      // Add other fields as needed
    }
  };
  component.fromParent = { _source: { containerStatusCode: 'ABC123', containerDesignastion: 'Initial Designation' } };
  component.ngOnInit();
  component.fromParent = newData;
  component.ngOnInit();
  expect(component.activityForm.get('containerStatusCode').value).toBe(newData._source.containerStatusCode);
  expect(component.activityForm.get('containerDesignastion').value).toBe(newData._source.containerDesignastion);
  // Add assertions for other fields
});

it('should enable form when isType is set to "edit"', () => {
  component.isType = 'edit';
  component.ngOnInit();
  expect(component.activityForm.enabled).toBeTruthy();
});

it('should disable form when isType is set to "show"', () => {
  component.isType = 'show';
  component.ngOnInit();
  expect(component.activityForm.disabled).toBeTruthy();
});

  
 
});
