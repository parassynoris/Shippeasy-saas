import { Component, OnInit } from '@angular/core'; 
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-side-sticky-menu',
  templateUrl: './side-sticky-menu.component.html',
  styleUrls: ['./side-sticky-menu.component.scss']
})
export class SideStickyMenuComponent implements OnInit {
  isSmartDocumentsRoute: boolean = false;
  constructor(private router: Router) { }

  ngOnInit(): void {
    this.router.events?.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Check if the current route matches '/smart-documents'
        this.isSmartDocumentsRoute = this.router.url.includes('/smart-documents');
      }
    });
  }
  loadCalcNavigate(){
    this.router.navigate(['/load-calc' ]);
  }
  documentNavigate(){
    this.router.navigate(['/smart-documents' ]);
  }
}
