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
import { NewDocumentComponent } from './new-document.component';

@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('NewDocumentComponent', () => {
  let component: NewDocumentComponent;
  let fixture: ComponentFixture<NewDocumentComponent>;
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
      declarations: [NewDocumentComponent, MockTranslatePipe],
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
    fixture = TestBed.createComponent(NewDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form correctly', () => {
    expect(component.docForm).toBeDefined();
    expect(component.docForm.valid).toBeFalsy();
    // Add more assertions as needed for form initialization
  });

  it('should handle document selection and deselection', () => {
    const doc = { documentName: 'Document 1', documentStatus: false };
    const event = { target: { checked: true } };

    component.selectDocument(doc, event);
    expect(component.docData.length).toBe(1);

    event.target.checked = false;
    component.selectDocument(doc, event);
    expect(component.docData.length).toBe(0);
  });

  it('should add document to docData when checkbox is checked', () => {
    const doc = { documentName: 'Document 1', documentStatus: false };
    const event = { target: { checked: true } };
  
    component.selectDocument(doc, event);
    expect(component.docData.length).toBe(1);
    expect(component.docData[0]).toBe(doc);
    expect(component.status).toBeTruthy();
  });
  
  it('should remove document from docData when checkbox is unchecked', () => {
    const doc = { documentName: 'Document 1', documentStatus: false };
    const event = { target: { checked: true } };
  
    component.selectDocument(doc, event);
  
    const uncheckedEvent = { target: { checked: false } };
    component.selectDocument(doc, uncheckedEvent);
    
    expect(component.docData.length).toBe(0);
    expect(component.status).toBeFalsy();
  });
  
  it('should select all documents when isSelected is false', () => {
    component.isSelected = false;
    component.documentTableData = [{ documentName: 'Document 1' }, { documentName: 'Document 2' }];
    spyOn(component.docData, 'push').and.callThrough();

    component.allSelect();

    expect(component.isSelected).toBeTruthy();
    expect(component.docData.push).toHaveBeenCalledWith(component.documentTableData);
    expect(component.status).toBeTruthy();
  });

  it('should deselect all documents when isSelected is true', () => {
    component.isSelected = true;
    component.docData = [{ documentName: 'Document 1' }, { documentName: 'Document 2' }];
    
    component.allSelect();

    expect(component.isSelected).toBeFalsy();
    expect(component.docData.length).toBe(0);
    expect(component.status).toBeFalsy();
  });

  it('should return true if no document has documentStatus set to true', () => {
    component.documentTableData = [
      { documentName: 'Document 1', documentStatus: false },
      { documentName: 'Document 2', documentStatus: false }
    ];

    const result = component.checkDocUploaded();

    expect(result).toBeTruthy();
  });

  it('should return false if at least one document has documentStatus set to true', () => {
    component.documentTableData = [
      { documentName: 'Document 1', documentStatus: false },
      { documentName: 'Document 2', documentStatus: true }
    ];

    const result = component.checkDocUploaded();

    expect(result).toBeFalsy();
  });
  
  
});
