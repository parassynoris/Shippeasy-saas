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
import { VessalMasterComponent } from './vessal-master.component';

 
// Mock implementation of OrderByPipe
@Pipe({ name: 'orderBy' })
class MockOrderByPipe implements PipeTransform {
  transform(value: any[], key: string): any[] {
    return value; // Mock implementation: return the input array without sorting
  }
}
describe('VessalMasterComponent', () => {
  let component: VessalMasterComponent;
  let fixture: ComponentFixture<VessalMasterComponent>;
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
      declarations: [ VessalMasterComponent,MockOrderByPipe  ],
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
    fixture = TestBed.createComponent(VessalMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
 
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call alert with correct message when calling deleteclause()', () => {
    spyOn(window, 'alert');
    
    const dummyId = '123'; // Provide a dummy id
    component.deleteclause(dummyId);
  
    expect(window.alert).toHaveBeenCalledWith('Item deleted!');
  });
  
});