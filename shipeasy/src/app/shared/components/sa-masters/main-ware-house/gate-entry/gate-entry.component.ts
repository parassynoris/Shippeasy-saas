import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from 'src/app/services/common/common.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

export interface WarehouseGateInRecord {
  _id: string;
  gatePassNumber: string;
  jobNumber: string;
  purchaser: string;
  truckNumber: string;
  containerNumber: string;
  grossWeight: string;
  tareWeight: string;
  netWeight: string;
  doNumber: string;
  entryDateTime: string;
  warehousedataentryId: string;
  warehousegateinentryId: string;
  [key: string]: any;
}

@Component({
  selector: 'app-gate-entry',
  templateUrl: './gate-entry.component.html',
  styleUrls: ['./gate-entry.component.scss']
})
export class GateEntryComponent implements OnInit {
  gateInEntries: any[] = [];
  id: any;
  urlParam: any;
  editIndex: number = -1;
  dataSource = new MatTableDataSource<WarehouseGateInRecord>();
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  buttonDisabled: boolean = true;
  currentUrl: any;
  isShow: boolean = false;
  pagenation = [10, 20, 50, 100];
  
  // Updated column definitions to match API data
  displayedColumns = [
    'serialNo',
    'gatePassNumber',
    'jobNumber',
    'purchaser',
    'truckNumber',
    'containerNumber',
    'grossWeight',
    'tareWeight',
    'netWeight',
    'doNumber',
    'entryDateTime',
    'action',
  ];

  constructor(
    private commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private notification: NzNotificationService
  ) {
    this.isShow = this.urlParam?.access == 'show' ? true : false;
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.urlParam = params;
      this.id = params['id'];
      this.fetchGateInEntries();
    });
  }

  onOpenNew() {
    console.log('Navigating to add new entry with id:', this.id, 'and key:', this.urlParam.key);
    this.router.navigate([
      `/warehouse/main-ware-house/details/${this.id}/${this.urlParam.key}/adds`
    ]);
  }

  onAddGateOut(): void {
    const { id, key } = this.urlParam;
    const url = `/warehouse/main-ware-house/details/${id}/${key}/adds`;
    this.router.navigate([url]);
  }

  onDeleteDispatch(id: string): void {
    this.commonService
      .deleteST('warehousegateinentry/' + id)
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

  // Fixed method to properly map API response to table data
  getWarehouseDispatchById(id: string): void {
    const payload = {
      query: {
        warehousedataentryId: this.id
      }
    };

    this.commonService
      .getSTList('warehousegateinentry', payload)
      .subscribe((res: { documents: WarehouseGateInRecord[] }) => {
        console.log('API Response:', res); // Debug log
        
        if (res?.documents && Array.isArray(res.documents)) {
          const data = res.documents.map((doc, index) => ({
            ...doc,
            serialNo: index + 1, // Add serial number
            id: index + 1,
          }));

          this.dataSource = new MatTableDataSource(data);
          this.gateInEntries = data; // Update gateInEntries as well

          // Set paginator and sort after data is loaded
          setTimeout(() => {
            if (this.paginator) {
              this.dataSource.paginator = this.paginator;
            }
            if (this.sort1) {
              this.dataSource.sort = this.sort1;
            }
          });
        } else {
          console.warn('No documents found in response');
          this.dataSource = new MatTableDataSource([]);
          this.gateInEntries = [];
        }
      }, error => {
        console.error('API Error:', error);
        this.notification.error('Error', 'Failed to load data');
        this.dataSource = new MatTableDataSource([]);
        this.gateInEntries = [];
      });
  }

  editEntry(entry: any, index: number) {
    this.editIndex = index;

    if (!entry) {
      this.notification.error('Error', 'Invalid entry data');
      return;
    }

    const entryId = entry._id;

    if (!entryId) {
      this.notification.error('Error', 'Entry ID not found');
      return;
    }

    this.router.navigate([
      `/warehouse/main-ware-house/details/${this.id}/${this.urlParam.key}/${entryId}/edits`
    ]);
  }

  onOpenEditAlternative(element: WarehouseGateInRecord): void {
    const { id: batchId, key } = this.urlParam;
    const url = `/warehouse/main-ware-house/details/${batchId}/${key}/${element.warehousegateinentryId}/edits`;
    this.router.navigate([url]);
  }

  deleteEntry(content1: any, entry: any) {
    if (!entry?._id) {
      this.notification.error('Error', 'Invalid entry data');
      return;
    }

    this.modalService.open(content1, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
      ariaLabelledBy: 'modal-basic-title'
    }).result.then((result) => {
      if (result === 'yes') {
        const documentId = entry._id;
        const deleteBody = `warehousegateinentry/${documentId}`;

        this.commonService.deleteST(deleteBody)?.subscribe({
          next: (data: any) => {
            this.notification.create('success', 'Deleted Successfully', '');
            setTimeout(() => {
              this.fetchGateInEntries();
            }, 1000);
          },
          error: (error: any) => {
            console.error('Delete error:', error);
            this.notification.error('Error', 'Failed to delete entry');
          }
        });
      }
    }).catch((error) => {
      console.log('Modal dismissed');
    });
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim().toLowerCase();
    this.dataSource.filterPredicate = (data: WarehouseGateInRecord, filter: string) => {
      const searchStr = [
        data.gatePassNumber,
        data.jobNumber,
        data.purchaser,
        data.truckNumber,
        data.containerNumber,
        data.grossWeight,
        data.tareWeight,
        data.netWeight,
        data.doNumber,
        data.entryDateTime
      ]
        .filter(val => val != null && val !== undefined)
        .map(val => val.toString().toLowerCase())
        .join(' ');

      return searchStr.includes(filter);
    };

    this.dataSource.filter = filterValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  fetchGateInEntries() {
    this.getWarehouseDispatchById(this.id);
  }

  onPrint(element: any) {
    // Implement print functionality
    console.log('Print element:', element);
  }

  onBillAction(event: any) {
    // Handle bill action
    console.log('Bill action:', event);
  }

  getJobNumberByValue(val: string): string {
    return val || '-';
  }

  getContainerNumberByValue(val: string): string {
    return val || '-';
  }

  refreshData() {
    this.fetchGateInEntries();
  }
}