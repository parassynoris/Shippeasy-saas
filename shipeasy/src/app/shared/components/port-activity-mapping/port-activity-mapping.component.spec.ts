import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { PortActivityMappingComponent } from './port-activity-mapping.component';
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
import { of } from 'rxjs';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CommonService } from 'src/app/services/common/common.service';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule,} from '@angular/forms';
import { Location } from '@angular/common';
import { MastersSortPipe } from 'src/app/shared/util/mastersort';

// Mock implementation of OrderByPipe
@Pipe({ name: 'orderBy' })
class MockOrderByPipe implements PipeTransform {
  transform(value: any[], key: string): any[] {
    return value; // Mock implementation: return the input array without sorting
  }
}
describe('PortActivityMappingComponent', () => {
  let component: PortActivityMappingComponent;
  let fixture: ComponentFixture<PortActivityMappingComponent>;
  let commonFunctionsMock: jasmine.SpyObj<CommonFunctions>;
  let translateServiceStub: Partial<TranslateService>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let notificationServiceMock: jasmine.SpyObj<NzNotificationService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let locationSpy: jasmine.SpyObj<Location>;
  beforeEach(async () => {
    const apiServiceSpyObj = jasmine.createSpyObj('ApiService', ['getMasterList', 'SaveOrUpdate']);
    const commonServiceSpyObj = jasmine.createSpyObj('CommonService', ['getSTList', 'filterList', 'addToST']);
    await TestBed.configureTestingModule({
      declarations: [ PortActivityMappingComponent ],
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
        { provide: MessagingService, useValue: {} },
        { provide: CommonFunctions, useValue: commonFunctionsMock },
        { provide: TransactionService, useValue: translateServiceStub },
        { provide: CommonService, useValue: commonServiceSpyObj },
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
        { provide: CommonService, useValue: { filterList: () => ({ query: {} }) } },
        { provide: CommonService, useClass: commonService },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of({ get: () => '123' }) }, 
        },
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PortActivityMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should clear search parameters and fetch data', () => {
    // Set initial values for search parameters
    component.port_name = 'Test Port';
    component.activity_name = 'Test Activity';
    component.map_name = 'Test Mapping';
    component.principal_code = 'Test Principal Code';
    component.cargo_type = 'Test Cargo Type';
    component.country = 'Test Country';
  
    // Spy on getData method
    spyOn(component, 'getData').and.stub();
  
    // Call clear method
    component.clear();
  
    // Expectations
    expect(component.port_name).toBe('');
    expect(component.activity_name).toBe('');
    expect(component.map_name).toBe('');
    expect(component.principal_code).toBe('');
    expect(component.cargo_type).toBe('');
    expect(component.country).toBe('');
    expect(component.getData).toHaveBeenCalled();
  });
  describe('PortActivityMappingComponent', () => {
    // Other test setup code...
  
    it('should fetch next page data if total length is greater than current count', () => {
      // Set totalLength greater than count
      component.toalLength = 20;
      component.count = 10;
  
      // Spy on getPaginationData method
      spyOn(component, 'getPaginationData').and.stub();
  
      // Call next method
      component.next();
  
      // Expect getPaginationData to be called with 'next'
      expect(component.getPaginationData).toHaveBeenCalledWith('next');
    });
  
    it('should fetch previous page data if current page is greater than 0', () => {
      // Set page greater than 0
      component.page = 2;
  
      // Spy on getPaginationData method
      spyOn(component, 'getPaginationData').and.stub();
  
      // Call prev method
      component.prev();
  
      // Expect getPaginationData to be called with 'prev'
      expect(component.getPaginationData).toHaveBeenCalledWith('prev');
    });
  
    it('should update size, reset fromSize, and fetch data on filter change', () => {
      // Mock event
      const mockEvent = { target: { value: '20' } };
  
      // Spy on getData method
      spyOn(component, 'getData').and.stub();
  
      // Call filter method
      component.filter(mockEvent);
  
      // Expect size to be updated
      expect(component.size).toBe('20' as any);
      // Expect fromSize to be reset
      expect(component.fromSize).toBe(1);
      // Expect getData to be called
      expect(component.getData).toHaveBeenCalled();
    });
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
    }
  }
  class commonService{
   getSTList(){}
   filterList(){}
  }


  it('should update data on filter change', () => {
    spyOn(component, 'getData');
    const event = { target: { value: 20 } };
    component.filter(event);
    expect(component.size).toBe(20);
    expect(component.fromSize).toBe(1);
    expect(component.getData).toHaveBeenCalled();
  });

  it('should clear filters and call getData', () => {
    spyOn(component, 'getData');
    component.clear();
    expect(component.port_name).toBe('');
    expect(component.activity_name).toBe('');
    expect(component.map_name).toBe('');
    expect(component.principal_code).toBe('');
    expect(component.cargo_type).toBe('');
    expect(component.country).toBe('');
    expect(component.getData).toHaveBeenCalled();
  });

  it('should paginate to next page', fakeAsync(() => {
    spyOn(component, 'getPaginationData');
    component.toalLength = 200;
    component.count = 10;
    component.next();
    tick();
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  }));



});

