import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { shared } from 'src/app/shared/data';

@Component({
  selector: 'app-ops-additional',
  templateUrl: './ops-additional.component.html',
  styleUrls: ['./ops-additional.component.scss']
})
export class OpsAdditionalComponent {
  @Input() isAddNewSection: boolean = true;
  @Input() isOnlyShow: boolean = true;
  chargesData = shared.chargeRow;
  isShow: any;
  isHoldType: any = 'add';
  submitted = false;
  addcharges = shared.chargelist;
  exportFreight= shared.freightlist;
  opsCharges=shared.opsChargeList;
  constructor(private router: Router,
    private modalService: NgbModal) {
    // do nothing.
   }

  onShowdetails(id) {
    this.isShow = id;
  }

  onOpen(type){
    this.isHoldType = type;
  
   
  }


  onClose() {
    this.router.navigate(['/batch/list']);
  }
}


