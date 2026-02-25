import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CognitoService } from 'src/app/services/cognito.service';
import { batch } from './data';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import * as Constant from 'src/app/shared/common-constants';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { CommonService } from 'src/app/services/common/common.service';
@Component({
  selector: 'app-finance',
  templateUrl: './finance.component.html',
  styleUrls: ['./finance.component.scss']
})
export class FinanceComponent implements OnInit {

  tabs = batch.masterTabs;
  urlParam: any;
  holdControl: any;
  isStoltUser: any;
  isSmartAgentUser: any;
  financeTabs: any = [];
  menuData:any=[]
  userData: any;
  accesslevels: any;
  constructor(public router: Router, private route: ActivatedRoute, public translate: TranslateService, private _cognit: CognitoService,
    public commonFunctions: CommonFunctions, private profilesService : ProfilesService,public commonService : CommonService) {
    this.route.params.subscribe(params =>
      this.urlParam = params
    );
    this._cognit?.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.accesslevels = resp?.accesslevel

      }
    })
    this.holdControl = this.urlParam.key;
    this.isSmartAgentUser = this._cognit.getModule();
  }

  holdControlKey(key) {
    if (key === 'bills') {
      return 'New Vendor Bill'
    }else if(key === 'reciept'){
      return 'Receipt'
    } else {
      return key 
    }

  }

  onTab(data) {
    this.router.navigate(['/finance/' + data.key]);
    this.holdControl = data.key;

  }
  calculator(){
    window.open('Calculator:///');
}
getMenuList(){
  this.menuData = [] 
  var menuAccess = this.userData;
  

    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {"status": true}
    this.commonService.getSTList('menu', payload)?.subscribe(data=>{
      
      var menus = []
      let id =""

      let subTariffs = []
      var menuDATA:any;
      menuDATA = data?.documents
      menuDATA?.forEach(e=>{
        if(e?.parentMenuId !== "" && e.category === 'finance')
        {
          let isMenu = []
           isMenu = menuAccess?.menu ? menuAccess?.menu.filter(f=>f.menuName === e?.menuName) : []
          let isFeatureAccess = menuAccess?.accesslevel ? menuAccess?.accesslevel.filter(f1=>f1.featureName === e?.menuName):[]
          if(isMenu?.length > 0 && e.category === 'finance'){
            
            menus.push(e)
          }
        }
      })

      this.menuData = menus 
      
      this.menuData = this.menuData.sort(function(a, b){
        if(a['sortOrder'] < b['sortOrder']) { return -1; }
        if(a['sortOrder'] > b['sortOrder']) { return 1; }
        return 0;

    })
   
    this.tabs.forEach((item, index) => {
      this.menuData.forEach((element)=>{ 
        if (item.accessName.toLowerCase() === element.menuName.toLowerCase()) {
          this.financeTabs.push(item)
        }
      })
     
    })

    let mainfeatureList = []
    this.tabs.forEach((element) => {
      if (element?.featureCode == '') {
        mainfeatureList?.push(element)
      } else {
        if (this.accesslevels?.filter(accesslevel => [element?.featureCode]?.some(i => i === accesslevel?.featureCode)).length > 0 && this.accesslevels?.filter(accesslevel => [element?.featureCode].some(j => j === accesslevel?.featureCode))[0]?.accesslevel?.includes('add')) {
          mainfeatureList?.push(element)
        }
      }

    })

    this.tabs = mainfeatureList

    this.financeTabs =  this.financeTabs.filter((obj, index, self) =>
    index === self.findIndex((t) => (
        t.control === obj.control
    ))
);
      
    
    })
  }
 async ngOnInit() { 
   await this._cognit.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
       return this.userData = resp
      }})
  this.getMenuList() 
    this.financeTabs.forEach((item, index) => {
      this.translate.get('stolt').subscribe((data: any) => {
        let langKey = data.finance?.tab;
        switch (item.key) {
          case ('invoice'):
            item.name = langKey.invoice;
            break;
          case ('payment'):
            item.name = langKey.payment;
            break;
          case ('bills'):
            item.name = langKey.bills;
            break;
            case ('posting'):
              item.name = langKey.posting;
              break;
          case ('credit'):
            item.name = langKey.credit;
            break;
          case ('debit'):
            item.name = langKey.debit;
            break;
          case ('pl'):
            item.name = langKey.pl;
            break;
          case ('receiptConfirmation'):
            item.name = langKey.receiptConfirmation;
            break;
          case ('ReceiptAcknowledgement'):
            item.name = langKey.ReceiptAcknowledgement;
            break;
        }
      });
    });
  }

}
