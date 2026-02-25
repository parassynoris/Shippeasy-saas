import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EnquiryComponent } from './enquiry.component';
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
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
 
@Pipe({ name: 'orderBy' })
class MockOrderByPipe implements PipeTransform {
  transform(value: any[], key: string): any[] {
    return value; // Mock implementation: return the input array without sorting
  }
}
describe('EnquiryComponent', () => {
  let component: EnquiryComponent;
  let fixture: ComponentFixture<EnquiryComponent>;
  let myServiceSpy: jasmine.SpyObj<CommonService>;
  let commonFunctionsMock: jasmine.SpyObj<CommonFunctions>;
  let translateServiceStub: Partial<TranslateService>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let commonServiceMock: jasmine.SpyObj<CommonService>;
  let notificationServiceMock: jasmine.SpyObj<NzNotificationService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;
 
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
    myServiceSpy = jasmine.createSpyObj('MyService', ['addToST']);
    TestBed.configureTestingModule({
      declarations: [ EnquiryComponent ],
      imports: [HttpClientModule,RouterTestingModule,NzNotificationModule,SharedModule,TranslateModule.forRoot(),BrowserAnimationsModule,BrowserModule ] ,
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
    fixture = TestBed.createComponent(EnquiryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should return expected data', () => {
    // myServiceSpy.addToST.and.returnValue(of(expectedData));
    // Test component that uses myServiceSpy.getData
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
 
  describe('clear()', () => {
    it('should reset all properties and call getEnquiryList()', () => {
      spyOn(component, 'getEnquiryList');
      component.enquiryDate = 'sampleDate';
      component.enquiryNo = 'sampleNo';
      // Assign values to other properties as needed...
 
      component.clear();
 
      expect(component.enquiryDate).toEqual('');
      expect(component.enquiryNo).toEqual('');
      // Check other properties are reset to their default values...
 
      expect(component.getEnquiryList).toHaveBeenCalled();
    });
 
    // Add more cases as needed...
  });
 
  describe('filter()', () => {
    it('should update size, fromSize, and call getEnquiryList()', () => {
      spyOn(component, 'getEnquiryList');
      const event = { target: { value: 20 } };
      component.filter(event);
      expect(component.size).toEqual(20);
      expect(component.fromSize).toEqual(1);
      expect(component.getEnquiryList).toHaveBeenCalled();
    });
 
    // Add more cases as needed...
  });
 
  describe('next()', () => {
    it('should call getPaginationData with "next" when toalLength is greater than count', () => {
      spyOn(component, 'getPaginationData');
      component.toalLength = 10;
      component.count = 5;
      component.next();
      expect(component.getPaginationData).toHaveBeenCalledWith('next');
    });
 
    it('should not call getPaginationData when toalLength is equal to count', () => {
      spyOn(component, 'getPaginationData');
      component.toalLength = 10;
      component.count = 10;
      component.next();
      expect(component.getPaginationData).not.toHaveBeenCalled();
    });
 
    // Add more cases as needed...
  });
 
  describe('prev()', () => {
    it('should call getPaginationData with "prev" when page is greater than 0 and not equal to 1', () => {
      spyOn(component, 'getPaginationData');
      component.page = 2;
      component.prev();
      expect(component.getPaginationData).toHaveBeenCalledWith('prev');
    });
 
    it('should not call getPaginationData when page is 0', () => {
      spyOn(component, 'getPaginationData');
      component.page = 0;
      component.prev();
      expect(component.getPaginationData).not.toHaveBeenCalled();
    });
 
    it('should not call getPaginationData when page is 1', () => {
      spyOn(component, 'getPaginationData');
      component.page = 1;
      component.prev();
      expect(component.getPaginationData).not.toHaveBeenCalled();
    });
 
    // Add more cases as needed...
  });
  describe('clear()', () => {
    it('should reset all properties to default values and call getEnquiryList()', () => {
      spyOn(component, 'getEnquiryList');
      // Assign values to properties...
 
      component.clear();
 
      // Assertions for resetting properties...
 
      expect(component.getEnquiryList).toHaveBeenCalled();
    });
 
    it('should reset properties even when they are already empty and call getEnquiryList()', () => {
      spyOn(component, 'getEnquiryList');
      // Ensure properties are already empty...
 
      component.clear();
 
      // Assertions for resetting properties...
 
      expect(component.getEnquiryList).toHaveBeenCalled();
    });
 
    // Add more cases as needed...
  });
 
  describe('filter()', () => {
    it('should update size, fromSize, and call getEnquiryList()', () => {
      spyOn(component, 'getEnquiryList');
      const event = { target: { value: 20 } };
      // Set initial values for size, fromSize...
 
      component.filter(event);
 
      // Assertions for updating size, fromSize...
 
      expect(component.getEnquiryList).toHaveBeenCalled();
    });
 
  });
 
  describe('next()', () => {
    it('should call getPaginationData with "next" when toalLength is greater than count', () => {
      spyOn(component, 'getPaginationData');
      component.toalLength = 10;
      component.count = 5;
 
      component.next();
 
      // Assertions...
 
      expect(component.getPaginationData).toHaveBeenCalledWith('next');
    });
 
    it('should not call getPaginationData when toalLength is equal to count', () => {
      spyOn(component, 'getPaginationData');
      component.toalLength = 10;
      component.count = 10;
 
      component.next();
 
      // Assertions...
 
      expect(component.getPaginationData).not.toHaveBeenCalled();
    });
 
    // Add more cases as needed...
  });
 
  describe('prev()', () => {
    it('should call getPaginationData with "prev" when page is greater than 0 and not equal to 1', () => {
      spyOn(component, 'getPaginationData');
      component.page = 2;
 
      component.prev();
 
      // Assertions...
 
      expect(component.getPaginationData).toHaveBeenCalledWith('prev');
    });
 
    it('should not call getPaginationData when page is 0', () => {
      spyOn(component, 'getPaginationData');
      component.page = 0;
 
      component.prev();
 
      // Assertions...
 
      expect(component.getPaginationData).not.toHaveBeenCalled();
    });
 
    it('should not call getPaginationData when page is 1', () => {
      spyOn(component, 'getPaginationData');
      component.page = 1;
 
      component.prev();
 
      // Assertions...
 
      expect(component.getPaginationData).not.toHaveBeenCalled();
    });
 
    // Add more cases as needed...
  });
 
 
  describe('clearGloble()', () => {
    it('should reset globalSearch and call clear()', () => {
      spyOn(component, 'clear');
      // Set initial value for globalSearch...
 
      component.clearGloble();
 
      // Assertions for resetting globalSearch and calling clear()...
 
      expect(component.clear).toHaveBeenCalled();
      expect(component.globalSearch).toEqual('');
    });
 
    it('should reset globalSearch even when it is already empty and call clear()', () => {
      spyOn(component, 'clear');
      // Ensure globalSearch is already empty...
 
      component.clearGloble();
 
      // Assertions for resetting globalSearch and calling clear()...
 
      expect(component.clear).toHaveBeenCalled();
      expect(component.globalSearch).toEqual('');
    });
 
  });
  describe('sort()', () => {
    it('should sort the enquiryList in ascending order based on colName when order is true', () => {
      // Set initial values...
 
      component.sort('columnName');
 
      // Assertions for sorting in ascending order...
 
      expect(component.enquiryList).toEqual([]);
      expect(component.order).toBeFalse();
    });
 
    it('should sort the enquiryList in descending order based on colName when order is false', () => {
      // Set initial values with order as false...
 
      component.sort('columnName');
 
      // Assertions for sorting in descending order...
 
      expect(component.enquiryList).toEqual([]);
      expect(component.order).toBe(false);
    });
 
    // Add more cases as needed...
  });
 
  describe('calculator()', () => {
    it('should open the calculator application', () => {
      const openSpy = spyOn(window, 'open');
     
      component.calculator();
 
      // Assertions for opening the calculator application...
 
      expect(openSpy).toHaveBeenCalledWith('Calculator:///');
    });
 
    // Add more cases as needed...
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
