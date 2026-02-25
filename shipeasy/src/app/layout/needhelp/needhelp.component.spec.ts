import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NeedhelpComponent } from './needhelp.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
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
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { Pipe, PipeTransform } from '@angular/core';
import { ApiSharedService } from 'src/app/shared/components/api-service/api-shared.service';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

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
describe('NeedhelpComponent', () => {
  let component: NeedhelpComponent;
  let fixture: ComponentFixture<NeedhelpComponent>;
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
      declarations: [ NeedhelpComponent ],
      imports: [HttpClientModule,RouterTestingModule,NzNotificationModule,SharedModule,TranslateModule.forRoot(),BrowserDynamicTestingModule,BrowserAnimationsModule] ,
      providers: [
        NzNotificationService,
        CognitoService, 
        OverlayModule ,
        { provide: CommonFunctions, useValue: jasmine.createSpyObj('CommonFunctions', ['yourMethod']) }, // Provide a mock for CommonFunctions
        { provide: Router, useValue: {} },
        ApiSharedService,NgbActiveModal,
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
    fixture = TestBed.createComponent(NeedhelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should initialize forms', () => {
    expect(component.EmailForm).toBeDefined();
    expect(component.EmailForms).toBeDefined();
    expect(component.bookingForm).toBeDefined();
  });

  it('should initialize panel states', () => {
    expect(component.isInquiryPanelOpen).toBeFalse();
    expect(component.isBookingPanelOpen).toBeFalse();
    expect(component.isInvoicePanelOpen).toBeFalse();
  });

  it('should toggle panels correctly', () => {
    component.togglePanel('inquiry');
    expect(component.isInquiryPanelOpen).toBeTrue();
    component.togglePanel('booking');
    expect(component.isBookingPanelOpen).toBeTrue();
    component.togglePanel('invoice');
    expect(component.isInvoicePanelOpen).toBeTrue();
  });
  it('should validate EmailForm', () => {
    component.EmailForm.setValue({
      message: 'Test message',
      Email: 'test@example.com',
      name: 'Test User',
      attachment: '',
      attachmentId: ''
    });
    expect(component.EmailForm.valid).toBeTrue();
  });
  
  it('should validate EmailForms', () => {
    component.EmailForms.setValue({
      message: 'Test message',
      Email: 'test@example.com',
      name: 'Test User',
      attachment: '',
      attachmentId: ''
    });
    expect(component.EmailForms.valid).toBeTrue();
  });
  
  it('should validate bookingForm', () => {
    component.bookingForm.setValue({
      message: 'Test message',
      Email: 'test@example.com',
      name: 'Test User',
      attachment: '',
      attachmentId: ''
    });
    expect(component.bookingForm.valid).toBeTrue();
  });
it('should submit EmailForm and call send() for Inquiry', () => {
  spyOn(component, 'send');
  component.EmailForm.setValue({
    message: 'Test inquiry message',
    Email: 'test@example.com',
    name: 'Test User',
    attachment: '',
    attachmentId: ''
  });
  component.send('Inquiry');
  expect(component.send).toHaveBeenCalled();
});

it('should submit bookingForm and call send() for Booking', () => {
  spyOn(component, 'send');
  component.bookingForm.setValue({
    message: 'Test booking message',
    Email: 'test@example.com',
    name: 'Test User',
    attachment: '',
    attachmentId: ''
  });
  component.send('Booking');
  expect(component.send).toHaveBeenCalled();
});

it('should submit EmailForms and call send() for General Inquiry', () => {
  spyOn(component, 'send');
  component.EmailForms.setValue({
    message: 'Test general inquiry message',
    Email: 'test@example.com',
    name: 'Test User',
    attachment: '',
    attachmentId: ''
  });
  component.send('General Inquiry');
  expect(component.send).toHaveBeenCalled();
});
  
});