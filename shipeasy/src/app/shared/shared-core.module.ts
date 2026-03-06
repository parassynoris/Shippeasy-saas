import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MaterialModule } from '../admin/material/material.module';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

import { SortDirective } from './directive/sort.directive';
import { BackbuttonDirective } from './directive/backbutton.directive';
import { AccessControlDirective } from './directive/access-control.directive';
import { AccessFeatureDirective } from './directive/access-feature.directive';
import { DecimalInputDirective } from './directive/DecimalInputDirective';
import { CapitalizeFirstDirective } from './directive/capitalize-first.directive';
import { CopyClipboardDirective } from './directive/copy-clipboard.directive';

import { SortPipe } from './components/pipes/sort.pipe';
import { CustomCurrencyPipe } from './pipes/custom-currency.pipe';
import { currencyPipeCutomer } from './pipes/customcurrency.pipe';
import { capitalizesPipe } from './pipes/capitalizes.pipe';
import { customFormat } from '../services/common/custome-format';
import { FetchRecordByIdPipe, FilterByFlagPipe, FilterByTypePipe } from './pipes/startwith.pipe';
import { FilterShipperPipe, FilterLCLShipperPipe } from './pipes/filter-shipper.pipe';

import { TableFiltersComponent } from './components/table-filters/table-filters.component';
import { NotificationComponent } from './components/notification/notification.component';
import { LabelsComponent } from './components/labels/labels.component';
import { SettingsComponent } from './components/settings/settings.component';
import { AuditLogsComponent, PrettyLabelPipe } from './components/audit-logs/audit-logs.component';
import { CommonDialogBoxComponent } from './components/common-dialog-box/common-dialog-box.component';
import { ConfirmationModalComponent } from '../auth/confirmation-modal.component';
import { LogoutmessageComponent } from '../auth/logoutmessage.component';
import { DiscussionComponent } from './components/discussion/discussion.component';
import { CheckListComponent } from './components/check-list/check-list.component';
import { MailsendComponent } from './components/document/mailsend/mailsend.component';
import { MailTemplateComponent } from './components/mail-template/mail-template.component';
import { AddMailTemplateComponent } from './components/mail-template/add-mail-template/add-mail-template.component';
import { EmailTabComponent } from './components/email-tab/email-tab.component';
import { TicketComponent } from './components/ticket/ticket.component';
import { SignaturePadComponent } from './components/signature-pad/signature-pad.component';

import { CommonService } from './services/common.service';
import { CognitoService } from '../services/cognito.service';
import { LoaderService } from '../services/loader.service';
import { DatePipe } from '@angular/common';

const SHARED_MODULES = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  TranslateModule,
  HttpClientModule,
  NzNotificationModule,
  NzAutocompleteModule,
  NzSelectModule,
  NzToolTipModule,
  NzTabsModule,
  NgxSkeletonLoaderModule,
  MatTooltipModule,
  MaterialModule,
  CKEditorModule,
];

const DIRECTIVES = [
  SortDirective,
  BackbuttonDirective,
  AccessControlDirective,
  AccessFeatureDirective,
  DecimalInputDirective,
  CapitalizeFirstDirective,
  CopyClipboardDirective,
];

const PIPES = [
  SortPipe,
  CustomCurrencyPipe,
  currencyPipeCutomer,
  capitalizesPipe,
  customFormat,
  FetchRecordByIdPipe,
  FilterByFlagPipe,
  FilterByTypePipe,
  FilterShipperPipe,
  FilterLCLShipperPipe,
  PrettyLabelPipe,
];

const CORE_COMPONENTS = [
  TableFiltersComponent,
  NotificationComponent,
  LabelsComponent,
  SettingsComponent,
  AuditLogsComponent,
  CommonDialogBoxComponent,
  ConfirmationModalComponent,
  LogoutmessageComponent,
  DiscussionComponent,
  CheckListComponent,
  MailsendComponent,
  MailTemplateComponent,
  AddMailTemplateComponent,
  EmailTabComponent,
  TicketComponent,
  SignaturePadComponent,
];

@NgModule({
  imports: [...SHARED_MODULES],
  declarations: [...DIRECTIVES, ...PIPES, ...CORE_COMPONENTS],
  exports: [
    ...SHARED_MODULES,
    ...DIRECTIVES,
    ...PIPES,
    ...CORE_COMPONENTS,
  ],
  providers: [
    CommonService,
    LoaderService,
    CognitoService,
    DatePipe,
    SortPipe,
  ],
})
export class SharedCoreModule {}
