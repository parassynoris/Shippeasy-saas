import { TestBed, inject } from '@angular/core/testing';
import { Router } from '@angular/router';
import { CognitoService } from './cognito.service';
import { CommonFunctions } from '../shared/functions/common.function';
import { MessagingService } from './messaging.service';
import { ApiService } from '../admin/principal/api.service';
import { TranslateService } from '@ngx-translate/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from '../shared/services/common.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';

describe('CognitoService', () => {
  let service: MessagingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CognitoService,
        { provide: NzNotificationService, useValue: {} },
        { provide: CommonFunctions, useValue: {} },
        { provide: MessagingService, useValue: {} },
        { provide: ApiService, useValue: {} },
        { provide: TranslateService, useValue: {} },
        { provide: Router, useValue: {} },
        { provide: CommonService, useValue: {} },
      ],
    });
    service = TestBed.inject(MessagingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

});
