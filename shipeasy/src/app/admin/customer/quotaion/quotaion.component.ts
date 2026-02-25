import { Component, OnInit, ViewChild } from '@angular/core';
import { shared } from '../data';
import { CommonService } from 'src/app/services/common/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-quotaion',
  templateUrl: './quotaion.component.html',
  styleUrls: ['./quotaion.component.scss']
})
export class QuotaionComponent implements OnInit {

  size: number = 10000;
  sizecheck = 10;
  page = 0;
  count = 0;
  fromSize: number = 1;
  total: number;
  pageCount: any = this.commonFunction.pageNo;
  loading = true;
  _gc = GlobalConstants;
  productData: any = [];
  isShowSerch: boolean = false;
  sortName: any;
  currentUrl: string;
  searchText = '';
  customerType:string='';
  @ViewChild('paginator', { static: true })
  quotationTag = [];
  freightTypeTag = [];
  Default = 'All'; 
  activeTab = 'All';
  tablist=['All','Export','Import']
  constructor(private commonService: CommonService,    private route: ActivatedRoute, public router: Router, public commonFunction: CommonFunctions, private datePipe: DatePipe,) {
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();
  }
  setPageNo(n) {
    this.commonFunction.pageNo = n
  }
  ngOnInit(): void {
    this.customerType = localStorage.getItem('customerType') ??  'Export';

   this.quotationTag = [
      // { milestone: 'Inquiry Received', tag: 'InquiryReceived' }, 
      // { milestone: 'Inquiry Submitted', tag: 'InquirySubmitted' },
      // { milestone: 'Inquiry Created', tag: 'InquiryCreated' },
      // { milestone: 'Inquiry Accepted', tag: 'InquiryAccepted' }, Awaiting Review
      { milestone: 'Requested', tag: 'Requested' },
      { milestone: 'Awaiting Review', tag: 'AwaitingReview' },
      // { milestone: 'Requote submitted', tag: 'Requotesubmitted' },
      { milestone: 'Requoted', tag: 'Requoted' },
  
      { milestone: 'Accepted', tag: 'Accepted' },
      // { milestone: 'Job Created', tag: 'JobCreated' },
      { milestone: 'Rejected', tag: 'Rejected' }
    ]
    this.freightTypeTag = [
      { milestone: 'Air', tag: 'Air' },
      { milestone: 'Ocean', tag: 'Ocean' },
      { milestone: 'Land', tag: 'Land' },
    ]
    const urlSegments = this?.route?.snapshot?.url; 
    let secondLastSegment ;
    if (urlSegments?.length > 1) {
      secondLastSegment = urlSegments[urlSegments.length - 2].path; 
    } 
    if(secondLastSegment === 'Import' || secondLastSegment === 'Export'){
      this.activeTab = secondLastSegment;
      this.getData(secondLastSegment);
    }else{
      this.getData(this.Default);
    }
    
  }
  routetodata(product){
    const id=product?.enquiryId??product?.agentadviceId;
    const Type=product?.enquiryId?'Export':'Import';
    this.router.navigate(['/customer/quotation/list/' +id ],{ queryParams:{customerType:Type}});
  }
  getdatabyType(name: string) {
    this.activeTab = name;
    if (name === 'All') {
      this.router.navigate(['/customer/quotation/list']);
      // this.getData('All');
    } else {
      this.router.navigate(['/customer/quotation/' + name + '/list']);
      // this.Default = name;  // Export or Import
      localStorage.setItem('customerType', name);
      // this.getData(name);
    }
  }
  
  routerLink(quote) {
    this.router.navigate(['/customer/quotation/' + quote?.enquiryId]);
  }
  
  getData(type?) {
    localStorage.removeItem('quotation-data');
    this.loading = true;
    if (type === 'All') {
      const payloadExport = this.commonService.filterList();
      payloadExport.query = {
        "basicDetails.shipperId": this.commonFunction?.getAgentDetails()?.customerId,
      };
  
      const payloadImport = this.commonService.filterList();
      payloadImport.query = {
        "basicDetails.shipperId": this.commonFunction?.getAgentDetails()?.customerId,
      };
      forkJoin({
        enquiry: this.commonService.getSTList('enquiry', payloadExport),
        agentadvice: this.commonService.getSTList('agentadvice', payloadImport)
      }).subscribe(
        (res: any) => {
          this.loading = false;
  
          const enquiryData = res.enquiry?.documents || [];
          const agentadviceData = res.agentadvice?.documents?.map((doc: any) => ({
            ...doc,
            enquiryNo: doc?.agentadviceNo,
          })) || [];
          this.productData = [...enquiryData, ...agentadviceData];
          this.productData.sort((a,b)=> {
            return new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime();
          })          
        },
        () => {
          this.loading = false;
        }
      );
    }
    else if (type === 'Export' || type === 'Import') {
      let payload = this.commonService.filterList();
      payload.query = {
        "basicDetails.shipperId": this.commonFunction?.getAgentDetails()?.customerId,
      };
  
      const listType = type === 'Export' ? 'enquiry' : 'agentadvice';
  
      this.commonService.getSTList(listType, payload)?.subscribe(
        (res: any) => {
          this.loading = false;
          this.productData = type === 'Export' ? res.documents : res.documents?.map((doc: any) => ({
            ...doc,
            enquiryNo: doc?.agentadviceNo,
          }));
        },
        () => {
          this.loading = false;
        }
      );
    }
  }



  onPageChange(e) {
    this.pageCount = e;
  }
  clearSearch() {
    this.searchText = ''; 
    this.getData(this.activeTab); 
}
  searchGlobal(e, type) {
    let query = e.target.value.trim(); 
    if (query.length === 0 && !this.searchText) {
      return;
  }

  if (!query) {
      this.clearSearch();
      return;
  }
    if (query) {
        let shouldArray = [
          {
            "$or": [
                { "enquiryNo": { "$regex": query, "$options": "i" } },
                { "agentadviceNo": { "$regex": query, "$options": "i" } }
            ]
        },
            { "routeDetails.loadPlaceName": { "$regex": query, "$options": "i" } },
            { "routeDetails.loadPortName": { "$regex": query, "$options": "i" } },
            { "basicDetails.ShipmentTypeName": { "$regex": query, "$options": "i" } },
            { "routeDetails.locationName": { "$regex": query, "$options": "i" } },
            { "routeDetails.destPortName": { "$regex": query, "$options": "i" } },
            { "routeDetails.shippingLineName": { "$regex": query, "$options": "i" } }
        ];

        let parameter = {
            "project": [],
            "query": {
                "basicDetails.shipperId": this.commonFunction.getAgentDetails().customerId,
                "$or": shouldArray
            },
            "sort": { "desc": ["createdOn"] },
            size: this.size,
            from: 0,
        };

        if (type === 'All') {
            forkJoin({
                enquiry: this.commonService.getSTList('enquiry', parameter),
                agentadvice: this.commonService.getSTList('agentadvice', parameter)
            }).subscribe((res: any) => {
                const enquiryData = res.enquiry?.documents || [];
                const agentadviceData = res.agentadvice?.documents?.map((doc: any) => ({
                    ...doc,
                    enquiryNo: doc?.agentadviceNo,
                })) || [];
                this.productData = [...enquiryData, ...agentadviceData];
            });
           
        } else {
            const listType = type === 'Export' ? 'enquiry' : 'agentadvice';
            this.commonService.getSTList(listType, parameter)
                .subscribe((res: any) => {
                    this.productData = type === 'Export' 
                      ? res.documents 
                      : res.documents?.map((doc: any) => ({
                        ...doc,
                        enquiryNo: doc?.agentadviceNo,
                    }));
                });
      
        }
    }
}


  onFilterSubmit(e) {
    this.loading = true;
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
      "basicDetails.shipperId": this.commonFunction.getAgentDetails().customerId,
    }

    if (e.fromDate && e.toDate) {
      let StartDate = this.datePipe.transform(e.fromDate, 'yyyy-MM-dd')
      let EndDate = this.datePipe.transform(e.toDate, 'yyyy-MM-dd')

      payload.query["createdOn"] = {
        "$gt": StartDate.substring(0, 10) + 'T00:00:00.000Z',
        "$lt": EndDate.substring(0, 10) + 'T23:59:00.000Z'
      }

    }
    if (shipmentTypes.length > 0) {
      if (payload) {
        payload.query["basicDetails.ShipmentTypeName"] = {
          $in: shipmentTypes
        };
      }
    }
    if (e.quoteStatuses.length > 0) {
      payload.query["enquiryStatusCustomer"] = {
        "$in": e.quoteStatuses
      }
    }
    if (e.fromLocation.portId) {
      payload.query["routeDetails.loadPortId"] = e.fromLocation.portId
    }
    if (e.toLocation.portId) {
      payload.query["routeDetails.destPortId"] = e.toLocation.portId
    }

    this.commonService.getSTList('enquiry', payload)
      ?.subscribe((res: any) => {
        this.loading = false;
        this.productData = res.documents

      }, () => {
        this.loading = false;
      })

  }
  onClearFilter() {
    this.getData()
  }

}
