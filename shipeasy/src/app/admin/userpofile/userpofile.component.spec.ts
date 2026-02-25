import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserpofileComponent } from './userpofile.component';
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
import { of, throwError } from 'rxjs';
import { CommonService } from 'src/app/shared/services/common.service';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { Pipe, PipeTransform } from '@angular/core';
import autoTable from 'jspdf-autotable';
import { ApiSharedService } from 'src/app/shared/components/api-service/api-shared.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule,NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

// Mock implementation of OrderByPipe
@Pipe({ name: 'orderBy' })
class MockOrderByPipe implements PipeTransform {
  transform(value: any[], key: string): any[] {
    return value; // Mock implementation: return the input array without sorting
  }
}


describe('UserpofileComponent', () => {
  let component: UserpofileComponent;
  let fixture: ComponentFixture<UserpofileComponent>;
  let commonFunctionsMock: jasmine.SpyObj<CommonFunctions>;
  let translateServiceStub: Partial<TranslateService>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let commonServiceMock: jasmine.SpyObj<CommonService>;
  let notificationServiceMock: jasmine.SpyObj<NzNotificationService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;

  beforeEach(async(() => {
    translateServiceStub = {
      get: (key: string) => of(key),
      instant: jasmine.createSpy('instant').and.returnValue('translated text')
    };
    commonFunctionsMock = jasmine.createSpyObj('CommonFunctions', ['getAuthToken','getUserType','getUserType']);
    TestBed.configureTestingModule({
      declarations: [ UserpofileComponent ],
      imports: [HttpClientModule,RouterTestingModule,NzNotificationModule,SharedModule,TranslateModule.forRoot(),BrowserAnimationsModule,HttpClientTestingModule,FormsModule,ReactiveFormsModule,NgbModule , MatTableModule,NgMultiSelectDropDownModule,
        MatSelectModule,
        NoopAnimationsModule ] ,
      providers: [
        NzNotificationService,
        CognitoService, 
        OverlayModule ,
        { provide: CommonFunctions, useValue: jasmine.createSpyObj('CommonFunctions', ['yourMethod']) }, // Provide a mock for CommonFunctions
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
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserpofileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should retrieve state list successfully', () => {
    spyOn(component, 'getStateList');
    component.getStateList();
    expect(component.getStateList).toHaveBeenCalled();
  });
  
  it('should retrieve city list successfully', () => {
    spyOn(component, 'getCityList');
    component.getCityList();
    expect(component.getCityList).toHaveBeenCalled();
  });
  it('should upload image successfully', () => {
    const file = new File([''], 'sample.png', { type: 'image/png' });
    const event = { target: { files: [file] } };
    spyOn(component, 'uploadImage').and.callThrough();
    component.uploadImage(event);
    expect(component.uploadImage).toHaveBeenCalled();
    // Add more expectations as needed, such as checking the image URL or name after upload.
  });
 
  it('should return profileForm controls', () => {
    // Access the 'f' getter
    const controls = component.f;
    // Expect the returned value to be defined
    expect(controls).toBeDefined();
    // Expect the returned value to be an object
    expect(typeof controls).toBe('object');
    // Expect the returned value to have the same keys as profileForm controls
    expect(Object.keys(controls)).toEqual(Object.keys(component.profileForm.controls));
  });
  it('should reset submitted flag to false on onSave()', () => {
    // Set the submitted flag to true
    component.submitted = true;
    // Call the onSave() method
    component.onSave();
    // Expect the submitted flag to be false after calling onSave()
    expect(component.submitted).toBeFalse();
  });

  it('should call setValues() on reset()', () => {
    // Spy on the setValues() method
    spyOn(component, 'setValues');
    // Call the reset() method
    component.reset();
    // Expect the setValues() method to have been called
    expect(component.setValues).toHaveBeenCalled();
  });

  it('should handle onSave() when form is valid', () => {
    // Set the form to a valid state
    component.profileForm.patchValue({
      companyName: 'Test Company',
      firstname: 'John',
      lastname: 'Doe',
      email: 'john@example.com',
      primaryPhone: '1234567890'
      // Add more fields as needed
    });
    // Call the onSave() method
    const result = component.onSave();
    // Expect onSave() to return null
    expect(result).toBeNull();
    // Expect submitted flag to be false after onSave() is called
    expect(component.submitted).toBeFalse();
    // You can add more expectations here if onSave() has side effects, such as form submission
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
    getAgentDetails (){}
    getUserType() {
    }
  }
});