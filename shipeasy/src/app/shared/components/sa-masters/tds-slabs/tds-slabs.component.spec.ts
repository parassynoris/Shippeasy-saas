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
import { TdsSlabsComponent } from './tds-slabs.component';
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

describe(' TdsSlabsComponent', () => {
  let component: TdsSlabsComponent;
  let fixture: ComponentFixture< TdsSlabsComponent>;
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
      declarations: [ TdsSlabsComponent, MockTranslatePipe,MastersSortPipe],
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
        {provide:MastersSortPipe, useValue:MastersSortPipe},
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent( TdsSlabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form on ngOnInit', () => {
    component.ngOnInit();
    expect(component.addContainerForm).toBeTruthy();
  });

  it('should call getContainerData on ngOnInit', () => {
    spyOn(component, 'getContainerData');
    component.ngOnInit();
    expect(component.getContainerData).toHaveBeenCalled();
  });

  it('should call getPaginationData with type "next" on next', () => {
    component.toalLength = 20;
    component.count = 10;
    spyOn(component, 'getPaginationData');
    component.next();
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });

  it('should call getContainerData on filter', () => {
    const event = { target: { value: '20' } };
    spyOn(component, 'getContainerData');
    component.filter(event);
    expect(component.getContainerData).toHaveBeenCalled();
  });

  it('should call getPaginationData with type "prev" on prev', () => {
    const event = { target: { value: '10' } };
    spyOn(component, 'getContainerData');
    component.filter(event);
    expect(component.getContainerData).toHaveBeenCalled();
  });

  it('should call clear on clear', () => {
    spyOn(component, 'clear');
    component.clear();
    expect(component.clear).toHaveBeenCalled();
  });

  it('should call onSave on onSave', () => {
    spyOn(component, 'onSave');
    component.onSave();
    expect(component.onSave).toHaveBeenCalled();
  });

  it('should call containerMaster on containerMaster', () => {
    spyOn(component, 'containerMaster');
    component.containerMaster();
    expect(component.containerMaster).toHaveBeenCalled();
  });

  it('should call delete on delete', () => {
    const mockModalRef = jasmine.createSpyObj('NgbModalRef', ['result']);
    mockNgbModal.open.and.returnValue(mockModalRef);
    spyOn(component, 'delete');
    component.delete('deletecontainer', { tdsId: '1' });
    expect(component.delete).toHaveBeenCalled();
  });

  it('should call changeStatus on changeStatus', () => {
    spyOn(component, 'changeStatus');
    component.changeStatus({ tdsId: '1' });
    expect(component.changeStatus).toHaveBeenCalled();
  });

  it('should call exportAsExcelFile on exportAsExcelFile', () => {
    spyOn(component, 'exportAsExcelFile');
    component.exportAsExcelFile();
    expect(component.exportAsExcelFile).toHaveBeenCalled();
  });

  it('should call openPDF on openPDF', () => {
    spyOn(component, 'openPDF');
    component.openPDF();
    expect(component.openPDF).toHaveBeenCalled();
  });

  it('should call getPaginationData with type "next" on next when toalLength is greater than count', () => {
    component.toalLength = 20;
    component.count = 10;
    spyOn(component, 'getPaginationData');
    component.next();
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });

  it('should not call getPaginationData on next when toalLength is not greater than count', () => {
    component.toalLength = 10;
    component.count = 10;
    spyOn(component, 'getPaginationData');
    component.next();
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });

  it('should not call getPaginationData on prev when page is 0', () => {
    component.page = 0;
    spyOn(component, 'getPaginationData');
    component.prev();
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });

  it('should call getContainerData on filter', () => {
    const event = { target: { value: '20' } };
    spyOn(component, 'getContainerData');
    component.filter(event);
    expect(component.getContainerData).toHaveBeenCalled();
  });

  it('should call getContainerData on ngOnInit', () => {
    spyOn(component, 'getContainerData');
    component.ngOnInit();
    expect(component.getContainerData).toHaveBeenCalled();
  });

  it('should not call getPaginationData on prev when page is 0', () => {
    component.page = 0;
    spyOn(component, 'getPaginationData');
    component.prev();
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });

  it('should call getContainerData on filter', () => {
    const event = { target: { value: '20' } };
    spyOn(component, 'getContainerData');
    component.filter(event);
    expect(component.getContainerData).toHaveBeenCalled();
  });
});


