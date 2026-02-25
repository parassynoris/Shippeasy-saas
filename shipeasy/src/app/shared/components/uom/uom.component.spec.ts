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
import { UomComponent } from './uom.component';
import { MastersSortPipe } from '../../util/mastersort';




@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('UomComponent', () => {
  let component: UomComponent;
  let fixture: ComponentFixture<UomComponent>;
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
      declarations: [UomComponent, MockTranslatePipe],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientModule],
      providers: [DatePipe, OrderByPipe,MastersSortPipe,
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
    fixture = TestBed.createComponent(UomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form correctly', () => {
    expect(component.uomForm).toBeDefined();
    expect(component.uomForm.get('uomCategory')).toBeDefined();
    // Add more expectations for other form controls
  });

  it('should call getPaginationData with "prev" on prev()', () => {
    spyOn(component, 'getPaginationData');

    component.prev();

    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should clear search parameters and call getUomList on clear()', () => {
    spyOn(component, 'getUomList');
    component.uomName = 'SampleName';
    component.uomShort = 'SampleShort';
    component.uomCategory = 'SampleCategory';

    component.clear();

    expect(component.uomName).toEqual('');
    expect(component.uomShort).toEqual('');
    expect(component.uomCategory).toEqual('');
    expect(component.getUomList).toHaveBeenCalled();
  });

  it('should call getPaginationData on next() if there is more data to fetch', () => {
    spyOn(component, 'getPaginationData');
    component.toalLength = 15;
    component.count = 10;
  
    component.next();
  
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });
  
  it('should not call getPaginationData on next() if all data is already fetched', () => {
    spyOn(component, 'getPaginationData');
    component.toalLength = 10;
    component.count = 10;
  
    component.next();
  
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });
  
  it('should call getPaginationData on prev() if there are previous pages', () => {
    spyOn(component, 'getPaginationData');
    component.page = 2;
  
    component.prev();
  
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should call getPaginationData on next() if there is more data to fetch', () => {
    spyOn(component, 'getPaginationData');
    component.toalLength = 15;
    component.count = 10;
  
    component.next();
  
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });
  
  it('should not call getPaginationData on next() if all data is already fetched', () => {
    spyOn(component, 'getPaginationData');
    component.toalLength = 10;
    component.count = 10;
  
    component.next();
  
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });
  
  it('should call getPaginationData on prev() if there are previous pages', () => {
    spyOn(component, 'getPaginationData');
    component.page = 2;
  
    component.prev();
  
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });
  
  it('should not call getPaginationData on clear() if search parameters are not set', () => {
    spyOn(component, 'getPaginationData');
  
    component.clear();
  
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });

  it('should call getPaginationData with proper payload on next()', () => {
    spyOn(component, 'getPaginationData');
    component.toalLength = 15;
    component.count = 10;
  
    component.next();
  
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });
  
  it('should not call getPaginationData on next() if all data is already fetched', () => {
    spyOn(component, 'getPaginationData');
    component.toalLength = 10;
    component.count = 10;
  
    component.next();
  
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });
  
  it('should call getPaginationData with proper payload on prev()', () => {
    spyOn(component, 'getPaginationData');
    component.page = 2;
  
    component.prev();
  
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  
  it('should call getPaginationData with prev on prev()', () => {
    spyOn(component, 'getPaginationData');
  
    component.prev();
  
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

});

