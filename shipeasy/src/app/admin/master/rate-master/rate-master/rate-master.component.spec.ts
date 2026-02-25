
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RateMasterComponent } from './rate-master.component';
import { RouterTestingModule } from '@angular/router/testing';
import { NzNotificationModule, NzNotificationService } from 'ng-zorro-antd/notification';
import { CognitoService } from 'src/app/services/cognito.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { OverlayModule } from '@angular/cdk/overlay';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagingService } from 'src/app/services/messaging.service';
import { ApiService } from 'src/app/admin/principal/api.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { CommonService } from 'src/app/shared/services/common.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { Pipe, PipeTransform } from '@angular/core';
import { ApiSharedService } from 'src/app/shared/components/api-service/api-shared.service';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormArray } from '@angular/forms';
import { OrderByPipe } from 'src/app/shared/util/sort';

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

describe('RateMasterComponent', () => {
  let component: RateMasterComponent;
  let fixture: ComponentFixture<RateMasterComponent>;
  let httpTestingController: HttpTestingController;
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
    const commonServiceSpyObj = jasmine.createSpyObj('CommonService', ['getSTList', 'filterList', 'addToST']);

    await TestBed.configureTestingModule({
      declarations: [RateMasterComponent, MockOrderByPipe],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        NzNotificationModule,
        SharedModule,
        TranslateModule.forRoot(),
        BrowserDynamicTestingModule,
        BrowserAnimationsModule,
        OverlayModule
      ],
      providers: [
        { provide: CommonFunctions, useValue: commonFunctionsMock },
        { provide: Router, useValue: {} },
        { provide: MessagingService, useValue: jasmine.createSpyObj('MessagingService', ['methodName']) },
        { provide: TransactionService, useValue: translateServiceStub },
        { provide: CommonService, useValue: commonServiceSpyObj },
        { provide: ApiService, useValue: apiServiceMock },
        { provide: NzNotificationService, useValue: notificationServiceMock },
        { provide: NgbModal, useValue: modalServiceMock },
        { provide: CognitoService, useClass: MockCognitoService },
        { provide: OrderByPipe, useClass: MockOrderByPipe },
        { provide: ActivatedRoute, useValue: { paramMap: of({ get: () => '123' }) } }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RateMasterComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add a new row to tableRows on addRow()', () => {
    // Act
    component.addRow();

    // Assert
    const control = component.userTable.get('tableRows') as FormArray;
    expect(control.length).toBe(1); // Check if a new row is added
  });

  it('should populate tableRows with data on populateTableWithData()', () => {
    // Arrange
    const testData = [
      { chargeName: 'Charge 1', basis: 'Basis 1', qty: 2, price: 50, checkboxs: false },
      { chargeName: 'Charge 2', basis: 'Basis 2', qty: 1, price: 75, checkboxs: false }
    ];

    // Act
    component.populateTableWithData(testData);

    // Assert
    const control = component.userTable.get('tableRows') as FormArray;
    expect(control.length).toBe(2); // Check if tableRows has two rows
    expect(control.at(0).value).toEqual(testData[0]); // Check if data is correctly populated
    expect(control.at(1).value).toEqual(testData[1]);
  });

  it('should return correct FormArray for tableRows on getFormControls', () => {
    // Act
    const control = component.getFormControls;

    // Assert
    expect(control).toBeTruthy();
    expect(control instanceof FormArray).toBeTrue();
    expect(control.length).toBe(0); // Assuming initially there are no rows
  });
  it('should call getPaginationData with "next" when next() is called and toalLength is greater than count', () => {
    // Arrange
    component.toalLength = 10;
    component.count = 5;
    spyOn(component, 'getPaginationData');

    // Act
    component.next();

    // Assert
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });

  it('should not call getPaginationData when next() is called and toalLength is less than or equal to count', () => {
    // Arrange
    component.toalLength = 5;
    component.count = 5;
    spyOn(component, 'getPaginationData');

    // Act
    component.next();

    // Assert
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });

  it('should call getPaginationData with "prev" when prev() is called and page is greater than 0', () => {
    // Arrange
    component.page = 1;
    spyOn(component, 'getPaginationData');

    // Act
    component.prev();

    // Assert
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should not call getPaginationData when prev() is called and page is 0', () => {
    // Arrange
    component.page = 0;
    spyOn(component, 'getPaginationData');

    // Act
    component.prev();

    // Assert
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });
});
