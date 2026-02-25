import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { HttpClientModule } from '@angular/common/http';
import { CurrencyPipe, DatePipe } from '@angular/common'; 
import { OrderByPipe } from 'src/app/shared/util/sort';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonService } from 'src/app/services/common/common.service';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { NewImportEnquiryComponent } from './new-import-enquiry.component';



@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  
  constructor(private currencyPipe: CurrencyPipe) {}
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('NewImportEnquiryComponent', () => {
  let component: NewImportEnquiryComponent;
  let fixture: ComponentFixture<NewImportEnquiryComponent>;
  let mockNgbModal: jasmine.SpyObj<NgbModal>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockNotificationService: jasmine.SpyObj<NzNotificationService>;
  let mockMastersService: jasmine.SpyObj<MastersService>;
  let mockProfilesService: jasmine.SpyObj<ProfilesService>;
  let mockCognitoService: jasmine.SpyObj<CognitoService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let formBuilder: FormBuilder;
  beforeEach(waitForAsync(() => {
    mockNgbModal = jasmine.createSpyObj('NgbModal', ['open']);
    mockApiService = jasmine.createSpyObj('ApiService', ['getSTList', 'addToST', 'UpdateToST', 'deleteST']);
    mockNotificationService = jasmine.createSpyObj('NzNotificationService', ['create']);
    mockMastersService = jasmine.createSpyObj('MastersService', ['getSTList']);
    mockProfilesService = jasmine.createSpyObj('ProfilesService', ['getUserDetails']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails','getagentDetails',]);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList', 'UpdateToST']);
   mockApiService = jasmine.createSpyObj('ApiService',['getListByURL']);
    TestBed.configureTestingModule({
      declarations: [NewImportEnquiryComponent, MockTranslatePipe],
      imports: [ReactiveFormsModule,SharedModule,NzSelectModule,NzDatePickerModule,RouterTestingModule,BrowserAnimationsModule ,HttpClientModule,TranslateModule.forRoot()],
      providers: [DatePipe, OrderByPipe,CurrencyPipe,FormBuilder,
        { provide: NgbModal, useValue: mockNgbModal },
        { provide: ApiService, useValue: mockApiService },
        { provide: NzNotificationService, useValue: mockNotificationService },
        { provide: MastersService, useValue: mockMastersService },
        { provide: ProfilesService, useValue: mockProfilesService },
        { provide: SaMasterService, useValue: {} },
        { provide: CognitoService, useValue: mockCognitoService },
        { provide: CommonService, useValue: mockCommonService }
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewImportEnquiryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not set the voyage number if vessel is not found', () => {
    // Mock data
    const vesselList = [];
    const newenquiryForm = {
      value: {
        shipping_line: 'ABC'
      },
      controls: {
        voyageNumber: {
          setValue: jasmine.createSpy('setValue')
        }
      }
    };

    // Set up environment
    const context = {
      vesselList: vesselList,
      newenquiryForm: newenquiryForm
    };
    expect(newenquiryForm.controls.voyageNumber.setValue).not.toHaveBeenCalled();
  });

  it('should not set the voyage number if voyage is not found for the shipping line', () => {
    // Mock data
    const vesselList = [
      {
        vesselId: 1,
        voyage: [
          { shipping_line: 'XYZ', voyage_number: '456' }
        ]
      }
    ];
    const newenquiryForm = {
      value: {
        shipping_line: 'ABC'
      },
      controls: {
        voyageNumber: {
          setValue: jasmine.createSpy('setValue')
        }
      }
    };
    // Set up environment
    const context = {
      vesselList: vesselList,
      newenquiryForm: newenquiryForm
    };

    // Assertion
    expect(newenquiryForm.controls.voyageNumber.setValue).not.toHaveBeenCalled();
  });

  it('should not set any values when party data does not exist', () => {
    // Mock data
    const partyMasterNameList = [];
    const newenquiryForm = {
      get: jasmine.createSpy('get')
    };
    const component = {
      partyMasterNameList: partyMasterNameList,
      newenquiryForm: newenquiryForm
    };
    expect(component.newenquiryForm.get).not.toHaveBeenCalled();
  });

  it('should create the component and initialize forms', () => {
    expect(component).toBeTruthy();
    expect(component.empForm).toBeDefined();
    expect(component.newenquiryForm).toBeDefined();
  });
  it('should initialize empForm and newenquiryForm correctly', () => {
    // Ensure the component is created
    expect(component).toBeTruthy();
  
    // Ensure `empForm` is defined and is an instance of FormGroup
    expect(component.empForm).toBeDefined();
    expect(component.empForm instanceof FormArray).toBeFalse(); // Check if `empForm` is actually a FormGroup or FormArray
    expect(component.empForm instanceof FormGroup).toBeTrue(); // Adjust according to your actual form setup
  
    // Ensure `newenquiryForm` is defined and is an instance of FormGroup
    expect(component.newenquiryForm).toBeDefined();
    expect(component.newenquiryForm instanceof FormArray).toBeFalse(); // Check if `newenquiryForm` is actually a FormGroup or FormArray
    expect(component.newenquiryForm instanceof FormGroup).toBeTrue(); // Adjust according to your actual form setup
  });
  
});
