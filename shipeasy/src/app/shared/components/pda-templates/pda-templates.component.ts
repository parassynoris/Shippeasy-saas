import { Component, OnInit} from '@angular/core';
import { shared } from '../../data';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-pda-templates',
  templateUrl: './pda-templates.component.html',
  styleUrls: ['./pda-templates.component.scss']
})
export class PDATemplatesComponent {
  tabs = shared.pdaTabs;
  holdControl: any;
  urlParam: any;

  constructor(private router: Router, private route: ActivatedRoute) {
    this.route.params.subscribe(params =>
      this.urlParam = params
    );
    this.holdControl = this.urlParam.key;
  }

  onTab(data) {
    this.router.navigate(['/master/' + data.key]);
    this.holdControl = data.key;
  }
 
}
