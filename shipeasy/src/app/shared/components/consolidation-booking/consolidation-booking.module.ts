import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConsolidationBookingRoutingModule } from './consolidation-booking-routing.module';
import { ConsolidationBookingComponent } from './consolidation-booking.component';
import { SharedModule } from '../../shared.module';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from 'src/app/admin/material/material.module';
import { AddConsolidationBookingComponent } from './add-consolidation-booking/add-consolidation-booking.component';
import { EditDetailsComponent } from './edit-details/edit-details.component';
import { SIComponent } from 'src/app/admin/batch/si/si.component';
import { BatchModule } from 'src/app/admin/batch/batch.module';
import { AssignContainerComponent } from './add-consolidation-booking/assign-container/assign-container.component';
import { ConsolidateBlComponent } from './consolidate-bl/consolidate-bl.component';
import { NewConsBlComponent } from './consolidate-bl/new-cons-bl/new-cons-bl.component';

import {AutocompleteLibModule} from "angular-ng-autocomplete";

@NgModule({
  declarations: [
    ConsolidationBookingComponent,
    AddConsolidationBookingComponent,
    EditDetailsComponent,
    AssignContainerComponent,
    ConsolidateBlComponent,
    NewConsBlComponent,
 
   
  ],
  imports: [
    CommonModule,
    ConsolidationBookingRoutingModule,
    SharedModule,
    NzDatePickerModule,
    NzAutocompleteModule,
    NzSelectModule,
    NgMultiSelectDropDownModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MaterialModule,
    BatchModule,
    AutocompleteLibModule
  ]
})
export class ConsolidationBookingModule { }
