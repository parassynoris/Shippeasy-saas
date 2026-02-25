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
import { IgmComponent } from './igm.component';




@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('BankMasterComponent', () => {
  let component: IgmComponent;
  let fixture: ComponentFixture<IgmComponent>;
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
      declarations: [IgmComponent, MockTranslatePipe],
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
    fixture = TestBed.createComponent(IgmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form on ngOnInit', () => {
    component.ngOnInit();
    expect(component.igmForm).toBeDefined();
  });

  it('should call getPaginationData when prev is called', () => {
    spyOn(component, 'getPaginationData');
    component.prev();
    expect(component.getPaginationData).toHaveBeenCalled();
  });

  it('should call getIgmData when filter is called', () => {
    spyOn(component, 'getIgmData');
    const event = { target: { value: '20' } };
    component.filter(event);
    expect(component.getIgmData).toHaveBeenCalled();
  });

  it('should update dataSource on getPaginationData success', () => {
    const data = { hits: { hits: [{ igm_no: 'IGM123', custom_agent_code: 'ABC' }], total: { value: 1 } } };
    spyOn(component.transactionService, 'getIgm').and.returnValue(of(data));
    spyOn(component, 'getPortData');

    component.getPaginationData('next');

    expect(component.igmList).toEqual(data.hits.hits as any);
    expect(component.getPortData).toHaveBeenCalled();
  });

  it('should call getIgmData when clearFilters is called', () => {
    spyOn(component, 'getIgmData');
    component.clearFilters();

    expect(component.getIgmData).toHaveBeenCalled();
  });

  it('should set isHoldType to "edit" when onOpen is called with type "edit"', () => {
    component.onOpen('edit');
    expect(component.isHoldType).toEqual('edit');
  });

  it('should call getIgmData when next is called and toalLength is greater than count', () => {
    component.toalLength = 30;
    component.count = 10;
    spyOn(component, 'getPaginationData');

    component.next();

    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });

  it('should not call getPaginationData when next is called and toalLength is equal to count', () => {
    component.toalLength = 30;
    component.count = 30;
    spyOn(component, 'getPaginationData');

    component.next();

    expect(component.getPaginationData).not.toHaveBeenCalled();
  });

  it('should call getIgmData when clearFilters is called', () => {
    spyOn(component, 'getIgmData');
    component.clearFilters();

    expect(component.getIgmData).toHaveBeenCalled();
  });

  it('should call getPaginationData with "prev" when prev button is clicked', () => {
    spyOn(component, 'getPaginationData');

    component.prev();

    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should set isHoldType to "edit" when onOpen is called with type "edit"', () => {
    component.onOpen('edit');
    expect(component.isHoldType).toEqual('edit');
  });

  it('should set isHoldType to "add" when onOpen is called with type "add"', () => {
    component.onOpen('add');
    expect(component.isHoldType).toEqual('add');
  });

  it('should call getPaginationData with "prev" when prev button is clicked', () => {
    spyOn(component, 'getPaginationData');

    component.prev();

    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should call getIgmData when clearFilters is called', () => {
    spyOn(component, 'getIgmData');

    component.clearFilters();

    expect(component.getIgmData).toHaveBeenCalled();
  });

  it('should call getPaginationData with "prev" when prev button is clicked', () => {
    spyOn(component, 'getPaginationData');

    component.prev();

    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should not navigate to the next page when next button is clicked at the end', () => {
    spyOn(component, 'getPaginationData');
    component.toalLength = 30;
    component.count = 30;

    component.next();

    expect(component.page).toBe(1);
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });

});

