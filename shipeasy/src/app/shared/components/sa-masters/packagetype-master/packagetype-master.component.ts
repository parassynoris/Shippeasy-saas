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
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-packagetype-master',
  templateUrl: './packagetype-master.component.html',
  styleUrls: ['./packagetype-master.component.css'],
})
export class PackagetypeMasterComponent implements OnInit {
  packageData: any = [];
  addPackageForm: FormGroup;
  packageIdToUpdate: string;
  closeResult: string;
  toalLength: any;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  package_code: any;
  package_description: any;
  last_updated: any;
  last_id: any;
  submitted: any = false;
  ref='packageType';
  isSearchable: boolean = false;
  isClearable: boolean = false;
  show: any;

  constructor(
    private modalService: NgbModal,
    private masterService: MastersService,
    private fb: FormBuilder,
    private notification: NzNotificationService,
    public datepipe: DatePipe,
  ) {
    this.addPackageForm = this.fb.group({
      packageCode: new FormControl('', Validators.required),
      packageDescription: new FormControl('', Validators.required),
      status: new FormControl(''),
     
    });
  }
  get f() {
    return this.addPackageForm.controls;
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.getData();
    }, 500);
  }
  deleteclause(id: any) {
    alert('Item deleted!');
  }
  getData() {
    let body = {
      _source: [],
      size: Number(this.size),
      from: this.page - 1,
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
    this.masterService.systemtypeList(body).subscribe((res: any) => {

      this.packageData = res.hits.hits;
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
      this.packageData = data.hits.hits;
      this.toalLength = data.hits.total.value;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count = type === 'prev' ? this.toalLength === this.count ? this.count - (this.toalLength % Number(this.size)) : this.count - data.hits.hits.length : this.count + data.hits.hits.length;
    });
  }

  open(content, packages?: any,show?) {
    this.show = show;
    if (packages) {
      this.packageIdToUpdate = packages._source.systemtypeId;
      this.addPackageForm.patchValue({
        packageCode: packages._source.typeName,
        packageDescription: packages._source.typeDescription,
        status: packages._source.status,
   
      });
      show === 'show'?this.addPackageForm.disable():this.addPackageForm.enable();
    }
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }
  packageMasters() {
    this.submitted = true;
    if (this.addPackageForm.invalid) {
      return;
    }
    let newdata = {
     typeName:this.addPackageForm.value.packageCode,
      typeCategory: this.ref,
      orgId: '',
      tenantId: '',
      typeParentType: 'package-type-master',
      typeDescription:this.addPackageForm.value.packageDescription,
      typeRef:'package',
      typeRefId:'7',
      status: true
    };
    if (!this.packageIdToUpdate) {

      const data = [newdata];
      this.masterService.createSystemType(data).subscribe((res: any) => {
        if(res)
        {
          this.notification.create(
            'success',
            'Added Successfully',
            ''
          );
          this.onSave();
        this.getData();
        }
      }, error => {
        this.onSave();
        this.notification.create(
          'error',
          error?.error?.error?.message,
          ''
        );
      });
    } else {
      let newData = { ...newdata, systemtypeId: this.packageIdToUpdate };
      const data = [newData];
      this.masterService.updateSystemType(data).subscribe((res: any) => {
        if(res)
        {
          this.notification.create(
            'success',
            'Updated Successfully',
            ''
          );
          this.onSave();
        this.getData();
        }
      }, error => {
        this.onSave();
        this.notification.create(
          'error',
          error?.error?.error?.message,
          ''
        );
      });
    }
  }
  changeStatus(data){
    this.masterService.updateSystemType([{...data?._source, status: !data?._source?.status}]).subscribe((res: any) => {
      if(res)
      {
        this.notification.create(
          'success',
          'Status Updated Successfully',
          ''
        );
        this.onSave();
      this.getData();
      }
    }, error => {
      this.onSave();
      this.notification.create(
        'error',
        error?.error?.error?.message,
        ''
      );
    });
  }
  delete(deletepackages, id) {
    this.modalService
      .open(deletepackages, {
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
                this.notification.create(
                  'success',
                  'Deleted Successfully',
                  ''
                );
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
    this.packageIdToUpdate = null;
    this.addPackageForm.reset();
    this.submitted=false
    this.modalService.dismissAll();
    return null;
  }

  search() {
    if(!this.isSearchable){
      return;
    }
    this.isSearchable = false;
    this.isClearable = true;

    let mustArray = [];
    mustArray.push({
      match: {
        typeCategory: this.ref,
      },
    })
    let mustArray1 = [];
    if (this.package_code) {
      mustArray.push({
        wildcard: {
          'typeName': "*" + this.package_code.toLowerCase() + "*"
        },
      }
      );
    }
    if (this.package_description) {
      mustArray.push({
        wildcard: {
          'typeDescription': "*" + this.package_description.toLowerCase() + "*"
        },
      }
      );
    }

    if (this.last_updated) {
      mustArray.push({
        range: {
          updatedDate: {
            gte: this.last_updated + 'T00:00:00.000Z',
            lt: this.last_updated + 'T23:59:00.000Z',
          },
        },
      }
      );

    }

    if (this.last_id) {
      mustArray.push({
        wildcard: {
          'updatedBy': "*" + this.last_id.toLowerCase() + "*"
        },
      }
      );
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
      this.packageData = res.hits.hits;
      this.toalLength = res.hits.total.value;
      this.count = res.hits.hits.length;
    });
  }

  clear() {
    this.package_code = '';
    this.package_description = '';
    this.last_updated = '';
    this.last_id = '';
    if(!this.isClearable){
      return;
    }
    this.isClearable = false;
    this.getData();
  }

  searchDataChange(){
    this.isSearchable = true;
  }

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.packageData.map((row: any) => {
      storeEnquiryData.push({
        'Package Code': row._source?.typeName,
        'Package Description': row._source?.typeDescription,
        'Last Update': row._source?.updatedDate,
        'Last Update User ID': row._source?.updatedBy,
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

    const fileName = 'package-type-master.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  openPDF() {
    var prepare=[];
    this.packageData.forEach(e=>{
      var tempObj =[];
      tempObj.push(e._source?.typeName);
      tempObj.push(e._source?.typeDescription);
      tempObj.push(this.datepipe.transform(e._source?.updatedDate,"dd-MM-YYYY,hh:mm"));
      tempObj.push(e._source?.updatedBy);
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [297, 210]);
    autoTable(doc,{
        head: [['Package Code','Package Description','Last Update','Last Update User ID']],
        body: prepare
    });
    doc.save('package-type-master' + '.pdf');
  }
}
