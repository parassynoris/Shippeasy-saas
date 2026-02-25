import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from 'src/app/services/common/common.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';

@Component({
  selector: 'app-main-ware-house',
  templateUrl: './main-ware-house.component.html',
  styleUrls: ['./main-ware-house.component.scss'],
})
export class MainWareHouseComponent implements OnInit {
  toggleFilters = true;
  closeResult: string;
  filterKeys = {};
  partyid: string;
  size = 1000;
  pagenation = [20, 50, 100];
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataEntryList: any = [];
  partymasterList: any = [];
  WareHouseImporterList: any = [];
  WareHouseCHAList: any = [];
  dataSource = new MatTableDataSource<any>([]);
  statuses = ['Active', 'Inactive', 'Planning', "Cancle"];
  isTransport: boolean = false;
  isExport: boolean = false;
  isImport: boolean = false;
  closedJobs: boolean = false;
  cancelledJob: boolean = false;
  displayedColumns = [
    '#',
    // 'srNo',
    'type',
    'jobNo',
    'partyName',
    'CHA',
    // 'spaceCertificationNo',
    'spaceCertificationDate',
    'billofEntry',
    'inDate',
    'inDutyAmt',
    'outDate',
    'dutyAmount',
    'balance',
    // 'fullOutDuty',
    'containerNo',
    'iNPKGS',
    'outPKGS',
    'inWarehouse',
    'size',
    'containerCount',
    'warehouseNo',
    'status',
    'action',
  ];
  filtersModel = [];
  // dataSource=new MatTableDataSource();
  displayedColumns1 = this.displayedColumns.map((x, i) => x + '_' + i);

  constructor(
    private router: Router,
    private commonService: CommonService,
    private modalService: NgbModal,
    private notification: NzNotificationService,
    public datePipe: DatePipe,
    public commonfunction: CommonFunctions
  ) {
    this.isExport = localStorage.getItem('isExport') === 'true' ? true : false
    this.isTransport = localStorage.getItem('isTransport') === 'true' ? true : false;
    this.isImport = localStorage.getItem('isImport') === 'true' ? true : false;
  }

  ngOnInit(): void {
    this.getPartyMasterDropDowns();
    this.getWarehouseDataEntry();
    console.log('displayedColumns1' + this.displayedColumns1);
  }
  addDataEntry() {
    this.router.navigate(['/warehouse/main-ware-house/ware/add']);
  }

  getPartyMasterDropDowns() {
    this.partymasterList = [];
    this.WareHouseImporterList = [];
    this.WareHouseCHAList = [];
    let payload = this.commonService.filterList();
    if (payload)
      payload.query = {
        status: true,
      };
    this.commonService
      .getSTList('partymaster', payload)
      ?.subscribe((res: any) => {
        this.partymasterList = res?.documents;
        res?.documents?.filter((x) => {
          if (x.customerType) {
            x.customerType.map((res: any) => {
              if (res?.item_text === 'WareHouseImporter') {
                this.WareHouseImporterList.push(x);
              } else if (res?.item_text === 'WareHouseCHA') {
                this.WareHouseCHAList.push(x);
              }
            });
          }
        });
      });
  }
  EditDataEntry(element) {
    this.router.navigate([
      '/warehouse/main-ware-house/ware',
      element.warehousedataentryId,
      'edit',
    ]);
  }
  applyFilter(filterValue: any) {
    // Handle different input types
    let searchValue: string;

    if (typeof filterValue === 'string') {
      searchValue = filterValue;
    } else if (filterValue && filterValue.target) {
      // It's an Event object
      searchValue = (filterValue.target as HTMLInputElement).value;
    } else {
      searchValue = filterValue?.toString() || '';
    }

    if (!searchValue || searchValue.trim() === '') {
      this.getWarehouseDataEntry();
      return;
    }

    const searchTerm = searchValue.trim().toLowerCase();

    // Filter the data locally based on actual field names from your HTML
    const filteredData = this.dataEntryList.filter((item: any) => {
      // Get container numbers as a string
      const containerNumbers = item?.containers?.map(c => c.containerNo).join(', ').toLowerCase() || '';

      return (
        item.jobNo?.toLowerCase().includes(searchTerm) ||
        item.importerLedgerName?.toLowerCase().includes(searchTerm) ||
        item.invoiceLedgerName?.toLowerCase().includes(searchTerm) ||
        item.chaLedgerName?.toLowerCase().includes(searchTerm) ||
        item.blofEN?.toLowerCase().includes(searchTerm) ||
        item.warehouseNumber?.toLowerCase().includes(searchTerm) ||
        item.status?.toLowerCase().includes(searchTerm) ||
        item.type?.toLowerCase().includes(searchTerm) ||
        item.spaceRequired?.toString().toLowerCase().includes(searchTerm) ||
        containerNumbers.includes(searchTerm) ||
        item.customDuty?.toString().toLowerCase().includes(searchTerm) ||
        item.totalDutyAmount?.toString().toLowerCase().includes(searchTerm)
      );
    });

    this.dataSource.data = filteredData;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort1;
  }
  clearFilters() {
    this.filtersModel = [];
    this.filterKeys = {};

    this.selectedShipmentTypes = [];
    const bondedCheckbox = document.getElementById('Bonded') as HTMLInputElement;
    const nonBondedCheckbox = document.getElementById('NonBonded') as HTMLInputElement;

    if (bondedCheckbox) bondedCheckbox.checked = false;
    if (nonBondedCheckbox) nonBondedCheckbox.checked = false;

    this.getWarehouseDataEntry();
  }
  dataEntryDetails(element) {
    this.router.navigate([
      '/warehouse/main-ware-house/details/',
      element?.warehousedataentryId,
      'space-certificate',
    ]);
  }
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
      'Job No.',
      'Party Name',
      'CHA',
      'Space Certi. No',
      'Space Certi. Date',
      'Bill of Entry',
      'In Date',
      'In Duty Amt',
      'Out Date',
      'Out Duty Amt',
      'Balance',
      'Full Out Duty',
      'Container No',
      'IN PKGS',
      'Out PKGS',
      'In Warehouse',
      'Size',
      'Container Count',
      'Warehouse No.',
      'Status'

    ];

    const actualColumns = [
      'jobNo',
      'partyName',
      'CHA',
      // 'spaceCertificationNo',
      'spaceCertificationDate',
      'billofEntry',
      'inDate',
      'inDutyAmt',
      'outDate',
      'outDutyAmt',
      'balance',
      // 'fullOutDuty',
      'containerNo',
      'iNPKGS',
      'outPKGS',
      'inWarehouse',
      'size',
      'containerCount',
      'warehouseName',
      'status'
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

  selectedShipmentTypes: string[] = [];

  onCheckboxChange(event: any, shipmentType: string) {
    if (event.target.checked) {
      const otherType = shipmentType === 'Bonded' ? 'NonBonded' : 'Bonded';
      (document.getElementById(otherType) as HTMLInputElement).checked = false;
      this.selectedShipmentTypes = [shipmentType];
    } else {
      this.selectedShipmentTypes = this.selectedShipmentTypes.filter(type => type !== shipmentType);
    }
    this.searchColumns();
  }

  exportList(isList) {
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
      'Job No.',
      'Party Name',
      'CHA',
      'Space Certi. No',
      'Space Certi. Date',
      'Bill of Entry',
      'In Date',
      'In Duty Amt',
      'Out Date',
      'Out Duty Amt',
      'Balance',
      'Full Out Duty',
      'Container No',
      'IN PKGS',
      'Out PKGS',
      'In Warehouse',
      'Size',
      'Container Count',
      'Warehouse No.',
      'Status'

    ];

    const actualColumns = [
      'jobNo',
      'partyName',
      'CHA',
      'spaceCertificationNo',
      'spaceCertificationDate',
      'billofEntry',
      'inDate',
      'inDutyAmt',
      'outDate',
      'outDutyAmt',
      'balance',
      // 'fullOutDuty',
      'containerNo',
      'iNPKGS',
      'outPKGS',
      'inWarehouse',
      'size',
      'containerCount',
      'warehouseName',
      'status'
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
  getWarehouseDataEntry() {
    let payload = this.commonService?.filterList();
    this.commonService
      ?.getSTList('warehousedataentry', payload)
      ?.subscribe((res: any) => {
        console.log('res?.documents', res?.documents);
        this.dataEntryList = res?.documents || [];
        this.dataSource.data = this.dataEntryList;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1;
      });
  }
  getContainerSizes(element: any): string {
    return element?.containers?.map((c) => c.size).join(', ') || '';
  }

  getContainerNumbers(element: any): string {
    return element?.containers?.map(c => c.containerNo).join(', ') || '';
  }
  getContainerTooltip(element: any): string {
    if (!element?.containers || element.containers.length === 0) {
      return 'No containers';
    }
    return element.containers
      .map((c: any) => `${c.containerNo} => ${c.cargoStatus}`)
      .join(', ');
  }

  //   getPartyMasterDropDowns() {
  //     let warehouseCHA:any = '';
  //     let warehouseImporter:any = '';
  //     let payload = this.commonService.filterList()
  //   if (payload) payload.query = {
  //     "status": true
  //   }
  //   this.commonService.getSTList("partymaster", payload)?.subscribe((res: any) => {
  //     console.log("partymaster",res?.documents);
  //     this.partymasterList = res?.documents;
  //     res?.documents?.filter((x) => {
  //       if (x.customerType) {
  //         x.customerType.map((res: any) => {
  //           if (res?.item_text === 'WareHouseImporter') { this.WareHouseImporterList.push(x) }
  //           else if (res?.item_text === 'WareHouseCHA') { this.WareHouseCHAList.push(x) }
  //         })
  //       }

  //     });
  //   });
  // }
  onDelete(deletedata, customs) {
    this.modalService
      .open(deletedata, {
        backdrop: 'static',
        keyboard: false,
        centered: true,
        size: '',

        ariaLabelledBy: 'modal-basic-title',
      })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
          if (result === 'yes') {
            let data = `warehousedataentry/${customs?.warehousedataentryId}`;
            this.commonService.deleteST(data).subscribe((res: any) => {
              if (res) {
                this.notification.create('success', 'Deleted Successfully', '');
                setTimeout(() => {
                  this.getWarehouseDataEntry();
                }, 1000);
              }
            });
          }
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }

  searchColumns() {
    this.filterKeys = {};

    // Map display columns to actual data property names
    const columnPropertyMap = {
      'type': 'type',
      'jobNo': 'jobNo',
      'partyName': 'partyName',
      'CHA': 'CHA',
      'spaceCertificationDate': 'jobDate',
      'billofEntry': 'blofEN',
      'inDate': 'inEntryDateTime',
      'inDutyAmt': 'customDuty',
      'outDate': 'gateOutDate',
      'dutyAmount': 'totalDutyAmount',
      'balance': 'balance',
      'containerNo': 'containerNo',
      'iNPKGS': 'gateInPackages',
      'outPKGS': 'gateOutPackages',
      'inWarehouse': 'inWarehouse',
      'size': 'spaceRequired',
      'containerCount': 'containerCount',
      'warehouseNo': 'warehouseNumber',
      'status': 'status'
    };

    // Store party filter separately to combine with other filters
    let partyFilter = null;

    this.filtersModel.forEach((each, ind) => {
      if (each) {
        const columnName = this.displayedColumns[ind];
        const propertyName = columnPropertyMap[columnName];

        if (!propertyName) return;

        // Skip balance filter as it's a calculated field
        if (columnName === 'balance') {
          return;
        }

        // Handle CHA filter - use ID-based filtering
        if (columnName === 'CHA') {
          // Use the selected CHA ID directly for exact matching
          this.filterKeys['chaLedger'] = each;
        }
        // Handle partyName filter - store it separately
        else if (columnName === 'partyName') {
          partyFilter = each;
        }
        // Handle date filters
        else if (columnName === 'spaceCertificationDate' || columnName === 'inDate' || columnName === 'outDate') {
          const selectedDate = new Date(each);
          const startOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0, 0);
          const endOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 23, 59, 59, 999);

          this.filterKeys[propertyName] = {
            $gte: startOfDay.toISOString(),
            $lte: endOfDay.toISOString()
          };
        }
        // Handle status and type filters
        else if (columnName === 'status' || columnName === 'type') {
          this.filterKeys[propertyName] = each;
        }
        // Handle text filters
        else {
          this.filterKeys[propertyName] = {
            $regex: each.toString(),
            $options: 'i'
          };
        }
      }
    });

    // Add party filter using $or at the end (so it doesn't get overwritten)
    if (partyFilter) {
      this.filterKeys['$or'] = [
        { 'importerLedger': partyFilter },
        { 'invoiceLedger': partyFilter }
      ];
    }

    // Add type filter based on selected checkboxes
    if (this.selectedShipmentTypes.length > 0 && !this.filterKeys['type']) {
      if (this.selectedShipmentTypes.includes('Bonded')) {
        this.filterKeys['type'] = 'Bonded';
      } else if (this.selectedShipmentTypes.includes('NonBonded')) {
        this.filterKeys['type'] = 'Non Bonded';
      }
    }

    let payload = this.commonService.filterList();
    payload.query = {
      ...this.filterKeys,
    };
    payload.size = Number(this.size);
    payload.from = 0;
    payload.sort = {
      desc: ['updatedOn'],
    };

    console.log('Filter Query:', JSON.stringify(payload.query, null, 2)); // Debug log

    this.commonService
      .getSTList('warehousedataentry', payload)
      .subscribe((data) => {
        console.log('Filtered data:', data?.documents);
        this.dataEntryList = data?.documents || [];

        // Get the selected party filter if it exists
        const selectedPartyFilter = this.filtersModel[this.displayedColumns.indexOf('partyName')];

        this.dataSource = new MatTableDataSource(
          data?.documents?.map((s: any, index) => {
            // Determine which party name to display
            let displayPartyName = s.importerLedgerName || s.invoiceLedgerName;

            // If party name filter is active, show only the party that matches the filter
            if (selectedPartyFilter) {
              if (s.importerLedger === selectedPartyFilter) {
                displayPartyName = s.importerLedgerName;
              } else if (s.invoiceLedger === selectedPartyFilter) {
                displayPartyName = s.invoiceLedgerName;
              }
            }

            return {
              ...s,
              id: index + 1,
              displayPartyName: displayPartyName
            };
          })
        );
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1;
      });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
}
