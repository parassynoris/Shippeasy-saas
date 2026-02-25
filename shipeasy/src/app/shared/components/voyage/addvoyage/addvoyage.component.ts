import { Component, Output, EventEmitter } from '@angular/core';
import { shared } from '../../../data';

@Component({
  selector: 'app-addvoyage',
  templateUrl: './addvoyage.component.html',
  styleUrls: ['./addvoyage.component.scss']
})
export class AddvoyageComponent {

  newvoyageData = shared.newvoyage;

  @Output() InvoiceSection = new EventEmitter<string>();

  userRoleData = shared.userRoleRowData;
  isShow: any;
  settingData = shared.settingData;



  onCloseInvoice(evt){
    this.InvoiceSection.emit(evt);
  }

  onShowPermission(id) {
    this.isShow = id;
  }



}
