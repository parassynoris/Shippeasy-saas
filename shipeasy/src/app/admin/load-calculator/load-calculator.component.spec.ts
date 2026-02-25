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
import { LoadCalculatorComponent } from './load-calculator.component';

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
  useExisting: forwardRef(() => LoadCalculatorComponent),
  multi: true
};

describe('RecipeConfirmationComponent', () => {
  let component: LoadCalculatorComponent;
  let fixture: ComponentFixture<LoadCalculatorComponent>;
  let mockNgbModal: jasmine.SpyObj<NgbModal>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockNotificationService: jasmine.SpyObj<NzNotificationService>;
  let mockMastersService: jasmine.SpyObj<MastersService>;
  let mockProfilesService: jasmine.SpyObj<ProfilesService>;
  let mockCognitoService: jasmine.SpyObj<CognitoService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockSaMasterService: jasmine.SpyObj<SaMasterService>

  beforeEach(waitForAsync(() => {
    mockNgbModal = jasmine.createSpyObj('NgbModal', ['open']);
    mockApiService = jasmine.createSpyObj('ApiService', ['getSTList', 'addToST', 'UpdateToST', 'deleteST', 'getListByURL']);
    mockNotificationService = jasmine.createSpyObj('NzNotificationService', ['create']);
    mockMastersService = jasmine.createSpyObj('MastersService', ['getSTList', 'cityList', 'systemtypeList']);
    mockProfilesService = jasmine.createSpyObj('ProfilesService', ['getUserDetails', 'getCurrentAgentDetails']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails', 'getModule', 'getagentDetails']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList', 'getListByURL']);
    mockSaMasterService = jasmine.createSpyObj('SaMasterService', ['cityList']);
    TestBed.configureTestingModule({
      declarations: [LoadCalculatorComponent, MockTranslatePipe,],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientModule, RouterModule, ReactiveFormsModule, RouterModule, TranslateModule.forRoot(), NzSelectModule, NzDatePickerModule, BrowserAnimationsModule],
      providers: [DatePipe, OrderByPipe, TranslateService, MastersSortPipe,
        { provide: NgbModal, useValue: mockNgbModal }, CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR,

        { provide: ApiService, useValue: mockApiService },
        { provide: NzNotificationService, useValue: mockNotificationService },
        { provide: MastersService, useValue: mockMastersService },
        { provide: ProfilesService, useValue: mockProfilesService },
        { provide: SaMasterService, useValue: mockSaMasterService },
        { provide: CognitoService, useValue: mockCognitoService },
        { provide: CommonService, useValue: mockCommonService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadCalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('Form Initialization', () => {
    it('should initialize groupForm and containerTruckForm', () => {
      expect(component.groupForm).toBeDefined();
      expect(component.containerTruckForm).toBeDefined();
    });

    it('should add a new group to groupForm', () => {
      const initialGroupCount = component.groups.length;
      component.addGroup();
      expect(component.groups.length).toBe(initialGroupCount + 1);
    });
  });

  describe('Item Selection', () => {
    it('should set the selected truck', () => {
      const truck = component.trucks[1];
      component.selectTruck(truck);
      expect(component.selectedTruck).toBe(truck);
      expect(component.truckSelected).toBeTrue();
      expect(component.containerSelected).toBeFalse();
    });

    it('should set the selected container', () => {
      const container = component.trucks[1]; // Assuming similar structure
      component.selectContainer(container);
      expect(component.selectedContainer).toBe(container);
      expect(component.truckSelected).toBeFalse();
      expect(component.containerSelected).toBeTrue();
    });
  });

  describe('Count Increment and Decrement', () => {
    beforeEach(() => {
      component.addGroup();
      component.addContainerToList(component.trucks[0]);
    });

    it('should increment the count for an item', () => {
      component.incrementCount(0);
      const countControl = component.items.at(0).get('count');
      expect(countControl.value).toBe(2);
    });

    it('should decrement the count for an item', () => {
      component.incrementCount(0);
      component.decrementCount(0);
      const countControl = component.items.at(0).get('count');
      expect(countControl.value).toBe(1);
    });

    it('should not decrement below 0', () => {
      component.decrementCount(0);
      const countControl = component.items.at(0).get('count');
      expect(countControl.value).toBe(0);
    });
  });

});
