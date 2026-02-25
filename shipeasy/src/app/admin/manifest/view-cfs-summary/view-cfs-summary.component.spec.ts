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
import { ViewCfsSummaryComponent } from './view-cfs-summary.component';



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

describe('EnquiryTypeMasterComponent', () => {
  let component: ViewCfsSummaryComponent;
  let fixture: ComponentFixture<ViewCfsSummaryComponent>;
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
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList', 'UpdateToST']);
   mockApiService = jasmine.createSpyObj('ApiService',['getListByURL']);
    TestBed.configureTestingModule({
      declarations: [ViewCfsSummaryComponent, MockTranslatePipe],
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
    fixture = TestBed.createComponent(ViewCfsSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should call location back on back()', () => {
    component.back();
  });

  it('should call getBLById on ngOnInit', () => {
    spyOn(component, 'getBLById');
    component.ngOnInit();
    expect(component.getBLById).toHaveBeenCalled();
  });

  it('should correctly calculate totalHaz', () => {
    component.csfContainerSummury = [
      { haz: 3, nonHaz: 2 },
      { haz: 1, nonHaz: 5 }
    ];
    expect(component.totalHaz('haz')).toEqual(4);
    expect(component.totalHaz()).toEqual(7);
  });

  it('should correctly calculate totalHazfpod', () => {
    component.fpodContainerSummury = [
      { haz: 3, nonHaz: 2 },
      { haz: 1, nonHaz: 5 }
    ];
    expect(component.totalHazfpod('haz')).toEqual(4);
    expect(component.totalHazfpod()).toEqual(7);
  });

  it('should correctly calculate totalContainer', () => {
    component.csfContainerSummury = [
      { containerCount: 3 },
      { containerCount: 5 }
    ];
    expect(component.totalContainer()).toEqual(8);
  });

  it('should correctly calculate totalContainerfpod', () => {
    component.fpodContainerSummury = [
      { containerCount: 3 },
      { containerCount: 5 }
    ];
    expect(component.totalContainerfpod()).toEqual(8);
  });

  it('should modify payload query when vessel id is present', () => {
    const mockPayload = { query: {} };
    const mockRouteSnapshot = { params: { 'vesId': '123' } };
    component.getBLById();
  });

  it('should correctly calculate totalContainerfpod', () => {
    // Mocking fpodContainerSummury data
    component.fpodContainerSummury = [
      { containerCount: 3 },
      { containerCount: 5 },
      { containerCount: 2 }
    ];
    expect(component.totalContainerfpod()).toEqual(10);
  });

});
