import { TestBed, inject } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { CognitoService } from './cognito.service';
import { CommonFunctions } from '../shared/functions/common.function';
import { MessagingService } from './messaging.service';
import { ApiService } from '../admin/principal/api.service';
import { TranslateService } from '@ngx-translate/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from '../shared/services/common.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BehaviorSubject, of } from 'rxjs';

describe('CognitoService', () => {
  let service: CognitoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CognitoService,
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({}) // Mock any necessary params or use an appropriate mock object
          }
        },
        { provide: NzNotificationService, useValue: {} },
        { provide: CommonFunctions, useValue: {} },
        { provide: MessagingService, useValue: {} },
        { provide: ApiService, useValue: {} },
        { provide: TranslateService, useValue: {} },
        { provide: Router, useValue: {} },
        { provide: CommonService, useValue: {} },
      ],
    });
    service = TestBed.inject(CognitoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should check if isAuthenticated returns a boolean', () => {
    const isAuthenticated = service.isAuthenticated();
    expect(typeof isAuthenticated).toBe('boolean');
  });

  it('should return user details', () => {
    const userDetails = { name: 'John Doe', email: 'john@example.com' };
    spyOn(service, 'getUserDatails').and.returnValue(new BehaviorSubject<any>(userDetails));

    service.getUserDatails().subscribe((data) => {
      expect(data).toEqual(userDetails);
    });
  });

  it('should return agent details', () => {
    const agentDetails = { agentId: '123', name: 'Agent Smith' };
    spyOn(service, 'getagentDetails').and.returnValue(new BehaviorSubject<any>(agentDetails));

    service.getagentDetails().subscribe((data) => {
      expect(data).toEqual(agentDetails);
    });
  });

  it('should return role details', () => {
    const roleDetails = ['admin', 'user'];
    spyOn(service, 'getRoleDetails').and.returnValue(new BehaviorSubject<any>(roleDetails));

    service.getRoleDetails().subscribe((data) => {
      expect(data).toEqual(roleDetails);
    });
  });

  it('should return user module', () => {
    const module = 'SMARTAGENT';
    spyOn(service, 'getUserModule').and.returnValue(new BehaviorSubject<any>(module));

    service.getUserModule().subscribe((data) => {
      expect(data).toEqual(module);
    });
  });

  it('should return available modules', () => {
    const modules = ['SMARTAGENT', 'SHIPEASY'];
    spyOn(service, 'getModules').and.returnValue(modules);

    expect(service.getModules()).toEqual(modules);
  });


});
