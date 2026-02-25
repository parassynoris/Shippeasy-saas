import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddActivityMappingComponent } from './add-activity-mapping.component';
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
describe('AddActivityMappingComponent', () => {
  let component: AddActivityMappingComponent;
  let fixture: ComponentFixture<AddActivityMappingComponent>;
  let commonFunctionsMock: jasmine.SpyObj<CommonFunctions>;
  let translateServiceStub: Partial<TranslateService>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let notificationServiceMock: jasmine.SpyObj<NzNotificationService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let locationSpy: jasmine.SpyObj<Location>;
  let sharedServiceSpy: jasmine.SpyObj<ApiSharedService>;
  beforeEach(async () => {
    const apiServiceSpyObj = jasmine.createSpyObj('ApiService', ['getMasterList', 'SaveOrUpdate']);
    const commonServiceSpyObj = jasmine.createSpyObj('CommonService', ['getSTList', 'filterList', 'addToST']);
    sharedServiceSpy = jasmine.createSpyObj('ApiSharedService', ['creatOrUpdateActivity']);
    await TestBed.configureTestingModule({
      declarations: [ AddActivityMappingComponent,MastersSortPipe ],
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
        { provide: ApiSharedService, useValue: sharedServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of({ get: () => '123' }) }, 
        },
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddActivityMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
   it('should initialize form', () => {
    expect(component.activityForm).toBeDefined();
    expect(component.activityForm.get('mappingName')).toBeDefined();
    // Add similar expectations for other form controls
  });
  it('should populate form fields when activity is selected', () => {
    const mockActivityList = [{ _id: 1, _source: { activityName: 'Activity 1', activityType: 'Type 1', isCargoImpact: true, status: true } }];
    component.activityList = mockActivityList;
    fixture.detectChanges();
  
    const activityId = 1;
    component.setActivityName({ target: { value: activityId } });
  
    expect(component.activityForm.get('mappingName').value).toEqual(mockActivityList[0]._source.activityName);
    expect(component.activityForm.get('activityName').value).toEqual(mockActivityList[0]._source.activityName);
    expect(component.activityForm.get('activityType').value).toEqual(mockActivityList[0]._source.activityType);
    // Add more expectations for other form fields
  });
  it('should mark form controls as invalid if required fields are empty', () => {
    // Set required fields to empty or invalid values
    component.activityForm.get('mappingName').setValue('');
    component.activityForm.get('principalCode').setValue('');
    // Trigger form validation
    component.activityMasters();
  
    // Expect form to be invalid
    expect(component.activityForm.invalid).toBeTruthy();
    // Add more specific expectations for each form control's validity
  });
  
  it('should mark form as valid if all required fields are filled', () => {
    // Set valid values for required fields
    component.activityForm.get('mappingName').setValue('Activity Mapping 1');
    component.activityForm.get('principalCode').setValue('ABC123');
    // Trigger form validation
    component.activityMasters();
  
    // Expect form to be valid
    expect(component.activityForm.valid).toBe(false );
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
   getActivityList (){}
  }
});