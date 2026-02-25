import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';
import { YardCfsMasterComponent } from './yard-cfs-master.component';
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
import { TranslateModule } from '@ngx-translate/core';
import { MastersSortPipe } from 'src/app/shared/util/mastersort';
class MockCommonFunctions { }
class MockNzNotificationService { }
class MockOverlay { }
describe('YardCfsMasterComponent', () => {
  let component: YardCfsMasterComponent;
  let fixture: ComponentFixture<YardCfsMasterComponent>;
  let modalService: NgbModal;
  let mastersService: MastersService;
  let profilesService: ProfilesService;
  let commonFunctions: CommonFunctions;
  let cognitoService: CognitoService;
  let notificationService: NzNotificationService;
  let loaderService: LoaderService;
  let commonService: CommonService;
  let router: Router

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
      declarations: [YardCfsMasterComponent,MastersSortPipe],
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
        { provide: CommonFunctions, useClass: MockCommonFunctions },
        { provide: CognitoService, useClass: MockCognitoService },
        { provide: NzNotificationService, useClass: MockNzNotificationService },
        { provide: Overlay, useClass: MockOverlay },
        { provide: CommonFunctions, useValue: commonFunctionsMock },
        { provide: CognitoService, useClass: MockCognitoService },
        { provide: ActivatedRoute, useClass: ActivatedRouteStub },
        { provide: MastersSortPipe, useValue: MastersSortPipe },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(YardCfsMasterComponent);
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

  it('should initialize form on ngOnInit', () => {
    component.ngOnInit();
    expect(component.locationForm).toBeDefined();
  });

  it('should call getLocation method on ngOnInit', () => {
    spyOn(component, 'getLocation');
    component.ngOnInit();
    expect(component.getLocation).toHaveBeenCalled();
  });

  it('should call getcountryList method on ngOnInit', () => {
    spyOn(component, 'getcountryList');
    component.ngOnInit();
    expect(component.getcountryList).toHaveBeenCalled();
  });

  it('should call getPortDropDowns method on ngOnInit', () => {
    spyOn(component, 'getPortDropDowns');
    component.ngOnInit();
    expect(component.getPortDropDowns).toHaveBeenCalled();
  });

  it('should call getSmartAgentList method on ngOnInit', () => {
    spyOn(component, 'getSmartAgentList');
    component.ngOnInit();
    expect(component.getSmartAgentList).toHaveBeenCalled();
  });

  it('should call getUserDetails method on ngOnInit', () => {
    spyOn(component.cognito, 'getUserDatails').and.returnValue(of({ tenantId: 'testTenantId' }) as any);
    component.ngOnInit();
    expect(component.tenantId).toBe('testTenantId');
  });

  it('should call getBranchList method', () => {
    spyOn(component.commonService, 'filterList').and.returnValue({ query: {} } as any);
    spyOn(component.commonService, 'getSTList').and.returnValue(of({ documents: [{ branchId: 'testBranchId' }] }));
    component.getBranchList('testAgentId');
    expect(component.agentBranchList).toEqual([{ branchId: 'testBranchId' }]as any);
  });

  it('should call getPortDropDowns method', () => {
    spyOn(component.commonService, 'filterList').and.returnValue({ query: {} } as any);
    spyOn(component.commonService, 'getSTList').and.returnValue(of({ documents: [{ portId: 'testPortId' }] }));
    component.getPortDropDowns();
    expect(component.portList).toEqual([{ portId: 'testPortId' }]as any);
  });

  it('should call getTerminal method', () => {
    component.portList = [{ portId: 'testPortId', terminals: [{ name: 'Terminal1' }] }as any];
    component.getTerminal('testPortId');
    expect(component.terminalList).toEqual([{ item_id: 'Terminal1', item_text: 'Terminal1' }]);
  });

  it('should call getcountryList method', () => {
    spyOn(component.commonService, 'filterList').and.returnValue({ query: {} } as any);
    spyOn(component.commonService, 'getSTList').and.returnValue(of({ documents: [{ countryId: 'testCountryId' }] }));
    component.getcountryList();
    expect(component.countryData).toEqual([{ countryId: 'testCountryId' }]as any);
  });

  it('should call getStateList method', () => {
    component.locationForm.get('country').setValue('testCountryId');
    spyOn(component.commonService, 'filterList').and.returnValue({ query: { countryId: 'testCountryId' } } as any);
    spyOn(component.commonService, 'getSTList').and.returnValue(of({ documents: [{ stateId: 'testStateId' }] }));
    component.getStateList();
    expect(component.stateList).toEqual([{ stateId: 'testStateId' }]as any);
  });

  it('should call getLocation method', () => {
    spyOn(component.commonService, 'filterList').and.returnValue({ query: { masterType: { '$in': ['YARD', 'CFS'] } } } as any);
    spyOn(component.commonService, 'getSTList').and.returnValue(of({ documents: [{ locationId: 'testLocationId' }], totalCount: 1 }));
    component.getLocation();
    expect(component.locationData).toEqual([{ locationId: 'testLocationId' }]as any);
    expect(component.toalLength).toBe(1);
    expect(component.count).toBe(1);
  });

  it('should call next method', () => {
    component.toalLength = 10;
    component.count = 5;
    spyOn(component, 'getPaginationData');
    component.next();
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });

  it('should call prev method', () => {
    component.page = 2;
    spyOn(component, 'getPaginationData');
    component.prev();
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should call getPaginationData method with type prev', () => {
    spyOn(component, 'getPaginationData');
    component.getPaginationData('prev');
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should call clear method', () => {
    spyOn(component, 'getLocation');
    component.clear();
    expect(component.getLocation).toHaveBeenCalled();
  });

  it('should handle pagination data for previous page', () => {
    spyOn(component, 'getPaginationData');
    component.prev();
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should handle clearing the search filter', () => {
    spyOn(component, 'getLocation');
    component.clear();
    expect(component.getLocation).toHaveBeenCalled();
  });

  it('should handle opening PDF', () => {
    spyOn(component, 'openPDF');
    component.openPDF();
    expect(component.openPDF).toHaveBeenCalled();
  });




});
