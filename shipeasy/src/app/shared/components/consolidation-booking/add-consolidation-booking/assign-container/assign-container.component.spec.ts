import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignContainerComponent } from './assign-container.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
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
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { Pipe, PipeTransform } from '@angular/core';
import { ApiSharedService } from 'src/app/shared/components/api-service/api-shared.service';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonService } from 'src/app/services/common/common.service';

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
class apiServiceMock {
  getSTList() {
    return of({ documents: [] });
  }
}

class commonServiceMock {
  filterList() {
    return {};
  }

  getSTList() {
    return of({ documents: [] });
  }

  UpdateToST() {
    return of({});
  }
}
describe('AssignContainerComponent', () => {
  let component: AssignContainerComponent;
  let fixture: ComponentFixture<AssignContainerComponent>;
  let commonFunctionsMock: jasmine.SpyObj<CommonFunctions>;
  let translateServiceStub: Partial<TranslateService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;
  let mockApiService: commonServiceMock;
  let mockNotificationService: NzNotificationService;
  beforeEach(async () => {
    translateServiceStub = {
      get: (key: string) => of(key),
      instant: jasmine.createSpy('instant').and.returnValue('translated text')
    };
    commonFunctionsMock = jasmine.createSpyObj('CommonFunctions', ['getAuthToken']);
    await TestBed.configureTestingModule({
      declarations: [ AssignContainerComponent ],
      imports: [HttpClientModule,RouterTestingModule,NzNotificationModule,SharedModule,TranslateModule.forRoot(),BrowserDynamicTestingModule,BrowserAnimationsModule] ,
      providers: [
        NzNotificationService,
        CognitoService, 
        OverlayModule ,
        { provide: CommonFunctions, useValue: jasmine.createSpyObj('CommonFunctions', ['yourMethod']) }, // Provide a mock for CommonFunctions
        { provide: Router, useValue: {} },
        ApiSharedService,NgbActiveModal,
        { provide: MessagingService, useValue: jasmine.createSpyObj('MessagingService', ['methodName']) } ,
        { provide: MessagingService, useValue: {} },
        { provide: CommonFunctions, useValue: commonFunctionsMock },
        { provide: TransactionService, useValue: translateServiceStub },
        { provide: CommonService, useClass: commonServiceMock },
        { provide: ApiService, useClass: apiServiceMock },
        { provide: NzNotificationService, useValue: mockNotificationService },
        { provide: NgbModal, useValue: modalServiceMock }, 
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
    fixture = TestBed.createComponent(AssignContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should initialize form group on component creation', () => {
    expect(component.addContainerForm).toBeDefined();
    expect(component.addContainerForm1).toBeDefined();
  });

  it('should call getContainer and getPartyMaster on ngOnInit', () => {
    spyOn(component, 'getContainer');
    spyOn(component, 'getPartyMaster');
    component.ngOnInit();
    expect(component.getContainer).toHaveBeenCalled();
    expect(component.getPartyMaster).toHaveBeenCalled();
  });
  it('should call getYardDropDown and getLocation on initialization', () => {
    spyOn(component, 'getYardDropDown');
    spyOn(component, 'getLocation');
    component.ngOnInit();
    setTimeout(() => {
      expect(component.getYardDropDown).toHaveBeenCalled();
      expect(component.getLocation).toHaveBeenCalled();
    }, 500);
  });

  it('should set isRequird to true when status is Reserved', () => {
    component.setValidation('Reserved');
    expect(component.isRequird).toBeTrue();
    expect(component.addContainerForm1.controls['customerName'].validator).toBeTruthy();
  });

  it('should set isRequird to false when status is not Reserved', () => {
    component.setValidation('Available');
    expect(component.isRequird).toBeFalse();
    expect(component.addContainerForm1.controls['customerName'].validator).toBeNull();
  });

  it('should toggle selected container array on allSelect', () => {
    const event = { target: { checked: true } };
    component.containerList = [{ id: 1 }, { id: 2 }];
    component.allSelect(event);
    expect(component.selectedContainer.length).toBe(2);
    expect(component.selectedContainerArr.length).toBe(4);

    event.target.checked = false;
    component.allSelect(event);
    expect(component.selectedContainer.length).toBe(0);
    expect(component.selectedContainerArr.length).toBe(0);
  });

  it('should toggle selected container on container change', () => {
    const container = { id: 1 };
    const event = { target: { checked: true } };
    component.onContainerChange(container, event);
    expect(component.selectedContainerArr.length).toBe(1);
    expect(component.selectedContainerArr).toContain(container);

    event.target.checked = false;
    component.onContainerChange(container, event);
    expect(component.selectedContainerArr.length).toBe(0);
    expect(component.selectedContainerArr).not.toContain(container);
  });

  it('should update form controls on openContainer', () => {
    component.listContainer = [{ containermasterId: 1, date: '2024-01-01', yardNameId: 'yard1', remarks: 'test', containerStatus: 'Available', customerId: 'customer1' }];
    const container = { containermasterId: 1 };
    component.openContainer(null, container);
    expect(component.addContainerForm1.value).toEqual({
      date: '2024-01-01',
      yard: 'yard1',
      remarks: 'test',
      status: 'Available',
      containerNo: 1,
      customerName: 'customer1'
    });
  });

  it('should reset showUpdateContainer on containerMasterCancel', () => {
    component.showUpdateContainer = true;
    component.containerMasterCancel();
    expect(component.showUpdateContainer).toBeFalse();
  });
});
