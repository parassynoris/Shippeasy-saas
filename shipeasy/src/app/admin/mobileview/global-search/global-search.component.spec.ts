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
import { GlobalSearchComponent } from './global-search.component';


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

describe('GlobalSearchComponent', () => {
  let component: GlobalSearchComponent;
  let fixture: ComponentFixture<GlobalSearchComponent>;
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
      declarations: [GlobalSearchComponent, MockTranslatePipe],
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
    fixture = TestBed.createComponent(GlobalSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize component properties', () => {
    expect(component.querySearch).toBeUndefined();
    // Test other properties initialization
  });

  it('should reset all checkboxes and searchValue', () => {
    component.bookingChecked = true;
    component.quotationChecked = true;
    component.searchValue = 'test';
    component.resetCheckboxes();
    expect(component.bookingChecked).toBeFalse();
    expect(component.quotationChecked).toBeFalse();
    expect(component.searchValue).toEqual('');
  });
  
  it('should set selectedTab, tabledata, and initialize dataSource', () => {
    const mockData = ['data1', 'data2'];
    component.datas = { tab1: mockData };
    component.select('tab1');
    expect(component.selectedTab).toEqual('tab1');
    expect(component.tabledata).toEqual(mockData);
    expect(component.dataSource.data).toEqual(mockData);
    // Add more expectations based on your component behavior
  });

  it('should not navigate if type parameter is not provided', () => {
    const element = { batchId: '123' };
    component.navigate(element, '');
  });

});
