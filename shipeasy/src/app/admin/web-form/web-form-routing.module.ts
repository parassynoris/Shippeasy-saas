import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WebFormComponent } from './web-form.component';

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: WebFormComponent },
  { path: 'list/:id', component: WebFormComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WebFormRoutingModule { }
