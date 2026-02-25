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
import { ContainerComponent, SearchFilterPipe } from './container.component';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
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
const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => ContainerComponent),
  multi: true
};

describe('ContainerComponent', () => {
  let component: ContainerComponent;
  let fixture: ComponentFixture<ContainerComponent>;
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
      declarations: [ContainerComponent, MockTranslatePipe,MastersSortPipe,SearchFilterPipe],
      imports: [NgbModule, ReactiveFormsModule, FormsModule,MatAutocompleteModule,NzSelectModule,RouterTestingModule, HttpClientModule,RouterModule,BrowserAnimationsModule,ReactiveFormsModule,RouterModule],
      providers: [DatePipe, OrderByPipe,
        { provide: ApiService, useVale: mockApiService },
        { provide: NzNotificationService, useValue: mockNotificationService },
        { provide: MastersService, useValue: mockMastersService },
        { provide: ProfilesService, useValue: mockProfilesService },
        { provide: SaMasterService, useValue: {} },
        { provide: CognitoService, useValue: mockCognitoService },
        { provide: CommonService, useValue: mockCommonService },
        { provide: MastersSortPipe, useValue: MastersSortPipe }
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set isRequird to false and clear validators when setValidation is called with a value other than "Reserved"', () => {
    component.isRequird = true;
    spyOn(component.addContainerForm1.controls['customerName'], 'clearValidators');

    component.setValidation('Available');

    expect(component.isRequird).toBeFalse();
    expect(component.addContainerForm1.controls['customerName'].clearValidators).toHaveBeenCalled();
  });

  it('should set isSelected to false and clear selectedContainerArr when allSelect is called with checked as false', () => {
    component.isSelected = true;
    component.selectedContainerArr = [{ containerNo: '1' }, { containerNo: '2' }];

    component.allSelect({ target: { checked: false } });

    expect(component.isSelected).toBeFalse();
    expect(component.selectedContainerArr).toEqual([]);
  });

  it('should set isRequird to true and update customerName validator when setValidation is called with "Reserved"', () => {
    component.isRequird = false;

    component.setValidation('Reserved');

    expect(component.isRequird).toBe(true);
    const customerNameValidator = component.addContainerForm1.get('customerName').validator;
    expect(customerNameValidator({} as any)).toEqual({ required: true });
  });

  it('should set isRequird to false and clear customerName validator when setValidation is called with a non-"Reserved" value', () => {
    component.isRequird = true;

    component.setValidation('Available');

    expect(component.isRequird).toBe(false);
    const customerNameValidator = component.addContainerForm1.get('customerName').validator;
    expect(customerNameValidator).toBeNull();
  });

  it('should set isRequird to false and clear validators when setValidation is called with other than "Reserved"', () => {
    component.setValidation('Available');

    expect(component.isRequird).toBe(false);
    expect(component.addContainerForm1.controls['customerName'].validator).toBe(null);
  });

  it('should set showUpdateContainer to false when containerMasterCancel is called', () => {
    component.containerMasterCancel();

    expect(component.showUpdateContainer).toBe(false);
  });

  it('should remove container from selectedContainerArr when onContainerChange is called with unchecked event', () => {
    const container = { containerNo: 'C1' };
    component.selectedContainerArr = [container];
    const event = { target: { checked: false } };

    component.onContainerChange(container, event);

    expect(component.selectedContainerArr).not.toContain(container);
  });

  it('should set isRequird to true and add validation when setValidation is called with "Reserved"', () => {
    component.addContainerForm1.controls['customerName'].clearValidators();

    component.setValidation('Reserved');

    expect(component.isRequird).toBe(true);
    expect(component.addContainerForm1.controls['customerName'].validator).toBeTruthy();
  });

  it('should set isRequird to false and clear validation when setValidation is called with other than "Reserved"', () => {
    component.isRequird = true;

    component.setValidation('Available');

    expect(component.isRequird).toBe(false);
    expect(component.addContainerForm1.controls['customerName'].validator).toBeNull();
  });

  it('should remove container from selectedContainerArr when onContainerChange is called with checkbox unchecked', () => {
    const mockContainer = { containerNo: 'C1' };
    const mockEvent = { target: { checked: false } };

    component.selectedContainerArr = [mockContainer];

    component.onContainerChange(mockContainer, mockEvent);

    expect(component.selectedContainerArr).toEqual([]);
  });

});

