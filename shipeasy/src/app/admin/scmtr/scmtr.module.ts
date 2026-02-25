import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VesselComponent } from './vessel/vessel.component';
import { ScmtrRoutingModule } from '../scmtr/scmtr-routing.module';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    VesselComponent
  ],
  imports: [
    CommonModule,
    ScmtrRoutingModule,
    RouterModule,
  ]
})
export class ScmtrModule { }
