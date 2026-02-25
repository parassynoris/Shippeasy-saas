import { ComponentFixture, TestBed, async } from '@angular/core/testing';
 
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
import { of, throwError } from 'rxjs';
import { CommonService } from 'src/app/shared/services/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { Pipe, PipeTransform } from '@angular/core';
import { ApiSharedService } from 'src/app/shared/components/api-service/api-shared.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StateCityMasterComponent } from './state-city-master.component';
 
// Mock implementation of OrderByPipe
@Pipe({ name: 'orderBy' })
class MockOrderByPipe implements PipeTransform {
  transform(value: any[], key: string): any[] {
    return value; // Mock implementation: return the input array without sorting
  }
}
describe('StateCityMasterComponent', () => {
  let component: StateCityMasterComponent;
  let fixture: ComponentFixture<StateCityMasterComponent>;
  let commonFunctionsMock: jasmine.SpyObj<CommonFunctions>;
  let translateServiceStub: Partial<TranslateService>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let commonServiceMock: jasmine.SpyObj<CommonService>;
  let notificationServiceMock: jasmine.SpyObj<NzNotificationService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;
  let mockCognitoService: jasmine.SpyObj<CognitoService>;
  class ActivatedRouteStub {
    snapshot = {
      paramMap: new Map<string, string>().set('id', '123'),
    };
  }
 
  beforeEach(async () => {
    translateServiceStub = {
      get: (key: string) => of(key),
      instant: jasmine.createSpy('instant').and.returnValue('translated text')
    };
    commonFunctionsMock = jasmine.createSpyObj('CommonFunctions', ['getAuthToken']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails','getagentDetails']);
    apiServiceMock = jasmine.createSpyObj('ApiSharedService', ['body', 'bodyNew', 'getSTList', 'pushreports', 'deleteST']);
    await TestBed.configureTestingModule({
      declarations: [ StateCityMasterComponent,MockOrderByPipe  ],
      imports: [HttpClientModule,RouterTestingModule,NzDatePickerModule,BrowserAnimationsModule,NzNotificationModule,SharedModule,TranslateModule.forRoot() ,ReactiveFormsModule,FormsModule] ,
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
        { provide: ActivatedRoute, useClass: ActivatedRouteStub },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of({ get: () => '123' }) }, // Adjust based on your route parameters
        },
      ]
    })
    .compileComponents();
  });
 
  beforeEach(() => {
    fixture = TestBed.createComponent(StateCityMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
 
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should initialize form with correct controls', () => {
    expect(component.addCountryForm.get('callingCode')).toBeTruthy();
    expect(component.addCountryForm.get('countryName')).toBeTruthy();
    // Add assertions for other form controls
  });

  it('should validate form controls', () => {
    const callingCodeControl = component.addCountryForm.get('callingCode');
    callingCodeControl.setValue(''); // Invalid value
    expect(callingCodeControl.valid).toBeFalsy();
    expect(callingCodeControl.errors.required).toBeTruthy();

    callingCodeControl.setValue('123'); // Valid value
    expect(callingCodeControl.valid).toBeTruthy();
  });

  it('should paginate data forward when calling next()', () => {
    spyOn(component, 'getPaginationData');
    component.toalLength = 20;
    component.count = 10;
    component.next();
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });
  
  it('should paginate data backward when calling prev()', () => {
    spyOn(component, 'getPaginationData');
    component.page = 2;
    component.prev();
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });
  
  it('should update size and fetch data when calling filter()', () => {
    spyOn(component, 'getData');
    const event = { target: { value: 20 } };
    component.filter(event);
    expect(component.size).toBe(20);
    expect(component.fromSize).toBe(1);
    expect(component.getData).toHaveBeenCalled();
  });

  it('should display alert message when calling deleteclause()', () => {
    spyOn(window, 'alert'); // Spy on the window.alert method
  
    const dummyId = '123'; // Provide a dummy id
    component.deleteclause(dummyId);
  
    expect(window.alert).toHaveBeenCalledWith('Item deleted!');
  });

  it('should clear properties and fetch data when calling clear()', () => {
    spyOn(component, 'getData');
  
    // Set some initial values for properties
    component.country = 'USA';
    component.iso_country = 'US';
    component.region = 'North America';
    component.status = true;
  
    component.clear();
  
    // Check if properties are cleared
    expect(component.country).toBe('');
    expect(component.iso_country).toBe('');
    expect(component.region).toBe('');
    expect(component.status).toBe('');
  
    // Check if getData() is called
    expect(component.getData).toHaveBeenCalled();
  });
  
});