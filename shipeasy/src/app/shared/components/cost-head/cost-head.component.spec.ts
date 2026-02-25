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
import { CostHeadComponent } from './cost-head.component';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { CostheadaddComponent } from './costheadadd/costheadadd.component';
import { MastersSortPipe } from '../../util/mastersort';
import { SharedModule } from '../../shared.module';
@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('CostHeadComponent', () => {
  let component: CostHeadComponent;
  let fixture: ComponentFixture<CostHeadComponent>;

  // Mock services and dependencies
  const mockNgbModalRef: Partial<NgbModalRef> = {};
  const mockNgbModal = {
    open: jasmine.createSpy('open').and.returnValue(mockNgbModalRef),
  };
  const mockApiService = jasmine.createSpyObj('ApiService', ['getSTList', 'addToST', 'UpdateToST', 'deleteST']);
  const mockNotificationService = jasmine.createSpyObj('NzNotificationService', ['create']);
  const mockMastersService = jasmine.createSpyObj('MastersService', ['getSTList']);
  const mockProfilesService = jasmine.createSpyObj('ProfilesService', ['getUserDetails']);
  const mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails']);
  const mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList']);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CostHeadComponent, MockTranslatePipe,MastersSortPipe],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule],
      providers: [
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
    fixture = TestBed.createComponent(CostHeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should go to the next page if there are more items', () => {
    component.toalLength = 15;
    component.count = 10;
    spyOn(component, 'getPaginationData');
    component.next();
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });
  
  it('should go to the previous page if not on the first page', () => {
    component.page = 2;
    spyOn(component, 'getPaginationData');
    component.prev();
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });
  it('should update size on filter change', () => {
    const newSize = 20;
    spyOn(component, 'getCostHeadList');
    component.filter({ target: { value: newSize } });
    expect(component.size).toEqual(newSize);
    expect(component.fromSize).toEqual(1);
    expect(component.getCostHeadList).toHaveBeenCalled();
  });
  it('should initialize with the provided prentPath input', () => {
    const mockPrentPath = 'mockPath';
    component.prentPath = mockPrentPath;
    
    fixture.detectChanges();
    
    expect(component.prentPath).toEqual(mockPrentPath);
    // Add more expectations if needed
  });
  it('should not go to the next page if already at the last page', () => {
    component.toalLength = 20;
    component.count = 20;
    spyOn(component, 'getPaginationData');
    
    component.next();
  
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });
  
  it('should not go to the previous page if already at the first page', () => {
    component.page = 1;
    spyOn(component, 'getPaginationData');
    
    component.prev();
  
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });

  it('should not go to the next page if already at the last page', () => {
    component.toalLength = 20;
    component.count = 20;
    spyOn(component, 'getPaginationData');
    
    component.next();
  
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });
  
  it('should not go to the previous page if already at the first page', () => {
    component.page = 1;
    spyOn(component, 'getPaginationData');
    
    component.prev();
  
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });
  
  it('should go to the previous page if not already at the first page', () => {
    component.page = 2;
    spyOn(component, 'getPaginationData');
    
    component.prev();
  
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });
  
  it('should call getCostHeadList on initialization', () => {
    spyOn(component, 'getCostHeadList');
    
    component.ngOnInit();
  
    expect(component.getCostHeadList).toHaveBeenCalled();
  });

  it('should initialize with the provided input values', () => {
    const mockInput = 'mockInputValue';
    component.prentPath = mockInput;
  
    fixture.detectChanges();
  
    expect(component.prentPath).toEqual(mockInput);
    // Add more expectations if needed
  });
    
});
