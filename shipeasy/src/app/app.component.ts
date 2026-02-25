import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'diabos-ShipEasy';

  constructor(translate: TranslateService){
    // router.events.subscribe((event) => {
    //   if (event instanceof NavigationEnd) {
    //     statistic(window.location.pathname);
    //   }
    // });
    translate.setDefaultLang('en');
    translate.use('en');
  }
}
