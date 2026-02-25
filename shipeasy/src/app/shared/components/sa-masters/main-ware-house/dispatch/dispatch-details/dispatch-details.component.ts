import {
  Component,
  Input,
  OnChanges,
  OnInit,
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

@Component({
  selector: 'app-dispatch-details',
  templateUrl: './dispatch-details.component.html',
  styleUrls: ['./dispatch-details.component.css'],
})
export class DispatchDetailsComponent implements OnInit {
  _gc = GlobalConstants;
  @Input() batchDetail;
  @Output() getblDataOfBtahcDetails: EventEmitter<any> = new EventEmitter();
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
  dataSource = new MatTableDataSource();
  pagenation = [10, 20, 50, 100];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  displayedColumns = [
    '#',
    'dispatchDate',
    'SuerveyourName',
    'transporterLedger',
    'action',
  ];
  userData: any;
  id: any;
  isShow: boolean = false;
  isTransport: boolean;
  isImport: boolean;
  warehouseType: string = ''; // Add warehouse type property
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private _api: ApiService,
    private modalService: NgbModal,
    private notification: NzNotificationService,
    private cognito: CognitoService,
    // private commonfunction: CommonFunctions,
    private commonService: CommonService,
    // private apiService: ApiSharedService,
    public loaderService: LoaderService,
    private datePipe: DatePipe
  ) {
    this.router = router;
    this.route = route;
    this._api = _api;
    this.notification = notification;
    this.cognito = cognito;
    this.commonService = commonService;
    // this.commonfunction = commonfunction
    this.id = this.route.snapshot.params['moduleId'];
    this.isAddMode = !this.id;
    this.route.params.subscribe((params) => (this.urlParam = params));

    //   if (this.isExport || this.isTransport) {
    //     this.displayedColumns = [
    //       '#',
    //       'blNumber',
    //       'blDate',
    //       'blTypeName',
    //       'shipperName',
    //       'consigneeName',
    //       // 'shippingline',
    //       // 'vesselName',
    //       'voyageId',
    //       // 'polName',
    //       "HBLStatus",
    //       'blDraftStatus',
    //       'action',
    //     ];
    //   } else {
    //     this.displayedColumns = [
    //       '#',
    //       'blNumber',
    //       'blTypeName',
    //       'shipperName',
    //       'consigneeName',
    //       // 'shippingline',
    //       // 'vesselName',
    //       'voyageId',
    //       // 'polName',
    //       "HBLStatus",
    //       'blDraftStatus',
    //       'action',
    //     ];
    //   }
  }

  ngAfterViewInit() { }

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
  addDispatch(): void {
    const { id, key } = this.urlParam;
    const url = `/warehouse/main-ware-house/details/${id}/${key}/add`;
    this.router.navigate([url]);
  }
  onOpenEdit(id: string): void {
    const { id: batchId, key } = this.urlParam;

    const url = `/warehouse/main-ware-house/details/${batchId}/${key}/${id}/edit`;
    this.router.navigate([url]);
  }

  // applyFilter(event: Event) {
  //   const filterValue = (event.target as HTMLInputElement).value;
  //   this.dataSource.filter = filterValue.trim().toLowerCase();

  //   if (this.dataSource.paginator) {
  //     this.dataSource.paginator.firstPage();
  //   }
  // }
  onDeleteDispatch(id: string): void {
    this.commonService.deleteST('warehousedispatch/' + id).subscribe((data) => {
      if (data) {
        this.notification.create('success', 'Deleted Successfully', '');
      }
      setTimeout(() => {
        this.getWarehouseDispatchById(this.urlParam.id);
      }, 1000);
    });
  }
  blMasterStatus: any = [];
  getSystemTypeDropDowns() {
    let payload = this.commonService.filterList();

    if (payload)
      payload.query = {
        status: true,
        typeCategory: {
          $in: ['blStatus'],
        },
      };

    this.commonService
      .getSTList('systemtype', payload)
      ?.subscribe((res: any) => {
        this.blMasterStatus = res?.documents?.filter(
          (x) => x.typeCategory === 'blStatus'
        );
      });
  }
  onBillAction(event) {
    const url = event ?? 'add';
    this.router.navigate([
      '/batch/list/' + url + '/' + this.urlParam.id + '/' + this.urlParam.key,
    ]);
  }
  batchDetails: any;

  ngOnInit(): void {
    // Fetch warehouse type
    this.getWarehouseDataEntry();

    setTimeout(() => {
      this.getWarehouseDispatchById(this.urlParam.id);

    }, 500);


  }

  getWarehouseDataEntry(): void {
    const payload = this.commonService?.filterList();
    if (payload?.query) {
      payload.query = { "warehousedataentryId": this.urlParam.id };
    }

    this.commonService?.getSTList("warehousedataentry", payload)?.subscribe((res: any) => {
      const dataEntry = res?.documents?.[0];

      if (dataEntry) {
        this.warehouseType = dataEntry.type || '';
        console.log('Warehouse Type:', this.warehouseType);
      }
    });
  }

  getWarehouseDispatchById(id: string): void {
    const payload = this.commonService.filterList();
    payload.query = { warehousedataentryId: id };

    this.commonService
      .getSTList('warehousedispatch', payload)
      .subscribe((res) => {
        const documents = res?.documents || [];

        this.dataSource = new MatTableDataSource(
          documents.map((doc, index) => ({
            ...doc,
            id: index + 1,
          }))
        );
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        console.log('Dispatch Data:', this.dataSource.data);
      });
  }

  isMBLCreated: boolean = false;

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
    payload.query = { warehousedataentryId: this.urlParam.id };
    (payload.size = Number(this.size)),
      (payload.from = this.fromSize - 1),
      (payload.sort = { desc: ['updatedOn'] });

    this.commonService
      .getSTList('warehousedispatch', payload)
      .subscribe((data: any) => {
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

  // printData() {
  //   var divToPrint = document.getElementById("tablerecords");

  //   var newWin = window.open("");
  //   newWin.document.write(divToPrint.outerHTML);
  //   newWin.print();
  //   newWin.close();
  // }

  // Documentpdf:any;
  basecontentUrl: any;

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

  printData(element: any) {
    if (!element?.warehousedispatchId) {
      this.notification.error('Error', 'Invalid entry: warehousedispatchId not found');
      return;
    }

    let reportpayload = { "parameters": { "warehousedispatchId": element.warehousedispatchId } };
    this.commonService.pushreports(reportpayload, 'dispatch_non').subscribe({
      next: (res: any) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        let temp = URL.createObjectURL(blob);
        const pdfWindow = window.open(temp);
      },
      error: (error: any) => {
        console.error('Print error:', error);
        this.notification.error('Error', 'Failed to generate print report');
      }
    })
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
