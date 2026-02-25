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
import { TriffHdrMasterComponent } from './triff-hdr-master.component';





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

describe('TriffHdrMasterComponent', () => {
  let component: TriffHdrMasterComponent;
  let fixture: ComponentFixture<TriffHdrMasterComponent>;
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
      declarations: [TriffHdrMasterComponent, MockTranslatePipe],
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
    fixture = TestBed.createComponent(TriffHdrMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize HDRForm with required form controls', () => {
    expect(component.HDRForm).toBeDefined();
    expect(component.HDRForm.get('port')).toBeDefined();
    expect(component.HDRForm.get('fromDate')).toBeDefined();
    expect(component.HDRForm.get('status')).toBeDefined();
    expect(component.HDRForm.valid).toBeFalsy(); // Form should start as invalid
  });

  it('should retrieve tariff list data on ngOnInit', () => {
    spyOn(component, 'getListData').and.callThrough();
    component.ngOnInit();
    expect(component.getListData).toHaveBeenCalled();
  });

  it('should filter list data when filter() is called', () => {
    spyOn(component, 'getListData');
    const event = { target: { value: 20 } };
    component.filter(event);
    expect(component.getListData).toHaveBeenCalled();
  });

  it('should clear filter/search criteria and refresh list data when clear() is called', () => {
    spyOn(component, 'getListData');
    
    component.portName = 'Some Port';
    component.fromDate = '2022-01-01';
    component.createdBy = 'Some User';
    component.createdOn = '2022-01-01';
    component.updatedBy = 'Another User';
    component.updatedOn = '2022-01-01';
    
    component.clear();
  
    expect(component.getListData).toHaveBeenCalled();
    expect(component.portName).toEqual('');
    expect(component.fromDate).toEqual('');
    expect(component.createdBy).toEqual('');
    expect(component.createdOn).toEqual('');
    expect(component.updatedBy).toEqual('');
    expect(component.updatedOn).toEqual('');
  });


  it('should initialize form', () => {
    expect(component.HDRForm).toBeDefined();
    expect(component.HDRForm.controls['port']).toBeDefined();
    expect(component.HDRForm.controls['fromDate']).toBeDefined();
    expect(component.HDRForm.controls['status']).toBeDefined();
  });

  it('should call getListData on init', () => {
    spyOn(component, 'getListData');
    component.ngOnInit();
    expect(component.getListData).toHaveBeenCalled();
  });

  it('should call getPort on init', () => {
    spyOn(component, 'getPort');
    component.ngOnInit();
    expect(component.getPort).toHaveBeenCalled();
  });

  it('should clear filters', () => {
    component.clear();
    expect(component.portName).toBe('');
    expect(component.fromDate).toBe('');
    expect(component.createdBy).toBe('');
    expect(component.createdOn).toBe('');
    expect(component.updatedBy).toBe('');
    expect(component.updatedOn).toBe('');
  });

});
