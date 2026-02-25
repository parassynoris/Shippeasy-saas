import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/admin/principal/api.service';
import * as Constant from 'src/app/shared/common-constants';
import { NzNotificationService } from 'ng-zorro-antd/notification'; 
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { DatePipe } from '@angular/common';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { CommonService } from 'src/app/services/common/common.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { Location } from 'src/app/models/yard-cfs-master';
import { ContainerMaster } from 'src/add-container';
import { SystemType } from 'src/app/models/system-type';
import { partymaster } from 'src/app/models/addvesselvoyage';

@Component({
  selector: 'app-add-container',
  templateUrl: './add-container.component.html',
  styleUrls: ['./add-container.component.scss']
})
export class AddContainerComponent implements OnInit {
  @ViewChild('closebutton') closebutton;
  @Input() public batchId;
  @Output() getList = new EventEmitter<any>();
  addContainerForm: FormGroup;
  submitted: boolean;
  yardList: Location[] = [];
  cargoTypeList: any = [];
  containerTypeList: any = [];
  statusList: any = [];
  isAddMode: any;
  baseBody: any;
  containerNumber: any;
  BatchId: any;
  todayDate=new Date()
  containerIdToUpdate: any;
  UserDetails: any;
  tankstatusList: any = [];
  tanktypeList: SystemType[] = [];
  soc: boolean = false;
  containerOpratorList: partymaster[] = [];
  arrayData: any;
  containerlist:ContainerMaster []=[];
  oneWay1: boolean = false;

  constructor(
    private fb: FormBuilder,
    private _api: ApiService,
    public notification: NzNotificationService,
    private modalService: NgbModal,
    private tranService: TransactionService,
    private commonFunctions: CommonFunctions,
    public datepipe: DatePipe,
    private sortPipe : OrderByPipe,
    private cognito : CognitoService,
    public commonService : CommonService
  ) {
    this.addContainerForm = this.fb.group({
      containerNo: ['', [Validators.required, Validators.pattern(/^[A-Z]{4}\d{7}$/)]],
      containerType: ['', [Validators.required]],
      // containerSize: ['', [Validators.required]],
      tankStatus: [''],
      tankType: [''],
      tarWeight: [''],
      tankCapacity: [''],
      exitOffHireDate: [''],
      onHireDate: [''],
      loadCapacity: [''],
      yard:['' ],
      dateOfManufacture: [''],
      oneWay: [false],
      containerOperator: [''],
      pickLocation: [''],
      dropLocation: [''],
      soc: [false],
      maxGrossWeight: new FormControl(''),
      maxPayload: new FormControl(''),
      baffles: [false],
      remarks: [''],
      creationDate: [''],
      creationUserId: [''],
      lastUpdatedDate: [''],
      lastupdatedUserId: [''],
      status: [true]
    });
  }
  sort(array , key){
    return this.sortPipe.transform(array, key);
   }
  ngOnInit(): void {
    this.getContainerData();
    this.getLocation()
    this.getSystemTypeDropDowns();
    this.getPartyMasterDropDowns()
    this.getStatusMasterDropDown(); 
    this.getContainerData();
  }



  getStatusMasterDropDown() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = { }
    this.commonService.getSTList("status", payload)?.subscribe((res: any) => {
      this.statusList = res?.documents;
    });
  }
 
  getLocation() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      masterType:   {
        "$in": ['YARD','CFS','ICD']
      },
      "status": true
    }
    this.commonService.getSTList("location",payload)?.subscribe((res :any) => {
      this.yardList = res?.documents;
    });
  }

  patchAddContainerForm() {
    this.addContainerForm.patchValue({
      creationDate: this.UserDetails.createdOn,
      creationUserId: this.UserDetails.createdBy,
      lastUpdatedDate: this.UserDetails.updatedOn,
      lastupdatedUserId: this.UserDetails.updatedBy,
    });
  }
  deleteclause(id: any) {
    alert('Item deleted!');
  }
  get f() {
    return this.addContainerForm.controls;
  }


  getContainerData() {

    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = { },
    
    this.commonService.getSTList('containermaster',payload)?.subscribe((res: any) => {
      this.containerlist = res?.documents;
    });
  }

  getSystemTypeDropDowns() {
   
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      status: true,
      typeCategory:   {
        "$in": ['tankType','tankStatus','containerOperator', 'containerType']
      },
    }
    this._api
      .getSTList('systemtype', payload)
      ?.subscribe((res: any) => {
        this.tanktypeList = res?.documents.filter(
          (x) => x.typeCategory === 'tankType'
        );
        this.tankstatusList = res?.documents.filter(
          (x) => x.typeCategory === 'tankStatus'
        );
        // this.containerOpratorList = res?.documents.filter(
        //   (x) => x.typeCategory === 'containerOperator'
        // );
        this.containerTypeList = res?.documents.filter(x => x.typeCategory === "containerType");
      });
  }
  getPartyMasterDropDowns() {
    let payload = this.commonService.filterList()
   if(payload) payload.query = {
      "status": true,
      "customerType.item_text": "Container Owner"
    }
    this.commonService.getSTList("partymaster", payload)?.subscribe((res: any) => {
      this.containerOpratorList = res?.documents; 
    });
  }

  onSave() {
    this.containerIdToUpdate = null;
    this.addContainerForm.reset();
    this.addContainerForm.controls['soc'].patchValue(true);
    this.submitted = false;
    // this.modalService.dismissAll();
    return null;
  }
  containerMaster() {
    if (this.addContainerForm.controls['soc'].value === false) {
      this.addContainerForm.get('maxGrossWeight').setErrors(null);
      this.addContainerForm.get('maxPayload').setErrors(null);
      this.addContainerForm.updateValueAndValidity();
    }
    this.submitted = true;
    if (this.addContainerForm.invalid) {
      return;
    }

    let containeNo = this.addContainerForm.value.containerNo.toLowerCase()
    let filterCont = this.containerlist.filter((employee) => employee?.containerNo?.toLowerCase().includes(containeNo))

    if (filterCont.length > 0) {
      this.notification.create('error', `${this.addContainerForm.value.containerNo} container already in use`, '')
return false
    }


    let body = {
      containerNo: this.addContainerForm.value.containerNo?.toUpperCase(),
      orgId: this.commonFunctions.getAgentDetails().orgId,
      cargoNo: '12',
      cargoTypeName: 'test',
      containerTypeId: this.addContainerForm.value.containerType,
      containerType: this.containerTypeList.filter((x) => x?.systemtypeId === this.addContainerForm.value.containerType)[0]?.typeName,
      // containerSize: this.addContainerForm.value.containerSize,
      tankStatusId : this.addContainerForm.value.tankStatus,
      tankStatus: this.tankstatusList.filter(
        (x) => x.systemtypeId === this.addContainerForm.value.tankStatus
      )[0]?.typeName,
      tankType: this.tanktypeList.filter(
        (x) => x.systemtypeId === this.addContainerForm.value.tankType
      )[0]?.typeName,
      tarWeight: this.addContainerForm.value.tarWeight,
      tankCapacity: this.addContainerForm.value.tankCapacity,
      exitOffHireDate: this.addContainerForm.value.exitOffHireDate || new Date(),
      onHireDate: this.addContainerForm.value.onHireDate || new Date(),
      dateOfManufacture: this.addContainerForm.value.dateOfManufacture || new Date(),
      oneWay: this.addContainerForm.value.oneWay || false,
      loadCapacity: this.addContainerForm.value.loadCapacity,
     
      containerOperator: this.addContainerForm.value.containerOperator,
      containerOperatorName:this.containerOpratorList.filter((x) => x?.partymasterId === this.addContainerForm.value.containerOperator)[0]?.name,
      pickLocation: this.addContainerForm.value.pickLocation,
      pickLocationName:this.yardList.filter((x) => x?.locationId === this.addContainerForm.value.pickLocation)[0]?.locationName,
      dropLocation: this.addContainerForm.value.dropLocation,
      dropLocationName: this.yardList.filter((x) => x?.locationId === this.addContainerForm.value.dropLocation)[0]?.locationName,
      yardNamId : this.addContainerForm.value.yard || '',
      yard : this.addContainerForm.value.yard || '',
      yardName : this.yardList.filter(e1=>e1.locationId === this.addContainerForm.value.yard)[0]?.locationName || '',
     
      soc: this.addContainerForm.value.soc,
      maxGrossWeight: this.addContainerForm.value.maxGrossWeight,
      maxPayload: this.addContainerForm.value.maxPayload,
      baffles: this.addContainerForm.value.baffles || false,
      remarks: this.addContainerForm.value.remarks,
      status: true,
      containerStatus: "Available", 
      containerStatusId: true,
      date : new Date()
    };


      const data = body;

      this.commonService.addToST('containermaster',data)?.subscribe(
        (res: any) => {
          if (res) {
            // this.getList.emit(res);
            this.notification.create('success', 'Added Successfully', '');
            this.setClear();
          }
        },
        (error) => {
          this.setClear();
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );

  }

  chageSoc(e) {
    if (e.target.checked) {
      this.soc = true;
      this.addContainerForm
        .get('maxGrossWeight')
        .setValidators([Validators.required]);
      this.addContainerForm
        .get('maxPayload')
        .setValidators([Validators.required]);
      this.addContainerForm.get('maxGrossWeight').setErrors({ required: true });
      this.addContainerForm.get('maxPayload').setErrors({ required: true });
      this.addContainerForm.updateValueAndValidity();
    } else {
      this.soc = false;
      this.addContainerForm.get('maxGrossWeight').setErrors(null);
      this.addContainerForm.get('maxPayload').setErrors(null);
      this.addContainerForm.updateValueAndValidity();
    }
  }


 
  clickOnOneWay(event?) {
    if (this.addContainerForm.value.oneWay) {
      this.oneWay1 = true;
      this.addContainerForm.get('containerOperator').setValidators([Validators.required]);
      this.addContainerForm.get('pickLocation').setValidators([Validators.required]);
      this.addContainerForm.get('dropLocation').setValidators([Validators.required]);
      this.addContainerForm.get('containerOperator').setErrors({ required: true });
      this.addContainerForm.get('pickLocation').setErrors({ required: true });
      this.addContainerForm.get('dropLocation').setErrors({ required: true });
      this.addContainerForm.updateValueAndValidity();
    } else {
      this.oneWay1 = false;
      this.addContainerForm.get('containerOperator').setErrors(null);
      this.addContainerForm.get('pickLocation').setErrors(null);
      this.addContainerForm.get('dropLocation').setErrors(null);
      this.addContainerForm.updateValueAndValidity();
    } 
  }

  setClear() {
    this.containerIdToUpdate = null;
    this.addContainerForm.reset();
    this.submitted = false;
    // this.modalService.dismissAll();
    this.getList.emit()
    return null;
  }
}

