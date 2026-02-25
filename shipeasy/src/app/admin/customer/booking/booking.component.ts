import { Component, OnInit, ViewChild } from '@angular/core';
import { shared } from '../data';
import { CommonService } from 'src/app/services/common/common.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { DatePipe } from '@angular/common';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit {
  productData: any = [];
  isShowSerch: boolean = false;
  sortName: any;
  _gc = GlobalConstants;
  @ViewChild('paginator', { static: true })
  size = 10;
  sizecheck = 10;
  page = 0;
  count = 0;
  fromSize: number = 1;
  total: number;
  loading=false;
  Default = 'All'; 
  activeTab = 'All';
  tablist=['All','Export','Import']
  customerType:string='';
  pageCount: any = this.commonFunction.pageNo;
  searchText = '';
  bookingTag = [  
    { milestone: 'Job Created', tag: 'JobCreated' },
    { milestone: 'Booking Confirmed', tag: 'BookingConfirmed' }, 
    { milestone: 'Job Cancelled', tag: 'JobCancelled' },
    { milestone: 'Job Closed', tag: 'JobClosed' } 
  ]
    freightTypeTag = [
    { milestone: 'Air', tag: 'Air' },
    { milestone: 'Ocean', tag: 'Ocean' },
    { milestone: 'Land', tag: 'Land' },
  ]
  constructor(private commonService: CommonService, public commonFunction: CommonFunctions, private datePipe: DatePipe) { }

  setPageNo(n){
    this.commonFunction.pageNo = n
  }
  ngOnInit(): void {
    this.customerType = localStorage.getItem('customerType') ??  'Export';
    this.getData()
  }
  getdatabyType(name: string) {
    this.activeTab = name;
    this.Default = name === 'All' ? 'All' : name;
    localStorage.setItem('customerType', name);
    this.getData(name);
  }
  getData(type: string = 'All') {
    this.loading = true;
    localStorage.removeItem('booking-data');
  
    const payload = this.commonService.filterList();
    payload.query = {
      "enquiryDetails.basicDetails.shipperId": this.commonFunction.getAgentDetails()?.customerId,
      "enquiryDetails.basicDetails.enquiryTypeName":{$in:['Export','Import']}
    };
  
    if (type === 'Export') {
      payload.query={
        ...payload.query,
        "$or": [{"enquiryDetails.basicDetails.enquiryTypeName": "Export"}]
      }
    } else if (type === 'Import') {
      payload.query={
        ...payload.query,
      "$or": [{"enquiryDetails.basicDetails.enquiryTypeName": "Import"}]
      }
    }
  
    this.commonService.getSTList('batch', payload)?.subscribe((res: any) => {
      this.productData = res.documents;
      this.loading = false;
    },()=>{
      this.loading = false;
    });
  }

  clickOnTop() {
    window.scroll(0, 0);
  }
  
  onPageChange(e) {
    this.pageCount = e;
  }
  
  searchGlobal(e) {
    let query = e.target.value || ''
    let shouldArray = [];
    shouldArray.push(
      { "batchNo": { "$regex": query } },
      { "enquiryDetails.routeDetails.loadPlaceName": { "$regex": query, "$options": "i" } },
      { "enquiryDetails.routeDetails.loadPortName": { "$regex": query, "$options": "i" } },
      { "enquiryDetails.basicDetails.ShipmentTypeName": { "$regex": query, "$options": "i" } },
      { "enquiryDetails.routeDetails.locationName": { "$regex": query, "$options": "i" } },
      { "enquiryDetails.routeDetails.destPortName": { "$regex": query, "$options": "i" } },
      { "enquiryDetails.routeDetails.shippingLineName": { "$regex": query, "$options": "i" } }
    )

    var parameter = {
      "project": [],
      "query": {
        // isExport : true,
        "enquiryDetails.basicDetails.shipperId": this.commonFunction.getAgentDetails().customerId,
        "$or": shouldArray
      },
      "sort": {
        "desc": ["createdOn"]
      },
      size: Number(this.size),
      from: 0,
    }
    this.commonService.getSTList('batch', parameter)
      .subscribe((res: any) => {
        this.productData = res.documents
      });
  }
  onFilterSubmit(e) {
    // this.loading=true; 
    let payload = this.commonService.filterList()
    const shipmentTypes = [];
    if (e.freightType.Land) {
      shipmentTypes.push("Land");
    }
    if (e.freightType.Ocean) {
      shipmentTypes.push("Ocean");
    }
    if (e.freightType.Air) {
      shipmentTypes.push("Air");
    }

    if(payload) payload.query = {
      //   isExport : true,
      // agentadviceId: this.enquiryId,
      "enquiryDetails.basicDetails.shipperId": this.commonFunction.getAgentDetails().customerId,
      // "customerId" : this.commonFunction.getAgentDetails().customerId,
    }
    if(e.bookingStatuses.length > 0){
      if(payload) payload.query["statusOfBatch"] = {
        "$in": e.bookingStatuses
      }
    }
    if (shipmentTypes.length > 0) {
      if (payload) {
        payload.query["enquiryDetails.basicDetails.ShipmentTypeName"] = {
          $in: shipmentTypes
        };
      }
    }
    // payload.query["status"] = e.status

    if (e.fromDate && e.toDate) {


      let StartDate = this.datePipe.transform(e.fromDate, 'yyyy-MM-dd')
      let EndDate = this.datePipe.transform(e.toDate, 'yyyy-MM-dd')

      if(payload)  payload.query["createdOn"] = {
        "$gt": StartDate.substring(0, 10) + 'T00:00:00.000Z',
        "$lt": EndDate.substring(0, 10) + 'T23:59:00.000Z'
      }

    }
    if (e.fromLocation.portId) {
      if(payload?.query)payload.query["enquiryDetails.routeDetails.loadPortId"] = e.fromLocation.portId
    }
    if (e.toLocation.portId) {
      if(payload?.query) payload.query["enquiryDetails.routeDetails.destPortId"] = e.toLocation.portId
    }

    this.commonService.getSTList('batch', payload)
      ?.subscribe((res: any) => {
        this.productData = res.documents

      })

  }
  onClearFilter() {
    this.getData()
  }
  onCloseData(e) {
    // console.log(e)
  }
}
