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
import { HolidaysComponent } from './holidays.component';

@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('HolidaysComponent', () => {
  let component: HolidaysComponent;
  let fixture: ComponentFixture<HolidaysComponent>;
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
      declarations: [HolidaysComponent, MockTranslatePipe],
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
    fixture = TestBed.createComponent(HolidaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should call getAll()', () => {
    spyOn(component, 'getAll');
    component.ngOnInit();
    expect(component.getAll).toHaveBeenCalled();
  });

  it('clear should reset form values and call getAll', () => {
    spyOn(component, 'getAll');
    component.clear();
    // Add your expectations to check form values are reset.
    expect(component.getAll).toHaveBeenCalled();
  });

  it('prev should call getPaginationData with "prev"', () => {
    spyOn(component, 'getPaginationData');
    component.prev();
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should create HolidaysComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should call getAll() method on ngOnInit', () => {
    spyOn(component, 'getAll');
    component.ngOnInit();
    expect(component.getAll).toHaveBeenCalled();
  });

  it('should clear filters and call getAll() on clear()', () => {
    spyOn(component, 'getAll');
    component.clear();
    expect(component.agentProfileName).toEqual('');
    expect(component.countryName).toEqual('');
    expect(component.holidayName).toEqual('');
    expect(component.holidayDate).toEqual('');
    expect(component.page).toEqual(1);
    expect(component.getAll).toHaveBeenCalled();
  });

  it('should go to the next page on next()', () => {
    spyOn(component, 'getPaginationData');
    component.toalLength = 20; // Assuming there is more data available
    component.count = 10; // Assuming 10 items are currently displayed
    component.next();
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });

  it('should go to the previous page on prev()', () => {
    spyOn(component, 'getPaginationData');
    component.page = 2; // Assuming we are on page 2
    component.prev();
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should apply filter on applyFilter()', () => {
    const filterValue = 'Christmas'; // Replace with a sample filter value
    component.applyFilter(filterValue);
    expect(component.dataSource.filter).toEqual(filterValue.toLowerCase());
    // Add more assertions as needed
  });

  it('should export data to Excel on export()', () => {
    const spyExportToExcel = spyOn(component.commonfunction, 'exportToExcel');
    component.export();
    expect(spyExportToExcel).toHaveBeenCalled();
    // Add more assertions as needed
  });

  it('should apply custom filter on applyFilter()', () => {
    const filterValue = 'Christmas'; // Replace with a sample filter value
    component.applyFilter(filterValue);
    // Assuming dataSource.filterPredicate is set to the custom function
    expect(component.dataSource.filter).toEqual(filterValue.toLowerCase());
    // Add more assertions as needed
  });

  it('should reset filters and call getAll() on clearFilters()', () => {
    spyOn(component, 'getAll');
    component.clearFilters();
    expect(component.filtersModel).toEqual([]);
    expect(component.filterKeys).toEqual({});
    expect(component.getAll).toHaveBeenCalled();
    // Add more assertions as needed
  });

  it('should fetch route parameters and initialize the component on ngOnInit', () => {
    spyOn(component, 'getAll');
    component.urlParam = { prentPath: 'samplePath' }; // Replace with sample data
    component.ngOnInit();
    // Ensure that getAll is called with correct parameters
    expect(component.getAll).toHaveBeenCalledWith();
    // Add more assertions as needed
  });

  it('should not attempt to go to the next page when there is no remaining data on next()', () => {
    spyOn(component, 'getPaginationData');
    component.toalLength = 10; // Assuming totalLength is equal to the displayed count
    component.count = 10;
    component.next();
    // Ensure that getPaginationData is not called when there is no remaining data
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });

  it('should clear filters and reset data on clear() with filters applied', () => {
    spyOn(component, 'getAll');
    component.holidayName = 'Christmas'; // Assuming a filter is applied
    component.clear();
    // Ensure that filters are cleared and getAll is called
    expect(component.holidayName).toEqual('');
    expect(component.getAll).toHaveBeenCalled();
    // Add more assertions as needed
  });

  it('should initialize the component with a parent ID on ngOnInit', () => {
    spyOn(component, 'getAll');
    component.route.snapshot.params['id'] = '123'; // Replace with a sample parent ID
    component.ngOnInit();
    // Ensure that getAll is called with correct parameters
    expect(component.getAll).toHaveBeenCalledWith();
    // Add more assertions as needed
  });

  it('should not attempt to go to the next page when there is no remaining data on next()', () => {
    spyOn(component, 'getPaginationData');
    component.toalLength = 10; // Assuming totalLength is equal to the displayed count
    component.count = 10;
    component.next();
    // Ensure that getPaginationData is not called when there is no remaining data
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });

  

});

