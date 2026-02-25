import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VesselComponent } from './vessel/vessel.component';
import { ScmtrComponent } from './scmtr.component';
const routes: Routes = [
  { path: '', redirectTo: 'invoice', pathMatch: 'full' },
  { path: ':key', component: ScmtrComponent, },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ScmtrRoutingModule { }
