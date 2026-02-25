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
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MastersSortPipe } from 'src/app/shared/util/mastersort';
import { RecipeAcknowledgementComponent } from './recipe-acknowledgement.component';



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
  useExisting: forwardRef(() => RecipeAcknowledgementComponent),
  multi: true
};

describe('RecipeAcknowledgementComponent', () => {
  let component: RecipeAcknowledgementComponent;
  let fixture: ComponentFixture<RecipeAcknowledgementComponent>;
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
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList','getListByURL']);

    TestBed.configureTestingModule({
      declarations: [RecipeAcknowledgementComponent, MockTranslatePipe,],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientModule,RouterModule,ReactiveFormsModule,RouterModule,TranslateModule.forRoot(),NzSelectModule,NzDatePickerModule,BrowserAnimationsModule],
      providers: [DatePipe, OrderByPipe,TranslateService,MastersSortPipe,
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
    fixture = TestBed.createComponent(RecipeAcknowledgementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch payment data and calculate totals', () => {
    // Mock payment data
    const mockPaymentData = [/* mock payment data */];
    mockCommonService.getListByURL.and.returnValue(of({ hits: { hits: mockPaymentData, total: { value: mockPaymentData.length } } }));
  
    component.getPaymentData();
  
    expect(component.paymentData).toEqual(mockPaymentData);
    expect(component.toalLength).toEqual(mockPaymentData.length);
    // Add more assertions for totalPaymentAmount and totalAmtInr calculation if needed
  });

  describe('RecipeAcknowledgementComponent', () => {
    //... previous setup code ...
  
    it('should call getPaginationData with "prev"', () => {
      spyOn(component, 'getPaginationData');
      component.page = 1;
      component.prev();
      expect(component.getPaginationData).toHaveBeenCalledWith('prev');
    });
  })

  it('should have default values', () => {
    expect(component.totalPaymentAmount).toBe(0);
    expect(component.totalAmtInr).toBe(0);
    expect(component.Payment).toBeTrue();
    expect(component.Payments).toBeFalse();
    expect(component.size).toBe(10);
    expect(component.page).toBe(1);
    expect(component.count).toBe(0);
  });

  it('should call getPaymentData on ngOnInit', () => {
    spyOn(component, 'getPaymentData');
    component.ngOnInit();
    expect(component.getPaymentData).toHaveBeenCalled();
  });

  it('should call getPaginationData with "next"', () => {
    spyOn(component, 'getPaginationData');
    component.toalLength = 50;
    component.count = 10;
    component.next();
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });

  it('should have default values', () => {
    expect(component.totalPaymentAmount).toBe(0);
    expect(component.totalAmtInr).toBe(0);
    expect(component.Payment).toBeTrue();
    expect(component.Payments).toBeFalse();
    expect(component.size).toBe(10);
    expect(component.page).toBe(1);
    expect(component.count).toBe(0);
  });

  it('should filter payment data correctly', () => {
    const event = { target: { value: 15 } };
    spyOn(component, 'getPaymentData');
    component.filter(event);
    expect(component.size).toBe(15);
    expect(component.getPaymentData).toHaveBeenCalled();
  });

});
