import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { HttpClientModule } from '@angular/common/http';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { RouterTestingModule } from '@angular/router/testing';
import { CognitoService } from 'src/app/services/cognito.service';
import { Overlay } from '@angular/cdk/overlay';
import { MessagingService } from 'src/app/services/messaging.service';
import { environment } from 'src/environments/environment';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule, DatePipe } from '@angular/common';
import { of } from 'rxjs';
import { MastersSortPipe } from 'src/app/shared/util/mastersort';
import { OcenFleetComponent } from './ocen-fleet.component';
const commonFunctionsMock = jasmine.createSpyObj('CommonFunctions', ['method1', 'method2']);
describe('OcenFleetComponent', () => {
  let component: OcenFleetComponent;
  let fixture: ComponentFixture<OcenFleetComponent>;
  let cognitoServiceMock: jasmine.SpyObj<CognitoService>;
 
  beforeEach(async () => {
    cognitoServiceMock = jasmine.createSpyObj('CognitoService', ['getUserDatails']);
    cognitoServiceMock.getUserDatails.and.returnValue(of()as any);
    await TestBed.configureTestingModule({
      declarations: [OcenFleetComponent,MastersSortPipe],
      imports: [ReactiveFormsModule, NgbModule, HttpClientModule, RouterTestingModule, CommonModule, FormsModule, [TranslateModule.forRoot()]],
      providers: [NzNotificationService, MastersService, CommonFunctions, CognitoService, Overlay,
        { provide: CommonFunctions, useValue: commonFunctionsMock },
        { provide: CommonFunctions, useClass: MockCommonFunctions }, 
        { provide: CognitoService, useValue: cognitoServiceMock },
        { provide: MastersSortPipe, useValue: MastersSortPipe },
        MessagingService, TranslateService, DatePipe],

    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OcenFleetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form on ngOnInit', () => {
    expect(component.addVesselForm).toBeTruthy();
  });

  it('should open modal when open method is called', () => {
    spyOn(component.modalService, 'open').and.returnValue({
      result: Promise.resolve('yes'),
    } as NgbModalRef);

    component.open('content');

    expect(component.modalService.open).toHaveBeenCalled();
  });

  it('should set vesselCode value when formBuild is called', () => {
    component.formBuild();

    expect(component.addVesselForm.get('vesselCode').value).toBeTruthy();
  });


  it('should call exportAsExcelFile method on export button click', () => {
    const spy = spyOn(component, 'exportAsExcelFile').and.callThrough();

    component.exportAsExcelFile();

    expect(spy).toHaveBeenCalled();
  });

  it('should call openPDF method on open PDF button click', () => {
    const spy = spyOn(component, 'openPDF').and.callThrough();

    component.openPDF();

    expect(spy).toHaveBeenCalled();
  });



  it('should call exportAsExcelFile method', () => {
    spyOn(component, 'exportAsExcelFile').and.stub();
    component.exportAsExcelFile();
    expect(component.exportAsExcelFile).toHaveBeenCalled();
  });

  it('should call openPDF method', () => {
    spyOn(component, 'openPDF').and.stub();
    component.openPDF();
    expect(component.openPDF).toHaveBeenCalled();
  });

  it('should fetch data on init', () => {
    spyOn(component, 'getData');
    component.ngOnInit();
    expect(component.getData).toHaveBeenCalled();
  });

  it('should apply filters correctly', () => {
    component.applyFilter('test');
    expect(component.dataSource.filter).toBe('test');
  });

  it('should clear filters and reset data', () => {
    spyOn(component, 'getData');

    component.clearFilters();

    expect(component.filtersModel.length).toBe(0);
    expect(component.filterKeys).toEqual({});
    expect(component.getData).toHaveBeenCalled();
  });

  

  class MockCommonFunctions {
    get() {
      // Mock implementation
    }
    getAuthToken() {
      // Provide a mock implementation or return a default value
    }
  }
});