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
import { AddPortActivityMappingComponent } from './add-port-activity-mapping.component';
;







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
  useExisting: forwardRef(() => AddPortActivityMappingComponent),
  multi: true
};

describe('AddPortActivityMappingComponent', () => {
  let component: AddPortActivityMappingComponent;
  let fixture: ComponentFixture<AddPortActivityMappingComponent>;
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
    mockProfilesService = jasmine.createSpyObj('ProfilesService', ['getUserDetails','getCurrentAgentDetails','countryList','getActivityList']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails','getModule','getagentDetails']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList','getListByURL']);
    mockSaMasterService = jasmine.createSpyObj('SaMasterService', ['cityList','portList']);
    TestBed.configureTestingModule({
      declarations: [AddPortActivityMappingComponent, MockTranslatePipe,],
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
    fixture = TestBed.createComponent(AddPortActivityMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getPortList on ngOnInit', () => {
    const portListResponse = { hits: { hits: [] } };
    mockSaMasterService.portList.and.returnValue(of(portListResponse));

    component.ngOnInit();

    expect(mockSaMasterService.portList).toHaveBeenCalled();
    expect(component.PortList).toEqual(portListResponse.hits.hits);
  });

  it('should call getActivityList on ngOnInit', () => {
    const activityListResponse = { hits: { hits: [] } };
    mockProfilesService.getActivityList.and.returnValue(of(activityListResponse));

    component.ngOnInit();

    expect(mockProfilesService.getActivityList).toHaveBeenCalled();
    expect(component.activityList).toEqual(activityListResponse.hits.hits);
  });

  it('should set portMappingName when setPort is called', () => {
    const selectedPortId = 1;
    const selectedPort = { _source: { portId: 1, portName: 'Port A' } };
    component.PortList = [selectedPort];

    component.setPort({ target: { value: selectedPortId } });

    expect(component.selectedCostHead).toEqual(selectedPort);
    expect(component.locationForm.get('portMappingName').value).toEqual('Port A');
  });
  
  it('should get port list from saMasterService', () => {
    const portListResponse = { hits: { hits: [{ _source: { portId: 1, portName: 'Port A' } }] } };
    mockSaMasterService.portList.and.returnValue(of(portListResponse));
  
    component.getPortList();
  
    expect(mockSaMasterService.portList).toHaveBeenCalled();
    expect(component.PortList).toEqual(portListResponse.hits.hits);
  });
  
  it('should get activity list from profilesService', () => {
    const activityListResponse = { hits: { hits: [{ _source: { activityId: 'activity', activityName: 'Activity A' } }] } };
    mockProfilesService.getActivityList.and.returnValue(of(activityListResponse));
  
    component.getActivityList();
  
    expect(mockProfilesService.getActivityList).toHaveBeenCalled();
    expect(component.activityList).toEqual(activityListResponse.hits.hits);
  });
 
  it('should initialize form with default values', () => {
    component.ngOnInit();
    expect(component.locationForm).toBeDefined();
    expect(component.locationForm.controls['orgId'].value).toBe('');
    expect(component.locationForm.controls['parentId'].value).toBe('');
    expect(component.locationForm.controls['activity'].value).toBe('');
    expect(component.locationForm.controls['cargoType'].value).toBe('');
    expect(component.locationForm.controls['country'].value).toBe('');
    expect(component.locationForm.controls['portMappingName'].value).toBe('');
    expect(component.locationForm.controls['principalCode'].value).toBe('');
  });

  it('should return form controls', () => {
    const controls = component.f;
    expect(controls).toBe(component.locationForm.controls);
  });  

});
