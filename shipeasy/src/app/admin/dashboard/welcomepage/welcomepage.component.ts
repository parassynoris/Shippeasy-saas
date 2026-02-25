import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/services/common/common.service';
import { LoaderService } from 'src/app/services/loader.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { ApiService } from '../../principal/api.service';

@Component({
  selector: 'app-welcomepage',
  templateUrl: './welcomepage.component.html',
  styleUrls: ['./welcomepage.component.scss']
})
export class WelcomepageComponent implements OnInit {
  holdControl: any;
  urlParam: any;
  isProductList: boolean = true;
  isTemplateList: boolean = true;

  profileData: any[] = [];
  loader: boolean = false;



  constructor(private router: Router, private route: ActivatedRoute, private modalService: NgbModal, public loaderService: LoaderService, public commonFunctions: CommonFunctions, public commonService: CommonService, public _api: ApiService,) { }

  ngOnInit(): void {
    this.getProfileCompleteness();
  }

  // onTab(data) {
  //   this.router.navigate(['/register/' + this.route.snapshot.params.id + '/' + data.key]);


  //   this.holdControl = data.key;
  //   this.route.params.subscribe(params =>
  //     this.urlParam = params
  //   );

  // }


  getProfileCompleteness() {
    this.loader = true;
    this.loaderService.showcircle();

    let payload = this.commonService.filterList();
    payload.query = {
      userId: this.commonFunctions.getAgentDetails().userId
    };

    this.commonService.getSTList1('profileCompletion', payload)
      .subscribe(
        (res: any) => {

          this.profileData = res;
          this.loader = false;
          this.loaderService.hidecircle();
        },
        (error) => {
          console.error('Error fetching profile completeness:', error);
          this.loader = false;
          this.loaderService.hidecircle();
        }
      );
  }
  isSectionVisible = true;
  closeSection() {
    this.isSectionVisible = false;
    this.modalService.dismissAll();
  }

  navigateTo(destination: string, id) {
    let route: string;
    let queryParams: any = null;

    switch (destination) {
      case 'companyprofile':
        route = 'register';
        queryParams = { childUserList: 'yes' };
        break;
      case 'branch':
        route = 'register/' + this.commonFunctions.getAgentDetails()?.agentId + '/branch';
        break;
      case 'department':
        route = '/register/' + this.commonFunctions.getAgentDetails()?.agentId + '/department';
        break;
      case 'bank':
        route = 'register/' + this.commonFunctions.getAgentDetails()?.agentId + '/bank';
        break;
      case 'role':
        route = 'master/roles';
        break;
      case 'partymaster':
        route = 'address-book';
        break;
      case 'costitem':
        route = 'master/chargemaster';
        break;
      case 'product':
        route = 'master/product';
        break;
      case 'shippingline':
        route = 'master/shipping-line';
        break;
      case 'vessel':
        route = 'master/VesselMaster';
        break;
      case 'voyage':
        route = 'master/export-voyage';
        break;
      case 'containermaster':
        route = 'master/container-master';
        break;
      case 'emailtemplate':
        route = 'master/mailtemplate';
        break;
      case 'vendor':
        route = 'master/Vendor-Master';
        break;
      case 'ratemaster':
        route = 'master/rate-master';
        break;
      default:
        console.error('Unknown destination:', destination);
        return;
    }

    let navigationExtras: NavigationExtras = {};
    if (route === 'register') {
      navigationExtras.queryParams = queryParams;
    }

    this.router.navigate([route], navigationExtras);
    this.modalService.dismissAll();
  }

}


