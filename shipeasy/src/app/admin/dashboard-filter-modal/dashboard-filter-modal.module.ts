import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { DashboardFilterModalComponent } from "./dashboard-filter-modal.component"; 
import { SharedModule } from "src/app/shared/shared.module";
import {AutocompleteLibModule} from "angular-ng-autocomplete";
 
@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule, 
    SharedModule,AutocompleteLibModule
  ],
  declarations: [
    DashboardFilterModalComponent,
   
  ],
  exports: [
    DashboardFilterModalComponent
  ]
})

export class DashboardfiltermodalModule { }
