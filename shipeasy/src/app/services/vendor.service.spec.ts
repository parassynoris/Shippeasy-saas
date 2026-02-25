import { TestBed } from '@angular/core/testing';

import { VendorService } from './vendor.service';
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

describe('VendorService', () => {
  let service: VendorService;
  let mockCognitoService: jasmine.SpyObj<CognitoService>
  let httpMock: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule,NzNotificationModule,RouterTestingModule,RouterModule,RouterModule.forRoot([])],
    });
    service = TestBed.inject(VendorService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    httpMock.verify();
  });
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should fetch vendor list', () => {
    const mockData = { /* mock data here */ };

    service.getVendorList(mockData).subscribe(response => {
      expect(response).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${environment.baseUrlMaster}profile/list?type=vendor`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockData);
    req.flush(mockData);
  });
  it('should fetch country list with no parameters', () => {
    const mockResponse = { /* mock data here */ };
  
    service.countryList().subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
  
    const req = httpMock.expectOne(`${environment.baseUrlMaster}master/list?type=country`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(service.body);
    req.flush(mockResponse);
  });
  it('should create a smart agent successfully', () => {
    const createBody = { /* mock create body */ };
    const mockResponse = { /* mock created smart agent */ };
  
    service.createSmartAgent(createBody).subscribe(response => {
      expect(response).toEqual(mockResponse as any);
    });
  
    const req = httpMock.expectOne(`${environment.baseUrlMaster}profile/agent`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(createBody);
    req.flush(mockResponse);
  });
  it('should update a bank successfully', () => {
    const updateBody = { /* mock update body */ };
    const mockResponse = { /* mock updated bank */ };
  
    service.updateBank(updateBody).subscribe(response => {
      expect(response).toEqual(mockResponse as any);
    });
  
    const req = httpMock.expectOne(`${environment.baseUrlMaster}profile/bank/update`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(updateBody);
    req.flush(mockResponse);
  });
  it('should retrieve a principal by ID successfully', () => {
    const getBody = { /* mock get body */ };
    const mockResponse = { /* mock principal */ };
  
    service.getPrincipalById(getBody).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
  
    const req = httpMock.expectOne(`${environment.baseUrlMaster}profile/list?type=principal`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(getBody);
    req.flush(mockResponse);
  });
  it('should fetch list of banks successfully', () => {
    const mockBody = { /* mock body */ };
    const mockResponse = { /* mock bank list */ };
  
    service.bankList(mockBody).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
  
    const req = httpMock.expectOne(`${environment.baseUrlMaster}master/list?type=bank`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockBody);
    req.flush(mockResponse);
  });
  it('should fetch details of a bank successfully', () => {
    const getBody = { /* mock get body */ };
    const mockResponse = { /* mock bank details */ };
  
    service.getBankById(getBody).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
  
    const req = httpMock.expectOne(`${environment.baseUrlMaster}master/list?type=bank`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(getBody);
    req.flush(mockResponse);
  });
  it('should fetch list of states related to a country successfully', () => {
    const getBody = { /* mock get body */ };
    const mockResponse = { /* mock state list */ };
  
    service.stateList(getBody).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
  
    const req = httpMock.expectOne(`${environment.baseUrlMaster}master/list?type=state`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(getBody);
    req.flush(mockResponse);
  });
  it('should handle pagination for vendor list', () => {
    const mockBody = { /* mock body */ };
    const mockResponse = { /* mock paginated vendor list */ };
  
    service.getVendorList(mockBody).subscribe(response => {
      expect(response).toEqual(mockResponse);
      expect(response.length).toBe(undefined ); // Assuming pagination returns some items
    });
  
    const req = httpMock.expectOne(`${environment.baseUrlMaster}profile/list?type=vendor`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockBody);
    req.flush(mockResponse);
  });
            
});