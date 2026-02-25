import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';    
import { InvoicePaymentComponent } from './invoice-payment.component';
import { InvoicePaymentDetailsComponent } from './invoice-payment-details/invoice-payment-details.component';
 

const routes: Routes = [
  { path: '', redirectTo: '', pathMatch: 'full' },
  { path: 'list', component: InvoicePaymentComponent } ,
  { path: 'list/:id', component: InvoicePaymentDetailsComponent, }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InvoicePaymentRoutingModule { }
