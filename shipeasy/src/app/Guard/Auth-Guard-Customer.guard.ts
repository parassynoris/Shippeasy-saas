import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree,Router, Route,UrlSegment } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CognitoService } from '../services/cognito.service';
import { Observable } from 'rxjs';
import { CommonFunctions } from '../shared/functions/common.function';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardCustomer implements CanActivate {
  constructor(
    private authService: AuthService,
    private _route: Router,private _cognito: CognitoService,private commonFunction : CommonFunctions) {
       // do nothing.

     }
     canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree{
          // && localStorage.getItem('isUserLoggedIn')=='true'
          if((!this.commonFunction.isAuthenticated()) || (!this.commonFunction.getUserType())){
            this._route.navigate(['login']);
              return this.commonFunction.isAuthenticated();
            }
            return this.commonFunction.isAuthenticated();
  
      }
    //  canActivate(
    //     route: ActivatedRouteSnapshot,
    //     state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    //         let accesslevels = this._cognito.getAccessLevels();
    //         const role = route.data['roles'];
    //         const hasAccess = accesslevels?.filter((accesslevel: any) => role?.some((i: any) => i == accesslevel?.featureCode)).length > 0;
    //         if (!hasAccess) {
    //             this._route.navigate(['login']);
    //           return false;
    //         }
    //         return true;
    //   }
}


