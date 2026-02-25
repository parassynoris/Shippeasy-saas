import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';
import { CommonService } from 'src/app/services/common/common.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { AddQuotationComponent } from './add-quotation.component';
import { BrowserModule } from '@angular/platform-browser';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SharedModule } from 'src/app/shared/shared.module';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxPaginationModule } from 'ngx-pagination';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Router } from '@angular/router';
import { CommonFunctions } from 'src/app/shared/functions/common.function';

describe('AddQuotationComponent', () => {
  let component: AddQuotationComponent;
  let fixture: ComponentFixture<AddQuotationComponent>;
  let mockCommonService;
  let mockCognitoService;
  let mockNgbModal;
  let mockNzNotificationService;
  let mockCommonFunctions ;
let mockRouter;
  beforeEach(waitForAsync(() => {
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList', 'getSTList1', 'addToST']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['']);
    mockNgbModal = jasmine.createSpyObj('NgbModal', ['']);
    mockNzNotificationService = jasmine.createSpyObj('NzNotificationService', ['create']);
    mockRouter = { navigate: jasmine.createSpy('navigate') };
    mockCommonFunctions = jasmine.createSpyObj('CommonFunctions', ['getAgentDetails', 'getCustomerDetails']);
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule, BrowserModule, FormsModule, MatFormFieldModule,
        MatInputModule, CommonModule, SharedModule,
        NgxPaginationModule,BrowserAnimationsModule, AutocompleteLibModule,
        MatButtonToggleModule
      ],
      declarations: [AddQuotationComponent],
      providers: [
        FormBuilder,
        { provide: Router, useValue: mockRouter },
        { provide: CommonService, useValue: mockCommonService },
        { provide: CognitoService, useValue: mockCognitoService },
        { provide: NgbModal, useValue: mockNgbModal },
        { provide: NzNotificationService, useValue: mockNzNotificationService },
        { provide: CommonFunctions, useValue: mockCommonFunctions },
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddQuotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form', () => {
    expect(component.quotationform).toBeDefined();
    expect(component.quotationform.contains('from')).toBeTrue();
    expect(component.quotationform.contains('to')).toBeTrue();
    expect(component.quotationform.contains('load')).toBeTrue();
    expect(component.quotationform.contains('shipment_Type')).toBeTrue();
  });

  it('should validate form controls', () => {
    const fromControl = component.quotationform.get('from');
    const toControl = component.quotationform.get('to');
    const loadControl = component.quotationform.get('load');

    fromControl.setValue('');
    toControl.setValue('');
    loadControl.setValue('');

    expect(fromControl.valid).toBeFalse();
    expect(toControl.valid).toBeFalse();
    expect(loadControl.valid).toBeFalse();

    fromControl.setValue('Location A');
    toControl.setValue('Location B');
    loadControl.setValue('100');

    expect(fromControl.valid).toBeTrue();
    expect(toControl.valid).toBeTrue();
    expect(loadControl.valid).toBeTrue();
  });

  it('should mark all controls as touched on form submission', () => {
    spyOn(component.quotationform, 'markAllAsTouched');
    component.searchquotation();
    expect(component.quotationform.markAllAsTouched).toHaveBeenCalled();
  });

 
  it('should add a new branch to the form array', () => {
    const initialBranchCount = component.branch.length;
    component.addNewBranch();
    expect(component.branch.length).toBe(initialBranchCount + 1);
  });

  it('should remove a branch from the form array', () => {
    component.addNewBranch();
    const initialBranchCount = component.branch.length;
    component.deleteBranch(0);
    expect(component.branch.length).toBe(initialBranchCount - 1);
  });


});
