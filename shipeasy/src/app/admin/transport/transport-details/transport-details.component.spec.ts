import { async, ComponentFixture, TestBed } from '@angular/core/testing';
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
import { CommonService } from '../../../services/common/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { Pipe, PipeTransform } from '@angular/core';
import { ApiSharedService } from 'src/app/shared/components/api-service/api-shared.service';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TransportDetailsComponent } from './transport-details.component';
 
@Pipe({ name: 'orderBy' })
class MockOrderByPipe implements PipeTransform {
  transform(value: any[], key: string): any[] {
    return value; // Mock implementation: return the input array without sorting
  }
}
 
describe('TransportDetailsComponent', () => {
  let component: TransportDetailsComponent;
  let fixture: ComponentFixture<TransportDetailsComponent>;
  let commonFunctionsMock: jasmine.SpyObj<CommonFunctions>;
  let translateServiceStub: Partial<TranslateService>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let commonServiceMock: jasmine.SpyObj<CommonService>;
  let notificationServiceMock: jasmine.SpyObj<NzNotificationService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;
 let commonService: CommonService;

  let mockCognitoService: jasmine.SpyObj<CognitoService>;
  class ActivatedRouteStub {
    snapshot = {
      paramMap: new Map<string, string>().set('id', '123'),
    };
  }
  beforeEach(async(() => {
    translateServiceStub = {
      get: (key: string) => of(key),
      instant: jasmine.createSpy('instant').and.returnValue('translated text')
    };
    commonFunctionsMock = jasmine.createSpyObj('CommonFunctions', ['getUserType1','getAuthToken']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails','getagentDetails']);
    commonServiceMock = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList']);
    TestBed.configureTestingModule({
      declarations: [ TransportDetailsComponent ],
      imports: [HttpClientModule,RouterTestingModule,NzNotificationModule,SharedModule,TranslateModule.forRoot(),BrowserAnimationsModule,BrowserModule,HttpClientTestingModule ] ,
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
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of({ get: () => '123' }) }, // Adjust based on your route parameters
        },
        { provide: ActivatedRoute, useClass: ActivatedRouteStub },
      ]
    })
    .compileComponents();
  }));
 
  beforeEach(() => {
    fixture = TestBed.createComponent(TransportDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    commonService = TestBed.inject(CommonService);;
  });
 
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize and call getCurrency and getEnquiryList', () => {
    spyOn(component, 'getCurrency');
    spyOn(component, 'getEnquiryList');
    component.ngOnInit();
    expect(component.getCurrency).toHaveBeenCalled();
    expect(component.getEnquiryList).toHaveBeenCalled();
  });

  it('should call getCurrency and update currencyList', () => {
    const mockCurrencyResponse = { documents: [{ currencyId: 'USD', currencyShortName: 'USD' }] };
    commonServiceMock.getSTList.and.returnValue(of(mockCurrencyResponse));
    
    component.getCurrency();
    
    expect(component.currencyList).toEqual(mockCurrencyResponse.documents);
  });

  it('should call getEnquiryList and update transportData and enquiryDetails', () => {
    const mockTransportResponse = { documents: [{ enquiryId: '123', basicDetails: { loadType: 'fcl' } }] };
    const mockEnquiryResponse = { documents: [{ id: '456' }] };

    commonServiceMock.getSTList.and.callFake((endpoint) => {
      if (endpoint === 'transportinquiry') {
        return of(mockTransportResponse);
      } else if (endpoint === 'enquiry') {
        return of(mockEnquiryResponse);
      }
    });

    component.getEnquiryList();

    expect(component.transportData).toEqual(mockTransportResponse.documents[0]);
    expect(component.enquiryDetails).toEqual({ ...mockTransportResponse.documents[0], ...mockEnquiryResponse.documents[0] });
    expect(component.showContainer).toBeTrue();
    expect(component.typeOfWay).toBe('Container');
  });

  it('should correctly calculate total gross weight', () => {
    const mockArr = [{ grossWeightContainer: '100' }, { grossWeightContainer: '200' }];
    const total = component.totalGrossWeight(mockArr);
    expect(total).toBe(300);
  });

});
