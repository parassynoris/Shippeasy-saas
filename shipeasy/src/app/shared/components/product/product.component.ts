import { Component, Output, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { CommonService } from 'src/app/services/common/common.service';
import { Product } from 'src/app/models/product';
import { MastersSortPipe } from '../../util/mastersort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
})
export class ProductComponent implements OnInit {
  _gc=GlobalConstants;
  currentUrl: string;
  urlParam: Params | null = null;
  productForm: FormGroup;
  productIdToUpdate: string;
  productData : Product[] = [];
  closeResult: string;
  toalLength: number;
  fromSize: number = 1;
  size = 10;
  page = 1;
  count = 0;
  submitted: boolean = false;
  @Output() EditAction = new EventEmitter();
  product_name: string;
  product_type: string;
  stolt_product_id: string;
  product_group: string;
  yardcfs:any
  email:any
  dataSource = new MatTableDataSource<any>();
  displayedColumns = ['#','action','productName','hsCode','productType',];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort1!: MatSort;

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    public modalService: NgbModal,
    private mastersService: MastersService,
    public notification: NzNotificationService,
    public commonService : CommonService,
    private sortPipelist: MastersSortPipe,
    public loaderService: LoaderService,

  ) {
    this.route.params?.subscribe((params) => (this.urlParam = params));

  }

  vprouduct() {
    let payload = this.commonService?.filterList();
    if (payload?.query)payload.query = { }
      payload.sort = {
        "desc" : ["updatedOn"]
     }
     let mustArray = {};
     payload.query = mustArray
     this.commonService.getSTList('product', payload)?.subscribe((res:any) => {
      if (res && res.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1,
          productName: s.productName,
          productType: s.productType,
          customerName: s.customerName,
          hsCode: s.hsCode  
        }));
       
        
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1; 
      } else {
      }
    }, (error: any) => { 
    });
  }

  exportAsExcelFile1(): void {
    let storeEnquiryData = [];
    this.email.map((row: any) => {
      storeEnquiryData.push({
        'productName' : row?.element?.productName,
        'productType' : row?.element?.productType,
        'hsCode' : row?.element?.hsCode,
        'country' : row?.element?.country,
      });
    }
    );
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
  
    const fileName = '.xlsx';
    XLSX.writeFile(myworkbook, fileName);
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
  
  
    this.dataSource.filterPredicate = (data, filter) => {
      return JSON.stringify(data).toLowerCase().includes(filter);
    };
  
    this.dataSource.filter = filterValue;
  }

  displayedColumns1 = this.displayedColumns.map((x, i) => x + '_' + i);
  toggleFilters = true;
  filtersModel = [];
  filterKeys = {};
  searchColumns() {
    this.filterKeys = {};
    this.filtersModel.forEach((each, ind) => {
      if (each)
        this.filterKeys[this.displayedColumns[ind]] = {
          "$regex": each.toLowerCase(),
          "$options": "i"
        }
    });
    let payload = this.commonService.filterList()
    payload.query = this.filterKeys
    payload.sort = {
      "desc": ["updatedOn"]
    }
    this.commonService.getSTList("product", payload)?.subscribe((data) => {
      this.yardcfs = data.documents;
      this.dataSource = new MatTableDataSource(
        data?.documents?.map((s: any,index) => {
          return{
            ...s,
            id:index+1+this.from
          }
        })
      );
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort1;

    });


  }

  clearFilters() {
    this.filtersModel = [];
    this.filterKeys = {};
    this.getdata()
  }

  onOpenProduct() {
    this.router.navigate(['/master/' + this.urlParam.key + '/add']);
  }

  onCloseNew() {
    this.router.navigate(['/master/' + this.urlParam.key]);
  }

  onEdit(id,show?:any) {
    if(show){
    this.router.navigate(['/master/' + this.urlParam.key + '/' + id + '/show']);

    }
    else{
      this.router.navigate(['/master/' + this.urlParam.key + '/' + id + '/edit']);

    }
  }

  ngOnInit(): void {
    // this.vprouduct();
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();
    this.getdata();
    this.productForm = this.fb.group({
      productName: ['', [Validators.required]],
      productType: ['', [Validators.required]],
      Stolt_Product_id: ['', [Validators.required]],
    });
  }
  get f() {
    return this.productForm.controls;
  }
  sortList(array , key){
    return this.sortPipelist.transform(array, key);
   }
   pageNumber = 1;
   pageSize = 10;
   from = 0;
   totalCount = 0;
 
   onPageChange(event){
     this.pageNumber = event.pageIndex + 1;
     this.pageSize = event.pageSize;
     this.from = event.pageIndex*event.pageSize ;
     this.getdata();
   }
  getdata() {
    this.loaderService.showcircle();
    // this.page = 1;
    let payload = this.commonService.filterList()
    if (payload?.query)payload.query = { }
    if (payload?.size)payload.size= this.pageSize,
    payload.from=this.from
    if (payload?.sort)payload.sort = {
      "desc" : ["updatedOn"]
   }
   let mustArray = {};

   this.product_name = this.product_name?.trim();
   this.product_type = this.product_type?.trim();
   this.product_group = this.product_group?.trim();
   this.stolt_product_id = this.stolt_product_id?.trim();
   
   if (this.product_name) {
     mustArray['productName'] = {
       "$regex" : this.product_name,
       "$options": "i"
   }
   }

   if (this.product_type) {
     mustArray['productType'] = {
       "$regex" : this.product_type,
       "$options": "i"
   }
     if(this.product_type === 'NON'){
       // mustNot = []
     
     }else{
     mustArray["$and"] = [
       {
         "productType": {
           "$ne": "NON HAZ"
         }
       }
     ]
     }
    
   }

   if (this.product_group) {
     mustArray['customerName'] = {
       "$regex" : this.product_group,
       "$options": "i"
   }
   }
   if (this.stolt_product_id) {
     mustArray['saleName'] = {
       "$regex" : this.stolt_product_id,
       "$options": "i"
   }
   }

   if (payload?.query)payload.query = mustArray
    this.commonService.getSTList('product', payload)?.subscribe((data) => {
      this.productData = data.documents;
  
      
      
      if (data && data?.documents) {
        this.dataSource.data = data.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1+this.from,
          productName: s.productName,
          productType: s.productType,
          customerName: s.customerName 
          
        }));
        // this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1; 
        this.toalLength = data.totalCount;
      this.count = data.documents.length;
        this.loaderService.hidecircle();
      }

    },()=>{
      this.loaderService.hidecircle();
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
      let payload = this.commonService.filterList()
      if (payload?.query)payload.query = { }
      payload.sort = {
        "desc" : ["updatedOn"]
     }
     let mustArray = {};

     this.product_name = this.product_name?.trim();
     this.product_type = this.product_type?.trim();
     this.product_group = this.product_group?.trim();
     this.stolt_product_id = this.stolt_product_id?.trim();
     
     if (this.product_name) {
       mustArray['productName'] = {
         "$regex" : this.product_name,
         "$options": "i"
     }
     }
 
     if (this.product_type) {
       mustArray['productType'] = {
         "$regex" : this.product_type,
         "$options": "i"
     }
       if(this.product_type === 'NON'){
         // mustNot = []
       
       }else{
       mustArray["$and"] = [
         {
           "productType": {
             "$ne": "NON HAZ"
           }
         }
       ]
       }
      
     }
 
     if (this.product_group) {
       mustArray['customerName'] = {
         "$regex" : this.product_group,
         "$options": "i"
     }
     }
     if (this.stolt_product_id) {
       mustArray['saleName'] = {
         "$regex" : this.stolt_product_id,
         "$options": "i"
     }
     }

     if (payload?.query)payload.query = mustArray
      this.commonService.getSTList('product', payload)?.subscribe((data) => {
      this.productData = data.documents;
      this.toalLength = data.totalCount;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count = type === 'prev' ? this.toalLength === this.count ? this.count -  ((this.toalLength % Number(this.size))>0?(this.toalLength % Number(this.size)):(Number(this.size))) : this.count - data.documents.length : this.count + data.documents.length;
    });
  }

  search() {
    let mustArray = {};

    this.product_name = this.product_name?.trim();
    this.product_type = this.product_type?.trim();
    this.product_group = this.product_group?.trim();
    this.stolt_product_id = this.stolt_product_id?.trim();
    
    if (this.product_name) {
      mustArray['productName'] = {
        "$regex" : this.product_name,
        "$options": "i"
    }
    }

    if (this.product_type) {
      mustArray['productType'] = {
        "$regex" : this.product_type,
        "$options": "i"
    }
      if(this.product_type === 'NON'){
        // mustNot = []
      
      }else{
      mustArray["$and"] = [
        {
          "productType": {
            "$ne": "NON HAZ"
          }
        }
      ]
      }
     
    }

    if (this.product_group) {
      mustArray['customerName'] = {
        "$regex" : this.product_group,
        "$options": "i"
    }
    }
    if (this.stolt_product_id) {
      mustArray['saleName'] = {
        "$regex" : this.stolt_product_id,
        "$options": "i"
    }
    }
    

    let payload = this.commonService.filterList()
    if (payload?.query)payload.query = mustArray
    payload.sort = {
      "desc" : ["updatedOn"]
   }
    this.commonService.getSTList('product', payload)?.subscribe((data) => {
      this.productData = data.documents;
      this.toalLength = data.totalCount;
      this.count = data.documents.length;
      this.fromSize =1
    });
  }

  clear() {
    this.product_name = '';
    this.product_type = '';
    this.stolt_product_id = '';
    this.product_group = ''
    this.getdata();
  }

  deleteclause(id: any) {
    this.productData = this.productData.filter((el) => el?._id !== id);
    alert('Item deleted!');
  }

  open(content, product?: any) {
    if (product) {
      this.productIdToUpdate = product?._source.productId;
      this.productForm.patchValue({
        productName: product._source.productName,
        productType: product._source.productType,
        Stolt_Product_id: product._source.Stolt_Product_id,
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
    if (this.productForm.invalid) {
      return;
    }
    let newCostItems = this.productForm.value;

    if (!this.productIdToUpdate) {
    
    } else {
      const dataWithUpdateID = {
        ...newCostItems,
        productId: this.productIdToUpdate,
      };
      this.commonService.UpdateToST(`product/${dataWithUpdateID.productId}`,dataWithUpdateID)?.subscribe((res: any) => {
        if (res) {
          this.notification.create(
            'success',
            'Updated Successfully',
            ''
          );
          this.getdata();
          this.onSave();
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
            let data =  'productId' +  id._source.productId

            this.commonService.deleteST(data)?.subscribe((res: any) => {

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
    this.commonService.UpdateToST(`product/${data.productId}`,{ ...data, status: !data?._source?.status })?.subscribe((res: any) => {
      if (res) {
        this.notification.create(
          'success',
          'Status Updated Successfully',
          ''
        );
        this.search();
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
    this.productIdToUpdate = null;
    this.productForm.reset();
    this.submitted = false
    this.modalService.dismissAll();
    return null;
  }

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.productData.map((row: any) => {
      storeEnquiryData.push({
        'Product Name': row.productName,
        'Product Type': row.productType,
        'Customer Name': row.customerName,
        'hsCode' : row?.element?.hsCode,
        'Status': row._source?.status?'Active':'InActive',
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
    const prepare=[];
    this.productData.forEach(e=>{
      let tempObj =[];
      tempObj.push(e.productName);
      tempObj.push(e.productType);
      tempObj.push(e.customerName);
      tempObj.push(e.hsCode);
      tempObj.push(e.status?'Active':'InActive');
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [297, 210]);
    autoTable(doc,{
        head: [['Product Name','Product Type','Customer Name','HS Code','Status']],
        body: prepare,
        didDrawCell: (data) => {
          // Draw border lines for each cell
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'S');
      }
    });
    doc.save('product' + '.pdf');
  }
}
