import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { SmartDocumentsComponent } from './smart-documents.component';
import { SmartDocumentsRoutingModule } from './smart-documents-routing.module';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { CreateDocComponent } from './create-doc/create-doc.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';
import {MatGridListModule} from '@angular/material/grid-list';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
@NgModule({
  declarations: [
    SmartDocumentsComponent,
    CreateDocComponent
  ],
  imports: [
    CommonModule,
    SmartDocumentsRoutingModule,
    RouterModule,
    FormsModule,
    NgbModule, 
    SharedModule,
    MatInputModule,
    NzDatePickerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatGridListModule,
    MatCardModule,
    FlexLayoutModule
  ],
  providers: [CurrencyPipe],
})
export class SmartDocumentsModule { }
