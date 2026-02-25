import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { batch } from '../../data';

@Component({
  selector: 'app-vendor-bill',
  templateUrl: './vendor-bill.component.html',
  styleUrls: ['./vendor-bill.component.scss']
})
export class VendorBillComponent implements OnInit {

  vendorBillData = [];
  urlParam: any;
  currentUrl: any;

  constructor(private router: Router, private route:ActivatedRoute) {
    this.route.params.subscribe( params => 
      this.urlParam = params
      );
   }

  onOpenNew(){
    this.router.navigate(['/batch/list/add/'+this.urlParam.id +'/'+ this.urlParam.key+'/add']);
  }
  
  onOpenEdit(id){
    this.router.navigate(['/batch/list/add/'+this.urlParam.id +'/'+ this.urlParam.key+ '/'+id+'/edit']);
  }

  onBillAction(){
    this.router.navigate(['/batch/list/add/'+this.urlParam.id +'/'+ this.urlParam.key]);
  }

  ngOnInit(): void {
    this.currentUrl =window.location.href.split('?')[0].split('/').pop();
  }

}
