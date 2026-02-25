import { TestBed } from '@angular/core/testing';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe} from '@angular/common';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { CognitoService } from '../cognito.service';
import { FinanceService } from './finance.service';
import { environment } from 'src/environments/environment';


@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  
  constructor(private currencyPipe: CurrencyPipe) {}
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('FinanceService', () => {
  let service: FinanceService;
  let mockCognitoService: jasmine.SpyObj<CognitoService>
  let httpMock: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers:[{provide:CognitoService,useValue:mockCognitoService}],
      imports: [HttpClientTestingModule,NzNotificationModule,RouterModule,RouterModule.forRoot([])],
    });
    service = TestBed.inject(FinanceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve invoice list from the server', () => {
    const mockData = { /* mock data for invoice list */ };
    service.invoiceList(mockData).subscribe(response => {
      expect(response).toBeTruthy(); // assert on response data
    });

    const request = httpMock.expectOne(`${environment.baseUrlMaster}finance/list?type=invoice`);
    expect(request.request.method).toBe('POST');
    request.flush(mockData); // mock response data
  });

  it('should create an invoice', () => {
    const mockBody = { /* mock body for creating invoice */ };
    service.createInvoice(mockBody).subscribe(response => {
      expect(response).toBeTruthy(); // assert on response data
    });

    const request = httpMock.expectOne(`${environment.baseUrlMaster}finance/invoice`);
    expect(request.request.method).toBe('POST');
    request.flush({ /* mock response data */ });
  });

  it('should retrieve payment list', () => {
    const dummyPayments = [
      { id: 1, amount: 100 },
      { id: 2, amount: 200 }
    ];

    service.paymentList({}).subscribe(payments => {
      expect(payments).toEqual(dummyPayments);
    });

    const request = httpMock.expectOne(`${environment.baseUrlMaster}finance/list?type=payment`);
    expect(request.request.method).toBe('POST');
    request.flush(dummyPayments);
  });

});
