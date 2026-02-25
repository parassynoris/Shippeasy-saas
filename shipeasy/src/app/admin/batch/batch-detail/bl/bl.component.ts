import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from 'src/app/admin/principal/api.service';
import * as Constant from 'src/app/shared/common-constants';
import { NzNotificationService } from 'ng-zorro-antd/notification';
@Component({
  selector: 'app-bl',
  templateUrl: './bl.component.html',
  styleUrls: ['./bl.component.scss']
})
export class BLComponent implements OnInit {

  urlParam: any;
  currentUrl: any;
  order: boolean = true;
  
  constructor(private router: Router, private route:ActivatedRoute,
    private _api: ApiService,
    private modalService: NgbModal,
    private notification: NzNotificationService) {
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
