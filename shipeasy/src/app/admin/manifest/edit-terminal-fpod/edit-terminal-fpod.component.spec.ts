import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormArray, ReactiveFormsModule } from '@angular/forms';
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
import { EditTerminalFpodComponent } from './edit-terminal-fpod.component';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { of } from 'rxjs';


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

describe('EditTerminalFpodComponent', () => {
  let component: EditTerminalFpodComponent;
  let fixture: ComponentFixture<EditTerminalFpodComponent>;
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
      declarations: [EditTerminalFpodComponent, MockTranslatePipe],
      imports: [BrowserDynamicTestingModule,ReactiveFormsModule, SharedModule, NzSelectModule, NzDatePickerModule, RouterTestingModule, BrowserAnimationsModule, HttpClientModule, TranslateModule.forRoot()],
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
    fixture = TestBed.createComponent(EditTerminalFpodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call back() method', () => {
    component.back();
  });

  it('should create blForm with FormArray', () => {
    expect(component.blForm.get('blData')).toBeInstanceOf(FormArray);
  });

  it('should call getPortDropDowns() and populate portList', () => {
    const mockPortList = [{ portId: 1, portName: 'Port 1' }, { portId: 2, portName: 'Port 2' }];
    mockCommonService.getSTList.and.returnValue(of({ documents: mockPortList }));
    component.getPortDropDowns();
    expect(component.portList).toEqual(mockPortList);
  });

  it('should call getSystemTypeDropDowns() and populate itemTypeList and departureModeList', () => {
    const mockSystemTypeList = [
      { typeCategory: 'itemType', name: 'Type 1' },
      { typeCategory: 'departureMode', name: 'Mode 1' },
      { typeCategory: 'other', name: 'Other' }
    ];
    mockCommonService.getSTList.and.returnValue(of({ documents: mockSystemTypeList }));
    component.getSystemTypeDropDowns();
    expect(component.itemTypeList).toEqual([{ typeCategory: 'itemType', name: 'Type 1' }]);
    expect(component.departureModeList).toEqual([{ typeCategory: 'departureMode', name: 'Mode 1' }]);
  });

  it('should call getBLById() and populate houseBlList', () => {
    const mockHouseBlList = [{ blNumber: 'BL123' }, { blNumber: 'BL456' }];
    mockCommonService.getSTList.and.returnValue(of({ documents: mockHouseBlList }));
    component.getBLById();
    expect(component.houseBlList).toEqual(mockHouseBlList);
  });
});
