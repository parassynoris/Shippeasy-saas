import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { AddContainerComponent } from 'src/app/admin/batch/batch-detail/tank/add-container/add-container.component';
import { ApiService } from 'src/app/admin/principal/api.service';

import { BaseBody } from 'src/app/admin/smartagent/base-body';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { Location } from 'src/app/models/yard-cfs-master';

import { CommonService } from 'src/app/services/common/common.service';
import * as Constant from 'src/app/shared/common-constants';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { AssignContainerComponent } from './assign-container/assign-container.component';


@Pipe({
  name: 'filter1',
})
export class FilterPipe1 implements PipeTransform {
  transform(value, args?: any) {
    if (value?.length === 0) {
      return value;
    }
    if (!args) { return value }
    let filteredUsers = [];
    value.forEach(element => {
      element?.voyage?.forEach((x) => {
        if (x?.shipping_line)
          if (x?.shipping_line === args) {
            filteredUsers.push(element);
          }
      })
    });


    return filteredUsers;
  }
}



@Component({
  selector: 'app-add-consolidation-booking',
  templateUrl: './add-consolidation-booking.component.html',
  styleUrls: ['./add-consolidation-booking.component.scss']
})

// Work is under Progess


export class AddConsolidationBookingComponent implements OnInit {
  consolidatuonDetailsform: FormGroup;
  batchDetail: any;
  toalLength: any;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  batchList = [];
  isExport: boolean;
  baseBody: any;
  yardList: Location[] = [];
  containerTypeList: any = [];
  containerList: any = [];
  submitted: boolean;
  totalVolume = 0;
  exceeding40ftVolume = 0;
  showList: boolean = false
  vesselData: any = []
  voyageNoList = []
  voyageListData: any = []
  shipmentTypes: any = []
  shippingLineList: any = [];
  flightList: any = []
  vehicalList: any = [];
  consolidationId: any;

  portData: any = []
  isTransport: boolean;
  id: any;
  consolidationbooking: any;
  cityList: any;
  constructor(private formBuilder: FormBuilder,
    private commonService: CommonService,
    private _api: ApiService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private router: Router,
    public notification: NzNotificationService,
    private commonFunction: CommonFunctions,
    private mastersService: MastersService
  ) {

    this.isExport = localStorage.getItem('isExport') === 'true' ? true : false;
    this.consolidationId = this.route.snapshot?.params['id']

  }
  qrData: any = []
  onShow() {
    this.setContainerList()
    this.submitted = true;
    if (this.consolidatuonDetailsform?.invalid) {
      return;
    }
    const formValues = this.consolidatuonDetailsform?.value;
    let voyageType = typeof formValues?.voyage;
    let flightType = typeof formValues?.flightNo;
    let vesselType = typeof formValues?.plannedVessel;
    let vehicleType = typeof formValues?.vehicleNo;

    let payload = {
      // "batchId": formValues?.jobNo,
      // "voyageNumber": voyageType === 'string' ? formValues?.voyage : formValues?.voyage?.voyageNumber,
      // "vesselId": vesselType === 'string' ? formValues?.plannedVessel : formValues?.plannedVessel?.vesselId,
      // "portId": formValues?.port?.portId,
      // "carrierId": formValues?.shipping_line,
      // "freightType": formValues?.shipment_Type,
      // "flightNo": flightType === 'string' ? formValues?.flightNo : '',
      // "vehicleNo": vehicleType === 'string' ? formValues?.vehicleNo : '',
    };
    if (formValues?.jobNo) {
      payload["batchId"] = formValues?.jobNo;
    }

    if (formValues?.port?.portId) {
      payload["portId"] = formValues?.port?.portId;
    }
    if (formValues?.shipping_line) {
      payload["carrierId"] = formValues?.shipping_line;
    }
    if (formValues?.shipment_Type) {
      payload["freightType"] = formValues?.shipment_Type;
    }
    if (formValues?.vehicleNo) {
      payload["vehicleNo"] = formValues?.vehicleNo;
    }
    if (vesselType === 'string' ? formValues?.plannedVessel : formValues?.plannedVessel?.vesselId) {
      payload["vesselId"] = vesselType === 'string' ? formValues?.plannedVessel : formValues?.plannedVessel?.vesselId
    }

    if (voyageType === 'string' ? formValues?.voyage : formValues?.voyage?.voyageNumber) {
      payload["voyageNumber"] = voyageType === 'string' ? formValues?.voyage : formValues?.voyage?.voyageNumber
    }

    // Adding the relevant load type based on this.types
    if (this.types === 'Ocean') {
      payload["loadType"] = "LCL";
      // delete payload.flightNo;
      // delete payload.vehicleNo;
      // if (!payload.voyageNumber) {
      //   delete payload.voyageNumber;
      // }
    } else if (this.types === 'Air') {
      payload["loadType"] = "Loose";
      // delete payload.voyageNumber;
      // delete payload.vesselId;
      // delete payload.vehicleNo;
    } else if (this.types === 'Land') {
      payload["loadType"] = "LTL";
      // delete payload.voyageNumber;
      // delete payload.vesselId;
      // delete payload.flightNo;
    }

    // Ensuring portId is present for all types
    // if (!payload.portId) {
    //   return;
    // }

    // Checking for missing mandatory fields before making the service call
    // if ((this.types === 'Ocean' && (!payload.vesselId)) ||
    //   // (this.types === 'Air' && !payload.flightNo) ||
    //   (this.types === 'Land' && !payload.vehicleNo)) {
    //   return;
    // }

    this.commonService?.addToST('getQrs', payload).subscribe((data) => {
      this.qrData = data?.documents?.filter(r => this.editMode ? true : !r?.isContainerAssigned)?.map((res: any) => {
        return {
          ...res,
          volume: Number(res.volume / res.quantity).toFixed(2),
          weight: Number(res.weight / res.quantity).toFixed(2),
          isSelected: res.isSelected ? res.isSelected : false
        };
      });
    });
    setTimeout(() => {
      this.setContainerList();
    }, 1000);
    this.showList = true;
  }



  types: any
  batchDetails; any;
  setselect(e) {
    // this.consolidatuonDetailsform.reset()
    this.types = this.shipmentTypes.find(x => x.systemtypeId == e)?.typeName
    this.portData = [];
    this.batchDetails = this.batchList.find((x) => x.batchId == e)
    // this.qrData = this.batchDetails.enquiryDetails?.looseCargoDetails.cargos
    // ?.filter(r => this.editMode ? true : !r?.isContainerAssigned)
    // ?.flatMap((res: any) => 
    //   Array.from({ length: (res.units - (res?.assignedUnits || 0)) }, () => ({
    //     ...res,
    //     batchNo : this.batchDetails?.batchNo,
    //     batchId : this.batchDetails?.batchId,
    //     length:res.lengthp, 
    //     packageType : res?.pkgname,
    //     height : res.heightselected,
    //     quantity : res.units,
    //     unit:res.selectedh,
    //     width:res.Weightp, 
    //     uniqueRefNo: '',
    //     volume: Number(res.volumeselect / res.units).toFixed(2),
    //     weight: Number(res.Weightselected / res.units).toFixed(2),
    //     isSelected: res.isSelected ? res.isSelected : false
    //   }))
    // );
    this.qrData = this.batchDetails.enquiryDetails?.looseCargoDetails?.cargos
    ?.filter(res => (res.units - (res?.assignedUnits || 0)) > 0) // remove if quantity is 0
    .map(res => ({
      ...res,
      batchNo: this.batchDetails?.batchNo,
      batchId: this.batchDetails?.batchId,
      length: res.lengthp,
      packageType: res?.pkgname,
      height: res.heightselected,
      totalQty: res.units,
      quantity: res.units - (res?.assignedUnits || 0),
      unit: res.selectedh,
      width: res.Weightp,
      uniqueRefNo: '',
      volume: (((res?.volumeselect || res?.cbm)  / res?.units) * (res.units - (res?.assignedUnits || 0)) || 0).toFixed(2),
      weight: Number(res.Weightselected).toFixed(2),
      isSelected: res.isSelected ?? false,
      assignQty: this.editMode ? (res?.assignQty || 0) : (res.units - (res?.assignedUnits || 0)) || 0,
    }));

    setTimeout(() => {
      this.setContainerList()
    }, 0);

    return;
    if (this.types === 'Land') {
      this.setremovevalidation('consolidatuonDetailsform', [{ name: 'vehicleNo', required: true }, { name: 'plannedVessel', required: false }, { name: 'flightNo', required: false }])
    } else if (this.types === 'Air') {
      this.setremovevalidation('consolidatuonDetailsform', [{ name: 'vehicleNo', required: false }, { name: 'plannedVessel', required: false }, { name: 'flightNo', required: true }])
    } else if (this.types === 'Ocean') {
      this.setremovevalidation('consolidatuonDetailsform', [{ name: 'vehicleNo', required: false }, { name: 'plannedVessel', required: true }, { name: 'flightNo', required: false }])
    }
  }
  calculateVolume(batch,i){ 
    let count = (((batch?.volumeselect || batch?.cbm) / batch?.totalQty) * batch?.assignQty || 0).toFixed(2) 
    this.qrData[i].volume = count;
  }
  setremovevalidation(formGroup, forms) {
    forms?.forEach((r) => {
      if (r?.required) {
        const palletValidators = [Validators.required];
        this[formGroup]?.get(r?.name).setValidators(palletValidators);
      } else {
        this[formGroup]?.get(r?.name).clearValidators();
      }
      this[formGroup]?.get(r?.name).updateValueAndValidity();
    })
  }
  editMode: boolean = false;
  ngOnInit(): void {
    this.id = this.route.snapshot?.params['id'];

    this.getBatchList()
    this.isTransport = localStorage.getItem('isTransport') === 'false' ? false : true
    this.consolidatuonDetailsform = this.formBuilder.group({
      port: [''],
      voyage: [''],
      jobNo: [''],
      plannedVessel: [''],
      shipment_Type: [''],
      shipping_line: [''],
      flightNo: [''],
      vehicleNo: ['']

    })
    // this.getPortMaster()
    this.getVesselVoyageList()

    this.getLocation();
    this.getCityList()
    this.getSystemTypeDropDowns();
    this.getShippingLineDropDown();
    this.getAir();
    this.getLand();
    this.editMode = false
    if (this.id) {
      this.editMode = true;
      this.getConsolidate()
    }
  }

  getConsolidate() {
    let payload = this.commonService?.filterList()
    if (payload?.query) payload.query = {
      "consolidationbookingId": this.id
    }
    this.commonService?.getSTList("consolidationbooking", payload)?.subscribe((res: any) => {
      this.consolidationbooking = res.documents[0];
      this.consolidatuonDetailsform = this.formBuilder.group({
        port: this.consolidationbooking?.portId,
        voyage: this.consolidationbooking?.voyage,
        plannedVessel: this.consolidationbooking?.vesselId,
        shipment_Type: this.consolidationbooking?.shipmentTypeId,
        shipping_line: this.consolidationbooking?.shippinglineId,
        flightNo: this.consolidationbooking?.flightId,
        vehicleNo: this.consolidationbooking?.vehicleId,
        jobNo: this.consolidationbooking?.batchId

      })
      this.setselect(this.consolidationbooking?.shipmentTypeId)
      this.CarrierChange()
      this.onShow()

    }
    )
  }
  onLocationSearch(e) {
    let payload = this._api?.filterList()
    const shipmentType = this.shipmentTypes.find(x => x.systemtypeId === this.consolidatuonDetailsform.value.shipment_Type)?.typeName;
    if (shipmentType === 'Air') {
      payload.query = {
        ...payload.query,
        status: true,
        "airPortname": {
          "$regex": e,
          "$options": "i"
        },
        // 'portDetails.portTypeName' :"Air" 
      }
      this._api.getSTList("airportmaster", payload)?.subscribe((res: any) => {
        this.portData = res?.documents?.map(x => ({
          portId: x.airportmasterId,
          portName: x.airPortname
        }));
      });
    } else if (shipmentType === 'Land') {
      this.portData = [...this.cityList]?.map(x => ({
        portId: x?.locationId ? x?.locationId : x?.cityId ? x?.cityId : x?.portId,
        portName: x?.locationName ? x?.locationName : x?.cityName ? x?.cityName : x?.portDetails?.portName,
        locationType: x?.portDetails?.portName ? 'port' : 'location'
      }));
    } else {
      payload.query = {
        ...payload.query,
        status: true,
        "portDetails.portName": {
          "$regex": e,
          "$options": "i"
        },
        "$and": [
          {
            "portDetails.portTypeName": {
              "$ne": "Air"
            }
          }
        ]
      }
      this._api.getSTList("port", payload)?.subscribe((res: any) => {

        this.portData = res?.documents?.map(x => ({
          portId: x.portId,
          portName: x.portDetails.portName
        }));

      });


    }

  }
  getShippingLineDropDown() {
    let payload = this.commonService?.filterList()
    if (payload?.query) payload.query = {
      "status": true
    }
    this._api
      ?.getSTList('shippingline', payload)
      ?.subscribe((res: any) => {
        this.shippingLineList = res?.documents
      });
  }
  getCityList() {
    let payload = this._api?.filterList()
    if (payload?.query) payload.query = {
      status: true,
    }
    this._api?.getSTList("city", payload).subscribe((data) => {
      this.cityList = data.documents || [];
    });
  }
  getshippingLineList() {
    return this.shippingLineList?.filter(ee => ee?.typeCategory === this.consolidatuonDetailsform?.value?.shipment_Type)
  }
  onCheck(evt, check, i) {
    if (evt.target.checked) {
      // let data = {
      //   ...check,
      //   isExemp: ((<HTMLInputElement>document.getElementById('exemp' + i)).value) || false,
      // }
      this.checkedList.push({ ...check });

    }
    else {
      let index1 = this.checkedList.findIndex(
        item => item?.enquiryitemId === check?.enquiryitemId
      )
      this.checkedList.splice(index1, 1)
    }
  }
  checkedList: any = []
  onCheckAll(evt) {
    this.checkedList = []
    if (evt.target.checked) {
      this.qrData?.forEach((element, index) => {
        element.isSelected = true
        this.checkedList.push({ ...element });
      })
    }
    else {
      this.qrData?.forEach((element) => {
        element.isSelected = false
        let index1 = this.checkedList.findIndex(
          item => item?.qrId === element?.qrId
        )
        this.checkedList.splice(index1, 1)

      })
    }

  }
  get f() {
    return this.consolidatuonDetailsform.controls;
  }
  assignContainer() {
    
    const modalRef = this.modalService.open(AssignContainerComponent, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
    modalRef.componentInstance.allContainer = this.consolidationbooking?.containerList?.map(item => String(item?.containermasterId)) || []
    modalRef.componentInstance.SaveNew?.subscribe((res: any) => {
      let containerArray = res.containerArray.map((con: any) => {
        return {
          ...con,
          volume: con.containerSize == '20' ? 33.2 : 67.7,
          availableVolume: con.containerSize == '20' ? 33.2 : 67.7,
          isAssigned: false
        }
      })
      containerArray = containerArray.sort(function (a, b) {
        return b.containerSize - a.containerSize
      })
      let totalVolofRecord: any = 0
      this.qrData = this.qrData.map((batch: any) => {
        return {
          ...batch,
          isContainerAssigned: batch?.isContainerAssigned ? batch?.isContainerAssigned : false
        }
      })

      let newCTRList = [];
      let totalVolofCTR: any = 0
      containerArray?.filter((x) => {
        totalVolofCTR += x?.availableVolume;
        if (this.qrData.find((y) => y?.assignContainer?.containermasterId === x?.containermasterId)) {
          newCTRList.push(this.qrData.find((z) => z?.assignContainer?.containermasterId === x?.containermasterId).assignContainer)
        } else {
          newCTRList.push(x)
        }
      })


      newCTRList?.forEach(container => {
        this.qrData?.forEach(batch => {
          if (batch?.isSelected === true) {
            if (batch?.isContainerAssigned == false) {
              if (batch?.volume < container?.availableVolume) {
                batch['assignContainer'] = container
                container['availableVolume'] = container?.availableVolume - batch?.volume
                batch['isContainerAssigned'] = true
                container['isAssigned'] = true
              }
            }
          }
        });
        let showError = 0
        this.qrData.forEach(element => {
          if (element.isSelected) {
            if (element?.isContainerAssigned) {
              totalVolofRecord += element?.volume
            }
            if (!element.isContainerAssigned) {
              showError += 1
            }
          }
        });
        if (showError != 0) {
          this.notification.create('error', `There are some packages are not filled into the container.`, '')
        }
      });
      this.setContainerList()
    }
    )
  }

  containerListForTable: any = []
  setContainerList() {
    let containerListForTable = []
    this.qrData.forEach(element => {
      if (element?.isContainerAssigned) {
        containerListForTable.push(element?.assignContainer)
      }
    })
    this.containerListForTable = containerListForTable.filter((item, index, self) =>
      index === self.findIndex((t) => t.containermasterId === item.containermasterId)
    );
  }
  onUnassigned(batch, index) {
    let data = { ...batch };
    this.qrData?.filter((element, i) => {
      if (index == i && element?.assignContainer?.availableVolume && element?.assignContainer?.containermasterId === data?.assignContainer?.containermasterId
      ) {
        element.assignContainer.availableVolume += Number(data?.volume);
      }
    });

    setTimeout(() => {
      delete batch.assignContainer;
      batch.isContainerAssigned = false;
      this.setContainerList();
    }, 0);

    // delete this.batchList[index]['assignedContainer']
  }
  getVessel() {
    let payload = this.commonService?.filterList()
    payload.size = Number(1000),
      payload.from = 0,
      payload.sort = { "desc": ['updatedOn'] }
    let mustArray = {};



    payload.query = mustArray
    this.commonService.getSTList('vessel', payload).subscribe((data) => {
      this.vesselData = data.documents;
    })
  }
  CarrierChange() {
    // this.getVesselVoyageList()
    this.getAir()
    this.getLand()
  }
  async getVesselVoyageList() {
    let payload = this.commonService?.filterList()
    if (payload?.query) payload.query = { status: true }
    await this._api?.getSTList('vessel', payload)
      ?.subscribe((res: any) => {
        this.voyageListData = res?.documents;
      });
  }
  setVoyageList: any = []
  setVoyage(e) {
    let vessel = this.voyageListData?.filter((x) => x?.vesselId == e)[0]?.voyage
    if (vessel?.length > 0) {
      this.setVoyageList = vessel?.filter((x) => x?.shipping_line == this.consolidatuonDetailsform.value.shipping_line)
      // this.quoteForm.controls.voyageNumber.patchValue(voyageNo);
    }
  }
  async getAir() {
    let payload = this.commonService?.filterList()
    if (payload?.query) payload.query = { status: true, "airlineId": this.consolidatuonDetailsform.value.shipping_line }
    await this._api?.getSTList('air', payload)
      ?.subscribe((res: any) => {
        this.flightList = res?.documents;
      });
  }
  async getLand() {
    let payload = this.commonService?.filterList()
    if (payload?.query) payload.query = { status: true, "typeCarrierId": this.consolidatuonDetailsform.value.shipping_line }
    await this._api?.getSTList('land', payload)
      ?.subscribe((res: any) => {
        this.vehicalList = res?.documents;
      });
  }
  getBatchList() {
    this.page = 1;
    this.fromSize = 1;
    var parameter = {
      "query": {
        "isExport": this.isExport,
        "enquiryDetails.basicDetails.loadType": {
          "$in": [
            'LCL', 'Loose'
          ]
        }
      },
      "sort": {
        "desc": ["createdOn"]
      },
      size: Number(10000),
      from: this.page - 1,
    }
    this._api.getSTList(Constant.BATCH, parameter)
      .subscribe((data: any) => {
        this.batchList = data.documents.map((batch: any) => {
          return {
            ...batch,
            palletDetails: batch?.enquiryDetails?.looseCargoDetails?.cargos
          }
        })
        this.batchList = this.batchList.sort(function (a, b) {
          return b.palletDetails[0]?.volumep - a.palletDetails[0]?.volumep
        })

        // let isEditBooking = this.batchList.filter(x => x.consolidateBookingCreated)

        // if (isEditBooking.length > 0) {
        //   let id = ''
        //   id = isEditBooking[0]?.consolidationBookingId
        //   this.getAssignedContainer(id)
        // }





      });


  }



  alreadyAssignedContainer: any = []
  getAssignedContainer(id) {
    let payload = this.commonService.filterList()
    payload.query = {
      "batchId": id
    }

    this.commonService.getSTList('container', payload)?.subscribe((res: any) => {
      this.alreadyAssignedContainer = res?.documents;

    })
  }

  getLocation() {
    let payload = this.commonService?.filterList()
    if (payload?.query) payload.query = {
      masterType: {
        "$in": ['YARD', 'CFS', 'ICD']
      },
      "status": true
    }
    this.commonService?.getSTList('location', payload).subscribe((res: any) => {
      this.yardList = res?.documents;
    });
  }
  getContainerData(event) {
    let payload = this.commonService?.filterList()
    payload.query = {
      "yardName": this.yardList.find(yard => yard?.locationId === event)?.locationName,
      "status": true,
      "containerStatusId": true,
      "containerStatus": {
        "$in": [
          "Available",
          "Release"
        ]
      }
    }
    if (payload?.size) payload.size = Number(this.size)
    if (payload?.from) payload.from = this.page - 1;
    this.commonService.getSTList('containermaster', payload)?.subscribe((res: any) => {
      this.containerList = res?.documents;

    })

  }
  openADD() {
    const modalRef = this.modalService.open(AddContainerComponent, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
    modalRef.componentInstance.batchId = this.route.snapshot.params['id']
    modalRef.componentInstance.batchDetail = this.batchDetail
    modalRef.componentInstance.getList.subscribe((res: any) => {
      if (res) {
        this.getContainerData(this.consolidatuonDetailsform.value.yard);
      }
    })
  }

  type: any = ''
  updatebookingid: any = ''
  closeResult: any;
  assignedContainers: any = []


  onSave() {
    // Check if all required fields are filled
    this.submitted = true;
    if (this.consolidatuonDetailsform.invalid) {
      this.notification.create('error', 'Please fill all required fields.', '');
      return;
    }


    // Filter out selected and container-assigned QR data
    let finalQrData = this.qrData.filter(element => element.isSelected && element.isContainerAssigned);


    // Prepare post data
    let postData = finalQrData.map(element => ({ ...element }));




    // this.batchDetails.enquiryDetails.looseCargoDetails.cargos =
    //   this.batchDetails?.enquiryDetails?.looseCargoDetails?.cargos?.map((x) => {
    //     if (!x || !postData) return x; // Handle undefined values safely

    //     const count = postData.filter(d => d._id === x._id).length; // Ensure proper comparison

    //     return {
    //       ...x,
    //       assignedUnits: (x.assignedUnits || 0) + count
    //     };
    //   }) || [];


      this.batchDetails.enquiryDetails.looseCargoDetails.cargos =
      this.batchDetails?.enquiryDetails?.looseCargoDetails?.cargos?.map((x) => {
            postData.find((y) => y._id == x._id)
        
               return {
          ...x,
          assignedUnits: (x.assignedUnits || 0) + (postData.find((y) => y._id == x._id)?.assignQty || 0)
               };
      })
    console.log(this.batchDetails?.enquiryDetails?.looseCargoDetails?.cargos)

    // Call batch update service
    // this.commonService.batchUpdate('qr/batchupdate', postData).subscribe((res: any) => {

    // Update assigned containers
    this.assignedContainers = [];
    postData.forEach(item => {
      const existingContainer = this.assignedContainers.find(container => container?.containerNo === item?.assignContainer?.containerNo);
      if (!existingContainer) {
        this.assignedContainers.push({
          ...item?.assignContainer,
          isSelected: true
          // Add other properties as needed
        });
      }
    });

    // Prepare payload for consolidation booking
    let payload = {
      portId: this.consolidatuonDetailsform.value.port,
      portName: this.portData.find(x => x.portId == this.consolidatuonDetailsform.value.port)?.portDetails?.portName,
      voyage: this.consolidatuonDetailsform.value.voyage,
      orgId: this.commonFunction.getAgentDetails().orgId,
      containerList: this.assignedContainers,
      items: postData,
      shipmentTypeId: this.consolidatuonDetailsform.value.shipment_Type,
      shipmentTypeName: this.shipmentTypes.find(x => x.systemtypeId == this.consolidatuonDetailsform.value.shipment_Type)?.typeName,
      shippinglineId: this.consolidatuonDetailsform.value.shipping_line,
      carrierId: this.consolidatuonDetailsform.value.shipping_line,
      carrierName: this.shippingLineList?.find((x) => x.shippinglineId === this.consolidatuonDetailsform.value.shipping_line)?.name,
      flightId: this.consolidatuonDetailsform.value.flightNo,
      vehicleId: this.consolidatuonDetailsform.value.vehicleNo,
      flightNo: this.flightList?.find((x) => x.airId === this.consolidatuonDetailsform.value.flightNo)?.flight || '',
      vehicleNo: this.vehicalList?.find((x) => x.landId === this.consolidatuonDetailsform.value.vehicleNo)?.vehicleLicence || '',
      vesselId: this.consolidatuonDetailsform.value.plannedVessel,
      vesselName: this.voyageListData?.find((x) => x.vesselId === this.consolidatuonDetailsform.value.plannedVessel)?.vesselName,
      status: true,
      isExport: this.isExport
    };


    // Add consolidation booking
    let url;
    if (this.editMode) {
      url = this.commonService?.UpdateToST(`consolidationbooking/${this.consolidationbooking?.consolidationbookingId}`, payload)
    } else {
      url = this.commonService?.addToST("consolidationbooking", payload)
    }
    url?.subscribe((res: any) => {
      let updateContainer = this.assignedContainers.map(element => ({
        ...element,
        containerStatus: 'Reserved'
      }));




      let batchPayload = {
        ...this.batchDetails
      };

      this.commonService?.UpdateToST(`batch/${batchPayload?.batchId}`, batchPayload).subscribe();

      // Batch update container statuses
      this.commonService.batchUpdate('containermaster/batchupdate', updateContainer).subscribe();

      // Prepare batch container data for insertion
      let PostInsertLstBatchContainerArray = []
      let PostUpdateLstBatchContainerArray = []
      this.assignedContainers.filter(element => {
        let weightItem: any;

        let weightCount = 0;
        let volumeCount = 0;
        let quantityCount = 0;
        let cbmCount = 0;

        res.items.forEach((y) => {
          if (y.assignContainer.containermasterId === element?.containermasterId) {
            let postAssignContainer = postData.find((x)=>x?.assignContainer?.containermasterId === element?.containermasterId)
            weightItem = y;
            weightCount += Number(y.weight);
            volumeCount += Number(y.volume);
            quantityCount += Number(postAssignContainer?.assignQty);
            cbmCount += Number(y.cbm);
          }
        });

        if (this.consolidationbooking?.containerList?.find((x) => x?.containermasterId === element?.containermasterId)) {

          PostUpdateLstBatchContainerArray.push({
            batchwiseGrouping: (res?.items ?? []).reduce((acc, resb) => {
              if (resb?.batchId && !acc.some(item => item.batchId === resb?.batchId)) {
                acc.push({
                  batchId: resb?.batchId,
                  batchNo: resb?.batchNo
                });
              }
              return acc;
            }, []),
            consolidationBookingId: res.consolidationbookingId,
            consolidationbookingNo: res?.consolidationbookingNo,
            containerId: '',
            batchId: res.consolidationbookingId,
            batchNo: res?.consolidationbookingNo,
            vesselName: '',
            tankStatusName: element?.tankStatus,
            tankStatusId: element?.tankStatusId,
            voyageNo: this.consolidatuonDetailsform.value.voyage,
            shippingLineId: '',
            shippingLineName: '',
            mastercontainerId: element?.containermasterId,
            containerNumber: element?.containerNo,
            containerTypeId: element?.containerTypeId,
            containerDescription: 'asas',
            containerTypeName: element?.containerType,
            containerType: element?.containerType,
            containerStatus: element?.containerStatus,
            imoType: '',
            imoTypeId: '',
            package: quantityCount?.toString() || "0.00",
            packageType: weightItem?.packageType || " ",
            netWeight: weightCount?.toString() || "0",
            unitGross: 'KG',
            grossWeight: weightCount?.toString() || "0",
            cbm: volumeCount?.toString() || "0",
            unit: element?.weightUOM || 'KG',
            isoContainerCode: '',
            tareWeight: '',
            sealNo: element?.sealNo,

            rfidNo: '',
            cargoType: res?.cargoType,
            cargoTypeId: res?.cargoType,
            evgmNumber: '',
            evgmDate: null,
            blNumber: '',
            blDate: null,
            shippingBillNumber: '',
            sbNo: '',
            sbDate: null,
            bondNumber: '',
            igmNumber: '',
            statusFlag: '',
            statusFlagId: '',
            status: true,
            depotOut: '',
            depotDate: null,
            depotDateName: '',
            icdIn: null,
            icdInName: '',
            icdOut: null,
            icdOutName: '',
            factoryIn: null,
            factoryInName: '',
            factoryOut: null,
            factoryOutName: '',
            terminalIn: null,
            terminalInName: '',
            terminalOut: null,
            terminalOutName: '',
            mtyValidity: '',
            mtyReturn: '',
            cfsIn: null,
            cfsOut: null,
            railOut: null,
            dischargeDate: null,
            reject: null,
            rejectName: '',
            sobDate: '',
            arrivalDate: null,
            deliveryDate: null,
            override_orgId: '1',
            override_tId: 'true',
            containerInUse: true,
            "isExport": this.isExport,
            size: element?.containerSize,
            height: element?.containerHeight,
            containerHeight: element?.containerHeight || '',
          })
        } else {

          PostInsertLstBatchContainerArray.push({
            batchwiseGrouping: (res?.items ?? []).reduce((acc, resb) => {
              if (resb?.batchId && !acc.some(item => item.batchId === resb?.batchId)) {
                acc.push({
                  batchId: resb?.batchId,
                  batchNo: resb?.batchNo
                });
              }
              return acc;
            }, []),
            consolidationBookingId: res.consolidationbookingId,
            consolidationbookingNo: res?.consolidationbookingNo,
            containerId: '',
            batchId: res?.consolidationbookingId,
            batchNo: res?.consolidationbookingNo,
            vesselName: '',
            tankStatusName: element?.tankStatus,
            tankStatusId: element?.tankStatusId,
            voyageNo: this.consolidatuonDetailsform.value.voyage,
            shippingLineId: '',
            shippingLineName: '',
            mastercontainerId: element?.containermasterId,
            containerNumber: element?.containerNo,
            containerTypeId: element?.containerTypeId,
            containerDescription: 'asas',
            containerTypeName: element?.containerType,
            containerType: element?.containerType,
            containerStatus: element?.containerStatus,
            imoType: '',
            imoTypeId: '',



            package: quantityCount?.toString() || "0.00",
            packageType: weightItem?.packageType || " ",
            netWeight: weightCount?.toString() || "0",
            unitGross: 'KG',
            grossWeight: weightCount?.toString() || "0",
            cbm: volumeCount?.toString() || "0",
            unit: element?.weightUOM || 'KG',


            isoContainerCode: '',
            tareWeight: '',
            sealNo: element?.sealNo,
            rfidNo: '',
            cargoType: res?.cargoType,
            cargoTypeId: res?.cargoType,
            evgmNumber: '',
            evgmDate: null,
            blNumber: '',
            blDate: null,
            shippingBillNumber: '',
            sbNo: '',
            sbDate: null,
            bondNumber: '',
            igmNumber: '',
            statusFlag: '',
            statusFlagId: '',
            status: true,
            depotOut: '',
            depotDate: null,
            depotDateName: '',
            icdIn: null,
            icdInName: '',
            icdOut: null,
            icdOutName: '',
            factoryIn: null,
            factoryInName: '',
            factoryOut: null,
            factoryOutName: '',
            terminalIn: null,
            terminalInName: '',
            terminalOut: null,
            terminalOutName: '',
            mtyValidity: '',
            mtyReturn: '',
            cfsIn: null,
            cfsOut: null,
            railOut: null,
            dischargeDate: null,
            reject: null,
            rejectName: '',
            sobDate: '',
            arrivalDate: null,
            deliveryDate: null,
            override_orgId: '1',
            override_tId: 'true',
            containerInUse: true,
            "isExport": this.isExport,
            size: element?.containerSize,
            height: element?.containerHeight,
            containerHeight: element?.containerHeight || '',
          })
        }

      });

      // Batch insert containers
      if (PostInsertLstBatchContainerArray.length > 0) {
        this.commonService.batchInsert('container/batchinsert', PostInsertLstBatchContainerArray).subscribe();
      }
      this.notification.create('success', 'Added Successfully', '');
      setTimeout(() => {
        this.router.navigate(['/consolidation-booking/list']);
      }, 1000);
    });
    // });
  }

  onClose() {
    this.router.navigate(['/consolidation-booking/list'])
  }
  portId: any = ''
  voyageId: any = ''

  onChangeContainer() {
    const container = this.containerList?.find(ct => ct?.containermasterId === this.consolidatuonDetailsform.value.containerType);
    const container40FtCapacity = 67.7; // in cubic meters
    const container20FtCapacity = 33.2; // in cubic meters
    this.totalVolume = 0;
    this.exceeding40ftVolume = 0;
    if (this.consolidatuonDetailsform.value?.batchNo?.length) {
      this.consolidatuonDetailsform.value?.batchNo?.forEach((batchId => {
        const batch = this.batchList.find(b => b?.batchId === batchId)?.enquiryDetails?.looseCargoDetails?.cargos ?? [];
        if (batch?.length) {
          batch?.filter((cargo) => {
            if (cargo?.pkgname === 'Pallets') {
              if (cargo?.Pallettype === 'Pallets (non specified size)') {
                this.totalVolume += cargo?.volumep ?? 0
              } else {
                this.totalVolume += cargo?.volumeselect ?? 0
              }

            } else {
              this.totalVolume += cargo?.volumeb ?? 0
            }
          })
        }

      }))
    }
    if (container?.containerType?.startsWith('40')) {
      if (this.totalVolume > container40FtCapacity) {
        this.exceeding40ftVolume = this.totalVolume - container40FtCapacity
      }

    }
    if (container?.containerType?.startsWith('20')) {
      if (this.totalVolume > container20FtCapacity) {
        this.exceeding40ftVolume = this.totalVolume - container20FtCapacity
      }
    }

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
  getSystemTypeDropDowns() {
    let payload = this.commonService?.filterList()

    if (payload) payload.query = {
      status: true,
      "typeCategory": "carrierType"
    }

    this.commonService?.getSTList("systemtype", payload)?.subscribe((res: any) => {
      this.shipmentTypes = res?.documents?.filter(x => (x.typeCategory === "carrierType" && x?.typeName?.toLowerCase() !== "rail"));


    })

  }
}

