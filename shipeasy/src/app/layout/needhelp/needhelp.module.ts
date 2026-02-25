import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NeedhelpRoutingModule } from './needhelp-routing.module';
import { NeedhelpComponent } from './needhelp.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FaqModule } from 'src/app/shared/components/sa-masters/faq/faq.module';


@NgModule({
  declarations: [NeedhelpComponent],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    FaqModule,
    ReactiveFormsModule,
    NeedhelpRoutingModule
  ],
  exports: [NeedhelpComponent],
})
export class NeedhelpModule { }
