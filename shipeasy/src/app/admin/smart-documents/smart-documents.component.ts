import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { Router } from '@angular/router';
import { LoaderService } from 'src/app/services/loader.service'; 
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from 'src/app/services/common/common.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-smart-documents',
  templateUrl: './smart-documents.component.html',
  styleUrls: ['./smart-documents.component.scss']
})
export class SmartDocumentsComponent implements OnInit {

 
  selectedShipmentTypes: string[] = [];
  @ViewChild(MatDrawer) drawer: MatDrawer | any;
  dataSource = new MatTableDataSource();
  pagenation = [10,20, 50, 100];
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns = [
    '#',
    'documentName', 
    'documentType', 
    'fromName',
    'date', 
    'updatedBy',
    'action',
  ];
  globalSearch: any;
  toalLength: any;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  agentData: any;
  closeResult: string;
  Documentpdf: string;
  emailForm:FormGroup;
  constructor(
    public loaderService: LoaderService, 
    public modalService: NgbModal, 
    public commonService: CommonService,
    public notification: NzNotificationService,
    public router: Router, 
    private commonfunction: CommonFunctions,
    private fb: FormBuilder
  ) {
    // do nothing.
  }
 
 
  ngOnInit(): void { 
      this.getAgentAdviseList('');  

      this.emailForm = this.fb.group({
        email: ['', [Validators.required]]
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
      size: Number(1000),
      from: 0,
    }

    this.commonService.getSTList("smartdocument", parameter)
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
    let payload = this.commonService.filterList();
    if(payload)payload.size = Number(10000),
      payload.from = this.page - 1,
      payload.sort = {
        "desc": ["updatedOn"]
      }
    this.commonService.getSTList("smartdocument", payload)?.subscribe((data) => {
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
 

  filter(e) {
    this.size = e.target.value;
    this.fromSize = 1;
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
            let data = `smartdocument/${id}`
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
    this.commonService.getSTList("smartdocument", payload).subscribe((data) => {
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
 
  preview(data?) {
    console.log(data)
    let reportpayload: any;
    let url: any;
    let id = data?.smartdocumentId;
    if (data?.documentKey === "Quotation") {
      reportpayload = { "parameters": { "documentId": id } };
      url = 'smartQuotation'
      this.commonService.pushreports(reportpayload, url).subscribe({
        next: (res: any) => {
          const blob = new Blob([res], { type: 'application/pdf' });
          let temp = URL.createObjectURL(blob);
          this.Documentpdf = temp;
          const pdfWindow = window.open(temp);
          // pdfWindow.print();
        }
      })
    }else if(data?.documentKey === "Proforma"){
      reportpayload = { "parameters": { "documentId": id } };
      url = 'smartProforma'
      this.commonService.pushreports(reportpayload, url).subscribe({
        next: (res: any) => {
          const blob = new Blob([res], { type: 'application/pdf' });
          let temp = URL.createObjectURL(blob);
          this.Documentpdf = temp;
          const pdfWindow = window.open(temp);
          // pdfWindow.print();
        }
      })
    }else if(data?.documentKey === "Purchase"){
      reportpayload = { "parameters": { "documentId": id } };
      url = 'smartPurchase'
      this.commonService.pushreports(reportpayload, url).subscribe({
        next: (res: any) => {
          const blob = new Blob([res], { type: 'application/pdf' });
          let temp = URL.createObjectURL(blob);
          this.Documentpdf = temp;
          const pdfWindow = window.open(temp);
          // pdfWindow.print();
        }
      })
    }
    else if(data?.documentKey === "HBL"){
      reportpayload = { "parameters": { "documentId": id } };
      url = 'houseBillOfLad'
      this.commonService.pushreports(reportpayload, url).subscribe({
        next: (res: any) => {
          const blob = new Blob([res], { type: 'application/pdf' });
          let temp = URL.createObjectURL(blob);
          this.Documentpdf = temp;
          const pdfWindow = window.open(temp);
          // pdfWindow.print();
        }
      })
    } else if(data?.documentKey === "Certificate"){
      reportpayload = { "parameters": { "documentId": id } };
      url = 'originCerti'
      this.commonService.pushreports(reportpayload, url).subscribe({
        next: (res: any) => {
          const blob = new Blob([res], { type: 'application/pdf' });
          let temp = URL.createObjectURL(blob);
          this.Documentpdf = temp;
          const pdfWindow = window.open(temp);
          // pdfWindow.print();
        }
      })
    }else if(data?.documentKey === "BL" || data?.documentKey === "Packing"){
      reportpayload = { "parameters": { "documentId": id } };
      url = 'blladding'
      this.commonService.pushreports(reportpayload, url).subscribe({
        next: (res: any) => {
          const blob = new Blob([res], { type: 'application/pdf' });
          let temp = URL.createObjectURL(blob);
          this.Documentpdf = temp;
          const pdfWindow = window.open(temp);
          // pdfWindow.print();
        }
      })
    }else if(data?.documentKey === "Commercial"){
      reportpayload = { "parameters": { "documentId": id } };
      url = 'commercialInvoice'
      this.commonService.pushreports(reportpayload, url).subscribe({
        next: (res: any) => {
          const blob = new Blob([res], { type: 'application/pdf' });
          let temp = URL.createObjectURL(blob);
          this.Documentpdf = temp;
          const pdfWindow = window.open(temp);
          // pdfWindow.print();
        }
      })
    } 
    else if(data?.documentKey === "VGM"){
      reportpayload = { "parameters": { "documentId": id } };
      url = 'VGM'
      this.commonService.pushreports(reportpayload, url).subscribe({
        next: (res: any) => {
          const blob = new Blob([res], { type: 'application/pdf' });
          let temp = URL.createObjectURL(blob);
          this.Documentpdf = temp;
          const pdfWindow = window.open(temp);
          // pdfWindow.print();
        }
      })
    } 
  }
  navToAdd(key){
    this.router.navigate(['/smart-documents/list/'+key+'/add']);
  }
  navToEdit(element){
    this.router.navigate(['/smart-documents/list/'+ element.smartdocumentId+'/'+element.documentKey+'/edit']);
  }
  mailAttachment: any;

  showPdf(arrayBuffer: ArrayBuffer): void {
    const binaryData = [];
    binaryData.push(arrayBuffer);
    const pdfUrl = URL.createObjectURL(new Blob(binaryData, { type: 'application/pdf' }));
    //  this.mailAttachment = pdfUrl
    document.getElementById('pdfViewer').setAttribute('src', pdfUrl);
  }
  shipperEmail: any;
 async getPartyMaster(shipperId) {
    let payload = this.commonService.filterList()
    payload.query = {
      "partymasterId": shipperId,
    }
       const res_partymaster=await this.commonService.getSTList('partymaster', payload)?.toPromise();
        this.shipperEmail = res_partymaster?.documents?.[0];
        let Email = [];
        if (this.shipperEmail?.primaryMailId) {
          Email.push(this.shipperEmail?.primaryMailId)
        }
        if (this.shipperEmail?.saleemail) {
          Email.push(this.shipperEmail?.saleemail)
        }
        this.emailForm.controls.email.setValue(Email?.map(item => item)?.join(','))
  }
  basecontentUrl: string;
  sendMailDeatils: any;
 async  sendQuotation(content1, data) {
   this.sendMailDeatils = data;
     await this.getPartyMaster(data?.to)
    this.mailAttachment = ''
    this.basecontentUrl = '';
    let reportpayload = { "parameters": { documentId: data?.smartdocumentId } };
    let url = '';
    if(data.documentType === 'Proforma Invoice'){
      url = 'smartProforma'
      }
      else{
      url = 'smartQuotation'
      }
    this.commonService.pushreports(reportpayload, url)?.subscribe({
      next: (res: any) => {

        const blob = new Blob([res], { type: 'application/pdf' });
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result as string;
          let baseContent = base64String.split(",");
          this.basecontentUrl = baseContent[1];
        };
        reader.readAsDataURL(blob)

        const fileReader = new FileReader();
        fileReader.onload = () => {
          this.showPdf(fileReader.result as ArrayBuffer);
        };
        fileReader.readAsArrayBuffer(res);
      }
    })
    this.modalService.open(content1, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
      ariaLabelledBy: 'modal-basic-title'
    })}
  submitForm() {
    if (this.emailForm.valid) {
      this.mail(this.basecontentUrl, this.emailForm.value.email);
      this.modalService.dismissAll()
    }
  }
  mail(bloburl, mailId) {
    console.log(this.sendMailDeatils)
    let fileName = 'quotation.pdf';
    if (this.sendMailDeatils?.documentType === 'Proforma Invoice') {
      fileName = 'smartProforma.pdf';
    }
  
    let attachment = [{ "content": bloburl, "name": fileName }]

    const to = mailId?.split(',')

    let payload = {
      "attachment": attachment,
      "to": to?.map(email => {
        return {
          name: 'email',
          email: email,
        }
      }),
      "templateId": 3,
      "params": {
        "quoteNumber": this.sendMailDeatils?.quoteNumber || '', 
      }



    }

    this.commonService.sendEmail(payload)?.subscribe(
      (result) => {
        if (result.status == "success") {
          this.notification.create('success', 'Email Send Successfully', '');
        }
        else {
          this.notification.create('error', 'Email not Send', '');
        }
      }
    );
  }

}



