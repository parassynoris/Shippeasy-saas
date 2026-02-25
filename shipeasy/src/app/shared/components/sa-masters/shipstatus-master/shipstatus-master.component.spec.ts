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
import { ShipstatusMasterComponent } from './shipstatus-master.component';


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
  useExisting: forwardRef(() => ShipstatusMasterComponent),
  multi: true
};

describe('ShipstatusMasterComponent', () => {
  let component: ShipstatusMasterComponent;
  let fixture: ComponentFixture<ShipstatusMasterComponent>;
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
    mockMastersService = jasmine.createSpyObj('MastersService', ['getSTList','systemtypeList']);
    mockProfilesService = jasmine.createSpyObj('ProfilesService', ['getUserDetails']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails','getModule']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList']);

    TestBed.configureTestingModule({
      declarations: [ShipstatusMasterComponent, MockTranslatePipe,],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientModule,RouterModule,ReactiveFormsModule,RouterModule,TranslateModule.forRoot(),NzSelectModule,NzDatePickerModule,BrowserAnimationsModule],
      providers: [DatePipe, OrderByPipe,TranslateService,MastersSortPipe,
        { provide: NgbModal, useValue: mockNgbModal },CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR,

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
    fixture = TestBed.createComponent(ShipstatusMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch data successfully', () => {
    // Mock response data
    const responseData = {
      hits: {
        hits: [{ _source: { typeName: 'Test Ship 1' } }, { _source: { typeName: 'Test Ship 2' } }],
        total: { value: 2 }
      }
    };
  
    // Mock service method to return observable of response data
    mockMastersService.systemtypeList.and.returnValue(of(responseData));
  
    // Call the method
    component.getData();
  
    // Check if shipData is populated with expected data
    expect(component.shipData.length).toBe(2);
    expect(component.shipData[0]._source.typeName).toBe('Test Ship 1');
    expect(component.shipData[1]._source.typeName).toBe('Test Ship 2');
  });

  it('should open modal dialog with correct content and options', () => {
    // Mock content and ship object
    const content = 'Test Content';
    const ship = { _source: { systemtypeId: '123', typeName: 'Test Ship' } };
  
    // Call the method
    component.open(content, ship);
  
    // Check if modalService.open is called with correct arguments
    expect(mockNgbModal.open).toHaveBeenCalledWith(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  
    // Check if ship data is patched into form if provided
    expect(component.shipIdToUpdate).toBe(ship._source.systemtypeId);
    expect(component.addShipStatusForm.value.typeName).toBe(ship._source.typeName);
  });
  
  it('should set isSearchable flag to true', () => {
    // Call the method
    component.searchDataChange();
  
    // Check if isSearchable is set to true
    expect(component.isSearchable).toBe(true);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form', () => {
    expect(component.addShipStatusForm).toBeDefined();
    expect(component.addShipStatusForm.controls['typeName'].value).toBe('');
    expect(component.addShipStatusForm.controls['status'].value).toBe(true);
  });

  it('should initialize the form with default values', () => {
    expect(component.addShipStatusForm).toBeDefined();
    expect(component.addShipStatusForm.get('typeName').value).toBe('');
    expect(component.addShipStatusForm.get('status').value).toBe(true);
  });
  
  it('should handle form validation errors', () => {
    component.addShipStatusForm.get('typeName').setValue('');
    component.shipMasters();
    expect(component.addShipStatusForm.invalid).toBeTrue();
    expect(component.addShipStatusForm.get('typeName').hasError('required')).toBeTrue();
  });


  
});
