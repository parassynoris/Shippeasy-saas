import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { Pipe, PipeTransform, forwardRef } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import * as XLSX from "xlsx";
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MastersSortPipe } from 'src/app/shared/util/mastersort';
import { CheckListComponent } from './check-list.component';




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
  useExisting: forwardRef(() => CheckListComponent),
  multi: true
};

describe('CheckListComponent', () => {
  let component: CheckListComponent;
  let fixture: ComponentFixture<CheckListComponent>;
  let mockNgbModal: jasmine.SpyObj<NgbModal>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockNotificationService: jasmine.SpyObj<NzNotificationService>;
  let mockMastersService: jasmine.SpyObj<MastersService>;
  let mockProfilesService: jasmine.SpyObj<ProfilesService>;
  let mockCognitoService: jasmine.SpyObj<CognitoService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockSaMasterService: jasmine.SpyObj<SaMasterService>
  
    beforeEach(waitForAsync(() => {
    mockNgbModal = jasmine.createSpyObj('NgbModal', ['open']);
    mockApiService = jasmine.createSpyObj('ApiService', ['getSTList', 'addToST', 'UpdateToST', 'deleteST','getListByURL']);
    mockNotificationService = jasmine.createSpyObj('NzNotificationService', ['create']);
    mockMastersService = jasmine.createSpyObj('MastersService', ['getSTList','cityList']);
    mockProfilesService = jasmine.createSpyObj('ProfilesService', ['getUserDetails']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails','getModule','getagentDetails']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList']);
    mockSaMasterService = jasmine.createSpyObj('SaMasterService', ['cityList']);
    TestBed.configureTestingModule({
      declarations: [CheckListComponent, MockTranslatePipe,],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientModule,RouterModule,ReactiveFormsModule,RouterModule,TranslateModule.forRoot(),NzSelectModule,NzDatePickerModule,BrowserAnimationsModule],
      providers: [DatePipe, OrderByPipe,TranslateService,MastersSortPipe,
        { provide: NgbModal, useValue: mockNgbModal },CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR,

        { provide: ApiService, useValue: mockApiService },
        { provide: NzNotificationService, useValue: mockNotificationService },
        { provide: MastersService, useValue: mockMastersService },
        { provide: ProfilesService, useValue: mockProfilesService },
        { provide: SaMasterService, useValue: mockSaMasterService },
        { provide: CognitoService, useValue: mockCognitoService },
        { provide: CommonService, useValue: mockCommonService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getBatchById on init', () => {
    spyOn(component, 'getBatchById');
    component.ngOnInit();
    expect(component.getBatchById).toHaveBeenCalled();
  });

  it('should call getListByURL with correct parameters when getBatchById is called', () => {
    const mockResponse = {
      hits: {
        hits: [{
          _source: {
            CheckListData: {
              CheckList: [],
              GroundRent: 'Test Ground Rent',
              PaymentDetails: 'Test Payment Details',
              OPS: 'Test OPS',
              Remarks: 'Test Remarks'
            }
          }
        }]
      }
    };
    mockApiService.getListByURL.and.returnValue(of(mockResponse));
    component.id = 'test-id';
    component.getBatchById(component.id);
    expect(mockApiService.getListByURL).toHaveBeenCalledWith(jasmine.any(String), jasmine.objectContaining({
      query: jasmine.objectContaining({
        bool: jasmine.objectContaining({
          must: [
            jasmine.objectContaining({
              match: jasmine.objectContaining({
                batchId: component.id
              })
            })
          ]
        })
      })
    }));
    expect(component.batchDetail).toEqual(mockResponse.hits.hits[0]._source);
    expect(component.checkListData).toEqual(mockResponse.hits.hits[0]._source.CheckListData.CheckList);
    expect(component.addCheckListForm.value).toEqual({
      GroundRent: 'Test Ground Rent',
      PaymentDetails: 'Test Payment Details',
      OPS: 'Test OPS',
      Remarks: 'Test Remarks'
    });
  });

  it('should initialize addCheckListForm with correct form controls', () => {
    expect(component.addCheckListForm).toBeDefined();
    expect(component.addCheckListForm.controls['GroundRent']).toBeDefined();
    expect(component.addCheckListForm.controls['PaymentDetails']).toBeDefined();
    expect(component.addCheckListForm.controls['OPS']).toBeDefined();
    expect(component.addCheckListForm.controls['Remarks']).toBeDefined();
  });
  
  it('should initialize the form', () => {
    expect(component.addCheckListForm).toBeDefined();
    expect(component.addCheckListForm.contains('GroundRent')).toBeTruthy();
    expect(component.addCheckListForm.contains('PaymentDetails')).toBeTruthy();
    expect(component.addCheckListForm.contains('OPS')).toBeTruthy();
    expect(component.addCheckListForm.contains('Remarks')).toBeTruthy();
  });

  it('should fetch batch details by ID on init', () => {
    const mockBatchDetail = {
      CheckListData: {
        CheckList: [
          { id: 1, name: 'Item1', description: 'Desc1', isSelected: true }
        ],
        GroundRent: '100',
        PaymentDetails: 'Paid',
        OPS: 'OPS123',
        Remarks: 'No remarks'
      }
    };
  });

  describe('sort', () => {
    it('should sort checkListData in ascending order by column', () => {
      component.checkListData = [
        { name: 'B', description: 'Desc2' },
        { name: 'A', description: 'Desc1' }
      ];
      component.order = true;

      component.sort('name');

      expect(component.checkListData).toEqual([
        { name: 'A', description: 'Desc1' },
        { name: 'B', description: 'Desc2' }
      ]);
      expect(component.order).toBeFalse();
    });

    it('should sort checkListData in descending order by column', () => {
      component.checkListData = [
        { name: 'A', description: 'Desc1' },
        { name: 'B', description: 'Desc2' }
      ];
      component.order = false;

      component.sort('name');

      expect(component.checkListData).toEqual([
        { name: 'B', description: 'Desc2' },
        { name: 'A', description: 'Desc1' }
      ]);
      expect(component.order).toBeTrue();
    });
  });



});
