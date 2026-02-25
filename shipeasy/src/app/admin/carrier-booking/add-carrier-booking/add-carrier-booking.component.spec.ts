import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCarrierBookingComponent } from './add-carrier-booking.component';
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
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { Pipe, PipeTransform } from '@angular/core';
import autoTable from 'jspdf-autotable';
import { ApiSharedService } from 'src/app/shared/components/api-service/api-shared.service';
import { of } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormGroup } from '@angular/forms';
import { CommonService } from 'src/app/services/common/common.service';

// Mock implementation of OrderByPipe
@Pipe({ name: 'orderBy' })
class MockOrderByPipe implements PipeTransform {
  transform(value: any[], key: string): any[] {
    return value; // Mock implementation: return the input array without sorting
  }
}

describe('AddCarrierBookingComponent', () => {
  let component: AddCarrierBookingComponent;
  let fixture: ComponentFixture<AddCarrierBookingComponent>;
  let commonFunctionsMock: jasmine.SpyObj<CommonFunctions>;
  let translateServiceStub: Partial<TranslateService>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let commonServiceMock: jasmine.SpyObj<CommonService>;
  let notificationServiceMock: jasmine.SpyObj<NzNotificationService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;
  let commonService :CommonService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddCarrierBookingComponent ],
      imports: [HttpClientModule,RouterTestingModule,NzNotificationModule,SharedModule,TranslateModule.forRoot(),BrowserAnimationsModule,HttpClientTestingModule ] ,
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
    fixture = TestBed.createComponent(AddCarrierBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should set validators when checked is true', () => {
    component.updateValidators(true);

    expect(component.ConfirmationDetailsform.get('Validitydate').hasError('required')).toBe(true);
    expect(component.ConfirmationDetailsform.get('PickupLocation').hasError('required')).toBe(true);
    expect(component.ConfirmationDetailsform.get('OpenCutoff').hasError('required')).toBe(true);
    expect(component.ConfirmationDetailsform.get('CloseCutoff').hasError('required')).toBe(true);
    expect(component.ConfirmationDetailsform.get('SIcutoff').hasError('required')).toBe(true);
    expect(component.ConfirmationDetailsform.get('Handovercutoff').hasError('required')).toBe(true);
  });

  it('should remove validators when checked is false', () => {
    // First, set validators to true
    component.updateValidators(true);

    // Then, set validators to false
    component.updateValidators(false);

    expect(component.ConfirmationDetailsform.get('Validitydate').hasError('required')).toBe(false);
    expect(component.ConfirmationDetailsform.get('PickupLocation').hasError('required')).toBe(false);
    expect(component.ConfirmationDetailsform.get('OpenCutoff').hasError('required')).toBe(false);
    expect(component.ConfirmationDetailsform.get('CloseCutoff').hasError('required')).toBe(false);
    expect(component.ConfirmationDetailsform.get('SIcutoff').hasError('required')).toBe(false);
    expect(component.ConfirmationDetailsform.get('Handovercutoff').hasError('required')).toBe(false);
  });

  it('should add cargo details', () => {
    component.Addcargo();

    expect(component.cargo().length).toEqual(2);

    const cargoForm = component.cargo().at(0) as FormGroup;
    expect(cargoForm.get('Commodity').value).toEqual('');
    expect(cargoForm.get('CargoDescription').value).toEqual('');
    // Add more expectations for other form controls if needed
  });

  it('should remove cargo details', () => {
    component.Addcargo();
    component.Addcargo(); // Add two cargo details

    expect(component.cargo().length).toEqual(3);

    component.removeEmployee(0); // Remove the first cargo detail

    expect(component.cargo().length).toEqual(2);
  });

  it('should add dimensions for cargo', () => {
    component.Addcargo(); // Add cargo details first
    const cargoIndex = 0;

    component.dimension(cargoIndex).push(component.demensions());

    expect(component.dimension(cargoIndex).length).toEqual(1);

    const dimensionForm = component.dimension(cargoIndex).at(0) as FormGroup;
    expect(dimensionForm.get('PackageType1').value).toEqual('');
    expect(dimensionForm.get('pieces').value).toEqual('');
    // Add more expectations for other form controls if needed
  });
  it('should add dimension for cargo', () => {
    component.Adddimension(0);
  
    expect(component.dimension(0).length).toEqual(1);
  
    const dimensionForm = component.dimension(0).at(0) as FormGroup;
    expect(dimensionForm.get('PackageType1').value).toEqual('');
    expect(dimensionForm.get('pieces').value).toEqual('');
    // Add more expectations for other form controls if needed
  });
  
  it('should delete selected cargo details', () => {
    component.Addcargo();
    component.Addcargo();
    // Assuming one checkbox is checked
    component.delete();
  
    expect(component.cargo().length).toEqual(3);
  });
  
  it('should return true if any cargo detail is selected for deletion', () => {
    component.Addcargo();
    component.Addcargo();
    // Assuming one checkbox is checked
    const isDisabled = component.isDisableds();
  
    expect(isDisabled).toBe(false);
  });
  
  it('should delete selected dimensions for a cargo', () => {
    component.Addcargo();
    component.Adddimension(0);
    component.Adddimension(0);
    // Assuming one checkbox is checked
    component.deleted(0);
  
    expect(component.dimension(0).length).toEqual(2);
  });
  
  it('should return true if any dimension for a cargo is selected for deletion', () => {
    component.Addcargo();
    component.Adddimension(0);
    component.Adddimension(0);
    // Assuming one checkbox is checked
    const isDisabled = component.isDisabled(0);
  
    expect(isDisabled).toBe(false);
  });
  
  it('should return the index of the last row in the table', () => {
    component.addRow();
    component.addRow();
  
    const lastIndex = component.getIndexControl();
  
    expect(lastIndex).toEqual(2);
  });


  it('should set documentName and doc properties', () => {
    const event = {
      target: {
        value: 'C:\\fakepath\\test.doc',
        files: [new File([], 'test.doc')]
      }
    };

    component.onFileSelected(event);

    expect(component.docForm.get('documentName')?.value).toEqual(undefined );
    expect(component.doc).toEqual(event.target.files[0]);
  });

  it('should return false if any document has been uploaded', () => {
    component.documentTableData = [{ documentStatus: true }, { documentStatus: false }];

    const result = component.checkDocUploaded();

    expect(result).toBe(false);
  });

  it('should return true if no document has been uploaded', () => {
    component.documentTableData = [{ documentStatus: false }, { documentStatus: false }];

    const result = component.checkDocUploaded();

    expect(result).toBe(true);
  });
  it('should call getPaginationData with "next" when totalLength is greater than count in next()', () => {
    component.toalLength = 10;
    component.count = 5;

    spyOn(component, 'getPaginationData');

    component.next();

    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });

  it('should call getPaginationData with "prev" when page is greater than 0 in prev()', () => {
    component.page = 2;

    spyOn(component, 'getPaginationData');

    component.prev();

    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should update size and fromSize correctly in filter()', () => {
    const event = { target: { value: '10' as any} };
    component.fromSize = 5;

    component.filter(event as any);

    expect(component.size).toBe('10' as any);
    expect(component.fromSize).toBe(1); // Reset fromSize to 1
  });
  it('should return false if count is less than max', () => {
    component.bookedContainer = [{ ContainerName: 'container1', allocated: 2 }];
    const columnDef = { ContainerName: 'container1', Quantity: 5 };
    const element = { container1: 3 };
    
    const result = component.isDisabledContainer(columnDef, element);
  
    expect(result).toBeFalse();
  });
  
  it('should return true if count is equal to max', () => {
    component.bookedContainer = [{ ContainerName: 'container1', allocated: 5 }];
    const columnDef = { ContainerName: 'container1', Quantity: 5 };
    const element = { container1: 0 };
  
    const result = component.isDisabledContainer(columnDef, element);
  
    expect(result).toBeTrue();
  });
  
  it('should return true if count is greater than max', () => {
    component.bookedContainer = [{ ContainerName: 'container1', allocated: 6 }];
    const columnDef = { ContainerName: 'container1', Quantity: 5 };
    const element = { container1: 0 };
  
    const result = component.isDisabledContainer(columnDef, element);
  
    expect(result).toBeTrue();
  });

  
  it('should return Quantity if no booked containers exist', () => {
    component.bookedContainer = [];
    const ContainerName = { ContainerName: 'container1', Quantity: 5 };
  
    const result = component.getunallocated(ContainerName);
  
    expect(result).toBe(ContainerName.Quantity);
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
