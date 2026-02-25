import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';  
import { CustomerComponent } from './customer.component'; 
 

const routes: Routes = [
  { path: '', redirectTo: '', pathMatch: 'full' },
  { path: '', component: CustomerComponent, 
  children: [
    { path: 'quotation', loadChildren: () => import('./quotaion/quotation.module').then((m) => m.QuotaionModule)},
    { path: 'booking', loadChildren: () => import('./booking/booking.module').then((m) => m.BookingModule)},
    { path: 'invoice-payment', loadChildren: () => import('./invoice-payment/invoice-payment.module').then((m) => m.InvoicePaymentModule)},
    { path: 'trade-finance', loadChildren: () => import('./trade-finance/trade-finance.module').then((m) => m.TradeFinanceModule)},
  ]},  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule { }
