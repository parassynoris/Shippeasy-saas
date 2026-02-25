import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { CommonService } from 'src/app/services/common/common.service';
import { CountryData } from 'src/app/models/city-master';
import { MastersSortPipe } from 'src/app/shared/util/mastersort';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';

@Component({
  selector: 'app-country-master',
  templateUrl: './country-master.component.html',
  styleUrls: ['./country-master.component.scss'],
})
export class CountryMasterComponent implements OnInit {
  _gc=GlobalConstants;
  addCountryForm: FormGroup;
  coutryData: CountryData[] = [];
  countryIdToUpdate: string;
  closeResult: string;
  toalLength: number;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  submitted: boolean = false;
  country: string;
  iso_country: string;
  region: string;
  status: string;
  sector: string;
  countryCode: string;
  countryShortName: string;
  countryPhoneCode:string;
  show: string;
  yardcfs:any
  currencyList: any;
  email:any
  dataSource = new MatTableDataSource<any>();
  displayedColumns = ['#','action','countryCode','countryPhoneCode','countryName','status'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort1!: MatSort;


  constructor(
    public modalService: NgbModal,
    private saMasterService: SaMasterService,
    private fb: FormBuilder,
    private notification: NzNotificationService,
    private commonService : CommonService,
    private sortPipelist: MastersSortPipe,
    private commonfunction: CommonFunctions,
    public loaderService: LoaderService,
  ) {
   this.formBuild()
  }
formBuild(){
  this.addCountryForm = this.fb.group({
    countryCode: new FormControl('', Validators.required),
    countryName: new FormControl('', Validators.required),
    currency: ['' ,Validators.required],
    countryPhoneCode: new FormControl('',),
    sector: new FormControl(''),
    countryShortName: new FormControl('',),
    subSectorName: new FormControl(''),
    status: new FormControl(true),
  });
  
}
  ngOnInit(): void {
   
      this.getData();
      this.vprouduct()
      this.getCurrencyDropDowns()
  }
  get f() {
    return this.addCountryForm.controls;
  }
  
getCurrencyDropDowns() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status":true,
      }
   
    this.commonService.getSTList('currency',payload)?.subscribe((res: any) => {
      this.currencyList = res?.documents;
    });
  }

  vprouduct() {
    let payload = this.commonService?.filterList();
    let mustArray = {};
    payload.query = mustArray
    this.commonService.getSTList('country', payload).subscribe((res:any) => {
      if (res && res.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1,
          countryCode: s.countryShortName,
          countryPhoneCode: s.countryPhoneCode,
          countryName: s.countryName,
          sector:s.sector,
          status:s.status
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
        'countryCode' : row?.element?.countryShortName,
        'countryPhoneCode' : row?.element?.countryPhoneCode,
        'countryName' : row?.element?.countryName,
        'status':row?.element?.status
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
        this.displayedColumns[ind] !== 'status' ?
          this.filterKeys[this.displayedColumns[ind]] = {
            "$regex": each.toLowerCase(),
            "$options": "i"
          } : this.filterKeys[this.displayedColumns[ind]] = {
            "$eq": (each.toLowerCase() === 'active' ? true : false),
          }
    });
    let payload = this.commonService.filterList()
    payload.query = this.filterKeys
    payload.sort = {
      "desc": ["updatedOn"]
    }
    this.commonService.getSTList('country', payload).subscribe((data) => {
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
    payload.size= this.pageSize,
    payload.from=this.from
    payload.sort = {
      "desc" : ["updatedOn"]
   }
  //  payload.size = Number(this.size)
  //  payload.from = 0;
   let mustArray = {};

 // Trim beginning spaces from search parameters
 this.country = this.country?.trim();
 this.countryCode =  this.countryShortName?.trim();
 this.countryPhoneCode = this.countryPhoneCode?.trim();
 this.status = this.status?.trim();
 this.sector = this.sector?.trim();
 if (this.country) {
     mustArray['countryName'] = {
       "$regex" : this.country,
       "$options": "i"
   }
   }
   if (this.countryCode) {
     mustArray['countryCode'] = {
       "$regex" : this.countryCode,
       "$options": "i"
   }
   }

   if (this.countryPhoneCode) {
    mustArray['countryPhoneCode'] = {
      "$regex" : this.countryPhoneCode,
      "$options": "i"
  }
  }


   if (this.status) {
    mustArray['status'] = this.status === 'true' ? true : false
   }
  payload.query = mustArray
    setTimeout(() => {
      this.commonService.getSTList('country', payload).subscribe((res: any) => {

      this.count = res.documents.length;
      if (res && res?.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1+this.from,
          countryCode: s.countryShortName,
          countryPhoneCode: s.countryPhoneCode,
          countryName: s.countryName,
          status:s.status
          
        }));
        // this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1; 
        this.coutryData = res.documents;      
        this.toalLength = res.totalCount;
        this.loaderService.hidecircle();
      }
    },()=>{
      this.loaderService.hidecircle();
    });
  },800)
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
    let mustArray = {};

  // Trim beginning spaces from search parameters
  this.country = this.country?.trim();
  this.countryCode =  this.countryShortName?.trim();
  this.countryPhoneCode = this.countryPhoneCode?.trim();
  this.sector = this.sector?.trim();
  this.status = this.status?.trim();
    if (this.country) {
      mustArray['countryName'] = {
        "$regex" : this.country,
        "$options": "i"
    }
    }
    if (this.countryCode) {
      mustArray['countryCode'] = {
        "$regex" : this.countryCode,
        "$options": "i"
    }
    }

    if (this.countryPhoneCode) {
      mustArray['countryPhoneCode'] = {
        "$regex" : this.countryPhoneCode,
        "$options": "i"
    }
    }
  
    if (this.status) {
      mustArray['status'] = this.status === 'true' ? true : false
    }
    payload.sort = {
      "desc" : ["updatedOn"]
   }
   payload.query = mustArray
   payload.size = Number(this.size)
   payload.from = this.fromSize - 1,
      this.commonService.getSTList('country', payload).subscribe((data) => {
      this.coutryData = data.documents;
      this.toalLength = data.totalCount;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count = type === 'prev' ? this.toalLength === this.count ? this.count -  ((this.toalLength % Number(this.size))>0?(this.toalLength % Number(this.size)):(Number(this.size))) : this.count - data.documents.length : this.count + data.documents.length;
    });
  }

  search() {
    let mustArray = {};

  // Trim beginning spaces from search parameters
  this.country = this.country?.trim();
  this.countryCode =  this.countryShortName?.trim();
  this.countryPhoneCode = this.countryPhoneCode?.trim();
  this.sector = this.sector?.trim();
  this.status = this.status?.trim();
    if (this.country) {
      mustArray['countryName'] = {
        "$regex" : this.country,
        "$options": "i"
    }
    }
    if (this.countryCode) {
      mustArray['countryCode'] = {
        "$regex" : this.countryCode,
        "$options": "i"
    }
    }

    if (this.countryPhoneCode) {
      mustArray['countryPhoneCode'] = {
        "$regex" : this.countryPhoneCode,
        "$options": ""
    }
    }
  
    if (this.status) {
      mustArray['status'] = this.status === 'true' ? true : false
    }
    let payload = this.commonService.filterList()
    payload.query = mustArray
    payload.sort = {
      "desc" : ["updatedOn"]
   }
   payload.size = Number(this.size)
   payload.from = 0,
      this.commonService.getSTList('country', payload).subscribe((res: any) => {
      this.coutryData = res.documents;
      this.toalLength = res.totalCount;
      this.count = res.documents.length;
      this.fromSize =1
    });
  }

  clear() {
    this.country = '';
    this.iso_country = '';
    this.region = '';
    this.status = '';
    this.countryCode ='';
    this.countryPhoneCode='';
    this.sector ='';
    this.getData();
  }

  open(content, country?: any,show?) {
    this.show = show
    if (country) {
      this.countryIdToUpdate = country.countryId;
      this.addCountryForm.patchValue({
        countryCode: country.countryShortName|| '',
        countryPhoneCode: country.countryPhoneCode||'',
        countryName: country.countryName|| '',
        countryShortName:country.countryShortName|| '',
        sector: country.sector || '',
        subSectorName: country.subSectorName|| '',
        currency: country.currency || '',
        status: country?.status|| true,
      });
      show === 'show'?this.addCountryForm.disable():this.addCountryForm.enable()
    }
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }
  countryMasters() {
    this.submitted = true;
    if (this.addCountryForm.invalid) {
      return;
    }
    const dataupdate = this.addCountryForm.value
    dataupdate.callingCode = "91"
    dataupdate.orgId="1"
    dataupdate.tenantId="1"
    if (!this.countryIdToUpdate) {
      const data = {...dataupdate};
      this.commonService.addToST('country',data).subscribe(
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
      let newCountry = { ...dataupdate, countryId: this.countryIdToUpdate };
      this.commonService.UpdateToST(`country/${newCountry.countryId}`,newCountry).subscribe(
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
  changeStatus(data) {
    this.commonService.UpdateToST(`country/${data.countryId}`,{ ...data, status: !data?.status })
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
      this.clear();
  }
  delete(deletecountry, id) {
    this.modalService
      .open(deletecountry, {
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
            let data = 'country'+id.countryId
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
    this.modalService.dismissAll();
    this.submitted = false;
    this.countryIdToUpdate = null;
    this.formBuild()
    this.submitted = false;
    return null;
  }

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.coutryData.map((row: any) => {
      storeEnquiryData.push({
        'Country Code': row.countryShortName,
        'Country Phone Code': row.countryPhoneCode,
        'Country Name': row.countryName,
        'Status': row.status ? "Active" : "Inactive",
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

    const fileName = 'country.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  openPDF() {
    const prepare=[];
    this.coutryData.forEach(e=>{
      let tempObj =[];
      tempObj.push(e.countryShortName);
      tempObj.push(e.countryPhoneCode);
      tempObj.push(e.countryName);
      tempObj.push(e.status ? "Active" : "Inactive");
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [297, 210]);
    autoTable(doc,{
        head: [['Country Code','Country Phone Code','Sector','Status']],
        body: prepare,
        didDrawCell: (data) => {
          // Draw border lines for each cell
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'S');
      }
    });
    doc.save('country' + '.pdf');
  }
}
