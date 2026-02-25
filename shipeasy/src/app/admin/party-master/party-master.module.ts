import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartyMasterRoutingModule } from './party-master-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { MaterialModule } from '../material/material.module';
import {AddBatchComponent} from 'src/app/admin/batch/add-batch/add-batch.component'; 
import { CfsEmailComponent } from 'src/app/shared/components/cfs-email/cfs-email.component';
@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    MaterialModule,
    PartyMasterRoutingModule,
    SharedModule,
    NgbModalModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [AddBatchComponent,CfsEmailComponent] 
})
export class PartyMasterModule { }
