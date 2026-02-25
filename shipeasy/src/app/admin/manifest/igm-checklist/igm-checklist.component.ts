import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
@Component({
  selector: 'app-igm-checklist',
  templateUrl: './igm-checklist.component.html',
  styleUrls: ['./igm-checklist.component.scss']
})
export class IgmChecklistComponent {

  constructor( private location: Location,) { }

  back() {
    this.location.back();
  }
}
