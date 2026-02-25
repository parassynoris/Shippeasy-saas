import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EnquiryComponent } from './enquiry.component';
import { AddEnquiryComponent } from './add-enquiry/add-enquiry.component';
import { NewQuoteComponent } from 'src/app/shared/components/new-quote/new-quote.component';
import { NewQuoteEditComponent } from 'src/app/shared/components/new-quote-edit/new-quote-edit.component';
import { AuditLogsComponent } from 'src/app/shared/components/audit-logs/audit-logs.component';

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: EnquiryComponent, },
    { path: 'audit-logs', component: AuditLogsComponent, },
  { path: 'list/add', component: AddEnquiryComponent },
  { path: 'list/:id/edit', component: AddEnquiryComponent },
  { path: 'list/:id/quote', component: NewQuoteComponent },
  { path: 'list/:id/newquote', component: NewQuoteEditComponent },
  { path: 'list/:id/:quoteId/editquote', component: NewQuoteEditComponent },
  { path: 'list/:id/:quoteId/viewquote', component: NewQuoteEditComponent },
  { path: 'list/:id/:quoteId/clonequote', component: NewQuoteEditComponent },
  { path: 'list/:id/quote/add', component: NewQuoteComponent },
  { path: 'list/:id/documents', component: NewQuoteComponent },
  { path: 'list/:id/bidding', component: NewQuoteComponent },
  { path: 'list/:id/clone', component: AddEnquiryComponent },
  { path: 'list/:id/show', component: AddEnquiryComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EnquiryRoutingModule { }
