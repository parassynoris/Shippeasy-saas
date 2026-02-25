import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NzNotificationModule, NzNotificationService } from 'ng-zorro-antd/notification';
import { CognitoService } from 'src/app/services/cognito.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { OverlayModule } from '@angular/cdk/overlay';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagingService } from 'src/app/services/messaging.service';
import { ApiService } from 'src/app/admin/principal/api.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { CommonService } from 'src/app/shared/services/common.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { Pipe, PipeTransform } from '@angular/core';
import { ApiSharedService } from 'src/app/shared/components/api-service/api-shared.service';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormArray } from '@angular/forms';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { GrnComponent } from './grn.component';

// Mock implementation of OrderByPipe
@Pipe({ name: 'orderBy' })
class MockOrderByPipe implements PipeTransform {
  transform(value: any[], key: string): any[] {
    return value; // Mock implementation: return the input array without sorting
  }
}

class MockCognitoService {
  getUserDatails() {
    // Mock implementation
  }
}

// Mock implementation of CommonFunctions
class MockCommonFunctions {
  get() {
    // Mock implementation
  }
  getAuthToken() {
    // Provide a mock implementation or return a default value
  }
}

describe('GrnComponent', () => {
  let component: GrnComponent;
  let fixture: ComponentFixture<GrnComponent>;
  let httpTestingController: HttpTestingController;
  let commonFunctionsMock: jasmine.SpyObj<CommonFunctions>;
  let translateServiceStub: Partial<TranslateService>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let commonServiceMock: jasmine.SpyObj<CommonService>;
  let notificationServiceMock: jasmine.SpyObj<NzNotificationService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;

  beforeEach(async () => {
    translateServiceStub = {
      get: (key: string) => of(key),
      instant: jasmine.createSpy('instant').and.returnValue('translated text')
    };
    commonFunctionsMock = jasmine.createSpyObj('CommonFunctions', ['getAuthToken']);
    const commonServiceSpyObj = jasmine.createSpyObj('CommonService', ['getSTList', 'filterList', 'addToST']);

    await TestBed.configureTestingModule({
      declarations: [GrnComponent, MockOrderByPipe],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        NzNotificationModule,
        SharedModule,
        TranslateModule.forRoot(),
        BrowserDynamicTestingModule,
        BrowserAnimationsModule,
        OverlayModule
      ],
      providers: [
        { provide: CommonFunctions, useValue: commonFunctionsMock },
        { provide: Router, useValue: {} },
        { provide: MessagingService, useValue: jasmine.createSpyObj('MessagingService', ['methodName']) },
        { provide: TransactionService, useValue: translateServiceStub },
        { provide: CommonService, useValue: commonServiceSpyObj },
        { provide: ApiService, useValue: apiServiceMock },
        { provide: NzNotificationService, useValue: notificationServiceMock },
        { provide: NgbModal, useValue: modalServiceMock },
        { provide: CognitoService, useClass: MockCognitoService },
        { provide: OrderByPipe, useClass: MockOrderByPipe },
        { provide: ActivatedRoute, useValue: { paramMap: of({ get: () => '123' }) } }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GrnComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle isEditing when editListing is called', () => {
    component.isEditing = false;
    component.editListing();
    expect(component.isEditing).toBeTrue();

    component.editListing();
    expect(component.isEditing).toBeFalse();
  });

  it('should clear form and reset GRN when editListing is called without id', () => {
    component.editListing();
    expect(component.newgrn.controls.grnId.value).toBe('');
    expect(component.newgrn.controls.wareHouse.value).toBe('');
  });
  it('should toggle isEditing and call getGrnDetails when editListing is called with id', () => {
    spyOn(component, 'getGrnDetails');

    component.isEditing = false;
    const mockId = { grnId: '123' };

    component.editListing(mockId);

    expect(component.isEditing).toBeTrue();
    expect(component.getGrnDetails).toHaveBeenCalledWith('123');
    expect(component.enableButton).toBeTrue();
  });

  it('should reset form when editListing is called without id', () => {
    component.isEditing = true;

    component.editListing();

    expect(component.isEditing).toBeFalse();
    expect(component.newgrn.get('grnId').value).toBe('');
    expect(component.newgrn.get('wareHouse').value).toBe('');
    expect(component.enableButton).toBeFalse();
  });
  it('should set binSelectionData based on selected warehouse', () => {
    const mockWarehouseList = [
      { warehouseId: '1', bins: ['Bin1', 'Bin2'] },
      { warehouseId: '2', bins: ['Bin3'] }
    ];

    component.warehouseList = mockWarehouseList;

    component.setBinSelection('1');

    expect(component.binSelectionData).toEqual(['Bin1', 'Bin2']);
  });
});
 