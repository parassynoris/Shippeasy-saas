
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { environment } from 'src/environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DocumentUploadComponent } from './document-upload/document-upload.component';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CognitoService } from 'src/app/services/cognito.service';
import { CommonService } from 'src/app/services/common/common.service';
@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss']
})
export class DocumentsComponent implements OnInit {
  @Output() setDocumentName = new EventEmitter<any>();
  @Input('bookingData') bookingData: any;
  // @Input('bookingRowData')bookingRowData: any;
  documentForm = new FormGroup({
    uploadDoc: new FormControl()
  })
  documentData: any = [];
  otherDocuments: any = [];
  submittedDocs: any = [];
  recievedDocs: any = [];
  carbonOffsetCertificate: any = [];
  constructor(private _api: CommonService, private _modal: NgbModal, private _cognito: CognitoService, private route: Router, private router: ActivatedRoute,) {

  } 

  ngOnInit(): void {
    this.getDocument(); 
  }

  getDocument() {
    this.otherDocuments = []
    this.submittedDocs = []
    this.recievedDocs = []
    this.carbonOffsetCertificate = []
    let payload = this._api.filterList()
    if(payload?.query)payload.query = {
      refId: this.router.snapshot.params['id']
    },

      this._api.getSTList('document', payload)?.subscribe((res: any) => {
        this.documentData = res.documents;
        this.documentData.filter((x) => {
          // if (x?.documentType == '') {
          //   this.submittedDocs.push(x)
          // } else if (x?.documentType == '') {
          //   this.recievedDocs.push(x)
          // } else
           if (x?.documentType == 'Carbon Offset Certificate') {
            this.carbonOffsetCertificate.push(x)
          } else if (x?.documentType == 'Other Document') {
            this.otherDocuments.push(x)
          } else {
            this.otherDocuments.push(x)
          }
        })
      });
  }
  downloadFile(doc) {
    this._api.downloadDocuments('downloadfile', doc.documentName).subscribe(
      (fileData: Blob) => {
        if (fileData) {
          this._api.downloadDocumentsFile(fileData, doc.documentName);
        } else {
          console.error('No file data received');
        }
      },
      (error) => {
        console.error('File download error', error);
      }
    );
  }
  // documentPreview(doc) {
  //   this._api.downloadDocuments('downloadfile', doc.documentName).subscribe(
  //     (res: Blob) => {
  //       const fileType = doc.documentName.split('.').pop().toLowerCase(); // Get file extension
  //       const blob = new Blob([res], { type: `application/${fileType}` }); // Set blob type based on file extension
  //       const temp = URL.createObjectURL(blob);
        
  //       if (fileType === 'pdf') {
  //         const pdfWindow = window.open(temp);
  //         pdfWindow.print();
  //       } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(fileType)) {
  //         // Handle image preview
  //         const img = document.createElement('img');
  //         img.src = temp;
  //         const imgWindow = window.open('');
  //         imgWindow.document.write('<html><body style="margin:0; text-align:center;"></body></html>');
  //         imgWindow.document.body.appendChild(img);
  //       } else {
  //         // Download other file types
  //         const link = document.createElement('a');
  //         link.href = temp;
  //         link.setAttribute('download', doc.documentName);
  //         link.style.display = 'none';
  //         document.body.appendChild(link);
  //         link.click();
  //         document.body.removeChild(link);
  //       }
  //     },
  //     (error) => {
  //       console.error('Document preview error', error);
  //     }
  //   );
  // }

  uploadfile() {
    const modal = this._modal.open(DocumentUploadComponent, { centered: true });
    modal.componentInstance.bookingData = this.bookingData;
    modal.componentInstance.bookingid = this.bookingData.batchId;
    modal.componentInstance.setDocumentName.subscribe((res: any) => {
      if (res) {
        this.getDocument(); 
      //   let file = { id: res.documentId, name: res.documentName, recevied:true,date:new Date(),by:this._cognito.getUser()?.userName };
      //   let bookingpatch = {bookingId:this.bookingData?.id,
      //     bookingDocuments:{...JSON.parse(this.bookingRowData.bookingDocuments),[res.documentType]:file}} 
      //   this._api.updateBooking(bookingpatch).subscribe((r) => {
      //     this.bookingData?.recievedDocs.push({
      //       ...file, type:res.documentType
      //     });
      //     this.setDocumentName.emit(r)
      //   }, error => {
      //     // this.toast.error("Error")
      //   })
      }
    });
  }


  documentPreview(doc) {
    this._api.downloadDocuments('downloadfile', doc.documentName).subscribe(
      (res: Blob) => {
        const fileType = doc.documentName.split('.').pop().toLowerCase(); // Get file extension
        const blob = new Blob([res], { type: `application/${fileType}` }); // Set blob type based on file extension
        const temp = URL.createObjectURL(blob);
        
        if (fileType === 'pdf') {
          const pdfWindow = window.open(temp);
          pdfWindow.print();
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
          link.setAttribute('download', doc.documentName);
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
}
