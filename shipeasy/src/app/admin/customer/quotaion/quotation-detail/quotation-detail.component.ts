import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';


import { CognitoService } from 'src/app/services/cognito.service';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/services/common/common.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonFunctions } from 'src/app/shared/functions/common.function';

@Component({
  selector: 'app-quotation-detail',
  templateUrl: './quotation-detail.component.html',
  styleUrls: ['./quotation-detail.component.scss'],
})
export class QuotationDetailComponent implements OnInit {
  isTextField: boolean = false;
  labelCondition: string = 'Requotation Accepted';
  enquiryId: number = this.route.snapshot.params['id'];
  quotationStatus: string = 'AWAIT_YOUR_REVIEW';
  submitted: boolean; s
  selectedQuoationCard: string = '1';
  Requotationdetails: FormGroup;
  quotationData: any;
  selectedPrice: any = 'preffered';
  userId: number;
  userData: any;
  linkDownload: any;
  comments: any = [];
  quoteData: any;
  locations: any;
  quoteTypes: any = [];
  alladdress: any;
  allCharges: any = {};
  priceRanges: any = [];
  chargeTypes: any = [];
  typeWiseCount: any = {};
  totalTax: number = 0;
  totalItem: number = 0;
  userActivities: any;
  additionalServices: any = [];
  quoteRemarks: string = '';
  chargeItems: any = [];
  priceToRate: any = {
    preffered: 'itemPrice',
    cheapest: 'itemPrice1',
    fastest: 'itemPrice2',
  };
  findindex: number = 0;
  statuslist: any[] = [];
  operationOptions: any = [];

  commentForm = new FormGroup({
    noteType: new FormControl('', Validators.required),
    noteText: new FormControl('', Validators.required),
  });
  currencyForm = new FormGroup({
    inr: new FormControl(true),
    usd: new FormControl('')
  });
  userOrgData: any;
  isShowGst: boolean = false;
  isGst: boolean = false;
  isIgst: boolean = false;
  showMobilecss: boolean = false;
  check: boolean = false
  discountPrice: any
  isTransport: boolean;
  constructor(
    private modalService: NgbModal,
    public notification: NzNotificationService,
    public commonFunction: CommonFunctions,
    private _router: Router,
    private route: ActivatedRoute,
    public _cognito: CognitoService,
    private _api: CommonService, 
    private formBuilder: FormBuilder,
  ) {
    // this.userId = this._cognito.getOrganization()?.orgId;
    this.Requotationdetails = this.formBuilder.group({
      comments: ['', Validators.required]
    })

    this.customerType = localStorage.getItem('customerType') ??  'Export';
  }

  fieldToSelect: any = 'itemPrice';
  customerType:string=''
  selectQuote = (value: string) => {
    this.selectedPrice = value;
  };
  showCustomerCurr: boolean = false

  ngOnInit(): void {
    this.isTransport = localStorage.getItem('isTransport') === 'false' ? false : true;
    
    this.userData = this.commonFunction?.getAgentDetails() || {} 
    this.enquiryId = this.route.snapshot.params['id'];
    this.route.queryParams?.subscribe(params => {
     if(params?.['customerType'])this.customerType = params?.['customerType'];
    });
    this.getData()
  }
  get f() {
    return this.Requotationdetails.controls
  }
  getData() {
    let payload = this._api?.filterList() 
    if(payload?.query) payload.query = {
      enquiryId: this.enquiryId,
    }
    if(this.customerType==='Import'){
      if(payload?.query) payload.query = {
        agentadviceId: this.enquiryId,
      }
    }
    this._api.getSTList(this.customerType==='Import' ?'agentadvice' :'enquiry', payload)?.subscribe((res: any) => {
      this.operationOptions = [];
      this.userActivities = res.documents[0]; 
      if(this.userActivities?.basicDetails?.ShipmentTypeName?.toLowerCase() === 'land'){
        this.getBidding()
      }
      this.getQuoteDetails();

    });
  }

  closePopup() {
    this.modalService.dismissAll();
  }

  getKeys(): string[] {
    return this.userActivities?.charges ? Object.keys(this.userActivities.charges) : [];
  }
  finalDiscount: any
  activeFrightAir: boolean = false;
  showContainer: boolean = false;
  showPallet: boolean = false;
  typeOfWay: string = '';
  getQuoteDetails() {
 

    let payload = this._api?.filterList() 
    if(payload?.query) payload.query = {
      enquiryId: this.enquiryId,
      status: true,
      "$and": [{ "quoteStatus": { "$ne": 'Draft' } },
      { "quoteStatus": { "$ne": 'Quotation Created' } }
      ]
    }

    
    this._api.getSTList('quotation', payload)?.subscribe( (res :any) => {
        this.priceRanges = []
        this.priceRanges = res?.documents

        this.priceRanges.sort((a, b) => {
          if (a.quoteStatus === "Quotation Rejected" && b.quoteStatus !== "Quotation Rejected") {
            return 1;
          } else if (a.quoteStatus !== "Quotation Rejected" && b.quoteStatus === "Quotation Rejected") {
            return -1;
          } else {
            return 0;
          }
        });
        if (this.userActivities?.enquiryStatusCustomer == 'Accepted') {
          this.priceRanges = this.priceRanges.filter(obj => obj.quoteStatus !== "Quotation Rejected");
        }
        if (res) {
          this.quoteData = {
            ...this.userActivities,
            priceRanges: this.priceRanges
          }
          
          this.selectQuote(this.priceRanges[0]);
          let shipment = this.quoteData?.enquiryDetails?.basicDetails?.ShipmentTypeName?.toLowerCase()
          let loadName = this.quoteData?.enquiryDetails?.basicDetails?.loadType?.toLowerCase()
          if (shipment === 'air') {
            this.activeFrightAir = true;
          }
          if (loadName) {
            if (['loose', 'lcl', 'ltl','ptl'].includes(loadName)) {
              this.showPallet = true;
              this.showContainer = false;
            } else if (['break bulk'].includes(loadName)) {
              this.showPallet = false;
              this.showContainer = false;
            } else {
              this.showPallet = false;
              this.showContainer = true;
              if (['uld container', 'fcl'].includes(loadName)) {
                this.typeOfWay = "Container"
              } else if (['ftl'].includes(loadName)) {
                this.typeOfWay = "Truck"
              } else if (['fwl'].includes(loadName)) {
                this.typeOfWay = "Wagon"
              } else {
                this.typeOfWay = "Container"
              }
            }
          } else {
            this.showPallet = false;
            this.showContainer = false;
          }

          // if (this.quoteData?.quoteItemOption) {
          //   this.selectQuote(this.quoteData?.quoteItemOption);
          // } else if (this.quoteData?.enquiryStatusCustomer === 'Awaiting Review' || this.quoteData?.quoteStatus === 'quote-reject' || this.quoteData?.quoteStatus === 'quote-validityexpired') {
          //   this.selectQuote(this.priceRanges[0]);
          // }

          let payload1 = this._api?.filterList()
          let quoteID = [];
          this.priceRanges.filter((x) => {
            quoteID.push(x?.quotationId)
          })
          if(payload1?.query)  payload1.query = {
            // "quotationId": this.enquiryId
            "quotationId": {
              "$in": quoteID
            }
          }
          this._api.getSTList('enquiryitem', payload1)?.subscribe((result) => {
            this.chargeItems = result?.documents;
          })

          // this.priceRanges=[]; 
          // this.chargeItems = res?.quoteItems; 
          //   this.chargeItems = this.chargeItems.sort(function(a, b){
          //     return a.orderNo - b.orderNo;
          // })


        } else {
          this._router.navigate(['dashboard/quotation'])
        }

      },
      (err) => {
        this._router.navigate(['dashboard/quotation'])
      }
    );
  }



  returnTotal() {
    var total = 0;
    var tax = 0;
    this.chargeItems.filter((i: any) => {
      if (this.selectedPrice?.quotationId == i?.quotationId)
        total += Number(i?.selEstimates?.taxableAmount);
    });
    // total = this.quoteData?.priceRanges[this.selectedPrice]?.totalSell || 0
    return total;

  }

  rturnGst() {
    var tax = 0;
    this.chargeItems.filter((i: any) => {
      if (this.selectedPrice?.quotationId == i?.quotationId)
        tax += Number(i?.selEstimates?.igst);
    });
    return tax;
  }
  biddingList:any;
  getBidding(){
    let payload = this._api.filterList()
    if (payload?.query) payload.query = {
      "adminStatus": "Accepted",
      enquiryId: this.route.snapshot?.params['id'],
    }

    this._api.getSTList('transportinquiry', payload)?.subscribe((data) => {
      this.biddingList = data.documents[0]; 
    });
  }
  isButtonDisabled = false;
  acceptAndCountinue(isRequotation?) {
    this.isButtonDisabled = true;
    let quotationData: any;
    this.priceRanges?.map((item, index) => {
      if (item?.quoteStatus != 'Quotation Rejected') {
        if (item.quotationId == this.selectedPrice.quotationId) {
          quotationData = this.priceRanges[index]
          // this.priceRanges[index].quoteStatus = 'Quotation Accepted'
          this.priceRanges[index].quoteStatus = 'Job Created'
          if (isRequotation) {
            this.priceRanges[index].quoteStatus = 'Requotation Requested';
            this.priceRanges[index].remarks = this.Requotationdetails.value?.comments;
            this.priceRanges[index]['isRequotation'] = true;
          }
        } else {
          this.priceRanges[index].quoteStatus = 'Quotation Rejected',
            this.priceRanges[index].remarks = 'Other quotation accepted'
        }
      }

    })

    this._api.batchUpdate('quotation/batchupdate', this.priceRanges)?.subscribe((res: any) => {
      if (res) {
        let paylaod = {
          "tenantId": this.userData?.tenantId || '1',
          customerId:  this.userData?.customerId || '1',
          orgId:  this.userData?.orgId || '1',
          batchId: '',
          isExport: this.customerType === 'Export',
          amount: quotationData?.totalSell || 0,
          batchDate: new Date(),
          quotationId: quotationData?.quotationId,
          quotationNo: quotationData?.quotationNo,
          enquiryId: quotationData?.enquiryId,
          agentadviceId: quotationData?.agentadviceId,
          branchId: quotationData?.branchId,
          branchName: quotationData?.branchName,
          jobCode: quotationData?.jobCode || '',
          status: true,
          poDate: new Date(),
          statusOfBatch: 'Job Created',
          enquiryDetails: this.userActivities,
          quotationDetails: quotationData,
          transportinquiryId : this.biddingList?.transportinquiryId || '',
          transportinquiryNo : this.biddingList?.transportinquiryNo || '',
          // batchStatus: addBatchForm?.batchStatus, 
          routeDetails: {
            etd: quotationData?.etd,
            eta: quotationData?.eta,
            atd: quotationData?.etd,
            ata: quotationData?.eta,
          }
        };
        if (isRequotation) {
          const apiUrl = this.customerType==='Import' ? 
          `agentadvice/${quotationData.agentadviceId}` : 
          `enquiry/${this.userActivities.enquiryId}`;
          let data = {
            ...this.userActivities,
            enquiryStatus: 'Requotation Requested',
            enquiryStatusCustomer: 'Requotation Requested',
            // estimate: {
            //   ...this.userActivities?.estimate,
            //   finalPrice: this.selectedPrice?.totalSell || 0.00,
            //   currency: quotationData?.currencyShortName
            // }
          }
          this._api.UpdateToST(apiUrl, data)?.subscribe()
          setTimeout(() => {
            this.getData()
          }, 2000);
          this.modalService.dismissAll();
          this.notification.create(
            'success',
            'Re-Quotation Requested',
            ''
          );
        } else {
          this._api.addToST('batch', paylaod)?.subscribe((res: any) => {
            if (res) {
              
              if(this.userActivities?.basicDetails?.ShipmentTypeName?.toLowerCase() === 'land'){
                let tranportPayload = {
                  ...this.biddingList,
                  adminStatus : 'Job Created',
                   carrierStatus : 'Job Created'
                }
                this._api.UpdateToST(`transportinquiry/${tranportPayload?.transportinquiryId}`, tranportPayload)?.subscribe();
              }

              const apiUrl = this.customerType==='Import'
              ? `agentadvice/${quotationData.agentadviceId}` 
              : `enquiry/${this.userActivities.enquiryId}`;
              let data = {
                ...this.userActivities,
                // enquiryStatus: 'Enquiry Accepted',
                // enquiryStatusCustomer : 'Awaiting Review', 
                enquiryStatus: 'Inquiry Accepted',
                enquiryStatusCustomer: 'Accepted',
                batchId: res?.batchId,
                routeDetails :{
                  ...this.userActivities.routeDetails,
                  shippingLineId : quotationData?.carrierId || '',
                  shippingLineName :  quotationData?.carrierName || ''
                },
                estimate: {
                  ...this.userActivities?.estimate,
                  finalPrice: this.selectedPrice?.totalSell || 0.00,
                  currency: quotationData?.currencyShortName
                }
                
              }
              if (isRequotation) {
                data.enquiryStatus = 'Requotation Requested';
                data.enquiryStatusCustomer = 'Requotation Requested';
              }
              this._api.UpdateToST(apiUrl, data)?.subscribe()

              this.notification.create(
                'success',
                'Quotation Accepted and Job Created Successfully',
                ''
              );

              setTimeout(() => {
                this.getData()
              }, 2000);

            }
          })
        }
      }
    });





  }
  Requotationssubmit() {
    this.submitted = true;
    if (this.Requotationdetails.invalid) {
      return;
    }

    this.acceptAndCountinue(true)
  }
  onQuotePrice() {
    // this._router.navigate([
    //   'dashboard/quotation/' + this.quoteData.quoteId + '/quote-pricing',
    // ]);
  }




  setQuoteRemarks(event) {
    this.quoteRemarks = event?.target?.value;
  }

  submitRemarks() {
    let payload = this.priceRanges?.map((re => {
      return {
        quotationId: re?.quotationId,
        quoteStatus: 'Quotation Rejected',
        remarks: this.quoteRemarks
      }
    }))
    this._api.batchUpdate('quotation/batchupdate', payload)?.subscribe((res: any) => {
      if (res) {
        let url = "enquiry/" + this.userActivities.enquiryId;
        let data = {
          reason: this.quoteRemarks,
          enquiryStatus: 'Inquiry Rejected',
          enquiryStatusCustomer: 'Rejected',
        }
        this._api.UpdateToST(url, data)?.subscribe()
        this.notification.create(
          'success',
          'Quotation Rejected',
          ''
        );
        this.getData()
      }
    });

  }



  downloadPdf() {
    let data: any = document.getElementById('downloadBody');
    let style: any = data.style;
    data.style.background = 'transparent';
    html2canvas(data, {
      scale: 5
    }).then((canvas) => {
      const FILEURI = canvas.toDataURL('image/png');
      let PDF = new jsPDF('p', 'mm', 'a4');
      const imgProps = PDF.getImageProperties(FILEURI);
      let fileWidth = PDF.internal.pageSize.getWidth();
      let fileHeight = (imgProps.height * fileWidth) / imgProps.width;

      PDF.addImage(FILEURI, 'PNG', 0, 0, fileWidth, fileHeight, '', 'FAST');
      PDF.save('priceOption.pdf');
    });
    data.style = style;

  }

  onDownLoadDoc(id) {
    // this.apiService
    //   .getDownLoadLink(id);
  }





  goToBooking() {
    if (this.userActivities?.batchId) {
      this._router.navigate(['/customer/booking/list/' + this.userActivities?.batchId]);
    } else {
      this._router.navigate(['/customer/booking/list']);
    }
  }
  downloadDoc(data, content1) {

    let reportpayload = { "parameters": { quotationId: data.quotationId } };
    let url = 'quoatation';
    this._api.pushreports(reportpayload, url)?.subscribe({
      next: (res: any) => {

        this.modalService.open(content1, {
          backdrop: 'static',
          keyboard: false,
          centered: true,
          size: 'lg',
          ariaLabelledBy: 'modal-basic-title'
        })

        const blob = new Blob([res], { type: 'application/pdf' });
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result as string;
        };
        reader.readAsDataURL(blob)

        const fileReader = new FileReader();
        fileReader.onload = () => {
          this.showPdf(fileReader.result as ArrayBuffer);
        };
        fileReader.readAsArrayBuffer(res);
      }
    })
  }
  showPdf(arrayBuffer: ArrayBuffer): void {
    const binaryData = [];
    binaryData.push(arrayBuffer);
    const pdfUrl = URL.createObjectURL(new Blob(binaryData, { type: 'application/pdf' }));
    //  this.mailAttachment = pdfUrl
    document.getElementById('pdfViewer').setAttribute('src', pdfUrl);




  }
  Requotation(Requotations) {
    this.modalService.open(Requotations, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    })
  }


}
