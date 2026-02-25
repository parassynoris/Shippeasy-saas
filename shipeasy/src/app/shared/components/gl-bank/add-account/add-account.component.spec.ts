import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { NgbDatepicker, NgbModal, NgbModalRef, NgbModule } from '@ng-bootstrap/ng-bootstrap';
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
// import { BoldReportComponents } from '@boldreports/angular-reporting-components';

import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { MatSelectModule } from '@angular/material/select';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AddAccountComponent } from './add-account.component';

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
  useExisting: forwardRef(() => AddAccountComponent),
  multi: true
};

describe('AddAccountComponent', () => {
  let component: AddAccountComponent;
  let fixture: ComponentFixture<AddAccountComponent>;
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
      declarations: [AddAccountComponent, MockTranslatePipe],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientModule,RouterModule,NzSelectModule,ReactiveFormsModule,MatSelectModule,NzDatePickerModule,FormsModule
      ,NoopAnimationsModule],
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
    fixture = TestBed.createComponent(AddAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle file deletion on deleteFile', () => {
    component.documentPayload = [
      { documentName: 'doc1', document: 'Document 1' },
      { documentName: 'doc2', document: 'Document 2' },
    ];

    component.deleteFile({ documentName: 'doc1', document: 'Document 1' });

    expect(component.documentPayload.length).toBe(1);
    expect(component.documentPayload[0].documentName).toBe('doc2');
    // Add more expectations as needed
  });

  it('should handle back button click', () => {
    spyOn(component.location, 'back');

    component.backbtn();

    expect(component.location.back).toHaveBeenCalled();
    // Add more expectations as needed
  });

  it('should handle file deletion', () => {
    component.documentPayload = [
      { documentName: 'doc1', document: 'Document 1' },
      { documentName: 'doc2', document: 'Document 2' },
    ];

    component.deleteFile({ documentName: 'doc1', document: 'Document 1' });

    expect(component.documentPayload.length).toBe(1);
    expect(component.documentPayload[0].documentName).toBe('doc2');
    // Add more expectations as needed
  });

  it('should handle file deletion when the documentPayload is empty', () => {
    component.documentPayload = [];

    component.deleteFile({ documentName: 'doc1', document: 'Document 1' });

    expect(component.documentPayload.length).toBe(0);
    // Add more expectations as needed
  });

  it('should handle file deletion when the documentPayload has one item', () => {
    component.documentPayload = [{ documentName: 'doc1', document: 'Document 1' }];

    component.deleteFile({ documentName: 'doc1', document: 'Document 1' });

    expect(component.documentPayload.length).toBe(0);
    // Add more expectations as needed
  });

  it('should handle file deletion when the documentPayload has multiple items', () => {
    component.documentPayload = [
      { documentName: 'doc1', document: 'Document 1' },
      { documentName: 'doc2', document: 'Document 2' },
    ];

    component.deleteFile({ documentName: 'doc1', document: 'Document 1' });

    expect(component.documentPayload.length).toBe(1);
    expect(component.documentPayload[0].documentName).toBe('doc2');
    // Add more expectations as needed
  });

  it('should handle getPatch with valid bank details', () => {
    const mockBankDetails = {
      bankUpload: 'sample-upload-url',
      country: { countryId: '1', countryName: 'Country 1', countryISOCode: 'ISO1' },
      state: { stateId: '2', stateName: 'State 2' },
      cityId: '3',
      // Add more properties as needed
    };

    component.getPatch(mockBankDetails);

    expect(component.siUpload).toEqual('sample-upload-url');
    expect(component.addAccountForm.value.country).toEqual('1');
    expect(component.addAccountForm.value.state).toEqual('2');
    expect(component.addAccountForm.value.city).toEqual('3');
    // Add more expectations as needed
  });

  it('should handle file deletion when the documentPayload is empty', () => {
    component.documentPayload = [];

    component.deleteFile({ documentName: 'doc1', document: 'Document 1' });

    expect(component.documentPayload.length).toBe(0);
    // Add more expectations as needed
  });

  it('should handle file deletion when the documentPayload has one item', () => {
    component.documentPayload = [{ documentName: 'doc1', document: 'Document 1' }];

    component.deleteFile({ documentName: 'doc1', document: 'Document 1' });

    expect(component.documentPayload.length).toBe(0);
    // Add more expectations as needed
  });

  it('should delete a file from documentPayload', () => {
    // Arrange
    const initialDocumentPayload = [
      { documentName: 'doc1', document: 'Document 1' },
      { documentName: 'doc2', document: 'Document 2' },
      { documentName: 'doc3', document: 'Document 3' },
    ];
    component.documentPayload = [...initialDocumentPayload];
  
    const fileToDelete = { documentName: 'doc2', document: 'Document 2' };
  
    // Act
    component.deleteFile(fileToDelete);
  
    // Assert
    expect(component.documentPayload.length).toBe(initialDocumentPayload.length - 1);
    expect(component.documentPayload).not.toContain(fileToDelete);
    // Add more expectations as needed
  });

  
});
