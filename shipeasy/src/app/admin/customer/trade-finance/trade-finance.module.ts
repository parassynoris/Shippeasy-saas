import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TradeFinanceRoutingModule } from './trade-finance-routing.module';
import { TradeFinanceComponent } from './trade-finance.component';
import { InvoicePaymentRoutingModule } from '../invoice-payment/invoice-payment-routing.module';
import { DashboardOverviewcardModule } from '../../dashboard-overview-card/dashboard-overview-card.module';
import { DashboardfiltermodalModule } from '../../dashboard-filter-modal/dashboard-filter-modal.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PipeModule } from 'src/app/shared/pipes/pipe.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { TradeFinanceTableComponent } from './trade-finance-table/trade-finance-table.component';
import { MainwareHouseRoutingModule } from 'src/app/shared/components/sa-masters/main-ware-house/mainware-house/mainware-house-routing.module';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPrintModule } from 'ngx-print';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { MaterialModule } from '../../material/material.module';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';


@NgModule({
  declarations: [  
    TradeFinanceComponent,TradeFinanceTableComponent
  ],
  imports: [
    MainwareHouseRoutingModule,
    MatSidenavModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    NgbModule,
    NgxPrintModule,
    NzDatePickerModule,
    NzNotificationModule,
    NzToolTipModule,
    NgMultiSelectDropDownModule.forRoot(),
    MaterialModule,
    NzPopoverModule,
    NzIconModule,
    CommonModule,
    TradeFinanceRoutingModule, 
    DashboardOverviewcardModule,
    DashboardfiltermodalModule,
    NgxPaginationModule,
    ReactiveFormsModule, 
    AutocompleteLibModule, 
    FormsModule,
    PipeModule,
    SharedModule,
    MatButtonToggleModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
  ]
})
export class TradeFinanceModule { }
