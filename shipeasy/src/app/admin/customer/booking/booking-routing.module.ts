import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';   
import { BookingComponent } from './booking.component';
import { BookingDetailsComponent } from './booking-details/booking-details.component';
 

const routes: Routes = [
  { path: '', redirectTo: '', pathMatch: 'full' },
  { path: 'list', component: BookingComponent } ,
  { path: 'list/:id', component: BookingDetailsComponent, }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BookingRoutingModule { }
