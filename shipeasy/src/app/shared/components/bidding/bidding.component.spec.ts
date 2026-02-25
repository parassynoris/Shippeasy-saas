import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
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
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs'; 
import { BiddingComponent } from './bidding.component';
import { LoaderService } from 'src/app/services/loader.service';

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
  useExisting: forwardRef(() => BiddingComponent),
  multi: true
};

describe('BiddingComponent', () => { 
  let component: BiddingComponent;
  let fixture: ComponentFixture<BiddingComponent>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockLoaderService: jasmine.SpyObj<LoaderService>;
  let mockNotification: jasmine.SpyObj<NzNotificationService>;
  let mockRoute: ActivatedRoute;
  let mockNgbModal: jasmine.SpyObj<NgbModal>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockNotificationService: jasmine.SpyObj<NzNotificationService>;
  let mockMastersService: jasmine.SpyObj<MastersService>;
  let mockProfilesService: jasmine.SpyObj<ProfilesService>;
  let mockCognitoService: jasmine.SpyObj<CognitoService>; 
  beforeEach(waitForAsync(() => {
    mockNgbModal = jasmine.createSpyObj('NgbModal', ['open']);
    mockApiService = jasmine.createSpyObj('ApiService', ['getSTList', 'addToST', 'UpdateToST', 'deleteST']);
    mockNotificationService = jasmine.createSpyObj('NzNotificationService', ['create']);
    mockMastersService = jasmine.createSpyObj('MastersService', ['getSTList']);
    mockProfilesService = jasmine.createSpyObj('ProfilesService', ['getUserDetails', 'getSmartAgentById']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList','getDashboardReport','getSTList1']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['getSTList']);
    mockLoaderService = jasmine.createSpyObj('LoaderService', ['showcircle', 'hidecircle']);
    mockNotification = jasmine.createSpyObj('NzNotificationService', ['create']);
    mockRoute = { snapshot: { params: { id: '123' } } } as any;

    TestBed.configureTestingModule({
      declarations: [BiddingComponent, MockTranslatePipe],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, MatAutocompleteModule, NzSelectModule, NzDatePickerModule, RouterTestingModule, HttpClientModule, RouterModule, BrowserAnimationsModule, ReactiveFormsModule, RouterModule],
      providers: [DatePipe, OrderByPipe,
        { provide: ApiService, useVale: mockApiService },
        { provide: NzNotificationService, useValue: mockNotificationService },
        { provide: MastersService, useValue: mockMastersService },
        { provide: ProfilesService, useValue: mockProfilesService },
        { provide: SaMasterService, useValue: {} },
        { provide: CognitoService, useValue: mockCognitoService },
        { provide: CommonService, useValue: mockCommonService },
        { provide: CommonService, useValue: mockCommonService },
        { provide: LoaderService, useValue: mockLoaderService },
        { provide: NzNotificationService, useValue: mockNotification },
        { provide: ActivatedRoute, useValue: mockRoute }
      ],
    }).compileComponents();
  })); 
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BiddingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BiddingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });




  

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getEnquiryList on initialization', () => {
    spyOn(component, 'getEnquiryList');
    component.ngOnInit();
    expect(component.getEnquiryList).toHaveBeenCalled();
});

it('should call loaderService.showcircle, fetch data and handle success', () => {
  const mockData = { documents: [{ id: 1 }, { id: 2 }] };
  mockCommonService.getSTList.and.returnValue(of(mockData));

  component.getEnquiryList();

  expect(mockLoaderService.showcircle).toHaveBeenCalled();
  expect(mockCommonService.getSTList).toHaveBeenCalledWith('transportinquiry', {
    project: [],
    query: { enquiryId: '123' },
    sort: { desc: ['createdOn'] }
  });
  expect(component.enquiryList).toEqual(mockData.documents);
  expect(mockLoaderService.hidecircle).toHaveBeenCalled();
});

it('should call loaderService.showcircle, fetch data and handle success', () => {
  const mockData = { documents: [{ id: 1 }, { id: 2 }] };
  mockCommonService.getSTList.and.returnValue(of(mockData));

  component.getEnquiryList();

  expect(mockLoaderService.showcircle).toHaveBeenCalled();
  expect(mockCommonService.getSTList).toHaveBeenCalledWith('transportinquiry', {
    project: [],
    query: { enquiryId: '123' },
    sort: { desc: ['createdOn'] }
  });
  expect(component.enquiryList).toEqual(mockData.documents);
  expect(mockLoaderService.hidecircle).toHaveBeenCalled();
}); 

});
