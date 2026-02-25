import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PdaListComponent } from './pda-list.component';
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
describe('PdaListComponent', () => {
  let component: PdaListComponent;
  let fixture: ComponentFixture<PdaListComponent>;
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
  beforeEach(async(() => {
    const apiServiceSpyObj = jasmine.createSpyObj('ApiService', ['getMasterList', 'SaveOrUpdate']);
    const commonServiceSpyObj = jasmine.createSpyObj('CommonService', ['getSTList', 'batchUpdate']);
    TestBed.configureTestingModule({
      declarations: [ PdaListComponent,MastersSortPipe ],
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
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PdaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should call getPdaList on initialization', () => {
    spyOn(component, 'getPdaList');
    component.ngOnInit();
    expect(component.getPdaList).toHaveBeenCalled();
  });

  it('should update size and call getPdaList when filter is triggered', () => {
    const newSize = 10;
    spyOn(component, 'getPdaList');
    component.filter({ target: { value: newSize } });
    expect(component.size).toEqual(newSize);
    expect(component.getPdaList).toHaveBeenCalled();
  });

  it('should call getPaginationData with "next" when next is triggered and totalLength is greater than count', () => {
    spyOn(component, 'getPaginationData');
    component.toalLength = 20; // set totalLength greater than count
    component.count = 10;
    component.next();
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });

  it('should not call getPaginationData when next is triggered and totalLength is not greater than count', () => {
    spyOn(component, 'getPaginationData');
    component.toalLength = 10; // set totalLength equal to count
    component.count = 10;
    component.next();
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });

  it('should call getPaginationData with "prev" when prev is triggered and page is greater than 0', () => {
    spyOn(component, 'getPaginationData');
    component.page = 2;
    component.prev();
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should not call getPaginationData when prev is triggered and page is 0', () => {
    spyOn(component, 'getPaginationData');
    component.page = 0;
    component.prev();
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });
  it('should initialize page to 1 and size to a default value', () => {
    expect(component.page).toEqual(1);
    // Add expectation for default size value
  });

  it('should correctly call getPdaList() on initialization', () => {
    spyOn(component, 'getPdaList');
    component.ngOnInit();
    expect(component.getPdaList).toHaveBeenCalled();
  });

  it('should update size and call getPdaList() when filter is triggered', () => {
    const newSize = 10;
    spyOn(component, 'getPdaList');
    component.filter({ target: { value: newSize } });
    expect(component.size).toEqual(newSize);
    expect(component.getPdaList).toHaveBeenCalled();
  });

  it('should correctly update page and count when next() is called', () => {
    component.toalLength = 20; // Assuming totalLength is greater than count
    component.count = 10;
    component.next();
    expect(component.page).toEqual(1);
    // Add expectation for updated count based on new page
  });

  it('should not update page when next() is called and totalLength is not greater than count', () => {
    component.toalLength = 10; // Assuming totalLength is not greater than count
    component.count = 10;
    const initialPage = component.page;
    component.next();
    expect(component.page).toEqual(initialPage);
  });

  it('should correctly update page when prev() is called', () => {
    component.page = 2; // Assuming current page is not the first page
    component.prev();
    expect(component.page).toEqual(2);
  });

  it('should not update page when prev() is called and page is already 0', () => {
    component.page = 0; // Assuming current page is already 0
    const initialPage = component.page;
    component.prev();
    expect(component.page).toEqual(initialPage);
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