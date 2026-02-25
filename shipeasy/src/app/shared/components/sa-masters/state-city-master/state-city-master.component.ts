import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';

@Component({
  selector: 'app-state-city-master',
  templateUrl: './state-city-master.component.html',
  styleUrls: ['./state-city-master.component.css'],
})
export class StateCityMasterComponent implements OnInit {
  addCountryForm: FormGroup;
  coutryData: any = [];
  countryIdToUpdate: string;
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

  constructor(
    private modalService: NgbModal,
    private saMasterService: SaMasterService,
    private fb: FormBuilder,
    private notification: NzNotificationService
  ) {
    this.addCountryForm = this.fb.group({
      callingCode: new FormControl('', Validators.required),
      countryName: new FormControl('', Validators.required),
      countryFlag: new FormControl('', Validators.required),
      countryISOCode: new FormControl('', Validators.required),
      region: new FormControl(''),
      countryCurrency: new FormControl('', Validators.required),
      gmtOffset: new FormControl('', Validators.required),
      utcOffset: new FormControl('', Validators.required),
      isDst: new FormControl(true),
      countryHoliday: new FormControl(''),
      status: new FormControl(true),
    });
  }

  ngOnInit(): void {
    this.getData();
  }
  get f() {
    return this.addCountryForm.controls;
  }

  deleteclause(id: any) {
    alert('Item deleted!');
  }

  getData() {
    var parameter = {
      size: Number(this.size),
      from: this.page - 1,
      query: {
        bool: {
          must: [],
          filter: [],
          should: [],
          must_not: [],
        },
      },
    };
    this.saMasterService.countryList(parameter).subscribe((res: any) => {
      this.coutryData = res.hits.hits;
      this.toalLength = res.hits.total.value;
      this.count = res.hits.hits.length;
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
    this.saMasterService.countryList(parameter).subscribe((data) => {
      this.coutryData = data.hits.hits;
      this.toalLength = data.hits.total.value;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count = type === 'prev' ? this.toalLength === this.count ? this.count - (this.toalLength % Number(this.size)) : this.count - data.hits.hits.length : this.count + data.hits.hits.length;
    });
  }

  search() {
    let mustArray = [];
    if (this.country) {
      mustArray.push({
        match: {
          countryName: this.country,
        },
      });
    }
    if (this.iso_country) {
      mustArray.push({
        match: {
          countryISOCode: this.iso_country,
        },
      });
    }
    if (this.region) {
      mustArray.push({
        match: {
          'region.regionName': this.region,
        },
      });
    }
    if (this.status) {
      mustArray.push({
        match: {
          status: this.status,
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
    this.saMasterService.countryList(parameter).subscribe((res: any) => {
      this.coutryData = res.hits.hits;
      this.toalLength = res.hits.total.value;
      this.count = res.hits.hits.length;
    });
  }

  clear() {
    this.country = '';
    this.iso_country = '';
    this.region = '';
    this.status = '';
    this.getData();
  }

  open(content, country?: any) {
    if (country) {
      this.countryIdToUpdate = country._source.countryId;
      this.addCountryForm.patchValue({
        callingCode: country._source.callingCode,
        countryName: country._source.countryName,
        countryFlag: country._source.countryFlag,
        countryISOCode: country._source.countryISOCode,
        region: country._source.region.regionName,
        countryCurrency: country._source.countryCurrency.currencyName,
        gmtOffset: country._source.gmtOffset[0].gmt,
        utcOffset: country._source.utcOffset[0].utc,
        isDst: country._source.isDst,
        countryHoliday: country._source.countryHoliday.holidayName,
        status: country._source.status,
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
  countryMasters() {
    this.submitted = true;
    if (this.addCountryForm.invalid) {
      return;
    }
    const dataupdate = {
      tenantId: '',
      orgId: '',
      countryId: '',
      countryISOCode: this.addCountryForm.value.countryISOCode,
      countryName: this.addCountryForm.value.countryName,
      callingCode: this.addCountryForm.value.callingCode,
      countryFlag: this.addCountryForm.value.countryFlag,
      status: this.addCountryForm.value.status,
      gmtOffset: [
        {
          gmt: this.addCountryForm.value.gmtOffset,
          time: '+01:00',
        },
      ],
      utcOffset: [
        {
          utc: this.addCountryForm.value.utcOffset,
          time: '+01:00',
        },
      ],
      isDst: this.addCountryForm.value.isDst,
      region: {
        regionId: '',
        regionName: this.addCountryForm.value.region,
      },
      countryCurrency: {
        currencyCode: 'ALL',
        currencyName: this.addCountryForm.value.countryCurrency,
        currencySymbol: this.addCountryForm.value.countryCurrency,
      },
      countryHoliday: {
        holidayName: this.addCountryForm.value.countryHoliday,
        holidayId: '',
      },
      remarks: true,
    };
    if (!this.countryIdToUpdate) {
      const data = [dataupdate];
      this.saMasterService.createCountry(data).subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Added Successfully', '');
            this.onSave();
            this.getData();
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
    } else {
      let newCountry = { ...dataupdate, countryId: this.countryIdToUpdate };
      const data = [newCountry];
      this.saMasterService.updateCountry(data).subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Updated Successfully', '');
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
  changeStatus(data) {
    this.saMasterService
      .updateCountry([{ ...data?._source, status: !data?._source?.status }])
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
  delete(deletecountry, id) {
    this.modalService
      .open(deletecountry, {
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
              countryId: id._source.countryId,
              searchKey: 'countryId',
            };
            const body = [data];

            this.saMasterService.deleteCountry(body).subscribe((res: any) => {
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

  onSave() {
    this.modalService.dismissAll();
    this.submitted = false;
    this.countryIdToUpdate = null;
    this.addCountryForm.reset();
    this.addCountryForm.controls['status'].setValue(true);
    this.addCountryForm.controls['isDst'].setValue(true);
    this.addCountryForm.controls['countryHoliday'].setValue('');
    this.addCountryForm.controls['region'].setValue('');
    this.submitted = false;
    return null;
  }
}
