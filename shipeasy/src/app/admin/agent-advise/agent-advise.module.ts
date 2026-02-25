import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';

import { AgentAdviseRoutingModule } from './agent-advise-routing.module';
import { AgentAdviseComponent } from './agent-advise.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared.module';
import { AddAgentComponent } from './add-agent/add-agent.component';


@NgModule({
  declarations: [
    AgentAdviseComponent,
    AddAgentComponent,
  ],
  imports: [
    AgentAdviseRoutingModule,
    RouterModule,
    FormsModule,
    NgbModule,
    CommonModule,
    SharedModule,
  ],
  providers: [CurrencyPipe],
  bootstrap: []
})
export class AgentAdviseModule { }
