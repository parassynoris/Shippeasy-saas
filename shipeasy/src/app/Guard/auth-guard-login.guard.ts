import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { CognitoService } from '../services/cognito.service';
import { CommonFunctions } from '../shared/functions/common.function';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardLoginGuard implements CanActivate {
  constructor(private _cognito: CognitoService,private _route:Router,private commonFunction : CommonFunctions){
// do nothing.
  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      // || localStorage.getItem('isUserLoggedIn')=='true'
      if(this.commonFunction.isAuthenticated() ){
        if(this.commonFunction.getUserType()){
          this._route.navigate(['customer/quotation/list'])
        }else if(this.commonFunction.getwarehouseType()){
          this._route.navigate(['warehouse/main-ware-house'])
        }
        else if(this.commonFunction.isSuperAdmin()){
          this._route.navigate(['register/list']);
        }else{ 
          this._route.navigate(['dashboard/list']);
        } 
       
        return false;
      }
      return true;


  }

}
