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
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { MatSelectModule } from '@angular/material/select';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SmartaddComponent } from './smartadd.component';

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
  useExisting: forwardRef(() => SmartaddComponent),
  multi: true
};

describe('SmartaddComponent', () => {
  let component: SmartaddComponent;
  let fixture: ComponentFixture<SmartaddComponent>;
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
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails','getagentDetails']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList']);

    TestBed.configureTestingModule({
      declarations: [SmartaddComponent, MockTranslatePipe],
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
    fixture = TestBed.createComponent(SmartaddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form', () => {
    expect(component.smartAgentForm).toBeDefined();
    // Add more expectations for form controls
  });
  
  it('should be in add mode initially', () => {
    expect(component.isAddMode).toBeTrue();
  });

  // it('should display an alert for invalid file types during image upload', () => {
  //   const file = new File([''], 'test.txt', { type: 'text/plain' });
  //   const event = { target: { files: [file] } } as any;
  //   spyOn(window, 'alert');
  //   component.uploadImage(event);
  //   expect(window.alert).toHaveBeenCalledWith('Only images are allowed');
  // });

  it('should navigate back when the back button is clicked', () => {
    spyOn(component.location, 'back');
    component.backbtn();
    expect(component.location.back).toHaveBeenCalled();
  });

  it('should initialize the form correctly in edit mode', () => {
    component.isAddMode = false;
    component.id = 'mockAgentId'; // Replace with a valid agent ID for testing
    spyOn(component, 'getSmartAgentDetailById').and.returnValue(); // Mock the method
  
    component.ngOnInit();
  
    // Verify that getSmartAgentDetailById is called
    expect(component.getSmartAgentDetailById).toHaveBeenCalledWith('mockAgentId');
  });

  it('should call location.back() when the back button is clicked', () => {
    spyOn(component.location, 'back');
    component.backbtn();
    expect(component.location.back).toHaveBeenCalled();
  });

  it('should call getCurrencyDropDowns during initialization', () => {
    spyOn(component, 'getCurrencyDropDowns');
    component.ngOnInit();
    expect(component.getCurrencyDropDowns).toHaveBeenCalled();
  });

  it('should build the form correctly', () => {
    component.buildForm();
    
    // Add expectations based on your specific form structure
    expect(component.smartAgentForm).toBeDefined();
    expect(component.smartAgentForm.get('smartAgent')).toBeDefined();
    // Add more expectations for other form controls
  });
  
  it('should call getSmartAgentDetailById in edit mode', () => {
    component.isAddMode = false;
    spyOn(component, 'getSmartAgentDetailById');
  
    // Set the ID for testing purposes
    component.id = 'mockAgentId';
  
    // Trigger ngOnInit
    component.ngOnInit();
  
    // Verify that getSmartAgentDetailById is called with the correct ID
    expect(component.getSmartAgentDetailById).toHaveBeenCalledWith('mockAgentId');
  });
  
  it('should call getCurrencyDropDowns during initialization', () => {
    spyOn(component, 'getCurrencyDropDowns');
  
    // Trigger ngOnInit
    component.ngOnInit();
  
    // Verify that getCurrencyDropDowns is called
    expect(component.getCurrencyDropDowns).toHaveBeenCalled();
  });

  it('should show validation errors for required fields on form submission', () => {
    // Set the form to an invalid state by leaving required fields empty
    component.smartAgentForm.patchValue({
      // Set only non-required fields
    });
  
    // Trigger form submission
    component.onSave();
  
    // Check if the form is still marked as invalid
    expect(component.smartAgentForm.invalid).toBe(true);
  
    // Check if the required fields have the 'required' error
    expect(component.smartAgentForm.get('smartAgent').errors?.required).toBeTruthy();
    // Add more expectations for other required fields
  });

  it('should show validation error for the website field pattern on form submission', () => {
    // Set an invalid website pattern
    component.smartAgentForm.patchValue({
      website: 'invalidwebsite',
      // Set other required fields to make the form valid for submission
    });
  
    // Trigger form submission
    component.onSave();
  
    // Check if the form is still marked as invalid
    expect(component.smartAgentForm.invalid).toBe(true);
  
    // Check if the website field has the 'pattern' error
    expect(component.smartAgentForm.get('website').errors?.pattern).toBeTruthy();
  });

  it('should identify invalid controls in the form', () => {
    // Set the form to an invalid state
    component.smartAgentForm.patchValue({
      // Set only non-required fields
    });
  
    // Trigger form submission
    component.onSave();
  
    // Call findInvalidControls to get a list of invalid control names
    const invalidControls = component.findInvalidControls();
  
    // Add expectations based on your specific form structure
    expect(invalidControls).toContain('smartAgent');
    // Add more expectations for other invalid controls
  });

  it('should retrieve smart agent details in edit mode', () => {
    component.isAddMode = false;
    component.id = 'mockAgentId';
    spyOn(component, 'getSmartAgentDetailById');
  
    // Trigger component initialization
    component.ngOnInit();
  
    // Verify that getSmartAgentDetailById method is called with the correct parameter
    expect(component.getSmartAgentDetailById).toHaveBeenCalledWith('mockAgentId');
    // Add more expectations if necessary
  });
  
  it('should retrieve currency dropdown values on component initialization', () => {
    spyOn(component, 'getCurrencyDropDowns');
  
    // Trigger component initialization
    component.ngOnInit();
  
    // Verify that getCurrencyDropDowns method is called
    expect(component.getCurrencyDropDowns).toHaveBeenCalled();
    // Add more expectations if necessary
  });

  
  
});

