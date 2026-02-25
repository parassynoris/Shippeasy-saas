import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { Pipe, PipeTransform } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import * as XLSX from "xlsx";
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common'; import { OrderByPipe } from 'src/app/shared/util/sort';
import { InvoiceComponent } from './invoice.component';


@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('InvoiceComponent', () => {
  let component: InvoiceComponent;
  let fixture: ComponentFixture<InvoiceComponent>;
  let mockNgbModal: jasmine.SpyObj<NgbModal>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockNotificationService: jasmine.SpyObj<NzNotificationService>;
  let mockMastersService: jasmine.SpyObj<MastersService>;
  let mockProfilesService: jasmine.SpyObj<ProfilesService>;
  let mockCognitoService: jasmine.SpyObj<CognitoService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let modalService: NgbModal;
  

  beforeEach(waitForAsync(() => {
    mockNgbModal = jasmine.createSpyObj('NgbModal', ['open']);
    mockApiService = jasmine.createSpyObj('ApiService', ['getSTList', 'addToST', 'UpdateToST', 'deleteST']);
    mockNotificationService = jasmine.createSpyObj('NzNotificationService', ['create']);
    mockMastersService = jasmine.createSpyObj('MastersService', ['getSTList']);
    mockProfilesService = jasmine.createSpyObj('ProfilesService', ['getUserDetails']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails','getagentDetails']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList', 'UpdateToST']);

    TestBed.configureTestingModule({
      declarations: [InvoiceComponent, MockTranslatePipe],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientModule],
      providers: [DatePipe, OrderByPipe,
        { provide: NgbModal, useValue: mockNgbModal },
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
    fixture = TestBed.createComponent(InvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should call getInvoiceList on ngOnInit', fakeAsync(() => {
    spyOn(component, 'getInvoiceList');
    component.ngOnInit();
    tick(500);
    expect(component.getInvoiceList).toHaveBeenCalled();
  }));

  it('should call onOpenInvoice and navigate to the correct URL when isFinanceInvoice is false', () => {
    spyOn(component.router, 'navigate');
    component.onOpenInvoice();
    expect(component.router.navigate).toHaveBeenCalledWith(['/batch/list/add/' + component.urlParam.id + '/' + component.urlParam.key + '/add']);
  });

  it('should call onCloseNew and navigate to the correct URL when isFinanceInvoice is false', () => {
    spyOn(component.router, 'navigate');
    component.onCloseNew();
    expect(component.router.navigate).toHaveBeenCalledWith(['/batch/list/add/' + component.urlParam.id + '/' + component.urlParam.key]);
  });

  it('should call onEditInvoice and navigate to the correct URL when isFinanceInvoice is false', () => {
    spyOn(component.router, 'navigate');
    const invoiceId = '123';
    component.onEditInvoice(invoiceId);
    expect(component.router.navigate).toHaveBeenCalledWith(['/batch/list/add/' + component.urlParam.id + '/' + component.urlParam.key + '/' + invoiceId + '/edit']);
  });

 

  it('should call prev and update pagination details', () => {
    spyOn(component, 'getPaginationData');
    component.prev();
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

 

  it('should call clear and reset search criteria', () => {
    spyOn(component, 'getInvoiceList');
    component.invoice_no = '123';
    component.invoice_to = 'John Doe';
    component.clear();
    expect(component.invoice_no).toBe('');
    expect(component.invoice_to).toBe('');
    expect(component.getInvoiceList).toHaveBeenCalled();
  });

  it('should navigate to the correct URL when calling onOpenInvoice', () => {
    spyOn(component.router, 'navigate');
    component.onOpenInvoice();
    expect(component.router.navigate).toHaveBeenCalledWith(['/batch/list/add/' + component.urlParam.id + '/' + component.urlParam.key + '/add']);
  });

  it('should navigate to the correct URL when calling onCloseNew', () => {
    spyOn(component.router, 'navigate');
    component.onCloseNew();
    expect(component.router.navigate).toHaveBeenCalledWith(['/batch/list/add/' + component.urlParam.id + '/' + component.urlParam.key]);
  });

  it('should call clearGloble and reset global search criteria', () => {
    spyOn(component, 'getInvoiceList');
    component.globalSearch = '123';
    component.clearGloble();
    expect(component.globalSearch).toBe('');
    expect(component.getInvoiceList).toHaveBeenCalled();
  });

  it('should call clearFilters and reset filtersModel and filterKeys', () => {
    spyOn(component, 'getInvoiceList');
    component.filtersModel = ['John Doe', '2024-03-07'];
    component.clearFilters();
    expect(component.filtersModel).toEqual([]);
    expect(component.filterKeys).toEqual({});
    expect(component.getInvoiceList).toHaveBeenCalled();
  });

  it('should call getPaginationData with prev when calling prev', () => {
    spyOn(component, 'getPaginationData');
    component.prev();
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  
 



});
