import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManifestRoutingModule } from './manifest-routing.module';
import { ManifestComponent } from './manifest.component';
import { UpdateCfsComponent } from './update-cfs/update-cfs.component';
import { UpdateSealNoComponent } from './update-seal-no/update-seal-no.component';
import { IgmGenerationComponent } from './igm-generation/igm-generation.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { UpdateMasterBlComponent } from './update-master-bl/update-master-bl.component';
import { UpdateBlStatusComponent } from './update-bl-status/update-bl-status.component';
import { HouseBlComponent } from './house-bl/house-bl.component';
import { TranslateModule } from '@ngx-translate/core';
import { ManifestListComponent } from './manifest-list/manifest-list.component';
import { UpdateContainerCellPositionComponent } from './update-container-cell-position/update-container-cell-position.component';
import { ViewSocContainerComponent } from './view-soc-container/view-soc-container.component';
import { UpdateProductDetailsComponent } from './update-product-details/update-product-details.component';
import { IgmChecklistComponent } from './igm-checklist/igm-checklist.component';
import { ViewCfsSummaryComponent } from './view-cfs-summary/view-cfs-summary.component';
import { UpdateBondComponent } from './update-bond/update-bond.component';
import { EditTerminalFpodComponent } from './edit-terminal-fpod/edit-terminal-fpod.component';
import { EditTerminalFpodContainerComponent } from './edit-terminal-fpod-container/edit-terminal-fpod-container.component';
import { UpdateSlotBlComponent } from './update-slot-bl/update-slot-bl.component';
import { UpdateCargoDepartureComponent } from './update-cargo-departure/update-cargo-departure.component';
import { UpdateChecklistComponent } from './update-checklist/update-checklist.component';
import { UpdateFreightComponent } from './update-freight/update-freight.component';
import { UpdateLoadportRemarksComponent } from './update-loadport-remarks/update-loadport-remarks.component';
import { UpdateItemNoComponent } from './update-item-no/update-item-no.component';

import { UpdateIgmNoDateComponent } from './update-igm-no-date/update-igm-no-date.component';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';

import { UpdateTpComponent } from './update-tp/update-tp.component';

@NgModule({
  declarations: [
    UpdateItemNoComponent,
    UpdateBondComponent,
    ManifestComponent,
    UpdateCfsComponent,
    UpdateSealNoComponent,
    IgmGenerationComponent,
    UpdateMasterBlComponent,
    UpdateBlStatusComponent,
    HouseBlComponent,
    ManifestListComponent,
    UpdateContainerCellPositionComponent,
    ViewSocContainerComponent,
    UpdateProductDetailsComponent,
    IgmChecklistComponent,
    ViewCfsSummaryComponent,
    EditTerminalFpodComponent,
    EditTerminalFpodContainerComponent,
    UpdateSlotBlComponent,
    UpdateCargoDepartureComponent,
    UpdateChecklistComponent,
    UpdateFreightComponent,
    UpdateLoadportRemarksComponent,

    UpdateIgmNoDateComponent,

    UpdateTpComponent,

  ],
  imports: [
    CommonModule,
    ManifestRoutingModule,
    ReactiveFormsModule,
    NgMultiSelectDropDownModule,
    NzSelectModule,
    TranslateModule,
    CommonModule,
    FormsModule,
    NzDatePickerModule 
  ]
})
export class ManifestModule { }
