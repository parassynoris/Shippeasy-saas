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
import { CostItemMappingComponent } from './cost-item-mapping.component';

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

describe('CostItemMappingComponent', () => {
  let component: CostItemMappingComponent;
  let fixture: ComponentFixture<CostItemMappingComponent>;
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
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList', 'UpdateToST','portList','systemtypeList','countryList','getCostItemList']);
   mockApiService = jasmine.createSpyObj('ApiService',['getListByURL']);
    TestBed.configureTestingModule({
      declarations: [CostItemMappingComponent, MockTranslatePipe],
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
    fixture = TestBed.createComponent(CostItemMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getCostItemList with correct parameters on getCostItemList method', () => {
    component.getCostItemList();
    expect(mockCommonService.getCostItemList).toHaveBeenCalledWith(jasmine.objectContaining({
      size: component.size,
      from: component.page - 1,
      sort: { createdOn: 'desc' }
    }));
  });

  it('should call clear method and reset values', () => {
    component.costItemName = 'Test Name';
    component.costItemMapName = 'Test Map Name';
    component.vsmcode = 'Test VSM Code';
    component.status = 'Test Status';
    component.clear();
    expect(component.costItemName).toEqual('');
    expect(component.costItemMapName).toEqual('');
    expect(component.vsmcode).toEqual('');
    expect(component.status).toEqual('');
    expect(mockCommonService.getCostItemList).toHaveBeenCalled();
  });

  it('should call filter method and update size', () => {
    const event = { target: { value: '50' } };
    component.filter(event);
    expect(component.fromSize).toEqual(1);
    expect(mockCommonService.getCostItemList).toHaveBeenCalled();
  });

  it('should reset filters and call getCostItemList on clear method call', () => {
    spyOn(component, 'getCostItemList');
    component.costItemName = 'test';
    component.costItemMapName = 'test';
    component.vsmcode = 'test';
    component.status = 'test';
    component.clear();
    expect(component.costItemName).toEqual('');
    expect(component.costItemMapName).toEqual('');
    expect(component.vsmcode).toEqual('');
    expect(component.status).toEqual('');
    expect(component.getCostItemList).toHaveBeenCalled();
  });

  it('should call getCostItemList on ngOnInit', () => {
    spyOn(component, 'getCostItemList');
    component.ngOnInit();
    expect(component.getCostItemList).toHaveBeenCalled();
  });

  it('should call getCostItemList on filter method', () => {
    spyOn(component, 'getCostItemList');
    const event = { target: { value: 20 } };
    component.filter(event);
    expect(component.getCostItemList).toHaveBeenCalled();
  });

});
