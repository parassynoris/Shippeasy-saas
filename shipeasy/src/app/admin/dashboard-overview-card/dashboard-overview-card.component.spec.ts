import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardOverviewCardComponent } from './dashboard-overview-card.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/services/common/common.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { GoogleAnalyticsService } from 'src/app/services/google-analytics.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform } from '@angular/core';

// Mock customCurrency pipe
@Pipe({name: 'customCurrency'})
class MockCustomCurrencyPipe implements PipeTransform {
  transform(value: number): string {
    return `MockCurrency${value}`;
  }
}
describe('DashboardOverviewCardComponent', () => {
  let component: DashboardOverviewCardComponent;
  let fixture: ComponentFixture<DashboardOverviewCardComponent>;
  let mockCommonFunctions = jasmine.createSpyObj('CommonFunctions', ['getUserType','customerCurrency','getAgentCur']);
  let mockCognitoService = jasmine.createSpyObj('CognitoService', ['']);
  let mockNgbModal = jasmine.createSpyObj('NgbModal', ['open']);
  let mockRouter = jasmine.createSpyObj('Router', ['navigate']);
  let mockCommonService = jasmine.createSpyObj('CommonService', ['getSTList', 'filterList', 'postCredableBulkInitiate']);
  let mockNotificationService = jasmine.createSpyObj('NzNotificationService', ['create']);
  let mockGoogleAnalyticsService = jasmine.createSpyObj('GoogleAnalyticsService', ['eventEmitter']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardOverviewCardComponent,MockCustomCurrencyPipe   ],
      providers: [
        { provide: CommonFunctions, useValue: mockCommonFunctions },
        { provide: CognitoService, useValue: mockCognitoService },
        { provide: NgbModal, useValue: mockNgbModal },
        { provide: Router, useValue: mockRouter },
        { provide: CommonService, useValue: mockCommonService },
        { provide: NzNotificationService, useValue: mockNotificationService },
        { provide: GoogleAnalyticsService, useValue: mockGoogleAnalyticsService },
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardOverviewCardComponent);
    component = fixture.componentInstance;
    component.Data = {
      quoteRate: {
        preffered: { price: 100 },
        cheapest: { price: 0 },
        fastest: { price: 0 }
      }
    };
    component.type = 'quotation';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set preffered to true when quoteRate preffered price is not zero', () => {
    component.ngOnInit();
    expect(component.preffered).toBeTrue();
    expect(component.costSensitive).toBeFalse();
    expect(component.timeSensitive).toBeFalse();
  });

  it('should open modal with vessel details when onenMap is called', () => {
    mockCommonService.filterList.and.returnValue({ query: {} });
    mockCommonService.getSTList.and.returnValue(of({
      documents: [{ mmsino: '12345', vesselName: 'Vessel1' }]
    }));
    
    component.onenMap('content', 'vesselId');
    
    expect(mockCommonService.getSTList).toHaveBeenCalled();
    expect(component.mmsiNo).toEqual('12345');
    expect(component.vesselName).toEqual('Vessel1');
    expect(mockNgbModal.open).toHaveBeenCalled();
  });

  it('should navigate to payment-confirmation on successful onPay call', () => {
    let invoice = { invoiceId: 'inv123', batchId: 'batch123', invoiceAmount: 100 };
    
    component.onPay(invoice);
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['payment-confirmation'], {
      state: {
        invoiceId: 'inv123',
        bookingId: 'batch123',
        tds: false,
        amount: 100,
        data: invoice,
      },
    });
  });
  it('should set costSensitive to true when quoteRate cheapest price is not zero', () => {
    component.Data = {
      quoteRate: {
        preffered: { price: 0 },
        cheapest: { price: 50 },
        fastest: { price: 0 }
      }
    };
    component.ngOnInit();
    expect(component.preffered).toBe(true );
    expect(component.costSensitive).toBeTrue();
    expect(component.timeSensitive).toBeFalse();
  });

  it('should set timeSensitive to true when quoteRate fastest price is not zero', () => {
    component.Data = {
      quoteRate: {
        preffered: { price: 0 },
        cheapest: { price: 0 },
        fastest: { price: 200 }
      }
    };
    component.ngOnInit();
    expect(component.preffered).toBe(true);
    expect(component.costSensitive).toBeFalse();
    expect(component.timeSensitive).toBeTrue();
  });

  it('should not set any preference when all quoteRate prices are zero', () => {
    component.Data = {
      quoteRate: {
        preffered: { price: 0 },
        cheapest: { price: 0 },
        fastest: { price: 0 }
      }
    };
    component.ngOnInit();
    expect(component.preffered).toBe(true);
    expect(component.costSensitive).toBeFalse();
    expect(component.timeSensitive).toBeFalse();
  });

  it('should set the correct progress data on ngOnInit', () => {
    const testData = {
      progress: 75,
      quoteRate: {
        preffered: { price: 100 },
        cheapest: { price: 50 },
        fastest: { price: 200 }
      }
    };
    component.Data = testData;
    component.ngOnInit();
    expect(component.progress).toEqual(testData);
  });

 
});
