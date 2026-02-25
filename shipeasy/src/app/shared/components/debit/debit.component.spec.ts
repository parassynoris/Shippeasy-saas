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
import { DebitComponent } from './debit.component';
import { FilterPipe1 } from '../route/route.component';
import { MatDrawer } from '@angular/material/sidenav';

@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('DebitComponent', () => {
  let component: DebitComponent;
  let fixture: ComponentFixture<DebitComponent>;
  let mockNgbModal: jasmine.SpyObj<NgbModal>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockNotificationService: jasmine.SpyObj<NzNotificationService>;
  let mockMastersService: jasmine.SpyObj<MastersService>;
  let mockProfilesService: jasmine.SpyObj<ProfilesService>;
  let mockCognitoService: jasmine.SpyObj<CognitoService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let commonServiceSpy: jasmine.SpyObj<CommonService>;
  let formBuilder: FormBuilder;

  beforeEach(waitForAsync(() => {
    mockNgbModal = jasmine.createSpyObj('NgbModal', ['open']);
    mockApiService = jasmine.createSpyObj('ApiService', ['getSTList', 'addToST', 'UpdateToST', 'deleteST']);
    mockNotificationService = jasmine.createSpyObj('NzNotificationService', ['create']);
    mockMastersService = jasmine.createSpyObj('MastersService', ['getSTList']);
    mockProfilesService = jasmine.createSpyObj('ProfilesService', ['getUserDetails']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails','getagentDetails']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList', 'UpdateToST']);

    TestBed.configureTestingModule({
      declarations: [DebitComponent, MockTranslatePipe,FilterPipe1],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, NzSelectModule,NzDatePickerModule,RouterTestingModule,BrowserAnimationsModule ,HttpClientModule],
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
    fixture = TestBed.createComponent(DebitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

   it('should clear all properties and call getCreditNoteList', () => {
    // Assuming initial values for properties
    component.credit_note_no = '123';
    component.credit_note_to = '456';
    component.date = '2022-03-15';
    component.batch_no = '789';
    component.amount = '100';
    component.tax_amount = '10';
    component.invoiceNo = 'INV123';
    component.total_amount = '110';

    // Spy on getCreditNoteList
    spyOn(component, 'getCreditNoteList');

    // Call the clear function
    component.clear();

    // Check that properties are cleared
    expect(component.credit_note_no).toEqual('');
    expect(component.credit_note_to).toEqual('');
    expect(component.date).toEqual('');
    expect(component.batch_no).toEqual('');
    expect(component.amount).toEqual('');
    expect(component.tax_amount).toEqual('');
    expect(component.invoiceNo).toEqual('');
    expect(component.total_amount).toEqual('');

    // Check that getCreditNoteList is called
    expect(component.getCreditNoteList).toHaveBeenCalled();
  });

  it('should remove filter from MatTableDataSource when applyFilter is called with empty string', () => {
    // Set initial filter value
    const initialFilterValue = 'Doe';

    // Set filter value
    component.applyFilter(initialFilterValue);

    // Check that filter is applied to dataSource
    expect(component.dataSource.filter).toEqual(initialFilterValue.toLowerCase());

    // Call applyFilter with an empty string to remove the filter
    component.applyFilter('');

    // Check that filter is cleared from dataSource
    expect(component.dataSource.filter).toEqual('');

    // Check that MatTableDataSource is not filtered
    const filteredData = component.dataSource.filteredData;
    expect(filteredData.length).toEqual(component.dataSource.data.length); // All entries should be included
    // Add more expectations based on your specific data and filter conditions
  });

  it('should clear filters and call getCreditNoteList when clearFilters is called', () => {
    // Set initial values for testing
    component.filtersModel = [{ key: 'status', value: 'pending' }];
    component.filterKeys = { status: 'pending' };

    spyOn(component, 'getCreditNoteList'); // Spy on getCreditNoteList method

    // Call clearFilters function
    component.clearFilters();

    // Check that filtersModel is cleared
    expect(component.filtersModel).toEqual([]);

    // Check that filterKeys is cleared
    expect(component.filterKeys).toEqual({});

    // Check that getCreditNoteList is called
    expect(component.getCreditNoteList).toHaveBeenCalled();
  });



  it('should clear filters', () => {
    component.filtersModel = ['filter1', 'filter2'];
    component.filterKeys = { filter1: 'value1', filter2: 'value2' };

    component.clearFilters();

    expect(component.filtersModel.length).toBe(0);
    expect(component.filterKeys).toEqual({});
  });

  it('should set the filter in data source', () => {
    const filterValue = 'test';

    component.applyFilter(filterValue);

    expect(component.dataSource.filter).toBe(filterValue);
  });

  it('should get credit note list on initialization', () => {
    const getCreditNoteListSpy = spyOn(component, 'getCreditNoteList').and.callThrough();

    component.ngOnInit();

    expect(getCreditNoteListSpy).toHaveBeenCalled();
  });
  
  it('should clear search criteria', () => {
    component.credit_note_no = '123';
    component.credit_note_to = 'Test';
    component.date = '2022-03-11';
    
    component.clear();

    expect(component.credit_note_no).toBe('');
    expect(component.credit_note_to).toBe('');
    expect(component.date).toBe('');
    // Add more expectations for other cleared properties
  });

  it('should apply filter to data source', () => {
    const filterValue = 'test';

    component.applyFilter(filterValue);

    expect(component.dataSource.filter).toBe(filterValue);
  });

  // Add more test cases for different component methods


});
