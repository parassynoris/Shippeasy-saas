import { Component, OnInit, Input, TemplateRef, ViewChild } from '@angular/core';
import { ApiSharedService } from 'src/app/shared/components/api-service/api-shared.service';
import { BaseBody } from '../../smartagent/base-body';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/services/common/common.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { SystemType } from 'src/app/models/cost-items';
import { format } from 'date-fns'
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { ApiService } from '../../principal/api.service';
import * as Constant from 'src/app/shared/common-constants';
import jsPDF from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable'
import * as XLSX from "xlsx";
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
import { DatePipe } from '@angular/common';
import { MyData } from 'src/app/models/Vessel-voyage';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { DomSanitizer } from '@angular/platform-browser';
import { ScheduleReportComponent } from './schedule-report/schedule-report.component';
import { name } from '@azure/msal-angular/packageMetadata';
@Component({
  selector: 'app-bold-report-list',
  templateUrl: './bold-report-list.component.html',
  styleUrls: ['./bold-report-list.component.scss']
})
export class BoldReportListComponent implements OnInit {
  @Input() financeModule = false;
  boldList: SystemType[] = [];
  toalLength: number;
  baseBody: BaseBody = new BaseBody();
  city: string;
  countryName: string;
  email: string;
  fromSize: number = 1;
  phone: string;
  addressname: any;
  size = 10;
  page = 1;
  systemIdToUpdate;
  reportType: any;
  groupOfComapny: any = '';
  count = 0;
  allBatchStatus = [];
  bankList: any = [];
  allPaymentStatus = [];
  flag: any = false;
  allInvoiceStatus = [];
  date: string;
  submitted: any = false;
  addCountryForm: FormGroup;
  dataSource: any = new MatTableDataSource();
  pagenation = [10, 20, 50, 100];
  bookingNo: any
  monthSelected: any;
  selectedFinancialYear: any;
  dueDate: any
  invoiceStatus: any
  paymentStatus: any
  status: any
  isExport: boolean = false
  isTransport: boolean = false
  containerreport: any
  voyage: any
  vessel: any
  bookingStatus: any
  vendor: any
  shippingLine: any
  startDate = '';
  endDate = '';
  invoicingParty: any
  freightTerms: any;
  quotarlyDate: any
  inquiryStatus: any;
  bankName: any = '';
  cosignee: any = [];
  shipper = '';
  totalPL: any;
  totalPLBuy: any;
  totalPLSell: any;
  EndDate;
  StartDate;
  partyMasterNameList: any = [];
  consigneeList: any = [];
  shipperList: any = [];
  batchData: any = [];
  footerColumns: string[] = ['totalLabel', 'buyEstimateAmount', 'sellEstimateAmount', 'profitLoss'];
  sblChecked: boolean = false;
  isJobClose: boolean = false;
  portLabel: string = 'Port';
  selectedTypeData: any = {}
  portLabel1: string = 'Port of Loading'
  portLabel2: string = 'Port of Destination'
  portLabel3: string = 'Shipping Line'
  portLabel4: string = 'Vessel'
  isWarehouse: boolean = false;
  currentLogin: any = ''
  _gc = GlobalConstants;
  @ViewChild(MatSort) sort1: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  bookingStatusList: any = [];
  depoName: string;
  selectBankTransfer: any = '';

  selectedDate: any = '';
  selectedMilestone: any = '';
  currentUrl: string = '';
  milestoneType: any = []
  reportData: any = [
    { name: "Container Shippingline Report", id: "containerShippinglineReport" },
    { name: "Container Allocation Details Report", id: "containerAllocationDetailsReport" },
    { name: "Invoice Report", id: "invoicereport" },
    { name: "Container Report", id: "containerreport" },
    { name: "BookingReport", id: "bookingreport" },
    { name: "Inquiry Report", id: "inquiryreport" },
    { name: "P&L Report", id: "p&lreport" },
    { name: "Payment Report", id: "paymentreport" },
    { name: "Vendor Costing Report", id: "VendorReport" },
    { name: "DO Release without Telex", id: "telexReport" },
    { name: "Profit & Loss Report", id: "profitLossreport" },
    { name: "TDS Report", id: "tdsReport" },
    { name: "Sale Summary by HSN Code", id: "hsnReport" },
    { name: "Bank Statement", id: "bankStatement" },
    { name: "DSR Report", id: "dsrReport" },
    // { name: "Customer DSR Report", id: "customerDsrReport" },
    { name: "Job Report", id: "jobReport" },
    // { name: "Job Details Report", id: "bookingDetailReport" },
    { name: "GST Report", id: "gstReport" },
    { name: "Party Report", id: "partyReport" },
    { name: "Expense Report", id: "expenseReport" },
    { name: "GSTR 1 Report", id: "gstr1Report" },
    { name: "GSTR 2 Report", id: "gstr2Report" },
    { name: "GSTR 3B Report", id: "gstr3bReport" },
    { name: "GSTR 9 Report", id: "gstr9Report" },
    { name: "Ledger Report", id: "ledgerReport" },
    { name: "Pending HBL Telex", id: "pendingHBLTelex" },
    { name: "DASHBOARD", id: "dailyReportWH" },
    { name: "UNLOADING REPORT FORMAT", id: "inwardReportWH" },
    { name: "LOADING REPORT FORMAT", id: "dispatchReportWH" },
    { name: "STOCK AGAINT EXBOND ", id: "trackStockReportWH" },
    { name: "DOCS TRACK REPORT ", id: "giveTrackReportWH" },
    { name: "Packaging Summary Report ", id: "trackRepackingReportWH" },
    { name: "CUSTOM REPORT ", id: "monthlyAuditReportWH" },
    { name: "Client Reports", id: "clientsMonthlyReportWH" },
    { name: "WAREHOUSE UTILIZATION REPORT", id: "warehouseProductivityWH" },
    { name: "Telex Date Wise Report", id: "telexDateWiseReport" }
  ];

  getFilteredReportData() {
    console.log('isWarehouse:', this.isWarehouse);
    console.log('currentLogin:', this.currentLogin);

    if (this.isWarehouse === true || this.currentLogin === 'warehouse') {
      return this.reportData.filter(report =>
        report.id === 'dailyReportWH' || report.id === 'inwardReportWH' || report.id === 'dispatchReportWH' ||
        report.id === "trackStockReportWH" || report.id === "giveTrackReportWH" || report.id === "trackRepackingReportWH" ||
        report.id === "monthlyAuditReportWH" || report.id === "clientsMonthlyReportWH" || report.id === "warehouseProductivityWH"
      );
    }

    console.log('Regular user - showing all reports except warehouse reports');
    return this.reportData.filter(report =>
      report.id !== 'dailyReportWH' && report.id !== 'inwardReportWH' && report.id !== 'dispatchReportWH' &&
      report.id !== "trackStockReportWH" && report.id !== "giveTrackReportWH" && report.id !== "trackRepackingReportWH" &&
      report.id !== "monthlyAuditReportWH" && report.id !== "clientsMonthlyReportWH" && report.id !== "warehouseProductivityWH"
    );
  }

  constructor(private fb: FormBuilder,
    public router: Router,
    public modalService: NgbModal, private sortPipe: OrderByPipe,
    public commonService: CommonService,
    private sanitizer: DomSanitizer,
    public notification: NzNotificationService,
    public commonFunctions: CommonFunctions,
    public apiService: ApiSharedService, private datePipe: DatePipe,
    public _api: ApiService,
    private commonFunction: CommonFunctions, public loaderService: LoaderService,) {
    this.isExport = localStorage?.getItem('isExport') === 'true' ? true : false
    this.isTransport = localStorage?.getItem('isTransport') === 'true' ? true : false
    const currentUrl = this.router.url;
    this.isWarehouse = localStorage.getItem('isWarehouse') === 'true' ? true : false;
    const segments = currentUrl.split('/');
    this.currentUrl = segments[segments.length - 1];
    this.reportType = this.currentUrl

    if (this.currentUrl == 'bankStatement' || this.currentUrl == 'gstReport') {
      this.onChangeReportType(this.currentUrl)
      if (this.currentUrl == 'gstReport') {
        this.reportData = [
          { name: "GST Report", id: "gstReport" },
          { name: "GSTR 1 Report", id: "gstr1Report" },
          { name: "GSTR 2 Report", id: "gstr2Report" },
          { name: "GSTR 3B Report", id: "gstr3bReport" },
          { name: "GSTR 9 Report", id: "gstr9Report" }
        ]
      }
    }
    this.addCountryForm = this.fb.group({
      reportName: new FormControl('', Validators.required),
      reportId: new FormControl('', Validators.required),
      status: new FormControl(true),
      final_voyage: ['']
    });


    this.getPortData()
    this.getPartyList()
    this.getCountryList()
    this.getBranchList()
    this.getBankList()

  }
  displayedColumns: any = []
  currentUser: any;

  imageURL: any;
  downloadFile(documentURL: string) {
    this.commonService.downloadDocuments('downloadfile', documentURL).subscribe(
      (fileData: Blob) => {
        const objectURL = URL.createObjectURL(fileData);
        const sanitizedURL = this.sanitizer.bypassSecurityTrustUrl(objectURL);

        this.imageURL = fileData;
      },
      (error) => {
        console.error(error);
      }
    );
  }
  financialYears: string[] = [];
  ngOnInit(): void {
    this.currentUser = this.commonFunction.getActiveAgent()
    this.currentLogin = this.commonFunctions.getUserType1()
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 10; i++) { // Generate 10 years of financial year options
      this.financialYears.push(`${currentYear - i - 1}-${currentYear - i}`);
    }

    this.getAll()
    // this.getreports();
    this.getVesselData();
    this.getPartyMasterDropDowns()
  }
  dateValidTill: any;
  clear() {
    this.selectedDate = '';
    this.selectedMilestone = '';
    this.dateValidTill = '';
    this.phone = '';
    this.addressname = '';
    const type = 'systemtype';
    // this.getreports() 
    this.depoName = '';
    this.customer = [];
    this.freightTerms = '';
    this.invoicingParty = '';
    this.vesselId = '';
    this.cosignee = [];
    this.shipper = '';
    this.vendor = '';
    this.branch = '';
    this.country = '';
    this.port = '';
    this.date = ''
    this.bookingNo = '';
    this.monthSelected = '';
    this.dueDate = '';
    this.invoiceStatus = '';
    this.paymentStatus = '';
    this.status = '';
    this.containerreport = '';
    this.voyage = '';
    this.vessel = '';
    this.bookingStatus = '';
    this.shippingLine = '';
    this.startDate = '';
    this.endDate = '';
    this.inquiryStatus = '';
    this.bankName = ''
    this.groupOfComapny = ''
  }
  groupedColumns: string[] = [];
  milestoneDropdown() {
    let payload = {};
    payload["query"] = {
      loadType: "FCL",
      flowType: "import",
      status: true
    };

    payload["sort"] = {
      "asc": ["seq"]
    }

    this.commonService.getSTList('milestonemaster', payload)?.subscribe((res: any) => {
      // Filter to ensure both 'FCL' and 'import' are present in typeCategory
      // this.milestoneType = res?.documents?.map((i) => 
      // {return {...i, mileStoneName:i?.mileStoneName+' Pending'}}
      // );

      let milestones = res?.documents?.map(i => ({
        ...i,
        mileStoneName: i?.mileStoneName + ' Pending'
      }));

      // Filter unique items based on mileStoneName
      this.milestoneType = Array.from(
        new Map(milestones.map(item => [item.mileStoneName, item])).values()
      );

      this.milestoneType = [...this.milestoneType, { mileStoneName: "Biz Completed", color: "#5a58c4" }]
    });
  }

  onChangeReportType(e) {
    this.clear()
    this.flag = false;
    this.dataSource = new MatTableDataSource([]);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort1;
    if (e === 'inquiryreport') {
      this.displayedColumns = [
        '#',
        'enquiryNo',
        'basicDetails.enquiryDate',
        'basicDetails.ShipmentTypeName',
        'enquiryStatus',
        'basicDetails.shipperName',
        'basicDetails.invoicingPartyName',
        'basicDetails.consigneeName',
        'productName',
        'routeDetails.loadPortName',
        'routeDetails.destPortName',



      ];
    }
    if (e === 'invoicereport') {
      this.getBatchList()

      let payload = this.commonService?.filterList();
      this.commonService?.getReports(e, payload)?.subscribe((res: any) => {
        this.allPaymentStatus = res?.allPaymentStatus?.filter((e: any) => e != "") ?? [];
        this.allInvoiceStatus = res?.allInvoiceStatus?.filter((e: any) => e != "") ?? [];
      })


      this.displayedColumns = [
        '#',
        'invoiceNo',
        'jobNo',
        'invoiceToName',
        'invoiceDate',
        'invoiceDueDate',
        'amount',
        'invoiceStatus',
        'paymentStatus',
        'loadPortName',
        'destPortName'
      ];
    }
    if (e === 'paymentreport') {
      this.getBatchList()
      this.displayedColumns = [
        '#',
        'customerName',
        'payementNo',
        'paymentType',
        'remitance_bank',
        'beneficiary_bankName',
        'shipper',
        'bankInstrumentDate',
        'received_from',
        'jobNo',
        'billNo',
        'amount',
        // 'paymentStatus'
      ];
    }
    if (e === 'profitLossreport') {
      this.flag = true;
      this.displayedColumns = [
        '#',
        'batchNo',
        "shipperName",
        "consigneeName",
        "buyEstimateAmount",
        "sellEstimateAmount",
        "profitLoss"

      ];
    }
    if (e === 'telexReport') {
      this.getBatchList()
      this.getLocation()
      this.displayedColumns = [
        '#',
        'deliveryOrderNo',
        'batchNo',
        'depoName',
        'releaseType',
        'deliveryDate',
        'validTill',
        'extendedValidTill',
        'containerNos',

      ];
    }

    if (e === 'containerreport') {
      this.getBatchList();
      this.displayedColumns = [
        '#',
        'containerNumber',
        'containerType',
        'shippinglineName',
        'vesselName',
        'voyageNumber',
        'yardName',
        'loadType',
        'containerStatus',
        // 'cargoType',
        'batchNo'
      ];
    }
    if (e === 'bookingreport') {
      this.getShiipingLine();
      this.getVesselVoyageList();
      this.getVesselData();
      let payload = this.commonService?.filterList();
      this.commonService?.getReports(e, payload)?.subscribe((res: any) => {
        this.allBatchStatus = res?.allBatchStatus ?? [];
      })
      this.displayedColumns = [
        '#',
        'jobNo',
        'inquiryNo',
        'status',
        'createdOn',
        'freightType',
        'loadPortName',
        'destPortName',
        'consigneeName',
        'shippinglineName',
        'vesselName',
        'voyageNumber',
        'shipperName',
        'forwarderName'
      ]
    }
    if (e === 'dsrReport') {
      this.displayedColumns = [
        '#',
        'createdOn',
        'statusOfBatch',
        // 'remarks',
        "batchNo",
        "shipperName",
        "consigneeName",
        "loadPortName",
        "destPortName",
        "locationName",
        'shippinglineName',
        "NOC",
        "containersName",
        "mblNumber",
        "SoNo",
        "containersNo",
        "hblNumber",
        "totalPackages",
        "stuffingDate",
        "vesselName",
        "etd",
        "atd",
        "eta",
        "ata",
        "railETD",
        "finalDestination",
        "doDate",

      ];
    }

    if (e === 'customerDsrReport') {
      this.displayedColumns = [
        '#',
        'createdOn',
        'statusOfBatch',
        // 'remarks',
        "batchNo",
        "shipperName",
        "consigneeName",
        "loadPortName",
        "destPortName",
        "locationName",
        'shippinglineName',
        "NOC",
        "containersName",
        "mblNumber",
        "SoNo",
        "containersNo",
        "hblNumber",
        "stuffingDate",
        "vesselName",
        "etd",
        "atd",
        "eta",
        // "ata",
        // "railETD",
        // "finalDestination",
        // "doDate",

      ];
    }

    if (e === 'telexDateWiseReport') {
      this.displayedColumns = [
        "batchNo",
        "telexDate",
        "blType",
        "blNumber",
        "shipperName",
        "consigneeName",
        "containers",
        "blStatus"
      ];
    }

    if (e === 'pendingHBLTelex') {
      this.displayedColumns = [
        "doDate",
        "batchNo",
        "shipperName",
        "consigneeName",
        "loadPortName",
        "destPortName",
        "locationName",
        "agentName",
        "hblNumber",
        "mblNumber",
        "containersNo",
        "vesselName",
        "departureTime",
        "arrivalTime",
        "totalDays"

      ];
    }

    if (e === 'jobReport') {
      this.getShiipingLine()
      this.milestoneDropdown()
      this.displayedColumns = [
        '#',
        "batchNo",
        "shipperName",
        "consigneeName",
        "hblNumber",
        "mblNumber",
        "departureTime",
        "arrivalTime",
        "statusOfBatch",

      ];
    }

    if (e === 'bookingDetailReport') {
      this.getShiipingLine()
      this.milestoneDropdown()
      this.displayedColumns = [
        '#',
        "batchNo",
        "createdOn",
        "shipperName",
        "consigneeName",
        "loadPortName",
        "destPortName",
        "locationName",
        "etd",
        "vesselName",
        "eta",
        "hblNumber",
        "mblNumber",
        "containerNumber",
        "agentName",
        "shippinglineName",
        "buyEstimateAmount",
        "sellEstimateAmount",
        "commission",
        "doDate",
        "remarks",

      ];
    }


    if (e === 'VendorReport') {
      this.getVendorList()
      this.getBatchList();
      this.displayedColumns = [
        '#',
        'batchNo',
        'costItemName',
        'createdOn',
        'selEstimates.igst',
        'selEstimates.totalAmount',
        'createdBy'

      ]
    }
    if (e === 'containerShippinglineReport') {
      this.getShiipingLine()
      this.displayedColumns = [
        '#',

        "shippinglineName",
        "vesselName",
        "voyageNumber",
        "containerBooked",
        "containerAllocated",
        "containerPending",
        "ETD",
        "originPortName"
      ];
    }
    if (e === 'tdsReport') {
      this.displayedColumns = [
        '#',
        "transactionId",
        "createdOn",
        "partyName",
        "invoiceData.invoiceNo",
        "transactionType",
        "tdsType",
        "tdsAmount",

      ];
    }
    if (e === 'hsnReport') {
      this.displayedColumns = [
        '#',
        "hsnCode",
        "costItemName",
        "quantity",
        "taxableAmount",
        "igst",
        "cgst",
        "sgst",
        "totalValue",
      ];
    }
    if (e === 'bankStatement') {
      this.displayedColumns = [
        '#',
        'transactionId',
        'createdOn',
        "partyName",
        'transactionType',
        'tdsType',
        'netAmount',

      ];
    }
    if (e === 'containerAllocationDetailsReport') {
      this.getShiipingLine()
      this.getVesselData()
      this.displayedColumns = [
        '#',
        "shippinglineName",
        "vesselName",
        "voyageNumber",
        "containerBooked",
        "containerAllocated",
        "containerPending",
        "ETD",
        "originPortName",
        "bookingNumber",
        "customerName",
        "enquiryNo"
      ];
    }
    if (e === 'p&lreport') {
      this.getShiipingLine()
      this.displayedColumns = [
        '#',

        "batchNo",
        "invoiceNo",
        "buyEstimateAmount",
        'sellEstimateAmount',
        "invoiceTaxAmount",
        "invoiceAmount",
        "paymentStatus",
        "profitLoss"
      ];
    }

    if (e === 'dailyReportWH') {
      this.displayedColumns = [
        '#',
        "jobNo",
        "partyName",
        "chaName",
        "nocDate",
        "section",
        "bondNo",
        "boe",
        "blNo",
        "receivedDate",
        "inDutyAmt",
        "dutyPaid",
        "balanceDuty",
        "dutyStatus",
        "containerInWardCount",
        "containerSize",
        "inPackages",
        "outPackages",
        "inWarehouse",
        "inwardLocation",
        "dispatchRemarks",
      ];
    }
    if (e === 'inwardReportWH') {
      this.displayedColumns = [
        '#',
        "jobNo",
        "inWardDate",
        "boe",
        "blNo",
        "chaName",
        "partyName",
        "vehicleNumber",
        "containerNo",
        "containerSize",
        "qty",
        "packageType",
        "cargo",
        "locationInward",
        "labour",
        "equipment",
        "supervisor",
      ];
    }
    if (e === 'dispatchReportWH') {
      this.displayedColumns = [
        '#',
        "jobNo",
        "dispatchDate",
        "inbondBoe",
        "exBoe",
        "blNoInWard",
        "chaName",
        "partyName",
        "vehicleNumber",
        "containerNo",
        "containerSize",
        "cargo",
        "qty",
        "packageType",
        "location",
        "labour",
        "equipment",
        "supervisor",
      ];
    }
    if (e === 'trackStockReportWH') {
      this.displayedColumns = [
        '#',
        "jobNo",
        "partyName",
        "chaName",
        "inBondBoe",
        "numOfContainer",
        "inBondPackage",
        "exBondBoe",
        "exBondPackage",
        "balanceInWarehouse",
        "status",
        "remarks"
      ];
    }
    if (e === 'warehouseProductivityWH') {
      this.displayedColumns = [
        "#",
        "jobNo",
        "warehouseName",
        "location",
        "code",
        "partyName",
        "chaName",
        "itemDesciption",
        "containers",
        "containerSize",
        "qtyStored",
        "storageType",
        "duration",
        "totalCapacity",
        "occupiedCapacity",
        "availableCapacity",
      ];
    }
    if (e === 'trackRepackingReportWH') {
      this.displayedColumns = [
        "#",
        "jobNo",
        "jobDate",
        "partyName",
        "chaName",
        "boe",
        "cargo",
        "qty",
        "packageType",
        "packedBy",
        "location",
        "supervisor",
      ];
    }
    if (e === 'monthlyAuditReportWH') {
      this.displayedColumns = [
        "#",
        "jobNo",
        "partyName",
        "chaName",
        "boe",
        "boeDate",
        "bondNo",
        "bondDate",
        "section",
        "goods",
        "qty",
        "dateofexpiryofinitialbondingPeriod",
        "detailsofExtensions",
        "remarks"
      ];
    }
    if (e === 'clientsMonthlyReportWH') {
      this.displayedColumns = [
        "#",
        "jobNo",
        "partyName",
        "chaName",
        "boe",
        "itemDesciption",
        "inwardDate",
        "pkg",
        "dispatchDate",
        "dispatchQty",
        "balanceQty",
        "storageDuration"
      ];
    }
    if (e === 'giveTrackReportWH') {
      this.displayedColumns = [
        "#",
        "jobNo",
        "partyName",
        "chaName",
        "boe",
        "numOfContainer",
        "nocNo",
        "nocDate",
        "packingList",
        "billOfLanding",
        "commercialInvoice",
        "billOfEntry",
        "outOfCharge",
        "gatepass",
        "bond",
        "permission",
        "deliveryOrder",
        "sealIntact",
        "form6",
        // EXBOND DOCS columns
        "exBillOfEntry",
        "exOutOfCharge",
        "exGatepass",
        "dutyChallan",
        "gateInReqLetter",

      ];

      this.groupedColumns = [
        "nocNo-header",
        "partyName-header",
        "chaName-header",
        "boe-header",
        "header-kycdocs",
        "numOfContainer-header",
        "nocDate-header",
        "packingList-header",
        "billOfLanding-header",
        "commercialInvoice-header",
        "billOfEntry-header",
        "outOfCharge-header",
        "gatepass-header",
        "bond-header",
        "permission-header",
        "deliveryOrder-header",
        "sealIntact-header",
        "form6-header",
        "exBillOfEntry-header",
        "exOutOfCharge-header",
        "exGatepass-header",
        "dutyChallan-header",
        "gateInReqLetter-header",
        "header-exbonddocs"
      ];
    }

    if (e === 'gstReport') {
      this.displayedColumns = [
        '#',
        'invoiceToName',
        'sellTax',
        'purchaseTax'
      ];
    }

    if (e === 'gstr1Report') {
      this.displayedColumns = [
        '#',
        'gstNumber',
        'invoiceNo',
        'createdOn',
        'invoiceAmount',

        'rate',
        'cessRate',
        'taxableValue',

        'igst',
        'cgst',
        'sgst',
        'cess',

        'stateOfSupplyName'
      ];
    }

    if (e === 'gstr2Report') {
      this.displayedColumns = [
        '#',
        'gstNumber',
        'invoiceNo',
        'createdOn',
        'invoiceAmount',

        'rate',
        'cessRate',
        'taxableValue',

        'reverseCharge',

        'igst',
        'cgst',
        'sgst',
        'cess',

        'stateOfSupplyName'
      ];
    }

    if (e === 'gstr3bReport') {
      this.displayedColumns = [

      ];
    }
    if (e === 'gstr9Report') {
      this.displayedColumns = [
        '#',
        'invoiceToName',
        'sellTax',
        'purchaseTax'
      ];
    }

    if (e === 'partyReport') {
      this.displayedColumns = [
        '#',
        'partyName',
        'taxNumber',
        'receivable',
        'payable',
      ];
    }

    if (e === 'expenseReport') {
      this.displayedColumns = [
        '#',
        'createdOn',
        'invoiceNo',
        'invoiceFromName',
        'paymentMode',
        'invoiceAmount',
        'paidAmount',
        'balanceAmount',
        'remarks',
        'hbl',
        'packagesNo',
        'batchNo',

      ];
    }

    if (e === 'ledgerReport') {
      this.downloadFile(this.currentUser?.uploadLogo)
      this.displayedColumns = [
        '#',
        'createdOn',
        'batchNo',
        'hbl',
        'containers',
        'type',
        'paymentNo',
        'paymentType',
        'refNo',
        'paymentStatus',
        'debit',
        'credit',
        'runningBalance',


      ];
    }

  }

  yardList: any = []
  getLocation() {
    let payload = this.commonService?.filterList()
    payload.query = {
      status: true,
      masterType: {
        "$in": ['YARD', 'CFS', 'ICD']
      },
    }
    this._api.getSTList("location", payload).subscribe((res: any) => {
      this.yardList = res?.documents;
    });
  }
  shippinglineData: any = []
  getShiipingLine() {
    this.loaderService?.showcircle();

    let payload = this.commonService?.filterList()
    if (payload?.query) payload.query = {
    }
    if (payload?.sort) payload.sort = {
      "desc": ["updatedOn"]
    }

    let mustArray = {};




    if (payload?.query) payload.query = mustArray
    if (payload?.size) payload.size = Number(1000)
    if (payload?.from) payload.from = 0
    this.commonService?.getSTList('shippingline', payload)?.subscribe((data: any) => {
      this.shippinglineData = data.documents;

      this.loaderService?.hidecircle();
    }, () => {
      this.loaderService?.hidecircle();
    });
  }
  vesselList: any = [];
  voyageNo
  setVoyage(e) {
    let vessel = this.vesselList.filter((x) => x?.vesselId == e)[0]
    if (vessel?.voyage?.length > 0) {
      this.voyageListData = vessel.voyage ?? [];
      this.voyageNo = vessel?.voyageNumber
    }
  }

  getBankList() {
    this.loaderService?.showcircle();
    let payload = this.commonService?.filterList()
    this.loaderService?.hidecircle();

    if (payload?.query) payload.query = {
      ...payload.query,
      parentId: this.commonFunction.getAgentDetails().orgId,
    }

    this.commonService?.getSTList('bank', payload)
      ?.subscribe((data) => {
        this.loaderService?.hidecircle();
        this.bankList = data?.documents;
      });
  }

  disableFutureDates = (current: Date): boolean => {
    const today = new Date();
    return current > today;
  };


  finalvoyageData: any = [];
  setfinalVessel(e, changeSL) {
    if (changeSL) {
      this.addCountryForm.controls.final_voyage?.setValue('')
    }
    this.finalvoyageData = []
    if (!e) { return false };
    let vesselData = this.voyageData.filter((x) => x?.vesselId === e)[0]
    vesselData?.voyage?.forEach((element) => {
      if (element?.shipping_line === this.addCountryForm.value?.shipping_line) {
        this.finalvoyageData.push(element)
      }
    });

  }
  voyageData: MyData[] = [];
  vesseldataShipping: any = [];

  customerList: any = []
  customer: any = []
  getPartyList() {
    let payload = this.commonService?.filterList()
    if (payload?.query) payload.query = {
      "$and": [
        {
          "customerType?.item_text": {
            "$ne": "Vendor",
          }
        }
      ]
    }
    if (payload?.size) payload.size = Number(1000)
    if (payload?.from) payload.from = 0
    if (payload?.sort) payload.sort = {
      "desc": ["updatedOn"]
    },
      this.fromSize = 1
    this.commonService?.getSTList("partymaster", payload)?.subscribe((data) => {
      this.customerList = data.documents;
    });
  }
  vendorList: any = []
  getVendorList() {
    let payload = this.commonService?.filterList()
    payload.query = { "isSupplier": true }
    this.commonService?.getSTList('partymaster', payload)?.subscribe((data) => {
      this.vendorList = data.documents;

    });
  }
  countryData: any = []
  country: any
  getCountryList() {
    let payload = this.commonService?.filterList()
    if (payload?.query) payload.query = { status: true }
    if (payload?.sort) payload.sort = {
      "desc": ["updatedOn"]
    },
      this.commonService?.getSTList('country', payload)?.subscribe((data) => {
        this.countryData = data.documents;
      });
  }
  branchList: any = []
  branch: any
  getBranchList() {

    let payload = this.commonService?.filterList()
    if (payload?.query) payload.query = {
      parentId: this.commonFunction.getAgentDetails().orgId,
    }
    if (payload?.size) payload.size = Number(1000);
    if (payload?.from) payload.from = 0;
    if (payload?.sort) payload.sort = {
      "desc": ["updatedOn"]
    },
      this.commonService?.getSTList('branch', payload)
        ?.subscribe((data) => {
          this.branchList = data.documents;

        });
  }
  onChangeCountry(e) {
    // this.getPortData(e)
  }
  showVoyage: boolean = false;
  updatePortLabel(selectedId: any) {
    const selectedType = this.shipmentTypes.find(type => type?.systemtypeId === selectedId);
    this.selectedTypeData = selectedType;
    if (!this.displayedColumns.find(r => r === 'voyageNumber')) {
      this.displayedColumns.push('voyageNumber');
    }
    if (selectedType) {
      switch (selectedType?.typeName) {
        case 'Land':
          this.portLabel = 'Origin';
          this.portLabel1 = 'Origin';
          this.portLabel2 = 'Destination';
          this.portLabel3 = 'Transporter';
          this.portLabel4 = 'Vehicle No';
          break;
        case 'Rail':
          this.portLabel = 'Rail ';
          this.portLabel1 = 'Port of Loading';
          this.portLabel2 = 'Port of Destination';
          // this.portLabel2 = 'Destination';
          break;
        case 'Air':
          this.displayedColumns = this.displayedColumns.filter(r => r !== 'voyageNumber');
          this.portLabel = 'AirPort';
          this.portLabel1 = 'Airport of Loading';
          this.portLabel2 = 'Airport of Destination';
          this.portLabel3 = 'Airline';
          this.portLabel4 = 'Flight No';
          break;
        case 'Ocean':
          this.portLabel = 'Port';
          this.portLabel1 = 'Port of Loading';
          this.portLabel2 = 'Port of Destination'
          this.portLabel3 = 'Shipping Line';
          this.portLabel4 = 'Vessel'
          break;
        default:
          this.portLabel = 'Port';
      }
    } else {
      this.portLabel = 'Port';
      this.showVoyage = false;
    }

  }

  portData: any = []
  port: any
  getPortData(e?) {

    let payload = this.commonService?.filterList()
    // payload.query = {
    //   "country.countryId": e
    // }
    if (payload?.size) payload.size = Number(15000),
      payload.from = 0,
      payload.sort = {
        "desc": ["updatedOn"]
      }
    if (payload?.project) payload.project = ["portDetails.portName", "portId"];
    this.commonService?.getSTList("port", payload)?.subscribe((res: any) => {
      this.portData = res.documents;
    });
  }
  batchList: any = []
  getBatchList() {
    var parameter = {
      "project": [],
      "query": {
        "isExport": this.isExport
      },
      "sort": {
        "desc": ["createdOn"]
      },
      size: Number(10000),
      from: 0,
    }
    this._api.getSTList(Constant.BATCH, parameter)
      ?.subscribe((data: any) => {
        this.batchList = data.documents;
      });
  }
  voyageListData: any = []
  getVesselVoyageList() {
    let payload = this.commonService?.filterList()
    if (!this.isExport) {
      payload.query = {
        "isVoyageImport": true
      }
    }
    if (this.isExport) {
      payload.query = {
        "$and": [
          {
            "isVoyageImport": {
              "$ne": true,
            }
          }
        ]
      }
    }
    if (payload?.size) payload.size = Number(1000),
      payload.from = 0,
      this.commonService?.getSTList('voyage', payload)?.subscribe((data) => {
        this.voyageListData = data.documents;

      });
  }
  vesselData: any = []
  getVesselData() {
    let payload = this.commonService?.filterList()
    if (payload) payload.query = { status: true }
    if (payload) payload.sort = {
      "desc": ["updatedOn"]
    }
    // if(payload?.size)payload.size = Number(1000)
    // payload.from = 0,
    this._api
      .getSTList('voyage', payload)
      ?.subscribe((res: any) => {
        this.vesselList = res?.documents;
        this.voyageData = res?.documents;
        this.vesseldataShipping = res?.documents;
      });
  }
  async getVoyage() {
    let payload = this.commonService?.filterList()
    payload.query = { status: true }
    await this._api
      .getSTList('voyage', payload)
      ?.subscribe((res: any) => {
        this.vesselList = res?.documents;
        this.voyageData = res?.documents;
        this.vesseldataShipping = res?.documents;
      });
  }
  onExport() {
    const modifiedTableData = this.dataSource?.filteredData;
    const tableColumns = this.displayedColumns;
    const tableData = modifiedTableData || [];
    const columnsToHide = [];
    const actualColumns = this.displayedColumns;

    this.commonFunction.exportToExcel(
      tableColumns,
      tableData,
      columnsToHide,
      this.reportType,
      this.displayedColumns,
      actualColumns
    );
  }
  sort(array, key) {
    return this.sortPipe?.transform(array, key);
  }
  openPDF(flag) {
    var prepare = [];
    let doc;
    let header = []
    if (this.reportType === 'inquiryreport') {
      this.dataSource?.filteredData?.forEach((e: any) => {
        var tempObj = [];
        tempObj.push(e?.enquiryNo);
        tempObj.push(e?.basicDetails?.enquiryDate);
        tempObj.push(e?.basicDetails?.ShipmentTypeName);
        tempObj.push(e?.basicDetails?.shipperName);
        tempObj.push(e?.basicDetails?.invoicingPartyName);
        tempObj.push(e?.basicDetails?.consigneeName);
        tempObj.push(e?.productName);
        tempObj.push(e?.routeDetails?.loadPortName);
        tempObj.push(e?.routeDetails?.destPortName);
        prepare?.push(tempObj);
      });


      header = ['Inquiry No.', 'Date', 'Freight Type', 'Customer', 'Invoicing Party', 'Consignee', 'Cargo', 'POL', 'POD']


    }

    if (this.reportType === 'invoicereport') {
      this.dataSource?.filteredData?.forEach((e: any) => {
        var tempObj = [];
        tempObj.push(e?.invoiceNo);
        tempObj.push(e?.invoiceFromName);
        tempObj.push(e?.invoiceToName);
        tempObj.push(e?.bankName);
        tempObj.push(e?.batchNo);
        prepare?.push(tempObj);
      });



      header = ['Invoice No.', 'Invoice From', 'Invoice To', 'Bank', 'Job No.']


    }
    if (this.reportType === 'paymentreport') {
      this.dataSource?.filteredData?.forEach((e: any) => {
        var tempObj = [];
        tempObj.push(e?.customerName);
        tempObj.push(e?.beneficiary_bankName);
        tempObj.push(e?.jobNo);
        tempObj.push(e?.billNo);
        tempObj.push(e?.amount);
        prepare?.push(tempObj);
      });



      header = ['Customer Name', 'Beneficiary Bank', 'Job No.', 'Bill No.', 'Amount']


    }
    if (this.reportType === 'containerreport') {
      this.dataSource?.filteredData?.forEach((e: any) => {
        var tempObj = [];
        tempObj.push(e?.containerNumber);
        tempObj.push(e?.containerTypeName);
        tempObj.push(e?.shippingLineName);
        // tempObj.push(e?.tankStatusName);
        // tempObj.push(e?.cargoType);
        tempObj.push(e?.batchNo)
        prepare?.push(tempObj);
      });



      header = ['Container Number', 'Container Type', 'Shippingline', 'Job No.']


    }
    if (this.reportType === 'profitLossreport') {
      this.dataSource?.filteredData?.forEach((e: any) => {
        const tempObj: any[] = [];
        tempObj.push(e?.batchNo);
        tempObj.push(e?.shipperName);
        tempObj.push(e?.consigneeName)
        tempObj.push(e?.buyEstimateAmount);
        tempObj.push(e?.sellEstimateAmount);
        tempObj.push(e?.profitLoss);
        // tempObj.push(e?.sblChecked);
        this.milestoneColumns?.filter((x) => {
          tempObj.push(this.getMilestoneData(e?.milestones, x));
        });

        prepare?.push(tempObj);
      });

      const totalsRow: any[] = [];
      totalsRow.push('');
      totalsRow.push('');
      totalsRow.push('Total');
      totalsRow.push(this.totalPLBuy);
      totalsRow.push(this.totalPLSell);
      totalsRow.push(this.totalPL);

      this.milestoneColumns?.forEach(() => {
        totalsRow.push('');
      });

      prepare?.push(totalsRow);

      header = [
        "Job No",
        "Shipper",
        "Consignee",
        "Buy Amount",
        "Sell Amount",
        "Profit/Loss"
      ];
    }
    if (this.reportType === 'VendorReport') {
      this.dataSource?.filteredData?.forEach((e: any) => {
        var tempObj = [];
        tempObj.push(e?.batchNo);
        tempObj.push(e?.costItemName);
        tempObj.push(this.datePipe?.transform(e?.createdOn, 'dd-MM-yyyy'));
        tempObj.push(e?.selEstimates.igst || e?.buyEstimates?.igst);
        tempObj.push(e?.selEstimates.totalAmount || e?.buyEstimates?.totalAmount)
        tempObj.push(e?.createdBy || e?.createdBy)

        prepare?.push(tempObj);

      });



      header = ['Batch No', 'Charge Name', 'Date', 'Total Tax', 'Total Amount', 'Created By']


    }

    if (this.reportType === 'hsnReport') {
      this.dataSource?.filteredData?.forEach((e: any) => {
        var tempObj = [];
        tempObj.push(e?.hsnCode);
        tempObj.push(e?.costItemName);
        tempObj.push(e?.quantity);
        tempObj.push(e?.taxableAmount);
        tempObj.push(e?.igst);
        tempObj.push(e?.cgst);
        tempObj.push(e?.sgst);
        tempObj.push(e?.totalAmount);

        prepare?.push(tempObj);

      });


      header = ['HSN Code', 'Item Name', 'Quantity', 'Taxable Value', 'IGST', 'CGST', 'SGST', 'Total Value']


    }

    if (this.reportType === 'telexReport') {
      this.dataSource?.filteredData?.forEach((e: any) => {
        var tempObj = [];

        tempObj.push(e?.deliveryOrderNo);
        tempObj.push(e?.batchNo);
        tempObj.push(e?.depoName);
        tempObj.push(e?.releaseType);
        tempObj.push(e?.deliveryDate);
        tempObj.push(e?.validTill);
        tempObj.push(e?.extendedValidTill);
        tempObj.push(
          e?.containerNos
            ? e.containerNos
              .split(/\s*\n\s*|\s*,\s*/) // handles newline OR comma input
              .filter(Boolean)
              .map(c => `${c.trim()},`)
              .join('\n')
            : ''
        );

        prepare?.push(tempObj);

      });

      header = ['DO No', 'Batch No', 'Depo Name', 'Release Type', 'Delivery Date', 'Valid Till', 'Extended Valid Till', 'Container Nos']

    }
    if (this.reportType === 'tdsReport') {
      this.dataSource?.filteredData?.forEach((e: any) => {
        var tempObj = []; ``
        tempObj.push(e?.transactionId);
        tempObj.push(this.datePipe?.transform(e?.createdOn, 'dd-MM-yyyy'));
        tempObj.push(e?.partyName);
        tempObj.push(e?.invoiceData.invoiceNo);
        tempObj.push(e?.transactionType);
        tempObj.push(e?.tdsType);
        tempObj.push(e?.tdsAmount);

        prepare?.push(tempObj);

      });

      header = ['Transaction Id', 'Date', 'Party', 'Invoice No', 'Transaction Type', 'Amt Type', 'TDS Amt']

    }

    if (this.reportType === 'bankStatement') {
      this.dataSource?.filteredData?.forEach((e: any) => {
        var tempObj = []; ``
        tempObj.push(e?.transactionId);
        tempObj.push(this.datePipe?.transform(e?.createdOn, 'dd-MM-yyyy'));
        tempObj.push(e?.partyName);
        tempObj.push(e?.transactionType);
        tempObj.push(e?.tdsType);
        tempObj.push(e?.netAmount);


        prepare?.push(tempObj);

      });


      header = ['Transaction Id', 'Date', 'Party', 'Transaction Type', 'Amount Type', ' Amount']

    }

    if (this.reportType === 'containerAllocationDetailsReport') {
      this.dataSource?.filteredData?.forEach((e: any) => {
        const tempObj = [];
        tempObj.push(e?.shippinglineName);
        tempObj.push(e?.vesselName);
        tempObj.push(e?.voyageNumber);
        tempObj.push(e?.containerBooked)
        tempObj.push(e?.containerAllocated)
        tempObj.push(e?.containerPending)
        tempObj.push(e?.ETD)
        tempObj.push(e?.originPortName)
        tempObj.push(e?.bookingNumber)
        tempObj.push(e?.customerName)
        tempObj.push(e?.enquiryNo)
        prepare?.push(tempObj);
      });


      header = ['SLINE', 'Vessel', 'Voyage', 'Container Booked', 'Container Allocated', 'Container Pending', 'ETD', 'Origin Port', 'Booking No.', 'Customer', 'Inquiry No.']

    }
    if (this.reportType === 'p&lreport') {
      this.dataSource?.filteredData?.forEach((e: any) => {
        const tempObj = [];
        tempObj.push(e?.batchNo);
        tempObj.push(e?.buyEstimateAmount);
        tempObj.push(e?.sellEstimateAmount);
        tempObj.push(e?.invoiceAmount)
        tempObj.push(e?.invoiceNo)
        tempObj.push(e?.invoiceStatus)
        tempObj.push(e?.invoiceTaxAmount)
        tempObj.push(e?.paymentStatus)
        tempObj.push(e?.profitLoss)
        prepare?.push(tempObj);
      });

      header = ['Job No', 'Buy Est Amt', 'Sell Est Amt', 'Invoice Amt', 'Invoice No.', 'Status', 'Tax Amt', 'Status', 'Profit/Loss']


    }
    if (this.reportType === 'containerShippinglineReport') {
      this.dataSource?.filteredData?.forEach((e: any) => {
        const tempObj = [];
        tempObj.push(e?.shippinglineName);
        tempObj.push(e?.vesselName);
        tempObj.push(e?.voyageNumber);
        tempObj.push(e?.containerBooked)
        tempObj.push(e?.containerAllocated)
        tempObj.push(e?.containerPending)
        tempObj.push(e?.ETD)
        tempObj.push(e?.originPortName)
        prepare?.push(tempObj);
      });



      header = ['SLINE ', 'Vessel', 'Voyage', 'Container Booked', 'Container Allocated', 'Container Pending', 'ETD', 'Origin Port Name']

    }
    if (this.reportType === 'gstr9Report') {
      this.dataSource?.filteredData?.forEach((e: any) => {
        const tempObj = [];
        tempObj.push(e?.invoiceToName)
        tempObj.push(e?.sellTax)
        tempObj.push(e?.purchaseTax)

        prepare?.push(tempObj);
      });

      header = ['Party Name', 'Sale Tax', 'Purchase Tax']

    }

    // if (this.reportType === 'gstr3bReport') {
    //   this.dataSource?.filteredData?.forEach((e: any) => {
    //     const tempObj = [];
    //     tempObj.push(e?.invoiceToName)
    //     tempObj.push(e?.sellTax)
    //     tempObj.push(e?.purchaseTax)

    //     prepare?.push(tempObj);
    //   });



    //   header = ['Party Name', 'Sale Tax', 'Purchase Tax']

    // }
    if (this.reportType === 'dsrReport') {
      this.dataSource?.filteredData?.forEach((e: any) => {
        const tempObj: any[] = [];

        const totalPackages = e?.packageHBL?.reduce((sum: number, pkg: any) => {
          return sum + (Number(pkg.package) || 0);
        }, 0);

        tempObj.push(this.datePipe?.transform(e?.createdOn, 'dd-MM-yyyy'));
        tempObj.push(e?.statusOfBatch);
        tempObj.push(e?.batchNo);
        tempObj.push(e?.multiShipperCS);
        tempObj.push(e?.multiConsigneeCS)
        tempObj.push(e?.loadPortName);
        tempObj.push(e?.destPortName);
        tempObj.push(e?.locationName);
        tempObj.push(e?.shippingLineName);
        tempObj.push(e?.noc);
        tempObj.push(e?.containersName);
        tempObj.push(e?.mblNumber);
        tempObj.push(
          e?.containerNos
            ? e.containerNos
              .split(/\s*\n\s*|\s*,\s*/) // handles newline OR comma input
              .filter(Boolean)
              .map(c => `${c.trim()},`)
              .join('\n')
            : ''
        );
        tempObj.push(e?.hblNumber);
        tempObj.push(totalPackages);
        tempObj.push(this.datePipe?.transform(e?.stuffingDate, 'dd-MM-yyyy'));
        tempObj.push(`${e?.vesselName || ''} ${e?.voyageNumber ? '/' : ''} ${e?.voyageNumber || ''} `);
        tempObj.push(this.datePipe?.transform(e?.etd, 'dd-MM-yyyy'));
        tempObj.push(this.datePipe?.transform(e?.atd, 'dd-MM-yyyy'));
        tempObj.push(this.datePipe?.transform(e?.eta, 'dd-MM-yyyy'));
        tempObj.push(this.datePipe?.transform(e?.ata, 'dd-MM-yyyy'));
        tempObj.push(this.datePipe?.transform(e?.railETD, 'dd-MM-yyyy'));
        tempObj.push(e?.locationName);
        tempObj.push(this.datePipe?.transform(e?.doDate, 'dd-MM-yyyy'));
        // tempObj.push(e?.sblChecked);
        this.milestoneColumns?.filter((x) => {
          tempObj.push(this.getMilestoneData(e?.milestones, x))

        })

        prepare?.push(tempObj);
      });



      // header = ['Job No.', 'Date', 'Shipper', 'Consignee', 'HBL No.', 'SLINE', ...this.milestoneColumns]
      header = [
        'Date',
        'Curr Pend Milestone',
        "Job No",
        "Shipper",
        "Consignee",
        "POL",
        "POD",
        "Destination",
        'SLINE',
        "NOC",
        "CNTR Name",
        "MBL",
        "CNTR No.",
        "HBL",
        "Total Packages",
        "Stuffing Date",
        "Vessel",
        "ETD",
        "ATD",
        "ETA",
        "ATA",
        "Rail Out",
        "Final Destination Arrival",
        "DO Date",
      ]


    }

    if (this.reportType === 'customerDsrReport') {
      this.dataSource?.filteredData?.forEach((e: any) => {
        const tempObj = [];

        tempObj.push(this.datePipe?.transform(e?.createdOn, 'dd-MM-yyyy'));
        tempObj.push(e?.statusOfBatch);
        tempObj.push(e?.batchNo);
        tempObj.push(e?.shipperName);
        tempObj.push(e?.consigneeName)
        tempObj.push(e?.loadPortName);
        tempObj.push(e?.destPortName);
        tempObj.push(e?.locationName);
        tempObj.push(e?.shippingLineName);
        tempObj.push(e?.noc);
        tempObj.push(e?.containersName);
        tempObj.push(e?.mblNumber);
        tempObj.push(
          e?.containerNos
            ? e.containerNos
              .split(/\s*\n\s*|\s*,\s*/) // handles newline OR comma input
              .filter(Boolean)
              .map(c => `${c.trim()},`)
              .join('\n')
            : ''
        );
        tempObj.push(e?.hblNumber);
        tempObj.push(this.datePipe?.transform(e?.stuffingDate, 'dd-MM-yyyy'));
        tempObj.push(`${e?.vesselName || ''} ${e?.voyageNumber ? '/' : ''} ${e?.voyageNumber || ''} `);
        tempObj.push(this.datePipe?.transform(e?.etd, 'dd-MM-yyyy'));
        tempObj.push(this.datePipe?.transform(e?.atd, 'dd-MM-yyyy'));
        tempObj.push(this.datePipe?.transform(e?.eta, 'dd-MM-yyyy'));
        // tempObj.push(this.datePipe?.transform(e?.ata, 'dd-MM-yyyy'));
        // tempObj.push(this.datePipe?.transform(e?.railETD, 'dd-MM-yyyy'));
        // tempObj.push(e?.locationName);
        // tempObj.push(this.datePipe?.transform(e?.doDate, 'dd-MM-yyyy'));
        this.milestoneColumns?.filter((x) => {
          tempObj.push(this.getMilestoneData(e?.milestones, x))

        })

        prepare?.push(tempObj);
      });



      // header = ['Job No.', 'Date', 'Shipper', 'Consignee', 'HBL No.', 'SLINE', ...this.milestoneColumns]
      header = [
        'Date',
        'Curr Pend Milestone',
        "Job No",
        "Shipper",
        "Consignee",
        "POL",
        "POD",
        "Destination",
        'SLINE',
        "NOC",
        "CNTR Name",
        "MBL",
        "CNTR No.",
        "HBL",
        "Stuffing Date",
        "Vessel",
        "ETD",
        "ATD",
        "ETA",
        // "ATA",
        // "Rail Out",
        // "Final Destination Arrival",
        // "DO Date",
      ]


    }

    if (this.reportType === 'gstReport') {
      this.dataSource?.filteredData?.forEach((e: any) => {
        const tempObj = [];
        tempObj.push(e?.invoiceToName)
        tempObj.push(e?.sellTax)
        tempObj.push(e?.purchaseTax)

        prepare?.push(tempObj);
      });


      header = ['Party Name', 'Sale Tax', 'Purchase Tax']

    }
    if (this.reportType === 'gstr2Report') {
      this.dataSource?.filteredData?.forEach((e: any, i) => {
        const tempObj = [];
        tempObj.push(i + 1)
        tempObj.push(e?.gstNumber || '')
        tempObj.push(e?.invoiceNo)
        tempObj.push(this.datePipe?.transform(e?.createdOn, 'dd-MM-yyyy'))
        tempObj.push(Number(e?.invoiceAmount || 0)?.toFixed(2))
        tempObj.push(e?.rate || 0)
        tempObj.push(e?.cessRate || 0)
        tempObj.push(Number(e?.taxableValue || 0)?.toFixed(2))
        tempObj.push(e?.reverseCharge || 'N')
        tempObj.push(e?.gstType != 'cgst' ? Number(e?.invoiceTaxAmount || 0)?.toFixed(2) || 0 : 0)
        tempObj.push(e?.gstType == 'cgst' ? (Number(e?.invoiceTaxAmount || 0) / 2)?.toFixed(2) || 0 : 0)
        tempObj.push(e?.gstType == 'cgst' ? (Number(e?.invoiceTaxAmount || 0) / 2)?.toFixed(2) || 0 : 0)
        tempObj.push(e?.cess || 0)
        tempObj.push(e?.stateOfSupplyName)
        prepare?.push(tempObj);
      });


      header = ['#', 'GSTIN', 'Invoice No', 'Date', 'Invoice Amt', 'Rate', 'Cess Rate', 'Taxable Amt', 'R Charge', 'IGST', 'CGST', 'SGST', 'Cess', 'Supply Name']

    }

    if (this.reportType === 'partyReport') {

      this.dataSource?.filteredData?.forEach((e: any) => {
        const tempObj = [];
        tempObj.push(e?.partyName)
        tempObj.push(e?.taxNumber)
        tempObj.push(e?.receivable)
        tempObj.push(e?.payable)

        prepare?.push(tempObj);
      });


      header = ['Party Name', 'GSTIN', 'Receivable Balance', 'Payable Balance']

    }
    if (this.reportType === 'jobReport') {

      this.dataSource?.filteredData?.forEach((e: any) => {
        const tempObj = [];
        tempObj.push(e?.batchNo);
        tempObj.push(this.datePipe?.transform(e?.createdOn, 'dd-MM-yyyy'));
        tempObj.push(e?.shipperName);
        tempObj.push(e?.consigneeName)
        tempObj.push(e?.hblNumber)
        tempObj.push(e?.mblNumber)
        tempObj.push(this.datePipe?.transform(e?.departureTime, 'dd-MM-yyyy') || '')
        tempObj.push(this.datePipe?.transform(e?.arrivalTime, 'dd-MM-yyyy') || '')
        tempObj.push(e?.statusOfBatch)
        prepare?.push(tempObj);
      });

      header = ["Job No",
        "Shipper Name",
        "Consignee Name",
        "HBL Number",
        "MBL Number",
        "Departure Date",
        "Arrival Date",
        "Status"]

    }

    if (this.reportType === 'dailyReportWH') {

      this.dataSource?.filteredData?.forEach((e: any) => {
        const tempObj = [];
        tempObj.push(e?.jobNo);
        tempObj.push(e?.partyName);
        tempObj.push(e?.chaName);
        tempObj.push(this.datePipe?.transform(e?.nocDate, 'dd-MM-yyyy'));
        tempObj.push(e?.section);
        tempObj.push(e?.bondNo);
        tempObj.push(e?.boe);
        tempObj.push(e?.blNo);
        tempObj.push(this.datePipe?.transform(e?.receivedDate, 'dd-MM-yyyy'));
        tempObj.push(e?.inDutyAmt);
        tempObj.push(e?.dutyPaid);
        tempObj.push(e?.balanceDuty);
        tempObj.push(e?.dutyStatus);
        tempObj.push(e?.containerInWardCount);
        tempObj.push(e?.containerSize);
        tempObj.push(e?.inPackages);
        tempObj.push(e?.outPackages);
        tempObj.push(e?.inWarehouse)
        tempObj.push(e?.inwardLocation);
        tempObj.push(e?.dispatchRemarks);
        prepare?.push(tempObj);
      });

      header = [
        "jobNo",
        "partyName",
        "chaName",
        "nocDate",
        "section",
        "bondNo",
        "boe",
        "blNo",
        "receivedDate",
        "inDutyAmt",
        "dutyPaid",
        "balanceDuty",
        "dutyStatus",
        "containerInWardCount",
        "containerSize",
        "inPackages",
        "outPackages",
        "inWarehouse",
        "inwardLocation",
        "dispatchRemarks",
      ]

    }

    if (this.reportType === 'inwardReportWH') {

      this.dataSource?.filteredData?.forEach((e: any) => {
        const tempObj = [];
        tempObj.push(e?.jobNo);
        tempObj.push(this.datePipe?.transform(e?.inWardDate, 'dd-MM-yyyy'));
        tempObj.push(e?.boe);
        tempObj.push(e?.blNo);
        tempObj.push(e?.chaName);
        tempObj.push(e?.partyName);
        tempObj.push(e?.vehicleNumber);
        tempObj.push(e?.containerNo);
        tempObj.push(e?.containerSize);
        tempObj.push(e?.qty);
        tempObj.push(e?.packageType);
        tempObj.push(e?.cargo);
        tempObj.push(e?.locationInward);
        tempObj.push(e?.labour);
        tempObj.push(e?.equipment);
        tempObj.push(e?.supervisor);
        prepare?.push(tempObj);
      });

      header = [
        "jobNo",
        "inWardDate",
        "boe",
        "blNo",
        "chaName",
        "partyName",
        "vehicleNumber",
        "containerNo",
        "containerSize",
        "qty",
        "packageType",
        "cargo",
        "locationInward",
        "labour",
        "equipment",
        "supervisor",
      ]
    }

    if (this.reportType === 'trackStockReportWH') {
      this.dataSource?.filteredData?.forEach((e: any) => {
        const tempObj = [];
        tempObj.push(e?.jobNo);
        tempObj.push(e?.partyName);
        tempObj.push(e?.chaName);
        tempObj.push(e?.inBondBoe);
        tempObj.push(e?.numOfContainer);
        tempObj.push(e?.inBondPackage);
        tempObj.push(e?.exBondBoe);
        tempObj.push(e?.exBondPackage);
        tempObj.push(e?.balanceInWarehouse);
        tempObj.push(e?.status);
        tempObj.push(e?.remarks);

        prepare?.push(tempObj);
      });

      header = [
        "jobNo",
        "partyName",
        "chaName",
        "inBondBoe",
        "numOfContainer",
        "inBondPackage",
        "exBondBoe",
        "exBondPackage",
        "balanceInWarehouse",
        "status",
        "remarks"
      ]
    }

    if (this.reportType === 'dispatchReportWH') {
      this.dataSource?.filteredData?.forEach((e: any) => {
        const tempObj = [];
        tempObj.push(e?.jobNo);
        tempObj.push(this.datePipe?.transform(e?.dispatchDate, 'dd-MM-yyyy'));
        tempObj.push(e?.inbondBoe);
        tempObj.push(e?.exBoe);
        tempObj.push(e?.blNoInWard);
        tempObj.push(e?.chaName);
        tempObj.push(e?.partyName)
        tempObj.push(e?.vehicleNumber)
        tempObj.push(e?.containerNo)
        tempObj.push(e?.containerSize);
        tempObj.push(e?.cargo);
        tempObj.push(e?.qty)
        tempObj.push(e?.packageType)
        tempObj.push(e?.location)
        tempObj.push(e?.labour);
        tempObj.push(e?.equipment);
        tempObj.push(e?.supervisor)
        prepare?.push(tempObj);
      });

      header = [
        "jobNo",
        "dispatchDate",
        "inbondBoe",
        "exBoe",
        "blNoInWard",
        "chaName",
        "partyName",
        "vehicleNumber",
        "containerNo",
        "containerSize",
        "cargo",
        "qty",
        "packageType",
        "location",
        "labour",
        "equipment",
        "supervisor",
      ]
    }

    if (this.reportType === 'warehouseProductivityWH') {
      this.dataSource?.filteredData?.forEach((e: any) => {
        const tempObj = [];
        tempObj.push(e?.jobNo);
        tempObj.push(e?.warehouseName);
        tempObj.push(e?.location)
        tempObj.push(e?.code);
        tempObj.push(e?.chaName);
        tempObj.push(e?.partyName)
        tempObj.push(e?.itemDesciption);
        tempObj.push(e?.containers);
        tempObj.push(e?.containerSize);
        tempObj.push(e?.qtyStored)
        tempObj.push(e?.storageType)
        tempObj.push(e?.duration)
        tempObj.push(e?.totalCapacity);
        tempObj.push(e?.occupiedCapacity);
        tempObj.push(e?.availableCapacity)
        prepare?.push(tempObj);
      });

      header = [

        "jobNo",
        "warehouseName",
        "location",
        "code",
        "partyName",
        "chaName",
        "itemDesciption",
        "containers",
        "containerSize",
        "qtyStored",
        "storageType",
        "duration",
        "totalCapacity",
        "occupiedCapacity",
        "availableCapacity",

      ]

    }

    if (this.reportType === 'trackRepackingReportWH') {
      this.dataSource?.filteredData?.forEach((e: any) => {
        const tempObj = [];
        tempObj.push(e?.jobNo);
        tempObj.push(this.datePipe?.transform(e?.jobDate, 'dd-MM-yyyy'));
        tempObj.push(e?.partyName)
        tempObj.push(e?.chaName);
        tempObj.push(e?.boe);
        tempObj.push(e?.cargo);
        tempObj.push(e?.qty)
        tempObj.push(e?.packageType);
        tempObj.push(e?.packedBy)
        tempObj.push(e?.location);
        tempObj.push(e?.supervisor)
        prepare?.push(tempObj);
      });

      header = [
        "jobNo",
        "jobDate",
        "partyName",
        "chaName",
        "boe",
        "cargo",
        "qty",
        "packageType",
        "packedBy",
        "location",
        "supervisor",
      ]
    }

    if (this.reportType === 'monthlyAuditReportWH') {
      this.dataSource?.filteredData?.forEach((e: any) => {
        const tempObj = [];
        tempObj.push(e?.jobNo);
        tempObj.push(e?.partyName)
        tempObj.push(e?.chaName);
        tempObj.push(e?.boe);
        tempObj.push(this.datePipe?.transform(e?.boeDate, 'dd-MM-yyyy'));
        tempObj.push(e?.bondNo);
        tempObj.push(this.datePipe?.transform(e?.bondDate, 'dd-MM-yyyy'));

        tempObj.push(e?.section);
        tempObj.push(e?.goods)
        tempObj.push(e?.qty);
        tempObj.push(e?.dateofexpiryofinitialbondingPeriod);
        tempObj.push(e?.detailsofExtensions)
        tempObj.push(e?.remarks)
        prepare?.push(tempObj);
      });

      header = [
        "jobNo",
        "partyName",
        "chaName",
        "boe",
        "boeDate",
        "bondNo",
        "bondDate",
        "section",
        "goods",
        "qty",
        "dateofexpiryofinitialbondingPeriod",
        "detailsofExtensions",
        "remarks"
      ]
    }

    if (this.reportType === 'clientsMonthlyReportWH') {
      this.dataSource?.filteredData?.forEach((e: any) => {
        const tempObj = [];
        tempObj.push(e?.jobNo);
        tempObj.push(e?.partyName)
        tempObj.push(e?.chaName);
        tempObj.push(e?.boe);
        tempObj.push(e?.itemDesciption);
        tempObj.push(this.datePipe?.transform(e?.inwardDate, 'dd-MM-yyyy'));
        tempObj.push(e?.pkg)
        tempObj.push(this.datePipe?.transform(e?.dispatchDate, 'dd-MM-yyyy'));
        tempObj.push(e?.dispatchQty);
        tempObj.push(e?.balanceQty);
        tempObj.push(e?.storageDuration)
        prepare?.push(tempObj);
      });

      header = [
        "jobNo",
        "partyName",
        "chaName",
        "boe",
        "itemDesciption",
        "inwardDate",
        "pkg",
        "dispatchDate",
        "dispatchQty",
        "balanceQty",
        "storageDuration"
      ]

    }

    if (this.reportType === 'giveTrackReportWH') {
      this.dataSource?.filteredData?.forEach((e: any) => {
        const tempObj = [];
        tempObj.push(e?.jobNo);
        tempObj.push(e?.nocNo);
        tempObj.push(e?.partyName)
        tempObj.push(e?.chaName);
        tempObj.push(this.datePipe?.transform(e?.nocDate, 'dd-MM-yyyy'));
        tempObj.push(e?.numOfContainer);
        tempObj.push(e?.packingList);
        tempObj.push(e?.billOfLanding)
        tempObj.push(e?.commercialInvoice);
        tempObj.push(e?.billOfEntry);
        tempObj.push(e?.outOfCharge);
        tempObj.push(e?.gatepass);
        tempObj.push(e?.bond);
        tempObj.push(e?.permission)
        tempObj.push(e?.deliveryOrder);
        tempObj.push(e?.sealIntact);
        tempObj.push(e?.gatepass);
        tempObj.push(e?.bond);
        tempObj.push(e?.permission)
        tempObj.push(e?.deliveryOrder);
        tempObj.push(e?.exBillOfEntry);
        tempObj.push(e?.exOutOfCharge);
        tempObj.push(e?.exGatepass);
        tempObj.push(e?.dutyChallan);
        tempObj.push(e?.gateInReqLetter)
        prepare?.push(tempObj);
      });

      header = [
        "nocNo",
        "partyName",
        "chaName",
        "numOfContainer",
        "nocDate",
        "packingList",
        "billOfLanding",
        "commercialInvoice",
        "billOfEntry",
        "outOfCharge",
        "gatepass",
        "bond",
        "permission",
        "deliveryOrder",
        "sealIntact",
        "exBillOfEntry",
        "exOutOfCharge",
        "exGatepass",
        "dutyChallan",
        "gateInReqLetter"
      ]
    }

    if (this.reportType === 'bookingDetailReport') {

      this.dataSource?.filteredData?.forEach((e: any) => {
        const tempObj = [];
        tempObj.push(e?.batchNo);
        tempObj.push(this.datePipe?.transform(e?.createdOn, 'dd-MM-yyyy'));
        tempObj.push(e?.shipperName);
        tempObj.push(e?.consigneeName)


        tempObj.push(e?.loadPortName)
        tempObj.push(e?.destPortName)
        tempObj.push(e?.locationName)
        tempObj.push(this.datePipe?.transform(e?.etd, 'dd-MM-yyyy') || '')

        tempObj.push(e?.vesselName)
        tempObj.push(this.datePipe?.transform(e?.eta, 'dd-MM-yyyy') || '')

        tempObj.push(e?.hblNumber)
        tempObj.push(e?.mblNumber)
        tempObj.push(e?.containerNumber)
        tempObj.push(e?.agentName)
        tempObj.push(e?.shippinglineName)
        tempObj.push(e?.buyEstimateAmount)
        tempObj.push(e?.sellEstimateAmount)
        tempObj.push(e?.sellEstimateAmount - e?.buyEstimateAmount)
        tempObj.push(this.datePipe?.transform(e?.doDate, 'dd-MM-yyyy') || '')
        tempObj.push(e?.remarks)
        prepare?.push(tempObj);
      });

      header = [
        "batchNo",
        "batchDate",
        "shipperName",
        "consigneeName",
        "loadPortName",
        "destPortName",
        "locationName",
        "etd",
        "vesselName",
        "eta",
        "hblNumber",
        "mblNumber",
        "containerNumber",
        "agentName",
        "shippinglineName",
        "buyEstimateAmount",
        "sellEstimateAmount",
        "commission",
        "doDate",
        "remarks"
      ]

    }


    if (this.reportType === 'pendingHBLTelex') {

      this.dataSource?.filteredData?.forEach((e: any) => {
        const tempObj = [];
        tempObj.push(this.datePipe?.transform(e?.doDate, 'dd-MM-yyyy') || '')
        tempObj.push(e?.batchNo)
        tempObj.push(e?.shipperName)
        tempObj.push(e?.consigneeName)
        tempObj.push(e?.loadPortName);
        tempObj.push(e?.destPortName);
        tempObj.push(e?.locationName);
        tempObj.push(e?.agentName)
        tempObj.push(e?.hblNumber)
        tempObj.push(e?.mblNumber.replace(/,\s*/g, '\n') || '');
        tempObj.push(
          e?.containerNos
            ? e.containerNos
              .split(/\s*\n\s*|\s*,\s*/) // handles newline OR comma input
              .filter(Boolean)
              .map(c => `${c.trim()},`)
              .join('\n')
            : ''
        );
        tempObj.push(e?.vesselName)
        tempObj.push(this.datePipe?.transform(e?.departureTime, 'dd-MM-yyyy') || '')
        tempObj.push(this.datePipe?.transform(e?.arrivalTime, 'dd-MM-yyyy') || '')
        tempObj.push(e?.totalDays)

        prepare?.push(tempObj);
      });

      header = [
        "DO Date", "Job No", "Shipper", "Consignee Name", "POL", "POD", "Destination", "Agent Name", "HBL No.", "MBL No.", "CNTR No.", "Vessel", "Departure Date", "Arrival Date", "Days Released"
      ];
    }

    if (this.reportType === 'telexDateWiseReport') {

      this.dataSource?.filteredData?.forEach((e: any) => {
        const tempObj = [];
        tempObj.push(e?.batchNo)
        tempObj.push(this.datePipe?.transform(e?.telexDate, 'dd-MM-yyyy') || '')
        tempObj.push(e?.blType)
        tempObj.push(e?.blNumber)
        tempObj.push(e?.shipperName);
        tempObj.push(e?.consigneeName);
        tempObj.push(e?.containers?.join(', '));
        tempObj.push(e?.blStatus)
        prepare?.push(tempObj);
      });

      header = [
        "batchNo",
        "telexDate",
        "blType",
        "blNumber",
        "shipperName",
        "consigneeName",
        "containers",
        "blStatus"
      ];
    }

    if (this.reportType === 'partyReport') {

      this.dataSource?.filteredData?.forEach((e: any) => {
        const tempObj = [];
        tempObj.push(e?.partyName)
        tempObj.push(e?.taxNumber)
        tempObj.push(e?.receivable)
        tempObj.push(e?.payable)
        prepare?.push(tempObj);
      });
      header = ['Party Name', 'GSTIN', 'Receivable Balance', 'Payable Balance']

    }

    if (this.reportType === 'expenseReport') {
      this.dataSource?.filteredData?.forEach((e: any) => {
        const tempObj = [];
        tempObj.push(this.datePipe?.transform(e?.createdOn, 'dd-MM-yyyy'))
        tempObj.push(e?.invoiceNo)
        tempObj.push(e?.invoiceFromName)
        tempObj.push(e?.paymentMode)
        tempObj.push(e?.invoiceAmount)
        tempObj.push(e?.paidAmount)
        tempObj.push(e?.balanceAmount)
        tempObj.push(e?.remarks)
        tempObj.push(e?.hbl)
        tempObj.push(e?.packagesNo)
        tempObj.push(e?.batchNo)

        prepare?.push(tempObj);
      });



      header = ['createdOn',
        'Invoice No.',
        'Party',
        'Type',
        'Total',
        'Received/Paid',
        'Balance ',
        'Desc',
        'MBL/HBL',
        'Packs No',
        'Job No.']
    }


    if (this.reportType === 'ledgerReport') {
      this.dataSource?.filteredData?.forEach((e: any, i) => {
        const tempObj = [];
        tempObj.push(i + 2)
        tempObj.push(this.datePipe?.transform(e?.createdOn, 'dd-MM-yyyy'))
        tempObj.push(e?.batchNo)
        tempObj.push(e?.mbl + '/' + e?.hbl)
        tempObj.push(e?.containers)
        tempObj.push(e?.transactionType)
        tempObj.push(e?.paymentNo)
        tempObj.push(e?.paymentType)
        tempObj.push(e?.paymentRefNo)
        tempObj.push(e?.paymentStatus)
        tempObj.push(e?.amountType == 'Debit' ? Number(e?.invoiceAmount).toFixed(2) || 0 : 0)
        tempObj.push(e?.amountType != 'Debit' ? Number(e?.invoiceAmount).toFixed(2) || 0 : 0)
        tempObj.push(Number(e?.runningBalance).toFixed(2))


        prepare?.push(tempObj);
      });

      const tempObj = [];
      tempObj.push(1)
      tempObj.push(this.datePipe?.transform(this.date[1] ? this.datePipe?.transform(this.date[1], 'dd-MM-yyyy') : new Date().setMonth(new Date().getMonth() - 6), 'dd-MM-yyyy'))
      tempObj.push('')
      tempObj.push('')
      tempObj.push('')
      tempObj.push('Receivable Beginning Balance')
      tempObj.push('')
      tempObj.push('')
      tempObj.push('')
      tempObj.push('')
      tempObj.push(Number(this.ledgerOpeningBalance || 0).toFixed(2))
      tempObj.push('')
      tempObj.push(Number(this.ledgerOpeningBalance || 0).toFixed(2))


      prepare?.unshift(tempObj);

      header = ['#',
        'Date',
        'Job No.',
        'MBL/HBL',
        'Containers',
        'TXN Type',
        'P No.',
        'Type',
        'Ref No.',
        'Status',
        'Debit',
        'Credit',
        'Running Balance',
      ]
    }

    if (this.reportType === 'gstr1Report') {
      this.dataSource?.filteredData?.forEach((e: any, i) => {
        const tempObj = [];
        tempObj.push(i + 1)
        tempObj.push(e?.gstNumber || '')
        tempObj.push(e?.invoiceNo)
        tempObj.push(this.datePipe?.transform(e?.createdOn, 'dd-MM-yyyy'))
        tempObj.push(Number(e?.invoiceAmount || 0)?.toFixed(2))
        tempObj.push(e?.rate || 0)
        tempObj.push(e?.cessRate || 0)
        tempObj.push(Number(e?.taxableValue || 0)?.toFixed(2))
        tempObj.push(e?.gstType != 'cgst' ? Number(e?.invoiceTaxAmount)?.toFixed(2) || 0 : 0)
        tempObj.push(e?.gstType == 'cgst' ? (Number(e?.invoiceTaxAmount || 0) / 2)?.toFixed(2) || 0 : 0)
        tempObj.push(e?.gstType == 'cgst' ? (Number(e?.invoiceTaxAmount || 0) / 2)?.toFixed(2) || 0 : 0)
        tempObj.push(e?.cess || 0)
        tempObj.push(e?.stateOfSupplyName)



        prepare?.push(tempObj);
      });
      header = ['#', 'GSTIN', 'Invoice No', 'Date', 'Invoice Amt', 'Rate', 'Cess Rate', 'Taxable Amt', 'IGST', 'CGST', 'SGST', 'Cess', 'Supply Name']

    }

    if (this.reportType === 'bookingreport') {
      this.dataSource?.filteredData?.forEach((e: any) => {
        const tempObj = [];
        tempObj.push(e?.jobNo);
        tempObj.push(e?.inquiryNo);
        tempObj.push(e?.status);
        tempObj.push(this.datePipe?.transform(e?.createdOn, 'dd-MM-yyyy'))
        tempObj.push(e?.freightType)
        tempObj.push(e?.loadPortName)
        tempObj.push(e?.destPortName)
        tempObj.push(e?.consigneeName)
        tempObj.push(e?.shippingLineName)
        tempObj.push(e?.vesselName)
        tempObj.push(e?.voyageNumber)
        tempObj.push(e?.shipperName)
        tempObj.push(e?.forwarderName)
        prepare?.push(tempObj);
      });

      header = ['Job No.', 'Inquiry No.', 'Status', 'Date', 'Freight Type', 'POL', 'POD', 'Consignee', 'SLINE', 'Vessel', 'Voyage', 'Shipper', 'Forwarder']


    }
    if (flag) {
      if (this.reportType === 'gstr3bReport' || this.reportType == 'gstr9Report') {
        return false;
      }

      const wsData = [
        header,
        ...prepare
      ];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, this.reportType);
      XLSX.writeFile(wb, `${this.reportType}.xlsx`);
    } else {


      if (this.reportType == 'gstr3bReport') {
        doc = new jsPDF('p', 'mm', 'a4');
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(this.gstData.title, 14, 15);

        // Section 1: Outward Supplies
        doc.setFontSize(10);
        doc.text("1. Details of outward supplies and inward supplies liable to reverse charge", 14, 30);
        autoTable(doc, {
          startY: 35,
          head: [["Nature of supplies", "Total taxable value", "Integrated Tax", "Central Tax", "State/UT Tax", "Cess"]],
          body: this.gstData.outwardSupplies,
          theme: 'grid',
          headStyles: {
            fillColor: [220, 220, 220],
            textColor: [0, 0, 0],
            // fontStyle: 'bold',
            // halign: 'center'
          },
          styles: {
            font: "helvetica",
            fontSize: 7,
            cellPadding: 1,
            textColor: [0, 0, 0],
          },
          // alternateRowStyles: {
          //   fillColor: [240, 240, 240]
          // }
        });

        // Section 2 
        doc.text("2. Details of inter-State supplies made to un-regi persons,composition dealer and UIN holders", 14, doc.lastAutoTable.finalY + 10);
        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 15,
          head: [["Place of supply (State/UT)",
            "Unregistered Persons Taxable Amt", "Integrated  Tax",
            "Taxable Persons Taxable Amt", "Integrated  Tax",
            "UIN holders Taxable", "Integrated  Tax",]],
          body: this.gstData.suppliesDetails,
          theme: 'grid',
          headStyles: {
            fillColor: [220, 220, 220],
            textColor: [0, 0, 0],
            // fontStyle: 'bold',
            // halign: 'center'
          },
          styles: {
            font: "helvetica",
            fontSize: 7,
            cellPadding: 1,
            textColor: [0, 0, 0],
          },
          // alternateRowStyles: {
          //   fillColor: [240, 240, 240]
          // }
        });

        // Section 3: Eligible ITC
        doc.text("3. Details of eligible Input Tax Credit", 14, doc.lastAutoTable.finalY + 10);

        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 15,
          head: [['Details', 'Integrated tax', 'Central tax', 'State/UT tax', 'Cess']],
          body: this.gstData.eligibleITC,
          theme: 'grid',
          styles: {
            font: "helvetica",
            fontSize: 7,
            cellPadding: 1,
            textColor: [0, 0, 0],
          },
          headStyles: {
            fillColor: [220, 220, 220],
            textColor: 0, // Black text
            // fontStyle: 'bold'
          },
          // columnStyles: {
          //   0: { cellWidth: 100 }, // Wider first column for descriptions
          //   1: { cellWidth: 25 },
          //   2: { cellWidth: 25 },
          //   3: { cellWidth: 25 },
          //   4: { cellWidth: 20 }
          // }
        });

        // Section 4: Exempt Supplies
        doc.text("4. Details of exempt, nil-rated and non-GST inward supplies", 14, doc.lastAutoTable.finalY + 10);
        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 15,
          head: [["Nature of supplies", "Inter-State supplies", "Intra-State supplies"]],
          body: this.gstData.exemptSupplies,
          theme: 'grid',
          headStyles: {
            fillColor: [220, 220, 220],
            textColor: [0, 0, 0],
            // fontStyle: 'bold',
            // halign: 'center'
          },
          styles: {
            font: "helvetica",
            fontSize: 7,
            cellPadding: 1,
            textColor: [0, 0, 0],
          },
          // alternateRowStyles: {
          //   fillColor: [240, 240, 240]
          // }
        });

        doc.text('5.1 Interest and Late Fee for Previous Tax Period', 14, doc.lastAutoTable.finalY + 10);

        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 15,
          head: [['Details', 'Integrated Tax', 'Central Tax', 'State/UT Tax', 'Cess']],
          body: this.gstData?.InterestLatefeePDF,
          theme: 'grid',
          styles: { font: "helvetica", fontSize: 7, textColor: [0, 0, 0], cellPadding: 1 },
          headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0] },
          // columnStyles: {
          //   0: { cellWidth: 80 },  // Details column
          //   1: { cellWidth: 30 },  // Integrated Tax
          //   2: { cellWidth: 30 },  // Central Tax
          //   3: { cellWidth: 30 },  // State/UT Tax
          //   4: { cellWidth: 30 }   // Cess
          // }
        });

        doc.text('6.1 Payment of Tax', 14, doc.lastAutoTable.finalY + 10);

        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 15,
          head: [['Description', 'Total tax payable', 'Tax paid through ITC - IGST', 'CGST', 'SGST', 'Tax paid in cash', 'Interest paid in cash', 'Late fee paid in cash']],
          body: this.gstData?.PaymentoftxPDF,
          theme: 'grid',
          styles: { font: "helvetica", fontSize: 7, textColor: [0, 0, 0], cellPadding: 1 },
          headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0] },
          // columnStyles: {
          //   0: { cellWidth: 50 },  // Description column
          //   1: { cellWidth: 25 },  // Total tax payable
          //   2: { cellWidth: 25 },  // ITC Integrated tax
          //   3: { cellWidth: 25 },  // ITC Central tax
          //   4: { cellWidth: 25 },  // ITC State/UT tax
          //   5: { cellWidth: 20 },  // ITC Cess
          //   6: { cellWidth: 25 },  // Tax paid in cash
          //   7: { cellWidth: 25 },  // Interest paid in cash
          //   8: { cellWidth: 25 }   // Late fee paid in cash
          // }
        });

        doc.text('Breakup of Tax Liability Declared (for Interest Computation)', 14, doc.lastAutoTable.finalY + 10);

        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 15,
          head: [['Period', 'Integrated Tax', 'Central Tax', 'State/UT Tax', 'Cess']],
          body: this.gstData?.BreakupoftaxPDF,
          theme: 'grid',
          styles: { font: "helvetica", fontSize: 7, textColor: [0, 0, 0], cellPadding: 1 },
          headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0] },
          // columnStyles: {
          //   0: { cellWidth: 40 },  // Period
          //   1: { cellWidth: 40 },  // Integrated Tax
          //   2: { cellWidth: 40 },  // Central Tax
          //   3: { cellWidth: 40 },  // State/UT Tax
          //   4: { cellWidth: 30 }   // Cess
          // }
        });



        const verificationText = `
      Verification: 
        I hereby solemnly affrm and declare that the information given herein above is true and correct to the best of my knowledge and belief and
        nothing has been concealed there from.
        
      Place:                                                                                                                Signature: ________________________
        
      Signatory:                                                                                                         Name of Authorised: _______________________
        
      Date:                                                                                                                 Designation / Status: ________________________
        `;

        doc.setFontSize(8);
        // doc.setFont('times', 'normal');
        doc.text(verificationText, 14, (doc as any).lastAutoTable.finalY + 10);

        doc.save("GSTR3.pdf");
      } else if (this.reportType == 'gstr9Report') {
        this.generateGSTR9PDF()
      } else {
        let estimatedTableWidth = this.estimatePdfWidth(header, prepare);
        const leftMargin = 10;
        const rightMargin = 10;
        const totalPageWidth = estimatedTableWidth + leftMargin + rightMargin;

        // A4 height (210mm), dynamic width
        let doc = new jsPDF('l', 'mm', [totalPageWidth, 210]);
        if (this.reportType == 'bookingreport'
          || this.reportType == 'gstr1Report'
          || this.reportType == 'gstr2Report'
          || this.reportType == 'containerShippinglineReport'
          || this.reportType == 'containerAllocationDetailsReport'
          || this.reportType == 'telexReport'
          || this.reportType == 'inquiryreport'
          || this.reportType == 'hsnReport'
          || this.reportType == "profitLossreport") {
          doc = new jsPDF('l', 'mm', [totalPageWidth, 300]);
        } else if (this.reportType == 'dsrReport' || this.reportType == 'customerDsrReport') {
          doc = new jsPDF('l', 'mm', [totalPageWidth, 300]);
        } else {

          doc = new jsPDF('l', 'mm', [totalPageWidth, 300]);
        }



        if (this.reportType == 'ledgerReport') {
          const blob = this.imageURL;
          const reader = new FileReader();
          reader.onload = () => {
            const base64data = reader.result as string;
            const img = new Image();
            img.src = base64data;
            doc.addImage(base64data, 'PNG', 15, 10, 40, 20);

            // Trigger the print or save the document
            if (this.reportType == 'ledgerReport') {
              doc.save(this.reportType + '.pdf');
            }
          };

          reader.readAsDataURL(blob);

          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text(this.currentUser?.agentName, 195, 15, { align: "right" });

          doc.setFontSize(7);
          doc.setFont("helvetica", "normal");
          doc.text(this.currentUser?.addressInfo?.address, 195, 20, { align: "right" });
          doc.text(this.currentUser?.addressInfo?.cityName + ',' + this.currentUser?.addressInfo?.postalCode, 195, 24, { align: "right" });
          doc.text(`Pan No. ${this.currentUser?.panNo} `, 195, 28, { align: "right" });
          doc.text(`Phone no: ${this.currentUser?.primaryNo?.primaryNumber} Email: ${this.currentUser?.primaryMailId}`, 195, 32, { align: "right" });
          doc.text(`GSTIN: ${this.currentUser?.taxId}, State: ${this.currentUser?.addressInfo?.stateName}`, 195, 36, { align: "right" });

          doc.setLineWidth(0.1);
          doc.line(15, 40, 195, 40); // X1, Y1, X2, Y2
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        if (this.reportType == 'ledgerReport') {
          doc.text(this.reportData?.find((x) => this.reportType == x.id).name, 105, 50, { align: "center" });
        } else {
          doc.text(this.reportData?.find((x) => this.reportType == x.id).name, doc.internal.pageSize?.width / 2, 15, { align: "center" });
        }



        if (this.reportType == 'gstReport' || this.reportType == 'ledgerReport') {
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          let customerData = [];
          if (this.customer?.length > 0) {
            customerData = this.customerList
              ?.filter((x) => this.customer?.includes(x?.partymasterId)).map((x) => x?.name) || []; // Extract 'name' values
          }

          if (this.reportType == 'ledgerReport') {
            doc.text(`Party Name: ${customerData?.toString() || 'All Parties'}`, 15, 60);
          } else {
            doc.text(`Party Name:  ${customerData?.toString() || 'All Parties'} `, 15, 25);
          }

        }
        if (this.reportType == 'ledgerReport') {
          let customerData = [];
          if (this.customer?.length > 0) {
            customerData = this.customerList
              ?.filter((x) => this.customer?.includes(x?.partymasterId)).map((x) => x) || []; // Extract 'name' values
          }
          doc.setFontSize(7);
          doc.setFont("helvetica", "normal");
          const wrappedAddress = doc.splitTextToSize(`Address: ${customerData[0]?.branch[0]?.branch_address}`, doc.internal.pageSize?.width - 15 * 2);


          let yPosition = 65; // Initial Y position
          doc.text(wrappedAddress, 15, yPosition);

          // Adjust Y position based on the number of address lines
          yPosition += wrappedAddress.length * 2;
          doc.text(`${customerData[0]?.branch[0]?.branch_city},${customerData[0]?.branch[0]?.branch_state}, ${customerData[0]?.branch[0]?.branch_countryName}, ${customerData[0]?.branch[0]?.pinCode}`, 15, yPosition + 2);
          doc.text(`PAN N- ${customerData[0]?.branch[0]?.panNo || ''}`, 15, yPosition + 6);
          doc.text(`GSTIN: ${customerData[0]?.branch[0]?.tax_number || ''}`, 15, yPosition + 10);


        }
        if (this.reportType == 'gstReport' || this.reportType == 'ledgerReport') {
          doc.setFont("helvetica", "bold");
          if (this.date?.length > 0) {
            doc.setFontSize(10);


            if (this.reportType == 'ledgerReport') {
              doc.text(`Duration: From ${this.datePipe?.transform(this.date[0], 'dd/MM/yyyy')} to ${this.datePipe?.transform(this.date[1], 'dd/MM/yyyy')}`, 15, 82);

            } else {
              doc.text(`Duration: From ${this.datePipe?.transform(this.date[0], 'dd/MM/yyyy')} to ${this.datePipe?.transform(this.date[1], 'dd/MM/yyyy')}`, 15, 30);

            }


          }
        }
        autoTable(doc, {
          startY: 25,
          margin: { left: 10, right: 10 },
          head: [header],
          body: prepare,
          theme: 'grid',
          headStyles: {
            fillColor: [220, 220, 220],
            textColor: [0, 0, 0],
          },
          styles: {
            font: "helvetica",
            fontSize: 11,
            cellPadding: 1.2,
            textColor: [0, 0, 0],
            halign: 'center',
          },
          tableWidth: 'wrap',
          columnStyles: this.getDynamicColumnStyles(header, prepare, estimatedTableWidth),
        });
        if (this.reportType != 'ledgerReport') {
          doc.save(this.reportType + '.pdf');
        }

      }
    }

  }
  getDynamicColumnStyles(header: string[], body: any[][], totalTableWidth: number): { [key: number]: any } {
    const lengths = header.map((col, i) =>
      Math.max(col.length, ...body.map(row => (row[i]?.toString()?.length || 0)))
    );

    const totalLength = lengths.reduce((a, b) => a + b, 0);
    const styles: { [key: number]: any } = {};

    lengths.forEach((len, i) => {
      const headerName = header[i];
      const scaledWidth = (len / totalLength) * totalTableWidth;

      if (['MBL No.', 'MBL', 'CNTR No.'].includes(headerName)) {
        styles[i] = { cellWidth: 60, overflow: 'linebreak', halign: 'center' };
      } else if (headerName === 'Vessel') {
        styles[i] = { cellWidth: Math.max(scaledWidth, 60), overflow: 'hidden', halign: 'center' };
      } else if (headerName.toLowerCase().includes('final destination')) {
        styles[i] = { cellWidth: Math.max(scaledWidth, 60), overflow: 'hidden', halign: 'center' };
      } else {
        styles[i] = { cellWidth: scaledWidth, overflow: 'hidden', halign: 'center' };
      }
    });

    return styles;
  }

  estimatePdfWidth(header: string[], body: any[][]): number {
    const averageCharWidth = 2.6; // mm per character (can tune)
    const padding = 6;

    const widths = header.map((col, i) => {
      const maxLen = Math.max(
        col.length,
        ...body.map(row => (row[i]?.toString()?.length || 0))
      );
      return (maxLen * averageCharWidth) + padding;
    });

    return widths.reduce((acc, w) => acc + w, 0);
  }



  getReports(report, payload) {
    this.loaderService?.showcircle();
    this.dataSource = new MatTableDataSource([]);
    let url;
    if (report == 'VendorReport') {
      url = this.commonService?.getSTList('enquiryitem', payload)
    }
    // else if(report == 'telexReport'){
    //   url = this.commonService?.getSTList('deliveryorder', payload)
    // } 
    else {
      let collectionName = this.reportType == "customerDsrReport" ? "dsrReport" : report
      url = this.commonService?.getReports(collectionName, payload)
    }
    url.subscribe((res: any) => {

      if (this.reportType == 'gstr3bReport') {
        if (res) {
          this.patchGSTDATA(res)
        }

      } else if (this.reportType == 'gstr9Report') {
        if (res) {
          this.patchGSTR9(res)
        }
      } else {
        this.toalLength = res.totalCount;
        if (this.reportType === 'profitLossreport') {
          this.totalPL = res.totalPL;
          this.totalPLBuy = res.totalPLBuy;
          this.totalPLSell = res.totalPLSell;
        }
        this.count = res.documents.length;
        if (res.documents.length === 0) {
          // If no documents are returned, set dataSource to an empty array or array with zeros
          this.dataSource = new MatTableDataSource([]);
          this.loaderService?.hidecircle();
        } else {
          // Map the received data to your dataSource
          if (this.reportType == 'ledgerReport') {
            this.dataSource = new MatTableDataSource(
              res.documents.map((s, index) => ({
                ...s,
                id: index + 1,
                batchNo: s?.batchData?.map((x) => x?.batchNo).join(', ') || '',
                containers: s?.invoiceData?.map((x) => x?.containers).join(', ') || '',
                hbl: s?.invoiceData?.map((x) => x?.hblName).join(', ') || '',
                mbl: s?.invoiceData?.map((x) => x?.mblName).join(', ') || '',
              }))
            );
          } else {
            this.dataSource = new MatTableDataSource(
              res.documents.map((s, index) => {
                // Calculate total packages
                const totalPackages = s?.packageHBL?.reduce((sum: number, pkg: any) => {
                  return sum + (Number(pkg.package) || 0);
                }, 0);

                return {
                  ...s,
                  id: index + 1,
                  productName: s?.cargoDetail ? s.cargoDetail[0]?.productName : '',
                  country: 'India',
                  totalPackages // Add new field to datasource
                };
              })
            );
          }

          if (this.reportType === 'ledgerReport') {
            this.ledgerOpeningBalance = res?.initialAmount || 0
          }
          if (this.reportType == 'bankStatement') {
            let OpeningBalance = this.bankList?.filter((x) => x.bankId === this.bankName)[0]?.Opbalance || 0
            this.totalBankBalance = (Number(res?.creditTotal || 0) + Number(OpeningBalance || 0)) - (res?.debitTotal || 0)
          }

          if (this.reportType == 'dsrReport' || this.reportType == 'customerDsrReport') {
            const allMilestones = []
            this.dataSource?.filteredData?.filter((row) => row?.milestones?.filter(milestone => allMilestones.push(milestone?.milestoneName || ''))); // Flatten the nested arrays


            // this.displayedColumns = [
            //   '#',
            //   'createdOn',
            //   'remarks',
            //   "batchNo",
            //   "shipperName",
            //   "consigneeName",
            //   "loadPortName",
            //   "destPortName",
            //   "locationName",
            //   'shippingLineName',
            //   "NOC",
            //   "containersName",
            //   "mblNumber",
            //   "containersNo",
            //   "hblNumber",
            //   "vesselName",
            //   "etd",
            //   "eta",


            // ];

            // this.milestoneColumns = [...new Set(allMilestones)];
            // this.displayedColumns.push(...this.milestoneColumns);

          }

        }
      }
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort1;
      this.loaderService?.hidecircle();
    })
  }
  ledgerOpeningBalance: number = 0
  totalBankBalance: number = 0
  vesselId: any
  submitted0: boolean = false
  onGenerateReport() {

    if (this.reportType == "bankStatement") {
      this.submitted0 = true
      if (!this.bankName || this.bankName == '') {
        return
      }
    }
    if (this.reportType == "dsrReport" || this.reportType == "ledgerReport" || this.reportType == 'customerDsrReport') {
      this.submitted0 = true
      if (this.customer?.length == 0) {
        return
      }
    }
    if (this.reportType === 'gstr3bReport') {
      this.submitted0 = true
      if (!this.monthSelected || this.monthSelected == '') {
        return
      }
    }

    if (this.reportType === 'gstr9Report') {
      this.submitted0 = true
      if (!this.selectedFinancialYear || this.selectedFinancialYear == '') {
        return
      }
    }

    this.submitted0 = false
    // let payload = this.commonService?.filterList()

    let payload = {
      "project": [],
      "query": {},
      "sort": {},
      size: Number(1000),
      from: 0,
    };


    if (this.selectedFinancialYear) {
      payload.query['startYear'] = this.selectedFinancialYear.split('0')?.[0]
      payload.query['endYear'] = this.selectedFinancialYear.split('0')?.[1]
    }

    // if(this.reportType === 'enquiryreport'){
    if (this.customer?.length > 0) {
      payload.query['partyMasterId'] = this.customer
    }
    if (this.branch) {
      payload.query['branchId'] = this.branch
    }
    if (this.vessel) {
      payload.query['vesselId'] = this.vessel
    }
    if (this.voyage) {
      payload.query['voyageId'] = this.voyage
    }
    if (this.port) {
      payload.query['portId'] = this.port
    }
    if (this.sblChecked || this.sblChecked == false) {
      payload.query['sblChecked'] = this.sblChecked
    }
    if (this.isJobClose || this.isJobClose == false) {
      payload.query['isJobClose'] = this.isJobClose
    }
    if (this.groupOfComapny) {
      payload.query['partyMasterId'] = [this.groupOfComapny]
    }
    if (this.date?.length === 2) {
      let startdate = this.datePipe?.transform(this.date[0], 'yyyy-MM-dd')
      let enddate = this.datePipe?.transform(this.date[1], 'yyyy-MM-dd')
      payload.query['createdOn'] = {
        "$gt": startdate?.substring(0, 10) + 'T00:00:00.000Z',
        "$lt": enddate?.substring(0, 10) + 'T23:59:00.000Z'
      }
    }

    if (this.dateValidTill?.length === 2 && this.reportType === 'telexReport') {
      let startdate = this.datePipe?.transform(this.dateValidTill[0], 'yyyy-MM-dd')
      let enddate = this.datePipe?.transform(this.dateValidTill[1], 'yyyy-MM-dd')
      payload.query['validTill'] = {
        "$gt": startdate?.substring(0, 10) + 'T00:00:00.000Z',
        "$lt": enddate?.substring(0, 10) + 'T23:59:00.000Z'
      }
    }
    if (this.reportType === 'profitLossreport' && this.StartDate && this.EndDate) {
      let startdate = this.datePipe?.transform(this.StartDate, 'yyyy-MM-dd')
      let enddate = this.datePipe?.transform(this.EndDate, 'yyyy-MM-dd')
      payload.query['createdOn'] = {
        "$gt": startdate?.substring(0, 10) + 'T00:00:00.000Z',
        "$lt": enddate?.substring(0, 10) + 'T23:59:00.000Z'
      }
    }

    if (this.reportType === 'p&lreport' && this.StartDate && this.EndDate) {
      let startdate = this.datePipe?.transform(this.StartDate, 'yyyy-MM-dd')
      let enddate = this.datePipe?.transform(this.EndDate, 'yyyy-MM-dd')
      payload.query['createdOn'] = {
        "$gt": startdate?.substring(0, 10) + 'T00:00:00.000Z',
        "$lt": enddate?.substring(0, 10) + 'T23:59:00.000Z'
      }
    }
    if (this.bookingNo) {
      payload.query['batchNo'] = this.bookingNo
    }
    if (this.dueDate?.length === 2) {
      let startdate = this.datePipe?.transform(this.dueDate[0], 'yyyy-MM-dd')
      let enddate = this.datePipe?.transform(this.dueDate[1], 'yyyy-MM-dd')
      payload.query['dueDate'] = {
        "$gt": startdate?.substring(0, 10) + 'T00:00:00.000Z',
        "$lt": enddate?.substring(0, 10) + 'T23:59:00.000Z'
      }

    }

    if (this.selectedMilestone) {
      payload.query['statusOfJob'] = this.selectedMilestone
    }
    if (this.invoiceStatus) {
      payload.query['invoiceStatus'] = this.invoiceStatus
    }
    if (this.paymentStatus) {
      payload.query['paymentStatus'] = this.paymentStatus
    }
    if (this.shippingLine) {
      payload.query['shippingLineId'] = this.shippingLine
    }
    if (this.invoicingParty) {
      payload.query['invoicingParty'] = this.invoicingParty
    }
    if (this.freightTerms) {
      payload.query['shipmentTypeId'] = this.freightTerms
    }
    if (this.inquiryStatus) {
      payload.query['inquiryStatus'] = this.inquiryStatus
    }
    if (this.bankName) {
      payload.query['bankId'] = this.bankName
    }
    if (this.bookingStatus) {
      payload.query['bookingStatus'] = this.bookingStatus
    }
    if (this.cosignee) {
      payload.query['consigneeId'] = this.cosignee
    }
    if (this.shipper) {
      payload.query['shipperId'] = this.shipper
    }
    if (this.vendor) {
      payload.query = { ...payload.query, 'buyEstimates.supplier': this.vendor }
    }
    if (this.depoName) {
      payload.query = { ...payload.query, 'depoId': this.depoName }
    }

    if (this.selectedDate) {
      if (this.selectedDate == 'ATA') {
        payload.sort = { desc: ['routeDetails.ata'] }
      } else {
        payload.sort = { desc: ['routeDetails.atd'] }
      }
    }

    if (this.monthSelected) {
      payload.query['month'] = this.monthSelected
    }



    let sort: { [key: string]: string[] } = {};

    if (this.reportType === 'ledgerReport') {
      sort['asc'] = ['createdOn'];
    } else {
      sort['desc'] = ['createdOn'];
    }

    payload.sort = sort;


    if (this.reportType) this.getReports(this.reportType, payload)

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
  getPaginationData(type: any) {
    this.fromSize =
      type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;

    let payload = this.commonService?.filterList()
    payload.query = {
      "typeCategory": "Bold BI",
    }
    if (payload?.size) payload.size = Number(this.size),
      payload.from = this.fromSize - 1,
      payload.sort = {
        "desc": ["updatedOn"]
      }
    this.commonService
      .getSTList('systemtype', payload)?.subscribe((data) => {
        this.boldList = data.documents;
        this.toalLength = data.totalCount;
        this.page = type === 'prev' ? this.page - 1 : this.page + 1;
        this.count = type === 'prev' ? this.toalLength === this.count ? this.count - (this.toalLength % Number(this.size)) : this.count - data.documents.length : this.count + this.boldList
          .length
      })
  }
  // getreports() {

  //   let payload = this.commonService?.filterList()
  //   if(payload?.query)payload.query = { 
  //     "typeCategory": "Bold BI",
  //   }
  //   if(payload?.size)payload.size = Number(this.size),
  //   payload.from = this.page - 1,
  //   payload.sort = {
  //     "desc" : ["updatedOn"]
  // }
  //   this.commonService
  //     .getSTList('systemtype', payload) ??.subscribe((res) => {
  //     this.boldList = res.documents;
  //     this.toalLength = res.totalCount;
  //     this.count = res.documents.length;
  //     this.dataSource = new MatTableDataSource(
  //       res?.documents?.map((s: any) => s)
  //     );
  //     this.dataSource?.paginator = this.paginator;
  //     this.dataSource?.sort = this.sort1;
  //   })
  // }
  filter(e) {
    this.size = e?.target.value;
    this.fromSize = 1;
    const type = 'address';
    // this.getreports()
  }

  shipmentTypes: any = []
  inquiryStatusTypes: any = [];
  getAll() {
    this.loaderService?.showcircle();

    let payload = this.commonService?.filterList()
    if (payload?.query) payload.query = {
      "typeCategory": {
        "$in": [
          "carrierType", "reportType", "bookingStatus", "InquiryStatus"
        ]
      }
    }
    if (payload?.size) payload.size = 1000,
      payload.from = 0,
      payload.sort = { "desc": ['updatedOn'] }

    this.commonService?.getSTList('systemtype', payload)?.subscribe((data) => {
      this.bookingStatusList = data?.documents?.filter(x => x.typeCategory === "bookingStatus");
      // this.reportData = data?.documents?.filter(x => x.typeCategory === "reportType");
      this.shipmentTypes = data?.documents?.filter(x => x.typeCategory === "carrierType");
      this.inquiryStatusTypes = data?.documents?.filter(x => x.typeCategory === "InquiryStatus");

      this.loaderService?.hidecircle();
    }, () => {
      this.loaderService?.hidecircle();
    });
  }
  search() {

    let mustArray = {};
    mustArray["typeCategory"] = 'Bold BI'
    if (this.phone) {
      mustArray['module'] = {
        "$regex": this.phone,
        "$options": "i"
      }
    }
    if (this.addressname) {
      mustArray['typeName'] = {
        "$regex": this.addressname,
        "$options": "i"
      }
    }

    let payload = this.commonService?.filterList()
    payload.query = mustArray
    if (payload?.size) payload.size = Number(this.size),
      payload.from = this.fromSize - 1,
      payload.sort = {
        "desc": ["updatedOn"]
      }
    this.commonService
      .getSTList('systemtype', payload)?.subscribe((data) => {
        this.boldList = data.documents;
        this.toalLength = data.totalCount;
        this.count = data.documents.length;
        this.fromSize = 1
      })
  }
  formatPackageHBL(element: any): string {
    if (!element?.packageHBL) return '';
    return element.packageHBL
      .map(pkg => `${pkg.packageTypeName}: ${pkg.package}`)
      .join(', ');
  }

  redirect(data, name?) {
    this.router.navigate(['reports/st-reports', 'reportViewer'], { queryParams: { "boldId": data?.typeDescription, "reportname": data?.typeName } })
  }
  changeStatus(key, data) {
    this.commonService?.UpdateToST(`systemtype/${data.systemtypeId}`, { ...data, status: !data?.status })?.subscribe((res: any) => {
      if (res) {
        this.notification.create('success', 'Status Updated Successfully', '');
        setTimeout(() => {
          this.search();
        }, 1000);
      }
    }, error => {
      this.notification.create(
        'error',
        error?.error?.error?.message,
        ''
      );
    });
  }
  onOpenNew(content, country?: any) {
    if (country) {
      this.systemIdToUpdate = country.systemtypeId;
      this.addCountryForm.patchValue({
        reportId: country?.typeDescription,
        reportName: country?.typeName,
        status: country?.status,
      });
    }
    this.modalService?.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }
  get f() {
    return this.addCountryForm.controls;
  }
  onSave() {
    this.modalService?.dismissAll();
    this.submitted = false;
    this.systemIdToUpdate = null;
    this.addCountryForm.reset()
    this.addCountryForm.controls['status'].setValue(true);
    return null;
  }
  countryMasters() {
    this.submitted = true;
    if (this.addCountryForm.invalid) {
      return;
    }
    let dataupdate =
    {
      "systemtypeId": "",
      "orgId": "1",
      "override_orgId": "true",
      "status": this.addCountryForm.value?.status,
      "typeActive": true,
      "typeCategory": "Bold BI",
      "typeDescription": this.addCountryForm.value?.reportId,
      "typeName": this.addCountryForm.value?.reportName,
      "typeParentType": "ST",
      "typeRef": "ST",
      "typeRefId": "ST",
    }
    if (!this.systemIdToUpdate) {
      let data = [dataupdate];
      this.commonService?.addToST('systemtype', data[0])?.subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Added Successfully', '');
            this.onSave();
            setTimeout(() => {
              // this.getreports();
            }, 1000);
            this.clear();
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error', error?.error?.Error, '');
        }
      );
    } else {
      let newCountry = { ...dataupdate, systemtypeId: this.systemIdToUpdate };
      const data = [newCountry];
      this.commonService?.UpdateToST(`systemtype/${data[0].systemtypeId}`, data[0])?.subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Updated Successfully', '');
            this.onSave();
            setTimeout(() => {
              // this.getreports();
            }, 1000);
            this.clear();
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
    }
  }
  GOTODIY() {
    this.router.navigate(['reports/st-reports/reportEditor'])
  }
  gotoScheduleList() {
    this.router.navigate(['reports/st-reports/scheduleList'])
  }
  groupOfComanyList: any = []
  getPartyMasterDropDowns() {
    let payload = this.commonService?.filterList()
    if (payload) payload.query = {
      "status": true
    }
    this.commonService?.getSTList("partymaster", payload)?.subscribe((res: any) => {
      this.partyMasterNameList = res?.documents;

      this.groupOfComanyList = res?.documents?.filter((x) => x?.groupCompany)
      res?.documents?.filter((x) => {
        if (x.customerType) {
          x.customerType?.map((res: any) => {
            if (res?.item_text === 'Consignee') { this.consigneeList.push(x) }
            if (res?.item_text === 'Shipper') { this.shipperList.push(x) }
          })
        }
      });
    });
  }
  onDateRangeChange(value) {
    const currentDate = new Date();
    let startDate: Date;
    let endDate: Date = currentDate;

    switch (value) {
      case 'current_month':
        startDate = new Date(currentDate?.getFullYear(), currentDate?.getMonth(), 1);
        break;
      case 'last_3_months':
        startDate = new Date(currentDate?.getFullYear(), currentDate?.getMonth() - 3, 1);
        break;
      case 'last_6_months':
        startDate = new Date(currentDate?.getFullYear(), currentDate?.getMonth() - 6, 1);
        break;
      case 'last_year':
        startDate = new Date(currentDate?.getFullYear() - 1, currentDate?.getMonth(), 1);
        break;
      default:
        startDate = new Date();
    }
    this.StartDate = this.datePipe?.transform(startDate, 'yyyy-MM-dd')
    this.EndDate = this.datePipe?.transform(endDate, 'yyyy-MM-dd')
  }

  get f1() {
    return this.addtdsform.controls;
  }
  openModal(e, content): void {

    let creditAmout = 0
    this.dataSource?.filteredData.filter((x: any) => {
      if (x?.tdsType == 'Credit') {
        creditAmout += Number(x?.tdsAmount || 0)
      }
      if (x?.tdsType == 'Debit') {
        creditAmout -= Number(x?.tdsAmount || 0)
      }
    })

    this.addtdsform = this.fb.group(
      {

        from: ['TDS Bank', [Validators.required]],
        to: [this.selectBankTransfer == 'banktocash' ? 'Cash' : '', [Validators.required]],
        date: ['', [Validators.required]],
        amount: [creditAmout || 0, Validators.required],


      },
    );
    this.modalService?.open(content, {
      size: 'lg',
      backdrop: 'static',
      centered: true,
    });
  }
  cancel() {
    this.modalService?.dismissAll()
    this.selectBankTransfer = ''
  }
  addtdsform: FormGroup;
  submitted1: boolean = false;
  transferBankAmount() {
    this.submitted1 = true
    if (this.addtdsform.invalid) {
      return
    }
    let insertArray = [];
    (this.selectBankTransfer == 'tdstobank' ? ['TDS Bank', 'Bank'] : ['TDS Bank', 'Cash'])?.filter((x, index) => {

      insertArray.push({
        orgId: this.commonFunction.getAgentDetails().orgId || '',
        paymentTypeId: this.addtdsform.value?.paymentMode || '',
        paymentType: x || '',

        billNo: this.addtdsform.value?.billNo || '',
        paymentRefNo: this.addtdsform.value?.paymentRefNo || '',
        paymentDate: this.addtdsform.value?.billDate || '',
        amount: Number(this.addtdsform.value?.amount) || 0,

        remitance_bankId: '',
        remitance_bank: '',
        beneficiary_bankId: '',
        beneficiary_bank: '',

        // invoice_partyId: this.addtdsform.value?.customer,
        // invoice_party: recievedData[0]?.name,

        // recieved_from: recievedData[0]?.name,
        // recieved_fromId: this.addtdsform.value?.recieved_from,.



        "invoiceToId": this.addtdsform.value?.customer || '',
        "invoiceToName": this.customerList?.filter(x => x.partymasterId === this.addtdsform.value?.customer)[0]?.name || '',
        "invoiceFromId": this.addtdsform.value?.customer || '',
        "invoiceFromName": this.customerList?.filter(x => x.partymasterId === this.addtdsform.value?.customer)[0]?.name || '',

        "invoiceFromBranch": this.addtdsform.value?.billFromBranch || '',
        "invoiceFromBranchName": this.addtdsform.value?.billFromBranch || '',

        invoices: this.addtdsform.value?.invoice?.toString() || '',
        batchNo: '',
        batchId: '',
        // invoice_no: this.addtdsform.value?.invoice_no,
        "remarks": this.addtdsform.value?.remarks || '',
        currencyId: this.currentUser?.currency?.currencyId || '',
        currency: this.currentUser?.currency?.currencyCode?.toUpperCase() || '',
        // move_no: this.batchDetails ? this.batchDetails.moveNo : this.addtdsform.value?.move_no,
        isExport: (this.isExport || this.isTransport),
        // payment_status: this.addtdsform.value?.payment_status || '',
        document_name: this.addtdsform.value?.documentName || '',
        document_tag: this.addtdsform.value?.documentName || '',
        // cheque_amount: this.addtdsform.value?.cheque_amount?.toString(),
        upload_document: this.addtdsform.value?.documentName || '',
        filename: this.addtdsform.value?.documentName || '',
        status: true,
        "isDraft": false,
        "tenantId": "1",
        "bankId": (index == 0 || x == 'Cash') ? '' : this.addtdsform.value?.to || '',
        "bankName": (index == 0 || x == 'Cash') ? '' : this.bankList?.filter((x) => x.bankId === this.addtdsform.value?.to)[0]?.bankName || '',
        invoiceData: [],
        paymentStatus: 'Completed',
        chequeDate: this.addtdsform.value?.chequeDate || '',
        chequeStatus: this.addtdsform.value?.chequeStatus || '',
        withdrawalDate: this.addtdsform.value?.withdrawalDate || '',
        chequeNo: this.addtdsform.value?.chequeNo || '',
        // onAccountValue: this.onAccountValue?.toString() || '',
        // onAccountRemark: this.onAccountRemark || '',
        // onAccountTdsAmt: this.onAccountTdsAmount?.toString() || '0',
        // onAccountYear: this.onAccountTdsYear || '',
        // invoiceAmountPaid : Number(this.finalTotal) || 0,
        // invoiceAmount : Number(this.totalInvoiceValue) || 0,

        discount: this.addtdsform.value?.discount || 0,
        tds: this.addtdsform.value?.tds || 0,

        invoiceAmount: Number(this.addtdsform.value?.amount) || 0,
        paidAmount: Number(this.addtdsform.value?.amount) || 0,

        balanceAmount: 0,
        transactionType: this.selectBankTransfer == 'tdstobank' ? 'TDS Bank to Bank' : 'TDS Bank to Cash',
        amountType: index == 0 ? 'Debit' : 'Credit',
        stateOfSupply: '',
        stateOfSupplyName: '',
        "costItems": [],
        type: this.selectBankTransfer,
        tdsApplicable: index == 0 ? true : false,

        tdsAmount: Number(this.addtdsform.value?.amount) || 0,
        tdsPer: Number(this.addtdsform.value?.tdsPer) || 0,

        netAmount: Number(this.addtdsform.value?.amount) || 0,
      })
    })



    this.commonService?.batchInsert('payment/batchinsert', insertArray).subscribe((data: any) => {
      if (data) {
        this.submitted1 = false
        this.notification.create('success', 'Transfer Successfully', '');
        this.cancel()
      }
    }, (error) => {
      this.notification.create('error', error?.error?.error?.message, '');
    })
  }

  milestoneColumns: any = [];
  getMilestoneData(milestones: any[], milestoneName: string): string {
    const milestone = milestones.find(m => m.milestoneName?.toLowerCase() == milestoneName?.toLowerCase());
    return milestone ? ` ${milestone?.estimatedDate}` : 'N/A';
    // ${milestone?.actualDate} /
  }
  private modalRef: NgbModalRef;
  openSchedule() {
    let custData = this.customerList?.filter(x => this.customer?.includes(x.partymasterId)).map((c) => {
      return {
        name: c?.name,
        partymasterId: c?.partymasterId,
        primaryMailId: c?.primaryMailId,
      }
    }) || []


    this.modalRef = this.modalService?.open(ScheduleReportComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });

    this.modalRef.componentInstance.customerData = custData;
    this.modalRef.componentInstance.reportName = this.reportType;
    this.modalRef.componentInstance.getList.subscribe((res: any) => {
      if (res) {
      }
    })
  }

  gstData: any;
  patchGSTDATA(res) {

    this.gstData = {
      title: "GSTR 3B Report-" + (this.datePipe.transform(this.monthSelected, 'MMM-yyyy').toUpperCase()),
      outwardSupplies: [
        ["Outward taxable supplies (other than zero rated, nil rated, and exempted)", res?.totalTaxableAmount || "0", res?.igst || "0", res?.cgst || "0", res?.sgst || "0", "0"],
        ["Outward taxable supplies (zero rated)", res?.nonGstTotalTaxableAmount || "0", res?.nonGstAmount || "0", "0", "0", "0"],
        ["Other outward supplies (nil rated, exempted)", "0", "0", "0", "0", "0"],
        ["Inward supplies (liable to reverse charge)", res?.reverseTotalTaxableAmount || "0", res?.reverseChargeIgst || "0", res?.reverseChargeCgst || "0", res?.reverseChargeSgst || "0", "0"],
        ["Non-GST outward supplies", "0", "0", "0", "0", "0"]
      ],

      outwardSuppliesTable: [
        { nature: 'Outward taxable supplies', totalTaxableValue: res?.totalTaxableAmount || 0, integratedTax: res?.igst || 0, centralTax: res?.cgst || 0, stateTax: res?.sgst || 0, cess: 0 },
        { nature: 'Outward taxable supplies (zero rated)', totalTaxableValue: res?.nonGstTotalTaxableAmount || 0, integratedTax: res?.nonGstAmount, centralTax: 0, stateTax: 0, cess: 0 },
        { nature: 'Other outward supplies (nil rated, exempted)', totalTaxableValue: 0, integratedTax: 0, centralTax: 0, stateTax: 0, cess: 0 },
        { nature: 'Inward supplies (liable to reverse charge)', totalTaxableValue: res?.reverseTotalTaxableAmount || 0, integratedTax: res?.reverseChargeIgst || 0, centralTax: res?.reverseChargeCgst || 0, stateTax: res?.reverseChargeSgst || 0, cess: 0 },
        { nature: 'Non-GST outward supplies', totalTaxableValue: 0, integratedTax: 0, centralTax: 0, stateTax: 0, cess: 0 },
      ],

      suppliesDetails: res?.groupedPlaceData.map(item => [
        item.stateOfSupplyName,
        item?.unRegiTaxableAmount || 0,
        item?.unRegiTaxAmount,
        item?.regiTaxableAmount || 0,
        item?.regiTaxAmount || 0,
        "-",
        "-"
      ]),


      interStateSuppliesTable:
        res?.groupedPlaceData.map(item => {
          return {
            place: item.stateOfSupplyName,
            unregisteredTaxable: item?.unRegiTaxableAmount || 0,
            unregisteredTax: item.unRegiTaxAmount || 0,
            compositionTaxable: item?.regiTaxableAmount || 0,
            compositionTax: item.regiTaxAmount || 0,
            uinTaxable: 0,
            uinTax: 0
          }
        }),

      eligibleITC: [
        ['A. ITC Available (whether in full or part)', '', '', '', ''],
        ['(1) Import of goods', '0', '0', '0', '0'],
        ['(2) Import of services', '0', '0', '0', '0'],
        ['(3) Inward supplies liable to reverse charge (other than 1 & 2 above)', '0', '0', '0', '0'],
        ['(4) Inward supplies from ISD', '0', '0', '0', '0'],
        ['(5) All other ITC', res?.itcIgst || '0', res?.itcCgst || '0', res?.itcSgst || '0', '0'],

        ['B. ITC Reversed', '', '', '', ''],
        ['(1) As per rules 38, 42 & 43 of CGST Rules and section 17(5)', '0', '0', '0', '0'],
        ['(2) Others', '0', '0', '0', '0'],

        ['C. Net ITC available (A-B)', res?.itcIgst || '0', res?.itcCgst || '0', res?.itcSgst || '0', '0'],

        ['(D) Other Details', '0', '0', '0', '0'],
        ['(1) ITC reclaimed which was reversed under Table 4(B)(2) in earlier tax period', '0', '0', '0', '0'],
        ['(2) Ineligible ITC under section 16(4) & ITC restricted due to PoS rules', '0', '0', '0', '0']
      ],


      inputTaxCredit1: [
        { details: 'A. ITC Available (whether in full or part)', isHeader: true },
        { details: '(1) Import of goods', integratedTax: '0', centralTax: '0', stateTax: '0', cess: '0' },
        { details: '(2) Import of services', integratedTax: '0', centralTax: '0', stateTax: '0', cess: '0' },
        { details: '(3) Inward supplies liable to reverse charge (other than 1 & 2 above)', integratedTax: '0', centralTax: '0', stateTax: '0', cess: '0' },

        { details: '(4) Inward supplies from ISD', integratedTax: '0', centralTax: '0', stateTax: '0', cess: '0' },
        { details: '(5) All other ITC', integratedTax: res?.itcIgst || 0, centralTax: res?.itcCgst || 0, stateTax: res?.itcSgst || 0, cess: 0 },

        { details: 'B. ITC Reversed', isHeader: true },
        { details: '(1) As per rules 38, 42 & 43 of CGST Rules and section 17(5)', integratedTax: '0', centralTax: '0', stateTax: '0', cess: '0' },
        { details: '(2) Others', integratedTax: '0', centralTax: '0', stateTax: '0', cess: '0' },

        { details: 'C. Net ITC available (A-B)', integratedTax: res?.itcIgst || '0', centralTax: res?.itcCgst || '0', stateTax: res?.itcSgst || '0', cess: '0' },

        { details: '(D) Other Details', integratedTax: '0', centralTax: '0', stateTax: '0', cess: '0' },
        { details: '(1) ITC reclaimed which was reversed under Table 4(B)(2) in earlier tax period', integratedTax: '0', centralTax: '0', stateTax: '0', cess: '0' },
        { details: '(2) Ineligible ITC under section 16(4) & ITC restricted due to PoS rules', integratedTax: '0', centralTax: '0', stateTax: '0', cess: '0' }
      ],

      exemptSupplies: [
        ["From a supplier under composition scheme, Exempt and Nil rated supply", "0", "0"],
        ["Non-GST supply", res?.interState || "0", res?.intraStateCgst || "0"]
      ],

      exemptSuppliesTable: [
        { nature: 'From a supplier under composition scheme, Exempt and Nil rated supply', interState: 0, intraState: 0 },
        { nature: 'Non GST supply', interState: res?.interState || 0, intraState: res?.intraStateCgst || 0 },
      ],

      InterestLatefeePDF: [
        ['System computed Interest', '0', '0', '0', '0'],
        ['Interest Paid', '0', '0', '0', '0'],
        ['Late fee', '0', '0', '0', '0'],
      ],

      InterestLatefee: [
        { details: 'System computed Interest', integratedTax: '0', centralTax: '0', stateTax: '0', cess: '0' },
        { details: 'Interest Paid', integratedTax: '0', centralTax: '0', stateTax: '0', cess: '0' },
        { details: 'Late fee', integratedTax: '0', centralTax: '0', stateTax: '0', cess: '0' }
      ],

      PaymentoftxPDF: [
        ['(A) Other than reverse charge', '', '', '', '', '', '', '', ''],
        ['Integrated tax', res?.igst || '0', '0', '0', '0', '0', '0', '0', '0'],
        ['Central tax', res?.cgst || '0', '0', '0', '0', '0', '0', '0', '0'],
        ['State/UT tax', res?.sgst || '0', '0', '0', '0', '0', '0', '0', '0'],
        ['Cess', '0', '0', '0', '0', '0', '0', '0', '0'],

        ['(B) Reverse charge', '', '', '', '', '', '', '', ''],
        ['Integrated tax', res?.reverseChargeIgst || '0', '0', '0', '0', '0', '0', '0', '0'],
        ['Central tax', res?.reverseChargeCgst || '0', '0', '0', '0', '0', '0', '0', '0'],
        ['State/UT tax', res?.reverseChargeSgst || '0', '0', '0', '0', '0', '0', '0', '0'],
        ['Cess', '0', '0', '0', '0', '0', '0', '0', '0'],
      ],

      Paymentoftx: [
        { description: '(A) Other than reverse charge', isHeader: true },
        { description: 'Integrated tax', totalTaxPayable: res?.igst || '0', integratedTax: '0', centralTax: '0', stateTax: '0', cess: '0', taxPaidInCash: '0', interestPaidInCash: '0', lateFeePaidInCash: '0' },
        { description: 'Central tax', totalTaxPayable: res?.cgst || '0', integratedTax: '0', centralTax: '0', stateTax: '0', cess: '0', taxPaidInCash: '0', interestPaidInCash: '0', lateFeePaidInCash: '0' },
        { description: 'State/UT tax', totalTaxPayable: res?.sgst || '0', integratedTax: '0', centralTax: '0', stateTax: '0', cess: '0', taxPaidInCash: '0', interestPaidInCash: '0', lateFeePaidInCash: '0' },
        { description: 'Cess', totalTaxPayable: '0', integratedTax: '0', centralTax: '0', stateTax: '0', cess: '0', taxPaidInCash: '0', interestPaidInCash: '0', lateFeePaidInCash: '0' },

        { description: '(B) Reverse charge', isHeader: true },
        { description: 'Integrated tax', totalTaxPayable: res?.reverseChargeIgst || '0', integratedTax: '0', centralTax: '0', stateTax: '0', cess: '0', taxPaidInCash: '0', interestPaidInCash: '0', lateFeePaidInCash: '0' },
        { description: 'Central tax', totalTaxPayable: res?.reverseChargeCgst || '0', integratedTax: '0', centralTax: '0', stateTax: '0', cess: '0', taxPaidInCash: '0', interestPaidInCash: '0', lateFeePaidInCash: '0' },
        { description: 'State/UT tax', totalTaxPayable: res?.reverseChargeSgst || '0', integratedTax: '0', centralTax: '0', stateTax: '0', cess: '0', taxPaidInCash: '0', interestPaidInCash: '0', lateFeePaidInCash: '0' },
        { description: 'Cess', totalTaxPayable: '0', integratedTax: '0', centralTax: '0', stateTax: '0', cess: '0', taxPaidInCash: '0', interestPaidInCash: '0', lateFeePaidInCash: '0' }
      ],

      BreakupoftaxPDF: [
        [(this.datePipe.transform(this.monthSelected, 'MMM-yyyy').toUpperCase()) || '', res?.igst || '0', res?.cgst || '0', res?.sgst || '0', '0']
      ],
      Breakupoftax: [
        {
          period: (this.datePipe.transform(this.monthSelected, 'MMM-yyyy').toUpperCase()) || '',
          integratedTax: res?.igst || '0',
          centralTax: res?.cgst || '0',
          stateTax: res?.sgst || '0',
          cess: '0'
        }
      ]


    };
  }

  suppliesPrint: any = []
  outwardSuppliesPrint: any = [
    ['A', 'Zero rated supply (Export) without payment of tax', '0', '0', '0', '0'],
    ['B', 'Supply to SEZs without payment of tax', '', '', '', ''],
    ['C', 'Supplies on which tax is to be paid by the recipient on reverse charge basis', '', '', '', ''],
    ['D', 'Exempted', '0', '', '', ''],
    ['E', 'Nil Rated', '0', '', '', ''],
    ['F', 'Non-GST supply', '', '', '', ''],
    ['G', 'Sub-total (A to F above)', '0', '', '', ''],
    ['H', 'Credit Notes issued in respect of transactions specified in A to F above (-)', '0', '', '', ''],
    ['I', 'Debit Notes issued in respect of transactions specified in A to F above (+)', '', '', '', ''],
    ['J', 'Supplies declared through Amendments(+)', '', '', '', ''],
    ['K', 'Supplies reduced through Amendments(+)', '-0', '', '', ''],
    ['L', 'Sub-Total (H to K above)', '', '', '', ''],
    ['M', 'Turnover on which tax is not to be paid (G + L above)', '0', '', '', ''],
    ['N', 'Total Turnover (including advances) (4N + 5M - 4G above)', '0', '0', '0', '0'],
  ]
  itcDetailsPrint: any = [
    [
      { content: 'A', rowSpan: 1 },
      { content: 'Total ITC availed through GSTR-3B (Table 4A)', rowSpan: 1 },
      '', '', '', '', ''
    ],
    [
      { content: 'B', rowSpan: 3 },
      { content: 'Inward supplies (other than imports and inward supplies liable to reverse charge but includes service received from SEZs)', rowSpan: 3 },
      'Inputs', '0', '0', '0', '0'
    ],
    ['Capital Goods', '0', '0', '0', '0'],
    ['Input Services', '0', '0', '0', '0'],
    [
      { content: 'C', rowSpan: 3 },
      { content: 'Inward supplies from unregistered persons liable to reverse charge (other than B)', rowSpan: 3 },
      'Inputs', '0', '0', '0', '0'
    ],
    ['Capital Goods', '0', '0', '0', '0'],
    ['Input Services', '0', '0', '0', '0'],
    [
      { content: 'D', rowSpan: 3 },
      { content: 'Inward supplies from registered persons liable to reverse charge (other than B)', rowSpan: 3 },
      'Inputs', '0', '0', '0', '0'
    ],
    ['Capital Goods', '0', '0', '0', '0'],
    ['Input Services', '0', '0', '0', '0'],
    [
      { content: 'E', rowSpan: 2 },
      { content: 'Import of goods (including supplies from SEZs)', rowSpan: 2 },
      'Inputs', '', '', '', ''
    ],
    ['Capital Goods', '', '', '', ''],

    [
      { content: 'F', rowSpan: 1 },
      { content: 'Import of Services (excluding inward SEZ)', rowSpan: 1 },
      '', '', '', '', ''
    ],
    [
      { content: 'G', rowSpan: 1 },
      { content: 'ITC received from ISD', rowSpan: 1 },
      '', '', '', '', ''
    ],

    [
      { content: 'H', rowSpan: 1 },
      { content: 'ITC reclaimed under Act', rowSpan: 1 },
      '', '', '', '', ''
    ],
    [
      { content: 'I', rowSpan: 1 },
      { content: 'Sub-total (B to H above)', rowSpan: 1 },
      '', '0', '0', '0', '0'
    ],
    [
      { content: 'J', rowSpan: 1 },
      { content: 'Difference (I - A above)', rowSpan: 1 },
      '', '', '', '', ''
    ],
    [
      { content: 'K', rowSpan: 1 },
      { content: 'Transition credit through TRAN-I', rowSpan: 1 },
      '', '', '', '', ''
    ],

    [
      { content: 'L', rowSpan: 1 },
      { content: 'Transition credit through TRAN-II', rowSpan: 1 },
      '', '', '', '', ''
    ],
    [
      { content: 'M', rowSpan: 1 },
      { content: 'Other ITC availed', rowSpan: 1 },
      '', '', '', '', ''
    ],
    [
      { content: 'N', rowSpan: 1 },
      { content: 'Sub-total (K to M above)', rowSpan: 1 },
      '', '', '', '', ''
    ],
    [
      { content: 'O', rowSpan: 1 },
      { content: 'Total ITC availed (I + N above)', rowSpan: 1 },
      '', '0', '0', '0', '0'
    ],


  ]
  itcReversedPrint: any = [
    ['A', 'As per Rule 37'],
    ['B', 'As per Rule 39'],
    ['C', 'As per Rule 42'],
    ['D', 'As per Rule 43'],
    ['E', 'As per Section 17(5)'],
    ['F', 'Reversal of TRAN-I credit'],
    ['G', 'Reversal of TRAN-II credit'],
    ['H', 'Other reversals (please specify)'],
    ['I', 'Total ITC reversed (A to H above)'],
    ['J', 'Net ITC Available for Utilization (6O - 7I)'],
  ]
  otherItcDetailsPrint: any = [
    ['A', 'ITC as per GSTR-2A (Table 3 & 5 thereof)'],
    ['B', 'ITC as per sum total of 6(B) and 6(H) above'],
    ['C', 'ITC on inward supplies (other than imports and inward supplies liable to reverse charge but includes SEZ services) received during 2017-18 but availed during April - September 2018'],
    ['D', 'Difference [A - (B + C)]'],
    ['E', 'ITC available but not availed (out of D)'],
    ['F', 'ITC available but ineligible (out of D)'],
    ['G', 'IGST paid on import of goods (as per 6E) above'],
    ['H', 'IGST credit availed on import of goods (as per 6E) above'],
    ['I', 'Difference (G - H)'],
    ['J', 'ITC available but not availed on import of goods (Equal to I)'],
    ['K', 'Total ITC to be lapsed in current financial year (E + F + J)'],
  ]
  taxPaidDetailsPrint: any = []
  previousFyTransactionsPrint: any = [
    ['10.', 'Supplies/tax declared through Amendments (+) (net of debit notes)', '', '', '', ''],
    ['11.', 'Supplies/tax reduced through Amendments (-) (net of credit notes)', '', '', '', ''],
    ['12.', 'Reversal of ITC availed during previous financial year', '', '', '', ''],
    ['13.', 'ITC availed for the previous financial year', '', '', '', ''],
  ]
  differentialTaxPrint: any = [
    ['Integrated Tax', '', ''],
    ['Central Tax', '', ''],
    ['State/ UT Tax', '', ''],
    ['Cess', '', ''],
    ['Interest', '', ''],
  ]
  demandsRefundsPrint: any = [
    ['A', 'Total Refund claimed', '', '', '', '', '', '', ''],
    ['B', 'Total Refund sanctioned', '', '', '', '', '', '', ''],
    ['C', 'Total Refund rejected', '', '', '', '', '', '', ''],
    ['D', 'Total Refund pending', '', '', '', '', '', '', ''],
    ['E', 'Total demand of taxes', '', '', '', '', '', '', ''],
    ['F', 'Total taxes paid in respect of E above', '', '', '', '', '', '', ''],
    ['G', 'Total demands pending out of E above', '', '', '', '', '', '', ''],
  ]
  section16DataPrint: any = [
    ['A', 'Supplies received from composition taxpayers', '', '', '', ''],
    ['B', 'Deemed supply under section 143', '', '', '', ''],
    ['C', 'Goods sent on approval basis but not returned', '', '', '', ''],
  ]
  section17DataPrint: any = []
  section18DataPrint: any = []
  section19DataPrint: any = [
    ['A', 'Central Tax', '0', '0'],
    ['B', 'State Tax', '0', '0'],
  ]

  patchGSTR9(res) {
    this.supplies = res?.supplies
    this.suppliesPrint = this.getOnlyValues(res?.supplies)

    this.taxPaidDetails = res?.taxPaidDetails
    this.taxPaidDetailsPrint = this.getOnlyValues(res?.taxPaidDetails)

    this.differentialTax = res?.differentialTax
    this.differentialTaxPrint = this.getOnlyValues(res?.differentialTax)


    this.section17Data = res?.section17Data
    this.section17DataPrint = this.getOnlyValues(res?.section17Data)

    this.section18Data = res?.section18Data
    this.section18DataPrint = this.getOnlyValues(res?.section18Data)

  }

  getOnlyValues(arr) {
    return arr.map(obj =>
      Object.entries(obj).map(([key, value]) =>
        key === "cess" ? 0 : (typeof value === "number" ? value.toFixed(2) : value)
      )
    );
  }

  generateGSTR9PDF() {
    const doc = new jsPDF();

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('GSTR-9', 105, 20, { align: 'center' });

    // Table Header
    autoTable(doc, {
      startY: 30,
      head: [['Pt. I', 'Basic Details']],
      headStyles: { fontSize: 8, fillColor: [128, 128, 128], halign: 'left' },
      theme: 'grid',
    });

    // Table Body
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 2,
      body: [
        ['1', 'Financial Year', this.selectedFinancialYear],
        ['2', 'GSTIN', this.currentUser?.taxId],
        ['3A', 'Legal Name', this.currentUser?.agentName],
        ['3B', 'Trade Name (if any)', ''],
      ],
      theme: 'grid',
      styles: { fontSize: 8 },
      columnStyles: { 0: { halign: 'center', fontStyle: 'bold' } },
    });


    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 5,
      head: [['Pt. II', 'Details of Outward and inward supplies declared during the financial year']],
      headStyles: { fontSize: 8, fillColor: [128, 128, 128], halign: 'left' },
      theme: 'grid',
    });



    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 2,
      head: [['4', 'Details of advances, inward and outward supplies on which tax is payable as declared in returns filed during the financial year']],
      headStyles: { fontSize: 8, fillColor: [200, 200, 200], halign: 'left' },
      theme: 'grid',
    });

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 2,
      head: [['', 'Nature of Supplies', 'Taxable Value', 'Central Tax', 'State Tax/UT', 'Integrated Tax', 'Cess']],
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [100, 100, 100],
        fontSize: 8,
        halign: 'center',
        lineWidth: 0.5, // Set the border width
        lineColor: [220, 220, 220] // Set the border color to black
      },
      body: this.suppliesPrint,
      theme: 'grid',
      styles: { fontSize: 8 },
      columnStyles: { 0: { fontStyle: 'bold' } },
    });


    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 5,
      head: [['5', 'Details of Outward supplies on which tax is not payable as declared in returns filed during the financial year']],
      headStyles: { fontSize: 8, fillColor: [200, 200, 200], halign: 'left' },
      theme: 'grid',
    });

    // Table Data - Section 2
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY,
      head: [['', 'Nature of Supplies', 'Taxable Value', 'Central Tax', 'State Tax/UT', 'Integrated Tax', 'Cess']],
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [100, 100, 100],
        fontSize: 8,
        halign: 'center',
        lineWidth: 0.5, // Set the border width
        lineColor: [220, 220, 220] // Set the border color to black
      },

      body: this.outwardSuppliesPrint,
      theme: 'grid',
      styles: { fontSize: 8 },
      columnStyles: { 0: { fontStyle: 'bold' } },
    });

    // Section 3: ITC Details
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 5,
      head: [['Pt. III', 'Details of ITC as declared in returns filed during the financial year']],
      headStyles: { fontSize: 8, fillColor: [128, 128, 128], halign: 'left' },
      theme: 'grid',
    });


    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 5,
      head: [['6', 'Details of ITC availed as declared in returns']],
      headStyles: { fontSize: 8, fillColor: [200, 200, 200], halign: 'left' },
      theme: 'grid',
    });



    const headers = this.itcDetailsPrint;

    // Generate Table
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 2,
      head: [['', 'Description', 'Type', 'Central Tax', 'State Tax/UT', 'Integrated Tax', 'Cess']],
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [100, 100, 100],
        fontSize: 8,
        halign: 'center',
        lineWidth: 0.5, // Set the border width
        lineColor: [220, 220, 220] // Set the border color to black
      },
      theme: 'grid',
      body: headers as RowInput[],
      styles: { fontSize: 8, cellPadding: 2 },
      bodyStyles: { halign: 'left' },
      columnStyles: { 0: { halign: 'left', fontStyle: 'bold' } },
    });




    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 5,
      head: [['7', 'Details of ITC Reversed and Ineligible ITC as declared in returns filed during the financial year']],
      headStyles: { fontSize: 8, fillColor: [200, 200, 200], halign: 'left' },
      theme: 'grid',
    });

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 2,
      theme: 'grid',
      body: this.itcReversedPrint,
      styles: { fontSize: 8 },
      columnStyles: { 0: { halign: 'center', fontStyle: 'bold' } },
    });

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 5,
      head: [['8', 'Other ITC related information']],
      headStyles: { fontSize: 8, fillColor: [200, 200, 200], halign: 'left' },
      theme: 'grid',
    });
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 2,
      theme: 'grid',
      body: this.otherItcDetailsPrint,
      styles: { fontSize: 8 },
      columnStyles: { 0: { halign: 'center', fontStyle: 'bold' } },
    });


    // Section IV: Details of Tax Paid
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 5,
      head: [['Pt. IV', 'Details of tax paid as declared in returns filed during the financial year']],
      headStyles: { fontSize: 8, fillColor: [128, 128, 128], halign: 'left' },
      theme: 'grid',
    });

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 2,
      head: [['9', 'Description', 'Tax Payable', 'Paid through cash', 'Central Tax', 'State/ UT Tax', 'Integrated Tax', 'Cess']],
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [100, 100, 100],
        fontSize: 8,
        halign: 'center',
        lineWidth: 0.5, // Set the border width
        lineColor: [220, 220, 220] // Set the border color to black
      },

      theme: 'grid',
      body: this.taxPaidDetailsPrint,
      styles: { fontSize: 8 },
    });

    // Section V: Transactions for Previous FY
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [['Pt. V', 'Particulars of the transactions for the previous FY declared in return of April to September of current FY or upto date of filing of annual return of previous FY whichever is earlier']],
      headStyles: { fontSize: 8, fillColor: [128, 128, 128], halign: 'left' },
      theme: 'grid',
    });

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 2,
      head: [['', 'Description', 'Tax Payable', 'Central Tax', 'State/ UT Tax', 'Integrated Tax', 'Cess']],
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [100, 100, 100],
        fontSize: 8,
        halign: 'center',
        lineWidth: 0.5, // Set the border width
        lineColor: [220, 220, 220] // Set the border color to black
      },
      theme: 'grid',
      body: this.previousFyTransactionsPrint,
      styles: { fontSize: 8 },
      columnStyles: { 0: { halign: 'center', fontStyle: 'bold' } },
    });

    // Section V: Transactions for Previous FY
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [['14', 'Differential tax paid on account of declaration in 10 & 11 above']],
      headStyles: { fontSize: 8, fillColor: [200, 200, 200], halign: 'left' },
      theme: 'grid',
    });

    // Section 14: Table
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 2,
      head: [['Description', 'Payable', 'Paid']],
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [100, 100, 100],
        fontSize: 8,
        halign: 'center',
        lineWidth: 0.5, // Set the border width
        lineColor: [220, 220, 220] // Set the border color to black
      },
      theme: 'grid',
      body: this.differentialTaxPrint,
      styles: { fontSize: 8 },
    });


    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [['Pt. VI', 'Other Information']],
      headStyles: { fillColor: [128, 128, 128], halign: 'left' },
      theme: 'grid',
    });

    // Section VI: Table
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 2,
      head: [['15', 'Particulars of Demands and Refunds']],
      headStyles: { fillColor: [200, 200, 200], halign: 'center' },
      theme: 'grid',
    });

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 2,
      head: [['', 'Details', 'Central Tax', 'State Tax/ UT Tax', 'Integrated Tax', 'Cess', 'Interest', 'Penalty', 'Late Fee/ Others']],
      headStyles: {
        fillColor: [255, 255, 255], textColor: [100, 100, 100],
        fontSize: 8, halign: 'left'
      },
      theme: 'grid',
      body: this.demandsRefundsPrint,
      styles: { fontSize: 8 },
      columnStyles: { 0: { halign: 'center', fontStyle: 'bold' } },
    });


    // Section 16: Header
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [['16', 'Information on supplies received from composition taxpayers, deemed supply under section 143 and goods sent on approval basis']],
      headStyles: { fontSize: 8, fillColor: [200, 200, 200], halign: 'left' },
      theme: 'grid',
    });

    // Section 16: Table
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 2,
      head: [['', 'Details', 'Taxable Value', 'Central Tax', 'State/ UT Tax', 'Integrated Tax', 'Cess']],
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [100, 100, 100],
        fontSize: 8,
        halign: 'center',
        lineWidth: 0.5, // Set the border width
        lineColor: [220, 220, 220] // Set the border color to black
      },
      theme: 'grid',
      body: this.section16DataPrint,
      styles: { fontSize: 8 },
      columnStyles: { 0: { halign: 'center', fontStyle: 'bold' } },
    });

    // Section 17: Header
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 5,
      head: [['17', 'HSN Wise Summary of Outward Supplies']],
      headStyles: { fontSize: 8, fillColor: [200, 200, 200], halign: 'left' },
      theme: 'grid',
    });

    // Section 17: Table
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 2,
      head: [
        ['HSN Code', 'UQC', 'Total Quantity', 'Taxable Value', 'Rate of Tax', 'Central Tax', 'State/ UT Tax', 'Integrated Tax', 'Cess']
      ],
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [100, 100, 100],
        fontSize: 8,
        halign: 'center',
        lineWidth: 0.5, // Set the border width
        lineColor: [220, 220, 220] // Set the border color to black
      },
      theme: 'grid',
      body: this.section17DataPrint,
      styles: { fontSize: 8 },
    });


    // Part 18: Header
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 5,
      head: [['18', 'HSN Wise Summary of Inward Supplies']],
      headStyles: { fontSize: 8, fillColor: [200, 200, 200], halign: 'left' },
      theme: 'grid',
    });

    // Part 18: Table
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 2,
      head: [
        ['HSN Code', 'UQC', 'Total Quantity', 'Taxable Value', 'Rate of Tax', 'Central Tax', 'State/ UT Tax', 'Integrated Tax', 'Cess']
      ],
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [100, 100, 100],
        fontSize: 8,
        halign: 'center',
        lineWidth: 0.5, // Set the border width
        lineColor: [220, 220, 220] // Set the border color to black
      },
      theme: 'grid',
      body: this.section18DataPrint,
      styles: { fontSize: 8 },
    });


    // Section 19: Header
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 5,
      head: [['19', 'Late Fee Payable and Paid']],
      headStyles: { fontSize: 8, fillColor: [200, 200, 200], halign: 'left' },
      theme: 'grid',
    });

    // Section 19: Table
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 2,
      head: [['', 'Description', 'Payable', 'Paid']],
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [100, 100, 100],
        fontSize: 8,
        halign: 'center',
        lineWidth: 0.5, // Set the border width
        lineColor: [220, 220, 220] // Set the border color to black
      },
      theme: 'grid',
      body: this.section19DataPrint,
      styles: { fontSize: 8 },
      columnStyles: { 0: { halign: 'center', fontStyle: 'bold' } },
    });

    // Verification Section
    const verificationText = `
  Verification:
  
  I hereby solemnly affirm and declare that the information given herein above is true and correct to the best of my knowledge and 
  belief and nothing has been concealed therefrom. In case of any reduction in output tax liability, the benefit thereof has been/will
  be passed on to the recipient of supply.
  
  Place:                                                                                                                Signature: ________________________
  
  Signatory:                                                                                                         Name of Authorised: _______________________
  
  Date:                                                                                                                 Designation / Status: ________________________
  `;

    doc.setFontSize(8);
    // doc.setFont('times', 'normal');
    doc.text(verificationText, 14, (doc as any).lastAutoTable.finalY + 10);

    doc.save('GSTR-9_Report.pdf');
  }



  supplies = [
    { code: "A", description: "Supplies made to un-registered persons (B2C)", taxableValue: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "B", description: "Supplies made to registered persons (B2B)", taxableValue: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "C", description: "Zero rated supply (Export) on payment of tax (except SEZs)", taxableValue: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "D", description: "Supplies to SEZs on payment of tax", taxableValue: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "E", description: "Deemed Exports", taxableValue: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "F", description: "Advances on which tax has been paid but invoice not issued", taxableValue: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "G", description: "Inward supplies on which tax is to be paid on reverse charge basis", taxableValue: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "H", description: "Sub-total (A to G above)", taxableValue: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "I", description: "Credit Notes (-)", taxableValue: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "J", description: "Debit Notes (+)", taxableValue: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "K", description: "Supplies/tax declared through Amendments (+)", taxableValue: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "L", description: "Supplies/tax reduced through Amendments (-)", taxableValue: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "M", description: "Sub-total (I to L above)", taxableValue: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "N", description: "Supplies and advances on which tax is to be paid (H+M above)", taxableValue: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 }
  ];
  outwardSupplies = [
    { code: "A", description: "Zero rated supply (Export) without payment of tax", taxableValue: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "B", description: "Supply to SEZs without payment of tax", taxableValue: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "C", description: "Supplies on which tax is to be paid by the recipient on reverse charge basis", taxableValue: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "D", description: "Exempted", taxableValue: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "E", description: "Nil Rated", taxableValue: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "F", description: "Non-GST supply", taxableValue: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "G", description: "Sub-total (A to F above)", taxableValue: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "H", description: "Credit Notes issued in respect of transactions specified in A to F above (-)", taxableValue: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "I", description: "Debit Notes issued in respect of transactions specified in A to F above (+)", taxableValue: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "J", description: "Supplies declared through Amendments (+)", taxableValue: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "K", description: "Supplies reduced through Amendments (-)", taxableValue: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "L", description: "Sub-Total (H to K above)", taxableValue: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "M", description: "Turnover on which tax is not to be paid (G + L above)", taxableValue: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "N", description: "Total Turnover (including advances) (4N + 5M - 4G above)", taxableValue: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 }
  ];

  itcDetails = [
    { code: "A", description: "Total amount of input tax credit availed through FORM GSTR-3B", type: "", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { rowspan: 3, code: "B", description: "Inward supplies (excluding imports & reverse charge, includes SEZ services)", type: "Inputs", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "", description: "", type: "Capital Goods", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0, hideTD: true },
    { code: "", description: "", type: "Input Services", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0, hideTD: true },
    { rowspan: 3, code: "C", description: "Inward supplies from unregistered persons liable to reverse charge", type: "Inputs", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "", description: "", type: "Capital Goods", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0, hideTD: true },
    { code: "", description: "", type: "Input Services", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0, hideTD: true },
    { rowspan: 3, code: "D", description: "Inward supplies from registered persons liable to reverse charge", type: "Inputs", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "", description: "", type: "Capital Goods", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0, hideTD: true },
    { code: "", description: "", type: "Input Services", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0, hideTD: true },
    { rowspan: 2, code: "E", description: "Import of goods (including SEZ supplies)", type: "Inputs", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "", description: "", type: "Capital Goods", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0, hideTD: true },
    { code: "F", description: "Import of services (excluding SEZ supplies)", type: "", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "G", description: "Input Tax credit received from ISD", type: "", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "H", description: "Amount of ITC reclaimed (other than B above)", type: "", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "I", description: "Sub-total (B to H above)", type: "", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "J", description: "Difference (1 - A above)", type: "", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "K", description: "Transition credit through TRAN-I", type: "", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "L", description: "Transition credit through TRAN-II", type: "", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "M", description: "Any other ITC availed but not specified above", type: "", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "N", description: "Sub-total (K to M above)", type: "", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 }
  ];

  itcReversed = [
    { code: "A", description: "As per Rule 37", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "B", description: "As per Rule 39", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "C", description: "As per Rule 42", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "D", description: "As per Rule 43", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "E", description: "As per section 17(5)", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "F", description: "Reversal of TRAN-I credit", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "G", description: "Reversal of TRAN-II credit", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "H", description: "Other reversals (pl. specify)", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "I", description: "Total ITC reversed (A to H above)", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "J", description: "Net ITC Available for Utilization (60 - 7J)", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 }
  ];

  otherItcDetails = [
    { code: "A", description: "ITC as per GSTR-2A (Table 3 & 5 thereof)", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "B", description: "ITC as per sum total of 6(B) and 6(H) above", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "C", description: "ITC on inward supplies (excluding imports & reverse charge but includes services from SEZs received during 2017-18 but availed during April to September, 2018)", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "D", description: "Difference [A-(B+C)]", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "E", description: "ITC available but not availed (out of D)", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "F", description: "ITC available but ineligible (out of D)", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "G", description: "IGST paid on import of goods (as per 6E above)", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "H", description: "IGST credit availed on import of goods (as per 6E above)", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "I", description: "Difference (G-H)", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "J", description: "ITC available but not availed on import of goods (E=F+J)", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: "K", description: "Total ITC to be lapsed in current financial year (E+F+J)", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 }
  ];

  taxPaidDetails = [
    { code: '', description: "Integrated Tax", taxPayable: 0, paidCash: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: '', description: "Central Tax", taxPayable: 0, paidCash: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: '', description: "State/ UT tax", taxPayable: 0, paidCash: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: '', description: "Cess", taxPayable: 0, paidCash: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: '', description: "Interest", taxPayable: 0, paidCash: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: '', description: "Late fee", taxPayable: 0, paidCash: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: '', description: "Penalty", taxPayable: 0, paidCash: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: '', description: "Other", taxPayable: 0, paidCash: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 }
  ];

  previousFyTransactions = [
    { code: 10, description: "Supplies/tax declared through Amendments (+) (net of debit notes)", taxPayable: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: 11, description: "Supplies/tax reduced through Amendments (+) (net of credit notes)", taxPayable: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: 12, description: "Reversal of ITC availed during previous financial year", taxPayable: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 },
    { code: 13, description: "ITC availed for the previous financial year", taxPayable: 0, centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0 }
  ];

  differentialTax = [
    { description: "Integrated Tax", payable: 0, paid: 0 },
    { description: "Central Tax", payable: 0, paid: 0 },
    { description: "State/ UT Tax", payable: 0, paid: 0 },
    { description: "Cess", payable: 0, paid: 0 },
    { description: "Interest", payable: 0, paid: 0 }
  ];

  demandsRefunds = [
    { code: "A", details: "Total Refund claimed", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0, interest: 0, penalty: 0, lateFee: 0 },
    { code: "B", details: "Total Refund sanctioned", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0, interest: 0, penalty: 0, lateFee: 0 },
    { code: "C", details: "Total Refund rejected", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0, interest: 0, penalty: 0, lateFee: 0 },
    { code: "D", details: "Total Refund pending", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0, interest: 0, penalty: 0, lateFee: 0 },
    { code: "E", details: "Total demand of taxes", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0, interest: 0, penalty: 0, lateFee: 0 },
    { code: "F", details: "Total taxes paid in respect of E above", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0, interest: 0, penalty: 0, lateFee: 0 },
    { code: "G", details: "Total demands pending out of E above", centralTax: 0, stateTax: 0, integratedTax: 0, cess: 0, interest: 0, penalty: 0, lateFee: 0 }
  ];

  section16Data = [
    { code: "A", details: ' Supplies received from composition taxpayers', taxableValue: 0, centralTax: 0, stateUTTax: 0, integratedTax: 0, cess: 0 },
    { code: "B", details: ' Deemed supply under section 143', taxableValue: 0, centralTax: 0, stateUTTax: 0, integratedTax: 0, cess: 0 },
    { code: "C", details: ' Goods sent on approval basis but not returned', taxableValue: 0, centralTax: 0, stateUTTax: 0, integratedTax: 0, cess: 0 }
  ];

  section17Data = [];

  section18Data = [];

  section19Data = [
    { code: "A", description: ' Central Tax', payable: 0, paid: 0 },
    { code: "B", description: ' State Tax', payable: 0, paid: 0 }
  ];

}
