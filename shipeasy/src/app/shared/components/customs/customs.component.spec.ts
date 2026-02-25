import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import {  NgbModalRef, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from 'src/app/admin/principal/api.service';

import { MastersService } from 'src/app/services/Masters/masters.service';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import * as XLSX from "xlsx";
import { CurrencyPipe, DatePipe } from '@angular/common'; 
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { CustomsComponent } from './customs.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { NzNotificationModule, NzNotificationService } from 'ng-zorro-antd/notification';
import { CognitoService } from 'src/app/services/cognito.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { OverlayModule } from '@angular/cdk/overlay';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagingService } from 'src/app/services/messaging.service';
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
import { MatTableDataSource } from '@angular/material/table';


// Mock implementation of OrderByPipe
@Pipe({ name: 'orderBy' })
class MockOrderByPipe implements PipeTransform {
  transform(value: any[], key: string): any[] {
    return value; // Mock implementation: return the input array without sorting
  }
}
describe('CustomsComponent', () => {
  let component: CustomsComponent;
  let fixture: ComponentFixture<CustomsComponent>;
  let commonFunctionsMock: jasmine.SpyObj<CommonFunctions>;
  let translateServiceStub: Partial<TranslateService>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let commonServiceMock: jasmine.SpyObj<CommonService>;
  let notificationServiceMock: jasmine.SpyObj<NzNotificationService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomsComponent ],
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
    fixture = TestBed.createComponent(CustomsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should clear global search', () => {
    component.globalSearch = 'some value';
    
    component.clearGloble();
    
    expect(component.globalSearch).toEqual('');
  });

  it('should apply filter correctly', () => {
    const sampleFilterValue = 'search term';
    const dataSource = new MatTableDataSource([{ name: 'Item 1' }, { name: 'Item 2' }] as any);

    component.dataSource = dataSource;

    component.applyFilter(sampleFilterValue);

    expect(component.dataSource.filter).toEqual(sampleFilterValue.trim().toLowerCase());
  });

  it('should navigate to the correct URL when navigateToNewTab() is called', () => {
    const mockElement = { agentadviceId: '123' };
    spyOn(window, 'open');

    component.navigateToNewTab(mockElement);

    expect(window.open).toHaveBeenCalledWith(window.location.href + '/123/edit');
  });


  it('should clear the global search value when clearGloble() is called', () => {
    // Set initial value for globalSearch
    component.globalSearch = 'test';

    // Call the method to clear the global search
    component.clearGloble();

    // Expect the global search value to be empty after clearing
    expect(component.globalSearch).toEqual('');
  });



  it('should correctly apply the filter value to dataSource when applyFilter() is called', () => {
    // Mocking the dataSource
    const dataSource = new MatTableDataSource([{ name: 'Item 1' }, { name: 'Item 2' }]);
    component.dataSource = dataSource;

    // Applying a sample filter value
    const filterValue = 'item 1';
    component.applyFilter(filterValue);

    // Expecting the filter to be applied correctly
    expect(component.dataSource.filter).toEqual(filterValue.trim().toLowerCase());
  });
  it('should clear global search value and call clear method when clearGloble() is called', () => {
    // Set initial value for globalSearch
    component.globalSearch = 'test';

    // Spy on the clear method
    spyOn(component, 'clear');

    // Call the method to clear global search
    component.clearGloble();

    // Expect the global search value to be empty
    expect(component.globalSearch).toEqual('');

    // Expect the clear method to be called
    expect(component.clear).toHaveBeenCalled();
  });

  it('should correctly open a new tab with the appropriate URL when navigateToNewTab() is called', () => {
    // Mock element
    const mockElement = { agentadviceId: '123' };
    const expectedURL = window.location.href + '/123/edit';
    spyOn(window, 'open');

    // Call the method to open a new tab
    component.navigateToNewTab(mockElement);

    // Expect window.open to be called with the correct URL
    expect(window.open).toHaveBeenCalledWith(expectedURL);
  });

  it('should successfully navigate to a new tab with the correct URL when navigateToNewTab() is called', () => {
    // Mock element
    const mockElement = { agentadviceId: '123' };
    const expectedURL = `${window.location.href}/123/edit`;
    spyOn(window, 'open');

    // Call navigateToNewTab method
    component.navigateToNewTab(mockElement);

    // Expect window.open to be called with the correct URL
    expect(window.open).toHaveBeenCalledWith(expectedURL);
  });

  it('should clear the global search value and call clear() when clearGloble() is called', () => {
    // Set initial value for globalSearch
    component.globalSearch = 'test';

    // Spy on clear method
    spyOn(component, 'clear');

    // Call clearGloble method
    component.clearGloble();

    // Expect globalSearch value to be empty
    expect(component.globalSearch).toEqual('');
    // Expect clear method to be called
    expect(component.clear).toHaveBeenCalled();
  });

  it('should successfully clear global search value when clearGloble() is called', () => {
    // Set initial value for globalSearch
    component.globalSearch = 'test';

    // Call clearGloble method
    component.clearGloble();

    // Expect globalSearch value to be empty
    expect(component.globalSearch).toEqual('');
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
});
