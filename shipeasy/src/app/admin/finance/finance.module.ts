import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, JsonPipe } from '@angular/common';
import { FinanceRoutingModule } from './finance-routing.module';
import { FinanceComponent } from './finance.component';
import { SharedModule } from 'src/app/shared/shared.module';

import {NgxPrintModule} from 'ngx-print';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzNotificationModule } from 'ng-zorro-antd/notification';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RecipeAcknowledgementComponent } from './recipe-acknowledgement/recipe-acknowledgement.component';
import { RecipeConfirmationComponent } from './recipe-confirmation/recipe-confirmation.component';
import { ReceiptNewComponent } from './recipe-acknowledgement/receipt-new/receipt-new.component';
import { ReceiptConfirmComponent } from './recipe-confirmation/receipt-confirm/receipt-confirm.component';
import { PLComponent } from './pnl/pnl.component';
import { TariffCalculatorComponent } from './tariff-calculator/tariff-calculator.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FilterPipe } from '../batch/batch-detail/batch-detail.component';
import { SearchFilterPipe } from '../batch/batch-detail/invoices/newinvoice/newinvoice.component';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReceiptPaymentComponent } from './receipt-payment/receipt-payment.component';
import { AddReceiptPaymentComponent } from './receipt-payment/add-receipt-payment/add-receipt-payment.component';
import { PaymentInOutComponent } from './payment-in-out/payment-in-out.component';
import { AddPaymentInoutComponent } from './payment-in-out/add-payment-inout/add-payment-inout.component';
import { TdsComponent } from './tds/tds.component';
import { CreditDebitNoteComponent } from './credit-debit-note/credit-debit-note.component';
import { AddCreditDebitNoteComponent } from './credit-debit-note/add-credit-debit-note/add-credit-debit-note.component';
import { boldReportsModule } from '../reports/Boldreports.module';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

@NgModule({
  declarations: [
    FinanceComponent,
    RecipeAcknowledgementComponent,
    RecipeConfirmationComponent,
    ReceiptNewComponent,
    ReceiptConfirmComponent,
    PLComponent,
    TariffCalculatorComponent,
    ReceiptPaymentComponent,
    AddReceiptPaymentComponent,
    PaymentInOutComponent,
    AddPaymentInoutComponent,
    TdsComponent,
    CreditDebitNoteComponent,
    AddCreditDebitNoteComponent,
    
  ],
  imports: [
    boldReportsModule,
    CommonModule,
    FinanceRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NgxPrintModule,
    NzDatePickerModule,
    NzNotificationModule,
    NgMultiSelectDropDownModule.forRoot(),
    MatFormFieldModule, MatDatepickerModule, 
    MatNativeDateModule,
    MatInputModule,MatButtonModule,
     NzDropDownModule,   
    NzSelectModule,     
    NzToolTipModule,
  ],exports :[
    AddReceiptPaymentComponent,
    ReceiptPaymentComponent
  ],
  providers: [SearchFilterPipe,DatePipe,FilterPipe,CurrencyPipe],
})
export class FinanceModule { }
