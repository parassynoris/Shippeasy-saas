import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
import { ApiSharedService } from '../../api-service/api-shared.service';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { DatePipe } from '@angular/common'

@Component({
  selector: 'app-triff-hdr-master',
  templateUrl: './triff-hdr-master.component.html',
  styleUrls: ['./triff-hdr-master.component.css'],
})
export class TriffHdrMasterComponent implements OnInit {
  filterBody = this.apiService.body;
  HDRForm: FormGroup;
  toalLength: any;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  portListData: any = [];
  tariffList: any = [];
  submitted: any = false;
  idToUpdate: any = '';
  portName: any;
  fromDate: any;
  createdBy: any;
  createdOn: any;
  updatedBy: any;
  updatedOn: any;
  show: any;
  constructor(
    private modalService: NgbModal,
    private saMasterService: SaMasterService,
    private fb: FormBuilder,
    private notification: NzNotificationService,
    public apiService: ApiSharedService,
    public datepipe: DatePipe
  ) {
    this.buildForm();
  }

  buildForm() {
    this.HDRForm = this.fb.group({
      port: new FormControl('', Validators.required),
      fromDate: new FormControl('', Validators.required),
      status: new FormControl(true, Validators.required),
    });
  }
  ngOnInit(): void {
    this.getListData();
    this.getPort();
  }

  getListData() {
    this.filterBody = this.apiService.body;
    let must = [
      {
        match: {
          tarrifType: 'hdr',
        },
      },
    ];
    this.filterBody.query.bool.must = must;
    this.apiService
      .getMasterList('tariff', this.filterBody)
      .subscribe((data: any) => {
        this.tariffList = data.hits.hits;
        this.toalLength = data.hits.total.value;
        this.count = data.hits.hits.length;
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
    this.getListData();
  }

  getPaginationData(type: any) {
    this.fromSize =
      type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
    var parameter = {
      size: Number(this.size),
      from: this.fromSize - 1,
      sort: { createdOn: 'desc' },
      query: {
        bool: {
          must: [
            {
              match: {
                tarrifType: 'hdr',
              },
            },
          ],
          filter: [],
          should: [],
          must_not: [],
        },
      },
    };
    this.apiService
      .getMasterList('tariff', parameter)
      .subscribe((data: any) => {
        this.tariffList = data.hits.hits;
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
  deleteclause(id: any) {
    alert('Item deleted!');
  }

  getPort() {
    this.filterBody = this.apiService.body;
    let must = [
      {
        match: {
          status: true,
        },
      },
    ];
    this.filterBody.query.bool.must = must;
    this.apiService
      .getMasterList('port', this.filterBody)
      .subscribe((res: any) => {
        this.portListData = res.hits.hits;
      });
  }
  open(content, tariff?: any,show?) {
    this.show = show;
    if (tariff) {
      this.idToUpdate = tariff._source.tariffId;
      this.HDRForm.patchValue({
        port: tariff._source.portId,
        fromDate: tariff._source.fromDate,
        status: tariff._source.status,
      });
      show === 'show'?this.HDRForm.disable():this.HDRForm.enable();
    } else {
      this.idToUpdate = '';
    }
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }
  get f1() {
    return this.HDRForm.controls;
  }
  onSave() {
    this.submitted = true;
    if (this.HDRForm.invalid) {
      return false;
    }

    let payload = {
      tenantId: '1',
      orgId: '1',
      module: 'SA',
      tariffId: '',
      tarrifType: 'hdr',
      tariffBasis: '',
      port: this.portListData?.filter(
        (x) => x._source?.portId === this.HDRForm?.get('port').value
      )[0]?._source?.portDetails?.portName,
      portId: this.HDRForm?.get('port').value,

   
      seqNo: '',
      fromDate: this.HDRForm?.get('fromDate').value,
      status: this.HDRForm?.get('status').value,
      statusSeq: 0,
    };

    if (this.idToUpdate !== '') {
      let data = [{ ...payload, tariffId: this.idToUpdate }];
      this.apiService.updateMasterList('tariff', data).subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Update Successfully', '');
            this.submitted = false;
            this.modalService.dismissAll();
            this.HDRForm.reset();
            this.idToUpdate = '';
            var myInterval = setInterval(() => {
              this.getListData();
              clearInterval(myInterval);
            }, 2000);
          }
        },
        (error) => {
          this.notification.create('error', error?.error?.error?.message, '');
          this.buildForm();
          this.idToUpdate = '';
          this.modalService.dismissAll();
          this.submitted = false;
        }
      );
    } else {
      let data = [payload];
      this.apiService.masterSave('tariff', data).subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Save Successfully', '');
            this.submitted = false;
            var myInterval = setInterval(() => {
              this.getListData();
              clearInterval(myInterval);
            }, 2000);
            this.buildForm();
            this.idToUpdate = '';
            this.modalService.dismissAll();
          }
        },
        (error) => {
          this.notification.create('error', error?.error?.error?.message, '');
          this.buildForm();
          this.idToUpdate = '';
          this.modalService.dismissAll();
          this.submitted = false;
        }
      );
    }
  }
  cancel() {
    this.idToUpdate = '';
    this.buildForm();
    this.modalService.dismissAll();
  }
  changeStatus(data) {
    this.apiService
      .updateMasterList('tariff', [
        { ...data?._source, status: !data?._source?.status },
      ])
      .subscribe(
        (res: any) => {
          if (res) {
            this.notification.create(
              'success',
              'Status Updated Successfully',
              ''
            );
            this.getListData();
            this.buildForm();
            this.idToUpdate = '';
          }
        },
        (error) => {
          this.getListData();
          this.buildForm();
          this.idToUpdate = '';
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
  }
  clear() {
    this.getListData();
    this.portName = '';
    this.fromDate = '';
    this.createdBy = '';
    this.createdOn = '';
    this.updatedBy = '';
    this.updatedOn = '';
  }
  search() {
    let mustArray = [];
    let data = {
      match: {
        tarrifType: 'hdr',
      },
    };
    mustArray.push(data);

    if (this.portName) {
      mustArray.push({
        wildcard: {
          'port': "*" + this.portName.toLowerCase() + "*"
        },
      });
    }
    if (this.fromDate) {
      mustArray.push({
        wildcard: {
          'fromDate': "*" + this.fromDate.toLowerCase() + "*"
        },
      });
    }
    if (this.createdBy) {
      mustArray.push({
        wildcard: {
          'createdBy': "*" + this.createdBy.toLowerCase() + "*"
        },
      });
    }
    if (this.createdOn) {
      mustArray.push({
        wildcard: {
          'createdOn': "*" + this.createdOn.toLowerCase() + "*"
        },
      });
    }
    if (this.updatedBy) {
      mustArray.push({
        wildcard: {
          'updatedBy': "*" + this.updatedBy.toLowerCase() + "*"
        },
      });
    }
    if (this.updatedOn) {
      mustArray.push({
        wildcard: {
          'updatedOn': "*" + this.updatedOn.toLowerCase() + "*"
        },
      });
    }
    var parameter = {
      size: Number(this.size),
      from: 0,
      sort: { createdOn: 'desc' },
      query: {
        bool: {
          must: mustArray,
        },
      },
    };
    this.apiService
      .getMasterList('tariff', parameter)
      .subscribe((data: any) => {
        this.tariffList = data.hits.hits;
        this.toalLength = data.hits.total.value;
        this.count = data.hits.hits.length;
      });
  }

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.tariffList.map((row: any) => {
      storeEnquiryData.push({
        'Port Name': row._source?.port,
        'From Date': row._source?.fromDate,
        'Created By': row._source?.createdBy,
        'Created DT': row._source?.createdOn,
        'Last Updated By': row._source?.updatedBy,
        'Last Updated Dt': row._source?.updatedOn,
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

    const fileName = 'triff-hdr-master.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }
  openPDF() {
    var prepare=[];
    this.tariffList.forEach(e=>{
      var tempObj =[];
      tempObj.push(e._source?.port);
      tempObj.push(e._source?.fromDate);
      tempObj.push(e._source?.createdBy);
      tempObj.push(this.datepipe.transform(e._source?.createdOn,"dd-MM-YYYY"));
      tempObj.push(e._source?.updatedBy);
      tempObj.push(this.datepipe.transform(e._source?.updatedOn,"dd-MM-YYYY"));
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [397, 310]);
    autoTable(doc,{
        head: [['Port Name','From Date','Created By','Created DT','Last Updated By','Last Updated Dt']],
        body: prepare
    });
    doc.save('triff-hdr-master' + '.pdf');
  }
}
