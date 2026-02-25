import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ApiService } from '../../principal/api.service';
import * as Constant from 'src/app/shared/common-constants';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { SharedService } from 'src/app/shared/services/shared.service';
import { FinanceService } from 'src/app/services/Finance/finance.service';
import { CommonService } from 'src/app/services/common/common.service';
@Component({
  selector: 'app-update-checklist',
  templateUrl: './update-checklist.component.html',
  styleUrls: ['./update-checklist.component.scss']
})
export class UpdateChecklistComponent implements OnInit {
  houseBlList: any = []
  vesseldata: any;
  voyageData: any;
  Documentpdf: any;
  tankData: any = [];
  shippingLineList: any = [];

  constructor(private router: Router,
    private location: Location,
    private _api: ApiService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private _FinanceService: FinanceService,
    private _sharedService: SharedService,
    private masterservice: MastersService,
    private notification: NzNotificationService) { }

  ngOnInit(): void {
    this.getBLById()
    this.getVesselData()
    this.getShippingLineDropDowns()
  }
  PrintBL() {
    let Bls = this.houseBlList.filter(res => res?.emailSent === 'true')?.map((te: any) => { return te });
    if (Bls?.length) {
      let bldetals = Bls?.[0];
      let BLData = [{
        "blsForm3": Bls?.map(bl => { return { id: bl?.blId } })
      }]
      this.commonService.batchUpdate(Constant.BL_LIST_UPDATE, [BLData]).subscribe((res: any) => {
        // if (res) {
        //   let reportpayload: any;
        //   let url = 'Form3';
        //   reportpayload = { "parameters": { "blID": bldetals?.blId } };
        //   this.commonService.pushreports(reportpayload, url).subscribe({
        //     next: (res: any) => {
        //       const blob = new Blob([res], { type: 'application/pdf' });
        //       let temp = URL.createObjectURL(blob);
        //       this.Documentpdf = temp;
        //       const pdfWindow = window.open(temp);
        //       pdfWindow.print();
        //       this.updateBlsrecord(bldetals?.blId);
        //     }
        //   })
        // }
      });
    }
  }
  updateBlsrecord(blid) {
    let BLData = [{
      "blsForm3": []
    }]
    this.commonService.batchUpdate(Constant.BL_LIST_UPDATE, [BLData]).subscribe();
  }
  getShippingLineDropDowns() {

    let payload = this.commonService.filterList()

    payload.query = {   "$and": [
      {
        "feeder": {
          "$ne": true
        }
      }
    ], "status": true }

    this.commonService.getSTList("shippingline", payload).subscribe((res: any) => {
      this.shippingLineList = res?.documents;
    });
  }
  getVesselData() {
    let payload = this.commonService.filterList()

    payload.query = {}

    this.commonService.getSTList("vessel", payload).subscribe((res: any) => {
      this.vesseldata = res.documents.filter(x => x.vesselId === this.route.snapshot.params['vesId'])[0]?.vesselName
      this.voyageData = this.route.snapshot.params['voyId']
    });
  }
  getBLById() {
    let payload = this.commonService.filterList()

    payload.query = { "vessel": this.route.snapshot.params['vesId'], "isExport": true }

    this.commonService.getSTList("bl", payload)
      .subscribe((res: any) => {
        this.houseBlList = res?.documents;
        res?.documents?.map((x) => {
          x.shippingLineId = x.shippingLineId || ''
        })
      });
  }
  updateBl() {
    let BLData = [];
    this.houseBlList?.forEach(element => {
      BLData.push({
        ...element,
        emailSent: element?.emailSent || false
      })
    });
    this.commonService.batchUpdate(Constant.BL_LIST_UPDATE, BLData).subscribe((res) => {
      this.notification.create('success', 'Updated Successfully', '');
      this.back()
    });
  }


  back() {
    this.location.back();
  }
  podName: any
  fpodName: any
  xyz: any
  pod: any
  fpod: any
  blNo: any
  pooname: any
  polname: any
  consignee: any
  notify: any
  cargo: any
  shipmentterm: any
  departureMode: any
  cargotype: any
  containers: any
  containersType: any
  remarks: any
  check: any
  emailDate: any
  search() {


    let mustArray = {};

    mustArray['vessel'] = this.route.snapshot.params['vesId']
    mustArray['voyageId'] = this.route.snapshot.params['voyId']




    if (this.blNo) {
      mustArray['blNumber'] = {
        "$regex": this.blNo.toLowerCase(),
        "$options": "i"
      }
    }
    if (this.pooname) {
      mustArray['importPooName'] = {
        "$regex": this.pooname.toLowerCase(),
        "$options": "i"
      }
    }
    if (this.polname) {
      mustArray['importPolName'] = {
        "$regex": this.polname.toLowerCase(),
        "$options": "i"
      }
    }
    if (this.podName) {
      mustArray['importPodName'] = {
        "$regex": this.podName.toLowerCase(),
        "$options": "i"
      }
    }
    if (this.fpodName) {
      mustArray['importFpodName'] = {
        "$regex": this.fpodName.toLowerCase(),
        "$options": "i"
      }
    }
    if (this.shipmentterm) {
      mustArray['shippingTerm'] = {
        "$regex": this.shipmentterm.toLowerCase(),
        "$options": "i"
      }
    }


    if (this.consignee) {
      mustArray['consigneeName'] = {
        "$regex": this.consignee.toLowerCase(),
        "$options": "i"
      }
    }
    if (this.notify) {
      mustArray['notify_party1Name'] = {
        "$regex": this.notify.toLowerCase(),
        "$options": "i"
      }
    }

    if (this.containers) {
      mustArray['containers.containerNumber'] = {
        "$regex": this.containers.toLowerCase(),
        "$options": "i"
      }
    }
    if (this.containersType) {
      mustArray['containersType.containerType'] = {
        "$regex": this.containers.toLowerCase(),
        "$options": "i"
      }
    }
    if (this.check) {
      mustArray['emailSent'] = {
        "$regex": this.check.toLowerCase(),
        "$options": "i"
      }
    }
    if (this.remarks) {
      mustArray['remarks'] = {
        "$regex": this.remarks.toLowerCase(),
        "$options": "i"
      }
    }

    if (this.emailDate) {
      mustArray['updatedOn'] = {
        "$gt": this.emailDate.substring(0, 10) + 'T00:00:00.000Z',
        "$lt": this.emailDate.substring(0, 10) + 'T23:59:00.000Z'
      }
    }

    let payload = this.commonService.filterList()

    payload.query = mustArray

    this.commonService.getSTList("bl", payload)
      .subscribe((res: any) => {
        this.houseBlList = res.documents
      })
  }
}
