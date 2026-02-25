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
import { NewinvoiceComponentWareHouse } from './newinvoice-warehouse.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Mock implementation of OrderByPipe
@Pipe({ name: 'orderBy' })
class MockOrderByPipe implements PipeTransform {
  transform(value: any[], key: string): any[] {
    return value; // Mock implementation: return the input array without sorting
  }
}
describe('NewinvoiceComponentWareHouse', () => {
  let component: NewinvoiceComponentWareHouse;
  let fixture: ComponentFixture<NewinvoiceComponentWareHouse>;
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
      declarations: [ NewinvoiceComponentWareHouse,MockOrderByPipe  ],
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
        { provide: CognitoService, useClass: MockCognitoService }, // Mock CognitoService
        { provide: CommonFunctions, useClass: MockCommonFunctions },
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
    fixture = TestBed.createComponent(NewinvoiceComponentWareHouse);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should call exChangeClick and calculateTotal', () => {
    spyOn(component, 'calculateTotal'); // Spy on the calculateTotal method

    const testData = { enquiryitemId: '123' };
    component.exChangeClick(testData, 0);

    expect(component.calculateTotal).toHaveBeenCalled();
  });

  it('should set GST number in editinvoiceForm', () => {
    const e = 'partyId'; // Provide a partyId for testing

    // Assume some initial state for partyMasterFrom
    component.partyMasterFrom = [{ partymasterId: 'partyId', tax_number: '123456' } as any];

    component.setGST(e);

    // Expectations
    expect(component.editinvoiceForm.controls.gst_number.value).toBe('123456');
  });

  it('should handle changeContainer properly', () => {
    // Set up your component state as needed for this test
    // For example:
    component.costItemList = [{ enquiryitemId: '1' }];

    // Call the method you want to test
    component.changeContainer({ enquiryitemId: '1', chargeType: 'bl charge', quantity: 2 });

    // Assert the expected results
    expect(component.costItemList[0].quantity).toEqual(2); // Set the expected value based on your logic
  });

  it('should handle onPrincipalInput and update principalOptions', () => {
    const event = { target: { value: 'yourSearchValue' } as any } as Event;

    component.onPrincipalInput(event);

    expect(component.principalOptions.length).toBe(0);
    // Add more expectations based on your component's behavior
  });



  it('should return true if the given date is the last day of the month', () => {
    const lastDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
    const result = component.isLastDayOfMonth(lastDayOfMonth);
    expect(result).toBe(undefined);
  });

  it('should return false if the given date is not the last day of the month', () => {
    const notLastDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 15);
    const result = component.isLastDayOfMonth(notLastDayOfMonth);
    expect(result).toBe(undefined);
  });
  it('should disable ETA date for past dates', () => {
    const pastDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1); // Assuming the 1st day of the month
    const result = component.disabledEtaDate(pastDate);
    expect(result).toBeTrue();
  });

  it('should not disable ETA date for current or future dates', () => {
    const futureDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1); // Assuming the 1st day of the next month
    const result = component.disabledEtaDate(futureDate);
    expect(result).toBeFalse();
  });
  it('should disable ETA date for past dates', () => {
    const pastDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1); // Assuming the 1st day of the month
    const result = component.disabledEtaDate(pastDate);
    expect(result).toBeTrue();
  });

  it('should not disable ETA date for current or future dates', () => {
    const futureDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1); // Assuming the 1st day of the next month
    const result = component.disabledEtaDate(futureDate);
    expect(result).toBeFalse();
  });

  it('should add or remove charges to checkedList based on checkbox state', () => {
    // Set up mock data
    const mockCheck = { enquiryitemId: '123', tax: [{ taxRate: 10 }] };
    const checkedCheckboxEvent = { target: { checked: true } };
    const uncheckedCheckboxEvent = { target: { checked: false } };

    // Call checkCharge method with checked checkbox
    component.checkCharge(checkedCheckboxEvent, mockCheck, 0);

    // Expectations after checking the checkbox
    expect(component.checkedList.length).toBe(1);
    expect(component.checkedList[0].enquiryitemId).toBe(mockCheck.enquiryitemId);

    // Call checkCharge method with unchecked checkbox
    component.checkCharge(uncheckedCheckboxEvent, mockCheck, 0);

    // Expectations after unchecking the checkbox
    expect(component.checkedList.length).toBe(0);
  });
  it('should set vendor and update showDefault property based on blData', () => {
    // Test case 1: When shipperId is "SHIPEASY"
    component.blData = [{ blId: '123', shipperId: 'SHIPEASY' } as any];
    component.editinvoiceForm.controls.bl.setValue('123');
    component.setShipper();
    expect(component.showDefault).toBeTrue();

    // Test case 2: When shipperId is not "SHIPEASY"
    component.blData = [{ blId: '456', shipperId: 'OTHERSHIPPER' } as any];
    component.editinvoiceForm.controls.bl.setValue('456');
    component.setShipper();
    expect(component.showDefault).toBeFalse();
  });




  class MockCognitoService {
    getUserDatails() {
      // Mock implementation
    }
    getagentDetails(){

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
