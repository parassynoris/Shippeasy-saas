import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmployeeMasterComponent } from './employee-master.component';
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
describe('EmployeeMasterComponent', () => {
  let component: EmployeeMasterComponent;
  let fixture: ComponentFixture<EmployeeMasterComponent>;
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
  beforeEach(async () => {
    const apiServiceSpyObj = jasmine.createSpyObj('ApiService', ['getMasterList', 'SaveOrUpdate']);
    const commonServiceSpyObj = jasmine.createSpyObj('CommonService', ['getSTList', 'batchUpdate']);
    await TestBed.configureTestingModule({
      declarations: [ EmployeeMasterComponent ,MastersSortPipe],
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
    fixture = TestBed.createComponent(EmployeeMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.modalService = jasmine.createSpyObj('NgbModal', ['dismissAll']);
    component.employeeForm = jasmine.createSpyObj('FormBuilder', ['reset']);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('onSave() should dismiss the modal', () => {
    component.onSave();
    expect(component.modalService.dismissAll).toHaveBeenCalledTimes(1);
  });
  
  it('onSave() should reset idToUpdate, employeeForm, and submitted', () => {
    component.idToUpdate = '123';
    component.submitted = true;
    component.onSave();
    expect(component.idToUpdate).toBe('');
    expect(component.employeeForm.reset).toHaveBeenCalledTimes(1);
    expect(component.submitted).toBe(false);
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
});