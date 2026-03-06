import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
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
    return value;
  }
}

describe('AuthService', () => {
  let service: AuthService;
  let mockCognitoService: jasmine.SpyObj<CognitoService>
  let httpMock: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers:[{provide:CognitoService,useValue:mockCognitoService}],
      imports: [HttpClientTestingModule,NzNotificationModule,RouterTestingModule,RouterModule,RouterModule.forRoot([])],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    httpMock.verify();
  });
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should set user as logged out', () => {
    service.logout();

    expect(service.isUserLoggedIn).toBeFalse();
    expect(localStorage.getItem('isUserLoggedIn')).toBeNull();
  });
  it('should not change user login status if already logged out', () => {
    service.isUserLoggedIn = false;
    localStorage.setItem('isUserLoggedIn', 'false');
  
    service.logout();
  
    expect(service.isUserLoggedIn).toBeFalse();
    expect(localStorage.getItem('isUserLoggedIn')).toBe(null );
  });

  it('login should return false (no mock bypass)', (done) => {
    service.login('anyuser', 'anypass').subscribe((result) => {
      expect(result).toBeFalse();
      done();
    });
  });

  it('should logout successfully', () => {
    service.isUserLoggedIn = true;
    localStorage.setItem('isUserLoggedIn', 'true');
    
    service.logout();
    
    expect(service.isUserLoggedIn).toBeFalse();
    expect(localStorage.getItem('isUserLoggedIn')).toBeNull();
  });
    
});
