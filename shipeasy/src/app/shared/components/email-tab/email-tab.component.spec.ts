import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { NzNotificationModule, NzNotificationService } from 'ng-zorro-antd/notification';
import { CognitoService } from 'src/app/services/cognito.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { OverlayModule } from '@angular/cdk/overlay';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MessagingService } from 'src/app/services/messaging.service';
import { ApiService } from 'src/app/admin/principal/api.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { CommonService } from 'src/app/shared/services/common.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { Pipe, PipeTransform } from '@angular/core';
import { ApiSharedService } from 'src/app/shared/components/api-service/api-shared.service';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MastersSortPipe } from 'src/app/shared/util/mastersort';
import { EmailTabComponent } from './email-tab.component';
import { MatChipInputEvent } from '@angular/material/chips';



// Mock implementation of OrderByPipe
@Pipe({ name: 'orderBy' })
class MockOrderByPipe implements PipeTransform {
  transform(value: any[], key: string): any[] {
    return value; // Mock implementation: return the input array without sorting
  }
}

class MockCognitoService {
  getUserDatails() {
    // Mock implementation
  }
}

// Mock implementation of CommonFunctions
class MockCommonFunctions {
  get() {
    // Mock implementation
  }
  getAuthToken() {
    // Provide a mock implementation or return a default value
  }
}
describe('EmailTabComponent', () => {
  let component: EmailTabComponent
  let fixture: ComponentFixture<EmailTabComponent>;
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
    commonFunctionsMock = jasmine.createSpyObj('CommonFunctions', ['getAuthToken']);
    await TestBed.configureTestingModule({
      declarations: [ EmailTabComponent],
      imports: [HttpClientModule,RouterTestingModule,NzNotificationModule,SharedModule,TranslateModule.forRoot(),BrowserDynamicTestingModule,BrowserAnimationsModule] ,
      providers: [
        NzNotificationService,
        CognitoService, 
        OverlayModule ,
        RouterTestingModule,
        { provide: CommonFunctions, useValue: jasmine.createSpyObj('CommonFunctions', ['yourMethod']) }, // Provide a mock for CommonFunctions
        { provide: Router, useValue: {} },
        ApiSharedService,NgbActiveModal,
        { provide: MessagingService, useValue: jasmine.createSpyObj('MessagingService', ['methodName']) } ,
        { provide: MessagingService, useValue: {} },
        { provide: CommonFunctions, useValue: commonFunctionsMock },
        { provide: TransactionService, useValue: translateServiceStub },
        { provide: CommonService, useValue: commonServiceMock },
        { provide: ApiService, useValue: apiServiceMock },
        { provide: NzNotificationService, useValue: notificationServiceMock },
        { provide: NgbModal, useValue: modalServiceMock }, 
        { provide: MastersSortPipe, useValue: MastersSortPipe },
        { provide: OrderByPipe, useClass: MockOrderByPipe },
        { provide: CommonFunctions, useClass: MockCommonFunctions },
        { provide: CognitoService, useClass: MockCognitoService }, 
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of({ get: () => '123' }) }, // Adjust based on your route parameters
        },
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should create WebFormComponent', () => {
    expect(component).toBeTruthy();
  });
  
  it('should initialize form on ngOnInit', () => {
    component.ngOnInit();
    expect(component.SentEmail).toBeTruthy();
    expect(component.SentEmail.controls['message'].value).toBe('');
  });


  it('should add a new TO email on addnewMembersTO()', () => {
    const event = { input: { value: 'test@example.com' }, value: 'test@example.com' } as MatChipInputEvent;
    component.addnewMembersTO(event);
    expect(component.newMembersTO.length).toBe(1);
    expect(component.newMembersTO[0].to).toBe('test@example.com');
  });

  it('should not add an invalid TO email on addnewMembersTO()', () => {
    const event = { input: { value: 'invalid-email' }, value: 'invalid-email' } as MatChipInputEvent;
    component.addnewMembersTO(event);
    expect(component.newMembersTO.length).toBe(0);
  });

  it('should add a new TO email on addnewMembersTO()', () => {
    const event = { input: { value: 'test@example.com' }, value: 'test@example.com' } as MatChipInputEvent;
    component.addnewMembersTO(event);
    expect(component.newMembersTO.length).toBe(1);
    expect(component.newMembersTO[0].to).toBe('test@example.com');
  });

  it('should not add an invalid TO email on addnewMembersTO()', () => {
    const event = { input: { value: 'invalid-email' }, value: 'invalid-email' } as MatChipInputEvent;
    component.addnewMembersTO(event);
    expect(component.newMembersTO.length).toBe(0);
  });

});

    
