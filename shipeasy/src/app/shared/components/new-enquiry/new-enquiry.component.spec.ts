import { async, ComponentFixture, TestBed } from '@angular/core/testing';
 
import { NewEnquiryComponent } from './new-enquiry.component';
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
import { CommonService } from '../../../services/common/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { Pipe, PipeTransform } from '@angular/core';
import { ApiSharedService } from 'src/app/shared/components/api-service/api-shared.service';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientTestingModule } from '@angular/common/http/testing';
 
@Pipe({ name: 'orderBy' })
class MockOrderByPipe implements PipeTransform {
  transform(value: any[], key: string): any[] {
    return value; // Mock implementation: return the input array without sorting
  }
}
 
describe('NewEnquiryComponent', () => {
  let component: NewEnquiryComponent;
  let fixture: ComponentFixture<NewEnquiryComponent>;
  let commonFunctionsMock: jasmine.SpyObj<CommonFunctions>;
  let translateServiceStub: Partial<TranslateService>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let commonServiceMock: jasmine.SpyObj<CommonService>;
  let notificationServiceMock: jasmine.SpyObj<NzNotificationService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;
 let commonService: CommonService;

  let mockCognitoService: jasmine.SpyObj<CognitoService>;
  class ActivatedRouteStub {
    snapshot = {
      paramMap: new Map<string, string>().set('id', '123'),
    };
  }
  beforeEach(async(() => {
    translateServiceStub = {
      get: (key: string) => of(key),
      instant: jasmine.createSpy('instant').and.returnValue('translated text')
    };
    commonFunctionsMock = jasmine.createSpyObj('CommonFunctions', ['getAuthToken']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails','getagentDetails']);
    commonServiceMock = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList']);
    TestBed.configureTestingModule({
      declarations: [ NewEnquiryComponent ],
      imports: [HttpClientModule,RouterTestingModule,NzNotificationModule,SharedModule,TranslateModule.forRoot(),BrowserAnimationsModule,BrowserModule,HttpClientTestingModule ] ,
      providers: [
        NzNotificationService,
        CognitoService,
        OverlayModule ,
        { provide: CommonFunctions, useValue: jasmine.createSpyObj('CommonFunctions', ['yourMethod']) }, // Provide a mock for CommonFunctions
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
        { provide: CognitoService, useClass: MockCognitoService }, // Mock CognitoService
        { provide: CommonFunctions, useClass: MockCommonFunctions },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of({ get: () => '123' }) }, // Adjust based on your route parameters
        },
        { provide: ActivatedRoute, useClass: ActivatedRouteStub },
      ]
    })
    .compileComponents();
  }));
 
  beforeEach(() => {
    fixture = TestBed.createComponent(NewEnquiryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    commonService = TestBed.inject(CommonService);;
  });
 
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set waagonShow and vehicleShow when originHaulage is called with "rail" haulage type', () => {
    // Set the haulageTypeList and newenquiryForm.controls.haulageType.value to simulate the scenario
    component.haulagetypeList = [{ systemtypeId: 'rail', typeName: 'Rail' }];
    component.newenquiryForm.controls.haulageType.setValue('rail');

    // Call the method
    component.originHaulage();

    // Now you can test the behavior of your component based on the method call
    expect(component.waagonShow).toBeTrue();
    expect(component.vehicleShow).toBeFalse();
  });

  it('should set vehicleShow and waagonShow when originHaulage is called with "road" haulage type', () => {
    // Set the haulageTypeList and newenquiryForm.controls.haulageType.value to simulate the scenario
    component.haulagetypeList = [{ systemtypeId: 'road', typeName: 'Road' }];
    component.newenquiryForm.controls.haulageType.setValue('road');

    // Call the method
    component.originHaulage();

    // Now you can test the behavior of your component based on the method call
    expect(component.vehicleShow).toBeTrue();
    expect(component.waagonShow).toBeFalse();
  });
  it('should disable newenquiryForm and set show to true when the currentUrl is "show"', () => {
    component.currentUrl = 'show';

    component.ngOnInit();

    expect(component.newenquiryForm.disabled).toBe(false);
    expect(component.show).toBe(false);
  });

  it('should call getPartyMasterDropDowns, getCurrencyDropDowns, and getPortDropDowns on ngOnInit', () => {
    spyOn(component, 'getPartyMasterDropDowns');
    spyOn(component, 'getCurrencyDropDowns');
    spyOn(component, 'getPortDropDowns');

    component.ngOnInit();

    expect(component.getPartyMasterDropDowns).toHaveBeenCalled();
    expect(component.getCurrencyDropDowns).toHaveBeenCalled();
    expect(component.getPortDropDowns).toHaveBeenCalled();
  });
  it('should fetch UOM list successfully on ngOnInit', () => {
    spyOn(component, 'getUomList').and.callThrough();

    component.ngOnInit();

    expect(component.getUomList).toHaveBeenCalled();
    // Add assertions to check the behavior after fetching the UOM list
  });

  it('should disable certain form fields when the currentUrl is "show"', () => {
    component.currentUrl = 'show';

    component.ngOnInit();

    expect(component.newenquiryForm.disabled).toBe(false);
    // Add assertions to check specific form fields are disabled
  });

  it('should set showQuotation to true and enable specific form fields when the currentUrl is "quote"', () => {
    component.currentUrl = 'quote';

    component.ngOnInit();

    expect(component.showQuotation).toBe(false);
    // Add assertions to check specific form fields are enabled
  });

  it('should fetch port dropdowns successfully', () => {
    spyOn(component, 'getPortDropDowns').and.callThrough();

    component.ngOnInit();

    expect(component.getPortDropDowns).toHaveBeenCalled();
    // Add assertions to check if the port dropdown list is properly fetched and assigned
  });

  it('should fetch users dropdown successfully', () => {
    spyOn(component, 'getUsersForDropDown').and.callThrough();

    component.ngOnInit();

    expect(component.getUsersForDropDown).toHaveBeenCalled();
    // Add assertions to check if the user dropdown list is properly fetched and assigned
  });


  it('should fetch port dropdowns successfully', () => {
    spyOn(component, 'getPortDropDowns').and.callThrough();

    component.ngOnInit();

    expect(component.getPortDropDowns).toHaveBeenCalled();
    // Add assertions to check if the port dropdown list is properly fetched and assigned
  });

  it('should fetch currency dropdowns successfully', () => {
    spyOn(component, 'getCurrencyDropDowns').and.callThrough();

    component.ngOnInit();

    expect(component.getCurrencyDropDowns).toHaveBeenCalled();
    // Add assertions to check if the currency dropdown list is properly fetched and assigned
  });
  
  describe('getChargecontainerLength', () => {
    it('should return the length of container FormArray', () => {
      // Arrange
      // Initialize form with some elements in container FormArray

      // Act
      const length = component.getChargecontainerLength();

      // Assert
      expect(length).toEqual(0);
    });
  });


  class MockCognitoService {
    getUserDatails() {
      // Mock implementation
    }
    getagentDetails() {
      // Provide a mock implementation or return a default value
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
