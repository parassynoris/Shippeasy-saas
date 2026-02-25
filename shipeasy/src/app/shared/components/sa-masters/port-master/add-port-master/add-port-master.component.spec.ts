import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
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
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { MastersSortPipe } from 'src/app/shared/util/mastersort';
import { RouterModule } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AddPortMasterComponent } from './add-port-master.component';
import { Observable, of } from 'rxjs';

@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    return value;
  }
}

const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => AddPortMasterComponent),
  multi: true,
};

describe('AddPortMasterComponent', () => {
  let component: AddPortMasterComponent;
  let fixture: ComponentFixture<AddPortMasterComponent>;
  let mockNgbModal: jasmine.SpyObj<NgbModal>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockNotificationService: jasmine.SpyObj<NzNotificationService>;
  let mockMastersService: jasmine.SpyObj<MastersService>;
  let mockProfilesService: jasmine.SpyObj<ProfilesService>;
  let mockCognitoService: jasmine.SpyObj<CognitoService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockModalService: jasmine.SpyObj<NgbModal>;

  beforeEach(waitForAsync(() => {
    mockNgbModal = jasmine.createSpyObj('NgbModal', ['open']);
    mockApiService = jasmine.createSpyObj('ApiService', ['getSTList', 'addToST', 'UpdateToST', 'deleteST']);
    mockNotificationService = jasmine.createSpyObj('NzNotificationService', ['create']);
    mockMastersService = jasmine.createSpyObj('MastersService', ['getSTList']);
    mockProfilesService = jasmine.createSpyObj('ProfilesService', ['getUserDetails', 'getSmartAgentById']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList', 'getDashboardReport', 'addToST']);
    mockModalService = jasmine.createSpyObj('NgbModal', ['open', 'dismissAll']);

    TestBed.configureTestingModule({
      declarations: [
        AddPortMasterComponent,
        MockTranslatePipe,
        MastersSortPipe,
      ],
      imports: [
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        MatAutocompleteModule,
        NzSelectModule,
        NzDatePickerModule,
        RouterTestingModule,
        HttpClientModule,
        RouterModule,
        BrowserAnimationsModule,
      ],
      providers: [
        DatePipe,
        OrderByPipe,
        MastersSortPipe,
        { provide: ApiService, useValue: mockApiService },
        { provide: NzNotificationService, useValue: mockNotificationService },
        { provide: MastersService, useValue: mockMastersService },
        { provide: ProfilesService, useValue: mockProfilesService },
        { provide: SaMasterService, useValue: {} },
        { provide: CognitoService, useValue: mockCognitoService },
        { provide: CommonService, useValue: mockCommonService },
        { provide: NgbModal, useValue: mockModalService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPortMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    // Clears spies after each test
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form on component creation', () => {
    expect(component.locationForm).toBeDefined();
  });

  it('should call getLocation on init', () => {
    spyOn(component, 'getLocation');
    component.ngOnInit();
    expect(component.getLocation).toHaveBeenCalled();
  });

  it('should call getSystemTypeDropDowns on init', () => {
    spyOn(component, 'getSystemTypeDropDowns');
    component.ngOnInit();
    expect(component.getSystemTypeDropDowns).toHaveBeenCalled();
  });

  it('should validate form fields correctly', () => {
    component.locationForm.controls['portName'].setValue('Test Port');
    component.locationForm.controls['description'].setValue('Test Description');
    component.locationForm.controls['country'].setValue('IN');
    expect(component.locationForm.valid).toBeTruthy();
  });

  it('should mark form as invalid if required fields are missing', () => {
    component.locationForm.controls['portName'].setValue('');
    component.locationForm.controls['description'].setValue('');
    component.locationForm.controls['country'].setValue('');
    expect(component.locationForm.invalid).toBeTruthy();
  });
});
