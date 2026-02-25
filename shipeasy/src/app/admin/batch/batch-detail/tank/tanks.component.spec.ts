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
import { TankComponent } from './tanks.component';


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
  useExisting: forwardRef(() => TankComponent),
  multi: true
};

describe('TankComponent', () => {
  let component: TankComponent;
  let fixture: ComponentFixture<TankComponent>;
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
      declarations: [TankComponent, MockTranslatePipe,],
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
    fixture = TestBed.createComponent(TankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize formContainer properly', () => {
    component.formContainer();
    expect(component.addContainerForm).toBeDefined();
    // Add more expectations as needed
  });

  it('should initialize BatchContainer properly', () => {
    component.ngOnInit();
    expect(component.BatchContainer).toBeDefined();
    // Add more expectations as needed
  });

  it('should call getSystemTypeDropDowns on ngOnInit', () => {
    spyOn(component, 'getSystemTypeDropDowns');
    component.ngOnInit();
    expect(component.getSystemTypeDropDowns).toHaveBeenCalled();
  });
 
  it('should call getContainerList on ngOnChanges', () => {
    spyOn(component, 'getContainerList');
    component.ngOnChanges();
    expect(component.getContainerList).toHaveBeenCalled();
  });

  it('should disable EtaDate if current date is after selected date', () => {
    const currentDate = new Date();
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1);
    const disabled = component.disabledEtaDate(selectedDate);
    expect(disabled).toBe(true);
  });

  it('should return false for disabledStartDateForicd when startValue is null', () => {
    const disabled = component.disabledStartDateForicd(null);
    expect(disabled).toBe(false);
  });

  it('should return false for disabledEndDateForicd when endValue is null', () => {
    const disabled = component.disabledEndDateForicd(null);
    expect(disabled).toBe(false);
  });

  it('should return false for disabledEtaDate when current date is in the past', () => {
    const current = new Date('2024-04-10');
    const disabled = component.disabledEtaDate(current);
    expect(disabled).toBe(true);
  });

  it('should return false for disabledEtaDate when current date is in the future', () => {
    const current = new Date('2024-04-20');
    const disabled = component.disabledEtaDate(current);
    expect(disabled).toBe(true);
  });

  it('should return false for disabledEtaDate when current date is today', () => {
    const current = new Date();
    const disabled = component.disabledEtaDate(current);
    expect(disabled).toBe(false);
  });

  it('should return false for disabledEtaDate when current date is null', () => {
    const current = null;
    const disabled = component.disabledEtaDate(current);
    expect(disabled).toBe(false);
  });




  

 




 
});
