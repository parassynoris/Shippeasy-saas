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
import { TranslateModule } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { ICDMasterComponent } from './icd-master.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { Pipe, PipeTransform } from '@angular/core';
import { MastersSortPipe } from 'src/app/shared/util/mastersort';


// Mock implementation of OrderByPipe
@Pipe({ name: 'orderBy' })
class MockOrderByPipe implements PipeTransform {
  transform(value: any[], key: string): any[] {
    return value; // Mock implementation: return the input array without sorting
  }
}
class MockCommonFunctions { }
class MockCognitoService { }
class MockNzNotificationService { }
class MockOverlay { }
describe('ICDMasterComponent', () => {
  let component: ICDMasterComponent;
  let fixture: ComponentFixture<ICDMasterComponent>;
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
      declarations: [ICDMasterComponent, OrderByPipe,MockOrderByPipe],
      imports: [ReactiveFormsModule, NgbModalModule, RouterTestingModule, HttpClientModule, BrowserModule,
        FormsModule,
        NgbModule,
        SharedModule,
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
       
        { provide: CommonFunctions, useValue: commonFunctionsMock },
        { provide: CognitoService, useClass: MockCognitoService },
        { provide: ActivatedRoute, useClass: ActivatedRouteStub },
        { provide: OrderByPipe, useClass: MockOrderByPipe },
        {provide:MastersSortPipe, useValue:MastersSortPipe},
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ICDMasterComponent);
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

  it('should call getcountryList, getLocation, getPortDropDowns, and getAgent in ngOnInit', () => {
    spyOn(component, 'getcountryList');
    spyOn(component, 'getLocation');
    spyOn(component, 'getPortDropDowns');
    spyOn(component, 'getAgent');

    component.ngOnInit();

    expect(component.getcountryList).toHaveBeenCalled();
    expect(component.getLocation).toHaveBeenCalled();
    expect(component.getPortDropDowns).toHaveBeenCalled();
    expect(component.getAgent).toHaveBeenCalled();
  });

  it('should call sortPipe.transform with correct arguments in sort method', () => {
    const array = [{}, {}, {}]; // Provide a sample array
    const key = 'someKey'; // Provide a sample key

    spyOn(component.sortPipe, 'transform');

    component.sort(array, key);

    expect(component.sortPipe.transform).toHaveBeenCalledWith(array, key);
  });

  it('should call getPaginationData with "prev" when prev is called', () => {
    spyOn(component, 'getPaginationData');

    component.prev();

    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should set locationForm controls to default values when clear is called', () => {
    component.name = 'sampleName';
    component.type = 'sampleType';
    component.country = 'sampleCountry';
    component.state = 'sampleState';

    component.clear();

    expect(component.name).toEqual('');
    expect(component.type).toEqual('');
    expect(component.country).toEqual('');
    expect(component.state).toEqual('');
  });

  it('should set locationIdToUpdate to null and call formBuild when onSave is called', () => {
    spyOn(component, 'formBuild');
    component.locationIdToUpdate = 'someLocationId';

    component.onSave();

    expect(component.locationIdToUpdate).toBeNull();
    expect(component.formBuild).toHaveBeenCalled();
  });

  it('should call getcountryList when ngOnInit is called', () => {
    spyOn(component, 'getcountryList');

    component.ngOnInit();

    expect(component.getcountryList).toHaveBeenCalled();
  });

  it('should call getLocation when ngOnInit is called', () => {
    spyOn(component, 'getLocation');

    component.ngOnInit();

    expect(component.getLocation).toHaveBeenCalled();
  });

  it('should call getPortDropDowns when ngOnInit is called', () => {
    spyOn(component, 'getPortDropDowns');

    component.ngOnInit();

    expect(component.getPortDropDowns).toHaveBeenCalled();
  });

  it('should call getAgent when ngOnInit is called', () => {
    spyOn(component, 'getAgent');

    component.ngOnInit();

    expect(component.getAgent).toHaveBeenCalled();
  });

  it('should not call commonService.deleteST when "no" is selected in delete modal', fakeAsync(() => {
    spyOn(component.commonService, 'deleteST');
    const mockDeleteLocation = 'mockDeleteLocation';
    const mockId = { locationId: 'mockId' };
    const mockModalResult = 'no';

    spyOn(component.modalService, 'open').and.returnValue({
      result: Promise.resolve(mockModalResult),
    } as any);

    component.delete(mockDeleteLocation, mockId);

    tick();

    expect(component.commonService.deleteST).not.toHaveBeenCalled();
  }));

  it('should call getPortDropDowns when ngOnInit is called', () => {
    spyOn(component, 'getPortDropDowns');

    component.ngOnInit();

    expect(component.getPortDropDowns).toHaveBeenCalled();
  });

  it('should call getAgent when ngOnInit is called', () => {
    spyOn(component, 'getAgent');

    component.ngOnInit();

    expect(component.getAgent).toHaveBeenCalled();
  });;

  it('should not call commonService.deleteST when "no" is selected in delete modal', fakeAsync(() => {
    spyOn(component.commonService, 'deleteST');
    const mockDeleteLocation = 'mockDeleteLocation';
    const mockId = { locationId: 'mockId' };
    const mockModalResult = 'no';

    spyOn(component.modalService, 'open').and.returnValue({
      result: Promise.resolve(mockModalResult),
    } as any);

    component.delete(mockDeleteLocation, mockId);

    tick();

    expect(component.commonService.deleteST).not.toHaveBeenCalled();
  }));


});
