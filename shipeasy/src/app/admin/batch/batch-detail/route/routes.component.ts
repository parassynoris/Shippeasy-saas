import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-routes',
  templateUrl: './route.component.html',
  styleUrls: ['./route.component.scss']
})
export class RouteComponent {

  constructor( private router: Router) {
    // do nothing.
   } 

  onClose() {
    this.router.navigate(['/batch/list']);
  }
}
