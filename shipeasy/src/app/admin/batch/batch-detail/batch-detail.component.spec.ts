import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { Pipe, PipeTransform, forwardRef } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import * as XLSX from "xlsx";
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { RouterModule } from '@angular/router';
import { BatchDetailsComponent } from './batch-detail.component';

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
  useExisting: forwardRef(() => BatchDetailsComponent),
  multi: true
};

describe('BatchDetailsComponent', () => {
  let component: BatchDetailsComponent;
  let fixture: ComponentFixture<BatchDetailsComponent>;
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
      declarations: [BatchDetailsComponent, MockTranslatePipe,],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientModule,RouterModule,ReactiveFormsModule,RouterModule],
      providers: [DatePipe, OrderByPipe,
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
    fixture = TestBed.createComponent(BatchDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('totalGrossWeight should calculate total correctly', () => {
    // Arrange
    const mockArr = [
      { grossWeightContainer: 10 },
      { grossWeightContainer: 20 },
      { grossWeightContainer: 30 }
    ];
    
    // Act
    const total = component.totalGrossWeight(mockArr);
    
    // Assert
    expect(total).toEqual(60);
  });

  it('getDaysDifference should calculate difference correctly', () => {
    // Arrange
    const mockAvailableDate = new Date();
    mockAvailableDate.setDate(mockAvailableDate.getDate() + 5); // 5 days from now
    
    // Act
    const difference = component.getDaysDifference(mockAvailableDate);
    
    // Assert
    expect(difference).toEqual(5);
  });
  
  it('sort should sort array correctly', () => {
    // Arrange
    const mockArray = [
      { key: 'c' },
      { key: 'a' },
      { key: 'b' }
    ];
    const sortedArray = [
      { key: 'a' },
      { key: 'b' },
      { key: 'c' }
    ];
  
    // Act
    const result = component.sort(mockArray, 'key');
  
    // Assert
    expect(result).toEqual(sortedArray);
  });

  it('totalGrossWeight should return 0 when array is empty', () => {
    // Arrange
    const mockArr = [];
  
    // Act
    const total = component.totalGrossWeight(mockArr);
  
    // Assert
    expect(total).toEqual(0);
  });

  it('totalGrossWeight should handle undefined values gracefully', () => {
    // Arrange
    const mockArr = [
      { grossWeightContainer: 10 },
      { grossWeightContainer: undefined },
      { grossWeightContainer: 30 }
    ];
  
    // Act
    const total = component.totalGrossWeight(mockArr);
  
    // Assert
    expect(total).toEqual(40); // Only considers defined values
  });

  // it('updateBatchStatus should notify error when update fails', () => {
  //   // Arrange
  //   const mockEvent = 'Some Status';
  //   mockApiService.UpdateToST.and.returnValue(of(false));
    
  //   // Act
  //   component.updateBatchStatus(mockEvent);
    
  //   // Assert
  //   expect(mockNotificationService.create).toHaveBeenCalledWith('error', 'Error while updating Job Status', '');
  // });
  it('getDaysDifference should return a negative number for past dates', () => {
    // Arrange
    const mockAvailableDate = new Date();
    mockAvailableDate.setDate(mockAvailableDate.getDate() - 3); // 3 days in the past

    // Act
    const difference = component.getDaysDifference(mockAvailableDate);

    // Assert
    expect(difference).toEqual(-3);
});

 
 
 

});

