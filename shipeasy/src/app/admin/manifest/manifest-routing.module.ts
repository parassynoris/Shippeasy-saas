import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManifestComponent } from './manifest.component';
import { HouseBlComponent } from './house-bl/house-bl.component';
import { ManifestListComponent } from './manifest-list/manifest-list.component';

const routes: Routes = [
  { path: '', redirectTo: 'manifest', pathMatch: 'full' },
  { path: 'manifest', component: ManifestComponent, },
  { path: ':vesId/:voyId/list', component: ManifestListComponent, },
  { path: ':vesId/:voyId/list/:key', component: ManifestListComponent, },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManifestRoutingModule { }