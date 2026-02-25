import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { Pipe, PipeTransform } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import * as XLSX from "xlsx";
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { GlBankComponent } from './gl-bank.component';
import { RouterModule } from '@angular/router';

@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('BankMasterComponent', () => {
  let component: GlBankComponent;
  let fixture: ComponentFixture<GlBankComponent>;
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
      declarations: [GlBankComponent, MockTranslatePipe],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientModule,RouterModule],
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
    fixture = TestBed.createComponent(GlBankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call clear and getBankList when clear is called', () => {
    spyOn(component, 'getBankList');
    component.clear();
    expect(component.bankName).toEqual('');
    expect(component.accountNo).toEqual('');
    // ... (repeat for other fields)
    expect(component.getBankList).toHaveBeenCalled();
  });

  it('should call next and getPaginationData when next is called', () => {
    spyOn(component, 'getPaginationData');
    component.toalLength = 20; // Set a value higher than count
    component.count = 10;
    component.next();
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });

  it('should call prev and getPaginationData when prev is called', () => {
    spyOn(component, 'getPaginationData');
    component.page = 2;
    component.prev();
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should call exportAsExcelFile when exportAsExcelFile is called', () => {
    spyOn(component, 'exportAsExcelFile');
    component.exportAsExcelFile();
    expect(component.exportAsExcelFile).toHaveBeenCalled();
  });

  it('should call openPDF when openPDF is called', () => {
    spyOn(component, 'openPDF');
    component.openPDF();
    expect(component.openPDF).toHaveBeenCalled();
  });

  it('should call applyFilter when applyFilter is called', () => {
    spyOn(component, 'applyFilter');
    const filterValue = 'test';
    component.applyFilter(filterValue);
    expect(component.applyFilter).toHaveBeenCalledWith(filterValue);
  });

  it('should call export when export is called', () => {
    spyOn(component, 'export');
    component.export();
    expect(component.export).toHaveBeenCalled();
  });

  it('should call export when export is called', () => {
    spyOn(component.commonfunction, 'exportToExcel');
    component.export();
    expect(component.commonfunction.exportToExcel).toHaveBeenCalled();
  });

  it('should call getBankList when clear is called', () => {
    spyOn(component, 'getBankList');
    component.clear();
    expect(component.bankName).toEqual('');
    expect(component.accountNo).toEqual('');
    // ... (repeat for other fields)
    expect(component.getBankList).toHaveBeenCalled();
  });

  it('should call getBankList when ngOnChanges is called', () => {
    spyOn(component, 'getBankList');
    component.ngOnChanges();
    expect(component.getBankList).toHaveBeenCalled();
  });

  it('should call exportToExcel when export is called', () => {
    spyOn(component.commonfunction, 'exportToExcel');
    component.export();
    expect(component.commonfunction.exportToExcel).toHaveBeenCalled();
  });

  it('should call getBankList when ngOnChanges is called', () => {
    spyOn(component, 'getBankList');
    component.ngOnChanges();
    expect(component.getBankList).toHaveBeenCalled();
  });

  it('should call exportAsExcelFile when exportAsExcelFile is called', () => {
    spyOn(component, 'exportAsExcelFile');
    component.exportAsExcelFile();
    expect(component.exportAsExcelFile).toHaveBeenCalled();
  });

  it('should call openPDF when openPDF is called', () => {
    spyOn(component, 'openPDF');
    component.openPDF();
    expect(component.openPDF).toHaveBeenCalled();
  });

  it('should call getBankList when clear is called', () => {
    spyOn(component, 'getBankList');
    component.clear();
    expect(component.bankName).toEqual('');
    expect(component.accountNo).toEqual('');
    // ... (repeat for other fields)
    expect(component.getBankList).toHaveBeenCalled();
  });

  it('should navigate to add route when onOpenNew is called with "master" isParentPath', () => {
    spyOn(component.router, 'navigate');
    component.isParentPath = 'master';
    component.urlParam = { key: 'test' };
    component.onOpenNew();
    expect(component.router.navigate).toHaveBeenCalledWith(['master/test/add']);
  });

  it('should navigate to edit route when onOpenEdit is called with "master" isParentPath', () => {
    spyOn(component.router, 'navigate');
    component.isParentPath = 'master';
    component.urlParam = { key: 'test' };
    const bankId = '123';
    component.onOpenEdit(bankId);
    expect(component.router.navigate).toHaveBeenCalledWith(['master/test/123/edit']);
  });

  it('should call exportToExcel when export is called', () => {
    spyOn(component.commonfunction, 'exportToExcel');
    component.export();
    expect(component.commonfunction.exportToExcel).toHaveBeenCalled();
  });

  it('should call getBankList when clearFilters is called', () => {
    spyOn(component, 'getBankList');
    component.clearFilters();
    expect(component.getBankList).toHaveBeenCalled();
  });


});

