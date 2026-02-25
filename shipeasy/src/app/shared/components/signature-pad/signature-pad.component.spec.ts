import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { NzNotificationModule, NzNotificationService } from 'ng-zorro-antd/notification';
import { OverlayModule } from '@angular/cdk/overlay';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { SignaturePadComponent } from './signature-pad.component';
import { CognitoService } from 'src/app/services/cognito.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { ApiService } from 'src/app/admin/principal/api.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { MessagingService } from 'src/app/services/messaging.service';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { ApiSharedService } from '../api-service/api-shared.service';

import { Pipe, PipeTransform } from '@angular/core';

// Mock implementation of OrderByPipe
@Pipe({ name: 'orderBy' })
class MockOrderByPipe implements PipeTransform {
  transform(value: any[], key: string): any[] {
    return value;
  }
}

// Mock CognitoService
class MockCognitoService {
  getUserDatails() {
    // Mock implementation
  }
}

// Mock CommonFunctions
class MockCommonFunctions {
  getAuthToken() {
    // Provide a mock implementation or return a default value
  }
}

describe('SignaturePadComponent', () => {
  let component: SignaturePadComponent;
  let fixture: ComponentFixture<SignaturePadComponent>;
  let commonFunctionsMock: jasmine.SpyObj<CommonFunctions>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let commonServiceMock: jasmine.SpyObj<CommonService>;
  let notificationServiceMock: jasmine.SpyObj<NzNotificationService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;
  let translateServiceStub: Partial<TranslateService>;

  beforeEach(async () => {
    // Initialize mock services
    commonFunctionsMock = jasmine.createSpyObj('CommonFunctions', ['getAuthToken']);
    apiServiceMock = jasmine.createSpyObj('ApiService', ['methodName']);
    commonServiceMock = jasmine.createSpyObj('CommonService', ['methodName']);
    notificationServiceMock = jasmine.createSpyObj('NzNotificationService', ['success', 'error']);
    modalServiceMock = jasmine.createSpyObj('NgbModal', ['open', 'close']);

    // Stub for TranslateService
    translateServiceStub = {
      get: (key: string) => of(key),
      instant: jasmine.createSpy('instant').and.returnValue('translated text')
    };

    await TestBed.configureTestingModule({
      declarations: [SignaturePadComponent, MockOrderByPipe],
      imports: [
        HttpClientModule,
        RouterTestingModule,
        NzNotificationModule,
        OverlayModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: CommonFunctions, useValue: commonFunctionsMock },
        { provide: ApiService, useValue: apiServiceMock },
        { provide: CommonService, useValue: commonServiceMock },
        { provide: NzNotificationService, useValue: notificationServiceMock },
        { provide: NgbModal, useValue: modalServiceMock },
        { provide: CognitoService, useClass: MockCognitoService },
        { provide: TransactionService, useValue: translateServiceStub },
        { provide: TranslateService, useValue: translateServiceStub },
        ApiSharedService,
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignaturePadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('saveSignature', () => {
    it('should emit the signature data to parent component', () => {
      component.ngAfterViewInit(); // Initialize signaturePad first

      const signatureData = 'data:image/png;base64,someBase64Data';
      spyOn(component.signaturePad, 'toDataURL').and.returnValue(signatureData);
      spyOn(component.dataToParent, 'emit');

      component.saveSignature();
      expect(component.dataToParent.emit).toHaveBeenCalledWith(signatureData);
    });
  });

  describe('clearSignature', () => {
    it('should clear the signature pad', () => {
      component.ngAfterViewInit(); // Initialize signaturePad first

      spyOn(component.signaturePad, 'clear');
      component.clearSignature();

      expect(component.signaturePad.clear).toHaveBeenCalled();
    });
  });

  it('should not load signature if savedSignature is null', () => {
    component.savedSignature = null;
    spyOn(component.signaturePad, 'fromDataURL');
    component.ngOnChanges({
      savedSignature: {
        currentValue: null,
        previousValue: 'data:image/png;base64,oldSignature',
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.signaturePad.fromDataURL).not.toHaveBeenCalled();
  });




  it('should clear signature when clearSignature is called without error', () => {
    component.ngAfterViewInit();
    spyOn(component.signaturePad, 'clear');

    component.clearSignature();

    expect(component.signaturePad.clear).toHaveBeenCalled();
  });

});
