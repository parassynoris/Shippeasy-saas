import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormControlName, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
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
import { CurrencyPipe, DatePipe } from '@angular/common'; 
import { OrderByPipe } from 'src/app/shared/util/sort';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonService } from 'src/app/services/common/common.service';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { containermaster } from 'src/app/models/containermaster';
import { ContainerMasterComponent } from 'src/app/shared/components/sa-masters/container-master/container-master.component';
import { SIComponent } from './si.component';
import { FilterPipe } from '../batch-detail/batch-detail.component';




@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  
  constructor(private currencyPipe: CurrencyPipe) {}
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('SIComponent', () => {
  let component: SIComponent;
  let fixture: ComponentFixture<SIComponent>;
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
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails','getagentDetails',]);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList', 'UpdateToST']);
   mockApiService = jasmine.createSpyObj('ApiService',['getListByURL']);
    TestBed.configureTestingModule({
      declarations: [SIComponent, MockTranslatePipe,FilterPipe],
      imports: [ReactiveFormsModule,SharedModule,FormsModule, NzSelectModule,NzDatePickerModule,RouterTestingModule,BrowserAnimationsModule ,HttpClientModule,TranslateModule.forRoot()],
      providers: [DatePipe, OrderByPipe,CurrencyPipe,
        { provide: NgbModal, useValue: mockNgbModal },
        { provide: ApiService, useValue: mockApiService },
        { provide: NzNotificationService, useValue: mockNotificationService },
        { provide: MastersService, useValue: mockMastersService },
        { provide: ProfilesService, useValue: mockProfilesService },
        { provide: SaMasterService, useValue: {} },
        { provide: CognitoService, useValue: mockCognitoService },
        { provide: CommonService, useValue: mockCommonService }
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call other methods', () => {
    // Mock other methods as needed
    spyOn(component, 'getVesselListDropDown');
    spyOn(component, 'getVoyage');
    spyOn(component, 'getBatchList');
    spyOn(component, 'getShippingInstru');
    spyOn(component, 'getContainerData');
    spyOn(component, 'getDeliveryOrderList');

    component.ngOnInit();

    expect(component.getVesselListDropDown).toHaveBeenCalledOnceWith();
    expect(component.getVoyage).toHaveBeenCalledOnceWith();
    expect(component.getBatchList).toHaveBeenCalledOnceWith();
    expect(component.getShippingInstru).toHaveBeenCalledOnceWith();
    expect(component.getContainerData).toHaveBeenCalledOnceWith();
    expect(component.getDeliveryOrderList).toHaveBeenCalledOnceWith();
  });

  it('should toggle the value of "isShown"', () => {
    component.isShown = false; // Set initial value of isShown

    // Act
    component.openDate();

    // Assert
    expect(component.isShown).toBe(true); // Expect isShown to be true after opening
});


it('should return default file name when an empty string is provided as file path', () => {
  const formValue = '';

  // Act
  const fileName = component.getFileName(formValue);

  // Assert
  expect(fileName).toBe('test.pdf');
});

it('should return the file extension when a valid filename with extension is provided', () => {
  const filename = 'example.pdf';

  // Act
  const fileExtension = component.getFileExtension(filename);

  // Assert
  expect(fileExtension).toBe('pdf');
});

it('should return the file extension when a filename with multiple periods is provided', () => {
  const filename = 'example.file.test.pdf';

  // Act
  const fileExtension = component.getFileExtension(filename);

  // Assert
  expect(fileExtension).toBe('pdf');
});

it('should sort an array of objects by a key in ascending order', () => {
  // Arrange
  const array = [
      { id: 3, name: 'C' },
      { id: 1, name: 'A' },
      { id: 2, name: 'B' }
  ];
  const key = 'name';

  // Act
  const sortedArray = component.sort(array, key);

  // Assert
  expect(sortedArray).toEqual([
      { id: 1, name: 'A' },
      { id: 2, name: 'B' },
      { id: 3, name: 'C' }
  ]);  
});

});
