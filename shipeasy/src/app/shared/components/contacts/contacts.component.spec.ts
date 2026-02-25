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
import { ContactsComponent } from './contacts.component';


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
  useExisting: forwardRef(() => ContactsComponent),
  multi: true
};

describe('ContactsComponent', () => {
  let component: ContactsComponent;
  let fixture: ComponentFixture<ContactsComponent>;
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
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails','getModule']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList']);

    TestBed.configureTestingModule({
      declarations: [ContactsComponent, MockTranslatePipe,],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientModule,RouterModule,ReactiveFormsModule,RouterModule,TranslateModule.forRoot(),NzSelectModule,NzDatePickerModule,BrowserAnimationsModule],
      providers: [DatePipe, OrderByPipe,TranslateService,
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
    fixture = TestBed.createComponent(ContactsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getAll method on ngOnInit', () => {
    spyOn(component, 'getAll');
    component.ngOnInit();
    expect(component.getAll).toHaveBeenCalled();
  });

  it('should call getAll method on clear', () => {
    spyOn(component, 'getAll');
    component.clear();
    expect(component.getAll).toHaveBeenCalled();
  });

  it('should call getAll method with correct parameters on filter', () => {
    spyOn(component, 'getAll');
    component.filter({ target: { value: 10 } });
    expect(component.size).toBe(10);
    expect(component.getAll).toHaveBeenCalledWith(component.prentPath, 10);
  });

  it('should call getPaginationData method with correct parameters on next', () => {
    spyOn(component, 'getPaginationData');
    component.toalLength = 20;
    component.count = 10;
    component.next();
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });

  it('should call getPaginationData method with correct parameters on prev', () => {
    spyOn(component, 'getPaginationData');
    component.page = 2;
    component.prev();
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

it('should call getAll method with correct parameters on ngOnInit', () => {
  spyOn(component, 'getAll');
  component.ngOnInit();
  expect(component.getAll).toHaveBeenCalledWith(component.prentPath, component.size);
});

it('should call getAll method with correct parameters on clear', () => {
  spyOn(component, 'getAll');
  component.clear();
  expect(component.getAll).toHaveBeenCalledWith(component.prentPath, Number(component.size));
});

it('should set size and call getAll method with correct parameters on filter', () => {
  spyOn(component, 'getAll');
  component.filter({ target: { value: 10 } });
  expect(component.size).toBe(10);
  expect(component.getAll).toHaveBeenCalledWith(component.prentPath, 10);
});

it('should call getPaginationData method with next on next', () => {
  spyOn(component, 'getPaginationData');
  component.toalLength = 20;
  component.count = 10;
  component.next();
  expect(component.getPaginationData).toHaveBeenCalledWith('next');
});

it('should call getPaginationData method with prev on prev', () => {
  spyOn(component, 'getPaginationData');
  component.page = 2;
  component.prev();
  expect(component.getPaginationData).toHaveBeenCalledWith('prev');
});

it('should call updateRecord method on statusChange', () => {
  spyOn(component.sharedService, 'updateRecord').and.returnValue(of({}));
  component.statusChange({ target: { checked: true } }, 'contactId', {});
  expect(component.sharedService.updateRecord).toHaveBeenCalled();
});

it('should call ngUnsubscribe methods on ngOnDestroy', () => {
  spyOn(component.ngUnsubscribe, 'next');
  spyOn(component.ngUnsubscribe, 'complete');
  component.ngOnDestroy();
  expect(component.ngUnsubscribe.next).toHaveBeenCalled();
  expect(component.ngUnsubscribe.complete).toHaveBeenCalled();
});
  
 
});
