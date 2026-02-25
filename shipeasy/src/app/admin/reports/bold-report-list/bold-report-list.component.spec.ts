import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { NgbDatepicker, NgbModal, NgbModalRef, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { of } from 'rxjs';
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
// import { BoldReportComponents } from '@boldreports/angular-reporting-components';
import { BoldReportListComponent } from './bold-report-list.component';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { MatSelectModule } from '@angular/material/select';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

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
  useExisting: forwardRef(() => BoldReportListComponent),
  multi: true
};

describe('BoldReportListComponent', () => {
  let component: BoldReportListComponent;
  let fixture: ComponentFixture<BoldReportListComponent>;
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
      declarations: [BoldReportListComponent, MockTranslatePipe],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientModule,RouterModule,NzSelectModule,ReactiveFormsModule,MatSelectModule,NzDatePickerModule,FormsModule
      ,NoopAnimationsModule],
      providers: [DatePipe, OrderByPipe,
        { provide: NgbModal, useValue: mockNgbModal },CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR,

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
    fixture = TestBed.createComponent(BoldReportListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form on component creation', () => {
    // Arrange & Act
    component.ngOnInit();

    // Assert
    expect(component.addCountryForm.get('reportName').value).toBe('');
    expect(component.addCountryForm.get('reportId').value).toBe('');
    expect(component.addCountryForm.get('status').value).toBe(true);
  });

  it('should navigate to report viewer with correct parameters', () => {
    // Arrange
    const mockReport = { typeDescription: 'Mock Report', typeName: 'MockReportType' };
    spyOn(component.router, 'navigate');

    // Act
    component.redirect(mockReport);

    // Assert
    expect(component.router.navigate).toHaveBeenCalledWith(
      ['reports/st-reports', 'reportViewer'],
      { queryParams: { boldId: mockReport.typeDescription, reportname: mockReport.typeName } }
    );
  });

  it('should navigate to report editor on GOTODIY', () => {
    // Arrange
    spyOn(component.router, 'navigate');

    // Act
    component.GOTODIY();

    // Assert
    expect(component.router.navigate).toHaveBeenCalledWith(['reports/st-reports/reportEditor']);
  });

  it('should handle error when navigating to the report viewer fails', () => {
    // Arrange
    const mockData = { typeDescription: 'Mock Report Desc', typeName: 'Mock Report Name' };
    spyOn(component.router, 'navigate').and.throwError('Error navigating to the report viewer');

    // Act & Assert
    expect(() => component.redirect(mockData)).toThrowError('Error navigating to the report viewer');
    // You may add further assertions based on your error handling logic
  });

  it('should handle error when navigating to the report editor fails in GOTODIY', () => {
    // Arrange
    spyOn(component.router, 'navigate').and.throwError('Error navigating to the report editor');

    // Act & Assert
    expect(() => component.GOTODIY()).toThrowError('Error navigating to the report editor');
    // You may add further assertions based on your error handling logic
  });
});
