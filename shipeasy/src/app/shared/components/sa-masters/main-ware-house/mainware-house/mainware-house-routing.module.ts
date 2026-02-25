import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddDataEntryComponent } from '../add-data-entry/add-data-entry.component';
import { DataEntryDetailsComponent } from '../data-entry-details/data-entry-details.component';

import { WarehouseDocumentComponent } from '../warehouse-document/warehouse-document.component';
import { GateEntryComponent } from '../gate-entry/gate-entry.component';
import { GateOutComponent } from '../gate-out/gate-out.component';
import { GateOutDataComponent } from '../gate-out/gate-out-data/gate-out-data.component';
import { GateInComponent } from '../gate-entry/gate-in/gate-in.component';
import { InwardsListingComponent } from '../inwards/inwards-listing/inwards-listing.component';
import { InwardsComponent } from '../inwards/inwards.component';
import { AddGateInComponent } from '../gate-in-data/add-gate-in/add-gate-in.component';
import { WarehouseContainerComponent } from '../warehouse-container/warehouse-container.component';
import { InwardContainerHandoverAddComponent } from '../inward-container/inward-cotainer-handover-add/inward-container-handover-add.component';
import { WareHousePackingAddComponent } from '../ware-house-packing/ware-house-packing-add/ware-house-packing-add.component';


const routes: Routes = [
  { path: 'ware/add', component: AddDataEntryComponent },
  { path: 'ware/:id/edit',component :AddDataEntryComponent},

  { path: 'details', component: DataEntryDetailsComponent },
  { path: 'details', component: DataEntryDetailsComponent },
  { path: 'details/:id/:key', component: DataEntryDetailsComponent },
  { path: 'details/:id/:key', component: DataEntryDetailsComponent },
  { path: 'details/:id/:key/add', component: DataEntryDetailsComponent},
  { path: 'details/:id/:key/add', component: DataEntryDetailsComponent},
  { path: 'details/:id/:key/:moduleId/edit',component: DataEntryDetailsComponent},
  { path: 'details/:id/:key/:moduleId/show',component: DataEntryDetailsComponent},
  { path: 'details/:id/:key/:moduleId/clone',component: DataEntryDetailsComponent},

  { path: 'details', component: GateInComponent},
  { path: 'details/:id/:key', component:GateInComponent},
  { path: 'details', component: GateInComponent},
  { path: 'details/:id/:key', component:GateInComponent},
  { path: 'details/:id/:key/adds', component: GateInComponent },
  { path: 'details/:id/:key/adds/:warehousegateinentryId',component: GateInComponent},
  { path: 'details', component: GateEntryComponent},
  { path: 'details/:id/:key', component:GateEntryComponent},
  { path: 'ware/:id/edit', component: AddDataEntryComponent },

  { path: 'details/:id/:key', component:InwardsListingComponent},
  { path: 'details/:id/:key/add', component: InwardsComponent },
  { path: 'details/:id/:key/:moduleId/edit',component: InwardsComponent},
  { path: 'details/:id/:key/:moduleId/clone',component: InwardsComponent},


  { path: 'details', component:WarehouseDocumentComponent  },
  { path: 'details/:id/:key', component:WarehouseDocumentComponent},

  { path: 'details', component:GateOutDataComponent  },
  { path: 'details/:id/:key', component:GateOutDataComponent},
  { path: 'details/:id/:key/add', component: GateOutDataComponent },
  { path: 'details/:id/:key/:moduleId/edit', component: GateOutDataComponent},
  { path: 'details/:id/:key/:moduleId/clone', component: GateOutDataComponent},

  { path: 'details', component: AddGateInComponent },
  { path: 'details/:id/:key', component: AddGateInComponent },
  { path: 'details/:id/:key/add', component: AddGateInComponent },
  { path: 'details/:id/:key/:moduleId/edit', component: AddGateInComponent },
  { path: 'details/:id/:key/:moduleId/clone', component: AddGateInComponent },
  

  { path: 'details', component: WarehouseContainerComponent },
  { path: 'details/:id/:key', component: WarehouseContainerComponent },
  { path: 'details/:id/:key/adds', component: WarehouseContainerComponent },
  { path: 'details/:id/:key/:moduleId/edits', component: WarehouseContainerComponent },

  { path: 'details', component: InwardContainerHandoverAddComponent },
  { path: 'details/:id/:key', component: InwardContainerHandoverAddComponent },
  { path: 'details/:id/:key/add', component: InwardContainerHandoverAddComponent },
  { path: 'details/:id/:key/:moduleId/edit', component: InwardContainerHandoverAddComponent },

  { path: 'details', component: WareHousePackingAddComponent },
  { path: 'details/:id/:key', component: WareHousePackingAddComponent },
  { path: 'details/:id/:key/add', component: WareHousePackingAddComponent },
  { path: 'details/:id/:key/:moduleId/edit', component: WareHousePackingAddComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainwareHouseRoutingModule {}
