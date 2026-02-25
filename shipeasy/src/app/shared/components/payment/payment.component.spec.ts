
import { ComponentFixture, TestBed } from '@angular/core/testing';
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
import { of, throwError } from 'rxjs';
import { CommonService } from 'src/app/shared/services/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { Pipe, PipeTransform } from '@angular/core';
import { PaymentComponent } from './payment.component';
import { ApiSharedService } from '../api-service/api-shared.service';
import jsPDF from 'jspdf';
import { MatTableDataSource } from '@angular/material/table';


// Mock implementation of OrderByPipe
@Pipe({ name: 'orderBy' })
class MockOrderByPipe implements PipeTransform {
  transform(value: any[], key: string): any[] {
    return value; // Mock implementation: return the input array without sorting
  }
}
class ActivatedRouteStub {
  snapshot = {
    paramMap: new Map<string, string>().set('id', '123'),
  };
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
  getActiveAgent (){}
  getAuthToken() {
    // Provide a mock implementation or return a default value
  }
}
describe('PaymentComponent', () => {
  let component: PaymentComponent;
  let fixture: ComponentFixture<PaymentComponent>;
  let commonFunctionsMock: jasmine.SpyObj<CommonFunctions>;
  let translateServiceStub: Partial<TranslateService>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let commonServiceMock: jasmine.SpyObj<CommonService>;
  let notificationServiceMock: jasmine.SpyObj<NzNotificationService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;

  beforeEach(async () => {
    translateServiceStub = {
      get: (key: string) => of(key),
      instant: jasmine.createSpy('instant').and.returnValue('translated text')
    };
    commonFunctionsMock = jasmine.createSpyObj('CommonFunctions', ['getAuthToken']);
    await TestBed.configureTestingModule({
      
      declarations: [ PaymentComponent ],
      imports: [HttpClientModule,RouterTestingModule,NzNotificationModule,SharedModule,TranslateModule.forRoot() ] ,
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
        { provide: ActivatedRoute, useClass: ActivatedRouteStub },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of({ get: () => '123' }) }, // Adjust based on your route parameters
        },
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should initialize without errors', () => {
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should navigate to the next page when next() is called', () => {
    component.toalLength = 20; // Assuming total length is set
    component.count = 10; // Assuming current count is set
    component.page = 1; // Assuming current page is set
    spyOn(component, 'getPaginationData').and.callThrough();
    component.next();
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
    // Add expectations for data update after pagination
  });
  
  // Add similar tests for prev() method and other pagination scenarios
  it('should search for data based on the provided search criteria', () => {
    component.reciept_no = '123';
    fixture.detectChanges();
    component.search();
    expect(component.paymentData.length).toBe(0); // Assert that data is filtered
  });

  it('should clear all applied filters', () => {
    spyOn(component, 'getRecieptList');
    
    component.filtersModel = [true, true, true]; // Assuming all filters are applied
    component.clearFilters();
    
    expect(component.filtersModel.every((filter) => !filter)).toBeTrue();
    expect(component.getRecieptList).toHaveBeenCalled();
  });


  it('should initialize with default values and without errors', () => {
    expect(component.currentUrl).toBeDefined(); // Ensure currentUrl is initialized
    expect(component.displayedColumns).toBeDefined(); // Ensure displayedColumns is initialized
    // Add more expectations for default values
  });
  it('should reset all search and filter fields when clear() is called', () => {
    component.reciept_no = '123';
    component.payment_mode = 'cash';
    component.clear();
    expect(component.reciept_no).toEqual('');
    expect(component.payment_mode).toEqual('');
    // Add expectations for other fields
  });
    
 
});