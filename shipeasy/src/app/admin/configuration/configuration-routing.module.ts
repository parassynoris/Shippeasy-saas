import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConfigurationComponent } from './configuration.component';
import { TariffListComponent } from './tariff-list/tariff-list.component';

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: TariffListComponent },
  { path: 'add', component: ConfigurationComponent },
  { path: 'list/:key/edit', component: ConfigurationComponent },
  { path: 'list/:key/clone', component: ConfigurationComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigurationRoutingModule { }
