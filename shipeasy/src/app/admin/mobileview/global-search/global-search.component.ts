import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CommonService } from 'src/app/services/common/common.service';
@Component({
  selector: 'app-global-search',
  templateUrl: './global-search.component.html',
  styleUrls: ['./global-search.component.scss'],
})
export class GlobalSearchComponent implements OnInit {
  querySearch: string;
  filterList = [];
  tabledata = [];
  selectedTab: any;
  modifiedTableData = [];
  dataSource: MatTableDataSource<any>;
  matchArray = [];
  searchResult = [];
  isLoading = false;
  panelOpenState = false;
  obs: Observable<any>;
  selectedDateRange: string;
  master = [];
  datas: any;
  bookingChecked: boolean = false;
  quotationChecked: boolean = false;
  invoiceChecked: boolean = false;
  documentChecked: boolean = false;
  oceanChecked: boolean = false;
  airChecked: boolean = false;
  icdCfcChecked: boolean = false;
  LandChecked: boolean = false;
  searchValue: string = '';
  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private commonService: CommonService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((res) => {
      if (res['search']) {
        this.querySearch = res['search'];
        if (this.querySearch) {
          this.globalSearch();
        }
      }
    });
  }

  routetosearchedText(type, data) {
    if (type === 'agentadvices') {
      this.router.navigate([
        `agent-advice/list/${data?._source?.agentadviceId}/edit`,
      ]);
    } else if (type === 'batchs') {
      this.router.navigate([
        `batch/list/add/${data?._source?.batchId}/details`,
      ]);
    } else if (type === 'invoices') {
      this.router.navigate([
        `finance/invoice/${data?._source?.invoiceId}/editInvoice`,
      ]);
    } else if (type === 'agents') {
      this.router.navigate([
        `smartagent/list/${data?._source?.agentId}/details/editsmart`,
      ]);
    } else if (type === 'enquirys') {
      this.router.navigate([`enquiry/list/${data?._source?.enquiryId}/edit`]);
    } else if (type === 'ports') {
    } else {
    }
  }

  resetCheckboxes() {
    this.bookingChecked = false;
    this.quotationChecked = false;
    this.invoiceChecked = false;
    this.documentChecked = false;
    this.oceanChecked = false;
    this.airChecked = false;
    this.icdCfcChecked = false;
    this.LandChecked = false;
    this.searchValue = '';
  }

  globalSearch() {
    let payload = {
      key: this.querySearch,
    };
    this.commonService.getSTList1('globalSearch', payload).subscribe((data) => {
      this.master = data?.foundInCollections;
      this.datas = data;
      console.log(this.datas);
      this.tabledata = []
      this.dataSource = new MatTableDataSource<any>(this.tabledata)
    this.dataSource.paginator = this.paginator;
    this.obs = this.dataSource.connect();
      if (this.master.length != 0) {
        this.selectedTab = this.master[0];
        this.select(this.selectedTab);
      }
    });
  }
  select(item) {
    this.selectedTab=item;
    console.log(item);
    
    this.tabledata = []
    this.tabledata = this.datas[item];
    console.log(this.tabledata.length);
    
    this.dataSource = new MatTableDataSource<any>(this.tabledata)
    this.dataSource.paginator = this.paginator;
    this.obs = this.dataSource.connect();
    this.isLoading = false;
  }
  navigate(element,type:string){
    if(type === 'batch'){
      this.router.navigate([
        `batch/list/add/${element?.batchId}/details`,
      ]);
    }
   else if(type === 'carrierbooking'){
      this.router.navigate([
        `/carrier-bookings/add-carrier-booking/${element?.carrierbookingId}`,
      ]);
    }
   else if(type === 'container'){
      this.router.navigate([
        `batch/list/add/${element?.batchId}/Container`,
      ]);
    }
    else if(type === 'bl'){
      this.router.navigate([
        `batch/list/add/${element?.batchId}/bl`,
      ]);
    }
   else if(type === 'enquiry'){
      this.router.navigate([
        `enquiry/list/${element?.enquiryId}/quote`,
      ]);
    }
   else if(type === 'invoice'){
      this.router.navigate([
        `batch/list/add/${element?.batchId}/invoice`,
      ]);
    }
   else if(type === 'quotation'){
      this.router.navigate([
        `enquiry/list/${element?.agentadviceId}/quote`,
      ]);
    }

  }
}
