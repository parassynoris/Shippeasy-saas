import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from 'src/app/services/common/common.service';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
import { ModalDismissReasons, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ScheduleReportComponent } from '../schedule-report/schedule-report.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-schedule-list',
  templateUrl: './schedule-list.component.html',
  styleUrls: ['./schedule-list.component.scss']
})
export class ScheduleListComponent implements OnInit {
  _gc = GlobalConstants;
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort1!: MatSort;
  displayedColumns = [
    '#',
    'customerName',
    'subscriptionName',
    'reportType',
    'schedule',
    'timeofDay',
    'createdOn',
    'toEmail',
    'action',

  ];
  toalLength: number;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  scheduleList: any = []
  displayedColumns1 = this.displayedColumns.map((x, i) => x + '_' + i);
  toggleFilters = true;
  filtersModel = [];
  filterKeys = {};
  closeResult: string;
  constructor( public router: Router,private commonService: CommonService, private notification: NzNotificationService,public modalService: NgbModal,) {
    // this.getPartyList()
   }

  ngOnInit(): void {
    this.displayedColumns1 = this.displayedColumns.map((x, i) => x + '_' + i);
    this.getData()
  }
  customerList: any = [] 
  getPartyList() {
    let payload = this.commonService?.filterList()
    if (payload?.query) payload.query = {
      "$and": [
        {
          "customerType?.item_text": {
            "$ne": "Vendor",
          }
        }
      ]
    } 
    this.commonService?.getSTList("partymaster", payload)?.subscribe((data) => {
      this.customerList = data.documents; 
    });
  }
  getData() { 
    let payload = this.commonService.filterList()
    let mustArray = {
      type: 'recurringEmail'
    };
   if(payload?.query) payload.query = mustArray;
   if(payload?.from) payload.from = this.fromSize - 1;

      this.commonService.getSTList('schedulereport', payload).subscribe((res: any) => {
        this.scheduleList = res.documents || []
        this.dataSource.data = res.documents?.map((x) => {
          return {
            ...x,
            toEmail: x?.toEmail?.toString() || ''
          }
        });
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1;

      }, (error: any) => {
        this.notification.create('error', error?.error?.error?.message, '');
      });

  }
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase();


    this.dataSource.filterPredicate = (data, filter) => {
      return JSON.stringify(data).toLowerCase().includes(filter);
    };

    this.dataSource.filter = filterValue;
  }

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.scheduleList.map((row: any) => {
      storeEnquiryData.push({
        'customerName': row?.customerName,
        'subscriptionName': row?.subscriptionName,
        'reportType': row?.reportType,
        'schedule': row?.schedule,
        'timeofDay': row?.timeofDay,
        'createdOn': row?.createdOn,
        'toEmail': row?.toEmail?.toString() || '',
        'Status': row.status ? "Active" : "Inactive",
      });
    });
    const myworksheet: XLSX.WorkSheet =
      XLSX.utils.json_to_sheet(storeEnquiryData);
    const myworkbook: XLSX.WorkBook = {
      Sheets: { data: myworksheet },
      SheetNames: ['data'],
    };
    

    const fileName = 'scheduleReports.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  openPDF() {
    const prepare = [];
    this.scheduleList.forEach(e => {
      let tempObj = []; 
      tempObj.push(e.customerName);
      tempObj.push(e.subscriptionName);
      tempObj.push(e.reportType);
      tempObj.push(e.schedule);
      tempObj.push(e.timeofDay);
      tempObj.push(e.createdOn);
      tempObj.push(e.toEmail?.toString() || ''); 
      tempObj.push(e.status ? "Active" : "Inactive");
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [297, 210]);
    autoTable(doc, {
      head: [['customerName',
      'subscriptionName',
      'reportType', 
      'schedule',
      'timeofDay',
      'createdOn',
      'toEmail',
      'Status']],
      body: prepare,
      didDrawCell: (data) => {
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'S');
      }
    });
    doc.save('scheduleReport' + '.pdf');
  }
  pageNumber = 1;
  pageSize = 10;
  from = 0;
  totalCount = 0;
  onPageChange(event) {
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.from = event.pageIndex * event.pageSize;
    this.getData();
  }
  searchColumns() {
    this.filterKeys = {};
    this.filtersModel.forEach((each, ind) => {
      if (each) {

        if (this.displayedColumns[ind] == 'createdOn') {
          this.filterKeys['createdOn'] = {
            "$gt": each.substring(0, 10) + 'T00:00:00.000Z',
            "$lt": each.substring(0, 10) + 'T23:59:00.000Z'
          };
        } else {
          this.filterKeys[this.displayedColumns[ind]] = {
            "$regex": each.toLowerCase(),
            "$options": "i"
          }
        }
      }
    });
 
    let payload = this.commonService.filterList()

    payload.size = Number(10000);
    payload.from = this.page - 1;
    payload.query = { ...this.filterKeys ,
      // type: this.urlParamkey == 'sale' ? 'sellerInvoice': 'buyerInvoice',
    }
    payload.sort = {
      "desc": ["updatedOn"]
    }

    this.commonService.getSTList('schedulereport', payload).subscribe((res: any) => {
      this.scheduleList = res.documents || []
      this.dataSource.data = res.documents?.map((x) => {
        return {
          ...x,
          toEmail: x?.toEmail?.toString() || ''
        }
      });
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort1;

    }, (error: any) => {
      this.notification.create('error', error?.error?.error?.message, '');
    });

  }
 private modalRef: NgbModalRef;
   openSchedule(element){
    // let custData =  this.customerList?.find(x => x.partymasterId === element.customerId) || {} 
      this.modalRef = this.modalService?.open(ScheduleReportComponent, {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        centered: true,
        size: 'lg',
      });
      this.modalRef.componentInstance.id = element?.schedulereportId;
      this.modalRef.componentInstance.customerData = element?.customer || [];
      this.modalRef.componentInstance.editData = {...element,toEmail : [element?.toEmail]};
      this.modalRef.componentInstance.reportName = element?.reportType;
      this.modalRef.componentInstance.getList.subscribe((res: any) => { 
        if (res) { 
          this.getData()
        }
      })
    }


    onUpdate(content,element) {

      this.commonService.UpdateToST(`schedulereport/${element?.schedulereportId}`, {...element,status : !element.status}).subscribe((data: any) => {
        if (data) {
          this.notification.create('success', 'Updated Successfully', '');
          setTimeout(() => {
            this.getData();
          }, 500);
        }
      }, (error) => {
        this.notification.create('error', error?.error?.error?.message, '');
      });
      return
      this.modalService
        .open(content, {
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
              this.commonService.UpdateToST(`schedulereport/${element?.schedulereportId}`, {...element,status : !element.status}).subscribe((data: any) => {
                if (data) {
                  this.notification.create('success', 'Updated Successfully', '');
                  setTimeout(() => {
                    this.getData();
                  }, 500);
                }
              }, (error) => {
                this.notification.create('error', error?.error?.error?.message, '');
              });
             
            }else{
              element = {...element,status : element.status}
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

      gotoMainList(){
        this.router.navigate(['reports/st-reports/reportList'])
      }
}
