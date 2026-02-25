import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/services/common/common.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { CustomAgentAdviseComponent } from './custom-agent-advise.component';
import { BrowserModule } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { AutocompleteLibModule } from "angular-ng-autocomplete";
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { NgxPaginationModule } from 'ngx-pagination';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('CustomAgentAdviseComponent', () => {
  let component: CustomAgentAdviseComponent;
  let fixture: ComponentFixture<CustomAgentAdviseComponent>;

  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockModalService: jasmine.SpyObj<NgbModal>;
  let mockCognitoService: jasmine.SpyObj<CognitoService>;
  let mockNotificationService: jasmine.SpyObj<NzNotificationService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: ActivatedRoute;
  let mockCommonFunctions: jasmine.SpyObj<CommonFunctions>;

  beforeEach(async () => {
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList', 'addToST']);
    mockModalService = jasmine.createSpyObj('NgbModal', ['dismissAll']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['']);
    mockNotificationService = jasmine.createSpyObj('NzNotificationService', ['create']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockCommonFunctions = jasmine.createSpyObj('CommonFunctions', ['getAgentDetails', 'getCustomerDetails']);

    mockActivatedRoute = { snapshot: { params: { id: '123' } } } as any;

    await TestBed.configureTestingModule({
      declarations: [CustomAgentAdviseComponent],
      imports: [ReactiveFormsModule, BrowserModule, FormsModule, MatFormFieldModule,
        MatInputModule, CommonModule, SharedModule, CommonModule,
        NgxPaginationModule,BrowserAnimationsModule,
        ReactiveFormsModule, AutocompleteLibModule,
        FormsModule, SharedModule, MatButtonToggleModule],
      providers: [
        FormBuilder,
        FormControl,
        { provide: CommonService, useValue: mockCommonService },
        { provide: NgbModal, useValue: mockModalService },
        { provide: CognitoService, useValue: mockCognitoService },
        { provide: NzNotificationService, useValue: mockNotificationService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: CommonFunctions, useValue: mockCommonFunctions },
      ], schemas: [CUSTOM_ELEMENTS_SCHEMA],

    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomAgentAdviseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form', () => {
    expect(component.quotationform).toBeDefined();
    expect(component.quotationform.controls['from']).toBeDefined();
    expect(component.quotationform.controls['to']).toBeDefined();
    expect(component.quotationform.controls['shipmentType']).toBeDefined();
  });

  it('should call getSystemTypeDropDowns on ngOnInit', () => {
    spyOn(component, 'getSystemTypeDropDowns');
    component.ngOnInit();
    expect(component.getSystemTypeDropDowns).toHaveBeenCalled();
  });

  it('should validate form controls', () => {
    const fromControl = component.quotationform.controls['from'];
    fromControl.setValue('');
    expect(fromControl.valid).toBeFalsy();
    fromControl.setValue('test');
    expect(fromControl.valid).toBeTruthy();
  });

  it('should handle saveAgentAdvise', () => {
    spyOn(component, 'saveAgentAdvise').and.callThrough();
    component.saveAgentAdvise();
    if (component.quotationform.invalid) {
      expect(mockNotificationService.create).toHaveBeenCalledWith('error', 'Please fill form', '');
    }
  });

  it('should call getSystemTypeDropDowns on init', () => {
    spyOn(component, 'getSystemTypeDropDowns').and.callThrough();
    component.ngOnInit();
    expect(component.getSystemTypeDropDowns).toHaveBeenCalled();
  });

  it('should swap locations correctly', () => {
    component.quotationform.setValue({
      from: { portId: '1', portName: 'Port A' },
      to: { portId: '2', portName: 'Port B' },
      shipmentType: 'air'
    });
    
    component.onSwap('Port A', { portId: '1', portName: 'Port A' }, 'Port B', { portId: '2', portName: 'Port B' });
    
    expect(component.quotationform.value).toEqual({
      from: { portId: '2', portName: 'Port B' },
      to: { portId: '1', portName: 'Port A' },
      shipmentType: 'air'
    });
  });
});
