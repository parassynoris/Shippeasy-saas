import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { NgModule } from '@angular/core';
import {NgxPrintModule} from 'ngx-print';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzNotificationModule } from 'ng-zorro-antd/notification';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { SharedModule } from '../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { WelcomepageComponent } from './welcomepage/welcomepage.component';

@NgModule({
  declarations: [
    DashboardComponent,
    WelcomepageComponent,
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
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
   
  ], providers: [DashboardComponent],  
})
export class DashboardModule { }
