import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { Pipe, PipeTransform, forwardRef } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import * as XLSX from "xlsx";
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { RouterModule } from '@angular/router';
import { NewQuoteComponent } from './new-quote.component';

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
  useExisting: forwardRef(() => NewQuoteComponent),
  multi: true
};

describe('NewQuoteComponent', () => {
  let component: NewQuoteComponent;
  let fixture: ComponentFixture<NewQuoteComponent>;
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
      declarations: [NewQuoteComponent, MockTranslatePipe,],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientModule,RouterModule,ReactiveFormsModule,RouterModule],
      providers: [DatePipe, OrderByPipe,
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
    fixture = TestBed.createComponent(NewQuoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should initialize quoteForm correctly', () => {
    expect(component.quoteForm.valid).toBeFalsy();
    expect(component.quoteForm.controls['validFrom'].value).toEqual('');
    // Add assertions for other form controls
  });

   it('should call getQuotation method during ngOnInit', () => {
    spyOn(component, 'getQuotation');
    component.ngOnInit();
    expect(component.getQuotation).toHaveBeenCalled();
  });

  it('should set isEditQuote to false when openQuote is called without editQuoteDetails', () => {
    component.editQuoteDetails = null;
    component.openQuote();
    expect(component.isEditQoute).toBe(false);
  });

  it('should add a new charge row when addChargeRow is called', () => {
    const initialLength = component.getChargeControlsLength();
    component.addChargeRow();
    const finalLength = component.getChargeControlsLength();
    expect(finalLength).toBe(initialLength + 1);
  });

  it('should disable all charge form controls when isOnlyView is true', () => {
    component.isOnlyView = true;
    component.ngOnInit(); // Triggering ngOnInit to initialize the form
    const chargeControls = component.getChargeControls();
    chargeControls.forEach(control => {
      expect(control.disabled).toBeTrue();
    });
  });
  
  it('should set correct voyage number when setVoyage method is called with valid vessel ID', () => {
    const mockVesselList = [
      { vesselId: 1, voyage: [{ shipping_line: 1, voyage_number: 'Voyage 1' }] },
      { vesselId: 2, voyage: [{ shipping_line: 2, voyage_number: 'Voyage 2' }] },
    ];
    component.vesselList = mockVesselList;
    component.quoteForm.controls.shipping_line.setValue(1); // Set shipping line ID
    component.quoteForm.controls.plannedVessel.setValue(1); // Set vessel ID
  
    component.setVoyage(1);
  
    expect(component.quoteForm.controls.voyageNumber.value).toEqual('Voyage 1');
  });
  
  it('should not set voyage number when setVoyage method is called with invalid vessel ID', () => {
    const mockVesselList = [
      { vesselId: 1, voyage: [{ shipping_line: 1, voyage_number: 'Voyage 1' }] },
      { vesselId: 2, voyage: [{ shipping_line: 2, voyage_number: 'Voyage 2' }] },
    ];
    component.vesselList = mockVesselList;
    component.quoteForm.controls.shipping_line.setValue(1); // Set shipping line ID
    component.quoteForm.controls.plannedVessel.setValue(3); // Set invalid vessel ID
  
    component.setVoyage(3);
  
    expect(component.quoteForm.controls.voyageNumber.value).toBeFalsy(); // Voyage number should not be set
  });
  
  it('should enable form controls when isOnlyView is false', () => {
    component.isOnlyView = false;
    component.ngOnInit(); // Call ngOnInit to trigger form initialization
  
    expect(component.quoteForm.controls.validFrom.enabled).toBeTruthy();
    expect(component.quoteForm.controls.currency.enabled).toBeTruthy();
    // Check other form controls for enabled state
  });
 
  it('should return true if the user country is India', () => {
    component.userCountry = 'India';
    expect(component.isIndian()).toBeTruthy();
  });
  
  it('should return false if the user country is not India', () => {
    component.userCountry = 'USA';
    expect(component.isIndian()).toBeFalsy();
  });

 
 
});