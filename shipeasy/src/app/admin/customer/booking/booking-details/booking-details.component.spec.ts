import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingDetailsComponent } from './booking-details.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { CognitoService } from 'src/app/services/cognito.service';
import { CommonService } from 'src/app/services/common/common.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { of } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'customCurrency' })
class MockCustomCurrencyPipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    return value; // Simply return the value for testing
  }
}

describe('BookingDetailsComponent', () => {
  let component: BookingDetailsComponent;
  let fixture: ComponentFixture<BookingDetailsComponent>;
  let cognitoServiceStub: Partial<CognitoService>;
  let commonServiceStub: Partial<CommonService>;
  let activatedRouteStub: Partial<ActivatedRoute>;
  let notificationServiceStub: Partial<NzNotificationService>;
  let routerStub: Partial<Router>;
  let modalServiceStub: Partial<NgbModal>;
  let commonFunctionsStub: Partial<CommonFunctions>;

  beforeEach(async () => {
    cognitoServiceStub = {
      getagentDetails: () => ({ id: 1, name: 'Agent' } as any)
    };

    commonServiceStub = {
      filterList: () => ({ query: {} } as any),
      getSTList: (type: string, payload: any) => of({ documents: [{ id: 1, quotationId: 1 }] }),
      UpdateToST: (url: string, payload: any) => of({ success: true })
    };

    activatedRouteStub = {
      snapshot: {
        params: { id: 1 },
        url: [],
        queryParams: {},
        fragment: '',
        data: {},
        outlet: '',
        component: '',
        routeConfig: undefined,
        root: new ActivatedRouteSnapshot,
        parent: new ActivatedRouteSnapshot,
        firstChild: new ActivatedRouteSnapshot,
        children: [],
        pathFromRoot: [],
        paramMap: undefined,
        queryParamMap: undefined
      }
    };

    notificationServiceStub = {
      create: jasmine.createSpy('create')
    };

    routerStub = {
      navigate: jasmine.createSpy('navigate')
    };

    modalServiceStub = {
      open: jasmine.createSpy('open')
    };

    commonFunctionsStub = {
      customerAgent: () => ({ agentId: 1, agentName: 'Agent' }),
      getAgentCur (){},
      customerCurrency (){}
    };

    await TestBed.configureTestingModule({
      declarations: [BookingDetailsComponent,MockCustomCurrencyPipe],
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        { provide: CognitoService, useValue: cognitoServiceStub },
        { provide: CommonService, useValue: commonServiceStub },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: NzNotificationService, useValue: notificationServiceStub },
        { provide: Router, useValue: routerStub },
        { provide: NgbModal, useValue: modalServiceStub },
        { provide: CommonFunctions, useValue: commonFunctionsStub }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BookingDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize user data and batchId on init', () => {
    component.ngOnInit();
    expect(component.userData).toEqual({ id: 1, name: 'Agent' });
    expect(component.batchId).toBe(1);
  });

  it('should call getData on init', () => {
    spyOn(component, 'getData');
    component.ngOnInit();
    expect(component.getData).toHaveBeenCalled();
  });

  it('should update booking remarks', () => {
    const event = { target: { value: 'Test remark' } };
    component.setBookingRemarks(event);
    expect(component.bookingRemarks).toBe('Test remark');
  });

  it('should return total final amount', () => {
    component.chargeItems = [{ selEstimates: { totalAmount: 100 } }, { selEstimates: { totalAmount: 200 } }];
    expect(component.returnTotalFinal()).toBe(300);
  });

  it('should return total taxable amount', () => {
    component.chargeItems = [{ selEstimates: { taxableAmount: 50 } }, { selEstimates: { taxableAmount: 150 } }];
    expect(component.returnTotal()).toBe(200);
  });

  it('should return total GST', () => {
    component.chargeItems = [{ selEstimates: { igst: 10 } }, { selEstimates: { igst: 20 } }];
    expect(component.rturnGst()).toBe(30);
  });

  it('should navigate to booking list on batch cancel', () => {
    component.userActivities = { batchId: 1 };
    component.bookingRemarks = 'Test remark';
    component.batchCancel();
    expect(notificationServiceStub.create).toHaveBeenCalledWith('success', 'Job Cancelled Successfully', '');
    expect(routerStub.navigate).toHaveBeenCalledWith(['/customer/booking/list']);
  });

  it('should open modal for map with valid MMSI', () => {
    const content = {};
    const id = 1;
    const mockResponse = { documents: [{ mmsino: '12345', vesselName: 'Vessel' }] };
    spyOn(commonServiceStub, 'getSTList').and.returnValue(of(mockResponse));
    component.onenMap(content, id);
    expect(modalServiceStub.open).toHaveBeenCalledWith(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg'
    });
  });

  it('should notify if MMSI is not available', () => {
    const content = {};
    const id = 1;
    const mockResponse = { documents: [{ vesselName: 'Vessel' }] };
    spyOn(commonServiceStub, 'getSTList').and.returnValue(of(mockResponse));
    component.onenMap(content, id);
    expect(notificationServiceStub.create).toHaveBeenCalledWith('error', 'Tracking Id Not Available, Please Update MMSI In Vessel', '');
    expect(modalServiceStub.open).not.toHaveBeenCalled();
  });
});
