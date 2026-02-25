import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';

import { BookingTrackingRoutingModule } from './booking-tracking-routing.module';
import { ConatinerTrackComponent } from 'src/app/admin/batch/batch-detail/tank/container-track/container-track.component';
import { SearchFilterPipe } from 'src/app/shared/components/vendor-bill/new-vendor-bill/new-vendor-bill.component';
import { FilterPipe } from 'src/app/shared/components/route/route.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxPrintModule } from 'ngx-print';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { MaterialModule } from 'src/app/admin/material/material.module';



@NgModule({
  declarations: [ConatinerTrackComponent],
  imports: [
    CommonModule,
    BookingTrackingRoutingModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    CommonModule,
    SharedModule,
    NgxPrintModule,
    NzDatePickerModule,
    NzNotificationModule,
    NzToolTipModule,
    NgMultiSelectDropDownModule.forRoot(),
    MaterialModule
  ],
  exports: [ConatinerTrackComponent]
  ,providers: [SearchFilterPipe,DatePipe,FilterPipe,CurrencyPipe],
})
export class BookingTrackingModule { }
