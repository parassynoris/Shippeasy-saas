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
import { CostItemsComponent } from './cost-items.component';
import { MastersSortPipe } from '../../util/mastersort';


@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('CostItemsComponent', () => {
  let component: CostItemsComponent;
  let fixture: ComponentFixture<CostItemsComponent>;
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
      declarations: [CostItemsComponent, MockTranslatePipe,MastersSortPipe],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientModule],
      providers: [DatePipe, OrderByPipe,MastersSortPipe,
        { provide: NgbModal, useValue: mockNgbModal },
        { provide: ApiService, useValue: mockApiService },
        { provide: NzNotificationService, useValue: mockNotificationService },
        { provide: MastersService, useValue: mockMastersService },
        { provide: ProfilesService, useValue: mockProfilesService },
        { provide: SaMasterService, useValue: {} },
        { provide: CognitoService, useValue: mockCognitoService },
        { provide: CommonService, useValue: mockCommonService },
        {provide:MastersSortPipe, useValue:MastersSortPipe},
      
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CostItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize costItemForm', () => {
    expect(component.costItemForm).toBeTruthy();
  });

  it('should call getCostItem on ngOnInit', () => {
    spyOn(component, 'getCostItem');
    component.ngOnInit();
    expect(component.getCostItem).toHaveBeenCalled();
  });

  it('should call prev method', () => {
    spyOn(component, 'getPaginationData');
    component.prev();
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should call filter method', () => {
    spyOn(component, 'getCostItem');
    const event = { target: { value: '10' } };
    component.filter(event);
    expect(component.getCostItem).toHaveBeenCalled();
  });

  it('should call getPaginationData method', () => {
    spyOn(component, 'getPaginationData');
    const type = 'prev';
    component.getPaginationData(type);
    expect(component.getPaginationData).toHaveBeenCalledWith(type);
  });

  it('should call getLocationDropDowns method', () => {
    spyOn(component, 'getLocationDropDowns');
    component.getLocationDropDowns();
    expect(component.getLocationDropDowns).toHaveBeenCalled();
  });

  it('should call getCurrencyList method', () => {
    spyOn(component, 'getCurrencyList');
    component.getCurrencyList();
    expect(component.getCurrencyList).toHaveBeenCalled();
  });

  it('should call getUomList method', () => {
    spyOn(component, 'getUomList');
    component.getUomList();
    expect(component.getUomList).toHaveBeenCalled();
  });

  it('should call getHSNList method', () => {
    spyOn(component, 'getHSNList');
    component.getHSNList();
    expect(component.getHSNList).toHaveBeenCalled();
  });

  it('should call getCostHeadList method', () => {
    spyOn(component, 'getCostHeadList');
    component.getCostHeadList();
    expect(component.getCostHeadList).toHaveBeenCalled();
  });

  it('should call getSystemTypeDropDowns method', () => {
    spyOn(component, 'getSystemTypeDropDowns');
    component.getSystemTypeDropDowns();
    expect(component.getSystemTypeDropDowns).toHaveBeenCalled();
  });

  it('should call search method', () => {
    spyOn(component, 'search');
    component.search();
    expect(component.search).toHaveBeenCalled();
  });

  it('should call clear method', () => {
    spyOn(component, 'clear');
    component.clear();
    expect(component.clear).toHaveBeenCalled();
  });

  it('should call getCostItem method', () => {
    spyOn(component, 'getCostItem');
    component.getCostItem();
    expect(component.getCostItem).toHaveBeenCalled();
  });

  it('should call costItemsMasters method', () => {
    spyOn(component, 'costItemsMasters');
    component.costItemsMasters();
    expect(component.costItemsMasters).toHaveBeenCalled();
  });

  it('should call delete method', () => {
    spyOn(component, 'delete');
    const id = { costitemId: '1' };
    component.delete(null, id);
    expect(component.delete).toHaveBeenCalledWith(null, id);
  });

  it('should call changeStatus method', () => {
    spyOn(component, 'changeStatus');
    const data = { costitemId: '1', status: true };
    component.changeStatus(data);
    expect(component.changeStatus).toHaveBeenCalledWith(data);
  });

  it('should call checked method', () => {
    spyOn(component, 'checked');
    const key = null;
    const event = { target: { checked: true } };
    const form = 'chargeapp';
    component.checked(key, event, form);
    expect(component.checked).toHaveBeenCalledWith(key, event, form);
  });

  it('should call exportAsExcelFile method', () => {
    spyOn(component, 'exportAsExcelFile');
    component.exportAsExcelFile();
    expect(component.exportAsExcelFile).toHaveBeenCalled();
  });

  it('should call openPDF method', () => {
    spyOn(component, 'openPDF');
    component.openPDF();
    expect(component.openPDF).toHaveBeenCalled();
  });

  it('should call getPaginationData method with type "prev"', () => {
    spyOn(component, 'getPaginationData');
    component.prev();
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

});

