import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { NzNotificationModule, NzNotificationService } from 'ng-zorro-antd/notification';
import { CognitoService } from 'src/app/services/cognito.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { OverlayModule } from '@angular/cdk/overlay';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MessagingService } from 'src/app/services/messaging.service';
import { ApiService } from 'src/app/admin/principal/api.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { CommonService } from 'src/app/shared/services/common.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { Pipe, PipeTransform } from '@angular/core';
import { ApiSharedService } from 'src/app/shared/components/api-service/api-shared.service';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MastersSortPipe } from 'src/app/shared/util/mastersort';
import { MailTemplateComponent } from './mail-template.component';

// Mock implementation of OrderByPipe
@Pipe({ name: 'orderBy' })
class MockOrderByPipe implements PipeTransform {
  transform(value: any[], key: string): any[] {
    return value; // Mock implementation: return the input array without sorting
  }
}

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
describe('MailTemplateComponent', () => {
  let component: MailTemplateComponent
  let fixture: ComponentFixture<MailTemplateComponent>;
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
      declarations: [ MailTemplateComponent],
      imports: [HttpClientModule,RouterTestingModule,NzNotificationModule,SharedModule,TranslateModule.forRoot(),BrowserDynamicTestingModule,BrowserAnimationsModule] ,
      providers: [
        NzNotificationService,
        CognitoService, 
        OverlayModule ,
        RouterTestingModule,
        { provide: CommonFunctions, useValue: jasmine.createSpyObj('CommonFunctions', ['yourMethod']) }, // Provide a mock for CommonFunctions
        { provide: Router, useValue: {} },
        ApiSharedService,NgbActiveModal,
        { provide: MessagingService, useValue: jasmine.createSpyObj('MessagingService', ['methodName']) } ,
        { provide: MessagingService, useValue: {} },
        { provide: CommonFunctions, useValue: commonFunctionsMock },
        { provide: TransactionService, useValue: translateServiceStub },
        { provide: CommonService, useValue: commonServiceMock },
        { provide: ApiService, useValue: apiServiceMock },
        { provide: NzNotificationService, useValue: notificationServiceMock },
        { provide: NgbModal, useValue: modalServiceMock }, 
        { provide: MastersSortPipe, useValue: MastersSortPipe },
        { provide: OrderByPipe, useClass: MockOrderByPipe },
        { provide: CommonFunctions, useClass: MockCommonFunctions },
        { provide: CognitoService, useClass: MockCognitoService }, 
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of({ get: () => '123' }) }, // Adjust based on your route parameters
        },
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MailTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should call getemaildata on ngOnInit', () => {
    spyOn(component, 'getemaildata');
    component.ngOnInit();
    expect(component.getemaildata).toHaveBeenCalled();
  });
  
  it('should apply filter to dataSource', () => {
    component.dataSource.data = [
      { EmailName: 'Test', subject: 'Test Subject', createdOn: '2023-07-16' },
    ];
  
    component.applyFilter('test');
  
    expect(component.dataSource.filter).toBe('test');
  });

  it('should clear filters and call getemaildata', () => {
    spyOn(component, 'getemaildata');
    spyOn(component, 'searchColumns');
  
    component.clearFilters1();
  
    expect(component.filtersModel).toEqual([]);
    expect(component.filterKeys).toEqual({});
    expect(component.getemaildata).toHaveBeenCalled();
    expect(component.searchColumns).toHaveBeenCalled();
  });

  it('should update pagination and call getemaildata', () => {
    spyOn(component, 'getemaildata');
    const event = { pageIndex: 1, pageSize: 20 };
  
    component.onPageChange(event);
  
    expect(component.pageNumber).toBe(2);
    expect(component.pageSize).toBe(20);
    expect(component.from).toBe(20);
    expect(component.getemaildata).toHaveBeenCalled();
  });

  it('should call getPaginationData with next when next is called', () => {
    spyOn(component, 'getPaginationData');
    component.toalLength = 50;
    component.count = 20;
  
    component.next();
  
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });
  
  it('should call getPaginationData with prev when prev is called', () => {
    spyOn(component, 'getPaginationData');
    component.page = 1;
  
    component.prev();
  
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should call getemaildata when clear is called', () => {
    spyOn(component, 'getemaildata');
  
    component.clear();
  
    expect(component.getemaildata).toHaveBeenCalled();
  });

  it('should reset the filter when an empty string is applied', () => {
    component.dataSource.data = [
      { EmailName: 'Test', subject: 'Test Subject', createdOn: '2023-07-16' },
    ];
  
    component.applyFilter('');
  
    expect(component.dataSource.filter).toBe('');
  });
  
  it('should clear all filters', () => {
    component.filtersModel = ['test'];
    component.filterKeys = { EmailName: { "$regex": 'test', "$options": "i" } };
  
    component.clearFilters();
  
    expect(component.filtersModel).toEqual([]);
    expect(component.filterKeys).toEqual({});
  });

});