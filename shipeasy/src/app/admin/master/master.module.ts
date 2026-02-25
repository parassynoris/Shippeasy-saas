import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ArchwizardModule } from 'angular-archwizard';
import { HttpClientModule } from '@angular/common/http';
import { MasterRoutingModule } from './master-routing.module';
import { MasterComponent } from './master.component';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BondFilingComponent } from './bond-filing/bond-filing.component';
import { CustomerGstComponent } from './customer-gst/customer-gst.component';
import { CustomerMasterComponent } from './customer-master/customer-master.component';
import { AddCustomerGstComponent } from './customer-gst/add-customer-gst/add-customer-gst.component';

@NgModule({
  declarations: 
  [
    MasterComponent,
    BondFilingComponent,
    CustomerGstComponent,
    CustomerMasterComponent,
    AddCustomerGstComponent,
    ],
  imports: [
    CommonModule,
    SharedModule,
    MasterRoutingModule,
    ArchwizardModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [DatePipe]
})
export class MasterModule { }
