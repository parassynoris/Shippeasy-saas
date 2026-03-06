import { NgModule } from '@angular/core';
import { SharedCoreModule } from './shared-core.module';

import { InvoiceComponent } from './components/invoice/invoice.component';
import { NewInvoiceComponent } from './components/invoice/new-invoice/new-invoice.component';
import { FinanceInvoiceComponent } from './components/invoice/financeinvoice/financeinvoice.component';
import { PaymentComponent } from './components/payment/payment.component';
import { NewPaymentComponent } from './components/payment/new-payment/new-payment.component';
import { CreditComponent } from './components/credit/credit.component';
import { NewCreditComponent } from './components/credit/new-credit/new-credit.component';
import { DebitComponent } from './components/debit/debit.component';
import { NewDebitComponent } from './components/debit/new-debit/new-debit.component';
import { PNLComponent } from './components/pnl/pnl.component';
import { BatchCloseComponent } from './components/batch-close/batch-close.component';
import { VendorBillComponent } from './components/vendor-bill/vendor-bill.component';
import { NewVendorBillComponent } from './components/vendor-bill/new-vendor-bill/new-vendor-bill.component';
import { SearchFilterPipe } from './components/vendor-bill/new-vendor-bill/new-vendor-bill.component';
import { PostingComponent } from './components/vendor-bill/posting/posting.component';
import { ChargesComponent } from './components/charges/charges.component';
import { AddchangesComponent } from './components/charges/addchanges/addchanges.component';
import { FreightChargesComponent } from './components/charges/freight-charges/freight-charges.component';
import { AddFreightComponent } from './components/charges/add-freight/add-freight.component';
import { EnquiryChargesComponent } from './components/charges/enquiry-charges/enquiry-charges.component';
import { CostHeadComponent } from './components/cost-head/cost-head.component';
import { CostheadaddComponent } from './components/cost-head/costheadadd/costheadadd.component';
import { CostItemsComponent } from './components/cost-items/cost-items.component';
import { PrincipleCostComponent } from './components/principle-cost/principle-cost.component';
import { AddcostitemComponent } from './components/principle-cost/addcostitem/addcostitem.component';
import { LocalTariffComponent } from './components/local-tariff/local-tariff.component';
import { NewLocalTariffComponent } from './components/local-tariff/new-local-tariff/new-local-tariff.component';
import { ConditionPopupComponent } from './components/local-tariff/new-local-tariff/condition-popup/condition-popup.component';
import { GlBankComponent } from './components/gl-bank/gl-bank.component';
import { AddAccountComponent } from './components/gl-bank/add-account/add-account.component';
import { CurrRateComponent } from './components/curr-rate/curr-rate.component';
import { RateMasterComponent } from '../../admin/master/rate-master/rate-master/rate-master.component';

const FINANCE_COMPONENTS = [
  InvoiceComponent,
  NewInvoiceComponent,
  FinanceInvoiceComponent,
  PaymentComponent,
  NewPaymentComponent,
  CreditComponent,
  NewCreditComponent,
  DebitComponent,
  NewDebitComponent,
  PNLComponent,
  BatchCloseComponent,
  VendorBillComponent,
  NewVendorBillComponent,
  SearchFilterPipe,
  PostingComponent,
  ChargesComponent,
  AddchangesComponent,
  FreightChargesComponent,
  AddFreightComponent,
  EnquiryChargesComponent,
  CostHeadComponent,
  CostheadaddComponent,
  CostItemsComponent,
  PrincipleCostComponent,
  AddcostitemComponent,
  LocalTariffComponent,
  NewLocalTariffComponent,
  ConditionPopupComponent,
  GlBankComponent,
  AddAccountComponent,
  CurrRateComponent,
  RateMasterComponent,
];

@NgModule({
  imports: [SharedCoreModule],
  declarations: [...FINANCE_COMPONENTS],
  exports: [...FINANCE_COMPONENTS],
  providers: [SearchFilterPipe],
})
export class SharedFinanceModule {}
