import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ApiService } from '../../principal/api.service';
import * as Constant from 'src/app/shared/common-constants';
import { CommonService } from 'src/app/services/common/common.service';
@Component({
  selector: 'app-house-bl',
  templateUrl: './house-bl.component.html',
  styleUrls: ['./house-bl.component.scss']
})
export class HouseBlComponent implements OnInit {
  houseBlList: any = []
  constructor(private router: Router,
    private location: Location,
    private _api: ApiService,
    private route: ActivatedRoute, public commonService : CommonService) { }

  ngOnInit(): void {
    this.getBLById()
  }
  getBLById() { 
    let payload = this.commonService?.filterList()

   if(payload?.query) payload.query = {   "vessel": this.route.snapshot.params['vesId'],  "blType": 'MBL' }

    this.commonService?.getSTList("bl", payload) 
      .subscribe((res: any) => {
        this.houseBlList = res?.documents;
      });
  }
  back() {
    this.location.back();
  }
}
