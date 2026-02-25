import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserpofileRoutingModule } from './userpofile-routing.module';
import { UserpofileComponent } from './userpofile.component';
import { GlobalSearchComponent } from '../mobileview/global-search/global-search.component';


@NgModule({
  declarations: [
    UserpofileComponent,
    GlobalSearchComponent
  ],
  imports: [
    CommonModule,
    UserpofileRoutingModule,
    SharedModule,
    NgbModalModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class UserPofileModule { }
