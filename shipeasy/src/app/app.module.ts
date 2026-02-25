import { User } from './services/Masters/masters';
import { NgModule, ErrorHandler } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule, Routes } from '@angular/router';
import { LayoutModule } from './layout/layout.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ApiInterceptor } from '../app/services/api.interceptor';
import { registerLocaleData, CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import en from '@angular/common/locales/en';
registerLocaleData(en);
import { LoadercircleComponent } from './shared/components/loadercircle/loadercircle.component';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NotificationComponent } from './admin/notification/notification.component';
import { ChangepasswordComponent } from './admin/changepassword/changepassword.component';
import { LoaderService } from './services/loader.service';
import { CognitoService } from './services/cognito.service';
import { CommonService } from './shared/services/common.service';
import { ScmtrComponent } from './admin/scmtr/scmtr.component';
import { lightTheme } from 'src/theme/theme/light-theme';
import { darkTheme } from 'src/theme/theme/dark-theme';
import { ThemeModule } from 'src/theme/theme/theme.module';
import { environment } from 'src/environments/environment';
import { MessagingService } from './services/messaging.service';
import { FAQsComponent } from './admin/faqs/faqs.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { OrderByPipe } from './shared/util/sort';
import { AutofillComponent } from './auth/autofill/autofill.component';
import { MaterialModule } from './admin/material/material.module';
import { MastersSortPipe } from './shared/util/mastersort';
import { SharedModule } from "./shared/shared.module";
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { SideStickyMenuComponent } from './side-sticky-menu/side-sticky-menu.component';
import { BrowserModule } from '@angular/platform-browser';
import { ApmModule, ApmService } from '@elastic/apm-rum-angular';
import { ApmErrorHandler } from '@elastic/apm-rum-angular';
import { UsermanualComponent } from './admin/batch/usermanual/usermanual.component';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    OrderByPipe, MastersSortPipe,
    AppComponent,
    NotificationComponent,
    ChangepasswordComponent,
    UsermanualComponent,
    LoadercircleComponent,
    ScmtrComponent,
    FAQsComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    AutofillComponent,
    SideStickyMenuComponent,
  ],
  providers: [
    DatePipe,
    { provide: HTTP_INTERCEPTORS, useClass: ApiInterceptor, multi: true },
    OrderByPipe, MastersSortPipe,
    LoaderService, CognitoService, CommonService, MessagingService, DecimalPipe, ApmService,
    { provide: NZ_I18N, useValue: en_US },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    { provide: ErrorHandler, useClass: ApmErrorHandler }
  ],
  bootstrap: [AppComponent],
  imports: [
    AppRoutingModule,
    ThemeModule.forRoot({
      themes: [lightTheme, darkTheme],
      active: 'light',
    }),
    ApmModule,
    BrowserModule,
    LayoutModule,
    NgbModule,
    BrowserAnimationsModule,
    CommonModule,
    NgMultiSelectDropDownModule,
    DragDropModule,
    NzSelectModule,
    NzDatePickerModule,
    NzPopoverModule,
    NgxSkeletonLoaderModule,
    FormsModule, ReactiveFormsModule,
    MaterialModule,
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    SharedModule
  ]
})
export class AppModule {
  constructor(service: ApmService, private cognito: CognitoService) {
    const apm = service.init({
      serviceName: 'shipeasy-web',
      environment: environment.environment,
      serverUrl: environment.serverUrl
    });

    const userDetails = this.cognito.getUserDatails();
    if (userDetails) {
      userDetails.subscribe((userData) => {
        apm.setUserContext({
          'username': userData?.userData?.userName,
          'id': userData?.userData?.userId
        });
      });
    }
  }
}
