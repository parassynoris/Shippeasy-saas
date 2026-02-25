import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { of, throwError } from 'rxjs';
import { WelcomepageComponent } from './welcomepage.component';
import { CommonService } from 'src/app/services/common/common.service';
import { LoaderService } from 'src/app/services/loader.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { ApiService } from '../../principal/api.service';
import { Router, ActivatedRoute } from '@angular/router';

describe('WelcomepageComponent', () => {
  let component: WelcomepageComponent;
  let fixture: ComponentFixture<WelcomepageComponent>;
  let mockRouter = { navigate: jasmine.createSpy('navigate') };
  let mockModalService = { dismissAll: jasmine.createSpy('dismissAll') };
  let mockLoaderService = { showcircle: jasmine.createSpy('showcircle'), hidecircle: jasmine.createSpy('hidecircle') };
  let mockCommonService = { filterList: jasmine.createSpy('filterList').and.returnValue({}), getSTList1: jasmine.createSpy('getSTList1').and.returnValue(of([])) };
  let mockCommonFunctions = { getAgentDetails: jasmine.createSpy('getAgentDetails').and.returnValue({ userId: 1, agentId: 2 }) };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WelcomepageComponent],
      imports: [RouterTestingModule, NgbModule],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: NgbModal, useValue: mockModalService },
        { provide: LoaderService, useValue: mockLoaderService },
        { provide: CommonService, useValue: mockCommonService },
        { provide: CommonFunctions, useValue: mockCommonFunctions },
        { provide: ApiService, useValue: {} },
        { provide: ActivatedRoute, useValue: { snapshot: { params: { id: 1 } } } }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomepageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch profile completeness on init', () => {
    const spy = spyOn(component, 'getProfileCompleteness').and.callThrough();
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });

  it('should call commonService.getSTList1 and handle response successfully', () => {
    const mockResponse = [{ completeness: 100 }];
    mockCommonService.getSTList1.and.returnValue(of(mockResponse));

    component.getProfileCompleteness();

    expect(mockCommonService.getSTList1).toHaveBeenCalledWith('profileCompletion', jasmine.any(Object));
    expect(component.profileData).toEqual(mockResponse);
    expect(component.loader).toBeFalse();
    expect(mockLoaderService.hidecircle).toHaveBeenCalled();
  });

  it('should handle error response from commonService.getSTList1', () => {
    mockCommonService.getSTList1.and.returnValue(throwError('error'));

    component.getProfileCompleteness();

    expect(component.loader).toBeFalse();
    expect(mockLoaderService.hidecircle).toHaveBeenCalled();
  });

  it('should navigate to the correct route on navigateTo', () => {
    component.navigateTo('companyprofile', 1);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['register'], { queryParams: { childUserList: 'yes' } });
    expect(mockModalService.dismissAll).toHaveBeenCalled();
  });
  it('should initialize isProductList and isTemplateList to true', () => {
    expect(component.isProductList).toBeTrue();
    expect(component.isTemplateList).toBeTrue();
  });

  it('should set loader to true and call showcircle on getProfileCompleteness', () => {
    component.getProfileCompleteness();
    expect(component.loader).toBe(false);
    expect(mockLoaderService.showcircle).toHaveBeenCalled();
  });

  it('should correctly set payload for getSTList1 call in getProfileCompleteness', () => {
    const expectedPayload = {
      query: { userId: 1 }
    };

    component.getProfileCompleteness();

    expect(mockCommonService.filterList).toHaveBeenCalled();
    expect(mockCommonService.getSTList1).toHaveBeenCalledWith('profileCompletion', expectedPayload);
  });

  it('should navigate to branch with correct route and agentId', () => {
    component.navigateTo('branch', 1);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['register/2/branch'], {});
    expect(mockModalService.dismissAll).toHaveBeenCalled();
  });

  it('should navigate to role without queryParams', () => {
    component.navigateTo('role', 1);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['master/roles'], {});
    expect(mockModalService.dismissAll).toHaveBeenCalled();
  });

  it('should correctly form the payload and handle profile completeness response', () => {
    const mockResponse = [{ completeness: 100 }];
    mockCommonService.getSTList1.and.returnValue(of(mockResponse));

    component.getProfileCompleteness();

    expect(component.profileData).toEqual(mockResponse);
    expect(component.loader).toBeFalse();
    expect(mockLoaderService.hidecircle).toHaveBeenCalled();
  });

  it('should handle navigation to vessel correctly', () => {
    component.navigateTo('vessel', 1);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['master/VesselMaster'], {});
    expect(mockModalService.dismissAll).toHaveBeenCalled();
  });

  it('should set profileData correctly on successful getProfileCompleteness', () => {
    const mockProfileData = [{ name: 'Profile1' }];
    mockCommonService.getSTList1.and.returnValue(of(mockProfileData));

    component.getProfileCompleteness();

    expect(component.profileData).toEqual(mockProfileData);
  });

  it('should navigate to shippingline correctly', () => {
    component.navigateTo('shippingline', 1);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['master/shipping-line'], {});
    expect(mockModalService.dismissAll).toHaveBeenCalled();
  });


});