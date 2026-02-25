import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReleaseManagerComponent } from './release-manager.component';

const routes: Routes = [
    {
        path: '',
        component: ReleaseManagerComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ReleaseManagerRoutingModule { }
