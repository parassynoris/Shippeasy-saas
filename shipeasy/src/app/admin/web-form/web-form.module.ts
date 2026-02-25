import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WebFormRoutingModule } from './web-form-routing.module';
import { WebFormComponent } from './web-form.component';


@NgModule({
  declarations: [
    WebFormComponent
  ],
  imports: [
    CommonModule,
    WebFormRoutingModule
  ]
})
export class WebFormModule { }
