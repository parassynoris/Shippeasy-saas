import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { CommonFunctions } from '../shared/functions/common.function';
import { CognitoService } from '../services/cognito.service';
// import { log } from 'console';

@Injectable({
  providedIn: 'root'
})
export class OrgSettingGuard implements CanActivate {
  orgId: any;
  constructor(private route:ActivatedRoute,private router: Router, public commonfunction : CommonFunctions,private cognito : CognitoService) { 
    this.cognito.getagentDetails().subscribe((resp) => { 
        this.orgId = resp?.orgId;   
    });
    
    this.route.queryParams.subscribe(params => {
      const id = params?.['redirect']
    })
  }
  canActivate(
    
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree { 
      console.log(this.route);
      
      if(this.commonfunction.isSuperAdmin()){ 

        return true;

      }else{
        
        this.router.navigate(['/register', 'list', this.commonfunction.getAgentDetails().agentId || 1, 'details', 'editsmart'],{queryParams:route.queryParams});
        return false;
      }
     
  }
  
}
