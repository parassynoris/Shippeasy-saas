import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { Pipe, PipeTransform } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import * as XLSX from "xlsx";
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common'; import { OrderByPipe } from 'src/app/shared/util/sort';
import { BLComponent } from './bl.component';
import { Router } from '@angular/router';


@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('BLComponent', () => {
  let component: BLComponent;
  let fixture: ComponentFixture<BLComponent>;
  let mockNgbModal: jasmine.SpyObj<NgbModal>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockNotificationService: jasmine.SpyObj<NzNotificationService>;
  let mockMastersService: jasmine.SpyObj<MastersService>;
  let mockProfilesService: jasmine.SpyObj<ProfilesService>;
  let mockCognitoService: jasmine.SpyObj<CognitoService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let modalService: NgbModal;
  let router: Router;

  beforeEach(waitForAsync(() => {
    mockNgbModal = jasmine.createSpyObj('NgbModal', ['open']);
    mockApiService = jasmine.createSpyObj('ApiService', ['getSTList', 'addToST', 'UpdateToST', 'deleteST']);
    mockNotificationService = jasmine.createSpyObj('NzNotificationService', ['create']);
    mockMastersService = jasmine.createSpyObj('MastersService', ['getSTList']);
    mockProfilesService = jasmine.createSpyObj('ProfilesService', ['getUserDetails']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails', 'getagentDetails']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList', 'UpdateToST']);

    TestBed.configureTestingModule({
      declarations: [BLComponent, MockTranslatePipe],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule, HttpClientModule],
      providers: [DatePipe, OrderByPipe,
        { provide: NgbModal, useValue: mockNgbModal },
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
    fixture = TestBed.createComponent(BLComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.stub();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to the correct URL when onOpenNew is called', () => {
    component.urlParam = { id: 'your-id', key: 'your-key' };  // Update with actual values
    component.onOpenNew();
    expect(router.navigate).toHaveBeenCalledWith(['/batch/list/add/your-id/your-key/add']);
  });
 
  it('should navigate to the correct URL when onOpenEdit is called', () => {
    const containerId = 'your-container-id';  // Update with the actual container ID
    component.urlParam = { id: 'your-id', key: 'your-key' };  // Update with actual values
    component.onOpenEdit(containerId);
    expect(router.navigate).toHaveBeenCalledWith(['/batch/list/add/your-id/your-key/' + containerId + '/edit']);
  });

  it('should navigate to the correct URL when onBillAction is called', () => {
    component.urlParam = { id: 'your-id', key: 'your-key' };  
    component.onBillAction();
    expect(router.navigate).toHaveBeenCalledWith(['/batch/list/add/your-id/your-key']);
  });

 
  
});
