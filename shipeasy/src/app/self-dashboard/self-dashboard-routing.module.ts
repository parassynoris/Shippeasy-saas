import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SelfDashboardComponent } from './self-dashboard/self-dashboard.component';

const routes: Routes = [ { path: '', component: SelfDashboardComponent },];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SelfDashboardRoutingModule { }
