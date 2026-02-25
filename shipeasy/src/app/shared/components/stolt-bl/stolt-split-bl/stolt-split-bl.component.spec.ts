import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { StoltSplitBlComponent } from './stolt-split-bl.component';
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
describe('StoltSplitBlComponent', () => {
  let commonFunctionsMock: jasmine.SpyObj<CommonFunctions>;
  let translateServiceStub: Partial<TranslateService>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let notificationServiceMock: jasmine.SpyObj<NzNotificationService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let locationSpy: jasmine.SpyObj<Location>;
  let mockModalService;
  let component: StoltSplitBlComponent;
  let fixture: ComponentFixture<StoltSplitBlComponent>;
  let mockNotificationService: jasmine.SpyObj<NzNotificationService>;

  beforeEach(async () => {
    const apiServiceSpyObj = jasmine.createSpyObj('ApiService', ['getMasterList', 'SaveOrUpdate']);
    const commonServiceSpyObj = jasmine.createSpyObj('CommonService', ['getSTList', 'filterList', 'addToST']);
    mockModalService = jasmine.createSpyObj('NgbModal', ['dismissAll']);
    mockNotificationService = jasmine.createSpyObj('NzNotificationService', ['create']);
    await TestBed.configureTestingModule({
      declarations: [ StoltSplitBlComponent ,MastersSortPipe],
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
        { provide: NzNotificationService, useValue: mockNotificationService },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of({ get: () => '123' }) }, 
        },
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StoltSplitBlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should initialize component properties', () => {
    // Arrange
    component.BatchIdData = {
      containers: [{ containerNumber: '123' }],
      blNumber: 'BL123',
      blType: 'Type',
      blDate: '2022-01-01',
      shipperName: 'Shipper',
      consigneeName: 'Consignee'
    };
    component.BatchIdDataDetail = { blId: '123', indexNo: 1 };

    // Act
    component.ngOnInit();

    // Assert
    expect(component.blData.length).toBe(1);
    expect(component.blNo).toBe('BL123');
    expect(component.blType).toBe('Type');
    expect(component.blDate).toBe('2022-01-01');
    expect(component.shipperName).toBe('Shipper');
    expect(component.consigneeName).toBe('Consignee');
  });

  it('should notify when no containers selected for splitting', () => {
    // Arrange
    component.isSelected = false;

    // Act
    component.onSplitBatch();

    // Assert
    expect(mockNotificationService.create).toHaveBeenCalledWith('error', 'Please Select Atleast One Container', '');
  });

  it('should add container to selectedContainersArr when selected', () => {
    // Arrange
    const container = { containerNumber: '123' };

    // Act
    component.selectContainer(container, { target: { checked: true } });

    // Assert
    expect(component.selectedContainersArr.length).toBe(1);
    expect(component.selectedContainersArr[0]).toBe(container);
  });

  it('should remove container from selectedContainersArr when deselected', () => {
    // Arrange
    const container = { containerNumber: '123' };
    component.selectedContainersArr = [container];

    // Act
    component.selectContainer(container, { target: { checked: false } });

    // Assert
    expect(component.selectedContainersArr.length).toBe(0);
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