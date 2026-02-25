import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetPasswordComponent } from './reset-password.component';
import { RouterTestingModule } from '@angular/router/testing';
import { NzNotificationModule, NzNotificationService } from 'ng-zorro-antd/notification';
import { CognitoService } from 'src/app/services/cognito.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { OverlayModule } from '@angular/cdk/overlay';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagingService } from 'src/app/services/messaging.service';
import { ApiService } from 'src/app/admin/principal/api.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { CommonService } from 'src/app/shared/services/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { Pipe, PipeTransform } from '@angular/core';
import { ApiSharedService } from 'src/app/shared/components/api-service/api-shared.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

// Mock implementation of OrderByPipe
@Pipe({ name: 'orderBy' })
class MockOrderByPipe implements PipeTransform {
  transform(value: any[], key: string): any[] {
    return value; // Mock implementation: return the input array without sorting
  }
}
describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let commonFunctionsMock: jasmine.SpyObj<CommonFunctions>;
  let translateServiceStub: Partial<TranslateService>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let commonServiceMock: jasmine.SpyObj<CommonService>;
  let notificationServiceMock: jasmine.SpyObj<NzNotificationService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;
 

  const router = {
    getCurrentNavigation: () => ({ extras: { state: { username: 'testUsername' } } })
  };
  beforeEach(async () => {
    translateServiceStub = {
      get: (key: string) => of(key),
      instant: jasmine.createSpy('instant').and.returnValue('translated text')
    };
    commonFunctionsMock = jasmine.createSpyObj('CommonFunctions', ['getAuthToken']);
    notificationServiceMock = jasmine.createSpyObj('NzNotificationService', ['create']);

    await TestBed.configureTestingModule({
      declarations: [ ResetPasswordComponent ],
      imports: [RouterTestingModule.withRoutes([]),NzNotificationModule,SharedModule,TranslateModule.forRoot(),HttpClientTestingModule,BrowserAnimationsModule,BrowserModule,ReactiveFormsModule  ] ,
      providers: [
        NzNotificationService,
        CognitoService, 
        OverlayModule ,
        { provide: CommonFunctions, useValue: jasmine.createSpyObj('CommonFunctions', ['yourMethod']) }, // Provide a mock for CommonFunctions
        { provide: Router, useValue: {} },
        ApiSharedService,
        { provide: MessagingService, useValue: jasmine.createSpyObj('MessagingService', ['methodName']) } ,
        { provide: MessagingService, useValue: {} },
        { provide: CommonFunctions, useValue: commonFunctionsMock },
        { provide: TransactionService, useValue: translateServiceStub },
        { provide: CommonService, useValue: commonServiceMock },
        { provide: ApiService, useValue: apiServiceMock },
        { provide: NzNotificationService, useValue: notificationServiceMock },
        { provide: NgbModal, useValue: modalServiceMock }, 
        { provide: OrderByPipe, useClass: MockOrderByPipe },
        { provide: CognitoService, useClass: MockCognitoService }, // Mock CognitoService
        { provide: CommonFunctions, useClass: MockCommonFunctions },
        { provide: NzNotificationService, useValue: notificationServiceMock },
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => 'testUsername' // Mocking the paramMap
              }
            }
          }
        }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should initialize the reset password form', () => {
    expect(component.resetPasswordForm).toBeDefined();
    expect(component.resetPasswordForm.controls['password']).toBeDefined();
    expect(component.resetPasswordForm.controls['confirmPassword']).toBeDefined();
    expect(component.resetPasswordForm.controls['otp']).toBeDefined();
  });
  it('should validate reset password form when valid data is entered', () => {
    component.resetPasswordForm.controls['password'].setValue('ValidPassword123');
    component.resetPasswordForm.controls['confirmPassword'].setValue('ValidPassword123');
    component.resetPasswordForm.controls['otp'].setValue('123456');
    expect(component.resetPasswordForm.valid).toBe(false);
  });
  it('should invalidate reset password form when invalid data is entered', () => {
    component.resetPasswordForm.controls['password'].setValue('');
    component.resetPasswordForm.controls['confirmPassword'].setValue('');
    component.resetPasswordForm.controls['otp'].setValue('');
    expect(component.resetPasswordForm.valid).toBeFalsy();
  });
  it('should validate that password and confirm password match', () => {
    component.resetPasswordForm.controls['password'].setValue('Password123');
    component.resetPasswordForm.controls['confirmPassword'].setValue('Password123');
    expect(component.resetPasswordForm.errors).toBeNull();
  });
  it('should validate OTP field when a 6-digit number is entered', () => {
    component.resetPasswordForm.controls['otp'].setValue('123456');
    expect(component.resetPasswordForm.controls['otp'].valid).toBeTruthy();
  });
  it('should validate password and confirm password lengths', () => {
    const validPassword = 'ValidPassword123';
    component.resetPasswordForm.controls['password'].setValue(validPassword);
    component.resetPasswordForm.controls['confirmPassword'].setValue(validPassword);
    expect(component.resetPasswordForm.controls['password'].value.length).toBeGreaterThanOrEqual(8);
    expect(component.resetPasswordForm.controls['password'].value.length).toBeLessThanOrEqual(16);
    expect(component.resetPasswordForm.controls['confirmPassword'].value.length).toBeGreaterThanOrEqual(8);
    expect(component.resetPasswordForm.controls['confirmPassword'].value.length).toBeLessThanOrEqual(16);
  });
  it('should validate password and confirm password for special characters', () => {
    const validPassword = 'Password@123';
    component.resetPasswordForm.controls['password'].setValue(validPassword);
    component.resetPasswordForm.controls['confirmPassword'].setValue(validPassword);
    expect(component.resetPasswordForm.controls['password'].valid).toBeTruthy();
    expect(component.resetPasswordForm.controls['confirmPassword'].valid).toBeTruthy();
  });
  it('should require OTP for password reset', () => {
    component.resetPasswordForm.controls['otp'].setValue('');
    expect(component.resetPasswordForm.controls['otp'].invalid).toBeTruthy();
  });
  it('should toggle password field visibility', () => {
    const initialVisibility = component.showPasswordText;
    component.showPassword();
    expect(component.showPasswordText).toBe(!initialVisibility);
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
