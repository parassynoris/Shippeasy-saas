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
import { BondFilingComponent } from './bond-filing.component';

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
  useExisting: forwardRef(() => BondFilingComponent),
  multi: true
};

describe('BondFilingComponent', () => {
  let component: BondFilingComponent;
  let fixture: ComponentFixture<BondFilingComponent>;
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
    mockApiService = jasmine.createSpyObj('ApiService', ['getSTList', 'addToST', 'UpdateToST', 'deleteST']);
    mockNotificationService = jasmine.createSpyObj('NzNotificationService', ['create']);
    mockMastersService = jasmine.createSpyObj('MastersService', ['getSTList','cityList']);
    mockProfilesService = jasmine.createSpyObj('ProfilesService', ['getUserDetails']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails','getModule']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList']);
    mockSaMasterService = jasmine.createSpyObj('SaMasterService', ['cityList']);
    TestBed.configureTestingModule({
      declarations: [BondFilingComponent, MockTranslatePipe,],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientModule,RouterModule,ReactiveFormsModule,RouterModule,TranslateModule.forRoot(),NzSelectModule,NzDatePickerModule,BrowserAnimationsModule],
      providers: [DatePipe, OrderByPipe,TranslateService,MastersSortPipe,
        { provide: NgbModal, useValue: mockNgbModal },CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR,

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
    fixture = TestBed.createComponent(BondFilingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with proper default values', () => {
    expect(component.addBondFileForm).toBeDefined();
    expect(component.addBondFileForm.controls['bondNo']).toBeDefined();
    expect(component.addBondFileForm.controls['bondBase']).toBeDefined();
    expect(component.addBondFileForm.controls['bondType']).toBeDefined();
    expect(component.addBondFileForm.controls['validFrom']).toBeDefined();
    expect(component.addBondFileForm.controls['validTo']).toBeDefined();
    expect(component.addBondFileForm.controls['bondValue']).toBeDefined();
    expect(component.addBondFileForm.controls['portCode']).toBeDefined();
    expect(component.addBondFileForm.controls['containerCat']).toBeDefined();
    expect(component.addBondFileForm.controls['containerType']).toBeDefined();
    expect(component.addBondFileForm.controls['valuePerCont']).toBeDefined();
    expect(component.addBondFileForm.controls['totalCount']).toBeDefined();
    expect(component.addBondFileForm.controls['status']).toBeDefined();

    // You can add more expectations for default values if needed
  });

  it('should call getData method on ngOnInit', () => {
    spyOn(component, 'getData');
    component.ngOnInit();
    expect(component.getData).toHaveBeenCalled();
  });

  it('should call getPaginationData method with "next" argument on next method if totalLength is greater than count', () => {
    component.toalLength = 20;
    component.count = 10;
    spyOn(component, 'getPaginationData');
    component.next();
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });

  it('should not call getPaginationData method on next method if totalLength is not greater than count', () => {
    component.toalLength = 10;
    component.count = 20;
    spyOn(component, 'getPaginationData');
    component.next();
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });

  it('should call getPaginationData method with "prev" argument on prev method if page is greater than 0', () => {
    component.page = 2;
    spyOn(component, 'getPaginationData');
    component.prev();
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });
  
  it('should not call getPaginationData method on prev method if page is 0', () => {
    component.page = 0;
    spyOn(component, 'getPaginationData');
    component.prev();
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });
  
  it('should clear search inputs and call getData method on clear method', () => {
    spyOn(component, 'getData');
    component.search_city = 'test';
    component.search_state = 'test';
    component.search_country = 'test';
    component.search_status = 'Active';
    component.clear();
    expect(component.search_city).toEqual('');
    expect(component.search_state).toEqual('');
    expect(component.search_country).toEqual('');
    expect(component.search_status).toEqual('');
    expect(component.getData).toHaveBeenCalled();
  });
  

  

  
});
