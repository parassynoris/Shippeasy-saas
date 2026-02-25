import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CognitoService } from '../../services/cognito.service';
import * as Constant from 'src/app/shared/common-constants';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { first } from 'rxjs/operators';
import { CommonService } from 'src/app/shared/services/common.service'; 
import { ApiService } from 'src/app/admin/principal/api.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'; 
import { HelpComponent } from 'src/app/layout/help/help.component';
import { ContactUsComponent } from 'src/app/layout/contact-us/contact-us.component';
import { PrivacyComponent } from 'src/app/layout/privacy/privacy.component';
import { environment } from 'src/environments/environment';
import { PublicClientApplication, AuthenticationResult, EventType, BrowserAuthError } from '@azure/msal-browser';
import { HttpClient } from '@angular/common/http';
 
declare var google: any;
declare var FB: any;
interface User {
  name: string;
  email: string;
  photoUrl: string;
  firstName:string,
  lastName : string
}

declare function localDataStorage(any): any;
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  responsedata: any;
  loginForm: FormGroup;
  submitted: boolean;
  Status: boolean;
  hide: boolean;
  result: boolean;
  username: string;
  password: string;
  roleList: Array<any> = [];

  user: User | null = null;
  msalInstance: PublicClientApplication;
  interactionInProgress: boolean = false;

  constructor(public router: Router,private modalService: NgbModal, 
    private ngZone: NgZone, 
    private formBuilder: FormBuilder,
    public notification: NzNotificationService, 
    private _cognito: CognitoService,
    private commonFunctions: CommonFunctions,
    private commonService: CommonService, 
    private _api : ApiService,
    private commonFunction : CommonFunctions,
    private http: HttpClient
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [false]
    });

    this.msalInstance = new PublicClientApplication({
      auth: {
        clientId: environment.azureClientId,
        authority: `https://login.microsoftonline.com/${environment.tenantId}`,
        redirectUri: environment.redirectUri
      }
    });

    this.msalInstance.addEventCallback((event) => {
      if (event.eventType === EventType.LOGIN_START) {
        this.interactionInProgress = true;
      } else if (event.eventType === EventType.LOGIN_SUCCESS || event.eventType === EventType.LOGIN_FAILURE) {
        this.interactionInProgress = false;
      }
    });
  }

  toggleFieldTextType() {
    this.hide = !this.hide;
  }

  async ngOnInit(): Promise<void> {
    this.loadGoogleScript();
    // this.loadFacebookSDK()
    const rememberMe = localStorage.getItem('rememberedMe') || false;
    let username =''
    let password =''
    if(rememberMe && localStorage.getItem('rememberedUsername') && localStorage.getItem('rememberedPassword')){
       username = JSON.parse(this.commonFunction.get(localStorage.getItem('rememberedUsername'))) || '';
       password = JSON.parse(this.commonFunction.get(localStorage.getItem('rememberedPassword')))  || '';
    }
   
     
    this.loginForm = this.formBuilder.group({
      username: [username, Validators.required],
      password: [password, Validators.required],
      rememberMe: [rememberMe||''],

    });
    await this.initializeMsal();
  

  }

  async initializeMsal() {
    try {
      await this.msalInstance.initialize();
      console.log('MSAL initialized');
    } catch (error) {
      console.error('MSAL initialization failed', error);
    }
  }

  get f() { return this.loginForm.controls; }

  onLogin(data: any) {
    this.submitted = true;

    if (this.loginForm.valid) {
      this.username = data.username;
      this.password = data.password;
      // this._cognito.signin({ username: this.username, password: this.password }).then((res) => {
      //   if (res) {
      //     localStorage.setItem(Constant.CognitoUserDetails, this.commonFunctions.set(JSON.stringify(res)));
       
      //     this.getUserDetails(res.attributes.sub);

      //   }
      // }, error => {
      //   this.notification.create(
      //     'error',
      //     'Plase enter Vaild Username & Password',
      //     ''
      //   );
      // })

      this._api.login('user/login', { Username: this.username, Password: this.password }).subscribe((res:any)=>{
        if (res) { 
          const token = res.accessToken; 
        this.commonFunctions.setAuthToken(token);
        localStorage.setItem('token', this.commonFunctions.set(JSON.stringify(token)) );
        if (res.userData && res.userData.userloginType) {
          localStorage.setItem('userloginType', res.userData.userloginType);
        }
          // localStorage.setItem(Constant.CognitoUserDetails, this.commonFunctions.set(JSON.stringify(res)));


          if (data.rememberMe) {
            localStorage.setItem('rememberedUsername',this.commonFunctions.set(JSON.stringify(this.username)) ); 
            localStorage.setItem('rememberedPassword',this.commonFunctions.set(JSON.stringify(this.password)) );
            localStorage.setItem('rememberedMe', 'true' );
          }else{
            localStorage.removeItem('rememberedUsername');
            localStorage.removeItem('rememberedPassword');
            localStorage.removeItem('rememberedMe');
          } 
          this._cognito.getUserDetails(true);  
        }
      }, error => { 
        this.notification?.create(
          'error',
           error?.error?.message ? error?.error?.message : error.message ? error?.message :  'Please enter Valid Username & Password',
          ''
        );
      }) 
    }
    else {
      if (!this.loginForm.controls.username.valid) {
        this.notification?.create(
          'error',
          'Please Enter Username',
          ''
        );
      } else if (!this.loginForm.controls.password.valid) {
        this.notification?.create(
          'error',
          'Please Enter Password',
          ''
        );
      } else {
        this.notification?.create(
          'error',
          'Please Enter Username & Password',
          ''
        );
      }
    }
  }



  getRolesFromUser(roleId) {
    let url = "master/list?type=role";
    let roleData = {
      size: Constant.SIZE_FOR_REQUEST,
      query: {
        bool: {
          must: [
            {
              match: {
                roleId: roleId,
              },
            },
          ],
        },
      },
    };
    this.commonService
      .post(url, roleData)
      .pipe(first())
      .subscribe((data: any) => {
        if (data.hits.hits.length > 0) {
          window.localStorage.removeItem(Constant.UserRoleAccess);
          this.roleList.push(data.hits.hits);
          localStorage.setItem(Constant.UserRoleAccess, this.commonFunctions.set(JSON.stringify(this.roleList)));
        }
        this.commonFunctions.getAccessLavelEventEmmiter.emit("1");
      });
  }

  goToforgotPassword() {
		this.router.navigate(['/forgot-password']);
	}
  loginWithGoogle(): void {
    // Handle login with Google
  }

 
  onOpenHelp() {
    this.modalService.open(HelpComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
      windowClass: 'modal-bottom', 
    });;

  }
  onOpenContact() {
    this.modalService.open(ContactUsComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
      windowClass: 'modal-bottom', 
    });;

  }
  onOpenSupport() {
    this.modalService.open(PrivacyComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
      windowClass: 'modal-bottom', 
    });;

  }



  loadGoogleScript() {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    script.onload = () => {
      this.initializeGoogleSignIn();
    };
  }

  initializeGoogleSignIn() {
    google.accounts.id.initialize({
      client_id: '651095598599-v41736ecg4m3vr3omlfjat8a17k317ou.apps.googleusercontent.com',
      callback: this.handleCredentialResponse.bind(this)
    });
  }
// webClientId: '706739804728-fp9cp0hmkhie4s8q9gd70p9ifaaolqta.apps.googleusercontent.c
  signInWithGoogle() {
    google.accounts.id.prompt();
  }

  handleCredentialResponse(response: any) {
    const decodedToken = this.decodeJwtResponse(response.credential); 
    this.ngZone.run(() => {
      this.user = {
        name: decodedToken.name,
        email: decodedToken.email,
        photoUrl: decodedToken.picture,
        firstName: decodedToken.given_name,
        lastName: decodedToken.family_name
      };
    });
    this.loginForm.controls['username'].setValue(this.user?.email); 
  }

  decodeJwtResponse(token: string) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  }

  signOut() {
    google.accounts.id.revoke(this.user?.email, () => {
      this.ngZone.run(() => {
        this.user = null;
      });
    });
  }
  loadFacebookSDK() {
    (window as any).fbAsyncInit = function () {
      FB.init({
        appId: '524179989984426', // Replace with your Facebook App ID
        cookie: true,
        xfbml: true,
        version: 'v20.0'
      });
      FB.AppEvents.logPageView();
    };
  }

  loginWithFacebook() {
    FB.login((response: any) => {
      if (response.authResponse) {
        console.log('Welcome!  Fetching your information.... ');
        FB.api('/me', { fields: 'name,email,picture' }, (response: any) => {
          console.log('Good to see you, ' + response.name + '.');
          console.log(response);
          // Handle user data here
        });
      } else {
        console.log('User cancelled login or did not fully authorize.');
      }
    }, { scope: 'email' });
  }

  async loginWithMicrosoft() { 
    if (!this.interactionInProgress) {
      this.interactionInProgress = true;
      await this.initializeMsal();
      this.msalInstance.loginPopup({
        scopes: ['User.Read']
      }).then((response: AuthenticationResult) => {
        this.getUserInfo(response.accessToken);
      }).catch(error => {
        if (error instanceof BrowserAuthError && error.errorCode === 'user_cancelled') {
          console.log('User cancelled the login flow.');
        } else {
          console.error(error);
        }
        this.notification.create('error', 'Microsoft Sign-In Failed', '');
      }).finally(() => {
        this.interactionInProgress = false;
      });
    } else {
      this.notification.create('error', 'Another interaction is in progress. Please try again later.', '');
    }
  }

  getUserInfo(accessToken: string) {
    this.http.get('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).subscribe((userInfo: any) => {
      this.ngZone.run(() => {
        this.user = {
          name: userInfo.displayName,
          email: userInfo.mail || userInfo.userPrincipalName,
          photoUrl: userInfo.photo,
          firstName: userInfo.givenName,
          lastName: userInfo.surname
        };
        this.loginForm.controls['username'].setValue(this.user?.email);
      });
    }, (error) => {
      console.error(error);
    });
  }
}

