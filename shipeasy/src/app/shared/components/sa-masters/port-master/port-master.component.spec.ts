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
import { PortMasterComponent } from './port-master.component';
import { RouterTestingModule } from '@angular/router/testing';
import { Pipe, PipeTransform } from '@angular/core';
import { MastersSortPipe } from 'src/app/shared/util/mastersort';

@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('PortMasterComponent', () => {
  let component: PortMasterComponent;
  let fixture: ComponentFixture<PortMasterComponent>;

  // Mock services and dependencies
  const mockNgbModalRef: Partial<NgbModalRef> = {};
  const mockNgbModal = {
    open: jasmine.createSpy('open').and.returnValue(mockNgbModalRef),
  };
  const mockApiService = jasmine.createSpyObj('ApiService', ['getSTList', 'addToST', 'UpdateToST', 'deleteST']);
  const mockNotificationService = jasmine.createSpyObj('NzNotificationService', ['create']);
  const mockMastersService = jasmine.createSpyObj('MastersService', ['getSTList']);
  const mockProfilesService = jasmine.createSpyObj('ProfilesService', ['getUserDetails']);
  const mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails']);
  const mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList']);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PortMasterComponent, MockTranslatePipe,MastersSortPipe],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule],
      providers: [
        { provide: NgbModal, useValue: mockNgbModal },
        { provide: ApiService, useValue: mockApiService },
        { provide: NzNotificationService, useValue: mockNotificationService },
        { provide: MastersService, useValue: mockMastersService },
        { provide: ProfilesService, useValue: mockProfilesService },
        { provide: SaMasterService, useValue: {} },
        { provide: CognitoService, useValue: mockCognitoService },
        { provide: CommonService, useValue: mockCommonService },
        { provide: MastersSortPipe, useValue: MastersSortPipe },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PortMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form on ngOnInit', () => {
    component.ngOnInit();
    expect(component.locationForm).toBeDefined();
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

  it('should handle pagination data for previous page', () => {
    spyOn(component, 'getPaginationData');
    component.prev();
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should handle opening PDF', () => {
    spyOn(component, 'openPDF');
    component.openPDF();
    expect(component.openPDF).toHaveBeenCalled();
  });

  it('should export data to Excel', () => {
    spyOn(component, 'exportAsExcelFile').and.callThrough();
    component.exportAsExcelFile();
    expect(component.exportAsExcelFile).toHaveBeenCalled();
  });

  it('should call getPaginationData() with "next" on next()', () => {
    spyOn(component, 'getPaginationData');
    component.toalLength = 15;
    component.count = 10;

    component.next();

    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });

  it('should call getPaginationData() with "prev" on prev()', () => {
    spyOn(component, 'getPaginationData');
    component.page = 2;

    component.prev();

    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should not call getPaginationData on next if totalLength is equal to count', () => {
    component.toalLength = 10;
    component.count = 10;

    spyOn(component, 'getPaginationData');
    component.next();
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });

  it('should not call getPaginationData on next if totalLength is less than or equal to count', () => {
    component.toalLength = 10;
    component.count = 10;

    spyOn(component, 'getPaginationData');
    component.next();
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });

  it('should call getPaginationData with "next" on next if totalLength > count', () => {
    component.toalLength = 15;
    component.count = 10;

    spyOn(component, 'getPaginationData');
    component.next();
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });

  it('should not call getPaginationData on next if totalLength <= count', () => {
    component.toalLength = 10;
    component.count = 10;

    spyOn(component, 'getPaginationData');
    component.next();
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });

  it('should initialize component', () => {
    expect(() => component.ngOnInit()).not.toThrow();
  });

  it('next should not call getPaginationData when toalLength is equal to count', () => {
    spyOn(component, 'getPaginationData');
    component.toalLength = 5;
    component.count = 5;
    component.next();
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });

  it('next should not increment page when toalLength is less than or equal to count', () => {
    spyOn(component, 'getPaginationData');
    component.toalLength = 5;
    component.count = 5;
    component.next();
    expect(component.getPaginationData).not.toHaveBeenCalled();
    expect(component.page).toEqual(1);
  });
 


});
