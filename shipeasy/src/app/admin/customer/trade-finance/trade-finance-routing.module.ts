import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TradeFinanceComponent } from './trade-finance.component';
import { TradeFinanceTableComponent } from './trade-finance-table/trade-finance-table.component';

const routes: Routes = [
  { path: '', redirectTo: '', pathMatch: 'full' },
  { path: 'list', component: TradeFinanceTableComponent } ,
  { path: 'list/add', component: TradeFinanceComponent } ,
  { path: 'list/:id', component: TradeFinanceComponent } 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TradeFinanceRoutingModule { }
