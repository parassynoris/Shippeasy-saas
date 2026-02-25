import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { egmRoutingModule } from './egm-routing.module';
import { EditEgmComponent } from './edit-egm/edit-egm.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { igmRoutingModule } from '../igm/igm-routing.module';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { EgmComponent } from './egm.component';
import { MaterialModule } from '../material/material.module';



@NgModule({
  declarations: [
    EditEgmComponent,
    EgmComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    egmRoutingModule,
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
export class EgmModule { }
