import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { environment } from 'src/environments/environment';
import * as Constant from 'src/app/shared/common-constants';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { CommonService } from 'src/app/services/common/common.service';
import { DomSanitizer } from '@angular/platform-browser';
import { CognitoService } from 'src/app/services/cognito.service';
import { User } from 'src/app/models/userprofile';
import { State } from 'src/app/models/state-master';
import { LocationData, StateData } from 'src/app/models/city-master';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-userpofile',
  templateUrl: './userpofile.component.html',
  styleUrls: ['./userpofile.component.css'],
})
export class UserpofileComponent {
  url: string | ArrayBuffer;
  userprofileData: User = {
    userId: '',
    createdBy: '',
    createdOn: '',
    isChatUser: false,
    isLocked: false,
    isQCMandatory: false,
    name: '',
    orgId: '',
    override_orgId: false,
    password: '',
    phoneNo: '',
    roles: [],
    status: false,
    tenantId: '',
    updatedBy: '',
    updatedOn: '',
    userAWSProfile: '',
    userEmail: '',
    userKey: '',
    userLastname: '',
    userLogin: '',
    userName: '',
    userStatus: false,
    userType: '',
    fcmToken: null,
    userProfile: '',
    createdDate: ''
  };
  profileForm: FormGroup;
  submitted: boolean = false;
  userID: string = '';

  imageURL: any = "assets/img/profile-avt.png"
  imageName: any;
  stateList: State[];
  cityList: LocationData[];
  countryList: StateData[];

  constructor(
    private router: Router,public location: Location,
    private mastersService: MastersService,
    public commonFunctions: CommonFunctions,
    private fb: FormBuilder,
    private commonService: CommonService,
    private notification: NzNotificationService,
    private sanitizer: DomSanitizer,
    private cognito: CognitoService
  ) {
    // const Data = this.commonFunctions.getUserDetails(); 
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.userID = resp?.userId;
      }
    })

    this.getUserList();
    this.getCountryList()
    this.setValues();
  }
  getCountryList() {
    let payload = this.commonService.filterList()
    payload.query = {
      status: true
    }
    this.commonService.getSTList('country', payload).subscribe((data) => {
      this.countryList = data.documents;
    });
  }
  getStateList() {
    this.stateList = [];
    this.cityList = [];

    let payload = this.commonService.filterList()

    payload.query = {
      countryId: this.profileForm.get('country').value,
      "status": true
    }

    this.commonService.getSTList('state', payload).subscribe((data) => {
      this.stateList = data.documents;
      this.getCityList();
    });
  }
  getCityList() {
    this.cityList = [];
    let payload = this.commonService.filterList()
    payload.query = {
      stateId: this.profileForm.get('state').value,
      "status": true
    }
    this.commonService.getSTList('city', payload).subscribe((data) => {
      this.cityList = data.documents;
    });
  }
  getUserList() {
    let payload = this.commonService.filterList()
    payload.query = {
      "userId": this.commonFunctions.getAgentDetails()?.userId
    }

    this.commonService
      .getSTList(Constant.GET_USER, payload)
      .subscribe((data) => {
        if (data?.documents && data?.documents?.length > 0) {
          this.userprofileData = data?.documents[0];
          this.setValues(this.userprofileData);
          if (this.userprofileData.userProfile) {
            this.downloadFile(this.userprofileData.userProfile)
          }

        }
      });
  }
  downloadFile(documentURL) {
    this.commonService.downloadDocuments('downloadfile', documentURL).subscribe(
      (fileData: Blob) => {
        const objectURL = URL.createObjectURL(fileData);
        this.imageURL = this.sanitizer.bypassSecurityTrustUrl(objectURL);
      },
      (error) => {
        console.error(error);
      }
    );
  }

  setValues(data?) {
    // var data = this.userprofileData;
    // this.imageURL = data?.userProfile ? data.userProfile : this.imageURL
    this.imageName = data?.userProfile || ''
    this.profileForm = this.fb.group({
      companyName: [''],
      firstname: [data?.name ? data?.name : '', [Validators.required]],
      lastname: [data?.userLastname ? data?.userLastname : '',],
      email: [
        data?.userEmail ? data?.userEmail : '',
        [Validators.pattern(environment.validate.email)],
      ],
      primaryPhone: [data?.phoneNo ? data?.phoneNo : ''],
      userName: [data?.userName ? data?.userName : ''],
      role: [data?.roles ? data?.roles[0].roleName : ''],
      address: [data?.officeLocation ? data?.officeLocation : ''],
      address2: [data?.officeLocation2 ? data?.officeLocation2 : ''],
      country: [data?.countryId ? data?.countryId : ''],
      state: [data?.stateId ? data?.stateId : ''],
      city: [data?.cityId ? data?.cityId : ''],
      pinCode: [data?.pinCode ? data?.pinCode : ''],
      isMobile: [false],
      isEmail: [false],
      isPassword: [false]
    });
    if (data) {
      this.getStateList()
    }

  }
  onSelectFile(event) {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (evt) => {

        this.url = evt.target.result;
      };
    }
  }
  public delete() {
    this.url = null;
  }


  get f() {
    return this.profileForm.controls;
  }

  update() {
    this.submitted = true;
    if (this.profileForm.invalid) {
      return;
    } else {
      let newUser = {
        ...this.userprofileData,
        tenantId: this.userprofileData.tenantId,
        orgId: this.userprofileData.orgId,
        name: this.profileForm.controls.firstname.value,
        userLastname: this.profileForm.controls.lastname.value,
        officeLocation: this.profileForm.controls.address.value,
        officeLocation2: this.profileForm.controls.address2.value,
        userEmail: this.profileForm.controls.email.value,
        password: this.userprofileData.password,
        phoneNo: this.profileForm.controls.primaryPhone.value,
        userStatus: this.userprofileData.userStatus,
        userId: this.userprofileData.userId,
        createdDate: this.userprofileData.createdDate,
        updatedDate: new Date(),
        userProfile: this.imageName,
        isEmail: this.profileForm.controls.isEmail.value,
        isMobile: this.profileForm.controls.isMobile.value,
        isPassword: this.profileForm.controls.isPassword.value,
        countryId: this.profileForm.controls.country.value,
        countryName: this.countryList?.find((x) => x.countryId == this.profileForm.controls.country.value)?.countryName || '',
        stateId: this.profileForm.controls.state.value,
        cityId: this.profileForm.controls.city.value,
        pinCode: this.profileForm.controls.pinCode.value.toString() || '',
      };

      let data = [newUser];
      var url = Constant.UPDATE_USER;

      this.commonService.UpdateToST(`user/${newUser.userId}`, newUser).subscribe(
        (res) => {
          this.notification.create('success', 'Updated Successfully', '');
          this.router.navigate(["/profile/profile"]);
          this.getUserList();
          this.onSave()
          this.submitted = false;
        },
        (error) => {
          this.router.navigate(["/profile/profile"]);
          this.onSave();
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
    }
  }

  onSave() {
    this.submitted = false;
    return null;
  }
  reset() {
    this.setValues();
  }
  back(){
    this.location.back();
  }
  async uploadImage(event) {
    if (event?.target?.files?.[0]?.type === "image/jpeg" || event?.target?.files?.[0]?.type === "image/jpg" || event?.target?.files?.[0]?.type === "image/png" || event?.target?.files?.[0]?.type === "image/bmp") {

      const formData = new FormData();
      const fileName = event.target?.files[0].name?.replace(/\s+/g, '');
      formData.append('file', event.target.files[0], fileName);
      formData.append('name', fileName);
      var data = await this.commonService.uploadDocuments('uploadfile', formData).subscribe();
      // var data = await this.commonService.uploadFile(event.target.files[0], fileName, "SaImages");
      this.imageName = fileName;
      if (data) {
        // this.imageURL = fileName
        const objectURL = URL.createObjectURL(event.target.files[0]);
        this.imageURL = this.sanitizer.bypassSecurityTrustUrl(objectURL);
      }
      if (this.commonFunctions.getUserType()) {
        setTimeout(() => {
          this.update()
        }, 1000);
      }

    }
    else {
      alert("Only images are allowed")
    }
  }

  getRefreshPartyMasterList() {
    setTimeout(() => {
      window.location.reload()
    }, 1000);

  }
}
