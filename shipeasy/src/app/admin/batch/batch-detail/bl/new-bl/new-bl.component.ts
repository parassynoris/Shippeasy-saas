import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-new-bl',
  templateUrl: './new-bl.component.html',
  styleUrls: ['./new-bl.component.scss']
})
export class NewBLComponent   {

  @Output() CloseBillSection = new EventEmitter<string>();
  containerBillsData = [];

  constructor() {
    // do nothing.
   }

  onCloseBill(evt){
    this.CloseBillSection.emit(evt);
  }


}
