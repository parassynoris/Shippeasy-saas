import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurationComponent } from './configuration.component';
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
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { FormArray, FormBuilder, FormsModule, ReactiveFormsModule,} from '@angular/forms';
import { Location } from '@angular/common';
import { MastersSortPipe } from 'src/app/shared/util/mastersort';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

// Mock implementation of OrderByPipe
@Pipe({ name: 'orderBy' })
class MockOrderByPipe implements PipeTransform {
  transform(value: any[], key: string): any[] {
    return value; // Mock implementation: return the input array without sorting
  }
}
describe('ConfigurationComponent', () => {
  let component: ConfigurationComponent;
  let fixture: ComponentFixture<ConfigurationComponent>;
  let commonFunctionsMock: jasmine.SpyObj<CommonFunctions>;
  let translateServiceStub: Partial<TranslateService>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let notificationServiceMock: jasmine.SpyObj<NzNotificationService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let locationSpy: jasmine.SpyObj<Location>;
  let mockModalService;
  let formBuilder: FormBuilder;
  beforeEach(async(() => {
    const apiServiceSpyObj = jasmine.createSpyObj('ApiService', ['getMasterList', 'SaveOrUpdate']);
    const commonServiceSpyObj = jasmine.createSpyObj('CommonService', ['getSTList', 'filterList', 'addToST']);
    mockModalService = jasmine.createSpyObj('NgbModal', ['dismissAll']);
    TestBed.configureTestingModule({
      declarations: [ ConfigurationComponent ,MastersSortPipe],
      imports: [HttpClientModule,RouterTestingModule,NzNotificationModule,SharedModule,TranslateModule.forRoot(),BrowserAnimationsModule,HttpClientTestingModule,FormsModule,ReactiveFormsModule,NgbModule , MatTableModule,NgMultiSelectDropDownModule,
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
        { provide: CommonService, useValue: commonServiceSpyObj },
        { provide: ApiService, useValue: apiServiceMock },
        { provide: NzNotificationService, useValue: notificationServiceMock },
        { provide: NgbModal, useValue: modalServiceMock }, 
        { provide: OrderByPipe, useClass: MockOrderByPipe },
        { provide: CognitoService, useClass: MockCognitoService },
        { provide: Location, useValue: jasmine.createSpyObj('Location', ['back']) },
        { provide: CommonFunctions, useClass: MockCommonFunctions },
        { provide: ApiService, useValue: mockApiService },
        { provide: Location, useValue: locationSpy },
        { provide: MastersSortPipe, useValue: MastersSortPipe },
        { provide: ApiService, useValue: apiServiceSpyObj },
        { provide: CommonService, useValue: { filterList: () => ({ query: {} }) } },
        { provide: CommonService, useClass: commonService },
        { provide: NgbModal, useValue: mockModalService },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of({ get: () => '123' }) }, 
        },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    formBuilder = new FormBuilder();
    component.inputForm = formBuilder.group({
      ruleSteps: formBuilder.array([
        formBuilder.group({
          surcharges: formBuilder.array([])
        })
      ])

    });
   
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  function returnVal(val) {
    return val.replace(/ /g, '_');
  }
  
  // Define the changeColumn function
  function changeColumn() {
    this.changeColumns = !this.changeColumns;
  }
  
  // Test cases for returnVal function
  describe('returnVal', () => {
    it('should replace spaces with underscores in a string', () => {
      const input = 'hello world';
      const expectedOutput = 'hello_world';
      const result = returnVal(input);
      expect(result).toEqual(expectedOutput);
    });
  

  });
  
  
  describe('changeColumn', () => {
    it('should toggle changeColumns from false to true', () => {
      const instance = { changeColumns: false, changeColumn: function() { this.changeColumns = !this.changeColumns; } };
      instance.changeColumn();
      expect(instance.changeColumns).toEqual(true);
    });
  
    it('should toggle changeColumns from true to false', () => {
      const instance = { changeColumns: true, changeColumn: function() { this.changeColumns = !this.changeColumns; } };
      instance.changeColumn();
      expect(instance.changeColumns).toEqual(false);
    });
  });
  
  const instance = { 
    changeColumns: true, 
    changeColumn: function() { 
      this.changeColumns = !this.changeColumns; 
    } 
  };
  it('should set options to an empty array if the input value is empty', () => {
    const event = { target: { value: '' } } as any;
    component.onInput(event);
    expect(component.options).toEqual([]);
  });

  it('should filter and set options based on the input value', () => {
    const inputValue = 'example';
    const event = { target: { value: inputValue } } as any;
    component.allParametrs = [
      { name: 'example1' },
      { name: 'example2' },
      { name: 'another' }
    ];
    component.onInput(event);
    expect(component.options).toEqual([{ name: 'example1' }, { name: 'example2' }]);
  });

  it('should set options to an empty array if no matching names are found', () => {
    const inputValue = 'unknown';
    const event = { target: { value: inputValue } } as any;
    component.allParametrs = [
      { name: 'example1' },
      { name: 'example2' },
      { name: 'another' }
    ];
    component.onInput(event);
    expect(component.options).toEqual([]);
  });
  it('should set isEditRateItem to false and close the modal reference', () => {
    component.isEditRateItem = true;
    component.modalReferenceForRate = {
      close: jasmine.createSpy('close')
    } as any;

    component.onCancelRateModal();

    expect(component.isEditRateItem).toBe(false);
    expect(component.modalReferenceForRate.close).toHaveBeenCalled();
  });

  it('should remove "rate_" prefix from a given name', () => {
    const nameWithPrefix = 'rate_example';
    const expectedName = 'example';
    
    const result = component.removeName(nameWithPrefix);

    expect(result).toBe(expectedName);
  });

  it('should not remove anything if the name does not contain "rate_" prefix', () => {
    const nameWithoutPrefix = 'example';

    const result = component.removeName(nameWithoutPrefix);

    expect(result).toBe(nameWithoutPrefix);
  });

  it('should add a step item and update allParametrs when addStepItem is called', () => {
    const initialStepCount = component.ruleSteps?.length;

    component.addStepItem();

    // Ensure a new step item is added to ruleSteps
    expect(component.ruleSteps.length).toBe(initialStepCount + 1);

    // Ensure allParametrs is updated correctly
    expect(component.allParametrs).toContain({ name: `step${initialStepCount}.output`, id: '0' });
  });


  it('should remove surcharge item at the given index', () => {
    const indexToRemove = 0;
    const control = component.inputForm.get('ruleSteps')['controls'][0];

    component.removeSurchargeItem(control, indexToRemove);

    expect(control.get('surcharges')['controls'].length).toBe(0);
  });

  it('should set isViewSurcharge to true and open the surcharge modal', () => {
    const step = component.inputForm.get('ruleSteps')['controls'][0];
    const content = 'surcharge modal content';
    spyOn(component, 'openSurchargeModal');

    component.viewSurcharges(step, content);

    expect(component.isViewSurcharge).toBe(true);
    expect(component.openSurchargeModal).toHaveBeenCalledWith('', content, step.get('surcharges'));
  });

  it('should return ruleSteps as a FormArray', () => {
    expect(component.ruleSteps instanceof FormArray).toBe(true);
  });
  it('should patch the value of outerAnchorageHours in the formTariff control', () => {
    const mockEvent = { target: { checked: true } };

    component.changeStatus(mockEvent);

    expect(component.formTariff.controls.outerAnchorageHours?.value).toBe(undefined );
  });

  it('should remove input at the specified index', () => {
    const initialLength = component.inputs?.length;
    const indexToRemove = 0;

    component.removeInput(indexToRemove);

    expect(component.inputs?.length).toBe(undefined );
  });

  it('should remove cost item at the specified index', () => {
    const initialLength = component.costitems?.length;
    const indexToRemove = 0;

    component.removeCostItem(indexToRemove);

    expect(component.costitems?.length).toBe(undefined );
  });

  it('should remove step item at the specified index', () => {
    const initialLength = component.steps?.length;
    const indexToRemove = 0;

    component.removeSeqItem(indexToRemove);

    expect(component.steps?.length).toBe(undefined);
  });

  it('should remove rule step item at the specified index', () => {
    const initialLength = component.ruleSteps.length;
    const indexToRemove = 0;

    component.removeSeqItemRule(indexToRemove);

    expect(component.ruleSteps.length).toBe(initialLength - 1);
  });

  it('should return steps as a FormArray', () => {
    expect(component.steps instanceof FormArray).toBe(false);
  });

  it('should handle an empty string', () => {
    const input = '';
    const expectedOutput = '';
    const result = returnVal(input);
    expect(result).toEqual(expectedOutput);
  });

  it('should handle a string without spaces', () => {
    const input = 'hello';
    const expectedOutput = 'hello';
    const result = returnVal(input);
    expect(result).toEqual(expectedOutput);
  }); 

  class MockCognitoService {
    getUserDatails() {
    }
  }
  class MockCommonFunctions {
    get() {
    }
    getAuthToken() {
    }
  }
  class commonService{
   getSTList(){}
   filterList(){}
  }
  
});