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
import { UserComponent } from './user.component';


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
  useExisting: forwardRef(() => UserComponent),
  multi: true
};

describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;
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
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails','getModule']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList']);

    TestBed.configureTestingModule({
      declarations: [UserComponent, MockTranslatePipe,],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientModule,RouterModule,ReactiveFormsModule,RouterModule,TranslateModule.forRoot(),NzSelectModule,NzDatePickerModule,BrowserAnimationsModule],
      providers: [DatePipe, OrderByPipe,TranslateService,
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
    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getUserList on ngOnInit', () => {
    const getUserListSpy = spyOn(component, 'getUserList');
    component.ngOnInit();
    expect(getUserListSpy).toHaveBeenCalled();
  });

  it('clear() should reset form fields and call getUserList()', () => {
    const getUserListSpy = spyOn(component, 'getUserList');
    component.userFirstName = 'John';
    component.userLastName = 'Doe';
    component.userName = 'johndoe';
    component.userEmail = 'john@example.com';
    component.userRole = 'admin';
    component.userPhoneNo = '1234567890';
    component.userLocation = 'New York';
  
    component.clear();
  
    expect(component.userFirstName).toEqual('');
    expect(component.userLastName).toEqual('');
    expect(component.userName).toEqual('');
    expect(component.userEmail).toEqual('');
    expect(component.userRole).toEqual('');
    expect(component.userPhoneNo).toEqual('');
    expect(component.userLocation).toEqual('');
    expect(getUserListSpy).toHaveBeenCalled();
  });
  
  it('filter() should set size, fromSize to 1, and call getUserList()', () => {
    const getUserListSpy = spyOn(component, 'getUserList');
    const mockEvent = { target: { value: 10 } };
  
    component.filter(mockEvent);
  
    expect(component.size).toEqual(10);
    expect(component.fromSize).toEqual(1);
    expect(getUserListSpy).toHaveBeenCalled();
  });
  
  it('next() should call getPaginationData("next") if totalLength is greater than count', () => {
    const getPaginationDataSpy = spyOn(component, 'getPaginationData');
    component.toalLength = 20;
    component.count = 10;
  
    component.next();
  
    expect(getPaginationDataSpy).toHaveBeenCalledWith('next');
  });
  
  it('prev() should call getPaginationData("prev") if page is greater than 0 and not equal to 1', () => {
    const getPaginationDataSpy = spyOn(component, 'getPaginationData');
    component.page = 2;
  
    component.prev();
  
    expect(getPaginationDataSpy).toHaveBeenCalledWith('prev');
  });

  it('filter() should call getUserList() with updated parameters', () => {
    const getUserListSpy = spyOn(component, 'getUserList');
    const mockEvent = { target: { value: 10 } };
  
    component.filter(mockEvent);
  
    expect(component.size).toEqual(10);
    expect(component.fromSize).toEqual(1);
    expect(getUserListSpy).toHaveBeenCalled();
  });
  
  it('next() should call getPaginationData("next") if totalLength is greater than count', () => {
    const getPaginationDataSpy = spyOn(component, 'getPaginationData');
    component.toalLength = 20;
    component.count = 10;
  
    component.next();
  
    expect(getPaginationDataSpy).toHaveBeenCalledWith('next');
  });
  
  it('next() should not call getPaginationData("next") if totalLength is equal to count', () => {
    const getPaginationDataSpy = spyOn(component, 'getPaginationData');
    component.toalLength = 10;
    component.count = 10;
  
    component.next();
  
    expect(getPaginationDataSpy).not.toHaveBeenCalled();
  });
  
  it('prev() should call getPaginationData("prev") if page is greater than 1', () => {
    const getPaginationDataSpy = spyOn(component, 'getPaginationData');
    component.page = 2;
  
    component.prev();
  
    expect(getPaginationDataSpy).toHaveBeenCalledWith('prev');
  });
  
  it('prev() should not call getPaginationData("prev") if page is equal to 1', () => {
    const getPaginationDataSpy = spyOn(component, 'getPaginationData');
    component.page = 1;
  
    component.prev();
  
    expect(getPaginationDataSpy).not.toHaveBeenCalled();
  });

  it('clearFilters() should reset filtersModel, filterKeys, and call getUserList()', () => {
    const getUserListSpy = spyOn(component, 'getUserList');
    component.filtersModel = ['filter1', 'filter2'];
    component.filterKeys = { key1: 'value1', key2: 'value2' };
  
    component.clearFilters();
  
    expect(component.filtersModel).toEqual([]);
    expect(component.filterKeys).toEqual({});
    expect(getUserListSpy).toHaveBeenCalled();
  });
  
  
  
  
  
 
});
