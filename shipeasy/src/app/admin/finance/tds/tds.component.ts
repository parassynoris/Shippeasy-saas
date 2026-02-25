import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { LoaderService } from 'src/app/services/loader.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { CommonService } from 'src/app/services/common/common.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import * as XLSX from "xlsx";
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-tds',
  templateUrl: './tds.component.html',
  styleUrls: ['./tds.component.scss']
})
export class TdsComponent implements OnInit {
  @ViewChild('Addtds') addtdsModal!: TemplateRef<any>;
  dataSource = new MatTableDataSource();
  selectedOption: string = '';
  showPopup = false;
  
  fromSize: number;
  selectBankTransfer: any = '';
  currentUser: any;
  bankList: any = [];
  isExport: boolean = false
  isTransport: boolean = false
  pagenation = [10, 20, 50, 100];
  submitted: any = false;
  customerList: any = []
  customer: any
  date: string;
  partyMasterList: any;
  reportType: any;
  toalLength: number;
  count = 0;
  tdsBalanceSign:any
  totalDebit:any
  totalCredit:any
  displayedColumns = [
    '#',
    "transactionId",
    "createdOn",
    "partyName",
    "invoiceData.invoiceNo",
    "transactionType",
    "tdsType",
    "tdsAmount",
  ];
  tdsBalance: number;


  constructor(private fb: FormBuilder,
    private modalService: NgbModal,
    public notification: NzNotificationService,
    private commonFunction: CommonFunctions,
    public commonService: CommonService,
    private datePipe: DatePipe,
    public loaderService: LoaderService,


  ) { }


  ngOnInit(): void {
    this.currentUser = this.commonFunction.getActiveAgent()
    this.getPartyList()
    this.onChangeReportType('tdsReport');
    let payload = this.commonService.filterList()
    this.getReports('tdsReport', payload);


  }

  openPDF() {
    const prepare = [];    
    this.dataSource?.filteredData?.forEach((e: any) => {
      var tempObj = []; ``
      tempObj.push(e.transactionId);
      tempObj.push(e.createdOn);
      tempObj.push(e.partyName);
      tempObj.push(e.invoiceData && e.invoiceData.length > 0 ? e.invoiceData[0].invoiceNo : '');
      tempObj.push(e.transactionType);
      tempObj.push(e.tdsType);
      tempObj.push(e.tdsAmount);

      prepare.push(tempObj);

    });
    const doc = new jsPDF('p', 'mm', [297, 210]);
    autoTable(doc, {
      head: [['Transaction Id', 'Date', 'Party', 'Invoice No', 'Transaction Type', 'Amount Type', 'TDS Amount']],
      body: prepare,
      didDrawCell: (data) => {
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'S');
      }
    });
    doc.save('TDSreport' + '.pdf');
  }
  @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort1: MatSort;
  
  onChangeReportType(e) {
    this.dataSource = new MatTableDataSource([]);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort1;
    
    e = 'tdsReport'; 
  
    if (e === 'tdsReport') {
      this.displayedColumns = [
        '#',
        "transactionId",
        "createdOn",
        "partyName",
        "invoiceData.invoiceNo",
        "transactionType",
        "tdsType", 
        "tdsAmount",
      ];
    }
  }
  
  onGenerateReport() {
    let payload = this.commonService.filterList();
    payload.sort = { desc: ['createdOn'] };
  
    if (this.customer) {
      payload.query['partyMasterId'] = this.customer;
    }
  
    if (this.date?.length === 2) {
      let startDate = this.datePipe.transform(this.date[0], 'yyyy-MM-dd');
      let endDate = this.datePipe.transform(this.date[1], 'yyyy-MM-dd');
      payload.query['createdOn'] = {
        "$gt": startDate.substring(0, 10) + 'T00:00:00.000Z',
        "$lt": endDate.substring(0, 10) + 'T23:59:59.999Z' 
      };
    }
    this.getReports('tdsReport', payload);
  }
  
  getReports(report, payload) {
    if (!report) {
      return;
    }
  
    this.loaderService.showcircle(); 
    let url;
    url = this.commonService.getReports(report, payload);
  
    url.subscribe((res: any) => {
      this.toalLength = res.totalCount;
      this.count = res.documents.length;
  
      if (res.documents.length === 0) {
        this.dataSource = new MatTableDataSource([]);
        this.loaderService.hidecircle();
      } else {

        this.totalCredit = res.documents
          .filter(doc => doc.tdsType === 'Credit')  
          .reduce((total, doc) => total + (doc.tdsAmount || 0), 0);  
  
        this.totalDebit = res.documents
          .filter(doc => doc.tdsType === 'Debit')  
          .reduce((total, doc) => total + (doc.tdsAmount || 0), 0);  
  
        this.tdsBalance = this.totalCredit - this.totalDebit;
  
        this.tdsBalanceSign = this.tdsBalance >= 0 ? '+' : '-';
  
        this.dataSource = new MatTableDataSource(
          res.documents.map((s, index) => ({
            ...s,
            id: index + 1,
            productName: s?.cargoDetail ? s.cargoDetail[0]?.productName : '',
            country: 'India'
          }))
        );
      }
      this.loaderService.hidecircle();
    });
  }

  exportToExcel(data: any[]): void {

    const exportData = data.map(doc => ({
      TransactionID: doc.transactionId,
      Date: new Date(doc.createdOn).toLocaleString(), 
      InvoiceNo: doc.invoiceData && doc.invoiceData.length > 0? doc.invoiceData[0].invoiceNo : '', 
      TDSAmount: doc.tdsAmount,
      TDSStatus: doc.tdsStutus,
      TDSType: doc.tdsType,
      TransactionType: doc.transactionType,
      // NetAmount: doc.netAmount,
      // PaidAmount: doc.paidAmount,
      // TDSPercentage: doc.tdsPercentage,
      // ProductName: doc?.cargoDetail ? doc.cargoDetail[0]?.productName : '',
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
  
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reports');
  
    XLSX.writeFile(wb, 'TDSreport.xlsx');
  }

  disableFutureDates = (current: Date): boolean => {
    const today = new Date();
    return current > today;
  };

  get f1() {
    return this.addtdsform.controls;
  }
  openModal(e, content): void {
    let creditAmout = 0
    this.dataSource.filteredData.filter((x: any) => {
      if (x?.tdsType == 'Credit') {
        creditAmout += Number(x?.tdsAmount || 0)
      }
      if (x?.tdsType == 'Debit') {
        creditAmout -= Number(x?.tdsAmount || 0)
      }
    })

    this.addtdsform = this.fb.group(
      {

        from: ['TDS Bank', [Validators.required]],
        to: [this.selectBankTransfer == 'banktocash' ? 'Cash' : '', [Validators.required]],
        date: ['', [Validators.required]],
        amount: [creditAmout || 0, Validators.required],


      },
    );
    this.modalService.open(content, {
      size: 'lg',
      backdrop: 'static',
      centered: true,
    });
  }
  cancel() {
    this.modalService.dismissAll()
    this.selectBankTransfer = ''
  }
  addtdsform: FormGroup;
  submitted1: boolean = false;
  transferBankAmount() {
    this.submitted1 = true
    if (this.addtdsform.invalid) {
      return
    }
    let insertArray = [];
    (this.selectBankTransfer == 'tdstobank' ? ['TDS Bank', 'Bank'] : ['TDS Bank', 'Cash'])?.filter((x, index) => {
      insertArray.push({
        orgId: this.commonFunction.getAgentDetails().orgId || '',
        paymentTypeId: this.addtdsform.value.paymentMode || '',
        paymentType: x || '',
        billNo: this.addtdsform.value.billNo || '',
        paymentRefNo: this.addtdsform.value.paymentRefNo || '',
        paymentDate: this.addtdsform.value.billDate || '',
        amount: Number(this.addtdsform.value.amount) || 0,
        remitance_bankId: '',
        remitance_bank: '',
        beneficiary_bankId: '',
        beneficiary_bank: '',
        "invoiceToId": this.addtdsform.value.customer || '',
        "invoiceToName": this.customerList?.filter(x => x.partymasterId === this.addtdsform.value.customer)[0]?.name || '',
        "invoiceFromId": this.addtdsform.value.customer || '',
        "invoiceFromName": this.customerList?.filter(x => x.partymasterId === this.addtdsform.value.customer)[0]?.name || '',
        "invoiceFromBranch": this.addtdsform.value.billFromBranch || '',
        "invoiceFromBranchName": this.addtdsform.value.billFromBranch || '',
        invoices: this.addtdsform.value.invoice?.toString() || '',
        batchNo: '',
        batchId: '',
        "remarks": this.addtdsform.value.remarks || '',
        currencyId: this.currentUser?.currency?.currencyId || '',
        currency: this.currentUser?.currency?.currencyCode?.toUpperCase() || '',
        isExport: (this.isExport || this.isTransport),
        document_name: this.addtdsform.value.documentName || '',
        document_tag: this.addtdsform.value.documentName || '',
        upload_document: this.addtdsform.value.documentName || '',
        filename: this.addtdsform.value.documentName || '',
        status: true,
        "isDraft": false,
        "tenantId": "1",
        "bankId": (index == 0 || x == 'Cash') ? '' : this.addtdsform.value.to || '',
        "bankName": (index == 0 || x == 'Cash') ? '' : this.bankList?.filter((x) => x.bankId === this.addtdsform.value.to)[0]?.bankName || '',
        invoiceData: [],
        paymentStatus: 'Completed',
        chequeDate: this.addtdsform.value.chequeDate || '',
        chequeStatus: this.addtdsform.value.chequeStatus || '',
        withdrawalDate: this.addtdsform.value.withdrawalDate || '',
        chequeNo: this.addtdsform.value.chequeNo || '',
        discount: this.addtdsform.value.discount || 0,
        tds: this.addtdsform.value.tds || 0,
        invoiceAmount: Number(this.addtdsform.value.amount) || 0,
        paidAmount: Number(this.addtdsform.value.amount) || 0,
        balanceAmount: 0,
        transactionType: this.selectBankTransfer == 'tdstobank' ? 'TDS Bank to Bank' : 'TDS Bank to Cash',
        amountType: index == 0 ? 'Debit' : 'Credit',
        stateOfSupply: '',
        stateOfSupplyName: '',
        "costItems": [],
        type: this.selectBankTransfer,
        tdsApplicable: index == 0 ? true : false,
        tdsAmount: Number(this.addtdsform.value.amount) || 0,
        tdsPer: Number(this.addtdsform.value.tdsPer) || 0,
        netAmount: Number(this.addtdsform.value.amount) || 0,
      })
    })

    this.commonService.batchInsert('payment/batchinsert', insertArray).subscribe((data: any) => {
      if (data) {
        this.submitted1 = false
        this.notification.create('success', 'Transfer Successfully', '');
        this.cancel()
      }
    }, (error) => {
      this.notification.create('error', error?.error?.error?.message, '');
    })
  }

  getPartyList() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      "$and": [
        {
          "customerType.item_text": {
            "$ne": "Vendor",
          }
        }
      ]
    }
    if (payload?.size) payload.size = Number(1000)
    if (payload?.from) payload.from = 0
    if (payload?.sort) payload.sort = {
      "desc": ["updatedOn"]
    },
      this.fromSize = 1
    this.commonService.getSTList("partymaster", payload)?.subscribe((data) => {
      this.customerList = data.documents;



    });
  }
  getBankList() {
    this.loaderService.showcircle();
    let payload = this.commonService.filterList()
    this.loaderService.hidecircle();
    this.commonService.getSTList('bank', payload)
      .subscribe((data) => {
        this.loaderService.hidecircle();
        this.bankList = data.documents;
      });
  }

}
