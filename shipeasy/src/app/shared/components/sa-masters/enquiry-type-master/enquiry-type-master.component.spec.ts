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
import { EnquiryTypeMasterComponent } from './enquiry-type-master.component';


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

describe('EnquiryTypeMasterComponent', () => {
  let component: EnquiryTypeMasterComponent;
  let fixture: ComponentFixture<EnquiryTypeMasterComponent>;
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
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList', 'UpdateToST']);
   mockApiService = jasmine.createSpyObj('ApiService',['getListByURL']);
    TestBed.configureTestingModule({
      declarations: [EnquiryTypeMasterComponent, MockTranslatePipe],
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
    fixture = TestBed.createComponent(EnquiryTypeMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.addEnquiryForm.value).toEqual({
      typeName: '',
      status: '',
    });
  });

  it('should call deleteclause method and show alert', () => {
    spyOn(window, 'alert');
    component.deleteclause('testId');
    expect(window.alert).toHaveBeenCalledWith('Item deleted!');
  });

  it('should initialize form with required fields', () => {
    const typeNameControl = component.addEnquiryForm.get('typeName');
    expect(typeNameControl).toBeTruthy();
    expect(typeNameControl?.validator).toBe(component.f.typeName.validator);
    expect(component.addEnquiryForm.get('status')).toBeTruthy();
  });

  it('should call getData method on ngOnInit', fakeAsync(() => {
    spyOn(component, 'getData');
    component.ngOnInit();
    tick(500); // Simulate asynchronous setTimeout
    expect(component.getData).toHaveBeenCalled();
  }));

  it('should open modal and set form values when editing', () => {
    const mockEnquiry = { _source: { systemtypeId: '1', typeName: 'Test', status: 'Active' } };
    component.open('content', mockEnquiry);
    expect(component.show).toBeUndefined(); // show should not be set
    expect(component.enquiryIdToUpdate).toBe('1');
    expect(component.addEnquiryForm.value).toEqual({
      typeName: 'Test',
      status: 'Active',
    });
  });

  it('should disable form fields when show mode is active', () => {
    const mockEnquiry = { _source: { systemtypeId: '1', typeName: 'Test', status: 'Active' } };
    component.open('content', mockEnquiry, 'show');
    expect(component.addEnquiryForm.disabled).toBeTruthy();
  });

  it('should call getData method when next button is clicked', () => {
    spyOn(component, 'getPaginationData');
    component.toalLength = 20;
    component.count = 10;
    component.next();
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });

  it('should call getPaginationData method when prev button is clicked', () => {
    spyOn(component, 'getPaginationData');
    component.page = 2;
    component.prev();
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });
  
  it('should display alert message when deleteclause method is called', () => {
    spyOn(window, 'alert');
    const testId = 'testId'; // Provide a test id
    component.deleteclause(testId);
    expect(window.alert).toHaveBeenCalledWith('Item deleted!');
  });
});
