import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { CommonService } from 'src/app/shared/services/common.service';
import { smartagent } from '../data';
@Component({
  selector: 'app-smart-details',
  templateUrl: './smart-details.component.html',
  styleUrls: ['./smart-details.component.scss']
})
export class SmartDetailsComponent implements OnInit {

  smartdetailsData = smartagent.smartdetailsRow;
  urlParam: any;
  queryurlParam: any;
  currentUrl: any;
  holdControl: any;
  disbleTab : boolean = true
  tabs = smartagent.masterTabs;
  isProductList: boolean = true;
  isTemplateList: boolean = true;
  constructor(private router: Router, private route: ActivatedRoute,public commonService : CommonService,
    public commonfunction : CommonFunctions ,   private commonFunction: CommonFunctions) {
    this.route.params.subscribe(params =>
      this.urlParam = params
    );
    this.route.queryParams.subscribe(params =>
      this.queryurlParam = params
    );
    this.holdControl = this.urlParam.key;
    if(!this.route.snapshot.params.id || this.route.snapshot.params.id == 1){
      this.disbleTab = true;
     }else{
      this.disbleTab = false;
     }
  }
  onTab(data) {
    if(this.queryurlParam?.childUserList=='yes'){
      this.router.navigate(['/register/'+ this.route.snapshot.params.id +'/'+ data.key],{queryParams:{ childUserList: 'yes' }});
    }
    else{
      this.router.navigate(['/register/'+ this.route.snapshot.params.id +'/'+ data.key]);
    }

   
    this.holdControl = data.key;
    this.route.params.subscribe(params =>
      this.urlParam = params
    );

  }
  onOpenNew() {
    this.router.navigate(['/register/' + this.urlParam.key + '/addsmart']);
  }

  onOpenEdit(id) {
    this.router.navigate(['/register/' + this.urlParam.key + '/' + id + '/editsmart']);

  }
  currentLogin: boolean = false;
ngOnInit(): void {
  this.currentLogin = this.commonFunction.getwarehouseType();
  console.log('currentLogin', this.currentLogin);

  this.currentUrl = window.location.href.split('?')[0].split('/').pop();

  // Base tabs (excluding 'roles' for non-super admin)
  let filteredTabs = smartagent.masterTabs;
  if (!this.commonfunction.isSuperAdmin()) {
    filteredTabs = filteredTabs.filter((x) => x.key !== 'roles');
  }

  if (this.currentLogin ) {
    filteredTabs = filteredTabs.filter(
      (x) => x.key !== 'bank' && x.key !== 'holiday' && x.key !== 'settings'
    );
  }

  this.tabs = filteredTabs;
  console.log('Final tabs:', this.tabs);
}

  backToList(){
    this.router.navigate(['/register/list']);
  }
}
