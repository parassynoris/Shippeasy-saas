import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { enquiry } from './data';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as Constant from 'src/app/shared/common-constants';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import * as XLSX from 'xlsx';
import { EnquiryService } from './service/enquiry.service';
import { Subject } from 'rxjs';
import { CommonService } from '../../services/common/common.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { LoaderService } from 'src/app/services/loader.service';
import { ApiSharedService } from 'src/app/shared/components/api-service/api-shared.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { Router } from '@angular/router';
import { CognitoService } from 'src/app/services/cognito.service';
import { MatDrawer } from '@angular/material/sidenav';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { Enquiry, EnquiryItem, Remark } from 'src/app/models/enquiry';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
interface SearchCriteria {
  enquiryNo?: { $regex: string };
  "basicDetails.batchType"?: { $regex: string; $options: string };
  "basicDetails.stcQuotationNo"?: { $regex: string; $options: string };
  "routeDetails.locationName"?: { $regex: string; $options: string };
  "routeDetails.shippingLineName"?: { $regex: string; $options: string };
  "cargoDetail.productName"?: { $regex: string; $options: string };
  "basicDetails.notifyPartyName"?: { $regex: string; $options: string };
  "basicDetails.consigneeName"?: { $regex: string; $options: string };
  "basicDetails.invoicingPartyName"?: { $regex: string; $options: string };
  "basicDetails.forwarderName"?: { $regex: string; $options: string };
  "basicDetails.shipperName"?: { $regex: string; $options: string };
  "basicDetails.tankTypeName"?: { $regex: string; $options: string };
  "basicDetails.moveTypeName"?: { $regex: string; $options: string };
  enquiryStatus?: { $regex: string; $options: string };
}
@Component({
  selector: 'app-enquiry',
  templateUrl: './enquiry.component.html',
  styleUrls: ['./enquiry.component.scss'],
})
export class EnquiryComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  @Input() public value: string;
  enquiryData = enquiry.enquiryRow;
  selectedShipmentTypes: string[] = [];
  enquiryDate: any;
  order: boolean = true;
  toalLength: number;
  size = 1000;
  page = 1;
  count = 0;
  enquiryList: Enquiry[] = [];
  fromSize: number = 1;
  enquiryNo: any;
  shipmentTermName: string;
  moveTypeName: string;
  tankTypeName: string;
  shipperName: string;
  forwarderName: string;
  invoicingPartyName: string;
  consigneeName: string;
  notifyPartyName: string;
  productName: string;
  shippingLineName: string;
  status: string;
  stcQuotationNo: any;
  location: any;
  globalSearch: string;
  enquirylist1: any;
  enquiryStatus: any;
  costItemList: EnquiryItem[] = [];
  filterBody = this.apiService.body
  remarksArray: Remark[] = [];
  LoginPerson: string = '';
  shouldArray: SearchCriteria[];
  _gc=GlobalConstants
  displayedColumns = [

    '#',
    'enquiryNo', 
    'enquiryStatus',
    'basicDetails.enquiryDate', 
    "basicDetails.ShipmentTypeName",
    "basicDetails.loadType",
    "routeDetails.loadPortName",
    "routeDetails.destPortName",
    'basicDetails.shipperName',
    'basicDetails.forwarderName', 
    'basicDetails.consigneeName',
    'cargoDetail.productName', 
    'action',
  ];

  displayedColumns1 = this.displayedColumns.map((x, i) => x + '_' + i);
  toggleFilters = true;
  filtersModel = [];
  filterKeys = {};


  collapseColumn_shipperName: boolean = false;
  collapseColumn_Forwarder: boolean = false;
  collapseColumn_Invoice: boolean = false;
  collapseColumn_Consignee: boolean = false;
  collapseColumn_Product: boolean = false;
  @ViewChild(MatDrawer) drawer: MatDrawer | any;
  dataSource = new MatTableDataSource();
  pagenation = [20, 50, 100];
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  userData: any;

  constructor(
    public commonFunctions: CommonFunctions,
    public apiService: ApiSharedService,
    public translate: TranslateService,
    public modalService: NgbModal,
    public notification: NzNotificationService,
    public enquiryService: EnquiryService,
    public commonService: CommonService,
    public loaderService: LoaderService,
    public router: Router,
    private cognito: CognitoService
  ) {

  }



  sort(colName) {

    if (this.order) {
      if (colName.split('.')[1]) {
        this.enquiryList = this.enquiryList.sort((a, b) => (a[colName.split('.')[0]][colName.split('.')[1]] < b[colName.split('.')[0]][colName.split('.')[1]] ? -1 : 1));
      } else {
        this.enquiryList = this.enquiryList.sort((a, b) => (a[colName] < b[colName] ? -1 : 1));
      }

    } else {
      if (colName.split('.')[1]) {
        this.enquiryList = this.enquiryList.sort((a, b) => (a[colName.split('.')[0]][colName.split('.')[1]] > b[colName.split('.')[0]][colName.split('.')[1]] ? -1 : 1));
      } else {
        this.enquiryList = this.enquiryList.sort((a, b) => (a[colName] > b[colName] ? -1 : 1));
      }
    }
    this.order = !this.order;
  }
  calculator() {
    window.open('Calculator:///');
  }
  getTooltipMessage(enquiryStatus: string, quotationCreateStatus: boolean): string {
    switch (enquiryStatus) {
      case 'Inquiry Created':
        return quotationCreateStatus
          ? 'Quotation created, submit to customer.'
          : 'Please create Quotation.';
      case 'Inquiry Received':
        return 'Please Add Inquiry Details.';
      default:
        return '';
    }
  }
  
  shouldShowTooltip(status: string): boolean {
    return status === 'Inquiry Created' || status === 'Inquiry Received';
  }
  
  isTransport:boolean = false;
  ngOnInit(): void { 
    this.isTransport = localStorage.getItem('isTransport') === 'true' ? true : false ;

    if(this.isTransport){
      this.displayedColumns = [
        '#',
        'enquiryNo', 
        'enquiryStatus',
        'basicDetails.enquiryDate', 
        "basicDetails.ShipmentTypeName",
        "basicDetails.loadType", 
        "routeDetails.loadPlaceName",
        "routeDetails.locationName",
        'basicDetails.shipperName', 
        'basicDetails.consigneeName',
        'cargoDetail.productName', 
        'action',
      ];
    }else{
      this.displayedColumns = [

        '#',
        'enquiryNo',
        // 'basicDetails.stcQuotationNo',
        'enquiryStatus',
        'basicDetails.enquiryDate', 
        "basicDetails.ShipmentTypeName",
        "basicDetails.loadType",
        "routeDetails.loadPortName",
        "routeDetails.destPortName",
        'basicDetails.shipperName', 
        'basicDetails.consigneeName',
        'cargoDetail.productName', 
        'action',
      ];
    }
    //  this.LoginPerson  = this.commonFunctions.getCognitoUserDetail()?.attributes?.email
    this.cognito.getagentDetails()?.subscribe((resp) => {
      if (resp != null) {
        this.LoginPerson = resp?.attributes?.email;
      }
    })
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.userData = resp
      }
    })
   
    this.getEnquiryList();
  }

  changeStatus(data) {
    this.commonService
      .UpdateToST('enquiry/' + data?.enquiryId,
        { ...data, status: !data?.status, apiType: 'status' },
      )
      .subscribe(
        (res: any) => {
          if (res) {
            this.notification.create(
              'success',
              'Status Updated Successfully',
              ''
            );
            setTimeout(() => {
              this.loaderService.hidecircle()
              this.getEnquiryList();

            }, 1000);


          }
        },
        (error) => {
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort1;
    // Define custom sorting function for the column
    this.dataSource.sortingDataAccessor = (item:any, property) => {
      switch (property) {
        case 'basicDetails.ShipmentTypeName': return item?.basicDetails?.ShipmentTypeName || 'aa';
        // Add additional cases for other properties if needed
        default: return item[property];
      }
    };
  }

  pageNumber = 1;
  pageSize = 20;
  from = 0;
  totalCount = 0;

  onPageChange(event){
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.from = event.pageIndex*event.pageSize ;
    this.getEnquiryList();
  }

  public getEnquiryList() {
    this.loaderService.showcircle();
    this.enquirylist1 = []
    this.enquiryList = []
    // this.page = 1;
    // this.fromSize = 1;
    var parameter = {
      "project": [],
      "query": {},
      "sort": {
        "desc": ["createdOn"]
      },
      size:this.pageSize,
      from: this.from,
    }
    if(this.selectedShipmentTypes?.length){
      parameter.query = {
        ...parameter.query,
        'basicDetails.ShipmentTypeName' : this.selectedShipmentTypes?.[0]
      }
    }
    if(this.isTransport){
      parameter.query = {
        ...parameter.query,
        'basicDetails.ShipmentTypeName' : 'Land'
      }
    }else{
      parameter.query = {
        ...parameter.query, 
        "$and": [
          {
            "basicDetails.ShipmentTypeName": {
              "$ne": 'Land'
            }
          }
        ]
      }
    }

    this.commonService
      .getSTList(Constant.ENQUIRY_LIST, parameter)
      .subscribe((data: any) => {
        this.enquirylist1 = data.documents
        this.enquiryList = data.documents.slice(0, Number(this.size));
        this.dataSource = new MatTableDataSource(
          data?.documents?.map((s: any,index) => {
            return{
              ...s,
              id:index+1+this.from
            }
          })
        );
        // this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1;
        this.loaderService.hidecircle();
        this.getSORT()
        this.toalLength = data.totalCount;
        this.count = data.documents.length;
        

      }, (error) => {
        this.loaderService.hidecircle();
        this.notification?.create('error', error?.error?.error?.message, '');
      });
  }
  getSORT(){
    this.dataSource.sort = this.sort1;
    // Define custom sorting function for the column
    this.dataSource.sortingDataAccessor = (item:any, property) => {
      switch (property) {
        case 'basicDetails.enquiryDate': return item?.basicDetails?.enquiryDate || '';
        case 'basicDetails.ShipmentTypeName': return item?.basicDetails?.ShipmentTypeName || '';
        case 'basicDetails.loadType': return item?.basicDetails?.loadType || '';
        case 'routeDetails.loadPortName': return item?.routeDetails?.loadPortName || '';
        case 'routeDetails.destPortName': return item?.routeDetails?.destPortName || ''; 
        case 'basicDetails.shipperName': return item?.basicDetails.shipperName || ''; 
        case 'basicDetails.forwarderName': return item?.basicDetails?.forwarderName || ''; 
        case 'basicDetails.consigneeName': return item?.basicDetails?.consigneeName || '';  
        default: return item[property];
      }
    };
  }
  clear() {
    this.enquiryDate = '';
    this.enquiryNo = '';
    this.shipmentTermName = '';
    this.moveTypeName = '';
    this.tankTypeName = '';
    this.shipperName = '';
    this.forwarderName = '';
    this.invoicingPartyName = '';
    this.consigneeName = '';
    this.notifyPartyName = '';
    this.productName = '';
    this.shippingLineName = '';
    this.stcQuotationNo = '';
    this.location = '';
    this.status = '';
    this.getEnquiryList();
  }

  filter(e) {
    this.size = e.target.value;
    this.fromSize = 1;
    this.getEnquiryList();
  }
  next() {
    if (this.toalLength > this.count) {
      this.getPaginationData('next');
    }
  }
  prev() {
    if (this.page > 0 && this.page !== 1) {
      this.getPaginationData('prev');
    }
  }
  search() {

    let mustArray = {};


    if (this.enquiryNo) {
      mustArray['enquiryNo'] = {
        "$regex": this.enquiryNo.toLowerCase(),
        "$options": "i"
      }
    }
    if (this.shipmentTermName) {
      this.shipmentTermName = this.shipmentTermName.trim()
      mustArray['basicDetails.batchType'] = {
        "$regex": this.shipmentTermName.toLowerCase(),
        "$options": "i"
      };
    }
    if (this.enquiryDate) {
      mustArray['basicDetails.enquiryDate'] = {
        "$gt": this.enquiryDate.substring(0, 10) + 'T00:00:00.000Z',
        "$lt": this.enquiryDate.substring(0, 10) + 'T23:59:00.000Z'
      };
    }
    if (this.moveTypeName) {
      this.moveTypeName = this.moveTypeName.trim()
      mustArray["basicDetails.moveTypeName"] = {
        "$regex": this.moveTypeName.toLowerCase(),
        "$options": "i"
      };
    }


    if (this.tankTypeName) {
      mustArray["basicDetails.tankTypeName"] = {
        "$regex": this.tankTypeName.toLowerCase(),
        "$options": "i"
      };
    }
    if (this.shipperName) {
      mustArray["basicDetails.shipperName"] = {
        "$regex": this.shipperName.toLowerCase(),
        "$options": "i"
      };
    }
    if (this.forwarderName) {
      mustArray["basicDetails.forwarderName"] = {
        "$regex": this.forwarderName.toLowerCase(),
        "$options": "i"
      };
    }
    if (this.invoicingPartyName) {
      mustArray["basicDetails.invoicingPartyName"] = {
        "$regex": this.invoicingPartyName.toLowerCase(),
        "$options": "i"
      };
    }
    if (this.consigneeName) {
      mustArray["basicDetails.consigneeName"] = {
        "$regex": this.consigneeName.toLowerCase(),
        "$options": "i"
      };
    }
    if (this.notifyPartyName) {
      mustArray["basicDetails.notifyPartyName"] = {
        "$regex": this.notifyPartyName.toLowerCase(),
        "$options": "i"
      };
    }
    if (this.productName) {
      mustArray["cargoDetail.productName"] = {
        "$regex": this.productName.toLowerCase(),
        "$options": "i"
      };
    }
    if (this.shippingLineName) {
      mustArray["routeDetails.shippingLineName"] = {
        "$regex": this.shippingLineName.toLowerCase(),
        "$options": "i"
      };
    }
    if (this.stcQuotationNo) {
      mustArray["basicDetails.stcQuotationNo"] = {
        "$regex": this.stcQuotationNo.toString().toLowerCase(),
        "$options": "i"
      };
    }
    if (this.location) {
      mustArray["routeDetails.locationName"] = {
        "$regex": this.location.toLowerCase(),
        "$options": "i"
      };
    }
    if (this.status) {
      mustArray["status"] = {
        "$regex": this.status.toLowerCase(),
        "$options": "i"
      };
    }
    if (this.enquiryStatus) {
      mustArray["enquiryStatus"] = {
        "$regex": this.enquiryStatus.toLowerCase(),
        "$options": "i"
      };
    }

    var parameter = {
      "project": [],
      "query": { ...mustArray },
      "sort": {
        "desc": ["createdOn"]
      },
      size: Number(this.size),
      from: 0,
    }

    if(this.isTransport){
      parameter.query = {
        ...parameter.query,
        'basicDetails.ShipmentTypeName' : 'Land'
      }
    }else{
      parameter.query = {
        ...parameter.query, 
        "$and": [
          {
            "basicDetails.ShipmentTypeName": {
              "$ne": 'Land'
            }
          }
        ]
      }
    }

    this.commonService
      .getSTList(Constant.ENQUIRY_LIST, parameter)
      .subscribe((data: any) => {
        this.enquiryList = data.documents;
        this.toalLength = data.totalCount;
        this.count = data.documents.length;
        this.fromSize = 1;
        this.getSORT()
      });
  }
  clearGloble() {
    this.globalSearch = '';
    this.clear()
  }
  searchGlobal() {


    let query = this.globalSearch

    let shouldArray = [];
    shouldArray.push(
      { "enquiryNo": { "$regex": query } },
      { "basicDetails.batchType": { "$regex": query, "$options": "i" } },
      { "basicDetails.stcQuotationNo": { "$regex": query, "$options": "i" } },
      { "routeDetails.locationName": { "$regex": query, "$options": "i" } },
      { "routeDetails.shippingLineName": { "$regex": query, "$options": "i" } },
      { "cargoDetail.productName": { "$regex": query, "$options": "i" } },
      { "basicDetails.notifyPartyName": { "$regex": query, "$options": "i" } },
      { "basicDetails.consigneeName": { "$regex": query, "$options": "i" } },
      { "basicDetails.invoicingPartyName": { "$regex": query, "$options": "i" } },
      { "basicDetails.forwarderName": { "$regex": query, "$options": "i" } },
      { "basicDetails.shipperName": { "$regex": query, "$options": "i" } },
      { "basicDetails.tankTypeName": { "$regex": query, "$options": "i" } },
      { "basicDetails.moveTypeName": { "$regex": query, "$options": "i" } },
      { "enquiryStatus": { "$regex": query, "$options": "i" } }
    )



    var parameter :any = {
      "project": [],
      "query": {
        "$or": shouldArray
      },
      "sort": {
        "desc": ["createdOn"]
      },
      size: Number(this.size),
      from: 0,
    }

    if(this.isTransport){
      parameter.query = {
        ...parameter.query,
        'basicDetails.ShipmentTypeName' : 'Land'
      }
    }else{
      parameter.query = {
        ...parameter.query, 
        "$and": [
          {
            "basicDetails.ShipmentTypeName": {
              "$ne": 'Land'
            }
          }
        ]
      }
    }
    this.commonService.getSTList('enquiry', parameter)
      .subscribe((data: any) => {
        this.enquiryList = data.documents?.map((s: any,index) => {
          return{
            ...s,
            id:index+1
          }
        });
        this.toalLength = data.totalCount;
        this.count = data.documents.length;
        this.fromSize = 1;
        this.getSORT()
      });
  }

  getPaginationData(type: any) {
    this.fromSize =
      type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;

    var parameter = {
      "project": [],
      "query": {
      },
      "sort": {
        "desc": ["createdOn"]
      },
      size: Number(this.size),
      from: this.fromSize - 1,
    }

    if(this.isTransport){
      parameter.query = {
        ...parameter.query,
        'basicDetails.ShipmentTypeName' : 'Land'
      }
    }else{
      parameter.query = {
        ...parameter.query, 
        "$and": [
          {
            "basicDetails.ShipmentTypeName": {
              "$ne": 'Land'
            }
          }
        ]
      }
    }

    this.commonService
      .getSTList(Constant.ENQUIRY_LIST, parameter)
      .subscribe((data: any) => {
        this.enquiryList = data.documents;
        this.toalLength = data.totalCount;
        this.page = type === 'prev' ? this.page - 1 : this.page + 1;
        this.count =
          type === 'prev'
            ? this.toalLength === this.count
              ? this.count - (this.toalLength % Number(this.size))
              : this.count - data.documents.length
            : this.count + data.documents.length;
      });
  }

  removeRow(content1, enquiry) {
    this.modalService
      .open(content1, {
        backdrop: 'static',
        keyboard: false,
        centered: true,
        size: 'sm',
        ariaLabelledBy: 'modal-basic-title',
      })
      .result.then(
        (result) => {
          if (result === 'yes') {
            let deleteBody = `enquiry+ ${enquiry?.enquiryId}`
            this.commonService.deleteST(deleteBody).subscribe((data) => {
              if (data) {
                this.notification.create('success', 'Deleted Successfully', '');
                this.clear();
              }
            });
          }
        },

      );
  }

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.enquiryList.map((row: any) => {
      storeEnquiryData.push({
        'Inquiry No': row.enquiryNo,
        'Quote No': row.basicDetails?.stcQuotationNo,
        'Inquiry Status': row.enquiryStatus,
        'Inquiry Date': this.commonService.formatDateForExcelPdf(row.basicDetails?.enquiryDate),
        'Job Type': row.basicDetails?.batchType,
        'Move Type': row.basicDetails?.moveTypeName,
        'Tank Type': row.basicDetails?.tankTypeName,
        'AGENT Location': row.routeDetails?.locationName,
        Shipper: row.basicDetails?.shipperName,
        Forwarder: row.basicDetails?.forwarderName,
        'Invoice Party': row.basicDetails?.invoicingPartyName,
        Consignee: row.basicDetails?.consigneeName,
        Product: row.productDetails?.productName,
        'Shipping Line': row.routeDetails?.shippingLineName,
        Status: row.status ? "Active" : "In Active",
      });
    });
    const myworksheet: XLSX.WorkSheet =
      XLSX.utils.json_to_sheet(storeEnquiryData);
    const myworkbook: XLSX.WorkBook = {
      Sheets: { data: myworksheet },
      SheetNames: ['data'],
    };
    const excelBuffer: any = XLSX.write(myworkbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const fileName = 'enquiry.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  exportAsExcelFile1(): void {
    let storeEnquiryData = [];
    this.enquiryList.map((row: any) => {
      storeEnquiryData.push({
        'Inquiry No': row.enquiryNo,
        'Inquiry Status': row.enquiryStatus,
        'Inquiry Date': this.commonService.formatDateForExcelPdf(row.basicDetails?.enquiryDate),
        'Freight Type': row.basicDetails?.ShipmentTypeName,
        'Load Type': row.basicDetails?.loadType,
        'Port Of Loading': row.routeDetails?.loadPortName,
        'Port Of Destination': row.routeDetails?.destPortName,
        'Shipper': row.basicDetails?.shipperName,
        'Forwarder': row.basicDetails?.forwarderName,
        'Consignee': row.basicDetails?.consigneeName,
        'Product': row.cargoDetail?.productName,
      });
    });
    const myworksheet: XLSX.WorkSheet =
      XLSX.utils.json_to_sheet(storeEnquiryData);
    const myworkbook: XLSX.WorkBook = {
      Sheets: { data: myworksheet },
      SheetNames: ['data'],
    };
    const excelBuffer: any = XLSX.write(myworkbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const fileName = 'enquiry.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  routeBatch(e) {
    this.router.navigate([`batch/list/add/${e}/details`]);
  }
  openPDF() {
    var prepare = [];
    this.enquiryList.forEach(e => {
      var tempObj = [];
      tempObj.push(e.enquiryNo);
      tempObj.push(e.basicDetails?.stcQuotationNo);
      tempObj.push(e.enquiryStatus);
      tempObj.push(this.commonService.formatDateForExcelPdf(e.basicDetails?.enquiryDate));
      tempObj.push(e.basicDetails?.batchType);
      tempObj.push(e.basicDetails?.moveTypeName);
      tempObj.push(e.basicDetails?.tankTypeName);
      tempObj.push(e.routeDetails?.locationName);
      tempObj.push(e.basicDetails?.shipperName);
      tempObj.push(e.basicDetails?.forwarderName);
      tempObj.push(e.basicDetails?.invoicingPartyName);
      tempObj.push(e.basicDetails?.consigneeName);
      tempObj.push(e.productDetails?.productName);
      tempObj.push(e.routeDetails?.shippingLineName);
      tempObj.push(e.status ? "Active" : "In Active");
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [700, 610]);
    autoTable(doc, {
      head: [['Inquiry No.', 'Quote No.', 'Inquiry Status', 'Inquiry Date', 'Job Type', 'Move Type', 'Tank Type', 'AGENT Location', 'Shipper', 'Forwarder', 'Invoice Party', 'Consignee', 'Product', 'Shipping Line', 'Status']],
      body: prepare,
      columnStyles: {
        2: { cellWidth: 36 },
      }
    });
    doc.save('Inquiry' + '.pdf');
  }
  getRemarks(res) {
    var parameter = {
      "project": [],
      "query": {
        "enquiryId": res
      }
    }
    this.commonService.getSTList('comment', parameter).subscribe((res: any) => {
      res?.documents.filter((x) => {
        this.remarksArray.push(x)
      })
      return this.remarksArray
    });

  }
  getChargesBatch(res) {

    var parameter = {
      "project": [],
      "query": {
        "enquiryId": res
      }
    }
    this.costItemList = [];
    this.commonService.getSTList('enquiryitem', parameter).subscribe((result) => {
      this.costItemList = result?.documents
      return result?.documents
    });
  }
  replicaEnquiry(enquiry) {
    this.getChargesBatch(enquiry?.enquiryId)
    this.getRemarks(enquiry?.enquiryId)
    let enquiryBody = [];
    enquiry.enquiryId = "";
    enquiry.enquiryNo = "";
    if (enquiry?.enquiryStatus === 'Job Created')
      enquiry.enquiryStatus = 'Inquiry Created'
    enquiryBody.push({ ...enquiry, apiType: 'status' });
    this.commonService.addToST(Constant.ENQUIRY_LIST, enquiryBody).subscribe((res: any) => {
      if (res) {
        if (this.costItemList.length > 0) {
          let updateData = []
          this.costItemList.forEach(element => {
            updateData.push({
              ...element,
              batchId: '',
              moveNumber: '',
              batchNo: '',
              enquiryNumber: res?.enquiryNo || '',
              enquiryId: res?.enquiryId,
              enquiryitemId: ''
            })
          });
          this.commonService.addToST('enquiryitem/batchinsert', updateData).subscribe();
        }
        if (this.remarksArray.length > 0) {
          let urlComment = 'comment/batchinsert'
          let payload = []
          this.remarksArray.filter((x) => {
            payload.push({
              ...x, enquiryId: res?.enquiryId,
              commentId: ''
            })
          })
          this.commonService.addToST(urlComment, payload).subscribe();
        }
        setTimeout(() => {
          this.getEnquiryList();
          this.notification.create('success', 'Cloned Successfully', '');

        }, 1000);

      }
    })
  }


  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); 
    this.filterKeys = {};
    let shouldArray=[]
    this.displayedColumns.forEach((each, ind) => {
      if (each !== '#' &&  each !== 'action') {
        this.filterKeys[each] = {
          "$regex": filterValue?.toLowerCase(),
          "$options": "i"
        }
         shouldArray.push({ [each]: { "$regex": filterValue?.toLowerCase(), "$options": "i" } },)
      }
    });
    
    var parameter :any = {
      "project": [],
      "query": {  "$or": shouldArray},
      "sort": {
        "desc": ["createdOn"]
      },
      size:this.pageSize,
      from: 0,
    }
    if(!filterValue){
      this.pageNumber = 1;
      this.pageSize = 20;
      this.from = 0;
      this.totalCount = 0;
      this.getEnquiryList();
      return;
    }

    if(this.isTransport){
      parameter.query = {
        ...parameter.query,
        'basicDetails.ShipmentTypeName' : 'Land'
      }
    }else{
      parameter.query = {
        ...parameter.query, 
        "$and": [
          {
            "basicDetails.ShipmentTypeName": {
              "$ne": 'Land'
            }
          }
        ]
      }
    }

    this.commonService
      .getSTList(Constant.ENQUIRY_LIST, parameter)
      .subscribe((data: any) => {
        this.enquiryList = data.documents;
        this.dataSource = new MatTableDataSource(
          data?.documents?.map((s: any,index) => {
            return{
              ...s,
              id:index+1
            }
          })
        );
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1;
        this.toalLength = data.totalCount;
        this.count = data.documents.length;
        this.getSORT()
      });
  }
  export() {
    const modifiedTableData = this.dataSource?.filteredData;
    const tableColumns = this.displayedColumns;
    const tableData = modifiedTableData || [];
    const columnsToHide = ['status', 'action'];
    const actualColumns = this.displayedColumns;
    this.commonFunctions.exportToExcel(
      tableColumns,
      tableData,
      columnsToHide,
      'Enquiry',
      this.displayedColumns,
      actualColumns
    );
  }

  searchColumns() {
    this.filterKeys = {};
    this.filtersModel.forEach((each, ind) => {
      if (each) {
        if (this.displayedColumns[ind] == 'basicDetails.enquiryDate') {
          this.filterKeys['basicDetails.enquiryDate'] = {
            "$gt": each.substring(0, 10) + 'T00:00:00.000Z',
            "$lt": each.substring(0, 10) + 'T23:59:00.000Z'
          };
        } else {
          this.filterKeys[this.displayedColumns[ind]] = {
            "$regex": each.toLowerCase(),
            "$options": "i"
          }
        } 
      }

    });

    var parameter = {
      "project": [],
      "query": { ...this.filterKeys },
      "sort": {
        "desc": ["createdOn"]
      },
      size: Number(10000),
      from: 0,
    }

    if(this.isTransport){
      parameter.query = {
        ...parameter.query,
        'basicDetails.ShipmentTypeName' : 'Land'
      }
    }else{
      parameter.query = {
        ...parameter.query, 
        "$and": [
          {
            "basicDetails.ShipmentTypeName": {
              "$ne": 'Land'
            }
          }
        ]
      }
    }
    
    this.commonService
      .getSTList(Constant.ENQUIRY_LIST, parameter)
      .subscribe((data: any) => {
        this.enquiryList = data.documents;
        this.dataSource = new MatTableDataSource(
          data?.documents?.map((s: any,index) => {
            return{
              ...s,
              id:index+1
            }
          })
        );
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1;
        this.getSORT()
      });



  }

  clearFilters() {
    this.filtersModel = [];
    this.filterKeys = {};
    this.getEnquiryList();
  }

  navigateToNewTab(element) {
    let url = (element?.enquiryStatus == 'Pending' || element?.enquiryStatus == 'Inquiry Draft' || element?.enquiryStatus =='Inquiry Received') ? '/enquiry/list/'+element?.enquiryId+'/edit' : '/enquiry/list/'+element?.enquiryId+'/quote'
    
    this.router.navigate([url]);
  }
  navigateToNewTab1(element) {
    let url = (element?.enquiryStatus == 'Pending' ||element?.enquiryStatus == 'Inquiry Draft' || element?.enquiryStatus =='Inquiry Received') ? element?.enquiryId+'/edit' : element?.enquiryId+'/quote'
    window.open(window.location.href +'/'+url ); 
  }

  shipperList:any;
  openShipper(content,id){ 

    let payload = this.commonService.filterList()
    payload.query = {
      "partymasterId":id,
    }
    this.commonService.getSTList("partymaster", payload).subscribe((res: any) => {
      this.shipperList = res?.documents[0];  
    });

    const modalRef = this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
    // modalRef.componentInstance.id = id;
  }

  basecontentUrl: string;
  sendQuotation(data){

    let reportpayload = { "parameters": { "enquiryId": data.enquiryId } };
    let url='quotation';
    this.commonService.pushreports(reportpayload,url).subscribe({
      next: (res: any) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result as string;
          let baseContent = base64String.split(",");
          this.basecontentUrl = baseContent[1];
          this.mail(data , this.basecontentUrl , url)
        };
        reader.readAsDataURL(blob)
      }
    })
  }
  mail(data , bloburl? ,reportName?) {
    let fileName = reportName +'.pdf'
    let attachment = [{ "content": bloburl, "name": fileName }]
   
    
        let userData = this.userData

        let payload = this.commonService.filterList()
        payload.query = {
          "partymasterId": data?.basicDetails?.shipperId
        }
        this.commonService.getSTList("partymaster", payload).subscribe((res) => {
          let emaildata = `Please check attachments `
    
          let payload = {
            sender: {
              name: userData?.roleName,
              email: userData.createdBy
            },
            to: [{
              name: data?.paymentFromName,
              email: res.documents[0].primaryMailId,
            }],
            "attachment": attachment,
            textContent: `${emaildata}`,
            subject: "Quotation",
          }
          this.apiService.sendEmail(payload).subscribe(
            (result) => {
              if (result.status == "success") {
                this.notification.create('success', 'Email Send Successfully', '');
              }
              else {
                this.notification.create('error', 'Email not Send', '');
              }
            }
          );
        }); 
  }


  onCheckboxChange(event: any, shipmentType: string) {
    if (event.target.checked) {
      const otherType = shipmentType === 'Ocean' ? 'Air' : 'Ocean';
      (document.getElementById(otherType) as HTMLInputElement).checked = false;
      this.selectedShipmentTypes = [shipmentType];
    } else {
      this.selectedShipmentTypes = this.selectedShipmentTypes.filter(type => type !== shipmentType);
    }
    this.getEnquiryList();
  }

  navigateLogs(e){
    this.router.navigate(['enquiry/audit-logs'], { queryParams: { id: e?.enquiryId, collection : "enquiry" ,url : this.router.url} }); 
  }
}

