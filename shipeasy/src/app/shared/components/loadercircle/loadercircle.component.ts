import { Component, OnInit } from '@angular/core';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-loadercircle',
  templateUrl: './loadercircle.component.html',
  styleUrls: ['./loadercircle.component.scss']
})
export class LoadercircleComponent implements OnInit {
  color = '#8A8A8A';
  value = 500;
  constructor(public loaderService: LoaderService) {
    // do nothing.
   }

  ngOnInit(): void {
  
    this.loaderService.isLoadingcircle = false;
  }

}
