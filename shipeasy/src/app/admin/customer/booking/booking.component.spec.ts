import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CommonService } from 'src/app/services/common/common.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { DatePipe } from '@angular/common';
import { BookingComponent } from './booking.component';

describe('BookingComponent', () => {
  let component: BookingComponent;
  let fixture: ComponentFixture<BookingComponent>;
  let commonService: jasmine.SpyObj<CommonService>;
  let commonFunctions: jasmine.SpyObj<CommonFunctions>;

  beforeEach(async () => {
    const commonServiceMock = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList']);
    const commonFunctionsMock = jasmine.createSpyObj('CommonFunctions', ['getAgentDetails', 'pageNo']);

    await TestBed.configureTestingModule({
      declarations: [BookingComponent],
      providers: [
        { provide: CommonService, useValue: commonServiceMock },
        { provide: CommonFunctions, useValue: commonFunctionsMock },
        DatePipe
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookingComponent);
    component = fixture.componentInstance;
    commonService = TestBed.inject(CommonService) as jasmine.SpyObj<CommonService>;
    commonFunctions = TestBed.inject(CommonFunctions) as jasmine.SpyObj<CommonFunctions>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should call getData', () => {
    spyOn(component, 'getData');
    component.ngOnInit();
    expect(component.getData).toHaveBeenCalled();
  });

  it('getData should fetch product data', () => {
    const mockResponse = { documents: ['doc1', 'doc2'] };
    commonService.filterList.and.returnValue({
      project: [],
      query: {},
      sort: undefined,
      size: 0,
      from: 0
    });
    commonService.getSTList.and.returnValue(of(mockResponse));

    component.getData();

    expect(commonService.filterList).toHaveBeenCalled();
    expect(commonService.getSTList).toHaveBeenCalledWith('batch', jasmine.any(Object));
    expect(component.productData).toEqual(mockResponse.documents);
  });

  it('searchGlobal should fetch product data based on search query', () => {
    const mockResponse = { documents: ['doc1', 'doc2'] };
    commonService.getSTList.and.returnValue(of(mockResponse));
    commonFunctions.getAgentDetails.and.returnValue({ customerId: '123' });

    const event = { target: { value: 'query' } };
    component.searchGlobal(event);

    expect(commonService.getSTList).toHaveBeenCalledWith('batch', jasmine.any(Object));
    expect(component.productData).toEqual(mockResponse.documents);
  });

  it('onClearFilter should reset filters and fetch all product data', () => {
    spyOn(component, 'getData');
    component.onClearFilter();
    expect(component.getData).toHaveBeenCalled();
  });

  it('clickOnTop should scroll to the top', () => {
    spyOn(window, 'scroll');
    component.clickOnTop();
    expect(window.scroll).toHaveBeenCalledWith(0, 0);
  });

  it('onPageChange should update pageCount', () => {
    component.onPageChange(2);
    expect(component.pageCount).toBe(2);
  });

  it('setPageNo should set pageNo in commonFunction', () => {
    component.setPageNo(3);
    expect(commonFunctions.pageNo).toBe(3);
  });
});
