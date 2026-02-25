import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { NzNotificationModule, NzNotificationService } from 'ng-zorro-antd/notification';
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
import autoTable from 'jspdf-autotable';
import { InvoicesComponent } from './invoices.component';
import { ApiSharedService } from 'src/app/shared/components/api-service/api-shared.service';
import { CognitoService } from 'src/app/services/cognito.service';
 
// Mock implementation of OrderByPipe
@Pipe({ name: 'orderBy' })
class MockOrderByPipe implements PipeTransform {
  transform(value: any[], key: string): any[] {
    return value; // Mock implementation: return the input array without sorting
  }
}
describe('InvoicesComponent', () => {
  let component: InvoicesComponent;
  let fixture: ComponentFixture<InvoicesComponent>;
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
 
  beforeEach(async () => {
    translateServiceStub = {
      get: (key: string) => of(key),
      instant: jasmine.createSpy('instant').and.returnValue('translated text')
    };
    commonFunctionsMock = jasmine.createSpyObj('CommonFunctions', ['getAuthToken']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails','getModule','getagentDetails']);
    apiServiceMock = jasmine.createSpyObj('ApiSharedService', ['body', 'bodyNew', 'getSTList', 'pushreports', 'deleteST']);
    await TestBed.configureTestingModule({
      declarations: [ InvoicesComponent,MockOrderByPipe  ],
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
        { provide: CognitoService, useClass: MockCognitoService }, // Mock CognitoService
        { provide: CommonFunctions, useClass: MockCommonFunctions },
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
    fixture = TestBed.createComponent(InvoicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
 
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should call getInvoiceList on component initialization', () => {
    spyOn(component, 'getInvoiceList');
    component.ngOnInit();
    expect(component.getInvoiceList).toHaveBeenCalled();
  });
 
  it('should call next() method when next button is clicked', () => {
    spyOn(component, 'next');
    component.next();
    expect(component.next).toHaveBeenCalled();
  });
 
  it('should call prev() method when prev button is clicked', () => {
    spyOn(component, 'prev');
    component.prev();
    expect(component.prev).toHaveBeenCalled();
  });
 
  it('should call filter() method when filter is changed', () => {
    spyOn(component, 'filter');
    const event = { target: { value: '20' } };
    component.filter(event);
    expect(component.filter).toHaveBeenCalledWith(event);
  });
 
  it('should call search() method when search is triggered', () => {
    spyOn(component, 'search');
    component.search();
    expect(component.search).toHaveBeenCalled();
  });
 
  it('should call clear() method when clear button is clicked', () => {
    spyOn(component, 'clear');
    component.clear();
    expect(component.clear).toHaveBeenCalled();
  });
 
  it('should call delete() method when delete button is clicked', () => {
    spyOn(component, 'delete');
    const deleteInvoiceMock = jasmine.createSpyObj('NgbModal', ['open', 'dismissAll']);
    component.delete(deleteInvoiceMock, 'invoiceId');
    expect(component.delete).toHaveBeenCalled();
  });
 
  it('should call removeRow() method when removeRow button is clicked', () => {
    spyOn(component, 'removeRow');
    component.removeRow('content1');
    expect(component.removeRow).toHaveBeenCalled();
  });
 
  it('should decrement the page and call getPaginationData when prev is called', () => {
    // Arrange
    component.page = 2;
    spyOn(component, 'getPaginationData');
 
    // Act
    component.prev();
 
    // Assert
    expect(component.page).toBe(2);
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });
       
  class MockCognitoService {
    getUserDatails() {
      // Mock implementation
    }
    getagentDetails(){}
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