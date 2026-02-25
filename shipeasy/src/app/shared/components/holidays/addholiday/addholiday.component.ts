import {Component,OnInit,Input,Output,EventEmitter,OnDestroy,} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/services/common/common.service';
import { ApiSharedService } from '../../api-service/api-shared.service';
import { HolidayDetail } from '../holiday';
import { OrderByPipe } from 'src/app/shared/util/sort';
@Component({
  selector: 'app-addholiday',
  templateUrl: './addholiday.component.html',
  styleUrls: ['./addholiday.component.scss'],
})
export class AddholidayComponent implements OnInit , OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  model: NgbDateStruct;
  addHoliday: FormGroup;
  submitted: boolean;
  holidayDetail: HolidayDetail;

  @Input() public fromParent;
  @Input() public prentPath;
  @Input() public isAddModeData;
  @Input() public golbalId;
  @Input() public isType;
  @Input() public parentId;
  @Output() passAddUserData: EventEmitter<any> = new EventEmitter();
  title: any;
  isEditMode: boolean;
  countryList: any = [];
  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private sharedService: ApiSharedService,
    private sortPipe: OrderByPipe,
    private commonService: CommonService,
    private notification: NzNotificationService
  ) {
    // do nothing.
  }
  sort(array, key) {
    return this.sortPipe.transform(array, key);
  }
  ngOnInit(): void {
    this.getCountryList();
    this.addHoliday = this.formBuilder.group({
      HolidayName: ['', Validators.required],
      Country: ['', Validators.required],
      HolidayDate: ['', Validators.required],
      status: [true]
    });
    this.isType === 'show'?this.addHoliday.disable():this.addHoliday.enable()
    if (this.isAddModeData) {
      this.isEditMode = true;
      this.title = 'Edit Holiday';
      this.addHoliday.controls.HolidayName.setValue(
        this.isAddModeData.holidayName
      );
      this.addHoliday.controls.Country.setValue(this.isAddModeData.country.countryId);
      this.addHoliday.controls.HolidayDate.setValue(
        this.isAddModeData.dateOfHoliday
      );
      this.addHoliday.controls.status.setValue(
        this.isAddModeData.status
      );
    } else {
      this.title = 'Add New Holiday';
    }
  }
  get f() {
    return this.addHoliday.controls;
  }

  getCountryList() {

    let payload = this.commonService.filterList()
 
    if(payload?.query)payload.query = {
     status : true
    }
    if(payload?.sort)payload.sort = {
      "desc" : ["updatedOn"]
    }, 
    this.commonService.getSTList('country',payload)?.subscribe((data) => {
      this.countryList = data.documents;
    });
  }

  onSave() {
    this.submitted = false;
    this.modalService.dismissAll();
  }

  close() {
    this.modalService.dismissAll();
  }

  SaveHoliday() {
    this.submitted = true;
    if (!this.addHoliday.valid) return;
    const selectedCountry = this.countryList.filter(country => country.countryId === this.addHoliday.value.Country)

    const holidayDate = this.addHoliday.value.HolidayDate;
    const year = holidayDate ? new Date(holidayDate).getFullYear().toString() : '';
    let newdata =
    {
      orgId: this.parentId,
      tenantId: '',
      country: {
        countryId: selectedCountry[0].countryId,
        countryName: selectedCountry[0].countryName,
      },
      year: year,
      dateOfHoliday : this.addHoliday.value.HolidayDate || '',
      holidayName: this.addHoliday.value.HolidayName,
      holidayType: '',
      remark: '',
      status: this.addHoliday.value.status,
      parentId: this.parentId,
    }
    let newHoliday = newdata;

    if (this.isAddModeData === null) {
      const data = [newHoliday];
      this.commonService.addToST('holiday',data[0]).subscribe((data: any) => {
        if (data) {
          this.modalService.dismissAll();
          this.passAddUserData.emit(data);
          this.notification.create('success', 'Added Successfully', '');

        }
      });
    } else {
      const dataWithUpdateId = { ...newHoliday, holidayId: this.isAddModeData.holidayId };
      const data = [dataWithUpdateId];
      this.commonService.UpdateToST(`holiday/${data[0].holidayId}`,data[0]).subscribe((data: any) => {
        if (data) {
          this.modalService.dismissAll();
          this.passAddUserData.emit(data);
          this.notification.create('success', 'Updated Successfully', '');

        }
      });
    }
    this.submitted = false;
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
