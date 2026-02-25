import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/Guard/auth.guard';
import { MasterComponent } from './master.component';
import { AuditLogsComponent } from 'src/app/shared/components/audit-logs/audit-logs.component';

const routes: Routes = [
  { path: '', redirectTo: 'costitems', pathMatch: 'full' },
   { path: 'audit-logs', component: AuditLogsComponent, },
  { path: ':key', component: MasterComponent, },
  { path: ':key/add', component: MasterComponent, },
  { path: ':key/:id/edit', component: MasterComponent, },
  { path: ':key/:id/show', component: MasterComponent, },
  { path: ':key/:id/Container-History', component: MasterComponent, },
  { path: ':key/addbank', component: MasterComponent, },
  { path: ':key/:bid/editbank', component: MasterComponent, },
  { path: ':key/:bid', component: MasterComponent, },

];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MasterRoutingModule {}
