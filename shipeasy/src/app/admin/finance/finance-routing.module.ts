import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FinanceComponent } from './finance.component';


const routes: Routes = [
  { path: '', redirectTo: 'purchase', pathMatch: 'full' },
  { path: ':key', component: FinanceComponent, },
  { path: ':key/add', component: FinanceComponent, },
  { path: ':key/addbills', component: FinanceComponent, },
  { path: ':key/:id/edit', component: FinanceComponent, },
  { path: ':key/:id/clone', component: FinanceComponent, },
  { path: ':key/:id/show', component: FinanceComponent, },
  { path: ':key/:id/posting', component: FinanceComponent, },
  { path: ':key/:id/reciept-posting', component: FinanceComponent, },
  { path: ':key/:moduleId/editInvoice', component: FinanceComponent, },
  { path: ':key/:moduleId/showInvoice', component: FinanceComponent, },
  { path: ':key/:id/editbills', component: FinanceComponent, },
  // { path: ':key/newreciept', component: FinanceComponent, },
  // { path: ':key/confirm', component: FinanceComponent, },
  { path: ':key/newreciept', component: FinanceComponent, },
  { path: ':key/:rid/editreciept', component: FinanceComponent, },
  { path: ':key/:rid/confirm', component: FinanceComponent, },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FinanceRoutingModule { }
