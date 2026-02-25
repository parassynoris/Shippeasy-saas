import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { batch } from '../../../data';

@Component({
  selector: 'app-new-vendor-bill',
  templateUrl: './new-vendor-bill.component.html',
  styleUrls: ['./new-vendor-bill.component.scss']
})
export class NewVendorBillComponent {

  @Output() CloseBillSection = new EventEmitter<string>();

  onCloseBill(evt){
    this.CloseBillSection.emit(evt);
  }



}
