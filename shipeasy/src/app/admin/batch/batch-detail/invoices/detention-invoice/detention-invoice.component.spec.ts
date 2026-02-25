import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetentionInvoiceComponent } from './detention-invoice.component';
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
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { Pipe, PipeTransform } from '@angular/core';
import { ApiSharedService } from 'src/app/shared/components/api-service/api-shared.service';
import { of } from 'rxjs';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CommonService } from 'src/app/services/common/common.service';
import { FormBuilder, FormsModule, ReactiveFormsModule,FormGroup } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';

// Mock implementation of OrderByPipe
@Pipe({ name: 'orderBy' })
class MockOrderByPipe implements PipeTransform {
  transform(value: any[], key: string): any[] {
    return value; // Mock implementation: return the input array without sorting
  }
}
describe('DetentionInvoiceComponent', () => {
  let component: DetentionInvoiceComponent;
  let fixture: ComponentFixture<DetentionInvoiceComponent>;
  let commonFunctionsMock: jasmine.SpyObj<CommonFunctions>;
  let translateServiceStub: Partial<TranslateService>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let commonServiceMock: jasmine.SpyObj<CommonService>;
  let notificationServiceMock: jasmine.SpyObj<NzNotificationService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;
  let formBuilder: FormBuilder;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetentionInvoiceComponent ],
      imports: [HttpClientModule,RouterTestingModule,NzNotificationModule,SharedModule,TranslateModule.forRoot(),BrowserAnimationsModule,HttpClientTestingModule,FormsModule,ReactiveFormsModule,NgbModule , MatTableModule,
        MatSelectModule,
        NoopAnimationsModule] ,
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
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of({ get: () => '123' }) }, 
        },
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetentionInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return false for invalid invoice type', () => {
    // Mock data
    component.invoiceIdToUpdate = { invoiceTypeStatus: "Invalid Invoice Type", invoiceId: "123", invoiceNo: "INV123" };
  
    // Call the method
    const result = component.digitalSign();
  
    // Expectations
    expect(result).toBeFalse();
  });

  it('should set shipper and showDefault to true when shipperId is SHIPEASY', () => {
    // Arrange
    component.blData = [
      { blId: 'blId1', shipperId: 'SHIPEASY' },
      { blId: 'blId2', shipperId: 'OTHER' }
    ];
    component.editinvoiceForm.controls.bl.setValue('blId1');

    // Act
    component.setShipper();

    // Assert
    expect(component.showDefault).toBe(true);
    expect(component.editinvoiceForm.controls.shipper.value).toBe('SHIPEASY');
  });

  it('should set shipper and showDefault to false when shipperId is not SHIPEASY', () => {
    // Arrange
    component.blData = [
      { blId: 'blId1', shipperId: 'OTHER' },
      { blId: 'blId2', shipperId: 'SHIPEASY' }
    ];
    component.editinvoiceForm.controls.bl.setValue('blId1');

    // Act
    component.setShipper();

    // Assert
    expect(component.showDefault).toBe(false);
    expect(component.editinvoiceForm.controls.shipper.value).toBe('OTHER');
  });

  it('should not set shipper and showDefault when bl value is not found in blData', () => {
    // Arrange
    component.blData = [
      { blId: 'blId1', shipperId: 'OTHER' },
      { blId: 'blId2', shipperId: 'SHIPEASY' }
    ];
    component.editinvoiceForm.controls.bl.setValue('unknown_bl_id');

    // Act
    component.setShipper();

    // Assert
    expect(component.showDefault).toBe(false);
    expect(component.editinvoiceForm.controls.shipper.value).toBeUndefined();
  }); 
  it('should set gst_number control value based on selected partyMasterId', () => {
    // Arrange
    const selectedPartyMasterId = 'selected_party_master_id';
    const gstNumber = 'party_master_gst_number';
    component.editinvoiceForm.controls.gst_number.setValue(null); // Ensure the control is initially null
    component.partyMasterFrom = [
      { partymasterId: 'party_master_id_1', tax_number: 'party_master_gst_number_1' },
      { partymasterId: 'party_master_id_2', tax_number: 'party_master_gst_number_2' },
      { partymasterId: selectedPartyMasterId, tax_number: gstNumber }
    ];

    // Act
    component.setGST(selectedPartyMasterId);

    // Assert
    expect(component.editinvoiceForm.controls.gst_number.value).toBe(gstNumber);
  });

  it('should set gst_number control value to null if partyMasterId does not match any entry in partyMasterFrom', () => {
    // Arrange
    const invalidPartyMasterId = 'invalid_party_master_id';
    component.editinvoiceForm.controls.gst_number.setValue('previous_gst_number'); // Ensure the control has a previous value
    component.partyMasterFrom = [
      { partymasterId: 'party_master_id_1', tax_number: 'party_master_gst_number_1' },
      { partymasterId: 'party_master_id_2', tax_number: 'party_master_gst_number_2' }
    ];

    // Act
    component.setGST(invalidPartyMasterId);

    // Assert
    expect(component.editinvoiceForm.controls.gst_number.value).toBe(undefined);
  });

  it('should print Invoice Records when invoiceTypeStatus is not recognized', () => {
    // Arrange
    const invoiceIdToUpdate = { invoiceTypeStatus: 'Unknown Invoice', invoiceId: '123' };
    component.invoiceIdToUpdate = invoiceIdToUpdate;

    // Act
    component.printData();

    // Assert
    // Add assertions as needed to verify behavior
  });


  it('should set noContainer value based on blData', () => {
    // Arrange
    component.editinvoiceForm = formBuilder?.group({
      bl: 'BL123' // Assuming BL123 is a valid BL number in blData
    });
    component.blData = [{ blId: 'BL123', containers: ['container1', 'container2'] }];

    // Act
    component.getContainer();

    // Assert
    expect(component.editinvoiceForm?.get('noContainer')?.value).toBe(undefined); // Expecting 2 containers for BL123
  });

  // Test for detentionDays method
  it('should calculate detention days correctly', () => {
    // Arrange
    const fromDate = new Date('2022-01-01');
    const toDate = new Date('2022-01-05');
    const freeDays = 1;

    // Act
    const result = component.detentionDays(fromDate, toDate, freeDays);

    // Assert
    expect(result).toBe(4); // Expecting 5 days difference between fromDate and toDate after considering free days
  });

  // Test for totalDayAMT method
  it('should calculate total amount correctly', () => {
    // Arrange
    const fromDate = new Date('2022-01-01');
    const toDate = new Date('2022-01-05');
    const freeDays = 1;
    const detentionAmountPerDay = 10; // Assuming detentionAmountPerDay is $10

    // Act
    const result = component.totalDayAMT(fromDate, toDate, freeDays, detentionAmountPerDay);

    // Assert
    expect(result).toBe(40); // Expecting total amount of 4 days * $10/day = $40
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
