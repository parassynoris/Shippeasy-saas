import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { BaseBody } from '../smartagent/base-body';
import { ApiService } from '../principal/api.service';
import * as Constant from 'src/app/shared/common-constants';
import { manifests } from './data'
import { CommonService } from 'src/app/services/common/common.service';
import { Vessel } from 'src/app/models/vessel-master';
import { MyData } from 'src/app/models/Vessel-voyage';
import { CargoData } from 'src/app/models/new-invoice';

@Component({
  selector: 'app-manifest',
  templateUrl: './manifest.component.html',
  styleUrls: ['./manifest.component.scss'],
})
export class ManifestComponent implements OnInit {
  manifest = manifests;
  holdControl: any;
  urlParam: any;
  submitted: boolean = false;
  manifestForm: FormGroup;
  vesseldata: Vessel[] = [];
  baseBody: any
  voyageList: MyData[] = []
  batchList: CargoData[] = []
  isExport: boolean;
  showList: boolean = false
  searchList: any = [{}]
  callapseALL: boolean = true;
  expandKeys = "raouteDetails"
  currentUrl: string;
  constructor(

    public router: Router,
    public route: ActivatedRoute,
    private fb: FormBuilder,
    private masterservice: MastersService,
    private _api: ApiService, public commonService: CommonService
  ) {
    this.manifestForm = this.fb.group({
      vessel: ['', Validators.required],
      voyage: ['', Validators.required],
      principal: ['SHIPEASY TANK CONTAINERS', Validators.required],
      blbatchno: [''],
    });
    this.route.params.subscribe((params) => (this.urlParam = params));
    this.holdControl = this.urlParam.key;
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();
    this.isExport = localStorage.getItem('isExport') === 'false' ? false : true

  }
  get f() {
    return this.manifestForm.controls;
  }
  ngOnInit(): void {
    this.getVesselData()
    this.getBatch()
  }
  getVesselData() {
    let payload = this.commonService.filterList()

    if(payload?.query)payload.query = {}

    this.commonService.getSTList("vessel", payload)?.subscribe((res: any) => {
      this.vesseldata = res.documents;
    });
  }

  vesselChange(e) {
    let payload = this.commonService.filterList()

    payload.query = { "status": true, "vesselId": e }

    this.commonService.getSTList("voyage", payload).subscribe((res: any) => {
      this.voyageList = res?.documents;
      this.manifestForm.controls['voyage'].setValue(this.voyageList[0]?.voyageNumber)

    });

  }
  getBatch() {
    let payload = this.commonService.filterList()

    if(payload?.query)payload.query = { "isExport": this.isExport }

    this.commonService.getSTList(Constant.BATCH_LIST, payload)
      ?.subscribe((data: any) => {
        this.batchList = data.documents;

      });
  }
  getList() {
    this.submitted = true
    if (this.manifestForm.invalid) {
      return null
    }
    else {

      this.baseBody = new BaseBody();
      let mustArray = [];

      this.baseBody.baseBody.query.bool.must = mustArray;

      let payload = this.commonService.filterList()

      payload.query = {}
      if (this.manifestForm.value.vessel) {
        payload.query["finalVesselId"] = this.manifestForm.value.vessel
      }
      if (this.manifestForm.value.voyage) {
        payload.query["finalVoyageId"] = this.manifestForm.value.voyage
      }
      if (this.manifestForm.value.blbatchno) {
        payload.query["batchId"] = this.manifestForm.value.blbatchno
      }

      this.commonService.getSTList(Constant.BATCH_LIST, payload)
        .subscribe((data: any) => {
          this.batchList = data.documents;
          if (data.totalCount > 0) {
            this.showList = true
          }
          this.router.navigate([`manifest/${this.manifestForm.value.vessel}/${this.manifestForm.value.voyage}/list`])
        });
    }

  }

  routeToMenifest() {
    this.router.navigate(['manifest'])
  }
  reset() {
    this.manifestForm.get('vessel').setValue('')
    this.manifestForm.get('voyage').setValue('')
    this.manifestForm.get('blbatchno').setValue('')

  }
}