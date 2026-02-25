import { Component, OnInit, ViewChild } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { ProfilesService } from "src/app/services/Profiles/profile.service";
import { CommonFunctions } from "src/app/shared/functions/common.function";
import { smartagent } from "./data";
import { NzNotificationService } from 'ng-zorro-antd/notification';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { CommonService } from "src/app/services/common/common.service";
import { MatTableDataSource } from "@angular/material/table";
import { MatDrawer } from "@angular/material/sidenav";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'capitalize'
})
export class CapitalizePipe implements PipeTransform {

  transform(value: string): string {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }

}

@Component({
  selector: "app-smartagent",
  templateUrl: "./smartagent.component.html",
  styleUrls: ["./smartagent.component.css"],
})
export class SmartagentComponent implements OnInit {
  tabs = smartagent.masterTabs;
  urlParam: any;
  holdControl: any ;
  smartAgentList: any = [];

  isProductList: boolean = true;
  isTemplateList: boolean = true;

  fromSize: number = 1;
  toalLength: any;
  size = 10;
  page = 1;
  count = 0;
  agentProfileName: any;
  phoneNo: any;
  emailAddress: any;
  country: any;
  status: any;


  @ViewChild(MatDrawer) drawer: MatDrawer | any;
  dataSource = new MatTableDataSource();
  pagenation = [20, 50, 100];
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns =[
    '#',
    'agentName',
    'primaryNo.primaryNumber', 
    'primaryMailId',
    'primaryNo.addressInfo.countryName',
    'action', 
  ];
  displayedColumns1 = this.displayedColumns.map((x, i) => x+'_'+i);

  masterTabs = [
    {  name: "Register Companies", id: "details-tab", control: "details", status: 1, key: "list"},
    { name: "Trials / Requested Companies", id: "branch-tab", control: "branch", status: 0, key: "request" },
    { name: "Ticket", id: "ticketadmin-tab", control: "ticketAdmin", status: 0, key: "ticketlist" }]

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public translate: TranslateService,
    private profilesService: ProfilesService,
    public commonService: CommonService,
    public commonfunction: CommonFunctions,
    private notification: NzNotificationService,
  ) {
    // this.commonService.storeEditID = this.commonfunction.getUserDetails().orgId;
    this.displayedColumns1 = this.displayedColumns.map((x, i) => x+'_'+i);
    this.holdControl = window.location.href.split('?')[0].split('/').pop();
  }


  onTab(data) {
    this.router.navigate(["/register/" + data.key]);
    // this.holdControl = data.key;
    this.holdControl = data.key.split('/').pop();
  }

  ngOnInit(): void {
    // this.getSmartAgentList();
    // this.tabs.forEach((item, index) => {
    //   this.translate.get("smartagent").subscribe((data: any) => {
    //     let langKey = data.smartAgent.tab;
    //     switch (item.key) {
    //       case "details":
    //         item.name = langKey.details;
    //         break;
    //       case "branch":
    //         item.name = langKey.branch;
    //         break;
    //       case "prot":
    //         item.name = langKey.prot;
    //         break;
    //       case "bank":
    //         item.name = langKey.bank;
    //         break;
    //       case "contacts":
    //         item.name = langKey.contacts;
    //         break;
    //       case "holiday":
    //         item.name = langKey.holiday;
    //         break;
    //     }
    //   });
    // });
  }

  getSmartAgentList() {

    let payload = this.commonService.filterList()

    if(payload?.size)payload.size =Number(this.size);
    if(payload?.from)payload.from = this.page - 1;
    if(payload?.query)payload.query = {
      }
      if(payload?.sort)payload.sort = {
      "desc" : ["updatedOn"]
    },
    this.commonService.getSTList('agent',payload).subscribe((data) => {
      this.smartAgentList = data.documents;
      this.toalLength = data.totalCount;
      this.count = data.documents.length;


      this.dataSource = new MatTableDataSource(
        data?.documents?.map((s: any) => s)
      );
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort1;

    });
  }

  clear() {
    this.agentProfileName = ''
    this.phoneNo = ''
    this.emailAddress = ''
    this.country = '';
    this.status = '';
    this.getSmartAgentList()
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
    this.getSmartAgentList()
  }

  search() {
    let mustArray = {};
    if (this.agentProfileName) {
      mustArray['agentName'] = {
        "$regex" : this.agentProfileName,
        "$options": "i"
    }
    }
    if (this.phoneNo) {
      mustArray['primaryNo.primaryNumber'] = {
        "$regex" : this.phoneNo,
        "$options": "i"
    }
    }
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
      mustArray['status'] = this.status
    }
    
  

    let payload = this.commonService.filterList()

    payload.size =Number(this.size);
    payload.from = this.page - 1;
    payload.query = mustArray
    payload.sort = {
      "desc" : ["updatedOn"]
    },
    this.commonService.getSTList('agent',payload).subscribe((data) => {
      this.smartAgentList = data.documents;
      this.toalLength = data.totalCount;
      this.count = data.documents.length
      this.fromSize =1
    })
  }

  getPaginationData(type: any) {
    this.fromSize = type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;

    let payload = this.commonService.filterList()

    payload.size =Number(this.size);
    payload.from = this.fromSize - 1;
    payload.query = {
      }
    payload.sort = {
      "desc" : ["updatedOn"]
    },
    this.commonService.getSTList('agent',payload).subscribe(data => {
      this.smartAgentList = data.documents;
      this.toalLength = data.totalCount;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count = type === 'prev' ? this.toalLength === this.count ? this.count - (this.toalLength % Number(this.size)) : this.count - data.documents.length : this.count + data.documents.length;
    })
  }

  onOpenNew() {
    // this.commonService.storeEditID = '';
    this.router.navigate(["/register/list/" + "details" + "/addsmart"]);
  }

  onOpenEdit(agentId) {
    // this.commonService.storeEditID = agentId;
    this.router.navigate([
      "/register/list/" + agentId + "/" + "details" + "/editsmart",
    ]);
  }

  onDelete(agentId: any) {
    let deleteBody = "agent"+ agentId
    this.commonService.deleteST(deleteBody).subscribe((data: any) => {
      if (data) {
        this.getSmartAgentList();
      }
    });
  }
  printData() {
    var prepare = [];
    this.smartAgentList.forEach(e => {
      var tempObj = [];

      tempObj.push(e.agentName);
      tempObj.push(e.primaryNo?.primaryNumber);
      tempObj.push(e.primaryMailId);
      tempObj.push(e.addressInfo?.countryName);
      tempObj.push(e.status ? "Active" : "In Active");
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [497, 410]);
    autoTable(doc, {
      head: [['Agent Profile Name', 'Phone No.', 'Email Address', 'Country', 'Status']],
      body: prepare
    });
    doc.save('Company-Profile' + '.pdf');
  }
  changeStatus(data) {
    this.commonService.UpdateToST(`agent/${data.agentId}`, { ...data, status: !data?.status }).subscribe((res: any) => {
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
  applyFilter(filterValue: string) { 
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase();

   
    this.dataSource.filterPredicate = (data, filter) => {
      return JSON.stringify(data).toLowerCase().includes(filter);
    };

    this.dataSource.filter = filterValue;
  }
  export() {
    const modifiedTableData = this.dataSource?.filteredData;
    const tableColumns = this.displayedColumns;
    const tableData = modifiedTableData || [];
    const columnsToHide = ['status','action'];
    const actualColumns = this.displayedColumns;
    this.commonfunction.exportToExcel(
      tableColumns,
      tableData,
      columnsToHide,
      'Job',
      this.displayedColumns,
      actualColumns
    );
  } 
  toggleFilters = true;
  filtersModel = [];
  filterKeys = {};

  searchColumns() {
    this.filterKeys = {};
    this.filtersModel.forEach((each, ind) => {
      if(each){

      if (this.displayedColumns[ind] == 'createdOn') {
        this.filterKeys['createdOn'] = {
          "$gt": each.substring(0, 10) + 'T00:00:00.000Z',
          "$lt": each.substring(0, 10) + 'T23:59:00.000Z'
        };
      } else {
        this.filterKeys[this.displayedColumns[ind]] = {
          "$regex": each.toLowerCase(),
          "$options": "i"
        }
      }  
    } 
  });
  
 
  this.page = 1;
  this.fromSize = 1;
  var parameter = {
    "project": [ ],
    "query": { ...this.filterKeys,   },
    "sort" :{
        "desc" : ["createdOn"]
    },
    size: Number(10000),
    from: this.page - 1,
}
   
    this.commonService.getSTList('agent',parameter).subscribe((data) => {
      this.smartAgentList = data.documents;
      this.toalLength = data.totalCount;
      this.count = data.documents.length;


      this.dataSource = new MatTableDataSource(
        data?.documents?.map((s: any) => s)
      );
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort1;
      this.getSORT()
    });
 
  }
  getSORT(){
    this.dataSource.sort = this.sort1;
    // Define custom sorting function for the column
    this.dataSource.sortingDataAccessor = (item:any, property) => {
      switch (property) { 

        case 'agentName': return item?.enquiryDetails?.enquiryNo || ''; 
        case 'primaryNo.primaryNumber': return item?.primaryNo.primaryNumber || '';  
        case 'primaryMailId': return item?.primaryNo.primaryMailId || ''; 
        case 'primaryNo.addressInfo.countryName': return item?.primaryNo.addressInfo.countryName || ''; 
 

        default: return item[property];
      }
    };
  }
  clearFilters() {
    this.filtersModel = [];
    this.filterKeys = {};
    this.getSmartAgentList();
  }
}
