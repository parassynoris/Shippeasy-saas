import { ComponentFixture, TestBed, fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { of, throwError } from 'rxjs';
import { NgbModal, NgbModalModule, NgbActiveModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { LoaderService } from 'src/app/services/loader.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import * as XLSX from 'xlsx';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { ConsolidationBookingComponent } from './consolidation-booking.component';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { PaginatePipe, PaginationService } from 'ngx-pagination';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/services/common/common.service';

@Pipe({ name: 'orderBy' })
class MockOrderByPipe implements PipeTransform {
  transform(value: any[], key: string): any[] {
    return value; // Mock implementation: return the input array without sorting
  }
}

describe('ConsolidationBookingComponent', () => {
  let component: ConsolidationBookingComponent;
  let fixture: ComponentFixture<ConsolidationBookingComponent>;
  let commonService: jasmine.SpyObj<CommonService>;
  let loaderService: LoaderService;
  let modalService: jasmine.SpyObj<NgbModal>;
  let notificationService: jasmine.SpyObj<NzNotificationService>;

  beforeEach(async () => {
    const commonServiceSpy = jasmine.createSpyObj('CommonService', ['getSTList', 'filterList']);
    const modalServiceSpy = jasmine.createSpyObj('NgbModal', ['open']);
    const notificationServiceSpy = jasmine.createSpyObj('NzNotificationService', ['success', 'error']);

    await TestBed.configureTestingModule({
      declarations: [ConsolidationBookingComponent, PaginatePipe, MockOrderByPipe],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        NgbModalModule,
        TranslateModule.forRoot(),
        BrowserDynamicTestingModule,
        BrowserAnimationsModule,
        AutocompleteLibModule
      ],
      providers: [
        LoaderService,
        NgbActiveModal,
        PaginationService,
        { provide: CommonService, useValue: commonServiceSpy },
        { provide: NgbModal, useValue: modalServiceSpy },
        { provide: NzNotificationService, useValue: notificationServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of({ get: () => '123' }) }
        },
        { provide: OrderByPipe, useClass: MockOrderByPipe },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    commonService = TestBed.inject(CommonService) as jasmine.SpyObj<CommonService>;
    modalService = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;
    notificationService = TestBed.inject(NzNotificationService) as jasmine.SpyObj<NzNotificationService>;
    loaderService = TestBed.inject(LoaderService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsolidationBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize and fetch consolidation booking data on init', fakeAsync(() => {
    const mockData = {
      documents: [
        { consolidationbookingNo: '123', batchwiseGrouping: [{ batchNo: 'batch1' }] },
        { consolidationbookingNo: '456', batchwiseGrouping: [{ batchNo: 'batch2' }] }
      ]
    };

    commonService.filterList.and.returnValue({} as any);
    commonService.getSTList.and.returnValue(of(mockData));
    spyOn(loaderService, 'showcircle');
    spyOn(loaderService, 'hidecircle');

    component.ngOnInit();
    tick();
    fixture.detectChanges();  // Add this to apply changes

    expect(loaderService.showcircle).toHaveBeenCalled();
    expect(commonService.getSTList).toHaveBeenCalledWith('consolidationbooking', {});
    expect(component.consolidationbooking.length).toBe(2);
    expect(component.dataSource.data.length).toBe(2);
    expect(loaderService.hidecircle).toHaveBeenCalled();
  }));
  it('should search columns and call common service', () => {
    component.filtersModel = ['test', ''];
    const mockPayload = { size: 10000, from: component.page - 1, query: { '#_0': { "$regex": 'test', "$options": 'i' } }, sort: { "desc": ["updatedOn"] } };
    commonService.filterList.and.returnValue(mockPayload as any);
    component.searchColumns();
    expect(commonService.filterList).toHaveBeenCalled();
  });

  it('should get consolidation booking data', fakeAsync(() => {
    const mockResponse = { documents: [{ consolidationbookingNo: '123', batchwiseGrouping: [{ batchNo: 'batch1' }] }] };
    commonService.getSTList.and.returnValue(of(mockResponse));
    spyOn(loaderService, 'showcircle');
    spyOn(loaderService, 'hidecircle');
    component.getconsolidationbooking();
    tick();
    expect(loaderService.showcircle).toHaveBeenCalled();
    expect(loaderService.hidecircle).toHaveBeenCalled();
    expect(component.consolidationbooking.length).toBe(1);
    expect(component.dataSource.data.length).toBe(1);
  }));

  it('should handle error on get consolidation booking data', fakeAsync(() => {
    commonService.getSTList.and.returnValue(throwError('error'));
    spyOn(loaderService, 'showcircle');
    spyOn(loaderService, 'hidecircle');
    component.getconsolidationbooking();
    tick();
    expect(loaderService.showcircle).toHaveBeenCalled();
    expect(loaderService.hidecircle).toHaveBeenCalled();
  }));

  it('should handle modal dismissal with reason', () => {
    const reason = ModalDismissReasons.ESC;
    const result = component['getDismissReason'](reason);
    expect(result).toBe('by pressing ESC');
  });
  it('should go to next page', () => {
    component.toalLength = 20;
    component.count = 10;
    spyOn(component, 'getPaginationData');
    component.next();
    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });

  it('should not go to next page if totalLength is not greater than count', () => {
    component.toalLength = 10;
    component.count = 20;
    spyOn(component, 'getPaginationData');
    component.next();
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });

  it('should go to previous page', () => {
    component.page = 2;
    spyOn(component, 'getPaginationData');
    component.prev();
    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should not go to previous page if page is 0', () => {
    component.page = 0;
    spyOn(component, 'getPaginationData');
    component.prev();
    expect(component.getPaginationData).not.toHaveBeenCalled();
  });
});
