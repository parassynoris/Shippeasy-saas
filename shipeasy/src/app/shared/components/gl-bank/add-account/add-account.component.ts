import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseBody } from '../base-body';
import { BankDetail } from '../bank-detail';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ApiSharedService } from '../../api-service/api-shared.service';
import { CommonService } from 'src/app/services/common/common.service';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { OrderByPipe } from 'src/app/shared/util/sort';

@Component({
  selector: 'app-add-account',
  templateUrl: './add-account.component.html',
  styleUrls: ['./add-account.component.scss'],
})
export class AddAccountComponent implements OnInit , OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  isAddMode: any;
  id: any;
  @Input() isFiledVisiable: any;
  addAccountForm: FormGroup;
  submitted: boolean;
  baseBody: BaseBody = new BaseBody();
  bankDetail: BankDetail = new BankDetail();
  countryList: any = [];
  stateList: any = [];
  cityList: any = [];
  currencyList: any = [];
  isParentPath:any;
  bankList: any = [];
  callingCodeList: any;
  currentUrl: any;
  partyid: any = '';
  isView:any ='';
  siUpload: any = '';
  bankDetail1: any=[];
  documents: any= [];
  documentPayload:any=[];
  branchList: any;
  constructor(
    public location: Location,
    public route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private sharedService: ApiSharedService,
    public commonService: CommonService,
    public notification: NzNotificationService,
    public router: Router,
    public commonFunction : CommonFunctions,
    private sortPipe: OrderByPipe,

  ) {
    // do nothing.
  }
  sort(array, key) {
    return this.sortPipe.transform(array, key);
  }
  backbtn() {
    this.location.back();
  }

  ngOnInit(): void {
    this.getCountryList();
    this.getCurrencyList();
    this.buildForm();
   
    this.isParentPath = location.pathname.split('/')[1];
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();
    this.route.queryParams.subscribe((res) => {
      if (res?.['isShow']) {
    this.isView=res?.isShow
      }
    });
    if(this.isParentPath === 'master'){
      this.id = this.route.snapshot.params['id'];
    }
    else{
      this.id = this.route.snapshot.params['bid'];
      this.partyid = this.route.snapshot.params['id'];
    }
    this.getBranchList()
    this.isAddMode = this.currentUrl;
    if (this.currentUrl === 'editbank' || this.currentUrl === 'edit') {
      this.getBankById(this.id);
    }
  }
  get f() {
    return this.addAccountForm.controls;
  }

  getBranchList() {
    
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      parentId: this.partyid,
      } 
    this.commonService.getSTList('branch',payload)
      ?.subscribe((data) => {
        this.branchList = data.documents; 
      });
  }
  buildForm() {
    this.addAccountForm = this.formBuilder.group({
      isBank: [true],
      country: ['', Validators.required],
      state: [''],
      city: [''],
      currency: ['', Validators.required],
      bankName: ['', Validators.required],
      ifscCode: ['', Validators.required],
      accountNo: ['', Validators?.required],
      Opbalance: ['0.00', Validators.required],
      beneficiary: ['', Validators.required],
      branch: ['', Validators.required],
      address: [''],
      isDefaultBank: [false],
      swiftCode: [''],
      routingNo: [''],
      ibanNo: [''],
      firstCorrespondentBankName: [''],
      firstCorrespondentSwiftCode: [''],
      firstCorrespondentRoutingNo: [''],
      secondCorrespondentBankName: [''],
      secondCorrespondentSwiftCode: [''],
      secondCorrespondentRoutingNo: [''],
      remark: [''],
      bankUpload :['']
    });
  }

  getCountryList() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = { status : true}
    if(payload?.sort)payload.sort = {
      "desc" : ["updatedOn"]
    },
    this.commonService.getSTList('country', payload)?.subscribe((data) => {
      this.countryList = data.documents;
    });
  }

  getStateList() {
    this.stateList = [];
    this.cityList = [];
    this.getBankList(); 
    let payload = this.commonService.filterList()
    payload.query = {
      countryId: this.addAccountForm.get('country').value,
      "status": true 
    }
    this.commonService.getSTList('state',payload)?.subscribe((data) => {
      this.stateList = data.documents;
    });
  }

  getCityList() {
    this.cityList = []; 
    let payload = this.commonService.filterList()
    payload.query = {
      stateId: this.addAccountForm.get('state').value,
      "status": true 
    }
    this.commonService.getSTList('city',payload)?.subscribe((data) => {
      this.cityList = data.documents;
    });
  }

  getCurrencyList() {
    this.currencyList = [];
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true 
    }
    this.commonService.getSTList('currency',payload)?.subscribe((data) => {
      this.currencyList = data.documents;
    });
  }

  getBankList() {
    this.bankList = []; 
    let countryData = this.countryList.filter(
      (x) =>
        x?.countryISOCode === this.addAccountForm.get('country').value
    );
    
    let payload = this.commonService.filterList()
    payload.query = {
      'country.countryId': countryData[0]?.countryId,
      "status": true , category : 'master',
    }
    this.commonService.getSTList('bank',payload)?.subscribe((data) => {
      this.bankList = data.documents;
    });
  }

  getBankById(bankId: any) { 
    let payload = this.commonService.filterList()
    payload.query = {
      bankId: bankId,
    }
    this.commonService.getSTList('bank',payload)
      ?.subscribe((data: any) => {
        this.bankDetail1 = data.documents[0];
        this.documentPayload = this.bankDetail1?.documents ? this.bankDetail1?.documents : [];
        this.getPatch(this.bankDetail1);
        this.getStateList();
        this.getCityList();
      });
  }

  deleteFile(doc){
    let index = this.documentPayload.findIndex(
      item => item.documentName === doc.documentName
    )
    this.documentPayload.splice(index, 1)
  }

  getPatch(details) {
    
    this.siUpload = details?.bankUpload
    this.addAccountForm.patchValue({
      isBank: [true],
      country: details?.country?.countryId || '',
      state: details?.state?.stateId || '',
      city: details?.cityId || '',
      currency: details?.currency || '',
      bankName: details?.bankName || '',
      ifscCode: details?.ifscCode || '',
      accountNo: details?.accountNo || '',
      Opbalance: details?.Opbalance || '',
      isDefaultBank : details?.isDefaultBank || false,
      beneficiary: details?.beneficiaryName || '',
      branch: details?.branchId || '',
      address: details?.address || '',
      swiftCode: details?.swiftCode || '',
      routingNo: details?.routingNo || '',
      ibanNo: details?.ibanNo || '',
      firstCorrespondentBankName: details?.firstCorrespondent?.bankName || '',
      firstCorrespondentSwiftCode: details?.firstCorrespondent?.ibanNo || '',
      firstCorrespondentRoutingNo: details?.firstCorrespondent?.routingNo || '',
      secondCorrespondentBankName: details?.secondCorrespondent?.bankName || '',
      secondCorrespondentSwiftCode: details?.secondCorrespondent?.ibanNo || '',
      secondCorrespondentRoutingNo: details?.secondCorrespondent?.routingNo || '',
      remark: details?.remark || '',
    });
    if(this.isView)this.addAccountForm.disable();
  }

  onSave() {
    let currentPath = this.isFiledVisiable.split('/')[0];
    this.submitted = true;
    if (!this.addAccountForm.valid) return;
   
    this.documents?.filter((x) => {
      let data = {
        documentId: '',
        document:`${x.name}`,
        documentName:`${x.name}`,
      };
      this.documentPayload.push(data);
    });
    this.createModel();
    let createBody = [];
    createBody.push({...this.bankDetail,
      documents: this.documentPayload,
      orgId: this.commonFunction.getAgentDetails().orgId
  });
    if (this.currentUrl === 'editbank' || this.currentUrl === 'edit') {
      const dataWithUpdateId = {...this.bankDetail,
        documents: this.documentPayload,
        bankId: this.id,
        orgId: this.commonFunction.getAgentDetails().orgId
    }
      const data = [dataWithUpdateId];
      this.commonService.UpdateToST(`bank/${data[0].bankId}`,data[0])?.subscribe((data: any) => {
        if (data) {
          this.notification.create('success', 'Updated Successfully', '');
          if (currentPath === 'master') {
            this.router.navigate(['/' + currentPath + '/bank']);
          } else {
            this.backbtn();
          }
        }
      });
    } else {
      this.commonService.addToST('bank',createBody[0])?.subscribe((data: any) => {
        if (data) {
          this.notification.create('success', 'Added Successfully', '');
          if (currentPath === 'master') {
            this.router.navigate(['/' + currentPath + '/bank']);
          } else {
            this.backbtn();
          }
        }
      });
    }
    this.submitted = false;
  }

  createModel() {
    let countryData = this.countryList.filter(
      (x) =>
        x?.countryId === this.addAccountForm.get('country').value
    );
    let stateData = this.stateList.filter(
      (x) => x?.stateId === this.addAccountForm.get('state').value
    );
    let cityData = this.cityList.filter(
      (x) => x?.cityId === this.addAccountForm.get('city').value
    );

    this.bankDetail.bankId = this.id;
    this.bankDetail.isBank = true;
    this.bankDetail.tenenatId = '';
    this.bankDetail.orgId =  this.partyid || '';
    this.bankDetail.parentId = this.partyid;
    this.bankDetail.accountType = 'agent';
    this.bankDetail.agent.agentId =  this.partyid;
    this.bankDetail.agent.agentName = '';
    this.bankDetail.country.countryId = countryData[0]?.countryId;
    this.bankDetail.country.countryName = countryData[0]?.countryName;
    this.bankDetail.country.countryISOCode =
      countryData[0]?.countryISOCode;
    this.bankDetail.state.stateId = stateData[0]?.stateId;
    this.bankDetail.state.stateName = stateData[0]?.stateName;
    this.bankDetail.cityId = cityData[0]?.cityId;
    this.bankDetail.cityName = cityData[0]?.cityName;
    this.bankDetail.currency = this.addAccountForm.get('currency').value;
    this.bankDetail.bankName = this.addAccountForm.get('bankName').value;
    this.bankDetail.ifscCode = this.addAccountForm.get('ifscCode').value;
    this.bankDetail.accountNo = this.addAccountForm.get('accountNo').value?.toString();
    this.bankDetail.Opbalance = this.addAccountForm.get('Opbalance').value?.toString();

    this.bankDetail.isDefaultBank = this.addAccountForm.get('isDefaultBank').value;
    this.bankDetail.beneficiaryName =
      this.addAccountForm.get('beneficiary').value;

      this.bankDetail.branchId = this.addAccountForm.get('branch').value
    this.bankDetail.branchName = this.branchList.filter((x)=> x.branchId == this.addAccountForm.get('branch').value)[0].branchName ;
    this.bankDetail.address = this.addAccountForm.get('address').value;
    this.bankDetail.swiftCode = this.addAccountForm.get('swiftCode').value;
    this.bankDetail.routingNo = this.addAccountForm.get('routingNo').value?.toString();
    this.bankDetail.ibanNo = this.addAccountForm.get('ibanNo').value;
    this.bankDetail.firstCorrespondent.bankName = this.addAccountForm.get(
      'firstCorrespondentBankName'
    ).value;
    this.bankDetail.firstCorrespondent.routingNo = this.addAccountForm.get(
      'firstCorrespondentRoutingNo'
    ).value;
    this.bankDetail.firstCorrespondent.ibanNo = this.addAccountForm.get(
      'firstCorrespondentSwiftCode'
    ).value;
    this.bankDetail.secondCorrespondent.bankName = this.addAccountForm.get(
      'secondCorrespondentBankName'
    ).value;
    this.bankDetail.secondCorrespondent.routingNo = this.addAccountForm.get(
      'secondCorrespondentRoutingNo'
    ).value;
    this.bankDetail.secondCorrespondent.ibanNo = this.addAccountForm.get(
      'secondCorrespondentSwiftCode'
    ).value;
    this.bankDetail.remark = this.addAccountForm.get('remark').value;
    this.bankDetail.status = true;


   

  }
  filechange(event: any) {
    let files = [];
    this.documents = [];
    files = event.target.files;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      this.commonService.uploadDocuments('bill', formData)?.subscribe();
      formData.append('file', files[i], `${files[i].name}`);
      formData.append('name', `${files[i].name}`);
      this.commonService.uploadDocuments('uploadfile', formData)?.subscribe();
      this.documents.push(event.target.files[i]);
    }
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
