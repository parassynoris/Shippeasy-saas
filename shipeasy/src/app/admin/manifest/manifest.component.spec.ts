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
import { ManifestComponent } from './manifest.component';





@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('ManifestComponent', () => {
  let component: ManifestComponent;
  let fixture: ComponentFixture<ManifestComponent>;
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
      declarations: [ManifestComponent, MockTranslatePipe],
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
    fixture = TestBed.createComponent(ManifestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form and data on ngOnInit', () => {
    spyOn(component, 'getVesselData');
    spyOn(component, 'getBatch');
    component.ngOnInit();
    expect(component.getVesselData).toHaveBeenCalled();
    expect(component.getBatch).toHaveBeenCalled();
  });

  it('should get vessel data on getVesselData()', () => {
    const spyGetSTList = mockCommonService.getSTList.and.returnValue(of({ documents: [] }));
    component.getVesselData();
    expect(spyGetSTList).toHaveBeenCalled();
    expect(component.vesseldata).toEqual([]);
  });

  it('should get batch list on getBatch()', () => {
    const spyGetSTList = mockCommonService.getSTList.and.returnValue(of({ documents: [] }));
    component.getBatch();
    expect(spyGetSTList).toHaveBeenCalled();
    expect(component.batchList).toEqual([]);
  });

  it('should reset form values on reset()', () => {
    component.manifestForm.setValue({
      vessel: 'V123',
      voyage: 'VO123',
      principal: 'SHIPEASY TANK CONTAINERS',
      blbatchno: 'B123'
    });

    component.reset();

    expect(component.manifestForm.get('vessel').value).toEqual('');
    expect(component.manifestForm.get('voyage').value).toEqual('');
    expect(component.manifestForm.get('blbatchno').value).toEqual('');
  });

  it('should set isExport to true when localStorage isExport is not "false"', () => {
    localStorage.setItem('isExport', 'true');
    component.ngOnInit();
    expect(component.isExport).toBe(true);
  });

  it('should navigate to manifest when routeToMenifest() is called', () => {
    spyOn(component.router, 'navigate');
    component.routeToMenifest();
    expect(component.router.navigate).toHaveBeenCalledWith(['manifest']);
  });

  it('should set showList to false and not navigate when getList() is called with invalid form', () => {
    spyOn(component.router, 'navigate');
    component.getList();
    expect(component.showList).toBeFalsy();
    expect(component.router.navigate).not.toHaveBeenCalled();
  });

  it('should navigate to manifest when routeToMenifest() is called', () => {
    spyOn(component.router, 'navigate');
    component.routeToMenifest();
    expect(component.router.navigate).toHaveBeenCalledWith(['manifest']);
  });

});

