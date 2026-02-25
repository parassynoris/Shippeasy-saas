import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
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
import { HttpClientModule } from '@angular/common/http';
import { CurrencyPipe, DatePipe } from '@angular/common'; 
import { OrderByPipe } from 'src/app/shared/util/sort';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonService } from 'src/app/services/common/common.service';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { BankComponent } from './bank.component';


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

describe('BankComponent', () => {
  let component: BankComponent;
  let fixture: ComponentFixture<BankComponent>;
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
    mockProfilesService = jasmine.createSpyObj('ProfilesService', ['getUserDetails','getBankList']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails','getagentDetails',]);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList', 'UpdateToST']);
   mockApiService = jasmine.createSpyObj('ApiService',['getListByURL']);
    TestBed.configureTestingModule({
      declarations: [BankComponent, MockTranslatePipe],
      imports: [ReactiveFormsModule,SharedModule,NzSelectModule,NzDatePickerModule,RouterTestingModule,BrowserAnimationsModule ,HttpClientModule,TranslateModule.forRoot()],
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
    fixture = TestBed.createComponent(BankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should clear form fields and fetch bank list', () => {
    spyOn(component, 'getBankList'); // Spy on the getBankList method to check if it's called after clearing
    component.clear();
    expect(component.bankName).toEqual('');
    expect(component.accountNo).toEqual('');
    expect(component.swiftCode).toEqual('');
    expect(component.currency).toEqual('');
    expect(component.branchName).toEqual('');
    expect(component.countryName).toEqual('');
    expect(component.status).toEqual('');
    expect(component.getBankList).toHaveBeenCalled();
  });

  it('should navigate to next page correctly', () => {
    component.toalLength = 20; // Assuming total length is greater than count
    component.count = 10;
    spyOn(component, 'getPaginationData');
    component.next();
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });
  
  it('should navigate to previous page correctly', () => {
    component.page = 2; // Assuming current page is 2
    spyOn(component, 'getPaginationData');
    component.prev();
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should navigate to correct URL when opening new bank', () => {
    const storeId = 'exampleStoreId';
    component.commonService.storeEditID = storeId;
    component.onOpenNew();
  });
  
  it('should navigate to correct URL when opening bank for edit', () => {
    const bankId = 'exampleBankId';
    const storeId = 'exampleStoreId';
    component.commonService.storeEditID = storeId;
    component.onOpenEdit(bankId);
  });
  
  it('should clear all form fields and fetch bank list', () => {
    // Set some fields to non-empty values
    component.bankName = 'exampleBankName';
    component.currency = 'USD';
    spyOn(component, 'getBankList');
    component.clear();
    // Expect all fields to be empty after clear
    expect(component.bankName).toEqual('');
    expect(component.accountNo).toEqual('');
    expect(component.swiftCode).toEqual('');
    expect(component.currency).toEqual('');
    expect(component.branchName).toEqual('');
    expect(component.countryName).toEqual('');
    expect(component.status).toEqual('');
    expect(component.getBankList).toHaveBeenCalled();
  });

  it('should not navigate to previous page if already at the first page', () => {
    spyOn(component, 'getPaginationData');
    component.page = 1;
    component.prev();
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });

  it('should not navigate to next page if there are no more pages', () => {
    spyOn(component, 'getPaginationData');
    component.toalLength = 20;
    component.count = 20;
    component.next();
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });
  
  it('should fetch bank list without filtering if no search criteria provided', () => {
    spyOn(component, 'getBankList');
    component.filter({ target: { value: '10' } }); // Assuming user selects size 10
    expect(component.getBankList).toHaveBeenCalled();
  });
  
 
});
