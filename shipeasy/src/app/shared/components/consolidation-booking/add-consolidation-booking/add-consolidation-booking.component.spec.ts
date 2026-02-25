import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddConsolidationBookingComponent } from './add-consolidation-booking.component';
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
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { FormBuilder, Validators } from '@angular/forms';
import { CommonService } from 'src/app/services/common/common.service';

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
describe('AddConsolidationBookingComponent', () => {
  let component: AddConsolidationBookingComponent;
  let fixture: ComponentFixture<AddConsolidationBookingComponent>;
  let commonFunctionsMock: jasmine.SpyObj<CommonFunctions>;
  let translateServiceStub: Partial<TranslateService>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let commonServiceMock: jasmine.SpyObj<CommonService>;
  let notificationServiceMock: jasmine.SpyObj<NzNotificationService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;
  let FormBuilder :FormBuilder
  

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('CommonService', ['addToST']);
    translateServiceStub = {
      get: (key: string) => of(key),
      instant: jasmine.createSpy('instant').and.returnValue('translated text')
    };
    commonFunctionsMock = jasmine.createSpyObj('CommonFunctions', ['getAuthToken']);
    await TestBed.configureTestingModule({
      declarations: [ AddConsolidationBookingComponent ],
      imports: [HttpClientModule,RouterTestingModule,AutocompleteLibModule,NzNotificationModule,SharedModule,TranslateModule.forRoot(),BrowserDynamicTestingModule,BrowserAnimationsModule] ,
      providers: [
        NzNotificationService,
        CognitoService, 
        OverlayModule ,
        { provide: CommonFunctions, useValue: jasmine.createSpyObj('CommonFunctions', ['yourMethod']) }, // Provide a mock for CommonFunctions
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
    fixture = TestBed.createComponent(AddConsolidationBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.shipmentTypes = [
      { systemtypeId: 1, typeName: 'Land' },
      { systemtypeId: 2, typeName: 'Air' },
      { systemtypeId: 3, typeName: 'Ocean' }
    ];

    component.consolidatuonDetailsform = FormBuilder?.group({
      vehicleNo: [''],
      voyage: [''],
      plannedVessel: [''],
      flightNo: ['']
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set voyageId and call getBatchList on change voyage', () => {
    spyOn(component, 'getBatchList');
    const event = 'someVoyageId';
  
    expect(component.voyageId).toBe(event);
    expect(component?.getBatchList).toHaveBeenCalled();
  });
  it('should construct payload correctly for Ocean shipment', () => {
    component.consolidatuonDetailsform?.setValue({
      port: { portId: 1 },
      voyage: { voyageNumber: 'V123' },
      plannedVessel: { vesselId: 'VES123' },
      shipment_Type: 'Ocean',
      shipping_line: 'SL123',
      flightNo: '',
      vehicleNo: ''
    });
    component.types = 'Ocean';
    component.onShow();
    expect(component.qrData).toEqual(jasmine.any(Array)); // check if qrData is set properly
  });
  it('should construct payload correctly for Air shipment', () => {
    component.consolidatuonDetailsform?.setValue({
      port: { portId: 1 },
      voyage: '',
      plannedVessel: '',
      shipment_Type: 'Air',
      shipping_line: 'SL123',
      flightNo: 'FL123',
      vehicleNo: ''
    });
    component.types = 'Air';
    component.onShow();
    expect(component.qrData).toEqual(jasmine.any(Array)); // check if qrData is set properly
  });

  it('should set validators correctly for required fields', () => {
    component.consolidatuonDetailsform?.get('vehicleNo').setValidators([]);
    component.setremovevalidation('consolidatuonDetailsform', [{ name: 'vehicleNo', required: true }]);
    expect(component.consolidatuonDetailsform?.get('vehicleNo').validator).toBe(undefined);
  });
  it('should clear validators correctly for non-required fields', () => {
    component.consolidatuonDetailsform?.get('vehicleNo').setValidators([Validators.required]);
    component.setremovevalidation('consolidatuonDetailsform', [{ name: 'vehicleNo', required: false }]);
    expect(component.consolidatuonDetailsform?.get('vehicleNo').validator).toBeFalsy();
  });

  it('should clear portData array when setselect is called', () => {
    component.portData = [{ portId: 1, portName: 'Port1' }];
    component.setselect(2);

    expect(component.portData).toEqual([]);
  });
 
});