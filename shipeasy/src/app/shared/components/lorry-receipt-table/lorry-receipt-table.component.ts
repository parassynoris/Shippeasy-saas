import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { CommonService } from 'src/app/services/common/common.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-lorry-receipt-table',
  templateUrl: './lorry-receipt-table.component.html',
  styleUrls: ['./lorry-receipt-table.component.scss']
})
export class LorryReceiptTableComponent implements OnInit {
  showBookingDropdown: boolean = true;
  selectedBookingType: string = '';

  // Table properties
  displayedColumns: string[] = [
    '#',
    'lrNumber',
    'lrDate',
    'consignorName',
    'consigneeName',
    'vehicleNumber',
    'origin',
    'destination',
    'status',
    'actions'
  ];
  
  displayedColumns1: string[] = [
    '#',
    'LR Number',
    'LR Date',
    'Consignor',
    'Consignee',
    'Vehicle No',
    'Origin',
    'Destination',
    'Status',
    'Actions'
  ];

  dataSource: MatTableDataSource<any> = new MatTableDataSource([]);
  pagenation: number[] = [10, 25, 50, 100];
  lorryReceiptList: any[] = [];
  selectedLorryReceipt: any = null;
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('deletedata') deleteModal!: TemplateRef<any>;

  loaderService: any = { isLoadingcircle: false };
  _gc: any = { LOADER_TEXT: 'Loading...' };
  
  private modalRef?: NgbModalRef;

  constructor(
    private router: Router,
    private notification: NzNotificationService,
    private commonService: CommonService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.fetchLorryReceipts();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  fetchLorryReceipts(): void {
    this.loaderService.isLoadingcircle = true;
    
    const payload = {
      sort: {
        desc: ['updatedOn']
      }
    };

    this.commonService.getSTList('lorryreceipt', payload)?.subscribe({
      next: (res: any) => {
        this.loaderService.isLoadingcircle = false;
        
        if (res?.documents && res.documents.length > 0) {
          this.lorryReceiptList = res.documents.map((item: any) => ({
            ...item,
            consignorName: this.getConsignorName(item),
            consigneeName: this.getConsigneeName(item),
            statusDisplay: this.getStatusDisplay(item.currentStatus || item.status)
          }));
          
          this.dataSource = new MatTableDataSource(this.lorryReceiptList);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        } else {
          this.lorryReceiptList = [];
          this.dataSource = new MatTableDataSource(this.lorryReceiptList);
        }
      },
      error: (error: any) => {
        this.loaderService.isLoadingcircle = false;
        console.error('Fetch error:', error);
        this.lorryReceiptList = [];
        this.dataSource = new MatTableDataSource(this.lorryReceiptList);
      }
    });
  }

  getConsignorName(item: any): string {
    // If consignor is stored as name directly
    if (typeof item.consignor === 'string' && !item.consignor.includes('-')) {
      return item.consignor;
    }
    // Extract from address or return ID
    return item.consignorAddress?.split(',')[0] || item.consignor || 'N/A';
  }

  getConsigneeName(item: any): string {
    // If consignee is stored as name directly
    if (typeof item.cosignee === 'string' && !item.cosignee.includes('-')) {
      return item.cosignee;
    }
    // Extract from address or return ID
    return item.consigneeAddress?.split(',')[0] || item.cosignee || 'N/A';
  }

  Documentpdf:any
  printData(row) {
    let reportpayload = { "parameters": { "lorryreceiptId": row.lorryreceiptId } };
    this.commonService.pushreports(reportpayload, 'lorryReceipt').subscribe({
      next: (res: any) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        let temp = URL.createObjectURL(blob);
        this.Documentpdf = temp;
        const pdfWindow = window.open(temp);
        // pdfWindow.print();
      }
    })
  }

  getStatusDisplay(status: string): string {
    const statusMap: { [key: string]: string } = {
      'created': 'Created',
      'atWarehouse': 'At Warehouse',
      'inTransit': 'In Transit',
      'delivered': 'Delivered',
      'pending': 'Pending',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
  }

  applyFilter(event: any): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  exportAsExcelFile(): void {
    console.log('Exporting data as Excel file');
    // Implement Excel export logic here
    this.notification.info('Export', 'Excel export functionality to be implemented');
  }

  onBookingTypeChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const bookingType = selectElement.value;
    
    if (!bookingType) {
      return;
    }

    switch(bookingType) {
      case 'lrBooking':
        this.openLRBooking();
        break;
      case 'freshBooking':
        this.openFreshBooking();
        break;
    }

    setTimeout(() => {
      this.selectedBookingType = '';
    }, 100);
  }

  openLRBooking(): void {
    this.router.navigate(['/lr/lrbooking/add']);
  }
  
  openFreshBooking(): void {
    this.router.navigate(['/lr/freshbooking/add']);
  }

  onEdit(row: any): void {
    console.log('Editing lorry receipt:', row);
    
    if (row.bookingType === 'lrBooking') {
      this.router.navigate(['/lr/lrbooking', row.lorryreceiptId]);
    } else if (row.bookingType === 'freshBooking') {
      this.router.navigate(['/lr/freshbooking', row.lorryreceiptId]);
    } else {
      this.router.navigate(['/lr/booking/edit', row.lorryreceiptId]);
    }
  }

  onView(row: any): void {
    console.log('Viewing lorry receipt:', row);
    // Navigate to view page or open view modal
    this.router.navigate(['/lr/booking/view', row.lorryreceiptId]);
  }

  onDelete(row: any): void {
    this.selectedLorryReceipt = row;
    this.modalRef = this.modalService.open(this.deleteModal, {
      centered: true,
      backdrop: 'static'
    });

    this.modalRef.result.then(
      (result) => {
        if (result === 'yes') {
          this.confirmDelete();
        }
      },
      (reason) => {
        console.log('Modal dismissed:', reason);
        this.selectedLorryReceipt = null;
      }
    );
  }

  confirmDelete(): void {
    if (!this.selectedLorryReceipt) {
      return;
    }

    const lorryReceiptId = this.selectedLorryReceipt.lorryreceiptId;

    const deleteBody = `lorryreceipt/${this.selectedLorryReceipt.lorryreceiptId}`;
    
    this.commonService.deleteST(deleteBody)?.subscribe({
      next: (res: any) => {
      
        
        // Remove from local array
        this.lorryReceiptList = this.lorryReceiptList.filter(
          item => item.lorryreceiptId !== lorryReceiptId
        );
        
        // Update data source
        this.dataSource.data = this.lorryReceiptList;
        
        this.selectedLorryReceipt = null;
      },
      error: (error: any) => {
        console.error('Delete error:', error);
        this.notification.error(
          'Error', 
          'Failed to delete lorry receipt. Please try again.'
        );
        this.selectedLorryReceipt = null;
      }
    });
  }

  onPrint(row: any): void {
    console.log('Printing lorry receipt:', row);
    // Navigate to print page or trigger print dialog
    this.router.navigate(['/lr/booking/print', row.lorryreceiptId]);
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'created': 'badge bg-info',
      'atWarehouse': 'badge bg-warning',
      'inTransit': 'badge bg-primary',
      'delivered': 'badge bg-success',
      'pending': 'badge bg-secondary',
      'cancelled': 'badge bg-danger'
    };
    return statusClasses[status] || 'badge bg-secondary';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  }

  formatDate(date: string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN');
  }
}