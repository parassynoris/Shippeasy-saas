import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { NzNotificationModule, NzNotificationService } from 'ng-zorro-antd/notification';
import { CognitoService } from 'src/app/services/cognito.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { OverlayModule } from '@angular/cdk/overlay';
import { Router } from '@angular/router';
import { MessagingService } from 'src/app/services/messaging.service';
import { ApiService } from 'src/app/admin/principal/api.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { CommonService } from 'src/app/shared/services/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { Pipe, PipeTransform } from '@angular/core';
import autoTable from 'jspdf-autotable';

// Mock implementation of OrderByPipe
@Pipe({ name: 'orderBy' })
class MockOrderByPipe implements PipeTransform {
  transform(value: any[], key: string): any[] {
    return value; // Mock implementation: return the input array without sorting
  }
}
import { PartyMasterComponent } from './party-master.component';
import { ApiSharedService } from 'src/app/shared/components/api-service/api-shared.service';
import { MastersSortPipe } from 'src/app/shared/util/mastersort';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('PartyMasterComponent', () => {
  let component: PartyMasterComponent;
  let fixture: ComponentFixture<PartyMasterComponent>;
  let commonFunctionsMock: jasmine.SpyObj<CommonFunctions>;
  let translateServiceStub: Partial<TranslateService>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let commonServiceMock: jasmine.SpyObj<CommonService>;
  let notificationServiceMock: jasmine.SpyObj<NzNotificationService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;
  beforeEach(async () => {
    translateServiceStub = {
      get: (key: string) => of(key),
      instant: jasmine.createSpy('instant').and.returnValue('translated text')
    };
    commonFunctionsMock = jasmine.createSpyObj('CommonFunctions', ['getAuthToken']);
    await TestBed.configureTestingModule({
      declarations: [ PartyMasterComponent ,MastersSortPipe],
      imports: [HttpClientModule,RouterTestingModule,NzNotificationModule,SharedModule,BrowserAnimationsModule,TranslateModule.forRoot() ] ,
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
        { provide: MastersSortPipe, useValue: MastersSortPipe },
        { provide: CommonFunctions, useClass: MockCommonFunctions },
        { provide: CognitoService, useValue: cognitoServiceStub }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PartyMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should call ngOnInit and initialize component', () => {
    spyOn(component, 'getPartyList'); // Spy on the method
    component.ngOnInit();
    expect(component.getPartyList).toHaveBeenCalled(); // Expect the method to have been called
    // Add more expectations if necessary to test component initialization
  });
  it('should fetch party list successfully', () => {
    const mockData = { documents: [], totalCount: 0 }; // Mock response data
    spyOn(component.commonService, 'filterList').and.returnValue({} as any); // Spy on filterList method
    spyOn(component.commonService, 'getSTList').and.returnValue(of(mockData)); // Spy on getSTList method
    component.getPartyList(); // Call the method
    expect(component.smartAgentList).toEqual(mockData.documents); // Expect the smartAgentList to be equal to mock data
    expect(component.toalLength).toEqual(mockData.totalCount); // Expect the toalLength to be equal to mock data
    // Add more expectations if necessary
  });
  it('should clear all input fields and fetch party list', () => {
    spyOn(component, 'getPartyList'); // Spy on the method
    component.clear(); // Call the method
    // Expect all input fields to be cleared
    expect(component.agentProfileName).toEqual('');
    expect(component.phoneNo).toEqual('');
    expect(component.emailAddress).toEqual('');
    // Add expectations for other fields
    expect(component.getPartyList).toHaveBeenCalled(); // Expect getPartyList method to have been called
  });

  
  it('should sort the party list based on given column name', () => {
    const mockData:any = [{ name: 'John', age: 30 }, { name: 'Alice', age: 25 }, { name: 'Bob', age: 40 }]; // Mock data
    component.smartAgentList = mockData; // Set the component's smartAgentList to mock data
    component.order = true; // Set order to true
    component.sort('name'); // Call sort method with column name
    // Expect the list to be sorted in ascending order by name
    expect(component.smartAgentList).toEqual([{ name: 'Alice', age: 25 }, { name: 'Bob', age: 40 }, { name: 'John', age: 30 }] as any);
    // Add more expectations for sorting in descending order if necessary
  });
  it('should search party list with all fields filled', () => {
    const mockData = { documents: [], totalCount: 0 }; // Mock response data
    component.agentProfileName = 'John'; // Set search criteria
    component.phoneNo = '1234567890';
    component.emailAddress = 'john@example.com';
    component.country = 'USA';
    component.panNo = 'ABCDE1234F';
    component.status = 'true';
    spyOn(component.commonService, 'filterList').and.returnValue({} as any); // Spy on filterList method
    spyOn(component.commonService, 'getSTList').and.returnValue(of(mockData)); // Spy on getSTList method
    component.search(); // Call the method
    expect(component.smartAgentList).toEqual(mockData.documents); // Expect the smartAgentList to be equal to mock data
    expect(component.toalLength).toEqual(mockData.totalCount); // Expect the toalLength to be equal to mock data
    // Add more expectations if necessary
  });
  it('should fetch next page of party list when more records are available', () => {
    component.toalLength = 20; // Set total length greater than count
    component.count = 10; // Set count less than total length
    spyOn(component, 'getPaginationData'); // Spy on getPaginationData method
    component.next(); // Call the method
    expect(component.getPaginationData).toHaveBeenCalledWith('next'); // Expect getPaginationData method to have been called with 'next'
    // Add more expectations if necessary
  });
  it('should fetch previous page of party list when current page is not the first page', () => {
    component.page = 2; // Set current page greater than 1
    spyOn(component, 'getPaginationData'); // Spy on getPaginationData method
    component.prev(); // Call the method
    expect(component.getPaginationData).toHaveBeenCalledWith('prev'); // Expect getPaginationData method to have been called with 'prev'
    // Add more expectations if necessary
  });
  it('should update size and fetch party list when filter is applied', () => {
    const event = { target: { value: 20 } }; // Mock event object
    spyOn(component, 'getPartyList'); // Spy on getPartyList method
    component.filter(event); // Call the method
    expect(component.size).toEqual(20); // Expect size to be updated
    expect(component.fromSize).toEqual(1); // Expect fromSize to be reset
    expect(component.getPartyList).toHaveBeenCalled(); // Expect getPartyList method to have been called
    // Add more expectations if necessary
  });
  class MockCommonFunctions {
    get() {
    }
    getAuthToken() {
    }
  }
   const cognitoServiceStub = {
    getUserDatails: () => of({ accesslevel: ['admin', 'user'] }) 
  };
});