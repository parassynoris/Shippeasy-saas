import { Injectable } from '@angular/core';
// import { Amplify } from 'aws-amplify';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { BehaviorSubject, combineLatest, forkJoin, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CommonFunctions } from '../shared/functions/common.function';
import { MessagingService } from './messaging.service';
import { CommonService } from '../shared/services/common.service';
import { ApiService } from '../admin/principal/api.service';
import { first, map, switchMap, takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import * as Constant from 'src/app/shared/common-constants';
import { ActivatedRoute, Router } from '@angular/router';
@Injectable({
  providedIn: 'root',
})
export class CognitoService {
  isInitialized = false;
  private authenticationSubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  authenticationtoken: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  redirecturl=""
  public userdetails: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  userdetails$ = this.userdetails.asObservable();
  userRoleAccess: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  userRoleAccess$ = this.userRoleAccess.asObservable();
  agentDetails: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  isExport: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  isUserLoggedIn: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  module: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  CurrentModule: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  roleList: any[];
  testing: any;
  constructor(private notification: NzNotificationService, private commonFunctions: CommonFunctions, private messagingService: MessagingService,
    private _api: ApiService, private translateService: TranslateService, private router: Router,private route: ActivatedRoute,
    private commonService: CommonService) {
    // Amplify.configure({
    //   Auth: environment.cognito,
    // });
    // this.checklogin(); 
    this.route.queryParams?.subscribe(params => {
      const id = params?.['redirect'];
      if(id && id!='/login')
      this.redirecturl = id;
    });
    this.userdetails.next(this.testing)
  }

  checklogin() {
    // this.messagingService.requestPermission()
    // Auth.currentAuthenticatedUser().then(
    //   async (user) => {
    //     this.authenticationSubject.next(true);
    //     this.authenticationtoken.next(
    //       (await Auth.currentSession()).getIdToken()
    //     );
    //   },
    //   (_err) => {
    //     this.authenticationSubject.next(false);
    //   }
    // );
    if (this.commonFunctions.getAuthToken()) {
      this.authenticationSubject.next(true);
      this.getUserDetails(false)
    } else {
      this.authenticationSubject.next(false);
    }

  }
  getUserDatails(): BehaviorSubject<any> {
    let userdetails = JSON.parse(this.commonFunctions.get(localStorage.getItem(Constant.UserDetails)));
    this.userdetails.next(userdetails);
    return this.userdetails
  }
  getagentDetails() {
    let agentDetails = JSON.parse(this.commonFunctions.get(localStorage.getItem(Constant.AgentDetails)));
    this.agentDetails.next(agentDetails);
    return this.agentDetails
  }
  getRoleDetails() {
    return this.userRoleAccess
  }

  getIsExport() {
    return this.isExport
  }
  getIsUserLoggedIn() {
    return this.isUserLoggedIn
  }

  getUserModule() {
    return this.module
  }

  getSelectedModule() {
    return this.CurrentModule;
  }

  setSelectedModule(module) {
    this.CurrentModule.next(module)
  }

  getUserDetails(login) {

    return new Promise((resolve) => {
      this.commonService
        .post('auth', {})
        .pipe(first())
        .subscribe((res: any) => {
          this.roleList = [];

          if (res && res.length > 0) {
            if (res[0].translateFileName) {
              this.translateService.currentLang = res[0].translateFileName;
            }
            else {
              this.translateService.currentLang = 'en';
            }


            localStorage.setItem('LoginType', this.commonFunctions.set(JSON.stringify(res[0]?.userData?.userType || '')));
           
            if (res[0]?.userData?.userType == 'customer') { 
              let customerPayload = this._api.filterList()
              customerPayload.query = {
                "partymasterId": res[0]?.userData?.customerId,
                "orgId": res[0]?.userData?.orgId
              }

              let agentPayload = this._api.filterList()
              agentPayload.query = {
                "orgId": res[0]?.userData?.orgId
              }
 
             combineLatest([this._api.getSTList("partymaster", customerPayload), this._api.getSTList("agent", agentPayload)]).subscribe({
              next: ([result1, result2]) => {
                localStorage.setItem('customerDetails', this.commonFunctions.set(JSON.stringify(result1?.documents[0])));
                localStorage.setItem('agentCurrency', this.commonFunctions.set(JSON.stringify(result2?.documents[0]?.currency?.currencyName)));
                localStorage.setItem('customerAgent', this.commonFunctions.set(JSON.stringify(result2?.documents[0])));
                let payloadCur = {
                  "fromCurrency": result2?.documents[0]?.currency?.currencyName,
                  "toCurrency": result1?.documents[0]?.currency?.currencyCode,
                }
                this._api.getExchangeRate('exchangeRate', payloadCur).subscribe(result3 => {
                  localStorage.setItem('exRate', this.commonFunctions.set(JSON.stringify(result3[payloadCur?.toCurrency])));
                  if (login) {
                  window.location.reload()
                  }
                })
              }
             });
            } else{
              this.getActiveAgent(res[0]?.userData?.orgId)
            }
            
            localStorage.setItem(Constant.UserDetails, this.commonFunctions.set(JSON.stringify(res[0])));
            // this.testing = res[0]
            // this.userdetails.next(res[0])
            // localStorage.setItem(Constant.UserRoleAccess, this.commonFunctions.set(JSON.stringify(res[0].accesslevel)));
            this.userRoleAccess.next(res[0].accesslevel)

            this.commonFunctions.getAccessLavelEventEmmiter.emit("1");

            // let moduleName = 'SMARTAGENT'
            // res?.[0]?.accesslevel.forEach((res) => {
            //     moduleName = "SHIPEASY"
            //   }
            // })
            this.setMenuAndPermission(login);
            this.isExport.next("true")
            this.isUserLoggedIn.next("true")
            // this.module.next(moduleName)
            this.getLoginUserDetails(res);
            if (login) {
              localStorage.setItem('isExport', 'true');
              localStorage.setItem('customerType', 'Export');
              if (res[0]?.userData?.defaultModule) {
                const type = res[0]?.userData?.defaultModule;
                switch (type) {
                  case 'Import':
                    localStorage.setItem('isExport', 'false');
                    localStorage.setItem('isImport', 'true');
                    localStorage.setItem('isTransport', 'false');
                    localStorage.setItem('customerType', 'Import');
                    this.isExport.next("false");
                    break;
                  case 'Export':
                    localStorage.setItem('isExport', 'true');
                    localStorage.setItem('isImport', 'false');
                    localStorage.setItem('isTransport', 'false');
                    localStorage.setItem('customerType', 'Export');
                    break;
                  case 'Transport':
                    localStorage.setItem('isExport', 'false');
                    localStorage.setItem('isImport', 'false');
                    localStorage.setItem('isTransport', 'true');
                    localStorage.setItem('customerType', 'Transport');
                    this.isExport.next("false");
                    break;
                  default:
                    break;
                }
              }
              this.notification.create(
                'success',
                'Logged In Successfully',
                ''
              );
            }

          }
          resolve(res)
        });


    })
  }
  getActiveAgent(orgId){
    let agentPayload = this._api.filterList()
    agentPayload.query = {
      "orgId":  orgId
    }
    this._api.getSTList("agent", agentPayload).subscribe((res)=>{
      localStorage.setItem('ActiveAgent', this.commonFunctions?.set(JSON.stringify(res?.documents[0])));
    })
  }

  getLoginUserDetails(res) {

    // let payload = this._api.filterList()
    // payload.query = { 
    //   "userId": localStorage.getItem('userId') 
    // }
    // this._api.getSTList("user", payload).subscribe((res: any) => {
    // this.setMenuAndPermission(login);
    localStorage.setItem('agentDetails', this.commonFunctions.set(JSON.stringify(res[0].userData)));
    // this.agentDetails.next(res.documents[0])

    // })
  }

  setMenuAndPermission(login) {
    var roleData = this.getAccessLevels();
    var menuData = [];
    var wildCardUser = false;
    if (roleData && roleData.length) {
      roleData.forEach((element) => {
        Constant.FEATURE_ACCESS.forEach((access) => {
          var wildcardUser = element.includes("Wildcard");
          if (wildcardUser) {
            wildCardUser = true;
            return;
          }
          var isPresent = access.accessLevel.filter((x) => x.name === element);

          if (isPresent && isPresent.length > 0) {
            var isPresentMenuData = menuData.filter(x => x.name === access.name);
            if (isPresentMenuData && isPresentMenuData.length <= 0) {
              menuData.push(access);
            }
          }
        });
      });

      if (wildCardUser) {
        menuData = Constant.FEATURE_ACCESS.sort((a, b) => (a['srNo'] > b['srNo'] ? 1 : -1));
      }
      else {
        menuData = menuData.sort((a, b) => (a['srNo'] > b['srNo'] ? 1 : -1));
      }
      if (login) {
          if(this.redirecturl && this.redirecturl!='/login'){
            if(this.commonFunctions.isSuperAdmin()){
              this.redirecturl='register/list'
            }
          this.router.navigate([this.redirecturl])
           }
           else{
            if (this.commonFunctions.getUserType()) {
              this.router.navigate(['customer/quotation/list'])
            } else if(this.commonFunctions.isSuperAdmin()){
              this.router.navigate(['register/list'])
            } else if (this.commonFunctions.getwarehouseType()) {
              this.router.navigate(['warehouse/main-ware-house'])
            }
             else {
              
              if (menuData.length > 0) {
                // this.router.navigate([menuData[0].routerLink])
                 this.router.navigate(['dashboard/list'])
              }
              else {
                if(this.commonFunctions.isSuperAdmin()){
                  this.redirecturl='register/list';
                  this.router.navigate([this.redirecturl]);
                  return;
                }
                this.router.navigate(['profile'])
              }
            }
    
           }
      }
    } else {
      menuData = Constant.FEATURE_ACCESS;
      if (login) {
        if(this.redirecturl && this.redirecturl!='/login'){
          if(this.commonFunctions.isSuperAdmin()){
            this.redirecturl='register/list'
          }
          this.router.navigate([this.redirecturl])
           } 
           else{
        if (this.commonFunctions.getUserType()) {
          this.router.navigate(['customer/quotation/list'])
        } else  if(this.commonFunctions.isSuperAdmin()){
          this.router.navigate(['register/list']) 
        } else {
          if (menuData.length > 0) {
            this.router.navigate([menuData[0].routerLink])
            // this.router.navigate(['dashboard/list'])
          } else {
            this.router.navigate(['profile'])
          }
        }
      }
      }
    }

  }
  // signup(params) {
  //   return Auth.signUp(params).then(res => {
  //     return res;
  //   });
  // }

  async signout() {
    // await Auth.signOut();
    this.authenticationSubject.next(false);
    localStorage.removeItem('isUserLoggedIn');

    return true;
  }

  // signin(body) {
  //   return Auth.signIn(body).then(async (res) => {
  //     this.authenticationSubject.next(true);
  //     this.authenticationtoken.next(
  //       (await Auth.currentSession()).getIdToken()
  //     );
  //     return res;
  //   });
  // }

  gettoken() {
    return this.commonFunctions.getAuthToken()
    // if (this.authenticationtoken.value) {
    //   return this.authenticationtoken.value;
    // } else {
    //   this.checklogin();
    //   return this.authenticationtoken.value;
    // }
  }

  // async confirm(email, code) {
  //   try {
  //     const { user } = await Auth.confirmSignUp(email, code);
  //     return user;
  //   } catch (error) {
  //     this.resendConfirmationCode(email);
  //     return false;
  //   }
  // }

  // async resendConfirmationCode(username) {
  //   try {
  //     await Auth.resendSignUp(username);
  //   } catch (err) {
  //   }
  // }

  isStoltUser() {
    let user;
    this.getUserDatails().subscribe((resp) => {
      if (resp != null) {
        user = resp
      }
    })
    if (user?.roleName === 'SHIPEASY') {
      return true;
    } else {
      return false;
    }
  }
  isSmartAgentUser() {
    let user;
    this.getUserDatails().subscribe((resp) => {
      if (resp != null) {
        user = resp
      }
    })
    if (user?.roleName === 'SHIPEASY') {
      return true;
    } else {
      return false;
    }
  }

  getModule() {
    let user: any
    this.getUserModule().subscribe((resp) => {
      if (resp != null) {
        user = resp
      }
    })
    if (user === 'SMARTAGENT') {
      return true;
    } else {
      return false;
    }
  }

  // async refreshtoken() {
  //   this.authenticationtoken.next(
  //     (await Auth.currentSession()).getIdToken()
  //   );
  // }

  isAuthenticated(): boolean {
    return this.authenticationSubject.value;
  }

  // isAuthenticatedPromise(): any {
  //   return Auth.currentAuthenticatedUser()
  //     .then((res) => {
  //       return true;
  //     })
  //     .catch((err) => {
  //       return false;
  //     });
  // }
  // public getUser(): Promise<any> {
  //   return Auth.currentUserInfo();
  // }

  // async newPassword(newPasswordUser: any) {
  //   var userdata;
  //   try {
  //     await Auth.currentAuthenticatedUser()
  //       .then((user) => {
  //         return Auth.changePassword(
  //           user,
  //           newPasswordUser.oldPassword,
  //           newPasswordUser.newPassword
  //         )
  //           .then((res) => {
  //             return res;
  //           })
  //           .catch((err) => {
  //             return err;
  //           });
  //       })
  //       .then((data) => {
  //         if (data === "SUCCESS") {
  //           this.notification.create('success', 'Save Successfully', '');
  //         } else {
  //           this.notification.create('error', 'Current Password is wrong', '');
  //         }
  //       })
  //       .catch((err) => this.notification.create('error', 'Current Password is wrong', ''));
  //   } catch (error) {
  //     return "false";
  //   }





  // }
  // public forgetPassword(username: string): Promise<any> {
  //   return Auth.forgotPassword(username)

  // }

  // public forgetPasswordSubmit(user: any): Promise<any> {
  //   return Auth.forgotPasswordSubmit(user.username, user.code, user.password)
  // }

  getAccessLevels(featureName = "") {
    let AccessLevels;
    this?.getRoleDetails().subscribe((resp) => {
      if (resp != null) {
        AccessLevels = resp
      }
    })
    var accessData = [];
    if (AccessLevels !== null && AccessLevels !== undefined) {
      AccessLevels.forEach((element) => {
        accessData.push(element.module + '-' + element.featureName);
      });
    }
    return accessData;
  }
  getModules() {
    let AccessLevels;
    this.getRoleDetails().subscribe((resp) => {
      if (resp != null) {
        AccessLevels = resp
      }
    })
    var moduleData = [];
    if (AccessLevels !== null && AccessLevels !== undefined) {
      AccessLevels.forEach((element) => {
        var wildcardUser = element.featureName.includes(Constant.Wildcard);
        if (wildcardUser) {
          Constant.MODULE_ACCESS.forEach(menu => {
            moduleData.push(menu.ModuleName);
          });
          return moduleData;
        }
        var isPresent = Constant.MODULE_ACCESS.filter((x) => x.ModuleName === element.module);

        if (isPresent && isPresent.length > 0) {
          var isPresentMenuData = moduleData.filter(x => x === element.module);
          if (isPresentMenuData && isPresentMenuData.length <= 0) {
            moduleData.push(element.module);
          }
        }
      });
    }
    return moduleData;
  }
  isuserrole(accesslevel: string) {
    return true
    let getUser = JSON.parse(this.commonFunctions.get(localStorage.getItem(Constant.AgentDetails)));
    try {
      if (getUser()?.roles?.find(i => i?.roleName.hasOwnProperty(accesslevel)))
        return true
      else return false
    }
    catch {
      return false
    }
  }
  isIndianCustomer() {

    let agentDetails = JSON.parse(this.commonFunctions.get(localStorage.getItem(Constant.AgentDetails)));
    try {
      if (agentDetails?.countryName?.toLowerCase() === 'india') {
        return true;
      }
      else {
        return false;
      }
    }
    catch {
      return false;
    }
  }
}
