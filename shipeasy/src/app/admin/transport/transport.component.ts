import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core'; 
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as Constant from 'src/app/shared/common-constants';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import * as XLSX from 'xlsx'; 
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
  selector: 'app-transport',
  templateUrl: './transport.component.html',
  styleUrls: ['./transport.component.scss']
})
export class TransportComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  @Input() public value: string; 
 
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
    'transportinquiryNo', 
    'carrierStatus',
    'loadType',
    'origin.locationName',
    'origin.etd',
    'destination.locationName',
    'destination.eta',
    'biddingDueDate',
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
    public commonService: CommonService,
    public loaderService: LoaderService,
    public router: Router,
    private cognito: CognitoService
  ) { }
 
  isTransport:boolean = false;
  ngOnInit(): void {   
        if(localStorage.getItem(Constant.UserDetails)){
          this.userData  = JSON.parse(this.commonFunctions.get(localStorage.getItem(Constant.UserDetails))) 
        }
      
    this.isTransport = localStorage.getItem('isTransport') === 'true' ? true : false ;
 
    this.getEnquiryList();
  }

  navigateToNewTab(element) {
    let url = '/rfq/list/'+`${element?.transportinquiryId}`+'/details' 
    this.router.navigate([url]);
  }
  navigateToNewTab1(element) {
    let url = `${element?.transportinquiryId}`+'/details'  
    window.open(window.location.href +'/'+url );
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
      "query": {
         'shippinglineId' : this.userData?.userData?.driverId 
      },
      "sort": {
        "desc": ["createdOn"]
      },
      size:this.pageSize,
      from: this.from,
    }
 

    this.commonService
      .getSTList('transportinquiry', parameter)
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
    
    var parameter = {
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
    this.commonService
      .getSTList('transportinquiry', parameter)
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

    this.commonService
      .getSTList('transportinquiry', parameter)
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
  viewDetails(e){
    this.router.navigate(['/rfq/list/'+e?.transportinquiryId+'/details'])
  }
 
 
}

