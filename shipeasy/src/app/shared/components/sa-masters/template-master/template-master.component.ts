import { Component, OnInit } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ApiSharedService } from '../../api-service/api-shared.service';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { CommonService } from 'src/app/services/common/common.service';
import { CostTemplate } from 'src/app/models/costtemplates-master';

@Component({
  selector: 'app-template-master',
  templateUrl: './template-master.component.html',
  styleUrls: ['./template-master.component.css']
})
export class TemplateMasterComponent implements OnInit {
  templateList: CostTemplate[]=[];
  toalLength: number;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  closeResult: string;

  constructor(public apiService: ApiSharedService,private notification: NzNotificationService,
    private commonService : CommonService,
    private modalService: NgbModal,) { }

  ngOnInit(): void {
    this.getTemplate();
  }

  getTemplate() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = { }
    if(payload?.sort)payload.sort = {
      "desc" : ["updatedOn"]
   }
   if(payload?.size)payload.size = Number(this.size)
   if(payload?.from)payload.from = 0,
    this.commonService.getSTList('costtemplate', payload)?.subscribe((res: any) => {
      this.templateList = res.documents
      this.toalLength = res.totalCount;
      this.count = res.documents.length;
    })
  }

  filter(e) {
    this.size = e.target.value;
    this.fromSize = 1;
    this.getTemplate();
  }

  next() {
    if (this.toalLength > this.count) {
      this.getPaginationData('next')
    }
  }

  prev() {
    if (this.page > 0) {
      this.getPaginationData('prev')
    }
  }

  getPaginationData(type: string) {
    this.fromSize =
      type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
      let payload = this.commonService.filterList()
      if(payload?.query)payload.query = { }
      if(payload?.sort)payload.sort = {
        "desc" : ["updatedOn"]
     }
     if(payload?.size)payload.size = Number(this.size)
     if(payload?.from)payload.from = this.fromSize -1,
      this.commonService.getSTList('costtemplate', payload)?.subscribe((data: any) => {
      this.templateList = data.documents
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

  changeStatus(template: any,e:any) {
    let typeActive = e.target.checked?true:false;
    const data = [template]
     template = {...data[0], status :typeActive };
     
     this.commonService.UpdateToST(`costtemplate/${template.costtemplateId}`, template)?.subscribe((res: any) => {
      if (res) {
        this.notification.create(
          'success',
          'Update Successfully',
          ''
          );
          this.getTemplate();
      }
    }, error => {
      this.notification.create(
        'error',
        error?.error?.error?.message,
        ''
      );
    });
  }

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.templateList.map((row: any) => {
      storeEnquiryData.push({
        'Name': row.costTemplateName,
        'Status': row.status ? 'Active' : 'Inactive',
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

    const fileName = 'template-master.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  openPDF() {
    var prepare=[];
    this.templateList.forEach(e=>{
      var tempObj =[];
      tempObj.push(e.costTemplateName);
      tempObj.push(e.status ? 'Active' : 'Inactive');
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [297, 210]);
    autoTable(doc,{
        head: [['Name', 'Status']],
        body: prepare
    });
    doc.save('template-master' + '.pdf');
  }


  delete(deletesystemType, id) {
    this.modalService
      .open(deletesystemType, {
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
            let data = 'costtemplate/'+id
            this.commonService.deleteST(data)?.subscribe((res: any) => {
              if (res) {
                this.notification.create('success', 'Deleted Successfully', '');
                setTimeout(() => {
                  this.getTemplate();
                }, 800);
               
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
