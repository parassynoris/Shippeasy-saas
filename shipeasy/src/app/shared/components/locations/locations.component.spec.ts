import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationsComponent } from './locations.component';
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
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormArray, FormBuilder } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MastersSortPipe } from '../../util/mastersort';

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
describe('LocationsComponent', () => {
  let component: LocationsComponent;
  let fixture: ComponentFixture<LocationsComponent>;
  let commonFunctionsMock: jasmine.SpyObj<CommonFunctions>;
  let translateServiceStub: Partial<TranslateService>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let commonServiceMock: jasmine.SpyObj<CommonService>;
  let notificationServiceMock: jasmine.SpyObj<NzNotificationService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;
  let router: Router

  beforeEach(async(() => {
    translateServiceStub = {
      get: (key: string) => of(key),
      instant: jasmine.createSpy('instant').and.returnValue('translated text')
    };
    commonFunctionsMock = jasmine.createSpyObj('CommonFunctions', ['getAuthToken']);
    TestBed.configureTestingModule({
      declarations: [ LocationsComponent, ],
      imports: [RouterTestingModule,NzNotificationModule,SharedModule,TranslateModule.forRoot(),  BrowserModule,
        BrowserAnimationsModule,HttpClientTestingModule ] ,
      providers: [
        NzNotificationService,
        MastersSortPipe,
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
        { provide: CommonFunctions, useClass: MockCommonFunctions },
        { provide: CognitoService, useClass: MockCognitoService }, 
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of({ get: () => '123' }) }, // Adjust based on your route parameters
        },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should call getPaginationData with "next" when next() is called and totalCount is greater than count', () => {
    component.toalLength = 10; // Set toalLength greater than count
    component.count = 5;
    spyOn(component, 'getPaginationData');
    component.next();
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });

  it('should call getPaginationData with "prev" when prev() is called and page is greater than 0', () => {
    component.page = 2; // Set page greater than 0
    spyOn(component, 'getPaginationData');
    component.prev();
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should set size and fromSize when filter() is called', () => {
    const event = { target: { value: 10 } };
    spyOn(component, 'getLocation');
    component.filter(event);
    expect(component.size).toBe(10);
    expect(component.fromSize).toBe(1);
    expect(component.getLocation).toHaveBeenCalled();
  });

  it('should call sortPipe.transform when sort() is called', () => {
    const array = [/* your array */];
    const key = 'key'; // Set your key
    spyOn(component.sortPipe, 'transform').and.callThrough();
    component.sort(array, key);
    expect(component.sortPipe.transform).toHaveBeenCalledWith(array, key);
  });
  it('should render certain elements in the template', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('selector')).toBe(null ); // Replace 'selector' with your actual selector
    // Add more assertions for other elements if needed
  });
  it('should initialize locationForm with default values', () => {
    expect(component.locationForm).toBeDefined();
    const defaultValues = {
      locationName: '',
      portType: '',
      country: '',
      state: '',
      masterType: '',
      CFS: false,
      ICD: false,
      Yard: false,
      agentBranch: '',
      name: '',
      code: '',
      portName: '',
      terminal: '',
      EDICode: '',
      address: '',
      contactPerson: '',
      email: '',
      primaryCountryCode: '',
      primaryNo: '',
      bondNo: '',
      creditDays: '',
      lineReference: true
    };
    expect(component.locationForm.value).toEqual(defaultValues);
  });

  it('should call exportAsExcelFile when exportAsExcelFile() is called', () => {
    spyOn(component, 'exportAsExcelFile');
    component.exportAsExcelFile();
    expect(component.exportAsExcelFile).toHaveBeenCalled();
  });

  
  
});
