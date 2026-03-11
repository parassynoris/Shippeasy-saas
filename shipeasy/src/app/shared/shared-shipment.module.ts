import { NgModule } from '@angular/core';
import { SharedCoreModule } from './shared-core.module';
import { NgxPrintModule } from 'ngx-print';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { ArchwizardModule } from 'angular-archwizard';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';

import { DocumentComponent } from './components/document/document.component';
import { NewDocumentComponent } from './components/document/new-document/new-document.component';
import { DocumentUpload1Component } from './components/document/document-upload1/document-upload1.component';
import { NewEnquiryComponent } from './components/new-enquiry/new-enquiry.component';
import { NewImportEnquiryComponent } from './components/new-import-enquiry/new-import-enquiry.component';
import { NewQuoteComponent } from './components/new-quote/new-quote.component';
import { NewQuoteEditComponent } from './components/new-quote-edit/new-quote-edit.component';
import { FilterPipe, FilterPipe1, RouteComponent } from './components/route/route.component';
import { VesselMapComponent } from './components/route/vessel-map/vessel-map.component';
import { StoltBLComponent } from './components/stolt-bl/stolt-bl.component';
import { NewStoltBLComponent, FilterShipperBLPipe, FilterLCLShipperBLPipe } from './components/stolt-bl/new-stolt-bl/new-stolt-bl.component';
import { StoltSplitBlComponent } from './components/stolt-bl/stolt-split-bl/stolt-split-bl.component';
import { TankComponent } from './components/tank/tank.component';
import { ContainerComponent } from './components/tank/container/container.component';
import { DeliveryOrderComponent } from './components/tank/delivery-order/delivery-order.component';
import { AddContainerComponent } from './components/add-container/add-container.component';
import { ShippedOnboardComponent } from './components/shipped-onboard/shipped-onboard.component';
import { PortComponent } from './components/port/port.component';
import { AddportComponent } from './components/port/addport/addport.component';
import { LocationsComponent } from './components/locations/locations.component';
import { MilestoneComponent } from './components/milestone/milestone.component';
import { ShippingBillComponent } from './components/shipping-bill/shipping-bill.component';
import { AddShippingBillComponent } from './components/shipping-bill/add-shipping-bill/add-shipping-bill.component';
import { BillOfEntryComponent } from './components/bill-of-entry/bill-of-entry.component';
import { AddBillofEntryComponent } from './components/bill-of-entry/add-billof-entry/add-billof-entry.component';
import { CustomsComponent } from './components/customs/customs.component';
import { FreightCertificateComponent } from './components/freight-certificate/freight-certificate.component';
import { CfsEmailComponent } from './components/cfs-email/cfs-email.component';
import { BiddingComponent } from './components/bidding/bidding.component';
import { DueShipmentComponent } from './components/due-shipment/due-shipment.component';
import { TransportMilestoneComponent } from './components/transport-milestone/transport-milestone.component';
import { DriverVehicleDetailsComponent } from './components/driver-vehicle-details/driver-vehicle-details.component';
import { GrnComponent } from './components/grn/grn.component';
import { NewAgentAdviseComponent } from './components/new-agent-advise/new-agent-advise.component';
import { ActivityComponent } from './components/activity/activity.component';
import { AddactivityComponent } from './components/activity/addactivity/addactivity.component';
import { VesselVoyageComponent } from './components/Vessel-voyage/Vessel-voyage.component';
import { AddVesselVoyageComponent } from './components/Vessel-voyage/addvesselvoyage/addvesselvoyage.component';
import {
  NgxMatNativeDateAdapter,
  NGX_MAT_DATE_FORMATS
} from '@angular-material-components/datetime-picker';

const SHIPMENT_COMPONENTS = [
  DocumentComponent,
  NewDocumentComponent,
  DocumentUpload1Component,
  NewEnquiryComponent,
  NewImportEnquiryComponent,
  NewQuoteComponent,
  NewQuoteEditComponent,
  FilterPipe,
  FilterPipe1,
  RouteComponent,
  VesselMapComponent,
  StoltBLComponent,
  NewStoltBLComponent,
  FilterShipperBLPipe,
  FilterLCLShipperBLPipe,
  StoltSplitBlComponent,
  TankComponent,
  ContainerComponent,
  DeliveryOrderComponent,
  AddContainerComponent,
  ShippedOnboardComponent,
  PortComponent,
  AddportComponent,
  LocationsComponent,
  MilestoneComponent,
  ShippingBillComponent,
  AddShippingBillComponent,
  BillOfEntryComponent,
  AddBillofEntryComponent,
  CustomsComponent,
  FreightCertificateComponent,
  CfsEmailComponent,
  BiddingComponent,
  DueShipmentComponent,
  TransportMilestoneComponent,
  DriverVehicleDetailsComponent,
  GrnComponent,
  NewAgentAdviseComponent,
  ActivityComponent,
  AddactivityComponent,
  VesselVoyageComponent,
  AddVesselVoyageComponent,
];

@NgModule({
  imports: [
    SharedCoreModule,
    NgxPrintModule,
    NzDatePickerModule,
    ArchwizardModule,
    NgMultiSelectDropDownModule.forRoot(),
    GooglePlaceModule,
  ],
  declarations: [...SHIPMENT_COMPONENTS],
  exports: [
    ...SHIPMENT_COMPONENTS,
    NgxPrintModule,
    NzDatePickerModule,
    ArchwizardModule,
    GooglePlaceModule,
  ],
  providers: [
    FilterPipe,
    {
      provide: NgxMatNativeDateAdapter,
      useValue: {
        ...NGX_MAT_DATE_FORMATS,
        display: {
          ...NGX_MAT_DATE_FORMATS,
          dateInput: { year: 'numeric', month: 'numeric', day: 'numeric' },
        },
      },
    },
    NgxMatNativeDateAdapter,
  ],
})
export class SharedShipmentModule {}
