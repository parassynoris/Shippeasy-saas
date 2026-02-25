import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from 'src/app/services/common/common.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-bill-of-entry',
  templateUrl: './bill-of-entry.component.html',
  styleUrls: ['./bill-of-entry.component.scss']
})
export class BillOfEntryComponent implements OnInit {
  documentTableData: any = Array<any>();
  @ViewChild(MatDrawer) drawer: MatDrawer | any;
  dataSource = new MatTableDataSource();
  pagenation = [10, 20, 50, 100];
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  submitted: boolean = false;
  urlParam: any;
  userTable:FormGroup;
  id: any;
  closeResult:any
  isShow: boolean = false;
  entryBillData:any=[]
  displayedColumns = [
    '#',
    'entryBillNo',
    'createdOn',
    'action',
 
  ];
  currentUrl: any;
  constructor(private router: Router,private route: ActivatedRoute, private commonService: CommonService,private loaderService: LoaderService,private notification:NzNotificationService,private modalService:NgbModal, private fb: FormBuilder,) {
    this.route.params.subscribe(params =>
      this.urlParam = params
    );
    this.isShow = this.urlParam?.access == 'show' ? true : false;
    this.userTable = this.fb.group({
      tableRows: this.fb.array([])
    });
  }
 
  ngOnInit(): void {
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();
    this.id = this.route.snapshot?.params['id']
    this.getcustomdata()
  }
  applyFilter(filterValue: string) { 
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase();

   
    this.dataSource.filterPredicate = (data, filter) => {
      return JSON.stringify(data).toLowerCase().includes(filter);
    };

    this.dataSource.filter = filterValue;
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
  exportAsExcelFile(): void {}
  getcustomdata() {
    this.loaderService.showcircle();
    let payload = this.commonService?.filterList()
    if(payload?.query) payload.query = {
      "batchId": this.id
    }
    this.commonService?.getSTList("entrybill", payload)?.subscribe((res: any) => {
      this.entryBillData = res?.documents;
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
  printAll(data) {
    let reportpayload: any;
    let url: any;
      reportpayload = { "parameters": { "entrybillId": data?.entrybillId } };
      url = 'checkListHome';

    this.commonService.pushreports(reportpayload, url).subscribe({
      next: (res: any) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        let temp = URL.createObjectURL(blob);
        const pdfWindow = window.open(temp);
        pdfWindow.print();
      }
    })

  }
  onenMap(id){
    let entrybillId =id?.entrybillId;
    this.router.navigate(['/batch/list/add', this.urlParam.id, this.urlParam.key, entrybillId,'edit']);
  }
  onDelete(deletedata, entrybill) {
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
            let data =  `entrybill/${entrybill?.entrybillId}`
            this.commonService.deleteST(data).subscribe((res: any) => {
              if (res) {
                this.notification.create('success', 'Deleted Successfully', '');
                setTimeout(() => {
                 this.getcustomdata()
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
  pageNumber = 1;
  pageSize = 10;
  from = 0;
  totalCount = 0;

  onPageChange(event){
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.from = event.pageIndex*event.pageSize ;
    this.getcustomdata();
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
    this.commonService?.getSTList("entrybill", payload)?.subscribe((res: any) => {
      this.entryBillData = res?.documents;
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
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
   clear(){
   
    this.getcustomdata();
  }
  clearFilters() {
    this.filtersModel = [];
    this.filterKeys = {};
    this.getcustomdata();
  }
  toalLength: number;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
 
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

  filter(e) {
    this.size = e.target.value;
    this.fromSize = 1;
  }
  closeModal() {
    this.modalService.dismissAll();
    this.onreset();
  }
  onreset(){
    this.submitted = false;
  }
  entryBillNo:string;
  createdOn:string;
  isExport:false
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
 
  this.commonService?.getSTList("entrybill", parameter)?.subscribe((res: any) => {
    this.entryBillData = res?.documents;
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
  // getPaginationData(type: any) {
  //   this.fromSize =
  //   type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;

  // let payload = this.commonService.filterList()
  // payload.size = Number(this.size),
  // payload.from = this.fromSize - 1,
  // payload.sort = {  "desc" : ['updatedOn'] }
  // let mustArray = {};

  // this.entryBillNo = this.entryBillNo?.trim();
  // this.createdOn = this.createdOn?.trim();

  // if (this.entryBillNo) {
  //   mustArray['entryBillNo'] = {
  //     "$regex": this.entryBillNo,
  //     "$options": "i"
  //   }
  // }
  // if (this.createdOn) {
  //   mustArray['createdOn'] = {
  //     "$regex": this.createdOn,
  //     "$options": "i"
  //   }
  // }

  // payload.query=mustArray;
  //       this.commonService.getSTList('entrybill',payload).subscribe((data: any) => {
  //     this.entryBillData = data?.documents;
  //     this.toalLength = data.totalCount;
  //     this.page = type === 'prev' ? this.page - 1 : this.page + 1;
  //     this.count =
  //       type === 'prev'
  //         ? this.toalLength === this.count
  //           ? this.count -  ((this.toalLength % Number(this.size))>0?(this.toalLength % Number(this.size)):(Number(this.size)))
  //           : this.count - data.documents.length
  //         : this.count + data.documents.length;
  //   });
  // }
}
