import { Component, Input, OnInit, Output, ViewChild ,EventEmitter, ElementRef} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonFunctions } from '../../functions/common.function';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { LoaderService } from 'src/app/services/loader.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonService } from 'src/app/services/common/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Country } from 'src/app/models/state-master';
import { Currencys } from 'src/app/models/party-master';
import { OrderByPipe } from '../../util/sort';
import * as XLSX from 'xlsx';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';

@Component({
  selector: 'app-customs',
  templateUrl: './customs.component.html',
  styleUrls: ['./customs.component.scss']
})
export class CustomsComponent implements OnInit {
  _gc=GlobalConstants
  @Output() getList = new EventEmitter<any>();
  toalLength: any;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  submitted: boolean = false;
  status: string;
  id: any;
  batchData: any;
  closeResult: string;
  customsdata = [];
  customeDocument=[]
  supplyListData: any
  isShow:boolean
  fillingType = [];
  entryType = []
  documentTypeList: any = [];
  CurrentCustomId: string = "";
  currencyList: Currencys[];
  globalSearch: string;
  createCustom: FormGroup;
  countryData: Country[] = [];
  doc: File;
  fileUploadCustomId:string='';
  customIdRow : any =''
  base64Output: any;
  showDefault: boolean = false;
  partyMasterNameList: any;
  customDate: string;
  docForm: any;
  addForm:any;
  extension: any;
  currentUrl: string;
  show: boolean = false;
  isExport: boolean;
  fileTypeNotMatched: boolean; 
  @ViewChild('content') content;
  @Input() type :any;
  @Input() isConsolidate ;
  @Input() consolidationbooking;
  documentTableData: any = Array<any>();
  @ViewChild(MatDrawer) drawer: MatDrawer | any;
  dataSource = new MatTableDataSource();
  pagenation = [10, 20, 50, 100];
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns = [
    '#',
    'customNo',
    'countryName',
    'customDate',
    'locationName',
    'GrossWeight',
    'DutyAmount',
    'currentQueue',
    'LastAction',
    'action',
    'Comment',
    'StatusUpdate',

  ];

  constructor(
    public route: ActivatedRoute,
    public loaderService: LoaderService,
    public modalService: NgbModal,
    public notification: NzNotificationService,
    public router: Router, private commonfunction: CommonFunctions,
    public formBuilder: FormBuilder,
    public commonService: CommonService,
    public sortPipe : OrderByPipe,
    
  ) {
    this.isExport = localStorage.getItem('isExport') === 'false' ? false : true;
    this.id = this.route.snapshot?.params['id']
  }

  ngOnInit(): void {
    this.createCustom = this.formBuilder.group({
      customNo: [''],
      customDate: [''],
      customCountry: [''],
      clearanceLocation: [''],
      currentQueue: [''],
      entryType: [''],
      currency: [''],
      exchangeRate: [''],
      fillingType: [''],
      cargoValue: [''],
      freightValue: [''],
      InsuranceValue: [''],
      GrossWeight: [''],
      NetWeight: [''],
      CargoVolume: [''],
      InvoiceValue: [''],
      FOBValue: [''],
      CIFValue: [''],
      PaymentBy: [''],
      DutyAmount: [''],
      DateToDuty: ['', Validators.required],
      Dutyfree: [false],
      AssessableValue: [''],
      StampDuty: [''],
      batchId: [''],
      batchNo: ['']

    });
    this.docForm = this.formBuilder.group({
      Doc: ['']

    });
    this.addForm = this.formBuilder.group({
      eventType: ['true'],
      eventDate: [''],
      Doc: [''],
      remark: [''],
      notification: [''],
      documentURL: [''],
      documentName: [''],
    });
    this.getcountryList()
    this.getCurrencyDropDowns()
    this.getBatchById()
    this.getcustomdata()
    this.getLocationDropDowns()
    this.getFillingType()
    this.getPartyMaster()
    this.currentUrl = this.router.url?.split('?')[0]?.split('/')[3]
    if (this.currentUrl === 'show') {
      this.createCustom.disable();
      this.show = true
    }
  }
  getBatchById() {
    let payload = this.commonService?.filterList()
    if (payload?.query) payload.query = {
      "batchId": this.route.snapshot.params['id']
    }

    this.commonService?.getSTList('batch', payload)?.subscribe((res: any) => {
      this.batchData = res?.documents[0];
      if(this.batchData?.statusOfBatch == 'Job Cancelled' || this.batchData?.statusOfBatch =='Job Closed'){
        this.createCustom.disable();
        this.docForm.disable();
        this.isShow=false
      }
      if(this.batchData?.enquiryDetails?.basicDetails?.shipperId){
        this.createCustom.controls.PaymentBy.setValue(this.batchData?.enquiryDetails?.basicDetails?.shipperId)
      }
    });
  }
  clearGloble() {
    this.globalSearch = '';
    this.clear()
  }

  opendocuupload(customs){
    this.fileUploadCustomId=customs?.customId;
    this.fetDocument(this.fileUploadCustomId);
  }
  onDelete(deletedata, customs) {
    this.modalService
      .open(deletedata, {
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
            let data =  `custom/${customs?.customId}`
            this.commonService.deleteST(data).subscribe((res: any) => {
              if (res) {
                this.notification.create('success', 'Deleted Successfully', '');
                this.clear();
                setTimeout(() => {
                 this.getcustomdata()
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
  sort(array , key){
    return this.sortPipe.transform(array, key);
   }

  filter(e) {
    this.size = e.target.value;
    this.fromSize = 1;
  }
  getPaginationData(type: any) {
    this.fromSize =
    type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
  let payload = this.commonService?.filterList()
  payload.query = {
  }

  payload.size = Number(this.size),
    payload.from = this.fromSize - 1,
    payload.sort = {
      "desc": ["updatedOn"]
    }
  this.commonService?.getSTList("custom", payload).subscribe((data) => {
    this.customsdata = data.documents;
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

  // will implement soon
  clear() {
  }
 
  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.customsdata.map((row: any) => {
     storeEnquiryData.push({
       'Document#': row.customNo,
       'CHA': row.countryName,
       'customDate':row.customDate,
      'locationName':row.locationName,
      'GrossWeight':row.GrossWeight,
      'DutyAmount':row.DutyAmount,
      'currentQueue':row.currentQueue,
      'action':row.action,
      'Comment':row.comment,
      'StatusUpdate':row.StatusUpdate,
      
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

 const fileName = 'custom.xlsx';
 /* save to file */
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
          "$regex": each.toLowerCase(),
          "$options": "i"
        }
    });

    let payload = this.commonService?.filterList()
    payload.size = Number(10000),
      payload.from = this.page - 1,
      payload.query = this.filterKeys
    payload.sort = {
      "desc": ["updatedOn"]
    }
    this.commonService?.getSTList("custom", payload).subscribe((data) => {
      this.customsdata = data.documents;
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
    this.getcustomdata();
  }

  navigateToNewTab(element) {
    let url = element.agentadviceId + '/edit'
    window.open(window.location.href + '/' + url);
  }
  minDate:any;

  customeetails:any;
  onenMap(content,Customs?) {
    if (Customs) {
      this.customeetails = Customs;
      this.CurrentCustomId = Customs?.customId;
      const customDetails = this.customsdata?.find(custom => custom?.customId === this.CurrentCustomId)
      this.createCustom.patchValue({
        batchId: customDetails?.batchId,
        batchNo: customDetails?.batchNo,
        customNo: customDetails?.customNo,
        customDate: customDetails?.customDate,
        customCountry: customDetails?.countryId,
        clearanceLocation: customDetails?.clearanceLocation,
        currentQueue: customDetails?.currentQueue,
        entryType: customDetails?.entryType,
        currency: customDetails?.currency,
        exchangeRate: customDetails?.exchangeRate,
        fillingType: customDetails?.fillingType,
        cargoValue: customDetails?.cargoValue,
        freightValue: customDetails?.freightValue,
        InsuranceValue: customDetails?.InsuranceValue,
        GrossWeight: customDetails?.GrossWeight,
        NetWeight: customDetails?.NetWeight,
        CargoVolume: customDetails?.CargoVolume,
        InvoiceValue: customDetails?.InvoiceValue,
        FOBValue: customDetails?.FOBValue,
        CIFValue: customDetails?.CIFValue,
        PaymentBy: customDetails?.PaymentBy,
        DutyAmount: customDetails?.DutyAmount,
        DateToDuty: customDetails?.DateToDuty,
        Dutyfree: customDetails?.Dutyfree,
        AssessableValue: customDetails?.AssessableValue,
        StampDuty: customDetails?.StampDuty
      })
    } else {
      this.CurrentCustomId = ""
    }
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });

  }
  fetDocument(customId) {
    let payload = this.commonService?.filterList()
    if(payload?.query)payload.query = {
      "customId": customId
    }
    this.commonService?.getSTList("document", payload)?.subscribe((res: any) => {
      this.customeDocument = res?.documents?.filter(doc=>doc?.documentURL);
    }
    )
  }
  getcustomdata() {
    this.loaderService.showcircle();
    let payload = this.commonService?.filterList()
    if(payload?.query) payload.query = {
      "batchId": this.id
    }
    this.commonService?.getSTList("custom", payload)?.subscribe((res: any) => {
      this.customsdata = res?.documents;
      this.dataSource = new MatTableDataSource(
        res?.documents?.map((s: any,index) => {
          return{
            ...s,
            id:index+1
          }
        })
      );

      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort1
      this.loaderService.hidecircle();
    },()=>{
      this.loaderService.hidecircle();
    }
    )
  }

  events:any;
  


  // add customs funtionality
  getcountryList() {
    let payload = this.commonService?.filterList()
    if(payload?.query)payload.query = {
      "status": true, 
    }
    this.commonService?.getSTList('country', payload).subscribe((res: any) => {
      this.countryData = res?.documents;

    });
  }
  getPartyMaster() {
    let payload = this.commonService?.filterList()
    if(payload?.query) payload.query = {
      "status": true
    }
    this.commonService
      ?.getSTList('partymaster',payload).subscribe((res: any) => {
      this.partyMasterNameList = res?.documents
    });
  }
  getLocationDropDowns() {
    let payload = this.commonService?.filterList()
    if(payload?.query)payload.query = {
      "status": true,
      masterType:   {
        "$in": ['YARD','CFS','ICD']
      },
    }
    this.commonService?.getSTList('location', payload).subscribe((res: any) => {
      this.supplyListData = res?.documents;
    });
  }
  getFillingType() {
    let payload = this.commonService?.filterList()
    if(payload?.query) payload.query = {
      "status": true,
      "typeCategory": {
        "$in": [
          "fillingType","entryType"
        ]
      }
    }
    this.commonService?.getSTList('systemtype', payload).subscribe((res: any) => {
      this.fillingType = res?.documents?.filter(systemtype=>systemtype?.typeCategory==='fillingType');
      this.entryType= res?.documents?.filter(systemtype=>systemtype?.typeCategory==='entryType');
    });
  }

  getCurrencyDropDowns() {
    const payload = this.commonService?.filterList()
    if (payload?.query) payload.query = {}

    this.commonService?.getSTList("currency", payload)?.subscribe((res: any) => {
      this.currencyList = res?.documents;
    });
  }
  closeModal() {
    this.modalService.dismissAll();
  }
  get f1() {
    return this.createCustom.controls;
  }
  get f2() {
    return this.addForm.controls;
  }
  onSave() {
    this.submitted = false;
    this.modalService.dismissAll();
    this.createCustom.reset(); 
  }
  ngOnSave() {
    this.submitted = true;
    if (this.createCustom.invalid) {
      return;
    }

    let payload = {
      batchId: this.isConsolidate  ? this.consolidationbooking?.consolidationbookingId: this.batchData?.batchId,
      batchNo: this.batchData?.batchNo,
      customNo: this.createCustom?.value?.customNo,
      customDate: this.createCustom?.value?.customDate,
      countryId: this.createCustom?.value?.customCountry,
      clearanceLocation: this.createCustom?.value?.clearanceLocation,
      currentQueue: this.createCustom?.value?.currentQueue,
      entryType: this.createCustom?.value?.entryType,
      currency: this.createCustom?.value?.currency,
      exchangeRate: this.createCustom?.value?.exchangeRate,
      fillingType: this.createCustom?.value?.fillingType,
      cargoValue: this.createCustom?.value?.cargoValue,
      freightValue: this.createCustom?.value?.freightValue,
      InsuranceValue: this.createCustom?.value?.InsuranceValue,
      GrossWeight: this.createCustom?.value?.GrossWeight,
      NetWeight: this.createCustom?.value?.NetWeight,
      CargoVolume: this.createCustom?.value?.CargoVolume,
      InvoiceValue: this.createCustom?.value?.InvoiceValue,
      FOBValue: this.createCustom?.value?.FOBValue,
      CIFValue: this.createCustom?.value?.CIFValue,
      PaymentBy: this.createCustom?.value?.PaymentBy,
      DutyAmount: this.createCustom?.value?.DutyAmount,
      DateToDuty: this.createCustom?.value?.DateToDuty,
      Dutyfree: this.createCustom?.value?.Dutyfree,
      AssessableValue: this.createCustom?.value?.AssessableValue,
      StampDuty: this.createCustom?.value?.StampDuty,
      countryName: this.countryData.find(country => country?.countryId === this.createCustom?.value?.customCountry)?.countryName,
      currencyName: this.currencyList.find(currency => currency?.currencyId === this.createCustom?.value?.currency)?.currencyShortName,
     locationId : this.createCustom?.value?.clearanceLocation,
      locationName: this.supplyListData.find(location => location?.locationId === this.createCustom?.value?.clearanceLocation)?.locationName,
      fillingtypeName: this.fillingType.find(systemtype => systemtype?.systemtypeId === this.createCustom?.value?.fillingType)?.typeName,
      entrytypeName: this.entryType.find(systemtype => systemtype?.systemtypeId === this.createCustom?.value?.entryType)?.typeName,
      name: this.partyMasterNameList.find(shippername => shippername?.partymasterId === this.createCustom?.value?.PaymentBy)?.name,
      customStatus : this.CurrentCustomId ? this.customeetails?.customStatus : 'Pending'
    }
    if (this.CurrentCustomId) {
      this.commonService.UpdateToST("custom/" + this.CurrentCustomId, payload)?.subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Updated Successfully', '');
            this.onSave(); 
            this.getcustomdata()
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error', error?.error?.error, '');
        }
      );
    } else {
      this.commonService.addToST("custom", payload)?.subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Added Successfully', '');
            this.onSave(); 
            this.getcustomdata()
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error', error?.error?.error, '');
        }
      );
    }


  }
  onFileSelected(event) {
    let filename = event.target.value.replace('C:\\fakepath\\', '');
    this.docForm.get('documentName')?.setValue(filename);
    this.extension = filename.substr(filename.lastIndexOf('.'));
    if (
      this.extension.toLowerCase() === '.xls' ||
      this.extension.toLowerCase() === '.xlsx' ||
      this.extension.toLowerCase() === '.pdf' ||
      this.extension.toLowerCase() === '.doc' ||
      this.extension.toLowerCase() === '.docx'
    ) {
      this.fileTypeNotMatched = false;
      this.doc = event.target.files[0];
    } else {
      this.fileTypeNotMatched = true;
      this.base64Output = '';
      this.docForm.get('documentURL')?.setValue('');
      this.docForm.get('Doc')?.setValue('');
    }
  }
  async addDocument() {
    this.submitted = true;
    var data = this.docForm.value;
    var filename = data.documentName + this.extension;
    const formData = new FormData();
    formData.append('file',  this.doc ,  `bookingUpload-${this.doc.name}`); 
    formData.append('name', `bookingUpload-${this.doc.name}`);
    
    let file = await this.commonService.uploadDocuments('uploadfile',formData).subscribe();
    if (file ) {
      data.documentURL = `${this.doc.name}`;
      if (this.docForm.invalid) {
      } else {
        this.submitted = false;
        if (!data.documentName?.includes(this.extension)) {
          data.documentName = filename;
        }
        delete data.Doc;
        this.docForm.reset();
      }
    }
  }
  checkDocUploaded() {
    if (this.documentTableData.filter((x) => x.documentStatus  ).length > 0) {
      return false
    } else { return true }
  }

  downloadFile(doc) {
    this.commonService.downloadDocuments('downloadfile',doc.documentURL).subscribe(
      (fileData: Blob) => { 
        this.commonService.downloadDocumentsFile(fileData,doc.documentURL); 
      },
      (error) => {
        console.error(error);
      }
    );
  }
  async  uploadDocument() {
      if(!this.doc)return;
      const formData = new FormData();
      formData.append('file',  this.doc ,  `${this.doc.name}`);
      formData.append('name', `${this.doc.name}`);
     
      let file = await this.commonService.uploadDocuments('uploadfile',formData).subscribe();
      if(file){
      let payload = {
        Doc: this.docForm?.value?.Doc,
        documentURL:this.doc.name,
        customId:this.fileUploadCustomId,
        documentStatus:true
      }
      this.commonService.addToST('document',payload).subscribe(
        (res) => {
          if (res) {
             this.notification.create('success', 'Saved Successfully', '');
            //  (<HTMLInputElement>document.getElementById('formFileMultiple')).value = '';
             this.doc=null;
            this.fetDocument(this.fileUploadCustomId);
          }
        },
        (error) => {
          this.notification.create('error', 'Failed to upload the document.', '');
        }
      );
      }
   
 
  }
   deleteFile(doc) {
    let data =`document/${doc.documentId}`
              this.commonService.deleteST(data).subscribe((res: any) => {
                if (res) {
                  this.notification.create('success', 'Deleted successfully', '');
                  setTimeout(() => {
                    this.fetDocument(this.fileUploadCustomId);
                  }, 1000);
                 
                }
          });
  }
  documentPreview(doc) {
    this.commonService.downloadDocuments('downloadfile',doc.documentURL)?.subscribe(
      (res: Blob) => {  
        const blob = new Blob([res], { type: 'application/pdf' });
        let temp = URL.createObjectURL(blob); 
        const pdfWindow = window.open(temp);
        pdfWindow.print();
      },
      (error) => {
        console.error(error);
      }
    );
  }
  popUptext:any = ''

  updatedID:any;
  sendToCha(id,name){
    this.popUptext = name
    this.events = null
    
    this.updatedID = id
    let payload: any = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "entityId": id,
      eventName : name
    };
    if(payload?.sort)payload.sort = {
      "asc": ['eventSeq'],
    };
    this.commonService.getSTList('event', payload)?.subscribe((data: any) => {
      this.events = data.documents[0];  
      this.addForm.patchValue({
        eventType : this.events?.eventData?.eventState,
        eventDate : this.events?.eventData?.bookingDate, 
        remark : this.events?.eventData?.Remarks,
        notification : this.events?.eventData?.notification,
        documentURL : this.events?.eventData?.documentURL
      })
    }); 

   
  }

 async updateCustom() {  

  if(this.doc1?.name){
    const formData = new FormData();
    formData.append('file', this.doc1, `${this.doc1.name}`);
    formData.append('name', `${this.doc1.name}`);

    await this.commonService.uploadDocuments('uploadfile', formData).toPromise();
  }

    const payload = {
      ...this.events, 
      eventData : {
        ...this.events?.eventData,
        notification : this.addForm.value.notification,
        eventState: this.addForm.value?.eventType,
        bookingDate: this.addForm.value?.eventDate,
        Remarks : this.addForm.value?.remark,
        documentURL: this.doc1?.name || this.events?.eventData?.documentURL
      }
    };
    this.commonService.UpdateToST(`event/${payload?.eventId}`, payload)?.subscribe((res) => {
      if (res) {
        this.closeModal1()
        this.getcustomdata() 
        if(!res.isUpdated){
          this.updateBatchStatus(res.eventName)
        }
        // this.notification.create('success', 'Update Successfully', ''); 
      } else {
        this.notification.create('error', 'Error while updating', '');
      }
    })
  }

  updateBatchStatus(event?) { 
    const customDetails = this.customsdata?.find(custom => custom?.customId === (this.customIdRow || this.updatedID))
    const payload = {
      ...customDetails,
      customId: customDetails?.customId,
      StatusUpdate: event,
      customStatus: event,
    };
    this.commonService.UpdateToST(`custom/${customDetails?.customId}`, payload)?.subscribe((res) => {
      if (res) { 
        this.getcustomdata()
        this.customIdRow = null
        this.updatedID = null
        this.notification.create('success', 'Update Successfully', ''); 
      } else {
        this.customIdRow = null
        this.updatedID = null
        this.notification.create('error', 'Error while updating', '');
      }
    })
  }
  @ViewChild('myModal') myModal: ElementRef;
  @ViewChild('myModal1') myModal1: ElementRef; 
  closeModal1() {
 

    const modalElement0 = this.myModal?.nativeElement;
    if (modalElement0) {
      modalElement0.classList.remove('show');
      modalElement0.style.display = 'none';
      document.body.classList.remove('modal-open'); // Removes 'modal-open' class from the body if added
      const modalBackdrop = document.querySelector('.modal-backdrop');
      if (modalBackdrop) {
        modalBackdrop.remove(); // Removes the backdrop if exists
      }
    }
    const modalElement1 = this.myModal1?.nativeElement;
    if (modalElement1) {
      modalElement1.classList.remove('show');
      modalElement1.style.display = 'none';
      document.body.classList.remove('modal-open'); // Removes 'modal-open' class from the body if added
      const modalBackdrop = document.querySelector('.modal-backdrop');
      if (modalBackdrop) {
        modalBackdrop.remove(); // Removes the backdrop if exists
      }
    }
  }
  doc1:File;
  onFileSelected1(event) {
    let filename = event.target.value.replace('C:\\fakepath\\', '');
    this.addForm.get('documentName')?.setValue(filename);
    this.extension = filename.substr(filename.lastIndexOf('.'));
    if (
      this.extension.toLowerCase() === '.xls' ||
      this.extension.toLowerCase() === '.xlsx' ||
      this.extension.toLowerCase() === '.pdf' ||
      this.extension.toLowerCase() === '.doc' ||
      this.extension.toLowerCase() === '.docx'
    ) {
      this.fileTypeNotMatched = false;
      this.doc1 = event.target.files[0];
    } else {
      this.fileTypeNotMatched = true;
      this.base64Output = '';
      this.addForm.get('documentURL')?.setValue('');
      this.addForm.get('Doc')?.setValue('');
    }
  }

}


