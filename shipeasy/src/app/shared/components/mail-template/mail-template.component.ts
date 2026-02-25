import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MastersSortPipe } from '../../util/mastersort';
import { CommonService } from 'src/app/services/common/common.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { OrderByPipe } from '../../util/sort';
// import { Console } from 'console';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as XLSX from 'xlsx';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
@Component({
  selector: 'app-mail-template',
  templateUrl: './mail-template.component.html',
  styleUrls: ['./mail-template.component.css']
})
export class MailTemplateComponent implements OnInit {
  _gc=GlobalConstants;
  urlParam: any;
  currentUrl: string;
  items: any[] = [];
  tableData: any[];
  fromSize: number = 1;
  size = 10;
  customsdata: any;
  toalLength: any;
  page = 1;
  count = 0;
  pagination: any;
  email: any;
  status: string;
  closeResult: string;
  carrierbooking: any;
  dataSource = new MatTableDataSource();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort1!: MatSort;
  yardcfs:any
  displayedColumns: string[] = [
    '#',
    'action',
    'EmailName',
    'subject',
    'createdOn',
    
    
  ];

  ngOnInit(): void {
    this.getemaildata();
  }

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private sortPipelist: MastersSortPipe,
    public commonService: CommonService,
    public sortPipe: OrderByPipe,
    public modalService: NgbModal,
    public notification: NzNotificationService,
    public loaderService: LoaderService,
  ) {
    this.currentUrl = window.location.href.split('?')[0].split('/').pop()
    this.route.params?.subscribe(params =>
      this.urlParam = params
    );
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
          "$regex": each,
          "$options": "i"
        }
    });

    let payload = this.commonService.filterList()
    payload.query = this.filterKeys
    payload.sort = {
      "desc": ["updatedOn"]
    }
    this.commonService?.getSTList('emailtemplate', payload)?.subscribe((data) => {
      this.yardcfs = data.documents;
      this.dataSource = new MatTableDataSource(
        data?.documents?.map((s: any,index) => {
          return{
            ...s,
            id:index+1+this.from
          }
        })
      );
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort1;

    });


  }

  clearFilters1() {
    this.filtersModel = [];
    this.filterKeys = {};
    this.getemaildata()
    this.searchColumns()
  }

  routeBatch() {
    this.router.navigate(['/master/' + this.urlParam.key + '/add']);
  }

  pageNumber = 1;
  pageSize = 10;
  from = 0;
  totalCount = 0;

  onPageChange(event){
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.from = event.pageIndex*event.pageSize ;
    this.getemaildata();
  }

  getemaildata() {
    this.loaderService.showcircle();
    let payload = this.commonService?.filterList()
    payload.size= this.pageSize,
    payload.from=this.from
    this.commonService?.getSTList('emailtemplate', payload)?.subscribe((res: any) => {

      this.email = res?.documents;
      this.dataSource = new MatTableDataSource(
        res?.documents?.map((s: any,index) => {
          return {
            ...s, EmailName: s?.EmailName, subject
              : s?.subject, createdOn: s?.createdOn,
              id:index+1+this.from
          }
        })

      );
      // this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort1
      this.toalLength = res.totalCount;
        this.count = res.documents.length;
      this.loaderService.hidecircle();
    },()=>{
      this.loaderService.hidecircle();
    }
    )
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

  sort(array, key) {
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
    if (payload?.query) payload.query = {
    }

    if (payload?.size) payload.size = Number(this.size),
      payload.from = this.fromSize - 1,
      payload.sort = {
        "desc": ["updatedOn"]
      }
    this.commonService?.getSTList("emailtemplate", payload).subscribe((data) => {
      this.customsdata = data.documents;
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

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.email.map((row: any) => {
      storeEnquiryData.push({
        // 'EmailName': row?.element?.EmailName,
        // 'subject': row?.element?.subject,
        // 'createdOn': row?.element?.createdOn,
        'EmailName': row.EmailName,
        'subject': row.subject,
        'createdOn': row.createdOn,
        // 'status':row?.preCareer?.preCareers?.[0]?.portName,

      });
    }
    );
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

    const fileName = 'Mails.xlsx';
    XLSX.writeFile(myworkbook, fileName);
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();


    this.dataSource.filterPredicate = (data, filter) => {
      return JSON.stringify(data).toLowerCase().includes(filter);
    };

    this.dataSource.filter = filterValue;
  }

  clearFilters() {
    this.filtersModel = [];
    this.filterKeys = {};
  }


  onenMap(emailtemplate?) {

    if (emailtemplate) {
      this.router.navigate(['/master/' + this.urlParam.key + '/' + emailtemplate.emailtemplateId + '/edit']);
    }
  }

  clear() {
    this.getemaildata()
  }

  onDelete(deletedata, emailtemplate) {
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
            let data = `emailtemplate/${emailtemplate?.emailtemplateId}`
            this.commonService.deleteST(data).subscribe((res: any) => {
              if (res) {
                this.notification.create('success', 'Deleted Successfully', '');
                setTimeout(() => {
                  this.getemaildata()
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