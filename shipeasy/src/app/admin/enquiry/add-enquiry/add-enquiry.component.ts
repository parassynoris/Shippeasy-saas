import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
@Component({
  selector: 'app-add-enquiry',
  templateUrl: './add-enquiry.component.html',
  styleUrls: ['./add-enquiry.component.scss']
})
export class AddEnquiryComponent implements OnInit {

  currentUrl: any;

  constructor(private router: Router) {
    // do nothing.
  }
  calculator(){
    window.open('Calculator:///');
}
  onClose() {
  }

  ngOnInit(): void {
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();
  }

}
