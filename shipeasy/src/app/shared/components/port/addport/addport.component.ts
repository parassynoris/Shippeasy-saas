import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-addport',
  templateUrl: './addport.component.html',
  styleUrls: ['./addport.component.css'],
})
export class AddportComponent implements OnInit {
  PortData: any;
  isAddMode: boolean = true;
  locationForm: FormGroup;
  portIdToUpdate: any;
  closeResult: string;
  toalLength: any;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  submitted: any = false;
  authority: any;
  type: any;
  country: any;
  address: any;
  port_type: any;
  terminal: any;
  berth: any;
  countryList: any = [];
  @Input() public fromParent;
  @Input() public prentPath;
  @Input() public isAddModeData;

  constructor(
    private modalService: NgbModal,
    private saMasterService: SaMasterService,
    private fb: FormBuilder,
    private notification: NzNotificationService,
    private profilesService: ProfilesService
  ) {
    // do nothing.
  }

  ngOnInit(): void {
    this.locationForm = this.fb.group({
      orgId: [''],
      tenantId: [''],
      portName: ['', [Validators.required]],
      shortName: ['', [Validators.required]],
      portAuthority: ['', [Validators.required]],
      terminals: ['', [Validators.required]],
      berths: ['', [Validators.required]],
      address: ['', [Validators.required]],
      phone: [
        '',
        [
          Validators.required,
          Validators.pattern(environment.validate.phone),
          Validators.maxLength(10),
        ],
      ],
      faxNumber: ['', [Validators.required]],
      tollNumber: ['', [Validators.required]],
      emailId: [
        '',
        [Validators.required, Validators.pattern(environment.validate.email)],
      ],
      latitude: ['', [Validators.required]],
      longitude: ['', [Validators.required]],
      uncode: ['', [Validators.required]],
      country: ['', [Validators.required]],
      gmtOffset: ['', [Validators.required]],
      maxDraft: ['', [Validators.required]],
      portType: ['', [Validators.required]],
      portSize: ['', [Validators.required]],
      ESIRebaleApplication: [true, [Validators.required]],
    });
    if (this.isAddModeData) {
      this.isAddMode = false;
      this.locationForm.controls.orgId.setValue(
        this.isAddModeData?._source?.orgId
      );
      this.locationForm.controls.portName.setValue(
        this.isAddModeData?._source?.portName
      );
      this.locationForm.controls.shortName.setValue(
        this.isAddModeData?._source?.shortName
      );
      this.locationForm.controls.tenantId.setValue(
        this.isAddModeData?._source?.tenantId
      );
      this.locationForm.controls.portAuthority.setValue(
        this.isAddModeData?._source?.portAuthority
      );
      this.locationForm.controls.terminals.setValue(
        this.isAddModeData?._source?.terminal
      );
      this.locationForm.controls.berths.setValue(
        this.isAddModeData?._source?.berths
      );
      this.locationForm.controls.address.setValue(
        this.isAddModeData?._source?.address
      );
      this.locationForm.controls.phone.setValue(
        this.isAddModeData?._source?.phone
      );
      this.locationForm.controls.faxNumber.setValue(
        this.isAddModeData?._source?.faxNumber
      );
      this.locationForm.controls.tollNumber.setValue(
        this.isAddModeData?._source?.tollNumber
      );
      this.locationForm.controls.emailId.setValue(
        this.isAddModeData?._source?.emailId
      );
      this.locationForm.controls.latitude.setValue(
        this.isAddModeData?._source?.latitude
      );
      this.locationForm.controls.longitude.setValue(
        this.isAddModeData?._source?.longitude
      );
      this.locationForm.controls.uncode.setValue(
        this.isAddModeData?._source?.uncode
      );
      this.locationForm.controls.country.setValue(
        this.isAddModeData?._source?.country
      );
      this.locationForm.controls.gmtOffset.setValue(
        this.isAddModeData?._source?.gmtOffset
      );
      this.locationForm.controls.maxDraft.setValue(
        this.isAddModeData?._source?.maxDraft
      );
      this.locationForm.controls.portType.setValue(
        this.isAddModeData?._source?.portType
      );
      this.locationForm.controls.portSize.setValue(
        this.isAddModeData?._source?.portSize
      );
      this.locationForm.controls.ESIRebaleApplication.setValue(
        this.isAddModeData?._source?.ESIRebaleApplication
      );
    }
    this.getCountryList();
  }

  get f() {
    return this.locationForm.controls;
  }

  onSave() {
    this.modalService.dismissAll();
    return null;
  }

  getCountryList() {
    this.profilesService.countryList()?.subscribe((data) => {
      this.countryList = data.hits.hits;
    });
  }

  locationsMasters() {
    this.submitted = true;
    if (this.locationForm.invalid) {
      return;
    }
    var agentId = this.profilesService.getCurrentAgentDetails()?.agentId;

    this.locationForm.controls.orgId.setValue(agentId);
    this.locationForm.controls.tenantId.setValue(agentId);
    var newCostItems = this.locationForm.value;
    if (this.isAddMode) {
      const data = [
        {
          portId: '',
          portName: this.locationForm.controls.portName.value,
          shortName: this.locationForm.controls.shortName.value,
          portDetails: newCostItems,
        },
      ];

      this.saMasterService.createPort(data).subscribe((res) => {
        this.notification.create('success', 'Added Successfully', '');
        this.onSave();
        window.location.assign('/' + this.prentPath + '/port');
      });
    } else {
      const dataWithUpdateID = { ...newCostItems, portId: this.portIdToUpdate };
      const data = [
        {
          portId: this.isAddModeData?._source?.portId,
          portName: this.locationForm.controls.portName.value,
          shortName: this.locationForm.controls.shortName.value,
          portDetails: dataWithUpdateID,
        },
      ];
      this.saMasterService.updatePort(data).subscribe((res) => {
        this.notification.create('success', 'Update Successfully', '');
        window.location.assign('/' + this.prentPath + '/port');
        this.onSave();
      });
    }
  }
}
