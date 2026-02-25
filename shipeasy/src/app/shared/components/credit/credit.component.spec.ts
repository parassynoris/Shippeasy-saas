import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormBuilder, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import * as XLSX from "xlsx";
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common'; import { OrderByPipe } from 'src/app/shared/util/sort';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonService } from 'src/app/services/common/common.service';
// import { format } from 'path';
import { MatDrawer } from '@angular/material/sidenav';
import { CreditComponent } from './credit.component';
import { FilterPipe1 } from '../route/route.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator } from '@angular/material/paginator';


@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('CreditComponent', () => {
  let component: CreditComponent;
  let fixture: ComponentFixture<CreditComponent>;
  let mockNgbModal: jasmine.SpyObj<NgbModal>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockNotificationService: jasmine.SpyObj<NzNotificationService>;
  let mockMastersService: jasmine.SpyObj<MastersService>;
  let mockProfilesService: jasmine.SpyObj<ProfilesService>;
  let mockCognitoService: jasmine.SpyObj<CognitoService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let commonServiceSpy: jasmine.SpyObj<CommonService>;
  let formBuilder: FormBuilder;
  let dataSource: MatTableDataSource<any>
  beforeEach(waitForAsync(() => {
    mockNgbModal = jasmine.createSpyObj('NgbModal', ['open']);
    mockApiService = jasmine.createSpyObj('ApiService', ['getSTList', 'addToST', 'UpdateToST', 'deleteST']);
    mockNotificationService = jasmine.createSpyObj('NzNotificationService', ['create']);
    mockMastersService = jasmine.createSpyObj('MastersService', ['getSTList']);
    mockProfilesService = jasmine.createSpyObj('ProfilesService', ['getUserDetails']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails', 'getagentDetails']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList', 'UpdateToST']);

    TestBed.configureTestingModule({
      declarations: [CreditComponent, MockTranslatePipe, FilterPipe1],
      imports: [NgbModule, MatInputModule, ReactiveFormsModule, FormsModule, NzSelectModule, NzDatePickerModule, RouterTestingModule, BrowserAnimationsModule, HttpClientModule],
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
    formBuilder = new FormBuilder();
    fixture = TestBed.createComponent(CreditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getCreditNoteList on ngOnInit', () => {
    spyOn(component, 'getCreditNoteList');
    component.ngOnInit();
    expect(component.getCreditNoteList).toHaveBeenCalled();
  });


  it('should reset filters and call getCreditNoteList on clear', () => {
    spyOn(component, 'getCreditNoteList');
    component.clearFilters();
    expect(component.filtersModel).toEqual([]);
    expect(component.filterKeys).toEqual({});
    expect(component.getCreditNoteList).toHaveBeenCalled();
  });

  it('should clear filters and call getCreditNoteList on clearFilters', () => {
    spyOn(component, 'getCreditNoteList');
    component.clearFilters();
    expect(component.filtersModel).toEqual([]);
    expect(component.filterKeys).toEqual({});
    expect(component.getCreditNoteList).toHaveBeenCalled();
  });

  it('should call getCreditNoteList on ngOnInit', () => {
    spyOn(component, 'getCreditNoteList');
    component.ngOnInit();
    expect(component.getCreditNoteList).toHaveBeenCalled();
  });

  it('should clear filters and call getCreditNoteList on clear', () => {
    spyOn(component, 'getCreditNoteList');
    component.clearFilters();
    expect(component.filtersModel).toEqual([]);
    expect(component.filterKeys).toEqual({});
    expect(component.getCreditNoteList).toHaveBeenCalled();
  });


  it('should apply filter and update dataSource on applyFilter', () => {
    const filterValue = 'test';
    component.applyFilter(filterValue);
    expect(component.dataSource.filter).toBe(filterValue);
  });

  it('should reset filters and call getCreditNoteList on clearFilters', () => {
    spyOn(component, 'getCreditNoteList');
    component.clearFilters();
    expect(component.filtersModel).toEqual([]);
    expect(component.filterKeys).toEqual({});
    expect(component.getCreditNoteList).toHaveBeenCalled();
  });









  afterEach(() => {
    TestBed.resetTestingModule();
  });




});
