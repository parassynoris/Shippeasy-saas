import { NO_ERRORS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigurationRoutingModule } from './configuration-routing.module';
import { ConfigurationComponent } from './configuration.component';
import { NgxPrintModule } from 'ngx-print';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { TranslateModule } from '@ngx-translate/core';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { ArchwizardModule } from 'angular-archwizard';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { SharedModule } from '../../shared/shared.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { HttpClientModule } from '@angular/common/http';
import { TariffListComponent } from './tariff-list/tariff-list.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { RouterModule } from '@angular/router';


@NgModule({
  schemas: [NO_ERRORS_SCHEMA],
  declarations: [ConfigurationComponent, TariffListComponent],
  imports: [
    CommonModule,
    ConfigurationRoutingModule,
    SharedModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NzToolTipModule,
    ArchwizardModule,
    NgxPrintModule,
    NzDatePickerModule,
    TranslateModule,
    NzNotificationModule,
    NzAutocompleteModule,
    NzSelectModule,
    PdfViewerModule,
    NgMultiSelectDropDownModule,
    NzCollapseModule,
    NzTimePickerModule,
    NzBadgeModule

  ]
})
export class ConfigurationModule { }
