import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RateFinderComponent } from './rate-finder.component';
import { RateFinderRoutingModule } from './rate-finder-routing.module';

 
import { NgxPaginationModule } from 'ngx-pagination'; 
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 
import {AutocompleteLibModule} from "angular-ng-autocomplete";
import { PipeModule } from 'src/app/shared/pipes/pipe.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatButtonToggleModule } from '@angular/material/button-toggle'; 


@NgModule({
  declarations: [
    RateFinderComponent
  ],
  imports: [
    CommonModule,
    RateFinderRoutingModule,
    NgxPaginationModule,
    ReactiveFormsModule, 
    AutocompleteLibModule, FormsModule,
    ReactiveFormsModule,PipeModule,SharedModule,MatButtonToggleModule
  
  ]
})
export class RateFinderModule { }
