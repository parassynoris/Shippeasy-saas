import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentComponent } from './department.component';
import { RouterTestingModule } from '@angular/router/testing';
import { NzNotificationModule, NzNotificationService } from 'ng-zorro-antd/notification';
import { CognitoService } from 'src/app/services/cognito.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { OverlayModule } from '@angular/cdk/overlay';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagingService } from 'src/app/services/messaging.service';
import { ApiService } from 'src/app/admin/principal/api.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { CommonService } from 'src/app/shared/services/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { Pipe, PipeTransform } from '@angular/core';
import { ApiSharedService } from 'src/app/shared/components/api-service/api-shared.service';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormArray, FormBuilder } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

// Mock implementation of OrderByPipe
@Pipe({ name: 'orderBy' })
class MockOrderByPipe implements PipeTransform {
  transform(value: any[], key: string): any[] {
    return value; // Mock implementation: return the input array without sorting
  }
}

class MockCognitoService {
  getUserDatails() {
    // Mock implementation
  }
}

// Mock implementation of CommonFunctions
class MockCommonFunctions {
  get() {
    // Mock implementation
  }
  getAuthToken() {
    // Provide a mock implementation or return a default value
  }
}

describe('DepartmentComponent', () => {
  let component: DepartmentComponent;
  let fixture: ComponentFixture<DepartmentComponent>;
  let commonFunctionsMock: jasmine.SpyObj<CommonFunctions>;
  let translateServiceStub: Partial<TranslateService>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let commonServiceMock: jasmine.SpyObj<CommonService>;
  let notificationServiceMock: jasmine.SpyObj<NzNotificationService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;
  let router: Router

  beforeEach(async () => {
    translateServiceStub = {
      get: (key: string) => of(key),
      instant: jasmine.createSpy('instant').and.returnValue('translated text')
    };
    commonFunctionsMock = jasmine.createSpyObj('CommonFunctions', ['getAuthToken']);
    await TestBed.configureTestingModule({
      declarations: [ DepartmentComponent ],
      imports: [RouterTestingModule,NzNotificationModule,SharedModule,TranslateModule.forRoot(),  BrowserModule,
        BrowserAnimationsModule,HttpClientTestingModule ] ,
      providers: [
        NzNotificationService,
        CognitoService, 
        OverlayModule ,
        { provide: CommonFunctions, useValue: jasmine.createSpyObj('CommonFunctions', ['yourMethod']) }, // Provide a mock for CommonFunctions
        { provide: Router, useValue: {} },
        ApiSharedService,
        { provide: MessagingService, useValue: jasmine.createSpyObj('MessagingService', ['methodName']) } ,
        { provide: MessagingService, useValue: {} },
        { provide: CommonFunctions, useValue: commonFunctionsMock },
        { provide: TransactionService, useValue: translateServiceStub },
        { provide: CommonService, useValue: commonServiceMock },
        { provide: ApiService, useValue: apiServiceMock },
        { provide: NzNotificationService, useValue: notificationServiceMock },
        { provide: NgbModal, useValue: modalServiceMock }, 
        { provide: OrderByPipe, useClass: MockOrderByPipe },
        { provide: CommonFunctions, useClass: MockCommonFunctions },
        { provide: CognitoService, useClass: MockCognitoService }, 
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of({ get: () => '123' }) }, // Adjust based on your route parameters
        },
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DepartmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize component properties and call getDepartmentList method', () => {
    spyOn(component, 'getDepartmentList'); // Spy on the method
    component.ngOnInit(); // Call ngOnInit
    expect(component.getDepartmentList).toHaveBeenCalled(); // Check if the method is called
    expect(component.size).toEqual(10); // Check if properties are initialized
    // Add more expectations for other properties initialization
  });
  it('should fetch department list correctly', () => {
    const mockData = {
      documents: [{ /* mock department data */ }],
      totalCount: 1
    };
    spyOn(component.commonService, 'getSTList').and.returnValue(of(mockData)); // Spy on the service method
    component.getDepartmentList(); // Call the method
    expect(component.deptData.length).toBeGreaterThan(0); // Check if data is fetched
    expect(component.toalLength).toEqual(1); // Check if totalCount is set correctly
  });
  it('should filter department list based on search criteria', () => {
    // Set search criteria
    component.department = 'test';
    component.manager = 'manager';
    component.email = 'email@test.com';
    component.status = 'true';
    spyOn(component.commonService, 'getSTList').and.returnValue(of({ documents: [], totalCount: 0 })); // Spy on the service method
    component.search(); // Call the method
    // Check if search criteria are passed correctly
    expect(component.commonService.getSTList).toHaveBeenCalledWith('department', jasmine.objectContaining({
      query: {
        deptName: jasmine.objectContaining({ $regex: 'test', $options: 'i' }),
        deptManager: jasmine.objectContaining({ $regex: 'manager', $options: 'i' }),
        deptEmail: jasmine.objectContaining({ $regex: 'email@test.com', $options: 'i' }),
        status: true
      }
    }));
  });
  it('should fetch next page of department list when next() is called', () => {
    component.toalLength = 20;
    component.count = 10;
    spyOn(component, 'getPaginationData'); // Spy on the method
    component.next(); // Call the method
    expect(component.getPaginationData).toHaveBeenCalledWith('next'); // Check if the method is called with correct parameter
  });
  it('should call getDepartmentList() on ngOnInit', () => {
    spyOn(component, 'getDepartmentList');
    component.ngOnInit();
    expect(component.getDepartmentList).toHaveBeenCalled();
  });
  it('should unsubscribe on ngOnDestroy', () => {
    spyOn(component.ngUnsubscribe, 'next');
    spyOn(component.ngUnsubscribe, 'complete');
    component.ngOnDestroy();
    expect(component.ngUnsubscribe.next).toHaveBeenCalled();
    expect(component.ngUnsubscribe.complete).toHaveBeenCalled();
  });
  it('should call getDepartmentList() with correct parameters after filtering', () => {
    spyOn(component, 'getDepartmentList');
    const event = { target: { value: '20' } };
    component.filter(event);
    expect(component.size).toBe('20' as any); // Check if size is correctly set
    expect(component.fromSize).toBe(1); // Check if fromSize is reset
    expect(component.getDepartmentList).toHaveBeenCalled();
  });
  
});
