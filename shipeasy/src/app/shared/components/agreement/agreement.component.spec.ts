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
import { AgreementComponent } from './agreement.component';


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

describe('AgreementComponent', () => {
  let component: AgreementComponent;
  let fixture: ComponentFixture<AgreementComponent>;
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
      declarations: [AgreementComponent, MockTranslatePipe],
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
    fixture = TestBed.createComponent(AgreementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should clear all properties', () => {
    // Arrange
    component.name = 'Test Name';
    component.port = 'Test Port';
    component.country = 'Test Country';
    component.startdate = 'Test Start Date';
    component.enddate = 'Test End Date';

    // Act
    component.clear();

    // Assert
    expect(component.name).toBe('');
    expect(component.port).toBe('');
    expect(component.country).toBe('');
    expect(component.startdate).toBe('');
    expect(component.enddate).toBe('');
  });

  it('should call getData() after clearing properties', () => {
    // Arrange
    const getDataSpy = spyOn(component, 'getData');

    // Act
    component.clear();

    // Assert
    expect(getDataSpy).toHaveBeenCalled();
  });

  it('should clear properties and call getData()', () => {
    // Arrange
    const getDataSpy = spyOn(component, 'getData');

    // Act
    component.name = 'Test Name';
    component.port = 'Test Port';
    component.country = 'Test Country';
    component.startdate = 'Test Start Date';
    component.enddate = 'Test End Date';
    component.clear();

    // Assert
    expect(component.name).toBe('');
    expect(component.port).toBe('');
    expect(component.country).toBe('');
    expect(component.startdate).toBe('');
    expect(component.enddate).toBe('');
    expect(getDataSpy).toHaveBeenCalled();
  });

  it('should call getData() even if some properties are empty', () => {
    // Arrange
    const getDataSpy = spyOn(component, 'getData');

    // Act
    component.name = 'Test Name';
    component.port = 'Test Port';
    component.clear();

    // Assert
    expect(getDataSpy).toHaveBeenCalled();
  });

  it('should clear properties and call getData()', () => {
    // Arrange
    const getDataSpy = spyOn(component, 'getData');

    // Act
    component.name = 'Test Name';
    component.port = 'Test Port';
    component.country = 'Test Country';
    component.startdate = 'Test Start Date';
    component.enddate = 'Test End Date';
    component.clear();

    // Assert
    expect(component.name).toBe('');
    expect(component.port).toBe('');
    expect(component.country).toBe('');
    expect(component.startdate).toBe('');
    expect(component.enddate).toBe('');
    expect(getDataSpy).toHaveBeenCalled();
  });

  it('should call getData() when some properties are empty', () => {
    // Arrange
    const getDataSpy = spyOn(component, 'getData');
    component.name = 'Test Name';
    component.port = 'Test Port';

    // Act
    component.clear();

    // Assert
    expect(getDataSpy).toHaveBeenCalled();
  });

  it('should set properties to empty strings even if they are null', () => {
    // Arrange
    component.name = null;
    component.port = null;
    component.country = null;
    component.startdate = null;
    component.enddate = null;

    // Act
    component.clear();

    // Assert
    expect(component.name).toBe('');
    expect(component.port).toBe('');
    expect(component.country).toBe('');
    expect(component.startdate).toBe('');
    expect(component.enddate).toBe('');
  });

});
