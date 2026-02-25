import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { CustomerRoutingModule } from './customer-routing.module'; 
import { InvoicePaymentComponent } from './invoice-payment/invoice-payment.component'; 
import { DashboardOverviewcardModule } from '../dashboard-overview-card/dashboard-overview-card.module';
import { DashboardfiltermodalModule } from '../dashboard-filter-modal/dashboard-filter-modal.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { AddQuotationComponent } from './quotaion/add-quotation/add-quotation.component';
import { CustomerComponent } from './customer.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 
import {AutocompleteLibModule} from "angular-ng-autocomplete";
import { PipeModule } from 'src/app/shared/pipes/pipe.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';


@NgModule({
  declarations: [   
    CustomerComponent
  ],
  imports: [
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    CommonModule,
    CustomerRoutingModule, DashboardOverviewcardModule,DashboardfiltermodalModule,NgxPaginationModule,
    ReactiveFormsModule, 
    AutocompleteLibModule, FormsModule,
    ReactiveFormsModule,PipeModule,SharedModule,MatButtonToggleModule
  ] 
})
export class CustomerModule { }
