import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { BatchService } from 'src/app/services/Batch/batch.service';
import { CommonService } from 'src/app/services/common/common.service';
import { LoaderService } from 'src/app/services/loader.service';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss']
})
export class SupportComponent implements OnInit {
  supportmsgdata:any=[];
  @ViewChild(MatDrawer) drawer: MatDrawer | any;
  dataSource = new MatTableDataSource<any>();
  pagenation = [10, 20, 50, 100];
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  toalLength: any;
  submitted=false;
  ChatForm: FormGroup;
  supportmsgID: string = "";
  displayedColumns = [
    '#',
    'contactUsType',
    'customerName',
    'customerEmail',
    'message',
    'attachment',
    'reply',
    'StatusUpdate',
    'createdOn',
    'action',
    

  ];
  constructor( private commonService: CommonService,private modalService: NgbModal,private formBuilder: FormBuilder, private notification: NzNotificationService, private loaderService: LoaderService,private batchService: BatchService) { }

  ngOnInit(): void {
    this.ChatForm = this.formBuilder.group({
      reply: ['', Validators.required]})
  
    this.getsupportmsgdata()
  }
  get f() { return this.ChatForm?.controls; }
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
  this.commonService?.getSTList("supportmsg", payload).subscribe((data) => {
    this.supportmsgdata = data.documents;
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


 getsupportmsgdata() {
  this.loaderService.showcircle();
    let payload = this.commonService?.filterList()
    this.commonService?.getSTList("supportmsg", payload)?.subscribe((res: any) => {
      this.supportmsgdata = res?.documents;
      this.dataSource = new MatTableDataSource(
        res?.documents?.map((s: any) => s)
      );

      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort1
      this.loaderService.hidecircle();
    },()=>{
      this.loaderService.hidecircle();
    }
    )
  }
  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.supportmsgdata.map((row: any) => {
     storeEnquiryData.push({
       'customerName': row.customerName,
       'customerEmail': row.customerEmail,
       'message':row.message,
      'reply':row.reply,
      'createdOn':row.createdOn,
      'action':row.action,
      'StatusUpdate':row.status,
      
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

 const fileName = 'Support-custom.xlsx';
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
    this.commonService?.getSTList("supportmsg", payload).subscribe((data) => {
      this.supportmsgdata = data.documents;
      this.dataSource = new MatTableDataSource(
        data?.documents?.map((s: any) => s)
      );
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort1;
    });


  }
  adminComments(AddChat,supportmsg) {
    this.Cancel();
    this.supportmsgID = supportmsg?.supportmsgId;
    this.modalService.open(AddChat, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'md',
    });
  }
  Cancel() {
    this.modalService.dismissAll();
    this.ChatForm.reset()
  }
  AddSave() {
    this.submitted = true;
    if (this.ChatForm.invalid) {
      return;
    }
    let payload = {
      reply: this.ChatForm?.value?.reply,
      status: 'Sent'
    }
  
  if (this.supportmsgID) {
    this.commonService.UpdateToST("supportmsg/" + this.supportmsgID, payload)?.subscribe(
      (res: any) => {
        if (res) {
          this.notification.create('success', 'Replied Successfully', '');
          this.Cancel();
          setTimeout(() => {
          this.getsupportmsgdata()
          }, 1000);
        }
      },
      (error) => {
        this.Cancel();
        this.notification.create('error', error?.error?.error, '');
      }
    );
    this.send();
  } 

}

send() {
  const data=this.supportmsgdata?.find(rr=>rr?.supportmsgId===this.supportmsgID)
  let subject = `Ship Easy - ${data?.contactUsType} - Feedback`;
  let emaildata = `Dear ${data?.customerName}, <br><br>
  Thank you for reaching out to us. We have received your query regarding :- "${data?.message}"<br><br>
  We appreciate your patience and understanding while we look into this matter.<br><br>
  After reviewing your query, we have found the following Solution:- "${this.ChatForm?.value?.reply}"<br><br>
  If you require any further information or assistance, please do not hesitate to contact us. We are here to help and ensure that your experience with our service is positive.<br><br>
  Thank you for your understanding and cooperation<br>
    Regards, <br> ShipEasy Support Team`;
  let payload = {
    sender: {
      name: "ShipEasy Support",
      email: "shipeasy.in@gmail.com"
    },
    to: [{ email:  data?.customerEmail}],
    cc: [{ email: data?.userEmail }],
    textContent: `${emaildata}`,
    subject: subject
  };
  this.batchService.sendEmail(payload)?.subscribe(() => {})
}



downloadFile(doc) {
  this.commonService.downloadDocuments('downloadfile', doc.attachment).subscribe(
    (fileData: Blob) => {
      if (fileData) {
        this.commonService.downloadDocumentsFile(fileData, doc.attachment);
      } else {
        console.error('No file data received');
      }
    },
    (error) => {
      console.error('File download error', error);
    }
  );
}
}