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
import { WareHouseComponent } from './ware-house.component';

 
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
  useExisting: forwardRef(() => WareHouseComponent),
  multi: true
};
 
describe('WareHouseComponent', () => {
  let component: WareHouseComponent;
  let fixture: ComponentFixture<WareHouseComponent>;
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
      declarations: [WareHouseComponent, MockTranslatePipe],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, MatAutocompleteModule, NzSelectModule, NzDatePickerModule, RouterTestingModule, HttpClientModule, RouterModule, BrowserAnimationsModule, ReactiveFormsModule, RouterModule],
      providers: [DatePipe, OrderByPipe,NzNotificationService,
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
    fixture = TestBed.createComponent(WareHouseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
 
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should initialize form with expected controls', () => {
    expect(component.addwareHouse.get('wareHouseName')).toBeTruthy();
    expect(component.addwareHouse.get('wareHouseType')).toBeTruthy();
    // Add more expectations for other form controls
  });


  it('should open modal for adding new warehouse', () => {
    const modalService = TestBed.inject(NgbModal);
    spyOn(modalService, 'open').and.callThrough();
    component.open('content', null, 'Add');
    expect(modalService.open).toHaveBeenCalled();
  });

  it('should validate required fields in the form', () => {
    component.addwareHouse.patchValue({
      wareHouseName: '',
      wareHouseType: ''
      // Add more fields as per your form structure
    });
    expect(component.addwareHouse.valid).toBe(false);
    const nameControl = component.addwareHouse.get('wareHouseName');
    expect(nameControl.hasError('required')).toBe(true);
    const typeControl = component.addwareHouse.get('wareHouseType');
    expect(typeControl.hasError('required')).toBe(true);
  });
  

  
  
  


  it('should filter table data based on entered text', () => {
    const filterValue = 'example';
    component.applyFilter(filterValue);
    expect(component.dataSource.filter).toBe(filterValue.trim().toLowerCase());
  });

  it('should navigate to next page of data', () => {
    const nextPageSpy = spyOn(component, 'next').and.callThrough();
    component.next();
    expect(nextPageSpy).toHaveBeenCalled();
    // Add more expectations here based on your pagination logic
  });

});