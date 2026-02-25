import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LorryReceiptTableComponent } from './lorry-receipt-table.component';
import { LorryReceiptAddComponent } from './lorry-receipt-add/lorry-receipt-add.component';

const routes: Routes = [
  { 
    path: '', // Empty path because 'lr' is already in parent route
    children: [
      { 
        path: 'booking', 
        component: LorryReceiptTableComponent 
      },
      { 
        path: 'booking/add', 
        component: LorryReceiptAddComponent,
        data: { bookingType: 'general' }
      },
      { 
        path: 'lrbooking/add', 
        component: LorryReceiptAddComponent,
        data: { bookingType: 'lrBooking' }
      },
      { 
        path: 'freshbooking/add', 
        component: LorryReceiptAddComponent,
        data: { bookingType: 'freshBooking' }
      },
      { 
        path: 'lrbooking/:id', 
        component: LorryReceiptAddComponent,
        data: { bookingType: 'lrBooking' }
      },
      { 
        path: 'freshbooking/:id', 
        component: LorryReceiptAddComponent,
        data: { bookingType: 'freshBooking' }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LorryRoutingModule { }