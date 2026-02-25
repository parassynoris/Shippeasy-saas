import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SelfDashboardRoutingModule } from './self-dashboard-routing.module';
import { SelfDashboardComponent } from './self-dashboard/self-dashboard.component';
import { HighchartsChartModule } from "highcharts-angular";


@NgModule({
  declarations: [
    SelfDashboardComponent
  ],
  imports: [
    CommonModule,
    SelfDashboardRoutingModule,
    HighchartsChartModule
  ]
})
export class SelfDashboardModule { }
