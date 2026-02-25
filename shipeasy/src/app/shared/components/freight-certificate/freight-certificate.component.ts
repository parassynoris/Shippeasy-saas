import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ApiService } from 'src/app/admin/principal/api.service';
import { CommonService } from 'src/app/services/common/common.service';
import * as Constant from 'src/app/shared/common-constants';
import { CommonFunctions } from '../../functions/common.function';
@Component({
  selector: 'app-freight-certificate',
  templateUrl: './freight-certificate.component.html',
  styleUrls: ['./freight-certificate.component.scss']
})
export class FreightCertificateComponent implements OnInit {
  blForm: FormGroup;
  @Input() currencyName:any;
  @Input() refId: any;
  @Input() quotationid: any;
  @Input() charges: any = [];
  constructor(
    public modalService: NgbModal,
    public commonService: CommonService,
    private commonfunction: CommonFunctions,
    public router: Router,
    public route: ActivatedRoute,
    private fb: FormBuilder,
    private _api: ApiService,
    private notification: NzNotificationService
  ) { }

  id: any;
  isAddMode: any;
  idquotation: any;
  blType: any;
  isCertificateCreated = false;
  submittedData: any;
  mblno: any;
  blData: any;
  batchdetalis: any = [];
  loadportname: any;
  pol: any;
  consigneeName: any;
  container: any = [];
  containernum: any;
  hblno: any;
  selectedBuyTotalINR: number = 0;
  selectedBuyTotal: number = 0;
  exChangeRate : number = 0;
  enquiryitems: any = [];
  chargeName: any = [];
  containerNumbers: any

  ngOnInit(): void {

    this.id = this.refId;
    this.idquotation = this.quotationid;
    this.isAddMode = !this.id;
    this.blForm = this.fb.group({
      hblNo: [''],
      mblNo: [''],
      container_no: [''],
      pol: [''],
      destination: [''],
      consignee: [''],
      freight: [''],
      // charge:[''],
      sellTotalINR: [''],
      exChangeRate : [''],
      buyTotalINR: [''],
      igmNo:[''],
      igmDate:[''],
      batchId: this.id,
      orgId: this.commonfunction.getAgentDetails()?.orgId
    });
    // this.getblData();
    this.setBlNumber();
    this.getBatches();
    this.getcontainer();
    this.getfreight();
    this.getIgmCfs();
  }
  basecontentUrl: string;
  Documentpdf:any
  DownloadCertificate(id,isView?) {
    let reportpayload = { "parameters": { "batchId": this.id , 'freightcertificateId':id } };
    let url = 'freightcertificate';
  
    this.commonService.pushreports(reportpayload, url).subscribe({
      next: (res: any) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        const temp = URL.createObjectURL(blob);
  
        if (isView) {
          const pdfWindow = window.open(temp);
          // pdfWindow.print();
        }else{
          const link = document.createElement('a');
          link.href = temp;
          link.download = `Freight Certificate-${this.batchdetalis?.batchNo}.pdf`; 
          link.click();
        }
  
        URL.revokeObjectURL(temp);
      }
    });
  }

  shareViaWhatsapp(id, isDownload?, isShareViaWhatsApp?) {
    let reportpayload;
    let url;

    reportpayload = { parameters: { freightcertificateId: id, "batchId": this.id } };
    url = 'freightcertificate';

    const freightCerti = this.freightCertificateDetails?.find((i) => i?.freightcertificateId == id);

    this.commonService.pushreportsWhatsapp(reportpayload, url).subscribe({
      next: (res: any) => {
        if (isShareViaWhatsApp) {
          // Construct the message as a raw string with newlines
          const rawMessage = `✅ Freight Certificate ✅\n\n
Dear Valued Customer,\n
Please find attached house delivery order for the shipment with the below-mentioned details herewith.\n
Kindly do the needful and confirm safe receipt of the same.\n\n
Job #: ${this.batchdetalis?.batchNo || '-'}\n
MBL #: ${freightCerti?.mblNo || '-'}\n
HBL #: ${freightCerti?.hblNo || '-'}\n
Consignee #: ${freightCerti?.consignee || '-'}\n
Agreed Freight (USD) #: ${freightCerti?.sellTotalINR?.toFixed(0) || '-'}\n
IGM No#: ${freightCerti?.igmNo || '-'}\n
IGM Date#: ${new Date(freightCerti?.igmDate).toDateString() || '-'}\n
PoL: ${freightCerti?.pol || '-'}\n
Destination: ${freightCerti?.destination || '-'}\n
Link to Download: ${res?.downloadUrl || '-'}\n\n
Thank you`;

          // Encode the message for use in a URL
          const encodedMessage = encodeURIComponent(rawMessage);

          // Determine platform and construct the WhatsApp URL
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
          const whatsappUrl = isMobile
            ? `https://wa.me/?text=${encodedMessage}`
            : `https://web.whatsapp.com/send?text=${encodedMessage}`;

          window.open(whatsappUrl, '_blank');
        } else {
          const pdfWindow = window.open(res?.downloadUrl);
        }
      },
      error: (err) => {
        console.error('Error sharing the document:', err);
        alert('Unable to share the document via WhatsApp.');
      },
    });
  }
  

  CreateCertificate() {
    if(this.flagForCreateCertificate){
    if (this.blForm.valid  ) {
      const formData = this.blForm.value;
  
      if (formData && Object.keys(formData).length > 0) { 
      
        const payload = {
          ...formData,
          batchId : this.id,
          chargesName: this.charges.find(f => f?.chargesId === this.blForm.value?.freight)?.chargesName ?? ''
        }
        if(this.isCertificateCreated){ 
          this.commonService.UpdateToST(`freightcertificate/${this.certificateData?.freightcertificateId}`, {...payload,freightcertificateId : this.certificateData?.freightcertificateId}).subscribe(
            response => {
              this.notification.create('success', 'Freight Certificate Update successfully', '');
              this.isCertificateCreated = false;
              this.submittedData = formData;
    
              // Add a delay for DownloadCertificate
              // setTimeout(() => {
              //   this.DownloadCertificate();
              // }, 2000); // 2000 ms = 2 seconds delay
              this.editFreightCertiId=null;
                 this.getfreight();
            },
            error => {
              this.notification.create('error', 'Error submitting data:', '');
            }
          );
        }else{
          this.commonService.addToST('freightcertificate', payload).subscribe(
            response => {
              this.notification.create('success', 'Freight Certificate Create successfully', '');
              this.isCertificateCreated = false;
              this.submittedData = formData;
              this.freightCertificateDetails = [{...response}, ...this.freightCertificateDetails];
              // Add a delay for DownloadCertificate
              // setTimeout(() => {
              //   this.DownloadCertificate();
              // }, 2000); // 2000 ms = 2 seconds delay
                 this.getfreight();
            },
            error => {
              this.notification.create('error', 'Error submitting data:', '');
            }
          );
        }
      
      } else {
        console.error('Form data is empty or invalid');
      }
    } else {
      console.error('Form is invalid or certificate already created');
    }}else{
      this.notification.create('error', 'No BLs available to create Freight Certificate', '');
    }
  }
  

  isFormDataValid(): boolean {
    const formData = this.blForm.value;
    return this.blForm.valid && Object.keys(formData).length > 0;
  }

  onClose() {
    this.isCertificateCreated = false;
    this.modalService.dismissAll();
  }

  selectedCharge:any; 
  sellTotal:number = 0;
  sellIgst :number = 0;
  onChargeSelect(chargesId: string): void {

    const selectedCharge = this.charges.find(charge => charge.chargesId === chargesId);
    this.selectedCharge = selectedCharge; 
    console.log(selectedCharge)
    if (selectedCharge) {
  
      let payload = {
        "fromCurrency": selectedCharge?.currencySellName || this.currencyName,
        "toCurrency": 'USD',
      }

      this.commonService.getExchangeRate('exchangeRate', payload).subscribe((result) => {
 
        // control.buyExRate.setValue(result['USD'].toFixed(3))
       
          this.selectedBuyTotalINR = selectedCharge.buyRate;
          this.selectedBuyTotal = selectedCharge.sellRate;
          this.exChangeRate = selectedCharge.sellExRate;
          this.sellTotal = selectedCharge.sellTotal;
          this.sellIgst = selectedCharge.sellIgst;
          
          this.blForm.get('buyTotalINR')?.setValue((result['USD'] * this.selectedBuyTotalINR).toFixed(3));
          this.blForm.get('sellTotalINR')?.setValue((result['USD'] * this.selectedBuyTotal).toFixed(3));
          this.blForm.get('exChangeRate')?.setValue(result['USD'].toFixed(3));
       
      
      })
    }


   
 
  }
  calculateTotal(e){ 
      this.blForm.get('sellTotalINR')?.setValue(((Number(this.sellTotal) * e.target.value) + Number(this.sellIgst)).toFixed(2)); 
  }
  get isDownloadVisible(): boolean {
    return this.isCertificateCreated;
  }
flagForCreateCertificate:boolean=false;
  getblData(status:boolean=false) {
    let payload = this.commonService.filterList();
    if (payload?.query) {
      payload.query = {
        "batchId": this.id
      };
    }

    this._api.getSTList(Constant.BL_LIST, payload)?.subscribe((data: any) => {
      this.blData = data.documents || []; // Assign documents array to blData
      if (!status) {
      const existingHblNos = (this.freightCertificateDetails || []).map(
        (item: any) => item.hblNo
      );
      this.blData = this.blData.filter((blItem: any) => {
        const cert = this.freightCertificateDetails.find(
          (f) => f.freightcertificateId === this.editFreightCertiId
        );
        if (cert && cert.hblNo === blItem.blNumber) {
          return true;
        }
        return !existingHblNos.includes(blItem.blNumber);
      });
    }
      // Initialize default values for hblno and mblno
      this.hblno = '';
      this.mblno = '';

      this.blData?.forEach((blItem: any) => {
        if (blItem.blType === 'HBL') {
          this.hblno = blItem.blNumber;
          console.log('HBL No:', this.hblno); // Log HBL number
        } else if (blItem.blType === 'MBL') {
          this.mblno = blItem.blNumber;
          console.log('MBL No:', this.mblno); // Log MBL number
        }
      });
if (this.blData.length == 0) {
  this.notification.create('warning', 'All BLs are already used in Freight Certificate', '');
  this.flagForCreateCertificate = false;
  this.blForm.reset({
    hblNo: '',
    mblNo: '',
    container_no: '',
    pol: '',
    destination: '',
    consignee: '',
    freight: '',
    sellTotalINR: '',
    exChangeRate: '',
    buyTotalINR: '',
    igmNo: '',
    igmDate: '',
    batchId: this.id, 
    orgId: this.commonfunction.getAgentDetails()?.orgId
  });
}

 else{if(!this.editFreightCertiId){this.setBlNumber();};
  this.flagForCreateCertificate=true;
 }
    });
  }

  igmCfsData :any = [];
  getIgmCfs() {
    let payload = this.commonService.filterList();
    if (payload?.query) {
      payload.query = {
        "batchId": this.id
      };
    }

    this._api.getSTList('igmcfs', payload)?.subscribe((data: any) => {
      this.igmCfsData = data.documents || []; // Assign documents array to blData
      const igmInfo = this.igmCfsData?.find((i) => i?.type === 'Addigm');
      if(igmInfo){
        this.blForm.get('igmNo').setValue(igmInfo?.igmNo || '');
        this.blForm.get('igmDate').setValue(igmInfo?.igmDate || '');
      }
    });
  }

  onBLSelect($event){
    this.blForm.get('container_no').setValue(this.blData?.find((i) => i?.blNumber == $event)?.containers?.map((i) => {return i?.containerNumber})?.join(','));
    this.blForm.get('consignee').setValue(this.blData?.find((i) => i?.blNumber == $event)?.consigneeName);
    
  }

  getBatches() {
    let payload = this.commonService.filterList();
    if (payload?.query) {
      payload.query = {
        batchId: this.id,
      };
    }

    this.commonService.getSTList('batch', payload)?.subscribe((result) => {
      this.batchdetalis = result?.documents[0];
      this.loadportname = this.batchdetalis.enquiryDetails.routeDetails.loadPortName;
      this.pol = this.batchdetalis.enquiryDetails.routeDetails.destPortName;
      this.consigneeName = this.batchdetalis.enquiryDetails.basicDetails.consigneeName;

      console.log(this.pol, this.consigneeName, this.loadportname, "Batch details loaded");

      // Now call setBlNumber after batch details are set
      this.setBlNumber();
    });
  }

  getcontainer() {
    let payload = this.commonService.filterList();
    if (payload?.query) {
      payload.query = {
        batchId: this.id,
      };
    }

    this.commonService.getSTList('container', payload)?.subscribe((result) => {
      this.containerNumbers = ''; // Assuming you have declared this.containerNumbers in your class
      if (result?.documents && Array.isArray(result.documents)) {
        // Create an array to hold container numbers temporarily
        const tempContainerNumbers: string[] = [];

        // Iterate through each document to extract container numbers
        result.documents.forEach(container => {
          if (container.containerNumber) {
            tempContainerNumbers.push(container.containerNumber); // Push to the temporary array
            console.log(container.containerNumber, "Container number loaded");
          }
        });

        // Join the array into a string, separated by commas
        this.containerNumbers = tempContainerNumbers.join(', ');
        console.log("All Container Numbers:", this.containerNumbers);

        // Now call setBlNumber after container data is set
        this.setBlNumber();
      }
    });


  }
  certificateData:any;
  freightCertificateDetails:any[] = [];
  getfreight() {
    this.certificateData=null
    let payload = this.commonService.filterList();
  
    // Set the batchId in the query if it exists
    if (payload?.query) {
      payload.query = {
        batchId: this.id,
      };
    }
  
    this.commonService.getSTList('freightcertificate', payload)?.subscribe((result) => {
      if (result?.documents?.length) {
        // Assuming you want to patch the first document found
        // const certificateData = result.documents[0];
        // this.certificateData = result.documents[0];
        this.freightCertificateDetails = result.documents;
        // Patch the form with the retrieved certificate data
        // this.blForm.patchValue({
        //   hblNo: certificateData.hblNo || '',
        //   mblNo: certificateData.mblNo || '',
        //   container_no: certificateData.container_no || '',
        //   pol: certificateData.pol || '',
        //   destination: certificateData.destination || '',
        //   consignee: certificateData.consignee || '',
        //   freight: certificateData.freight || '',
        //   sellTotalINR: certificateData.sellTotalINR || '',
        //   exChangeRate : certificateData?.exChangeRate || '',
        //   buyTotalINR: certificateData.buyTotalINR || '',
        //   igmNo: certificateData.igmNo || '',
        //   igmDate: certificateData.igmDate || '',
        //   batchId: this.id, // Keep the batchId
        //   orgId: this.commonfunction.getAgentDetails()?.orgId // Keep the orgId
        // });
  
        // if (result?.documents?.length) 
        // this.isCertificateCreated = true;
        // this.blForm.disable(); // Disable the form
      } else {
        console.log('No existing certificates found for batchId:', this.id);
      }
         this.getblData();
    }, error => {
      console.error('Error fetching freight data:', error);
    });
  }
  

  setBlNumber(): void {
    if (this.blData && this.blData.length > 0 && this.blData[0].blNumber && this.batchdetalis && this.container) {
      this.blForm.patchValue({
        mblNo: this.mblno,
        hblNo: this.hblno,
        container_no: this.blData?.find((i) => i?.blNumber == this.hblno)?.containers?.map((i) => {return i?.containerNumber})?.join(','),
        pol: this.loadportname,
        destination: this.pol,
        consignee: this.consigneeName,
      });
    } else {
      console.log('Data not available for setting BL numbers.');
    }
  }

  DeleteFreightCerti(id){

  }

  getDOReport(id,flga){

  }
editFreightCertiId:any;
  editFreightCerti(id) {
    this.editFreightCertiId=id;
    // this.getblData(false);
   this.getfreight();
    const certificateData = this.freightCertificateDetails.find((i) => i?.freightcertificateId === id);
    this.certificateData = certificateData;
    this.isCertificateCreated = true;
    // Patch the form with the retrieved certificate data
    this.blForm.patchValue({
      hblNo: certificateData.hblNo || '',
      mblNo: certificateData.mblNo || '',
      container_no: certificateData.container_no || '',
      pol: certificateData.pol || '',
      destination: certificateData.destination || '',
      consignee: certificateData.consignee || '',
      freight: certificateData.freight || '',
      sellTotalINR: certificateData.sellTotalINR || '',
      exChangeRate: certificateData?.exChangeRate || '',
      buyTotalINR: certificateData.buyTotalINR || '',
      igmNo: certificateData.igmNo || '',
      igmDate: certificateData.igmDate || '',
      batchId: this.id, // Keep the batchId
      orgId: this.commonfunction.getAgentDetails()?.orgId // Keep the orgId
    });

  }

}
