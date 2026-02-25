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
import { PdacostListComponent } from './pdacost-list.component';




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
  useExisting: forwardRef(() => PdacostListComponent),
  multi: true
};

class MockNgbModalRef {
  result: Promise<any>;
  close(): void { }
  dismiss(): void { }
}


describe('PdacostListComponent', () => {
  let component: PdacostListComponent;
  let fixture: ComponentFixture<PdacostListComponent>;
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
    mockMastersService = jasmine.createSpyObj('MastersService', ['getSTList', 'systemtypeList','pdatemplateList']);
    mockProfilesService = jasmine.createSpyObj('ProfilesService', ['getUserDetails']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails', 'getModule']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList']);

    TestBed.configureTestingModule({
      declarations: [PdacostListComponent, MockTranslatePipe,],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientModule, RouterModule, ReactiveFormsModule, RouterModule, TranslateModule.forRoot(), NzSelectModule, NzDatePickerModule, BrowserAnimationsModule],
      providers: [DatePipe, OrderByPipe, TranslateService, MastersSortPipe,
        { provide: NgbModal, useValue: mockNgbModal }, CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR,

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
    fixture = TestBed.createComponent(PdacostListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  
  it('should call getPdaList on ngOnInit', () => {
    spyOn(component, 'getPdaList');
    component.ngOnInit();
    expect(component.getPdaList).toHaveBeenCalled();
  });

  it('should call getPdaList and set pdacostData on initialization', () => {
    const testData = { hits: { hits: ['test1', 'test2'], total: { value: 2 } } };
    mockMastersService.pdatemplateList.and.returnValue(of(testData));
    component.ngOnInit();
    expect(component.pdacostData).toEqual(['test1', 'test2']);
    expect(component.toalLength).toEqual(2);
    expect(component.count).toEqual(2);
  });

  it('should call next and getPaginationData on next', () => {
    spyOn(component, 'getPaginationData');
    component.toalLength = 10;
    component.count = 5;
    component.next();
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });

  it('should call prev and getPaginationData on prev', () => {
    spyOn(component, 'getPaginationData');
    component.page = 2;
    component.prev();
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should call filter and getPdaList on filter', () => {
    spyOn(component, 'getPdaList');
    const event = { target: { value: 20 } };
    component.filter(event);
    expect(component.size).toEqual(20);
    expect(component.fromSize).toEqual(1);
    expect(component.getPdaList).toHaveBeenCalled();
  });

  it('should call getPaginationData with next and update values accordingly', () => {
    const testData = { hits: { hits: ['test3', 'test4'], total: { value: 4 } } };
    mockMastersService.pdatemplateList.and.returnValue(of(testData));
    component.count = 2;
    component.toalLength = 4;
    component.getPaginationData('next');
    expect(component.pdacostData).toEqual(['test3', 'test4']);
    expect(component.page).toEqual(2);
    expect(component.count).toEqual(4);
  });

  it('should call open and set getUser accordingly', () => {
    const mockContent = {};
    const mockPdacost = { id: 1, name: 'Test' };
    component.open(mockContent, mockPdacost);
    expect(component.getUser).toEqual(mockPdacost);
  });


});
