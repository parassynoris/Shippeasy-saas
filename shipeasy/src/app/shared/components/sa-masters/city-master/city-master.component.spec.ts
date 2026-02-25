import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CityMasterComponent } from './city-master.component';
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
import { MastersSortPipe } from 'src/app/shared/util/mastersort';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Mock implementation of OrderByPipe
@Pipe({ name: 'orderBy' })
class MockOrderByPipe implements PipeTransform {
  transform(value: any[], key: string): any[] {
    return value; // Mock implementation: return the input array without sorting
  }
}
describe('CityMasterComponent', () => {
  let component: CityMasterComponent;
  let fixture: ComponentFixture<CityMasterComponent>;
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
      declarations: [ CityMasterComponent,MockOrderByPipe  ],
      imports: [HttpClientModule,RouterTestingModule,NzNotificationModule,SharedModule,TranslateModule.forRoot(),BrowserAnimationsModule ] ,
      providers: [
        NzNotificationService,
        CognitoService, 
        OverlayModule ,
        MastersSortPipe,
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
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CityMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should call getPaginationData("next") if total length is greater than count in next()', () => {
    component.toalLength = 20;
    component.count = 10;

    spyOn(component, 'getPaginationData');

    component.next();

    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });

  it('should not call getPaginationData("next") if total length is not greater than count in next()', () => {
    component.toalLength = 10;
    component.count = 10;

    spyOn(component, 'getPaginationData');

    component.next();

    expect(component.getPaginationData).not.toHaveBeenCalled();
  });

  it('should call getPaginationData("prev") if page is greater than 0 in prev()', () => {
    component.page = 2;

    spyOn(component, 'getPaginationData');

    component.prev();

    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should not call getPaginationData("prev") if page is not greater than 0 in prev()', () => {
    component.page = 0;

    spyOn(component, 'getPaginationData');

    component.prev();

    expect(component.getPaginationData).not.toHaveBeenCalled();
  });

  it('should update size and call getData() in filter()', () => {
    const event = { target: { value: 20 } };

    spyOn(component, 'getData');

    component.filter(event);

    expect(component.size).toEqual(20);
    expect(component.fromSize).toEqual(1);
    expect(component.getData).toHaveBeenCalled();
  });
  it('should clear search parameters and call getData() in clear()', () => {
    // Set some initial search parameters
    component.search_city = 'test city';
    component.search_state = 'test state';
    component.search_country = 'test country';
    component.search_status = 'test status';
  
    spyOn(component, 'getData');
  
    // Call the clear method
    component.clear();
  
    // Expect search parameters to be cleared
    expect(component.search_city).toEqual('');
    expect(component.search_state).toEqual('');
    expect(component.search_country).toEqual('');
    expect(component.search_status).toEqual('');
  
    // Expect getData() method to be called
    expect(component.getData).toHaveBeenCalled();
  });
 

  it('should set selectedState correctly in stateSelect()', () => {
    // Mock data for the state list
    const stateListData:any= [
      { stateId: "1", stateName: "State 1" },
      { stateId: "2", stateName: "State 2" },
      ];
    component.stateList = stateListData;

    // Mock data for the selected state
    const selectedStateId = "2";
    const eventData = { target: { value: selectedStateId } };

    // Call the method to select a state
    component.stateSelect(eventData);

    // Expect the selectedState to be set correctly
    expect(component.selectedState).toEqual(stateListData.find(state => state.stateId === selectedStateId));
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