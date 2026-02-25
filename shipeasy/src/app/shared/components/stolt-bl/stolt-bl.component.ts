import { Component, Input, OnChanges, OnInit, Output, SimpleChanges, EventEmitter, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from 'src/app/admin/principal/api.service';
import * as Constant from 'src/app/shared/common-constants';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonFunctions } from '../../functions/common.function';
import { StoltSplitBlComponent } from './stolt-split-bl/stolt-split-bl.component';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { CommonService } from 'src/app/services/common/common.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { Bl } from 'src/app/models/stolt-bl';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
import { ApiSharedService } from '../api-service/api-shared.service';
import { DatePipe } from '@angular/common';
import { resetFakeAsyncZone } from '@angular/core/testing';
@Component({
  selector: 'app-stolt-bl',
  templateUrl: './stolt-bl.component.html',
  styleUrls: ['./stolt-bl.component.scss']
})
export class StoltBLComponent implements OnInit, OnChanges {
  _gc = GlobalConstants;
  @Input() batchDetail;
  @Output() getblDataOfBtahcDetails: EventEmitter<any> = new EventEmitter();
  urlParam: any;
  currentUrl: any;
  buttonDisabled: boolean = true;
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
  isAddMode: any
  batchId: string;
  moveNo: string;
  vessel_name: string;
  baseBody: string;
  blDate: string;
  globalSearch: string;
  isExport: boolean = false;

  @ViewChild(MatDrawer) drawer: MatDrawer | any;
  dataSource = new MatTableDataSource();
  pagenation = [10, 20, 50, 100];
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  imageURL: any = "assets/img/BlAuto.png"
  displayedColumns = [
    '#',
    'blNumber',
    'container',
    'packages',
    'blDate',
    'blTypeName',
    'shipperName',
    'consigneeName',
    // 'shippingline',
    // 'vesselName',
    'voyageId',
    // 'polName',
    'blDraftStatus',
    'action',
  ];
  userData: any;
  id: any
  isShow: boolean = false;
  isTransport: boolean;
  isImport: boolean;
  constructor(private router: Router, private route: ActivatedRoute,
    private _api: ApiService,
    private modalService: NgbModal,
    private notification: NzNotificationService, private cognito: CognitoService,
    private commonfunction: CommonFunctions,
    private commonService: CommonService,
    private apiService: ApiSharedService,
    private cdr: ChangeDetectorRef,
    public loaderService: LoaderService,
    private datePipe: DatePipe) {
    this.router = router;
    this.route = route;
    this._api = _api;
    this.notification = notification;
    this.cognito = cognito;
    this.commonService = commonService;
    this.commonfunction = commonfunction
    this.id = this.route.snapshot.params['moduleId'];
    this.isAddMode = !this.id;
    this.route.params.subscribe(params =>
      this.urlParam = params
    );
    this.isShow = this.urlParam?.access == 'show' ? true : false;;
    this.isExport = localStorage.getItem('isExport') === 'true' ? true : false;
    this.isImport = localStorage.getItem('isImport') === 'true' ? true : false;
    this.isTransport = localStorage.getItem('isTransport') === 'true' ? true : false;
  

    if (this.isExport || this.isTransport) {
      this.displayedColumns = [
        '#',
        'blNumber',
        'container',
        'packages',
        'blDate',
        'blTypeName',
        'shipperName',
        'consigneeName',
        // 'shippingline',
        // 'vesselName',
        // 'voyageId',
        // 'polName',
        "HBLStatus",
        'blDraftStatus',
        'action',
      ];
    } else {
      this.displayedColumns = [
        '#',
        'blNumber',
        'container',
        'packages',
        'blTypeName',
        'shipperName',
        'consigneeName',
        // 'shippingline',
        // 'vesselName',
        // 'voyageId',
        // 'polName',
        "HBLStatus",
        'blDraftStatus',
        'action',
      ];
    }
  }

  onOpenconsolidate() {
    this.router.navigate(['/batch/list/add/' + this.urlParam?.id + '/' + this.urlParam.key + '/addconsolidate']);
  }

  onOpenNew() {
    this.router.navigate(['/batch/list/add/' + this.urlParam?.id + '/' + this.urlParam.key + '/add']);
  }
  getContainerNumbers(element: any): string {
    if (!element?.containers || !Array.isArray(element.containers)) {
      return 'N/A';
    }
    return element.containers
      .map((c: any) => c.containerNumber)
      .filter(Boolean)
      .join(', ') || 'N/A';
  }
  getHeaderText(type: 'primary' | 'secondary'): string {
    let data = this.dataSource.data;
    if (data.length > 0) {
      const firstElement: any = data[0];
      if (!firstElement?.flightNo) {
        return type === 'primary' ? 'Voyage' : 'Vessel';
      } else {
        return type === 'primary' ? 'Airline' : 'FlightNo.';
      }
    }
    return '';
  }

  onOpenEdit(id: string, show?: string, cloneBl?: string) {
    let url: string;

    if (cloneBl) {
      url = `/batch/list/add/${this.urlParam.id}/${this.urlParam.key}/${id}/cloneBl`;
    } else if (show === 'show') {
      url = `/batch/list/show/${this.urlParam.id}/${this.urlParam.key}/${id}/show`;
    } else {
      url = `/batch/list/add/${this.urlParam.id}/${this.urlParam.key}/${id}/edit`;
    }

    this.router.navigate([url]);
  }
  blMasterStatus: any = []
  getStatusClass(element: any): string {
    const status = (element?.blTypeName == 'HBL' || element?.blTypeName == 'HAWB' 
      ? element?.HBLStatus 
      : element?.MBLStatus)?.toLowerCase();
    
    if (status === 'original') {
      return 'red';
    } else if (status === 'pending' || !status) {
      return 'pending';
    } else {
      return 'green';
    }
  }
  getSystemTypeDropDowns() {
    let payload = this.commonService.filterList()

    if (payload) payload.query = {
      status: true,
      "typeCategory": {
        "$in": [
          "blStatus"
        ]
      }
    }

    this.commonService.getSTList("systemtype", payload)?.subscribe((res: any) => {
      this.blMasterStatus = res?.documents?.filter(x => x.typeCategory === "blStatus");


    });
  }
  onBillAction(event) {
    const url = event ?? 'add';
    this.router.navigate(['/batch/list/' + url + '/' + this.urlParam.id + '/' + this.urlParam.key]);
  }
  batchDetails: any;
  ngOnInit(): void {
    this.getSystemTypeDropDowns()
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();
    this.batchId = this.route.snapshot.params['id'];
    let payload = this.commonService.filterList()
    payload.query = {
      batchId: this.batchId
    }
    this.commonService.getSTList(`batch`, payload).subscribe((res) => {
      this.batchDetails = res?.documents[0]
    })

    this.cognito.getagentDetails()?.subscribe((resp) => {
      if (resp != null) {
        this.userData = resp
      }
    })
    
    // Remove setTimeout, call directly
    this.getblData();
    
    if (this.batchDetail?.statusOfBatch == 'Job Cancelled' || this.batchDetail?.statusOfBatch == 'Job Closed') {
      this.buttonDisabled = false
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.batchDetail = this.batchDetail;
    if (this.batchDetail?.enquiryDetails?.basicDetails?.ShipmentTypeName === 'Air') {
      this.displayedColumns = [
        '#',
        'blNumber',
        'blTypeName',
        'shipperName',
        'consigneeName',
        'finalShippingLineName',
        'flightNo',
        'polName',
        "HBLStatus",
        'blDraftStatus',
        'action',
      ];
    }
    if (this.batchDetail?.statusOfBatch == 'Job Cancelled' || this.batchDetail?.statusOfBatch == 'Job Closed') {
      // this.newenquiryForm.disable();
      this.buttonDisabled = false

    }
  }
  isMBLCreated: boolean = false;
  getblData() {
    this.loaderService.showcircle();
    
    let payload = this.commonService.filterList()
    payload.query = {
      $or: [
        { batchId: this.batchId },
        { "consolidatedJobs.batchId": this.batchId }
      ]
    }
    payload.sort = { "desc": ['updatedOn'] }
    // Don't send size/from - fetch all records for client-side pagination
    
    this._api.getSTList(Constant.BL_LIST, payload)
      .subscribe((data: any) => {
        this.blData = data.documents;
        this.isMBLCreated = this.blData.some((x: any) => x.blType === 'MBL');
        this.toalLength = data.totalCount;
        this.count = data.documents.length;
        
        // Create dataSource with mapped data
        const mappedData = data?.documents?.map((s: any, index) => {
          const containerNumbers = s.containers && s.containers.length > 0
            ? s.containers.map((c: any) => c.containerNumber).filter(Boolean).join(', ')
            : '';
          
          return {
            ...s,
            id: index + 1,
            containerNumbers: containerNumbers 
          }
        });
        
        this.dataSource = new MatTableDataSource(mappedData);
        
        // IMPORTANT: Set paginator and sort AFTER setting data
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort1;
        });
        
        this.loaderService.hidecircle();
      }, () => {
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
    mustArray['batchId'] = this.batchId
  
    if (this.blNumber) {
      mustArray['blNumber'] = { "$regex": this.blNumber, "$options": "i" }
    }
    if (this.blDate) {
      mustArray['createdOn'] = {
        "$gt": this.blDate.substring(0, 10) + 'T00:00:00.000Z',
        "$lt": this.blDate.substring(0, 10) + 'T23:59:00.000Z'
      }
    }
    if (this.blTypeName) {
      mustArray['blTypeName'] = {
        "$regex": this.blTypeName,
        "$options": "i"
      }
    }
    if (this.shipperName) {
      mustArray['shipperName'] = {
        "$regex": this.shipperName,
        "$options": "i"
      }
    }
    if (this.consigneeName) {
      mustArray['consigneeName'] = {
        "$regex": this.consigneeName,
        "$options": "i"
      }
    }
    if (this.voyageNumber) {
      mustArray['voyageId'] = {
        "$regex": this.voyageNumber,
        "$options": "i"
      }
    }
    if (this.polName) {
      mustArray['polName'] = {
        "$regex": this.polName,
        "$options": "i"
      }
    }
    if (this.status) {
      mustArray['status'] = {
        "$regex": this.status,
        "$options": "i"
      }
    }


    let payload = this.commonService.filterList()
    payload.query = mustArray
    payload.sort = { "desc": ['updatedOn'] }
    // Remove size/from for client-side pagination
  
    this._api.getSTList(Constant.BL_LIST, payload)
      .subscribe((data: any) => {
        const mappedData = data.documents?.map((s: any, index) => {
          return {
            ...s,
            id: index + 1,
            containerNumbers: s.containers?.map(c => c.containerNumber).filter(Boolean).join(', ') || ''
          }
        });
        
        this.dataSource.data = mappedData; // Update data directly
        this.toalLength = data.totalCount;
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
      payload.sort = { "desc": ['updatedOn'] }
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
        let deleteBody = Constant.BL_LIST + '/' + batch?.blId
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
  // printData() {
  //   var divToPrint = document.getElementById("tablerecords");

  //   var newWin = window.open("");
  //   newWin.document.write(divToPrint.outerHTML);
  //   newWin.print();
  //   newWin.close();
  // }

  // Documentpdf:any;
  basecontentUrl: any;
  download_send_on_mail(id) {
    let reportpayload1 = { "parameters": { "blId": id?.blId } }
    let url: any;
    this.commonService.pushreports(reportpayload1, 'billOfLad').subscribe({
      next: (res: any) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result as string;
          let baseContent = base64String.split(",");
          this.basecontentUrl = baseContent[1];
          this.mail(id, this.basecontentUrl, url)
        };
        reader.readAsDataURL(blob)
      }
    })
  }
  Documentpdf: any;
  printData(id) {
    let reportpayload1 = { "parameters": { "blId": id?.blId } }
    this.commonService.pushreports(reportpayload1, 'billOfLad').subscribe({
      next: (res: any) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        let temp = URL.createObjectURL(blob);
        this.Documentpdf = temp;
        const pdfWindow = window.open(temp);
        // pdfWindow.print();
      }
    })
  }
  mail(data, bloburl?, reportName?) {
    let fileName = data?.blNumber + '.pdf'
    let attachment = [{ "content": bloburl, "name": fileName }]
    let userData = this.userData

    let payload = this.commonService.filterList()
    payload.query = {
      "partymasterId": {
        "$in": [data?.shipperId, data?.consigneeId]
      }
    }
    this.commonService.getSTList("partymaster", payload).subscribe((res) => {
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
      let formattedBlDate = this.datePipe.transform(data?.blDate, 'dd/MM/yyyy') || '';

      let emaildata = `
        Dear Customer,
        <br>
        Bill of lading is successfully generated for Job No - ${data?.containers[0]?.batchNo}
        <br>
        B/L Type:- ${data?.blType}
        <br>
        Sub B/L Type:- ${data?.subBltype}
        <br>
        BL No :- ${data?.blNumber}
        <br>
        BL Date:- ${formattedBlDate}
        <br>
        Container No:- ${data?.containers[0]?.containerNumber}
        <br><br>
        With Regards,
        <br>
        ShipEasy.`;

      let payload = {
        sender: {
          name: userData?.userName,
          email: userData?.userEmail
        },
        to: mailTo,
        textContent: `${emaildata}`,
        subject: "Bill of Lading",
        attachment: attachment,
        batchId: this.route.snapshot.params['id'],
      }
      this.apiService.sendEmail(payload).subscribe(
        (result) => {
          if (result.status == "success") {
            this.notification.create('success', 'Email Send Successfully', '');
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
  getAggregatedPackages(containers: any[]): string {
    if (!containers || containers.length === 0) {
      return '-';
    }
  
    const packageMap = new Map<string, number>();
  
    containers.forEach(container => {
      const packageType = container.packageTypeName || '-';
      const packageCount = parseFloat(container.package) || 0;
  
      if (packageMap.has(packageType)) {
        packageMap.set(packageType, packageMap.get(packageType)! + packageCount);
      } else {
        packageMap.set(packageType, packageCount);
      }
    });
  
    const result: string[] = [];
    packageMap.forEach((count, type) => {
      result.push(`${count} * ${type}`);
    });
  
    return result.join(', ');
  }

  
  onOpenSplitBatch(bl) {
    if (bl?.containers.length <= 1) {
      this.notification.create('info', `Only one container are there we can't split BL`, '');
      return
    }
    const modalRef = this.modalService.open(StoltSplitBlComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',

    });
    localStorage.setItem('blData', JSON.stringify(bl))
    modalRef.componentInstance.BatchIdData = bl;
    modalRef.componentInstance.BatchIdDataDetail = bl;
    modalRef.componentInstance.getBl.subscribe(() => {
      this.getblData();
    })


  }

  openPDF() {
    var prepare = [];
    this.blData.forEach(e => {
      var tempObj = [];
      tempObj.push(e.blNumber);
      tempObj.push(e.blDate);
      tempObj.push(e.blTypeName);
      tempObj.push(e.shipperName);
      tempObj.push(e.consigneeName);
      tempObj.push(e.voyageId);
      tempObj.push(e.polName);
      tempObj.push(e.blDraftStatus);
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [297, 210]);
    autoTable(doc, {
      head: [['BL Number', 'BL Date', 'BL Type', 'Shipper Name', 'Consignee Name', 'Voyage Number', 'POL', 'bl Status',]],
      body: prepare
    });
    doc.save('bl' + '.pdf');
  }
  clearGloble() {
    this.globalSearch = '';
    this.clear()
  }
  searchGlobal() {
    let query = this.globalSearch

    let shouldArray = [];
    shouldArray.push(
      { "blDraftStatus": { "$regex": query, "$options": "i" } },
      { "polName": { "$regex": query, "$options": "i" } },
      { "voyageId": { "$regex": query, "$options": "i" } },
      { "consigneeName": { "$regex": query, "$options": "i" } },
      { "shipperName": { "$regex": query, "$options": "i" } },
      { "blTypeName": { "$regex": query, "$options": "i" } },
      { "blDate": { "$regex": query, "$options": "i" } },
      { "blNumber": { "$regex": query, "$options": "i" } }
    )



    var parameter = {
      "project": [],
      "query": {
        batchId: this.batchId,
        "$or": shouldArray
      },
      "sort": {
        "desc": ["createdOn"]
      },
      size: Number(this.size),
      from: 0,
    }

    this._api.getSTList(Constant.BL_LIST, parameter)
      .subscribe((data: any) => {
        this.blData = data.documents?.map((s: any, index) => {
          return {
            ...s,
            id: index + 1
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
    const columnsToHide = ['action'];
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
  showCon(el){
    let element = el?.consolidatedJobs.filter((y)=> y.batchId != this.batchId)?.map((x:any) =>  x.batchNo)
    return  'Consolidated Job No: '+element?.toString() || ''
  }
  updateBatchData(element, res) {
    let payload;
 
    if (element?.blTypeName == 'HBL' || element?.blTypeName == 'HAWB') {
      payload = {
        HBLStatus: res
      };


      if (element?.isBlConsolidated) {

        let consoBathc = element?.consolidatedJobs?.map((x) => x.batchId)
        let payload2 = this.commonService.filterList()
        payload2.query = {
          // 'batchId': this.batchId,
          $or: [
            {
              batchId: consoBathc,
            },
            {
              "consolidatedJobs.batchId": consoBathc
            }
          ]
        } 

        this._api.getSTList(Constant.BL_LIST, payload2)
          .subscribe((data: any) => {


            let batchUpdate = []

            element?.consolidatedJobs?.filter((con:any) => {

              let newBL = data?.documents?.filter((x) => {
                if(x.isBlConsolidated){
                  return x?.consolidatedJobs?.some((job: any) => job.batchId === con.batchId) && x.blId != element?.blId && (x?.blTypeName == 'HBL' || x?.blTypeName == 'HAWB')
                }else{
                  return x.blId != element?.blId && (x?.blTypeName == 'HBL' || x?.blTypeName == 'HAWB') && x.batchId === con.batchId
                }
              })


              if (newBL.every((obj: any) => obj.MBLStatus?.toLowerCase() === res?.toLowerCase())) {

                batchUpdate.push({
                  MBLStatus: res,
                  batchId : con.batchId
                })
              } else {
                batchUpdate.push({
                  MBLStatus: 'PENDING',
                  batchId : con.batchId
                })
              }

            })

            if(batchUpdate.length > 0){
            this.commonService.batchUpdate(`batch/batchupdate`, batchUpdate).subscribe((res) => {
              this.getblDataOfBtahcDetails.emit();
            })
          }

           


          })

      } else {
        let newBL = this.blData.filter((x) => x.blId != element?.blId && (x?.blTypeName == 'HBL' || x?.blTypeName == 'HAWB'))
        if (newBL.every((obj: any) => obj.HBLStatus?.toLowerCase() === res?.toLowerCase())) {
          this.commonService.UpdateToST(`batch/${this.batchId}`, { ...this.batchDetails, HBLStatus: res }).subscribe((res) => {
            this.getblDataOfBtahcDetails.emit();
          })

        } else {
          this.commonService.UpdateToST(`batch/${this.batchId}`, { ...this.batchDetails, HBLStatus: 'PENDING' }).subscribe((res) => {
            this.getblDataOfBtahcDetails.emit();
          })
        }
      }





      this.commonService.UpdateToST(`bl/${element?.blId}`, payload).subscribe((data) => {
        if (data) {
          if (element?.blTypeName == 'HBL' || element?.blTypeName == 'HAWB') {
            element.HBLStatus = res;
          }
          element.telexDate = data.telexDate;
          this.cdr.detectChanges();
        }
      },
        (error) => {
          console.error('Error updating batch data:', error);
        }
      );

    }
    if (element?.blTypeName == 'MBL' || element?.blTypeName == 'AWB') {
      payload = {
        MBLStatus: res
      };

      if (element?.isBlConsolidated) {
        let consoBathc = element?.consolidatedJobs?.map((x) => x.batchId)
        let payload2 = this.commonService.filterList()
        payload2.query = {
          // 'batchId': this.batchId,
          $or: [
            {
              batchId: consoBathc,
            },
            {
              "consolidatedJobs.batchId": consoBathc
            }
          ]
        } 

        this._api.getSTList(Constant.BL_LIST, payload2)
          .subscribe((data: any) => {

            let batchUpdate = []

            element?.consolidatedJobs?.filter((con:any) => {

              let newBL = data?.documents?.filter((x) => {
                if(x.isBlConsolidated){
                  return x?.consolidatedJobs?.some((job: any) => job.batchId === con.batchId) && x.blId != element?.blId && (x?.blTypeName == 'MBL' || x?.blTypeName == 'AWB')
                }else{
                  return x.blId != element?.blId && (x?.blTypeName == 'MBL' || x?.blTypeName == 'AWB') && x.batchId === con.batchId
                }
              })


              if (newBL.every((obj: any) => obj.MBLStatus?.toLowerCase() === res?.toLowerCase())) {

                batchUpdate.push({
                  MBLStatus: res,
                  batchId : con.batchId
                })
              } else {
                batchUpdate.push({
                  MBLStatus: 'PENDING',
                  batchId : con.batchId
                })
              }

            })

            if(batchUpdate.length > 0){
            this.commonService.batchUpdate(`batch/batchupdate`, batchUpdate).subscribe((res) => {
              this.getblDataOfBtahcDetails.emit();
            })
          }

           


          })

      } else {
        let newBL = this.blData.filter((x) => x.blId != element?.blId && (x?.blTypeName == 'MBL' || x?.blTypeName == 'AWB'))
        if (newBL.every((obj: any) => obj.MBLStatus?.toLowerCase() === res?.toLowerCase())) {
          this.commonService.UpdateToST(`batch/${this.batchId}`, { MBLStatus: res }).subscribe((res) => {
            this.getblDataOfBtahcDetails.emit();
          })
        } else {
          this.commonService.UpdateToST(`batch/${this.batchId}`, { MBLStatus: 'PENDING' }).subscribe((res) => {
            this.getblDataOfBtahcDetails.emit();
          })
        }
      }
      this.commonService.UpdateToST(`bl/${element?.blId}`, payload).subscribe((data) => {
        if (data) {
          if (element?.blTypeName == 'MBL' || element?.blTypeName == 'AWB') {
            element.MBLStatus = res;
          }
          element.telexDate = data.telexDate;
          this.cdr.detectChanges();
        }
      },
        (error) => {
          console.error('Error updating batch data:', error);
        }
      )
    }


  }
}
