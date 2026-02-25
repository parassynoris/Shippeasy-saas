import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainwareHouseRoutingModule } from './mainware-house-routing.module';
import { AddDataEntryComponent } from '../add-data-entry/add-data-entry.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPrintModule } from 'ngx-print';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { MaterialModule } from 'src/app/admin/material/material.module';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { DataEntryDetailsComponent } from '../data-entry-details/data-entry-details.component';
import { WareHouseBillOfEntryComponent } from '../ware-house-bill-of-entry/ware-house-bill-of-entry.component';
import { InwardsComponent } from '../inwards/inwards.component';
// import { InwardContainerComponent } from '../inward-container/inward-container.component';
import { GateInComponent } from '../gate-entry/gate-in/gate-in.component';
import { GateEntryComponent } from '../gate-entry/gate-entry.component';
import { DispatchWarehouseComponent } from '../dispatch/dispatch-warehouse/dispatch-warehouse.component';
import { WarehouseDocumentComponent } from '../warehouse-document/warehouse-document.component';
import { GateOutComponent } from '../gate-out/gate-out.component';
import { GateOutDataComponent } from '../gate-out/gate-out-data/gate-out-data.component';
import { DispatchDetailsComponent } from '../dispatch/dispatch-details/dispatch-details.component';
import { InvoicesWarehouseComponent } from '../invoices/invoices-warehouse.component';
import { NewinvoiceComponentWareHouse } from '../invoices/newinvoice/newinvoice-warehouse.component';
import { AddGateInComponent } from '../gate-in-data/add-gate-in/add-gate-in.component';
import { GateInDataComponent } from '../gate-in-data/gate-in-data.component';
import { InwardsListingComponent } from '../inwards/inwards-listing/inwards-listing.component';
import { ExBondBillEntrysComponent } from '../ex-bond-billentry/ex-bond-bill-entrys.component';
import { ExBondBillentryComponentAdd } from '../ex-bond-billentry/ex-bond-billentry-add/ex-bond-billentry-add.component';
import { InwardsContainerHandoverComponent } from '../inward-container/inwards-container-handover.component';
import { InwardContainerHandoverAddComponent } from '../inward-container/inward-cotainer-handover-add/inward-container-handover-add.component';
import { WarehouseContainerComponent } from '../warehouse-container/warehouse-container.component';
import { WareHouseVesselComponent } from '../ware-house-vessel/ware-house-vessel.component';
import { WareHousePackingComponent } from '../ware-house-packing/ware-house-packing.component';
import { WareHousePackingAddComponent } from '../ware-house-packing/ware-house-packing-add/ware-house-packing-add.component';



@NgModule({
  declarations: [
    AddDataEntryComponent,
    DataEntryDetailsComponent,
    GateInComponent,
    WareHouseBillOfEntryComponent,
    InwardsComponent,
    InwardsListingComponent,
    DispatchWarehouseComponent,
    DispatchWarehouseComponent,
    WarehouseDocumentComponent,
    GateEntryComponent,
    GateOutComponent,
    GateOutDataComponent,
    DispatchDetailsComponent,
    InvoicesWarehouseComponent,
    NewinvoiceComponentWareHouse,
    AddGateInComponent,
    GateInComponent,
    GateInDataComponent,
    ExBondBillEntrysComponent,
    ExBondBillentryComponentAdd,
    InwardsContainerHandoverComponent,
    InwardContainerHandoverAddComponent,
    WarehouseContainerComponent,
    WareHouseVesselComponent,
    WareHousePackingComponent,
    WareHousePackingAddComponent
  ],
  imports: [
    CommonModule,
    MainwareHouseRoutingModule,
    MatSidenavModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    NgbModule,
    SharedModule,
    NgxPrintModule,
    NzDatePickerModule,
    NzNotificationModule,
    NzToolTipModule,
    NgMultiSelectDropDownModule.forRoot(),
    MaterialModule,
    NzPopoverModule,
    NzIconModule,
  ],
})
export class MainwareHouseModule {}
