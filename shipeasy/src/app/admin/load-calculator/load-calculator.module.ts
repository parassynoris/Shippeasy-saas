import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoadCalculatorRoutingModule } from './load-calculator-routing.module';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/admin/material/material.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxPrintModule } from 'ngx-print';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { LoadCalculatorComponent } from './load-calculator.component';


@NgModule({
  declarations: [
    LoadCalculatorComponent
  ],
  imports: [
    CommonModule,
    LoadCalculatorRoutingModule,
    CommonModule,
    RouterModule,
    FormsModule,
    MaterialModule,
    ReactiveFormsModule,
    NgbModule,
    SharedModule,
    NgxPrintModule,
    NzDatePickerModule,
    NzNotificationModule,
    NzToolTipModule,
    NgxChartsModule
  ]
})
export class LoadCalculatorModule { }
