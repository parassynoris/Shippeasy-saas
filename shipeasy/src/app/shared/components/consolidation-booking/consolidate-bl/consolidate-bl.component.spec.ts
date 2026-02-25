import { async, ComponentFixture, TestBed } from '@angular/core/testing';
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
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { Pipe, PipeTransform } from '@angular/core';
import autoTable from 'jspdf-autotable';
import { ApiSharedService } from 'src/app/shared/components/api-service/api-shared.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule,NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ConsolidateBlComponent } from './consolidate-bl.component';

// Mock implementation of OrderByPipe
@Pipe({ name: 'orderBy' })
class MockOrderByPipe implements PipeTransform {
  transform(value: any[], key: string): any[] {
    return value; // Mock implementation: return the input array without sorting
  }
}


describe('ConsolidateBlComponent', () => {
  let component: ConsolidateBlComponent;
  let fixture: ComponentFixture<ConsolidateBlComponent>;
  let commonFunctionsMock: jasmine.SpyObj<CommonFunctions>;
  let translateServiceStub: Partial<TranslateService>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let commonServiceMock: jasmine.SpyObj<CommonService>;
  let notificationServiceMock: jasmine.SpyObj<NzNotificationService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;

  beforeEach(async(() => {
    translateServiceStub = {
      get: (key: string) => of(key),
      instant: jasmine.createSpy('instant').and.returnValue('translated text')
    };
    commonFunctionsMock = jasmine.createSpyObj('CommonFunctions', ['getAuthToken','getUserType','getUserType']);
    TestBed.configureTestingModule({
      declarations: [ ConsolidateBlComponent ],
      imports: [HttpClientModule,RouterTestingModule,NzNotificationModule,SharedModule,TranslateModule.forRoot(),BrowserAnimationsModule,HttpClientTestingModule,FormsModule,ReactiveFormsModule,NgbModule , MatTableModule,NgMultiSelectDropDownModule,
        MatSelectModule,
        NoopAnimationsModule ] ,
      providers: [
        NzNotificationService,
        CognitoService, 
        OverlayModule ,
        { provide: CommonFunctions, useValue: jasmine.createSpyObj('CommonFunctions', ['yourMethod']) }, // Provide a mock for CommonFunctions
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
        { provide: CognitoService, useValue: jasmine.createSpyObj('CognitoService', ['getagentDetails']),useClass: MockCognitoService }, // Mock CognitoService
        { provide: CommonFunctions, useClass: MockCommonFunctions },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsolidateBlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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
    getAgentDetails (){}
    getUserType() {
    }
  }

  it('should initialize with correct default values', () => {
    const component = fixture.componentInstance;
    fixture.detectChanges();
  
    expect(component.size).toBe(10);
    expect(component.page).toBe(1);
    expect(component.count).toBe(0);
    expect(component.blData).toEqual([]);
  });

  it('should apply filter to data source', () => {
    const component = fixture.componentInstance;
    fixture.detectChanges();
  
    const filterValue = 'sample';
    component.applyFilter(filterValue);
  
    expect(component.dataSource.filter).toBe(filterValue.trim().toLowerCase());
  });

  it('should create the component', () => {
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should call getPaginationData on next() when more data is available', () => {
    const component = fixture.componentInstance;
    fixture.detectChanges();
  
    spyOn(component, 'getPaginationData');
    component.toalLength = 20;
    component.count = 10;
  
    component.next();
  
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });

  it('should call getPaginationData on prev() when not on the first page', () => {
    const component = fixture.componentInstance;
    fixture.detectChanges();
  
    spyOn(component, 'getPaginationData');
    component.page = 2;
    component.toalLength = 20;
    component.count = 10;
  
    component.prev();
  
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });
  
 
});