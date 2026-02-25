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
import { PLComponent } from './pnl.component';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
@Pipe({ name: 'customCurrency' })
class MockCustomCurrencyPipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    return value; // Simply return the value for testing
  }
}

 
 
 
@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}
 
describe('PLComponent', () => {
  let component: PLComponent;
  let fixture: ComponentFixture<PLComponent>;
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
      declarations: [PLComponent, MockTranslatePipe,MockCustomCurrencyPipe],
      imports: [NgbModule, ReactiveFormsModule,BrowserAnimationsModule,NzDatePickerModule,NgMultiSelectDropDownModule,NzSelectModule, FormsModule, RouterTestingModule, HttpClientModule],
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
    fixture = TestBed.createComponent(PLComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
 
  it('should create', () => {
    expect(component).toBeTruthy();
  });




 





  it('should initialize chart on init', () => {

    spyOn(component, 'initChart');

    component.ngOnInit();

    expect(component.initChart).toHaveBeenCalled();

  });

  it('should download CSV', () => {

    spyOn(component, 'downloadFile');

    component.downloadCSV();

    expect(component.downloadFile).toHaveBeenCalled();

  });



  



  it('should update date range and get batch list', () => {

    spyOn(component, 'getBatchList');

    component.onDateRangeChange('last_3_months');

    expect(component.getBatchList).toHaveBeenCalled();

  });



 



  class MockCognitoService {

    getUserDatails() {

      // Mock implementation

    }

  }

 

  // Mock implementation of CommonFunctions

  class MockCommonFunctions {

    get() {

      // Mock implementation

    }

    getAuthToken() {

      // Provide a mock implementation or return a default value

    }

  }
  
  
 
 
});