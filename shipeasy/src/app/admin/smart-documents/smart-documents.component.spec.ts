import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ApiService } from 'src/app/admin/principal/api.service';
import { CommonService } from 'src/app/services/common/common.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Pipe, PipeTransform, forwardRef } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { Router, RouterModule } from '@angular/router';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FilterPipe1 } from 'src/app/shared/components/route/route.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { SmartDocumentsComponent } from './smart-documents.component';
import { MatTableDataSource } from '@angular/material/table';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    return value;
  }
}

const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => SmartDocumentsComponent),
  multi: true
};

describe('SmartDocumentsComponent', () => {
  let component: SmartDocumentsComponent;
  let fixture: ComponentFixture<SmartDocumentsComponent>;
  let mockNgbModal: jasmine.SpyObj<NgbModal>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockNotificationService: jasmine.SpyObj<NzNotificationService>;
  let mockMastersService: jasmine.SpyObj<MastersService>;
  let mockProfilesService: jasmine.SpyObj<ProfilesService>;
  let mockCognitoService: jasmine.SpyObj<CognitoService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(waitForAsync(() => {
    mockNgbModal = jasmine.createSpyObj('NgbModal', ['open']);
    mockApiService = jasmine.createSpyObj('ApiService', ['getSTList', 'addToST', 'UpdateToST', 'deleteST']);
    mockNotificationService = jasmine.createSpyObj('NzNotificationService', ['create']);
    mockMastersService = jasmine.createSpyObj('MastersService', ['getSTList']);
    mockProfilesService = jasmine.createSpyObj('ProfilesService', ['getUserDetails']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      declarations: [SmartDocumentsComponent, MockTranslatePipe, FilterPipe1],
      imports: [
        NgbModule,
        SharedModule,
        ReactiveFormsModule,
        FormsModule,
        RouterTestingModule,
        NzSelectModule,
        HttpClientModule,
        RouterModule,
        CommonModule,
        BrowserAnimationsModule,
        NzDatePickerModule
      ],
      providers: [
        DatePipe,
        OrderByPipe,
        { provide: NgbModal, useValue: mockNgbModal },
        CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR,
        { provide: ApiService, useValue: mockApiService },
        { provide: NzNotificationService, useValue: mockNotificationService },
        { provide: MastersService, useValue: mockMastersService },
        { provide: ProfilesService, useValue: mockProfilesService },
        { provide: SaMasterService, useValue: {} },
        { provide: CognitoService, useValue: mockCognitoService },
        { provide: CommonService, useValue: mockCommonService },
        { provide: Router, useValue: routerSpy }
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('#ngOnInit', () => {
    it('should call getAgentAdviseList', () => {
      spyOn(component, 'getAgentAdviseList');
      component.ngOnInit();
      expect(component.getAgentAdviseList).toHaveBeenCalledWith('');
    });
  });

  describe('#applyFilter', () => {
    it('should filter the data source', () => {
      component.dataSource = new MatTableDataSource([
        { basicDetails: { uniqueRefNo: '12345' }, shipperDetails: { shipperName: 'Test Shipper' } }
      ]);
      component.applyFilter('Test');
      expect(component.dataSource.filter).toBe('test');
    });
  });

  describe('#navToAdd', () => {
    it('should navigate to add page', () => {
      const key = 'newKey';
      component.navToAdd(key);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/smart-documents/list/' + key + '/add']);
    });
  });

  describe('#navToEdit', () => {
    it('should navigate to edit page with correct parameters', () => {
      const element = { smartdocumentId: '1', documentKey: 'docKey' };
      component.navToEdit(element);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/smart-documents/list/1/docKey/edit']);
    });
  });
});
