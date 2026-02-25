import { NgModule } from '@angular/core';
import { CommonModule, DatePipe,CurrencyPipe } from '@angular/common';

import { BatchRoutingModule } from './batch-routing.module';
import { BatchComponent } from './batch.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {NgxPrintModule} from 'ngx-print';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AddBatchComponent } from './add-batch/add-batch.component';
import { BatchDetailsComponent, FilterPipe } from './batch-detail/batch-detail.component';

import { SharedModule } from '../../shared/shared.module';
import { SIComponent } from './si/si.component';
import { OpsAdditionalComponent } from './ops-additional/ops-additional.component';
import { TankComponent } from './batch-detail/tank/tanks.component';
import { AddContainerComponent } from './batch-detail/tank/add-container/add-container.component';
import { InvoicesComponent } from './batch-detail/invoices/invoices.component';
import { NewinvoiceComponent, SearchFilterPipe } from './batch-detail/invoices/newinvoice/newinvoice.component';
import { DetentionInvoiceComponent } from './batch-detail/invoices/detention-invoice/detention-invoice.component';
import { DestinationComponent } from './batch-detail/destination/destination.component';
import { PrincipleBillComponent } from './batch-detail/principle-bill/principle-bill.component';
import { AddBillComponent } from './batch-detail/principle-bill/add-bill/add-bill.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { MaterialModule } from '../material/material.module';
import { BookingTrackingModule } from '../customer/booking/booking-tracking/booking-tracking/booking-tracking.module'; 
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSidenavModule} from '@angular/material/sidenav';
import { FinanceModule } from '../finance/finance.module';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { LorrayTableComponent } from './batch-detail/lorray-table/lorray-table.component';
import { ApiProgressBarComponent } from './api-progress-bar/api-progress-bar.component';
import { BatchBackupComponent } from './batch-backup/batch-backup.component';
import { WhatsNewComponent } from './whats-new/whats-new.component';

// import { ConatinerTrackComponent } from './batch-detail/tank/container-track/container-track.component'; 

@NgModule({
  declarations: [
    SearchFilterPipe,
    BatchComponent,
    AddBatchComponent ,
    BatchDetailsComponent,
    SIComponent,
    OpsAdditionalComponent,
    TankComponent,
    AddContainerComponent,
    InvoicesComponent,
    NewinvoiceComponent,
    DetentionInvoiceComponent,
    DestinationComponent,
    FilterPipe,
    PrincipleBillComponent,
    AddBillComponent,
    LorrayTableComponent,
    ApiProgressBarComponent,
    BatchBackupComponent,
    WhatsNewComponent,
    // ConatinerTrackComponent,
  ],
  imports: [
    MatSidenavModule, MatFormFieldModule, MatSelectModule, MatButtonModule,
    BatchRoutingModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    CommonModule,
    BookingTrackingModule,
    SharedModule,
    NgxPrintModule,
    NzDatePickerModule,
    NzNotificationModule,
    NzToolTipModule,
    NgMultiSelectDropDownModule.forRoot(),
    MaterialModule,
    NzPopoverModule,
    NzIconModule,
    FinanceModule
    
  ],
  exports:[
    SIComponent,
    TankComponent,
    DestinationComponent,
    NewinvoiceComponent
  ],
  providers: [SearchFilterPipe,DatePipe,FilterPipe,CurrencyPipe],
  bootstrap: []
})
export class BatchModule { }
