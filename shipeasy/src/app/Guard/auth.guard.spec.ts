import { TestBed, async, inject } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { CognitoService } from '../services/cognito.service';
import { CommonFunctions } from '../shared/functions/common.function';
import { Observable, of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

class MockAuthService {
  // Implement any methods or properties needed for testing
}

class MockCognitoService {
  // Implement any methods or properties needed for testing
}

class MockCommonFunctions {
  isAuthenticated(): boolean {
    return true; // Change as needed for testing different scenarios
  }
  getUserType(){}
}



describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: MockAuthService;
  let router: Router;
  let cognitoService: MockCognitoService;
  let commonFunction: MockCommonFunctions;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule,HttpClientTestingModule],
      providers: [
        AuthGuard,
        { provide: AuthService, useClass: MockAuthService },
        { provide: CognitoService, useClass: MockCognitoService },
        { provide: CommonFunctions, useClass: MockCommonFunctions }
      ]
    });
    guard = TestBed.inject(AuthGuard);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    cognitoService = TestBed.inject(CognitoService);
    commonFunction = TestBed.inject(CommonFunctions);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should return true when canActivate is called and authentication check is successful', () => {
    spyOn(commonFunction, 'isAuthenticated').and.returnValue(true);
    const canActivate = guard.canActivate(null, { url: '/some-url' } as RouterStateSnapshot);
    expect(canActivate).toEqual(true);
  });

  // it('should allow activation and return true when canActivate is called and authentication check is successful', () => {
  //   spyOn(commonFunction, 'isAuthenticated').and.returnValue(true);
  //   const canActivate = guard.canActivate(null, { url: '/some-url' } as RouterStateSnapshot);
  //   expect(canActivate).toEqual(true);
  // });


});
function getUserType() {
  throw new Error('Function not implemented.');
}

