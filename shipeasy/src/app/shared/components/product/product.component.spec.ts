import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { of } from 'rxjs';
import { ApiService } from 'src/app/admin/principal/api.service';
import { CommonService } from 'src/app/services/common/common.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Pipe, PipeTransform } from '@angular/core';
import { ProductComponent } from './product.component';
import { MastersSortPipe } from '../../util/mastersort';

@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  transform(value: any): any {
    return value;
  }
}

describe('ProductComponent', () => {
  let component: ProductComponent;
  let fixture: ComponentFixture<ProductComponent>;
  let mockModalRef: Partial<NgbModalRef>;

  const mockApiService = jasmine.createSpyObj('ApiService', ['getSTList', 'addToST', 'UpdateToST', 'deleteST']);
  const mockNotificationService = jasmine.createSpyObj('NzNotificationService', ['create']);
  const mockMastersService = jasmine.createSpyObj('MastersService', ['getSTList']);
  const mockProfilesService = jasmine.createSpyObj('ProfilesService', ['getUserDetails']);
  const mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails']);
  const mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList']);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ProductComponent, MockTranslatePipe,MastersSortPipe],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, RouterTestingModule],
      providers: [
        { provide: NgbModal, useValue: { open: () => mockModalRef } },
        { provide: ApiService, useValue: mockApiService },
        { provide: NzNotificationService, useValue: mockNotificationService },
        { provide: MastersService, useValue: mockMastersService },
        { provide: ProfilesService, useValue: mockProfilesService },
        { provide: SaMasterService, useValue: {} },
        { provide: CognitoService, useValue: mockCognitoService },
        { provide: CommonService, useValue: mockCommonService },
        {provide:MastersSortPipe, useValue:MastersSortPipe},
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductComponent);
    component = fixture.componentInstance;
    mockModalRef = { close: () => { } };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to add product page on onOpenProduct', () => {
    const routerSpy = spyOn(component.router, 'navigate');
    component.onOpenProduct();
    expect(routerSpy).toHaveBeenCalledWith(['/master/' + component.urlParam.key + '/add']);
  });

  it('should call getdata on ngOnInit', fakeAsync(() => {
    const getdataSpy = spyOn(component, 'getdata');
    component.ngOnInit();
    tick(501);
    expect(getdataSpy).toHaveBeenCalled();
  }));

  it('should initialize form controls with default values', () => {
    expect(component.productForm?.get('productName').value).toEqual('');
    expect(component.productForm?.get('productType').value).toEqual('');
    expect(component.productForm?.get('Stolt_Product_id').value).toEqual('');
  });

  it('should navigate to edit page on onEdit with show parameter true', () => {
    const routerSpy = spyOn(component.router, 'navigate');
    const id = '1';

    component.onEdit(id, true);

    expect(routerSpy).toHaveBeenCalledWith(['/master/' + component.urlParam.key + '/' + id + '/show']);
  });

  it('should navigate to edit page on onEdit with show parameter false', () => {
    const routerSpy = spyOn(component.router, 'navigate');
    const id = '1';

    component.onEdit(id, false);

    expect(routerSpy).toHaveBeenCalledWith(['/master/' + component.urlParam.key + '/' + id + '/edit']);
  });

  it('should call getPaginationData with "next" on next method', () => {
    const getPaginationDataSpy = spyOn(component, 'getPaginationData');
    component.toalLength = 15;
    component.count = 10;

    component.next();

    expect(getPaginationDataSpy).toHaveBeenCalledWith('next');
  });

  it('should call getPaginationData with "prev" on prev method', () => {
    const getPaginationDataSpy = spyOn(component, 'getPaginationData');

    component.prev();

    expect(getPaginationDataSpy).toHaveBeenCalledWith('prev');
  });

  it('should set size and call getdata on filter method', () => {
    const getdataSpy = spyOn(component, 'getdata');
    const event = { target: { value: 20 } };

    component.filter(event);

    expect(component.size).toEqual(20);
    expect(getdataSpy).toHaveBeenCalled();
  });

  it('should reset filter parameters and call getdata on clear method', () => {
    const getdataSpy = spyOn(component, 'getdata');

    component.product_name = 'Test Product';
    component.product_type = 'Type1';
    component.product_group = 'Customer1';
    component.stolt_product_id = '123';

    component.clear();

    expect(component.product_name).toEqual('');
    expect(component.product_type).toEqual('');
    expect(component.product_group).toEqual('');
    expect(component.stolt_product_id).toEqual('');
    expect(getdataSpy).toHaveBeenCalled();
  });

  it('should initialize form and call getdata on ngOnInit', fakeAsync(() => {
    spyOn(component, 'getdata');

    component.ngOnInit();
    tick(501); // Simulate the setTimeout delay

    expect(component.productForm).toBeDefined();
    expect(component.getdata).toHaveBeenCalled();
  }));

  it('should navigate to new product page on onOpenProduct', () => {
    const routerSpy = spyOn(component.router, 'navigate');
    component.urlParam = { key: 'test' };

    component.onOpenProduct();

    expect(routerSpy).toHaveBeenCalledWith(['/master/test/add']);
  });

  it('should navigate to master page on onCloseNew', () => {
    const routerSpy = spyOn(component.router, 'navigate');
    component.urlParam = { key: 'test' };

    component.onCloseNew();

    expect(routerSpy).toHaveBeenCalledWith(['/master/test']);
  });


  it('should call getPaginationData with "next" when there is more data on next method', () => {
    const getPaginationDataSpy = spyOn(component, 'getPaginationData');
    component.toalLength = 15;
    component.count = 10;

    component.next();

    expect(getPaginationDataSpy).toHaveBeenCalledWith('next');
  });

  it('should not call getPaginationData on next method when all data is already loaded', () => {
    const getPaginationDataSpy = spyOn(component, 'getPaginationData');
    component.toalLength = 15;
    component.count = 15;

    component.next();

    expect(getPaginationDataSpy).not.toHaveBeenCalled();
  });

  it('should call getPaginationData with "prev" on prev method when there is more data', () => {
    const getPaginationDataSpy = spyOn(component, 'getPaginationData');
    component.page = 2;

    component.prev();

    expect(getPaginationDataSpy).toHaveBeenCalledWith('prev');
  });

  it('should mark form controls as invalid when submitting with empty values', () => {
    const formControls = component.productForm?.controls;

    formControls?.productName.setValue('');
    formControls.productType.setValue('');
    formControls.Stolt_Product_id.setValue('');

    component.productMasters();

    expect(formControls.productName.invalid).toBeTruthy();
    expect(formControls.productType.invalid).toBeTruthy();
    expect(formControls.Stolt_Product_id.invalid).toBeTruthy();
  });


});
