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
import { ShippingLineMasterComponent } from './shipping-line-master.component';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import { MastersSortPipe } from '../../util/mastersort';
@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('ShippingLineMasterComponent', () => {
  let component: ShippingLineMasterComponent;
  let fixture: ComponentFixture<ShippingLineMasterComponent>;

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
      declarations: [ShippingLineMasterComponent, MockTranslatePipe, MastersSortPipe],
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
    fixture = TestBed.createComponent(ShippingLineMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getShiipingLine on ngOnInit', () => {
    spyOn(component, 'getShiipingLine');
    component.ngOnInit();
    expect(component.getShiipingLine).toHaveBeenCalled();
  });

  it('should call getShiipingLine on filter', () => {
    spyOn(component, 'getShiipingLine');
    component.filter({ target: { value: 10 } });
    expect(component.getShiipingLine).toHaveBeenCalled();
  });

  it('should call getPaginationData on prev', () => {
    spyOn(component, 'getPaginationData');
    component.prev();
    expect(component.getPaginationData).toHaveBeenCalled();
  });

  it('should call clear', () => {
    spyOn(component, 'getShiipingLine');
    component.clear();
    expect(component.getShiipingLine).toHaveBeenCalled();
  });

  it('should open modal', () => {
    spyOn(component, 'getShiipingLine');
    mockNgbModalRef.result = Promise.resolve('yes');
    component.open({}, {} as any);
    expect(mockNgbModal.open).toHaveBeenCalled();
  });

  it('should open modal with show', () => {
    spyOn(component, 'getShiipingLine');
    mockNgbModalRef.result = Promise.resolve('yes');
    component.open({}, {} as any, 'show');
    expect(component.shippingLineForm.disabled).toBeTrue();
  });

  it('should call clear and reset form values', () => {
    spyOn(component, 'getShiipingLine');
    component.name = 'Test Name';
    component.clear();
    expect(component.getShiipingLine).toHaveBeenCalled();
    expect(component.name).toEqual('');
    expect(component.country).toEqual('');
    // ... (check other form properties)
  });

  it('should handle clear and reset form values', () => {
    spyOn(component, 'getShiipingLine');
    component.name = 'Test Name';
    component.clear();
    expect(component.getShiipingLine).toHaveBeenCalled();
    expect(component.name).toEqual('');
    expect(component.country).toEqual('');
    // ... (check other form properties)
  });

  it('should handle next and call getPaginationData with type next', () => {
    spyOn(component, 'getPaginationData');
    component.toalLength = 15;
    component.count = 10;
    component.next();
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });

  it('should handle next and not call getPaginationData when count equals toalLength', () => {
    spyOn(component, 'getPaginationData');
    component.toalLength = 10;
    component.count = 10;
    component.next();
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });

  it('should handle prev and call getPaginationData with type prev', () => {
    spyOn(component, 'getPaginationData');
    component.page = 2;
    component.prev();
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should handle prev and not call getPaginationData when page is 0', () => {
    spyOn(component, 'getPaginationData');
    component.page = 0;
    component.prev();
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });

  it('should handle filter and call getShiipingLine', () => {
    spyOn(component, 'getShiipingLine');
    const event = { target: { value: 20 } };
    component.filter(event);
    expect(component.size).toBe(20);
    expect(component.fromSize).toBe(1);
    expect(component.getShiipingLine).toHaveBeenCalled();
  });


  it('should handle next and call getPaginationData with proper type', () => {
    spyOn(component, 'getPaginationData');
    component.toalLength = 15;
    component.count = 10;
    component.next();
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });

  it('should handle next with toalLength equal to count and not call getPaginationData', () => {
    spyOn(component, 'getPaginationData');
    component.toalLength = 10;
    component.count = 10;
    component.next();
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });

  it('should handle prev and call getPaginationData with proper type', () => {
    spyOn(component, 'getPaginationData');
    component.page = 2;
    component.prev();
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should handle prev with page equal to 0 and not call getPaginationData', () => {
    spyOn(component, 'getPaginationData');
    component.page = 0;
    component.prev();
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });

  it('should handle filter and call getShiipingLine', () => {
    spyOn(component, 'getShiipingLine');
    const event = { target: { value: 20 } };
    component.filter(event);
    expect(component.size).toEqual(20);
    expect(component.fromSize).toEqual(1);
    expect(component.getShiipingLine).toHaveBeenCalled();
  });



  it('should handle prev with page less than or equal to 0 and not call getPaginationData', () => {
    spyOn(component, 'getPaginationData');
    component.page = 0;
    component.prev();
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });

  it('should handle prev with valid page and call getPaginationData with proper type', () => {
    spyOn(component, 'getPaginationData');
    component.page = 2;
    component.prev();
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should handle next with totalCount greater than count and call getPaginationData with proper type', () => {
    spyOn(component, 'getPaginationData');
    component.toalLength = 15;
    component.count = 10;
    component.next();
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });

  it('should handle next with totalCount equal to count and not call getPaginationData', () => {
    spyOn(component, 'getPaginationData');
    component.toalLength = 10;
    component.count = 10;
    component.next();
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });

});


