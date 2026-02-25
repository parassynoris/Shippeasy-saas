import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { NzNotificationModule, NzNotificationService } from 'ng-zorro-antd/notification';
import { CognitoService } from 'src/app/services/cognito.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { OverlayModule } from '@angular/cdk/overlay';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagingService } from 'src/app/services/messaging.service';
import { ApiService } from 'src/app/admin/principal/api.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { CommonService } from 'src/app/shared/services/common.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { Pipe, PipeTransform } from '@angular/core';
import { ApiSharedService } from 'src/app/shared/components/api-service/api-shared.service';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MastersSortPipe } from 'src/app/shared/util/mastersort';
import { FreightCertificateComponent } from './freight-certificate.component';

@Pipe({ name: 'orderBy' })
class MockOrderByPipe implements PipeTransform {
  transform(value: any[]): any[] {
    return value; 
  }
}

class MockCognitoService {
  getUserDatails() {}
}

class MockApiService {
  getSTList() {}
}

class MockCommonFunctions {
  getAgentDetails() {
    return { orgId: '12345' };
  }
  getAuthToken() {}
  getSTList() {}
}

describe('FreightCertificateComponent', () => {
  let component: FreightCertificateComponent;
  let fixture: ComponentFixture<FreightCertificateComponent>;
  let commonFunctionsMock: jasmine.SpyObj<CommonFunctions>;
  let translateServiceStub: Partial<TranslateService>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let commonServiceMock: jasmine.SpyObj<CommonService>;
  let notificationServiceMock: jasmine.SpyObj<NzNotificationService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;

  beforeEach(async () => {
    translateServiceStub = {
      get: (key: string) => of(key),
      instant: jasmine.createSpy('instant').and.returnValue('translated text')
    };

    commonFunctionsMock = jasmine.createSpyObj('CommonFunctions', ['getAuthToken', 'getSTList', 'getAgentDetails']);

    await TestBed.configureTestingModule({
      declarations: [FreightCertificateComponent, MockOrderByPipe],
      imports: [
        HttpClientModule,
        RouterTestingModule,
        NzNotificationModule,
        SharedModule,
        TranslateModule.forRoot(),
        BrowserDynamicTestingModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: ApiService, useClass: MockApiService },
        { provide: CommonFunctions, useClass: MockCommonFunctions },
        { provide: CognitoService, useClass: MockCognitoService },
        { provide: MessagingService, useValue: jasmine.createSpyObj('MessagingService', ['getSTList']) },
        { provide: TransactionService, useValue: translateServiceStub },
        { provide: CommonService, useValue: jasmine.createSpyObj('CommonService', ['method']) },
        { provide: NzNotificationService, useValue: jasmine.createSpyObj('NzNotificationService', ['success', 'error']) },
        { provide: NgbModal, useValue: jasmine.createSpyObj('NgbModal', ['open']) },
        { provide: MastersSortPipe, useClass: MastersSortPipe },
        { provide: ActivatedRoute, useValue: { paramMap: of({ get: () => '123' }) } },
        NgbActiveModal,
        ApiSharedService
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FreightCertificateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
