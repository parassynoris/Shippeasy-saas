import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RateFinderComponent } from './rate-finder.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { NzNotificationModule, NzNotificationService } from 'ng-zorro-antd/notification';
import { CognitoService } from 'src/app/services/cognito.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { OverlayModule } from '@angular/cdk/overlay';
import { ActivatedRoute, Router } from '@angular/router';
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
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { PaginatePipe, PaginationService } from 'ngx-pagination';

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
describe('RateFinderComponent', () => {
  let component: RateFinderComponent;
  let fixture: ComponentFixture<RateFinderComponent>;
  let commonFunctionsMock: jasmine.SpyObj<CommonFunctions>;
  let translateServiceStub: Partial<TranslateService>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let commonServiceMock: jasmine.SpyObj<CommonService>;
  let notificationServiceMock: jasmine.SpyObj<NzNotificationService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;
  let cognitoServiceMock: any;
  let notificationMock: any;
  let modalMock: any;
  let routeMock: any;
  let routerMock: any;
  beforeEach(async () => {
    commonServiceMock = jasmine.createSpyObj('CommonService', ['getSTList', 'filterList']);
    cognitoServiceMock = jasmine.createSpyObj('CognitoService', ['getUserDatails']);
    commonFunctionsMock = jasmine.createSpyObj('CommonFunctions', ['someFunction']);
    notificationMock = jasmine.createSpyObj('NzNotificationService', ['success', 'error']);
    modalMock = jasmine.createSpyObj('NgbModal', ['open']);
    routeMock = { snapshot: { paramMap: { get: () => '1' } } };
    routerMock = jasmine.createSpyObj('Router', ['navigate']);
    await TestBed.configureTestingModule({
      declarations: [ RateFinderComponent ,PaginatePipe],
      imports: [HttpClientModule,RouterTestingModule,NzNotificationModule,AutocompleteLibModule,SharedModule,TranslateModule.forRoot(),BrowserDynamicTestingModule,BrowserAnimationsModule] ,
      providers: [
        NzNotificationService,
        CognitoService, 
        OverlayModule ,
        { provide: CommonFunctions, useValue: jasmine.createSpyObj('CommonFunctions', ['yourMethod']) }, // Provide a mock for CommonFunctions
        { provide: Router, useValue: {} },
        ApiSharedService,NgbActiveModal,PaginationService,
        { provide: MessagingService, useValue: jasmine.createSpyObj('MessagingService', ['methodName']) } ,
        { provide: MessagingService, useValue: {} },
        { provide: CommonFunctions, useValue: commonFunctionsMock },
        { provide: TransactionService, useValue: translateServiceStub },
        { provide: CommonService, useValue: commonServiceMock },
        { provide: ApiService, useValue: apiServiceMock },
        { provide: NzNotificationService, useValue: notificationServiceMock },
        { provide: NgbModal, useValue: modalServiceMock }, 
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
    fixture = TestBed.createComponent(RateFinderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should initialize form with default values', () => {
    expect(component.quotationform).toBeDefined();
    expect(component.quotationform.controls['from'].value).toBe('');
    expect(component.quotationform.controls['to'].value).toBe('');
  });




  it('should swap locations correctly', () => {
    component.quotationform.controls['from'].setValue('Location1');
    component.quotationform.controls['to'].setValue('Location2');
    component.quotationform.controls['fromType'].setValue('Type1');
    component.quotationform.controls['toType'].setValue('Type2');

    component.onSwap('Type1', 'Location1', 'Type2', 'Location2');

    expect(component.quotationform.controls['from'].value).toBe('Location2');
    expect(component.quotationform.controls['to'].value).toBe('Location1');
    expect(component.quotationform.controls['fromType'].value).toBe('Type2');
    expect(component.quotationform.controls['toType'].value).toBe('Type1');
  });
  it('should have openWebChat function defined', () => {
    expect(component.openWebChat).toBeDefined();
  });

  it('should trigger click event on element with id zsiq_float if it exists', () => {
    // Arrange
    const element = document.createElement('div');
    element.id = 'zsiq_float';
    document.body.appendChild(element);
    const clickSpy = spyOn(element, 'click');

    // Act
    component.openWebChat();

    // Assert
    expect(clickSpy).toHaveBeenCalled();

    // Cleanup
    document.body.removeChild(element);
  });
  
  it('should handle dropdown change correctly', () => {
    spyOn(component, 'addNewBranch');
    spyOn(component, 'addNewBranchs');
    spyOn(component, 'addNewwegon');
    spyOn(component, 'addNewtrucks');

    component.dropdownchange('ULD container');
    expect(component.addNewBranch).toHaveBeenCalled();

    component.dropdownchange('loose');
    expect(component.addNewBranchs).toHaveBeenCalled();

    component.dropdownchange('FWL');
    expect(component.addNewwegon).toHaveBeenCalled();

    component.dropdownchange('FTL');
    expect(component.addNewtrucks).toHaveBeenCalled();
  });

  it('should display an error if no quotations are available', () => {
    component.selectedFilter = {
      shippingLine: { 'all type': false },
      customsclearance: { 'Destination': true },
    };

    component.applyFilter();
    expect(component.quoteratelist.length).toBe(0);
    expect(component.error).toBe(' No quick quotes available for selected route.\n');
  });

  
});