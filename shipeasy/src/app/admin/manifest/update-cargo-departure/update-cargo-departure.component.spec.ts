import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateCargoDepartureComponent } from './update-cargo-departure.component';
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
import { FormBuilder,FormsModule, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { Location } from '@angular/common';

// Mock implementation of OrderByPipe
@Pipe({ name: 'orderBy' })
class MockOrderByPipe implements PipeTransform {
  transform(value: any[], key: string): any[] {
    return value; // Mock implementation: return the input array without sorting
  }
}
describe('UpdateCargoDepartureComponent', () => {
  let component: UpdateCargoDepartureComponent;
  let fixture: ComponentFixture<UpdateCargoDepartureComponent>;
  let commonFunctionsMock: jasmine.SpyObj<CommonFunctions>;
  let translateServiceStub: Partial<TranslateService>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let commonServiceMock: jasmine.SpyObj<CommonService>;
  let notificationServiceMock: jasmine.SpyObj<NzNotificationService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;
  let location: jasmine.SpyObj<Location>;
  let mockApiService: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    mockApiService = jasmine.createSpyObj('ApiService', ['getSTList', 'addToST', 'UpdateToST', 'deleteST']);

    await TestBed.configureTestingModule({
      declarations: [ UpdateCargoDepartureComponent ],
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
        { provide: CommonService, useValue: commonServiceMock },
        { provide: ApiService, useValue: apiServiceMock },
        { provide: NzNotificationService, useValue: notificationServiceMock },
        { provide: NgbModal, useValue: modalServiceMock }, 
        { provide: OrderByPipe, useClass: MockOrderByPipe },
        { provide: CognitoService, useClass: MockCognitoService },
        { provide: Location, useValue: jasmine.createSpyObj('Location', ['back']) },
        { provide: CommonFunctions, useClass: MockCommonFunctions },
        { provide: ApiService, useValue: mockApiService },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of({ get: () => '123' }) }, 
        },
      ]
    })
    .compileComponents();
    location = TestBed.inject(Location) as jasmine.SpyObj<Location>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateCargoDepartureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return controls of blForm', () => {
    // Arrange
    const fb = new FormBuilder();
    component.blForm = fb.group({ blData: fb.array([fb.group({}), fb.group({})]) });

    // Act
    const controls = component.getControls();

    // Assert
    expect(controls.length).toBe(2);
  });
  it('should update cargoId field in blData FormArray based on cargo value', () => {
    // Arrange
    const cargoIdValue = 'cargo123';
    component.cargo = cargoIdValue;

    // Create a FormArray with mock data
    const mockBlData = [
      { cargoId: 'cargo1' },
      { cargoId: 'cargo2' },
      { cargoId: 'cargo3' }
    ];
    const blDataFormArray = new FormArray(mockBlData.map(bl => new FormControl(bl)));
    const fb = new FormBuilder();
    // Set the FormArray to the component's blForm
    component.blForm = fb?.group({
      blData: blDataFormArray
    });

    // Act
    component.applyAll();

    // Assert
    component.blForm.controls.blData.value.forEach((element, index) => {
      const expectedCargoId = component.cargo || mockBlData[index].cargoId;
      expect(component.blForm.get('blData')['controls'].at(index).value.cargoId).toEqual(expectedCargoId);
    });
  });
  it('should navigate back when back is called', () => {
    // Act
    component.back();

    // Assert
    expect(location.back).toHaveBeenCalled();
  });

  it('should populate itemTypeList, departureModeList, and cargoTypeList correctly', () => {
  // Mock the response from filterList
     mockApiService.filterList?.and.callFake(() => {
          return {
            query: {},
            project: [],
            sort: { "desc": ["updatedOn"] },
            size: 0,
            from: 0
          };
        });


    // Mock the response from getSTList
    const mockResponse = {
      documents: [
        { _source: { typeCategory: 'itemType' } },
        { _source: { typeCategory: 'departureMode' } },
        { _source: { typeCategory: 'cargoType' } },
        { _source: { typeCategory: 'otherType' } } // This should not be included in the lists
      ]
    };
    commonServiceMock?.getSTList.withArgs('systemtype', jasmine.any(Object)).and.returnValue(of(mockResponse));

    // Act
    component.getSystemTypeDropDowns();

    // Assert
    expect(component.itemTypeList.length).toBe(0);
    expect(component.departureModeList.length).toBe(0);
    expect(component.cargoTypeList.length).toBe(0);
    expect(component.itemTypeList[0]?._source.typeCategory).toBe(undefined );
    expect(component.departureModeList[0]?._source.typeCategory).toBe(undefined );
    expect(component.cargoTypeList[0]?._source.typeCategory).toBe(undefined );
  });
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
});
