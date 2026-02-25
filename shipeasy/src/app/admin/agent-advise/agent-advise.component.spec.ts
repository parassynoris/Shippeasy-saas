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
import autoTable from 'jspdf-autotable'
import * as XLSX from "xlsx";
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';import { OrderByPipe } from 'src/app/shared/util/sort';
import { AgentAdviseComponent } from './agent-advise.component';

 
 
 
@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}
 
describe('AgentAdviseComponent', () => {
  let component: AgentAdviseComponent;
  let fixture: ComponentFixture<AgentAdviseComponent>;
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
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList','UpdateToST']);
 
    TestBed.configureTestingModule({
      declarations: [AgentAdviseComponent, MockTranslatePipe],
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
      ],
    }).compileComponents();
  }));
 
  beforeEach(() => {
    fixture = TestBed.createComponent(AgentAdviseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
 
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should open modal on calling openXML()', () => {
    component.openXML();
    expect(mockNgbModal.open).toHaveBeenCalledWith(component.content, { centered: true });
  });


 



  it('should set globalSearch to an empty string and call clear on calling clearGloble()', () => {
    spyOn(component, 'clear');
    component.globalSearch = 'test query';
    component.clearGloble();
    expect(component.globalSearch).toBe('');
    expect(component.clear).toHaveBeenCalled();
  });

  it('should call getPaginationData with the correct type on calling getPaginationData()', () => {
    spyOn(component, 'getPaginationData');
    component.fromSize = 11;
    component.getPaginationData('prev');

    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

 




  it('should call getPaginationData with the correct type on calling next()', () => {
    spyOn(component, 'getPaginationData');
    component.toalLength = 20;
    component.count = 10;
    component.next();
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });

  it('should call getPaginationData with the correct type on calling prev()', () => {
    spyOn(component, 'getPaginationData');
    component.page = 2;
    component.prev();
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should set values to empty strings and call getAgentAdviseList on calling clear()', () => {
    spyOn(component, 'getAgentAdviseList');

    component.ref_no = 'testRef';
    component.quote_no = 'testQuote';
    component.tank_type = 'testTankType';
    // ... (similarly set other properties)

    component.clear();

    expect(component.ref_no).toBe('');
    expect(component.quote_no).toBe('');
    expect(component.tank_type).toBe('');
    // ... (similarly set other properties to empty strings)
    expect(component.getAgentAdviseList).toHaveBeenCalledWith('');
  });

  it('should call getPaginationData with "next" on calling next()', () => {
    spyOn(component, 'getPaginationData');

    component.toalLength = 20;
    component.count = 10;

    component.next();

    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });

  it('should call getPaginationData with "prev" on calling prev()', () => {
    spyOn(component, 'getPaginationData');

    component.page = 2;

    component.prev();

    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should set globalSearch to empty string and call clear() on calling clearGloble()', () => {
    spyOn(component, 'clear');

    component.globalSearch = 'testSearch';

    component.clearGloble();

    expect(component.globalSearch).toBe('');
    expect(component.clear).toHaveBeenCalled();
  });

 
  it('should clear filtersModel and filterKeys and call getAgentAdviseList on calling clearFilters()', () => {
    spyOn(component, 'getAgentAdviseList');

    component.filtersModel = ['test1', 'test2', 'test3'];
    component.filterKeys = { col1: 'test1', col2: 'test2', col3: 'test3' };

    component.clearFilters();

    expect(component.filtersModel).toEqual([]);
    expect(component.filterKeys).toEqual({});
    expect(component.getAgentAdviseList).toHaveBeenCalledWith('');
  });

  
  
 
 
});