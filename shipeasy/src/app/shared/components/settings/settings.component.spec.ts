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
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { MastersSortPipe } from '../../util/mastersort';
import { SharedModule } from '../../shared.module';
import { SettingsComponent } from './settings.component';
import { OrderByPipe } from '../../util/sort';
@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

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
      declarations: [SettingsComponent, MockTranslatePipe,MastersSortPipe],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule],
      providers: [
        OrderByPipe,
        { provide: NgbModal, useValue: mockNgbModal },
        { provide: ApiService, useValue: mockApiService },
        { provide: NzNotificationService, useValue: mockNotificationService },
        { provide: MastersService, useValue: mockMastersService },
        { provide: ProfilesService, useValue: mockProfilesService },
        { provide: SaMasterService, useValue: {} },
        { provide: CognitoService, useValue: mockCognitoService },
        { provide: CommonService, useValue: mockCommonService },
        {provide:MastersSortPipe, useValue:MastersSortPipe},
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize component properly', () => {
    expect(component.userDetails).toBeDefined();
    expect(component.groupedSequence).toBeDefined();
    expect(component.sequenceConfiguration).toBeDefined();
    expect(component.updatedTriggers).toBeDefined();
    expect(component.MasterNotificationId).toEqual('');
    expect(component.selection).toBeDefined();
    expect(component.dataSource).toBeDefined();
    expect(component.tableForm).toBeDefined();
    expect(component.activeTab).toEqual('');
    expect(component.isSubmitted).toBeFalsy();
  }); 

  it('should handle selected notification master', () => {
    const subElement = { triggerId: '123', emailname: 'Test', groupby: 'TestGroup' };
    component.selectedNotificationMaster(subElement, 'TestGroup', 0, subElement);
    expect(component.selectedTrigger).toEqual(subElement);
    expect(component.selectedSequence).toEqual(0);
    expect(component.existingNotificationMasterDetails).toBeNull();
    expect(component.MasterNotificationId).toEqual('');
    expect(component.selection).toBeDefined();
  });

  it('should initialize component properly', () => {
    // Test initialization of various properties and variables
    expect(component.userData).toBeDefined();
    expect(component.defaultNoticationData).toBeDefined();
    // Add more expectations as needed
  });

  it('should handle save action', () => {
    spyOn(component, 'updatePayload').and.returnValue([]);
    spyOn(component, 'notificationMasterDetails');
    component.save();
  });

  it('should update payload correctly', () => {
    const settings = [{ type: 'testType' }];
    const payload = component.updatePayload(settings);
    expect(payload.length).toEqual(1);
  });
  it('should handle selected notification master', () => {
    // Test the selectedNotificationMaster() method
    component.selectedNotificationMaster({}, 'category', 0, {});
   
  });

  it('should handle save action', () => {
    // Test the save() method
    component.save();
   
  });

  it('should update payload correctly', () => {
    // Test the updatePayload() method
    const settings = [];
    const result = component.updatePayload(settings);
    expect(result).toBeDefined();
   
  });

  it('should toggle master selection', () => {
    // Test the masterToggle() method
    component.masterToggle();
   
  });

  it('should check if all rows are selected', () => {
    // Test the isAllSelected() method
    const result = component.isAllSelected();
    expect(result).toBe(true); // Assuming all rows are selected
 
  });

  it('should check if entire page is selected', () => {
 
    const result = component.isEntirePageSelected();
    expect(result).toBe(true); // Assuming entire page is selected

  });

  it('should change select value', () => {

    component.changeselct({ value: {} }as any);
   
  });

  it('should reset form controls', () => {
  
    component.resetFormControls();
   
  });   

  it('should change notify', () => {

    component.changeNotify({ checked: true }, 'data');
   
  });



  it('should handle ngOninit', () => {
  
    component.ngOnInit();
   
  });

 
});
