import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormControlName, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { of, throwError } from 'rxjs';
import { ApiService } from 'src/app/admin/principal/api.service';

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
import { CurrencyPipe, DatePipe } from '@angular/common'; 
import { OrderByPipe } from 'src/app/shared/util/sort';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonService } from 'src/app/services/common/common.service';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { TranslateModule } from '@ngx-translate/core';
import { NewStoltBLComponent } from './new-stolt-bl.component';
import { SharedModule } from 'src/app/shared/shared.module';


@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  
  constructor(private currencyPipe: CurrencyPipe) {}
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('NewStoltBLComponent', () => {
  let component: NewStoltBLComponent;
  let fixture: ComponentFixture<NewStoltBLComponent>;
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
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails','getagentDetails']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList', 'UpdateToST']);

    TestBed.configureTestingModule({
      declarations: [NewStoltBLComponent, MockTranslatePipe],
      imports: [ReactiveFormsModule,SharedModule,FormsModule, NzSelectModule,NzDatePickerModule,RouterTestingModule,BrowserAnimationsModule ,HttpClientModule,TranslateModule.forRoot()],
      providers: [DatePipe, OrderByPipe,CurrencyPipe,
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
    fixture = TestBed.createComponent(NewStoltBLComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return false if an item with the provided containerId does not exist in containerBillsData', () => {
    component.containerBillsData = [
      { containerId: 'container1', otherProperty: 'value1' },
      { containerId: 'container2', otherProperty: 'value2' },
    ];

    const result = component.checked({ containerId: 'container3' });

    expect(result).toBe(false);
  });

  it('should return false if containerBillsData is empty', () => {
    const result = component.checked({ containerId: 'container1' });

    expect(result).toBe(false);
  });

  it('should return false if bookingDate is not set', () => {
    const current = new Date('2024-04-11');
    component.batchDetails = { bookingDate: null };

    const result = component.disabledEtaDate(current);

    expect(result).toBe(false);
  });

  it('should return true if current date is before bookingDate', () => {
    const bookingDate = new Date('2024-04-15');
    const current = new Date('2024-04-10');
    component.batchDetails = { bookingDate };

    const result = component.disabledEtaDate(current);

    expect(result).toBe(true);
  });

  it('should return false if current date is after bookingDate', () => {
    const bookingDate = new Date('2024-04-10');
    const current = new Date('2024-04-15');
    component.batchDetails = { bookingDate };

    const result = component.disabledEtaDate(current);

    expect(result).toBe(false);
  });

  it('should return false if current date is equal to bookingDate', () => {
    const bookingDate = new Date('2024-04-10');
    const current = new Date('2024-04-10');
    component.batchDetails = { bookingDate };

    const result = component.disabledEtaDate(current);

    expect(result).toBe(false);
  });

  it('should not update preCarrigeList if no port ID is provided', () => {
    component.loadportchange();

    expect(component.preCarrigeList).toEqual([]);
  });

  it('should not update onCarrigeList if no port ID is provided', () => {
    component.desPortchange();

    expect(component.onCarrigeList).toEqual([]);
  });

  it('should handle the case when no location matches the provided port ID', () => {
    const portId = 4;

    component.loadportchange(portId);
    component.desPortchange(portId);

    expect(component.preCarrigeList).toEqual([]);
    expect(component.onCarrigeList).toEqual([]);
  });

  it('should return undefined if no matching party master ID is found', () => {
    const id = 4;

    const result = component.findNotifyADD(id);

    expect(result).toBeUndefined();
  });

  it('should handle the case when notifyList is empty', () => {
    component.notifyList = [];

    const id = 1;

    const result = component.findNotifyADD(id);

    expect(result).toBeUndefined();
  });

  it('should handle the case when addressInfo is not set', () => {
    component.notifyList = [
      { partymasterId: 1 }, // No addressInfo
      { partymasterId: 2, addressInfo: { address: 'Address 2' } },
    ];

    const id = 1;

    const result = component.findNotifyADD(id);

    expect(result).toBeUndefined();
  });

  
});
