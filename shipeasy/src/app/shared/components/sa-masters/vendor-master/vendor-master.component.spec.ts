import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorMasterComponent } from './vendor-master.component';
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
import { MastersSortPipe } from 'src/app/shared/util/mastersort';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


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
describe('VendorMasterComponent', () => {
  let component: VendorMasterComponent;
  let fixture: ComponentFixture<VendorMasterComponent>;
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
      
      declarations: [ VendorMasterComponent ,MastersSortPipe],
      imports: [HttpClientModule,RouterTestingModule,NzNotificationModule,SharedModule,TranslateModule.forRoot(),BrowserAnimationsModule ] ,
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
        { provide: CommonFunctions, useClass: MockCommonFunctions },
        { provide: CognitoService, useClass: MockCognitoService }, 
        {provide:MastersSortPipe, useValue:MastersSortPipe},
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should mark Vendor_Name field as invalid if empty', () => {
    const vendorNameControl = component.vendorForm.get('Vendor_Name');
    vendorNameControl.setValue('');
    expect(vendorNameControl.valid).toBeFalsy();
  });
  
  it('should mark Pan_No field as invalid if empty', () => {
    const panNoControl = component.vendorForm.get('Pan_No');
    panNoControl.setValue('');
    expect(panNoControl.valid).toBeFalsy();
  });
  it('should navigate to next page when next() is called and there are more records', () => {
    component.toalLength = 20; // Set total length to simulate more records available
    component.count = 10; // Set count to simulate records displayed on current page
    component.page = 1; // Set page to simulate current page

    spyOn(component, 'getPaginationData'); // Spy on the getPaginationData method

    component.next();

    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });

  it('should navigate to previous page when prev() is called and current page is not the first one', () => {
    component.page = 2; // Set page to simulate not the first page

    spyOn(component, 'getPaginationData'); // Spy on the getPaginationData method

    component.prev();

    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should update the size and reload data when filter() is called', () => {
    const event = { target: { value: '20' } }; // Mock event with target value set to '20'

    spyOn(component, 'getPartyList'); // Spy on the getPartyList method

    component.filter(event);

    expect(component.size).toBe('20' as any); // Check if size is updated
    expect(component.fromSize).toBe(1); // Check if fromSize is reset to 1
    expect(component.getPartyList).toHaveBeenCalled(); // Check if getPartyList is called
  });


  it('should initialize form with default values', () => {
    expect(component.vendorForm).toBeDefined();
    expect(component.vendorForm.controls['Vendor_Name'].value).toBe('');
  });

  it('should have required validation for Vendor_Name', () => {
    const vendorNameControl = component.vendorForm.controls['Vendor_Name'];
    vendorNameControl.setValue('');
    expect(vendorNameControl.valid).toBeFalsy();
    expect(vendorNameControl.errors).toEqual({ required: true });
  });

  it('should call getPartyList on ngOnInit', () => {
    spyOn(component, 'getPartyList');
    component.ngOnInit();
    expect(component.getPartyList).toHaveBeenCalled();
  });

});
