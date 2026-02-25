import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { of, throwError } from 'rxjs';
import { QuotationDetailComponent } from './quotation-detail.component';
import { CognitoService } from 'src/app/services/cognito.service';
import { CommonService } from 'src/app/services/common/common.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { PipeModule } from 'src/app/shared/pipes/pipe.module';
import { SharedModule } from 'src/app/shared/shared.module';

describe('QuotationDetailComponent', () => {
  let component: QuotationDetailComponent;
  let fixture: ComponentFixture<QuotationDetailComponent>;
  let mockRoute: any;
  let mockRouter: any;
  let mockCognitoService: any;
  let mockCommonService: any;
  let mockNotificationService: any;
  let mockModalService: any;
  let mockCommonFunctions: any;

  beforeEach(async () => {
    mockRoute = { snapshot: { params: { id: 1 } } };
    mockRouter = { navigate: jasmine.createSpy('navigate') };
    mockCognitoService = { getOrganization: jasmine.createSpy('getOrganization').and.returnValue({ orgId: 1 }) };
    mockCommonService = {
      getSTList: jasmine.createSpy('getSTList').and.returnValue(of({ documents: [] })),
      filterList: jasmine.createSpy('filterList').and.returnValue({})
    };
    mockNotificationService = { create: jasmine.createSpy('create') };
    mockModalService = { open: jasmine.createSpy('open'), dismissAll: jasmine.createSpy('dismissAll') };
    mockCommonFunctions = { getAgentDetails: jasmine.createSpy('getAgentDetails').and.returnValue({}) ,
    getAgentCur : jasmine.createSpy('getAgentCur ').and.returnValue(''),
    customerCurrency  : jasmine.createSpy('customerCurrency ').and.returnValue('')};

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule,PipeModule,SharedModule],
      declarations: [QuotationDetailComponent], 
      providers: [
        FormBuilder,
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: Router, useValue: mockRouter },
        { provide: CognitoService, useValue: mockCognitoService },
        { provide: CommonService, useValue: mockCommonService },
        { provide: NzNotificationService, useValue: mockNotificationService },
        { provide: NgbModal, useValue: mockModalService },
        { provide: CommonFunctions, useValue: mockCommonFunctions }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuotationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the enquiryId', () => {
    expect(component.enquiryId).toBe(1);
  });

  it('should initialize forms', () => {
    expect(component.commentForm).toBeDefined();
    expect(component.currencyForm).toBeDefined();
    expect(component.Requotationdetails).toBeDefined();
    expect(component.commentForm.controls['noteType']).toBeDefined();
    expect(component.commentForm.controls['noteText']).toBeDefined();
    expect(component.currencyForm.controls['inr']).toBeDefined();
    expect(component.currencyForm.controls['usd']).toBeDefined();
  });

  it('should call ngOnInit and initialize userData and enquiryId', () => {
    component.ngOnInit();
    expect(component.userData).toEqual({});
    expect(component.enquiryId).toBe(1);
    expect(mockCommonService.getSTList).toHaveBeenCalled();
  });

  it('should call getData and fetch user activities', () => {
    component.getData();
    expect(mockCommonService.getSTList).toHaveBeenCalledWith('enquiry', jasmine.any(Object));
  });

  it('should set selectedPrice when selectQuote is called', () => {
    component.selectQuote('cheapest');
    expect(component.selectedPrice).toBe('cheapest');
  });

  it('should fetch quote details and set priceRanges', () => {
    const mockResponse = { documents: [{ quoteStatus: 'Quotation Created' }, { quoteStatus: 'Quotation Rejected' }] };
    mockCommonService.getSTList.and.returnValue(of(mockResponse));
    component.getQuoteDetails();
    expect(mockCommonService.getSTList).toHaveBeenCalled();
  });

  it('should calculate the total taxable amount', () => {
    component.chargeItems = [{ selEstimates: { taxableAmount: 100 }, quotationId: 1 }];
    component.selectedPrice = { quotationId: 1 };
    const total = component.returnTotal();
    expect(total).toBe(100);
  });

  it('should calculate the total GST amount', () => {
    component.chargeItems = [{ selEstimates: { igst: 10 }, quotationId: 1 }];
    component.selectedPrice = { quotationId: 1 };
    const tax = component.rturnGst();
    expect(tax).toBe(10);
  });

  it('should call modalService.dismissAll', () => {
    component.closePopup();
    expect(mockModalService.dismissAll).toHaveBeenCalled();
  });

  it('should fetch quote details, populate priceRanges, and sort them correctly', () => {
    const mockResponse = {
      documents: [
        { quoteStatus: 'Quotation Created', quotationId: 1 },
        { quoteStatus: 'Quotation Rejected', quotationId: 2 }
      ]
    };
    mockCommonService.getSTList.and.returnValue(of(mockResponse));
  
    component.getQuoteDetails();
  
    expect(mockCommonService.getSTList).toHaveBeenCalledWith('quotation', jasmine.any(Object));
    expect(component.priceRanges.length).toBe(2);
    expect(component.priceRanges[0].quoteStatus).toBe('Quotation Created');
    expect(component.priceRanges[1].quoteStatus).toBe('Quotation Rejected');
  });

  
  it('should filter priceRanges by enquiryStatusCustomer if it is "Accepted"', () => {
    const mockResponse = {
      documents: [
        { quoteStatus: 'Quotation Created', quotationId: 1 },
        { quoteStatus: 'Quotation Rejected', quotationId: 2 }
      ]
    };
    component.userActivities = { enquiryStatusCustomer: 'Accepted' };
    mockCommonService.getSTList.and.returnValue(of(mockResponse));
  
    component.getQuoteDetails();
  
    expect(component.priceRanges.length).toBe(1);
    expect(component.priceRanges[0].quoteStatus).toBe('Quotation Created');
  });
  it('should set the correct flags and typeOfWay based on shipment and load type', () => {
    const mockResponse = {
      documents: [{ quotationId: 1 }],
    };
    component.userActivities = { enquiryDetails: { basicDetails: { ShipmentTypeName: 'air', loadType: 'uld container' } } };
    mockCommonService.getSTList.and.returnValue(of(mockResponse));
  
    component.getQuoteDetails();
  
    expect(component.activeFrightAir).toBeTrue();
    expect(component.showPallet).toBeFalse();
    expect(component.showContainer).toBeTrue();
    expect(component.typeOfWay).toBe('Container');
  });
  
    
  
});
