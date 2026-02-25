import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPrintModule } from 'ngx-print';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { TranslateModule } from '@ngx-translate/core';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { CommonService } from './services/common.service';
import { HttpClientModule } from '@angular/common/http';

import { ChargesComponent } from './components/charges/charges.component';
import { AgreementComponent } from './components/agreement/agreement.component';
import { AddagreementComponent } from './components/agreement/addagreement/addagreement.component';
import { ClauseComponent } from './components/clause/clause.component';
import { AddclauseComponent } from './components/clause/addclause/addclause.component';
import { ContactsComponent } from './components/contacts/contacts.component';
import { AddcontactComponent } from './components/contacts/addcontact/addcontact.component';
import { HolidaysComponent } from './components/holidays/holidays.component';
import { AddholidayComponent } from './components/holidays/addholiday/addholiday.component';
import { InvoiceComponent } from './components/invoice/invoice.component';
import { DocumentComponent } from './components/document/document.component';
import { AddbranchComponent } from './components/branch/addbranch/addbranch.component';
import { BranchComponent } from './components/branch/branch.component';
import { NewInvoiceComponent } from './components/invoice/new-invoice/new-invoice.component';
import { PaymentComponent } from './components/payment/payment.component';
import { NewPaymentComponent } from './components/payment/new-payment/new-payment.component';
import { CreditComponent } from './components/credit/credit.component';
import { NewCreditComponent } from './components/credit/new-credit/new-credit.component';
import { DebitComponent } from './components/debit/debit.component';
import { NewDebitComponent } from './components/debit/new-debit/new-debit.component';
import { PNLComponent } from './components/pnl/pnl.component';
import { BatchCloseComponent } from './components/batch-close/batch-close.component';
import { ArchwizardModule } from 'angular-archwizard';
import { AddchangesComponent } from './components/charges/addchanges/addchanges.component';
import { DiscussionComponent } from './components/discussion/discussion.component';
import { NewDocumentComponent } from './components/document/new-document/new-document.component';
import { CheckListComponent } from './components/check-list/check-list.component';
import { VendorBillComponent } from './components/vendor-bill/vendor-bill.component';
import { NewVendorBillComponent } from './components/vendor-bill/new-vendor-bill/new-vendor-bill.component';
import {  SearchFilterPipe } from './components/vendor-bill/new-vendor-bill/new-vendor-bill.component';
import { StoltBLComponent } from './components/stolt-bl/stolt-bl.component';
import { NewStoltBLComponent,FilterShipperBLPipe,FilterLCLShipperBLPipe } from './components/stolt-bl/new-stolt-bl/new-stolt-bl.component';
import { TankComponent } from './components/tank/tank.component';
import { ContainerComponent } from './components/tank/container/container.component';
import { DeliveryOrderComponent } from './components/tank/delivery-order/delivery-order.component';
import { FilterPipe, FilterPipe1, RouteComponent } from './components/route/route.component';

import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FreightChargesComponent } from './components/charges/freight-charges/freight-charges.component';
import { AddFreightComponent } from './components/charges/add-freight/add-freight.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { EnquiryChargesComponent } from './components/charges/enquiry-charges/enquiry-charges.component';
import { CognitoService } from '../services/cognito.service';
import { LoaderService } from '../services/loader.service';
import { ShippedOnboardComponent } from './components/shipped-onboard/shipped-onboard.component';
import { PortComponent } from './components/port/port.component';
import { CostHeadComponent } from './components/cost-head/cost-head.component';
import { ActivityComponent } from './components/activity/activity.component';
import { DepartmentComponent } from './components/department/department.component';
import { AddDepartmentComponent } from './components/department/adddepartment/adddepartment.component';
import { NotificationComponent } from './components/notification/notification.component';
import { LabelsComponent } from './components/labels/labels.component';
import { PrincipleCostComponent } from './components/principle-cost/principle-cost.component';

import { CostItemsComponent } from './components/cost-items/cost-items.component';
import { LocationsComponent } from './components/locations/locations.component';
import { UomComponent } from './components/uom/uom.component';
import { ProductComponent } from './components/product/product.component';
import { AddProductComponent } from './components/product/add-product/add-product.component';
import { AddnewtemplateComponent } from './components/pda-templates/pda-list/addnewtemplate/addnewtemplate.component';
import { PdaListComponent } from './components/pda-templates/pda-list/pda-list.component';
import { PdacostListComponent } from './components/pda-templates/pdacost-list/pdacost-list.component';
import { AddPdaCostitemComponent } from './components/pda-templates/pdacost-list/add-pda-costitem/add-pda-costitem.component';
import { PDATemplatesComponent } from './components/pda-templates/pda-templates.component';
import { AdduserComponent } from './components/user/adduser/adduser.component';
import { UserComponent } from './components/user/user.component';
import { UserRoleComponent } from './components/user-role/user-role.component';
import { SystemTypeComponent } from './components/system-type/system-type.component';
import { AddsystemtypeComponent } from './components/system-type/addsystemtype/addsystemtype.component';
import { ShippingLineComponent } from './components/shipping-line/shipping-line.component';
import { VesselComponent } from './components/vessel/vessel.component';
import { AddvesselComponent } from './components/vessel/addvessel/addvessel.component';
import { VoyageComponent } from './components/voyage/voyage.component';
import { AddvoyageComponent } from './components/voyage/addvoyage/addvoyage.component';
import { CurrRateComponent } from './components/curr-rate/curr-rate.component';
import { ServicesComponent } from './components/services/services.component';
import { DepartmentMasterComponent } from './components/sa-masters/department-master/department-master.component';
import { AgencytypeMasterComponent } from './components/sa-masters/agencytype-master/agencytype-master.component';
import { SegmentMasterComponent } from './components/sa-masters/segment-master/segment-master.component';
import { PortMasterComponent } from './components/sa-masters/port-master/port-master.component';
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
import { CostheadaddComponent } from './components/cost-head/costheadadd/costheadadd.component';
import { AddcostitemComponent } from './components/principle-cost/addcostitem/addcostitem.component';
import { AddportComponent } from './components/port/addport/addport.component';
import { AddactivityComponent } from './components/activity/addactivity/addactivity.component';
import { GlBankComponent } from './components/gl-bank/gl-bank.component';
import { AddAccountComponent } from './components/gl-bank/add-account/add-account.component';
import { SortDirective } from './directive/sort.directive';

import { ActivityMappingComponent } from './components/activity-mapping/activity-mapping.component';
import { AddActivityMappingComponent } from './components/activity-mapping/add-activity-mapping/add-activity-mapping.component';
import { CostItemMappingComponent } from './components/cost-item-mapping/cost-item-mapping.component';
import { AddItemMapComponent } from './components/cost-item-mapping/add-item-map/add-item-map.component';
import { CostHeadMappingComponent } from './components/cost-head-mapping/cost-head-mapping.component';
import { AddHeadMapComponent } from './components/cost-head-mapping/add-head-map/add-head-map.component';
import { PortMappingComponent } from './components/port-mapping/port-mapping.component';
import { AddPortMappingComponent } from './components/port-mapping/add-port-mapping/add-port-mapping.component';
import { StateCityMasterComponent } from './components/sa-masters/state-city-master/state-city-master.component';
import { PortActivityMappingComponent } from './components/port-activity-mapping/port-activity-mapping.component';
import { AddPortActivityMappingComponent } from './components/port-activity-mapping/add-port-activity-mapping/add-port-activity-mapping.component';
import { VesselVoyageComponent } from './components/Vessel-voyage/Vessel-voyage.component';
import { AddVesselVoyageComponent } from './components/Vessel-voyage/addvesselvoyage/addvesselvoyage.component';
import { StateMasterComponent } from './components/sa-masters/state-master/state-master.component';
import { CityMasterComponent } from './components/sa-masters/city-master/city-master.component';
import { PartyMasterComponent } from '../admin/party-master/party-master.component';
import { AddPartyComponent } from '../admin/party-master/add-party/add-party.component';
import { ContainerMasterComponent } from './components/sa-masters/container-master/container-master.component';
import { TemplateMasterComponent } from './components/sa-masters/template-master/template-master.component';
import { DatePipe } from '@angular/common';
import { EmployeeMasterComponent } from './components/employee-master/employee-master.component';
import { SortPipe } from './components/pipes/sort.pipe';
import { CfsMasterComponent } from './components/cfs-master/cfs-master.component';
import { StoltSplitBlComponent } from './components/stolt-bl/stolt-split-bl/stolt-split-bl.component';
import { PostingComponent } from './components/vendor-bill/posting/posting.component';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { YardCfsMasterComponent } from './components/sa-masters/yard-cfs-master/yard-cfs-master.component';
import { ContainerSurveyComponent } from './components/sa-masters/container-survey/container-survey.component';
import { NewAgentAdviseComponent } from './components/new-agent-advise/new-agent-advise.component';
import { ICDMasterComponent } from './components/sa-masters/icd-master/icd-master.component';
import { ShippingLineMasterComponent } from './components/shipping-line-master/shipping-line-master.component';
import { ContainerHistoryComponent } from './components/sa-masters/container-survey/container-history/container-history.component';
import { TdsSlabsComponent } from './components/sa-masters/tds-slabs/tds-slabs.component';
import { SacComponent } from './components/sa-masters/sac/sac.component';
import { DueShipmentComponent } from './components/due-shipment/due-shipment.component';
import { LocalTariffComponent } from './components/local-tariff/local-tariff.component';
import { NewLocalTariffComponent } from './components/local-tariff/new-local-tariff/new-local-tariff.component';
import { ConditionPopupComponent } from './components/local-tariff/new-local-tariff/condition-popup/condition-popup.component';
import { AccessControlDirective } from './directive/access-control.directive';
import { AccessFeatureDirective } from './directive/access-feature.directive';
import { TableFiltersComponent } from './components/table-filters/table-filters.component';
import { MaterialModule } from '../admin/material/material.module';
import { NewEnquiryComponent } from './components/new-enquiry/new-enquiry.component';
import { AddUserRoleComponent } from './components/user-role/add-user-role/add-user-role.component';
import { NewQuoteComponent } from './components/new-quote/new-quote.component';
import { VesselMapComponent } from './components/route/vessel-map/vessel-map.component';
import { NewImportEnquiryComponent } from './components/new-import-enquiry/new-import-enquiry.component';
import { CustomsComponent } from './components/customs/customs.component';
import { MilestoneComponent } from './components/milestone/milestone.component';
import {
  NgxMatNativeDateAdapter,
  NGX_MAT_DATE_FORMATS
} from '@angular-material-components/datetime-picker';
import { MailsendComponent } from './components/document/mailsend/mailsend.component';
import { SettingsComponent } from './components/settings/settings.component';
import { customFormat } from '../services/common/custome-format';
import { CustomCurrencyPipe } from './pipes/custom-currency.pipe';
import { MailTemplateComponent } from './components/mail-template/mail-template.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { AddMailTemplateComponent } from './components/mail-template/add-mail-template/add-mail-template.component';
import { BackbuttonDirective } from './directive/backbutton.directive';
import { RateMasterComponent } from '../admin/master/rate-master/rate-master/rate-master.component';
import { EmailTabComponent } from './components/email-tab/email-tab.component';
import { currencyPipeCutomer } from './pipes/customcurrency.pipe';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { FetchRecordByIdPipe,FilterByFlagPipe,FilterByTypePipe } from './pipes/startwith.pipe';
import { GrnComponent } from './components/grn/grn.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmationModalComponent } from '../auth/confirmation-modal.component';
import { LogoutmessageComponent } from '../auth/logoutmessage.component';
import { NewQuoteEditComponent } from './components/new-quote-edit/new-quote-edit.component';
import { GooglePlaceModule } from "ngx-google-places-autocomplete";
import { capitalizesPipe } from './pipes/capitalizes.pipe';
import { TicketComponent } from './components/ticket/ticket.component';
import { DriverMasterComponent } from './components/sa-masters/driver-master/driver-master.component';
import { RailFleetComponent } from './components/sa-masters/rail-fleet/rail-fleet.component';
import { OcenFleetComponent } from './components/sa-masters/ocen-fleet/ocen-fleet.component';
import { LandFleetComponent } from './components/sa-masters/land-fleet/land-fleet.component';
import { ActivityMasterComponent } from './components/sa-masters/activity-master/activity-master.component';
import { DecimalInputDirective } from './directive/DecimalInputDirective';
import { ShippingBillComponent } from './components/shipping-bill/shipping-bill.component';
import { AddShippingBillComponent } from './components/shipping-bill/add-shipping-bill/add-shipping-bill.component';
import { BillOfEntryComponent } from './components/bill-of-entry/bill-of-entry.component';
import { AddBillofEntryComponent } from './components/bill-of-entry/add-billof-entry/add-billof-entry.component';
import { BiddingComponent } from './components/bidding/bidding.component';
import { DriverVehicleDetailsComponent } from './components/driver-vehicle-details/driver-vehicle-details.component';
import { AirportMasterComponent } from './components/sa-masters/airport-master/airport-master.component';
import { DocumentUpload1Component } from './components/document/document-upload1/document-upload1.component';
import { TransportMilestoneComponent } from './components/transport-milestone/transport-milestone.component';
import { SignaturePadComponent } from './components/signature-pad/signature-pad.component';
import { FreightCertificateComponent } from './components/freight-certificate/freight-certificate.component';
import { CfsEmailComponent } from './components/cfs-email/cfs-email.component';
import { MilestoneMasterComponent } from './components/sa-masters/milestone-master/milestone-master.component';
import { CapitalizeFirstDirective } from './directive/capitalize-first.directive';
import { CopyClipboardDirective } from './directive/copy-clipboard.directive';
import { FinanceInvoiceComponent } from './components/invoice/financeinvoice/financeinvoice.component';
import { AuditLogsComponent , PrettyLabelPipe} from './components/audit-logs/audit-logs.component';
import { AddPortMasterComponent } from './components/sa-masters/port-master/add-port-master/add-port-master.component';
import { AddAirportComponent } from './components/sa-masters/airport-master/add-airport/add-airport.component';
import { FilterShipperPipe ,FilterLCLShipperPipe} from './pipes/filter-shipper.pipe';
import { AddContainerComponent } from './components/add-container/add-container.component';
import { CommonDialogBoxComponent } from './components/common-dialog-box/common-dialog-box.component';
import { SurveryorMasterComponent } from './components/surveryor-master/surveryor-master.component';
import { NewWareHouseDoucmentComponent } from './components/sa-masters/main-ware-house/ware-house-bill-of-entry/new-ware-house-doucment/new-ware-house-doucment.component';

@NgModule({
  imports: [
    CommonModule,
    ArchwizardModule,
    NgxPrintModule,
    FormsModule,
    ReactiveFormsModule,
    NzDatePickerModule,
    TranslateModule,
    NzToolTipModule,
    NzTabsModule,
    NgxSkeletonLoaderModule,
    NzNotificationModule,
    NzAutocompleteModule,
    NzSelectModule,
    HttpClientModule,
    NgMultiSelectDropDownModule.forRoot(),
    MaterialModule,
    CKEditorModule,
    MatTooltipModule,
    GooglePlaceModule,
  ],
  declarations: [
    AddContainerComponent,
    DocumentUpload1Component,
    FilterPipe,
    FilterPipe1,
    SearchFilterPipe,
    SortPipe,
    customFormat,
    ChargesComponent,
    AgreementComponent,
    AddagreementComponent,
    ClauseComponent,
    AddclauseComponent,
    ContactsComponent,
    AddcontactComponent,
    HolidaysComponent,
    AddholidayComponent,
    InvoiceComponent,
    DocumentComponent,
    AddbranchComponent,
    BranchComponent,
    NewInvoiceComponent,
    PaymentComponent,
    ShippingBillComponent,
    NewPaymentComponent,
    CreditComponent,
    NewCreditComponent,
    DebitComponent,
    NewDebitComponent,
    PNLComponent,
    BatchCloseComponent,
    NewEnquiryComponent,
    AddchangesComponent,
    DiscussionComponent,
    NewDocumentComponent,
    CheckListComponent,
    VendorBillComponent,
    NewVendorBillComponent,
    StoltBLComponent,
    NewStoltBLComponent,
    TankComponent,
    ContainerComponent,
    DeliveryOrderComponent,
    RouteComponent,
    FreightChargesComponent,
    AddFreightComponent,
    EnquiryChargesComponent,
    ShippedOnboardComponent,
    PortComponent,
    CostHeadComponent,
    ActivityComponent,
    DepartmentComponent,
    AddDepartmentComponent,
    NotificationComponent,
    LabelsComponent,
    PrincipleCostComponent,
    CostItemsComponent,
    LocationsComponent,
    UomComponent,
    ProductComponent,
    AddProductComponent,
    AddnewtemplateComponent,
    PdaListComponent,
    PdacostListComponent,
    AddPdaCostitemComponent,
    PDATemplatesComponent,
    UserComponent,
    AdduserComponent,
    UserRoleComponent,
    SystemTypeComponent,
    AddsystemtypeComponent,
    ShippingLineComponent,
    VesselComponent,
    AddvesselComponent,
    VoyageComponent,
    AddvoyageComponent,
    CurrRateComponent,
    ServicesComponent,
    DepartmentMasterComponent,
    AgencytypeMasterComponent,
    SegmentMasterComponent,
    PortMasterComponent,
    ShipstatusMasterComponent,
    VesselMasterComponent,
    VesselcallMasterComponent,
    VesselcallPurposeMasterComponent,
    EnquiryTypeMasterComponent,
    CommodityMasterComponent,
    CargoMasterComponent,
    PackagetypeMasterComponent,
    UserMasterComponent,
    BankMasterComponent,
    ClauseMasterComponent,
    CountryMasterComponent,
    CurrencyMasterComponent,
    AgencyTypeMasterComponent,
    CategoryMasterComponent,
    CommodityGroupMasterComponent,
    TriffDetailMasterComponent,
    TriffHdrMasterComponent,
    VessalMasterComponent,
    VesselTypeMasterComponent,
    VendorMasterComponent,
    VendorTypeMasterComponent,
    CostheadaddComponent,
    AddcostitemComponent,
    AddportComponent,
    AddactivityComponent,
    GlBankComponent,
    AddAccountComponent,
    SortDirective,
    BackbuttonDirective,
    ActivityMappingComponent,
    AddActivityMappingComponent,
    CostItemMappingComponent,
    AddItemMapComponent,
    CostHeadMappingComponent,
    AddHeadMapComponent,
    PortMappingComponent,
    AddPortMappingComponent,
    StateCityMasterComponent,
    PortActivityMappingComponent,
    AddPortActivityMappingComponent,
    VesselVoyageComponent,
    AddVesselVoyageComponent,
    StateMasterComponent,
    CityMasterComponent,
    PartyMasterComponent,
    AddPartyComponent,
    ContainerMasterComponent,
    TemplateMasterComponent,
    LabelsComponent,
    EmployeeMasterComponent,
    CfsMasterComponent,
    StoltSplitBlComponent,
    PostingComponent,
    YardCfsMasterComponent,
    ContainerSurveyComponent,
    NewAgentAdviseComponent,
    ICDMasterComponent,
    ShippingLineMasterComponent,
    ContainerHistoryComponent,
    TdsSlabsComponent,
    SacComponent,
    DueShipmentComponent,
    LocalTariffComponent,
    NewLocalTariffComponent,
    ConditionPopupComponent,
    AccessControlDirective,
    AccessFeatureDirective,
    DecimalInputDirective,
    TableFiltersComponent,
    AddUserRoleComponent,
    NewQuoteComponent,
    VesselMapComponent,
    NewImportEnquiryComponent,
    CustomsComponent,
    MilestoneComponent,
    RateMasterComponent,
    MailsendComponent,
    SettingsComponent,
    CustomCurrencyPipe,
    currencyPipeCutomer,
    MailTemplateComponent,
    AddMailTemplateComponent,
    EmailTabComponent,
    FetchRecordByIdPipe, GrnComponent,FilterByFlagPipe,FilterByTypePipe,
    ConfirmationModalComponent,
    LogoutmessageComponent,  capitalizesPipe,
    NewQuoteEditComponent,
    TicketComponent,
    DriverMasterComponent,
    RailFleetComponent,
    OcenFleetComponent,
    LandFleetComponent,
    ActivityMasterComponent,
    AddShippingBillComponent,
    BillOfEntryComponent,
    AddBillofEntryComponent,
    BiddingComponent,
    DriverVehicleDetailsComponent,
    AirportMasterComponent,
    TransportMilestoneComponent,
    SignaturePadComponent,
    FreightCertificateComponent,
    CfsEmailComponent,
    MilestoneMasterComponent,
    CapitalizeFirstDirective,
    CopyClipboardDirective,
    FinanceInvoiceComponent,
    AuditLogsComponent,
    AddPortMasterComponent,
    AddAirportComponent,
    FilterShipperPipe,
    FilterLCLShipperPipe,
    FilterShipperBLPipe,
    FilterLCLShipperBLPipe,
    PrettyLabelPipe,
    CommonDialogBoxComponent,
    SurveryorMasterComponent,
    NewWareHouseDoucmentComponent
  ],


  exports: [
    CommonDialogBoxComponent,
    PrettyLabelPipe,
    FilterLCLShipperBLPipe,
    FilterShipperBLPipe,
    CKEditorModule,
    AddAirportComponent,
    AddPortMasterComponent,
    AuditLogsComponent,
    MilestoneMasterComponent,
    CapitalizeFirstDirective,
    CopyClipboardDirective,
    CfsEmailComponent,
    SignaturePadComponent,
    TransportMilestoneComponent,
    DocumentUpload1Component,
    DriverVehicleDetailsComponent,
    BillOfEntryComponent,
    AddBillofEntryComponent,
    DriverMasterComponent,
    AddShippingBillComponent,
    ShippingBillComponent,
    FilterPipe1,
    NgxSkeletonLoaderModule,
    FetchRecordByIdPipe,
    FilterByFlagPipe,
    FilterByTypePipe,
    SettingsComponent,
    CustomsComponent,
    ChargesComponent,
    CommonModule,
    AgreementComponent,
    AddagreementComponent,
    ClauseComponent,
    AddclauseComponent,
    ContactsComponent,
    AddcontactComponent,
    HolidaysComponent,
    AddholidayComponent,
    InvoiceComponent,
    DocumentComponent,
    EmailTabComponent,
    AddbranchComponent,
    BranchComponent,
    NewInvoiceComponent,
    PaymentComponent,
    NewPaymentComponent,
    CreditComponent,
    NewCreditComponent,
    DebitComponent,
    NewDebitComponent,
    PNLComponent,
    BatchCloseComponent,
    NewEnquiryComponent,
    NewQuoteComponent,
    AddchangesComponent,
    DiscussionComponent,
    NewDocumentComponent,
    CheckListComponent,
    VendorBillComponent,
    NewVendorBillComponent,
    StoltBLComponent,
    NewStoltBLComponent,
    TankComponent,
    ContainerComponent,
    DeliveryOrderComponent,
    RouteComponent,
    TranslateModule,
    NzToolTipModule,
    NzNotificationModule,
    NzAutocompleteModule,
    NzSelectModule,
    ShippedOnboardComponent,
    PortComponent,
    CostHeadComponent,
    ActivityComponent,
    DepartmentComponent,
    AddDepartmentComponent,
    NotificationComponent,
    LabelsComponent,
    PrincipleCostComponent,
    CostItemsComponent,
    LocationsComponent,
    UomComponent,
    ProductComponent,
    AddProductComponent,
    AddnewtemplateComponent,
    PdaListComponent,
    PdacostListComponent,
    AddPdaCostitemComponent,
    PDATemplatesComponent,
    UserComponent,
    AdduserComponent,
    UserRoleComponent,
    SystemTypeComponent,
    AddsystemtypeComponent,
    ShippingLineComponent,
    VesselComponent,
    AddvesselComponent,
    VoyageComponent,
    AddvoyageComponent,
    CurrRateComponent,
    ServicesComponent,
    DepartmentMasterComponent,
    AgencytypeMasterComponent,
    SegmentMasterComponent,
    PortMasterComponent,
    ShipstatusMasterComponent,
    VesselMasterComponent,
    VesselcallMasterComponent,
    VesselcallPurposeMasterComponent,
    EnquiryTypeMasterComponent,
    CommodityMasterComponent,
    CargoMasterComponent,
    PackagetypeMasterComponent,
    UserMasterComponent,
    BankMasterComponent,
    ClauseMasterComponent,
    CountryMasterComponent,
    CurrencyMasterComponent,
    AgencyTypeMasterComponent,
    CategoryMasterComponent,
    CommodityGroupMasterComponent,
    TriffDetailMasterComponent,
    TriffHdrMasterComponent,
    VessalMasterComponent,
    VesselTypeMasterComponent,
    VendorMasterComponent,
    VendorTypeMasterComponent,
    GlBankComponent,
    AddAccountComponent,
    SortDirective,
    BackbuttonDirective,
    ActivityMappingComponent,
    AddActivityMappingComponent,
    CostItemMappingComponent,
    CostHeadMappingComponent,
    AddHeadMapComponent,
    PortMappingComponent,
    AddPortMappingComponent,
    StateCityMasterComponent,
    PortActivityMappingComponent,
    AddPortActivityMappingComponent,
    VesselVoyageComponent,
    AddVesselVoyageComponent,
    StateMasterComponent,
    CityMasterComponent,
    PartyMasterComponent,
    AddPartyComponent,
    ContainerMasterComponent,
    TemplateMasterComponent,
    LabelsComponent,
    EmployeeMasterComponent,
    YardCfsMasterComponent,
    ContainerSurveyComponent,
    NewAgentAdviseComponent,
    ICDMasterComponent,
    ShippingLineMasterComponent,
    TdsSlabsComponent,
    SacComponent,
    DueShipmentComponent,
    LocalTariffComponent,
    AccessControlDirective,
    AccessFeatureDirective,
    DecimalInputDirective,
    TableFiltersComponent,
    MaterialModule,
    AddUserRoleComponent,
    VesselMapComponent,
    NewImportEnquiryComponent,
    MilestoneComponent,
    customFormat,
    CustomCurrencyPipe,
    currencyPipeCutomer,
    MailTemplateComponent,
    AddMailTemplateComponent,
    RateMasterComponent,
    GrnComponent,
    ActivityMasterComponent,
    ConfirmationModalComponent,
    RailFleetComponent,TicketComponent,    OcenFleetComponent,
    LogoutmessageComponent,
    NzTabsModule,
    FilterShipperPipe,
    FilterLCLShipperPipe,
    SurveryorMasterComponent
  ],
  providers: [
    FilterPipe,
    CommonService,
    LoaderService,
    CognitoService,
    DatePipe,
    SortPipe,
    SearchFilterPipe,

    {
      provide: NgxMatNativeDateAdapter,
      useValue: {
        ...NGX_MAT_DATE_FORMATS,
        display: {
          ...NGX_MAT_DATE_FORMATS,
          dateInput: { year: 'numeric', month: 'numeric', day: 'numeric' },
        },
      },
    },
    NgxMatNativeDateAdapter,
  ],
})
export class SharedModule { }
