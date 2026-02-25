import { CommonModule } from "@angular/common"; 
import { NgModule } from "@angular/core";
import { DashboardOverviewCardComponent } from "./dashboard-overview-card.component"; 
import { ReactiveFormsModule } from "@angular/forms";  
import { ProgressBarModule } from "../progress-bar/progress-bar.module";
import { SharedModule } from "src/app/shared/shared.module";
import { PipeModule } from "src/app/shared/pipes/pipe.module";
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { BookingModule } from "../customer/booking/booking.module";
import { PayModalComponent } from "./pay-modal/pay-modal.component";

@NgModule({
  imports: [
      CommonModule, 
      ReactiveFormsModule, 
      ProgressBarModule,
      PipeModule,
      SharedModule,
      MatButtonToggleModule, 
   ],
  declarations: [
    DashboardOverviewCardComponent ,
    PayModalComponent,
  ],
  exports: [
    DashboardOverviewCardComponent
  ]
})

export class DashboardOverviewcardModule {}
