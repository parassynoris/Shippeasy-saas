import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { BaseBody } from '../../base-body';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import * as Constant from 'src/app/shared/common-constants';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { environment } from 'src/environments/environment';
import { SharedService } from 'src/app/shared/services/shared.service';
import { ApiService } from 'src/app/admin/principal/api.service';
import { CommonService } from 'src/app/services/common/common.service';
import { DomSanitizer } from '@angular/platform-browser';
import { CognitoService } from 'src/app/services/cognito.service';
import { Country, PortDetails, State } from 'src/app/models/yard-cfs-master';
import { City } from 'src/app/models/smartadd';
import { Currency, SystemType } from 'src/app/models/cost-items';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { SmartAgentDetail } from '../smartagent-detail';
@Component({
  selector: 'app-smartadd',
  templateUrl: './smartadd.component.html',
  styleUrls: ['./smartadd.component.scss'],
})
export class SmartaddComponent implements OnInit {
  companyLogoName: string | null = null;
  companyLogoURL: any = null;
  companyStampName: string | null = null;
  companySignName: string | null = null;
  companyStampURL: any = null;
  emailSignatureURL: any = null;
  locationLink: string = '';
  isAddMode: any;
  id: any;
  smartAgentForm: FormGroup;
  submitted: boolean;
  baseBody: BaseBody = new BaseBody();
  smartAgentDetail: SmartAgentDetail = new SmartAgentDetail();
  countryList: Country[] = [];
  stateList: State[] = [];
  cityList: City[] = [];
  taxTypeList: SystemType[] = [];
  portList: PortDetails[] = [];
  callingCodeList: Country[] = [];
  currencyList: Currency[] = [];
  countryCopyData: Country[] = [];
  editMode: boolean = false;
  imageURL: any = "https://www.ross-shirejournal.co.uk/_media/img/750x0/VDU5SEN9OTI4YA0Q7QGN.jpg";
  imageName: any;
  orgId: any;
  userDetails: any;
  userprofileData: any;
  element: any;

  signitureOfCompany: any = '';


  constructor(
    public location: Location,
    public route: ActivatedRoute,
    public router: Router,
    private formBuilder: FormBuilder,
    private profilesService: ProfilesService,
    private notification: NzNotificationService,
    public commonFunctions: CommonFunctions, private _api: ApiService,
    private _sharedService: SharedService,
    public commonService: CommonService,
    private sanitizer: DomSanitizer,
    private cognito: CognitoService,
    private sortPipe: OrderByPipe,

  ) {
    this.id = this.route.snapshot.params['id'];

    if (!this.id || this.id == 1) {
      this.isAddMode = true;
    } else {
      this.isAddMode = false;
    }
    this.getUserList()
  }

  backbtn() {
    this.location.back();
  }
  sort(array, key) {
    return this.sortPipe.transform(array, key);
  }
  getCurrencyDropDowns() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      "status": true,
    }

    this.commonService.getSTList('currency', payload)?.subscribe((res: any) => {
      this.currencyList = res?.documents;
    });
  }
  getUserList() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      "userId": this.commonFunctions.getAgentDetails().userId
    }

    this.commonService
      .getSTList(Constant.GET_USER, payload)
      ?.subscribe((data) => {
        this.userprofileData = data?.documents[0];
      });
  }
  ngOnInit(): void {
    this.cognito.getagentDetails()?.subscribe((resp) => {
      this.userDetails = resp;
    })
    this.buildForm();
    if (!this.isAddMode) {
      this.editMode = true;
      this.getSmartAgentDetailById(this.id);
    }
    else {
      this.getCountryList();
    }
    this.getCurrencyDropDowns();
    this.getTaxTypeList();
  }

  get f() {
    return this.smartAgentForm.controls;
  }

  buildForm() {
    this.smartAgentForm = this.formBuilder.group(
      {
        uploadLogo: [''],
        uploadStamp: [''],
        smartAgent: ['', Validators.required],
        companyShortCode: ['', Validators.required],
        country: ['', Validators.required],
        state: ['', Validators.required],
        city: ['', Validators.required],
        pinCode: ['', [Validators.required]],
        address: ['', Validators.required],
        primaryCountryCode: ['', Validators.required],
        primaryAreaCode: [''],
        primaryNo: ['', Validators.required],
        secondaryCountryCode: [''],
        secondaryAreaCode: [''],
        secondaryNo: [''],
        faxCountryCode: [''],
        faxAreaCode: [''],
        faxNo: [''],
        phoneCountryCode: [''],
        phoneAreaCode: [''],
        phoneNo: [''],
        website: ['', [Validators.required, Validators.pattern(environment.validate.website)]],
        primaryEmailId: ['', [Validators.required, Validators.pattern(environment.validate.email)]],
        secondaryemailId: ['', [Validators.pattern(environment.validate.email)]],
        taxType: ['', Validators.required],
        taxCode: [''],
        taxId: ['', Validators.required],
        panNo: [''],
        portName: [''],
        vendorType: [''],
        currency: ['', Validators.required],
        commercialNumber: [''],
        poldetentioncurrency: [''],
        picType: [''],
        picName: [''],
        picName1: [''],
        picMobileCountryCode: [''],
        picMobileAreaCode: [''],
        picMobile: [''],
        picEmailId: [''],
        dAndBNumber: [''],
        mtoReg: [''],
        fmcNo: [''],
        scacNo: [''],
        timeZone: [''],
        mailServer: [''],
        emailId: ['', [Validators.required, Validators.email]],
        mailServerPassword: [''],
        decimalNumber: ['']
      },
    );
  }

  getCountryList() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      "status": true,
    }

    this.commonService.getSTList('country', payload)?.subscribe((data) => {
      this.countryList = data.documents;
      this.countryCopyData = [...this.countryList];


      if (!this.isAddMode) {
        this.getStateList();
        this.getCurrencyList();
      }
    });
  }



  getStateList() {
    this.stateList = [];
    this.cityList = [];


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
    this.smartAgentForm.controls['secondaryCountryCode'].setValue(this.callingCodeList[0]?.countryPhoneCode);
    this.smartAgentForm.controls['faxCountryCode'].setValue(this.callingCodeList[0]?.countryPhoneCode);
    this.commonService.getSTList('state', payload).subscribe((data) => {
      this.stateList = data.documents;
      if (!this.isAddMode) {
        this.getCityList();
      }
    });

  }

  getCityList() {
    this.cityList = [];
    let payload = this.commonService.filterList()
    payload.query = {
      "status": true,
      stateId: this.smartAgentForm.get('state').value
    }

    this.commonService.getSTList('city', payload).subscribe((data) => {
      this.cityList = data.documents;
    });
    this.getPort();
  }

  getTooltipMessage(field: string) {
    if (field === 'emailId') {
      return 'Sender Email Id';
    }
    return '';
  }


  getTaxTypeList() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      "status": true,
      typeCategory: 'taxType',
    }

    this.commonService.getSTList('systemtype', payload)?.subscribe((data) => {
      this.taxTypeList = data.documents;
    });
  }

  getPort() {
    let payload = this.commonService.filterList()
    payload.query = {
      "status": true
    }

    payload.size = 15000
    payload.project = ["portDetails.portName", "portId"];
    this.commonService.getSTList('port', payload).subscribe((res: any) => {
      this.portList = res.documents;
    })
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

  getSmartAgentDetailById(agentId: any) {
    let payload = this.commonService.filterList()
    payload.query = {
      agentId: agentId,
    }

    this.commonService.getSTList('agent', payload).subscribe((data: any) => {
      this.smartAgentDetail = data.documents[0];
      this.getPatch(this.smartAgentDetail);

    })

  }
  downloadFile(documentURL: string, type: 'logo' | 'stamp' | 'email') {
    this.commonService.downloadDocuments('downloadfile', documentURL).subscribe(
      (fileData: Blob) => {
        const objectURL = URL.createObjectURL(fileData);
        const sanitizedURL = this.sanitizer.bypassSecurityTrustUrl(objectURL);

        if (type === 'logo') {
          this.imageURL = sanitizedURL; // For logo
        } else if (type === 'stamp') {
          this.companyStampURL = sanitizedURL; // For stamp
        }
        else if (type === 'email') {
          this.emailSignatureURL = sanitizedURL; // For stamp
        }
      },
      (error) => {
        console.error(error);
      }
    );
  }

  getPatch(details) {
    if (details?.uploadLogo) {
      this.downloadFile(details.uploadLogo, 'logo');
      this.imageName = details.uploadLogo || '';
    }

    if (details?.uploadStamp) {
      this.downloadFile(details.uploadStamp, 'stamp');
      this.companyStampName = details.uploadStamp || '';
    }

    if (details?.uploadSign) {
      this.downloadFile(details.uploadSign, 'email');
      this.companySignName = details.uploadSign || '';
    }

    this.imageName = details?.uploadLogo || ''
    this.smartAgentForm.patchValue({
      smartAgent: details?.agentName || "",
      companyShortCode: details?.companyShortCode || "",
      country: details?.addressInfo?.countryISOCode || "",
      state: details?.addressInfo?.stateId || "",
      city: details?.addressInfo?.cityId || "",
      pinCode: details?.addressInfo?.postalCode || "",
      address: details?.addressInfo?.address || "",
      primaryCountryCode: details?.primaryNo?.primaryCountryCode || "",

      mailServer: details?.emailConfig?.mailServer || "",
      emailId: details?.emailConfig?.emailId || "",
      mailServerPassword: details?.emailConfig?.mailServerPassword || "",
      decimalNumber: details?.decimalNumber || "",

      primaryAreaCode: details?.primaryNo?.primaryAreaCode || "",
      primaryNo: details?.primaryNo?.primaryNumber || "",
      secondaryCountryCode: details?.secondaryNo?.secondaryCountryCode || "",
      secondaryAreaCode: details?.secondaryNo?.secondaryAreaCode || "",
      secondaryNo: details?.secondaryNo?.secondaryNo || "",
      faxCountryCode: details?.faxNo?.faxCountryCode || "",
      faxAreaCode: details?.faxNo?.faxAreaCode || "",
      faxNo: details?.faxNo?.faxNo || "",
      phoneCountryCode: details?.allTimeAvailableNo?.countryCode || "",
      phoneAreaCode: details?.allTimeAvailableNo?.areaCode || "",
      phoneNo: details?.allTimeAvailableNo?.allTimeAvailableNumber || "",
      website: details?.url || "",
      primaryEmailId: details?.primaryMailId || "",
      secondaryemailId: details?.secondaryemailId || "",
      taxType: details?.taxType || '',
      taxCode: details?.taxCode || '',
      taxId: details?.taxId || '',
      panNo: details?.panNo || '',
      vendorType: details?.vendorType || '',
      portName: details?.portName || '',
      currency: details?.currency?.currencyId || '',
      commercialNumber: details?.commRegNo || "",
      poldetentioncurrency: details?.currency || "",
      picType: details?.pic?.picType || "",
      picName: details?.pic?.picName || "",
      picName1: details?.pic?.picName1 || "",
      picMobileCountryCode: details?.pic?.picMobileCountryCode || "",
      picMobile: details?.pic?.picMobileNo || "",
      picMobileAreaCode: details?.pic?.picMobileAreaCode || "",
      picEmailId: details?.pic?.picMailId || "",
      dAndBNumber: details?.dAndBNo || "",
      mtoReg: details?.mtoReg || "",
      fmcNo: details?.fmcNo || "",
      scacNo: details?.scacNo || "",
      timeZone: details?.addressInfo?.timezone || ""
    })
    this.getCountryList();
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.smartAgentForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  onSave() {
    this.submitted = true;
    this.smartAgentForm.controls['portName'].patchValue(this.smartAgentForm.get('portName').value)
    this.findInvalidControls()
    if (!this.smartAgentForm.valid) return;
    this.createModel();
    let countryData = this.countryList?.filter(x => x?.countryId === this.smartAgentForm.get('country').value)[0]
    let stateData = this.stateList?.filter(x => x?.stateId === this.smartAgentForm.get('state').value)[0];
    let cityData = this.cityList?.filter(x => x?.cityId === this.smartAgentForm.get('city').value)[0];
    let currencyData = this.currencyList.filter(
      (x) =>
        x?.currencyId === this.smartAgentForm.get('currency').value
    )[0];
    let createBody = {
      'orgId': '',
      'tenantId': this.commonFunctions.getTenantId() || '1',
      agentId: this.id || '',
      userId: "",
      // this.smartAgentDetail.orgId = this.orgId.toString(),
      // this.smartAgentDetail.tenantId =this.commonFunctions.getTenantId() || '1',
      'agentName': this.smartAgentForm.get('smartAgent').value,
      'companyShortCode': this.smartAgentForm.get('companyShortCode').value,
      'uploadLogo': this.imageName,
      'uploadStamp': this.companyStampName,
      'uploadSign': this.companySignName,
      'decimalNumber': this.smartAgentForm.get('decimalNumber').value,
      'addressInfo': {
        'address': this.smartAgentForm.get('address').value,
        'countryId': countryData?.countryId,
        'countryISOCode': this.smartAgentForm.get('country').value,
        'countryName': countryData?.countryName,
        'stateId': stateData?.stateId,
        'stateName': stateData?.stateName,
        'cityId': cityData?.cityId,
        'cityName': cityData?.cityName,
        'postalCode': this.smartAgentForm.get('pinCode').value.toString(),
        'timezone': this.smartAgentForm.get('timeZone').value,
      },
      primaryNo: {
        'primaryCountryCode': this.smartAgentForm.get('primaryCountryCode').value,
        'primaryAreaCode': "",
        'primaryNumber': this.smartAgentForm.get('primaryNo').value.toString() || '',
      },
      emailConfig: {
        'mailServer': this.smartAgentForm.get('mailServer').value,
        'emailId': this.smartAgentForm.get('emailId').value,
        'mailServerPassword': this.smartAgentForm.get('mailServerPassword').value,
      },
      secondaryNo: {
        'secondaryCountryCode': this.smartAgentForm.get('secondaryCountryCode').value || "",
        'secondaryAreaCode': "",
        'secondaryNo': this.smartAgentForm.get('secondaryNo').value.toString() || "",
      },
      allTimeAvailableNo: {
        'countryCode': this.smartAgentForm.get('phoneCountryCode').value,
        'areaCode': this.smartAgentForm.get('phoneAreaCode').value,
        'allTimeAvailableNumber': this.smartAgentForm.get('phoneNo').value,
      },
      faxNo: {
        'faxCountryCode': this.smartAgentForm.get('faxCountryCode').value || '',
        'faxAreaCode': this.smartAgentForm.get('faxAreaCode').value.toString() || '',
        'faxNo': this.smartAgentForm.get('faxNo').value.toString() || '',
      },

      'url': this.smartAgentForm.get('website').value,
      'primaryMailId': this.smartAgentForm.get('primaryEmailId').value,
      'secondaryemailId': this.smartAgentForm.get('secondaryemailId').value,
      'secondaryMailId': "",
      'taxType': this.smartAgentForm.get('taxType').value || "",
      'panNo': this.smartAgentForm.get('panNo').value || "",
      'taxCode': this.smartAgentForm.get('taxCode').value,
      'taxId': this.smartAgentForm.get('taxId').value.toString() || "",
      'vendorType': this.smartAgentForm.get('vendorType').value,
      'portName': this.smartAgentForm.get('portName').value,
      'parentId': '',
      currency: {
        'countryId': countryData?.countryId,
        'currencyId': currencyData?.currencyId,
        'currencyCode': currencyData?.currencyShortName,
        'currencyName': currencyData?.currencyName,
      },

      'commRegNo': this.smartAgentForm.get('commercialNumber').value ? this.smartAgentForm.get('commercialNumber').value.toString() : "",
      'dAndBNo': this.smartAgentForm.get('dAndBNumber').value.toString(),
      'mtoReg': this.smartAgentForm.get('mtoReg').value.toString() || "",
      'scacNo': this.smartAgentForm.get('scacNo').value.toString() || "",
      'fmcNo': this.smartAgentForm.get('fmcNo').value.toString() || "",
      'sezUnitAddress': "",
      pic: {
        'picType': this.smartAgentForm.get('picType').value,
        'picName': this.smartAgentForm.get('picName').value,
        'picName1': this.smartAgentForm.get('picName1').value,
        'picMobileCountryCode': this.smartAgentForm.get('picMobileCountryCode').value || "",
        'picMailId': this.smartAgentForm.get('picEmailId').value,

        'picMobileNo': this.smartAgentForm.get('picMobile').value ? this.smartAgentForm.get('picMobile').value.toString() : "",
        'picMobileAreaCode': this.smartAgentForm.get('picMobileAreaCode').value ? this.smartAgentForm.get('picMobileAreaCode').value.toString() : "",

      },
      'status': true,
      'userType': "",
      'vatNo': "",
    }


    if (this.commonFunctions.isSuperAdmin()) {
      createBody.orgId = this.id
    } else {
      createBody.orgId = this.userDetails.orgId
      createBody.userId = this.userDetails.userId || ""
    }

    if (this.isAddMode) {
      this.commonService.addToST('agent', createBody).subscribe((data: any) => {
        if (data) {
          this.notification.create(
            'success',
            'Added Successfully',
            ''
          );
          // this.router.navigate(["/register/list/"]);
          // var url = Constant.UPDATE_USER;
          let userData = {
            ...this.userDetails,
            agentId: data.agentId,
            orgId: data.agentId,
          }

          this.commonService.UpdateToST(`user/${userData.userId}`, userData).subscribe((res: any) => {
            localStorage.setItem('agentDetails', this.commonFunctions?.set(JSON.stringify(res)));
          });
          this.router.navigate(['/register', 'list', data.agentId, 'details', 'editsmart']);

          localStorage.setItem(
            Constant.CurrentAgentDetails,
            this.commonFunctions?.set(JSON.stringify(createBody))
          );
        }
      })
    }
    else {
      this.commonService.UpdateToST(`agent/${createBody?.agentId}`, createBody).subscribe((data: any) => {
        if (data) {
          this.notification.create(
            'success',
            'Updated Successfully',
            ''
          );
          this.router.navigate(["/register/" + this.route.snapshot.params.id + "/branch"]);

          localStorage.setItem(
            Constant.CurrentAgentDetails,
            this.commonFunctions?.set(JSON.stringify(createBody))
          );
        }
      })
    }
    this.submitted = false;
  }

  createModel() {


    return
  }

  onCancel() {
    this.router.navigate(['/register/list/']);
  }
  async uploadImage(event: any, type: 'logo' | 'stamp' | 'email') {
    if (
      event?.target?.files?.[0]?.type === 'image/jpeg' ||
      event?.target?.files?.[0]?.type === 'image/jpg' ||
      event?.target?.files?.[0]?.type === 'image/png' ||
      event?.target?.files?.[0]?.type === 'image/bmp'
    ) {
      const formData = new FormData();
      const fileName = event.target.files[0].name.replace(/\s+/g, '');
      formData.append('file', event.target.files[0], fileName);
      formData.append('name', fileName);

      try {
        const data: any = await this.commonService
          .uploadDocuments('uploadfile', formData)
          .toPromise();

        if (data) {
          const objectURL = URL.createObjectURL(event.target.files[0]);
          const sanitizedURL = this.sanitizer.bypassSecurityTrustUrl(objectURL);

          // **FIX: Use the 'name' field from the response which contains the full filename with UUID**
          const uploadedFileName = data.name;

          if (type === 'logo') {
            this.imageName = uploadedFileName; // Save the full name from response
            this.imageURL = sanitizedURL;
          } else if (type === 'stamp') {
            this.companyStampName = uploadedFileName; // Save the full name from response
            this.companyStampURL = sanitizedURL;
          } else if (type === 'email') {
            this.companySignName = uploadedFileName; // Save the full name from response
            this.emailSignatureURL = sanitizedURL;
          }
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Failed to upload image. Please try again.');
      }
    } else {
      alert('Only images are allowed');
    }
  }

  async uploadImage1(event) {


    if (event?.target?.files?.[0]?.type === "image/jpeg" || event?.target?.files?.[0]?.type === "image/jpg" || event?.target?.files?.[0]?.type === "image/png" || event?.target?.files?.[0]?.type === "image/bmp") {

      const formData = new FormData();
      const fileName = event.target?.files[0].name?.replace(/\s+/g, '');
      formData.append('file', event.target.files[0], fileName);
      formData.append('name', fileName);
      var data = await this.commonService.uploadDocuments('uploadfile', formData).subscribe();
      // var data = await this.commonService.uploadFile(event.target.files[0],fileName, "SaImages");
      this.imageName = fileName;
      if (data) {
        // this.imageURL =fileName
        const objectURL = URL.createObjectURL(event.target.files[0]);
        this.imageURL = this.sanitizer.bypassSecurityTrustUrl(objectURL);
      }
    }
    else {
      alert("Only images are allowed")
    }
  }

  openUploadImage(id) { document.getElementById(id).click() }
}
