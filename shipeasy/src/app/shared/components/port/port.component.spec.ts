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
import { PortComponent } from './port.component';


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

describe('PortComponent', () => {
  let component: PortComponent;
  let fixture: ComponentFixture<PortComponent>;
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
      declarations: [PortComponent, MockTranslatePipe],
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
    fixture = TestBed.createComponent(PortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter data correctly', fakeAsync(() => {
    // Simulate setting filter criteria
    component.authority = 'Port Authority';
    component.type = 'Type';
    // Add more filter criteria as needed
  
    spyOn(component, 'getData');
    component.search();
    tick();
    component.clear();
    tick();
  }));
  
  it('should clear all properties and fetch data', () => {
    spyOn(component, 'getData').and.stub();
  
    component.authority = 'someAuthority';
    component.type = 'someType';
    component.country = 'someCountry';
    component.address = 'someAddress';
    component.port_type = 'somePortType';
    component.terminal = 'someTerminal';
    component.berth = 'someBerth';
  
    component.clear();
  
    expect(component.authority).toEqual('');
    expect(component.type).toEqual('');
    expect(component.country).toEqual('');
    expect(component.address).toEqual('');
    expect(component.port_type).toEqual('');
    expect(component.terminal).toEqual('');
    expect(component.berth).toEqual('');
    expect(component.getData).toHaveBeenCalled();
  });
  
  it('should call getPaginationData with "next" when toalLength is greater than count in next()', () => {
    spyOn(component, 'getPaginationData').and.stub();
    component.toalLength = 20;
    component.count = 10;
  
    component.next();
  
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });
  
  it('should call getPaginationData with "prev" when page is greater than 0 in prev()', () => {
    spyOn(component, 'getPaginationData').and.stub();
    component.page = 2;
  
    component.prev();
  
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });
  
  it('should update size, reset fromSize to 1, and call getData() in filter()', () => {
    spyOn(component, 'getData').and.stub();
    const event = { target: { value: 20 } };
  
    component.filter(event);
  
    expect(component.size).toEqual(20);
    expect(component.fromSize).toEqual(1);
    expect(component.getData).toHaveBeenCalled();
  });
  
});
