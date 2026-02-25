import { ComponentFixture, TestBed } from '@angular/core/testing';


import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { NzNotificationModule, NzNotificationService } from 'ng-zorro-antd/notification';
import { CognitoService } from 'src/app/services/cognito.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { OverlayModule } from '@angular/cdk/overlay';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiSharedService } from '../../api-service/api-shared.service';
import { MessagingService } from 'src/app/services/messaging.service';
import { ApiService } from 'src/app/admin/principal/api.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { CommonService } from 'src/app/shared/services/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { Pipe, PipeTransform } from '@angular/core';
import { AddUserRoleComponent } from './add-user-role.component';

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
describe('AddUserRoleComponent', () => {
  let component: AddUserRoleComponent;
  let fixture: ComponentFixture<AddUserRoleComponent>;
  let commonFunctionsMock: jasmine.SpyObj<CommonFunctions>;
  let translateServiceStub: Partial<TranslateService>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let commonServiceMock: jasmine.SpyObj<CommonService>;
  let notificationServiceMock: jasmine.SpyObj<NzNotificationService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;
  let router: Router

  beforeEach(async () => {
    translateServiceStub = {
      get: (key: string) => of(key),
      instant: jasmine.createSpy('instant').and.returnValue('translated text')
    };
    commonFunctionsMock = jasmine.createSpyObj('CommonFunctions', ['getAuthToken']);
    await TestBed.configureTestingModule({
      declarations: [ AddUserRoleComponent ],
      imports: [HttpClientModule,RouterTestingModule,NzNotificationModule,SharedModule,TranslateModule.forRoot() ] ,
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
        { provide: CommonService, useValue: commonServiceMock },
        { provide: ApiService, useValue: apiServiceMock },
        { provide: NzNotificationService, useValue: notificationServiceMock },
        { provide: NgbModal, useValue: modalServiceMock }, 
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
    fixture = TestBed.createComponent(AddUserRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set form data properly in setData method', () => {
    // Arrange
    spyOn(component.form.controls.Name, 'setValue');
    spyOn(component.form.controls.Description, 'setValue');
    spyOn(component.form.controls.IsActive, 'setValue');
    spyOn(component, 'setRoleListChecked');
    spyOn(component.commonService, 'getSTList').and.returnValue(of({ documents: [{ roleId: '1', roleName: 'Test Role', roleDescription: 'Test Description', status: true, accesslevel: [] }] }));
    
    // Act
    component.setData();
    
    // Assert
    expect(component.form.controls.Name.setValue).toHaveBeenCalledWith('Test Role');
    expect(component.form.controls.Description.setValue).toHaveBeenCalledWith('Test Description');
    expect(component.form.controls.IsActive.setValue).toHaveBeenCalledWith(true);
    expect(component.setRoleListChecked).toHaveBeenCalled();
  });

 

  it('should mark form as invalid when required fields are empty', () => {
    // Arrange
    component.form.controls.Name.setValue('');
    component.form.controls.Description.setValue('');
    component.form.controls.IsActive.setValue(false);
    
    // Act
    const invalidControls = component.findInvalidControls();
    
    // Assert
    expect(invalidControls).toContain('Name');
    expect(invalidControls.length).toBe(1); // Ensure only 'Name' control is marked as invalid
  });
  
    
      
  it('should not set userData when getUserDatails returns null', () => {
    // Arrange
    spyOn(component.cognito, 'getUserDatails').and.returnValue(of(null) as any);
    
    // Act
    component.ngOnInit();
    
    // Assert
    expect(component.userData).toBe(undefined);
  });
  it('should not set form data when response data is empty', () => {
    // Arrange
    spyOn(component.commonService, 'getSTList').and.returnValue(of({ documents: [] }));
    
    // Act
    component.setData();
    
    // Assert
    expect(component.RoleIdToUpdate).toBe('');
    expect(component.form.controls.Name.value).toBe(undefined );
    expect(component.form.controls.Description.value).toBe(undefined );
    expect(component.form.controls.IsActive.value).toBe(undefined );
  });
    
 




});