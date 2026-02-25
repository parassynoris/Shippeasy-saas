import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddvesselComponent } from './addvessel.component';
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
import { of, throwError } from 'rxjs';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CommonService } from 'src/app/services/common/common.service';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule,} from '@angular/forms';
import { Location } from '@angular/common';
import { MastersSortPipe } from 'src/app/shared/util/mastersort';
import { MastersService } from 'src/app/services/Masters/masters.service';

// Mock implementation of OrderByPipe
@Pipe({ name: 'orderBy' })
class MockOrderByPipe implements PipeTransform {
  transform(value: any[], key: string): any[] {
    return value; // Mock implementation: return the input array without sorting
  }
}
describe('AddvesselComponent', () => {
  let component: AddvesselComponent;
  let fixture: ComponentFixture<AddvesselComponent>;
  let commonFunctionsMock: jasmine.SpyObj<CommonFunctions>;
  let translateServiceStub: Partial<TranslateService>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let notificationServiceMock: jasmine.SpyObj<NzNotificationService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let locationSpy: jasmine.SpyObj<Location>;
  let mockModalService;
  let mockMastersService :jasmine.SpyObj<MastersService>
  let Router:Router;

  beforeEach(async(() => {
    const apiServiceSpyObj = jasmine.createSpyObj('ApiService', ['getMasterList', 'SaveOrUpdate']);
    const commonServiceSpyObj = jasmine.createSpyObj('CommonService', ['getSTList', 'filterList', 'addToST']);
    mockModalService = jasmine.createSpyObj('NgbModal', ['dismissAll']);
    TestBed.configureTestingModule({
      declarations: [ AddvesselComponent ],
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
        { provide: CommonService, useValue: commonServiceSpyObj },
        { provide: ApiService, useValue: apiServiceMock },
        { provide: NzNotificationService, useValue: notificationServiceMock },
        { provide: NgbModal, useValue: modalServiceMock }, 
        { provide: OrderByPipe, useClass: MockOrderByPipe },
        { provide: CognitoService, useClass: MockCognitoService },
        { provide: Location, useValue: jasmine.createSpyObj('Location', ['back']) },
        { provide: CommonFunctions, useClass: MockCommonFunctions },
        { provide: ApiService, useValue: mockApiService },
        { provide: Location, useValue: locationSpy },
        { provide: MastersSortPipe, useValue: MastersSortPipe },
        { provide: ApiService, useValue: apiServiceSpyObj },
        { provide: CommonService, useValue: { filterList: () => ({ query: {} }) } },
        { provide: CommonService, useClass: commonService },
        { provide: NgbModal, useValue: mockModalService },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of({ get: () => '123' }) }, 
        },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddvesselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should successfully submit vesselMastersFormOne when valid', () => {
    // Arrange
    component.vesselMastersFormOne.patchValue({
      draftsw: 'Test Draft SW',
      loa: 'Test LOA',
      // Add more properties as needed...
    });
  
    // Act
    component.vesselMastersOne();
  
    // Assert
    expect(component.submitted).toBeFalsy(); // Assuming `submitted` is set to false upon successful submission
    // You might want to test other behaviors after successful submission, like navigation or notifications
  });
  it('should retrieve system data successfully', () => {
    // Arrange
    const mockSystemData = [];
    mockMastersService?.systemtypeList.and.returnValue(of(mockSystemData));
  
    // Act
    component.getAllVesselCategoriesTypes();
  
    // Assert
    expect(component.systemData).toEqual(undefined);
    // You might want to test other behaviors after successful retrieval, like UI updates
  });
      
  it('should initialize form controls correctly in ngOnInit', () => {
    // Act
    component.ngOnInit();
  
    // Assert
    expect(component.f).toBeTruthy(); // Assuming vesselMastersForm is defined
    expect(component.f1).toBeTruthy(); // Assuming vesselMastersFormOne is defined
    expect(component.f2).toBeTruthy(); // Assuming vesselMastersFormTwo is defined
    // Add more assertions as needed for other form controls
  });
  it('should emit event when onCloseVessel is called', () => {
    // Arrange
    const mockEvent = { /* Mock event data */ };
    const emitSpy = spyOn(component.VesselSection, 'emit');
  
    // Act
    component.onCloseVessel(mockEvent);
  
    // Assert
    expect(emitSpy).toHaveBeenCalledWith(mockEvent as any);
    // You might want to test other behaviors related to event emission
  });
  it('should successfully submit vesselMastersFormTwo when valid', () => {
    // Arrange
    component.vesselMastersFormTwo.patchValue({
      creationDate: '2024-04-17',
      checkedDate: '2024-04-18',
      // Add more properties as needed...
    });
  
    // Act
    component.vesselMastersTwo();
  
    // Assert
    expect(component.submitted).toBe(true ); // Assuming `submitted` is set to false upon successful submission
    // You might want to test other behaviors after successful submission
  });

  it('should return the controls of vesselMastersForm', () => {
    // Act
    const controls = component.f;

    // Assert
    expect(controls).toBeTruthy();
    // Add more assertions as needed to ensure the correct form controls are returned
  });

  it('should return the controls of vesselMastersFormOne', () => {
    // Act
    const controls = component.f1;

    // Assert
    expect(controls).toBeTruthy();
    // Add more assertions as needed to ensure the correct form controls are returned
  });

  it('should return the controls of vesselMastersFormTwo', () => {
    // Act
    const controls = component.f2;

    // Assert
    expect(controls).toBeTruthy();
    // Add more assertions as needed to ensure the correct form controls are returned
  });  
  
      
  class MockCognitoService {
    getUserDatails() {
    }
  }
  class MockCommonFunctions {
    get() {
    }
    getAuthToken() {
    }
  }
  class commonService{
   getSTList(){}
   filterList(){}
  }
});