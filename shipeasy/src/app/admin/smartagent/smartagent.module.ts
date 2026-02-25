import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { SmartagentRoutingModule } from './smartagent-routing.module';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { CapitalizePipe, SmartagentComponent } from './smartagent.component';
import { SmartDetailsComponent } from './smart-details/smart-details.component';
import { PortserviceComponent } from './portservice/portservice.component';
import { SelectserviceComponent } from './portservice/selectservice/selectservice.component';
import { BankComponent } from './bank/bank.component';
import { AddaccoutComponent } from './bank/addaccout/addaccout.component';
import { SmartaddComponent } from './smart-details/smartadd/smartadd.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RequestListComponent } from './smart-details/request-list/request-list.component';
import { RegisterUserComponent } from './smart-details/register-user/register-user.component';
import { TicketadminComponent } from 'src/app/ticketadmin/ticketadmin.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ConfigurationComponent } from './smart-details/configuration/configuration.component';



@NgModule({
  declarations: [
  SmartagentComponent,
  SmartDetailsComponent,
  PortserviceComponent,
  SelectserviceComponent,
  BankComponent,
  AddaccoutComponent,
  SmartaddComponent,
  RequestListComponent,
  TicketadminComponent,
  RegisterUserComponent,
  CapitalizePipe,
  ConfigurationComponent

  ],
  imports: [
    CommonModule,
    SmartagentRoutingModule,
    SharedModule,
    NgbModalModule,
    FormsModule,
    ReactiveFormsModule,
    CKEditorModule
  ]
})
export class SmartagentModule { }
