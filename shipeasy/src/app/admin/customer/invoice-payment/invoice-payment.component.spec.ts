import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InvoicePaymentComponent } from './invoice-payment.component';
import { CommonService } from 'src/app/services/common/common.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { DatePipe } from '@angular/common';
import { of } from 'rxjs';
import { NgxPaginationModule, PaginatePipe } from 'ngx-pagination';

describe('InvoicePaymentComponent', () => {
  let component: InvoicePaymentComponent;
  let fixture: ComponentFixture<InvoicePaymentComponent>;
  let commonServiceStub: Partial<CommonService>;
  let commonFunctionsStub: Partial<CommonFunctions>;

  beforeEach(async () => {
    commonServiceStub = {
      filterList: () => ({} as any),
      getSTList: (endpoint: string, payload: any) => of({ documents: [{}, {}] })
    };

    commonFunctionsStub = {
      getAgentDetails: () => ({ customerId: '12345' }),
      pageNo: 1
    };

    await TestBed.configureTestingModule({
      declarations: [
        InvoicePaymentComponent,
        PaginatePipe // Declare the paginate pipe here
      ],
      imports:[NgxPaginationModule],
      providers: [
        { provide: CommonService, useValue: commonServiceStub },
        { provide: CommonFunctions, useValue: commonFunctionsStub },
        DatePipe
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoicePaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getData on init', () => {
    spyOn(component, 'getData');
    component.ngOnInit();
    expect(component.getData).toHaveBeenCalled();
  });

  it('should remove invoice-data from localStorage and call commonService.getSTList in getData', () => {
    spyOn(localStorage, 'removeItem');
    spyOn(commonServiceStub, 'getSTList').and.callThrough();

    component.getData();

    expect(localStorage.removeItem).toHaveBeenCalledWith('invoice-data');
    expect(commonServiceStub.getSTList).toHaveBeenCalled();
  });

  it('should update productData in getData', () => {
    component.getData();
    expect(component.productData.length).toBe(2);
  });

  

  it('should update pageCount on onPageChange', () => {
    component.onPageChange(3);
    expect(component.pageCount).toBe(3);
  });

  it('should call commonService.getSTList with search query on searchGlobal', () => {
    spyOn(commonServiceStub, 'getSTList').and.callThrough();
    const event = { target: { value: 'test' } } as any;

    component.searchGlobal(event);

    expect(commonServiceStub.getSTList).toHaveBeenCalled();
  });

  it('should call getData on onClearFilter', () => {
    spyOn(component, 'getData');
    component.onClearFilter();
    expect(component.getData).toHaveBeenCalled();
  });
});
