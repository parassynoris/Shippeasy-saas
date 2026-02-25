import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransportComponent } from './transport.component';
import { TransportRoutingModule } from './transport-routing.module';

 
import {NgxPrintModule} from 'ngx-print';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
 
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { MatSortModule } from '@angular/material/sort'; 
import { SharedModule } from '../../shared/shared.module';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { MaterialModule } from '../material/material.module';
import { TransportDetailsComponent } from './transport-details/transport-details.component';

@NgModule({
  declarations: [
    TransportComponent,
    TransportDetailsComponent
  ],
  imports: [
    CommonModule,
    TransportRoutingModule,
    RouterModule,
    FormsModule,
    MatSortModule,
    ReactiveFormsModule,
    NgbModule, 
    SharedModule,
    NgxPrintModule,
    NzDatePickerModule,
    NzNotificationModule,
    NzToolTipModule,
    NzCollapseModule,
    MaterialModule,
  ]
})
export class TransportModule { }
