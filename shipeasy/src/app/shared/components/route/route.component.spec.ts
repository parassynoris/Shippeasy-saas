import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormBuilder, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
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
// import { format } from 'path';
import { FilterPipe1, RouteComponent } from './route.component';
import { FilterByFlagPipe } from '../../pipes/startwith.pipe';

@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('RouteComponent', () => {
  let component: RouteComponent;
  let fixture: ComponentFixture<RouteComponent>;
  let mockNgbModal: jasmine.SpyObj<NgbModal>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockNotificationService: jasmine.SpyObj<NzNotificationService>;
  let mockMastersService: jasmine.SpyObj<MastersService>;
  let mockProfilesService: jasmine.SpyObj<ProfilesService>;
  let mockCognitoService: jasmine.SpyObj<CognitoService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let commonServiceSpy: jasmine.SpyObj<CommonService>;
  let formBuilder: FormBuilder;

  beforeEach(waitForAsync(() => {
    mockNgbModal = jasmine.createSpyObj('NgbModal', ['open']);
    mockApiService = jasmine.createSpyObj('ApiService', ['getSTList', 'addToST', 'UpdateToST', 'deleteST']);
    mockNotificationService = jasmine.createSpyObj('NzNotificationService', ['create']);
    mockMastersService = jasmine.createSpyObj('MastersService', ['getSTList']);
    mockProfilesService = jasmine.createSpyObj('ProfilesService', ['getUserDetails']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails','getagentDetails']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList', 'UpdateToST']);

    TestBed.configureTestingModule({
      declarations: [RouteComponent, FilterByFlagPipe,MockTranslatePipe,FilterPipe1],
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
    formBuilder = new FormBuilder();
    fixture = TestBed.createComponent(RouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  
  it('should update preCarrigeList based on isExport and load port', () => {
    // Arrange
    const mockLoadPortId = 'mockLoadPortId';
    const mockICDlocationList = [
      { portId: 'mockLoadPortId', /* other properties */ },
      { portId: 'otherPortId', /* other properties */ },
      // Add more mock data as needed
    ];
    component.ICDlocationList = mockICDlocationList;
    component.isExport = true;

    // Act
    component.loadportchange(mockLoadPortId);

    // Assert
    expect(component.preCarrigeList).toEqual([mockICDlocationList[0]]as any);
  });

  it('should set preCarrigeList to the entire ICDlocationList when isExport is false', () => {
    // Arrange
    const mockICDlocationList = [
      { portId: 'mockLoadPortId', /* other properties */ },
      { portId: 'otherPortId', /* other properties */ },
      // Add more mock data as needed
    ];
    component.ICDlocationList = mockICDlocationList;
    component.isExport = false;

    // Act
    component.loadportchange();

    // Assert
    expect(component.preCarrigeList).toEqual(mockICDlocationList as any);
  });

  it('should update onCarrigeList based on isExport and destination port', () => {
    // Arrange
    const mockDestPortId = 'mockDestPortId';
    const mockICDlocationList = [
      { portId: 'mockDestPortId', /* other properties */ },
      { portId: 'otherPortId', /* other properties */ },
      // Add more mock data as needed
    ];
    component.ICDlocationList = mockICDlocationList;
    component.isExport = true;

    // Act
    component.desPortchange(mockDestPortId);

    // Assert
    expect(component.onCarrigeList).toEqual([mockICDlocationList[0]] as any);
  });

  it('should set onCarrigeList to the entire ICDlocationList when isExport is false', () => {
    // Arrange
    const mockICDlocationList = [
      { portId: 'mockDestPortId', /* other properties */ },
      { portId: 'otherPortId', /* other properties */ },
      // Add more mock data as needed
    ];
    component.ICDlocationList = mockICDlocationList;
    component.isExport = false;

    // Act
    component.desPortchange();

    // Assert
    expect(component.onCarrigeList).toEqual(mockICDlocationList as any);
  });



  it('should reset the value of atd control when changeFromDate is called', () => {
    // Arrange
    // Create the form with the necessary controls
    component.routeForm = formBuilder.group({
      atd: ['initialValue'],
      // Add more form controls as needed
    });

    // Act
    component.changeFromDate();

    // Assert
    expect(component.routeForm.get('atd').value).toBe('');
  });

  it('should not disable date if eta value is not set', () => {
    // Arrange
    // Create the form with the necessary controls
    component.routeForm = formBuilder.group({
      eta: [''], // no eta value
      // Add more form controls as needed
    });

    // Act & Assert
    const currentDate = new Date();
    expect(component.disabledDate(currentDate)).toBe(false); // date should not be disabled
  });

  it('should reset the values of final_voyage, final_vessel, and line_voyage_no controls when changeSL is true', () => {
    // Arrange
    const initialValue = 'initialValue';
    // Create the form with the necessary controls
    component.routeForm = formBuilder.group({
      final_voyage: [initialValue],
      final_vessel: [initialValue],
      line_voyage_no: [initialValue],
      shipping_line: ['mockShippingLine'], // Add the shipping_line control as needed
      // Add more form controls as needed
    });

    // Act
    component.setfinalVessel('mockVesselId', true);

    // Assert
    expect(component.routeForm.get('final_voyage').value).toBe('');
    expect(component.routeForm.get('final_vessel').value).toBe('');
    expect(component.routeForm.get('line_voyage_no').value).toBe('');
  });

}); 

