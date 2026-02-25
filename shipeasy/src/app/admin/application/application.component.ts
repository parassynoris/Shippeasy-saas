import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { shared } from 'src/app/shared/data';

@Component({
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.scss']
})
export class ApplicationComponent {
  notification = shared.headerNotification;
  constructor(private router: Router) {
    // do nothing.
   }

  onRoute(){
    this.router.navigate([ '/enquiry/list']);
  }


}
