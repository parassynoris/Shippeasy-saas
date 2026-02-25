import { ChangeDetectorRef, Component, NgZone, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import * as Constant from 'src/app/shared/common-constants';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';

import { NzNotificationService } from 'ng-zorro-antd/notification';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { CommonFunctions } from 'src/app/shared/functions/common.function';

import * as xml2js from 'xml-js';
import { saveAs } from 'file-saver';
import { MatDrawer } from '@angular/material/sidenav';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ShippingLine } from 'src/app/models/shipping-line';
import { voyage } from 'src/app/models/voyagedetails';
import { Vessel } from 'src/app/models/vessel-master';
import { CommonService as CommonServices } from 'src/app/services/common/common.service';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
import { CognitoService } from 'src/app/services/cognito.service';
import { Batch } from 'src/app/models/charges';
import { DatePipe } from '@angular/common';
import { MessagingService } from 'src/app/services/messaging.service';
import { ApiService } from '../../principal/api.service';
import { CommonService } from 'src/app/shared/services/common.service';
@Component({
  selector: 'app-batch-backup',
  templateUrl: './batch-backup.component.html',
  styleUrls: ['./batch-backup.component.scss']
})
export class BatchBackupComponent implements OnInit {
  _gc = GlobalConstants;
  batchData = [];
  filterBatch = ["createdOn"];
  holdBatchType: any = 'export';
  order: boolean = true;
  toalLength: number;
  size = 10;
  page = 1;
  count = 0;
  loading: boolean = false;
  from: number = 0;
  pageSize: number =30;
  batchList: any = [];
  fromSize: number = 1;
  batchNo: any;
  enquiryNo: any;
  stcQuotationNo: any;
  moveNo: any;
  pod: any
  on_carriage: any
  fpod: any
  shipmentTypeName: any;
  moveTypeName: any;
  tankTypeName: any;
  loadPlace: any;
  vesselName: Vessel[] = [];
  voyageName: voyage[] = [];
  shipperName: any;
  forwarderName: any;
  invoicingPartyName: any;
  consigneeName: any;
  notifyPartyName: any;
  productName: any;
  shippingLineName: any;
  batchDate: any;
  status: any;
  filterJobStatus: any;
  globalSearch: string;
  isExport: boolean;
  cargoType: any;
  batchStatus: any;
  shouldArray: any[];
  uniqueRefNo: any;
  containerNo: any
  eta: any
  ata: any
  igmDate: any
  igmNo: any
  itemNo: any
  cfsLocation: any
  igmFillingStatus: any
  baseBody: any;
  isshow: string
  @Output() mmsiNo;
  @ViewChild(MatDrawer) drawer: MatDrawer | any;
  dataSource = new MatTableDataSource();
  pagenation = [20, 50, 200];
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;



  @ViewChild('jobCloseTemplate') jobCloseTemplate: any;
  @ViewChild('changeLogHistory') changeLogHistory: any;
  selectedShipmentTypes: string[] = [];
  displayedColumns = [];
  isTransport: boolean = false;
  currentLogin: any = ''
  isImport: boolean = false;
  getCognitoUserDetail: any;
  selectedStatus: string = "";
  selectedNOC: string = "";
  consigneeList: any[];
  constructor(public router: Router, public appCommon: CommonService,
    public _cognito: CognitoService,
    public datePipe:DatePipe,
    private cdr: ChangeDetectorRef, 
    private ngZone: NgZone,
    private cd: ChangeDetectorRef,
    public modalService: NgbModal, public _api: ApiService, private dialog: MatDialog,
    public notification: NzNotificationService, public commonfunction: CommonFunctions, private commonService: CommonServices, public loaderService: LoaderService, private route: ActivatedRoute) {
    this.isExport = localStorage.getItem('isExport') === 'true' ? true : false
    this.isTransport = localStorage.getItem('isTransport') === 'true' ? true : false;
    this.isImport = localStorage.getItem('isImport') === 'true' ? true : false;
    this.currentLogin = this.commonfunction.getUserType1()
    this._cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.getCognitoUserDetail = resp?.userData
      }
    });
    this.route.queryParams.subscribe(params => {
      this.filterJobStatus = decodeURIComponent(params['status'] || '');
      this.selectedMilestone = this.filterJobStatus;
    });
    if (this.currentLogin === 'transporter') {
      this.isExport = false;
      this.isImport = false;
      this.isTransport = false;
      this.displayedColumns = [
        '#',
        'batchNo',
        'transportinquiryNo',
        'updatedOn',
        // 'updatedBy',
        'statusOfBatch',
        'milestoneEstiDate',
        'quotationDetails.loadPortName',
        'quotationDetails.etd',
        // 'quotationDetails.dischargePortName',
        'quotationDetails.eta',
        'action',
      ];

    } else {
      if (this.isExport || this.isTransport) {
        this.displayedColumns = [
          '#',
          'batchNo',
          // 'enquiryDetails.enquiryNo',   
          // 'createdOn',
          // 'updatedOn',
          // 'updatedBy',
          'statusOfBatch',
          'milestoneEstiDate',

          'enquiryDetails.basicDetails.shipperName',
          // 'enquiryDetails.basicDetails.multiShipper.name',
          'enquiryDetails.basicDetails.consigneeName',
          // 'enquiryDetails.basicDetails.multiConsignee.name',

          'enquiryDetails.basicDetails.agentShortName',
          'enquiryDetails.basicDetails.bookingRef',
          'enquiryDetails.basicDetails.ShipmentTypeName',
          'enquiryDetails.basicDetails.loadType',
          'enquiryDetails.routeDetails.loadPlaceName',
          'enquiryDetails.routeDetails.loadPortName',

          'enquiryDetails.routeDetails.destPortName',
          'enquiryDetails.routeDetails.locationName',
          'quotationDetails.carrierShortName',
          'containersName',
          'mblNumber',
          'MBLStatus',
          'hblNumbers',
          'HBLStatus',
          'containerNos',
          'quotationDetails.vesselName',
          'routeDetails.portInDate',
          'routeDetails.railETD',
          'routeDetails.etd',
          'routeDetails.eta',

          // 'nocDate',
          // 'cfsRequestDate',
          'igmNo',
          // 'igmRequestDate',
          // 'lineNo',

          'action',
        ];
      } else {
        this.displayedColumns = [
          '#',
          'batchNo',
          // 'createdOn',
          // 'updatedOn',
          // "remarks",
          // 'updatedBy',
          'statusOfBatch',
          'milestoneEstiDate',
          'enquiryDetails.basicDetails.shipperName',
          // 'enquiryDetails.basicDetails.multiShipper.name',
          'enquiryDetails.basicDetails.consigneeName',
          // 'enquiryDetails.basicDetails.multiConsignee.name',
          'enquiryDetails.basicDetails.agentShortName',
          'enquiryDetails.basicDetails.bookingRef',
          'enquiryDetails.basicDetails.ShipmentTypeName',
          'enquiryDetails.basicDetails.loadType',
          'enquiryDetails.routeDetails.loadPortName',
          // 'quotationDetails.dischargePortName',
          // 'destination',
          'enquiryDetails.routeDetails.destPortName',
          'enquiryDetails.routeDetails.locationName',
          'quotationDetails.carrierShortName',
          'containersName',
          'mblNumber',
          'MBLStatus',
          'hblNumbers',
          'HBLStatus',
          'containerNos',
          'quotationDetails.vesselName',
          'routeDetails.etd',
          'routeDetails.atd',
          'routeDetails.eta',
          'routeDetails.ata',
          'routeDetails.railETD',
          'nocDate',
          'cfsRequestDate',
          'igmNo',
          'igmRequestDate',
          'lineNo',
          'action',
        ];
      }
    }

    this.displayedColumns1 = this.displayedColumns.map((x, i) => x + '_' + i);

  }

  onClickType(evt) {
    this.holdBatchType = evt.target.value;
    this.appCommon.updateMessage(this.holdBatchType)
  }
  addCommaseperatedValue(data) {
    let commaSeprated = '-'
    if (data?.length > 0) {
      commaSeprated = ''
      data.filter((item) => {
        commaSeprated += item?.name + ', '
      })
    }

    return commaSeprated
  }

  

  ngOnInit(): void {

    this.holdBatchType = "export";
    this.appCommon.updateMessage(this.holdBatchType);
  

    this.route.queryParams.subscribe(params => {
      this.isshow = params['true'];
      this.filterJobStatus = decodeURIComponent(params['status'] || '');
    });
  

    const savedMilestone = localStorage.getItem('milestone');
    if (savedMilestone && savedMilestone !== '') {
      this.selectedMilestone = savedMilestone;
    }
  
    const savedConsignee = localStorage.getItem('selectedConsignee');
    if (savedConsignee && savedConsignee !== '' && savedConsignee !== 'null') {
      try {
        this.selectedConsignee = JSON.parse(savedConsignee);
      } catch (e) {
        this.selectedConsignee = [];
      }
    }
  
    this.selectedStatus = localStorage.getItem('selectedStatusHBL') || '';
    this.selectedNOC = localStorage.getItem('selectedNOC') || '';
    this.selectedDate = localStorage.getItem('sortByValue') || '';
  
    // Load dropdown data (these can load in parallel with batch list)
    this.milestoneDropdown();
    this.customerDropdown();
  
    // Load batch list with filters applied
    // If there's a filter status from query params, use that
    if (this.filterJobStatus) {
      this.onMilestoneChange(this.filterJobStatus);
    } else {
      // Otherwise load with saved filters
      this.getBatchList();
    }
  }

  pageNumber = 1;
  // pageSize = 20;
  // from = 0;
  totalCount = 0;
  lastScrollTop = 0;
  onScroll(event: any): void {
    const element = event.target;
    const currentScrollTop = element.scrollTop;
    
    // Only trigger manual scroll load if automatic background loading hasn't finished
    if (this.batchList.length < this.toalLength && !this.loading) {
      if (currentScrollTop > this.lastScrollTop) {
        if (element.scrollTop + element.clientHeight >= element.scrollHeight - 5) {
          this.getBatchList(true);
        }
      }
    }
    
    this.lastScrollTop = currentScrollTop;
  }
  milestoneType: any = [];
  // onMilestoneChange(key : string){
  //   console.log(key)
  // }

  selectedMilestone: string;
  selectedConsignee: string[] = [];
  selectedDate: string;

  onMilestoneChange(value: string): void {
    if (value) {
      this.selectedMilestone = value;
      this.filterKeys['isExport'] = (this.isExport || this.isTransport);
      this.filterKeys['statusOfBatch'] = value;
  
      // Save to localStorage AFTER setting the value
      localStorage.setItem('milestone', value);
  
      this.page = 1;
      this.fromSize = 1;
      
      var parameter = {
        "project": [],
        "query": { ...this.filterKeys },
        "sort": {
          "asc": ["createdOn"]
        },
        size: Number(10000),
        from: this.page - 1,
      }
      
      if (this.isTransport) {
        parameter.query = {
          ...parameter.query,
          'enquiryDetails.basicDetails.ShipmentTypeName': 'Land',
        }
      } else if (this.currentLogin === 'transporter') {
        parameter.query = {
          'enquiryDetails.basicDetails.ShipmentTypeName': 'Land',
          'quotationDetails.carrierId': this.getCognitoUserDetail?.driverId
        }
      } else {
        parameter.query = {
          ...parameter.query,
          "$and": [
            {
              "enquiryDetails.basicDetails.ShipmentTypeName": {
                "$ne": 'Land'
              }
            }
          ]
        }
      }
  
      this._api.getSTList(Constant.BATCH, parameter)
        .subscribe((data: any) => {
          this.batchList = data.documents;
          this.toalLength = data.totalCount;
          this.count = data.documents.length;
  
          this.dataSource = new MatTableDataSource(
            data?.documents?.map((s: any, index) => {
              return {
                ...s,
                id: index + 1
              }
            })
          );
  
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort1;
  
          if (localStorage.getItem('sortByValue') !== '') {
            this.onSortingChange(localStorage.getItem('sortByValue') || '')
          } else {
            this.getSORT()
          }
        });
    } else {
      // Clear milestone filter
      localStorage.setItem('milestone', '');
      this.selectedMilestone = '';
      this.getBatchList();
    }

    // if (value === "S/O Confirmation")
    //   this.filterBatch = ["batchNo"]
    // else if (value === "Stuffing")
    //   this.filterBatch = ["enquiryDetails.routeDetails.etd"]
    // else if (value === "Sailing From Pol")
    //   this.filterBatch = ["enquiryDetails.routeDetails.etd"]
    // else if (value === "Transshipment ETA")
    //   this.filterBatch = ["enquiryDetails.routeDetails.transhipmentETA"]
    // else if (value === "Transshipment ETD")
    //   this.filterBatch = ["enquiryDetails.routeDetails.transhipmentETD"]
    // else if (value === "MBL Telex")
    //   this.filterBatch = ["quotationDetails.etd"]
    // else if (value === "HBL Telex")
    //   this.filterBatch = ["enquiryDetails.cargoDetails.targetDeliveryDate"]
    // else if (value === "POD Arrival")
    //   this.filterBatch = ["enquiryDetails.routeDetails.etd"]
    // else if (value === "Railing")
    //   this.filterBatch = ["enquiryDetails.routeDetails.etd"]
    // else if (value === "Destination Arrival")
    //   this.filterBatch = ["enquiryDetails.routeDetails.etd"]
    // else if (value === "Invoice Creation")
    //   this.filterBatch = ["enquiryDetails.routeDetails.etd"]
    // else if (value === "Delivery Order")
    //   this.filterBatch = ["enquiryDetails.routeDetails.etd"]

    // this.getBatchList();
  }
  customerDropdown() {
    this.consigneeList = [];
  
    let payload = this.commonService.filterList();
    if (payload) {
      payload.query = {
        status: true,
        "customerType.item_text": { $in: ['Consignee', 'Shipper', 'Agent'] }
      };
    }
  
    this.commonService.getSTList("partymaster", payload)?.subscribe((res: any) => {
      if (res?.documents?.length) {
        this.consigneeList = res.documents;
      }
    });
  }
  
  onConsigneeChange(): void {
    localStorage.setItem('selectedConsignee', JSON.stringify(this.selectedConsignee));
    this.from = 0;
    this.batchList = [];
    this.getBatchList();
  }
  

  onStatusChange(): void {
    if (this.selectedStatus == '' || this.selectedStatus == null) {
      this.from = 0;
    }
    localStorage.setItem('selectedStatusHBL', this.selectedStatus);
  
    if (this.selectedNOC == '' || this.selectedNOC == null) {
      this.from = 0;
    }
    localStorage.setItem('selectedNOC', this.selectedNOC);
  
    // Reset pagination when filters change
    this.from = 0;
    this.batchList = [];
    this.getBatchList();
  }

  onSortingChange(value: string, order: 'asc' | 'desc' = 'asc'): void {
    localStorage.setItem('sortByValue', value);
    if (!this.batchList) return; 
    this.dataSource = new MatTableDataSource(
      this.batchList.sort((a, b) => {
        let dateA = a.routeDetails?.[value.toLowerCase()]
          ? new Date(a.routeDetails[value.toLowerCase()]).getTime()
          : null;
        let dateB = b.routeDetails?.[value.toLowerCase()]
          ? new Date(b.routeDetails[value.toLowerCase()]).getTime()
          : null;
  
        // Null values should go last
        if (dateA === null) return 1;
        if (dateB === null) return -1;
  
        return order === 'asc' ? dateA - dateB : dateB - dateA;
      })
    );
  }
  
  


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

  showCon(id,el){
    let element = el?.consolidatedJobs?.filter((y:any)=> y.batchId != id.batchId)?.map((x:any) =>  x.batchNo)
    return  el?.isBlConsolidated ? 'Consolidated Job No: '+element?.toString() || '' : ''
  }
  filterMBL(blData: any[]): any[] {
    return blData?.filter(bl => bl.blType === 'MBL') || [];
  }

  onPageChange(event) {
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.from = event.pageIndex * event.pageSize;
    this.getBatchList();
  }

  private loadingRequestId = 0;
  loadedRecordsCount: number = 0;
  
  getBatchList(isScroll: boolean = false, isInitialLoad: boolean = true) {
    // Reset on new search
    if (!isScroll) {
      this.loadingRequestId++;
      this.from = 0;
      this.batchList = [];
      this.toalLength = 0;
      this.loadedRecordsCount = 0;
      this.loaderService.showcircle();
    }
  
    this.loading = true;
    const currentRequestId = this.loadingRequestId;
  
    var parameter: any = {
      "project": [],
      "query": {
        "isExport": (this.isExport || this.isTransport),
      },
      "sort": {
        "asc": this.filterBatch
      },
      size: this.pageSize,
      from: this.from
    };
  
    // Shipment Type Filter
    if (this.selectedShipmentTypes?.length) {
      parameter.query['enquiryDetails.basicDetails.ShipmentTypeName'] = this.selectedShipmentTypes[0];
    }
  
    // Transport/Transporter Logic
    if (this.isTransport) {
      parameter.query = {
        ...parameter.query,
        'enquiryDetails.basicDetails.ShipmentTypeName': 'Land',
      };
    } else if (this.currentLogin === 'transporter') {
      parameter.query = {
        'enquiryDetails.basicDetails.ShipmentTypeName': 'Land',
        'quotationDetails.carrierId': this.getCognitoUserDetail?.driverId
      };
    } else {
      parameter.query = {
        ...parameter.query,
        "$and": [
          ...(parameter.query["$and"] || []),
          {
            "enquiryDetails.basicDetails.ShipmentTypeName": {
              "$ne": 'Land'
            }
          }
        ]
      };
    }
  
    // Consignee Filter
    if (this.selectedConsignee && this.selectedConsignee.length > 0) {
      parameter.query['$and'] = parameter.query['$and'] || [];
      
      parameter.query['$and'].push({
        "$or": [
          { "enquiryDetails.basicDetails.consigneeId": { "$in": this.selectedConsignee } },
          { "enquiryDetails.basicDetails.multiConsignee.partymasterId": { "$in": this.selectedConsignee } },
          { "enquiryDetails.basicDetails.agentId": { "$in": this.selectedConsignee } },
          { "enquiryDetails.basicDetails.shipperId": { "$in": this.selectedConsignee } },
          { "enquiryDetails.basicDetails.multiShipper.partymasterId": { "$in": this.selectedConsignee } }
        ]
      });
    }
    localStorage.setItem('selectedConsignee', JSON.stringify(this.selectedConsignee));
  
    // NOC Filter
    if (this.selectedNOC) {
      parameter.query['$and'] = parameter.query['$and'] || [];
      
      if (this.selectedNOC == 'NOC Pending') {
        parameter.query['$and'].push({
          "$or": [
            { "nocDate": { "$exists": false } },
            { "nocDate": { "$eq": "" } },
            { "nocDate": { "$eq": null } }
          ]
        });
      } else if (this.selectedNOC == 'CFS Pending') {
        parameter.query['isCfsRequired'] = true;
        parameter.query['$and'].push({
          "$or": [
            { "cfsRequestDate": { "$exists": false } },
            { "cfsRequestDate": { "$eq": "" } },
            { "cfsRequestDate": { "$eq": null } }
          ]
        });
      } else if (this.selectedNOC == 'IGM Pending') {
        parameter.query['$and'].push({
          "$or": [
            { "igmRequestDate": { "$exists": false } },
            { "igmRequestDate": { "$eq": "" } },
            { "igmRequestDate": { "$eq": null } }
          ]
        });
      }
    }
  
    // Job Status Filter
    if (this.closedJobs) {
      this.selectedMilestone = '';
      parameter.query['statusOfBatch'] = 'Job Closed';
    } else if (this.cancelledJob) {
      this.selectedMilestone = '';
      parameter.query['statusOfBatch'] = 'Job Cancelled';
    } else {
      parameter.query = {
        ...parameter.query,
        "$and": [
          ...(parameter.query["$and"] || []),
          {
            "statusOfBatch": {
              "$ne": "Job Closed"
            }
          },
          {
            "statusOfBatch": {
              "$ne": "Job Cancelled"
            }
          }
        ]
      };
    }
  
    // Milestone Filter
    localStorage.setItem('milestone', '');
    if (this.selectedMilestone) {
      localStorage.setItem('milestone', this.selectedMilestone);
      parameter.query['statusOfBatch'] = this.selectedMilestone;
    }
  
    this._api.getSTList(Constant.BATCH, parameter)?.subscribe({
      next: (data: any) => {
        // ✅ Check if request is still valid
        if (currentRequestId !== this.loadingRequestId) {
          console.log('Ignoring outdated request');
          return;
        }
  
        this.ngZone.run(() => {
          // Set total length only on first load
          if (!isScroll && data.totalCount) {
            this.toalLength = data.totalCount;
          }
  
          // Apply client-side filtering for BL status
          let filteredDocs = data.documents || [];
          const hasClientSideFilter = this.selectedStatus === 'MBL Telex Pending' || 
                                      this.selectedStatus === 'HBL Telex Pending';
  
          if (this.selectedStatus === 'MBL Telex Pending') {
            filteredDocs = filteredDocs.filter((batch: any) =>
              batch.blData?.some((bl: any) =>
                bl.blType === 'MBL' && bl.blStatus?.toLowerCase() === 'pending'
              )
            );
          } else if (this.selectedStatus === 'HBL Telex Pending') {
            filteredDocs = filteredDocs.filter((batch: any) =>
              batch.blData?.some((bl: any) =>
                bl.blType === 'HBL' && bl.blStatus?.toLowerCase() === 'pending'
              )
            );
          }
  
          // Handle data based on scroll state
          if (!isScroll) {
            // Fresh load - replace all data
            this.batchList = filteredDocs;
          } else {
            // Scroll load - append unique records only
            const existingBatchIds = new Set(this.batchList.map(doc => doc.batchId));
            const uniqueDocuments = filteredDocs.filter(doc => !existingBatchIds.has(doc.batchId));
            this.batchList = [...this.batchList, ...uniqueDocuments];
          }
  
          // ✅ SPEED OPTIMIZATION: Show first 7 records immediately for client-side filters
          if (hasClientSideFilter && isInitialLoad && !isScroll && this.batchList.length > 7) {
            const initialRecords = this.batchList.slice(0, 7);
            const remainingRecords = this.batchList.slice(7);
            
            // Show first 7 immediately
            this.dataSource = new MatTableDataSource(
              initialRecords.map((s: any, index) => ({
                ...s,
                id: index + 1
              }))
            );
            this.dataSource.sort = this.sort1;
            this.cd.detectChanges();
            this.loaderService.hidecircle();
            this.loading = false;
            
            // Load remaining after delay
            setTimeout(() => {
              if (currentRequestId !== this.loadingRequestId) {
                return;
              }
              this.ngZone.run(() => {
                this.dataSource = new MatTableDataSource(
                  this.batchList.map((s: any, index) => ({
                    ...s,
                    id: index + 1
                  }))
                );
                this.dataSource.sort = this.sort1;
                this.cd.detectChanges();
              });
            }, 100);
          } else {
            // Normal rendering
            this.dataSource = new MatTableDataSource(
              this.batchList.map((s: any, index) => ({
                ...s,
                id: index + 1
              }))
            );
            this.dataSource.sort = this.sort1;
          }
  
          this.count = this.batchList.length;
          
          // Update pagination position
          const actualRecordsFetched = (data.documents || []).length;
          this.loadedRecordsCount += actualRecordsFetched;
          this.from += this.pageSize;
  
          // ✅ Auto-load more data if needed (for client-side filters)
          let shouldFetchMore = false;
          
          if (hasClientSideFilter) {
            const minFilteredRecords = Math.min(this.pageSize, 50);
            const hasEnoughFilteredRecords = this.batchList.length >= minFilteredRecords;
            const hasMoreDataToFetch = actualRecordsFetched === this.pageSize && 
                                      this.loadedRecordsCount < this.toalLength;
            
            shouldFetchMore = !hasEnoughFilteredRecords && hasMoreDataToFetch;
            
            // Update total to actual filtered count when done
            if (!hasMoreDataToFetch) {
              this.toalLength = this.batchList.length;
            }
          } else {
            // For server-side filters, check if more pages exist
            shouldFetchMore = actualRecordsFetched === this.pageSize && 
                            this.loadedRecordsCount < this.toalLength;
          }
  
          if (shouldFetchMore) {
            setTimeout(() => {
              if (currentRequestId === this.loadingRequestId) {
                this.getBatchList(true, false);
              }
            }, 50);
          } else {
            this.loaderService.hidecircle();
            this.loading = false;
          }
  
          // Apply sorting
          if (localStorage.getItem('sortByValue') !== '') {
            this.onSortingChange(localStorage.getItem('sortByValue') || '');
          } else {
            this.getSORT();
          }
  
          this.cd.detectChanges();
        });
      },
      error: (error) => {
        if (currentRequestId !== this.loadingRequestId) {
          return;
        }
        
        this.ngZone.run(() => {
          this.loaderService.hidecircle();
          this.loading = false;
          this.cd.detectChanges();
        });
      }
    });
  }
  getSORT() {
    this.dataSource.sort = this.sort1;
    // Define custom sorting function for the column
    this.dataSource.sortingDataAccessor = (item: any, property) => {
      switch (property) {

        case 'enquiryDetails.enquiryNo': return item?.enquiryDetails?.enquiryNo || '';
        case 'enquiryDetails.basicDetails.ShipmentTypeName': return item?.enquiryDetails?.basicDetails?.ShipmentTypeName || '';
        case 'enquiryDetails.basicDetails.loadType': return item?.enquiryDetails?.basicDetails?.loadType || '';
        case 'quotationDetails.loadPortName': return item?.quotationDetails?.loadPortName || '';
        case 'quotationDetails.dischargePortName': return item?.quotationDetails?.dischargePortName || '';
        case 'quotationDetails.loadtype': return item?.quotationDetails?.loadtype || '';

        case 'enquiryDetails.basicDetails.consigneeName': return item?.enquiryDetails?.basicDetails?.consigneeName || '';
        case 'enquiryDetails.basicDetails.agentShortName': return item?.enquiryDetails?.basicDetails?.agentShortName || '';
        case 'enquiryDetails.basicDetails.agentName': return item?.enquiryDetails?.basicDetails?.agentName || '';
        case 'quotationDetails.carrierName': return item?.quotationDetails?.carrierName || '';
        case 'quotationDetails.vesselName': return item?.quotationDetails?.vesselName || '';
        case 'quotationDetails.voyageNumber': return item?.quotationDetails?.voyageNumber || '';
        case 'enquiryDetails.basicDetails.shipperName': return item?.enquiryDetails?.basicDetails?.shipperName || '';
        case 'enquiryDetails.basicDetails.forwarderName': return item?.enquiryDetails?.basicDetails?.forwarderName || '';

        case 'enquiryDetails.agentadviceNo': return item?.enquiryDetails?.agentadviceNo || '';
        //  case 'enquiryDetails.basicDetails.billingPartyName': return item?.enquiryDetails?.basicDetails?.billingPartyName || '';       
        case 'enquiryDetails.routeDetails.vesselName': return item?.enquiryDetails?.routeDetails?.vesselName || '';
        case 'enquiryDetails.routeDetails.voyageNumber': return item?.enquiryDetails?.routeDetails?.voyageNumber || '';


        default: return item[property];
      }
    };
  }
  calculator() {
    window.open('Calculator:///');
  }
  clear() {
    this.uniqueRefNo = '';
    this.batchNo = '';
    this.enquiryNo = '';
    this.stcQuotationNo = '';
    this.moveNo = '';
    this.shipmentTypeName = '';
    this.moveTypeName = '';
    this.tankTypeName = '';
    this.loadPlace = '';
    this.shipperName = '';
    this.forwarderName = '';
    this.invoicingPartyName = '';
    this.consigneeName = '';
    this.notifyPartyName = '';
    this.productName = '';
    this.shippingLineName = '';
    this.status = '';
    this.getBatchList();

  }
  filter(e) {
    this.size = e.target.value;
    this.fromSize = 1;
    this.getBatchList();
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

    if (this.batchNo) {
      mustArray['batchNo'] = {
        "$regex": this.batchNo,
        "$options": "i"
      }
    }
    if (this.enquiryNo) {
      mustArray['enquiryNo'] = {
        "$regex": this.enquiryNo,
        "$options": "i"
      }
    }
    if (this.uniqueRefNo) {
      mustArray['uniqueRefNo'] = {
        "$regex": this.uniqueRefNo,
        "$options": "i"
      }
    }
    if (this.stcQuotationNo) {
      mustArray['stcQuotationNo'] = {
        "$regex": this.stcQuotationNo,
        "$options": "i"
      }
    }
    if (this.batchDate) {
      mustArray['createdOn'] = {
        "$gt": this.batchDate.substring(0, 10) + 'T00:00:00.000Z',
        "$lt": this.batchDate.substring(0, 10) + 'T23:59:00.000Z'
      }
    }
    if (this.eta) {
      mustArray['eta'] = {
        "$gt": this.eta.substring(0, 10) + 'T00:00:00.000Z',
        "$lt": this.eta.substring(0, 10) + 'T23:59:00.000Z'
      }
    }
    if (this.ata) {
      mustArray['ata'] = {
        "$gt": this.ata.substring(0, 10) + 'T00:00:00.000Z',
        "$lt": this.ata.substring(0, 10) + 'T23:59:00.000Z'
      }
    }
    if (this.igmDate) {
      mustArray['igmDate'] = {
        "$gt": this.igmDate.substring(0, 10) + 'T00:00:00.000Z',
        "$lt": this.igmDate.substring(0, 10) + 'T23:59:00.000Z'
      }
    }
    if (this.igmNo) {
      mustArray['igmNo'] = {
        "$regex": this.igmNo,
        "$options": "i"
      }
    }
    if (this.itemNo) {
      mustArray['itemNo'] = {
        "$regex": this.itemNo,
        "$options": "i"
      }
    }
    if (this.cfsLocation) {
      mustArray['cfsLocationName'] = {
        "$regex": this.cfsLocation,
        "$options": "i"
      }
    }
    if (this.igmFillingStatus) {
      mustArray['igmFillingStatus'] = {
        "$regex": this.igmFillingStatus,
        "$options": "i"
      }
    }
    if (this.pod) {
      mustArray['podName'] = {
        "$regex": this.pod,
        "$options": "i"
      }
    }
    if (this.on_carriage) {
      mustArray['enquiryData.onCarriageName'] = {
        "$regex": this.on_carriage,
        "$options": "i"
      }
    }
    if (this.fpod) {
      mustArray['fpodName'] = {
        "$regex": this.fpod,
        "$options": "i"
      }
    }
    if (this.moveNo) {
      mustArray['moveNo'] = {
        "$regex": this.moveNo,
        "$options": "i"
      }
    }
    if (this.shipmentTypeName) {
      mustArray['shipmentTypeName'] = {
        "$regex": this.shipmentTypeName,
        "$options": "i"
      }
    }
    if (this.vesselName) {
      mustArray['finalVesselName'] = {
        "$regex": this.vesselName,
        "$options": "i"
      }
    }
    if (this.voyageName) {
      mustArray['finalVoyageName'] = {
        "$regex": this.voyageName,
        "$options": "i"
      }
    }
    if (this.moveTypeName) {
      mustArray['moveTypeName'] = {
        "$regex": this.moveTypeName,
        "$options": "i"
      }
    }
    if (this.tankTypeName) {
      mustArray['tankTypeName'] = {
        "$regex": this.tankTypeName,
        "$options": "i"
      }
    }
    if (this.loadPlace) {
      mustArray['loadPlaceName'] = {
        "$regex": this.loadPlace,
        "$options": "i"
      }
    }

    if (this.shipperName) {
      mustArray['shipperName'] = {
        "$regex": this.shipperName,
        "$options": "i"
      }
    }
    if (this.forwarderName) {
      mustArray['forwarderName'] = {
        "$regex": this.forwarderName,
        "$options": "i"
      }
    }
    if (this.consigneeName) {
      mustArray['consigneeName'] = {
        "$regex": this.consigneeName,
        "$options": "i"
      }
    }
    if (this.invoicingPartyName) {
      mustArray['invoicingPartyName'] = {
        "$regex": this.invoicingPartyName,
        "$options": "i"
      }

    }
    if (this.notifyPartyName) {
      mustArray['notifyPartyName'] = {
        "$regex": this.notifyPartyName,
        "$options": "i"
      }
    }
    if (this.productName) {
      mustArray['productName'] = {
        "$regex": this.productName,
        "$options": "i"
      }
    }
    if (this.batchStatus) {
      mustArray['batchStatus'] = {
        "$regex": this.batchStatus,
        "$options": "i"
      }
    }
    if (this.cargoType) {
      mustArray['cargoType'] = {
        "$regex": this.cargoType,
        "$options": "i"
      }
    }
    if (this.shippingLineName) {
      mustArray['shippingLineName'] = {
        "$regex": this.shippingLineName,
        "$options": "i"
      }
    }
    if (this.containerNo) {
      mustArray['container'] = {
        "$regex": this.containerNo,
        "$options": "i"
      }
    }
    if (this.status) {
      mustArray['status'] = {
        "$regex": this.status,
        "$options": "i"
      }
    }
    mustArray['isExport'] = (this.isExport || this.isTransport)
    if (this.isTransport) {
      mustArray['enquiryDetails.basicDetails.ShipmentTypeName'] = 'Land'
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

    if (this.isTransport) {
      parameter.query = {
        ...parameter.query,
        'enquiryDetails.basicDetails.ShipmentTypeName': 'Land',
      }
    } else if (this.currentLogin === 'transporter') {
      parameter.query = {
        'enquiryDetails.basicDetails.ShipmentTypeName': 'Land',
        'quotationDetails.carrierId': this.getCognitoUserDetail?.driverId
      }
    } else {
      parameter.query = {
        ...parameter.query,

        "$and": [
          ...(parameter.query["$and"] || []),
          {
            "enquiryDetails.basicDetails.ShipmentTypeName": {
              "$ne": 'Land'
            }
          }
        ]
      }
    }


    if (this.closedJobs) {
      parameter.query['statusOfBatch'] = 'Job Closed';
    } else {
      parameter.query = {
        ...parameter.query,

        "$and": [
          ...(parameter.query["$and"] || []),
          {
            "statusOfBatch": {
              "$ne": "Job Closed"
            }
          }
        ]
      }

    }

    this._api.getSTList(Constant.BATCH, parameter)
      .subscribe((data: any) => {
        this.batchList = data.documents?.map((s: any, index) => {
          return {
            ...s,
            id: index + 1
          }
        });
        this.toalLength = data.totalCount;
        this.count = data.documents.length;
        this.fromSize = 1
      });
  }

  getPaginationData(type: any) {
    this.fromSize =
      type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;


    var parameter = {
      "project": [],
      "query": {
        "isExport": (this.isExport || this.isTransport)
      },
      "sort": {
        "asc": ["createdOn"]
      },
      size: Number(this.size),
      from: this.fromSize - 1,
    }

    this._api.getSTList(Constant.BATCH, parameter)
      .subscribe((data: any) => {
        this.batchList = data.documents;
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

  changeStatus(data) {
    this._api.UpdateToST('batch/' + data.batchId, { ...data, status: !data?.status, apiType: 'status' }).subscribe((res: any) => {
      setTimeout(() => {
        if (res) {
          this.notification.create(
            'success',
            'Status Updated Successfully',
            ''
          );
          this.getBatchList();

        }
      }, 1000);
    },
      error => {
        this.notification.create(
          'error',
          error?.error?.error?.message,
          ''
        );
      });

  }

  removeRow(content1, batch) {
    this.modalService.open(content1, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'sm',
      ariaLabelledBy: 'modal-basic-title'
    }).result.then((result) => {

      if (result === 'yes') {
        let deleteBody = 'batch/' + batch?.batchId
        this._api
          .deleteST(deleteBody)
          .subscribe((data) => {
            setTimeout(() => {
              if (data) {
                this.notification.create(
                  'success',
                  'Deleted Successfully',
                  ''
                );
                this.clear();
              }
            }, 1000);
          });
      }
    });
  }

  exportAsExcelFile(): void {
    let storebatchData = [];
    this.batchList.map((row: any) => {
      if (this.isExport || this.isTransport) {
        storebatchData.push({
          "Job No": row.batchNo,
          "Inquiry No": row.enquiryNo,
          "Quotation No": row.stcQuotationNo,
          "Job Date": this.appCommon.formatDateForExcelPdf(row.createdOn),
          "Move No": row.moveNo === 0 ? "" : row.moveNo,
          "Move Type": row.moveTypeName,
          "Tank Type": row.tankTypeName,
          "AGENT Location": row.loadPlaceName,
          "Shipper": row.shipperName,
          "Forwarder": row.forwarderName,
          "Invoice Party": row.invoicingPartyName,
          "Consignee": row.consigneeName,
          "Notify Party": row.notifyPartyName,
          "Product": row.productName,
          "Shipping Line": row.shippingLineName,
          "Status": row.status ? "Active" : "In Active"
        });
      } else {
        storebatchData.push({
          "Job No": row.batchNo,
          "Unique Ref No": row.uniqueRefNo,
          "Quotation No": row.stcQuotationNo,
          "Job Date": this.appCommon.formatDateForExcelPdf(row.createdOn),
          "Move No": row.moveNo === 0 ? "" : row.moveNo,
          "Move Type": row.moveTypeName,
          "Vessel": row.finalVesselName,
          "Voyage": row.finalVoyageId,
          "Shipper": row.shipperName,
          "Forwarder": row.forwarderName,
          "Invoice Party": row.invoicingPartyName,
          "Consignee": row.consigneeName,
          "Notify Party": row.notifyPartyName,
          "Product": row.productName,
          "Shipping Line": row.shippingLineName,
          "Status": row.status ? "Active" : "In Active"
        });
      }

    });
    const myworksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(storebatchData);
    const myworkbook: XLSX.WorkBook = {
      Sheets: { data: myworksheet },
      SheetNames: ["data"],
    };


    const fileName = "batch.xlsx";
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  openPDF() {
    var prepare = [];
    this.batchList.forEach(e => {
      var tempObj = [];
      tempObj.push(e.batchNo);
      (this.isExport || this.isTransport) ? tempObj.push(e.enquiryNo) : tempObj.push(e.uniqueRefNo);
      tempObj.push(e.stcQuotationNo);
      tempObj.push(this.appCommon.formatDateForExcelPdf(e.createdOn));
      tempObj.push(e.moveNo === 0 ? '' : e.moveNo);
      tempObj.push(e.moveTypeName);
      (this.isExport || this.isTransport) ? e.tankTypeName : e.finalVesselName
        (this.isExport || this.isTransport) ? e.loadPlaceName : e.finalVoyageId
      tempObj.push(e.shipperName);
      tempObj.push(e.forwarderName);
      tempObj.push(e.invoicingPartyName);
      tempObj.push(e.consigneeName);
      tempObj.push(e.notifyPartyName);
      tempObj.push(e.productName);
      tempObj.push(e.shippingLineName);
      tempObj.push(e.status ? "Active" : "In Active");
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [697, 610]);
    autoTable(doc, {
      head: [['Job No.',
        (this.isExport || this.isTransport) ? 'Inquiry No.' : 'Unique Ref No', 'Quotation No.', 'Job Date', 'Move No', 'Move Type',
        (this.isExport || this.isTransport) ? 'Container Type' : 'Vessel',
        (this.isExport || this.isTransport) ? 'AGENT  Location' : 'Voyage',
        'Shipper', 'Forwarder', 'Invoice Party', 'Consignee', 'Notify Party', 'Product', 'Shipping Line', 'Status']],
      body: prepare
    });
    doc.save('batch' + '.pdf');
  }


  xmlString: string = '';
  generateXml(batch, count) {
    const data = {
      Record: {
        SenderName: 'JMBAXI',
        CustomerName: 'JMBAXI',
        ShipmentID: batch.batchNo,
        NumberOfTanks: count,
        DocumentType: 'Request',
        MessageFunctionCode: 'Original',
        QuoteNumber: batch.stcQuotationNo,
      },
    };
    const options = { compact: true, ignoreComment: true, spaces: 4 };
    this.xmlString = xml2js.js2xml(data, options);
    const blob = new Blob([this.xmlString], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'JMBAXI' + batch.batchNo + '-' + batch.stcQuotationNo + '.xml');
  }
  sendBookingRequest(bl, type) {
    let noOfContainers = 0
    let payload = {};
    let filter = this._api.filterList();
    filter.query['name'] = {
      "$regex": 'stolt',
      "$options": "i"
    }
    this._api.getSTList("partymaster", filter).subscribe((res: any) => {
      let mailList = []
      res?.documents?.forEach((x) => {
        if (x?.name?.toLowerCase() === 'stolt') {
          mailList.push(x)
        }
      })
      if (type === 'bookingRequest') {

        let parameter = this._api.filterList();
        parameter.query = {
          "batchId": bl.batchId
        }
        parameter.sort = {
          "desc": ["createdOn"]
        },
          this._api.getSTList(Constant.CONTAINER_LIST, parameter).subscribe((res: any) => {
            noOfContainers = res.documents?.length
            this.generateXml(bl, noOfContainers)
          })
        payload = {
          "batchId": bl.batchId,
          "email": mailList[0]?.primaryMailId,
          "type": type
        }
      }
      let multipleMail = []
      if (type === 'moveRequest') {

        mailList?.forEach((mail) => {
          multipleMail.push(mail?.primaryMailId)
          mail?.customer?.forEach(element => {
            multipleMail.push(element.email)
          })
        })
        payload = {
          "batchId": bl.batchId,
          "email": multipleMail.join(','),
          "type": type
        }
      }

      this._api.addToST('batchartifact', payload).subscribe(
        (res) => {
          if (res) {
            this.notification.create('success', 'Email Sent Successfully', '');
          }
          else {
            this.notification.create('error', 'Email not Send', '');
          }
        }
      );
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
      { "batchNo": { "$regex": query, "$options": "i" } },
      { "enquiryNo": { "$regex": query, "$options": "i" } },
      { "uniqueRefNo": { "$regex": query, "$options": "i" } },
      { "finalVesselName": { "$regex": query, "$options": "i" } },
      { "finalVoyageId": { "$regex": query, "$options": "i" } },
      { "stcQuotationNo": { "$regex": query, "$options": "i" } },
      { "moveNo": { "$regex": query, "$options": "i" } },
      { "moveTypeName": { "$regex": query, "$options": "i" } },
      { "tankTypeName": { "$regex": query, "$options": "i" } },
      { "loadPlaceName": { "$regex": query, "$options": "i" } },
      { "shipperName": { "$regex": query, "$options": "i" } },
      { "forwarderName": { "$regex": query, "$options": "i" } },
      { "invoicingPartyName": { "$regex": query, "$options": "i" } },
      { "consigneeName": { "$regex": query, "$options": "i" } },
      { "notifyPartyName": { "$regex": query, "$options": "i" } },
      { "productName": { "$regex": query, "$options": "i" } },
      { "shippingLineName": { "$regex": query, "$options": "i" } },
      { "podName": { "$regex": query, "$options": "i" } },
      { "enquiryData.onCarriageName": { "$regex": query, "$options": "i" } },
      { "fpodName": { "$regex": query, "$options": "i" } },
      { "container": { "$regex": query, "$options": "i" } },
      { "igmNo": { "$regex": query, "$options": "i" } },
      { "itemNo": { "$regex": query, "$options": "i" } },
      { "cfsLocationName": { "$regex": query, "$options": "i" } },
      { "igmFillingStatus": { "$regex": query, "$options": "i" } },
    )



    var parameter: any = {
      "project": [],
      "query": {
        "isExport": (this.isExport || this.isTransport),
        "$or": shouldArray
      },
      "sort": {
        "asc": ["createdOn"]
      },
      size: Number(this.size),
      from: 0,
    }

    if (this.isTransport) {
      parameter.query = {
        ...parameter.query,
        'enquiryDetails.basicDetails.ShipmentTypeName': 'Land',
      }
    } else if (this.currentLogin === 'transporter') {
      parameter.query = {
        'enquiryDetails.basicDetails.ShipmentTypeName': 'Land',
        'quotationDetails.carrierId': this.getCognitoUserDetail?.driverId
      }
    } else {
      parameter.query = {
        ...parameter.query,

        "$and": [
          ...(parameter.query["$and"] || []),
          {
            "enquiryDetails.basicDetails.ShipmentTypeName": {
              "$ne": 'Land'
            }
          }
        ]
      }
    }


    if (this.closedJobs) {
      parameter.query['statusOfBatch'] = 'Job Closed';
    } else {
      parameter.query = {
        ...parameter.query,

        "$and": [
          ...(parameter.query["$and"] || []),
          {
            "statusOfBatch": {
              "$ne": "Job Closed"
            }
          }
        ]
      }

    }

    this._api.getSTList(Constant.BATCH, parameter)
      .subscribe((data: any) => {
        this.batchList = data.documents;
        this.toalLength = data.totalCount;
        this.count = data.documents.length;
        this.fromSize = 1;
      });
  }
  // export() {
  //   const modifiedTableData = this.dataSource?.filteredData;
  //   const tableColumns = this.displayedColumns;
  //   const tableData = modifiedTableData || [];
  //   const columnsToHide = ['status', 'action'];
  //   const actualColumns = this.displayedColumns;
  //   this.commonfunction.exportToExcel(
  //     tableColumns,
  //     tableData,
  //     columnsToHide,
  //     'Job',
  //     this.displayedColumns,
  //     actualColumns
  //   );
  // }
  // export() {
  //   console.log('sss')
  //   const modifiedTableData = this.dataSource?.filteredData;
  //   let tableData = modifiedTableData || [];
  //   const columnsToHide = ['status', 'action']; // still hiding these two
    
  //   tableData =(modifiedTableData || [])?.map((s: any, index) => {
  //     return {
  //       ...s,
  //       id: index + 1
  //     }
  //   })
  //   const newColumLabels = [
  //     'Job No.', 'Status', 'Milestone Date', 'Shipper', 'Consignee', 'Agent',
  //     'Booking No.', 'Shipment Type', 'Load Type', 'Port of Loading',
  //     'Port of Discharge', 'Final Destination', 'Shipping Line', 'Container Type',
  //     'MBL No', 'MBL TYPE', 'HBL NO.', 'HBL TYPE', 'CONTAINER NO.', 'VESSEL',
  //     'ETD', 'ATD', 'ETA', 'ATA', 'Railing Date', 'NOC Date',
  //     'CFS Request DATE', 'IGM NO.', 'IGM Request Date', 'IGM Line No.'
  //   ];
  
  //   const actualColumns = [
  //     'batchNo',
  //     'statusOfBatch',
  //     'milestoneEstiDate',
  //     'enquiryDetails.basicDetails.shipperName',
  //     'enquiryDetails.basicDetails.consigneeName',
  //     'enquiryDetails.basicDetails.agentShortName',
  //     'enquiryDetails.basicDetails.bookingRef',
  //     'enquiryDetails.basicDetails.ShipmentTypeName',
  //     'enquiryDetails.basicDetails.loadType',
  //     'enquiryDetails.routeDetails.loadPortName',
  //     'enquiryDetails.routeDetails.destPortName',
  //     'enquiryDetails.routeDetails.locationName',
  //     'quotationDetails.carrierShortName',
  //     'containersName',
  //     'mblNumber',
  //     'MBLStatus',
  //     'hblNumbers',
  //     'HBLStatus',
  //     'containerNos',
  //     'quotationDetails.vesselName',
  //     'routeDetails.etd',
  //     'routeDetails.atd',
  //     'routeDetails.eta',
  //     'routeDetails.ata',
  //     'routeDetails.railETD',
  //     'nocDate',
  //     'cfsRequestDate',
  //     'igmNo',
  //     'igmRequestDate',
  //     'lineNo'
  //   ];
  

  
  //   this.commonfunction.exportToExcel(
  //     actualColumns,
  //     tableData,
  //     columnsToHide,
  //     'Job',
  //     newColumLabels,
  //     actualColumns
  //   );
  // }

// Inject DatePipe in your constructor if not already

export() {
  const modifiedTableData = this.dataSource?.filteredData || [];
  const columnsToHide = ['status', 'action'];

  const tableData = modifiedTableData.map((s: any, index: number) => {
    const safeTransform = (value: any) => {
      return isNaN(Date.parse(value)) ? '' : this.datePipe.transform(value, 'dd-MM-yyyy');
    };
  
    return {
      ...s,
      id: index + 1,
  
      routeDetails_etd: safeTransform(s?.routeDetails?.etd),
      routeDetails_atd: safeTransform(s?.routeDetails?.atd),
      routeDetails_eta: safeTransform(s?.routeDetails?.eta),
      routeDetails_ata: safeTransform(s?.routeDetails?.ata),
      routeDetails_railETD: safeTransform(s?.routeDetails?.railETD),
  
      nocDate: safeTransform(s?.nocDate),
      cfsRequestDate: safeTransform(s?.cfsRequestDate),
      igmRequestDate: safeTransform(s?.igmRequestDate),
    };
  });
  

  const newColumLabels = [
    'Job No.', 'Status', 'Milestone Date', 'Shipper', 'Consignee', 'Agent',
    'Booking No.', 'Shipment Type', 'Load Type', 'Port of Loading',
    'Port of Discharge', 'Final Destination', 'Shipping Line', 'Container Type',
    'MBL No', 'MBL TYPE', 'HBL NO.', 'HBL TYPE', 'CONTAINER NO.', 'VESSEL',
    'ETD', 'ATD', 'ETA', 'ATA', 'Railing Date', 'NOC Date',
    'CFS Request DATE', 'IGM NO.', 'IGM Request Date', 'IGM Line No.'
  ];

  const actualColumns = [
    'batchNo',
    'statusOfBatch',
    'milestoneEstiDate',
    'enquiryDetails.basicDetails.shipperName',
    'enquiryDetails.basicDetails.consigneeName',
    'enquiryDetails.basicDetails.agentShortName',
    'enquiryDetails.basicDetails.bookingRef',
    'enquiryDetails.basicDetails.ShipmentTypeName',
    'enquiryDetails.basicDetails.loadType',
    'enquiryDetails.routeDetails.loadPortName',
    'enquiryDetails.routeDetails.destPortName',
    'enquiryDetails.routeDetails.locationName',
    'quotationDetails.carrierShortName',
    'containersName',
    'mblNumber',
    'MBLStatus',
    'hblNumbers',
    'HBLStatus',
    'containerNos',
    'quotationDetails.vesselName',
    'routeDetails_etd',
    'routeDetails_atd',
    'routeDetails_eta',
    'routeDetails_ata',
    'routeDetails_railETD',
    'nocDate',
    'cfsRequestDate',
    'igmNo',
    'igmRequestDate',
    'lineNo'
  ];

  this.commonfunction.exportToExcel(
    actualColumns,
    tableData,
    columnsToHide,
    'Job',
    newColumLabels,
    actualColumns
  );
}

  // exportList(isList) {
  //   let parameter: any = {
  //     "project": [],
  //     size: 5000,
  //     "query": {
  //       "isExport": (this.isExport || this.isTransport)
  //     },
  //     "sort": {
  //       "asc": ["createdOn"]
  //     }
  //   };
  //   if (this.selectedShipmentTypes?.length) {
  //     parameter.query['enquiryDetails.basicDetails.ShipmentTypeName'] = this.selectedShipmentTypes[0];
  //   }
  //   if (this.isTransport) {
  //     parameter.query = {
  //       ...parameter.query,
  //       'enquiryDetails.basicDetails.ShipmentTypeName': 'Land',
  //     };
  //   } else if (this.currentLogin === 'transporter') {
  //     parameter.query = {
  //       'enquiryDetails.basicDetails.ShipmentTypeName': 'Land',
  //       'quotationDetails.carrierId': this.getCognitoUserDetail?.driverId
  //     };
  //   } else {
  //     parameter.query = {
  //       ...parameter.query,

  //       "$and": [
  //         ...(parameter.query["$and"] || []),
  //         {
  //           "enquiryDetails.basicDetails.ShipmentTypeName": {
  //             "$ne": 'Land'
  //           }
  //         }
  //       ]
  //     }
  //   }


  //   if (this.closedJobs) {
  //     parameter.query['statusOfBatch'] = 'Job Closed';
  //   } else {
  //     parameter.query = {
  //       ...parameter.query,

  //       "$and": [
  //         ...(parameter.query["$and"] || []),
  //         {
  //           "statusOfBatch": {
  //             "$ne": "Job Closed"
  //           }
  //         }
  //       ]
  //     }

  //   }
  //   this._api.getSTList(Constant.BATCH, parameter).subscribe(
  //     (data: any) => {
  //       const modifiedTableData = data?.documents;
  //       if (modifiedTableData) {
  //         const tableColumns = this.displayedColumns;
  //         const tableData = modifiedTableData || [];
  //         const columnsToHide = ['status', 'action'];
  //         const actualColumns = this.displayedColumns;

  //         // Call export function after data is fetched
  //         this.commonfunction.exportToExcel(
  //           tableColumns,
  //           tableData,
  //           columnsToHide,
  //           'Job',
  //           this.displayedColumns,
  //           actualColumns
  //         );
  //       } else {
  //         console.error("No data received for export.");
  //       }
  //     },
  //     (error) => {
  //       console.error("Error fetching data from API", error);
  //     }
  //   );
  // }
  exportList(isList) {
    let parameter: any = {
      "project": [],
      size: 5000,
      "query": {
        "isExport": (this.isExport || this.isTransport)
      },
      "sort": {
        "asc": ["createdOn"]
      }
    };
  
    if (this.selectedShipmentTypes?.length) {
      parameter.query['enquiryDetails.basicDetails.ShipmentTypeName'] = this.selectedShipmentTypes[0];
    }
  
    if (this.isTransport) {
      parameter.query = {
        ...parameter.query,
        'enquiryDetails.basicDetails.ShipmentTypeName': 'Land',
      };
    } else if (this.currentLogin === 'transporter') {
      parameter.query = {
        'enquiryDetails.basicDetails.ShipmentTypeName': 'Land',
        'quotationDetails.carrierId': this.getCognitoUserDetail?.driverId
      };
    } else {
      parameter.query = {
        ...parameter.query,
        "$and": [
          ...(parameter.query["$and"] || []),
          { "enquiryDetails.basicDetails.ShipmentTypeName": { "$ne": 'Land' } }
        ]
      };
    }
  
    if (this.closedJobs) {
      parameter.query['statusOfBatch'] = 'Job Closed';
    } else {
      parameter.query = {
        ...parameter.query,
        "$and": [
          ...(parameter.query["$and"] || []),
          { "statusOfBatch": { "$ne": "Job Closed" } }
        ]
      };
    }
  
    this._api.getSTList(Constant.BATCH, parameter).subscribe(
      (data: any) => {
        const modifiedTableData = data?.documents;
  
        if (modifiedTableData) {
          const columnsToHide = ['status', 'action'];
  
          const safeTransform = (value: any) => {
            return isNaN(Date.parse(value)) ? '' : this.datePipe.transform(value, 'dd-MM-yyyy');
          };
          
          const tableData = modifiedTableData.map((s: any, index: number) => ({
            ...s,
            id: index + 1,
          
            routeDetails_etd: safeTransform(s?.routeDetails?.etd),
            routeDetails_atd: safeTransform(s?.routeDetails?.atd),
            routeDetails_eta: safeTransform(s?.routeDetails?.eta),
            routeDetails_ata: safeTransform(s?.routeDetails?.ata),
            routeDetails_railETD: safeTransform(s?.routeDetails?.railETD),
          
            nocDate: safeTransform(s?.nocDate),
            cfsRequestDate: safeTransform(s?.cfsRequestDate),
            igmRequestDate: safeTransform(s?.igmRequestDate),
          }));
  
          const newColumLabels = [
            'Job No.', 'Status', 'Milestone Date', 'Shipper', 'Consignee', 'Agent',
            'Booking No.', 'Shipment Type', 'Load Type', 'Port of Loading',
            'Port of Discharge', 'Final Destination', 'Shipping Line', 'Container Type',
            'MBL No', 'MBL TYPE', 'HBL NO.', 'HBL TYPE', 'CONTAINER NO.', 'VESSEL',
            'ETD', 'ATD', 'ETA', 'ATA', 'Railing Date', 'NOC Date',
            'CFS Request DATE', 'IGM NO.', 'IGM Request Date', 'IGM Line No.'
          ];
  
          const actualColumns = [
            'batchNo',
            'statusOfBatch',
            'milestoneEstiDate',
            'enquiryDetails.basicDetails.shipperName',
            'enquiryDetails.basicDetails.consigneeName',
            'enquiryDetails.basicDetails.agentShortName',
            'enquiryDetails.basicDetails.bookingRef',
            'enquiryDetails.basicDetails.ShipmentTypeName',
            'enquiryDetails.basicDetails.loadType',
            'enquiryDetails.routeDetails.loadPortName',
            'enquiryDetails.routeDetails.destPortName',
            'enquiryDetails.routeDetails.locationName',
            'quotationDetails.carrierShortName',
            'containersName',
            'mblNumber',
            'MBLStatus',
            'hblNumbers',
            'HBLStatus',
            'containerNos',
            'quotationDetails.vesselName',
            'routeDetails_etd',
            'routeDetails_atd',
            'routeDetails_eta',
            'routeDetails_ata',
            'routeDetails_railETD',
            'nocDate',
            'cfsRequestDate',
            'igmNo',
            'igmRequestDate',
            'lineNo'
          ];
  
          // 🟢 Export to Excel
          this.commonfunction.exportToExcel(
            actualColumns,
            tableData,
            columnsToHide,
            'Job',
            newColumLabels,
            actualColumns
          );
        } else {
          console.error("No data received for export.");
        }
      },
      (error) => {
        console.error("Error fetching data from API", error);
      }
    );
  }
  
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    this.filterKeys = {};
    let shouldArray = []

    let dummyCell = [...this.displayedColumns];
    dummyCell.push('enquiryDetails.basicDetails.shipperShortName')
    dummyCell.push('enquiryDetails.basicDetails.consigneeShortName')
    dummyCell.push('quotationDetails.carrierShortName')
    dummyCell.forEach((each, ind) => {
      if (each !== '#' && each !== 'action') {
        this.filterKeys[each] = {
          "$regex": filterValue?.toLowerCase(),
          "$options": "i"
        }
        shouldArray.push({ [each]: { "$regex": filterValue?.toLowerCase(), "$options": "i" } },)
      }
    });
    var parameter: any = {
      "project": [],
      "query": { "isExport": (this.isExport || this.isTransport), "$or": shouldArray },
      "sort": {
        "asc": ["createdOn"]
      },
      size: 200,
      from: 0,
    }


    if (this.selectedShipmentTypes?.length) {
      parameter.query['enquiryDetails.basicDetails.ShipmentTypeName'] = this.selectedShipmentTypes[0];
    }


    if (this.isTransport) {
      parameter.query = {
        ...parameter.query,
        'enquiryDetails.basicDetails.ShipmentTypeName': 'Land',
      }
    } else if (this.currentLogin === 'transporter') {
      parameter.query = {
        'enquiryDetails.basicDetails.ShipmentTypeName': 'Land',
        'quotationDetails.carrierId': this.getCognitoUserDetail?.driverId
      }
    } else {
      parameter.query = {
        ...parameter.query,

        "$and": [
          ...(parameter.query["$and"] || []),
          {
            "enquiryDetails.basicDetails.ShipmentTypeName": {
              "$ne": 'Land'
            }
          }
        ]
      }
    }


    if (this.selectedStatus) {
      parameter.from = 0;
      if (this.selectedStatus == 'HBL Telex Pending') {
        parameter.query['HBLStatus'] = { "$regex": "PENDING", "$options": "i" };
      } else if (this.selectedStatus == 'MBL Telex Pending') {
        parameter.query['MBLStatus'] = { "$regex": "PENDING", "$options": "i" };
      }
    }

    if (this.selectedNOC) {
      parameter.from = 0;
      if (this.selectedNOC == 'NOC Pending') {
        parameter.query['$and'].push({
          "$or": [
            { "nocDate": { "$exists": false } },
            { "nocDate": { "$eq": "" } },
            { "nocDate": { "$eq": null } }
          ]
        })
      } else if (this.selectedNOC == 'CFS Pending') {
        parameter.query['isCfsRequired'] = true
        parameter.query['$and'].push({
          "$or": [
            { "cfsRequestDate": { "$exists": false } },
            { "cfsRequestDate": { "$eq": "" } },
            { "cfsRequestDate": { "$eq": null } }
          ]
        })
      } else if (this.selectedNOC == 'IGM Pending') {
        parameter.query['$and'].push({
          "$or": [
            { "igmRequestDate": { "$exists": false } },
            { "igmRequestDate": { "$eq": "" } },
            { "igmRequestDate": { "$eq": null } }
          ]
        })
      }
    }
    if (this.closedJobs) {
      this.selectedMilestone = ''
      parameter.from = 0;
      parameter.query['statusOfBatch'] = 'Job Closed';
    } else if (this.cancelledJob) {
      this.selectedMilestone = ''
      parameter.from = 0;
      parameter.query['statusOfBatch'] = 'Job Cancelled';
    } else {
      parameter.query = {
        ...parameter.query,
        "$and": [
          ...(parameter.query["$and"] || []),
          {
            "statusOfBatch": {
              "$ne": "Job Closed"
            }
          },
          {
            "statusOfBatch": {
              "$ne": "Job Cancelled"
            }
          }
        ]
      };
    }

    if (this.selectedMilestone) {
      parameter.from = 0;
      parameter.query['statusOfBatch'] = this.selectedMilestone;
    }



    if (!filterValue) {
      this.pageNumber = 1;
      this.pageSize = 200;
      this.from = 0;
      this.totalCount = 0;
      this.getBatchList();
      return;
    }
    this._api.getSTList(Constant.BATCH, parameter)
      .subscribe((data: any) => {
        this.batchList = data.documents;
        this.dataSource = new MatTableDataSource(
          data?.documents?.map((s: any, index) => {
            return {
              ...s,
              id: index + 1
            }
          })
        );
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1;
        this.toalLength = data.totalCount;
        this.count = data.documents.length;

        if (localStorage.getItem('sortByValue') !== '') {
          this.onSortingChange(localStorage.getItem('sortByValue') || '')
        } else {
          this.getSORT()
        }
      });
  }

  displayedColumns1 = this.displayedColumns.map((x, i) => x + '_' + i);
  toggleFilters = true;
  filtersModel = [];
  filterKeys = {};

  searchColumns() {
    this.filterKeys = {};
    this.filtersModel.forEach((each, ind) => {
      if (each) {
        const trimmedInput = each.trim();
        if (this.displayedColumns[ind] == 'updatedOn') {
          this.filterKeys['updatedOn'] = {
            "$gt": trimmedInput.substring(0, 10) + 'T00:00:00.000Z',
            "$lt": trimmedInput.substring(0, 10) + 'T23:59:00.000Z'
          };
        } else if (this.displayedColumns[ind] == 'routeDetails.railETD') {
          this.filterKeys['routeDetails.railETD'] = {
            "$gt": trimmedInput.substring(0, 10) + 'T00:00:00.000Z',
            "$lt": trimmedInput.substring(0, 10) + 'T23:59:00.000Z'
          };
        } else if (this.displayedColumns[ind] == 'nocDate') {
          this.filterKeys['nocDate'] = {
            "$gt": trimmedInput.substring(0, 10) + 'T00:00:00.000Z',
            "$lt": trimmedInput.substring(0, 10) + 'T23:59:00.000Z'
          };
        } else if (this.displayedColumns[ind] == 'igmDate') {
          this.filterKeys['igmDate'] = {
            "$gt": trimmedInput.substring(0, 10) + 'T00:00:00.000Z',
            "$lt": trimmedInput.substring(0, 10) + 'T23:59:00.000Z'
          };
        } else if (this.displayedColumns[ind] == 'routeDetails.eta') {
          this.filterKeys['routeDetails.eta'] = {
            "$gt": trimmedInput.substring(0, 10) + 'T00:00:00.000Z',
            "$lt": trimmedInput.substring(0, 10) + 'T23:59:00.000Z'
          };
        } else if (this.displayedColumns[ind] == 'routeDetails.etd') {
          this.filterKeys['routeDetails.etd'] = {
            "$gt": trimmedInput.substring(0, 10) + 'T00:00:00.000Z',
            "$lt": trimmedInput.substring(0, 10) + 'T23:59:00.000Z'
          };
        } else {
          this.filterKeys[this.displayedColumns[ind]] = {
            "$regex": trimmedInput?.toLowerCase(),
            "$options": "i"
          }
        }
      }
    });

    this.filterKeys['isExport'] = (this.isExport || this.isTransport)


    this.page = 1;
    this.fromSize = 1;
    var parameter = {
      "project": [],
      "query": { ...this.filterKeys },
      "sort": {
        "asc": ["createdOn"]
      },
      size: Number(10000),
      from: this.page - 1,
    }



    if (this.selectedShipmentTypes?.length) {
      parameter.query['enquiryDetails.basicDetails.ShipmentTypeName'] = this.selectedShipmentTypes[0];
    }


    if (this.isTransport) {
      parameter.query = {
        ...parameter.query,
        'enquiryDetails.basicDetails.ShipmentTypeName': 'Land',
      }
    } else if (this.currentLogin === 'transporter') {
      parameter.query = {
        'enquiryDetails.basicDetails.ShipmentTypeName': 'Land',
        'quotationDetails.carrierId': this.getCognitoUserDetail?.driverId
      }
    } else {
      parameter.query = {
        ...parameter.query,

        "$and": [
          ...(parameter.query["$and"] || []),
          {
            "enquiryDetails.basicDetails.ShipmentTypeName": {
              "$ne": 'Land'
            }
          }
        ]
      }
    }


    if (this.selectedStatus) {
      parameter.from = 0;
      if (this.selectedStatus == 'HBL Telex Pending') {
        parameter.query['HBLStatus'] = { "$regex": "PENDING", "$options": "i" };
      } else if (this.selectedStatus == 'MBL Telex Pending') {
        parameter.query['MBLStatus'] = { "$regex": "PENDING", "$options": "i" };
      }
    }
    if (this.selectedNOC) {
      parameter.from = 0;
      if (this.selectedNOC == 'NOC Pending') {
        parameter.query['$and'].push({
          "$or": [
            { "nocDate": { "$exists": false } },
            { "nocDate": { "$eq": "" } },
            { "nocDate": { "$eq": null } }
          ]
        })
      } else if (this.selectedNOC == 'CFS Pending') {
        parameter.query['isCfsRequired'] = true
        parameter.query['$and'].push({
          "$or": [
            { "cfsRequestDate": { "$exists": false } },
            { "cfsRequestDate": { "$eq": "" } },
            { "cfsRequestDate": { "$eq": null } }
          ]
        })
      } else if (this.selectedNOC == 'IGM Pending') {
        parameter.query['$and'].push({
          "$or": [
            { "igmRequestDate": { "$exists": false } },
            { "igmRequestDate": { "$eq": "" } },
            { "igmRequestDate": { "$eq": null } }
          ]
        })
      }
    }

    if (this.closedJobs) {
      this.selectedMilestone = ''
      parameter.from = 0;
      parameter.query['statusOfBatch'] = 'Job Closed';
    } else if (this.cancelledJob) {
      this.selectedMilestone = ''
      parameter.from = 0;
      parameter.query['statusOfBatch'] = 'Job Cancelled';
    } else {
      parameter.query = {
        ...parameter.query,
        "$and": [
          ...(parameter.query["$and"] || []),
          {
            "statusOfBatch": {
              "$ne": "Job Closed"
            }
          },
          {
            "statusOfBatch": {
              "$ne": "Job Cancelled"
            }
          }
        ]
      };
    }

    if (this.selectedMilestone) {
      parameter.from = 0;
      parameter.query['statusOfBatch'] = this.selectedMilestone;
    }

    this._api.getSTList(Constant.BATCH, parameter)
      .subscribe((data: any) => {
        this.batchList = data.documents;
        this.toalLength = data.totalCount;
        this.count = data.documents.length;

        this.dataSource = new MatTableDataSource(
          data?.documents?.map((s: any, index) => {
            return {
              ...s,
              id: index + 1
            }
          })
        );
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1;

        if (localStorage.getItem('sortByValue') !== '') {
          this.onSortingChange(localStorage.getItem('sortByValue') || '')
        } else {
          this.getSORT()
        }

      });

  }

  clearFilters() {
    this.filtersModel = [];
    this.filterKeys = {};
    this.getBatchList();
  }

  navigateToNewTab(element) {
    let url = ""
    if (element?.statusOfBatch == 'Draft') {
      url = '/batch/list/add/' + element?.batchId + '/draft'
    } else {
      url = '/batch/list/add/' + element?.batchId + '/details'
    }
    this.router.navigate([url]);
  }
  onOpenEdit(element: any, actionType?: string) {
    let url: string;
      url = `/batch/list/add/${element?.batchId}/cloneJob`;
    this.router.navigate([url]);
  }
  navigateToNewTab1(element) {
    let url = 'add/' + element.batchId + '/details'
    window.open(window.location.href + '/' + url);
  }

  navigateToNewTab2(element) {
    let url = (element?.enquiryStatus == 'Pending' || element?.enquiryStatus == 'Inquiry Draft') ? '/enquiry/list/' + element?.enquiryId + '/edit' : '/enquiry/list/' + element?.enquiryId + '/quote'
    // this.router.navigate([url]);
    window.open(url);
  }
  navigateToNewTab3(element) {
    let url = (element?.enquiryStatus == 'Pending' || element?.enquiryStatus == 'Inquiry Draft') ? '/enquiry/list/' + element?.enquiryId + '/edit' : '/enquiry/list/' + element?.enquiryId + '/quote'
    window.open(window.location.href + '/' + url);
  }
  shipperList: ShippingLine[] = [];
  openShipper(content, id) {

    let payload = this._api.filterList()
    payload.query = {
      "partymasterId": id,
    }
    this._api.getSTList("partymaster", payload).subscribe((res: any) => {
      this.shipperList = res?.documents[0];
    });

    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
    // modalRef.componentInstance.id = id;
  }

  onenMap(content, element) {
    let vesselId = element?.quotationDetails?.vesselId;
    let payload = this.commonService.filterList();
    payload.query = {
      vesselId: vesselId
    }
    this._api.getSTList('vessel', payload)?.subscribe(
      (result) => {
        if (result) {
          this.mmsiNo = result?.documents?.[0]?.mmsino;
          this.vesselName = result?.documents?.[0]?.vesselName;
          if (!this.mmsiNo) {
            this.notification.create('error', 'Tracking Id Not Available, Please Update MMSI In Vessel', '');
            return;
          }
          this.modalService.open(content, {
            ariaLabelledBy: 'modal-basic-title',
            backdrop: 'static',
            keyboard: false,
            centered: true,
            size: 'lg',
          });
        }
      })

  }
  batchDetails: Batch
  remark: string = '';


  openJobCloseDialog(data: any): void {
    const dialogRef = this.dialog.open(this.jobCloseTemplate, {
      width: '500px',
      id: "jobClose",
      height: 'auto',
      data: data
    });

    dialogRef.afterClosed().subscribe((remark) => {
      if (remark) {
        this.batchClose(data, remark);
      }
    });
  }
  openHistoryBatchData: any;
  async openJobHistoryDialog(content, data: any) {
    this.openHistoryBatchData = data;
    this.showHistory = true;
    await this.getAuditLog(data);
    // const dialogRef = this.dialog.open(this.changeLogHistory, {
    //   width: '1000px',
    //   id:"jobClose",
    //   height: 'auto',
    //   data: data
    // });

    // dialogRef.afterClosed().subscribe((remark) => {
    //   if (remark) {
    //     this.batchClose(data, remark);
    //   }
    // });

    this.modalRef = this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'xl',
    });

  }

  auditLogsList: any = [];
  jobdataSource = new MatTableDataSource();
  displayedColumnsChangeLogs: any = [
    '#',
    'updatedBy',
    'action',
    'resource',
    'updatedOn',
    'details'
  ];
  displayedColumnsChangeLogs1: any = [];
  toalLengthChangeLog: any = 0;
  countChangeLog: any = 0;
  async getAuditLog(data) {
    this.jobdataSource = new MatTableDataSource([])
    // this.loaderService.showcircle();
    var parameter = this.commonService.filterList()
    parameter.query = {
      resourceId: data?.batchId,
      resource: 'batch'
    }


    await this.commonService.getSTList('logaudit', parameter)
      .subscribe((data: any) => {
        this.auditLogsList = data?.documents.map((s: any, index) => {
          return {
            ...s,
            ...s.updatedData
          }
        }) || []
        this.jobdataSource = new MatTableDataSource(data?.documents?.map((s: any, index) => {
          return {
            ...s,
            ...s.updatedData
          }
        }));

        this.displayedColumnsChangeLogs1 = this.displayedColumnsChangeLogs.map((x, i) => x + '_' + i);


        this.jobdataSource.paginator = this.paginator;
        this.jobdataSource.sort = this.sort1;
        this.toalLengthChangeLog = data.totalCount;
        // this.count = data.documents.length; 
        return true;
      }, () => {
        console.log("Error while fetching records");
        return false;
      });
  }


  onPageChange1(event) {
    // this.pageNumber = event.pageIndex + 1;
    // this.pageSize = event.pageSize;
    // this.from = event.pageIndex * event.pageSize;
    // this.getAuditLog(this.openHistoryBatchData);
  }

  displayedColumns2 = []
  displayedColumns3 = []

  jobdataSource1 = new MatTableDataSource();

  showHistory: boolean = true;
  showDetails(array1, i) {
    this.jobdataSource1 = new MatTableDataSource([])


    this.displayedColumns2 = [
      '#',
      'keyName',
      'previousValue',
      'newValue',
      'updatedBy',
      'updatedOn',
    ]
    this.displayedColumns3 = this.displayedColumns2.map((x, i) => x + '_' + i);

    const Table2 = this.compareObjects(this.auditLogsList[i + 1] || {}, array1 || {}, array1?.updatedBy, array1?.updatedOn)

    this.jobdataSource1 = new MatTableDataSource(
      Table2?.map((s: any, index) => {
        return {
          ...s
        }
      })
    );

    // this.dataSource1.paginator = this.paginator;
    this.jobdataSource1.sort = this.sort1;

    this.showHistory = false;
    // this.modalRef = this.modalService.open(content, {
    //   ariaLabelledBy: 'modal-basic-title',
    //   backdrop: 'static',
    //   keyboard: false,
    //   centered: true,
    //   size: 'xl',
    // });
  }
  private modalRef: NgbModalRef;
  cancel() {
    this.showHistory = true;
    // this.modalRef.dismiss()
  }
  cancelHistory() {
    this.modalService.dismissAll()
  }
  applyFilter1(filterValue: string) {
    this.jobdataSource1.filter = filterValue.trim().toLowerCase();
  }

  compareObjects(obj1, obj2, updatedBy, updatedOn, parentKey = '', result = []) {
    // Utility function to format dates
    function formatDate(date) {
      if (!(date instanceof Date)) date = new Date(date);
      const options: any = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      };
      return new Intl.DateTimeFormat('en-GB', options).format(date).replace(',', '');
    }

    if (Object.keys(obj1).length === 0) {
      for (const key in obj2) {
        if (key !== 'updatedData') {
          const fullKey = parentKey ? `${parentKey}.${key}` : key;

          if (typeof obj2[key] === 'object' && obj2[key] !== null && !Array.isArray(obj2[key])) {
            this.compareObjects({}, obj2[key], updatedBy, updatedOn, fullKey, result);
          } else if (Array.isArray(obj2[key])) {
            obj2[key].forEach((item, index) => {
              if (typeof item === 'object' && item !== null) {
                this.compareObjects({}, item, updatedBy, updatedOn, `${fullKey}[${index}]`, result);
              } else {
                result.push({
                  keyName: `${fullKey}[${index}]`,
                  previousValue: undefined,
                  newValue: item,
                  updatedBy,
                  updatedOn
                });
              }
            });
          } else {
            result.push({
              keyName: fullKey,
              previousValue: undefined,
              newValue: obj2[key],
              updatedBy,
              updatedOn
            });
          }
        }
      }
      return result;
    }

    for (const key in obj1) {
      if (key === 'updatedData') continue;

      const fullKey = parentKey ? `${parentKey}.${key}` : key;

      if (!(key in obj2)) {
        result.push({
          keyName: fullKey,
          previousValue: obj1[key],
          newValue: undefined,
          updatedBy,
          updatedOn
        });
      } else if (typeof obj1[key] === 'object' && obj1[key] !== null && !Array.isArray(obj1[key])) {
        this.compareObjects(obj1[key], obj2[key], updatedBy, updatedOn, fullKey, result);
      } else if (Array.isArray(obj1[key])) {
        obj1[key].forEach((item, index) => {
          if (typeof item === 'object' && item !== null) {
            this.compareObjects(
              item,
              obj2[key] && obj2[key][index] ? obj2[key][index] : {},
              updatedBy,
              updatedOn,
              `${fullKey}[${index}]`,
              result
            );
          } else {
            if (!obj2[key] || obj2[key][index] !== item) {
              result.push({
                keyName: `${fullKey}[${index}]`,
                previousValue: item,
                newValue: obj2[key] ? obj2[key][index] : undefined,
                updatedBy,
                updatedOn
              });
            }
          }
        });

        if (obj2[key] && obj2[key].length > obj1[key].length) {
          obj2[key].slice(obj1[key].length).forEach((item, index) => {
            const adjustedIndex = obj1[key].length + index;
            if (typeof item === 'object' && item !== null) {
              this.compareObjects(
                {},
                item,
                updatedBy,
                updatedOn,
                `${fullKey}[${adjustedIndex}]`,
                result
              );
            } else {
              result.push({
                keyName: `${fullKey}[${adjustedIndex}]`,
                previousValue: undefined,
                newValue: item,
                updatedBy,
                updatedOn
              });
            }
          });
        }
      } else if (obj1[key] !== obj2[key]) {
        const previousValue = obj1[key] instanceof Date || !isNaN(Date.parse(obj1[key]))
          ? formatDate(obj1[key])
          : obj1[key];

        const newValue = obj2[key] instanceof Date || !isNaN(Date.parse(obj2[key]))
          ? formatDate(obj2[key])
          : obj2[key];

        result.push({
          keyName: fullKey,
          previousValue,
          newValue,
          updatedBy,
          updatedOn
        });
      }
    }

    for (const key in obj2) {
      if (!(key in obj1) && key !== 'updatedData') {
        const fullKey = parentKey ? `${parentKey}.${key}` : key;

        if (Array.isArray(obj2[key])) {
          obj2[key].forEach((item, index) => {
            if (typeof item === 'object' && item !== null) {
              this.compareObjects({}, item, updatedBy, updatedOn, `${fullKey}[${index}]`, result);
            } else {
              result.push({
                keyName: `${fullKey}[${index}]`,
                previousValue: undefined,
                newValue: item,
                updatedBy,
                updatedOn
              });
            }
          });
        } else {
          result.push({
            keyName: fullKey,
            previousValue: undefined,
            newValue: obj2[key],
            updatedBy,
            updatedOn
          });
        }
      }
    }

    return result;
  }


  cancelJobClose(dialogRef: any): void {
    this.dialog.closeAll();
  }

  submitJobClose(dialogRef: any): void {
    const remark = this.remark;
    this.batchClose(dialogRef, remark);
    this.dialog.closeAll();
  }

  batchClose(data: any, remark: string): void {
    const payload = { ...data, statusOfBatch: 'Job Cancelled', rejectRemarks: remark };
    this._api.UpdateToST(`batch/${data?.batchId}`, payload).subscribe(
      (res: any) => {
        setTimeout(() => {
          if (res) {
            this.notification.create(
              'success',
              'Job Cancelled Successfully',
              ''
            );
            this.getBatchList();
          }
        }, 500);
      },
      (error) => {
        this.notification.create(
          'error',
          error?.error?.error?.message,
          ''
        );
      }
    );
  }


  // batchCancel(data){
  //   let payload = { ...data , statusOfBatch: 'Job Cancelled' }
  //   this._api.UpdateToST(`batch/${data?.batchId}`, payload).subscribe((res: any) => {
  //     setTimeout(() => {
  //       if (res) {
  //         this._api.UpdateToST(`enquiry/${this.batchDetails?.enquiryId}`,{enquiryStatus:"Inquiry Accepted"}).subscribe(() => {})
  //         this.notification.create(
  //           'success',
  //           'Job Cancelled Successfully',
  //           ''
  //         );
  //         this.router.navigate(['/batch/list']);
  //       }
  //     }, 500);
  //   },
  //     error => {
  //       this.notification.create(
  //         'error',
  //         error?.error?.error?.message,
  //         ''
  //       );
  //     });
  // }



  navigateToNewTab4(element) {
    let url = (element?.enquiryStatus == 'Pending' || element?.enquiryStatus == 'Inquiry Draft') ? '/agent-advice/list/' + element?.agentadviceId + '/edit' : '/agent-advice/list/' + element?.agentadviceId + '/quote'
    this.router.navigate([url]);
  }

  onCheckboxChange(event: any, shipmentType: string) {
    if (event.target.checked) {
      const otherType = shipmentType === 'Ocean' ? 'Air' : 'Ocean';
      (document.getElementById(otherType) as HTMLInputElement).checked = false;
      this.selectedShipmentTypes = [shipmentType];
    } else {
      this.selectedShipmentTypes = this.selectedShipmentTypes.filter(type => type !== shipmentType);
    }
    this.getBatchList();
  }

  onClosedJobsChange(value: boolean) {
    this.closedJobs = value;
    this.cancelledJob = false;
    this.getBatchList();
  }

  oncancelledJobChange(value: boolean) {
    this.cancelledJob = value;
    this.closedJobs = false;
    this.getBatchList();
  }

  navigateLogs(e) {
    this.router.navigate(['batch/audit-logs'], { queryParams: { id: e?.batchId, collection: "batch", url: this.router.url } });
  }
  getFormattedHblNumbers(hblNumbers: string | null | undefined): string {
    if (!hblNumbers) {
      return '-';
    }
    return hblNumbers.replace(/,/g, ', ');
  }
  filterHBL(blData: any[]): any[] {
    return (blData || []).filter(bl => bl.blType === 'HBL');
  }


  closedJobs: boolean = false;
  cancelledJob: boolean = false;


  getRowClass(status: any): string {
    if (!status) {
      return 'green-text'; // Use a default class for undefined or null status
    }
    const normalizedStatus = status.toString().toLowerCase();
    if (normalizedStatus === 'pending') {
      return 'red-text';
    } else {
      return 'green-text';
    } // Fallback class for unexpected values
  }

  getColor(status) {
    if (status) {
      const milestone = this.milestoneType?.find((i) => i?.mileStoneName === status);
      if (milestone) {
        return milestone?.color;
      } else {
        return '#007BFF';
      }
    } else {
      return '#007BFF';
    }
  }

  colors = [
    '#FFFFFF',
    '#FFBB96',
    '#FFD591',
    '#FFE58F',
    '#FFFB8F',
    '#EAFF8F',
    '#B7EB8F',
    '#87E8DE',
    '#91CAFF',
    '#ADC6FF',
    '#D3ADF7',
    '#FFADD2'
  ];

  // Selected color
  selectedColor: string | null = null;

  // Method to select a color
  selectColor(color: string, job): void {
    this.selectedColor = color;
    console.log('Selected color:', color);
    this._api.UpdateToST('batch/' + job.batchId, { ...job, shipmentColorCode: color }).subscribe((res: any) => {
      setTimeout(() => {
        if (res) {
          this.notification.create(
            'success',
            'Status Updated Successfully',
            ''
          );
          this.getBatchList();

        }
      }, 1000);
    },
      error => {
        this.notification.create(
          'error',
          error?.error?.error?.message,
          ''
        );
      });
  }


  updateColorApi(color: string): void {
    console.log('API updated with color:', color);
    // Integrate your API call here
  }

  getRowClassHighLight(shipmentColorCode: string): string {
    // You can apply custom logic based on the color code
    if (!shipmentColorCode) {
      return ''; // No color code, no class
    }

    // If the color code is a valid color, you can return it directly as a class
    return `highlight-${shipmentColorCode.replace('#', '').toLowerCase()}`;
  }
  returnShipper(element) {
    if (!element?.enquiryDetails?.basicDetails) return [];

    const { shipperShortName, shipperName, shipperId, multiShipper } = element.enquiryDetails.basicDetails;

    const result = [];

    // Add main shipper details
    if (shipperName) {
      result.push({
        name: shipperShortName ? `${shipperShortName} - ${shipperName}` : shipperName,
        partymasterId: shipperId || null
      });
    }

    // Add multiShipper details
    if (Array.isArray(multiShipper) && multiShipper.length > 0) {
      result.push(
        ...multiShipper.map(({ partyShortcode, name, partymasterId }) => ({
          name: partyShortcode ? `${partyShortcode} - ${name}` : name,
          partymasterId: partymasterId || null
        }))
      );
    }

    return result;
  }

  returnConsignee(element) {
    if (!element?.enquiryDetails?.basicDetails) return [];

    const { consigneeShortName, consigneeName, consigneeId, multiConsignee } = element.enquiryDetails.basicDetails;

    const consigneeList = [];

    // Add main consignee
    if (consigneeName) {
      consigneeList.push({
        name: consigneeShortName ? `${consigneeShortName} - ${consigneeName}` : consigneeName,
        partymasterId: consigneeId || null,
      });
    }

    // Add multi consignees
    if (Array.isArray(multiConsignee)) {
      multiConsignee.forEach(({ partyShortcode, name, partymasterId }) => {
        consigneeList.push({
          name: partyShortcode ? `${partyShortcode} - ${name}` : name,
          partymasterId: partymasterId || null,
        });
      });
    }

    return consigneeList;
  }
  getMBLBlData(blData: any[]): any[] {
    if (!blData || !Array.isArray(blData)) return [];
    return blData
      .filter(bl => bl.blType === 'MBL' && bl.blStatus); // only MBL with a defined status
  }
  getHBLBlData(blData: any[]): any[] {
    if (!blData || !Array.isArray(blData)) return [];
    return blData
      .filter(bl => bl.blType === 'HBL' && bl.blStatus); // only MBL with a defined status
  }
  patternMatched = true;
  onCustomFilterInputChange(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.patternMatched = true;
    this.applyFilter(filterValue); // Directly call your own filtering logic
  }
  bookingConfirmation(batchId: string) {
    const url = `send-booking-confirmation/${batchId}`;
    this.commonService.bookingConfirm(url).subscribe(
      (res: any) => {
        console.log(res);
        if (res) {
          this.notification.create('success', 'Booking Confirmation Successfully', '');
        }
      },
      error => {
        this.notification.create(
          'error',
          error?.error?.error?.message,
          ''
        );
      }
    );
  }
}

