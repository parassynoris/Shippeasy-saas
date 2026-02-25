import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, NG_VALUE_ACCESSOR, } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ApiService } from 'src/app/admin/principal/api.service';
import { CommonService } from 'src/app/services/common/common.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { RouterModule } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, Subject } from 'rxjs';
import { LoaderService } from 'src/app/services/loader.service';
import { MessagingService } from 'src/app/services/messaging.service';
import { environment } from 'src/environments/environment';
import { LoginComponent } from './login.component';
import { MissingTranslationHandler, TranslateCompiler, TranslateLoader, TranslateParser, TranslateService, TranslateStore, USE_DEFAULT_LANG } from '@ngx-translate/core';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { forwardRef, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => LoginComponent),
  multi: true
};

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockNgbModal: jasmine.SpyObj<NgbModal>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockNotificationService: jasmine.SpyObj<NzNotificationService>;
  let mockMastersService: jasmine.SpyObj<MastersService>;
  let mockProfilesService: jasmine.SpyObj<ProfilesService>;
  let mockCognitoService: jasmine.SpyObj<CognitoService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockmessagingService: jasmine.SpyObj<MessagingService>;
  let translateServiceStub: Partial<TranslateService>;
  let translateStore: TranslateStore;

  beforeEach(waitForAsync(() => {
    translateServiceStub = {
      get: (key: string) => of(key),
      instant: jasmine.createSpy('instant').and.returnValue('translated text')
    };

    mockNgbModal = jasmine.createSpyObj('NgbModal', ['open']);
    mockApiService = jasmine.createSpyObj('ApiService', ['getSTList', 'addToST', 'UpdateToST', 'deleteST']);
    mockNotificationService = jasmine.createSpyObj('NzNotificationService', ['create']);
    mockMastersService = jasmine.createSpyObj('MastersService', ['getSTList']);
    mockProfilesService = jasmine.createSpyObj('ProfilesService', ['getUserDetails', 'getSmartAgentById']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList', 'getSTList1', 'getDashboardReport']);

    TestBed.configureTestingModule({
      declarations: [LoginComponent, MockTranslatePipe],
      imports: [
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        MatAutocompleteModule,
        NzSelectModule,
        NzDatePickerModule,
        RouterTestingModule,
        HttpClientModule,
        RouterModule,
        BrowserAnimationsModule
      ],
      providers: [
        DatePipe,
        OrderByPipe,
        { provide: TranslateService, useValue: translateServiceStub },
        { provide: TranslateStore, useValue: {} },
        { provide: TranslateLoader, useValue: {} },
        { provide: TranslateParser, useValue: {} },
        { provide: TranslateCompiler, useValue: {} },
        { provide: USE_DEFAULT_LANG, useValue: 'en' },
        { provide: ApiService, useValue: mockApiService },
        { provide: MessagingService, useValue: mockmessagingService },
        { provide: NzNotificationService, useValue: mockNotificationService },
        { provide: MastersService, useValue: mockMastersService },
        { provide: ProfilesService, useValue: mockProfilesService },
        { provide: SaMasterService, useValue: {} },
        { provide: TransactionService, useValue: translateServiceStub },
        { provide: CognitoService, useValue: mockCognitoService },
        { provide: CommonService, useValue: mockCommonService }
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the login form', () => {
    expect(component.loginForm).toBeDefined();
    expect(component.loginForm.controls['username']).toBeDefined();
    expect(component.loginForm.controls['password']).toBeDefined();
    expect(component.loginForm.controls['rememberMe']).toBeDefined();
  });
  it('should toggle field text type', () => {
    const initialValue = component.hide;
    component.toggleFieldTextType();
    expect(component.hide).toBe(!initialValue);
  });
  it('should invalidate login form when invalid data is entered', () => {
    component.loginForm.controls['username'].setValue('');
    component.loginForm.controls['password'].setValue('');
    expect(component.loginForm.valid).toBeFalsy();
  });
  it('should successfully login when valid credentials are provided', () => {
    const mockData = {
      username: 'valid_username',
      password: 'valid_password',
      rememberMe: true
    };
    spyOn(component, 'onLogin').and.callThrough(); // Spy on the onLogin function
    component.onLogin(mockData); // Call the login function with mock data
    // Add expectations here based on the behavior of the function
    // For example, expect certain methods to be called or certain variables to be set
  });
 
  it('should retrieve user roles', () => {
    spyOn(component, 'getRolesFromUser').and.callThrough(); // Spy on the getRolesFromUser method
    component.ngOnInit(); // Call ngOnInit to trigger the role retrieval
    // Add expectations here to check if roles are retrieved and stored properly
  });
            
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
});
