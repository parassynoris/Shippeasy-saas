import { Component, OnInit, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from 'src/app/services/common/common.service';
import { LoaderService } from 'src/app/services/loader.service';
import * as XLSX from "xlsx";
@Component({
  selector: 'app-shipping-bill',
  templateUrl: './shipping-bill.component.html',
  styleUrls: ['./shipping-bill.component.scss']
})
export class ShippingBillComponent implements OnInit {
  documentTableData: any = Array<any>();
  @ViewChild(MatDrawer) drawer: MatDrawer | any;
  dataSource = new MatTableDataSource();
  pagenation = [10, 20, 50, 100];
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  urlParam: any;
  id: any;
  isExport:any;
  closeResult:any
  size = 10;
  page = 1;
  count = 0;
  shippingbillNo:any;
  createdOn:any;
  toalLength: number;
  fromSize: number = 1;
  isShow: boolean = false;
  shippingBillData:any=[]
  displayedColumns = [
    '#',
    'shippingbillNo',
    'createdOn',
    'action',

  ];
  currentUrl: any;
  globalSearch: any;
  constructor(private router: Router,private route: ActivatedRoute, private commonService: CommonService,private loaderService: LoaderService,private notification:NzNotificationService,private modalService:NgbModal) { 
    this.route.params.subscribe(params =>
      this.urlParam = params
    );
    this.isExport = localStorage.getItem('isExport') === 'false' ? false : true
    this.isShow = this.urlParam?.access == 'show' ? true : false;;
  }

  ngOnInit(): void {
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();
    this.id = this.route.snapshot?.params['id']
    this.getshippingbill()
  }
  addDetails(){
    this.router.navigate(['/batch/list/add', this.urlParam.id, this.urlParam.key, 'add']);
  }
  onBillAction(event) {
    const url = event ?? 'add';
    this.router.navigate(['/batch/list/' + url + '/' + this.urlParam.id + '/' + this.urlParam.key]);
  }
  displayedColumns1 = this.displayedColumns.map((x, i) => x + '_' + i);
  toggleFilters = true;
  filtersModel = [];
  filterKeys = {};
  exportAsExcelFile(): void {
    let shippingbill = [];
    this.shippingBillData.map((row: any) => {
      shippingbill.push({
        'ShippingbillNo.': row?.shippingbillNo,
        'Created On.': row?.createdOn,
      });
    });
    const myworksheet: XLSX.WorkSheet =
      XLSX.utils.json_to_sheet(shippingbill);
    const myworkbook: XLSX.WorkBook = {
      Sheets: { data: myworksheet },
      SheetNames: ['data'],
    };
    const fileName = 'Shipping-Bill.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }
  print(data) {
    let reportpayload: any;
    let url: any;
      reportpayload = { "parameters": { "shippingbillId": data?.shippingbillId } };
      url = 'checkListShippingBill';

    this.commonService.pushreports(reportpayload, url).subscribe({
      next: (res: any) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        let temp = URL.createObjectURL(blob);
        const pdfWindow = window.open(temp);
        pdfWindow.print();
      }
    })

  }
  applyFilter(filterValue: string){
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase();

   
    this.dataSource.filterPredicate = (data, filter) => {
      return JSON.stringify(data).toLowerCase().includes(filter);
    };

    this.dataSource.filter = filterValue;
  }
  getshippingbill() {
    this.loaderService.showcircle();
    let payload = this.commonService?.filterList()
    if(payload?.query) payload.query = {
      "batchId": this.id
    }
    this.commonService?.getSTList("shippingbill", payload)?.subscribe((res: any) => {
      this.shippingBillData = res?.documents;
      this.dataSource = new MatTableDataSource(
        res?.documents?.map((s: any,index) => {
          return{
            ...s,
            id:index+1
          }
        })
      );

      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort1
      this.loaderService.hidecircle();
    },()=>{
      this.loaderService.hidecircle();
    }
    )
  }
  onenMap(id){
    let shippingbillId =id?.shippingbillId;
    this.router.navigate(['/batch/list/add', this.urlParam.id, this.urlParam.key, shippingbillId,'edit']);

  }
  onDelete(deletedata, shippingbill) {
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
            let data =  `shippingbill/${shippingbill?.shippingbillId}`
            this.commonService.deleteST(data).subscribe((res: any) => {
              if (res) {
                this.notification.create('success', 'Deleted Successfully', '');
                setTimeout(() => {
                 this.getshippingbill()
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
  clearGloble() {
    this.globalSearch = '';
    this.clear()
  }
  searchGlobal() {


    let  query = this.globalSearch
   
    let shouldArray = [];
    shouldArray.push(
      {"shippingbillNo": {  "$regex": query ,"$options": "i"  } },
      { "createdOn": {  "$regex": query ,"$options": "i" } },
     )


  
  var parameter = {
    "project": [ ],
    "query": {
      "isExport": this.isExport,
      "$or": shouldArray},
    "sort" :{
        "desc" : ["createdOn"]
    },
    size: Number(this.size),
    from: 0,
}

  
this.commonService?.getSTList("shippingbill", parameter)?.subscribe((res: any) => {
  this.shippingBillData = res?.documents;
  this.dataSource = new MatTableDataSource(
    res?.documents?.map((s: any,index) => {
      return{
        ...s,
        id:index+1
      }
    })
  );
})
  }
  searchColumns() {
    this.filterKeys = {};
    this.filtersModel.forEach((each, ind) => {
      if (each)
        this.filterKeys[this.displayedColumns[ind]] = {
          "$regex": each.toLowerCase(),
          "$options": "i"
        }
    });
    let payload = this.commonService.filterList()
    payload.query = this.filterKeys
    payload.sort = {
      "desc": ["updatedOn"]
    }
    this.commonService?.getSTList("shippingbill", payload)?.subscribe((res: any) => {
      this.shippingBillData = res?.documents;
      this.dataSource = new MatTableDataSource(
        res?.documents?.map((s: any,index) => {
          return{
            ...s,
            id:index+1
          }
        })
      );
    
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort1
    
        });
 
  }
  clear() {
    this.createdOn = '';
    this.shippingbillNo = '';
   this.getshippingbill()   
  }
  clearFilters() {
    this.filtersModel = [];
    this.filterKeys = {};
    this.getshippingbill()
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
  getPaginationData(type: any) {
    this.fromSize =
      type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;


    var parameter = {
      "project": [ ],
      "query": {
          "isExport": this.isExport
      },
      "sort" :{
          "desc" : ["createdOn"]
      },
      size: Number(this.size),
      from: this.fromSize - 1,
  }
  
  this.commonService?.getSTList("shippingbill", parameter)?.subscribe((res: any) => {
    this.shippingBillData = res?.documents;
    this.dataSource = new MatTableDataSource(
      res?.documents?.map((s: any,index) => {
        return{
          ...s,
          id:index+1
        }
      })
    );
  
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort1
  
      });
  }
}
