import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WelcomepageComponent } from './welcomepage.component';
import { SmartDetailsComponent } from '../../smartagent/smart-details/smart-details.component';
import { PartyMasterComponent } from '../../party-master/party-master.component';
import { CostItemsComponent } from 'src/app/shared/components/cost-items/cost-items.component';

const routes: Routes = [
  { path: '', component: WelcomepageComponent, },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WelcomepageRoutingModule { }
