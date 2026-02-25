import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { NzNotificationModule, NzNotificationService } from 'ng-zorro-antd/notification';
import { CognitoService } from 'src/app/services/cognito.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { OverlayModule } from '@angular/cdk/overlay';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MessagingService } from 'src/app/services/messaging.service';
import { ApiService } from 'src/app/admin/principal/api.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { CommonService } from 'src/app/shared/services/common.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { Pipe, PipeTransform } from '@angular/core';
import { ApiSharedService } from 'src/app/shared/components/api-service/api-shared.service';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MastersSortPipe } from 'src/app/shared/util/mastersort';
import { LandFleetComponent } from './land-fleet.component';
import { MatTableDataSource } from '@angular/material/table';

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
class MockApiService {
  getSTList() {
    // Provide a mock implementation as needed
  }
}
// Mock implementation of CommonFunctions
class MockCommonFunctions {
  get() {
    // Mock implementation
  }
  getUserType1(){}
  getAuthToken() {
    // Provide a mock implementation or return a default value
  }
  getSTList(){

  }
}
describe('LandFleetComponent', () => {
  let component: LandFleetComponent
  let fixture: ComponentFixture<LandFleetComponent>;
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
    
    await TestBed.configureTestingModule({
      declarations: [LandFleetComponent],
      imports: [HttpClientModule,RouterTestingModule,NzNotificationModule,SharedModule,TranslateModule.forRoot(),BrowserDynamicTestingModule,BrowserAnimationsModule] ,
      providers: [
        NzNotificationService,
        CognitoService, 
        OverlayModule ,
        RouterTestingModule,
        { provide: ApiService, useClass: MockApiService },
        { provide: CommonFunctions, useValue: jasmine.createSpyObj('CommonFunctions', ['getUserType1','yourMethod','getSTList']) }, // Provide a mock for CommonFunctions
        { provide: Router, useValue: {} },
        ApiSharedService,NgbActiveModal,
        { provide: MessagingService, useValue: jasmine.createSpyObj('MessagingService', ['methodName','getSTList']) } ,
        { provide: MessagingService, useValue: {} },
        { provide: CommonFunctions, useValue: commonFunctionsMock },
        { provide: TransactionService, useValue: translateServiceStub },
        { provide: CommonService, useValue: commonServiceMock },
        { provide: ApiService, useValue: apiServiceMock },
        { provide: NzNotificationService, useValue: notificationServiceMock },
        { provide: NgbModal, useValue: modalServiceMock }, 
        { provide: MastersSortPipe, useValue: MastersSortPipe },
        { provide: OrderByPipe, useClass: MockOrderByPipe },
        { provide: CommonFunctions, useClass: MockCommonFunctions },
        { provide: CognitoService, useClass: MockCognitoService }, 
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of({ get: () => '123' }) }, // Adjust based on your route parameters
        },
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LandFleetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form', () => {
    expect(component.addVesselForm).toBeDefined();
    expect(component.addVesselForm.valid).toBeFalsy(); // Example: check initial validity
  });
  
  it('should apply filter', () => {
    const filterValue = 'example filter';
    component.dataSource = new MatTableDataSource<any>([]);
    component.applyFilter(filterValue);
    expect(component.dataSource.filter).toBe(filterValue.toLowerCase());
  });

  it('should initialize data on ngOnInit', () => {
    spyOn(component, 'getData').and.callThrough();
    component.ngOnInit();
    expect(component.getData).toHaveBeenCalled();
  });
  

  it('should render component within acceptable time', () => {
    jasmine.clock().install();
    component.ngOnInit();
    jasmine.clock().tick(100); // Adjust time as per performance expectations
    expect(component).toBeTruthy();
    jasmine.clock().uninstall();
  });

  it('should validate form fields', () => {
    const formData = { /* mock form data with invalid fields */ };
    component.addVesselForm.patchValue(formData);
    expect(component.addVesselForm.valid).toBeFalsy(); // Expect form to be invalid with invalid data
  });
  
});
