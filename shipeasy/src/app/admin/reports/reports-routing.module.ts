import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BoldReportListComponent } from './bold-report-list/bold-report-list.component';
import { ScheduleListComponent } from './bold-report-list/schedule-list/schedule-list.component';


const routes: Routes = [
  {
      path: '',
      redirectTo:'reportList'
  },
 
  {
      path: 'reportList',
      component: BoldReportListComponent 
  },
  {
    path: 'scheduleList',
    component: ScheduleListComponent 
}
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
