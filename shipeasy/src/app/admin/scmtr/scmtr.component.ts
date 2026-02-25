import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { batch } from './data';

@Component({
  selector: 'app-scmtr',
  templateUrl: './scmtr.component.html',
  styleUrls: ['./scmtr.component.scss']
})
export class ScmtrComponent implements OnInit {

  tabs = batch.masterTabs;
  urlParam: any;
  holdControl: any;

  constructor(public router: Router, private route: ActivatedRoute, public translate: TranslateService) {
    this.route.params.subscribe(params =>
      this.urlParam = params
    );
    this.holdControl = this.urlParam.key;
   }


   onTab(data) {
    this.router.navigate(['/scmtr/' + data.key]);
    this.holdControl = data.key;
    
  }

  ngOnInit(): void {
    this.tabs.forEach((item, index) => {
      
      this.translate.get('stolt').subscribe((data: any) => {
      
        let langKey = data.scmtr.tab;
       
        switch (item.key) {
          case ('vessel'):
            item.name = langKey.vessel;
            break;
          
        }
      });
    });
  }

}
