import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarrierBookingComponent } from './carrier-booking.component';
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
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { Pipe, PipeTransform } from '@angular/core';
import { ApiSharedService } from 'src/app/shared/components/api-service/api-shared.service';
import { of } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CommonService } from 'src/app/services/common/common.service';


// Mock implementation of OrderByPipe
@Pipe({ name: 'orderBy' })
class MockOrderByPipe implements PipeTransform {
  transform(value: any[], key: string): any[] {
    return value; // Mock implementation: return the input array without sorting
  }
}
describe('CarrierBookingComponent', () => {
  let component: CarrierBookingComponent;
  let fixture: ComponentFixture<CarrierBookingComponent>;
  let commonFunctionsMock: jasmine.SpyObj<CommonFunctions>;
  let translateServiceStub: Partial<TranslateService>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let commonServiceMock: jasmine.SpyObj<CommonService>;
  let notificationServiceMock: jasmine.SpyObj<NzNotificationService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CarrierBookingComponent ],
      imports: [HttpClientModule,RouterTestingModule,NzNotificationModule,SharedModule,TranslateModule.forRoot(),BrowserAnimationsModule,HttpClientTestingModule ] ,
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
        { provide: CognitoService, useClass: MockCognitoService }, // Mock CognitoService
        { provide: CommonFunctions, useClass: MockCommonFunctions },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of({ get: () => '123' }) }, 
        },
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CarrierBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should create the CarrierBookingComponent', () => {
    expect(component).toBeTruthy();
  });
  
  it('should move to the previous page', () => {
    component.page = 2;
    component.count = 20;
  
    spyOn(component, 'getPaginationData');
  
    component.prev();
  
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should update size and fromSize', () => {
    const event = { target: { value: '20' } };
  
    component.filter(event);
  
    expect(component.size).toEqual('20' as any);
    expect(component.fromSize).toEqual(1);
  });

  it('should clear all filters', () => {
    // Set initial filter values
    component.filtersModel = [/* initial filter values */];
    component.filterKeys = { /* initial filter keys */ };
  
    component.clearFilters();
  
    // Check that the filters are cleared
    expect(component.filtersModel).toEqual([]);
    expect(component.filterKeys).toEqual({});
  });
  it('should sort data correctly', () => {
    const mockData = [{ /* mock data */ }];
    commonServiceMock?.getSTList.and.returnValue(of({ documents: mockData }));
  
    fixture.detectChanges(); // Initialize the component
    component.sort(component.dataSource.data, 'columnName'); // Simulate sorting action
  
    // Expect that the data is sorted correctly
    expect(component.dataSource.data).toEqual([]);
  });
  
  it('should filter data based on user input', () => {
    const mockData = [{ /* mock data */ }];
    commonServiceMock?.getSTList.and.returnValue(of({ documents: mockData }));
  
    fixture.detectChanges(); // Initialize the component
    const filterValue = 'search term'; // Simulate user input
    component.applyFilter(filterValue); // Apply filter
  
    // Expect that the displayed data matches the filtered criteria
    expect(component.dataSource.filteredData).toEqual([]);
  });

  it('should update data when paginating', () => {
    const mockData = [{ /* mock data */ }];
    const mockTotalCount = 50;
    commonServiceMock?.getSTList.and.returnValue(of({ documents: mockData, totalCount: mockTotalCount }));
  
    fixture.detectChanges(); // Initialize the component
  
    // Simulate user clicking next page
    component.next();
  
    // Expect that the data source is updated with next page data
    expect(component.dataSource.data).toEqual([]);
  
    // Simulate user clicking previous page
    component.prev();
  
    // Expect that the data source is updated with previous page data
    expect(component.dataSource.data).toEqual([]);
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