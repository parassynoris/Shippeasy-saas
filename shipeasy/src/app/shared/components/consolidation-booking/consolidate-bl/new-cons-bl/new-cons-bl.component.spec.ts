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
import { MastersSortPipe } from 'src/app/shared/util/mastersort';
import { NewConsBlComponent } from './new-cons-bl.component';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';



@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('NewConsBlComponent', () => {
  let component: NewConsBlComponent;
  let fixture: ComponentFixture<NewConsBlComponent>;
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
      declarations: [NewConsBlComponent, MockTranslatePipe, MastersSortPipe],
      imports: [NgbModule, ReactiveFormsModule,NzSelectModule,BrowserAnimationsModule,NzDatePickerModule,FormsModule, RouterTestingModule, HttpClientModule],
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
    fixture = TestBed.createComponent(NewConsBlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should set product data when product id is selected', () => {
    component.productList = [{ productId: '1', productType: 'Type 1', technicalName: 'Tech 1', imcoClass: 'Class 1', unNumber: 'UN 1' }];
    component.addblForm.value.product_id = '1';
    component.productData();
    expect(component.addblForm.controls.cargoType.value).toBe('Type 1');
    expect(component.addblForm.controls.technical_name.value).toBe('Tech 1');
    expect(component.addblForm.controls.imco_class.value).toBe('Class 1');
    expect(component.addblForm.controls.un_no.value).toBe('UN 1');
  });

  it('should call getBatchList on init', () => {
    const getBatchListSpy = spyOn(component, 'getBatchList');
    component.ngOnInit();
    expect(getBatchListSpy).toHaveBeenCalledTimes(1);
  });
  it('should update form fields with address', () => {
    component.partyMasterNameList = [
      { partymasterId: '1', addressInfo: { address: 'Shipper Address' } },
      { partymasterId: '2', addressInfo: { address: 'Consignee Address' } }
    ];
    component.addblForm.get('shipper').setValue('1');
    component.addblForm.get('consignee').setValue('2');
    component.getAddressDropDowns();
  
    expect(component.addblForm.get('shipper_address').value).toBe('Shipper Address');
    expect(component.addblForm.get('consignee_address').value).toBe('Consignee Address');
  });
  it('should set address based on ID', () => {
    component.partyMasterNameList = [
      { partymasterId: '1', addressInfo: { address: 'Test Address' } }
    ];
    component.setAddress('shipper_address', '1');
  
    expect(component.addblForm.get('shipper_address').value).toBe('Test Address');
  });

  it('should handle IGM change', () => {
    // Add your specific logic here
  });
 
  it('should disable ETA date before booking date', () => {
    component.batchDetails = { bookingDate: '2024-07-01' };
    const date = new Date('2024-06-30');
    expect(component.disabledEtaDate(date)).toBeTrue();
  });
  it('should update checkedContainers when checked', () => {
    const event = { target: { checked: true } };
    const check = { palletDetails: [{ containerId: '1' }], branchId: 'branch1', batchNo: 'batch1' };
  
    component.onCheck(event, check, 0);
  
    expect(component.checkedContainers.length).toBe(1);
  });

                                
});
