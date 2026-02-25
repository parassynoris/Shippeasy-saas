import { Component, Output, OnInit, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { ApiService } from '../../principal/api.service';
import { CommonService } from 'src/app/services/common/common.service';
import { BaseBody } from '../../party-master/base-body';

@Component({
  selector: 'app-customer-gst',
  templateUrl: './customer-gst.component.html',
  styleUrls: ['./customer-gst.component.scss'],
})
export class CustomerGstComponent implements OnInit {
  baseBody: BaseBody = new BaseBody();
  currentUrl: any;
  urlParam: any;
  productForm: FormGroup;
  productIdToUpdate: string;
  productData = [];
  closeResult: string;
  toalLength: any;
  fromSize: number = 1;
  size = 10;
  page = 1;
  count = 0;
  submitted: any = false;
  @Output() EditAction = new EventEmitter();
  product_name: any;
  product_type: any;
  stolt_product_id: any;
  product_group: any;
  customerGSTForm: FormGroup;
  partyData: any = [];
  stateList: any[];
  custSearch: any;
  panSearch: any;
  stateSearch: any;
  selectCustomer: any;
  partyDataList: any;
  show: boolean = false;
  isEdit: boolean = false;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    public modalService: NgbModal,
    private mastersService: MastersService,
    public notification: NzNotificationService,
    public apiService: ApiService,
    private commonService: CommonService
  ) {
    this.formBuild()
    this.route.params?.subscribe((params) => (this.urlParam = params));
  }
  formBuild() {
    this.customerGSTForm = this.fb.group({
      gstCustomerName: ['', Validators.required],
      panNo: ['', Validators.required],
      groupCustomer: [false],
      mappingCustomerId: [''],
      gstNo: ['', Validators.required],
      state: ['', Validators.required],
      pinCode: ['', Validators.required],
      placeAddress: ['', Validators.required],
      plantName: [''],
      isSez: [false],
      status: [true]
    });
  }

  setVALUES(e) {
    if (!e) { return false }
    let customer = this.partyDataList.filter((x) => x?._source?.partymasterId === e)[0]
    this.selectCustomer = customer
    this.customerGSTForm.patchValue({
      panNo: customer?._source.panNo || '',
      state: customer?._source?.addressInfo?.stateId || '',
    
    });
  }

  onOpenProduct() {
    this.router.navigate(['/master/' + this.urlParam.key + '/add']);
  }

  onCloseNew() {
    this.router.navigate(['/master/' + this.urlParam.key]);
  }

  onEdit(id, show = 'edit') {
    this.router.navigate(['/master/' + this.urlParam.key + '/' + id + `/${show}`]);
  }

  ngOnInit(): void {
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();
    this.getStateList()
    this.getdata();
    this.getPartyMaster()

  }
  get f() {
    return this.customerGSTForm.controls;
  }

  getPartyMaster() {
    var parameter = {
      size:1000,
      sort: { createdOn: 'desc' },
      from: 0,
      "query": {
        "bool": {
          "must": [{"match":{
            status : true
          }}],
          "filter": [],
          "should": [],
          "must_not": [{
            "match":{
              "customerGST": true
            }
          }]
        }
      }
    }
    this.apiService?.getMasterList("partymaster", parameter)?.subscribe((data) => {
      this.partyDataList = data.hits.hits;
    });
  }
  getdata() {
    this.page = 1;
    var parameter = {
      size: Number(this.size),
      sort: { createdOn: 'desc' },
      from: this.page - 1,
      "query": {
        "bool": {
          "must": [{
            "match":{
              "customerGST": true
            }
          }],
          "filter": [],
          "should": [],
          "must_not": []
        }
      }
    }
    this.apiService?.getMasterList("partymaster", parameter)?.subscribe((data) => {
      this.partyData = data.hits.hits;
      this.toalLength = data.hits.total.value;
      this.count = data.hits.hits.length;
    });
  }
  getStateList() {
    this.stateList = [];
    this.baseBody = new BaseBody();
    let must = [{ "match": { "status": true } }];
    this.baseBody.baseBody.query.bool.must = must;
    this.commonService?.stateList(this.baseBody.baseBody)?.subscribe((data) => {
      this.stateList = data.hits.hits;
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
    this.getdata();
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
          must: [{
            "match":{
              "customerGST": true
            }
          }],
          filter: [],
          should: [],
          must_not: [],
        },
      },
    };
    this.apiService?.getMasterList("partymaster", parameter)?.subscribe((data) => {
      this.partyData = data.hits.hits;
      this.toalLength = data.hits.total.value;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count = type === 'prev' ? this.toalLength === this.count ? this.count - (this.toalLength % Number(this.size)) : this.count - data.hits.hits.length : this.count + data.hits.hits.length;
    });
  }
  clear() {
    this.custSearch = '';
    this.panSearch = '';
    this.stateSearch = '';
    this.getdata();
  }
  search() {
    let mustArray = [];
    mustArray.push({
      "match":{
        "customerGST": true
      }
    })
    if (this.custSearch) {
      mustArray.push({

        wildcard: {
          'name': "*" + this.custSearch.toLowerCase() + "*"
        },
      });
    }
    if (this.panSearch) {
      mustArray.push({

        match: {
          'gstNo':  this.panSearch
        },
      });
    }

    if (this.stateSearch) {
      mustArray.push({

        wildcard: {
          'addressInfo.stateName': "*" + this.stateSearch.toLowerCase() + "*"
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
    this.apiService?.getMasterList("partymaster", parameter)?.subscribe((data) => {
      this.partyData = data.hits.hits;
      this.toalLength = data.hits.total.value;
      this.count = data.hits.hits.length;
    });
  }

 

  deleteclause(id: any) {
    this.productData = this.productData?.filter((el) => el?._id !== id);
    alert('Item deleted!');
  }

  open(content, product?: any, show?) {
    this.show = false
    this.isEdit = false
    if(show){
      this.show = true
    }
    show === 'show' ? this.customerGSTForm.disable() : this.customerGSTForm.enable()
    if (product) {
      this.isEdit = true
      this.customerGSTForm.patchValue({
        gstCustomerName: product?._source.partymasterId,
        panNo: product?._source.panNo,
        groupCustomer: product?._source.groupCustomer,
        gstNo: product?._source.gstNo,
        state: product?._source?.addressInfo?.stateId,
        pinCode: product?._source?.addressInfo?.postalCode,
        placeAddress: product?._source.placeAddress,
        plantName: product?._source.plantName,
        isSez : product?._source.isSez,
        status : product?._source.statusGST,
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

  productMasters() {
    this.submitted = true;
    if (this.customerGSTForm.invalid) {
      return;
    }
    let customer = this.partyDataList.filter((x) => x?._source?.partymasterId === this.customerGSTForm.value.gstCustomerName)[0]
    this.selectCustomer = customer
    let newCostItems = this.selectCustomer._source;

    const dataWithUpdateID = {
      ...newCostItems,
      isSez: this.customerGSTForm.value.isSez,
      groupCustomer: this.customerGSTForm.value.groupCustomer,
      plantName: this.customerGSTForm.value.plantName,
      placeAddress: this.customerGSTForm.value.placeAddress,
      gstNo: this.customerGSTForm.value.gstNo,
      panNo: this.customerGSTForm.value.panNo,
      addressInfo: {
        ...newCostItems.addressInfo,
        stateId:  this.customerGSTForm.value.state,
        stateName: this.stateList.filter((x)=> x?._source?.stateId === this.customerGSTForm.value.state)[0]?._source.typeDescription,
        postalCode :  this.customerGSTForm.value.pinCode,
      },
      customerGST : true,
      statusGST : this.customerGSTForm.value.status
    };
   
    const data = [dataWithUpdateID];
    this.apiService.SaveOrUpdate('master/partymaster/update',data)?.subscribe((res: any) => {
      
      if (res) {
     
        setTimeout(() => {
          if(this.isEdit){
            this.notification.create(
              'success',
              'Updated Successfully',
              ''
            );
          }else{
            this.notification.create(
              'success',
              'Added Successfully',
              ''
            );
          }
          this.getdata();
          this.onSave();
        }, 1000);
       
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

  delete(deleteproduct, id) {
    this.modalService
      .open(deleteproduct, {
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
              productId: id._source.productId,
              searchKey: 'productId',
            };
            const body = [data];

            this.mastersService.deleteProduct(body).subscribe((res: any) => {

              if (res) {
                this.notification.create(
                  'success',
                  'Deleted Successfully',
                  ''
                );
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
  changeStatus(data) {
    this.apiService.SaveOrUpdate('master/partymaster/update',[{ ...data?._source, statusGST: !data?._source?.statusGST }]).subscribe((res: any) => {
      if (res) {
       
        setTimeout(() => {
          this.notification.create(
            'success',
            'Status Updated Successfully',
            ''
          );
        this.search();
        }, 1000);
      }
    }, error => {
      this.notification.create(
        'error',
        error?.error?.error?.message,
        ''
      );
    });
  }

  onSave() {
    this.getPartyMaster()
    this.productIdToUpdate = null;
    this.formBuild();
    this.submitted = false
    this.modalService.dismissAll();
    return null;
  }

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.productData.map((row: any) => {
      storeEnquiryData.push({
        'Product Name': row._source?.name,
        'Product Type': row._source?.panNo,
        'Product Group': row._source?.addressInfo?.stateName,
        'Status': row._source?.status ? 'Active' : 'In Active',
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

    const fileName = 'product.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  openPDF() {
    var prepare = [];
    this.productData.forEach(e => {
      var tempObj = [];
      tempObj.push(e._source?.name);
      tempObj.push(e._source?.panNo);
      tempObj.push(e._source?.addressInfo?.stateName);
      tempObj.push(e._source?.status ? 'Active' : 'In Active',)
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [297, 210]);
    autoTable(doc, {
      head: [['Customer Name', 'Pan No', 'State' , 'Status']],
      body: prepare
    });
    doc.save('product' + '.pdf');
  }
}
