import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RailFleetComponent } from './shared/components/sa-masters/rail-fleet/rail-fleet.component';
import { OcenFleetComponent } from './shared/components/sa-masters/ocen-fleet/ocen-fleet.component';
import { LandFleetComponent } from './shared/components/sa-masters/land-fleet/land-fleet.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
{path:'home', loadChildren:() => import('./layout/layout.module').then((m) => m.LayoutModule )},
{ path: 'application', loadChildren: () => import('./admin/application/application.module').then(m => m.ApplicationModule) },
];

@NgModule({
  imports: [ 
    RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
