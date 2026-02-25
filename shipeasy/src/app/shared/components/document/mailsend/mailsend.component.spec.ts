import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { Pipe, PipeTransform } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import * as XLSX from "xlsx";
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common'; import { OrderByPipe } from 'src/app/shared/util/sort';
import { MailsendComponent } from './mailsend.component';


@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('MailsendComponent', () => {
  let component: MailsendComponent;
  let fixture: ComponentFixture<MailsendComponent>;
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
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList', 'UpdateToST']);

    TestBed.configureTestingModule({
      declarations: [MailsendComponent, MockTranslatePipe],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientModule],
      providers: [DatePipe, OrderByPipe,
        { provide: NgbModal, useValue: mockNgbModal },
        { provide: ApiService, useValue: mockApiService },
        { provide: NzNotificationService, useValue: mockNotificationService },
        { provide: MastersService, useValue: mockMastersService },
        { provide: SaMasterService, useValue: {} },
        { provide: CognitoService, useValue: mockCognitoService },
        { provide: CommonService, useValue: mockCommonService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MailsendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should populate selectedFileName correctly when documentData is provided', () => {
    const documentData = [
      { documentId: 1, documentName: 'Document 1', documentType: 'Type 1' },
      { documentId: 2, documentName: 'Document 2', documentType: 'Type 2' }
    ];
    component.documentData = documentData;
    component.ngOnInit();
    expect(component.selectedFileName).toEqual([
      { id: 1, name: 'Document 1', type: 'Type 1', upload: false },
      { id: 2, name: 'Document 2', type: 'Type 2', upload: false }
    ]);
  });

  it('selectFile should add file to fileName array when checkbox is checked and upload is true', () => {
    const file = 'test.pdf';
    const event = { target: { checked: true }};
    const id = 1;
    const upload = true;
    const doc = { id: 1, content: 'base64content' };
    component.selectFile(file, event, id, upload, doc);
    expect(component.fileName).toEqual([{ name: file, content: 'base64content' }]);
  });
  
  it('selectFile should add file to fileName array when checkbox is checked and upload is false', () => {
    const file = 'test.pdf';
    const event = { target: { checked: true }};
    const id = 1;
    const upload = false;
    component.selectFile(file, event, id, upload, null);
    expect(component.fileName).toEqual([{ name: file, url: file }]);
  });
  
  it('selectFile should remove file from fileName array when checkbox is unchecked', () => {
    const file = 'test.pdf';
    const event = { target: { checked: true }};
    const id = 1;
    const upload = true;
    const doc = { id: 1, content: 'base64content' };
    component.fileName = [{ id: 1, name: file, content: 'base64content' }];
    component.selectFile(file, { target: { checked: false } }, id, upload, doc);
    expect(component.fileName).toEqual([]);
  });

  
  it('onDragOver should prevent default behavior and stop event propagation', () => {
    const event = {
      preventDefault: jasmine.createSpy('preventDefault'),
      stopPropagation: jasmine.createSpy('stopPropagation')
    };
  
    component.onDragOver(event);
  
    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('onSave should mark all form controls as touched when form is invalid', () => {
    component.myForm.setErrors({ 'invalid': true });
    component.onSave();

    expect(component.myForm.touched).toBeTrue();
  });

  it('deleteRow should remove item from selectedFileName and filesToSend arrays at specified index', () => {
    // Set up initial state
    component.selectedFileName = [
      { name: 'File 1', upload: true },
      { name: 'File 2', upload: true },
      { name: 'File 3', upload: true }
    ];
    component.filesToSend = [
      new File(['file1 content'], 'file1.txt', { type: 'text/plain' }),
      new File(['file2 content'], 'file2.txt', { type: 'text/plain' }),
      new File(['file3 content'], 'file3.txt', { type: 'text/plain' })
    ];
    const indexToRemove = 1;

    // Call deleteRow method
    component.deleteRow(indexToRemove);

    // Verify if item is removed from selectedFileName array
    expect(component.selectedFileName.length).toBe(2);
    expect(component.selectedFileName[0].name).toBe('File 1');
    expect(component.selectedFileName[1].name).toBe('File 3');

    // Verify if item is removed from filesToSend array
    expect(component.filesToSend.length).toBe(2);
    expect(component.filesToSend[0].name).toBe('file1.txt');
    expect(component.filesToSend[1].name).toBe('file3.txt');
  });
});

