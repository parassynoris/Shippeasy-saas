import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import{SmartagentComponent} from '../smartagent/smartagent.component'
import { SmartDetailsComponent } from './smart-details/smart-details.component';
import { OrgSettingGuard } from 'src/app/Guard/org-setting.guard';
import { RequestListComponent } from './smart-details/request-list/request-list.component';


const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: SmartagentComponent, canActivate:[OrgSettingGuard] }, 
  { path: 'request', component: SmartagentComponent, canActivate:[OrgSettingGuard] }, 
  { path: 'ticketlist', component: SmartagentComponent, canActivate:[OrgSettingGuard] }, 
   { path: ':key', component:SmartDetailsComponent, },
   { path: ':id/:key', component:SmartDetailsComponent, },
  { path: 'list/:key/add', component:SmartDetailsComponent },
  { path: 'list/:id/:key/add', component:SmartDetailsComponent },
  { path: 'list/:key/:id/edit', component:SmartDetailsComponent },
  { path: 'list/:value/:key/:id/edit', component:SmartDetailsComponent },
  { path: 'list/:value/:key/add', component:SmartDetailsComponent },
   { path: ':key/addbranch', component:SmartDetailsComponent },
   { path: ':id/:key/addbranch', component:SmartDetailsComponent },
   { path: ':key/:id/editbranch', component:SmartDetailsComponent },
   { path: ':id/:key/:value/editbranch', component:SmartDetailsComponent },
   { path: 'list/:key/addsmart', component:SmartDetailsComponent },
   { path: 'list/:id/:key/editsmart', component:SmartDetailsComponent },
   { path: 'request/:id/:key/editsmart', component:SmartDetailsComponent },
   { path: ':id/:key/addbank', component: SmartDetailsComponent },
   { path: ':id/:key/:bid/editbank', component: SmartDetailsComponent },
   { path: ':value/:key/:id/edit', component:SmartDetailsComponent },
   { path: ':id/:key/add', component:SmartDetailsComponent },

 ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SmartagentRoutingModule { }
