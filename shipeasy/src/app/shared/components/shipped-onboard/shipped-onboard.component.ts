import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ApiSharedService } from '../api-service/api-shared.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { SharedService } from 'src/app/shared/services/shared.service';
import * as Constant from 'src/app/shared/common-constants';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import * as XLSX from "xlsx";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from 'src/app/admin/principal/api.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { differenceInCalendarDays } from 'date-fns';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { CommonFunctions } from '../../functions/common.function';
import { DatePipe } from '@angular/common';
import { CommonService } from 'src/app/services/common/common.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Container } from 'src/app/models/container-master';
import { Batch } from 'src/app/models/charges';

@Component({
  selector: 'app-shipped-onboard',
  templateUrl: './shipped-onboard.component.html',
  styleUrls: ['./shipped-onboard.component.scss']
})
export class ShippedOnboardComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  toalLength: any;
  Documentpdf: any;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  checkedList: any = [];
  sobDate: any;
  globalSearch: string;
  submitted: boolean = false;
  batchId: string = '';
  containerList: Container[] = [];
  vessel_name: string;
  voyage_no: string;
  shipping_line: string;
  batch_no: string;
  bl_no: string;
  container_no: string;
  container_type: string;
  igmNo: object;
  igmDate: any;
  sob_date: string;
  dd_date: string;
  addChargesForm: FormGroup;
  isSelected: boolean = false;
  isExport: boolean = false;
  batchNoList: Batch;
  userData: any;
  dataSource = new MatTableDataSource();
  pagenation = [10, 20, 50, 100];
  charges: FormArray
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  urlParam: any;
  isShow: boolean = false;
  constructor(
    private fb: FormBuilder,
    private sharedService: ApiSharedService,
    private route: ActivatedRoute,
    public router: Router,
    public notification: NzNotificationService,
    private modalService: NgbModal,
    public _api: ApiService,
    private commonService: CommonService,
    private cognito: CognitoService,
    private datepipe: DatePipe) {
      this.route.params.subscribe((params) => (this.urlParam = params));
      this.isShow = this.urlParam?.access == 'show' ? true : false;;
    this.fb = fb;
    this.sharedService = sharedService;
    this.route = route;
    this.router = router;
    this.notification = notification;
    this.modalService = modalService;
    this._api = _api;
    this.commonService = commonService;
    this.cognito = cognito;
    this.datepipe = datepipe
    this.batchId = this.route.snapshot.params['id'];
    this.isExport = localStorage.getItem('isExport') === 'false' ? false : true;
  }
  displayedColumns = [
    '#',
    'vesselName',
    'voyageNo',
    'shippingLine',
    'batchNo',
    'blNo',
    'containerNo',
    'containerType',
    'sobDate', 
  ];
  disabledPastDate = (startValue: Date): boolean => {
    if (!startValue || !new Date()) {
      return false;
    }
    return startValue.getTime() <= new Date().getTime();
  };
  generatePreadvice() {
    let reportpayload = { "parameters": { "batchId": this.route.snapshot.params['id'] } };
    let url = 'preAdvice'
  
    this.commonService.pushreports(reportpayload, url)?.subscribe({
      next: (res: any) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        let temp = URL.createObjectURL(blob);
        this.Documentpdf = temp;
        const pdfWindow = window.open(temp);
        pdfWindow.print();
      }
    })
  }
  ngOnInit(): void {
    if(!this.isExport){
      this.displayedColumns = [
        '#',
        'vesselName',
        'voyageNo',
        'shippingLine',
        'batchNo',
        'blNo',
        'containerNo',
        'containerType', 
        'dischargeDate', 
      ];
    }
    this.addChargesForm = this.fb.group(
      {
        charges: this.fb.array([])
      },
    );
    this.charges = this.addChargesForm.get('charges') as FormArray
    this.getBatchList()
    this.getContainer();
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.userData = resp
      }
    })
  }
  form;
  getControls() {
    return (this.addChargesForm.get('charges') as FormArray).controls;
  }
  getBatchList() {

    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      "batchId": this.route.snapshot.params['id']
    }
    this._api.getSTList('batch', payload)
      ?.subscribe((data: any) => {
        this.batchNoList = data.documents[0];
        // this.dataSource = new MatTableDataSource(
        //   data?.documents?.map((s: any) => s)
        // );
        // this.dataSource.paginator = this.paginator;
        // this.dataSource.sort = this.sort1;
      });
  }
  // get charges() {
  //   return this.addChargesForm.controls["charges"] as FormArray;
  // }
  setFormArray() {
    this.containerList?.map((res => {
      this.charges.push(this.fb.group({
        containerId: [res?.containerId],
        vesselName: [res?.vesselName],
        voyageNo: [res?.voyageNo],
        shippingLineName: [res?.shippingLineName],
        batchNo: [res?.batchNo],
        blNumber: [res?.blNumber],
        containerNumber: [res?.containerNumber],
        containerType: [res?.containerType],
        blDate: [res?.blDate],
        igmNumber: [res?.igmNumber],
        sobDate: [res?.sobDate],
        errorMsg: [''],
        dischargeDate: [res?.dischargeDate]
      }))
    }))

    this.dataSource = ((this.addChargesForm.controls.charges as FormArray).value)
    // Needed for future reference
    // if (this.containerList) {
    //   this.addChargesForm = this.fb.group(
    //     {
    //       charges: this.fb.array(this.containerList?.map(res => {
    //         let groupData = {
    //           containerId: [res?.containerId],
    //           vesselName: [res?.vesselName],
    //           voyageNo: [res?.voyageNo],
    //           shippingLineName: [res?.shippingLineName],
    //           batchNo: [res?.batchNo],
    //           blNumber: [res?.blNumber],
    //           containerNumber: [res?.containerNumber],
    //           containerType: [res?.containerType],
    //           blDate: [res?.blDate],
    //           igmNumber: [res?.igmNumber],
    //           sobDate: [res?.sobDate],
    //           errorMsg: [''],
    //           dischargeDate: [res?.dischargeDate]
    //         };


    //         this.form = this.fb.group(groupData);
    //         console.log(this.form);

    //         return this.form;
    //       }
    //       ))
    //     },
    //   );
    // }
  }
  getContainer() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      batchId: this.batchId,
    }

    this.commonService.getSTList('container', payload)?.subscribe((res: any) => {
      this.containerList = res.documents;
      this.toalLength = res.totalCount;
      this.count = res.documents.length;
      this.setFormArray()
    });
  }

  next() {
    if (this.toalLength > this.count) {
      this.getPaginationData('next')
    }
  }

  prev() {
    if (this.page > 0) {
      this.getPaginationData('prev')
    }
  }

  filter(e) {
    this.size = e.target.value;
    this.fromSize = 1;
    this.getContainer()
  }

  getPaginationData(type: any) {
    this.fromSize = type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;

    let payload = this.commonService.filterList()
    payload.query = {
      batchId: this.batchId,
    }
    payload.size = Number(this.size),
      payload.from = this.fromSize - 1,
      this.commonService.getSTList('container', payload)?.subscribe(data => {
        this.containerList = data.documents;
        this.toalLength = data.totalCount;
        this.page = type === 'prev' ? this.page - 1 : this.page + 1;
        this.count = type === 'prev' ? this.toalLength === this.count ? this.count - (this.toalLength % Number(this.size)) : this.count - data.documents.length : this.count + data.documents.length
        this.setFormArray()
      })
  }

  search() {


    let mustArray = {};
    mustArray['batchId'] = this.batchId

    if (this.vessel_name) {
      mustArray['vesselName'] = {
        "$regex": this.vessel_name,
        "$options": "i"
      }
    }


    if (this.voyage_no) {
      mustArray['voyageNo'] = {
        "$regex": this.voyage_no,
        "$options": "i"
      }
    }

    if (this.shipping_line) {
      mustArray['shippingLineName'] = {
        "$regex": this.shipping_line,
        "$options": "i"
      }
    }
    if (this.batch_no) {
      mustArray['batchNo'] = {
        "$regex": this.batch_no,
        "$options": "i"
      }
    }
    if (this.bl_no) {
      mustArray['blNumber'] = {
        "$regex": this.bl_no,
        "$options": "i"
      }
    }
    if (this.container_no) {
      mustArray['containerNumber'] = {
        "$regex": this.container_no,
        "$options": "i"
      }
    }
    if (this.container_type) {
      mustArray['containerType'] = {
        "$regex": this.container_type,
        "$options": "i"
      }
    }
    if (this.igmNo) {
      mustArray['igmNumber'] = {
        "$regex": this.igmNo,
        "$options": "i"
      }
    }
    if (this.sob_date) {
      mustArray['sobDate'] = {
        "$gt": this.sob_date.substring(0, 10) + 'T00:00:00.000Z',
        "$lt": this.sob_date.substring(0, 10) + 'T23:59:00.000Z'
      }
    }
    if (this.dd_date) {
      mustArray['dischargeDate'] = {
        "$gt": this.dd_date.substring(0, 10) + 'T00:00:00.000Z',
        "$lt": this.dd_date.substring(0, 10) + 'T23:59:00.000Z'
      }
    }

    let payload = this.commonService.filterList()
    payload.query = mustArray
    payload.size = Number(this.size),
      payload.from = 0,
      payload.sort = { "desc": ['updatedOn'] }


    this.commonService.getSTList('container', payload)?.subscribe((data) => {
      this.containerList = data.documents;
      this.toalLength = data.totalCount;
      this.count = data.documents.length
      this.fromSize = 1
      this.setFormArray()
    })
  }

  clear() {
    this.vessel_name = '';
    this.voyage_no = '';
    this.shipping_line = '';
    this.batch_no = '';
    this.bl_no = '';
    this.container_no = '';
    this.container_type = '';
    this.sob_date = '';
    this.dd_date = '';
    this.getContainer()
  }
  checkValid(id) {
    let data = this.checkedList?.filter(x => x?.containerId === id)[0]?.sobDate
    if (data) {
      return true;
    }
  }

  disabledEtaDate = (current: Date): boolean => {

    let date = '';
    this.charges?.controls.forEach(element => {
      this.containerList?.forEach((element1) => {
        if (element?.value?.containerId === element1?.containerId) {
          date = element1?.blDate
        }
      })

    })

    if (date) {
      return (
        differenceInCalendarDays(
          new Date(current),
          new Date(date)
        ) < 0
      );
    }
    else { return false; }

  };
  checkDateValid(bl, sob) {
    if (!bl && !sob)
      return false
    if (new Date(bl) > new Date(sob)) {
      return true
    }
    return false
  }
  blDate(date) {
    if (date) {
      return date
    } else {
      return '2000-01-01'
    }

  }
  disabledEndDateForEnquiryValidDate = (endValue: Date): boolean => {


    return new Date(endValue).getTime() <= new Date().getTime();
  };

  onSave() {
    let updatedData = []
    this.charges?.controls.forEach(element => {
      this.containerList?.forEach((element1) => {
        if (element?.value?.containerId === element1?.containerId) {
          updatedData.push({
            ...element1,
            sobDate: element.value.sobDate,
            dischargeDate: element.value.dischargeDate,
            vesselName: this.isExport ? this.batchNoList?.quotationDetails?.vesselName :  this.batchNoList?.enquiryDetails?.routeDetails?.vesselName,
            voyageNo: this.isExport ? this.batchNoList?.quotationDetails?.voyageNumber :  this.batchNoList?.enquiryDetails?.routeDetails?.voyageNumber,
            shippingLineId: this.isExport ?  this.batchNoList?.quotationDetails?.carrierId :   this.batchNoList?.enquiryDetails?.routeDetails?.shippinglineId,
            shippingLineName: this.isExport ?  this.batchNoList?.quotationDetails?.carrierName :   this.batchNoList?.enquiryDetails?.routeDetails?.shippinglineName,
          })
        }
      })

    })
    if (updatedData.length === 0) {
      return false
    }

    this.commonService.batchUpdate(Constant.MULTI_UPDATE_CONTAINER, updatedData)?.subscribe((data: any) => {
      if (data) {
        setTimeout(() => {
          this.notification.create(
            'success',
            'Saved Successfully',
            ''
          );
          this.ngOnInit()
        }, 1000);

      }
    });
  }
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase();


    // this.dataSource.filterPredicate = (data, filter) => {
    //   return JSON.stringify(data).toLowerCase().includes(filter);
    // };

    // this.dataSource.filter = filterValue;
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  onClose() {
    this.router.navigate(['/batch/list']);
  }
  export() {
    let excel = [];
    if (this.isExport) {
      this.containerList?.map(x => {
        excel.push({
          containerType: x.containerType,
          cargoType: x.cargoType,
          containerNumber: x.containerNumber,
          batchId: x.batchId,
          blDate: this.commonService.formatDateForExcelPdf(x.blDate),
          blNumber: x.blNumber,
          bondNumber: x.bondNumber,
          depotOut: x.depotOut,
          doDate: this.commonService.formatDateForExcelPdf(x.doDate),
          evgmNumber: x.evgmNumber,
          factoryIn: x.factoryIn,
          factoryOut: x.factoryOut,
          grossWeight: x.grossWeight,
          icdIn: x.icdIn,
          icdOut: x.icdOut,
          igmNumber: x.igmNumber,
          imoType: x.imoType,
          mastercontainerId: x.mastercontainerId,
          netWeight: x.netWeight,
          reject: x.reject,
          shippingBillNumber: x.shippingBillNumber,
          terminalIn: x.terminalIn,
          sobDate: x.sobDate,

        })
      })
    }
    if (!this.isExport) {
      this.containerList?.map(x => {
        excel.push({
          "vessel": this.isExport ? this.batchNoList?.quotationDetails?.vesselName :  this.batchNoList?.enquiryDetails?.routeDetails?.vesselName,
          "voyage": this.isExport ? this.batchNoList?.quotationDetails?.voyageNumber :  this.batchNoList?.enquiryDetails?.routeDetails?.voyageNumber,
          shippingLineId: this.isExport ?  this.batchNoList?.quotationDetails?.carrierId :   this.batchNoList?.enquiryDetails?.routeDetails?.shippinglineId,
          shippingLineName: this.isExport ?  this.batchNoList?.quotationDetails?.carrierName :   this.batchNoList?.enquiryDetails?.routeDetails?.shippinglineName,
          batchNo: x.batchNo,
          blNumber: x.blNumber,
          containerNumber: x.containerNumber,
          containerType: x.containerType,
          igmNumber: x.igmNumber,
          igmDate: x.igmDate,
          DischargeDate: this.datepipe.transform(x.dischargeDate, 'dd-mm-YYYY')
        })
      })
    }




    const myworksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excel);
    const myworkbook: XLSX.WorkBook = {
      Sheets: { data: myworksheet },
      SheetNames: ["data"],
    };
    const fileName = "sob.xlsx";
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  onCheckAll(evt) {
    this.isSelected = !this.isSelected
    if (evt.target.checked) {
      this.charges?.controls.forEach((element) => {
        this.checkedList.push(element);
      })
    }
    else {
      this.checkedList = []
    }
  }
  onCheck(evt, check) {
    if (evt.target.checked) {
      this.checkedList.push(check);
    }
    else {
      let index = this.checkedList.findIndex(
        item => item.value?.containerId === check.value?.containerId
      )
      this.checkedList.splice(index, 1)
    }
  }

  OnApply() {
    if (this.checkedList.length > 0) {
      this.charges?.controls.forEach((element, index) => {
        this.checkedList.forEach((element1) => {
          if (element1?.value?.containerId === element?.value?.containerId) {

            if (this.isExport) {
              this.addChargesForm.controls.charges['controls'][index].controls.sobDate.setValue(this.sobDate)
            } else {
              this.addChargesForm.controls.charges['controls'][index].controls.dischargeDate.setValue(this.sobDate)
            }
          }
        })
      })
      this.submitted = true
    }
    else {
      this.notification.create(
        'error',
        'Please select any container',
        ''
      );
    }
  }
  DeleteContainer(deletecontainer, container) {
    this.modalService
      .open(deletecontainer, {
        backdrop: 'static',
        keyboard: false,
        centered: true,
        size: '',

        ariaLabelledBy: 'modal-basic-title',
      })
      .result.then(
        (result) => {
          if (result === 'yes') {
            let deleteBody = 'container/' + container
            this._api
              .deleteST(deleteBody)
              ?.subscribe((data) => {
                if (data) {
                  this.notification.create(
                    'success',
                    'Deleted Successfully',
                    ''
                  );
                  this.getContainer();
                }
              });
          }
        }
      );
  }

  openPDF() {
    var prepare = [];
    this.containerList.forEach(e => {
      var tempObj = [];
      tempObj.push(e.vesselName);
      tempObj.push(e.voyageNo);
      tempObj.push(e.shippingLineName);
      tempObj.push(e.batchNo);
      tempObj.push(e.blNumber);
      tempObj.push(e.containerNumber);
      tempObj.push(e.containerType);
      if (this.isExport) {
        tempObj.push(this.commonService.formatDateForExcelPdf(e.sobDate));
      } else {
        tempObj.push(e.imoNo);
        tempObj.push(this.commonService.formatDateForExcelPdf(e.imoDate));
        tempObj.push(this.commonService.formatDateForExcelPdf(e.dischargeDate));
      }

      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [297, 210]);
    autoTable(doc, {
      head: [['Vessel Name', 'Voyage No', 'Shipping Line', 'Job No', 'BL No', 'Container No', 'Container Type',
        this.isExport ? '' : 'IMO No', this.isExport ? '' : 'IMO Date', this.isExport ? 'SOB Date' : 'Discharge Date']],
      body: prepare
    });
    doc.save('sob' + '.pdf');
  }

  clearGloble() {
    this.globalSearch = '';
    this.clear()
  }
  searchGlobal() {
    let query = this.globalSearch

    let shouldArray = [];
    shouldArray.push(
      { "vesselName": { "$regex": query, "$options": "i" } },
      { "voyageNo": { "$regex": query, "$options": "i" } },
      { "shippingLineName": { "$regex": query, "$options": "i" } },
      { "batchNo": { "$regex": query, "$options": "i" } },
      { "blNumber": { "$regex": query, "$options": "i" } },
      { "containerNumber": { "$regex": query, "$options": "i" } },
      { "containerType": { "$regex": query, "$options": "i" } },
      { "sobDate": { "$regex": query, "$options": "i" } },
      { "dischargeDate": { "$regex": query, "$options": "i" } }
    )



    var parameter = {
      "project": [],
      "query": {
        batchId: this.batchId,
        "$or": shouldArray
      },
      "sort": {
        "desc": ["updatedOn"]
      },
      size: Number(this.size),
      from: 0,
    }
    this.sharedService.getContainerList(parameter)
      ?.subscribe((data: any) => {
        this.containerList = data.documents;
        this.toalLength = data.totalCount;
        this.count = data.documents.length;
        this.setFormArray()
      });
  }
  filterBody = this._api.body;

  sendEmail() {
    if (this.containerList?.length === 0) {
      return false
    }
    let tankNumber = []
    let containers = []
    this.containerList.filter((x) => {
      tankNumber.push(x?.containerNumber)
      containers.push({
        "tankno": x?.containerNumber,
        "shipper": this.batchNoList?.enquiryDetails?.basicDetails?.shipperName,
        "pol": this.batchNoList?.enquiryDetails?.routeDetails?.loadPortName || '',
        "pod": this.batchNoList?.enquiryDetails?.routeDetails?.destPortName || '',
        "vessel": this.isExport ? this.batchNoList?.quotationDetails?.vesselName :  this.batchNoList?.enquiryDetails?.routeDetails?.vesselName,
        "voyage": this.isExport ? this.batchNoList?.quotationDetails?.voyageNumber :  this.batchNoList?.enquiryDetails?.routeDetails?.voyageNumber,
        "carrier": this.batchNoList?.routeDetails?.finalShippingLineName || this.batchNoList?.quotationDetails?.carrierName,
        "sob": x?.sobDate,
        "booking": x?.booking || '',
        "eta": x?.eta || '',
      })

    })



    let payload = this.commonService.filterList()
    payload.query = {
      "partymasterId": this.batchNoList?.enquiryDetails?.basicDetails?.shipperId
    }

    this._api.getSTList("partymaster", payload)?.subscribe((res) => {
      if (res) {
        let payload = {
          "to": [ 
            {
                  name: res.documents[0]?.name,
                  email: res.documents[0]?.primaryMailId,
                } 
          ],
          "templateId": 173,
          batchId :   this.route.snapshot.params['id'],
          "params": {
            "containersno": tankNumber.toString(),
            "moveNo": this.batchNoList?.moveNo?.toString() || '',
            "carrierBookingNo": '',
            "shippername": res.documents[0].name,
            "shipperaddress": res.documents[0].addressInfo?.address + ' ' +
              res.documents[0].addressInfo?.cityName + ' ' +
              res.documents[0].addressInfo?.stateName,
            "vessel": this.isExport ? this.batchNoList?.quotationDetails?.vesselName :  this.batchNoList?.enquiryDetails?.routeDetails?.vesselName,
            "voyage": this.isExport ? this.batchNoList?.quotationDetails?.voyageNumber :  this.batchNoList?.enquiryDetails?.routeDetails?.voyageNumber,
            "loadPlaceName": this.batchNoList?.enquiryDetails?.routeDetails?.loadPlaceName || '',
            "date": this.batchNoList?.routeDetails?.ata,
            "Container": containers
          }

        }

        // let payload = {
        //   sender: {
        //     name: "SHIPEASY USER",
        //     email: this.userData.createdBy
        //   },
        //   to: [{
        //     name: res.documents[0]?.name,
        //     email: res.documents[0]?.primaryMailId,
        //   }
        //   ,{
        //     name: "SHIPEASY INAPP",
        //     email:'inappadmin@yopmail.com',
        //   }],

        //   textContent: `Dear Sir/Madam,
        //   Thank you for choosing SHIPEASY as your preferred carrier. Pleased to advise that below ISO Tank container/s has been shipped on board per vessel 
        //   ${this.batchNoList?.routeDetails?.finalVesselName || this.batchNoList?.plannedVesselName}
        //    VOY ${this.batchNoList?.routeDetails?.finalVoyageId || this.batchNoList?.plannedVoyageId}
        //   sailed from ${this.batchNoList?.loadPlaceName} on ${this.batchNoList?.routeDetails?.ata}
        //   `,
        //   subject: `SOB – TANK NO.-${tankNumber.toString()} MOVE NO.-${this.batchNoList?.moveNo.toString()} CARRIER BOOKING NO. SHIPPER NAME-${ res.documents[0].name}`,

        // }

        this._api.sendEmail(payload).subscribe(
          (res) => {
            if (res.status == "success") {
              this.notification.create('success', 'Email Send Successfully', '');
            }
            else {
              this.notification.create('error', 'Email not Send', '');
            }
          }
        );
      }
    });
  }

}
