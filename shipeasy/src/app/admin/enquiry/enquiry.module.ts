import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import {NgxPrintModule} from 'ngx-print';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzNotificationModule } from 'ng-zorro-antd/notification';

import { EnquiryRoutingModule } from './enquiry-routing.module';
import { EnquiryComponent } from './enquiry.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { MatSortModule } from '@angular/material/sort';
import { AddEnquiryComponent } from './add-enquiry/add-enquiry.component';
import { SharedModule } from '../../shared/shared.module';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { MaterialModule } from '../material/material.module';
// import { FetchRecordByIdPipe } from 'src/app/shared/pipes/startwith.pipe';

@NgModule({
  declarations: [
    EnquiryComponent,
    AddEnquiryComponent,
  ],
  imports: [
    EnquiryRoutingModule,
    RouterModule,
    FormsModule,
    MatSortModule,
    ReactiveFormsModule,
    NgbModule,
    CommonModule,
    SharedModule,
    NgxPrintModule,
    NzDatePickerModule,
    NzNotificationModule,
    NzToolTipModule,
    NzCollapseModule,
    MaterialModule,
    // FetchRecordByIdPipe 
   ], 
  providers: [CurrencyPipe,EnquiryComponent],
  bootstrap: []
})
export class EnquiryModule { }
