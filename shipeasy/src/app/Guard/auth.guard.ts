import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree,Router, Route,UrlSegment } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CognitoService } from '../services/cognito.service';
import { Observable } from 'rxjs';
import { CommonFunctions } from '../shared/functions/common.function';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private _route: Router,private _cognito: CognitoService,private commonFunction : CommonFunctions) {
       // do nothing.

     }
     canActivate(
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree{
        // && localStorage.getItem('isUserLoggedIn')=='true'
        if((!this.commonFunction.isAuthenticated()) || this.commonFunction?.getUserType()){
          this._route.navigate(['login']);
            return this.commonFunction.isAuthenticated();
          }
          return this.commonFunction.isAuthenticated();

    }
    canLoad(
      route: Route,
      segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        
        if(this.commonFunction.isAuthenticated()){
          if(this.commonFunction.getUserType()){ 
            this._route.navigate(['login']);
          }else{ 
            this._route.navigate(['enquiry']);
          } 
          return this.commonFunction.isAuthenticated();
        }
        return true;
    }
}


