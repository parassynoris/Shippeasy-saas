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
import { MastersSortPipe } from '../../util/mastersort';
import { CfsEmailComponent } from './cfs-email.component';


@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('CfsEmailComponent', () => {
  let component: CfsEmailComponent;
  let fixture: ComponentFixture<CfsEmailComponent>;
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
      declarations: [CfsEmailComponent, MockTranslatePipe,MastersSortPipe],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientModule],
      providers: [DatePipe, OrderByPipe,MastersSortPipe,
        { provide: NgbModal, useValue: mockNgbModal },
        { provide: ApiService, useValue: mockApiService },
        { provide: NzNotificationService, useValue: mockNotificationService },
        { provide: MastersService, useValue: mockMastersService },
        { provide: ProfilesService, useValue: mockProfilesService },
        { provide: SaMasterService, useValue: {} },
        { provide: CognitoService, useValue: mockCognitoService },
        { provide: CommonService, useValue: mockCommonService },
        {provide:MastersSortPipe, useValue:MastersSortPipe},
      
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CfsEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add new member to TO on valid email', () => {
    const event = { input: null, value: 'test@example.com' } as any;
    component.addnewMembersTO(event);
    expect(component.newMembersTO.length).toBe(1);
    expect(component.newMembersTO[0].to).toBe('test@example.com');
  });

  it('should not add new member to TO on invalid email', () => {
    const event = { input: null, value: 'invalid-email' } as any;
    component.addnewMembersTO(event);
    expect(component.newMembersTO.length).toBe(0);
  });

  it('should remove a member from TO', () => {
    component.newMembersTO = [{ to: 'test@example.com' }];
    component.removenewMembersTO(component.newMembersTO[0]);
    expect(component.newMembersTO.length).toBe(0);
  });

  describe('Form Initialization', () => {
    it('should initialize cfsForm and igmForm with default values', () => {
      expect(component.cfsForm).toBeTruthy();
      expect(component.igmForm).toBeTruthy();
      expect(component.cfsForm.controls['sendingMethod'].value).toBe('');
      expect(component.igmForm.controls['status'].value).toBe('');
    });
  });

  describe('Form Validation', () => {
    it('should mark EmailTo field invalid if email format is incorrect', () => {
      component.cfsForm.controls['EmailTo'].setValue('invalid-email');
      expect(component.cfsForm.controls['EmailTo'].valid).toBeFalsy();
    });

    it('should mark CC field invalid if email format is incorrect', () => {
      component.cfsForm.controls['CC'].setValue('invalid-email');
      expect(component.cfsForm.controls['CC'].valid).toBeFalsy();
    });

    it('should mark EmailTo field valid if email format is correct', () => {
      component.cfsForm.controls['EmailTo'].setValue('test@example.com');
      expect(component.cfsForm.controls['EmailTo'].valid).toBeTruthy();
    });
  });

  describe('Adding New Email Recipients', () => {
    it('should add new valid email to TO recipients list', () => {
      const event = { input: null, value: 'test@example.com' };
      component.addnewMembersTO(event);
      expect(component.newMembersTO.length).toBe(1);
      expect(component.newMembersTO[0].to).toBe('test@example.com');
    });

    it('should not add invalid email to TO recipients list', () => {
      const event = { input: null, value: 'invalid-email' };
      component.addnewMembersTO(event);
      expect(component.newMembersTO.length).toBe(0);
    });
  });

});

