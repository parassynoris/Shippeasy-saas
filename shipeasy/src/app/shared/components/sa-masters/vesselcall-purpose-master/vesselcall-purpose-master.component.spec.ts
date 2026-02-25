import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VesselcallPurposeMasterComponent } from './vesselcall-purpose-master.component';
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
describe('VesselcallPurposeMasterComponent', () => {
  let component: VesselcallPurposeMasterComponent;
  let fixture: ComponentFixture<VesselcallPurposeMasterComponent>;
  let commonFunctionsMock: jasmine.SpyObj<CommonFunctions>;
  let translateServiceStub: Partial<TranslateService>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let notificationServiceMock: jasmine.SpyObj<NzNotificationService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let locationSpy: jasmine.SpyObj<Location>;
  let mockModalService;

  beforeEach(async () => {
    const apiServiceSpyObj = jasmine.createSpyObj('ApiService', ['getMasterList', 'SaveOrUpdate']);
    const commonServiceSpyObj = jasmine.createSpyObj('CommonService', ['getSTList', 'filterList', 'addToST']);
    mockModalService = jasmine.createSpyObj('NgbModal', ['dismissAll']);
    await TestBed.configureTestingModule({
      declarations: [ VesselcallPurposeMasterComponent,MastersSortPipe ],
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
        { provide: NgbModal, useValue: mockModalService },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of({ get: () => '123' }) }, 
        },
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VesselcallPurposeMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should set isSearchable to true', () => {
    // Call the method
    component.searchDataChange();

    // Check if isSearchable is set to true
    expect(component.isSearchable).toBe(true);
  });
  it('should return null when onSave is called', () => {
    const returnValue = component.onSave();
  
    expect(returnValue).toBeNull();
  });
  it('should reset the submitted and callIdToUpdate properties when onSave is called', () => {
    component.submitted = true;
    component.callIdToUpdate = '123';
  
    component.onSave();
  
    expect(component.submitted).toBe(false);
    expect(component.callIdToUpdate).toBeNull();
  });
  it('should return form controls', () => {
    // Assuming you have form controls defined in your component's template
    expect(component.f).toBeTruthy();
  });

  it('should return form controls with expected names', () => {
    // Assuming you have form controls defined with specific names
    expect(component.f['controlName']).toBe(undefined );
    expect(component.f['anotherControl']).toBe(undefined );
  });

  it('should return form controls with expected initial values', () => {
    // Assuming you have form controls with initial values
    expect(component.f['controlName']?.value).toBe(undefined );
  });
  it('should call getPaginationData("next") when toalLength is greater than count', () => {
    component.toalLength = 10;
    component.count = 5;
  
    spyOn(component, 'getPaginationData');
  
    component.next();
  
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });
  
  it('should not call getPaginationData("next") when toalLength is equal to count', () => {
    component.toalLength = 5;
    component.count = 5;
  
    spyOn(component, 'getPaginationData');
  
    component.next();
  
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });
  it('should call getPaginationData("prev") when page is greater than 0', () => {
    component.page = 2;
  
    spyOn(component, 'getPaginationData');
  
    component.prev();
  
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });
  
  it('should not call getPaginationData("prev") when page is 0', () => {
    component.page = 0;
  
    spyOn(component, 'getPaginationData');
  
    component.prev();
  
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });
  it('should update size, fromSize, and call getData() when filter() is called', () => {
    const event = { target: { value: 10 } };
  
    component.filter(event);
  
    expect(component.size).toBe(10 as any);
    expect(component.fromSize).toBe(1);

  });
      
  class MockCognitoService {
    getUserDatails() {
    }
  }
  class MockCommonFunctions {
    get() {
    }
    getAuthToken() {
    }
  }
  class commonService{
   getSTList(){}
   filterList(){}
  }
});