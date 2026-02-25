import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-local-tariff',
  templateUrl: './local-tariff.component.html',
  styleUrls: ['./local-tariff.component.css']
})
export class LocalTariffComponent implements OnInit {
  urlParam:any
  shippinglineData:any=[]
  currentUrl:any
  constructor(private router:Router,private route: ActivatedRoute) { 
    this.route.params.subscribe((params) => (this.urlParam = params));
  }

  ngOnInit(): void {
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();
  }
  open(type){
    this.router.navigate(['/master/' + this.urlParam.key + '/add']);
  }
}
