import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { CognitoService } from 'src/app/services/cognito.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/services/common/common.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonFunctions } from 'src/app/shared/functions/common.function';

@Component({
  selector: 'app-custom-agent-advise',
  templateUrl: './custom-agent-advise.component.html',
  styleUrls: ['./custom-agent-advise.component.scss']
})
export class CustomAgentAdviseComponent implements OnInit {
  quotationform: FormGroup  ;
  loadTypeList: any = []
  shipmentTypes: any = []
  locationData: any = []
  extension: any;
  filename: any;
  constructor(private _api: CommonService, private _modal: NgbModal, public _cognito: CognitoService, public commonFunction: CommonFunctions,
    private route: ActivatedRoute, private router: Router, private fb: FormBuilder, public notification: NzNotificationService, private modalService: NgbModal,)
     {
      this.quotationform = this.fb.group({
        from: ['', Validators.required] ,
        to: ['', Validators.required] ,
        shipmentType: new FormControl('', Validators.required),
        })
      }

  ngOnInit(): void {
    this.getSystemTypeDropDowns()
  }

  setValueOrigin(event){ 
    if (event.key === 'Enter') { 
      if (this.locationData.length > 0) { 
        const selectedItem = this.locationData[0];
        this.quotationform.controls['from'].setValue(selectedItem); 
      }
    }
  }
  setValueDesti(event){ 
    if (event.key === 'Enter') { 
      if (this.locationData.length > 0) { 
        const selectedItem = this.locationData[0];
        this.quotationform.controls['to'].setValue(selectedItem); 
      }
    }
  }
  onLocationSearch(e) {
    // this._api.getLocationList(1000,'',e,'').subscribe((res:any)=>{
    //   this.locationlist.next(res.items)

    //   this.locationlist.subscribe((data)=>{
    //     this.locationData = data
    //   })
    //  })

    let payload = this._api.filterList()
    const shipmentType = this.shipmentTypes.find(x => x.systemtypeId === this.quotationform.value.shipmentType)?.typeName;
    // if (payload) payload.query = {
    //   status: true,
    //   "portDetails.portName": {
    //     "$regex": e,
    //     "$options": "i"
    //   }
    // }
    if (shipmentType.toLowerCase() == 'air') {
      payload.query = {
        ...payload.query,
        status: true,
        "airPortname": {
          "$regex": e,
          "$options": "i"
        },
      }
      this._api.getSTList("airportmaster", payload)?.subscribe((res: any) => {
        this.locationData = res?.documents?.map(x => ({
          portId: x.airportmasterId,
          portName: x.airPortname
        }));
      });
    } else {
      payload.query = {
        ...payload.query,
        status: true,
        "portDetails.portName": {
          "$regex": e,
          "$options": "i"
        },
        "$and": [
          {
            "portDetails.portTypeName": {
              "$ne": "Air"
            }
          }
        ]
      }
      this._api.getSTList("port", payload)?.subscribe((res: any) => { 
          this.locationData = res?.documents?.map(x => ({
            portId: x.portId,
            portName: x.portDetails.portName
          })); 
        
      });

     
    }

  }
  getSystemTypeDropDowns() {
    let payload = this._api.filterList()

    if (payload?.query) payload.query = {
      status: true,
      "typeCategory": {
        "$in": [
          "containerType", "customClearance", "carrierType", "wagonType", "truckType", "shipmentType", "ULDcontainerType"
        ]
      }
    }

    this._api.getSTList("systemtype", payload)?.subscribe((res: any) => {
      this.shipmentTypes = res?.documents?.filter(x => x.typeCategory === "carrierType" && (x?.typeName?.toLowerCase() === "ocean" || x?.typeName?.toLowerCase() === "air"));
      this.loadTypeList = res?.documents?.filter(x => x.typeCategory === "shipmentType");

    });
  }
  setselect(e) {
    this.locationData = [];
    this.quotationform.get("from").setValue('');
    this.quotationform.get("to").setValue('');
  }
  onSwap(fromOption, from, toOption, to) {
    this.quotationform.get("from").setValue(to);
    this.quotationform.get("to").setValue(from);
  }
  saveAgentAdvise() {
    this.quotationform.markAllAsTouched();
    if (this.quotationform.invalid) {
      this.notification.create(
        'error',
        `Please fill form`,
        ''
      );
      return false
    } else if (!this.filename) {
      this.notification.create(
        'error',
        `Please Upload Document`,
        ''
      );
      return false
    }
    if (this.quotationform.valid) {


      let newAgentAdvice = {

        tenantId: this.commonFunction.getAgentDetails().orgId,
        orgId: this.commonFunction.getAgentDetails().orgId,
        customerId: this.commonFunction.getAgentDetails().customerId || '',
        userId: this.commonFunction.getAgentDetails().userId || '',
        agentadviceId: "",
        agentadviceNo: '',
        agentAdviceDate: new Date(),
        document: this.filename.name || '',
        isExport: false,
        isImport: true,
        agentAdviceType: "Import",
        basicDetails: {
          ShipmentTypeId: this.quotationform?.value?.shipmentType,
          ShipmentTypeName: this.shipmentTypes.find(x => x.systemtypeId === this.quotationform.value.shipmentType)?.typeName,
          enquiryTypeName : "Import",
          shipperId: this.commonFunction.getAgentDetails().customerId,
          shipperName: this.commonFunction.getCustomerDetails()?.name,
          shipperAddress: this.commonFunction.getCustomerDetails()?.addressInfo?.address,
          consigneeId: '',
          consigneeName: '',
          consigneeAddress: '',


        },
        productDetails: {
        },
        // cargoDetail: this.commodityArray || [],
        routeDetails: {

          loadPortId: this.quotationform.value?.from?.portId,
          loadPortName: this.quotationform.value?.from?.portName,
          destPortId: this.quotationform.value?.to?.portId,
          destPortName: this.quotationform.value?.to?.portName,

        },

        servicesProvided: {
        },


        containersDetails: [],
        // invoicesDetails: this.addInvoiceValue(),

        remarks: '',
        detentionDetails: {
        },

        carrierBookingStatus: 'Pending',
        agentAdviseStatus: 'Inquiry Received',
        enquiryStatus: 'Inquiry Received',
        enquiryStatusCustomer: 'Requested',
        status: true

      };


      this._api.addToST('agentadvice', newAgentAdvice)?.subscribe((res: any) => {
        if (res) {
          let payloadDoc = { 
            "documentName": this.filename.name,
            "documentType": "XML Document",
            "tags": [],
            "Doc": this.filename.name,
            "remarks": "test",
            "documentURL": this.filename.name,
            "refType": "",
            "tenantId": "1",
            "documentId": "",
            "documentStatusId": "",
            "refId": res?.agentadviceId,
            "isActive": true,
            "orgId": res?.orgId,
            "addressId": "",
            "documentStatus": true,
            "isEmailDocument": true
      
          }
          this._api.addToST('document', payloadDoc).subscribe(
            (res) => { },
            (error) => {
              this.notification.create('error',error?.error?.error?.message, '');
            }
          );
          this.notification.create('success', 'Created Successfully...!', '');
          this.router.navigate(['/customer/quotation/Import/list']);
        }
      })

    }
  }
  setFileName(event: any) {
    let filename = event.target.value.replace('C:\\fakepath\\', '');
    this.extension = filename.substr(filename.lastIndexOf('.'));
    if (this.extension.toLowerCase() === '.xml' ) {
      this.filename = event.target.files[0];
      const formData = new FormData();
      formData.append('file', this.filename, `${this.filename.name}`);
      formData.append('name', `${this.filename.name}`);
      this._api.uploadDocuments('uploadfile', formData)?.subscribe(); 
    } else {
      this.notification.create('error', 'Allowed only XML files..!', '');
    }
  }
  @ViewChild('fileInput') fileinput: any;
  openFile() {
    this.fileinput.nativeElement.click();
  }
  closePopup() {
    this.modalService.dismissAll();
  }
}
