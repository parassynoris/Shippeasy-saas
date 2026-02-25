import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LoaderService } from 'src/app/services/loader.service';
import {  NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ApiService } from 'src/app/admin/principal/api.service'; 
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { ApiSharedService } from '../../api-service/api-shared.service';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { CommonService } from 'src/app/services/common/common.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { banklist } from 'src/app/models/bank-master';
import { MastersSortPipe } from 'src/app/shared/util/mastersort';
import { MatDrawer } from '@angular/material/sidenav';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';

@Component({
  selector: 'app-bank-master',
  templateUrl: './bank-master.component.html',
  styleUrls: ['./bank-master.component.scss']
})
export class BankMasterComponent implements OnInit {
  _gc=GlobalConstants;
  bankForm: FormGroup;
  submitted: boolean = false; 
  bankList: banklist[] = [];
  bankIdToUpdate: string;
  fromSize: number = 1;
  toalLength: number;
  size = 10;
  page = 1;
  count = 0;
  bankShortName: string;
  bankName: string;
  bankCode: string;
  lineID: string;
  status: string;
  FASCode: string;
  closeResult: string;
  show: string;
  tenantId: string;
  yardcfs:any
  @ViewChild(MatDrawer) drawer: MatDrawer | any;
  dataSource = new MatTableDataSource();
  pagenation = [10,20, 50, 100];
  email:any
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns =[
    '#', 
    'action',
   'bankName',
   'bankShortName',
   'bankAccountCode',
    'lineID',
    'FASLedgerCode'
  ];
  isMaster: boolean = false;

  constructor(public modalService: NgbModal,
    private formBuilder: FormBuilder,
    public loaderService: LoaderService,
    private _api: ApiService,
    private mastersService: MastersService,
    private router: ActivatedRoute,
    public notification: NzNotificationService,
    private profilesService: ProfilesService,
    public apiService: ApiSharedService,
    private commonfunction: CommonFunctions,private cognito : CognitoService,
    private sharedService: ApiSharedService,
    private sortPipelist: MastersSortPipe,
    public CommonService : CommonService) {
    this.formBuild();
  }

  formBuild() {
    this.bankForm = this.formBuilder.group({
      partyName : new FormControl('', [Validators.required]),
      bankName: new FormControl('', [Validators.required]),
      bankShortName: new FormControl('', [Validators.required]),
      bankCode: new FormControl('', [Validators.required]),
      lineID: new FormControl(''),
      FASCode: new FormControl(''),
      status : new FormControl(true),
      ifscCode: new FormControl(''),
      branch: new FormControl(''),
      swiftCode: new FormControl('')
    });
  }

  ngOnInit(): void {
    // this.vvoye()
    this.getParty();
    this.getBankList();
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.tenantId = resp.tenantId
      }
    }) 
  }
  partyList:any=[]
  getParty(){
    let payload = this.CommonService.filterList()
    if(payload?.query)payload.query = {
      status : true,
      "$and": [
        {
          "customerType.item_text": {
            "$ne": "Vendor",
          }
        }
      ]
    }
    this.CommonService.getSTList("partymaster", payload)?.subscribe((data) => {
      this.partyList = data?.documents;
    })
  }

  vvoye() {
    let payload = this.CommonService.filterList()
    payload.query = {
      isBank: true, "category":"master"
    }
    payload.sort = {
      "desc" : ["updatedOn"]
   }

   let mustArray = {};
   mustArray['isBank'] = true
   mustArray['category'] = "master"
   payload.query = mustArray
   this.CommonService.getSTList('bank', payload).subscribe((res: any) => {
      if (res && res.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1,
          bankName: s.bankName,
          bankShortName: s.bankShortName,
          bankAccountCode: s.bankAccountCode,
          lineID: s.lineID,
          FASLedgerCode: s.FASLedgerCode
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
        'locationName' : row?.element?.locationName,
        'Country' : row?.element?.country        ,
        'State' : row?.element?.state
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

    let payload = this.CommonService.filterList()
    payload.query = this.filterKeys
    payload.sort = {
      "desc": ["updatedOn"]
    }
    this.CommonService.getSTList('bank', payload)
      ?.subscribe((data) => {
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
    this.getBankList()
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
     this.getBankList();
   }
  getBankList() {
    this.loaderService.showcircle();
    
    let payload = this.CommonService.filterList()
    if(payload?.size)payload.size= this.pageSize,
    payload.from=this.from
    if(payload?.query)payload.query = {
      isBank: true, "category":"master"
    }
    if(payload?.sort)payload.sort = {
      "desc" : ["updatedOn"]
   }

   let mustArray = {};
 

   if (this.bankName) {
     mustArray['bankName'] = {
       "$regex" : this.bankName,
       "$options": "i"
   }
   }

   if (this.bankShortName) {
     mustArray['bankShortName'] = {
       "$regex" : this.bankShortName,
       "$options": "i"
   }
   }


   if (this.bankCode) {
     mustArray['bankAccountCode'] = {
       "$regex" : this.bankCode,
       "$options": "i"
   }
   }
   if (this.lineID) {
     
     mustArray['lineID'] = {
       "$regex" : this.lineID,
       "$options": "i"
   }
   }
   if (this.FASCode) {
     mustArray['FASLedgerCode'] = {
       "$regex" : this.FASCode,
       "$options": "i"
   }
   }
   if (this.status) {
     mustArray['status'] = this.status
   }
   mustArray['isBank'] = true
   mustArray['category'] = "master"
   
   if(payload?.query)payload.query = mustArray
  //  if(payload?.size)payload.size = Number(this.size);
  //  if(payload?.from)payload.from = this.page -1;
    this.CommonService.getSTList('bank', payload)
      ?.subscribe((data) => {
        this.bankList = data.documents;
       
        if (data && data?.documents) {
          this.dataSource.data = data.documents.map((s: any, i: number) => ({
            ...s,
            id: i + 1,
            bankName: s.bankName,
          bankShortName: s.bankShortName,
          bankAccountCode: s.bankAccountCode,
          lineID: s.lineID,
          FASLedgerCode: s.FASLedgerCode
            
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

  deleteclause(id: any) {

    alert('Item deleted!')
  }
  isViewMode: boolean = false;
  open(content, data?: any, show?: string) {
    this.isViewMode = show === 'show'; // Set view mode based on the 'show' parameter

    if (data) {
      this.bankIdToUpdate = data?.bankId;
      this.bankForm.patchValue({
        partyName : data?.partyId,
        bankName: data?.bankName,
        bankShortName: data?.bankShortName,
        bankCode: data?.bankAccountCode,
        lineID: data?.lineID,
        FASCode: data?.FASLedgerCode,
        status: data?.status,
        ifscCode: data?.ifscCode,
        branch: data?.branch,
        swiftCode: data?.swiftCode
      });

      // Enable or disable the form based on view mode
      if (this.isViewMode) {
        this.bankForm.disable();
      } else {
        this.bankForm.enable();
      }
    }

    // Open the modal dialog
    const model = this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }
  cancel(){
    this.formBuild()
    this.getBankList();
    this.bankIdToUpdate="";
    this.modalService.dismissAll();
  }
  get f() {
    return this.bankForm.controls;
  }
  onSave() {
    this.submitted = true;
    if (this.bankForm.invalid) {
      return false;
    }
    let bankData = {
      partyId : this.bankForm.value.partyName || '',
      partyName : this.partyList?.find((x)=> x.partymasterId == this.bankForm.value.partyName).name?.toUpperCase() || '',
      "tenantId": this.tenantId,
      bankName : this.bankForm.value.bankName,
      bankShortName : this.bankForm.value.bankShortName,
      bankAccountCode : this.bankForm.value.bankCode,
      lineID : this.bankForm.value.lineID,
      FASLedgerCode : this.bankForm.value.FASCode,
      category : 'master',
      accountNo : 'null',
      accountType : 'null',
      isBank :true,
      status : this.bankForm.value.status,
      ifscCode:this.bankForm.value.ifscCode,
      branch:this.bankForm.value.branch,
      swiftCode:this.bankForm.value.swiftCode,
      "orgId": this.commonfunction.getAgentDetails()?.orgId,
    };
    this.loaderService.showcircle();

    if (!this.bankIdToUpdate) {
      const dataupdate = bankData;
      this.CommonService.addToST('bank',dataupdate).subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Added Successfully', '');
            this.submitted = false;
            this.cancel();
          }
        },
        (error) => {
          this.notification.create('error', error?.error?.error?.message , '');
        }
      );
    } else {
      const dataWithUpdateID = {
        ...bankData,
        bankId: this.bankIdToUpdate,
      };
      this.CommonService.UpdateToST(`bank/${dataWithUpdateID?.bankId}`,dataWithUpdateID).subscribe(
        (result: any) => {
          if (result) {
            this.modalService.dismissAll();
            this.notification.create('success', 'Updated Successfully', '');
           this.cancel();
           this.submitted = false;
          
          }
        },
        (error) => {
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
    }
  }
  next() {
    if (this.toalLength > this.count) {
      this.getPaginationData('next');
    }
  }

  prev() {
    if (this.page > 0 && this.page !== 1) {
      this.getPaginationData('prev');
    }
  }

  filter(e) {
    this.size = e.target.value;
    this.fromSize = 1;
    this.getBankList();
  }

  clearFilter(){
    this.bankName = '';
    this.bankShortName = ''
    this.bankCode = '';
    this.lineID = '';
    this.FASCode = ""
    this.getBankList();
  }
  search() {
    
    let mustArray = {};
 

    if (this.bankName) {
      mustArray['bankName'] = {
        "$regex" : this.bankName,
        "$options": "i"
    }
    }

    if (this.bankShortName) {
      mustArray['bankShortName'] = {
        "$regex" : this.bankShortName,
        "$options": "i"
    }
    }


    if (this.bankCode) {
      mustArray['bankAccountCode'] = {
        "$regex" : this.bankCode,
        "$options": "i"
    }
    }
    if (this.lineID) {
      
      mustArray['lineID'] = {
        "$regex" : this.lineID,
        "$options": "i"
    }
    }
    if (this.FASCode) {
      mustArray['FASLedgerCode'] = {
        "$regex" : this.FASCode,
        "$options": "i"
    }
    }
    if (this.status) {
      mustArray['status'] = this.status
    }
    mustArray['isBank'] = true
    mustArray['category'] = "master"
    
    let payload = this.CommonService.filterList()
    payload.query = mustArray
    payload.sort = {
      "desc" : ["updatedOn"]
   }
   payload.size = Number(this.size)
   payload.from = 0,
    this.CommonService.getSTList('bank', payload).subscribe((data) => {
      this.bankList = data.documents?.map((s: any,index) => {
        return{
          ...s,
          id:index+1+this.from
        }
      });
      this.toalLength = data.totalCount;
      this.count = data.documents.length;
      this.fromSize =1
    });
  }

  getPaginationData(type: any) {
    this.fromSize =
      type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
      let payload = this.CommonService.filterList()
    payload.query = {
      isBank: true, "category":"master"
    }
    payload.sort = {
      "desc" : ["updatedOn"]
   }

   let mustArray = {};
 

   if (this.bankName) {
     mustArray['bankName'] = {
       "$regex" : this.bankName,
       "$options": "i"
   }
   }

   if (this.bankShortName) {
     mustArray['bankShortName'] = {
       "$regex" : this.bankShortName,
       "$options": "i"
   }
   }


   if (this.bankCode) {
     mustArray['bankAccountCode'] = {
       "$regex" : this.bankCode,
       "$options": "i"
   }
   }
   if (this.lineID) {
     
     mustArray['lineID'] = {
       "$regex" : this.lineID,
       "$options": "i"
   }
   }
   if (this.FASCode) {
     mustArray['FASLedgerCode'] = {
       "$regex" : this.FASCode,
       "$options": "i"
   }
   }
   if (this.status) {
     mustArray['status'] = this.status
   }
   mustArray['isBank'] = true
   mustArray['category'] = "master"
   
   payload.query = mustArray
   payload.size = Number(this.size)
   payload.from = this.fromSize -1;
    this.CommonService.getSTList('bank', payload).subscribe((data) => {
      this.bankList = data.documents;
      this.toalLength = data.totalCount;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count = type === 'prev' ? this.toalLength === this.count ? this.count -  ((this.toalLength % Number(this.size))>0?(this.toalLength % Number(this.size)):(Number(this.size))) : this.count - data.documents.length : this.count + data.documents.length;
    });
  }
  changeStatus(data) {
    this.CommonService.UpdateToST(`bank/${data?.bankId}`,{ ...data, status: !data?.status })
      .subscribe(
        (res: any) => {
          if (res) {
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

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.bankList.map((row: any) => {
      storeEnquiryData.push({
        'Bank Name': row.bankName,
        'Bank Short Name': row.bankShortName,
        'Bank Account Code': row.bankAccountCode,
        'Line ID': row.lineID,
        'FAS Code': row.FASLedgerCode,
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

    const fileName = 'bank-master.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  openPDF() {
    const prepare=[];
    this.bankList.forEach(e=>{
      let tempObj =[];
      tempObj.push(e.bankName);
      tempObj.push(e.bankShortName);
      tempObj.push(e.bankAccountCode);
      tempObj.push(e.lineID);
      tempObj.push(e.FASLedgerCode);
      tempObj.push(e.status ? 'Active' : 'Inactive')
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [297, 210]);
    autoTable(doc,{
        head: [['Bank Name','Bank Short Name','Bank Account Code','Line ID','FAS Code', 'Status']],
        body: prepare,
        didDrawCell: (data) => {
          // Draw border lines for each cell
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'S');
      }
    });
    doc.save('bank-master' + '.pdf');
  }
}