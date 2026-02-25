import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { ApiService } from '../principal/api.service';
import { CommonService } from 'src/app/services/common/common.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import * as converter from 'xml-js';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { LoaderService } from 'src/app/services/loader.service';

import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { AgentAdvice, ContainerInfo } from 'src/app/models/agent-advise';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
@Component({
  selector: 'app-agent-advise',
  templateUrl: './agent-advise.component.html',
  styleUrls: ['./agent-advise.component.scss'],
})
export class AgentAdviseComponent implements OnInit {
  agentData: AgentAdvice[] = [];
  toalLength: any;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  ref_no: string;
  quote_no: string;
  tank_type: string;
  _gc=GlobalConstants
  location: string;
  shipper: string;
  consignee: string;
  product: string;
  move_no: string;
  move_type: string;
  shipment_type: string;
  notify_party: string;
  invoice_party: string;
  shipping_line: string;
  tank_type1: string;
  status: string;
  closeResult: string;
  importAgentAdviceDetail: any;
  globalSearch: string;
  containerList: ContainerInfo[] = [];
  @ViewChild('content') content;
  selectedShipmentTypes: string[] = [];
  @ViewChild(MatDrawer) drawer: MatDrawer | any;
  dataSource = new MatTableDataSource();
  pagenation = [20, 50, 100];
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns = [
    '#',
    'agentadviceNo',
    'agentAdviseStatus',  
    'createdOn',
    "basicDetails.ShipmentTypeName",
    'basicDetails.loadType',
    'basicDetails.billingPartyName',

    'basicDetails.billingBranch',
    'basicDetails.userBranchName',
    'basicDetails.shipperName',
    'basicDetails.consigneeName',

    'routeDetails.loadPortName',
    'routeDetails.destPortName',
    'shippingTermName', 
    'action',
  ];
  constructor(
    public loaderService: LoaderService,
    private tranService: TransactionService,
    public modalService: NgbModal,
    private api: ApiService,
    public commonService: CommonService,
    public notification: NzNotificationService,
    public router: Router, private commonfunction: CommonFunctions
  ) {
    // do nothing.
  }
  openXML() {
    this.modalService.open(this.content, { centered: true });
  }
  changeStatus(data) {
    this.loaderService.showcircle()
    this.commonService
      .UpdateToST(`agentadvice/${data.agentadviceId}`, { ...data, status: !data?.status })
      .subscribe(
        (res: any) => {
          if (res) {

            this.notification.create(
              'success',
              'Status Updated Successfully',
              ''
            );
            setTimeout(() => {
              this.loaderService.hidecircle()
              this.getAgentAdviseList('');

            }, 1000);
          }
        },
        (error) => {
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
  }

  importAgentAdviceFile: any = 'NA'

  async selectFile(event) {
    this.importAgentAdviceDetail = []
    var extension = event.target.files[0].name.substr(
      event.target.files[0].name.lastIndexOf('.')
    );

    if (extension.toLowerCase() === '.xml') {
      const formData = new FormData();
    formData.append('file', event.target.files[0], `${event.target.files[0].name}`);
    formData.append('name', `${event.target.files[0].name}`);
      var data = await this.commonService.uploadDocuments('agentAdvice',formData);
      this.importAgentAdviceFile = event.target.files[0].name
      if (data) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          let xml = e.target.result;
          let result1 = converter.xml2json(xml, { compact: true, spaces: 2 });
          const JSONData = JSON.parse(result1);
          this.importAgentAdviceDetail = JSONData['ns0:NOFAE'];
          this.importAgentAdviceDetail.agentAdviceType = 'EDI'

        };
        reader.readAsText(event.target.files[0]);
      } else {
        this.modalService.dismissAll();
        this.notification.create('error', 'Upload try again', '');
      }
    } else {
      this.notification.create('error', 'Please select XML file only!', '');
    }

  }

  routeTo() {

    let payload = this.commonService.filterList()
    payload.query = {
      "basicDetails.uniqueRefNo": this.importAgentAdviceDetail?.Record?.UniqueRef?._text
    }

    this.commonService.getSTList('agentadvice', payload).subscribe((data) => {

      this.modalService.dismissAll();
      if (data.documents.length > 0) {
        this.notification.create('error', `Already generated ${this.importAgentAdviceDetail?.Record?.UniqueRef?._text}`, '');
        this.importAgentAdviceDetail = []
        this.commonService.agentAdviseData = this.importAgentAdviceDetail

      } else {
        this.commonService.agentAdviseData = this.importAgentAdviceDetail
        this.router.navigate(['/agent-advice/list/add'], { queryParams: { fileName: this.importAgentAdviceFile } });
      }
    });


  }
  ngOnInit(): void {
    setTimeout(() => {
      this.getAgentAdviseList('');
      this.getContainerData()
    }, 1000);

  }
  clearGloble() {
    this.globalSearch = '';
    this.clear()
  }
  getTooltipMessage(agentAdviseStatus: string, quotationCreateStatus: boolean): string {
    switch (agentAdviseStatus) {
      case 'Inquiry Created':
        return quotationCreateStatus
          ? 'Quotation created. Please Create Job'
          : 'Quotation creation is pending. Please click on the Inquiry number.';
      case 'Inquiry Received':
        return 'Please Add Inquiry Details.';
      default:
        return '';
    }
  }
  
  shouldShowTooltip(status: string): boolean {
    return status === 'Inquiry Created' || status === 'Inquiry Received';
  }
  getContainerData() {
    let payload = this.commonService.filterList()
    payload.query = {
      "basicDetails.uniqueRefNo": this.importAgentAdviceDetail?.Record?.UniqueRef?._text
    }

    this.commonService.getSTList('containermaster', payload).subscribe((res: any) => {
      this.containerList = res?.documents;
    });

  }


  searchGlobal() {
    let query = this.globalSearch
    let shouldArray = [];
    shouldArray.push(
      { "basicDetails.uniqueRefNo": { "$regex": query, "$options": "i" } },
      { "basicDetails.stcQutationNo": { "$regex": query, "$options": "i" } },
      { "basicDetails.stcReference": { "$regex": query, "$options": "i" } },
      { "basicDetails.destinationName": { "$regex": query, "$options": "i" } },
      { "shipperDetails.shipperName": { "$regex": query, "$options": "i" } },
      { "shipperDetails.consigneeName": { "$regex": query, "$options": "i" } },
      { "productDetails.productName": { "$regex": query, "$options": "i" } },
      { "basicDetails.moveTypeName": { "$regex": query, "$options": "i" } },
      { "basicDetails.shippping_term": { "$regex": query, "$options": "i" } },
      { "shipperDetails.notifyPartyName": { "$regex": query, "$options": "i" } },
      { "shipperDetails.vendorName": { "$regex": query, "$options": "i" } },
      { "routeDetails.shippingLineName": { "$regex": query, "$options": "i" } },
      { "invoicingPartyName": { "$regex": query, "$options": "i" } },
      { "basicDetails.tankType": { "$regex": query, "$options": "i" } },
      { "basicDetails.moveNo": { "$regex": query, "$options": "i" } },
    )

    var parameter = {
      "project": [],
      "query": {
        "$or": shouldArray
      },
      "sort": {
        "desc": ["updatedOn"]
      },
      size: Number(this.size),
      from: 0,
    }

    this.commonService.getSTList("agentadvice", parameter)
      .subscribe((data: any) => {
        this.agentData = data.documents?.map((s: any,index) => {
          return{
            ...s,
            id:index+1
          }
        });
        this.toalLength = data.totalCount;
        this.count = data.documents.length;
      });
  }
  getAgentAdviseList(statusSelected) {
    this.loaderService.showcircle();
    let payload = this.commonService.filterList()
    payload.query = {
    }
    if(this.selectedShipmentTypes?.length){
      payload.query = {
        ...payload.query,
        'basicDetails.ShipmentTypeName' : this.selectedShipmentTypes?.[0]
      }
    }
    if (statusSelected) {
      payload.query["status"] = statusSelected
    }
    payload.size = Number(10000),
      payload.from = this.page - 1,
      payload.sort = {
        "desc": ["updatedOn"]
      }
    this.commonService.getSTList("agentadvice", payload).subscribe((data) => {
      this.agentData = data.documents
      this.toalLength = data.totalCount;
      this.count = data.documents.length;
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
      this.getSORT()
      this.loaderService.hidecircle();
    },()=>{
      this.loaderService.hidecircle();
    });
  }
  getSORT(){
    this.dataSource.sort = this.sort1;
    // Define custom sorting function for the column
    this.dataSource.sortingDataAccessor = (item:any, property) => {
      switch (property) { 


        case 'basicDetails.loadType': return item?.basicDetails?.loadType || '';  
        case 'createdOn': return item?.createdOn || '';  
        case 'basicDetails.billingPartyName': return item?.basicDetails?.billingPartyName || ''; 
        case 'basicDetails.billingBranch': return item?.basicDetails?.billingBranch || '';  
        case 'basicDetails.userBranchName': return item?.basicDetails?.userBranchName || '';  
        case 'basicDetails.shipperName': return item?.basicDetails?.shipperName || '';  
        case 'basicDetails.consigneeName': return item?.basicDetails?.consigneeName || '';  
    
        case 'routeDetails.loadPortName': return item?.routeDetails?.loadPortName || '';  
        case  'routeDetails.destPortName': return item?.routeDetails?.destPortName || '';  

     
        default: return item[property];
      }
    };
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
    this.getAgentAdviseList('');
  }

  getPaginationData(type: any) {
    this.fromSize =
      type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
    let payload = this.commonService.filterList()
    payload.query = {
    }

    payload.size = Number(this.size),
      payload.from = this.fromSize - 1,
      payload.sort = {
        "desc": ["updatedOn"]
      }
    this.commonService.getSTList("agentadvice", payload).subscribe((data) => {
      this.agentData = data.documents;
      this.toalLength = data.totalCount;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count =
        type === 'prev'
          ? this.toalLength === this.count
            ? this.count - (this.toalLength % Number(this.size))
            : this.count - data.documents.length
          : this.count + data.documents.length;
    });
  }

  search() {
    let mustArray = {};
    if (this.ref_no) {
      mustArray['basicDetails.uniqueRefNo'] = {
        "$regex": this.ref_no,
        "$options": "i"
      }
    }
    if (this.quote_no) {
      mustArray['basicDetails.stcQutationNo'] = {
        "$regex": this.quote_no,
        "$options": "i"
      }
    }
    if (this.tank_type) {
      mustArray['basicDetails.stcReference'] = {
        "$regex": this.tank_type,
        "$options": "i"
      }
    }
    if (this.tank_type1) {
      mustArray['basicDetails.tankType'] = {
        "$regex": this.tank_type1,
        "$options": "i"
      }
    }
    if (this.location) {
      mustArray['basicDetails.destinationName'] = {
        "$regex": this.location,
        "$options": "i"
      }
    }
    if (this.shipper) {
      mustArray['shipperDetails.shipperName'] = {
        "$regex": this.shipper,
        "$options": "i"
      }
    }
    if (this.consignee) {
      mustArray['shipperDetails.consigneeName'] = {
        "$regex": this.consignee,
        "$options": "i"
      }
    }
    if (this.product) {
      mustArray['productDetails.productName'] = {
        "$regex": this.product,
        "$options": "i"
      }
    }
    if (this.move_no) {
      mustArray['basicDetails.moveNo'] = {
        "$regex": this.move_no,
        "$options": "i"
      }
    }
    if (this.move_type) {
      mustArray['basicDetails.moveTypeName'] = {
        "$regex": this.move_type,
        "$options": "i"
      }
    }
    if (this.shipment_type) {
      mustArray['basicDetails.shippping_term'] = {
        "$regex": this.shipment_type,
        "$options": "i"
      }
    }
    if (this.notify_party) {
      mustArray['shipperDetails.notifyPartyName'] = {
        "$regex": this.notify_party,
        "$options": "i"
      }
    }
    if (this.invoice_party) {
      mustArray['shipperDetails.vendorName'] = {
        "$regex": this.invoice_party,
        "$options": "i"
      }
    }
    if (this.shipping_line) {
      mustArray['routeDetails.shippingLineName'] = {
        "$regex": this.shipping_line,
        "$options": "i"
      }
    }
    if (this.status) {
      this.getAgentAdviseList(this.status)
    }


    let payload = this.commonService.filterList()
    payload.query = mustArray

    payload.size = Number(this.size),
      payload.from = 0,
      payload.sort = {
        "desc": ["updatedOn"]
      }
    this.commonService.getSTList("agentadvice", payload).subscribe((data: any) => {
      this.agentData = data.documents?.map((s: any,index) => {
        return{
          ...s,
          id:index+1
        }
      })
      this.toalLength = data.totalCount;
      this.count = data.documents.length;
      this.fromSize = 1
    });
  }

  clear() {
    this.ref_no = '';
    this.quote_no = '';
    this.tank_type = '';
    this.location = '';
    this.shipper = '';
    this.consignee = '';
    this.product = '';
    this.move_no = '';
    this.move_type = '';
    this.shipment_type = '';
    this.notify_party = '';
    this.invoice_party = '';
    this.shipping_line = '';
    this.status = '';
    this.getAgentAdviseList('');
  }
  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.agentData.map((row: any) => {
      storeEnquiryData.push({
        'Unique Ref. No.': row.basicDetails?.uniqueRefNo,
        'Quote No.': row.basicDetails?.stcQutationNo,
        'SHIPEASY Reference': row.basicDetails?.stcReference,
        'Tank Type': row.basicDetails?.tankType,
        'Location': row.basicDetails?.destinationName,
        'Shipper': row.shipperDetails?.shipperName,
        'Consignee': row.shipperDetails?.consigneeName,
        'Product': row.productDetails?.productName,
        'Move No': row.basicDetails?.moveNo,
        'Move Type': row.basicDetails?.moveTypeName,
        'Shipment Term': row.basicDetails?.shippping_term,
        'Notify Party': row.shipperDetails?.notifyPartyName,
        'Invoice Party': row.shipperDetails?.vendorName,
        'Shipping Line': row.routeDetails?.shippingLineName,
        'Status': row.status ? 'Active' : 'In Active',
      });
    });
    const myworksheet: XLSX.WorkSheet =
      XLSX.utils.json_to_sheet(storeEnquiryData);
    const myworkbook: XLSX.WorkBook = {
      Sheets: { data: myworksheet },
      SheetNames: ['data'],
    };
    const fileName = 'Agent-Advise.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  delete(deleteagentAdvice, id) {
    this.modalService
      .open(deleteagentAdvice, {
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
            let data = `agentadvice/${id}`
            this.commonService
              .deleteST(data)
              .subscribe((res: any) => {
                setTimeout(() => {
                  this.getAgentAdviseList('');
                }, 1000);

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
  openPDF() {
    var prepare = [];
    this.agentData.forEach(e => {
      var tempObj = [];

      tempObj.push(e.basicDetails?.uniqueRefNo);
      tempObj.push(e.basicDetails?.stcQutationNo);
      tempObj.push(e.basicDetails?.stcReference);
      tempObj.push(e.basicDetails?.tankType);
      tempObj.push(e.basicDetails?.destinationName);
      tempObj.push(e.shipperDetails?.shipperName);
      tempObj.push(e.shipperDetails?.consigneeName);
      tempObj.push(e.productDetails?.productName);
      tempObj.push(e.basicDetails?.moveNo);
      tempObj.push(e.basicDetails?.moveTypeName);
      tempObj.push(e.basicDetails?.shippping_term);
      tempObj.push(e.shipperDetails?.notifyPartyName);
      tempObj.push(e.shipperDetails?.vendorName);
      tempObj.push(e.routeDetails?.shippingLineName);
      tempObj.push(e.status ? "Active" : "In Active");
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [497, 410]);
    autoTable(doc, {
      head: [['Unique Ref. No.', 'Quote No.', 'SHIPEASY Reference', 'Tank Type', 'Location', 'Shipper',
        'Consignee', 'Product', 'Move No', 'Move Type',
        'Shipment Term', 'Notify Party', 'Invoice Party', 'Shipping Line', 'Status']],
      body: prepare
    });
    doc.save('Agent-Advise' + '.pdf');
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
    const columnsToHide = ['action'];
    const actualColumns = this.displayedColumns;
    this.commonfunction.exportToExcel(
      tableColumns,
      tableData,
      columnsToHide,
      'Agent-Advise',
      this.displayedColumns,
      actualColumns
    );
  }

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

    let payload = this.commonService.filterList()
    payload.size = Number(10000),
      payload.from = this.page - 1,
      payload.query = this.filterKeys
    payload.sort = {
      "desc": ["updatedOn"]
    }
    this.commonService.getSTList("agentadvice", payload).subscribe((data) => {
      this.agentData = data.documents;
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
      this.getSORT()
    });


  }
  displayedColumns1 = this.displayedColumns.map((x, i) => x + '_' + i);
  toggleFilters = true;
  filtersModel = [];
  filterKeys = {};
  clearFilters() {
    this.filtersModel = [];
    this.filterKeys = {};
    this.getAgentAdviseList('');
  }
 
  navigateToNewTab(element) {
    let url = (element?.agentAdviseStatus == 'Inquiry Draft' || element?.agentAdviseStatus == 'Draft' || element?.agentAdviseStatus =='Inquiry Received') ? '/agent-advice/list/'+element?.agentadviceId+'/edit' : '/agent-advice/list/'+element?.agentadviceId+'/quote'
    
    this.router.navigate([url]);
  }
  navigateToNewTab1(element) {
    let url = (element?.agentAdviseStatus == 'Inquiry Draft' || element?.agentAdviseStatus == 'Draft' || element?.agentAdviseStatus =='Inquiry Received') ? element?.agentadviceId+'/edit' : element?.agentadviceId+'/quote'
    window.open(window.location.href +'/'+url ); 
  }
  onCheckboxChange(event: any, shipmentType: string) {
    if (event.target.checked) {
      const otherType = shipmentType === 'Ocean' ? 'Air' : 'Ocean';
      (document.getElementById(otherType) as HTMLInputElement).checked = false;
      this.selectedShipmentTypes = [shipmentType];
    } else {
      this.selectedShipmentTypes = this.selectedShipmentTypes.filter(type => type !== shipmentType);
    }

    this.getAgentAdviseList('');
  }

  navigateLogs(e){
    this.router.navigate(['agent-advice/audit-logs'], { queryParams: { id: e?.agentadviceId, collection : "agentadvice" ,url : this.router.url} }); 
  }
  
}


