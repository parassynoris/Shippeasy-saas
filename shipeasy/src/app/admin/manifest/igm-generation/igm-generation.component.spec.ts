import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';

import { IgmGenerationComponent } from './igm-generation.component';
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
describe('IgmGenerationComponent', () => {
  let component: IgmGenerationComponent;
  let fixture: ComponentFixture<IgmGenerationComponent>;
  let commonFunctionsMock: jasmine.SpyObj<CommonFunctions>;
  let translateServiceStub: Partial<TranslateService>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let commonServiceMock: jasmine.SpyObj<CommonService>;
  let notificationServiceMock: jasmine.SpyObj<NzNotificationService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let commonServiceSpy: jasmine.SpyObj<CommonService>;
  let locationSpy: jasmine.SpyObj<Location>;
  let fb: FormBuilder;
  beforeEach(async () => {
    const apiServiceSpyObj = jasmine.createSpyObj('ApiService', ['getMasterList', 'SaveOrUpdate']);
    const commonServiceSpyObj = jasmine.createSpyObj('CommonService', ['getSTList', 'filterList', 'addToST']);
    await TestBed.configureTestingModule({
      declarations: [ IgmGenerationComponent ,MastersSortPipe],
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
    commonServiceSpy = TestBed.inject(CommonService) as jasmine.SpyObj<CommonService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IgmGenerationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    fb = TestBed.inject(FormBuilder);

    // Initialize form
    component.blForm = fb.group({
      blData: fb.array([])
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return FormArray control for bl', () => {
    expect(component.bl instanceof FormArray).toBeTruthy();
  });

  it('should return controls of FormArray for getControls()', () => {
    const mockBLData = [
      fb.group({ blId: 1, blNumber: 'BL123' }),
      fb.group({ blId: 2, blNumber: 'BL456' })
    ];
    const blFormArray = component.blForm.get('blData') as FormArray;
    mockBLData.forEach(bl => blFormArray.push(bl));

    expect(component.getControls().length).toBe(mockBLData.length);
    expect(component.getControls()[0]).toEqual(mockBLData[0]);
    expect(component.getControls()[1]).toEqual(mockBLData[1]);
  });

  it('should update cargo status to "LC" on pod and fpod change if they are equal', () => {
    component.blForm = fb.group({
      blData: fb.array([
        fb.group({ isIgm: true, cargoStatus: '' }),
        fb.group({ isIgm: true, cargoStatus: '' })
      ])
    });
    component.podPort = 'PortA';
    component.fpodPort = 'PortA';

    component.podChange('PortA', 0);
    expect(component.blForm.value.blData[0].cargoStatus).toEqual('LC');

    component.fpodChange('PortA', 1);
    expect(component.blForm.value.blData[1].cargoStatus).toEqual('LC');
  });

  it('should update cargo status to "TP" on pod and fpod change if they are not equal', () => {
    component.blForm = fb.group({
      blData: fb.array([
        fb.group({ isIgm: true, cargoStatus: '' }),
        fb.group({ isIgm: true, cargoStatus: '' })
      ])
    });
    component.podPort = 'PortA';
    component.fpodPort = 'PortB';

    component.podChange('PortA', 0);
    expect(component.blForm.value.blData[0].cargoStatus).toEqual('TP');

    component.fpodChange('PortB', 1);
    expect(component.blForm.value.blData[1].cargoStatus).toEqual('TP');
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

});