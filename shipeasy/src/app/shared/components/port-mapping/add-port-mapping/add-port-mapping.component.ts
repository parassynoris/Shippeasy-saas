import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from 'src/app/services/common/common.service';
import { ApiSharedService } from '../../api-service/api-shared.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-add-port-mapping',
  templateUrl: './add-port-mapping.component.html',
  styleUrls: ['./add-port-mapping.component.css'],
})
export class AddPortMappingComponent implements OnInit , OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  PortData: any;
  PortList: any;
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
  selectedCostHead: any = [];
  cargoTypeList: any = [];
  @Input() public fromParent;
  @Input() public prentPath;
  @Input() public isAddModeData;
  @Input() public principalId;
  @Output() getList = new EventEmitter<any>();

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private notification: NzNotificationService,
    private commonService: CommonService,
    private sharedService: ApiSharedService
  ) {}

  ngOnInit(): void {
    this.locationForm = this.fb.group({
      orgId: [''],
      parentId: ['', [Validators.required]],
      cargoType: ['', [Validators.required]],
      country: ['', [Validators.required]],
      portMappingName: ['', [Validators.required]],
      principalCode: ['', [Validators.required]],
    });
    if (this.isAddModeData) {
      this.isAddMode = false;
      this.locationForm.controls.orgId.setValue(
        this.isAddModeData?._source?.orgId
      );
      this.locationForm.controls.parentId.setValue(
        this.isAddModeData?._source?.parentId
      );
      this.locationForm.get('parentId').disable();
      this.locationForm.controls.cargoType.setValue(
        this.isAddModeData?._source?.cargoTypeId
      );
      this.locationForm.get('cargoType').disable();
      this.locationForm.controls.country.setValue(
        this.isAddModeData?._source?.country.countryId
      );
      this.locationForm.get('country').disable();
      this.locationForm.controls.portMappingName.setValue(
        this.isAddModeData?._source?.portMappingName
      );
      this.locationForm.controls.principalCode.setValue(
        this.isAddModeData?._source?.principalCode
      );
    }
    this.getPortList();
    this.getCargoType();
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
    this.commonService.countryList()?.subscribe((data) => {
      this.countryList = data.hits.hits;
    });
  }

  getPortList() {
    var parameter = {
      size: 20,
      from: 0,
      query: {
        bool: {
          must: [{"match": {"status": true}}],
          filter: [],
          should: [],
          must_not: [],
        },
      },
    };
    this.commonService.portList(parameter)?.subscribe((res: any) => {
      this.PortList = res.hits.hits;
    });
  }

  setPort(e) {
    this.selectedCostHead = this.PortList.find(
      (port) => port._source?.portId === e
    );
    this.locationForm.patchValue({
      portMappingName: this.selectedCostHead._source.portDetails?.portName,
    });
  }

  getCargoType() {
    let body = {
      _source: [],
      size: 500,
      query: {
        bool: {
          must: [
            {
              match: {
                typeCategory: 'cargo type',
              },
            },{"match": {"status": true}}
          ],
          filter: [],
          should: [],
          must_not: [],
        },
      },
    };
    this.commonService.systemtypeList(body)?.subscribe((res: any) => {
      this.cargoTypeList = res.hits.hits;
    })

  }

  portMappingMasters() {
    this.submitted = true;
    if (this.locationForm.invalid) {
      return;
    }

    let countrylist = this.countryList.filter(
      (x) => x._source.countryISOCode === this.locationForm.get('country').value
    );

    var agentId = this.commonService.getCurrentAgentDetails()?.agentId;

    var selectedPort = this.PortList.find(
      (port) => port._id === this.locationForm.controls.parentId.value
    );

    var newCostItems = this.locationForm.value;
    if (this.isAddMode) {
      const data = [
        {
          orgId: this.principalId,
          parentId: this.locationForm.controls.parentId.value,
          cargoType: this.cargoTypeList.filter(
            (x) =>
              x._source.systemtypeId ==
              this.locationForm.controls.cargoType.value
          )[0]?._source?.typeName,
          cargoTypeId: this.locationForm.controls.cargoType.value,
          country: {
            countryId: countrylist[0]._source.countryISOCode,
            countryName: countrylist[0]._source.countryName,
          },
          portMappingName: this.locationForm.controls.portMappingName.value,
          principalCode: this.locationForm.controls.principalCode.value,
          portId: '',
          isPort : true,
          address: selectedPort._source?.portDetails.address,
          berth: selectedPort._source?.portDetails.berth,
          emailId: selectedPort._source?.portDetails.emailId,
          faxNumber: selectedPort._source?.portDetails.faxNumber,
          gmtOffset: selectedPort._source?.portDetails.gmtOffset,
          latitude: selectedPort._source?.portDetails.latitude,
          longitude: selectedPort._source?.portDetails.longitude,
          maxDraft: selectedPort._source?.portDetails.maxDraft,
          phone: selectedPort._source?.portDetails.phone,
          portAuthority: selectedPort._source?.portDetails.portAuthority,
          portName: selectedPort._source?.portDetails.portName,
          portSize: selectedPort._source?.portDetails.portSize,
          portType: selectedPort._source?.portDetails.portType,
          shortName: selectedPort._source?.portDetails.shortName,
          terminal: selectedPort._source?.portDetails.terminal,
          tollFreeNumber: selectedPort._source?.portDetails.tollFreeNumber,
          unLocode: selectedPort._source?.portDetails.unLocode,
          isType : "portMapping"
        },
      ];
      this.sharedService.createPort(data).subscribe((res) => {
        this.modalService.dismissAll();
        this.notification.create('success', 'Added Successfully', '');
        this.getList.emit(res);

      });
    } else {
      const dataWithUpdateID = { ...newCostItems, portId: this.portIdToUpdate };
      const data = [
        {
          ...this.isAddModeData?._source,
          portMappingName: this.locationForm.controls.portMappingName.value,
          principalCode: this.locationForm.controls.principalCode.value,
        },
      ];
      this.sharedService.updatePort(data).subscribe((res) => {
        this.modalService.dismissAll();
        this.notification.create('success', 'Update Successfully', '');
        this.getList.emit(res);

      });
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
