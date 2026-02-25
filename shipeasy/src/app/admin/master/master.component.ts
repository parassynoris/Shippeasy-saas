import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Navigate } from 'igniteui-angular/lib/drop-down/drop-down.common';

@Component({
  selector: 'app-master',
  templateUrl: './master.component.html',
  styleUrls: ['./master.component.scss']
})
export class MasterComponent {
  url=[
    "chargemaster",
    "location",
    "rate-master",
    "CFS&Yard",
    "icd",
    "UOM",
    "product",
    "pdatemplates",
    "ActivityMaster",
    "user",
    "roles",
    "systemtype",
    "mailtemplate",
    "shipping-line",
    "shipping-line-tariff",
    "local-tariff",
    "tariff-list",
    "vessel",
    "exchange-rate",
    "import-voyage",
    "export-voyage",
    "service",
    "department",
    "activity",
    "costhead",
    "bank",
    "holiday",
    "PrincipalMaster",
    "DepartmentMaster",
    "BankMaster",
    "AgencyTypeMaster",
    "SegmentMaster",
    "PortMaster",
    "ShipStatusMaster",
    "Branch/SubagentMaster",
    "VesselMaster",
    "Rail",
    "Ocan",
    "Land",
    "VesselCallMaster",
    "vesselcallPurposemaster",
    "LineMaster",
    "EnquiryTypeMaster",
    "Commoditymaster",
    "CargoMaster",
    "Vendor-Master",
    "BUSINESS_DEPARTMENT",
    "Charterparty",
    "PackageTypeMaster",
    "clause-master",
    "country-master",
    "stateCitymaster",
    "state-master",
    "surveyor-master",
    "driver-master",
    "milestone-master",
    "city-master",
    "currency-master",
    "Agency-Type",
    "catagory-master",
    "commodity-group-master",
    "commodity-master",
    "port-DA-charge-master",
    "port-tariff-detail",
    "tramp-port-tariff-HDR",
    "TRAMP_PRINCIPAL_MASTER",
    "TRAMP_VESSEL_MASTER",
    "TRAMP_VESSEL_TYPE_MASTER",
    "bond-filing",
    "VENDOR_TYPE_MASTER",
    "customer-GST",
    "container-master",
    "Container-Status",
    "charge-template-master",
    "employee-master",
    "label",
    "tds-slabs",
    "hsn",
    "ocen-fleet",
    "land-fleet",
    "rail-fleet",
    "details"
  ];  
  urlParam: any;
  holdControl: any;
  isTemplateList: boolean = true;
  IsAccess=true;
  constructor(private router: Router, private route: ActivatedRoute) {
    this.route.params.subscribe(params =>{  
      this.urlParam = params;
      this.holdControl = this.urlParam?.key;
    }
    );
    if(!this.url?.find(rr=>rr=== this.holdControl)){
      this.IsAccess=false;
      this.router.navigate(['/not-found'])
    } 
  }

  onTab(data) {
    this.router.navigate(['/master/' + data.key]);
    this.holdControl = data.key
  }

  calculator(){
    window.open('Calculator:///');
}
}
