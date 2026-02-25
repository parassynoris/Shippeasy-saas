import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';   
import { TransportComponent } from './transport.component';
import { TransportDetailsComponent } from './transport-details/transport-details.component';
 

const routes: Routes = [ 
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: TransportComponent, },
  { path: 'list/:id/details', component:TransportDetailsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransportRoutingModule { }
