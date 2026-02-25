import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalDismissReasons, NgbModal, NgbModalRef, NgbModule } from '@ng-bootstrap/ng-bootstrap';
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
import { DatePipe } from '@angular/common';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { ChangepasswordComponent } from './changepassword.component';



@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('ManifestComponent', () => {
  let component: ChangepasswordComponent;
  let fixture: ComponentFixture<ChangepasswordComponent>;
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
      declarations: [ChangepasswordComponent, MockTranslatePipe],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientModule],
      providers: [DatePipe, OrderByPipe,FormBuilder,
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
    fixture = TestBed.createComponent(ChangepasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getUserList on ngOnInit', () => {
    spyOn(component, 'getUserList');
    component.ngOnInit();
    expect(component.getUserList).toHaveBeenCalled();
  });
 
  it('should return form controls using the "f" getter', () => {
    // Set values for testing
    component.changepassForm.controls.username.setValue('testUser');
    component.changepassForm.controls.userEmail.setValue('test@example.com');

    const formControls = component.f;

    expect(formControls.username.value).toEqual('testUser');
    expect(formControls.userEmail.value).toEqual('test@example.com');
  });
  it('should set form controls with values from getSTList response', fakeAsync(() => {
    const mockUserData = {
      documents: [
        {
          userName: 'testUser',
          userEmail: 'test@example.com',
        },
      ],
    };

    mockCommonService.getSTList.and.returnValue(of(mockUserData));

    // Call the method
    component.getUserList();
    tick();

    // Verify that form controls are set with values from the mock response
    expect(component.changepassForm.controls.username.value).toEqual(mockUserData.documents[0]?.userName || '');
    expect(component.changepassForm.controls.userEmail.value).toEqual(mockUserData.documents[0]?.userEmail || '');
  }));

  it('should initialize the form with default values', () => {
    expect(component.changepassForm).toBeDefined();
    expect(component.changepassForm.controls['username']).toBeDefined();
    expect(component.changepassForm.controls['userEmail']).toBeDefined();
  });

  it('should call getUserList on ngOnInit', fakeAsync(() => {
    spyOn(component, 'getUserList');
  
    component.ngOnInit();
    tick();
  
    expect(component.getUserList).toHaveBeenCalled();
  }));

  it('should initialize the form with default values on ngOnInit', () => {
    component.ngOnInit();
  
    expect(component.changepassForm.controls['username'].value).toBeNull();
    expect(component.changepassForm.controls['userEmail'].value).toBeNull();
  });

  it('should call getUserList if commonFunctions.getAgentDetails.userId is present on ngOnInit', fakeAsync(() => {
    spyOn(component.commonFunctions, 'getAgentDetails').and.returnValue({ userId: 'testUserId' });
    spyOn(component, 'getUserList');
  
    component.ngOnInit();
    tick();
  
    expect(component.getUserList).toHaveBeenCalled();
  }));
 
});


