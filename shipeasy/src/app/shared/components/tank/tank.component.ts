import { Component, Input, OnInit } from '@angular/core';
import { shared } from '../../data';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { DeliveryOrderComponent } from './delivery-order/delivery-order.component';

@Component({
  selector: 'app-tank',
  templateUrl: './tank.component.html',
  styleUrls: ['./tank.component.scss']
})
export class TankComponent  {
  @Input() parentpath: any;
  tankData = shared.tankRow;
  isShow: any;
  isNew: boolean = false;

  constructor(private modalService: NgbModal,private router: Router) {
    // do nothing.
  }

  onShowDetails(id) {
    this.isShow = id;
  }

  onSave() {
    this.isShow = '';
  }

  onSavenew() {
    this.isNew = false;
  }

  onSelectContainer(evt) {
    this.isNew = true;
  }


  onClose() {
    this.router.navigate(['/' + this.parentpath +'/list']);
  }

  openGenerateDeliveryOrder(){
    this.modalService.open(DeliveryOrderComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg'
    })
  }

}
