import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { NgbDatepicker, NgbModal, NgbModalRef, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { of } from 'rxjs';
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
// import { BoldReportComponents } from '@boldreports/angular-reporting-components';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { MatSelectModule } from '@angular/material/select';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NewVendorBillComponent } from 'src/app/shared/components/vendor-bill/new-vendor-bill/new-vendor-bill.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

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
  useExisting: forwardRef(() => NewVendorBillComponent),
  multi: true
};

describe('NewVendorBillComponent', () => {
  let component: NewVendorBillComponent;
  let fixture: ComponentFixture<NewVendorBillComponent>;
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
      declarations: [NewVendorBillComponent, MockTranslatePipe],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientModule,RouterModule,NzSelectModule,ReactiveFormsModule,MatSelectModule,NzDatePickerModule,FormsModule
      ,NoopAnimationsModule,MatFormFieldModule,MatInputModule],
      providers: [DatePipe, OrderByPipe,
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
    fixture = TestBed.createComponent(NewVendorBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should delete the specified document', () => {
    const docToDelete = { documentName: 'Document2' };

    // Call the deleteFile function
    component.deleteFile(docToDelete);

    // Assert that the document is deleted
    expect(component.documentPayload).not.toContain(docToDelete);
  });

  it('should handle deleting from an empty array', () => {
    // Initialize an empty array
    component.documentPayload = [];

    const docToDelete = { documentName: 'NonExistentDocument' };

    // Call the deleteFile function with a document not in the array
    component.deleteFile(docToDelete);

    // Assert that the array remains empty
    expect(component.documentPayload).toEqual([]);
  });

  it('should return an empty array if addContainerData is empty', () => {
    // Initialize an empty array
    component.addContainerData = [];

    // Call the addContainerArray function
    const result = component.addContainerArray();

    // Assert that the result is an empty array
    expect(result).toEqual([]);
  });

  // it('should not call uploadFile if no files are present in the event', () => {
  //   // Create a mock file input event with no files
  //   const mockEvent = {
  //     target: {
  //       files: []
  //     }
  //   };

  //   // Call the uploadDoc function
  //   component.uploadDoc(mockEvent);
  // });

  it('should handle costItemList being undefined', () => {
    // Set costItemList to undefined
    component.costItemList = undefined;

    // Call the invoiceAMT function
    const result = component.invoiceAMT();

    // Assert that the result is 0 when costItemList is undefined
    expect(result).toEqual(0);
  });

  it('should handle empty costItemList', () => {
    // Set costItemList to an empty array
    component.costItemList = [];

    // Call the invoiceAMT function
    const result = component.invoiceAMT();

    // Assert that the result is 0 when costItemList is empty
    expect(result).toEqual(0);
  });

  it('should return 0 if costItemList is null', () => {
    // Set costItemList to null
    component.costItemList = null;

    // Call the invoiceAMT function
    const result = component.invoiceAMT();

    // Assert that the result is 0 when costItemList is null
    expect(result).toEqual(0);
  });

  it('should handle empty or null charges controls', () => {
    // Call the calculateTotal function
    component.calculateTotal();

    // Assert that the function handles null charges controls gracefully
    expect(component.totalAmount).toEqual(0);
    expect(component.taxAmount).toEqual(0);
  });

  it('should handle null or undefined payload returned by filterList', () => {
    // Assert that the locationList remains empty
    expect(component.locationList).toEqual([]);
  });

  it('should not delete the charge when the user dismisses the modal', () => {
    // Mock data for costItemList
    const mockCostItemList = [
      { enquiryitemId: 1, /* other properties */ },
      { enquiryitemId: 2, /* other properties */ },
    ];

    // Set costItemList to the mock data
    component.costItemList = mockCostItemList;

    // Mock modal content
    const mockModalContent = 'mock-modal-content';

    // Assert that the costItemList remains unchanged when the user dismisses the modal
    expect(component.costItemList).toEqual(mockCostItemList);
  });

  it('should return false when bill_date is not set', () => {
    // Call the checkInvoice function without setting bill_date
    const result = component.checkInvoice();

    // Assert that the result is false when bill_date is not set
    expect(result).toBeFalse();
  });

  it('should reset searchBatch to an empty string and clear selectedCostItems array', () => {
    // Call the submitBatch function
    component.submitBatch();

    // Assert that searchBatch is reset to an empty string
    expect(component.searchBatch).toEqual('');

    // Assert that selectedCostItems array is cleared
    expect(component.selectedCostItems).toEqual([]);
  });

  it('should not affect other component properties', () => {
    // Set other properties to simulate a specific state

    // Call the submitBatch function
    component.submitBatch();

    // Assert that searchBatch is reset to an empty string
    expect(component.searchBatch).toEqual('');

    // Assert that selectedCostItems array is cleared
    expect(component.selectedCostItems).toEqual([]);

  });

  it('should reset searchText to an empty string and set select_vendor control in newvendorForm', () => {
    // Mock data for the test
    const mockVendorData = { gst: 'MockGST' };

    // Call the setVendor function with the mock data
    component.setVendor(mockVendorData);

    // Assert that searchText is reset to an empty string
    expect(component.searchText).toEqual('');

    // Assert that select_vendor control in newvendorForm is set with the mock vendor's GST
    expect(component.newvendorForm.controls.select_vendor.value).toEqual('MockGST');
  });

  
});


