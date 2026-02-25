import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { DatePipe } from '@angular/common'
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { CommonService } from 'src/app/services/common/common.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { CountryData } from 'src/app/models/city-master';
import { Currency } from 'src/app/models/shipping-line';
import { MastersSortPipe } from 'src/app/shared/util/mastersort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';

@Component({
  selector: 'app-currency-master',
  templateUrl: './currency-master.component.html',
  styleUrls: ['./currency-master.component.scss'],
})
export class CurrencyMasterComponent implements OnInit {
  _gc=GlobalConstants;
  addCurrencyForm: FormGroup;
  currencyData: Currency[] = [];
  currencyIdToUpdate: string;
  closeResult: string;
  toalLength: number;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  submitted: boolean = false;
  description: string;
  decimal_name: string;
  currency_code: string;
  last_date: string;
  last_updated_user: string;
  short_name: string;
  countryData: CountryData[] = [];
  show: string;
  tenantId: string;

  dataSource = new MatTableDataSource();
  pagenation = [10,20, 50, 100];
  email:any
  yardcfs:any
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns =[
    '#', 
    'action',
   'currencyShortName',
  //  'updatedOn',
   'updatedBy'
  ];
  isMaster: boolean = false;

  constructor(
    public modalService: NgbModal,
    private saMasterService: SaMasterService,
    private fb: FormBuilder,
    public notification: NzNotificationService,
    private profileService: ProfilesService,
    public datepipe: DatePipe,
    private commonfunction: CommonFunctions,private cognito : CognitoService,
    public commonService : CommonService,
    private sortPipelist: MastersSortPipe,
    public loaderService: LoaderService,
  ) {
    this.addCurrencyForm = this.fb.group({
      countryName: [''],
      description: [''],
      currencyName: ['',Validators.required],
      currencyShortName: ['',Validators.required],
      currencName:[''],
      currencySymbol: [''],
      currencyPair: ['', Validators.required],
      status: [true],
    });
  }
  getcountryList() {
    this.profileService.countryList()?.subscribe((res: any) => {
      this.countryData = res.documents;
    });
  }
  ngOnInit(): void {
    // this.vvoye()
    this.getcountryList()
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.tenantId = resp.tenantId
      }
    }) 
  
      this.getData();
  }


  vvoye() {
    let payload = this.commonService.filterList()
      payload.sort = {
        "desc" : ["updatedOn"]
     }
   let mustArray = {};
   payload.query=mustArray;
      this.commonService.getSTList('currency', payload).subscribe((res: any) => {
      if (res && res.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1,
          currencyShortName: s.currencyShortName,
          updatedOn: s.updatedOn,
          updatedBy: s.updatedBy
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
        'currencyShortName' : row?.element?.currencyShortName,
        'updatedOn' : row?.element?.updatedOn        ,
        'updatedBy' : row?.element?.updatedBy
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
    filterValue = filterValue.trim(); // Remove whitespace
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
          "$regex": each,
          "$options": "i"
        }
    });

    let payload = this.commonService.filterList()
    payload.query = this.filterKeys
    payload.sort = {
      "desc": ["updatedOn"]
    }
    this.commonService.getSTList('currency', payload).subscribe((data) => {
      this.yardcfs = data.documents;
      this.dataSource = new MatTableDataSource(
        data?.documents?.map((s: any,index) => {
          return{
            ...s,
            id:index+1
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
    this.getData();
  }
  


  deleteclause(id: any) {
    alert('Item deleted!');
  }
  get f() {
    return this.addCurrencyForm.controls;
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
     this.getData();
   }
  getData() {
    this.loaderService.showcircle();
    let payload = this.commonService.filterList()
    if(payload?.size)payload.size= this.pageSize,
    payload.from=this.from
    if(payload?.query)payload.query = { }
    if(payload?.sort)payload.sort = {
      "desc" : ["updatedOn"]
   }
  //  payload.size = Number(this.size)
  //  payload.from = this.page -1,
    this.commonService.getSTList('currency', payload)?.subscribe((res: any) => {
      this.currencyData = res.documents;

      if (res && res?.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1+this.from,
          currencyShortName: s.currencyShortName,
          updatedOn: s.updatedOn,
          updatedBy: s.updatedBy
          
        }));
        // this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1;
        this.toalLength = res.totalCount;
        this.count = res.documents.length;
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
    this.getData();
  }

  getPaginationData(type: any) {
    this.fromSize =
      type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
      let payload = this.commonService.filterList()
      payload.sort = {
        "desc" : ["updatedOn"]
     }
     payload.size = Number(this.size)
     payload.from = this.fromSize -1;
     let mustArray = {};
     this.currency_code = this.currency_code?.trim();
     this.short_name = this.short_name?.trim();
     this.description = this.description?.trim();
     this.decimal_name = this.decimal_name?.trim();
     this.last_date = this.last_date?.trim();
     this.last_updated_user = this.last_updated_user?.trim();
 
     if (this.currency_code) {
       mustArray['currencyCode'] = {
         "$regex" : this.currency_code,
         "$options": "i"
     }
     }
     if (this.short_name) {
       mustArray['currencyShortName'] = {
         "$regex" : this.short_name,
         "$options": "i"
     }
     }
     if (this.description) {
       mustArray['description'] = {
         "$regex" : this.description,
         "$options": "i"
     }
     }
     if (this.decimal_name) {
       mustArray['currencyName'] = {
         "$regex" : this.decimal_name,
         "$options": "i"
     }
     }
 
     if (this.last_date) {
       mustArray['updatedOn']= {
         "$gt" : this.last_date.substring(0, 10) + 'T00:00:00.000Z',
         "$lt" : this.last_date.substring(0, 10) + 'T23:59:00.000Z'
     }
     }
     if (this.last_updated_user) {
       mustArray['updatedBy'] = {
         "$regex" : this.last_updated_user,
         "$options": "i"
     }
     }
     payload.query=mustArray;
      this.commonService.getSTList('currency', payload).subscribe((data) => {
      this.currencyData = data.documents;
      this.toalLength = data.totalCount;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count =
      type === 'prev'
        ? this.toalLength === this.count
          ? this.count - ((this.toalLength % Number(this.size))>0?(this.toalLength % Number(this.size)):(Number(this.size)))
          : this.count - data.documents.length
        : this.count + data.documents.length;
  });
  }

  search() {
    let mustArray = {};
    this.currency_code = this.currency_code?.trim();
    this.short_name = this.short_name?.trim();
    this.description = this.description?.trim();
    this.decimal_name = this.decimal_name?.trim();
    this.last_date = this.last_date?.trim();
    this.last_updated_user = this.last_updated_user?.trim();

    if (this.currency_code) {
      mustArray['currencyCode'] = {
        "$regex" : this.currency_code,
        "$options": "i"
    }
    }
    if (this.short_name) {
      mustArray['currencyShortName'] = {
        "$regex" : this.short_name,
        "$options": "i"
    }
    }
    if (this.description) {
      mustArray['description'] = {
        "$regex" : this.description,
        "$options": "i"
    }
    }
    if (this.decimal_name) {
      mustArray['currencyName'] = {
        "$regex" : this.decimal_name,
        "$options": "i"
    }
    }

    if (this.last_date) {
      mustArray['updatedOn']= {
        "$gt" : this.last_date.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.last_date.substring(0, 10) + 'T23:59:00.000Z'
    }
    }
    if (this.last_updated_user) {
      mustArray['updatedBy'] = {
        "$regex" : this.last_updated_user,
        "$options": "i"
    }
    }
   
    this.fromSize = 1
    let payload = this.commonService.filterList()
      payload.query = mustArray
      payload.sort = {
        "desc" : ["updatedOn"]
     }
     payload.size = Number(this.size)
     payload.from = 0,
      this.commonService.getSTList('currency', payload).subscribe((res: any) => {
      this.currencyData = res.documents?.map((s: any,index) => {
        return{
          ...s,
          id:index+1
        }
      });
      this.toalLength = res.totalCount;
      this.count = res.documents.length;
      this.fromSize = 1
    });
  }

  clear() {
    this.currency_code = '';
    this.short_name = '';
    this.description = '';
    this.decimal_name = '';
    this.last_date = '';
    this.last_updated_user = '';
    this.getData();
  }

  open(content, currency?: any, show?: string) {
    this.show = show;
  
    // Reset the form when opening for a new entry
    this.addCurrencyForm.reset();
  
    if (currency) {
      // Edit mode: populate the form with existing currency data
      this.currencyIdToUpdate = currency.currencyId;
  
      this.addCurrencyForm.patchValue({
        countryName: currency.countryId || '',
        description: currency.description || '',
        currencyPair: currency.currencyPair || '',
        currencyName: currency.currencyName || '',
        currencName: currency.currencName || '',
        currencyShortName: currency.currencyShortName || '',
        currencySymbol: currency.currencySymbol === '^' ? '' : currency.currencySymbol,
        status: currency.status || false,
      });
  
      // Enable or disable the form based on the show parameter
      if (show === 'show') {
        this.addCurrencyForm.disable();
      } else {
        this.addCurrencyForm.enable();
      }
    } else {
      // New entry (add mode): ensure the form is enabled
      this.addCurrencyForm.enable();
    }
  
    // Open the modal dialog
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }
  currencyMasters() {
    this.submitted = true;
    if (this.addCurrencyForm.invalid) {
      return;
    }
    let countryList = this.countryData.filter(
      (x) =>
        x.countryId === this.addCurrencyForm.get('countryName').value
    );
    let newCurrency = this.addCurrencyForm.value;

    const dataupdate = {
      ...newCurrency,
        "tenantId": this.tenantId,
      currencySymbol : this.addCurrencyForm.get('currencySymbol').value || '^',
      countryName: countryList[0]?.countryName || '',
      countryId: this.addCurrencyForm.get('countryName').value || '',
      currencyShortName : this.addCurrencyForm.get('currencyName').value ,
      description : '',
      status : this.addCurrencyForm.get('status').value || false,
      "orgId": this.commonfunction.getAgentDetails()?.orgId,
    };
    if (!this.currencyIdToUpdate) {
      this.commonService.addToST('currency',dataupdate).subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Added Successfully', '');
            this.onSave();
            this.getData();
            this.clear();
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error', error?.error?.error?.message , '');
        }
      );
    } else {
      let newdata = { ...dataupdate, currencyId: this.currencyIdToUpdate };
      const data = [newdata];
      this.commonService.UpdateToST(`currency/${newdata.currencyId}`,newdata).subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Updated Successfully', '');
            this.onSave();
            this.getData();
            this.clear();
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error', error?.error?.error?.message , '');
        }
      );
    }
  }
  changeStatus(data, i) {
    this.commonService.UpdateToST(`currency/${data.currencyId}`,{ ...data, status: !data?.status })
      .subscribe(
        (res: any) => {
          if (res) {
            this.currencyData[i].status = !data?.status;
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
  delete(deletecurrency, id) {
    this.modalService
      .open(deletecurrency, {
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
            let data = 'currency/'+id.currencyId

            this.commonService.deleteST(data).subscribe((res: any) => {
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
    this.submitted = false;
    this.currencyIdToUpdate = null;
    this.addCurrencyForm.reset();
    this.addCurrencyForm.controls['status'].setValue(true);
    this.submitted = false;
    this.modalService.dismissAll();
    return null;
  }

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.currencyData.map((row: any) => {
      storeEnquiryData.push({
        'Short Name': row.currencyShortName,
        'Description': row.description,
        'Decimal Name': row.currencyName,
        'Last Update Date': row.updatedOn,
        'Last Update User Id': row.updatedBy,
        'Status': row.status ? 'Active' : 'Inactive'
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

    const fileName = 'currency-master.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  openPDF() {
    const prepare=[];
    this.currencyData.forEach(e=>{
      let tempObj =[];
      tempObj.push(e.currencyShortName);
      tempObj.push(e.description);
      tempObj.push(e.currencyName);
      tempObj.push(this.datepipe.transform(e.updatedOn,'dd-MM-YYYY,hh:mm'));
      tempObj.push(e.updatedBy);
      tempObj.push(e.status ? 'Active' : 'Inactive')
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [297, 210]);
    autoTable(doc,{
        head: [['Short Name','Description','Decimal Name','Last Update Date','Last Update User Id', 'Status']],
        body: prepare,
        didDrawCell: (data) => {
          // Draw border lines for each cell
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'S');
      }
    });
    doc.save('currency-master' + '.pdf');
  }
}
