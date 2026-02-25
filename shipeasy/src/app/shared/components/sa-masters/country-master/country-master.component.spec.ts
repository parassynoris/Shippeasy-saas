import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { NzNotificationModule, NzNotificationService } from 'ng-zorro-antd/notification';
import { CognitoService } from 'src/app/services/cognito.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { OverlayModule } from '@angular/cdk/overlay';
import { Router } from '@angular/router';
import { ApiSharedService } from '../../api-service/api-shared.service';
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
import { CountryMasterComponent } from './country-master.component';
import { MastersSortPipe } from 'src/app/shared/util/mastersort';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Mock implementation of OrderByPipe
@Pipe({ name: 'orderBy' })
class MockOrderByPipe implements PipeTransform {
  transform(value: any[], key: string): any[] {
    return value; // Mock implementation: return the input array without sorting
  }
}
describe('CountryMasterComponent', () => {
  let component: CountryMasterComponent;
  let fixture: ComponentFixture<CountryMasterComponent>;
  let commonFunctionsMock: jasmine.SpyObj<CommonFunctions>;
  let translateServiceStub: Partial<TranslateService>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let commonServiceMock: jasmine.SpyObj<CommonService>;
  let notificationServiceMock: jasmine.SpyObj<NzNotificationService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;
  let mockCognitoService: jasmine.SpyObj<CognitoService>;
  
  beforeEach(async () => {
    
    translateServiceStub = {
      get: (key: string) => of(key),
      instant: jasmine.createSpy('instant').and.returnValue('translated text')
    };
    commonFunctionsMock = jasmine.createSpyObj('CommonFunctions', ['getAuthToken',]);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails','getModule','get']);
    await TestBed.configureTestingModule({
      declarations: [ CountryMasterComponent,MockOrderByPipe,MastersSortPipe  ],
      imports: [HttpClientModule,BrowserAnimationsModule,RouterTestingModule,NzNotificationModule,SharedModule,TranslateModule.forRoot() ] ,
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
        { provide: CognitoService, useValue: mockCognitoService },
        { provide: OrderByPipe, useClass: MockOrderByPipe },
        {provide:MastersSortPipe, useValue:MastersSortPipe},
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CountryMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should initialize the form correctly', () => {
    expect(component.addCountryForm).toBeDefined();
    expect(component.addCountryForm.get('countryCode')).toBeDefined();
    expect(component.addCountryForm.get('countryName')).toBeDefined();
    expect(component.addCountryForm.get('sector')).toBeDefined();
    expect(component.addCountryForm.get('countryShortName')).toBeDefined();
    expect(component.addCountryForm.get('subSectorName')).toBeDefined();
    expect(component.addCountryForm.get('status')).toBeDefined();
  });
  it('should call getPaginationData("next") if totalLength is greater than count', () => {
    component.toalLength = 20;
    component.count = 10;
    spyOn(component, 'getPaginationData').and.stub();
    component.next();
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });
  
  it('should not call getPaginationData("next") if totalLength is not greater than count', () => {
    component.toalLength = 10;
    component.count = 10;
    spyOn(component, 'getPaginationData').and.stub();
    component.next();
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });
  it('should call getPaginationData("prev") if page is greater than 0', () => {
    component.page = 2;
    spyOn(component, 'getPaginationData').and.stub();
    component.prev();
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });
  
  it('should not call getPaginationData("prev") if page is 0', () => {
    component.page = 0;
    spyOn(component, 'getPaginationData').and.stub();
    component.prev();
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });
  it('should update size, fromSize to 1, and call getData() when filter is called', () => {
    const mockEvent = { target: { value: 20 } };
    spyOn(component, 'getData').and.stub();
    component.filter(mockEvent);
    expect(component.size).toEqual(20);
    expect(component.fromSize).toEqual(1);
    expect(component.getData).toHaveBeenCalled();
  });
   it('should clear filters and call getData()', () => {
  spyOn(component, 'getData').and.stub();

  // Set some initial values to clear
  component.country = 'Test Country';
  component.iso_country = 'Test ISO Country';
  component.region = 'Test Region';
  component.status = 'Test Status';

  // Call the clear method
  component.clear();

  // Check if filters are cleared
  expect(component.country).toEqual('');
  expect(component.iso_country).toEqual('');
  expect(component.region).toEqual('');
  expect(component.status).toEqual('');

  // Check if getData() is called
  expect(component.getData).toHaveBeenCalled();
});
   
});