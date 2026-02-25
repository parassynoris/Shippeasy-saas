import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ApiService } from 'src/app/admin/principal/api.service';
import { CommonService } from 'src/app/services/common/common.service';
import { SharedEventService } from '../../services/shared-event.service';

@Component({
  selector: 'app-milestone',
  templateUrl: './milestone.component.html',
  styleUrls: ['./milestone.component.scss']
})
export class MilestoneComponent implements OnInit {
  @Input() batchId = '';
  @Input() type = '';
  @Output() batchStatusUpdate: EventEmitter<any> = new EventEmitter();
  @Output() closeModal1 : EventEmitter<any> = new EventEmitter();
  public touchUi = false;
	public enableMeridian = true;
	public color = 'primary';
  events = []
  activityStep: Number = 0;
  isExport: boolean;
  fileTypeNotMatched: boolean;
  doc: File;
  docForm: FormGroup;
  D = new Date();
  currentDate: any =
  this.D.getDate() + '/' + this.D.getMonth() + '/' + this.D.getFullYear();
  base64Output: any;
  extension:any;
  params: any;
  urlParam: any;
  isImport: boolean;
  constructor(
    private fb: FormBuilder,
    private sharedEventService: SharedEventService,
    private commonService: CommonService,
    private notification: NzNotificationService,
    private route: ActivatedRoute,
    private router: Router,
    private _api: ApiService,
  ) { 
    const getLastChild = (route) => {
      let child = route;
      while (child.firstChild) {
        child = child.firstChild;
      }
      return child;
    };
    const primary = this.route.snapshot.root;
    const lastChild = getLastChild(primary);
    this.isExport = localStorage.getItem('isExport') === 'true' ? true : false
    this.isImport = localStorage.getItem('isImport') === 'true' ? true : false
    this.params = lastChild.params;
    this.route.params.subscribe((params) => (this.urlParam = params));
  }
  currentUrl: string;
  show: boolean = false;

  ngOnInit(): void {
    this.sharedEventService.chargeSaved$.subscribe(() => {
      this.getevents(this.batchId)
    });
    this.getevents(this.batchId)
    this.currentUrl = this.router.url.split('?')[0].split('/')[3]
    if (this.currentUrl === 'show') {
      this.show = true
    }
  }
  formBuild() {
    this.docForm = this.fb.group({
      documentName: ['', Validators.required],
      tags: [[], Validators.required],
      Doc: ['', Validators.required],
      remarks:[''],
      documentURL: [''],
      refType: [''],
      tenantId: ['1'],
      documentStatusId: [''],
      refId: this.params['id'],
      isActive: true,
      orgId: [this.params['id']],
      addressId: [''],
      createdDate: [this.currentDate],
      updatedDate: [''],
      updatedBy: [''],
    });
    this.checkValidation()
  }
  checkValidation(){
    if(this.type === 'buyer'){
      this.docForm.controls['documentType'].clearValidators();
      this.docForm.controls['tags'].clearValidators();

      this.docForm.controls['documentType'].updateValueAndValidity();
      this.docForm.controls['tags'].updateValueAndValidity();
    }
    
  }

  groupedEvents: any;
  eventsFormArray: FormArray;
  defultDate = new Date(0)
  getevents(batchId) {
    this.eventsFormArray = this.fb.array([]);
    let payload: any = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "entityId": batchId
    };
    if(payload?.sort)payload.sort = {
      "asc": ['eventSeq'],
    };
    this.commonService.getSTList('event', payload)?.subscribe((data: any) => {
      this.events = data.documents;
      const groupedEvents = {}; // Declare groupedEvents here

      this.events.forEach(event => {
        const locationTag = event.locationTag;
        this.eventsFormArray.push(this.createEventForm(event));
        if (!groupedEvents[locationTag]) {
          groupedEvents[locationTag] = [];
        }
        groupedEvents[locationTag].push({ ...event, eventData: { ...event?.eventData }, isEdit:false, isUpdated:event?.isUpdated || false });
      });

      this.groupedEvents = { ...groupedEvents }
      // Process or display groupedEvents here
    }); ``
  }

  selectEventState(parentIndex, ChildIndex, value) {
    this.groupedEvents[parentIndex][ChildIndex]['eventData']['eventState'] = value;
    const eventData = this.groupedEvents[parentIndex][ChildIndex]['eventData'];
    eventData['eventState'] = value;
    if (value === 'ActualDate') {
      eventData['bookingDate'] = new Date();
    }
  }
  logInputBlur(name, event, parentIndex, ChildIndex, date=false) {
    this.groupedEvents[parentIndex][ChildIndex]['eventData'][name] = date ? new Date(event.value).toISOString() : event.target.value;
  }

  logCheckBlur(name, value, parentIndex, ChildIndex) {
    this.groupedEvents[parentIndex][ChildIndex]['eventData'][name] = value;
  }

//  async SaveEvent(i, j) {
//     const event = this.groupedEvents[i][j];
//     if(this.doc){
//       const formData = new FormData();
//       formData.append('file',  this.doc ,  `${this.doc.name}`);
//       formData.append('name', `${this.doc.name}`);
     
//       let file = await this.commonService.uploadDocuments('uploadfile',formData).subscribe();
//       if(file){
//         this.commonService.UpdateToST(`event/${event?.eventId}`, {...event,eventData:{...event?.eventData,documentURL:this.doc.name}, isUpdated:true})?.subscribe((res: any) => {
//           if (res) {
//             this.notification.create('success', 'Update Successfully', '');
//             this.groupedEvents[i][j]['eventData']['documentURL'] = this.doc?.name;
//             this.groupedEvents[i][j]['isUpdated'] = true;
//             if(!event.isUpdated){          
//               this.batchStatusUpdate.emit(res?.eventName);
//             }

//           }
//         },
//           (error) => {
//             this.notification.create('error', error?.error?.error?.message, '');
//           }
//         );
//       // let payload = {
//       //   Doc: this.docForm?.value?.Doc,
//       //   documentURL:this.doc.name,
//       //   bat:this.fileUploadCustomId,
//       //   documentStatus:true
//       // }
//       // this.commonService.addToST('document',payload).subscribe(
//       //   (res) => {
//       //     if (res) {
//       //        this.notification.create('success', 'Saved Successfully', '');
//       //        (<HTMLInputElement>document.getElementById('formFileMultiple')).value = '';
//       //        this.doc=null;
//       //       this.fetDocument(this.fileUploadCustomId);
//       //     }
//       //   },
//       //   (error) => {
//       //     this.notification.create('error',error?.error?.error?.message, '');
//       //   }
//       // );
//       }
//     }else{
//       this.commonService.UpdateToST(`event/${event?.eventId}`, {...event, isUpdated:true})?.subscribe((res: any) => {
//         if (res) {
//           this.notification.create('success', 'Update Successfully', '');
//           if(!event.isUpdated){          
//             this.batchStatusUpdate.emit(res?.eventName);
//           }
//           this.groupedEvents[i][j]['isUpdated'] = true;
//         }
//       },
//         (error) => {
//           this.notification.create('error', error?.error?.error?.message, '');
//         }
//       );
//     }
   

//   }

ResetEvent(i: number, j: number){
  const event = this.groupedEvents[i][j];
  this.commonService.bookingConfirm(`reset-event/${event?.eventId}`).subscribe(
    (res: any) => {
      this.getevents(this.batchId)
    })
}
async SaveEvent(i: number, j: number) {
  const event = this.groupedEvents[i][j];
  if (this.doc) {
    const formData = new FormData();
    formData.append('file', this.doc, `${this.doc.name}`);
    formData.append('name', `${this.doc.name}`);

    let file = await this.commonService.uploadDocuments('uploadfile', formData).toPromise();
    if (file) {
      this.commonService.UpdateToST(`event/${event?.eventId}`, {
        ...event,
        eventData: { ...event?.eventData, documentURL: this.doc.name },
        isUpdated: true
      }).subscribe(
        (res: any) => {
          if (res) {
            this.closeModal1.emit()
            this.notification.create('success', 'Update Successfully', '');
            this.groupedEvents[i][j] = {
              ...event,
              eventData: { ...event?.eventData, documentURL: this.doc.name },
              isUpdated: true
            };
            if (!event.isUpdated) {
              // this.batchStatusUpdate.emit(res?.eventName);
            }
          }
        },
        (error) => {
          this.notification.create('error', 'Failed to upload the document.', '');
        }
      );
    }
  } else {
    
    this.commonService.UpdateToST(`event/${event?.eventId}`, { ...event, isUpdated: true, sentNotification:event?.eventData?.sentNotification }).subscribe(
      (res: any) => {
        this.closeModal1.emit()
        if (res) {
          // console.log(res);
          
          this.notification.create('success', 'Update Successfully', '');
          this.groupedEvents[i][j] = { ...res, isUpdated: true };
          if (!event.isUpdated) {
            // this.batchStatusUpdate.emit(res?.eventName);
          }
        }
      },
      (error) => {
        this.notification.create('error', error?.error?.error?.message, '');
      }
    );
  }
}

  getArray() {
    if (this.groupedEvents) {
      return Object?.keys(this.groupedEvents);
    } else {
      return []
    }
  }
  editdetails(parentIndex,ChildIndex) {
    this.groupedEvents[parentIndex][ChildIndex]['isEdit'] = !this.groupedEvents[parentIndex][ChildIndex]['isEdit'];
  }

  createEventForm(event): FormGroup {
    return this.fb.group({
      id: [event.eventId],
      eventState: [null]
      // Add other form controls for event properties
    });
  }

  onFileSelected(event) {
    this.doc = event.target.files[0];
    // let filename = event.target.value.replace('C:\\fakepath\\', '');
    // this.docForm.get('documentName').setValue(filename);
    // this.extension = filename.substr(filename.lastIndexOf('.'));
    // if (

    //   this.extension.toLowerCase() === '.pdf'
    // ) {
    //   this.fileTypeNotMatched = false;
      
    // } else {
    //   this.fileTypeNotMatched = true;
    //   this.base64Output = '';
    //   this.docForm.get('documentURL').setValue('');
    //   this.docForm.get('Doc').setValue('');
    // }
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
  downnloadEdi(ediName,batchId){

    this._api.getEdi(ediName, batchId).subscribe((res: ArrayBuffer) => {
      const blob = new Blob([res], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'shippingInstruction.edi'; 
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      (error) => {
        console.error('Error downloading file:', error);
      }
    );
  }

  closeDialog(){
    this.batchStatusUpdate.emit()
    if(this.type === 'Custom')
    this.closeModal1.emit()
  }
}
