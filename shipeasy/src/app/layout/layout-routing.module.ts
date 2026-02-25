import { LoginComponent } from './../auth/login/login.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';
// import { SearchComponent } from '../admin/vendor/search/search.component';
import { AuthGuard } from '../Guard/auth.guard';
import { ApplicationComponent } from '../admin/application/application.component';
import { NotificationComponent } from '../admin/notification/notification.component';
import { ChangepasswordComponent } from '../admin/changepassword/changepassword.component';
import { AuthGuardLoginGuard } from '../Guard/auth-guard-login.guard';
import { MobileviewComponent } from '../admin/mobileview/mobileview/mobileview.component';
import { FAQsComponent } from '../admin/faqs/faqs.component';
import { ForgotPasswordComponent } from '../auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from '../auth/reset-password/reset-password.component';
import { AutofillComponent } from '../auth/autofill/autofill.component';
import { AuthGuardCustomer } from '../Guard/Auth-Guard-Customer.guard';
import { RegistrationComponent } from '../auth/registration/registration.component';
import { UsermanualComponent } from '../admin/batch/usermanual/usermanual.component';
import { WhatsNewComponent } from '../admin/batch/whats-new/whats-new.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [AuthGuardLoginGuard] },
  { path: 'registration', component: RegistrationComponent },
  { path: 'autofill', component: AutofillComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'web-form', loadChildren: () => import('../admin/web-form/web-form.module').then(m => m.WebFormModule) },
  { path: 'not-found', loadChildren: () => import('../layout/pagenotfound/pagenotfound.module').then((m) => m.PagenotfoundModule) },
  // { path: 'not-found', loadChildren: () => import('../layout/pagenotfound/pagenotfound.module').then((m) => m.PagenotfoundModule) }, // Optional: Custom 404 page
  // { path: '**', redirectTo: '/not-found', pathMatch: 'full' }, 
  {
    path: '',
    component: MainComponent,
    children: [
      { path: 'profile', loadChildren: () => import('../admin/userpofile/userpofile.module').then((m) => m.UserPofileModule), canActivate: [AuthGuard] },
      { path: 'notification', component: NotificationComponent, canActivate: [AuthGuard] },
      { path: 'FAQs', component: FAQsComponent, canActivate: [AuthGuard] },
      { path: 'changepass', component: ChangepasswordComponent, canActivate: [AuthGuard] },
      { path: 'usermanual', component: UsermanualComponent, canActivate: [AuthGuard] },
      { path: 'whatsnew', component: WhatsNewComponent, canActivate: [AuthGuard] },
      { path: 'application', component: ApplicationComponent, canActivate: [AuthGuard] },
      { path: 'mobileview', component: MobileviewComponent, canActivate: [AuthGuard] },
      { path: 'master', loadChildren: () => import('../admin/master/master.module').then((m) => m.MasterModule), canActivate: [AuthGuard] },
      { path: 'manifest', loadChildren: () => import('../admin/manifest/manifest.module').then((m) => m.ManifestModule), canActivate: [AuthGuard] },
      { path: 'register', loadChildren: () => import('../admin/smartagent/smartagent.module').then((m) => m.SmartagentModule), canActivate: [AuthGuard] },
      { path: 'enquiry', loadChildren: () => import('../admin/enquiry/enquiry.module').then((m) => m.EnquiryModule), canActivate: [AuthGuard] },
      { path: 'batch', loadChildren: () => import('../admin/batch/batch.module').then((m) => m.BatchModule), canActivate: [AuthGuard] },
      { path: 'finance', loadChildren: () => import('../admin/finance/finance.module').then((m) => m.FinanceModule), canActivate: [AuthGuard] },
      { path: 'agent-advice', loadChildren: () => import('../admin/agent-advise/agent-advise.module').then(m => m.AgentAdviseModule), canActivate: [AuthGuard] },
      { path: 'application', loadChildren: () => import('../admin/application/application.module').then(m => m.ApplicationModule), canActivate: [AuthGuard] },
      { path: 'configuration', loadChildren: () => import('../admin/configuration/configuration.module').then(m => m.ConfigurationModule), canActivate: [AuthGuard] },
      { path: 'scmtr', loadChildren: () => import('../admin/scmtr/scmtr.module').then((m) => m.ScmtrModule), canActivate: [AuthGuard] },
      { path: 'dashboard', loadChildren: () => import('../admin/dashboard/dashboard.module').then(m => m.DashboardModule), canActivate: [AuthGuard] },
      { path: 'reports/st-reports', loadChildren: () => import('../admin/reports/Boldreports.module').then(m => m.boldReportsModule), canActivate: [AuthGuard] },
      { path: 'egm', loadChildren: () => import('../admin/egm/egm.module').then(m => m.EgmModule), canActivate: [AuthGuard] },
      { path: 'igm', loadChildren: () => import('../admin/igm/igm.module').then(m => m.IgmModule), canActivate: [AuthGuard] },
      { path: 'smart-documents', loadChildren: () => import('../admin/smart-documents/smart-documents.module').then(m => m.SmartDocumentsModule), canActivate: [AuthGuard] },
      { path: 'carrier-bookings', loadChildren: () => import('../admin/carrier-booking/carrier-booking.module').then(m => m.CarrierBookingModule), canActivate: [AuthGuard] },
      { path: 'rate-finder', loadChildren: () => import('../admin/rate-finder/rate-finder.module').then(m => m.RateFinderModule), canActivate: [AuthGuard] },
      { path: 'load-calc', loadChildren: () => import('../admin/load-calculator/load-calculator.module').then(m => m.LoadCalculatorModule), canActivate: [AuthGuard] },
      { path: 'address-book', loadChildren: () => import('../../app/admin/party-master/party-master.module').then(m => m.PartyMasterModule), canActivate: [AuthGuard] },
      { path: 'consolidation-booking', loadChildren: () => import('../../app/shared/components/consolidation-booking/consolidation-booking.module').then(m => m.ConsolidationBookingModule), canActivate: [AuthGuard] },
      { path: 'lr', loadChildren: () => import('../../app/shared/components/lorry-receipt-table/lorry-receipt.module').then(m => m.LorryBookingModule), canActivate: [AuthGuard] },
      { path: 'warehouse', loadChildren: () => import('../../app/shared/components/sa-masters/ware-house/ware-house/ware-house.module').then(m => m.WareHouseModule), canActivate: [AuthGuard] },
      { path: 'faq', loadChildren: () => import('../../app/shared/components/sa-masters/faq/faq.module').then(m => m.FaqModule), canActivate: [AuthGuard] },
      { path: 'support', loadChildren: () => import('../../app/layout/support/support.module').then(m => m.SupportModule), canActivate: [AuthGuard] },
      { path: 'payment-confirmation', loadChildren: () => import('../admin/payment-confirmation/payment-confirmation.module').then(m => m.PaymentConfirmationModule), canActivate: [AuthGuard] },
      { path: 'rfq', loadChildren: () => import('../admin/transport/transport.module').then(m => m.TransportModule), canActivate: [AuthGuard] },
      { path: 'customer', loadChildren: () => import('../admin/customer/customer.module').then(m => m.CustomerModule), canActivate: [AuthGuardCustomer] },
      { path: 'release/manager', loadChildren: () => import('../release-manager/release-manager.module') .then(m => m.ReleaseManagerModule), canActivate: [AuthGuard] }

    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes),
  ],
  exports: [RouterModule]
})
export class LayoutRoutingModule { }
