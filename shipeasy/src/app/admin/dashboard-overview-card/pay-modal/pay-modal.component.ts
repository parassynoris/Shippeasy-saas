import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'; 
import { CognitoService } from 'src/app/services/cognito.service'; 
import { GoogleAnalyticsService } from 'src/app/services/google-analytics.service';

@Component({
  selector: 'app-pay-modal',
  templateUrl: './pay-modal.component.html',
  styleUrls: ['./pay-modal.component.scss']
})
export class PayModalComponent  {

  @Input() Data: any;
  @Input() tds: boolean;
  @Input() isPayCreadable: any;
  @Output() setPayMethod = new EventEmitter<any>();
  constructor(private router: Router, private _modal: NgbActiveModal, private googleAnalyticsService: GoogleAnalyticsService,  public _cognito: CognitoService) { }

  ngOnInit(): void {
    
  }
/** payOff(data) takes data as an argument 
 * used for offline payment
 */
  payOff(data) {
    this.googleAnalyticsService.eventEmitter("Payment Started", 'LoggedInUser', "guest", "click", 1);
    this.router.navigate(['payment-confirmation'], { state: { invoiceId: data?.invoices?.map(item => item?.invoiceId), bookingId: [data?.rowData?.bookingId], tds: this.tds, amount: data?.invoiceAmount.toFixed(2), data: data?.rowData } });
  }
/** payOn(data) takes data as an argument 
 * used for online payment
 */
  payOn(data) {
    this.googleAnalyticsService.eventEmitter("Payment Started", 'LoggedInUser', "guest", "click", 1);
    this.router.navigate(['pay'], { state: { invoiceId: data.invoices?.map(item => item?.invoiceId), bookingId: [data?.bookingName], tds: this.tds, amount: [data?.rowData?.bookingAmount], } });
  }
/** setPay(type) takes type as an argument 
 * and based on type emit the type of payment 
 */
  setPay(type: string) {
    this.setPayMethod.emit(type);
    this.onCloseModal();
  }
/** onCloseModal() used to close the modal
 */
onCloseModal() {
    this._modal.close();
  }

}
