import { TestBed } from '@angular/core/testing';

import { ThemeService } from './theme.service';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe} from '@angular/common';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { CognitoService } from 'src/app/services/cognito.service';
import { RouterTestingModule } from '@angular/router/testing';
import * as Constant from 'src/app/shared/common-constants';
import { THEMES,ACTIVE_THEME,Theme  } from './theme/symbols';

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
describe('ThemeService', () => {
  let service: ThemeService;
  let mockCognitoService: jasmine.SpyObj<CognitoService>
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers:[{provide:CognitoService,useValue:mockCognitoService,
      },ThemeService,
      { provide: THEMES, useValue: [] },{ provide: ACTIVE_THEME, useValue: 'light' } ],
      imports: [HttpClientTestingModule,NzNotificationModule,RouterTestingModule,RouterModule,RouterModule.forRoot([])],
    });
    service = TestBed.inject(ThemeService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should return active theme', () => {
    const themes: Theme[] = [
      { name: 'light', properties: { '--background-color': '#ffffff', '--text-color': '#000000' } },
      { name: 'dark', properties: { '--background-color': '#000000', '--text-color': '#ffffff' } }
    ];
    service.themes = themes;
    service.theme = 'dark';
    expect(service.getActiveTheme()).toEqual(themes[1]);
  });

  it('should throw error when active theme not found', () => {
    const themes: Theme[] = [
      { name: 'light', properties: { '--background-color': '#ffffff', '--text-color': '#000000' } },
      { name: 'dark', properties: { '--background-color': '#000000', '--text-color': '#ffffff' } }
    ];
    service.themes = themes;
    service.theme = 'nonexistent';
    expect(() => service.getActiveTheme()).toThrowError("Theme not found: 'nonexistent'");
  });

  it('should emit theme change event', () => {
    const themes: Theme[] = [
      { name: 'light', properties: { '--background-color': '#ffffff', '--text-color': '#000000' } },
      { name: 'dark', properties: { '--background-color': '#000000', '--text-color': '#ffffff' } }
    ];
    service.themes = themes;
    service.theme = 'light';
    let emittedTheme: Theme | undefined;
    service.themeChange.subscribe(theme => emittedTheme = theme);
    service.setTheme('dark');
    expect(emittedTheme).toEqual(themes[1]);
  });
});