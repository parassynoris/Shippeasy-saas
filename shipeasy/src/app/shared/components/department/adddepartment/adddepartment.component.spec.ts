import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { of, throwError } from 'rxjs';
import { ApiService } from 'src/app/admin/principal/api.service';

import { CognitoService } from 'src/app/services/cognito.service';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Pipe, PipeTransform } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CurrencyPipe, DatePipe } from '@angular/common'; 
import { OrderByPipe } from 'src/app/shared/util/sort';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonService } from 'src/app/services/common/common.service';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { AddDepartmentComponent } from './adddepartment.component';


@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  
  constructor(private currencyPipe: CurrencyPipe) {}
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('CostheadaddComponent', () => {
  let component: AddDepartmentComponent;
  let fixture: ComponentFixture< AddDepartmentComponent>;
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
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails','getagentDetails',]);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList', 'UpdateToST','portList','systemtypeList','countryList','getCostItemList']);
   mockApiService = jasmine.createSpyObj('ApiService',['getListByURL']);
    TestBed.configureTestingModule({
      declarations: [ AddDepartmentComponent, MockTranslatePipe],
      imports: [ReactiveFormsModule,SharedModule,NzSelectModule,NzDatePickerModule,RouterTestingModule,BrowserAnimationsModule ,HttpClientModule,TranslateModule.forRoot()],
      providers: [DatePipe, OrderByPipe,CurrencyPipe,
        { provide: NgbModal, useValue: mockNgbModal },
        { provide: ApiService, useValue: mockApiService },
        { provide: NzNotificationService, useValue: mockNotificationService },
        { provide: MastersService, useValue: mockMastersService },
        { provide: ProfilesService, useValue: mockProfilesService },
        { provide: SaMasterService, useValue: {} },
        { provide: CognitoService, useValue: mockCognitoService },
        { provide: CommonService, useValue: mockCommonService }
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDepartmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with expected controls', () => {
    expect(component.addDepartment).toBeTruthy();
    expect(component.addDepartment.controls.deptName).toBeTruthy();
    expect(component.addDepartment.controls.deptManager).toBeTruthy();
    expect(component.addDepartment.controls.deptEmail).toBeTruthy();
    expect(component.addDepartment.controls.status).toBeTruthy();
  });

  it('should call saveDepartment when form is valid', () => {
    spyOn(component, 'saveDepartment');
    component.addDepartment.controls.deptName.setValue('Test Department');
    component.addDepartment.controls.deptManager.setValue('1');
    component.addDepartment.controls.deptEmail.setValue('test@example.com');
    component.addDepartment.controls.status.setValue(true);
    component.saveDepartment();
    expect(component.saveDepartment).toHaveBeenCalled();
  });

  it('should call onClose when modal is closed', () => {
    spyOn(component, 'onClose');
    component.onClose();
    expect(component.onClose).toHaveBeenCalled();
  });

  it('should call getManagerUser on initialization', () => {
    spyOn(component, 'getManagerUser');
    component.ngOnInit();
    expect(component.getManagerUser).toHaveBeenCalled();
  });

  
});
