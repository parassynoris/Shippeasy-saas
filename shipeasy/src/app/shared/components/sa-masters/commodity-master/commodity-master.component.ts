import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { DatePipe } from '@angular/common'

@Component({
  selector: 'app-commodity-master',
  templateUrl: './commodity-master.component.html',
  styleUrls: ['./commodity-master.component.css'],
})
export class CommodityMasterComponent implements OnInit {
  addCommodityForm: FormGroup;
  commodityData: any = []
  commodityIdToUpdate: string
  closeResult: string
  submitted: any = false;
  toalLength: any;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  name: any;
  description: any;
  code: any;
  last_update: any;
  last_update_id: any;
  imco_class: any;
  un_number: any;
  show: any;

  constructor(
    private modalService: NgbModal,
    private SAMasterservice: SaMasterService,
    private fb: FormBuilder,
    private notification: NzNotificationService,
    public datepipe: DatePipe
  ) {
    this.addCommodityForm = this.fb.group({
      commodityName: new FormControl(''),
      productName: new FormControl('', Validators.required),
      productDescription: new FormControl(''),
      commodityCode: new FormControl(''),
      imcoClass: new FormControl(''),
      unMaster: new FormControl(''),
      status: new FormControl(true),
    });
  }

  ngOnInit(): void {
    this.getData();
  }

  get f() { return this.addCommodityForm.controls; }

  getData() {
    this.commodityData = [];
    var body = {
      "size": Number(this.size),
      "from": this.page - 1,
      "sort": { createdOn: 'desc' },
      "query": {
        "bool": {
          "must": [],
          "filter": [],
          "should": [],
          "must_not": []
        }
      }
    }
    this.SAMasterservice.commodityList(body)?.subscribe((res: any) => {
      this.commodityData = res.hits.hits;
      this.toalLength = res.hits.total.value;
      this.count = res.hits.hits.length;
    });
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

  filter(e) {
    this.size = e.target.value;
    this.fromSize = 1;
    this.getData()
  }

  getPaginationData(type: any) {
    this.fromSize = type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
    var parameter = {
      "size": Number(this.size),
      "from": this.fromSize - 1,
      sort: { createdOn: 'desc' },
      "query": {
        "bool": {
          "must": [
          ],
          "filter": [],
          "should": [],
          "must_not": []
        }
      }
    }
    this.SAMasterservice.commodityList(parameter).subscribe(data => {
      this.commodityData = data.hits.hits;
      this.toalLength = data.hits.total.value;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count = type === 'prev' ? this.toalLength === this.count ? data.hits.hits.length : this.count - data.hits.hits.length : this.count + data.hits.hits.length
    })
  }

  search() {
    let mustArray = [];
    let mustArray1 = [];
    if (this.name) {
      mustArray.push({
        wildcard: {
          'productName': "*"+this.name.toLowerCase()+"*"
        },
      })
    }
    if (this.description) {
      mustArray.push({
        wildcard: {
          'productDescription': "*"+this.description.toLowerCase()+"*"
        },
      })
    }
    if (this.code) {
      mustArray.push({
        wildcard: {
          'commodityCode': "*"+this.code.toLowerCase()+"*"
        },
      })
    }
    if (this.last_update) {
      mustArray.push({
        "range": {
          "updatedOn": {
            "gte": this.last_update + "T00:00:00.000Z",
            "lt": this.last_update + "T23:59:00.000Z",
          }
        }
      })
    }
    if (this.last_update_id) {
      mustArray.push({
        wildcard: {
          'updatedBy': "*"+this.last_update_id.toLowerCase()+"*"
        },
      })
    }
    if (this.imco_class) {
      mustArray.push({
        wildcard: {
          'imcoClass': "*"+this.imco_class.toLowerCase()+"*"
        },
      })
    }
    if (this.un_number) {
      mustArray.push({
        wildcard: {
          'unMaster': "*"+this.un_number.toLowerCase()+"*"
        },

      })
    }

    var parameter = {
      "size": Number(this.size),
      "from": this.fromSize - 1,
      sort: { createdOn: 'desc' },
      "query": {
        "bool": {
          "should": mustArray1,
          "must": mustArray
        }
      }
    }
    this.commodityData = [];
    this.SAMasterservice.commodityList(parameter).subscribe((res: any) => {

      this.commodityData = res.hits.hits;
      this.toalLength = res.hits.total.value;
      this.count = res.hits.hits.length;
   
    })
  }

  clear() {
    this.name = '';
    this.description = '';
    this.code = '';
    this.last_update = '';
    this.last_update_id = '';
    this.imco_class = '';
    this.un_number = '';
    this.getData();
  }

  open(content, commodity?: any,show?) {
    this.show = show
    if (commodity) {
      this.commodityIdToUpdate = commodity._source.commodityId
      this.addCommodityForm.patchValue({
        productName: commodity._source.productName,
        productDescription: commodity._source.productDescription,
        commodityCode: commodity._source.commodityCode,
      
        imcoClass: commodity._source.imcoClass,
        unMaster: commodity._source.unMaster,
        status: commodity._source.status,
      })
    }
    show === 'show'?this.addCommodityForm.disable():this.addCommodityForm.enable();

    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }
  commodityMasters() {
    this.submitted = true
    if (this.addCommodityForm.invalid) {
      return;
    }
    let newdata = {
      tenantId: '',
      orgId: '',
      productName: this.addCommodityForm.get('productName').value,
      commodityName: this.addCommodityForm.get('productName').value,
      productDescription: this.addCommodityForm.get('productDescription').value,
      commodityCode: this.addCommodityForm.get('commodityCode').value,
      imcoClass: this.addCommodityForm.get('imcoClass').value,
      unMaster: this.addCommodityForm.get('unMaster').value,
      status: this.addCommodityForm.get('status').value,
    }
    let newCommodity = newdata;
    if (!this.commodityIdToUpdate) {
      const data = [newCommodity];
      this.SAMasterservice.createCommodity(data).subscribe((res: any) => {
        if (res) {
          this.notification.create(
            'success',
            'Added Successfully',
            ''
          );
          this.onSave();
          this.clear();
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
    else {
    
      const dataWithUpdateId = { ...newCommodity, commodityId: this.commodityIdToUpdate };
      const data = [dataWithUpdateId];
      this.SAMasterservice.updateCommodity(data).subscribe((res: any) => {
        if (res) {
          this.notification.create(
            'success',
            'Updated Successfully',
            ''
          );
          this.onSave();
          this.clear();
        }
      }, error => {
        this.onSave();
        this.notification.create(
          'error',
          error?.error?.error?.message,
          ''
        );
      })
    }

  }
  delete(deletecommodity, id) {
    this.modalService.open(deletecommodity, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: '',

      ariaLabelledBy: 'modal-basic-title'
    }).result.then((result) => {

      this.closeResult = `Closed with: ${result}`;
      if (result === 'yes') {

        let data = {
          commodityId: id._source.commodityId,
          searchKey: "commodityId"
        }
        const body = [data]


        this.SAMasterservice.deleteCommodity(body).subscribe((res: any) => {
          if (res) {
            this.notification.create(
              'success',
              'Deleted Successfully',
              ''
            );
            this.clear();
          }
        })

      }
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });

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
    this.commodityIdToUpdate = null;
    this.addCommodityForm.reset()
    this.submitted = false
    this.modalService.dismissAll();
    return null;
  }
  changeStatus(data) {
    this.SAMasterservice.updateCommodity([{ ...data?._source, status: !data?._source?.status }]).subscribe((res: any) => {
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

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.commodityData.map((row: any) => {
      storeEnquiryData.push({
        'Product Name': row._source?.productName,
        'Product Desc': row._source?.productDescription,
        'Commodity Code': row._source?.commodityCode,
        'Last Update': this.datepipe.transform(row._source?.updatedOn,'dd-MM-YYYY,hh:mm a') ,
        'Last Update User Id': row._source?.updatedBy,
        'Imco Class': row._source?.imcoClass,
        'Un Number': row._source?.unMaster,
        'Status': row._source?.status ? 'Active': "InActive"
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

    const fileName = 'commodity-master.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }
  openPDF() {
    var prepare=[];
    this.commodityData.forEach(e=>{
      var tempObj =[];
      tempObj.push(e._source?.productName);
      tempObj.push(e._source?.productDescription);
      tempObj.push(e._source?.commodityCode);
      tempObj.push(this.datepipe.transform(e._source?.updatedOn,'dd-MM-YYYY,hh:mm'));
      tempObj.push(e._source?.updatedBy);
      tempObj.push(e._source?.imcoClass);
      tempObj.push(e._source?.unMaster);
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [397, 310]);
    autoTable(doc,{
        head: [['Product Name','Product Desc','Commodity Code','Last Update','Last Update User Id','Imco Class','Un Number']],
        body: prepare
    });
    doc.save('commodity-master' + '.pdf');
  }
}
