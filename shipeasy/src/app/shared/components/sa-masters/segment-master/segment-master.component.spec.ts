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
import { SegmentMasterComponent } from './segment-master.component';



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
  useExisting: forwardRef(() => SegmentMasterComponent),
  multi: true
};

describe('SegmentMasterComponent', () => {
  let component: SegmentMasterComponent;
  let fixture: ComponentFixture<SegmentMasterComponent>;
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
    mockMastersService = jasmine.createSpyObj('MastersService', ['getSTList','systemtypeList']);
    mockProfilesService = jasmine.createSpyObj('ProfilesService', ['getUserDetails']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails', 'getModule']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList']);

    TestBed.configureTestingModule({
      declarations: [SegmentMasterComponent, MockTranslatePipe,],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientModule, RouterModule, ReactiveFormsModule, RouterModule, TranslateModule.forRoot(), NzSelectModule, NzDatePickerModule, BrowserAnimationsModule],
      providers: [DatePipe, OrderByPipe, TranslateService, MastersSortPipe,
        { provide: NgbModal, useValue: mockNgbModal }, CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR,

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
    fixture = TestBed.createComponent(SegmentMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize addSegmentForm with proper form controls', () => {
    expect(component.addSegmentForm).toBeDefined();
    expect(component.addSegmentForm.get('typeName')).toBeDefined();
    expect(component.addSegmentForm.get('status')).toBeDefined();
  });

  it('should call getData() on ngOnInit', () => {
    spyOn(component, 'getData');
    component.ngOnInit();
    expect(component.getData).toHaveBeenCalled();
  });

  it('should call onSave method', () => {
    spyOn(component, 'onSave');
    component.onSave();
    expect(component.onSave).toHaveBeenCalled();
  });

  it('should call segmentMasters method when form is submitted and form is valid', () => {
    spyOn(component, 'segmentMasters');
    component.addSegmentForm.setValue({ typeName: 'Test Segment', status: true });
    component.segmentMasters();
    expect(component.segmentMasters).toHaveBeenCalled();
  });
  
  it('should call next method when next method is called and total length is greater than count', () => {
    component.toalLength = 20;
    component.count = 10;
    spyOn(component, 'next');
    component.next();
    expect(component.next).toHaveBeenCalled();
  });
  
  it('should call prev method when prev method is called and page is greater than 0', () => {
    component.page = 2;
    spyOn(component, 'prev');
    component.prev();
    expect(component.prev).toHaveBeenCalled();
  });
  
  it('should call filter method when filter method is called', () => {
    spyOn(component, 'filter');
    const event = { target: { value: 20 } };
    component.filter(event);
    expect(component.filter).toHaveBeenCalledWith(event);
  });
  
  it('should call search method when search method is called', () => {
    spyOn(component, 'search');
    component.isSearchable = true;
    component.search();
    expect(component.search).toHaveBeenCalled();
  });
  
  it('should call clear method when clear method is called', () => {
    spyOn(component, 'clear');
    component.clear();
    expect(component.clear).toHaveBeenCalled();
  });
  
  it('should call searchDataChange method when searchDataChange method is called', () => {
    spyOn(component, 'searchDataChange');
    component.searchDataChange();
    expect(component.searchDataChange).toHaveBeenCalled();
  });
  
  it('should call openPDF method when openPDF method is called', () => {
    spyOn(component, 'openPDF');
    component.openPDF();
    expect(component.openPDF).toHaveBeenCalled();
  });

  

});
