import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as XLSX from 'xlsx';
import { UpdateContainerCellPositionComponent } from './update-container-cell-position.component';
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
import { FormBuilder,FormsModule, ReactiveFormsModule, FormArray, FormControl, FormGroup } from '@angular/forms';
import { Location } from '@angular/common';

// Mock implementation of OrderByPipe
@Pipe({ name: 'orderBy' })
class MockOrderByPipe implements PipeTransform {
  transform(value: any[], key: string): any[] {
    return value; // Mock implementation: return the input array without sorting
  }
}
describe('UpdateContainerCellPositionComponent', () => {
  let component: UpdateContainerCellPositionComponent;
  let fixture: ComponentFixture<UpdateContainerCellPositionComponent>;
  let commonFunctionsMock: jasmine.SpyObj<CommonFunctions>;
  let translateServiceStub: Partial<TranslateService>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let commonServiceMock: jasmine.SpyObj<CommonService>;
  let notificationServiceMock: jasmine.SpyObj<NzNotificationService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;
  let location: jasmine.SpyObj<Location>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  beforeEach(async () => {
    mockApiService = jasmine.createSpyObj('ApiService', ['getSTList', 'addToST', 'UpdateToST', 'deleteST']);
    await TestBed.configureTestingModule({
      declarations: [ UpdateContainerCellPositionComponent ],
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
        { provide: CommonService, useValue: commonServiceMock },
        { provide: ApiService, useValue: apiServiceMock },
        { provide: NzNotificationService, useValue: notificationServiceMock },
        { provide: NgbModal, useValue: modalServiceMock }, 
        { provide: OrderByPipe, useClass: MockOrderByPipe },
        { provide: CognitoService, useClass: MockCognitoService },
        { provide: Location, useValue: jasmine.createSpyObj('Location', ['back']) },
        { provide: CommonFunctions, useClass: MockCommonFunctions },
        { provide: ApiService, useValue: mockApiService },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of({ get: () => '123' }) }, 
        },
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateContainerCellPositionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should initialize blForm correctly', () => {
    expect(component.blForm).toBeDefined();
    // Add more assertions to check form initialization if needed
  });
  
  it('should initialize containerData correctly', () => {
    expect(component.containerData).toEqual([]);
  });

  it('should build form correctly', () => {
    component.containerData = [{ containerNumber: '1', containerType: 'Type', containerSize: 'Size', baplie: 'Baplie', positionNo: '1', sealNo: 'Seal' }];
    component.buildForm();
  
    const formValue = component.blForm.getRawValue();
    expect(formValue.blData.length).toBe(1);
    // Add more assertions to check form structure if needed
  });

  it('should build the form with containerData', () => {
    component.containerData = [{ containerNumber: '12345', containerType: 'Type1', containerSize: '20', baplie: 'Baplie1', positionNo: 'P1', sealNo: 'Seal1' }];
  
    component.buildForm();
  
    expect(component.blForm.get('blData')).toBeTruthy();
    expect(component.blForm.value.blData.length).toBe(1);
    expect(component.blForm.value.blData[0].containerNumber).toEqual('12345');
  });

  it('should initialize blForm as a FormGroup', () => {
    expect(component.blForm instanceof FormGroup).toBeTruthy();
  });
  
  it('should initialize containerData as an empty array', () => {
    expect(component.containerData).toEqual([]);
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