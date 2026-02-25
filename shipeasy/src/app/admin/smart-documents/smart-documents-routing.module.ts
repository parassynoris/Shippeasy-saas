import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SmartDocumentsComponent } from './smart-documents.component';
import { CreateDocComponent } from './create-doc/create-doc.component';
  

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: SmartDocumentsComponent, }, 
  { path: 'list/:key/add', component: CreateDocComponent },
  { path: 'list/:id/:key/edit', component: CreateDocComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SmartDocumentsRoutingModule { }
