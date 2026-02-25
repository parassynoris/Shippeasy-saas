import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrincipleCostComponent } from './principle-cost.component';
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
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { Pipe, PipeTransform } from '@angular/core';
import { ApiSharedService } from 'src/app/shared/components/api-service/api-shared.service';
import { of, throwError } from 'rxjs';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CommonService } from 'src/app/services/common/common.service';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder,FormsModule, ReactiveFormsModule, FormArray, FormControl, FormGroup } from '@angular/forms';
import { Location } from '@angular/common';
import { MastersSortPipe } from 'src/app/shared/util/mastersort';

// Mock implementation of OrderByPipe
@Pipe({ name: 'orderBy' })
class MockOrderByPipe implements PipeTransform {
  transform(value: any[], key: string): any[] {
    return value; // Mock implementation: return the input array without sorting
  }
}
describe('PrincipleCostComponent', () => {
  let component: PrincipleCostComponent;
  let fixture: ComponentFixture<PrincipleCostComponent>;
  let commonFunctionsMock: jasmine.SpyObj<CommonFunctions>;
  let translateServiceStub: Partial<TranslateService>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let commonServiceMock: jasmine.SpyObj<CommonService>;
  let notificationServiceMock: jasmine.SpyObj<NzNotificationService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let commonServiceSpy: jasmine.SpyObj<CommonService>;
  let locationSpy: jasmine.SpyObj<Location>;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let profilesService: any; 
  beforeEach(async () => {
    profilesService = jasmine.createSpyObj('ProfilesService', ['getCurrentAgentDetails', 'getCostItemList']);
    const apiServiceSpyObj = jasmine.createSpyObj('ApiService', ['getMasterList', 'SaveOrUpdate']);
    const commonServiceSpyObj = jasmine.createSpyObj('CommonService', ['getSTList', 'batchUpdate']);
    await TestBed.configureTestingModule({
      declarations: [ PrincipleCostComponent ,MastersSortPipe],
      imports: [HttpClientModule,RouterTestingModule,NzNotificationModule,SharedModule,TranslateModule.forRoot(),BrowserAnimationsModule,HttpClientTestingModule,FormsModule,ReactiveFormsModule,NgbModule , MatTableModule,
        MatSelectModule,
        NoopAnimationsModule] ,
      providers: [
        NzNotificationService,
        CognitoService, 
        OverlayModule ,
        { provide: CommonFunctions, useValue: jasmine.createSpyObj('CommonFunctions', ['yourMethod']) }, // Provide a mock for CommonFunctions
        { provide: Router, useValue: {} },
        ApiSharedService,
        { provide: MessagingService, useValue: jasmine.createSpyObj('MessagingService', ['methodName']) } ,
        { provide: CommonService, useValue: commonServiceSpy },
        { provide: MessagingService, useValue: {} },
        { provide: CommonFunctions, useValue: commonFunctionsMock },
        { provide: TransactionService, useValue: translateServiceStub },
        { provide: CommonService, useValue: commonServiceSpyObj },
        { provide: CommonService, useValue: commonServiceMock },
        { provide: ApiService, useValue: apiServiceMock },
        { provide: NzNotificationService, useValue: notificationServiceMock },
        { provide: NgbModal, useValue: modalServiceMock }, 
        { provide: OrderByPipe, useClass: MockOrderByPipe },
        { provide: CognitoService, useClass: MockCognitoService },
        { provide: Location, useValue: jasmine.createSpyObj('Location', ['back']) },
        { provide: CommonFunctions, useClass: MockCommonFunctions },
        { provide: ApiService, useValue: mockApiService },
        { provide: Location, useValue: locationSpy },
        { provide: MastersSortPipe, useValue: MastersSortPipe },
        { provide: ApiService, useValue: apiServiceSpyObj },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of({ get: () => '123' }) }, 
        },
      ]
    })
    .compileComponents();
    apiServiceSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrincipleCostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should clear all properties and call getCostItemList()', () => {
    // Set initial values for the properties
    component.costHead = 'Some Value';
    component.costItemName = 'Some Value';
    component.costItemMapName = 'Some Value';
    component.costHeadMapName = 'Some Value';
    component.status = 'Some Value';

    // Spy on the getCostItemList() method
    spyOn(component, 'getCostItemList');

    // Call the clear() method
    component.clear();

    // Check if all properties are cleared
    expect(component.costHead).toBe('');
    expect(component.costItemName).toBe('');
    expect(component.costItemMapName).toBe('');
    expect(component.costHeadMapName).toBe('');
    expect(component.status).toBe('');

    // Check if getCostItemList() is called
    expect(component.getCostItemList).toHaveBeenCalled();
  });

  it('should call getPaginationData with "next" type when totalLength is greater than count', () => {
    component.toalLength = 10;
    component.count = 5;
    spyOn(component, 'getPaginationData');
  
    component.next();
  
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });
  it('should not call getPaginationData when totalLength is equal to count', () => {
    component.toalLength = 5;
    component.count = 5;
    spyOn(component, 'getPaginationData');
  
    component.next();
  
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });
  it('should not call getPaginationData when totalLength is less than count', () => {
    component.toalLength = 5;
    component.count = 10;
    spyOn(component, 'getPaginationData');
  
    component.next();
  
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });
  it('should call getPaginationData with "prev" type when page is greater than 1', () => {
    component.page = 2;
    spyOn(component, 'getPaginationData');
  
    component.prev();
  
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });
  it('should not call getPaginationData when page is equal to 1', () => {
    component.page = 1;
    spyOn(component, 'getPaginationData');
  
    component.prev();
  
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });
  it('should not call getPaginationData when page is less than 1', () => {
    component.page = -1;
    spyOn(component, 'getPaginationData');
  
    component.prev();
  
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });
  it('should set size and fromSize and call getCostItemList on filter()', () => {
    const event = { target: { value: '10' } };
    spyOn(component, 'getCostItemList');
  
    component.filter(event);
  
    expect(component.size).toBe('10' as any);
    expect(component.fromSize).toBe(1);
    expect(component.getCostItemList).toHaveBeenCalled();
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