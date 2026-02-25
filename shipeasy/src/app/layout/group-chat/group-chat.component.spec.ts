import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ApiService } from 'src/app/admin/principal/api.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessagingService } from 'src/app/services/messaging.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Pipe, PipeTransform } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonService } from 'src/app/services/common/common.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { GroupChatComponent } from './group-chat.component';
import { of, throwError } from 'rxjs';

@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    return value;
  }
}

describe('GroupChatComponent', () => {
  let component: GroupChatComponent;
  let fixture: ComponentFixture<GroupChatComponent>;

  let mockNgbModal: jasmine.SpyObj<NgbModal>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockNotificationService: jasmine.SpyObj<NzNotificationService>;
  let mockMastersService: jasmine.SpyObj<MastersService>;
  let mockProfilesService: jasmine.SpyObj<ProfilesService>;
  let mockCognitoService: jasmine.SpyObj<CognitoService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockMessagingService: jasmine.SpyObj<MessagingService>;

  beforeEach(waitForAsync(() => {
    mockNgbModal = jasmine.createSpyObj('NgbModal', ['open']);
    mockApiService = jasmine.createSpyObj('ApiService', ['getSTList']);
    mockNotificationService = jasmine.createSpyObj('NzNotificationService', ['error', 'success']);
    mockMastersService = jasmine.createSpyObj('MastersService', ['getSTList']);
    mockProfilesService = jasmine.createSpyObj('ProfilesService', ['getUserDetails']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList', 'createGroup']);
    mockMessagingService = jasmine.createSpyObj('MessagingService', ['getuseronlineOfflinestatus']);

    TestBed.configureTestingModule({
      declarations: [GroupChatComponent, MockTranslatePipe],
      imports: [
        BrowserDynamicTestingModule,
        ReactiveFormsModule,
        SharedModule,
        NzSelectModule,
        NzDatePickerModule,
        RouterTestingModule,
        BrowserAnimationsModule,
        HttpClientModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        DatePipe,
        OrderByPipe,
        CurrencyPipe,
        { provide: NgbModal, useValue: mockNgbModal },
        { provide: MessagingService, useValue: mockMessagingService },
        { provide: ApiService, useValue: mockApiService },
        { provide: NzNotificationService, useValue: mockNotificationService },
        { provide: MastersService, useValue: mockMastersService },
        { provide: ProfilesService, useValue: mockProfilesService },
        { provide: CognitoService, useValue: mockCognitoService },
        { provide: CommonService, useValue: mockCommonService }
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should emit back button click event', () => {
    spyOn(component.backButtonClicked, 'emit');
    component.onBackClick();
    expect(component.backButtonClicked.emit).toHaveBeenCalled();
  });

  it('should filter `userData` based on search input', () => {
    component.userdetails = [
      { userId: '1', name: 'John Doe' },
      { userId: '2', name: 'Jane Doe' },
    ];
    const event = { target: { value: 'john' } } as any;
    component.onSearch(event);
    expect(component.userData).toEqual([{ userId: '1', name: 'John Doe' }]);
  });

  it('should notify error if channel name is missing in `invokeCreateChannel`', () => {
    component.channelName = '';
    component.invokeCreateChannel();
    expect(mockNotificationService.error).toHaveBeenCalledWith('Error', 'Channel name is required');
  });

  it('should notify error if no users are selected in `invokeCreateChannel`', () => {
    component.channelName = 'New Channel';
    component.selectedUsers = [];
    component.invokeCreateChannel();
    expect(mockNotificationService.error).toHaveBeenCalledWith('Error', 'Please select at least one user to create a channel');
  });

  it('should add selected user and remove from userData', () => {
    component.userData = [{ userId: 'user1' }, { userId: 'user2' }];
    component.onUserSelect({ userId: 'user1' });
    expect(component.selectedUsers.length).toBe(1);
    expect(component.userData.length).toBe(1);
  });

  it('should set `viewStepper` to true when `onCreateGroupClick` is called', () => {
    component.onCreateGroupClick();
    expect(component.viewStepper).toBeTrue();
  });

});
