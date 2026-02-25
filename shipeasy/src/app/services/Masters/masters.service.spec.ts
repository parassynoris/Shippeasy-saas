import { TestBed } from '@angular/core/testing';

import { MastersService } from './masters.service';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe} from '@angular/common';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { CognitoService } from 'src/app/services/cognito.service';
import { RouterTestingModule } from '@angular/router/testing';
import * as Constant from 'src/app/shared/common-constants';
import { environment } from 'src/environments/environment';

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
describe('MastersService', () => {
  let service: MastersService;
  let mockCognitoService: jasmine.SpyObj<CognitoService>
  let httpMock: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers:[{provide:CognitoService,useValue:mockCognitoService}],
      imports: [HttpClientTestingModule,NzNotificationModule,RouterTestingModule,RouterModule,RouterModule.forRoot([])],
    });
    service = TestBed.inject(MastersService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should retrieve location list', () => {
    const mockData = [{ id: 1, name: 'Location 1' }, { id: 2, name: 'Location 2' }];

    service.locationList({}).subscribe(locations => {
      expect(locations).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${environment.baseUrlMaster}master/list?type=location`);
    expect(req.request.method).toEqual('POST');

    req.flush(mockData);
  });


  it('should successfully delete a product', () => {
    const productId = '123';

    service.deleteProduct(productId).subscribe(response => {
      expect(response).toBeDefined();
      // Add assertions as needed
    });

    const req = httpMock.expectOne(`${environment.baseUrlMaster}master/product/delete`);
    expect(req.request.method).toEqual('POST');
    req.flush({}); // Mock response data
  });


  it('should successfully delete a cost item', () => {
    const costItemId = '456';

    service.deleteCostItem(costItemId).subscribe(response => {
      expect(response).toBeDefined();
      // Add assertions as needed
    });

    const req = httpMock.expectOne(`${environment.baseUrlMaster}master/costitem/delete`);
    expect(req.request.method).toEqual('POST');
    req.flush({}); // Mock response data
  });
  it('should successfully retrieve the list of services', () => {
    const mockServices = [{ id: 1, name: 'Service 1' }, { id: 2, name: 'Service 2' }];

    service.servicesList({}).subscribe(services => {
      expect(services).toEqual(mockServices);
    });

    const req = httpMock.expectOne(`${environment.baseUrlMaster}master/list?type=service`);
    expect(req.request.method).toEqual('POST');
    req.flush(mockServices);
  });

  it('should successfully create a new system type', () => {
    const newSystemType = { name: 'New System Type', description: 'Description of new system type' };

    service.createSystemType(newSystemType).subscribe(response => {
      expect(response).toBeDefined();
      expect(response.name).toEqual(newSystemType.name);
    });

    const req = httpMock.expectOne(`${environment.baseUrlMaster}master/systemtype`);
    expect(req.request.method).toEqual('POST');
    req.flush({ id: 1, ...newSystemType });
  });

  it('should successfully update a vessel', () => {
    const updateData = { id: '123', name: 'Updated Vessel', description: 'Updated description' };

    service.updateVessel(updateData).subscribe(response => {
      expect(response).toBeDefined();
      expect(response.name).toEqual(updateData.name);
    });

    const req = httpMock.expectOne(`${environment.baseUrlMaster}master/vessel/update`);
    expect(req.request.method).toEqual('POST');
    req.flush({ ...updateData });
  });
});