import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ApiService } from 'src/app/admin/principal/api.service';
import { Bl } from 'src/app/models/new-invoice';
import { CognitoService } from 'src/app/services/cognito.service';
import { CommonService } from 'src/app/services/common/common.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import * as Constant from 'src/app/shared/common-constants';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
@Component({
  selector: 'app-consolidate-bl',
  templateUrl: './consolidate-bl.component.html',
  styleUrls: ['./consolidate-bl.component.scss']
})
export class ConsolidateBlComponent implements OnInit {

  @Input() batchDetail;
  urlParam: any;
  currentUrl: any;
  order: boolean = true;
  toalLength: any;
  size = 10;
  page = 1;
  count = 0;
  blData: Bl[] = [];
  fromSize: number = 1;
  blNumber: string;
  blTypeName: string;
  shipperName: string;
  consigneeName: string;
  voyageNumber: string;
  polName: string;
  status: string;
  batchId: string;
  moveNo: string;
  vessel_name: string;
  baseBody: string;
  blDate: string;
  globalSearch: string;
  isExport: boolean = false;
  _gc=GlobalConstants
  @ViewChild(MatDrawer) drawer: MatDrawer | any;
  dataSource = new MatTableDataSource();
  pagenation = [10,20, 50, 100];
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns =[
    '#',
   'blNumber',
   'blDate',
   'blTypeName',
   'shipperName',
   'consigneeName',
   'voyageId',
   'vesselName',
    'polName',
    'status',
    'action', 
  ];
  userData: any;
 
  isShow: boolean = false;
  constructor(private router: Router, private route: ActivatedRoute,
    private _api: ApiService,
    private modalService: NgbModal,
    private notification: NzNotificationService,private cognito : CognitoService,
    private commonfunction: CommonFunctions,
    private commonService : CommonService,public loaderService: LoaderService,) {
      this.router = router;
      this.route = route;
      this._api = _api;
      this.notification = notification;
      this.cognito = cognito;
      this.commonService = commonService;
      this.commonfunction = commonfunction
    this.route.params.subscribe(params =>
      this.urlParam = params
    ); 
    this.isShow = this.urlParam?.access == 'show' ? true : false;;
    this.isExport = localStorage.getItem('isExport') === 'false' ? false : true;
    if(this.isExport){
      this.displayedColumns =[
        '#',
       'blNumber',
       'blDate',
       'blTypeName',
       'shipperName',
       'consigneeName',
       'voyageId',
       'vesselName',
        'polName',
        'status',
        'action', 
      ];
    }else{
      this.displayedColumns =[
        '#',
       'blNumber', 
       'blTypeName',
       'shipperName',
       'consigneeName',
       'voyageId',
       'vesselName',
        'polName',
        'status',
        'action', 
      ];
    }
  }


  onOpenNew() {

    this.router.navigate(['/consolidation-booking/edit/' + this.urlParam.id + '/' + this.urlParam.key + '/add']);
  }

  onOpenEdit(id, show?) {

    if (show === 'show') {
      this.router.navigate(['/consolidation-booking/edit/' + this.urlParam.id + '/' + this.urlParam.key + '/' + id + '/show']);
    }
    else {
      this.router.navigate(['/consolidation-booking/edit/' + this.urlParam.id + '/' + this.urlParam.key + '/' + id + '/edit']);
    }
  }

  onBillAction() {
    this.router.navigate(['/consolidation-booking/edit/' + this.urlParam.id + '/' + this.urlParam.key]);
  }

  ngOnInit(): void {
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();
    this.batchId = this.route.snapshot.params['id'];
    this.cognito.getagentDetails()?.subscribe((resp) => {
      if (resp != null) {
        this.userData  = resp
      }
    }) 
    setTimeout(() => {
      this.getblData();
    }, 500);
  }

  getblData() {
    this.loaderService.showcircle();
    this.page = 1;
  
    let payload = this.commonService.filterList()
    payload.query = {
      'consolidateBookingId': this.batchId,
    }
    payload.size = Number(this.size),
    payload.from = this.page - 1,
    payload.sort = {  "desc" : ['updatedOn'] }
    this._api.getSTList(Constant.BL_LIST, payload)
      .subscribe((data: any) => {
        this.blData = data.documents

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
        this.loaderService.hidecircle();
      },()=>{
        this.loaderService.hidecircle();
      });
  }
  clear() {
    this.blNumber = '';
    this.blDate = '';
    this.blTypeName = '';
    this.shipperName = '';
    this.consigneeName = '';
    this.voyageNumber = '';
    this.polName = '';
    this.status = '';
    this.getblData();
  }
  filter(e) {
    this.size = e.target.value;
    this.fromSize = 1;
    this.getblData();
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
  search() {
    let mustArray = {};
    mustArray['batchId'] =this.batchId

    if (this.blNumber) {
      mustArray['blNumber'] = {
        "$regex" : this.blNumber,
        "$options": "i"
    }
    }
    if (this.blDate) {
      mustArray['createdOn']= {
        "$gt" : this.blDate.substring(0, 10) + 'T00:00:00.000Z',
        "$lt" : this.blDate.substring(0, 10) + 'T23:59:00.000Z'
    }
  }
    if (this.blTypeName) {
      mustArray['blTypeName'] = {
        "$regex" : this.blTypeName,
        "$options": "i"
    }
    }
    if (this.shipperName) {
      mustArray['shipperName'] = {
        "$regex" : this.shipperName,
        "$options": "i"
    }
    }
    if (this.consigneeName) {
      mustArray['consigneeName'] = {
        "$regex" : this.consigneeName,
        "$options": "i"
    }
    }
    if (this.voyageNumber) {
      mustArray['voyageId'] = {
        "$regex" : this.voyageNumber,
        "$options": "i"
    }
    }
    if (this.polName) {
      mustArray['polName'] = {
        "$regex" : this.polName,
        "$options": "i"
    }
    }
    if (this.status) {
      mustArray['status'] = {
        "$regex" : this.status,
        "$options": "i"
    }
    }

   
    let payload = this.commonService.filterList()
    payload.query = mustArray
    payload.size = Number(this.size),
    payload.from = 0,
    payload.sort = {  "desc" : ['updatedOn'] }


    this._api.getSTList(Constant.BL_LIST, payload)
      .subscribe((data: any) => {
        this.blData = data.documents?.map((s: any,index) => {
          return{
            ...s,
            id:index+1
          }
        })
        this.toalLength = data.totalCount;
        this.count = data.documents.length;
        this.fromSize =1
      });
  }

  getPaginationData(type: any) {
    this.fromSize =
      type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
   
    let payload = this.commonService.filterList()
    payload.query = {
      'batchId': this.batchId,
    }
    payload.size = Number(this.size),
    payload.from = this.fromSize - 1,
    payload.sort = {  "desc" : ['updatedOn'] }
    this._api.getSTList(Constant.BL_LIST, payload)
      .subscribe((data: any) => {
        this.blData = data.documents;
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

  removeRow(content1, batch) {
    this.modalService.open(content1, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
      ariaLabelledBy: 'modal-basic-title'
    }).result.then((result) => {

      if (result === 'yes') {
        let deleteBody = Constant.BL_LIST + '/'+ batch?.blId
        this.commonService
          .deleteST(deleteBody)
          .subscribe((data) => {
            if (data) {
              this.notification.create(
                'success',
                'Deleted Successfully',
                ''
              );
            }
            setTimeout(() => {
              this.getblData()
              }, 1000);
          });
      }
    },);

  }
  onClose() {
    this.router.navigate(['/batch/list']);
  }
  printData() {
    var divToPrint = document.getElementById("tablerecords");

    var newWin = window.open("");
    newWin.document.write(divToPrint.outerHTML);
    newWin.print();
    newWin.close();
  }
  email(bl) {
  
    let userData = this.userData;
    if(!userData?.userEmail){
      this.notification.create('error', 'USer Email Id not found', '');
      return false
    }
   
    let payload = this.commonService.filterList()
    payload.query = {
      "partymasterId" : {
        "$in": [ bl?.shipperId,bl?.consigneeId ]
      } 
    } 
    this._api.getSTList("partymaster", payload).subscribe((res: any) => {
      let mailList = []

      res?.documents.filter((x) => { 
          mailList.push(x) 
      })

      let mailTo = []
      // if (bl?.blType === 'HBL') {
      //   mailTo.push({
      //     name: 'J M BAXI',
      //     email: 'jmbaxi1234@gmail.com'
      //   })
      // } else {
      //   mailList.map((res: any) => {
      //     mailTo.push({
      //       name: res?.name,
      //       email: res?.primaryMailId
      //     })
      //   })
      // }
      mailList.map((res: any) => {
        mailTo.push({
          name: res?.name,
          email: res?.primaryMailId
        })
      })

      let emaildata = `
      ${'Bill of lading are successfully generated'} `

      let payload = {
        sender: {
          name: userData?.userName,
          email: userData?.userEmail
        },
        to: mailTo,
        textContent: `${emaildata}`,
        subject: "Bill of Lading",
        batchId :   this.route.snapshot.params['id'],
      }
      this._api.sendEmail(payload).subscribe(
        (res) => {
          if (res.status == "success") {
            this.notification.create('success', 'Email Sent Successfully', '');
          }
          else {
            this.notification.create('error', 'Email not Send', '');
          }
        }
      );
    });
  }
  // export() {
  //   let excel = [];
  //   this.blData?.map(x => excel.push({
  //     'BL No': x.blNumber,
  //     'BL Date': x.blDate,
  //     'BL Type': x.blType,
  //     'Shipper Name': x.shipperName,
  //     "Consignee Name": x.consigneeName,
  //     'Voyage Number': x.voyageId,
  //     'POL': x.pol,
  //     "Status": x.status  ? 'Active' : 'In Active'
  //   }))

  //   const myworksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excel);
  //   const myworkbook: XLSX.WorkBook = {
  //     Sheets: { data: myworksheet },
  //     SheetNames: ["data"],
  //   };
  //   const excelBuffer: any = XLSX.write(myworkbook, {
  //     bookType: "xlsx",
  //     type: "array",
  //   });

  //   const fileName = "bl.xlsx";
  //   /* save to file */
  //   XLSX.writeFile(myworkbook, fileName);
  // }


  // Nedded 

  // onOpenSplitBatch(bl){
  //   if(bl?.containers.length <= 1){
  //     this.notification.create('info', `Only one container are there we can't split BL`, '');
  //     return
  //   }
  //   const modalRef = this.modalService.open(StoltSplitBlComponent, {
  //     ariaLabelledBy: 'modal-basic-title',
  //     backdrop: 'static',
  //     keyboard: false,
  //     centered: true,
  //     size: 'lg',

  //   });
  //   localStorage.setItem('blData', JSON.stringify(bl))
  //   modalRef.componentInstance.BatchIdData = bl;
  //   modalRef.componentInstance.BatchIdDataDetail = bl;
  //   modalRef.componentInstance.getBl.subscribe(()=>{
  //     this.getblData();
  //   })

  
  // }

  openPDF() {
    var prepare=[];
    this.blData.forEach(e=>{
      var tempObj =[];
      tempObj.push(e.blNumber);
      tempObj.push(e.blDate);
      tempObj.push(e.blTypeName);
      tempObj.push(e.shipperName);
      tempObj.push(e.consigneeName);
      tempObj.push(e.voyageId);
      tempObj.push(e.polName);
      tempObj.push(e.status ? 'Active' : 'In Active');
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [297, 210]);
    autoTable(doc,{
        head: [['BL Number','BL Date','BL Type','Shipper Name','Consignee Name','Voyage Number','POL','Status',]],
        body: prepare
    });
    doc.save('bl' + '.pdf');
  }
  clearGloble() {
    this.globalSearch = '';
    this.clear()
  }
  searchGlobal() {
    let  query = this.globalSearch
   
    let shouldArray = [];
    shouldArray.push(
      {"status": {  "$regex": query ,"$options": "i"  } },
      { "polName": {  "$regex": query ,"$options": "i" } },
      { "voyageId": {  "$regex": query  ,"$options": "i"  } },
      { "consigneeName": {  "$regex": query  ,"$options": "i"  } },
      { "shipperName": {  "$regex": query  ,"$options": "i"  } },
      { "blTypeName": {  "$regex": query  ,"$options": "i"  } },
      { "blDate": {  "$regex": query  ,"$options": "i"  } },
      { "blNumber": {  "$regex": query  ,"$options": "i"  } }
     )


  
  var parameter = {
    "project": [ ],
    "query": {
      batchId :this.batchId,
      "$or": shouldArray},
    "sort" :{
        "desc" : ["createdOn"]
    },
    size: Number(this.size),
    from: 0,
}

    this._api.getSTList(Constant.BL_LIST, parameter)
      .subscribe((data: any) => {
        this.blData = data.documents?.map((s: any,index) => {
          return{
            ...s,
            id:index+1
          }
        });
        this.toalLength = data.totalCount;
        this.count = data.documents.length;
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
    const columnsToHide = [ 'action'];
    const actualColumns = this.displayedColumns;
    this.commonfunction.exportToExcel(
      tableColumns,
      tableData,
      columnsToHide,
      'BL',
      this.displayedColumns,
      actualColumns
    );
  }

}
