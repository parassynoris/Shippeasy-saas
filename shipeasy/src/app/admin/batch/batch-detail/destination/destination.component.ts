import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { BaseBody } from 'src/app/admin/smartagent/base-body';
import * as Constant from 'src/app/shared/common-constants';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
import { ApiService } from 'src/app/admin/principal/api.service';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { CommonService } from 'src/app/services/common/common.service';
import { Location, PortDetails } from 'src/app/models/yard-cfs-master';


@Component({
  selector: 'app-destination',
  templateUrl: './destination.component.html',
  styleUrls: ['./destination.component.scss']
})
export class DestinationComponent implements OnInit, OnDestroy {
  ngOnDestroy(): void {
  }
  @Input()consolidationbooking; 
  @Input() isConsolidate;
  routeForm: FormGroup;
  isExpand: boolean = false;
  holdControl: any;
  holdBatchType: any = '';
  submitted: boolean;
  baseBody: any;
  enquiryList: any = [];
  shippingLineList: any;
  vesseldata = [];
  voyageData: any = [];
  PortData: PortDetails[] = [];
  locationData: Location[] = [];
  currencyData: any = [];
  voyage: any = [];
  batchDetail: any = [];
  id: any;
  preCarrigeList: any = [];
  onCarrigeList: any = [];
  enquiryDetail: any;
  ICDlocationList: any = [];
  loadPortList: any = [];
  destPortList: any = [];
  voyageListData: any = [];
  finalvoyageData: any = [];
  isExport: boolean = false;
  urlParam: any;
  isShow: boolean = false;
  public touchUi = false;
  public color = 'primary';
  public enableMeridian = true;
  constructor(
    public router: Router,
    private formBuilder: FormBuilder,
    public notification: NzNotificationService,
    private mastersService: MastersService,
    private saMasterService: SaMasterService,
    public _api: ApiService,
    private route: ActivatedRoute,
    private sortPipe: OrderByPipe,
    private commonService: CommonService
  ) {
    this.isExport = localStorage.getItem('isExport') === 'false' ? false : true;
    this.route.params.subscribe((params) => (this.urlParam = params));
    this.isShow = this.urlParam?.access == 'show' ? true : false;;
    this.routeForm = this.formBuilder.group({
      atdPortDest: [''],
      onCarriage: [''],
      storageIn: [''],
      storageOut: [''],
      deliveryDate: [''],
      emptyReturnDate: [''],

    });
  }
  sort(array, key) {
    return this.sortPipe.transform(array, key);
  }
  get f() {
    return this.routeForm.controls;
  }
  currentUrl: string;
  show: boolean = false;
  ngOnInit(): void {
    this.getLocation()
    this.id = this.route.snapshot.params['id'];
    this.getBatchById(this.id)
    this.currentUrl = this.router.url.split('?')[0].split('/')[3]
    if (this.currentUrl === 'show') {
      this.routeForm.disable();
      this.show = true
    }
  }
  getLocation() {

    let payload = this.commonService.filterList()
  
      if(payload) payload.query = {
        status: true,
        masterType:   {
          "$in": ['YARD','CFS','ICD']
        },
      }
  
  
      this.commonService.getSTList("location", payload)?.subscribe((res: any) => {
        this.locationData = res.documents;
        this.ICDlocationList = res?.documents;
        this.onCarrigeList = this.ICDlocationList
        // this.preCarrigeList1 = res?.documents.filter(x => x?.country?.toLowerCase() === 'india')
      });
  }
  getBatchById(id) {


    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      batchId: id,
    }
    if(this.isConsolidate){
      const batchIds=this.consolidationbooking?.batchwiseGrouping?.map((bt)=>{return{ "batchId": bt?.batchId }});
      if (payload?.query) payload.query ={  $or:batchIds}
    }

    this._api
      .getSTList(Constant.BATCH_LIST, payload)
      ?.subscribe((res: any) => {

        this.batchDetail = res?.documents[0];
        if(this.batchDetail?.statusOfBatch == 'Job Cancelled' || this.batchDetail?.statusOfBatch =='Job Closed'){
          this.routeForm.disable();
          this.isShow=true
        }
        this.routeForm.patchValue({
          atdPortDest: this.batchDetail?.routeDetails?.atdPortDest || '',
          onCarriage: this.batchDetail?.enquiryDetails?.routeDetails?.location || '',
          storageIn: this.batchDetail?.routeDetails?.storageIn || '',
          storageOut: this.batchDetail?.routeDetails?.storageOut || '',
          deliveryDate: this.batchDetail?.routeDetails?.deliveryDate || '',
          emptyReturnDate: this.batchDetail?.routeDetails?.emptyReturnDate || '',
        });
      });
  }

  changeDate(e) {
    if (!e) { return false }
    var event = new Date(e);
    let date = JSON.stringify(event)
    date = date.slice(1, 11)
    return date
  }
  onSave() {
    // this.submitted = true;
    // var url = Constant.BATCH + '/' + this.route.snapshot.params['id'];
    const batchId=this.isConsolidate ? this.batchDetail?.batchId : this.route.snapshot.params['id'];
    this.submitted = true;
    const url = Constant.BATCH + '/' + batchId;

    if (this.routeForm.invalid) {
      return false;
    }

    let payload = {
      ...this.batchDetail, 
      routeDetails: {
        ...this.batchDetail.routeDetails,
        atdPortDest: this.changeDate(this.routeForm.controls.atdPortDest.value) || null,
        storageIn: this.changeDate(this.routeForm.controls.storageIn.value) || null,
        storageOut: this.changeDate(this.routeForm.controls.storageOut.value) || null,
        deliveryDate: this.changeDate(this.routeForm.controls.deliveryDate.value) || null,
        emptyReturnDate: this.changeDate(this.routeForm.controls.emptyReturnDate.value) || null, 
      }
     
    }
    this._api.UpdateToST(url, payload)?.subscribe(
      (res) => {
        if (res) {
          this.notification.create('success', 'Updated Successfully', '');
        }
      },
      (error) => {
        this.notification.create('error', error?.error?.error?.message, '');
      }
    );

  }



  getPortList() {

    let payload = this.commonService.filterList()
    payload.query = {
      status: true,
    }

    payload.size = 15000
    payload.project = ["portDetails.portName", "portId"];
    this.commonService
      .getSTList('port', payload)
      ?.subscribe((res: any) => {
        this.PortData = res.documents;
      });
  }

  onClose() {
    if(this.isConsolidate){
      this.router.navigate(['/consolidation-booking/list']);
    }
    else{
    this.router.navigate(['/batch/list']);
    }
  }


}
