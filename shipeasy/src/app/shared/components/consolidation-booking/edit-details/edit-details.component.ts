import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/services/common/common.service';
import { batch } from '../data';
@Component({
  selector: 'app-edit-details',
  templateUrl: './edit-details.component.html',
  styleUrls: ['./edit-details.component.scss']
})

// Work is under progress


export class EditDetailsComponent implements OnInit {
  isExport:boolean
  id:any
  tabs:any
  consolidationbooking:any=[]
  currentUrl:any
  urlParam:any
  holdControl:any
  constructor(private route: ActivatedRoute, private commonService: CommonService,
    public router: Router,
  ) {
    this.isExport = localStorage.getItem('isExport') === 'true' ? true : false
    this.id = this.route.snapshot.params['id'];
    console.log(this.id);
    this.route.params.subscribe((params) => (this.urlParam = params));
    this.holdControl = this.urlParam.key;
    console.log(this.urlParam);
    
    this.getConsolidateBooking()
   }

  ngOnInit(): void {
    if (this.isExport)
      this.tabs = batch.masterTabs
    console.log(this.tabs);
    
    if (!this.isExport)
      this.tabs = batch.masterTabs.filter((x) => x?.key !== 'shipping-instruction' && x?.key !== 'destination')


    this.currentUrl = this.router.url.split('?')[0].split('/').slice(-3)[0]

  }
  navToEdit() {
    this.router.navigate([
      '/consolidation-booking/edit/' + this.urlParam.id + '/edit-consolidation',
    ]); 
  }
  onTab(data) {
    this.router.navigate([
      '/consolidation-booking/edit/' + this.urlParam.id + '/' + data.key,
    ]);
    this.holdControl = data.key;

  }
  navigateToNewTab1(element) {
    // batch/list/add/f8c63c71-2884-11ef-a357-9b85b06a2cb4/details
    let url = 'batch/list/add/'+element.batchId+'/details'
    window.open(url );
  }
  getConsolidateBooking(){
    let payload = this.commonService?.filterList()
    if(payload?.query)payload.query = {
      "consolidationbookingId": this.id
    }
    this.commonService?.getSTList("consolidationbooking", payload)?.subscribe((res: any) => {
      this.consolidationbooking = res.documents[0]
      console.log(this.consolidationbooking);
      
      
    }
    )
  }
}
