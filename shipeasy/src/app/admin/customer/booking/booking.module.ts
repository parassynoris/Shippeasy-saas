import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';  
import { NgxPaginationModule } from 'ngx-pagination'; 
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 
import {AutocompleteLibModule} from "angular-ng-autocomplete";
import { PipeModule } from 'src/app/shared/pipes/pipe.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatButtonToggleModule } from '@angular/material/button-toggle'; 
import { BookingComponent } from './booking.component';
import { DashboardfiltermodalModule } from '../../dashboard-filter-modal/dashboard-filter-modal.module';
import { DashboardOverviewcardModule } from '../../dashboard-overview-card/dashboard-overview-card.module';
import { BookingRoutingModule } from './booking-routing.module';
import { BookingDetailsComponent } from './booking-details/booking-details.component';
import {MatTabsModule} from '@angular/material/tabs';
import { DocumentsComponent } from './documents/documents.component';
import { BookingTrackingComponent } from './booking-tracking/booking-tracking.component';
import { DocumentUploadComponent } from './documents/document-upload/document-upload.component';
import { MatStepperModule } from '@angular/material/stepper';
import { MaterialModule } from '../../material/material.module';
import { BookingTrackingModule } from './booking-tracking/booking-tracking/booking-tracking.module';
import { VesselMapComponentNew } from './vessel-map/vessel-map-new.component';
import { InvoicesComponent } from './invoices/invoices.component';
 
 
 
@NgModule({
  declarations: [  
    BookingComponent, BookingDetailsComponent, DocumentsComponent, BookingTrackingComponent, DocumentUploadComponent,VesselMapComponentNew, InvoicesComponent
  ], 
  imports: [
    CommonModule,
    BookingRoutingModule, DashboardOverviewcardModule,DashboardfiltermodalModule,NgxPaginationModule,
    ReactiveFormsModule, MaterialModule,BookingTrackingModule,
    AutocompleteLibModule, FormsModule, PipeModule,SharedModule,MatButtonToggleModule,MatTabsModule,MatStepperModule,
   
  ]
})
export class BookingModule { }
