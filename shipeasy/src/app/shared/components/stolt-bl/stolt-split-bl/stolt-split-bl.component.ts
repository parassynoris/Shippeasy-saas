import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ApiService } from 'src/app/admin/principal/api.service';
import { CommonService } from 'src/app/services/common/common.service';
import * as Constant from 'src/app/shared/common-constants';


@Component({
  selector: 'app-stolt-split-bl',
  templateUrl: './stolt-split-bl.component.html',
  styleUrls: ['./stolt-split-bl.component.scss'],
})
export class StoltSplitBlComponent implements OnInit {
  @Input() public BatchIdData;
  @Input() public BatchIdDataDetail;
  @Output() public getBl = new EventEmitter()
  constructor(private _api: ApiService, 
     private notification: NzNotificationService,
    private modalService: NgbModal, 
    private commonService: CommonService) { 
      this._api = _api;
      this.notification = notification;
      this.modalService = modalService;
      this.commonService = commonService
    }

  urlParam: any;
  currentUrl: any;
  order: boolean = true;
  toalLength: any;
  size = 20;
  page = 1;
  count = 0;
  blData: any = [];
  blDetails: any;
  billDetail: any;
  fromSize: number = 1;
  batchNo: any;
  moveNo: any;
  blNo: any;
  blType: any;
  blDate: any;
  containerNo: any;
  containers: any;
  shipperName: any;
  consigneeName: any;
  blDataArray: any;
  isSelected: boolean;
  selectedContainersArr: any = [];
  blDataUnselected: any = [];
  index: any = 0;

  ngOnInit(): void {

    this.blData = []
    this.blDataUnselected = []
    this.blNo = ""
    this.blType = ""
    this.blDate = ""
    this.shipperName = ""
    this.consigneeName = ""

    if (this.BatchIdData) {
      this.billDetail = this.BatchIdDataDetail
      this.blData = this.BatchIdData.containers
      this.blDataUnselected = this.BatchIdData.containers
      this.blDetails = this.BatchIdData
      this.blNo = this.BatchIdData.blNumber
      this.blType = this.BatchIdData.blType
      this.blDate = this.BatchIdData.blDate
      this.shipperName = this.BatchIdData.shipperName
      this.consigneeName = this.BatchIdData.consigneeName
    }

  }

  onSplitBatch() {
    if (this.isSelected) {
      this.selectedContainersArr = this.blData
    }

    if (this.selectedContainersArr && this.selectedContainersArr.length > 0) {

      let arr = []
      var blDetails = this.BatchIdDataDetail
      this.blDataUnselected.forEach((element, index) => {
        if ((this.selectedContainersArr.findIndex((a) => a.containerNumber === this.blDataUnselected[index].containerNumber)) == -1) {
          arr.push(this.blDataUnselected[index])
        }
      });
      blDetails.containers = arr
      var billDetail = JSON.parse(localStorage.getItem('blData'))
      billDetail.containers = this.selectedContainersArr
      billDetail.indexNo = blDetails.indexNo

      blDetails.indexNo = billDetail.indexNo
      this.index = billDetail.indexNo
      this.index = this.index == undefined ? 0 : this.index + 1
      blDetails.apiType = 'status'
      billDetail.apiType = 'status'
      const letter = String.fromCharCode(this.index + 'A'.charCodeAt(0))

      let blno = billDetail.blNumber.includes('-') ? billDetail.blNumber.split('-')[0] : billDetail.blNumber

      billDetail.blNumber = blno + "-" + letter
      blDetails.indexNo = blDetails.indexNo || blDetails.indexNo >= 0 ? blDetails.indexNo + 1 : 0
      billDetail.indexNo = billDetail.indexNo || billDetail.indexNo >= 0 ? billDetail.indexNo + 1 : 0
      this.commonService.UpdateToST(`${Constant.UPDATE_BL}/${blDetails.blId}`, blDetails).subscribe(() => {

        delete billDetail.blId
        delete billDetail._id
        this._api.addToST(Constant.ADD_BL, billDetail).subscribe((data1: any) => {

          if (data1) {

            this.notification.create('success', 'Bill Splitted Successfully', '');



            setTimeout(() => {
              this.modalService.dismissAll()
              this.getBl.emit(true)
            }, 1000);
          }
          else {
            this.notification.create('error', 'Error in Splitting Successfully', '');
          }

        });
      });

    }
    else {
      this.notification.create('error', 'Please Select Atleast One Container', '');
    }

  }

  getblData() {
    let payload = this.commonService.filterList()
    payload.query = {
      'batchId': this.BatchIdData.batchId,
    }
    this._api.getSTList(Constant.BL_LIST, payload)
      .subscribe((data: any) => {
        this.blData = data.documents;

      });
  }


  allSelect() {
    this.isSelected = !this.isSelected;
  }

  selectContainer(container: any, e: any) {

    if (e.target.checked) {
      this.selectedContainersArr.push(container);


    } else {
      this.selectedContainersArr.splice(
        this.selectedContainersArr.findIndex((a) => a.containerNo === container.containerNo),
        1
      );
    }

  }

  search() {
    let payload = this.commonService.filterList()
    payload.query = {
    }
    this._api.getSTList(Constant.BL_LIST, payload)
      .subscribe((data: any) => {
        this.blData = data.documents;
        this.toalLength = data.totalCount;
        this.count = data.documents.length;
      });
  }
  clear() {
    this.blNo = '';
    this.containerNo = '';
    this.moveNo = '';
    this.batchNo = '';
  }


  onClose() {
    this.modalService.dismissAll()
  }




}
