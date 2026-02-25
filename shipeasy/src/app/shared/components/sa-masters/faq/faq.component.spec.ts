import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqComponent } from './faq.component';
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
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { Pipe, PipeTransform } from '@angular/core';
import { ApiSharedService } from 'src/app/shared/components/api-service/api-shared.service';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonService } from 'src/app/services/common/common.service';

// Mock implementation of OrderByPipe
@Pipe({ name: 'orderBy' })
class MockOrderByPipe implements PipeTransform {
  transform(value: any[], key: string): any[] {
    return value; // Mock implementation: return the input array without sorting
  }
}

class MockCognitoService {
  getUserDatails() {}
}

class MockCommonFunctions {
  get() { }
  getAuthToken() {}
  getUserType (){}

}
describe('FaqComponent', () => {
  let component: FaqComponent;
  let fixture: ComponentFixture<FaqComponent>;
  let commonFunctionsMock: jasmine.SpyObj<CommonFunctions>;
  let translateServiceStub: Partial<TranslateService>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let commonServiceMock: jasmine.SpyObj<ApiService>;
  let notificationServiceMock: jasmine.SpyObj<NzNotificationService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;

  beforeEach(async () => {
    translateServiceStub = {
      get: (key: string) => of(key),
      instant: jasmine.createSpy('instant').and.returnValue('translated text')
    };
    commonServiceMock = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList', 'addToST', 'UpdateToST', 'deleteST']);
    commonFunctionsMock = jasmine.createSpyObj('CommonFunctions', ['getAuthToken']);
    await TestBed.configureTestingModule({
      declarations: [ FaqComponent ],
      imports: [HttpClientModule,RouterTestingModule,NzNotificationModule,SharedModule,TranslateModule.forRoot(),BrowserDynamicTestingModule,BrowserAnimationsModule] ,
      providers: [
        NzNotificationService,
        CognitoService, 
        OverlayModule ,
        { provide: CommonFunctions, useValue: jasmine.createSpyObj('CommonFunctions', ['yourMethod']) },
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
    fixture = TestBed.createComponent(FaqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle selection state when no FAQs are available', () => {
    component.faqdata = [];

    component.onSelectTopic(1);
    expect(component.isSelected).toBe(1);
  });
  it('should handle selection state with multiple FAQs', () => {
    const mockFaqs = [
      { faqId: '1', title: 'General', question: 'Q1', answer: 'A1' },
      { faqId: '2', title: 'General', question: 'Q2', answer: 'A2' }
    ];
    commonServiceMock.getSTList.and.returnValue(of({ documents: mockFaqs }));

    component.ngOnInit();
    component.onSelectTopic(1);
    expect(component.isSelected).toBe(1);

    component.onSelectTopic(2);
    expect(component.isSelected).toBe(2);
  });
  it('should return form controls when FAQForm is initialized', () => {
    // Simulate initialization of FAQForm with sample controls
    component.FAQForm.controls['categoryType'].setValue('General');
    component.FAQForm.controls['question'].setValue('Test Question');
    component.FAQForm.controls['answer'].setValue('Test Answer');

    // Call the f() property
    const formControls = component.f;

    // Expectations
    expect(formControls['categoryType'].value).toEqual('General');
    expect(formControls['question'].value).toEqual('Test Question');
    expect(formControls['answer'].value).toEqual('Test Answer');
  });
});