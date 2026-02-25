import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EgmComponent } from './egm.component';


const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: EgmComponent, },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class egmRoutingModule { }
