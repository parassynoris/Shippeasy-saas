import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { FaqRoutingModule } from './faq-routing.module';
import { FaqComponent } from './faq.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [FaqComponent],
  exports: [FaqComponent],
  imports: [
    SharedModule,
    CommonModule,
    FaqRoutingModule,
    ScrollToModule.forRoot()
  ],
})
export class FaqModule { }
