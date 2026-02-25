import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BatchComponent } from './batch.component';
import { AddBatchComponent } from './add-batch/add-batch.component';
import { BatchDetailsComponent } from './batch-detail/batch-detail.component';
import { AuditLogsComponent } from 'src/app/shared/components/audit-logs/audit-logs.component';
import { BatchBackupComponent } from './batch-backup/batch-backup.component';

const routes: Routes = [ 
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: BatchComponent, },
  // { path: 'list/:id', component: BatchComponent, },
  // { path: 'list/:status', component: BatchComponent, },
  { path: 'audit-logs', component: AuditLogsComponent, },
  { path: 'back-up', component: BatchBackupComponent, },
  { path: 'list/:access', component: AddBatchComponent, },
  { path: 'list/:access', component: AddBatchComponent, },
  { path: 'list/:access/:id/draft', component: AddBatchComponent },
  { path: 'list/:access/:id/cloneJob', component: AddBatchComponent },
  { path: 'list/:access/:id/:key', component: BatchDetailsComponent },
  { path: 'list/:access/:id/:key', component: BatchDetailsComponent },
  { path: 'list/:access/:id/:key/add', component: BatchDetailsComponent },
  { path: 'list/:access/:id/:key/addconsolidate', component: BatchDetailsComponent },
  { path: 'list/:access/:id/:key/:moduleId/edit', component: BatchDetailsComponent },
  { path: 'list/:access/:id/:key/:moduleId/cloneBl', component: BatchDetailsComponent },
  { path: 'list/:access/:id/:key/:moduleId/clone', component: BatchDetailsComponent },//FOR CLONE INVOICE
  { path: 'list/:access/:id/:key/:moduleId/show', component: BatchDetailsComponent },
  { path: 'list/:access/:id/:key', component: BatchDetailsComponent },
  { path: 'list/:access/:id', component: AddBatchComponent } ,
  { path: 'list/:access/:id/:key/adddetention', component: BatchDetailsComponent },
  { path: 'list/:access/:id/:key/:moduleId/editdetention', component: BatchDetailsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BatchRoutingModule { }
