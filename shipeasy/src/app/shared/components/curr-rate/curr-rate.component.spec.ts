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
import { CurrRateComponent } from './curr-rate.component';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import * as XLSX from "xlsx";
import { MastersSortPipe } from '../../util/mastersort';

@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('CurrRateComponent', () => {
  let component: CurrRateComponent;
  let fixture: ComponentFixture<CurrRateComponent>;
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
      declarations: [CurrRateComponent, MockTranslatePipe,MastersSortPipe],
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
    fixture = TestBed.createComponent(CurrRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get country list', () => {
    // Mock the response of the service
    const mockCountryData = [{ countryName: 'Country 1' }, { countryName: 'Country 2' }];
    mockCommonService.getSTList.and.returnValue(of({ documents: mockCountryData }));

    // Call the function to test
    component.getcountryList();

    // Test your expectations
    expect(component.countryData).toEqual(mockCountryData as any);
    // Add more expectations based on your function logic
  });

  it('should handle next function when there are more items', () => {
    // Mock data for next
    spyOn(component, 'getPaginationData');

    // Set total length greater than the count
    component.toalLength = 15;
    component.count = 10;

    // Call the function to test
    component.next();

    // Test your expectations
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
    // Add more expectations based on your function logic
  });

  it('should handle prev function when there are previous items', () => {
    // Mock data for prev
    spyOn(component, 'getPaginationData');

    // Set page greater than 1
    component.page = 2;

    // Call the function to test
    component.prev();

    // Test your expectations
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
    // Add more expectations based on your function logic
  });

  it('should handle clear function when there are filters', () => {
    // Mock data for clear with filters
    spyOn(component, 'getCostItem');

    // Set filter values for testing
    component.code = 'ABC';
    component.curr_date = '2022-01-01';
    component.name = 'Country';
    component.currency = 'USD';
    component.description = 'Description';
    component.exchangeRate = '1.5';

    // Call the function to test
    component.clear();

    // Test your expectations
    expect(component.code).toEqual('');
    expect(component.name).toEqual('');
    expect(component.currency).toEqual('');
    expect(component.description).toEqual('');
    expect(component.exchangeRate).toEqual('');
    expect(component.getCostItem).toHaveBeenCalled();
    // Add more expectations based on your function logic
  });

  it('should handle next function when there is more data to fetch', () => {
    // Mock data for next function
    spyOn(component, 'getPaginationData');
    component.toalLength = 15;
    component.count = 10;

    // Call the function to test
    component.next();

    // Test your expectations
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
    // Add more expectations based on your function logic
  });

  it('should handle prev function when there are previous pages', () => {
    // Mock data for prev function
    spyOn(component, 'getPaginationData');
    component.page = 2;

    // Call the function to test
    component.prev();

    // Test your expectations
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
    // Add more expectations based on your function logic
  });

  it('should handle prev function when page is greater than 0', () => {
    // Mock data for prev function when page is greater than 0
    component.page = 2;
    spyOn(component, 'getPaginationData');

    // Call the function to test
    component.prev();

    // Test your expectations
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
    // Add more expectations based on your function logic
  });

  it('should handle prev function when page is 0', () => {
    // Mock data for prev function when page is 0
    component.page = 0;
    spyOn(component, 'getPaginationData');

    // Call the function to test
    component.prev();

    // Test your expectations
    expect(component.getPaginationData).not.toHaveBeenCalled();
    // Add more expectations based on your function logic
  });
  
});
