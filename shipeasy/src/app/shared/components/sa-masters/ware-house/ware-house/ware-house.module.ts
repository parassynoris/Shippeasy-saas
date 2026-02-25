import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WareHouseRoutingModule } from './ware-house-routing.module';
import { WareHouseComponent } from '../ware-house.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxPrintModule } from 'ngx-print';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { MaterialModule } from 'src/app/admin/material/material.module';
import { MainWareHouseComponent } from '../../main-ware-house/main-ware-house.component';


@NgModule({
  declarations: [WareHouseComponent,MainWareHouseComponent],
  imports: [
    CommonModule,
    WareHouseRoutingModule,
    SharedModule, MatSidenavModule, MatFormFieldModule, MatSelectModule, MatButtonModule,
    NgbModule,
    NgxPrintModule,
    NzDatePickerModule,
    NzNotificationModule,
    NzToolTipModule,
    NgMultiSelectDropDownModule.forRoot(),
    MaterialModule,
    NzPopoverModule,
    NzIconModule
  ]
})
export class WareHouseModule { }
