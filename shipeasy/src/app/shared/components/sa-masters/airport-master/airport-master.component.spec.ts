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
import { AirportMasterComponent } from './airport-master.component';



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
  useExisting: forwardRef(() => AirportMasterComponent),
  multi: true
};

describe('AirportMasterComponent', () => {
  let component: AirportMasterComponent;
  let fixture: ComponentFixture<AirportMasterComponent>;
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
    mockMastersService = jasmine.createSpyObj('MastersService', ['getSTList','systemtypeList']);
    mockProfilesService = jasmine.createSpyObj('ProfilesService', ['getUserDetails']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails', 'getModule']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList']);

    TestBed.configureTestingModule({
      declarations: [AirportMasterComponent, MockTranslatePipe,],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientModule, RouterModule, ReactiveFormsModule, RouterModule, TranslateModule.forRoot(), NzSelectModule, NzDatePickerModule, BrowserAnimationsModule],
      providers: [DatePipe, OrderByPipe, TranslateService, MastersSortPipe,
        { provide: NgbModal, useValue: mockNgbModal }, CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR,

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
    fixture = TestBed.createComponent(AirportMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should initialize form on ngOnInit', () => {
    spyOn(component, 'formBuild');
    spyOn(component, 'getData');
    spyOn(component, 'getcountryList');
    spyOn(component, 'getSystemTypeDropDowns');
    spyOn(component, 'getPortMaster');

    component.ngOnInit();

    expect(component.formBuild).toHaveBeenCalled();
    expect(component.getData).toHaveBeenCalled();
    expect(component.getcountryList).toHaveBeenCalled();
    expect(component.getSystemTypeDropDowns).toHaveBeenCalled();
    expect(component.getPortMaster).toHaveBeenCalled();
  });
  
  it('should clear filters and call getData', () => {
    spyOn(component, 'getData');
    component.clear();
    expect(component.airPortcode).toBe('');
    expect(component.country).toBe('');
    expect(component.getData).toHaveBeenCalled();
  });
  it('should filter the dataSource based on the filter value', () => {
    const filterValue = 'test';
    component.dataSource.data = [
      { airPortname: 'test airport', airPortcode: 'TST' },
      { airPortname: 'another airport', airPortcode: 'ANR' }
    ];
  
    component.applyFilter(filterValue);
  
    expect(component.dataSource.filter).toBe(filterValue.trim().toLowerCase());
    expect(component.dataSource.filteredData.length).toBe(1);
    expect(component.dataSource.filteredData[0].airPortname).toBe('test airport');
  });
  
  it('should clear all filters and retrieve data', () => {
    spyOn(component, 'getData');
  
    component.filtersModel = ['test'];
    component.clearFilters();
  
    expect(component.filtersModel.length).toBe(0);
    expect(component.filterKeys).toEqual({});
    expect(component.getData).toHaveBeenCalled();
  });
  it('should call getData on ngOnInit', () => {
    spyOn(component, 'getData');
  
    component.ngOnInit();
  
    expect(component.getData).toHaveBeenCalled();
  });
  it('should call getData on ngOnInit', () => {
    spyOn(component, 'getData');
  
    component.ngOnInit();
  
    expect(component.getData).toHaveBeenCalled();
  });
    
});
