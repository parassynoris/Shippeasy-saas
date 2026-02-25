import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InvoicePaymentDetailsComponent } from './invoice-payment-details.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CognitoService } from 'src/app/services/cognito.service';
import { CommonService } from 'src/app/services/common/common.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';

// Create a mock pipe
@Pipe({ name: 'customCurrency' })
class MockCurrencyPipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    return value;
  }
}

// Create a mock service for currencyPipeCutomer
class MockCurrencyPipeCustomer {
  transform(value: any, ...args: any[]): any {
    return value;
  }
}

describe('InvoicePaymentDetailsComponent', () => {
  let component: InvoicePaymentDetailsComponent;
  let fixture: ComponentFixture<InvoicePaymentDetailsComponent>;
  let cognitoService: jasmine.SpyObj<CognitoService>;
  let commonService: jasmine.SpyObj<CommonService>;
  let notificationService: jasmine.SpyObj<NzNotificationService>;

  beforeEach(async () => {
    const cognitoServiceSpy = jasmine.createSpyObj('CognitoService', ['getagentDetails']);
    const commonServiceSpy = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList', 'pushreports', 'UpdateToST']);
    const notificationServiceSpy = jasmine.createSpyObj('NzNotificationService', ['create']);

    await TestBed.configureTestingModule({
      declarations: [InvoicePaymentDetailsComponent, MockCurrencyPipe],
      imports: [RouterTestingModule, ReactiveFormsModule, HttpClientTestingModule,BrowserDynamicTestingModule],
      providers: [
        { provide: CognitoService, useValue: cognitoServiceSpy },
        { provide: CommonService, useValue: commonServiceSpy },
        { provide: NzNotificationService, useValue: notificationServiceSpy },
        { provide: 'currencyPipeCutomer', useClass: MockCurrencyPipeCustomer },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                id: '123'
              }
            }
          }
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(InvoicePaymentDetailsComponent);
    component = fixture.componentInstance;
    cognitoService = TestBed.inject(CognitoService) as jasmine.SpyObj<CognitoService>;
    commonService = TestBed.inject(CommonService) as jasmine.SpyObj<CommonService>;
    notificationService = TestBed.inject(NzNotificationService) as jasmine.SpyObj<NzNotificationService>;
  });

  beforeEach(() => {
    cognitoService.getagentDetails.and.returnValue({ id: 'testUser' } as any);
    commonService.filterList.and.returnValue({} as any);
    commonService.getSTList.and.returnValue(of({
      documents: [
        {
          invoiceId: '123',
          costItems: [{ selEstimates: { taxableAmount: 100, igst: 10, totalAmount: 110 } }]
        }
      ]
    }));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get user data on init', () => {
    expect(component.userData).toEqual({ id: 'testUser' });
  });

  it('should switch currency on switchclick', () => {
    component.switchclick({});
    expect(component.check).toBeTrue();
    expect(component.currencyForm.controls['inr'].value).toBeFalse();
    expect(component.currencyForm.controls['usd'].value).toBeTrue();
    expect(component.rate).toBe(0.01234568);
    expect(component.INR).toBeFalse();
    expect(component.USD).toBeTrue();
  });

  it('should return total taxable amount', () => {
    const total = component.returnTotal();
    expect(total).toBe(100);
  });

  it('should return total GST amount', () => {
    const gst = component.rturnGst();
    expect(gst).toBe(10);
  });

  it('should return total final amount', () => {
    const totalFinal = component.returnTotalFinal();
    expect(totalFinal).toBe(110);
  });
});
