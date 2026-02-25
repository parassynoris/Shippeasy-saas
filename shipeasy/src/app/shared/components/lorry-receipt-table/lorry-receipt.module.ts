import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared.module';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from 'src/app/admin/material/material.module';
import { SIComponent } from 'src/app/admin/batch/si/si.component';
import { BatchModule } from 'src/app/admin/batch/batch.module';

import {AutocompleteLibModule} from "angular-ng-autocomplete";
import { LorryReceiptTableComponent } from './lorry-receipt-table.component';
import { LorryReceiptAddComponent } from './lorry-receipt-add/lorry-receipt-add.component';
import { LorryRoutingModule} from './lorry-receipt-routing.module';

@NgModule({
  declarations: [
    LorryReceiptTableComponent,
    LorryReceiptAddComponent
  ],
  imports: [
    CommonModule,
    LorryRoutingModule,
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
export class LorryBookingModule { }
