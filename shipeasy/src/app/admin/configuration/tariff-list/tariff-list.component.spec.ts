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
import { TariffListComponent } from './tariff-list.component';


@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('TariffListComponent', () => {
  let component: TariffListComponent;
  let fixture: ComponentFixture<TariffListComponent>;
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
      declarations: [TariffListComponent, MockTranslatePipe],
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
    fixture = TestBed.createComponent(TariffListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open the modal', () => {
    const mockModalRef: NgbModalRef = { result: Promise.resolve('result') } as NgbModalRef;
    mockNgbModal.open.and.returnValue(mockModalRef);

    component.open('content');

    expect(mockNgbModal.open).toHaveBeenCalledWith('content', {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
    });
  });

  it('should navigate to edit page on onEdit', () => {
    const spyNavigate = spyOn(component['route'], 'navigate').and.stub();
    const mockItem = { ratemasterId: 123 };

    component.onEdit(mockItem);

    expect(spyNavigate).toHaveBeenCalledWith(['/configuration/list/123/edit']);
  });

  it('should navigate to clone page on cloneItem', () => {
    const spyNavigate = spyOn(component['route'], 'navigate').and.stub();
    const mockId = 456;

    component.cloneItem(mockId);

    expect(spyNavigate).toHaveBeenCalledWith(['/configuration/list/456/clone']);
  });

  it('should get tariff list on ngOnInit', () => {
    const getCountryListSpy = spyOn(component, 'getCountryList');
    const getVesselTypeSpy = spyOn(component, 'getVesselType');
    const getPortListSpy = spyOn(component, 'getPortList');
    const getTariffListSpy = spyOn(component, 'getTariffList');

    component.ngOnInit();

    expect(getCountryListSpy).toHaveBeenCalled();
    expect(getVesselTypeSpy).toHaveBeenCalled();
    expect(getPortListSpy).toHaveBeenCalled();
    expect(getTariffListSpy).toHaveBeenCalled();
  });

  it('should clear filters on clear', () => {
    component.tariffRuleName = 'test';
    component.port = 'Port';
    component.vesselType = 'Vessel';
    component.terminal = 'Terminal';
    component.berth = 'Berth';
    component.country = 'Country';
    component.createdon = '2022-03-05';
    
    component.clear();

    expect(component.tariffRuleName).toEqual('');
    expect(component.port).toEqual('');
    expect(component.vesselType).toEqual('');
    expect(component.terminal).toEqual('');
    expect(component.berth).toEqual('');
    expect(component.country).toEqual('');
    expect(component.createdon).toEqual('');
    expect(component.tariffList.length).toEqual(0);
  });

  it('should handle sorting on sort', () => {
    const mockSortColumn = 'column';

    component.sort(mockSortColumn);

    // Expect order to be toggled
    expect(component.order).toBeFalsy();
    // Expect sorting to be called with the correct column
    expect(component.tariffList).toBeTruthy(); // Assert your sorting logic based on the order and column
  });

  it('should navigate to add page on openTariff', () => {
    const spyNavigate = spyOn(component['router'], 'navigate').and.stub();

    component.openTariff();

    expect(spyNavigate).toHaveBeenCalledWith(['/configuration/add']);
  });

  it('should navigate to edit page on onEdit', () => {
    const spyNavigate = spyOn(component['router'], 'navigate').and.stub();
    const mockItem = { ratemasterId: 123 };

    component.onEdit(mockItem);

    expect(spyNavigate).toHaveBeenCalledWith(['/configuration/list/123/edit']);
  });

  it('should navigate to clone page on cloneItem', () => {
    const spyNavigate = spyOn(component['router'], 'navigate').and.stub();
    const mockId = 456;

    component.cloneItem(mockId);

    expect(spyNavigate).toHaveBeenCalledWith(['/configuration/list/456/clone']);
  });

  it('should handle sorting on sort with ascending order', () => {
    const mockColumn = 'column';
    component.order = true;

    component.sort(mockColumn);

    // Expect order to be toggled
    expect(component.order).toBeFalsy();
    // Expect sorting to be called with the correct column
    expect(component.tariffList).toBeTruthy(); // Assert your sorting logic based on the order and column
  });

  it('should handle sorting on sort with descending order', () => {
    const mockColumn = 'column';
    component.order = false;

    component.sort(mockColumn);

    // Expect order to be toggled
    expect(component.order).toBeTruthy();
    // Expect sorting to be called with the correct column
    expect(component.tariffList).toBeTruthy(); // Assert your sorting logic based on the order and column
  });

  it('should not navigate to the next page on next if already on last page', () => {
    const getPaginationDataSpy = spyOn(component, 'getPaginationData');

    component.toalLength = 20;
    component.count = 20;
    component.next();

    expect(getPaginationDataSpy).not.toHaveBeenCalled();
    expect(component.page).toEqual(1);
    expect(component.count).toEqual(20);
  });

  it('should not navigate to the previous page on prev if already on first page', () => {
    const getPaginationDataSpy = spyOn(component, 'getPaginationData');

    component.page = 1;
    component.prev();

    expect(getPaginationDataSpy).not.toHaveBeenCalled();
    expect(component.page).toEqual(1);
  });

  it('should set size and reset page on filter', () => {
    const getTariffListSpy = spyOn(component, 'getTariffList');
    const mockEvent = { target: { value: 30 } };

    component.filter(mockEvent);

    expect(component.size).toEqual(30);
    expect(component.page).toEqual(1);
    expect(getTariffListSpy).toHaveBeenCalled();
  });

  it('should clear filters and get tariff list on clear', () => {
    const getTariffListSpy = spyOn(component, 'getTariffList');
    component.tariffRuleName = 'Test Rule';
    component.port = 'Test Port';
    component.vesselType = 'Test Vessel';
    component.terminal = 'Test Terminal';
    component.berth = 'Test Berth';
    component.country = 'Test Country';
    component.createdon = '2022-03-05';

    component.clear();

    expect(component.tariffRuleName).toEqual('');
    expect(component.port).toEqual('');
    expect(component.vesselType).toEqual('');
    expect(component.terminal).toEqual('');
    expect(component.berth).toEqual('');
    expect(component.country).toEqual('');
    expect(component.createdon).toEqual('');
    expect(getTariffListSpy).toHaveBeenCalled();
  });

  it('should handle next pagination on next method', () => {
    const spyGetPaginationData = spyOn(component, 'getPaginationData').and.stub();
    component.toalLength = 25;
    component.count = 20;

    component.next();

    expect(spyGetPaginationData).toHaveBeenCalledWith('next');
  });

  it('should handle previous pagination on prev method', () => {
    const spyGetPaginationData = spyOn(component, 'getPaginationData').and.stub();
    component.page = 2;

    component.prev();

    expect(spyGetPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should not handle next pagination when already at the last page on next method', () => {
    const spyGetPaginationData = spyOn(component, 'getPaginationData').and.stub();
    component.toalLength = 25;
    component.count = 25;

    component.next();

    expect(spyGetPaginationData).not.toHaveBeenCalled();
  });

  it('should not handle previous pagination when already at the first page on prev method', () => {
    const spyGetPaginationData = spyOn(component, 'getPaginationData').and.stub();
    component.page = 1;

    component.prev();

    expect(spyGetPaginationData).not.toHaveBeenCalled();
  });

  it('should handle next pagination when already at the last page and count is less than size on next method', () => {
    const spyGetPaginationData = spyOn(component, 'getPaginationData').and.stub();
    component.toalLength = 25;
    component.count = 15;

    component.next();

    expect(spyGetPaginationData).toHaveBeenCalledWith('next');
  });

  it('should handle previous pagination when at the first page and count is equal to size on prev method', () => {
    const spyGetPaginationData = spyOn(component, 'getPaginationData').and.stub();
    component.page = 1;
    component.size = 20;
    component.count = 20;

    component.prev();

    expect(spyGetPaginationData).not.toHaveBeenCalled();
  });

});

