import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PaymentConfirmationRoutingModule } from './payment-confirmation-routing.module';
import { PaymentConfirmationComponent } from './payment-confirmation.component';
// import { pipeModule } from '../Helper/pipe/pipe.module';
// import { NeedhelpModule } from '../components/needhelp/needhelp.module';
// import { WindowRefService } from '../window-ref.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
// import { IgxDatePickerModule } from 'igniteui-angular';

@NgModule({
  declarations: [
    PaymentConfirmationComponent
  ],
  imports: [
    CommonModule,
    PaymentConfirmationRoutingModule,
    // pipeModule,
    // NeedhelpModule,
    ReactiveFormsModule,
    // IgxDatePickerModule
    
  ],
  providers: [
    // WindowRefService,
    NgbActiveModal]
})
export class PaymentConfirmationModule { }
