import { Component, OnInit, Input, OnDestroy, OnChanges, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
// import { ApiSharedService } from '../api-service/api-shared.service';
import { Subject, Subscription } from 'rxjs';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/services/common/common.service';
import { document } from 'src/app/models/document';
// import { CommonFunctions } from '../../functions/common.function';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { ApiSharedService } from '../../../api-service/api-shared.service';
import { NewWareHouseDoucmentComponent } from '../ware-house-bill-of-entry/new-ware-house-doucment/new-ware-house-doucment.component';
@Component({
  selector: 'app-warehouse-document',
  templateUrl: './warehouse-document.component.html',
  styleUrls: ['./warehouse-document.component.scss']
})
export class WarehouseDocumentComponent implements OnInit {

  @Input() batch: any;
  @Output() CloseNew = new EventEmitter<string>();
  documentData: document[] = [];
  public ngUnsubscribe = new Subject<void>();
  urlParam: any;
  documentTableData: any = Array<any>();
  closeResult: string; 
  buttonDisabled:boolean=true;
  @Output() getBatchById: EventEmitter<any> = new EventEmitter();
  containerList: string;
  checkedList: any;
  combinedAttachments: any
  batchId: any;
  @Input() batchDetail:any
  instructionData: any = [];
  checkValid: any;
  isShow: boolean = false;
  _sharedService: any;
  subscription: Subscription;
  siAttachmentName: any;
  finalPrintAttachmentName: any;
  pdfUrl: any;
  currentLogin: any;

  constructor(
    private notification : NzNotificationService,
    public router: Router,
    public modalService: NgbModal,
    public commonService: CommonService,
    public location: Location,
    private commonfunction : CommonFunctions,
    public api: ApiSharedService,
    private route: ActivatedRoute) { 
      this.currentLogin = this.commonfunction.getUserType1() 
    this.route.params.subscribe(params => {
      this.urlParam = params;
    });
    this.isShow = this.urlParam?.access === 'show' ? true : false;
    setTimeout(() => {
      this.getData(); 
      if(this.batchDetail?.statusOfBatch == 'Job Cancelled' || this.batchDetail?.statusOfBatch =='Job Closed'){
        // this.newenquiryForm.disable();
        this.buttonDisabled=false

      }
      
    }, 500);
  }
ngOnChanges(changes: SimpleChanges): void {
  this.batchDetail=this.batchDetail;
  if(this.batchDetail?.statusOfBatch == 'Job Cancelled' || this.batchDetail?.statusOfBatch =='Job Closed'){
    // this.newenquiryForm.disable();
    this.buttonDisabled=false

  }
}
  next() {
    this.router.navigate(['portcall-enquiry/list/add/' + this.urlParam.id + '/' + 'enquiry']);
  }

  // ngOnChanges() {
  //   this.getData();
  // }

  ngOnInit(): void {
    // this.getData();
    // this.getShippingInstru();
  }

  downloadFile(doc) {
    this.commonService.downloadDocuments('downloadfile', doc.documentURL).subscribe(
      (fileData: Blob) => {
        if (fileData) {
          this.commonService.downloadDocumentsFile(fileData, doc.documentURL);
        } else {
          console.error('No file data received');
        }
      },
      (error) => {
        console.error('File download error', error);
      }
    );
  }


  documentPreview(doc) {
    this.commonService.downloadDocuments('downloadfile', doc.documentURL).subscribe(
      (res: Blob) => {
        const fileType = doc.documentURL.split('.').pop().toLowerCase(); // Get file extension
        const blob = new Blob([res], { type: `application/${fileType}` }); // Set blob type based on file extension
        const temp = URL.createObjectURL(blob);
        
        if (fileType === 'pdf') {
          const pdfWindow = window.open(temp);
          // pdfWindow.print();
        } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(fileType)) {
          // Handle image preview
          const img = document.createElement('img');
          img.src = temp;
          const imgWindow = window.open('');
          imgWindow.document.write('<html><body style="margin:0; text-align:center;"></body></html>');
          imgWindow.document.body.appendChild(img);
        } else {
          // Download other file types
          const link = document.createElement('a');
          link.href = temp;
          link.setAttribute('download', doc.documentURL);
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      },
      (error) => {
        console.error('Document preview error', error);
      }
    );
  }
  

  // removeRow(doc, content1, i) {
  //   this.modalService.open(content1, {
  //     backdrop: 'static',
  //     keyboard: false,
  //     centered: true,
  //     size: 'sm',
  //     ariaLabelledBy: 'modal-basic-title',
  //   }).result.then(
  //     (result) => {
  //       this.closeResult = `Closed with: ${result}`;
  //       this.commonService.deleteST(`document/${doc.documentId}`).subscribe((res) => {
  //         this.documentData.splice(i, 1);
  //       }, err => {
  //         this.notification.create('error', err.error, '');
  //       });
  //     },
  //     (reason) => {
  //       this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
  //     }
  //   );
  // }

  removeRow(doc, content1, i) {
    this.modalService.open(content1, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'sm',
      ariaLabelledBy: 'modal-basic-title',
    }).result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
        if(doc?.isSi || doc?.refType=='BL'){
          let payload:any={};
          if(doc?.documentType==='SI From Customer'){
            payload={
              "instructionId":doc?.instructionId,
              "si":doc?.si
            }
            delete payload?.si?.filedAttachment;
            delete payload?.si?. filedAttachmentName
            this.updateInstruction('instruction',payload);
          }else if(doc?.documentType==='Booking'){
            payload={
              "instructionId":doc?.instructionId,
              "si":doc?.si
            }
            delete payload?.si?.siAttachment;
            delete payload?.si?.siAttachmentName
            this.updateInstruction('instruction',payload);
          }
          else if(doc?.documentType==='Dangerous Good Declaration'){
            payload={
              "instructionId":doc?.instructionId,
              "dg":doc?.dg
            }
            delete payload?.dg.dgAttachment;
            delete payload?.dg.dgAttachmentName
            this.updateInstruction('instruction',payload);
          }else if(doc?.documentType==='Master BL Draft Received'){
            payload={
              "instructionId":doc?.instructionId,
              "mblDraft":doc?.mblDraft
            }
            delete payload?.mblDraft.firstPrintAttachment;
            delete payload?.mblDraft.firstPrintAttachmentName
            this.updateInstruction('instruction',payload);
          }else if(doc?.documentType==='Master BL Original Received'){
            payload={
              "instructionId":doc?.instructionId,
              "mblOriginal":doc?.mblOriginal
            }
            delete payload?.mblOriginal.finalAttachment;
            delete payload?.mblOriginal.finalAttachmentName
            this.updateInstruction('instruction',payload);
          }else if(doc?.documentType==='Volume Gross Mass (VGM)'){
            payload={
              "instructionId":doc?.instructionId,
              "vgmItem":doc?.vgmItem
            }
            delete payload?.vgmItem.vgmAttachment;
            delete payload?.vgmItem.vgmAttachmentName
            this.updateInstruction('instruction',payload);
          }
          else if(doc?.documentType==='BL Document'){
            payload={
              "blId":doc?.documentId,
              pdfUrl:""
            }
            this.updateBl('bl',payload);
          }
          this.documentData.splice(i, 1);
        }else{
          this.commonService.deleteST(`document/${doc?.documentId}`).subscribe(
            (res) => {
              this.documentData.splice(i, 1);
            },
            (err) => {
              this.notification.create('error', err.error, '');
            }
          );
        }
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );
  }

  updateInstruction(type,payload){
    this.commonService
    .UpdateToST(`${type}/${payload?.instructionId}`, { ...payload})
    .subscribe(
      (res: any) => {

      })
  }

  updateBl(type, payload){
    this.commonService
    .UpdateToST(`${type}/${payload?.blId}`, { ...payload })
    .subscribe(
      (res: any) => {

      },
      (error: any) => {
     
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

  getData() {
    let payload = this.commonService.filterList();
    if (payload?.query) {
      payload.query = {
        refId: this.route.snapshot.params['id']
      };
    }
    if(this.currentLogin === 'transporter'){
      payload.query ={
        ...payload.query,
        refType: 'transport'
      }
    }
    this.commonService.getSTList('document', payload).subscribe((res: any) => {
      this.documentData = []
      this.getinstructiondocs(res?.documents);
    });
  }

  getinstructiondocs(doc){
    let payload = this.commonService.filterList();
    payload.query = {
      'batchId': this.urlParam?.id,
    };
    this.commonService.getSTList('instruction', payload).subscribe((res: any) => {
      if (res?.documents?.length > 0) {
        this.instructionData=[]
        this.instructionData = res.documents.flatMap((doc: any) => {
          let attachments = [];

          if (doc?.dg?.dgAttachmentName) {
            attachments.push({
              instructionId:doc?.instructionId,
              isSi:true,
              dg:doc?.dg,
              documentType: 'Dangerous Good Declaration',
              documentName: doc.dg.dgAttachmentName,
              updatedOn: doc.updatedOn,
              updatedBy: doc.updatedBy
            });
          }

          if (doc?.mblDraft?.firstPrintAttachmentName) {
            attachments.push({
              instructionId:doc?.instructionId,
              isSi:true,
              mblDraft:doc?.mblDraft,
              documentType: 'Master BL Draft Received',
              documentName: doc.mblDraft.firstPrintAttachmentName,
              updatedOn: doc.updatedOn,
              updatedBy: doc.updatedBy
            });
          }

          if (doc?.mblOriginal?.finalAttachmentName) {
            attachments.push({
              instructionId:doc?.instructionId,
              isSi:true,
              mblOriginal:doc?.mblOriginal,
              documentType: 'Master BL Original Received',
              documentName: doc.mblOriginal.finalAttachmentName,
              updatedOn: doc.updatedOn,
              updatedBy: doc.updatedBy
            });
          }

          if (doc?.si?.filedAttachmentName) {
            attachments.push({
              instructionId:doc?.instructionId,
              si:doc?.si,
              isSi:true,
              documentType: 'SI From Customer',
              documentName: doc.si.filedAttachmentName,
              updatedOn: doc.updatedOn,
              updatedBy: doc.updatedBy
            });
          }

          if (doc?.si?.siAttachmentName) {
            attachments.push({
              instructionId:doc?.instructionId,
              isSi:true,
              si:doc?.si,
              documentType: 'Booking',
              documentName: doc.si.siAttachmentName,
              updatedOn: doc.updatedOn,
              updatedBy: doc.updatedBy
            });
          }

          if (doc?.si?.siRevised?.length > 0) {
            doc.si.siRevised.forEach((siRevisedItem: any) => {
              if (siRevisedItem?.attachment) {
                attachments.push({
                  instructionId: doc?.instructionId,
                  isSi: true,
                  documentType: `SI Revised `,
                  documentName: siRevisedItem.attachment,
                  updatedOn: siRevisedItem.siRevised,
                  updatedBy: doc.updatedBy
                });
              }
            });
          }

          if (doc?.vgm?.length > 0) {
            doc.vgm.forEach((vgmItem: any) => {
              if (vgmItem?.vgmAttachmentName) {
                attachments.push({
                  instructionId:doc?.instructionId,
                  isSi:true,
                  documentType: `Volume Gross Mass (VGM) - ${vgmItem.containerNo}`,
                  documentName: vgmItem.vgmAttachmentName,
                  updatedOn: doc.updatedOn,
                  updatedBy: doc.updatedBy
                });
              }
            });
          }

          return attachments;
        });

        this.combineData(doc);
      }else{
        this.documentData=doc;
       this.getbldocs()
      }
    });
  }
  InquiryDocList:any
  getInquiryDoc() {
    let payload = this.commonService.filterList();

    payload.query = {
        'batchId': this.urlParam?.id,
    };

    this.commonService.getSTList('enquiry', payload)
        ?.subscribe((res: any) => {
            this.InquiryDocList = res.documents;
            
            // Extract msdsDoc from each cargoDetail
            this.InquiryDocList.forEach((document: any) => {
                if (document.cargoDetail && document.cargoDetail.length > 0) {
                    document.cargoDetail.forEach((cargo: any) => {
                        if (cargo.msdsDoc) {
                          this.documentData = [
                            ...this.documentData,
                            {
                              documentName: cargo.msdsDoc,
                              documentType: 'MSDS',
                              updatedOn: document?.updatedOn,
                              updatedBy: document?.updatedBy,
                              _id: {
                                $oid: ''
                              },
                              documentId: document?.blId,
                              collection: '',
                              createdBy: '',
                              createdOn: '',
                              documentURL: '',
                              isOld: false,
                              metaData: [],
                              orgId: '',
                              principal: undefined,
                              refType: 'msds',
                              s3Bucket: '',
                              tags: [],
                              tenantId: '',
                              userType: '',
                              siAttachmentName: '',
                              filedAttachmentName: '',  
                              finalAttachmentName: '',
                              firstPrintAttachmentName: '',
                              dgAttachmentName: ''
                            }
                          ];
                        }
                    });
                }
            });
        });
}


  getbldocs() {
    let payload = this.commonService.filterList();
    payload.query = {
      'batchId': this.urlParam?.id,
    };
    this.commonService.getSTList('bl', payload).subscribe((res: any) => {
      const document = res.documents[0];
      const pdfUrl = document?.pdfUrl;
      if (res && res.documents && res.documents.length > 0 && pdfUrl) {
        const updatedOn = document.updatedOn;
        const updatedBy = document.updatedBy;

        this.pdfUrl = pdfUrl;
        this.documentData = [
          ...this.documentData,
          {
            documentName: pdfUrl,
            documentType: 'BL Document',
            updatedOn: updatedOn,
            updatedBy: updatedBy,
            _id: {
              $oid: ''
            },
            documentId: document?.blId,
            collection: '',
            createdBy: '',
            createdOn: '',
            documentURL: '',
            isOld: false,
            metaData: [],
            orgId: '',
            principal: undefined,
            refType: 'BL',
            s3Bucket: '',
            tags: [],
            tenantId: '',
            userType: '',
            siAttachmentName: '',
            filedAttachmentName: '',  
            finalAttachmentName: '',
            firstPrintAttachmentName: '',
            dgAttachmentName: ''
          }
        ];
      }
      this.getInquiryDoc()
    });
}


  
  combineData(doc) {
    this.documentData = [...doc, ...this.instructionData];
    this.getbldocs();
  }

  backbtn() {
    this.location.back();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onClose() {
    this.router.navigate(['/batch/list']);
  }
   openWareHouseDoucment(key, data, type) {
      const modalRef = this.modalService.open(NewWareHouseDoucmentComponent, {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        centered: true,
        size: 'lg',
      });
      modalRef.componentInstance.getList.subscribe((res: any) => {
        if (res) {
          this.getData();
        }
      });
      modalRef.result.then((data) => {
        this.getData();
      });
      modalRef.componentInstance.refId = this.route.snapshot.params['id'];
      modalRef.componentInstance.component = 'wareHouse';
      modalRef.componentInstance.type = type;
    }



}

