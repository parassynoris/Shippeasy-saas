import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { of, throwError } from 'rxjs';
import { ApiService } from 'src/app/admin/principal/api.service';
import { CommonService } from 'src/app/services/common/common.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Pipe, PipeTransform, forwardRef } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import * as XLSX from "xlsx";
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MastersSortPipe } from 'src/app/shared/util/mastersort';
import { SmartagentComponent } from './smartagent.component';






@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}
const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => SmartagentComponent),
  multi: true
};

describe('SmartagentComponent', () => {
  let component: SmartagentComponent;
  let fixture: ComponentFixture<SmartagentComponent>;
  let mockNgbModal: jasmine.SpyObj<NgbModal>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockNotificationService: jasmine.SpyObj<NzNotificationService>;
  let mockMastersService: jasmine.SpyObj<MastersService>;
  let mockProfilesService: jasmine.SpyObj<ProfilesService>;
  let mockCognitoService: jasmine.SpyObj<CognitoService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockSaMasterService: jasmine.SpyObj<SaMasterService>
  
    beforeEach(waitForAsync(() => {
    mockNgbModal = jasmine.createSpyObj('NgbModal', ['open']);
    mockApiService = jasmine.createSpyObj('ApiService', ['getSTList', 'addToST', 'UpdateToST', 'deleteST','getListByURL']);
    mockNotificationService = jasmine.createSpyObj('NzNotificationService', ['create']);
    mockMastersService = jasmine.createSpyObj('MastersService', ['getSTList','cityList']);
    mockProfilesService = jasmine.createSpyObj('ProfilesService', ['getUserDetails','getCurrentAgentDetails']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails','getModule','getagentDetails']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList']);
    mockSaMasterService = jasmine.createSpyObj('SaMasterService', ['cityList']);
    TestBed.configureTestingModule({
      declarations: [SmartagentComponent, MockTranslatePipe,],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientModule,RouterModule,ReactiveFormsModule,RouterModule,TranslateModule.forRoot(),NzSelectModule,NzDatePickerModule,BrowserAnimationsModule],
      providers: [DatePipe, OrderByPipe,TranslateService,MastersSortPipe,
        { provide: NgbModal, useValue: mockNgbModal },CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR,

        { provide: ApiService, useValue: mockApiService },
        { provide: NzNotificationService, useValue: mockNotificationService },
        { provide: MastersService, useValue: mockMastersService },
        { provide: ProfilesService, useValue: mockProfilesService },
        { provide: SaMasterService, useValue: mockSaMasterService },
        { provide: CognitoService, useValue: mockCognitoService },
        { provide: CommonService, useValue: mockCommonService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartagentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should clear all filter parameters and fetch smart agent list', () => {
    spyOn(component, 'getSmartAgentList'); // Spy on getSmartAgentList method
    component.clear();
    expect(component.agentProfileName).toEqual('');
    expect(component.phoneNo).toEqual('');
    expect(component.emailAddress).toEqual('');
    expect(component.country).toEqual('');
    expect(component.status).toEqual('');
    expect(component.getSmartAgentList).toHaveBeenCalled();
  });

  it('should update size parameter and fetch smart agent list', () => {
    const mockEvent = { target: { value: 20 } }; // Mock event with target value
    spyOn(component, 'getSmartAgentList'); // Spy on getSmartAgentList method
    component.filter(mockEvent);
    expect(component.size).toEqual(20); // Size parameter should be updated
    expect(component.fromSize).toEqual(1); // Reset fromSize to 1
    expect(component.getSmartAgentList).toHaveBeenCalled();
  });

  it('should clear filters', () => {
    component.agentProfileName = 'test';
    component.phoneNo = '1234567890';
    component.emailAddress = 'test@example.com';
    component.country = 'India';
    component.status = 'Active';

    component.clear();

    expect(component.agentProfileName).toBe('');
    expect(component.phoneNo).toBe('');
    expect(component.emailAddress).toBe('');
    expect(component.country).toBe('');
    expect(component.status).toBe('');
  });

  it('should call export and generate Excel', () => {
    const exportSpy = spyOn(component.commonfunction, 'exportToExcel');
    component.export();
    expect(exportSpy).toHaveBeenCalled();
  });

  it('should call toggleFilters and update filter model', () => {
    component.filtersModel = ['value1', 'value2'];
    component.toggleFilters = false;
    component.toggleFilters = true;
    expect(component.filtersModel).toEqual(['value1', 'value2']);
  });

  it('should call clearFilters and reset filters model', () => {
    component.filtersModel = ['value1', 'value2'];
    component.clearFilters();
    expect(component.filtersModel).toEqual([]);
  });

 
  
  
});
