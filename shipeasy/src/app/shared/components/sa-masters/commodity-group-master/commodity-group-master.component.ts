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
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'

@Component({
  selector: 'app-commodity-group-master',
  templateUrl: './commodity-group-master.component.html',
  styleUrls: ['./commodity-group-master.component.css'],
})
export class CommodityGroupMasterComponent implements OnInit {
  commodityData: any = [];
  addCommodityForm: FormGroup;
  closeResult: string;
  commodityIdToUpdate: string;
  toalLength: any;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  submitted: any = false;
  code: any;
  name: any;
  description: any;
  last_update: any;
  last_update_id: any;
  is_restricted: any;
  main_group: any;
  ref='commodityGroup';
  isSearchable: boolean = false;
  isClearable: boolean = false;
  show: any;

  constructor(
    private modalService: NgbModal,
    private masterService: MastersService,
    private fb: FormBuilder,
    private notification: NzNotificationService
  ) {
    this.addCommodityForm = this.fb.group({
      commodityCode: new FormControl('', Validators.required),
      commodityName: new FormControl('', Validators.required),
      commodityDescription: new FormControl(''),
      isRestricted: new FormControl(false),
      mainGroup: new FormControl(''),
    });
  }

  ngOnInit(): void {
    this.getData();
  }
  deleteclause(id: any) {
    alert('Item deleted!');
  }
  get f() {
    return this.addCommodityForm.controls;
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
    this.masterService.systemtypeList(body)?.subscribe((res: any) => {
    
      this.commodityData = res.hits.hits;
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
      this.commodityData = data.hits.hits;
      this.toalLength = data.hits.total.value;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count = type === 'prev' ? this.toalLength === this.count ? this.count - (this.toalLength % Number(this.size)) : this.count - data.hits.hits.length : this.count + data.hits.hits.length;
    });
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
    if (this.code) {
      mustArray.push({
       
        match: {
          'commodityCode':this.code
        },
      }
      );
    }
    if (this.name) {
      mustArray.push({
      
        wildcard: {
          'typeName': "*"+this.name.toLowerCase()+"*"
        },
      }
      );
    }
    if (this.description) {
      mustArray.push({
       
        wildcard: {
          'typeDescription': "*"+this.description.toLowerCase()+"*"
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
    if (this.last_update_id) {
      mustArray.push({
       
        wildcard: {
          'lastUpdatedUserId': "*"+this.last_update_id.toLowerCase()+"*"
        },
      }
      );
    }
    if (this.is_restricted) {
      mustArray.push({
               match: {
          'isRestricted':this.is_restricted
        },
      }
      );
    }
    if (this.main_group) {
      mustArray.push({
       
        wildcard: {
          'mainGroup': "*"+this.main_group.toLowerCase()+"*"
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
      this.commodityData = res.hits.hits;
      this.toalLength = res.hits.total.value;
      this.count = res.hits.hits.length;
    });
  }

  clear() {
    this.code = '';
    this.name = '';
    this.description = '';
    this.last_update = '';
    this.last_update_id = '';
    this.is_restricted = '';
    this.main_group = '';
    if(!this.isClearable){
      return;
    }
    this.isClearable = false;
    this.getData();
  }

  searchDataChange(){
    this.isSearchable = true;
  }

  open(content, commodity?: any,show?) {
    this.show = show;
    if (commodity) {
      this.commodityIdToUpdate = commodity._source.systemtypeId;
      this.addCommodityForm.patchValue({
        commodityCode: commodity._source.commodityCode,
        commodityName: commodity._source.typeName,
        commodityDescription: commodity._source.typeDescription,
        isRestricted: commodity._source.isRestricted,
        mainGroup: commodity._source.mainGroup,
      });
      show === 'show'?this.addCommodityForm.disable():this.addCommodityForm.enable()
    }
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }
  commodityMasters() {
    this.submitted = true;
    if (this.addCommodityForm.invalid) {
      return;
    }
    let newdata = {
      typeName:this.addCommodityForm.value.commodityName,
      commodityCode: this.addCommodityForm.value.commodityCode,
      isRestricted: this.addCommodityForm.value.isRestricted,
        mainGroup: this.addCommodityForm.value.mainGroup,
      typeCategory: this.ref,
      orgId: '',
      tenantId: '',
      typeParentType: 'commodity-group-master',
      typeDescription: this.addCommodityForm.value.commodityDescription,
      typeRef: 'category',
      typeRefId: '9',
      status: true
    };
    if (!this.commodityIdToUpdate) {
     
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
      let newData = { ...newdata, systemtypeId: this.commodityIdToUpdate };
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
  delete(deletecommodity, id) {
    this.modalService
      .open(deletecommodity, {
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
                this.clear();
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
    this.modalService.dismissAll();
    this.commodityIdToUpdate=null;
    this.addCommodityForm.reset();
    this.addCommodityForm.controls['isRestricted'].setValue(false);
    this.submitted=false
    return null;
  }

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.commodityData.map((row: any) => {
      storeEnquiryData.push({
        'Commodity Code': row._source?.commodityCode,
        'Commodity Name': row._source?.typeName,
        'Commodity Description': row._source?.typeDescription,
        'Last Update': row._source?.updatedDate,
        'Last Update User ID': row._source?.updatedBy,
        'Is Restricted': row._source?.isRestricted,
        'Main Group': row._source?.mainGroup,
        
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

    const fileName = 'commodity-group-master.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  openPDF() {
    var prepare=[];
    this.commodityData.forEach(e=>{
      var tempObj =[];
      tempObj.push(e._source?.commodityCode);
      tempObj.push(e._source?.typeName);
      tempObj.push(e._source?.typeDescription);
      tempObj.push(e._source?.updatedDate);
      tempObj.push(e._source?.updatedBy);
      tempObj.push(e._source?.isRestricted);
      tempObj.push(e._source?.mainGroup);
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [397, 310]);
    autoTable(doc,{
        head: [['Commodity Code','Commodity Name','Commodity Description','Last Update','Last Update User ID','Is Restricted','Main Group']],
        body: prepare
    });
    doc.save('commodity-group-master' + '.pdf');
  }
}
