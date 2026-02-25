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
import { ActivityComponent } from './activity.component';


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
  useExisting: forwardRef(() => ActivityComponent),
  multi: true
};

describe('ActivityComponent', () => {
  let component: ActivityComponent;
  let fixture: ComponentFixture<ActivityComponent>;
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
      declarations: [ActivityComponent, MockTranslatePipe,],
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
    fixture = TestBed.createComponent(ActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getData method after 500 milliseconds of ngOnInit', waitForAsync(() => {
    spyOn(component, 'getData');
    fixture.detectChanges();
    setTimeout(() => {
      expect(component.getData).toHaveBeenCalled();
    }, 500);
  }));


  it('should call getPaginationData method with "next" type when totalLength is greater than count', () => {
    component.toalLength = 15;
    component.count = 10;
    spyOn(component, 'getPaginationData');
    component.next();
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });

  it('should call getPaginationData method with "prev" type when page is greater than 0', () => {
    component.page = 2;
    spyOn(component, 'getPaginationData');
    component.prev();
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should update size and call getData method when filter is called', () => {
    const event = { target: { value: 20 } };
    spyOn(component, 'getData');
    component.filter(event);
    expect(component.size).toBe(20);
    expect(component.fromSize).toBe(1);
    expect(component.getData).toHaveBeenCalled();
  });

  it('should reset search criteria and call getData method', () => {
    spyOn(component, 'getData');
    component.name = 'test';
    component.type = 'type';
    component.impact = 'impact';
    component.laden_apllicable = 'applicable';
    component.status = 'true';
    component.clear();
    expect(component.name).toBe('');
    expect(component.type).toBe('');
    expect(component.impact).toBe('');
    expect(component.laden_apllicable).toBe('');
    expect(component.status).toBe('');
    expect(component.getData).toHaveBeenCalled();
  });

  it('should open modal and call getData method on modal close', () => {
    const modalRef = jasmine.createSpyObj('NgbModalRef', ['componentInstance', 'result']);
    modalRef.componentInstance = { getList: of(true), fromParent: null, isType: null };
    mockNgbModal.open.and.returnValue(modalRef);
    spyOn(component, 'getData');
    component.open();
    expect(mockNgbModal.open).toHaveBeenCalled();
    expect(component.getData).toHaveBeenCalled();
  });

  it('should call getData method with delay of 500 milliseconds', waitForAsync(() => {
    spyOn(component, 'getData');
    component.ngOnInit();
    setTimeout(() => {
      expect(component.getData).toHaveBeenCalled();
    }, 500);
  }));

  it('should not call getPaginationData method when totalLength is equal to count', () => {
    component.toalLength = 10;
    component.count = 10;
    spyOn(component, 'getPaginationData');
    component.next();
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });

  it('should not call getPaginationData method when page is 0', () => {
    component.page = 0;
    spyOn(component, 'getPaginationData');
    component.prev();
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });

  it('should call getPaginationData method with "prev" type when page is 1', () => {
    component.page = 1;
    spyOn(component, 'getPaginationData');
    component.prev();
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should update size to 0 and call getData method', () => {
    const event = { target: { value: 0 } };
    spyOn(component, 'getData');
    component.filter(event);
    expect(component.size).toBe(0);
    expect(component.fromSize).toBe(1);
    expect(component.getData).toHaveBeenCalled();
  });
  

  

 
});
