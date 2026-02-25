import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { DatePipe } from '@angular/common';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'

@Component({
  selector: 'app-agency-type-master',
  templateUrl: './agency-type-master.component.html',
  styleUrls: ['./agency-type-master.component.css'],
})
export class AgencyTypeMasterComponent implements OnInit {
  agencyData: any = [];
  addAgencyForm: FormGroup;
  agencyIdToUpdate: string;
  closeResult: string;
  toalLength: any;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  submitted: any = false;
  nfda_auto: any;
  created_by: any;
  created_date: any;
  modify_by: any;
  modify_date: any;
  frt_tax: any;
  description: any;
  agency_Id: any;
  ref = 'agencyType';
  isSearchable: boolean = false;
  isClearable: boolean = false;
  show: any;

  constructor(
    private modalService: NgbModal,
    private masterService: MastersService,
    private fb: FormBuilder,
    public datepipe: DatePipe,
    private notification: NzNotificationService
  ) {
    this.addAgencyForm = this.fb.group({
      agencyTypeId: new FormControl('', Validators.required),
      isNFDAAuto: new FormControl(false),
    
      FRTTaxApplicable: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      status: new FormControl(true),
    });
  }

  ngOnInit(): void {
    this.getData();
  }
  get f() {
    return this.addAgencyForm.controls;
  }

  deleteclause(id: any) {
    alert('Item deleted!');
  }
  getData() {
    let body = {
      _source: [],
      size: Number(this.size),
      from: this.page - 1,
      sort: {
        createdOn: 'desc',
      },
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
      this.agencyData = res.hits.hits;
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
      this.agencyData = data.hits.hits;
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
    let mustArray1 = [];
    if (this.agency_Id) {
      mustArray.push({
        wildcard: {
          'typeName': "*" + this.agency_Id.toLowerCase() + "*"
        },
      });
    }
    if (this.nfda_auto) {
      mustArray.push({
        match: {
          'isNFDAAuto':this.nfda_auto
        },
      });
    }
    if (this.created_by) {
      mustArray.push({
        wildcard: {
          'createdBy': "*" + this.created_by.toLowerCase() + "*"
        },
      });
    }
    if (this.created_date) {
      mustArray.push({
        range: {
          createdDate: {
            gte: this.created_date + 'T00:00:00.000Z',
            lt: this.created_date + 'T23:59:00.000Z',
          },
        },
      });
    }
    if (this.modify_by) {
      mustArray.push({
        wildcard: {
          'updatedBy': "*" + this.modify_by.toLowerCase() + "*"
        },
      });
    }
    if (this.modify_date) {
      mustArray.push({
        range: {
          updatedDate: {
            gte: this.modify_date + 'T00:00:00.000Z',
            lt: this.modify_date + 'T23:59:00.000Z',
          },
        },
      });
    }
    if (this.frt_tax) {
      mustArray.push({
        wildcard: {
          'FRTTaxApplicable': "*" + this.frt_tax.toLowerCase() + "*"
        },
      });
    }
    if (this.description) {
      mustArray.push({
  
        wildcard: {
          'typeDescription': "*" + this.description.toLowerCase() + "*"
        },
      });
    }

    var parameter = {
      size: Number(this.size),
      from: this.fromSize - 1,
      query: {
        bool: {
          should: mustArray1,
          must: mustArray,
        },
      },
    };
    this.masterService.systemtypeList(parameter).subscribe((res: any) => {
      this.agencyData = res.hits.hits;
      this.toalLength = res.hits.total.value;
      this.count = res.hits.hits.length;
    });
  }

  clear() {
    this.agency_Id = '';
    this.nfda_auto = '';
    this.created_by = '';
    this.created_date = '';
    this.modify_by = '';
    this.modify_date = '';
    this.frt_tax = '';
    this.description = '';
    if (!this.isClearable) {
      return;
    }
    this.isClearable = false;
    this.getData();
  }

  searchDataChange() {
    this.isSearchable = true;
  }

  open(content, agency?: any,show?) {
    this.show = show
    if (agency) {
      this.agencyIdToUpdate = agency._source.systemtypeId;
      this.addAgencyForm.patchValue({
        agencyTypeId: agency._source.typeName,
        isNFDAAuto: agency._source.isNFDAAuto,
       
        FRTTaxApplicable: agency._source.FRTTaxApplicable,
        description: agency._source.typeDescription,
        status: agency._source.status,
      });
      show === 'show'?this.addAgencyForm.disable():this.addAgencyForm.enable();
    }
    const modalRef = this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }
  agencyMasters() {
    this.submitted = true;
    if (this.addAgencyForm.invalid) {
      return;
    }
    let newdata = {
      typeName: this.addAgencyForm.value.agencyTypeId,
      isNFDAAuto: this.addAgencyForm.value.isNFDAAuto,
      FRTTaxApplicable: this.addAgencyForm.value.FRTTaxApplicable,
      typeCategory: this.ref,
      orgId: '',
      tenantId: '',
      typeParentType: 'agency-type-master',
      typeDescription: this.addAgencyForm.value.description,
      typeRef: 'agency',
      typeRefId: '8',
      status: true,
    };
    if (!this.agencyIdToUpdate) {
      const data = [newdata];
      this.masterService.createSystemType(data).subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Added Successfully', '');
            this.onSave();
            var myInterval = setInterval(() => {
              this.getData();
              clearInterval(myInterval);
            }, 2000);
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
    } else {
      let newData = { ...newdata, systemtypeId: this.agencyIdToUpdate };
      const data = [newData];
      this.masterService.updateSystemType(data).subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Updated Successfully', '');
            this.onSave();
            var myInterval = setInterval(() => {
              this.getData();
              clearInterval(myInterval);
            }, 2000);
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
    }
  }
  changeStatus(data) {
    this.masterService
      .updateSystemType([{ ...data?._source, status: !data?._source?.status }])
      .subscribe(
        (res: any) => {
          if (res) {
            this.notification.create(
              'success',
              'Status Updated Successfully',
              ''
            );
            this.onSave();
            this.getData();
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
  }
  delete(deleteagency, id) {
    this.modalService
      .open(deleteagency, {
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
              this.getData();
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
    this.agencyIdToUpdate = null;
    this.addAgencyForm.reset();
    this.addAgencyForm.controls['status'].setValue(true);
    this.addAgencyForm.controls['isNFDAAuto'].setValue(false);
    this.submitted = false;
    this.modalService.dismissAll();
    return null;
  }

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.agencyData.map((row: any) => {
      storeEnquiryData.push({
        'Agency Type ID': row._source?.typeName,
        'Is NFDA Auto': row._source?.isNFDAAuto,
        'Created By': row._source?.createdBy,
        'Created DT': row._source?.createdDate,
        'Last Modified By': row._source?.updatedBy,
        'Last Modified Date': row._source?.updatedDate,
        'FRT Tax Applicable': row._source?.FRTTaxApplicable,
        'Description': row._source?.typeDescription,
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

    const fileName = 'agency-type.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  openPDF() {
    var prepare=[];
    this.agencyData.forEach(e=>{
      var tempObj =[];
      tempObj.push(e._source?.typeName);
      tempObj.push(e._source?.isNFDAAuto);
      tempObj.push(e._source?.createdBy);
      tempObj.push(this.datepipe.transform(e._source?.createdDate,"dd-MM-YYYY,hh:mm"));
      tempObj.push(e._source?.updatedBy);
      tempObj.push(this.datepipe.transform(e._source?.updatedDate,"dd-MM-YYYY,hh:mm"));
      tempObj.push(e._source?.FRTTaxApplicable);
      tempObj.push(e._source?.typeDescription);
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [397, 310]);
    autoTable(doc,{
        head: [['Agency Type ID','Is NFDA Auto','Created By','Created DT','Last Modified By','Last Modified Date','FRT Tax Applicable','Description']],
        body: prepare
    });
    doc.save('agency-type' + '.pdf');
  }
}
