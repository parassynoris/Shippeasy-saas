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
import { EditEgmComponent } from './edit-egm.component';
import { of, throwError } from 'rxjs';

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
  useExisting: forwardRef(() => EditEgmComponent),
  multi: true
};

describe('EditEgmComponent', () => {
  let component: EditEgmComponent;
  let fixture: ComponentFixture<EditEgmComponent>;
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
    mockProfilesService = jasmine.createSpyObj('ProfilesService', ['getUserDetails','getSmartAgentById']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList']);

    TestBed.configureTestingModule({
      declarations: [EditEgmComponent, MockTranslatePipe],
      imports: [NgbModule, ReactiveFormsModule, FormsModule,MatAutocompleteModule,NzSelectModule,RouterTestingModule, HttpClientModule,RouterModule,BrowserAnimationsModule,ReactiveFormsModule,RouterModule],
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
    fixture = TestBed.createComponent(EditEgmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

   it('should handle the case where jobId is null or undefined', () => {
    // Arrange
    const nullJobId = null;
    const undefinedJobId = undefined;
    const mockJobData = [
      { jobId: 123, vesselDetails: { vesselId: 'Vessel123', voyageNo: 'Voyage123' }, portDetails: { port: 'Port123' } },
      // Add more job data as needed
    ];
    component.jobData = mockJobData;

    // Act
    component.jobSelect(nullJobId);
    const formValuesAfterNullJobId = { ...component.egmForm.value }; // Save form values after the first call
    component.jobSelect(undefinedJobId);

    // Assert
    expect(component.selectedJob).toBeUndefined();
    // Ensure form values remain unchanged after both calls
    expect(component.egmForm.value).toEqual(formValuesAfterNullJobId);
  });

  it('should update form values when the job data structure changes', () => {
    // Arrange
    const jobId = 123;
    const initialMockJobData = [
      { jobId: 123, vesselDetails: { vesselId: 'Vessel123', voyageNo: 'Voyage123' }, portDetails: { port: 'Port123' } },
      // Add more job data as needed
    ];
    const updatedMockJobData = [
      { jobId: 123, vesselDetails: { vesselId: 'UpdatedVessel', voyageNo: 'UpdatedVoyage' }, portDetails: { port: 'UpdatedPort' } },
      // Add more updated job data as needed
    ];
    component.jobData = initialMockJobData;

    // Act
    component.jobSelect(jobId);
    component.jobData = updatedMockJobData;
    component.jobSelect(jobId);

    // Assert
    expect(component.selectedJob).toEqual(updatedMockJobData[0]);
    expect(component.egmForm.get('vessel').value).toEqual('UpdatedVessel'); // Ensure form values are updated correctly
    expect(component.egmForm.get('voyage').value).toEqual('UpdatedVoyage');
    expect(component.egmForm.get('port').value).toEqual('UpdatedPort');
  });

  it('should handle the case where jobData contains multiple jobs with the same ID', () => {
    // Arrange
    const jobId = 123;
    const mockJobData = [
      { jobId: 123, vesselDetails: { vesselId: 'Vessel123', voyageNo: 'Voyage123' }, portDetails: { port: 'Port123' } },
      { jobId: 123, vesselDetails: { vesselId: 'Vessel456', voyageNo: 'Voyage456' }, portDetails: { port: 'Port456' } },
      // Add more job data as needed
    ];
    component.jobData = mockJobData;

    // Act
    component.jobSelect(jobId);

    // Assert
    expect(component.selectedJob).toEqual(mockJobData[0]); // Ensure the first matching job is selected
    expect(component.egmForm.get('vessel').value).toEqual('Vessel123'); // Ensure form values are updated correctly
    expect(component.egmForm.get('voyage').value).toEqual('Voyage123');
    expect(component.egmForm.get('port').value).toEqual('Port123');
  });

  it('should create the component and initialize the form with default values', () => {
    // Arrange & Act
    component.ngOnInit();

    // Assert
    expect(component.egmForm).toBeDefined();
    expect(component.egmForm.get('job').value).toBe('');
    expect(component.egmForm.get('port').value).toBe('');
    expect(component.egmForm.get('vessel').value).toBe('');
    expect(component.egmForm.get('voyage').value).toBe('');
    // ... Repeat for other form controls with default values

    // Custom Validators
    expect(component.egmForm.get('vessel').errors).toEqual({ required: true });
    expect(component.egmForm.get('voyage').errors).toEqual({ required: true });
    // ... Repeat for other form controls with Validators.required

    // Custom initial values
    expect(component.egmForm.get('light_dues').value).toBe('');
    expect(component.egmForm.get('toc').value).toBe('');
    // ... Repeat for other form controls with custom initial values
  });

  it('should initialize form with default values when localStorage.getItem returns null', () => {
    // Arrange
    spyOn(localStorage, 'getItem').and.returnValue(null);

    // Act
    component.ngOnInit();

    // Assert
    // Modify assertions based on your actual implementation
    expect(component.egmForm.get('vessel').value).toBe('');
    expect(component.egmForm.get('voyage').value).toBe('');
    // ... Repeat for other form controls based on your actual implementation
  });

  it('should set the default values and validators for the form controls', () => {
    // Arrange & Act
    component.ngOnInit();

    // Assert
    expect(component.egmForm.get('job').value).toBe('');
    expect(component.egmForm.get('port').value).toBe('');
    expect(component.egmForm.get('vessel').value).toBe('');
    expect(component.egmForm.get('voyage').value).toBe('');
    // ... Repeat for other form controls with default values

    // Custom Validators
    expect(component.egmForm.get('vessel').errors).toEqual({ required: true });
    expect(component.egmForm.get('voyage').errors).toEqual({ required: true });
    // ... Repeat for other form controls with Validators.required
  });

  it('should handle additional scenarios or cases', () => {
    // Arrange & Act
    // Set up additional properties or conditions for testing

    // Assert
    // Make assertions based on additional scenarios or cases
  });

  
});

