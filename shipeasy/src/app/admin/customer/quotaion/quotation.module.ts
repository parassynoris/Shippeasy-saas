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
import { QuotationRoutingModule } from './quotation-routing.module';
import { AddQuotationComponent } from './add-quotation/add-quotation.component';
import { QuotaionComponent } from './quotaion.component';
import { QuotationDetailComponent } from './quotation-detail/quotation-detail.component'; 
import { CustomAgentAdviseComponent } from './custom-agent-advise/custom-agent-advise.component';

@NgModule({
  declarations: [  
    AddQuotationComponent, 
    QuotaionComponent,
    QuotationDetailComponent, 
    CustomAgentAdviseComponent
  ],
  imports: [
    CommonModule,
    QuotationRoutingModule, DashboardOverviewcardModule,DashboardfiltermodalModule,NgxPaginationModule,
    ReactiveFormsModule, 
    AutocompleteLibModule, FormsModule,
    ReactiveFormsModule,PipeModule,SharedModule,MatButtonToggleModule
  ]
})
export class QuotaionModule { }
