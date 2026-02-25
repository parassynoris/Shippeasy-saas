import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// import { log } from 'console';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-web-form',
  templateUrl: './web-form.component.html',
  styleUrls: ['./web-form.component.css']
})
export class WebFormComponent implements OnInit {

  isExport: boolean;
  enquiryId: any;
  QuotationId:any
  quotationList: any = [];
  basecontentUrl: string;
  currentUrl: string;
  urlParam: any;
  urlParamm : any;
  Documentpdf: any;
  editQuoteDetails: any = [];
  constructor(
    public commonService: CommonService,
    private route: ActivatedRoute,
    private http: HttpClient,
    public notification: NzNotificationService
    
  ) {
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();
    this.route.params?.subscribe(params => {
      this.urlParam = params.id;
    });
    
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();
    this.route.queryParams?.subscribe(params => {
      this.urlParamm = params.data;
    });

    if(this.urlParam){
      this.sendQuotation1();
    }
  }

  ngOnInit(): void {
  }

  showPdf(arrayBuffer: ArrayBuffer): void {
    const binaryData = [];
    binaryData.push(arrayBuffer);
    const pdfUrl = URL.createObjectURL(new Blob(binaryData, { type: 'application/pdf' }));
    document.getElementById('pdfViewer').setAttribute('src', pdfUrl);
  }

  sendQuotation1() {
    this.basecontentUrl = '';
    let reportpayload = { "parameters": { quotationId: this.urlParam } };
    let url = 'quoatation';
    this.commonService.pushPublicReports(reportpayload, url)?.subscribe({
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
      },
      error: (err: any) => {
        this.notification.error('Error downloading the report:', err);
      }
    })
  }


  acceptQuotation(): void {
    console.log("Quotation accepted");
    this.expireLink();
    const obj = this.urlParamm
    const acceptUrl = `https://shipeasy-api-demo.azurewebsites.net/api/quotation/update/${obj}/accept`;
    
    this.http.get(acceptUrl).subscribe(
      (response) => {
        if(response['status'] === "success")
          this.notification.success('Success', response['message']);
        else 
          this.notification.error('Error', response['message']);
      },
      (response) => {
        this.notification.error('Error', response.message);
      }
    );
  }

  rejectQuotation(): void {
    console.log("Quotation rejected");
    this.expireLink();
    const obj = this.urlParamm; 
    const rejectUrl = `https://shipeasy-api-demo.azurewebsites.net/api/quotation/update/${obj}/reject`;
    
    this.http.get(rejectUrl).subscribe(
      (response) => {
        if(response['status'] === "success")
          this.notification.success('Success', response['message']);
        else 
          this.notification.error('Error', response['message']);
      },
      (response) => {
        this.notification.error('Error', response.message);
      }
    );
  }

  expireLink(): void {
    const buttons = document.querySelectorAll('.buttons button');
    buttons.forEach((button: HTMLButtonElement) => {
      button.disabled = true;
    });
  }

}
