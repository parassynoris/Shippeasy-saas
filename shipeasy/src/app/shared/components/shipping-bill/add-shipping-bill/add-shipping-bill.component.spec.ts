import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ApiService } from 'src/app/admin/principal/api.service';
import { CommonService } from 'src/app/services/common/common.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
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
import { AddShippingBillComponent } from './add-shipping-bill.component';



@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}
const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => AddShippingBillComponent),
  multi: true
};

describe('AddShippingBillComponent', () => {
  let component: AddShippingBillComponent;
  let fixture: ComponentFixture<AddShippingBillComponent>;
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
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList', 'getDashboardReport']);

    TestBed.configureTestingModule({
      declarations: [AddShippingBillComponent, MockTranslatePipe],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, MatAutocompleteModule, NzSelectModule, NzDatePickerModule, RouterTestingModule, HttpClientModule, RouterModule, BrowserAnimationsModule, ReactiveFormsModule, RouterModule],
      providers: [DatePipe, OrderByPipe,
        { provide: ApiService, useVale: mockApiService },
        { provide: NzNotificationService, useValue: mockNotificationService },
        { provide: MastersService, useValue: mockMastersService },
        { provide: ProfilesService, useValue: mockProfilesService },
        { provide: SaMasterService, useValue: {} },
        { provide: CognitoService, useValue: mockCognitoService },
        { provide: CommonService, useValue: mockCommonService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddShippingBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set country on setCountry call', () => {
    component.locationList = [{ portId: 1, country: { countryId: 100 } }];
    component.setCountry(1);
    expect(component.addShippingBill.get('country')?.value).toBe(100);
  });

  it('should initialize the form with default values', () => {
    expect(component.addShippingBill).toBeDefined();
    expect(component.addShippingBill.contains('CHA')).toBeTrue();
    expect(component.addShippingBill.contains('stn')).toBeTrue();
  });

  it('should toggle booking panel open state', () => {
    component.isBookingPanelOpen = true;
    component.toggleButton('booking');
    expect(component.isBookingPanelOpen).toBeFalse();
    component.toggleButton('booking');
    expect(component.isBookingPanelOpen).toBeTrue();
  });

  it('should initialize the component with default values and fetch data', () => {
    spyOn(component, 'getCountryList').and.callThrough();
    spyOn(component, 'getCurrencyDropDowns').and.callThrough();
    spyOn(component, 'getStateList').and.callThrough();

    component.ngOnInit();

    expect(component.getCountryList).toHaveBeenCalled();
    expect(component.getCurrencyDropDowns).toHaveBeenCalled();
    expect(component.getStateList).toHaveBeenCalled();
  });


});
