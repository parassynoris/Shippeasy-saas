import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseBody } from '../../base-body';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { BankDetail } from '../bank-detail';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { Observable, ReplaySubject } from 'rxjs';
import { ApiSharedService } from 'src/app/shared/components/api-service/api-shared.service';
import { Country, State } from 'src/app/models/yard-cfs-master';
import { City } from 'src/app/models/smartadd';
import { Currency } from 'src/app/models/cost-items';
@Component({
  selector: 'app-addaccout',
  templateUrl: './addaccout.component.html',
  styleUrls: ['./addaccout.component.css'],
})
export class AddaccoutComponent implements OnInit {
  isAddMode: any;
  id: any;
  addAccountForm: FormGroup;
  bankDetailsData:any;
  submitted: boolean;
  baseBody: BaseBody = new BaseBody();
  bankDetail: BankDetail = new BankDetail();
  countryList: Country[] = [];
  stateList: State[] = [];
  cityList: City[] = [];
  currencyList: Currency[] = [];
  bankList: any = [];
  @Input() isFiledVisiable: any;
  currentUrl: string;
  fileTypeNotMatched: boolean;
  document: any = [];
  branchList: any = [];
  parentId: string ;
  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private profilesService: ProfilesService,
    private sharedService: ApiSharedService,
    private notification: NzNotificationService,
    public commonfunction: CommonFunctions,
    private router: Router
  ) {
    this.parentId = this.route.snapshot.params['id'];
  }

  backbtn() {
    this.location.back();
  }

  ngOnInit(): void {
    this.getCountryList();
    this.getCurrencyList();
    this.buildForm();
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();
    this.id = this.route.snapshot.params['id'];
    this.isAddMode = this.currentUrl;
    if (this.isAddMode === 'edit') {
      this.getBankById(this.id);
    }
    this.getBranchList();
    this.getBankList();
  }
  get f() {
    return this.addAccountForm.controls;
  }

  buildForm() {
    this.addAccountForm = this.formBuilder.group({
      isBank: [true],
      country: ['', Validators.required],
      state: [''],
      city: [''],
      currency: ['', Validators.required],
      localCurrency: ['', Validators.required],
      bankName: [''],
      bankNameId: ['', Validators.required],
      accountNo: ['', Validators.required],
      beneficiary: ['', Validators.required],
      branch: ['', Validators.required],
      address: [''],
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
    });
  }

  getCountryList() {
    this.profilesService.countryList().subscribe((data) => {
      this.countryList = data.hits.hits;
    });
  }

  getStateList() {
    this.stateList = [];
    this.cityList = [];
    this.baseBody = new BaseBody();
    let must = [
      {
        match: {
          typeName: this.addAccountForm.get('country').value,
        },
      },{"match": {"status": true}}
    ];
    this.baseBody.baseBody.query.bool.must = must;
    this.profilesService.stateList(this.baseBody.baseBody).subscribe((data) => {
      this.stateList = data.hits.hits;
    });
  }

  getCityList() {
    this.cityList = [];
    this.baseBody = new BaseBody();
    let must = [
      {
        match: {
          stateId: this.addAccountForm.get('state').value,
        },
      },{"match": {"status": true}}
    ];
    this.baseBody.baseBody.query.bool.must = must;
    this.profilesService.cityList(this.baseBody.baseBody).subscribe((data) => {
      this.cityList = data.hits.hits;
    });
  }

  getCurrencyList() {
    this.currencyList = [];
    this.profilesService.currencyList().subscribe((data) => {
      this.currencyList = data.hits.hits;
    });
  }

  getBankList() {
    this.bankList = [];
    this.baseBody = new BaseBody();
    let countryData = this.countryList.filter(
      (x) =>
        x._source.countryISOCode === this.addAccountForm.get('country').value
    );
    let must = [
      {
        match: {
          'country.countryId': countryData[0]._source.countryId,
        },
      },
    ];
    this.baseBody.baseBody.query.bool.must = must;
    this.profilesService.bankList(this.baseBody.baseBody).subscribe((data) => {
      this.bankList = data.hits.hits;
    });
  }

  getBranchList() {
    this.baseBody = new BaseBody();
    let must = [
    ];
    this.baseBody.baseBody.query.bool.must = must;
    this.sharedService
      .getBranchList(this.baseBody.baseBody)
      .subscribe((data) => {
        this.branchList = data.hits.hits;
      });
  }

  getBankById(bankId: any) {
    this.baseBody = new BaseBody();
    let must = [
      {
        match: {
          bankId: bankId,
        },
      },
    ];
    this.baseBody.baseBody.query.bool.must = must;
    this.profilesService
      .getBankById(this.baseBody.baseBody)
      .subscribe((data: any) => {
        this.bankDetail = data.hits.hits[0]._source;
        this.bankDetailsData = data.hits.hits[0]._source;

        this.getPatch(this.bankDetail);
        this.getStateList();
        this.getCityList();
      });
  }

  getPatch(details) {
    this.addAccountForm.setValue({
      isBank: [true],
      country: details.country.countryISOCode || '',
      state: details.state.stateId || '',
      city: details.cityId || '',
      currency: details.currency || '',
      localCurrency:details.localCurrency ? details.localCurrency : details.currency,
      bankName: details.bankName || '',
      bankNameId: details.bankId || '',
      accountNo: details.accountNo || '',
      beneficiary: details.beneficiaryName || '',
      branch: details.branchName || '',
      address: details.address || '',
      swiftCode: details.swiftCode || '',
      routingNo: details.routingNo || '',
      ibanNo: details.ibanNo || '',
      firstCorrespondentBankName: details.firstCorrespondent.bankName || '',
      firstCorrespondentSwiftCode: details.firstCorrespondent.ibanNo || '',
      firstCorrespondentRoutingNo: details.firstCorrespondent.routingNo || '',
      secondCorrespondentBankName: details.secondCorrespondent.bankName || '',
      secondCorrespondentSwiftCode: details.secondCorrespondent.ibanNo || '',
      secondCorrespondentRoutingNo: details.secondCorrespondent.routingNo || '',
      remark: [''],
    });
    if(details.documents){
      this.document = details.documents;
    }
  }

  convertFile(file: File): Observable<string> {
    const result = new ReplaySubject<string>(1);
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (event) =>
      result.next(btoa(event.target.result.toString()));
    return result;
  }

  OnfileChange(event: any) {
    let filename = event.target.value.replace('C:\\fakepath\\', '');

    var extension = filename.substr(filename.lastIndexOf('.'));

    if (
      extension.toLowerCase() === '.xls' ||
      extension.toLowerCase() === '.xlsx' ||
      extension.toLowerCase() === '.pdf' ||
      extension.toLowerCase() === '.doc' ||
      extension.toLowerCase() === '.docx'
    ) {
      this.fileTypeNotMatched = false;
      this.convertFile(event.target.files[0]).subscribe(
        (base64) => {
          let doc = {
            documentId: '',
            documentName: filename,
            documentUrl: base64
          }
          this.document.push(doc);
        },
        (error) => {
          this.notification.create(
            'error',
           error?.error?.error?.message,
            ''
          )
        }
      );
    } else {
      this.fileTypeNotMatched = true;
      this.submitted = true;
    }
  }

  removefile(doc) {
    this.document = this.document.filter(doc1=>doc1!=doc);
  }

  onSave() {
    this.submitted = true;
    if (!this.addAccountForm.valid) return;
    this.createModel();
    let createBody = [];
    createBody.push(this.bankDetail);

    if (this.isAddMode === 'add') {
      this.profilesService.createBank(createBody).subscribe((data: any) => {
        if (data) {
          this.notification.create('success', 'Added Successfully', '');
          this.router.navigate([
            '/register/' + this.route.snapshot.params.value + '/bank',
          ]);
        }
      });
    } else {
      this.profilesService.updateBank(createBody).subscribe((data: any) => {
        if (data) {
          this.notification.create('success', 'Updated Successfully', '');
          this.router.navigate(['/register/bank']);
        }
      });
    }
    this.getBankList()
    this.submitted = false;
  }

  createModel() {

    let countryData = this.countryList.filter(
      (x) =>
        x._source.countryISOCode === this.addAccountForm.get('country').value
    );
    let stateData = this.stateList.filter(
      (x) => x._source.stateId === this.addAccountForm.get('state').value
    );
    let cityData = this.cityList.filter(
      (x) => x._source.cityId === this.addAccountForm.get('city').value
    );
    let bankName = this.bankList.find(bank=>bank._source.bankId==this.addAccountForm.get('bankNameId').value)?._source?.bankName

    this.bankDetail.isBank = true;
    this.bankDetail.tenenatId = '';
    this.bankDetail.orgId = '';
    this.bankDetail.parentId =  this.parentId;
    this.bankDetail.accountType = 'agent';
    this.bankDetail.agent.agentId =  this.parentId;;
    this.bankDetail.agent.agentName = '';
    this.bankDetail.country.countryId = countryData[0]?._source?.countryId;
    this.bankDetail.country.countryName = countryData[0]?._source?.countryName;
    this.bankDetail.country.countryISOCode = countryData[0]?._source?.countryISOCode;
    this.bankDetail.state.stateId = stateData[0]?._source?.stateId;
    this.bankDetail.state.stateName = stateData[0]?._source?.stateName;
    this.bankDetail.cityId = cityData[0]?._source?.cityId;
    this.bankDetail.cityName = cityData[0]?._source?.cityName;
    this.bankDetail.currency = this.addAccountForm.get('currency').value;
    this.bankDetail.localCurrency = this.addAccountForm.get('localCurrency').value;
    this.bankDetail.bankNameId = this.bankDetailsData.bankId;
    this.bankDetail.bankName = bankName;
    this.bankDetail.bankNameId = this.addAccountForm.get('bankNameId').value;
    this.bankDetail.accountNo = this.addAccountForm.get('accountNo').value;
    this.bankDetail.beneficiaryName =
      this.addAccountForm.get('beneficiary').value;
    this.bankDetail.branchName = this.addAccountForm.get('branch').value;
    this.bankDetail.address = this.addAccountForm.get('address').value;
    this.bankDetail.swiftCode = this.addAccountForm.get('swiftCode').value;
    this.bankDetail.routingNo = this.addAccountForm.get('routingNo').value;
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
    this.bankDetail.documents = this.document;
  }
}
