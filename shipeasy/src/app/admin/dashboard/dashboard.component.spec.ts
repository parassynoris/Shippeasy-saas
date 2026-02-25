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
import { DashboardComponent } from './dashboard.component';

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
  useExisting: forwardRef(() => DashboardComponent),
  multi: true
};

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
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
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList','getDashboardReport','getSTList1']);

    TestBed.configureTestingModule({
      declarations: [DashboardComponent, MockTranslatePipe],
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
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  


  it('should set loader1 to true at the start', () => {
    component.getDashboardData();
    expect(component.loader1).toBeTrue();
  });

  // const payload = { query: { },project: [],sort: { desc: ["updatedOn"] }, size: 1000, from: 0 };
  
  

  it('should reset date values in clear method', () => {
    component.fromdateValue = '2022-01-01';
    component.todateValue = '2022-01-10';

    component.clear();

    // Add expectations for the behavior of the clear method
    expect(component.fromdateValue).toBe('');
    expect(component.todateValue).toBe('');
  });

 
 

  it('should handle empty agent details in getNotification method', () => {
    spyOn(component.commonFunctions, 'getAgentDetails').and.returnValue(null);
  
    component.getNotification();
  
    // Add expectations for the behavior of the getNotification method with empty agent details
    expect(component.notificationList.length).toBe(0); // or any other appropriate handling
    // Add more expectations as needed
  });

  
 

  it('should retrieve shipping instructions data in getShippingInstru method', () => {
    const mockShippingInstruData = [
      { id: 1, instruction: 'Instruction 1', siCutOffDate: new Date() },
      { id: 2, instruction: 'Instruction 2', siCutOffDate: new Date() },
    ];
    spyOn(component._api, 'getSTList').and.returnValue(of({ documents: mockShippingInstruData }));
  
    // Add more expectations as needed
  });

  it('should set the correct greet message', () => {
    // Spy on Date.prototype.getHours
    const getHoursSpy = spyOn(Date.prototype, 'getHours');

    // Test for morning
    getHoursSpy.and.returnValue(10);
    component.setGreet();
    expect(component.greet).toBe('Good Morning');

    // Test for afternoon
    getHoursSpy.and.returnValue(14);
    component.setGreet();
    expect(component.greet).toBe('Good Afternoon');

    // Test for evening
    getHoursSpy.and.returnValue(19);
    component.setGreet();
    expect(component.greet).toBe('Good Evening');
});

it('should correctly evaluate if all sections are completed', () => {
  component.profileData = [{ isCompleted: true }, { isCompleted: true }];
  expect(component.allSectionsCompleted()).toBeTrue();

  component.profileData = [{ isCompleted: true }, { isCompleted: false }];
  expect(component.allSectionsCompleted()).toBeFalse();
});

it('should navigate to correct URL when navigateToNewTab is called', () => {
  const routerSpy = spyOn(component.router, 'navigate');
  const element = { batchId: 123 };

  component.navigateToNewTab(element);

  expect(routerSpy).toHaveBeenCalledWith(['/batch/list/add/' + element.batchId + '/details']);
});


it('should fetch and set reminders correctly', () => {
  const reminderData = { documents: [{ task: 'Task 1', id: 1 }] };
  spyOn(component._api, 'getSTList').and.returnValue(of(reminderData));
  spyOn(component.loaderService, 'showcircle');
  spyOn(component.loaderService, 'hidecircle');

  component.getRemiders();

  expect(component.loaderService.showcircle).toHaveBeenCalled();
  expect(component.reminderList).toEqual(reminderData.documents);
  expect(component.dataSource.data.length).toBe(1);
  expect(component.loaderService.hidecircle).toHaveBeenCalled();
});
 
  
});

