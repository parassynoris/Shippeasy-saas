import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { LayoutRoutingModule } from './layout-routing.module';
import { HeaderComponent } from './header/header.component';
import { MainComponent } from './main/main.component';
import { NavComponent } from './nav/nav.component';
import { FooterComponent } from './footer/footer.component';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
 import { FormsModule, ReactiveFormsModule} from '@angular/forms';

import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {HttpClient, HttpClientModule, } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { LoginComponent } from '../auth/login/login.component';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { MobileviewComponent } from '../admin/mobileview/mobileview/mobileview.component';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatToolbarModule} from '@angular/material/toolbar';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { RegistrationComponent } from '../auth/registration/registration.component';
import { NeedhelpModule } from './needhelp/needhelp.module';
import { SharedModule } from '../shared/shared.module';
import { ChatComponent } from './chat/chat.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { HelpComponent } from './help/help.component'; 
import { ContactUsComponent } from './contact-us/contact-us.component';
import { PagenotfoundModule } from './pagenotfound/pagenotfound.module';
import { ReminderPopUpComponent } from '../shared/components/reminder-pop-up/reminder-pop-up.component';
import { DashboardModule } from '../admin/dashboard/dashboard.module';
import { EnquiryModule } from '../admin/enquiry/enquiry.module';
import { GroupChatComponent } from './group-chat/group-chat.component';
import { NewChatComponent } from './new-chat/new-chat.component';


// export function init_app(cognito: CognitoService) {
//   return () => cognito.checklogin();
// }

// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [

    ReminderPopUpComponent,
    HeaderComponent,
    NavComponent,
    MainComponent,
    FooterComponent,
    LoginComponent,
    MobileviewComponent,
    RegistrationComponent,
    ChatComponent,
    PrivacyComponent,
    HelpComponent, 
    ContactUsComponent, GroupChatComponent, NewChatComponent
  ],
  imports: [
    EnquiryModule,
    DashboardModule,
    PagenotfoundModule,
    BrowserModule,
    LayoutRoutingModule,
    RouterModule,
    NgbModule,
    NzSelectModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NzNotificationModule,
    NzPopoverModule,
    MatFormFieldModule,
    MatToolbarModule,
    SharedModule,
    NeedhelpModule,
    // ngx-translate and the loader module
    HttpClientModule,
    TranslateModule.forRoot({
        loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
        }
    })
  ],
  exports: [
    ReminderPopUpComponent,
    HeaderComponent,
    NavComponent,
    MainComponent,
    FooterComponent,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    LoginComponent,
    NzNotificationModule,
    MatFormFieldModule,
    MatToolbarModule,
    NzPopoverModule ,
    RegistrationComponent ,PrivacyComponent,
    HelpComponent, 
    ContactUsComponent
  ],
})
export class LayoutModule { }
