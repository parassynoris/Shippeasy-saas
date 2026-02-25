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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import * as XLSX from "xlsx";
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { RouterModule } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { LoaderService } from 'src/app/services/loader.service';
import { TemplateMasterComponent } from './template-master.component';

 
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
  useExisting: forwardRef(() => TemplateMasterComponent),
  multi: true
};
 
describe('TemplateMasterComponent', () => {
  let component: TemplateMasterComponent;
  let fixture: ComponentFixture<TemplateMasterComponent>;
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
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList','getDashboardReport']);
 
    TestBed.configureTestingModule({
      declarations: [TemplateMasterComponent,MockTranslatePipe],
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
    fixture = TestBed.createComponent(TemplateMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
 
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getTemplate on initialization', () => {
    spyOn(component, 'getTemplate');
    component.ngOnInit();
    expect(component.getTemplate).toHaveBeenCalled();
  });

  it('should call getTemplate when filter is triggered', () => {
    spyOn(component, 'getTemplate');
    component.filter({ target: { value: 10 } });
    expect(component.getTemplate).toHaveBeenCalled();
  });

  it('should call getPaginationData with "next" when next is triggered', () => {
    spyOn(component, 'getPaginationData');
    component.toalLength = 20;
    component.count = 10;
    component.next();
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });

  it('should call getPaginationData with "prev" when prev is triggered', () => {
    spyOn(component, 'getPaginationData');
    component.page = 2;
    component.prev();
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });
  it('should call getTemplate and update templateList on initialization', () => {
    spyOn(component, 'getTemplate').and.callThrough();
    component.ngOnInit();
    expect(component.getTemplate).toHaveBeenCalled();
    expect(component.templateList).toEqual([]);
  });

 

  it('should call getPaginationData with "next" and update pagination data when next is triggered', () => {
    component.toalLength = 20;
    component.count = 10;
    spyOn(component, 'getPaginationData').and.callThrough();
    component.next();
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
    expect(component.page).toEqual(1);
    expect(component.fromSize).toEqual(11);
  });

  it('should call getPaginationData with "prev" and update pagination data when prev is triggered', () => {
    component.page = 2;
    spyOn(component, 'getPaginationData').and.callThrough();
    component.prev();
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
    expect(component.page).toEqual(2);
    expect(component.fromSize).toEqual(-9);
  });






  

});
