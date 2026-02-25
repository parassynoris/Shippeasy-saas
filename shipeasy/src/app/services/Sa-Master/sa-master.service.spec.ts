import { TestBed } from '@angular/core/testing';

import { SaMasterService } from './sa-master.service';
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
describe('SaMasterService', () => {
  let service: SaMasterService;
  let mockCognitoService: jasmine.SpyObj<CognitoService>
  let httpMock: HttpTestingController;
  const baseUrlMaster = 'https://synoris-ship.azurewebsites.net/api/';
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule,NzNotificationModule,RouterTestingModule,RouterModule,RouterModule.forRoot([])],
    });
    service = TestBed.inject(SaMasterService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
         
});