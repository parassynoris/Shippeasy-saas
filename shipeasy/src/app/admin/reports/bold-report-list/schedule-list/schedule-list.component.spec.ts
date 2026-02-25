import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ApiService } from 'src/app/admin/principal/api.service';
import { CommonService } from 'src/app/services/common/common.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Pipe, PipeTransform } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { MastersSortPipe } from 'src/app/shared/util/mastersort';
import { RouterModule } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ScheduleListComponent } from './schedule-list.component';
import { Operator, Observable, Subscriber, TeardownLogic } from 'rxjs';

@Pipe({ name: 'translate' })
class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    return value;
  }
}

describe('ScheduleListComponent', () => {
  let component: ScheduleListComponent;
  let fixture: ComponentFixture<ScheduleListComponent>;
  let mockModal: jasmine.SpyObj<NgbModal>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockNotificationService: jasmine.SpyObj<NzNotificationService>;

  beforeEach(waitForAsync(() => {
    mockModal = jasmine.createSpyObj('NgbModal', ['open']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList', 'UpdateToST']);
    mockNotificationService = jasmine.createSpyObj('NzNotificationService', ['create']);

    TestBed.configureTestingModule({
      declarations: [
        ScheduleListComponent,
        MockTranslatePipe,
        MastersSortPipe,
      ],
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
        BrowserAnimationsModule,
      ],
      providers: [
        DatePipe,
        OrderByPipe,
        MastersSortPipe,
        { provide: NgbModal, useValue: mockModal },
        { provide: CommonService, useValue: mockCommonService },
        { provide: NzNotificationService, useValue: mockNotificationService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch data on initialization', () => {
    mockCommonService.getSTList.and.returnValue({
      subscribe: (callback) => callback({ documents: [] }),
      _isScalar: false,
      source: undefined,
      operator: undefined,
      lift: function <R>(operator: Operator<any, R>): Observable<R> {
        throw new Error('Function not implemented.');
      },
      _trySubscribe: function (sink: Subscriber<any>): TeardownLogic {
        throw new Error('Function not implemented.');
      },
      forEach: function (next: (value: any) => void, promiseCtor?: PromiseConstructorLike): Promise<void> {
        throw new Error('Function not implemented.');
      },
      _subscribe: function (subscriber: Subscriber<any>): TeardownLogic {
        throw new Error('Function not implemented.');
      },
      pipe: function (): Observable<any> {
        throw new Error('Function not implemented.');
      },
      toPromise: function <T>(this: Observable<T>): Promise<T> {
        throw new Error('Function not implemented.');
      }
    });
    component.ngOnInit();
    expect(mockCommonService.getSTList).toHaveBeenCalled();
  });

  it('should apply filters correctly', () => {
    component.dataSource.data = [{ customerName: 'John Doe' }];
    component.applyFilter('john');
    expect(component.dataSource.filter).toBe('john');
  });

  it('should toggle status on update', () => {
    const mockElement = { schedulereportId: 1, status: true };
    mockCommonService.UpdateToST.and.returnValue({
      subscribe: (callback) => callback({}),
      _isScalar: false,
      source: undefined,
      operator: undefined,
      lift: function <R>(operator: Operator<any, R>): Observable<R> {
        throw new Error('Function not implemented.');
      },
      _trySubscribe: function (sink: Subscriber<any>): TeardownLogic {
        throw new Error('Function not implemented.');
      },
      forEach: function (next: (value: any) => void, promiseCtor?: PromiseConstructorLike): Promise<void> {
        throw new Error('Function not implemented.');
      },
      _subscribe: function (subscriber: Subscriber<any>): TeardownLogic {
        throw new Error('Function not implemented.');
      },
      pipe: function (): Observable<any> {
        throw new Error('Function not implemented.');
      },
      toPromise: function <T>(this: Observable<T>): Promise<T> {
        throw new Error('Function not implemented.');
      }
    });
    component.onUpdate(null, mockElement);
    expect(mockCommonService.UpdateToST).toHaveBeenCalled();
  });

  it('should call getData on initialization', () => {
    spyOn(component, 'getData');
    component.ngOnInit();
    expect(component.getData).toHaveBeenCalled();
  });

  it('should filter data correctly', () => {
    component.dataSource.data = [
      { customerName: 'Test Customer' },
      { customerName: 'Another Customer' }
    ];
    component.applyFilter('Test');
    expect(component.dataSource.filteredData.length).toBe(1);
  });

  it('should update status when onUpdate is called', () => {
    const mockElement = { schedulereportId: 1, status: true };
    mockCommonService.UpdateToST.and.returnValue({
      subscribe: (cb) => cb(true),
      _isScalar: false,
      source: undefined,
      operator: undefined,
      lift: function <R>(operator: Operator<any, R>): Observable<R> {
        throw new Error('Function not implemented.');
      },
      _trySubscribe: function (sink: Subscriber<any>): TeardownLogic {
        throw new Error('Function not implemented.');
      },
      forEach: function (next: (value: any) => void, promiseCtor?: PromiseConstructorLike): Promise<void> {
        throw new Error('Function not implemented.');
      },
      _subscribe: function (subscriber: Subscriber<any>): TeardownLogic {
        throw new Error('Function not implemented.');
      },
      pipe: function (): Observable<any> {
        throw new Error('Function not implemented.');
      },
      toPromise: function <T>(this: Observable<T>): Promise<T> {
        throw new Error('Function not implemented.');
      }
    });
    component.onUpdate(null, mockElement);
    expect(mockNotificationService.create).toHaveBeenCalledWith('success', 'Updated Successfully', '');
  });
});