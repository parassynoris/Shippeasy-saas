import { CurrencyPipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { NzNotificationModule, NzNotificationService } from 'ng-zorro-antd/notification';
import { of, throwError } from 'rxjs';
import { CognitoService } from 'src/app/services/cognito.service';
import { FinanceService } from 'src/app/services/Finance/finance.service';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { CustomCurrencyPipe } from '../../pipes/custom-currency.pipe';
import { CommonService } from '../../services/common.service';
import { SharedModule } from '../../shared.module';
import { PNLComponent } from './pnl.component';

describe('PNLComponent', () => {
  let component: PNLComponent;
  let fixture: ComponentFixture<PNLComponent>;
  let pipe: CustomCurrencyPipe;
  let currencyPipe: CurrencyPipe;
  let transactionServiceSpy: jasmine.SpyObj<TransactionService>;
  let financeServiceSpy: jasmine.SpyObj<FinanceService>;
  let commonServiceSpy: jasmine.SpyObj<CommonService>;
  let notificationServiceSpy: jasmine.SpyObj<NzNotificationService>;

  beforeEach(async(() => {
    const transactionService = jasmine.createSpyObj('TransactionService', ['getJobList']);
    const financeService = jasmine.createSpyObj('FinanceService', ['paymentList', 'invoiceList']);
    const commonService = jasmine.createSpyObj('CommonService', ['getUserDatails']);
    const notificationService = jasmine.createSpyObj('NzNotificationService', ['create']);
    TestBed.configureTestingModule({
      declarations: [ PNLComponent ],
      imports: [RouterTestingModule, HttpClientModule, BrowserAnimationsModule, SharedModule, NzNotificationModule, TranslateModule.forRoot()], // Add RouterTestingModule here
      providers: [CurrencyPipe,
        { provide: CognitoService, useClass: MockCognitoService }]
    })
    .compileComponents();
    transactionServiceSpy = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
    financeServiceSpy = TestBed.inject(FinanceService) as jasmine.SpyObj<FinanceService>;
    commonServiceSpy = TestBed.inject(CommonService) as jasmine.SpyObj<CommonService>;
    notificationServiceSpy = TestBed.inject(NzNotificationService) as jasmine.SpyObj<NzNotificationService>;
  }));


  beforeEach(() => {
    fixture = TestBed.createComponent(PNLComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  class MockCognitoService {
    getUserDatails() {
      // Mock implementation
    }
  }

  it('should reset properties and call methods when job exists in jobData', () => {
    const jobData = [{ _source: { jobId: '1' } }];
    component.jobData = jobData;
    spyOn(component, 'getChargeItemData');
    spyOn(component, 'getPaymentData');

    const event = { target: { value: '1' } };
    component.jobSelect(event);

    expect(component.totalCustomerInvoice).toEqual(0);
    expect(component.vendorBills).toEqual(0);
    expect(component.totalPaymentAmount).toEqual(0);
    expect(component.totalAmtInr).toEqual(0);
    expect(component.getChargeItemData).toHaveBeenCalled();
    expect(component.getPaymentData).toHaveBeenCalled();
  });
  it('should set total properties to zero and call methods', () => {
    component.jobData = [{ _source: { jobId: '1' } }];
    spyOn(component, 'getChargeItemData');
    spyOn(component, 'getPaymentData');

    const event = { target: { value: '1' } };
    component.jobSelect(event);

    expect(component.totalCustomerInvoice).toEqual(0);
    expect(component.vendorBills).toEqual(0);
    expect(component.totalPaymentAmount).toEqual(0);
    expect(component.totalAmtInr).toEqual(0);
    expect(component.getChargeItemData).toHaveBeenCalled();
    expect(component.getPaymentData).toHaveBeenCalled();
  });
  
  
});
