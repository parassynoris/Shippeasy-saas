import { TestBed } from '@angular/core/testing';

import { EnquiryService } from './enquiry.service';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe} from '@angular/common';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { CognitoService } from 'src/app/services/cognito.service';
import { RouterTestingModule } from '@angular/router/testing';
import * as Constant from 'src/app/shared/common-constants';

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
describe('EnquiryService', () => {
  let service: EnquiryService;
  let mockCognitoService: jasmine.SpyObj<CognitoService>
  let httpMock: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers:[{provide:CognitoService,useValue:mockCognitoService}],
      imports: [HttpClientTestingModule,NzNotificationModule,RouterTestingModule,RouterModule,RouterModule.forRoot([])],
    });
    service = TestBed.inject(EnquiryService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    httpMock.verify();
  });
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should create an enquiry', () => {
    const mockEnquiry = { /* mock enquiry data */ };
    const mockResponse = { /* mock response data */ };

    service.CreateEnquiry(mockEnquiry).subscribe(response => {
      expect(response).toEqual(mockResponse as any);
    });

    const mockUrl = 'https://diabos-masters.centralus.azurecontainer.io:8253/enquiry';

    const mockRequest = httpMock.expectOne({
      method: 'POST',
      url: mockUrl,
    });

    expect(mockRequest.request.body).toEqual(mockEnquiry);

    mockRequest.flush(mockResponse);
  });

  it('should handle multiple concurrent requests', () => {
    const mockEnquiry1 = {};
    const mockEnquiry2 = {}
    const mockResponse1 = {};
    const mockResponse2 = {};
  
    service.CreateEnquiry(mockEnquiry1).subscribe(response => {
      expect(response).toEqual(mockResponse1 as any);
    });
  
    service.CreateEnquiry(mockEnquiry2).subscribe(response => {
      expect(response).toEqual(mockResponse2 as any);
    });
  
    const mockUrl = 'https://diabos-masters.centralus.azurecontainer.io:8253/enquiry';
    const mockHeaders = {
      'Content-Type': 'application/json',
      'x-api-key': '12345'
    };
  
    const mockRequests = httpMock.match(mockUrl);
  
    expect(mockRequests.length).toBe(2);
    
    mockRequests[0].flush(mockResponse1);
    mockRequests[1].flush(mockResponse2);
  });
  
});
