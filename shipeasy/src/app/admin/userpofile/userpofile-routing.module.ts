import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserpofileComponent } from './userpofile.component';
import { GlobalSearchComponent } from '../mobileview/global-search/global-search.component';


const routes: Routes = [
  { path: '', redirectTo: 'profile', pathMatch: 'full' },
  { path: 'profile', component: UserpofileComponent },
  { path: 'globalsearch', component: GlobalSearchComponent },
 ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserpofileRoutingModule { }