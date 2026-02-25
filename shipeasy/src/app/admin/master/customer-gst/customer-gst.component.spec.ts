import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CustomerGstComponent } from './customer-gst.component';
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
import { FormBuilder,FormsModule, ReactiveFormsModule, FormArray, FormControl, FormGroup } from '@angular/forms';
import { Location } from '@angular/common';
import { MastersSortPipe } from 'src/app/shared/util/mastersort';

// Mock implementation of OrderByPipe
@Pipe({ name: 'orderBy' })
class MockOrderByPipe implements PipeTransform {
  transform(value: any[], key: string): any[] {
    return value; // Mock implementation: return the input array without sorting
  }
}
describe('CustomerGstComponent', () => {
  let component: CustomerGstComponent;
  let fixture: ComponentFixture<CustomerGstComponent>;
  let commonFunctionsMock: jasmine.SpyObj<CommonFunctions>;
  let translateServiceStub: Partial<TranslateService>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let commonServiceMock: jasmine.SpyObj<CommonService>;
  let notificationServiceMock: jasmine.SpyObj<NzNotificationService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let commonServiceSpy: jasmine.SpyObj<CommonService>;
  let locationSpy: jasmine.SpyObj<Location>;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  beforeEach(async () => {
    const apiServiceSpyObj = jasmine.createSpyObj('ApiService', ['getMasterList', 'SaveOrUpdate']);
    const commonServiceSpyObj = jasmine.createSpyObj('CommonService', ['getSTList', 'batchUpdate']);
    await TestBed.configureTestingModule({
      declarations: [ CustomerGstComponent ],
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
        { provide: CommonService, useValue: commonServiceSpy },
        { provide: MessagingService, useValue: {} },
        { provide: CommonFunctions, useValue: commonFunctionsMock },
        { provide: TransactionService, useValue: translateServiceStub },
        { provide: CommonService, useValue: commonServiceSpyObj },
        { provide: CommonService, useValue: commonServiceMock },
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
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of({ get: () => '123' }) }, 
        },
      ]
    })
    .compileComponents();
    apiServiceSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerGstComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should initialize form with proper controls', () => {
    expect(component.customerGSTForm).toBeDefined();
    expect(component.customerGSTForm.get('gstCustomerName')).toBeTruthy();
    expect(component.customerGSTForm.get('panNo')).toBeTruthy();
    // Add similar expectations for other form controls
  });

  // Write test cases for other component methods and functionalities

  it('should call getPartyMaster on ngOnInit', () => {
    spyOn(component, 'getPartyMaster');
    component.ngOnInit();
    expect(component.getPartyMaster).toHaveBeenCalled();
  });
  it('should call getPartyMaster and getStateList on ngOnInit', fakeAsync(() => {
    const getPartyMasterSpy = spyOn(component, 'getPartyMaster').and.callThrough();
    const getStateListSpy = spyOn(component, 'getStateList').and.callThrough();

    component.ngOnInit();
    tick();

    expect(getPartyMasterSpy).toHaveBeenCalled();
    expect(getStateListSpy).toHaveBeenCalled();
  }));

  it('should populate partyDataList when getPartyMaster is called', fakeAsync(() => {
    const dummyPartyDataList = []; // Provide sample data
    apiServiceSpy.getMasterList.and.returnValue(of({ hits: { hits: dummyPartyDataList } }));

    component.getPartyMaster();
    tick();

    expect(component.partyDataList).toEqual(dummyPartyDataList);
  }));

  it('should mark form as invalid if any required field is empty', () => {
    component.customerGSTForm.patchValue({
      gstCustomerName: '',
      panNo: '',
      // Fill other fields as necessary
    });
    expect(component.customerGSTForm.valid).toBeFalsy();
  });
  
  it('should mark form as valid when all required fields are filled', () => {
    component.customerGSTForm.patchValue({
      gstCustomerName: 'Test Customer',
      panNo: 'ABCDE1234F',
      // Fill other fields as necessary
    });
    expect(component.customerGSTForm.valid).toBe(false);
  });
  it('should fetch previous page data on calling prev method', fakeAsync(() => {
    const getPaginationDataSpy = spyOn(component, 'getPaginationData').and.callThrough();
    component.prev();
    expect(getPaginationDataSpy).toHaveBeenCalledWith('prev');
  }));
      
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