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
import { SystemTypeComponent } from './system-type.component';
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

describe('SystemTypeComponent', () => {
  let component: SystemTypeComponent;
  let fixture: ComponentFixture<SystemTypeComponent>;
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
      declarations: [SystemTypeComponent, MockTranslatePipe,MastersSortPipe],
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
        { provide: MastersSortPipe, useValue: MastersSortPipe },

      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reset search parameters in clear()', () => {
    component.name = 'exampleName';
    component.typeActive = 'true';
    component.refCode = 'exampleRefCode';
    // Set more search parameters as needed

    spyOn(component, 'getAll');

    component.clear();

    expect(component.name).toBe('');
    expect(component.typeActive).toBe('');
    expect(component.refCode).toBe('');
    // Add more expectations based on your implementation
  });

  it('should reset additional search parameters in clear()', () => {
    component.name = 'exampleName';
    component.typeActive = 'true';
    component.refCode = 'exampleRefCode';
    component.parentType = 'exampleParentType';
    // Set more search parameters as needed

    spyOn(component, 'getAll');

    component.clear();

    expect(component.name).toBe('');
    expect(component.typeActive).toBe('');
    expect(component.refCode).toBe('');
    expect(component.parentType).toBe('');
    // Add more expectations based on your implementation
  });

  it('should handle next and prev with large total length in getPaginationData()', () => {
    component.toalLength = 1000; // Set a large total length
    component.count = 10;
    spyOn(component, 'getPaginationData');

    component.next();
    expect(component.getPaginationData).toHaveBeenCalledWith('next');

    component.prev();
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
    // Add more expectations based on your implementation
  });

  it('should reset multiple search parameters in clear()', () => {
    component.name = 'exampleName';
    component.typeActive = 'true';
    component.refCode = 'exampleRefCode';
    spyOn(component, 'getAll');

    component.clear();

    expect(component.name).toBe('');
    expect(component.typeActive).toBe('');
    expect(component.refCode).toBe('');
    // Add more expectations based on your implementation
  });

});
