import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
 
import { NotificationComponent } from './notification.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { NzNotificationModule, NzNotificationService } from 'ng-zorro-antd/notification';
import { CognitoService } from 'src/app/services/cognito.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { OverlayModule } from '@angular/cdk/overlay';
import { Router } from '@angular/router';
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
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
 
// Mock implementation of OrderByPipe
@Pipe({ name: 'orderBy' })
class MockOrderByPipe implements PipeTransform {
  transform(value: any[], key: string): any[] {
    return value; // Mock implementation: return the input array without sorting
  }
}
describe('NotificationComponent', () => {
  let component: NotificationComponent;
  let fixture: ComponentFixture<NotificationComponent>;
  let commonFunctionsMock: jasmine.SpyObj<CommonFunctions>;
  let translateServiceStub: Partial<TranslateService>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let commonServiceMock: jasmine.SpyObj<CommonService>;
  let notificationServiceMock: jasmine.SpyObj<NzNotificationService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;
 
  beforeEach(async(() => {
    translateServiceStub = {
      get: (key: string) => of(key),
      instant: jasmine.createSpy('instant').and.returnValue('translated text')
    };
    commonFunctionsMock = jasmine.createSpyObj('CommonFunctions', ['getAuthToken']);
    TestBed.configureTestingModule({
      declarations: [ NotificationComponent ],
      imports: [HttpClientModule,RouterTestingModule,NzNotificationModule,NzDatePickerModule,SharedModule,TranslateModule.forRoot(),BrowserAnimationsModule ] ,
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
      ]
    })
    .compileComponents();
  }));
 
  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
 
  it('should create', () => {
    expect(component).toBeTruthy();
  });
 
  describe('next()', () => {
    it('should call getPaginationData with "next" when toalLength is greater than count', () => {
      spyOn(component, 'getPaginationData');
      component.totalLength = 10;
      component.count = 5;
      component.next();
      expect(component.getPaginationData).toHaveBeenCalledWith('next');
    });
 
    it('should not call getPaginationData when toalLength is equal to count', () => {
      spyOn(component, 'getPaginationData');
      component.totalLength = 10;
      component.count = 10;
      component.next();
      expect(component.getPaginationData).not.toHaveBeenCalled();
    });
 
    // Add more cases as needed...
  });
 
  describe('prev()', () => {
    it('should call getPaginationData with "prev" when page is greater than 0', () => {
      spyOn(component, 'getPaginationData');
      component.page = 2;
      component.prev();
      expect(component.getPaginationData).toHaveBeenCalledWith('prev');
    });
 
    it('should not call getPaginationData when page is 0', () => {
      spyOn(component, 'getPaginationData');
      component.page = 0;
      component.prev();
      expect(component.getPaginationData).not.toHaveBeenCalled();
    });
 
    // Add more cases as needed...
  });
 
  describe('filter()', () => {
    it('should update size, fromSize, and call getNotiList', () => {
      spyOn(component, 'getNotiList');
      const event = { target: { value: 20 } };
      component.filter(event);
      expect(component.size).toEqual(20);
      expect(component.fromSize).toEqual(1);
      expect(component.getNotiList).toHaveBeenCalled();
    });
 
    // Add more cases as needed...
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
 