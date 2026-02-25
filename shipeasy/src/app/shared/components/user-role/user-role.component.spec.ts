import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRoleComponent } from './user-role.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { NzNotificationModule, NzNotificationService } from 'ng-zorro-antd/notification';
import { CognitoService } from 'src/app/services/cognito.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { OverlayModule } from '@angular/cdk/overlay';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MessagingService } from 'src/app/services/messaging.service';
import { ApiService } from 'src/app/admin/principal/api.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { CommonService } from 'src/app/shared/services/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { Pipe, PipeTransform } from '@angular/core';
import { ApiSharedService } from '../api-service/api-shared.service';
import { MastersSortPipe } from '../../util/mastersort';

// Mock implementation of OrderByPipe
@Pipe({ name: 'orderBy' })
class MockOrderByPipe implements PipeTransform {
  transform(value: any[], key: string): any[] {
    return value; // Mock implementation: return the input array without sorting
  }
}

class ActivatedRouteStub {
  snapshot = {
    paramMap: new Map<string, string>().set('id', '123'),
  };
}
class commonFunctionsMocks {
  getAgentDetails (){}
  getAuthToken (){}
}
describe('UserRoleComponent', () => {
  let component: UserRoleComponent;
  let fixture: ComponentFixture<UserRoleComponent>;
  let commonFunctionsMock: jasmine.SpyObj<CommonFunctions>;
  let translateServiceStub: Partial<TranslateService>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let commonServiceMock: jasmine.SpyObj<CommonService>;
  let notificationServiceMock: jasmine.SpyObj<NzNotificationService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;
  let cognitoServiceMock: jasmine.SpyObj<CognitoService>;
  beforeEach(async(() => {
    translateServiceStub = {
      get: (key: string) => of(key),
      instant: jasmine.createSpy('instant').and.returnValue('translated text')
    };
    commonFunctionsMock = jasmine.createSpyObj('CommonFunctions', ['getAuthToken','getAgentDetails']);
    apiServiceMock = jasmine.createSpyObj('ApiService', ['yourMethod']); // Provide mocked behavior for ApiService
    commonServiceMock = jasmine.createSpyObj('CommonService', ['yourMethod']); // Provide mocked behavior for CommonService
    notificationServiceMock = jasmine.createSpyObj('NzNotificationService', ['methodName']); // Provide mocked behavior for NzNotificationService
    modalServiceMock = jasmine.createSpyObj('NgbModal', ['methodName']); // Provide mocked behavior for NgbModal
    cognitoServiceMock = jasmine.createSpyObj('CognitoService', ['getUserDatails']);
    cognitoServiceMock.getUserDatails.and.returnValue(of() as any);

    TestBed.configureTestingModule({
      declarations: [UserRoleComponent],
      imports: [HttpClientModule, RouterTestingModule, NzNotificationModule, SharedModule, TranslateModule.forRoot(),],
      providers: [MastersSortPipe,
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of({ get: () => '123' }) }, // Adjust based on your route parameters
        },
        NzNotificationService,
        CognitoService,
        OverlayModule,
        { provide: CommonFunctions, useValue: jasmine.createSpyObj('CommonFunctions', ['yourMethod']) }, // Provide a mock for CommonFunctions
        { provide: Router, useValue: {} },
        ApiSharedService,
        { provide: MessagingService, useValue: jasmine.createSpyObj('MessagingService', ['methodName']) },
        { provide: MessagingService, useValue: {} },
        { provide: CommonFunctions, useValue: commonFunctionsMock },
        { provide: TransactionService, useValue: translateServiceStub },
        { provide: CommonService, useValue: commonServiceMock },
        { provide: ApiService, useValue: apiServiceMock },
        { provide: NzNotificationService, useValue: notificationServiceMock },
        { provide: NgbModal, useValue: modalServiceMock },
        { provide: OrderByPipe, useClass: MockOrderByPipe },
        { provide: ActivatedRoute, useClass: ActivatedRouteStub },
        { provide: CognitoService, useValue: cognitoServiceMock },
        { provide: CommonFunctions, useClass: commonFunctionsMocks },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should initialize component data on ngOnInit', () => {
    // Arrange: Set up any necessary mocks or spies
    spyOn(component, 'getRoleList');
    spyOn(component, 'getFeatureList');

    // Act: Trigger ngOnInit
    component.ngOnInit();

    // Assert: Check that the methods were called
    expect(component.getRoleList).toHaveBeenCalled();
    expect(component.getFeatureList).toHaveBeenCalled();
  });

  it('should clear role data and fetch role list when clear() is called', () => {
    // Arrange
    spyOn(component, 'getRoleList');

    // Act
    component.clear();

    // Assert
    expect(component.roleName).toEqual('');
    expect(component.roleStatus).toEqual('');
    expect(component.roleDescription).toEqual('');
    expect(component.roleLevel).toEqual('');
    expect(component.getRoleList).toHaveBeenCalled();
  });
  it('should update size and fetch role list when filter(e) is called', () => {
    // Arrange
    const mockEvent = { target: { value: '10' } };
    spyOn(component, 'getRoleList');

    // Act
    component.filter(mockEvent);

    // Assert
    expect(component.size).toEqual('10' as any);
    expect(component.fromSize).toEqual(1);
    expect(component.getRoleList).toHaveBeenCalled();
  });
  it('should fetch next page of role list when next() is called and total length is greater than count', () => {
    // Arrange
    component.toalLength = 20;
    component.count = 10;
    spyOn(component, 'getPaginationData');

    // Act
    component.next();

    // Assert
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });
  it('should fetch previous page of role list when prev() is called and page is greater than 1', () => {
    // Arrange
    component.page = 2;
    spyOn(component, 'getPaginationData');

    // Act
    component.prev();

    // Assert
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });



  it('should set isShow to the provided id when onShowPermission() is called', () => {
    // Arrange
    const id = '123';

    // Act
    component.onShowPermission(id);

    // Assert
    expect(component.isShow).toEqual(id);
  });

  // it('should handle empty response when getRoleList() is called', () => {
  //   // Arrange
  //   const mockResponse = { documents: [], totalCount: 0 }; // Empty response
  //   spyOn(component.commonService, 'filterList').and.returnValue(payload as any);
  //   spyOn(component.commonService, 'getSTList').and.returnValue(of(mockResponse));

  //   // Act
  //   component.getRoleList();

  //   // Assert
  //   expect(component.commonService.filterList).toHaveBeenCalled();
  //   expect(component.commonService.getSTList).toHaveBeenCalledWith('role', payload);
  //   expect(component.userRoleData).toEqual([]);
  //   expect(component.toalLength).toEqual(0);
  //   expect(component.count).toEqual(0);
  // });

  it('should set isShow property correctly when onShowPermission() is called', () => {
    // Arrange
    const id = 'testId';

    // Act
    component.onShowPermission(id);

    // Assert
    expect(component.isShow).toEqual(id);
  });

  it('should set isShow property to null when onShowPermission() is called with null', () => {
    // Arrange
    const id = null;

    // Act
    component.onShowPermission(id);

    // Assert
    expect(component.isShow).toBeNull();
  });

  it('should set isShow property to undefined when onShowPermission() is called with undefined', () => {
    // Arrange
    const id = undefined;

    // Act
    component.onShowPermission(id);

    // Assert
    expect(component.isShow).toBeUndefined();
  });


});
