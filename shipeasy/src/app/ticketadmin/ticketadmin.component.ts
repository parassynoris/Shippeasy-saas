import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ApiService } from '../admin/principal/api.service';
import { CognitoService } from '../services/cognito.service';
import { CommonService } from '../services/common/common.service';
import { GlobalConstants } from '../services/common/constants/GlobalConstants';
import { LoaderService } from '../services/loader.service';



@Component({
  selector: 'app-ticketadmin',
  templateUrl: './ticketadmin.component.html',
  styleUrls: ['./ticketadmin.component.scss']
})
export class TicketadminComponent implements OnInit {

  _gc=GlobalConstants;
  addTicketForm: FormGroup;
  isEdit: boolean = false;
  dataSource = new MatTableDataSource();
  ticketData:  [];
  ticketDatas:any
  toalLength: number;
  size = 10;
  page = 1;
  count = 0;
  uploadsDoc: File
  pipelineList: any = [];
  ticketList: any = ['Resolved', 'In Progress'];
  fromSize: number = 1;
  userTable:FormGroup;
  title: string
  description: string
  pipeline: string
  priority : string
  companyName : string
  comments: [];
  ticketStatus: string
  displayedColumns =[
    '#', 
    'action',
    'ticketNo',
    'title',
    'priority',
    'ticketDate',
    'status',
    'companyName',
   
  
  ];
  displayedColumns1 = this.displayedColumns.map((x, i) => x + '_' + i);
  toggleFilters = true;
  filtersModel = [];
  filterKeys = {};
  public Editor = ClassicEditor
  submitted: boolean = false;
  userdetails:any
  @ViewChild(MatSort) sort1: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(public commonService : CommonService,
    private fb: FormBuilder,
    public modalService: NgbModal,
    private cognito:CognitoService,
    private notification: NzNotificationService,
    public loaderService: LoaderService,
    public _api: ApiService,) { 
    this.addTicketForm = this.fb.group({
      title:['', Validators.required],
      description:['', Validators.required],
      pipeline:['', Validators.required],
      priority:['', Validators.required],
      uploadsDoc:[''],
      uploadsDocAdmin:[''],
      ticketStatus:[''],
      comments:[''],
      ticketDocumentName:[''],
      ticketDocumentNameAdmin:[''],
      ticketDocumentIdAdmin:[''],
      ticketDocumentId:[''],
    })
    
  }


  ngOnInit(): void {
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.userdetails = resp.userData
      }
    })
    this.getSystemTypeDropDowns();
    this.getTicketData();

    this.userTable = this.fb.group({
      tableRows: this.fb.array([])
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
  getSystemTypeDropDowns() {
   
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      typeCategory: 'pipeline',
      "status": true
    }
    this._api.getSTList("systemtype", payload)?.subscribe((res: any) => {
      this.pipelineList = res?.documents?.filter(x => x.typeCategory === "pipeline");
    });
  }
  extension: any;
  fileTypeNotMatched: boolean;
  doc: File;


  onFileSelected(event, type) {
    let filename = event.target.value.replace('C:\\fakepath\\', '');
    // if (/\s/.test(filename)) {
    //   this.notification.create('error', 'Filename Error', 'File contains whitespace, to continue please upload file without space');
    //   return;
    // }
    this.addTicketForm.get(`${type}DocumentNameAdmin`)?.setValue(filename);
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
    }
  }
  documentPreview(type) {
    this.commonService.downloadDocuments('downloadfile', this.addTicketForm.value?.[`${type}DocumentNameAdmin`])?.subscribe(
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
  downloadFile(type) {
    this.commonService.downloadDocuments('downloadfile', this.addTicketForm.value?.[`${type}DocumentNameAdmin`]).subscribe(
      (fileData: Blob) => {
        this.commonService.downloadDocumentsFile(fileData, this.addTicketForm.value?.[`${type}DocumentNameAdmin`]);
      },
      (error) => {
        console.error(error);
      }
    );
  }
  documentPreviewCustomer(type) {
    this.commonService.downloadDocuments('downloadfile', this.addTicketForm.value?.[`${type}DocumentName`])?.subscribe(
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
  downloadFileCustomer(type) {
    this.commonService.downloadDocuments('downloadfile', this.addTicketForm.value?.[`${type}DocumentName`]).subscribe(
      (fileData: Blob) => {
        this.commonService.downloadDocumentsFile(fileData, this.addTicketForm.value?.[`${type}DocumentName`]);
      },
      (error) => {
        console.error(error);
      }
    );
  }
  deleteFile(type, content1) {
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
          if (result === 'yes') {
            let data = `document`
            let documentId = this.addTicketForm.value[`${type}DocumentIdAdmin`]

            this.commonService.deleteDocument(data, documentId).subscribe((res: any) => {
              if (res) {
                this.addTicketForm.get(`${type}DocumentNameAdmin`).setValue('');
                this.addTicketForm.get(`${type}DocumentIdAdmin`).setValue('');
                this.notification.create('success', 'Deleted successfully', '');
              }
            });
          }
        }
      );
  }
  async uploadDocument(type) {
    if (!this.doc) return;
    const formData = new FormData();
    formData.append('file', this.doc, `${this.doc.name}`);
    formData.append('name', `${this.doc.name}`);

    await this.commonService.uploadDocuments('uploadfile', formData).subscribe(async (res) => {
      if (res) {
        let payload = {
          Doc: this.addTicketForm?.value?.Doc,
          documentType: 'fdvcre4gtr',
          documentName: res.name,
          documentURL: res?.name,
          ticketid: this.addTicketForm?.value?.ticketId,
          documentStatus: true
        }
        await this.commonService.addToST('document', payload).subscribe(
          (docRes) => {
            if (docRes) {
              this.notification.create('success', 'Saved Successfully', '');
              this.doc = null;
              this.addTicketForm.get(`${type}DocumentIdAdmin`)?.setValue(docRes?.documentId);
              this.addTicketForm.get(`${type}DocumentNameAdmin`)?.setValue(decodeURIComponent(docRes?.documentName));
            }
          },
          (error) => {
            this.notification.create('error', 'Failed to upload the document.', '');
          }
        );
      }
    });


  }
  
  show:string
  ticketClose: boolean =false;
  open(AddClause, ticketData?: any, show?){
    this.isEdit = false;
    this.show = show
    this.ticketClose = false;
  
    if (ticketData) {
      this.ticketDatas=ticketData
      this.isEdit = true;
      this.ticketId = ticketData?.ticketId;
      (!this.ticketList.includes(ticketData?.ticketStatus))?this.ticketList.push(ticketData?.ticketStatus):this.ticketList
      show === 'show'?this.addTicketForm.disable():this.addTicketForm.enable()
      this.addTicketForm.patchValue({
        title: ticketData?.title,
        description: ticketData?.description,
        pipeline: ticketData?.pipeline,
        priority: ticketData?.priority,
        uploadsDoc: ticketData?.ticketDocumentName?? ticketData?.uploadsDoc,
        uploadsDocAdmin: ticketData?.ticketDocumentNameAdmin?? ticketData?.uploadsDocAdmin,
        ticketStatus:ticketData?.ticketStatus,
        ticketDocumentId: ticketData.ticketDocumentId || "",
        ticketDocumentIdAdmin: ticketData.ticketDocumentIdAdmin || "",
        ticketDocumentNameAdmin: ticketData?.ticketDocumentNameAdmin || '',
        ticketDocumentName: ticketData?.ticketDocumentName || '',
      });
      
      if(ticketData?.ticketStatus ==="Closed"){
        this.addTicketForm.disable(),
        this.ticketClose = true;
      }
      
      if(ticketData?.charges){
        const control = this.userTable.get('tableRows') as FormArray;
        ticketData?.charges?.map((i) => {
          control.push(this.fb.group(i))
        });
      }
    }
    this.modalService.open(AddClause, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'xl',
    });
  }
  get f() {
    return this.addTicketForm.controls;
  }

  getTicketData() {
    this.loaderService.showcircle();
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
       
      }
      if(payload?.size)payload.size = this.pageSize;
      if(payload?.from)payload.from =this.from
      
      this.commonService.getSTList('ticket',payload)?.subscribe((res: any) => {
      this.ticketData = res.documents;
  
    if (res && res?.documents) {
      this.dataSource.data = res?.documents.map((s: any, i: number) => ({
        ...s,
        id: i + 1,
        ticketNo: s.ticketNo,
        title: s.title,
        comments: s.comments,
        ticketStatus: s.ticketStatus,
        ticketDate: s.createdOn,
        priority: s.priority,
        companyName: s.companyName,
        
      }));
      // this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort1; 
      this.toalLength = res.totalCount;
      this.count = res.documents.length;
      this.loaderService.hidecircle(); 
    }
  });
  }
  pageNumber = 1;
  pageSize = 10;
  from = 0;
  totalCount = 0;

  onPageChange(event){
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.from = event.pageIndex*event.pageSize ;
    this.getTicketData();
  }
  searchColumns() {
    this.filterKeys = {};
    this.filtersModel.forEach((each, ind) => {
      if (each)
        this.filterKeys[this.displayedColumns[ind]] = {
          "$regex": each.toLowerCase(),
          "$options": "i"
        }
    });
    let payload = this.commonService.filterList()
    payload.query = this.filterKeys
    payload.sort = {
      "desc": ["updatedOn"]
    }
    this.commonService.getSTList('ticket',payload).subscribe((data) => {
      this.ticketData = data.documents;
      this.dataSource = new MatTableDataSource(data?.documents?.map((s: any,index) => {
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
  closeResult: string;
  onDelete(deletedata, ratemasters) {
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
            let data =  `ratemaster/${ratemasters?.ratemasterId}`
            this.commonService.deleteST(data).subscribe((res: any) => {
              if (res) {
                this.notification.create('success', 'Deleted Successfully', '');
                this.clear();
                setTimeout(() => {
                 this.getTicketData()
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
  clear(){
    this.ticketNo='';
    this.title='';
    this.description='';
    this.pipeline='';
    this.priority='';
    this.comments=[]
    this.ticketStatus='';
    this.getTicketData();
  }
  clearFilters() {
    this.filtersModel = [];
    this.filterKeys = {};
    this.getTicketData();
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
  }
  closeModal() {
    this.modalService.dismissAll();
    this.onreset();
  }
  ticketNo:string;
  ticketdate:string;
  getPaginationData(type: any) {
    this.fromSize =
    type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;

  let payload = this.commonService.filterList()
  payload.size = Number(this.size),
  payload.from = this.fromSize - 1,
  payload.sort = {  "desc" : ['updatedOn'] }
  let mustArray = {};

  this.ticketNo = this.ticketNo?.trim();
  this.title = this.title?.trim();
  this.ticketStatus = this.ticketStatus?.trim();
  this.ticketdate = this.ticketdate?.trim();
  this.priority = this.priority?.trim();
  this.companyName = this.companyName?.trim();



  if (this.ticketNo) {
    mustArray['ticketNo'] = {
      "$regex": this.ticketNo,
      "$options": "i"
    }
  }
  if (this.title) {
    mustArray['title'] = {
      "$regex": this.title,
      "$options": "i"
    }
  }
  if (this.ticketStatus) {
    mustArray['ticketStatus'] = {
      "$regex": this.ticketStatus,
      "$options": "i"
    }
  }
  if (this.ticketdate) {
    mustArray['ticketdate'] = {
      "$regex": this.ticketdate,
      "$options": "i"
    }
  }
  if (this.companyName) {
    mustArray['companyName'] = {
      "$regex": this.companyName,
      "$options": "i"
    }
  }

  payload.query=mustArray;
        this.commonService.getSTList('ticket',payload).subscribe((data: any) => {
      this.ticketData = data?.documents;
      this.toalLength = data.totalCount;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count =
        type === 'prev'
          ? this.toalLength === this.count
            ? this.count -  ((this.toalLength % Number(this.size))>0?(this.toalLength % Number(this.size)):(Number(this.size)))
            : this.count - data.documents.length
          : this.count + data.documents.length;
    });
  }
  onreset(){
    this.addTicketForm.reset();
    this.submitted = false;
  }
  ticketId:any = '';
  chargeName: any
  onSave() {
    this.submitted = true;
    if (this.addTicketForm.invalid) {
      return;
    }
    const commentList = this.ticketDatas?.comments ??[];
    if(this.addTicketForm.value?.comments){
      commentList.push({
          commentText : this.addTicketForm.value?.comments,
          commentBy : this.userdetails.name+' '+this.userdetails?.userLastname ,
          commentedOn : new Date() ,
          commentStatus : "" ,
      })
    }
    const Payload = {
      title: this.addTicketForm.value?.title,
      description: this.addTicketForm.value?.description,
      pipeline: this.addTicketForm.value?.pipeline,
      priority: this.addTicketForm.value?.priority,
      uploadsDoc: this.addTicketForm.value?.uploadsDoc,
      uploadsDocAdmin: this.addTicketForm.value?.uploadsDocAdmin,
      ticketStatus: this.addTicketForm.value?.ticketStatus,
      ticketDocumentName: this.addTicketForm.value?.ticketDocumentName,
      ticketDocumentNameAdmin: this.addTicketForm.value?.ticketDocumentNameAdmin,
      ticketDocumentIdAdmin: this.addTicketForm.value?.ticketDocumentIdAdmin,
      ticketDocumentId: this.addTicketForm.value?.ticketDocumentId,
      comments:commentList ,
    }
    if(this.isEdit && this.ticketId){
      this.commonService
      .UpdateToST(`ticket/${this.ticketId}`,{  ...Payload })
      ?.subscribe(
        (res: any) => {
          if (res) {
            this.notification.create(
              'success',
              'Record Updated Successfully',
              ''
            );
            this.SendMail(this.ticketId,res)
            this.onreset()
            this.getTicketData();
            this.modalService.dismissAll();
          }
        },
        (error) => {
          // this.onSave();
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
    } else {
      this.commonService.addToST('ticket', Payload)?.subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Added Successfully', '');
            this.onreset()
            this.modalService.dismissAll();
            this.getTicketData();
          }
        },
        (error) => {
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
    }

  }
  SendMail(ticketId,res){
    let formdata:any={}
    formdata=this.addTicketForm.value;
    let subject="";
    let emaildata="";
    if(ticketId){
      subject = `T.No. ${res?.ticketNo} - ${this.addTicketForm.value?.title}`;
      emaildata = `Dear ${res?.createdBy}, <br><br>
      Ticket No.-${res?.ticketNo}<br>
                       Title :- ${this.addTicketForm.value?.title}<br>
                       The status of your ticket has been changed to ${res?.ticketStatus}<br><br>
                       With Regards,<br>
                       Support Team`;
    }
    else{
      subject = `${this.addTicketForm.value?.title}`;
      emaildata = `Dear Support Team, <br>
                      Title :- ${this.addTicketForm.value?.title}<br>
                      Ticket No.-${res?.ticketNo}  has been raised`;
    }
   
    let payload = {
      sender: {
        name: "It Support Team",
        email: 'it.shipeasy@gmail.com'
      },
      to: [{ email: `${res?.userEmail}` }],
      textContent: `${emaildata}`,
      subject: `${subject}`
    };
    this._api.sendEmail(payload).subscribe(
      (res) => {
        this.notification.success('Success', 'Email sent successfully');
      },
      (error: HttpErrorResponse) => {
        this.notification.error('Error', 'Failed to send email. Please try again later.');
      }
    );
  }

}

