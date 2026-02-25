import {
  Component,
  Input,
  OnChanges,
  OnInit,
  AfterViewInit,
  Output,
  SimpleChanges,
  EventEmitter,
  ViewChild,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from 'src/app/admin/principal/api.service';
import * as Constant from 'src/app/shared/common-constants';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CommonService } from 'src/app/services/common/common.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { Bl } from 'src/app/models/stolt-bl';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
import { DatePipe } from '@angular/common';
import { CommonFunctions } from 'src/app/shared/functions/common.function';

export interface GateOutRecord {
  id: number;
  gatePassNumber: string;
  jobNumber: string;
  importer: string;
  purchaser: string;
  truckNumber: string;
  containerNumber: string;
  grossWeight: number;
  netWeight: number;
  dateTime: Date;
  status: string;
  warehousegateoutentryId: string;
}

export interface ContainerRecord {
  _id: string;
  containerNo: string;
  containerTypeName: string;
  containerType: string;
  warehousedataentryId?: string;
  warehousecontainerId?: string;
  parentRecord?: any;
  id?: number;

  // Status fields - matching API response
  gateInStatus?: string; // "Done", "Pending", "Not Started"
  inwardStatus?: string; // Will use inWardStatus from API
  inWardStatus?: string; // From API
  gateOutStatus?: string; // "Pending", "Done", "Not Started"

  // Additional fields from API
  inwardHandover?: string;
  inWardHandOver?: string; // From API

  finance?: {
    amount: number;
    status: string;
  } | string;

  location?: {
    warehouse: string;
    section?: string;
  } | string;

  // Quantity fields
  qtyAsPerBOE?: number;
  boeUnit?: string;
  actualQtyReceived?: number;
  receivedUnit?: string;
  dispatchQty?: number;
  dispatchUnit?: string;
  balanceQty?: number;
  balanceUnit?: string;
  gateInQty?: string; // From API

  // Audit fields
  createdOn?: string;
  updatedOn?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface WarehouseGateOutRecord {
  _id: string;
  warehousedataentryId: string;
  warehousedispatchId?: string;
  dispatchDate?: string;
  SuerveyourName?: string;
  dispatchPackage?: string;
  transporterLedger?: string;
  gatePassNumber?: string;
  purchaserName?: string;
  truckNumber?: string;
  containerNumber?: string;
  jobNo?: string;
  blNo?: string;
  importerLedger?: string;
  vessel?: string;
  containers?: ContainerRecord[];
  inEntryDateTime?: string;
  gateOutDate?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-warehouse-container',
  templateUrl: './warehouse-container.component.html',
  styleUrls: ['./warehouse-container.component.scss']
})
export class WarehouseContainerComponent implements OnInit, AfterViewInit {
  _gc = GlobalConstants;
  @Input() batchDetail;
  @Output() getblDataOfBtahcDetails: EventEmitter<any> = new EventEmitter();
  warehousegateoutentryId: string;
  urlParam: any;
  currentUrl: any;
  buttonDisabled: boolean = true;
  order: boolean = true;
  toalLength: any;
  size = 10;
  page = 1;
  count = 0;
  blData: Bl[] = [];
  fromSize: number = 1;
  blNumber: string;
  blTypeName: string;
  shipperName: string;
  consigneeName: string;
  voyageNumber: string;
  polName: string;
  status: string;
  isAddMode: any;
  batchId: string;
  moveNo: string;
  vessel_name: string;
  baseBody: string;
  blDate: string;
  globalSearch: string;
  isExport: boolean = false;

  @ViewChild(MatDrawer) drawer: MatDrawer | any;
  dataSource = new MatTableDataSource<WarehouseGateOutRecord>();
  containerDataSource = new MatTableDataSource<ContainerRecord>();
  pagenation = [10, 20, 50, 100];
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns = [
    '#',
    'containerNo',
    'chngescontainerNo',
    'gateInStatus',
    'inwardStatus',
    'inwardHandover',
    'gateOutStatus',
    'finance',
    'location',
    'qtyAsPerBOE',
    'actualQtyReceived',
    'totalDispatchQty',
    'balanceQty',
    'containerTypeName',
    'action',
  ];

  _id: string;
  containerNo: string;
  containerTypeName: string;
  containerType: string;
  warehousedataentryId?: string;
  parentRecord?: any;
  gateInStatus?: 'Not Started' | 'Pending' | 'Processing' | 'Done' | 'Done';
  inwardStatus?: 'Not Started' | 'Pending' | 'Processing' | 'Done' | 'Done';
  gateOutStatus?: 'Not Started' | 'Pending' | 'Processing' | 'Done' | 'Done';

  inwardHandover?: {
    type: string;
    dueDays?: number;
  };

  finance?: {
    amount: number;
    status: string;
  };

  location?: {
    warehouse: string;
    section?: string;
  } | string;
  qtyAsPerBOE?: number;
  boeUnit?: string;
  actualQtyReceived?: number;
  receivedUnit?: string;
  dispatchQty?: number;
  dispatchUnit?: string;
  balanceQty?: number;
  balanceUnit?: string;
  userData: any;
  id: any;
  isShow: boolean = false;
  isTransport: boolean;
  isImport: boolean;

  // Bill of Entry related properties
  editbillOfEntry: any;
  billOfEntryPackages: number = 0;
  containerNoList: any[] = [];
  gateInForm: any; // Add your form definition

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private _api: ApiService,
    private modalService: NgbModal,
    private notification: NzNotificationService,
    private cognito: CognitoService,
    private commonService: CommonService,
    public loaderService: LoaderService,
    private datePipe: DatePipe,
    private commonFunction: CommonFunctions,
  ) {
    this.router = router;
    this.route = route;
    this._api = _api;
    this.notification = notification;
    this.cognito = cognito;
    this.commonService = commonService;
    this.id = this.route.snapshot.params['moduleId'];
    this.isAddMode = !this.id;
    this.route.params.subscribe((params) => (this.urlParam = params));
    this.isShow = this.urlParam?.access == 'show' ? true : false;
    this.isExport = localStorage.getItem('isExport') === 'true' ? true : false;
    this.isImport = localStorage.getItem('isImport') === 'true' ? true : false;
    this.isTransport = localStorage.getItem('isTransport') === 'true' ? true : false;
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.getbillentry(); // Load bill of entry first
    }, 300);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.containerDataSource.paginator = this.paginator;
      this.containerDataSource.sort = this.sort1;
    });
  }

  onOpenconsolidate() {
    this.router.navigate([
      '/batch/list/add/' +
      this.urlParam?.id +
      '/' +
      this.urlParam.key +
      '/addconsolidate',
    ]);
  }

  onOpenNew() {
    this.router.navigate([
      '/batch/list/add/' + this.urlParam?.id + '/' + this.urlParam.key + '/add',
    ]);
  }

  getHeaderText(type: 'primary' | 'secondary'): string {
    let data = this.containerDataSource.data;
    if (data.length > 0) {
      const firstElement: any = data[0];
      if (!firstElement?.flightNo) {
        return type === 'primary' ? 'Voyage' : 'Vessel';
      } else {
        return type === 'primary' ? 'Airline' : 'FlightNo.';
      }
    }
    return '';
  }

  onMTReturn(element: ContainerRecord): void {
    if (!element?._id) {
      this.notification.create('error', 'Invalid Container', 'Please select a valid container');
      return;
    }

    const { id: batchId, key } = this.urlParam;
    const url = `/warehouse/main-ware-house/details/${batchId}/inwards-containers/add`;
    this.router.navigate([url]);
  }

  onGateOut(element: ContainerRecord): void {
    if (!element?._id) {
      this.notification.create('error', 'Invalid Container', 'Please select a valid container');
      return;
    }

    // Check if gate out is already done or in progress
    if (element.gateOutStatus === 'Done' || element.gateOutStatus === 'Processing') {
      this.notification.create('warning', 'Gate Out Status',
        `Gate Out is already ${element.gateOutStatus.toLowerCase()}`);
      return;
    }

    // Check if gate in is completed before allowing gate out
    if (element.gateInStatus !== 'Done') {
      this.notification.create('error', 'Gate In Required',
        'Gate In must be completed before Gate Out');
      return;
    }

    const { id, key } = this.urlParam;
    const url = `/warehouse/main-ware-house/details/${id}/gateOut/add`;

    this.router.navigate([url]);
  }

  onAddGateOut(): void {
    const { id, key } = this.urlParam;
    const url = `/warehouse/main-ware-house/details/${id}/gateOut/add`;
    this.router.navigate([url]);
  }

  onGateIn(element: ContainerRecord): void {
    if (!element?._id) {
      this.notification.create('error', 'Invalid Container', 'Please select a valid container');
      return;
    }

    // Check if gate in is already done or in progress
    if (element.gateInStatus === 'Done' || element.gateInStatus === 'Processing') {
      this.notification.create('warning', 'Gate In Status',
        `Gate In is already ${element.gateInStatus.toLowerCase()}`);
      return;
    }

    const { id, key } = this.urlParam;
    const url = `/warehouse/main-ware-house/details/${id}/gateIn/add`;
    console.log(`Navigating to Gate In with URL: ${url}`);

    this.router.navigate([url]);
  }

  onInward(): void {
    const { id, key } = this.urlParam;
    const url = `/warehouse/main-ware-house/details/${id}/inwards/add`;
    this.router.navigate([url]);
  }

  onOpenEdit(warehousedispatchId: string): void {
    const { id: batchId, key } = this.urlParam;
    const record = this.dataSource.data.find((item: WarehouseGateOutRecord) =>
      item.warehousedispatchId === warehousedispatchId
    );

    if (record) {
      const url = `/warehouse/main-ware-house/details/${batchId}/${key}/${record.warehousegateoutentryId}/edit`;
      this.router.navigate([url]);
    } else {
      this.notification.create('error', 'Record not found', '');
    }
  }

  onOpenEditAlternative(element: WarehouseGateOutRecord): void {
    const { id: batchId, key } = this.urlParam;
    const url = `/warehouse/main-ware-house/details/${batchId}/${key}/${element.warehousegateoutentryId}/edit`;
    this.router.navigate([url]);
  }

  onDeleteDispatch(id: string): void {
    this.commonService
      .deleteST('warehousedataentry/' + id)
      .subscribe((data) => {
        if (data) {
          this.notification.create('success', 'Deleted Successfully', '');
        }
        setTimeout(() => {
          this.getWarehouseDispatchById(this.urlParam.id);
        }, 1000);
      });
  }

  basecontentUrl: string;
  Documentpdf: any;

  onPrintCertificate(element: WarehouseGateOutRecord): void {
    if (!element || !element.warehousegateoutentryId) {
      this.notification.create('error', 'Invalid record', 'Please select a valid record to print');
      return;
    }

    this.loaderService.showcircle();

    const reportPayload = {
      parameters: {
        warehousegateoutentryId: element.warehousegateoutentryId
      }
    };

    this.commonService.pushreports(reportPayload, 'gateOute').subscribe({
      next: (res: any) => {
        try {
          this.loaderService.hidecircle();
          const blob = new Blob([res], { type: 'application/pdf' });
          const pdfUrl = URL.createObjectURL(blob);

          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          iframe.src = pdfUrl;
          document.body.appendChild(iframe);

          iframe.onload = () => {
            try {
              iframe.contentWindow?.print();
              setTimeout(() => {
                document.body.removeChild(iframe);
                URL.revokeObjectURL(pdfUrl);
              }, 1000);
              this.notification.create('success', 'Print Job Sent', 'Certificate sent to printer');
            } catch (printError) {
              console.error('Print error:', printError);
              window.open(pdfUrl, '_blank');
              this.notification.create('info', 'Print Manually', 'Please print from the opened window');
            }
          };
        } catch (error) {
          this.loaderService.hidecircle();
          console.error('Error processing PDF for print:', error);
          this.notification.create('error', 'Print Error', 'Failed to prepare document for printing');
        }
      },
      error: (error) => {
        this.loaderService.hidecircle();
        console.error('Print API Error:', error);
        this.notification.create('error', 'Print Failed', 'Failed to retrieve document for printing');
      }
    });
  }

  blMasterStatus: any = [];

  onBillAction(event) {
    const url = event ?? 'add';
    this.router.navigate([
      '/batch/list/' + url + '/' + this.urlParam.id + '/' + this.urlParam.key,
    ]);
  }

  batchDetails: any;

  /**
   * Get Bill of Entry data and store packages value
   */
  getbillentry() {
    let payload = this.commonService?.filterList();
    if (payload?.query) {
      payload.query = {
        warehousedataentryId: this.route.snapshot.params['id']
      };
    }

    this.commonService?.getSTList("warehousebillofentry", payload)?.subscribe({
      next: (res: any) => {
        console.log('Bill of Entry Response:', res);

        this.editbillOfEntry = res?.documents?.[0];

        // Store packages value from Bill of Entry
        this.billOfEntryPackages = this.parseNumber(this.editbillOfEntry?.packages) || 0;

        console.log('Bill of Entry Packages:', this.billOfEntryPackages);

        // Patch form values if form exists
        if (this.gateInForm) {
          if (this.editbillOfEntry?.whBeNo) {
            this.gateInForm.patchValue({
              whBeNumber: this.editbillOfEntry.whBeNo
            });
          }
          if (this.editbillOfEntry?.date) {
            this.gateInForm.patchValue({
              beDate: this.editbillOfEntry.date
            });
          }
        }

        this.containerNoList = this.editbillOfEntry?.containers || [];

        // Load warehouse dispatch data after getting Bill of Entry
        setTimeout(() => {
          this.getWarehouseDispatchById(this.urlParam.id);
        }, 300);
      },
      error: (error) => {
        console.error('Bill of Entry Error:', error);
        // Still load containers even if Bill of Entry fails
        this.getWarehouseDispatchById(this.urlParam.id);
      }
    });
  }

  /**
   * Get warehouse dispatch containers by ID
   */
  getWarehouseDispatchById(id: string): void {
    if (!id) {
      this.notification.create('error', 'Invalid ID', 'Warehouse ID is required');
      return;
    }

    this.loaderService.showcircle();

    const payload = this.commonService.filterList();
    payload.query = { warehousedataentryId: id };

    this.commonService
      .getSTList('warehousecontainer', payload)
      .subscribe({
        next: (res: { documents: any[], totalCount?: number }) => {
          console.log('Warehouse Container API Response:', res);

          if (!res || !res.documents) {
            this.notification.create('warning', 'No Data', 'No containers found');
            this.containerDataSource = new MatTableDataSource([]);
            this.loaderService.hidecircle();
            return;
          }

          const allContainers = res.documents.map((container, index) => {
            // Calculate actual quantity received with fallback priority:
            // 1. Container's actualQtyReceived
            // 2. Container's gateInQty
            // 3. Bill of Entry packages
            const actualQty = this.parseNumber(container.actualQtyReceived) ||
              this.parseNumber(container.gateInQty) ||
              this.billOfEntryPackages;

            const dispatchQty = this.parseNumber(container.dispatchQty) || 0;
            const qtyAsPerBOE = this.parseNumber(container.qtyAsPerBOE) || this.billOfEntryPackages;

            return {
              ...container,
              id: index + 1,

              // Map status fields correctly from API response
              gateInStatus: this.normalizeStatus(container.gateInStatus),
              inwardStatus: this.normalizeStatus(container.inWardStatus || container.inwardStatus),
              gateOutStatus: this.normalizeStatus(container.gateOutStatus),

              // Map handover information
              inwardHandover: container.inWardHandOver || container.inwardHandover || 'Not Started',

              // Map quantities with Bill of Entry fallback
              qtyAsPerBOE: qtyAsPerBOE,
              actualQtyReceived: actualQty,
              dispatchQty: dispatchQty,
              balanceQty: this.calculateBalanceQty(actualQty, dispatchQty),

              // Map other fields with fallbacks
              finance: this.parseFinance(container.finance),
              location: this.parseLocation(container.location),

              // Preserve original API fields for reference
              gateInQty: container.gateInQty,
              inWardStatus: container.inWardStatus,
              inWardHandOver: container.inWardHandOver,
            };
          });

          console.log('Mapped Containers with Bill of Entry Data:', allContainers);

          this.containerDataSource = new MatTableDataSource(allContainers);
          this.dataSource = new MatTableDataSource(allContainers);

          setTimeout(() => {
            if (this.paginator) {
              this.containerDataSource.paginator = this.paginator;
            }
            if (this.sort1) {
              this.containerDataSource.sort = this.sort1;
            }
          }, 100);

          this.loaderService.hidecircle();
        },
        error: (error) => {
          console.error('Warehouse Container API Error:', error);
          this.loaderService.hidecircle();
          this.notification.create('error', 'Failed to load containers',
            error?.message || 'Unknown error occurred');
          this.containerDataSource = new MatTableDataSource([]);
        }
      });
  }

  private parseLocation(location: any): string {
    if (!location) return 'Not Assigned';

    if (typeof location === 'string') {
      return location;
    }

    if (typeof location === 'object') {
      if (location.warehouse) {
        return location.section ?
          `${location.warehouse} - ${location.section}` :
          location.warehouse;
      }
    }

    return 'Not Assigned';
  }

  /**
   * Refresh containers data
   */
  refreshContainers(): void {
    if (this.urlParam?.id) {
      this.getbillentry(); // This will reload both Bill of Entry and containers
    }
  }

  private parseFinance(finance: any): any {
    if (!finance) return { amount: 0, status: 'Pending' };

    if (typeof finance === 'string') {
      const amount = this.parseNumber(finance);
      return { amount, status: amount > 0 ? 'Done' : 'Pending' };
    }

    if (typeof finance === 'object') {
      return {
        amount: this.parseNumber(finance.amount) || 0,
        status: finance.status || 'Pending'
      };
    }

    return { amount: 0, status: 'Pending' };
  }

  private normalizeStatus(status: string | null | undefined): string {
    if (!status) return 'Not Started';

    // Convert to string and trim whitespace
    const statusStr = String(status).trim();

    // Handle case-insensitive comparison
    const normalizedStatus = statusStr.toLowerCase();

    switch (normalizedStatus) {
      case 'done':
      case 'completed':
      case 'complete':
        return 'Done';
      case 'pending':
      case 'in progress':
      case 'inprogress':
        return 'Pending';
      case 'processing':
      case 'started':
        return 'Processing';
      case 'not started':
      case 'notstarted':
      case '':
      case 'null':
        return 'Not Started';
      default:
        return statusStr || 'Not Started';
    }
  }

  private parseNumber(value: any): number {
    if (value === null || value === undefined || value === '') return 0;
    const parsed = typeof value === 'string' ? parseFloat(value) : Number(value);
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Helper method to calculate balance quantity
   */
  private calculateBalanceQty(actualQty: number, dispatchQty: number): number {
    const balance = actualQty - dispatchQty;
    return balance < 0 ? 0 : balance;
  }

  isMBLCreated: boolean = false;

  getblData() {
    this.loaderService.showcircle();
    this.page = 1;

    let payload = this.commonService.filterList();
    payload.query = {
      $or: [
        { batchId: this.batchId },
        { 'consolidatedJobs.batchId': this.batchId },
      ],
    };
    payload.size = Number(this.size);
    payload.from = this.page - 1;
    payload.sort = { desc: ['updatedOn'] };

    this._api.getSTList(Constant.BL_LIST, payload).subscribe(
      (data: any) => {
        this.blData = data.documents;
        this.isMBLCreated = this.blData.some((x: any) => x.blType === 'MBL');
        this.toalLength = data.totalCount;
        this.count = data.documents.length;
        this.dataSource = new MatTableDataSource(
          data?.documents?.map((s: any, index) => ({
            ...s,
            id: index + 1,
          }))
        );
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1;
        this.loaderService.hidecircle();
      },
      () => {
        this.loaderService.hidecircle();
      }
    );
  }

  export() {
    const modifiedTableData = this.containerDataSource?.filteredData;
    const tableColumns = this.displayedColumns;
    const tableData = modifiedTableData || [];
    const columnsToHide = ['action'];
    const actualColumns = this.displayedColumns;
    this.commonFunction.exportToExcel(
      tableColumns,
      tableData,
      columnsToHide,
      'Container List',
      this.displayedColumns,
      actualColumns
    );
  }

  clear() {
    this.blNumber = '';
    this.blDate = '';
    this.blTypeName = '';
    this.shipperName = '';
    this.consigneeName = '';
    this.voyageNumber = '';
    this.polName = '';
    this.status = '';
    this.getblData();
  }

  filter(e) {
    this.size = e.target.value;
    this.fromSize = 1;
    this.getblData();
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
    mustArray['batchId'] = this.batchId;

    if (this.blNumber) {
      mustArray['blNumber'] = {
        $regex: this.blNumber,
        $options: 'i',
      };
    }
    if (this.blDate) {
      mustArray['createdOn'] = {
        $gt: this.blDate.substring(0, 10) + 'T00:00:00.000Z',
        $lt: this.blDate.substring(0, 10) + 'T23:59:00.000Z',
      };
    }
    if (this.blTypeName) {
      mustArray['blTypeName'] = {
        $regex: this.blTypeName,
        $options: 'i',
      };
    }
    if (this.shipperName) {
      mustArray['shipperName'] = {
        $regex: this.shipperName,
        $options: 'i',
      };
    }
    if (this.consigneeName) {
      mustArray['consigneeName'] = {
        $regex: this.consigneeName,
        $options: 'i',
      };
    }
    if (this.voyageNumber) {
      mustArray['voyageId'] = {
        $regex: this.voyageNumber,
        $options: 'i',
      };
    }
    if (this.polName) {
      mustArray['polName'] = {
        $regex: this.polName,
        $options: 'i',
      };
    }
    if (this.status) {
      mustArray['status'] = {
        $regex: this.status,
        $options: 'i',
      };
    }

    let payload = this.commonService.filterList();
    payload.query = mustArray;
    payload.size = Number(this.size);
    payload.from = 0;
    payload.sort = { desc: ['updatedOn'] };

    this._api.getSTList(Constant.BL_LIST, payload).subscribe((data: any) => {
      this.blData = data.documents?.map((s: any, index) => ({
        ...s,
        id: index + 1,
      }));
      this.toalLength = data.totalCount;
      this.count = data.documents.length;
      this.fromSize = 1;
    });
  }

  getPaginationData(type: any) {
    this.fromSize = type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;

    let payload = this.commonService.filterList();
    payload.query = { batchId: this.batchId };
    payload.size = Number(this.size);
    payload.from = this.fromSize - 1;
    payload.sort = { desc: ['updatedOn'] };

    this._api.getSTList(Constant.BL_LIST, payload).subscribe((data: any) => {
      this.blData = data.documents;
      this.toalLength = data.totalCount;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count = type === 'prev'
        ? this.toalLength === this.count
          ? this.count - (this.toalLength % Number(this.size))
          : this.count - data.documents.length
        : this.count + data.documents.length;
    });
  }

  clearGloble() {
    this.globalSearch = '';
    this.clear();
  }

  searchGlobal() {
    let query = this.globalSearch;
    let shouldArray = [];

    shouldArray.push(
      { blDraftStatus: { $regex: query, $options: 'i' } },
      { polName: { $regex: query, $options: 'i' } },
      { voyageId: { $regex: query, $options: 'i' } },
      { consigneeName: { $regex: query, $options: 'i' } },
      { shipperName: { $regex: query, $options: 'i' } },
      { blTypeName: { $regex: query, $options: 'i' } },
      { blDate: { $regex: query, $options: 'i' } },
      { blNumber: { $regex: query, $options: 'i' } }
    );

    var parameter = {
      project: [],
      query: {
        batchId: this.batchId,
        $or: shouldArray,
      },
      sort: { desc: ['createdOn'] },
      size: Number(this.size),
      from: 0,
    };

    this._api.getSTList(Constant.BL_LIST, parameter).subscribe((data: any) => {
      this.blData = data.documents?.map((s: any, index) => ({
        ...s,
        id: index + 1,
      }));
      this.toalLength = data.totalCount;
      this.count = data.documents.length;
    });
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim().toLowerCase();
    this.containerDataSource.filterPredicate = (data: ContainerRecord, filter: string) => {
      const searchStr = [
        data.containerNo,
        data.containerTypeName,
        data._id,
        data.warehousedataentryId,
        data.gateInStatus,
        data.inwardStatus,
        data.gateOutStatus
      ]
        .filter(val => val != null && val !== undefined)
        .map(val => val.toString().toLowerCase())
        .join(' ');

      return searchStr.includes(filter);
    };

    this.containerDataSource.filter = filterValue;

    if (this.containerDataSource.paginator) {
      this.containerDataSource.paginator.firstPage();
    }
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'done':
        return 'badge-success';
      case 'pending':
      case 'processing':
        return 'badge-warning';
      default:
        return 'badge-secondary';
    }
  }

  applyFilterSpecific(filterValue: string) {
    filterValue = filterValue.trim().toLowerCase();

    this.containerDataSource.filterPredicate = (data: ContainerRecord, filter: string) => {
      return (
        (data.containerNo && data.containerNo.toLowerCase().includes(filter)) ||
        (data.containerTypeName && data.containerTypeName.toLowerCase().includes(filter)) ||
        (data._id && data._id.toLowerCase().includes(filter))
      );
    };

    this.containerDataSource.filter = filterValue;

    if (this.containerDataSource.paginator) {
      this.containerDataSource.paginator.firstPage();
    }
  }

  clearFilter() {
    this.containerDataSource.filter = '';
    if (this.containerDataSource.paginator) {
      this.containerDataSource.paginator.firstPage();
    }
  }

  onPrint(element: any) {
    console.log('Printing record:', element);
  }
}