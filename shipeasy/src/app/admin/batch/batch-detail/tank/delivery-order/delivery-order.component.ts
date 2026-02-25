import { Component, Input } from '@angular/core';
import { batch } from '../../../data';

@Component({
  selector: 'app-delivery-order',
  templateUrl: './delivery-order.component.html',
  styleUrls: ['./delivery-order.component.scss']
})
export class DeliveryOrderComponent  {

  // innerContainerData = batch.innerContainerData;
  @Input() isForm: boolean = true;

  constructor() { 
    // do nothing.
  }

  onPrintOpen() {
    this.isForm = false;
  }


}
