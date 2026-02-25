import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { BaseBody } from 'src/app/admin/smartagent/base-body';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { ApiService } from '../../principal/api.service';

@Component({
  selector: 'app-bond-filing',
  templateUrl: './bond-filing.component.html',
  styleUrls: ['./bond-filing.component.css'],
})
export class BondFilingComponent implements OnInit {
  addBondFileForm: FormGroup;
  baseBody: BaseBody = new BaseBody();
  cityData: any = [];
  stateList: any = [];
  countryList: any = [];
  idToUpdate: string;
  closeResult: string;
  toalLength: any;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  submitted: any = false;
  country: any;
  iso_country: any;
  region: any;
  status: any;
  selectedCountry: any;
  selectedState: any;
  search_city: any;
  search_state: any;
  search_country: any;
  search_status: any;

  bondData:any;
  bondNo:any;
  bondType:any;
  bondBase:any;
  validFrom:any;
  validTo:any;
  bondTypeList:any;
  bondBaseList:any;

  constructor(
    private modalService: NgbModal,
    private saMasterService: SaMasterService,
    private fb: FormBuilder,
    private notification: NzNotificationService,
    private _api: ApiService,
    private profilesService: ProfilesService
  ) {

    this.addBondFileForm = this.fb.group({
      bondNo:['',Validators.required],
      bondBase:['',Validators.required],
      bondType:[''],
      validFrom:[new Date(),Validators.required],
      validTo:[new Date(),Validators.required],
      bondValue:[''],
      portCode:[''],
      containerCat:[''],
      containerType:[''],
      valuePerCont:[''],
      totalCount:[''],
      status:[true]
    });
  }

  ngOnInit(): void {
    this.getData();
  }
  get f() {
    return this.addBondFileForm.controls;
  }

  getData() {
    var parameter = {
      size: Number(this.size),
      from: this.page - 1,
      sort: { createdOn: 'desc' },
      query: {
        bool: {
          must: [],
          filter: [],
          should: [],
          must_not: [],
        },
      },
    };
    this.saMasterService.cityList(parameter)?.subscribe((res: any) => {
      this.cityData = res.hits.hits;
      this.toalLength = res.hits.total.value;
      this.count = res.hits.hits.length;
    });
  }

  getCountryList() {
    var parameter = {
      size: 1000,
      _source: [],
      query: {
        bool: {
          must: [{ "match": { "status": true } }],
          filter: [],
          should: [],
          must_not: [],
        },
      },
    };
    this.saMasterService.countryList(parameter).subscribe((data) => {
      this.countryList = data.hits.hits;
    });
  }

  next() {
    if (this.toalLength > this.count) {
      this.getPaginationData('next');
    }
  }

  prev() {
    if (this.page > 0) {
      this.getPaginationData('prev');
    }
  }

  filter(e) {
    this.size = e.target.value;
    this.fromSize = 1;
    this.getData();
  }

  getPaginationData(type: any) {
    this.fromSize =
      type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
    var parameter = {
      size: Number(this.size),
      from: this.fromSize - 1,
      query: {
        bool: {
          must: [],
          filter: [],
          should: [],
          must_not: [],
        },
      },
    };
    this.saMasterService.cityList(parameter).subscribe((data) => {
      this.cityData = data.hits.hits;
      this.toalLength = data.hits.total.value;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count = type === 'prev' ? this.toalLength === this.count ? this.count - (this.toalLength % Number(this.size)) : this.count - data.hits.hits.length : this.count + data.hits.hits.length;
    });
  }

  search() {
    let mustArray = [];
    if (this.search_city) {
      mustArray.push({
        wildcard: {
          'cityName': "*" + this.search_city.toLowerCase() + "*"
        },
      });
    }
    if (this.search_state) {
      mustArray.push({
        wildcard: {
          'stateName': "*" + this.search_state.toLowerCase() + "*"
        },
      });
    }
    if (this.search_country) {
      mustArray.push({
        wildcard: {
          'country.countryName': "*" + this.search_country.toLowerCase() + "*"
        },
      });
    }
    if (this.search_status) {
      mustArray.push({
        match: {
          status: this.search_status === 'Active' ? true : false,
        },
      });
    }

    var parameter = {
      size: Number(this.size),
      from: this.fromSize - 1,
      query: {
        bool: {
          must: mustArray,
        },
      },
    };
    this.saMasterService.cityList(parameter).subscribe((res: any) => {
      this.cityData = res.hits.hits;
      this.toalLength = res.hits.total.value;
      this.count = res.hits.hits.length;
    });
  }

  clear() {
    this.search_city = '';
    this.search_state = '';
    this.search_country = '';
    this.search_status = '';
    this.getData();
  }

  open(content, bond?: any) {
    if (bond) {
      this.idToUpdate = bond._source.bondId;

      this.addBondFileForm.patchValue({
        bondNo:bond._source.bondNo,
      bondBase:bond._source.bondBase,
      bondType:bond._source.bondType,
      validFrom:bond._source.validFrom,
      validTo:bond._source.validTo,
      bondValue:bond._source.bondValue,
      portCode:bond._source.portCode,
      containerCat:bond._source.containerCat,
      containerType:bond._source.containerType,
      valuePerCont:bond._source.valuePerCont,
      totalCount:bond._source.totalCount,
      status:bond._source.status
      });

    }
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }

  getStates() {

    this.stateList = [];
    this.baseBody = new BaseBody();
    let must = [
      {
        match: {
          
        },
      }, { "match": { "status": true } }
    ];
    this.baseBody.baseBody.query.bool.must = must;
    this.profilesService.stateList(this.baseBody.baseBody).subscribe((data) => {
      this.stateList = data.hits.hits;

    });
  }

  stateSelect(data) {
    this.selectedState = this.stateList.find(
      (state) => state._source.stateId === data.target.value
    );
  }

  onSave() {
    this.modalService.dismissAll();
    this.submitted = false;
    this.idToUpdate = null;
    this.addBondFileForm.reset();
    this.submitted = false;
    return null;
  }


  getSystemTypeDropDowns() {
    this.baseBody = new BaseBody();
    let mustArray = [];
    mustArray.push({
      "match": { }
    });

      mustArray.push({
        "match": { "status": true }
      });
    this.baseBody.baseBody.query.bool.must = mustArray;
    this._api.getListByURL("transaction/list?type=systemtype", this.baseBody.baseBody).subscribe((res: any) => {
      this.bondBaseList = res?.hits?.hits?.filter(x => x._source.typeCategory === "bondBase");
      this.bondTypeList = res?.hits?.hits?.filter(x => x._source.typeCategory === "bondType");
    });
  }

  delete(deletestate, id) {
    this.modalService
      .open(deletestate, {
        backdrop: 'static',
        keyboard: false,
        centered: true,
        size: '',

        ariaLabelledBy: 'modal-basic-title',
      })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
          if (result === 'yes') {
            let data = {
              cityId: id._source.cityId,
              searchKey: 'cityId',
            };
            const body = [data];

            this.saMasterService.deleteCity(body).subscribe((res: any) => {
              if (res) {
                this.notification.create('success', 'Deleted Successfully', '');
                this.clear();
              }
            });
          }
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  cityMasters() {
    this.submitted = true;
    if (this.addBondFileForm.invalid) {
      return;
    }
    const dataupdate = this.addBondFileForm.value
    dataupdate.orgId="1"
    dataupdate.tenantId="1"


   
  }

  changeStatus(data) {
    this.saMasterService
      .updateCity([{ ...data?._source, status: !data?._source?.status }])
      .subscribe(
        (res: any) => {
          if (res) {
            this.notification.create(
              'success',
              'Status Updated Successfully',
              ''
            );
            this.onSave();
            this.getData();
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
  }
}
