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
  it('should delete an enquiry', () => {
    const mockBody = { id: 1 }; // Example body for deletion
    const mockResponse = { success: true }; // Example response

    // Make the HTTP request
    service.deleteEnquiry(mockBody).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    // Expect a delete request to a specific URL with a specific body and headers
    const req = httpMock.expectOne(`${service.baseurlMaster}${Constant.DELETE_ENQUIRY}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockBody);
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
    expect(req.request.headers.get('Authorization')).toContain('Basic');

    // Respond with mock data
    req.flush(mockResponse);
  });

  it('should handle HTTP errors properly', () => {
    const mockBody = { id: 1 }; // Example body for deletion

    // Make the HTTP request
    service.deleteEnquiry(mockBody).subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
      }
    });

    // Expect a delete request
    const req = httpMock.expectOne(`${service.baseurlMaster}${Constant.DELETE_ENQUIRY}`);

    // Respond with an error
    req.error(new ErrorEvent('Network error'));
  });
});