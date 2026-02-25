import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddPartyComponent } from './add-party/add-party.component';
import { PartyMasterComponent } from './party-master.component';


const routes: Routes = [
    { path: '', redirectTo: 'list', pathMatch: 'full' },
    { path: 'list', component: PartyMasterComponent, },
    { path: 'add-address-book', component: AddPartyComponent },
    { path: 'list/:id/:key', component: AddPartyComponent },

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PartyMasterRoutingModule { }
