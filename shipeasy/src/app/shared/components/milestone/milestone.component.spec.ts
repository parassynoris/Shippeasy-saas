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
import { MilestoneComponent } from './milestone.component';






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
  useExisting: forwardRef(() => MilestoneComponent),
  multi: true
};

describe('MilestoneComponent', () => {
  let component: MilestoneComponent;
  let fixture: ComponentFixture<MilestoneComponent>;
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
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList']);
    mockSaMasterService = jasmine.createSpyObj('SaMasterService', ['cityList']);
    TestBed.configureTestingModule({
      declarations: [MilestoneComponent, MockTranslatePipe,],
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
    fixture = TestBed.createComponent(MilestoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form on ngOnInit', () => {
    spyOn(component, 'getevents');
    component.ngOnInit();
    expect(component.getevents).toHaveBeenCalled();
  });

  it('should build form on formBuild()', () => {
    component.formBuild();
    expect(component.docForm).toBeDefined();
  });

  it('should select event state', () => {
    const parentIndex = 'A';
    const childIndex = 0;
    const value = 'Completed';
    component.groupedEvents = {
      'A': [{ eventData: { eventState: '' } }]
    };
    component.selectEventState(parentIndex, childIndex, value);
    expect(component.groupedEvents[parentIndex][childIndex]['eventData']['eventState']).toBe(value);
  });

  it('should log input blur event', () => {
    const parentIndex = 'A';
    const childIndex = 0;
    const name = 'eventName';
    const event = { target: { value: 'Event Name' } };
    component.groupedEvents = {
      'A': [{ eventData: { eventName: '' } }]
    };
    component.logInputBlur(name, event, parentIndex, childIndex);
    expect(component.groupedEvents[parentIndex][childIndex]['eventData'][name]).toBe(event.target.value);
  });


  it('should get array of grouped events', () => {
    component.groupedEvents = {
      'A': [],
      'B': []
    };
    expect(component.getArray()).toEqual(['A', 'B']);
  });

  it('should toggle edit mode', () => {
    const parentIndex = 'A';
    const childIndex = 0;
    component.groupedEvents = {
      'A': [{ isEdit: false }]
    };
    component.editdetails(parentIndex, childIndex);
    expect(component.groupedEvents[parentIndex][childIndex]['isEdit']).toBeTruthy();
  });

  it('should create event form', () => {
    const event = { eventId: 1 };
    const formGroup = component.createEventForm(event);
    expect(formGroup.get('id').value).toBe(event.eventId);
  });

  it('should handle file selection', () => {
    const file = new File(['dummy content'], 'dummy.pdf');
    const event = { target: { files: [file] } };
    component.onFileSelected(event);
    expect(component.doc).toBe(file);
  });

 

});
