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
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common'; import { OrderByPipe } from 'src/app/shared/util/sort';
import { BatchCloseComponent } from './batch-close.component';
import { CustomCurrencyPipe } from '../../pipes/custom-currency.pipe';






@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('BatchCloseComponent', () => {
  let component: BatchCloseComponent;
  let fixture: ComponentFixture<BatchCloseComponent>;
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
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList', 'UpdateToST']);

    TestBed.configureTestingModule({
      declarations: [BatchCloseComponent, MockTranslatePipe,CustomCurrencyPipe],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientModule],
      providers: [DatePipe, OrderByPipe,CurrencyPipe,DecimalPipe,
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
    fixture = TestBed.createComponent(BatchCloseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getBatchById on ngOnInit', () => {
    spyOn(component, 'getBatchById');
    component.ngOnInit();
    expect(component.getBatchById).toHaveBeenCalled();
  });

  it('should call onCancel and navigate to /batch/list', () => {
    spyOn(component.router, 'navigate');
    component.onCancel();
    expect(component.router.navigate).toHaveBeenCalledWith(['/batch/list']);
  });
  
  it('should call onClose and navigate to /{isTypePage}/list', () => {
    spyOn(component.router, 'navigate');
  
    component.onClose();
  
    expect(component.router.navigate).toHaveBeenCalledWith(['/' + component.isTypePage + '/list']);
  });

  it('should get batch data and update UI based on status', () => {
    mockApiService.getSTList.and.returnValue(of({ documents: [{ statusOfBatch: 'Job Cancelled' }] }));
    component.getBatchById();
    expect(mockApiService.getSTList).toHaveBeenCalled();
    expect(component.isShow).toBeFalse();
  });

  it('should handle successful invoice payment status', () => {
    const mockInvoices = [
      { paymentStatus: 'Paid' },
      { paymentStatus: 'Paid' },
    ];
    component.invoiceData = mockInvoices;
    component.ngOnInit();
    expect(component.invoicePaymetStatus).toBeFalse();
  });

  it('should handle credit note status', () => {
    const mockInvoices = [
      { creditNote: true },
      { creditNote: true },
    ];
    component.invoiceData = mockInvoices;
    component.ngOnInit();
    expect(component.creditStatus).toBeFalse();
  });

});
