import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { Pipe, PipeTransform } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import * as XLSX from "xlsx";
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common'; import { OrderByPipe } from 'src/app/shared/util/sort';
import { ShippedOnboardComponent } from './shipped-onboard.component';


@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('ShippedOnboardComponent', () => {
  let component: ShippedOnboardComponent;
  let fixture: ComponentFixture<ShippedOnboardComponent>;
  let mockNgbModal: jasmine.SpyObj<NgbModal>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockNotificationService: jasmine.SpyObj<NzNotificationService>;
  let mockMastersService: jasmine.SpyObj<MastersService>;
  let mockProfilesService: jasmine.SpyObj<ProfilesService>;
  let mockCognitoService: jasmine.SpyObj<CognitoService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let modalService: NgbModal;


  beforeEach(waitForAsync(() => {
    mockNgbModal = jasmine.createSpyObj('NgbModal', ['open']);
    mockApiService = jasmine.createSpyObj('ApiService', ['getSTList', 'addToST', 'UpdateToST', 'deleteST']);
    mockNotificationService = jasmine.createSpyObj('NzNotificationService', ['create']);
    mockMastersService = jasmine.createSpyObj('MastersService', ['getSTList']);
    mockProfilesService = jasmine.createSpyObj('ProfilesService', ['getUserDetails']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails', 'getagentDetails']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList', 'UpdateToST']);

    TestBed.configureTestingModule({
      declarations: [ShippedOnboardComponent, MockTranslatePipe],
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
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShippedOnboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getBatchList on ngOnInit', () => {
    spyOn(component, 'getBatchList');
    component.ngOnInit();
    expect(component.getBatchList).toHaveBeenCalled();
  });

  it('should call getContainer on ngOnInit', () => {
    spyOn(component, 'getContainer');
    component.ngOnInit();
    expect(component.getContainer).toHaveBeenCalled();
  });

  it('should call getPaginationData with type "prev"', () => {
    const mockData = { documents: [{}, {}], totalCount: 5 };
    spyOn(component, 'getPaginationData');
    mockApiService.getSTList.and.returnValue(of(mockData));
    component.prev();
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should call filter with size value on filter', () => {
    spyOn(component, 'getContainer');
    const event = { target: { value: 20 } };
    component.filter(event);
    expect(component.size).toEqual(20);
    expect(component.getContainer).toHaveBeenCalled();
  });

  it('should clear global search and call clear method', () => {
    // Arrange
    const initialGlobalSearch = 'someValue';
    component.globalSearch = initialGlobalSearch;

    spyOn(component, 'clear'); // Spy on the clear method

    // Act
    component.clearGloble();

    // Assert
    expect(component.globalSearch).toBe(''); // Ensure globalSearch is cleared
    expect(component.clear).toHaveBeenCalled(); // Ensure clear method is called
  });

  it('should return controls of charges FormArray', () => {
    // Arrange
    const charge1 = new FormControl('Charge 1');
    const charge2 = new FormControl('Charge 2');

    // Assuming 'charges' is the name of your FormArray
    const formArray = new FormArray([charge1, charge2]);

    // Assuming 'addChargesForm' is the name of your form containing 'charges' FormArray
    component.addChargesForm = new FormGroup({
      charges: formArray,
    });

    // Act
    const controls = component.getControls();

    // Assert
    expect(controls.length).toBe(2);  // Assuming there are two charges in the FormArray
    expect(controls[0]).toBe(charge1);
    expect(controls[1]).toBe(charge2);
  });

  it('should call getPaginationData with "next" when next() is called', () => {
    // Arrange
    spyOn(component, 'getPaginationData');

    // Act
    component.toalLength = 10;
    component.count = 5;
    component.next();

    // Assert
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });

  it('should call getPaginationData with "prev" when prev() is called', () => {
    // Arrange
    spyOn(component, 'getPaginationData');

    // Act
    component.page = 2; // Assuming initial page is 2
    component.prev();

    // Assert
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should update size and call getContainer when filter() is called', () => {
    // Arrange
    spyOn(component, 'getContainer');

    // Act
    const eventMock = { target: { value: 10 } }; // Assuming your event structure
    component.filter(eventMock);

    // Assert
    expect(component.size).toBe(10);
    expect(component.fromSize).toBe(1);
    expect(component.getContainer).toHaveBeenCalled();
  });
 

  it('should clear all properties and call getContainer when clear() is called', () => {
    // Arrange
    spyOn(component, 'getContainer');

    // Act
    component.vessel_name = 'testVessel';
    component.voyage_no = 'testVoyage';
    component.shipping_line = 'testShippingLine';
    component.batch_no = 'testBatch';
    component.bl_no = 'testBL';
    component.container_no = 'testContainer';
    component.container_type = 'testContainerType';
    component.sob_date = 'testSobDate';
    component.dd_date = 'testDdDate';

    component.clear();

    // Assert
    expect(component.vessel_name).toBe('');
    expect(component.voyage_no).toBe('');
    expect(component.shipping_line).toBe('');
    expect(component.batch_no).toBe('');
    expect(component.bl_no).toBe('');
    expect(component.container_no).toBe('');
    expect(component.container_type).toBe('');
    expect(component.sob_date).toBe('');
    expect(component.dd_date).toBe('');
    expect(component.getContainer).toHaveBeenCalled();
  });

  it('should return true if sobDate exists for the given containerId', () => {
    // Arrange
    component.checkedList = [
      { containerId: 1, sobDate: '2022-01-01' },
      { containerId: 2, sobDate: '2022-01-02' },
      // Add more items as needed for your test case
    ];

    // Act
    const result = component.checkValid(1);

    // Assert
    expect(result).toBe(true);
  });

  it('should return undefined if sobDate does not exist for the given containerId', () => {
    // Arrange
    component.checkedList = [
      { containerId: 1, sobDate: '2022-01-01' },
      { containerId: 2, sobDate: '2022-01-02' },
      // Add more items as needed for your test case
    ];

    // Act
    const result = component.checkValid(3);

    // Assert
    expect(result).toBeUndefined();
  });
 
  it('should return false if both bl and sob are falsy', () => {
    // Act
    const result = component.checkDateValid(null, null);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false if bl is falsy and sob is truthy', () => {
    // Act
    const result = component.checkDateValid(null, new Date('2022-01-01'));

    // Assert
    expect(result).toBe(false);
  });

  it('should return true if bl is greater than sob', () => {
    // Act
    const result = component.checkDateValid(new Date('2022-01-02'), new Date('2022-01-01'));

    // Assert
    expect(result).toBe(true);
  });

  it('should return false if bl is less than sob', () => {
    // Act
    const result = component.checkDateValid(new Date('2022-01-01'), new Date('2022-01-02'));

    // Assert
    expect(result).toBe(false);
  });

  it('should return false if bl and sob are equal', () => {
    // Act
    const result = component.checkDateValid(new Date('2022-01-01'), new Date('2022-01-01'));

    // Assert
    expect(result).toBe(false);
  });

  it('should return the input date if it is truthy', () => {
    // Arrange
    const inputDate = '2022-03-07';

    // Act
    const result = component.blDate(inputDate);

    // Assert
    expect(result).toBe(inputDate);
  });

  it('should return "2000-01-01" if the input date is falsy', () => {
    // Arrange
    const inputDate = null;

    // Act
    const result = component.blDate(inputDate);

    // Assert
    expect(result).toBe('2000-01-01');
  });

  it('should return true if the end date is before or equal to the current date', () => {
    // Arrange
    const currentDate = new Date();
    const endValue = new Date(currentDate);

    // Act
    const result = component.disabledEndDateForEnquiryValidDate(endValue);

    // Assert
    expect(result).toBeTrue();
  });

  it('should return false if the end date is after the current date', () => {
    // Arrange
    const currentDate = new Date();
    const endValue = new Date(currentDate.setDate(currentDate.getDate() + 1));

    // Act
    const result = component.disabledEndDateForEnquiryValidDate(endValue);

    // Assert
    expect(result).toBeFalse();
  });

  it('should export data correctly when isExport is true', () => {
    // Arrange
    component.isExport = true;
    const mockContainerList = [
      // Add mock data as needed
    ];
    component.containerList = mockContainerList;

    // Act
    component.export();

    // Assert
    // Implement assertions to check if the export logic is correct for isExport true
    // For example, you can check if the generated Excel file has the expected content
  });

  it('should export data correctly when isExport is false', () => {
    // Arrange
    component.isExport = false;
    const mockContainerList = [
      // Add mock data as needed
    ];
    const mockBatchNoList = {
      routeDetails: {
        finalVesselName: 'MockVessel',
        finalVoyageId: 'MockVoyage',
        finalShippingLineName: 'MockShippingLine',
      },
      plannedVesselName: 'MockPlannedVessel',
      plannedVoyageId: 'MockPlannedVoyage',
      shippingLineName: 'MockShippingLineName',
    };
    component.containerList = mockContainerList;

    // Act
    component.export();

  
  });

  
});
