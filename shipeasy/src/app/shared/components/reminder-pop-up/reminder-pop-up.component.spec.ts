import { async, ComponentFixture, TestBed } from '@angular/core/testing';
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
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { Directive, InjectionToken, Input, Pipe, PipeTransform } from '@angular/core';
import { ApiSharedService } from 'src/app/shared/components/api-service/api-shared.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { ThemeService } from 'src/theme/theme.service';
import { ReminderPopUpComponent } from './reminder-pop-up.component';
import { CommonService } from 'src/app/services/common/common.service';

@Directive({
  selector: '[routerLink], [routerLinkActive]'
})
class MockRouterLinkDirective {
  @Input('routerLink') routerLink: any;
  @Input('routerLinkActiveOptions') routerLinkActiveOptions: any;
  @Input('routerLinkActive') routerLinkActive: any;
}
// Mock implementation of OrderByPipe
@Pipe({ name: 'orderBy' })
class MockOrderByPipe implements PipeTransform {
  transform(value: any[], key: string): any[] {
    return value; // Mock implementation: return the input array without sorting
  }
}
export const THEMES = new InjectionToken<any>('THEMES');
 
class MockThemeService {
  // Mock implementation of methods used in ThemeService
}
export const ANGULARFIRE_OPTIONS = new InjectionToken<any>('angularfire2.app.options');
 
class MockAngularFireMessaging {
  // Provide mock implementation of methods used in AngularFireMessaging
}
const angularFireMessagingMock = {
  messages: of(null), // Mock messages observable
  requestPermission: () => Promise.resolve(null), // Mock requestPermission method
};
describe('ReminderPopUpComponent', () => {
  let component: ReminderPopUpComponent;
  let fixture: ComponentFixture<ReminderPopUpComponent>;
  let commonFunctionsMock: jasmine.SpyObj<CommonFunctions>;
  let translateServiceStub: Partial<TranslateService>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let commonServiceMock: jasmine.SpyObj<CommonService>;
  let notificationServiceMock: jasmine.SpyObj<NzNotificationService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;
  let router:Router;
  let cognitoServiceMock: Partial<CognitoService>;
  let mockCognitoService: jasmine.SpyObj<CognitoService>;
 
  class ActivatedRouteStub {
    snapshot = {
      paramMap: new Map<string, string>().set('id', '123'),
    };
  }
  beforeEach(async(() => {
    commonServiceMock = jasmine.createSpyObj('CommonService', [
      'getReminders', 'filterList', 'getSTList', 'batchUpdate', 'UpdateToST', 'clearReminders'
    ]);
    commonFunctionsMock = jasmine.createSpyObj('CommonFunctions', ['getAgentDetails']);
    cognitoServiceMock = {
      getUserModule: jasmine.createSpy('getUserModule').and.returnValue('mockedModule')
      // Add other mocked methods if needed
    };
   
    translateServiceStub = {
      get: (key: string) => of(key),
      instant: jasmine.createSpy('instant').and.returnValue('translated text')
    };
    commonFunctionsMock = jasmine.createSpyObj('CommonFunctions', ['getUserType1','getAuthToken']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails','getUserModule','getModules']);
   
    TestBed.configureTestingModule({
      declarations: [ ReminderPopUpComponent ],
      imports: [RouterTestingModule,NzNotificationModule,SharedModule,TranslateModule.forRoot(),HttpClientTestingModule,BrowserAnimationsModule,BrowserModule ] ,
      providers: [
        NzNotificationService,
        CognitoService,
        OverlayModule ,
        ThemeService,
        { provide: CommonFunctions, useValue: jasmine.createSpyObj('CommonFunctions', ['yourMethod']) }, // Provide a mock for CommonFunctions
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
        { provide: CommonFunctions, useClass: MockCommonFunctions },
        { provide: ActivatedRoute, useClass: ActivatedRouteStub },
        { provide: ThemeService, useClass: MockThemeService },
      { provide: THEMES, useValue: {} },
      // { provide: AngularFireMessaging, useClass: MockAngularFireMessaging },
      { provide: ANGULARFIRE_OPTIONS, useValue: {} },
      { provide: CognitoService, useValue: cognitoServiceMock },
      { provide: CognitoService, useValue: mockCognitoService },
      { provide: CommonService, useValue: commonServiceMock },
      { provide: CommonFunctions, useValue: commonFunctionsMock },
      ]
    })
    .compileComponents();
  }));
 
  beforeEach(() => {
    fixture = TestBed.createComponent(ReminderPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    router = TestBed.inject(Router);
  });
  class MockCognitoService {
    getUserDatails() {
      // Mock implementation
    }
    getModule() {
      return 'someModule'; // Mock implementation, return a module name or value as needed
    }
    getUserModule() {
      // Mock implementation
      return 'someModule'; // For example, return a module name or value as needed
    }
  }
 
  // Mock implementation of CommonFunctions
  class MockCommonFunctions {
    get() {
      // Mock implementation
    }
    getUserType (){}
    isAdmin (){}
    getUserType1(){}
    getAuthToken() {
      // Provide a mock implementation or return a default value
    }
    getAgentDetails() {
      // Ensure this returns an object with userId
      return {
        userId: 'someUserId', // Replace with actual logic to get userId
        // other properties
      };
    }
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });
;

  describe('clearReminders', () => {
    it('should mark reminders as visited and clear the reminders list', () => {
      component.reminders = [{ reminderId: 1 }, { reminderId: 2 }];
      const mockPayload = [
        { reminderId: 1, isVisited: true },
        { reminderId: 2, isVisited: true }
      ];
      commonServiceMock.batchUpdate.and.returnValue(of({}));

      component.clearReminders();

      expect(commonServiceMock.batchUpdate).toHaveBeenCalledWith('reminder/batchupdate', mockPayload);
      expect(commonServiceMock.clearReminders).toHaveBeenCalled();
      expect(component.reminders.length).toBe(0);
    });
  });

  describe('save', () => {
    it('should mark reminder as completed and remove it from the list when key is true', () => {
      const mockReminder = { reminderId: 1, reminderStatus: 'Pending' };
      component.reminders = [mockReminder];
      commonServiceMock.UpdateToST.and.returnValue(of(true));

      component.save(mockReminder, true);

      expect(commonServiceMock.UpdateToST).toHaveBeenCalledWith('reminder/1', {
        reminderId: 1,
        reminderStatus: 'Completed',
        isVisited: true
      });
      expect(component.reminders.length).toBe(0);
    });

    it('should update reminder status without marking as visited when key is false', () => {
      const mockReminder = { reminderId: 1, reminderStatus: 'Pending' };
      component.reminders = [mockReminder];
      commonServiceMock.UpdateToST.and.returnValue(of(true));

      component.save(mockReminder, false);

      expect(commonServiceMock.UpdateToST).toHaveBeenCalledWith('reminder/1', {
        reminderId: 1,
        reminderStatus: 'Pending'
      });
      expect(component.reminders.length).toBe(0);
    });

    it('should handle errors when saving reminder fails', () => {
      const mockReminder = { reminderId: 1 };
      commonServiceMock.UpdateToST.and.returnValue(of(false));
      component.reminders = [mockReminder];

      component.save(mockReminder, true);

      expect(component.reminders.length).toBe(1);  // Reminder stays in the list if save fails
    });
  });
    
  
  
});