import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { ApiService } from '../../principal/api.service';
import { manifests } from '../data';
import * as Constant from 'src/app/shared/common-constants';
import { CommonService } from 'src/app/services/common/common.service';

@Component({
  selector: 'app-manifest-list',
  templateUrl: './manifest-list.component.html',
  styleUrls: ['./manifest-list.component.scss']
})
export class ManifestListComponent implements OnInit {
  manifest = [];
  holdControl: any ;
  expandKeys = "raouteDetails"
  currentUrl: string;
  urlParam: any;
  isExport: boolean;
  showList:boolean=false
  searchList :any = [{}]
  callapseALL: boolean = true;
  houseBlList:any=[]
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private masterservice: MastersService,
    private _api: ApiService,
    private commonService : CommonService
  ) { 
    this.route?.params?.subscribe((params) => (this.urlParam = params));
    this.holdControl = this.urlParam?.key;
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();
    this.isExport = localStorage.getItem('isExport') === 'false' ? false : true
  }

  ngOnInit(): void {
    this.manifest = manifests.sort(function (a, b) {
      if (a.id < b.id) { return -1; }
      if (a.id > b.id) { return 1; }
      return 0;
    })
   this.getBLById()
  }
  getBLById() { 
    let payload = this.commonService?.filterList()

   if(payload?.query) payload.query = {   "vessel": this.route.snapshot?.params['vesId'], "voyageId": this.route.snapshot?.params['voyId'] }

    this.commonService?.getSTList("bl", payload) 
      ?.subscribe((res: any) => {
        this.houseBlList = res?.documents;
      });
  }

}
