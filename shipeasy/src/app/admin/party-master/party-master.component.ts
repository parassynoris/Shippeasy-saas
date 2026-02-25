import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { Subject } from "rxjs";
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { partyMasterService } from "./service/party-master.services";
import { ApiSharedService } from "src/app/shared/components/api-service/api-shared.service";
import { NzNotificationService } from "ng-zorro-antd/notification";
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { LoaderService } from "src/app/services/loader.service";
import { CommonService } from "src/app/services/common/common.service";
import { PartyMasterData } from "src/app/models/party-master";
import { MastersSortPipe } from "src/app/shared/util/mastersort";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
@Component({
  selector: 'app-party-master',
  templateUrl: './party-master.component.html',
  styleUrls: ['./party-master.component.css']
})
export class PartyMasterComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  urlParam: string;
  holdControl: string;
  smartAgentList: PartyMasterData[] = [];

  isProductList: boolean = true;
  isTemplateList: boolean = true;

  fromSize: number = 1;
  toalLength: number;
  size = 10;
  page = 1;
  count = 0;
  show=false;
  closeResult: string;
  agentProfileName: string;
  phoneNo: string;
  emailAddress: string;
  country: string;
  status: any;
  currentUrl: string;
  annualTurnover: string;
  refundAccCode: string;
  brokerageAccCode: string;
  panNo: string;
  bankName: string;
  customerAccNo: string;
  customerAcCode: string;
  brokeragePayable: string;
  serviceTax: string;
  serviceTaxExmp: string;
  getPartyMaster: string;
  order: boolean = true;
  yardcfs:any
  email:any
  _gc=GlobalConstants
  dataSource = new MatTableDataSource<any>();
  displayedColumns = ['#','name','partyShortcode',
    // 'countryName','stateName','cityName','postalCode',
    'primaryMailId','currency.currencyCode','companyType','status','action'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort1!: MatSort;

  constructor(
    public translate: TranslateService,
    public notification: NzNotificationService,
    private partyMasterService: partyMasterService,
    public commonService: CommonService,
    public apiService: ApiSharedService,
    private modalService: NgbModal,
    private loaderService: LoaderService,
    private sortPipelist: MastersSortPipe,
    public router: Router,
    
  ) {
    // do nothing.
  }


  ngOnInit(): void {
    // this. vprouduct();
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();
    this.getPartyList();
    
  }

  sortList(array , key){
    return this.sortPipelist.transform(array, key);
   }

   vprouduct() {
    let payload = this.commonService.filterList()
    payload.query = {
      "$and": [
        {
          "customerType.item_text": {
            "$ne": "Vendor",
          }
        }
      ]
    }
    payload.sort = {
       "desc" : ["updatedOn"]
    },
    this.commonService.getSTList('partymaster', payload).subscribe((res:any) => {
      if (res && res.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          name: s.name,
          partyShortcode:s.partyShortcode,
          countryName: s.countryName,
          primaryMailId:s.primaryMailId,
          panNo:s.panNo,
          status:s.status,
          companyType:(s?.customerType??[])?.map(r=>r?.item_text)?.join(',')
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
        'name' : row?.element?.name,
        'partyShortcode' : row?.element?.partyShortcode,
        'countryName' : row?.element?.countryName,
        'primaryMailId':row?.element?.primaryMailId,
        'panNo':row?.element?.panNo,
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

  // applyFilter(filterValue: string) {
  //   filterValue = filterValue.trim();
  //   filterValue = filterValue.toLowerCase();
  
  
  //   this.dataSource.filterPredicate = (data, filter) => {
  //     return JSON.stringify(data).toLowerCase().includes(filter);
  //   };
  
  //   this.dataSource.filter = filterValue;
  // }


    applyFilter(filterValue: string) {

      filterValue = typeof filterValue === "string" ? filterValue.trim() : "";

this.filterKeys = {};
let shouldArray = [];

this.displayedColumns.forEach((each) => {
  if (each !== '#' && each !== 'action' && each !== 'status'&& each !== 'companyType') {
    const regexValue = filterValue ? filterValue.toLowerCase() : "";
    if (regexValue) {  // Ensure we only push valid values
      this.filterKeys[each] = { "$regex": regexValue, "$options": "i" };
      shouldArray.push({ [each]: { "$regex": regexValue, "$options": "i" } });
    }
  }else if (each == 'companyType') {
    const regexValue = filterValue ? filterValue.toLowerCase() : "";
    if (regexValue) {  
    this.filterKeys["customerType"] = {
      "$elemMatch": {
        "item_text": { "$regex": regexValue, "$options": "i" }
      }
    };
  
    shouldArray.push({
      "customerType": {
        "$elemMatch": {
          "item_text": { "$regex": regexValue, "$options": "i" }
        }
      }
    });
  }
  } 
});

if (!filterValue) {
  this.pageNumber = 1;
  this.pageSize = 10;
  this.from = 0;
  this.totalCount = 0;
  this.getPartyList();
  return;
}

this.loaderService.showcircle();
let payload = this.commonService.filterList();
payload.query = {
  "$and": [
    {
      "customerType.item_text": { "$ne": "Vendor" }
    }
  ],
  "$or": shouldArray.length > 0 ? shouldArray : [{}]  // Prevents an empty array
};

if (this.selectedStatus === true || this.selectedStatus === false || this.selectedStatus !== '') {
  payload.query["$and"].push({ "status": this.selectedStatus });
}


   
        payload.size = this.pageSize
        payload.from = this.from
        payload.sort = {
           "desc" : ["updatedOn"]
        },
    this.fromSize = 1
        this.commonService.getSTList("partymaster", payload).subscribe((data) => {
          this.smartAgentList = data.documents;
    
          if (data && data?.documents) {
            this.dataSource.data = data.documents.map((s: any, i: number) => ({
              ...s,
              id: i + 1+this.from,
              name: s.name,
              partyShortcode: s.partyShortcode,
              countryName: s?.addressInfo?.countryName,
              stateName:s?.addressInfo?.stateName,
              cityName:s?.addressInfo?.cityName,
              postalCode:s?.addressInfo?.postalCode,
              primaryMailId:s.primaryMailId,
              panNo:s.panNo,
              status:s.status,
              companyType:(s?.customerType??[])?.map(r=>r?.item_text)?.join(',')
              
            })); 
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort1;
            this.toalLength = data.totalCount;
            this.count = data.documents.length;
            this.loaderService.hidecircle(); 
          }
        });
    }

  displayedColumns1 = this.displayedColumns.map((x, i) => x + '_' + i);
  toggleFilters = true;
  filtersModel = [];
  filterKeys = {};
  searchColumns() {
    this.filterKeys = {};
    this.filtersModel.forEach((each, ind) => {
      if (each){ 
        let column:string=this.displayedColumns[ind];
      if(['countryName', 'stateName', 'cityName','postalCode' ,'address'].includes(column)){
        column=`addressInfo.${column}`
      }
        this.filterKeys[column] = {
          "$regex": each,
          "$options": "i"
        }}
    });

    let payload = this.commonService.filterList()
    payload.query = this.filterKeys
    payload.sort = {
      "desc": ["updatedOn"]
    }
    this.commonService.getSTList("partymaster", payload).subscribe((data) => {
      this.yardcfs = data.documents;
      this.dataSource.data = data.documents.map((s: any, i: number) => ({
        ...s,
        name: s.name,
        partyShortcode:s.partyShortcode,
        countryName: s.countryName,
        primaryMailId:s.primaryMailId,
        address:s.address,
        status:s.status,
        companyType:(s?.customerType??[])?.map(r=>r?.item_text)?.join(',')
      }));
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort1;

    });


  }

  clearFilters() {
    this.filtersModel = [];
    this.filterKeys = {};
    this.getPartyList();
  }
  pageNumber = 1;
  pageSize = 10;
  from = 0;
  totalCount = 0;

  onPageChange(event){
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.from = event.pageIndex*event.pageSize ;
    this.getPartyList();
  }

  getPartyList() {
    this.loaderService.showcircle();
    let payload = this.commonService.filterList()
    payload.query = {
      "$and": [
        {
          "customerType.item_text": {
            "$ne": "Vendor",
          }
        }
      ]
    }
    if (this.selectedStatus === true || this.selectedStatus === false || this.selectedStatus !== '') {
      payload.query["$and"].push({
        "status": this.selectedStatus
      });
    }
    payload.size = this.pageSize
    payload.from = this.from
    payload.sort = {
       "desc" : ["updatedOn"]
    },
this.fromSize = 1
    this.commonService.getSTList("partymaster", payload).subscribe((data) => {
      this.smartAgentList = data.documents;

      if (data && data?.documents) {
        this.dataSource.data = data.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1+this.from,
          name: s.name,
          partyShortcode: s.partyShortcode,
          countryName: s?.addressInfo?.countryName,
          stateName:s?.addressInfo?.stateName,
          cityName:s?.addressInfo?.cityName,
          postalCode:s?.addressInfo?.postalCode,
          primaryMailId:s.primaryMailId,
          panNo:s.panNo,
          status:s.status,
          companyType:(s?.customerType??[])?.map(r=>r?.item_text)?.join(',')
          
        }));
        // this.dataSource.paginator = this.paginator;?\
        this.dataSource.sort = this.sort1; 
        this.toalLength = data.totalCount;
        this.count = data.documents.length;
        this.loaderService.hidecircle(); 
      }
    });
  }

  clear() {
    this.agentProfileName = "";
    this.phoneNo = "";
    this.emailAddress = "";
    this.country = "";
    this.status = "";
    this.annualTurnover = "";
    this.refundAccCode = "";
    this.brokerageAccCode = "";
    this.panNo = "";
    this.bankName = "";
    this.customerAccNo = "";
    this.customerAcCode = "";
    this.brokeragePayable = "";
    this.serviceTax = "";
    this.serviceTaxExmp = "";
    this.getPartyList()
  }
  changeStatus(data) {
    this.commonService.UpdateToST(`partymaster/${data.partymasterId}`, { ...data, status: !data?.status, apiType: 'status' }).subscribe((res: any) => {
      if (res) {
        this.notification.create(
          'success',
          'Status Updated Successfully',
          ''
        );
        this.getPartyList()
      }
    }, error => {
      this.notification.create(
        'error',
        error?.error?.error?.message,
        ''
      );
    });
  }
  sort(colName) {

    if (this.order) {
      if (colName.split('.')[1]) {
        this.smartAgentList = this.smartAgentList.sort((a, b) => (a[colName.split('.')[0]][colName.split('.')[1]] < b[colName.split('.')[0]][colName.split('.')[1]] ? -1 : 1));
      } else {
        this.smartAgentList = this.smartAgentList.sort((a, b) => (a[colName] < b[colName] ? -1 : 1));
      }

    } else {
      if (colName.split('.')[1]) {
        this.smartAgentList = this.smartAgentList.sort((a, b) => (a[colName.split('.')[0]][colName.split('.')[1]] > b[colName.split('.')[0]][colName.split('.')[1]] ? -1 : 1));
      } else {
        this.smartAgentList = this.smartAgentList.sort((a, b) => (a[colName] > b[colName] ? -1 : 1));
      }
    }
    this.order = !this.order;
  }
  next() {
    if (this.toalLength > this.count) {
      this.getPaginationData('next')
    }
  }

  prev() {
    if (this.page > 0 && this.page !== 1) {
      this.getPaginationData('prev')
    }
  }

  filter(e) {
    this.size = e.target.value;
    this.fromSize = 1;
    this.getPartyList()
  }

  search() {
    let mustArray = {};
    this.agentProfileName =  this.agentProfileName?.trim();
    this.emailAddress = this.emailAddress?.trim();
     this.country = this.country?.trim();
     this.panNo = this.panNo?.trim();
    if (this.agentProfileName) {
      mustArray['name'] = {
        "$regex" : this.agentProfileName,
        "$options": "i"
    }
    }
// for future use
    // if (this.phoneNo) {
    //   mustArray['primaryNo.primaryNo'] = {
    //     "$regex" : this.phoneNo,
    //     "$options": "i"
    // }
    // }
    if (this.emailAddress) {
      mustArray['primaryMailId'] = {
        "$regex" : this.emailAddress,
        "$options": "i"
    }
    }
    if (this.country) {
      mustArray['addressInfo.countryName'] = {
        "$regex" : this.country,
        "$options": "i"
    }
    }
  
 
    if (this.status) {
      mustArray['status'] = this.status === 'true'? true : false
    }

    mustArray['$and'] = [
      {
        "customerType.item_text": {
          "$ne": "Vendor",
        }
      }
    ]
    let payload = this.commonService.filterList()
    payload.query = mustArray
    payload.size = Number(this.size)
    payload.from = 0
    payload.sort = {
       "desc" : ["updatedOn"]
    },

    this.commonService.getSTList("partymaster", payload).subscribe((data) => {
      this.smartAgentList = data.documents;
      this.toalLength = data.totalCount;
      this.count = data.documents.length;
      this.fromSize =1
    })
  }

  getPaginationData(type: any) {

    this.fromSize = type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;


    let payload = this.commonService.filterList()
    payload.query = {
      "$and": [
        {
          "customerType.item_text": {
            "$ne": "Vendor",
          }
        }
      ]
    }
    payload.size = Number(this.size)
    payload.from = this.fromSize -1
    payload.sort = {
       "desc" : ["updatedOn"]
    },

    this.commonService.getSTList("partymaster", payload).subscribe(data => {
      this.smartAgentList = data.documents;
      this.toalLength = data.totalCount;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count = type === 'prev' ? this.toalLength === this.count ? this.count -  ((this.toalLength % Number(this.size))>0?(this.toalLength % Number(this.size)):(Number(this.size))): this.count - data.documents.length : this.count + data.documents.length
    })
  }

  onOpenNew() {
    this.router.navigate(['address-book/add-address-book'])
    // this.getPartyMaster = null;
    // const modalRef = this.modalService.open(content, {
      // ariaLabelledBy: 'modal-basic-title',
      // backdrop: 'static',
      // keyboard: false,
      // centered: true,
      // size: 'lg',
    // });
    // modalRef.componentInstance?.getList?.subscribe((res: any) => {
    //   if (res) {
    //     this.getPartyList();
    //   }
    // })
    // this.clear();
  }

  onOpenEdit(partyData, show?) {
    // this.commonService.storeEditID = partyData?.partymasterId;
  
    // this.getPartyMaster = partyData;
    // this.modalService.open(content, {
    //   ariaLabelledBy: 'modal-basic-title',
    //   backdrop: 'static',
    //   keyboard: false,
    //   centered: true,
    //   size: 'lg',
    // });
     this.show= show === 'show' 
    // this.clear();
    if(show){
      this.router.navigate(['address-book/list/'+partyData?.partymasterId+'/show'])
    }else{
      this.router.navigate(['address-book/list/'+partyData?.partymasterId+'/edit'])
    }
  }

  onDelete(deletesystemType,id) {
    this.modalService
      .open(deletesystemType, {
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
            let data =`partymaster/${id.partymasterId}`
            this.commonService.deleteST(data).subscribe((res: any) => {
              if (res) {
                // use setimeout for fatching data after delete operation
                this.notification.create('success', 'Deleted successfully', '');
                setTimeout(() => {
                  this.getPartyList();
                }, 1000);
               
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
  printData() {
    var divToPrint = document.getElementById("tablerecords");
    var newWin = window.open("");
    newWin.document.write(divToPrint.outerHTML);
    newWin.print();
    newWin.close();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  getRefreshPartyMasterList() {
    setTimeout(() => {
      this.loaderService.hidecircle()
      this.getPartyList();
    }, 1000);

  }

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.smartAgentList.map((row: any) => {
      storeEnquiryData.push({
        'Name': row.name,
        'ShortName': row.partyShortcode,
        'Country': row.addressInfo?.countryName,
        'state':row.addressInfo?.stateName,
        'City':row.addressInfo?.cityName,
        'pinCode':row.addressInfo?.postalCode,

    // for future use
        // 'Phone No.': row.primaryNo?.primaryNo,
        'Email Address': row.primaryMailId,
        'Address':row?.addressInfo?.address,
        "companyType":(row?.customerType??[])?.map(r=>r?.item_text)?.join(','),
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

    const fileName = 'party-master.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  openPDF() {
    const prepare=[];
    this.smartAgentList.forEach(e=>{
      let tempObj =[];
      tempObj.push(e.name);
      tempObj.push(e.partyShortcode);
      tempObj.push(e.addressInfo?.countryName);
      tempObj.push(e.addressInfo?.stateName);
      tempObj.push(e.addressInfo?.cityName);
      tempObj.push(e.addressInfo?.postalCode);
      tempObj.push(e.addressInfo?.address)
      // for future use
      // tempObj.push(e.primaryNo?.primaryNo);
      tempObj.push(e.primaryMailId);
      const customerTypes = (e.customerType ?? []).map(r => r?.item_text).join(',');
      tempObj.push(customerTypes);
      // tempObj.push(e.panNo);
    
      tempObj.push(e.status ? "Active" : "Inactive");
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [497, 410]);
    autoTable(doc,{
        head: [['name','partyShortcode','countryName','stateName','cityName','postalCode','address','primaryMailId','companyType','status']],
        body: prepare,
        didDrawCell: (data) => {
          // Draw border lines for each cell
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'S');
      }
    });
    doc.save('party-master' + '.pdf');
  }
  selectedStatus: any ;
  onTabChange(event: any): void {
    const tabIndex = event.index;
    switch(tabIndex) {
      case 0:
        this.selectedStatus = '';
        break;
      case 1:
        this.selectedStatus = true; // 'Active' tab
        break;
      case 2:
        this.selectedStatus = 'Quoted'; 
        break;
      case 3:
        this.selectedStatus = 'DNU';
        break;
      case 4:
        this.selectedStatus = 'Lead'; 
        break;
      case 5:
        this.selectedStatus = false; // 'InActive' tab
        break;
    }
    this.getPartyList();
  }
}
