import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { NgbDatepicker, NgbModal, NgbModalRef, NgbModule } from '@ng-bootstrap/ng-bootstrap';
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
// import { BoldReportComponents } from '@boldreports/angular-reporting-components';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { MatSelectModule } from '@angular/material/select';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { VendorBillComponent } from './vendor-bill.component';

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
  useExisting: forwardRef(() => VendorBillComponent),
  multi: true
};

describe('VendorBillComponent', () => {
  let component: VendorBillComponent;
  let fixture: ComponentFixture<VendorBillComponent>;
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
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails','getagentDetails']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList']);

    TestBed.configureTestingModule({
      declarations: [VendorBillComponent, MockTranslatePipe],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientModule,RouterModule,NzSelectModule,ReactiveFormsModule,MatSelectModule,NzDatePickerModule,FormsModule
      ,NoopAnimationsModule],
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
    fixture = TestBed.createComponent(VendorBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getBillsList on ngOnInit', () => {
    spyOn(component, 'getBillsList');
    component.ngOnInit();
    expect(component.getBillsList).toHaveBeenCalled();
  });

  it('should call onClose and navigate to the correct route', () => {
    spyOn(component.router, 'navigate');
    component.onClose();
    expect(component.router.navigate).toHaveBeenCalledWith(['/' + component.isparent + '/list']);
  });

  it('should call getBillsList on next', () => {
    spyOn(component, 'getPaginationData');
    component.toalLength = 20;
    component.count = 10;
    component.next();
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });

  it('should call getBillsList on prev', () => {
    spyOn(component, 'getPaginationData');
    component.page = 2;
    component.prev();
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should navigate to correct route on posting', () => {
    spyOn(component.router, 'navigate');
    component.posting('invoiceId');
    expect(component.router.navigate).toHaveBeenCalledWith(['/finance/' + component.urlParam.key + '/invoiceId/posting']);
  });
  
  it('should reset search parameters and call getBillsList on clear', () => {
    spyOn(component, 'getBillsList');
    component.searchBillNo = '123';
    component.searchVendor = 'Vendor1';
    component.searchAmount = '500';
    component.searchDate = '2024-03-11';
    component.searchDeuDate = '2024-03-20';
    component.searchStatus = 'Paid';
  
    component.clear();
    expect(component.searchBillNo).toEqual('');
    expect(component.searchVendor).toEqual('');
    expect(component.searchAmount).toEqual('');
    expect(component.searchDate).toEqual('');
    expect(component.searchDeuDate).toEqual('');
    expect(component.searchStatus).toEqual('');
    expect(component.getBillsList).toHaveBeenCalled();
  });
  
  it('should call getPaginationData with "next" on next when totalCount is greater than count', () => {
    spyOn(component, 'getPaginationData');
    component.toalLength = 20;
    component.count = 10;
    component.next();
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });
  
  it('should call getPaginationData with "prev" on prev when page is greater than 0', () => {
    spyOn(component, 'getPaginationData');
    component.page = 2;
    component.prev();
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });
  

  it('should call clear and reset search parameters on clearGloble', () => {
    spyOn(component, 'clear');
    component.globalSearch = 'searchQuery';
    component.clearGloble();
    expect(component.globalSearch).toEqual('');
    expect(component.clear).toHaveBeenCalled();
  });
  
  it('should call exportToExcel on export', () => {
    spyOn(component.commonfunction, 'exportToExcel');
    component.export();
    expect(component.commonfunction.exportToExcel).toHaveBeenCalled();
  });

  it('should navigate to add route on onOpenNew', () => {
    spyOn(component.router, 'navigate');
    component.isparent = 'finance';
    component.urlParam = { id: '1', key: '2' };
    component.onOpenNew();
    expect(component.router.navigate).toHaveBeenCalledWith(['/finance/2/add']);
  });

  it('should navigate to edit route on onOpenEdit', () => {
    spyOn(component.router, 'navigate');
    component.isparent = 'finance';
    component.urlParam = { id: '1', key: '2' };
    component.onOpenEdit('invoiceId');
    expect(component.router.navigate).toHaveBeenCalledWith(['/finance/2/invoiceId/edit']);
  });

  it('should navigate to list route on onBillAction', () => {
    spyOn(component.router, 'navigate');
    component.isparent = 'finance';
    component.urlParam = { id: '1', key: '2' };
    component.onBillAction();
    expect(component.router.navigate).toHaveBeenCalledWith(['/finance/2']);
  });

  it('should call getBillsList on ngOnInit', () => {
    spyOn(component, 'getBillsList');
    component.ngOnInit();
    expect(component.getBillsList).toHaveBeenCalled();
  });

});
