import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { DiscussionComponent } from './discussion.component';







@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('DiscussionComponent', () => {
  let component: DiscussionComponent;
  let fixture: ComponentFixture<DiscussionComponent>;
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
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList', 'UpdateToST']);

    TestBed.configureTestingModule({
      declarations: [DiscussionComponent, MockTranslatePipe],
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
    fixture = TestBed.createComponent(DiscussionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getBatchById on ngOnInit', () => {
    spyOn(component, 'getBatchById');
    component.ngOnInit();
    expect(component.getBatchById).toHaveBeenCalled();
  });
  
  it('should call router.navigate on onClose', () => {
    spyOn(component.router, 'navigate');
    component.onClose();
    expect(component.router.navigate).toHaveBeenCalledWith(['/batch/list']);
  });
  
  it('should set principalOptions on onPrincipalInput', () => {
    component.userList = [{ userId: '1', userEmail: 'user1@example.com' }, { userId: '2', userEmail: 'user2@example.com' } as any];
    const event = { target: { value: 'user1' } as any} as Event;
    component.onPrincipalInput(event);
    expect(component.principalOptions).toEqual([{ label: 'user1@example.com', value: component.userList[0] }]);
  });
  
  it('should not set principalOptions on onPrincipalInput with empty input', () => {
    component.userList = [{ userId: '1', userEmail: 'user1@example.com' }, { userId: '2', userEmail: 'user2@example.com' } as any];
    const event = { target: { value: '' } as any } as Event;
    component.onPrincipalInput(event);
    expect(component.principalOptions).toEqual([]);
  });
  
  it('should not set principalOptions on onPrincipalInput with no matching users', () => {
    component.userList = [{ userId: '1', userEmail: 'user1@example.com' }, { userId: '2', userEmail: 'user2@example.com' } as any];
    const event = { target: { value: 'user3' } as any} as Event;
    component.onPrincipalInput(event);
    expect(component.principalOptions).toEqual([]);
  });


  
  it('should set principalOptions to an empty array on onPrincipalInput with empty userList', () => {
    component.userList = [];
    const event = { target: { value: 'user1' } as any} as Event;
    component.onPrincipalInput(event);
    expect(component.principalOptions).toEqual([]);
  });
  
  it('should call router.navigate on onClose', () => {
    spyOn(component.router, 'navigate');
    component.onClose();
    expect(component.router.navigate).toHaveBeenCalledWith(['/batch/list']);
  });
  
  it('should not call getCommentsList on ngOnInit if getBatchById fails', fakeAsync(() => {
    spyOn(component, 'getBatchById').and.returnValue(throwError('Error')as any);
    spyOn(component, 'getCommentsList');
    component.ngOnInit();
    tick();
    expect(component.getCommentsList).not.toHaveBeenCalled();
  }));

  
 
  

  


 
 
});
