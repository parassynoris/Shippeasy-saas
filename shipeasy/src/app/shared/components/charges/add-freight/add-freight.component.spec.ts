import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ApiService } from 'src/app/admin/principal/api.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Pipe, PipeTransform } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonService } from 'src/app/services/common/common.service';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { AddFreightComponent } from './add-freight.component';

@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {

  constructor(private currencyPipe: CurrencyPipe) { }
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('AddFreightComponent', () => {
  let component: AddFreightComponent;
  let fixture: ComponentFixture<AddFreightComponent>;
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
    mockProfilesService = jasmine.createSpyObj('ProfilesService', ['getUserDetails']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails', 'getagentDetails',]);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList', 'UpdateToST', 'getCostHeadList']);
    mockApiService = jasmine.createSpyObj('ApiService', ['getListByURL']);
    TestBed.configureTestingModule({
      declarations: [AddFreightComponent, MockTranslatePipe],
      imports: [ReactiveFormsModule, SharedModule, NzSelectModule, NzDatePickerModule, RouterTestingModule, BrowserAnimationsModule, HttpClientModule, TranslateModule.forRoot()],
      providers: [DatePipe, OrderByPipe, CurrencyPipe,FormBuilder,
        { provide: NgbModal, useValue: mockNgbModal },
        { provide: ApiService, useValue: mockApiService },
        { provide: NzNotificationService, useValue: mockNotificationService },
        { provide: MastersService, useValue: mockMastersService },
        { provide: ProfilesService, useValue: mockProfilesService },
        { provide: SaMasterService, useValue: {} },
        { provide: CognitoService, useValue: mockCognitoService },
        { provide: CommonService, useValue: mockCommonService }
      ],
    }).compileComponents();
  }));
  
  beforeEach(() => {
    fixture = TestBed.createComponent(AddFreightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form invalid when empty', () => {
    expect(component.newenquiryForm.valid).toBeFalsy();
  });

  it('charge group field validity', () => {
    let errors = {};
    let chargeGroup = component.newenquiryForm.controls['charge_group'];
    expect(chargeGroup.valid).toBeFalsy();

    errors = chargeGroup.errors || {};
    expect(errors['required']).toBeTruthy();

    chargeGroup.setValue('Test');
    errors = chargeGroup.errors || {};
    expect(errors['required']).toBeFalsy();
  });

  it('charge name field validity', () => {
    let errors = {};
    let chargeName = component.newenquiryForm.controls['charge_name'];
    expect(chargeName.valid).toBeFalsy();

    errors = chargeName.errors || {};
    expect(errors['required']).toBeTruthy();

    chargeName.setValue('Test');
    errors = chargeName.errors || {};
    expect(errors['required']).toBeFalsy();
  });

  it('charge term field validity', () => {
    let errors = {};
    let chargeTerm = component.newenquiryForm.controls['charge_term'];
    expect(chargeTerm.valid).toBeFalsy();

    errors = chargeTerm.errors || {};
    expect(errors['required']).toBeTruthy();

    chargeTerm.setValue('Test');
    errors = chargeTerm.errors || {};
    expect(errors['required']).toBeFalsy();
  });

  it('currency field validity', () => {
    let errors = {};
    let currency = component.newenquiryForm.controls['currency'];
    expect(currency.valid).toBeFalsy();

    errors = currency.errors || {};
    expect(errors['required']).toBeTruthy();

    currency.setValue('Test');
    errors = currency.errors || {};
    expect(errors['required']).toBeFalsy();
  });

  it('should emit close event', () => {
    spyOn(component.CloseNew, 'emit');
    component.onClose('test');
    expect(component.CloseNew.emit).toHaveBeenCalledWith('test');
  });
});
