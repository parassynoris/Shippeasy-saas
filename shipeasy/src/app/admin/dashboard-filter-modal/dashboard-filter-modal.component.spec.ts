
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
import { of, throwError } from 'rxjs';
import { DashboardFilterModalComponent } from './dashboard-filter-modal.component';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';

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

describe('DashboardFilterModalComponent', () => {
  let component: DashboardFilterModalComponent;
  let fixture: ComponentFixture<DashboardFilterModalComponent>;
  let mockNgbModal: jasmine.SpyObj<NgbModal>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockNotificationService: jasmine.SpyObj<NzNotificationService>;
  let mockMastersService: jasmine.SpyObj<MastersService>;
  let mockProfilesService: jasmine.SpyObj<ProfilesService>;
  let mockCognitoService: jasmine.SpyObj<CognitoService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mastersService: jasmine.SpyObj<MastersService>;
  beforeEach(waitForAsync(() => {
    mockNgbModal = jasmine.createSpyObj('NgbModal', ['open']);
    mockApiService = jasmine.createSpyObj('ApiService', ['getSTList', 'addToST', 'UpdateToST', 'deleteST']);
    mockNotificationService = jasmine.createSpyObj('NzNotificationService', ['create']);
    mockMastersService = jasmine.createSpyObj('MastersService', ['getSTList']);
    mockProfilesService = jasmine.createSpyObj('ProfilesService', ['getUserDetails','getSmartAgentById']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails', 'getagentDetails',]);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList', 'UpdateToST', 'getCostHeadList']);
    mockApiService = jasmine.createSpyObj('ApiService', ['getListByURL']);
    const mastersServiceSpy = jasmine.createSpyObj('MastersService', ['shippingLineList']);
    TestBed.configureTestingModule({
      declarations: [DashboardFilterModalComponent, MockTranslatePipe],
      imports: [ReactiveFormsModule, SharedModule, NzSelectModule, NzDatePickerModule, RouterTestingModule, MatSelectModule,AutocompleteLibModule,BrowserAnimationsModule, HttpClientModule, TranslateModule.forRoot()],
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
    fixture = TestBed.createComponent(DashboardFilterModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.selectall).toBeFalse();
    expect(component.checked).toBeFalse();
    expect(component.filterform.get('fromdate')?.value).toBeInstanceOf(Date);
    expect(component.filterform.get('todate')?.value).toBeInstanceOf(Date);
  });

  it('should populate locationData based on search input', () => {
    const mockResponse = { documents: [{ portId: '1', portDetails: { portName: 'Port1' } }] };
    mockCommonService.getSTList.and.returnValue(of(mockResponse));
  
    component.onLocationSearch('Port1');
    
    expect(component.locationData).toEqual([{ portId: '1', portName: 'Port1' }]);
  });

  it('should emit onCloseSection event when onClose is called', () => {
    spyOn(component.onCloseSection, 'emit');
    component.onClose();
    expect(component.onCloseSection.emit).toHaveBeenCalled();
  });

  it('should handle no results in onLocationSearch', () => {
    mockCommonService.getSTList.and.returnValue(of({ documents: [] }));
    component.onLocationSearch('NoResult');
    expect(component.locationData).toEqual([]);
  });
  
  
  
});
