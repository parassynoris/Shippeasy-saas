import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
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
import { VesselComponent } from './vessel.component';

@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {

  constructor(private currencyPipe: CurrencyPipe) { }
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('VesselComponent', () => {
  let component: VesselComponent;
  let fixture: ComponentFixture<VesselComponent>;
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
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails', 'getagentDetails',]);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList', 'UpdateToST', 'getCostHeadList']);
    mockApiService = jasmine.createSpyObj('ApiService', ['getListByURL']);
    TestBed.configureTestingModule({
      declarations: [VesselComponent, MockTranslatePipe],
      imports: [ReactiveFormsModule, SharedModule, NzSelectModule, NzDatePickerModule, RouterTestingModule, BrowserAnimationsModule, HttpClientModule, TranslateModule.forRoot()],
      providers: [DatePipe, OrderByPipe, CurrencyPipe,
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
    fixture = TestBed.createComponent(VesselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to add vessel route when onOpenVessel method is called', () => {
    component.urlParam = { key: 'master' };
    component.onOpenVessel();
  });

  it('should navigate to parent route when onCloseNew method is called', () => {
    component.urlParam = { key: 'master' };
    component.onCloseNew();
  });

  it('should navigate to edit vessel route with provided id when onEdit method is called', () => {
    const id = '123';
    component.urlParam = { key: 'master' };
    component.onEdit(id);
  });

  it('should navigate to next page when next method is called', () => {
    spyOn(component, 'getPaginationData');
    component.toalLength = 20;
    component.count = 10;
    component.next();
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });

  it('should navigate to previous page when prev method is called', () => {
    spyOn(component, 'getPaginationData');
    component.page = 2;
    component.prev();
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should set size and fetch vessel data when filter method is called', () => {
    spyOn(component, 'getVessel');
    const event = { target: { value: 20 } };
    component.filter(event);
    expect(component.size).toBe(20);
    expect(component.fromSize).toBe(1);
    expect(component.getVessel).toHaveBeenCalled();
  });

  it('should reset search criteria and fetch vessel data when clear method is called', () => {
    spyOn(component, 'getVessel');
    component.vessel_id = '123';
    component.vessel_name = 'Test Vessel';
    component.vessel_type = 'Test Type';
    component.vessel_flag = 'Test Flag';
    component.vessel_category = 'Test Category';
    component.status = true;
    component.vessel_sub_type = 'Test Subtype';
    component.clear();
    expect(component.vessel_id).toBe('');
    expect(component.vessel_name).toBe('');
    expect(component.vessel_type).toBe('');
    expect(component.vessel_flag).toBe('');
    expect(component.vessel_category).toBe('');
    expect(component.status).toBe('');
    expect(component.vessel_sub_type).toBe('');
    expect(component.getVessel).toHaveBeenCalled();
  });
});
