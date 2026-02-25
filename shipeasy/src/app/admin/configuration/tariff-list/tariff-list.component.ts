import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { enquiryList } from 'src/app/services/Enquiry-smartagent/Enquiry';
import { EnquiryService } from 'src/app/services/Enquiry-smartagent/enquiry.service';
import { TransactionService } from 'src/app/services/transaction/transaction.service'; 
import { NzNotificationService } from 'ng-zorro-antd/notification'; 
import { BaseBody } from 'src/app/admin/smartagent/base-body-max';
import * as XLSX from "xlsx";
import { HttpClient } from '@angular/common/http';
import { CommonService } from 'src/app/services/common/common.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { DatePipe } from '@angular/common';
import { Enquiry, Port, ratemaster } from 'src/app/models/tariff-list';
import { CountryData } from 'src/app/models/city-master';
import { SystemType } from 'src/app/models/system-type';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
declare var $: any;
interface MyParams {
  id: number;
  name: string;
}
@Component({
  selector: 'app-tariff-list',
  templateUrl: 'tariff-list.component.html',
  styleUrls: ['tariff-list.component.css'],
})
export class TariffListComponent implements OnInit {
  isDisable = false;
  order: boolean = true;
  key: string = 'id';
  resev: boolean = false;
  enquiryData = '';
  closeResult: string;
  enquiryId = 1;
  enquiryRow: enquiryList;
  fromSize: number = 1;
  toalLength: number;
  size = 20;
  page = 1;
  count = 0;
  agentProfileName: string;
  enquiryList: Enquiry[] = [];
  vessel_name: string;
  enquiry_No: string;
  voyage_No: string;
  port_name: string;
  principal_Name: string;
  agencyType_Name: string;
  enquiryCreationDate:string;
  agentSpoc_Name: string;
  segment_Name: string;
  status_enquiry: string;
  eta_date: string;
  createdon: string;
  pda_created_on: string;
  daStatus : string;
  pdaGenerationDate:string;
  port:string;
  terminal:string;
  berth:string;
  outerAnchoragehrs:string;
  costItems:string
  costitems:string;
  movement:string;
  vesselType:string;
  purposeCall:string;
  tariffList:ratemaster[]=[];
  portDetails:Port[];
  baseBody:string;
  portList:Port[];
  urlParam:MyParams;
  country:string;
  countryList:CountryData[];
  vesselTypeList:SystemType[];
  tariffBasedOn:string;
  tariffRuleName:string;
  inlineRadioOptions:any;
  _gc=GlobalConstants;
  dataSource = new MatTableDataSource();
  pagenation = [10,20, 50, 100];
  email:any
  yardcfs:any
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns =[
    '#', 
    'action',
   'tariffRuleName',
   'countryName',
   'portName',
   'terminalName',
   'berthName',
   'vesselType',
   'updatedOn'
  ];
  isMaster: boolean = false;

  constructor(
    private router: Router,
    private modalService: NgbModal,
    private _sharedService:SharedService,
    private activatedRoute: ActivatedRoute,
    private saMasterService: SaMasterService,
    private mastersService: MastersService,
    private enquiryservice: EnquiryService,
    private transactionService: TransactionService,
    private notification: NzNotificationService,
    private datePipe: DatePipe,
    private http: HttpClient,private route:Router,
    private commonService : CommonService,
    public loaderService: LoaderService,
  ) {
    this.activatedRoute.params?.subscribe(params =>
      this.urlParam = params as MyParams
    );
  }

  open(content) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
    });
  }

  vvoye() {
    let arr = []

    let payload = this.commonService.filterList()
    if(payload?.sort)payload.sort = {
      "desc" : ["updatedOn"]
   }

   let mustArray = {};
   this.commonService.getSTList('ratemaster', payload)?.subscribe((res: any) => {
      if (res && res.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1,
          tariffRuleName: s.tariffRuleName,
          countryName: s.countryName,
          portName: s.portName,
          terminalName: s.terminalName,
          berthName: s.berthName,
          vesselType: s.vesselType,
          updatedOn: s.updatedOn
        }));
        
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1; 
      } else {
      }
    }, (error: any) => { 
    });
  }

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.email.map((row: any) => {
      storeEnquiryData.push({
        'tariffRuleName' : row?.element?.tariffRuleName,
        'countryName' : row?.element?.countryName,
        'portName' : row?.element?.portName,
        'terminalName': row?.element?.terminalName,
        'berthName': row?.element?.berthName,
        'vesselType': row?.element?.vesselType,
        'updatedOn': row?.element?.updatedOn
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
    if(payload?.sort)payload.sort = {
      "desc": ["updatedOn"]
    }
    this.commonService.getSTList('ratemaster', payload)?.subscribe((data) => {
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
    this.vvoye()
  }


  onEdit(i){
    this.route.navigate(['/configuration/list/'+i.ratemasterId+'/edit']);

  }

  cloneItem(id){
    this.route.navigate(['/configuration/list/'+id+'/clone']);
  }



  getTariffList(){
    this.loaderService.showcircle();
    let arr = []
    let payload = this.commonService.filterList()
    if(payload?.sort)payload.sort = {
      "desc" : ["updatedOn"]
   }
   let mustArray = {};
   this.tariffRuleName = this.tariffRuleName?.trim();
   this.port = this.port?.trim();
   this.country = this.country?.trim();
   this.terminal = this.terminal?.trim();
   this.berth = this.berth?.trim();
   this.vesselType = this.vesselType?.trim();
   
   if(this.tariffRuleName){
     mustArray['tariffRuleName'] = {
       "$regex" : this.tariffRuleName,
       "$options": "i"
   }
   }
   if (this.country) {
     mustArray['countryName'] = {
       "$regex" : this.country,
       "$options": "i"
   }
   }
   if (this.port) {
     mustArray['portName'] = {
       "$regex" : this.port,
       "$options": "i"
   }
   }
   if (this.terminal) {
     mustArray['terminal.item_text'] = {
       "$regex" : this.terminal,
       "$options": "i"
   }
   }
   if (this.berth) {
     mustArray['berth.item_text'] = {
       "$regex" : this.berth,
       "$options": "i"
   }
   }
 
   if (this.vesselType) {
     mustArray['vesselType.item_text'] = {
       "$regex" : this.vesselType,
       "$options": "i"
   }
   } 
    
   if (this.createdon) {
     mustArray['updatedOn']= {
       "$gt" : this.createdon.substring(0, 10) + 'T00:00:00.000Z',
       "$lt" : this.createdon.substring(0, 10) + 'T23:59:00.000Z'
   }
   }
 
 
   if(payload?.query)payload.query = mustArray
   if(payload?.size)payload.size = Number(this.size)
   if(payload?.from)payload.from = this.page -1
    this.commonService.getSTList('ratemaster', payload)?.subscribe((data) => {
      this.tariffList = data.documents;
      this.tariffList.forEach(e => {
        let berthArr = []
        if (e.berth) {
          e.berth.forEach(item => {
            berthArr.push(item.item_text)
          })
        }
        e.berthName = berthArr ? berthArr : [];
        let termArr = []
        if (e.terminal) {
          e.terminal.forEach(item => {
            termArr.push(item.item_text)
          })
        }
        e.terminalName = termArr ? termArr : [];
        e.inputLength = e?.costItems?.length
        if (this.countryList) {
          this.countryList.forEach(el => {
            if (el.countryId === e.country) {
              e.country = el.countryName
            }
          })
        }
        if (e.vesselType) {
          let vesselArr = []
          e.vesselType.forEach(el => {
            vesselArr.push(el.item_text)
          })
          e.vesselType = vesselArr
        }

        if (this.portList) {
          this.portList.forEach(e1 => {
            if (e1.portId === e.port) {
              e.portName = e1.portDetails.portName
              arr.push(e)

            }
          })
        }
      });
      this.toalLength = data.totalCount;
      this.count = data.documents.length;
      this.loaderService.hidecircle();
    },()=>{
      this.loaderService.hidecircle();
    });
    this.tariffList = arr
  }


  removeRow(content1, id) {
    this.modalService
      .open(content1, {
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
            let deleteBody = `ratemaster/${id}`
            this.commonService.deleteST(deleteBody)?.subscribe((res: any) => {
              if (res) {
                this.getTariffList();
                this.notification.create('success', 'Deleted Successfully', '');
                
                window.location.reload()
              }

            }, 
            
            error => {
              this.notification.create(
                'error',
               error?.error?.error?.message,
                ''
              );
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

  sort(colName) {

    if (this.order) {
      let newdata = this.tariffList.sort((a, b) =>
        a[colName] > b[colName] ? 1 : -1
      );
      this.tariffList = newdata;
    } else {
      let newdata = this.tariffList.sort((a, b) =>
        b[colName] > a[colName] ? 1 : -1
      );
      this.tariffList = newdata;
    }
    this.order = !this.order;
  }

  ngOnInit(): void {
    this.getCountryList()
    this.getVesselType()
    this.getTariffList()
    this.getPortList()
    this.vvoye()
  }


  getVesselType() {
  
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {"status": true, "typeCategory": {
      "$in": [
        'vessel type','vessel category','Vessel Category','vesselType'
      ]
    }}
    this.commonService.getSTList('systemtype', payload)?.subscribe((res: any) => {
      this.vesselTypeList = res?.documents;
    })
  }

  getCountryList() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = { "status": true}
    this.commonService.getSTList('country', payload)?.subscribe((data) => {
      this.countryList = data.documents;
    });
  }

  getPortList(){
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {"status": true }
    this.commonService.getSTList('port', payload)?.subscribe(data =>{
      this.portList=data?.documents;
      this.getTariffList();

    })
  }
  getEnquiryList() {

    let mustArray = {}
    if (this.commonService.dashboardKey !== '') {
      this.daStatus = this.commonService.dashboardKey
      mustArray['daStatus'] = this.daStatus
    }
  
    let payload = this.commonService.filterList()
    payload.query = mustArray

    this.commonService.getSTList('enquiry', payload)?.subscribe((data) => {
      this.enquiryList = data.documents;

    });
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
    this.getTariffList();
  }
  clear() {
    this.tariffRuleName=''
    this.port=''
    this.vesselType=''
    this.terminal=''
    this.berth = ''
    this.country=''
    this.createdon=''
    this.getTariffList();
  }
  search() {
    let mustArray = {};
    this.tariffRuleName = this.tariffRuleName?.trim();
    this.port = this.port?.trim();
    this.country = this.country?.trim();
    this.terminal = this.terminal?.trim();
    this.berth = this.berth?.trim();
    this.vesselType = this.vesselType?.trim();
    
    if(this.tariffRuleName){
      mustArray['tariffRuleName'] = {
        "$regex" : this.tariffRuleName,
        "$options": "i"
    }
    }
    if (this.country) {
      mustArray['countryName'] = {
        "$regex" : this.country,
        "$options": "i"
    }
    }
    if (this.port) {
      mustArray['portName'] = {
        "$regex" : this.port,
        "$options": "i"
    }
    }
    if (this.terminal) {
      mustArray['terminal.item_text'] = {
        "$regex" : this.terminal,
        "$options": "i"
    }
    }
    if (this.berth) {
      mustArray['berth.item_text'] = {
        "$regex" : this.berth,
        "$options": "i"
    }
    }
  
    if (this.vesselType) {
      mustArray['vesselType.item_text'] = {
        "$regex" : this.vesselType,
        "$options": "i"
    }
    } 
     
    if (this.createdon) {
      mustArray['updatedOn']= {
        "$gt" : this.createdon.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.createdon.substring(0, 10) + 'T23:59:00.000Z'
    }
    }
  
  

    let payload = this.commonService.filterList()
    payload.query = mustArray
    if(payload?.sort)payload.sort = {
      "desc" : ["updatedOn"]
   }
   if(payload?.size)payload.size = Number(this.size)
   payload.from = 0,
    this.commonService.getSTList('ratemaster', payload)?.subscribe((data) => {
      this.tariffList = data.documents?.map((s: any,index) => {
        return{
          ...s,
          id:index+1
        }
      })
      // this.doCommonThing(); BECAUSE OF THIS GETTING ERROR WHIULE SEARCHING
      this.toalLength = data.totalCount;
      this.count = data.documents.length;
      this.fromSize = 1
    });
  }


  doCommonThing(){
    let arr = [];
    this.tariffList.forEach(e=>{
      let berthArr = []
      if(e.berth)
     { e.berth.forEach(item=>{
        berthArr.push(item.item_text)
      })
    }
      e.berthName =berthArr ? berthArr : []
      let terminalArr = []

      if(e.terminal)
     { e.terminal.forEach(item=>{
        terminalArr.push(item.item_text)
      })
    }
      e.terminalName =terminalArr ? terminalArr : []
      e.inputLength = e?.costItems?.length
      if(this.countryList){
        this.countryList.forEach(el=>{
          if(el.countryId === e.country){
            e.country = el.countryName
          }
        })
       }
       if(e.vesselType){
        let vesselArr = []
        e.vesselType.forEach(el=>{
          vesselArr.push(el.item_text)
        })
        e.vesselType = vesselArr
       }

      if(this.portList){
        this.portList.forEach(e1=>{
          if(e1.portId === e.port){
            e.portName = e1.portDetails.portName

            arr.push(e)

          }
        })
      }
    });
    this.tariffList = arr;
  }

  getPaginationData(type: any) {
    this.fromSize =
    type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;

   
    let arr = []

    let payload = this.commonService.filterList()
    if(payload?.sort)payload.sort = {
      "desc" : ["updatedOn"]
   }

   let mustArray = {};
   this.tariffRuleName = this.tariffRuleName?.trim();
   this.port = this.port?.trim();
   this.country = this.country?.trim();
   this.terminal = this.terminal?.trim();
   this.berth = this.berth?.trim();
   this.vesselType = this.vesselType?.trim();
   
   if(this.tariffRuleName){
     mustArray['tariffRuleName'] = {
       "$regex" : this.tariffRuleName,
       "$options": "i"
   }
   }
   if (this.country) {
     mustArray['countryName'] = {
       "$regex" : this.country,
       "$options": "i"
   }
   }
   if (this.port) {
     mustArray['portName'] = {
       "$regex" : this.port,
       "$options": "i"
   }
   }
   if (this.terminal) {
     mustArray['terminal.item_text'] = {
       "$regex" : this.terminal,
       "$options": "i"
   }
   }
   if (this.berth) {
     mustArray['berth.item_text'] = {
       "$regex" : this.berth,
       "$options": "i"
   }
   }
 
   if (this.vesselType) {
     mustArray['vesselType.item_text'] = {
       "$regex" : this.vesselType,
       "$options": "i"
   }
   } 
    
   if (this.createdon) {
     mustArray['updatedOn']= {
       "$gt" : this.createdon.substring(0, 10) + 'T00:00:00.000Z',
       "$lt" : this.createdon.substring(0, 10) + 'T23:59:00.000Z'
   }
   }
 
 
   payload.query = mustArray
   if(payload?.size)payload.size = Number(this.size)
   payload.from = this.fromSize -1 ,
    this.commonService.getSTList('ratemaster', payload)?.subscribe((data) => {
      this.tariffList = data.documents;
      this.toalLength = data.totalCount;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count = type === 'prev' ? this.toalLength === this.count ? this.count -  ((this.toalLength % Number(this.size))>0?(this.toalLength % Number(this.size)):(Number(this.size))) : this.count - data.documents.length : this.count + data.documents.length;
      this.tariffList.forEach(e=>{
        let berthArr = []

        if(e.berth)
       { e.berth.forEach(item=>{
          berthArr.push(item.item_text)
        })
      }
        e.berthName =berthArr ? berthArr : []

        let terminalArr = []

        if(e.terminal)
       { e.terminal.forEach(item=>{
          terminalArr.push(item.item_text)
        })
      }
        e.terminalName =terminalArr ? terminalArr : []
        e.inputLength = e?.costItems?.length
        if(this.countryList){
          this.countryList.forEach(el=>{
            if(el.countryId === e.country){
              e.country = el.countryName
            }
          })
         }

         if(e.vesselType){
          let vesselArr = []
          e.vesselType.forEach(el=>{
            vesselArr.push(el.item_text)
          })
          e.vesselType = vesselArr
         }

        if(this.portList){
          this.portList.forEach(e1=>{
            if(e1.portId === e.port){
              e.portName = e1.portDetails.portName
              arr.push(e)
            }
          })
        }
      });
    });
    this.tariffList = arr
  }
  printData() {
    var divToPrint = document.getElementById("tablerecords");
    var newWin = window.open("");
    newWin.document.write(divToPrint.outerHTML);
    newWin.print();
    newWin.close();
  }
  export() {
    let excel = [];
    this.tariffList?.forEach(x => {
      excel.push({
        'Rule Name': x.tariffRuleName,
        'Country': x.countryName,
        'Port': x.portName,
        'Terminal': (x?.terminal??[])?.map(t=>t?.item_text)?.join(','),
        'Berth': (x?.berth??[])?.map(t=>t?.item_text)?.join(','),
        'Vessel Type': (x?.vesselType??[])?.join(','),
        'Created On': new Date(x.updatedOn).toLocaleString() // Format date as needed
        // Add more fields as needed
      });
    });
    const myworksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excel);
    const myworkbook: XLSX.WorkBook = {
      Sheets: { data: myworksheet },
      SheetNames: ["data"],
    };
    const excelBuffer: any = XLSX.write(myworkbook, {
      bookType: "xlsx",
      type: "array",
    });
  
    const fileName = "TariffInputsList.xlsx";
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }
  
  openTariff(){
    this.router.navigate(['/configuration/add']);
  }
}
