import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BookingTrackingComponent } from './booking-tracking.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CognitoService } from 'src/app/services/cognito.service';
import { CommonService } from 'src/app/services/common/common.service';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

describe('BookingTrackingComponent', () => {
  let component: BookingTrackingComponent;
  let fixture: ComponentFixture<BookingTrackingComponent>;
  let cognitoService: jasmine.SpyObj<CognitoService>;
  let commonService: jasmine.SpyObj<CommonService>;
  let notificationService: jasmine.SpyObj<NzNotificationService>;

  beforeEach(async () => {
    const cognitoSpy = jasmine.createSpyObj('CognitoService', ['getUserDatails', 'getagentDetails']);
    const commonSpy = jasmine.createSpyObj('CommonService', ['getSTList', 'filterList']);
    const notificationSpy = jasmine.createSpyObj('NzNotificationService', ['create']);

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule
      ],
      declarations: [BookingTrackingComponent],
      providers: [
        { provide: CognitoService, useValue: cognitoSpy },
        { provide: CommonService, useValue: commonSpy },
        { provide: NzNotificationService, useValue: notificationSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: { id: 123 } }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookingTrackingComponent);
    component = fixture.componentInstance;
    cognitoService = TestBed.inject(CognitoService) as jasmine.SpyObj<CognitoService>;
    commonService = TestBed.inject(CommonService) as jasmine.SpyObj<CommonService>;
    notificationService = TestBed.inject(NzNotificationService) as jasmine.SpyObj<NzNotificationService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch vehicle list based on login type', fakeAsync(() => {
    const mockVehicleData = { documents: [{ vehicleId: 1, name: 'Truck' }] };
    cognitoService.getUserDatails.and.returnValue(new BehaviorSubject({ driverId: 100 }));
    commonService.getSTList.and.returnValue(of(mockVehicleData));

    component.getVehicle();
    tick();

    expect(component.vehicleList.length).toBe(1);
  }));

  it('should toggle driver panel', () => {
    component.isDriverPanelOpen = true;
    component.toggleButton('route');
    expect(component.isDriverPanelOpen).toBeFalse();

    component.toggleButton('route');
    expect(component.isDriverPanelOpen).toBeTrue();
  });

  it('should toggle milestone panel', () => {
    component.isMilestonePanelOpen = true;
    component.toggleButton('customRoute');
    expect(component.isMilestonePanelOpen).toBeFalse();
  });

  it('should update data source when fetching milestones', fakeAsync(() => {
    const mockMilestoneData = {
      documents: [{ milestoneEvent: 'Pickup', milestoneDate: '2024-02-01' }]
    };
    commonService.getSTList.and.returnValue(of(mockMilestoneData));

    component.getMilstone();
    tick();

    expect(component.dataSource1.data.length).toBe(1);
  }));

});
