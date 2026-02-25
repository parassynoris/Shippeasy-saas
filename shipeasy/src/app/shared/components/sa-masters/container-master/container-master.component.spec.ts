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
import { ContainerMasterComponent } from './container-master.component';
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

describe('ContainerMasterComponent', () => {
  let component: ContainerMasterComponent;
  let fixture: ComponentFixture<ContainerMasterComponent>;
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
      declarations: [ContainerMasterComponent, MockTranslatePipe],
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
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContainerMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with correct controls', () => {
    expect(component.addContainerForm).toBeTruthy();
    expect(component.addContainerForm.controls['containerNo']).toBeTruthy();
    // Add more expectations for other form controls
  });

  it('should call getContainerData on ngOnInit', () => {
    spyOn(component, 'getContainerData');
    component.ngOnInit();
    expect(component.getContainerData).toHaveBeenCalled();
  });

  it('should call onSave when onSave() is called', () => {
    spyOn(component, 'onSave');
    component.onSave();
    expect(component.onSave).toHaveBeenCalled();
  });

  it('should call exportAsExcelFile when exportAsExcelFile() is called', () => {
    spyOn(component, 'exportAsExcelFile');
    component.exportAsExcelFile();
    expect(component.exportAsExcelFile).toHaveBeenCalled();
  });

  it('should set soc to true and validate maxGrossWeight and maxPayload when chageSoc is called with true', () => {
    component.addContainerForm.controls['soc'].setValue(true);
    component.chageSoc({ target: { checked: true } });
  
    expect(component.soc).toBe(true);
    expect(component.addContainerForm.get('maxGrossWeight').hasError('required')).toBe(true);
    expect(component.addContainerForm.get('maxPayload').hasError('required')).toBe(true);
  });
  
  it('should set soc to false and clear validation for maxGrossWeight and maxPayload when chageSoc is called with false', () => {
    component.addContainerForm.controls['soc'].setValue(false);
    component.chageSoc({ target: { checked: false } });
  
    expect(component.soc).toBe(false);
    expect(component.addContainerForm.get('maxGrossWeight').hasError('required')).toBe(false);
    expect(component.addContainerForm.get('maxPayload').hasError('required')).toBe(false);
  });
  
  it('should open modal when open() is called', () => {
    const mockModalRef: NgbModalRef = { componentInstance: {}, result: Promise.resolve('closed') } as any;
    mockNgbModal.open.and.returnValue(mockModalRef);
  
    component.open('content', null, 'show');
  
    expect(mockNgbModal.open).toHaveBeenCalledOnceWith('content', {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  });

  it('should call exportAsExcelFile and openPDF when exportAsExcelFile and openPDF are called', () => {
    spyOn(component, 'exportAsExcelFile');
    spyOn(component, 'openPDF');
    component.exportAsExcelFile();
    component.openPDF();
    expect(component.exportAsExcelFile).toHaveBeenCalled();
    expect(component.openPDF).toHaveBeenCalled();
  });

  it('should clear validators when chageSoc is called with false', () => {
    component.soc = true;
    component.chageSoc({ target: { checked: false } });
    expect(component.soc).toBeFalsy();
    expect(component.addContainerForm.get('maxGrossWeight').hasError('required')).toBeFalsy();
    expect(component.addContainerForm.get('maxPayload').hasError('required')).toBeFalsy();
  });
  
  it('should clear validators when clickOnOneWay is called with false', () => {
    component.clickOnOneWay({ target: { checked: false } });
    expect(component.addContainerForm.get('containerOperator').hasError('required')).toBeFalsy();
    expect(component.addContainerForm.get('pickLocation').hasError('required')).toBeFalsy();
    expect(component.addContainerForm.get('dropLocation').hasError('required')).toBeFalsy();
  });

  it('should disable/enable form controls based on soc checkbox', () => {
    component.addContainerForm.controls['soc'].setValue(true);
    component.chageSoc({ target: { checked: true } });
  
    expect(component.soc).toBe(true);
    expect(component.addContainerForm.get('maxGrossWeight').hasError('required')).toBe(true);
    expect(component.addContainerForm.get('maxPayload').hasError('required')).toBe(true);
  
    component.addContainerForm.controls['soc'].setValue(false);
    component.chageSoc({ target: { checked: false } });
  
    expect(component.soc).toBe(false);
    expect(component.addContainerForm.get('maxGrossWeight').getError('required')).toBe(null);
    expect(component.addContainerForm.get('maxPayload').getError('required')).toBe(null);
  });
  
  it('should add/remove validators based on oneWay checkbox', () => {
    component.addContainerForm.controls['oneWay'].setValue(true);
    component.clickOnOneWay({ target: { checked: true } });
  
    expect(component.addContainerForm.get('containerOperator').hasError('required')).toBe(true);
    expect(component.addContainerForm.get('pickLocation').hasError('required')).toBe(true);
    expect(component.addContainerForm.get('dropLocation').hasError('required')).toBe(true);
  
    component.addContainerForm.controls['oneWay'].setValue(false);
    component.clickOnOneWay({ target: { checked: false } });
  
    expect(component.addContainerForm.get('containerOperator').getError('required')).toBe(null);
    expect(component.addContainerForm.get('pickLocation').getError('required')).toBe(null);
    expect(component.addContainerForm.get('dropLocation').getError('required')).toBe(null);
  });

  it('should update containerStatus and containerStatusId when container is edited', () => {
    const containerMaster = {
      containermasterId: '123',
      containerStatus: 'InUse',
      containerStatusId: true,
      // other properties...
    };
    
    component.open(null, containerMaster, 'edit');
  
    expect(component.containerStatus).toEqual('InUse');
    expect(component.isStatus).toEqual(true);
  });
  
  it('should open the modal in read-only mode when show container details is triggered', () => {
    const containerMaster = {
      containermasterId: '456',
      containerStatus: 'Available',
      containerStatusId: false,
      // other properties...
    };
  
    component.open(null, containerMaster, 'show');
  
    expect(component.isEdit).toBe(true);
    expect(component.show).toEqual('show');
    expect(component.addContainerForm.disabled).toBe(true);
  });

  it('should call getPaginationData method with "prev" parameter when prev is called', () => {
    spyOn(component, 'getPaginationData');
  
    component.prev();
  
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });
  
  it('should call getContainerData method when filter is called', () => {
    spyOn(component, 'getContainerData');
  
    component.filter({ target: { value: 10 } });
  
    expect(component.size).toBe(10);
    expect(component.fromSize).toBe(1);
    expect(component.getContainerData).toHaveBeenCalled();
  });

});

