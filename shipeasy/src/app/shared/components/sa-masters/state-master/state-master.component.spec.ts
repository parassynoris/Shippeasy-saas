import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StateMasterComponent } from './state-master.component';
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
import { of } from 'rxjs';
import { CommonService } from 'src/app/shared/services/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { Pipe, PipeTransform } from '@angular/core';
import { ApiSharedService } from '../../api-service/api-shared.service';
import { MastersSortPipe } from 'src/app/shared/util/mastersort';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


// Mock implementation of OrderByPipe
@Pipe({ name: 'orderBy' })
class MockOrderByPipe implements PipeTransform {
  transform(value: any[], key: string): any[] {
    return value; // Mock implementation: return the input array without sorting
  }
}
const commonFunctionsMock = {
  get: jasmine.createSpy('get').and.returnValue('')
};
describe('StateMasterComponent', () => {
  let component: StateMasterComponent;
  let fixture: ComponentFixture<StateMasterComponent>;
  let commonFunctionsMock: jasmine.SpyObj<CommonFunctions>;
  let translateServiceStub: Partial<TranslateService>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let commonServiceMock: jasmine.SpyObj<CommonService>;
  let notificationServiceMock: jasmine.SpyObj<NzNotificationService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;
  let cognitoServiceMock: jasmine.SpyObj<CognitoService>;
  beforeEach(async () => {
    translateServiceStub = {
      get: (key: string) => of(key),
      instant: jasmine.createSpy('instant').and.returnValue('translated text')
    };
    commonFunctionsMock = jasmine.createSpyObj('CommonFunctions', ['getAuthToken']);
    cognitoServiceMock = jasmine.createSpyObj('CognitoService', ['getUserDatails']);
    cognitoServiceMock.getUserDatails.and.returnValue(of()as any);
    await TestBed.configureTestingModule({
      declarations: [ StateMasterComponent,MastersSortPipe ],
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
        { provide: OrderByPipe, useClass: MockOrderByPipe },
        { provide: CommonFunctions, useValue: commonFunctionsMock },
        { provide: CognitoService, useValue: cognitoServiceMock },
        {provide:MastersSortPipe, useValue:MastersSortPipe},
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StateMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should call getData and getCountryList on ngOnInit', () => {
    spyOn(component, 'getData');
    spyOn(component, 'getCountryList');
    component.ngOnInit();
    expect(component.getData).toHaveBeenCalled();
    expect(component.getCountryList).toHaveBeenCalled();
  });
  it('should call getPaginationData with "next" if totalLength is greater than count', () => {
    component.toalLength = 20;
    component.count = 10;
    spyOn(component, 'getPaginationData');
    component.next();
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });
  
  it('should not call getPaginationData if totalLength is not greater than count', () => {
    component.toalLength = 10;
    component.count = 10;
    spyOn(component, 'getPaginationData');
    component.next();
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });
  it('should call getPaginationData with "prev" if page is greater than 0', () => {
    component.page = 2;
    spyOn(component, 'getPaginationData');
    component.prev();
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });
  
  it('should not call getPaginationData if page is not greater than 0', () => {
    component.page = 0;
    spyOn(component, 'getPaginationData');
    component.prev();
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });
  it('should set size, fromSize to 1, and call getData()', () => {
    const event = { target: { value: '20' } };
    spyOn(component, 'getData');
    component.filter(event);
    expect(component.size).toEqual('20' as any);
    expect(component.fromSize).toEqual(1);
    expect(component.getData).toHaveBeenCalled();
  });
  it('should clear search_state, search_country, and search_status, then call getData()', () => {
    // Arrange
    component.search_state = 'mockSearchState';
    component.search_country = 'mockSearchCountry';
    component.search_status = 'mockSearchStatus';
    spyOn(component, 'getData');
  
    // Act
    component.clear();
  
    // Assert
    expect(component.search_state).toEqual('');
    expect(component.search_country).toEqual('');
    expect(component.search_status).toEqual('');
    expect(component.getData).toHaveBeenCalled();
  });
    
});
