import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Report viewer
// import '@boldreports/javascript-reporting-controls/Scripts/bold.report-viewer.min';
// Report Designer
// import '@boldreports/global/l10n/ej.localetexts.fr-FR.min.js';
// import '@boldreports/global/i18n/ej.culture.fr-FR.min.js';

// // data-visualization
// import '@boldreports/javascript-reporting-controls/Scripts/data-visualization/ej.bulletgraph.min';
// import '@boldreports/javascript-reporting-controls/Scripts/data-visualization/ej.chart.min';

// Report viewer
// import '@boldreports/javascript-reporting-controls/Scripts/bold.report-viewer.min';
// // Report Designer
// import '@boldreports/javascript-reporting-controls/Scripts/bold.report-designer.min';
// import { ReportsRoutingModule } from './reports-routing.module';
// // import { BoldEditComponent } from './bold-edit/bold-edit.component';
// import { BoldReportListComponent } from './bold-report-list/bold-report-list.component';
// // import { BoldViewComponent } from './bold-view/bold-view.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { MaterialModule } from '../material/material.module';
import { BoldReportListComponent } from './bold-report-list/bold-report-list.component';
import { ReportsRoutingModule } from './reports-routing.module';
import { ScheduleReportComponent } from './bold-report-list/schedule-report/schedule-report.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ScheduleListComponent } from './bold-report-list/schedule-list/schedule-list.component';
@NgModule({
  declarations: [
    // BoldEditComponent,
    BoldReportListComponent,
    ScheduleReportComponent,
    ScheduleListComponent,
    // BoldViewComponent,
   
    
  ],
  imports: [
    CKEditorModule,
    CommonModule,
    MaterialModule,
    ReportsRoutingModule,
    NgbModalModule,
    NgMultiSelectDropDownModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NzDatePickerModule
  ],
  exports:[
    BoldReportListComponent,
    ScheduleReportComponent,
    ScheduleListComponent,
  ]
})
export class boldReportsModule { }
