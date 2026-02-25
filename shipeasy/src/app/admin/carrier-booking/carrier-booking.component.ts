import { Component, OnInit, ViewChild } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';
import {ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { LoaderService } from 'src/app/services/loader.service';
import { CommonService } from 'src/app/services/common/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { FormBuilder } from '@angular/forms';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
@Component({
  selector: 'app-carrier-booking',
  templateUrl: './carrier-booking.component.html',
  styleUrls: ['./carrier-booking.component.scss']
})
export class CarrierBookingComponent implements OnInit {
  toalLength: any;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  submitted: boolean = false;
  status: string;
  id: any;
  carrierbookingsId:string=""
  customsdata: any
  fileTypeNotMatched: boolean;
  carrierbooking:any;
  documentTableData: any = Array<any>();
  @ViewChild(MatDrawer) drawer: MatDrawer | any;
  dataSource = new MatTableDataSource();
  pagenation = [10, 20, 50, 100];
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  _gc=GlobalConstants
  displayedColumns = [
    '#',
    'BookingNumber',
    'BookingDate',
    'Carrier',
    'portName',
    'PortOfLoading',
    'PortOfDischarge',
    'OnCarriage',
    'status',
    'action',

  ];
  closeResult: string;
  constructor(public route: ActivatedRoute,
    public loaderService: LoaderService,
    public modalService: NgbModal,
    public notification: NzNotificationService,
    public router: Router, private commonfunction: CommonFunctions,
    public formBuilder: FormBuilder,
    public commonService: CommonService,
    public sortPipe: OrderByPipe,) { }

  ngOnInit(): void {
    this.getcarrierbookingdata()
  }
  getcarrierbookingdata() {
    this.loaderService.showcircle();
    let payload = this.commonService?.filterList()
    this.commonService?.getSTList("carrierbooking", payload)?.subscribe((res: any) => {
      this.carrierbooking = res?.documents;
      this.dataSource = new MatTableDataSource(
        res?.documents?.map((s: any, index) => {
          return {
              ...s,
              BookingNumber: s?.basicDetails?.BookingNumber,
              BookingDate: s?.basicDetails?.BookingDate,
              Carrier: s?.basicDetails?.carrierName ?? s?.basicDetails?.Carrier,
              portName: s?.preCareer?.preCareers?.[0]?.portName,
              OnCarriage: s?.carriageForm?.carriages?.[0]?.portName,
              PortOfLoading: s?.vesselDetails?.portName,
              PortOfDischarge: s?.vesselDetails?.destinationPortName,
              LoadType: s?.basicDetails?.LoadType,
              id: index + 1
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
    if(payload?.query)payload.query = {
    }

   if(payload?.size) payload.size = Number(this.size),
      payload.from = this.fromSize - 1,
      payload.sort = {
        "desc": ["updatedOn"]
      }
    this.commonService?.getSTList("carrierbooking", payload).subscribe((data) => {
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
    let payload = this.commonService.filterList()
    payload.size = Number(10000),
      payload.from = this.page - 1,
      payload.query = this.filterKeys
    payload.sort = {
      "desc": ["updatedOn"]
    }
    this.commonService?.getSTList("carrierbooking", payload).subscribe((data) => {
      this.carrierbooking = data.documents;
      this.dataSource = new MatTableDataSource(
        data?.documents?.map((s: any,index) => {
          return{
            ...s,
            id:index+1
          }
        })
      );
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort1;
      
    });


  }

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
      this.carrierbooking.map((row: any) => {
       storeEnquiryData.push({
         'BookingNumber': row?.basicDetails?.BookingNumber,
         'BookingDate':row?.basicDetails?.BookingDate,
         'Carrier':row?.basicDetails?.carrierName,
         'portName':row?.preCareer?.preCareers?.[0]?.portName,
         'OnCarriage': row?.carriageForm?.carriages?.[0]?.portName
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

    const fileName = 'CarrierBooking.xlsx';
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

  clearFilters() {
    this.filtersModel = [];
    this.filterKeys = {};
  }

  navigateToNewTab(element) {
    let url = element.agentadviceId + '/edit'
    window.open(window.location.href + '/' + url);
  }
  onenMap(carrierbookings?) {
    if (carrierbookings) {
      this.router.navigate(['/carrier-bookings/add-carrier-booking/'+carrierbookings?.carrierbookingId])
    }else{
      this.router.navigate(['/carrier-bookings/add-carrier-booking'])
    }
  }

  onDelete(deletedata, carrierbookings
    ) {
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
            let data =  `carrierbooking/${carrierbookings?.carrierbookingId}`
            this.commonService.deleteST(data).subscribe((res: any) => {
              if (res) {
                this.notification.create('success', 'Deleted Successfully', '');
                setTimeout(() => {
                  this.getcarrierbookingdata()
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
