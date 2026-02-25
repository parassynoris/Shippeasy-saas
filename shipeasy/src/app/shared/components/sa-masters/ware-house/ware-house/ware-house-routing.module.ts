import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WareHouseComponent } from '../ware-house.component';

const routes: Routes = [{ path: '', component: WareHouseComponent },
{ path: ':key', component: WareHouseComponent },
{
  path: 'main-ware-house',
  loadChildren: () => import('../../main-ware-house/mainware-house/mainware-house.module').then(m => m.MainwareHouseModule)
}

];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WareHouseRoutingModule { }
