import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
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
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { DriverMasterComponent } from './driver-master.component';
import { LoaderService } from 'src/app/services/loader.service';

 
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
  useExisting: forwardRef(() => DriverMasterComponent),
  multi: true
};
 
describe('DriverMasterComponent', () => {
  let component: DriverMasterComponent;
  let fixture: ComponentFixture<DriverMasterComponent>;
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
    mockProfilesService = jasmine.createSpyObj('ProfilesService', ['getUserDetails', 'getSmartAgentById']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList','getDashboardReport']);
 
    TestBed.configureTestingModule({
      declarations: [DriverMasterComponent,MockTranslatePipe],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, MatAutocompleteModule, NzSelectModule, NzDatePickerModule, RouterTestingModule, HttpClientModule, RouterModule, BrowserAnimationsModule, ReactiveFormsModule, RouterModule],
      providers: [DatePipe, OrderByPipe,
        { provide: ApiService, useVale: mockApiService },
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
    fixture = TestBed.createComponent(DriverMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
 
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form', () => {
    component.formBuild();
    expect(component.addDriverForm).toBeDefined();
    expect(component.addDriverForm.contains('driverName')).toBeTruthy();
    expect(component.addDriverForm.contains('driverContactNumber')).toBeTruthy();
    expect(component.addDriverForm.contains('driverLicenseNumber')).toBeTruthy();
  });

  it('should call getData on init', () => {
    spyOn(component, 'getData');
    component.ngOnInit();
    expect(component.getData).toHaveBeenCalled();
  });

  it('should apply filter to dataSource', () => {
    const filterValue = 'john';
    component.dataSource.data = [
      { driverName: 'John', driverContactNumber: '12345', driverLicenseNumber: 'AB123', status: true },
      { driverName: 'Doe', driverContactNumber: '67890', driverLicenseNumber: 'CD456', status: false }
    ];

    component.applyFilter(filterValue);

    expect(component.dataSource.filter).toBe(filterValue.trim().toLowerCase());
  
  });


  it('should build the form on initialization', () => {
    component.ngOnInit();
    expect(component.addDriverForm).toBeTruthy();
    expect(component.addDriverForm.controls.driverName).toBeTruthy();
    expect(component.addDriverForm.controls.driverContactNumber).toBeTruthy();
    expect(component.addDriverForm.controls.driverLicenseNumber).toBeTruthy();
  });
 
  it('should clear filters and reload data', () => {
    spyOn(component, 'getData').and.callThrough();
    component.clearFilters();
    expect(component.filtersModel).toEqual([]);
    expect(component.filterKeys).toEqual({});
    expect(component.getData).toHaveBeenCalled();
  });

  it('should handle file selection correctly', () => {
    const event = {
      target: {
        value: 'C:\\fakepath\\testfile.pdf',
        files: [new File([], 'testfile.pdf')]
      }
    };
    component.onFileSelected(event, 'license');
    expect(component.addDriverForm.get('licenseDocumentName')?.value).toEqual('testfile.pdf');
    expect(component.fileTypeNotMatched).toBeFalse();
  });

  it('should validate file type and show error for invalid file type', () => {
    const event = {
      target: {
        value: 'C:\\fakepath\\testfile.xyz',
        files: [new File([], 'testfile.xyz')]
      }
    };
    component.onFileSelected(event, 'license');
    expect(component.addDriverForm.get('licenseDocumentName')?.value).toEqual('testfile.xyz');
    expect(component.fileTypeNotMatched).toBeTrue();
  });

  

  it('should correctly toggle filters', () => {
    component.toggleFilters = false;
    component.getData();
    expect(component.toggleFilters).toBeFalse();
  });

  it('should correctly clear form fields', () => {
    component.clear();
    expect(component.driver).toBe('');
    expect(component.driverName).toBe('');
    expect(component.driverContactNumber).toBe('');
    expect(component.driverLicenseNumber).toBe('');
  });

  it('should apply filter to the table data', () => {
    const filterValue = 'john';
    component.applyFilter(filterValue);
    expect(component.dataSource.filter).toBe(filterValue.toLowerCase().trim());
  });

  it('should handle page change correctly', () => {
    const event = { pageIndex: 1, pageSize: 5 };
    spyOn(component, 'getData').and.callThrough();
    component.onPageChange(event);
    expect(component.pageNumber).toBe(2);
    expect(component.pageSize).toBe(5);
    expect(component.from).toBe(5);
    expect(component.getData).toHaveBeenCalled();
  });

});
