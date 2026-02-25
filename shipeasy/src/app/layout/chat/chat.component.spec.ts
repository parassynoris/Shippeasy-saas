import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { of, throwError } from 'rxjs';
import { ApiService } from 'src/app/admin/principal/api.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessagingService } from 'src/app/services/messaging.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
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
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { ChatComponent } from './chat.component';

@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {

  constructor(private currencyPipe: CurrencyPipe) { }
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;
  let translateServiceStub: Partial<TranslateService>;
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
    mockApiService = jasmine.createSpyObj('ApiService', ['getSTList', 'addToST', 'UpdateToST', 'deleteST']);
    mockNotificationService = jasmine.createSpyObj('NzNotificationService', ['create']);
    mockMastersService = jasmine.createSpyObj('MastersService', ['getSTList']);
    mockProfilesService = jasmine.createSpyObj('ProfilesService', ['getUserDetails', 'countryList']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails', 'getagentDetails',]);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList', 'UpdateToST', 'getSTList1']);
    mockApiService = jasmine.createSpyObj('ApiService', ['getListByURL']);
    mockApiService = jasmine.createSpyObj('MessagingService', ['getuseronlineOfflinestatus', 'getMesageNotification']);
    TestBed.configureTestingModule({
      declarations: [ChatComponent, MockTranslatePipe],
      imports: [BrowserDynamicTestingModule, ReactiveFormsModule, SharedModule, NzSelectModule, NzDatePickerModule, RouterTestingModule, BrowserAnimationsModule, HttpClientModule, TranslateModule.forRoot(), ],
      providers: [DatePipe, OrderByPipe, CurrencyPipe,
        { provide: NgbModal, useValue: mockNgbModal },
        { provide: MessagingService, useValue: mockMessagingService },
        { provide: ApiService, useValue: mockApiService },
        { provide: NzNotificationService, useValue: mockNotificationService },
        { provide: TransactionService, useValue: translateServiceStub },
        { provide: MastersService, useValue: mockMastersService },
        { provide: ProfilesService, useValue: mockProfilesService },
        { provide: SaMasterService, useValue: {} },
        { provide: CognitoService, useValue: mockCognitoService },
        { provide: CommonService, useValue: mockCommonService }
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should fetch user list on initialization', () => {
    spyOn(component, 'getUserList');
    component.ngOnInit();
    expect(component.getUserList).toHaveBeenCalled();
  });

  it('should call scrollToBottom after view check', () => {
    spyOn(component, 'scrollToBottom');
    component.ngAfterViewChecked();
    expect(component.scrollToBottom).toHaveBeenCalled();
  });

  it('should open a group chat', () => {
    component.openGroupChat();
    expect(component.isGroupChatOpen).toBeTrue();
    expect(component.isNewChatOpen).toBeFalse();
  });

  it('should open a new chat', () => {
    component.openNewChat();
    expect(component.isNewChatOpen).toBeTrue();
    expect(component.isGroupChatOpen).toBeFalse();
  });

  it('should clear active contact', () => {
    component.activeContact = { name: 'John' };
    component.selectedChat = { contact: { name: 'John' }, messages: [] };
    component.clearActiveContact();
    expect(component.activeContact).toBeNull();
    expect(component.selectedChat).toBeNull();
    expect(component.isGroupChatOpen).toBeFalse();
    expect(component.isNewChatOpen).toBeFalse();
  });

  it('should filter user list on search', () => {
    component.userData = [{ name: 'Alice' }, { name: 'Bob' }];
    const event = { target: { value: 'ali' } } as unknown as Event;

    component.onSearch(event);

    expect(component.userdetails.length).toBe(1);
    expect(component.userdetails[0].name).toBe('Alice');
  });
});