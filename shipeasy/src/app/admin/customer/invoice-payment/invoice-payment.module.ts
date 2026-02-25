import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';  
import { NgxPaginationModule } from 'ngx-pagination'; 
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 
import {AutocompleteLibModule} from "angular-ng-autocomplete";
import { PipeModule } from 'src/app/shared/pipes/pipe.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatButtonToggleModule } from '@angular/material/button-toggle';  
import { DashboardfiltermodalModule } from '../../dashboard-filter-modal/dashboard-filter-modal.module';
import { DashboardOverviewcardModule } from '../../dashboard-overview-card/dashboard-overview-card.module'; 
import { InvoicePaymentRoutingModule } from './invoice-payment-routing.module';
import { InvoicePaymentComponent } from './invoice-payment.component';
import { InvoicePaymentDetailsComponent } from './invoice-payment-details/invoice-payment-details.component';

@NgModule({
  declarations: [  
    InvoicePaymentComponent, InvoicePaymentDetailsComponent, 
  ],
  imports: [
    CommonModule,
    InvoicePaymentRoutingModule, DashboardOverviewcardModule,DashboardfiltermodalModule,NgxPaginationModule,
    ReactiveFormsModule, 
    AutocompleteLibModule, FormsModule,
    ReactiveFormsModule,PipeModule,SharedModule,MatButtonToggleModule
  ]
})
export class InvoicePaymentModule { }
