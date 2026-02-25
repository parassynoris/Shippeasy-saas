import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateCfsComponent } from './update-cfs.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { NzNotificationModule, NzNotificationService } from 'ng-zorro-antd/notification';
import { CognitoService } from 'src/app/services/cognito.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { OverlayModule } from '@angular/cdk/overlay';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagingService } from 'src/app/services/messaging.service';
import { ApiService } from 'src/app/admin/principal/api.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { Pipe, PipeTransform } from '@angular/core';
import { ApiSharedService } from 'src/app/shared/components/api-service/api-shared.service';
import { of } from 'rxjs';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CommonService } from 'src/app/services/common/common.service';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder,FormsModule, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { Location } from '@angular/common';

// Mock implementation of OrderByPipe
@Pipe({ name: 'orderBy' })
class MockOrderByPipe implements PipeTransform {
  transform(value: any[], key: string): any[] {
    return value; // Mock implementation: return the input array without sorting
  }
}
describe('UpdateCfsComponent', () => {
  let component: UpdateCfsComponent;
  let fixture: ComponentFixture<UpdateCfsComponent>;
  let commonFunctionsMock: jasmine.SpyObj<CommonFunctions>;
  let translateServiceStub: Partial<TranslateService>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let commonServiceMock: jasmine.SpyObj<CommonService>;
  let notificationServiceMock: jasmine.SpyObj<NzNotificationService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;
  let location: jasmine.SpyObj<Location>;
  let mockApiService: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    mockApiService = jasmine.createSpyObj('ApiService', ['getSTList', 'addToST', 'UpdateToST', 'deleteST']);
    await TestBed.configureTestingModule({
      declarations: [ UpdateCfsComponent ],
      imports: [HttpClientModule,RouterTestingModule,NzNotificationModule,SharedModule,TranslateModule.forRoot(),BrowserAnimationsModule,HttpClientTestingModule,FormsModule,ReactiveFormsModule,NgbModule , MatTableModule,
        MatSelectModule,
        NoopAnimationsModule] ,
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
        { provide: CognitoService, useClass: MockCognitoService },
        { provide: Location, useValue: jasmine.createSpyObj('Location', ['back']) },
        { provide: CommonFunctions, useClass: MockCommonFunctions },
        { provide: ApiService, useValue: mockApiService },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of({ get: () => '123' }) }, 
        },
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateCfsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should return form controls', () => {
    const controls = component.getControls();
    expect(controls.length).toBe(0); // Ensure controls are retrieved
  });
  it('should filter data based on search criteria', () => {
    // Set search criteria
    component.blNo = '123';
    component.pooName = 'Sample Poo';
    // Call search function
    component.search();
    // Expectations
    expect(component.houseBlList).toEqual([]);
  });
  
  it('should apply value to all form controls', () => {
    const expectedValue = 'new value';
    // Set a value to cfs property
    component.cfs = expectedValue;
    // Call applyAll function
    component.applyAll();
    // Expectations
    component.blForm.controls.blData.value.forEach(control => {
      expect(control.cfsLocationId).toEqual(expectedValue);
    });
  });
  it('should initialize component successfully', () => {
    expect(component).toBeTruthy();
    expect(component.blForm).toBeDefined();
    expect(component.houseBlList).toEqual([]);
    // Add more expectations as needed for other properties
  });
 
  it('should retrieve form controls successfully', () => {
    const controls = component.getControls();
    expect(controls).toBeTruthy();
    // Add more expectations as needed for the retrieved controls
  });

  it('should apply values to all form controls successfully', () => {
    const expectedValue = 'new value';
    // Set a value to cfs property
    component.cfs = expectedValue;
    // Call applyAll function
    component.applyAll();
    // Expectations
    component.blForm.controls.blData.value.forEach(control => {
      expect(control.cfsLocationId).toEqual(expectedValue);
      // Add more expectations as needed
    });
  });
          
            
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
});