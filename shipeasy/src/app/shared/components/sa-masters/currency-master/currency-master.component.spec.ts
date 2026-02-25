import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { of } from 'rxjs';
import { ApiService } from 'src/app/admin/principal/api.service';
import { CommonService } from 'src/app/services/common/common.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Pipe, PipeTransform } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import * as XLSX from "xlsx";
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { CurrencyMasterComponent } from './currency-master.component';
import { MastersSortPipe } from 'src/app/shared/util/mastersort';




@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('CurrencyMasterComponent', () => {
  let component: CurrencyMasterComponent;
  let fixture: ComponentFixture<CurrencyMasterComponent>;
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
    mockProfilesService = jasmine.createSpyObj('ProfilesService', ['getUserDetails','countryList']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList']);

    TestBed.configureTestingModule({
      declarations: [CurrencyMasterComponent, MockTranslatePipe,MastersSortPipe],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientModule],
      providers: [DatePipe, OrderByPipe,
        { provide: NgbModal, useValue: mockNgbModal },
        { provide: ApiService, useValue: mockApiService },
        { provide: NzNotificationService, useValue: mockNotificationService },
        { provide: MastersService, useValue: mockMastersService },
        { provide: ProfilesService, useValue: mockProfilesService },
        { provide: SaMasterService, useValue: {} },
        { provide: CognitoService, useValue: mockCognitoService },
        { provide: CommonService, useValue: mockCommonService },
        {provide:MastersSortPipe, useValue:MastersSortPipe},
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrencyMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form and call getcountryList on ngOnInit', () => {
    spyOn(component, 'getcountryList');
    component.ngOnInit();

    expect(component.getcountryList).toHaveBeenCalled();
    expect(component.addCurrencyForm).toBeDefined();
  });

  it('should clear form and call getData on clear method', () => {
    spyOn(component, 'getData');
    component.currency_code = 'USD';
    component.short_name = 'US';
    component.description = 'United States Dollar';
    component.decimal_name = 'Dollar';

    component.clear();

    expect(component.currency_code).toEqual('');
    expect(component.short_name).toEqual('');
    expect(component.description).toEqual('');
    expect(component.decimal_name).toEqual('');
    expect(component.last_date).toEqual('');
    expect(component.last_updated_user).toEqual('');
    expect(component.getData).toHaveBeenCalled();
  });

  it('should call getPaginationData with "prev" on prev method', () => {
    spyOn(component, 'getPaginationData');
    component.prev();
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should call getPaginationData with "prev" on getPaginationData method for type "prev"', () => {
    spyOn(component, 'getPaginationData');
    component.getPaginationData('prev');
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should call getPaginationData with "next" on getPaginationData method for type "next"', () => {
    spyOn(component, 'getPaginationData');
    component.getPaginationData('next');
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });

  it('should not increment page when already at the last page on next method', () => {
    spyOn(component, 'getPaginationData');

    component.toalLength = 20;
    component.count = 20;
    component.next();

    expect(component.page).toBe(1); // Should remain on the current page
    expect(component.getPaginationData).not.toHaveBeenCalled();
    // Add more expectations as needed
  });

  it('should initialize form with default values', () => {
    expect(component.addCurrencyForm.get('countryName').value).toBe('');
    expect(component.addCurrencyForm.get('description').value).toBe('');
    // Add more expectations as needed for other form controls
  });

  it('should disable form when show is "show"', () => {
    component.open(undefined, { currencyId: 'someId' }, 'show');
    expect(component.addCurrencyForm.disabled).toBe(true);
    // Add more expectations as needed
  });

  it('should enable form when show is not "show"', () => {
    component.open(undefined, { currencyId: 'someId' }, 'edit');
    expect(component.addCurrencyForm.enabled).toBe(true);
    // Add more expectations as needed
  });

});
