
import { Component, Input, OnInit, Output, ViewChild ,EventEmitter} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { CommonService } from 'src/app/services/common/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Country } from 'src/app/models/state-master';
import { Currencys } from 'src/app/models/party-master';
import { OrderByPipe } from '../../util/sort';
import * as XLSX from 'xlsx';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';

@Component({
  selector: 'app-consolidation-booking',
  templateUrl: './consolidation-booking.component.html',
  styleUrls: ['./consolidation-booking.component.scss']
})
export class ConsolidationBookingComponent implements OnInit {

  @Output() getList = new EventEmitter<any>();
  toalLength: any;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  submitted: boolean = false;
  status: string;
  id: any;
  batchData: any;
  supplyListData: any
  fillingType = [];
  entryType = []
  currencyList: Currencys[];
  globalSearch: string;
  countryData: Country[] = [];
  partyMasterNameList: any;
  customDate: string;
  isExport: boolean;
  @ViewChild('content') content;
  @Input() type :any;
  documentTableData: any = Array<any>();
  @ViewChild(MatDrawer) drawer: MatDrawer | any;
  dataSource = new MatTableDataSource();
  pagenation = [10, 20, 50, 100];
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  _gc=GlobalConstants
  displayedColumns = [
    '#',
    'consolidationbookingNo',
    'batchNo',
    'containerNo',
    'containerType',
    'volume',
    'action'
 

  ];
  consolidationbooking: any;
  closeResult: string;

  constructor(
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private router: Router, 
    private commonService: CommonService,
    private sortPipe : OrderByPipe,
    public notification: NzNotificationService,
    public loaderService: LoaderService,
    
  ) {
    this.isExport = localStorage.getItem('isExport') === 'false' ? false : true;
  }

  ngOnInit(): void {
    this.getconsolidationbooking()
  }
 
  clearGloble() {
    this.globalSearch = '';
    this.clear()
  }

  next() {
    if (this.toalLength > this.count) {
      this.getPaginationData('next');
    }
  }

  prev() {
    if (this.page > 0) {
      this.getPaginationData('prev');
    }
  }
  sort(array , key){
    return this.sortPipe.transform(array, key);
   }

  filter(e) {
    this.size = e.target.value;
    this.fromSize = 1;
  }
  getPaginationData(type: any) {
    this.fromSize =
    type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
  let payload = this.commonService?.filterList()
  payload.query = {
  }

  payload.size = Number(this.size),
    payload.from = this.fromSize - 1,
    payload.sort = {
      "desc": ["updatedOn"]
    }
  }

  clear() {
  }
  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.consolidationbooking.map((row: any) => {
      storeEnquiryData.push({
        'consolidationbookingNo': row?.consolidationbookingNo,
        'batchNo': row?.batchNo,
      });
    });
    const myworksheet: XLSX.WorkSheet =
      XLSX.utils.json_to_sheet(storeEnquiryData);
    const myworkbook: XLSX.WorkBook = {
      Sheets: { data: myworksheet },
      SheetNames: ['data'],
    };
    const excelBuffer: any = XLSX.write(myworkbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const fileName = 'consolidationbooking.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);

  }
 

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase();


    this.dataSource.filterPredicate = (data, filter) => {
      return JSON.stringify(data).toLowerCase().includes(filter);
    };

    this.dataSource.filter = filterValue;
  }

  displayedColumns1 = this.displayedColumns.map((x, i) => x + '_' + i);
  toggleFilters = true;
  filtersModel = [];
  filterKeys = {};
  searchColumns() {
    this.filterKeys = {};
    this.filtersModel.forEach((each, ind) => {
      if (each)
        this.filterKeys[this.displayedColumns[ind]] = {
          "$regex": each.toLowerCase(),
          "$options": "i"
        }
    });

    let payload = this.commonService?.filterList()
    payload.size = Number(10000),
      payload.from = this.page - 1,
      payload.query = this.filterKeys
    payload.sort = {
      "desc": ["updatedOn"]
    }

  


  }
 
  clearFilters() {
    this.filtersModel = [];
    this.filterKeys = {};
  }

  navigateToNewTab(element) {
    let url = element.agentadviceId + '/edit'
    window.open(window.location.href + '/' + url);
  }


  onenMap() {
    this.router.navigate(['/consolidation-booking/add-consolidation'])
  }



 
  closeModal() {
    this.modalService.dismissAll();
  }

  onSave() {
    this.submitted = false;
    this.modalService.dismissAll();
    return null;
  }
  getconsolidationbooking(){
  this.loaderService.showcircle();
  let payload = this.commonService?.filterList();
  this.commonService?.getSTList("consolidationbooking", payload)?.subscribe((res: any) => {
    this.consolidationbooking = (res?.documents ?? [])?.map(tt => {
      const cleanContainerTypeList = (tt?.containerList ?? [])
        .map(tt => tt?.containerType?.trim())
        .filter(tt => tt);

      const cleanContainerList = (tt?.containerList ?? [])
        .map(tt => tt?.containerNo?.trim())
        .filter(tt => tt);  

      const cleanBatchList = (tt?.batchwiseGrouping ?? [])
        .map(tt => tt?.batchNo?.trim())
        .filter(tt => tt); 

      return {
        ...tt,
        volume:this.calculateTotalVolume(tt?.batchwiseGrouping),
        batchNo: cleanBatchList.join(','),
        containerNo: cleanContainerList.length > 0 ? cleanContainerList.join(',') : '',  
        containerType: cleanContainerTypeList.length > 0 ? cleanContainerTypeList.join(',') : '' 
      };
    });

    this.dataSource = new MatTableDataSource(
      this.consolidationbooking?.map((s: any, index) => {
        return {
          ...s,
          id: index + 1
        };
      })
    );

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort1;
    this.loaderService.hidecircle();
  }, () => {
    this.loaderService.hidecircle();
  });
}

calculateTotalVolume = (dataArray) => {
  let totalVolume = 0;
  dataArray.forEach(batch => {
      (batch?.items??[]).forEach(item => {
          totalVolume += parseFloat(item.volume);
      });
  });
  return totalVolume
};
  onenMaps(consolidationbooking){
  this.router.navigate(['consolidation-booking/edit/'+consolidationbooking+'/details'])
  }
  onDelete(deletedata, consolidationbooking) {
    this.modalService
      .open(deletedata, {
       
      })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
          if (result === 'yes') {
            let data = `consolidationbooking/${consolidationbooking?.consolidationbookingId}`
            this.commonService.deleteST(data).subscribe((res: any) => {
              if (res) {
                this.notification.create('success', 'Deleted Successfully', '');
                setTimeout(() => {
                  this.  getconsolidationbooking()
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
