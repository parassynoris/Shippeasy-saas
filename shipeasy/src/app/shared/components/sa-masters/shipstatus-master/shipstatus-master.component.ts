import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { MastersService } from 'src/app/services/Masters/masters.service';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'

@Component({
  selector: 'app-shipstatus-master',
  templateUrl: './shipstatus-master.component.html',
  styleUrls: ['./shipstatus-master.component.css'],
})
export class ShipstatusMasterComponent implements OnInit {
  shipData: any = [];
  addShipStatusForm: FormGroup;
  shipIdToUpdate: string;
  closeResult: string;
  toalLength: any;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  laden: any;
  submitted: any = false;
  ref = 'ship-status';
  isSearchable: boolean = false;
  isClearable: boolean = false;

  constructor(
    private modalService: NgbModal,
    private masterService: MastersService,
    private fb: FormBuilder,
    private notification: NzNotificationService
  ) {
    this.addShipStatusForm = this.fb.group({
      typeName: new FormControl('', Validators.required),
      status: new FormControl(true),
    });
  }
  get f() {
    return this.addShipStatusForm.controls;
  }
  ngOnInit(): void {
    this.getData();
  }
  deleteclause(id: any) {
    alert('Item deleted!');
  }
  getData() {
    let body = {
      _source: [],
      
      size: Number(this.size),
      from: this.page - 1,
      
      sort: { createdOn: 'desc' },
      query: {
        bool: {
          must: [
            {
              match: {
                typeCategory: this.ref,
              },
            },
          ],
          filter: [],
          should: [],
          must_not: [],
        },
      },
    };
    this.masterService.systemtypeList(body)?.subscribe((res: any) => {
      this.shipData = res.hits.hits;
      this.toalLength = res.hits.total.value;
      this.count = res.hits.hits.length;
    });
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

  filter(e) {
    this.size = e.target.value;
    this.fromSize = 1;
    this.getData();
  }

  getPaginationData(type: any) {
    this.fromSize =
      type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
    var parameter = {
      _source: [],
      size: Number(this.size),
      from: this.fromSize - 1,
      sort: { createdOn: 'desc' },
      query: {
        bool: {
          must: [
            {
              match: {
                typeCategory: this.ref,
              },
            },
          ],
          filter: [],
          should: [],
          must_not: [],
        },
      },
    };
    this.masterService.systemtypeList(parameter).subscribe((data) => {
      this.shipData = data.hits.hits;
      this.toalLength = data.hits.total.value;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count =
        type === 'prev'
          ? this.toalLength === this.count
            ? this.count - (this.toalLength % Number(this.size))
            : this.count - data.hits.hits.length
          : this.count + data.hits.hits.length;
    });
  }

  open(content, ship?: any) {
    if (ship) {
      this.shipIdToUpdate = ship._source.systemtypeId;
      this.addShipStatusForm.patchValue({
        typeName: ship._source.typeName,
      });
    }
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }
  shipMasters() {
    this.submitted = true;
    if (this.addShipStatusForm.invalid) {
      return;
    }
    let newdata = {
      typeName: this.addShipStatusForm.value.typeName,
      typeCategory: this.ref,
      orgId: '',
      tenantId: '',
      typeParentType: 'ship status-master',
      typeDescription: 'ship status',
      typeRef: 'ship',
      typeRefId: '2',
      status: true,
    };
    if (!this.shipIdToUpdate) {
      const data = [newdata];
      this.masterService.createSystemType(data).subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Added Successfully', '');
            this.onSave();
            var myInterval = setInterval(() => {
              this.getData();
              clearInterval(myInterval);
            }, 1000);
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
    } else {
      let newData = { ...newdata, systemtypeId: this.shipIdToUpdate };
      const data = [newData];
      this.masterService.updateSystemType(data).subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Updated Successfully', '');
            this.onSave();
            var myInterval = setInterval(() => {
              this.getData();
              clearInterval(myInterval);
            }, 1000);
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
    }
  }
  changeStatus(data, i) {
    this.masterService
      .updateSystemType([{ ...data?._source, status: !data?._source?.status }])
      .subscribe(
        (res: any) => {
          if (res) {
            this.shipData[i]._source.status = !data?._source?.status;
            this.notification.create(
              'success',
              'Status Updated Successfully',
              ''
            );
            this.onSave();
            var myInterval = setInterval(() => {
              this.getData();
              clearInterval(myInterval);
            }, 1000);
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
  }
  delete(deletesegment, id) {
    this.modalService
      .open(deletesegment, {
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
            let data = {
              systemtypeId: id._source.systemtypeId,
              searchKey: 'systemtypeId',
            };
            const body = [data];

            this.masterService.deleteSystemType(body).subscribe((res: any) => {
              if (res) {
                this.notification.create('success', 'Deleted Successfully', '');
                this.getData();
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
  onSave() {
    this.submitted = false;
    this.shipIdToUpdate = null;
    this.addShipStatusForm.reset();
    this.submitted = false;
    this.modalService.dismissAll();
    return null;
  }

  search() {
    if (!this.isSearchable) {
      return;
    }
    this.isSearchable = false;
    this.isClearable = true;

    let mustArray = [];
    mustArray.push({
      match: {
        typeCategory: this.ref,
      },
    });
    if (this.laden) {
      mustArray.push({
        wildcard: {
          'typeName': "*" + this.laden.toLowerCase() + "*"
        },
      });
    }

    var parameter = {
      size: Number(this.size),
      from: this.fromSize - 1,
      sort: { createdOn: 'desc' },
      query: {
        bool: {
          must: mustArray,
        },
      },
    };
    this.masterService.systemtypeList(parameter).subscribe((res: any) => {
      this.shipData = res.hits.hits;
      this.toalLength = res.hits.total.value;
      this.count = res.hits.hits.length;
    });
  }

  clear() {
    this.laden = '';
    if (!this.isClearable) {
      return;
    }
    this.isClearable = false;
    this.getData();
  }

  searchDataChange() {
    this.isSearchable = true;
  }

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.shipData.map((row: any) => {
      storeEnquiryData.push({
        'Laden / Ballast': row._source?.typeName,
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

    const fileName = 'ship-status-master.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  openPDF() {
    var prepare=[];
    this.shipData.forEach(e=>{
      var tempObj =[];
      tempObj.push(e._source?.typeName);
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [297, 210]);
    autoTable(doc,{
        head: [['Laden / Ballast']],
        body: prepare
    });
    doc.save('ship-status-master' + '.pdf');
  }
}
