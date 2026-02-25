import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { Pipe, PipeTransform, forwardRef } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import * as XLSX from "xlsx";
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MastersSortPipe } from 'src/app/shared/util/mastersort';
import { EditTerminalFpodContainerComponent } from './edit-terminal-fpod-container.component';


@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}
const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => EditTerminalFpodContainerComponent),
  multi: true
};

describe('EditTerminalFpodContainerComponent', () => {
  let component: EditTerminalFpodContainerComponent;
  let fixture: ComponentFixture<EditTerminalFpodContainerComponent>;
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
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails','getModule']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList']);

    TestBed.configureTestingModule({
      declarations: [EditTerminalFpodContainerComponent, MockTranslatePipe,],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientModule,RouterModule,ReactiveFormsModule,RouterModule,TranslateModule.forRoot(),NzSelectModule,NzDatePickerModule,BrowserAnimationsModule],
      providers: [DatePipe, OrderByPipe,TranslateService,MastersSortPipe,
        { provide: NgbModal, useValue: mockNgbModal },CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR,

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
    fixture = TestBed.createComponent(EditTerminalFpodContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form properly', () => {
    expect(component.blForm).toBeDefined();
    // Add more expectations as needed to test the form initialization
  });

  it('should navigate back when back function is called', () => {
    const locationSpy = spyOn(component.location, 'back');
    component.back();
    expect(locationSpy).toHaveBeenCalled();
  });

  it('should fetch port dropdown data', () => {
    // Mock the response for getPortDropDowns method
    const mockPortList = [{ portId: 1, portName: 'Port 1' }, { portId: 2, portName: 'Port 2' }];
    mockCommonService.getSTList.and.returnValue(of({ documents: mockPortList }));
  
    component.getPortDropDowns();
  
    expect(component.portList).toEqual(mockPortList);
  });
  
  it('should fetch system type dropdown data', () => {
    // Mock the response for getSystemTypeDropDowns method
    const mockItemTypeList = [{ typeCategory: 'itemType' }, { typeCategory: 'itemType' }];
    const mockDepartureModeList = [{ typeCategory: 'departureMode' }, { typeCategory: 'departureMode' }];
    mockCommonService.getSTList.and.returnValue(of({ documents: [...mockItemTypeList, ...mockDepartureModeList] }));
  
    component.getSystemTypeDropDowns();
  
    expect(component.itemTypeList.length).toBe(2);
    expect(component.departureModeList.length).toBe(2);
  });

  it('should fetch BL data', () => {
    // Mock the response for getBLById method
    const mockBLData = [{ blNumber: 'BL1' }, { blNumber: 'BL2' }];
    mockCommonService.getSTList.and.returnValue(of({ documents: mockBLData }));
  
    component.getBLById();
  
    expect(component.houseBlList).toEqual(mockBLData);
  });


  it('should have correct form controls', () => {
    expect(component.blForm.get('blData')).toBeTruthy();
    expect(component.bl).toBeTruthy();
    expect(component.getControls()).toBeTruthy();
  });

  it('should build form with BL data', () => {
    const mockBLData = [{ blNumber: 'BL1', containers: ['Container1'], noofContainer: 1 }];
    component.houseBlList = mockBLData;
  
    component.buildForm();
  
    expect(component.bl.length).toBe(1);
    expect(component.bl.at(0).get('blNumber').value).toBe('BL1');
    expect(component.bl.at(0).get('containers').value).toEqual(['Container1']);
    expect(component.bl.at(0).get('noofContainer').value).toBe(1);
  });

  
  
  
  

  


 
});
