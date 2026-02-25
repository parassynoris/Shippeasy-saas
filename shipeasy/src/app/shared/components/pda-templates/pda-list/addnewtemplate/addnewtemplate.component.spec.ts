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
import { AddnewtemplateComponent } from './addnewtemplate.component';







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
  useExisting: forwardRef(() => AddnewtemplateComponent),
  multi: true
};

describe('AddnewtemplateComponent', () => {
  let component: AddnewtemplateComponent;
  let fixture: ComponentFixture<AddnewtemplateComponent>;
  let mockNgbModal: jasmine.SpyObj<NgbModal>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockNotificationService: jasmine.SpyObj<NzNotificationService>;
  let mockMastersService: jasmine.SpyObj<MastersService>;
  let mockProfilesService: jasmine.SpyObj<ProfilesService>;
  let mockCognitoService: jasmine.SpyObj<CognitoService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockSaMasterService: jasmine.SpyObj<SaMasterService>
  
    beforeEach(waitForAsync(() => {
    mockNgbModal = jasmine.createSpyObj('NgbModal', ['open']);
    mockApiService = jasmine.createSpyObj('ApiService', ['getSTList', 'addToST', 'UpdateToST', 'deleteST','getListByURL']);
    mockNotificationService = jasmine.createSpyObj('NzNotificationService', ['create']);
    mockMastersService = jasmine.createSpyObj('MastersService', ['getSTList','cityList','systemtypeList']);
    mockProfilesService = jasmine.createSpyObj('ProfilesService', ['getUserDetails','getCurrentAgentDetails']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails','getModule','getagentDetails']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList','getListByURL']);
    mockSaMasterService = jasmine.createSpyObj('SaMasterService', ['cityList']);
    TestBed.configureTestingModule({
      declarations: [AddnewtemplateComponent, MockTranslatePipe,],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientModule,RouterModule,ReactiveFormsModule,RouterModule,TranslateModule.forRoot(),NzSelectModule,NzDatePickerModule,BrowserAnimationsModule],
      providers: [DatePipe, OrderByPipe,TranslateService,MastersSortPipe,
        { provide: NgbModal, useValue: mockNgbModal },CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR,

        { provide: ApiService, useValue: mockApiService },
        { provide: NzNotificationService, useValue: mockNotificationService },
        { provide: MastersService, useValue: mockMastersService },
        { provide: ProfilesService, useValue: mockProfilesService },
        { provide: SaMasterService, useValue: mockSaMasterService },
        { provide: CognitoService, useValue: mockCognitoService },
        { provide: CommonService, useValue: mockCommonService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddnewtemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with empty values', () => {
    expect(component.addNewTemplate).toBeDefined();
    expect(component.addNewTemplate.valid).toBeFalsy();
  });

  it('should mark form fields as invalid if they are touched and left empty', () => {
    let templateName = component.addNewTemplate.controls['template_name'];
    expect(templateName.valid).toBeFalsy();
    expect(templateName.errors.required).toBeTruthy();
    templateName.setValue('Sample Template'); // Set a value
    expect(templateName.valid).toBeTruthy(); // Now it should be valid
  });
  
  it('should emit CloseAction event on onClose()', () => {
    spyOn(component.CloseAction, 'emit');
    component.onClose(null);
    expect(component.CloseAction.emit).toHaveBeenCalled();
  });
 
  it('should emit CloseAction event when close button is clicked', () => {
    spyOn(component.CloseAction, 'emit');
    component.onClose(null);
    expect(component.CloseAction.emit).toHaveBeenCalled();
  }); 

  it('should initialize the form with default values', () => {
    const form = component.addNewTemplate;
    expect(form).toBeDefined();
    expect(form.controls.template_name.value).toBe('');
    expect(form.controls.process_type.value).toBe('');
    expect(form.controls.Template_type.value).toBe('');
    expect(form.controls.activity_type.value).toBe('');
    expect(form.controls.activity_name.value).toBe('');
  });

  it('should call onClose and emit event', () => {
    spyOn(component.CloseAction, 'emit');
    const event = new Event('close');
    component.onClose(event);
    expect(component.CloseAction.emit).toHaveBeenCalledWith(event);
  });

  it('should return form controls', () => {
    const controls = component.f;
    expect(controls).toBe(component.addNewTemplate.controls);
  });

  it('should set submitted to true on calling onSave', () => {
    component.onSave();
    expect(component.submitted).toBeTrue();
  });

  it('should validate form fields', () => {
    const form = component.addNewTemplate;
    form.controls.template_name.setValue('');
    form.controls.process_type.setValue('');
    form.controls.Template_type.setValue('');
    form.controls.activity_type.setValue('');
    form.controls.activity_name.setValue('');

    expect(form.valid).toBeFalse();

    form.controls.template_name.setValue('Template 1');
    form.controls.process_type.setValue('Process 1');
    form.controls.Template_type.setValue('Type 1');
    form.controls.activity_type.setValue('Activity Type 1');
    form.controls.activity_name.setValue('Activity Name 1');

    expect(form.valid).toBeTrue();
  });

});
