import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IgmComponent } from './igm.component';



const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: IgmComponent, },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class igmRoutingModule { }
