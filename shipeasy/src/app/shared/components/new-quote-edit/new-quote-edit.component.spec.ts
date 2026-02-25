import { ComponentFixture, TestBed } from '@angular/core/testing';
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
import { NewQuoteEditComponent } from './new-quote-edit.component';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormArray } from '@angular/forms';

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
  getActiveAgent(){

  }
  getAgentDetails(){

  }
  getAgentCur(){ }
  customerCurrency(){}
}
describe('NewQuoteEditComponent', () => {
  let component: NewQuoteEditComponent;
  let fixture: ComponentFixture<NewQuoteEditComponent>;
  let commonFunctionsMock: jasmine.SpyObj<CommonFunctions>;
  let translateServiceStub: Partial<TranslateService>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let commonServiceMock: jasmine.SpyObj<ApiService>;
  let notificationServiceMock: jasmine.SpyObj<NzNotificationService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;
  let mockRouter: jasmine.SpyObj<Router>
  beforeEach(async () => {
    translateServiceStub = {
      get: (key: string) => of(key),
      instant: jasmine.createSpy('instant').and.returnValue('translated text')
    };
    commonFunctionsMock = jasmine.createSpyObj('CommonFunctions', ['getAuthToken','getActiveAgent','getAgentDetails','getExchangeRate']);
    commonServiceMock = jasmine.createSpyObj('ApiService', ['getSTList','getExchangeRate','getActiveAgent','getAgentDetails']);

    await TestBed.configureTestingModule({
      declarations: [ NewQuoteEditComponent ],
      imports: [HttpClientModule,RouterTestingModule,NzNotificationModule,SharedModule,TranslateModule.forRoot(),BrowserDynamicTestingModule,BrowserAnimationsModule] ,
      providers: [
        NzNotificationService,
        CognitoService, 
        OverlayModule ,
        CurrencyPipe,
        DecimalPipe,
        { provide: CommonFunctions, useValue: jasmine.createSpyObj('CommonFunctions', ['yourMethod']) }, // Provide a mock for CommonFunctions
        { provide: Router, useValue: mockRouter },
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
    fixture = TestBed.createComponent(NewQuoteEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form', () => {
    expect(component.quoteForm).toBeDefined();
    expect(component.quoteForm.controls.validFrom.value).toEqual(jasmine.any(Date));
    expect(component.quoteForm.controls.validTo.value).toBe('');
  });

  it('should get enquiry details', () => {
    spyOn(component, 'getEnquiry');
    component.ngOnInit();
    expect(component.getEnquiry).toHaveBeenCalled();
  });

  it('should add default charges when enquiryDetails.charges is absent', () => {
    component.enquiryDetails = {
      charges: []
    };
    component.addDefaultCharge = [
      {
        gst: 10,
        chargeType: 'type1',
        costitemId: 'costitem1',
        chargeAmount: 100,
        currencyId: 'currencyId'
      }
    ];

    component.openQuote();

    expect((component.quoteForm.get('charge') as FormArray).length).toBe(1);
  });

  it('should initialize form controls', () => {
    expect(component.quoteForm.contains('charge')).toBeTruthy();
    expect(component.quoteForm.contains('validFrom')).toBeTruthy();
    // Add more form controls as necessary
  });

  it('should open quote and reset form', () => {
    component.openQuote();
    expect(component.quoteForm.get('charge')['controls'].length).toBe(0);
    expect(component.quoteForm.get('validFrom').value).toBeInstanceOf(Date);
  });

  it('should add charge row correctly', () => {
    component.addChargeRow();
    expect(component.getChargeControls().length).toBe(1);
  });

  it('should calculate buy amount correctly', () => {
    component.addChargeRow();
    const chargeControl = component.quoteForm.get('charge')['controls'][0];
    chargeControl.get('buyRate').setValue(10);
    chargeControl.get('quantity').setValue(2);
    component.calcBuyAMT(0);
    expect(chargeControl.get('buyTotal').value).toBe(20);
  });

  it('should disable ETD date correctly', () => {
    const currentDate = new Date();
    component.quoteForm.controls.validFrom.setValue(currentDate);
    const disabled = component.disabledEtdDate(currentDate);
    expect(disabled).toBeFalse();
  });

  it('should call notification service on successful deletion', () => {
    modalServiceMock?.open.and.returnValue({ result: Promise.resolve('yes') }as any);
    component.addChargeRow();
    component.deleteCharge({}, { value: { enquiryitemId: '123' } }, 0);
    fixture.whenStable().then(() => {
      expect(notificationServiceMock.create).toHaveBeenCalledWith('success', 'Deleted Successfully', '');
    });
  });
  
  it('should not set exRate in quoteForm if currencyList does not have matching currencyId', () => {
    // Arrange
    spyOn(component.quoteForm.controls.exRate, 'patchValue');
    component.currencyList = []; // Simulate empty currencyList
    component.quoteForm.controls.currency.patchValue('USD');
  
    // Act
    component.CurrChange();
  
    // Assert
    expect(component.quoteForm.controls.exRate.patchValue).not.toHaveBeenCalled();
  });
  
  
});

