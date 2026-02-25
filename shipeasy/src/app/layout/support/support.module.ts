import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SupportRoutingModule } from './support-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { SupportComponent } from './support.component';


@NgModule({
  declarations: [SupportComponent],
  imports: [
    CommonModule,
    SharedModule,
    SupportRoutingModule
  ],
  exports: [SupportComponent],
})
export class SupportModule { }
