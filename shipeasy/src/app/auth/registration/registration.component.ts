import { Component, OnInit ,NgZone} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ContactUsComponent } from 'src/app/layout/contact-us/contact-us.component';
import { HelpComponent } from 'src/app/layout/help/help.component';
import { PrivacyComponent } from 'src/app/layout/privacy/privacy.component';
import { CommonService } from 'src/app/services/common/common.service';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { environment } from 'src/environments/environment';
import { PublicClientApplication, AuthenticationResult, EventType } from '@azure/msal-browser';
import { HttpClient } from '@angular/common/http';
declare var google: any;
declare var FB :any;
interface User {
    name: string;
    email: string;
    photoUrl: string;
    firstName:string,
    lastName : string
  }
@Component({
    selector: 'app-registration',
    templateUrl: './registration.component.html',
    styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {
    smartAgentForm: FormGroup;
    submitted: boolean = false;
    countryList: any;
    countryCopyData: any[] = [];
    stateList: any[] = [];;
    callingCodeList: any;
    currencyList: any;
    cityList: any = [];
    user: User | null = null;
    msalInstance: PublicClientApplication;
    interactionInProgress: boolean = false;

    constructor(private modalService: NgbModal, public masterService: MastersService, private profilesService: ProfilesService
        , public notification: NzNotificationService, private formBuilder: FormBuilder, public router: Router,  private ngZone: NgZone,
        private route: ActivatedRoute, private commonService: CommonService, private http: HttpClient) {
        this.smartAgentForm = this.formBuilder.group({
            uploadLogo: [''],
            smartAgent: ['', Validators.required],
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            country: ['', Validators.required],
            state: ['', Validators.required],
            city: ['' ],
            primaryCountryCode: ['', Validators.required],
            primaryAreaCode: [''],
            primaryNo: ['', Validators.required],
            primaryEmailId: ['', [Validators.required, Validators.pattern(environment.validate.email)]],
            currency: ['', Validators.required],
            taxType: [''],
            pinCode: [''],
            address: [''],
            secondaryCountryCode: [''],
            secondaryAreaCode: [''],
            secondaryNo: [''],
            faxCountryCode: [''],
            faxAreaCode: [''],
            faxNo: [''],
            phoneCountryCode: [''],
            phoneAreaCode: [''],
            phoneNo: [''],
            website: ['' ],
            taxCode: [''],
            taxId: ['' ],
            portName: [''],
            vendorType: [''], 
            commercialNumber: [''],
            poldetentioncurrency:[''],
            picType: [''],
            picName: [''],
            picName1: [''],
            picMobileCountryCode: [''],
            picMobileAreaCode: [''],
            picMobile: [''],
            picEmailId: [''],
            dAndBNumber: [''],
            timeZone: [''],
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
    get f() {
        return this.smartAgentForm.controls;
    }

    async ngOnInit(): Promise<void> {
        this.loadGoogleScript();
        this.getCountryList();
        this.getCurrencyList();
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

    getCountryList() {
        let payload = this.commonService.filterList()
        if (payload?.query) payload.query = {
            "status": true,
        }
        this.commonService.getSTList('country', payload)?.subscribe((data) => {
            this.countryList = data.documents;
            this.countryCopyData = [...this.countryList];
        });
    }

    getStateList() {
        this.stateList = [];
        let countryData = this.countryList?.filter(x => x?.countryId === this.smartAgentForm.get('country').value);
        this.callingCodeList = countryData;
        if (countryData?.[0]?.countryName?.toLowerCase() === 'india') {
            this.smartAgentForm.controls['taxType'].setValue('GST');
        } else {
            this.smartAgentForm.controls['taxType'].setValue('TAX');
        }

        let payload = this.commonService.filterList()
        payload.query = {
            "status": true, 
            countryId: this.smartAgentForm.get('country').value
        }
        this.smartAgentForm.controls['primaryCountryCode'].setValue(this.callingCodeList[0]?.countryPhoneCode);
        this.commonService.getSTList('state', payload).subscribe((data) => {
            this.stateList = data.documents; 
        });

    }
    getCityList() {
        this.cityList = [];
        let payload = this.commonService.filterList()
        payload.query = {
          "status":true,
          stateId: this.smartAgentForm.get('state').value
          }
       
        this.commonService.getSTList('city',payload).subscribe((data) => {
          this.cityList = data.documents;
        }); 
      }
    getCurrencyList() {
        let payload = this.commonService.filterList()
        payload.query = {
            "status": true,
        } 
        this.commonService.getSTList('currency', payload).subscribe((data) => { 
            this.currencyList = data.documents;
        });
    }
    onSave() {
        this.submitted = true;
        if (this.smartAgentForm.invalid) {
            this.notification.create(
                'error',
                'Please fill form',
                ''
            );
        } else {
            let countryData = this.countryList?.filter(x => x?.countryId === this.smartAgentForm.get('country').value)[0]
            let stateData = this.stateList?.filter(x => x?.stateId === this.smartAgentForm.get('state').value)[0];
            // let cityData = this.cityList?.filter(x => x?.cityId === this.smartAgentForm.get('city').value)[0];
            let currencyData = this.currencyList.filter(
                (x) =>
                    x?.currencyId === this.smartAgentForm.get('currency').value
            )[0];
            let createBody = {
                'orgId': '1',
                'tenantId': '1',
                agentId: '',
                userId: "",
                'firstName': this.smartAgentForm.get('firstName').value,
                'lastName': this.smartAgentForm.get('lastName').value,
                'agentName': this.smartAgentForm.get('smartAgent').value,
                'uploadLogo': '',
                'addressInfo': {
                    'address': this.smartAgentForm.get('address').value || '',
                    'countryId': countryData?.countryId,
                    'countryISOCode': this.smartAgentForm.get('country').value || '',
                    'countryName': countryData?.countryName,
                    'stateId': stateData?.stateId,
                    'stateName': stateData?.stateName,
                    'cityId': this.smartAgentForm.get('city').value || '',
                    'cityName': this.cityList?.filter((x)=> x?.cityId == this.smartAgentForm.get('city').value)[0]?.cityName  || '',
                    'postalCode': this.smartAgentForm.get('pinCode').value.toString() || '',
                    'timezone': this.smartAgentForm.get('timeZone').value || '',
                },
                primaryNo: {
                    'primaryCountryCode': this.smartAgentForm.get('primaryCountryCode').value,
                    'primaryAreaCode': this.smartAgentForm.get('primaryAreaCode').value ? this.smartAgentForm.get('primaryAreaCode').value.toString() : "",
                    'primaryNumber': this.smartAgentForm.get('primaryNo').value,
                },

                'url': this.smartAgentForm.get('website').value || '',
                'primaryMailId': this.smartAgentForm.get('primaryEmailId').value || '',
                'secondaryMailId': "",
                'taxType': this.smartAgentForm.get('taxType').value || "",
                'taxCode': this.smartAgentForm.get('taxCode').value || '',
                'taxId': this.smartAgentForm.get('taxId').value.toString() || "",
                'vendorType': this.smartAgentForm.get('vendorType').value || '',
                'portName': this.smartAgentForm.get('portName').value || '',
                'parentId': '',
                currency: {
                    'countryId': countryData?.countryId,
                    'currencyId': currencyData?.currencyId,
                    'currencyCode': currencyData?.currencyShortName,
                    'currencyName': currencyData?.currencyName,
                },
                'commRegNo': this.smartAgentForm.get('commercialNumber').value ? this.smartAgentForm.get('commercialNumber').value.toString() || '' : "",
                'dAndBNo': this.smartAgentForm.get('dAndBNumber').value.toString() || '',
                'sezUnitAddress': "",
                'userType': "",
                'vatNo': "",
                'status': true,
                'agentStatus': 'requested'
            }



            this.commonService.addToST('agentOnBoarding', createBody).subscribe((data: any) => {
                if (data) {
                    this.notification.create(
                        'success',
                        'Registrated Successfully...! ',
                        ''
                    );
                    this.router.navigate(['/login']);
                }
            },
            (error) => {
                if (error && error.message && error.message.includes('Company & Email already is in use')) {
                    this.notification.create('error', 'Company & Email already is in use...!', '');
                } else {
                    this.notification.create('error', 'Something went wrong, please try again later', '');
                }
            }
        );
        }


    }
    backk(){
        this.router.navigate(['/login']);
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
  loginWithFacebook(): void {
    FB.login((response: any) => {
      if (response.authResponse) {
        console.log('Welcome! Fetching your information.... ');
        FB.api('/me', {fields: 'name,email'}, (userInfo: any) => {
          console.log(userInfo);
          // Handle the user info here (e.g., send it to your backend)
        });
      } else {
        console.log('User cancelled login or did not fully authorize.');
      }
    }, {scope: 'email'});
  }
// webClientId: '706739804728-fp9cp0hmkhie4s8q9gd70p9ifaaolqta.apps.googleusercontent.c
signInWithGoogle() {
    google.accounts.id.prompt();
  }

  handleCredentialResponse(response: any) {
    const decodedToken = this.decodeJwtResponse(response.credential);
    console.log(response,decodedToken)
    this.ngZone.run(() => {
      this.user = {
        name: decodedToken.name,
        email: decodedToken.email,
        photoUrl: decodedToken.picture,
        firstName: decodedToken.given_name,
        lastName: decodedToken.family_name
      };
    });
    this.smartAgentForm.controls['primaryEmailId'].setValue(this.user?.email); 
    this.smartAgentForm.controls['lastName'].setValue(this.user?.lastName); 
    this.smartAgentForm.controls['firstName'].setValue(this.user?.firstName); 
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

  async signInWithMicrosoft() {
    if (!this.interactionInProgress) {
      this.interactionInProgress = true;
      await this.initializeMsal();
      this.msalInstance.loginPopup({
        scopes: ['User.Read']
      }).then((response: AuthenticationResult) => {
        this.getUserInfo(response.accessToken);
      }).catch(error => {
        console.error(error);
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
    }).subscribe((user: any) => {
      this.patchForm(user);
    }, error => {
      console.error(error);
      this.notification.create('error', 'Failed to Fetch User Info', '');
    });
  }

  patchForm(user: any) {
    this.smartAgentForm.patchValue({
      firstName: user.givenName,
      lastName: user.surname,
      primaryEmailId: user.mail || user.userPrincipalName
    });
  }
}
