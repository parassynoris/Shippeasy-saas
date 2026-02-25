import { Component, OnInit, Output, EventEmitter, Input, Pipe, PipeTransform } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/admin/principal/api.service';
import * as Constant from 'src/app/shared/common-constants';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { CommonService } from 'src/app/services/common/common.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { TestBed } from '@angular/core/testing';

@Pipe({
  name: "searchfilter"
})
export class SearchFilterPipe implements PipeTransform {
  transform(value: any, args?: any) {
    if (!value) return null;
    if (!args) return value
    args = args.toLowerCase()
    return value.filter(function (item) {
      return JSON.stringify(item).toLowerCase().includes(args)
    })
  }
}
@Component({
  selector: 'app-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss']
})
export class ContainerComponent implements OnInit {

  @Output() SaveNew = new EventEmitter<any>();
  @Input() public tankData;
  @Input() public msgData;
  @Input() batchDetail;
  addContainerForm: FormGroup;
  addContainerForm1: FormGroup;
  submitted: boolean;
  yardList: any = [];
  containerTypeList: any = [];
  containerList: any = [];
  baseBody: any;
  selectedContainer: any = []
  selectYard: any;
  selectContainer: any;
  BatchId: any;
  tanktypeList: any = [];
  isSelected: boolean;
  selectedContainerArr: any = [];
  tankstatusList: any = [];
  currentUrl: string;
  isExport: boolean = false;
  searchText: any;
  showUpdateContainer: boolean = false;
  constructor(private formBuilder: FormBuilder,
    private commonFunction : CommonFunctions,
    public _api: ApiService,
    public notification: NzNotificationService,
    public modalService: NgbModal,
    public route: ActivatedRoute,
    public commonService : CommonService,
    public sortPipe: OrderByPipe) {
      this.formBuilder = formBuilder;
      this._api = _api;
      this.notification = notification;
      this.modalService = modalService;
      this.route = route;
      this.commonService = commonService;
      this.sortPipe = sortPipe
    this.isExport = localStorage.getItem('isExport') === 'false' ? false : true;
    this.BatchId = this.route.snapshot.params['id']
    this.addContainerForm = this.formBuilder.group({
      yard: [''],
      containerType: [''],
      tankStatus: [''],
      containerSearch: ['availble']
    });
    this.formContainer()
  }

  sort(array, key) {
    return this.sortPipe.transform(array, key);
  }

  ngOnInit(): void {

    this.getContainer()
    this.getPartyMaster()
    setTimeout(() => {
      this.getSystemTypeDropDowns();
      this.getLocation();
      if (this.msgData) {
        this.getContainerDataFromContainerMasterId();

      }
      this.getBatchById()

    }, 500);
  }

  getBatchById() {
    this.currentUrl = window.location.href.split('?')[0].split('/').reverse()[1];

    let payload = this.commonService.filterList()
    payload.query = {
      "batchId": this.currentUrl,
    }
    this._api
      .getSTList(Constant.BATCH_LIST, payload)
      .subscribe((res: any) => {
        this.batchDetail = res?.documents[0];
        // if (!this.isExport) {
          this.getContainerData()
        // }
        this.addContainerForm.controls.containerType.setValue(this.batchDetail?.enquiryData?.tankTypeName)
        this.addContainerForm.controls.tankStatus.setValue(this.batchDetail?.enquiryData?.tankStatusId)


      });
  }
  get f() { return this.addContainerForm.controls; }
  getSystemTypeDropDowns() {
   
    let payload = this.commonService.filterList()
    payload.query = {
      typeCategory:   {
        "$in": ['containerType','tankType','tankStatus']
      },
      "status": true
    }
    this._api.getSTList("systemtype", payload).subscribe((res: any) => {
      this.containerTypeList = res?.documents?.filter(x => x.typeCategory === "containerType");
      this.tanktypeList = res?.documents?.filter(
        (x) => x.typeCategory === 'tankType'
      );
      this.tankstatusList = res?.documents?.filter(
        (x) => x.typeCategory === 'tankStatus'
      );
    });
  }
  getYardDropDown() {
    let payload = this.commonService.filterList()
    payload.query = { }
    this._api.getSTList("yard",payload).subscribe((res: any) => {
      this.yardList = res?.documents;
    });
  }
  getLocation() {
    let payload = this.commonService.filterList()
    payload.query = {
      masterType:   {
        "$in": ['YARD','CFS','ICD']
      },
      "status": true
    }
    this.commonService.getSTList("location", payload).subscribe((res: any) => {
      this.yardList = res?.documents;
    });
  }
  checkFilter() {
    // if (this.isExport) {
  
      if(this.addContainerForm.controls.containerSearch.value === 'availble'){
        // if(this.addContainerForm.controls.yard.value){
          return true
        // }else{
        //   return false
        // }
      }else{
        return true
      }
    // } else {
    //   return true
    // }
  }
  getContainerData() {
    this.isContainerAdd(this.batchDetail)
    this.selectedContainer = [];
    this.selectedContainerArr = []
    this.containerList = [];
    let match = {};

    match['status']=  true
 
    // if (this.isExport) {
      // if (this.addContainerForm.controls.containerType.value) {
      //   match['tankType'] = this.addContainerForm.controls.containerType.value
      // }

      // if (this.addContainerForm.controls.tankStatus.value) {
      //   match['tankStatusId']= this.addContainerForm.controls.tankStatus.value
       
      // }
      const containerTypes = this.batchDetail?.enquiryDetails?.containersDetails
      ?.map(x => x.containerType)
      ?.filter(type => !!type);
        if (containerTypes?.length > 0) {
          match['containerType'] = { $in: containerTypes };
        }

      
      match['containerStatusId']=  true
      
      if (this.addContainerForm.controls.containerSearch.value === 'availble') {
        if (this.addContainerForm.controls.yard.value) {
          match['yardName']=  this.addContainerForm.controls.yard.value
        }
        match['containerStatus']=  {
          "$in": ['Available','Release']
        }
      }

      if ( this.addContainerForm.controls.containerSearch.value === 'reserv') {
        match['containerStatus']=  {
          "$in": ["Available","Release","Reserved","Depot Out","ICD In","ICD Out","Factory In","Factory Out","Terminal In","Reject"]
        }
      }

      if (this.addContainerForm.controls.containerSearch.value === 'cutomer'){
        match['containerStatus']=  "Reserved"
      }

    // } else {
    //   if (this.batchDetail?.agentadviceId) {
    //     match['agentadviceId']=  this.batchDetail?.agentadviceId
    //   }

    // }

    let payload = this.commonService.filterList()
    payload.query = match
    

    this._api.getSTList(Constant.MASTER_CONTAINER_LIST, payload).subscribe((res: any) => {
      this.containerList = res?.documents;
      if (this.tankData) {
        let arr = []

        if (this.addContainerForm.controls.containerSearch.value === 'reserv') {
          this.containerList.forEach(e => {
            let filtrContainer = this.tankData.filter(el => el.containerNumber === e.containerNo)
            if ((filtrContainer && filtrContainer.length > 0))
              arr.push(e)
          })
        }
    
        else {
          this.containerList.forEach(e => {
            let filtrContainer = this.tankData.filter(el => el.containerNumber === e.containerNo)
            if (!(filtrContainer && filtrContainer.length > 0))
              arr.push(e)
          })
        }
        this.containerList = arr
      }

    });
  }

  getContainerDataFromContainerMasterId() {
    this.selectedContainer = "";
    this.containerList = [];
    let payload = this.commonService.filterList()
    payload.query = {
      mastercontainerId: this.msgData.controls.mastercontainerId.value,
    }
    this._api.getSTList(Constant.MASTER_CONTAINER_LIST, payload).subscribe((res: any) => {
      this.addContainerForm.controls.yard.setValue(res?.documents[0]?.yardId);
      this.addContainerForm.controls.containerType.setValue(res?.documents[0]?.tankType);
    });
  }
  closePopup() {
    this.submitted = false;
    this.addContainerForm.reset();
    this.modalService.dismissAll();
  }

  onSelectContainer() {
    // if (this.isExport) {
      // if (this.addContainerForm.value.yard === '' || this.addContainerForm.value.yard === undefined) {
      //   this.notification.create('error', 'Please Select Yard', '');
      // }
      // else if (this.addContainerForm.value.containerType === '' || this.addContainerForm.value.containerType === undefined) {
      //   this.notification.create('error', 'Please Select Tank Type', '');
      // }
      // else 
      if (this.selectedContainer && this.addContainerForm.valid) {

        this.SaveNew.emit({ containerArray: this.selectedContainer, containersData: this.addContainerForm.value });
        this.closePopup();
      }
      else { this.notification.create('error', 'Please Select One Container', ''); }
    // } else {
    //   if (this.selectedContainer) {

    //     this.SaveNew.emit({ containerArray: this.selectedContainer, containersData: this.addContainerForm.value });
    //     this.closePopup();
    //   }
    //   else { this.notification.create('error', 'Please Select One Container', ''); }
    // }
  }
  allSelect(e) {
    this.selectedContainer = []
    this.selectedContainerArr = []
    this.isSelected = !this.isSelected;
    if (e.target.checked) {
      this.selectedContainer = this.selectedContainer.concat(this.containerList)
      this.selectedContainerArr = this.selectedContainer.concat(this.containerList)
    } else {
      this.selectedContainer = []
      this.selectedContainerArr = []
    }
  }
  // removeRow(content1) {
  //   this.modalService.open(content1, {
  //     backdrop: 'static',
  //     keyboard: false,
  //     centered: true,
  //     size: 'sm',

  //     ariaLabelledBy: 'modal-basic-title',
  //   });
  // }

  // deleteContainer(deleteContainer, container: any) {
  //   this.modalService
  //     .open(deleteContainer, {
  //       backdrop: 'static',
  //       keyboard: false,
  //       centered: true,
  //       size: 'sm', 
  //       ariaLabelledBy: 'modal-basic-title',
  //     })
  //     .result.then(
  //       (result) => {
  //         if (result === 'yes') {
  //           this._api.deleteST(`containermaster/${container.containermasterId}`).subscribe(
  //             (result: any) => {
  //               if (result) {
  //                 this.notification.create('success', 'Deleted Successfully', '');
  //                 this.getContainerData(); 
  //               }
  //             },
  //             (error) => {
  //               this.notification.create('error', error?.error?.error?.message, '');
  //             }
  //           );
  //         }
  //       },
  //       (dismiss) => {
  //         console.log('Modal dismissed: ', dismiss);
  //       }
  //     );
  // }


  deleteContainer(container: any) {
    this._api.deleteST(`containermaster/${container.containermasterId}`).subscribe(
      (result: any) => {
        if (result) {
          this.notification.create('success', 'Deleted Successfully', '');
          this.getContainerData(); 
        }
      },
      (error) => {
        this.notification.create('error', error?.error?.error?.message, '');
      }
    );
  }
  onContainerChange(container: any, e: any,) {
    
      if (e.target.checked  ) {
        if(this.selectedContainerArr.length < this.numberOfContainer ){
          this.selectedContainerArr.push(container)
        }
        else{
          this.notification.create('error',`You can not add more than ${this.numberOfContainer} container`,'')
        }
       
      } else {
        let index = this.selectedContainerArr.findIndex(
          item => item.containerNo === container?.containerNo
        )
        this.selectedContainerArr.splice(index, 1)
      }
  
      this.selectedContainer = this.selectedContainerArr
    
   
    
  }


  numberOfContainer:any= 0
  isContainerAdd(data){
     this.numberOfContainer = 0
  
      if(data.enquiryDetails?.containersDetails.length != 0){
        data.enquiryDetails?.containersDetails.forEach(element1 => {
          this.numberOfContainer+= element1.noOfContainer
        });
      }
      else{
        return false
      }
  
    
  }
  customerList = []
  listContainer = []
  isRequird = false
  containerStatusList: any = ["Reserved",
    "Release",
    "Revoke",
    "Available",
    "Under Repair",
    "Washing",
    " Under Survey",
    "Free use off Hire"
  ]
  getContainer() {
 
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true
    }
    this._api.getSTList("containermaster", payload)?.subscribe((res: any) => {
      this.listContainer = res?.documents;
    });
  }
  getPartyMaster() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true
    }
    this._api.getSTList("partymaster", payload)?.subscribe((res: any) => {
      this.customerList = res?.documents
    });
  }
  formContainer() {
    this.addContainerForm1 = this.formBuilder.group({
      containerNo: ['', [Validators.required]],
      customerName: [''],
      status: ['', [Validators.required]],
      date: ['', [Validators.required]],
      remarks: [''],
      yard: ['', [Validators.required]]
    });
  }
  setValidation(e) {
    if (e === 'Reserved') {
      this.isRequird = true
      this.addContainerForm1.controls['customerName'].setValidators([
        Validators.required,
      ]);
      this.addContainerForm1.controls['customerName'].updateValueAndValidity();
    } else {
      this.isRequird = false
      this.addContainerForm1.controls['customerName'].clearValidators();
      this.addContainerForm1.controls['customerName'].updateValueAndValidity();
    }
  }
  openContainer(updateContainer, containerMaster?: any,) {

    let container = this.listContainer.filter((x) => x?.containermasterId === containerMaster?.containermasterId)[0]
    this.addContainerForm1.patchValue({
      date: container?.date,
      yard: container?.yardNameId || container?.yard,
      remarks: container?.remarks,
      status: container?.containerStatus,
      containerNo: container?.containermasterId,
      customerName: container?.customerId,
    });
    this.showUpdateContainer = true
  

  }
  containerMaster() {

    this.submitted = true;
    if (this.addContainerForm1.invalid) {
      return;
    }
    let container = this.listContainer.filter((x) => x?.containermasterId === this.addContainerForm1.value.containerNo)[0]

    let body = {
      ...container,
      doDate : container?.doDate || null,
      "date": this.addContainerForm1.value.date,
      "remarks": this.addContainerForm1.value.remarks,
      "yardName": this.yardList.filter((x) => x?.locationId === this.addContainerForm1.value.yard)[0]?.locationName,
      "yardNameId": this.addContainerForm1.value.yard,
      'containerStatus': this.addContainerForm1.value.status,
      'customerName': this.customerList.filter(x => x?.partymasterId === this.addContainerForm1.value.customerName)[0]?.customerName || '',
      'customerId': this.addContainerForm1.value.customerName || '',
      "containerStatusId": true,
      "previousYardName": container?.yardName,
      "previousStatus": container?.containerStatus === this.addContainerForm1.value.status ?
        container?.previousStatus : container?.containerStatus,
        orgId: this.commonFunction.getAgentDetails().orgId
    };

    const data = body;
    this.commonService.UpdateToST(`containermaster/${container.containermasterId}`,data).subscribe(
      (result: any) => {
        if (result) {
          setTimeout(() => {
            this.notification.create('success', 'Updated Successfully', '');
            this.showUpdateContainer = false
            this.getContainerData()
          }, 800);
        }
      },
      (error) => {
        this.showUpdateContainer = false
        this.getContainerData()
        this.notification.create('error', error?.error?.error?.message, '');
      }
    );
  }
  containerMasterCancel() {
    this.showUpdateContainer = false
  }
}
