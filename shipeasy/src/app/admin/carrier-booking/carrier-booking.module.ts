import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CarrierBookingRoutingModule } from './carrier-booking-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from '../material/material.module';
import { CarrierBookingComponent } from './carrier-booking.component';
import { AddCarrierBookingComponent } from './add-carrier-booking/add-carrier-booking.component';


@NgModule({
  declarations: [CarrierBookingComponent, AddCarrierBookingComponent],
  imports: [
    CommonModule,
    CarrierBookingRoutingModule,
    CommonModule,
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
    
  ]
})
export class CarrierBookingModule { }
