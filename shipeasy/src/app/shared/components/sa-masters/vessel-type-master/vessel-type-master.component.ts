import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-vessel-type-master',
  templateUrl: './vessel-type-master.component.html',
  styleUrls: ['./vessel-type-master.component.css']
})
export class VesselTypeMasterComponent {
  constructor(private modalService: NgbModal) {
    // do nothing.
   }


  deleteclause(id: any) {
    alert('Item deleted!')
  }

  open(content, location?: any) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg'
    })
  }
  onSave() {

    this.modalService.dismissAll();
    return null;
  }
}