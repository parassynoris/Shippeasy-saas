import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { of, throwError } from 'rxjs';
import { ApiService } from 'src/app/admin/principal/api.service';

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
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonService } from 'src/app/services/common/common.service';
import { AddContainerComponent } from './add-container.component';

@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('AddContainerComponent', () => {
  let component: AddContainerComponent;
  let fixture: ComponentFixture<AddContainerComponent>;
  let mockNgbModal: jasmine.SpyObj<NgbModal>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockNotificationService: jasmine.SpyObj<NzNotificationService>;
  let mockMastersService: jasmine.SpyObj<MastersService>;
  let mockProfilesService: jasmine.SpyObj<ProfilesService>;
  let mockCognitoService: jasmine.SpyObj<CognitoService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let commonServiceSpy: jasmine.SpyObj<CommonService>;
  beforeEach(waitForAsync(() => {
    mockNgbModal = jasmine.createSpyObj('NgbModal', ['open']);
    mockApiService = jasmine.createSpyObj('ApiService', ['getSTList', 'addToST', 'UpdateToST', 'deleteST']);
    mockNotificationService = jasmine.createSpyObj('NzNotificationService', ['create']);
    mockMastersService = jasmine.createSpyObj('MastersService', ['getSTList']);
    mockProfilesService = jasmine.createSpyObj('ProfilesService', ['getUserDetails']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails','getagentDetails']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList', 'UpdateToST']);

    TestBed.configureTestingModule({
      declarations: [AddContainerComponent, MockTranslatePipe],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, NzSelectModule,NzDatePickerModule,RouterTestingModule,BrowserAnimationsModule ,HttpClientModule],
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
    fixture = TestBed.createComponent(AddContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update form validators based on checked status in chageSoc', () => {
    component.chageSoc({ target: { checked: true } });
    expect(component.soc).toBe(true);
    expect(component.addContainerForm.get('maxGrossWeight').hasError('required')).toBeTruthy();
    expect(component.addContainerForm.get('maxPayload').hasError('required')).toBeTruthy();
  
    component.chageSoc({ target: { checked: false } });
    expect(component.soc).toBe(false);
    expect(component.addContainerForm.get('maxGrossWeight').hasError('required')).toBeFalsy();
    expect(component.addContainerForm.get('maxPayload').hasError('required')).toBeFalsy();
  });
  ;
  
  it('should fetch location data successfully in getLocation', () => {
    const mockLocationData = [{ locationId: '1', locationName: 'Yard A' }];
  
    mockCommonService.filterList.and.returnValue({ query: {} }as any);
    mockCommonService.getSTList.and.returnValue(of({ documents: mockLocationData }));
  
    component.getLocation();
  
    expect(mockCommonService.filterList).toHaveBeenCalled();
    expect(mockCommonService.getSTList).toHaveBeenCalledWith('location', jasmine.any(Object));
    expect(component.yardList).toEqual(mockLocationData as any) ;
  });
  

  it('should fetch status data successfully in getStatusMasterDropDown', () => {
    const mockStatusData = [{ statusId: '1', statusName: 'Active' }];
  
    mockCommonService.filterList.and.returnValue({ query: {} }as any);
    mockCommonService.getSTList.and.returnValue(of({ documents: mockStatusData }));
  
    component.getStatusMasterDropDown();
  
    expect(mockCommonService.filterList).toHaveBeenCalled();
    expect(mockCommonService.getSTList).toHaveBeenCalledWith('status', jasmine.any(Object));
    expect(component.statusList).toEqual(mockStatusData);
  });
  it('should display an alert message in onDelete', () => {
    spyOn(window, 'alert');
    
    component.deleteclause('1');
  
    expect(window.alert).toHaveBeenCalledWith('Item deleted!');
  });

  it('should fetch container data successfully in getContainerData', () => {
    const mockContainerData = [{ containerId: '1', containerNo: 'ABC123' }];
  
    mockCommonService.filterList.and.returnValue({ query: {} }as any);
    mockCommonService.getSTList.and.returnValue(of({ documents: mockContainerData }));
  
    component.getContainerData();
  
    expect(mockCommonService.filterList).toHaveBeenCalled();
    expect(mockCommonService.getSTList).toHaveBeenCalledWith('containermaster', jasmine.any(Object));
    expect(component.containerlist).toEqual(mockContainerData as any);
  });

  it('should call necessary initialization methods in ngOnInit', () => {
    spyOn(component, 'getContainerData');
    spyOn(component, 'getLocation');
    spyOn(component, 'getSystemTypeDropDowns');
    spyOn(component, 'getStatusMasterDropDown');
  
    component.ngOnInit();
  
    expect(component.getContainerData).toHaveBeenCalled();
    expect(component.getLocation).toHaveBeenCalled();
    expect(component.getSystemTypeDropDowns).toHaveBeenCalled();
    expect(component.getStatusMasterDropDown).toHaveBeenCalled();
  });

  it('should use spyOn to check if alert is called in onDelete', () => {
    spyOn(window, 'alert');
  
    component.deleteclause('1');
  
    expect(window.alert).toHaveBeenCalledWith('Item deleted!');
  });

  it('should update form validators correctly in chageSoc', () => {
    component.chageSoc({ target: { checked: true } });
    expect(component.soc).toBe(true);
    expect(component.addContainerForm.get('maxGrossWeight').hasError('required')).toBeTruthy();
    expect(component.addContainerForm.get('maxPayload').hasError('required')).toBeTruthy();
  
    component.chageSoc({ target: { checked: false } });
    expect(component.soc).toBe(false);
    expect(component.addContainerForm.get('maxGrossWeight').hasError('required')).toBeFalsy();
    expect(component.addContainerForm.get('maxPayload').hasError('required')).toBeFalsy();
  });

  it('should update form validators correctly in clickOnOneWay', () => {
    component.clickOnOneWay({ target: { checked: true } });
  
    component.clickOnOneWay({ target: { checked: false } });
    expect(component.addContainerForm.get('containerOperator').hasError('required')).toBeFalsy();
    expect(component.addContainerForm.get('pickLocation').hasError('required')).toBeFalsy();
    expect(component.addContainerForm.get('dropLocation').hasError('required')).toBeFalsy();
  });

  it('should update form validators correctly when SOC is unchecked in chageSoc', () => {
    component.soc = true;
    component.chageSoc({ target: { checked: false } });
    expect(component.soc).toBe(false);
    expect(component.addContainerForm.get('maxGrossWeight').hasError('required')).toBeFalsy();
    expect(component.addContainerForm.get('maxPayload').hasError('required')).toBeFalsy();
  });
  
  

});
