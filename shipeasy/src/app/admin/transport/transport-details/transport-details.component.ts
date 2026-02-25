import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from 'src/app/services/common/common.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';

@Component({
  selector: 'app-transport-details',
  templateUrl: './transport-details.component.html',
  styleUrls: ['./transport-details.component.scss']
})
export class TransportDetailsComponent implements OnInit {
  enquiryDetails:any;
  currencyList: any = [];
  currentLogin: any;
  constructor(private route : ActivatedRoute,
    private commonService : CommonService,
    public notification: NzNotificationService,
    private modalService: NgbModal,
    private router : Router,
    private commonFunction : CommonFunctions
  ) { 
    this.currentLogin = this.commonFunction.getUserType1()
  }
  showPallet:boolean=false
  typeOfWay:any;
  transportData :any;
  getCurrency() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      status: true,
    }
    this.commonService.getSTList("currency", payload)?.subscribe((res: any) => {
      this.currencyList = res?.documents; 
    })
  }
  ngOnInit(): void {
    this.getCurrency()
    this.getEnquiryList()
  }
  public getEnquiryList() {   
    var parameter = {
      "project": [],
      "query": {
        transportinquiryId : this.route.snapshot.params?.['id']
      },
      "sort": {
        "desc": ["createdOn"]
      }
    }
  
    this.commonService.getSTList('transportinquiry', parameter)
      ?.subscribe((data: any) => { 
        this.transportData = data.documents[0]
        var parameter1 = {
          "project": [],
          "query": {
            enquiryId : data.documents[0]?.enquiryId
          },
          "sort": {
            "desc": ["createdOn"]
          }
        }

        this.commonService.getSTList('enquiry', parameter1)
        .subscribe((data1: any) => { 
          this.enquiryDetails = {...data.documents[0],...data1.documents[0]} 
          let loadName = this.enquiryDetails?.basicDetails?.loadType?.toLowerCase()
          if (loadName) {
            if (['loose', 'lcl', 'ltl','ptl'].includes(loadName)) {
              this.showPallet = true;
              this.showContainer = false;
            } else if (['break bulk'].includes(loadName)) {
              this.showPallet = false;
              this.showContainer = false;
            } else {
              this.showPallet = false;
              this.showContainer = true; 
              if (['fcl'].includes(loadName)) {
                this.typeOfWay = "Container"
              } else if (['uld container'].includes(loadName)) {
                this.typeOfWay = "ULD Container"
              } else if (['ftl'].includes(loadName)) {
                this.typeOfWay = "Truck"
              } else if (['fwl'].includes(loadName)) {
                this.typeOfWay = "Wagon"
              }
            }
          } else {
            this.showPallet = false;
            this.showContainer = false;
          }

          
        })
        
      }, (error) => { 
        this.notification?.create('error', error?.error?.error?.message, '');
      });
  }
  showContainer:boolean=false;
  rateValue:any;
  remarkValue:any;
  currencyValue:any;
  Requotation(Requotations) {
    this.modalService.open(Requotations, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'md',
    })
  }
  submit(e){ 
let payload = {
  ...this.transportData,
  rate : e.value.rateValue || '0',
  remark: e.value.remarkValue || '',
  "carrierStatus": "Submitted",
  currency : {
    currencyName : this.currencyList?.filter((x) => x.currencyId === e.value.currencyValue)[0]?.currencyShortName || '' ,
    currencyId:e.value.currencyValue || '',
  }
}
let url = `transportinquiry/${payload?.transportinquiryId}`
this.commonService.UpdateToST(url, payload)?.subscribe((res: any) => {
  if (res) { 
      this.notification.create('success', `Rate Submitted Successfully..!`, ''); 
      this.modalService.dismissAll()
      this.router.navigate(["/rfq/list"]); 
  }
}, error => {
  this.notification.create(
    'error',
   error?.error?.error?.message,
    ''
  );
});
  }
  back() {
    this.router.navigate([
      '/rfq/list'
    ]);
  }
  totalGrossWeight(arr) {
    let total = 0
    arr?.filter((x) => {
      total += Number(x.grossWeightContainer)
    })
    return total
  }
}
