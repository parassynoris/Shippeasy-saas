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
// import { CommonFunctions } from '../../functions/common.function';
// import { StoltSplitBlComponent } from './stolt-split-bl/stolt-split-bl.component';
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
// import { ApiSharedService } from '../api-service/api-shared.service';
import { DatePipe } from '@angular/common';
import { resetFakeAsyncZone } from '@angular/core/testing';

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

export interface WarehouseGateOutRecord {
  warehousegateoutentryId: string;
  warehousedispatchId: string;
  dispatchDate: string;
  SuerveyourName: string;
  dispatchPackage: string;
  transporterLedger: string;
  gatePassNumber?: string;
  purchaserName?: string;
  truckNumber?: string;
  containerNumber?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-gate-out',
  templateUrl: './gate-out.component.html',
  styleUrls: ['./gate-out.component.scss']
})

export class GateOutComponent implements OnInit, AfterViewInit {
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
  pagenation = [10, 20, 50, 100];
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns = [
    '#',
    'dispatchDate',
    'SuerveyourName',
    'dispatchPackage',
    'transporterLedger',
    'action',
  ];
  userData: any;
  id: any;
  isShow: boolean = false;
  isTransport: boolean;
  isImport: boolean;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private _api: ApiService,
    private modalService: NgbModal,
    private notification: NzNotificationService,
    private cognito: CognitoService,
    private commonService: CommonService,
    public loaderService: LoaderService,
    private datePipe: DatePipe
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
      this.getWarehouseDispatchById(this.urlParam.id);
    }, 500);
  }

  ngAfterViewInit(): void {
    // Set paginator and sort after view initialization
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort1;
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
    let data = this.dataSource.data;
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

  onAddGateOut(): void {
    const { id, key } = this.urlParam;
    const url = `/warehouse/main-ware-house/details/${id}/${key}/add`;
    this.router.navigate([url]);
  }

  onOpenEdit(warehousedispatchId: string): void {
    const { id: batchId, key } = this.urlParam;

    // Find the record with proper typing
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

  // Alternative method if you want to pass the warehousegateoutentryId
  onOpenEditAlternative(element: WarehouseGateOutRecord,mode?: 'clone' | 'edit'): void {
    const { id: batchId, key } = this.urlParam;
    if (mode === 'clone') {
      const url = `/warehouse/main-ware-house/details/${batchId}/${key}/${element.warehousegateoutentryId}/clone`;
      this.router.navigate([url]);
    } else {    
    const url = `/warehouse/main-ware-house/details/${batchId}/${key}/${element.warehousegateoutentryId}/edit`;
    this.router.navigate([url]);
    }
  }  
  // onOpenEditAlternative(element: WarehouseGateOutRecord, mode?: 'clone' | 'edit'): void {
  //     const { id: batchId, key } = this.urlParam;
    
  //     if (mode === 'clone') {
  //       const url = `/warehouse/main-ware-house/details/${batchId}/${key}/${element.warehousegateinentryId}/clone`;
  //       this.router.navigate([url]);
  //     } else {
  //       const url = `/warehouse/main-ware-house/details/${batchId}/${key}/${element.warehousegateinentryId}/edit`;
  //       this.router.navigate([url]);
  //     }
  //   }

  onDeleteDispatch(id: string): void {
    this.commonService
      .deleteST('warehousegateoutentry/' + id)
      .subscribe((data) => {
        if (data) {
          this.notification.create(
            'success',
            'Deleted Successfully',
            ''
          );
        }
        setTimeout(() => {
          this.getWarehouseDispatchById(this.urlParam.id);
        }, 1000);
      });
  }

  basecontentUrl: string;
  Documentpdf: any


  printData(element) {
    let reportpayload = { "parameters": { "warehousegateoutentryId": element.warehousegateoutentryId } };
    this.commonService.pushreports(reportpayload, 'gateOut').subscribe({
      next: (res: any) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        let temp = URL.createObjectURL(blob);
        this.Documentpdf = temp;
        const pdfWindow = window.open(temp);
        // pdfWindow.print();
      }
    })
  }


  blMasterStatus: any = [];

  onBillAction(event) {
    const url = event ?? 'add';
    this.router.navigate([
      '/batch/list/' + url + '/' + this.urlParam.id + '/' + this.urlParam.key,
    ]);
  }

  batchDetails: any;

  getWarehouseDispatchById(id: string): void {
    const payload = this.commonService.filterList();
    payload.query = { warehousedataentryId: id };

    this.commonService
      .getSTList('warehousegateoutentry', payload)
      .subscribe((res: { documents: WarehouseGateOutRecord[] }) => {
        const data = res?.documents?.map((doc, index) => ({
          ...doc,
          id: index + 1,
        })) || [];
        
        this.dataSource = new MatTableDataSource(data);
        
        // Important: Set paginator and sort after data is loaded
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort1;
        });
      });
  }

  isMBLCreated: boolean = false;

  getblData() {
    this.loaderService.showcircle();
    this.page = 1;

    let payload = this.commonService.filterList();
    payload.query = {
      // 'batchId': this.batchId,
      $or: [
        {
          batchId: this.batchId,
        },
        {
          'consolidatedJobs.batchId': this.batchId,
        },
      ],
    };
    (payload.size = Number(this.size)),
      (payload.from = this.page - 1),
      (payload.sort = { desc: ['updatedOn'] });
    this._api.getSTList(Constant.BL_LIST, payload).subscribe(
      (data: any) => {
        this.blData = data.documents;
        this.isMBLCreated = this.blData.some((x: any) => x.blType === 'MBL');
        this.toalLength = data.totalCount;
        this.count = data.documents.length;
        this.dataSource = new MatTableDataSource(
          data?.documents?.map((s: any, index) => {
            return {
              ...s,
              id: index + 1,
            };
          })
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
    (payload.size = Number(this.size)),
      (payload.from = 0),
      (payload.sort = { desc: ['updatedOn'] });

    this._api.getSTList(Constant.BL_LIST, payload).subscribe((data: any) => {
      this.blData = data.documents?.map((s: any, index) => {
        return {
          ...s,
          id: index + 1,
        };
      });
      this.toalLength = data.totalCount;
      this.count = data.documents.length;
      this.fromSize = 1;
    });
  }

  getPaginationData(type: any) {
    this.fromSize =
      type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;

    let payload = this.commonService.filterList();
    payload.query = {
      batchId: this.batchId,
    };
    (payload.size = Number(this.size)),
      (payload.from = this.fromSize - 1),
      (payload.sort = { desc: ['updatedOn'] });
    this._api.getSTList(Constant.BL_LIST, payload).subscribe((data: any) => {
      this.blData = data.documents;
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
      sort: {
        desc: ['createdOn'],
      },
      size: Number(this.size),
      from: 0,
    };

    this._api.getSTList(Constant.BL_LIST, parameter).subscribe((data: any) => {
      this.blData = data.documents?.map((s: any, index) => {
        return {
          ...s,
          id: index + 1,
        };
      });
      this.toalLength = data.totalCount;
      this.count = data.documents.length;
    });
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim().toLowerCase();
    this.dataSource.filterPredicate = (data: WarehouseGateOutRecord, filter: string) => {
      const searchStr = [
        data.gatePassNumber,
        data.purchaserName,
        data.truckNumber,
        data.containerNumber,
        data.dispatchDate,
        data.SuerveyourName,
        data.dispatchPackage,
        data.transporterLedger,
        data.warehousedispatchId,
        data.warehousegateoutentryId
      ]
      .filter(val => val != null && val !== undefined) // Remove null/undefined values
      .map(val => val.toString().toLowerCase()) // Convert to lowercase string
      .join(' '); // Join all values with space
      
      return searchStr.includes(filter);
    };
    
    this.dataSource.filter = filterValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  applyFilterSpecific(filterValue: string) {
    filterValue = filterValue.trim().toLowerCase();
    
    this.dataSource.filterPredicate = (data: WarehouseGateOutRecord, filter: string) => {
      return (
        (data.gatePassNumber && data.gatePassNumber.toLowerCase().includes(filter)) ||
        (data.purchaserName && data.purchaserName.toLowerCase().includes(filter)) ||
        (data.truckNumber && data.truckNumber.toLowerCase().includes(filter)) ||
        (data.containerNumber && data.containerNumber.toLowerCase().includes(filter)) ||
        (data.dispatchDate && data.dispatchDate.toLowerCase().includes(filter))
      );
    };
    
    this.dataSource.filter = filterValue;
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  clearFilter() {
    this.dataSource.filter = '';
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onPrint(element: any) {
    console.log('Printing record:', element);

  }
}