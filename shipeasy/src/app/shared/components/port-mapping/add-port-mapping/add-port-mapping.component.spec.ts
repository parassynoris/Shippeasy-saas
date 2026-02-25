import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
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
import { AddPortMappingComponent } from './add-port-mapping.component';


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

describe('AddPortMappingComponent', () => {
  let component: AddPortMappingComponent;
  let fixture: ComponentFixture<AddPortMappingComponent>;
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
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails','getagentDetails',]);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList', 'UpdateToST','portList','systemtypeList','countryList']);
   mockApiService = jasmine.createSpyObj('ApiService',['getListByURL']);
    TestBed.configureTestingModule({
      declarations: [AddPortMappingComponent, MockTranslatePipe],
      imports: [ReactiveFormsModule,SharedModule,NzSelectModule,NzDatePickerModule,RouterTestingModule,BrowserAnimationsModule ,HttpClientModule,TranslateModule.forRoot()],
      providers: [DatePipe, OrderByPipe,CurrencyPipe,
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
    fixture = TestBed.createComponent(AddPortMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with required controls and validators', () => {
    expect(component.locationForm.contains('orgId')).toBeTruthy();
    expect(component.locationForm.contains('parentId')).toBeTruthy();
    // Add similar expectations for other form controls and validators
  });

  it('should initialize the component properly', () => {
    expect(component).toBeTruthy();
    expect(component.locationForm).toBeDefined();
    // Add more expectations as needed
  });

  it('should initialize form controls correctly', () => {
    expect(component.locationForm.controls['orgId']).toBeTruthy();
    expect(component.locationForm.controls['parentId']).toBeTruthy();
    // Add more expectations for other form controls
  });

  it('should initialize the form with default values when in add mode', () => {
    component.isAddMode = true;
    component.ngOnInit();
    expect(component.locationForm.value).toEqual({
      orgId: '',
      parentId: '',
      cargoType: '',
      country: '',
      portMappingName: '',
      principalCode: ''
    });
  });

  it('should disable form controls when in edit mode', () => {
    const mockData = {
      _source: {
        parentId: 'parent123',
        cargoTypeId: 'cargo123',
        country: { countryId: 'US' }
      }
    };
    component.isAddMode = false;
    component.isAddModeData = mockData;
    component.ngOnInit();
    expect(component.locationForm.controls['parentId'].disabled).toBeTruthy();
    expect(component.locationForm.controls['cargoType'].disabled).toBeTruthy();
    expect(component.locationForm.controls['country'].disabled).toBeTruthy();
  });

  it('should disable form controls when in edit mode', () => {
    const mockData = {
      _source: {
        parentId: 'parent123',
        cargoTypeId: 'cargo123',
        country: { countryId: 'US' }
      }
    };
    component.isAddMode = false;
    component.isAddModeData = mockData;
    component.ngOnInit();
    expect(component.locationForm.controls['parentId'].disabled).toBeTruthy();
    expect(component.locationForm.controls['cargoType'].disabled).toBeTruthy();
    expect(component.locationForm.controls['country'].disabled).toBeTruthy();
  });

  it('should set portMappingName when setPort method is called', () => {
    const mockPortList = [
      { _source: { portId: '1', portDetails: { portName: 'Port A' } } },
      { _source: { portId: '2', portDetails: { portName: 'Port B' } } }
    ];
    component.PortList = mockPortList;
    component.setPort('1');
    expect(component.locationForm.value.portMappingName).toEqual('Port A');
  });

});
