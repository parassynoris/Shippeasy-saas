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
import { SacComponent } from './sac.component';
import { MastersSortPipe } from 'src/app/shared/util/mastersort';



@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('SacComponent', () => {
  let component: SacComponent;
  let fixture: ComponentFixture<SacComponent>;
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
      declarations: [SacComponent, MockTranslatePipe,MastersSortPipe],
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
        { provide: MastersSortPipe, useValue: MastersSortPipe },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SacComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize addContainerForm with default values', () => {
    const formValues = {
      hsnCode: '',
      description: '',
      hsnTypeId: '',
      changesItems: [],
      row: [],
    };
    expect(component.addContainerForm.value).toEqual(formValues);
  });

  it('should open modal in edit mode and disable form for show action', () => {
    const mockContainerMaster = { taxtypeId: '1', changesItems: [], rates: [] };
    
    component.open({}, mockContainerMaster, 'show');
  
    expect(component.isEdit).toBeTrue();
    expect(component.show).toEqual('show');
    expect(component.addContainerForm.disabled).toBeTrue();
    expect(component.containerIdToUpdate).toEqual(mockContainerMaster.taxtypeId);
  });

  it('should add a new row to the form array', () => {
    const initialRowsCount = component.row.length;
  
    component.addNewRow();
  
    expect(component.row.length).toEqual(initialRowsCount + 1);
  });

  it('should delete a row from the form array at the specified index', () => {
    component.row.push(component.addRow({ countryId: '1', rate: 5, isGSTExepm: false }));
    const initialRowsCount = component.row.length;
  
    component.deleteBranch(0);
  
    expect(component.row.length).toEqual(initialRowsCount - 1);
  });

  it('should return form controls', () => {
    expect(component.f.hsnCode).toBeDefined();
    expect(component.f.description).toBeDefined();
    expect(component.f.hsnTypeId).toBeDefined();
    expect(component.f.changesItems).toBeDefined();
    expect(component.f.row).toBeDefined();
  });

  it('should not increment page if there is no more data to fetch', () => {
    component.toalLength = 10;
    component.count = 10;
  
    component.next();
  
    expect(component.page).toEqual(1);
  });

  it('should clear search criteria and fetch container data', () => {
    component.hsnCode = '123';
    component.description = 'Test';
    component.hsnType = 'Type1';
    spyOn(component, 'getContainerData');
  
    component.clear();
  
    expect(component.hsnCode).toEqual('');
    expect(component.description).toEqual('');
    expect(component.hsnType).toEqual('');
    expect(component.getContainerData).toHaveBeenCalled();
  });

  it('should not delete a row if the index is invalid', () => {
    const initialRowsCount = component.row.length;
  
    component.deleteBranch(-1);
  
    expect(component.row.length).toEqual(initialRowsCount);
  });

  it('should not delete a row if the index is invalid', () => {
    const initialRowsCount = component.row.length;
  
    component.deleteBranch(-1);
  
    expect(component.row.length).toEqual(initialRowsCount);
  });

  it('should clear search criteria and fetch container data with previous criteria', () => {
    component.hsnCode = '123';
    component.description = 'Test';
    component.hsnType = 'Type1';
    spyOn(component, 'getContainerData');
  
    component.clear();
  
    expect(component.hsnCode).toEqual('');
    expect(component.description).toEqual('');
    expect(component.hsnType).toEqual('');
    expect(component.getContainerData).toHaveBeenCalled();
  });
  it('should add a new row to the form array', () => {
    const initialRowsCount = component.row.length;
  
    component.addNewRow();
  
    expect(component.row.length).toEqual(initialRowsCount + 1);
  });

  it('should return an empty array if form array is empty', () => {
    const result = component.addRate();
  
    expect(result.length).toEqual(0);
  });

  it('should return an empty array if form array is empty', () => {
    const result = component.addRate();
  
    expect(result.length).toEqual(0);
  });

  it('should call getContainerData with updated size', () => {
    const newSize = 20;
    spyOn(component, 'getContainerData');
  
    component.filter({ target: { value: newSize } });
  
    expect(component.size).toEqual(newSize);
    expect(component.fromSize).toEqual(1);
    expect(component.getContainerData).toHaveBeenCalled();
  });
  
});
