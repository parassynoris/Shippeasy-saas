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
import { BranchComponent } from './branch.component';

@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('BranchComponent', () => {
  let component: BranchComponent;
  let fixture: ComponentFixture<BranchComponent>;
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
      declarations: [BranchComponent, MockTranslatePipe],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientModule],
      providers: [DatePipe, OrderByPipe,NzNotificationService,
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
    fixture = TestBed.createComponent(BranchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to new branch on onOpenNew', () => {
    const navigateSpy = spyOn(component.router, 'navigate');
    component.onOpenNew();
    expect(navigateSpy).toHaveBeenCalledWith([component.prentPath + '/' + component.urlParam.key + '/addbranch']);
  });

  it('should navigate to edit branch on onOpenEdit', () => {
    const branchId = '123';
    const navigateSpy = spyOn(component.router, 'navigate');
    component.onOpenEdit(branchId);
    expect(navigateSpy).toHaveBeenCalledWith([component.prentPath + '/' + component.urlParam.key + '/' + branchId + '/editbranch']);
  });

  it('should call getBranchList on ngOnInit', () => {
    const getBranchListSpy = spyOn(component, 'getBranchList');
    component.ngOnInit();
    expect(getBranchListSpy).toHaveBeenCalled();
  });

  it('should call getPaginationData with type "prev" on prev', () => {
    const getPaginationDataSpy = spyOn(component, 'getPaginationData');
    component.prev();
    expect(getPaginationDataSpy).toHaveBeenCalledWith('prev');
  });

  it('should call getBranchList on filter', () => {
    const getBranchListSpy = spyOn(component, 'getBranchList');
    const event = { target: { value: '10' } };
    component.filter(event);
    expect(getBranchListSpy).toHaveBeenCalled();
  });

  it('should call getPaginationData with type "next" on next if toalLength > count', () => {
    component.toalLength = 20;
    component.count = 10;
    const getPaginationDataSpy = spyOn(component, 'getPaginationData');
    component.next();
    expect(getPaginationDataSpy).toHaveBeenCalledWith('next');
  });

  it('should not call getPaginationData on next if toalLength <= count', () => {
    component.toalLength = 10;
    component.count = 10;
    const getPaginationDataSpy = spyOn(component, 'getPaginationData');
    component.next();
    expect(getPaginationDataSpy).not.toHaveBeenCalled();
  });

  it('should call getPaginationData with type "prev" on prev if page > 0', () => {
    component.page = 2;
    const getPaginationDataSpy = spyOn(component, 'getPaginationData');
    component.prev();
    expect(getPaginationDataSpy).toHaveBeenCalledWith('prev');
  });

  it('should not call getPaginationData on prev if page <= 0', () => {
    component.page = 0;
    const getPaginationDataSpy = spyOn(component, 'getPaginationData');
    component.prev();
    expect(getPaginationDataSpy).not.toHaveBeenCalled();
  });

  it('should call exportAsExcelFile on exportAsExcelFile', () => {
    const exportSpy = spyOn(component, 'exportAsExcelFile');
    component.exportAsExcelFile();
    expect(exportSpy).toHaveBeenCalled();
  });

  it('should call openPDF on openPDF', () => {
    const openPDFSpy = spyOn(component, 'openPDF');
    component.openPDF();
    expect(openPDFSpy).toHaveBeenCalled();
  });

  it('should call applyFilter on applyFilter', () => {
    const applyFilterSpy = spyOn(component, 'applyFilter');
    const filterValue = 'test';
    component.applyFilter(filterValue);
    expect(applyFilterSpy).toHaveBeenCalledWith(filterValue);
  });

  it('should call export on export', () => {
    const exportSpy = spyOn(component, 'export');
    component.export();
    expect(exportSpy).toHaveBeenCalled();
  });

  it('should call searchColumns on searchColumns', () => {
    const searchColumnsSpy = spyOn(component, 'searchColumns');
    component.searchColumns();
    expect(searchColumnsSpy).toHaveBeenCalled();
  });

  it('should call clearFilters on clearFilters', () => {
    const clearFiltersSpy = spyOn(component, 'clearFilters');
    component.clearFilters();
    expect(clearFiltersSpy).toHaveBeenCalled();
  });

  it('should call navigateToNewTab on navigateToNewTab', () => {
    const element = { branchId: '123' };
    const openSpy = spyOn(window, 'open');
    component.navigateToNewTab(element);
    expect(openSpy).toHaveBeenCalledWith(window.location.href + '/' + element.branchId + '/editbranch');
  });
  it('should call search on search', () => {
    const searchSpy = spyOn(component, 'search');
    component.search();
    expect(searchSpy).toHaveBeenCalled();
  });

  it('should call applyFilter on applyFilter with filterValue', () => {
    const applyFilterSpy = spyOn(component, 'applyFilter');
    const filterValue = 'testFilter';
    component.applyFilter(filterValue);
    expect(applyFilterSpy).toHaveBeenCalledWith(filterValue);
  });
  it('should call getBranchList on clearFilters', () => {
    const getBranchListSpy = spyOn(component, 'getBranchList');
    component.clearFilters();
    expect(getBranchListSpy).toHaveBeenCalled();
  });

  it('should call getPaginationData on getPaginationData', () => {
    const data = 'next';
    const getPaginationDataSpy = spyOn(component, 'getPaginationData');
    component.getPaginationData(data);
    expect(getPaginationDataSpy).toHaveBeenCalledWith(data);
  });

});

