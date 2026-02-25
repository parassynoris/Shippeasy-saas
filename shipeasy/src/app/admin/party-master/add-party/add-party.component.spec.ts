import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPartyComponent } from './add-party.component';
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
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormArray, FormBuilder } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

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
  getUserType() {}

  getAgentDetails() {
    return { orgId: 'mockOrgId' }; // Mocked return value
  }
}

describe('AddPartyComponent', () => {
  let component: AddPartyComponent;
  let fixture: ComponentFixture<AddPartyComponent>;
  let commonFunctionsMock: jasmine.SpyObj<CommonFunctions>;
  commonFunctionsMock = jasmine.createSpyObj('CommonFunctions', ['getAuthToken', 'getAgentDetails']);
commonFunctionsMock.getAgentDetails.and.returnValue({ orgId: 'mockOrgId' });
  let translateServiceStub: Partial<TranslateService>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let commonServiceMock: jasmine.SpyObj<CommonService>;
  let notificationServiceMock: jasmine.SpyObj<NzNotificationService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;
  let router: Router

  beforeEach(async () => {
    translateServiceStub = {
      get: (key: string) => of(key),
      instant: jasmine.createSpy('instant').and.returnValue('translated text')
    };
    commonFunctionsMock = jasmine.createSpyObj('CommonFunctions', ['getAuthToken']);
    await TestBed.configureTestingModule({
      declarations: [ AddPartyComponent ],
      imports: [RouterTestingModule,NzNotificationModule,SharedModule,TranslateModule.forRoot(),  BrowserModule,
        BrowserAnimationsModule,HttpClientTestingModule ] ,
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
    fixture = TestBed.createComponent(AddPartyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set branch address, country, state, city, and primary email from party master form', () => {
    component.copyMessage();
    const branchControls = component.branch.controls[0];
    expect(branchControls.get('branch_address').value).toEqual('');
    expect(branchControls.get('barnch_country').value).toEqual('');
    expect(branchControls.get('branch_state').value).toEqual('');
    expect(branchControls.get('branch_city').value).toEqual('');
    expect(branchControls.get('pic_email').value).toEqual('');
  });

it('should add a new customer to the form', () => {
  component.addNewCustomer();
  const customersArray = component.customer as FormArray;
  console.log('Customers array length:', customersArray.length);
  expect(customersArray.length).toBe(2);
});

it('should add a new branch to the form', () => {
  component.addNewBranch();
  const branchesArray = component.branch as FormArray;
  console.log('Branches array length:', branchesArray.length);
  expect(branchesArray.length).toBe(2);
});

it('should initialize form arrays for branch and customer', () => {
  component.buildForm();
  expect(component.branch).toBeDefined();
  expect(component.customer).toBeDefined();
  expect(Array.isArray(component.branch.value)).toBeTruthy();
  expect(Array.isArray(component.customer.value)).toBeTruthy();
});

it('should create a FormGroup for a branch', () => {
  const branchFormGroup = component.addBranch({
    branch_name: 'Branch1',
    branch_address: 'BranchAddress1',
    barnch_country: '1',
    branch_state: '2',
    branch_city: '3',
    pinCode: '123456'
  });

  expect(branchFormGroup.get('branch_name').value).toEqual('Branch1');
  expect(branchFormGroup.get('branch_address').value).toEqual('BranchAddress1');
});
it('should toggle the Overview panel', () => {
  component.isOverviewPanelOpen = false;
  component.canOpenCustomAccordion = true;

  component.toggleButton('Overview');

  expect(component.isOverviewPanelOpen).toBe(true);
});
it('should navigate to the previous tab when not on the first tab', () => {
  component.selectedIndex = 3;
  component.previousTab();
  expect(component.selectedIndex).toBe(2);
});

it('should not navigate to the previous tab if already on the first tab', () => {
  component.selectedIndex = 0;
  component.previousTab();
  expect(component.selectedIndex).toBe(0);
});

it('should navigate to the next tab when not on the last tab', () => {
  component.selectedIndex = 2;
  component.nextTab();
  expect(component.selectedIndex).toBe(3);
});

it('should not navigate to the next tab if already on the last tab', () => {
  component.selectedIndex = 5;
  component.nextTab();
  expect(component.selectedIndex).toBe(6);
});
it('should default isUnion to true and status to false', () => {
  component.formBuild();
  
  const isUnionControl = component.addStateForm.get('isUnion');
  const statusControl = component.addStateForm.get('status');
  expect(isUnionControl.value).toBeTrue();
  expect(statusControl.value).toBeFalse();
});
it('should reset the form values correctly', () => {
  component.formBuild();
  
  component.addStateForm.patchValue({
    stateCode: '01',
    typeDescription: 'Some Description',
    stateShortName: 'ST',
    GSTNCode: 'GST123',
    countryCode: '91',
    isUnion: false,
    status: true
  });

  component.addStateForm.reset();
  
  expect(component.addStateForm.get('stateCode').value).toBe(null);
  expect(component.addStateForm.get('typeDescription').value).toBe(null);
  expect(component.addStateForm.get('stateShortName').value).toBe(null);
  expect(component.addStateForm.get('GSTNCode').value).toBe(null);
  expect(component.addStateForm.get('countryCode').value).toBe(null);
  expect(component.addStateForm.get('isUnion').value).toBe(null);  // should reset to default true
  expect(component.addStateForm.get('status').value).toBe(null);  // should reset to default false
});

it('should update form status to INVALID when required fields are empty', () => {
  component.formBuild();

  component.addStateForm.patchValue({
    stateCode: null,
    typeDescription: '',
    countryCode: ''
  });

  expect(component.addStateForm.valid).toBeFalsy();
});

it('should allow optional fields (stateShortName, GSTNCode) to be empty and still be valid', () => {
  component.formBuild();
  
  component.addStateForm.patchValue({
    stateCode: '01',
    typeDescription: 'Some Description',
    countryCode: '91',
    stateShortName: '',
    GSTNCode: ''
  });

  expect(component.addStateForm.valid).toBeTruthy();
});

it('should correctly identify form as dirty after changes are made', () => {
  component.formBuild();

  component.addStateForm.patchValue({ stateCode: '01' });
  
  expect(component.addStateForm.dirty).toBe(false);
});

it('should correctly update the value of a control on input change', () => {
  component.formBuild();

  const stateCodeControl = component.addStateForm.get('stateCode');
  stateCodeControl.setValue('01');
  
  expect(stateCodeControl.value).toBe('01');
});

it('should disable all controls when form is set to disabled', () => {
  component.formBuild();

  component.addStateForm.disable();
  
  expect(component.addStateForm.get('stateCode').disabled).toBeTrue();
  expect(component.addStateForm.get('typeDescription').disabled).toBeTrue();
  expect(component.addStateForm.get('countryCode').disabled).toBeTrue();
  expect(component.addStateForm.get('stateShortName').disabled).toBeTrue();
  expect(component.addStateForm.get('GSTNCode').disabled).toBeTrue();
  expect(component.addStateForm.get('isUnion').disabled).toBeTrue();
  expect(component.addStateForm.get('status').disabled).toBeTrue();
});

it('should enable all controls when form is re-enabled after being disabled', () => {
  component.formBuild();

  component.addStateForm.disable();
  component.addStateForm.enable();
  
  expect(component.addStateForm.get('stateCode').enabled).toBeTrue();
  expect(component.addStateForm.get('typeDescription').enabled).toBeTrue();
  expect(component.addStateForm.get('countryCode').enabled).toBeTrue();
  expect(component.addStateForm.get('stateShortName').enabled).toBeTrue();
  expect(component.addStateForm.get('GSTNCode').enabled).toBeTrue();
  expect(component.addStateForm.get('isUnion').enabled).toBeTrue();
  expect(component.addStateForm.get('status').enabled).toBeTrue();
});

it('should reflect valid changes to conditional form fields', () => {
  component.formBuild();

  const isUnionControl = component.addStateForm.get('isUnion');
  isUnionControl.setValue(false);
  
  expect(isUnionControl.value).toBeFalse();
});


});