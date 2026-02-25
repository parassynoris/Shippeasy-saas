import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { BaseBody } from 'src/app/admin/smartagent/base-body';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { CommonFunctions } from '../../functions/common.function';
import { CommonService } from 'src/app/services/common/common.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { Currency } from 'src/app/models/shipping-line';
import { CountryData } from 'src/app/models/city-master';
import { MastersSortPipe } from '../../util/mastersort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';

@Component({
  selector: 'app-curr-rate',
  templateUrl: './curr-rate.component.html',
  styleUrls: ['./curr-rate.component.scss'],
})
export class CurrRateComponent implements OnInit {
  _gc=GlobalConstants
  currrateData = [];

  currRateForm: FormGroup;
  currRateIdToUpdate: string;
  closeResult: string;
  toalLength: number;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  submitted: boolean = false;
  code: string;
  name: string;
  currency: string;
  baseCurrency:string;
  description: string;
  countryData: CountryData[];
  currencyData: Currency[];
  baseBody: BaseBody;
  exchangeRate: string;
  show: string;
  curr_date: string;
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
   'countryName',
   'baseCurrency',
   'currency',
   'exchangeRate',
   'curr_date'
  ];
  isMaster: boolean = false;

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private mastersService: MastersService,
    private router: ActivatedRoute,
    private profileService: ProfilesService,
    private notification: NzNotificationService,
    private saMasterService: SaMasterService,
    private commonfunction: CommonFunctions,private cognito : CognitoService,
    private commonService : CommonService,
    private sortPipelist: MastersSortPipe,
    public loaderService: LoaderService,
  ) { }

  ngOnInit(): void {
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.tenantId = resp.tenantId
      }
    }) 
    // this.vvoye()
    this.getcountryList();
    this.getCostItem();
    this.getCurrencyData();
    this.currRateForm = this.fb.group({
      countryName: ['', [Validators.required]],
      currency: ['', [Validators.required]],
      baseCurrency: ['', [Validators.required]],
      curr_date: [(new Date()).toISOString().substring(0, 10)],
      description: [''],
      status: [true],
      exchangeRate: ['', [Validators.required, Validators.pattern('^\-?(0|[1-9][0-9]?|100)+(?:\.[0-9]{1,2})?$')]]
    });
  }


  vvoye() {
    let payload = this.commonService.filterList()
    payload.sort = {
      "desc" : ["updatedOn"]
   }
   let mustArray = {};
   payload.query=mustArray;
   this.commonService.getSTList('currrate', payload)?.subscribe((res: any) => {
      if (res && res.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1+this.from,
          countryName: s.countryName,
          currency: s.currency,
          baseCurrency: s.baseCurrency,
          exchangeRate: s.exchangeRate,
          curr_date: s.curr_date
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
        'countryName' : row?.element?.countryName,
        'currency' : row?.element?.currency,
        'exchangeRate' : row?.element?.exchangeRate,
        'curr_date' : row?.element?.curr_date
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
    this.commonService.getSTList('currrate', payload)?.subscribe((data) => {
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
    this.getCostItem()
  }

  get f() {
    return this.currRateForm.controls;
  }
  sortList(array , key){
    return this.sortPipelist.transform(array, key);
   }
  getcountryList() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = { status : true }
    this.commonService.getSTList('country', payload)?.subscribe((res: any) => {
      this.countryData = res.documents;
    });
  }

  pageNumber = 1;
  pageSize = 10;
  from = 0;
  totalCount = 0;

  onPageChange(event){
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.from = event.pageIndex*event.pageSize ;
    this.getCostItem();
  }
  getCostItem() {
    this.loaderService.showcircle();
    this.page = 1;
    let payload = this.commonService.filterList()
    if(payload?.size)payload.size= this.pageSize,
    payload.from=this.from
    if(payload?.query)payload.query = { }
    if(payload?.sort)payload.sort = {
      "desc" : ["updatedOn"]
   }
  //  if(payload?.size)payload.size = Number(this.size)
  //  if(payload?.from)payload.from = this.page -1
    this.commonService.getSTList('currrate', payload)?.subscribe((data) => {
      this.currrateData = data.documents;

      if (data && data?.documents) {
        this.dataSource.data = data.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1+this.from,
          costitemName: s.costitemName,
          costitemGroup: s.costitemGroup,
          chargeTypeName: s.chargeTypeName,
          chargeGroup: s.chargeGroup,
          currency: s.currency,
          baseCurrency: s.baseCurrency,
          status: s.status
          
        }));
        // this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1; 
        this.toalLength = data.totalCount;
        this.count = data.documents.length;
        this.loaderService.hidecircle(); 
      }
    });
  }
  getCurrencyData() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = { status : true }
    this.commonService.getSTList('currency', payload)
      ?.subscribe((res: any) => {
        this.currencyData = res.documents;
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
    this.getCostItem();
  }

  getPaginationData(type: any) {
    this.fromSize =
      type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
      let payload = this.commonService.filterList()
      payload.sort = {
        "desc" : ["updatedOn"]
     }
     
     let mustArray = {};
    this.code = this.code?.trim();
    this.curr_date = this.curr_date?.trim();
    this.name = this.name?.trim();
    this.currency = this.currency?.trim();
    this.description = this.description?.trim();
    this.exchangeRate = this.exchangeRate?.trim();
   
    if (this.code) {
      mustArray['currencyCode'] = {
        "$regex" : this.code,
        "$options": "i"
    }
    }
   
    if (this.curr_date) {
      mustArray['curr_date']= {
        "$gt" : this.curr_date.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.curr_date.substring(0, 10) + 'T23:59:00.000Z'
    }
    }
  
   
    if (this.name) {
      mustArray['countryName'] = {
        "$regex" : this.name,
        "$options": "i"
    }
    }

    if (this.currency) {
      mustArray['currency'] = {
        "$regex" : this.currency,
        "$options": "i"
    }
    }
    if (this.description) {
      mustArray['description'] = {
        "$regex" : this.description,
        "$options": "i"
    }
    }
   

    if (this.exchangeRate) {
      mustArray['exchangeRate'] = {
        "$regex" : this.exchangeRate,
        "$options": "i"
    }
    }
    payload.query=mustArray;
      this.commonService.getSTList('currrate', payload)?.subscribe((data) => {
      this.currrateData = data.documents;
      this.toalLength = data.totalCount;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count =
        type === 'prev'
          ? this.toalLength === this.count
            ? this.count -  ((this.toalLength % Number(this.size))>0?(this.toalLength % Number(this.size)):(Number(this.size)))
            : this.count - data.documents.length
          : this.count + data.documents.length;
    });
  }

  search() {
    let mustArray = {};
    this.code = this.code?.trim();
    this.curr_date = this.curr_date?.trim();
    this.name = this.name?.trim();
    this.currency = this.currency?.trim();
    this.description = this.description?.trim();
    this.exchangeRate = this.exchangeRate?.trim();
   
    if (this.code) {
      mustArray['currencyCode'] = {
        "$regex" : this.code,
        "$options": "i"
    }
    }
   
    if (this.curr_date) {
      mustArray['curr_date']= {
        "$gt" : this.curr_date.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.curr_date.substring(0, 10) + 'T23:59:00.000Z'
    }
    }
  
   
    if (this.name) {
      mustArray['countryName'] = {
        "$regex" : this.name,
        "$options": "i"
    }
    }

    if (this.currency) {
      mustArray['currency'] = {
        "$regex" : this.currency,
        "$options": "i"
    }
    }
    if (this.description) {
      mustArray['description'] = {
        "$regex" : this.description,
        "$options": "i"
    }
    }
   

    if (this.exchangeRate) {
      mustArray['exchangeRate'] = {
        "$regex" : this.exchangeRate,
        "$options": "i"
    }
    }
    let payload = this.commonService.filterList()
    payload.query = mustArray
    payload.sort = {
      "desc" : ["updatedOn"]
   }
  //  payload.size = Number(this.size)
  //  payload.from = 0,
    this.commonService.getSTList('currrate', payload)?.subscribe((data) => {
      this.currrateData = data.documents;
      this.toalLength = data.totalCount;
      this.count = data.documents.length;
      this.fromSize = 1
    });
  }

  clear() {
    this.code = '';
    this.name = '';
    this.currency = '';
    this.description = '';
    this.exchangeRate = '';
    this.getCostItem();
  }

  costItemsMasters() {
    let countryList = this.countryData.filter(
      (x) =>
        x.countryId === this.currRateForm.get('countryName').value
    );
    let currencyList = this.currencyData.filter(
      (x) => x.currencyId === this.currRateForm.get('currency').value
    );
    let currencyList1 = this.currencyData.filter(
      (x) => x.currencyId === this.currRateForm.get('baseCurrency').value
    );

    this.submitted = true;
    if (this.currRateForm.invalid) {
      return;
    }
    let newCostItems = {
      exchangeRate: this.currRateForm.value.exchangeRate,
      currency: currencyList[0].currencyShortName,
      baseCurrency: currencyList1[0].currencyShortName,
      currencyId: currencyList[0].currencyId,
      baseCurrencyId: currencyList1[0].currencyId,
      countryCode: countryList[0].countryCode,
      countryName: countryList[0].countryName,
      countryId: countryList[0].countryId,
      curr_date: this.currRateForm.value.curr_date,
      description: this.currRateForm.value.description
        ? this.currRateForm.value.description
        : '',
      status: this.currRateForm.value.status,
        "tenantId": this.tenantId,
        "orgId": this.commonfunction.getAgentDetails()?.orgId,  
    };

    if (!this.currRateIdToUpdate) {
     
      this.commonService.addToST('currrate',newCostItems)?.subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Added Successfully', '');
            this.onSave();
            this.getCostItem();
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error', error?.error?.error?.message , '');
        }
      );
    } else {
      const dataWithUpdateID = {
        ...newCostItems,
        currrateId: this.currRateIdToUpdate,
      };
      this.commonService.UpdateToST(`currrate/${dataWithUpdateID.currrateId}`,dataWithUpdateID)?.subscribe(
        (result: any) => {
          if (result) {
            this.notification.create('success', 'Updated Successfully', '');
            this.onSave();
            this.getCostItem();
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error', error?.error?.error?.message , '');
        }
      );
    }
  }

  

  delete(deletecurrrate, id) {
    this.modalService
      .open(deletecurrrate, {
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
            let data = 'currrate'+ id.currrateId
            this.commonService.deleteST(data)?.subscribe((res: any) => {
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

  open(content, currrate?: any, show?: string) {
    this.show = show;
  
    // Reset the form when opening for a new entry
    this.currRateForm.reset();
  
    if (currrate) {
      // Edit mode: populate the form with existing currency rate data
      this.currRateIdToUpdate = currrate?.currrateId;
  
      this.currRateForm.patchValue({
        status: currrate.status,
        exchangeRate: currrate.exchangeRate,
        countryName: currrate.countryId,
        curr_date: currrate.curr_date,
        currency: currrate.currencyId,
        baseCurrency: currrate.baseCurrencyId,
        description: currrate.description,
      });
  
      // Enable or disable the form based on the show parameter
      if (show === 'show') {
        this.currRateForm.disable();
      } else {
        this.currRateForm.enable();
      }
    } else {
      // New entry (add mode): ensure the form is enabled
      this.currRateForm.enable();
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
  changeStatus(data, i) {
    this.commonService.UpdateToST(`currrate/${data.currrateId}`,{ ...data, status: !data?.status })
      ?.subscribe(
        (res: any) => {
          if (res) {
            this.currrateData[i].status = !data?.status;
            this.notification.create(
              'success',
              'Status Updated Successfully',
              ''
            );
            this.search();
          }
        },
        (error) => {
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
  }
  onSave() {
    this.submitted = false;
    this.currRateIdToUpdate = null;
    this.currRateForm.reset();
    this.submitted = false;
    this.modalService.dismissAll();
    return null;
  }

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.currrateData.map((row: any) => {
      storeEnquiryData.push({
        'Country Code': row.countryCode,
        'Country Name': row.countryName,
        'Currency': row.currency,
        'Rate': row.exchangeRate,
        'Date': row.curr_date,
        'Status':row.status ? 'Active' : 'Inactive'
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

    const fileName = 'current-exchange-rate.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  openPDF() {
    const prepare = [];
    this.currrateData.forEach(e => {
      let tempObj = [];
      tempObj.push(e.countryCode);
      tempObj.push(e.countryName);
      tempObj.push(e.currency);
      tempObj.push(e.exchangeRate);
      tempObj.push(e.curr_date);
      tempObj.push(e.status ? 'Active' : 'Inactive');
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [297, 210]);
    autoTable(doc, {
      head: [['Country Code', 'Country Name', 'Currency', 'Rate', 'Date','Status']],
      body: prepare,
      didDrawCell: (data) => {
        // Draw border lines for each cell
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'S');
    }
    });
    doc.save('Curr-rate' + '.pdf');
  }
}
