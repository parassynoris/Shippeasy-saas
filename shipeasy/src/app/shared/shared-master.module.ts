import { NgModule } from '@angular/core';
import { SharedCoreModule } from './shared-core.module';

import { AgreementComponent } from './components/agreement/agreement.component';
import { AddagreementComponent } from './components/agreement/addagreement/addagreement.component';
import { ClauseComponent } from './components/clause/clause.component';
import { AddclauseComponent } from './components/clause/addclause/addclause.component';
import { ContactsComponent } from './components/contacts/contacts.component';
import { AddcontactComponent } from './components/contacts/addcontact/addcontact.component';
import { HolidaysComponent } from './components/holidays/holidays.component';
import { AddholidayComponent } from './components/holidays/addholiday/addholiday.component';
import { BranchComponent } from './components/branch/branch.component';
import { AddbranchComponent } from './components/branch/addbranch/addbranch.component';
import { DepartmentComponent } from './components/department/department.component';
import { AddDepartmentComponent } from './components/department/adddepartment/adddepartment.component';
import { UserComponent } from './components/user/user.component';
import { AdduserComponent } from './components/user/adduser/adduser.component';
import { UserRoleComponent } from './components/user-role/user-role.component';
import { AddUserRoleComponent } from './components/user-role/add-user-role/add-user-role.component';
import { SystemTypeComponent } from './components/system-type/system-type.component';
import { AddsystemtypeComponent } from './components/system-type/addsystemtype/addsystemtype.component';
import { ShippingLineComponent } from './components/shipping-line/shipping-line.component';
import { VesselComponent } from './components/vessel/vessel.component';
import { AddvesselComponent } from './components/vessel/addvessel/addvessel.component';
import { VoyageComponent } from './components/voyage/voyage.component';
import { AddvoyageComponent } from './components/voyage/addvoyage/addvoyage.component';
import { ServicesComponent } from './components/services/services.component';
import { UomComponent } from './components/uom/uom.component';
import { ProductComponent } from './components/product/product.component';
import { AddProductComponent } from './components/product/add-product/add-product.component';
import { AddnewtemplateComponent } from './components/pda-templates/pda-list/addnewtemplate/addnewtemplate.component';
import { PdaListComponent } from './components/pda-templates/pda-list/pda-list.component';
import { PdacostListComponent } from './components/pda-templates/pdacost-list/pdacost-list.component';
import { AddPdaCostitemComponent } from './components/pda-templates/pdacost-list/add-pda-costitem/add-pda-costitem.component';
import { PDATemplatesComponent } from './components/pda-templates/pda-templates.component';
import { EmployeeMasterComponent } from './components/employee-master/employee-master.component';
import { CfsMasterComponent } from './components/cfs-master/cfs-master.component';
import { ShippingLineMasterComponent } from './components/shipping-line-master/shipping-line-master.component';
import { SurveryorMasterComponent } from './components/surveryor-master/surveryor-master.component';
import { PartyMasterComponent } from '../../admin/party-master/party-master.component';
import { AddPartyComponent } from '../../admin/party-master/add-party/add-party.component';

import { DepartmentMasterComponent } from './components/sa-masters/department-master/department-master.component';
import { AgencytypeMasterComponent } from './components/sa-masters/agencytype-master/agencytype-master.component';
import { SegmentMasterComponent } from './components/sa-masters/segment-master/segment-master.component';
import { PortMasterComponent } from './components/sa-masters/port-master/port-master.component';
import { AddPortMasterComponent } from './components/sa-masters/port-master/add-port-master/add-port-master.component';
import { ShipstatusMasterComponent } from './components/sa-masters/shipstatus-master/shipstatus-master.component';
import { VesselMasterComponent } from './components/sa-masters/vessel-master/vessel-master.component';
import { VesselcallMasterComponent } from './components/sa-masters/vesselcall-master/vesselcall-master.component';
import { VesselcallPurposeMasterComponent } from './components/sa-masters/vesselcall-purpose-master/vesselcall-purpose-master.component';
import { EnquiryTypeMasterComponent } from './components/sa-masters/enquiry-type-master/enquiry-type-master.component';
import { CommodityMasterComponent } from './components/sa-masters/commodity-master/commodity-master.component';
import { CargoMasterComponent } from './components/sa-masters/cargo-master/cargo-master.component';
import { PackagetypeMasterComponent } from './components/sa-masters/packagetype-master/packagetype-master.component';
import { UserMasterComponent } from './components/sa-masters/user-master/user-master.component';
import { BankMasterComponent } from './components/sa-masters/bank-master/bank-master.component';
import { ClauseMasterComponent } from './components/sa-masters/clause-master/clause-master.component';
import { CountryMasterComponent } from './components/sa-masters/country-master/country-master.component';
import { CurrencyMasterComponent } from './components/sa-masters/currency-master/currency-master.component';
import { AgencyTypeMasterComponent } from './components/sa-masters/agency-type-master/agency-type-master.component';
import { CategoryMasterComponent } from './components/sa-masters/category-master/category-master.component';
import { CommodityGroupMasterComponent } from './components/sa-masters/commodity-group-master/commodity-group-master.component';
import { TriffDetailMasterComponent } from './components/sa-masters/triff-detail-master/triff-detail-master.component';
import { TriffHdrMasterComponent } from './components/sa-masters/triff-hdr-master/triff-hdr-master.component';
import { VessalMasterComponent } from './components/sa-masters/vessal-master/vessal-master.component';
import { VesselTypeMasterComponent } from './components/sa-masters/vessel-type-master/vessel-type-master.component';
import { VendorMasterComponent } from './components/sa-masters/vendor-master/vendor-master.component';
import { VendorTypeMasterComponent } from './components/sa-masters/vendor-type-master/vendor-type-master.component';
import { StateCityMasterComponent } from './components/sa-masters/state-city-master/state-city-master.component';
import { StateMasterComponent } from './components/sa-masters/state-master/state-master.component';
import { CityMasterComponent } from './components/sa-masters/city-master/city-master.component';
import { ContainerMasterComponent } from './components/sa-masters/container-master/container-master.component';
import { TemplateMasterComponent } from './components/sa-masters/template-master/template-master.component';
import { YardCfsMasterComponent } from './components/sa-masters/yard-cfs-master/yard-cfs-master.component';
import { ContainerSurveyComponent } from './components/sa-masters/container-survey/container-survey.component';
import { ContainerHistoryComponent } from './components/sa-masters/container-survey/container-history/container-history.component';
import { ICDMasterComponent } from './components/sa-masters/icd-master/icd-master.component';
import { TdsSlabsComponent } from './components/sa-masters/tds-slabs/tds-slabs.component';
import { SacComponent } from './components/sa-masters/sac/sac.component';
import { DriverMasterComponent } from './components/sa-masters/driver-master/driver-master.component';
import { RailFleetComponent } from './components/sa-masters/rail-fleet/rail-fleet.component';
import { OcenFleetComponent } from './components/sa-masters/ocen-fleet/ocen-fleet.component';
import { LandFleetComponent } from './components/sa-masters/land-fleet/land-fleet.component';
import { ActivityMasterComponent } from './components/sa-masters/activity-master/activity-master.component';
import { AirportMasterComponent } from './components/sa-masters/airport-master/airport-master.component';
import { AddAirportComponent } from './components/sa-masters/airport-master/add-airport/add-airport.component';
import { MilestoneMasterComponent } from './components/sa-masters/milestone-master/milestone-master.component';
import { NewWareHouseDoucmentComponent } from './components/sa-masters/main-ware-house/ware-house-bill-of-entry/new-ware-house-doucment/new-ware-house-doucment.component';
import { ActivityMappingComponent } from './components/activity-mapping/activity-mapping.component';
import { AddActivityMappingComponent } from './components/activity-mapping/add-activity-mapping/add-activity-mapping.component';
import { CostItemMappingComponent } from './components/cost-item-mapping/cost-item-mapping.component';
import { AddItemMapComponent } from './components/cost-item-mapping/add-item-map/add-item-map.component';
import { CostHeadMappingComponent } from './components/cost-head-mapping/cost-head-mapping.component';
import { AddHeadMapComponent } from './components/cost-head-mapping/add-head-map/add-head-map.component';
import { PortMappingComponent } from './components/port-mapping/port-mapping.component';
import { AddPortMappingComponent } from './components/port-mapping/add-port-mapping/add-port-mapping.component';
import { PortActivityMappingComponent } from './components/port-activity-mapping/port-activity-mapping.component';
import { AddPortActivityMappingComponent } from './components/port-activity-mapping/add-port-activity-mapping/add-port-activity-mapping.component';

const MASTER_COMPONENTS = [
  AgreementComponent, AddagreementComponent,
  ClauseComponent, AddclauseComponent,
  ContactsComponent, AddcontactComponent,
  HolidaysComponent, AddholidayComponent,
  BranchComponent, AddbranchComponent,
  DepartmentComponent, AddDepartmentComponent,
  UserComponent, AdduserComponent,
  UserRoleComponent, AddUserRoleComponent,
  SystemTypeComponent, AddsystemtypeComponent,
  ShippingLineComponent,
  VesselComponent, AddvesselComponent,
  VoyageComponent, AddvoyageComponent,
  ServicesComponent, UomComponent,
  ProductComponent, AddProductComponent,
  AddnewtemplateComponent, PdaListComponent,
  PdacostListComponent, AddPdaCostitemComponent,
  PDATemplatesComponent,
  EmployeeMasterComponent, CfsMasterComponent,
  ShippingLineMasterComponent, SurveryorMasterComponent,
  PartyMasterComponent, AddPartyComponent,
  DepartmentMasterComponent, AgencytypeMasterComponent,
  SegmentMasterComponent, PortMasterComponent, AddPortMasterComponent,
  ShipstatusMasterComponent, VesselMasterComponent,
  VesselcallMasterComponent, VesselcallPurposeMasterComponent,
  EnquiryTypeMasterComponent, CommodityMasterComponent,
  CargoMasterComponent, PackagetypeMasterComponent,
  UserMasterComponent, BankMasterComponent,
  ClauseMasterComponent, CountryMasterComponent,
  CurrencyMasterComponent, AgencyTypeMasterComponent,
  CategoryMasterComponent, CommodityGroupMasterComponent,
  TriffDetailMasterComponent, TriffHdrMasterComponent,
  VessalMasterComponent, VesselTypeMasterComponent,
  VendorMasterComponent, VendorTypeMasterComponent,
  StateCityMasterComponent, StateMasterComponent, CityMasterComponent,
  ContainerMasterComponent, TemplateMasterComponent,
  YardCfsMasterComponent, ContainerSurveyComponent, ContainerHistoryComponent,
  ICDMasterComponent, TdsSlabsComponent, SacComponent,
  DriverMasterComponent, RailFleetComponent, OcenFleetComponent, LandFleetComponent,
  ActivityMasterComponent, AirportMasterComponent, AddAirportComponent,
  MilestoneMasterComponent, NewWareHouseDoucmentComponent,
  ActivityMappingComponent, AddActivityMappingComponent,
  CostItemMappingComponent, AddItemMapComponent,
  CostHeadMappingComponent, AddHeadMapComponent,
  PortMappingComponent, AddPortMappingComponent,
  PortActivityMappingComponent, AddPortActivityMappingComponent,
];

@NgModule({
  imports: [SharedCoreModule],
  declarations: [...MASTER_COMPONENTS],
  exports: [...MASTER_COMPONENTS],
})
export class SharedMasterModule {}
