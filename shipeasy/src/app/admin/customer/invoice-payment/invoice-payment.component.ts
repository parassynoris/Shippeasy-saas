import { Component, OnInit, ViewChild } from '@angular/core';
import { shared } from '../data';
import { CommonService } from 'src/app/services/common/common.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-invoice-payment',
  templateUrl: './invoice-payment.component.html',
  styleUrls: ['./invoice-payment.component.scss']
})
export class InvoicePaymentComponent implements OnInit {
  productData: any = [];
  isShowSerch: boolean = false;
  sortName: any;

  @ViewChild('paginator', { static: true })
  size = 10;
  sizecheck = 10;
  page = 0;
  count = 0;
  fromSize: number = 1;
  total: number;
  pageCount: any = this.commonFunction.pageNo;
  searchText: '';
  InvoiceTag = [
    { milestone: 'Pending', tag: 'Pending' },
    { milestone: 'Partially Paid', tag: 'PartiallyPaid' },
    { milestone: 'Paid', tag: 'Paid' },
    { milestone: 'Unpaid', tag: 'Unpaid' },
    { milestone: 'Overdue', tag: 'Overdue' },
  ] 
  freightTypeTag = [
    { milestone: 'Air', tag: 'Air' },
    { milestone: 'Ocean', tag: 'Ocean' },
    { milestone: 'Land', tag: 'Land' },
  ]
  constructor(private commonService: CommonService, public commonFunction: CommonFunctions, private datePipe: DatePipe) { }

  ngOnInit(): void {
    this.getData()
  }
  setPageNo(n) {
    this.commonFunction.pageNo = n
  }
  getData() {
    localStorage.removeItem('invoice-data')
    let payload = this.commonService.filterList()

    payload.query = {
      "type": 'sellerInvoice',
      "shipperId": this.commonFunction.getAgentDetails().customerId,
      "$and": [{ "principleBill": { "$ne": true } },
      // { "invoiceStatus": { "$ne": "Pending" } }
      ],
      "paymentStatus": {
        "$in": [
          "Paid", 'Partially Paid', "Unpaid" , "Pending"
        ]
      },
    }
    this.commonService.getSTList('invoice', payload)
      ?.subscribe((res: any) => {
        this.productData = res.documents

      })
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
      { "batchNo": { "$regex": query, "$options": "i" } },
      { "invoiceNo": { "$regex": query, "$options": "i" } },
      { "invoiceStatus": { "$regex": query, "$options": "i" } },
      { "invoiceToName": { "$regex": query, "$options": "i" } },
      { "invoiceFromName": { "$regex": query, "$options": "i" } }
    )

    var parameter = {
      "project": [],
      "query": {
        "type": 'sellerInvoice',
        "$and": [{ "principleBill": { "$ne": true } }],
        "shipperId": this.commonFunction.getAgentDetails().customerId,
        "paymentStatus": {
          "$in": [
            "Paid", 'Partially Paid', "Unpaid"
          ]
        },
        "$or": shouldArray
      },
      "sort": {
        "desc": ["createdOn"]
      },
      size: Number(this.size),
      from: 0,
    }
    this.commonService.getSTList('invoice', parameter)
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

    payload.query = {
      "type": 'sellerInvoice',
      "shipperId": this.commonFunction.getAgentDetails().customerId,
      "$and": [{ "principleBill": { "$ne": true } }],
      "paymentStatus": {
        "$in": [
          "Paid", 'Partially Paid', "Unpaid"
        ]
      },
    }


    if (e.invoiceStatuses.length > 0) {
      payload.query["paymentStatus"] = {
        "$in": e.invoiceStatuses
      }
    }
    if (shipmentTypes.length > 0) {
      if (payload) {
        payload.query["ShipmentTypeName"] = {
          $in: shipmentTypes
        };
      }
    }
    if (e.fromDate && e.toDate) {


      let StartDate = this.datePipe.transform(e.fromDate, 'yyyy-MM-dd')
      let EndDate = this.datePipe.transform(e.toDate, 'yyyy-MM-dd')

      payload.query["createdOn"] = {
        "$gt": StartDate.substring(0, 10) + 'T00:00:00.000Z',
        "$lt": EndDate.substring(0, 10) + 'T23:59:00.000Z'
      }

    }
    if (e.fromLocation.portId) {
      payload.query["routeDetails.loadPortId"] = e.fromLocation.portId
    }
    if (e.toLocation.portId) {
      payload.query["routeDetails.destPortId"] = e.toLocation.portId
    }

    this.commonService.getSTList('invoice', payload)
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
