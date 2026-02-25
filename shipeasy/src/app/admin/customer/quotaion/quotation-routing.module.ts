import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';    
import { QuotaionComponent } from './quotaion.component';
import { AddQuotationComponent } from './add-quotation/add-quotation.component';
import { QuotationDetailComponent } from './quotation-detail/quotation-detail.component';
import { CustomAgentAdviseComponent } from './custom-agent-advise/custom-agent-advise.component';
 

const routes: Routes = [
  { path: '', redirectTo: '', pathMatch: 'full' },
  { path: 'list', component: QuotaionComponent } ,
  { path: 'Import/list', component: QuotaionComponent } ,
  { path: 'Export/list', component: QuotaionComponent } ,
  { path: 'list/add', component: AddQuotationComponent },  
  { path: 'list/add-agent', component: CustomAgentAdviseComponent }, 
  { path: 'list/:id', component: QuotationDetailComponent },  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuotationRoutingModule { }
