import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ApiService } from 'src/app/admin/principal/api.service';
import { CommonService } from 'src/app/services/common/common.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Pipe, PipeTransform, forwardRef } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { RouterModule } from '@angular/router';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { CreateDocComponent } from './create-doc.component';

@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    return value;
  }
}

describe('CreateDocComponent', () => {
  let component: CreateDocComponent;
  let fixture: ComponentFixture<CreateDocComponent>;
  let mockNgbModal: jasmine.SpyObj<NgbModal>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockNotificationService: jasmine.SpyObj<NzNotificationService>;
  let mockMastersService: jasmine.SpyObj<MastersService>;
  let mockProfilesService: jasmine.SpyObj<ProfilesService>;
  let mockCognitoService: jasmine.SpyObj<CognitoService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;

  beforeEach(waitForAsync(() => {
    mockNgbModal = jasmine.createSpyObj('NgbModal', ['open']);
    mockApiService = jasmine.createSpyObj('ApiService', ['getSTList', 'addToST', 'UpdateToST', 'deleteST']);
    mockNotificationService = jasmine.createSpyObj('NzNotificationService', ['create']);
    mockMastersService = jasmine.createSpyObj('MastersService', ['getSTList']);
    mockProfilesService = jasmine.createSpyObj('ProfilesService', ['getUserDetails', 'getSmartAgentById']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList', 'getDashboardReport', 'getSTList1', 'getExchangeRate']);

    TestBed.configureTestingModule({
      declarations: [CreateDocComponent, MockTranslatePipe],
      imports: [
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        MatAutocompleteModule,
        NzSelectModule,
        NzDatePickerModule,
        RouterTestingModule,
        HttpClientModule,
        RouterModule,
        BrowserAnimationsModule,
      ],
      providers: [
        DatePipe,
        OrderByPipe,
        { provide: ApiService, useValue: mockApiService },
        { provide: NzNotificationService, useValue: mockNotificationService },
        { provide: MastersService, useValue: mockMastersService },
        { provide: ProfilesService, useValue: mockProfilesService },
        { provide: CognitoService, useValue: mockCognitoService },
        { provide: CommonService, useValue: mockCommonService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form on ngOnInit', () => {
    spyOn(component, 'getDefaultExRate').and.callThrough();
    spyOn(component, 'getPortDropDowns').and.callThrough();
    component.ngOnInit();

    expect(component.getDefaultExRate).toHaveBeenCalled();
    expect(component.getPortDropDowns).toHaveBeenCalled();
  });

  it('should build the form correctly', () => {
    expect(component.quotationForm).toBeDefined();
    expect(component.quotationForm.controls['from']).toBeDefined();
    expect(component.quotationForm.controls['to']).toBeDefined();
  });

  it('should add a product to the form array', () => {
    const initialLength = component.products.length;
    component.addProduct();
    expect(component.products.length).toBe(initialLength + 1);
  });

  it('should remove a product from the form array', () => {
    component.addProduct();
    const initialLength = component.products.length;
    component.removeProduct(0);
    expect(component.products.length).toBe(initialLength - 1);
  });

  it('should generate a random code of length 7', () => {
    const code = component.generateRandomCode();
    expect(code.length).toBe(7);
    expect(/^[A-Z0-9]{7}$/.test(code)).toBeTrue();
  });

  describe('onCheckboxChange Method', () => {
    it('should toggle other checkbox when one is checked', () => {
      component.quotationForm.controls['method1'].setValue(true);
      component.onCheckboxChange('method1');
      expect(component.quotationForm.controls['method2'].value).toBeFalse();

      component.quotationForm.controls['method2'].setValue(true);
      component.onCheckboxChange('method2');
      expect(component.quotationForm.controls['method1'].value).toBeFalse();
    });
  });

  describe('Getter Methods', () => {
    beforeEach(() => {
      component.products.clear();
      component.addProduct();
      component.products.at(0).patchValue({
        amount: 1000,
        unitQty: 10,
        packageQty: 2,
        netWt: 5,
        grossWt: 6,
        measurPackage: 3
      });
      component.addProduct();
      component.products.at(1).patchValue({
        amount: 2000,
        unitQty: 20,
        packageQty: 3,
        netWt: 4,
        grossWt: 5,
        measurPackage: 2
      });
    });

    it('should calculate totalAmount correctly', () => {
      expect(component.totalAmount).toBe(3000);
    });

    it('should calculate totalQty correctly', () => {
      expect(component.totalQty).toBe(30);
    });
  });
});
