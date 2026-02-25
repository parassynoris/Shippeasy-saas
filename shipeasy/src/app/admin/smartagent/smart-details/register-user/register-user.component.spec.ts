import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { Pipe, PipeTransform } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from "xlsx";
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { RegisterUserComponent } from './register-user.component';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('RegisterUserComponent', () => {
  let component: RegisterUserComponent;
  let fixture: ComponentFixture<RegisterUserComponent>;
  let mockNgbModal: jasmine.SpyObj<NgbModal>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockNotificationService: jasmine.SpyObj<NzNotificationService>;
  let mockMastersService: jasmine.SpyObj<MastersService>;
  let mockProfilesService: jasmine.SpyObj<ProfilesService>;
  let mockCognitoService: jasmine.SpyObj<CognitoService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;

  beforeEach(waitForAsync(() => {
    mockNgbModal = jasmine.createSpyObj('NgbModal', ['open']);
    mockApiService = jasmine.createSpyObj('ApiService', ['getSTList', 'addToST', 'UpdateToST', 'deleteST']);
    mockNotificationService = jasmine.createSpyObj('NzNotificationService', ['create']);
    mockMastersService = jasmine.createSpyObj('MastersService', ['getSTList']);
    mockProfilesService = jasmine.createSpyObj('ProfilesService', ['getUserDetails']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList', 'UpdateToST']);
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['get']);

    TestBed.configureTestingModule({
      declarations: [RegisterUserComponent, MockTranslatePipe],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientModule],
      providers: [DatePipe, OrderByPipe,
        { provide: NgbModal, useValue: mockNgbModal },
        { provide: ApiService, useValue: mockApiService },
        { provide: NzNotificationService, useValue: mockNotificationService },
        { provide: MastersService, useValue: mockMastersService },
        { provide: ProfilesService, useValue: mockProfilesService },
        { provide: SaMasterService, useValue: {} },
        { provide: CognitoService, useValue: mockCognitoService },
        { provide: CommonService, useValue: mockCommonService },
        { provide: TranslateService, useValue: mockTranslateService }
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should clear the filters and call getSmartAgentList on clear', () => {
    const spy = spyOn(component, 'getSmartAgentList');
    
    component.clear();
  
    expect(component.agentProfileName).toBe('');
    expect(component.phoneNo).toBe('');
    expect(component.emailAddress).toBe('');
    expect(component.country).toBe('');
    expect(component.status).toBe('');
    expect(spy).toHaveBeenCalled();
  });
 
  it('should clear the filters and call getSmartAgentList on clearFilters', () => {
    const spy = spyOn(component, 'getSmartAgentList');
  
    component.clearFilters();
  
    expect(component.filtersModel).toEqual([]);
    expect(component.filterKeys).toEqual({});
    expect(spy).toHaveBeenCalled();
  });
            
 
  it('should initialize with smart agent list', () => {
    spyOn(component, 'getSmartAgentList');
    component.ngOnInit();
    expect(component.getSmartAgentList).toHaveBeenCalled();
  });

  it('should clear filters', () => {
    spyOn(component, 'getSmartAgentList');
    component.clear();
    expect(component.agentProfileName).toBe('');
    expect(component.phoneNo).toBe('');
    expect(component.emailAddress).toBe('');
    expect(component.country).toBe('');
    expect(component.status).toBe('');
    expect(component.getSmartAgentList).toHaveBeenCalled();
  });

  it('should clear filters and fetch smart agent list', () => {
    spyOn(component, 'getSmartAgentList').and.callThrough();
    component.clear();
    expect(component.agentProfileName).toBe('');
    expect(component.phoneNo).toBe('');
    expect(component.emailAddress).toBe('');
    expect(component.country).toBe('');
    expect(component.status).toBe('');
    expect(component.getSmartAgentList).toHaveBeenCalled();
  });

  it('should filter data', () => {
    component.applyFilter('Test');
    expect(component.dataSource.filter).toBe('test');
  });


  it('should apply filter', () => {
    component.applyFilter('agent');
    expect(component.dataSource.filter).toBe('agent');
  });
 
});
