import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConsolidationBookingComponent } from './consolidation-booking.component';
import { AddConsolidationBookingComponent } from './add-consolidation-booking/add-consolidation-booking.component';
import { EditDetailsComponent } from './edit-details/edit-details.component';

const routes: Routes = [
  { path: 'add-consolidation', component: AddConsolidationBookingComponent},
  { path: 'edit/:id/edit-consolidation', component: AddConsolidationBookingComponent},
  { path: 'edit/:id/:key', component: EditDetailsComponent},
  { path: 'edit/:id/:key/add', component: EditDetailsComponent},
  { path: 'edit/:id/:key/:moduleId/edit', component: EditDetailsComponent },
  { path: 'edit/:id/:key/:moduleId/show', component: EditDetailsComponent },
  { path: 'list', component: ConsolidationBookingComponent, },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConsolidationBookingRoutingModule { }