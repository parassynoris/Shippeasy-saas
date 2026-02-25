import { TestBed } from '@angular/core/testing';

import { TransactionService } from './transaction.service';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe} from '@angular/common';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { CognitoService } from 'src/app/services/cognito.service';
import { RouterTestingModule } from '@angular/router/testing';
import * as Constant from 'src/app/shared/common-constants';
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
describe('TransactionService', () => {
  let service: TransactionService;
  let mockCognitoService: jasmine.SpyObj<CognitoService>
  let httpMock: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers:[{provide:CognitoService,useValue:mockCognitoService}],
      imports: [HttpClientTestingModule,NzNotificationModule,RouterTestingModule,RouterModule,RouterModule.forRoot([])],
    });
    service = TestBed.inject(TransactionService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    httpMock.verify();
  });
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should add enquiry charges', () => {
    const dummyAddBody = { /* dummy data */ };
    const mockResponse = { /* mock response */ };

    service.addEnquiryCharges(dummyAddBody).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.baseUrlMaster}${Constant.ENQUIRY_ITEM_ADD}`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });
  it('should handle error when adding enquiry charges fails', () => {
    const dummyAddBody = { /* dummy data */ };
    const mockErrorResponse = { status: 400, statusText: 'Bad Request' };
  
    service.addEnquiryCharges(dummyAddBody).subscribe({
      error: (error) => {
        expect(error.status).toEqual(400);
      }
    });
  
    const req = httpMock.expectOne(`${environment.baseUrlMaster}${Constant.ENQUIRY_ITEM_ADD}`);
    expect(req.request.method).toBe('POST');
    req.flush(null, mockErrorResponse);
  });
  it('should handle null data when adding enquiry charges', () => {
    const dummyAddBody = null;
  
    service.addEnquiryCharges(dummyAddBody).subscribe(response => {
      expect(response).toBeNull();
    });
  
    const req = httpMock.expectOne(`${environment.baseUrlMaster}${Constant.ENQUIRY_ITEM_ADD}`);
    expect(req.request.method).toBe('POST');
    req.flush(null);
  });
  it('should transform response when getting enquiry charges', () => {
    const dummyData = { /* dummy data */ };
    const mockResponse = { /* mock response */ };
    const transformedResponse = { /* transformed response */ };
  
    service.getEnquiryCharges(dummyData).subscribe(response => {
      expect(response).toEqual(transformedResponse);
    });
  
    const req = httpMock.expectOne(`${environment.baseUrlMaster}${Constant.ENQUIRY_ITEM_LIST}`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should update container with provided data', () => {
    const dummyData = { /* dummy data */ };
    const mockResponse = { /* mock response */ };
  
    service.updateContainer(dummyData).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
  
    const req = httpMock.expectOne(`${environment.baseUrlMaster}transaction/containermaster/update`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });
  
  it('should create tariff input with provided data', () => {
    const dummyData = { /* dummy data */ };
    const mockResponse = { /* mock response */ };
  
    service.createTariffInput(dummyData).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
  
    const req = httpMock.expectOne(`${environment.baseUrlMaster}tariff/rate-master`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });
  
  it('should update tariff input with provided data', () => {
    const dummyData = { /* dummy data */ };
    const mockResponse = { /* mock response */ };
  
    service.updateTariffInput(dummyData).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
  
    const req = httpMock.expectOne(`${environment.baseUrlMaster}tariff/rate-master/update`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });
  
  it('should save IGM with provided data', () => {
    const dummyData = { /* dummy data */ };
    const mockResponse = { /* mock response */ };
  
    service.saveIgm(dummyData).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
  
    const req = httpMock.expectOne(`${environment.baseUrlMaster}/igm`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });
  
  it('should save EGM with provided data', () => {
    const dummyData = { /* dummy data */ };
    const mockResponse = { /* mock response */ };
  
    service.saveEgm(dummyData).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
  
    const req = httpMock.expectOne(`${environment.baseUrlMaster}/egm`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);  
  });
    
});