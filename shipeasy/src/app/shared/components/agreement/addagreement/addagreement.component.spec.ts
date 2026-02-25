import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { of, throwError } from 'rxjs';
import { ApiService } from 'src/app/admin/principal/api.service';

import { CognitoService } from 'src/app/services/cognito.service';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Pipe, PipeTransform } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CurrencyPipe, DatePipe } from '@angular/common'; 
import { OrderByPipe } from 'src/app/shared/util/sort';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonService } from 'src/app/services/common/common.service';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { AddagreementComponent } from './addagreement.component';

@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  
  constructor(private currencyPipe: CurrencyPipe) {}
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('AddagreementComponent', () => {
  let component: AddagreementComponent;
  let fixture: ComponentFixture<AddagreementComponent>;
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
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails','getagentDetails',]);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList', 'UpdateToST','countryList','portList','vesselList','cargoList','getListByURL','costItemsList','clauseList']);
   mockApiService = jasmine.createSpyObj('ApiService',['getListByURL']);
    TestBed.configureTestingModule({
      declarations: [AddagreementComponent, MockTranslatePipe],
      imports: [ReactiveFormsModule,SharedModule,NzSelectModule,NzDatePickerModule,RouterTestingModule,BrowserAnimationsModule ,HttpClientModule,TranslateModule.forRoot()],
      providers: [DatePipe, OrderByPipe,CurrencyPipe,
        { provide: NgbModal, useValue: mockNgbModal },
        { provide: ApiService, useValue: mockApiService },
        { provide: NzNotificationService, useValue: mockNotificationService },
        { provide: MastersService, useValue: mockMastersService },
        { provide: ProfilesService, useValue: mockProfilesService },
        { provide: SaMasterService, useValue: {} },
        { provide: CognitoService, useValue: mockCognitoService },
        { provide: CommonService, useValue: mockCommonService }
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddagreementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should delete a file from documentPayload', () => {
    component.documentPayload = [{ documentName: 'Document1' }, { documentName: 'Document2' }];
    const docToDelete = { documentName: 'Document1' };
    component.deleteFile(docToDelete);
    expect(component.documentPayload.length).toBe(1);
    expect(component.documentPayload[0].documentName).toBe('Document2');
  });

  it('should handle deletion from empty documentPayload', () => {
    // Ensure documentPayload is empty
    component.documentPayload = [];
    const docToDelete = { documentName: 'Document1' };
    component.deleteFile(docToDelete);
    expect(component.documentPayload.length).toBe(0);
  });

  it('should handle deleting the last file in documentPayload', () => {
    // Test scenario where the file to be deleted is the last one in the array
    const docToDelete = { documentName: 'Document1' };
    component.documentPayload = [docToDelete];
    component.deleteFile(docToDelete);
    expect(component.documentPayload.length).toBe(0);
  });
  
  it('should delete the correct file when document names contain special characters or spaces', () => {
    // Test scenario where document names contain special characters or spaces
    component.documentPayload = [
      { documentName: 'Document with spaces.pdf' },
      { documentName: 'Document#1.pdf' },
      { documentName: 'AnotherDocument.pdf' }
    ];
    const docToDelete = { documentName: 'Document with spaces.pdf' };
    component.deleteFile(docToDelete);
    expect(component.documentPayload.length).toBe(2);
    expect(component.documentPayload).not.toContain(docToDelete);
  });

  it('should delete files with different document names', () => {
    // Test scenario where documents with different names are deleted
    component.documentPayload = [
      { documentName: 'Document1.pdf' },
      { documentName: 'Document2.pdf' },
      { documentName: 'Document3.pdf' }
    ];
    const docToDelete = { documentName: 'Document2.pdf' };
    component.deleteFile(docToDelete);
    expect(component.documentPayload.length).toBe(2);
    expect(component.documentPayload).not.toContain(docToDelete);
  });
  
  it('should delete the correct file when deleting multiple files', () => {
    // Test scenario where multiple files are deleted
    component.documentPayload = [
      { documentName: 'Document1.pdf' },
      { documentName: 'Document2.pdf' },
      { documentName: 'Document3.pdf' }
    ];
    const docsToDelete = [
      { documentName: 'Document1.pdf' },
      { documentName: 'Document3.pdf' }
    ];
    docsToDelete.forEach(doc => component.deleteFile(doc));
    expect(component.documentPayload.length).toBe(1);
    expect(component.documentPayload).not.toContain(docsToDelete[0]);
    expect(component.documentPayload).not.toContain(docsToDelete[1]);
  });
  
  it('should delete the correct file when documentPayload is an empty array', () => {
    // Test scenario where documentPayload is initially an empty array
    component.documentPayload = [];
    const docToDelete = { documentName: 'Document1.pdf' };
    component.deleteFile(docToDelete);
    expect(component.documentPayload.length).toBe(0);
  });
  
  it('should not delete any file when documentPayload is empty and trying to delete a file', () => {
    // Test scenario where documentPayload is initially empty and trying to delete a file
    component.documentPayload = [];
    const docToDelete = { documentName: 'Document1.pdf' };
    component.deleteFile(docToDelete);
    expect(component.documentPayload.length).toBe(0);
  });

});
