import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { DatePipe } from '@angular/common';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
@Component({
  selector: 'app-category-master',
  templateUrl: './category-master.component.html',
  styleUrls: ['./category-master.component.css'],
})
export class CategoryMasterComponent implements OnInit {
  categoryData: any = [];
  addCategoryForm: FormGroup;
  categoryIdToUpdate: string;
  closeResult: string;
  toalLength: any;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  submitted: any = false;
  name: any;
  last_update: any;
  last_update_user: any;
  service_id: any;
  Created_by: any;
  created_date: any;
  seq_no: any;
  only_flag: any;
  principle_pld: any;
  ref = 'category';
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
    this.addCategoryForm = this.fb.group({
      categoryName: new FormControl('', Validators.required),
      serviceId: new FormControl('', Validators.required),
      seqNo: new FormControl('', Validators.required),
      status: new FormControl('', Validators.required),
      QuoteOnlyFlag: new FormControl(''),
      isPrincipalPLD: new FormControl(false),
    });
  }

  ngOnInit(): void {
    this.getData();
  }
  deleteclause(id: any) {
    alert('Item deleted!');
  }
  get f() {
    return this.addCategoryForm.controls;
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
    this.masterService.systemtypeList(body).subscribe((res: any) => {

      this.categoryData = res.hits.hits;
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
      this.categoryData = data.hits.hits;
      this.toalLength = data.hits.total.value;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count = type === 'prev' ? this.toalLength === this.count ? this.count - (this.toalLength % Number(this.size)) : this.count - data.hits.hits.length : this.count + data.hits.hits.length;
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
    })
    let mustArray1 = [];
    if (this.name) {
      mustArray.push({
        wildcard: {
          'typeName': "*" + this.name.toLowerCase() + "*"
        },
      }
      );
    }
    if (this.last_update) {
      mustArray.push({
        range: {
          updatedDate: {
            gte: this.last_update + 'T00:00:00.000Z',
            lt: this.last_update + 'T23:59:00.000Z',
          },
        },
      }
      );
    }
    if (this.last_update_user) {
      mustArray.push({
        wildcard: {
          'updatedBy': "*" + this.last_update_user.toLowerCase() + "*"
        },
      }
      );
    }
    if (this.service_id) {
      mustArray.push({
        wildcard: {
          'serviceId': "*" + this.service_id.toLowerCase() + "*"
        },
      }
      );
    }
    if (this.Created_by) {
      mustArray.push({
        wildcard: {
          'createdBy': "*" + this.Created_by.toLowerCase() + "*"
        },
      }
      );
    }
    if (this.created_date) {
      mustArray.push({
        range: {
          createdDate: {
            gte: this.created_date + 'T00:00:00.000Z',
            lt: this.created_date + 'T23:59:00.000Z',
          },
        },
      }
      );
    }
    if (this.seq_no) {
      mustArray.push({
        wildcard: {
          'seqNo': "*" + this.seq_no.toLowerCase() + "*"
        },
      }
      );
    }
    if (this.only_flag) {
      mustArray.push({
        wildcard: {
          'QuoteOnlyFlag': "*" + this.only_flag.toLowerCase() + "*"
        },
      }
      );
    }
    if (this.principle_pld) {
      mustArray.push({
        wildcard: {
          'isPrincipalPLD': "*" + this.principle_pld.toLowerCase() + "*"
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
      this.categoryData = res.hits.hits;
      this.toalLength = res.hits.total.value;
      this.count = res.hits.hits.length;
    });
  }

  clear() {
    this.name = '';
    this.last_update = '';
    this.last_update_user = '';
    this.service_id = '';
    this.Created_by = '';
    this.created_date = '';
    this.seq_no = '';
    this.only_flag = '';
    this.principle_pld = '';
    if (!this.isClearable) {
      return;
    }
    this.isClearable = false;
    this.getData();
  }

  searchDataChange() {
    this.isSearchable = true;
  }

  open(content, category?: any,show?) {
    this.show = show
    if (category) {
      this.categoryIdToUpdate = category._source.systemtypeId;
      this.addCategoryForm.patchValue({
        categoryName: category._source.typeName,
        serviceId: category._source.serviceId,
        seqNo: category._source.seqNo,
        QuoteOnlyFlag: category._source.QuoteOnlyFlag,
        isPrincipalPLD: category._source.isPrincipalPLD,
        status: category._source.status,
      });
      show === 'show'?this.addCategoryForm.disable():this.addCategoryForm.enable();
    }
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }
  categoryMasters() {
    this.submitted = true;
    if (this.addCategoryForm.invalid) {
      return;
    }
    let newdata = {
      typeName: this.addCategoryForm.value.categoryName,
      serviceId: this.addCategoryForm.value.serviceId,
      seqNo: this.addCategoryForm.value.seqNo,
      QuoteOnlyFlag: this.addCategoryForm.value.QuoteOnlyFlag,
      isPrincipalPLD: this.addCategoryForm.value.isPrincipalPLD,
      typeCategory: this.ref,
      orgId: '',
      tenantId: '',
      typeParentType: 'category-master',
      typeDescription: 'category master',
      typeRef: 'category',
      typeRefId: '9',
      status: true
    };
    if (!this.categoryIdToUpdate) {
      const data = [newdata];
      this.masterService.createSystemType(data).subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Added Successfully', '');
            this.onSave();
            this.getData();
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
    } else {
      let newData = { ...newdata, systemtypeId: this.categoryIdToUpdate };
      const data = [newData];
      this.masterService.updateSystemType(data).subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Updated Successfully', '');
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
  }
  changeStatus(data) {
    this.masterService.updateSystemType([{ ...data?._source, status: !data?._source?.status }]).subscribe((res: any) => {
      if (res) {
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
  delete(deletecategory, id) {
    this.modalService
      .open(deletecategory, {
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
                this.getData()

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
    this.categoryIdToUpdate = null;
    this.addCategoryForm.reset();
    this.addCategoryForm.controls['isPrincipalPLD'].setValue(false)
    this.submitted = false
    this.modalService.dismissAll();
    return null;
  }

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.categoryData.map((row: any) => {
      storeEnquiryData.push({
        'Category Name': row._source?.typeName,
        'Last Update': row._source?.updatedDate,
        'Last Update User Id': row._source?.updatedBy,
        'Service ID': row._source?.serviceId,
        'Created By': row._source?.createdBy,
        'Created Date': row._source?.createdDate,
        'Seq No.': row._source?.seqNo,
        'Quote Only Flag': row._source?.QuoteOnlyFlag,
        'Is Principal PLD': row._source?.isPrincipalPLD,
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

    const fileName = 'catagory-master.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  openPDF() {
    var prepare=[];
    this.categoryData.forEach(e=>{
      var tempObj =[];
      tempObj.push(e._source?.typeName);
      tempObj.push(this.datepipe.transform(e._source?.updatedDate,"dd-MM-YYYY,hh:mm"));
      tempObj.push(e._source?.updatedBy);
      tempObj.push(e._source?.serviceId);
      tempObj.push(e._source?.createdBy);
      tempObj.push(this.datepipe.transform(e._source?.createdDate,"dd-MM-YYYY,hh:mm"));
      tempObj.push(e._source?.seqNo);
      tempObj.push(e._source?.QuoteOnlyFlag);
      tempObj.push(e._source?.isPrincipalPLD);
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [397, 310]);
    autoTable(doc,{
        head: [['Category Name','Last Update','Last Update User Id','Service ID','Created By','Created Date','Seq No.','Quote Only Flag','Is Principal PLD']],
        body: prepare
    });
    doc.save('catagory-master' + '.pdf');
  }
}
