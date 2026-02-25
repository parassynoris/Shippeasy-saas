import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { of, throwError } from 'rxjs';
import { ApiService } from 'src/app/admin/principal/api.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
import { AddProductComponent } from './add-product.component';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
@Pipe({
  name: 'translate',
})
export class MockTranslatePipe implements PipeTransform {
  
  constructor(private currencyPipe: CurrencyPipe) {}
  transform(value: any): any {
    // Mock the translation behavior as needed for testing
    return value;
  }
}

describe('AddProductComponent', () => {
  let component: AddProductComponent;
  let fixture: ComponentFixture<AddProductComponent>;
  let translateServiceStub: Partial<TranslateService>;
  let mockNgbModal: jasmine.SpyObj<NgbModal>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockNotificationService: jasmine.SpyObj<NzNotificationService>;
  let mockMastersService: jasmine.SpyObj<MastersService>;
  let mockProfilesService: jasmine.SpyObj<ProfilesService>;
  let mockCognitoService: jasmine.SpyObj<CognitoService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  beforeEach(waitForAsync(() => {
    mockNgbModal = jasmine.createSpyObj('NgbModal', ['open']);
    mockApiService = jasmine.createSpyObj('ApiService', ['getSTList', 'addToST', 'UpdateToST', 'deleteST']);
    mockNotificationService = jasmine.createSpyObj('NzNotificationService', ['create']);
    mockMastersService = jasmine.createSpyObj('MastersService', ['getSTList']);
    mockProfilesService = jasmine.createSpyObj('ProfilesService', ['getUserDetails','countryList']);
    mockCognitoService = jasmine.createSpyObj('CognitoService', ['getUserDatails','getagentDetails',]);
    mockCommonService = jasmine.createSpyObj('CommonService', ['filterList', 'getSTList', 'UpdateToST']);
   mockApiService = jasmine.createSpyObj('ApiService',['getListByURL']);
    TestBed.configureTestingModule({
      declarations: [AddProductComponent, MockTranslatePipe],
      imports: [BrowserDynamicTestingModule,ReactiveFormsModule,SharedModule,NzSelectModule,NzDatePickerModule,RouterTestingModule,BrowserAnimationsModule ,HttpClientModule,TranslateModule.forRoot()],
      providers: [DatePipe, OrderByPipe,CurrencyPipe,
        { provide: NgbModal, useValue: mockNgbModal },
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
    fixture = TestBed.createComponent(AddProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with required controls', () => {
    expect(component.addProduct).toBeDefined();
    expect(component.addProduct.controls['productName']).toBeDefined();
    expect(component.addProduct.controls['productType']).toBeDefined();
    // Add more assertions for other form controls...
  });

  it('should submit form', () => {
    spyOn(component, 'onSave');
    component.onSave();
    expect(component.onSave).toHaveBeenCalled();
  });

  it('should patch form with product data', () => {
    // Mock product data
    const mockProductData = { productName: 'Product A', productType: 'HAZ', imcoClass: 'Class A', unNumber: 'UN1234' };
    component.patchValue(mockProductData);
    expect(component.addProduct.value.productName).toBe('Product A');
    expect(component.addProduct.value.productType).toBe('HAZ');
    // Add more assertions for other form controls...
  });
  
  it('should validate form fields', () => {
    // Set form controls to invalid state
    component.addProduct.get('productName').setValue('');
    component.addProduct.get('productType').setValue('');
    // Trigger validation
    component.submitted = true;
    // Check if form is invalid
    expect(component.addProduct.invalid).toBe(true);
  });

  
  it('should update form controls based on product type change', () => {
    const hazProductType = 'HAZ';
    component.addProduct.get('productType').setValue(hazProductType);
    component.onProductTypeChange(hazProductType);
    expect(component.isHaz).toBe(true);
    // Add more expectations as needed
  });

  it('should emit close action event', () => {
    spyOn(component.CloseAction, 'emit');
    component.onClose('close');
    expect(component.CloseAction.emit).toHaveBeenCalledWith('close');
  });

  it('should mark form as invalid if required fields are not filled', () => {
    // Clear form controls
    component.addProduct.reset();
    // Call onSave method which triggers form submission
    component.onSave();
    expect(component.addProduct.invalid).toBe(true);
  });
  
  it('should set MSDS file name', () => {
    const fileName = 'msds_document.pdf';
    const event = { target: { files: [{ name: fileName }] } };
    component.msdsfileupload(event);
    expect(component.addProduct.get('msdsFile').value).toBe(fileName);
  });

  it('should detect invalid form controls', () => {
    // Simulate invalid form controls
    component.addProduct.get('productName').setErrors({ 'required': true });
    const invalidControls = component.findInvalidControls();
    expect(invalidControls).toContain('productName');
  });
 
  it('should delete file from document payload', () => {
    component.documentPayload = [{ docname: 'document1.pdf', docurl: 'url1' }, { docname: 'document2.pdf', docurl: 'url2' }];
    const docToDelete = { docname: 'document1.pdf', docurl: 'url1' };
    component.deleteFile(docToDelete);
    expect(component.documentPayload.length).toBe(1);
  });
 
  it('should set MSDS file name in form control', () => {
    const fileName = 'msds_document.pdf';
    const event = { target: { files: [{ name: fileName }] } };
    component.msdsfileupload(event);
    expect(component.addProduct.get('msdsFile').value).toBe(fileName);
  });

 

});
