import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe} from '@angular/common';
import { CommonService } from 'src/app/services/common/common.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { CognitoService } from '../cognito.service';


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

describe('CommonService', () => {
  let service: CommonService;
  let mockCognitoService: jasmine.SpyObj<CognitoService>
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers:[{provide:CognitoService,useValue:mockCognitoService}],
      imports: [HttpClientTestingModule,NzNotificationModule,RouterModule,RouterModule.forRoot([])],
    });
    service = TestBed.inject(CommonService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should handle errors properly in errorHandler method', () => {
    const mockError = new ErrorEvent('Network error', {
      message: 'Failed to fetch'
    });
    const result = service.errorHandler(mockError);
  });

  it('should properly format date for Excel/PDF', () => {
    const inputDate = new Date('2022-04-20');
    const formattedDate = service.formatDateForExcelPdf(inputDate);
    expect(formattedDate).toBe('20-04-2022'); // Or any other expectation
  });

  it('should properly handle the refreshreq Subject', () => {
    const subject = service.refreshreq;
    expect(subject).toBeTruthy(); // Ensure the Subject is defined
    // Test other behaviors of the Subject if applicable
  });

  it('should correctly filter list using filterList method', () => {
    const filteredList = service.filterList();
    // Assert on the properties of the filtered list object
    expect(filteredList).toBeTruthy(); // Or any other expectations
  });

  // it('should properly handle uploading and downloading files', async () => {
  //   const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
  //   const response = await service.uploadFile(file, 'test.pdf', 'folder');

  //   // Assert on the response from upload
  //   expect(response).toBeTruthy(); // Or any other expectations
  // });

  it('should properly handle date formatting for Excel/PDF', () => {
    const formattedDate = service.formatDateForExcelPdf(new Date('2024-04-15'));
    // Assert on the formatted date
    expect(formattedDate).toBe('15-04-2024');
  });

});
