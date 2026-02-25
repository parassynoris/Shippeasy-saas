import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent {
  books:any;
  constructor(translate: TranslateService) {
    translate.setDefaultLang('en');

    translate.use('en');
  }



}
