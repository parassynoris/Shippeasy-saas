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
import { ContainerSurveyComponent } from './container-survey.component';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { OrderByPipe } from 'src/app/shared/util/sort';
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

describe('ContainerSurveyComponent', () => {
  let component: ContainerSurveyComponent;
  let fixture: ComponentFixture<ContainerSurveyComponent>;
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
      declarations: [ContainerSurveyComponent, MockTranslatePipe,MastersSortPipe],
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
    fixture = TestBed.createComponent(ContainerSurveyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set validation based on container status', () => {
    const containerStatus = 'Reserved';
    component.setValidation(containerStatus);
    expect(component.isRequird).toBeTrue();
    expect(component.addContainerForm.controls['customerName'].validator).toBeDefined();

    const otherContainerStatus = 'Available';
    component.setValidation(otherContainerStatus);
    expect(component.isRequird).toBeFalse();
    expect(component.addContainerForm.controls['customerName'].validator).toBeNull();
  });

  it('should clear form fields and call getContainerData on clear', () => {
    spyOn(component, 'getContainerData');
    component.customerName = 'John Doe';
    component.containerno = 'ABC123';
    component.containerStatus = 'Reserved';
    component.previousStatus = 'Available';
    component.locationName = 'Yard A';
    component.clear();
    expect(component.customerName).toEqual('');
    expect(component.containerno).toEqual('');
    expect(component.containerStatus).toEqual('');
    expect(component.previousStatus).toEqual('');
    expect(component.locationName).toEqual('');
    expect(component.getContainerData).toHaveBeenCalled();
  });

  it('should handle next pagination correctly', () => {
    spyOn(component, 'getPaginationData');
    component.toalLength = 15;
    component.count = 10;
    component.page = 1;
    component.next();
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });

  it('should handle previous pagination correctly', () => {
    spyOn(component, 'getPaginationData');
    component.page = 2;
    component.prev();
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should set validation for customerName when status is Reserved', () => {
    component.addContainerForm.controls['status'].setValue('Reserved');
    component.setValidation('Reserved');
    expect(component.isRequird).toBe(true);
    expect(component.addContainerForm.controls['customerName'].validator).toBeTruthy();
  });

  it('should clear customerName validation when status is not Reserved', () => {
    component.addContainerForm.controls['status'].setValue('Available');
    component.setValidation('Available');
    expect(component.isRequird).toBe(false);
    expect(component.addContainerForm.controls['customerName'].validator).toBeFalsy();
  });

  it('should clear search filters and get container data on clear', () => {
    spyOn(component, 'getContainerData');
    component.containerno = 'ABC123';
    component.containerStatus = 'Reserved';
    component.customerName = 'John Doe';
    component.previousStatus = 'Release';
    component.locationName = 'Yard A';
    component.clear();
    expect(component.containerno).toBe('');
    expect(component.containerStatus).toBe('');
    expect(component.customerName).toBe('');
    expect(component.previousStatus).toBe('');
    expect(component.locationName).toBe('');
    expect(component.getContainerData).toHaveBeenCalled();
  });

  it('should handle setting validation for customerName based on container status', () => {
    component.isRequird = false;

    component.setValidation('Reserved');

    expect(component.isRequird).toBe(true);
    expect(component.addContainerForm.controls['customerName'].validator).toBeTruthy();
  });

  it('should handle clearing search filters successfully', () => {
    spyOn(component, 'getContainerData');

    component.clear();

    expect(component.customerName).toBe('');
    expect(component.containerno).toBe('');
    expect(component.containerStatus).toBe('');
    expect(component.previousStatus).toBe('');
    expect(component.locationName).toBe('');
    expect(component.getContainerData).toHaveBeenCalled();
  });

  it('should handle clearing search filters and getting container data on clear', () => {
    spyOn(component, 'getContainerData');

    component.customerName = 'John Doe';
    component.containerno = 'ABC123';
    component.containerStatus = 'Reserved';
    component.previousStatus = 'PreviousStatus';
    component.locationName = 'Location';

    component.clear();

    expect(component.customerName).toBe('');
    expect(component.containerno).toBe('');
    expect(component.containerStatus).toBe('');
    expect(component.previousStatus).toBe('');
    expect(component.locationName).toBe('');
    expect(component.getContainerData).toHaveBeenCalled();
  });

  it('should handle setting validation based on container status successfully', () => {
    component.isRequird = false;
    component.addContainerForm.controls['customerName'].clearValidators();

    component.setValidation('Reserved');

    expect(component.isRequird).toBe(true);
    expect(component.addContainerForm.controls['customerName'].validator).toBeTruthy();
  });

  it('should handle clearing validation when status is not "Reserved" successfully', () => {
    component.addContainerForm.controls['customerName'].clearValidators = jasmine.createSpy();
    component.addContainerForm.controls['customerName'].updateValueAndValidity = jasmine.createSpy();

    component.setValidation('Available');

    expect(component.isRequird).toBe(false);
    expect(component.addContainerForm.controls['customerName'].clearValidators).toHaveBeenCalled();
    expect(component.addContainerForm.controls['customerName'].updateValueAndValidity).toHaveBeenCalled();
  });

  it('should handle clearing filters and fetching all container data successfully', () => {
    spyOn(component, 'getContainerData');

    component.customerName = 'John Doe';
    component.containerno = 'ABC123';
    component.containerStatus = 'Reserved';
    component.previousStatus = 'PreviousStatus';
    component.locationName = 'Yard';

    component.clear();

    expect(component.customerName).toBe('');
    expect(component.containerno).toBe('');
    expect(component.containerStatus).toBe('');
    expect(component.previousStatus).toBe('');
    expect(component.locationName).toBe('');
    expect(component.getContainerData).toHaveBeenCalled();
  });

  it('should handle navigating to next and previous pages successfully', () => {
    spyOn(component, 'getPaginationData');

    component.toalLength = 20;
    component.count = 10;

    component.next();
    component.prev();

    expect(component.getPaginationData).toHaveBeenCalledWith('next');
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should handle setting validation for Reserved status successfully', () => {
    component.setValidation('Reserved');

    expect(component.isRequird).toBe(true);
    expect(component.addContainerForm.controls['customerName'].validator).toBeTruthy();
  });

  it('should handle setting validation for non-Reserved status successfully', () => {
    component.setValidation('Release');

    expect(component.isRequird).toBe(false);
    expect(component.addContainerForm.controls['customerName'].validator).toBeNull();
  });

  it('should handle clearing search parameters successfully', () => {
    spyOn(component, 'getContainerData');

    component.containerno = 'ABC123';
    component.containerStatus = 'Reserved';
    component.customerName = 'John Doe';
    component.previousStatus = 'PreviousStatus';
    component.locationName = 'Yard';

    component.clear();

    expect(component.containerno).toBe('');
    expect(component.containerStatus).toBe('');
    expect(component.customerName).toBe('');
    expect(component.previousStatus).toBe('');
    expect(component.locationName).toBe('');

    expect(component.getContainerData).toHaveBeenCalled();
  });

});
