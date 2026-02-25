
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { of } from 'rxjs';
import { OrgSettingGuard } from './org-setting.guard';
import { CommonFunctions } from '../shared/functions/common.function';
import { CognitoService } from '../services/cognito.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';

// Mock CognitoService
class MockCognitoService {
  getagentDetails() {
    return of({ orgId: 1 }); // Return a mock observable
  }
}

// Mock CommonFunctions
class MockCommonFunctions {
  getAgentDetails() {
    return { agentId: 1 }; // Return a mock agentId
  }
  isSuperAdmin() {
    return false; // Mock implementation
  }
}

// Mock ActivatedRoute
class MockActivatedRoute {
  queryParams = of({ redirect: 'test' }); // Mock queryParams observable
}

describe('OrgSettingGuard', () => {
  let guard: OrgSettingGuard;
  let router: Router;
  let commonFunctions: MockCommonFunctions;
  let cognitoService: MockCognitoService;
  let activatedRoute: MockActivatedRoute;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        OrgSettingGuard,
        { provide: CommonFunctions, useClass: MockCommonFunctions }, // Provide the mock for CommonFunctions
        { provide: CognitoService, useClass: MockCognitoService }, // Provide the mock for CognitoService
        { provide: NzNotificationService, useValue: {} }, // Provide a mock value for NzNotificationService
        { provide: ActivatedRoute, useClass: MockActivatedRoute } // Provide a mock value for ActivatedRoute
      ]
    });

    guard = TestBed.inject(OrgSettingGuard);
    router = TestBed.inject(Router);
    commonFunctions = TestBed.inject(CommonFunctions) as unknown as MockCommonFunctions;
    cognitoService = TestBed.inject(CognitoService) as unknown as MockCognitoService;
    activatedRoute = TestBed.inject(ActivatedRoute) as unknown as MockActivatedRoute;
  });

  it('should allow activation if user is super admin', () => {
    spyOn(commonFunctions, 'isSuperAdmin').and.returnValue(true);

    const route = new ActivatedRouteSnapshot();
    const state = {} as RouterStateSnapshot;

    const result = guard.canActivate(route, state);

    expect(result).toBe(true);
    expect(commonFunctions.isSuperAdmin).toHaveBeenCalled();
  });

  it('should navigate and prevent activation if user is not super admin', () => {
    spyOn(commonFunctions, 'isSuperAdmin').and.returnValue(false);
    spyOn(router, 'navigate');

    const route = new ActivatedRouteSnapshot();
    route.queryParams = { param1: 'test' };
    const state = {} as RouterStateSnapshot;

    const result = guard.canActivate(route, state);

    expect(result).toBe(false);
    expect(commonFunctions.isSuperAdmin).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(
      ['/register', 'list', 1, 'details', 'editsmart'],
      { queryParams: route.queryParams }
    );
  });
  it('should correctly navigate to the provided route', () => {
    spyOn(commonFunctions, 'isSuperAdmin').and.returnValue(false);
    spyOn(commonFunctions, 'getAgentDetails').and.returnValue({ agentId: 2 });
    spyOn(router, 'navigate');

    const route = new ActivatedRouteSnapshot();
    route.queryParams = { redirectTo: '/some/other/route' };
    const state = {} as RouterStateSnapshot;

    const result = guard.canActivate(route, state);

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(
      ['/register', 'list', 2, 'details', 'editsmart'],
      { queryParams: route.queryParams }
    );
  });

  // Additional Test Case 4: Verify the guard behavior with a different query parameter
  it('should navigate and handle different query parameters', () => {
    spyOn(commonFunctions, 'isSuperAdmin').and.returnValue(false);
    spyOn(commonFunctions, 'getAgentDetails').and.returnValue({ agentId: 3 });
    spyOn(router, 'navigate');

    const route = new ActivatedRouteSnapshot();
    route.queryParams = { anotherParam: 'anotherValue' };
    const state = {} as RouterStateSnapshot;

    const result = guard.canActivate(route, state);

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(
      ['/register', 'list', 3, 'details', 'editsmart'],
      { queryParams: route.queryParams }
    );
  });
});
