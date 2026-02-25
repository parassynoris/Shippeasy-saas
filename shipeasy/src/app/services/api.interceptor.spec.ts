import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiInterceptor } from './api.interceptor';
import { LoaderService } from './loader.service';
import { CognitoService } from './cognito.service';
import { CommonFunctions } from '../shared/functions/common.function';
import { HTTP_INTERCEPTORS, HttpClient} from '@angular/common/http';
import { NzNotificationService } from 'ng-zorro-antd/notification'; // Import NzNotificationService
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialogModule } from '@angular/material/dialog';


// Mock NzNotificationService
class NzNotificationServiceMock {
  success() { }
  error() { }
  warning() { }
}

describe('ApiInterceptor', () => {
  let interceptor: ApiInterceptor;
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule,BrowserDynamicTestingModule,RouterTestingModule,MatDialogModule],
      providers: [
        LoaderService,
        CognitoService,
        CommonFunctions,
        ApiInterceptor,
        HttpClient,
        { provide: CognitoService, useValue: {} },
        { provide: NzNotificationService, useClass: NzNotificationServiceMock },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: ApiInterceptor,
          multi: true
        }
      ]
    });

    interceptor = TestBed.inject(ApiInterceptor);
    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should intercept PUT requests and add headers', () => {
    const dummyResponse = { /* Your dummy response here */ };
    const putData = { /* Your PUT data here */ };

    httpClient.put('/api/data', putData).subscribe();

    const httpRequest = httpMock.expectOne('/api/data');
    expect(httpRequest.request.method).toEqual('PUT');
    expect(httpRequest.request.headers.has('Authorization')).toBeTruthy();
    expect(httpRequest.request.headers.has('x-api-key')).toBeTruthy();

    httpRequest.flush(dummyResponse);
  });

  it('should intercept DELETE requests and add headers', () => {
    const dummyResponse = { /* Your dummy response here */ };

    httpClient.delete('/api/data').subscribe();

    const httpRequest = httpMock.expectOne('/api/data');
    expect(httpRequest.request.method).toEqual('DELETE');
    expect(httpRequest.request.headers.has('Authorization')).toBeTruthy();
    expect(httpRequest.request.headers.has('x-api-key')).toBeTruthy();

    httpRequest.flush(dummyResponse);
  });

  it('should intercept GET requests and add headers', () => {
    const dummyResponse = { /* Your dummy response here */ };

    httpClient.get('/api/data').subscribe();

    const httpRequest = httpMock.expectOne('/api/data');
    expect(httpRequest.request.headers.has('Authorization')).toBeTruthy();
    expect(httpRequest.request.headers.has('x-api-key')).toBeTruthy();

    httpRequest.flush(dummyResponse);
  });

  it('should intercept POST requests and add headers', () => {
    const dummyResponse = { /* Your dummy response here */ };
    const postData = { /* Your POST data here */ };

    httpClient.post('/api/data', postData).subscribe();

    const httpRequest = httpMock.expectOne('/api/data');
    expect(httpRequest.request.method).toEqual('POST');
    expect(httpRequest.request.headers.has('Authorization')).toBeTruthy();
    expect(httpRequest.request.headers.has('x-api-key')).toBeTruthy();

    httpRequest.flush(dummyResponse);
  });

});
