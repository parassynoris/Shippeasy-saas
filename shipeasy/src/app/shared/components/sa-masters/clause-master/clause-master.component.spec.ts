import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { of } from 'rxjs';
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
import { DatePipe } from '@angular/common';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { ClauseMasterComponent } from './clause-master.component';
import { MastersSortPipe } from 'src/app/shared/util/mastersort';




@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('ClauseMasterComponent', () => {
  let component: ClauseMasterComponent;
  let fixture: ComponentFixture<ClauseMasterComponent>;
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
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList']);

    TestBed.configureTestingModule({
      declarations: [ClauseMasterComponent, MockTranslatePipe,MastersSortPipe],
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
        {provide:MastersSortPipe, useValue:MastersSortPipe},
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClauseMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form correctly', () => {
    expect(component.addClauseForm).toBeDefined();
    expect(component.addClauseForm.controls['clauseType']).toBeDefined();
    expect(component.addClauseForm.controls['port_Id']).toBeDefined();
    expect(component.addClauseForm.controls['remarks']).toBeDefined();
    expect(component.addClauseForm.controls['portOption']).toBeDefined();
    expect(component.addClauseForm.controls['status']).toBeDefined();
    expect(component.addClauseForm.controls['clauseName']).toBeDefined();
  });

  it('should call getportList on ngOnInit', () => {
    spyOn(component, 'getportList');
    component.ngOnInit();
    expect(component.getportList).toHaveBeenCalled();
  });

  it('should call getClauseType on ngOnInit', () => {
    spyOn(component, 'getClauseType');
    component.ngOnInit();
    expect(component.getClauseType).toHaveBeenCalled();
  });

  it('should call getData on ngOnInit', () => {
    spyOn(component, 'getData');
    component.ngOnInit();
    expect(component.getData).toHaveBeenCalled();
  });

  it('should call getPaginationData with "prev" when prev is called', () => {
    spyOn(component, 'getPaginationData');
    
    component.prev();

    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should call getPaginationData with "prev" when page is greater than 0 in prev', () => {
    spyOn(component, 'getPaginationData');
    component.page = 1;
    
    component.prev();

    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should not call getPaginationData with "prev" when page is 0 in prev', () => {
    spyOn(component, 'getPaginationData');
    component.page = 0;
    
    component.prev();

    expect(component.getPaginationData).not.toHaveBeenCalledWith('prev');
  });

  it('should call getPaginationData with the correct parameters in getPaginationData', () => {
    spyOn(component, 'getPaginationData');
    
    component.getPaginationData('prev');

    expect(component.fromSize).toEqual(1);
    expect(component.getPaginationData).toHaveBeenCalled();
  });

  it('should call getPaginationData with "next" when next is called and totalCount is greater than count', () => {
    spyOn(component, 'getPaginationData');
    component.toalLength = 15;
    component.count = 10;

    component.next();

    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });

  it('should not call getPaginationData with "next" when totalCount is equal to count in next', () => {
    spyOn(component, 'getPaginationData');
    component.toalLength = 10;
    component.count = 10;

    component.next();

    expect(component.getPaginationData).not.toHaveBeenCalledWith('next');
  });

  it('should call getPaginationData with "prev" when prev is called and page is greater than 0', () => {
    spyOn(component, 'getPaginationData');
    component.page = 2;

    component.prev();

    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should not call getPaginationData with "prev" when page is 0 in prev', () => {
    spyOn(component, 'getPaginationData');
    component.page = 0;

    component.prev();

    expect(component.getPaginationData).not.toHaveBeenCalledWith('prev');
  });

  it('should not call getPaginationData with "next" when toalLength is equal to count in next', () => {
    spyOn(component, 'getPaginationData');
    component.toalLength = 10;
    component.count = 10;

    component.next();

    expect(component.getPaginationData).not.toHaveBeenCalledWith('next');
    expect(component.page).toEqual(1);
    expect(component.count).toEqual(10);
  });

  it('should not call getPaginationData with "prev" when page is 0 in prev', () => {
    spyOn(component, 'getPaginationData');
    component.page = 0;

    component.prev();

    expect(component.getPaginationData).not.toHaveBeenCalledWith('prev');
    expect(component.page).toEqual(0);
    expect(component.count).toEqual(0);
  });

  it('should call getClauseType on ngOnInit', () => {
    spyOn(component, 'getClauseType');

    component.ngOnInit();

    expect(component.getClauseType).toHaveBeenCalled();
  });

  it('should call exportAsExcelFile on exportAsExcelFile', () => {
    spyOn(component, 'exportAsExcelFile');

    component.exportAsExcelFile();

    expect(component.exportAsExcelFile).toHaveBeenCalled();
  });

  it('should set size to e.target.value and call getData on filter when e.target.value is defined', () => {
    spyOn(component, 'getData');
    const mockEvent = { target: { value: 30 } };

    component.filter(mockEvent);

    expect(component.size).toEqual(30);
    expect(component.getData).toHaveBeenCalled();
  });

  it('should not call clear and getPaginationData with "prev" on prev when page is 0', () => {
    spyOn(component, 'clear');
    spyOn(component, 'getPaginationData');
    component.page = 0;

    component.prev();

    expect(component.clear).not.toHaveBeenCalled();
    expect(component.getPaginationData).not.toHaveBeenCalled();
    expect(component.page).toEqual(0);
  });

  it('should enable the form when show is not "show"', () => {
    component.open(null, null, null);

    expect(component.addClauseForm.enabled).toBeTrue();
  });

});
