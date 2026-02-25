import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  TemplateRef
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from 'src/app/services/common/common.service';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';

export interface TradeFinanceData {
  id: number;
  tradefinanceId: string;
  companyDetails?: {
    fullCompanyName?: string;
  };
  financeDetails?: {
    sanctionRequirement?: string;
  };
  createdOn?: string;
  createdBy?: string;
  applicationNumber?: string;
  companyName?: string;
  applicantName?: string;
  sanctionRequirement?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-trade-finance-table',
  templateUrl: './trade-finance-table.component.html',
  styleUrls: ['./trade-finance-table.component.scss']
})
export class TradeFinanceTableComponent implements OnInit, AfterViewInit {
  _gc = GlobalConstants;
  
  displayedColumns: string[] = [
    '#',
    'applicationNumber',
    'companyName',
    'applicantName',
    'sanctionRequirement',
    'action'
  ];
  
  dataSource = new MatTableDataSource<TradeFinanceData>([]);
  pagenation = [10, 25, 50, 100];
  currentUrl: string = 'list';
  isShow: boolean = false;
  buttonDisabled: boolean = true;
  selectedId: string | null = null;
  urlParam: any;

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  @ViewChild('content1') deleteModalTemplate!: TemplateRef<any>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private notification: NzNotificationService,
    private commonService: CommonService,
    public loaderService: LoaderService,
    private commonFunction: CommonFunctions
  ) {
    this.route.url.subscribe(() => {
      const urlSegments = this.router.url.split('/');
      const lastSegment = urlSegments[urlSegments.length - 1];
      
      if (['add', 'edit', 'clone', 'show'].includes(lastSegment)) {
        this.currentUrl = lastSegment;
      } else if (lastSegment === 'list' || !lastSegment) {
        this.currentUrl = 'list';
      }
    });
  }

  ngOnInit(): void {
    if (this.currentUrl === 'list') {
      this.loadTradeFinanceData();
    }
  }

  ngAfterViewInit(): void {
    // Set paginator and sort after view initialization
    if (this.paginator && this.sort) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  loadTradeFinanceData(): void {
    this.loaderService.showcircle();
    
    const payload = this.commonService.filterList();
    payload.query = {};
    payload.sort = { desc: ['updatedOn'] };

    this.commonService
      .getSTList('tradefinance', payload)
      .subscribe({
        next: (res: { documents: TradeFinanceData[] }) => {
          const data = res?.documents?.map((doc, index) => ({
            ...doc,
            id: index + 1,
            applicationNumber: doc.tradefinanceId?.substring(0, 8).toUpperCase() || 'N/A',
            companyName: doc.companyDetails?.fullCompanyName || 'N/A',
            applicantName: doc.createdBy || 'N/A',
            sanctionRequirement: doc.financeDetails?.sanctionRequirement || 'N/A'
          })) || [];
          
          this.dataSource.data = data;
          
          // Reassign paginator and sort after data update
          if (this.paginator && this.sort) {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          }
          
          this.loaderService.hidecircle();
        },
        error: (error) => {
          console.error('Error loading data:', error);
          this.notification.create('error', 'Failed to load data', 'Please try again');
          this.loaderService.hidecircle();
        }
      });
  }

  applyFilter(event: any): void {
    const filterValue = event?.target?.value || event;
    const filter = filterValue.trim().toLowerCase();
    
    this.dataSource.filterPredicate = (data: TradeFinanceData, filter: string) => {
      const searchStr = [
        data.applicationNumber,
        data.companyName,
        data.applicantName,
        data.sanctionRequirement,
        data.tradefinanceId
      ]
      .filter(val => val != null && val !== undefined)
      .map(val => val.toString().toLowerCase())
      .join(' ');
      
      return searchStr.includes(filter);
    };
    
    this.dataSource.filter = filter;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  export(): void {
    const modifiedTableData = this.dataSource?.filteredData;
    
    const columnMap: any = {
      '#': 'id',
      'applicationNumber': 'applicationNumber',
      'companyName': 'companyName',
      'applicantName': 'applicantName',
      'sanctionRequirement': 'sanctionRequirement'
    };
    
    const columnsToHide = ['action'];
    
    const exportColumns = this.displayedColumns
      .filter(col => !columnsToHide.includes(col))
      .map(col => columnMap[col] || col);
    
    const exportData = modifiedTableData.map(row => {
      const newRow: any = {};
      exportColumns.forEach(colKey => {
        newRow[colKey] = row[colKey] ?? 'N/A';
      });
      return newRow;
    });
    
    this.commonFunction.exportToExcel(
      exportColumns,
      exportData,
      columnsToHide,
      'Trade Finance Applications',
      exportColumns,
      exportColumns
    );
  }

  onAddApplication(): void {
    this.currentUrl = 'add';
    this.router.navigate(['/customer/trade-finance/list/add']);
  }

  onOpenEditAlternative(element: TradeFinanceData): void {
    this.currentUrl = 'edit';
    this.router.navigate(['/customer/trade-finance/list', element.tradefinanceId]);
  }

  onBillAction(event: any): void {
    if (event === 'close') {
      this.currentUrl = 'list';
      this.router.navigate(['/customer/trade-finance/list']);
      this.loadTradeFinanceData();
    }
  }

  onDeleteApplication(element: TradeFinanceData): void {
    this.selectedId = element.tradefinanceId;
    
    const modalRef = this.modalService.open(this.deleteModalTemplate, {
      centered: true,
      size: 'sm'
    });

    modalRef.result.then(
      (result) => {
        if (result === 'yes') {
          this.confirmDelete();
        }
      },
      () => {
        this.selectedId = null;
      }
    );
  }

  confirmDelete(): void {
    if (this.selectedId) {
      this.commonService
        .deleteST('tradefinance/' + this.selectedId)
        .subscribe({
          next: () => {
            this.notification.create('success', 'Deleted Successfully', '');
            this.loadTradeFinanceData();
            this.selectedId = null;
          },
          error: (err) => {
            console.error('Error deleting:', err);
            this.notification.create('error', 'Failed to delete', 'Please try again');
            this.selectedId = null;
          }
        });
    }
  }
}