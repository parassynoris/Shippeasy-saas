
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
import { MatSelectModule } from '@angular/material/select';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { TicketadminComponent } from './ticketadmin.component';

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

describe('TicketadminComponent', () => {
  let component: TicketadminComponent;
  let fixture: ComponentFixture<TicketadminComponent>;
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
    mockApiService = jasmine.createSpyObj('ApiService', ['getListByURL','getSTList']);
    const mastersServiceSpy = jasmine.createSpyObj('MastersService', ['shippingLineList']);
    TestBed.configureTestingModule({
      declarations: [TicketadminComponent, MockTranslatePipe],
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
    fixture = TestBed.createComponent(TicketadminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply filter to data source', () => {
    const data = [{ title: 'Test Ticket', description: 'Description', priority: 'High' }];
    component.dataSource.data = data;
    component.applyFilter('Test');
    expect(component.dataSource.filter).toBe('test');
  });

  it('should change page and fetch new data', () => {
    spyOn(component, 'getTicketData').and.callThrough();
  
    component.onPageChange({ pageIndex: 1, pageSize: 10 });
  
    expect(component.getTicketData).toHaveBeenCalled();
  });

  it('should handle page changes and fetch new data', () => {
    spyOn(component, 'getTicketData');
  
    const event = { pageIndex: 1, pageSize: 10 };
    component.onPageChange(event);
  
    expect(component.pageNumber).toBe(2);
    expect(component.pageSize).toBe(10);
    expect(component.from).toBe(10);
    expect(component.getTicketData).toHaveBeenCalled();
  });

  it('should clear filters and fetch data again', () => {
    spyOn(component, 'getTicketData');
    
    component.filtersModel = ['filter1'];
    component.clearFilters();
    
    expect(component.filtersModel).toEqual([]);
    expect(component.filterKeys).toEqual({});
    expect(component.getTicketData).toHaveBeenCalled();
  });

  
  
});
