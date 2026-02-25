import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { igmRoutingModule } from './igm-routing.module';
import { AddIgmComponent } from './add-igm/add-igm.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from '../material/material.module';
import { IgmComponent } from './igm.component';


@NgModule({
  declarations: [
    AddIgmComponent,
    IgmComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    igmRoutingModule,
    NzDatePickerModule,
    NzAutocompleteModule,
    NzSelectModule,
    NgMultiSelectDropDownModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MaterialModule
  ]
})
export class IgmModule { }
