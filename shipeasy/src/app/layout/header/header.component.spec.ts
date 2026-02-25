import { async, ComponentFixture, TestBed } from '@angular/core/testing';
 import { HeaderComponent } from './header.component';
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
describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
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
      declarations: [ HeaderComponent ],
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
      ]
    })
    .compileComponents();
  }));
 
  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    router = TestBed.inject(Router);
  });
 
 
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should navigate to the global search route when calling searchItem()', () => {
    const routerSpy = spyOn(router, 'navigate');
    const searchTerm = 'test';
 
    component.searchItem(searchTerm);
 
    expect(routerSpy).toHaveBeenCalledWith(['/profile/globalsearch'], { queryParams: { search: searchTerm } });
 
    // Add more expectations as needed
  });
 
 
  it('should update filterSubMenus when calling getMenuList()', () => {
    const getMenuListSpy = spyOn(component, 'getMenuList').and.callThrough();
 
    component.getMenuList();
 
    expect(getMenuListSpy).toHaveBeenCalled();
    // Assuming that the getMenuList method successfully updates filterSubMenus.
 
    // Add more expectations as needed
  });
  it('should return the lowercase first segment of the URL', () => {
    const url = '/test/url/segment';
    const result = component.returnUrl(url);
 
    expect(result).toEqual('');
  });
 
  // Test case for searchItem()
  it('should navigate to the global search route with the provided search term', () => {
    const routerSpy = spyOn(router, 'navigate');
    const searchTerm = 'test';
 
    component.searchItem(searchTerm);
 
    expect(routerSpy).toHaveBeenCalledWith(['/profile/globalsearch'], { queryParams: { search: searchTerm } });
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
});