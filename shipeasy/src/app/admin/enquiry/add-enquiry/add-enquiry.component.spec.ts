import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ApiService } from 'src/app/admin/principal/api.service';
import { CommonService } from 'src/app/services/common/common.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { RouterModule } from '@angular/router';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of} from 'rxjs';
import { MessagingService } from 'src/app/services/messaging.service';
import { environment } from 'src/environments/environment';
import {  TranslateCompiler, TranslateLoader, TranslateParser, TranslateService, TranslateStore, USE_DEFAULT_LANG } from '@ngx-translate/core';
import { TransactionService } from 'src/app/services/transaction/transaction.service';

import {  Pipe, PipeTransform } from '@angular/core';
import { AddEnquiryComponent } from './add-enquiry.component';

@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('AddEnquiryComponent', () => {
  let component: AddEnquiryComponent;
  let fixture: ComponentFixture<AddEnquiryComponent>;
  let mockNgbModal: jasmine.SpyObj<NgbModal>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockNotificationService: jasmine.SpyObj<NzNotificationService>;
  let mockMastersService: jasmine.SpyObj<MastersService>;
  let mockProfilesService: jasmine.SpyObj<ProfilesService>;
  let mockCognitoService: jasmine.SpyObj<CognitoService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockmessagingService: jasmine.SpyObj<MessagingService>;
  let translateServiceStub: Partial<TranslateService>;

  beforeEach(waitForAsync(() => {
    translateServiceStub = {
      get: (key: string) => of(key),
      instant: jasmine.createSpy('instant').and.returnValue('translated text')
    };


    TestBed.configureTestingModule({
      declarations: [AddEnquiryComponent, MockTranslatePipe],
      imports: [
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        MatAutocompleteModule,
        NzSelectModule,
        NzDatePickerModule,
        RouterTestingModule,
        HttpClientModule,
        RouterModule,
        BrowserAnimationsModule
      ],
      providers: [
        DatePipe,
        OrderByPipe,
        { provide: TranslateService, useValue: translateServiceStub },
        { provide: TranslateStore, useValue: {} },
        { provide: TranslateLoader, useValue: {} },
        { provide: TranslateParser, useValue: {} },
        { provide: TranslateCompiler, useValue: {} },
        { provide: USE_DEFAULT_LANG, useValue: 'en' },
        { provide: ApiService, useValue: mockApiService },
        { provide: MessagingService, useValue: mockmessagingService },
        { provide: NzNotificationService, useValue: mockNotificationService },
        { provide: MastersService, useValue: mockMastersService },
        { provide: ProfilesService, useValue: mockProfilesService },
        { provide: SaMasterService, useValue: {} },
        { provide: TransactionService, useValue: translateServiceStub },
        { provide: CognitoService, useValue: mockCognitoService },
        { provide: CommonService, useValue: mockCommonService }
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEnquiryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });




});
