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
import { BankMasterComponent } from './bank-master.component';
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

describe('BankMasterComponent', () => {
  let component: BankMasterComponent;
  let fixture: ComponentFixture<BankMasterComponent>;
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
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList']);

    TestBed.configureTestingModule({
      declarations: [BankMasterComponent, MockTranslatePipe],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientModule],
      providers: [DatePipe, OrderByPipe,MastersSortPipe,
        { provide: NgbModal, useValue: mockNgbModal },
        { provide: ApiService, useValue: mockApiService },
        { provide: NzNotificationService, useValue: mockNotificationService },
        { provide: MastersService, useValue: mockMastersService },
        { provide: ProfilesService, useValue: mockProfilesService },
        { provide: SaMasterService, useValue: {} },
        { provide: CognitoService, useValue: mockCognitoService },
        { provide: CommonService, useValue: mockCommonService },
        { provide: MastersSortPipe, useValue: MastersSortPipe },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BankMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize bankForm properly', () => {
    expect(component.bankForm).toBeDefined();
    expect(component.bankForm.get('bankName')).toBeDefined();
    expect(component.bankForm.get('bankShortName')).toBeDefined();
    // Add more expectations for other form controls
  });

  it('should call getBankList on ngOnInit', () => {
    spyOn(component, 'getBankList');
    component.ngOnInit();
    expect(component.getBankList).toHaveBeenCalled();
  });

  it('should call cancel method', () => {
    spyOn(component, 'cancel');
    component.cancel();
    expect(component.cancel).toHaveBeenCalled();
  });

  it('should call onSave method for adding a new bank', () => {
    spyOn(component, 'onSave');
    component.bankIdToUpdate = undefined; // Simulate adding a new bank
    component.onSave();
    expect(component.onSave).toHaveBeenCalled();
    // You may add more expectations based on the expected behavior after adding a new bank
  });

  it('should call onSave method for updating an existing bank', () => {
    spyOn(component, 'onSave');
    component.bankIdToUpdate = 'existingBankId'; // Simulate updating an existing bank
    component.onSave();
    expect(component.onSave).toHaveBeenCalled();
    // You may add more expectations based on the expected behavior after updating a bank
  });

  it('should call deleteclause method', () => {
    spyOn(window, 'alert'); // Spy on the window.alert method
    component.deleteclause('someId');
    expect(window.alert).toHaveBeenCalledWith('Item deleted!');
  });

  it('should set submitted to true when onSave is called with invalid form', () => {
    spyOn(component, 'onSave').and.callThrough();
    component.submitted = false;
    component.onSave();
    expect(component.submitted).toBeTruthy();
  });

  it('should call getBankList with proper payload when filter method is called', () => {
    spyOn(component, 'getBankList');
    component.bankName = 'Test Bank';
    component.bankShortName = 'TB';
    component.bankCode = '123';
    component.lineID = 'L123';
    component.FASCode = 'FAS123';
    component.status = 'Active';
    component.filter({ target: { value: 10 } }); // Assuming 10 as the new size
    expect(component.getBankList).toHaveBeenCalledWith(); // Add expectations based on your filter logic
  });

  it('should call getBankList when clearFilter method is called', () => {
    spyOn(component, 'getBankList');
    component.clearFilter();
    expect(component.getBankList).toHaveBeenCalled();
  });

  it('should call getBankList with proper payload when clearFilter method is called', () => {
    spyOn(component, 'getBankList');
    component.clearFilter();
    expect(component.getBankList).toHaveBeenCalledWith();
    expect(component.bankName).toEqual('');
    expect(component.bankShortName).toEqual('');
    expect(component.bankCode).toEqual('');
    expect(component.lineID).toEqual('');
    expect(component.FASCode).toEqual('');
  });

  it('should not call getPaginationData when next method is called with equal toalLength and count', () => {
    component.toalLength = 10;
    component.count = 10;
    spyOn(component, 'getPaginationData');
    component.next();
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });

  it('should call getBankList when ngOnInit is called', () => {
    spyOn(component, 'getBankList');
    component.ngOnInit();
    expect(component.getBankList).toHaveBeenCalledWith();
  });
  it('should call getPaginationData with proper payload when prev method is called', () => {
    component.page = 3;
    spyOn(component, 'getPaginationData');
    component.prev();
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should not call getPaginationData when prev method is called with page equal to 1', () => {
    component.page = 1;
    spyOn(component, 'getPaginationData');
    component.prev();
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });

  it('should return form controls when get f method is called', () => {
    const formControls = component.f;
    expect(formControls.bankName).toBe(component.bankForm.controls.bankName);
    expect(formControls.bankShortName).toBe(component.bankForm.controls.bankShortName);
    // Add more assertions for other form controls
  });

  it('should call getPaginationData with proper payload when next method is called', () => {
    component.toalLength = 15;
    component.count = 10;
    spyOn(component, 'getPaginationData');
    component.next();
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });

  it('should not call getPaginationData when next method is called with equal toalLength and count', () => {
    component.toalLength = 10;
    component.count = 10;
    spyOn(component, 'getPaginationData');
    component.next();
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });

  it('should call changeStatus method with proper payload when changeStatus method is called', () => {
    spyOn(component, 'changeStatus');
    const testData = { bankId: 'testBankId', status: true };
    component.changeStatus(testData);
    expect(component.changeStatus).toHaveBeenCalledWith(testData);
  });

});

