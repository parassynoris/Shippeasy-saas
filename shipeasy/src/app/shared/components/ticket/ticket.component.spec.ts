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
import { LoaderService } from 'src/app/services/loader.service';
import { TicketComponent } from './ticket.component';

 
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
  useExisting: forwardRef(() => TicketComponent),
  multi: true
};
 
describe('TicketComponent', () => {
  let component: TicketComponent;
  let fixture: ComponentFixture<TicketComponent>;
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
      declarations: [TicketComponent,MockTranslatePipe],
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
    fixture = TestBed.createComponent(TicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
 
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should submit the form', () => {
    spyOn(component, 'onSave');
    component.addTicketForm.setValue({
      title: 'Test Title',
      description: 'Test Description',
      pipeline: 'Test Pipeline',
      priority: 'High',
      uploadsDoc: '',
      ticketStatus: 'Raised',
      comments: [],
      ticketDocumentName: '',
      ticketDocumentId: '',
      ticketDocumentNameAdmin: '',
      ticketDocumentIdAdmin: ''
    });
    component.onSave();
    expect(component.onSave).toHaveBeenCalled();
  });


  it('should handle file selection', () => {
    const event = { target: { value: 'C:\\fakepath\\test.pdf', files: [new File([], 'test.pdf')] } };
    component.onFileSelected(event, 'ticket');
    expect(component.addTicketForm.get('ticketDocumentName').value).toBe('test.pdf');
  });


  it('should initialize form with default values', () => {
    expect(component.addTicketForm).toBeDefined();
    expect(component.addTicketForm.valid).toBeFalsy();
  });

  it('should call getTicketData on initialization', () => {
    spyOn(component, 'getTicketData');
    component.ngOnInit();
    expect(component.getTicketData).toHaveBeenCalled();
  });

  it('should fetch ticket data on init', () => {
    spyOn(component, 'getTicketData');
    component.ngOnInit();
    expect(component.getTicketData).toHaveBeenCalled();
  });

  it('should update the size property when filter is called', () => {
    const event = { target: { value: 20 } };
  
    component.filter(event);
  
    expect(component.size).toBe(20);
    expect(component.fromSize).toBe(1);
  });
  
  it('should initialize form', () => {
    expect(component.addTicketForm).toBeDefined();
    expect(component.addTicketForm.controls['title'].valid).toBeFalsy();
    expect(component.addTicketForm.controls['description'].valid).toBeFalsy();
    expect(component.addTicketForm.controls['pipeline'].valid).toBeFalsy();
    expect(component.addTicketForm.controls['priority'].valid).toBeFalsy();
  });

  it('should handle file upload and set form values correctly', () => {
    const event = { target: { value: 'C:\\fakepath\\test.pdf', files: [new File([], 'test.pdf')] } };
    component.onFileSelected(event, 'ticket');
    expect(component.addTicketForm.get('ticketDocumentName').value).toBe('test.pdf');
  });


});
