import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoryMasterComponent } from './category-master.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { NzNotificationModule, NzNotificationService } from 'ng-zorro-antd/notification';
import { CognitoService } from 'src/app/services/cognito.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { OverlayModule } from '@angular/cdk/overlay';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagingService } from 'src/app/services/messaging.service';
import { ApiService } from 'src/app/admin/principal/api.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { Pipe, PipeTransform } from '@angular/core';
import { ApiSharedService } from 'src/app/shared/components/api-service/api-shared.service';
import { of } from 'rxjs';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CommonService } from 'src/app/services/common/common.service';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule,} from '@angular/forms';
import { Location } from '@angular/common';
import { MastersSortPipe } from 'src/app/shared/util/mastersort';

// Mock implementation of OrderByPipe
@Pipe({ name: 'orderBy' })
class MockOrderByPipe implements PipeTransform {
  transform(value: any[], key: string): any[] {
    return value; // Mock implementation: return the input array without sorting
  }
}
describe('CategoryMasterComponent', () => {
  let component: CategoryMasterComponent;
  let fixture: ComponentFixture<CategoryMasterComponent>;
  let commonFunctionsMock: jasmine.SpyObj<CommonFunctions>;
  let translateServiceStub: Partial<TranslateService>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let notificationServiceMock: jasmine.SpyObj<NzNotificationService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let locationSpy: jasmine.SpyObj<Location>;
  let mockModalService;
  beforeEach(async () => {
    const apiServiceSpyObj = jasmine.createSpyObj('ApiService', ['getMasterList', 'SaveOrUpdate']);
    const commonServiceSpyObj = jasmine.createSpyObj('CommonService', ['getSTList', 'filterList', 'addToST']);
    mockModalService = jasmine.createSpyObj('NgbModal', ['dismissAll']);
    await TestBed.configureTestingModule({
      declarations: [ CategoryMasterComponent,MastersSortPipe ],
      imports: [HttpClientModule,RouterTestingModule,NzNotificationModule,SharedModule,TranslateModule.forRoot(),BrowserAnimationsModule,HttpClientTestingModule,FormsModule,ReactiveFormsModule,NgbModule , MatTableModule,
        MatSelectModule,
        NoopAnimationsModule] ,
      providers: [
        NzNotificationService,
        CognitoService, 
        OverlayModule ,
        { provide: CommonFunctions, useValue: jasmine.createSpyObj('CommonFunctions', ['yourMethod']) }, // Provide a mock for CommonFunctions
        { provide: Router, useValue: {} },
        ApiSharedService,
        { provide: MessagingService, useValue: jasmine.createSpyObj('MessagingService', ['methodName']) } ,
        { provide: MessagingService, useValue: {} },
        { provide: CommonFunctions, useValue: commonFunctionsMock },
        { provide: TransactionService, useValue: translateServiceStub },
        { provide: CommonService, useValue: commonServiceSpyObj },
        { provide: ApiService, useValue: apiServiceMock },
        { provide: NzNotificationService, useValue: notificationServiceMock },
        { provide: NgbModal, useValue: modalServiceMock }, 
        { provide: OrderByPipe, useClass: MockOrderByPipe },
        { provide: CognitoService, useClass: MockCognitoService },
        { provide: Location, useValue: jasmine.createSpyObj('Location', ['back']) },
        { provide: CommonFunctions, useClass: MockCommonFunctions },
        { provide: ApiService, useValue: mockApiService },
        { provide: Location, useValue: locationSpy },
        { provide: MastersSortPipe, useValue: MastersSortPipe },
        { provide: ApiService, useValue: apiServiceSpyObj },
        { provide: CommonService, useValue: { filterList: () => ({ query: {} }) } },
        { provide: CommonService, useClass: commonService },
        { provide: NgbModal, useValue: mockModalService },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of({ get: () => '123' }) }, 
        },
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should reset form, set controls, dismiss modal, and update state', () => {
    // Mock form reset
    spyOn(component.addCategoryForm, 'reset').and.stub();
    spyOn(component.addCategoryForm.controls['isPrincipalPLD'], 'setValue').and.stub();

    // Call onSave
    component.onSave();

    // Expectations
    expect(component.submitted).toBeFalse();
    expect(component.categoryIdToUpdate).toBeNull();
    expect(component.addCategoryForm.reset).toHaveBeenCalled();
    expect(component.addCategoryForm.controls['isPrincipalPLD'].setValue).toHaveBeenCalledWith(false);
    expect(mockModalService.dismissAll).toHaveBeenCalled();
  });
  it('should clear component properties and call getData()', () => {
    // Set component properties
    component.name = 'test';
    component.last_update = '2022-01-01';
    component.last_update_user = 'user';
    component.service_id = '1';
    component.Created_by = 'user';
    component.created_date = '2022-01-01';
    component.seq_no = '1';
    component.only_flag = 'true';
    component.principle_pld = 'true';
    component.isClearable = true;

    // Spy on getData method
    spyOn(component, 'getData').and.stub();

    // Call clear method
    component.clear();

    // Expectations
    expect(component.name).toBe('');
    expect(component.last_update).toBe('');
    expect(component.last_update_user).toBe('');
    expect(component.service_id).toBe('');
    expect(component.Created_by).toBe('');
    expect(component.created_date).toBe('');
    expect(component.seq_no).toBe('');
    expect(component.only_flag).toBe('');
    expect(component.principle_pld).toBe('');
    expect(component.getData).toHaveBeenCalled();
  });

  it('should set isSearchable to true', () => {
    // Call searchDataChange method
    component.searchDataChange();

    // Expectation
    expect(component.isSearchable).toBeTrue();
  });
  it('should fetch next page data if total length is greater than current count', () => {
    component.toalLength = 20;
    component.count = 10;

    spyOn(component, 'getPaginationData').and.stub();

    component.next();

    expect(component.getPaginationData).toHaveBeenCalledWith('next');
  });

  it('should fetch previous page data if current page is greater than 0', () => {
    component.page = 2;

    spyOn(component, 'getPaginationData').and.stub();

    component.prev();

    expect(component.getPaginationData).toHaveBeenCalledWith('prev');
  });

  it('should update size, reset fromSize, and fetch data on filter change', () => {
    const mockEvent = { target: { value: '20' } };

    spyOn(component, 'getData').and.stub();

    component.filter(mockEvent);

    expect(component.size).toBe('20' as any);
    expect(component.fromSize).toBe(1);
    expect(component.getData).toHaveBeenCalled();
  });
  it('should call alert with "Item deleted!" message', () => {
    spyOn(window, 'alert');
    const id = 1; // Example id for deletion

    component.deleteclause(id);

    expect(window.alert).toHaveBeenCalledWith('Item deleted!');
  });

  it('should return form controls', () => {
    const formControls = component.f;

    expect(formControls).toBeTruthy();
    // Add more specific expectations if needed based on your form structure
  });
  class MockCognitoService {
    getUserDatails() {
    }
  }
  class MockCommonFunctions {
    get() {
    }
    getAuthToken() {
    }
  }
  class commonService{
   getSTList(){}
   filterList(){}
  }
});