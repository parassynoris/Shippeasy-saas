import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { of, throwError } from 'rxjs';
import { ApiService } from 'src/app/admin/principal/api.service';
import { CommonService } from 'src/app/services/common/common.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Pipe, PipeTransform, forwardRef } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import * as XLSX from "xlsx";
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { RouterModule } from '@angular/router';
import { FinanceComponent } from './finance.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';


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
  useExisting: forwardRef(() => FinanceComponent),
  multi: true
};

describe('FinanceComponent', () => {
  let component: FinanceComponent;
  let fixture: ComponentFixture<FinanceComponent>;
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
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails','getModule']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList']);

    TestBed.configureTestingModule({
      declarations: [FinanceComponent, MockTranslatePipe,],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientModule,RouterModule,ReactiveFormsModule,RouterModule,TranslateModule.forRoot()],
      providers: [DatePipe, OrderByPipe,TranslateService,
        { provide: NgbModal, useValue: mockNgbModal },CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR,

        { provide: ApiService, useValue: mockApiService },
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
    fixture = TestBed.createComponent(FinanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize tabs correctly', () => {
    const component = TestBed.createComponent(FinanceComponent);
    expect(component.componentInstance.tabs.length).toBeGreaterThan(0);
  });

  it('should open calculator window', () => {
    const component = TestBed.createComponent(FinanceComponent);
    const openSpy = spyOn(window, 'open');
    component.componentInstance.calculator();
    expect(openSpy).toHaveBeenCalledWith('Calculator:///');
  });


  it('should return key itself if it is not "bills" or "receipt"', () => {
    const component = TestBed.createComponent(FinanceComponent);
    const key = 'unknown';
    expect(component.componentInstance.holdControlKey(key)).toBe(key);
  });

  it('should handle empty menu data in getMenuList()', () => {
    const component = TestBed.createComponent(FinanceComponent);
    component.componentInstance.commonService.getSTList = jasmine.createSpy().and.returnValue(of({ documents: [] }));
    component.componentInstance.getMenuList();
    expect(component.componentInstance.menuData.length).toBe(0);
  });
  
  it('should update holdControl correctly onTab', () => {
    const component = TestBed.createComponent(FinanceComponent);
    const testData = { key: 'payment' };
    component.componentInstance.onTab(testData);
    expect(component.componentInstance.holdControl).toBe(testData.key);
  });

  it('should handle null payload in getMenuList()', () => {
    const component = TestBed.createComponent(FinanceComponent);
    component.componentInstance.commonService.filterList = jasmine.createSpy().and.returnValue(null);
    component.componentInstance.getMenuList();
    expect(component.componentInstance.menuData.length).toBe(0);
  });
  
  it('should handle empty response from getSTList() in getMenuList()', () => {
    const component = TestBed.createComponent(FinanceComponent);
    component.componentInstance.commonService.getSTList = jasmine.createSpy().and.returnValue(of({ documents: [] }));
    component.componentInstance.getMenuList();
    expect(component.componentInstance.menuData.length).toBe(0);
  });

  it('should filter menu data based on category in getMenuList()', () => {
    const component = TestBed.createComponent(FinanceComponent);
    component.componentInstance.commonService.getSTList = jasmine.createSpy().and.returnValue(of({ documents: [{ menuName: 'Invoice', parentMenuId: '', category: 'not_finance' }] }));
    component.componentInstance.getMenuList();
    expect(component.componentInstance.menuData.length).toBe(0);
  });

  it('should filter menu data for non-finance category in getMenuList()', () => {
    const component = TestBed.createComponent(FinanceComponent);
    component.componentInstance.commonService.getSTList = jasmine.createSpy().and.returnValue(of({ documents: [{ menuName: 'Invoice', parentMenuId: '', category: 'not_finance' }] }));
    component.componentInstance.getMenuList();
    expect(component.componentInstance.menuData.length).toBe(0);
  });

  it('should handle empty menu access for smart agent users in getMenuList()', () => {
    const component = TestBed.createComponent(FinanceComponent);
    const mockMenuAccess = { menu: [], accesslevel: [] };
    component.componentInstance.commonFunctions.getCognitoUserDetail = jasmine.createSpy().and.returnValue(mockMenuAccess);
    component.componentInstance.getMenuList();
    expect(component.componentInstance.menuData.length).toBe(0);
  });

  it('should update holdControl correctly when onTab() is called', () => {
    const component = TestBed.createComponent(FinanceComponent);
    const testData = { key: 'payment' };
    component.componentInstance.onTab(testData);
    expect(component.componentInstance.holdControl).toBe(testData.key);
  });
  
  it('should handle null response from getSTList() in getMenuList()', () => {
    const component = TestBed.createComponent(FinanceComponent);
    component.componentInstance.commonService.getSTList = jasmine.createSpy().and.returnValue(of(null));
    component.componentInstance.getMenuList();
    expect(component.componentInstance.menuData.length).toBe(0);
  });
  
  it('should navigate to correct route and update holdControl onTab', () => {
    const component = TestBed.createComponent(FinanceComponent);
    const testData = { key: 'payment' };
    const routerSpy = spyOn(component.componentInstance.router, 'navigate').and.callThrough();
    component.componentInstance.onTab(testData);
    expect(routerSpy).toHaveBeenCalledWith(['/finance/' + testData.key]);
    expect(component.componentInstance.holdControl).toBe(testData.key);
  });

  
 
  
 
});
