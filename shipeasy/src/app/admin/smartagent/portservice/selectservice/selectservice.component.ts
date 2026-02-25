import { Component } from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import{smartagent}from '../../data';
@Component({
  selector: 'app-selectservice',
  templateUrl: './selectservice.component.html',
  styleUrls: ['./selectservice.component.css']
})
export class SelectserviceComponent  {
  serviceData = smartagent.serviceRow;
  constructor(private modalService: NgbModal) {
    // do nothing.
   }


  onSave() {
    this.modalService.dismissAll();
   
   }
}
