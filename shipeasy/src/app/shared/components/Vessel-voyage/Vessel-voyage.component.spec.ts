import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { of, throwError } from 'rxjs';

import { MastersService } from 'src/app/services/Masters/masters.service';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { CognitoService } from 'src/app/services/cognito.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { LoaderService } from 'src/app/services/loader.service';
import { CommonService } from 'src/app/services/common/common.service';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { Overlay } from '@angular/cdk/overlay';
import * as XLSX from "xlsx";
import { TranslateModule } from '@ngx-translate/core';
import { VesselVoyageComponent } from './Vessel-voyage.component';
import { DatePipe } from '@angular/common';
import { MastersSortPipe } from '../../util/mastersort';
class MockCommonFunctions { }
class MockCognitoService { }
class MockNzNotificationService { }
class MockOverlay { }
describe('VesselVoyageComponent', () => {
  let component: VesselVoyageComponent;
  let fixture: ComponentFixture<VesselVoyageComponent>;
  let modalService: NgbModal;
  let mastersService: MastersService;
  let profilesService: ProfilesService;
  let commonFunctions: CommonFunctions;
  let cognitoService: CognitoService;
  let notificationService: NzNotificationService;
  let loaderService: LoaderService;
  let commonService: CommonService;
  let router: Router;


  const commonFunctionsMock = jasmine.createSpyObj('CommonFunctions', ['getAuthToken']);
  class MockCognitoService {
    // Mock or stub methods used in the test
    getUserDatails() {
      return /* mock data */;
    }
  }
  class ActivatedRouteStub {
    snapshot = {
      paramMap: new Map<string, string>().set('id', '123'),
    };
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VesselVoyageComponent,MastersSortPipe],
      imports: [ReactiveFormsModule, NgbModalModule, RouterTestingModule, HttpClientModule, BrowserModule,
        FormsModule,
        NgbModule,
        BrowserAnimationsModule,
        MatDialogModule, // Add MatDialogModule to imports
        AppRoutingModule,
        TranslateModule.forRoot(),
        HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of({ get: () => '123' }) }, // Adjust based on your route parameters
        },
        MastersService,
        ProfilesService,
        CommonFunctions,
        CognitoService,
        NzNotificationService,
        LoaderService,
        CommonService,
        DatePipe,
        { provide: CommonFunctions, useClass: MockCommonFunctions },
        { provide: CognitoService, useClass: MockCognitoService },
        { provide: NzNotificationService, useClass: MockNzNotificationService },
        { provide: Overlay, useClass: MockOverlay },
        { provide: CommonFunctions, useValue: commonFunctionsMock },
        { provide: CognitoService, useClass: MockCognitoService },
        { provide: ActivatedRoute, useClass: ActivatedRouteStub },
        {provide:MastersSortPipe, useValue:MastersSortPipe},
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VesselVoyageComponent);
    component = fixture.componentInstance;
    modalService = TestBed.inject(NgbModal);
    mastersService = TestBed.inject(MastersService);
    profilesService = TestBed.inject(ProfilesService);
    commonFunctions = TestBed.inject(CommonFunctions);
    cognitoService = TestBed.inject(CognitoService);
    notificationService = TestBed.inject(NzNotificationService);
    loaderService = TestBed.inject(LoaderService);
    commonService = TestBed.inject(CommonService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(VesselVoyageComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should export data to Excel', () => {
    spyOn(component, 'exportAsExcelFile').and.callThrough();
    component.exportAsExcelFile();
    expect(component.exportAsExcelFile).toHaveBeenCalled();
  });

  it('should open the modal when open method is called', () => {
    spyOn(modalService, 'open').and.returnValue({ componentInstance: { getList: of(true) } } as any);

    component.open('key', 'data');

    expect(modalService.open).toHaveBeenCalled();
  });
  it('should clear all filter values and fetch data again', () => {
    spyOn(component, 'getVesselVoyageList').and.callThrough();
    component.vesselName = 'Test Vessel';
    component.vayageNo = '123';
    component.port = 'Test Port';
    component.clear();
    expect(component.vesselName).toBe('');
    expect(component.vayageNo).toBe('');
    expect(component.port).toBe('');
    expect(component.getVesselVoyageList).toHaveBeenCalled();
  });
  
  it('should navigate to the next and previous pages correctly', () => {
    spyOn(component, 'getPaginationData').and.callThrough();
    component.toalLength = 20;
    component.count = 10;
    
    // Next page
    component.next();
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  
    // Previous page
    component.prev();
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  });
  
   


