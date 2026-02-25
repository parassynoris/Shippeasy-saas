import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { CommonModule, DatePipe } from '@angular/common';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { AddBatchComponent } from './add-batch.component';
import { RouterModule } from '@angular/router';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FilterPipe } from '../batch-detail/batch-detail.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FilterPipe1 } from 'src/app/shared/components/route/route.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';

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
  useExisting: forwardRef(() => AddBatchComponent),
  multi: true
};

describe('AddBatchComponent', () => {
  let component: AddBatchComponent;
  let fixture: ComponentFixture<AddBatchComponent>;
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
      declarations: [AddBatchComponent, MockTranslatePipe,FilterPipe,FilterPipe1],
      imports: [NgbModule,SharedModule, ReactiveFormsModule, FormsModule, RouterTestingModule, NzSelectModule,HttpClientModule,RouterModule,ReactiveFormsModule,CommonModule,BrowserAnimationsModule,NzDatePickerModule],
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
    fixture = TestBed.createComponent(AddBatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open the calculator window', () => {
    // Spy on window.open
    const openSpy = spyOn(window, 'open');

    // Call the function
    component.calculator();

    // Expect window.open to be called with the correct arguments
    expect(openSpy).toHaveBeenCalledWith('Calculator:///');
  });

  it('should open the calculator window with the correct URL', () => {
    const openSpy = spyOn(window, 'open');

    component.calculator();

    expect(openSpy).toHaveBeenCalledWith('Calculator:///');
  });

  it('should call getQuotation if isExport is true', () => {
    component.isExport = true;
    spyOn(component, 'getQuotation');
    component.ngOnInit();
    expect(component.getQuotation).toHaveBeenCalled();
  });


  it('should call getQuotation if isExport is true', () => {
    component.isExport = true;
    spyOn(component, 'getQuotation');
    component.ngOnInit();
    expect(component.getQuotation).toHaveBeenCalled();
  });

  it('should use an empty payload if filterList does not provide one', () => {
    spyOn(console, 'log');
    // Ensure filterList returns undefined
    component.getQuotation();

    // Verify that getSTList is called with an empty payload
    // Add more expectations based on your specific scenario
  });

  it('should handle undefined response from getSTList service call', () => {
    component.getQuotation();
    // Verify that quotationList is an empty array when the service response is undefined
    expect(component.quotationList).toEqual([]);
  });

  it('should handle null payload from filterList', () => {
    spyOn(console, 'log');
    component.getQuotation();

    // Add more expectations based on your specific scenario
  });

});

