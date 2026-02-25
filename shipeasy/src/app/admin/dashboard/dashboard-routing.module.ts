import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { DueShipmentComponent } from 'src/app/shared/components/due-shipment/due-shipment.component';
import { SharedModule } from 'src/app/shared/shared.module';

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: DashboardComponent, },
  {path: 'list/due-shipment', component: DueShipmentComponent,}
];

@NgModule({
  imports: [RouterModule.forChild(routes),SharedModule],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
