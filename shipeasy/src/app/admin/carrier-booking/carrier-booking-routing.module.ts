import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CarrierBookingComponent } from './carrier-booking.component';
import { AddCarrierBookingComponent } from './add-carrier-booking/add-carrier-booking.component';

const routes: Routes = [
    { path: '', redirectTo: 'list', pathMatch: 'full' },
    { path: 'list', component: CarrierBookingComponent, },
    { path: 'add-carrier-booking', component: AddCarrierBookingComponent},
    { path: 'add-carrier-booking/:id', component: AddCarrierBookingComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CarrierBookingRoutingModule { }
