import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from 'src/app/services/common/common.service';
import { WarehouseGateOutRecord } from '../../gate-out/gate-out.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { CommonFunctions } from 'src/app/shared/functions/common.function';

@Component({
  selector: 'app-inwards-listing',
  templateUrl: './inwards-listing.component.html',
  styleUrls: ['./inwards-listing.component.scss']
})
export class InwardsListingComponent implements OnInit {
  gateInEntries: any[] = [];
  id: any;
  urlParam: any;
  editIndex: number = -1;
  dataEntryList: any; // Add this to store warehouse data entry
  warehouseType: string = ''; // Add this to store warehouse type

  @ViewChild(MatDrawer) drawer: MatDrawer | any;
  dataSource = new MatTableDataSource<WarehouseGateOutRecord>();
  pagenation = [10, 20, 50, 100];
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Default columns for Bonded warehouse
  bondedColumns = ['sno', 'gatePassNo', 'receiptDateTime', 'vehicleNo', 'bofeContainerNo', 'actions'];

  // Columns for Non Bonded warehouse
  nonBondedColumns = ['sno', 'vehicleNo', 'vesselName', 'transportName', 'inDate', 'actions'];

  displayedColumns: string[] = this.bondedColumns;

  constructor(
    private commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private notification: NzNotificationService,
    private commonfunction: CommonFunctions
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.urlParam = params;
      this.id = params['id'];

      this.getWarehouseDataEntry();
    });
  }

  getWarehouseDataEntry(): void {
    const payload = this.commonService?.filterList();
    if (payload) {
      payload.query = { "warehousedataentryId": this.id };
      payload.size = 10000; // Fetch all records
    }

    this.commonService?.getSTList("warehousedataentry", payload)?.subscribe((res: any) => {
      this.dataEntryList = res?.documents[0];

      if (this.dataEntryList) {
        this.warehouseType = this.dataEntryList.type || '';

        if (this.warehouseType === 'Non Bonded') {
          this.displayedColumns = this.nonBondedColumns;
        } else {
          this.displayedColumns = this.bondedColumns;
        }

        this.fetchGateInEntries();
      }
    });
  }

  onOpenNew() {
    this.router.navigate([
      `/warehouse/main-ware-house/details/${this.id}/${this.urlParam.key}/add`
    ]);
  }

  editEntry(entry: any, action: 'edit' | 'clone' | number) {
    this.editIndex = typeof action === 'number' ? action : null;

    if (!entry) {
      this.notification.error('Error', 'Invalid entry data');
      return;
    }
    const entryId = entry.warehouseinwardId;

    if (!entryId) {
      this.notification.error('Error', 'Entry ID not found');
      return;
    }

    if (action === 'clone') {
      // Navigate in clone mode
      this.router.navigate([
        `/warehouse/main-ware-house/details/${this.id}/${this.urlParam.key}/${entryId}/clone`
      ]);
    } else {
      // Navigate in edit mode
      this.router.navigate([
        `/warehouse/main-ware-house/details/${this.id}/${this.urlParam.key}/${entryId}/edit`
      ]);
    }
  }

  deleteEntry(content1: any, entry: any) {
    this.modalService.open(content1, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
      ariaLabelledBy: 'modal-basic-title'
    }).result.then((result) => {
      if (result === 'yes') {
        const documentId = entry.warehouseinwardId;

        if (!documentId) {
          this.notification.error('Error', 'Entry ID not found');
          return;
        }

        const deleteBody = `warehouseinward/${documentId}`;

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

  onDelete(entry: any, deleteModal: any): void {
    if (!entry) {
      console.error('Entry is undefined');
      this.notification.create('error', 'Cannot delete: Invalid entry', '');
      return;
    }

    if (!entry.warehouseinwardId) {
      console.error('Entry missing warehouseinwardId:', entry);
      this.notification.create('error', 'Cannot delete: Missing ID', '');
      return;
    }

    this.deleteEntry(deleteModal, entry);
  }

  fetchGateInEntries() {
    const payload = {
      "sort": {
        "desc": ["updatedOn"]
      },
      query: {
        warehousedataentryId: this.id
      },
      size: 10000, // Fetch all records for client-side pagination
      from: 0
    };

    this.commonService.getSTList('warehouseinward', payload)?.subscribe({
      next: (res: any) => {
        if (res?.documents && res.documents.length > 0) {
          this.gateInEntries = res.documents;
          this.dataSource = new MatTableDataSource(this.gateInEntries);
          this.dataSource.sort = this.sort1;
          this.dataSource.paginator = this.paginator;
        } else {
          this.gateInEntries = [];
          this.dataSource = new MatTableDataSource(this.gateInEntries);
        }
        this.editIndex = -1;
      },
      error: (error: any) => {
        console.error('Fetch error:', error);
        this.notification.error('Error', 'Failed to load entries');
        this.gateInEntries = [];
        this.dataSource = new MatTableDataSource(this.gateInEntries);
      }
    });
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

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  export() {
    const modifiedTableData = this.dataSource?.filteredData;
    const tableColumns = this.displayedColumns;
    const tableData = modifiedTableData || [];
    const columnsToHide = ['actions'];
    const actualColumns = this.displayedColumns;
    this.commonfunction.exportToExcel(
      tableColumns,
      tableData,
      columnsToHide,
      'Inwards',
      this.displayedColumns,
      actualColumns
    );
  }

  printData(entry: any) {
    if (!entry?.warehouseinwardId) {
      this.notification.error('Error', 'Invalid entry: warehouseinwardId not found');
      return;
    }

    let reportpayload = { "parameters": { "warehouseinwardId": entry.warehouseinwardId } };
    this.commonService.pushreports(reportpayload, 'inward_slip').subscribe({
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

  clearFilter() {
    this.dataSource.filter = '';
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}